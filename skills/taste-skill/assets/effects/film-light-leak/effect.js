// film-light-leak: light bleeding in from one edge or corner of a dark or coloured frame, the way a film
// is fogged when the camera back leaks. From the edge where the light struck (an optional burn hugs it)
// the exposure falls off through a deep fringe (warm when the palette has a warm colour) and the
// glow into the ground, with a near-white core, fine moving film grain and a slight vignette. It
// breathes slowly. The seed picks the edge away from the text unless `edge` names one.
import { shader, color, grainCSS, rng } from '../fx.js';

const params = {
  edge:      { default: -1,   min: -1,   max: 4,    step: 1 },    // -1 the seed picks; 0 right, 1 left, 2 top, 3 bottom, 4 corner
  intensity: { default: 0.8,  min: 0,    max: 1.5,  step: 0.01 }, // exposure of the leak
  spread:    { default: 0.45, min: 0.1,  max: 1,    step: 0.01 }, // how far it reaches into the frame
  halation:  { default: 0.3,  min: 0,    max: 1,    step: 0.01 }, // the wider, deeper fringe around it
  burn:      { default: 0,    min: 0,    max: 1,    step: 0.01 }, // a burn along the frame edge; 0 by default (a hard strip reads as a glitch)
  grain:     { default: 0.04, min: 0,    max: 0.1,  step: 0.005 },// film grain, 0.04 is 4%
  vignette:  { default: 0.25, min: 0,    max: 1,    step: 0.01 },
  breathe:   { default: 12,   min: 6,    max: 20,   step: 0.5 },  // seconds per slow breath
  warp:      { default: 0.65, min: 0,    max: 1,    step: 0.01 }, // how organic the leak's edge is
  calm:      { default: 0.5,  min: 0,    max: 1,    step: 0.01 }, // holds the light back from the text area
  calmX:     { default: 0.25, min: 0,    max: 1,    step: 0.01 },
  calmY:     { default: 0.6,  min: 0,    max: 1,    step: 0.01 },
};

