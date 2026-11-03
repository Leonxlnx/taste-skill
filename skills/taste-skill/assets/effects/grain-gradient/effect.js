// grain-gradient: a soft tonal ramp and three blobs of the page colours, mixed in OKLab, under fine
// film grain and a grainy dissolve between the colours (the sand-print look).
import { shader, color, fallbackCSS } from '../fx.js';

const params = {
  speed:       { default: 0.5,  min: 0, max: 2, step: 0.01 },  // how fast the shapes drift
  softness:    { default: 0.45, min: 0, max: 1, step: 0.01 },  // size and edge softness of the blobs
  warp:        { default: 0.6,  min: 0, max: 1, step: 0.01 },  // slow organic bending of the shapes
  grain:       { default: 0.6,  min: 0, max: 1, step: 0.01 },  // film grain strength
  scatter:     { default: 0.5,  min: 0, max: 1, step: 0.01 },  // grainy dissolve between colours
  tint:        { default: 0.5,  min: 0, max: 1, step: 0.01 },  // how much accent enters
  contrast:    { default: 0.55, min: 0, max: 1, step: 0.01 },  // how far the colours move from the background
  calm:        { default: 0.5,  min: 0, max: 1, step: 0.01 },  // flatten the area where text sits
  calmX:       { default: 0.25, min: 0, max: 1, step: 0.01 },  // calm area centre, 0 left .. 1 right
  calmY:       { default: 0.7,  min: 0, max: 1, step: 0.01 },  // calm area centre, 0 top .. 1 bottom
  grainMotion: { default: 1,    min: 0, max: 1, step: 1 },     // 1 grain moves like film, 0 still grain
};

