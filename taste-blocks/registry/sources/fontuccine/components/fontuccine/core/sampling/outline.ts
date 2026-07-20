/**
 * sampling/outline.ts — ARC-LENGTH-UNIFORM outline sampling.
 *
 * Upgrade over the reference's t-uniform sampling (01-flex-profile.mjs line 42
 * TODO): samples are spaced by constant arc length along each contour, so
 * curved regions and long straights get proportional coverage — no clustering
 * near cusps, no starvation on long lines. Tangents are analytic (exact).
 *
 * Output shape is unchanged: { samples:[{x,y,tx,ty(unit)}], polygons:[ring...] }.
 */
import type { PathCommand, SampledOutline, BBox } from '../types';
import { commandsToContours, evalSegment } from '../geometry/segments';
import type { Segment } from '../geometry/segments';

const FINE = 16; // sub-steps per segment for the arc-length table

interface FineTable {
  ts: number[]; // parameter at each fine vertex
  cum: number[]; // cumulative arc length at each fine vertex
  length: number;
}

/** Build a cumulative arc-length table for one segment via fine chords. */
function fineTable(seg: Segment): FineTable {
  const ts: number[] = [];
  const cum: number[] = [];
  let prev = evalSegment(seg, 0);
  let acc = 0;
  ts.push(0);
  cum.push(0);
  for (let i = 1; i <= FINE; i++) {
    const t = i / FINE;
    const p = evalSegment(seg, t);
    acc += Math.hypot(p.x - prev.x, p.y - prev.y);
    ts.push(t);
    cum.push(acc);
    prev = p;
  }
  return { ts, cum, length: acc };
}

/** Invert arc length → parameter t within a segment (linear between fine vertices). */
function tAtArc(table: FineTable, d: number): number {
  const { ts, cum } = table;
  if (d <= 0) return 0;
  if (d >= table.length) return 1;
  // linear scan (FINE is small)
  for (let i = 1; i < cum.length; i++) {
    if (cum[i] >= d) {
      const seg = cum[i] - cum[i - 1];
      const frac = seg > 1e-12 ? (d - cum[i - 1]) / seg : 0;
      return ts[i - 1] + frac * (ts[i] - ts[i - 1]);
    }
  }
  return 1;
}

export interface SampleOptions {
  /** Target boundary samples per segment (distributed by arc length). */
  samplesPerSegment?: number;
}

/**
 * Sample an outline into a boundary tangent field + point-in-glyph polygons.
 * Accepts a positional number (ref-compatible) or an options object.
 */
export function sampleOutline(
  commands: PathCommand[],
  opts: number | SampleOptions = 24,
): SampledOutline {
  const samplesPerSegment = typeof opts === 'number' ? opts : opts.samplesPerSegment ?? 24;
  const contours = commandsToContours(commands);
  const samples: SampledOutline['samples'] = [];
  const polygons: SampledOutline['polygons'] = [];

  for (const segs of contours) {
    if (segs.length === 0) continue;
    const tables = segs.map(fineTable);
    let L = 0;
    for (const t of tables) L += t.length;
    if (L <= 1e-9) continue;

    const count = Math.max(8, Math.round(segs.length * samplesPerSegment));
    const spacing = L / count;

    const ring: Array<[number, number]> = [];
    let carry = 0; // arc distance into the current segment before the next sample

    for (let si = 0; si < segs.length; si++) {
      const seg = segs[si];
      const table = tables[si];
      const len = table.length;
      let d = carry;
      while (d < len - 1e-9) {
        const t = tAtArc(table, d);
        const p = evalSegment(seg, t);
        ring.push([p.x, p.y]);
        const l = Math.hypot(p.tx, p.ty);
        if (l > 1e-9) samples.push({ x: p.x, y: p.y, tx: p.tx / l, ty: p.ty / l });
        d += spacing;
      }
      carry = d - len; // leftover distance carried into the next segment
    }

    if (ring.length >= 3) polygons.push(ring);
  }

  return { samples, polygons };
}

/** Axis-aligned bounding box of the sampled boundary. */
export function sampleBounds(outline: SampledOutline): BBox {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of outline.samples) {
    if (s.x < minX) minX = s.x;
    if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  }
  return { minX, maxX, minY, maxY };
}
