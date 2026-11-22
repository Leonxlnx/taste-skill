/*
  word-rotate - one word of a headline changes on a clock: the word in place slides up out of its mask
  while the next rises in from below; the underline under it stays. It keeps changing for as long as the
  headline is on screen, so it carries a pause button (WCAG 2.2.2, anything that moves on its own past
  5 s): a small round button under the headline, never over a word. It also pauses while the pointer is
  on the headline, and after its last round when `cycles` is set.

    <h1>Grok for everything you <span data-moment="word-rotate"
        data-moment-opts='{"words": ["build", "imagine", "search"], "every": 2200}'>build</span>, every day</h1>

  opts: words (2 to 5, the written word first or it is added first); every ms a word stays (2200);
        cycles (0, the default: for as long as it is on screen; n: n rounds, then it rests on the
        written word and the button goes).
  A comma or a full stop right after the word stays on its line: the script keeps the punctuation and the
  word together (the word's cell is an inline grid, after which a line could otherwise break).
  Phones: the same, it runs there too. Reduced motion, no script: the written word stands.
*/
export const phone = true;

export default function (root, opts, lib) {
  const first = root.textContent.trim();
  const words = Array.isArray(opts.words) ? opts.words.map(w => String(w).trim()).filter(Boolean) : [];
  // the written word leads (and is where the list comes to rest), wherever the list names it
  const k = words.indexOf(first);
  if (k < 0) words.unshift(first); else words.push(...words.splice(0, k));
  root.setAttribute('aria-label', first);
  root.textContent = '';
  root.classList.add('mo-wr');
  const cells = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'mo-wr__w' + (i === 0 ? ' is-on' : '');
    s.setAttribute('aria-hidden', 'true');
    s.textContent = w;
    root.append(s);
    return s;
  });
  // the punctuation right after the word goes into one unbreakable span with it, so "build," never puts its comma on a line of its own
  let keep = null, tail = null;
  const next = root.nextSibling;
  const lead = next && next.nodeType === 3 ? next.data.match(/^[,.;:!?…)\]»”’"']+/) : null;
  if (lead) {
    keep = document.createElement('span');
    keep.className = 'mo-wr-keep';
    root.before(keep);
    tail = document.createTextNode(lead[0]);
    keep.append(root, tail);
    next.data = next.data.slice(lead[0].length);
  }
  // the slot is as wide as the word on view, not the longest one, so no gap opens before a full stop after it
  let i = 0;
  const fit = () => { root.style.width = Math.ceil(cells[i].getBoundingClientRect().width) + 'px'; };
  fit();
  if (document.fonts) document.fonts.ready.then(fit, () => {});
  addEventListener('resize', fit);
  const unkeep = () => { if (!keep) return; keep.before(root); if (root.nextSibling && root.nextSibling.nodeType === 3) root.nextSibling.data = tail.data + root.nextSibling.data; else root.after(tail.data); keep.remove(); keep = null; };
  if (lib.reduced() || cells.length < 2) return { destroy() { removeEventListener('resize', fit); unkeep(); } };
  const every = Math.max(1200, opts.every || 2200), cycles = Math.max(0, +opts.cycles || 0);
  let timer = 0, visible = false, shown = 0, paused = false, hover = false;
  const rests = () => cycles > 0 && shown >= cycles * cells.length;
  const running = () => visible && !paused && !hover && !rests();
  // the pause button: under the headline (a sibling after it), on its own line, aligned as the headline is
  const block = root.closest('h1, h2, h3, h4, p, li, blockquote') || root.parentElement;
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'loop-pause mo-wr__pause';
  const icon = on => `<svg viewBox="0 0 14 14" aria-hidden="true">${on ? '<path d="M3 2h3v10H3zM8 2h3v10H8z"/>' : '<path d="M4 2l8 5-8 5z"/>'}</svg>`;
  const setPaused = p => { paused = p; pause.setAttribute('aria-label', p ? 'Play the changing word' : 'Pause the changing word'); pause.setAttribute('aria-pressed', String(p)); pause.innerHTML = icon(!p); arm(); };
  if (getComputedStyle(block).textAlign === 'center') pause.classList.add('mo-wr__pause--centre');
  block.after(pause);
  const step = () => {
    timer = 0;
    if (!running()) return;
    const out = cells[i];
    i = (i + 1) % cells.length;
    const inn = cells[i];
    out.classList.remove('is-on'); out.classList.add('is-out');
    inn.classList.remove('is-out'); inn.classList.add('is-on');
    fit();
    setTimeout(() => out.classList.remove('is-out'), 700);
    shown++;
    if (rests()) { pause.remove(); return; }
    arm();
  };
  function arm() { clearTimeout(timer); timer = 0; if (running()) timer = setTimeout(step, every); }
  setPaused(false);
  pause.addEventListener('click', () => setPaused(!paused));
  const over = () => { hover = true; arm(); }, out = () => { hover = false; arm(); };
  block.addEventListener('pointerenter', over);
  block.addEventListener('pointerleave', out);
  const io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; arm(); });
  io.observe(root);
  return {
    destroy() {
      clearTimeout(timer); io.disconnect(); removeEventListener('resize', fit);
      block.removeEventListener('pointerenter', over); block.removeEventListener('pointerleave', out);
      pause.remove(); unkeep();
    },
  };
}
