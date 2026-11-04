/*
  photo-kit/photo.js - the shared runtime of the photo prints (photo-halftone, photo-engraving,
  photo-dither): a photograph printed whole by a fragment shader in the page palette, on the page's
  surface as paper; hover (a tap on a phone) shows the photograph under the print. A print is one
  crafted moment on a page, never a filter over the hero or a section's main photograph.

    photoGL(el, spec) -> { destroy, pause, resume, set(params), setPalette(p), redraw, info, canvas }
    creditsBlock(entries, { adapted }) -> the footer's credits block (HTML), as scripts/photos.mjs
      credits prints it, for photographs that did not come through photos.mjs; photoCredit(entry) and
      creditsLine(entries) write one photograph's credit and a plain line (demos, scenes)
    glslLint(src), photoShader(object) -> the faults a GPU's compiler rejects, and the source to check

  spec = {
    frag            GLSL body (no version, precision or uniform lines); writes fxColor
    schema, params  the object's params; each becomes a float uniform u_<name>
    palette, src    the page palette and the photograph's URL (else the <img> inside el: its largest
                    srcset size; else data-src)
    focus           [x, y] 0..1 of the photograph kept in frame; given focusX/Y params win, then the
                    <img>'s object-position (photos.mjs fetch writes the subject's place there)
    uniforms(ctx)   extra uniforms { u_name: number | [2..4 numbers] }, rebuilt on resize, palette, set()
    textures(ctx)   extra textures { u_name: { source, width, height, filter, wrap, mip, key } }
    stats           true: u_stats, the photograph's edge density (r) and lightness (g), mipmapped
    trail           n: u_trail[n], the cursor's recent path (xy canvas px, z strength 0..1)
    entry           seconds of an entry animation (the prints use 0: finished from the first frame,
                    never half developed in a screenshot or on a slow machine)
    crisp           true: whole device px per canvas px (at most 1 canvas px per CSS px), pixelated upscaling (dither)
    maxScale        canvas px per CSS px at most (default 1; the halftone and engraving take 2, so
                    dots and lines stay sharp on a sharp screen)
    heavy           true: 0.75 canvas px per CSS px in a large frame (more than a few texture reads per pixel)
    still           seconds used for the reduced-motion still frame
  }

  Every object gets, in canvas pixels with y up: u_time, u_res, u_dpr (canvas px per CSS px), u_fit (0.6..1: smaller
  frames take finer screens; objects multiply their sizes by it),
  u_frame (the frame's CSS size), u_mouse (xy, z = hover 0..1, eased), u_vel, u_enter, the photograph u_img (mipmapped) with u_imgRes,
  u_texRes, u_focus, u_zoom and u_levels (its own black and white points in OKLab lightness), and the
  palette u_bg, u_surface, u_ink, u_muted, u_accent, u_accentInk, u_paperLight. The helpers in PK_LIB
  (below) map canvas pixels to the photograph, read its tone and give the paper (pk_paper).

  Built in: one canvas, its own WebGL context counted in the effects' context budget (fx.glBudget),
  paused off screen and while the tab is hidden, released 1.5 s after it leaves the screen (the greyed
  <img> stands in until it returns), one still frame under prefers-reduced-motion (hover still
  answers, without easing), and the photograph itself, greyed into the palette, whenever it cannot
  draw: no WebGL, a shader that fails to compile or link, or one that uses a GLSL ES reserved word
  (refused here, since CPU WebGL compiles some that a laptop's GPU rejects).

  Cost, for an integrated laptop GPU: never over 1.5 MP of canvas; at most 1 canvas px per CSS px
  unless spec.maxScale allows more; a heavy object drops to 0.75 in a large frame (over 1 MP of CSS
  px); a crisp object (dither) shows each canvas px as whole device px (0.875 at DPR 1.75), so its
  cells stay sharp. At most 3 photo objects hold a context at once: a fourth waits, showing its still,
  until one leaves the screen, and a frame scrolling away gives way to one coming in. Each pixel reads
  the photograph 2 to 5 times from its mipmaps, with no loops over neighbours.
*/
import fx from '../../effects/fx.js';

const { color, normalizePalette, readPalette, resolveParams, lifecycle, glBudget, fallbackCSS, GLSL_LIB, config, hashSeed } = fx;

// render scale: canvas px per CSS px (see "Cost" above)
export const MAX_SCALE = 1, LARGE_SCALE = 0.75, LARGE_AREA = 1e6, MAX_PIXELS = 1.5e6, MAX_LIVE = 3;
/**
  the canvas px per CSS px for a frame of w x h CSS px on this screen. maxScale (default 1) lets a
  print whose dots or lines must stay sharp render up to that many canvas px per CSS px on a sharp
  screen (the halftone takes 2: a soft upscale of round dots reads as a low-resolution picture); the
  1.5 MP cap holds either way, so the work per frame never grows past it
*/
export function renderScale(w, h, { crisp = false, heavy = false, maxScale = MAX_SCALE } = {}, dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1) {
  const area = Math.max(1, w * h), top = Math.min(dpr, maxScale);
  if (crisp) {
    // whole device px per canvas px, so the screen shows every cell as a sharp square (a soft upscale
    // blurs a dither): 1 at DPR 1, 2 or 3; 0.875 at 1.75 and 0.75 at 1.5 (each canvas px 2 device px)
    let k = Math.max(1, Math.ceil(dpr / MAX_SCALE - 1e-6));
    while (area * (dpr / k) * (dpr / k) > MAX_PIXELS) k++;
    return dpr / k;
  }
  let s = heavy && area > LARGE_AREA ? Math.min(top, LARGE_SCALE) : top;
  if (area * s * s > MAX_PIXELS) s = Math.sqrt(MAX_PIXELS / area);
  return s;
}
// the photo objects holding a WebGL context right now (a page keeps at most MAX_LIVE)
const livePK = new Set();
const HAS_DOM = typeof window !== 'undefined' && typeof document !== 'undefined';
const reducedQ = HAS_DOM && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const noHoverQ = HAS_DOM && window.matchMedia ? window.matchMedia('(hover: none)') : null;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = () => !!(reducedQ && reducedQ.matches);

/* ------------------------------------------------------------------ images */

const images = new Map();
/** load (once per URL) and decode an image with CORS, so WebGL may read it */
export function loadImage(src) {
  if (!images.has(src)) {
    images.set(src, new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
      img.onerror = () => { images.delete(src); reject(new Error(`photo-kit: could not load ${src}`)); };
      img.src = src;
    }));
  }
  return images.get(src);
}

