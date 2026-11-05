// fx-map: a street map of the real place, in the page's own colours. The streets, water, parks, rails,
// street names and the walk from the nearest station come from OpenStreetMap, baked once at build time
// by bake.mjs into a small JSON (inline in <script type="application/json" class="cx-map__data">, or a
// file named by data-cx-map). Plain SVG: no map service, no key, no WebGL, nothing moves at rest.
// Pointed at, the walk lights up from the station to the door and the pin's halo answers once.
// Without baked data (no network at build time) it falls back to a still effect ground with the pin.
import { still, palette, tone, bag, color, isDark, reduced } from '../shared.js';

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

// the fallback grounds, each with its own params only (one effect's numbers mean something else to another)
const PARAMS = {
  'contour-lines': narrow => ({ levels: 30, scale: narrow ? 1.6 : 1.25, lineWidth: 1, indexEvery: 5, opacity: 0.32, speed: 0, tint: 0.45, shade: 0.35, edge: 0.4, calm: narrow ? 0 : 0.55, calmX: 0.17, calmY: 0.78 }),
  'dot-terrain': narrow => ({ spacing: narrow ? 11 : 13, dot: 2.4, amplitude: 0.2, waveScale: 1.1, speed: 0, opacity: 0.9, shade: 0.8, crest: 0.7, horizon: 0.16, fog: 0.35, haze: 0.25, calm: narrow ? 0 : 0.55, calmX: 0.17, calmY: 0.8 }),
  'ruled-grounds': narrow => ({ cell: narrow ? 14 : 16, major: 4, ink: 0.85, focus: 0.5, speed: 0, reach: 0.85, grain: 0.35, calm: narrow ? 0 : 0.45, calmX: 0.17, calmY: 0.78 }),
};
// bottom to top; lines are stroked, areas filled
const LAYERS = [
  ['sea', 'area'], ['land', 'area'], ['green', 'area'], ['plaza', 'area'], ['water', 'area'],
  ['stream', 'line'], ['canal', 'line'], ['river', 'line'],
  ['path', 'line'], ['rail', 'line'], ['tram', 'line'], ['minor', 'line'],
  ['street', 'casing'], ['major', 'casing'], ['street', 'line'], ['major', 'line'],
];
const NICE = [50, 100, 200, 250, 500, 1000, 2000];

async function readData(root) {
  const inline = root.querySelector('script.cx-map__data[type="application/json"]');
  if (inline) { try { return JSON.parse(inline.textContent); } catch (e) { console.warn('fx-map: bad inline data', e); } }
  const src = root.dataset.cxMap;
  if (!src) return null;
  try { const r = await fetch(new URL(src, document.baseURI)); return r.ok ? await r.json() : null; } catch (e) { console.warn('fx-map: no map data', e); return null; }
}
const el = (name, attrs = {}) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

