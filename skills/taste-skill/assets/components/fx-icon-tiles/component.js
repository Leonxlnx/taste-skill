// fx-icon-tiles: one effect canvas over the grid, masked to the icon chips, so each chip shows its own
// part of the same field (related tones, never six copies) for the cost of one canvas. The field is
// still, so it is drawn once and kept as a picture: no WebGL context and no frames at rest.
import { still, palette, accentPalette, windows, bag, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'grain-gradient': { speed: 0, softness: 0.4, warp: 0.7, grain: 0.35, grainMotion: 0, tint: 0.9, contrast: 0.75, calm: 0 },
  'gradient-mesh': { speed: 0, lines: 0, warp: 0.7, softness: 0.4, tint: 0.9, calm: 0 },
};

export default function init(root) {
  const b = bag();
  const host = root.querySelector('.cx-tiles__fx');
  const chips = [...root.querySelectorAll('.cx-tiles__chip')];
  const page = palette(root);
  b.add(windows(host, chips));
  const effect = root.dataset.cxEffect || 'grain-gradient';
  const s = b.add(still(host, effect, {
    palette: accentPalette(page, { lift: 0.16 }),
    seed: root.dataset.cxSeed,
    // still: six chips that drift would be six small loops on one screen
    params: { ...tuned(PARAMS, effect), speed: 0, drift: 0 },
  }));
  // the chips keep their plain accent fill until the picture is in place
  s.ready.then(() => root.classList.add('is-live'));
  b.add(() => root.classList.remove('is-live'));
  return b;
}
