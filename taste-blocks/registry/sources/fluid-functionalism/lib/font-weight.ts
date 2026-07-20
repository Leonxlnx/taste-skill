// Inter (variable) weight tokens for `fontVariationSettings`.
//
// Each weight is paired with an optical-size (`opsz`) value so that animating
// between weights keeps the text's advance width nearly constant: a heavier
// `wght` widens the text, and a tighter (higher) `opsz` pulls it back. The
// opsz values below were measured against the 400/opsz-14 baseline and hold
// the closed→bold width delta to within ~0.6px (≈±0.5%), centered on zero,
// down from ~3px with no compensation. A single opsz value can't zero every
// string (glyph mixes scale differently), so a sub-pixel residual remains.
//
// Setting `opsz` explicitly here overrides `font-optical-sizing: auto`, which
// is intended — we want weight, not font-size, to drive optical size.
export const fontWeights = {
  normal: "'wght' 400, 'opsz' 14",
  medium: "'wght' 450, 'opsz' 15",
  semibold: "'wght' 550, 'opsz' 20",
  bold: "'wght' 700, 'opsz' 25",
} as const;
