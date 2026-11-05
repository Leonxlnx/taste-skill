// fx-headline: fills [data-cx-fill] headlines (their [data-fill] phrase, or all of their words) with an
// effect. The fill is still (speed 0, still grain): letters that keep moving would need a pause button
// next to the page's main line, and a still sheen reads as well. Being still, it is drawn once and kept
// as a picture: no WebGL context and no frames at rest.
import { fill, bag, paramsOf } from '../shared.js';

const STILL = { speed: 0, drift: 0, grainMotion: 0 };

export default function init(root) {
  const b = bag();
  root.querySelectorAll('[data-cx-fill]').forEach(el => {
    b.add(fill(el, el.dataset.cxFill, { still: true, seed: el.dataset.cxSeed, params: { ...(paramsOf(el) || {}), ...STILL } }));
  });
  return b;
}
