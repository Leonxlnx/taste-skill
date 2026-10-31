// tasteskill / colour-deal — deal a restrained palette: one ground, one ink, one accent.
//
// Measured on professional and award sites: most pages stand on white, an off-white or a near-black,
// use one chromatic hue (often none beyond the action) and rarely put whole sections on colour. Generated
// pages do the opposite (pink ground, lime button, yellow cards). This deals the restrained kind most of
// the time, in OKLCH so lightness and contrast are under control, and checks contrast before it returns.
import { colourFamily } from './rules.mjs';

const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(fromLin);
}
function inGamut(rgb) { return rgb.every((v) => v >= -0.0005 && v <= 1.0005); }
// reduce chroma until the colour exists in sRGB
function oklch(L, C, h) { let c = C; let rgb = oklchToRgb(L, c, h); while (!inGamut(rgb) && c > 0) { c = Math.max(0, c - 0.004); rgb = oklchToRgb(L, c, h); } return rgb; }
const hex = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
const lum = (h) => { const n = [1, 3, 5].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255)); return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2]; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// a hex colour back to OKLCH (the surface's step is measured in OKLab lightness)
function toOklch(h) {
  const [r, g, b] = [1, 3, 5].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}
const isHex = (x) => /^#[0-9a-f]{6}$/i.test(x || '');
// the violet family by the inspector's test (rules.mjs colourFamily, palette-purple), on the colour's HSL
function violet(h) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return false;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn), hue = 60 * (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4);
  return colourFamily({ h: Math.round(hue), s, l }) === 'ai-purple';
}

// --muted at 4.5:1 on the ground and the surface, the inspector's line for running text: a grey that misses steps away
// from both in its own hue, in OKLab lightness (an HSL step from a grey on a mid teal field went the wrong way and fell
// back to the ink), else it is the ink. The deal runs it before it returns; a library palette needs it once its surface
// is firmed and offViolet has turned its colours.
export function readableMuted(p) {
  if (!isHex(p?.muted) || !isHex(p?.bg)) return p;
  const ok = (x) => [p.bg, p.surface].filter(isHex).every((g) => contrast(x, g) >= 4.5);
  if (ok(p.muted)) return p;
  const [L, C, h] = toOklch(p.muted), up = L >= toOklch(p.bg)[0];
  let muted = p.ink;
  for (let k = 1; k <= 40 && muted === p.ink; k++) { const x = hex(oklch(L + (up ? 0.01 : -0.01) * k, C, h)); if (ok(x)) muted = x; }
  return { ...p, muted, note: String(p.note || '').split(p.muted).join(muted), ...(p.checks ? { checks: { ...p.checks, mutedOnBg: +contrast(muted, p.bg).toFixed(1) } } : {}) };
}

