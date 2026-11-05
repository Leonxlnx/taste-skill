/*
  lines-rise - one section's heading rises line by line out of masks the first time the section comes
  on screen (90 ms between lines), then its lead line, link or buttons and its visual fade up behind
  it. Once; nothing moves again. For the one section the page wants the visitor to stop at, not for
  every section. Under reduced motion and without script the section stands as written.

    <section class="section" data-moment="lines-rise">
      <div class="container demo-split">
        <div class="section-head"><h2>…</h2><p>…</p><a class="link">…</a></div>
        <div class="frame mo-lr__follow">…</div>
      </div>
    </section>

  opts: heading selector (default h2, h1, h3), follow selector (what fades up after the heading;
        default the heading's siblings in .section-head and every .mo-lr__follow), threshold (0.3).
  When the module mounts late (after the 2.5 s safety mark, html.mo-safe) the section is already on
  screen and stays as written: nothing is hidden again and replayed.
*/
export default function (root, opts, lib) {
  const heading = root.querySelector(opts.heading || 'h2, h1, h3');
  if (!heading || lib.reduced() || document.documentElement.classList.contains('mo-safe')) { root.classList.add('is-done'); return {}; }
  const inners = lib.split(heading, 'words');
  const words = inners.map(i => i.parentElement);
  const follow = [...root.querySelectorAll(opts.follow || '.section-head > :not(h1):not(h2):not(h3), .mo-lr__follow')].filter(el => el !== heading && !el.contains(heading));
  // .is-live (the masks) is set only once the section nears the screen (see arm below): a section no observer reports keeps its heading
  const EXPO = 'cubic-bezier(.16, 1, .3, 1)';
  const anims = [];
  let done = false, seen = null, arm = null;
  const finish = () => { if (done) return; done = true; root.classList.add('is-done'); root.classList.remove('is-live'); anims.forEach(a => { try { a.cancel(); } catch { /* finished */ } }); };
  lib.fontsReady().then(() => {
    if (done) return;
    const groups = lib.lines(words);
    const lineOf = new Map();
    groups.forEach((g, li) => g.forEach(w => lineOf.set(w, li)));
    arm = lib.once(root, () => { if (!done) root.classList.add('is-live'); }, { threshold: 0, margin: '0px 0px 25% 0px' });
    seen = lib.once(root, () => {
      root.classList.add('is-live');
      words.forEach(w => anims.push(w.querySelector('.mo-i').animate([{ transform: 'translateY(106%)' }, { transform: 'none' }], { duration: 1000, delay: lineOf.get(w) * 90, easing: EXPO, fill: 'both' })));
      const after = groups.length * 90 + 160;
      follow.forEach((el, k) => anims.push(el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: after + k * 100, easing: EXPO, fill: 'both' })));
      Promise.all(anims.map(a => a.finished)).then(finish, finish);
    }, { threshold: Math.min(opts.threshold ?? 0.3, 0.6 * innerHeight / Math.max(1, root.getBoundingClientRect().height)) });
  }).catch(finish);
  return { destroy() { arm?.destroy(); seen?.destroy(); finish(); } };
}
