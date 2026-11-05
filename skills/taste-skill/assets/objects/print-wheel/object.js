/*
  print-wheel - a road bicycle wheel: tyre with gum sidewalls, a box-section rim with its valve, a hub
  with two flanges and a quick-release skewer, and 24 radial spokes laced to alternate flanges, so the
  wheel is dished like the real thing when it turns edge-on.
  The wheel sways slowly through three-quarter views and rolls round its axle. Hover: the light
  follows the pointer and the wheel leans toward it. Click, Enter or focus: it spins up fast, and
  winds down again on the next click (or when focus leaves).
  The spokes print as wire in the ink on every paper (dark wire on light paper, bright on dark).
  Rendered: a black tread with tan gum sidewalls, an alloy rim, black spokes and a hub in the accent.
*/
import { definePrint } from '../_print-core/print3d.js';

const DEG = Math.PI / 180;

const glsl = /* glsl */ `
const vec3 HUB = vec3(0.0, 0.5, 0.0);           // the tyre (outer radius 0.496) stands on the floor
const float SECTOR = 6.28318530718 / 12.0;   // the angle between two spokes of one flange

// the 12 spokes of one flange: repeat round the axle so the nearest of them is the one evaluated
// (the flanges alternate, so each needs its own repetition or a ray skips a spoke seen at an angle)
float spokes(vec3 s, float off, float zf) {
  float a = atan(s.y, s.x) - off;
  float k = floor(a / SECTOR + 0.5);
  vec2 l = rot2(-(k * SECTOR + off)) * s.xy;
  // a print: never thinner than about half a texel at the wheel, so small frames draw whole spokes,
  // not dashes; the render: a 2 mm spoke, smoothed at its edges, never under about two thirds of a texel
  float sr = u_render > 0.5 ? max(0.0016, 2.0 * u_pix) : max(0.0031, 3.0 * u_pix);
  return sdCapsule(vec3(l, s.z), vec3(0.036, 0.0, zf), vec3(0.403, 0.0, 0.0), sr);
}

vec2 map(vec3 p) {
  vec3 q = p - HUB;
  // hub and skewer do not turn with the wheel (they are round anyway; the lever stays put)
  float hub = sdCyl(q.xzy, 0.019, 0.05, 0.006);
  vec3 fq = vec3(q.xy, abs(q.z) - 0.034);
  hub = min(hub, sdCyl(fq.xzy, 0.041, 0.0035, 0.002));
  float axle = sdCyl(q.xzy, 0.0055, 0.08, 0.002);
  // the quick-release: a polished cam on the skewer's end, the nut on the other, and the lever: a
  // flat blade that widens to a paddle and curves back toward the hub, as on a real skewer
  vec3 lq = q - vec3(0.0, 0.0, 0.086);
  axle = min(axle, sdCyl(lq.xzy, 0.0095, 0.0055, 0.002));
  axle = min(axle, sdCyl((q + vec3(0.0, 0.0, 0.084)).xzy, 0.0085, 0.0045, 0.002));
  vec2 ld = vec2(0.906, -0.423);                      // 25 degrees below the horizontal
  vec2 uv = vec2(dot(lq.xy, ld), dot(lq.xy, vec2(-ld.y, ld.x)));
  float along = clamp(uv.x, 0.0, 0.088);
  float bw = mix(0.0042, 0.0115, smoothstep(0.014, 0.072, along));
  float cross2 = sdRect(vec2(uv.y, lq.z - 0.0045 + 0.7 * along * along), vec2(bw, 0.0028), 0.0019);
  float ends = abs(uv.x - 0.044) - 0.044;
  float lever = min(max(cross2, ends), 0.0) + length(max(vec2(cross2, ends), 0.0)) - 0.0012;
  // the turning parts
  vec3 s = vec3(rot2(u_spin) * q.xy, q.z);
  float r = length(s.xy);
  float tyre = length(vec2(r - 0.462, s.z * 1.1)) - 0.034;
  float rim = sdRect(vec2(r - 0.414, s.z), vec2(0.019, 0.0105), 0.004);
  float valve = sdCapsule(s, vec3(0.0, 0.398, 0.0), vec3(0.0, 0.366, 0.0), 0.0055);
  // 24 radial spokes, laced to the two flanges in turn
  float sp = min(spokes(s, -SECTOR * 0.25, 0.034), spokes(s, SECTOR * 0.25, -0.034));
  vec2 res = vec2(tyre, 1.0);
  if (rim < res.x) res = vec2(rim, 2.0);
  if (sp < res.x) res = vec2(sp, 3.0);
  if (hub < res.x) res = vec2(hub, 4.0);
  if (axle < res.x) res = vec2(axle, 5.0);
  if (lever < res.x) res = vec2(lever, 6.0);
  if (valve < res.x) res = vec2(valve, 5.0);
  return res;
}

void surf(float id, vec3 p, vec3 n, inout Surf s) {
  vec3 q = p - HUB;
  float r = length(q.xy);
  s.coord = r;                                   // engraved: rings round the axle
  if (u_render > 0.5) {
    // the render: a black tread with tan gum sidewalls, a brushed alloy rim with a machined brake
    // track, black stainless spokes, the hub shell anodised in the accent, a polished skewer
    if (id < 1.5) {
      bool wall = r < 0.457 && abs(n.z) > 0.35;
      s.col = wall ? vec3(0.3, 0.16, 0.065) : vec3(0.018); s.gloss = wall ? 0.35 : 0.3; s.shine = wall ? 20.0 : 14.0;
    } else if (id < 2.5) {
      bool track = abs(n.z) > 0.8 && r > 0.398;
      s.col = track ? vec3(0.7, 0.7, 0.72) : vec3(0.55, 0.56, 0.58); s.metal = 1.0; s.gloss = 0.9; s.shine = track ? 30.0 : 55.0;
    } else if (id < 3.5) {
      s.col = vec3(0.03); s.metal = 0.6; s.gloss = 0.7; s.shine = 60.0;
    } else if (id < 4.5) {
      s.accent = 1.0; s.metal = 0.55; s.gloss = 0.85; s.shine = 60.0;
    } else if (id < 5.5) {
      s.col = vec3(0.75, 0.75, 0.76); s.metal = 1.0; s.gloss = 0.9; s.shine = 70.0;
    } else {
      s.col = vec3(0.8, 0.8, 0.81); s.metal = 1.0; s.gloss = 0.95; s.shine = 90.0;   // the lever: polished alloy, like the cam
    }
    return;
  }
  if (id < 1.5) {                                // tyre: black tread, gum sidewalls in the accent
    bool wall = r < 0.457 && abs(n.z) > 0.35;
    s.albedo = wall ? 0.7 : 0.13; s.gloss = wall ? 0.08 : 0.18; s.shine = 12.0;
    s.accent = wall ? 1.0 : 0.0;
  } else if (id < 2.5) {                         // rim: brushed alloy
    s.albedo = 0.82; s.gloss = 0.8; s.shine = 70.0;
  } else if (id < 3.5) {                         // spokes: wire, printed in the ink
    s.albedo = u_dark > 0.5 ? 1.0 : 0.04; s.emit = u_dark > 0.5 ? 0.45 : 0.0; s.gloss = 0.0;
    s.wire = 1.0;                                // whole lines in every print, never dashes
  } else if (id < 4.5) {                         // hub shell, polished
    s.albedo = 0.86; s.gloss = 0.9; s.shine = 80.0; s.coord = q.z * 1.6;
  } else {                                       // skewer, lever and valve
    s.albedo = 0.22; s.gloss = 0.7; s.shine = 60.0;
  }
}
`;

