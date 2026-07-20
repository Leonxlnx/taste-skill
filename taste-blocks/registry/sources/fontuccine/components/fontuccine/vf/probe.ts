/**
 * vf/probe.ts — Tier-0 capability probe + stretch→wdth mapping.
 *
 * The `tier: 'auto'` dispatcher calls `probeTier0(axis, cfg)` to decide whether
 * the opportunistic variable-font tier can honor the requested configuration.
 * SUPPORTED only when the font exposes a `wdth` axis AND the requested stretch
 * range fits INSIDE the designed axis range (no 4.5× beyond what the designer
 * drew) AND the axis is horizontal (`wdth` is horizontal by definition).
 * Otherwise the probe DECLINES with an explicit reason so `auto` falls through
 * to the WebGL/SVG tiers. All pure — no DOM (RESEARCH §3; refs/examples/07).
 *
 * UNITS: the registered `wdth` axis and CSS `font-stretch` are both PERCENTAGES
 * of normal (default 100). A stretch RATIO of r maps to r×100 %. So a config
 * `maxStretchRatio` of R fits the axis iff R ≤ axis.max/100, and the (optional)
 * `minStretchRatio` m fits iff m ≥ axis.min/100. This is the spec convention;
 * legacy multiplier-scale fonts (Skia) are out of scope for the percentage path.
 */
import type { WdthAxis } from './detect';

/** The stretch-range fields the probe reads (subset of the README config). */
export interface StretchRangeConfig {
  /** Widest ratio the engine may reach (1 = normal). Default 4.5. */
  maxStretchRatio?: number;
  /** Narrowest ratio the engine may reach (1 = normal). Default 1. */
  minStretchRatio?: number;
  /** Stretch axis. `wdth` only satisfies 'horizontal'. Default 'horizontal'. */
  axis?: 'horizontal' | 'vertical' | 'dual';
}

/** Why Tier 0 declined — lets the dispatcher log/branch precisely. */
export type Tier0DeclineReason =
  | 'no-wdth-axis'
  | 'non-horizontal-axis'
  | 'range-exceeds-axis';

/** ratio → clamped `wdth`/`font-stretch` percentage, bound to one axis. */
export interface WdthMapping {
  readonly axis: WdthAxis;
  /**
   * Map a stretch RATIO (1 = normal) to a `font-stretch` PERCENTAGE, clamped to
   * the designed axis range. `font-stretch` and the numeric `wdth` axis value
   * are the same number by spec, so this doubles as the `font-variation-settings`
   * 'wdth' coordinate.
   */
  toPercent(ratio: number): number;
}

export type Tier0Decision =
  | { readonly supported: true; readonly axis: WdthAxis; readonly mapping: WdthMapping }
  | { readonly supported: false; readonly reason: Tier0DeclineReason };

const DEFAULT_MAX_STRETCH = 4.5;
const DEFAULT_MIN_STRETCH = 1;

/** Build the ratio→percentage mapping for a given `wdth` axis (spec units). */
export function createWdthMapping(axis: WdthAxis): WdthMapping {
  return {
    axis,
    toPercent(ratio: number): number {
      const pct = ratio * 100;
      // clamp into the designed axis range — never drive beyond what exists.
      if (pct < axis.min) return axis.min;
      if (pct > axis.max) return axis.max;
      return pct;
    },
  };
}

/**
 * Decide whether Tier 0 can honor `cfg` for a font whose `wdth` axis is `axis`
 * (or null when the font has none). Cheap, pure, total.
 */
export function probeTier0(
  axis: WdthAxis | null | undefined,
  cfg: StretchRangeConfig = {},
): Tier0Decision {
  if (!axis) return { supported: false, reason: 'no-wdth-axis' };

  // `wdth` is horizontal by definition; vertical/dual requests can't use it.
  const requestedAxis = cfg.axis ?? 'horizontal';
  if (requestedAxis !== 'horizontal') {
    return { supported: false, reason: 'non-horizontal-axis' };
  }

  const maxRatio = cfg.maxStretchRatio ?? DEFAULT_MAX_STRETCH;
  const minRatio = cfg.minStretchRatio ?? DEFAULT_MIN_STRETCH;
  const axisMaxRatio = axis.max / 100;
  const axisMinRatio = axis.min / 100;

  // The full requested range must fit inside the designed axis range.
  // A tiny epsilon absorbs float noise on clean values (e.g. 125/100 = 1.25).
  const EPS = 1e-9;
  if (maxRatio > axisMaxRatio + EPS || minRatio < axisMinRatio - EPS) {
    return { supported: false, reason: 'range-exceeds-axis' };
  }

  return { supported: true, axis, mapping: createWdthMapping(axis) };
}

/**
 * Runtime feature check (browser only): does the engine support
 * `font-stretch: <percentage>`? Kept OUT of the pure probe so `probeTier0`
 * stays Node-testable; the dispatcher calls this alongside the probe. Returns
 * true when `CSS.supports` is unavailable (assume support rather than
 * needlessly declining).
 */
export function cssSupportsFontStretchPercentage(): boolean {
  const css = (globalThis as { CSS?: { supports?(p: string, v: string): boolean } }).CSS;
  if (!css || typeof css.supports !== 'function') return true;
  return css.supports('font-stretch', '150%');
}
