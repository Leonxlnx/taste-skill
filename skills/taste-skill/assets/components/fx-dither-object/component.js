// fx-dither-object: a real thing (headphones, an office chair, a camera, a drone) built in code as a lit
// 3D form and printed through an 8x8 ordered dither in the page tones: the ground, a shade, the ink, the
// accent and a deep accent. It is the picture for a product that has no photograph yet.
//   idle:  the object sways slowly on its spot (about 26 s a swing)
//   hover: the object turns to follow the pointer and the light comes from it; each object answers in
//          its own way: sound rings out of the headphones' cups, the chair's seat swivels after the
//          pointer, the camera's lens zooms and its focus ring turns, the drone's rotors spin up and it
//          lifts off its legs
// Cost: the shader runs once per dither cell, not per screen pixel. The canvas has one pixel per cell
// (a 3 CSS px cell: a ninth of the CSS pixels, whatever the screen's DPR) and is scaled up with
// pixelated sampling, so a hero-sized object is well under 0.3 megapixels. Rays that miss the object's
// bounding sphere skip the march; the floor traces a shadow only right under the object. 20 frames a
// second, paused off screen, in a hidden tab and under the pause button (fx.shader). Under reduced
// motion it is drawn once and kept as a picture (still() in shared.js): no context, no frames. One per
// page.
import { fx, palette, tone, color, bag, pauser, still, reduced } from '../shared.js';

/* ------------------------------------------------------------------ shader */

// WebGL1 and WebGL2 alike: no bit operators; on WebGL2 loops start at ZERO so the compiler does not
// unroll map() (WebGL1 wants a constant there)
const COMMON = /* glsl */ `
#if __VERSION__ >= 300
#define ZERO int(min(u_time, 0.0))
#else
#define ZERO 0
#endif
float g_hov; float g_t; vec2 g_m; float g_a; float g_b;
vec3 g_ro; vec3 g_rd; vec3 g_uu; vec3 g_vv; vec3 g_ww; float g_hitT; float g_hit;
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdCap(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdCylY(vec3 p, float r, float h) { vec2 d = vec2(length(p.xz) - r, abs(p.y) - h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec2 opU(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
// a world point on the screen, in the same units as uv
vec2 proj(vec3 p) { vec3 q = p - g_ro; return vec2(dot(q, g_uu), dot(q, g_vv)) * u_focal / max(dot(q, g_ww), 0.01); }
`;

