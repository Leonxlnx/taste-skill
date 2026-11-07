/*
  picture-develops - a photograph develops once as its frame comes on screen, in one of two looks.

  look "film" (the default on a place, product or service page, <meta name="site-kind" content="other">
  or <html data-type="place">): the photograph comes up out of the paper the way a print does in the
  developer tray: pale, flat and without colour at first, its darks arriving before its light tones,
  then its colour, while it settles from a slight zoom. About 1.6 s, once; transform and a CSS filter
  on the one picture, no canvas, any origin.

  look "print" (the default on a tech, gaming or software page): first a two-tone
  halftone print, ink dots on paper in the ground's surface tone (so the frame keeps its edges and
  radius while it develops), its darkest cells first, then the print gives way to the photograph,
  which settles from a slight zoom. A picture with a clear subject against a plain field (a rock on
  a beach, a facade) prints best; an all-mid-tone picture is a blur of dots. About 1.8 s, once; timed, not scrubbed. One 2D
  canvas, freed when it is done. Under reduced motion, without script, or when the picture cannot be
  read (another origin without CORS) the photograph stands.

    <figure class="frame frame--photo" data-moment="picture-develops" data-moment-opts='{"cell": 9}'>
      <img src="…" alt="…" width="1800" height="1200" crossorigin="anonymous">
    </figure>

  The host sets the picture's size (an aspect-ratio or a height); the photograph fills it (cover).
  opts: look "film" | "print" (by the page's kind when left out); cell px of the halftone (9, 6-14);
        duration ms (film 1600, print 1800); focus [x, y] 0-1 of the crop (0.5, 0.5).
  Give it a photograph big enough to be the section's subject (half the container or more): a small
  picture developing reads as a loading state, not a moment.
  On a phone the film look runs too (one picture, a filter and a transform, once); the print look
  (a canvas) shows the photograph there.
*/
export const phone = true;
// a place, product or service page (site-kind other): the photographic look, never the halftone print
const otherPage = () => {
  const m = document.querySelector('meta[name="site-kind"]');
  return document.documentElement.dataset.type === 'place' || (!!m && m.content.trim().toLowerCase() === 'other');
};
export default function (root, opts, lib) {
  const img = root.querySelector('img');
  if (!img) return {};
  root.classList.add('mo-pd');
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
  if ((opts.look || (otherPage() ? 'film' : 'print')) === 'film') return film(root, img, opts, lib);
  if (lib.phone()) { root.dataset.momentStill = 'phone'; root.classList.add('is-done'); return {}; }
  const cell = Math.max(6, Math.min(14, +opts.cell || 9));
  const dur = Math.max(900, +opts.duration || 1800);
  const [fx, fy] = Array.isArray(opts.focus) ? opts.focus : [0.5, 0.5];
  const canvas = document.createElement('canvas');
  canvas.className = 'mo-pd__print';
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);
  root.classList.add('is-live');
  let raf = 0, done = false;
  const finish = () => { if (done) return; done = true; if (raf) cancelAnimationFrame(raf); canvas.remove(); root.classList.remove('is-live'); root.classList.add('is-done'); };
  // the paper is the ground's surface tone, a shade off the page, so the frame keeps its edges while
  // the print develops; the dots are the ink
  const tokens = () => { const cs = getComputedStyle(root); return { bg: cs.getPropertyValue('--surface').trim() || cs.getPropertyValue('--bg').trim() || '#f4f4f4', ink: cs.getPropertyValue('--ink').trim() || '#111' }; };
  const sample = () => {
    const w = root.clientWidth, h = root.clientHeight;
    if (!w || !h || !img.naturalWidth) return null;
    canvas.width = w; canvas.height = h;
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const ox = off.getContext('2d', { willReadFrequently: true });
    const ir = img.naturalWidth / img.naturalHeight, fr = w / h;
    let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
    if (ir > fr) { sw = sh * fr; sx = (img.naturalWidth - sw) * fx; } else { sh = sw / fr; sy = (img.naturalHeight - sh) * fy; }
    ox.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
    let data;
    try { data = ox.getImageData(0, 0, cols, rows).data; } catch { return null; }
    const dark = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) dark[i] = 1 - (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
    return { cols, rows, dark };
  };
  const draw = (g, t) => {
    const ctx = canvas.getContext('2d');
    const { bg, ink } = tokens();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    const thr = 1 - t * 1.12;               // the darkest cells first, then the lighter ones
    const half = cell / 2;
    ctx.beginPath();
    for (let r = 0; r < g.rows; r++) {
      const shift = (r & 1) ? half * 0.5 : -half * 0.5;
      for (let c = 0; c < g.cols; c++) {
        const d = g.dark[r * g.cols + c];
        if (d <= thr) continue;
        const k = Math.min(1, (d - thr) / 0.22);  // a cell's dot grows in over a short span
        const rad = half * Math.min(1, d * 1.15) * k;
        if (rad < 0.35) continue;
        const x = c * cell + half + shift, y = r * cell + half;
        ctx.moveTo(x + rad, y);
        ctx.arc(x, y, rad, 0, 6.2832);
      }
    }
    ctx.fill();
  };
  const run = async () => {
    try { if (!img.complete) await new Promise((r, j) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', j, { once: true }); }); await img.decode?.(); } catch { /* shows anyway */ }
    const g = sample();
    if (!g) return finish();
    root.classList.add('is-developing');
    let t0 = 0;
    const step = now => {
      if (done) return;
      if (!t0) t0 = now;
      const u = Math.min(1, (now - t0) / dur);
      if (u < 0.58) { draw(g, 0.14 + lib.ease.out(u / 0.58) * 0.86); canvas.style.opacity = '1'; }
      else { canvas.style.opacity = String(1 - lib.ease.smooth(0.58, 1, u)); }
      if (u < 1) raf = requestAnimationFrame(step); else finish();
    };
    raf = requestAnimationFrame(step);
  };
  // the print covers the photograph only from just before the frame scrolls in: a frame no observer reports keeps its photograph
  canvas.style.display = 'none'; root.classList.remove('is-live');
  const cover = () => { if (done) return; canvas.style.display = ''; root.classList.add('is-live'); };
  const r0 = root.getBoundingClientRect();
  if (r0.bottom > 0 && r0.top < innerHeight * 1.25) cover();   // already near at mount: covered at once, as before
  const arm = lib.once(root, cover, { threshold: 0, margin: '0px 0px 25% 0px' });
  const seen = lib.once(root, () => { cover(); run(); }, { threshold: Math.min(0.4, 0.6 * innerHeight / Math.max(1, root.getBoundingClientRect().height)) });
  return { destroy() { arm.destroy(); seen.destroy(); finish(); } };
}

// the film look: the picture itself, from a pale flat grey print to the photograph (moment.css holds the
// start under .is-armed from just before the frame scrolls in, so a frame no observer reports keeps its photograph)
function film(root, img, opts, lib) {
  const dur = Math.max(1000, +opts.duration || 1600);
  let done = false, anim = null;
  root.classList.add('mo-pd--film');
  const finish = () => { if (done) return; done = true; anim?.cancel(); root.classList.remove('is-armed', 'is-live'); root.classList.add('is-done'); };
  const arm = () => { if (!done) root.classList.add('is-armed'); };
  const run = async () => {
    if (done) return;
    arm();
    try { if (!img.complete) await new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); }); } catch { /* shows anyway */ }
    if (done) return;
    root.classList.add('is-live');
    // the darks come first (contrast), the colour last (saturation); the zoom settles over the whole run.
    // The change starts on the first frame and runs evenly to a soft landing: a print that sat still for
    // half a second would read as a picture still loading
    anim = img.animate([
      { filter: 'grayscale(1) contrast(.55) brightness(1.32)', transform: 'scale(1.06)' },
      { filter: 'grayscale(.8) contrast(.82) brightness(1.14)', offset: 0.3 },
      { filter: 'grayscale(.35) contrast(.95) brightness(1.04)', offset: 0.62 },
      { filter: 'grayscale(0) contrast(1) brightness(1)', transform: 'none' },
    ], { duration: dur, easing: 'cubic-bezier(.3, .2, .3, 1)', fill: 'both' });
    root.classList.remove('is-armed');
    anim.finished.then(finish, finish);
  };
  const r0 = root.getBoundingClientRect();
  if (r0.bottom > 0 && r0.top < innerHeight * 1.25) arm();
  const near = lib.once(root, arm, { threshold: 0, margin: '0px 0px 25% 0px' });
  // it develops once a quarter of it is on screen (less of a frame taller than half the screen), so the
  // faint print is seen only briefly before it starts to change
  const seen = lib.once(root, run, { threshold: Math.min(0.25, 0.4 * innerHeight / Math.max(1, r0.height)) });
  return { destroy() { near.destroy(); seen.destroy(); finish(); } };
}
