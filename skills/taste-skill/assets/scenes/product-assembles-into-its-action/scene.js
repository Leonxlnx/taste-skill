/*
  product-assembles-into-its-action - the product's own working screen builds itself in the order
  of its own story while the page is held, then every part folds into its one action. The screen
  opens on its first rows (the header of an invoice, the title of a board), its box only as tall as
  what it holds. Each step slides the next part in from the foot of the screen, the newest rows in
  the accent for a beat, while the step's caption takes the ink in the list beside it. Then the rows
  fold back into the action, nearest first, the screen's box closes round the action and goes, and
  the action stands alone, larger, with its state beside it and one closing line centred under it.
  It stays a real button.

  <section class="sc" data-big-scene="product-assembles-into-its-action" data-big-scene-opts='{"hold":1}' style="--h: 1" aria-labelledby="pa-h">
    <div class="sc__stage">
      <div class="pa__copy">
        <h2 id="pa-h">Two lines at most</h2>
        <ol class="pa__steps"><li>What the first rows are</li><li>What step 2 adds</li> … 4-6 steps, 4-10 words each: one a step, in order</ol>
        <p class="pa__close">One line for the fold, 4-8 words</p>                 optional: while live it rides the screen and ends centred under the action
        <a class="sc__skip" href="#next">Skip</a>                                 optional
      </div>
      <div class="pa__screen" data-ui>                   the finished screen; its rows are its direct children
        <div class="pa__row">…the screen's own header…</div>                      no data-at: there from step 1
        <div class="pa__row" data-at="2">…a row step 2 adds…</div>
        <div class="pa__row pa__row--action"><button type="button" data-at="4" data-action>Send £6,912.00</button> <span data-at="5">Paid 14 Nov</span></div>
      </div>
    </div>
  </section>
  Phones show the finished composition (the copy, its steps and the finished screen).
*/
import { scene, seg, ease, clamp, lerp } from '../lib.js';

