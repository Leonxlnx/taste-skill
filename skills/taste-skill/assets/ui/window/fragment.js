// window: one row per cycle (about 3 s): the assistant finishes the row it is on (it turns to the done
// word) and takes the next open row (it turns to the working word); after the last open row the queue
// starts over. A row is open when its status reads the open word as written. The words are the page's
// own: data-open, data-work and data-done on the root (or opts.open, opts.work, opts.done); "Open",
// "Working" and "Replied" when it gives none.
import { loop } from '../ui.js';

export default function init(root, opts = {}) {
  const rows = [...root.querySelectorAll('[data-row]')];
  const st = rows.map(r => r.querySelector('[data-st]'));
  if (opts.compact) root.classList.add('ui-win--compact');
  if (!rows.length || st.some(s => !s)) return null;
  const word = (k, d) => opts[k] || root.dataset[k] || d;
  const openWord = word('open', 'Open'), work = word('work', 'Working'), done = word('done', 'Replied');
  const first = st.map(s => ({ text: s.textContent, cls: s.className }));
  const open = rows.map((r, i) => (st[i].textContent.trim() === openWord ? i : -1)).filter(i => i >= 0);
  if (!open.length) return null;
  const set = (i, text, cls) => { st[i].textContent = text; st[i].className = `ui-win__st ${cls || ''}`.trim(); };
  const reset = () => { rows.forEach((r, i) => { r.classList.remove('is-sel'); st[i].textContent = first[i].text; st[i].className = first[i].cls; }); };
  // step j: the first j open rows are done, open row j is being worked on (none when j is past the end)
  const at = j => {
    reset();
    open.forEach((i, n) => { if (n < j) set(i, done, 'is-done'); });
    if (j < open.length) { set(open[j], work, 'is-work'); rows[open[j]].classList.add('is-sel'); }
  };
  // the finished picture: the first open row done, the second being worked on
  const j0 = Math.min(1, open.length);
  let j = j0;
  const still = () => { j = j0; at(j); };
  // one cycle (about 2.6 s): two steps of the queue (a row done and the next taken), the second held 0.38 s
  return loop(root, async api => {
    await api.wait(200);
    for (let n = 0; n < 2; n++) {
      j = (j + 1) % (open.length + 1);
      if (j === 0) {
        // the queue starts over: every row back as written, then the first open row is taken
        reset();
        await api.wait(350);
        at(0);
      } else {
        set(open[j - 1], done, 'is-done');
        rows[open[j - 1]].classList.remove('is-sel');
        await api.wait(350);
        if (j < open.length) { set(open[j], work, 'is-work'); rows[open[j]].classList.add('is-sel'); }
      }
      await api.wait(n < 1 ? 1300 : 380);
    }
  }, { still });
}
