/**
 * webgl/renderer.ts — Fontuccine Tier 1 (WebGL2 + runtime MSDF atlas) renderer.
 *
 * PRIMARY tier (RESEARCH §3). Consumes the SAME frozen surfaces as the SVG tier
 * — `layoutRun` prefix metrics, the flex profiles, the shared overlay, the
 * shared ticker + StretchController — so GPU and SVG geometry match within
 * tolerance (test/webgl-parity). Interface mirrors createSvgRenderer EXACTLY
 * (attach/resize/draw/destroy + element + overlay) so the engine swaps tiers
 * behind one shape.
 *
 * Discipline (CLAUDE.md rules 1,4,6; obligations):
 *  - ONE shared canvas/context for all instances (gl/shared.ts); this renderer
 *    draws into its own screen region via scissor — never a context per element.
 *  - Static-per-glyph work (flex→cumulative-flex LUT, MSDF raster, instance
 *    attributes) is built ONCE off the main thread (MSDF in a worker) and NEVER
 *    per frame. Per frame only `u_stretch`/`u_origin` (+ effect scalars) change:
 *    zero buffer re-uploads in steady state.
 *  - Writes happen only in the RENDER phase; the only DOM read (host rect) is a
 *    cached READ-phase measure, invalidated by ResizeObserver + scroll.
 *  - Reduced motion / print ⇒ ONE static draw, NO per-frame callback.
 *  - Offscreen ⇒ IntersectionObserver deactivates the instance (RESEARCH §2).
 *  - Context loss ⇒ atlas + LUT + geometry buffers fully restored (obligation 1).
 *
 * The a11y/overlay reconciliation (flagged): "one shared canvas for all
 * instances" and "mount the canvas as the overlay renderLayer" are mutually
 * exclusive for N>1 (a canvas node can live in one host only). The shared-canvas
 * architecture wins; each host gets a transparent, inert PROXY layer through
 * `createOverlay` so ALL the frozen a11y/wrap/containment/destroy behavior is
 * reused, while the pixels come from the shared canvas aligned by scissor.
 */
import type { LayoutGlyph } from '../core/kerning';
import { layoutRun } from '../core/kerning';
import type { Ticker } from '../interaction/ticker';
import { ticker as sharedTicker } from '../interaction/ticker';
import { prefersReducedMotion } from '../interaction/reduced-motion';
import { observeVisibility } from '../interaction/gating';
import type { VisibilityOptions } from '../interaction/gating';
import { createOverlay } from '../dom/overlay';
import type { Overlay, WrapMode } from '../dom/overlay';
import type { WebglGlyph, EffectsConfig, RGBAColor } from './types';
import { buildFlexCumulative } from './parity';
import { packLUTAtlas } from './lut-texture';
import { MsdfAtlas } from './msdf/atlas';
import { MsdfClient } from './msdf/client';
import type { MSDFBitmap } from './msdf/generator';
import type { RenderBackend, RunHandle, GlyphRunData } from './gl/device';
import { acquireSharedBackend, releaseSharedBackend, DEFAULT_GRID_SLICES } from './gl/shared';

const DEFAULT_ATLAS_SIZE = 1024;
const DEFAULT_CELL = 64;
const FLOATS_PER_INSTANCE = 9;

export interface StretchSource {
  readonly value: number;
  /** Optional velocity (for aberration ∝ velocity); 0 when absent. */
  readonly velocity?: number;
}

export interface WebglRendererOptions {
  host: HTMLElement;
  glyphs: WebglGlyph[];
  controller: StretchSource;
  text?: string;
  wrap?: WrapMode;
  maxStretchRatio?: number;
  restingStretch?: number;
  unitsPerEm?: number;
  /** Ink color (straight alpha, 0..1). Default opaque black. */
  color?: RGBAColor;
  effects?: EffectsConfig;
  /** MSDF raster size in px per em. Default 48. */
  fontSizeRaster?: number;
  /** MSDF distance range in texels. Default 4. */
  pxRange?: number;
  ticker?: Ticker;
  document?: Document;
  respectReducedMotion?: boolean;
  isReducedMotion?: () => boolean;
  /** Device pixel ratio source (default: window.devicePixelRatio or 1). */
  dpr?: number;
  /** Injected backend (tests). Omit to use the shared page-global backend. */
  backend?: RenderBackend;
  /** Injected MSDF client (tests / shared). Omit to create one. */
  msdfClient?: MsdfClient;
  /** Visibility gate factory (tests). */
  visibilityFactory?: VisibilityOptions['factory'];
}

