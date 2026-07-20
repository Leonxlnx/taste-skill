/**
 * font/parser.ts — font parsing behind a swappable interface.
 *
 * opentype.js is the default backend; the FontParser / ParsedFont interfaces
 * let Typr or harfbuzzjs drop in later without touching the analysis core.
 *
 * System-font / CSS-only fallback strategy:
 *   The analysis core needs an outline binary. When no font binary is
 *   obtainable (e.g. a CSS-only web font whose bytes the page can't read),
 *   there is nothing to analyze. Callers should catch FontUnavailableError and
 *   signal TIER DEGRADATION to the renderer layer (rasterize via canvas — the
 *   architect owns that decision). The core NEVER crashes the pipeline for it.
 */
import opentype from 'opentype.js';
import type { Font as OtFont } from 'opentype.js';
import type { PathCommand, BBox } from '../core/types';

export interface ParsedGlyph {
  commands: PathCommand[];
  advanceWidth: number;
  bbox: BBox;
}

export interface ParsedFont {
  /** Glyph for a single character, or null if unmapped/blank. */
  glyph(char: string): ParsedGlyph | null;
  /** Kerning between two characters, in the same units as glyph commands. */
  kernPair(a: string, b: string): number;
  /** Coordinate scale used for emitted commands (= fontSize). */
  unitsPerEm: number;
  name?: string;
}

export interface FontParser {
  parse(buffer: ArrayBuffer, opts?: { fontSize?: number }): ParsedFont;
}

/** Raised when no font binary is available — signals tier degradation. */
export class FontUnavailableError extends Error {
  constructor(message = 'No font binary available for analysis') {
    super(message);
    this.name = 'FontUnavailableError';
  }
}

/**
 * opentype.js-backed parser. Commands are emitted in SVG-down coordinates at
 * `fontSize` units-per-em (default 1000), matching 08-real-font-demo.mjs.
 */
export class OpentypeParser implements FontParser {
  parse(buffer: ArrayBuffer, opts: { fontSize?: number } = {}): ParsedFont {
    if (!buffer || buffer.byteLength === 0) {
      throw new FontUnavailableError('Empty font buffer');
    }
    let font: OtFont;
    try {
      font = opentype.parse(buffer);
    } catch (err) {
      throw new FontUnavailableError(`opentype.js failed to parse font: ${String(err)}`);
    }
    const fontSize = opts.fontSize ?? 1000;
    const scale = fontSize / font.unitsPerEm;

    return {
      unitsPerEm: fontSize,
      name: font.names?.fullName?.en,
      glyph(char: string): ParsedGlyph | null {
        const g = font.charToGlyph(char);
        if (!g) return null;
        const path = g.getPath(0, 0, fontSize);
        if (!path.commands || path.commands.length === 0) return null;
        // Path bbox is already at fontSize scale and in SVG-down space,
        // matching the emitted commands.
        const bb = path.getBoundingBox();
        return {
          commands: path.commands as PathCommand[],
          advanceWidth: (g.advanceWidth ?? 0) * scale,
          bbox: { minX: bb.x1, minY: bb.y1, maxX: bb.x2, maxY: bb.y2 },
        };
      },
      kernPair(a: string, b: string): number {
        const ga = font.charToGlyph(a);
        const gb = font.charToGlyph(b);
        if (!ga || !gb) return 0;
        return (font.getKerningValue(ga, gb) || 0) * scale;
      },
    };
  }
}

/** Convenience factory: parse a buffer with the default (opentype.js) backend. */
export function parseFont(buffer: ArrayBuffer, opts?: { fontSize?: number }): ParsedFont {
  return new OpentypeParser().parse(buffer, opts);
}
