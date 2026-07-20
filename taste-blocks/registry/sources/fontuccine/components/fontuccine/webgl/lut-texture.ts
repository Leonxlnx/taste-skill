/**
 * webgl/lut-texture.ts — pack per-glyph cumulative-flex LUTs into ONE texture.
 *
 * RESEARCH §2 / obligation "zero rebinds mid-draw": every glyph's LUT lives on
 * its own ROW of a single (width × glyphCount) R32F texture; the glyph's row
 * index is an instanced attribute, so a whole run draws with the LUT texture
 * bound ONCE. The data is stretch-INDEPENDENT (see parity.ts), so this texture
 * is uploaded once at build and again only on context-restore — never per frame.
 *
 * Storage: R32F, single channel (the LUT is a scalar field 0→1). WebGL2 samples
 * R32F with `texelFetch` (NEAREST) in core — no float-linear extension needed —
 * and the vertex shader does its OWN two-tap `mix()`, so we never depend on
 * OES_texture_float_linear. All entries pass the FlexLUT contract (assertLUT).
 *
 * This module is PURE (no GL handle): it produces the Float32Array a caller
 * uploads via texImage2D(gl.R32F, ...). Tested for round-trip + contract.
 */
import type { FlexLUT } from '../core/types';
import { assertLUT } from '../core/lut';

export interface PackedLUTAtlas {
  /** Row-major R32F data, length = width * height. */
  data: Float32Array;
  /** Texels per row = N+1 (LUT entry count). Uniform across glyphs. */
  width: number;
  /** Rows = glyph count. */
  height: number;
}

/**
 * Pack cumulative-flex LUTs (one per glyph) into a single row-major buffer.
 * Every LUT MUST share the same length (uniform slice count) and satisfy the
 * FlexLUT contract. Row `g` holds glyph `g`'s LUT.
 */
export function packLUTAtlas(luts: FlexLUT[], validate = true): PackedLUTAtlas {
  if (luts.length === 0) {
    return { data: new Float32Array(0), width: 0, height: 0 };
  }
  const width = luts[0].length;
  if (width < 2) throw new RangeError(`packLUTAtlas: LUT width ${width} < 2`);
  const height = luts.length;
  const data = new Float32Array(width * height);
  for (let g = 0; g < height; g++) {
    const lut = luts[g];
    if (lut.length !== width) {
      throw new RangeError(
        `packLUTAtlas: LUT ${g} width ${lut.length} ≠ ${width} (slice count must be uniform)`,
      );
    }
    if (validate) assertLUT(lut);
    data.set(lut, g * width);
  }
  return { data, width, height };
}

/** Read back one glyph's LUT row (round-trip / test helper). */
export function unpackLUTRow(atlas: PackedLUTAtlas, glyphIndex: number): Float32Array {
  const { data, width, height } = atlas;
  if (glyphIndex < 0 || glyphIndex >= height) {
    throw new RangeError(`unpackLUTRow: row ${glyphIndex} out of range [0,${height})`);
  }
  return data.slice(glyphIndex * width, (glyphIndex + 1) * width);
}

/** Texel V-coordinate (row center) for a glyph's LUT row — matches texelFetch. */
export function lutRowCoord(glyphIndex: number, height: number): number {
  return height > 0 ? (glyphIndex + 0.5) / height : 0.5;
}
