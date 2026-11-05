// prism-dispersion: a soft white beam crosses a dark room and, at one point, breaks into a widening fan
// of colour that lands as a glowing spectrum on a far wall, like light thrown through a glass prism.
// The spectrum is a band of hues around the page accent (never violet), seen faintly in the hazy air
// and brightly where it lands. The split sits in an upper side of the frame and the light lands on the
// opposite, lower side, so centred content never hides both; a text block (calm) dims the light.
import { shader, color } from '../fx.js';

const params = {
  splitX:    { default: 0.28, min: 0.05,  max: 0.95, step: 0.01 },  // where the beam splits, 0 left .. 1 right (the middle is skipped)
  splitY:    { default: 0.4,  min: 0,     max: 1,    step: 0.01 },  // height of the split in the upper half, 0 high .. 1 lower
  bend:      { default: 30,   min: 0,     max: 60,   step: 1 },     // how far the prism turns the light, degrees
  fanSpread: { default: 0.42, min: 0.2,   max: 0.7,  step: 0.01 },  // fan width in radians
  hueSpread: { default: 55,   min: 20,    max: 70,   step: 1 },     // the spectrum spans the accent hue +- this, degrees
  beamWidth: { default: 0.006, min: 0.002, max: 0.03, step: 0.001 }, // beam width (height units)
  haze:      { default: 0.5,  min: 0,     max: 1,    step: 0.01 },  // how much the light shows in the air
  intensity: { default: 1,    min: 0,     max: 1.5,  step: 0.01 },
  sway:      { default: 0.02, min: 0,     max: 0.08, step: 0.005 }, // slow sway of the light, radians
  calm:      { default: 0.4,  min: 0,     max: 1,    step: 0.01 },  // dim the light where text sits
  calmX:     { default: 0.25, min: 0,     max: 1,    step: 0.01 },
  calmY:     { default: 0.78, min: 0,     max: 1,    step: 0.01 },
};

