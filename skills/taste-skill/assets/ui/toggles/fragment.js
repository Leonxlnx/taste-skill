// toggles: one switch per cycle (about 2.6 s): its row lights, it flips, the count follows; hold. The
// switches flip in a fixed order that comes back to the page's own state every six cycles. The count
// keeps the page's words: only its first figure follows ("4 of 5 on" reads "3 of 5 on").
import { loop } from '../ui.js';

export default function init(root, opts = {}) {
  const rows = [...root.querySelectorAll('.ui-tg')];
  const sw = rows.map(r => r.querySelector('.ui-switch'));
  if (!rows.length || sw.some(s => !s)) return null;
  const count = root.querySelector('[data-tg-count]');
  const count0 = count ? count.textContent : '';
  const initial = sw.map(s => s.classList.contains('is-on'));
  const n = rows.length, a = Math.min(2, n - 1), c = Math.min(3, n - 1);
  const order = (opts.order || [a, 0, a, c, 0, c]).filter(i => i < n);
  const set = (i, on) => { sw[i].classList.toggle('is-on', on); sw[i].setAttribute('aria-checked', String(on)); };
  const ons = () => sw.filter(s => s.classList.contains('is-on')).length;
  const on0 = initial.filter(Boolean).length;
  const tally = () => { if (count) count.textContent = ons() === on0 ? count0 : count0.replace(/\d+/, String(ons())); };
  let k = 0;
  // one cycle (2.62 s): two switches flip in turn and the count follows; the second is held 0.38 s
  return loop(root, async api => {
    await api.wait(240);
    for (let n = 0; n < 2; n++) {
      const i = order[k++ % order.length];
      rows[i].classList.add('is-active');
      set(i, !sw[i].classList.contains('is-on'));
      tally();
      await api.wait(900);
      rows[i].classList.remove('is-active');
      await api.wait(n < 1 ? 200 : 380);
    }
  }, { still: () => { k = 0; rows.forEach(r => r.classList.remove('is-active')); initial.forEach((on, i) => set(i, on)); tally(); } });
}
