// doc: one mark per cycle: the note beside the page goes, the next mark sweeps in, its note slides up
// beside it (about 3 s); then the next mark. The notes are the page's own: the first mark's is the note
// as written in the markup, a later mark carries its own as data-kind, data-msg and data-where (or
// opts.notes, in mark order). A mark with no note keeps a quiet underline and is never the current one,
// so the script never shows a note the page did not write.
import { loop } from '../ui.js';

export default function init(root, opts = {}) {
  const marks = [...root.querySelectorAll('.ui-doc__mark')];
  const note = root.querySelector('.ui-doc__note');
  const kind = root.querySelector('[data-doc-kind]'), msg = root.querySelector('[data-doc-msg]'), where = root.querySelector('[data-doc-where]');
  if (!marks.length || !note) return null;
  const own = { kind: kind ? kind.textContent : '', msg: msg ? msg.textContent : '', where: where ? where.textContent : '' };
  const noteOf = (m, i) => {
    if (opts.notes) return opts.notes[i] || null;
    if (m.dataset.msg) return { kind: m.dataset.kind || own.kind, msg: m.dataset.msg, where: m.dataset.where || '' };
    return i === 0 ? own : null;
  };
  const notes = marks.map(noteOf);
  const live = notes.map((n, i) => (n ? i : -1)).filter(i => i >= 0);
  if (!live.length) live.push(0);
  const text = (el, s) => { if (el && s != null && el.textContent !== s) el.textContent = s; };
  function place(i) {
    const n = notes[i] || own;
    text(kind, n.kind); text(msg, n.msg); text(where, n.where);
    if (where) where.hidden = !n.where;
    // under the marked line when it fits in what the panel shows, else above it, else as close as it can
    const r = root.getBoundingClientRect(), m = marks[i].getBoundingClientRect(), h = note.offsetHeight;
    let shown = r.bottom;
    for (let el = root.parentElement; el && el !== document.body; el = el.parentElement) {
      if (getComputedStyle(el).overflow !== 'visible') shown = Math.min(shown, el.getBoundingClientRect().bottom);
    }
    // the panel's bottom fade (64px) is not "shown": the note never sits in it
    const below = m.bottom - r.top + 8, above = m.top - r.top - h - 8, limit = shown - r.top - 72;
    const top = below + h <= limit ? below : above >= 8 ? above : Math.max(8, limit - h);
    note.style.top = `${top}px`;
  }
  // one mark is current (the accent); the others keep a quiet ink underline
  const current = i => marks.forEach((m, k) => { m.classList.toggle('is-on', k === i); m.classList.toggle('is-seen', k !== i); });
  let k = 0;
  const still = () => { k = 0; current(live[0]); place(live[0]); note.classList.add('is-on'); };
  // one cycle (2.74 s): two marks in turn. The note fades out, takes the next mark's words and place
  // while hidden, and fades in as the mark's sweep ends; the second is held 0.38 s
  return loop(root, async api => {
    for (let n = 0; n < 2; n++) {
      const i = live[++k % live.length];
      note.classList.remove('is-on');
      marks[i].classList.remove('is-on');
      await api.wait(240);
      current(i);
      place(i);
      await api.wait(220);
      note.classList.add('is-on');
      await api.wait(n < 1 ? 1440 : 380);
    }
  }, { still });
}
