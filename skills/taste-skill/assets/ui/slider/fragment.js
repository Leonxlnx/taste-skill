// slider: one glide per cycle (about 3.4 s): the first thumb takes the accent, glides out to a value and
// back to where the page set it, and the number follows. The page's markup is the finished picture: the
// thumb's place is its style="--v:..", the number is the <output> as written (its words and unit stay;
// only the figure changes while it moves), so the script never shows a value of its own over the page's.
// opts.drive = { param: 'grain', min: 0.1, max: 0.9 } also sets that param of the effect the fragment
// sits on (the nearest [data-fx-mounted] around it), so the control visibly changes the ground.
// opts.stops: where the thumb goes (0..1), one per cycle in turn; opts.scale: the figure at 1.0.
// opts.compact: only the name and that one slider (248 x 128), for the calm middle of a focal tile.
import { loop } from '../ui.js';

const clamp = x => Math.min(0.92, Math.max(0.08, x));

export default function init(root, opts = {}) {
  const track = root.querySelector('[data-slider-track]'), out = root.querySelector('[data-slider-val]');
  if (!track) return null;
  const drive = opts.drive;
  if (opts.compact) root.classList.add('ui-slider--compact');
  const ground = () => { const g = root.closest('[data-fx-mounted]'); return g && g.__fx; };
  const v0 = Math.min(1, Math.max(0, parseFloat(track.style.getPropertyValue('--v')) || parseFloat(getComputedStyle(track).getPropertyValue('--v')) || 0.5));
  const out0 = out ? out.textContent : '';
  const num = out0.match(/-?\d+(?:[.,]\d+)?/);
  const fig0 = num ? parseFloat(num[0].replace(',', '.')) : null;
  const dec = num && /[.,]/.test(num[0]) ? num[0].split(/[.,]/)[1].length : 0;
  const scale = opts.scale || (fig0 != null && v0 > 0 ? fig0 / v0 : 100);
  const figure = x => {
    if (!num) return out0;
    let f = (x * scale).toFixed(dec);
    if (num[0].includes(',')) f = f.replace('.', ',');
    return out0.slice(0, num.index) + f + out0.slice(num.index + num[0].length);
  };
  const far = v0 <= 0.5 ? clamp(v0 + 0.36) : clamp(v0 - 0.36);
  const near = v0 - 0.22 >= 0.08 ? v0 - 0.22 : clamp(v0 + 0.2);
  const stops = opts.stops || [far, near];
  const set = (x, exact) => {
    track.style.setProperty('--v', x.toFixed(4));
    if (out) out.textContent = exact ? out0 : figure(x);
    if (drive) { const fx = ground(); if (fx) fx.set({ [drive.param]: drive.min + (drive.max - drive.min) * x }); }
  };
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let k = 0;
  return loop(root, async api => {
    const to = stops[k++ % stops.length];
    await api.wait(200);
    track.classList.add('is-drag');
    await api.tween(1000, t => set(v0 + (to - v0) * t), ease);
    await api.wait(420);
    await api.tween(1000, t => set(to + (v0 - to) * t), ease);
    set(v0, true);
    await api.wait(160);
    track.classList.remove('is-drag');
    await api.wait(480);
  }, { still: () => { k = 0; track.classList.remove('is-drag'); set(v0, true); } });
}
