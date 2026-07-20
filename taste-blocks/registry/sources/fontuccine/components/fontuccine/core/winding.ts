/**
 * winding.ts — nonzero winding number + winding-aware sample filtering.
 *
 * Two jobs:
 *  1. windingNumber() / pointInside(): nonzero-rule containment. Fonts fill
 *     with the nonzero rule (TrueType & CFF); even-odd wrongly treats a
 *     self-overlap as a hole. Nonzero agrees with even-odd on all
 *     non-overlapping contours, so this is a safe upgrade.
 *  2. filterVisibleSamples(): drop boundary samples that sit on INVISIBLE
 *     self-intersection segments (the Playfair Display 'W' case, RESEARCH §5.2).
 *     A visible boundary sample has exactly one side inside the filled shape;
 *     a buried sample (inside an overlap) has BOTH sides inside — its tangent
 *     is not on the real silhouette and would corrupt the flex minima.
 */
import type { BoundarySample } from './types';

type Ring = Array<[number, number]>;

/** isLeft > 0 if p2 is left of the directed line p0→p1. */
function isLeft(p0x: number, p0y: number, p1x: number, p1y: number, px: number, py: number): number {
  return (p1x - p0x) * (py - p0y) - (px - p0x) * (p1y - p0y);
}

/** Nonzero winding number of (x,y) w.r.t. all rings (Dan Sunday's algorithm). */
export function windingNumber(x: number, y: number, rings: Ring[]): number {
  let wn = 0;
  for (const ring of rings) {
    const n = ring.length;
    if (n < 3) continue;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yj <= y) {
        if (yi > y && isLeft(xj, yj, xi, yi, x, y) > 0) wn++;
      } else {
        if (yi <= y && isLeft(xj, yj, xi, yi, x, y) < 0) wn--;
      }
    }
  }
  return wn;
}

/** Nonzero-rule point-in-glyph test. */
export function pointInside(x: number, y: number, rings: Ring[]): boolean {
  return windingNumber(x, y, rings) !== 0;
}

/**
 * y-banded winding index — makes repeated winding queries near-linear.
 *
 * A horizontal-ray winding query at height y is only affected by edges whose
 * vertical span contains y, so bucketing edges by y-band is EXACT (not an
 * approximation): winding() returns the same value as windingNumber().
 */
export class WindingIndex {
  private readonly x0: Float64Array;
  private readonly y0: Float64Array;
  private readonly x1: Float64Array;
  private readonly y1: Float64Array;
  private readonly bands: Int32Array[];
  private readonly yMin: number;
  private readonly invBandH: number;
  private readonly B: number;

  constructor(rings: Ring[]) {
    // Collect edges.
    const ax0: number[] = [];
    const ay0: number[] = [];
    const ax1: number[] = [];
    const ay1: number[] = [];
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const ring of rings) {
      const n = ring.length;
      if (n < 3) continue;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        ax0.push(xj);
        ay0.push(yj);
        ax1.push(xi);
        ay1.push(yi);
        if (yi < yMin) yMin = yi;
        if (yj < yMin) yMin = yj;
        if (yi > yMax) yMax = yi;
        if (yj > yMax) yMax = yj;
      }
    }
    const E = ax0.length;
    this.x0 = Float64Array.from(ax0);
    this.y0 = Float64Array.from(ay0);
    this.x1 = Float64Array.from(ax1);
    this.y1 = Float64Array.from(ay1);
    this.yMin = yMin;
    const yh = yMax - yMin;
    this.B = Math.max(1, Math.min(256, Math.round(Math.sqrt(E || 1))));
    this.invBandH = yh > 0 ? this.B / yh : 0;

    // Bucket edges into the y-bands their span covers.
    const lists: number[][] = Array.from({ length: this.B }, () => []);
    for (let e = 0; e < E; e++) {
      const lo = Math.min(this.y0[e], this.y1[e]);
      const hi = Math.max(this.y0[e], this.y1[e]);
      let bLo = this.bandOf(lo);
      let bHi = this.bandOf(hi);
      if (bLo > bHi) {
        const t = bLo;
        bLo = bHi;
        bHi = t;
      }
      for (let b = bLo; b <= bHi; b++) lists[b].push(e);
    }
    this.bands = lists.map((l) => Int32Array.from(l));
  }

  private bandOf(y: number): number {
    const b = Math.floor((y - this.yMin) * this.invBandH);
    return b < 0 ? 0 : b >= this.B ? this.B - 1 : b;
  }

  winding(x: number, y: number): number {
    const band = this.bands[this.bandOf(y)];
    if (!band) return 0;
    let wn = 0;
    for (let idx = 0; idx < band.length; idx++) {
      const e = band[idx];
      const xj = this.x0[e];
      const yj = this.y0[e];
      const xi = this.x1[e];
      const yi = this.y1[e];
      if (yj <= y) {
        if (yi > y && isLeft(xj, yj, xi, yi, x, y) > 0) wn++;
      } else {
        if (yi <= y && isLeft(xj, yj, xi, yi, x, y) < 0) wn--;
      }
    }
    return wn;
  }

  inside(x: number, y: number): boolean {
    return this.winding(x, y) !== 0;
  }
}

/**
 * Keep only samples on the VISIBLE silhouette. A sample is visible when a
 * tiny nudge along its normal lands inside the shape on exactly one side.
 *
 * @param eps  nudge distance in glyph units (defaults to 1e-3 of the bbox diag)
 */
export function filterVisibleSamples(
  samples: BoundarySample[],
  rings: Ring[],
  eps?: number,
): BoundarySample[] {
  if (samples.length === 0) return samples;
  let e = eps ?? 0;
  if (e <= 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of samples) {
      if (s.x < minX) minX = s.x;
      if (s.x > maxX) maxX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.y > maxY) maxY = s.y;
    }
    e = Math.max(1e-4, Math.hypot(maxX - minX, maxY - minY) * 1e-3);
  }
  const index = new WindingIndex(rings);
  const out: BoundarySample[] = [];
  for (const s of samples) {
    // normal = 90° rotation of the unit tangent
    const nx = -s.ty;
    const ny = s.tx;
    const insideA = index.inside(s.x + e * nx, s.y + e * ny);
    const insideB = index.inside(s.x - e * nx, s.y - e * ny);
    if (insideA !== insideB) out.push(s); // exactly one side inside → on silhouette
  }
  // Degenerate guard: if filtering nuked everything (pathological outline),
  // fall back to the unfiltered set rather than returning an empty field.
  return out.length > 0 ? out : samples;
}
