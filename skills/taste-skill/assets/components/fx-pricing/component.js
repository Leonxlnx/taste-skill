// fx-pricing: one effect host behind the recommended plan, masked to a 1.5px ring and a faint wash at
// the top; the other plans stay plain, so the eye lands on the one that is recommended. The ring is
// still, so it is drawn once and kept as a picture (no WebGL context at rest).
import { still, palette, accentPalette, color, bag, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'gradient-mesh': { speed: 0, lines: 0, warp: 0.7, softness: 0.45, tint: 1, calm: 0 },
  'aurora-curtains': { speed: 0, bands: 3, height: 0.8, intensity: 1.5, stars: 0, calm: 0 },
  'grain-gradient': { speed: 0, grainMotion: 0, softness: 0.5, warp: 0.7, grain: 0.35, tint: 1, contrast: 0.8, calm: 0 },
};

export default function init(root) {
  const b = bag();
  const plan = root.querySelector('.cx-plan.is-featured');
  const host = plan?.querySelector('.cx-plan__fx');
  if (!host) return b;
  const page = palette(root);
  const ring = accentPalette(page, { min: 1, lift: 0.22 });
  const effect = root.dataset.cxEffect || 'gradient-mesh';
  const s = b.add(still(host, effect, {
    palette: { ...ring, bg: color.mix(page.accent, page.bg, 0.2) },
    seed: root.dataset.cxSeed,
    // still: a ring that keeps drifting would need a pause button on a pricing card
    params: { ...tuned(PARAMS, effect), speed: 0, drift: 0 },
  }));
  s.ready.then(() => plan.classList.add('is-live'));
  b.add(() => plan.classList.remove('is-live'));
  return b;
}
