// duotone-grade: a photograph graded into two or three page tones (shadow, middle, highlight) mixed in
// OKLab, darker (or paler) where text sits, with a faint vignette and still film grain. It is meant for
// the section's own photo: an <img data-fx-photo>, else a direct child <img> or <picture> (never an icon
// nested in a card on top), else the URL in data-fx-src. The <img> stays in the page for its alt text
// and layout, hidden while the graded frame shows. Without a photo it draws a stand-in in the shader (no
// CPU work, no texture): sun through a pane, blinds, an arch or a soft beam, chosen by the seed and
// kept clear of the text. Still by default; drift > 0 adds a slow push-in with the grain on the picture.
import { shader, color, grainCSS, paletteKind, rng, config } from '../fx.js';

const params = {
  tones:    { default: 3,    min: 2,  max: 3, step: 1 },    // 2 duotone, 3 adds a middle tone
  contrast: { default: 0.45, min: 0,  max: 1, step: 0.01 }, // soft S curve on the photo
  exposure: { default: 0,    min: -1, max: 1, step: 0.01 }, // darker .. lighter overall
  grain:    { default: 0.4,  min: 0,  max: 1, step: 0.01 }, // still film grain, 0 off
  drift:    { default: 0,    min: 0,  max: 1, step: 0.01 }, // slow push-in, 0 a still photo (no loop)
  ink:      { default: 0,    min: 0,  max: 1, step: 1 },    // 1 tones with the ink colour instead of the accent
  scrim:    { default: 0.5,  min: 0,  max: 1, step: 0.5 },  // text area: 0 darker (light text), 1 paler (dark text), 0.5 for the page's ink
  calm:     { default: 0.6,  min: 0,  max: 1, step: 0.01 }, // strength and size of that area
  calmX:    { default: 0.2,  min: 0,  max: 1, step: 0.01 }, // text area centre, 0 left .. 1 right
  calmY:    { default: 0.75, min: 0,  max: 1, step: 0.01 }, // text area centre, 0 top .. 1 bottom
};

