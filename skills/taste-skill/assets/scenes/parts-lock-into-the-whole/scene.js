/*
  parts-lock-into-the-whole - the product is put together in front of the visitor. The stage opens
  on one huge word alone (a year, a figure, a name). It steps back into its place in the product's
  own interface while that interface's panels fly in from the four edges (the toolbar from the top,
  the sidebar from the left, the inspector from the right, the main pane from the foot) and lock
  into one whole screen. Then layers of detail ink in one at a time (the data, the team's comments,
  an agent's edit), and the finished screen steps aside into a column beside the heading and a short
  spec list. No caption under the screen: the heading and the spec rows say what it is.

  <section class="sc" data-big-scene="parts-lock-into-the-whole" data-big-scene-opts='{"hold":1}' style="--h: 1" aria-labelledby="pl-h">
    <div class="sc__stage">
      <p class="pl__word" aria-hidden="true">2027</p>                       the opening word
      <div class="pl__ui" data-ui>                                          the screen: a grid of 3-5 panels
        <div class="pl__panel pl__bar">…</div>        grid-area bar
        <div class="pl__panel pl__side">…</div>       grid-area side
        <div class="pl__panel pl__main"><p class="pl__title">Headcount <span class="pl__title-word">2027</span></p> …</div>
        <div class="pl__panel pl__insp">…</div>       grid-area insp
      </div>
      <div class="pl__spec"><h2 id="pl-h">Two lines at most</h2><dl><div><dt>…</dt><dd>…</dd></div> … 3-4 rows</dl></div>
    </div>
  </section>
  Detail layers: data-layer="1" … "4" on elements inside the panels; data-ink="x" grows a bar from its left edge.
  Phones show the finished composition (the screen with its toolbar and main pane, the spec under it).
*/
import { scene, seg, ease } from '../lib.js';

export default function mount(root, opts = {}) {
  const word = root.querySelector('.pl__word'), ui = root.querySelector('.pl__ui'), titleWord = root.querySelector('.pl__title-word');
  const panels = { bar: root.querySelector('.pl__bar'), side: root.querySelector('.pl__side'), main: root.querySelector('.pl__main'), insp: root.querySelector('.pl__insp') };
  const spec = root.querySelector('.pl__spec');
  root.querySelectorAll('.pl__caption').forEach(c => c.remove());     // an older markup's caption under the screen: never shown
  if (!ui) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const layers = [...root.querySelectorAll('[data-layer]')];
  const L = Math.max(...layers.map(el => +el.dataset.layer), 1);
  let geo = null;
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    minWidth: 1200,                 // below it the finished composition: the screen beside the spec needs the width
    measure(ctx) {
      ui.style.transform = ''; if (word) word.style.transform = '';
      for (const el of Object.values(panels)) if (el) el.style.transform = '';
      // in the stage's own coordinates: the stage may sit below the fold when this runs
      const st = ctx.stage.getBoundingClientRect();
      const ub = ui.getBoundingClientRect();
      const off = {};
      for (const [k, el] of Object.entries(panels)) {
        if (!el) continue;
        const b = el.getBoundingClientRect(), top = b.top - st.top, bottom = b.bottom - st.top;
        off[k] = k === 'bar' ? [0, -(bottom + 20)] : k === 'side' ? [-(b.right + 20), 0] : k === 'insp' ? [ctx.vw - b.left + 20, 0] : [0, ctx.vh - top + 20];
      }
      let flip = null;
      if (word && titleWord) {
        const wb = word.getBoundingClientRect(), tb = titleWord.getBoundingClientRect();
        const s = tb.height / wb.height;
        flip = { s, dx: tb.left - wb.left, dy: tb.top - wb.top };
      }
      // the end: the screen steps left into a column at least 600px wide; the spec takes the right
      // (the spec keeps 380px at the right; the scene runs from 1200px, so the screen keeps 0.8 of its size or more and its text 10.5px)
      const pad = parseFloat(getComputedStyle(root).getPropertyValue('--pad')) || 40;
      const s = Math.min(1, (ctx.vw - 380 - 3.5 * pad) / Math.max(1, ub.width));
      const col = { s, dx: -(ub.left + ub.width / 2 - (pad + ub.width * s / 2)), dy: 0 };
      root.style.setProperty('--pl-spec-x', (pad * 2.5 + ub.width * s).toFixed(0) + 'px');
      geo = { off, flip, col };
    },
    update(p) {
      if (!geo) return;
      for (const [k, el] of Object.entries(panels)) {
        if (!el) continue;
        const [x, y] = geo.off[k];
        const kk = seg(p, 0.04 + (k === 'main' ? 0.05 : k === 'insp' ? 0.03 : 0), 0.32, ease.out);
        el.style.transform = kk < 1 ? `translate3d(${(x * (1 - kk)).toFixed(1)}px, ${(y * (1 - kk)).toFixed(1)}px, 0)` : '';
      }
      if (word && geo.flip) {
        const k = seg(p, 0.02, 0.3, ease.inOut);
        const s = 1 + (geo.flip.s - 1) * k;
        word.style.transform = `translate3d(${(geo.flip.dx * k).toFixed(1)}px, ${(geo.flip.dy * k).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        word.style.visibility = p >= 0.3 ? 'hidden' : '';
        if (titleWord) titleWord.style.visibility = p >= 0.3 ? 'visible' : 'hidden';   // 'visible', not '': the live CSS hides it until the word lands
      }
      // the lock: a short settle of the whole screen as the parts meet
      const lock = seg(p, 0.3, 0.36, ease.out);
      ui.style.setProperty('--pl-box', seg(p, 0.22, 0.34, ease.out).toFixed(3));
      const settle = 1 + 0.012 * Math.sin(lock * Math.PI);
      // the layers
      const a0 = 0.38, span = (0.74 - a0) / L;
      layers.forEach(el => {
        const l = +el.dataset.layer;
        const k = seg(p, a0 + (l - 1) * span, a0 + (l - 1) * span + span * 0.6, ease.out);
        el.style.opacity = k.toFixed(3);
        if (el.dataset.ink === 'x') el.style.transform = `scaleX(${k.toFixed(3)})`;
        else el.style.transform = k < 1 ? `translate3d(0, ${((1 - k) * 6).toFixed(1)}px, 0)` : '';
        el.style.visibility = k <= 0 ? 'hidden' : '';
      });
      // the end: the screen steps aside, the spec arrives
      const e = seg(p, 0.76, 0.96, ease.inOut);
      const s = settle * (1 + (geo.col.s - 1) * e);
      ui.style.transform = `translate3d(${(geo.col.dx * e).toFixed(1)}px, ${(geo.col.dy * e).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
      if (spec) { const k = seg(p, 0.84, 1, ease.out); spec.style.opacity = k.toFixed(3); spec.style.transform = `translate3d(0, ${((1 - k) * 24).toFixed(1)}px, 0)`; spec.style.visibility = k <= 0 ? 'hidden' : ''; }
    },
    rest() {
      for (const el of Object.values(panels)) if (el) el.style.cssText = '';
      if (word) word.style.cssText = ''; if (titleWord) titleWord.style.cssText = '';
      layers.forEach(el => { el.style.cssText = ''; });
      ui.style.cssText = ''; ui.style.removeProperty('--pl-box'); root.style.removeProperty('--pl-spec-x'); if (spec) spec.style.cssText = '';
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); } };
}
