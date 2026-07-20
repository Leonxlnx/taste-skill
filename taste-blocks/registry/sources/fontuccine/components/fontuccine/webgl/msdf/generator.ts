/**
 * webgl/msdf/generator.ts — runtime MULTI-CHANNEL signed distance field builder
 * for ARBITRARY outline fonts (troika-class), the Tier-1 analog of the static
 * flex analysis. Runs OFF the main thread (worker.ts) and NEVER per frame
 * (CLAUDE.md rule 1); results are cached + LRU-evicted by the atlas.
 *
 * ── Why MSDF (3-channel), not single-channel SDF ──
 * A single-channel SDF stores distance-to-nearest-edge, so a sharp corner
 * becomes the max/min of two edges → a rounded arc (RESEARCH §2: "single-channel
 * SDF rounds corners — unacceptable"). MSDF (Chlumsky/msdfgen) colours edges so
 * that at a corner the two edges live in DIFFERENT channels; the per-pixel
 * MEDIAN of the three channels reconstructs the corner as the intersection of
 * the two edge half-planes → sharp at any magnification. The fragment shader
 * takes `median(r,g,b)` exactly (refs/examples/04).
 *
 * ── Generation approach chosen: pure-TS msdfgen-style field ──
 * JUSTIFICATION (state-and-justify, global 3D rule): the workload is per-pixel
 * nearest-edge distance over a handful of edges — pure scalar math, no GPU, no
 * native/wasm binary. A wasm-msdfgen dependency would add a binary asset + build
 * step (contra "no pre-baked assets, any font"); a GPU jump-flood needs a live
 * GL context in the worker and multi-channel JFA is more complex than the exact
 * analytic distance. A self-contained TS generator is any-font, worker-safe,
 * dependency-free, and — crucially — Node-TESTABLE without a GPU (field range,
 * median sign vs winding, corner preservation vs single-channel). It reuses the
 * FROZEN core geometry (`commandsToContours`, `evalSegment`) and winding
 * (`WindingIndex`) — no forking.
 */
import type { PathCommand, BBox } from '../../core/types';
import type { Segment } from '../../core/geometry/segments';
import { commandsToContours, evalSegment } from '../../core/geometry/segments';
import { WindingIndex } from '../../core/winding';

// Channel bit masks. Secondary colours each carry exactly two channels so that
// consecutive runs around a corner share exactly one channel.
const R = 1, G = 2, B = 4, WHITE = 7;
const YELLOW = R | G; // 3
const CYAN = G | B; // 6
const MAGENTA = R | B; // 5
const PALETTE = [YELLOW, CYAN, MAGENTA];

export interface ColoredEdge {
  seg: Segment;
  mask: number; // channel bitmask
}

export interface MSDFOptions {
  /** Glyph bbox in font units (from analysis / opentype). */
  bbox: BBox;
  /** Pixels per em (raster size). Cell is sized from bbox·scale + padding. */
  fontSize: number;
  /** Font units per em (opentype getPath size). Default 1000. */
  unitsPerEm?: number;
  /** Distance range in TEXELS (msdfgen `-pxrange`). Default 4. */
  pxRange?: number;
  /** Padding texels around the glyph (≥ pxRange/2 so the field isn't clipped). Default = ceil(pxRange/2)+1. */
  padding?: number;
  /** Corner angle threshold in degrees; junctions sharper than this get coloured. Default 3. */
  cornerThresholdDeg?: number;
  /** Single-channel mode (all edges WHITE) — for the corner-rounding comparison test. */
  singleChannel?: boolean;
}

export interface MSDFBitmap {
  /** RGBA8, row-major, top-left origin. length = width*height*4 (A=255). */
  data: Uint8ClampedArray;
  width: number;
  height: number;
  /** Distance range in texels (goes to the shader as u_pxRange). */
  pxRange: number;
  /** Padding texels used (for UV rect derivation). */
  padding: number;
  /** Scale font-units → texels. */
  scale: number;
  /** Glyph bbox echoed back. */
  bbox: BBox;
}

// ── edge coloring ────────────────────────────────────────────────────────────

function unit(x: number, y: number): [number, number] {
  const l = Math.hypot(x, y);
  return l > 1e-12 ? [x / l, y / l] : [0, 0];
}

/** Is the junction between edge `a` (its end) and `b` (its start) a corner? */
function isCorner(a: Segment, b: Segment, cosThreshold: number): boolean {
  const ta = evalSegment(a, 1);
  const tb = evalSegment(b, 0);
  const [ax, ay] = unit(ta.tx, ta.ty);
  const [bx, by] = unit(tb.tx, tb.ty);
  const dot = ax * bx + ay * by;
  const cross = ax * by - ay * bx;
  // corner if direction turns more than the threshold (either sign)
  return dot < cosThreshold || Math.abs(cross) > Math.sin(Math.acos(Math.max(-1, Math.min(1, cosThreshold))));
}

