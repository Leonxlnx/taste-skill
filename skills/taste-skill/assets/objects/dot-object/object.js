/*
  dot-object - a real object rebuilt from dots. The object is cut out of a photograph taken on a plain
  ground (the ground, even a graded one, is modelled from the photograph's border and left out), and
  each dot takes the tone of the photograph where it sits, so the dots draw the object's form and not
  only its outline. Pass the client's own product shot on a plain ground.

  It is still at rest: the finished object, drawn once. Hover: under the pointer the dots take the
  photograph's own colour and swell until they almost touch, like a loupe over a print, so the real
  object shows through the dots; it eases back when the pointer leaves. Touch: the same under the
  finger.

  src: a photograph (a path, a URL, a photos.json or library entry) of one object on a plain ground
  that differs from it in lightness or colour. params: gap (CSS px between dots, default from the panel
  size), fit (share of the panel the object fills, default 0.78), threshold (0..1, how far from the
  ground colour counts as the object, default 0.5), radius (loupe radius in CSS px), focus ([x, y]
  for the fallback crop), alt.
*/
import { stage, tones, photoURL, loadImage, pixels, fallbackImage, clamp, approach, paletteOf } from '../_scenes/kit.js';

// a test picture with a ground that cuts out cleanly (bright petals on black); never shipped as a client's
export const DEFAULT_PHOTO = {
  id: 'commons-minimal-yellow-tulip', source: 'commons', ratio: 1.5, width: 4652, focus: [0.32, 0.5],
  alt: 'A yellow tulip streaked with red, on a black ground',
  by: 'Alistair Dent', licence: 'CC0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Minimal_yellow_tulip_%28Unsplash%29.jpg',
  page: 'https://commons.wikimedia.org/wiki/File:Minimal_yellow_tulip_(Unsplash).jpg',
};

const vert = /* glsl */ `
in vec2 a_pos;
in vec4 a_data;          // radius (CSS px), photograph colour rgb
uniform vec2 u_view;
uniform vec3 u_ptr;      // pointer x, y (CSS px), loupe amount 0..1
uniform float u_dpr, u_rad, u_gap;
out vec3 v_col;
out float v_r;
out float v_k;
void main() {
  vec2 p = a_pos / u_view * 2.0 - 1.0;
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  float d = distance(a_pos, u_ptr.xy);
  float k = u_ptr.z * (1.0 - smoothstep(u_rad * 0.45, u_rad, d));
  float r = mix(a_data.x, u_gap * 0.56, k * 0.85);
  v_r = r * u_dpr;
  v_k = k;
  v_col = a_data.yzw;
  gl_PointSize = max(1.0, r * 2.0 * u_dpr + 2.0);
}
`;
const frag = /* glsl */ `
uniform vec3 u_ink;
in vec3 v_col;
in float v_r;
in float v_k;
void main() {
  float size = v_r * 2.0 + 2.0;
  vec2 pc = (gl_PointCoord - 0.5) * size;
  float a = 1.0 - smoothstep(v_r - 0.7, v_r + 0.7, length(pc));
  if (a <= 0.0) discard;
  vec3 c = mix(u_ink, v_col, v_k);
  fxColor = vec4(c * a, a);
}
`;

