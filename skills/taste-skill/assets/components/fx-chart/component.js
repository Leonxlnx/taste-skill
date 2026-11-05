// fx-chart: the area under the line is a soft accent fade (the default, plain CSS) or a window onto a
// still, fine dot ruling in the accent ('ruled-grounds'); the line, the chart's own grid and the reading
// stay crisp. A halftone screen was tried here and rejected: its tone runs across the frame, not down
// from the line, so half the area went empty. Nothing in it loops: the ruling is drawn once and kept as a
// picture (no WebGL context at rest).
import { still, palette, tone, color, bag } from '../shared.js';

// requests per day (sample data: replace with the product's own)
const DATA = [1.82, 1.91, 1.88, 2.04, 2.21, 1.68, 1.59, 1.98, 2.11, 2.19, 2.26, 2.38, 1.89, 1.84].map(v => v * 1e6);
const MAX = 2.5e6;

export default function init(root) {
  const b = bag();
  const plot = root.querySelector('.cx-chart__plot');
  const area = root.querySelector('.cx-chart__area');
  const line = root.querySelector('.cx-chart__line');
  const path = line.querySelector('path');
  const cursor = root.querySelector('.cx-chart__cursor');
  const dot = root.querySelector('.cx-chart__dot');
  const tip = root.querySelector('.cx-chart__tip');
  const grid = root.querySelector('.cx-chart__grid');
  const axis = root.querySelector('.cx-chart__axis');
  const page = palette(root);
  const days = DATA.map((_, i) => { const d = new Date(2026, 9, 18 + i); return d; });
  const fmtDay = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const fmtM = v => `${(v / 1e6).toFixed(2)}M`;

  root.querySelector('[data-total]').textContent = `${(DATA.reduce((a, v) => a + v, 0) / 1e6).toFixed(1)}M`;
  grid.innerHTML = [[2e6, '2M'], [1e6, '1M'], [0, '0']].map(([v, l]) => `<span data-v="${l}" style="top:${(1 - v / MAX) * 100}%"></span>`).join('');
  axis.innerHTML = [0, 4, 8, 13].map(i => `<span>${fmtDay(days[i])}</span>`).join('');
  root.querySelector('[data-table] tbody').innerHTML = DATA.map((v, i) => `<tr><th>${fmtDay(days[i])}</th><td>${fmtM(v)}</td></tr>`).join('');

  // a smooth line through the points (monotone-ish cubic), in a 0..1000 x 0..1000 box
  const pts = DATA.map((v, i) => [i / (DATA.length - 1) * 1000, (1 - v / MAX) * 1000]);
  const d = pts.map((p, i) => {
    if (!i) return `M${p[0]},${p[1]}`;
    const a = pts[i - 1], dx = (p[0] - a[0]) / 2.6;
    return `C${a[0] + dx},${a[1]} ${p[0] - dx},${p[1]} ${p[0]},${p[1]}`;
  }).join(' ');
  line.setAttribute('viewBox', '0 0 1000 1000');
  path.setAttribute('d', d);
  const areaPath = `${d} L1000,1000 L0,1000 Z`;
  const svgMask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="${areaPath}"/></svg>`)}")`;
  const fade = 'linear-gradient(to bottom, #000 0%, rgb(0 0 0 / .55) 100%)';
  Object.assign(area.style, {
    maskImage: `${svgMask}, ${fade}`, webkitMaskImage: `${svgMask}, ${fade}`,
    maskSize: '100% 100%', webkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', webkitMaskRepeat: 'no-repeat',
    maskComposite: 'intersect', webkitMaskComposite: 'source-in',
  });

  // the ruling takes a palette near the card: the dots are the accent, the ground one step off the card
  const card = tone(page, 0.035);
  const effect = root.dataset.cxEffect || 'fade';
  const PARAMS = {
    'ruled-grounds': { cell: 12, major: 0, ink: 1, focus: 0, speed: 0, grain: 0.3, calm: 0 },
  };
  // 'fade' draws no effect: the CSS accent fade stays
  if (effect !== 'fade') {
    b.add(still(area, effect, {
      palette: { ...page, bg: color.mix(card, page.accent, color.isDark(page.bg) ? 0.1 : 0.06), surface: card, ink: page.accent },
      seed: root.dataset.cxSeed,
      params: PARAMS[effect] || { speed: 0, drift: 0, calm: 0 },
    }));
  }

  // reading: pointer or arrow keys. The tooltip is pinned inside the plot beside the point, on the
  // side with room, so it never covers the header above the chart.
  let at = -1;
  const show = i => {
    at = Math.max(0, Math.min(DATA.length - 1, i));
    const x = at / (DATA.length - 1) * 100, y = (1 - DATA[at] / MAX) * 100;
    cursor.style.left = `${x}%`;
    dot.style.top = `calc(${y}% - 5.5px)`;
    tip.style.left = `${x}%`;
    tip.style.top = `clamp(0px, calc(${y}% - 15px), calc(100% - 30px))`;
    tip.classList.toggle('is-left', x > 55);
    tip.innerHTML = `<span>${fmtDay(days[at])}</span><b>${fmtM(DATA[at])}</b>`;
    root.classList.add('is-reading');
  };
  const hide = () => root.classList.remove('is-reading');
  const move = e => { const r = plot.getBoundingClientRect(); show(Math.round((e.clientX - r.left) / r.width * (DATA.length - 1))); };
  const key = e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show((at < 0 ? DATA.length - 1 : at) + (e.key === 'ArrowRight' ? 1 : -1)); }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(DATA.length - 1); }
    if (e.key === 'Escape') hide();
  };
  plot.addEventListener('pointermove', move);
  plot.addEventListener('pointerleave', hide);
  plot.addEventListener('keydown', key);
  plot.addEventListener('focus', () => show(at < 0 ? DATA.length - 1 : at));
  plot.addEventListener('blur', hide);
  b.add(() => { plot.removeEventListener('pointermove', move); plot.removeEventListener('pointerleave', hide); plot.removeEventListener('keydown', key); });
  return b;
}
