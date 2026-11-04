/*
  iris-opens - the page's ground changes through a circle. The host is the section that sits on the
  new ground (a whole section, one or two screens, as every section is: references/layout-v4.md). The
  section keeps its own ground edge to edge the whole time, so its top and bottom always meet its
  neighbours on a clear edge. Inside it, a stage inset by an even gutter on all four sides (a panel
  with the corners of a card) holds the ground of the section before it, and a disc opens in the
  middle of what is visible, widening with a hairline ring in the accent at its edge, until it has
  uncovered the whole stage: the section's own ground and words appear through the circle. The stage
  never leaves the section, never touches its edges and never spills over a neighbour.

  No text is ever cut while it moves. Each block of the section (a heading, a paragraph, a list item,
  a button, a picture, a UI window) stays invisible until the disc has taken in the whole of it, then
  fades in whole over a short stretch of the disc's growth, so the circle's edge never slices a word.
  The circle is done by the time the section's top is a fifth of the screen from the top of the page,
  so a tile framed at the section's top shows the whole section. Scrubbed to the scrollbar, no pin, and
  it closes again the other way when the visitor scrolls back up. Nothing in the section moves.
  Phones, reduced motion, no script, a failed module: no stage, every block as it is.

    <section class="section ground-inverse" data-moment="iris-opens" data-moment-opts='{"from": "base"}'>
      <div class="wrap">…the section's h2 and content…</div>
    </section>

  opts: from 'base' (default) | 'surface' | 'inverse' (the ground of the section before it: the colour
        of the stage), at [x, y] 0-1 (the centre of the circle in the visible part, default [0.5, 0.5]).
*/
export default function (root, opts, lib) {
  root.classList.add('mo-io');
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
  const from = ['base', 'surface', 'inverse'].includes(opts.from) ? opts.from : 'base';
  const at = Array.isArray(opts.at) && opts.at.length === 2 ? opts.at : [0.5, 0.5];
  const stage = document.createElement('div');
  stage.className = 'mo-io__stage';
  stage.setAttribute('aria-hidden', 'true');
  const cover = document.createElement('div');
  cover.className = 'mo-io__cover';
  const ring = document.createElement('div');
  ring.className = 'mo-io__ring';
  stage.append(cover, ring);
  root.append(stage);
  root.classList.add('is-live', `mo-io--${from}`);

  // the section's words and pictures as whole blocks (lib.blocks): each stays invisible until the disc holds all of it
  const bl = lib.blocks(root, [stage]);
  const remeasure = () => { bl.measure(); s.update(); };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(remeasure) : null;
  if (ro) ro.observe(root);
  if (lib.fontsReady) lib.fontsReady(1500).then(remeasure);

  let open = null;
  const s = lib.scrub(root, (p, r) => {
    const vh = innerHeight;
    const u = lib.clamp((vh * 0.98 - r.top) / (vh * 0.78));
    const t = 1 - (1 - u) * (1 - u); // quick at first, so the words have time on screen before the section is done
    // the stage's own box inside the section (its inset gutter), and the centre of the part of it that is on screen
    const sr = stage.getBoundingClientRect();
    const gx = sr.left - r.left, gy = sr.top - r.top, w = sr.width, h = sr.height;
    const v0 = Math.max(0, sr.top), v1 = Math.min(vh, sr.bottom);
    const cx = w * at[0], cy = (v0 - sr.top) + Math.max(0, v1 - v0) * at[1];
    const R = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2;
    const rad = t * R;
    root.style.setProperty('--mo-cx', `${cx.toFixed(1)}px`);
    root.style.setProperty('--mo-cy', `${cy.toFixed(1)}px`);
    root.style.setProperty('--mo-r', `${rad.toFixed(1)}px`);
    const done = t >= 0.999;
    if (done !== open) { open = done; root.classList.toggle('is-open', done); if (done) bl.release(); }
    if (done) return;
    // a block appears once the disc holds all four corners of it, and then fades in over the next stretch of growth
    const soft = Math.max(48, R * 0.12);
    bl.set(b => {
      const x0 = b.l - gx, x1 = b.r - gx, y0 = b.t - gy, y1 = b.b - gy;
      const d = Math.hypot(Math.max(Math.abs(x0 - cx), Math.abs(x1 - cx)), Math.max(Math.abs(y0 - cy), Math.abs(y1 - cy)));
      return lib.ease.smooth(0, 1, (rad - d) / soft);
    });
  }, { mode: 'view' });
  return { destroy() { s.destroy(); if (ro) ro.disconnect(); bl.release(); stage.remove(); root.classList.remove('is-live', 'is-open', `mo-io--${from}`); } };
}
