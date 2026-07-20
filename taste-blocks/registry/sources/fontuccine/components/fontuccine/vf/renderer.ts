/**
 * vf/renderer.ts — Fontuccine Tier 0 (opportunistic variable-font `wdth`).
 *
 * The cheapest tier: when the active font is a variable font exposing a `wdth`
 * axis AND the requested range fits the designed axis (see probe.ts), we map the
 * shared per-frame stretch scalar straight to CSS `font-stretch: <percentage>`.
 *
 * ⚠ PERF REALITY (RESEARCH §2; CLAUDE.md rule 5): this is NOT compositor
 * accelerated. Changing `wdth`/`font-stretch` re-runs LAYOUT + PAINT on the main
 * thread every frame, element-scoped. It is D-tier work — fine for ONE headline,
 * never the perf headline claim. Its virtue is TYPOGRAPHIC quality (widths drawn
 * by the type designer) and near-zero setup, not throughput.
 *
 * A11y model DIFFERS from Tiers 1/2 (important):
 *  - Tier 0 stretches the REAL native text directly, so the text itself IS the
 *    render. There is NO hidden-text overlay and NO `aria-hidden` render layer to
 *    manage. The text never leaves the flow, never loses selection, find-in-page
 *    or screen-reader access — it is simply drawn at a different width. Hence
 *    `overlay` is `null` (documented no-op): the shared overlay pattern exists to
 *    re-expose text that a canvas/SVG layer would otherwise hide; Tier 0 hides
 *    nothing, so mounting it would be wrong (it would transparent-out live text).
 *
 * Discipline (CLAUDE.md rules 4, 5, 6, 7):
 *  - `font-stretch` is written directly from JS in the RENDER phase — NOT driven
 *    through an inherited CSS custom property (rule 4 trap).
 *  - We register NO liveness predicate: StretchController owns `onActivity`. We
 *    only subscribe READ (cached measurement for `reserve`) + RENDER (the write).
 *  - Reduced motion / print ⇒ apply the resting width ONCE, register no per-frame
 *    callback (rule 6). No live reflow: `wrap` is 'nowrap' | 'reserve' (rule 7).
 *
 * Tier interface (attach/resize/draw/destroy + readonly element/overlay) mirrors
 * the SVG/WebGL renderers so the engine can swap tiers behind one shape.
 */
import type { Ticker } from '../interaction/ticker';
import { ticker as sharedTicker } from '../interaction/ticker';
import { prefersReducedMotion } from '../interaction/reduced-motion';
import type { WdthAxis } from './detect';
import type { WrapMode, ReserveBasis } from '../dom/overlay';
import type { Overlay } from '../dom/overlay';
import type { WdthMapping } from './probe';
import { createWdthMapping } from './probe';

/** Minimal shape the renderer reads from a StretchController. */
export interface StretchSource {
  readonly value: number;
}

/** Which CSS property carries the width. `font-stretch` is preferred (it
 *  composes with the font-matching algorithm — MDN Variable Fonts guide);
 *  `font-variation-settings` is offered for engines/fonts that need the raw
 *  axis. Both take the same numeric value. */
export type WdthApplyMode = 'font-stretch' | 'font-variation-settings';

export interface VfRendererOptions {
  /** Element whose real text is stretched. Text is NOT moved or hidden. */
  host: HTMLElement;
  /** The designed `wdth` axis bounds (from getWdthAxis). */
  axis: WdthAxis;
  /** Per-frame stretch source (a StretchController or anything with `.value`). */
  controller: StretchSource;
  /** Prebuilt mapping (from the probe). Defaults to createWdthMapping(axis). */
  mapping?: WdthMapping;
  /** Wrap behavior. Default 'nowrap'. No live reflow (rule 7). */
  wrap?: WrapMode;
  /**
   * How `wrap:'reserve'` sizes the reserved box. Default 'tier-capability'.
   *  - 'tier-capability': reserve what THIS tier can actually paint —
   *    `naturalWidth × (axis.max / restingPercent)` (axis-bounded).
   *  - 'uniform': reserve `naturalWidth × maxStretchRatio`, matching the
   *    overlay tiers for cross-tier visual consistency. VF cannot stretch past
   *    its axis, so this leaves a permanent unused gap — the accepted tradeoff.
   */
  reserveBasis?: ReserveBasis;
  /**
   * Max stretch ratio used to size `reserve` under the 'uniform' basis (must
   * match the overlay tiers). Default 4.5. Unused under 'tier-capability'.
   */
  maxStretchRatio?: number;
  /** Which property to write. Default 'font-stretch'. */
  apply?: WdthApplyMode;
  /** Resting stretch ratio for the static reduced-motion draw. Default 1. */
  restingStretch?: number;
  ticker?: Ticker;
  document?: Document;
  respectReducedMotion?: boolean;
  /** Override reduced-motion detection (tests). */
  isReducedMotion?: () => boolean;
}

export interface VfRenderer {
  /** Apply styles + subscribe. Idempotent. */
  attach(): void;
  /** Invalidate cached measurements (re-measured next READ phase). */
  resize(): void;
  /** One-shot render (write phase). Also the subscribed RENDER callback. */
  draw(now?: number): void;
  /** Tear down subscriptions/observers; restore the host's inline style. */
  destroy(): void;
  /** The stretched element (the real text lives here — never hidden). */
  readonly element: HTMLElement;
  /**
   * Tier 0 hides nothing, so there is no a11y overlay to manage — `null` by
   * design (see file header). The cross-tier field is kept for interface parity.
   */
  readonly overlay: Overlay | null;
}

