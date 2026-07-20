/**
 * svg/renderer.ts — Fontuccine Tier 2 (SVG path remap) renderer.
 *
 * RESEARCH §3: the no-WebGL / vector-fidelity fallback. Exact vectors, best
 * possible fidelity, headline-scale only (SVG `d` mutation paints every frame —
 * C-tier). Consumes the SAME per-glyph flex profiles as every other tier and
 * the SAME shared ticker + StretchController as the interaction layer.
 *
 * Discipline enforced here (CLAUDE.md rules 4, 6, 7):
 *  - ONE `<path>` per glyph, created once; per frame only its `d` is rewritten.
 *  - Writes happen ONLY in the ticker RENDER phase (`draw`). DOM measurement
 *    happens ONLY in the READ phase (`readPhase` → overlay.measure), cached and
 *    invalidated via ResizeObserver + scroll. No layout reads in `draw`.
 *  - Static per glyph: outline splitting (`splitGlyph`) runs once at build.
 *  - Reduced motion / print: draw ONCE at the resting stretch and register NO
 *    per-frame callback (no animation, zero ongoing engine work).
 *  - `contain: layout paint` + `isolation: isolate` on the host (via the shared
 *    overlay) keep per-frame paints scoped.
 *
 * Scale without a per-frame read: the <svg> carries a fixed font-unit `viewBox`
 * and its width/height are expressed in `em`, so it tracks the host font-size
 * through CSS alone — no getComputedStyle in the hot path.
 *
 * Tier interface (attach/resize/draw/destroy) mirrors the GPU renderer's so the
 * engine can swap tiers behind one shape. Final unification is the architect's
 * call (CLAUDE.md rule: cross-module contracts go through the architect).
 */
import type { PathCommand, Bounds1D, BBox } from '../core/types';
import type { LayoutGlyph } from '../core/kerning';
import { layoutRun } from '../core/kerning';
import type { Ticker } from '../interaction/ticker';
import { ticker as sharedTicker } from '../interaction/ticker';
import { prefersReducedMotion } from '../interaction/reduced-motion';
import type { SplitContour } from './split';
import { splitGlyph, serializeGlyph } from './split';
import { createOverlay } from '../dom/overlay';
import type { Overlay, WrapMode } from '../dom/overlay';

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_BUDGET = 64;

/** Minimal shape the renderer reads from a StretchController. */
export interface StretchSource {
  readonly value: number;
}

/** One glyph's static render inputs (outline + its analysis). */
export interface SvgGlyph {
  /** Character (diagnostics only). */
  char?: string;
  /** Outline commands in font units (SVG-down), e.g. opentype getPath(0,0,upm). */
  commands: PathCommand[];
  /** Static flex profile for the x axis (length === slice count). */
  flex: Float32Array;
  /** Ink bounds along x (must match the profile the flex was computed for). */
  bounds: Bounds1D;
  /** Advance width in font units. */
  advanceWidth: number;
  /** Glyph bbox in font units (for the vertical extent of the viewBox). */
  bbox: BBox;
  /** Kerning applied before this glyph (font units, 0 for the first). */
  kernBefore?: number;
}

export interface SvgRendererOptions {
  host: HTMLElement;
  glyphs: SvgGlyph[];
  /** Per-frame stretch source (a StretchController or anything with `.value`). */
  controller: StretchSource;
  /** Source text (defaults to host.textContent). */
  text?: string;
  wrap?: WrapMode;
  maxStretchRatio?: number;
  /** Resting stretch used for the static reduced-motion draw. Default 1. */
  restingStretch?: number;
  /** Font units per em used by `commands` (opentype getPath size). Default 1000. */
  unitsPerEm?: number;
  /** `d` coordinate precision. Default 2. */
  precision?: number;
  /** Glyphs above this warn (headline budget). Default 64. */
  glyphBudget?: number;
  ticker?: Ticker;
  document?: Document;
  respectReducedMotion?: boolean;
  /** Override reduced-motion detection (tests). */
  isReducedMotion?: () => boolean;
}

export interface SvgRenderer {
  /** Build subscriptions and paint. Idempotent. */
  attach(): void;
  /** Invalidate cached measurements (re-measured next READ phase). */
  resize(): void;
  /** One-shot render (write phase). Also the subscribed RENDER callback. */
  draw(now?: number): void;
  /** Tear down subscriptions, observers, nodes; restore original text. */
  destroy(): void;
  readonly element: SVGSVGElement;
  readonly overlay: Overlay;
}

interface PreparedGlyph {
  path: SVGPathElement;
  contours: SplitContour[];
  layout: LayoutGlyph;
}

