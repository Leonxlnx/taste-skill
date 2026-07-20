/**
 * engine/attach.ts — `Fontuccine.attach(target, config)`: the `.` entry
 * orchestrator that turns a config + a DOM target into a live stretch instance.
 *
 * Pipeline: config → StretchController (created synchronously so `.set()` and
 * ticker liveness are live immediately) → font load (lazy) → static per-glyph
 * analysis → tier selection → renderer → renderer.attach().
 *
 * CARRIED-FORWARD GUARANTEE (verified in test/engine-guarantee): the renderer is
 * ALWAYS driven by a StretchController, which is the ONLY registrant of a ticker
 * activity predicate (`() => !smoother.settled`). Renderers register NO liveness
 * of their own, so once the spring settles the shared ticker self-parks. This
 * file must never introduce a renderer-owned activity predicate.
 *
 * SSR: importing this module touches no `window`/`document`. All capability
 * probing + DOM work happens inside `attach()`, and `attach()` early-returns an
 * inert instance when there is no document (so wrappers can call it on the server
 * and simply get a no-op until they re-run in a browser effect).
 */
import { createStretchController } from '../interaction/stretch-controller';
import type { StretchController } from '../interaction/stretch-controller';
import { ticker as sharedTicker } from '../interaction/ticker';
import { prefersReducedMotion } from '../interaction/reduced-motion';
import { detectWebGL2 } from '../webgl/gl/capability';
import { probeTier0, cssSupportsFontStretchPercentage } from '../vf/probe';
import { createSvgRenderer } from '../svg/renderer';
import { createWebglRenderer } from '../webgl/renderer';
import { createVfRenderer } from '../vf/renderer';
import { AnalysisClient } from '../worker/client';
import { DEFAULT_PARAMS } from '../core/types';
import { loadEngineFont } from './font-load';
import { buildGlyphs } from './glyphs';
import { selectTier } from './tier-select';
import type { ResolvedTier } from './tier-select';
import type { FontuccineConfig, Instance } from './types';

interface TierRenderer {
  attach(): void;
  destroy(): void;
}

function resolveElement(target: string | Element, doc: Document | undefined): HTMLElement {
  if (typeof target === 'string') {
    if (!doc) throw new Error('fontuccine: cannot resolve a selector without a document');
    const el = doc.querySelector(target);
    if (!el) throw new Error(`fontuccine: no element matches "${target}"`);
    return el as HTMLElement;
  }
  return target as HTMLElement;
}

function defaultIsPrint(doc: Document | undefined): boolean {
  const view = doc?.defaultView ?? (typeof window !== 'undefined' ? window : undefined);
  try {
    return !!view?.matchMedia && view.matchMedia('print').matches;
  } catch {
    return false;
  }
}

