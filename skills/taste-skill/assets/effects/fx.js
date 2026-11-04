/*
  fx.js - the taste-skill effects runtime. One ES module, no dependencies.

  An effect is a folder next to this file: <id>/effect.js + <id>/meta.json.
  effect.js:  export default { id, name, family, params, mount(el, { palette, params, seed }) }
              mount returns { destroy(), pause(), resume() } (and may add set(params)).
  Markup:     <div data-fx="grain-gradient" data-fx-params='{"speed":0.3}' data-fx-seed="7"></div>
              then: import fx from './assets/effects/fx.js'; fx.mountAll(document, palette);
  Shaders:    fx.shader(el, { frag, schema, params, palette, seed, uniforms }) runs a full-screen
              fragment shader with u_time, u_res, u_seed, u_dpr, u_mouse, u_c0..u_c5 (palette) and
              one float uniform u_<name> per param. See GLSL_LIB for the helper functions.
*/

export const VERSION = '1.0.0';
const HAS_DOM = typeof window !== 'undefined' && typeof document !== 'undefined';

export const config = {
  maxDpr: 1.75,        // device-pixel-ratio cap for shader canvases (crisp effects may pass their own)
  maxLive: 14,         // live WebGL contexts kept at once; idle off-screen ones are released
  forceFallback: false,// true: every shader effect uses its CSS fallback (testing)
  forceWebGL1: false,  // true: skip WebGL2 (testing the GLSL ES 1.00 path)
  clock: null,         // a number freezes every effect at that time in seconds (screenshots)
  adaptive: true,      // lower the render scale when frames run slow
  base: null,          // URL of the effects folder; defaults to the folder of this file
};