/** an <img>'s largest candidate (srcset by width, else src): the print reads it at full size */
export function bestSrc(img) {
  let best = img.getAttribute('src') ? img.src : img.currentSrc, bw = 0;
  for (const part of (img.getAttribute('srcset') || '').split(',')) {
    const [u, d] = part.trim().split(/\s+/);
    const w = d && /w$/.test(d) ? parseFloat(d) : 0;
    if (u && w > bw && w <= 2400) { bw = w; best = new URL(u, document.baseURI).href; }
  }
  return best || img.currentSrc || img.src;
}
/** CSS object-position ("50% 30%", "center top", "left") as [x, y] 0..1; null when it says nothing usable */
export function parsePosition(v) {
  const words = String(v || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const K = { left: [0, null], right: [1, null], top: [null, 0], bottom: [null, 1], center: [null, null] };
  const out = [null, null];
  let axis = 0;
  for (const w of words.slice(0, 2)) {
    if (w.endsWith('%')) { out[axis] = clamp(parseFloat(w) / 100, 0, 1); axis = 1; continue; }
    const k = K[w];
    if (!k) { axis = 1; continue; } // a length (px): no fraction to take from it
    if (k[0] != null) out[0] = k[0];
    else if (k[1] != null) out[1] = k[1];
    axis = 1;
  }
  return out[0] == null && out[1] == null && !words.includes('center') ? null : [out[0] ?? 0.5, out[1] ?? 0.5];
}

// lightness: the cube root of luminance (sRGB squared as its linear light), which is OKLab L for a
// grey and close to it for a colour; the shaders use the same formula (pk_L), one pow per sample
function okL(r, g, b) {
  return Math.cbrt((0.2126 * r * r + 0.7152 * g * g + 0.0722 * b * b) / 65025);
}

const analyses = new WeakMap();
/**
  The photograph's tonal range: the 1st and 99th percentile of its OKLab lightness, from a small
  copy, so a pale photograph (a white room) still spans the whole tone scale of an effect.
*/
export function analyse(img) {
  if (analyses.has(img)) return analyses.get(img);
  let out = { levels: [0, 1], mean: 0.5 };
  try {
    const w = 160, h = Math.max(1, Math.round((160 * img.naturalHeight) / img.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    const hist = new Uint32Array(256);
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) { const L = okL(d[i], d[i + 1], d[i + 2]); hist[Math.min(255, (L * 255) | 0)]++; sum += L; }
    const n = d.length / 4;
    const pct = q => { let acc = 0; for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= q * n) return i / 255; } return 1; };
    out = { levels: [pct(0.01), Math.max(pct(0.99), pct(0.01) + 0.1)], mean: sum / n };
  } catch (_) { /* a tainted image: keep the full range */ }
  analyses.set(img, out);
  return out;
}

const palettes = new WeakMap();
const srgbLin = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
function toOklab(r, g, b) {
  r = srgbLin(r / 255); g = srgbLin(g / 255); b = srgbLin(b / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
/**
  The photograph's own palette: n colours (OKLab, darkest first) from k-means on a small copy, with its
  darkest and lightest kept, so a dither in them spans the whole picture. Made once per image.
*/
export function photoPalette(img, n = 8) {
  const key = img && palettes.get(img);
  if (key && key.length === n) return key;
  let out = null;
  try {
    const w = 96, h = Math.max(1, Math.round((96 * img.naturalHeight) / img.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    const pts = [];
    for (let i = 0; i < d.length; i += 4) pts.push(toOklab(d[i], d[i + 1], d[i + 2]));
    const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    // seeds: the darkest, the lightest, then k-means++ (seeded, so a picture always gets one palette)
    const r = fx.rng('photo-kit:palette');
    const byL = pts.slice().sort((a, b) => a[0] - b[0]);
    const cent = [byL[Math.floor(byL.length * 0.01)].slice(), byL[Math.floor(byL.length * 0.99)].slice()];
    while (cent.length < n) {
      const dd = pts.map(p => Math.min(...cent.map(q => dist(p, q))));
      let x = r() * dd.reduce((s, v) => s + v, 0), k = 0;
      for (; k < pts.length - 1 && (x -= dd[k]) > 0; k++);
      cent.push(pts[k].slice());
    }
    for (let it = 0; it < 10; it++) {
      const sum = cent.map(() => [0, 0, 0, 0]);
      for (const p of pts) {
        let best = 0, bv = Infinity;
        for (let j = 0; j < n; j++) { const v = dist(p, cent[j]); if (v < bv) { bv = v; best = j; } }
        const s = sum[best]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++;
      }
      // the two ends stay at the picture's extremes; the others move to their clusters' middles
      for (let j = 2; j < n; j++) if (sum[j][3]) cent[j] = [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3]];
    }
    out = cent.sort((a, b) => a[0] - b[0]);
  } catch (_) { /* a tainted image: no palette */ }
  if (out && img) palettes.set(img, out);
  return out;
}

const statsCache = new WeakMap();
/** edge density (r) and lightness (g) of the photograph at 512 x 512, for detail-led effects */
function statsOf(img) {
  if (statsCache.has(img)) return statsCache.get(img);
  const W = 512, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, W, H);
  let d;
  try { d = g.getImageData(0, 0, W, H).data; } catch (_) { statsCache.set(img, null); return null; }
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = okL(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
  const out = new Uint8Array(W * H * 4);
  const at = (x, y) => L[clamp(y, 0, H - 1) * W + clamp(x, 0, W - 1)];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      const o = ((H - 1 - y) * W + x) * 4; // flipped, like the photograph's texture
      out[o] = clamp(Math.round(Math.hypot(gx, gy) * 255 * 1.6), 0, 255);
      out[o + 1] = Math.round(L[y * W + x] * 255);
      out[o + 3] = 255;
    }
  }
  const s = { data: out, width: W, height: H };
  statsCache.set(img, s);
  return s;
}

/* ------------------------------------------------------------------ blue noise */

let blueCache = null;
/**
  A 64 x 64 blue-noise threshold map (void and cluster: Gaussian energy on a torus, sigma 1.5), as
  RGBA bytes with the rank in every channel. Made once per page, in about 0.1 s.
*/
export function blueNoise() {
  if (blueCache) return blueCache;
  const n = 64, N = n * n, sigma = 1.5;
  const ker = new Float32Array(N);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = Math.min(x, n - x), dy = Math.min(y, n - y);
    ker[y * n + x] = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
  }
  const splat = (E, i, s) => {
    const ix = i % n, iy = (i / n) | 0;
    for (let y = 0; y < n; y++) {
      const ky = ((y - iy + n) % n) * n, row = y * n;
      for (let x = 0; x < n; x++) E[row + x] += s * ker[ky + ((x - ix + n) % n)];
    }
  };
  const extreme = (E, bits, want, max) => {
    let best = -1, bv = max ? -Infinity : Infinity;
    for (let i = 0; i < N; i++) if (bits[i] === want && (max ? E[i] > bv : E[i] < bv)) { bv = E[i]; best = i; }
    return best;
  };
  const r = fx.rng('photo-kit:blue');
  const bits = new Uint8Array(N), E = new Float32Array(N);
  const m = Math.round(N * 0.1);
  for (let k = 0; k < m;) { const i = Math.floor(r() * N); if (!bits[i]) { bits[i] = 1; splat(E, i, 1); k++; } }
  // spread the starting points: move the tightest cluster into the largest void until it settles
  for (let guard = 0; guard < N; guard++) {
    const c = extreme(E, bits, 1, true); bits[c] = 0; splat(E, c, -1);
    const v = extreme(E, bits, 0, false);
    if (v === c) { bits[c] = 1; splat(E, c, 1); break; }
    bits[v] = 1; splat(E, v, 1);
  }
  const rank = new Uint16Array(N);
  // ranks below the start: take ones away from the tightest clusters
  const b1 = bits.slice(), E1 = E.slice();
  for (let k = m - 1; k >= 0; k--) { const c = extreme(E1, b1, 1, true); b1[c] = 0; splat(E1, c, -1); rank[c] = k; }
  // ranks above: fill the largest voids
  for (let k = m; k < N; k++) { const v = extreme(E, bits, 0, false); bits[v] = 1; splat(E, v, 1); rank[v] = k; }
  const data = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) { const v = Math.floor((rank[i] * 256) / N); data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v; data[i * 4 + 3] = 255; }
  blueCache = { data, width: n, height: n, filter: 'nearest', wrap: 'repeat', key: 'blue64' };
  return blueCache;
}

/* ------------------------------------------------------------------ GLSL */

