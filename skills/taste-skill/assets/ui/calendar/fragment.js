// calendar: one cycle (about 3.5 s): the pointer sets the range from its first to its last day, the
// dated rows under the month light up as their day is reached, it points at the marked date, then it
// rests on the finished picture (range and every date shown). The range chip shows the page's own words
// in the finished picture; while the pointer drags it reads "<month> <first> – <day>", the month taken
// from data-month or from the chip's own first word.
import { loop, POINTER_SVG } from '../ui.js';

export default function init(root) {
  const days = root.querySelector('.ui-cal__days');
  const cell = d => root.querySelector(`[data-d="${d}"]`);
  const start = +root.dataset.start || 12, end = +root.dataset.end || 16;
  const range = root.querySelector('[data-cal-range]');
  const range0 = range ? range.textContent : '';
  const word = range0.match(/^\s*([^\d\s]+)\s*\d/);
  const month = root.dataset.month || (word ? word[1] : '');
  const rows = [...root.querySelectorAll('[data-ev]')];
  const row = d => rows.find(r => +r.dataset.ev === d);
  const mark = root.querySelector('.ui-cal__d.is-mark');
  const pointer = document.createElement('span');
  pointer.className = 'ui-pointer';
  pointer.innerHTML = POINTER_SVG;
  pointer.style.opacity = '0';
  root.appendChild(pointer);

  function show(a, b) {
    root.querySelectorAll('[data-d]').forEach(el => {
      const d = +el.dataset.d;
      el.classList.toggle('is-start', d === a);
      el.classList.toggle('is-end', d === b);
      el.classList.toggle('is-in', d > a && d < b);
    });
    if (range) range.textContent = `${month ? month + ' ' : ''}${a === b ? a : `${a} – ${b}`}`;
  }
  function now(d) {
    rows.forEach(r => { r.classList.toggle('is-now', +r.dataset.ev === d); });
  }
  function point(d, dx = 6, dy = 8) {
    const c0 = cell(d);
    if (!c0) return;
    const r = root.getBoundingClientRect(), c = c0.getBoundingClientRect();
    pointer.style.transform = `translate(${c.left - r.left + c.width / 2 + dx}px, ${c.top - r.top + c.height / 2 + dy}px)`;
  }
  // the finished picture: the range, every date row, the range's last date highlighted
  const still = () => {
    pointer.style.opacity = '0';
    if (days) days.classList.remove('is-clearing');
    show(start, end);
    if (range) range.textContent = range0;
    rows.forEach(r => r.classList.remove('is-dim'));
    now(row(end) ? end : -1);
  };
  const step = Math.max(40, Math.min(220, 900 / Math.max(1, end - start)));

  return loop(root, async api => {
    pointer.style.opacity = '0';
    if (days) days.classList.add('is-clearing');
    rows.forEach(r => r.classList.toggle('is-dim', +r.dataset.ev > start));
    now(-1);
    await api.wait(300);
    show(start, start);
    point(start, 40, 40);
    await api.wait(40);
    pointer.style.opacity = '1';
    point(start);
    await api.wait(380);
    if (days) days.classList.remove('is-clearing');
    if (row(start)) now(start);
    for (let d = start + 1; d <= end; d++) {
      await api.wait(step);
      show(start, d);
      point(d);
      const r = row(d);
      if (r) { r.classList.remove('is-dim'); now(d); }
    }
    await api.wait(380);
    if (mark) {
      const md = +mark.dataset.d;
      point(md);
      await api.wait(320);
      const r = row(md);
      if (r) { r.classList.remove('is-dim'); now(md); }
      await api.wait(360);
    }
    point(end, 30, 34);
    pointer.style.opacity = '0';
    still();
    await api.wait(400);
  }, { still });
}