const frag = /* glsl */ `
#ifdef FX_PHOTO
uniform sampler2D u_img;
#else
float edge2(vec2 w, vec2 pw) {
  return smoothstep(-pw.x, pw.x, w.x) * smoothstep(-pw.x, pw.x, 1.0 - w.x) * smoothstep(-pw.y, pw.y, w.y) * smoothstep(-pw.y, pw.y, 1.0 - w.y);
}
// 1 on a bar of half width h around c, soft edge e
float bar(float x, float c, float h, float e) { return 1.0 - smoothstep(h - e, h + e, abs(x - c)); }

// The stand-in photograph: sun through an opening lies on a plaster wall. s: x 0..aspect, y 0..1 down.
// Returns the tonal position, 0 deepest .. 1 brightest.
float lightStudy(vec2 s) {
  vec4 P = u_patch;                                        // x0, y0, width, height before the slant
  float sl = u_shape.y;
  vec2 m = vec2(s.x - P.x, s.y - P.y - sl * (s.x - P.x));  // patch space, height units
  vec2 w = m / P.zw;                                       // 0..1 inside the patch
  vec2 c = vec2(P.x + 0.5 * P.z, P.y + 0.5 * P.w + 0.5 * sl * P.z);

  // the wall: a broad spill of bounced light around the patch, a little darker low down, plaster
  vec2 dc = (s - c) / (P.zw * vec2(1.5, 1.3) + 0.25);
  float wall = 0.34 + 0.15 * exp(-dot(dc, dc)) - 0.05 * s.y;
  wall += 0.03 * fx_fbm(s * 3.0 + 7.1) + 0.012 * (fx_vnoise(s * 70.0) - 0.5);

  // the edges soften as the light travels: crisp on one side of the patch, soft on the other
  float far = clamp(u_shape.w > 0.0 ? w.x : 1.0 - w.x, 0.0, 1.0);
  float pen = 0.003 + 0.014 * far;
  vec2 pw = pen / P.zw;
  float v = u_shape.x, sun;
  if (v < 0.5) {            // a tall pane with one transom near the top
    sun = edge2(w, pw) * (1.0 - bar(w.y, 0.28, 0.011 / P.w, pw.y));
  } else if (v < 1.5) {     // blinds: soft slats
    float n = u_shape.z;
    float g = abs(fract(w.y * n + 0.5) - 0.5);             // distance to the middle of the nearest lit slat
    sun = edge2(w, pw) * (1.0 - smoothstep(0.3 - pw.y * n, 0.3 + pw.y * n, g));
  } else if (v < 2.5) {     // an arched opening with a mullion
    vec2 q = vec2((w.x - 0.5) * P.z, m.y);
    float r = 0.5 * P.z;
    float arch = q.y < r ? 1.0 - smoothstep(-pen, pen, length(q - vec2(0.0, r)) - r) : 1.0;
    sun = smoothstep(-pw.x, pw.x, w.x) * smoothstep(-pw.x, pw.x, 1.0 - w.x) * smoothstep(-pw.y, pw.y, 1.0 - w.y) * arch;
    sun *= 1.0 - bar(w.x, 0.5, 0.011 / P.z, pw.x);
  } else {                  // a soft beam: no frame, a wide penumbra, a little fine dapple
    sun = edge2(w, (0.02 + 0.05 * far) / P.zw);
  }
  // leaves of a tree outside, a little denser toward the soft side (smaller and sparser in the beam)
  vec2 lm = v > 2.5 ? m * 2.6 : m;
  float lf = 0.5 + 0.55 * fx_fbm(lm * 3.6 + 2.3) + 0.05 * (fx_vnoise(lm * 38.0) - 0.5) + 0.1 * far - 0.08 * w.y;
  float le = 0.035 + 0.09 * far;                           // leaf edges blur with the penumbra
  float occ = smoothstep(0.64 - le, 0.64 + le, lf);
  sun *= (1.0 - u_leaf * occ) * (1.0 - 0.1 * clamp(w.y, 0.0, 1.0));
  return clamp(wall + 0.56 * sun, 0.0, 1.0);
}
#endif

void main() {
  vec2 uv = fx_uv();
  float asp = u_res.x / u_res.y;
  // an optional slow push-in toward the focus (drift 0: a still photograph)
  float k = 0.5 - 0.5 * cos(FX_TAU * u_time / 48.0 + u_phase);
  float z = 1.0 + u_drift * (0.01 + 0.035 * k);
  float t;
  vec2 gp; // grain position, fixed to the picture so it travels with it
#ifdef FX_PHOTO
  // object-fit: cover, at the image's object-position
  float ir = u_imgRes.x / max(1.0, u_imgRes.y);
  vec2 vis = asp > ir ? vec2(1.0, ir / asp) : vec2(asp / ir, 1.0);
  vec2 iu = (1.0 - vis) * u_pos + uv * vis;
  iu = u_focus + (iu - u_focus) / z;
  // the photo's lightness, stretched between its own black and white points
  t = clamp((fx_oklab(texture(u_img, iu).rgb).x - u_levels.x) / max(0.05, u_levels.y - u_levels.x), 0.0, 1.0);
  gp = iu * u_res / vis;
#else
  vec2 s = vec2(uv.x * asp, uv.y);
  vec2 f = u_focus * vec2(asp, 1.0);
  s = f + (s - f) / z;
  t = lightStudy(s);
  gp = s * u_res.y;
#endif
  t = pow(max(t, 1e-4), u_gamma);
  t = mix(t, t * t * (3.0 - 2.0 * t), u_contrast);

  // the grade: shadow to highlight, through the middle tone as a smooth curve, in OKLab
  vec3 col = u_tones > 2.5 ? mix(mix(u_kS, u_kM, t), mix(u_kM, u_kH, t), t) : mix(u_kS, u_kH, t);
  // with a yellow key, a yellow-hued pixel gives up its chroma below lightness 0.7 (a dark yellow is khaki)
  float cy = length(col.yz);
  if (u_mud > 0.5 && cy > 1e-4) {
    float hy = degrees(atan(col.z, col.y));
    hy = hy < 0.0 ? hy + 360.0 : hy;
    col.yz *= 1.0 - smoothstep(45.0, 60.0, hy) * (1.0 - smoothstep(120.0, 135.0, hy)) * (1.0 - smoothstep(0.4, 0.7, col.x));
  }

  // burn (or lift) where text sits: a gradient off the frame edge nearest the text (a centred text dims
  // the whole frame instead) and a flat core under the text itself, so a line of type reads on it
  vec2 cp = vec2(u_calmX, u_calmY);
  vec2 off = (vec2(0.5) - cp) * vec2(asp, 1.0);
  float lo = length(off);
  float along = dot((uv - cp) * vec2(asp, 1.0), off / max(lo, 1e-3));
  float scrim = 1.0 - smoothstep(-0.15, 0.2 + 0.45 * u_calm, along);
  scrim = mix(0.55, scrim, smoothstep(0.08, 0.3, lo));
  float core = 1.0 - smoothstep(0.0, 0.5 + 0.3 * u_calm, length((uv - cp) * vec2(asp * 0.6, 1.0)));
  float m = max(scrim, core);
  col = mix(col, u_kC, m * u_calmMax);

  // a faint vignette
  vec2 q = (uv - 0.5) * vec2(min(asp, 1.6), 1.0);
  col = mix(col, u_kV, smoothstep(0.4, 1.05, length(q)) * u_vig);

  // still grain on lightness, softer near the ends where clipped grain reads as dirt
  float amp = u_grainAmp * u_grain * (1.0 - 0.6 * smoothstep(0.86, 1.0, col.x)) * (1.0 - 0.5 * smoothstep(0.2, 0.0, col.x));
  col.x += fx_grain(floor(gp), 0.0) * amp;

  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

/* ------------------------------------------------------------------ tones */

const clamp01 = v => Math.min(1, Math.max(0, v));
const wrap = h => ((h % 360) + 360) % 360;
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
// the largest chroma sRGB holds at this lightness and hue
const maxC = (L, h) => color.lch(color.fromLch([clamp01(L), 0.37, wrap(h)]))[1];
/*
  An OKLCH tone kept well inside the gamut: at most k of the largest chroma, and never a channel under
  about 8/255 (a deep blue at full chroma has red and green at 0: a dead flat plate where grain cannot show).
*/
function tone(L, C, h, k = 0.7) {
  L = clamp01(L); h = wrap(h);
  const ok = c => Math.min(...color.rgb(color.fromLch([L, c, h]))) >= 0.03;
  let c = Math.max(0, Math.min(C, k * maxC(L, h)));
  if (!ok(c) && ok(0)) {
    let lo = 0, hi = c;
    for (let i = 0; i < 12; i++) { const mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid; }
    c = lo;
  }
  return color.fromLch([L, c, h]);
}
const lightOf = c => color.lab(c)[0];
// a key whose clean form is light (yellow, gold, brass, lime, light orange): darkened, it turns olive or khaki
const yellowHue = h => h > 55 && h < 125;
const lightKey = (L, C, h) => C > 0.06 && L > 0.65 && yellowHue(h);
// the shader's khaki guard, mirrored: a yellow-hued pixel gives up its chroma below lightness 0.7
function unmud([L, a, b]) {
  const h = wrap((Math.atan2(b, a) * 180) / Math.PI);
  const ss = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const k = 1 - ss(45, 60, h) * (1 - ss(120, 135, h)) * (1 - ss(0.4, 0.7, L));
  return [L, a * k, b * k];
}

// a pixel colour that reads violet or lavender (dark ones need more chroma before they do)
function isViolet([L, a, b]) {
  const C = Math.hypot(a, b), h = wrap((Math.atan2(b, a) * 180) / Math.PI);
  return C > (L > 0.3 ? 0.025 : 0.04) && h > 272 && h < 348;
}
// a dark yellow with chroma: olive drab, khaki, mud
function isMuddy([L, a, b]) {
  const C = Math.hypot(a, b), h = wrap((Math.atan2(b, a) * 180) / Math.PI);
  return h > 70 && h < 115 && L < 0.62 && C > 0.035 + 0.2 * Math.max(0, L - 0.45);
}
// a single tone tinted violet moves to the nearer safe side (blue or rose)
function guard(hex) {
  const [L, C, h] = color.lch(hex);
  return C > 0.02 && h > 272 && h < 348 ? tone(L, C, h < 310 ? 266 : 354) : hex;
}

// the text-area tone (and whether it lifts) and the vignette tone
function finish(S, M, H, P, prm, kind) {
  const [Ls, Cs, hs] = color.lch(S), [Lh, Ch, hh] = color.lch(H);
  const lift = prm.scrim > 0.75 || (prm.scrim > 0.25 && lightOf(P.ink) < 0.6);
  const C = lift ? tone(Math.min(0.985, Lh + 0.02), Ch, hh) : tone(Math.max(0.17, Ls - 0.04), Cs, hs);
  const V = tone(Math.max(0.17, Ls - 0.02), Cs, hs);
  return { S, M, H, C, V, lift };
}

// every pixel colour the grade can make: the curve, and its mix toward the text-area tone
function reach(T, three, mud) {
  const s = color.lab(T.S), m = color.lab(T.M), h = color.lab(T.H), c = color.lab(T.C);
  const out = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    let p = s.map((v, j) => (three ? (1 - t) * (1 - t) * v + 2 * t * (1 - t) * m[j] + t * t * h[j] : v + (h[j] - v) * t));
    if (mud) p = unmud(p);
    out.push({ t, p });
    for (const k of [0.35, 0.7]) out.push({ t, p: p.map((v, j) => v + (c[j] - v) * k) });
  }
  return out;
}

/*
  Every tone is a step of a palette colour; no hue is invented. Then the whole curve (not only its end
  tones) is checked: wherever it would pass through violet or a dark khaki, the tone nearest that part
  of the curve gives up chroma, or the middle tone turns to the nearer safe hue.
*/
const toneCache = new Map();
export function tones(P, prm, kind = paletteKind(P)) {
  const key = [P.bg, P.ink, P.accent, kind, prm.ink, prm.scrim, prm.tones, prm.exposure].join();
  if (!toneCache.has(key)) {
    if (toneCache.size > 48) toneCache.clear();
    toneCache.set(key, makeTones(P, prm, kind));
  }
  return toneCache.get(key);
}
function makeTones(P, prm, kind) {
  const { bg, ink, accent } = P;
  const [Lb, Cb, hb] = color.lch(bg);
  const [, Ci, hi] = color.lch(ink);
  const key = prm.ink >= 0.5 ? ink : accent;
  const [Lk, Ck, hk] = color.lch(key);
  let S, M, H, fixedM = false, mud = false, grain, gamma, vig;
  if (kind === 'colour') {
    // the field colour is the photo's middle tone, with its own deep and pale steps at the ends
    M = bg; fixedM = true;
    H = tone(Math.min(0.97, Math.max(0.9, Lb + 0.34)), Math.min(Cb * 0.2, 0.045), hb);
    if (lightKey(Lb, Cb, hb)) {
      // a yellow field: shadows from the ink, never a darkened yellow, and no khaki on the way up
      S = tone(0.3, Math.min(0.03, Math.max(Ci, 0.015)), Ci > 0.02 ? hi : hb);
      mud = true;
    } else {
      S = tone(Math.min(0.38, Math.max(0.2, Lb - 0.28)), Cb * 0.75, hb);
    }
    grain = 0.05; gamma = 1; vig = 0.14;
  } else {
    // the family hue: the key's; on a light page with a hue of its own that fights the key, the page's
    // (never a sand or cream page: darkened, that turns khaki); on a dark page, a split tone instead
    let famH = hk, famC = Math.min(Ck, 0.12), split = false;
    const grey = Ck < 0.03;
    if (grey) { famH = Cb > 0.012 ? hb : hk; famC = Math.max(Cb, 0.012); }
    else if (Cb > 0.02 && hueDist(hb, hk) > 60) {
      if (kind === 'dark') split = true;
      else if (!yellowHue(hb)) { famH = hb; famC = Math.min(0.09, Math.max(0.05, Cb * 2)); }
    }
    const yellow = !grey && famH === hk && lightKey(Lk, Ck, hk);
    mud = yellow;
    if (kind === 'dark') {
      // shadows just above the page, highlights a pale step of the ink toward the key
      S = tone(Math.max(Lb + 0.04, 0.16), Math.min(Math.max(Cb, famC * 0.22), 0.04), Cb > 0.012 ? hb : famH);
      const hiT = famH === hk ? color.mix(ink, key, 0.32) : color.mix(ink, tone(0.8, famC, famH), 0.25);
      const [Lt, Ct, ht] = color.lch(hiT);
      H = tone(Math.min(Lt, 0.86), Ct, ht);
      grain = 0.04; gamma = 1.1; vig = 0.2;
    } else {
      // shadows from the ink leaning to the family (the ink alone for a yellow key), lifted so the
      // frame stays airy on a light page; highlights a pale step above the page
      const lo = yellow ? ink : color.mix(ink, famH === hk ? key : tone(0.5, famC, famH), 0.4);
      const [, Cl, hl] = color.lch(lo);
      S = tone(0.31, Math.min(Cl, 0.08), hl);
      H = tone(Math.min(0.985, Math.max(0.9, Lb + 0.06)), Cb * 0.9, hb);
      if (Cb < 0.01) H = color.mix(H, key, 0.05);
      grain = 0.05; gamma = 0.85; vig = 0.08;
    }
    const Ls = lightOf(S), Lh = lightOf(H);
    if (yellow) {
      // the key stays light and tints the highlights; the middle is a warm grey from the ink
      H = color.mix(H, key, kind === 'dark' ? 0.15 : 0.22);
      M = tone(Ls + (Lh - Ls) * 0.5, 0.025, Ci > 0.02 ? hi : hk);
    } else if (split) {
      // shadows in the page's hue, highlights in the key's, a neutral middle so the two never meet in violet
      M = tone(Ls + (Lh - Ls) * 0.44, 0.012, hb);
    } else {
      M = tone(Ls + (Lh - Ls) * (kind === 'dark' ? 0.44 : 0.5), famC * 0.85, famH);
    }
  }
  S = guard(S); H = guard(H);
  if (!fixedM) M = guard(M);

  // walk the curve and clean it
  const three = prm.tones > 2.5;
  let T = finish(S, M, H, P, prm, kind);
  const scale = (c, k) => { const [L, C, h] = color.lch(c); return tone(L, C * k, h); };
  for (let i = 0; i < 14; i++) {
    const bad = reach(T, three, mud).filter(x => isViolet(x.p) || isMuddy(x.p));
    if (!bad.length) break;
    if (bad.every(x => isMuddy(x.p)) && !mud) { mud = true; continue; }
    const at = bad.reduce((a, x) => a + x.t, 0) / bad.length;
    if (at < 0.38 || !three) S = scale(S, 0.72);
    else if (at > 0.66) H = scale(H, 0.72);
    else if (!fixedM) {
      const [L, C, h] = color.lch(M);
      M = h > 240 && h < 352 && C > 0.03 ? tone(L, C, h < 300 ? 262 : 356) : scale(M, 0.72);
    } else S = scale(S, 0.72);
    T = finish(S, M, H, P, prm, kind);
  }
  return { ...T, mud, grain, gamma: gamma * Math.pow(2, -prm.exposure), vig };
}

/* ------------------------------------------------------------------ the stand-in scene */

const VARIANTS = [
  { w: 0.42, h: 0.98 }, // a tall pane
  { w: 0.82, h: 0.78 }, // blinds
  { w: 0.5, h: 1.02 },  // an arched opening
  { w: 0.7, h: 1.0 },   // a soft beam, no frame (also where there is little room: it crops well)
];
/*
  Where the light falls: the seed picks the opening; the patch hugs the frame corner farthest from the
  text and shrinks until its bounding box keeps clear of the text area (measured in the burn's own
  stretched metric), so headlines never sit on mullions or leaf shadows.
*/
export function layout(seed, asp, calmX, calmY, calm, force) {
  const r = rng(`duotone-grade:scene:${seed}`);
  const pickV = Math.floor(r() * VARIANTS.length);
  const jw = 0.9 + 0.2 * r(), jh = 0.9 + 0.2 * r();
  const slant = (0.14 + 0.16 * r()) * (r() < 0.5 ? -1 : 1);
  const dir = r() < 0.5 ? -1 : 1;
  const slats = 9 + Math.floor(r() * 5);
  const leafR = r();
  const inset = -0.08 + 0.2 * r(), over = 0.05 + 0.07 * r();
  const jit = [r(), r(), r(), r()];
  const cx = calmX * asp, cy = calmY;
  const metric = (dx, dy) => Math.hypot(dx * 0.75, dy);
  const corners = [[0, 0], [asp, 0], [0, 1], [asp, 1]];
  let best = corners[0], bd = -1;
  corners.forEach((c, i) => { const d = metric(c[0] - cx, c[1] - cy) + jit[i] * 0.02; if (d > bd) { bd = d; best = c; } });
  const place = (w, h) => {
    const x0 = best[0] === 0 ? inset : asp - inset - w;
    const drop = slant * w, top = Math.min(0, drop), bot = Math.max(0, drop);
    const y0 = best[1] === 0 ? -over - top : 1 + over - h - bot;
    const box = [x0, y0 + top, x0 + w, y0 + h + bot];
    const [a, b, c, d] = box;
    // the light in the frame: the visible width times the part of the height inside it
    const area = Math.max(0, Math.min(asp, c) - Math.max(0, a)) * Math.max(0, Math.min(1, y0 + h + drop / 2) - Math.max(0, y0 + drop / 2));
    return { x0, y0, w, h, area, fits: metric(Math.max(a - cx, 0, cx - c), Math.max(b - cy, 0, cy - d)) >= clear };
  };
  const clear = 0.28 + 0.08 * calm;
  // shrink the side that clears the text (the width when the patch sits beside it, the height when it
  // sits above or below, or both) and keep whichever leaves the most light in the frame
  const fit = V => {
    const shrink = (kw, kh) => {
      let w = V.w * jw, h = V.h * jh, p = place(w, h);
      for (let i = 0; i < 80 && !p.fits && w > 0.04 && h > 0.04; i++) { w *= kw; h *= kh; p = place(w, h); }
      return p;
    };
    return [shrink(0.95, 1), shrink(1, 0.95), shrink(0.96, 0.96)]
      .reduce((a, b) => ((b.fits && !a.fits) || (b.fits === a.fits && b.area > a.area) ? b : a));
  };
  let variant = force != null ? force : pickV;
  let p = fit(VARIANTS[variant]);
  // a sliver of window frame reads as a glitch; with little room the soft beam goes there instead
  if (p.area < 0.12 * asp && variant !== 3) { variant = 3; p = fit(VARIANTS[3]); }
  const { w, h } = p;
  const leaf = variant === 3 ? 0.16 : 0.45 + 0.3 * leafR;
  return {
    variant,
    patch: [p.x0, p.y0, w, h],
    shape: [variant, slant, slats, dir],
    leaf,
    focus: [clamp01((p.x0 + w / 2) / asp), clamp01(p.y0 + h / 2 + slant * w / 2)],
  };
}

/* ------------------------------------------------------------------ the photo */

// black and white points of a picture (0.5% and 99.5%) as OKLab lightness of its luminance
const LIN = Array.from({ length: 256 }, (_, i) => { const v = i / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
function levelsOf(data) {
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.2126 * LIN[data[i]] + 0.7152 * LIN[data[i + 1]] + 0.0722 * LIN[data[i + 2]];
    hist[Math.min(255, (Math.cbrt(y) * 255) | 0)]++;
    n++;
  }
  const pick = q => { let s = 0; for (let i = 0; i < 256; i++) { s += hist[i]; if (s >= q * n) return i / 255; } return 1; };
  let a = pick(0.005), b = pick(0.995);
  if (b - a < 0.3) { const c = (a + b) / 2; a = Math.max(0, c - 0.15); b = Math.min(1, c + 0.15); }
  return [a, b];
}
// levels from a 96 px copy; throws on a cross-origin picture without CORS (that is the readability test)
function levelsFrom(source, nw, nh) {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = Math.max(1, Math.round((96 * nh) / nw));
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(source, 0, 0, c.width, c.height);
  const lv = levelsOf(g.getImageData(0, 0, c.width, c.height).data);
  c.width = c.height = 0;
  return lv;
}
// scale of the natural size the frame needs: its cover box at the capped DPR, plus 10%
function coverScale(el, nw, nh) {
  const W = el.clientWidth || 800, H = el.clientHeight || 450;
  const dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr);
  return Math.min(1, Math.max(W / nw, H / nh) * dpr * 1.1, 2048 / Math.max(nw, nh));
}
function positionOf(img) {
  const parts = (getComputedStyle(img).objectPosition || '50% 50%').split(/\s+/);
  const word = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
  const one = s => (s in word ? word[s] : /%$/.test(s) ? clamp01(parseFloat(s) / 100) : 0.5);
  return [one(parts[0] || '50%'), one(parts[1] || parts[0] || '50%')];
}
function loaded(img) {
  if (img.complete) return img.naturalWidth ? Promise.resolve(img) : Promise.reject(new Error('duotone-grade: the image did not load'));
  return new Promise((res, rej) => {
    img.addEventListener('load', () => res(img), { once: true });
    img.addEventListener('error', () => rej(new Error('duotone-grade: the image did not load')), { once: true });
  });
}
// the element's own photo; a nested icon, avatar or UI picture is never taken
function photoOf(el) {
  return el.querySelector('img[data-fx-photo]') || el.querySelector(':scope > img, :scope > picture > img');
}

/* ------------------------------------------------------------------ CSS fallbacks */

const rgba = (c, a) => `rgba(${color.rgb(c).map(v => Math.round(v * 255)).join(', ')}, ${clamp01(a).toFixed(3)})`;
const calmMax = prm => Math.min(0.95, 0.5 + 0.5 * prm.calm);
// the burn and the vignette as CSS layers, matching the shader's sizes
function overlays(t, prm, asp) {
  const a = calmMax(prm), cr = 0.5 + 0.3 * prm.calm;
  const ox = (0.5 - prm.calmX) * asp, oy = 0.5 - prm.calmY, lo = Math.hypot(ox, oy);
  const edge = clamp01((lo - 0.08) / 0.22), ang = (Math.atan2(ox, -oy) * 180) / Math.PI;
  const out = [
    grainCSS(0.06 * prm.grain),
    `radial-gradient(ellipse 75% 85% at 50% 50%, ${rgba(t.V, 0)} 55%, ${rgba(t.V, t.vig * 1.4)} 100%)`,
    `radial-gradient(${((cr / (asp * 0.6)) * 100).toFixed(1)}% ${(cr * 100).toFixed(1)}% at ${prm.calmX * 100}% ${prm.calmY * 100}%, ${rgba(t.C, a)}, ${rgba(t.C, a * 0.5)} 50%, ${rgba(t.C, 0)} 100%)`,
  ];
  // the gradient off the nearest edge, or an even dim for a centred text
  if (edge > 0.01) out.push(`linear-gradient(${ang.toFixed(1)}deg, ${rgba(t.C, a * edge)}, ${rgba(t.C, a * edge * 0.85)} 35%, ${rgba(t.C, 0)} 75%)`);
  if (edge < 0.99) out.push(`linear-gradient(${rgba(t.C, a * 0.55 * (1 - edge))}, ${rgba(t.C, a * 0.55 * (1 - edge))})`);
  return out;
}
/*
  A photo without WebGL (or one that cannot be read): blend modes do the grade. A 'color' layer of grey
  makes it grey (g), the highlight multiplies, half the middle tone soft-lights (so a colour field such as
  cobalt stays cobalt in the mids), and the shadow screens: about S + softlight(g H, M) (1 - S).
*/
function photoCSS(P, prm, kind, url, pos, asp) {
  const t = tones(P, prm, kind);
  const three = prm.tones > 2.5;
  const over = overlays(t, prm, asp);
  const layers = [...over, `linear-gradient(${t.S}, ${t.S})`];
  if (three) layers.push(`linear-gradient(${rgba(t.M, 0.55)}, ${rgba(t.M, 0.55)})`);
  layers.push(`linear-gradient(${t.H}, ${t.H})`, 'linear-gradient(#808080, #808080)',
    `url("${String(url).replace(/"/g, '%22')}") ${pos[0] * 100}% ${pos[1] * 100}% / cover no-repeat ${t.S}`);
  const blend = [...over.map(() => 'normal'), 'screen', ...(three ? ['soft-light'] : []), 'multiply', 'color', 'normal'];
  return { background: layers.join(', '), blend: blend.join(', ') };
}
// the stand-in without WebGL: the wall and a soft pool of light where the patch would fall
function sceneCSS(P, prm, kind, L, asp) {
  const t = tones(P, prm, kind);
  const [x0, y0, w, h] = L.patch;
  const px = clamp01((x0 + w / 2) / asp) * 100, py = clamp01(y0 + h / 2 + (L.shape[1] * w) / 2) * 100;
  const light = color.mix(t.M, t.H, 0.85), wall = color.mix(t.S, t.M, 0.6);
  return [
    ...overlays(t, prm, asp),
    `radial-gradient(${((w / asp) * 60).toFixed(1)}% ${(h * 55).toFixed(1)}% at ${px}% ${py}%, ${light}, ${rgba(light, 0)} 100%)`,
    `radial-gradient(130% 130% at ${px}% ${py}%, ${color.mix(t.M, t.H, 0.2)}, ${wall} 55%, ${t.S})`,
  ].join(', ');
}

