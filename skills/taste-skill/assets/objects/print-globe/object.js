/*
  print-globe - a desk globe: the Earth on its tilted axis (23.4 degrees), held at the poles by a half
  meridian band, on a turned stem and a stepped round base. The land is the real coastline, traced
  into a small map once per page; a blue or teal accent prints the sea, any other accent the land,
  and the stand prints in the ink. Rendered: parchment land, the sea in a blue accent or a deep ocean
  blue, a brass meridian and a walnut stand.
  The Earth turns slowly on its axis while the stand sways a little. Hover: the light follows the
  pointer and the globe leans toward it. Click, Enter or focus: a flick, the Earth spins up and runs
  down again, as a real globe does under a hand.
*/
import { definePrint } from '../_print-core/print3d.js';
import { LAND, LAKES } from './land.js';

const DEG = Math.PI / 180;

const glsl = /* glsl */ `
const vec3 GC = vec3(0.0, 0.6, 0.0);
const float GR = 0.29;
const vec3 AX = vec3(-0.3971, 0.9178, 0.0);     // the axis, tilted 23.4 degrees
const vec2 AXP = vec2(0.9178, 0.3971);           // across it, in the meridian's plane
const float TILT = 0.4084;

vec2 map(vec3 p) {
  vec3 q = p - GC;
  float earth = length(q) - GR;
  // the half meridian: a flat band round one side, through the poles and under the globe
  float ring = sdRect(vec2(length(q.xy) - 0.318, q.z), vec2(0.0042, 0.0115), 0.002);
  ring = max(ring, dot(q.xy, AXP));
  float pins = min(sdCapsule(q, AX * 0.27, AX * 0.334, 0.0042), sdCapsule(q, -AX * 0.27, -AX * 0.334, 0.0042));
  pins = min(pins, min(length(q - AX * 0.336), length(q + AX * 0.336)) - 0.009);
  // the stand: a stem with a turned knop, a stepped base
  float stem = sdCapsule(p, vec3(0.0, 0.05, 0.0), vec3(0.0, GC.y - 0.318, 0.0), 0.0105);
  vec3 kq = (p - vec3(0.0, 0.16, 0.0)) / vec3(1.0, 1.45, 1.0);
  stem = smin(stem, (length(kq) - 0.026) * 0.69, 0.012);
  float base = min(sdCyl(p - vec3(0.0, 0.018, 0.0), 0.15, 0.018, 0.008), sdCyl(p - vec3(0.0, 0.046, 0.0), 0.082, 0.011, 0.005));
  vec2 res = vec2(earth, 1.0);
  if (ring < res.x) res = vec2(ring, 2.0);
  if (pins < res.x) res = vec2(pins, 2.0);
  float st = min(stem, base);
  if (st < res.x) res = vec2(st, 3.0);
  return res;
}

void surf(float id, vec3 p, vec3 n, inout Surf s) {
  vec3 q = p - GC;
  if (id < 1.5) {
    // into the Earth's own frame: axis up, turned by the spin
    vec3 e = q;
    e.xy = rot2(-TILT) * e.xy;
    e.xz = rot2(u_spin) * e.xz;
    float lon = atan(e.x, e.z), lat = asin(clamp(e.y / GR, -1.0, 1.0));
    // textureLod, never texture(): surf runs inside the march's loops, where a GPU's compiler (ANGLE
    // on Direct3D) may refuse sampling with implicit gradients; the level from a texel's footprint on
    // the ball (1024 map texels round it, a screen texel u_pix * 6 units wide at the camera's distance)
    float lod = max(0.0, log2(1024.0 / (2.0 * PI * GR) * u_pix * 6.0));
    float land = textureLod(u_aux, vec2(0.5 + lon / (2.0 * PI), 0.5 - lat / PI), lod).a;
    // a faint graticule every 30 degrees
    float gl = abs(fract(lat / (PI / 6.0) + 0.5) - 0.5) * 30.0;
    float gm = abs(fract(lon / (PI / 6.0) + 0.5) - 0.5) * 30.0 * cos(lat);
    float grid = 1.0 - smoothstep(0.25, 0.6, min(gl, gm)) * 1.0;
    s.gloss = 0.35; s.shine = 30.0;
    // the accent goes on the sea when it is a blue or a teal; any other accent (an orange, a green)
    // goes on the land, so a sea never reads as land
    float blue = step(0.06, u_accent.b - max(u_accent.r, u_accent.g * 0.85));
    bool lit = land > 0.5;
    if (u_render > 0.5) {
      // the render: a varnished paper globe, parchment land, the sea in a blue accent or a deep
      // ocean blue, the graticule printed faintly over both
      vec3 sea = blue > 0.5 ? toLin(u_accent) : vec3(0.025, 0.075, 0.14);
      s.col = mix(sea, vec3(0.6, 0.5, 0.31), smoothstep(0.35, 0.65, land)) * (1.0 - 0.22 * grid);
      s.accent = blue > 0.5 ? 1.0 - smoothstep(0.35, 0.65, land) : 0.0;   // the poster relights a blue sea in the accent
      s.gloss = 0.7; s.shine = 45.0;
      return;
    }
    if (blue > 0.5) {
      s.albedo = mix(0.5, 0.97, land) * (1.0 - 0.16 * grid * (1.0 - land));
      s.accent = lit ? 0.0 : 1.0;
      // land never prints darker than a mid tone and the sea never lighter than a light one, so the
      // coastlines hold whatever the light (or the pointer) does
      if (lit) { s.lo = 0.0; s.hi = 0.48; } else { s.lo = 0.34; s.hi = 0.95; }
    } else {
      // the land in the accent, a full plate; the sea a light tone of the ink with its graticule
      s.albedo = mix(0.86, 0.6, land) * (1.0 - 0.18 * grid * (1.0 - land));
      s.accent = lit ? 1.0 : 0.0;
      if (lit) { s.lo = 0.42; s.hi = 0.95; } else { s.lo = 0.0; s.hi = 0.42; }
    }
    // engraved lines: parallel planes tipped back 22 degrees, a little more than the camera's 14, so
    // the lines bow gently round the ball like latitudes seen from a little above while their poles
    // stay on (or just inside) the outline (circles about the Earth's own pole crowded into a bullseye,
    // and a flat tint there printed as a blotch)
    s.coord = dot(q, u_rot * vec3(0.0, 0.9272, -0.3746)) * 1.1;
  } else if (id < 2.5) {                         // the brass meridian and its pins
    s.albedo = 0.7; s.gloss = 0.85; s.shine = 70.0;
    if (u_render > 0.5) { s.col = vec3(0.6, 0.42, 0.16); s.metal = 1.0; s.shine = 45.0; }
    s.coord = length(q.xy);
  } else {                                       // turned wood stand
    s.albedo = 0.46; s.gloss = 0.45; s.shine = 30.0;
    // the render: oiled walnut, its grain running up the stem and round the base
    if (u_render > 0.5) { float gr = 0.5 + 0.5 * sin(p.y * 160.0 + 9.0 * sin(atan(p.z, p.x) * 3.0 + p.y * 20.0)); s.col = mix(vec3(0.07, 0.034, 0.016), vec3(0.12, 0.062, 0.03), gr); s.gloss = 0.55; s.shine = 36.0; }
    s.coord = p.y;
  }
}
`;

