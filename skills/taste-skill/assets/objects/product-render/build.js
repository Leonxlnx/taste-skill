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
import { definePrint, glslProblems, readPalette, normalizePalette } from '../_print-core/print3d.js';

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

function materialGlsl(m, onExpr, P, S) {
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
  // lit: the pool of a lamp's light on this surface (a desk under the lamp): { at: [x, z] or [x, y, z], r, k }
  if (m.lit && P) {
    const a = m.lit.at || [0, 0], c = P(a.length === 2 ? [a[0], 0, a[1]] : a), rr = (m.lit.r || 0.18) * S, kk = m.lit.k ?? 0.9;
    const g = `exp(-dot(p.xz - vec2(${f(c[0])}, ${f(c[2])}), p.xz - vec2(${f(c[0])}, ${f(c[2])})) / ${f(rr * rr)}) * ${onExpr} * smoothstep(0.3, 0.8, n.y)`;
    r += ` { float lg = ${g}; if (s.col.x >= 0.0) s.col *= 1.0 + ${f(kk)} * lg * vec3(1.0, 0.88, 0.7); s.emit += ${f(kk * 0.12)} * lg; }`;   // a warm pool
    p += ` { float lg = ${g}; s.emit += ${f(kk * 0.3)} * lg; }`;
  }
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
  // open on top: the walls stop below the box's top face and its rounding (else a lid of thickness t stays)
  float top = h.y - max(2.0 * t, rr);
  float shell = max(abs(box) - t, q.y - top);
  vec3 a = abs(q) / h;
  vec2 uv = a.x > a.z && a.x > a.y ? q.zy : (a.z > a.y ? q.xy : q.xz);
  vec2 g = abs(mod(uv + 0.5 * pt, pt) - 0.5 * pt);
  float wire = max(wr, 1.2 * u_pix);
  float mesh = style < 0.5 ? min(g.x, g.y) - wire : (style < 1.5 ? (a.y > a.x && a.y > a.z ? -1.0 : g.y - wr) : -1.0);
  float body = max(shell, mesh);
  float ring = sdRect(q.xz, h.xz, rr);
  float rim = min(length(vec2(ring, q.y - top)) - 1.9 * wire, length(vec2(ring, q.y + h.y)) - 1.5 * wire);
  // corner posts
  vec2 pc = h.xz - rr + 0.7071 * rr;
  rim = min(rim, max(length(abs(q.xz) - pc) - 1.3 * wire, max(q.y - top, -q.y - h.y)));
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
  if (p._pre) R = matMul(p._pre, R);   // a prop's own turn, after the part's
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

/* ------------------------------------------------------------------ points on a part's surface */
/*
  The framing of a view measures the product as the camera sees it: points round each part's real
  outline (rings round a tube, a wheel's tyre, a shade's profile; a box's corners), not its bounding
  box, so a wheel or a round base is framed by its edge and not by the square round it.
*/
const RING = 20;
function localSamples(pt) {
  const sp = pt.spec, h = pt.half, out = [];
  const ringY = (r, y) => { for (let i = 0; i < RING; i++) { const a = (i / RING) * 2 * Math.PI; out.push([r * Math.cos(a), y, r * Math.sin(a)]); } };
  const ringZ = (r, z) => { for (let i = 0; i < RING; i++) { const a = (i / RING) * 2 * Math.PI; out.push([r * Math.cos(a), r * Math.sin(a), z]); } };
  switch (sp.type) {
    case 'tube': {
      const r = sp.r ?? 0.01, r2 = sp.r2 ?? r, rc = sp.cap === 'round' ? r : 0, hl = h[1] - rc;
      ringY(r, -hl); ringY(r2, hl); if (rc) out.push([0, -hl - r, 0], [0, hl + r, 0]);
      break;
    }
    case 'cylinder': case 'disc': case 'joint': case 'spring': ringY(h[0], -h[1]); ringY(h[0], h[1]); break;
    case 'torus': ringY(h[0], 0); ringY(h[0] - h[1], h[1]); ringY(h[0] - h[1], -h[1]); break;
    case 'shade': {
      const r1 = sp.r1 ?? 0.03, r2 = sp.r2 ?? 0.08, bu = Math.max(0, Math.min(1, sp.bulge ?? 0)), t = sp.t ?? 0.0025, hl = h[1] - 2 * t;
      for (let k = 0; k <= 6; k++) { const sv = k / 6; ringY(r1 + (r2 - r1) * (sv + bu * 1.3 * sv * (1 - sv)) + t, -hl + sv * 2 * hl); }
      break;
    }
    case 'wheel': ringZ(h[0], -h[2]); ringZ(h[0], h[2]); break;
    case 'sphere': case 'ellipsoid': case 'seat':
      for (let i = 0; i < RING; i++) { const a = (i / RING) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a); out.push([h[0] * c, h[1] * s, 0], [h[0] * c, 0, h[2] * s], [0, h[1] * c, h[2] * s]); }
      break;
    case 'arc': {
      const R = sp.R ?? 0.3, hs = sp.size ? [sp.size[0] / 2, sp.size[1] / 2] : [sp.r ?? 0.006, sp.r ?? 0.006];
      const a0 = (sp.a0 ?? 0) * DEG, a1 = (sp.a1 ?? 90) * DEG;
      for (let k = 0; k <= 16; k++) { const a = a0 + ((a1 - a0) * k) / 16; for (const rr of [R - hs[0], R + hs[0]]) for (const z of [-hs[1], hs[1]]) out.push([rr * Math.cos(a), rr * Math.sin(a), z]); }
      break;
    }
    default: for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) out.push([h[0] * sx, h[1] * sy, h[2] * sz]);
  }
  return out;
}
function partSamples(pt) {
  if (pt.path) { const r = pt.r; return pt.path.flatMap(q => [[r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]].map(d => add(q, d))); }
  return localSamples(pt).map(v => add(pt.c, matVec(pt.R, v)));
}
// a part named n, or with a trailing * every part whose name begins so ("saddle*" takes "saddle spring R")
const nameMatch = (name, n) => !!name && (n.endsWith('*') ? name.startsWith(n.slice(0, -1)) : name === n);