function writeWidth(el: HTMLElement, mode: WdthApplyMode, pct: number, precision = 3): void {
  const n = Number(pct.toFixed(precision));
  if (mode === 'font-variation-settings') {
    el.style.setProperty('font-variation-settings', `"wdth" ${n}`);
  } else {
    el.style.setProperty('font-stretch', `${n}%`);
  }
}

export function createVfRenderer(options: VfRendererOptions): VfRenderer {
  const {
    host,
    axis,
    controller,
    wrap = 'nowrap',
    apply = 'font-stretch',
    restingStretch = 1,
    reserveBasis = 'tier-capability',
    maxStretchRatio = 4.5,
  } = options;

  const ticker = options.ticker ?? sharedTicker;
  const doc = options.document ?? host.ownerDocument;
  if (!doc) throw new Error('createVfRenderer: no document available');
  const respectRM = options.respectReducedMotion ?? true;
  const isRM = options.isReducedMotion ?? prefersReducedMotion;
  const mapping = options.mapping ?? createWdthMapping(axis);

  // --- save the host's inline style so destroy() restores it exactly.
  const savedCssText = host.getAttribute('style') ?? '';

  // Static wrap style — set once, never per frame (rule 7: no live reflow).
  //  'nowrap'  → the line never wraps at any width.
  //  'reserve' → keep nowrap AND reserve the widest box up front (min-width),
  //              measured in the READ phase, so following content never reflows.
  host.style.setProperty('white-space', 'nowrap');

  // --- lifecycle state.
  let attached = false;
  let subscribed = false;
  let dirty = wrap === 'reserve'; // only 'reserve' needs a measurement
  let reservedFrom: number | null = null;
  let lastPct = Number.NaN;
  const unsubs: Array<() => void> = [];
  let resizeObserver: ResizeObserver | null = null;
  let scrollHandler: (() => void) | null = null;

  /** READ phase: measure natural width once (for 'reserve'), cached. */
  function readPhase(): void {
    if (wrap !== 'reserve' || !dirty) return;
    dirty = false;
    // Measure at natural width: reserve BEFORE the first stretch is painted,
    // then reserve the widest box the axis can reach (axis.max %) so downstream
    // layout never shifts mid-interaction. Approximate (advance widths are
    // designer-drawn, not linear), matching the overlay's reserve semantics.
    const w = host.getBoundingClientRect().width;
    if (Number.isFinite(w) && w > 0) {
      reservedFrom = w;
      let factor: number;
      if (reserveBasis === 'uniform') {
        // Match the overlay tiers exactly: reserve the full max-ratio box even
        // though VF cannot stretch past its axis (leaves a permanent gap).
        factor = maxStretchRatio;
      } else {
        // 'tier-capability': reserve only the widest box the axis can reach.
        const restPct = mapping.toPercent(restingStretch);
        factor = restPct > 0 ? axis.max / restPct : axis.max / 100;
      }
      host.style.setProperty('min-width', `${w * factor}px`);
    }
  }

  /** WRITE only: map the ratio → clamped percentage and set the style. */
  function paint(ratio: number): void {
    const pct = mapping.toPercent(ratio);
    if (pct === lastPct) return;
    lastPct = pct;
    writeWidth(host, apply, pct);
  }

  function draw(): void {
    // RENDER phase. `controller.value` is a plain number, not a DOM read.
    paint(controller.value);
  }

  function attach(): void {
    if (attached) return;
    attached = true;

    if (respectRM && isRM()) {
      // Reduced motion / print: reserve (if asked) + paint once at rest, and
      // register NO per-frame callback — zero ongoing engine work (rule 6).
      readPhase();
      paint(restingStretch);
      return;
    }

    // Animated: READ (cached reserve measure) + RENDER (the write). We do NOT
    // register an activity predicate — the StretchController owns liveness.
    unsubs.push(ticker.read(readPhase));
    unsubs.push(ticker.render(draw));
    subscribed = true;

    // Invalidate cached measurement on resize + scroll (re-measured in READ).
    if (wrap === 'reserve') {
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
    }

    ticker.wake();
  }

  function resize(): void {
    dirty = wrap === 'reserve';
    ticker.wake();
  }

  function destroy(): void {
    for (const u of unsubs) u();
    unsubs.length = 0;
    subscribed = false;
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (scrollHandler && doc.defaultView) {
      doc.defaultView.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    // Restore the host's inline style exactly (text was never moved/hidden).
    if (savedCssText) host.setAttribute('style', savedCssText);
    else host.removeAttribute('style');
    attached = false;
    reservedFrom = null;
    lastPct = Number.NaN;
  }

  return {
    attach,
    resize,
    draw,
    destroy,
    element: host,
    overlay: null,
    // internal diagnostics (not part of the cross-tier interface)
    get _subscribed() {
      return subscribed;
    },
    get _reservedFrom() {
      return reservedFrom;
    },
  } as VfRenderer & { readonly _subscribed: boolean; readonly _reservedFrom: number | null };
}
