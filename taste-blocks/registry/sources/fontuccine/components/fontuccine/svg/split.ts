/**
 * svg/split.ts — the EXACT SVG-tier geometry (RESEARCH §3 Tier 2,
 * refs/examples/05-svg-tier.mjs).
 *
 * Two phases, cleanly separated:
 *
 *  STATIC (once per glyph, on prepare):  `splitGlyph`
 *    Split every outline segment at each slice boundary it crosses so that each
 *    resulting sub-segment lies entirely within ONE slice. Splitting depends
 *    only on the ORIGINAL-space slice grid (bounds + slice count) — NOT on the
 *    stretch amount — so it is computed once and reused for every frame.
 *
 *  PER FRAME (in the ticker RENDER phase):  `remapContours` / `contoursToPathData`
 *    Map each pre-split sub-segment through the current frame's remap and
 *    serialize to an SVG `d`. Because the remap is piecewise AFFINE (linear
 *    within a slice), a sub-segment that lives in one slice is remapped EXACTLY
 *    by applying that slice's single affine map to its control points — Bézier
 *    curves are affine-invariant. `test/svg-exactness.test.ts` proves this.
 *
 * EXACTNESS SUBTLETY (why we do NOT call `remap.remap()` per control point):
 *    A Bézier's control points can lie OUTSIDE the on-curve x-range (convex
 *    hull ⊇ curve), so a sub-segment whose *curve* stays inside slice i can
 *    still have a control point whose x falls in slice i±1. `remap.remap()` is
 *    piecewise and would map that stray control point with the WRONG slice's
 *    affine, distorting the curve. Instead we pick the slice from the
 *    sub-segment's on-curve midpoint and apply THAT slice's affine *extension*
 *    (valid for all x) to every control point. The two agree on-curve (where
 *    the remap is sampled/tested) but only the single-affine form is exact for
 *    the control polygon. This is the correctness refinement over the literal
 *    `serializeStretched` sketch in 05-svg-tier.mjs.
 *
 * ROOT-FINDING: boundary crossings are found by CLOSED-FORM axis-root solving
 * (quadratic/Cardano) + Newton polish, then split with the frozen de Casteljau
 * (`splitSegment` from core geometry). The 05 sketch reached for bezier-js
 * `.intersects(line)`, but that numeric routine empirically DROPS crossings on
 * near-flat quadratics (e.g. Georgia 'S'), leaving a sub-segment spanning a
 * slice and breaking exactness — so we solve analytically instead.
 */
import type { PathCommand, Bounds1D, Remap } from '../core/types';
import type { Segment, Point } from '../core/geometry/segments';
import { commandsToContours, evalSegment, splitSegment as deCasteljau } from '../core/geometry/segments';

/** A contour of sub-segments, each guaranteed to lie within one x-slice. */
export type SplitContour = Segment[];

const EPS = 1e-7;

/** Interior slice boundaries in ORIGINAL space (endpoints excluded). */
export function interiorBoundaries(bounds: Bounds1D, slices: number): number[] {
  const w = (bounds.max - bounds.min) / slices;
  const out: number[] = [];
  for (let i = 1; i < slices; i++) out.push(bounds.min + i * w);
  return out;
}

// ── closed-form axis-root solving ────────────────────────────────────────────
// We split at every t where the segment's x(t) equals a slice boundary. Doing
// this analytically (not via a numeric curve/line intersection) is exact and
// finds ALL crossings — including the near-flat quadratics that a generic
// intersection routine drops, which would leave a sub-segment spanning a slice
// and break the affine-per-slice exactness proof.

function realQuadRoots(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < 1e-12) return Math.abs(b) < 1e-12 ? [] : [-c / b];
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const sq = Math.sqrt(disc);
  return [(-b + sq) / (2 * a), (-b - sq) / (2 * a)];
}