/* ------------------------------------------------------------------ props: what a product carries or works with */
/*
  A scene shows the product loaded or in use: a child seat with its belts on a bicycle's rack, a
  crate of fruit, a pannier bag, a desk with a book and a mug under a lamp, a parcel in a gripper.
  Each prop is composed of ordinary parts, at the size of the real thing, standing on its own base
  (y = 0) and facing x. In a scene: { "prop": "crate", "at": [x, y, z], "yaw": 90, "scale": 1,
  "size": [...], "color": "#hex", "mats": { role: material }, "in": "group", "name": "front crate" }.
  Units are metres (scale converts: 1000 for a spec in millimetres).
*/
const M = {
  oak: { kind: 'wood', color: '#c9a273', grain: 'x' },
  card: { kind: 'paint', color: '#b98c5a', finish: 'matte' },
  tape: { kind: 'plastic', color: '#d3b98c', finish: 'satin' },
  paper: { kind: 'paint', color: '#f3f1ea', finish: 'matte' },
  webbing: { kind: 'fabric', color: '#1e1f21', weave: 900 },
  ceramic: { kind: 'paint', color: '#ebe8e1', finish: 'gloss' },
};
const role = (p, k, d) => (p.mats && p.mats[k]) || d;
const PROPS = {
  // a slatted wooden crate, open on top; contents: 'fruit' | 'bottles' | 'loaves' | 'parcels' | 'none'
  crate(p) {
    const s = p.size || [0.4, 0.25, 0.3], wood = role(p, 'wood', p.color ? { ...M.oak, color: p.color } : M.oak);
    const out = [{ name: 'body', type: 'basket', at: [0, s[1] / 2, 0], size: s, style: 'slats', pitch: s[1] / 4, wire: (s[1] / 4) * 0.36, t: 0.011, round: 0.008, mat: wood, rimMat: wood }];
    const c = p.contents || 'fruit';
    if (c === 'fruit') {
      const cols = ['#d9822b', '#b8342a', '#e3b33b', '#d9822b', '#7d9f3a', '#b8342a'], r = Math.min(s[0], s[2]) * 0.16;
      for (let i = 0; i < 6; i++) { const ix = i % 3, iz = (i / 3) | 0; out.push({ name: 'fruit', type: 'sphere', at: [(ix - 1) * s[0] * 0.28, s[1] - r * 0.55 + (i % 2) * r * 0.25, (iz - 0.5) * s[2] * 0.42], r, mat: { kind: 'plastic', color: cols[i], finish: 'satin' } }); }
    } else if (c === 'bottles') {
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * s[0] * 0.28, glass = { kind: 'plastic', color: ['#2e5b3a', '#6b3a1f', '#2e5b3a'][i], finish: 'gloss' };
        out.push({ name: 'bottle', type: 'cylinder', at: [x, s[1] * 0.75, 0], r: Math.min(s[0], s[2]) * 0.13, h: s[1] * 1.1, round: 0.012, mat: glass });
        out.push({ name: 'bottle neck', type: 'tube', from: [x, s[1] * 1.28, 0], to: [x, s[1] * 1.62, 0], r: 0.013, mat: glass });
      }
    } else if (c === 'loaves') {
      for (let i = 0; i < 2; i++) out.push({ name: 'loaf', type: 'ellipsoid', at: [(i - 0.5) * s[0] * 0.42, s[1] * 0.92, 0], size: [s[0] * 0.4, s[1] * 0.5, s[2] * 0.6], mat: { kind: 'paint', color: '#b9773b', finish: 'satin' } });
    } else if (c === 'parcels') {
      out.push({ name: 'parcel', type: 'box', at: [-s[0] * 0.12, s[1] * 0.85, 0], size: [s[0] * 0.55, s[1] * 0.6, s[2] * 0.7], round: 0.005, mat: M.card });
    }
    return out;
  },
  // a cloth bag: style 'pannier' (a flap, two straps, a handle; hooks: true hangs it on a rack) or 'tote'
  bag(p) {
    const s = p.size || [0.32, 0.34, 0.13], cloth = role(p, 'cloth', { kind: 'fabric', color: p.color || '#3e4a40', weave: 640 });
    const trim = role(p, 'trim', { kind: 'leather', color: '#5b3a22' });
    if (p.style === 'tote') return [
      { name: 'body', type: 'box', at: [0, s[1] / 2, 0], size: s, round: 0.03, mat: cloth },
      { name: 'handle', type: 'arc', at: [0, s[1], s[2] * 0.3], axis: 'z', R: s[0] * 0.24, a0: 0, a1: 180, size: [0.012, 0.03], mat: trim },
      { name: 'handle', type: 'arc', at: [0, s[1], -s[2] * 0.3], axis: 'z', R: s[0] * 0.24, a0: 0, a1: 180, size: [0.012, 0.03], mat: trim },
    ];
    const zf = s[2] * 0.56 + 0.004, out = [
      { name: 'body', type: 'box', at: [0, s[1] / 2, 0], size: s, round: Math.min(0.04, s[2] * 0.3), mat: cloth },
      { name: 'flap', type: 'box', at: [0, s[1] * 0.8, s[2] * 0.03], size: [s[0] * 1.03, s[1] * 0.42, s[2] * 1.08], round: Math.min(0.035, s[2] * 0.28), mat: role(p, 'flap', cloth) },
      { name: 'strap', type: 'beam', from: [-s[0] * 0.24, s[1] * 1.0, zf], to: [-s[0] * 0.24, s[1] * 0.5, zf], w: 0.026, d: 0.007, up: [0, 0, 1], mat: trim },
      { name: 'strap', type: 'beam', from: [s[0] * 0.24, s[1] * 1.0, zf], to: [s[0] * 0.24, s[1] * 0.5, zf], w: 0.026, d: 0.007, up: [0, 0, 1], mat: trim },
      { name: 'handle', type: 'arc', at: [0, s[1] * 1.005, 0], axis: 'z', R: s[0] * 0.15, a0: 0, a1: 180, size: [0.011, 0.024], mat: trim },
    ];
    if (p.hooks) for (const sx of [-1, 1]) out.push({ name: 'hook', type: 'path', points: [[sx * s[0] * 0.3, s[1] * 0.92, -s[2] / 2], [sx * s[0] * 0.3, s[1] + 0.035, -s[2] / 2 - 0.004], [sx * s[0] * 0.3, s[1] + 0.035, -s[2] / 2 - 0.035]], r: 0.005, smooth: false, mat: 'black' });
    return out;
  },
  // a child's seat for a rack: a high back, side wings, a cushion, shoulder and lap belts to a buckle, footrests
  'child-seat'(p) {
    const shell = role(p, 'shell', { kind: 'plastic', color: p.color || '#2b2d31', finish: 'satin' });
    const pad = role(p, 'pad', { kind: 'fabric', color: '#7b8576', weave: 700 }), belt = role(p, 'belt', M.webbing);
    const buckle = role(p, 'buckle', { kind: 'plastic', color: '#c23b2a', finish: 'gloss' });
    return [
      { name: 'bracket', type: 'box', at: [0, 0.015, 0], size: [0.24, 0.03, 0.12], round: 0.008, mat: 'black' },
      { name: 'shell', type: 'box', at: [0, 0.075, 0], size: [0.33, 0.09, 0.31], round: 0.03, mat: shell },
      { name: 'cushion', type: 'seat', at: [0.02, 0.128, 0], size: [0.27, 0.045, 0.25], style: 'cushion', mat: pad },
      { name: 'back', type: 'box', at: [-0.155, 0.36, 0], size: [0.05, 0.52, 0.31], round: 0.024, rot: [0, 0, 7], mat: shell },
      { name: 'back pad', type: 'box', at: [-0.125, 0.35, 0], size: [0.02, 0.42, 0.24], round: 0.009, rot: [0, 0, 7], mat: pad },
      { name: 'wing', type: 'box', at: [-0.03, 0.2, 0.155], size: [0.27, 0.15, 0.03], round: 0.014, mat: shell },
      { name: 'wing', type: 'box', at: [-0.03, 0.2, -0.155], size: [0.27, 0.15, 0.03], round: 0.014, mat: shell },
      { name: 'belt', type: 'beam', from: [-0.138, 0.52, 0.065], to: [0.03, 0.16, 0.02], w: 0.032, d: 0.006, up: [1, 0, 0], mat: belt },
      { name: 'belt', type: 'beam', from: [-0.138, 0.52, -0.065], to: [0.03, 0.16, -0.02], w: 0.032, d: 0.006, up: [1, 0, 0], mat: belt },
      { name: 'lap belt', type: 'beam', from: [-0.07, 0.16, 0.13], to: [0.03, 0.16, 0.025], w: 0.03, d: 0.006, up: [0, 1, 0], mat: belt },
      { name: 'lap belt', type: 'beam', from: [-0.07, 0.16, -0.13], to: [0.03, 0.16, -0.025], w: 0.03, d: 0.006, up: [0, 1, 0], mat: belt },
      { name: 'buckle', type: 'box', at: [0.035, 0.168, 0], size: [0.04, 0.03, 0.055], round: 0.008, mat: buckle },
      { name: 'footrest', type: 'tube', from: [0.12, 0.05, 0.12], to: [0.17, -0.22, 0.125], r: 0.011, mat: 'black' },
      { name: 'footrest', type: 'tube', from: [0.12, 0.05, -0.12], to: [0.17, -0.22, -0.125], r: 0.011, mat: 'black' },
      { name: 'foot cup', type: 'box', at: [0.18, -0.235, 0.125], size: [0.1, 0.035, 0.06], round: 0.012, mat: shell },
      { name: 'foot cup', type: 'box', at: [0.18, -0.235, -0.125], size: [0.1, 0.035, 0.06], round: 0.012, mat: shell },
    ];
  },
  // a padded bench for seats children or passengers in a row, facing x: a back, and per seat two belts to a buckle
  bench(p) {
    const n = Math.max(1, Math.min(3, p.seats || 2)), w = p.width || 0.24 * n + 0.04;
    const frame = role(p, 'frame', M.oak), pad = role(p, 'pad', { kind: 'fabric', color: p.color || '#5f6b5c', weave: 700 });
    const belt = role(p, 'belt', M.webbing), buckle = role(p, 'buckle', { kind: 'plastic', color: '#c23b2a', finish: 'gloss' });
    const out = [
      { name: 'frame', type: 'box', at: [0, 0.04, 0], size: [0.25, 0.08, w], round: 0.01, mat: frame },
      { name: 'cushion', type: 'seat', at: [0.02, 0.105, 0], size: [0.22, 0.05, w * 0.96], style: 'cushion', mat: pad },
      { name: 'back', type: 'box', at: [-0.11, 0.27, 0], size: [0.045, 0.32, w * 0.96], round: 0.018, rot: [0, 0, 8], mat: pad },
    ];
    for (let i = 0; i < n; i++) {
      const zc = (i - (n - 1) / 2) * (w / n);
      out.push({ name: 'belt', type: 'beam', from: [-0.115, 0.4, zc + 0.05], to: [0.035, 0.14, zc + 0.012], w: 0.028, d: 0.006, up: [1, 0, 0], mat: belt });
      out.push({ name: 'belt', type: 'beam', from: [-0.115, 0.4, zc - 0.05], to: [0.035, 0.14, zc - 0.012], w: 0.028, d: 0.006, up: [1, 0, 0], mat: belt });
      out.push({ name: 'buckle', type: 'box', at: [0.04, 0.142, zc], size: [0.034, 0.028, 0.046], round: 0.007, mat: buckle });
    }
    return out;
  },
  // a cardboard parcel with a strip of tape and a label
  parcel(p) {
    const s = p.size || [0.3, 0.2, 0.24];
    return [
      { name: 'box', type: 'box', at: [0, s[1] / 2, 0], size: s, round: Math.min(...s) * 0.03, mat: role(p, 'card', p.color ? { ...M.card, color: p.color } : M.card) },
      { name: 'tape', type: 'box', at: [0, s[1], 0], size: [s[0] + 0.002, 0.004, Math.min(0.05, s[2] * 0.22)], round: 0.0015, mat: M.tape },
      { name: 'label', type: 'box', at: [0, s[1] * 0.55, s[2] / 2], size: [s[0] * 0.42, s[1] * 0.34, 0.003], round: 0.001, mat: M.paper },
    ];
  },
  // a tabletop the product stands on; lit: { at: [x, z] (scene units), r, k } the pool of a lamp's light on it
  desk(p) {
    const s = p.size || [0.9, 0.032, 0.55];
    const wood = role(p, 'wood', { kind: 'wood', color: p.color || '#a8774c', grain: 'x' });
    return [{ name: 'top', type: 'box', at: [0, s[1] / 2, 0], size: s, round: Math.min(0.006, s[1] * 0.3), mat: p.lit ? { ...(typeof wood === 'string' ? BUILTIN[wood] || BUILTIN.wood : wood), lit: p.lit } : wood }];
  },
  // books: count of them stacked, boards, a spine and the page block
  book(p) {
    const s = p.size || [0.23, 0.03, 0.16], n = Math.max(1, Math.min(3, p.count || 1)), cols = p.colors || ['#2f4858', '#8a3b2e', '#b8a57c'];
    const out = [];
    for (let k = 0; k < n; k++) {
      const y = k * s[1], cover = { kind: 'fabric', color: cols[k % cols.length], weave: 800 }, tw = (k % 2 ? 5 : -3);
      const b = [
        { name: 'board', type: 'box', at: [0, y + 0.002, 0], size: [s[0], 0.004, s[2]], round: 0.0015, mat: cover },
        { name: 'board', type: 'box', at: [0, y + s[1] - 0.002, 0], size: [s[0], 0.004, s[2]], round: 0.0015, mat: cover },
        { name: 'spine', type: 'box', at: [-s[0] / 2 + 0.003, y + s[1] / 2, 0], size: [0.007, s[1], s[2]], round: 0.003, mat: cover },
        { name: 'pages', type: 'box', at: [0.002, y + s[1] / 2, 0], size: [s[0] - 0.01, s[1] - 0.007, s[2] - 0.008], round: 0.001, mat: M.paper },
      ];
      out.push(...placeProp(b, { yaw: tw }));
    }
    return out;
  },
  // a mug: an open cup (a shade with straight walls), what is in it, a handle
  mug(p) {
    const r = p.r || 0.041, h = p.h || 0.095, cer = role(p, 'ceramic', p.color ? { ...M.ceramic, color: p.color } : M.ceramic);
    return [
      { name: 'cup', type: 'shade', from: [0, 0.003, 0], to: [0, h, 0], r1: r, r2: r, t: 0.0035, bulge: 0, mat: cer, innerMat: cer },
      { name: 'coffee', type: 'cylinder', at: [0, h * 0.8, 0], r: r - 0.003, h: 0.004, round: 0.001, mat: { kind: 'plastic', color: '#3b2416', finish: 'gloss' } },
      { name: 'handle', type: 'arc', at: [r + 0.002, h * 0.52, 0], axis: 'z', R: 0.025, a0: -80, a1: 80, size: [0.011, 0.01], mat: cer },
    ];
  },
  // a sheet of paper lying flat
  sheet(p) { const s = p.size || [0.297, 0.002, 0.21]; return [{ name: 'sheet', type: 'box', at: [0, s[1] / 2, 0], size: s, round: 0.0008, mat: role(p, 'paper', M.paper) }]; },
  // a low tray or bin, open on top; parcels: how many small boxes in it
  tray(p) {
    const s = p.size || [0.42, 0.07, 0.3], out = [{ name: 'tray', type: 'basket', at: [0, s[1] / 2, 0], size: s, style: 'solid', t: 0.006, round: 0.012, mat: role(p, 'plastic', { kind: 'plastic', color: p.color || '#2e3238', finish: 'satin' }) }];
    const n = Math.max(0, Math.min(4, p.parcels ?? 3));
    // the parcels stand taller than the rim, so they read from any view
    for (let i = 0; i < n; i++) out.push(...placeProp(PROPS.parcel({ size: [s[0] * 0.2, s[1] * 1.35, s[2] * 0.25] }), { at: [(i - (n - 1) / 2) * s[0] * 0.25, 0.008, (i % 2 ? 1 : -1) * s[2] * 0.15], yaw: (i * 23) % 40 - 15 }));
    return out;
  },
};
// a prop's parts moved to its place: turned about y by yaw (degrees), scaled, then moved to at
function placeProp(list, { at = [0, 0, 0], yaw = 0, scale = 1, group } = {}) {
  const Ry = euler([0, yaw, 0]);
  const T = v => add(at, matVec(Ry, mul(v, scale)));
  return list.map(p0 => {
    const q = { ...p0 };
    for (const k of LENGTH_KEYS) if (typeof q[k] === 'number') q[k] *= scale;
    for (const k of LENGTH_ARRAYS) if (Array.isArray(q[k])) q[k] = q[k].map(v => v * scale);
    if (q.from && q.to) { q.from = T(q.from); q.to = T(q.to); if (q.up) q.up = matVec(Ry, q.up); }
    else if (q.points) q.points = q.points.map(T);
    else { q.at = T(q.at || [0, 0, 0]); if (yaw) q._pre = q._pre ? matMul(Ry, q._pre) : Ry; }
    if (group && !q.in) q.in = group;
    return q;
  });
}
function expandProps(list = []) {
  return list.flatMap((p, i) => {
    if (!p.prop) return [p];
    const make = PROPS[p.prop];
    if (!make) throw new Error(`product-render: unknown prop "${p.prop}" (one of ${Object.keys(PROPS).join(', ')})`);
    const label = p.name || p.prop.replace(/-/g, ' ');
    return placeProp(make(p), { at: p.at, yaw: p.yaw || 0, scale: p.scale || 1, group: p.in }).map(q => ({ ...q, name: `${label} ${q.name || 'part'}` }));
  });
}

