/*
  print-lamp - a balanced-arm desk lamp, the classic design: a heavy stepped round base with a turret,
  a lower and an upper arm each of two parallel rods, two coil springs that carry the arm (hooked to
  a crossbar on the rods), knuckle joints with chrome caps, a domed shade with a vent cowl and a
  rolled rim, and its bulb. Base and shade in the accent; the rods, springs and joints in the ink.
  Rendered: clear-coated enamel in the accent, graphite rods, chrome springs and caps, a white inside.
  It sways slowly about its base, the profile always readable. Hover: the light follows the pointer
  and the lamp leans toward it. Click, Enter or focus: the lamp switches on: the bulb shows under the
  rim, the rim and the inside of the shade light up, and a pool of warm light falls on the desk in
  front of the base; click again to switch it off.
*/
import { definePrint } from '../_print-core/print3d.js';

const glsl = /* glsl */ `
const vec3 BASE = vec3(-0.08, 0.0, 0.0);
const vec3 P0 = vec3(-0.08, 0.098, 0.0);         // the base pivot, in the turret
const vec3 P1 = vec3(-0.262, 0.478, 0.0);        // elbow
const vec3 P2 = vec3(0.118, 0.698, 0.0);         // head joint
const vec3 SD = vec3(0.2465, -0.9200, 0.3048);   // the shade's axis: down, 15 degrees out and swivelled
                                                 // a little toward you, so you see into it when it is on
const vec3 SA = vec3(0.150, 0.664, 0.012);       // the shade's crown on that axis
const float SLEN = 0.17;                         // crown to rim along the axis
const float RIM = 0.122;                         // the rim's radius
const float ROD = 0.024;                         // half the gap between a pair of rods

// the shade in its own (radius, along the axis) plane: a domed crown, then a bell that rounds out at
// the shoulder and flares to a rolled rim, one smooth curve so the enamel shades evenly; the
// distance to the curve scaled by its slope
float shadeProfile(vec2 ra) {
  float rad = ra.x, ax = ra.y, d;
  if (ax < 0.0) d = (length(vec2(rad / 0.046, ax / 0.03)) - 1.0) * 0.03;
  else if (ax > SLEN) d = length(vec2(rad, ax) - vec2(RIM, SLEN));
  else {
    float t = ax / SLEN;
    float R = 0.046 + (RIM - 0.046) * (1.0 - pow(1.0 - t, 2.2));
    float dR = (RIM - 0.046) * 2.2 * pow(1.0 - t, 1.2) / SLEN;
    d = (rad - R) / sqrt(1.0 + dR * dR);
  }
  float shell = abs(d) - 0.0042;
  float rim = length(ra - vec2(RIM + 0.0015, SLEN + 0.002)) - 0.0072;
  // the vent cowl on the crown: a short drum
  vec2 cw = vec2(rad - 0.024, abs(ax + 0.036) - 0.011);
  float cowl = min(max(cw.x, cw.y), 0.0) + length(max(cw, 0.0)) - 0.003;
  return min(min(shell, rim), cowl);
}
vec2 shadeCoords(vec3 p) { vec3 v = p - SA; float ax = dot(v, SD); return vec2(length(v - SD * ax), ax); }

// a coil spring from a to b: rings of wire round the axis, one per pitch; where the rings would be
// finer than a few texels (a small frame) a smooth tube of the same girth, so it never shimmers
float coil(vec3 p, vec3 a, vec3 b, float rc, float wire, float pitch) {
  vec3 ab = b - a;
  float len = length(ab);
  vec3 ax = ab / len, pa = p - a;
  float u = dot(pa, ax);
  float rad = length(pa - ax * u);
  float k = clamp(floor(u / pitch + 0.5), 0.0, floor(len / pitch));
  float rings = length(vec2(rad - rc, u - k * pitch)) - wire;
  float tube = max(rad - rc - wire * 0.6, abs(u - 0.5 * len) - 0.5 * len);
  float sharp = smoothstep(2.5, 4.5, pitch / max(6.0 * u_pix, 1e-5));
  // the hooks at both ends: a short wire to its anchor
  float hooks = min(sdCapsule(p, a - ax * 0.012, a, wire * 1.1), sdCapsule(p, b, b + ax * 0.012, wire * 1.1));
  return min(mix(tube, rings, sharp), hooks);
}

vec2 map(vec3 p) {
  vec3 b = p - BASE;
  // the base: a heavy disc with a bevelled edge, a second step, and the turret the arm pivots in
  float base = min(sdCyl(b - vec3(0.0, 0.019, 0.0), 0.168, 0.019, 0.011), sdCyl(b - vec3(0.0, 0.046, 0.0), 0.108, 0.01, 0.007));
  float turret = sdRoundBox(p - vec3(P0.x, 0.074, 0.0), vec3(0.022, 0.024, 0.036), 0.007);
  vec3 pa = vec3(p.xy, abs(p.z));
  // never thinner than about half a texel, so a small frame (a phone's card) draws whole rods
  float rr = max(0.0052, 3.0 * u_pix);
  float rods = min(sdCapsule(pa, vec3(P0.xy, ROD), vec3(P1.xy, ROD), rr), sdCapsule(pa, vec3(P1.xy, ROD), vec3(P2.xy, ROD), rr));
  // the bracket from the head joint to the shade's crown
  rods = min(rods, sdCapsule(p, P2, SA - SD * 0.02, 0.0085));
  // two springs behind the lower arm, from the turret to a third of the way up
  vec3 dir = normalize(P1 - P0), side = vec3(-dir.y, dir.x, 0.0);
  vec3 s0 = P0 - side * 0.034 + dir * 0.02, s1 = P0 + (P1 - P0) * 0.44 - side * 0.03;
  float sA = coil(p, s0 + vec3(0.0, 0.0, 0.012), s1 + vec3(0.0, 0.0, 0.012), 0.0075, 0.0019, 0.0068);
  float sB = coil(p, s0 - vec3(0.0, 0.0, 0.012), s1 - vec3(0.0, 0.0, 0.012), 0.0075, 0.0019, 0.0068);
  // a print draws the pair as one band: two thin lines joined by their hooks printed as an outline
  float springs = u_render > 0.5 ? min(sA, sB) : smin(sA, sB, 0.018);
  // their lower hooks catch a lug that rises from the turret's top corner, so no spring ends in the air
  vec3 h0 = s0 - normalize(s1 - s0) * 0.012;
  vec3 lugTop = vec3(h0.xy, 0.012), lugFoot = vec3(P0.x + 0.013, P0.y - 0.014, 0.012);
  springs = min(springs, sdCapsule(pa, lugTop, lugFoot, 0.0036));
  // the springs' top hooks on a crossbar clamped across the two rods
  vec3 cl = P0 + (P1 - P0) * 0.47;
  rods = min(rods, sdCapsule(p, cl - vec3(0.0, 0.0, ROD), cl + vec3(0.0, 0.0, ROD), 0.0046));
  rods = min(rods, sdCapsule(pa, vec3(cl.xy, 0.012), vec3((s1 + dir * 0.012).xy, 0.012), 0.0032));
  // knuckles across the rods at the three joints, with a cap on the near end
  float joints = min(sdCyl((p - P0).xzy, 0.019, 0.038, 0.004), sdCyl((p - P1).xzy, 0.016, 0.034, 0.004));
  joints = min(joints, sdCyl((p - P2).xzy, 0.016, 0.034, 0.004));
  float caps = min(sdCyl((p - P1 - vec3(0.0, 0.0, 0.041)).xzy, 0.0125, 0.007, 0.003), sdCyl((p - P2 - vec3(0.0, 0.0, 0.041)).xzy, 0.0125, 0.007, 0.003));
  caps = min(caps, sdCyl((p - P0 - vec3(0.0, 0.0, 0.045)).xzy, 0.014, 0.007, 0.003));
  vec2 sc = shadeCoords(p);
  float shade = shadeProfile(sc);
  float bulb = length(p - (SA + SD * 0.128)) - 0.034;   // it shows a little under the rim
  vec2 res = vec2(base, 1.0);
  if (turret < res.x) res = vec2(turret, 3.0);
  if (rods < res.x) res = vec2(rods, 2.0);
  if (springs < res.x) res = vec2(springs, 6.0);
  if (joints < res.x) res = vec2(joints, 3.0);
  if (caps < res.x) res = vec2(caps, 8.0);
  if (shade < res.x) res = vec2(shade, 4.0);
  if (bulb < res.x) res = vec2(bulb, 5.0);
  return res;
}

void surf(float id, vec3 p, vec3 n, inout Surf s) {
  s.coord = p.y;
  vec2 sc = shadeCoords(p);
  if (u_render > 0.5) {
    // the render: base and shade in a clear-coated enamel in the accent, graphite rods, chrome springs
    // and caps, black knuckles, the inside of the shade white; on, the bulb and the inside glow
    if (id < 1.5) { s.accent = 1.0; s.gloss = 0.9; s.shine = 90.0; }
    else if (id < 2.5) { s.col = vec3(0.03, 0.032, 0.035); s.metal = 0.35; s.gloss = 0.75; s.shine = 60.0; }
    else if (id < 3.5) { s.col = vec3(0.022); s.metal = 0.2; s.gloss = 0.6; s.shine = 40.0; }
    else if (id < 4.5) {
      // outside: the enamel; inside (under the shell, facing the axis): matte white
      float R = sc.y < 0.0 ? 0.0 : 0.046 + (RIM - 0.046) * (1.0 - pow(1.0 - clamp(sc.y / SLEN, 0.0, 1.0), 2.2));
      bool inner = sc.y > 0.004 && sc.y < SLEN - 0.002 && sc.x < R - 0.0005;
      if (!inner) { s.accent = 1.0; s.gloss = 0.9; s.shine = 90.0; s.emit = u_step * 0.3 * smoothstep(SLEN - 0.01, SLEN + 0.004, sc.y); }
      else { s.col = vec3(0.8, 0.77, 0.7); s.gloss = 0.15; s.shine = 10.0; s.emit = u_step * 1.25; }
      if (sc.y < -0.02) { s.accent = 0.0; s.col = vec3(0.03); s.metal = 0.3; s.gloss = 0.6; s.shine = 40.0; s.emit = 0.0; }   // the cowl
    } else if (id < 5.5) { s.col = vec3(0.86, 0.85, 0.82); s.gloss = 0.5; s.shine = 30.0; s.emit = u_step * 2.4; }
    else { s.col = vec3(0.78, 0.78, 0.8); s.metal = 1.0; s.gloss = 0.95; s.shine = 80.0; }   // springs and caps: chrome
    return;
  }
  if (id < 1.5) {                                // base: enamelled, in the accent
    s.albedo = 0.72; s.gloss = 0.55; s.shine = 40.0; s.accent = 1.0;
    s.coord = length(p.xz - BASE.xz);
  } else if (id < 2.5 || (id > 5.5 && id < 7.5)) {   // rods and springs: printed as wire
    s.albedo = u_dark > 0.5 ? 0.95 : 0.2; s.gloss = 0.2; s.shine = 30.0;
    s.wire = 1.0;                                // a clean solid line in every print, never a chain of dots
  } else if (id < 3.5 || id > 7.5) {             // knuckles, turret and caps
    s.albedo = 0.3; s.gloss = 0.6; s.shine = 40.0;
  } else if (id < 4.5) {                         // shade: accent outside, white inside, lit when on
    float ax = sc.y;
    float R = ax < 0.0 ? 0.0 : 0.046 + (RIM - 0.046) * (1.0 - pow(1.0 - clamp(ax / SLEN, 0.0, 1.0), 2.2));
    bool outside = !(ax > 0.004 && ax < SLEN - 0.002 && sc.x < R - 0.0005);
    s.albedo = outside ? 0.74 : 0.92; s.gloss = outside ? 0.55 : 0.1; s.shine = 36.0;
    s.accent = outside ? 1.0 : 0.0;
    // on: the inside glows, and the rolled rim catches the light on the side you see
    float rim = smoothstep(SLEN - 0.012, SLEN + 0.002, ax);
    s.emit = u_step * (outside ? 0.75 * rim : 0.95);
    // the rim and the inside print as the paper; the shell, lit from inside, a little deeper
    // (on light paper that is the paper itself; on dark paper the light ink at full)
    if (u_step > 0.5 && (rim > 0.5 || !outside)) { s.accent = 0.0; if (u_dark > 0.5) s.lo = 0.9; else s.hi = 0.1; }
    else if (outside) s.lo = 0.5 * u_step * (1.0 - u_dark);
    s.coord = ax;
  } else {                                       // the bulb
    s.albedo = 0.9; s.gloss = 0.8; s.shine = 60.0;
    s.emit = u_step * 1.2;
    // on: the brightest thing in the print (the paper itself on light paper, full light ink on dark)
    s.lo = u_dark > 0.5 ? mix(0.18, 0.95, u_step) : 0.18 * (1.0 - u_step);
    s.hi = u_dark > 0.5 ? 1.0 : mix(0.5, 0.0, u_step);
  }
}

// the pool of light the lamp throws on the desk when it is on
#define FLOOR_EMIT
float floorEmit(vec3 w) {
  // a print leaves it out: printed in dots, a pool apart from the base reads as noise
  if (u_step < 0.001 || u_render < 0.5) return 0.0;
  vec3 p = u_rot * (w - u_pivot) + u_pivot;
  vec3 v = p - (SA + SD * 0.1);
  float d = length(v);
  float cone = smoothstep(0.55, 1.0, dot(v / d, SD));   // bright under the shade, fading out: no hard disc
  // the pool lies under the shade and ends a hand's width out, well inside any frame
  float reach = 1.0 - smoothstep(0.0, 0.26, length(p.xz - vec2(0.34, 0.19)));
  return 0.9 * u_step * cone * cone * reach * clamp(0.5 / (0.12 + d * d), 0.0, 1.0);
}

`;

