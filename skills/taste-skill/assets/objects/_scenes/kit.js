/*
  _scenes/kit.js - the shared runtime of the scene objects (product-turntable, exploded-layers,
  split-reveal, dot-object, dither-sequence). Not an object itself; README.md beside it is the
  contract a page uses, auto.js mounts every [data-scene].

  stage(el, spec) makes one WebGL canvas in el and runs it through fx.lifecycle: it makes the context
  only once there is something to draw (spec.loaded), draws only while el is near the screen and the
  tab is visible, shows one still frame under prefers-reduced-motion (direct manipulation still
  redraws), counts the context in the page's WebGL budget and puts spec.fallback() in its place
  (never an empty panel) when: there is no WebGL; a shader breaks a rule of GLSL ES 1.00 or 3.00
  (glslLint, read before every compile: the CPU renderer of the test Chromes accepts words a laptop's
  GPU rejects); a shader fails to compile or link; init() or a frame throws; the first frame comes
  out one flat colour; the context is lost twice; or the object calls s.fail() (its photograph did
  not load). An object that moves by itself (spec.loops) gets the
  shared 32px pause disc (.loop-pause) in the bottom-right corner of its panel or frame, unless the
  page put one there.

  Contexts are held only while something moves: a scene that is still (no loop of its own, or paused,
  and no pointer on it for config.idleMs) or off screen for config.releaseMs draws one last frame,
  keeps it as a plain 2D picture (canvas.obj-still) and frees its context; the pointer, a redraw or a
  resize makes it again. At most config.live scene contexts live at once, a hard cap: off-screen
  ones, then idle ones, then still ones that hold a finished picture give theirs up (keeping it as a
  picture); a scene that finds none to free waits a moment and tries again.

  Cost, for an integrated laptop GPU: a smooth canvas renders at most 1 canvas px per CSS px (0.75
  for a heavy one in a frame over 1 MP of CSS px) and never over 1.5 MP (photo-kit's renderScale); a
  crisp (dithered) canvas holds one pixel per dither cell. No MSAA. An object draws only when
  something changed (its frame() returns early otherwise) and may ask for fewer frames while it only
  idles (spec.fps).

  spec = {
    cell,            CSS px per canvas pixel for crisp (dithered) scenes, or a function of the stage;
                     0 or absent = smooth, at the render scale above
    heavy,           true: 0.75 canvas px per CSS px in a large frame
    loops,           true (or a function of the stage) when the object moves by itself: adds the pause disc
    init(gl, s),     build programs, buffers and textures (again after a lost or released context)
    frame(gl, t, dt, s), draw one frame; t in seconds, dt 0 on a still or forced frame. Draw when
                     s.dirty or dt === 0 or something moved, else return before any draw call (the
                     canvas keeps its last picture)
    fps(s),          optional: frames per second wanted now (default 60); 30 for an idle loop
    resize(s),       optional, after the canvas changed size
    fallback(),      optional: a Node shown when there is no WebGL or the object failed
    failed(),        optional: called once the fallback is in (hide the object's own overlays)
    loaded(),        optional: false while there is nothing to draw yet (no context is made before)
    ready(),         optional: false until the first frame is worth showing (a photograph loading)
    still,           seconds used for the reduced-motion still frame (default 2)
  }
  s (the stage) = { gl, canvas, gl2, w, h (canvas px), cssW, cssH, dpr (canvas px per CSS px), k (device
    px per canvas px), pointer: { x, y (CSS px in el), u, v (0..1), inside, down, type, t },
    reduced, running, dirty, fallen, invalidate(), redraw(), pause(), resume(), fail(), program(frag,
    vert?), texture(src, opts), buffer(data), fullscreen(), destroy() }
*/
import fx from '../../effects/fx.js';
import { photoCredit, creditsLine, renderScale } from '../photo-kit/photo.js';

export const { color, normalizePalette, readPalette, GLSL_LIB } = fx;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export { clamp };
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/** frame-rate independent approach: value moves toward target with rate k per second */
export const approach = (v, target, k, dt) => v + (target - v) * (1 - Math.exp(-k * dt));
const rq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
export const reducedMotion = () => !!(rq && rq.matches);

/** live scene contexts a page keeps (with the page's ground and one other effect: 3 or fewer) */
export const config = { live: 2, releaseMs: 1500, idleMs: 1600 };

let cssProbe = null;
/** any CSS colour (rgb(), oklab(), color(srgb ...)) -> '#rrggbb', null when it is transparent */
function cssHex(value) {
  if (!value || typeof document === 'undefined') return null;
  cssProbe = cssProbe || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  cssProbe.canvas.width = cssProbe.canvas.height = 1;
  cssProbe.clearRect(0, 0, 1, 1);
  cssProbe.fillStyle = '#000';
  cssProbe.fillStyle = value;
  cssProbe.fillRect(0, 0, 1, 1);
  const d = cssProbe.getImageData(0, 0, 1, 1).data;
  if (d[3] < 250) return null;
  return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
  The palette a scene prints with: the one given; else the page tokens read at el (--bg, --surface,
  --ink, --muted, --accent), with the ground of the box it sits in (a .panel on --surface) as its bg.
*/
export function paletteOf(el, palette) {
  if (palette) return normalizePalette(palette);
  const p = readPalette(el);
  if (typeof document === 'undefined') return p;
  for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
    const hex = cssHex(getComputedStyle(n).backgroundColor);
    if (hex) {
      if (hex === p.bg) return p;
      // a dark box on a light page (or the other way round) prints in a light ink (or a dark one)
      const flip = color.isDark(hex) === color.isDark(p.ink);
      const ink = flip ? (color.isDark(hex) ? '#f2f2f2' : '#111111') : p.ink;
      return normalizePalette({ ...p, bg: hex, surface: p.bg, ink, muted: flip ? color.mix(ink, hex, 0.45) : p.muted });
    }
    if (n.matches('.panel, .panel__screen, .frame, section')) break;
  }
  return p;
}

