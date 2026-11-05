// files: one cycle (about 3.6 s): every tile clears, then a wave runs across the grid: each tile lifts, a
// thin bar fills and a check appears, a few tiles reading at once; it holds on all read. The status line
// only ever shows the page's words: while the wave runs it reads data-reading on the root (or
// opts.reading), with {n} and {total} filled in; with neither, it keeps the words as written and only
// its first number counts up to the number as written (a line with no number is left alone).
import { loop, withLoop } from '../ui.js';

export default function init(root, opts = {}) {
  const tiles = [...root.querySelectorAll('.ui-file')];
  if (!tiles.length) return null;
  const status = root.querySelector('[data-files-status]');
  const status0 = status ? status.textContent : '';
  const num = status0.match(/\d[\d,.]*/);
  const total = num ? parseInt(num[0].replace(/[,.]/g, ''), 10) || tiles.length : tiles.length;
  const reading = opts.reading || root.dataset.reading || '';
  const n = tiles.length;
  const say = i => {
    if (!status) return;
    let s = status0;
    if (i < n) {
      const k = Math.max(1, Math.round(total * (i + 1) / n));
      if (reading) s = reading.replace('{n}', k).replace('{total}', total);
      else if (num) s = status0.slice(0, num.index) + k + status0.slice(num.index + num[0].length);
    }
    if (status.textContent !== s) status.textContent = s;
  };
  // a tile the panel cuts keeps its icon but never shows half a word: a name or app line that does not
  // fit inside the box that clips the grid (the panel) is hidden, measured again on every resize
  const labels = [...root.querySelectorAll('.ui-file__name, .ui-file__kind')];
  const clipBox = () => { for (let el = root.parentElement; el && el !== document.body; el = el.parentElement) { const cs = getComputedStyle(el); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return el; } return null; };
  const trim = () => {
    const box = clipBox();
    if (!box) return;
    const b = box.getBoundingClientRect();
    labels.forEach(l => l.classList.remove('is-cut'));
    const cut = labels.filter(l => { const r = l.getBoundingClientRect(); return r.width > 0 && (r.right > b.right - 1 || r.left < b.left + 1 || r.bottom > b.bottom - 1); });
    cut.forEach(l => l.classList.add('is-cut'));
  };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => requestAnimationFrame(trim)) : null;
  if (ro) { ro.observe(root); const box = clipBox(); if (box) ro.observe(box); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(trim, () => {});
  requestAnimationFrame(trim);
  const step = Math.max(70, Math.min(260, 1500 / n)), lag = Math.max(1, Math.round(460 / step));
  const still = () => { root.classList.remove('is-reset'); tiles.forEach(t => { t.classList.remove('is-reading'); t.classList.add('is-done'); }); say(n); };
  const ctl = loop(root, async api => {
    root.classList.add('is-reset');
    tiles.forEach(t => t.classList.remove('is-done', 'is-reading'));
    say(0);
    await api.wait(320);
    root.classList.remove('is-reset');
    for (let i = 0; i < n + lag; i++) {
      if (i < n) { tiles[i].classList.add('is-reading'); say(i); }
      const j = i - lag;
      if (j >= 0) { tiles[j].classList.remove('is-reading'); tiles[j].classList.add('is-done'); }
      await api.wait(step);
    }
    say(n);
    await api.wait(460);
  }, { still });
  return { ...withLoop(ctl, () => { if (ro) ro.disconnect(); ctl.destroy(); }) };
}
