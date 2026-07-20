/**
 * engine/glyphs.ts — turn a run of text + a loaded font into the per-glyph
 * static render inputs shared by the SVG and WebGL tiers (`SvgGlyph`/`WebglGlyph`
 * have the identical shape). Analysis is STATIC per glyph (CLAUDE.md rule 1): it
 * runs once through the AnalysisClient (worker off-thread, or the inline
 * fallback) and is cached there.
 */
import type { AnalysisClient } from '../worker/client';
import type { AnalyzeParams } from '../core/types';
import type { LoadedFont } from './font-load';

/** Shared static render input (⊇ SvgGlyph and WebglGlyph). */
export interface RenderGlyph {
  char: string;
  commands: import('../core/types').PathCommand[];
  flex: Float32Array;
  bounds: import('../core/types').Bounds1D;
  advanceWidth: number;
  bbox: import('../core/types').BBox;
  kernBefore: number;
}

function isBlank(ch: string): boolean {
  return /\s/.test(ch);
}

/**
 * Build one RenderGlyph per character of `text`. Blank glyphs (spaces) carry
 * their advance but no ink (empty commands, all-stretchy flex so slice counts
 * stay uniform across the run). Unmapped/zero-outline non-blank glyphs are
 * skipped. Kerning is read pairwise from the font in glyph units.
 */
export async function buildGlyphs(
  font: LoadedFont,
  text: string,
  client: AnalysisClient,
  params: Pick<AnalyzeParams, 'slices' | 'k'>,
  unitsPerEm: number,
): Promise<RenderGlyph[]> {
  const chars = Array.from(text);
  const out: RenderGlyph[] = [];
  let prev: string | null = null;

  for (const ch of chars) {
    const g = font.parsed.glyph(ch);
    const kernBefore = prev ? font.parsed.kernPair(prev, ch) : 0;

    if (!g) {
      if (isBlank(ch)) {
        const advanceWidth = font.advanceOf ? font.advanceOf(ch) : unitsPerEm * 0.25;
        out.push({
          char: ch,
          commands: [],
          flex: new Float32Array(params.slices).fill(1),
          bounds: { min: 0, max: 0 },
          advanceWidth,
          bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
          kernBefore,
        });
      }
      // non-blank unmapped glyph: nothing to render, still advance the cursor
      prev = ch;
      continue;
    }

    const res = await client.analyze({
      glyphId: ch,
      commands: g.commands,
      advanceWidth: g.advanceWidth,
      axes: ['x'],
      params,
    });
    const px = res.profiles.x;
    if (!px) {
      prev = ch;
      continue;
    }
    out.push({
      char: ch,
      commands: g.commands,
      flex: px.flex,
      bounds: px.bounds,
      advanceWidth: res.advanceWidth,
      bbox: res.bbox,
      kernBefore,
    });
    prev = ch;
  }

  return out;
}
