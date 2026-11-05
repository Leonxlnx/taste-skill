// fx-band: a quiet line effect on the band's far side (topographic contours by default), softer than
// the ink so the headline stays the strongest thing in the band. On a wide band the effect starts 48px
// past the end of the copy (measured, so a longer line of text pushes it right); stacked, it sits under
// the copy. Every effect here is still: a drift so slow that nobody sees it is not worth a frame loop
// on every screen, so the band is drawn once, kept as a picture (no WebGL context at rest) and needs no
// pause button.
import { still, palette, tone, color, bag } from '../shared.js';

const GAP = 48;
// every effect the band takes, tuned quiet: thin lines, no accent floods, no calm hole (the host is
// already kept off the copy), no motion. ridgeline only when the page names it (it reads as a record cover).
const PARAMS = {
  'contour-lines': { levels: 20, scale: 1.3, lineWidth: 1, indexEvery: 5, opacity: 0.42, speed: 0, tint: 0.45, shade: 0.25, edge: 0.35, calm: 0 },
  'line-engraving': { pitch: 6, source: 1, cross: 0.3, drift: 0, size: 1.1, calm: 0 },
  'dot-terrain': { spacing: 12, dot: 2.2, speed: 0, opacity: 0.7, crest: 0.6, haze: 0.2, calm: 0 },
  'soft-light-bars': { speed: 0, glow: 0.6, haze: 0.3, grain: 0.4, calm: 0 },
  ridgeline: { lines: 30, peak: 0.55, envelope: 0.36, span: 0.9, focus: 0.58, lineWidth: 1, speed: 0, calm: 0 },
};

export default function init(root) {
  const b = bag();
  const host = root.querySelector('.cx-band__fx');
  const copy = root.querySelector('.cx-band__copy');
  const page = palette(root);
  const card = tone(page, 0.035);
  // the copy's right edge is its widest line, not its max-width box
  const place = () => {
    if (getComputedStyle(root).flexDirection === 'column' || root.clientWidth < 900) { host.style.left = ''; return; }
    const rr = root.getBoundingClientRect();
    let right = 0;
    for (const n of copy.children) {
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) right = Math.max(right, r.right);
    }
    host.style.left = `${Math.round(right - rr.left + GAP)}px`;
  };
  place();
  const ro = new ResizeObserver(place);
  ro.observe(root);
  document.fonts?.ready.then(place);
  b.add(() => { ro.disconnect(); host.style.left = ''; });
  const effect = root.dataset.cxEffect || 'contour-lines';
  b.add(still(host, effect, {
    palette: { ...page, bg: card, ink: color.mix(page.ink, card, 0.35) },
    seed: root.dataset.cxSeed,
    // thin lines need more strength on a dark ground to read at all
    params: { ...(PARAMS[effect] || { calm: 0 }), ...(effect === 'contour-lines' && color.isDark(page.bg) ? { opacity: 0.62 } : {}), speed: 0, drift: 0 },
  }));
  return b;
}
