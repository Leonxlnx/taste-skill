/*
  closing-lift - the last content section lifts away like a sheet and uncovers the closing picture
  that was held under it all along: the picture settles from a close crop to its framing as the sheet
  clears, and the closing line with the one action fades up on it. The lift is the page's own scroll
  (the picture is position: sticky; bottom: 0 under the sheet); only the settle is scrubbed. Under
  reduced motion and without script the picture is a plain closing section after the sheet.

    <div data-moment="closing-lift" data-moment-opts='{"settle": 1.18}'>
      <section class="section mo-cl__sheet">…the last content section (an FAQ, a quote, prices)…</section>
      <section class="mo-cl__under">
        <img class="mo-cl__img" src="…" alt="…" width="2400" height="1600">
        <div class="mo-cl__band"><div class="container">
          <h2>The closing line</h2><p>One line.</p>
          <div class="btn-row"><a class="btn btn--primary" href="#">The one action</a></div>
        </div></div>
      </section>
    </div>
    <footer>…</footer>

  opts: settle (the picture's scale while covered, 1.1-1.3; default 1.18), focus (object-position of
        the picture, default "50% 50%").
*/
export default function (root, opts, lib) {
  const sheet = root.querySelector('.mo-cl__sheet'), under = root.querySelector('.mo-cl__under'), img = root.querySelector('.mo-cl__img'), band = root.querySelector('.mo-cl__band');
  if (!sheet || !under || !img || !band) return {};
  root.classList.add('mo-cl');
  if (opts.focus) img.style.objectPosition = opts.focus;
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
  root.classList.add('is-live');
  const settle = Math.max(1.05, Math.min(1.3, +opts.settle || 1.18));
  const s = lib.scrub(root, () => {
    const vh = innerHeight, r = sheet.getBoundingClientRect();
    const q = document.documentElement.scrollHeight <= vh * 1.05 ? 1 : lib.clamp((vh - r.bottom) / vh);           // 0: the sheet still covers the picture; 1: it has cleared
    img.style.transform = `scale(${lib.lerp(settle, 1, lib.ease.out(q)).toFixed(4)})`;
    const k = lib.ease.smooth(0.3, 0.85, q);
    band.style.opacity = String(k);
    band.style.transform = `translateY(${((1 - k) * 24).toFixed(1)}px)`;
  }, { mode: 'view', margin: '0px' });
  // a keyboard user who tabs to the action while the sheet still covers it: lift the sheet away so the band is shown.
  // keyboard focus only: a mouse press on a half-faded button must not scroll the page out from under the pointer
  const lift = e => { if (!e.target.matches(':focus-visible')) return; const r = sheet.getBoundingClientRect(); if (r.bottom > 0) scrollBy(0, r.bottom); };
  band.addEventListener('focusin', lift);
  return { destroy() { band.removeEventListener('focusin', lift); s.destroy(); root.classList.remove('is-live'); img.style.transform = ''; band.style.opacity = ''; band.style.transform = ''; } };
}
