/*
  word-highlight - one statement's words turn from grey to ink, word by word, as the statement crosses
  the middle of the screen. Scrubbed to the scrollbar (it runs back when the visitor scrolls up); a
  <strong> word turns to the accent instead of the ink. For the one statement a page stands on, 12 to
  40 words, on its own ground or beside one picture.

    <section class="section" data-moment="word-highlight">
      <div class="container"><p class="mo-wh__text">Give tasks to <strong>Relay</strong> like a teammate …</p></div>
    </section>

  opts: from 0.85 (the statement's top at this share of the screen's height turns the first word),
        to 0.45 (its bottom at this share turns the last).
  Reduced motion, no script: the whole statement in ink.
*/
export default function (root, opts, lib) {
  const text = root.matches('p, h2, h3, blockquote') ? root : (root.querySelector('.mo-wh__text') || [...root.querySelectorAll('p, h2, h3, blockquote')].find(p => !p.matches('.t-label, .t-small, .muted')));
  if (!text) return {};
  root.classList.add('mo-wh');
  const words = lib.split(text, 'words').map(i => i.parentElement);
  if (lib.reduced()) { words.forEach(w => w.classList.add('is-on')); root.classList.add('is-done'); return {}; }
  const from = opts.from ?? 0.85, to = opts.to ?? 0.45;
  let n = -1;
  const s = lib.scrub(text, (p, r) => {
    const vh = innerHeight, start = vh * from, end = vh * to;
    const t = lib.clamp((start - r.top) / Math.max(1, (start - end) + r.height));
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;   // page bottom: it can climb no further, the statement stands in full ink
    const k = atEnd ? words.length : Math.round(t * words.length);
    if (k === n) return;
    n = k;
    words.forEach((w, i) => w.classList.toggle('is-on', i < k));
  }, { mode: 'view' });
  return { destroy: s.destroy };
}
