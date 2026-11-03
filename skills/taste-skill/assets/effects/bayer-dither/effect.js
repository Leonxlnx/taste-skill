// bayer-dither: a large soft light drawn with an 8x8 ordered (Bayer) dither in two or three page
// colours. The light sits across the frame from the calm area, near the edge, and drifts slowly; the
// field under the dither is kept smooth so the pattern bands read clean (solid core, checker, sparse
// dots, nothing) instead of turning into speckle.
import { shader, color, grainCSS, paletteKind } from '../fx.js';

const params = {
  speed:     { default: 0.4,  min: 0,   max: 2,   step: 0.01 }, // drift speed
  pixel:     { default: 2,    min: 1,   max: 8,   step: 1 },    // dither pixel size in CSS px
  tones:     { default: 3,    min: 2,   max: 3,   step: 1 },    // colours used: bg, (mid), top
  intensity: { default: 0.9,  min: 0,   max: 1.5, step: 0.01 }, // overall strength of the light
  spread:    { default: 0.6,  min: 0.1, max: 1,   step: 0.01 }, // size of the light
  ramp:      { default: 0.15, min: 0,   max: 1,   step: 0.01 }, // share of a straight ramp from the calm side
  detail:    { default: 0.4,  min: 0,   max: 1,   step: 0.01 }, // slow organic bending of the light
  scale:     { default: 0.4,  min: 0,   max: 1,   step: 0.01 }, // size of that bending
  ink:       { default: 0,    min: 0,   max: 1,   step: 1 },    // 1 uses the ink colour instead of the accent
  calm:      { default: 0.55, min: 0,   max: 1,   step: 0.01 }, // empty area where text sits
  calmX:     { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:     { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
void main() {
  float cell = max(1.0, u_cell);
  vec2 id = floor(gl_FragCoord.xy / cell);
  vec2 cpx = (id + 0.5) * cell;                          // centre of this dither pixel
  vec2 uv = vec2(cpx.x / u_res.x, 1.0 - cpx.y / u_res.y);
  vec2 p = (cpx - 0.5 * u_res) / u_res.y;
  float t = u_time * u_speed * 0.05 + u_seed * 0.13;

  // slow, low-frequency bend of space: organic edges, while the dither bands stay clean
  float fq = 0.6 + 1.6 * u_scale;
  vec2 w = vec2(fx_noise(p * fq + vec2(t, 1.7)), fx_noise(p * fq + vec2(4.3, -0.8 * t)));
  vec2 q = p + w * 0.24 * u_detail;

  // the light: a large elliptical glow that drifts and breathes a little
  vec2 lp = u_light.xy + 0.05 * vec2(sin(t * 1.3), cos(t * 0.9 + 1.7));
  vec2 d = q - lp;
  d = vec2(d.x * u_rot.x + d.y * u_rot.y, -d.x * u_rot.y + d.y * u_rot.x);
  d.y /= u_light.w;
  float rad = u_light.z * (0.3 + 0.9 * u_spread) * (1.0 + 0.05 * sin(t * 2.3));
  float r = length(d) / rad;
  float glow = exp(-r * r * 1.9);

  // a straight ramp that rises from the calm side toward the light
  vec2 dir = normalize(u_light.xy - u_calmP + 1e-4);
  float ramp = clamp(dot(q - u_calmP, dir) / (length(u_light.xy - u_calmP) + 0.35), 0.0, 1.0);

  float f = mix(glow, ramp * ramp, u_ramp);
  // a faint, broad variation in strength (not speckle)
  f *= 1.0 + 0.3 * u_detail * fx_noise(q * 1.3 - vec2(0.5 * t, 2.1));

  // keep the text area empty
  f *= 1.0 - clamp(u_calm * 1.6, 0.0, 1.0) * fx_calm(uv, vec2(u_calmX, u_calmY), 0.4 + 0.5 * u_calm);
  // a small solid core at full intensity; faint tails fall to the plain background
  f = clamp((f * u_intensity * 1.12 - 0.035) / 0.965, 0.0, 1.0);

  // ordered dither into the tones
  float levels = u_tones - 1.0;
  float v = f * levels;
  float i = floor(v);
  float idx = min(i + step(fx_bayer(id) + 0.5 / 64.0, v - i), levels);
  vec3 col = u_t0;
  if (levels < 1.5) { if (idx > 0.5) col = u_t2; }
  else if (idx > 1.5) col = u_t2;
  else if (idx > 0.5) col = u_t1;
  fxColor = vec4(col, 1.0);
}
`;

function tones(P, prm) {
  const { bg, ink, accent } = P;
  // on a coloured ground an accent of a far hue (yellow on cobalt) buzzes as a checker; the light
  // there is drawn in the ink with a touch of the accent instead
  const clash = paletteKind(P) === 'colour' && color.hueDistance(bg, accent) > 90;
  const top = prm.ink >= 0.5 ? ink : clash ? color.mix(ink, accent, 0.22) : accent;
  const neutral = color.chroma(bg) < 0.035;
  const fits = neutral || color.chroma(top) < 0.035 || color.hueDistance(bg, top) < 55;
  // the middle tone: a perceptual mix, or a lighter or darker step of the background when the
  // two hues would turn muddy together
  const mid = fits ? color.mix(bg, top, 0.42) : color.withLightness(bg, (color.lab(bg)[0] * 3 + color.lab(top)[0] * 2) / 5);
  return [bg, mid, top];
}

function uniforms({ palette, params, rng, dpr, width, height }) {
  const r = rng;
  const [t0, t1, t2] = tones(palette, params);
  const asp = width && height ? width / height : 1.6;
  // calm area in centred height units (y up)
  const cx = (params.calmX - 0.5) * asp, cy = 0.5 - params.calmY;
  // the light sits across the frame from the calm area, between two thirds of the way and the edge
  let ang = Math.hypot(cx, cy) < 0.06 ? r() * Math.PI * 2 : Math.atan2(-cy, -cx);
  ang += (r() - 0.5) * 0.6;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const edge = Math.min(Math.abs(dx) > 1e-3 ? asp / 2 / Math.abs(dx) : 1e9, Math.abs(dy) > 1e-3 ? 0.5 / Math.abs(dy) : 1e9);
  const k = 0.62 + 0.36 * r();
  const rot = r() * Math.PI;
  return {
    u_t0: color.vec3(t0),
    u_t1: color.vec3(t1),
    u_t2: color.vec3(t2),
    u_cell: Math.max(1, Math.round(params.pixel * dpr)),
    // x, y, radius, roundness (1 a circle, lower an ellipse)
    u_light: [dx * edge * k, dy * edge * k, 0.72 + 0.28 * r(), 0.7 + 0.3 * r()],
    u_rot: [Math.cos(rot), Math.sin(rot)],
    u_calmP: [cx, cy],
  };
}

export default {
  id: 'bayer-dither',
  name: 'Bayer dither',
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
      fallback: ({ palette: P, params: prm }) => {
        const [t0, t1] = tones(P, prm);
        return `${grainCSS(0.06, 1.4)}, radial-gradient(70% 90% at ${(1 - prm.calmX) * 100}% ${(1 - prm.calmY) * 100}%, ${t1}, transparent 70%), ${t0}`;
      },
    });
  },
};