// The surface is a real step from the ground, in OKLab lightness (review-006: #ebebeb on #f7f7f7 is 3.6 points, and with
// the mint and sand panels a notch off their grounds every card, nav panel and footer read as a faint box). On swatch
// pages of twelve grounds a panel reads at once in a screenshot from 6 points on a light or coloured ground and 7.5 on
// a dark one; past about 9 (11 on dark) it turns into a grey slab or a second colour. The deal stays between. Near
// black OKLab overstates a step (#0d0d0d on #000000 is 16 points at 1.08:1), so the surface also clears 1.15:1.
const STEP = { light: [0.065, 0.085], dark: [0.08, 0.105] };
const SURFACE_FLOOR = { light: 0.06, dark: 0.075, contrast: 1.15 };
// the surface at step s, taken on in half points until it clears the contrast floor
function firm(bg, s, at) { let x = at(s); for (let k = 0; k < 40 && contrast(bg, x) < SURFACE_FLOOR.contrast; k++) x = at((s += 0.005)); return x; }
// A studied palette's surface taken to the same floor (55 of the 56 in library/palettes.json step under 6 points, the
// median 3.6): it keeps its side of the ground, its hue and its strength and moves to the lower end of the deal's step;
// a step already past the floor stays as the palette has it. In draw.mjs it runs first, then offViolet, then
// readableMuted, which steps --muted to the new surface.
export function firmSurface(p) {
  if (!isHex(p?.bg) || !isHex(p?.surface)) return p;
  const [L] = toOklch(p.bg), [sL, sC, sh] = toOklch(p.surface), dark = L < 0.5;
  if (Math.abs(sL - L) >= SURFACE_FLOOR[dark ? 'dark' : 'light'] && contrast(p.bg, p.surface) >= SURFACE_FLOOR.contrast) return p;
  const st = STEP[dark ? 'dark' : 'light'][0];
  let dir = Math.sign(sL - L) || (dark ? 1 : -1), h = sh;
  if (L + dir * st > 1 || L + dir * st < 0.04) dir = -dir;
  const at = (d) => firm(p.bg, st, (s) => hex(oklch(L + d * s, sC, h)));
  // (a dark ground with a darker surface that cannot clear the floor below it takes it above; a blue taken darker that
  // turns violet, #0d0094 on ultramarine, turns toward cyan at its own lightness, as the deal's grounds do)
  let surface = at(dir);
  if (contrast(p.bg, surface) < SURFACE_FLOOR.contrast) surface = at((dir = -dir));
  while (violet(surface) && !violet(p.bg) && h > 200) { h -= 5; surface = at(dir); }
  return { ...p, surface };
}

// grounds: [id, weight, light?, L range, C range, words]
const GROUNDS = [
  ['white', 20, true, [1, 1], [0, 0], 'White'],
  ['off-white', 22, true, [0.965, 0.985], [0.004, 0.014], 'Off-white'],
  ['stone', 10, true, [0.9, 0.935], [0.005, 0.018], 'Stone'],
  ['pale-tint', 5, true, [0.92, 0.955], [0.025, 0.05], 'Pale'],
  ['near-black', 18, false, [0.16, 0.2], [0.004, 0.016], 'Near-black'],
  ['black', 7, false, [0.11, 0.135], [0, 0.006], 'Black'],
  ['deep', 8, false, [0.2, 0.28], [0.02, 0.045], 'Deep'],
  ['field', 2, true, [0.62, 0.8], [0.1, 0.16], 'Coloured'],
];
// accent hues in OKLCH degrees; violet and indigo (about 265-315) are never dealt
const HUES = [
  ['blue', 255, 3], ['cobalt', 263, 1.6], ['red', 27, 2.4], ['vermilion', 38, 1.2], ['orange', 55, 1.2], ['yellow', 100, 0.7],
  ['olive', 118, 0.8], ['green', 148, 2.4], ['emerald', 160, 1.2], ['teal', 190, 1.4], ['cyan', 218, 0.7], ['pink', 355, 0.6], ['magenta', 340, 0.3],
];
const TINT_HUES = [['warm', 70], ['sand', 85], ['green', 140], ['cool', 235], ['blue', 255], ['rose', 20], ['neutral', 0]];

