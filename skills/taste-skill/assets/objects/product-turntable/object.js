/*
  product-turntable - a generic thing on a turntable, raymarched in code (signed distance forms, no
  mesh) and printed in the page palette with an 8x8 ordered dither, one canvas pixel per dither cell.
  For a feature card on a software page about a kind of thing the product handles (cameras in a
  rental platform, a chair in a furniture marketplace); never the client's own product and never on a
  product page (a maker shows its photographs or its object render, assets/objects/print-*).

  At rest the platter advances one step (15 degrees) at a time, the way a product turntable shoots
  its frames, and draws nothing between steps. Hovering turns it: moving the pointer right or left
  clicks it round step by step, and the key light leans toward the pointer. Touch: drag across it.
  The camera is fitted to each form and to the panel, so the platter is never cut.

  params: form 'camera' | 'chair' | 'speaker' | 'cup', cell (CSS px per dither cell), step (degrees,
  default 15), hold (seconds between steps at rest, default 1.7), autoplay (0 holds still until
  hovered), readout (1 shows the angle under the stage), transparent (1 leaves the ground clear), alt.
*/
import { stage, tones, setTones, GLSL_PRINT, approach, clamp, paletteOf, MONO } from '../_scenes/kit.js';

const FORMS = { camera: 0, cup: 1, speaker: 2, chair: 3 };
const NAMES = ['camera', 'cup', 'speaker', 'chair'];
const LABELS = ['A rangefinder camera on a turntable', 'A glazed cup on its saucer, on a turntable', 'A cylindrical speaker on a turntable', 'A wooden side chair with a linen seat, on a turntable'];
// the product's reach in world units (y up from the floor): [radius in xz, height] for the camera fit
const REACH = [[0.78, 0.86], [0.62, 0.72], [0.48, 1.24], [0.56, 1.56]];

