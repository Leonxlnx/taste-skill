/**
 * geometry/segments.ts — segment evaluation, command→contour conversion,
 * and de Casteljau splitting.
 *
 * A "segment" carries explicit endpoints so it can be evaluated and split
 * without walking the command list.
 */
import type { PathCommand } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface LineSeg {
  type: 'L';
  p0: Point;
  p1: Point;
}
export interface QuadSeg {
  type: 'Q';
  p0: Point;
  p1: Point;
  p2: Point;
}
export interface CubicSeg {
  type: 'C';
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}
export type Segment = LineSeg | QuadSeg | CubicSeg;

export interface PointTangent {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

/** Evaluate point and (unnormalized) tangent of one segment at t ∈ [0,1]. */
export function evalSegment(seg: Segment, t: number): PointTangent {
  const p0 = seg.p0;
  switch (seg.type) {
    case 'L': {
      const dx = seg.p1.x - p0.x;
      const dy = seg.p1.y - p0.y;
      return { x: p0.x + t * dx, y: p0.y + t * dy, tx: dx, ty: dy };
    }
    case 'Q': {
      const { p1, p2 } = seg;
      const mt = 1 - t;
      return {
        x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
        y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
        tx: 2 * mt * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
        ty: 2 * mt * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
      };
    }
    case 'C': {
      const { p1, p2, p3 } = seg;
      const mt = 1 - t;
      return {
        x: mt ** 3 * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t ** 3 * p3.x,
        y: mt ** 3 * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t ** 3 * p3.y,
        tx: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
        ty: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
      };
    }
  }
}

/** Convert an opentype-style command list into contours of segments. */
export function commandsToContours(commands: PathCommand[]): Segment[][] {
  const contours: Segment[][] = [];
  let segs: Segment[] = [];
  let cur: Point | null = null;
  let start: Point | null = null;

  for (const c of commands) {
    switch (c.type) {
      case 'M':
        if (segs.length) {
          contours.push(segs);
          segs = [];
        }
        cur = { x: c.x ?? 0, y: c.y ?? 0 };
        start = cur;
        break;
      case 'L':
        if (cur) segs.push({ type: 'L', p0: cur, p1: { x: c.x ?? 0, y: c.y ?? 0 } });
        cur = { x: c.x ?? 0, y: c.y ?? 0 };
        break;
      case 'Q':
        if (cur) {
          segs.push({
            type: 'Q',
            p0: cur,
            p1: { x: c.x1 ?? 0, y: c.y1 ?? 0 },
            p2: { x: c.x ?? 0, y: c.y ?? 0 },
          });
        }
        cur = { x: c.x ?? 0, y: c.y ?? 0 };
        break;
      case 'C':
        if (cur) {
          segs.push({
            type: 'C',
            p0: cur,
            p1: { x: c.x1 ?? 0, y: c.y1 ?? 0 },
            p2: { x: c.x2 ?? 0, y: c.y2 ?? 0 },
            p3: { x: c.x ?? 0, y: c.y ?? 0 },
          });
        }
        cur = { x: c.x ?? 0, y: c.y ?? 0 };
        break;
      case 'Z':
        if (cur && start && (cur.x !== start.x || cur.y !== start.y)) {
          segs.push({ type: 'L', p0: cur, p1: start });
        }
        if (segs.length) {
          contours.push(segs);
          segs = [];
        }
        cur = start;
        break;
    }
  }
  if (segs.length) contours.push(segs);
  return contours;
}

const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/**
 * de Casteljau split at t → { left, right } segments of the same degree.
 * Useful for the SVG tier (split at slice boundaries → affine-per-slice remap).
 */
export function splitSegment(seg: Segment, t: number): { left: Segment; right: Segment } {
  switch (seg.type) {
    case 'L': {
      const m = lerp(seg.p0, seg.p1, t);
      return {
        left: { type: 'L', p0: seg.p0, p1: m },
        right: { type: 'L', p0: m, p1: seg.p1 },
      };
    }
    case 'Q': {
      const a = lerp(seg.p0, seg.p1, t);
      const b = lerp(seg.p1, seg.p2, t);
      const m = lerp(a, b, t);
      return {
        left: { type: 'Q', p0: seg.p0, p1: a, p2: m },
        right: { type: 'Q', p0: m, p1: b, p2: seg.p2 },
      };
    }
    case 'C': {
      const a = lerp(seg.p0, seg.p1, t);
      const b = lerp(seg.p1, seg.p2, t);
      const c = lerp(seg.p2, seg.p3, t);
      const d = lerp(a, b, t);
      const e = lerp(b, c, t);
      const m = lerp(d, e, t);
      return {
        left: { type: 'C', p0: seg.p0, p1: a, p2: d, p3: m },
        right: { type: 'C', p0: m, p1: e, p2: c, p3: seg.p3 },
      };
    }
  }
}