export default definePrint({
  id: 'print-lamp',
  name: 'Desk lamp',
  label: 'A balanced-arm desk lamp; it switches on when chosen',
  base: import.meta.url,
  glsl,
  pivot: [0.02, 0.37, 0],
  radius: 0.5,
  extent: [0.34, 0.41],
  camera: { elev: 13, dist: 6, target: 0.37 },
  light: [-0.22, 1.45, 0.85],
  turn: { mode: 'sway', amp: 34, period: 22 },
  step: 'toggle',
  stepTime: 0.7,
  budget: 420000,
  press: 'Press to switch it on.',
  params: { effect: { default: 'render' }, angle: { default: 8 }, size: { default: 0.8 } },
  // card: whole but for the base's foot, cut by the panel's bottom edge (a lamp without its base reads
  // as a stray arm), the shade toward the top right, the bottom-right corner clear for the pause
  // button; in a panel about as tall as wide (a phone) a little smaller; tile: whole, low; hero: right
  // of the text, smaller and under it in a phone-shaped frame
  place: {
    card: { transparent: 1, size: 0.98, x: -0.1, y: -0.06, narrow: { size: 0.94, x: -0.04, y: -0.04 } },
    tile: { transparent: 1, size: 0.78, y: -0.01 },
    hero: { transparent: 1, size: 1.0, x: 0.22, y: -0.06, narrow: { size: 0.72, x: 0.1, y: -0.2 } },
  },
});
