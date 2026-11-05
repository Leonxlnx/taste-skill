// fx-logos: fill() lays the effect over the marks and names (as a sibling overlay, so the list stays a
// clean <ul>); CSS shows it only in a band that crosses the row once every 9 s, and a pause button at
// the row's end holds it. Under reduced motion there is no band and the row stays plain.
import { fill, bag, paramsOf, reduced, pauser, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'grain-gradient': { speed: 0.6, grainMotion: 0, grain: 0.3, contrast: 0.8, tint: 0.9, calm: 0 },
  'aurora-curtains': { speed: 0.15, bands: 3, height: 0.8, intensity: 1.6, stars: 0, calm: 0 },
  'soft-light-bars': { speed: 0.5, softness: 0.6, glow: 1.1, haze: 0.3, stipple: 0.2, grain: 0.3, calm: 0 },
};

export default function init(root) {
  const b = bag();
  if (reduced()) return b;
  const p = b.add(pauser(root, { label: 'the light on the logos' }));
  root.querySelectorAll('[data-cx-fill]').forEach(el => {
    b.add(p.add(fill(el, el.dataset.cxFill, { keep: true, seed: el.dataset.cxSeed, params: paramsOf(el) || tuned(PARAMS, el.dataset.cxFill, { speed: 0.5, calm: 0 }) })));
  });
  return b;
}
