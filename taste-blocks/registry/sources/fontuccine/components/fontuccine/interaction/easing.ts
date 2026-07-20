/**
 * easing.ts — cubic-bezier parsing + a time-based smoother.
 *
 * README allows `easingCurve: 'cubic-bezier(…)'` as an ALTERNATIVE to spring
 * `physics`. The bezier string is parsed ONCE into an easing function; the
 * smoother tweens current→target over a fixed duration whenever the target
 * changes, exposing the same `Smoother` interface as the spring so the
 * controller can swap them transparently.
 *
 * NOTE (schema): a tween needs a duration. This module defaults to 0.3s and the
 * controller exposes it publicly as `easingDuration` (see README) alongside
 * `easingCurve`.
 */
import type { Smoother } from './spring';

export type EasingFn = (t: number) => number;

const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 12;

function a(a1: number, a2: number): number {
  return 1 - 3 * a2 + 3 * a1;
}
function b(a1: number, a2: number): number {
  return 3 * a2 - 6 * a1;
}
function c(a1: number): number {
  return 3 * a1;
}
/** Horner-form cubic bezier component for control points (a1, a2) at parameter t. */
function calcBezier(t: number, a1: number, a2: number): number {
  return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
}
function getSlope(t: number, a1: number, a2: number): number {
  return 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);
}

/**
 * Build a CSS-equivalent cubic-bezier easing from control points. Maps input
 * progress (x, the time fraction) → output progress (y) via Newton-Raphson
 * with a bisection fallback (the WebKit/`bezier-easing` algorithm).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  if (x1 === y1 && x2 === y2) return (t) => t; // linear shortcut

  function tForX(x: number): number {
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const slope = getSlope(t, x1, x2);
      if (slope === 0) break;
      const xVal = calcBezier(t, x1, x2) - x;
      t -= xVal / slope;
    }
    // Bisection fallback if Newton failed (flat regions).
    let lo = 0;
    let hi = 1;
    if (getSlope(t, x1, x2) >= NEWTON_MIN_SLOPE) return t;
    t = x;
    for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i++) {
      const xVal = calcBezier(t, x1, x2);
      if (Math.abs(xVal - x) < SUBDIVISION_PRECISION) return t;
      if (xVal > x) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return t;
  }

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calcBezier(tForX(x), y1, y2);
  };
}

/** Parse a `cubic-bezier(x1,y1,x2,y2)` string once. Throws on malformed input. */
export function parseCubicBezier(spec: string): EasingFn {
  const m = spec
    .trim()
    .match(/^cubic-bezier\(\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*,\s*([-\d.eE]+)\s*\)$/);
  if (!m) throw new Error(`Invalid cubic-bezier string: ${JSON.stringify(spec)}`);
  const x1 = Number(m[1]);
  const y1 = Number(m[2]);
  const x2 = Number(m[3]);
  const y2 = Number(m[4]);
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
    throw new Error(`cubic-bezier x control points must be in [0,1]: ${spec}`);
  }
  return cubicBezier(x1, y1, x2, y2);
}

export interface BezierSmootherOptions {
  curve: string | EasingFn;
  /** Tween duration in seconds. Default 0.3. */
  duration?: number;
  initial?: number;
}

/** A `Smoother` that tweens toward its target with a cubic-bezier curve. */
export function createBezierSmoother(opts: BezierSmootherOptions): Smoother {
  const ease: EasingFn = typeof opts.curve === 'string' ? parseCubicBezier(opts.curve) : opts.curve;
  const duration = Math.max(1e-3, opts.duration ?? 0.3);

  let value = opts.initial ?? 0;
  let target = value;
  let start = value;
  let elapsed = duration; // start settled

  return {
    set(t) {
      if (t !== target) {
        start = value;
        target = t;
        elapsed = 0;
      }
    },
    step(dt) {
      if (elapsed >= duration) {
        value = target;
        return;
      }
      elapsed = Math.min(duration, elapsed + (dt > 0 ? dt : 0));
      const p = elapsed / duration;
      value = start + (target - start) * ease(p);
    },
    snap(v) {
      value = v;
      target = v;
      start = v;
      elapsed = duration;
    },
    get value() {
      return value;
    },
    get velocity() {
      return 0;
    },
    get target() {
      return target;
    },
    get settled() {
      return elapsed >= duration;
    },
  };
}
