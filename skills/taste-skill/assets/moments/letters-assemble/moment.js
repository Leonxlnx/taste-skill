/*
  letters-assemble - one statement set very large: its letters start scattered (each shifted, turned and
  faint, from its own fixed place) and fly into the line as the statement rises through the screen, the
  first letters first, so the words build themselves in front of the visitor. Scrubbed to the scrollbar,
  no pin; it is whole before the statement reaches the middle of the screen and stays whole as it leaves
  (and when the visitor scrolls back up it takes the letters apart again, the same way). Transform and
  opacity only, one span a letter.

    <section class="section" data-moment="letters-assemble" data-moment-opts='{"spread": 1}'>
      <div class="container">
        <h2 class="mo-la__type">Built to run on its own</h2>
        <p class="mo-la__sub">One or two lines under it.</p>
      </div>
    </section>

  opts: heading selector (default .mo-la__type, then h2, h1), spread 0.4-1.6 (how far the letters start
        from home, default 1), from 1 and to 0.5 (where the statement's top is, as a share of the
        screen's height, when the first letter starts and when the last has landed).
  Phones, reduced motion, no script, a failed module: the statement stands as written, nothing split.
  A statement of up to about 28 letters reads best (two to five words).
*/
export default function (root, opts, lib) {
  const type = root.querySelector(opts.heading || '.mo-la__type, h2, h1');
  if (!type) return {};
  root.classList.add('mo-la');
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
  const chars = lib.split(type, 'chars');
  if (!chars.length) return {};
  const spread = lib.clamp(+opts.spread || 1, 0.4, 1.6), from = opts.from ?? 1, to = opts.to ?? 0.5;
  // every letter has its own fixed start, from a small seeded generator: the same line scatters the same way every time
  let a = 0x9e3779b1;
  const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const n = chars.length;
  const seeds = chars.map((_, i) => ({ x: (rnd() * 2 - 1) * 1.5 * spread, y: (0.5 + rnd() * 1.3) * (rnd() < 0.55 ? 1 : -1) * spread, r: (rnd() * 2 - 1) * 46 * spread, at: (i / Math.max(1, n - 1)) * 0.5 }));
  root.classList.add('is-live');
  const s = lib.scrub(type, (p, r) => {
    const vh = innerHeight;
    const t = lib.clamp((vh * from - r.top) / Math.max(1, vh * (from - to)));
    chars.forEach((c, i) => {
      const k = seeds[i];
      const e = lib.ease.quint(lib.clamp((t - k.at * 0.6) / 0.4));
      const u = 1 - e;
      c.style.transform = u < 0.002 ? '' : `translate(${(k.x * u).toFixed(3)}em, ${(k.y * u).toFixed(3)}em) rotate(${(k.r * u).toFixed(2)}deg)`;
      c.style.opacity = u < 0.002 ? '' : (0.08 + 0.92 * e).toFixed(3);
    });
  }, { mode: 'view', margin: '30% 0px' });
  return { destroy() { s.destroy(); chars.forEach(c => { c.style.transform = ''; c.style.opacity = ''; }); root.classList.remove('is-live'); } };
}
