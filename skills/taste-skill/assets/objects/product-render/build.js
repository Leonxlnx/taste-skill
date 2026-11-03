/*
  product-render/build.js - a studio render of ANY physical product, composed from a short JSON spec.

  A product without photographs (a bicycle, a lamp, a chair, a robot arm, a speaker, a stroller...) is
  shown as a crafted render of itself: the spec lists its parts (tubes, beams, wheels with spokes,
  rounded boxes, cylinders, joints, panels, a seat, a basket, a shade, springs, arcs, paths), their
  sizes and positions in the product's own units, and their materials (painted metal, brushed alloy,
  chrome, rubber, wood, fabric, leather, plastic, a light). build.js turns the spec into a signed-
  distance model and hands it to _print-core/print3d.js, which renders it under soft studio light
  with soft shadows, the reflections of a softbox and a floor shadow, as a turntable or a still.

    import { loadProduct } from '<assets>/objects/product-render/build.js';
    const product = await loadProduct('specs/city-bike.json');          // a URL, relative to the page
    const ctrl = product.mount(el, { place: 'hero' });                   // or 'stage', 'tile', 'card'

  or with no script of its own (auto.js beside this file):
    <div class="frame" data-product="assets/objects/product-render/specs/city-bike.json" data-product-place="hero"></div>

  The spec format, the parts, the materials and the limits: README.md beside this file.

  It always shows a picture: the poster (<poster>.fallback-render.png, made by make-posters.mjs from the same
  spec) shows at once and stays when WebGL2 is missing, a shader fails or the first frame is empty.
  A phone (narrow screen or coarse pointer) and prefers-reduced-motion get one still frame; the
  context is freed once it has drawn. One product render a page holds a live context at a time.
*/
import { definePrint, glslProblems } from '../_print-core/print3d.js';

const DEG = Math.PI / 180;
const HAS_DOM = typeof window !== 'undefined' && typeof document !== 'undefined';

/* ------------------------------------------------------------------ small maths */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const nrm = a => { const l = len(a) || 1; return mul(a, 1 / l); };
// row-major 3x3, local -> object: object = R * local
const matVec = (R, v) => [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]];
const matMul = (A, B) => { const r = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return r; };
const fromCols = (x, y, z) => [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]];
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
function euler(r = [0, 0, 0]) {
  const [x, y, z] = r.map(v => (v || 0) * DEG);
  const Rx = [1, 0, 0, 0, Math.cos(x), -Math.sin(x), 0, Math.sin(x), Math.cos(x)];
  const Ry = [Math.cos(y), 0, Math.sin(y), 0, 1, 0, -Math.sin(y), 0, Math.cos(y)];
  const Rz = [Math.cos(z), -Math.sin(z), 0, Math.sin(z), Math.cos(z), 0, 0, 0, 1];
  return matMul(Rz, matMul(Ry, Rx));
}
// rotation about a unit axis k by angle a (Rodrigues), row-major
function axisAngle(k, a) {
  const [x, y, z] = nrm(k), c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
}
const AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1], '-x': [-1, 0, 0], '-y': [0, -1, 0], '-z': [0, 0, -1] };
const axisOf = a => (Array.isArray(a) ? nrm(a) : AXES[a] || null);
// a frame whose local axis `which` (y or z) points along dir; hint orients the cross-section
function frameAlong(dir, which = 'y', hint) {
  const d = nrm(dir);
  let h = hint ? nrm(hint) : (which === 'y' ? [0, 0, 1] : [0, 1, 0]);
  if (Math.abs(dot(h, d)) > 0.98) h = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const p = nrm(sub(h, mul(d, dot(h, d))));
  if (which === 'y') return fromCols(crs(d, p), d, p);         // y along, z toward the hint
  return fromCols(crs(p, d), p, d);                            // z along, y toward the hint
}