export default function init(root) {
  const b = bag();
  let dead = false;
  const ground = root.querySelector('.cx-map__ground');
  const svg = root.querySelector('.cx-map__svg');
  const pin = root.querySelector('.cx-map__pin');
  const tag = root.querySelector('.cx-map__tag');
  const scale = root.querySelector('.cx-map__scale');
  const card = root.querySelector('.cx-map__card');
  b.add(() => { dead = true; });
  root.classList.toggle('is-dark', isDark(palette(root)));

  readData(root).then(data => {
    if (dead) return;
    if (data && data.box && svg) draw(data); else fallback();
  });

  /* ------------------------------------------------------------------ the street map */
  function draw(data) {
    root.classList.add('has-streets');
    const id = `cxm${++uid}`;
    const [bx, by, bw, bh] = data.box;
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.replaceChildren();
    const g = el('g');
    g.append(el('rect', { class: 'cx-map__land', x: bx, y: by, width: bw, height: bh }));
    for (const [name, kind] of LAYERS) {
      if (!data[name]) continue;
      g.append(el('path', { class: `cx-map__${name} is-${kind}`, d: data[name] }));
    }
    // the walk: a dotted line at rest, a solid pass drawn over it when pointed at
    let walk = null, pass = null, stop = null, chip = null;
    if (data.route && data.route.d) {
      // the bake writes the walk in rounded relative steps, so its end drifts a few metres off the door:
      // close it on the pin (0 0) so the walk reaches the dot
      const rd = `${data.route.d} L0 0`;
      g.append(el('path', { class: 'cx-map__route-casing', d: rd }));
      walk = el('path', { class: 'cx-map__route', d: rd });
      pass = el('path', { class: 'cx-map__pass', d: rd, pathLength: 100 });
      g.append(walk, pass);
    }
    // street names along their streets
    const defs = el('defs');
    const names = (data.labels || []).map((l, i) => {
      const pid = `${id}-s${i}`;
      defs.append(el('path', { id: pid, d: l.d }));
      const t = el('text', { class: `cx-map__name is-${l.cls}` });
      const tp = el('textPath', { href: `#${pid}`, startOffset: '50%', 'text-anchor': 'middle' });
      tp.textContent = l.name;
      t.append(tp);
      return { t, len: l.len, name: l.name };
    });
    g.prepend(defs);
    const nameLayer = el('g', { class: 'cx-map__names' });
    for (const n of names) nameLayer.append(n.t);
    g.append(nameLayer);
    svg.append(g);

    if (data.route && data.route.from) {
      stop = document.createElement('span');
      stop.className = 'cx-map__stop';
      stop.setAttribute('aria-hidden', 'true');
      stop.innerHTML = '<i></i><b></b>';
      stop.querySelector('b').textContent = data.route.from.name;
      chip = document.createElement('span');
      chip.className = 'cx-map__walk';
      chip.setAttribute('aria-hidden', 'true');
      chip.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="9" cy="2.6" r="1.6"/><path d="M8.2 5.2 6 6.6 5 9.4m3.2-4.2 1.1 4 2.4 1.6M9.3 9.2 7.6 12.4 6.2 14.6m3.1-5.4 1 3.2 1.2 2.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>';
      chip.querySelector('span').textContent = `${data.route.min} min walk`;
      ground.append(stop, chip);
      b.add(() => { stop.remove(); chip.remove(); });
    }

    // fit: the place and the walk in the free part of the frame (right of the card when it sits on
    // the map), at a zoom where streets still read as streets
    const layout = () => {
      if (dead) return;
      const W = ground.clientWidth, H = ground.clientHeight;
      if (!W || !H) return;
      const narrow = root.clientWidth < 560;
      const R = ground.getBoundingClientRect();
      let fx0 = narrow ? 20 : 48, fy0 = 44, fx1 = W - 40, fy1 = H - 56;
      // the card covers the map only from 900px of width (the CSS container query); then the free part is right of it
      if (root.clientWidth >= 900 && card) { const c = card.getBoundingClientRect(); if (c.right - R.left < W * 0.6) fx0 = c.right - R.left + 48; }
      const from = data.route && data.route.from;
      // the pin's name and the station's name sit on the side the walk does not leave by; on a narrow
      // frame above or below, so the walk keeps the width
      const sideAway = (vx0, vy0) => {
        if (Math.abs(vx0) >= Math.abs(vy0) && !narrow) return vx0 > 0 ? 'l' : 'r';
        return vy0 > 0 ? 't' : 'b';
      };
      let tagSide = narrow ? 't' : 'r', stopSide = 'r';
      if (walk) {
        const L = walk.getTotalLength();
        const a = walk.getPointAtLength(Math.max(0, L - 70)), z = walk.getPointAtLength(Math.min(L, 70));
        tagSide = sideAway(a.x, a.y);
        stopSide = sideAway(z.x - from.x, z.y - from.y);
      }
      // each mark with its name as a box in pixels around its point
      const boxOf = (side, w, h, r) => side === 'r' ? [-r, -h / 2, r + 8 + w, h / 2] : side === 'l' ? [-(r + 8 + w), -h / 2, r, h / 2]
        : side === 't' ? [-w / 2, -(h + r + 8), w / 2, r] : [-w / 2, -r, w / 2, h + r + 8];
      const marks = [[0, 0, boxOf(tagSide, tag ? tag.offsetWidth : 120, 30, 12)]];
      if (from) marks.push([from.x, from.y, boxOf(stopSide, stop.querySelector('b').offsetWidth, 22, 8)]);
      const fw = Math.max(80, fx1 - fx0), fh = Math.max(80, fy1 - fy0);
      const extent = mm => {
        const xs = marks.flatMap(([x, , bx4]) => [x / mm + bx4[0], x / mm + bx4[2]]), ys = marks.flatMap(([, y, bx4]) => [y / mm + bx4[1], y / mm + bx4[3]]);
        return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      };
      const fits = mm => { const e = extent(mm); return e[2] - e[0] <= fw && e[3] - e[1] <= fh; };
      // the closest zoom (streets still read as streets) at which the marks and their names fit
      const minM = narrow ? 1.1 : 1.05, maxM = Math.min(3, bw / W, bh / H);
      let m = minM;
      if (!fits(minM)) {
        let lo = minM, hi = maxM;
        if (!fits(hi)) m = hi; else { for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; } m = hi; }
      }
      const e = extent(m);
      let vx = -(((fx0 + fx1) / 2) - (e[0] + e[2]) / 2) * m, vy = -(((fy0 + fy1) / 2) - (e[1] + e[3]) / 2) * m;
      vx = Math.min(Math.max(vx, bx), bx + bw - W * m);
      vy = Math.min(Math.max(vy, by), by + bh - H * m);
      svg.setAttribute('viewBox', `${vx} ${vy} ${W * m} ${H * m}`);
      // strokes and type in screen pixels: --m is metres per pixel; --k thins the lines when zoomed out
      svg.style.setProperty('--m', m.toFixed(4));
      svg.style.setProperty('--k', Math.min(1.15, Math.max(0.62, 1.25 / m)).toFixed(3));
      const at = ([x, y]) => [(x - vx) / m, (y - vy) / m];
      const [px, py] = at([0, 0]);
      pin.style.left = `${px}px`; pin.style.top = `${py}px`;
      pin.dataset.side = tagSide;
      if (walk) walk.style.strokeDasharray = `0 ${(9 * m).toFixed(2)}`;
      if (stop) {
        const [sx, sy] = at([from.x, from.y]);
        stop.style.left = `${sx}px`; stop.style.top = `${sy}px`;
        stop.dataset.side = stopSide;
      }
      if (chip && walk) {
        const L = walk.getTotalLength(), mid = walk.getPointAtLength(L * 0.5);
        const [hx, hy] = at([mid.x, mid.y]);
        chip.style.left = `${hx}px`; chip.style.top = `${hy}px`;
      }
      // the scale bar: a round distance 60 to 130 px long
      if (scale) {
        const d = NICE.find(n => n / m >= 60) || NICE[NICE.length - 1];
        scale.querySelector('span').style.width = `${Math.round(d / m)}px`;
        scale.lastChild.nodeValue = d >= 1000 ? `${d / 1000} km` : `${d} m`;
      }
      // names: only those that fit their street, stay inside the frame and clear of every label
      const marksEls = [tag, root.querySelector('.cx-map__dot'), stop && stop.querySelector('b'), stop && stop.querySelector('i')].filter(Boolean);
      const block = [...marksEls, chip, scale, root.querySelector('.cx-map__credit'), root.clientWidth >= 900 ? card : null]
        .filter(Boolean).map(n => n.getBoundingClientRect()).filter(r => r.width);
      const hit = (a, r, pad) => a.left < r.right + pad && a.right > r.left - pad && a.top < r.bottom + pad && a.bottom > r.top - pad;
      const kept = [], shown = new Set();
      const most = narrow ? 3 : 6;
      for (const n of names) {
        n.t.style.display = '';
        let ok = kept.length < most && !shown.has(n.name);
        if (ok) { try { ok = n.t.getComputedTextLength() < n.len * 0.94; } catch { ok = false; } }
        if (ok) {
          const r = n.t.getBoundingClientRect();
          ok = r.width > 0 && r.left > R.left + 10 && r.right < R.right - 10 && r.top > R.top + 10 && r.bottom < R.bottom - 10 &&
            !block.some(x => hit(r, x, 8)) && !kept.some(x => hit(r, x, 14));
          if (ok) { kept.push(r); shown.add(n.name); }
        }
        if (!ok) n.t.style.display = 'none';
      }
      if (chip) {
        const c = chip.getBoundingClientRect();
        chip.hidden = false;
        chip.hidden = marksEls.some(n => hit(c, n.getBoundingClientRect(), 4));
      }
    };
    layout();
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); });
    ro.observe(ground);
    if (card) ro.observe(card);
    b.add(() => { ro.disconnect(); cancelAnimationFrame(raf); svg.replaceChildren(); root.classList.remove('has-streets', 'is-walking'); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) layout(); });

    // pointed at: the walk is drawn from the station to the door, the halo answers once
    if (pass && !reduced()) {
      let t = 0;
      const on = () => { clearTimeout(t); root.classList.remove('is-walking'); void pass.getBoundingClientRect(); root.classList.add('is-walking'); };
      const off = () => { clearTimeout(t); t = setTimeout(() => root.classList.remove('is-walking'), 260); };
      ground.addEventListener('pointerenter', on);
      ground.addEventListener('pointerleave', off);
      const btns = [...root.querySelectorAll('.cx-map__actions a')];
      for (const a of btns) { a.addEventListener('pointerenter', on); a.addEventListener('focus', on); a.addEventListener('blur', off); a.addEventListener('pointerleave', off); }
      b.add(() => {
        clearTimeout(t);
        ground.removeEventListener('pointerenter', on); ground.removeEventListener('pointerleave', off);
        for (const a of btns) { a.removeEventListener('pointerenter', on); a.removeEventListener('focus', on); a.removeEventListener('blur', off); a.removeEventListener('pointerleave', off); }
      });
    }
  }

  /* ------------------------------------------------------------------ no data: a still ground */
  function fallback() {
    root.classList.add('has-ground');
    if (svg) svg.remove();
    const page = palette(root);
    const effect = PARAMS[root.dataset.cxEffect] ? root.dataset.cxEffect : 'contour-lines';
    const narrow = root.clientWidth < 560;
    const bg = tone(page, 0.065);
    b.add(still(ground, effect, {
      palette: { ...page, bg, ...(effect === 'dot-terrain' ? { ink: color.mix(page.ink, bg, 0.25) } : {}) },
      seed: root.dataset.cxSeed,
      params: PARAMS[effect](narrow),
    }));
    pin.style.left = 'var(--x, 64%)';
    pin.style.top = 'var(--y, 42%)';
  }

  /* ------------------------------------------------------------------ copy address */
  const btn = root.querySelector('[data-copy]');
  if (btn) {
    const label = btn.textContent;
    let t = 0;
    const copy = async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy || (root.querySelector('address') || {}).innerText || ''); btn.textContent = 'Copied'; }
      catch (_) { btn.textContent = 'Select and copy'; }
      clearTimeout(t);
      t = setTimeout(() => { btn.textContent = label; }, 1600);
    };
    btn.addEventListener('click', copy);
    b.add(() => { clearTimeout(t); btn.textContent = label; btn.removeEventListener('click', copy); });
  }
  return b;
}