// materials: 0 metal or plastic, 1 accent paint, 2 dark (rubber, cushions, fabric), 3 light (white
// plastic), 4 glass (a lens: dark with a sharp glint)
// each object: setup() sets its moving parts from the pointer (g_hov, g_m) and time (g_t); map(p) is its
// distance field (distance, material); extra(uv) is a drawn layer over the picture (sound, a spinning
// rotor), 0..1
const OBJECTS = {
  headphones: {
    cam: { target: [0, 0.74, 0], dist: 4.7, pitch: 0.2, yaw: 0.62, focal: 2.0 },
    bound: [0, 0.78, 0, 1.12],
    follow: 1,
    label: 'Over-ear headphones, drawn in dots',
    glsl: /* glsl */ `
void setup() {}
// one ear cup; q.x runs outward from the cup's middle plane
vec2 cup(vec3 q) {
  float taper = 1.0 - 0.14 * clamp((q.x + 0.02) / 0.12, 0.0, 1.0);
  vec2 rr = vec2(0.40, 0.33) * taper;
  float e = (length(q.yz / rr) - 1.0) * rr.y;
  vec2 w = vec2(e + 0.04, abs(q.x) - 0.06);
  vec2 res = vec2(min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - 0.04, 1.0);
  // the cushion: a soft ring on the inner side
  vec3 c = q + vec3(0.15, 0.0, 0.0);
  float ring = (length(c.yz / vec2(0.30, 0.235)) - 1.0) * 0.235;
  res = opU(res, vec2(length(vec2(ring, c.x * 1.15)) - 0.07, 2.0));
  // the fork: a thin U round the cup's upper half, a pivot at each end
  float f = (length(q.yz / vec2(0.47, 0.40)) - 1.0) * 0.40;
  float fork = max(length(vec2(f, q.x)) - 0.026, -q.y);
  fork = min(fork, length(vec3(q.x, q.y, abs(q.z) - 0.40)) - 0.042);
  return opU(res, vec2(fork, 0.0));
}
vec2 map(vec3 p) {
  vec2 res = cup(vec3(abs(p.x) - 0.60, p.y - 0.44, p.z));
  // the band: an arc from fork to fork whose legs run straight down into a slider on each fork's crown
  // (the arc alone stopped short of the forks and left a gap), and a soft pad under its crown
  float by = p.y - clamp(p.y - 0.91, -0.06, 0.0);
  float r = length(vec2(p.x, by - 0.91));
  vec2 d = abs(vec2(r - 0.60, p.z)) - vec2(0.018, 0.06);
  float band = max(length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.018, 0.91 - by);
  float slider = sdBox(vec3(abs(p.x) - 0.60, p.y - 0.86, p.z), vec3(0.024, 0.036, 0.064)) - 0.018;
  res = opU(res, vec2(min(band, slider), 0.0));
  // the pad's lower ends are rounded into the band, not cut flat
  vec2 e = abs(vec2(r - 0.545, p.z)) - vec2(0.02, 0.064);
  float padBox = length(max(e, 0.0)) + min(max(e.x, e.y), 0.0) - 0.03;
  vec2 ru = max(vec2(0.05 + padBox, 0.05 + 1.2 - p.y), 0.0);
  float pad = min(-0.05, max(padBox, 1.2 - p.y)) + length(ru);
  return opU(res, vec2(pad, 2.0));
}
// sound: rings that run outward from each cup while the headphones are pointed at
float waves(vec2 uv, float sx) {
  vec3 c = vec3(sx * 0.72, 0.44, 0.0);
  vec2 pc = proj(c);
  vec2 pd = proj(c + vec3(sx * 0.4, 0.0, 0.0)) - pc;
  float pl = length(pd);
  if (pl < 1e-4) return 0.0;
  pd /= pl;
  vec2 d = uv - pc;
  float r = length(d);
  float cone = smoothstep(0.25, 0.75, dot(d, pd) / max(r, 1e-4)) * clamp(pl * 6.0, 0.0, 1.0);
  float ph = fract(r * 15.0 - g_t * 1.5);
  float ring = smoothstep(0.38, 0.5, ph) * (1.0 - smoothstep(0.5, 0.64, ph));
  float fade = smoothstep(0.11, 0.17, r) * (1.0 - smoothstep(0.22, 0.42, r));
  return ring * cone * fade;
}
float extra(vec2 uv) {
  if (g_hit > 0.5 || g_hov < 0.01) return 0.0;
  return max(waves(uv, 1.0), waves(uv, -1.0)) * g_hov * 0.95;
}
`,
  },

  chair: {
    cam: { target: [0, 0.66, -0.02], dist: 3.75, pitch: 0.24, yaw: 0.78, focal: 2.0 },
    bound: [0, 0.64, -0.04, 0.98],
    follow: 0.35,
    label: 'An office chair on five castors, drawn in dots',
    glsl: /* glsl */ `
// the seat and back swivel after the pointer; the base stays put
void setup() { g_a = -g_hov * g_m.x * 2.6; }
vec2 map(vec3 p) {
  // the base: five legs in a star, a castor at each end, the gas column
  float a = atan(p.z, p.x) + 0.35;
  float sec = 1.2566371;
  a = mod(a + sec * 0.5, sec) - sec * 0.5;
  float r = length(p.xz);
  vec3 q = vec3(r * cos(a), p.y, r * sin(a));
  float leg = sdCap(q, vec3(0.05, 0.135, 0.0), vec3(0.43, 0.088, 0.0), 0.03);
  float hub = sdCylY(p - vec3(0.0, 0.13, 0.0), 0.07, 0.035) - 0.01;
  float col = sdCylY(p - vec3(0.0, 0.36, 0.0), 0.028, 0.2);
  vec2 res = vec2(min(min(leg, hub), col), 0.0);
  float castor = length(vec3(q.x - 0.445, q.y - 0.046, q.z)) - 0.046;
  float shroud = sdCylY(p - vec3(0.0, 0.25, 0.0), 0.045, 0.085) - 0.006;
  res = opU(res, vec2(min(castor, shroud), 2.0));
  vec3 s = p;
  s.xz = rot(s.xz, g_a);
  float mech = sdBox(s - vec3(0.0, 0.53, 0.0), vec3(0.1, 0.03, 0.11)) - 0.01;
  float spine = min(sdCap(s, vec3(0.0, 0.53, -0.08), vec3(0.0, 0.61, -0.33), 0.034), sdCap(s, vec3(0.0, 0.61, -0.33), vec3(0.0, 0.87, -0.38), 0.034));
  vec3 m = vec3(abs(s.x) - 0.315, s.y, s.z + 0.03);
  float pad = sdBox(m - vec3(0.0, 0.81, 0.0), vec3(0.034, 0.016, 0.13)) - 0.014;
  res = opU(res, vec2(min(min(mech, spine), pad), 2.0));
  float post = min(sdCap(m, vec3(0.0, 0.61, -0.02), vec3(0.0, 0.8, -0.02), 0.02), sdCap(m, vec3(-0.13, 0.6, -0.02), vec3(0.0, 0.61, -0.02), 0.02));
  res = opU(res, vec2(post, 0.0));
  // the seat and the back: one upholstery in the accent; the back leans back and wraps a little
  float seat = sdBox(s - vec3(0.0, 0.63, 0.03), vec3(0.25, 0.035, 0.24)) - 0.05;
  vec3 b = s - vec3(0.0, 1.06, -0.4);
  b.yz = rot(b.yz, 0.13);
  b.z -= 0.45 * b.x * b.x;
  float back = sdBox(b, vec3(0.24, 0.22, 0.025)) - 0.04;
  return opU(res, vec2(min(seat, back), 1.0));
}
float extra(vec2 uv) { return 0.0; }
`,
  },

  camera: {
    cam: { target: [0.02, 0.36, 0.12], dist: 3.1, pitch: 0.27, yaw: 0.6, focal: 2.0 },
    bound: [0.0, 0.38, 0.2, 0.86],
    follow: 1,
    label: 'A camera with a zoom lens, drawn in dots',
    glsl: /* glsl */ `
void setup() {
  g_a = g_hov * clamp(0.55 - g_m.y * 1.8, 0.0, 1.0);   // the zoom: the pointer high draws the lens out
  g_b = g_hov * g_m.x * 3.0;                           // the focus ring turns with the pointer
}
vec2 map(vec3 p) {
  // the body: an accent band below a metal top plate, a rubber grip, two dials and the shutter
  float body = sdBox(p - vec3(0.0, 0.33, 0.0), vec3(0.5, 0.27, 0.1)) - 0.05;
  vec2 res = vec2(body, p.y > 0.545 ? 0.0 : 1.0);
  float hump = sdBox(p - vec3(0.06, 0.68, -0.02), vec3(0.14, 0.08, 0.1)) - 0.03;
  float dial = min(sdCylY(p - vec3(0.33, 0.68, 0.0), 0.07, 0.03), sdCylY(p - vec3(-0.2, 0.67, 0.0), 0.055, 0.025)) - 0.006;
  res = opU(res, vec2(min(hump, dial), 0.0));
  float grip = sdBox(p - vec3(-0.4, 0.31, 0.15), vec3(0.1, 0.24, 0.07)) - 0.05;
  res = opU(res, vec2(grip, 2.0));
  float shutter = sdCylY(p - vec3(-0.4, 0.665, 0.1), 0.036, 0.02) - 0.006;
  res = opU(res, vec2(shutter, 1.0));
  // the lens: a barrel as long as the zoom, a ribbed focus ring, the glass set into its front
  float L = 0.36 + 0.17 * g_a;
  vec3 l = p - vec3(0.06, 0.33, 0.13);
  float r = length(l.xy);
  vec2 w = vec2(r - 0.2, abs(l.z - L * 0.5) - L * 0.5);
  float barrel = min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - 0.016;
  float rib = step(L * 0.4, l.z) * step(l.z, L * 0.72);
  barrel -= rib * 0.007 * smoothstep(0.25, 0.85, abs(sin(atan(l.y, l.x) * 30.0 + g_b)));
  barrel = max(barrel, -max(r - 0.158, L - 0.03 - l.z));
  float m = l.z < 0.05 ? 0.0 : (l.z > L - 0.07 ? (r < 0.162 ? 4.0 : 0.0) : 2.0);
  return opU(res, vec2(barrel * 0.9, m));
}
float extra(vec2 uv) { return 0.0; }
`,
  },

  drone: {
    cam: { target: [0, 0.36, 0], dist: 3.45, pitch: 0.5, yaw: 0.55, focal: 2.0 },
    bound: [0, 0.4, 0, 1.18],
    follow: 0.6,
    label: 'A camera drone with four rotors, drawn in dots',
    glsl: /* glsl */ `
float g_lift;
// world to the drone's own frame: lifted, tipped toward the pointer
vec3 frame(vec3 p) {
  vec3 q = p - vec3(0.0, g_lift, 0.0);
  q.xy = rot(q.xy, g_b);
  q.zy = rot(q.zy, g_a);
  return q;
}
void setup() {
  g_lift = 0.2 * smoothstep(0.0, 1.0, g_hov) + 0.012 * sin(g_t * 2.2) * g_hov;
  g_b = -g_hov * g_m.x * 0.32;
  g_a = g_hov * g_m.y * 0.22;
}
vec2 map(vec3 p) {
  vec3 q = frame(p);
  vec2 res = vec2(sdBox(q - vec3(0.0, 0.3, 0.0), vec3(0.15, 0.055, 0.26)) - 0.065, 1.0);
  res = opU(res, vec2(length(q - vec3(0.0, 0.22, 0.31)) - 0.06, q.z > 0.345 ? 4.0 : 2.0));
  vec3 a = vec3(abs(q.x), q.y, abs(q.z));
  float arm = sdCap(a, vec3(0.1, 0.31, 0.14), vec3(0.52, 0.345, 0.47), 0.028);
  float leg = sdCap(a, vec3(0.1, 0.25, 0.13), vec3(0.13, 0.016, 0.17), 0.016);
  // the motors in metal (dark motors under a spinning disc printed as a cluster of black marks)
  vec3 mq = a - vec3(0.52, 0.375, 0.47);
  res = opU(res, vec2(min(min(arm, leg), sdCylY(mq, 0.048, 0.035) - 0.006), 0.0));
  // the propellers at rest, two blades each at its own angle; spinning, they are drawn as discs (extra)
  if (g_hov < 0.45) {
    vec3 bq = mq - vec3(0.0, 0.046, 0.0);
    bq.xz = rot(bq.xz, 0.5 + 1.3 * step(0.0, q.x) + 0.8 * step(0.0, q.z));
    res = opU(res, vec2(sdBox(bq, vec3(0.27, 0.004, 0.026)) - 0.004, 2.0));
  }
  return res;
}
float extra(vec2 uv) {
  float spin = smoothstep(0.2, 0.6, g_hov);
  if (spin < 0.01) return 0.0;
  vec3 ro = frame(g_ro);
  vec3 rd = g_rd;
  rd.xy = rot(rd.xy, g_b);
  rd.zy = rot(rd.zy, g_a);
  if (abs(rd.y) < 1e-4) return 0.0;
  float t = (0.421 - ro.y) / rd.y;
  if (t < 0.0 || t > g_hitT) return 0.0;
  vec3 h = ro + rd * t;
  float r = length(vec2(abs(h.x), abs(h.z)) - vec2(0.52, 0.47));
  return (1.0 - smoothstep(0.28, 0.295, r)) * (0.2 + 0.5 * smoothstep(0.235, 0.28, r)) * spin;
}
`,
  },
};