/* ------------------------------------------------------------------ colour */
const hexRgb = hex => { let h = String(hex).trim().replace(/^#/, ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const lin = c => hexRgb(c).map(v => Math.pow(v, 2.2));
const f = v => { const s = (Math.round(v * 1e5) / 1e5).toString(); return /[.e]/.test(s) ? s : s + '.0'; };
const v3 = a => `vec3(${f(a[0])}, ${f(a[1])}, ${f(a[2])})`;
// GLSL mat3 M with M * v = R^T v (object -> local): its columns are R's rows
const m3 = R => `mat3(${R.map(f).join(', ')})`;

/* ------------------------------------------------------------------ materials */
/*
  A part's mat: a name from spec.materials, a built-in name, or an object { kind, color, finish, ... }.
  kind: paint | metal | chrome | steel | rubber | plastic | wood | fabric | leather | light
  color: '#rrggbb' or 'accent' (the page's accent, as enamel carries it). finish: gloss | satin | matte.
*/
const BUILTIN = {
  accent:  { kind: 'paint', color: 'accent', finish: 'gloss' },
  paint:   { kind: 'paint', color: 'accent', finish: 'gloss' },
  white:   { kind: 'paint', color: '#e9e8e4', finish: 'satin' },
  black:   { kind: 'paint', color: '#1b1c1e', finish: 'satin' },
  graphite:{ kind: 'paint', color: '#3a3c40', finish: 'satin' },
  alloy:   { kind: 'metal', color: '#b8bbc0' },
  aluminium:{ kind: 'metal', color: '#c4c6ca' },
  chrome:  { kind: 'chrome' },
  steel:   { kind: 'steel' },
  rubber:  { kind: 'rubber' },
  plastic: { kind: 'plastic', color: '#26272a' },
  wood:    { kind: 'wood', color: '#b98a5c', grain: 'x' },
  oak:     { kind: 'wood', color: '#c29a6b', grain: 'x' },
  walnut:  { kind: 'wood', color: '#6e4a33', grain: 'x' },
  fabric:  { kind: 'fabric', color: '#5d5f63' },
  leather: { kind: 'leather', color: '#6b3f22' },
  light:   { kind: 'light' },
};
const FINISH = { gloss: [0.85, 80], satin: [0.5, 32], matte: [0.16, 9] };

function materialGlsl(m, onExpr) {
  const k = m.kind || 'paint';
  const acc = m.color === 'accent';
  const col = acc ? null : lin(m.color || ({ metal: '#b8bbc0', chrome: '#d9dadc', steel: '#8d9095', rubber: '#141414', plastic: '#26272a', wood: '#b98a5c', fabric: '#5d5f63', leather: '#6b3f22', light: '#fff4dc', paint: '#888888' }[k] || '#888888'));
  const [g, sh] = FINISH[m.finish] || ({ plastic: [0.42, 26], rubber: [0.2, 9], leather: [0.36, 16], fabric: [0.04, 5], wood: [0.3, 20] }[k] || FINISH.gloss);
  const lum = col ? 0.2126 * col[0] + 0.7152 * col[1] + 0.0722 * col[2] : 0.25;
  const pAlb = Math.min(0.95, Math.max(0.05, Math.sqrt(lum)));
  // the render
  let r = '', p = '';
  const C = acc ? '' : `s.col = ${v3(col)}; `;
  const A = acc ? 's.accent = 1.0; ' : '';
  switch (k) {
    case 'metal': r = `${C}${A}s.metal = 1.0; s.gloss = 0.8; s.shine = ${f(m.shine || 34)};`; p = `s.albedo = 0.78; s.gloss = 0.75; s.shine = 50.0;${A}`; break;
    case 'chrome': r = `${C}${A}s.metal = 1.0; s.gloss = 1.0; s.shine = 150.0;`; p = `s.albedo = 0.7; s.gloss = 1.0; s.shine = 90.0;${A}`; break;
    case 'steel': r = `${C}${A}s.metal = 0.85; s.gloss = 0.75; s.shine = 60.0;`; p = `s.albedo = u_dark > 0.5 ? 1.0 : 0.05; s.gloss = 0.0;${m.wire ? ' s.wire = 1.0;' : ''}`; break;
    case 'rubber': r = `${C}${A}s.gloss = ${f(g)}; s.shine = ${f(sh)};`; p = `s.albedo = 0.13; s.gloss = 0.15; s.shine = 12.0;${A}`; break;
    case 'wood': {
      const ax = { x: 'p.yz', y: 'p.xz', z: 'p.xy' }[m.grain || 'x'] || 'p.yz';
      const along = { x: 'p.x', y: 'p.y', z: 'p.z' }[m.grain || 'x'] || 'p.x';
      // rings across the grain, bent by a slow wave along it, and fine pores: an oiled board
      r = `{ vec2 gq = ${ax} * ${f(m.scale || 1)}; float ring = length(gq + vec2(0.37, -0.81)) * 46.0 + 1.6 * sin(${along} * 11.0 + gq.x * 7.0) + 0.6 * sin(${along} * 37.0);
        float band = 0.5 + 0.5 * sin(ring * 6.2832); float pore = hash1(floor(${along} * 900.0) + floor(gq.y * 260.0) * 57.0);
        s.col = ${v3(col)} * mix(0.84, 1.06, band * band) * mix(0.95, 1.03, pore); s.gloss = ${f(g)}; s.shine = ${f(sh)}; }`;
      p = `s.albedo = ${f(pAlb)}; s.gloss = 0.3; s.shine = 20.0; s.coord = length(${ax}) * 3.0;`; break;
    }
    case 'fabric':
      // a fine weave, faded out where it would be finer than a texel (no moire)
      r = `{ float wv = ${f(m.weave || 520)}; float fade = 1.0 - smoothstep(0.25, 0.6, u_pix * 3.0 * wv);
        float w = sin(p.x * wv) * sin((p.y + p.z) * wv); s.col = ${acc ? 'toLin(u_accent)' : v3(col)} * (1.0 + 0.12 * w * fade); s.gloss = ${f(g)}; s.shine = ${f(sh)}; }`;
      p = `s.albedo = ${f(pAlb)}; s.gloss = 0.03; s.shine = 6.0;${A}`; break;
    case 'leather': r = `${C}${A}s.gloss = ${f(g)}; s.shine = ${f(sh)};`; p = `s.albedo = ${f(pAlb)}; s.gloss = 0.3; s.shine = 16.0;${A}`; break;
    case 'plastic': r = `${C}${A}s.gloss = ${f(g)}; s.shine = ${f(sh)};`; p = `s.albedo = ${f(pAlb)}; s.gloss = 0.4; s.shine = 24.0;${A}`; break;
    case 'light': r = `s.col = ${v3(col)}; s.emit = ${onExpr}; s.gloss = 0.4; s.shine = 30.0;`; p = `s.albedo = 1.0; s.emit = ${onExpr}; s.gloss = 0.0;`; break;
    default: r = `${C}${A}s.gloss = ${f(g)}; s.shine = ${f(sh)};`; p = `s.albedo = ${f(acc ? 0.62 : pAlb)}; s.gloss = ${f(g * 0.9)}; s.shine = ${f(sh)};${A}`;
  }
  if (m.glow && k !== 'light') { r += ` s.emit = ${f(m.glow)} * ${onExpr};`; p += ` s.emit = ${f(m.glow * 0.6)} * ${onExpr};`; }
  return { render: r, print: p };
}

/* ------------------------------------------------------------------ GLSL library of the parts */
const LIB = /* glsl */ `
vec2 un(vec2 r, float d, float id) { return d < r.x ? vec2(d, id) : r; }
vec2 unb(vec2 r, float d, float id, float k) { return vec2(smin(r.x, d, k), d < r.x ? id : r.y); }
vec2 un2(vec2 r, vec2 d) { return d.x < r.x ? d : r; }
vec2 unb2(vec2 r, vec2 d, float k) { return vec2(smin(r.x, d.x, k), d.x < r.x ? d.y : r.y); }
// rotate v about the unit axis k by angle a
vec3 rotAx(vec3 v, vec3 k, float a) { float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c); }
float sdEll(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-6); }
// a cone frustum about y: radius r1 at y = -h, r2 at y = +h
float sdFrustum(vec3 p, float h, float r1, float r2) {
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h), k2 = vec2(r2 - r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, q.y < 0.0 ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
  float sg = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return sg * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
// a groove of half width gw and depth gd cut round the part at local height y0 (a panel line)
float seam(float d, float y, float y0, float gw, float gd) { return max(d, -max(abs(y - y0) - gw, -(d + gd))); }
// an arc about local z: radius R from angle a0 to a1, section half sizes hs (radial, axial), edge rr
float sdArc(vec3 q, float R, float a0, float a1, vec2 hs, float rr) {
  float am = 0.5 * (a0 + a1), ah = 0.5 * (a1 - a0);
  float da = mod(atan(q.y, q.x) - am + PI, 2.0 * PI) - PI;
  float ac = am + clamp(da, -ah, ah);
  vec2 dir = vec2(cos(ac), sin(ac));
  vec3 l = vec3(dot(q.xy, dir) - R, dot(q.xy, vec2(-dir.y, dir.x)), q.z);
  return sdRoundBox(l, vec3(hs.x, rr, hs.y), rr);
}
// a coil spring along local y: half length hl, coil radius R, pitch pt, wire radius r
float sdSpring(vec3 q, float hl, float R, float pt, float r) {
  float a = atan(q.z, q.x);
  float y0 = a / (2.0 * PI) * pt;
  float k = floor((q.y - y0) / pt + 0.5);
  float yh = clamp(y0 + k * pt, -hl, hl);
  return 0.8 * (length(vec2(length(q.xz) - R, q.y - yh)) - r);
}
`;
const LIB_WHEEL = /* glsl */ `
// one flange's spokes: n of them round the axle, the nearest evaluated, from the flange (radius fr,
// at z = fz) to the rim's bed (radius rb); off turns this flange's set by half a sector
float wSpokes(vec3 s, float n, float off, float fz, float fr, float rb, float sr) {
  float sec = 6.28318530718 / n;
  float a = atan(s.y, s.x) - off;
  float k = floor(a / sec + 0.5);
  vec2 l = rot2(-(k * sec + off)) * s.xy;
  return sdCapsule(vec3(l, s.z), vec3(fr, 0.0, fz), vec3(rb, 0.0, 0.0), sr);
}
// a wheel about local z: tyre (outer radius R, section width tw, height th), rim (depth rd, width rw),
// hub (radius hr, half length hh), n spokes (style 0) or a dished disc (1) or a solid face (2)
vec2 pWheel(vec3 q, float R, float tw, float th, float rd, float rw, float hr, float hh, float n, float sr0, float spin, float style,
            float idTread, float idWall, float idRim, float idSpoke, float idHub) {
  vec3 s = vec3(rot2(spin) * q.xy, q.z);
  float r = length(s.xy);
  float tc = R - 0.5 * th;
  vec2 tq = vec2(r - tc, s.z);
  float tyre = sdRect(tq, vec2(0.5 * th, 0.5 * tw), 0.48 * min(th, tw));
  float rb = R - th + 0.15 * th;                  // the rim's outer edge sits inside the tyre's bead
  float rim = sdRect(vec2(r - (rb - 0.5 * rd), s.z), vec2(0.5 * rd, 0.5 * rw), 0.25 * min(rd, rw));
  float hub = sdCyl(q.xzy, hr, hh, 0.2 * hr);
  float fl = sdCyl(vec3(q.x, abs(q.z) - 0.8 * hh, q.y), hr * 1.9, 0.08 * hh + 0.0015, 0.0015);
  hub = min(hub, fl);
  float axle = sdCyl(q.xzy, 0.32 * hr, hh * 1.45, 0.1 * hr);
  float sp = 1e9;
  float bed = rb - rd;
  if (style < 0.5) {
    float srr = max(sr0, 1.6 * u_pix);
    float sec = 6.28318530718 / (0.5 * n);
    sp = min(wSpokes(s, 0.5 * n, -0.25 * sec, 0.8 * hh, 1.75 * hr, bed + 0.3 * rd, srr), wSpokes(s, 0.5 * n, 0.25 * sec, -0.8 * hh, 1.75 * hr, bed + 0.3 * rd, srr));
  } else {
    float face = style < 1.5 ? 0.12 * rw + 0.35 * hh * (1.0 - r / max(bed, 1e-4)) : 0.42 * rw;
    sp = sdRect(vec2(r - 0.5 * bed, s.z), vec2(0.5 * bed + 0.002, face), 0.004);
  }
  vec2 res = vec2(tyre, abs(s.z) > 0.24 * tw && r < R - 0.22 * th ? idWall : idTread);
  if (rim < res.x) res = vec2(rim, idRim);
  if (sp < res.x) res = vec2(sp, idSpoke);
  if (hub < res.x) res = vec2(hub, idHub);
  if (axle < res.x) res = vec2(axle, idRim);
  return res;
}
`;
const LIB_BASKET = /* glsl */ `
// an open-top basket or crate of half size h: style 0 a wire mesh (pitch pt, wire wr), 1 slats (pt the
// pitch, wr the slat's half height), 2 solid walls; rims round the top and the foot
vec2 pBasket(vec3 q, vec3 h, float t, float pt, float wr, float rr, float style, float idW, float idR) {
  float box = sdRoundBox(q, h, rr);
  float shell = max(abs(box) - t, q.y - h.y);
  vec3 a = abs(q) / h;
  vec2 uv = a.x > a.z && a.x > a.y ? q.zy : (a.z > a.y ? q.xy : q.xz);
  vec2 g = abs(mod(uv + 0.5 * pt, pt) - 0.5 * pt);
  float wire = max(wr, 1.2 * u_pix);
  float mesh = style < 0.5 ? min(g.x, g.y) - wire : (style < 1.5 ? (a.y > a.x && a.y > a.z ? -1.0 : g.y - wr) : -1.0);
  float body = max(shell, mesh);
  float ring = sdRect(q.xz, h.xz, rr);
  float rim = min(length(vec2(ring, q.y - h.y)) - 1.9 * wire, length(vec2(ring, q.y + h.y)) - 1.5 * wire);
  // corner posts
  vec2 pc = h.xz - rr + 0.7071 * rr;
  rim = min(rim, max(length(abs(q.xz) - pc) - 1.3 * wire, abs(q.y) - h.y));
  return body < rim ? vec2(body, idW) : vec2(rim, idR);
}
`;
const LIB_SEAT = /* glsl */ `
// a seat, local x forward: style 0 a saddle (wide rear, narrow nose), 1 a cushion; s = length, height, width
float pSeat(vec3 q, vec3 s, float style) {
  if (style < 0.5) {
    float rear = sdEll(q - vec3(-0.17 * s.x, 0.0, 0.0), vec3(0.33 * s.x, 0.5 * s.y, 0.5 * s.z));
    float nose = sdEll(q - vec3(0.2 * s.x, 0.06 * s.y, 0.0), vec3(0.32 * s.x, 0.36 * s.y, 0.16 * s.z));
    float d = smin(rear, nose, 0.4 * s.y);
    return max(d, -q.y - 0.12 * s.y);
  }
  vec3 h = 0.5 * s;
  float d = sdRoundBox(q, h, min(0.48 * s.y, 0.3 * min(s.x, s.z)));
  return d - 0.04 * s.y * (1.0 - abs(q.x) / h.x) * (1.0 - abs(q.z) / h.z);
}
`;
const LIB_SHADE = /* glsl */ `
// a lamp shade about local y: closed at y = -hl (radius r1), open at y = +hl (radius r2), wall t, a
// rolled lip; the outer and the inner face take their own materials
// bu (0..1) bows the wall outward into a dome: the wall is the smooth profile r(y), its distance
// taken across the slope, so the shading runs smooth (no facets)
vec2 pShade(vec3 q, float hl, float r1, float r2, float t, float bu, float idO, float idI) {
  vec2 P = vec2(length(q.xz), q.y);
  float sv = clamp((q.y + hl) / (2.0 * hl), 0.0, 1.0);
  float rr = r1 + (r2 - r1) * (sv + bu * 1.3 * sv * (1.0 - sv));
  float dr = (r2 - r1) * (1.0 + bu * 1.3 * (1.0 - 2.0 * sv)) / (2.0 * hl);
  float dw = (P.x - rr) / sqrt(1.0 + dr * dr);
  float side = max(abs(dw) - t, abs(q.y) - hl);
  float top = sdSeg(P, vec2(0.0, -hl), vec2(r1, -hl)) - t;
  float d = min(side, top);
  float lip = length(P - vec2(r2, hl)) - 1.7 * t;
  d = min(d, lip);
  bool inner = dw < 0.0 && q.y > -hl + 0.5 * t && lip > 0.0;
  return vec2(0.9 * d, inner ? idI : idO);
}
`;

/* ------------------------------------------------------------------ parts */
/*
  Each part resolves to: a frame (R local -> object, c the centre), its local half extents (for the
  bounds), and GLSL that sets d (or a vec2 dm) from the local point q. All lengths are in the spec's
  units here; build() scales them at the end.
*/
function partFrame(p, natural = 'y') {
  if (p.from && p.to) {
    const d = sub(p.to, p.from), L = len(d);
    return { R: frameAlong(d, natural, p.up), c: mul(add(p.from, p.to), 0.5), L };
  }
  const ax = axisOf(p.axis);
  let R = ax ? frameAlong(ax, natural, p.up) : I3;
  if (p.rot) R = matMul(euler(p.rot), R);
  return { R, c: p.at || [0, 0, 0], L: null };
}

const PARTS = {
  // a round tube between two points (or at + axis + length); r, optional r2 (a taper), cap 'flat'|'round', round (edge)
  tube(p) {
    const fr = partFrame(p, 'y'), L = fr.L ?? p.length ?? 0.1, hl = L / 2, r = p.r ?? 0.01, r2 = p.r2 ?? r;
    const e = Math.min(p.round ?? Math.min(r, r2) * 0.3, Math.min(r, r2) * 0.95);
    let g;
    if (p.cap === 'round') g = r2 === r ? `sdCapsule(q, vec3(0.0, ${f(-hl)}, 0.0), vec3(0.0, ${f(hl)}, 0.0), ${f(r)})` : `sdFrustum(q, ${f(hl)}, ${f(r)}, ${f(r2)}) - 0.0`;
    else g = r2 === r ? `sdCyl(q, ${f(r)}, ${f(hl)}, ${f(e)})` : `sdFrustum(q, ${f(hl - e)}, ${f(r - e)}, ${f(r2 - e)}) - ${f(e)}`;
    return { ...fr, half: [Math.max(r, r2), hl + (p.cap === 'round' ? r : 0), Math.max(r, r2)], d: g, seamAxis: 'q.y', seamLen: hl };
  },
  // a beam of rectangular section between two points: w (local x) by d (local z, toward up), round
  beam(p) {
    const fr = partFrame(p, 'y'), L = fr.L ?? p.length ?? 0.1, hl = L / 2;
    const w = p.w ?? p.size?.[0] ?? 0.03, dd = p.d ?? p.size?.[1] ?? w, rr = Math.min(p.round ?? Math.min(w, dd) * 0.25, Math.min(w, dd) * 0.49);
    return { ...fr, half: [w / 2, hl, dd / 2], d: `sdRoundBox(q, ${v3([w / 2, hl, dd / 2])}, ${f(rr)})`, seamAxis: 'q.y', seamLen: hl };
  },
  // a box with rounded edges: size [x, y, z], round
  box(p) {
    const fr = partFrame(p, 'y'), s = p.size || [0.1, 0.1, 0.1], rr = Math.min(p.round ?? Math.min(...s) * 0.12, Math.min(...s) * 0.49);
    return { ...fr, half: mul(s, 0.5), d: `sdRoundBox(q, ${v3(mul(s, 0.5))}, ${f(rr)})`, seamAxis: 'q.y', seamLen: s[1] / 2 };
  },
  // a thin panel: a box whose thickness is size[1] by default (a lid, a plate, a screen's back)
  panel(p) { return PARTS.box({ round: Math.min(...(p.size || [0.1, 0.01, 0.1])) * 0.45, ...p }); },
  // a cylinder about its axis (default y): r, h (length), round
  cylinder(p) {
    const fr = partFrame(p, 'y'), h = fr.L ?? p.h ?? 0.05, r = p.r ?? 0.05, e = Math.min(p.round ?? Math.min(r, h / 2) * 0.15, Math.min(r, h / 2) * 0.95);
    return { ...fr, half: [r, h / 2, r], d: `sdCyl(q, ${f(r)}, ${f(h / 2)}, ${f(e)})`, seamAxis: 'q.y', seamLen: h / 2 };
  },
  disc(p) { return PARTS.cylinder(p); },
  sphere(p) { const fr = partFrame(p), r = p.r ?? 0.03; return { ...fr, half: [r, r, r], d: `length(q) - ${f(r)}` }; },
  ellipsoid(p) { const fr = partFrame(p), s = mul(p.size || [0.1, 0.06, 0.1], 0.5); return { ...fr, half: s, d: `sdEll(q, ${v3(s)})` }; },
  // a ring about its axis (default y): R the ring's radius, r the section's
  torus(p) { const fr = partFrame(p, 'y'), R = p.R ?? 0.05, r = p.r ?? 0.008; return { ...fr, half: [R + r, r, R + r], d: `length(vec2(length(q.xz) - ${f(R)}, q.y)) - ${f(r)}` }; },
  // a hinge: a knuckle about its axis (default z) with a cap on both faces in capMat (default alloy)
  joint(p) {
    const fr = partFrame({ axis: 'z', ...p }, 'y'), r = p.r ?? 0.03, w = fr.L ?? p.w ?? r * 1.4, e = Math.min(r, w / 2) * 0.22;
    const ids = p._ids;
    return { ...fr, half: [r, w / 2 + r * 0.12, r], dm: `vec2 dm = un(vec2(sdCyl(q, ${f(r)}, ${f(w / 2)}, ${f(e)}), ${ids[0]}), sdCyl(q, ${f(r * 0.5)}, ${f(w / 2 + r * 0.1)}, ${f(r * 0.08)}), ${ids[1]});` };
  },
  // a wheel about its axle (axis, default z): r (outer), tyre [width, height], rim [depth, width],
  // hub [radius, length], spokes (count, 0 for a disc), spokeR, style 'spoked'|'disc'|'solid', spin (deg/s)
  wheel(p) {
    const fr = partFrame({ axis: 'z', ...p }, 'z'), R = p.r ?? 0.35;
    const tw = p.tyre?.[0] ?? R * 0.11, th = p.tyre?.[1] ?? R * 0.1;
    const rd = p.rim?.[0] ?? R * 0.07, rw = p.rim?.[1] ?? tw * 0.6;
    const hr = p.hub?.[0] ?? R * 0.055, hh = (p.hub?.[1] ?? R * 0.28) / 2;
    const style = { spoked: 0, disc: 1, solid: 2 }[p.style || (p.spokes === 0 ? 'disc' : 'spoked')] ?? 0;
    const n = Math.max(4, Math.round((p.spokes ?? 32) / 2) * 2), sr = p.spokeR ?? R * 0.0055;
    const ids = p._ids;
    const spin = p.spin ? `u_time * ${f(-p.spin * DEG)}` : '0.0';
    return { ...fr, half: [R, R, Math.max(tw / 2, hh * 1.45)], wheel: true,
      dm: `vec2 dm = pWheel(q, ${f(R)}, ${f(tw)}, ${f(th)}, ${f(rd)}, ${f(rw)}, ${f(hr)}, ${f(hh)}, ${f(n)}, ${f(sr)}, ${spin}, ${f(style)}, ${ids.join(', ')});`,
      scaleArgs: true };
  },
  // a lamp shade or a bell from its closed end (from, radius r1) to its open end (to, radius r2), wall t,
  // bulge 0..1 (0 a cone, 1 a dome)
  shade(p) {
    const fr = partFrame(p, 'y'), L = fr.L ?? p.h ?? 0.12, hl = L / 2, r1 = p.r1 ?? 0.03, r2 = p.r2 ?? 0.08, t = p.t ?? 0.0025;
    return { ...fr, half: [r2 + t * 2, hl + t * 2, r2 + t * 2], dm: `vec2 dm = pShade(q, ${f(hl)}, ${f(r1)}, ${f(r2)}, ${f(t)}, ${f(Math.max(0, Math.min(1, p.bulge ?? 0)))}, ${p._ids.join(', ')});` };
  },
  // a seat: size [length, height, width], style 'saddle'|'cushion', local x forward (rot turns it)
  seat(p) {
    const fr = partFrame(p, 'y'), s = p.size || [0.27, 0.07, 0.16], st = p.style === 'cushion' ? 1 : 0;
    return { ...fr, half: [s[0] / 2, s[1] / 2, s[2] / 2], d: `pSeat(q, ${v3(s)}, ${f(st)})` };
  },
  // an open-top basket or crate: size [x, y, z], style 'wire'|'slats'|'solid', pitch, wire (radius), rimMat
  basket(p) {
    const fr = partFrame(p, 'y'), s = p.size || [0.3, 0.2, 0.3], h = mul(s, 0.5);
    const st = { wire: 0, slats: 1, solid: 2 }[p.style || 'wire'] ?? 0;
    const pt = p.pitch ?? Math.min(...s) / 7, wr = p.wire ?? (st === 1 ? pt * 0.32 : Math.min(...s) * 0.012), t = st === 0 ? wr : (p.t ?? Math.min(...s) * 0.03);
    const rr = p.round ?? Math.min(...s) * 0.06;
    return { ...fr, half: [h[0] + wr * 2, h[1] + wr * 2, h[2] + wr * 2], dm: `vec2 dm = pBasket(q, ${v3(h)}, ${f(t)}, ${f(pt)}, ${f(wr)}, ${f(rr)}, ${f(st)}, ${p._ids.join(', ')});` };
  },
  // an arc about its axis (default z), in the plane round it: R, from angle a0 to a1 (degrees, from local
  // x toward local y), section r (round) or size [radial, axial], round
  arc(p) {
    const fr = partFrame({ axis: 'z', ...p }, 'z'), R = p.R ?? 0.3;
    const hs = p.size ? [p.size[0] / 2, p.size[1] / 2] : [p.r ?? 0.006, p.r ?? 0.006];
    const rr = Math.min(p.round ?? Math.min(...hs) * 0.9, Math.min(...hs) * 0.98);
    const a0 = (p.a0 ?? 0) * DEG, a1 = (p.a1 ?? 90) * DEG;
    return { ...fr, half: [R + hs[0], R + hs[0], hs[1]], d: `sdArc(q, ${f(R)}, ${f(a0)}, ${f(a1)}, vec2(${f(hs[0])}, ${f(hs[1])}), ${f(rr)})` };
  },
  // a coil spring between two points: R (coil radius), r (wire), turns
  spring(p) {
    const fr = partFrame(p, 'y'), L = fr.L ?? p.length ?? 0.08, hl = L / 2, R = p.R ?? 0.01, r = p.r ?? 0.0018, n = p.turns ?? 10;
    return { ...fr, half: [R + r, hl + r, R + r], d: `sdSpring(q, ${f(hl)}, ${f(R)}, ${f(L / n)}, ${f(r)})` };
  },
  // a bent tube through points (handlebars, a cable, a frame's curved tube): r; smooth (default on with
  // three points or more) runs a Catmull-Rom curve through the points, so bends are round, not knees
  path(p) {
    const pts = (p.points || []).map(q => q.slice());
    const n = p.smooth === false || pts.length < 3 ? 1 : Math.max(2, Math.min(10, typeof p.smooth === 'number' ? p.smooth : 6));
    return { R: I3, c: [0, 0, 0], path: n > 1 ? catmull(pts, n) : pts, r: p.r ?? 0.01 };
  },
};

// a Catmull-Rom curve through the points, n segments between each pair (the ends held)
function catmull(P, n) {
  const out = [P[0]];
  for (let i = 0; i + 1 < P.length; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 1; k <= n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  return out;
}

/* ------------------------------------------------------------------ the build */
const knownKind = new Set(Object.keys(PARTS));

/** problems with a spec, as plain lines (empty when it builds) */
export function checkSpec(spec) {
  const out = [];
  if (!spec || typeof spec !== 'object') return ['the spec is not an object'];
  if (!Array.isArray(spec.parts) || !spec.parts.length) out.push('parts: a non-empty list is needed');
  const groups = new Set((spec.motion || []).map(g => g.id));
  (spec.parts || []).forEach((p, i) => {
    const at = `parts[${i}]${p.name ? ` (${p.name})` : ''}`;
    if (!knownKind.has(p.type)) out.push(`${at}: unknown type "${p.type}" (one of ${[...knownKind].join(', ')})`);
    if (p.type === 'path' && (!Array.isArray(p.points) || p.points.length < 2)) out.push(`${at}: a path needs two points or more`);
    if (p.in && !groups.has(p.in)) out.push(`${at}: in "${p.in}" names no motion group`);
    const mat = p.mat;
    if (typeof mat === 'string' && !(spec.materials || {})[mat] && !BUILTIN[mat]) out.push(`${at}: unknown material "${mat}"`);
  });
  if ((spec.parts || []).length > 90) out.push(`parts: ${spec.parts.length} parts; keep a product under about 90 (each one is evaluated per ray step)`);
  return out;
}

/**
  build(spec, { base }) -> a print object (definePrint), ready to mount.
  base: the URL the spec came from (posters are found beside it).
*/
export function build(spec, { base } = {}) {
  const problems = checkSpec(spec);
  if (problems.length) throw new Error(`product-render: ${spec?.id || 'spec'}:\n  ${problems.join('\n  ')}`);
  /* materials: one id per distinct material (wheels, joints, shades and baskets take several) */
  const mats = [], matKey = new Map();
  const matId = m => {
    const def = typeof m === 'string' ? (spec.materials?.[m] || BUILTIN[m]) : m;
    const resolved = typeof def === 'string' ? BUILTIN[def] : def || BUILTIN.graphite;
    const key = JSON.stringify(resolved);
    if (!matKey.has(key)) { mats.push(resolved); matKey.set(key, mats.length); }
    return f(matKey.get(key));
  };
  const parts = spec.parts.map(p0 => {
    const p = { ...p0 };
    if (p.type === 'wheel') {
      const wall = p.wall ? { kind: 'rubber', color: p.wall, finish: 'satin' } : p.mat || 'rubber';
      p._ids = [matId(p.mat || 'rubber'), matId(wall), matId(p.rimMat || 'alloy'), matId(p.spokeMat || { kind: 'steel', wire: true }), matId(p.hubMat || 'alloy')];
    } else if (p.type === 'joint') p._ids = [matId(p.mat || 'graphite'), matId(p.capMat || 'alloy')];
    else if (p.type === 'shade') p._ids = [matId(p.mat || 'accent'), matId(p.innerMat || 'white')];
    else if (p.type === 'basket') p._ids = [matId(p.mat || 'black'), matId(p.rimMat || p.mat || 'black')];
    else p._id = matId(p.mat || 'graphite');
    return { spec: p, ...PARTS[p.type](p) };
  });

  /* motion groups: each turns about its pivot and axis, after its parent (rest pose = object space) */
  const groups = (spec.motion || []).map(g => ({ ...g, axisV: axisOf(g.axis || 'z') || [0, 0, 1] }));
  const gi = new Map(groups.map((g, i) => [g.id, i]));
  const chain = id => { const c = []; let g = id != null ? groups[gi.get(id)] : null; while (g) { c.unshift(g); g = g.parent ? groups[gi.get(g.parent)] : null; } return c; };

  /* bounds: every part's local box, through its group's turns at the ends of their swings */
  const corners = (pt) => {
    if (pt.path) return pt.path.flatMap(q => [add(q, [pt.r, pt.r, pt.r]), sub(q, [pt.r, pt.r, pt.r])]);
    const h = pt.half, out = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) out.push(add(pt.c, matVec(pt.R, [h[0] * sx, h[1] * sy, h[2] * sz])));
    return out;
  };
  const poses = (c) => {
    // every combination of each group's swing ends and rest (at most 3^n, n <= 4)
    let list = [[]];
    for (const g of c) {
      const amps = g.amp ? [-(g.amp), 0, g.amp].map(a => (a + (g.rest || 0)) * DEG) : [(g.rest || 0) * DEG];
      list = list.flatMap(l => amps.map(a => [...l, a]));
    }
    return list;
  };
  const posed = (pt0, c, angles) => {
    // a point in a group's local (rest) frame to object space: undo the chain from the innermost group out
    return pt0.map(v => { let w = v; for (let i = c.length - 1; i >= 0; i--) { const g = c[i]; w = add(g.pivot, matVec(axisAngle(g.axisV, angles[i]), sub(w, g.pivot))); } return w; });
  };
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const restLo = [Infinity, Infinity, Infinity], restHi = [-Infinity, -Infinity, -Infinity];
  for (const pt of parts) {
    const c = chain(pt.spec.in), cs = corners(pt);
    for (const ang of poses(c)) for (const v of posed(cs, c, ang)) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], v[k]); hi[k] = Math.max(hi[k], v[k]); }
    for (const v of posed(cs, c, c.map(g => (g.rest || 0) * DEG))) for (let k = 0; k < 3; k++) { restLo[k] = Math.min(restLo[k], v[k]); restHi[k] = Math.max(restHi[k], v[k]); }
  }
  // object space: the floor at the lowest point at rest, centred over the floor plan, the largest side 1 unit
  const cx = (restLo[0] + restHi[0]) / 2, cz = (restLo[2] + restHi[2]) / 2, y0 = restLo[1];
  const S = 1 / Math.max(restHi[0] - restLo[0], restHi[1] - restLo[1], restHi[2] - restLo[2]);
  const P = v => [(v[0] - cx) * S, (v[1] - y0) * S, (v[2] - cz) * S];
  // the radius about the turn's axis and the height, over every pose
  let rxz = 0;
  for (const pt of parts) {
    const c = chain(pt.spec.in), cs = corners(pt);
    for (const ang of poses(c)) for (const v of posed(cs, c, ang)) { const q = P(v); rxz = Math.max(rxz, Math.hypot(q[0], q[2])); }
  }
  const height = (hi[1] - y0) * S;

  /* GLSL: the groups' points, then each part (skipped when its bounding sphere is further than the best so far) */
  const on = spec.click === 'light' ? 'u_step' : '1.0';
  let code = 'vec2 map(vec3 p) {\n  vec2 res = vec2(1e9, 0.0);\n';
  groups.forEach((g, i) => {
    const parent = g.parent ? `g${gi.get(g.parent)}` : 'p';
    const per = g.period || 10, ph = (g.phase || 0) * 2 * Math.PI;
    const ang = `-(${f((g.rest || 0) * DEG)} + ${f((g.amp || 0) * DEG)} * sin(u_time * ${f((2 * Math.PI) / per)} + ${f(ph)}))`;
    code += `  vec3 g${i} = rotAx(${parent} - ${v3(P(g.pivot))}, ${v3(g.axisV)}, ${ang}) + ${v3(P(g.pivot))};\n`;
  });
  const useLib = { wheel: false, basket: false, seat: false, shade: false };
  for (const pt of parts) {
    const sp = pt.spec, G = sp.in != null ? `g${gi.get(sp.in)}` : 'p';
    const blend = sp.blend ? sp.blend * S : 0;
    if (sp.type in useLib) useLib[sp.type] = true;
    if (pt.path) {
      const pts = pt.path.map(P), r = pt.r * S;
      // one bounding sphere round the whole path, then its capsules
      const lo3 = [0, 1, 2].map(j => Math.min(...pts.map(q => q[j]))), hi3 = [0, 1, 2].map(j => Math.max(...pts.map(q => q[j])));
      const pc = mul(add(lo3, hi3), 0.5), pr = len(sub(hi3, lo3)) / 2 + r + blend + 1e-3;
      let d = '';
      for (let i = 0; i + 1 < pts.length; i++) {
        const seg = `sdCapsule(${G}, ${v3(pts[i])}, ${v3(pts[i + 1])}, ${f(r)})`;
        d += i ? ` d = min(d, ${seg});` : `float d = ${seg};`;
      }
      code += `  if (length(${G} - ${v3(pc)}) - ${f(pr)} < res.x) { ${d} res = ${blend ? `unb(res, d, ${sp._id}, ${f(blend)})` : `un(res, d, ${sp._id})`}; }\n`;
      continue;
    }
    // the part's GLSL in object units: scale every length in it by S (build the part again from a scaled spec)
    const scaled = scaleSpec(sp, S, P);
    const ptS = PARTS[sp.type](scaled);
    const c = P(pt.c);
    const br = len(ptS.half) + blend + 1e-3;
    let body;
    if (ptS.dm) body = `${ptS.dm} ${blend ? `res = unb2(res, dm, ${f(blend)});` : 'res = un2(res, dm);'}`;
    else {
      let d = ptS.d;
      if (sp.seams && ptS.seamAxis) for (const s of [].concat(sp.seams)) d = `seam(${d}, ${ptS.seamAxis}, ${f(s * ptS.seamLen)}, ${f((sp.seamWidth ?? 0.0015) * S)}, ${f((sp.seamDepth ?? 0.002) * S)})`;
      body = `float d = ${d}; res = ${blend ? `unb(res, d, ${sp._id}, ${f(blend)})` : `un(res, d, ${sp._id})`};`;
    }
    code += `  if (length(${G} - ${v3(c)}) - ${f(br)} < res.x) { vec3 q = ${m3(pt.R)} * (${G} - ${v3(c)}); ${body} }\n`;
  }
  code += '  return res;\n}\n';

  let surf = 'void surf(float id, vec3 p, vec3 n, inout Surf s) {\n';
  mats.forEach((m, i) => {
    const g = materialGlsl(m, on);
    surf += `  ${i ? 'else ' : ''}if (id < ${f(i + 1.5)}) { if (u_render > 0.5) { ${g.render} } else { ${g.print} } }\n`;
  });
  surf += '}\n';

  // light the product throws on the floor (a lamp): spec.pool { at, r } in the spec's units
  let floor = '';
  if (spec.pool) {
    const pc = P(spec.pool.at), pr = (spec.pool.r || 0.2) * S;
    floor = `#define FLOOR_EMIT\nfloat floorEmit(vec3 wp) { vec3 lp = u_rot * (wp - u_pivot) + u_pivot; vec2 d = lp.xz - ${`vec2(${f(pc[0])}, ${f(pc[2])})`}; return ${on} * 0.85 * exp(-dot(d, d) / ${f(pr * pr)}); }\n`;
  }
  const glsl = LIB + (useLib.wheel ? LIB_WHEEL : '') + (useLib.basket ? LIB_BASKET : '') + (useLib.seat ? LIB_SEAT : '') + (useLib.shade ? LIB_SHADE : '') + floor + code + surf;

  /* framing: the turn's radius as the half width, the height (and the top seen from above) as the height */
  const cam = { elev: spec.camera?.elev ?? 12, dist: spec.camera?.dist ?? 6 };
  const e = cam.elev * DEG;
  const exW = (spec.turn?.mode === 'still' ? Math.max(Math.abs((restHi[0] - cx) * S), Math.abs((restLo[0] - cx) * S)) : rxz) * 1.02;
  const exH = (height / 2) * Math.cos(e) + rxz * Math.sin(e) * 0.85;
  const pivot = [0, height / 2, 0];
  const radius = Math.hypot(rxz, height / 2);
  const turn = spec.turn?.mode === 'spin' ? { mode: 'spin', speed: spec.turn.speed ?? 10 }
    : { mode: 'sway', amp: spec.turn?.amp ?? 26, period: spec.turn?.period ?? 22 };
  const name = spec.name || spec.id || 'Product';
  const posterName = spec.poster || spec.id || 'product';
  const def = {
    id: spec.id || 'product',
    name,
    label: spec.label || name,
    press: spec.click === 'light' ? 'Press to switch it on or off.' : undefined,
    base: base || (HAS_DOM ? location.href : 'file:///'),
    glsl,
    pivot,
    radius,
    bound: radius * 1.04,
    extent: [exW, exH],
    foot: rxz,
    camera: { ...cam, target: height / 2 },
    turn,
    step: 'toggle',
    stepTime: 0.6,
    light: spec.light || [-0.42, 1.3, 0.72],
    steps: spec.steps || 190,
    shadowSteps: 56,
    exposure: spec.exposure || 1,
    floorReach: 0.09,
    params: {
      effect: { default: 'render' },
      angle: { default: spec.angle ?? -32 },
      size: { default: 0.82 },
      step: { default: spec.click === 'light' ? 1 : 0 },
    },
    place: {
      // a product hero: right of the text; in a phone-shaped frame under the text, as wide as it can be
      // (a wide product is drawn smaller, so it stays inside the right part of a landscape frame)
      hero: { transparent: 1, size: Math.min(0.9, Math.max(0.6, 1 / (exW / exH))), x: 0.19, y: -0.06, narrow: { size: 0.98, x: 0, y: -0.02 } },
      // centred on its own stage (a full-bleed product section, as a robot maker's hero)
      stage: { transparent: 1, size: 0.78, x: 0, y: -0.1, narrow: { size: 0.98, x: 0, y: -0.02 } },
      tile: { transparent: 1, size: 0.86, y: -0.04 },
      card: { transparent: 1, size: 1.2, x: -0.22, y: -0.18, narrow: { size: 1.0, x: -0.15, y: -0.14 } },
    },
    // the posters beside the spec: <poster>.fallback-render.png / .fallback-render-dark.png (a print: .fallback.png / .fallback-dark.png); print3d reads "fallback-render" in the name as a render poster
    poster: (palette, dark, render) => `./${posterName}.fallback${render ? '-render' : ''}${dark ? '-dark' : ''}.png`,
    posterPrint: 'halftone',
  };
  const obj = definePrint(def);
  obj.spec = spec;
  obj.problems = () => glslProblems(obj.source().form);
  // mount: a phone or a coarse pointer shows one still frame (turn 0) unless the page asks for the turn;
  // only one product render a page turns (the first mounted); the others hold still until touched
  const mount0 = obj.mount.bind(obj);
  obj.mount = (el, opts = {}) => {
    const given = { ...(opts.params || {}) };
    const phone = HAS_DOM && (matchMedia('(max-width: 700px)').matches || matchMedia('(pointer: coarse)').matches);
    if (given.turn == null && (phone || turning.size)) given.turn = 0;
    if (spec.turn?.mode === 'still' && given.turn == null) given.turn = 0;
    const ctrl = mount0(el, { ...opts, params: given });
    if (ctrl.params.turn > 0) { turning.add(ctrl); const d = ctrl.destroy; ctrl.destroy = () => { turning.delete(ctrl); d(); }; }
    return ctrl;
  };
  return obj;
}
const turning = new Set();

