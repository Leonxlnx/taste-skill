// orb-sphere: one sphere with a slowly turning nebula inside. The sphere normal is rebuilt per pixel,
// so the nebula is 3D noise on a turning sphere (true rotation), the rim is a fresnel edge, and specks
// of light sit on the near and far shell (they cross in opposite directions).
// Two grounds, chosen by the page text: on pages with light text the orb glows in a dark field (the
// page ground, or a deep tone of a colour ground); on pages with dark text the field is the page
// ground itself and the orb is a dark glass ball with a soft halo, so the text keeps its contrast.
// The orb is placed on the side away from the calm area (where the page puts its text).
import { shader, color, paletteKind } from '../fx.js';

const params = {
  size:          { default: 0.36, min: 0.12, max: 0.6, step: 0.01 },  // radius, share of the shorter side
  rim:           { default: 0.8,  min: 0,    max: 1.5, step: 0.01 },  // brightness of the fresnel edge
  innerContrast: { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // how strongly the nebula shows
  stars:         { default: 60,   min: 0,    max: 200, step: 1 },     // specks of light inside
  glow:          { default: 0.35, min: 0,    max: 1,   step: 0.01 },  // soft light around the orb
  speed:         { default: 0.05, min: 0,    max: 0.4, step: 0.005 }, // turning speed; 0.05 is about 25 s a turn
  pulse:         { default: 0,    min: 0,    max: 1,   step: 0.01 },  // gentle breathing of size and glow
  orbX:          { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // wanted orb centre, 0 left .. 1 right
  orbY:          { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // wanted orb centre, 0 top .. 1 bottom
  calm:          { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // keep the orb and glow off this area
  calmX:         { default: 0.25, min: 0,    max: 1,   step: 0.01 },
  calmY:         { default: 0.7,  min: 0,    max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// float hash for the 3D lattice (no sine, so no streaks on coarse GPUs), -1..1
vec3 orb_h3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0;
}
// 3D gradient noise, about -0.8..0.8
float orb_noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float a = dot(orb_h3(i), f);
  float b = dot(orb_h3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
  float c = dot(orb_h3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
  float d = dot(orb_h3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
  float e = dot(orb_h3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
  float g = dot(orb_h3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
  float h = dot(orb_h3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
  float k = dot(orb_h3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
  return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z) * 1.6;
}
float orb_fbm(vec3 p) {
  float s = orb_noise(p);
  s += 0.5 * orb_noise(p * 2.03 + vec3(1.7, 9.2, 3.1));
  s += 0.25 * orb_noise(p * 4.07 + vec3(8.3, 2.8, 5.4));
  return s / 1.75;
}
vec3 orb_rot(vec3 n, float a, float tilt) {
  // tilt the axis toward the viewer a little, then turn around it
  float ct = cos(tilt), st = sin(tilt);
  n = vec3(n.x, ct * n.y - st * n.z, st * n.y + ct * n.z);
  float c = cos(a), s = sin(a);
  return vec3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z);
}
// specks of light on a unit sphere: one candidate per cell of a cube map, px = pixels per cell.
// Most are fine points of varied brightness; a few are larger, softer and dimmer.
float orb_stars(vec3 d, float grid, float thr, float px, float t, float salt) {
  vec3 a = abs(d);
  vec2 uv; float face;
  if (a.x >= a.y && a.x >= a.z) { uv = d.yz / a.x; face = d.x > 0.0 ? 1.0 : 2.0; }
  else if (a.y >= a.z) { uv = d.zx / a.y; face = d.y > 0.0 ? 3.0 : 4.0; }
  else { uv = d.xy / a.z; face = d.z > 0.0 ? 5.0 : 6.0; }
  vec2 g = uv * grid;
  vec2 cell = floor(g);
  vec2 key = cell + vec2(face * 53.0 + salt, face * 29.0 - salt);
  float h = fx_hash(key);
  if (h < thr) return 0.0;
  vec2 pos = 0.22 + 0.56 * fx_hash2(key + 17.0);
  float dist = length(g - cell - pos) * px;
  float sz = fract(h * 37.0);
  float big = step(0.88, sz);
  float r = mix(mix(0.45, 1.05, sz / 0.88), mix(1.7, 2.8, (sz - 0.88) / 0.12), big) * u_dpr;
  float tw = 0.62 + 0.38 * sin(t * (0.6 + 1.4 * fract(h * 91.0)) + h * 60.0);
  float b = mix(0.22, 1.0, pow(fract(h * 13.0), 1.7)) * mix(1.0, 0.42, big);
  return exp(-dist * dist / (r * r)) * tw * b;
}
vec3 orb_tone(vec3 c) {
  // soft shoulder above 0.62 (linear), so the rim turns toward white instead of clipping
  vec3 k = max(c - 0.62, 0.0);
  return min(c, vec3(0.62)) + 0.38 * (1.0 - exp(-k / 0.38));
}

void main() {
  vec2 uv = fx_uv();
  float t = u_time;
  float S = min(u_res.x, u_res.y);
  float br = u_pulse * sin(t * 1.25);
  float R = u_size * u_orbS * S * (1.0 + 0.018 * br);
  // the centre is placed on the CPU (away from the calm area, inside the frame where it fits)
  vec2 c = vec2(u_orbC.x, 1.0 - u_orbC.y) * u_res;
  vec2 q = (gl_FragCoord.xy - c) / R;
  float r = length(q);
  float px = 1.0 / R;

  // the field and the orb's halo, kept off the calm area
  float calmM = 1.0 - u_calm * fx_calm(uv, vec2(u_calmX, u_calmY), 0.3 + 0.35 * u_calm);
  float d = max(r - 1.0, 0.0);
  vec3 field;
  if (u_light > 0.5) {
    // light ground: the page ground itself, tinted softly toward the orb's light near it
    float h2 = exp(-d * 2.0) * 0.55 + exp(-d * 7.0) * 0.45;
    field = mix(u_kGround, u_kGlow, clamp(h2 * u_glow * 1.15 * (1.0 + 0.3 * br) * calmM, 0.0, 1.0));
  } else {
    float halo = exp(-d * 2.6) * 0.5 + exp(-d * 9.0) * 0.5;
    field = orb_tone(u_kGround + u_kGlow * halo * u_glow * (1.0 + 0.3 * br) * calmM);
  }
  vec3 col = field;

  if (r < 1.0 + 2.0 * px) {
    float z = sqrt(max(1.0 - r * r, 0.0));
    vec3 n = vec3(q, z);
    float ang = t * u_speed * 5.0 + u_seed * 0.0123;
    vec3 nr = orb_rot(n, ang, 0.38);
    vec3 so = vec3(u_seed * 0.0173, u_seed * 0.0071, u_seed * 0.0119);
    so = so - floor(so / 61.0) * 61.0;

    // nebula: large shapes and a warped finer layer, sampled on the turning surface
    float A = orb_fbm(nr * 1.55 + so);
    float B = orb_fbm(nr * 3.3 + vec3(A * 1.6) + so.zxy);
    float neb = smoothstep(-0.2, 0.75, A * 0.7 + B * 0.55);
    float wisp = smoothstep(0.2, 0.68, B) * neb;

    float fres = pow(1.0 - z, 3.0);
    float limb = pow(1.0 - z, 10.0);
    vec3 inside = u_kDeep * (0.6 + 0.8 * (1.0 - z));
    float body = (0.18 + 1.25 * u_innerContrast);
    inside += u_kTone * (neb * neb * 0.42 + wisp * wisp * 0.9) * body * mix(0.45, 1.0, 1.0 - z * z);

    // specks of light: the near shell bright, the far shell dim and turning the other way across
    float pxCell = R / u_grid * mix(0.55, 1.0, z);
    float st = orb_stars(nr, u_grid, u_thr, pxCell, t, 0.0);
    vec3 nb = orb_rot(vec3(q, -z), ang, 0.38);
    float sb = orb_stars(nb, u_grid, u_thr, pxCell, t, 311.0);
    inside += u_kStar * (st + 0.4 * sb * (1.0 - 0.5 * neb));

    // fresnel rim (tinted) and a thin bright limb: the edge is brighter than the centre
    inside += (u_kTone * fres * 0.75 + u_kRim * limb * 0.9) * u_rim * (1.0 + 0.15 * br);
    // a small window reflection, upper left, so the dark ball reads as glass
    vec2 hq = mat2(0.8, -0.6, 0.6, 0.8) * (q - vec2(-0.4, 0.46)) * vec2(1.0, 2.1);
    float hl = exp(-dot(hq, hq) * 30.0);
    inside += u_kRim * (hl * 0.9 + exp(-dot(hq, hq) * 5.0) * 0.12) * u_spec;
    // on a light ground the lower limb catches light bounced up from the ground
    inside += u_kGround * u_light * 0.2 * smoothstep(0.2, -0.95, q.y) * fres;

    float edge = smoothstep(1.0 + 0.75 * px, 1.0 - 0.75 * px, r);
    col = mix(field, orb_tone(inside), edge);
  }

  fxColor = vec4(fx_dither(fx_srgb(col)), 1.0);
}
`;

const lin = c => color.rgb(c).map(v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lc = (c, L, C) => { const [, , h] = color.lch(c); return color.fromLch([L, C, h]); };
// blues lightened at a fixed hue drift toward lavender: keep their hue at 248 and their chroma modest
function noLavender(c) {
  const [L, C, h] = color.lch(c);
  if (C < 0.02 || h < 248 || h > 284) return color.hex(c);
  return color.fromLch([L, L > 0.6 ? Math.min(C, 0.12) : C, 248]);
}

// every colour comes from the palette: the orb takes the accent hue (a colour ground's own hue when its
// accent clashes); the field is the page ground (dark-text pages) or its darkest tone (light-text pages)
function tones(P) {
  const kind = paletteKind(P);
  const { bg, ink, accent } = P;
  const light = color.lab(ink)[0] < color.lab(bg)[0];
  const Ca = color.chroma(accent);
  let hue = accent;
  if (light) hue = Ca >= 0.04 ? accent : color.chroma(ink) >= 0.04 ? ink : color.chroma(bg) >= 0.04 ? bg : accent;
  else if (kind === 'colour' && (color.hueDistance(bg, accent) > 55 || Ca < 0.03)) hue = bg;
  const C = color.chroma(hue);
  // yellows and yellow-greens turn olive or brown when darkened: there the body stays near the ink
  // and the light is kept high, so the colour reads as light on dark instead of mud
  const h = color.lch(hue)[2];
  const olive = C > 0.04 && h > 75 && h < 140;
  // the orb's light: a lively light step of the hue, at least some chroma so a muted accent still glows
  const tone = noLavender(C > 0.02 ? lc(hue, olive ? 0.82 : 0.74, clamp(C * 1.1, 0.1, 0.16)) : color.withLightness(hue, 0.76));
  let ground, deep, glow;
  if (light) {
    ground = bg;
    // a deep glass of the hue with some of the page ink in it
    deep = color.mix(ink, lc(hue, 0.3, clamp(C, 0.04, 0.08)), olive ? 0.3 : 0.75);
    // the halo tints the ground toward the orb's light; when the two hues are far apart that mix
    // turns grey, so the ground only lightens
    glow = color.chroma(bg) > 0.04 && color.hueDistance(bg, tone) > 70 ? color.mix(bg, '#ffffff', 0.5) : color.mix(bg, tone, 0.55);
  } else {
    ground = kind === 'dark' ? bg : lc(bg, 0.2, clamp(color.chroma(bg) * 0.55, 0.04, 0.1));
    deep = color.mix(ground, lc(hue, 0.3, Math.min(C, 0.08)), olive ? 0.12 : 0.3);
    glow = color.mix(ground, tone, 0.55);
  }
  return {
    kind, light, ground, tone, deep, glow,
    rim: noLavender(color.mix('#ffffff', tone, 0.3)),
    star: color.mix('#ffffff', tone, 0.12),
  };
}

/*
  Where the orb goes (px, y down): the wanted spot (orbX, orbY) if the orb clears the calm area there;
  otherwise the nearest spot that clears it, inside the frame if possible, then cropped by the frame
  edge (a planet rising into the corner); failing all that, the spot farthest from the calm area.
*/
function placeOrb(prm, w, h) {
  const R0 = prm.size * Math.min(w, h);
  const want = [prm.orbX * w, prm.orbY * h];
  const inside = (m) => {
    const lo = [m, m], hi = [w - m, h - m];
    return p => [hi[0] > lo[0] ? clamp(p[0], lo[0], hi[0]) : w / 2, hi[1] > lo[1] ? clamp(p[1], lo[1], hi[1]) : h / 2];
  };
  const start = inside(R0 * 1.12)(want);
  if (prm.calm <= 0.05) return [...start, 1];
  const cc = [prm.calmX * w, prm.calmY * h];
  // clearance around the calm centre: text runs wider than it is tall
  const rc = (0.3 + 0.35 * prm.calm) * h;
  const clearFor = R => p => ((p[0] - cc[0]) / (R + 0.9 * rc)) ** 2 + ((p[1] - cc[1]) / (R + 0.5 * rc)) ** 2;
  if (clearFor(R0)(start) >= 1) return [...start, 1];
  // the nearest clear spot: whole orb in frame first (a little smaller if need be), then cropped by the edge
  let far = start, farD = clearFor(R0)(start);
  for (const [s, m] of [[1, 1.12], [0.84, 1.12], [0.7, 1.12], [1, 0.25]]) {
    const R = R0 * s, f = inside(R * m), clear = clearFor(R);
    let best = null, bestE = Infinity;
    for (let i = 0; i <= 32; i++) for (let j = 0; j <= 20; j++) {
      const p = f([w * i / 32, h * j / 20]);
      const dd = clear(p);
      if (dd >= 1) { const e = Math.hypot(p[0] - want[0], p[1] - want[1]); if (e < bestE) { bestE = e; best = p; } }
      if (s === 1 && dd > farD + 1e-3) { farD = dd; far = p; }
    }
    if (best) return [...best, s];
  }
  return [...far, 1];
}

function uniforms({ palette, params, width, height }) {
  const k = tones(palette);
  const grid = 11;
  // stars spread over the near and far shell: 6 faces * grid^2 cells
  const p = Math.min(0.5, params.stars / (6 * grid * grid) * 1.25);
  const w = width || 800, h = height || 500;
  const [cx, cy, s] = placeOrb(params, w, h);
  return {
    u_orbS: s,
    u_kGround: lin(k.ground),
    u_kDeep: lin(k.deep),
    u_kTone: lin(k.tone),
    u_kGlow: lin(k.glow),
    u_kRim: lin(k.rim),
    u_kStar: lin(k.star),
    u_light: k.light ? 1 : 0,
    u_spec: k.light ? 0.3 : 0,
    u_orbC: [cx / w, cy / h],
    u_grid: grid,
    u_thr: params.stars <= 0 ? 2 : 1 - p,
  };
}

// CSS stand-in: a soft body with an offset highlight, a thin rim and a glow that fades outward, in px
function fallback({ palette: P, params: prm, width, height }) {
  const k = tones(P);
  const w = width || 800, h = height || 500;
  const [cx, cy, s] = placeOrb(prm, w, h);
  const R = prm.size * s * Math.min(w, h);
  const f = v => `${v.toFixed(1)}px`;
  const at = `${f(cx)} ${f(cy)}`;
  const g0 = k.light ? color.mix(k.ground, k.glow, 0.55 * prm.glow * 1.6) : color.mix(k.ground, k.glow, Math.min(1, prm.glow * 1.3));
  const g1 = color.mix(k.ground, g0, 0.4);
  const deepC = color.mix(k.deep, k.tone, k.light ? 0.06 : 0.1);
  const deepE = color.mix(k.deep, k.tone, 0.32);
  const rim = color.mix(deepE, k.rim, Math.min(1, 0.45 + 0.35 * prm.rim));
  const hl = color.mix(k.deep, k.rim, 0.3);
  return [
    // the lit side (light ground: a glass reflection; dark field: the glow inside)
    `radial-gradient(circle ${f(R * 0.42)} at ${f(cx - R * 0.34)} ${f(cy - R * 0.4)}, ${hl}${k.light ? 'cc' : '55'}, ${hl}00)`,
    `radial-gradient(circle ${f(R * 0.55)} at ${f(cx + R * 0.22)} ${f(cy + R * 0.18)}, ${color.mix(k.deep, k.tone, 0.3)}99, ${k.deep}00)`,
    `radial-gradient(circle at ${at}, ${deepC} 0, ${k.deep} ${f(R * 0.62)}, ${deepE} ${f(R * 0.93)}, ${rim} ${f(R - 1)}, ${g0} ${f(R + 0.6)}, ${g1} ${f(R * 1.3)}, ${k.ground}00 ${f(R * 2.1)})`,
    k.ground,
  ].join(', ');
}

export default {
  id: 'orb-sphere',
  name: 'Light orb',
  family: 'light',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, { frag, schema: params, params: given, palette, seed, uniforms, still: 6, fallback });
  },
};
