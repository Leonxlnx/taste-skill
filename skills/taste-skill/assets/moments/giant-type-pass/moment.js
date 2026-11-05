/*
  giant-type-pass - a statement of two to four words set very large, with a photograph showing through
  the letters under a 35% ink tint; as the section crosses the screen the photograph passes upward
  through the type, a little faster than the page, so the words read as a window onto the picture.
  Scrubbed to the scrollbar, no pin. The picture's lower half is what shows (the sky of most
  photographs is too pale for a letter). Under reduced motion and without script the photograph
  stands still in the letters; without a picture the words are plain ink.

    <section class="section" data-moment="giant-type-pass" data-moment-opts='{"image": "assets/img/photo-702.jpg", "travel": 60}'>
      <div class="container">
        <h2 class="mo-gt__type">Ride<br>higher</h2>
        <div class="mo-gt__row"><p>…one or two lines…</p><a class="link" href="#">…</a></div>
      </div>
    </section>

  opts: image (the photograph's URL; or set data-image on the h2), travel (how far the picture moves,
        % of its spare height, default 60), focus (the x position of the picture in %, default 50),
        focusY (the y position the travel is centred on, default 62: the lower half).
*/
export default function (root, opts, lib) {
  const type = root.querySelector('.mo-gt__type') || root.querySelector('h1, h2');
  if (!type) return {};
  const src = opts.image || type.dataset.image;
  if (!src) return {};
  type.style.setProperty('--mo-img', `url("${src}")`);
  type.style.setProperty('--mo-x', `${lib.clamp(+(opts.focus ?? 50), 0, 100)}%`);
  const fy = lib.clamp(+(opts.focusY ?? 62), 0, 100);
  type.style.setProperty('--mo-y', `${fy}%`);
  root.classList.add('is-live');
  if (lib.reduced()) return {};
  const travel = Math.max(0, Math.min(100, +opts.travel || 60));
  const lo = lib.clamp(fy - travel / 2, 0, 100), hi = lib.clamp(fy + travel / 2, 0, 100);
  const s = lib.scrub(root, p => { type.style.setProperty('--mo-y', `${lib.lerp(hi, lo, p).toFixed(2)}%`); }, { mode: 'view' });
  return { destroy() { s.destroy(); type.style.removeProperty('--mo-y'); } };
}
