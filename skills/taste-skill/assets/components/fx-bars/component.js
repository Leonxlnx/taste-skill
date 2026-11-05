// fx-bars: one effect canvas over the plot, masked to the bars, on a 0 / 50k / 100k scale. The effect
// is a still, low-contrast grain in the accent (no motion, no streaks), so the bars read as one flat
// printed material, drawn once and kept as a picture (no WebGL context at rest). The latest month
// carries a ring; its value is the header figure.
import { still, palette, accentPalette, windows, bag } from '../shared.js';

// revenue by month in thousands of dollars (sample data: replace with the product's own)
const DATA = [42.1, 47.8, 51.2, 49.4, 57.9, 63.3, 61.0, 69.8, 75.6, 74.2, 83.1, 91.2];
const MONTHS = ['N', 'D', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O'];
const FULL = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const MAX = 100;
const TICKS = [[100, '100k'], [50, '50k'], [0, '0']];

export default function init(root) {
  const b = bag();
  const cols = root.querySelector('.cx-bars__cols');
  const host = root.querySelector('.cx-bars__fx');
  const page = palette(root);
  cols.innerHTML = DATA.map(v => `<div class="cx-bars__col" style="--h:${(v / MAX * 100).toFixed(1)}%"><span class="cx-bars__tag">$${v.toFixed(1)}k</span><div class="cx-bars__bar"></div></div>`).join('');
  root.querySelector('.cx-bars__scale').innerHTML = TICKS.map(([v, l]) => `<span class="${v ? '' : 'is-base'}" data-v="${l}" style="top:${(1 - v / MAX) * 100}%"></span>`).join('');
  root.querySelector('.cx-bars__axis').innerHTML = MONTHS.map(m => `<span>${m}</span>`).join('');
  root.querySelector('[data-table] tbody').innerHTML = DATA.map((v, i) => `<tr><th>${FULL[i]}</th><td>${v.toFixed(1)}</td></tr>`).join('');
  const effect = root.dataset.cxEffect || 'grain-gradient';
  if (effect === 'flat') return b; // the plain accent bars
  const bars = [...root.querySelectorAll('.cx-bars__bar')];
  b.add(windows(host, bars));
  const s = b.add(still(host, effect, {
    palette: accentPalette(page, { min: 1, lift: 0.05 }),
    seed: root.dataset.cxSeed,
    params: { speed: 0, grainMotion: 0, grain: 0.3, contrast: 0.16, tint: 0.35, softness: 0.85, warp: 0.25, calm: 0 },
  }));
  s.ready.then(() => root.classList.add('is-live'));
  b.add(() => root.classList.remove('is-live'));
  return b;
}