/* ------------------------------------------------------------------ colour (OKLab) */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const toLin = v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const toGam = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  if (!Number.isFinite(n)) throw new Error(`fx: not a hex colour: ${hex}`);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function rgbToHex(c) {
  return '#' + c.slice(0, 3).map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join('');
}
function toRgb(c) {
  if (Array.isArray(c) || ArrayBuffer.isView(c)) return [c[0], c[1], c[2]];
  return hexToRgb(c);
}
function rgbToLab(rgb) {
  const [r, g, b] = rgb.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
function labToLinear([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
const inGamut = lin => lin.every(v => v >= -1e-4 && v <= 1 + 1e-4);
// OKLab -> sRGB 0..1, keeping lightness and hue and reducing chroma until it fits the gamut
function labToRgb(lab) {
  let lin = labToLinear(lab);
  if (!inGamut(lin)) {
    const [L, a, b] = [clamp(lab[0], 0, 1), lab[1], lab[2]];
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) {
      const k = (lo + hi) / 2;
      if (inGamut(labToLinear([L, a * k, b * k]))) lo = k; else hi = k;
    }
    lin = labToLinear([L, a * lo, b * lo]);
  }
  return lin.map(v => toGam(clamp(v, 0, 1)));
}
const lab = c => rgbToLab(toRgb(c));
const fromLab = L => rgbToHex(labToRgb(L));
function lch(c) {
  const [L, a, b] = lab(c);
  return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
}
function fromLch([L, C, h]) {
  const r = (h * Math.PI) / 180;
  return fromLab([L, C * Math.cos(r), C * Math.sin(r)]);
}
function relLum(c) {
  const [r, g, b] = toRgb(c).map(toLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const color = {
  /** hex or [r,g,b] 0..1 -> [r,g,b] 0..1 (sRGB) */
  rgb: toRgb,
  /** [r,g,b] 0..1 or hex -> '#rrggbb' */
  hex: c => rgbToHex(toRgb(c)),
  /** -> [L,a,b] OKLab */
  lab,
  /** OKLab -> hex (gamut-mapped by reducing chroma) */
  fromLab,
  /** -> [L, C, hue degrees] OKLCH */
  lch,
  fromLch,
  /** perceptual mix in OKLab, t = 0 gives a, 1 gives b */
  mix(a, b, t = 0.5) {
    const A = lab(a), B = lab(b);
    return fromLab(A.map((v, i) => v + (B[i] - v) * t));
  },
  /** add to OKLab lightness (-1..1) */
  lighten(c, d = 0.08) {
    const [L, a, b] = lab(c);
    return fromLab([clamp(L + d, 0, 1), a, b]);
  },
  darken(c, d = 0.08) { return color.lighten(c, -d); },
  /** multiply OKLCH chroma */
  saturate(c, k = 1.2) {
    const [L, C, h] = lch(c);
    return fromLch([L, C * k, h]);
  },
  /** OKLCH adjust: l adds lightness, c multiplies chroma, h adds hue degrees */
  adjust(c, { l = 0, c: ck = 1, h = 0 } = {}) {
    const [L, C, H] = lch(c);
    return fromLch([clamp(L + l, 0, 1), C * ck, (H + h + 360) % 360]);
  },
  /** keep this colour's hue and chroma, take another colour's lightness */
  withLightness(c, L) {
    const [, C, h] = lch(c);
    return fromLch([clamp(L, 0, 1), C, h]);
  },
  luminance: relLum,
  /** WCAG contrast ratio */
  contrast(a, b) {
    const x = relLum(a), y = relLum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  },
  isDark: c => lab(c)[0] < 0.6,
  chroma: c => lch(c)[1],
  /** shortest hue distance in degrees; 0 when either colour is near grey */
  hueDistance(a, b) {
    const A = lch(a), B = lch(b);
    if (A[1] < 0.03 || B[1] < 0.03) return 0;
    const d = Math.abs(A[2] - B[2]) % 360;
    return d > 180 ? 360 - d : d;
  },
  /** the candidate with the best contrast on bg */
  readable(bg, ...candidates) {
    return candidates.reduce((best, c) => (color.contrast(bg, c) > color.contrast(bg, best) ? c : best));
  },
  /** shader-ready vectors */
  vec3: c => toRgb(c),
  labVec: c => lab(c),
};

/* ------------------------------------------------------------------ palette */

const DEFAULT_PALETTE = { bg: '#ffffff', surface: '#f4f4f4', ink: '#111111', muted: '#6b6b6b', accent: '#1a4be0', accentInk: '#ffffff' };

/** fill a partial palette; accepts accentInk or accent-ink */
export function normalizePalette(p) {
  p = p || {};
  const bg = color.hex(p.bg || p.paper || DEFAULT_PALETTE.bg);
  const ink = color.hex(p.ink || p.text || (color.isDark(bg) ? '#f2f2f2' : '#111111'));
  return {
    bg,
    surface: color.hex(p.surface || color.mix(bg, ink, 0.05)),
    ink,
    muted: color.hex(p.muted || color.mix(ink, bg, 0.45)),
    accent: color.hex(p.accent || ink),
    accentInk: color.hex(p.accentInk || p['accent-ink'] || bg),
  };
}

/** 'light' | 'dark' | 'colour' from the background */
export function paletteKind(p) {
  const [L, C] = lch(normalizePalette(p).bg);
  if (C > 0.07) return 'colour';
  return L < 0.55 ? 'dark' : 'light';
}

let probe = null;
function cssToHex(value) {
  value = (value || '').trim();
  if (!value) return null;
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return color.hex(value);
  if (!HAS_DOM) return null;
  probe = probe || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return rgbToHex([d[0] / 255, d[1] / 255, d[2] / 255]);
}

/** read the palette from CSS custom properties on (or inherited by) el */
export function readPalette(el) {
  if (!HAS_DOM) return normalizePalette();
  const cs = getComputedStyle(el || document.documentElement);
  const get = (...names) => {
    for (const n of names) {
      const v = cssToHex(cs.getPropertyValue(n));
      if (v) return v;
    }
    return undefined;
  };
  return normalizePalette({
    bg: get('--fx-bg', '--bg', '--paper'),
    surface: get('--fx-surface', '--surface'),
    ink: get('--fx-ink', '--ink', '--text'),
    muted: get('--fx-muted', '--muted'),
    accent: get('--fx-accent', '--accent'),
    accentInk: get('--fx-accent-ink', '--accent-ink'),
  });
}

/* ------------------------------------------------------------------ random */

export function hashSeed(s) {
  if (typeof s === 'number' && Number.isFinite(s)) return Math.abs(Math.floor(s)) % 10000;
  let h = 2166136261;
  for (const ch of String(s ?? '')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 10000;
}
/** seeded random 0..1 (mulberry32) */
export function rng(seed) {
  let a = (hashSeed(seed) * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ params */

/** defaults + given values, clamped to min/max and snapped to step */
export function resolveParams(schema, given) {
  const out = {};
  for (const [k, d] of Object.entries(schema || {})) {
    let v = given && given[k] != null && given[k] !== '' ? Number(given[k]) : d.default;
    if (!Number.isFinite(v)) v = d.default;
    if (d.min != null) v = Math.max(d.min, v);
    if (d.max != null) v = Math.min(d.max, v);
    if (d.step) v = Math.round((v - (d.min || 0)) / d.step) * d.step + (d.min || 0);
    out[k] = +v.toFixed(6);
  }
  return out;
}

/*
  Composition from the seed. Without it every panel of one effect puts its light, blob or focus in
  the same corner and a 2x2 of cards looks like one picture four times. When the page does not set
  them, the seed chooses where the calm area sits (and so where the colour gathers, on the other
  side) and the effect's own focal point. A page that puts text on the effect (the closing call to
  action, hero text over a frame) sets calmX/calmY to where the text is, and the seed leaves them.
*/
const CALM_SPOTS = [[0.18, 0.78], [0.82, 0.78], [0.18, 0.22], [0.82, 0.22], [0.5, 0.85], [0.5, 0.15], [0.12, 0.5], [0.88, 0.5], [0.5, 0.5]];
const FOCAL = {
  orbX: [0.3, 0.7], orbY: [0.35, 0.65], originX: [0.05, 0.95], x: [0.25, 0.75], splitX: [0.25, 0.75], splitY: [0.3, 0.7],
};
const FOCAL_BY_ID = {
  ridgeline: { focus: [0.4, 0.6] }, 'gradient-mesh': { angle: [-60, 60] }, 'silk-folds': { angle: [-60, 60] },
  'line-engraving': { angle: [0, 180] }, 'halftone-screen': { angle: [15, 75] }, 'painterly-landscape': { horizon: [0.4, 0.5], hillY: [0.04, 0.22] },
};
export function compose(effect, given, seed) {
  const schema = effect.params || {};
  const g = { ...(given || {}) };
  const has = k => g[k] != null && g[k] !== '';
  const r = rng(`compose:${effect.id}:${seed}`);
  if (schema.calmX && schema.calmY && !has('calmX') && !has('calmY')) {
    const [x, y] = CALM_SPOTS[Math.floor(r() * CALM_SPOTS.length)];
    g.calmX = Math.min(1, Math.max(0, x + (r() - 0.5) * 0.08));
    g.calmY = Math.min(1, Math.max(0, y + (r() - 0.5) * 0.08));
  }
  const focal = { ...FOCAL, ...(FOCAL_BY_ID[effect.id] || {}) };
  for (const [k, [lo, hi]] of Object.entries(focal)) {
    if (schema[k] && !has(k)) g[k] = lo + r() * (hi - lo);
  }
  return g;
}

/* ------------------------------------------------------------------ CSS helpers */

/** an SVG film-grain tile as a CSS url(), for pages and fallbacks */
export function grainCSS(opacity = 0.08, frequency = 0.85) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${opacity * 2.2} 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E').replace(/ /g, '%20')}")`;
}

/** a calm CSS stand-in drawn from the palette, used when WebGL is missing */
export function fallbackCSS(palette, { at = '78% 18%', tint = 0.32 } = {}) {
  const p = normalizePalette(palette);
  const a = color.mix(p.bg, p.accent, tint);
  const b = color.mix(p.bg, p.ink, color.isDark(p.bg) ? 0.1 : 0.06);
  return `${grainCSS(color.isDark(p.bg) ? 0.05 : 0.07)}, radial-gradient(70% 90% at ${at}, ${a}, transparent 72%), radial-gradient(80% 100% at 12% 96%, ${b}, transparent 70%), ${p.bg}`;
}

/* ------------------------------------------------------------------ lifecycle */

const lifecycles = new Set();
const reducedQuery = HAS_DOM && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

/**
  Runs draw(t, dt) on animation frames while el is on screen, the tab is visible, nothing paused it
  and motion is allowed. Under prefers-reduced-motion (or a frozen config.clock) it draws one still
  frame at `still` seconds. Use it for canvas-2D or DOM effects; fx.shader uses it internally.
*/
export function lifecycle(el, { draw, still = 3, fps = 60, rootMargin = '12% 0px', onShow, onHide, idle } = {}) {
  if (!HAS_DOM) throw new Error('fx.lifecycle needs a browser');
  let userPaused = false, inView = false, destroyed = false, raf = 0, last = 0, sinceDraw = 1e9, t = 0;
  const reduced = () => !!(reducedQuery && reducedQuery.matches);
  const now = () => (config.clock != null ? +config.clock : reduced() ? still : t);
  // idle(): true while there is nothing to animate (a shader showing its CSS fallback), so no frames run
  const running = () => !destroyed && !userPaused && inView && !document.hidden && config.clock == null && !reduced() && !(idle && idle());
  const minGap = 1 / Math.max(1, fps) - 0.004;

  function loop(ts) {
    raf = 0;
    if (!running()) return;
    const dt = last ? Math.min((ts - last) / 1000, 0.1) : 0;
    last = ts;
    t += dt;
    sinceDraw += dt;
    if (dt === 0 || fps >= 60 || sinceDraw >= minGap) {
      draw(t, sinceDraw > 1e8 ? 0 : sinceDraw);
      sinceDraw = 0;
    }
    raf = requestAnimationFrame(loop);
  }
  function sync() {
    if (destroyed) return;
    if (running()) {
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    } else {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (inView && !document.hidden) draw(now(), 0);
    }
  }
  const io = new IntersectionObserver(entries => {
    const e = entries[entries.length - 1];
    const was = inView;
    inView = e.isIntersecting;
    if (inView && !was && onShow) onShow();
    if (!inView && was && onHide) onHide();
    sync();
  }, { rootMargin });
  io.observe(el);
  const onVis = () => sync();
  document.addEventListener('visibilitychange', onVis);
  if (reducedQuery) reducedQuery.addEventListener?.('change', onVis);
  const api = {
    sync,
    pause() { userPaused = true; sync(); },
    resume() { userPaused = false; sync(); },
    redraw() { if (inView && !destroyed) draw(now(), 0); },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (reducedQuery) reducedQuery.removeEventListener?.('change', onVis);
      lifecycles.delete(api);
    },
    get time() { return now(); },
    get visible() { return inView; },
    get running() { return running(); },
  };
  lifecycles.add(api);
  return api;
}

/** freeze every effect at time t (seconds); null lets them run again */
export function setClock(t) {
  config.clock = t == null || t === '' ? null : +t;
  for (const l of lifecycles) l.sync();
}

/* ------------------------------------------------------------------ GLSL library */

/*
  Prepended to every effect fragment shader (after the uniform declarations). Works in GLSL ES 3.00
  (WebGL2) and 1.00 (WebGL1). Write the output to fxColor. Coordinates: gl_FragCoord is in canvas
  pixels with y up; u_res is the canvas size in those pixels.
*/
export const GLSL_LIB = /* glsl */ `
#if __VERSION__ >= 300
out vec4 fxColor;
uint fx_u32(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
// integer hash of a lattice point (p is floored), 0..1
float fx_hash(vec2 p) {
  uvec2 q = uvec2(ivec2(floor(p)) + ivec2(8192));
  return float(fx_u32(q.x + fx_u32(q.y + fx_u32(uint(u_seed) + 1u)))) * (1.0 / 4294967295.0);
}
#else
#define fxColor gl_FragColor
#define texture texture2D
// float-only scramble (no sine, so no streaks on GPUs with coarse sin); repeats every 1024 cells
float fx_hash(vec2 p) {
  p = mod(floor(p), 1024.0);
  vec3 q = fract(vec3(p.x, p.y, p.x + p.y) * vec3(0.1031, 0.11369, 0.13787) + fract(u_seed * 0.00731));
  q += dot(q, q.yzx + 31.32);
  return fract((q.x + q.y) * q.z);
}
#endif
const float FX_TAU = 6.28318530718;
vec2 fx_hash2(vec2 p) { return vec2(fx_hash(p), fx_hash(p + vec2(37.0, 91.0))); }
// value noise, 0..1
float fx_vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = fx_hash(i), b = fx_hash(i + vec2(1.0, 0.0)), c = fx_hash(i + vec2(0.0, 1.0)), d = fx_hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// gradient noise, about -0.7..0.7, smooth (quintic)
vec2 fx_grad(vec2 i) { float a = fx_hash(i) * FX_TAU; return vec2(cos(a), sin(a)); }
float fx_noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(fx_grad(i), f);
  float b = dot(fx_grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(fx_grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(fx_grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// three octaves of gradient noise, about -0.8..0.8
float fx_fbm(vec2 p) {
  float s = fx_noise(p);
  p = mat2(1.6, 1.2, -1.2, 1.6) * p + 11.3;
  s += 0.5 * fx_noise(p);
  p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.7;
  s += 0.25 * fx_noise(p);
  return s / 1.2;
}
// interleaved gradient noise of a pixel, 0..1 (cheap, blue-ish)
float fx_ign(vec2 px) { return fract(52.9829189 * fract(dot(px, vec2(0.06711056, 0.00583715)))); }
// film grain for this pixel, triangular -1..1; frame changes the pattern
float fx_grain(vec2 px, float frame) {
  vec2 o = vec2(frame * 41.0, frame * 73.0);
  return fx_hash(px + o) + fx_hash(px + o + vec2(1913.0, 2741.0)) - 1.0;
}
// ordered dither threshold of an 8x8 Bayer matrix, 0..1 (px in cells)
float fx_bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float fx_bayer4(vec2 a) { return fx_bayer2(0.5 * a) * 0.25 + fx_bayer2(a); }
float fx_bayer(vec2 a) { return fx_bayer4(0.5 * a) * 0.25 + fx_bayer2(a); }
// colour spaces: sRGB <-> linear <-> OKLab
vec3 fx_lin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 fx_srgb(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
vec3 fx_oklab(vec3 srgb) {
  vec3 c = fx_lin(srgb);
  vec3 lms = vec3(dot(c, vec3(0.4122214708, 0.5363325363, 0.0514459929)),
                  dot(c, vec3(0.2119034982, 0.6806995451, 0.1073969566)),
                  dot(c, vec3(0.0883024619, 0.2817188376, 0.6299787005)));
  lms = pow(max(lms, vec3(0.0)), vec3(1.0 / 3.0));
  return vec3(dot(lms, vec3(0.2104542553, 0.7936177850, -0.0040720468)),
              dot(lms, vec3(1.9779984951, -2.4285922050, 0.4505937099)),
              dot(lms, vec3(0.0259040371, 0.7827717662, -0.8086757660)));
}
vec3 fx_rgb(vec3 lab) {
  vec3 lms = vec3(lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z,
                  lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z,
                  lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z);
  lms = lms * lms * lms;
  vec3 c = vec3(dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
                dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
                dot(lms, vec3(-0.0041960863, -0.7034186147, 1.7076147010)));
  return fx_srgb(c);
}
// perceptual mix of two sRGB colours
vec3 fx_mix(vec3 a, vec3 b, float t) { return fx_rgb(mix(fx_oklab(a), fx_oklab(b), t)); }
// add triangular dither of one 8-bit step: removes banding from smooth gradients
vec3 fx_dither(vec3 c) {
  float n = fx_hash(gl_FragCoord.xy + vec2(3.0, 7.0)) + fx_ign(gl_FragCoord.xy) - 1.0;
  return c + n / 255.0;
}
// 0..1 coordinates, y down (CSS-like), and centred coordinates scaled by height
vec2 fx_uv() { return vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y); }
vec2 fx_p() { return (gl_FragCoord.xy - 0.5 * u_res) / u_res.y; }
// soft calm area: 1 at 'at' (uv, y down), 0 beyond radius r (in height units)
float fx_calm(vec2 uv, vec2 at, float r) {
  vec2 d = (uv - at) * vec2(u_res.x / u_res.y, 1.0);
  return 1.0 - smoothstep(r * 0.35, r, length(d));
}
`;

function glslType(v) {
  if (typeof v === 'number' || typeof v === 'boolean') return 'float';
  const n = v && v.length;
  if (n >= 1 && n <= 4) return ['float', 'vec2', 'vec3', 'vec4'][n - 1];
  throw new Error('fx: uniform values must be numbers or arrays of 2 to 4 numbers');
}

const VERT2 = '#version 300 es\nin vec2 a_pos;\nvoid main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';
const VERT1 = 'attribute vec2 a_pos;\nvoid main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';
const BASE_UNIFORMS = ['u_time', 'u_res', 'u_seed', 'u_dpr', 'u_mouse', 'u_c0', 'u_c1', 'u_c2', 'u_c3', 'u_c4', 'u_c5'];
const PALETTE_KEYS = ['bg', 'surface', 'ink', 'muted', 'accent', 'accentInk'];

function head(gl2, paramKeys, custom) {
  let s = gl2 ? '#version 300 es\n' : '';
  s += '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  s += 'uniform float u_time;\nuniform vec2 u_res;\nuniform float u_seed;\nuniform float u_dpr;\nuniform vec3 u_mouse;\n';
  s += 'uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5;\n';
  for (const k of paramKeys) s += `uniform float u_${k};\n`;
  for (const [k, v] of Object.entries(custom)) s += `uniform ${glslType(v)} ${k};\n`;
  return s;
}

function compile(gl, type, src, label) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`fx: ${label} shader did not compile\n${log}`);
  }
  return sh;
}

// true when this browser can make a WebGL context at all (checked once, the probe context is freed)
let webglProbe = null;
function HAS_WEBGL() {
  if (webglProbe == null) {
    webglProbe = false;
    try {
      const g = window.WebGLRenderingContext && (document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'));
      if (g) { webglProbe = true; g.getExtension('WEBGL_lose_context')?.loseContext(); }
    } catch (_) { /* no WebGL */ }
  }
  return webglProbe;
}

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
const liveGL = new LiveSet();
// the contexts effects may hold now: config.maxLive, less what the page's other users (a scene, an object, a moment) hold
const glCap = () => Math.min(config.maxLive, tpMax() - Math.max(0, tpHeld() - liveGL.size));
// room: contexts about to be made. Freeing idle ones before a new context is made keeps the page under
// the browser's own limit (about 16), which otherwise drops the oldest context with a console warning.
function enforceBudget(self, room = 0) {
  if (liveGL.size + room <= glCap()) return;
  const idle = [...liveGL].filter(i => i !== self && !i.visible).sort((a, b) => a.seen - b.seen);
  for (const i of idle) {
    if (liveGL.size + room <= glCap()) break;
    i.release();
  }
}

/**
  For an effect that makes its own WebGL context (not through fx.shader): call this just before
  creating it, so the context counts in the page's budget. holder = { seen, visible, release() }:
  keep `seen` at performance.now() while drawing; release() frees the context when the budget needs
  room and the holder is off screen. Returns done(), to call once the context is gone.
*/
export function glBudget(holder) {
  enforceBudget(holder, 1);
  liveGL.add(holder);
  return () => liveGL.delete(holder);
}

// returns true when it set the element's background colour itself
function prepareHost(el, palette) {
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  if (cs.isolation !== 'isolate') el.style.isolation = 'isolate';
  const bg = cs.backgroundColor;
  if (el.dataset.fxOwnBg || !bg || bg === 'transparent' || /rgba\(.*,\s*0\)$/.test(bg)) {
    el.style.backgroundColor = palette.bg;
    el.dataset.fxOwnBg = '1';
    return true;
  }
  return false;
}

/**
  Mount a full-screen fragment shader on el.
  spec = {
    frag,              GLSL body (no version, precision or uniform lines; write fxColor)
    schema, params,    the effect's params schema and the given values (u_<name> floats)
    palette, seed,
    uniforms(ctx),     optional: extra uniforms { u_name: number | [2..4 numbers] }, recomputed on
                       set(), resize and palette change; ctx = { params, palette, seed, rng, dpr,
                       width, height, kind, color }
    fallback(ctx),     optional: CSS background used when WebGL is missing
    still,             seconds used for the reduced-motion still frame (default 3)
    fps,               frame cap (default 60)
    maxDpr,            DPR cap (default config.maxDpr)
    crisp,             true: never scale the canvas (pixel-exact effects), CSS pixelated upscaling
    pointer,           true: track the pointer into u_mouse (xy canvas px, y up; z 0..1 hover)
    alpha,             true: transparent canvas (premultiplied output)
  }
  Returns { destroy, pause, resume, set(params), setPalette(p), redraw, canvas, info }.
*/
export function shader(el, spec) {
  if (!HAS_DOM) throw new Error('fx.shader needs a browser');
  const schema = spec.schema || {};
  const paramKeys = Object.keys(schema);
  let params = resolveParams(schema, spec.params);
  let palette = normalizePalette(spec.palette);
  const seed = hashSeed(spec.seed ?? 1);
  const crisp = !!spec.crisp;
  const maxDpr = spec.maxDpr ?? config.maxDpr;
  // released: no WebGL context right now (before the element is first seen, or freed by the budget)
  let canvas = null, gl = null, gl2 = false, prog = null, buf = null, locs = {}, lost = false, released = true;
  let width = 0, height = 0, dpr = 1, scale = 1, dirty = true, shown = false, fallbackOn = false;
  let custom = {};
  const mouse = [0, 0, 0], mouseTarget = [0, 0, 0];
  const perf = { n: 0, sum: 0, warm: 0 };

  const ownBg = prepareHost(el, palette);
  const ctx = () => ({ params, palette, seed, rng: rng(seed), dpr: dpr * (crisp ? 1 : scale), width, height, kind: paletteKind(palette), color });
  const computeCustom = () => { custom = spec.uniforms ? spec.uniforms(ctx()) || {} : {}; dirty = true; };
  computeCustom();
  const customKeys = Object.keys(custom);

  function useFallback(reason) {
    fallbackOn = true;
    const css = spec.fallback ? spec.fallback(ctx()) : fallbackCSS(palette);
    el.style.background = css;
    el.dataset.fxFallback = reason;
    // the fallback is still CSS: stop the frame loop (init, set and fit run only after lc exists)
    lc.sync();
  }

  function teardown() {
    liveGL.delete(inst);
    if (gl && !gl.isContextLost()) {
      try {
        if (prog) gl.deleteProgram(prog);
        if (buf) gl.deleteBuffer(buf);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_) { /* ignore */ }
    }
    if (canvas) canvas.remove();
    canvas = gl = prog = buf = null;
    locs = {};
    shown = false;
  }

  function init() {
    if (fallbackOn) return;
    if (config.forceFallback) return useFallback('forced');
    enforceBudget(inst, 1);
    if (liveGL.size + 1 > glCap()) return useFallback('gl-budget');   // the page already holds its WebGL contexts: the CSS fallback
    canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1',
      pointerEvents: 'none', opacity: '0', transition: 'opacity .5s ease', borderRadius: 'inherit',
      imageRendering: crisp ? 'pixelated' : 'auto',
    });
    const attrs = { alpha: !!spec.alpha, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'default' };
    gl = config.forceWebGL1 ? null : canvas.getContext('webgl2', attrs);
    gl2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    if (!gl) { canvas = null; return useFallback('no-webgl'); }
    try {
      const fs = head(gl2, paramKeys, custom) + GLSL_LIB + '\n#line 1\n' + spec.frag;
      const v = compile(gl, gl.VERTEX_SHADER, gl2 ? VERT2 : VERT1, 'vertex');
      const f = compile(gl, gl.FRAGMENT_SHADER, fs, 'fragment');
      prog = gl.createProgram();
      gl.attachShader(prog, v);
      gl.attachShader(prog, f);
      gl.bindAttribLocation(prog, 0, 'a_pos');
      gl.linkProgram(prog);
      gl.deleteShader(v);
      gl.deleteShader(f);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('fx: link failed\n' + gl.getProgramInfoLog(prog));
    } catch (err) {
      console.error(err.message);
      teardown();
      return useFallback('shader-error');
    }
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const n of [...BASE_UNIFORMS, ...paramKeys.map(k => 'u_' + k), ...customKeys]) locs[n] = gl.getUniformLocation(prog, n);
    // a lost context (driver reset, or the browser's context limit) gets a fresh canvas when seen again
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
    lost = false;
    released = false;
    dirty = true;
    liveGL.add(inst);
    enforceBudget(inst);
  }

  function setU(name, v) {
    const l = locs[name];
    if (!l) return;
    if (typeof v === 'number' || typeof v === 'boolean') gl.uniform1f(l, +v);
    else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
    else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
    else if (v.length === 4) gl.uniform4f(l, v[0], v[1], v[2], v[3]);
  }

  function draw(t, dt) {
    if (fallbackOn) return;
    if (released) { if (!lc.visible) return; init(); fit(false); }
    if (!gl || lost || !prog) return;
    inst.seen = performance.now();
    if (spec.pointer && dt > 0) {
      const k = 1 - Math.exp(-dt * 7);
      for (let i = 0; i < 3; i++) mouse[i] += (mouseTarget[i] - mouse[i]) * k;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    if (dirty) {
      PALETTE_KEYS.forEach((k, i) => setU('u_c' + i, color.vec3(palette[k])));
      for (const k of paramKeys) setU('u_' + k, params[k]);
      for (const k of customKeys) if (custom[k] != null) setU(k, custom[k]);
      setU('u_seed', seed);
      dirty = false;
    }
    setU('u_time', t);
    setU('u_res', [canvas.width, canvas.height]);
    setU('u_dpr', dpr * (crisp ? 1 : scale));
    setU('u_mouse', [mouse[0] * canvas.width, (1 - mouse[1]) * canvas.height, mouse[2]]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!shown) { shown = true; canvas.style.opacity = '1'; }
    if (config.adaptive && !crisp && dt > 0 && lc.running) adapt(dt);
  }

  function adapt(dt) {
    if (perf.warm < 60) { perf.warm++; return; }
    perf.n++;
    perf.sum += dt;
    if (perf.n < 90) return;
    const avg = perf.sum / perf.n;
    perf.n = perf.sum = 0;
    // dt is the gap between draws, so a capped effect (fps 30: about 33 ms on an idle GPU) is slow only
    // when that gap clearly exceeds its own frame interval
    const slow = Math.max(1 / 42, 1.4 / Math.min(60, Math.max(1, spec.fps ?? 60)));
    if (avg > slow && scale > 0.55) { scale = Math.max(0.5, scale * 0.82); fit(false); }
  }

  function fit(redraw) {
    if (fallbackOn) {
      // a fallback drawn in px (an orb, a ring) is rebuilt when the element changes size
      const fw = el.clientWidth, fh = el.clientHeight;
      if (fw !== width || fh !== height) { width = fw; height = fh; useFallback(el.dataset.fxFallback || 'fallback'); }
      return;
    }
    if (!canvas) return;
    const w = el.clientWidth, h = el.clientHeight;
    width = w; height = h;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const s = crisp ? 1 : scale;
    const W = Math.max(1, Math.round(w * dpr * s)), H = Math.max(1, Math.round(h * dpr * s));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
      if (spec.uniforms) computeCustom();
      dirty = true;
    }
    if (redraw !== false) lc.redraw();
  }

  const onMove = e => {
    const r = el.getBoundingClientRect();
    mouseTarget[0] = clamp((e.clientX - r.left) / r.width, 0, 1);
    mouseTarget[1] = clamp((e.clientY - r.top) / r.height, 0, 1);
    mouseTarget[2] = 1;
    if (mouse[2] === 0) { mouse[0] = mouseTarget[0]; mouse[1] = mouseTarget[1]; }
  };
  const onLeave = () => { mouseTarget[2] = 0; };

  const inst = {
    seen: 0,
    get visible() { return lc.visible; },
    release() { if (canvas && !released) { teardown(); released = true; } },
  };

  const lc = lifecycle(el, {
    draw,
    still: spec.still ?? 3,
    fps: spec.fps ?? 60,
    idle: () => fallbackOn,
    onShow() { inst.seen = performance.now(); if (released && !fallbackOn) { init(); fit(false); } },
  });

  // the context is created when the element first comes near the viewport (lazy), so pages with many
  // effects never hold more contexts than they show; without WebGL the fallback applies at once
  if (config.forceFallback || !HAS_WEBGL()) init();
  const ro = new ResizeObserver(() => fit(true));
  ro.observe(el);
  fit(false);
  if (spec.pointer) {
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });
  }

  return {
    pause: () => lc.pause(),
    resume: () => lc.resume(),
    redraw: () => lc.redraw(),
    set(next) {
      params = resolveParams(schema, { ...params, ...next });
      computeCustom();
      if (fallbackOn) useFallback(el.dataset.fxFallback || 'fallback');
      lc.redraw();
      return params;
    },
    setPalette(p) {
      palette = normalizePalette(p);
      if (ownBg) el.style.backgroundColor = palette.bg;
      computeCustom();
      if (fallbackOn) useFallback(el.dataset.fxFallback || 'fallback');
      lc.redraw();
    },
    destroy() {
      lc.destroy();
      ro.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      teardown();
      if (fallbackOn) { el.style.background = ''; delete el.dataset.fxFallback; }
      if (ownBg) el.style.backgroundColor = palette.bg;
    },
    get canvas() { return canvas; },
    get info() { return { webgl: gl ? (gl2 ? 2 : 1) : 0, fallback: fallbackOn ? el.dataset.fxFallback : null, scale, dpr, size: canvas ? [canvas.width, canvas.height] : null, running: lc.running }; },
  };
}