/* ------------------------------------------------------------------ mount */

function uniforms(ctx, src, force) {
  const { palette, params: prm, kind, width, height, seed } = ctx;
  const t = tones(palette, prm, kind);
  const asp = width && height ? width / height : 16 / 9;
  const r = rng(`duotone-grade:motion:${seed}`);
  // the stand-in is drawn mid-key; a real photo on a light page keeps deeper shadows and more contrast
  const S = src && kind === 'light' ? color.withLightness(t.S, Math.max(0.2, lightOf(t.S) - 0.07)) : t.S;
  const u = {
    u_kS: color.labVec(S),
    u_kM: color.labVec(t.M),
    u_kH: color.labVec(t.H),
    u_kC: color.labVec(t.C),
    u_kV: color.labVec(t.V),
    u_gamma: src && kind === 'light' ? t.gamma * 1.1 : t.gamma,
    u_grainAmp: t.grain,
    u_calmMax: calmMax(prm),
    u_vig: t.vig,
    u_mud: t.mud ? 1 : 0,
    u_phase: r() * 6.283,
  };
  if (src) {
    u.u_imgRes = [src.w, src.h];
    u.u_levels = src.levels;
    u.u_pos = src.pos;
    u.u_focus = [0.4 + 0.2 * r(), 0.38 + 0.2 * r()];
  } else {
    const L = layout(seed, asp, prm.calmX, prm.calmY, prm.calm, force);
    u.u_patch = L.patch;
    u.u_shape = L.shape;
    u.u_leaf = L.leaf;
    u.u_focus = L.focus;
  }
  return u;
}

