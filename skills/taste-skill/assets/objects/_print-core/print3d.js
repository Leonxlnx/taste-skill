/*
  _print-core/print3d.js - real objects modelled in 3D and printed by an effect.

  Every print-* object is a small signed-distance model (a cup, a wheel, a lamp...) raymarched in a
  fragment shader. Two kinds of picture:
  - render: a studio render of the real thing, its own materials (rubber, alloy, glaze, brass, wood)
    and the page's accent on one part, soft shadows and reflections of a softbox, antialiased edges
    and a fine film grain; what a product page without photographs leads with.
  - a print: the light, shadow and occlusion become one number per pixel, the ink a print would put
    there, printed as ordered dither, a halftone screen, engraved lines that follow the form, or
    monospace type (for a card on a software or tech page).

    pass A (form)  raymarch at a reduced size into a half-float texture. Print: r ink 0..1 (on dark
                   paper the ink is the light), g inside the silhouette, b accent plate, a engraving
                   phase. Render: the colour (sRGB, premultiplied) and its coverage.
    pass B (print) full canvas: dither cells, screen dots, lines or glyphs in the palette, or the
                   render with its grain over the paper

  A shader that fails to compile or link, a GLSL ES reserved word in a shader (glslProblems, checked
  before every compile: CPU-rendered Chrome accepts words a real GPU rejects), no WebGL2, or a first
  frame that comes out empty all leave the poster in place: never an empty ground.

  How a page uses one (README.md beside this file has the whole contract):
    import cup from '<assets>/objects/print-cup/object.js';
    const ctrl = cup.mount(hostEl, { place: 'card' });       // or { params: {...}, palette: {...} }
  The host is an empty element; in a .panel or .frame it fills it (position absolute, inset 0) and
  prints over the panel's dealt ground. mount() adds, inside the host: a still picture (first the
  poster, the object printed ahead of time from fallback.png, shown at once; later the last frame
  drawn), the live canvas while the object holds a context, and a layer that takes the pointer, the
  keyboard and the focus ring; and, for an object that turns by itself, a pause button (.loop-pause)
  in the bottom-right corner of its panel or frame. Without WebGL2 the poster stays.

  Light on a laptop's integrated GPU (see "the context pool" below):
  - all objects of a page share config.maxLive (2) WebGL contexts. An object holds one only while
    something on it moves near the screen (its turn, the pointer, a step); a still object draws once,
    keeps that frame as a 2D picture and frees its context; off screen or in a hidden tab it is freed.
  - the raymarch runs at most one texel per CSS pixel (0.75 x 0.75 once the frame is large, about
    0.48 megapixels at most); dither raymarches one texel per cell and its canvas holds one pixel per
    cell, scaled up crisp; a canvas never passes about 1.5 megapixels. A render at rest is drawn once
    more at up to one texel per canvas pixel (config.fineTexels), so the picture that stays is sharp.
  Under prefers-reduced-motion it shows one still frame, no hover and no pause button, and a click
  takes the step at once.

  An object module:
    import { definePrint } from '../_print-core/print3d.js';
    export default definePrint({ id, name, base: import.meta.url, glsl, pivot, radius, extent, camera,
                                 turn, step, press, params, place, update(state, dt), texture() });
  glsl defines   vec2 map(vec3 p)                       distance, material id (object space, y up,
                                                         the floor at y = 0)
                 void surf(float id, vec3 p, vec3 n, inout Surf s)
                 float floorEmit(vec3 p)                 light the object casts on the floor (#define FLOOR_EMIT)
                 float beam(vec3 ro, vec3 rd, float tEnd) light seen in the air (#define BEAM)
  and may read   u_step (0..1 eased), u_kick (seconds since the last click), u_spin, u_k, u_time,
                 u_aux (the texture() canvas), u_dark (1 on dark paper), u_accent (the accent's rgb 0..1, for an object
                 that puts its accent on a part by its hue), u_pix (a texel's size per unit
                 of distance), u_rot, u_pivot.
*/

const HAS_DOM = typeof window !== 'undefined' && typeof document !== 'undefined';
const reducedQuery = HAS_DOM && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const coarseQuery = HAS_DOM && window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
const DEG = Math.PI / 180;

// the order is the print pass's u_mode
export const EFFECTS = ['dither', 'halftone', 'engrave', 'ascii', 'render'];
// the cell of each effect at cell 0, CSS px: dither cell, screen pitch, line pitch, type height
// (render: the grain's scale)
const CELL = { dither: 2, halftone: 6, engrave: 6.5, ascii: 9, render: 1 };
// device pixels per CSS pixel of the printed canvas, before the canvas cap (config.maxCanvasPx):
// dots, lines and glyphs are drawn smooth, 2 is enough (dither keeps one canvas pixel per cell)
const DPR_CAP = { dither: 3, ascii: 2, halftone: 2, engrave: 2, render: 2 };

/* ------------------------------------------------------------------ GLSL words */

// GLSL ES 3.00 (section 3.7): words reserved for future use, which a conforming compiler rejects as a
// name; plus words later versions made keywords (precise, buffer, shared), which some drivers reject
const GLSL_RESERVED = new Set(('attribute varying coherent volatile restrict readonly writeonly resource atomic_uint ' +
  'noperspective patch sample subroutine common partition active asm class union enum typedef template this goto ' +
  'inline noinline public static extern external interface long short double half fixed unsigned superp input output ' +
  'hvec2 hvec3 hvec4 dvec2 dvec3 dvec4 fvec2 fvec3 fvec4 dmat2 dmat3 dmat4 sampler3DRect filter sizeof cast namespace using ' +
  'precise buffer shared image1D image2D image3D imageCube iimage1D iimage2D iimage3D iimageCube uimage1D uimage2D ' +
  'uimage3D uimageCube image1DArray image2DArray iimage1DArray iimage2DArray uimage1DArray uimage2DArray image1DShadow ' +
  'image2DShadow image1DArrayShadow image2DArrayShadow imageBuffer iimageBuffer uimageBuffer sampler1D sampler1DShadow ' +
  'sampler1DArray sampler1DArrayShadow isampler1D isampler1DArray usampler1D usampler1DArray sampler2DRect ' +
  'sampler2DRectShadow isampler2DRect usampler2DRect samplerBuffer isamplerBuffer usamplerBuffer sampler2DMS ' +
  'isampler2DMS usampler2DMS sampler2DMSArray isampler2DMSArray usampler2DMSArray samplerCubeArray').split(' '));
// qualifiers: keywords, never names (a struct field named flat left a hero empty on a real GPU)
const GLSL_QUALIFIERS = new Set(['flat', 'smooth', 'centroid', 'invariant', 'layout', 'uniform', 'const', 'in', 'out', 'inout', 'lowp', 'mediump', 'highp', 'precision']);
const GLSL_TYPES = new Set(('void bool int uint float vec2 vec3 vec4 bvec2 bvec3 bvec4 ivec2 ivec3 ivec4 uvec2 uvec3 uvec4 mat2 mat3 mat4 ' +
  'mat2x2 mat2x3 mat2x4 mat3x2 mat3x3 mat3x4 mat4x2 mat4x3 mat4x4 sampler2D sampler3D samplerCube sampler2DShadow ' +
  'samplerCubeShadow sampler2DArray sampler2DArrayShadow isampler2D isampler3D isamplerCube isampler2DArray usampler2D ' +
  'usampler3D usamplerCube usampler2DArray').split(' '));
const GLSL_KEYWORDS = new Set([...GLSL_TYPES, ...GLSL_QUALIFIERS, ...'break continue do for while switch case default if else true false discard return struct'.split(' ')]);
// built-in functions: GLSL ES 3.00 forbids redefining them, and a variable of that name hides them
const GLSL_BUILTINS = new Set(('radians degrees sin cos tan asin acos atan sinh cosh tanh asinh acosh atanh pow exp log exp2 log2 ' +
  'sqrt inversesqrt abs sign floor trunc round roundEven ceil fract mod modf min max clamp mix step smoothstep isnan isinf ' +
  'floatBitsToInt floatBitsToUint intBitsToFloat uintBitsToFloat packSnorm2x16 unpackSnorm2x16 packUnorm2x16 ' +
  'unpackUnorm2x16 packHalf2x16 unpackHalf2x16 length distance dot cross normalize faceforward reflect refract ' +
  'matrixCompMult outerProduct transpose determinant inverse lessThan lessThanEqual greaterThan greaterThanEqual equal ' +
  'notEqual any all not textureSize texture textureProj textureLod textureOffset texelFetch texelFetchOffset ' +
  'textureProjOffset textureLodOffset textureProjLod textureProjLodOffset textureGrad textureGradOffset textureProjGrad ' +
  'textureProjGradOffset dFdx dFdy fwidth').split(' '));
const GL_NAMES = /^gl_(FragCoord|FragDepth|FrontFacing|PointCoord|Position|PointSize|VertexID|InstanceID|DepthRange|Max\w+|Min\w+)$/;
// a WebGL1 shader (GLSL ES 1.00, no #version 300 es) may use these; the predefined macros everywhere
const GLSL_ES1 = new Set(['attribute', 'varying', 'gl_FragColor', 'gl_FragData']);
const GLSL_MACROS = new Set(['__VERSION__', '__LINE__', '__FILE__', 'GL_ES']);

/**
  The words in a GLSL ES 3.00 source that a strict compiler (a real GPU's) rejects, as
  ["line 12: ..."]: a reserved word anywhere, a qualifier or keyword used as a name, a name with a
  double underscore or an unknown gl_ prefix, and a variable, field, parameter or function named like
  a built-in function. Empty when the source is clean. CPU-rendered Chrome (SwiftShader) compiles some
  of these, so a screenshot test alone never proves a shader builds on a laptop's GPU.
*/
export function glslProblems(src) {
  const out = [];
  // comments out (line numbers kept), then the code as lines
  const code = String(src).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/\/\/[^\n]*/g, '');
  const lines = code.split('\n');
  const types = new Set(GLSL_TYPES);
  for (const m of code.matchAll(/\bstruct\s+([A-Za-z_]\w*)/g)) types.add(m[1]);
  const lineOf = i => code.slice(0, i).split('\n').length;
  const es1 = !/#\s*version\s+300\s+es/.test(code) && /\b(gl_FragColor|attribute|varying)\b/.test(code);
  lines.forEach((ln, i) => {
    if (/^\s*#\s*(version|line|extension|pragma)\b/.test(ln)) return;
    // every word (not the exponent of a number such as 1e9)
    for (const m of ln.matchAll(/(?<!\w)[A-Za-z_]\w*/g)) {
      const w = m[0], at = `line ${i + 1}: `;
      if (GLSL_MACROS.has(w) || (es1 && GLSL_ES1.has(w))) continue;
      if (GLSL_RESERVED.has(w)) out.push(at + `"${w}" is reserved in GLSL ES 3.00`);
      else if (w.includes('__')) out.push(at + `"${w}": a double underscore is reserved`);
      else if (w.startsWith('gl_') && !GL_NAMES.test(w)) out.push(at + `"${w}": the gl_ prefix is reserved`);
      else if (ln[m.index - 1] === '.' && GLSL_KEYWORDS.has(w)) out.push(at + `".${w}": a keyword is never a field`);
    }
  });
  // declared names: "type name" (variables, struct fields, parameters, functions), and the further
  // names of a list ("float a = 1.0, b;")
  const decl = new RegExp(`(?<![\\w.])(${[...types].join('|')})\\s+([A-Za-z_]\\w*)`, 'g');
  for (const m of code.matchAll(decl)) {
    const names = [m[2]];
    const rest = code.slice(m.index + m[0].length);
    if (!/^\s*\(/.test(rest)) {
      // a variable list: further names after commas at depth 0, up to the end of the statement
      let depth = 0, j = 0;
      for (; j < rest.length; j++) {
        const c = rest[j];
        if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') { if (--depth < 0) break; }
        else if ((c === ';' || c === '{' || c === '}') && depth <= 0) break;
        else if (c === ',' && depth === 0) {
          // the next word, and what follows it: another word means a parameter list ("float a,
          // inout Surf s"), where each name has its own type and qualifiers; anything else (= ; , [ ) })
          // means it is the next name of the list, so a keyword there ("float a, flat;") is a fault
          const n = rest.slice(j + 1).match(/^\s*([A-Za-z_]\w*)\s*(\S?)/);
          if (!n) continue;
          const word = n[1], kw = GLSL_KEYWORDS.has(word) || GLSL_RESERVED.has(word) || types.has(word);
          if (kw && /[A-Za-z_]/.test(n[2])) break;
          names.push(word);
        }
      }
    }
    for (const n of names) {
      const at = `line ${lineOf(m.index)}: `;
      if (GLSL_KEYWORDS.has(n) || GLSL_RESERVED.has(n)) out.push(at + `"${n}" is a keyword or reserved word, not a name`);
      else if (GLSL_BUILTINS.has(n)) out.push(at + `"${n}" is a built-in function: name it otherwise`);
      else if (types.has(n)) out.push(at + `"${n}" is a type, not a name`);
    }
  }
  return [...new Set(out)];
}
// the fallback and poster PNGs: the object printed by make-fallbacks.html in a FB.w x FB.h CSS px
// frame at DPR 1, at size FB.size, centred, at its rest angle; red = ink (and floor), green = accent,
// blue = the silhouette
export const FB = { w: 640, h: 640, size: 0.6 };

/* ------------------------------------------------------------------ colour (OKLab) */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const toLin = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const toGam = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
function hexRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
// the render's own curves (formShader: toLin, toSrgb, filmic), for the render's poster
const lin22 = v => Math.pow(Math.max(v, 0), 2.2);
const gam22 = v => Math.pow(clamp(v, 0, 1), 1 / 2.2);
const filmicJs = x => clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0, 1);
function filmicInv(y) {
  y = clamp(y, 0, 0.995);
  const a = 2.43 * y - 2.51, b = 0.59 * y - 0.03, c = 0.14 * y;
  return (-b - Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
}
// the colour a render poster's accent part is rendered in (make-fallbacks.html), lit again in the page's accent
export const RENDER_REF = '#808080';
const rgbHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join('');
function oklab(rgb) {
  const [r, g, b] = rgb.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(v => clamp(toGam(clamp(v, 0, 1)), 0, 1));
}
export const mixColor = (a, b, t) => { const A = oklab(hexRgb(a)), B = oklab(hexRgb(b)); return rgbHex(fromOklab(A.map((v, i) => v + (B[i] - v) * t))); };
const lightness = c => oklab(hexRgb(c))[0];
const smooth01 = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/**
  The colour a render paints its accent part in: the page's accent as an enamel or a glaze carries it.
  A UI accent is tuned for buttons and links (on a dark page often light or neon), and a whole lamp
  shade or cup in that colour reads as a plastic toy. The paint keeps the hue, holds the chroma to
  what a pigment reaches and the lightness to a mid tone; yellows may stay lighter (a darker yellow
  turns olive), and a near-neutral accent (white, grey, black) stays what it is, as white or black
  enamel. Prints keep the accent as it is: it is ink there.
*/
export function paintColor(hex) {
  const [L, A, B] = oklab(hexRgb(hex));
  const C = Math.hypot(A, B), h = Math.atan2(B, A);
  const yellow = smooth01(0.55, 0.95, Math.cos(h - 100 * DEG));
  const lmax = 0.64 + (0.84 - 0.64) * yellow;
  const neutral = 1 - smooth01(0.02, 0.06, C);
  const L2 = clamp(L, 0.22, lmax + (0.94 - lmax) * neutral);
  const C2 = Math.min(C, 0.19) * (L2 < L ? 0.96 : 1);
  return rgbHex(fromOklab([L2, C2 * Math.cos(h), C2 * Math.sin(h)]));
}

const DEFAULT_PALETTE = { bg: '#ffffff', surface: '#f4f4f4', ink: '#111111', muted: '#6b6b6b', accent: '#1a4be0', accentInk: '#ffffff' };

let probe = null;
function cssHex(v) {
  v = (v || '').trim();
  if (!v) return null;
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v)) return v.length === 4 ? '#' + v.slice(1).split('').map(c => c + c).join('') : v.toLowerCase();
  if (!HAS_DOM) return null;
  probe = probe || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = v;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return d[3] ? rgbHex([d[0] / 255, d[1] / 255, d[2] / 255]) : null;
}

