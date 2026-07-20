/**
 * vf/detect.ts — Tier-0 fvar `wdth` axis detection.
 *
 * Productionizes `getWdthAxis` from refs/examples/07-variable-font-tier.mjs.
 * We read the axis straight out of the parsed `fvar` table — no rendering
 * heuristics. This is PURE (no DOM) and Node-testable against a real VF.
 *
 * NOTE ON UNITS: per the OpenType spec the registered `wdth` axis is expressed
 * as a PERCENTAGE of normal width (default 100, typical range 50–200), which is
 * exactly what CSS `font-stretch: <percentage>` consumes. A minority of legacy
 * GX fonts (e.g. Apple's Skia) instead report `wdth` in a 1.0-based multiplier
 * scale (0.62 / 1 / 1.3). We faithfully return whatever the font declares here;
 * the percentage MAPPING + support decision (probe.ts) is written to the spec
 * convention. The frozen `src/font/parser.ts` does not surface `fvar`, so this
 * module reads it structurally off the opentype.js Font object without touching
 * the parser (CLAUDE.md: frozen surfaces are consumed, not modified).
 */

/** A single fvar axis record as opentype.js exposes it. */
export interface FvarAxisRecord {
  tag: string;
  minValue: number;
  defaultValue: number;
  maxValue: number;
}

/** The minimal structural shape we read off an opentype.js Font for fvar. */
export interface FvarBearingFont {
  tables?: {
    fvar?: {
      axes?: FvarAxisRecord[];
    };
  };
}

/** Designed bounds of the `wdth` axis, in the font's declared axis units. */
export interface WdthAxis {
  readonly min: number;
  readonly default: number;
  readonly max: number;
}

/**
 * Extract the `wdth` axis bounds from a parsed font's `fvar` table.
 * Returns null when the font is not variable or exposes no `wdth` axis.
 */
export function getWdthAxis(font: FvarBearingFont | null | undefined): WdthAxis | null {
  const axes = font?.tables?.fvar?.axes;
  if (!axes || axes.length === 0) return null;
  const wdth = axes.find((a) => a.tag === 'wdth');
  if (!wdth) return null;
  return { min: wdth.minValue, default: wdth.defaultValue, max: wdth.maxValue };
}

/** True when the font is variable and exposes a horizontal-width (`wdth`) axis. */
export function hasWdthAxis(font: FvarBearingFont | null | undefined): boolean {
  return getWdthAxis(font) !== null;
}