/* ------------------------------------------------------------------ registry and mounting */

const registry = new Map();
const loading = new Map();

export function register(effect) {
  if (!effect || !effect.id || typeof effect.mount !== 'function') throw new Error('fx: an effect needs id and mount()');
  registry.set(effect.id, effect);
  return effect;
}

/** import <base>/<id>/effect.js once */
export function load(id) {
  if (registry.has(id)) return Promise.resolve(registry.get(id));
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) return Promise.reject(new Error(`fx: bad effect id "${id}"`));
  if (!loading.has(id)) {
    const base = config.base || new URL('./', import.meta.url).href;
    loading.set(id, import(new URL(`${id}/effect.js`, base).href).then(m => register(m.default)));
  }
  return loading.get(id);
}

/**
  Mount one effect on el. effect is an id or an effect object.
  Returns a controller: { id, el, seed, params, palette, destroy, pause, resume, set(params), setPalette(p), info }
*/
export async function mount(el, effect, { palette, params, seed } = {}) {
  const e = typeof effect === 'string' ? await load(effect) : effect;
  if (el.__fx) el.__fx.destroy();
  const pal = normalizePalette(palette || readPalette(el));
  const s = seed == null || seed === '' ? Math.floor(Math.random() * 10000) : seed;
  const p = resolveParams(e.params, compose(e, params, s));
  const c = e.mount(el, { palette: pal, params: p, seed: s });
  const api = {
    id: e.id, effect: e, el, seed: s, params: p, palette: pal,
    pause: () => c.pause(),
    resume: () => c.resume(),
    destroy() { c.destroy(); if (el.__fx === api) delete el.__fx; el.removeAttribute('data-fx-mounted'); },
    set(next) {
      if (c.set) { api.params = c.set(resolveParams(e.params, { ...api.params, ...next })) || resolveParams(e.params, { ...api.params, ...next }); return api; }
      return mount(el, e, { palette: api.palette, params: { ...api.params, ...next }, seed: s });
    },
    setPalette(next) {
      const np = normalizePalette({ ...api.palette, ...next });
      if (c.setPalette) { c.setPalette(np); api.palette = np; return api; }
      return mount(el, e, { palette: np, params: api.params, seed: s });
    },
    get info() { return c.info || null; },
  };
  el.__fx = api;
  el.setAttribute('data-fx-mounted', e.id);
  return api;
}