export function dealPaletteV25({ rnd, tone, recent = [] }) {
  const wpick = (pairs) => { const t = pairs.reduce((s, x) => s + x[1], 0); let r = rnd() * t; for (const x of pairs) { r -= x[1]; if (r <= 0) return x; } return pairs.at(-1); };
  const range = ([a, b]) => a + rnd() * (b - a);
  const toneW = { quiet: { field: 0.2, 'pale-tint': 0.6, deep: 0.6 }, luxury: { 'near-black': 1.5, black: 1.4, deep: 1.4, field: 0.1, 'pale-tint': 0.5 }, bold: { field: 3, black: 1.4, 'pale-tint': 1.4 }, playful: { field: 3, 'pale-tint': 2 }, technical: { 'near-black': 1.5, black: 1.3, field: 0.2 }, editorial: { 'off-white': 1.4, white: 1.2, field: 0.4 }, warm: { 'off-white': 1.4, stone: 1.4, deep: 1.3, field: 0.6 } }[tone] || {};
  const g = wpick(GROUNDS.map((x) => [x, x[1] * (toneW[x[0]] ?? 1) * (recent.includes(x[0]) ? 0.5 : 1)]))[0];
  const [gid, , light, gL, gC, gWord] = g;
  // the ground's tint: a hue the ground leans toward, not a colour
  const tint = TINT_HUES[Math.floor(rnd() * TINT_HUES.length)];
  const accentHue = wpick(HUES.map((x) => [x, x[2] * (recent.includes(x[0]) ? 0.4 : 1)]))[0];
  let groundHue = gid === 'deep' || gid === 'field' || gid === 'pale-tint' ? (rnd() < 0.6 ? accentHue[1] : tint[1] || 250) : tint[1];
  const bgL = range(gL), bgC = tint[0] === 'neutral' && !['deep', 'field', 'pale-tint'].includes(gid) ? 0 : range(gC);
  // the surface, one real step on the side with room: down from white and off-white, up from a dark ground and from a
  // coloured field (whose ink stays dark), either way from stone and a pale tint (up, it is paler: paper on stone, kept
  // under white). One surface, never a second
  const st = range(light ? STEP.light : STEP.dark);
  const up = gid === 'field' || !light || (['stone', 'pale-tint'].includes(gid) && bgL + st <= 0.985 && rnd() < 0.5);
  const pair = () => { const bg = hex(oklch(bgL, bgC, groundHue)); return [bg, firm(bg, st, (s) => hex(oklch(bgL + (up ? s : -s), up && light && gid !== 'field' ? bgC * 0.5 : bgC, groundHue)))]; };
  // a light blue ground that leans to periwinkle turns toward cyan here, at its own lightness: offViolet in draw.mjs
  // turns it in HSL, which moves the lightness, and closed a cobalt field's step to 4.7 points
  let [bg, surface] = pair();
  while ([bg, surface].some(violet) && groundHue > 200) { groundHue -= 5; [bg, surface] = pair(); }
  // ink and muted carry a trace of the ground's hue so the page holds together (readableMuted steps --muted on to 4.5:1
  // on the ground and the surface)
  const inkC = Math.min(0.02, bgC * 0.8 + 0.004);
  let ink = hex(oklch(light ? range([0.17, 0.24]) : range([0.95, 0.985]), inkC, groundHue));
  const muted = hex(oklch(light ? range([0.44, 0.5]) : range([0.74, 0.8]), inkC, groundHue));
  if (gid === 'field' && contrast(ink, bg) < 7) ink = hex(oklch(0.14, 0.01, groundHue));
  const grounds = [bg, surface];
  // accent: chroma level dealt; vivid is rare. A monochrome page (the ink is the accent) is dealt too.
  // a page on a coloured ground keeps that one hue: its action is set in the ink
  const mono = gid === 'field' || rnd() < (tone === 'luxury' || tone === 'quiet' ? 0.3 : 0.16);
  const chroma = wpick([[['muted', [0.07, 0.1]], 2], [['rich', [0.12, 0.16]], 3], [['vivid', [0.18, 0.23]], tone === 'bold' || tone === 'playful' ? 2 : 0.6]])[0];
  let accent, accentInk, accentWord, fill = false;
  if (mono) { accent = ink; accentInk = bg; accentWord = 'no colour but the ink'; }
  else {
    let aL = light ? range([0.45, 0.6]) : range([0.68, 0.82]);
    if (accentHue[0] === 'yellow') aL = light ? range([0.82, 0.88]) : range([0.86, 0.9]);
    accent = hex(oklch(aL, range(chroma[1]), accentHue[1]));
    // the accent must be visible against the ground and the surface (3:1) to be used as a link, a mark or a button on a
    // card, and carry white or near-black text at 4.5:1. A yellow on a light ground is the exception: it stays yellow as
    // a fill under dark text, never a link or a thin mark (darkened to 3:1 it came out olive, #8f7f0a, as "vivid yellow")
    fill = light && accentHue[0] === 'yellow';
    const reads = () => (fill || grounds.every((g) => contrast(accent, g) >= 3)) && Math.max(contrast('#ffffff', accent), contrast('#111111', accent)) >= 4.5;
    let tries = 0; while (!reads() && tries++ < 16) { aL += light ? -0.03 : 0.03; accent = hex(oklch(aL, range(chroma[1]), accentHue[1])); }
    accentInk = contrast('#ffffff', accent) >= 4.5 ? '#ffffff' : hex(oklch(0.16, 0.01, accentHue[1]));
    if (contrast(accentInk, accent) < 4.5) accentInk = contrast('#ffffff', accent) > contrast('#111111', accent) ? '#ffffff' : '#111111';
    accentWord = `${chroma[0]} ${accentHue[0]}`;
  }
  // fields: none or one, and only a band in a colour the page already has: the ink as ground, or on a loud page the
  // accent (never a deep shade of it: a third colour). The page keeps its ground and one surface tone, never a third
  // tone between them (r11-p51 used seven grounds and panels and read as colour sprawl)
  const loud = tone === 'bold' || tone === 'playful';
  const fields = [];
  const nf = wpick([[0, 5], [1, 4]])[0];
  const k = nf ? wpick([['invert', 3], ['accent', loud && !mono ? 2.5 : 0]].filter((x) => x[1] > 0))[0] : null;
  if (k === 'invert') fields.push({ bg: ink, ink: bg, kind: 'the ink as ground' });
  else if (k === 'accent') fields.push({ bg: accent, ink: accentInk, kind: `the ${accentHue[0]} accent` });
  const name = `${gWord}${tint[0] !== 'neutral' && ['off-white', 'stone', 'near-black'].includes(gid) ? ` (${tint[0]})` : ''}, ${mono ? 'ink only' : accentWord}`;
  const checks = { inkOnBg: +contrast(ink, bg).toFixed(1), mutedOnBg: +contrast(muted, bg).toFixed(1), accentInk: +contrast(accentInk, accent).toFixed(1), accentOnBg: +contrast(accent, bg).toFixed(1), surfaceStep: +((toOklch(surface)[0] - toOklch(bg)[0]) * 100).toFixed(1) };
  const note = [
    `${gWord} ground${gid === 'white' ? '' : ` (${bg})`}, ${light ? 'dark' : 'light'} ink, ${mono ? 'and no accent hue: the action is set in the ink, solid' : `one ${accentWord} accent`}.`,
    mono ? 'Colour comes only from the pictures.' : fill ? 'The yellow is a fill with dark text on it, for the primary action and at most one other thing on a screen; links and small marks are set in the ink, since a yellow line does not read on a light ground. It is never a ground for text blocks and never spread across cards.' : 'The accent is for the primary action, links and at most one other thing on a screen; it is never a ground for text blocks, never a second headline colour and never spread across cards.',
    fields.length ? `Two grounds and one band: the page ground and --surface, a clear step from it, and ${fields[0].kind} for one section at most.` : 'Two grounds, no field: the page ground and --surface, a clear step from it; sections are told apart by space, size and pictures.',
    'Every other colour on the page comes from photographs or the product, never from added tints, badges or chips.',
  ].join(' ');
  return readableMuted({ id: `gen:${gid}:${accentHue[0]}:${mono ? 'mono' : chroma[0]}`, name, generated: true, ground: gid, hue: mono ? null : accentHue[0], tags: [light ? 'light' : 'dark', gid], bg, surface, ink, muted, accent, accentInk, fields, note, checks });
}