/** the palette from the element's CSS (--fx-bg or --bg, --surface, --ink, --muted, --accent, --accent-ink), or defaults */
export function readPalette(el) {
  if (!HAS_DOM) return { ...DEFAULT_PALETTE };
  const cs = getComputedStyle(el || document.documentElement);
  const g = (...n) => { for (const k of n) { const v = cssHex(cs.getPropertyValue(k)); if (v) return v; } return undefined; };
  return normalizePalette({ bg: g('--fx-bg', '--bg'), surface: g('--fx-surface', '--surface'), ink: g('--fx-ink', '--ink'), muted: g('--fx-muted', '--muted'), accent: g('--accent', '--fx-accent'), accentInk: g('--accent-ink', '--fx-accent-ink') });
}
export function normalizePalette(p = {}) {
  const hex = c => (c == null ? null : cssHex(String(c)) || null);
  const bg = hex(p.bg) || DEFAULT_PALETTE.bg;
  const ink = hex(p.ink) || (lightness(bg) < 0.6 ? '#f2f2f2' : '#111111');
  return {
    bg, ink,
    surface: hex(p.surface) || mixColor(bg, ink, 0.05),
    muted: hex(p.muted) || mixColor(ink, bg, 0.45),
    accent: hex(p.accent) || ink,
    accentInk: hex(p.accentInk || p['accent-ink']) || bg,
  };
}
export const isDarkPaper = p => lightness(p.bg) < 0.6;

/**
  The palette an object prints in when it sits on a dealt ground (a [data-fx] panel or frame): the
  ground's own paper (its data-fx-palette, as system.js lights it: a step darker than a light card,
  daylight under a dark one), an ink that reads on that paper, and the page's accent.
*/
export function groundPalette(el, ground) {
  const page = readPalette(el);
  let g = null;
  try { g = JSON.parse(ground?.dataset.fxPalette || 'null'); } catch (_) { g = null; }
  if (!g || !cssHex(g.bg)) return null;
  const bg = cssHex(g.bg);
  const light = lightness(bg) >= 0.6;
  const pageLight = lightness(page.ink) < 0.5;   // the page's ink is dark: a light page
  const ink = cssHex(g.ink || '') || (light ? (pageLight ? page.ink : '#17181b') : (pageLight ? '#f1f1ef' : page.ink));
  return normalizePalette({ bg, surface: cssHex(g.surface || '') || mixColor(bg, light ? '#ffffff' : '#000000', 0.5), ink, muted: g.muted, accent: page.accent, accentInk: page.accentInk });
}

/* ------------------------------------------------------------------ params */

export const COMMON_PARAMS = {
  effect:      { default: 'render', options: EFFECTS },       // render (a studio render of the thing), or a print: dither, halftone, engrave or ascii
  cell:        { default: 0,    min: 0,    max: 28 },          // CSS px of a cell, screen or line pitch (0: the effect's own, finer in a small frame)
  size:        { default: 0.78, min: 0.3,  max: 1.8 },         // share of the frame the object's box fills (the tighter way); over 1 it runs off the edges
  x:           { default: 0,    min: -0.6, max: 0.6 },         // move the object across the frame (share of the frame's width, + right)
  y:           { default: 0,    min: -0.6, max: 0.6 },         // and up (share of the frame's height, + up)
  turn:        { default: 1,    min: 0,    max: 1 },           // 1: it turns (or sways) by itself and gets a pause button; 0: still until hovered or clicked
  speed:       { default: 1,    min: 0,    max: 4 },           // multiplies the object's own turn
  angle:       { default: 0,    min: -180, max: 180 },         // turn at rest and in the still frame, degrees
  accent:      { default: 1,    min: 0,    max: 1 },           // 1 prints the object's accent part in the accent
  shadow:      { default: 1,    min: 0,    max: 1.6 },         // floor shadow strength (0: no floor at all)
  body:        { default: 1,    min: 0,    max: 1 },           // paper tint inside the silhouette (surface colour), so the object is opaque on a ground
  levels:      { default: 2,    min: 2,    max: 3 },           // dither: 2 one ink, 3 adds a half tone
  contrast:    { default: 1,    min: 0.5,  max: 2 },
  light:       { default: 0,    min: -90,  max: 90 },          // key light swing at rest, degrees
  interactive: { default: 1,    min: 0,    max: 1 },           // 0: no hover light, no click step, not focusable (a picture only)
  debug:       { default: 0,    min: 0,    max: 1 },           // 1 shows the form pass (ink as grey, plates tinted)
  step:        { default: 0,    min: 0,    max: 1 },           // 1: start with the step taken (the lamp on, the cards fanned)
  transparent: { default: 0,    min: 0,    max: 1 },           // 1: no paper outside the object (it prints over the panel's ground)
};

function resolve(schema, given = {}) {
  const out = {};
  for (const [k, d] of Object.entries(schema)) {
    let v = given[k];
    if (d.options) { out[k] = typeof v === 'number' ? d.options[v] || d.default : d.options.includes(v) ? v : d.default; continue; }
    v = v == null || v === '' ? d.default : Number(v);
    if (!Number.isFinite(v)) v = d.default;
    out[k] = clamp(v, d.min ?? -Infinity, d.max ?? Infinity);
  }
  return out;
}

/* ------------------------------------------------------------------ GLSL */

const FULL_VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const SDF_LIB = /* glsl */ `
const float PI = 3.14159265;
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdRoundBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdRect(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// a 2D distance d extruded along the third axis by half-height h with edge radius r
float extrude(float d, float z, float h, float r) { vec2 w = vec2(d + r, abs(z) - h + r); return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
// a capped cylinder about y: radius r, half height h, edge radius e
float sdCyl(vec3 p, float r, float h, float e) { vec2 d = vec2(length(p.xz) - r + e, abs(p.y) - h + e); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - e; }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float hash1(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
`;

