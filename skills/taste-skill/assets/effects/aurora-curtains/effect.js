// aurora-curtains: curtains of light of a finite length hang in a night sky. Each folds in S-curves, so
// light gathers in bright creases; it is brightest at the hem, glows a little below it and fades upward
// in long rays, and the sky around it is lit faintly. Two palette hues, mixed in as light.
// On a light palette (not what it is made for) it turns into soft veils of the accent on the page ground.
import { shader, color, grainCSS } from '../fx.js';

const params = {
  speed:     { default: 0.05, min: 0,    max: 0.3,  step: 0.01 }, // sway speed
  bands:     { default: 3,    min: 1,    max: 4,    step: 1 },    // curtains
  height:    { default: 0.66, min: 0.3,  max: 0.85, step: 0.01 }, // where the lowest hem hangs, 0 top .. 1 bottom
  rayDetail: { default: 0.6,  min: 0,    max: 1,    step: 0.01 }, // fine vertical rays inside the curtains
  waviness:  { default: 0.55, min: 0,    max: 1,    step: 0.01 }, // how deeply the curtains fold
  intensity: { default: 1.3,  min: 0,    max: 2,    step: 0.01 }, // brightness of the light
  stars:     { default: 0.25, min: 0,    max: 1,    step: 0.01 }, // a few still stars, 0 for none
  calm:      { default: 0.6,  min: 0,    max: 1,    step: 0.01 }, // keep the text area dark
  calmX:     { default: 0.3,  min: 0,    max: 1,    step: 0.01 },
  calmY:     { default: 0.78, min: 0,    max: 1,    step: 0.01 },
};