/* ------------------------------------------------------------------ scenes, colourways, views */
/** the spec as a scene shows it (props added, parts hidden) in a colourway's materials */
export function resolveSpec(spec, { scene, color } = {}) {
  const sc = scene ? spec.scenes?.[scene] : null;
  if (scene && !sc) throw new Error(`product-render: ${spec.id}: no scene "${scene}" (${Object.keys(spec.scenes || {}).join(', ') || 'none'})`);
  const cw = color ? colorOf(spec, color) : null;
  if (!sc && !cw?.materials) return spec;
  const out = { ...spec, materials: { ...(spec.materials || {}), ...(sc?.materials || {}), ...(cw?.materials || {}) } };
  if (sc) {
    const hide = [].concat(sc.hide || []);
    let props = [...expandProps(sc.props), ...(sc.parts || [])];
    // lit: the light the product throws on what is round it (a lamp's pool on the desk, the book, the paper)
    if (sc.lit) {
      const lit = m => { const d = typeof m === 'string' ? (out.materials[m] || BUILTIN[m]) : m; const o = typeof d === 'string' ? BUILTIN[d] : d; return o && o.kind !== 'light' ? { ...o, lit: sc.lit } : m; };
      props = props.map(p => ({ ...p, mat: lit(p.mat || 'graphite'), ...(p.innerMat ? { innerMat: lit(p.innerMat) } : {}), ...(p.type === 'basket' ? { rimMat: lit(p.rimMat || p.mat || 'black') } : {}) }));
    }
    out.parts = [...spec.parts.filter(p => !hide.some(n => nameMatch(p.name, n))), ...props];
    if ('pool' in sc) out.pool = sc.pool;
    if (sc.label) out.label = sc.label;
    if (sc.click !== undefined) out.click = sc.click;
  }
  return out;
}
/** a colourway by id: { id, name, accent, materials? }; 'page' (or none) keeps the page's accent */
export function colorOf(spec, id) {
  if (!id || id === 'page') return null;
  return (spec.colors || []).find(c => c.id === id) || null;
}
const STD_VIEWS = ['three-quarter', 'side', 'front', 'rear', 'top', 'low'];
/** the views a spec has: the standard ones and its own (spec.views), or only those it lists in spec.supports (the views it draws well) */
export const viewNames = spec => spec.supports ? [...new Set([].concat(spec.supports))] : [...new Set([...STD_VIEWS, ...Object.keys(spec.views || {})])];
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/**
  A view: a name ('three-quarter', 'side', 'side-left', 'front', 'rear', 'top', 'low', 'detail:<part>[,<part>]',
  or one of spec.views) or { angle, elev, part, margin, from }. Front is the product's x toward the camera.
  part: the named parts (a name takes the parts it begins: "saddle" takes "saddle spring R") are framed
  and the rest of the product runs off the frame: a close-up. margin: room round what is framed. cover: the widest
  frame (width over height; a tall one is covered to 1 : 1.25) a close-up's shot must fill with the product running on past the framed
  parts, so the parts sit centred in a wide tile with no hard cut inside it (default 2; 1 frames only the margin).
*/
export function resolveView(spec, v = 'three-quarter') {
  const a = spec.angle ?? -32, e = spec.camera?.elev ?? 12;
  const std = {
    'three-quarter': { angle: a, elev: e }, side: { angle: 0, elev: 3 }, 'side-left': { angle: 180, elev: 3 },
    front: { angle: -90, elev: 7 }, rear: { angle: 90, elev: 7 }, top: { angle: a * 0.45, elev: 68 }, low: { angle: a * 0.85, elev: 1.5 },
  };
  let o, name;
  if (typeof v === 'string') {
    name = v;
    // spec.supports: the views this product draws well. A view outside it (a bike from above reads as lying on its
    // side) is refused, so no page shows it; a close-up of named parts (detail:<part>) is always the page's choice
    if (spec.supports && !spec.supports.includes(v) && !/^detail[:-]/.test(v) && (spec.views?.[v] || STD_VIEWS.includes(v) || v === 'side-left')) {
      throw new Error(`product-render: ${spec.id}: the view "${v}" is not one this product shows well (supports: ${viewNames(spec).join(', ')})`);
    }
    const own = spec.views?.[v];
    if (own) o = { ...(std[own.from] || std['three-quarter']), ...own };
    else if (std[v]) o = std[v];
    else if (/^detail[:-]/.test(v)) o = { ...std['three-quarter'], elev: Math.max(e, 14), part: v.replace(/^detail[:-]/, '').split(',').map(s => s.trim()) };
    else throw new Error(`product-render: ${spec.id}: no view "${v}" (${viewNames(spec).join(', ')}, or detail:<part name>)`);
  } else {
    o = { ...(std[v.from] || std['three-quarter']), ...v };
    name = v.name || `a${Math.round(o.angle)}e${Math.round(o.elev)}${o.part ? '-' + [].concat(o.part).join('-') : ''}`;
  }
  const part = o.part ? [].concat(o.part) : null;
  return { name, key: slug(name), angle: o.angle, elev: Math.max(0, Math.min(80, o.elev)), part, margin: o.margin ?? (part ? 1.3 : 1), cover: o.cover ?? 2, dist: o.dist ?? spec.camera?.dist ?? 6 };
}
/**
  The framing of a view: the object moved across (off, before the turn) and the camera raised (ty) so
  what is framed sits centred, and its half width and height as the camera sees it (ex), so print3d's
  size is the share of the frame the product fills: 0.86 fills 86% of the width or the height, whichever
  is tighter. swingK: the size to keep the whole sway inside that frame.
*/
function frameView(focus, all, v, swing) {
  const e = v.elev * DEG, ce = Math.cos(e), se = Math.sin(e), D = v.dist;
  const proj = (pts, yawDeg, off, ty) => {
    const a = yawDeg * DEG, c = Math.cos(a), s = Math.sin(a);
    const b = [Infinity, -Infinity, Infinity, -Infinity];
    for (const q of pts) {
      const ax = q[0] + off[0], ay = q[1] - ty, az = q[2] + off[2];
      const wx = c * ax + s * az, wz = -s * ax + c * az;
      const dy = ay - D * se, dz = wz - D * ce;
      const yu = ce * dy - se * dz, zf = -se * dy - ce * dz;
      const ux = (D * wx) / zf, uy = (D * yu) / zf;
      if (ux < b[0]) b[0] = ux; if (ux > b[1]) b[1] = ux; if (uy < b[2]) b[2] = uy; if (uy > b[3]) b[3] = uy;
    }
    return b;
  };
  const lo = [0, 1, 2].map(k => Math.min(...focus.map(q => q[k]))), hi = [0, 1, 2].map(k => Math.max(...focus.map(q => q[k])));
  let off = [-(lo[0] + hi[0]) / 2, 0, -(lo[2] + hi[2]) / 2], ty = (lo[1] + hi[1]) / 2;
  const a = v.angle * DEG;
  for (let i = 0; i < 6; i++) {
    const b = proj(focus, v.angle, off, ty), cx = (b[0] + b[1]) / 2, cy = (b[2] + b[3]) / 2;
    off = [off[0] - Math.cos(a) * cx, 0, off[2] - Math.sin(a) * cx];
    ty += cy / ce;
  }
  const b = proj(focus, v.angle, off, ty);
  const exF = [Math.max(-b[0], b[1], 1e-3), Math.max(-b[2], b[3], 1e-3)];   // the framed parts' own half extents
  const ex = [exF[0] * v.margin, exF[1] * v.margin];
  // a close-up: where the rest of the product runs on past the shot, the shot reaches as far as a wide (or tall) frame
  // centred on the framed parts will show (v.cover), up to the product's own end, so the parts can be centred in any such
  // frame and the product still runs off its edges. (The frame keeps the parts at about 0.84 of its tight side.)
  if (v.part && v.cover > 1) {
    const bb = proj(all, v.angle, off, ty), ox = Math.max(-bb[0], bb[1]) * 1.03, oy = Math.max(-bb[2], bb[3]) * 1.03;
    ex[0] = Math.max(ex[0], Math.min(v.cover / 0.84 * exF[1], ox));
    ex[1] = Math.max(ex[1], Math.min(Math.min(v.cover, 1.25) / 0.84 * exF[0], oy));   // a tall frame is rarer than a wide one: covered to 1 : 1.25
  }
  let swingK = 1;
  if (swing) {
    let ux = 0, uy = 0;
    const steps = swing >= 180 ? [-180, -150, -120, -90, -60, -30, 30, 60, 90, 120, 150] : [-1, -0.5, 0.5, 1].map(k => k * swing);
    for (const d of steps) { const bb = proj(focus, v.angle + d, off, ty); ux = Math.max(ux, -bb[0], bb[1]); uy = Math.max(uy, -bb[2], bb[3]); }
    swingK = Math.min(1, ex[0] / ux, ex[1] / uy);
  }
  // the rays' bounding sphere and the floor's reach, about the new pivot
  let bound = 0, foot = 0;
  for (const q of all) {
    const x = q[0] + off[0], z = q[2] + off[2];
    bound = Math.max(bound, Math.hypot(x, q[1] - ty, z));
    foot = Math.max(foot, Math.hypot(x, z));
  }
  return { off, ty, ex, exF, swingK, bound, foot };
}