export default function mount(root, opts = {}) {
  const screen = root.querySelector('.pa__screen'), steps = [...root.querySelectorAll('.pa__steps > li')], close = root.querySelector('.pa__close');
  const action = root.querySelector('[data-action]');
  if (!screen || !action) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const parts = [...screen.querySelectorAll('[data-at]')].map(el => ({ el, at: +el.dataset.at }));
  const rows = [...screen.children];
  const n = Math.max(steps.length, ...parts.map(x => x.at), 2);
  const box = document.createElement('div'); box.className = 'pa__box'; box.setAttribute('aria-hidden', 'true'); screen.prepend(box);
  const home = close ? close.parentElement : null;
  let geo = null;
  const END = 0.66;                                     // the steps end here; the fold takes the rest
  const at = k => 0.06 + ((k - 1) / (n - 1)) * (END - 0.06);
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    enter() { if (close) screen.append(close); },        // the closing line rides the screen, so it ends centred under the action
    measure(ctx) {
      screen.style.transform = ''; rows.forEach(r => { r.style.transform = ''; });
      action.style.transform = ''; parts.forEach(({ el }) => { el.style.transform = ''; });
      const sb = screen.getBoundingClientRect(), ab = action.getBoundingClientRect();
      const ar = action.closest('.pa__row') || action;
      const ax = ab.left - sb.left + ab.width / 2, ay = ab.top - sb.top + ab.height / 2;
      geo = {
        sb: { w: sb.width, h: sb.height }, ab: { x: ab.left - sb.left, y: ab.top - sb.top, w: ab.width, h: ab.height },
        // where the action ends: the centre of the screen's area, a little above the middle
        ex: sb.width / 2 - ax, ey: sb.height * 0.42 - ay, ax, ay,
        rows: rows.map(r => { const b = r.getBoundingClientRect(); return { el: r, cy: b.top - sb.top + b.height / 2, bottom: b.bottom - sb.top, isAction: r === ar, at: r.hasAttribute('data-at') ? +r.dataset.at : Math.min(...[...r.querySelectorAll('[data-at]')].map(e => +e.dataset.at), 99) % 99 || 1 }; }),   // a row arrives with its first part; a row with none is there from step 1
        // the action's row-mates (its state, a note) ride with the action at the end, keeping their distance from its centre
        mates: parts.filter(({ el }) => el !== action && el.closest('.pa__row') === ar).map(({ el }) => { const b = el.getBoundingClientRect(); return { el, dx: b.left - ab.left }; }),
      };
      geo.base = Math.max(...geo.rows.filter(r => r.at <= 1).map(r => r.bottom), 0);   // the box opens only as tall as the first rows
      geo.ctx = ctx;
    },
    update(p, ctx) {
      if (!geo) return;
      // the screen slides up from the foot as the stage arrives
      const arrive = seg(p, 0, 0.06, ease.out);
      // the steps
      const step = Math.max(1, Math.min(n, 1 + Math.floor(((clamp((p - 0.06) / (END - 0.06))) * (n - 1)) + 1e-6)));
      for (const { el, at: k } of parts) {
        const a = at(k) - 0.07, b = at(k);
        const kin = seg(p, a, b, ease.out);
        el.style.opacity = seg(kin, 0, 0.5).toFixed(3);
        el.style.transform = kin < 1 ? `translate3d(0, ${((1 - kin) * 36).toFixed(1)}px, 0)` : '';
        el.style.visibility = kin <= 0 ? 'hidden' : '';
        el.classList.toggle('is-new', p >= a && p < b + 0.07);
      }
      steps.forEach((li, i) => li.classList.toggle('is-on', p < END ? i + 1 === step : p > 0.9 || i === steps.length - 1));   // the whole list in ink once the story is told
      // the box grows with the rows it holds: as tall as the last row that has arrived
      let bottom = geo.base;
      for (const r of geo.rows) { if (r.at <= 1) continue; const kin = seg(p, at(r.at) - 0.07, at(r.at), ease.out); bottom = lerp(bottom, Math.max(bottom, r.bottom), kin); }
      // the fold
      const f = seg(p, END + 0.02, 0.86, ease.inOut);
      const order = geo.rows.filter(r => !r.isAction).map(r => ({ ...r, d: Math.abs(r.cy - geo.ay) })).sort((x, y) => x.d - y.d);
      order.forEach((r, i) => {
        const k = seg(f, i / (order.length + 1), Math.min(1, (i + 2) / (order.length + 1)), ease.in2);
        r.el.style.transform = k ? `translate3d(0, ${((geo.ay - r.cy) * k).toFixed(1)}px, 0) scale(${(1 - 0.35 * k).toFixed(3)})` : '';
        r.el.style.opacity = k ? (1 - seg(k, 0.4, 1)).toFixed(3) : '';
      });
      // the box closes round the action's row, then goes; the action moves to the centre and grows, its row-mates with it
      const bx = seg(p, 0.8, 0.9, ease.inOut);
      const g = seg(p, 0.9, 1, ease.out);
      const pad = 12;
      const top = lerp(0, geo.ab.y - pad, bx) + geo.ey * g, left = lerp(0, geo.ab.x - pad, bx) + geo.ex * g;
      const right = lerp(geo.sb.w, geo.ab.x + geo.ab.w + pad, bx) + geo.ex * g, bot = lerp(bottom, geo.ab.y + geo.ab.h + pad, bx) + geo.ey * g;
      // the box is full size and clipped to the rect (border and radius stay true; no layout per frame)
      box.style.clipPath = `inset(${top.toFixed(1)}px ${(geo.sb.w - right).toFixed(1)}px ${(geo.sb.h - bot).toFixed(1)}px ${left.toFixed(1)}px round var(--r-md))`;
      box.style.opacity = (1 - seg(p, 0.9, 0.95)).toFixed(3);
      const grow = 1 + 0.3 * g;
      action.style.transform = g ? `translate3d(${(geo.ex * g).toFixed(1)}px, ${(geo.ey * g).toFixed(1)}px, 0) scale(${grow.toFixed(3)})` : '';
      for (const m of geo.mates) {
        // the mate keeps its place beside the action: it shifts right by the action's growth about its centre
        const shift = (grow - 1) * (m.dx - geo.ab.w / 2) + (grow - 1) * geo.ab.w / 2;
        m.el.style.transform = g ? `translate3d(${(geo.ex * g + shift).toFixed(1)}px, ${(geo.ey * g).toFixed(1)}px, 0)` : (m.el.style.transform || '');
      }
      screen.style.transform = arrive < 1 ? `translate3d(0, ${((1 - arrive) * ctx.vh * 0.5).toFixed(1)}px, 0)` : '';
      if (close) {
        const kc = seg(p, 0.94, 1, ease.out);
        close.style.opacity = kc.toFixed(3); close.style.visibility = kc <= 0 ? 'hidden' : '';
        close.style.top = (geo.ab.y + geo.ab.h / 2 + geo.ey + geo.ab.h * grow / 2 + 28).toFixed(1) + 'px';
        close.style.transform = `translate3d(-50%, ${((1 - kc) * 10).toFixed(1)}px, 0)`;
      }
      root.classList.toggle('is-folded', p > 0.9);
    },
    rest() {
      for (const { el } of parts) { el.style.cssText = ''; el.classList.remove('is-new'); }
      rows.forEach(r => { r.style.cssText = ''; }); steps.forEach(li => li.classList.remove('is-on'));
      box.style.cssText = ''; action.style.cssText = ''; screen.style.cssText = '';
      if (close) { close.style.cssText = ''; if (home && close.parentElement !== home) home.append(close); }
      root.classList.remove('is-folded');
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); } };
}