const frag = (form) => /* glsl */ `
#define FORM ${form}
${GLSL_PRINT}
uniform float u_four, u_five, u_rot, u_steps, u_shadowSteps, u_focal, u_dark, u_lightA, u_lightE, u_shift, u_clear, u_px;
uniform vec3 u_cam;

const float PI = 3.14159265;
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sdRBox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdCyl(vec2 rp, float r, float h) { vec2 d = abs(rp) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdCap(vec3 p, vec3 a, vec3 b, float ra, float rb) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - mix(ra, rb, h); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

// materials: 1 dark body, 2 metal, 3 glass, 4 accent, 5 platter, 6 ceramic, 8 fabric, 9 wood, 10 linen
vec2 product(vec3 p) {
#if FORM == 0
  // a rangefinder camera, lens to the front (+z)
  vec3 q = p - vec3(0.0, 0.37, 0.0);
  float body = sdRBox(q, vec3(0.66, 0.33, 0.18), 0.075);
  float seam = abs(p.y - 0.585);
  body += 0.004 * (1.0 - smoothstep(0.0, 0.012, seam));
  vec2 r = vec2(body, p.y > 0.585 || p.y < 0.085 ? 2.0 : 1.0);
  // viewfinder and rangefinder windows, set into the front
  vec3 w1 = p - vec3(-0.43, 0.6, 0.185);
  float win1 = sdRBox(w1, vec3(0.095, 0.05, 0.03), 0.015);
  vec3 w2 = p - vec3(0.47, 0.6, 0.185);
  float win2 = sdRBox(w2, vec3(0.05, 0.05, 0.03), 0.015);
  float wins = min(win1, win2);
  if (-wins > r.x) r = vec2(-wins, 3.0);
  // lens: mount, knurled focus ring, front barrel with recessed glass
  vec3 l = p - vec3(0.1, 0.36, 0.0);
  float ang = atan(l.y, l.x);
  float mountR = sdCyl(vec2(length(l.xy), l.z - 0.215), 0.275, 0.035);
  float knurl = 0.006 * smoothstep(-0.3, 0.3, sin(ang * 60.0));
  float focus = sdCyl(vec2(length(l.xy), l.z - 0.32), 0.252 + knurl, 0.075);
  float front = sdCyl(vec2(length(l.xy), l.z - 0.45), 0.236, 0.055);
  float lens = min(mountR, min(focus, front));
  float cavity = sdCyl(vec2(length(l.xy), l.z - 0.52), 0.185, 0.04);
  lens = max(lens, -cavity);
  float lm = 2.0;
  if (abs(l.z - 0.398) < 0.0065 && length(l.xy) > 0.2) lm = 4.0;
  if (l.z > 0.25 && l.z < 0.395) lm = 1.0;
  if (length(l.xy) < 0.19 && l.z > 0.4) lm = 3.0;
  if (lens < r.x) r = vec2(lens, lm);
  // top: shutter dial, release button, rewind knob, shoe
  vec3 d1 = p - vec3(0.36, 0.735, -0.02);
  float dial = sdCyl(vec2(length(d1.xz), d1.y), 0.115 + 0.005 * smoothstep(-0.3, 0.3, sin(atan(d1.z, d1.x) * 40.0)), 0.035);
  if (dial < r.x) r = vec2(dial, 2.0);
  vec3 b1 = p - vec3(0.17, 0.725, 0.07);
  float btn = sdCyl(vec2(length(b1.xz), b1.y), 0.04, 0.03);
  if (btn < r.x) r = vec2(btn, 4.0);
  vec3 k1 = p - vec3(-0.45, 0.73, -0.02);
  float knob = sdCyl(vec2(length(k1.xz), k1.y), 0.1, 0.03);
  if (knob < r.x) r = vec2(knob, 2.0);
  vec3 s1 = p - vec3(-0.08, 0.715, -0.02);
  float shoe = sdRBox(s1, vec3(0.1, 0.018, 0.075), 0.008);
  if (shoe < r.x) r = vec2(shoe, 2.0);
  vec3 g1 = vec3(abs(p.x) - 0.675, p.y - 0.56, p.z);
  float lug = sdCyl(vec2(length(g1.yz), g1.x), 0.03, 0.025);
  if (lug < r.x) r = vec2(lug, 2.0);
  // back: eyepiece, a screen set into the door, and a thumb rest
  vec3 e1 = p - vec3(-0.43, 0.6, -0.2);
  float eye = sdRBox(e1, vec3(0.085, 0.06, 0.035), 0.025);
  if (eye < r.x) r = vec2(eye, 2.0);
  vec3 sc = p - vec3(0.02, 0.33, -0.2);
  float scr = sdRBox(sc, vec3(0.3, 0.17, 0.03), 0.02);
  if (-scr > r.x) r = vec2(-scr, 3.0);
  vec3 th = p - vec3(0.52, 0.47, -0.19);
  float thumb = sdRBox(th, vec3(0.06, 0.1, 0.02), 0.02);
  if (thumb < r.x) r = vec2(thumb, 2.0);
  return r;
#elif FORM == 1
  // a glazed cup with a handle, on a saucer; the glaze takes the accent, the inside stays white
  float sau = sdCyl(vec2(length(p.xz), p.y - 0.022), 0.6, 0.012) - 0.012;
  float rim = sdTorus(p - vec3(0.0, 0.05, 0.0), vec2(0.57, 0.02));
  sau = smin(sau, rim, 0.04);
  vec2 r = vec2(sau, 6.0);
  vec3 c = p - vec3(0.0, 0.046, 0.0);
  float rr = length(c.xz);
  float h = 0.56;
  float prof = mix(0.27, 0.36, smoothstep(0.0, h, c.y)) + 0.02 * smoothstep(0.0, 0.08, c.y) - 0.02;
  vec2 dd = vec2(rr - prof, max(-c.y, c.y - h));
  float outer = min(max(dd.x, dd.y), 0.0) + length(max(dd, 0.0)) - 0.012;
  vec2 di = vec2(rr - (prof - 0.035), max(0.06 - c.y, c.y - h - 0.2));
  float inner = min(max(di.x, di.y), 0.0) + length(max(di, 0.0));
  float cup = max(outer, -inner);
  vec3 hp = c - vec3(0.38, 0.3, 0.0);
  hp.xy = rot2(0.12) * hp.xy;
  float han = length(vec2(length(hp.xy) - 0.14, hp.z)) - 0.032;
  han = max(han, 0.32 - c.x);
  cup = smin(cup, han, 0.025);
  float cm = rr < prof - 0.03 && c.y > 0.05 ? 6.0 : 4.0;
  if (cup < r.x) r = vec2(cup, cm);
  return r;
#elif FORM == 2
  // a cylindrical speaker: fabric sleeve, top cap with a control ring, a status light in front
  vec3 c = p - vec3(0.0, 0.58, 0.0);
  float body = sdCyl(vec2(length(c.xz), c.y), 0.39, 0.52) - 0.05;
  float m = c.y > 0.4 ? 2.0 : 8.0;
  vec2 r = vec2(body, m);
  vec3 t = c - vec3(0.0, 0.57, 0.0);
  float ring = sdTorus(t, vec2(0.25, 0.018));
  if (ring < r.x + 0.004) r = vec2(min(ring, r.x), 4.0);
  vec3 led = c - vec3(0.0, 0.47, 0.43);
  float l = length(led) - 0.024;
  if (l < r.x) r = vec2(l, 4.0);
  return r;
#else
  // a wooden side chair: four legs, the back legs rising into raked posts, a curved back rail,
  // stretchers, a seat frame and an upholstered seat; seat front to +z
  const float S = 1.62;
  vec3 c = p / S;
  vec3 a = vec3(abs(c.x), c.y, c.z);
  float wood = sdCap(a, vec3(0.2, 0.0, 0.185), vec3(0.204, 0.425, 0.19), 0.015, 0.021);
  wood = min(wood, sdCap(a, vec3(0.198, 0.0, -0.205), vec3(0.204, 0.425, -0.19), 0.015, 0.021));
  wood = min(wood, sdCap(a, vec3(0.204, 0.425, -0.19), vec3(0.19, 0.93, -0.275), 0.021, 0.016));
  wood = min(wood, sdCap(a, vec3(0.202, 0.15, 0.185), vec3(0.2, 0.15, -0.2), 0.0105, 0.0105));
  wood = min(wood, sdCap(c, vec3(-0.2, 0.15, -0.005), vec3(0.2, 0.15, -0.005), 0.0105, 0.0105));
  float apron = sdRBox(c - vec3(0.0, 0.395, -0.005), vec3(0.205, 0.028, 0.195), 0.01);
  apron = max(apron, -sdRBox(c - vec3(0.0, 0.395, -0.005), vec3(0.186, 0.05, 0.176), 0.004));
  wood = min(wood, apron);
  vec3 b = c - vec3(0.0, 0.8, -0.258);
  b.z -= 0.85 * b.x * b.x;
  wood = min(wood, sdRBox(b, vec3(0.196, 0.075, 0.013), 0.011));
  vec2 r = vec2(wood * S, 9.0);
  float seat = sdRBox(c - vec3(0.0, 0.442, 0.0), vec3(0.212, 0.022, 0.204), 0.02);
  if (seat * S < r.x) r = vec2(seat * S, 10.0);
  return r;
#endif
}

vec2 map(vec3 p) {
  vec3 q = p;
  q.xz = rot2(u_rot) * q.xz;
  float plat = sdCyl(vec2(length(q.xz), q.y - 0.04), 1.0, 0.028) - 0.012;
  vec2 r = vec2(plat, 5.0);
  vec2 o = product(q - vec3(0.0, 0.08, 0.0));
  return o.x < r.x ? o : r;
}

vec3 normalAt(vec3 p) {
  vec3 n = vec3(0.0);
  for (float i = 0.0; i < 4.0; i++) {
    if (i >= u_four) break;
    vec3 e = i < 0.5 ? vec3(1.0, -1.0, -1.0) : i < 1.5 ? vec3(-1.0, -1.0, 1.0) : i < 2.5 ? vec3(-1.0, 1.0, -1.0) : vec3(1.0);
    n += e * map(p + 0.0009 * e).x;
  }
  return normalize(n);
}

float softShadow(vec3 ro, vec3 rd, float k) {
  float res = 1.0, t = 0.02;
  for (float i = 0.0; i < 64.0; i++) {
    if (i >= u_shadowSteps) break;
    float h = map(ro + rd * t).x;
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.25);
    if (res < 0.002 || t > 4.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

float occlusion(vec3 p, vec3 n) {
  float o = 0.0, sc = 1.0;
  for (float i = 0.0; i < 5.0; i++) {
    if (i >= u_five) break;
    float h = 0.015 + 0.06 * i;
    o += (h - map(p + n * h).x) * sc;
    sc *= 0.8;
  }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}

// ray against the box that holds the platter and the product
vec2 box(vec3 ro, vec3 rd) {
  vec3 bmin = vec3(-1.06, 0.0, -1.06), bmax = vec3(1.06, 1.7, 1.06);
  vec3 inv = 1.0 / rd;
  vec3 t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv;
  vec3 a = min(t0, t1), b = max(t0, t1);
  return vec2(max(max(a.x, a.y), a.z), min(min(b.x, b.y), b.z));
}

void main() {
  vec2 c = gl_FragCoord.xy;
  vec2 p = (c - 0.5 * u_res) / u_res.y;
  p.y += u_shift;
  vec3 ta = vec3(0.0, u_cam.z, 0.0);
  vec3 ro = ta + u_cam.x * vec3(0.0, sin(u_cam.y), cos(u_cam.y));
  vec3 fw = normalize(ta - ro), rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0))), up = cross(rt, fw);
  vec3 rd = normalize(p.x * rt + p.y * up + u_focal * fw);
  vec3 L = normalize(vec3(cos(u_lightE) * sin(u_lightA), sin(u_lightE), cos(u_lightE) * cos(u_lightA)));
  vec3 F = normalize(vec3(-L.x, 0.35, -L.z * 0.2 + 0.6));

  float a = 0.0;        // ink amount
  float acc = -1.0;     // accent tone when >= 0
  float tFloor = rd.y < 0.0 ? -ro.y / rd.y : 1e5;
  vec2 bx = box(ro, rd);
  float t = max(bx.x, 0.0), hit = -1.0, mat = 0.0;
  if (bx.y > bx.x && bx.y > 0.0) {
    for (float i = 0.0; i < 200.0; i++) {
      if (i >= u_steps) break;
      vec2 h = map(ro + rd * t);
      if (h.x < 0.0006 * t) { hit = t; mat = h.y; break; }
      t += h.x * 0.9;
      if (t > bx.y || t > tFloor) break;
    }
  }
  if (hit > 0.0) {
    vec3 pos = ro + rd * hit;
    vec3 n = normalAt(pos);
    vec3 lp = pos; lp.xz = rot2(u_rot) * lp.xz;
    float dif = max(dot(n, L), 0.0);
    float sh = dif > 0.0 ? softShadow(pos + n * 0.004, L, 10.0) : 0.0;
    float ao = occlusion(pos, n);
    float fil = max(dot(n, F), 0.0);
    float rim = pow(clamp(1.0 + dot(n, rd), 0.0, 1.0), 3.0);
    vec3 hv = normalize(L - rd);
    float spec = pow(max(dot(n, hv), 0.0), 40.0) * sh;
    float alb = 0.62, ks = 0.25;
    if (mat < 1.5) { alb = 0.2; ks = 0.12; }
    else if (mat < 2.5) { alb = 0.74; ks = 0.75; }
    else if (mat < 3.5) { alb = 0.06; ks = 1.4; }
    else if (mat < 4.5) { alb = 0.7; ks = 0.5; }
    else if (mat < 5.5) { alb = u_dark > 0.5 ? 0.6 : 0.88; ks = 0.12; }
    else if (mat < 6.5) { alb = 0.9; ks = 0.7; }
    else if (mat < 8.5) { alb = 0.3 + 0.035 * smoothstep(-0.35, 0.35, sin(lp.y * 140.0)); ks = 0.04; }
    else if (mat < 9.5) { alb = 0.42; ks = 0.3; }
    else { alb = 0.7; ks = 0.06; }
    float lit = alb * (0.9 * dif * sh + 0.22 * fil + 0.12) * mix(0.55, 1.0, ao) + ks * spec;
    if (mat > 4.5 && mat < 5.5) {
      // the degree scale on the platter edge: a tick every 15 degrees, longer every 90; never thinner
      // than a printed cell, so it does not break up at card size
      float rr = length(lp.xz);
      float an = atan(lp.z, lp.x) / (2.0 * PI) * 24.0;
      float arc = abs(fract(an + 0.5) - 0.5) * 2.0 * PI * rr / 24.0;
      float major = step(abs(fract(an / 6.0 + 0.5) - 0.5), 0.5 / 6.0);
      float w = max(0.011, u_px * 0.75);
      float tick = step(arc, w) * step(mix(0.88, 0.8, major), rr) * step(rr, 0.955) * step(0.06, pos.y);
      lit = mix(lit, u_dark > 0.5 ? 0.95 : 0.02, tick);
    }
    if (u_dark > 0.5) a = clamp(lit + 0.35 * rim * ao, 0.0, 1.0);
    else a = clamp(1.0 - lit + 0.22 * rim, 0.0, 1.0);
    if (mat > 3.5 && mat < 4.5) acc = clamp(lit * 1.25, 0.0, 1.0);
  } else if (tFloor < 1e4) {
    vec3 pos = ro + rd * tFloor;
    float r = length(pos.xz);
    float sh = softShadow(pos + vec3(0.0, 0.002, 0.0), L, 9.0);
    float contact = 1.0 - smoothstep(1.0, 1.2, r);
    float pool = exp(-pow(max(r - 0.8, 0.0), 2.0) * (u_dark > 0.5 ? 6.0 : 3.0));
    float fog = 1.0 - smoothstep(1.15, u_dark > 0.5 ? 1.6 : 1.9, r);
    if (u_dark > 0.5) a = 0.2 * (1.0 - smoothstep(1.0, 1.25, r)) * mix(0.15, 1.0, sh);
    else a = (0.4 * (1.0 - sh) * pool + 0.16 * contact * contact * contact) * fog;
    // the floor shade fades out well inside the frame, so no edge cuts it
    vec2 e = abs(c / u_res - 0.5) * 2.0;
    a *= (1.0 - smoothstep(0.78, 0.96, e.x)) * (1.0 - smoothstep(0.8, 0.97, e.y));
    // the fixed index mark in front of the platter
    if (abs(pos.x) < max(0.02, u_px * 0.6) && pos.z > 1.07 && pos.z < 1.18) acc = 0.62;
  }
  vec3 col = acc >= 0.0 ? printAccent(acc, c) : printInk(a, c);
  // a transparent ground on request (the fallback stills are rendered this way)
  bool ground = u_clear > 0.5 && acc < 0.0 && all(lessThan(abs(col - u_r0), vec3(1e-4)));
  fxColor = ground ? vec4(0.0) : vec4(col, 1.0);
}
`;