/**
 * Colour a glyph's edges (msdfgen "simple" scheme): split each contour into
 * runs at its corners and cycle run colours through the two-channel palette so
 * adjacent runs share exactly one channel. Smooth loops (no corners) stay WHITE.
 */
export function colorEdges(
  commands: PathCommand[],
  cornerThresholdDeg = 3,
  singleChannel = false,
): ColoredEdge[] {
  const contours = commandsToContours(commands);
  const cosT = Math.cos((cornerThresholdDeg * Math.PI) / 180);
  const out: ColoredEdge[] = [];

  for (const segs of contours) {
    const n = segs.length;
    if (n === 0) continue;
    if (singleChannel) {
      for (const seg of segs) out.push({ seg, mask: WHITE });
      continue;
    }

    // Corner flags at the START of each edge (junction from previous edge).
    const cornerAt: boolean[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const prev = segs[(i - 1 + n) % n];
      cornerAt[i] = isCorner(prev, segs[i], cosT);
    }
    const cornerCount = cornerAt.filter(Boolean).length;

    if (cornerCount === 0) {
      // Fully smooth contour (e.g. 'O'): single-channel-equivalent is correct.
      for (const seg of segs) out.push({ seg, mask: WHITE });
      continue;
    }

    // Rotate so index 0 begins a run (starts at a corner) for stable coloring.
    let start = 0;
    for (let i = 0; i < n; i++) if (cornerAt[i]) { start = i; break; }

    let run = 0;
    for (let s = 0; s < n; s++) {
      const i = (start + s) % n;
      if (s > 0 && cornerAt[i]) run++;
      out.push({ seg: segs[i], mask: PALETTE[run % PALETTE.length] });
    }
  }
  return out;
}

// ── per-edge signed distance ─────────────────────────────────────────────────

/** Nearest parameter t∈[0,1] on a segment to point (px,py): coarse scan + refine. */
function nearestT(seg: Segment, px: number, py: number): number {
  if (seg.type === 'L') {
    const dx = seg.p1.x - seg.p0.x;
    const dy = seg.p1.y - seg.p0.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-18) return 0;
    let t = ((px - seg.p0.x) * dx + (py - seg.p0.y) * dy) / len2;
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }
  // Curves: coarse scan then parabolic/bisection refine on squared distance.
  const K = 24;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i <= K; i++) {
    const t = i / K;
    const p = evalSegment(seg, t);
    const d = (p.x - px) ** 2 + (p.y - py) ** 2;
    if (d < bestD) { bestD = d; bestT = t; }
  }
  // refine with a few golden-section-ish bisections around bestT
  let lo = Math.max(0, bestT - 1 / K);
  let hi = Math.min(1, bestT + 1 / K);
  for (let it = 0; it < 20; it++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const p1 = evalSegment(seg, m1);
    const p2 = evalSegment(seg, m2);
    const d1 = (p1.x - px) ** 2 + (p1.y - py) ** 2;
    const d2 = (p2.x - px) ** 2 + (p2.y - py) ** 2;
    if (d1 < d2) hi = m2; else lo = m1;
  }
  return (lo + hi) / 2;
}

interface EdgeDist {
  /** |true distance| to the segment (for nearest-edge selection). */
  abs: number;
  /** signed PERPENDICULAR (pseudo) distance to the edge's tangent line at the nearest point. */
  pseudo: number;
  /** orthogonality (1 = perpendicular hit, →0 = grazing endpoint) — tie-break. */
  ortho: number;
}

function edgeDistance(seg: Segment, px: number, py: number): EdgeDist {
  const t = nearestT(seg, px, py);
  const e = evalSegment(seg, t);
  const dpx = px - e.x;
  const dpy = py - e.y;
  const abs = Math.hypot(dpx, dpy);
  const [ux, uy] = unit(e.tx, e.ty);
  // signed perpendicular distance to the tangent line (extends past endpoints
  // → linear field that reconstructs corners when channels are combined).
  const pseudo = ux * dpy - uy * dpx;
  // orthogonality: how perpendicular the hit is (1 at interior, small at grazing).
  const ortho = abs > 1e-9 ? Math.abs((ux * dpy - uy * dpx) / abs) : 1;
  return { abs, pseudo, ortho };
}

/** Signed pseudo-distance for one channel = winner (min |true dist|) among its edges. */
function channelDistance(edges: ColoredEdge[], channelBit: number, px: number, py: number): number {
  let best: EdgeDist | null = null;
  for (const ce of edges) {
    if ((ce.mask & channelBit) === 0) continue;
    const d = edgeDistance(ce.seg, px, py);
    if (
      best === null ||
      d.abs < best.abs - 1e-6 ||
      (Math.abs(d.abs - best.abs) <= 1e-6 && d.ortho > best.ortho)
    ) {
      best = d;
    }
  }
  return best ? best.pseudo : 0;
}