const frag = /* glsl */ `
// one curtain. x, y in height units (y down). a = (centre x, half length, hem height, reach),
// b = (fold depth, fold frequency, phase, gain). Returns its light; up is 0 at the hem .. 1 high up.
float curtain(float x, float y, float t, vec4 a, vec4 b, float fi, out float up, out float halo) {
  up = 0.0;
  halo = 0.0;
  float dx = x - a.x;
  float ends = smoothstep(a.y, a.y * 0.4, abs(dx));          // a finite curtain, fading out at both ends
  if (ends <= 0.0) return 0.0;
  float sway = t * (0.5 + 0.15 * fi);
  // folds: the curtain's own coordinate u runs back on itself where it folds, and light gathers there
  float fd = b.x * u_waviness * 1.8;
  float ph = b.y * dx + b.z + sway * 0.7 + 0.8 * sin(dx * b.y * 0.37 + b.z);
  float u = dx + fd * sin(ph) + 0.04 * fx_noise(vec2(dx * 2.0 + sway * 0.3, fi * 3.1));
  float du = abs(1.0 + fd * b.y * cos(ph));
  // the hem swings in S-curves (a skewed wave, steep where the curtain turns toward us) and wanders in
  // height along the curtain; where it turns we see the curtain edge-on, so it is brighter there
  float sp = ph * 0.9 + 0.6;
  float sw = sin(sp + 0.45 * sin(sp));
  float hem = a.z + 0.12 * fx_noise(vec2(x * 0.5 + fi * 4.7, sway * 0.12)) + 0.095 * u_waviness * sw + 0.014 * fx_noise(vec2(u * 9.0 + sway, fi * 5.0 + 2.0));
  float turn = abs(cos(sp + 0.45 * sin(sp)));
  float crease = min(2.6, 1.3 / (0.3 + du)) * (0.75 + 0.9 * turn * turn * turn);
  float d = hem - y;                                         // > 0 above the hem
  // where the curtain is lit, and how high the light reaches there
  float lv = fx_noise(vec2(u * 1.2 - t * 0.25, 9.0 + fi * 3.3));
  float reach = a.w * (0.55 + 0.9 * smoothstep(-0.45, 0.45, lv));
  // a bright band just above the hem and a long faint tail of rays above it
  float above = 0.62 * exp(-max(d, 0.0) / (0.05 + 0.2 * reach)) + 0.38 * exp(-max(d, 0.0) / reach);
  // below the hem: a short soft fall, then a faint scattered glow, so the hem is no silhouette edge
  float below = 0.84 * exp(min(d, 0.0) / 0.035) + 0.16 * exp(min(d, 0.0) / 0.22);
  // rays: fine and long, carried by the folds
  float r = 0.65 * fx_noise(vec2(u * 26.0 + sway, y * 0.6 + fi * 7.0)) + 0.35 * fx_noise(vec2(u * 63.0 - sway, y * 1.1 + fi * 3.0));
  float rays = mix(1.0, clamp(0.8 + 1.6 * r, 0.05, 1.9), u_rayDetail * (0.55 + 0.45 * smoothstep(0.0, 0.25, d)));
  float lit = 0.3 + 0.7 * smoothstep(-0.35, 0.35, lv + 0.15);
  float line = 0.55 * exp(-abs(d) * 50.0);
  up = clamp(d / (reach * 2.4), 0.0, 1.0);
  halo = exp(-abs(d - 0.02) / 0.22) * ends * lit;
  return (above * (d > 0.0 ? rays : 1.0) + line) * below * crease * lit * ends * b.w;
}

#define CURTAIN(A, B, FI) { float up_, hl_; float c_ = curtain(x, y, t, A, B, FI, up_, hl_); tint += mix(u_hem, u_top, clamp(up_ * 1.15 + FI * 0.12, 0.0, 1.0)) * c_; cover += c_; halo += hl_ * (1.0 - 0.2 * FI); }

void main() {
  vec2 uv = fx_uv();
  float asp = u_res.x / u_res.y;
  float x = (uv.x - 0.5) * asp, y = uv.y;
  float t = u_time * u_speed * 1.6 + u_seed * 0.031;

  vec3 sky = fx_oklab(mix(u_skyTop, u_skyLow, y * y));
  vec3 tint = vec3(0.0);
  float cover = 0.0, halo = 0.0;
  CURTAIN(u_a0, u_b0, 0.0)
  if (u_bands > 1.5) CURTAIN(u_a1, u_b1, 1.0)
  if (u_bands > 2.5) CURTAIN(u_a2, u_b2, 2.0)
  if (u_bands > 3.5) CURTAIN(u_a3, u_b3, 3.0)
  tint /= max(cover, 1e-4);

  // keep the text area quiet
  // (wide, since text runs sideways, and with a long soft edge, so the curtains fade out into it)
  vec2 cd = (uv - vec2(u_calmX, u_calmY)) * vec2(asp * 0.6, 1.0);
  float cr = 0.3 + 0.45 * u_calm;
  float m = (1.0 - smoothstep(cr * 0.15, cr, length(cd))) * min(1.0, u_calm * 1.7);
  cover *= 1.0 - 0.94 * m;
  halo *= 1.0 - 0.9 * m;

  // light builds up like exposure, mixed in OKLab toward the curtain colour so hues stay clean; the
  // brightest cores a step lighter; the sky around the curtains faintly lit
  float e = 1.0 - exp(-cover * u_intensity * 1.8);
  vec3 lab = mix(sky, u_glowC, clamp(halo * 0.16 * u_intensity, 0.0, 0.4));
  lab = mix(lab, tint, e);
  lab.x += u_night * 0.12 * smoothstep(0.75, 1.0, e) * e;
  vec3 col = fx_rgb(lab);

  // a few still stars where there is no curtain
  vec2 cell = floor(gl_FragCoord.xy / max(1.0, 1.5 * u_dpr));
  float h = fx_hash(cell + 17.0);
  float star = u_night * step(1.0 - 0.0012 * u_stars, h) * (1.0 - smoothstep(0.0, 0.3, cover + halo * 0.3)) * (1.0 - smoothstep(0.7, 0.95, y));
  col = mix(col, u_starC, star * (0.3 + 0.45 * fx_hash(cell + 91.0)));
  fxColor = vec4(fx_dither(col), 1.0);
}
`;

const L = c => color.lab(c)[0];
const at = (c, l) => color.withLightness(c, Math.min(0.97, Math.max(0.03, l)));

