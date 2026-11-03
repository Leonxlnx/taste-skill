// search: one query per cycle (about 2.7 s): the old results dim, the query is cleared and typed letter by
// letter, results appear one by one, the selection steps down; hold. The queries are the page's own:
// the query and results as written in the markup come first, then opts.queries [{q, rows: [[icon,
// title, meta]]}] if any; with none, it types its own query again.
import { loop } from '../ui.js';

const rowsHTML = rows => rows.map(([ico, t, m]) => `<li class="ui-search__row"><span class="ui-search__ico">${ico}</span><span class="ui-search__t">${t}</span><span class="ui-search__m">${m}</span></li>`).join('');

export default function init(root, opts = {}) {
  const q = root.querySelector('[data-search-q]');
  const list = root.querySelector('[data-search-list]');
  if (!q || !list) return null;
  // the finished picture is the markup as written (its query and its results)
  const q0 = q.textContent, list0 = list.innerHTML;
  const extra = (opts.queries || []).map(it => ({ q: it.q, html: rowsHTML(it.rows || []) })).filter(it => it.q !== q0);
  const all = [{ q: q0, html: list0 }, ...extra];
  let k = 0;
  const still = () => { k = 0; q.textContent = q0; list.innerHTML = list0; };
  const reveal = html => {
    list.innerHTML = html;
    const rows = [...list.children];
    rows.forEach(r => { r.classList.remove('is-sel', 'is-stale'); r.classList.add('is-hidden'); });
    rows.forEach((r, i) => setTimeout(() => r.classList.remove('is-hidden'), 30 + i * 80));
    return rows;
  };
  return loop(root, async api => {
    const item = all[++k % all.length];
    // the old results dim while the query is cleared and stay until the new ones replace them, so the
    // list is never empty
    [...list.children].forEach(r => r.classList.add('is-stale'));
    // a long query types faster, so the cycle stays under 4 s
    const del = Math.min(14, 260 / Math.max(1, q.textContent.length)), per = Math.min(58, 900 / Math.max(1, item.q.length));
    for (let i = q.textContent.length; i >= 0; i--) { q.textContent = q.textContent.slice(0, i); await api.wait(del); }
    await api.wait(160);
    let rows = null;
    for (let i = 1; i <= item.q.length; i++) {
      q.textContent = item.q.slice(0, i);
      await api.wait(Math.round(per * (0.7 + (i % 3) * 0.3)));
      if (i === Math.min(3, item.q.length)) rows = reveal(item.html);
    }
    if (!rows) rows = reveal(item.html);
    if (!rows.length) { await api.wait(1600); return; }
    rows[0].classList.add('is-sel');
    await api.wait(520);
    for (let j = 1; j < rows.length; j++) {
      rows[j - 1].classList.remove('is-sel');
      rows[j].classList.add('is-sel');
      await api.wait(340);
    }
    await api.wait(400);
  }, { still });
}
