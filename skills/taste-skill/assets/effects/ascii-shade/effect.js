// ascii-shade: a slow form (a lit, turning sphere, a bounded cloud or a wave) drawn only in monospace
// characters in the page's mono font: sparse marks where the form is faint, dense ones where it is strong.
// Canvas 2D: the ramp is baked once into a glyph atlas, the form is worked out on a half-resolution grid
// and interpolated, a per-cell Bayer offset keeps equal tones from making identical rows, and only cells
// whose glyph changed are redrawn.
import { lifecycle, color, normalizePalette, paletteKind, resolveParams, hashSeed, rng, config, grainCSS } from '../fx.js';

const params = {
  cell:   { default: 12,   min: 9,   max: 20,  step: 1 },     // line height of a cell in CSS px
  source: { default: 1,    min: 0,   max: 2,   step: 1 },     // 0 cloud, 1 sphere, 2 wave across the frame
  ramp:   { default: 0,    min: 0,   max: 2,   step: 1 },     // 0 " .,:;+*o%#@", 1 " .,:;ox%#@", 2 " .:01"
  speed:  { default: 0.08, min: 0,   max: 0.5, step: 0.01 },  // slow, so glyphs change rarely
  scale:  { default: 0.5,  min: 0,   max: 1,   step: 0.01 },  // size of the form
  fill:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 },  // how much of the panel the form covers
  accent: { default: 0.05, min: 0,   max: 0.2, step: 0.01 },  // share of the strong cells drawn in the accent
  calm:   { default: 0.6,  min: 0,   max: 1,   step: 0.01 },  // empty area where text sits
  calmX:  { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:  { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

// no horizontal marks (- = _), which join into stripes across a row
const RAMPS = [' .,:;+*o%#@', ' .,:;ox%#@', ' .:01'];
// the page's mono font first (readMono); otherwise Google Fonts monos if the page loaded one, then the generic mono
const MONO = '"Geist Mono", "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* ---------------------------------------------------------------- noise (seeded gradient noise) */

function makeNoise(seed) {
  const r = rng(seed + 11);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const gx = new Float32Array(256), gy = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const a = r() * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const a = perm[X + perm[Y]], b = perm[X + 1 + perm[Y]], c = perm[X + perm[Y + 1]], d = perm[X + 1 + perm[Y + 1]];
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const n00 = gx[a] * xf + gy[a] * yf, n10 = gx[b] * (xf - 1) + gy[b] * yf;
    const n01 = gx[c] * xf + gy[c] * (yf - 1), n11 = gx[d] * (xf - 1) + gy[d] * (yf - 1);
    const top = n00 + (n10 - n00) * u, bot = n01 + (n11 - n01) * u;
    return top + (bot - top) * v;
  };
  const fbm = (x, y) => {
    let s = noise(x, y);
    const x2 = 1.6 * x + 1.2 * y + 11.3, y2 = -1.2 * x + 1.6 * y + 11.3;
    s += 0.5 * noise(x2, y2);
    s += 0.25 * noise(1.6 * x2 + 1.2 * y2 + 7.7, -1.2 * x2 + 1.6 * y2 + 7.7);
    return s / 1.2;
  };
  return { noise, fbm };
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// 4x4 Bayer threshold, 0..1
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const hash2 = (x, y, s) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/* ---------------------------------------------------------------- colours */

function tones(P, n) {
  const { bg, ink, accent } = P;
  const kind = paletteKind(P);
  // the accent must read on the ground; otherwise a stronger tint of the ink takes its place
  const acc = color.contrast(bg, accent) >= 2.2 ? accent : color.mix(ink, accent, 0.5);
  const lo = kind === 'light' ? 0.25 : 0.3;
  const ramp = [];
  for (let i = 0; i < n; i++) {
    const k = n > 1 ? i / (n - 1) : 1;
    // sparse glyphs soft, dense ones full ink: depth without a second hue
    ramp.push(color.mix(bg, ink, lo + (1 - lo) * Math.pow(k, 0.85)));
  }
  return { ground: bg, ramp, accent: color.saturate(acc, 1.05) };
}

function fallbackCSS(P, prm) {
  const T = tones(P, 6);
  const x = Math.round((1 - prm.calmX) * 30 + 35), y = 50;
  // a still disc of dots: a dot grid, covered by the ground outside a circle
  return `radial-gradient(circle at ${x}% ${y}%, transparent 0 30%, ${P.bg} 36%), radial-gradient(circle at 38% 34%, ${color.mix(P.bg, T.ramp[5], 0.5)}, transparent 26%), ${grainCSS(0.03)}, radial-gradient(${T.ramp[3]} 0.8px, transparent 1.3px) 0 0 / 8px 12px, ${P.bg}`;
}

/* ---------------------------------------------------------------- effect */

function readMono(el) {
  const cs = getComputedStyle(el);
  for (const n of ['--fx-mono', '--font-mono', '--mono', '--font-code']) {
    const v = cs.getPropertyValue(n).trim();
    if (v) return `${v}, ${MONO}`;
  }
  return MONO;
}

function mountAscii(el, { palette, params: given, seed }) {
  let prm = resolveParams(params, given);
  let pal = normalizePalette(palette);
  const sd = hashSeed(seed ?? 1);
  const N = makeNoise(sd);
  const R = rng(sd);
  const jitter = [R(), R(), R(), R()];

  // host: a positioned, isolated box with the ground colour behind the canvas
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  if (cs.isolation !== 'isolate') el.style.isolation = 'isolate';
  const bgNow = cs.backgroundColor;
  const ownBg = !!el.dataset.fxOwnBg || !bgNow || bgNow === 'transparent' || /rgba\(.*,\s*0\)$/.test(bgNow);
  if (ownBg) { el.style.backgroundColor = pal.bg; el.dataset.fxOwnBg = '1'; }

  const canvas = document.createElement('canvas');
  const g = config.forceFallback ? null : canvas.getContext('2d', { alpha: false });
  // no canvas (or forced for testing): a still CSS stand-in
  if (!g) {
    el.style.background = fallbackCSS(pal, prm);
    el.dataset.fxFallback = config.forceFallback ? 'forced' : 'no-canvas';
    const off = () => { el.style.background = ''; delete el.dataset.fxFallback; if (ownBg) el.style.backgroundColor = pal.bg; };
    return {
      pause() {}, resume() {}, redraw() {},
      set(next) { prm = resolveParams(params, { ...prm, ...next }); el.style.background = fallbackCSS(pal, prm); return prm; },
      setPalette(p) { pal = normalizePalette(p); el.style.background = fallbackCSS(pal, prm); },
      destroy: off,
      get canvas() { return null; },
      get info() { return { webgl: 0, canvas: null, fallback: el.dataset.fxFallback || null, scale: 1, dpr: 1, size: null, running: false }; },
    };
  }
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1',
    pointerEvents: 'none', opacity: '0', transition: 'opacity .5s ease', borderRadius: 'inherit',
  });
  el.insertBefore(canvas, el.firstChild);

  let W = 0, H = 0, dpr = 1, cw = 8, ch = 12, cols = 0, rows = 0, ox = 0, oy = 0, n = 10;
  let fcols = 0, frows = 0, coarse = null;
  let atlas = null, cur = null, state = null, tone = null, shown = false, family = MONO;

  function buildAtlas() {
    const chars = RAMPS[prm.ramp | 0] || RAMPS[0];
    const fontPx = prm.cell * 0.86 * dpr;
    const font = `500 ${fontPx}px ${family}`;
    const m = document.createElement('canvas').getContext('2d');
    m.font = font;
    const mM = m.measureText('M');
    // a little air between glyphs, so each reads as a mark rather than merging into lines
    cw = Math.max(2, Math.round(Math.max(mM.width * 1.22, prm.cell * 0.66 * dpr)));
    ch = Math.max(4, Math.round(prm.cell * dpr));
    // order the ramp by the ink each glyph really puts down in this font
    const probe = document.createElement('canvas');
    probe.width = cw; probe.height = ch;
    const pg = probe.getContext('2d', { willReadFrequently: true });
    const base = Math.round((ch + (mM.actualBoundingBoxAscent || fontPx * 0.7)) / 2);
    const cover = [...chars].map(c => {
      pg.fillStyle = '#000'; pg.fillRect(0, 0, cw, ch);
      pg.fillStyle = '#fff'; pg.font = font; pg.textAlign = 'center'; pg.textBaseline = 'alphabetic';
      pg.fillText(c, cw / 2, base);
      const d = pg.getImageData(0, 0, cw, ch).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 4) s += d[i];
      return { c, s };
    });
    const glyphs = [' ', ...cover.filter(x => x.c !== ' ').sort((a, b) => a.s - b.s).map(x => x.c)];
    n = glyphs.length;
    const T = tones(pal, n);
    atlas = document.createElement('canvas');
    atlas.width = cw * n; atlas.height = ch * 2;
    const a = atlas.getContext('2d');
    a.fillStyle = T.ground; a.fillRect(0, 0, atlas.width, atlas.height);
    a.font = font; a.textAlign = 'center'; a.textBaseline = 'alphabetic';
    glyphs.forEach((c, i) => {
      if (c === ' ') return;
      a.fillStyle = T.ramp[i]; a.fillText(c, i * cw + cw / 2, base);
      a.fillStyle = T.accent; a.fillText(c, i * cw + cw / 2, ch + base);
    });
  }

  function layout() {
    W = el.clientWidth; H = el.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    family = readMono(el);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    buildAtlas();
    // whole cells only, centred: no glyph cut at the panel edges
    cols = Math.max(1, Math.floor(canvas.width / cw));
    rows = Math.max(1, Math.floor(canvas.height / ch));
    ox = Math.floor((canvas.width - cols * cw) / 2);
    oy = Math.floor((canvas.height - rows * ch) / 2);
    fcols = (cols >> 1) + 2; frows = (rows >> 1) + 2;
    coarse = new Float32Array(fcols * frows);
    cur = new Float32Array(cols * rows).fill(-9);
    state = new Int16Array(cols * rows).fill(-1);
    tone = new Float32Array(cols * rows);
    g.fillStyle = pal.bg;
    g.fillRect(0, 0, canvas.width, canvas.height);
  }

  // the form, in centred height units (y down); returns 0 (empty) .. 1 (strongest)
  function makeField(t) {
    const asp = W / Math.max(1, H);
    const src = prm.source | 0;
    const light = paletteKind(pal) === 'light';
    const sc = prm.scale, fill = prm.fill;
    const cx = (prm.calmX - 0.5) * asp, cy = prm.calmY - 0.5;
    const cr = 0.3 + 0.45 * prm.calm, ck = Math.min(1, prm.calm * 1.6);
    const calmAt = (x, y) => {
      const d = Math.hypot((x - cx) * 0.65, y - cy);          // wide, since text runs sideways
      return 1 - ck * (1 - smooth(cr * 0.35, cr, d));
    };
    if (src === 1) {
      // a sphere near the centre, nudged away from the calm area, lit from the upper left, turning slowly
      const Rr = Math.min(0.46, 0.3 + 0.16 * sc);
      const lim = Math.max(0, asp / 2 - Rr - 0.04);
      // a step away from the calm area (to a side the seed picks when the calm area is central)
      let ax = -cx, ay = -cy * 0.6;
      const al = Math.hypot(ax, ay);
      if (al < 0.12) { ax = jitter[0] < 0.5 ? -1 : 1; ay = 0; } else { ax /= al; ay /= al; }
      const fx0 = Math.max(-lim, Math.min(lim, ax * 0.32 + (jitter[0] - 0.5) * 0.08));
      const fy0 = Math.max(-0.12, Math.min(0.12, ay * 0.32));
      let lx = -0.55, ly = 0.6, lz = 0.58;
      const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
      const spin = t * 0.9 + jitter[2] * 6.28;
      return (x, y) => {
        const dx = (x - fx0) / Rr, dy = (y - fy0) / Rr;
        const r2 = dx * dx + dy * dy;
        if (r2 >= 1) return 0;
        const nz = Math.sqrt(1 - r2), nx = dx, ny = -dy;
        const lam = Math.max(0, nx * lx + ny * ly + nz * lz);
        const lon = Math.atan2(nx, nz) + spin, lat = Math.asin(ny);
        const tex = N.fbm(lon * 1.3, lat * 2.2 + 3.7);
        let s = Math.pow(lam, 0.85) * (0.78 + 0.5 * tex);
        s = Math.min(1, Math.max(0, s));
        const edge = smooth(1, 0.88, r2);
        const v = light ? 0.1 + 0.88 * (1 - s) : 0.07 + 0.93 * s;
        return v * edge * calmAt(x, y);
      };
    }
    if (src === 2) {
      // a wave: a twisting ribbon that runs across the whole panel, through the side away from the calm area
      const fy0 = Math.max(-0.2, Math.min(0.2, -cy * 0.5 + (jitter[1] - 0.5) * 0.1));
      const ang = (jitter[2] - 0.5) * 0.35;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const amp = 0.08 + 0.1 * sc, wid = 0.07 + 0.07 * fill;
      return (x, y) => {
        const u = x * ca + (y - fy0) * sa, v = -x * sa + (y - fy0) * ca;
        let best = 0;
        for (let k = 0; k < 3; k++) {
          const off = (k - 1) * (wid * 2.4);
          const c = off + amp * Math.sin(u * 2.3 - t * 2 + k * 0.6) + amp * 0.45 * Math.sin(u * 4.1 + t * 1.3 + k);
          const w = wid * (0.75 + 0.35 * Math.sin(u * 1.6 + t * 0.8 + k * 1.7));
          const d = (v - c) / w;
          if (d * d >= 1) continue;
          // the surface turns along its length: bands of light and shade, round across its width
          const turn = 0.5 + 0.5 * Math.cos(u * 3.1 - t * 1.6 + d * 1.1 + k * 2.1);
          const across = Math.sqrt(1 - d * d);
          const s = across * (0.18 + 0.82 * turn) * (1 - 0.22 * Math.abs(k - 1));
          if (s > best) best = s;
        }
        const fade = smooth(asp * 0.56, asp * 0.36, Math.abs(x));
        const vv = best * fade;
        return (light ? vv * vv * 0.35 + vv * 0.65 : vv) * calmAt(x, y);
      };
    }
    // a cloud: warped billows inside a bounded, ragged outline, lit from the upper left; toward the
    // outline the density falls, so the dither thins it out into sparse dots
    const fs = 1.7 - 0.8 * sc;
    const ex = Math.max(-asp / 2 + 0.4, Math.min(asp / 2 - 0.4, -cx * 0.6 + (jitter[0] - 0.5) * 0.15));
    const ey = Math.max(-0.12, Math.min(0.12, -cy * 0.4));
    const rx = Math.min(asp * 0.42, 0.42 + 0.3 * fill), ry = 0.3 + 0.12 * fill;
    return (x, y) => {
      const qx = x * fs, qy = y * fs;
      const wx = N.noise(qx * 0.55 + 3.1 + t * 0.4, qy * 0.55);
      const wy = N.noise(qx * 0.55 - t * 0.35, qy * 0.55 + 7.7);
      const ux = qx + 0.9 * wx + t * 0.25, uy = qy + 0.9 * wy;
      const f = N.fbm(ux, uy);
      const ox2 = (x - ex) / rx, oy2 = (y - ey) / ry;
      const r = Math.sqrt(ox2 * ox2 + oy2 * oy2) - 0.5 * N.fbm(x * 2.2 + 5.1, y * 2.2 - 3.3);
      const env = smooth(1.0, 0.35, r);
      if (env <= 0) return 0;
      // toward the outline only the strongest billows reach: a ragged edge of puffs, not a dotted oval
      const dens = smooth(0.3, 0.8, 0.45 + 1.2 * f - 0.7 * (1 - env)) * (0.4 + 0.6 * env);
      if (dens <= 0) return 0;
      // billows lit from the upper left: compare with the field a step toward the light
      const lit = Math.min(1, Math.max(0, 0.5 + 4.5 * (f - N.fbm(ux - 0.07, uy - 0.09))));
      const shade = light ? 1 - lit : lit;
      return Math.pow(dens, 0.85) * (0.4 + 0.6 * shade) * calmAt(x, y);
    };
  }

  function draw(t) {
    if (!W || !H) return;
    const tt = t * prm.speed + jitter[3] * 10;
    const field = makeField(tt);
    const top = n - 1;
    // the form on a half-resolution grid (every other cell), then interpolated for every cell
    for (let fr = 0, i = 0; fr < frows; fr++) {
      const y = (oy + (fr * 2 + 0.5) * ch) / dpr / H - 0.5;
      for (let fc = 0; fc < fcols; fc++, i++) {
        const x = ((ox + (fc * 2 + 0.5) * cw) / dpr - W / 2) / H;
        coarse[i] = field(x, y);
      }
    }
    for (let r = 0, i = 0; r < rows; r++) {
      const fr = r >> 1, ky = (r & 1) * 0.5;
      const o0 = fr * fcols, o1 = o0 + fcols;
      for (let c = 0; c < cols; c++, i++) {
        const fc = c >> 1, kx = (c & 1) * 0.5;
        const a = coarse[o0 + fc], b = coarse[o0 + fc + 1], d = coarse[o1 + fc], e = coarse[o1 + fc + 1];
        tone[i] = (a + (b - a) * kx) * (1 - ky) + (d + (e - d) * kx) * ky;
      }
    }
    // a sparse, fixed scatter of the strong cells takes the accent (never a solid clump)
    const accP = prm.accent / 0.35;
    for (let i = 0, r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        const tv = tone[i];
        // ordered dither between neighbouring glyphs: equal tones do not make identical rows
        const v = tv * top + (BAYER4[(r & 3) * 4 + (c & 3)] - 0.5) * 0.9;
        let k = cur[i];
        // hysteresis: a glyph changes only when the tone has clearly moved on
        if (k < 0 || Math.abs(v - k) > 0.75) { k = Math.max(0, Math.min(top, Math.round(v))); cur[i] = k; }
        if (tv < 0.05) k = 0;
        const acc = k >= top * 0.6 && tv > 0.55 && hash2(c, r, sd) < accP;
        const st = k + (acc ? n : 0);
        if (st !== state[i]) {
          state[i] = st;
          g.drawImage(atlas, k * cw, acc ? ch : 0, cw, ch, ox + c * cw, oy + r * ch, cw, ch);
        }
      }
    }
    if (!shown) { shown = true; canvas.style.opacity = '1'; }
  }

  layout();
  const lc = lifecycle(el, { draw, still: 7, fps: 24 });
  let fontsReady = false, dead = false;
  const relayout = () => { if (!dead) { layout(); lc.redraw(); } };
  const ro = new ResizeObserver(() => {
    if (el.clientWidth !== W || el.clientHeight !== H) relayout();
  });
  ro.observe(el);
  // a web font for the mono face may arrive later: rebuild the atlas once it has
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (!fontsReady) { fontsReady = true; relayout(); } });
  }

  return {
    pause: () => lc.pause(),
    resume: () => lc.resume(),
    redraw: () => lc.redraw(),
    set(next) {
      const before = prm;
      prm = resolveParams(params, { ...prm, ...next });
      if (before.cell !== prm.cell || before.ramp !== prm.ramp) layout();
      else { state.fill(-1); cur.fill(-9); }
      lc.redraw();
      return prm;
    },
    setPalette(p) {
      pal = normalizePalette(p);
      if (ownBg) el.style.backgroundColor = pal.bg;
      layout();
      lc.redraw();
    },
    destroy() {
      dead = true;
      lc.destroy();
      ro.disconnect();
      canvas.remove();
      if (ownBg) el.style.backgroundColor = pal.bg;
    },
    get canvas() { return canvas; },
    get info() { return { webgl: 0, canvas: '2d', fallback: null, scale: 1, dpr, size: [canvas.width, canvas.height], cells: cols * rows, running: lc.running }; },
  };
}

export default {
  id: 'ascii-shade',
  name: 'ASCII shade',
  family: 'dither',
  params,
  mount: mountAscii,
};