/** the page's monospace face for labels the objects draw over their canvas */
export const MONO = 'var(--font-mono, var(--mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace))';

/* ------------------------------------------------------------------ photographs */

const HERE = typeof document !== 'undefined' ? new URL('../photo-kit/', import.meta.url) : null;
const baseURI = () => (typeof document !== 'undefined' ? document.baseURI : 'http://localhost/');

/** width / height of a photograph entry (ratio, size [w, h], or width and height), 1.5 if unknown */
export function ratioOf(p, fallback = 1.5) {
  if (!p || typeof p === 'string') return fallback;
  if (p.ratio) return p.ratio;
  if (Array.isArray(p.size) && p.size[1]) return p.size[0] / p.size[1];
  if (p.width && p.height) return p.width / p.height;
  return fallback;
}

/**
  A photograph -> a URL at about `width` px wide. It takes:
  - a URL or a path (relative to the page): 'assets/img/bench.jpg'
  - { src } (a URL or a page-relative path) with the credit fields beside it
  - an entry of photo-kit/photos.json as it is ({ key, file: 'photos/lamp.jpg', ... }): the file is
    read from photo-kit; { file, base } resolves the file against base instead
  - a Wikimedia Commons entry { url: 'https://upload.wikimedia.org/...' } (a thumbnail is used)
  - a Lorem Picsum entry { id, ratio } (Unsplash photographs)
*/
export function photoURL(p, width = 1600) {
  if (!p) return '';
  if (typeof p === 'string') return new URL(p, baseURI()).href;
  if (p.src) return new URL(p.src, baseURI()).href;
  if (p.file) return new URL(p.file, p.base || (p.key != null || p.libraryId != null ? HERE : baseURI())).href;
  if (p.url && /upload\.wikimedia\.org/.test(p.url)) {
    const m = p.url.split('?')[0].match(/\/commons\/(\w)\/(\w\w)\/([^/]+)$/);
    if (!m) return p.url;
    const w = [960, 1280, 1920].find(x => x >= width) || 1920;
    if (p.width && p.width <= w) return p.url;
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/${w}px-${m[3]}`;
  }
  // a library entry's bare Lorem Picsum address (https://picsum.photos/id/124) takes a size
  const pic = p.url && p.url.match(/^https?:\/\/(?:fastly\.)?picsum\.photos\/id\/(\d+)\/?$/);
  if (pic) return photoURL({ id: pic[1], ratio: ratioOf(p) }, width);
  if (p.url) return p.url;
  if (p.id != null) {
    const ratio = ratioOf(p);
    const w = Math.round(width), h = Math.round(width / ratio);
    return `https://picsum.photos/id/${p.id}/${w}/${h}`;
  }
  return '';
}

const LICENCE_URLS = {
  'cc0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc by 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'cc by 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'cc by 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'cc by-sa 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'cc by-sa 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'cc by-sa 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'unsplash licence': 'https://unsplash.com/license',
};
/** an entry as photo-kit's credit wants it: the licence named and linked, the source known */
function creditEntry(p) {
  let licence = p.licence || (p.id != null && !p.url && !p.file && !p.src ? 'Unsplash licence' : '');
  if (/^unsplash( licen[cs]e)?$/i.test(licence)) licence = 'Unsplash licence';
  const licenceUrl = p.licenceUrl || LICENCE_URLS[licence.toLowerCase().replace(/\s+/g, ' ')] || '';
  const source = p.source || (/unsplash/i.test(licence) ? 'unsplash' : /wikimedia/.test(p.url || p.page || '') ? 'commons' : '');
  return { by: p.by, page: p.page, licence, licenceUrl, source: /^commons$/i.test(source) ? 'Wikimedia Commons' : source };
}
/**
  The credit (HTML) one photograph needs wherever it is shown: photo-kit's photoCredit, the licence
  linked and "adapted" (a print changes the picture, which CC BY and BY-SA ask to be said). A picsum
  entry without a licence is an Unsplash photograph. '' for a bare URL or an entry without an author.
*/
export function credit(p) {
  if (!p || typeof p === 'string' || !p.by) return '';
  return photoCredit(creditEntry(p));
}
/**
  The footer's one credits line for every photograph the page's scenes print (HTML), each named once:
  'Photographs: A on Unsplash, adapted; B, CC BY-SA 4.0, via Wikimedia Commons, adapted.' Put it in
  the footer's single line of small print, never under the picture. '' when nothing needs a credit
  (the client's own photographs).
*/
export function credits(list) {
  const seen = new Set();
  const out = [];
  for (const p of (list || []).flat()) {
    if (!p || typeof p === 'string' || !p.by) continue;
    const key = p.page || p.url || p.by;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...creditEntry(p), adapted: true });
  }
  return creditsLine(out);
}

const imageCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.reject(new Error('objects: no photograph'));
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((res, rej) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.decoding = 'async';
      im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => res(im));
      im.onerror = () => { imageCache.delete(src); rej(new Error('objects: could not load ' + src)); };
      im.src = src;
    }));
  }
  return imageCache.get(src);
}

/** read an image into an ImageData of at most maxW px wide (for analysis on the CPU) */
export function pixels(img, maxW = 320) {
  const s = Math.min(1, maxW / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  return g.getImageData(0, 0, w, h);
}

/** luminance percentiles of an image: [lo, hi] at 2% and 98%, for auto levels */
export function levels(img) {
  const d = pixels(img, 160).data, hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < d.length; i += 4) { hist[Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])]++; n++; }
  let acc = 0, lo = 0, hi = 255;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= n * 0.02) { lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= n * 0.02) { hi = i; break; } }
  if (hi - lo < 40) { const m = (hi + lo) / 2; lo = Math.max(0, m - 20); hi = Math.min(255, m + 20); }
  return [lo / 255, hi / 255];
}