function formShader(def) {
  return `#version 300 es
precision highp float;
precision highp int;
uniform vec2 u_res, u_scale, u_full, u_shift;
uniform float u_time, u_step, u_kick, u_spin, u_dark, u_pix, u_lineFreq, u_floorK, u_floorReach, u_floorAO, u_foot, u_contrast, u_focal, u_dim, u_hover;
uniform float u_render, u_expo;   // u_render: 0 a print, 1 the render, 2 the render's poster plates
uniform vec4 u_k, u_bound;
uniform mat3 u_rot, u_cam;
uniform vec3 u_pivot, u_light, u_fill, u_ro, u_accent;   // u_light: the key light's position (a lamp near the set)
uniform vec3 u_paperC, u_shadowC, u_poolC;   // render: the paper (linear), the floor's shadow and pool (sRGB)
uniform int u_steps, u_shSteps;
uniform sampler2D u_aux;
out vec4 o;
// albedo, gloss, shine (specular power), accent (1: the accent plate), emit (light of its own), coord
// (what engraved lines follow), wire (prints solid), lo / hi (the printed tone is held between them,
// so a part keeps its tone whatever the light does), tint (1: engraving prints a single tint there);
// for the render: col (linear colour; x < 0: a neutral of albedo, or the accent on the accent part)
// and metal (0 a glaze or paint, 1 bare metal: reflections take its colour)
struct Surf { float albedo; float gloss; float shine; float accent; float emit; float coord; float wire; float lo; float hi; float tint; vec3 col; float metal; };
${SDF_LIB}
// sRGB to linear and back (close enough for a render), and a filmic curve for the light
vec3 toLin(vec3 c) { return pow(max(c, vec3(0.0)), vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
vec3 filmic(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
#line 1
${def.glsl}
#line 2000
#ifndef FLOOR_EMIT
float floorEmit(vec3 p) { return 0.0; }
#endif
vec2 sdf(vec3 w) { return map(u_rot * (w - u_pivot) + u_pivot); }

// near and far distance of a ray through the bounding sphere (far < 0: missed)
vec2 bound(vec3 ro, vec3 rd) {
  vec3 oc = ro - u_bound.xyz;
  float b = dot(oc, rd), c = dot(oc, oc) - u_bound.w * u_bound.w, h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}
// every loop is counted by a uniform, so each sdf() call site is compiled once (not unrolled)
vec3 normalAt(vec3 p, float e) {
  vec3 n = vec3(0.0);
  for (int i = min(u_steps, 0); i < 4; i++) {
    vec3 k = 0.5773 * (2.0 * vec3(float(((i + 3) >> 1) & 1), float((i >> 1) & 1), float(i & 1)) - 1.0);
    n += k * sdf(p + e * k).x;
  }
  return normalize(n);
}
// k: the penumbra's sharpness (the floor takes a softer one, so thin parts cast a soft band, not dashes)
float softShadow(vec3 ro, vec3 rd, float k) {
  vec2 b = bound(ro, rd);
  if (b.y < 0.0) return 1.0;
  float t = max(b.x, 0.004), res = 1.0;
  for (int i = 0; i < u_shSteps; i++) {
    float h = sdf(ro + rd * t).x;
    res = min(res, k * h / t);
    t += clamp(h, 0.006, 0.12);
    if (res < 0.003 || t > b.y) break;
  }
  res = clamp(res, 0.0, 1.0);
  return res * res * (3.0 - 2.0 * res);
}
float occlusion(vec3 p, vec3 n, float reach) {
  // measured from the surface itself: the march stops a little off it (inside or out), and that
  // error, taken five times, would print as rings of shade across a smooth body
  float occ = 0.0, sca = 1.0, d0 = sdf(p).x;
  for (int i = min(u_steps, 0); i < 5; i++) {
    float h = 0.012 + reach * float(i) / 4.0;
    occ += (h - (sdf(p + n * h).x - d0)) * sca;
    sca *= 0.78;
  }
  return clamp(1.0 - 2.2 * occ / max(reach, 0.05), 0.0, 1.0);
}

// ---- the print: the light on the object as one ink value per pixel (on dark paper the ink is the light)
vec4 printObject(Surf s, vec3 P, vec3 N, vec3 rd, vec3 L, float sh, float ao) {
  // studio light: a key lamp with shadows, a soft fill from the front right, sky and a softbox
  // falloff from top to bottom, so flat faces carry a gradient as they do in a product photograph
  float nl = dot(N, L);
  float soft = mix(0.7, 1.06, smoothstep(-1.0, 0.9, (P.y - u_bound.y) / u_bound.w));
  // on light paper a cast shadow keeps a quarter of the key, as under a large softbox, so it prints as
  // a deep tone and not a black hole
  float key = clamp((nl + 0.1) / 1.1, 0.0, 1.0) * mix(u_dark > 0.5 ? 0.0 : 0.25, 1.0, sh) * soft;
  float fill = clamp((dot(N, u_fill) + 0.25) / 1.25, 0.0, 1.0);
  // sky from above, and on light paper the floor bounces light back up into the undersides, so a
  // shadow side is a mid tone, never a hole (as under a photographer's white sweep)
  float sky = mix(u_dark > 0.5 ? 0.3 : 0.62, 1.0, 0.5 + 0.5 * N.y);
  vec3 hv = normalize(L - rd);
  float spec = pow(max(dot(N, hv), 0.0), s.shine) * s.gloss * sh;
  float fres = pow(1.0 - max(dot(N, -rd), 0.0), 3.0);
  // studio reflections in glossy things: a tall strip softbox at the key light's bearing, which
  // sweeps across glass and glaze as the object turns, and the room above as a soft gradient
  vec3 rf = reflect(rd, N);
  vec2 az = normalize(L.xz + vec2(1e-4, 0.0));
  float strip = smoothstep(0.93, 0.99, dot(normalize(rf.xz + vec2(1e-4, 0.0)), az)) * smoothstep(-0.3, 0.2, rf.y);
  float box = (0.55 * strip + 0.18 * smoothstep(-0.15, 0.85, rf.y) * ao) * s.gloss * mix(0.45, 1.0, sh);
  // on light paper a little more ambient: shadow sides print as an open mid tone, not a heavy mass
  float tone = s.albedo * ((u_dark > 0.5 ? 0.2 : 0.28) * ao * sky + 0.72 * key + 0.24 * fill * ao) + spec * 1.1 + box + s.emit;
  if (u_dark > 0.5) tone += s.albedo * 0.08 + fres * 0.22 * ao * (1.0 - min(s.emit, 1.0));
  tone = pow(clamp(tone, 0.0, 1.0), 0.8);   // light to printed tone, a little toward the eye's scale
  float c = u_dark > 0.5 ? tone : 1.0 - tone;
  c = clamp((c - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  c = mix(0.035, 0.92, c);
  c = clamp(c, s.lo, s.hi);
  if (s.wire > 0.5) c = 0.985;   // wire (spokes, rods): above every tone, so the print draws it as a solid line
  // tint: a phase that jumps from texel to texel, so the engraving prints its single tint there
  float ph = s.coord * u_lineFreq + (s.tint > 0.5 ? 400.0 * hash1(dot(gl_FragCoord.xy, vec2(1.0, 61.0))) : 0.0);
  return vec4(c, 1.0, s.accent, ph);
}

// ---- the print: the floor. On light paper a soft cast shadow and a tight contact dark; on dark paper a
// pool of light about the size of the object with its shadow cut out of it. Light the object throws
// (a lamp's pool) prints in the floor's ink: on dark paper that is light. Everything on the floor ends
// within about 1.2 x the object's footprint and well inside the frame (ef), so no edge of the panel
// ever cuts a shadow or a pool into a straight line.
vec4 printFloor(vec3 P, float r, float sh, float ao, float ef, float air) {
  float e = floorEmit(P);
  float near = 1.0 - smoothstep(0.45, 1.25, r);
  float c;
  if (u_dark < 0.5) {
    // a soft cast shadow that pales away from the object, and a tight contact dark under it
    c = (1.0 - sh) * 0.28 * near + (1.0 - ao) * 0.24 * u_floorAO * (1.0 - smoothstep(0.3, 0.9, r));
    c *= u_floorK * (1.0 - smoothstep(0.0, 0.3, e));
  } else {
    float pool = (1.0 - smoothstep(0.1, 1.15, r)) * 0.2 * u_floorK;
    c = pool * mix(0.15, 1.0, sh) * mix(1.0, ao, u_floorAO);
  }
  c *= ef;
  // the faintest tone prints nothing (the print stipples the rest); on dark paper the cut is higher,
  // so the pool ends in a dense stipple and never in a scatter of lone specks
  c *= u_dark > 0.5 ? smoothstep(0.07, 0.11, c) : smoothstep(0.03, 0.06, c);
  // light the object throws: on dark paper it prints as light; on light paper it only lifts the
  // shadow where it falls (light cannot be printed darker than the paper)
  float lit = e * (u_dark > 0.5 ? 0.62 : 0.0) * ef;
  lit = max(lit * smoothstep(0.07, 0.13, lit), air);   // the faint end of a pool prints nothing, never lone specks
  if (lit > c && lit > 0.03) return vec4(clamp(lit, 0.0, 0.85), 0.0, 0.0, 0.0);
  return vec4(clamp(c, 0.0, 0.9), 0.0, 0.0, 0.0);
}

// ---- the render: the studio round the object as glossy things see it: a tall strip softbox at the
// key light's bearing and a dimmer one opposite, the bright room above, the paper's floor below
vec3 studio(vec3 r, vec3 L, float sharp) {
  vec2 az = normalize(L.xz + vec2(1e-4, 0.0));
  float c = dot(normalize(r.xz + vec2(1e-4, 0.0)), az);
  float w = mix(0.8, 0.96, sharp);
  float band = smoothstep(-0.35, 0.1, r.y) * (1.0 - smoothstep(0.7, 0.97, r.y));
  float keyBox = smoothstep(w, mix(w, 1.0, 0.6), c) * band;
  float backBox = smoothstep(w, mix(w, 1.0, 0.6), -c) * band;
  float up = smoothstep(-0.3, 0.75, r.y);
  vec3 room = mix(u_paperC * 0.7, mix(u_paperC, vec3(1.0), 0.7), up) * mix(0.55, 0.05, u_dark);
  return room + vec3(1.0, 0.98, 0.95) * (2.4 * keyBox + mix(0.45, 0.9, u_dark) * backBox);
}

// ---- the render: the object in its own materials under a key light with soft shadows, a cool fill,
// the sky and the paper's bounce, specular highlights and the softboxes in glossy and metal parts
vec4 renderObject(Surf s, vec3 P, vec3 N, vec3 rd, vec3 L, float sh, float ao) {
  vec3 tint = u_paperC / max(dot(u_paperC, vec3(0.3333)), 1e-3);
  vec3 base = s.col.x >= 0.0 ? s.col : s.accent > 0.5 ? toLin(u_accent) : vec3(s.albedo * s.albedo) * mix(vec3(1.0), tint, 0.08);
  float dk = u_dark;
  float nl = max(dot(N, L), 0.0), nv = clamp(dot(N, -rd), 0.0, 1.0);
  float soft = mix(0.72, 1.06, smoothstep(-1.0, 0.9, (P.y - u_bound.y) / u_bound.w));
  vec3 keyC = vec3(1.0, 0.965, 0.92) * mix(2.0, 2.5, dk) * soft;
  // a cast shadow keeps some of the key on light paper, as under a large softbox
  float lit = nl * mix(dk > 0.5 ? 0.0 : 0.16, 1.0, sh);
  // occlusion softened: a crease darkens, it never turns black (light bounces round a white studio)
  float occ = mix(mix(0.45, 0.25, dk), 1.0, ao);
  vec3 sky = mix(u_paperC, vec3(1.0), 0.65) * mix(0.62, 0.1, dk);
  vec3 bounce = mix(u_paperC, vec3(1.0), 0.35) * mix(0.42, 0.04, dk);
  vec3 amb = mix(bounce, sky, 0.5 + 0.5 * N.y) * occ;
  // a large reflector beside the camera: shadow sides stay readable
  vec3 fillC = vec3(0.88, 0.93, 1.0) * mix(0.5, 0.2, dk) * clamp((dot(N, u_fill) + 0.35) / 1.35, 0.0, 1.0) * occ;
  vec3 diff = base * (keyC * lit + fillC + amb) * (1.0 - s.metal);
  vec3 F0 = mix(vec3(0.04), base, s.metal);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - nv, 5.0);
  float sp = max(s.shine, 2.0);
  vec3 H = normalize(L - rd);
  vec3 spec = keyC * F * pow(max(dot(N, H), 0.0), sp) * (sp + 8.0) / 25.0 * lit;
  vec3 refl = studio(reflect(rd, N), L, clamp(sp / 90.0, 0.0, 1.0)) * F * occ;
  // a matte thing keeps a little sheen; a glossy one shows the softboxes
  vec3 col = diff + (spec + refl) * mix(0.12, 1.0, clamp(s.gloss, 0.0, 1.0));
  // the edge of the form against the room behind (stronger on dark paper, where it is the outline)
  col += pow(1.0 - nv, 4.0) * occ * mix(0.03, 0.22, dk) * mix(vec3(1.0), base, 0.5);
  col += s.emit * vec3(1.0, 0.82, 0.58) * 2.2;
  return vec4(toSrgb(filmic(col * u_expo)), 1.0);
}

// ---- the render: the floor as a soft shadow over the ground (premultiplied); on dark paper inside a
// pool of the studio's light; light the object throws (a lamp's) added warm. Like the print's floor it
// ends within about 1.3 x the footprint and well inside the frame.
vec4 renderFloor(vec3 P, float r, float sh, float ao, float ef) {
  float e = clamp(floorEmit(P), 0.0, 1.0);
  float near = 1.0 - smoothstep(0.4, 1.3, r);
  float contact = 1.0 - smoothstep(0.2, 0.9, r);
  float a = ((1.0 - sh) * 0.4 * near + (1.0 - ao) * 0.62 * u_floorAO * contact) * u_floorK * ef;
  a = clamp(a * (1.0 - 0.6 * e), 0.0, 0.85);   // a lamp's light lifts the shadow it falls on
  if (u_render > 1.5) return vec4(0.0, 0.0, 0.0, a);
  vec4 res = vec4(u_shadowC * a, a);
  if (u_dark > 0.5) {
    float pool = (1.0 - smoothstep(0.0, 1.3, r)) * 0.12 * u_floorK * ef * mix(0.15, 1.0, sh) * mix(0.4, 1.0, ao);
    res += vec4(u_poolC * pool, pool) * (1.0 - a);
  }
  if (u_dark > 0.5) res.rgb += vec3(1.0, 0.85, 0.6) * e * 0.6 * ef;
  else {
    // on light paper light cannot be added to white: the paper under the lamp turns warm and a little
    // brighter, laid over the shadow
    float w = clamp(e * 1.1, 0.0, 0.85) * ef;
    vec3 warm = toSrgb(min(u_paperC * 1.3 * vec3(1.0, 0.86, 0.52), vec3(1.0)));
    res = vec4(warm * w + res.rgb * (1.0 - w), w + res.a * (1.0 - w));
  }
  return res;
}

void main() {
  vec2 fc = gl_FragCoord.xy * u_scale;
  float md = min(u_full.x, u_full.y);
  vec2 p = (fc - 0.5 * u_full) / md - u_shift;
  vec3 rd = normalize(u_cam * vec3(p, u_focal));
  vec3 ro = u_ro;
  // the floor and any light in the air fade out well inside the frame, so no edge cuts them
  float edge = min(min(fc.x, u_full.x - fc.x), min(fc.y, u_full.y - fc.y)) / md;
  float ef = smoothstep(0.04, 0.2, edge);
  bool rend = u_render > 0.5;

  // the object
  float t = 0.0, id = -1.0, cov = 1.0;
  vec2 bb = bound(ro, rd);
  if (bb.y > 0.0) {
    t = max(bb.x, 0.0);
    float best = 1e9, bestT = 0.0, bestId = -1.0;
    for (int i = 0; i < u_steps; i++) {
      vec2 h = sdf(ro + rd * t);
      if (h.x < 0.35 * u_pix * t) { id = h.y; break; }
      if (h.x < best) { best = h.x; bestT = t; bestId = h.y; }
      t += h.x * 0.92;
      if (t > bb.y) break;
    }
    // a ray that runs out of steps grazing thin parts (spokes, rods) counts as the hit it nearly was;
    // in the render every near miss covers part of its pixel, so the outline is smooth
    if (id < 0.0 && best < 1.5 * u_pix * bestT && (rend || t <= bb.y)) {
      if (rend) cov = clamp(1.2 - best / (u_pix * bestT), 0.0, 1.0);
      if (cov > 0.0) { id = bestId; t = bestT; }
    }
  }
  float tFloor = rd.y < 0.0 ? -ro.y / rd.y : 1e5;
  vec3 fp = ro + rd * tFloor;
  bool floorSeen = rd.y < 0.0 && u_floorK > 0.001 && length(fp.xz - u_bound.xz) < u_foot * 1.8;
  float air = 0.0;
#ifdef BEAM
  if (id < 0.0) air = beam(ro, rd, min(tFloor, 50.0)) * ef;
#endif
  o = vec4(0.0);
  if (id < 0.0 && !floorSeen) { if (!rend && air > 0.03) o = vec4(clamp(air, 0.0, 0.8), 0.0, 0.0, 0.0); return; }

  // the object, then the floor (both at the render's soft outline), in one loop, so the normal, shadow
  // and occlusion are each compiled once (the model is inlined at every call site)
  int k0 = id >= 0.0 ? 0 : 1;
  int k1 = id >= 0.0 && !(rend && cov < 0.999 && floorSeen) ? 0 : 1;
  for (int k = k0 + min(u_steps, 0); k <= k1; k++) {
    bool onObj = k == 0;
    vec3 P = onObj ? ro + rd * t : fp;
    vec3 N = onObj ? normalAt(P, max(0.0004, 0.5 * u_pix * t)) : vec3(0.0, 1.0, 0.0);
    vec3 L = normalize(u_light - P);
    float sh = dot(N, L) > 0.0 ? softShadow(P + N * 0.003, L, onObj ? 14.0 : 4.0) : 0.0;
    // the floor far from the object has nothing to be occluded by
    float r = length(P.xz - u_bound.xz) / u_foot;
    float ao = !onObj && r > 1.6 ? 1.0 : occlusion(P, N, onObj ? 0.07 : u_floorReach);
    if (onObj) {
      vec3 lp = u_rot * (P - u_pivot) + u_pivot;
      Surf s = Surf(0.8, 0.2, 24.0, 0.0, 0.0, lp.y, 0.0, 0.0, 1.0, 0.0, vec3(-1.0), 0.0);
      surf(id, lp, u_rot * N, s);
      if (!rend) { o = printObject(s, P, N, rd, L, sh, ao); continue; }
      vec4 c = renderObject(s, P, N, rd, L, sh, ao);
      // the poster's plates: brightness, the accent part, coverage (and the floor's shadow in alpha)
      if (u_render > 1.5) c = vec4(dot(c.rgb, vec3(0.2126, 0.7152, 0.0722)), s.accent, 1.0, 0.0);
      o = c * cov;
    } else if (!rend) {
      o = printFloor(P, r, sh, ao, ef, air);
    } else if (u_render > 1.5) {
      o.a = renderFloor(P, r, sh, ao, ef).a * (1.0 - o.b);
    } else {
      o += renderFloor(P, r, sh, ao, ef) * (1.0 - o.a);
    }
  }
}
`;
}