export function attach(target: string | Element, config: FontuccineConfig = {}): Instance {
  const doc =
    config.document ?? (typeof document !== 'undefined' ? document : undefined);

  // SSR / no-DOM: hand back an inert instance (wrappers re-attach in an effect).
  if (!doc && typeof target === 'string') {
    return inertInstance('no document (SSR): attach is a no-op until a browser effect');
  }

  const el = resolveElement(target, doc);
  let direction = el.dir;
  try {
    direction = doc?.defaultView?.getComputedStyle(el).direction || direction;
  } catch {
    // A cross-realm or test element may not support computed styles.
  }
  if (direction === 'rtl') {
    return inertInstance('rtl direction: using static native text to preserve shaping');
  }
  const ticker = config.ticker ?? sharedTicker;
  const unitsPerEm = config.unitsPerEm ?? 1000;

  const min = config.minStretchRatio ?? 1;
  const max = config.maxStretchRatio ?? 4.5;
  const resting = Math.min(Math.max(1, min), max);

  const respectRM = config.respectReducedMotion ?? true;
  const isRM = config.isReducedMotion ?? prefersReducedMotion;

  // --- StretchController (synchronous): owns ticker liveness + `.set()`.
  const controller: StretchController = createStretchController({
    ...(config.trigger ? { trigger: config.trigger } : {}),
    ...(config.axis ? { axis: config.axis } : {}),
    maxStretchRatio: max,
    minStretchRatio: min,
    ...(config.velocityToStretch != null ? { velocityToStretch: config.velocityToStretch } : {}),
    ...(config.proximityRadius != null ? { proximityRadius: config.proximityRadius } : {}),
    ...(config.physics ? { physics: config.physics } : {}),
    ...(config.easingCurve ? { easingCurve: config.easingCurve } : {}),
    ...(config.easingDuration != null ? { easingDuration: config.easingDuration } : {}),
    respectReducedMotion: respectRM,
    isReducedMotion: isRM,
    element: el,
    ticker,
    restingValue: resting,
  });

  const client = config.analysisClient ?? new AnalysisClient();
  const ownsClient = !config.analysisClient;

  let destroyed = false;
  let selectedTier: ResolvedTier | null = null;
  let renderer: TierRenderer | null = null;
  const notes: string[] = [];
  let resolveReady!: () => void;
  const ready = new Promise<void>((r) => {
    resolveReady = r;
  });

  async function build(): Promise<void> {
    try {
      const reducedMotion = respectRM && isRM();
      const print = (config.isPrint ?? (() => defaultIsPrint(doc)))();
      const webgl2 = (config.detectWebGL2Support ?? (() => detectWebGL2().supported))();
      const compression = min < 1;

      // Load outlines + wdth axis (VF may still win; axis needed to probe it).
      const font = await loadEngineFont({
        ...(config.font ? { font: config.font } : {}),
        ...(config.fontUrl ? { fontUrl: config.fontUrl } : {}),
        ...(config.fontBuffer ? { fontBuffer: config.fontBuffer } : {}),
        ...(config.parsedFont ? { parsedFont: config.parsedFont } : {}),
        ...(config.wdthAxis !== undefined ? { wdthAxis: config.wdthAxis } : {}),
        unitsPerEm,
      });
      if (destroyed) return;

      const vfDecision = probeTier0(font.wdthAxis, {
        maxStretchRatio: max,
        minStretchRatio: min,
        axis: config.axis ?? 'horizontal',
      });
      const vfSupported = vfDecision.supported && cssSupportsFontStretchPercentage();

      const decision = selectTier(config.tier ?? 'auto', {
        webgl2,
        vfSupported,
        reducedMotion,
        print,
        compression,
      });
      selectedTier = decision.tier;
      notes.push(...decision.notes);
      if (destroyed) return;

      if (selectedTier === 'vf') {
        if (!font.wdthAxis) throw new Error('fontuccine: VF selected without a wdth axis');
        renderer = createVfRenderer({
          host: el,
          axis: font.wdthAxis,
          controller,
          wrap: config.wrap ?? 'nowrap',
          reserveBasis: config.reserveBasis ?? 'tier-capability',
          maxStretchRatio: max,
          restingStretch: resting,
          respectReducedMotion: respectRM,
          isReducedMotion: isRM,
          ticker,
          document: doc,
        });
      } else {
        const params = {
          ...DEFAULT_PARAMS,
          slices: config.lutResolution ?? DEFAULT_PARAMS.slices,
          k: config.edgeProtection ?? DEFAULT_PARAMS.k,
        };
        const glyphs = await buildGlyphs(font, config.text ?? el.textContent ?? '', client, params, unitsPerEm);
        if (destroyed) return;

        const common = {
          host: el,
          glyphs,
          controller,
          ...(config.text != null ? { text: config.text } : {}),
          wrap: config.wrap ?? 'nowrap',
          maxStretchRatio: max,
          restingStretch: resting,
          unitsPerEm,
          respectReducedMotion: respectRM,
          isReducedMotion: isRM,
          ticker,
          document: doc,
        };

        if (selectedTier === 'webgl') {
          const webglRenderer = createWebglRenderer({
            ...common,
            ...(config.effects ? { effects: config.effects } : {}),
            ...(config.color ? { color: config.color } : {}),
            ...(config.backend ? { backend: config.backend } : {}),
          });
          if (webglRenderer.supported) {
            renderer = webglRenderer;
          } else {
            webglRenderer.destroy();
            selectedTier = 'svg';
            notes.push('webgl renderer unavailable; fell through to svg');
            renderer = createSvgRenderer(common);
          }
        } else {
          renderer = createSvgRenderer(common);
        }
      }

      if (destroyed) {
        renderer?.destroy();
        renderer = null;
        return;
      }
      renderer.attach();
    } catch (err) {
      notes.push(`build failed: ${(err as Error)?.message ?? String(err)}`);
    } finally {
      resolveReady();
    }
  }

  void build();

  return {
    set(value: number) {
      controller.set(value);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      renderer?.destroy();
      renderer = null;
      controller.destroy();
      if (ownsClient) client.destroy();
    },
    get tier() {
      return selectedTier;
    },
    ready,
    get notes() {
      return notes;
    },
  };
}

function inertInstance(note: string): Instance {
  return {
    set() {},
    destroy() {},
    tier: null,
    ready: Promise.resolve(),
    notes: [note],
  };
}