// the same test as the shader's: a blue or teal accent (blue well above red and green)
function seaAccent(hex) {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  if (!Number.isFinite(n)) return false;
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  return b - Math.max(r, g * 0.85) >= 0.06;
}

// the land as a 1024 x 512 equirectangular mask (white land on clear), made once per page
let landCanvas = null;
function landMask() {
  if (landCanvas) return landCanvas;
  const w = 1024, h = 512, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const sx = w / 360, sy = h / 180;
  const fill = (poly, off) => {
    x.beginPath();
    x.moveTo((poly[0] + 180 + off) * sx, (90 - poly[1]) * sy);
    for (let i = 2; i < poly.length; i += 2) x.lineTo((poly[i] + 180 + off) * sx, (90 - poly[i + 1]) * sy);
    x.closePath();
    x.fill();
  };
  x.filter = 'blur(0.6px)';
  x.fillStyle = '#fff';
  for (const off of [-360, 0, 360]) for (const p of LAND) fill(p, off);
  x.globalCompositeOperation = 'destination-out';
  for (const p of LAKES) fill(p, 0);
  landCanvas = c;
  return c;
}

export default definePrint({
  id: 'print-globe',
  name: 'Desk globe',
  label: 'A desk globe turning on its tilted axis',
  base: import.meta.url,
  glsl,
  pivot: [0, 0.46, 0],
  radius: 0.5,
  extent: [0.34, 0.47],
  camera: { elev: 14, dist: 6, target: 0.44 },
  light: [-0.32, 1.6, 0.75],
  turn: { mode: 'sway', amp: 16, period: 26 },
  step: 'impulse',
  texture: landMask,
  posterPrint: 'engrave',
  // the accent sits on the sea when it is blue (as the shader decides), else on the land (a print) or
  // nowhere (the render keeps its deep ocean blue): so each picture has a second set of posters
  poster: (pal, dark, render) => (seaAccent(pal.accent) ? `./fallback-${render ? 'render-' : ''}sea${dark ? '-dark' : ''}.png` : null),
  plates: [
    { file: 'fallback-sea.png', paper: 'light', accent: '#2f5f93' }, { file: 'fallback-sea-dark.png', paper: 'dark', accent: '#5a8fd0' },
    { file: 'fallback-render-sea.png', paper: 'light', accent: '#2f5f93', render: 1 }, { file: 'fallback-render-sea-dark.png', paper: 'dark', accent: '#5a8fd0', render: 1 },
  ],
  press: 'Press to spin it.',
  params: { effect: { default: 'render' }, angle: { default: 22 }, size: { default: 0.8 } },
  // card: cut by the bottom-left (the bottom-right corner stays clear for the pause button), and in a
  // panel about as tall as wide (a phone) less cut, so the thing still reads; tile: whole, low; hero:
  // right of the text, smaller and under it in a phone-shaped frame
  place: {
    card: { transparent: 1, size: 1.12, x: -0.2, y: -0.24, narrow: { size: 0.94, x: -0.1, y: -0.24 } },
    tile: { transparent: 1, size: 0.86, y: -0.06 },
    hero: { transparent: 1, size: 0.9, x: 0.2, y: -0.02, narrow: { size: 0.66, x: 0.1, y: -0.2 } },
  },
  // the Earth turns on its axis; a click flicks it, and the spin runs down
  update(state, dt) {
    const flick = state.kicks ? 300 * Math.exp(-state.kick * 0.85) : 0;
    return { spin: state.spin + dt * (9 + flick) * state.params.speed * DEG };
  },
});
