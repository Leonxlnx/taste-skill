/**
 * stimuli/types.ts — the shared stimulus contract.
 *
 * A stimulus turns raw input into a normalized signal read by the controller
 * in the UPDATE phase. Semantics of `value` differ per stimulus (documented on
 * each factory) and the controller maps it per `trigger`:
 *   - scroll-velocity → signed px/s (mapped via `velocityToStretch`)
 *   - mouse-proximity → 0..1 proximity
 *   - hover           → 0 | 1 target
 *
 * R3 (critical): raw event handlers record input ONLY — never read layout.
 * Derivation happens in a ticker phase. R4: rects are cached and invalidated by
 * ResizeObserver + scroll delta, measured in the READ phase.
 */
import type { Ticker } from '../ticker';

export interface Stimulus {
  /** Normalized signal; meaning is stimulus-specific (see each factory). */
  readonly value: number;
  /** Wire DOM listeners + ticker phases. Idempotent-safe. */
  attach(ticker: Ticker): void;
  /** Remove listeners, observers and ticker subscriptions. */
  detach(): void;
}

/** Minimal structural rect source (an Element, or a test double). */
export interface RectSource {
  getBoundingClientRect(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

/** Structural disposable for injected observers. */
export interface Disposable {
  observe(target: unknown): void;
  disconnect(): void;
}

/** Current-time source in milliseconds (injectable for deterministic tests). */
export type NowMs = () => number;

export function defaultNow(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
