/*
  print-cards - a loose stack of ten playing cards: rounded corners, each a hair off true, the backs
  with a white border round a diamond lattice and a ruled frame, and the top card turned face up (an
  ace of diamonds), so it reads as playing cards at any size. The backs and the pips print in the
  accent, the card stock and edges in the ink. Rendered: white stock, red pips, backs in the accent.
  At rest the cards lie in a loose spread and turn slowly on the table. Hover: the light follows the
  pointer and the stack leans toward it. Click, Enter or focus: the cards fan out from the near edge like a hand being spread; click
  again to gather them.
*/
import { definePrint } from '../_print-core/print3d.js';

const glsl = /* glsl */ `
const vec2 FAN = vec2(0.0, 0.215);              // the fan's pivot, near the bottom edge
const vec3 CARD = vec3(0.2, 0.0026, 0.28);      // half sizes: 63 x 88 card proportions
const float PITCH = 0.0062;

// card i's frame: jitter, then the fan about its pivot
vec3 cardFrame(vec3 p, float fi) {
  float a = (hash1(fi + 3.1) - 0.5) * 0.09 + mix(0.5, 1.0, u_step) * (fi / 9.0 - 0.5) * 1.05;
  vec2 j = (vec2(hash1(fi + 7.7), hash1(fi + 1.3)) - 0.5) * 0.014;
  vec3 q = p - vec3(FAN.x, 0.0026 + fi * PITCH, FAN.y);
  q.xz = rot2(-a) * q.xz;
  q.xz += FAN - j;
  return q;
}
// a diamond pip of half width a, half height b, its sides curved in a little as on real cards
// (roughly a distance: negative inside)
float pip(vec2 c, vec2 hb) {
  vec2 k = abs(c) / hb;
  float f = pow(k.x, 0.82) + pow(k.y, 0.82) - 1.0;
  return f * min(hb.x, hb.y) * 0.62;
}
// the face's ink: the big pip, and in the far-left and near-right corners an A over a small pip,
// both upright for a reader at that corner's edge (negative inside)
float faceMark(vec2 c) {
  float m = pip(c, vec2(0.068, 0.098));
  float sg = c.x < 0.0 ? -1.0 : 1.0;
  if (c.x * c.y > 0.0) {
    vec2 u = vec2((c.x - sg * 0.162) * -sg, (c.y - sg * 0.236) * sg);
    float a = min(sdSeg(u, vec2(-0.0125, -0.017), vec2(0.0, 0.018)), sdSeg(u, vec2(0.0, 0.018), vec2(0.0125, -0.017)));
    a = min(a, sdSeg(u, vec2(-0.0068, -0.0035), vec2(0.0068, -0.0035)));
    m = min(m, a - 0.0034);
    m = min(m, pip(u - vec2(0.0, -0.043), vec2(0.0115, 0.016)));
  }
  return m;
}
float card(vec3 q) { return extrude(sdRect(q.xz, CARD.xz, 0.032), q.y, CARD.y, 0.0012); }

vec2 map(vec3 p) {
  vec2 res = vec2(1e9, 0.0);
  // above the stack: no card is nearer than the top card's face (y 0.0612); a bound that is too short
  // would also darken the whole face through the occlusion
  if (p.y > 0.09) return vec2(p.y - 0.062, 0.0);
  for (int i = min(u_steps, 0); i < 10; i++) {
    float fi = float(i);
    float d = card(cardFrame(p, fi));
    if (d < res.x) res = vec2(d, fi);
  }
  return res;
}

void surf(float id, vec3 p, vec3 n, inout Surf s) {
  vec3 q = cardFrame(p, id);
  s.albedo = 0.94; s.gloss = 0.25; s.shine = 26.0;
  s.coord = q.z;
  s.hi = 0.5;                                     // white stock: never a dark grey
  // the render: linen-finish card stock, red pips, the backs printed in the accent
  bool rend = u_render > 0.5;
  if (rend) { s.col = vec3(0.8, 0.79, 0.75); s.gloss = 0.45; s.shine = 34.0; }
  if (id > 8.5 && n.y > 0.6) {
    // the top card, face up: the ace of diamonds, one large pip in the middle and in two opposite
    // corners the index (an A over a small pip), each edge softened over about a texel
    float m = faceMark(q.xz);
    float w = max(u_pix * 7.0, 0.0012);
    float ink = 1.0 - smoothstep(-w, w, m);
    if (rend) { s.col = mix(s.col, vec3(0.48, 0.012, 0.02), ink); s.gloss = mix(0.45, 0.6, ink); return; }
    // the face is white card: it prints almost clean, so the pips and the dark edge of the stack carry it
    s.albedo = 0.98; s.hi = 0.0;
    if (ink > 0.5) { s.albedo = 0.6; s.accent = 1.0; s.lo = 0.55; s.hi = 1.0; }
    return;
  }
  if (abs(n.y) > 0.6) {
    // the back: a white border, a ruled frame, then a diamond lattice in the accent
    float inset = sdRect(q.xz, CARD.xz - 0.022, 0.016);
    if (inset < 0.0) {
      float fq = rend ? 30.0 : 13.0;
      vec2 g = vec2(q.x + q.z, q.x - q.z) * fq;
      vec2 f = abs(fract(g) - 0.5);
      float lattice = smoothstep(0.1, 0.16, min(f.x, f.y));
      lattice = mix(0.72, lattice, smoothstep(3.0, 6.0, 1.0 / (fq * max(6.0 * u_pix, 1e-5))));
      float frame = smoothstep(0.003, 0.005, abs(inset + 0.009));
      s.albedo = mix(0.32, 0.76, lattice) * mix(0.45, 1.0, frame);
      if (rend) { s.col = toLin(u_accent) * mix(0.4, 1.0, lattice) * mix(0.5, 1.0, frame); s.accent = 1.0; return; }
      s.lo = 0.3;                                 // the back always prints as a coloured field
      s.hi = 1.0;
      s.accent = 1.0;
      s.gloss = 0.4;
      s.coord = (q.x + q.z) * 0.8;
    }
  }
}
`;

export default definePrint({
  id: 'print-cards',
  name: 'Playing cards',
  label: 'A stack of playing cards; it fans out when chosen',
  base: import.meta.url,
  glsl,
  pivot: [0, 0.04, 0],
  radius: 0.4,
  extent: [0.44, 0.32],
  bound: 0.82,
  camera: { elev: 38, dist: 6, target: 0.02 },
  light: [-0.45, 1.25, 0.55],
  turn: { mode: 'spin', speed: 6 },
  step: 'toggle',
  stepTime: 1.0,
  shadowSteps: 32,
  floorReach: 0.04,
  press: 'Press to fan the cards out.',
  params: { effect: { default: 'render' }, angle: { default: 20 }, size: { default: 0.82 } },
  // card: cut by the bottom-left (the bottom-right corner stays clear for the pause button), and in a
  // panel about as tall as wide (a phone) less cut, so the thing still reads; tile: whole, low; hero:
  // right of the text, smaller and under it in a phone-shaped frame
  place: {
    card: { transparent: 1, size: 1.2, x: -0.22, y: -0.14, narrow: { size: 1.0, x: -0.12, y: -0.12 } },
    tile: { transparent: 1, size: 1.0, y: -0.04 },
    hero: { transparent: 1, size: 1.05, x: 0.22, y: -0.04, narrow: { size: 0.8, x: 0.05, y: -0.22 } },
  },
});
