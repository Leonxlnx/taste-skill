/*
  line-carries-colour - the page's ground changes along a line. The host is the section that sits on
  the new ground (a whole section, one or two screens, as every section is: references/layout-v4.md).
  As it rises into the screen it is covered by the ground of the section before it, and a hairline in
  the accent climbs through it from its foot to its top, taking the cover with it: below the line the
  section's own ground and words, above it the old ground. The line has reached the top by the time the
  section's top is a fifth of the screen from the top of the page, so a tile framed at the section's
  top shows the whole section. Scrubbed to the scrollbar, no pin, and it climbs back down when the
  visitor scrolls back up. Phones, reduced motion, no script, a failed module: no cover, no line, the
  section as it is.

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
  const cover = document.createElement('div');
  cover.className = 'mo-lc__cover';
  cover.setAttribute('aria-hidden', 'true');
  const line = document.createElement('div');
  line.className = 'mo-lc__line';
  line.setAttribute('aria-hidden', 'true');
  root.append(cover, line);
  root.classList.add('is-live', `mo-lc--${from}`);
  let open = null;
  const s = lib.scrub(root, (p, r) => {
    const vh = innerHeight, h = r.height;
    const rise = lib.clamp((vh * 0.98 - r.top) / (vh * 0.78));          // 0: the section's top at the screen's foot; 1: a fifth down
    const k = lib.ease.smooth(start, 1, rise);                          // the line's climb, 0 at its foot, 1 at the top
    const cut = (1 - k) * h;                                            // the line's place in the section's own coordinates
    root.style.setProperty('--mo-cut', `${cut.toFixed(1)}px`);
    root.style.setProperty('--mo-below', `${(h - cut).toFixed(1)}px`);
    const done = k >= 0.999;
    if (done !== open) { open = done; root.classList.toggle('is-open', done); }
  }, { mode: 'view' });
  return { destroy() { s.destroy(); cover.remove(); line.remove(); root.classList.remove('is-live', 'is-open', `mo-lc--${from}`); } };
}