export const PK_LIB = /* glsl */ `
#if __VERSION__ >= 300
#define PK_LOD(s, u, l) textureLod(s, u, l)
#define PK_FW(x) fwidth(x)
#define PK_FOR(i, n, most) for (int i = 0; i < int(n); i++)
#else
#ifdef PK_LOD_EXT
#define PK_LOD(s, u, l) texture2DLodEXT(s, u, l)
#else
#define PK_LOD(s, u, l) texture2D(s, u)
#endif
#ifdef GL_OES_standard_derivatives
#define PK_FW(x) fwidth(x)
#else
#define PK_FW(x) (0.0 * (x) + 0.03)
#endif
#define PK_FOR(i, n, most) for (int i = 0; i < most; i++) if (float(i) < (n))
#endif

// the photograph's window: object-fit cover at u_focus, zoomed about the window's middle
vec2 pk_vis() {
  float asp = u_res.x / u_res.y, ir = u_imgRes.x / max(1.0, u_imgRes.y);
  return asp > ir ? vec2(1.0, ir / asp) : vec2(asp / ir, 1.0);
}
// canvas pixels (y up) to the photograph's uv (y up)
vec2 pk_uv(vec2 px) {
  vec2 vis = pk_vis();
  vec2 lo = (1.0 - vis) * u_focus;
  vec2 c = lo + 0.5 * vis;
  return c + (lo + px / u_res * vis - c) / u_zoom;
}
// texels of the photograph's texture per canvas pixel
float pk_tpp() { return u_texRes.x * pk_vis().x / (u_res.x * u_zoom); }
// the mip level that averages a square of px canvas pixels
float pk_lod(float px) { return log2(max(px * pk_tpp(), 1.0)); }
// the photograph averaged over a square of px canvas pixels around canvas point p
vec3 pk_photo(vec2 p, float px) { return PK_LOD(u_img, pk_uv(p), pk_lod(px)).rgb; }
// the photograph at full detail (an explicit level: implicit ones are undefined inside branches)
vec3 pk_sharp(vec2 p) { return PK_LOD(u_img, pk_uv(p), log2(max(pk_tpp(), 1.0))).rgb; }
// OKLab lightness stretched over the photograph's own range: 0 its darkest, 1 its lightest
float pk_L(vec3 c) { return pow(max(dot(c * c, vec3(0.2126, 0.7152, 0.0722)), 1e-6), 0.3333333); }
float pk_tone(vec3 c) { return clamp((pk_L(c) - u_levels.x) / max(0.05, u_levels.y - u_levels.x), 0.0, 1.0); }
// the tone of colour c read at canvas point p over a footprint of foot px, after the object's own
// tone params when it has them: clarity (local contrast against the picture around it, so a cream
// lamp still parts from a white wall), exposure and contrast (a soft S curve)
float pk_shadeOf(vec3 c, vec2 p, float foot) {
  float t = pk_tone(c);
#ifdef PK_HAS_clarity
  float tb = pk_tone(pk_photo(p, foot * 9.0));
  t += u_clarity * 1.4 * (t - tb);
#endif
#ifdef PK_HAS_exposure
  t += u_exposure * 0.3;
#endif
  t = clamp(t, 0.0, 1.0);
#ifdef PK_HAS_contrast
  t = mix(t, t * t * (3.0 - 2.0 * t), u_contrast);
#endif
  // on dark paper the light parts are inked: hold the highlights back, so a pale photograph sits in a
  // dark (or strongly coloured) page as a lit print instead of glaring out of it as a white block
  if (u_paperLight < 0.5) t *= 0.8;
  return t;
}
// the tone as light (linear): screens, dots, lines and dither mix paper and ink as light, so a tone's
// share of ink is worked out on this scale, or the light parts print far too pale
float pk_lin(float t) { return pow(clamp(t, 0.0, 1.0), 2.0); }
// the share of ink a tone takes on this paper, as light (dark paper: the light parts are inked)
float pk_ink(float t) { return u_paperLight > 0.5 ? 1.0 - pk_lin(t) : pk_lin(t); }

// ---- the print, shared by the three objects. A point's state m runs 0 (the photograph itself) ..
// 0.5 (the full print) .. 1 (bare paper). Each print matches the photograph's average colour, so the
// photograph turns into it without a halo: only the texture comes in.
const vec3 PK_Y = vec3(0.2126, 0.7152, 0.0722);
// how far a canvas point lies inside the picture from its printed edge: 0 at that edge, 1 across the
// frame (side 0 left, 1 right, 2 bottom, 3 top) or at the middle (side 4: every edge, round corners)
float pk_inset(vec2 p) {
  vec2 uv = p / u_res;
#ifdef PK_HAS_side
  float sd = u_side;
#else
  float sd = 0.0;
#endif
  if (sd < 0.5) return uv.x;
  if (sd < 1.5) return 1.0 - uv.x;
  if (sd < 2.5) return uv.y;
  if (sd < 3.5) return 1.0 - uv.y;
  vec2 q = 1.0 - min(p, u_res - p) / (0.5 * min(u_res.x, u_res.y));
  return 1.0 - length(max(q, 0.0));
}
// the state at rest: the print takes the share u_print of the picture from its printed edge and thins
// toward bare paper at the very edge (u_fade); the light parts give way a little first and a faint
// noise keeps the boundary from reading as a ruled line. print 0: the plain photograph; 1: all print
float pk_rest(vec2 p, float tone) {
#ifdef PK_HAS_print
  if (u_print <= 0.001) return 0.0;
  if (u_print >= 0.999) return 0.5;
  float n = fx_vnoise(p / (min(u_res.x, u_res.y) * 0.2) + 7.0) - 0.5;
  float lead = u_paperLight > 0.5 ? tone : 1.0 - tone;
  float r = pk_inset(p) / u_print + 0.16 * n - 0.16 * (lead - 0.5);
#ifdef PK_HAS_fade
  float edge = 0.5 + 0.5 * u_fade;
#else
  float edge = 0.75;
#endif
  return edge * (1.0 - smoothstep(0.0, 1.0, r));
#else
  return 0.5;
#endif
}
// under the cursor the picture turns over: the plain photograph prints, the print develops
float pk_flip(float m) { return 0.5 * (1.0 - smoothstep(0.12, 0.42, m)); }
// colour c read at canvas point p over foot px, with the object's clarity, exposure and contrast
// applied to its lightness, its hue kept (all 0: c itself, so the print matches the photograph)
vec3 pk_steer(vec3 c, vec2 p, float foot) {
  float L0 = max(pk_L(c), 1e-3), L = L0;
#ifdef PK_HAS_clarity
  L += u_clarity * 0.8 * (L0 - pk_L(pk_photo(p, foot * 9.0)));
#endif
#ifdef PK_HAS_exposure
  L += u_exposure * 0.2;
#endif
  L = clamp(L, 0.0, 1.0);
#ifdef PK_HAS_contrast
  L = mix(L, L * L * (3.0 - 2.0 * L), u_contrast);
#endif
  float k = L / L0;
  return clamp(fx_srgb(fx_lin(c) * k * k * k), 0.0, 1.0);
}

// the print's paper: the page's surface (param ground 1, the default, so the frame reads as a print on
// its own sheet and never melts into the page) or the page itself (ground 0)
vec3 pk_paper() {
#ifdef PK_HAS_ground
  return mix(u_bg, u_surface, u_ground);
#else
  return u_bg;
#endif
}

// the cursor's soft circle of radius r canvas px, times the hover amount; with a trail, its path too
float pk_reach(vec2 p, float r) {
  float f = u_mouse.z * (1.0 - smoothstep(0.0, r, length(p - u_mouse.xy)));
#ifdef PK_TRAIL
  for (int i = 0; i < PK_TRAIL; i++) {
    vec3 q = u_trail[i];
    if (q.z > 0.002) f = max(f, q.z * (1.0 - smoothstep(0.0, r * (0.35 + 0.45 * q.z), length(p - q.xy))));
  }
#endif
  return f;
}
`;