const PRINT_FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D u_tex, u_glyph;
uniform vec2 u_texSize, u_scale;
uniform float u_mode, u_cell, u_angle, u_levels, u_glyphN, u_alpha, u_body, u_debug, u_plate, u_floorShare;
uniform vec3 u_paper, u_paperIn, u_ink, u_acc, u_floor;
out vec4 o;
const float PI_ = 3.14159265;

// 8x8 ordered dither: bit-reversed interleave of (x xor y, y)
float bayer8(ivec2 p) {
  int x = p.x & 7, y = p.y & 7, a = x ^ y;
  int v = ((a & 1) << 5) | ((y & 1) << 4) | ((a & 2) << 2) | ((y & 2) << 1) | ((a & 4) >> 1) | ((y & 4) >> 2);
  return (float(v) + 0.5) / 64.0;
}
// interleaved gradient noise: an even stipple with no rows
float ign(vec2 p) { return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y)); }
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec4 at(vec2 px) { return texture(u_tex, px / (u_texSize * u_scale)); }
// dot radius (cell units) for an ink share: true to area until the dots touch, then closing the gaps
float dotR(float a) { return a < 0.785 ? sqrt(a / PI_) : 0.5 + (a - 0.785) * 0.97; }
// the render's edges, smoothed along their direction at the form texels' scale (FXAA, after Lottes):
// the raymarch takes one ray per texel, so the outlines between parts would step
float lumaOf(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)) + 0.35 * c.a; }
vec4 fxaa(vec2 uv, vec2 rcp) {
  vec4 cM = texture(u_tex, uv);
  float nw = lumaOf(texture(u_tex, uv + vec2(-0.5, -0.5) * rcp)), ne = lumaOf(texture(u_tex, uv + vec2(0.5, -0.5) * rcp));
  float sw = lumaOf(texture(u_tex, uv + vec2(-0.5, 0.5) * rcp)), se = lumaOf(texture(u_tex, uv + vec2(0.5, 0.5) * rcp));
  float m = lumaOf(cM);
  float lo = min(m, min(min(nw, ne), min(sw, se))), hi = max(m, max(max(nw, ne), max(sw, se)));
  if (hi - lo < max(0.04, hi * 0.1)) return cM;
  vec2 dir = vec2(-((nw + ne) - (sw + se)), (nw + sw) - (ne + se));
  float reduce = max((nw + ne + sw + se) * 0.03125, 1.0 / 128.0);
  dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + reduce), -6.0, 6.0) * rcp;
  vec4 a = 0.5 * (texture(u_tex, uv + dir * (1.0 / 3.0 - 0.5)) + texture(u_tex, uv + dir * (2.0 / 3.0 - 0.5)));
  vec4 b = a * 0.5 + 0.25 * (texture(u_tex, uv - dir * 0.5) + texture(u_tex, uv + dir * 0.5));
  float lb = lumaOf(b);
  return lb < lo || lb > hi ? a : b;
}
// one family of lines: phase in lines, width share w, antialiased over the phase's own change
float lines(float ph, float w, float fw) {
  float d = abs(fract(ph) - 0.5) * 2.0;
  float aa = max(fw * 2.0, 1e-4);
  float l = 1.0 - smoothstep(w - aa, w + aa, d);
  return mix(l, w, smoothstep(0.32, 0.55, fw));   // too fine to print: the flat tone
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float inside = 0.0, kF = 0.0, kI = 0.0, kA = 0.0;
  if (u_mode > 3.5) {
    // the render (premultiplied) over the paper, or clear over the panel's ground
    vec4 a = at(px);
    // the poster's plates: r brightness (the floor's shadow outside the object), g accent, b coverage
    if (u_plate > 0.5) { float cv = a.b; o = vec4(cv > 0.02 ? a.r / cv : a.a, cv > 0.02 ? a.g / cv : 0.0, cv, 1.0); return; }
    a = fxaa(px / (u_texSize * u_scale), 1.0 / u_texSize);
    // a fine still grain of about a CSS pixel, as in a photograph: it also keeps soft gradients from banding
    float g = (ign(floor(px / max(u_cell, 1.0)) + 11.0) - 0.5) * 0.04 * a.a;
    vec3 c = max(a.rgb + g, 0.0);
    o = u_alpha > 0.5 ? vec4(c, clamp(a.a, 0.0, 1.0)) : vec4(c + u_paper * (1.0 - clamp(a.a, 0.0, 1.0)), 1.0);
    return;
  }
  if (u_mode < 0.5) {
    ivec2 c = ivec2(floor(px / u_scale));
    vec4 a = texelFetch(u_tex, c, 0);
    inside = step(0.5, a.g);
    // the object in the ordered 8x8 pattern; the floor and its light stippled (no rows of specks)
    float th = a.g > 0.5 ? bayer8(c) : ign(vec2(c)), k;
    if (u_levels > 2.5) { float w = a.r * 2.0; k = (floor(w) + step(th, fract(w))) * 0.5; }
    else k = step(th, a.r);
    if (a.b > 0.5) kA = k; else if (inside < 0.5) kF = k; else kI = k;
  } else if (u_mode < 1.5) {
    vec2 g = rot(px, u_angle) / u_cell;
    vec2 b = floor(g), f = fract(g);
    vec2 sx = vec2(f.x < 0.5 ? -1.0 : 1.0, 0.0), sy = vec2(0.0, f.y < 0.5 ? -1.0 : 1.0);
    vec4 here = at(px);
    inside = smoothstep(0.3, 0.7, here.g);
    float plate = smoothstep(0.3, 0.7, here.b);
    for (int j = 0; j < 4; j++) {
      vec2 cc = b + 0.5 + (j == 1 ? sx : j == 2 ? sy : j == 3 ? sx + sy : vec2(0.0));
      vec4 a = at(rot(cc * u_cell, -u_angle));
      float r = a.r <= 0.004 ? -1.0 : dotR(a.r);
      float cov = clamp(0.5 - (length(g - cc) - r) * u_cell, 0.0, 1.0);
      // a dot stops at the silhouette and at the edge of its plate, so both stay clean lines
      if (a.g > 0.5) { cov *= inside; if (a.b > 0.5) kA = max(kA, cov * plate); else kI = max(kI, cov * (1.0 - plate)); }
      else if (a.b > 0.5) kA = max(kA, cov * (1.0 - inside) * plate);
      else kF = max(kF, cov * (1.0 - inside) * (1.0 - plate));
    }
    // wire (a tone above 0.955, set by Surf.wire) prints solid, so spokes and rods stay whole lines
    float wire = smoothstep(0.955, 0.975, here.r) * inside;
    if (here.b > 0.5) kA = max(kA, wire); else kI = max(kI, wire);
  } else if (u_mode < 2.5) {
    vec4 a = at(px);
    inside = smoothstep(0.3, 0.7, a.g);
    float c = a.r;
    // lines that follow the form, swelling with the ink; cross lines in the deepest shade
    // the phase's change per pixel, measured between neighbouring form texels (screen derivatives
    // of an interpolated texture jump at texel edges and break the lines into a grid)
    ivec2 ti = ivec2(px / u_scale);
    float p0 = texelFetch(u_tex, ti, 0).a;
    float fw = (abs(texelFetch(u_tex, ti + ivec2(1, 0), 0).a - p0) + abs(texelFetch(u_tex, ti + ivec2(0, 1), 0).a - p0)) / max(u_scale.x, 1e-3);
    float l1 = lines(a.a, c > 0.9 ? 1.0 : min(c * 1.08, 0.86), fw);   // wire and the darkest ink print solid
    vec2 dir = vec2(cos(u_angle), sin(u_angle));
    // (it fades in by strength, never as hairlines, which would print as rows of specks)
    float l2 = lines(dot(px, dir) / u_cell, 0.32, 1.0 / u_cell) * smoothstep(0.72, 0.9, c);
    float k = max(l1, l2);
    // the floor: level lines across the page
    float lf = lines(px.y / u_cell + 0.25, min(c * 0.95, 0.7), 1.0 / u_cell);
    float plate = smoothstep(0.3, 0.7, a.b);
    kA = k * inside * plate; kI = k * inside * (1.0 - plate);
    float fl = lf * (1.0 - inside) * step(0.003, c) * (1.0 - smoothstep(0.02, 0.3, a.g));
    kA = max(kA, fl * plate); kF = fl * (1.0 - plate);
  } else {
    ivec2 c = ivec2(floor(px / u_scale));
    vec4 a = texelFetch(u_tex, c, 0);
    float v = a.g < 0.5 ? (a.r - 0.06) * 1.25 : (a.r - 0.48) * 1.5 + 0.5;   // type wants more contrast
    float idx = floor(clamp(v, 0.0, 1.0) * (u_glyphN - 1.0) + 0.5);
    vec2 l = fract(px / u_scale);
    float gl = texture(u_glyph, vec2((idx + l.x) / u_glyphN, 1.0 - l.y)).a;
    inside = step(0.5, a.g);
    if (a.b > 0.5) kA = gl; else if (a.g < 0.5) kF = gl; else kI = gl;
  }
  if (u_debug > 0.5) { vec4 a = at(px); o = vec4(vec3(1.0 - a.r) * mix(vec3(1.0), vec3(0.7, 1.0, 0.7), a.b) * mix(0.85, 1.0, a.g), 1.0); return; }
  // the plates for the poster and fallback PNG: red ink (the floor at its share), green accent, blue the silhouette
  if (u_plate > 0.5) { o = vec4(clamp(kI + kF * u_floorShare, 0.0, 1.0), kA, inside * u_body, 1.0); return; }
  // print: paper (the silhouette on a slightly different stock), then each ink over it
  vec4 r = u_alpha > 0.5 ? vec4(0.0) : vec4(u_paper, 1.0);
  float tint = inside * u_body;
  r = mix(r, vec4(u_paperIn, 1.0), tint);
  r = mix(r, vec4(u_floor, 1.0), kF);
  r = mix(r, vec4(u_ink, 1.0), kI);
  r = mix(r, vec4(u_acc, 1.0), kA);
  o = r;   // premultiplied: every layer mixes over the one below, from clear when transparent
}
`;

/* ------------------------------------------------------------------ GL helpers */

// Two steps, so a browser with KHR_parallel_shader_compile builds the program off the main thread:
// startProgram queues the work, finishProgram (once it is done) reads the status and the uniforms.
function startProgram(gl, frag, label, vert = FULL_VERT) {
  const p = gl.createProgram(), sh = [];
  for (const [type, src] of [[gl.VERTEX_SHADER, vert], [gl.FRAGMENT_SHADER, frag]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(p, s);
    sh.push(s);
  }
  gl.bindAttribLocation(p, 0, 'a_pos');
  gl.linkProgram(p);
  return { p, sh, label };
}
function finishProgram(gl, sp) {
  const { p, sh, label } = sp;
  if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
    const log = sh.map(s => gl.getShaderInfoLog(s)).join('\n') + gl.getProgramInfoLog(p);
    throw new Error(`print3d: the ${label} shader did not build\n${log}`);
  }
  for (const s of sh) gl.deleteShader(s);
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), loc = {};
  for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); loc[u.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, u.name); }
  return { p, loc };
}

// one glyph atlas per page: the type ramp from blank to full, white on clear, in the page's mono
// font (--font-mono, e.g. Geist Mono from Google Fonts), redrawn once that font has loaded
const RAMP = ' .:-=+*#%@';
const atlas = { canvas: null, font: '', version: 0, waiting: false, listeners: new Set() };
function monoFamily() {
  const v = HAS_DOM ? getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() : '';
  return v || 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace';
}
function glyphAtlas() {
  const family = monoFamily();
  if (atlas.canvas && atlas.font === family) return atlas.canvas;
  const w = 40, h = 64, c = atlas.canvas || document.createElement('canvas');
  c.width = w * RAMP.length; c.height = h;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  x.fillStyle = '#fff';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const font = `600 ${Math.round(h * 0.8)}px ${family}`;
  x.font = font;
  for (let i = 0; i < RAMP.length; i++) x.fillText(RAMP[i], (i + 0.5) * w, h * 0.55);
  atlas.canvas = c; atlas.font = family; atlas.version++;
  if (document.fonts && !atlas.waiting && !document.fonts.check(font)) {
    atlas.waiting = true;
    document.fonts.load(font).then(() => { atlas.waiting = false; atlas.font = ''; glyphAtlas(); atlas.listeners.forEach(f => f()); }).catch(() => { atlas.waiting = false; });
  }
  return c;
}

/* ------------------------------------------------------------------ page styles (once) */

const PAUSE_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.2v9.6c0 .5.5.8.9.5l7.2-4.8c.4-.3.4-.8 0-1L4.9 1.7c-.4-.3-.9 0-.9.5Z"/></svg>';
let styled = false;
function injectStyles() {
  if (styled || !HAS_DOM) return;
  styled = true;
  const s = document.createElement('style');
  s.dataset.print3d = '';
  // the host fills its panel or frame; the pause button looks like system.css's .loop-pause where
  // that is not loaded (zero specificity, so the page's own rule wins)
  s.textContent = `
