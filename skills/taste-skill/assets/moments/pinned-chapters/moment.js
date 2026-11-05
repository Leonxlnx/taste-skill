/*
  pinned-chapters - one section holds on screen while the visitor scrolls through its three (2 to 4)
  steps: the step in hand opens its two lines at the left, the one visual at the right changes to that
  step's picture or screen with a short crossfade and settle. The page scrolls natively (the stage is
  position: sticky); nothing else on the page moves. From 1024px on a screen at least 640px tall;
  otherwise, under reduced motion and without script the section is static: from 640px a row per
  step (text left, visual right, at most 30svh tall), below that every step stands with its visual
  under it (16:9).

    <section class="section" data-moment="pinned-chapters">
      <div class="container mo-pc__grid">
        <div class="mo-pc__text">
          <h2>How editors work with it</h2>
          <ol class="mo-pc__steps">
            <li class="mo-pc__step">
              <h3>Step title</h3><p>Two lines.</p>
              <figure class="mo-pc__visual"><img …></figure>          its picture, or a drawn window
            </li>
            …
          </ol>
        </div>
        <div class="mo-pc__visuals frame"></div>                     the shared frame, empty in the HTML
      </div>
    </section>

  The stage holds for one screen of scroll, so the live section is exactly two screens (layout-v4.md);
  with 2 to 4 steps each step gets a quarter to a half of a screen of scroll.
*/
export default function (root, opts, lib) {
  const steps = [...root.querySelectorAll('.mo-pc__step')];
  const frame = root.querySelector('.mo-pc__visuals');
  const figures = steps.map(s => s.querySelector('.mo-pc__visual'));
  if (steps.length < 2 || !frame || figures.some(f => !f)) return {};
  const homes = figures.map(f => f.parentElement);
  // the section stays exactly two screens (layout-v4.md: 1H or 2H), so the stage holds for one screen of scroll
  const hold = 1;
  root.style.setProperty('--mo-hold', String(hold));
  // each step's lines in a span of their own, so a closed step can collapse to nothing (moment.css)
  steps.forEach(s => {
    const p = s.querySelector('p');
    if (!p || p.querySelector('.mo-pc__p-in')) return;
    const w = document.createElement('span');
    w.className = 'mo-pc__p-in';
    while (p.firstChild) w.append(p.firstChild);
    p.append(w);
  });
  const grid = root.querySelector('.mo-pc__grid');
  let live = false, scrubber = null, k = -1;
  const wide = () => matchMedia('(min-width: 1024px)').matches;
  const fits = () => !lib.reduced() && wide() && innerHeight >= 640;
  const show = i => {
    if (i === k) return;
    k = i;
    steps.forEach((s, n) => s.classList.toggle('is-on', n === i));
    figures.forEach((f, n) => { f.classList.toggle('is-on', n === i); f.classList.toggle('is-past', n < i); });
  };
  const go = () => {
    if (live) return;
    live = true;
    // the scrub first: if it throws (no IntersectionObserver), nothing has been moved or hidden yet
    scrubber = lib.scrub(root, p => show(Math.min(steps.length - 1, Math.floor(p * steps.length))));
    root.classList.add('is-live');
    grid?.setAttribute('data-edge-free', '');   // live the grid is one screen of a two-screen section: the layout check skips it (the rest rows are checked)
    figures.forEach(f => frame.append(f));
    show(0);   // step 1 open before the first scroll tick: a scrub that never ticks still shows a step and its visual
  };
  const rest = () => {
    if (!live) return;
    live = false;
    root.classList.remove('is-live');
    grid?.removeAttribute('data-edge-free');
    scrubber?.destroy(); scrubber = null;
    figures.forEach((f, n) => { homes[n].append(f); f.classList.remove('is-on', 'is-past'); });
    steps.forEach(s => s.classList.remove('is-on'));
    k = -1;
  };
  const sync = () => { const f = fits(); if (f) go(); else rest(); root.classList.toggle('is-static', !f && wide()); };
  sync();
  let t = 0;
  const onResize = () => { clearTimeout(t); t = setTimeout(sync, 120); };
  addEventListener('resize', onResize);
  const rq = matchMedia('(prefers-reduced-motion: reduce)');
  rq.addEventListener('change', sync);   // a preference changed after load: go static (or live) at once
  return { destroy() { removeEventListener('resize', onResize); rq.removeEventListener('change', sync); rest(); root.classList.remove('is-static'); } };
}
