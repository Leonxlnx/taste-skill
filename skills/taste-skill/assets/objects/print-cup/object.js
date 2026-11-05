/*
  print-cup - a coffee cup on its saucer, modelled as revolved profiles (the saucer's well and
  rim, the cup's foot, belly and lip), a looped handle and the coffee's surface. The glaze outside the
  cup is the accent plate; the white inside, the saucer and the coffee print in the ink. Rendered:
  white porcelain, the glaze in the accent, glossy coffee with milk.
  Turns slowly on the saucer's axis. Hover: the light follows the pointer and the cup leans toward
  it. Click or Enter: rings run out across the coffee, catch the light and settle.
*/
import { definePrint } from '../_print-core/print3d.js';

const glsl = /* glsl */ `
// revolved profiles in (radius, height); every line has its own thickness, so lips and rims are round
float saucer(vec2 q) {
  float d = sdSeg(q, vec2(0.0, 0.026), vec2(0.17, 0.026));
  d = smin(d, sdSeg(q, vec2(0.17, 0.026), vec2(0.33, 0.041)), 0.03);
  d = smin(d, sdSeg(q, vec2(0.33, 0.041), vec2(0.445, 0.072)), 0.04);
  d -= 0.011;
  return min(d, length(q - vec2(0.155, 0.009)) - 0.009);   // the foot ring underneath
}
// the wall follows one smooth curve from the foot (r 0.112 at y 0.052) to the lip (r 0.259 at y
// 0.352), round in the belly, so it reads as thrown porcelain and not as bands; the distance to the
// curve is scaled by its slope, beyond its ends it is the distance to the end
float cupWall(vec2 q) {
  float y = clamp(q.y, 0.052, 0.352);
  float t = (y - 0.052) / 0.3;
  float R = 0.112 + 0.147 * (1.0 - pow(1.0 - t, 2.8));
  float dR = 0.147 * 2.8 * pow(1.0 - t, 1.8) / 0.3;
  float d = q.y > 0.352 || q.y < 0.052 ? length(q - vec2(R, y)) : abs(q.x - R) / sqrt(1.0 + dR * dR);
  d = min(d, sdSeg(q, vec2(0.0, 0.052), vec2(0.112, 0.052)));   // the bottom
  return d - 0.0135;
}
float handle(vec3 p) {
  vec3 h = p - vec3(0.302, 0.222, 0.0);
  h.y *= 0.84;
  float d = length(vec2(length(h.xy) - 0.066, h.z * 0.86)) - 0.0145;
  return max(d, 0.238 - p.x);
}
// rings that run out from the middle after a click and die away: phase and strength
float ringEnv(float r) {
  float k = u_kick;
  float front = 0.03 + k * 0.17;
  return exp(-k * 0.55) * smoothstep(front, front - 0.08, r) * smoothstep(0.0, 0.03, r + 0.01);
}
float ripple(float r) { return 0.011 * ringEnv(r) * sin(r * 62.0 - u_kick * 8.0); }
// the coffee's surface: level, with rings after a click, and a meniscus where it climbs the porcelain
// (it curves up the last few millimetres, so its far side catches the light above and its near side
// goes dark: the rim that tells a liquid from a disc)
float coffee(vec3 p, float r) {
  float m = smoothstep(0.205, 0.245, r);
  float d = max(p.y - (0.298 + ripple(r) + 0.0055 * m * m), r - 0.245);
  return max(d * 0.7, 0.25 - p.y);   // a disc inside the wall, never through it (0.7: the rings are steep)
}

vec2 map(vec3 p) {
  float r = length(p.xz);
  vec2 q = vec2(r, p.y);
  vec2 res = vec2(saucer(q), 1.0);
  float c = cupWall(q), h = handle(p);
  float ch = smin(c, h, 0.014);
  if (ch < res.x) res = vec2(ch, h < c ? 3.0 : 2.0);
  float k = coffee(p, r);
  if (k < res.x) res = vec2(k, 4.0);
  return res;
}

void surf(float id, vec3 p, vec3 n, inout Surf s) {
  float r = length(p.xz);
  if (u_render > 0.5) {
    // the render: white porcelain, the glaze outside the cup in the accent, coffee with its crema
    s.gloss = 0.85; s.shine = 70.0;
    if (id < 1.5) s.col = vec3(0.8, 0.79, 0.76);
    else if (id < 3.5) {
      bool outside = id > 2.5 || (dot(n.xz, p.xz) > 0.0 && !(p.y > 0.34 && n.y > 0.45));
      if (outside) s.accent = 1.0; else s.col = vec3(0.8, 0.79, 0.76);
    } else {
      // coffee with milk: an even crema, a shade deeper in the middle; glossy, so the room above lies
      // on it and the meniscus at the porcelain catches the light (no painted line there: it stepped)
      s.col = mix(vec3(0.125, 0.056, 0.02), vec3(0.19, 0.088, 0.034), smoothstep(0.04, 0.23, r));
      s.gloss = 1.0; s.shine = 120.0;
    }
    // the line where the coffee meets the white inside: a texel's hit is the one or the other, so the
    // line stair-steps; within about a texel of it each side takes up to half of the other's colour
    // and finish (a texel is about 6 u_pix wide here; the coffee's plane is seen foreshortened)
    const vec3 PORC = vec3(0.8, 0.79, 0.76), CREMA = vec3(0.19, 0.088, 0.034);
    float fw = max(6.0 * u_pix, 1e-4);
    if (id > 3.5) {
      float e = 0.5 * clamp(1.0 - (0.2447 - r) / (1.8 * fw), 0.0, 1.0);
      s.col = mix(s.col, PORC, e); s.gloss = mix(s.gloss, 0.85, e); s.shine = mix(s.shine, 70.0, e);
    } else if (id > 1.5 && id < 2.5 && s.accent < 0.5 && p.y > 0.27 && p.y < 0.34) {
      float e = 0.5 * clamp(1.0 - (p.y - 0.3035) / (1.1 * fw), 0.0, 1.0);
      s.col = mix(s.col, CREMA, e); s.gloss = mix(s.gloss, 1.0, e); s.shine = mix(s.shine, 120.0, e);
    }
    return;
  }
  if (id < 1.5) {            // saucer, white glaze
    s.albedo = 0.9; s.gloss = 0.5; s.shine = 36.0; s.coord = r;
  } else if (id < 3.5) {     // the cup: coloured glaze outside, white inside
    bool outside = id > 2.5 || (dot(n.xz, p.xz) > 0.0 && !(p.y > 0.34 && n.y > 0.45));
    s.albedo = outside ? 0.74 : 0.92;
    s.gloss = 0.55; s.shine = 48.0;
    s.accent = outside ? 1.0 : 0.0;
    s.coord = p.y;
  } else {                   // coffee: dark middle, the crema lighter toward the cup; the crests of the rings catch the light
    s.albedo = 0.42 + 0.34 * smoothstep(0.1, 0.245, r);
    s.gloss = 0.9; s.shine = 90.0;
    float crest = smoothstep(0.35, 0.95, sin(r * 62.0 - u_kick * 8.0)) * ringEnv(r);
    s.emit = 0.55 * crest;
    s.coord = r;
  }
}
`;

export default definePrint({
  id: 'print-cup',
  name: 'Cup and saucer',
  label: 'A cup of coffee on its saucer',
  press: 'Press to stir the coffee.',
  base: import.meta.url,
  glsl,
  pivot: [0, 0.18, 0],
  radius: 0.5,
  extent: [0.47, 0.36],
  foot: 0.45,
  camera: { elev: 27, dist: 6 },
  turn: { mode: 'spin', speed: 10 },
  step: 'impulse',
  kickTime: 5,
  kickStill: 0.9,
  params: { effect: { default: 'render' }, angle: { default: -32 }, size: { default: 0.72 } },
  // card: cut by the bottom-left (the bottom-right corner stays clear for the pause button), and in a
  // panel about as tall as wide (a phone) less cut, so the thing still reads; tile: whole, low; hero:
  // right of the text, smaller and under it in a phone-shaped frame
  place: {
    card: { transparent: 1, size: 1.12, x: -0.2, y: -0.22, narrow: { size: 0.92, x: -0.1, y: -0.24 } },
    tile: { transparent: 1, size: 0.92, y: -0.1 },
    hero: { transparent: 1, size: 1.0, x: 0.2, y: -0.1, narrow: { size: 0.8, x: 0.05, y: -0.26 } },
  },
});