.print3d { overflow: clip; }
:is(.panel, .panel__screen, .frame) > .print3d { position: absolute; inset: 0; z-index: 1; max-width: none; border-radius: inherit; }
.print3d > canvas { position: absolute; left: 0; top: 0; display: block; pointer-events: none; }
.print3d__hit { position: absolute; inset: 0; z-index: 2; border-radius: inherit; outline: none; -webkit-tap-highlight-color: transparent; }
.print3d__hit[role="button"] { cursor: pointer; }
.print3d__hit:focus-visible { box-shadow: inset 0 0 0 2px var(--print3d-ring, #111), inset 0 0 0 4px var(--print3d-ring-in, #fff); }
:where(.print3d-pause) { position: absolute; right: 12px; bottom: 12px; z-index: 6; display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; cursor: pointer; background: var(--ink, #111); color: var(--bg, #fff); box-shadow: 0 1px 3px rgb(0 0 0 / .18); }
:where(.print3d-pause) svg { width: 14px; height: 14px; fill: currentColor; }
@media (prefers-reduced-motion: reduce) { .print3d > canvas { transition: none !important; } .print3d-pause { display: none !important; } }
`;
  document.head.appendChild(s);
}

/* ------------------------------------------------------------------ maths */

const norm = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// row-major 3x3 products and the column-major array GLSL wants
const mul3 = (A, B) => { const r = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return r; };
const colMajor = M => [M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]];
const transpose = M => [M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]];
const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
const ease = s => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);

/* ------------------------------------------------------------------ the context pool */

/**
  Light on an integrated laptop GPU. All print-* objects of a page share a small pool of live WebGL
  contexts:
  - config.maxLive (2): contexts the objects may hold at once, so a page with its grounds and one
    other live effect stays within 3.
  - An object holds a context only while something on it moves near the screen (its turn, the
    pointer, a step). A still object draws once, keeps that frame as a plain 2D picture and frees its
    context after config.idleMs; it takes one again when the pointer comes onto its card.
  - An object the visitor is touching takes the place of one that only turns, and so does one that
    has not drawn its first frame yet (with two turning objects near the screen a third would
    otherwise show only its poster); the one that turned holds still on its last frame until a
    place is free.
  - Off screen (beyond 40% of the viewport) or in a hidden tab the context is freed at once.
  config.maxCanvasPx: device pixels of one printed canvas (about 1.5 megapixels).
  config.fineTexels: a render's still frame (a picture at rest, the frame kept when the context is
  freed, a reduced-motion frame) is raymarched once at up to one texel per canvas pixel, at most this
  many texels, so the picture that stays on the page is sharp; moving frames keep the budget above.
  config.adapt: slow frames lower the texels, then the march steps, then stop the turn (false only
  for screenshot tests in a CPU-rendered browser, where every frame is slow).
*/
export const config = { maxLive: 2, maxCanvasPx: 1.5e6, fineTexels: 1.2e6, idleMs: 1500, adapt: true };
// The page's one count of live WebGL contexts, window.__tpGl, at most window.__tpGlMax (default 4: the house rule, a laptop's
// integrated GPU). scenes/lib.js glBudget, fx.js (every effect, and fx.glBudget for the ones that make their own),
// print3d.js's pool and liquid-hover all count in it, so a scene, an object, a ground and a moment never add up to
// more than the cap. A gallery or lab that shows many at once sets window.__tpGlMax before the scripts load.
const tpHeld = () => (typeof window !== 'undefined' && window.__tpGl) || 0;
const tpMax = () => (typeof window !== 'undefined' && window.__tpGlMax) || 4;
const tpAdd = n => { if (typeof window !== 'undefined') window.__tpGl = Math.max(0, tpHeld() + n); };
class LiveSet extends Set {
  add(x) { if (!this.has(x)) tpAdd(1); return super.add(x); }
  delete(x) { const r = super.delete(x); if (r) tpAdd(-1); return r; }
  clear() { tpAdd(-this.size); super.clear(); }
}
const pool = { live: new LiveSet(), waiting: [] };
// the contexts objects may hold now: config.maxLive, less what the page's other users (a scene's own canvas, a ground) hold
const poolCap = () => Math.min(config.maxLive, tpMax() - Math.max(0, tpHeld() - pool.live.size));
const unwait = o => { const i = pool.waiting.indexOf(o); if (i >= 0) pool.waiting.splice(i, 1); };
function acquire(o) {
  if (pool.live.has(o)) return true;
  if (pool.live.size >= poolCap()) {
    const held = [...pool.live];
    const victim = held.find(h => !h.busy()) || (o.touched() ? held.find(h => !h.touched()) : null) ||
      (o.fresh() ? held.find(h => !h.touched() && !h.fresh()) : null);
    if (!victim) { if (!pool.waiting.includes(o)) pool.waiting.push(o); return false; }
    pool.live.delete(victim);
    victim.stop(true);
    if (victim.wants() && !pool.waiting.includes(victim)) pool.waiting.push(victim);
  }
  unwait(o);
  pool.live.add(o);
  return true;
}
function release(o) {
  if (!pool.live.delete(o)) { unwait(o); return; }
  while (pool.live.size < poolCap() && pool.waiting.length) {
    const n = pool.waiting.shift();
    if (n.wants()) { pool.live.add(n); n.start(); }
  }
}
/** live WebGL contexts the objects of this page hold now */
export const liveContexts = () => pool.live.size;
/** for tests: how many hold a context and how many wait for one */
export const poolInfo = () => ({ live: pool.live.size, waiting: pool.waiting.length });

/* ------------------------------------------------------------------ define and mount */

/**
  def: { id, name, label, press, base (import.meta.url), glsl, pivot [x,y,z], radius (framing),
         extent [half w, half h] (the box fitted to the frame), bound (rays, default radius), foot
         (floor footprint radius), camera { elev, dist, target }, light [x,y,z] (camera space),
         turn { mode 'spin'|'sway'|'custom', speed (deg/s) | amp (deg) + period (s) }, step 'toggle'|'impulse',
         stepTime (s), kickTime (s an impulse runs), params (own defaults and extras),
         place { card, tile, hero: params }, update(state, dt), texture() }
*/
export function definePrint(def) {
  const params = { ...COMMON_PARAMS };
  for (const [k, v] of Object.entries(def.params || {})) params[k] = { ...(params[k] || {}), ...v };
  const place = def.place || {};
  return {
    id: def.id,
    name: def.name,
    kind: 'form',
    // extra poster plates beyond fallback.png and fallback-dark.png (make-fallbacks.html prints them)
    plates: def.plates || [],
    // the print its print poster (fallback.png) is made in
    posterPrint: def.posterPrint || 'halftone',
    params,
    place,
    /** the shader sources exactly as they are compiled (lint-glsl.mjs checks them for reserved words) */
    source: () => ({ form: formShader(def), print: PRINT_FRAG, vert: FULL_VERT }),
    /** mount(el, { place: 'card'|'tile'|'hero', params, palette }) -> controller */
    mount(el, opts = {}) {
      const preset = typeof opts.place === 'string' ? place[opts.place] || {} : opts.place || {};
      // a preset's narrow: its values for a frame about as tall as it is wide (a phone), unless
      // the page set those params itself
      const { narrow: n, ...wide } = preset, given = opts.params || {};
      const narrow = n ? Object.fromEntries(Object.entries(n).filter(([k]) => given[k] == null)) : null;
      return mountPrint(el, def, params, { ...opts, params: { ...wide, ...given }, narrow, wide });
    },
  };
}

function mountPrint(el, def, schema, opts) {
  if (!HAS_DOM) throw new Error('print3d needs a browser');
  injectStyles();
  const ground = el.parentElement?.closest('[data-fx]') || null;
  const pagePalette = () => normalizePalette(opts.palette || groundPalette(el, ground) || readPalette(el));
  let palette = pagePalette();
  let params = resolve(schema, opts.params);
  // a frame about as tall as wide takes the preset's narrow values (on a resize too)
  let isNarrow = false;
  function applyNarrow() {
    if (!opts.narrow) return false;
    const n = el.clientWidth / Math.max(1, el.clientHeight) < 1.15;
    if (n === isNarrow) return false;
    isNarrow = n;
    const back = Object.fromEntries(Object.keys(opts.narrow).map(k => [k, opts.wide?.[k] ?? schema[k]?.default]));
    params = resolve(schema, { ...params, ...(n ? opts.narrow : back) });
    return true;
  }
  applyNarrow();
  el.classList.add('print3d');
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

  // the picture shown while no context is live: the poster (the object printed ahead of time, from
  // the plates in fallback.png) until the first frame, then the last frame drawn
  const still = document.createElement('canvas');
  still.className = 'print3d__still';
  still.setAttribute('aria-hidden', 'true');
  el.appendChild(still);
  let stillKind = '';   // '', 'poster' or 'frame'

  // the layer that takes the pointer, the keys and the focus ring, above the canvas; a button when
  // a click does something, else a picture
  const label = el.getAttribute('aria-label') || def.label || def.name;
  el.removeAttribute('aria-label');
  const hit = document.createElement('div');
  hit.className = 'print3d__hit';
  el.appendChild(hit);
  const toggle = def.step !== 'impulse';
  function setRole() {
    if (params.interactive) {
      hit.setAttribute('role', 'button');
      hit.tabIndex = 0;
      hit.setAttribute('aria-label', def.press ? `${label}. ${def.press}` : label);
      if (toggle) hit.setAttribute('aria-pressed', String(state.stepT > 0.5)); else hit.removeAttribute('aria-pressed');
      hit.style.pointerEvents = '';
    } else {
      hit.setAttribute('role', 'img');
      hit.removeAttribute('tabindex');
      hit.removeAttribute('aria-pressed');
      hit.setAttribute('aria-label', label);
      hit.style.pointerEvents = 'none';
    }
  }

  const state = {
    t: 0, time: 0, yaw: params.angle * DEG, spin: 0, step: params.step ? 1 : 0, stepT: params.step ? 1 : 0, kick: 99, kicks: 0,
    hover: 0, hoverT: 0, mx: 0, my: 0, mxT: 0, myT: 0, params, dim: 0, k: [0, 0, 0, 0], turnK: 0,
  };
  let canvas = null, gl = null, form = null, print = null, fbo = null, tex = null, texReady = false;
  let glyphTex = null, glyphVer = 0, auxTex = null, vbo = null;
  let fine = false;   // a render's still frame: the march at up to one texel per canvas pixel
  let half = true, W = 0, H = 0, dpr = 1, texW = 1, texH = 1, scaleX = 1, scaleY = 1, cssW = 0, cssH = 0, pixelated = false;
  let budgetK = coarseQuery?.matches ? 0.7 : 1, steps = def.steps || 96, slow = false;
  let destroyed = false, userPaused = false, inView = false, near = false, raf = 0, last = 0, shown = false, failed = '';
  let starting = false, dirty = true, hold = false, idleT = 0, losses = 0, focused = false, warmUntil = 0, warmT = 0;
  const perf = { n: 0, sum: 0, warm: 0, fps: 0 };

  const reduced = () => !!(reducedQuery && reducedQuery.matches);
  const turnOn = () => params.turn > 0 && !userPaused && !slow && !reduced();
  const kicking = () => def.step === 'impulse' && state.kicks > 0 && state.kick < (def.kickTime || 4);
  // the visitor is on it: the pointer, the keyboard focus, a step under way
  const touched = () => state.hoverT > 0 || focused || Math.abs(state.step - state.stepT) > 1e-4 || kicking();
  // something is moving: the turn (or its ease out), the pointer's light, a step, a click's impulse
  const busy = () => turnOn() || state.turnK > 0.001 || state.hoverT > 0 || state.hover > 0.002 || Math.abs(state.step - state.stepT) > 1e-4 ||
    kicking() || !!(def.busy && def.busy(state));
  // it wants a live context: held for a test, or near the screen with a frame to draw or something moving
  const wants = () => !destroyed && !failed && !document.hidden &&
    (hold || (near && (dirty || performance.now() < warmUntil || focused || (!reduced() && busy()))));
  const running = () => !destroyed && inView && !document.hidden && !reduced() && !!gl && !!print && !starting && busy();
  // fresh: no frame of its own drawn yet (only the poster shows)
  let drawnOnce = false;
  const slot = { wants, touched, fresh: () => !drawnOnce && !failed, busy: () => starting || running(), start: () => start(), stop: b => stop(b) };
  state.turnK = turnOn() ? 1 : 0;
  setRole();

  /* ---------- the poster and the kept frame */
  let posterImg = null, posterSrc = null;
  const isRender = () => params.effect === 'render';
  // the plates for this paper and kind of picture; an object whose picture depends on the palette (the
  // globe puts its accent on the sea or the land) picks its own with def.poster(palette, dark, render)
  function posterFile(dark) {
    const own = def.poster && def.poster(palette, dark, isRender());
    const f = own || (isRender() ? (dark ? './fallback-render-dark.png' : './fallback-render.png')
      : dark ? def.fallbackDark || './fallback-dark.png' : def.fallback || './fallback.png');
    return new URL(f, def.base).href;
  }
  // force: the palette changed, so a kept frame is stale and the poster (in the new colours) replaces it
  function loadPoster(force = false) {
    const src = posterFile(isDarkPaper(palette));
    if (posterImg && posterSrc === src) { drawPoster(force); return; }
    posterSrc = src;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { if (!destroyed && posterSrc === src) { posterImg = img; drawPoster(force); } };
    // a missing poster is a fault of the object's folder: say so (the checker reads the console)
    img.onerror = () => { if (!destroyed && posterSrc === src) { console.error(`print3d: ${def.id}: no poster at ${src}`); el.dataset.printPoster = 'missing'; } };
    img.src = src;
  }
  // the shadow under a rendered object: the paper a good deal deeper, toward the ink
  const shadowHex = () => isDarkPaper(palette) ? mixColor(palette.bg, '#000000', 0.7) : mixColor(palette.bg, palette.ink, 0.5);
  /*
    The poster in the palette.
    A print (fallback.png): red ink and floor, green accent, blue the silhouette, layered over the paper.
    A render (fallback-render.png, twice as wide): on the left the plates (red the floor's shadow
    outside the object, green the accent part, blue the coverage), on the right the render itself in
    colour (alpha the coverage) with the accent part in a reference colour (RENDER_REF, or the plate's
    own accent); the accent part is lit again in the page's accent: its light is read back from the
    reference (through the render's tone curve) and put on the new colour. So the poster is the render,
    true to its materials, and a frame that never draws (a shader a GPU rejects) still shows it.
  */
  function drawPoster(force = false) {
    if (!posterImg || destroyed || (shown && !failed)) return;
    if (stillKind === 'frame' && !force && !failed) return;   // a frame drawn since is the better picture
    const render = posterSrc && /fallback-render/.test(posterSrc);
    const W2 = posterImg.naturalWidth, h = posterImg.naturalHeight, w = render ? W2 >> 1 : W2;
    let src;
    if (render) {
      const c = document.createElement('canvas');
      c.width = W2; c.height = h;
      const cx = c.getContext('2d', { willReadFrequently: true });
      cx.drawImage(posterImg, 0, 0);
      src = cx.getImageData(0, 0, W2, h).data;
    }
    still.width = w; still.height = h;
    const x = still.getContext('2d', { willReadFrequently: true });
    x.clearRect(0, 0, w, h);
    if (!render) x.drawImage(posterImg, 0, 0);
    const d = render ? x.createImageData(w, h) : x.getImageData(0, 0, w, h), px = d.data;
    const P = hexRgb(palette.bg).map(v => v * 255), S = hexRgb(palette.surface).map(v => v * 255);
    const I = hexRgb(palette.ink).map(v => v * 255), A = hexRgb(params.accent ? palette.accent : palette.ink).map(v => v * 255);
    const clear = !!params.transparent, body = params.body;
    const SH = hexRgb(shadowHex()).map(v => v * 255);
    // the render: the reference the accent part was rendered in, and the accent to light instead
    const file = (posterSrc || '').split('/').pop();
    const ref = hexRgb(paintColor((def.plates || []).find(p => p.file === file)?.accent || RENDER_REF)).map(lin22);
    const refY = Math.max(1e-4, 0.2126 * ref[0] + 0.7152 * ref[1] + 0.0722 * ref[2]);
    const T = hexRgb(params.accent ? paintColor(palette.accent) : palette.ink).map(lin22);
    for (let i = 0, n = w * h; i < n; i++) {
      const o = i * 4;
      let r = P[0], g = P[1], b = P[2], a = clear ? 0 : 1;
      const over = (C, k) => { if (k <= 0) return; const na = k + a * (1 - k); r = (C[0] * k + r * a * (1 - k)) / na; g = (C[1] * k + g * a * (1 - k)) / na; b = (C[2] * k + b * a * (1 - k)) / na; a = na; };
      if (render) {
        const y = (i / w) | 0, l = (y * W2 + (i - y * w)) * 4, c = l + w * 4;
        const acc = src[l + 1] / 255, cov = src[l + 2] / 255;
        if (cov > 0.02) {
          let col = [src[c], src[c + 1], src[c + 2]];
          if (acc > 0.01) {
            // the light on the reference, back through the tone curve, on the page's accent
            const rad = col.map(v => filmicInv(lin22(v / 255)));
            const E = (0.2126 * rad[0] + 0.7152 * rad[1] + 0.0722 * rad[2]) / refY;
            col = col.map((v, k) => v + (255 * gam22(filmicJs(T[k] * E)) - v) * acc);
          }
          over(col, cov);
        } else over(SH, src[l] / 255);
      } else {
        const kI = px[o] / 255, kA = px[o + 1] / 255, kB = (px[o + 2] / 255) * body;
        // layers over each other, un-premultiplied: paper (or clear), the silhouette's stock, ink, accent
        over(S, kB); over(I, kI); over(A, kA);
      }
      px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = a * 255;
    }
    x.putImageData(d, 0, 0);
    stillKind = 'poster';
    placeStill();
    still.style.transition = 'none';
    still.style.opacity = '1';
  }
  // the poster at the size and place the live print will take (the plates were printed at FB.size
  // in an FB.w x FB.h frame; the picture scales with pixels per unit); a kept frame where the canvas was
  function placeStill() {
    if (stillKind === 'frame') {
      Object.assign(still.style, { position: 'absolute', display: 'block', pointerEvents: 'none', left: '0px', top: '0px', width: cssW + 'px', height: cssH + 'px', imageRendering: pixelated ? 'pixelated' : '' });
      return;
    }
    if (stillKind !== 'poster') return;
    const w = el.clientWidth, h = el.clientHeight, R = def.radius || 0.6, ex = def.extent || [R, R];
    const k = (params.size * Math.min(w / (2 * ex[0]), h / (2 * ex[1]))) / (FB.size * Math.min(FB.w / (2 * ex[0]), FB.h / (2 * ex[1])));
    const pw = FB.w * k, ph = FB.h * k, cx = w / 2 + params.x * w, cy = h / 2 - params.y * h;
    // a dither plate holds one pixel per cell: scaled up crisp
    Object.assign(still.style, { position: 'absolute', display: 'block', pointerEvents: 'none', width: pw + 'px', height: ph + 'px', left: cx - pw / 2 + 'px', top: cy - ph / 2 + 'px', imageRendering: still.width < FB.w * 0.75 ? 'pixelated' : '' });
  }
  // the frame on the live canvas, kept as a 2D picture before the context is freed
  function keepFrame() {
    if (!gl || !print || !shown || gl.isContextLost()) return;
    render();                       // drawn in this task, so the drawing buffer is whole when copied
    still.width = canvas.width; still.height = canvas.height;
    const x = still.getContext('2d');
    x.clearRect(0, 0, still.width, still.height);
    x.drawImage(canvas, 0, 0);
    stillKind = 'frame';
    placeStill();
  }
  function showFallback(reason) {
    failed = reason;
    stop(false);
    syncPause();
    el.dataset.printFallback = reason;
    still.style.opacity = '1';
    loadPoster(true);
  }
  function reveal() {
    if (shown || !canvas) return;
    shown = true;
    if (!drawnOnce) { drawnOnce = true; syncPause(); }
    const c = canvas;
    if (stillKind === 'frame' || reduced()) {
      // the same picture: swap at once
      c.style.transition = 'none'; c.style.opacity = '1';
      requestAnimationFrame(() => { if (shown && canvas === c) still.style.opacity = '0'; });
    } else {
      c.style.transition = 'opacity 320ms ease'; c.style.opacity = '1';
      still.style.transition = 'opacity 320ms ease'; still.style.opacity = '0';
    }
  }

  /* ---------- GL: made when a place in the pool is granted, freed when the object rests or leaves */
  // the sources to build; a test breaks them on purpose with window.__printBreak = 'compile' (a syntax
  // error), 'link' (a uniform whose type differs between the two shaders), 'reserved' (a struct field
  // named flat) or 'empty' (a frame that draws nothing), and each must end on the poster
  function sources() {
    const brk = window.__printBreak || '';
    let frag = formShader(def), vert = FULL_VERT;
    if (brk === 'reserved') frag = frag.replace('out vec4 o;', 'out vec4 o;\nstruct Broken { float flat; };');
    if (brk === 'compile') frag = frag.replace('out vec4 o;', 'out vec4 o;\nfloat brokenOnPurpose = ;');   // a syntax error the word check lets through
    if (brk === 'link') vert = vert.replace('in vec2 a_pos;', 'in vec2 a_pos;\nuniform float u_full;').replace('vec4(a_pos, 0.0, 1.0)', 'vec4(a_pos, u_full * 0.0, 1.0)');
    return { frag, vert };
  }
  let words = null;
  function start() {
    if (gl || starting || failed || destroyed) return;
    if (window.__printForceFallback) { release(slot); return showFallback('forced'); }   // tests: the no-WebGL2 path
    const src = sources();
    // words a laptop's GPU rejects, though CPU-rendered Chrome may compile them: never try, show the poster
    words = words || glslProblems(src.frag).concat(glslProblems(src.vert));
    if (words.length) { console.error(`print3d: ${def.id}: the shader uses words a GPU rejects\n${words.join('\n')}`); release(slot); return showFallback('shader-words'); }
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.opacity = '0';
    let g = null;
    try { g = c.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false }); } catch (_) { g = null; }
    if (!g) { release(slot); return showFallback('no-webgl2'); }
    el.insertBefore(c, hit);
    canvas = c; gl = g; starting = true; texReady = false; shown = false;
    half = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    // build both programs; with parallel compile, poll until done instead of blocking the page
    const t0 = performance.now();
    const par = gl.getExtension('KHR_parallel_shader_compile');
    const pending = [startProgram(gl, src.frag, 'form', src.vert), startProgram(gl, PRINT_FRAG, 'print')];
    const finish = () => {
      if (gl !== g || destroyed) return;
      try {
        form = finishProgram(gl, pending[0]);
        print = finishProgram(gl, pending[1]);
      } catch (err) {
        console.error(err.message);
        release(slot);
        return showFallback('shader-error');
      }
      starting = false;
      state.compileMs = Math.round(performance.now() - t0);
      fit();
      dirty = true;
      sync();
    };
    const poll = () => {
      if (gl !== g || destroyed) return;
      if (gl.isContextLost()) return;
      if (pending.every(sp => gl.getProgramParameter(sp.p, par.COMPLETION_STATUS_KHR))) finish();
      else setTimeout(poll, 16);
    };
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    tex = gl.createTexture();
    fbo = gl.createFramebuffer();
    if (def.texture) {
      auxTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, auxTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, def.texture());
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, def.textureWrap === 'clamp' ? gl.CLAMP_TO_EDGE : gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    c.addEventListener('webglcontextlost', onLost);
    if (par) poll(); else finish();
  }
  // frees the context; with keep, the frame on it stays as a 2D picture
  function stop(keep) {
    clearTimeout(idleT); idleT = 0;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!canvas) return;
    if (keep) keepFrame();
    if (stillKind) { still.style.transition = 'none'; still.style.opacity = '1'; }
    const c = canvas, g = gl;
    canvas = null; gl = form = print = fbo = tex = glyphTex = auxTex = vbo = null;
    texReady = false; starting = false; shown = false; glyphVer = 0;
    c.removeEventListener('webglcontextlost', onLost);
    try { g?.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) { /* gone already */ }
    c.remove();
  }
  // the browser took the context back (too many on the page, a GPU reset): try again later, twice
  function onLost(e) {
    e.preventDefault();
    stop(false);
    release(slot);
    if (++losses > 2) return showFallback('context-lost');
    dirty = true;
    setTimeout(sync, 600 * losses);
  }

  function ensureGlyphs() {
    if (!gl) return;
    const c = glyphAtlas();
    if (glyphTex && glyphVer === atlas.version) return;
    glyphTex = glyphTex || gl.createTexture();
    glyphVer = atlas.version;
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  const onAtlas = () => { if (params.effect === 'ascii') { dirty = true; sync(); } };
  atlas.listeners.add(onAtlas);

  // the screen and the line pitch grow finer in a small frame (a card's panel), so the object reads as
  // a printed render and not as a few coarse dots: 0.55 of the effect's own cell in a card (3.3 CSS px
  // dots), up to 0.85 from about 610 CSS px (dither and type keep theirs: a dither cell is already
  // 2 CSS px, type must stay legible)
  let cellK = 1;
  const cellCss = () => params.cell || CELL[params.effect] * (params.effect === 'halftone' || params.effect === 'engrave' ? cellK : 1);
  // texels the raymarch may use for dots and lines: one per CSS pixel of the frame (0.75 x 0.75 once
  // the frame is large), never more than the object's own budget, less on a phone or after slow frames
  const budget = () => {
    const a = el.clientWidth * el.clientHeight;
    return Math.max(40000, Math.min(def.budget || 480000, a * (a > 480000 ? 0.5625 : 1)) * budgetK);
  };

  /*
    Sizes. Dither: the canvas holds one pixel per cell and the browser scales it up crisp
    (image-rendering: pixelated) by a whole number of device pixels, so the cells stay sharp on any
    screen at the cost of one raymarched texel per cell. Halftone and engraving: the raymarch within
    budget(), the canvas at up to 2 device pixels per CSS pixel for smooth dots and lines. Type: one
    texel per glyph. Every canvas stays within config.maxCanvasPx.
  */
  function fit() {
    if (applyNarrow()) { state.params = params; dirty = true; }
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight), e = params.effect;
    const dev = window.devicePixelRatio || 1;
    cellK = clamp(Math.min(w, h) / 720, 0.55, 0.85);
    pixelated = e === 'dither';
    if (pixelated) {
      const c = Math.max(1, Math.round(cellCss() * dev));
      W = texW = Math.max(1, Math.ceil((w * dev) / c)); H = texH = Math.max(1, Math.ceil((h * dev) / c));
      scaleX = scaleY = 1; dpr = 1 / (cellCss());
      cssW = (texW * c) / dev; cssH = (texH * c) / dev;
    } else {
      dpr = Math.max(0.5, Math.min(dev, DPR_CAP[e] || 2, Math.sqrt(config.maxCanvasPx / (w * h))));
      W = Math.max(1, Math.round(w * dpr)); H = Math.max(1, Math.round(h * dpr));
      cssW = w; cssH = h;
      if (e === 'ascii') {
        const ch = Math.max(4, Math.round(cellCss() * dpr));
        scaleY = ch; scaleX = Math.max(3, Math.round(ch * 0.6));
      } else {
        const s = Math.min(1, Math.sqrt((fine ? Math.max(budget(), Math.min(config.fineTexels, W * H)) : budget()) / (W * H)));
        scaleX = scaleY = 1 / s;
      }
      texW = Math.max(1, Math.ceil(W / scaleX)); texH = Math.max(1, Math.ceil(H / scaleY));
      if (e !== 'ascii') { scaleX = W / texW; scaleY = H / texH; }
    }
    placeStill();
    if (!canvas) return;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    Object.assign(canvas.style, { width: cssW + 'px', height: cssH + 'px', imageRendering: pixelated ? 'pixelated' : '' });
    if (!gl || starting) return;
    if (!texReady || tex.w !== texW || tex.h !== texH) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, texW, texH, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, texW, texH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && half) {
        half = false; texReady = false; gl.bindFramebuffer(gl.FRAMEBUFFER, null); return fit();
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      tex.w = texW; tex.h = texH; texReady = true;
    }
    if (e === 'ascii') ensureGlyphs();
  }

  // camera, object turn, light: everything the form pass needs this frame
  function frameUniforms() {
    const cam = def.camera || {};
    const elev = (cam.elev ?? 16) * DEG, D = cam.dist ?? 6;
    const piv = def.pivot || [0, 0.5, 0];
    const T = [piv[0], cam.target ?? piv[1], piv[2]];
    const ro = [T[0], T[1] + D * Math.sin(elev), T[2] + D * Math.cos(elev)];
    const fwd = norm([T[0] - ro[0], T[1] - ro[1], T[2] - ro[2]]);
    const right = norm(cross(fwd, [0, 1, 0]));
    const up = cross(right, fwd);
    const R = def.radius || 0.6;
    const md = Math.min(W, H);
    // fit the object's own box (half width, half height as seen) into the frame, size of the way
    const ex = def.extent || [R, R];
    const pxPerUnit = params.size * Math.min(W / (2 * ex[0]), H / (2 * ex[1]));
    const focal = (pxPerUnit * D) / md;
    // the object turns, then leans toward the pointer a few degrees
    const tiltY = state.hover * state.mx * 9 * DEG, tiltX = -state.hover * state.my * 6 * DEG;
    const Rm = mul3(rotX(tiltX), rotY(state.yaw + tiltY));
    const M = transpose(Rm);
    // key light (camera space, x right, y up, z toward the viewer): upper left at rest, swung about the
    // vertical by params.light, toward the pointer on hover
    const b0 = def.light || [-0.42, 1.3, 0.72], la = params.light * DEG;
    let lc = norm([b0[0] * Math.cos(la) + b0[2] * Math.sin(la), b0[1], -b0[0] * Math.sin(la) + b0[2] * Math.cos(la)]);
    if (state.hover > 0.001) {
      const hl = norm([state.mx * 0.95, clamp(0.85 + state.my * 0.7, 0.35, 1.6), 0.78]);
      lc = norm(lc.map((v, i) => v + (hl[i] - v) * state.hover * (def.hoverLight ?? 1)));
    }
    const toWorld = c => norm([0, 1, 2].map(i => right[i] * c[0] + up[i] * c[1] - fwd[i] * c[2]));
    const L = toWorld(lc), F = toWorld([0.62, 0.22, 0.75]);
    const LD = (def.lightDist || 4) * R / 0.5;
    const pitch = cellCss() * dpr;
    return {
      u_ro: ro, u_cam: colMajor([right[0], up[0], fwd[0], right[1], up[1], fwd[1], right[2], up[2], fwd[2]]),
      u_rot: colMajor(M), u_pivot: piv, u_light: [piv[0] + L[0] * LD, piv[1] + L[1] * LD, piv[2] + L[2] * LD], u_fill: F, u_focal: focal,
      u_shift: [params.x * W / md, params.y * H / md],
      u_bound: [piv[0], piv[1], piv[2], (def.bound || R) * 1.02],
      u_pix: Math.max(scaleX, scaleY) / (md * focal),
      u_lineFreq: pxPerUnit / pitch,
    };
  }

  function setU(prog, name, v) {
    const l = prog.loc[name];
    if (l == null) return;
    if (typeof v === 'number') gl.uniform1f(l, v);
    else if (v.length === 2) gl.uniform2fv(l, v);
    else if (v.length === 3) gl.uniform3fv(l, v);
    else if (v.length === 4) gl.uniform4fv(l, v);
    else if (v.length === 9) gl.uniformMatrix3fv(l, false, v);
  }

  function render(plate = false) {
    if (!gl || !print || starting || gl.isContextLost()) return;   // not built yet, or gone
    // a render at rest is drawn once, sharp: the march at up to one texel per canvas pixel
    const f = params.effect === 'render' && !plate && !running();
    if (f !== fine) { fine = f; texReady = false; }
    if (!texReady) fit();
    const dark = isDarkPaper(palette);
    const fu = frameUniforms();
    // pass A
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, texW, texH);
    gl.useProgram(form.p);
    for (const [k, v] of Object.entries(fu)) setU(form, k, v);
    setU(form, 'u_res', [texW, texH]);
    setU(form, 'u_scale', [scaleX, scaleY]);
    setU(form, 'u_full', [W, H]);
    setU(form, 'u_time', state.t);
    setU(form, 'u_step', ease(clamp(state.step, 0, 1)));
    setU(form, 'u_kick', state.kick);
    setU(form, 'u_spin', state.spin);
    setU(form, 'u_dark', dark ? 1 : 0);
    setU(form, 'u_hover', state.hover);
    setU(form, 'u_dim', state.dim);
    const rend = params.effect === 'render';
    // a render paints its accent part as enamel or glaze carries the accent (paintColor); a print inks it
    setU(form, 'u_accent', hexRgb(params.accent ? (rend ? paintColor(palette.accent) : palette.accent) : palette.ink));
    setU(form, 'u_floorK', params.shadow);
    setU(form, 'u_floorReach', def.floorReach || 0.11);
    setU(form, 'u_floorAO', def.floorAO ?? 1);
    setU(form, 'u_foot', def.foot || (def.extent ? def.extent[0] : def.radius || 0.5));
    setU(form, 'u_contrast', params.contrast);
    setU(form, 'u_k', state.k);
    setU(form, 'u_render', rend ? (plate ? 2 : 1) : 0);
    if (rend) {
      setU(form, 'u_expo', def.exposure || 1);
      setU(form, 'u_paperC', hexRgb(palette.bg).map(toLin));
      setU(form, 'u_shadowC', hexRgb(shadowHex()));
      setU(form, 'u_poolC', hexRgb(mixColor(palette.bg, palette.ink, 0.3)));
    }
    if (form.loc.u_steps) gl.uniform1i(form.loc.u_steps, steps);
    if (form.loc.u_shSteps) gl.uniform1i(form.loc.u_shSteps, def.shadowSteps || 32);
    if (auxTex && form.loc.u_aux) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, auxTex); gl.uniform1i(form.loc.u_aux, 1); }
    const blank = window.__printBreak === 'empty';   // tests: a GPU that draws nothing
    if (blank) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } else gl.drawArrays(gl.TRIANGLES, 0, 3);
    // pass B
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.useProgram(print.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(print.loc.u_tex, 0);
    if (params.effect === 'ascii') ensureGlyphs();
    if (glyphTex && print.loc.u_glyph) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, glyphTex); gl.uniform1i(print.loc.u_glyph, 2); }
    const e = params.effect;
    const pitch = cellCss() * dpr;
    setU(print, 'u_texSize', [texW, texH]);
    setU(print, 'u_scale', [scaleX, scaleY]);
    setU(print, 'u_mode', EFFECTS.indexOf(e));
    setU(print, 'u_cell', pitch);
    setU(print, 'u_angle', (e === 'halftone' ? 45 : 32) * DEG);
    setU(print, 'u_levels', params.levels);
    setU(print, 'u_debug', params.debug);
    setU(print, 'u_plate', plate ? 1 : 0);
    setU(print, 'u_floorShare', dark ? 0.7 : 0.82);
    setU(print, 'u_glyphN', RAMP.length);
    setU(print, 'u_alpha', params.transparent ? 1 : 0);
    setU(print, 'u_body', e === 'ascii' ? 0 : params.body);
    const ink = palette.ink, acc = params.accent ? palette.accent : ink;
    setU(print, 'u_paper', hexRgb(palette.bg));
    setU(print, 'u_paperIn', hexRgb(palette.surface));
    setU(print, 'u_ink', hexRgb(ink));
    setU(print, 'u_acc', hexRgb(acc));
    setU(print, 'u_floor', hexRgb(mixColor(ink, palette.bg, dark ? 0.3 : 0.18)));
    if (blank) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } else gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (plate) return;
    // the first frame: a shader can build and still draw nothing on some GPU; then the poster stays
    if (!checked) {
      checked = true;
      if (frameEmpty()) { console.error(`print3d: ${def.id}: the first frame came out empty`); release(slot); showFallback('empty-frame'); return; }
    }
    dirty = false; reveal();
  }
  // true when the canvas just drawn shows nothing: no opaque pixel off the paper (or, printed clear
  // over a ground, no pixel with ink); a canvas left clear is empty either way. Read straight from
  // the drawing buffer, 32 whole rows across the frame, so thin strokes (type, wire) are never
  // missed as they are in a scaled-down copy
  let checked = false;
  function frameEmpty() {
    try {
      const P = hexRgb(palette.bg).map(v => v * 255), row = new Uint8Array(W * 4);
      let hits = 0;
      for (let k = 0; k < 32 && hits < 4; k++) {
        gl.readPixels(0, Math.min(H - 1, Math.floor(((k + 0.5) / 32) * H)), W, 1, gl.RGBA, gl.UNSIGNED_BYTE, row);
        for (let i = 0; i < row.length; i += 4) {
          // premultiplied: an opaque frame is compared with the paper, a clear one by its alpha
          if (row[i + 3] > 20 && (params.transparent || Math.abs(row[i] - P[0]) + Math.abs(row[i + 1] - P[1]) + Math.abs(row[i + 2] - P[2]) > 24)) hits++;
        }
      }
      return hits < 4;
    } catch (_) { return false; }   // a buffer that cannot be read is not proof of an empty one
  }

  // per-frame state: turn, eased pointer, step tween, object update
  function advance(dt) {
    const turn = def.turn || { mode: 'spin', speed: 8 };
    const target = turnOn() ? 1 : 0;
    state.turnK += (target - state.turnK) * (1 - Math.exp(-dt * 3));
    if (Math.abs(target - state.turnK) < 2e-3) state.turnK = target;
    state.t += dt * state.turnK;   // the turn's own clock: it stops when the turn is paused
    state.time += dt;
    if (turn.mode === 'custom') { /* the object's update() turns it */ }
    else if (turn.mode === 'sway') state.yaw = params.angle * DEG + (turn.amp || 30) * DEG * Math.sin((state.t * params.speed * 2 * Math.PI) / (turn.period || 16));
    else state.yaw += dt * state.turnK * (turn.speed || 8) * params.speed * DEG;
    const k = 1 - Math.exp(-dt * 6);
    state.mx += (state.mxT - state.mx) * k;
    state.my += (state.myT - state.my) * k;
    state.hover += (state.hoverT - state.hover) * (1 - Math.exp(-dt * 4));
    if (state.hoverT === 0 && state.hover < 0.002) state.hover = 0;
    const st = def.stepTime || 0.9;
    if (state.step < state.stepT) state.step = Math.min(state.stepT, state.step + dt / st);
    else if (state.step > state.stepT) state.step = Math.max(state.stepT, state.step - dt / st);
    state.kick += dt;
    if (def.update) Object.assign(state, def.update(state, dt) || {});
  }

  function loop(ts) {
    raf = 0;
    if (!running()) { if (gl && print && !starting) render(); sync(); return; }
    const dt = last ? Math.min((ts - last) / 1000, 0.1) : 0;
    last = ts;
    advance(dt);
    render();
    if (dt > 0) adapt(dt);
    raf = requestAnimationFrame(loop);
  }
  // slow frames: fewer form texels for dots and lines, fewer march steps for dither and type; under
  // 30 fps the turn stops (the pointer and the step still answer)
  function adapt(dt) {
    if (!config.adapt) return;
    if (perf.warm < 40) { perf.warm++; return; }
    perf.n++; perf.sum += dt;
    if (perf.n < 60) return;
    const avg = perf.sum / perf.n;
    perf.fps = Math.round(1 / avg);
    perf.n = perf.sum = 0;
    if (avg <= 1 / 50) return;
    const e = params.effect;
    if (e !== 'dither' && e !== 'ascii' && budget() > 90000) { budgetK *= 0.75; fit(); }
    else if (steps > 56) steps = Math.round(steps * 0.8);
    if (avg > 1 / 30 && (e === 'dither' || e === 'ascii' || budget() <= 90000) && steps <= 56 && !slow) { slow = true; syncPause(); }
  }
  // a still frame: the rest pose, the step as it stands (a click's impulse shown part way through)
  function restFrame() {
    if (!gl || !print || starting) return;
    state.yaw = params.angle * DEG;
    state.t = 0;
    state.step = state.stepT;
    state.hover = 0;
    state.turnK = 0;
    if (def.update) Object.assign(state, def.update(state, 0) || {});
    render();
  }
  // the one place that decides: take a context, draw, run the frame loop, or keep the frame and free it
  function sync() {
    if (destroyed || failed) return;
    if (!gl) { if (wants() && acquire(slot)) start(); return; }
    if (starting || !print) return;
    if (running()) {
      if (idleT) { clearTimeout(idleT); idleT = 0; }
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
      return;
    }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (dirty && !document.hidden) { if (reduced()) restFrame(); else render(); }
    if (hold) return;
    // off screen, or under reduced motion (nothing moves, so the still frame is the picture): keep the
    // frame and free the context at once
    if (!near || document.hidden || (reduced() && !wants())) { stop(true); release(slot); return; }
    if (!wants() && !idleT) {
      idleT = setTimeout(() => {
        idleT = 0;
        if (gl && !starting && !running() && !wants()) { stop(true); release(slot); }
      }, config.idleMs);
    }
  }

  /* ---------- the pause button: in the bottom-right corner of the panel or frame, for a turning object */
  const box = el.closest('[data-ui-pause-host], .panel__screen, .panel, .frame');
  const pauseHost = box && box !== el ? box : el;
  let pauseBtn = null;
  function syncPause() {
    // no button on a poster: only once the object has drawn a frame of its own and so can turn
    const want = params.turn > 0 && !reduced() && !slow && !failed && drawnOnce;
    if (!want) { if (pauseBtn) { pauseBtn.remove(); pauseBtn = null; } return; }
    if (!pauseBtn) {
      if (pauseHost !== el && pauseHost.querySelector(':scope > .loop-pause')) return;   // the page put its own there
      pauseBtn = document.createElement('button');
      pauseBtn.type = 'button';
      pauseBtn.className = 'loop-pause print3d-pause';
      pauseBtn.addEventListener('click', e => { e.stopPropagation(); userPaused ? ctrl.resume() : ctrl.pause(); });
      pauseHost.appendChild(pauseBtn);
    }
    pauseBtn.setAttribute('aria-label', userPaused ? `Play ${def.name.toLowerCase()} animation` : `Pause ${def.name.toLowerCase()} animation`);
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.innerHTML = userPaused ? PLAY_SVG : PAUSE_SVG;
  }

  /* ---------- pointer, click, keyboard */
  const onMove = e => {
    if (!params.interactive || reduced()) return;
    const r = el.getBoundingClientRect();
    state.mxT = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    state.myT = clamp(1 - ((e.clientY - r.top) / r.height) * 2, -1, 1);
    if (e.pointerType !== 'touch') state.hoverT = 1;
    sync();
  };
  const onLeave = () => { state.hoverT = 0; sync(); };
  // the pointer came onto the card: take a context now, so it is ready when the pointer reaches the object
  const card = el.closest('.card, article, [data-print-card]') || el;
  const onWarm = () => {
    if (!params.interactive || reduced()) return;
    warmUntil = performance.now() + 4000;
    clearTimeout(warmT); warmT = setTimeout(sync, 4100);
    sync();
  };
  const act = on => {
    if (!params.interactive) return;
    if (def.step === 'impulse') { if (on !== false) { state.kick = reduced() ? (def.kickStill ?? 0.8) : 0; state.kicks++; } }
    else state.stepT = on == null ? (state.stepT > 0.5 ? 0 : 1) : on ? 1 : 0;
    if (toggle) hit.setAttribute('aria-pressed', String(state.stepT > 0.5));
    dirty = true;
    sync();
  };
  const onClick = () => act(null);
  const onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(null); } };
  const onFocus = () => { focused = true; sync(); };
  const onBlur = () => { focused = false; sync(); };
  hit.addEventListener('pointermove', onMove, { passive: true });
  hit.addEventListener('pointerleave', onLeave, { passive: true });
  hit.addEventListener('click', onClick);
  hit.addEventListener('keydown', onKey);
  hit.addEventListener('focus', onFocus);
  hit.addEventListener('blur', onBlur);
  card.addEventListener('pointerenter', onWarm, { passive: true });

  /*
    The paper under a clear object on a ground that has not drawn (still baking, a bake that never
    came, a ground left to the page): the object is printed for the ground's colours, so until the
    ground shows a picture of its own (a canvas, its CSS stand-in) the object lays that paper itself,
    flat, in the ground's own colour; never a pale lamp on a pale panel. It fades out when the
    ground draws.
  */
  const groundDrawn = () => !ground || !!(ground.style.background || ground.style.backgroundImage || ground.dataset.fxFallback != null ||
    ground.querySelector(':scope > canvas.fx-canvas.is-baked, :scope > canvas.fx-canvas[style*="opacity: 1"]'));
  let paperKey = null;
  function applyPalette() {
    el.style.setProperty('--print3d-ring', palette.ink);
    el.style.setProperty('--print3d-ring-in', params.transparent ? palette.surface : palette.bg);
    const own = !params.transparent || (!!ground && !groundDrawn());
    const key = own ? palette.bg : '';
    if (key === paperKey) return;   // unchanged: no style write (the ground's observer would see it)
    paperKey = key;
    el.dataset.printPaper = own ? 'own' : 'ground';
    el.style.backgroundColor = key;
  }
  applyPalette();
  loadPoster();
  fit();
  syncPause();

  // in view: frames run; near (40% of a screen away): a context may be taken or kept
  const io = new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; sync(); }, { rootMargin: '0px' });
  const nearIO = new IntersectionObserver(es => { near = es[es.length - 1].isIntersecting; sync(); }, { rootMargin: '40% 0px' });
  io.observe(el); nearIO.observe(el);
  const ro = new ResizeObserver(() => { fit(); dirty = true; sync(); });
  ro.observe(el);
  const onVis = () => sync();
  const onReduced = () => { syncPause(); dirty = true; sync(); };
  document.addEventListener('visibilitychange', onVis);
  reducedQuery?.addEventListener?.('change', onReduced);
  // the ground's palette arrives when system.js lights it (or changes with a theme switch)
  let mo = null, paperMo = null;
  if (ground && !opts.palette) {
    mo = new MutationObserver(() => ctrl.setPalette(null));
    mo.observe(ground, { attributes: true, attributeFilter: ['data-fx-palette'] });
  }
  // the ground draws (its canvas comes in or fades up, its stand-in is set) or is cleared for a new
  // bake: the own paper goes or comes back
  if (ground) {
    el.style.transition = 'background-color 320ms ease';
    paperMo = new MutationObserver(ms => { if (ms.some(m => m.target !== el && !el.contains(m.target))) applyPalette(); });
    paperMo.observe(ground, { attributes: true, attributeFilter: ['style', 'class', 'data-fx-fallback'], childList: true, subtree: true });
  }

  const ctrl = {
    get canvas() { return canvas; },
    /** stops the object's own turn (the pointer and a click still answer); the pause button calls it */
    pause() { userPaused = true; syncPause(); sync(); },
    resume() { userPaused = false; syncPause(); sync(); },
    get paused() { return userPaused; },
    get params() { return { ...params }; },
    set(next) {
      params = resolve(schema, { ...params, ...next }); state.params = params;
      setRole(); applyPalette(); syncPause(); fit();
      if (stillKind === 'poster') drawPoster();
      dirty = true; sync();
      return params;
    },
    /** a palette { bg, surface, ink, muted, accent, accentInk }, or null to read it again from the page or the ground */
    setPalette(p) {
      if (p) opts = { ...opts, palette: p };
      const next = normalizePalette(p || pagePalette());
      if (JSON.stringify(next) === JSON.stringify(palette)) return;   // the same colours: keep the frame
      palette = next;
      applyPalette();
      if (!shown) loadPoster(true);
      dirty = true; sync();
    },
    step(on) { act(on); },
    /** keeps a live context until release() (tests, make-fallbacks.html); resolves once it can draw */
    ready() {
      hold = true; sync();
      return new Promise(res => { const t = () => ((gl && print && !starting) || failed || destroyed ? res(ctrl) : setTimeout(t, 30)); t(); });
    },
    release() { hold = false; sync(); },
    /** a still frame at time t (seconds) with the pointer at (mx, my) -1..1 and hover 0..1, for tests (after ready()) */
    pose({ t = state.t, mx = 0, my = 0, hover = 0, step, kick } = {}) {
      userPaused = true; syncPause();
      state.t = 0; state.time = 0; state.yaw = params.angle * DEG; state.spin = 0; state.own = null; state.kick = 99; state.turnK = params.turn > 0 ? 1 : 0;
      if (step != null) { state.stepT = step; state.step = step; }
      state.mx = state.mxT = mx; state.my = state.myT = my; state.hover = state.hoverT = hover;
      const n = Math.max(1, Math.round(t * 30));
      for (let i = 0; i < n; i++) { state.turnK = params.turn > 0 ? 1 : 0; advance(t / n); }
      if (kick != null) { state.kick = kick; state.kicks = 1; if (def.update) Object.assign(state, def.update(state, 0) || {}); }
      state.mx = mx; state.my = my; state.hover = hover;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      render();
    },
    /** the canvas as a PNG data URL, drawn now (after ready()); plate: the poster's plates (make-fallbacks.html) */
    snapshot(plate = false) { if (!gl) return ''; render(plate); const u = canvas.toDataURL('image/png'); if (plate) render(); return u; },
    get info() {
      return { webgl: gl ? 2 : 0, live: !!gl, pool: pool.live.size, fallback: el.dataset.printFallback || null, size: [W, H], css: [cssW, cssH], dpr, form: [texW, texH], steps, half,
        fps: perf.fps, compileMs: state.compileMs, running: running(), turning: turnOn(), shown, still: stillKind, palette,
        near, inView, dirty, starting, waiting: pool.waiting.includes(slot), wants: wants() };
    },
    destroy() {
      destroyed = true;
      stop(false);
      release(slot);
      clearTimeout(warmT);
      io.disconnect(); nearIO.disconnect(); ro.disconnect(); mo?.disconnect(); paperMo?.disconnect();
      atlas.listeners.delete(onAtlas);
      document.removeEventListener('visibilitychange', onVis);
      reducedQuery?.removeEventListener?.('change', onReduced);
      card.removeEventListener('pointerenter', onWarm);
      still.remove(); hit.remove(); pauseBtn?.remove();
      el.classList.remove('print3d');
      el.style.backgroundColor = ''; el.style.transition = ''; delete el.dataset.printPaper;
      el.setAttribute('aria-label', label);
    },
  };
  return ctrl;
}
