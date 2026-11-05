// line-engraving: tone carried by dense parallel lines that swell in the shadows and thin to hairlines
// in the light, bending around the form, like a banknote or an etched plate. One ink on paper.
// Drawn once; it only moves when drift is above 0.
import { shader, color, rng, resolveParams } from '../fx.js';

const params = {
  pitch:     { default: 6,    min: 4,   max: 14,  step: 0.5 },  // line spacing, CSS px
  minWidth:  { default: 0.1,  min: 0,   max: 0.5, step: 0.01 }, // hairline in the light, share of the pitch
  maxWidth:  { default: 0.9,  min: 0.3, max: 1,   step: 0.01 }, // line in the deepest shadow
  angle:     { default: 20,   min: 0,   max: 180, step: 1 },    // line direction, degrees
  bend:      { default: 0.6,  min: 0,   max: 1.5, step: 0.01 }, // how far the lines follow the form
  source:    { default: 1,    min: -1,  max: 1,   step: 1 },    // 1 rolling hills (the default, a quiet ground), 0 a big sphere (focal), -1 the seed picks
  cross:     { default: 0.5,  min: 0,   max: 1,   step: 0.01 }, // cross-hatching in the darkest part
  guilloche: { default: 0,    min: 0,   max: 1,   step: 0.01 }, // a faint rosette of fine curves around the form
  size:      { default: 1,    min: 0.5, max: 1.6, step: 0.01 }, // size of the form
  accent:    { default: 0,    min: 0,   max: 1,   step: 1 },    // 1 prints in the accent instead of the ink
  drift:     { default: 0,    min: 0,   max: 0.2, step: 0.005 },// 0 is a still plate; above 0 the light wanders
  calm:      { default: 0.5,  min: 0,   max: 1,   step: 0.01 }, // empties the text area
  calmX:     { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:     { default: 0.6,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// box-filtered coverage of a line of half-width w around v = 0 (v: 0 at the centre, 1 between lines)
float lineCov(float v, float w, float aa) {
  float lo = max(-w, v - aa), hi = min(w, v + aa);
  return clamp((hi - lo) / (2.0 * aa), 0.0, 1.0);
}
float hatch(float s, float gs, float w) {
  float v = abs(fract(s) - 0.5) * 2.0;
  float aa = max(2.0 * gs / u_dpr, 1e-4);   // v units per device pixel
  return lineCov(v, w, aa);
}

float hillH(vec2 p, float t) { return fx_fbm(p * 1.15 + vec2(t, 0.3 * t) + u_seed * 0.007); }

void main() {
  vec2 q = gl_FragCoord.xy / u_dpr;                 // CSS px, y up
  vec2 p = fx_p();
  vec2 uv = fx_uv();
  float Hpx = u_res.y / u_dpr;                      // frame height, CSS px
  float t = u_time * u_drift;
  float pitch = u_pitch;

  vec2 c = u_form.xy;
  float R = u_form.z, Rpx = R * Hpx;
  float ph = u_lightA + 0.5 * sin(t * 5.0);
  vec3 L = normalize(vec3(cos(ph), sin(ph), 0.85));

  float h = 0.0;            // height field the lines wrap around
  vec2 gh = vec2(0.0);      // its gradient per CSS px
  float a = 0.0;            // ink amount 0..1 (on dark paper the ink is the light)
  float pres = 0.0;         // where lines exist at all
  float bendPx = u_bend * 0.4;
  vec2 r = (p - c) / R;
  float rr = dot(r, r);

  if (u_mode < 0.5) {
    if (rr < 1.0) {
      h = 1.0 - rr;                                   // lines wrap the form and stay finite at the rim
      gh = -2.0 * r / Rpx;
      vec3 n = vec3(r, sqrt(1.0 - rr));
      float lam = max(dot(n, L), 0.0);
      float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 8.0);
      float lit = 0.06 + 0.66 * lam + 0.3 * spec;
      float rim = pow(1.0 - n.z, 2.5);
      // bounce light keeps the shadow rim on paper; on dark paper it lit the shadow side as brightly
      // as the lit side and the disc read flat
      lit += (u_sub > 0.5 ? 0.12 : 0.02) * rim * (1.0 - lam);
      // the limb darkens on paper, so the round edge reads even on the lit side
      a = clamp(u_sub > 0.5 ? 1.0 - lit + 0.4 * rim * lam : lit, 0.0, 1.0);
      pres = 1.0;
    } else if (u_sub > 0.5) {
      vec2 sc = c + vec2(-L.x * 0.55 * R, -0.97 * R);  // cast shadow on the floor
      vec2 e = (p - sc) / (R * vec2(1.35, 0.25));
      float sh = exp(-dot(e, e) * 1.1);
      a = 0.85 * sh;
      pres = smoothstep(0.04, 0.3, sh);
    }
    bendPx *= Rpx;
  } else {
    // rolling hills: lines ride over a soft height field, lit from the side
    float e = 1.5 / Hpx;
    float h0 = hillH(p, t);
    float hx = hillH(p + vec2(e, 0.0), t), hy = hillH(p + vec2(0.0, e), t);
    gh = vec2(hx - h0, hy - h0) / 1.5;
    h = h0;
    vec3 n = normalize(vec3(-gh * Hpx * 0.35, 1.0));
    float lit = clamp(0.5 + 1.4 * dot(n.xy, L.xy) + 0.25 * h0, 0.0, 1.0);
    a = u_sub > 0.5 ? 1.0 - lit : lit;
    // the hills rise away from the calm area
    float s = dot(p - u_calmP, u_dir) / u_span;
    pres = smoothstep(0.05, 0.6, s + 0.15 * h0);
    a *= pres;
    bendPx *= Hpx * 0.5;
  }

  // the text area stays clean paper
  float m = fx_calm(uv, vec2(u_calmX, u_calmY), 0.3 + 0.55 * u_calm) * u_calm;
  pres *= 1.0 - min(1.0, 1.8 * m);

  // main lines: displaced by the height field so they bend around the form
  vec2 d1 = vec2(cos(u_angR), sin(u_angR));
  float s1 = (dot(q, d1) + bendPx * h) / pitch;
  float g1 = length(d1 + bendPx * gh) / pitch;
  float w1 = mix(u_minWidth, u_maxWidth, a) * pres;
  float cov = hatch(s1, g1, w1);

  // cross-hatching in the deepest shadow, at its own angle, bent less. Only on paper: on dark paper
  // the ink is the light, and crossing lines chopped the highlight into dark dashes
  if (u_cross > 0.0 && u_sub > 0.5) {
    vec2 d2 = vec2(cos(u_angR + 1.05), sin(u_angR + 1.05));
    float s2 = (dot(q, d2) + 0.6 * bendPx * h) / pitch;
    float g2 = length(d2 + 0.6 * bendPx * gh) / pitch;
    float w2 = u_maxWidth * 0.75 * u_cross * smoothstep(0.62, 1.0, a) * pres;
    float c2 = hatch(s2, g2, w2);
    cov = 1.0 - (1.0 - cov) * (1.0 - c2);
  }

  // guilloche: a rosette of fine interlaced curves in a ring around the form
  if (u_guilloche > 0.0 && u_mode < 0.5) {
    vec2 rq = q - (c * Hpx + 0.5 * vec2(u_res.x, u_res.y) / u_dpr);
    float rho = length(rq), th = atan(rq.y, rq.x);
    float amp = 0.05 * Rpx, mm = 18.0, sp = max(pitch * 1.7, 0.045 * Rpx);
    float band = smoothstep(1.07, 1.14, rho / Rpx) * (1.0 - smoothstep(1.32, 1.45, rho / Rpx)) * (1.0 - min(1.0, 1.8 * m));
    float gA = sqrt(1.0 + pow(amp * mm * cos(mm * th) / max(rho, 1.0), 2.0)) / sp;
    float cA = hatch((rho + amp * sin(mm * th)) / sp, gA, 0.11 * band);
    float cB = hatch((rho + amp * sin(mm * th + 3.14159)) / sp, gA, 0.11 * band);
    float gl = 1.0 - (1.0 - cA) * (1.0 - cB);
    cov = 1.0 - (1.0 - cov) * (1.0 - gl * u_guilloche);
  }

  vec3 b = u_base * mix(vec3(1.0), u_T, cov);
  vec3 col = fx_srgb(u_sub > 0.5 ? b : 1.0 - b);
  fxColor = vec4(fx_dither(col), 1.0);
}
`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lin = c => color.rgb(c).map(v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));

function inkOf(P, prm) {
  const { bg } = P;
  const Lp = color.lab(bg)[0];
  const sub = color.lab(P.ink)[0] < Lp;
  let ink = prm.accent >= 0.5 ? P.accent : P.ink;
  const L = color.lab(ink)[0];
  if (sub && L > Lp - 0.12) ink = color.withLightness(ink, Math.max(0.2, Lp - 0.35));
  if (!sub && L < Lp + 0.12) ink = color.withLightness(ink, Math.min(0.95, Lp + 0.35));
  return { sub, ink };
}

// where things go, in centred height units (y up); shared by the shader and the CSS fallback
function layout(params, r, asp, seed) {
  // its own stream, so neighbouring seeds (and the other effects on the page) do not pick alike
  const pick = rng(`line-engraving:pick:${seed}`)();
  const mode = params.source >= 0 ? Math.round(params.source) : pick < 0.28 ? 0 : 1;
  const C = [(params.calmX - 0.5) * asp, 0.5 - params.calmY];
  // the sphere is big and sits across the frame from the calm area, running off the far edge
  const R = clamp(0.46 * params.size * (0.92 + 0.16 * r()), 0.2, 0.75);
  const sx = C[0] > 0.08 * asp ? -1 : C[0] < -0.08 * asp ? 1 : (r() < 0.5 ? -1 : 1);
  const fx = sx * (asp / 2 - R * (0.5 + 0.25 * r()));
  const fy = Math.abs(C[1]) > 0.12 ? -Math.sign(C[1]) * (0.5 - R * (0.55 + 0.25 * r())) : (r() - 0.5) * 0.3;
  const lightA = Math.atan2(C[1] - fy + 0.35, C[0] - fx) + (r() - 0.5) * 0.3;
  // the hills rise from the calm area toward its far corner
  const corners = [[-asp / 2, -0.5], [asp / 2, -0.5], [-asp / 2, 0.5], [asp / 2, 0.5]];
  const far = corners.reduce((a, b) => (Math.hypot(b[0] - C[0], b[1] - C[1]) > Math.hypot(a[0] - C[0], a[1] - C[1]) ? b : a));
  const span = Math.max(0.3, Math.hypot(far[0] - C[0], far[1] - C[1]));
  return { mode, C, R, fx, fy, lightA, far, span };
}

function uniforms({ palette, params, seed, rng: r, width, height }) {
  const k = inkOf(palette, params);
  const P = lin(palette.bg);
  const base = k.sub ? P : P.map(v => 1 - v);
  const T = lin(k.ink).map((v, i) => (k.sub ? clamp(v / Math.max(P[i], 1e-4), 0, 1) : clamp((1 - v) / Math.max(1 - P[i], 1e-4), 0, 1)));
  const L = layout(params, r, width && height ? width / height : 4 / 3, seed);
  return {
    u_base: base, u_sub: k.sub ? 1 : 0, u_T: T, u_mode: L.mode,
    u_form: [L.fx, L.fy, L.R], u_lightA: L.lightA, u_angR: (params.angle + 90) * Math.PI / 180, // the lines' normal
    u_calmP: L.C, u_dir: [(L.far[0] - L.C[0]) / L.span, (L.far[1] - L.C[1]) / L.span], u_span: L.span,
  };
}

// CSS fallback: an SVG of line screens whose width steps with the tone, laid out like the shader (the
// sphere across from the calm area, or the hills rising away from it)
const svgUrl = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const f1 = v => +v.toFixed(1);
function fallback({ palette: P, params: prm, seed, rng: r, width, height }) {
  const W = Math.max(40, Math.round(width || 800)), H = Math.max(40, Math.round(height || 600));
  const { sub, ink } = inkOf(P, prm);
  const L = layout(prm, r, W / H, seed);
  const px = (x, y) => [f1(W / 2 + x * H), f1(H / 2 - y * H)];
  const pitch = Math.max(4, prm.pitch);
  const N = 6;
  let grad;
  if (L.mode === 0) {
    const [cx, cy] = px(L.fx, L.fy);
    const [hx, hy] = px(L.fx + Math.cos(L.lightA) * L.R * 0.45, L.fy + Math.sin(L.lightA) * L.R * 0.45);
    grad = (id, stops) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${f1(L.R * H)}" fx="${hx}" fy="${hy}">${stops}</radialGradient>`;
  } else {
    const [x1, y1] = px(L.C[0], L.C[1]);
    const [x2, y2] = px(L.far[0], L.far[1]);
    grad = (id, stops) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
  }
  let defs = '', body = '';
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    let a = L.mode === 0 ? (sub ? 0.1 + 0.85 * t : 0.85 - 0.6 * t) : Math.max(0, (t - 0.15) / 0.85) * (sub ? 0.9 : 0.75);
    if (a < 0.04) continue;
    const w = f1(Math.max(0.6, pitch * (prm.minWidth + (prm.maxWidth - prm.minWidth) * a) * 0.9));
    const s = i / N, e = (i + 1) / N;
    const stop = (o, v) => `<stop offset="${Math.min(1, Math.max(0, o)).toFixed(3)}" stop-color="${v ? '#fff' : '#000'}"/>`;
    defs += `<pattern id="p${i}" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse" patternTransform="rotate(${-prm.angle})"><rect y="${f1((pitch - w) / 2)}" width="${pitch}" height="${w}" fill="${ink}"/></pattern>`;
    defs += grad(`g${i}`, stop(s - 0.002, 0) + stop(s, 1) + stop(e, 1) + stop(e + 0.002, 0));
    defs += `<mask id="m${i}"><rect width="${W}" height="${H}" fill="url(#g${i})"/></mask>`;
    body += `<rect width="${W}" height="${H}" fill="url(#p${i})" mask="url(#m${i})"/>`;
  }
  return `${svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`)} center / 100% 100% no-repeat, ${P.bg}`;
}

// a still plate draws once; with drift above 0 it runs, slowly
function holdStill(c, read) {
  let user = false, cur = read();
  const sync = () => ((user || cur.drift <= 0) ? c.pause() : c.resume());
  sync();
  return {
    pause() { user = true; sync(); },
    resume() { user = false; sync(); },
    set(next) { cur = c.set(next); sync(); return cur; },
    setPalette: p => c.setPalette(p),
    redraw: () => c.redraw(),
    destroy: () => c.destroy(),
    get canvas() { return c.canvas; },
    get info() { return { ...c.info, still: user || cur.drift <= 0 }; },
  };
}

export default {
  id: 'line-engraving',
  name: 'Line engraving',
  family: 'dither',
  params,
  mount(el, { palette, params: given, seed }) {
    const c = shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      crisp: true,
      maxDpr: 3,
      fps: 30,
      still: 0,
      fallback,
    });
    return holdStill(c, () => resolveParams(params, given));
  },
};