/**
  A softened copy of an image at about `w` px wide (a 2D canvas, for a texture read once per screen
  cell: smooth where a mipmap level is blocky). blur in px of the copy.
*/
export function softCopy(img, w, blur = 0.8) {
  const W = Math.max(8, Math.round(w)), H = Math.max(8, Math.round((W * img.naturalHeight) / img.naturalWidth));
  const t = document.createElement('canvas');
  t.width = W; t.height = H;
  const tg = t.getContext('2d');
  tg.imageSmoothingQuality = 'high';
  tg.drawImage(img, 0, 0, W, H);
  if (!(blur > 0)) return t;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  // a slightly larger copy underneath, so the blurred border has picture under it
  const pad = Math.ceil(blur * 3);
  g.drawImage(t, -pad, -pad, W + 2 * pad, H + 2 * pad);
  g.filter = `blur(${blur}px)`;
  g.drawImage(t, 0, 0);
  g.filter = 'none';
  return c;
}

/** cover fit: the uv scale and offset that fill a w x h frame with an image of aspect ia (w/h), focus fx,fy */
export function cover(w, h, ia, fxp = 0.5, fyp = 0.5, zoom = 1) {
  const fa = w / h;
  let sx = 1, sy = 1;
  if (fa > ia) sy = ia / fa; else sx = fa / ia;
  sx /= zoom; sy /= zoom;
  const ox = clamp(fxp - sx / 2, 0, 1 - sx), oy = clamp(fyp - sy / 2, 0, 1 - sy);
  return [sx, sy, ox, oy];
}

/* ------------------------------------------------------------------ palette */

/**
  The tones a dithered scene prints with. ink amount 0 is the background; 1 is the ink. On a light
  page the ink is dark (shadows take ink); on a dark page the ink is light (light takes ink).
  r: four tones from bg to ink, a: three accent tones (deep, accent, bright), dark: true on a dark bg.
*/
export function tones(palette) {
  const p = normalizePalette(palette);
  const Lb = color.lab(p.bg)[0], Li = color.lab(p.ink)[0], Lm = color.lab(p.muted)[0];
  const between = (Lm - Lb) / (Li - Lb || 1);
  const r2 = between > 0.45 && between < 0.85 ? p.muted : color.mix(p.bg, p.ink, 0.64);
  const dark = Lb < Li;
  return {
    p, dark,
    r: [p.bg, color.mix(p.bg, p.ink, 0.3), r2, p.ink].map(color.vec3),
    a: [color.mix(p.accent, dark ? p.bg : p.ink, 0.38), p.accent, color.mix(p.accent, dark ? p.ink : p.bg, 0.42)].map(color.vec3),
    hex: { bg: p.bg, surface: p.surface, ink: p.ink, muted: p.muted, accent: p.accent, accentInk: p.accentInk },
  };
}

/** GLSL: print an ink amount (0..1) with a 4-tone ramp and an 8x8 ordered dither at cell c */
export const GLSL_PRINT = /* glsl */ `
uniform vec3 u_r0, u_r1, u_r2, u_r3, u_a0, u_a1, u_a2;
vec3 printInk(float a, vec2 c) {
  float v = clamp(a, 0.0, 1.0) * 3.0;
  float i = floor(v);
  i += step(fx_bayer(c) + 0.5 / 64.0, v - i);
  return i < 0.5 ? u_r0 : i < 1.5 ? u_r1 : i < 2.5 ? u_r2 : u_r3;
}
vec3 printAccent(float a, vec2 c) {
  float v = clamp(a, 0.0, 1.0) * 2.0;
  float i = floor(v);
  i += step(fx_bayer(c) + 0.5 / 64.0, v - i);
  return i < 0.5 ? u_a0 : i < 1.5 ? u_a1 : u_a2;
}
`;
export function setTones(gl, prog, t) {
  ['u_r0', 'u_r1', 'u_r2', 'u_r3'].forEach((n, i) => prog.set(n, t.r[i]));
  ['u_a0', 'u_a1', 'u_a2'].forEach((n, i) => prog.set(n, t.a[i]));
}

/* ------------------------------------------------------------------ page styles (once) */

const PAUSE_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.2v9.6c0 .5.5.8.9.5l7.2-4.8c.4-.3.4-.8 0-1L4.9 1.7c-.4-.3-.9 0-.9.5Z"/></svg>';
let styled = false;
function injectStyles() {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const st = document.createElement('style');
  st.dataset.scenes = '';
  // zero specificity, so system.css's and ui/base.css's .loop-pause win where the page loads them
  st.textContent = `
:where(.panel, .panel__screen, .frame) > :where([data-scene]) { position: absolute; inset: 0; border-radius: inherit; }
:where(.scene-pause) { position: absolute; right: 12px; bottom: 12px; z-index: 6; display: grid; place-items: center; width: 32px; height: 32px; margin: 0; padding: 0; border-radius: 50%; cursor: pointer;
  border: 1px solid color-mix(in oklab, var(--ink, #111) 16%, transparent); background: var(--bg, #fff); color: var(--ink, #111);
  box-shadow: 0 1px 2px rgb(0 0 0 / .12), 0 4px 12px -4px rgb(0 0 0 / .28); opacity: .88; -webkit-tap-highlight-color: transparent; }
:where(.scene-pause)::before { content: ""; position: absolute; inset: -6px; border-radius: 50%; }
:where(.scene-pause):is(:hover, :focus-visible) { opacity: 1; }
:where(.scene-pause):focus-visible { outline: 2px solid var(--ink, #111); outline-offset: 2px; }
:where(.scene-pause) svg { display: block; width: 14px; height: 14px; fill: currentColor; }
:where(.scene-pause)[aria-pressed="true"] svg { margin-left: 1px; }
:where(.scene-label) { font-family: ${MONO}; font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .scene-pause { display: none !important; } }
`;
  document.head.appendChild(st);
}

/* ------------------------------------------------------------------ GLSL lint */

