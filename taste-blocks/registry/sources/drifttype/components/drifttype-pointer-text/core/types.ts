// ---- Geometry primitives ----

export interface Point {
  x: number;
  y: number;
}

// ---- Bezier path representation ----

/** A moveto command — starts a new subpath */
export interface MoveToSegment {
  type: 'M';
  to: Point;
}

/** A cubic bezier: two control points + endpoint */
export interface CubicSegment {
  type: 'C';
  cp1: Point;
  cp2: Point;
  to: Point;
}

/** A quadratic bezier: one control point + endpoint */
export interface QuadraticSegment {
  type: 'Q';
  cp: Point;
  to: Point;
}

/** A straight line segment */
export interface LineSegment {
  type: 'L';
  to: Point;
}

export type PathSegment = MoveToSegment | CubicSegment | QuadraticSegment | LineSegment;

/** A parsed path — just the segments, no string form */
export interface ParsedPath {
  segments: PathSegment[];
}

// ---- Font / character measurement ----

/**
 * Character metrics provided by the caller. The layout engine is pure —
 * it doesn't measure text itself. The caller (or a renderer-side helper)
 * supplies these measurements.
 */
export interface CharMetrics {
  /** Advance width of the character */
  width: number;
  /** Height of the character (ascent + descent) */
  height: number;
}

/**
 * A function that returns metrics for a character at a given index.
 * This is how the layout engine stays pure — measurement is injected.
 */
export type MeasureFn = (char: string, index: number) => CharMetrics;

// ---- Layout output ----

/** A single character positioned in 2D space */
export interface GlyphLayout {
  /** The character */
  char: string;
  /** Index in the original string */
  index: number;
  /** Position on the path (center of the character baseline) */
  position: Point;
  /** Rotation in radians, following the path tangent */
  angle: number;
  /** The metrics used for this character */
  metrics: CharMetrics;
}

/** Full result of a path layout computation */
export interface PathLayoutResult {
  /** Per-character layout data */
  glyphs: GlyphLayout[];
  /** The original text */
  text: string;
  /** Total arc length consumed by the text */
  textLength: number;
  /** Total arc length of the path */
  pathLength: number;
}

// ---- Path layout options ----

export interface PathLayoutOptions {
  /** SVG path data string (e.g. "M 0 0 C 100 0 200 100 300 100") */
  path: string;
  /**
   * Font shorthand, e.g. "16px Inter".
   * Used by renderers to derive a MeasureFn — the core engine
   * accepts a MeasureFn directly when you call computePathLayout.
   */
  font: string;
  /** Letter-spacing multiplier. 1 = normal, 1.2 = 20% wider. Default 1. */
  spacing?: number;
  /** Offset along the path to start placing text. Default 0. */
  startOffset?: number;
  /** How to align text when it's shorter than the path */
  align?: 'start' | 'center' | 'end';
}

// ---- Pointer-reactive layout ----

export type PointerMode = 'repel' | 'attract' | 'orbit';

export interface PointerLayoutOptions {
  font: string;
  mode: PointerMode;
  /** Effect radius in pixels. Default 100. */
  radius?: number;
  /** Strength of the effect, 0–1. Default 0.5. */
  strength?: number;
}

/** A single character in the pointer-reactive layout */
export interface PointerGlyphState {
  char: string;
  index: number;
  /** Base position (where it sits with no pointer influence) */
  base: Point;
  /** Current displaced position */
  position: Point;
  /** Current rotation in radians */
  angle: number;
  /** Velocity for spring physics */
  velocity: Point;
  metrics: CharMetrics;
}

/** Snapshot of the full pointer-reactive layout state */
export interface PointerLayoutState {
  glyphs: PointerGlyphState[];
  text: string;
  pointer: Point | null;
  mode: PointerMode;
}