export default definePrint({
  id: 'print-wheel',
  name: 'Bicycle wheel',
  label: 'A road bicycle wheel turning on its axle',
  base: import.meta.url,
  glsl,
  pivot: [0, 0.5, 0],
  radius: 0.52,
  extent: [0.5, 0.52],
  camera: { elev: 12, dist: 6, target: 0.44 },
  turn: { mode: 'sway', amp: 30, period: 20 },
  step: 'toggle',
  stepTime: 1.4,
  light: [-0.36, 1.5, 0.75],
  steps: 160,
  shadowSteps: 48,
  press: 'Press to spin it up.',
  params: { effect: { default: 'render' }, angle: { default: -30 }, size: { default: 0.8 } },
  // card: cut by the bottom-left (the bottom-right corner stays clear for the pause button), and in a
  // panel about as tall as wide (a phone) less cut, so the thing still reads; tile: whole, low; hero:
  // right of the text, smaller and under it in a phone-shaped frame
  place: {
    card: { transparent: 1, size: 1.25, x: -0.25, y: -0.2, narrow: { size: 1.02, x: -0.2, y: -0.16 } },
    tile: { transparent: 1, size: 0.88, y: -0.05 },
    hero: { transparent: 1, size: 1.1, x: 0.22, y: -0.1, narrow: { size: 0.78, x: 0.1, y: -0.2 } },
  },
  // the wheel rolls on its axle: slowly at rest, faster while the step is on (at most about 220
  // degrees a second, under the 7.5 degrees a frame at which 24 spokes would strobe at 60 Hz)
  update(state, dt) {
    const e = state.step * state.step * (3 - 2 * state.step);
    return { spin: state.spin - dt * (18 + 200 * e) * Math.min(state.params.speed, 1.5) * DEG };
  },
});
