// caustics: sunlight through rippling water on the floor of a pool. One slowly shifting net of curved
// light lines (the edges of an animated Voronoi grid, F2 - F1, on a noise-warped plane). The lines are
// uneven: where the light gathers (a slow focus field) they are bright and thick and the knots where
// they merge flare; elsewhere they are dim and soft. Large brighter and darker patches drift across
// the floor, and a calm area the size of a text block stays near empty.
import { shader, color } from '../fx.js';

const params = {
  scale:      { default: 5,    min: 1.5, max: 8,   step: 0.1 },  // cells per frame height (below 4 the net reads as cracked tiles)
  sharpness:  { default: 3,    min: 1,   max: 8,   step: 0.1 },  // crisper line cores
  speed:      { default: 0.15, min: 0,   max: 1,   step: 0.01 },
  intensity:  { default: 0.75, min: 0,   max: 1.2, step: 0.01 },
  distortion: { default: 0.62, min: 0,   max: 1,   step: 0.01 },  // how wavy the lines are (above 0.7 the plane can fold into loops)
  depth:      { default: 0.6,  min: 0,   max: 1,   step: 0.01 },  // large light and dark patches across the floor
  calm:       { default: 0.5,  min: 0,   max: 1,   step: 0.01 },  // clear a text-block area of light
  calmX:      { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:      { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// a feature point per cell, each on its own slow orbit inside the cell
#if __VERSION__ >= 300
// one hash round per cell (the library's fx_hash2 does six); split into two 16-bit values
vec2 cellRand(vec2 id) {
  uvec2 c = uvec2(ivec2(id) + ivec2(8192));
  uint h = fx_u32((c.x * 1597334677u) ^ (c.y * 3812015801u) ^ (uint(u_seed) * 2654435769u));
  return vec2(float(h & 65535u), float(h >> 16u)) * (1.0 / 65535.0);
}
#else
vec2 cellRand(vec2 id) { return fx_hash2(id); }
#endif
vec2 cpt(vec2 id, float t) {
  vec2 h = cellRand(id);
  return 0.5 + 0.36 * vec2(sin(t * (0.7 + 0.6 * h.x) + FX_TAU * h.y), cos(t * (0.6 + 0.6 * h.y) + FX_TAU * h.x));
}
// x: F2 - F1, zero on the cell edges; y: F3 - F1, small where three cells meet
vec2 edgeDist(vec2 p, float t) {
  vec2 i = floor(p), f = fract(p);
  float f1 = 9.0, f2 = 9.0, f3 = 9.0;
  for (int yy = -1; yy <= 1; yy++) {
    for (int xx = -1; xx <= 1; xx++) {
      vec2 g = vec2(float(xx), float(yy));
      vec2 o = g + cpt(i + g, t) - f;
      float d = dot(o, o);
      if (d < f1) { f3 = f2; f2 = f1; f1 = d; }
      else if (d < f2) { f3 = f2; f2 = d; }
      else if (d < f3) { f3 = d; }
    }
  }
  float s1 = sqrt(f1);
  return vec2(sqrt(f2) - s1, sqrt(f3) - s1);
}
// 1 inside an ellipse the size of a text block around the calm point, 0 well outside it
float calmMask(vec2 uv) {
  vec2 d = (uv - vec2(u_calmX, u_calmY)) * vec2(u_res.x / u_res.y, 1.0);
  vec2 R = vec2(0.34 + 0.4 * u_calm, 0.15 + 0.14 * u_calm);
  return 1.0 - smoothstep(0.8, 1.35, length(d / R));
}

void main() {
  vec2 uv = fx_uv();
  vec2 P = vec2(uv.x * u_res.x / u_res.y, uv.y);
  float t = u_time * u_speed + u_seed * 0.173;

  // slow noise bends the plane, so the cell edges curve like ripples, not polygons
  vec2 q = P * u_scale + u_seed * 0.0131;
  vec2 w1 = vec2(fx_noise(q * 0.33 + vec2(t * 0.2, 1.7)), fx_noise(q * 0.33 + vec2(4.1, -t * 0.18)));
  vec2 w2 = vec2(fx_noise(q * 0.8 + vec2(-t * 0.27, 8.3)), fx_noise(q * 0.8 + vec2(2.9, t * 0.25)));
  q += (w1 + 0.75 * w2) * u_distortion * 1.4;
  vec2 e = edgeDist(q, t * 1.2);

  // focus: where the water bunches the light into strong filaments, and where it spreads it thin
  float F = smoothstep(-0.35, 0.4, fx_fbm(P * 1.25 + vec2(t * 0.05, -t * 0.04) + 7.0));
  float jn = 1.0 - smoothstep(0.0, 0.32, e.y);   // near a knot where lines merge
  float pxc = u_scale / u_res.y;                  // one device pixel in cell units
  // in the focus the line has a crisp bright core, thickest where lines merge; elsewhere only a
  // dim, blurred line remains
  float wc = max(mix(0.004, 0.03, F) * (1.0 + 1.2 * jn * F), 1.2 * pxc);
  float core = pow(1.0 - smoothstep(0.0, wc, e.x), 0.35 * u_sharpness + 0.6) * smoothstep(0.15, 0.7, F);
  float sw = mix(0.06, 0.025, F);
  float soft = exp(-e.x * e.x / (sw * sw)) * mix(0.2, 0.42, F);
  float tail = pow(wc / (e.x + wc), 1.5) * 0.3 * F;  // light piling up along a fold of the surface
  float rim = exp(-e.x * 3.5) * 0.08;               // each cell brightens a little toward its rim
  float I = core + soft + tail + rim;
  I *= 1.0 + 0.8 * jn * F;

  // large, slowly drifting patches of brighter (shallow) and darker (deep) floor
  float patchy = smoothstep(-0.5, 0.5, fx_fbm(P * 0.55 + vec2(-t * 0.03, t * 0.022) + 3.0));
  I *= mix(1.0 - 0.85 * u_depth, 1.0, patchy);
  float cm = calmMask(uv) * smoothstep(0.0, 0.35, u_calm);
  I *= (1.0 - 0.97 * cm) * u_intensity;

  vec3 ground = mix(u_deep, u_shallow, mix(0.5, patchy, u_depth));
  ground = mix(ground, u_shallow, cm * 0.8);      // the calm area is an even, quiet floor
  vec3 col = mix(ground, u_light, clamp(I, 0.0, 1.0));
  col.x += fx_grain(gl_FragCoord.xy, floor(u_time * 24.0)) * 0.006;
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

const violet = h => h >= 262 && h <= 338;

export function tones(P) {
  const { bg, ink, accent } = P;
  const [Lb, Cb, hb] = color.lch(bg);
  const [, Ca, ha] = color.lch(accent);
  const useAcc = Ca > 0.04 && !violet(ha);
  if (Lb < 0.6) {
    // dark: the water keeps the page's lightness; a cool accent (green to blue) may turn its hue,
    // but never drags it darker or browner. Warm accents only warm the light lines.
    const cool = useAcc && ha >= 150 && ha < 262 && Cb < 0.07;
    const water = cool ? color.fromLch([Lb + 0.02, Math.max(Cb, 0.035), ha]) : color.lighten(bg, 0.012);
    const [Lw, Cw, hw] = color.lch(water);
    const pale = color.fromLch([0.9, Math.min(0.05, Cw * 0.6 + 0.01), hw]);
    return {
      deep: color.fromLch([Math.max(0, Lw - 0.025), Cw, hw]),
      shallow: color.fromLch([Lw + 0.045, Cw * 1.1, hw]),
      // on a coloured ground the lines stay a pale of the ground unless the accent is a near hue
      light: useAcc && (Cb < 0.07 || color.hueDistance(bg, accent) < 50) ? color.mix(pale, color.withLightness(accent, 0.9), cool ? 0.25 : 0.3) : color.mix(pale, ink, 0.15),
    };
  }
  // light: the floor is the page itself in its own hue (no accent mixed in), deeper in the dark
  // patches, and the light lines go toward white
  return {
    deep: color.fromLch([Lb - 0.065, Cb * 1.05, hb]),
    shallow: color.fromLch([Lb - 0.012, Cb, hb]),
    light: color.fromLch([Math.min(0.998, Lb + 0.1), Cb * 0.45, hb]),
  };
}

function uniforms({ palette }) {
  const k = tones(palette);
  return { u_deep: color.labVec(k.deep), u_shallow: color.labVec(k.shallow), u_light: color.labVec(k.light) };
}

export default {
  id: 'caustics',
  name: 'Water caustics',
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
      still: 5,
      maxDpr: 1.5, // a Voronoi net per pixel: 1.5 keeps the lines crisp and retina screens smooth
      fallback: ({ palette: P }) => {
        const k = tones(P);
        return `radial-gradient(60% 50% at 72% 28%, ${color.mix(k.shallow, k.light, 0.3)}, transparent 75%), radial-gradient(50% 40% at 30% 80%, ${k.shallow}, transparent 70%), ${k.deep}`;
      },
    });
  },
};
