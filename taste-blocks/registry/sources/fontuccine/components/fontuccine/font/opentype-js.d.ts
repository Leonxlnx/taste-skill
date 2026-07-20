/**
 * Minimal ambient types for opentype.js (no @types package shipped).
 * Only the surface the parser uses is declared.
 */
declare module 'opentype.js' {
  export interface PathCommandLike {
    type: 'M' | 'L' | 'Q' | 'C' | 'Z';
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }
  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
  export interface Path {
    commands: PathCommandLike[];
    getBoundingBox(): BoundingBox;
  }
  export interface Glyph {
    advanceWidth?: number;
    getPath(x: number, y: number, fontSize: number): Path;
  }
  export interface Font {
    unitsPerEm: number;
    names?: { fullName?: { en?: string } };
    charToGlyph(char: string): Glyph;
    getKerningValue(left: Glyph, right: Glyph): number;
  }
  export function parse(buffer: ArrayBuffer): Font;
  const _default: { parse(buffer: ArrayBuffer): Font };
  export default _default;
}
