/**
 * webgl/types.ts — Tier-1 public-facing config surface + glyph inputs.
 *
 * The `effects` block mirrors README.md EXACTLY (packaging owns the schema; this
 * tier only consumes it — CLAUDE.md: no schema change). All effects are Tier-1
 * only and every one is zero-cost when its scalar is 0 / absent (obligation 3).
 */
import type { Bounds1D, BBox } from '../core/types';
import type { PathCommand } from '../core/types';

/** README `effects.aberration`. */
export interface AberrationConfig {
  /** Max channel-split in px. */
  max: number;
  /** Scale the split by scroll velocity. */
  fromVelocity?: boolean;
}

/** README `effects.displacement`. */
export interface DisplacementConfig {
  /** URL of the noise texture (loaded lazily; disabled until decoded). */
  texture: string;
  /** Warp strength in px. */
  intensity: number;
  /** Noise sampling scale (u,v). Default (1,1). */
  scale?: [number, number];
}

/** README `effects` block (Tier-1 only). */
export interface EffectsConfig {
  /** Film-grain intensity 0..1. */
  grain?: number;
  aberration?: AberrationConfig;
  displacement?: DisplacementConfig;
}

/** One glyph's static render inputs (outline + analysis), matching SvgGlyph. */
export interface WebglGlyph {
  char?: string;
  /** Outline commands in font units. */
  commands: PathCommand[];
  /** Static x-axis flex profile (length === slice count). */
  flex: Float32Array;
  /** Ink bounds along x. */
  bounds: Bounds1D;
  /** Advance width in font units. */
  advanceWidth: number;
  /** Glyph bbox in font units (vertical extent + MSDF raster region). */
  bbox: BBox;
  /** Kerning applied before this glyph (font units, 0 for the first). */
  kernBefore?: number;
}

/** Ink color as straight-alpha RGBA in 0..1 (renderer premultiplies). */
export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
