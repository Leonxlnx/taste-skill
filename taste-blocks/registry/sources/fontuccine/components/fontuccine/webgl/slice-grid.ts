/**
 * webgl/slice-grid.ts — the SHARED, subdivided per-glyph quad geometry.
 *
 * Every glyph is a quad subdivided into `slices` columns horizontally (×1 row —
 * horizontal axis ONLY, per the phase scope) so the piecewise-linear LUT remap
 * is evaluated at each slice boundary and the geometry bends exactly at the
 * texel boundaries (refs/examples/03 header). Because box coordinates are
 * normalized [0,1]² and IDENTICAL for every glyph, this buffer is built ONCE
 * and drawn with `drawElementsInstanced`; per-glyph data (origin, width, atlas
 * UV rect, LUT row) rides on instanced attributes. Zero per-frame geometry.
 *
 * Grid resolution MUST equal the LUT slice count so remap breakpoints land on
 * vertices — a coarser grid would linearize across a stretch boundary and lose
 * stroke protection; a finer grid is wasted vertices.
 *
 * Atlas UV is NOT baked here: the vertex shader derives it as
 *   uv = a_atlasUVOrigin + a_boxCoord * a_atlasUVSize
 * from the instanced UV rect, keeping UVs "original" (never remapped) exactly as
 * the locked design requires.
 *
 * PURE (no GL). Tested for vertex/index counts, column monotonicity, UV mapping
 * and in-range, consistently-wound triangulation.
 */

export interface SliceGrid {
  /** Interleaved box coords (x,y) ∈ [0,1]², length = (slices+1)*2*2. */
  boxCoords: Float32Array;
  /** Triangle indices (Uint16), length = slices*6. */
  indices: Uint16Array;
  /** Distinct columns = slices+1. */
  columns: number;
  /** Vertices = (slices+1)*2. */
  vertexCount: number;
  /** Slice count this grid was built for. */
  slices: number;
}

/**
 * Build the shared subdivided-quad grid for `slices` columns.
 * Vertex order: column-major, bottom (y=0) then top (y=1) per column.
 *   v(col, row) index = col*2 + row      (row 0 = bottom, 1 = top)
 */
export function buildSliceGrid(slices: number): SliceGrid {
  if (!Number.isInteger(slices) || slices < 1) {
    throw new RangeError(`buildSliceGrid: slices must be a positive integer (got ${slices})`);
  }
  const columns = slices + 1;
  const vertexCount = columns * 2;
  const boxCoords = new Float32Array(vertexCount * 2);

  for (let c = 0; c < columns; c++) {
    const x = c / slices; // 0 → 1, exact at endpoints
    // bottom (y=0)
    boxCoords[(c * 2 + 0) * 2 + 0] = x;
    boxCoords[(c * 2 + 0) * 2 + 1] = 0;
    // top (y=1)
    boxCoords[(c * 2 + 1) * 2 + 0] = x;
    boxCoords[(c * 2 + 1) * 2 + 1] = 1;
  }

  // Two triangles per column between adjacent column pairs.
  const indices = new Uint16Array(slices * 6);
  let k = 0;
  for (let c = 0; c < slices; c++) {
    const b0 = c * 2 + 0; // bottom-left
    const t0 = c * 2 + 1; // top-left
    const b1 = (c + 1) * 2 + 0; // bottom-right
    const t1 = (c + 1) * 2 + 1; // top-right
    // CCW winding in a y-up box: (b0, b1, t1) then (b0, t1, t0)
    indices[k++] = b0;
    indices[k++] = b1;
    indices[k++] = t1;
    indices[k++] = b0;
    indices[k++] = t1;
    indices[k++] = t0;
  }

  return { boxCoords, indices, columns, vertexCount, slices };
}
