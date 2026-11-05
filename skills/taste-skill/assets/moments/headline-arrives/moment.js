/*
  headline-arrives - the hero headline's words rise once on load, each out of its own mask, staggered,
  and settle; the lines after it (the sub-line, the buttons) fade up behind them. Once per visit.

    <div class="section-head" data-moment="headline-arrives" data-moment-opts='{"unit":"words"}'>
      <h1>The full-stack creative canvas</h1>
      <p>…</p>
      <div class="btn-row">…</div>
    </div>

  opts: unit 'words' (default) | 'chars' (a headline of one short line); heading: selector of the
        headline inside the host (default h1, h2); delay ms before the first word (120); stagger ms
        (38 a word, 22 a letter); duration ms of one word's rise (900).
  Reduced motion, no script, a failed module: the headline stands as written. When the module mounts
  late (after the 2.5 s safety mark, html.mo-safe) the headline is already on screen and stays:
  nothing is hidden and replayed. Put <link rel="modulepreload"> for moments.js, lib.js and this
  file in <head> so the headline waits for one round trip, not four.
*/
export default function (root, opts, lib) {
  const heading = root.matches('h1, h2') ? root : root.querySelector(opts.heading || 'h1, h2');
  if (!heading || lib.reduced() || document.documentElement.classList.contains('mo-safe')) { root.classList.add('is-done'); return {}; }
  const unit = opts.unit === 'chars' ? 'chars' : 'words';
  const inners = lib.split(heading, unit);
  const rest = root === heading ? [] : [...root.children].filter(c => c !== heading);
  root.classList.add('is-live');
  const dur = opts.duration || 900, delay = opts.delay ?? 120, step = opts.stagger ?? (unit === 'chars' ? 22 : 38);
  const EASE = 'cubic-bezier(.16, 1, .3, 1)';
  const anims = [];
  let done = false;
  const finish = () => { if (done) return; done = true; root.classList.add('is-done'); root.classList.remove('is-live'); anims.forEach(a => { try { a.cancel(); } catch { /* finished */ } }); };
  lib.fontsReady(500).then(() => {
    if (done) return;
    inners.forEach((i, k) => anims.push(i.animate([{ transform: 'translateY(108%)', opacity: 0.001 }, { transform: 'none', opacity: 1 }], { duration: dur, delay: delay + k * step, easing: EASE, fill: 'both' })));
    const after = delay + Math.min(inners.length, 14) * step + 160;
    rest.forEach((el, k) => anims.push(el.animate([{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: after + k * 110, easing: EASE, fill: 'both' })));
    Promise.all(anims.map(a => a.finished)).then(finish, finish);
  }).catch(finish);
  setTimeout(finish, 8000);   // failsafe: whatever stalled, the headline stands after 8 s
  return { destroy: finish };
}
