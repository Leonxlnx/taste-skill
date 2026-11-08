// assets/scenes/instrument-dial-stage/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / instrument-dial-stage.js — an instrument that reads off 3 to 6 items.
//
// A horizon cuts the stage. Above it, the wide arc of a large dial spans the stage over the item's
// name: a scale of long ticks that reads each item's own number (a height, a weight, a price), lit one
// whole tick at a time, with a pin where every item reads; under it a bezel that clicks round, a notch
// at a time, until the item in hand sits under the pointer in the accent. The name stands huge on the
// horizon. Below it the whole width of the stage is the item's ground, and its picture stands on that
// ground just under the name, never on a letter. At each beat the last note and number roll out, then
// the next picture rises from the bottom of the screen in front of the last one, which sinks back; its
// ground surges up behind it on a full-width scan line, washes over the name while the letters are
// swapped, and falls back to the horizon with the picture as the new letters jump up; the scale
// climbs to the new reading and the number rolls in on the new ground. Built on stage.js. The
// finished composition (reduced motion, no script) shows every item as a small stage of its own: its
// note, its name standing on its ground, its picture, its number and its reading.
//
// crosses words: `.idl-field` the incoming ground (wash) covers the outgoing name and uncovers the new one within a quarter screen
//
// DOM the scene expects (the script draws the dial, the grounds and the scan line itself, all
// aria-hidden, and splits the names and numbers into masked letters):
//
//   <section class="scene" data-scene="instrument-dial-stage" data-options='{}' aria-labelledby="t">
//     <div class="scene-stage">
//       <header class="idl-head"><h2 id="t" class="idl-title">One climb, four heights</h2></header>
//       <ol class="idl-items">
//         <li class="idl-item" data-at="640">                 data-at, data-tone: optional, see below
//           <h3 class="idl-word">Valley</h3>                  one word, 8 letters or fewer
//           <figure class="idl-subject"><img src="…" alt="…" width="840" height="1050"></figure>  4:5
//           <p class="idl-code">Set off at six</p>             a few words
//           <p class="idl-stat"><span class="idl-value">640 m</span>
//                               <span class="idl-caption">Car park by the fjord</span></p>
//         </li>
//         … 3 to 6 items read best; up to 12 work (the hold grows)
//       </ol>
//     </div>
//   </section>
//
// Per item, optional:
//   data-at    the item's reading on the dial, a number ("3,060" works). Without it the dial reads the
//              number in the item's .idl-value ("1,085 °C" reads 1085); when a value has no number,
//              the items read evenly. The scale runs from 0 (or a little under the lowest reading) to
//              the highest, each pin stands at its reading and the lit ticks climb to it. With data-at
//              on every item the finished composition also prints each reading ("640 of 3,060 m").
//   data-tone  a CSS colour for the item's ground below the horizon. Without it the grounds alternate
//              between a deep step of the page ink and a light step of the page ground. Text on a
//              ground takes the page ink or the page ground, whichever reads better on it.
//
// Options (data-options JSON), defaults in brackets:
//   hold   screens the stage is held [0.85 x items + 0.6, at most 7]; the phone holds 0.9 of it
//   scrub  seconds of catch-up, or true to lock to the scrollbar [0.8]
//   grow   start scale of the first name's lead-in, 0.18-0.40 [0.28]; it starts right of centre,
//          its right edge on the right edge of the finished name
//   ticks  ticks across the whole scale, 16-200 [about one every 12px of arc]
//   range  [low, high] of the scale [see data-at]
//   turn   degrees each picture rolls across its time on stage, 0-3 [1.2]
//   tilt   pictures lean toward a fine pointer on desktop [true]
//   field  each item's own ground below the horizon [true]; false keeps the page ground under every item
//   wash   the incoming ground washes up over the name before it settles on the horizon [true]
//   snap   when scrolling stops inside a change, finish it or undo it [false]; stops inside a hold stay
//   phone  'same' (the dial with phone numbers) or 'rest' (the finished composition) ['same']
//
// Page tokens it takes: --ink, --ground (or --bg), --accent, --font-display, --font-text.
// stage.js's --p (the scene's progress) is readable on the section only: the live stage stops it from
// inheriting into the split letters, which would re-style them all on every frame.
(() => {
  const ID = 'instrument-dial-stage';
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // how far letters roll out of their masks (yPercent): names, numbers (their commas hang low), lines
  const WR = 125; const VR = 135; const RR = 120;
  // where a new name's letters start under the falling ground: just below their masks
  const WI = 100;
  const num = (v, d) => (v === null || v === undefined || v === '' || typeof v === 'boolean' || !Number.isFinite(+v) ? d : +v);
  const r1 = (n) => Math.round(n * 10) / 10;
  const r2 = (n) => Math.round(n * 100) / 100;
  let uid = 0;

  const el = (tag, cls, attrs) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const svg = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  // The first number in a text: "3,060" → 3060, "1 085 °C" → 1085, "12,5 kg" → 12.5, "€49" → 49.
  const numOf = (s) => {
    if (s === null || s === undefined) return NaN;
    let t = String(s).replace(/[\s  ']/g, '').replace(/−/g, '-');
    t = t.replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
    const m = t.match(/-?\d+(?:[.,]\d+)?/);
    return m ? parseFloat(m[0].replace(',', '.')) : NaN;
  };

  // Dial geometry in stage px about the centre g = { cx, cy }, angles clockwise from 12 o'clock.
  const pt = (g, r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [g.cx + r * Math.cos(a), g.cy + r * Math.sin(a)]; };
  const seg = (g, ra, rb, deg) => { const [x1, y1] = pt(g, ra, deg); const [x2, y2] = pt(g, rb, deg); return `M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`; };
  const arc = (g, r, a0, a1) => { const [x0, y0] = pt(g, r, a0); const [x1, y1] = pt(g, r, a1); return `M${r2(x0)} ${r2(y0)}A${r2(r)} ${r2(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${r2(x1)} ${r2(y1)}`; };
  const tri = (g, rApex, rBase, half, deg) => {
    const [ax, ay] = pt(g, rApex, deg); const [bx, by] = pt(g, rBase, deg);
    const a = (deg * Math.PI) / 180; const px = Math.cos(a) * half; const py = Math.sin(a) * half;
    return `M${r2(ax)} ${r2(ay)}L${r2(bx + px)} ${r2(by + py)}L${r2(bx - px)} ${r2(by - py)}Z`;
  };

  const graphemes = (t) => {
    try { if (window.Intl && Intl.Segmenter) return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(t)].map((x) => x.segment); } catch (e) { /* fall through */ }
    return Array.from(t);
  };

  // Masked letters: <span class="idl-m"><span class="idl-c">A</span></span>, the full text kept for
  // screen readers. A zero-size mark on the baseline lets the script stand the name on the horizon.
  function letters(node) {
    if (!node) return { node: null, masks: [], chars: [] };
    if (node.__idl) return node.__idl;
    const text = node.textContent.replace(/\s+/g, ' ').trim();
    const sr = el('span', 'idl-sr'); sr.textContent = text;
    const vis = el('span', 'idl-chars', { 'aria-hidden': 'true' });
    for (const g of graphemes(text)) {
      const m = el('span', 'idl-m'); const c = el('span', 'idl-c');
      c.textContent = g === ' ' ? ' ' : g;
      m.append(c); vis.append(m);
    }
    const mark = el('i', 'idl-base');
    vis.append(mark);
    node.replaceChildren(sr, vis);
    node.__idl = { node, vis, mark, masks: [...vis.querySelectorAll('.idl-m')], chars: [...vis.querySelectorAll('.idl-c')], text };
    return node.__idl;
  }
  function roller(node) {
    if (!node) return null;
    let r = node.querySelector(':scope > .idl-roll');
    if (!r) { r = el('span', 'idl-roll'); r.append(...node.childNodes); node.append(r); }
    return r;
  }

  // Colours: an item's data-tone becomes its ground, and its text takes the page ink or the page
  // ground, whichever has more contrast on it. Read through a 1px canvas so any CSS colour works.
  let cv = null;
  const rgbOf = (css) => {
    try {
      cv = cv || Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
      cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = css; cv.fillRect(0, 0, 1, 1);
      const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]];
    } catch (e) { return null; }
  };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const contrast = (a, b) => { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  function tones(root) {
    if (root.classList.contains('idl-no-field')) return;
    const items = [...root.querySelectorAll('.idl-item')].filter((i) => i.dataset.tone);
    if (!items.length) return;
    const probe = el('i', '', { 'aria-hidden': 'true' });
    probe.style.cssText = 'position:absolute;inline-size:0;block-size:0;visibility:hidden';
    root.append(probe);
    const read = (c) => { probe.style.color = ''; probe.style.color = c; return rgbOf(getComputedStyle(probe).color); };
    const ink = read('var(--idl-ink)'); const ground = read('var(--idl-ground)');
    for (const it of items) {
      it.style.setProperty('--idl-tone', it.dataset.tone);
      const t = read(it.dataset.tone);
      if (t && ink && ground) it.style.setProperty('--idl-on', contrast(t, ink) >= contrast(t, ground) ? 'var(--idl-ink)' : 'var(--idl-ground)');
    }
    probe.remove();
  }

  // The finished composition keeps the instrument's reading as a line of text under each number, when
  // every item carries data-at: "640 of 3,060 m". Added up front, so reduced motion shows it too.
  function notes(root) {
    const items = [...root.querySelectorAll('.idl-item')];
    if (!items.length || root.querySelector('.idl-reading')) return;
    const at = items.map((i) => numOf(i.dataset.at));
    if (!at.every(Number.isFinite)) return;
    const mx = Math.max(...at);
    let fmt = (x) => String(x);
    try { const nf = new Intl.NumberFormat(document.documentElement.lang || undefined, { maximumFractionDigits: 2 }); fmt = (x) => nf.format(x); } catch (e) { /* plain numbers */ }
    items.forEach((it, k) => {
      const stat = it.querySelector('.idl-stat'); const val = it.querySelector('.idl-value');
      if (!stat) return;
      const unit = val ? val.textContent.replace(/\s+/g, ' ').trim().replace(/^[\s\S]*\d/, '').trim() : '';
      const s = el('span', 'idl-reading');
      s.textContent = `${fmt(at[k])} of ${fmt(mx)}${unit ? ' ' + unit : ''}`;
      stat.append(' ', s);
    });
  }

  // Where each item reads on the scale, 0-1: data-at on every item, else the number in every value,
  // else evenly.
  function readings(its, o) {
    const N = its.length;
    const fromAt = its.map((it) => { const s = it.item.dataset.at; return s === undefined || s === '' ? NaN : numOf(s); });
    const v = fromAt.every(Number.isFinite) ? fromAt : its.every((it) => Number.isFinite(it.valNum)) ? its.map((it) => it.valNum) : null;
    if (!N || !v) return its.map((_, k) => (k + 1) / N);
    const mn = Math.min(...v); const mx = Math.max(...v);
    let lo = mn >= 0 && mn <= 0.5 * mx ? 0 : mn - (mx - mn) / Math.max(2, N);
    let hi = mx;
    if (Array.isArray(o.range) && o.range.length === 2 && o.range.every((x) => Number.isFinite(+x)) && +o.range[0] !== +o.range[1]) { lo = +o.range[0]; hi = +o.range[1]; }
    if (hi === lo) hi = lo + 1;
    return v.map((x) => clamp((x - lo) / (hi - lo), 0, 1));
  }

  // Everything the script adds, made once per section and kept across desktop / phone rebuilds.
  function assemble(root, o) {
    if (root.__idlDom) return root.__idlDom;
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const id = `idl-${++uid}`;
    const its = [...root.querySelectorAll('.idl-item')].map((item, k) => {
      let fig = item.querySelector('.idl-subject');
      const word = item.querySelector('.idl-word');
      // an item without a picture still gets its ground
      if (!fig) { fig = el('figure', 'idl-subject', { 'aria-hidden': 'true' }); if (word) word.after(fig); else item.prepend(fig); }
      const img = fig.querySelector('img');
      let box = fig.querySelector('.idl-clip');
      let turn = fig.querySelector('.idl-turn');
      if (img && !box) {
        const media = img.closest('picture') || img;
        box = el('div', 'idl-clip'); turn = el('div', 'idl-turn');
        media.replaceWith(box); turn.append(media); box.append(turn);
      }
      // the item's ground: a full-width field the script slides, its top edge the scan line
      const field = el('i', 'idl-field', { 'aria-hidden': 'true' });
      const edge = el('i', 'idl-edge');
      field.append(edge);
      fig.prepend(field);
      if (img && img.decode) img.decode().catch(() => {});
      // each item stacks above the one before: its ground and picture cover the last item as they rise
      item.style.setProperty('--idl-k', k);
      const valueEl = item.querySelector('.idl-value');
      const valNum = numOf(valueEl && valueEl.textContent);
      return {
        item, fig, img, box, turn, field, edge, valNum,
        word: letters(word),
        value: letters(valueEl),
        code: roller(item.querySelector('.idl-code')),
        caption: roller(item.querySelector('.idl-caption')),
      };
    });
    const N = its.length;
    const fr = readings(its, o);

    // the dial, drawn in stage px by measure(): the scale (base, lit and finished ticks), the pins,
    // the bezel turning inside a window, and the fixed pointer
    const dsvg = svg('svg', { class: 'idl-ring', focusable: 'false' });
    const defs = svg('defs', {}); const cp = svg('clipPath', { id: `${id}-win` }); const win = svg('path', {});
    cp.append(win); defs.append(cp); dsvg.append(defs);
    const p = (cls) => svg('path', { class: cls });
    const layer = (cls) => { const g = svg('g', { class: cls }); const a = p('idl-tk'); const b = p('idl-tk idl-tk--major'); g.append(a, b); dsvg.append(g); return [a, b]; };
    const base = layer('idl-tk-base'); const lit = layer('idl-tk-lit'); const done = layer('idl-tk-done');
    const doneG = done[0].parentNode;
    const pinG = svg('g', { class: 'idl-pins' });
    const pins = its.map(() => { const e = p('idl-pin'); pinG.append(e); return e; });
    dsvg.append(pinG);
    const per = Math.max(2, Math.round(24 / N)); const notches = N * per; const bstep = 360 / notches;
    const bzWin = svg('g', { class: 'idl-bezel', 'clip-path': `url(#${id}-win)` });
    const bzRot = svg('g', {});
    const band = svg('circle', { class: 'idl-bz-band' });
    const notch = p('idl-bz-notch'); const secBase = p('idl-bz-sec');
    const secs = its.map(() => p('idl-bz-sec idl-bz-sec--lit'));
    bzRot.append(band, notch, secBase, ...secs);
    bzWin.append(bzRot);
    const ptr = p('idl-ptr');
    dsvg.append(bzWin, ptr);

    // the reading under the pointer: "2 of 4", only the active one shown
    const dial = el('p', 'idl-dial');
    const labels = its.map((_, k) => { const s = el('span', 'idl-roll'); s.textContent = `${k + 1} of ${N}`; dial.append(s); return s; });

    const inst = el('div', 'idl-instrument', { 'aria-hidden': 'true' });
    const hzp = el('i', 'idl-hz');
    inst.append(dsvg, dial, hzp);
    const head = stage.querySelector('.idl-head');
    if (head) head.after(inst); else stage.prepend(inst);
    root.style.setProperty('--idl-n', N);

    root.__idlDom = { stage, head, its, N, fr, dsvg, win, base, lit, done, doneG, pins, bzRot, band, notch, secBase, secs, per, notches, bstep, ptr, labels, dial, inst, hzp };
    return root.__idlDom;
  }

  // Pair kerning is lost when letters become inline blocks; measure each pair in the live face and
  // give it back as a margin in em.
  function kern(w) {
    if (!w.masks.length) return;
    const probe = el('span', 'idl-probe', { 'aria-hidden': 'true' });
    w.node.append(probe);
    const fs = parseFloat(getComputedStyle(w.node).fontSize) || 100;
    const cache = {};
    const wide = (t) => { if (!(t in cache)) { probe.textContent = t; cache[t] = probe.getBoundingClientRect().width; } return cache[t]; };
    const ch = w.chars.map((c) => c.textContent);
    for (let i = 0; i < w.masks.length; i++) {
      let k = 0;
      if (i < ch.length - 1) k = wide(ch[i] + ch[i + 1]) - wide(ch[i]) - wide(ch[i + 1]);
      w.masks[i].style.marginRight = Math.abs(k) > fs * 0.002 ? (k / fs).toFixed(4) + 'em' : '';
    }
    probe.remove();
  }

  // Ink extent of a split text above and below its baseline, in px, read from a canvas in the same face.
  let canvas = null;
  function ink(w, sample) {
    try {
      canvas = canvas || document.createElement('canvas').getContext('2d');
      const cs = getComputedStyle(w.node);
      const fs = parseFloat(cs.fontSize) || 16;
      canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      let t = sample || w.text || 'H';
      if (cs.textTransform === 'uppercase') t = t.toUpperCase();
      const m = canvas.measureText(t);
      const asc = m.actualBoundingBoxAscent; const desc = m.actualBoundingBoxDescent;
      if (!(asc > 0.3 * fs && asc < 1.3 * fs)) return { fs };
      return { fs, asc, desc: Math.max(0, desc) };
    } catch (e) { return { fs: 16 }; }
  }
  function clipToInk(w) {
    if (!w || !w.masks.length) return;
    const k = ink(w);
    if (!k.asc) { w.node.style.removeProperty('--idl-ct'); w.node.style.removeProperty('--idl-cb'); return; }
    const bl = w.mark.offsetTop; const m = w.masks[0]; const mt = m.offsetTop; const mh = m.offsetHeight;
    w.node.style.setProperty('--idl-ct', Math.max(0, bl - k.asc - 0.035 * k.fs - mt).toFixed(1) + 'px');
    w.node.style.setProperty('--idl-cb', Math.max(0, mt + mh - bl - k.desc - 0.012 * k.fs).toFixed(1) + 'px');
  }

  // Sizes that depend on the face and the viewport, all in stage px:
  // - the dial's stack at 12 o'clock (pins, ticks, pointer, bezel, the "2 of 4" line), from the top of
  //   the stage, or from under the heading when the heading crosses the middle (a phone);
  // - the name size F, one size for every name, fitted from the longest and kept under that stack;
  // - each item's ground line (the baseline, plus the overshoot of round letters, or the descenders);
  // - the picture box, standing on the ground a clear gap under the lowest ground line;
  // - the dial's arc: a circle through the stack whose scale spans about 62% of the stage width
  //   (86% on a phone) where it meets the names' band. The scale and the bezel's window are the widest
  //   arcs about 12 o'clock that keep clear of the names, the heading and the stage's edges.
  function measure(root, D, o, live) {
    const W = D.stage.clientWidth; const H = D.stage.clientHeight;
    if (!W || !H) return;
    const ph = live.phone;
    const hz = Math.round(D.hzp.offsetTop) || Math.round(H * 0.48);
    const k = ph ? 0.62 * clamp(W / 390, 0.85, 1.25) : clamp(Math.min(W / 1440, H / 900), 0.62, 1.3);
    const S = { pin: 22 * k, pinW: 12 * k, minor: 34 * k, major: 50 * k, gap: 10 * k, ptr: 15 * k, ptrW: 10 * k, bz: 16 * k, lab: 6 * k };

    // the heading's ink (its lines of text, not its box), in stage px
    let hb = null;
    if (D.head) {
      const sr = D.stage.getBoundingClientRect();
      const tw = document.createTreeWalker(D.head, NodeFilter.SHOW_TEXT);
      const rg = document.createRange();
      let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
      for (let t = tw.nextNode(); t; t = tw.nextNode()) {
        if (!t.textContent.trim()) continue;
        rg.selectNodeContents(t);
        for (const q of rg.getClientRects()) { if (!q.width) continue; x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); }
      }
      if (x0 < x1) hb = { x: x0 - sr.left, y: y0 - sr.top, r: x1 - sr.left, b: y1 - sr.top };
    }
    const across = hb && hb.x < W * 0.6 && hb.r > W * 0.4;
    const stackTop = across ? hb.b + 16 * k : Math.max(12, Math.round(H * 0.03));
    const labH = D.dial.offsetHeight || 22;
    const yIn = stackTop + S.pin + 3 + S.major;              // the scale's inner edge at 12 o'clock
    const yLab = yIn + S.gap + S.ptr + 2 + S.bz + S.lab;     // the "2 of 4" line under the bezel
    const stackB = yLab + labH;

    const words = D.its.map((x) => x.word).filter((w) => w.masks.length);
    const fz = D.its.map(() => hz);
    let cap = 0; let wordW = 0;
    if (words.length) {
      for (const w of words) kern(w);
      const f0 = parseFloat(getComputedStyle(words[0].node).fontSize) || 100;
      const widest = Math.max(...words.map((w) => w.vis.offsetWidth)) || 1;
      const capR = (ink(words[0], 'H').asc || 0.7 * f0) / f0;
      const fitW = ((ph ? 0.9 : 0.78) * W * f0) / widest;
      const fitH = (hz - 20 - stackB) / capR;
      const F = Math.max(16, Math.min(fitW, fitH));
      root.style.setProperty('--idl-f', F.toFixed(2) + 'px');
      const w0 = words[0];
      const bl = w0.mark.offsetTop;
      root.style.setProperty('--idl-bl', bl + 'px');
      cap = ink(w0, 'H').asc || capR * F;
      for (const w of D.its.flatMap((x) => [x.word, x.value])) clipToInk(w);
      D.its.forEach((it, i) => {
        if (!it.word.masks.length) return;
        // the ground meets the bottom of the ink, so round letters keep their overshoot
        fz[i] = hz + Math.max(0, Math.round(ink(it.word).desc || 0));
        wordW = Math.max(wordW, it.word.vis.offsetWidth);
      });
      root.style.setProperty('--idl-gy', Math.max(0, bl - w0.vis.offsetTop) + 'px');
    }
    D.its.forEach((it, i) => it.item.style.setProperty('--idl-fz', fz[i] + 'px'));
    // the incoming ground washes up to a little above the cap line
    const pk = Math.round(hz - cap - 16);
    root.style.setProperty('--idl-pt', pk + 'px');

    // the picture: standing on the ground under the name, its top a clear gap below the lowest ground
    // line (the foot of the name's ink), so it never lies on a letter; down to the foot of the stage on
    // desktop, down to the note and number on a phone
    const pic = Math.round(Math.max(...fz) + Math.max(12, 0.08 * cap));
    const it0 = D.its[0];
    const codeP = it0 && it0.code ? it0.code.parentNode : null;
    const pad = codeP && codeP.offsetLeft > 0 ? codeP.offsetLeft : clamp(0.034 * window.innerWidth, 20, 48);
    let bw; let bh;
    if (ph) {
      const statP = it0 ? it0.item.querySelector('.idl-stat') : null;
      const foot = Math.min(codeP ? codeP.offsetTop : H, statP ? statP.offsetTop : H);
      const room = Math.max(120, foot - 16 - pic);
      bw = Math.min(0.8 * W, room * 0.8); bh = Math.min(bw * 1.25, room);
    } else {
      bh = H - pic + 2;
      bw = Math.max(160, Math.min(0.375 * W, bh * 1.1, W - 2 * (pad + 280)));
    }
    root.style.setProperty('--idl-pic', pic + 'px');
    root.style.setProperty('--idl-box-w', Math.round(bw) + 'px');
    root.style.setProperty('--idl-box-h', Math.round(bh) + 'px');

    // the dial's circle
    const bandTop = Math.round(hz - cap - Math.max(12, 18 * k));
    const half = wordW ? wordW / 2 + 14 : 0;
    const s = Math.max(24, bandTop - yIn);
    const h = (ph ? 0.43 : 0.31) * W;
    const rIn = Math.max(s, (h * h + s * s) / (2 * s));
    const g = { cx: W / 2, cy: yIn + rIn };
    const rMinor = rIn + S.minor; const rMajor = rIn + S.major;
    const rPinA = rMajor + 3; const rPinB = rPinA + S.pin;
    const rPtrB = rIn - S.gap; const rPtrA = rPtrB - S.ptr;
    const rBzO = rPtrA - 2; const rBzI = rBzO - S.bz; const rBz = (rBzO + rBzI) / 2;

    // what the dial keeps clear of: the names' band, the heading, the stage's edges
    const m = 6 + S.pinW; const hm = 14 * k;
    const free = (x, y) => {
      if (x < m || x > W - m || y < 1) return false;
      if (y > bandTop - 3 && (y > hz - 3 || Math.abs(x - g.cx) < half + 3)) return false;
      if (hb && x > hb.x - hm && x < hb.r + hm && y > hb.y - hm && y < hb.b + hm) return false;
      return true;
    };
    const reach = (radii) => {
      const ok = (deg) => radii.every((r) => { const [x1, y1] = pt(g, r, deg); const [x2, y2] = pt(g, r, -deg); return free(x1, y1) && free(x2, y2); });
      let t = 0;
      while (t < 88 && ok(t + 0.25)) t += 0.25;
      return t;
    };
    const tS = Math.max(3, reach([rIn, (rIn + rMajor) / 2, rMajor, rPinB]));
    const arcLen = (2 * rIn * tS * Math.PI) / 180;
    const want = o.ticks || arcLen / (ph ? 8.5 : 12 * Math.max(0.85, k));
    const steps = Math.max(4, Math.round(clamp(want, 16, 200) / 2));
    const pitch = tS / steps;
    const minor = []; const major = [];
    for (let i = -steps; i <= steps; i++) {
      const deg = i * pitch; const big = i % 5 === 0;
      minor.push(big ? '' : seg(g, rIn, rMinor, deg));
      major.push(big ? seg(g, rIn, rMajor, deg) : '');
    }
    D.dsvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    D.base[0].setAttribute('d', minor.join('')); D.base[1].setAttribute('d', major.join(''));
    live.scale = { count: 2 * steps + 1, minor, major };
    live.n = -1;
    // each pin pops in about its own centre (the render writes its scale about pinC, so a pin that
    // lands after a resize pops where it now stands)
    const pinC = D.pins.map((e, i) => {
      const deg = -tS + D.fr[i] * 2 * tS;
      e.setAttribute('d', tri(g, rPinA, rPinB, S.pinW, deg));
      return pt(g, (rPinA + rPinB) / 2, deg);
    });
    D.ptr.setAttribute('d', tri(g, rPtrA, rPtrB, S.ptrW, 0));

    // the bezel: a band with notches and one sector per item, turning inside a wedge about 12 o'clock
    const tB = Math.max(4, Math.min(tS, reach([rBzI, rBzO])));
    const rw = (rBzO + 40) / Math.cos(((tB / 8) * Math.PI) / 180);
    let wd = `M${r2(g.cx)} ${r2(g.cy)}`;
    for (let i = 0; i <= 8; i++) { const [x, y] = pt(g, rw, -tB + (2 * tB * i) / 8); wd += `L${r2(x)} ${r2(y)}`; }
    D.win.setAttribute('d', wd + 'Z');
    for (const [a, v] of [['cx', g.cx], ['cy', g.cy], ['r', rBz], ['stroke-width', S.bz]]) D.band.setAttribute(a, r2(v));
    let nd = '';
    for (let i = 0; i < D.notches; i++) if (i % D.per) nd += seg(g, rBzI, rBzO, i * D.bstep);
    D.notch.setAttribute('d', nd);
    const hs = Math.min((360 / D.N) * 0.2, (((110 * k) / rBz) * 180) / Math.PI, tB * 0.45);
    let sd = '';
    D.secs.forEach((e, i) => { const a = (360 * i) / D.N; const d = arc(g, rBz, a - hs, a + hs); sd += d; e.setAttribute('d', d); e.setAttribute('stroke-width', r2(S.bz)); });
    D.secBase.setAttribute('d', sd); D.secBase.setAttribute('stroke-width', r2(S.bz));
    D.dial.style.top = r1(yLab) + 'px';

    // where the first picture waits before the intro stands it up: on its ground, under the horizon
    const p0 = clamp(1 - Math.max(0, fz[0] + clamp(Math.round(H * 0.02), 12, 20) - pic) / (H - pic + 40), 0, 1);
    // how far a rising picture overshoots its place during a change, before it settles with its
    // ground: inside the gap under the name, so it never reaches the letters
    const lift = Math.max(0, Math.round(Math.min(0.5 * (pic - Math.max(...fz)), 0.04 * cap)));
    live.geo = { W, H, hz, fz, pk, pic, bh, g, p0, lift, pinC };
  }

  // Pictures lean toward a fine pointer on desktop (perspective 1200, lerped on the ticker).
  function tilt(root, D, live) {
    if (root.__idlTilt) return;
    root.__idlTilt = true;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let tx = 0; let ty = 0; let x = 0; let y = 0; let last = '';
    window.addEventListener('pointermove', (e) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    const els = D.its.map((i) => i.box).filter(Boolean);
    gsap.ticker.add(() => {
      const on = live.tilt && !live.phone && fine.matches && root.classList.contains('is-live') && live.st && live.st.isActive;
      const gx = on ? tx : 0; const gy = on ? ty : 0;
      x += (gx - x) * 0.12; y += (gy - y) * 0.12;
      if (!on && Math.abs(x) < 0.002 && Math.abs(y) < 0.002) {
        x = 0; y = 0;
        if (last) { last = ''; for (const e of els) e.style.transform = ''; }
        return;
      }
      const t = `perspective(1200px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 16).toFixed(2)}deg)`;
      if (t !== last) { last = t; for (const e of els) e.style.transform = t; }
    });
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const N = root.querySelectorAll('.idl-item').length;
    if (!N || !window.Stage) return null;
    const o = {
      scrub: opts.scrub === true || num(opts.scrub, 0.8) <= 0 ? true : Math.min(3, num(opts.scrub, 0.8)),
      grow: clamp(num(opts.grow, 0.28), 0.18, 0.4),
      ticks: opts.ticks === undefined || opts.ticks === null ? 0 : Math.round(clamp(num(opts.ticks, 0), 16, 200)),
      range: opts.range,
      turn: clamp(num(opts.turn, 1.2), 0, 3),
      tilt: opts.tilt !== false,
      field: opts.field !== false,
      wash: opts.wash !== false,
      snap: opts.snap === true,
    };
    if (!o.field) root.classList.add('idl-no-field');
    // tones and readings up front: Stage.scene's matchMedia never fires on a desktop with reduced
    // motion (neither of its conditions matches), so neither build nor rest runs there
    tones(root);
    notes(root);
    // a face that arrives after load changes every measured size: measure again (once per page)
    if (Stage.live && window.ScrollTrigger && !window.__idlFonts && document.fonts && document.fonts.addEventListener) {
      window.__idlFonts = true;
      let t = 0;
      document.fonts.addEventListener('loadingdone', () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); });
    }
    const holdD = r2(clamp(num(opts.hold, Math.min(7, 0.85 * N + 0.6)), 1, 12));
    const holdP = r2(holdD * 0.9);
    const live = { n: -1, deg: 0, bz: { a: 0 }, rot: null, st: null, phone: false, tilt: o.tilt, geo: null, scale: null };

    // the finished composition: the item tones, and nothing the live stage wrote by hand
    const rest = () => {
      tones(root);
      const D = root.__idlDom;
      if (!D) return;
      for (const it of D.its) {
        it.fig.style.visibility = ''; it.vis = null;
        it.field.style.transform = ''; it.fy = null;
        it.edge.style.opacity = ''; it.ea = null;
        if (it.box) { it.box.style.transform = ''; it.box.style.translate = ''; it.box.style.scale = ''; it.bt = null; }
      }
    };

    const build = (tl, ctx) => {
      const D = assemble(root, o);
      const its = D.its;
      tones(root);
      live.phone = ctx.phone;
      live.st = tl.scrollTrigger || null;
      measure(root, D, o, live);

      const hold = ctx.phone ? holdP : holdD;
      const w = Math.min(0.03, 0.12 / hold);     // half of a change, in progress; about a quarter screen
      const u = w / 0.03;
      const Tk = (k) => 0.1 + (0.84 * k) / N;
      // 2D transforms: letters and lines roll inside their name's layer instead of each being promoted
      // (and dropped again) by a 3D transform at every change
      const IR = { immediateRender: false, force3D: false };
      const IRo = { immediateRender: false }; // plain-object tweens (dial, fill, pins, plates): force3D only means something on elements
      // the scrubbed state the render below turns into grounds, pictures, ticks and the bezel's clicks
      // p: the picture rising, r: the ground rising, s: the ground settling on the horizon.
      // The first item is in place from the start.
      const plates = its.map((_, k) => ({ p: k === 0 ? 1 : 0, r: k === 0 ? 1 : 0, s: 0 }));
      const fill = { f: -0.05 };
      const start = Math.round(180 / N / D.bstep) * D.bstep;
      const dial = { deg: start };

      // the state before the first beat
      its.forEach((it, k) => {
        gsap.set(it.word.chars, { yPercent: k === 0 ? 0 : WR });
        if (it.value.chars.length) gsap.set(it.value.chars, { yPercent: VR });
        const rolls = [it.code, it.caption].filter(Boolean);
        if (rolls.length) gsap.set(rolls, { yPercent: RR });
        if (it.img) gsap.set(it.img, { yPercent: 4, scale: 1.08 });
        if (it.turn) gsap.set(it.turn, { rotation: -o.turn, yPercent: 3, scale: 1.1 });
        it.fy = null; it.ea = null; it.bt = null; it.vis = null;
      });
      gsap.set(D.labels, { yPercent: RR });
      // each pin's pop, 0 → 1: its opacity, and its scale from 1.6 to 1 (written by the render)
      const pinA = its.map(() => ({ a: 0 }));
      live.pa = its.map(() => null);
      gsap.set(D.secs, { opacity: 0 });
      gsap.set(D.doneG, { opacity: 0 });
      live.deg = start;

      // the picture settles as it rises (never so far that the box shows behind it)
      const enter = (it, at, dur) => { if (it.img) tl.fromTo(it.img, { yPercent: 4, scale: 1.08 }, { yPercent: 0, scale: 1, duration: dur, ease: 'power2.out', ...IR }, at); };
      const valueIn = (it, at) => {
        if (it.value.chars.length) tl.fromTo(it.value.chars, { yPercent: VR }, { yPercent: 0, duration: 0.018 * u, ease: 'power3.out', stagger: { amount: 0.008 * u }, ...IR }, at);
        if (it.caption) tl.fromTo(it.caption, { yPercent: RR }, { yPercent: 0, duration: 0.02 * u, ease: 'power3.out', ...IR }, at + 0.004 * u);
      };

      // INTRO: the stage arrives whole (the first ground, its picture lying under the horizon and a
      // small name right of centre); the name grows to its full size as the picture stands up under
      // it, the bezel clicks round to the first item, the scale climbs to the first reading, and the
      // note and number roll in
      tl.fromTo(dial, { deg: start }, { deg: 0, duration: 0.07, ease: 'expo.inOut', ...IRo }, 0.01);
      if (its[0].word.vis) tl.fromTo(its[0].word.vis, { scale: o.grow }, { scale: 1, duration: 0.07, ease: 'power3.inOut', immediateRender: true }, 0);
      tl.fromTo(plates[0], { p: () => (live.geo ? live.geo.p0 : 1) }, { p: 1, duration: 0.07, ease: 'power3.inOut', immediateRender: true }, 0);
      enter(its[0], 0, 0.12);
      if (its[0].code) tl.fromTo(its[0].code, { yPercent: RR }, { yPercent: 0, duration: 0.025, ease: 'power3.out', ...IR }, 0.05);
      valueIn(its[0], 0.056);
      tl.fromTo(D.labels[0], { yPercent: RR }, { yPercent: 0, duration: 0.02, ease: 'power3.out', ...IR }, 0.07);
      tl.fromTo(D.secs[0], { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, 0.075);
      tl.fromTo(fill, { f: -0.05 }, { f: D.fr[0], duration: 0.055, ...IRo }, 0.05);
      tl.fromTo(pinA[0], { a: 0 }, { a: 1, duration: 0.012, ease: 'power3.out', ...IRo }, 0.1);

      // BEATS: the last note and number roll out; then the next picture rises from below the stage in
      // front of the last one, which sinks back, and settles under the name (never on it).
      // Its ground surges up behind it on the scan line. With wash the ground runs on over the name
      // (a fast clean cut across a still word), the letters are swapped at its crest, and it falls
      // back to the horizon as the new letters jump up out of it. Without wash it stops on the horizon
      // while the letters reel over. The bezel clicks round, the scale climbs to the new reading, and
      // the note, the number and the reading roll over.
      for (let k = 1; k < N; k++) {
        const T = Tk(k); const a = its[k - 1]; const b = its[k];
        tl.fromTo(plates[k], { p: 0 }, { p: 1, duration: (o.wash ? 0.026 : 0.03) * u, ease: 'power3.out', ...IRo }, T - 0.03 * u);
        enter(b, T - 0.03 * u, 0.06 * u);
        // the last note and number roll out before the new picture and ground set off (quick, all
        // gone by T - 0.032, so no letter is still there when the new picture rises over its place)
        if (a.code) tl.fromTo(a.code, { yPercent: 0 }, { yPercent: -RR, duration: 0.007 * u, ease: 'power2.in', ...IR }, T - 0.04 * u);
        if (a.value.chars.length) tl.fromTo(a.value.chars, { yPercent: 0 }, { yPercent: -VR, duration: 0.006 * u, ease: 'power2.in', stagger: { amount: 0.002 * u }, ...IR }, T - 0.04 * u);
        if (a.caption) tl.fromTo(a.caption, { yPercent: 0 }, { yPercent: -RR, duration: 0.007 * u, ease: 'power2.in', ...IR }, T - 0.039 * u);
        if (o.wash) {
          tl.fromTo(plates[k], { r: 0 }, { r: 1, duration: 0.032 * u, ease: 'power2.in', ...IRo }, T - 0.032 * u);
          tl.fromTo(a.word.chars, { yPercent: 0 }, { yPercent: -WR, duration: 0.0003 * u, ...IR }, T - 0.0002 * u);
          // the fall is short and the letters start just under their masks, so the stage is without
          // a readable name for under 0.01 of progress
          tl.fromTo(plates[k], { s: 0 }, { s: 1, duration: 0.018 * u, ease: 'power3.out', ...IRo }, T);
          tl.fromTo(b.word.chars, { yPercent: WI }, { yPercent: 0, duration: 0.013 * u, ease: 'power3.out', stagger: { amount: 0.006 * u }, ...IR }, T + 0.0003 * u);
        } else {
          tl.fromTo(plates[k], { r: 0 }, { r: 1, duration: 0.05 * u, ease: 'power3.inOut', ...IRo }, T - 0.03 * u);
          tl.fromTo(a.word.chars, { yPercent: 0 }, { yPercent: -WR, duration: 0.016 * u, ease: 'power3.in', stagger: { amount: 0.012 * u }, ...IR }, T - 0.026 * u);
          tl.fromTo(b.word.chars, { yPercent: WR }, { yPercent: 0, duration: 0.02 * u, ease: 'power3.out', stagger: { amount: 0.012 * u }, ...IR }, T - 0.018 * u);
        }
        tl.fromTo(dial, { deg: (-360 * (k - 1)) / N }, { deg: (-360 * k) / N, duration: 0.05 * u, ease: 'expo.inOut', ...IRo }, T - 0.025 * u);
        tl.fromTo(D.secs[k - 1], { opacity: 1 }, { opacity: 0, duration: 0.004 * u, ...IR }, T - 0.01 * u);
        tl.fromTo(D.secs[k], { opacity: 0 }, { opacity: 1, duration: 0.004 * u, ...IR }, T + 0.008 * u);
        tl.fromTo(D.labels[k - 1], { yPercent: 0 }, { yPercent: -RR, duration: 0.012 * u, ease: 'power2.in', ...IR }, T - 0.025 * u);
        tl.fromTo(D.labels[k], { yPercent: RR }, { yPercent: 0, duration: 0.012 * u, ease: 'power3.out', ...IR }, T + 0.013 * u);
        // the new note and number roll in on the new ground
        if (b.code) tl.fromTo(b.code, { yPercent: RR }, { yPercent: 0, duration: 0.018 * u, ease: 'power3.out', ...IR }, T);
        valueIn(b, T + 0.004 * u);
        tl.fromTo(fill, { f: D.fr[k - 1] }, { f: D.fr[k], duration: 0.05 * u, ...IRo }, T - 0.02 * u);
        tl.fromTo(pinA[k], { a: 0 }, { a: 1, duration: 0.01 * u, ease: 'power3.out', ...IRo }, T + 0.02 * u);
      }

      // DRIFT: each picture keeps rolling slowly while it is on stage, so no hold is dead
      its.forEach((it, k) => {
        if (!it.turn) return;
        const from = k === 0 ? 0.006 : Tk(k) - 0.03 * u;
        const to = k === N - 1 ? 1 : Tk(k + 1) + 0.03 * u;
        tl.fromTo(it.turn, { rotation: -o.turn, yPercent: 3 }, { rotation: o.turn, yPercent: -3, duration: to - from, ease: 'none', ...IR }, from);
      });

      // OUTRO: the lit scale turns to the accent
      tl.fromTo(D.doneG, { opacity: 0 }, { opacity: 1, duration: 0.03, ...IR }, 0.94);

      // the bezel moves in 360/notches steps, each one a short time-based click, in both directions
      const paintBz = () => { const gg = live.geo && live.geo.g; if (gg) D.bzRot.setAttribute('transform', `rotate(${live.bz.a.toFixed(3)} ${r2(gg.cx)} ${r2(gg.cy)})`); };
      live.bz = { a: start };
      live.rot = gsap.quickTo(live.bz, 'a', { duration: 0.2, ease: 'power4.out', onUpdate: paintBz });
      live.rot(start, start);
      paintBz();

      // the grounds, the pictures, the scan line, the lit ticks and the bezel follow the scrubbed proxies
      const render = () => {
        const g = live.geo;
        if (g) {
          let top = -1;
          for (let k = 0; k < N; k++) {
            const pl = plates[k]; const it = its[k];
            const fzk = g.fz[k];
            const peak = k === 0 || !o.wash ? fzk : g.pk;
            const y = pl.s > 0 ? peak + (fzk - peak) * pl.s : g.H + (peak - g.H) * pl.r;
            const fy = r1(y - g.pk);
            if (fy !== it.fy) { it.field.style.transform = `translate3d(0,${fy}px,0)`; it.fy = fy; }
            // the scan line shows only below the horizon, so it never crosses the name
            const ea = pl.r > 0 && pl.r < 1 && pl.s <= 0 ? (clamp((y - g.hz - 4) / 64, 0, 1) * clamp(pl.r / 0.04, 0, 1)).toFixed(2) : '0';
            if (ea !== it.ea) { it.edge.style.opacity = ea; it.ea = ea; }
            if (it.box) {
              // rising: from under the stage to above its place (with wash), then down with its ground;
              // the one before sinks back behind it
              const out = k + 1 < N ? plates[k + 1].p : 0;
              const lift = k > 0 && o.wash ? g.lift : 0;
              const ty = r1((1 - pl.p) * (g.H - g.pic + 40) - lift * pl.p * (1 - pl.s) + out * 0.1 * g.bh);
              const sc = (1 - 0.1 * out).toFixed(4);
              const bt = ty + '|' + sc;
              if (bt !== it.bt) { it.box.style.translate = `0 ${ty}px`; it.box.style.scale = sc; it.bt = bt; }
            }
            // once a ground has crested it covers every earlier item (and the earlier ground must not
            // show as a strip under it when the new name stands a pixel or two lower)
            if (pl.r >= 1 && (peak === fzk || pl.s > 0)) top = k;
          }
          // items wholly covered by a later settled one, or not yet risen, are not painted
          for (let k = 0; k < N; k++) {
            const v = k < top || (plates[k].p <= 0 && plates[k].r <= 0) ? 'hidden' : '';
            if (v !== its[k].vis) { its[k].fig.style.visibility = v; its[k].vis = v; }
          }
          // the pins: opacity, and a scale about each pin's own centre
          for (let i = 0; i < N; i++) {
            const a = clamp(pinA[i].a, 0, 1).toFixed(3);
            if (a === live.pa[i] || !g.pinC[i]) continue;
            live.pa[i] = a;
            const sc = 1.6 - 0.6 * a; const [cx, cy] = g.pinC[i];
            D.pins[i].setAttribute('opacity', a);
            D.pins[i].setAttribute('transform', `matrix(${r2(sc)} 0 0 ${r2(sc)} ${r2(cx * (1 - sc))} ${r2(cy * (1 - sc))})`);
          }
        }
        const S = live.scale;
        if (S) {
          const n = fill.f < 0 ? 0 : clamp(Math.floor(fill.f * (S.count - 1) + 1e-6) + 1, 0, S.count);
          if (n !== live.n) {
            live.n = n;
            const mi = S.minor.slice(0, n).join(''); const ma = S.major.slice(0, n).join('');
            D.lit[0].setAttribute('d', mi); D.lit[1].setAttribute('d', ma);
            D.done[0].setAttribute('d', mi); D.done[1].setAttribute('d', ma);
          }
        }
        const s = Math.round(dial.deg / D.bstep) * D.bstep + 0;
        if (s !== live.deg) { live.deg = s; live.rot(s); }
        const pr = tl.progress(); let beat = 0;
        for (let k = 1; k < N; k++) if (pr >= Tk(k)) beat = k;
        if (root.dataset.beat !== String(beat)) root.dataset.beat = String(beat);
      };
      // after a refresh every tween is invalidated and would read its start values lazily, at the first
      // change a reader scrolls into; read them all now instead, then come back to where the page is
      live.warm = () => { const pr = tl.progress(); tl.progress(1, true); tl.progress(pr, true); };
      live.render = () => {
        live.n = -1;
        live.pa = its.map(() => null);
        for (const it of its) { it.fy = null; it.ea = null; it.bt = null; it.vis = null; }
        render();
        if (live.rot) { live.rot(live.deg, live.deg); live.bz.a = live.deg; paintBz(); }
      };
      tl.eventCallback('onUpdate', render);
      render();

      // snap: a stop inside a hold stays where it is; a stop inside a change (or the intro) finishes
      // or undoes it, whichever is nearer
      if (o.snap) {
        const wins = [[0.004, 0.125]];
        for (let k = 1; k < N; k++) wins.push([Tk(k) - 0.046 * u, Tk(k) + 0.03 * u]);
        const snapTo = (v) => { for (const [a, b] of wins) if (v > a && v < b) return v - a < b - v ? Math.max(0, a - 0.004) : b; return v; };
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', snap: { snapTo, duration: { min: 0.25, max: 0.6 }, delay: 0.12, ease: 'power1.inOut' } });
      }

      if (!root.__idlRefresh) {
        root.__idlRefresh = true;
        ScrollTrigger.addEventListener('refreshInit', () => { if (root.classList.contains('is-live')) measure(root, root.__idlDom, o, live); });
        ScrollTrigger.addEventListener('refresh', () => { if (root.classList.contains('is-live') && live.render) { if (live.warm) live.warm(); live.render(); } });
      }
      tilt(root, D, live);
    };

    return Stage.scene(root, { hold: holdD, scrub: o.scrub, build, rest, phone: opts.phone === 'rest' ? 'rest' : { hold: holdP, build } });
  };
})();