/* ------------------------------------------------------------------ the build */
const knownKind = new Set(Object.keys(PARTS));

/** problems with a spec, as plain lines (empty when it builds) */
export function checkSpec(spec, opts = {}) {
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
  const limit = opts.limit || 90;
  if ((spec.parts || []).length > limit) out.push(`parts: ${spec.parts.length} parts; keep a product under about ${limit} (each one is evaluated per ray step)`);
  if (opts.deep !== false) {
    // its scenes, views and colourways
    const names = (spec.parts || []).map(p => p.name).filter(Boolean);
    for (const [id, sc] of Object.entries(spec.scenes || {})) {
      for (const n of [].concat(sc.hide || [])) if (!names.some(m => nameMatch(m, n))) out.push(`scenes.${id}.hide: no part named "${n}"`);
      for (const p of sc.props || []) if (p.prop && !PROPS[p.prop]) out.push(`scenes.${id}: unknown prop "${p.prop}" (one of ${Object.keys(PROPS).join(', ')})`);
      try { out.push(...checkSpec(resolveSpec(spec, { scene: id }), { limit: 110, deep: false }).map(s => `scenes.${id}: ${s}`)); } catch (e) { out.push(`scenes.${id}: ${e.message}`); }
    }
    for (const [id, v] of Object.entries(spec.views || {})) {
      for (const n of [].concat(v.part || [])) if (!names.some(m => nameMatch(m, n))) out.push(`views.${id}.part: no part named "${n}"`);
    }
    if (spec.supports !== undefined) {
      if (!Array.isArray(spec.supports) || !spec.supports.length) out.push('supports: a non-empty list of view names (the views this product draws well)');
      else {
        const known = new Set([...STD_VIEWS, 'side-left', ...Object.keys(spec.views || {})]);
        for (const n of spec.supports) if (!known.has(n) && !/^detail[:-]/.test(n)) out.push(`supports: "${n}" is no view of this spec (${[...known].join(', ')})`);
        if (!spec.supports.includes('three-quarter')) out.push('supports: keep "three-quarter" (the three-quarter view is the hero)');
        for (const v of spec.make?.variants || []) { const n = String(v).split('+')[0]; if (!spec.supports.includes(n) && !/^detail[:-]/.test(n)) out.push(`make.variants: "${n}" is not in supports`); }
      }
    }
    const ids = new Set();
    for (const c of spec.colors || []) {
      if (!c.id || ids.has(c.id)) out.push(`colors: every colourway needs its own id (${c.id || 'none'})`);
      ids.add(c.id);
      if (!c.accent && !c.materials) out.push(`colors.${c.id}: give it an accent (#hex) or materials`);
    }
  }
  return out;
}

