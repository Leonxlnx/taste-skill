// soft-light-bars: a few soft, nearly upright bars of light of uneven width, grouped unevenly to one
// side of the text, like light through slats landing on a wall. One broad pool of light lands on the
// group and drifts slowly along it; each bar breathes on its own slow cycle; elsewhere the bars fall
// into the ground. Flat cores with blurred edges and a faint bloom, a fine grainy dissolve at the
// edges, still grain. On light grounds the light cannot be lighter than the page, so the pool shades
// the wall between the bars instead. Every colour is a step of the palette.
import { shader, color, grainCSS } from '../fx.js';

const params = {
  speed:    { default: 0.5,  min: 0, max: 2,   step: 0.01 }, // breathing and drift speed (0.5 is real time)
  bars:     { default: 0,    min: 0, max: 7,   step: 1 },    // number of bars, 4 to 7; 0 lets the seed choose
  tilt:     { default: 0.5,  min: 0, max: 1,   step: 0.01 }, // lean: 0 upright, 0.5 a seeded 2 to 14 degrees, 1 twice that
  softness: { default: 0.6,  min: 0, max: 1,   step: 0.01 }, // edge blur
  glow:     { default: 0.8,  min: 0, max: 1.5, step: 0.01 }, // brightness of the light
  breathe:  { default: 0.5,  min: 0, max: 1,   step: 0.01 }, // depth of each bar's slow breathing
  haze:     { default: 0.5,  min: 0, max: 1,   step: 0.01 }, // the pool in the air between the bars (a shade on light grounds)
  stipple:  { default: 0.4,  min: 0, max: 1,   step: 0.01 }, // grainy dissolve at the bar edges
  grain:    { default: 0.5,  min: 0, max: 1,   step: 0.01 }, // still film grain
  calm:     { default: 0.55, min: 0, max: 1,   step: 0.01 }, // keep the area around the text empty
  calmX:    { default: 0.25, min: 0, max: 1,   step: 0.01 }, // calm area centre, 0 left .. 1 right
  calmY:    { default: 0.7,  min: 0, max: 1,   step: 0.01 }, // calm area centre, 0 top .. 1 bottom
};

