// fx-stat: on a dark or colour ground, one still effect canvas over the row of numbers, so only the
// digits show it (soft curtains of light, no motion), drawn once and kept as a picture (no WebGL context
// and no frames at rest). On a light ground an effect inside digits reads as scratched metal, so the
// digits get a plain ink fade instead: full ink at the top to about 60% ink.
import { fill, bag, paramsOf, palette, isDark, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'aurora-curtains': { bands: 4, height: 0.85, intensity: 1.3, calm: 0 },
  'grain-gradient': { grainMotion: 0, calm: 0 },
};

export default function init(root) {
  const b = bag();
  const light = !isDark(palette(root));
  root.classList.toggle('cx-stat--fade', light);
  b.add(() => root.classList.remove('cx-stat--fade'));
  if (light) return b;
  root.querySelectorAll('[data-cx-fill]').forEach(el => {
    const params = { ...tuned(PARAMS, el.dataset.cxFill), ...(paramsOf(el) || {}), speed: 0 };
    b.add(fill(el, el.dataset.cxFill, { still: true, seed: el.dataset.cxSeed, params }));
  });
  return b;
}