/**
  build(spec, { base }) -> a print object (definePrint), ready to mount.
  base: the URL the spec came from (posters are found beside it).
*/
export function build(spec0, { base, view, scene, color, grounds } = {}) {
  const spec = resolveSpec(spec0, { scene, color });
  const problems = checkSpec(spec, { limit: scene ? 110 : 90, deep: !scene });
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
  const P0 = v => [(v[0] - cx) * S, (v[1] - y0) * S, (v[2] - cz) * S];
  // the radius about the turn's axis and the height, over every pose
  let rxz = 0;
  for (const pt of parts) {
    const c = chain(pt.spec.in), cs = corners(pt);
    for (const ang of poses(c)) for (const v of posed(cs, c, ang)) { const q = P0(v); rxz = Math.max(rxz, Math.hypot(q[0], q[2])); }
  }
  const height = (hi[1] - y0) * S;

  /* a view (fit): the product framed as the camera sees it from that view, centred, at the frame's scale */
  let fit = null, vw = null, off = [0, 0, 0];
  if (view) {
    vw = resolveView(spec0, view);
    const restPts = [], allPts = [], focusPts = [];
    for (const pt of parts) {
      const c = chain(pt.spec.in), cs = partSamples(pt);
      const rest = posed(cs, c, c.map(g => (g.rest || 0) * DEG)).map(P0);
      for (const q of rest) restPts.push(q);
      if (vw.part && vw.part.some(n => nameMatch(pt.spec.name, n))) for (const q of rest) focusPts.push(q);
      for (const ang of poses(c)) for (const v of posed(cs, c, ang)) allPts.push(P0(v));
    }
    if (vw.part && !focusPts.length) throw new Error(`product-render: ${spec.id}: view "${vw.name}": no part named ${vw.part.join(', ')}`);
    const swing = spec.turn?.mode === 'still' ? 0 : spec.turn?.mode === 'spin' ? 180 : (spec.turn?.amp ?? 26);
    fit = frameView(focusPts.length ? focusPts : restPts, allPts, vw, swing);
    off = fit.off;
  }
  const P = v => { const q = P0(v); return [q[0] + off[0], q[1], q[2] + off[2]]; };

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
    const g = materialGlsl(m, on, P, S);
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
  const posterName0 = spec.poster || spec.id || 'product';
  // a view's posters carry its name (and the scene's, and a colourway's that changes materials)
  const posterName = fit ? `${posterName0}-${variantKey({ view: vw.name, scene, color: colorOf(spec0, color)?.materials ? color : null })}` : posterName0;
  const made = fit ? (grounds || []) : ['light', 'dark'];
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
    // a view whose posters were not made falls back to the spec's own turntable poster (<poster>.fallback-render.png, when the
    // spec ships one), so a page without WebGL still shows the product; a print view without posters shows nothing until it draws
    poster: (palette, dark, render) => (made.length ? `./${posterName}.fallback${render ? '-render' : ''}${dark && made.includes('dark') ? '-dark' : ''}.png`
      : fit && render ? `./${posterName0}.fallback-render${dark ? '-dark' : ''}.png` : CLEAR_PX),
    posterPrint: 'halftone',
  };
  if (fit) {
    // the view's framing replaces the turntable's: centred on what is framed, the extent as the camera sees it
    Object.assign(def, {
      pivot: [0, fit.ty, 0], camera: { elev: vw.elev, dist: vw.dist, target: fit.ty },
      extent: fit.ex, bound: fit.bound * 1.03 + 0.01, foot: Math.max(fit.foot, 0.05),
      place: Object.fromEntries(Object.entries(FILL).map(([k, s]) => [k, { transparent: 1, size: s, x: 0, y: 0 }])),
    });
    def.params.angle = { default: vw.angle };
  }
  const obj = definePrint(def);
  obj.spec = spec;
  obj.posterName = posterName;
  obj.fit = fit ? { ...fit, view: vw, scene: scene || null } : null;
  obj.problems = () => glslProblems(obj.source().form);
  // mount: a phone or a coarse pointer shows one still frame (turn 0) unless the page asks for the turn;
  // only one product render a page turns (the first mounted); the others hold still until touched
  const mount0 = obj.mount.bind(obj);
  obj.mount0 = mount0;
  if (fit) return obj;   // a view is mounted by mountProduct (below), which decides the turn, the still and the colour
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