const MAIN = /* glsl */ `
vec3 nor(vec3 p) {
  vec3 n = vec3(0.0);
  for (int i = ZERO; i < 4; i++) {
    vec3 e = i == 0 ? vec3(1.0, -1.0, -1.0) : (i == 1 ? vec3(-1.0, -1.0, 1.0) : (i == 2 ? vec3(-1.0, 1.0, -1.0) : vec3(1.0)));
    n += e * map(p + 0.0015 * e).x;
  }
  return normalize(n);
}
float shadow(vec3 ro, vec3 rd) {
  float res = 1.0, t = 0.02;
  for (int i = ZERO; i < 28; i++) {
    float h = map(ro + rd * t).x;
    res = min(res, 8.0 * h / t);
    t += clamp(h, 0.03, 0.25);
    if (res < 0.004 || t > 3.5) break;
  }
  return clamp(res, 0.0, 1.0);
}
// three tones: ground, shade, ink, by the ordered threshold
vec3 tone3(float v, float th) {
  float x = clamp(v, 0.0, 1.0) * 2.0;
  // studio: the tones blend smoothly, a shaded render instead of a print
  if (u_smooth > 0.5) return x < 1.0 ? mix(u_t0, u_t1, x) : mix(u_t1, u_t2, x - 1.0);
  float i = floor(x);
  float idx = min(i + step(th, x - i), 2.0);
  return idx < 0.5 ? u_t0 : (idx < 1.5 ? u_t1 : u_t2);
}
// the accent part: lit faces in the accent, shade in the deep accent, the deepest shade in the ground
// (dark pages) or the ink (light pages), never a grey
vec3 toneA(float a, float th) {
  float x = clamp(a, 0.0, 1.0) * 2.0;
  if (u_smooth > 0.5) { vec3 lo = u_dark > 0.5 ? u_t0 : u_t2; return x < 1.0 ? mix(lo, u_t4, x) : mix(u_t4, u_t3, x - 1.0); }
  float i = floor(x);
  float idx = min(i + step(th, x - i), 2.0);
  return idx < 0.5 ? (u_dark > 0.5 ? u_t0 : u_t2) : (idx < 1.5 ? u_t4 : u_t3);
}

void main() {
  float cell = max(1.0, u_cell);
  vec2 id = floor(gl_FragCoord.xy / cell);
  vec2 cpx = (id + 0.5) * cell;
  vec2 uv = (cpx - 0.5 * u_res) / u_res.y;
  float th = u_smooth > 0.5 ? 0.5 : fx_bayer(id) + 0.5 / 64.0;

  g_t = u_time * u_speed;
  g_hov = smoothstep(0.0, 1.0, u_mouse.z);
  g_m = u_mouse.xy / u_res - 0.5;
  g_a = 0.0; g_b = 0.0;
  setup();

  // camera: a slow sway on its spot; while pointed at, it follows the pointer (as far as the object
  // lets it: the chair answers by swivelling its seat instead)
  float sway = u_sway * sin(g_t * 0.24);
  float yaw = u_yaw0 + mix(sway, g_m.x * 1.3 * u_follow, g_hov);
  float pit = u_pitch + g_hov * g_m.y * 0.3 * u_follow;
  vec3 ta = u_target;
  vec3 ro = ta + u_dist * vec3(sin(yaw) * cos(pit), sin(pit), cos(yaw) * cos(pit));
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + u_focal * ww);
  g_ro = ro; g_rd = rd; g_uu = uu; g_vv = vv; g_ww = ww;

  // the light: upper left in the world; while pointed at, it comes from the pointer
  vec3 Lw = normalize(vec3(-0.55, 0.9, 0.65));
  vec3 Lh = normalize(uu * g_m.x * 2.2 + vv * (g_m.y * 1.8 + 1.0) - ww * 1.5);
  vec3 L = normalize(mix(Lw, Lh, g_hov));

  // march only inside the object's bounding sphere
  float mat = -1.0, t = 1e9;
  vec3 oc = ro - u_bound.xyz;
  float bb = dot(oc, rd), bc = dot(oc, oc) - u_bound.w * u_bound.w, bh = bb * bb - bc;
  if (bh > 0.0) {
    float sq = sqrt(bh);
    float t0 = max(0.05, -bb - sq), t1 = -bb + sq;
    t = t0;
    for (int i = ZERO; i < 96; i++) {
      vec2 h = map(ro + rd * t);
      if (h.x < 0.0012 * t) { mat = h.y; break; }
      t += h.x * 0.9;
      if (t > t1) break;
    }
    if (mat < 0.0) t = 1e9;
  }
  float tf = rd.y < 0.0 ? -ro.y / rd.y : 1e9;
  bool hit = mat >= 0.0 && t < tf;
  g_hit = hit ? 1.0 : 0.0;
  g_hitT = hit ? t : tf;

  float dark = u_dark;
  vec3 col = u_t0;
  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = nor(p);
    float dif = max(dot(n, L), 0.0);
    float sh = dif > 0.001 ? shadow(p + n * 0.004, L) : 0.0;
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 24.0) * sh;
    float lit = clamp(0.16 * (0.55 + 0.45 * n.y) + 0.84 * dif * sh, 0.0, 1.0);
    if (mat > 0.5 && mat < 1.5) {
      // accent paint, its shade in the deep accent
      float a = dark > 0.5 ? clamp(lit * 1.1 + 0.14 + rim * 0.1 + spec * 0.3, 0.0, 1.0) : clamp(lit + 0.32 + spec * 0.3, 0.0, 1.0);
      col = toneA(a, th);
    } else {
      // v: 0 the ground .. 1 the ink (light on a dark page, dark on a light one)
      float v = dark > 0.5 ? clamp(lit * 0.9 + rim * 0.2 + 0.05, 0.0, 1.0)
                           : clamp((1.0 - lit) * 0.8 + 0.08 + rim * 0.28, 0.0, 1.0);
      float sp = dark > 0.5 ? spec : -spec;
      if (mat < 0.5) v = (dark > 0.5 ? 0.22 + 0.78 * v : v) + sp * 0.55;
      else if (mat < 2.5) v = (dark > 0.5 ? 0.1 + 0.42 * v : 0.7 + 0.3 * v) + sp * 0.45;
      else if (mat < 3.5) v = dark > 0.5 ? 0.3 + 0.7 * v : 0.2 + v * 0.55;
      else v = (dark > 0.5 ? 0.06 + rim * 0.25 : 0.94 - rim * 0.2) + sp * 1.1;
      col = tone3(v, th);
    }
  } else if (tf < 1e8) {
    // the floor: only the contact shadow right under the object (and on a dark page a faint pool of
    // light it stands in), fading out long before the horizon: no carpet, no edge
    vec3 p = ro + rd * tf;
    vec2 dxz = (p.xz - u_bound.xz) / u_bound.w;
    float near = exp(-dot(dxz, dxz) * 4.2);
    float sh = near > 0.03 ? shadow(p + vec3(0.0, 0.002, 0.0), L) : 1.0;
    float pool = exp(-dot(dxz, dxz) * 6.0);
    float v = dark > 0.5 ? 0.1 * pool * (0.15 + 0.85 * sh) : 0.55 * near * (1.0 - sh);
    col = tone3(v, th);
  }
  // the object's own drawn layer (sound, spinning rotors), printed in the shade and the ink
  float s = extra(uv);
  if (u_smooth > 0.5) col = mix(col, dark > 0.5 ? u_t2 : u_t1, clamp(s, 0.0, 1.0) * 0.8);
  else if (s > 0.02 && s > th * 1.1) col = s > 0.55 + th * 0.4 ? (dark > 0.5 ? u_t2 : u_t1) : u_t1;
  fxColor = vec4(col, 1.0);
}
`;