const frag = /* glsl */ `
vec3 spec(float u) {
  float x = clamp(u, -1.0, 1.0) * 2.0 + 2.0;
  vec3 c = mix(u_r0, u_r1, clamp(x, 0.0, 1.0));
  c = mix(c, u_r2, clamp(x - 1.0, 0.0, 1.0));
  c = mix(c, u_r3, clamp(x - 2.0, 0.0, 1.0));
  return mix(c, u_r4, clamp(x - 3.0, 0.0, 1.0));
}
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
// 1 inside an ellipse the size of a text block around the calm point, fading out beyond it
float calmMask(vec2 uv) {
  vec2 d = (uv - vec2(u_calmX, u_calmY)) * vec2(u_res.x / u_res.y, 1.0);
  vec2 R = vec2(0.3 + 0.3 * u_calm, 0.14 + 0.1 * u_calm);
  return 1.0 - smoothstep(0.75, 1.35, length(d / R));
}

void main() {
  vec2 uv = fx_uv();
  float asp = u_res.x / u_res.y;
  float px = 1.0 / u_res.y;
  vec2 P = vec2(uv.x * asp, uv.y);
  vec2 S = vec2(u_S.x * asp, u_S.y);
  vec2 Lp = vec2(u_L.x * asp, u_L.y);
  float t = u_time;
  float sw = u_sway * sin(t * 0.19 + u_seed);

  vec2 fd = rot(normalize(Lp - S), sw);          // centre of the fan
  float D = length(Lp - S);                      // distance to the wall
  vec2 fn = vec2(-fd.y, fd.x);
  vec2 din = rot(fd, -u_side * radians(u_bend)); // the incoming beam, turned less than the fan
  vec2 dn = vec2(-din.y, din.x);
  vec2 v = P - S;
  float r = length(v);
  float w0 = max(u_beamWidth, 1.3 * px);

  // the entry beam, with dust drifting through it
  float ai = dot(v, din), pi = dot(v, dn);
  float before = smoothstep(0.006, -0.01, ai);
  float dust = 0.7 + 0.3 * smoothstep(-0.6, 0.6, fx_noise(vec2(ai * 7.0 - t * 0.3, 2.3)));
  float beam = (exp(-pi * pi / (w0 * w0)) * 0.85 + exp(-pi * pi / (w0 * w0 * 40.0)) * 0.1) * before * dust;

  // the fan: hue across it, white where the colours still overlap near the split
  float al = dot(v, fd), pp = dot(v, fn);
  float alp = max(al, 0.0);
  float hs = tan(0.5 * u_fanSpread);
  float hw = w0 + alp * hs;
  float u = pp / hw * u_side;
  float sep = alp * hs / (alp * hs + 3.0 * w0);
  float prof = exp(-u * u * u * u * 1.3);   // flat across the colours, soft at the sides
  float start = smoothstep(-0.004, 0.012, al);
  float stop = 1.0 - smoothstep(D - 0.04, D + 0.015, al);
  float thin = pow(w0 / hw, 0.3);               // the light thins as it spreads
  float air = 0.7 + 0.45 * fx_fbm(vec2(al * 2.6 - t * 0.04, pp * 5.0 + t * 0.02) + u_seed * 0.01);
  float fanI = prof * start * stop * thin * air * u_haze * 1.5;

  // where it lands: a soft spectrum on the wall, a little wider than the fan, and the wall lit around it
  float hwL = w0 + D * hs;
  float uL = pp / hwL * u_side;
  float land = exp(-pow((al - D) / (0.035 + 0.05 * hwL), 2.0)) * exp(-uL * uL * uL * uL * 1.6);
  land *= 0.85 + 0.15 * fx_noise(vec2(uL * 2.0, t * 0.1 + 5.0));
  vec2 lq = rot(P - Lp, 0.0);
  float bloom = exp(-dot(lq, lq) / (0.05 + 0.6 * hwL * hwL)) + 0.35 * exp(-dot(lq, lq) / 0.35);

  float split = exp(-r * r / 0.0005) * 0.75 + exp(-r * r / 0.01) * 0.16;
  float scatter = exp(-pi * pi / 0.012) * before * 0.1 + exp(-r * r / 0.05) * 0.08;

  float cm = 1.0 - 0.75 * calmMask(uv) * smoothstep(0.0, 0.5, u_calm);
  float k = u_intensity * cm;

  // the room: the page ground with a faint, slow haze
  vec3 col = u_ground;
  col.x += u_amb * (fx_fbm(P * 1.1 + vec2(t * 0.01, 0.0) + u_seed * 0.03) + 0.2 * (1.0 - uv.y));
  col = mix(col, u_glowA, clamp(scatter * u_haze * 2.0 + bloom * 0.35, 0.0, 1.0) * k * u_lit);
  vec3 fanCol = mix(u_hot, spec(u), sep);
  // the wall around the light: lit, with only a little of the colour (a dim saturated tint reads as mud)
  vec3 wallC = spec(clamp(uL, -1.0, 1.0) * 0.7);
  wallC.yz *= 0.45;
  col = mix(col, mix(u_glowA, wallC, 0.5), clamp(bloom * 0.32, 0.0, 1.0) * k);
  col = mix(col, fanCol, clamp(fanI, 0.0, 0.9) * k);
  col = mix(col, spec(uL), clamp(land * 0.9, 0.0, 0.92) * k);
  col = mix(col, u_beam, clamp(beam, 0.0, 1.0) * k * u_lit);
  col = mix(col, u_hot, clamp(split, 0.0, 1.0) * k * u_lit);
  col.x += fx_grain(gl_FragCoord.xy, floor(u_time * 24.0)) * 0.006;
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

const hd = (a, b) => { const d = Math.abs((((a - b) % 360) + 360) % 360); return d > 180 ? 360 - d : d; };
// the centre hue nearest the accent whose span (centre +- s) stays clear of violet and lavender (262..338 in OKLCH)
function spectrumCentre(h, s) {
  const lo = 262, hi = 338;
  const clear = c => { for (let k = -s; k <= s; k += 2) { const x = (((c + k) % 360) + 360) % 360; if (x >= lo && x <= hi) return false; } return true; };
  if (clear(h)) return h;
  const a = lo - s - 1, b = hi + s + 1;
  return hd(h, a) <= hd(h, b) ? a : b;
}

export function tones(P, prm) {
  const { bg, ink, accent } = P;
  const [Lb, Cb, hb] = color.lch(bg);
  const [, Ca, ha] = color.lch(accent);
  const dark = Lb < 0.6;
  const s = prm.hueSpread;
  // a grey accent: the spectrum follows the background hue, quietly
  const grey = Ca < 0.03;
  const centre = spectrumCentre(grey ? hb : ha, grey ? Math.min(s, 30) : s);
  const C = grey ? 0.06 : Math.min(0.15, Math.max(0.085, Ca * 1.3));
  const Lmid = dark ? 0.82 : Math.max(0.45, Lb - 0.14);
  const ramp = [-1, -0.5, 0, 0.5, 1].map(u => color.fromLch([Lmid - (dark ? 0.06 : 0.03) * Math.abs(u), C * (1 - 0.15 * Math.abs(u)), centre + u * s]));
  if (dark) {
    const ground = color.darken(bg, Math.min(0.03, Lb * 0.1));
    const pale = color.adjust(bg, { l: 0.95 - Lb, c: 0.2 });
    return {
      ground, ramp, dark,
      beam: color.mix(pale, color.withLightness(ink, 0.97), 0.5),
      hot: color.withLightness(color.mix(pale, ramp[2], 0.15), 0.97),
      glowA: color.mix(ground, color.mix(pale, ramp[2], 0.3), 0.35),
      amb: 0.02, lit: 1,
    };
  }
  // a light ground (not what it is made for): the beam does not show on a pale wall, only the
  // spectrum it throws, a shade darker than the page so text in the page ink stays readable
  return {
    ground: bg, ramp, dark,
    beam: bg, hot: color.mix(bg, ramp[2], 0.4), glowA: color.mix(bg, ramp[2], 0.25),
    amb: 0.006, lit: 0,
  };
}

// the frame: the split high on one side, the light landing low on the other; when the page's text
// (calm) sits where it would land, the picture is mirrored
function layout(prm) {
  let left = prm.splitX < 0.5;
  const d = Math.min(0.3, Math.max(0.12, left ? prm.splitX : 1 - prm.splitX)); // distance from the near edge
  const ys = 0.12 + 0.3 * prm.splitY;
  if (prm.calm > 0.05) {
    const lx = left ? 0.78 : 0.22;
    if (Math.abs(prm.calmX - lx) < 0.3 && Math.abs(prm.calmY - 0.8) < 0.35) left = !left;
  }
  return { S: [left ? d : 1 - d, ys], L: [left ? 0.78 : 0.22, 0.76], side: left ? 1 : -1 };
}

function uniforms({ palette, params: prm }) {
  const k = tones(palette, prm);
  const g = layout(prm);
  return {
    u_ground: color.labVec(k.ground), u_beam: color.labVec(k.beam), u_hot: color.labVec(k.hot), u_glowA: color.labVec(k.glowA),
    u_r0: color.labVec(k.ramp[0]), u_r1: color.labVec(k.ramp[1]), u_r2: color.labVec(k.ramp[2]), u_r3: color.labVec(k.ramp[3]), u_r4: color.labVec(k.ramp[4]),
    u_amb: k.amb, u_lit: k.lit, u_S: g.S, u_L: g.L, u_side: g.side,
  };
}

export default {
  id: 'prism-dispersion',
  name: 'Prism light',
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
      still: 2,
      fallback: ({ palette: P, params: prm }) => {
        const k = tones(P, prm);
        const g = layout(prm);
        const [sx, sy] = g.S.map(v => v * 100), [lx, ly] = g.L.map(v => v * 100);
        return `radial-gradient(5% 8% at ${sx}% ${sy}%, ${k.hot}, transparent 70%), `
          + `radial-gradient(11% 20% at ${lx + 2.5 * g.side}% ${ly - 3}%, ${k.ramp[1]}, transparent 80%), `
          + `radial-gradient(11% 20% at ${lx - 2.5 * g.side}% ${ly + 3}%, ${k.ramp[3]}, transparent 80%), `
          + `radial-gradient(30% 40% at ${lx}% ${ly}%, ${k.glowA}, transparent 75%), ${k.ground}`;
      },
    });
  },
};
