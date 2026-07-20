/**
 * types.ts — shared analysis-core types + the worker protocol.
 *
 * All types here are erasable (interfaces / unions only) so Node's native
 * TypeScript type-stripping runs them with no build step.
 */

// ------------------------------------------------------------ outline commands

/** opentype.js-shaped path command. */
export interface PathCommand {
  type: 'M' | 'L' | 'Q' | 'C' | 'Z';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export type Axis = 'x' | 'y';

/** A boundary sample: position + UNIT tangent. */
export interface BoundarySample {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

/** Result of sampling an outline. */
export interface SampledOutline {
  /** Flat boundary samples with unit tangents (the tangent field). */
  samples: BoundarySample[];
  /** Per-contour point rings [x,y][] for winding / point-in-glyph tests. */
  polygons: Array<Array<[number, number]>>;
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 1D bounds along one axis. */
export interface Bounds1D {
  min: number;
  max: number;
}

// --------------------------------------------------------------- LUT contract

/**
 * FlexLUT — THE cross-tier GPU interface.
 *
 * A normalized cumulative remap: a Float32Array of length N+1 where
 *   lut[0]   === 0            (±1e-6)
 *   lut[N]   === 1            (±1e-6)
 *   lut[i+1] >= lut[i]        (monotonic non-decreasing — GPU-safe, no folds)
 *
 * Shader usage:  remapped = mix(lut[i], lut[i+1], fract(u * N));  // u ∈ [0,1]
 *
 * Consumed identically by the WebGL, SVG and VF tiers. Changing this shape is
 * an architect-level decision (see CLAUDE.md hard rule 3).
 */
export type FlexLUT = Float32Array;

/** Return type of buildRemap(). */
export interface Remap {
  /** Map an ORIGINAL axis coordinate to its stretched position. */
  remap: (x: number) => number;
  /**
   * Slice boundaries in ORIGINAL coordinate space: boundaries[i] = min + i*w.
   * The SVG tier splits béziers against these (see refs/examples/05-svg-tier).
   */
  boundaries: Float64Array;
  /**
   * Cumulative slice boundaries in STRETCHED space (boundaries after the
   * remap is applied). Used to prove non-inversion under compression.
   */
  stretchedBoundaries: Float64Array;
  /** Per-slice extra space distributed by the flex profile. */
  extras: Float64Array;
  /** Original slice width (W / N). */
  sliceWidth: number;
  /** Build the normalized GPU LUT (the FlexLUT contract). */
  toNormalizedLUT: () => FlexLUT;
}

// --------------------------------------------------------------- glyph analysis

export interface AxisProfile {
  flex: Float32Array;
  bounds: Bounds1D;
}

export interface GlyphAnalysis {
  glyphId: string;
  advanceWidth: number;
  bbox: BBox;
  profiles: { x?: AxisProfile; y?: AxisProfile };
}

// ------------------------------------------------------------ worker protocol

export interface AnalyzeParams {
  slices: number;
  k: number;
  interiorSamples: number;
  smooth: number;
  samplesPerSegment: number;
}

export interface AnalyzeRequest {
  id: number;
  glyphId: string;
  commands: PathCommand[];
  axes: Axis[];
  params: AnalyzeParams;
  /**
   * Advance width in the same coordinate space as `commands`.
   * (Additive to the spec: AnalyzeResponse.advanceWidth requires a source and
   * the analysis derives geometry only — the caller supplies the metric.)
   */
  advanceWidth: number;
}

export interface AnalyzeResponse {
  id: number;
  glyphId: string;
  advanceWidth: number;
  bbox: BBox;
  profiles: {
    x?: { flex: Float32Array; bounds: Bounds1D };
    y?: { flex: Float32Array; bounds: Bounds1D };
  };
}

export const DEFAULT_PARAMS: AnalyzeParams = {
  slices: 96,
  k: 8,
  interiorSamples: 48,
  smooth: 0.75,
  samplesPerSegment: 24,
};
