/**
 * engine/font-load.ts — resolve a font outline source into a ParsedFont + the
 * `wdth` axis, LAZILY.
 *
 * Size discipline (Phase-5 budget): opentype.js and the parser are pulled in via
 * DYNAMIC import here, so they never land in the base `.` bundle — they load only
 * when a font binary must actually be parsed (SVG/WebGL tiers). The VF tier can
 * be selected with just an injected `wdthAxis` and never triggers this path.
 *
 * The frozen `font/parser.ts` is CONSUMED, not modified (CLAUDE.md). It gives us
 * outlines (`.glyph`) and kerning (`.kernPair`); it does not surface `fvar` or
 * blank-glyph advances, so we additionally read those structurally off a raw
 * opentype parse of the SAME bytes (`getWdthAxis`, `advanceOf`). Parsing twice is
 * a one-time, off-hot-path cost.
 */
import type { ParsedFont } from '../font/parser';
import type { WdthAxis } from '../vf/detect';
import { getWdthAxis } from '../vf/detect';
import type { FontSource } from './types';

export interface LoadedFont {
  parsed: ParsedFont;
  wdthAxis: WdthAxis | null;
  /** Advance (font units) for any char, including blanks — undefined when only a
   *  pre-parsed ParsedFont was supplied (no raw font to read blank advances). */
  advanceOf?: (char: string) => number;
}

function toArrayBuffer(view: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (view instanceof ArrayBuffer) return view;
  const v = view as ArrayBufferView;
  return v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) as ArrayBuffer;
}

function resolveSource(cfg: {
  font?: FontSource;
  fontUrl?: string;
  fontBuffer?: ArrayBuffer | ArrayBufferView;
  parsedFont?: ParsedFont;
  wdthAxis?: WdthAxis | null;
}): FontSource | null {
  if (cfg.font) return cfg.font;
  if (cfg.parsedFont) return { parsed: cfg.parsedFont, wdthAxis: cfg.wdthAxis ?? null };
  if (cfg.fontBuffer) return { buffer: cfg.fontBuffer };
  if (cfg.fontUrl) return { url: cfg.fontUrl };
  return null;
}

export async function loadEngineFont(
  cfg: {
    font?: FontSource;
    fontUrl?: string;
    fontBuffer?: ArrayBuffer | ArrayBufferView;
    parsedFont?: ParsedFont;
    wdthAxis?: WdthAxis | null;
    unitsPerEm?: number;
  },
): Promise<LoadedFont> {
  const src = resolveSource(cfg);
  if (!src) {
    throw new Error(
      'fontuccine: no font source. The SVG/WebGL tiers need outlines — pass ' +
        '`fontUrl`, `fontBuffer`, or `parsedFont` in the config.',
    );
  }
  const unitsPerEm = cfg.unitsPerEm ?? 1000;

  // Pre-parsed injection (advanced / tests): no raw bytes to read blanks from.
  if ('parsed' in src) {
    return { parsed: src.parsed, wdthAxis: src.wdthAxis ?? null };
  }

  const buffer =
    'buffer' in src
      ? toArrayBuffer(src.buffer)
      : await fetch(src.url).then((r) => {
          if (!r.ok) throw new Error(`fontuccine: font fetch failed (${r.status}) for ${src.url}`);
          return r.arrayBuffer();
        });

  // Lazy: opentype.js + the parser load ONLY here (dynamic import → own chunk).
  const [{ parseFont }, otMod] = await Promise.all([
    import('../font/parser'),
    import('opentype.js'),
  ]);
  const opentype = (otMod as { default?: unknown }).default ?? otMod;

  const parsed = parseFont(buffer, { fontSize: unitsPerEm });

  // Raw parse for fvar (wdth) + blank-glyph advances (parser omits both).
  let wdthAxis: WdthAxis | null = cfg.wdthAxis ?? null;
  let advanceOf: ((char: string) => number) | undefined;
  try {
    const otFont = (opentype as { parse(b: ArrayBuffer): unknown }).parse(buffer) as {
      unitsPerEm: number;
      tables?: { fvar?: { axes?: Array<{ tag: string; minValue: number; defaultValue: number; maxValue: number }> } };
      charToGlyph(ch: string): { advanceWidth?: number } | null;
    };
    if (wdthAxis === undefined || wdthAxis === null) wdthAxis = getWdthAxis(otFont);
    const scale = unitsPerEm / otFont.unitsPerEm;
    advanceOf = (char: string): number => {
      const g = otFont.charToGlyph(char);
      return (g?.advanceWidth ?? 0) * scale;
    };
  } catch {
    /* fvar/advance extraction is best-effort; outlines already succeeded */
  }

  return { parsed, wdthAxis, ...(advanceOf ? { advanceOf } : {}) };
}