function glslType(v) {
  if (typeof v === 'number' || typeof v === 'boolean') return 'float';
  const n = v && v.length;
  if (n >= 1 && n <= 4) return ['float', 'vec2', 'vec3', 'vec4'][n - 1];
  throw new Error('photo-kit: uniform values must be numbers or arrays of 2 to 4 numbers');
}

const VERT2 = '#version 300 es\nin vec2 a_pos;\nvoid main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';
const VERT1 = 'attribute vec2 a_pos;\nvoid main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';
const BASE = ['u_time', 'u_seed', 'u_dpr', 'u_fit', 'u_enter', 'u_zoom', 'u_paperLight', 'u_res', 'u_imgRes', 'u_texRes', 'u_focus', 'u_levels', 'u_vel', 'u_mouse', 'u_frame',
  'u_bg', 'u_surface', 'u_ink', 'u_muted', 'u_accent', 'u_accentInk'];
const PAL = { u_bg: 'bg', u_surface: 'surface', u_ink: 'ink', u_muted: 'muted', u_accent: 'accent', u_accentInk: 'accentInk' };

function header(gl2, ext, paramKeys, custom, texNames, stats, trail) {
  let s = gl2 ? '#version 300 es\n' : '';
  if (!gl2 && ext.deriv) s += '#extension GL_OES_standard_derivatives : enable\n';
  if (!gl2 && ext.lod) s += '#extension GL_EXT_shader_texture_lod : enable\n#define PK_LOD_EXT 1\n';
  s += '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  s += 'uniform float u_time, u_seed, u_dpr, u_fit, u_enter, u_zoom, u_paperLight;\n';
  s += 'uniform vec2 u_res, u_imgRes, u_texRes, u_focus, u_levels, u_vel, u_frame;\nuniform vec3 u_mouse;\n';
  s += 'uniform vec3 u_bg, u_surface, u_ink, u_muted, u_accent, u_accentInk;\n';
  s += 'uniform sampler2D u_img;\n';
  if (stats) s += 'uniform sampler2D u_stats;\n#define PK_STATS 1\n';
  for (const k of paramKeys) s += `uniform float u_${k};\n#define PK_HAS_${k} 1\n`;
  for (const [k, v] of Object.entries(custom)) s += `uniform ${glslType(v)} ${k};\n`;
  for (const k of texNames) s += `uniform sampler2D ${k};\n`;
  if (trail) s += `#define PK_TRAIL ${trail}\nuniform vec3 u_trail[${trail}];\n`;
  return s;
}

/* ------------------------------------------------------------------ GLSL lint */

// GLSL ES 3.00 words reserved for future use (section 3.7) and later keywords some drivers reject as
// names. CPU WebGL (SwiftShader, a headless Chrome) compiles a shader that uses some of them; a
// laptop's GPU rejects the whole shader, and the picture stays empty (a struct field named flat left
// a hero blank). So the runtime refuses such a shader itself, and the still fallback shows everywhere.
const GLSL_RESERVED = new Set(('attribute varying coherent volatile restrict readonly writeonly resource atomic_uint ' +
  'noperspective patch sample subroutine common partition active asm class union enum typedef template this goto packed ' +
  'inline noinline public static extern external interface long short double half fixed unsigned superp input output ' +
  'hvec2 hvec3 hvec4 dvec2 dvec3 dvec4 fvec2 fvec3 fvec4 dmat2 dmat3 dmat4 sampler3DRect filter sizeof cast namespace using ' +
  'precise buffer shared image1D image2D image3D imageCube imageBuffer image1DArray image2DArray sampler1D sampler1DShadow ' +
  'sampler1DArray sampler2DRect sampler2DRectShadow samplerBuffer sampler2DMS samplerCubeArray').split(' '));
// qualifiers and keywords: never a name or a field
const GLSL_NEVER_NAMES = new Set(['flat', 'smooth', 'centroid', 'invariant', 'layout', 'precision', 'lowp', 'mediump', 'highp',
  'uniform', 'in', 'out', 'inout', 'const', 'struct', 'switch', 'case', 'default', 'discard']);
/**
  The faults a strict (GPU) compiler rejects in a fragment source, as ["line 12: ..."]: a reserved word
  anywhere, a qualifier used as a name or a field, a double underscore or an unknown gl_ prefix.
  Preprocessor lines and comments are skipped. Empty when the source is clean.
*/
export function glslLint(src) {
  const out = [];
  const code = String(src).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/\/\/[^\n]*/g, '');
  code.split('\n').forEach((ln, i) => {
    if (/^\s*#/.test(ln)) return;
    for (const m of ln.matchAll(/(?<!\w)[A-Za-z_]\w*/g)) {
      const w = m[0], field = ln[m.index - 1] === '.', at = `line ${i + 1}: `;
      if (GLSL_RESERVED.has(w)) out.push(at + `"${w}" is reserved in GLSL ES`);
      else if (w.includes('__')) out.push(at + `"${w}": a double underscore is reserved`);
      else if (/^gl_/.test(w) && !/^gl_(FragCoord|FragColor|FragData|FrontFacing|PointCoord|Position|PointSize|Max\w+)$/.test(w)) out.push(at + `"${w}": the gl_ prefix is reserved`);
      else if (field && GLSL_NEVER_NAMES.has(w)) out.push(at + `".${w}": a keyword is never a field`);
    }
    // a qualifier or keyword declared as a name: "float flat", "vec3 smooth = ..."
    for (const m of ln.matchAll(/\b(?:float|int|bool|vec[234]|mat[234]|ivec[234]|bvec[234])\s+([A-Za-z_]\w*)/g)) {
      if (GLSL_NEVER_NAMES.has(m[1])) out.push(`line ${i + 1}: "${m[1]}" is a keyword, not a name`);
    }
  });
  return [...new Set(out)];
}
const lintCache = new Map();
function lintOnce(src) {
  if (!lintCache.has(src)) lintCache.set(src, glslLint(src));
  return lintCache.get(src);
}
/**
  The fragment source a photo object compiles, exactly as photoGL builds it, for a check outside the
  page (node: import an object and lint photoShader(object) for both WebGL versions):
    photoShader({ frag, schema, uniforms: { u_inkC: [0, 0, 0] }, textures: ['u_noise'], stats, trail }, { gl2 })
*/
export function photoShader({ frag, schema = {}, uniforms = {}, textures = [], stats = false, trail = 0 } = {}, { gl2 = true, ext = { deriv: true, lod: true } } = {}) {
  return header(gl2, gl2 ? {} : ext, Object.keys(schema), uniforms, textures, stats, trail) + GLSL_LIB + PK_LIB + '\n#line 1\n' + frag;
}

const pot = v => Math.pow(2, Math.round(Math.log2(Math.max(1, v))));
// the photograph as a texture source: at most 2048 px, power-of-two sized under WebGL1 (for mipmaps)
function textureSource(img, gl2, maxTex) {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  const k = Math.min(1, Math.min(2048, maxTex) / Math.max(w, h));
  let W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
  if (!gl2) { W = Math.min(2048, pot(W)); H = Math.min(2048, pot(H)); }
  if (W === w && H === h) return { source: img, width: w, height: h };
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, W, H);
  return { source: c, width: W, height: H };
}

