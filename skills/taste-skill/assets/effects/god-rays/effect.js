// god-rays: shafts of light fan down through haze from a source at or above the top edge. The rays
// are uneven (noise along the angle, so they widen with distance) and come in bundles with dark gaps,
// fade with distance, drift slowly without turning, and a few soft out-of-focus motes float in the
// light. The light is a little warmer near its source. On light pages the room stays at the page's
// lightness and the gaps between the shafts fall into a soft shade. Text sits in a calm area.
import { shader, color } from '../fx.js';

const params = {
  originX:   { default: 0.3,  min: -0.2, max: 1.2, step: 0.01 },  // light source, 0 left .. 1 right
  originY:   { default: -0.2, min: -0.8, max: 0.2, step: 0.01 },  // source height; below 0 is above the frame
  tilt:      { default: 22,   min: -60,  max: 60,  step: 1 },     // fan direction, degrees from straight down (+ right)
  spread:    { default: 60,   min: 10,   max: 140, step: 1 },     // fan width in degrees
  density:   { default: 0.35, min: 0,    max: 1,   step: 0.01 },  // how many rays
  intensity: { default: 0.7,  min: 0,    max: 1.5, step: 0.01 },  // brightness of the light
  falloff:   { default: 1.2,  min: 0,    max: 4,   step: 0.01 },  // how fast the light fades with distance
  speed:     { default: 0.04, min: 0,    max: 0.4, step: 0.005 }, // how fast the rays change
  dust:      { default: 0.3,  min: 0,    max: 1,   step: 0.01 },  // soft motes floating in the light
  tint:      { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // how much the accent colours the light
  calm:      { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // dim the light where text sits
  calmX:     { default: 0.22, min: 0,    max: 1,   step: 0.01 },
  calmY:     { default: 0.72, min: 0,    max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// one layer of out-of-focus motes: at most one soft disc per cell, sizes from small to large (the large
// ones dimmer and blurrier), drifting down; each disc stays inside its cell
float motes(vec2 P, float cells, vec2 drift, float amount, float off) {
  vec2 q = P * cells + drift;
  vec2 id = floor(q), f = fract(q);
  float h = fx_hash(id + off);
  float h2 = fract(h * 47.13 + 0.31), h3 = fract(h * 91.7 + 0.77), h4 = fract(h * 13.7 + 0.5);
  vec2 c = 0.3 + 0.4 * vec2(h2, h3);
  float rad = 0.07 + 0.21 * h4;
  float dd = length(f - c);
  float disc = pow(1.0 - smoothstep(0.0, rad, dd), 1.4 + 2.0 * h4);
  float tw = 0.6 + 0.4 * sin(u_time * (0.25 + 0.6 * h2) + h * 40.0);
  return step(1.0 - amount, h) * tw * disc * (1.0 - 0.55 * h4);
}
// 1 inside an ellipse the size of a text block around the calm point
float calmMask(vec2 uv) {
  vec2 d = (uv - vec2(u_calmX, u_calmY)) * vec2(u_res.x / u_res.y, 1.0);
  vec2 R = vec2(0.3 + 0.3 * u_calm, 0.14 + 0.1 * u_calm);
  return 1.0 - smoothstep(0.6, 1.6, length(d / R));
}

void main() {
  vec2 uv = fx_uv();
  float asp = u_res.x / u_res.y;
  vec2 P = vec2(uv.x * asp, uv.y);                 // height units, y down
  vec2 d = P - vec2(u_ox * asp, u_originY);
  float r = length(d);
  float a = atan(d.x, d.y);                        // 0 straight down, positive to the right
  float t = u_time * u_speed + u_seed * 0.0137;
  float ra = a - radians(u_tiltE);
  float hs = radians(u_spread) * 0.5;
  float fan = 1.0 - smoothstep(hs * 0.3, hs, abs(ra));

  // rays: gradient noise along the angle, sharpened, and a finer octave for thin rays; a slower gate
  // groups them into bundles with dark gaps, as light through leaves or a window frame
  float k1 = mix(3.0, 18.0, u_density);
  float s1 = fx_noise(vec2(ra * k1 + u_seed * 0.071, t + r * 0.22));
  float s2 = fx_noise(vec2(ra * (k1 * 2.3 + 5.0) - 3.7, t * 1.5 - r * 0.32 + 9.1));
  float gate = smoothstep(-0.3, 0.35, fx_noise(vec2(ra * k1 * 0.3 + 17.0, t * 0.4)));
  float wide = pow(clamp(0.5 + 0.85 * s1, 0.0, 1.0), 2.0);
  float thin = pow(clamp(0.5 + 0.95 * s2, 0.0, 1.0), 4.0);
  float shafts = (wide * 0.9 + thin * 0.45 * (0.35 + 0.65 * wide)) * mix(0.3, 1.0, gate);
  // haze is uneven along each ray, so shafts break and thin out
  shafts *= 0.62 + 0.38 * smoothstep(-0.5, 0.5, fx_noise(vec2(ra * k1 * 0.6 + 4.0, r * 1.7 - t * 0.6)));

  float rTop = max(-u_originY, 0.0);
  float far = max(r - rTop, 0.0);
  float att = exp(-far * u_falloff * 0.75);
  float haze = exp(-far * u_falloff * 1.1) * (1.0 - smoothstep(hs * 0.3, hs * 1.8, abs(ra)));
  float glow = exp(-r * r / 0.06);
  float near = smoothstep(0.0, 0.18, r);         // keep the convergence point soft

  float cm = calmMask(uv) * smoothstep(0.0, 0.5, u_calm);
  float lit = shafts * fan * att * near;
  float L = (lit * 1.05 + haze * 0.42 + glow * 0.6) * u_intensity * u_gain;

  // motes: a few large blurred ones near the eye and finer ones further back, seen only in the light
  vec2 fall = vec2(0.0, -u_time * (0.01 + u_speed * 0.08));
  float dz = motes(P, 6.0, fall * 6.0 + vec2(0.3 * sin(t * 2.0), 0.0), 0.16, 91.0)
           + motes(P + vec2(3.1, 7.7), 15.0, fall * 9.0, 0.22, 17.0) * 0.8;
  L += dz * (lit + glow * 0.4 + haze * 0.3) * u_dust * 3.2 * u_intensity * u_gain;
  L *= 1.0 - 0.85 * cm;

  // composite in OKLab: on light pages the gaps between the shafts fall into a soft shade of the page;
  // the light is warmer near its source and cooler as it travels
  vec3 ground = mix(u_gFar, u_gNear, exp(-r * 0.9));
  // slow, large clouds of haze in the room, lit a little more toward the source
  ground.x += u_air * fx_fbm(P * 0.9 + vec2(t * 0.6, -t * 0.3) + 5.0) * (0.4 + 0.6 * exp(-far * 1.2));
  float shadeA = 1.4 * fan * att * near * (1.0 - clamp(shafts, 0.0, 1.0)) * u_shadeK * (1.0 - 0.85 * cm);
  ground = mix(ground, u_shade, clamp(shadeA, 0.0, 1.0));
  vec3 lightC = mix(u_lightFar, u_lightNear, exp(-far * 1.3));
  float m = 1.0 - exp(-L * 1.3);
  vec3 col = mix(ground, lightC, m);
  col = mix(col, u_hot, smoothstep(0.55, 1.0, m) * 0.6);
  col.x += fx_grain(gl_FragCoord.xy, floor(u_time * 24.0)) * 0.007;
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

// the accent only when it will not turn muddy against the background
const fits = (bg, c) => color.chroma(bg) < 0.035 || color.chroma(c) < 0.035 || color.hueDistance(bg, c) < 55;
const warm = c => { const [, C, h] = color.lch(c); return C > 0.035 && h >= 25 && h <= 115; };

export function tones(P, prm) {
  const { bg, ink, accent } = P;
  const [Lb, Cb, hb] = color.lch(bg);
  const acc = fits(bg, accent) ? accent : null;
  // the warm end of the light: a warm accent if the palette has one, else the ink
  const warmSrc = warm(accent) ? accent : ink;
  const [, Cw, hw] = color.lch(warmSrc);
  if (Lb < 0.6) {
    // dark or deep ground: pale light tinted by the accent
    const base = color.adjust(bg, { l: 0.92 - Lb, c: 0.35 });
    const light = acc ? color.mix(base, color.withLightness(acc, 0.84), 0.2 + 0.6 * prm.tint) : base;
    return {
      gFar: color.darken(bg, Math.min(0.06, Lb * 0.18)),
      gNear: acc ? color.mix(bg, acc, 0.05 + 0.06 * prm.tint) : color.lighten(bg, 0.02),
      lightFar: light,
      lightNear: color.mix(light, color.fromLch([0.95, Math.min(0.035, Cw), hw]), 0.45),
      hot: color.mix(light, color.withLightness(ink, 0.97), 0.55),
      shade: bg, shadeK: 0, air: 0.022,
      gain: 1,
    };
  }
  // light ground: the room stays at the page's lightness; the gaps between the shafts take a soft
  // shade of the page and the shafts a warm white of it
  const base = color.fromLch([Math.min(0.995, Lb + 0.1), Cb * 0.5, hb]);
  const light = acc ? color.mix(base, color.withLightness(acc, 0.95), 0.12 * prm.tint) : base;
  return {
    gFar: color.darken(bg, 0.012),
    gNear: bg,
    lightFar: light,
    lightNear: color.mix(light, color.fromLch([Math.min(0.995, Lb + 0.1), Math.min(0.05, Cw * 0.5), hw]), 0.35),
    hot: color.fromLch([Math.min(0.998, Lb + 0.12), Cb * 0.3, hb]),
    shade: color.fromLch([Lb - 0.12, Cb * 1.1 + 0.004, hb]),
    shadeK: 1, air: 0.008,
    gain: 1.6,
  };
}

// the source keeps away from a text block near the top, and the fan leans into the frame
export function aim(prm) {
  let ox = prm.originX;
  if (prm.calm > 0.05 && prm.calmY < 0.45 && Math.abs(ox - prm.calmX) < 0.35) ox = prm.calmX < 0.5 ? Math.max(ox, prm.calmX + 0.45) : Math.min(ox, prm.calmX - 0.45);
  const tilt = ox > 0.6 ? -Math.abs(prm.tilt) : ox < 0.4 ? Math.abs(prm.tilt) : prm.tilt;
  return { ox, tilt };
}

function uniforms({ palette, params }) {
  const k = tones(palette, params);
  const g = aim(params);
  return {
    u_ox: g.ox, u_tiltE: g.tilt,
    u_gFar: color.labVec(k.gFar), u_gNear: color.labVec(k.gNear), u_lightFar: color.labVec(k.lightFar), u_lightNear: color.labVec(k.lightNear),
    u_hot: color.labVec(k.hot), u_shade: color.labVec(k.shade), u_shadeK: k.shadeK, u_air: k.air, u_gain: k.gain,
  };
}

export default {
  id: 'god-rays',
  name: 'God rays',
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
      still: 6,
      fallback: ({ palette: P, params: prm }) => {
        const k = tones(P, prm);
        const at = `${aim(prm).ox * 100}% ${prm.originY * 100}%`;
        return `radial-gradient(60% 90% at ${at}, ${k.lightNear}, transparent 75%), linear-gradient(${k.gNear}, ${k.gFar})`;
      },
    });
  },
};
