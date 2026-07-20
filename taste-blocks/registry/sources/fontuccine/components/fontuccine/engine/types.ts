/**
 * engine/types.ts — the public `Fontuccine.attach` config + instance types.
 *
 * The DOCUMENTED public schema is exactly README.md's "Public API sketch" plus
 * the ONE approved additive field `reserveBasis` (Phase-5 §4). The remaining
 * fields below the divider are ADVANCED / INJECTABLE seams (font source, DI for
 * tests, SSR document) — deliberately NOT part of the documented schema, exactly
 * as `StretchControllerConfig` carries `element`/`ticker`/`stimulus`. They never
 * change the meaning of a documented field.
 */
import type { EffectsConfig, RGBAColor } from '../webgl/types';
import type { WrapMode, ReserveBasis } from '../dom/overlay';
import type { WdthAxis } from '../vf/detect';
import type { ParsedFont } from '../font/parser';
import type { Ticker } from '../interaction/ticker';
import type { AnalysisClient } from '../worker/client';
import type { RenderBackend } from '../webgl/gl/device';
import type { Tier, ResolvedTier } from './tier-select';

export type { Tier, ResolvedTier } from './tier-select';
export type StretchAxis = 'horizontal' | 'vertical' | 'dual';
export type Trigger = 'scroll-velocity' | 'mouse-proximity' | 'hover' | 'custom';

/** A source for the font outline binary (needed by the SVG/WebGL tiers). */
export type FontSource =
  | { url: string }
  | { buffer: ArrayBuffer | ArrayBufferView }
  | { parsed: ParsedFont; wdthAxis?: WdthAxis | null };

export interface FontuccineConfig {
  // ─────────────── documented public schema (README.md) ───────────────
  axis?: StretchAxis;
  trigger?: Trigger;

  maxStretchRatio?: number;
  minStretchRatio?: number;
  /** Pagurek's k (edge protection): high = hard 9-slice, low = uniform. */
  edgeProtection?: number;
  /** Slices per axis (analysis LUT resolution). */
  lutResolution?: number;

  physics?: { stiffness?: number; damping?: number };
  easingCurve?: string;
  easingDuration?: number;
  proximityRadius?: number;
  velocityToStretch?: number;

  tier?: Tier;
  /** Tier-1 (WebGL) only; ignored by the SVG/VF tiers. */
  effects?: EffectsConfig;

  wrap?: WrapMode;
  respectReducedMotion?: boolean;

  /**
   * APPROVED additive field (Phase-5 §4). How `wrap:'reserve'` sizes the box:
   *  - 'tier-capability' (default): each tier reserves what it can actually paint
   *    (SVG/WebGL × maxStretchRatio, VF × axis-max).
   *  - 'uniform': every tier reserves × maxStretchRatio for cross-tier
   *    consistency (VF then leaves a permanent gap).
   */
  reserveBasis?: ReserveBasis;

  // ─────────── advanced / injectable (NOT the documented schema) ───────────
  /** Text to stretch (defaults to the target element's textContent). */
  text?: string;
  /** Ink color (WebGL tier). Default opaque black. */
  color?: RGBAColor;

  /** Font outline source. `fontUrl`/`fontBuffer`/`parsedFont` are conveniences. */
  font?: FontSource;
  fontUrl?: string;
  fontBuffer?: ArrayBuffer | ArrayBufferView;
  parsedFont?: ParsedFont;
  /** Explicit `wdth` axis (skips detection; pairs with `parsedFont`). */
  wdthAxis?: WdthAxis | null;
  /** Font units per em the outlines are emitted in. Default 1000. */
  unitsPerEm?: number;

  /** Shared ticker (defaults to the library singleton). */
  ticker?: Ticker;
  /** SSR / jsdom document (defaults to the target's ownerDocument). */
  document?: Document;
  /** Reuse an AnalysisClient (defaults to a per-instance one). */
  analysisClient?: AnalysisClient;

  /** DI for capability probing (tests). */
  isReducedMotion?: () => boolean;
  isPrint?: () => boolean;
  detectWebGL2Support?: () => boolean;
  /** Injected WebGL backend (tests). */
  backend?: RenderBackend;
}

export interface Instance {
  /** Manual drive for `trigger:'custom'` (clamped to [min,max]). */
  set(value: number): void;
  /** Tear down renderer + controller; restore the DOM. Leaks nothing. */
  destroy(): void;
  /** Selected renderer tier, or null until selection completes. */
  readonly tier: ResolvedTier | null;
  /** Resolves once the renderer is attached (or the build settled/failed). */
  readonly ready: Promise<void>;
  /** Tier-selection + fall-through trail (CLAUDE.md rule 9 transparency). */
  readonly notes: readonly string[];
}