export interface WebglRenderer {
  attach(): void;
  resize(): void;
  draw(now?: number): void;
  destroy(): void;
  /** True when WebGL2 is available; false ⇒ engine must drop to the SVG tier. */
  readonly supported: boolean;
  /** The shared render surface (canvas), or null when unsupported. */
  readonly element: HTMLCanvasElement | null;
  readonly overlay: Overlay;
}

interface GlyphStatic {
  originFactor: number; // font units (prefixAdvance + bounds.min)
  width: number; // font units (bounds.max - bounds.min)
  bounds: { min: number; max: number };
  yTop: number; // font units from run top
  height: number; // font units
  cumFlex: Float32Array; // normalized cumulative flex LUT
  glyphKey: string;
  bitmap?: MSDFBitmap;
  uv?: { origin: [number, number]; size: [number, number] };
}

export function createWebglRenderer(options: WebglRendererOptions): WebglRenderer {
  const {
    host,
    glyphs,
    controller,
    wrap = 'nowrap',
    maxStretchRatio = 4.5,
    restingStretch = 1,
    unitsPerEm = 1000,
    fontSizeRaster = 48,
    pxRange = 4,
  } = options;

  const ticker = options.ticker ?? sharedTicker;
  const doc = options.document ?? host.ownerDocument;
  if (!doc) throw new Error('createWebglRenderer: no document available');
  const respectRM = options.respectReducedMotion ?? true;
  const isRM = options.isReducedMotion ?? prefersReducedMotion;
  const color: RGBAColor = options.color ?? { r: 0, g: 0, b: 0, a: 1 };
  const effects = options.effects ?? {};
  const slices = glyphs[0]?.flex.length ?? DEFAULT_GRID_SLICES;

  // Acquire the shared backend (or the injected one). Null ⇒ unsupported.
  const backend = options.backend ?? acquireSharedBackend(slices);
  const usingShared = !options.backend;
  const supported = !!backend && backend.supported;

  const msdf = options.msdfClient ?? new MsdfClient();
  const ownsMsdf = !options.msdfClient;

  // Shared MSDF atlas (slot LRU). One per renderer instance's glyph set; the
  // backend's atlas texture is shared, cells are packed here.
  const atlas = new MsdfAtlas({ size: DEFAULT_ATLAS_SIZE, cellSize: DEFAULT_CELL, dpr: options.dpr ?? 1 });

  // --- proxy render layer (inert) so the frozen overlay machinery applies.
  const proxy = doc.createElement('div');
  proxy.setAttribute('data-fontuccine', 'webgl');
  const overlay = createOverlay({
    host,
    renderLayer: proxy,
    text: options.text,
    wrap,
    maxStretchRatio,
    document: doc,
  });

  // --- STATIC per-glyph layout + LUT (computed once; never per frame).
  const layoutGlyphs: LayoutGlyph[] = glyphs.map((g) => ({
    profile: g.flex,
    bounds: g.bounds,
    advanceWidth: g.advanceWidth,
    kernBefore: g.kernBefore,
  }));

  // prefixAdvance_i in font units (matches layoutRun's cursor derivation).
  let maxAscent = -Infinity;
  let minDescent = Infinity;
  for (const g of glyphs) {
    if (g.bbox.maxY > maxAscent) maxAscent = g.bbox.maxY;
    if (g.bbox.minY < minDescent) minDescent = g.bbox.minY;
  }
  if (!Number.isFinite(maxAscent)) {
    maxAscent = unitsPerEm;
    minDescent = 0;
  }

  const statics: GlyphStatic[] = [];
  let prefix = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const kb = g.kernBefore ?? 0;
    prefix += kb; // prefixAdvance_i = kernBefore_i + Σ_{j<i}(adv_j + kern_j)
    statics.push({
      originFactor: prefix + g.bounds.min,
      width: g.bounds.max - g.bounds.min,
      bounds: { min: g.bounds.min, max: g.bounds.max },
      yTop: g.bbox.minY - minDescent,
      height: g.bbox.maxY - g.bbox.minY,
      cumFlex: buildFlexCumulative(g.flex),
      glyphKey: g.char ?? `g${i}`,
    });
    prefix += g.advanceWidth; // advance for the NEXT glyph's prefix
  }
  const runFontUnitsHeight = maxAscent - minDescent;

  // --- lifecycle state
  let attached = false;
  let ready = false;
  let visible = true;
  let lastStretch = Number.NaN;
  let rectDirty = true;
  let hostRect: { x: number; y: number; w: number; h: number } | null = null;
  let fontSizePx = fontSizeRaster; // css px/em; refined from the host in READ
  let run: RunHandle | null = null;
  const unsubs: Array<() => void> = [];
  let resizeObserver: ResizeObserver | null = null;
  let scrollHandler: (() => void) | null = null;
  let visibilityStop: (() => void) | null = null;
  let lostUnsub: (() => void) | null = null;
  let restoredUnsub: (() => void) | null = null;
  let destroyed = false;

  const dpr = (): number => options.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  // --- lazy displacement-noise load (zero-cost until an enabled effect asks).
  let noiseLoaded = false;
  function loadNoiseIfNeeded(): void {
    if (noiseLoaded || destroyed) return;
    const disp = effects.displacement;
    if (!disp || !disp.texture || (disp.intensity ?? 0) <= 0) return;
    if (!backend || typeof backend.setNoise !== 'function') return;
    if (typeof Image === 'undefined') return; // SSR / headless: skip silently
    noiseLoaded = true; // guard against duplicate in-flight loads
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (destroyed || !backend) return;
      backend.setNoise?.(img);
      lastStretch = Number.NaN; // force a repaint now that warp is available
      ticker.wake();
    };
    img.onerror = () => {
      noiseLoaded = false; // allow a later retry; displacement stays disabled
    };
    img.src = disp.texture;
  }

  // --- assemble the packed LUT atlas (static; row per glyph).
  function buildLUTAtlas() {
    return packLUTAtlas(statics.map((s) => s.cumFlex));
  }

  // --- build/refresh the atlas cells + instance buffer, then upload the run.
  function assembleAndUpload(): void {
    if (!backend || destroyed) return;
    backend.ensureAtlas(DEFAULT_ATLAS_SIZE);
    atlas.clear(); // fresh slot assignment (also used on context restore)

    const instances = new Float32Array(statics.length * FLOATS_PER_INSTANCE);
    const emPx = fontSizePx / unitsPerEm; // font units → css px

    for (let i = 0; i < statics.length; i++) {
      const s = statics[i];
      const bmp = s.bitmap;
      if (!bmp) continue;
      const cell = atlas.acquire(s.glyphKey, bmp.width, bmp.height);
      if (cell.isNew) {
        const { x, y } = atlas.cellOrigin(cell.slot);
        backend.uploadAtlasCell(x, y, bmp);
      }
      // atlas UV rect for this glyph's INK region (box [0,1]² → ink texels).
      const { x: cx, y: cy } = atlas.cellOrigin(cell.slot);
      const S = DEFAULT_ATLAS_SIZE;
      const pad = bmp.padding;
      const uvOx = (cx + pad) / S;
      const uvOy = (cy + bmp.height - pad) / S; // box y=0 (bottom) → image bottom
      const uvSx = (bmp.width - 2 * pad) / S;
      const uvSy = -(bmp.height - 2 * pad) / S; // signed: box y=1 (top) → image top
      s.uv = { origin: [uvOx, uvOy], size: [uvSx, uvSy] };

      const o = i * FLOATS_PER_INSTANCE;
      instances[o + 0] = s.originFactor * emPx; // css px
      instances[o + 1] = s.width * emPx;
      instances[o + 2] = s.yTop * emPx;
      instances[o + 3] = s.height * emPx;
      instances[o + 4] = uvOx;
      instances[o + 5] = uvOy;
      instances[o + 6] = uvSx;
      instances[o + 7] = uvSy;
      instances[o + 8] = i; // lut row
    }

    const data: GlyphRunData = {
      instances,
      instanceCount: statics.length,
      lutAtlas: buildLUTAtlas(),
      slices,
    };
    if (!run) run = backend.createRun();
    run.upload(data);
  }

  // --- kick off MSDF generation for all glyphs (worker / inline). Static.
  function generateAtlas(): Promise<void> {
    const jobs = statics.map((s, i) => {
      const g = glyphs[i];
      return msdf
        .generate({
          glyphId: `${s.glyphKey}@${fontSizeRaster}`,
          commands: g.commands,
          options: { bbox: g.bbox, fontSize: fontSizeRaster, unitsPerEm, pxRange },
          dpr: options.dpr ?? 1,
        })
        .then((bmp) => {
          s.bitmap = bmp;
        });
    });
    return Promise.all(jobs).then(() => void 0);
  }

  function readPhase(): void {
    if (!rectDirty) return;
    rectDirty = false;
    overlay.measure();
    // Host screen rect in CSS px (single getBoundingClientRect).
    const r = host.getBoundingClientRect();
    hostRect = { x: r.left, y: r.top, w: r.width, h: r.height };
    // Track the host's rendered em size so glyph metrics scale with CSS.
    const view = doc.defaultView;
    if (view) {
      const fs = parseFloat(view.getComputedStyle(host).fontSize);
      if (Number.isFinite(fs) && fs > 0 && Math.abs(fs - fontSizePx) > 0.01) {
        fontSizePx = fs;
        if (ready) assembleAndUpload(); // font-size changed → rebuild static px attrs
      }
    }
  }

  function frameEffects(velocity: number): {
    grain: number;
    aberration: number;
    disp: number;
    dispScale: [number, number];
  } {
    const grain = effects.grain ?? 0;
    let aberration = 0;
    if (effects.aberration) {
      aberration = effects.aberration.fromVelocity
        ? Math.min(effects.aberration.max, Math.abs(velocity) * effects.aberration.max)
        : effects.aberration.max;
    }
    const disp = effects.displacement?.intensity ?? 0;
    const dispScale = effects.displacement?.scale ?? [1, 1];
    return { grain, aberration, disp, dispScale };
  }

  function paint(rawStretch: number, now: number): void {
    if (!backend || !run || !ready || !visible || !hostRect) return;
    if (backend.isContextLost()) return;
    // ── Tier-safety guard: WebGL is a STRETCH-ONLY tier ──────────────────────
    // The stretch-independent LUT form `uOrig + (u_stretch-1)·C(u)` is exact and
    // monotonic for stretch ≥ 1, but has NO lower guard: for stretch < 1 it folds
    // geometry over (inverts) on high-flex glyphs, violating the I5/monotonicity
    // invariant. The core's nonlinear water-fill compression guard (core/lut.ts)
    // lives on the frozen CPU side and is NOT reproducible by this linear-in-
    // stretch shader, so compression is the SVG (vector-fidelity) tier's job
    // (RESEARCH §3). We therefore clamp any stretch < 1 to identity (1) at the
    // GPU draw boundary — the shader renders identity-or-stretch and can never
    // fold. This covers BOTH reachable sub-unity paths: a config `minStretchRatio
    // < 1`, and an underdamped spring undershooting below its resting target
    // (stretch-controller emits unclamped `.value`).
    //
    // FUTURE HOOK (do NOT implement here — pending architect/user decision): when
    // effective stretch < 1, dispatch this run to the SVG tier for true
    // compression fidelity instead of clamping to identity. That routing belongs
    // at the engine/tier-selection layer, not inside the GPU renderer.
    const stretch = Math.max(1, rawStretch);
    lastStretch = stretch;
    const d = dpr();
    backend.ensureSize(
      hostRect ? Math.max(hostRect.x + hostRect.w, viewportW()) : viewportW(),
      viewportH(),
      d,
    );
    backend.beginFrame(now);

    const velocity = controller.velocity ?? 0;
    const fx = frameEffects(velocity);
    run.draw({
      region: hostRect,
      dpr: d,
      stretch,
      origin: 0,
      color,
      pxRange,
      atlasSize: DEFAULT_ATLAS_SIZE,
      grain: fx.grain,
      aberration: fx.aberration,
      stretchDir: [1, 0], // horizontal axis only
      time: now * 0.001,
      dispIntensity: fx.disp,
      dispScale: fx.dispScale,
    });
  }

  function viewportW(): number {
    return doc.defaultView?.innerWidth ?? (hostRect ? hostRect.x + hostRect.w : 1);
  }
  function viewportH(): number {
    return doc.defaultView?.innerHeight ?? (hostRect ? hostRect.y + hostRect.h : 1);
  }

  function draw(now = 0): void {
    if (!ready || !visible) return;
    // Clamp to the tier-safe floor (see paint()) BEFORE the settle-skip compare:
    // a sub-unity controller value (config minStretchRatio<1, or an underdamped
    // spring undershooting toward a resting target) maps to identity here, so a
    // run resting below 1 settles/skips instead of re-drawing an identity frame
    // every frame, and sub-unity spring wiggle draws nothing.
    const stretch = Math.max(1, controller.value);
    const hasVelocityFx = !!effects.aberration?.fromVelocity && (controller.velocity ?? 0) !== 0;
    if (stretch === lastStretch && !hasVelocityFx) return; // settled → skip
    paint(stretch, now);
  }

  function onRestore(): void {
    // Context restored: atlas texture, LUT texture, geometry + instance buffers
    // are all gone. Re-ensure + re-upload everything from cached statics/bitmaps.
    if (!backend || destroyed) return;
    assembleAndUpload();
    lastStretch = Number.NaN; // force a repaint
    ticker.wake();
  }

  function subscribeAnimated(): void {
    unsubs.push(ticker.read(readPhase));
    unsubs.push(ticker.render((now) => draw(now)));

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        rectDirty = true;
        ticker.wake();
      });
      resizeObserver.observe(host);
    }
    const view = doc.defaultView;
    if (view) {
      scrollHandler = () => {
        rectDirty = true;
        ticker.wake();
      };
      view.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // Offscreen ⇒ idle (RESEARCH §2). observeVisibility fires true synchronously
    // when no IO is available (headless), so work still runs.
    visibilityStop = observeVisibility(
      host,
      (v) => {
        visible = v;
        if (v) {
          rectDirty = true;
          ticker.wake();
        }
      },
      options.visibilityFactory ? { factory: options.visibilityFactory } : {},
    );
  }

  function attach(): void {
    if (attached || destroyed) return;
    attached = true;
    if (!supported || !backend) return; // engine drops to SVG tier

    lostUnsub = backend.onContextLost(() => {
      /* preventDefault handled in backend; nothing to draw while lost */
    });
    restoredUnsub = backend.onContextRestored(onRestore);

    // Build atlas + run, then paint. Static work; async only for the raster.
    generateAtlas().then(() => {
      if (destroyed) return;
      ready = true;
      // First measure (host rect + font-size) then assemble with real px.
      overlay.measure();
      const r = host.getBoundingClientRect();
      hostRect = { x: r.left, y: r.top, w: r.width, h: r.height };
      const view = doc.defaultView;
      if (view) {
        const fs = parseFloat(view.getComputedStyle(host).fontSize);
        if (Number.isFinite(fs) && fs > 0) fontSizePx = fs;
      }
      assembleAndUpload();
      loadNoiseIfNeeded();

      if (respectRM && isRM()) {
        // Reduced motion / print: ONE static draw, NO per-frame subscription.
        paint(restingStretch, 0);
        return;
      }
      subscribeAnimated();
      ticker.wake();
    });
  }

  function resize(): void {
    rectDirty = true;
    ticker.wake();
  }

  function destroy(): void {
    destroyed = true;
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
    if (visibilityStop) {
      visibilityStop();
      visibilityStop = null;
    }
    if (lostUnsub) lostUnsub();
    if (restoredUnsub) restoredUnsub();
    if (run) {
      run.dispose();
      run = null;
    }
    overlay.destroy();
    if (ownsMsdf) msdf.destroy();
    if (usingShared && backend) releaseSharedBackend();
    attached = false;
  }

  return {
    attach,
    resize,
    draw,
    destroy,
    supported,
    get element() {
      return backend?.canvas ?? null;
    },
    overlay,
  };
}