/*
  The test Chromes render WebGL on the CPU (SwiftShader), which compiles some shaders a laptop's GPU
  rejects: a struct field named `flat` once left a hero empty on a real machine. And a scene compiles
  as GLSL ES 3.00 (WebGL2) or 1.00 (WebGL1), whichever the browser gives. So every shader is read
  before it is compiled, against the rules of both versions; one that breaks them is never compiled
  and the scene shows its fallback, the same on every machine (and in every screenshot test).
*/
const words = s => s.trim().split(/\s+/);
const GLSL_TYPES = words(`void bool int uint float vec2 vec3 vec4 bvec2 bvec3 bvec4 ivec2 ivec3 ivec4 uvec2 uvec3 uvec4
  mat2 mat3 mat4 mat2x2 mat2x3 mat2x4 mat3x2 mat3x3 mat3x4 mat4x2 mat4x3 mat4x4 sampler2D sampler3D samplerCube
  sampler2DShadow samplerCubeShadow sampler2DArray sampler2DArrayShadow isampler2D isampler3D isamplerCube isampler2DArray
  usampler2D usampler3D usamplerCube usampler2DArray samplerExternalOES`);
// keywords of either version: never a name, never a field
const GLSL_KEYWORDS = new Set([...GLSL_TYPES, ...words(`attribute const uniform varying layout centroid flat smooth in out
  inout invariant lowp mediump highp precision break continue do for while switch case default if else discard return
  struct true false`)]);
// reserved for future use by either version: a conforming compiler rejects them anywhere
const GLSL_FUTURE = new Set(words(`asm class union enum typedef template this packed resource goto inline noinline
  volatile public static extern external interface long short double half fixed unsigned superp input output hvec2 hvec3
  hvec4 dvec2 dvec3 dvec4 fvec2 fvec3 fvec4 dmat2 dmat3 dmat4 sizeof cast namespace using coherent restrict readonly
  writeonly atomic_uint noperspective patch sample subroutine common partition active filter precise buffer shared`));
// the image and sampler types of later versions (image2D, iimageCube, sampler2DMS...), not every name
// that starts with "image" (imageUV is a fine name)
const GLSL_FUTURE_RX = /^[iu]?(image(1D|2D|3D|Cube|Buffer|2DRect|1DArray|2DArray|CubeArray|2DMS|2DMSArray)|sampler(1D|2DMS|2DRect|3DRect|Buffer|CubeArray)\w*)$/;
// built-in functions: a variable, field or function of that name hides or redefines it (an error in 1.00)
const GLSL_BUILTINS = new Set(words(`radians degrees sin cos tan asin acos atan sinh cosh tanh asinh acosh atanh pow exp
  log exp2 log2 sqrt inversesqrt abs sign floor trunc round roundEven ceil fract mod modf min max clamp mix step
  smoothstep isnan isinf length distance dot cross normalize faceforward reflect refract matrixCompMult outerProduct
  transpose determinant inverse lessThan lessThanEqual greaterThan greaterThanEqual equal notEqual any all not texture
  texture2D texture2DLod texture2DProj textureCube textureLod textureProj textureSize texelFetch textureGrad
  textureOffset dFdx dFdy fwidth floatBitsToInt floatBitsToUint intBitsToFloat uintBitsToFloat packHalf2x16
  unpackHalf2x16 packUnorm2x16 unpackUnorm2x16 packSnorm2x16 unpackSnorm2x16`));
const GL_NAMES = /^gl_(Position|PointSize|FragCoord|FrontFacing|PointCoord|FragColor|FragData|FragDepth|FragDepthEXT|VertexID|InstanceID|DepthRange|Max\w+|Min\w+)$/;
const lintCache = new Map();