const SCHEMA = {
  pixel: { default: 3, min: 1, max: 8, step: 1 },   // dither cell, CSS px
  sway: { default: 0.45, min: 0, max: 1, step: 0.01 }, // how far the object swings on its spot (radians)
  speed: { default: 1, min: 0, max: 2, step: 0.01 },   // idle motion
};

/* the tones: the stage ground, a shade, the ink, the accent (kept apart from the ground) and a deep
   accent for the accent part's shaded side */
function tones(page, ground) {
  const dark = color.isDark(ground);
  const ink = dark ? color.mix(page.ink, ground, 0.06) : page.ink;
  let acc = page.accent;
  if (color.contrast(acc, ground) < 1.8) acc = color.mix(acc, ink, 0.4);
  const deep = dark ? color.mix(acc, ground, 0.5) : color.mix(acc, ink, 0.35);
  return { t0: ground, t1: color.mix(ground, ink, dark ? 0.36 : 0.3), t2: ink, t3: acc, t4: deep, dark };
}

/* without WebGL: a line drawing of the same object in the ink, its accent part filled, each shape in
   front filled with the ground so no line runs through it; the strokes keep one thin width at any size.
   Drawn in a 120 x 90 box, seen from the same side as the 3D view. */
const DRAW = {
  headphones: (a, g) => `<path d="M33 55C31 22 47 12 60 12s29 10 27 43" stroke-width="2.4"/><path d="M38 40c2-14 11-20 22-20s20 6 22 20" stroke-width="4.5" opacity=".55"/><path d="M27 58q0-9 7-9M93 58q0-9-7-9"/><rect x="24" y="52" width="17" height="30" rx="8" fill="${a}"/><rect x="38" y="55" width="8" height="24" rx="4" fill="${g}"/><rect x="79" y="52" width="17" height="30" rx="8" fill="${a}"/><rect x="74" y="55" width="8" height="24" rx="4" fill="${g}"/>`,
  chair: (a, g) => `<path d="M60 70 31 76M60 70 89 76M60 70l-3 13M60 70 44 64M60 70l16-6"/><circle cx="30" cy="77.5" r="2.6" fill="${g}"/><circle cx="90" cy="77.5" r="2.6" fill="${g}"/><circle cx="57" cy="84.5" r="2.6" fill="${g}"/><path d="M60 70V52M60 50l2-12M39 47V37h9M81 47V37h-9"/><path d="M44 8q16-5 32 0l-2 28q-14 4-28 0z" fill="${a}"/><path d="M34 46q26-8 52 0 2 5-2 7-24 6-48 0-4-2-2-7z" fill="${a}"/>`,
  camera: (a, g) => `<path d="M46 26l5-9h18l5 9" fill="${g}"/><rect x="14" y="26" width="92" height="50" rx="6" fill="${g}"/><path d="M14.5 42h91v28a6 6 0 0 1-6 6h-79a6 6 0 0 1-6-6z" fill="${a}"/><rect x="17" y="34" width="16" height="42" rx="6" fill="${g}"/><path d="M84 26v-5h12v5M22 26v-4h7v4"/><circle cx="63" cy="52" r="21" fill="${g}"/><circle cx="63" cy="52" r="16"/><circle cx="63" cy="52" r="10" fill="${g}"/><path d="M58 47q3-3 7-2" opacity=".7"/>`,
  drone: (a, g) => `<path d="M60 46 27 27M60 46 93 27M60 46 27 65M60 46 93 65"/><ellipse cx="27" cy="27" rx="19" ry="6"/><ellipse cx="93" cy="27" rx="19" ry="6"/><ellipse cx="27" cy="65" rx="19" ry="6"/><ellipse cx="93" cy="65" rx="19" ry="6"/><circle cx="27" cy="27" r="2.6" fill="${g}"/><circle cx="93" cy="27" r="2.6" fill="${g}"/><circle cx="27" cy="65" r="2.6" fill="${g}"/><circle cx="93" cy="65" r="2.6" fill="${g}"/><rect x="49" y="33" width="22" height="27" rx="8" fill="${a}"/><circle cx="60" cy="64" r="3.6" fill="${g}"/><path d="M52 60l-4 10M68 60l4 10"/>`,
};
const drawing = (kind, ink, accent, ground) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><style>*{vector-effect:non-scaling-stroke}</style>${(DRAW[kind] || DRAW.headphones)(accent, ground)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") center / min(78%, 520px) auto no-repeat, ${ground}`;
};