export function createSvgRenderer(options: SvgRendererOptions): SvgRenderer {
  const {
    host,
    glyphs,
    controller,
    wrap = 'nowrap',
    maxStretchRatio = 4.5,
    restingStretch = 1,
    unitsPerEm = 1000,
    precision = 2,
    glyphBudget = DEFAULT_BUDGET,
  } = options;

  const ticker = options.ticker ?? sharedTicker;
  const doc = options.document ?? host.ownerDocument;
  if (!doc) throw new Error('createSvgRenderer: no document available');
  const respectRM = options.respectReducedMotion ?? true;
  const isRM = options.isReducedMotion ?? prefersReducedMotion;

  // --- build the <svg> render layer + one reusable <path> per glyph.
  const svg = doc.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
  svg.setAttribute('data-fontuccine', 'svg-tier');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  const prepared: PreparedGlyph[] = glyphs.map((g) => {
    const path = doc.createElementNS(SVG_NS, 'path') as SVGPathElement;
    if (g.char) path.setAttribute('data-char', g.char);
    svg.appendChild(path);
    return {
      path,
      contours: splitGlyph(g.commands, g.bounds, g.flex.length),
      layout: {
        profile: g.flex,
        bounds: g.bounds,
        advanceWidth: g.advanceWidth,
        kernBefore: g.kernBefore,
      },
    };
  });

  // --- static viewBox sized to the MAX-stretch run so per-frame widths always
  //     fit (only `d` changes per frame; the viewBox never does).
  const layoutGlyphs = prepared.map((p) => p.layout);
  const maxRun = layoutRun(layoutGlyphs, { stretch: maxStretchRatio, axis: 'x', origin: 0 });
  let minY = Infinity;
  let maxY = -Infinity;
  for (const g of glyphs) {
    if (g.bbox.minY < minY) minY = g.bbox.minY;
    if (g.bbox.maxY > maxY) maxY = g.bbox.maxY;
  }
  if (!Number.isFinite(minY)) {
    minY = 0;
    maxY = unitsPerEm;
  }
  const vbW = Math.max(1, maxRun.width);
  const vbH = Math.max(1, maxY - minY);
  svg.setAttribute('viewBox', `0 ${minY} ${vbW} ${vbH}`);
  // em sizing → tracks host font-size through CSS (no per-frame read).
  svg.style.setProperty('width', `${vbW / unitsPerEm}em`);
  svg.style.setProperty('height', `${vbH / unitsPerEm}em`);

  const overlay = createOverlay({
    host,
    renderLayer: svg,
    text: options.text,
    wrap,
    maxStretchRatio,
    document: doc,
  });

  // --- lifecycle state.
  let attached = false;
  let dirty = true;
  let lastStretch = Number.NaN;
  const unsubs: Array<() => void> = [];
  let resizeObserver: ResizeObserver | null = null;
  let scrollHandler: (() => void) | null = null;

  function readPhase(): void {
    if (!dirty) return; // cached — nothing changed since last measure
    dirty = false;
    overlay.measure();
  }

  /** Lay out at `stretch` and rewrite every glyph's `d` (WRITE only). */
  function paint(stretch: number): void {
    lastStretch = stretch;
    const run = layoutRun(layoutGlyphs, { stretch, axis: 'x', origin: 0 });
    for (let i = 0; i < prepared.length; i++) {
      const p = prepared[i];
      const r = run.glyphs[i];
      p.path.setAttribute('d', serializeGlyph(p.contours, r.remap, r.penX, precision));
    }
  }

  function draw(): void {
    // RENDER phase. `controller.value` is a plain number, not a DOM read.
    const stretch = controller.value;
    if (stretch === lastStretch) return; // settled → skip the paint entirely
    paint(stretch);
  }

  function attach(): void {
    if (attached) return;
    attached = true;

    if (glyphs.length > glyphBudget) {
      // eslint-disable-next-line no-console
      console.warn(
        `[fontuccine/svg] ${glyphs.length} glyphs exceeds the headline budget of ${glyphBudget}. ` +
          `The SVG tier repaints every frame — long runs belong on the WebGL tier.`,
      );
    }

    if (respectRM && isRM()) {
      // Reduced motion / print: measure once, paint once at rest, NO per-frame
      // subscription (register no RENDER callback — zero ongoing engine work).
      overlay.measure();
      paint(restingStretch);
      return;
    }

    // Animated path: READ (measure, cached) + RENDER (draw) on the shared ticker.
    unsubs.push(ticker.read(readPhase));
    unsubs.push(ticker.render(draw));

    // Invalidate cached measurements on resize + scroll (re-measured in READ).
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        dirty = true;
        ticker.wake();
      });
      resizeObserver.observe(host);
    }
    const view = doc.defaultView;
    if (view) {
      scrollHandler = () => {
        dirty = true;
      };
      view.addEventListener('scroll', scrollHandler, { passive: true });
    }

    ticker.wake();
  }

  function resize(): void {
    dirty = true;
    ticker.wake();
  }

  function destroy(): void {
    for (const u of unsubs) u();
    unsubs.length = 0;
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (scrollHandler && doc.defaultView) {
      doc.defaultView.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    overlay.destroy(); // moves real text back, removes the <svg>, restores styles
    attached = false;
  }

  return {
    attach,
    resize,
    draw,
    destroy,
    element: svg,
    overlay,
  };
}