/**
  What a strict GLSL ES compiler would reject in a shader source, as ['line 12: "flat" ...'], or []:
  a word reserved for future use, a keyword used as a name or a field, a name with a double
  underscore or an unknown gl_ prefix, and a variable, parameter, field or function named like a
  built-in function or a type. Preprocessor lines are not read.
*/
export function glslLint(src) {
  src = String(src);
  if (lintCache.has(src)) return lintCache.get(src);
  const out = [];
  // comments and preprocessor lines blanked, line numbers kept
  const code = src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/\/\/[^\n]*/g, '')
    .split('\n').map(l => (/^\s*#/.test(l) ? '' : l)).join('\n');
  const lineAt = i => code.slice(0, i).split('\n').length;
  const types = new Set(GLSL_TYPES);
  for (const m of code.matchAll(/\bstruct\s+([A-Za-z_]\w*)/g)) types.add(m[1]);
  // every word (an exponent such as the e5 of 1e5 is not one)
  for (const m of code.matchAll(/(?<!\w)[A-Za-z_]\w*/g)) {
    const w = m[0], at = `line ${lineAt(m.index)}: `;
    if (GLSL_FUTURE.has(w) || GLSL_FUTURE_RX.test(w)) out.push(at + `"${w}" is a reserved word`);
    else if (w.includes('__')) out.push(at + `"${w}": a double underscore is reserved`);
    else if (w.startsWith('gl_') && !GL_NAMES.test(w)) out.push(at + `"${w}": the gl_ prefix is reserved`);
    else if (code[m.index - 1] === '.' && GLSL_KEYWORDS.has(w)) out.push(at + `".${w}": a keyword is never a field`);
  }
  // declared names: a type then a name (a variable, field, parameter or function), and the further
  // names of a list after commas at the same depth ("float a = 1.0, b;")
  const alt = [...types].sort((a, b) => b.length - a.length).join('|');
  const decl = new RegExp(`(?<![\\w.])(?:${alt})(?:\\s*\\[[^\\]]*\\])?\\s+([A-Za-z_]\\w*)`, 'g');
  const check = (n, i) => {
    const at = `line ${lineAt(i)}: `;
    if (GLSL_KEYWORDS.has(n) || GLSL_FUTURE.has(n)) out.push(at + `"${n}" is a keyword or reserved word, not a name`);
    else if (types.has(n)) out.push(at + `"${n}" is a type, not a name`);
    else if (GLSL_BUILTINS.has(n)) out.push(at + `"${n}" is a built-in function: name it otherwise`);
  };
  for (const m of code.matchAll(decl)) {
    const nameAt = m.index + m[0].length - m[1].length;
    check(m[1], nameAt);
    const rest = code.slice(m.index + m[0].length);
    if (/^\s*\(/.test(rest)) continue;   // a function: its parameters have their own types
    let depth = 0;
    for (let j = 0; j < rest.length; j++) {
      const c = rest[j];
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') { if (--depth < 0) break; }
      else if (c === ';' || c === '{' || c === '}') break;
      else if (c === ',' && depth === 0) {
        const n = rest.slice(j + 1).match(/^\s*([A-Za-z_]\w*)/);
        if (!n || types.has(n[1]) || /^(in|out|inout|const|lowp|mediump|highp)$/.test(n[1])) break;   // a parameter list
        check(n[1], m.index + m[0].length + j + 1 + n[0].length - n[1].length);
      }
    }
  }
  const res = [...new Set(out)];
  lintCache.set(src, res);
  return res;
}

/* ------------------------------------------------------------------ the stage */

const VERT_FULL = 'in vec2 a_pos;\nvoid main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';

function header(gl2, vertex) {
  let s = gl2 ? '#version 300 es\n' : '';
  if (!gl2 && !vertex) s += '#extension GL_OES_standard_derivatives : enable\n';
  s += '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  if (vertex) {
    if (!gl2) s += '#define in attribute\n#define out varying\n';
    return s;
  }
  if (!gl2) s += '#define in varying\n';
  s += 'uniform vec2 u_res;\nuniform float u_seed;\nuniform float u_time;\n';
  return s;
}

// one probe for the whole page
let probed = null;
export function hasWebGL() {
  if (probed == null) {
    probed = false;
    try {
      const c = document.createElement('canvas');
      const g = c.getContext('webgl2') || c.getContext('webgl');
      if (g) { probed = true; g.getExtension('WEBGL_lose_context')?.loseContext(); }
    } catch (_) { probed = false; }
  }
  return probed;
}

// the scene contexts alive on the page
const liveScenes = new Set();
// pause discs shared by the scenes in one box
const pauses = new WeakMap();

export function stage(el, spec) {
  injectStyles();
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  el.style.isolation = 'isolate';
  el.style.overflow = 'hidden';
  const s = {
    gl: null, canvas: null, gl2: false, w: 1, h: 1, cssW: 1, cssH: 1, dpr: 1, k: 1,
    pointer: { x: 0, y: 0, u: 0.5, v: 0.5, inside: false, down: false, type: 'mouse', t: 0 },
    reduced: reducedMotion(), running: false, fallen: false, dirty: true,
  };
  let released = true, destroyed = false, lost = false, shown = false, waited = false, hideT = 0, acc = 0;
  // checked: the first shown frame was read for a picture; losses: contexts lost and never restored
  let checked = false, losses = 0, lostT = 0;
  // frozen: idle and still, the last frame kept as a plain picture (snap) and the context freed
  let frozen = false, snap = null, activeAt = 0, userPaused = false, idleT = 0, waitT = 0;
  const progs = [], texes = [], bufs = [];

  function makeContext() {
    const canvas = document.createElement('canvas');
    canvas.className = 'obj-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute', left: '0', top: '0', display: 'block', zIndex: '0', pointerEvents: 'none',
      opacity: '0', imageRendering: spec.cell ? 'pixelated' : 'auto',
    });
    const attrs = { alpha: !!spec.alpha, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: !!spec.preserve };
    let gl = canvas.getContext('webgl2', attrs), gl2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', attrs);
    if (!gl) return false;
    if (!gl2) gl.getExtension('OES_standard_derivatives');
    // only this canvas's own loss counts (a canvas given up on purpose reports its loss later). A
    // context the browser takes and does not give back within 2 s (too many on the page, a GPU
    // reset) is made again once; lost twice, the scene shows its fallback rather than an empty panel
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      if (canvas !== s.canvas) return;
      lost = true;
      clearTimeout(lostT);
      lostT = setTimeout(() => {
        if (canvas !== s.canvas || !lost || destroyed || s.fallen) return;
        if (++losses >= 2) { fallBack(); return; }
        teardown(false);
        if (lc && lc.visible) lc.redraw();
      }, 2000);
    });
    canvas.addEventListener('webglcontextrestored', () => { if (canvas !== s.canvas) return; clearTimeout(lostT); lost = false; teardown(true); });
    s.canvas = canvas; s.gl = gl; s.gl2 = gl2;
    // a new canvas shows only once it has drawn
    shown = false; lost = false;
    el.insertBefore(canvas, el.firstChild);
    return true;
  }

  const holder = {
    seen: 0,
    get visible() { return lc ? lc.visible : true; },
    // off screen or over the budget: keep the last frame as a picture and free the context
    release() { if (!released) freeze(); },
    idle: () => isIdle(),
    still: () => !released && shown && !lost && !s.pointer.inside && !s.pointer.down,
    loops: () => loopsNow(),
  };
  let budgetDone = null;

  function fallBack() {
    if (s.fallen || destroyed) return;
    if (!released) teardown(false);
    snap?.remove(); snap = null; frozen = false;
    s.fallen = true;
    const node = spec.fallback && spec.fallback();
    if (node) { node.classList?.add('obj-fallback'); el.insertBefore(node, el.firstChild); }
    try { spec.failed?.(); } catch (err) { console.error('objects:', err); }
    syncPause();
    if (lc) lc.sync();
  }

  function init() {
    if (s.fallen || destroyed) return false;
    if (!hasWebGL()) { fallBack(); return false; }
    // the page keeps at most config.live scene contexts. Before a new one is made, scenes off screen
    // give theirs up, then idle ones, then ones that hold a finished picture with no pointer on them
    // (each keeps its last frame as a still and makes its context again when the pointer comes)
    for (const pass of [h => !h.visible, h => h.idle(), h => h.still() && !h.loops(), h => h.still()]) {
      for (const h of [...liveScenes].sort((a, b) => a.seen - b.seen)) {
        if (liveScenes.size < config.live) break;
        if (h !== holder && pass(h)) h.release();
      }
    }
    // none can give one up yet (each is still drawing its first frame): try again shortly
    if (liveScenes.size >= config.live) { clearTimeout(waitT); waitT = setTimeout(() => lc && lc.redraw(), 250); return false; }
    budgetDone = fx.glBudget(holder);
    if (!makeContext()) { budgetDone(); budgetDone = null; fallBack(); return false; }
    liveScenes.add(holder);
    released = false;
    progs.length = texes.length = bufs.length = 0;
    fit();
    s.dirty = true;
    // a shader that breaks the rules of either GLSL version, or fails to compile or link: the fallback
    try { spec.init(s.gl, s); } catch (err) { console.error(`objects: ${spec.name || 'scene'}:`, err.message || err); fallBack(); return false; }
    return true;
  }

  function teardown(reinit) {
    const gl = s.gl;
    if (gl && !gl.isContextLost()) {
      for (const p of progs) gl.deleteProgram(p.p);
      for (const t of texes) gl.deleteTexture(t.t);
      for (const b of bufs) gl.deleteBuffer(b);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    progs.length = texes.length = bufs.length = 0;
    if (s.canvas) s.canvas.remove();
    s.canvas = s.gl = null;
    released = true;
    shown = false;
    liveScenes.delete(holder);
    if (budgetDone) { budgetDone(); budgetDone = null; }
    if (reinit && lc && lc.visible) { init(); lc.redraw(); }
  }

  function fit() {
    const r = el.getBoundingClientRect();
    s.cssW = Math.max(1, el.clientWidth || r.width);
    s.cssH = Math.max(1, el.clientHeight || r.height);
    const dev = window.devicePixelRatio || 1;
    const cell = typeof spec.cell === 'function' ? spec.cell(s) : spec.cell;
    if (!s.canvas) return;
    let W, H;
    if (cell) {
      // a whole number of device pixels per canvas pixel keeps every dither cell the same size
      s.k = Math.max(1, Math.round(cell * dev));
      W = Math.ceil((s.cssW * dev) / s.k);
      H = Math.ceil((s.cssH * dev) / s.k);
      s.dpr = dev / s.k;
      s.canvas.style.width = (W * s.k) / dev + 'px';
      s.canvas.style.height = (H * s.k) / dev + 'px';
    } else {
      s.k = 1;
      s.dpr = renderScale(s.cssW, s.cssH, { heavy: !!spec.heavy }, Math.min(dev, spec.maxScale || 1));
      W = Math.max(1, Math.round(s.cssW * s.dpr));
      H = Math.max(1, Math.round(s.cssH * s.dpr));
      s.canvas.style.width = '100%';
      s.canvas.style.height = '100%';
    }
    if (s.canvas.width !== W || s.canvas.height !== H) {
      s.canvas.width = W; s.canvas.height = H;
      s.w = W; s.h = H;
      s.dirty = true;
      spec.resize && spec.resize(s);
    }
  }

  /* true when the frame just drawn is one flat colour along three rows and three columns (read in
     the same task as the draw, while the drawing buffer still holds it) */
  function flatFrame() {
    const gl = s.gl;
    if (!gl || gl.isContextLost() || s.w < 4 || s.h < 4) return false;
    const buf = new Uint8Array(Math.max(s.w, s.h) * 4);
    let ref = null;
    const same = n => {
      for (let i = 0; i < n * 4; i += 4) {
        if (!ref) ref = [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]];
        else if (Math.abs(buf[i] - ref[0]) > 3 || Math.abs(buf[i + 1] - ref[1]) > 3 || Math.abs(buf[i + 2] - ref[2]) > 3 || Math.abs(buf[i + 3] - ref[3]) > 3) return false;
      }
      return true;
    };
    try {
      for (const f of [0.5, 0.3, 0.7]) {
        gl.readPixels(0, Math.floor(s.h * f), s.w, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        if (!same(s.w)) return false;
        gl.readPixels(Math.floor(s.w * f), 0, 1, s.h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        if (!same(s.h)) return false;
      }
    } catch (_) { return false; }
    return true;
  }

  const loopsNow = () => (typeof spec.loops === 'function' ? spec.loops(s) : !!spec.loops) && !userPaused && !reducedMotion();
  // nothing moves it now and nothing has for a while: no pointer on it, no loop of its own
  const isIdle = () => !released && shown && !s.pointer.inside && !s.pointer.down && !loopsNow() && performance.now() - activeAt > config.idleMs;
  function freeze() {
    if (released || !s.canvas || !s.gl) return;
    // one more frame in this task, so the drawing buffer can be read, kept as a 2D picture
    let pic = null;
    if (shown && !lost && !s.gl.isContextLost()) {
      try {
        s.gl.viewport(0, 0, s.w, s.h);
        spec.frame(s.gl, lc.time, 0, s);
        pic = document.createElement('canvas');
        pic.width = s.canvas.width; pic.height = s.canvas.height;
        pic.getContext('2d').drawImage(s.canvas, 0, 0);
        pic.className = 'obj-still';
        pic.setAttribute('aria-hidden', 'true');
        Object.assign(pic.style, { position: 'absolute', left: '0', top: '0', display: 'block', zIndex: '0', pointerEvents: 'none',
          width: s.canvas.style.width, height: s.canvas.style.height, imageRendering: s.canvas.style.imageRendering });
      } catch (err) { pic = null; }
    }
    if (pic) { snap?.remove(); snap = pic; s.canvas.after(pic); }
    frozen = !!pic;
    teardown(false);
  }
  function wake() {
    activeAt = performance.now();
    if (!frozen) return;
    frozen = false;
    s.dirty = true;
    // the frame loop starts again (or one frame is drawn where no loop runs)
    if (lc) lc.sync();
  }

  function draw(t, dt) {
    if (destroyed || s.fallen) return;
    if (released) {
      if (!lc.visible || frozen) return;
      // the context is made once there is something to draw (a photograph has arrived)
      if (spec.loaded && !spec.loaded()) return;
      if (!init()) return;
    }
    if (!s.gl || lost) return;
    // an object that only idles may ask for fewer frames
    if (dt > 0) {
      const fps = spec.fps ? spec.fps(s) : 60;
      acc += dt;
      if (fps < 58 && acc < 1 / fps - 0.004 && !s.dirty) return;
      dt = Math.min(acc, 0.1);
      acc = 0;
    }
    holder.seen = performance.now();
    s.reduced = reducedMotion();
    s.running = lc.running;
    s.gl.viewport(0, 0, s.w, s.h);
    // an error in a frame would repeat in every frame: the fallback instead
    try { spec.frame(s.gl, t, dt, s); } catch (err) { console.error(`objects: ${spec.name || 'scene'}:`, err.message || err); fallBack(); return; }
    s.dirty = false;
    if (!shown) {
      if (spec.ready && spec.ready() === false) { waited = true; s.dirty = true; return; }
      // the first frame worth showing must hold a picture: one that comes out as a single flat
      // colour (a shader that compiled but draws nothing) leaves the fallback instead
      if (!checked) { checked = true; if (flatFrame()) { console.error(`objects: ${spec.name || 'scene'}: the first frame came out empty`); fallBack(); return; } }
      shown = true;
      // a photograph that arrived late fades in once; a canvas made again (back on screen) shows at once
      s.canvas.style.transition = waited && !snap ? 'opacity .4s ease' : 'none';
      s.canvas.style.opacity = '1';
      waited = false;
      if (snap) { snap.remove(); snap = null; }
    }
    if (loopsNow() || s.pointer.inside) activeAt = performance.now();
    // a still scene gives its context up once it is idle; the picture stays
    else if (isIdle()) { freeze(); return; }
    // no frames are running (reduced motion, paused): look again once it may be idle
    if (!lc.running) { clearTimeout(idleT); idleT = setTimeout(() => { if (isIdle()) freeze(); }, config.idleMs + 60); }
  }

  // GL helpers that rebuild with the context
  s.program = (frag, vert) => {
    const gl = s.gl;
    // read before it is compiled: what a laptop's GPU would reject never reaches the compiler
    const bad = [...glslLint(frag).map(x => 'fragment ' + x), ...(vert ? glslLint(vert).map(x => 'vertex ' + x) : [])];
    if (bad.length) throw new Error('shader words a GPU rejects:\n  ' + bad.join('\n  '));
    const comp = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error('objects: shader\n' + gl.getShaderInfoLog(sh));
      return sh;
    };
    const vs = comp(gl.VERTEX_SHADER, header(s.gl2, true) + (vert || VERT_FULL));
    const fsrc = header(s.gl2, false) + GLSL_LIB + '\n' + frag;
    const fs = comp(gl.FRAGMENT_SHADER, fsrc);
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, 'a_pos');
    gl.linkProgram(p);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('objects: link\n' + gl.getProgramInfoLog(p));
    const locs = new Map();
    const loc = n => { if (!locs.has(n)) locs.set(n, gl.getUniformLocation(p, n)); return locs.get(n); };
    const prog = {
      p,
      use() { gl.useProgram(p); return prog; },
      set(n, v) {
        const l = loc(n);
        if (l == null) return prog;
        if (typeof v === 'number' || typeof v === 'boolean') gl.uniform1f(l, +v);
        else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
        else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
        else if (v.length === 4) gl.uniform4f(l, v[0], v[1], v[2], v[3]);
        else if (v.length === 16) gl.uniformMatrix4fv(l, false, v);
        return prog;
      },
      int(n, v) { const l = loc(n); if (l != null) gl.uniform1i(l, v); return prog; },
      attrib: n => gl.getAttribLocation(p, n),
    };
    progs.push(prog);
    return prog;
  };
  s.texture = (src, { mipmap = false, nearest = false } = {}) => {
    const gl = s.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    const mm = mipmap && s.gl2;
    if (mm) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, nearest ? gl.NEAREST : mm ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, nearest ? gl.NEAREST : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const tex = { t, w: src.naturalWidth || src.width, h: src.naturalHeight || src.height, bind(unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); } };
    texes.push(tex);
    return tex;
  };
  s.buffer = (data, usage) => {
    const gl = s.gl, b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
    bufs.push(b);
    return b;
  };
  let tri = null;
  s.fullscreen = () => {
    const gl = s.gl;
    if (!tri) tri = new WeakMap();
    let b = tri.get(gl);
    if (!b) { b = s.buffer(new Float32Array([-1, -1, 3, -1, -1, 3])); tri.set(gl, b); }
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  s.invalidate = () => { s.dirty = true; if (frozen) wake(); else { activeAt = performance.now(); if (lc && !lc.running) lc.redraw(); } };

  // pointer (the pause disc is not part of the picture)
  const P = s.pointer;
  const onDisc = e => !!(e.target && e.target.closest && e.target.closest('.loop-pause'));
  const setP = e => {
    const r = el.getBoundingClientRect();
    P.x = e.clientX - r.left; P.y = e.clientY - r.top;
    P.u = clamp(P.x / r.width, 0, 1); P.v = clamp(P.y / r.height, 0, 1);
    P.type = e.pointerType || 'mouse';
    P.t = performance.now();
  };
  const leave = () => { P.inside = false; P.down = false; spec.pointer?.('leave', s); s.invalidate(); };
  const onEnter = e => { if (onDisc(e)) return; setP(e); P.inside = true; spec.pointer?.('enter', s); s.invalidate(); };
  const onMove = e => {
    if (onDisc(e)) { if (P.inside && !P.down) leave(); return; }
    const was = P.inside;
    setP(e); P.inside = true;
    spec.pointer?.(was ? 'move' : 'enter', s);
    s.invalidate();
  };
  const onLeave = e => { if (P.down && e.pointerType !== 'mouse') return; leave(); };
  const onDown = e => { if (onDisc(e)) return; setP(e); P.inside = true; P.down = true; spec.pointer?.('down', s); s.invalidate(); };
  const onUp = e => { if (onDisc(e)) return; P.down = false; if (e.pointerType !== 'mouse') { P.inside = false; spec.pointer?.('leave', s); } spec.pointer?.('up', s); s.invalidate(); };
  el.addEventListener('pointerenter', onEnter, { passive: true });
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave, { passive: true });
  el.addEventListener('pointerdown', onDown, { passive: true });
  el.addEventListener('pointerup', onUp, { passive: true });
  el.addEventListener('pointercancel', onUp, { passive: true });

  const lc = fx.lifecycle(el, {
    draw, still: spec.still ?? 2,
    // no frame loop while there is nothing to draw: fallen, or still and kept as a picture
    idle: () => s.fallen || (frozen && !loopsNow()),
    onShow() { clearTimeout(hideT); if (frozen && loopsNow()) wake(); spec.show?.(s); },
    onHide() {
      spec.hide?.(s);
      // off screen for a while: give the context back (it is made again before the panel returns)
      clearTimeout(hideT);
      hideT = setTimeout(() => { if (!lc.visible && !released) freeze(); }, config.releaseMs);
    },
  });
  const ro = new ResizeObserver(() => { if (frozen) { snap?.remove(); snap = null; wake(); return; } if (!s.canvas) return; fit(); lc.redraw(); });
  ro.observe(el);

  /* the pause disc, in the bottom-right corner of the panel or frame, for an object that moves by itself */
  const box = el.closest('[data-ui-pause-host], .panel__screen, .panel, .frame') || el;
  function syncPause() {
    const loops = typeof spec.loops === 'function' ? spec.loops(s) : !!spec.loops;
    const want = loops && !s.fallen && !destroyed && !reducedMotion();
    let p = pauses.get(box);
    if (!want) {
      if (p) { p.set.delete(s); if (!p.set.size) { p.btn.remove(); pauses.delete(box); } }
      return;
    }
    if (!p) {
      if (box.querySelector(':scope > .loop-pause')) return;   // the page put its own there
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'loop-pause scene-pause';
      p = { btn, set: new Set(), paused: false };
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const on = !p.paused;
        p.set.forEach(x => (on ? x.pause() : x.resume()));
      });
      if (box !== el && getComputedStyle(box).position === 'static') box.style.position = 'relative';
      box.appendChild(btn);
      pauses.set(box, p);
    }
    p.set.add(s);
    p.paused = [...p.set].every(x => x.paused);
    const name = spec.name || 'animation';
    p.btn.innerHTML = p.paused ? PLAY_SVG : PAUSE_SVG;
    p.btn.setAttribute('aria-label', `${p.paused ? 'Play' : 'Pause'} ${name}`);
    p.btn.setAttribute('aria-pressed', String(p.paused));
    p.btn.title = p.paused ? 'Play' : 'Pause';
  }
  queueMicrotask(syncPause);

  s.lifecycle = lc;
  Object.defineProperty(s, 'paused', { get: () => userPaused });
  s.pause = () => { userPaused = true; lc.pause(); syncPause(); };
  s.resume = () => { userPaused = false; wake(); lc.resume(); syncPause(); };
  s.redraw = () => { s.dirty = true; if (frozen) wake(); else lc.redraw(); };
  s.fail = () => fallBack();
  s.syncPause = syncPause;
  // without WebGL the fallback goes in at once
  if (!hasWebGL()) init();
  s.destroy = () => {
    destroyed = true;
    clearTimeout(hideT); clearTimeout(idleT); clearTimeout(lostT); clearTimeout(waitT);
    lc.destroy();
    ro.disconnect();
    el.removeEventListener('pointerenter', onEnter);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    teardown(false);
    snap?.remove(); snap = null;
    syncPause();
    el.querySelectorAll(':scope > .obj-fallback').forEach(n => n.remove());
  };
  return s;
}

