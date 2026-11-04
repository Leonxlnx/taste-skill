// checklist: one cycle (about 3.2 s): back to the page's own state, then the open items tick in turn
// (check draws, label strikes), the bar fills; it holds on all done, then starts again. The count keeps
// the page's words: only its first figure follows ("2 of 5" reads "3 of 5").
import { loop } from '../ui.js';

export default function init(root) {
  const items = [...root.querySelectorAll('.ui-check')];
  if (!items.length) return null;
  const bar = root.querySelector('[data-checks-bar]'), count = root.querySelector('[data-checks-count]');
  const start = items.filter(i => i.classList.contains('is-done')).length;
  const count0 = count ? count.textContent : '';
  const show = n => {
    items.forEach((it, i) => it.classList.toggle('is-done', i < n));
    if (bar) bar.style.setProperty('--k', n / items.length);
    if (count) count.textContent = n === start ? count0 : count0.replace(/\d+/, String(n));
  };
  const left = items.length - start;
  const step = Math.max(320, Math.min(900, 2000 / Math.max(1, left)));
  return loop(root, async api => {
    root.classList.add('is-reset');
    show(start);
    await api.wait(300);
    root.classList.remove('is-reset');
    for (let n = start + 1; n <= items.length; n++) {
      items[n - 1].classList.add('is-now');
      show(n);
      await api.wait(step);
      items[n - 1].classList.remove('is-now');
    }
    await api.wait(390);
  }, { still: () => { root.classList.remove('is-reset'); items.forEach(i => i.classList.remove('is-now')); show(start); } });
}
