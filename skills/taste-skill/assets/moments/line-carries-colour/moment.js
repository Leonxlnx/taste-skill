/*
  line-carries-colour - the page's ground changes along a line. The host is the section that sits on
  the new ground (a whole section, one or two screens, as every section is: references/layout-v4.md).
  The section keeps its own ground edge to edge. Inside it, a stage inset by an even gutter on all four sides
  (a panel with the corners of a card) holds the ground of the section before it. As the section rises into
  the screen the stage is covered by that ground, and a hairline in the accent climbs through it from its foot
  to its top, taking the cover with it: below the line the section's own ground and words, above it the old
  ground. The stage never leaves the section and never touches its edges. No text is ever cut while it moves:
  each block of the section (a heading, a paragraph, a list item, a button, a picture, a UI window) stays
  invisible until the line has passed above the whole of it, then fades in whole, so the line never slices a
  word. The line has reached the top by the time the section's top is a fifth of the screen from the top of the
  page, so a tile framed at the section's top shows the whole section. Scrubbed to the scrollbar, no pin, and
  it climbs back down when the visitor scrolls back up. Phones, reduced motion, no script, a failed module: no
  stage, every block as it is.

    <section class="section ground-inverse" data-moment="line-carries-colour" data-moment-opts='{"from": "base"}'>
      <div class="wrap">…the section's h2 and content…</div>
    </section>

  opts: from 'base' (default) | 'surface' | 'inverse' (the ground of the section before it),
        start 0.45 (the share of the section's rise at which the line comes up from under the screen).
*/
export default function (root, opts, lib) {
  root.classList.add('mo-lc');
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
  const from = ['base', 'surface', 'inverse'].includes(opts.from) ? opts.from : 'base';
  const start = lib.clamp(+opts.start || 0.45, 0.1, 0.8);
  const stage = document.createElement('div');
  stage.className = 'mo-lc__stage';
  stage.setAttribute('aria-hidden', 'true');
  const cover = document.createElement('div');
  cover.className = 'mo-lc__cover';
  const line = document.createElement('div');
  line.className = 'mo-lc__line';
  stage.append(cover, line);
  root.append(stage);
  root.classList.add('is-live', `mo-lc--${from}`);
  // the section's words and pictures as whole blocks (lib.blocks): each stays invisible until the line is above all of it
  const bl = lib.blocks(root, [stage]);
  const remeasure = () => { bl.measure(); s.update(); };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(remeasure) : null;
  if (ro) ro.observe(root);
  if (lib.fontsReady) lib.fontsReady(1500).then(remeasure);
  let open = null;
  const s = lib.scrub(root, (p, r) => {
    const vh = innerHeight;
    const rise = lib.clamp((vh * 0.98 - r.top) / (vh * 0.78));          // 0: the section's top at the screen's foot; 1: a fifth down
    const k = lib.ease.smooth(start, 1, rise);                          // the line's climb, 0 at its foot, 1 at the top
    const sr = stage.getBoundingClientRect(), gy = sr.top - r.top, h = sr.height;
    const cut = (1 - k) * h;                                            // the line's place in the stage's own coordinates
    root.style.setProperty('--mo-cut', `${cut.toFixed(1)}px`);
    root.style.setProperty('--mo-below', `${(h - cut).toFixed(1)}px`);
    const done = k >= 0.999;
    if (done !== open) { open = done; root.classList.toggle('is-open', done); if (done) bl.release(); }
    if (done) return;
    // a block appears once the line is above the whole of it, then fades in over the next stretch of the climb
    const soft = Math.max(48, h * 0.12);
    bl.set(b => lib.ease.smooth(0, 1, ((b.t - gy) - cut) / soft));
  }, { mode: 'view' });
  return { destroy() { s.destroy(); if (ro) ro.disconnect(); bl.release(); stage.remove(); root.classList.remove('is-live', 'is-open', `mo-lc--${from}`); } };
}