function parseJSON(s) {
  if (!s) return null;
  try { return JSON.parse(s); } catch (_) { console.warn('fx: bad JSON in data attribute', s); return null; }
}

/**
  Mount every [data-fx] element under root. palette: a palette object for all of them; when left
  out, each element reads its own CSS custom properties (--bg/--paper, --surface, --ink, --muted,
  --accent, --accent-ink). data-fx-palette='{"accent":"#..."}' overrides single colours.
*/
export async function mountAll(root, palette) {
  if (!HAS_DOM) return [];
  root = root || document;
  const els = [...root.querySelectorAll('[data-fx]')];
  if (root.matches && root.matches('[data-fx]')) els.unshift(root);
  return Promise.all(els.filter(el => !el.__fx).map(el => {
    let pal = palette ? normalizePalette(palette) : readPalette(el);
    const over = parseJSON(el.dataset.fxPalette);
    if (over) pal = normalizePalette({ ...pal, ...over });
    return mount(el, el.dataset.fx, { palette: pal, params: parseJSON(el.dataset.fxParams), seed: el.dataset.fxSeed })
      .catch(err => { console.warn(`fx: ${el.dataset.fx}:`, err); return null; });
  }));
}

export function unmountAll(root) {
  if (!HAS_DOM) return;
  for (const el of (root || document).querySelectorAll('[data-fx-mounted]')) el.__fx?.destroy();
}

/** the controller mounted on el, if any */
export const get = el => el.__fx || null;

// <script type="module" src=".../fx.js" data-fx-auto></script> mounts every [data-fx] on load
if (HAS_DOM && document.querySelector('script[data-fx-auto]')) {
  const go = () => mountAll(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
}

const fx = {
  VERSION, config, color, normalizePalette, paletteKind, readPalette, hashSeed, rng, resolveParams, compose,
  grainCSS, fallbackCSS, lifecycle, setClock, GLSL_LIB, shader, glBudget, register, load, mount, mountAll, unmountAll, get,
};
export default fx;
