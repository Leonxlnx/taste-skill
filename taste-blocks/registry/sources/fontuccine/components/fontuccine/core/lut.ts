/**
 * lut.ts — buildRemap + the normalized GPU LUT contract.
 *
 * Turns a static flex profile + a per-frame stretch ratio into a monotonic 1D
 * coordinate remap. This is the ONLY math that runs per frame (O(slices)); it
 * is identical across the WebGL, SVG and VF tiers.
 *
 * Compression guard (stretch < 1): rigid slices must never invert. Each slice's
 * shrink is clamped to 99.9% of its width and the deficit is water-filled over
 * slices that still have capacity.
 */
import type { FlexLUT, Remap } from './types';

export interface BuildRemapOptions {
  min: number;
  max: number;
  stretch: number;
}

export function buildRemap(
  flex: Float32Array | number[],
  { min, max, stretch }: BuildRemapOptions,
): Remap {
  const N = flex.length;
  const W = max - min;
  const w = W / N; // original slice width
  const E = W * (stretch - 1); // total extra space (negative = compress)

  let sumF = 0;
  for (let i = 0; i < N; i++) sumF += flex[i];

  // Per-slice extra space.
  const e = new Float64Array(N);
  if (sumF < 1e-9) {
    // Fully rigid glyph → degrade to uniform scaling (Pagurek's observation).
    for (let i = 0; i < N; i++) e[i] = E / N;
  } else {
    for (let i = 0; i < N; i++) e[i] = (E * flex[i]) / sumF;
  }

  // Compression guard: no slice may shrink below 0.1% of its width.
  if (E < 0) {
    const floor = -w * 0.999;
    for (let pass = 0; pass < 4; pass++) {
      let deficit = 0;
      let capacity = 0;
      for (let i = 0; i < N; i++) {
        if (e[i] < floor) {
          deficit += e[i] - floor;
          e[i] = floor;
        } else if (e[i] > floor) {
          capacity += flex[i];
        }
      }
      if (deficit === 0 || capacity < 1e-9) break;
      for (let i = 0; i < N; i++) {
        if (e[i] > floor) e[i] += (deficit * flex[i]) / capacity;
      }
    }
  }

  // Original-space slice boundaries — the SVG tier splits béziers against these.
  const boundaries = new Float64Array(N + 1);
  for (let i = 0; i <= N; i++) boundaries[i] = min + i * w;

  // Stretched cumulative boundaries. Origin anchored at `min`; alignment
  // (center/right growth) is the renderer's concern.
  const sb = new Float64Array(N + 1);
  sb[0] = min;
  for (let i = 0; i < N; i++) sb[i + 1] = sb[i] + w + e[i];

  function remap(x: number): number {
    const u = (x - min) / W; // normalized 0..1
    if (u <= 0) return sb[0] + u * (w + e[0]) * N; // linear extrapolation
    if (u >= 1) return sb[N] + (u - 1) * (w + e[N - 1]) * N;
    const f = u * N;
    const i = Math.min(N - 1, Math.floor(f));
    const t = f - i;
    return sb[i] + t * (w + e[i]);
  }

  function toNormalizedLUT(): FlexLUT {
    const total = sb[N] - sb[0];
    const lut = new Float32Array(N + 1);
    for (let i = 0; i <= N; i++) lut[i] = total === 0 ? i / N : (sb[i] - sb[0]) / total;
    // Guard the endpoints against float drift so assertLUT is exact.
    lut[0] = 0;
    lut[N] = 1;
    return lut;
  }

  return { remap, boundaries, stretchedBoundaries: sb, extras: e, sliceWidth: w, toNormalizedLUT };
}

/**
 * Assert the FlexLUT contract: Float32Array length ≥ 2, lut[0]===0,
 * lut[last]===1 (±tol), monotonic non-decreasing. Throws on violation.
 */
export function assertLUT(lut: FlexLUT, tol = 1e-6): void {
  if (!(lut instanceof Float32Array)) {
    throw new TypeError('FlexLUT must be a Float32Array');
  }
  if (lut.length < 2) {
    throw new RangeError(`FlexLUT must have length ≥ 2 (got ${lut.length})`);
  }
  if (Math.abs(lut[0] - 0) > tol) {
    throw new RangeError(`FlexLUT[0] must be 0 (got ${lut[0]})`);
  }
  const last = lut.length - 1;
  if (Math.abs(lut[last] - 1) > tol) {
    throw new RangeError(`FlexLUT[N] must be 1 (got ${lut[last]})`);
  }
  for (let i = 1; i < lut.length; i++) {
    if (lut[i] < lut[i - 1] - tol) {
      throw new RangeError(
        `FlexLUT not monotonic at ${i}: ${lut[i - 1]} → ${lut[i]} (fold-over is GPU-unsafe)`,
      );
    }
  }
}