/* the object as an effect, so still() can draw it once under reduced motion */
function objectEffect(kind, page, studio = false) {
  const o = OBJECTS[kind] || OBJECTS.headphones;
  const ground = tone(page, 0.035);
  const T = tones(page, ground);
  const frag = COMMON + o.glsl + MAIN;
  return {
    id: `cx-object-${kind}${studio ? '-studio' : ''}`,
    params: SCHEMA,
    mount(el, { params, seed }) {
      const pixel = params.pixel;
      return fx.shader(el, {
        frag,
        schema: SCHEMA,
        params,
        palette: { ...page, bg: ground },
        seed,
        // print: one canvas pixel per dither cell on every screen (dpr = 1 / cell), scaled up pixelated.
        // studio: a smooth render at one sample per CSS pixel (0.75 past 0.64 megapixels), scaled up smooth
        crisp: !studio,
        maxDpr: studio ? (el.clientWidth * el.clientHeight > 640000 ? 0.75 : 1) : 1 / pixel,
        fps: 20,
        still: 0,                 // reduced motion: the rest view, as designed
        pointer: true,
        uniforms: ({ dpr, params: pr }) => ({
          u_t0: color.vec3(T.t0), u_t1: color.vec3(T.t1), u_t2: color.vec3(T.t2), u_t3: color.vec3(T.t3), u_t4: color.vec3(T.t4),
          u_dark: T.dark ? 1 : 0,
          u_cell: studio ? 1 : Math.max(1, Math.round(pr.pixel * dpr)),
          u_smooth: studio ? 1 : 0,
          u_target: o.cam.target, u_dist: o.cam.dist, u_pitch: o.cam.pitch, u_yaw0: o.cam.yaw, u_focal: o.cam.focal,
          u_bound: o.bound,
          u_follow: o.follow,
        }),
        // without WebGL: a still line drawing of the same object, so the stage still shows the thing
        fallback: () => drawing(kind, color.mix(T.t2, ground, 0.15), T.t3, ground),
      });
    },
  };
}