/**
 * TRUE (clamped Euclidean) unsigned min-distance to any edge — the field a
 * SINGLE-channel SDF stores. At a convex corner this equals the distance to the
 * VERTEX, so the iso-contour rounds off. Used only for `singleChannel` mode as
 * the honest rounding baseline the MSDF path is compared against.
 */
function minTrueDistance(edges: ColoredEdge[], px: number, py: number): number {
  let m = Infinity;
  for (const ce of edges) {
    const d = edgeDistance(ce.seg, px, py).abs;
    if (d < m) m = d;
  }
  return Number.isFinite(m) ? m : 0;
}

// ── bitmap generation ────────────────────────────────────────────────────────

export function generateMSDF(commands: PathCommand[], options: MSDFOptions): MSDFBitmap {
  const upm = options.unitsPerEm ?? 1000;
  const pxRange = options.pxRange ?? 4;
  const scale = options.fontSize / upm;
  const pad = options.padding ?? Math.ceil(pxRange / 2) + 1;
  const { bbox } = options;

  const glyphW = Math.max(1e-3, bbox.maxX - bbox.minX);
  const glyphH = Math.max(1e-3, bbox.maxY - bbox.minY);
  const width = Math.max(1, Math.ceil(glyphW * scale) + 2 * pad);
  const height = Math.max(1, Math.ceil(glyphH * scale) + 2 * pad);

  const edges = colorEdges(commands, options.cornerThresholdDeg ?? 3, options.singleChannel ?? false);
  const rangeGlyph = pxRange / scale; // distance range in font units

  // Winding index resolves the GLOBAL sign (inside → positive) so the per-edge
  // cross-sign convention (which depends on contour orientation) is corrected
  // uniformly across all three channels — this does NOT flatten the per-channel
  // magnitudes that reconstruct corners.
  const contours = commandsToContours(commands);
  const rings = contours.map((segs) => segs.map((s) => [s.p0.x, s.p0.y] as [number, number]));
  const windingIdx = new WindingIndex(rings);

  const data = new Uint8ClampedArray(width * height * 4);

  // pixel (i,j) → glyph coords. Image is y-down; glyph y is up, so invert row.
  const toGlyphX = (i: number): number => bbox.minX + (i + 0.5 - pad) / scale;
  const toGlyphY = (j: number): number => bbox.maxY - (j + 0.5 - pad) / scale;

  // Determine global orientation sign by agreement with winding over a sample.
  let agree = 0;
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 8));
  for (let j = 0; j < height; j += sampleStep) {
    for (let i = 0; i < width; i += sampleStep) {
      const gx = toGlyphX(i);
      const gy = toGlyphY(j);
      const r = channelDistance(edges, R, gx, gy);
      const g = channelDistance(edges, G, gx, gy);
      const b = channelDistance(edges, B, gx, gy);
      const med = median3(r, g, b);
      const inside = windingIdx.inside(gx, gy);
      // want sign(med)>0 when inside
      if ((med > 0) === inside) agree++;
      else agree--;
    }
  }
  const orient = agree >= 0 ? 1 : -1;

  const single = options.singleChannel ?? false;

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const gx = toGlyphX(i);
      const gy = toGlyphY(j);
      const o = (j * width + i) * 4;
      if (single) {
        // Honest single-channel SDF: sign from winding, magnitude = TRUE min
        // distance (rounds at corners). All channels equal ⇒ median = itself.
        const signed = (windingIdx.inside(gx, gy) ? 1 : -1) * minTrueDistance(edges, gx, gy);
        const v = encode(signed, rangeGlyph);
        data[o + 0] = v;
        data[o + 1] = v;
        data[o + 2] = v;
      } else {
        const r = orient * channelDistance(edges, R, gx, gy);
        const g = orient * channelDistance(edges, G, gx, gy);
        const b = orient * channelDistance(edges, B, gx, gy);
        data[o + 0] = encode(r, rangeGlyph);
        data[o + 1] = encode(g, rangeGlyph);
        data[o + 2] = encode(b, rangeGlyph);
      }
      data[o + 3] = 255;
    }
  }

  return { data, width, height, pxRange, padding: pad, scale, bbox };
}

/** msdfgen median of three channels (matches the fragment shader). */
export function median3(a: number, b: number, c: number): number {
  return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}

/** signed distance (font units) → [0,255], 0.5·255 at the edge (msdfgen encoding). */
function encode(signed: number, rangeGlyph: number): number {
  const v = 0.5 + signed / rangeGlyph;
  return Math.round(Math.max(0, Math.min(1, v)) * 255);
}