/** Real roots of A t³ + B t² + C t + D = 0 (degrades to quadratic if A≈0). */
function realCubicRoots(A: number, B: number, C: number, D: number): number[] {
  if (Math.abs(A) < 1e-12) return realQuadRoots(B, C, D);
  const b = B / A;
  const c = C / A;
  const d = D / A;
  // depressed cubic  x = t + b/3  →  t³ + p t + q = 0
  const p = c - (b * b) / 3;
  const q = (2 * b * b * b) / 27 - (b * c) / 3 + d;
  const shift = b / 3;
  const disc = (q * q) / 4 + (p * p * p) / 27;
  const roots: number[] = [];
  if (disc > 1e-14) {
    const sq = Math.sqrt(disc);
    const u = Math.cbrt(-q / 2 + sq);
    const v = Math.cbrt(-q / 2 - sq);
    roots.push(u + v - shift);
  } else if (disc < -1e-14) {
    const r = Math.sqrt(-(p * p * p) / 27);
    const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
    const m = 2 * Math.cbrt(r);
    roots.push(m * Math.cos(phi / 3) - shift);
    roots.push(m * Math.cos((phi + 2 * Math.PI) / 3) - shift);
    roots.push(m * Math.cos((phi + 4 * Math.PI) / 3) - shift);
  } else {
    // disc ≈ 0 → multiple root
    const u = Math.cbrt(-q / 2);
    roots.push(2 * u - shift, -u - shift);
  }
  return roots;
}

/** t-values in (0,1) where seg.x(t) === bound, Newton-polished for precision. */
function axisCrossings(seg: Segment, bound: number): number[] {
  let raw: number[];
  if (seg.type === 'L') {
    const dx = seg.p1.x - seg.p0.x;
    raw = Math.abs(dx) < 1e-12 ? [] : [(bound - seg.p0.x) / dx];
  } else if (seg.type === 'Q') {
    const { p0, p1, p2 } = seg;
    // x(t) = a t² + b t + c
    const a = p0.x - 2 * p1.x + p2.x;
    const b = 2 * (p1.x - p0.x);
    raw = realQuadRoots(a, b, p0.x - bound);
  } else {
    const { p0, p1, p2, p3 } = seg;
    const A = -p0.x + 3 * p1.x - 3 * p2.x + p3.x;
    const B = 3 * p0.x - 6 * p1.x + 3 * p2.x;
    const C = -3 * p0.x + 3 * p1.x;
    raw = realCubicRoots(A, B, C, p0.x - bound);
  }
  const out: number[] = [];
  for (let t of raw) {
    if (!Number.isFinite(t)) continue;
    // polish against x(t) - bound using the exact analytic derivative
    for (let it = 0; it < 3; it++) {
      const e = evalSegment(seg, t);
      const f = e.x - bound;
      if (Math.abs(e.tx) < 1e-12) break;
      t -= f / e.tx;
    }
    if (t > EPS && t < 1 - EPS) out.push(t);
  }
  return out;
}

/** Split one segment at every slice boundary it crosses (frozen de Casteljau). */
function splitSegment(seg: Segment, boundaries: number[]): Segment[] {
  const ts: number[] = [];
  for (const bound of boundaries) {
    for (const t of axisCrossings(seg, bound)) ts.push(t);
  }
  ts.sort((a, z) => a - z);

  const out: Segment[] = [];
  let rest = seg;
  let consumed = 0;
  for (const t of ts) {
    if (t <= consumed + EPS) continue; // duplicate / already consumed
    const local = (t - consumed) / (1 - consumed);
    if (local <= EPS || local >= 1 - EPS) continue;
    const { left, right } = deCasteljau(rest, local);
    out.push(left);
    rest = right;
    consumed = t;
  }
  out.push(rest);
  return out;
}

/**
 * STATIC: split a glyph's outline against its own slice grid.
 * `bounds` and `slices` MUST match the analysis profile the frame remap is
 * built from (profile.length === slices, profile bounds === bounds), so the
 * split boundaries and the remap boundaries coincide exactly.
 */
export function splitGlyph(commands: PathCommand[], bounds: Bounds1D, slices: number): SplitContour[] {
  const boundaries = interiorBoundaries(bounds, slices);
  const contours = commandsToContours(commands);
  const out: SplitContour[] = [];
  for (const segs of contours) {
    const pieces: Segment[] = [];
    for (const seg of segs) {
      for (const p of splitSegment(seg, boundaries)) pieces.push(p);
    }
    if (pieces.length) out.push(pieces);
  }
  return out;
}

