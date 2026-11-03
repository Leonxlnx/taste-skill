// chat: one cycle (about 2.8 s): the question stays; the answer's sources fade, the answer's last sentence
// is written again word by word (its words step back to about 72% ink, then come up in order in under
// 0.8 s, like the end of a streamed reply), its sources come back, and the finished answer holds for the
// rest of the cycle. The rest of the answer never leaves full ink; no word ever drops below 72% (4.5:1 on white).
import { loop } from '../ui.js';

// wrap every word of the answer in a span (inside <b> too), so the words can light up in order
function words(el) {
  const out = [];
  const walk = node => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const p of parts) {
          if (!p) continue;
          if (/^\s+$/.test(p)) { frag.append(p); continue; }
          const s = document.createElement('span');
          s.className = 'ui-chat__w';
          s.textContent = p;
          out.push(s);
          frag.append(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    }
  };
  walk(el);
  return out;
}

export default function init(root) {
  const answer = root.querySelector('.ui-chat__answer');
  const srcs = root.querySelector('.ui-chat__srcs');
  const all = answer ? words(answer) : [];
  if (!all.length) return null;
  // the last sentence (a word ending . ! or ? before the last word starts it), at most 12 words;
  // a one-sentence answer writes its second half
  let from = 0;
  for (let i = all.length - 2; i >= 0; i--) if (/[.!?]$/.test(all[i].textContent)) { from = i + 1; break; }
  if (from === 0) from = Math.floor(all.length / 2);
  from = Math.max(from, all.length - 12);
  const w = all.slice(from);
  const full = () => { w.forEach(s => s.classList.remove('is-off')); if (srcs) srcs.classList.remove('is-hidden'); };
  const per = Math.max(40, Math.min(90, 720 / w.length));
  const each = srcs ? [...srcs.children] : [];
  // one cycle (about 2.6 s): the sources fade, the sentence steps back, the typing dots run 0.6 s, the
  // sentence is written again in under 0.8 s, the sources come back one by one, the answer holds 0.38 s
  return loop(root, async api => {
    if (srcs) srcs.classList.add('is-hidden');
    await api.wait(200);
    w.forEach(s => s.classList.add('is-off'));
    root.classList.add('is-typing');
    await api.wait(780);
    root.classList.remove('is-typing');
    for (const s of w) { s.classList.remove('is-off'); await api.wait(per); }
    await api.wait(160);
    each.forEach(e => e.classList.add('is-wait'));
    if (srcs) srcs.classList.remove('is-hidden');
    for (const e of each) { e.classList.remove('is-wait'); await api.wait(240); }
    await api.wait(400);
  }, { still: () => { root.classList.remove('is-typing'); each.forEach(e => e.classList.remove('is-wait')); full(); } });
}