/* ------------------------------------------------------------------ the product: its views, scenes, colours and stills */
// the share of the frame the product fills at each place (the product's bounds, the tighter way)
const FILL = { hero: 0.88, stage: 0.86, tile: 0.84, card: 0.9, none: 0.86 };
const CLEAR_PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
/** the name of a variant's files: view, then scene, then a colourway that changes materials ('side', 'three-quarter-loaded') */
export function variantKey({ view = 'three-quarter', scene, color, off } = {}) {
  const v = typeof view === 'string' ? view : view.name || `a${Math.round(view.angle ?? 0)}e${Math.round(view.elev ?? 0)}`;
  return [slug(v), scene && slug(scene), color && slug(color), off && 'off'].filter(Boolean).join('-');
}

/**
  The product a spec describes (loadProduct gives it):
    product.mount(el, { place, view, scene, color, mode, fill, params, palette }) -> controller
    product.variant({ view, scene, color })   the built print object of one view (cached)
    product.views, product.scenes, product.colors, product.still({ view, scene, color, ground, off })
  manifest: <poster>.stills.json beside the spec (make-posters.mjs writes it), what was made.
*/
export function makeProduct(spec, { base, manifest = null } = {}) {
  const cache = new Map();
  const product = {
    spec, base, manifest,
    id: spec.id, name: spec.name,
    get views() { return viewNames(spec); },
    get scenes() { return Object.keys(spec.scenes || {}); },
    get colors() { return spec.colors || []; },
    defaultColor: spec.colors?.length ? spec.colors[0].id : null,
    color: id => colorOf(spec, id),
    /** a variant's print object; color only matters for a colourway that changes materials */
    variant({ view = 'three-quarter', scene = null, color = null } = {}) {
      const mc = colorOf(spec, color)?.materials ? color : null;
      const vn = resolveView(spec, view).name;
      const key = variantKey({ view: vn, scene, color: mc });
      if (!cache.has(key)) cache.set(key, build(spec, { base, view, scene, color: mc, grounds: manifest?.variants?.[key]?.grounds || [] }));
      return cache.get(key);
    },
    /** the legacy turntable (the old places: the product right of the words in a wide frame) */
    legacy() { if (!cache.has('')) cache.set('', build(spec, { base })); return cache.get(''); },
    /** a still image make-posters.mjs made: { src, src2 (half size), w, h, box [x0, y0, x1, y1] (the product, 0..1) } or null */
    still({ view = 'three-quarter', scene = null, color, ground = 'light', off = false } = {}) {
      if (!manifest) return null;
      let vn;
      try { vn = resolveView(spec, view).name; } catch (_) { return null; }
      const mc = colorOf(spec, color)?.materials ? color : null;
      const v = manifest.variants?.[variantKey({ view: vn, scene, color: mc, off })];
      if (!v) return null;
      const g = v.stills?.[ground] || v.stills?.light;
      const s = g && (g[color || product.defaultColor || 'page'] || g[Object.keys(g)[0]]);
      return s ? { ...s, src: new URL(s.file, base).href, src2: s.half ? new URL(s.half, base).href : null, box: v.box, focus: v.focus || null, cut: v.cut || null } : null;
    },
    mount(el, opts = {}) { return mountProduct(product, el, opts); },
    problems() { return product.legacy().problems(); },
    posterPrint: 'halftone',
  };
  return product;
}

/** fetch a spec (a URL relative to the page) and make its product (with what make-posters made for it) */
export async function loadProduct(url) {
  const href = new URL(url, HAS_DOM ? document.baseURI : 'file:///').href;
  const res = await fetch(href);
  if (!res.ok) throw new Error(`product-render: no spec at ${href}`);
  const spec = await res.json();
  let manifest = null;
  if (spec.make) {
    const m = await fetch(new URL(`./${spec.poster || spec.id}.stills.json`, href).href, { cache: 'no-cache' }).catch(() => null);
    if (m && m.ok) manifest = await m.json().catch(() => null);
  }
  return makeProduct(spec, { base: href, manifest });
}

/* ------------------------------------------------------------------ mounting a product on the page */
/*
  Three ways to show a view, picked per mount (mode, default 'auto'):
    live   print3d's render: the turn, the pointer's light, a lamp's click; a WebGL context while it moves
    image  the still make-posters.mjs made for this view, scene and colour: an <img>, no WebGL at all
    still  the view rendered once at the frame's size, kept as an <img>; its context freed and its
           canvases taken off the page (no checker counts them), rendered again on a resize or a colour
  auto: image when make-posters made the still (unless params.turn > 0 asks for the turn); else live when
  it turns (the first product mounted, the default view, a wide screen, no reduced motion); else still.
  The page reads what each frame does: data-product-mode, data-product-state (image | still | live |
  poster), and window.__tpProduct { stills, images, live, freed } counts them.
*/
const turningMounts = new Set();
let stillChain = Promise.resolve();
const queueStill = fn => (stillChain = stillChain.then(fn, fn));
const stats = HAS_DOM ? (window.__tpProduct = window.__tpProduct || { stills: 0, images: 0, live: 0, freed: 0 }) : {};