export default function init(root) {
  const b = bag();
  const page = palette(root);
  const figs = root.matches('.cx-obj') ? [root] : [...root.querySelectorAll('.cx-obj')];
  figs.forEach(fig => {
    const stage = fig.querySelector('.cx-obj__stage');
    const kind = OBJECTS[fig.dataset.cxObject] ? fig.dataset.cxObject : 'headphones';
    stage.setAttribute('aria-label', fig.dataset.cxLabel || OBJECTS[kind].label);
    // never a caption under the picture: the section copy names the object
    const pixel = Math.max(1, Math.round(+(fig.dataset.cxPixel || (stage.clientWidth < 420 ? 2 : 3)) || 3));
    // data-cx-render="studio": the same object as a smooth shaded render (a product shot), not a print
    const studio = fig.dataset.cxRender === 'studio';
    const effect = objectEffect(kind, page, studio);
    const seed = fig.dataset.cxSeed;
    // the line drawing stands on the stage until the dither canvas covers it: a stage the effect never draws is not an empty card
    { const ground = tone(page, 0.035), T = tones(page, ground); stage.style.background = drawing(kind, color.mix(T.t2, ground, 0.15), T.t3, ground); b.add(() => { stage.style.background = ''; }); }
    // reduced motion: one picture, its context freed (no sway, no answer to the pointer, no button)
    if (reduced()) {
      b.add(still(stage, effect, { seed, params: { pixel } }));
      return;
    }
    const p = b.add(pauser(fig, { label: 'the drawing', corner: 'tr', at: stage }));
    fx.mount(stage, effect, { seed, params: { pixel } }).then(ctrl => {
      b.add(p.add(ctrl));
      // the line drawing without WebGL is still: no pause button
      if (ctrl.info?.fallback) p.destroy();
    }, err => console.warn('fx-dither-object:', err));
  });
  return b;
}

export { OBJECTS };
