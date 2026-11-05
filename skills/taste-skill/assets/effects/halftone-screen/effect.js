// halftone-screen: a big soft form (a gradient hill, slow noise or a lit sphere) printed as a rotated
// screen of round dots whose area follows the tone, like a zoomed-in magazine print. One ink on paper,
// or two at their own screen angles. The seed picks the form unless `source` names one; the
// panel-filling ones come up most often.
import { shader, color, rng } from '../fx.js';

const params = {
  cell:      { default: 10,   min: 5,   max: 24,  step: 0.5 },  // screen cell, CSS px
  angle:     { default: 30,   min: 0,   max: 90,  step: 1 },    // screen angle, degrees
  source:    { default: -1,   min: -1,  max: 2,   step: 1 },    // -1 the seed picks, 0 sphere, 1 gradient hill, 2 slow noise
  secondInk: { default: 0,    min: 0,   max: 1,   step: 1 },    // 1 adds the accent on its own screen, 45 degrees on
  contrast:  { default: 1.4,  min: 0.6, max: 3,   step: 0.01 }, // empties the highlights, merges the shadows
  gooey:     { default: 0,    min: 0,   max: 1,   step: 0.01 }, // dots melt into their neighbours
  size:      { default: 1,    min: 0.5, max: 1.6, step: 0.01 }, // size of the form
  drift:     { default: 0.02, min: 0,   max: 0.2, step: 0.005 },// slow wandering of the light; 0 is still
  calm:      { default: 0.5,  min: 0,   max: 1,   step: 0.01 }, // empties the text area
  calmX:     { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:     { default: 0.6,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

vec2 formC() { float t = u_time * u_drift; return u_form.xy + 0.012 * vec2(sin(t * 3.0), cos(t * 2.3)); }

// ink amount 0..1 (share of the cell the dot covers) at p, centred height units, y up. kind 0 is the
// form or field, kind 1 the sphere's cast shadow. On dark paper the ink is the light.
float amount(vec2 p, float kind) {
  float t = u_time * u_drift;
  float a = 0.0;
  float calmK = 1.0, cK = 1.0;
  if (u_mode < 0.5) {
    vec2 c = formC();
    float R = u_form.z;
    float ph = u_lightA + 0.5 * sin(t * 5.0);
    vec3 L = normalize(vec3(cos(ph), sin(ph), 0.9));
    if (kind > 0.5) {
      vec2 sc = c + vec2(-L.x * 0.55 * R, -0.96 * R);
      vec2 e = (p - sc) / (R * vec2(1.25, 0.24));
      a = 0.55 * exp(-dot(e, e) * 1.3);
    } else {
      vec2 r = (p - c) / R;
      float l = length(r);
      if (l > 0.995) r *= 0.995 / l;          // cells across the rim take the tone just inside it
      vec3 n = vec3(r, sqrt(max(1.0 - dot(r, r), 0.0)));
      float lam = max(dot(n, L), 0.0);
      float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 4.0);   // wide and soft
      // the lit body reaches about 0.85 and the highlight is wide and soft, so the lit side keeps fine
      // dots and only a small spot is bare paper (no bowling ball, no paper hole)
      float lit = 0.05 + 0.72 * lam + 0.18 * spec;
      float rim = pow(1.0 - n.z, 2.5);
      // on paper the limb darkens a little so the round edge reads on the lit side too
      a = u_sub > 0.5 ? 1.0 - lit + 0.25 * rim * lam : lit + 0.04 * rim * (1.0 - lam);
    }
    calmK = 0.5;                               // the form sits away from the text already
    cK = 0.5;                                  // and its tones are not pushed as hard
  } else if (u_mode < 1.5) {
    float s = dot(p - u_calmP, u_dir) / u_span;
    s += 0.18 * fx_noise(p * 1.3 + vec2(t * 2.0, 2.0)) + 0.06 * fx_noise(p * 3.1 - t);
    a = smoothstep(0.08, 1.0, s);
  } else {
    float s = dot(p - u_calmP, u_dir) / u_span;
    float n = fx_fbm(p * 1.25 + vec2(t * 2.0, -t * 1.4) + u_seed * 0.01);
    a = smoothstep(0.1, 0.75, n * 0.75 + s * 0.85 - 0.12);
  }
  vec2 uv = vec2(p.x * u_res.y / u_res.x + 0.5, 0.5 - p.y);
  float m = fx_calm(uv, vec2(u_calmX, u_calmY), 0.3 + 0.55 * u_calm) * u_calm * calmK;
  a *= 1.0 - min(1.0, 1.8 * m);
  // the deepest tone keeps paper gaps between the dots (on dark paper a wider margin, or it goes solid)
  return clamp((a - 0.42) * mix(1.0, u_contrast, cK) + 0.42, 0.0, 1.0) * u_cap;
}

// dot radius in cell units for an ink share: area-true up to touching dots, then closing the gaps
float dotR(float a) { return a <= 0.002 ? -1.0 : (a < 0.785 ? sqrt(a * 0.31831) : 0.5 + (a - 0.785) * 0.963); }
vec2 cellP(vec2 cell, float ang) { vec2 cq = rot((cell + 0.5) * u_cellPx, -ang); return (cq * u_dpr - 0.5 * u_res) / u_res.y; }

// signed distance (cell units) to the dot of one cell; the dot carries the tone of its centre
float dotD(vec2 g, vec2 cell, float ang, float second, float kind) {
  float a = amount(cellP(cell, ang), kind);
  // duotone: the accent plate carries the whole form, lighter; the ink plate only the shadows
  if (second > 0.5) a = min(0.7, 0.85 * a);
  else if (u_secondInk > 0.5) a = smoothstep(0.36 * u_cap, u_cap, a) * u_cap;
  return length(g - cell - 0.5) - dotR(a);
}

// Loops counted by a uniform. Written out call by call, amount() was inlined 16 times (4 cells x 2
// kinds x 2 plates) and the D3D compiler behind Chrome on Windows took about 40 s on it, freezing
// the page. WebGL2 runs these as real loops; WebGL1 needs a constant bound.
#if __VERSION__ >= 300
#define HT_FOR(i, n, most) for (int i = 0; i < int(n); i++)
#else
#define HT_FOR(i, n, most) for (int i = 0; i < most; i++) if (float(i) < (n))
#endif

float screenCov(vec2 q, float ang, float second, float kind) {
  vec2 g = rot(q, ang) / u_cellPx;
  vec2 cell = floor(g);
  float k = u_gooey * 0.6;
  vec2 f = fract(g) - 0.5;
  vec2 sx = vec2(f.x < 0.0 ? -1.0 : 1.0, 0.0), sy = vec2(0.0, f.y < 0.0 ? -1.0 : 1.0);
  float d = 1e3;
  // the cell's own dot, then (gooey) the three neighbours it melts into
  HT_FOR(j, u_gooey > 0.0 ? 4.0 : 1.0, 4) {
    vec2 o = j == 0 ? vec2(0.0) : j == 1 ? sx : j == 2 ? sy : sx + sy;
    float dj = dotD(g, cell + o, ang, second, kind);
    d = j == 0 ? dj : smin(d, dj, k);
  }
  float aa = 0.7 / (u_cellPx * u_dpr);
  return smoothstep(aa, -aa, d);
}

void main() {
  vec2 q = gl_FragCoord.xy / u_dpr;
  float ang = u_angle * 0.0174533;
  float inside = 1.0;
  if (u_mode < 0.5) inside = clamp(0.5 - (length(fx_p() - formC()) - u_form.z) * u_res.y, 0.0, 1.0);
  // passes: the ink plate's form and cast shadow, then the accent plate's (45 degrees on). The
  // sphere's dots stop at its antialiased round edge and the shadow's dots outside it, so the
  // silhouette is a clean circle, not a staircase of cells.
  float c1 = 0.0, c2 = 0.0;
  HT_FOR(i, u_secondInk > 0.5 ? 4.0 : 2.0, 4) {
    float second = i >= 2 ? 1.0 : 0.0;
    float kind = (i == 1 || i == 3) ? 1.0 : 0.0;
    float w = kind < 0.5 ? (u_mode > 0.5 ? 1.0 : inside) : (u_mode < 0.5 && u_sub > 0.5 ? 1.0 - inside : 0.0);
    if (w > 0.0) {
      float c = w * screenCov(q, ang + 0.7854 * second, second, kind);
      if (second > 0.5) c2 += c; else c1 += c;
    }
  }
  // transparent inks overprint (inverted for light inks on dark paper)
  vec3 b = u_base;
  b *= mix(vec3(1.0), u_T2, c2);
  b *= mix(vec3(1.0), u_T1, c1);
  vec3 col = fx_srgb(u_sub > 0.5 ? b : 1.0 - b);
  fxColor = vec4(fx_dither(col), 1.0);
}
`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lin = c => color.rgb(c).map(v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));

function inks(P) {
  const { bg, ink, accent } = P;
  const Lp = color.lab(bg)[0];
  const sub = color.lab(ink)[0] < Lp;
  const side = c => {
    const L = color.lab(c)[0];
    if (sub) return L < Lp - 0.12 ? c : color.withLightness(c, Math.max(0.25, Lp - 0.3));
    // a near-white ink on dark paper reads as heavy white dots: print it as a light tint of itself
    if (L > Lp + 0.55) return color.mix(bg, c, 0.72);
    return L > Lp + 0.12 ? c : color.withLightness(c, Math.min(0.94, Lp + 0.32));
  };
  return { sub, ink: side(ink), second: side(accent) };
}

// where things go, in centred height units (y up); shared by the shader and the CSS fallback
function layout(params, r, asp, seed) {
  // its own stream, so neighbouring seeds (and the other effects on the page) do not pick alike
  const pick = rng(`halftone-screen:pick:${seed}`)();
  const mode = params.source >= 0 ? Math.round(params.source) : pick < 0.22 ? 0 : pick < 0.6 ? 1 : 2;
  const C = [(params.calmX - 0.5) * asp, 0.5 - params.calmY];
  // the sphere is big and sits across the frame from the calm area, running off the far edge
  const R = clamp(0.46 * params.size * (0.92 + 0.16 * r()), 0.2, 0.75);
  const sx = C[0] > 0.08 * asp ? -1 : C[0] < -0.08 * asp ? 1 : (r() < 0.5 ? -1 : 1);
  const fx = sx * (asp / 2 - R * (0.5 + 0.25 * r()));
  const fy = Math.abs(C[1]) > 0.12 ? -Math.sign(C[1]) * (0.5 - R * (0.55 + 0.25 * r())) : (r() - 0.5) * 0.3;
  // the light comes from the calm side and from above
  const lightA = Math.atan2(C[1] - fy + 0.35, C[0] - fx) + (r() - 0.5) * 0.3;
  // the fields rise from the calm area toward its far corner
  const corners = [[-asp / 2, -0.5], [asp / 2, -0.5], [-asp / 2, 0.5], [asp / 2, 0.5]];
  const far = corners.reduce((a, b) => (Math.hypot(b[0] - C[0], b[1] - C[1]) > Math.hypot(a[0] - C[0], a[1] - C[1]) ? b : a));
  const span = Math.max(0.3, Math.hypot(far[0] - C[0], far[1] - C[1]));
  return { mode, C, R, fx, fy, lightA, far, span };
}

function uniforms({ palette, params, seed, rng: r, width, height }) {
  const k = inks(palette);
  const P = lin(palette.bg);
  const base = k.sub ? P : P.map(v => 1 - v);
  const T = [k.ink, k.second].map(c => lin(c).map((v, i) => (k.sub ? clamp(v / Math.max(P[i], 1e-4), 0, 1) : clamp((1 - v) / Math.max(1 - P[i], 1e-4), 0, 1))));
  const L = layout(params, r, width && height ? width / height : 4 / 3, seed);
  return {
    u_base: base, u_sub: k.sub ? 1 : 0, u_T1: T[0], u_T2: T[1],
    u_mode: L.mode, u_cap: k.sub ? 0.9 : 0.6,
    u_form: [L.fx, L.fy, L.R], u_lightA: L.lightA,
    u_calmP: L.C, u_dir: [(L.far[0] - L.C[0]) / L.span, (L.far[1] - L.C[1]) / L.span], u_span: L.span,
    u_cellPx: params.cell,
  };
}

// CSS fallback: an SVG of dot screens whose dot size steps with the tone, laid out like the shader
// (the sphere across from the calm area, or the field rising away from it)
const svgUrl = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const f1 = v => +v.toFixed(1);
function fallback({ palette: P, params: prm, seed, rng: r, width, height }) {
  const W = Math.max(40, Math.round(width || 800)), H = Math.max(40, Math.round(height || 600));
  const k = inks(P);
  const L = layout(prm, r, W / H, seed);
  const px = (x, y) => [f1(W / 2 + x * H), f1(H / 2 - y * H)];
  const cell = Math.max(6, prm.cell);
  const cap = k.sub ? 0.85 : 0.55;
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
    // tone along the gradient: the sphere darkens from its highlight to the rim on paper (on dark
    // paper the light ink fades instead); the field rises from the calm area
    const t = (i + 0.5) / N;
    let a = L.mode === 0 ? (k.sub ? 0.08 + 0.9 * t : 0.75 - 0.6 * t) : Math.max(0, (t - 0.18) / 0.82);
    a = Math.min(cap, a);
    if (a < 0.03) continue;
    const rad = f1(cell * Math.sqrt(Math.min(a, 0.78) / Math.PI));
    const s = i / N, e = (i + 1) / N;
    const stop = (o, v) => `<stop offset="${Math.min(1, Math.max(0, o)).toFixed(3)}" stop-color="${v ? '#fff' : '#000'}"/>`;
    defs += `<pattern id="p${i}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse" patternTransform="rotate(${-prm.angle})"><circle cx="${cell / 2}" cy="${cell / 2}" r="${rad}" fill="${k.ink}"/></pattern>`;
    defs += grad(`g${i}`, stop(s - 0.002, 0) + stop(s, 1) + stop(e, 1) + stop(e + 0.002, 0));
    defs += `<mask id="m${i}"><rect width="${W}" height="${H}" fill="url(#g${i})"/></mask>`;
    body += `<rect width="${W}" height="${H}" fill="url(#p${i})" mask="url(#m${i})"/>`;
  }
  return `${svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`)} center / 100% 100% no-repeat, ${P.bg}`;
}

export default {
  id: 'halftone-screen',
  name: 'Halftone screen',
  family: 'dither',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      crisp: true,
      maxDpr: 3,
      fps: 30,
      still: 2,
      fallback,
    });
  },
};
