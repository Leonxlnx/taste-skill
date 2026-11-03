/*
  iris-opens - the page's ground changes through a circle. The host is the section that sits on the
  new ground (a whole section, one or two screens, as every section is: references/layout-v4.md). As
  it rises into the screen it is covered by the ground of the section before it, and a disc opens
  in the middle of what is visible, widening with a hairline ring in the accent at its edge until it
  has uncovered the whole section: the section's own ground and words appear through the circle. The
  circle is done by the time the section's top is a fifth of the screen from the top of the page, so
  a tile framed at the section's top shows the whole section. Scrubbed to the scrollbar, no pin, and
  it opens again the other way when the visitor scrolls back up. The cover and the ring are two
  layers inside the section; nothing in the section moves. Phones, reduced motion, no script, a
  failed module: no cover, the section as it is.

    <section class="section ground-inverse" data-moment="iris-opens" data-moment-opts='{"from": "base"}'>
      <div class="wrap">…the section's h2 and content…</div>
    </section>

  opts: from 'base' (default) | 'surface' | 'inverse' (the ground of the section before it: the colour
        of the cover), at [x, y] 0-1 (the centre of the circle in the visible part, default [0.5, 0.5]).
*/
export default function (root, opts, lib) {
  root.classList.add('mo-io');
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
  const from = ['base', 'surface', 'inverse'].includes(opts.from) ? opts.from : 'base';
  const at = Array.isArray(opts.at) && opts.at.length === 2 ? opts.at : [0.5, 0.5];
  const cover = document.createElement('div');
  cover.className = 'mo-io__cover';
  cover.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div');
  ring.className = 'mo-io__ring';
  ring.setAttribute('aria-hidden', 'true');
  root.append(cover, ring);
  root.classList.add('is-live', `mo-io--${from}`);
  let open = null;
  const s = lib.scrub(root, (p, r) => {
    const vh = innerHeight, w = r.width, h = r.height;
    const t = lib.ease.smooth(0, 1, lib.clamp((vh * 0.98 - r.top) / (vh * 0.78)));
    // the centre: the middle of the part of the section that is on screen, in the section's own coordinates
    const v0 = Math.max(0, r.top), v1 = Math.min(vh, r.top + h);
    const cx = w * at[0], cy = (v0 - r.top) + Math.max(0, v1 - v0) * at[1];
    const R = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2;
    const rad = t * R;
    root.style.setProperty('--mo-cx', `${cx.toFixed(1)}px`);
    root.style.setProperty('--mo-cy', `${cy.toFixed(1)}px`);
    root.style.setProperty('--mo-r', `${rad.toFixed(1)}px`);
    const done = t >= 0.999;
    if (done !== open) { open = done; root.classList.toggle('is-open', done); }
  }, { mode: 'view' });
  return { destroy() { s.destroy(); cover.remove(); ring.remove(); root.classList.remove('is-live', 'is-open', `mo-io--${from}`); } };
}