// hem: the bright hue at the lower edge; top: the hue the light fades into; skyTop/skyLow: the ground;
// glow: the faint light around the curtains
function tones(P, kind) {
  const { bg, surface, ink, muted, accent } = P;
  const acc = color.chroma(accent) > 0.03 ? accent : color.mix(ink, muted, 0.3);
  if (kind === 'light') {
    // veils of the accent on the page ground: darker where they are dense
    return {
      skyTop: color.lighten(bg, 0.01),
      skyLow: color.mix(bg, acc, 0.05),
      hem: color.saturate(at(acc, Math.min(0.62, Math.max(0.42, L(acc)))), 1.05),
      top: color.saturate(color.mix(bg, acc, 0.4), 1.1),
      glow: color.mix(bg, acc, 0.12),
      star: bg,
    };
  }
  if (kind === 'colour') {
    // a deep night of the page colour; white-blue light (a far-hued accent would turn grey when added)
    const deep = color.lighten(bg, -0.24);
    const near = color.hueDistance(bg, acc) < 55;
    return {
      skyTop: color.lighten(deep, -0.04),
      skyLow: color.mix(deep, bg, 0.55),
      hem: near ? color.lighten(acc, 0.1) : color.mix(bg, ink, 0.75),
      top: color.saturate(color.lighten(bg, 0.08), 1.05),
      glow: color.mix(deep, bg, 0.85),
      star: color.mix(bg, ink, 0.8),
    };
  }
  const dark = bg;
  return {
    skyTop: color.lighten(dark, -0.015),
    skyLow: color.mix(color.mix(dark, surface, 0.5), acc, 0.13),
    hem: color.withLightness(color.saturate(acc, 1.15), Math.max(0.78, L(acc) + 0.05)),
    top: color.saturate(color.mix(dark, acc, 0.66), 1.2),
    glow: color.saturate(color.mix(dark, acc, 0.4), 1.1),
    star: color.mix(dark, ink, 0.8),
  };
}

function uniforms({ palette, params, rng, kind, width, height }) {
  const k = tones(palette, kind);
  const asp = width && height ? width / height : 1.6;
  const r = rng;
  const u = {
    u_skyTop: color.vec3(k.skyTop),
    u_skyLow: color.vec3(k.skyLow),
    u_hem: color.labVec(k.hem),
    u_top: color.labVec(k.top),
    u_glowC: color.labVec(k.glow),
    u_starC: color.vec3(k.star),
    u_night: kind === 'light' ? 0 : 1,
  };
  // curtains of different lengths and heights, spread across the frame, the nearest hanging lowest
  const spots = [-0.32, 0.3, -0.05, 0.42].map(v => v + (r() - 0.5) * 0.2);
  if (r() < 0.5) spots.reverse();
  for (let i = 0; i < 4; i++) {
    const half = asp * (0.24 + 0.16 * r()) * (1 - 0.08 * i);
    u['u_a' + i] = [spots[i] * asp, half, params.height - i * 0.1 - 0.06 * r(), (0.2 + 0.08 * r()) * (1 + 0.15 * i)];
    const freq = 5.5 + 5 * r();
    u['u_b' + i] = [(0.85 + 0.35 * r()) / freq, freq, r() * 6.283, [1, 0.82, 0.68, 0.58][i]];
  }
  return u;
}

export default {
  id: 'aurora-curtains',
  name: 'Aurora curtains',
  family: 'mesh',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      maxDpr: 1,
      still: 5,
      fallback: ({ palette: P, kind, params: prm }) => {
        const k = tones(P, kind);
        const h = prm.height * 100;
        return `${grainCSS(0.04)}, radial-gradient(60% 40% at 32% ${h - 14}%, ${color.mix(k.skyLow, k.hem, 0.38)}, transparent 70%), radial-gradient(50% 34% at 70% ${h - 22}%, ${color.mix(k.skyLow, k.top, 0.5)}, transparent 70%), linear-gradient(${k.skyTop}, ${k.skyLow})`;
      },
    });
  },
};