function mountOne(el, { palette, params: given, seed }) {
  const img = photoOf(el);
  const url0 = !img && el.dataset.fxSrc ? el.dataset.fxSrc : null;
  const force = given && given._variant != null ? given._variant : null; // a fixed opening, for tests only
  let inner = null, dead = false, userPaused = false, cssOnly = false, started = false;
  let current = { ...given }, pal = palette, src = null, mo = null, ro = null, io = null, copy = null, timer = 0;
  const prevOpacity = img ? img.style.opacity : '';
  const asp = () => (el.clientWidth && el.clientHeight ? el.clientWidth / el.clientHeight : 16 / 9);
  const photoURL = () => (img ? img.currentSrc || img.src : url0);
  const restore = () => { if (img && !started) img.style.opacity = prevOpacity; };

  /*
    The photo as a texture. fx.shader has no texture hook, so this rides on its uniforms() callback,
    which the runtime calls whenever it makes a canvas (lazily, and again after a lost or released
    context) because the new canvas changes size; the MutationObserver below covers a canvas that did
    not. Texture unit 0 is ours (the runtime binds none) and the context frees the texture when it goes.
    Only a drawable copy at the frame's cover size is uploaded; the 2D copy is dropped right after.
  */
  let texVer = 0, texScale = 0;
  const held = new WeakMap();
  function upload() {
    const cv = inner && inner.canvas;
    if (!cv || !src) return false;
    const gl = cv.getContext('webgl2') || cv.getContext('webgl');
    if (!gl || gl.isContextLost() || (held.get(gl) && held.get(gl).ver === texVer)) return false;
    const k = coverScale(el, src.w, src.h);
    let data = src.source;
    if (k < 0.77 || Math.max(src.w, src.h) > 2048) {
      data = document.createElement('canvas');
      data.width = Math.max(1, Math.round(src.w * k));
      data.height = Math.max(1, Math.round(src.h * k));
      const g = data.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(src.source, 0, 0, data.width, data.height);
    }
    const old = held.get(gl);
    if (old) gl.deleteTexture(old.tex);
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    if (data !== src.source) data.width = data.height = 0;
    held.set(gl, { ver: texVer, tex });
    texScale = data === src.source ? 1 : k;
    return true;
  }

  // drift 0 needs no loop: one still frame, drawn again only when something changes
  const syncLoop = () => { if (!inner) return; if (userPaused || !(current.drift > 0)) inner.pause(); else inner.resume(); };
  const applyCss = () => {
    const f = photoCSS(pal, current, paletteKind(pal), photoURL(), src.pos, asp());
    el.style.backgroundBlendMode = f.blend;
    el.style.background = f.background;
    el.dataset.fxFallback = el.dataset.fxFallback || 'photo';
  };

  function start(withPhoto) {
    if (dead) return;
    started = true;
    clearTimeout(timer);
    if (io) { io.disconnect(); io = null; }
    if (img) {
      // the photo stays until a graded frame (the canvas at opacity 1) or the CSS fallback is on screen
      const graded = () => { const cv = el.querySelector(':scope > canvas.fx-canvas'); return !!(cv && cv.style.opacity === '1') || !!el.dataset.fxFallback; };
      new MutationObserver((_, ob) => { if (dead) ob.disconnect(); else if (graded()) { img.style.transition = 'opacity .5s ease'; img.style.opacity = '0'; ob.disconnect(); } })
        .observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'data-fx-fallback'] });
    }
    inner = shader(el, {
      frag: (withPhoto ? '#define FX_PHOTO 1\n' : '') + frag,
      schema: params,
      params: current,
      palette: pal,
      seed,
      uniforms: ctx => { if (withPhoto) upload(); return uniforms(ctx, withPhoto ? src : null, force); },
      still: 4,
      fps: 20,
      fallback: ({ palette: P, params: prm, kind, seed: sd, width, height }) => {
        const a = width && height ? width / height : asp();
        if (!withPhoto) { el.style.backgroundBlendMode = ''; return sceneCSS(P, prm, kind, layout(sd, a, prm.calmX, prm.calmY, prm.calm, force), a); }
        const f = photoCSS(P, prm, kind, photoURL(), src.pos, a);
        el.style.backgroundBlendMode = f.blend;
        return f.background;
      },
    });
    if (withPhoto) {
      mo = new MutationObserver(() => { if (upload() && inner) inner.redraw(); });
      mo.observe(el, { childList: true });
      // a frame that grew well past the uploaded size gets a sharper copy
      ro = new ResizeObserver(() => {
        if (!inner || texScale >= 1 || coverScale(el, src.w, src.h) < texScale * 1.25) return;
        texVer++;
        inner.set({});
      });
      ro.observe(el);
    }
    syncLoop();
  }
  function startCss() {
    if (dead) return;
    started = cssOnly = true;
    clearTimeout(timer);
    if (io) { io.disconnect(); io = null; }
    if (img) img.style.opacity = '0';
    applyCss();
  }

  if (img || url0) {
    let source = img;
    if (!img) { source = new Image(); source.crossOrigin = 'anonymous'; source.decoding = 'async'; source.src = url0; }
    if (img) {
      // the photo stays visible until a graded frame has painted (start() hides it then)
      io = new IntersectionObserver(es => {
        if (es[es.length - 1].isIntersecting && !timer && !started) timer = setTimeout(restore, 4000);
      });
      io.observe(el);
    }
    (async () => {
      await loaded(source);
      if (dead) return null;
      const nw = source.naturalWidth, nh = source.naturalHeight;
      try { return { source, w: nw, h: nh, levels: levelsFrom(source, nw, nh) }; } catch (_) { /* cross-origin without CORS */ }
      copy = new Image();
      copy.crossOrigin = 'anonymous';
      copy.src = source.currentSrc || source.src;
      await loaded(copy);
      if (dead) return null;
      return { source: copy, w: nw, h: nh, levels: levelsFrom(copy, nw, nh) };
    })()
      .then(s => { if (s && !dead) { src = { ...s, pos: img ? positionOf(img) : [0.5, 0.5] }; start(true); } })
      .catch(() => {
        if (dead) return;
        // unreadable but shown (cross-origin without CORS): grade it with CSS; broken: leave the page as it was
        const nw = source.naturalWidth || (copy && copy.naturalWidth);
        if (nw) { src = { w: nw, h: source.naturalHeight || copy.naturalHeight, pos: img ? positionOf(img) : [0.5, 0.5] }; startCss(); return; }
        if (img) { started = false; restore(); return; }
        // data-fx-src on a host without CORS fails with crossOrigin set; a CSS url() needs no CORS, so
        // load it once more without, only for its size, and grade it with CSS
        copy = new Image();
        copy.decoding = 'async';
        copy.src = url0;
        loaded(copy).then(() => {
          if (dead) return;
          src = { w: copy.naturalWidth, h: copy.naturalHeight, pos: [0.5, 0.5] };
          startCss();
        }).catch(() => { if (!dead) console.warn(`duotone-grade: the photo did not load (${url0})`); });
      });
  } else {
    start(false);
  }

  return {
    pause() { userPaused = true; syncLoop(); },
    resume() { userPaused = false; syncLoop(); },
    redraw() { if (inner) inner.redraw(); },
    set(next) {
      current = { ...current, ...next };
      if (inner) { current = inner.set(current); syncLoop(); }
      else if (cssOnly) applyCss();
      return current;
    },
    setPalette(p) {
      pal = p;
      if (inner) inner.setPalette(p);
      else if (cssOnly) applyCss();
    },
    destroy() {
      dead = true;
      clearTimeout(timer);
      if (io) io.disconnect();
      if (mo) mo.disconnect();
      if (ro) ro.disconnect();
      if (copy && !copy.complete) copy.src = ''; // stop the CORS fetch
      if (inner) inner.destroy();
      if (cssOnly) { el.style.background = ''; delete el.dataset.fxFallback; }
      el.style.backgroundBlendMode = '';
      if (img) img.style.opacity = prevOpacity;
    },
    get info() { return inner ? inner.info : { webgl: 0, fallback: cssOnly ? 'photo' : null }; },
  };
}

export default {
  id: 'duotone-grade',
  name: 'Duotone grade',
  family: 'photo',
  params,
  mount: mountOne,
};
