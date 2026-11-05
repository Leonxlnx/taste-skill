// ridgeline: stacked lines drawn back to front (WebGL, or a 2D canvas without it). Each line is flat at
// the sides and rises into a few clean peaks inside an envelope; it is filled below with the ground, so
// the lines in front really hide the ones behind, in the page's ink, with one line picked out in the
// accent like a highlighted series. The peaks sit on the side away from the calm area (the text).
// The WebGL context is made when the panel first comes into view and given back when it leaves; a lost
// context or a failed shader swaps in a fresh canvas drawn with the 2D path.
import { lifecycle, color, config, rng as makeRng, normalizePalette, resolveParams } from '../fx.js';

const params = {
  lines:      { default: 36,   min: 12,  max: 90,  step: 1 },     // number of lines
  peak:       { default: 0.38, min: 0,   max: 1,   step: 0.01 },  // height of the peaks
  envelope:   { default: 0.35, min: 0.1, max: 1,   step: 0.01 },  // width of the peaked middle
  noiseScale: { default: 2.6,  min: 0.5, max: 8,   step: 0.1 },   // how many peaks along a line
  lineWidth:  { default: 1.2,  min: 0.5, max: 3,   step: 0.1 },   // line width in CSS px
  speed:      { default: 0.03, min: 0,   max: 0.3, step: 0.005 }, // how fast the peaks roll forward
  span:       { default: 0.84, min: 0.3, max: 1,   step: 0.01 },  // share of the width the lines cover
  focus:      { default: 0.5,  min: 0.2, max: 0.8, step: 0.01 },  // where the peaks sit, 0 left .. 1 right
  highlight:  { default: 1,    min: 0,   max: 1,   step: 0.01 },  // one line in the accent (0 for none)
  calm:       { default: 0.8,  min: 0,   max: 1,   step: 0.01 },  // clear the lines where text sits
  calmX:      { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:      { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

// seeded 2D gradient noise, about -0.7..0.7
function makeNoise(seed) {
  const r = makeRng(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Int32Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = new Float64Array(256), gy = new Float64Array(256);
  for (let i = 0; i < 256; i++) { const a = r() * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
  return (x, y) => {
    const xf0 = Math.floor(x), yf0 = Math.floor(y);
    const xf = x - xf0, yf = y - yf0;
    const X = xf0 & 255, Y = yf0 & 255;
    const pY = perm[Y], pY1 = perm[Y + 1];
    const a = perm[X + pY], b = perm[X + 1 + pY], c = perm[X + pY1], d = perm[X + 1 + pY1];
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const na = gx[a] * xf + gy[a] * yf, nb = gx[b] * (xf - 1) + gy[b] * yf;
    const nc = gx[c] * xf + gy[c] * (yf - 1), nd = gx[d] * (xf - 1) + gy[d] * (yf - 1);
    const x1 = na + (nb - na) * u, x2 = nc + (nd - nc) * u;
    return x1 + (x2 - x1) * v;
  };
}

function prepareHost(el, palette) {
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  if (cs.isolation !== 'isolate') el.style.isolation = 'isolate';
  const bg = cs.backgroundColor;
  if (el.dataset.fxOwnBg || !bg || bg === 'transparent' || /rgba\(.*,\s*0\)$/.test(bg)) {
    el.style.backgroundColor = palette.bg;
    el.dataset.fxOwnBg = '1';
    return true;
  }
  return false;
}

// WebGL path: each line is a ground-coloured fill strip (curve down to its base) followed by an
// anti-aliased stroke strip, all in one triangle strip in painter's order, so the GPU does the hiding.
// a_info: x kind (0 fill, 1 stroke), yz position across the stroke (-1..1; a disc at sharp corners
// uses both), w the line's tone (0..1 toward the ink; 2..3 toward the accent). Strokes carry coverage
// only and their colour is pre-mixed with the ground, so where pieces of one line overlap nothing gets
// brighter.
const VS = 'attribute vec2 a_pos; attribute vec4 a_info; uniform vec2 u_res; varying vec4 v_info;' +
  'void main() { vec2 c = a_pos / u_res * 2.0 - 1.0; gl_Position = vec4(c.x, -c.y, 0.0, 1.0); v_info = a_info; }';
const FS = 'precision mediump float; uniform vec3 u_ink, u_ground, u_acc; uniform float u_hw, u_w; varying vec4 v_info;' +
  'void main() { if (v_info.x < 0.5) { gl_FragColor = vec4(u_ground, 1.0); return; }' +
  ' float d = length(v_info.yz) * u_hw;' +
  ' float a = clamp(max(u_w, 1.0) * 0.5 + 0.5 - d, 0.0, 1.0) * min(u_w, 1.0);' +
  ' vec3 c = v_info.w > 1.5 ? mix(u_ground, u_acc, v_info.w - 2.0) : mix(u_ground, u_ink, v_info.w);' +
  ' gl_FragColor = vec4(c * a, a); }';

function makeGL(canvas) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }); } catch (_) { gl = null; }
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.bindAttribLocation(prog, 0, 'a_pos');
  gl.bindAttribLocation(prog, 1, 'a_info');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (!gl.isContextLost()) console.warn('ridgeline: ' + gl.getProgramInfoLog(prog));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
  const u = n => gl.getUniformLocation(prog, n);
  return { gl, prog, buf: gl.createBuffer(), uRes: u('u_res'), uInk: u('u_ink'), uGround: u('u_ground'), uAcc: u('u_acc'), uHw: u('u_hw'), uW: u('u_w') };
}

export default {
  id: 'ridgeline',
  name: 'Ridgeline',
  family: 'pattern',
  params,
  mount(el, { palette, params: given, seed }) {
    let P = normalizePalette(palette);
    let prm = resolveParams(params, given);
    const ownBg = prepareHost(el, P);
    const noise = makeNoise(seed ?? 1);
    const hiPick = makeRng(`ridge-hi:${seed ?? 1}`)();
    // the drawing surface: made when first seen, its WebGL context given back when out of view
    let canvas = null, glr = null, ctx = null, everShown = false;
    let useGL = !config.forceFallback;
    let W = 1, H = 1, dpr = 1, acc = P.accent;
    let xs = null, xn = null, env = null, k0 = 0, k1 = 0, ys = null;
    // shape rows cached by depth: a line's profile depends only on its noise depth z, and every line
    // passes through the same depths as the peaks roll forward, so each row is computed once
    const DZ = 0.05;
    let rows = new Map();
    let vb = new Float32Array(1 << 16), vn = 0, joinNext = false;

    function accent() {
      // the highlight needs to show on the ground: a faint accent is pulled toward the ink
      acc = color.contrast(P.bg, P.accent) >= 2 ? P.accent : color.mix(P.accent, P.ink, 0.55);
    }
    // the peaks lean away from the calm area, so the text keeps the flat ends of the lines
    const focusAt = () => Math.min(0.72, Math.max(0.28, prm.focus + (0.5 - prm.calmX) * 0.36 * prm.calm));
    const envAt = x => { const d = (x - focusAt()) / (prm.envelope * 0.42); return Math.exp(-0.275 * d * d * d * d - 0.3 * d * d); };

    function newCanvas() {
      const c = document.createElement('canvas');
      c.className = 'fx-canvas';
      c.setAttribute('aria-hidden', 'true');
      Object.assign(c.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1',
        pointerEvents: 'none', opacity: everShown ? '1' : '0', transition: 'opacity .5s ease', borderRadius: 'inherit',
      });
      el.insertBefore(c, el.firstChild);
      return c;
    }
    function dropSurface() {
      if (glr) { try { glr.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) { /* gone */ } }
      if (canvas) canvas.remove();
      canvas = null; glr = null; ctx = null;
    }
    function makeSurface() {
      dropSurface();
      canvas = newCanvas();
      if (useGL) {
        glr = makeGL(canvas);
        if (glr) {
          const mine = canvas;
          canvas.addEventListener('webglcontextlost', e => {
            e.preventDefault();
            if (canvas !== mine) return;
            // a lost context: carry on in 2D on a fresh canvas (this canvas can no longer give a 2D context)
            useGL = false;
            setTimeout(() => { if (canvas === mine) { makeSurface(); fit(); lc.redraw(); } }, 0);
          });
        } else {
          // the shader failed: the canvas already holds a WebGL context, so 2D needs a fresh one
          useGL = false;
          canvas.remove();
          canvas = newCanvas();
        }
      }
      if (!glr) ctx = canvas.getContext('2d');
      applyMask();
    }

    function fit() {
      dpr = Math.min(window.devicePixelRatio || 1, useGL ? config.maxDpr : Math.min(1.5, config.maxDpr));
      const w = Math.max(1, Math.round(el.clientWidth * dpr)), h = Math.max(1, Math.round(el.clientHeight * dpr));
      if (canvas && (w !== canvas.width || h !== canvas.height)) { canvas.width = w; canvas.height = h; }
      if (w !== W || h !== H || !xs) { W = w; H = h; layout(); } else applyMask();
    }
    // x samples shared by every line: dense inside the peaked middle, sparse on the flat sides
    function layout() {
      const xL = W * (0.5 - prm.span / 2), xR = W * (0.5 + prm.span / 2);
      const fine = (3 * dpr) / Math.max(1, xR - xL), coarse = (26 * dpr) / Math.max(1, xR - xL);
      const pts = [];
      for (let x = 0; x < 1; x += envAt(x) > 0.004 ? fine : coarse) pts.push(x);
      pts.push(1);
      const n = pts.length;
      xn = Float32Array.from(pts);
      xs = new Float32Array(n);
      env = new Float32Array(n);
      ys = new Float32Array(n);
      k0 = n; k1 = 0;
      for (let k = 0; k < n; k++) {
        xs[k] = xL + (xR - xL) * xn[k];
        env[k] = envAt(xn[k]);
        if (env[k] > 0.004) { k0 = Math.min(k0, k); k1 = k; }
      }
      k0 = Math.max(0, k0 - 1); k1 = Math.min(n - 1, k1 + 1);
      rows = new Map();
      applyMask();
    }
    // the line ends fade and the calm area clears through a CSS mask, so no gradient is painted each frame
    function applyMask() {
      if (!canvas) return;
      const l = (0.5 - prm.span / 2) * 100, r = (0.5 + prm.span / 2) * 100, f = prm.span * 5;
      const lin = `linear-gradient(to right, transparent ${l}%, #000 ${l + f}%, #000 ${r - f}%, transparent ${r}%)`;
      let img = lin;
      if (prm.calm > 0) {
        const R = (0.3 + 0.36 * prm.calm) * el.clientHeight;
        const a = Math.min(1, prm.calm * 1.25);
        const stops = [0, 0.35, 0.5, 0.65, 0.8, 1].map(q => {
          const k = q <= 0.35 ? 1 : 1 - (q - 0.35) / 0.65;
          return `rgba(0,0,0,${(1 - a * k * k * (3 - 2 * k)).toFixed(3)}) ${(q * 100).toFixed(0)}%`;
        }).join(', ');
        img = `${lin}, radial-gradient(circle ${R.toFixed(1)}px at ${prm.calmX * 100}% ${prm.calmY * 100}%, ${stops})`;
      }
      const st = canvas.style;
      st.maskImage = st.webkitMaskImage = img;
      st.maskComposite = 'intersect';
      st.webkitMaskComposite = 'source-in';
      st.maskRepeat = st.webkitMaskRepeat = 'no-repeat';
    }
    const fbm = (x, y) => noise(x, y) + 0.5 * noise(x * 2.03 + 17.1, y * 1.7 + 3.3);
    // one row: for every x sample, the peak shape v and the small wobble s at depth q * DZ
    function row(q) {
      let r = rows.get(q);
      if (r) return r;
      const m = xn.length, z = q * DZ, ns = prm.noiseScale * 2.6;
      r = new Float32Array(m * 2);
      for (let k = 0; k < m; k++) {
        const x = xn[k] * ns;
        if (env[k] <= 0.004) { r[2 * k + 1] = noise(x, z); continue; }
        const s = fbm(x, z);
        // smooth swells, a few narrow ridged spikes where a second noise crosses zero, a little grain
        let v = Math.max(0, s + 0.18);
        v = v * v * 1.7;
        // a smooth absolute value: the tips stay sharp but are never true cusps
        const nn = noise(x * 1.2 + 33.1, z * 1.1 + 5.3) * 1.45;
        const rn = 1 - Math.sqrt(nn * nn + 0.0025);
        v += rn * rn * rn * rn * rn * rn * 0.45 * (0.3 + Math.max(0, s + 0.3));
        v += noise(x * 4.3 + 91.7, z * 2.2) * 0.022;
        r[2 * k] = v;
        r[2 * k + 1] = s;
      }
      rows.set(q, r);
      return r;
    }

    /* ---- WebGL path ---- */
    function vert(x, y, kind, ax, ay, tone) {
      if (vn + 18 > vb.length) { const nb = new Float32Array(vb.length * 2); nb.set(vb); vb = nb; }
      if (joinNext) {
        // a degenerate pair links this strip to the previous one
        if (vn >= 6) { for (let i = 0; i < 6; i++) vb[vn + i] = vb[vn - 6 + i]; vn += 6; }
        vb[vn++] = x; vb[vn++] = y; vb[vn++] = kind; vb[vn++] = ax; vb[vn++] = ay; vb[vn++] = tone;
        joinNext = false;
      }
      vb[vn++] = x; vb[vn++] = y; vb[vn++] = kind; vb[vn++] = ax; vb[vn++] = ay; vb[vn++] = tone;
    }
    function glLine(base, lw, tone) {
      const hw = lw / 2 + 1;
      const m = xs.length;
      joinNext = vn > 0;
      for (let k = k0; k <= k1; k++) { vert(xs[k], ys[k], 0, 0, 0, 0); vert(xs[k], base + lw * 1.5, 0, 0, 0, 0); }
      joinNext = true;
      const pair = (k, nx, ny) => {
        vert(xs[k] + nx * hw, ys[k] + ny * hw, 1, 1, 0, tone);
        vert(xs[k] - nx * hw, ys[k] - ny * hw, 1, -1, 0, tone);
      };
      for (let k = 0; k < m; k++) {
        // directions of the segments into and out of this point
        let ix = 0, iy = 0, ox = 0, oy = 0;
        if (k > 0) { ix = xs[k] - xs[k - 1]; iy = ys[k] - ys[k - 1]; const l = Math.hypot(ix, iy) || 1; ix /= l; iy /= l; }
        if (k < m - 1) { ox = xs[k + 1] - xs[k]; oy = ys[k + 1] - ys[k]; const l = Math.hypot(ox, oy) || 1; ox /= l; oy /= l; }
        if (k === 0) { ix = ox; iy = oy; }
        if (k === m - 1) { ox = ix; oy = iy; }
        if (ix * ox + iy * oy < 0.3) {
          // a sharp corner (a peak's tip): end the strip square to the way in, put a round dot on the
          // corner, and start again square to the way out, so no miter folds over itself
          pair(k, -iy, ix);
          joinNext = true;
          const x = xs[k], y = ys[k];
          vert(x - hw, y - hw, 1, -1, -1, tone); vert(x + hw, y - hw, 1, 1, -1, tone);
          vert(x - hw, y + hw, 1, -1, 1, tone); vert(x + hw, y + hw, 1, 1, 1, tone);
          joinNext = true;
          pair(k, -oy, ox);
        } else {
          // a gentle bend: a short miter keeps the width even
          let tx = ix + ox, ty = iy + oy;
          const tl = Math.hypot(tx, ty) || 1;
          tx /= tl; ty /= tl;
          const sc = 1 / Math.max(0.6, tx * ix + ty * iy);
          pair(k, -ty * sc, tx * sc);
        }
      }
    }
    function glFlush(lw) {
      const g = glr.gl;
      if (g.isContextLost()) return;
      g.viewport(0, 0, canvas.width, canvas.height);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.useProgram(glr.prog);
      g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
      g.bindBuffer(g.ARRAY_BUFFER, glr.buf);
      g.bufferData(g.ARRAY_BUFFER, vb.subarray(0, vn), g.DYNAMIC_DRAW);
      g.enableVertexAttribArray(0);
      g.vertexAttribPointer(0, 2, g.FLOAT, false, 24, 0);
      g.enableVertexAttribArray(1);
      g.vertexAttribPointer(1, 4, g.FLOAT, false, 24, 8);
      g.uniform2f(glr.uRes, canvas.width, canvas.height);
      g.uniform3fv(glr.uInk, color.rgb(P.ink));
      g.uniform3fv(glr.uGround, color.rgb(P.bg));
      g.uniform3fv(glr.uAcc, color.rgb(acc));
      g.uniform1f(glr.uHw, lw / 2 + 1);
      g.uniform1f(glr.uW, lw);
      g.drawArrays(g.TRIANGLE_STRIP, 0, vn / 6);
    }
    /* ---- canvas 2D path (no WebGL) ---- */
    function ctxLine(base, lw, alpha, hi) {
      const m = xs.length;
      ctx.beginPath();
      ctx.moveTo(xs[k0], ys[k0]);
      for (let k = k0 + 1; k <= k1; k++) ctx.lineTo(xs[k], ys[k]);
      ctx.lineTo(xs[k1], base + lw * 1.5);
      ctx.lineTo(xs[k0], base + lw * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(xs[0], ys[0]);
      for (let k = 1; k < m; k++) ctx.lineTo(xs[k], ys[k]);
      ctx.globalAlpha = hi > 0 ? 1 : alpha;
      ctx.strokeStyle = hi > 0 ? color.mix(P.ink, acc, hi) : P.ink;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function draw(t) {
      if (!canvas || !xs) return;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      const n = prm.lines;
      const rise = prm.peak * H * 0.52;
      const top = H * 0.1 + rise * 0.62, bottom = H * 0.9;
      const gap = (bottom - top) / Math.max(1, n - 1);
      const lw0 = prm.lineWidth * dpr;
      const tt = t * prm.speed * 9;
      const m = xs.length;
      // the highlighted line: one in the front half
      const hiLine = prm.highlight > 0 ? Math.round(n * (0.55 + 0.25 * hiPick)) : -1;
      if (glr) vn = 0;
      else if (ctx) {
        ctx.clearRect(0, 0, W, H);
        ctx.lineJoin = 'bevel';
        ctx.lineCap = 'butt';
        ctx.fillStyle = P.bg;
      } else return;
      for (let i = 0; i < n; i++) {
        const base = top + i * gap;
        const z = i * 0.26 - tt;
        const room = Math.max(gap * 2, base - H * 0.04);
        // some lines carry a stronger signal than others
        const gain = 0.4 + 0.8 * Math.max(0, Math.min(1, 0.5 + 1.3 * noise(i * 0.09 + 40.3, tt * 0.22 + 7.1)));
        const zq = z / DZ, q = Math.floor(zq), f = zq - q;
        const ra = row(q), rb = row(q + 1);
        for (let k = 0; k < m; k++) {
          const v = ra[2 * k] + (rb[2 * k] - ra[2 * k]) * f;
          const w = ra[2 * k + 1] + (rb[2 * k + 1] - ra[2 * k + 1]) * f;
          // peaks ease off as they near the top edge, so the back lines never leave the frame
          const up = rise * gain * env[k] * v + rise * 0.006 * w;
          ys[k] = base - (up > 0 ? room * (1 - Math.exp(-up / room)) : up);
        }
        const alpha = 0.66 + 0.34 * (i / Math.max(1, n - 1));
        const hi = i === hiLine ? prm.highlight : 0;
        const lw = hi > 0 ? lw0 * (1 + 0.4 * hi) : lw0;
        if (glr) glLine(base, lw, hi > 0 ? 2 + hi : alpha);
        else { ctx.lineWidth = lw; ctxLine(base, lw, alpha, hi); }
      }
      if (glr) glFlush(lw0);
      const qLo = Math.floor(-tt / DZ) - 2, qHi = Math.ceil(((n - 1) * 0.26 - tt) / DZ) + 3;
      if (rows.size > (qHi - qLo) + 40) for (const q of rows.keys()) if (q < qLo || q > qHi) rows.delete(q);
      if (!everShown) { everShown = true; canvas.style.opacity = '1'; }
    }

    accent();
    const lc = lifecycle(el, {
      draw, still: 6, fps: 60,
      onShow() { if (!canvas) { makeSurface(); fit(); } },
      // out of view: give the WebGL context back (pages with many panels never hold them all)
      onHide() { if (glr) dropSurface(); },
    });
    const ro = new ResizeObserver(() => { fit(); lc.redraw(); });
    ro.observe(el);
    fit();

    return {
      pause: () => lc.pause(),
      resume: () => lc.resume(),
      redraw: () => lc.redraw(),
      set(next) { prm = resolveParams(params, { ...prm, ...next }); layout(); lc.redraw(); return prm; },
      setPalette(p) { P = normalizePalette(p); accent(); if (ownBg) el.style.backgroundColor = P.bg; lc.redraw(); },
      destroy() {
        lc.destroy();
        ro.disconnect();
        dropSurface();
        if (ownBg) el.style.backgroundColor = P.bg;
      },
      get canvas() { return canvas; },
      get info() { return { webgl: glr ? 1 : 0, canvas: canvas ? (glr ? 'webgl' : '2d') : null, fallback: glr || !canvas ? null : '2d', scale: 1, dpr, size: canvas ? [canvas.width, canvas.height] : null, running: lc.running }; },
    };
  },
};
