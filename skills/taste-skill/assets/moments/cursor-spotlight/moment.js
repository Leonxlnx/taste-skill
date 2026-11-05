/*
  cursor-spotlight - a soft light on the hero's ground follows the pointer with a short lag and shows
  a fine dot grid around it; when the pointer leaves, the light drifts back to its resting spot. CSS
  gradients driven by two custom properties, no canvas. On touch screens, under reduced motion and
  without script the light rests at its spot.

    <div class="frame frame--hero" data-moment="cursor-spotlight" data-moment-opts='{"rest": [0.72, 0.28], "radius": 420}'>
      …the hero's UI window or object…
    </div>

  opts: rest [x, y] 0-1 (where the light sits at rest; default [0.72, 0.28]), radius px (420),
        grid (true: the dot grid shows in the light; default true).
*/
export default function (root, opts, lib) {
  root.classList.add('mo-cs');
  if (opts.grid === false) root.classList.add('mo-cs--plain');
  const light = document.createElement('div');
  light.className = 'mo-cs__light';
  light.setAttribute('aria-hidden', 'true');
  root.prepend(light);
  const rest = Array.isArray(opts.rest) && opts.rest.length === 2 ? opts.rest : [0.72, 0.28];
  root.style.setProperty('--mo-r', `${Math.max(160, +opts.radius || 420)}px`);
  const set = (x, y) => { root.style.setProperty('--mo-x', `${(x * 100).toFixed(2)}%`); root.style.setProperty('--mo-y', `${(y * 100).toFixed(2)}%`); };
  set(rest[0], rest[1]);
  if (lib.reduced() || lib.coarse()) return { destroy() { light.remove(); } };
  let tx = rest[0], ty = rest[1], cx = tx, cy = ty, raf = 0;
  const tick = () => {
    raf = 0;
    cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
    set(cx, cy);
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(tick); else { cx = tx; cy = ty; set(tx, ty); }
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const move = e => { const r = root.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; req(); };
  const leave = () => { tx = rest[0]; ty = rest[1]; req(); };
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerleave', leave);
  return { destroy() { root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave); if (raf) cancelAnimationFrame(raf); light.remove(); } };
}