function makeTexture(gl, t, { flip = false, mip = false } = {}) {
  gl.activeTexture(gl.TEXTURE7); // a scratch unit, so making a texture never unbinds one in use
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  if (t.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, t.width, t.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, t.data);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.source);
  const wrap = t.wrap === 'repeat' ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  const near = t.filter === 'nearest';
  if (mip || t.mip) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  } else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, near ? gl.NEAREST : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, near ? gl.NEAREST : gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  return tex;
}

function hostPrep(el, palette) {
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  if (cs.isolation !== 'isolate') el.style.isolation = 'isolate';
  if (cs.overflow === 'visible') el.style.overflow = 'hidden';
  el.style.backgroundColor = palette.bg;
}

/* ------------------------------------------------------------------ mount */

export function photoGL(el, spec) {
  if (!HAS_DOM) throw new Error('photo-kit needs a browser');
  const schema = spec.schema || {};
  const paramKeys = Object.keys(schema);
  let params = resolveParams(schema, spec.params);
  let palette = normalizePalette(spec.palette || readPalette(el));
  const seed = hashSeed(spec.seed ?? 7);
  const crisp = !!spec.crisp;
  const trailN = spec.trail || 0;
  const entrySecs = spec.entry ?? 1.4;

  // the photograph: the src given, else an <img> inside el (kept for its alt text and the fallback).
  // The <img> stays on view, greyed into the palette, under the canvas: it is what shows before the
  // first frame, while the canvas is released off screen, and whenever the effect cannot run.
  const imgEl = el.querySelector('img');
  const imgCss = imgEl ? imgEl.style.cssText : '';
  const src = spec.src || (imgEl && bestSrc(imgEl)) || el.dataset.src || el.dataset.photo;
  // the subject's place: focusX/focusY when given, else the <img>'s object-position (photos.mjs fetch
  // writes the subject's place there), else spec.focus, else the middle. Read before the <img> is restyled.
  const given = new Set(Object.keys(spec.params || {}));
  const imgFocus = imgEl ? parsePosition(imgEl.style.objectPosition || (v => (v === '50% 50%' ? '' : v))(getComputedStyle(imgEl).objectPosition)) : null;
  hostPrep(el, palette);

  let canvas = null, gl = null, gl2 = false, ext = {}, prog = null, buf = null, locs = {}, tex = {}, texKeys = {};
  let released = true, lost = false, shown = false, fallbackOn = false, ready = false, dirty = true, budgetDone = null;
  // px: canvas px per CSS px in use; scale: the adaptive cut (1, lowered when frames run slow)
  let width = 0, height = 0, px = 1, scale = 1, hideTimer = 0;
  let img = null, info0 = { levels: [0, 1], mean: 0.5 }, srcTex = null, statsData = null;
  let custom = {}, extraTex = {};
  let deferWarned = false, deferTimer = 0, deferUntil = 0;
  let enterT = 0, inViewEnough = false, frames = 0, fpsT = 0, fps = 0, compileMs = 0, compileT0 = 0, pending = null;
  const perf = { n: 0, sum: 0, warm: 0 };
  const ptr = { x: 0, y: 0, h: 0, tx: 0, ty: 0, th: 0, vx: 0, vy: 0, seen: false, user: -1e9, touchTimer: 0 };
  const trail = Array.from({ length: trailN }, () => ({ x: 0, y: 0, s: 0 }));
  let trailHead = 0, trailLast = { x: -1e4, y: -1e4, t: 0 };
  // touch screens: a tap shows the hover for 1.6 s. A loupe wandering on its own reads as a random
  // motion, so it runs only when the object asks for it
  const wander = spec.wander === true && !!(noHoverQ && noHoverQ.matches);
  // the entry plays only for a picture on screen as the page loads (a hero); one reached by scrolling
  // shows finished, so nothing reveals itself on scroll
  {
    const r0 = el.getBoundingClientRect();
    const onScreen = r0.width > 0 && r0.bottom > 0 && r0.top < (window.innerHeight || 0);
    if (!(onScreen && performance.now() < 6000)) enterT = entrySecs;
  }
  // at rest the picture is still unless the object's own rest motion is on (spec.restMotion(params)):
  // then no frames run at all until the cursor arrives
  const quiet = () => !wander && ptr.h < 0.002 && ptr.th === 0 && enterAmt() >= 1 && !trail.some(q => q.s > 0.003)
    && !(spec.restMotion && spec.restMotion(params));

  // a small frame (a phone, a card) takes a finer screen, so the picture keeps its detail
  const fitAmt = () => clamp(Math.sqrt(Math.max(1, Math.min(width, height)) / 720), 0.6, 1);
  const ctx = () => ({ params, palette, seed, dpr: px, fit: fitAmt(), width, height, color, paperLight: color.lab(palette.bg)[0] >= color.lab(palette.ink)[0], levels: info0.levels, image: img });
  const focusOf = i => {
    const k = i ? 'focusY' : 'focusX';
    if (given.has(k) && params[k] != null) return params[k];
    return imgFocus?.[i] ?? spec.focus?.[i] ?? params[k] ?? 0.5;
  };
  const focus = () => [focusOf(0), focusOf(1)];

  function rebuild() {
    custom = spec.uniforms ? spec.uniforms(ctx()) || {} : {};
    extraTex = spec.textures ? spec.textures(ctx()) || {} : {};
    dirty = true;
  }

  /* ---------- fallback: the photograph itself, greyed into the palette */
  let fb = imgEl || null;
  function greyLook(img) {
    const light = color.lab(palette.bg)[0] >= color.lab(palette.ink)[0];
    const [x, y] = focus();
    Object.assign(img.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x * 100}% ${y * 100}%`,
      opacity: light ? '0.92' : '0.85', zIndex: '-2', pointerEvents: 'none', filter: 'grayscale(1) contrast(1.06)',
      mixBlendMode: light ? 'multiply' : 'screen', borderRadius: 'inherit',
    });
  }
  if (imgEl) greyLook(imgEl);
  // reason 'no-image': there is no photograph at all; 'no-cors': it loads, but its host does not let
  // WebGL read it (no CORS headers), so the plain <img> shows it; 'no-webgl', 'shader-error', 'forced'
  function useFallback(reason) {
    fallbackOn = true;
    teardown();
    el.dataset.pkFallback = reason;
    el.style.background = palette.bg;
    if (!src || reason === 'no-image') { if (fb) fb.style.display = 'none'; el.style.background = fallbackCSS(palette); return; }
    if (!fb) {
      fb = document.createElement('img');
      fb.alt = ''; fb.setAttribute('aria-hidden', 'true');
      fb.decoding = 'async';
      fb.src = src;
      el.insertBefore(fb, el.firstChild);
    }
    fb.onerror = () => { if (fallbackOn) useFallback('no-image'); };
    greyLook(fb);
    fb.style.display = '';
    lc && lc.sync();
  }

  /* ---------- GL */
  function teardown() {
    livePK.delete(holder);
    if (budgetDone) { budgetDone(); budgetDone = null; }
    if (gl && !gl.isContextLost()) {
      try {
        for (const t of Object.values(tex)) gl.deleteTexture(t);
        if (prog) gl.deleteProgram(prog);
        if (buf) gl.deleteBuffer(buf);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_) { /* gone */ }
    }
    if (canvas) canvas.remove();
    canvas = gl = prog = buf = null;
    locs = {}; tex = {}; texKeys = {};
    shown = false;
    pending = null;
  }

  // the photograph on unit 0, its stats on 1, the object's own textures from 2 (made or remade by key)
  function bindTextures() {
    const bind = (name, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex[name]);
      if (locs[name]) gl.uniform1i(locs[name], unit);
    };
    bind('u_img', 0);
    if (tex.u_stats) bind('u_stats', 1);
    let unit = 2;
    for (const [name, t] of Object.entries(extraTex)) {
      const key = t.key || null;
      if (!tex[name] || !key || texKeys[name] !== key) {
        if (tex[name]) gl.deleteTexture(tex[name]);
        tex[name] = makeTexture(gl, t);
        texKeys[name] = key;
      }
      bind(name, unit++);
    }
  }

  function init() {
    if (fallbackOn || !ready || performance.now() < deferUntil) return;
    if (config.forceFallback) return useFallback('forced');
    // a page keeps at most MAX_LIVE photo contexts: a new one releases those longest off screen
    if (livePK.size >= MAX_LIVE) {
      for (const h of [...livePK].filter(h => !h.visible).sort((a, b) => a.seen - b.seen)) { if (livePK.size < MAX_LIVE) break; h.release(); }
      // then those whose frame has left the window (the lifecycle counts a margin around it as visible),
      // then one with much less of its frame on screen than this one (a frame scrolling away gives way)
      for (const h of [...livePK].filter(h => h.shown() === 0).sort((a, b) => a.seen - b.seen)) { if (livePK.size < MAX_LIVE) break; h.release(); }
      const mine = holder.shown(), least = [...livePK].sort((a, b) => a.shown() - b.shown())[0];
      if (livePK.size >= MAX_LIVE && least && least.shown() < mine * 0.5) least.release();
      if (livePK.size >= MAX_LIVE) {
        // never a fourth context: the greyed photograph stays until one is released, then it tries again
        if (!deferWarned) { deferWarned = true; console.warn('photo-kit: more than ' + MAX_LIVE + ' photo objects on screen at once; show one per screen'); }
        clearTimeout(deferTimer);
        deferUntil = performance.now() + 1600;
        deferTimer = setTimeout(() => { if (released && lc.visible && !destroyed) { init(); fit(true); } }, 1700);
        return;
      }
    }
    livePK.add(holder);
    budgetDone = glBudget(holder);
    canvas = document.createElement('canvas');
    canvas.className = 'pk-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1', pointerEvents: 'none',
      opacity: '0', transition: 'opacity .6s ease', borderRadius: 'inherit',
    });
    const attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    gl = config.forceWebGL1 ? null : canvas.getContext('webgl2', attrs);
    gl2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    if (!gl) { canvas = null; return useFallback('no-webgl'); }
    ext = gl2 ? {} : { deriv: !!gl.getExtension('OES_standard_derivatives'), lod: !!gl.getExtension('EXT_shader_texture_lod') };
    rebuild();
    const texNames = Object.keys(extraTex);
    compileT0 = performance.now();
    // compiled without waiting: with KHR_parallel_shader_compile the driver builds it off the main
    // thread and finish() runs once it is done, so a page never stalls on a cold shader cache
    const fs = header(gl2, ext, paramKeys, custom, texNames, !!spec.stats, trailN) + GLSL_LIB + PK_LIB + '\n#line 1\n' + spec.frag;
    // a word a GPU rejects: refused here too, so a CPU-rendered check shows what a laptop would (the still)
    const bad = lintOnce(fs);
    if (bad.length) {
      console.error('photo-kit: ' + (spec.name || 'object') + ' shader uses words a GPU rejects; showing its still\n' + bad.slice(0, 6).join('\n'));
      return useFallback('shader-lint');
    }
    const mk = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
    const v = mk(gl.VERTEX_SHADER, gl2 ? VERT2 : VERT1), f = mk(gl.FRAGMENT_SHADER, fs);
    prog = gl.createProgram();
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.bindAttribLocation(prog, 0, 'a_pos');
    gl.linkProgram(prog);
    pending = { v, f, texNames, par: gl.getExtension('KHR_parallel_shader_compile') };
    const mine = canvas;
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      if (canvas !== mine) return;
      lost = true;
      setTimeout(() => {
        if (canvas !== mine) return;
        teardown();
        released = true;
        lost = false;
        if (lc.visible) { init(); fit(true); }
      }, 60);
    });
    el.insertBefore(canvas, el.firstChild);
    released = false;
    dirty = true;
  }

  // true once the program is linked and the buffers and textures are made; false while the driver is
  // still compiling (or after an error, which switches to the fallback)
  function finish() {
    if (!pending) return !!prog;
    const { v, f, texNames, par } = pending;
    if (par && !gl.isContextLost() && !gl.getProgramParameter(prog, par.COMPLETION_STATUS_KHR)) return false;
    pending = null;
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
      const log = gl.getShaderInfoLog(f) || gl.getShaderInfoLog(v) || gl.getProgramInfoLog(prog);
      console.error('photo-kit: ' + (spec.name || 'object') + ' shader did not compile\n' + log);
      useFallback('shader-error');
      return false;
    }
    gl.deleteShader(v);
    gl.deleteShader(f);
    compileMs = Math.round(performance.now() - compileT0);
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    for (const n of [...BASE, ...paramKeys.map(k => 'u_' + k), ...Object.keys(custom), ...texNames, 'u_img', 'u_stats', 'u_trail', 'u_trail[0]']) locs[n] = gl.getUniformLocation(prog, n);
    // the photograph (mipmapped: effects read it averaged over a cell), then its stats, then the object's own
    srcTex = textureSource(img, gl2, gl.getParameter(gl.MAX_TEXTURE_SIZE));
    tex.u_img = makeTexture(gl, srcTex, { flip: true, mip: true });
    if (spec.stats) {
      statsData = statsData || statsOf(img) || { data: new Uint8Array([0, 128, 0, 255]), width: 1, height: 1 };
      tex.u_stats = makeTexture(gl, statsData, { mip: true });
    }
    dirty = true;
    return true;
  }

  function setU(name, v) {
    const l = locs[name];
    if (!l || v == null) return;
    if (typeof v === 'number' || typeof v === 'boolean') gl.uniform1f(l, +v);
    else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
    else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
    else if (v.length === 4) gl.uniform4f(l, v[0], v[1], v[2], v[3]);
  }

  /* ---------- pointer, trail and entry, eased per frame */
  function step(t, dt) {
    const now = performance.now();
    if (wander && now - ptr.user > 4000 && width > 0) {
      // touch screens have no hover: a slow loupe wanders through the picture now and then
      const c = (t % 14) / 14;
      ptr.tx = width * (0.5 + 0.3 * Math.sin(t * 0.21));
      ptr.ty = height * (0.5 + 0.26 * Math.sin(t * 0.29 + 1.3));
      ptr.th = c > 0.08 && c < 0.55 ? 0.9 : 0;
      if (!ptr.seen) { ptr.x = ptr.tx; ptr.y = ptr.ty; ptr.seen = true; }
    }
    if (dt > 0) {
      const k = 1 - Math.exp(-dt * 11);
      const px = ptr.x, py = ptr.y;
      ptr.x += (ptr.tx - ptr.x) * k;
      ptr.y += (ptr.ty - ptr.y) * k;
      const kv = 1 - Math.exp(-dt * 6);
      ptr.vx += ((ptr.x - px) / dt - ptr.vx) * kv;
      ptr.vy += ((ptr.y - py) / dt - ptr.vy) * kv;
      const rate = ptr.th > ptr.h ? 5.5 : 2.4;
      ptr.h += (ptr.th - ptr.h) * (1 - Math.exp(-dt * rate));
      if (Math.abs(ptr.th - ptr.h) < 0.002) ptr.h = ptr.th;
      if (trailN) {
        for (const q of trail) q.s *= Math.exp(-dt / 0.5);
        if (Math.hypot(ptr.x - trailLast.x, ptr.y - trailLast.y) > 10 && t - trailLast.t > 0.04 && (ptr.th > 0 || ptr.h > 0.05)) {
          const q = trail[trailHead];
          // a quick stroke marks its path at once, before the hover has eased in
          q.x = ptr.x; q.y = ptr.y; q.s = Math.max(ptr.h, ptr.th * 0.85) * clamp(Math.hypot(ptr.vx, ptr.vy) / 700, 0.3, 1);
          trailHead = (trailHead + 1) % trailN;
          trailLast = { x: ptr.x, y: ptr.y, t };
        }
      }
      if (inViewEnough) enterT += dt;
    }
  }
  const enterAmt = () => (reduced() || config.clock != null || entrySecs <= 0 ? 1 : clamp(enterT / entrySecs, 0, 1));

  function draw(t, dt) {
    if (fallbackOn || !ready) return;
    if (released) { if (!lc.visible) return; init(); if (fallbackOn || !gl) return; fit(false); }
    if (!gl || lost || !prog) return;
    holder.seen = performance.now();
    if (!finish()) { if (pending && !lc.running) setTimeout(() => lc.redraw(), 50); return; }
    step(t, dt);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    if (dirty) {
      for (const [u, k] of Object.entries(PAL)) setU(u, color.rgb(palette[k]));
      setU('u_paperLight', color.lab(palette.bg)[0] >= color.lab(palette.ink)[0] ? 1 : 0);
      for (const k of paramKeys) setU('u_' + k, params[k]);
      for (const [k, v] of Object.entries(custom)) setU(k, v);
      setU('u_seed', seed);
      setU('u_fit', fitAmt());
      setU('u_imgRes', [img.naturalWidth, img.naturalHeight]);
      setU('u_texRes', [srcTex.width, srcTex.height]);
      const [fxp, fyp] = focus();
      setU('u_focus', [fxp, 1 - fyp]);
      setU('u_levels', info0.levels);
      bindTextures();
      dirty = false;
    }
    const cs = canvas.width / Math.max(1, width);
    setU('u_time', t);
    setU('u_res', [canvas.width, canvas.height]);
    setU('u_frame', [width, height]);
    setU('u_dpr', cs);
    setU('u_enter', enterAmt());
    setU('u_zoom', spec.zoom ? spec.zoom(t, params) : 1);
    setU('u_mouse', [ptr.x * cs, (height - ptr.y) * cs, ptr.h]);
    setU('u_vel', [ptr.vx * cs, -ptr.vy * cs]);
    if (trailN) {
      const l = locs['u_trail[0]'] || locs.u_trail;
      if (l) {
        const a = new Float32Array(trailN * 3);
        trail.forEach((q, i) => { a[i * 3] = q.x * cs; a[i * 3 + 1] = (height - q.y) * cs; a[i * 3 + 2] = q.s; });
        gl.uniform3fv(l, a);
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!shown) { shown = true; canvas.style.opacity = '1'; }
    if (dt > 0) {
      frames++; fpsT += dt;
      if (fpsT >= 1) { fps = frames / fpsT; frames = 0; fpsT = 0; }
      if (config.adaptive && lc.running) adapt(dt);
    }
  }

  function adapt(dt) {
    if (perf.warm < 60) { perf.warm++; return; }
    perf.n++; perf.sum += dt;
    if (perf.n < 90) return;
    const avg = perf.sum / perf.n;
    perf.n = perf.sum = 0;
    // under about 55 fps the canvas renders smaller, down to 0.6 of its scale (a crisp object keeps its own)
    if (avg > 1 / 55) {
      if (!crisp && scale > 0.62) { scale = Math.max(0.6, scale * 0.82); fit(false); }
    }
  }

  function fit(redraw) {
    width = el.clientWidth; height = el.clientHeight;
    if (fallbackOn || !canvas) return;
    const s = renderScale(width, height, { crisp, heavy: !!spec.heavy, maxScale: spec.maxScale || MAX_SCALE }) * (crisp ? 1 : scale);
    const W = Math.max(1, Math.round(width * s)), H = Math.max(1, Math.round(height * s));
    if (canvas.width !== W || canvas.height !== H) {
      px = s;
      canvas.width = W; canvas.height = H;
      // pixelated only where the screen shows each canvas px as whole device px; else a soft upscale
      const ratio = (window.devicePixelRatio || 1) / s;
      canvas.style.imageRendering = crisp && Math.abs(ratio - Math.round(ratio)) < 0.02 ? 'pixelated' : 'auto';
      rebuild();
    }
    if (redraw !== false) lc.redraw();
  }

  /* ---------- pointer events */
  const local = e => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function aim(x, y, h) {
    ptr.tx = x; ptr.ty = y; ptr.th = h; ptr.user = performance.now();
    if (!ptr.seen || ptr.h < 0.02) { ptr.x = x; ptr.y = y; ptr.seen = true; }
    lc.sync(); // a still picture starts its frames again
    if (!lc.running) { ptr.x = x; ptr.y = y; ptr.h = h; lc.redraw(); }
  }
  const onMove = e => { const [x, y] = local(e); aim(x, y, 1); };
  const onLeave = e => {
    if (e && e.pointerType && e.pointerType !== 'mouse') return; // a finger lifting: the hold timer ends it
    ptr.th = 0; ptr.user = performance.now(); if (!lc.running) { ptr.h = 0; for (const q of trail) q.s = 0; lc.redraw(); } };
  const onDown = e => {
    if (e.pointerType === 'mouse') return;
    const [x, y] = local(e);
    aim(x, y, 1);
    clearTimeout(ptr.touchTimer);
    ptr.touchTimer = setTimeout(onLeave, 1600);
  };
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave, { passive: true });
  el.addEventListener('pointerdown', onDown, { passive: true });

  const holder = {
    seen: 0,
    get visible() { return lc.visible; },
    // the CSS px of its frame inside the window
    shown() { const r = el.getBoundingClientRect(); return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)); },
    release() { if (canvas && !released) { teardown(); released = true; } },
  };

  const lc = lifecycle(el, {
    draw,
    idle: () => fallbackOn || (ready && quiet()),
    still: spec.still ?? 6,
    onShow() { clearTimeout(hideTimer); holder.seen = performance.now(); if (released && ready && !fallbackOn) { init(); fit(false); } },
    // off screen for 1.5 s: the context goes, so a long page never holds more than the screen shows
    onHide() { clearTimeout(hideTimer); hideTimer = setTimeout(() => { if (!lc.visible) holder.release(); }, 1500); },
  });

  // the entry runs once the object is a quarter on screen (the lifecycle starts drawing a little before)
  const io = new IntersectionObserver(es => { inViewEnough = es[es.length - 1].intersectionRatio >= 0.2 || es[es.length - 1].intersectionRect.height > 200; }, { threshold: [0, 0.2, 0.5] });
  io.observe(el);
  const ro = new ResizeObserver(() => fit(true));
  ro.observe(el);

  width = el.clientWidth; height = el.clientHeight;
  if (!src) useFallback('no-image');
  else {
    loadImage(src).then(im => {
      if (destroyed) return;
      img = im;
      info0 = analyse(im);
      ready = true;
      if (lc.visible) { init(); fit(true); }
      lc.sync();
    }).catch(err => { console.warn(err.message + ' (shown as a plain photograph: its host sends no CORS headers, or it is missing)'); if (!destroyed) useFallback('no-cors'); });
  }

  let destroyed = false;
  return {
    pause: () => lc.pause(),
    resume: () => lc.resume(),
    redraw: () => lc.redraw(),
    set(next) {
      for (const k of Object.keys(next || {})) given.add(k);
      params = resolveParams(schema, { ...params, ...next });
      rebuild();
      if (fallbackOn) useFallback(el.dataset.pkFallback || 'fallback');
      lc.redraw();
      return params;
    },
    setPalette(p) {
      palette = normalizePalette(p);
      el.style.backgroundColor = palette.bg;
      if (fb) greyLook(fb);
      rebuild();
      if (fallbackOn) useFallback(el.dataset.pkFallback || 'fallback');
      lc.redraw();
    },
    /** GPU time of one frame in ms, averaged over n frames drawn back to back (hover on: the loupe's cost too) */
    bench(n = 60, hover = true) {
      if (!gl || !prog || pending || fallbackOn) return null;
      const keep = { ...ptr };
      if (hover) { ptr.x = ptr.tx = width * 0.5; ptr.y = ptr.ty = height * 0.5; ptr.h = ptr.th = 1; }
      const px = new Uint8Array(4), t = lc.time;
      draw(t, 0);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const t0 = performance.now();
      for (let i = 0; i < n; i++) draw(t + i / 60, 0);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const ms = (performance.now() - t0) / n;
      Object.assign(ptr, keep);
      return Math.round(ms * 100) / 100;
    },
    /** restart the entry animation (demos) */
    replay() { enterT = 0; lc.sync(); lc.redraw(); },
    destroy() {
      destroyed = true;
      lc.destroy();
      io.disconnect();
      ro.disconnect();
      clearTimeout(ptr.touchTimer);
      clearTimeout(hideTimer);
      clearTimeout(deferTimer);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      teardown();
      if (fb && fb !== imgEl) fb.remove();
      if (imgEl) imgEl.style.cssText = imgCss;
      delete el.dataset.pkFallback;
    },
    get canvas() { return canvas; },
    get info() {
      return { webgl: gl ? (gl2 ? 2 : 1) : 0, fallback: fallbackOn ? el.dataset.pkFallback : null, scale: px, live: livePK.size, size: canvas ? [canvas.width, canvas.height] : null, running: lc.running, fps: Math.round(fps * 10) / 10, levels: info0.levels, enter: enterAmt(), compileMs };
    },
  };
}

/** the three palette tones of a print, darkest first, as sRGB 0..1: paper and ink at the ends, the mid between */
export function printTones(P, midFrom = 'accent', midMix = 1) {
  const L = c => color.lab(c)[0];
  const light = L(P.bg) >= L(P.ink);
  const paper = P.bg, ink = P.ink;
  // the middle tone is the accent held between paper and ink in lightness, so the scale stays in order
  let mid = midFrom === 'muted' ? P.muted : P.accent;
  const lo = Math.min(L(paper), L(ink)), hi = Math.max(L(paper), L(ink));
  const Lm = clamp(L(mid), lo + 0.22 * (hi - lo), lo + 0.72 * (hi - lo));
  mid = color.mix(color.mix(paper, ink, 0.5), color.withLightness(mid, Lm), midMix);
  const order = light ? [ink, mid, paper] : [paper, mid, ink];
  const out = order.map(c => color.rgb(c));
  // where the middle tone sits between the darkest and the lightest, as light (0..1)
  out.midPos = Math.pow(clamp((color.lab(mid)[0] - lo) / Math.max(1e-3, hi - lo), 0, 1), 2);
  return out;
}

const escHTML = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/**
  The credit a photograph needs, as HTML: the author linked to the source, the licence linked to its
  deed, where it came from, and "adapted" (a print changes the picture, which CC BY-SA asks to be
  said). p: an entry of the site's assets/img/credits.json (written by scripts/photos.mjs fetch), of the
  skill's photos.json, or of photo-kit/photos.json: { by, page, licence, licenceUrl, source }. The
  client's own photograph has no `by` and needs no credit: ''.
    photoCredit(p) -> 'Photo: <a href="...">LoMit</a>, <a href="...">CC BY-SA 4.0</a>, via Wikimedia Commons, adapted'
  It goes in the page's one credits line in the footer (photos.mjs credits --out <site> --adapted <id>
  writes the whole line, or creditsLine() below), never as a caption under the picture.
*/
export function photoCredit(p, { adapted = true, prefix = 'Photo: ' } = {}) {
  if (!p || !p.by) return '';
  const a = (href, text) => (href ? `<a href="${escHTML(href)}" target="_blank" rel="noopener">${escHTML(text)}</a>` : escHTML(text));
  const src = String(p.source || '').toLowerCase();
  // an Unsplash photograph is credited "on Unsplash" (its licence asks for no more); others name their licence
  if (src.includes('unsplash')) return `${prefix}${a(p.page, p.by)} on Unsplash${adapted ? ', adapted' : ''}`;
  const lic = p.licence ? `, ${a(p.licenceUrl, p.licence)}` : '';
  return `${prefix}${a(p.page, p.by)}${lic}${src.includes('commons') ? ', via Wikimedia Commons' : ''}${adapted ? ', adapted' : ''}`;
}
/**
  The footer's one credits line for the photographs a page shows (entries as above; those printed
  through a photo object marked adapted, by `adapted: true` on the entry or their id in `adapted`):
    creditsLine(list, { adapted: ['d88'] }) -> 'Photographs: A on Unsplash; B, CC BY-SA 4.0, via Wikimedia Commons, adapted.'
  '' when none needs a credit (the client's own photographs).
*/
export function creditsLine(list, { adapted = [] } = {}) {
  const parts = (list || []).filter(p => p && p.by).map(p => photoCredit(p, { prefix: '', adapted: p.adapted ?? adapted.includes(p.id ?? p.key ?? p.file) }));
  return parts.length ? `Photographs: ${parts.join('; ')}.` : '';
}
/**
  A site footer's credits, in the form scripts/photos.mjs credits prints (one short line that opens the
  list), for photographs that did not come through photos.mjs; a printed one is marked adapted:
    creditsBlock(list, { adapted: ['d88'] }) -> '<details class="credits"><summary>Photographs via Wikimedia Commons</summary><p>...</p></details>'
  '' when none needs a credit (the client's own photographs).
*/
export function creditsBlock(list, { adapted = [] } = {}) {
  const ps = (list || []).filter(p => p && p.by);
  if (!ps.length) return '';
  const srcOf = p => (/unsplash/i.test(p.source || '') ? 'Unsplash' : /commons|wikimedia/i.test(p.source || '') ? 'Wikimedia Commons' : String(p.source || 'the web'));
  const set = [...new Set(ps.map(srcOf))].sort();
  const a = (href, text) => (href ? `<a href="${escHTML(href)}">${escHTML(text)}</a>` : escHTML(text));
  const items = ps.map(p => {
    const lic = srcOf(p) === 'Unsplash' || !p.licence ? '' : `, ${a(p.licenceUrl, p.licence)}`;
    const via = set.length > 1 ? (srcOf(p) === 'Unsplash' ? ' on Unsplash' : `, via ${escHTML(srcOf(p))}`) : '';
    const ad = (p.adapted ?? adapted.includes(p.id ?? p.key ?? p.file)) ? ', adapted' : '';
    return `<p>${a(p.page, p.by)}${lic}${ad}${via}</p>`;
  });
  return `<details class="credits"><summary>Photographs via ${escHTML(set.join(' and '))}</summary>\n  ${items.join('\n  ')}\n</details>`;
}