const frag = /* glsl */ `
// five-stop ramp in OKLab: ground, low, mid, high, and the hottest stop only at the top
vec3 ramp(float v, vec3 k0, vec3 k1, vec3 k2, vec3 k3, vec3 k4) {
  vec3 c = mix(k0, k1, clamp(v / 0.22, 0.0, 1.0));
  c = mix(c, k2, clamp((v - 0.22) / 0.28, 0.0, 1.0));
  c = mix(c, k3, clamp((v - 0.5) / 0.3, 0.0, 1.0));
  return mix(c, k4, clamp((v - 0.8) / 0.2, 0.0, 1.0));
}

// one bar at x (measured across the bars); b = (centre, half width, phase, strength). A flat core
// with a blurred edge, as light through a slat, plus a faint bloom around it
float bar(float x, vec4 b, float t, float jit, float e) {
  if (b.y <= 0.0) return 0.0;
  float om = 0.39 + 0.24 * fract(b.z * 0.731);                  // one breath in about 10 to 16 s
  float hw = b.y * (1.0 + 0.06 * u_breathe * sin(t * om * 0.61 + b.z * 1.7));
  float d = abs(x - b.x) + jit;
  float core = 1.0 - smoothstep(hw - 0.5 * e, hw + e, d);
  float bw = (d / (hw + 2.5 * e));
  float bloom = 0.12 * exp(-bw * bw);
  float breath = 1.0 - u_breathe * 0.4 * (0.5 - 0.5 * cos(t * om + b.z));
  return (core + bloom * (1.0 - core)) * breath * b.w;
}

void main() {
  vec2 uv = fx_uv();
  vec2 p = fx_p();
  // small phase offset per seed keeps t small, so sin() stays smooth on mediump GPUs
  float t = u_time * u_speed * 2.0 + mod(u_seed, 97.0) * 0.71;
  // q.x runs across the bars, q.y along them
  vec2 q = vec2(p.x * u_rot.x - p.y * u_rot.y, p.x * u_rot.y + p.y * u_rot.x);

  // the pool drifts slowly along the bars and back (one way in about 6 s), with a smaller sideways sway
  vec2 pc = u_pool.xy + vec2(0.012 * sin(t * 0.29 + 1.3), u_drift * sin(t * 0.52));
  vec2 d = (q - pc) / u_pool.zw;
  float pool = exp(-dot(d, d));

  // a little uneven light along the bars, flowing very slowly
  float n = fx_noise(vec2(q.x * 1.1 + 4.3, q.y * 1.4 - t * 0.03));
  float light = (u_floor + (1.0 - u_floor) * pool) * (1.0 + 0.3 * n);

  // a fine, still jitter of the edge on a CSS-pixel lattice: the grainy dissolve
  vec2 cpx = gl_FragCoord.xy / max(u_dpr, 1.0);
  float jit = (fx_vnoise(cpx * 1.7) + fx_vnoise(cpx * 1.7 + vec2(13.1, 57.7)) - 1.0) * 0.012 * u_stipple;
  float e = 0.02 + 0.045 * u_softness;
  float m = 1.0;
  m *= 1.0 - bar(q.x, u_b0, t, jit, e);
  m *= 1.0 - bar(q.x, u_b1, t, jit, e);
  m *= 1.0 - bar(q.x, u_b2, t, jit, e);
  m *= 1.0 - bar(q.x, u_b3, t, jit, e);
  m *= 1.0 - bar(q.x, u_b4, t, jit, e);
  m *= 1.0 - bar(q.x, u_b5, t, jit, e);
  m *= 1.0 - bar(q.x, u_b6, t, jit, e);
  float v = (1.0 - m) * light * u_glow * 1.1;

  // the calm area stays empty for text, and the light falls to the ground at the frame edges
  float cm = fx_calm(uv, vec2(u_calmX, u_calmY), 0.35 + 0.45 * u_calm);
  float quiet = clamp(1.6 * u_calm, 0.0, 1.0) * cm;
  v *= 1.0 - quiet;
  float fe = smoothstep(-0.05, 0.32, uv.y) * smoothstep(-0.05, 0.32, 1.0 - uv.y)
           * smoothstep(-0.05, 0.12, uv.x) * smoothstep(-0.05, 0.12, 1.0 - uv.x);
  v = clamp(v * (0.45 + 0.55 * fe), 0.0, 1.0);

  // bars far from the pool lean toward the companion colour (dark grounds only)
  float hb = smoothstep(0.15, 1.0, abs(q.x - pc.x) / u_spanB) * u_bAmt;
  vec3 col = mix(ramp(v, u_a0, u_a1, u_a2, u_a3, u_a4), ramp(v, u_a0, u_q1, u_q2, u_q3, u_q4), hb);
  // the pool in the air between the bars: a lift of the ground on dark grounds, a shade of the wall on
  // light ones, a deeper ground on colour fields; always a step of the ground itself. On light grounds
  // and colour fields it stays inside the group (the window), so it reads as the slats' shadow, not a stain
  float win = smoothstep(u_win.x - 0.1, u_win.x + 0.01, q.x) * (1.0 - smoothstep(u_win.y - 0.01, u_win.y + 0.1, q.x));
  float hzm = mix(1.0, win, u_win.z);
  col = mix(col, u_hz.xyz, min(1.0, 2.0 * u_haze) * u_hz.w * pool * hzm * fe * (1.0 - quiet) * (1.0 - smoothstep(0.0, 0.45, v)));

  // still grain on lightness, on the same soft one-CSS-pixel lattice (so DPR scaling never blurs it
  // into a different texture), quieter near white and black
  float g = fx_vnoise(cpx * 0.9 + 17.0) + fx_vnoise(cpx * 0.9 + vec2(71.3, 29.9)) - 1.0;
  float amp = u_grainAmp * u_grain * (1.0 - 0.6 * smoothstep(0.86, 1.0, col.x)) * (0.5 + 0.5 * smoothstep(0.0, 0.22, col.x));
  col.x += g * amp;

  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

/* ------------------------------------------------------------------ colours */

const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const lerp = (a, b, k) => a + (b - a) * k;

// no violet, lavender or mauve: hues 272..338 with chroma above 0.02, and for pale tints a wider band
// (262..345), where blue turns periwinkle and pink turns mauve
const banned = (L, C, h) => C > 0.02 && (L > 0.7 ? h > 262 && h < 345 : h > 272 && h < 338);
function guard(c) {
  let [L, C, h] = color.lch(c);
  if (C <= 0.02) return color.hex(c);
  // blue reads periwinkle as it gets pale, so pale blues lean toward sky blue, step by step
  if (h > 248 && h < 272 && L > 0.6) h -= (h - 248) * smooth(0.6, 0.75, L);
  if (banned(L, C, h)) h = h < 303 ? (L > 0.7 ? 250 : 265) : (L > 0.7 ? 350 : 342);
  return color.fromLch([L, C, h]);
}
const labLch = ([L, a, b]) => [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
// the GPU blends these colours in OKLab: no point of a blend may fall in the band either (only the
// ground's own colour is allowed, close to the ground, when the page's ground itself sits in the band)
function blendsClean(pairs, bg) {
  const G = color.lch(bg), gBad = banned(...G);
  for (const [x, y] of pairs) {
    const A = color.lab(x), B = color.lab(y);
    for (let i = 1; i < 8; i++) {
      const s = labLch(A.map((v, j) => v + (B[j] - v) * (i / 8)));
      if (banned(...s) && !(gBad && s[1] <= G[1] + 0.012 && Math.abs(s[0] - G[0]) < 0.12 && hueGap(s[2], G[2]) < 12)) return false;
    }
  }
  return true;
}
// the companion: the hue turned to the side that stays out of the band
function companion(c, deg = 35) {
  const [L, C, h] = color.lch(c);
  let hb = (h + deg) % 360;
  if (banned(L, C, hb) || banned(0.5, C, hb)) hb = (h + 360 - deg) % 360;
  return guard(color.fromLch([L, C * 0.8, hb]));
}

// the colour of the light on a dark ground: the accent, unless it would turn violet (then a clean white),
// sits far from the ground's hue (then light in the ground's own hue) or is too muted (then lifted to a
// pale light, so it never reads as a dim brown)
function darkLight(P, mode) {
  const { bg, ink, accent } = P;
  const [, Cb, hb] = color.lch(bg), [La, Ca, ha] = color.lch(accent);
  const white = () => (Cb > 0.012 ? color.fromLch([0.88, 0.025, hb]) : color.fromLch([0.9, 0.014, 85]));
  if (mode === 'white') return guard(white());
  if (mode === 'ground') return Cb > 0.012 ? guard(color.fromLch([0.8, Math.min(0.09, Math.max(0.04, Cb * 1.5)), hb])) : guard(white());
  if (Ca < 0.02 || banned(0.5, Ca, ha)) return guard(white());
  if (Cb >= 0.03 && color.hueDistance(bg, accent) > 60) return darkLight(P, 'ground');
  if (Ca < 0.07) return guard(color.fromLch([Math.max(La, 0.82), Math.min(Ca, 0.05), ha]));
  return guard(La < 0.58 ? color.fromLch([0.58, Ca, ha]) : accent);
}

function rampDark(P, lc) {
  const { bg, ink } = P;
  // a neon accent is held to a calmer chroma, so the bars glow rather than shout
  let [L, C, h] = color.lch(lc);
  if (C > 0.17) { C = 0.17; lc = color.fromLch([L, C, h]); }
  const lo = color.fromLch([L * 0.6, C * 0.8, h]), hi = color.fromLch([Math.min(0.95, L + 0.1), C * 0.75, h]);
  // the hottest stop whitens toward the ink, or toward plain white when the ink has another hue
  const [, Ci, hi2] = color.lch(ink);
  const hot = Ci < 0.03 || hueGap(hi2, h) < 40 ? ink : '#ffffff';
  return [bg, color.mix(bg, lo, 0.6), color.mix(bg, lc, 0.8), lc, color.mix(hi, hot, 0.45)].map((c, i) => (i ? guard(c) : c));
}

function tones(P, kind) {
  const { bg, accent } = P;
  const [Lb, Cb, hb] = color.lch(bg), [, Ca, ha] = color.lch(accent);
  const G = color.lab(bg);
  let A, B = null, hz, hzAmt, bAmt = 0, win = 0.5;

  if (kind === 'dark') {
    // try the light colour with its companion, then without, then in the ground's hue, then white
    const tries = [[null, true], [null, false], ['ground', false], ['white', false]];
    hz = guard(color.fromLch([Math.max(Lb + 0.05, 0.13), Cb, hb]));
    hzAmt = 0.85;
    for (const [mode, withB] of tries) {
      const lc = darkLight(P, mode);
      A = rampDark(P, lc);
      B = withB ? rampDark(P, companion(lc)) : null;
      const pairs = [];
      for (let i = 0; i < 4; i++) pairs.push([A[i], A[i + 1]], [hz, A[i + 1]]);
      if (B) for (let i = 0; i < 4; i++) pairs.push([B[i], B[i + 1]], [A[i + 1], B[i + 1]], [hz, B[i + 1]]);
      if (blendsClean(pairs, bg)) break;
    }
    bAmt = B ? 0.4 : 0;
  } else if (kind === 'colour') {
    // light in the ground's own hue over a strong ground; on bright fields a cream-white core and a
    // deeper ground between the bars, so the light still stands out of the colour
    const bright = smooth(0.62, 0.78, Lb);
    const Lc = Lb + lerp(Math.min(0.42, 0.9 - Lb) * 0.85, Math.min(0.97 - Lb, 0.19), bright);
    let Cc = Cb * lerp(0.5, 0.45, bright);
    for (let k = 0; k < 4; k++) {
      const core = color.fromLch([Lc, Cc, hb]);
      const st = s => color.fromLch([lerp(Lb, Lc, s), lerp(Cb, Cc, s * 0.8), hb]);
      A = [bg, st(0.25), st(0.55), core, color.mix(core, '#ffffff', 0.45)].map((c, i) => (i ? guard(c) : c));
      // a deeper yellow turns olive, so yellow fields deepen toward amber instead
      const hh = hb > 55 && hb < 115 ? hb - 16 : hb;
      hz = guard(color.fromLch([Math.max(0.06, Lb - lerp(0.07, 0.09, bright)), Cb * (hh !== hb ? 1.1 : 1), hh]));
      const pairs = [];
      for (let i = 0; i < 4; i++) pairs.push([A[i], A[i + 1]], [hz, A[i + 1]]);
      if (blendsClean(pairs, bg)) break;
      Cc *= 0.5;
    }
    hzAmt = lerp(0.7, 0.85, bright);
    win = 1;
  } else {
    // a light ground: the bars are daylight, as much lighter than the wall as there is room for, and the
    // pool shades the wall between them, more so the closer the wall is to white (one smooth rule, so
    // two near-equal off-whites always look alike)
    const far = Cb >= 0.03 && Ca >= 0.03 && color.hueDistance(bg, accent) > 60;
    // the light is tinted like daylight: by the accent when it is a natural light hue (amber to teal),
    // otherwise by the wall's own hue, or a faint warm white (a pink or blue glimmer reads as a stripe)
    let tint;
    if (Ca > 0.03 && ha >= 40 && ha <= 200 && !far) tint = [0.022, ha];
    else if (Cb >= 0.012) tint = [Math.min(0.025, Cb), hb];
    else tint = [0.012, 85];
    // the shadow is cool, as daylight shadow is: the accent's hue when that is a green, teal or blue, a
    // clean cool grey otherwise (a warm or pink shadow on a pale wall reads as a stain)
    const cool = Ca > 0.03 && ha >= 150 && ha <= 262 && !far;
    let sh = [0.016, cool ? ha : 245];
    const lift = Math.min(0.12, Math.max(0, 0.985 - Lb));
    const shade = 0.03 + 0.05 * smooth(0.88, 0.98, Lb);
    const ab = ([c, h]) => [c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];
    for (let k = 0; k < 3; k++) {
      const T = ab(tint), S = ab(sh);
      const st = s => guard(color.fromLab([Math.min(1, Lb + lift * s), lerp(G[1], T[0], s), lerp(G[2], T[1], s)]));
      A = [bg, st(0.3), st(0.6), st(0.85), st(1)];
      hz = guard(color.fromLab([Lb - shade, G[1] * 0.55 + S[0], G[2] * 0.55 + S[1]]));
      const pairs = [];
      for (let i = 0; i < 4; i++) pairs.push([A[i], A[i + 1]], [hz, A[i + 1]]);
      if (blendsClean(pairs, bg)) break;
      tint = k === 0 && Cb >= 0.012 ? [Math.min(0.025, Cb), hb] : [0.01, 85];
      sh = [0.012, 230];
    }
    hzAmt = 1;
    win = 1;
  }
  return { A, B: B || A, hz, hzAmt, bAmt, win, grain: kind === 'dark' ? 0.035 : 0.04 };
}

/* ------------------------------------------------------------------ composition */

// pack k bars into [a, b] (positions across the bars, in frame heights), grouped unevenly: gaps a little
// wider than the blur, one break that splits a group, and a free offset so they never hug both ends
function pack(k, a, b, r, edge, maxGap) {
  const room = b - a;
  for (; k > 0; k--) {
    const hw = Array.from({ length: k }, () => 0.022 + 0.05 * Math.pow(r(), 1.4));
    const gaps = Array.from({ length: k - 1 }, () => 2 * edge * (1 + 1.6 * r()) + 0.02);
    if (k >= 3) { const i = Math.floor(r() * (k - 1)); gaps[i] *= 1.6 + r(); }
    for (let i = 0; i < gaps.length; i++) gaps[i] = Math.min(gaps[i], maxGap);
    let len = 2 * edge + hw.reduce((s, w) => s + 2 * w, 0) + gaps.reduce((s, g) => s + g, 0);
    let f = 1;
    if (len > room) { f = room / len; if (f < 0.7) continue; len = room; }
    let x = a + (room - len) * (0.15 + 0.7 * r()) + edge * f;
    return hw.map((w, i) => {
      const c = x + w * f;
      x += 2 * w * f + (gaps[i] || 0) * f;
      return [c, w * f, r() * 6.283, 0.65 + 0.35 * r()];
    });
  }
  return [];
}

// bars, tilt and pool from the seed; shared by the shader and the CSS fallback
function scene({ params: prm, rng: r, width, height }) {
  const asp = width && height ? width / height : 16 / 9;
  const side = r() < 0.5 ? -1 : 1;
  const deg = Math.min(22, (2 + 12 * r()) * prm.tilt * 2);
  const theta = (side * deg * Math.PI) / 180;
  const cs = Math.cos(theta), sn = Math.sin(theta);
  const half = (asp * cs + Math.abs(sn)) / 2;                    // half the frame, measured across the bars
  const edge = 0.02 + 0.045 * prm.softness;
  const toQ = (x, y) => [x * cs - y * sn, x * sn + y * cs];
  const [qc] = toQ((prm.calmX - 0.5) * asp, 0.5 - prm.calmY);

  // the text sits in the widest gap: no bar's blurred edge comes within 0.12 frame widths of it (plus the
  // lean over the height of a text block)
  const keep = 0.12 * asp + 0.12 * Math.abs(sn) + 0.03 * r();
  const L = [-half + 0.02, qc - keep], R = [qc + keep, half - 0.02];
  const lenL = Math.max(0, L[1] - L[0]), lenR = Math.max(0, R[1] - R[0]);
  const poolRight = Math.abs(lenR - lenL) < 0.15 * asp ? r() < 0.5 : lenR > lenL;
  const [PS, OS] = poolRight ? [R, L] : [L, R];
  const n = prm.bars >= 1 ? Math.max(4, Math.round(prm.bars)) : 4 + Math.floor(r() * 4);
  const otherLen = OS[1] - OS[0];
  let nOther = otherLen > 0.3 ? Math.round(n * (0.15 + 0.25 * r()) * Math.min(1, otherLen / (PS[1] - PS[0] + 1e-3) * 1.5)) : 0;
  nOther = Math.min(nOther, n - 2);
  const maxGap = 1.6 * keep;
  const main = pack(n - nOther, PS[0], PS[1], r, edge, maxGap);
  const rest = pack(nOther, OS[0], OS[1], r, edge, maxGap);
  const bars = [...main, ...rest].slice(0, 7);

  // the pool lands on the main group, across from the text along the bars too
  const g0 = main.length ? main[0][0] - main[0][1] : PS[0], g1 = main.length ? main[main.length - 1][0] + main[main.length - 1][1] : PS[1];
  const pqx = (g0 + g1) / 2 + (r() - 0.5) * 0.08;
  const cy = prm.calmY;
  const py = cy > 0.6 ? 0.22 + 0.2 * r() : cy < 0.4 ? 0.58 + 0.2 * r() : 0.32 + 0.3 * r();
  const yP = 0.5 - py, xP = (pqx + yP * sn) / cs;
  const [, pqy] = toQ(xP, yP);
  const rx = Math.max((g1 - g0) / 2 + 0.14, 0.32) * (1 + 0.25 * r());
  const ry = 0.3 + 0.16 * r();
  return { asp, theta, cs, sn, half, edge, bars, pool: [pqx, pqy, rx, ry], drift: 0.03 + 0.03 * r(), px: xP / asp + 0.5, py, group: [g0 - edge, g1 + edge] };
}

function uniforms(ctx) {
  const S = scene(ctx);
  const T = tones(ctx.palette, ctx.kind);
  const u = {
    u_rot: [S.cs, S.sn],
    u_pool: S.pool,
    u_drift: S.drift,
    u_floor: 0.06,
    u_spanB: S.half,
    u_bAmt: T.bAmt,
    u_grainAmp: T.grain,
    u_hz: [...color.labVec(T.hz), T.hzAmt],
    u_win: [S.group[0], S.group[1], T.win],
  };
  for (let i = 0; i < 7; i++) u['u_b' + i] = S.bars[i] || [0, 0, 0, 0];
  T.A.forEach((c, i) => { u['u_a' + i] = color.labVec(c); });
  T.B.forEach((c, i) => { if (i) u['u_q' + i] = color.labVec(c); });
  return u;
}

/* ------------------------------------------------------------------ CSS fallback */

function rampAt(k, v) {
  const st = [0, 0.22, 0.5, 0.8, 1];
  v = Math.max(0, Math.min(1, v));
  for (let i = 0; i < 4; i++) if (v <= st[i + 1]) return color.mix(k[i], k[i + 1], (v - st[i]) / (st[i + 1] - st[i]));
  return k[4];
}
const alpha = (hex, a) => hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

// the same bars as soft stops of one angled linear gradient (five stops per edge follow the shader's
// smooth edge, so no Mach bands), lit by the pool, held to the pool by a veil of the ground
function fallback(ctx) {
  const P = ctx.palette, prm = ctx.params, bg = P.bg;
  const S = scene(ctx);
  const T = tones(P, ctx.kind);
  const deg = 90 + (S.theta * 180) / Math.PI;
  const rad = (deg * Math.PI) / 180;
  const line = Math.abs(S.asp * Math.sin(rad)) + Math.abs(Math.cos(rad)); // gradient line, in heights
  const pct = x => 50 + (x / line) * 100;
  const e = S.edge;
  const stops = [];
  let last = -1e9;
  const push = (c, x) => { const v = Math.max(last, pct(x)); last = v; stops.push(`${c} ${v.toFixed(2)}%`); };
  const prof = [[1, 0], [0.625, 0.16], [0.25, 0.5], [-0.125, 0.84], [-0.5, 1]];   // (offset in blurs, alpha)
  for (const [c, h, , w] of [...S.bars].sort((a, b) => a[0] - b[0])) {
    const dx = (c - S.pool[0]) / S.pool[2];
    const v = w * prm.glow * 1.1 * (0.06 + 0.94 * Math.exp(-dx * dx));
    const col = color.hex(rampAt(T.A, v));
    for (const [o, a] of prof) push(alpha(col, a), c - h - o * e);
    for (const [o, a] of [...prof].reverse()) push(alpha(col, a), c + h + o * e);
  }
  const at = `${(S.px * 100).toFixed(1)}% ${(S.py * 100).toFixed(1)}%`;
  const rw = ((S.pool[2] * 1.8) / S.asp) * 100, rh = S.pool[3] * 1.8 * 100;
  const hz = color.hex(color.mix(bg, T.hz, Math.min(1, 2 * prm.haze) * T.hzAmt));
  const calmA = Math.min(1, 1.6 * prm.calm) * 0.95;
  // the shade (light grounds, colour fields) stays inside the group like the shader's window; the lift of
  // a dark ground is a soft pool
  const [w0, w1] = S.group;
  const air = T.win >= 1
    ? `linear-gradient(${deg.toFixed(2)}deg, ${alpha(hz, 0)} ${pct(w0 - 0.1).toFixed(2)}%, ${alpha(hz, 0.5)} ${pct(w0 - 0.045).toFixed(2)}%, ${hz} ${pct(w0 + 0.01).toFixed(2)}%, ${hz} ${pct(w1 - 0.01).toFixed(2)}%, ${alpha(hz, 0.5)} ${pct(w1 + 0.045).toFixed(2)}%, ${alpha(hz, 0)} ${pct(w1 + 0.1).toFixed(2)}%)`
    : `radial-gradient(${rw.toFixed(1)}% ${rh.toFixed(1)}% at ${at}, ${hz}, ${alpha(hz, 0.5)} 45%, ${alpha(hz, 0)} 100%)`;
  return [
    grainCSS(ctx.kind === 'dark' ? 0.05 : 0.07),
    `radial-gradient(42% 55% at ${(prm.calmX * 100).toFixed(1)}% ${(prm.calmY * 100).toFixed(1)}%, ${alpha(bg, calmA)}, ${alpha(bg, calmA * 0.5)} 40%, ${alpha(bg, 0)} 80%)`,
    `radial-gradient(${rw.toFixed(1)}% ${rh.toFixed(1)}% at ${at}, ${alpha(bg, 0)} 20%, ${alpha(bg, 0.55)} 55%, ${alpha(bg, 0.9)} 80%, ${bg} 100%)`,
    `linear-gradient(${deg.toFixed(2)}deg, ${stops.join(', ')})`,
    air,
    bg,
  ].join(', ');
}

export default {
  id: 'soft-light-bars',
  name: 'Soft light bars',
  family: 'light',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      still: 5,
      fps: 30,          // the motion is slow; half the frames look the same and cost half
      maxDpr: 1.5,      // a soft field; the grain and stipple sit on a CSS-pixel lattice, so no gain from more
      fallback: ctx => fallback({ ...ctx, width: ctx.width || el.clientWidth, height: ctx.height || el.clientHeight }),
    });
  },
};
