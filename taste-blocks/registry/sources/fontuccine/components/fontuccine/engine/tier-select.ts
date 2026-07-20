/**
 * engine/tier-select.ts — PURE, Node-testable `tier:'auto'` dispatch + explicit
 * tier fall-through. No DOM, no font, no side effects: the engine gathers the
 * capability flags (WebGL2 probe, VF probe, reduced-motion/print, compression)
 * and this decides the renderer.
 *
 * Dispatch order (RESEARCH §3, §3.1 — locked by the Phase-5 task):
 *   1. WebGL2 + MSDF is PRIMARY when WebGL2 is present and the run is not
 *      reduced-motion / print / effective-compression.
 *   2. VF (`wdth`) is OPPORTUNISTIC — chosen only when WebGL2 is unavailable AND
 *      `probeTier0(...).supported` AND CSS `font-stretch:%` is supported.
 *   3. SVG is the fallback for no-WebGL, reduced-motion, print, opt-in vector
 *      fidelity (explicit `tier:'svg'`), and effective compression
 *      (`minStretchRatio < 1`) — WebGL clamps <1 to identity (§3.1) and VF cannot
 *      compress past `axis.min`, so only the exact-vector SVG tier compresses.
 *
 * Explicit `tier:'webgl'|'svg'|'vf'` forces that tier; if a forced tier DECLINES
 * (WebGL2 absent, or VF unusable on this font/range) the selector falls through
 * to the auto order and records a note (CLAUDE.md rule 9: surfaced to the caller
 * via `instance.notes`).
 */

export type Tier = 'auto' | 'webgl' | 'svg' | 'vf';
export type ResolvedTier = 'webgl' | 'svg' | 'vf';

/** Capability flags the selector reads (all resolved by the engine up front). */
export interface TierCaps {
  /** WebGL2 present per the gl/capability probe. */
  webgl2: boolean;
  /**
   * VF is usable: `probeTier0(...).supported` AND the runtime supports
   * `font-stretch:<percentage>` (`cssSupportsFontStretchPercentage()`).
   */
  vfSupported: boolean;
  /** Reduced-motion is active AND honored (`respectReducedMotion`). */
  reducedMotion: boolean;
  /** Print context (`@media print`). */
  print: boolean;
  /** Effective compression requested (`minStretchRatio < 1`). */
  compression: boolean;
}

export interface TierDecision {
  tier: ResolvedTier;
  /** Human-readable trail of why (fall-through reasons, forced declines). */
  notes: string[];
}

/** The auto order, factored out so forced tiers can fall through to it. */
function auto(caps: TierCaps, notes: string[]): ResolvedTier {
  if (caps.reducedMotion) {
    notes.push('reduced-motion → SVG (static, exact vectors; no per-frame work)');
    return 'svg';
  }
  if (caps.print) {
    notes.push('print → SVG (static exact vectors)');
    return 'svg';
  }
  if (caps.compression) {
    notes.push(
      'minStretchRatio<1 (compression) → SVG (WebGL clamps <1 to identity per §3.1; ' +
        'VF cannot compress past axis.min)',
    );
    return 'svg';
  }
  if (caps.webgl2) return 'webgl';
  if (caps.vfSupported) {
    notes.push('no WebGL2 → VF (opportunistic wdth tier)');
    return 'vf';
  }
  notes.push('no WebGL2 and no usable VF → SVG fallback');
  return 'svg';
}

export function selectTier(requested: Tier, caps: TierCaps): TierDecision {
  const notes: string[] = [];
  switch (requested) {
    case 'webgl':
      if (caps.webgl2) return { tier: 'webgl', notes };
      notes.push("forced tier 'webgl' unavailable (no WebGL2) → falling through to auto order");
      return { tier: auto(caps, notes), notes };
    case 'vf':
      if (caps.vfSupported) return { tier: 'vf', notes };
      notes.push(
        "forced tier 'vf' declined (font exposes no usable wdth axis for the requested " +
          'range, or CSS font-stretch:% unsupported) → falling through to auto order',
      );
      return { tier: auto(caps, notes), notes };
    case 'svg':
      // SVG is always available (pure vectors); it is also the vector-fidelity opt-in.
      return { tier: 'svg', notes };
    case 'auto':
    default:
      return { tier: auto(caps, notes), notes };
  }
}