/* the camera: a fixed distance and height, the focal length and vertical shift fitted to the frame,
   so the platter, the index mark and the product's top all sit inside it with a margin */
const CAM = { dist: 5.6, elev: 0.34 };
function fitCamera(form, aspect) {
  const [R, H] = REACH[form];
  const ty = 0.08 + H * 0.42;
  const ro = [0, ty + CAM.dist * Math.sin(CAM.elev), CAM.dist * Math.cos(CAM.elev)];
  const fw = norm([0 - ro[0], ty - ro[1], 0 - ro[2]]);
  const rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    pts.push([1.04 * ca, 0, 1.04 * sa], [1.04 * ca, 0.08, 1.04 * sa], [R * ca, 0.08 + H, R * sa]);
  }
  pts.push([0, 0, 1.2]);
  let mx = 0, y0 = 1e9, y1 = -1e9;
  for (const P of pts) {
    const d = [P[0] - ro[0], P[1] - ro[1], P[2] - ro[2]];
    const z = dot(d, fw), x = dot(d, rt) / z, y = dot(d, up) / z;
    mx = Math.max(mx, Math.abs(x)); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  // margins as shares of the frame height: a little more below for the index mark's room
  const side = 0.08, top = 0.1, bottom = 0.1;
  const focal = Math.min((aspect * 0.5 * (1 - 2 * side)) / mx, (1 - top - bottom) / (y1 - y0));
  const shift = (focal * (y0 + y1)) / 2 - (bottom - top) / 2;
  return { focal, shift, ty };
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return a.map(v => v / l); };

