// spotlight-cone: one stage light from a lamp out of frame above. A slanted cone through uneven,
// drifting haze, its edge going softer the further the light travels, lands as a soft pool on the
// floor that spills a little light around it. On light pages the room stays at the page's own
// lightness and only the corners away from the light dim slightly. The cone keeps away from text.
import { shader, color } from '../fx.js';

const params = {
  x:         { default: 0.5,  min: 0,    max: 1,    step: 0.01 },  // where the pool lands, 0 left .. 1 right
  lean:      { default: 0.3,  min: 0,    max: 0.8,  step: 0.01 },  // how far the lamp sits to the side (height units)
  width:     { default: 0.22, min: 0.08, max: 0.5,  step: 0.01 },  // half width of the light at the floor (height units)
  poolY:     { default: 0.8,  min: 0.5,  max: 0.95, step: 0.01 },  // the floor where the pool lands, 0 top .. 1 bottom
  haze:      { default: 0.45, min: 0,    max: 1,    step: 0.01 },  // light seen in the air
  edge:      { default: 0.5,  min: 0.1,  max: 1,    step: 0.01 },  // softness of the cone edge (grows with distance)
  intensity: { default: 1,    min: 0,    max: 1.5,  step: 0.01 },
  breathe:   { default: 0,    min: 0,    max: 1,    step: 0.01 },  // slow rise and fall of the light
  speed:     { default: 0.12, min: 0,    max: 1,    step: 0.01 },  // drift of the haze
  calm:      { default: 0.4,  min: 0,    max: 1,    step: 0.01 },  // keep the light off the text and dim it there
  calmX:     { default: 0.2,  min: 0,    max: 1,    step: 0.01 },
  calmY:     { default: 0.3,  min: 0,    max: 1,    step: 0.01 },
};

