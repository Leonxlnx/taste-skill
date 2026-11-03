// silk-folds: a satin surface in one page colour with two or three large soft folds. The folds are a
// few low sines across a rotated axis whose spacing and phase bend with slow noise; the sheen is
// anisotropic (narrower across the folds than along them) and broad, so it lies over each crest like
// light on satin. All shading is done in OKLab: the light raises lightness and lowers chroma at a fixed
// hue, and colours outside sRGB lose chroma, never hue (so a blue cloth never turns violet).
import { shader, color } from '../fx.js';

const params = {
  tone:   { default: 0,    min: 0,   max: 2,   step: 1 },     // 0 auto (accent, or the ground when the accent is too pale), 1 accent, 2 ground
  scale:  { default: 1,    min: 0.4, max: 2.5, step: 0.01 },  // size of the folds
  folds:  { default: 0.6,  min: 0,   max: 1,   step: 0.01 },  // depth of the folds
  sheen:  { default: 0.6,  min: 0,   max: 1,   step: 0.01 },  // strength of the satin highlight
  speed:  { default: 0.05, min: 0,   max: 0.4, step: 0.005 }, // how fast the cloth moves
  grain:  { default: 0.02, min: 0,   max: 0.1, step: 0.005 }, // fine grain against banding
  angle:  { default: 25,   min: -90, max: 90,  step: 1 },     // direction of the folds, 0 vertical
  calm:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 },  // smooth, quiet cloth where text sits
  calmX:  { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:  { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// gradient noise with its analytic derivative: (value, d/dx, d/dy)
vec3 nd(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = fx_grad(i), gb = fx_grad(i + vec2(1.0, 0.0)), gc = fx_grad(i + vec2(0.0, 1.0)), gd = fx_grad(i + vec2(1.0, 1.0));
  float va = dot(ga, f), vb = dot(gb, f - vec2(1.0, 0.0)), vc = dot(gc, f - vec2(0.0, 1.0)), vd = dot(gd, f - vec2(1.0, 1.0));
  float k4 = va - vb - vc + vd;
  float v = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k4;
  vec2 d = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k4 + vec2(vb, vc) - va);
  return vec3(v, d);
}

// OKLab -> linear sRGB
vec3 labLin(vec3 lab) {
  vec3 lms = vec3(lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z,
                  lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z,
                  lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z);
  lms = lms * lms * lms;
  return vec3(dot(lms, vec3(4.0767416621, -3.3077115913, 0.2309699292)),
              dot(lms, vec3(-1.2684380046, 2.6097574011, -0.3413193965)),
              dot(lms, vec3(-0.0041960863, -0.7034186147, 1.7076147010)));
}
bool inside(vec3 c) { return all(greaterThanEqual(c, vec3(-0.001))) && all(lessThanEqual(c, vec3(1.001))); }
// OKLab -> sRGB, keeping lightness and hue: chroma is reduced until the colour fits
vec3 toRGB(vec3 lab) {
  lab.x = clamp(lab.x, 0.0, 1.0);
  vec3 c = labLin(lab);
  if (!inside(c)) {
    float lo = 0.0, hi = 1.0;
    for (int i = 0; i < 7; i++) {
      float k = 0.5 * (lo + hi);
      if (inside(labLin(vec3(lab.x, lab.yz * k)))) lo = k; else hi = k;
    }
    c = labLin(vec3(lab.x, lab.yz * lo));
  }
  return fx_srgb(c);
}

void main() {
  vec2 uv = fx_uv();
  vec2 p = fx_p() / u_scale;
  float t = u_time * u_speed + u_seed * 0.0173;

  // fold frame: a runs across the folds, b along them
  float ang = radians(u_angle);
  vec2 T = vec2(sin(ang), cos(ang));
  vec2 A = vec2(T.y, -T.x);
  float a = dot(p, A), b = dot(p, T);

  // calm area: flatter cloth, no sheen, a lightness the page text reads on
  float m = fx_calm(uv, vec2(u_calmX, u_calmY), 0.45 + 0.45 * u_calm) * u_calm;
  float mm = smoothstep(0.0, 0.5, m);
  float depth = (0.12 + 0.32 * u_folds) * (1.0 - 0.8 * mm);

  // uneven spacing: the across coordinate is stretched and squeezed by slow noise
  vec3 wv = nd(vec2(a * 0.9 + 5.0, b * 0.35 - t * 0.6));
  float aw = a + 0.2 * wv.x;
  float dawA = 1.0 + 0.2 * 0.9 * wv.y, dawB = 0.2 * 0.35 * wv.z;

  // folds gather a little toward one end, like hanging cloth
  float fan = 1.0 + 0.36 * b;
  float af = aw * fan;
  vec2 dAF = vec2(fan * dawA, fan * dawB + 0.36 * aw);   // (d/da, d/db)

  // slow bends of each fold, from noise along the fold and time
  vec3 w1 = nd(vec2(b * 0.75 + 3.1, a * 0.3 + t * 2.0));
  vec3 w2 = nd(vec2(b * 1.1 - 7.3, a * 0.45 - t * 1.6 + 5.0));
  float ph1 = 2.1 * w1.x, ph2 = 2.4 * w2.x;
  vec2 dph1 = 2.1 * vec2(0.3 * w1.z, 0.75 * w1.y);
  vec2 dph2 = 2.4 * vec2(0.45 * w2.z, 1.1 * w2.y);

  float f1 = 7.4, f2 = 12.9, f3 = 3.9;
  float s1 = f1 * af + ph1 + t * 1.7;
  float s2 = f2 * af + ph2 - t * 1.2 + 1.3;
  float s3 = f3 * af + 0.8 * ph2 + 2.2;
  // the second fold set comes and goes along the cloth, so the folds are not a row of equal stripes
  float k2 = 0.22 + 0.3 * (0.5 + 0.5 * w1.x);
  float h = sin(s1) + k2 * sin(s2) + 0.6 * sin(s3);
  vec2 dh = cos(s1) * (f1 * dAF + dph1) + k2 * cos(s2) * (f2 * dAF + dph2) + 0.6 * cos(s3) * (f3 * dAF + 0.8 * dph2);
  float hs = h - 0.12 * h * h;
  dh *= 1.0 - 0.24 * h;

  vec2 g = (A * dh.x + T * dh.y) * depth / 4.6;
  vec3 n = normalize(vec3(-g, 1.0));

  // light from the upper left, the viewer straight ahead
  vec3 L = normalize(vec3(-0.5, 0.62, 0.6));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float diff = clamp((dot(n, L) + 0.25) / 1.25, 0.0, 1.0);
  diff = diff * diff * (3.0 - 2.0 * diff);

  // anisotropic sheen, broad: wider across the folds than a thin line, long along them
  vec3 X = normalize(vec3(A, 0.0) - n * dot(vec3(A, 0.0), n));
  vec3 Y = normalize(cross(n, X));
  float hx = dot(H, X), hy = dot(H, Y), hn = max(dot(H, n), 0.05);
  float spec = exp(-(hx * hx / 0.034 + hy * hy / 0.9) / (hn * hn));
  float broad = exp(-(hx * hx / 0.14 + hy * hy / 1.8) / (hn * hn));
  float sk = u_sheen * (1.0 - mm);

  float ao = 0.84 + 0.16 * smoothstep(-1.4, 0.8, hs);

  // shading in OKLab: lightness follows the light, chroma a little; the sheen lifts lightness and
  // gives up chroma at the same hue
  float I = mix(u_shadowK, 1.0, diff) * ao;
  float Lc = u_base.x * mix(0.62, 1.08, I);
  vec2 ab = u_base.yz * mix(0.82, 1.0, I);
  float sh = clamp(spec * 0.62 + broad * 0.28, 0.0, 1.0) * sk;
  Lc += (u_sheenL - Lc) * sh;
  ab *= 1.0 - 0.55 * sh;
  // a violet-leaning blue turns toward azure as the sheen lightens it (0 for every other hue)
  float tu = u_turn * sh;
  ab = mat2(cos(tu), sin(tu), -sin(tu), cos(tu)) * ab;
  // calm: lightness moves to the readable tone, keeping a trace of the shading
  Lc = mix(Lc, u_calmL + (Lc - u_base.x) * 0.15, mm);
  ab = mix(ab, u_calmAB, mm);
  vec3 col = toRGB(vec3(Lc, ab));
  col += fx_grain(gl_FragCoord.xy, floor(u_time * 24.0)) * u_grain * 0.3;
  fxColor = vec4(fx_dither(col), 1.0);
}
`;

// a light tint of a blue that leans violet (OKLCH hue 255..300) reads periwinkle or lavender, and one
// of a purple-magenta (300..340) reads orchid: turn them toward azure and pink. Deep shades keep hue.
function cool(c) {
  const [L, C, h] = color.lch(c);
  if (C < 0.03 || L < 0.55) return c;
  if (h > 255 && h < 300) return color.fromLch([L, C, Math.max(238, h - 26)]);
  if (h >= 300 && h < 340) return color.fromLch([L, C, Math.min(352, h + 20)]);
  return c;
}
// how far (radians) the sheen turns the hue of a violet-leaning blue toward azure as it lightens
function sheenTurn(c) {
  const [, C, h] = color.lch(c);
  if (C < 0.03 || h <= 250 || h >= 340) return 0;
  if (h < 300) return -((Math.min(18, h - 238) * Math.PI) / 180);
  return (Math.min(16, 352 - h) * Math.PI) / 180;
}

function tones(P, prm, kind) {
  const { bg, ink, muted, accent } = P;
  const La = color.lab(accent)[0];
  // auto: the accent, unless it is too pale to carry shadows (a yellow, a pastel), or the page is a
  // colour with dark text (a mustard page): then the page colour, which that text already reads on
  const darkText = color.lab(ink)[0] < color.lab(bg)[0];
  const useGround = prm.tone >= 1.5 || (prm.tone < 0.5 && color.chroma(bg) > 0.04 && (La > 0.82 || (kind === 'colour' && darkText)));
  let base = useGround ? bg : accent;
  if (kind === 'light' && !useGround) {
    // on a light page the cloth is a muted tint of the accent, not a full-strength panel of it (made
    // from the accent alone: mixed with a page colour of another hue it would turn grey or mauve)
    const Lm = color.lab(color.mix(bg, accent, 0.42))[0];
    const Ca = color.chroma(accent);
    base = cool(color.fromLch([Math.min(0.8, Math.max(0.68, Lm)), Math.min(0.11, Math.max(Ca * 0.55, Math.min(Ca, 0.05))), color.lch(accent)[2]]));
  }
  const [L] = color.lab(base);
  // keep the cloth in a range where both the shadows and the sheen can show; on a dark page a
  // deeper shade of the colour, so the cloth does not glare
  const top = kind === 'dark' ? 0.5 : 0.8;
  if (L > top) base = color.withLightness(base, top);
  if (L < 0.3) base = color.withLightness(base, 0.3);
  const Lb = color.lab(base)[0];
  // the readable tone for the calm area: the cloth's lightness moved away from the page text
  const dir = color.lab(ink)[0] > Lb ? -1 : 1;
  let calm = base;
  const mutedGoal = Math.min(4.5, color.contrast(bg, muted) * 0.95);
  for (let i = 0; i < 40 && (color.contrast(calm, ink) < 5.5 || color.contrast(calm, muted) < mutedGoal); i++) calm = color.lighten(calm, dir * 0.012);
  // the calm tone keeps the cloth's hue, turned out of lavender if lifting it made it periwinkle
  const calmLab = color.lab(cool(calm));
  return {
    base,
    turn: sheenTurn(base),
    calmL: calmLab[0],
    calmAB: [calmLab[1], calmLab[2]],
    shadowK: kind === 'dark' ? 0.26 : 0.34,
    sheenL: Math.min(0.96, Lb + (kind === 'dark' ? 0.32 : 0.24)),
  };
}

function uniforms({ palette, params, kind }) {
  const t = tones(palette, params, kind);
  return { u_base: color.labVec(t.base), u_calmL: t.calmL, u_calmAB: t.calmAB, u_shadowK: t.shadowK, u_sheenL: t.sheenL, u_turn: t.turn };
}

export default {
  id: 'silk-folds',
  name: 'Silk folds',
  family: 'material',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      still: 6,
      fallback: ({ palette: P, params: prm, kind }) => {
        const b = tones(P, prm, kind).base;
        const lo = color.darken(b, 0.1), hi = color.adjust(b, { l: 0.1, c: 0.7 });
        return `linear-gradient(${115 + prm.angle}deg, ${lo} 0%, ${b} 24%, ${hi} 36%, ${b} 50%, ${lo} 64%, ${b} 80%, ${hi} 92%, ${b} 100%)`;
      },
    });
  },
};