/**
 * Build the affine map for the slice a sub-segment belongs to.
 * `x'(x) = penX + sb[i] + (x - boundaries[i]) * (w + e[i]) / w`, which equals
 * `remap.remap(x)` (offset by penX) for x within slice i, and extends it to
 * all x (the exactness requirement above). Slice index is chosen from the
 * on-curve midpoint so stray control points cannot mis-select it.
 */
function sliceAffineForSegment(
  seg: Segment,
  remap: Remap,
  penX: number,
): (x: number) => number {
  const { boundaries, stretchedBoundaries: sb, extras: e, sliceWidth: w } = remap;
  const N = e.length;
  const min = boundaries[0];
  const W = boundaries[N] - min;
  const mid = evalSegment(seg, 0.5).x;
  let i = Math.floor(((mid - min) / W) * N);
  if (i < 0) i = 0;
  else if (i >= N) i = N - 1;
  const slope = (w + e[i]) / w;
  const base = penX + sb[i];
  const bnd = boundaries[i];
  return (x: number) => base + (x - bnd) * slope;
}

/**
 * PER FRAME: map pre-split contours through the frame remap (+ pen offset).
 * Horizontal axis only: x is remapped, y is identity. Returns numeric
 * remapped segments (no formatting) — the exactness test consumes these.
 */
export function remapContours(
  contours: SplitContour[],
  remap: Remap,
  penX = 0,
): SplitContour[] {
  const out: SplitContour[] = [];
  for (const segs of contours) {
    const mapped: Segment[] = [];
    for (const seg of segs) {
      const rx = sliceAffineForSegment(seg, remap, penX);
      switch (seg.type) {
        case 'L':
          mapped.push({ type: 'L', p0: { x: rx(seg.p0.x), y: seg.p0.y }, p1: { x: rx(seg.p1.x), y: seg.p1.y } });
          break;
        case 'Q':
          mapped.push({
            type: 'Q',
            p0: { x: rx(seg.p0.x), y: seg.p0.y },
            p1: { x: rx(seg.p1.x), y: seg.p1.y },
            p2: { x: rx(seg.p2.x), y: seg.p2.y },
          });
          break;
        case 'C':
          mapped.push({
            type: 'C',
            p0: { x: rx(seg.p0.x), y: seg.p0.y },
            p1: { x: rx(seg.p1.x), y: seg.p1.y },
            p2: { x: rx(seg.p2.x), y: seg.p2.y },
            p3: { x: rx(seg.p3.x), y: seg.p3.y },
          });
          break;
      }
    }
    out.push(mapped);
  }
  return out;
}

const num = (v: number, p: number): string => {
  const s = v.toFixed(p);
  return s === `-${(0).toFixed(p)}` ? (0).toFixed(p) : s; // avoid "-0.00"
};

/** Serialize remapped contours to an SVG path `d` string. */
export function contoursToPathData(contours: SplitContour[], precision = 3): string {
  const f = (p: Point): string => `${num(p.x, precision)},${num(p.y, precision)}`;
  let d = '';
  for (const segs of contours) {
    if (!segs.length) continue;
    segs.forEach((seg, i) => {
      if (i === 0) d += `M${f(seg.p0)}`;
      if (seg.type === 'L') d += `L${f(seg.p1)}`;
      else if (seg.type === 'Q') d += `Q${f(seg.p1)} ${f(seg.p2)}`;
      else d += `C${f(seg.p1)} ${f(seg.p2)} ${f(seg.p3)}`;
    });
    d += 'Z';
  }
  return d;
}

/** Convenience: remap + serialize in one call (per-frame render helper). */
export function serializeGlyph(
  contours: SplitContour[],
  remap: Remap,
  penX = 0,
  precision = 3,
): string {
  return contoursToPathData(remapContours(contours, remap, penX), precision);
}