export default {
  id: 'product-turntable',
  name: 'Product turntable',
  kind: 'scene',
  mount(el, { palette, params = {} } = {}) {
    const form = FORMS[params.form] ?? (typeof params.form === 'number' ? params.form : 0);
    const stepDeg = params.step || 15, STEP = (stepDeg * Math.PI) / 180;
    const hold = params.hold ?? 1.7;
    const autoplay = params.autoplay !== 0;
    let given = palette || null;
    let T = tones(paletteOf(el, given));
    let prog = null, fit = null, fitKey = '';
    let angle = Math.round((((params.start ?? -30) * Math.PI) / 180) / STEP) * STEP, target = angle, vel = 0, sinceStep = 0;
    let base = 0, u0 = 0.5, lightA = -0.7;
    let readout = null;
    if (params.readout === 1) {
      readout = document.createElement('div');
      readout.className = 'obj-readout scene-label';
      readout.setAttribute('aria-hidden', 'true');
      el.appendChild(readout);
    }
    const cellOf = s => params.cell || clamp(Math.min(s.cssW, s.cssH) / 220, 2, 3);
    const s = stage(el, {
      name: 'turntable',
      cell: cellOf,
      alpha: !!params.transparent,
      preserve: !!params.transparent,
      loops: () => autoplay,
      // between steps nothing moves and nothing is drawn; a step needs no more than 30 frames a second
      fps: st => (st.pointer.inside ? 60 : 30),
      init(gl, st) { prog = st.program(frag(form)); },
      resize() { fitKey = ''; },
      pointer(kind, st) {
        const P = st.pointer;
        if (kind === 'enter' || kind === 'down') { base = Math.round(target / STEP) * STEP; u0 = P.u; }
        if ((kind === 'move' && P.inside) || kind === 'down') {
          const turns = P.type === 'mouse' ? 1 : 1.4;
          target = base + Math.round(((P.u - u0) * turns * 2 * Math.PI) / STEP) * STEP;
        }
        if (kind === 'leave') sinceStep = 0;
      },
      frame(gl, t, dt, st) {
        const P = st.pointer;
        const still = st.reduced || !st.running;
        if (!P.inside && !still && autoplay) {
          sinceStep += dt;
          if (sinceStep > hold) { target += STEP; sinceStep = 0; }
        }
        let moved = false;
        if (still || dt === 0) { if (st.reduced && angle !== target) { angle = target; moved = true; } }
        else if (Math.abs(target - angle) > 1e-4 || Math.abs(vel) > 1e-3) {
          // a stiff, critically damped spring: each step lands in about a third of a second
          const k = 170, d = 2 * Math.sqrt(k);
          const sub = Math.max(1, Math.ceil(dt / 0.008));
          for (let i = 0; i < sub; i++) { const h = dt / sub; vel += ((target - angle) * k - vel * d) * h; angle += vel * h; }
          if (Math.abs(target - angle) < 1e-4 && Math.abs(vel) < 1e-3) { angle = target; vel = 0; }
          moved = true;
        }
        const lt = -0.7 + (P.inside ? (P.u - 0.5) * 0.9 : 0);
        if (Math.abs(lt - lightA) > 1e-3) { lightA = still ? lt : approach(lightA, lt, 3, dt); moved = true; }
        if (dt > 0 && !st.dirty && !moved) return;
        const key = `${st.w}x${st.h}`;
        if (key !== fitKey) { fit = fitCamera(form, st.w / st.h); fitKey = key; }
        prog.use();
        setTones(gl, prog, T);
        prog.set('u_res', [st.w, st.h]).set('u_time', t).set('u_seed', 7).set('u_four', 4).set('u_five', 5)
          .set('u_rot', angle).set('u_steps', 120).set('u_shadowSteps', 36).set('u_focal', fit.focal)
          .set('u_dark', T.dark ? 1 : 0).set('u_lightA', lightA).set('u_lightE', 0.78)
          .set('u_cam', [CAM.dist, CAM.elev, fit.ty]).set('u_shift', fit.shift).set('u_clear', params.transparent ? 1 : 0)
          .set('u_px', CAM.dist / (fit.focal * st.h));
        st.fullscreen();
        if (readout) {
          const deg = ((Math.round((target * 180) / Math.PI) % 360) + 360) % 360;
          const txt = String(deg).padStart(3, '0') + '°';
          if (readout.textContent !== txt) readout.textContent = txt;
        }
      },
      fallback() {
        // stills rendered by this object on a clear ground (make-fallbacks.html): ink for light pages,
        // light for dark ones, one pair per form
        const im = document.createElement('img');
        im.src = new URL(`./fallback-${NAMES[form]}-${T.dark ? 'dark' : 'light'}.png`, import.meta.url).href;
        im.alt = '';
        im.onerror = () => im.remove();
        Object.assign(im.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' });
        return im;
      },
      failed() { readout?.remove(); },
    });
    const styleReadout = () => {
      if (!readout) return;
      Object.assign(readout.style, {
        position: 'absolute', left: '50%', bottom: '12px', transform: 'translateX(-50%)', zIndex: '1',
        font: `500 11px/1 ${MONO}`, letterSpacing: '0.08em', color: T.hex.muted, pointerEvents: 'none',
      });
    };
    styleReadout();
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', params.alt || el.getAttribute('aria-label') || LABELS[form]);
    el.style.touchAction = 'pan-y';
    return {
      destroy() { s.destroy(); readout?.remove(); },
      pause: () => s.pause(),
      resume: () => s.resume(),
      setPalette(p) { if (p !== undefined) given = p; T = tones(paletteOf(el, given)); styleReadout(); s.redraw(); },
      get stage() { return s; },
    };
  },
};