/**
  A fallback <img> of the photograph, cover-cropped to the panel at the focus. A photograph that
  cannot load leaves the panel's own ground, never a broken image; the host is marked
  data-scene-empty and the console says so, so a check catches the empty panel (serve the
  photographs from the site itself).
*/
export function fallbackImage(src, alt = '', fit = 'cover', focus = [0.5, 0.5]) {
  const im = document.createElement('img');
  im.alt = alt; im.decoding = 'async'; im.loading = 'lazy';
  im.onerror = () => {
    const host = im.parentElement;
    im.remove();
    if (host) host.dataset.sceneEmpty = '1';
    console.error(`objects: the photograph did not load and the panel shows no picture: ${src}`);
  };
  Object.assign(im.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: fit,
    objectPosition: `${Math.round(focus[0] * 100)}% ${Math.round(focus[1] * 100)}%`, zIndex: '0' });
  if (src) im.src = src; else queueMicrotask(() => im.remove());
  return im;
}

/* ------------------------------------------------------------------ 4x4 matrices (column-major) */

export const mat4 = {
  perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  },
  mul(a, b) {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  },
  translate(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; },
  scale(x, y, z) { return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]; },
  rx(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; },
  ry(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
  rz(a) { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
  apply(m, v) {
    const [x, y, z] = v, w = m[3] * x + m[7] * y + m[11] * z + m[15];
    return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w];
  },
};