const frag = /* glsl */ `
void main() {
  vec2 uv = fx_uv();
  vec2 p = fx_p();
  float t = u_time;

  // a slow organic bend, so the edge of the light is never a clean ellipse
  float wt = t * 0.03 + u_seed * 0.011;
  vec2 w = vec2(fx_fbm(p * 0.95 + vec2(wt, 2.3)), fx_fbm(p * 0.95 + vec2(5.1, -wt * 0.8)));
  vec2 q = p + w * 0.34 * u_warp;

  // distance from the source on the edge: stretched along the edge, measured into the frame
  float sp = 0.12 + 0.75 * u_spread;
  vec2 rel = q - u_src;
  float along = dot(rel, u_axis);
  float into = max(dot(rel, u_in), 0.0);
  float d = length(vec2(along * u_stretch, into)) / sp;
  // a second, smaller bloom further along the edge, so the light is never one clean ellipse
  vec2 rel2 = q - u_src - u_axis * (u_lobe + 0.04 * sin(t * 0.07));
  float d2 = length(vec2(dot(rel2, u_axis) * 1.2, max(dot(rel2, u_in), 0.0))) / (sp * 0.5);

  // slow breaths, incommensurate sines so it never loops visibly
  float br = 1.0 + 0.13 * sin(FX_TAU * t / u_breathe) + 0.05 * sin(FX_TAU * t / (u_breathe * 1.618) + 1.3);
  float br2 = 1.0 + 0.18 * sin(FX_TAU * t / (u_breathe * 1.31) + 2.1);

  float m = fx_calm(uv, vec2(u_calmX, u_calmY), 0.3 + 0.55 * u_calm) * u_calm;
  // a broad bloom, a smaller one beside it, and a hot band hugging the edge where the film was struck
  float band = exp(-into / (0.02 + 0.04 * u_spread)) * exp(-along * along * 6.0);
  float E = u_intensity * u_gain * (6.0 * exp(-d * 2.7) * br + 3.0 * exp(-d2 * 2.5) * br2 + 3.5 * band * br) * (1.0 - 0.9 * m);
  // light bleeds into the frame in soft streaks, long across the frame and narrow along the edge
  float rays = fx_noise(vec2(along * 7.0 + u_seed * 0.01, into * 0.7 - t * 0.01));
  E *= 1.0 + 0.8 * rays * smoothstep(0.0, 0.2, into);
  float H = u_halation * (exp(-d * 1.05) + 0.4 * exp(-d2 * 1.1)) * br * (1.0 - 0.8 * m);

  // grain lives in the exposure, before the curve, so it is strongest in the mid tones like film
  float frame = floor(t * 24.0);
  float g = fx_grain(gl_FragCoord.xy, frame);
  E = max(E * (1.0 + g * u_grain * 3.0), 0.0);
  float e = E / (1.0 + E);                                   // filmic shoulder: a soft, blown-out core

  // the ground darkens a little toward the corners (lens vignette); the leak exposes on top of it
  vec2 vc = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) / (0.5 * max(u_res.x / u_res.y, 1.0));
  vec3 col = u_ground;                                        // OKLab
  col.x *= 1.0 - u_vignette * u_vig * 0.6 * smoothstep(0.35, 1.25, length(vc));
  col = mix(col, u_halo, clamp(H, 0.0, 1.0) * 0.75);
  col = mix(col, u_deep, smoothstep(u_ramp.x, u_ramp.y, e));
  col = mix(col, u_glow, smoothstep(u_ramp.y - 0.12, u_ramp.z, e));
  col = mix(col, u_hot, smoothstep(u_ramp.z - 0.1, u_ramp.w, e));

  // the burn: an uneven band along the frame edge near the source with a crisp inner boundary, its
  // own colour at the boundary and blown out against the edge
  if (u_burn > 0.0) {
    // depth into the frame from the struck edge (from both edges at a corner)
    vec2 hf2 = vec2(0.5 * u_res.x / u_res.y, 0.5);
    vec2 de = hf2 - abs(p);
    float dE = u_corner > 0.5 ? min(de.x, de.y) : dot(p - u_src, u_in);
    vec2 r0 = p - u_src;
    float near = exp(-dot(r0, r0) / (sp * sp * 1.1)) * br;
    float n = fx_noise(vec2((p.x + p.y) * 2.2 + u_seed * 0.013, t * 0.015)) + 0.25 * fx_noise(vec2((p.x - p.y) * 6.0, 3.0 + u_seed * 0.007));
    float bw = max(0.0, (0.05 + 0.13 * (n + 0.3)) * near * u_burn) * (1.0 - m);
    float px = 2.4 / u_res.y;
    // the band fades out where it thins, so it never stops in a hard end partway along the edge
    float b = (1.0 - smoothstep(bw - px, bw + px, dE)) * smoothstep(px, px * 8.0, bw);
    // blown out against the edge, a saturated fringe just inside the crisp boundary
    float fr = smoothstep(bw * 0.4, bw * 0.95, dE);
    col = mix(col, mix(u_hot, u_burnC, fr), b * 0.95);
  }

  // fine monochrome grain on top, re-seeded every frame, softer in the blown-out core
  col.x += g * u_grain * u_grainAmp * (1.0 - 0.6 * smoothstep(0.85, 1.0, col.x));

  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

// reds, oranges, golds and yellows (OKLCH hue), with some colour in them
const isWarm = c => { const [, C, h] = color.lch(c); return C > 0.05 && (h < 112 || h > 345); };
// keeps pale tints out of the lavender band
const guard = ([L, C, h]) => (h > 262 && h < 322 ? [L, Math.min(C, 0.018), h] : [L, C, h]);

// the ramp: ground, a wide halo, a deep fringe, the glow, a near-white core, and the burn colour; all
// from the palette (a warm palette colour leads the fringe and the burn; a warm glow shifts toward red
// in the fringe and toward yellow in the core, as a real leak does)
function tones(P) {
  const { bg, ink, muted, accent } = P;
  const [Lb, Cb, hb] = color.lch(bg);
  const coloured = Cb > 0.07;
  const own = coloured && color.hueDistance(bg, accent) >= 55;
  let glow = own ? color.withLightness(color.saturate(bg, 2), Math.min(0.86, Lb + 0.16)) : accent;
  const [Lg0, Cg0] = color.lch(glow);
  if (!own && Lg0 < Lb + 0.22) glow = color.withLightness(glow, Math.min(0.88, Lb + 0.26));
  glow = color.adjust(glow, { c: Cg0 < 0.06 ? 1 : 1.12 });
  const [L2, C2, h2] = color.lch(glow);
  // a warm palette colour lighter than the ground, for the fringe and the burn
  // (not on a coloured ground: a warm fringe over, say, blue passes through olive on its way)
  const warm = coloured ? null : [accent, ink, muted].find(c => isWarm(c) && color.lab(c)[0] > Lb + 0.1) || null;
  const mid = Lb + (L2 - Lb) * 0.5;
  let deep, hot, burnC;
  if (isWarm(glow)) {
    // the fringe leans toward red (hue about 28), from either side, so a pink glow never turns violet
    const toRed = ((28 - h2 + 540) % 360) - 180;
    const hr = (h2 + Math.sign(toRed) * Math.min(18, Math.abs(toRed)) + 360) % 360;
    deep = color.fromLch([mid, Math.min(0.2, C2 * 1.25), hr]);
    hot = color.fromLch([Math.max(0.95, L2 + 0.06), 0.055, h2 > 300 ? (h2 + 24) % 360 : Math.min(h2 + 24, 100)]);
    burnC = color.fromLch([Math.min(0.8, L2 + 0.04), Math.min(0.22, C2 * 1.3), (h2 + Math.sign(toRed) * Math.min(8, Math.abs(toRed)) + 360) % 360]);
  } else if (warm) {
    const [Lw, Cw, hw] = color.lch(warm);
    deep = color.fromLch([mid, Math.min(0.2, Math.max(Cw, 0.08) * 1.2), hw]);
    hot = color.fromLch(guard(own ? [0.96, Math.min(0.05, Cb * 0.35), hb] : [Math.max(0.95, L2 + 0.06), 0.03, h2]));
    burnC = color.fromLch([Math.max(Lw, Lb + 0.3), Math.min(0.22, Math.max(Cw, 0.09) * 1.15), hw]);
  } else {
    // a cool palette: the fringe leans toward the ground's own hue, deeper and more saturated
    const hd = Cb > 0.02 ? hb : h2;
    let dh = ((hd - h2 + 540) % 360) - 180;
    dh = Math.max(-20, Math.min(20, dh));
    let hf = (h2 + dh + 360) % 360;
    if (hf > 262 && hf < 322 && !(h2 > 262 && h2 < 322)) hf = h2;   // never lean into violet
    deep = color.fromLch([mid, Math.min(0.2, C2 * 1.3), hf]);
    hot = color.fromLch(guard(own ? [0.96, Math.min(0.05, Cb * 0.35), hb] : [Math.max(0.95, L2 + 0.06), Math.min(0.035, C2 * 0.25), h2]));
    burnC = color.fromLch([Math.min(0.78, L2), Math.min(0.2, C2 * 1.3), h2]);
  }
  const [Ld] = color.lab(deep);
  const halo = color.adjust(color.withLightness(deep, Lb + (Ld - Lb) * 0.55), { c: 1.15 });
  return {
    ground: bg, halo, deep, glow, hot, burnC, coloured, light: Lb > 0.6,
    ramp: own ? [0.04, 0.3, 0.6, 0.84] : [0.03, 0.42, 0.7, 0.92],
  };
}

// the edge farthest from the text, or the corner farthest from it; a fixed edge when given
function pickEdge(params, r, asp, seed) {
  const C = [(params.calmX - 0.5) * asp, 0.5 - params.calmY];
  if (params.edge >= 0) return { e: Math.round(params.edge), C };
  const dist = [asp / 2 - C[0], C[0] + asp / 2, 0.5 - C[1], C[1] + 0.5];   // right, left, top, bottom
  const best = Math.max(...dist);
  const ok = [0, 1, 2, 3].filter(i => dist[i] >= best * 0.7);
  // its own stream, so neighbouring seeds do not all pick the same edge
  const r2 = rng(`film-light-leak:edge:${seed}`);
  if (r2() < 0.3) return { e: 4, C };
  return { e: ok[Math.floor(r2() * ok.length)], C };
}

function uniforms({ palette, params, seed, rng: r, width, height }) {
  const T = tones(palette);
  const asp = width && height ? width / height : 4 / 3;
  const hx = asp / 2, hy = 0.5;
  const { e, C } = pickEdge(params, r, asp, seed);
  // along the edge, the source keeps to the half away from the text
  const j = (r() - 0.5) * 0.6;
  const awayY = Math.abs(C[1]) > 0.08 ? -Math.sign(C[1]) * 0.18 : 0;
  const awayX = Math.abs(C[0]) > 0.1 * asp ? -Math.sign(C[0]) * 0.18 * asp : 0;
  let src, axis, inn, stretch = 1.05;
  if (e === 1) { src = [-hx, j * 0.6 + awayY]; axis = [0, 1]; inn = [1, 0]; }
  else if (e === 2) { src = [j * asp * 0.5 + awayX, hy]; axis = [1, 0]; inn = [0, -1]; }
  else if (e === 3) { src = [j * asp * 0.5 + awayX, -hy]; axis = [1, 0]; inn = [0, 1]; }
  else if (e === 4) {
    // the corner farthest from the text area
    const sx = C[0] <= 0 ? 1 : -1, sy = C[1] <= 0 ? 1 : -1;
    src = [sx * hx, sy * hy]; inn = [-sx * Math.SQRT1_2, -sy * Math.SQRT1_2]; axis = [-inn[1], inn[0]]; stretch = 0.8;
  } else { src = [hx, j * 0.6 + awayY]; axis = [0, 1]; inn = [-1, 0]; }
  return {
    u_ground: color.labVec(T.ground),
    u_halo: color.labVec(T.halo),
    u_deep: color.labVec(T.deep),
    u_glow: color.labVec(T.glow),
    u_hot: color.labVec(T.hot),
    u_burnC: color.labVec(T.burnC),
    u_ramp: T.ramp,
    // a coloured ground needs more light to read, less grain (it turns to coloured noise there) and a
    // lighter vignette (darkening a saturated ground turns it muddy)
    u_gain: T.coloured ? 1.45 : 1,
    u_grainAmp: T.coloured ? 0.55 : T.light ? 0.9 : 1.2,
    u_vig: T.coloured ? 0.35 : 1,
    u_src: src,
    u_axis: axis,
    u_in: inn,
    u_stretch: stretch, u_corner: e === 4 ? 1 : 0,
    u_lobe: (r() < 0.5 ? -1 : 1) * (0.24 + 0.12 * r()),
  };
}

export default {
  id: 'film-light-leak',
  name: 'Film light leak',
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
      fps: 30,
      still: 4,
      fallback: ({ palette: P, params: prm, seed: s, rng: r, width, height }) => {
        const T = tones(P);
        const asp = width && height ? width / height : 4 / 3;
        const { e, C } = pickEdge(prm, r, asp, s);
        const at = ['100% 50%', '0% 50%', '50% 0%', '50% 100%', `${C[0] <= 0 ? 100 : 0}% ${C[1] <= 0 ? 0 : 100}%`][e] || '100% 50%';
        return `${grainCSS(0.06, 1)}, radial-gradient(45% 70% at ${at}, ${T.hot}, ${T.glow} 22%, ${T.deep} 45%, transparent 75%), ${P.bg}`;
      },
    });
  },
};