// a part spec with every length scaled by S and every position mapped by P (positions: at, from, to;
// lengths: everything else that is a size); the rotation and the angles stay
const LENGTH_KEYS = ['r', 'r2', 'R', 'r1', 'h', 'w', 'd', 't', 'length', 'round', 'pitch', 'wire', 'spokeR', 'blend'];
const LENGTH_ARRAYS = ['size', 'tyre', 'rim', 'hub'];
function scaleSpec(p, S, P) {
  const o = { ...p };
  for (const k of ['at', 'from', 'to']) if (o[k]) o[k] = P(o[k]);
  for (const k of LENGTH_KEYS) if (typeof o[k] === 'number') o[k] = o[k] * S;
  for (const k of LENGTH_ARRAYS) if (Array.isArray(o[k])) o[k] = o[k].map(v => v * S);
  return o;
}

/** fetch a spec (a URL relative to the page) and build it */
export async function loadProduct(url) {
  const href = new URL(url, HAS_DOM ? document.baseURI : 'file:///').href;
  const res = await fetch(href);
  if (!res.ok) throw new Error(`product-render: no spec at ${href}`);
  return build(await res.json(), { base: href });
}

export default { build, loadProduct, checkSpec, PARTS: Object.keys(PARTS), MATERIALS: Object.keys(BUILTIN) };
