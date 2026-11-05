// grid-pulse: a fine grid of hairlines (drawn once, snapped to device pixels, faded by a smooth mask)
// and pulses that run along the lines like signals on a circuit. A pulse is an agent on the grid edges:
// it moves along one axis, now and then turns at a node, and after a few cells it stops and its tail
// runs in after it; then it starts again somewhere else. Every node it passes lights up and the cell
// beside its path takes a faint tint, both fading over a couple of seconds, so the grid keeps a trace
// of where the signals went. The number of pulses grows with the panel's area.
import { lifecycle, color, rng as makeRng, normalizePalette, resolveParams, paletteKind } from '../fx.js';

const params = {
  cell:        { default: 48,   min: 16,  max: 128, step: 1 },     // grid cell in CSS px
  lineOpacity: { default: 0.1,  min: 0.02, max: 0.3, step: 0.005 }, // grid line strength
  pulses:      { default: 6,    min: 0,   max: 12,  step: 1 },     // pulses on a 480x300 panel (more on larger ones, up to 2.5x; never fewer)
  tail:        { default: 2.5,  min: 0.5, max: 6,   step: 0.1 },   // tail length in cells
  speed:       { default: 150,  min: 20,  max: 400, step: 1 },     // pulse speed in CSS px a second
  turnChance:  { default: 0.25, min: 0,   max: 1,   step: 0.01 },  // chance to turn at a node
  mask:        { default: 0,    min: 0,   max: 2,   step: 1 },     // 0 a soft pool away from the calm area, 1 fading down from the top, 2 edges only
  glow:        { default: 0.6,  min: 0,   max: 1,   step: 0.01 },  // soft light around a pulse head
  trace:       { default: 0.6,  min: 0,   max: 1,   step: 0.01 },  // how strongly passed nodes and cells light up
  calm:        { default: 0.5,  min: 0,   max: 1,   step: 0.01 },  // fade the grid where text sits
  calmX:       { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:       { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

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
const rgbArr = hex => color.rgb(hex).map(v => Math.round(v * 255));
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(4)})`;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const TRACE_LIFE = 2.4; // seconds a lit node or cell takes to fade

function makeLayer() {
  const c = document.createElement('canvas');
  c.className = 'fx-canvas';
  c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1',
    pointerEvents: 'none', opacity: '0', transition: 'opacity .5s ease', borderRadius: 'inherit',
  });
  return c;
}
function radialSprite(rgb, a, stops = [[0, 1], [0.25, 0.45], [0.6, 0.1], [1, 0]]) {
  const sp = document.createElement('canvas');
  sp.width = sp.height = 64;
  const s = sp.getContext('2d');
  const rg = s.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [o, k] of stops) rg.addColorStop(o, rgba(rgb, a * k));
  s.fillStyle = rg;
  s.fillRect(0, 0, 64, 64);
  return sp;
}

export default {
  id: 'grid-pulse',
  name: 'Grid pulse',
  family: 'pattern',
  params,
  mount(el, { palette, params: given, seed }) {
    let P = normalizePalette(palette);
    let prm = resolveParams(params, given);
    const ownBg = prepareHost(el, P);
    const rand = makeRng(seed ?? 1);
    const gridC = makeLayer(), pulseC = makeLayer();
    el.insertBefore(pulseC, el.firstChild);
    el.insertBefore(gridC, pulseC);
    const g = gridC.getContext('2d');
    const ctx = pulseC.getContext('2d');
    let w = 1, h = 1, dpr = 1, shown = false, clock = 0;
    let cols = {}, glowS = null, haloS = null;

    function colours() {
      const kind = paletteKind(P);
      const dark = color.isDark(P.bg);
      const acc = P.accent;
      // a colour ground whose accent sits close to it in tone signals with a light step of the ink
      const sig = color.contrast(P.bg, acc) < 1.6 ? color.mix(P.bg, P.ink, 0.8) : acc;
      cols = {
        line: rgbArr(P.ink),
        acc: rgbArr(sig),
        // the head is a lighter step of the signal colour on dark grounds, the colour itself on light ones
        head: rgbArr(dark ? color.mix(sig, '#ffffff', 0.5) : sig),
        // lit cells: a tint of the signal colour
        cell: rgbArr(sig),
        halo: rgbArr(color.mix(P.bg, '#ffffff', 0.85)),
        dark, kind,
        lineK: dark ? 1.3 : 1,
      };
      glowS = radialSprite(cols.acc, dark ? 0.6 : 0.42);
      // on light grounds the signal also lifts the ground around it: a halo lighter than the ground
      haloS = dark ? null : radialSprite(rgbArr(color.mix(P.bg, '#ffffff', 0.9)), 0.95, [[0, 1], [0.35, 0.6], [0.7, 0.15], [1, 0]]);
    }

    // the broad pool of mask 0 sits on the side away from the calm area, so a centred UI window or
    // text block never hides the strongest part of the grid
    function focus() {
      const k = Math.min(1, prm.calm * 2);
      const fx = Math.min(0.85, Math.max(0.15, 0.5 + (0.5 - prm.calmX) * 0.95 * k));
      const fy = Math.min(0.85, Math.max(0.15, 0.5 + (0.5 - prm.calmY) * 0.75 * k));
      return [fx * w, fy * h];
    }
    // mask in CSS px: 1 where the grid shows, 0 where it is gone
    function calmAt(x, y) {
      if (prm.calm <= 0) return 0;
      const r = (0.32 + 0.4 * prm.calm) * h;
      const d = Math.hypot(x - prm.calmX * w, y - prm.calmY * h);
      return prm.calm * (1 - smooth(r * 0.35, r, d));
    }
    let F = [0, 0];
    function maskAt(x, y) {
      // nothing outside the panel, so a pulse that runs off the edge ends there
      const edge = Math.min(x, w - x, y, h - y);
      if (edge < 2) return 0;
      let m;
      if (prm.mask === 0) {
        const d = Math.hypot((x - F[0]) / (w * 0.95), (y - F[1]) / (h * 1.05));
        m = 1 - smooth(0.32, 1.1, d);
        m *= smooth(0, Math.min(w, h) * 0.1, edge);
      } else if (prm.mask === 1) {
        m = 1 - smooth(0.04, 0.92, y / h);
        m *= 1 - smooth(0.35, 0.5, Math.abs(x / w - 0.5)) * 0.85;
      } else {
        m = smooth(0, Math.min(w, h) * 0.18, edge);
      }
      return m * (1 - calmAt(x, y));
    }

    // grid geometry: a line through the centre, every cell CSS px
    const lineW = () => Math.max(1, Math.round(dpr));
    const snap = v => Math.round(v * dpr);
    const gx = i => w / 2 + i * prm.cell, gy = j => h / 2 + j * prm.cell;
    const iMin = () => -Math.floor(w / 2 / prm.cell), iMax = () => Math.floor(w / 2 / prm.cell);
    const jMin = () => -Math.floor(h / 2 / prm.cell), jMax = () => Math.floor(h / 2 / prm.cell);

    function drawGrid() {
      F = focus();
      const W = gridC.width, H = gridC.height, lw = lineW();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, W, H);
      // lines at full strength (crossings do not add up), the strength comes with the mask below
      g.fillStyle = rgba(cols.line, 1);
      for (let i = iMin() - 1; i <= iMax() + 1; i++) g.fillRect(snap(gx(i)) - (lw >> 1), 0, lw, H);
      for (let j = jMin() - 1; j <= jMax() + 1; j++) g.fillRect(0, snap(gy(j)) - (lw >> 1), W, lw);
      // mask: line strength times the fade, sampled every 8 CSS px and scaled up smoothly
      const mw = Math.max(8, Math.ceil(w / 8)), mh = Math.max(8, Math.ceil(h / 8));
      const mc = document.createElement('canvas');
      mc.width = mw; mc.height = mh;
      const mx = mc.getContext('2d');
      const img = mx.createImageData(mw, mh);
      const k = prm.lineOpacity * cols.lineK;
      for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
        const m = maskAt((x + 0.5) / mw * w, (y + 0.5) / mh * h);
        const o = (y * mw + x) * 4;
        img.data[o] = img.data[o + 1] = img.data[o + 2] = 0;
        img.data[o + 3] = Math.round(Math.min(1, m * k) * 255);
      }
      mx.putImageData(img, 0, 0);
      g.globalCompositeOperation = 'destination-in';
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(mc, 0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    }

    /* ---- traces: nodes and cells the pulses passed ---- */
    const traces = new Map();
    function lightUp(a, x0, y0, x1, y1, born) {
      const i = Math.round(x1), j = Math.round(y1);
      traces.set(`n${i},${j}`, { n: 1, i, j, born });
      // the cell on one side of the segment just run (each pulse keeps to its own hand)
      const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      const nx = dy * a.hand, ny = -dx * a.hand;
      const ci = dx ? Math.min(Math.round(x0), i) : (nx > 0 ? i : i - 1);
      const cj = dy ? Math.min(Math.round(y0), j) : (ny > 0 ? j : j - 1);
      traces.set(`c${ci},${cj}`, { n: 0, i: ci, j: cj, born });
    }

    /* ---- pulses ---- */
    const agents = [];
    function spawn(a) {
      // a node where the grid is clearly visible, on a row and column no other pulse is using
      const nodes = [];
      for (let ii = iMin() + 1; ii < iMax(); ii++) for (let jj = jMin() + 1; jj < jMax(); jj++) {
        const m = maskAt(gx(ii), gy(jj));
        if (m > 0.45) nodes.push([ii, jj, m]);
      }
      let i = 0, j = 0;
      for (let k = 0; k < 12 && nodes.length; k++) {
        [i, j] = nodes[Math.floor(rand() * nodes.length)];
        const busy = agents.some(o => o !== a && o.state !== 'wait' && (Math.abs(o.x - i) < 0.5 || Math.abs(o.y - j) < 0.5));
        if (!busy) break;
      }
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      let d = dirs[Math.floor(rand() * 4)];
      // head toward the stronger part of the grid
      if (maskAt(gx(i + d[0] * 3), gy(j + d[1] * 3)) < maskAt(gx(i - d[0] * 3), gy(j - d[1] * 3))) d = [-d[0], -d[1]];
      Object.assign(a, {
        x: i, y: j, dx: d[0], dy: d[1], trail: [[i, j]], tail: 0, nodes: 0, hand: rand() < 0.5 ? 1 : -1,
        life: 6 + Math.floor(rand() * 9), state: 'run', wait: 0, flash: 0, fx: i, fy: j,
      });
    }
    function step(a, dt, now) {
      const tailPx = prm.tail * prm.cell;
      if (a.flash > 0) a.flash = Math.max(0, a.flash - dt / 0.9);
      if (a.state === 'wait') { a.wait -= dt; if (a.wait <= 0) spawn(a); return; }
      const v = prm.speed * dt;
      if (a.state === 'fade') {
        a.tail -= v;
        if (a.tail <= 0) { a.state = 'wait'; a.wait = 0.1 + rand() * 0.4; }
        return;
      }
      a.tail = Math.min(tailPx, a.tail + v);
      let move = v / prm.cell;
      while (move > 1e-6) {
        const pos = a.dx ? a.x : a.y, dir = a.dx || a.dy;
        const next = dir > 0 ? Math.floor(pos + 1e-6) + 1 : Math.ceil(pos - 1e-6) - 1;
        const dn = Math.abs(next - pos);
        if (move < dn) { if (a.dx) a.x += dir * move; else a.y += dir * move; break; }
        const [px0, py0] = [a.x, a.y];
        if (a.dx) a.x = next; else a.y = next;
        move -= dn;
        a.trail.push([a.x, a.y]);
        if (a.trail.length > 16) a.trail.shift();
        a.nodes++;
        const m = maskAt(gx(a.x), gy(a.y));
        if (m >= 0.3) lightUp(a, a.dx ? a.x - a.dx : px0, a.dy ? a.y - a.dy : py0, a.x, a.y, now - move / Math.max(1e-6, prm.speed / prm.cell));
        // where the grid fades the pulse ends, so it never runs on unseen
        if (a.nodes >= a.life || m < 0.3) {
          a.state = 'fade'; a.flash = m < 0.3 ? 0 : 1; a.fx = a.x; a.fy = a.y;
          break;
        }
        if (rand() < prm.turnChance) {
          const s = rand() < 0.5 ? 1 : -1;
          [a.dx, a.dy] = a.dx ? [0, s] : [s, 0];
        }
      }
    }
    function count() {
      const n = Math.round(prm.pulses);
      if (n <= 0) return 0;
      return Math.max(n, Math.min(Math.round(n * 2.5), Math.round(n * (w * h) / (480 * 300))));
    }
    function setCount() {
      const n = count();
      while (agents.length > n) agents.pop();
      while (agents.length < n) {
        // start mid-flight: each pulse already some way along its run, its trace already behind it
        const a = {};
        for (let tries = 0; tries < 4; tries++) {
          spawn(a);
          const T = (0.25 + 0.6 * rand()) * a.life * prm.cell / prm.speed;
          for (let s = 0; s < T && a.state === 'run'; s += 1 / 30) step(a, 1 / 30, clock - T + s);
          if (a.state === 'run' && maskAt(gx(a.x), gy(a.y)) > 0.35) break;
        }
        agents.push(a);
      }
    }

    const px = x => snap(gx(x)) + (lineW() % 2 ? 0.5 : 0);
    const py = y => snap(gy(y)) + (lineW() % 2 ? 0.5 : 0);

    function drawTraces() {
      const k = prm.trace;
      if (k <= 0) { traces.clear(); return; }
      const c = prm.cell * dpr, lw = lineW();
      for (const [key, tr] of traces) {
        const age = (clock - tr.born) / TRACE_LIFE;
        if (age >= 1) { traces.delete(key); continue; }
        const f = Math.pow(1 - Math.max(0, age), 2);
        if (tr.n) {
          const m = maskAt(gx(tr.i), gy(tr.j));
          const X = px(tr.i), Y = py(tr.j), s = (1.5 + 1.2 * k) * dpr;
          ctx.fillStyle = rgba(cols.head, f * m * (0.55 + 0.45 * k));
          ctx.fillRect(Math.round(X - s), Math.round(Y - s), Math.round(s * 2), Math.round(s * 2));
        } else {
          const m = maskAt(gx(tr.i + 0.5), gy(tr.j + 0.5));
          const X = snap(gx(tr.i)) + lw, Y = snap(gy(tr.j)) + lw;
          ctx.fillStyle = rgba(cols.cell, f * m * k * (cols.dark ? 0.2 : 0.15));
          ctx.fillRect(X, Y, Math.round(c) - lw, Math.round(c) - lw);
        }
      }
    }

    function drawPulse(a) {
      const lw = lineW();
      const tailC = prm.tail;
      if (a.flash > 0) {
        const m = maskAt(gx(a.fx), gy(a.fy));
        const s = (10 + 8 * prm.glow) * dpr;
        ctx.globalAlpha = a.flash * a.flash * m * (0.35 + 0.65 * prm.glow);
        if (haloS) ctx.drawImage(haloS, px(a.fx) - s * 1.6, py(a.fy) - s * 1.6, s * 3.2, s * 3.2);
        ctx.drawImage(glowS, px(a.fx) - s, py(a.fy) - s, s * 2, s * 2);
        ctx.globalAlpha = 1;
      }
      if (a.state === 'wait' || a.tail <= 0) return;
      // walk back from the head along the trail for the tail length
      const pts = [[a.x, a.y]];
      let left = a.tail / prm.cell;
      for (let k = a.trail.length - 1; k >= 0 && left > 0; k--) {
        const [x0, y0] = pts[pts.length - 1];
        const [x1, y1] = a.trail[k];
        const d = Math.abs(x1 - x0) + Math.abs(y1 - y0);
        if (d < 1e-6) continue;
        if (d >= left) { pts.push([x0 + (x1 - x0) * left / d, y0 + (y1 - y0) * left / d]); left = 0; break; }
        pts.push([x1, y1]);
        left -= d;
      }
      const total = a.tail / prm.cell - left;
      if (total <= 1e-4) return;
      const strong = cols.dark ? 1 : 1.25;
      // on light grounds: a light halo under the whole tail first
      if (haloS && prm.glow > 0) {
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(cols.halo, 0.55 * prm.glow * maskAt(gx(a.x), gy(a.y)));
        ctx.lineWidth = 7 * dpr;
        ctx.beginPath();
        ctx.moveTo(px(pts[0][0]), py(pts[0][1]));
        for (let k = 1; k < pts.length; k++) ctx.lineTo(px(pts[k][0]), py(pts[k][1]));
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
      let s0 = 0;
      for (let k = 0; k < pts.length - 1; k++) {
        const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
        const d = Math.abs(x1 - x0) + Math.abs(y1 - y0);
        const s1 = s0 + d;
        const a0 = Math.min(1, strong * Math.pow(1 - s0 / tailC, 1.4) * maskAt(gx(x0), gy(y0)));
        const a1 = Math.min(1, strong * Math.pow(Math.max(0, 1 - s1 / tailC), 1.4) * maskAt(gx(x1), gy(y1)));
        const X0 = px(x0), Y0 = py(y0), X1 = px(x1), Y1 = py(y1);
        const gr = ctx.createLinearGradient(X0, Y0, X1, Y1);
        gr.addColorStop(0, rgba(cols.acc, a0));
        gr.addColorStop(1, rgba(cols.acc, a1));
        ctx.beginPath();
        ctx.moveTo(X0, Y0);
        ctx.lineTo(X1, Y1);
        // a soft wide stroke under the crisp one, so the signal glows a little along its length
        ctx.strokeStyle = gr;
        ctx.globalAlpha = (cols.dark ? 0.22 : 0.16) * prm.glow;
        ctx.lineWidth = lw * 5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = lw * (cols.dark ? 1 : 1.5);
        ctx.stroke();
        s0 = s1;
      }
      if (a.state === 'run') {
        const m = maskAt(gx(a.x), gy(a.y));
        const grow = Math.min(1, a.tail / (prm.tail * prm.cell * 0.35));
        const X = px(a.x), Y = py(a.y);
        if (prm.glow > 0) {
          const s = (10 + 10 * prm.glow) * dpr;
          ctx.globalAlpha = m * grow * prm.glow;
          if (haloS) ctx.drawImage(haloS, X - s * 1.4, Y - s * 1.4, s * 2.8, s * 2.8);
          ctx.drawImage(glowS, X - s, Y - s, s * 2, s * 2);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = rgba(cols.head, m * grow);
        ctx.beginPath();
        ctx.arc(X, Y, 1.7 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function draw(t, dt) {
      if (dt > 0) { clock += dt; for (const a of agents) step(a, dt, clock); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pulseC.width, pulseC.height);
      drawTraces();
      for (const a of agents) drawPulse(a);
      if (!shown) { shown = true; gridC.style.opacity = '1'; pulseC.style.opacity = '1'; }
    }

    function fit() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, el.clientWidth); h = Math.max(1, el.clientHeight);
      const W = Math.round(w * dpr), H = Math.round(h * dpr);
      for (const c of [gridC, pulseC]) if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      drawGrid();
    }

    colours();
    fit();
    setCount();
    const lc = lifecycle(el, { draw, still: 3, fps: 60 });
    const ro = new ResizeObserver(() => { fit(); setCount(); lc.redraw(); });
    ro.observe(el);

    return {
      pause: () => lc.pause(),
      resume: () => lc.resume(),
      redraw: () => lc.redraw(),
      set(next) {
        prm = resolveParams(params, { ...prm, ...next });
        drawGrid();
        setCount();
        lc.redraw();
        return prm;
      },
      setPalette(p) { P = normalizePalette(p); if (ownBg) el.style.backgroundColor = P.bg; colours(); drawGrid(); lc.redraw(); },
      destroy() { lc.destroy(); ro.disconnect(); gridC.remove(); pulseC.remove(); if (ownBg) el.style.backgroundColor = P.bg; },
      get canvas() { return pulseC; },
      get info() { return { webgl: 0, canvas: '2d', fallback: null, scale: 1, dpr, size: [pulseC.width, pulseC.height], running: lc.running, pulses: agents.length, active: agents.filter(a => a.state === 'run').length, traces: traces.size }; },
    };
  },
};