const frag = /* glsl */ `
float calmMask(vec2 uv) {
  vec2 d = (uv - vec2(u_calmX, u_calmY)) * vec2(u_res.x / u_res.y, 1.0);
  vec2 R = vec2(0.3 + 0.3 * u_calm, 0.14 + 0.1 * u_calm);
  return 1.0 - smoothstep(0.75, 1.35, length(d / R));
}

void main() {
  vec2 uv = fx_uv();
  float asp = u_res.x / u_res.y;
  vec2 P = vec2(uv.x * asp, uv.y);
  float t = u_time * u_speed * 0.15 + u_seed * 0.021;

  vec2 pool = vec2(u_cx * asp, u_poolY);
  vec2 lamp = vec2(pool.x + u_leanS, -0.4);         // out of frame, above
  vec2 ax = normalize(pool - lamp);
  float D = length(pool - lamp);
  vec2 v = P - lamp;
  float d = dot(v, ax);                              // distance along the light
  float pr = dot(v, vec2(-ax.y, ax.x));              // distance across it
  float k = clamp(d / D, 0.0, 1.2);
  float w = u_width * d / D;
  float rel = abs(pr) / max(w, 1e-3);
  // the penumbra widens with distance: crisp near the lamp, very soft by the floor
  float pen = u_edge * mix(0.12, 0.75, k);
  float cone = smoothstep(1.0 + pen, 1.0 - pen, rel) * step(0.0, d);

  // haze: brighter near the lamp and through the middle of the cone, uneven and drifting
  float thick = sqrt(max(0.0, 1.0 - min(rel * rel, 1.0)));
  // slow smoke: warped noise, stretched a little along the light
  vec2 hp = vec2(pr * 3.4, d * 1.5 - t) + u_seed * 0.01;
  hp += 0.7 * vec2(fx_noise(hp * 0.9 + vec2(t * 0.3, 0.0)), fx_noise(hp * 0.9 + vec2(5.2, -t * 0.25)));
  float nz = fx_fbm(hp);
  float nz2 = fx_noise(vec2(pr * 10.0 - t * 0.8, d * 5.0 + t * 0.5) + 31.0);
  float hz = u_haze * (0.28 + 0.85 * exp(-k * 2.4)) * mix(0.5, 1.0, thick);
  hz *= 0.25 + 1.25 * smoothstep(-0.5, 0.55, nz) + 0.18 * nz2;
  // the cone ends on the floor
  float ph = u_width * 0.26;
  float aboveFloor = 1.0 - smoothstep(u_poolY - ph * 0.6, u_poolY + ph * 1.2, uv.y);
  float air = cone * hz * aboveFloor;

  // the pool: a soft ellipse flattened by perspective, brightest in the middle
  vec2 pq = vec2((P.x - pool.x) / (u_width * 1.12), (uv.y - u_poolY) / ph);
  float pe = length(pq);
  float poolL = exp(-pe * pe * 1.3) * 0.8 + exp(-pe * pe * 0.45) * 0.18;
  poolL *= 0.9 + 0.1 * fx_noise(pq * 1.7 + t * 0.4 + 9.0);
  float spill = exp(-pe * 0.75) * 0.14 * smoothstep(u_poolY - ph * 5.0, u_poolY, uv.y);
  // a little light bounces off the floor onto the wall behind
  vec2 bq = (P - pool) / vec2(u_width * 3.0, 0.45);
  float bounce = exp(-dot(bq, bq)) * 0.07;
  // where the light enters the frame it is brightest
  float entry = cone * exp(-max(uv.y, 0.0) * 9.0) * 0.35;

  float br = 1.0 + u_breathe * 0.14 * sin(u_time * 0.5 + u_seed);
  float cm = 1.0 - 0.7 * calmMask(uv) * smoothstep(0.0, 0.4, u_calm);
  float L = (air * 0.85 + poolL + spill + bounce + entry) * u_intensity * br * cm;

  // the room: the floor a touch lighter than the wall, corners dimmer
  vec3 ground = u_ground;
  ground.x += u_floor * smoothstep(u_poolY - ph * 3.0, u_poolY + ph * 3.0, uv.y);
  vec2 vq = uv - vec2(u_cx, 0.6);
  ground.x -= u_vig * min(1.0, dot(vq, vq) * 1.6);

  float m = 1.0 - exp(-L * 1.2);
  vec3 col = mix(ground, u_light, m);
  col = mix(col, u_hot, smoothstep(0.55, 0.95, m) * 0.5);
  col.x += fx_grain(gl_FragCoord.xy, floor(u_time * 24.0)) * 0.006 * (0.5 + m);
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

export function tones(P) {
  const { bg, ink, accent } = P;
  const [Lb] = color.lab(bg);
  const tinted = color.chroma(bg) < 0.035 && color.chroma(accent) > 0.035 && !(color.lch(accent)[2] >= 262 && color.lch(accent)[2] <= 338);
  if (Lb < 0.6) {
    // dark: the light is a white tinted by the palette
    const base = color.adjust(bg, { l: 0.9 - Lb, c: 0.3 });
    const light = tinted ? color.mix(base, color.withLightness(accent, 0.88), 0.16) : base;
    return {
      ground: color.darken(bg, Math.min(0.03, Lb * 0.1)),
      light,
      hot: color.mix(light, color.withLightness(ink, 0.99), 0.6),
      floor: 0.012, vig: 0.04,
    };
  }
  // light page: the room stays within a few points of the page lightness (no added colour), only
  // the corners away from the light dim; the light goes toward white
  return {
    ground: color.darken(bg, Math.min(0.03, Lb * 0.03)),
    light: color.fromLch([Math.min(0.995, Lb + 0.09), color.chroma(bg) * 0.6, color.lch(bg)[2]]),
    hot: color.fromLch([Math.min(0.998, Lb + 0.1), color.chroma(bg) * 0.35, color.lch(bg)[2]]),
    floor: 0.008, vig: 0.025,
  };
}

// where the pool lands: the asked x, moved to the far side of the text (calm) when the two would meet
export function poolX(prm) {
  let x = prm.x;
  if (prm.calm > 0.05 && Math.abs(x - prm.calmX) < 0.34) x = prm.calmX < 0.5 ? prm.calmX + 0.42 : prm.calmX - 0.42;
  return Math.min(0.78, Math.max(0.22, x));
}

function uniforms({ palette, params: prm, width, height }) {
  const k = tones(palette);
  const x = poolX(prm);
  // the lamp leans in from the side with more room
  const lean = (x < 0.5 ? 1 : -1) * prm.lean;
  return { u_ground: color.labVec(k.ground), u_light: color.labVec(k.light), u_hot: color.labVec(k.hot), u_floor: k.floor, u_vig: k.vig, u_cx: x, u_leanS: lean };
}

export default {
  id: 'spotlight-cone',
  name: 'Stage spotlight',
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
        const k = tones(P);
        const x = poolX(prm) * 100, y = prm.poolY * 100;
        return `radial-gradient(${prm.width * 110}% ${prm.width * 40}% at ${x}% ${y}%, ${color.mix(k.ground, k.hot, 0.75)}, transparent 100%), `
          + `radial-gradient(${prm.width * 90}% ${y}% at ${x}% 0%, ${color.mix(k.ground, k.light, 0.3)}, transparent 80%), ${k.ground}`;
      },
    });
  },
};