export function mountProduct(product, el, opts = {}) {
  const spec = product.spec;
  const given = { ...(opts.params || {}) };
  if (opts.fit === false || opts.place === 'legacy') return product.legacy().mount(el, { ...opts, place: opts.place === 'legacy' ? 'hero' : opts.place });
  const st = {
    view: opts.view || (given.angle != null ? { angle: given.angle, elev: given.elev ?? spec.camera?.elev ?? 12 } : 'three-quarter'),
    scene: opts.scene || null,
    color: opts.color ?? product.defaultColor,
    on: given.step != null ? given.step > 0 : true,
  };
  if (typeof st.view === 'string') resolveView(spec, st.view);   // a view the spec does not show (spec.supports) stops here, so auto.js reports it (data-product-error)
  const place = typeof opts.place === 'string' ? opts.place : 'stage';
  let fill = Math.max(0.3, Math.min(1.2, opts.fill ?? given.size ?? FILL[place] ?? 0.86));
  const mq = q => HAS_DOM && matchMedia(q).matches;
  const reduced = () => mq('(prefers-reduced-motion: reduce)');
  const phone = () => mq('(max-width: 700px)') || mq('(pointer: coarse)');
  const mode0 = opts.mode || 'auto';
  const label = el.getAttribute('aria-label') || spec.label || spec.name;
  const clickable = spec.click === 'light' && given.interactive !== 0;
  let inner = null, img = null, mode = '', token = 0, destroyed = false, shownRes = null, lastSize = [0, 0], rt = 0;
  let shown = new Promise(r => (shownRes = r));
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  const overflow0 = el.style.overflow;
  el.classList.add('product-render');

  const isDefault = () => st.view === 'three-quarter' && !st.scene;
  const turns = () => {
    const t = given.turn ?? (isDefault() && spec.turn?.mode !== 'still' ? 1 : 0);
    return t > 0 && !reduced() && !phone() && (!turningMounts.size || turningMounts.has(api));
  };
  const ground = () => { const p = palette(); return lightOf(p.bg) < 0.5 ? 'dark' : 'light'; };
  const stillOf = () => product.still({ view: st.view, scene: st.scene, color: st.color, ground: ground(), off: clickable && !st.on });
  function palette() {
    const p = opts.palette ? normalizePalette(opts.palette) : readPalette(el);
    const cw = colorOf(spec, st.color);
    return cw?.accent ? { ...p, accent: cw.accent } : p;
  }
  function setRole() {
    el.setAttribute('aria-label', label);
    if (clickable && mode !== 'live') {
      el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-pressed', String(st.on));
    } else if (mode !== 'live') { el.setAttribute('role', 'img'); el.removeAttribute('tabindex'); el.removeAttribute('aria-pressed'); }
    else { el.removeAttribute('role'); el.removeAttribute('tabindex'); el.removeAttribute('aria-pressed'); }
  }
  function clearInner() {
    if (inner) { const c = inner; inner = null; try { c.release?.(); c.destroy(); stats.freed++; } catch (_) { /* gone */ } }
    turningMounts.delete(api);
  }
  function done() { if (shownRes) { shownRes(api); shownRes = null; } }

  // the picture as an <img>: a still from make-posters (placed by its product box) or a frame rendered here (the whole frame)
  function showImage(src, s) {
    const im = new Image();
    im.decoding = 'async'; im.alt = ''; im.draggable = false; im.className = 'product-render__img';
    im.setAttribute('aria-hidden', 'true');
    Object.assign(im.style, { position: 'absolute', display: 'block', maxWidth: 'none', pointerEvents: 'none', userSelect: 'none', opacity: '0', transition: 'opacity 240ms ease' });
    im._s = s;
    const old = img;
    im.onload = () => {
      if (destroyed || !im.isConnected) return;
      img = im; layout();
      requestAnimationFrame(() => { im.style.opacity = '1'; });
      if (old && old !== im) setTimeout(() => { if (old._url) URL.revokeObjectURL(old._url); old.remove(); }, reduced() ? 0 : 260);
      done();
    };
    im.onerror = () => { if (!destroyed) { el.dataset.productError = `no still at ${src}`; im.remove(); if (mode === 'image') { mode = 'still'; queueStill(() => renderStill(token)); } } };
    if (src.startsWith('blob:')) im._url = src;
    if (s?.src2 && s.w) im.srcset = `${s.src2} ${Math.round(s.w / 2)}w, ${s.src} ${s.w}w`;
    im.src = src;
    el.appendChild(im);
  }
  function layout() {
    if (!img) return;
    const w = el.clientWidth, h = el.clientHeight, s = img._s;
    if (!s || !s.box) { Object.assign(img.style, { left: '0px', top: '0px', width: w + 'px', height: h + 'px' }); return; }
    // the product's box (a close-up: the framed parts' box) fills `fill` of the frame (the tighter way), centred; the
    // shadow round it may run past. A close-up's cut sides (where the rest of the product runs off the shot) are kept
    // at or past the frame's edge, so no hard cut shows inside the frame: the picture slides toward them, and grows
    // when sliding alone cannot do it (the frame clips it: overflow hidden while a close-up shows).
    const [x0, y0, x1, y1] = s.focus || s.box, bw = (x1 - x0) * s.w, bh = (y1 - y0) * s.h;
    const cut = s.cut || [0, 0, 0, 0];
    const k0 = fill * Math.min(w / bw, h / bh);
    // one axis: the image's start (px) for size `is` in a frame of size `fs`, centred on the focus [f0, f1], or null
    const axis = (is, fs, f0, f1, lo, hi, nudge) => {
      let a = fs / 2 - ((f0 + f1) / 2) * is + nudge, min = -f0 * is, max = fs - f1 * is;   // the focus stays inside
      if (lo) max = Math.min(max, 0);
      if (hi) min = Math.max(min, fs - is);
      return min <= max + 0.5 ? Math.min(Math.max(a, min), Math.max(min, max)) : null;
    };
    let k = k0, left = 0, top = 0;
    for (let i = 0; i < 40; i++, k *= 1.05) {
      const iw = s.w * k, ih = s.h * k;
      const l = axis(iw, w, x0, x1, cut[0], cut[2], (given.x || 0) * w), t = axis(ih, h, y0, y1, cut[1], cut[3], -(given.y || 0) * h);
      if (l != null && t != null) { left = l; top = t; break; }
      left = w / 2 - ((x0 + x1) / 2) * iw; top = h / 2 - ((y0 + y1) / 2) * ih;
    }
    const iw = s.w * k, ih = s.h * k;
    el.style.overflow = s.cut ? 'hidden' : overflow0;
    Object.assign(img.style, { left: left + 'px', top: top + 'px', width: iw + 'px', height: ih + 'px' });
    if (img.srcset) img.sizes = Math.round(iw) + 'px';
  }
  // print3d's size for a view in this frame: the share of the frame its extent fills. A close-up's extent runs wider than its parts
  // (the shot's cover), so its size is the one that makes the framed parts fill `fill` of the frame, the tighter way
  function sizeFor(v) {
    if (!v.fit.view.part) return fill;
    const w = el.clientWidth || 1, h = el.clientHeight || 1, [ex, exF] = [v.fit.ex, v.fit.exF];
    return Math.min(1.8, fill * Math.min(w / (2 * exF[0]), h / (2 * exF[1])) / Math.min(w / (2 * ex[0]), h / (2 * ex[1])));
  }
  // the view rendered once here at the frame's size, then only an <img>: the context and its canvases go. Its product is
  // measured (alpha) and placed by layout() as a make-posters still is, so a frame in 'still' mode fills the place's share
  // (hero .88, stage .86, tile .84, card .9) exactly as a poster still does, centred, and a close-up is centred on its parts
  async function renderStill(my) {
    if (destroyed || my !== token) return;
    const v = product.variant(st), vw = v.fit.view;
    clearInner();
    const size = sizeFor(v);
    const c = v.mount0(el, { palette: palette(), params: { transparent: 1, size, x: given.x || 0, y: given.y || 0, turn: 0, interactive: 0, step: st.on ? 1 : 0, shadow: given.shadow } });
    inner = c;
    lastSize = [el.clientWidth, el.clientHeight];
    await c.ready();
    if (destroyed || my !== token || inner !== c) return;
    if (c.info.fallback) { c.release(); el.dataset.productState = 'poster'; done(); return; }   // its poster stays
    c.pose({ t: 0, step: st.on ? 1 : 0 });
    const cv = c.canvas;
    const blob = cv ? await new Promise(r => cv.toBlob(r, 'image/webp', 0.94)) : null;   // the bitmap is taken now, in this task
    if (destroyed || my !== token) return;
    const W = cv ? cv.width : 0, H = cv ? cv.height : 0, ex = v.fit.ex;
    clearInner();
    if (!blob) return;
    let s = null;
    try { s = await measureStill(blob, W, H, ex, v.fit.exF, size, vw); } catch (_) { s = null; }   // not measured: the whole frame, as before
    if (destroyed || my !== token) return;
    stats.stills++;
    el.dataset.productState = 'still';
    showImage(URL.createObjectURL(blob), s);
  }
  // the product's box in a still (its opaque pixels: the floor shadow is partly clear), and for a close-up the framed parts' box
  // (the framing's own, centred) and the sides where the rest of the product runs off the picture
  async function measureStill(blob, W, H, ex, exF, size, vw) {
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, 900 / Math.max(W, H)), w = Math.max(1, Math.round(W * k)), h = Math.max(1, Math.round(H * k));
    const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h;
    const x = cv2.getContext('2d', { willReadFrequently: true });
    x.drawImage(bmp, 0, 0, w, h); bmp.close?.();
    const d = x.getImageData(0, 0, w, h).data;
    const b = [w, h, -1, -1];
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 200) { if (xx < b[0]) b[0] = xx; if (xx > b[2]) b[2] = xx; if (yy < b[1]) b[1] = yy; if (yy > b[3]) b[3] = yy; }
    if (b[2] < 0) return null;
    const s = { w: W, h: H, box: [b[0] / w, b[1] / h, (b[2] + 1) / w, (b[3] + 1) / h].map(v => +v.toFixed(4)) };
    if (vw.part) {
      const ppu = size * Math.min(W / (2 * ex[0]), H / (2 * ex[1])), fx = exF[0] * ppu / W, fy = exF[1] * ppu / H;
      s.focus = [0.5 - fx, 0.5 - fy, 0.5 + fx, 0.5 + fy].map(v => +Math.min(1, Math.max(0, v)).toFixed(4));
      s.cut = [b[0] <= 1, b[1] <= 1, b[2] >= w - 2, b[3] >= h - 2].map(Number);
    }
    return s;
  }
  function mountLive(turn) {
    const v = product.variant(st);
    inner = v.mount0(el, { palette: palette(), params: { transparent: 1, size: sizeFor(v) * (turn ? v.fit.swingK : 1), x: given.x || 0, y: given.y || 0, turn: turn ? 1 : 0, step: st.on ? 1 : 0, shadow: given.shadow, interactive: given.interactive } });
    if (turn) turningMounts.add(api);
    stats.live++;
    el.dataset.productState = 'live';
    const poll = () => { if (!inner || destroyed) return; const i = inner.info; if (i.shown || i.fallback || i.still === 'frame') done(); else setTimeout(poll, 120); };
    poll();
  }
  function show() {
    const my = ++token;
    const turn = turns();
    const s = stillOf();
    // auto: the still make-posters made, when there is one and the page did not ask for the turn (no WebGL on the
    // page at all); else the turn where it may turn; else one frame rendered here and freed
    mode = mode0 === 'auto' ? (s && !(given.turn > 0) ? 'image' : turn ? 'live' : s ? 'image' : 'still') : mode0 === 'image' && !s ? 'still' : mode0;
    el.dataset.productMode = mode;
    el.dataset.productView = typeof st.view === 'string' ? st.view : resolveView(spec, st.view).name;
    if (st.color) el.dataset.productColorShown = st.color;
    setRole();
    if (mode !== 'live' || !inner) clearInner();
    if (mode === 'live') { if (!inner) mountLive(turn); return; }
    if (img && mode === 'image' && img._s && img._s.src === s.src) { done(); return; }
    if (mode === 'image') { stats.images++; el.dataset.productState = 'image'; showImage(s.src, s); return; }
    queueStill(() => renderStill(my));
  }
  // a lamp: a click switches it (the live render does this itself)
  const toggle = () => { if (mode === 'live' || !clickable) return; st.on = !st.on; show(); };
  const onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
  el.addEventListener('click', toggle);
  el.addEventListener('keydown', onKey);
  const ro = HAS_DOM ? new ResizeObserver(() => {
    layout();
    if (mode !== 'still') return;
    const w = el.clientWidth, h = el.clientHeight;
    if (Math.abs(w - lastSize[0]) > lastSize[0] * 0.08 || Math.abs(h - lastSize[1]) > lastSize[1] * 0.08) { clearTimeout(rt); rt = setTimeout(show, 320); }
  }) : null;
  ro?.observe(el);

  const api = {
    get mode() { return mode; },
    get view() { return st.view; },
    get scene() { return st.scene; },
    get color() { return st.color; },
    get colors() { return spec.colors || []; },
    get canvas() { return inner?.canvas || null; },
    get params() { return inner ? inner.params : { size: fill, angle: resolveView(spec, st.view).angle }; },
    get info() {
      if (inner) return { ...inner.info, mode };
      return { mode, webgl: 0, live: false, shown: !!img, still: img ? 'frame' : '', fallback: null, running: false, dirty: false, near: true, turning: false };
    },
    /** a colourway by id (spec.colors): the image swaps to its still, a live render takes its colours */
    setColor(id) {
      if (id === st.color || (id && !colorOf(spec, id) && id !== 'page')) return;
      const before = colorOf(spec, st.color)?.materials, after = colorOf(spec, id)?.materials;
      st.color = id;
      el.dataset.productColorShown = id;
      if (mode === 'live' && inner && !before && !after) { inner.setPalette(palette()); return; }
      clearInner(); show();
    },
    setView(v) { if (typeof v === 'string') resolveView(spec, v); st.view = v; clearInner(); show(); },
    setScene(s) { st.scene = s || null; clearInner(); show(); },
    pause() { inner?.pause(); }, resume() { inner?.resume(); },
    get paused() { return !!inner?.paused; },
    step(on) { if (mode === 'live') inner?.step(on); else { st.on = on == null ? !st.on : !!on; show(); } },
    set(next = {}) { Object.assign(given, next); if (next.size != null) fill = next.size; if (next.angle != null) st.view = { angle: next.angle, elev: next.elev ?? resolveView(spec, st.view).elev }; clearInner(); show(); return api.params; },
    setPalette(p) { if (p !== undefined) opts = { ...opts, palette: p || undefined }; if (mode === 'live' && inner) inner.setPalette(palette()); else show(); },
    /** resolves once the view shows a picture of its own (the image, the still, the live frame or its poster for good) */
    ready() { return shown; },
    release() { inner?.release?.(); },
    pose(o) { inner?.pose?.(o); }, snapshot(p) { return inner?.snapshot ? inner.snapshot(p) : ''; },
    destroy() {
      destroyed = true; token++;
      clearInner(); ro?.disconnect(); clearTimeout(rt);
      el.removeEventListener('click', toggle); el.removeEventListener('keydown', onKey);
      if (img) { if (img._url) URL.revokeObjectURL(img._url); img.remove(); img = null; }
      el.classList.remove('product-render'); el.style.overflow = overflow0;
    },
  };
  show();
  return api;
}
// the lightness of a colour, 0..1 (enough to tell a dark ground from a light one)
function lightOf(hex) { const [r, g, b] = hexRgb(hex || '#ffffff'); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

export default { build, loadProduct, makeProduct, mountProduct, checkSpec, resolveView, viewNames, variantKey, PARTS: Object.keys(PARTS), PROPS: Object.keys(PROPS), MATERIALS: Object.keys(BUILTIN) };
