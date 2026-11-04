/*
  picture-develops - a photograph develops once as its frame comes on screen: first a two-tone
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
  opts: cell px of the halftone (9, 6-14); duration ms (1800); focus [x, y] 0-1 of the crop (0.5, 0.5).
*/
export default function (root, opts, lib) {
  const img = root.querySelector('img');
  if (!img) return {};
  root.classList.add('mo-pd');
  if (lib.reduced()) { root.classList.add('is-done'); return {}; }
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
