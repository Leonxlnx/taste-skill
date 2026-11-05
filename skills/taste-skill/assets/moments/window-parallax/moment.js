/*
  window-parallax - one wide photograph seen through a frame moves a little slower than the page, so
  the frame reads as a window onto a larger picture. Scrubbed to the scrollbar, a few percent of
  travel, no pin. Under reduced motion and without script the photograph stands.

    <figure class="frame frame--photo mo-wp" data-moment="window-parallax" data-moment-opts='{"travel": 12}'>
      <img src="…" alt="…" width="2400" height="1200">
    </figure>

  The host sets the frame's size (a wide band, 16:7 to 3:1); the picture is cut taller than it.
  opts: travel (how far the picture moves, % of the frame's height each way; 12, 4-20).
*/
export default function (root, opts, lib) {
  const img = root.querySelector('img');
  if (!img) return {};
  root.classList.add('mo-wp');
  if (lib.reduced()) return {};
  const travel = lib.clamp(+opts.travel || 12, 4, 20);
  root.style.setProperty('--mo-travel', `${travel}%`);
  root.classList.add('is-live');
  const s = lib.scrub(root, (p, r) => { img.style.transform = `translateY(${((0.5 - p) * 2 * (travel / 100) * r.height).toFixed(1)}px)`; }, { mode: 'view' });
  return { destroy() { s.destroy(); img.style.transform = ''; root.classList.remove('is-live'); } };
}