// OKLab of an 8-bit sRGB pixel
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const LUT = new Float32Array(256).map((_, i) => lin(i));
function oklab(r, g, b) {
  r = LUT[r]; g = LUT[g]; b = LUT[b];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

/** cut the object out of its ground: { w, h, mask (0..1), tone (lightness 0..1), rgb, box: [x0, y0, x1, y1] } */
export function cutOut(img, threshold = 0.5) {
  const { data, width: w, height: h } = pixels(img, 360);
  const n = w * h, L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0; i < n; i++) { const o = oklab(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]); L[i] = o[0]; A[i] = o[1]; B[i] = o[2]; }
  const blur = (src, r) => {
    const tmp = new Float32Array(n), out = new Float32Array(n);
    for (let y = 0; y < h; y++) { let acc = 0; for (let x = -r; x <= r; x++) acc += src[y * w + clamp(x, 0, w - 1)]; for (let x = 0; x < w; x++) { tmp[y * w + x] = acc / (2 * r + 1); acc += src[y * w + clamp(x + r + 1, 0, w - 1)] - src[y * w + clamp(x - r, 0, w - 1)]; } }
    for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { out[y * w + x] = acc / (2 * r + 1); acc += tmp[clamp(y + r + 1, 0, h - 1) * w + x] - tmp[clamp(y - r, 0, h - 1) * w + x]; } }
    return out;
  };
  const ring = [], m = Math.max(2, Math.round(Math.min(w, h) * 0.03));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x < m || y < m || x >= w - m || y >= h - m) ring.push(y * w + x);
  const med = arr => { const s = Float32Array.from(arr).sort(); return s[s.length >> 1]; };
  // a cut-out with a clear ground (a PNG): its alpha is the mask
  const clear = ring.filter(i => data[i * 4 + 3] < 16).length;
  const gL = med(ring.map(i => L[i]));
  if (clear > ring.length * 0.3) return finish(Float32Array.from({ length: n }, (_, i) => data[i * 4 + 3] / 255));
  // the ground: border pixels near the border's median colour (an object that runs off the edge is
  // not ground), modelled as a smooth surface: a Coons patch over the four borders, each border a
  // running median, so a backdrop that is lighter at the top or vignetted is still ground
  const gA = med(ring.map(i => A[i])), gB = med(ring.map(i => B[i]));
  const off = i => Math.hypot(L[i] - gL, A[i] - gA, B[i] - gB);
  const inlier = Math.max(0.05, med(ring.map(off)) * 3);
  const strip = (len, at) => {
    const raw = Array.from({ length: len }, (_, k) => at(k));
    const r = Math.max(3, Math.round(len * 0.12)), out = new Float32Array(len).fill(NaN);
    for (let k = 0; k < len; k++) {
      const win = raw.slice(Math.max(0, k - r), Math.min(len, k + r + 1)).filter(v => v === v);
      if (win.length) out[k] = med(win);
    }
    // a stretch with no ground at all takes its nearest neighbour's
    for (let k = 1; k < len; k++) if (out[k] !== out[k] && out[k - 1] === out[k - 1]) out[k] = out[k - 1];
    for (let k = len - 2; k >= 0; k--) if (out[k] !== out[k] && out[k + 1] === out[k + 1]) out[k] = out[k + 1];
    return out.map(v => (v === v ? v : 0));
  };
  const edge = (ch, idx) => { const v = idx.filter(i => off(i) < inlier).map(i => ch[i]); return v.length ? med(v) : NaN; };
  const G = [L, A, B].map((ch, c) => {
    const base = [gL, gA, gB][c];
    const fix = arr => (arr.every(v => v === 0) ? arr.fill(base) : arr);
    const top = fix(strip(w, x => edge(ch, Array.from({ length: m }, (_, j) => j * w + x))));
    const bot = fix(strip(w, x => edge(ch, Array.from({ length: m }, (_, j) => (h - 1 - j) * w + x))));
    const lef = fix(strip(h, y => edge(ch, Array.from({ length: m }, (_, j) => y * w + j))));
    const rig = fix(strip(h, y => edge(ch, Array.from({ length: m }, (_, j) => y * w + w - 1 - j))));
    const g = new Float32Array(n);
    const c00 = (top[0] + lef[0]) / 2, c10 = (top[w - 1] + rig[0]) / 2, c01 = (bot[0] + lef[h - 1]) / 2, c11 = (bot[w - 1] + rig[h - 1]) / 2;
    for (let y = 0; y < h; y++) {
      const v = y / (h - 1);
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1);
        g[y * w + x] = (1 - v) * top[x] + v * bot[x] + (1 - u) * lef[y] + u * rig[y]
          - ((1 - u) * (1 - v) * c00 + u * (1 - v) * c10 + (1 - u) * v * c01 + u * v * c11);
      }
    }
    return g;
  });
  // a shadow on the ground keeps its hue and is only darker, so darker-than-ground counts for less
  // and chroma is compared relative to lightness; the object differs in lightness or in hue
  const dist = i => {
    const gl = G[0][i], gLs = Math.max(gl, 0.05), li = Math.max(L[i], 0.05);
    const dl = L[i] > gl ? (L[i] - gl) * 0.9 : (gl - L[i]) * 0.2;
    return Math.hypot(dl, (A[i] / li - G[1][i] / gLs) * gLs * 1.6, (B[i] / li - G[2][i] / gLs) * gLs * 1.6);
  };
  // spread of the ground, so a graded backdrop is still ground
  const spread = med(ring.map(dist));
  const t0 = 0.05 + spread * 2 + (threshold - 0.5) * 0.08, t1 = t0 + 0.06;
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) raw[i] = clamp((dist(i) - t0) / (t1 - t0), 0, 1);
  // close small gaps (box blur) and fill holes: ground is what the border can reach
  // close small gaps and fill holes: ground is what the border can reach
  const closed = blur(raw, 2);
  const ground = new Uint8Array(n), stack = [];
  for (const i of ring) if (closed[i] < 0.45) { ground[i] = 1; stack.push(i); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
      if (j >= 0 && !ground[j] && closed[j] < 0.45) { ground[j] = 1; stack.push(j); }
    }
  }
  return finish(Float32Array.from(ground, g => 1 - g));

  // the object's box, a softened mask and the tone (lightness with a little local contrast)
  function finish(mask) {
  let x0 = w, y0 = h, x1 = 0, y1 = 0, area = 0;
  for (let i = 0; i < n; i++) {
    if (mask[i] > 0.5) { const x = i % w, y = (i / w) | 0; area++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const soft = blur(mask, 1);
  const sm = blur(L, 1), wide = blur(L, 6), tone = new Float32Array(n);
  for (let i = 0; i < n; i++) tone[i] = sm[i] + 0.9 * (sm[i] - wide[i]);
  if (area < n * 0.01) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  // the object's own tonal range (4% and 96% inside the mask), so an object of one middle tone (an
  // orange flower, a grey device) still prints its form, not an even disc of dots
  const inside = [];
  for (let i = 0; i < n; i++) if (mask[i] > 0.5) inside.push(tone[i]);
  inside.sort((a, b) => a - b);
  let lo = inside.length ? inside[Math.floor(inside.length * 0.04)] : 0.15, hi = inside.length ? inside[Math.floor(inside.length * 0.96)] : 0.95;
  if (hi - lo < 0.3) { const m = (hi + lo) / 2; lo = m - 0.15; hi = m + 0.15; }
  return { w, h, mask: soft, tone, rgb: data, ground: gL, box: [x0, y0, x1 + 1, y1 + 1], levels: [lo, hi] };
  }
}

export default {
  id: 'dot-object',
  name: 'Dot object',
  kind: 'scene',
  mount(el, { palette, src, params = {} } = {}) {
    const photo = src || DEFAULT_PHOTO;
    const alt = params.alt || photo.alt || '';
    let given = palette || null;
    let T = tones(paletteOf(el, given));
    let cut = null, prog = null, buf = null;
    let N = 0, data = null, built = '', gap = 6, hover = 0, px = 0, py = 0;
    const url = photoURL(photo, 960);
    let resolveReady;
    const ready = new Promise(r => (resolveReady = r));

    function build(st) {
      if (!cut) return;
      const key = `${st.cssW}x${st.cssH}:${T.dark}`;
      if (key === built) return;
      built = key;
      const W = st.cssW, H = st.cssH;
      gap = params.gap || clamp(Math.min(W, H) / 100, 4.2, 7.5);
      const [bx0, by0, bx1, by1] = cut.box;
      const bw = bx1 - bx0, bh = by1 - by0;
      const fit = params.fit ?? 0.78;
      const sc = Math.min((W * fit) / bw, (H * fit) / bh);
      const ox = (W - bw * sc) / 2 - bx0 * sc, oy = (H - bh * sc) / 2 - by0 * sc;
      const pts = [];
      const rowH = gap * 0.866;
      const sample = (arr, x, y) => {
        x = clamp(x, 0, cut.w - 1.001); y = clamp(y, 0, cut.h - 1.001);
        const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, i = yi * cut.w + xi;
        return (arr[i] * (1 - fx) + arr[i + 1] * fx) * (1 - fy) + (arr[i + cut.w] * (1 - fx) + arr[i + cut.w + 1] * fx) * fy;
      };
      const lo = cut.box, [Lmin, Lmax] = cut.levels;
      for (let row = 0, y = rowH / 2; y < H; row++, y += rowH) {
        for (let x = (row % 2 ? gap / 2 : 0) + gap / 2; x < W; x += gap) {
          const ix = (x - ox) / sc, iy = (y - oy) / sc;
          if (ix < lo[0] - 2 || iy < lo[1] - 2 || ix > lo[2] + 2 || iy > lo[3] + 2) continue;
          const mk = sample(cut.mask, ix, iy);
          if (mk < 0.5) continue;
          const l = clamp((sample(cut.tone, ix, iy) - Lmin) / (Lmax - Lmin), 0, 1);
          const w = T.dark ? 0.3 + 0.7 * l : 0.2 + 0.8 * (1 - l);
          const o = (clamp(Math.round(iy), 0, cut.h - 1) * cut.w + clamp(Math.round(ix), 0, cut.w - 1)) * 4;
          pts.push(x, y, gap * 0.5 * 0.94 * Math.sqrt(w) * clamp((mk - 0.5) * 3, 0.35, 1), cut.rgb[o] / 255, cut.rgb[o + 1] / 255, cut.rgb[o + 2] / 255);
        }
      }
      N = pts.length / 6;
      data = new Float32Array(pts);
      if (st.gl) upload(st);
    }
    function upload(st) {
      const gl = st.gl;
      if (!buf) buf = st.buffer(data || new Float32Array(6), gl.STATIC_DRAW);
      else { gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); }
    }

    let s;
    loadImage(url).then(im => {
      cut = cutOut(im, params.threshold ?? 0.5);
      if (s) { built = ''; if (s.gl) build(s); s.redraw(); }
      resolveReady();
    }).catch(err => { console.warn(err.message); s?.fail(); resolveReady(); });

    s = stage(el, {
      name: 'dots',
      alpha: false,
      init(gl, st) { prog = st.program(frag, vert); buf = null; built = ''; },
      resize() { built = ''; },
      loaded: () => !!cut,
      ready: () => N > 0,
      frame(gl, t, dt, st) {
        const P = st.pointer;
        const want = P.inside ? 1 : 0;
        const before = hover;
        hover = st.reduced || dt === 0 ? want : approach(hover, want, 7, dt);
        if (Math.abs(hover - want) < 0.002) hover = want;
        // the loupe follows the pointer a little behind it
        const nx = P.inside ? P.x : px, ny = P.inside ? P.y : py;
        const mx = dt > 0 && hover > 0.01 && before > 0.01 ? approach(px, nx, 18, dt) : nx, my = dt > 0 && hover > 0.01 && before > 0.01 ? approach(py, ny, 18, dt) : ny;
        const moved = Math.abs(mx - px) > 0.05 || Math.abs(my - py) > 0.05 || hover !== before;
        px = mx; py = my;
        build(st);
        if (!N || !buf) return;
        if (dt > 0 && !st.dirty && !moved) return;
        const bg = T.r[0];
        gl.clearColor(bg[0], bg[1], bg[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const W = st.cssW, H = st.cssH;
        const R = params.radius || clamp(Math.min(W, H) * 0.2, 70, 150);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        prog.use();
        prog.set('u_view', [W, H]).set('u_dpr', st.w / W).set('u_ink', T.r[3]).set('u_res', [st.w, st.h])
          .set('u_ptr', [px, py, hover]).set('u_rad', R).set('u_gap', gap);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        const ld = prog.attrib('a_data');
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(ld);
        gl.vertexAttribPointer(ld, 4, gl.FLOAT, false, 24, 8);
        gl.drawArrays(gl.POINTS, 0, N);
        gl.disableVertexAttribArray(ld);
        gl.disable(gl.BLEND);
      },
      fallback: () => fallbackImage(url, alt, 'cover', params.focus || photo.focus || [0.5, 0.5]),
    });
    if (alt) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', alt); }
    el.style.touchAction = 'pan-y';
    return {
      ready,
      destroy() { s.destroy(); },
      pause: () => s.pause(),
      resume: () => s.resume(),
      setPalette(p) { if (p !== undefined) given = p; T = tones(paletteOf(el, given)); built = ''; s.redraw(); },
    };
  },
};
