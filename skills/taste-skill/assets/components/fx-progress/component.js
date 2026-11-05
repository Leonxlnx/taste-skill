// fx-progress: one effect host over the card, clipped to the busy row up to its progress, so the row
// fills with light as the file imports. The loop runs only on screen; reduced motion shows one still state.
import { mount, palette, color, reduced, bag, pauser, held, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'grain-gradient': { speed: 1.2, softness: 0.5, warp: 0.7, grain: 0.4, grainMotion: 0, scatter: 0.6, tint: 1, contrast: 1, calm: 0 },
  'soft-light-bars': { speed: 1.2, bars: 3, softness: 0.6, glow: 1, breathe: 0, haze: 0.4, stipple: 0.3, grain: 0.4, calm: 0 },
  'aurora-curtains': { speed: 0.3, bands: 3, height: 0.8, intensity: 1.6, stars: 0, calm: 0 },
  'gradient-mesh': { speed: 0.4, lines: 0, warp: 0.7, softness: 0.5, tint: 1, calm: 0 },
};

const ease = t => 1 - Math.pow(1 - t, 2.2);

export default function init(root) {
  const b = bag();
  const host = root.querySelector('.cx-upload__fx');
  const rows = [...root.querySelectorAll('.cx-upload__row')];
  const count = root.querySelector('[data-count]');
  const page = palette(root);
  // the loop runs on its own, so the header carries a pause button
  const p = reduced() ? null : b.add(pauser(root, { label: 'the import preview', into: root.querySelector('.cx-upload__head') }));
  const effect = root.dataset.cxEffect || 'grain-gradient';
  const fxCtrl = mount(host, effect, {
    palette: { ...page, bg: color.mix(page.bg, page.accent, color.isDark(page.bg) ? 0.24 : 0.16), surface: color.mix(page.bg, page.accent, 0.4), accent: color.isDark(page.bg) ? page.accent : color.saturate(page.accent, 1.15) },
    seed: root.dataset.cxSeed,
    params: tuned(PARAMS, effect),
  });
  b.add(p ? p.add(fxCtrl) : fxCtrl);

  const clip = (row, p) => {
    const hr = host.getBoundingClientRect(), r = row.getBoundingClientRect();
    const top = r.top - hr.top, left = r.left - hr.left;
    const right = hr.width - (left + r.width * p), bottom = hr.height - (top + r.height);
    host.style.clipPath = `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round 8px)`;
  };
  const setState = (doneN, busy, p) => {
    rows.forEach((row, i) => {
      row.classList.toggle('is-done', i < doneN);
      row.classList.toggle('is-busy', i === busy);
      const v = i < doneN ? 100 : i === busy ? Math.round(p * 100) : 0;
      const prog = row.querySelector('progress');
      prog.value = v;
      prog.textContent = `${v}%`;
      row.querySelector('.cx-upload__line').style.setProperty('--p', i === busy ? p : 0);
    });
    count.textContent = `${doneN} of ${rows.length} done`;
    if (busy >= 0) clip(rows[busy], p); else host.style.clipPath = 'inset(50%)';
  };

  if (reduced()) { setState(1, 1, 0.64); return b; }

  // the loop: each file takes a time by its size, then a pause, then all reset
  let raf = 0, t0 = 0, idx = 0, onScreen = false;
  const dur = row => 1600 + Math.min(4200, +row.dataset.size * 300);
  // a pause holds the frame where it is: time spent paused does not count
  let pausedAt = 0;
  const tick = ts => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    if (held(root)) { pausedAt = pausedAt || ts; return; }
    if (pausedAt) { t0 += ts - pausedAt; pausedAt = 0; }
    if (!t0) t0 = ts;
    const el = ts - t0;
    if (idx < rows.length) {
      const d = dur(rows[idx]);
      const p = Math.min(1, el / d);
      setState(idx, idx, ease(p));
      if (p >= 1) { idx++; t0 = ts; if (idx === rows.length) setState(rows.length, -1, 0); }
    } else if (el > 2600) { idx = 0; t0 = ts; }
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(e => {
    onScreen = e[e.length - 1].isIntersecting;
    if (onScreen && !raf) { t0 = 0; raf = requestAnimationFrame(tick); }
  });
  io.observe(root);
  const vis = () => { if (!document.hidden && onScreen && !raf) { t0 = 0; raf = requestAnimationFrame(tick); } };
  const resume = () => { if (!held(root) && onScreen && !document.hidden && !raf) raf = requestAnimationFrame(tick); };
  document.addEventListener('visibilitychange', vis);
  root.addEventListener('cx-pause', resume);
  setState(0, 0, 0.42);
  b.add(() => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', vis); root.removeEventListener('cx-pause', resume); });
  return b;
}