const frag = /* glsl */ `
float blobW(vec2 p, vec4 b, float t) {
  vec2 c = b.xy + 0.13 * vec2(sin(t + b.w), cos(t * 0.83 + b.w * 1.7));
  float r = length(p - c) / (b.z * (0.6 + 0.7 * u_softness));
  // flat core, then an edge from firm (exponent 6) to soft (exponent 2)
  return exp(-pow(r, 6.0 - 4.0 * u_softness) * 1.2);
}

// grainy dissolve in weight space: a blend weight is pushed up or down by this grain's own random
// value, most in the middle of a transition and not at all in flat areas, so colours meet in a fine
// stipple (the printed, sprayed edge) instead of a smooth fade
float dissolve(float w, float z) {
  return clamp(w + z * u_dissolve * 4.0 * w * (1.0 - w), 0.0, 1.0);
}

void main() {
  vec2 uv = fx_uv();
  vec2 p = fx_p();
  float t = u_time * u_speed * 0.12 + u_seed * 0.37;

  // grains are one CSS pixel (whole device pixels), so the texture looks the same at any DPR
  float gc = max(1.0, floor(u_dpr + 0.5));
  vec2 gp = floor(gl_FragCoord.xy / gc);
  float z = fx_hash(gp + vec2(17.0, 3.0)) + fx_hash(gp + vec2(511.0, 97.0)) - 1.0;

  // slow organic bend of the whole field
  vec2 q = p * 1.1 + u_seed * 0.0123;
  vec2 w = vec2(fx_noise(q + vec2(0.0, t * 0.9)), fx_noise(q * 1.1 + vec2(5.2, 1.3) - vec2(t * 0.7, 0.0)));
  p += w * 0.5 * u_warp;

  // tonal ramp: near colour at the calm side, far colour across the frame
  float s = dot(p - u_calmP, u_dir) / u_span;
  s += 0.22 * fx_noise(p * 1.6 + vec2(t * 0.5, 3.1));
  vec3 col = mix(u_kNear, u_kFar, dissolve(smoothstep(-0.1, 0.75, s), z));

  // blobs, painted in OKLab; each blob takes a different slice of the grain's randomness
  col = mix(col, u_k1, dissolve(blobW(p, u_b1, t), fract(z * 7.31 + 0.5) * 2.0 - 1.0));
  col = mix(col, u_k2, dissolve(blobW(p, u_b2, t * 0.9), fract(z * 3.17 + 0.25) * 2.0 - 1.0));
  col = mix(col, u_k0, dissolve(blobW(p, u_b0, t * 1.1), z));

  // calm area for text
  float m = fx_calm(uv, vec2(u_calmX, u_calmY), 0.35 + 0.4 * u_calm) * u_calm;
  col = mix(col, u_kNear, m);

  // film grain on lightness (24 frames a second when it moves)
  float frame = u_grainMotion > 0.5 ? floor(u_time * 24.0) : 0.0;
  // softer near pure white and black, where clipped grain reads as dirt
  float amp = u_grainAmp * u_grain * (1.0 - 0.6 * smoothstep(0.86, 1.0, col.x)) * (1.0 - 0.5 * smoothstep(0.22, 0.0, col.x));
  col.x += fx_grain(gp, frame) * amp;

  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

// every colour is a mix, shade or tint of a palette colour; no hue is invented
function tones(P, prm, kind) {
  const { bg, surface, ink, accent } = P;
  const c = prm.contrast, tn = prm.tint;
  const neutral = color.chroma(bg) < 0.035;
  // an accent that will not turn muddy when mixed with the background
  const acc = neutral || color.hueDistance(bg, accent) < 55 ? accent : color.withLightness(color.saturate(bg, 1.1), color.lab(accent)[0]);
  const [Lb] = color.lab(bg), [Li] = color.lab(ink);
  const away = Li > Lb ? -1 : 1; // the lightness direction that adds contrast to the ink
  const near = color.saturate(color.lighten(bg, away * (0.012 + 0.03 * c)), 1.1);
  if (kind === 'dark') {
    return {
      grain: 0.04,
      near,
      far: color.mix(bg, surface, 0.7 + 0.3 * c),
      k: [
        color.mix(bg, acc, 0.28 + 0.45 * tn),                       // glow
        color.mix(bg, acc, 0.1 + 0.2 * tn),                         // soft glow
        color.lighten(color.mix(surface, acc, 0.08 + 0.1 * tn), 0.015 + 0.04 * c), // tinted haze
      ],
    };
  }
  if (kind === 'colour') {
    return {
      grain: 0.05,
      near,
      far: color.lighten(bg, -away * (0.04 + 0.08 * c)),
      k: [
        color.mix(bg, acc, 0.25 + 0.45 * tn),                       // accent light
        color.mix(bg, ink, 0.06 + 0.1 * c),                         // pale
        color.saturate(color.lighten(bg, away * (0.035 + 0.06 * c)), 1.08), // deep field
      ],
    };
  }
  // light: a tone between ink and accent gives rich, clean shades instead of grey ones; mixing toward
  // a near-neutral ink loses chroma, so the shades get it back (the printed-pigment look, not grey)
  const tone = color.mix(ink, acc, 0.45 + 0.55 * tn);
  return {
    grain: 0.06,
    near,
    far: color.saturate(color.mix(bg, tone, 0.08 + 0.14 * c), 1.15),
    k: [
      color.saturate(color.mix(bg, acc, 0.22 + 0.5 * tn), 1.25),    // accent
      color.saturate(color.lighten(color.mix(bg, acc, 0.1), 0.03), 1.3), // pale light
      color.saturate(color.mix(bg, tone, 0.3 + 0.35 * c), 1.4),     // deep
    ],
  };
}

function uniforms({ palette, params, rng, kind, width, height }) {
  const r = rng;
  const set = tones(palette, params, kind);
  const asp = width && height ? width / height : 4 / 3;
  // geometry in centred height units, y up (the space of fx_p())
  const calm = [(params.calmX - 0.5) * asp, 0.5 - params.calmY];
  const corners = [[-asp / 2, -0.5], [asp / 2, -0.5], [-asp / 2, 0.5], [asp / 2, 0.5]];
  const far = corners.reduce((a, b) => (Math.hypot(b[0] - calm[0], b[1] - calm[1]) > Math.hypot(a[0] - calm[0], a[1] - calm[1]) ? b : a));
  const span = Math.max(0.3, Math.hypot(far[0] - calm[0], far[1] - calm[1]));
  const dir = [(far[0] - calm[0]) / span, (far[1] - calm[1]) / span];
  const perp = [-dir[1], dir[0]];
  // a point along the calm-to-far axis, kept inside the frame
  const at = (along, side) => [
    Math.max(-asp / 2 + 0.12, Math.min(asp / 2 - 0.12, calm[0] + dir[0] * span * along + perp[0] * side)),
    Math.max(-0.38, Math.min(0.38, calm[1] + dir[1] * span * along + perp[1] * side)),
  ];
  const side = r() < 0.5 ? -1 : 1;
  const b0 = at(0.7 + 0.2 * r(), side * (0.05 + 0.2 * r()));       // accent, across from the calm area
  const b1 = at(0.3 + 0.2 * r(), -side * (0.2 + 0.25 * r()));      // pale light, near the middle
  const b2 = at(0.6 + 0.3 * r(), -side * (0.15 + 0.3 * r()));      // deep, beside the accent
  const u = {
    u_kNear: color.labVec(set.near),
    u_kFar: color.labVec(set.far),
    u_grainAmp: set.grain,
    // scatter 0..1 -> dissolve strength; 0.5 gives a visible stipple only where colours meet
    u_dissolve: 0.36 * params.scatter,
    u_calmP: calm,
    u_dir: dir,
    u_span: span,
    u_b0: [...b0, 0.38 + 0.12 * r(), r() * 6.283],
    u_b1: [...b1, 0.36 + 0.12 * r(), r() * 6.283],
    u_b2: [...b2, 0.3 + 0.12 * r(), r() * 6.283],
  };
  set.k.forEach((k, i) => { u['u_k' + i] = color.labVec(k); });
  return u;
}

export default {
  id: 'grain-gradient',
  name: 'Grain gradient',
  family: 'grain',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      still: 4,
      fallback: ({ palette: P, params: prm, kind }) => {
        const k = tones(P, prm, kind).k;
        return fallbackCSS({ ...P, accent: k[0] }, { at: `${(1 - prm.calmX) * 100}% ${(1 - prm.calmY) * 100}%`, tint: 1 });
      },
    });
  },
};
