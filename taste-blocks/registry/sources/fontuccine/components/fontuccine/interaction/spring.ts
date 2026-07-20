/**
 * spring.ts — critically-damped spring, frame-rate independent (R6).
 *
 * Integrated ANALYTICALLY (closed-form damped-harmonic-oscillator solution),
 * not with Euler steps, so it is exact at any timestep and cannot explode when
 * a backgrounded tab resumes with a huge dt. dt is still clamped as a second
 * guard against pathological gaps.
 *
 * Default damping is derived as critical (ζ = 1 ⇒ damping = 2√stiffness), so
 * the default spring never overshoots. Supplying a smaller `damping` makes it
 * underdamped (intentional overshoot, per README `physics`); a larger one makes
 * it overdamped. All three regimes use the correct analytic solution.
 */

/**
 * Common smoothing interface shared by the spring and the cubic-bezier smoother
 * so the controller can swap `physics` ⇄ `easingCurve` transparently.
 */
export interface Smoother {
  set(target: number): void;
  step(dt: number): void;
  snap(value: number): void;
  readonly value: number;
  readonly velocity: number;
  readonly target: number;
  readonly settled: boolean;
}

export interface SpringOptions {
  stiffness?: number;
  /** Omit for critical damping (2√stiffness). Smaller = overshoot. */
  damping?: number;
  initial?: number;
  /** Max integration step in seconds (tab-switch guard). Default 0.064. */
  maxDt?: number;
  restDisplacement?: number;
  restVelocity?: number;
}

export interface Spring extends Smoother {}

export function createSpring(opts: SpringOptions = {}): Spring {
  const stiffness = opts.stiffness ?? 170;
  const omega0 = Math.sqrt(Math.max(0, stiffness));
  const damping = opts.damping ?? 2 * omega0; // critical by default
  const zeta = omega0 > 0 ? damping / (2 * omega0) : 1;
  const maxDt = opts.maxDt ?? 0.064;
  const restD = opts.restDisplacement ?? 1e-3;
  const restV = opts.restVelocity ?? 1e-3;

  let x = opts.initial ?? 0;
  let v = 0;
  let target = x;

  function step(dtRaw: number): void {
    if (!(dtRaw > 0)) return;
    const dt = dtRaw > maxDt ? maxDt : dtRaw;
    if (omega0 <= 0) {
      x = target;
      v = 0;
      return;
    }

    const d0 = x - target; // displacement from target
    const v0 = v;
    let d: number;
    let vv: number;

    if (zeta < 1 - 1e-6) {
      // Underdamped.
      const wd = omega0 * Math.sqrt(1 - zeta * zeta);
      const e = Math.exp(-zeta * omega0 * dt);
      const c = Math.cos(wd * dt);
      const s = Math.sin(wd * dt);
      const A = d0;
      const B = (v0 + zeta * omega0 * d0) / wd;
      d = e * (A * c + B * s);
      vv = e * ((B * wd - zeta * omega0 * A) * c - (A * wd + zeta * omega0 * B) * s);
    } else if (zeta > 1 + 1e-6) {
      // Overdamped.
      const r = omega0 * Math.sqrt(zeta * zeta - 1);
      const r1 = -zeta * omega0 + r;
      const r2 = -zeta * omega0 - r;
      const c2 = (v0 - r1 * d0) / (r2 - r1);
      const c1 = d0 - c2;
      const e1 = Math.exp(r1 * dt);
      const e2 = Math.exp(r2 * dt);
      d = c1 * e1 + c2 * e2;
      vv = c1 * r1 * e1 + c2 * r2 * e2;
    } else {
      // Critically damped.
      const e = Math.exp(-omega0 * dt);
      const c1 = d0;
      const c2 = v0 + omega0 * d0;
      d = (c1 + c2 * dt) * e;
      vv = (c2 - omega0 * (c1 + c2 * dt)) * e;
    }

    x = target + d;
    v = vv;
  }

  return {
    set(t) {
      target = t;
    },
    step,
    snap(value) {
      x = value;
      v = 0;
      target = value;
    },
    get value() {
      return x;
    },
    get velocity() {
      return v;
    },
    get target() {
      return target;
    },
    get settled() {
      return Math.abs(x - target) <= restD && Math.abs(v) <= restV;
    },
  };
}
