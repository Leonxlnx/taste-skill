// fx-globe: dotted-globe in an inset panel, rising from its floor; the region times and the request
// counter change a little about once a second while the card is on screen (the card never moves).
// The panel's pause button holds the globe and the counters together.
import { mount, palette, tone, bag, whileVisible, pauser } from '../shared.js';

export default function init(root) {
  const b = bag();
  const panel = root.querySelector('.cx-globe__panel');
  const page = palette(root);
  const p = b.add(pauser(root, { label: 'the globe', at: panel }));
  b.add(p.add(mount(panel, 'dotted-globe', {
    palette: { ...page, bg: tone(page, 0.065) },
    seed: panel.dataset.cxSeed,
    params: { calmX: 0.5, calmY: 0.12, calm: 0, size: 1.05, speed: 3, arcs: 3.2, tilt: 18, glow: 0.6 },
  })));
  const cells = [...root.querySelectorAll('[data-ms]')];
  const count = root.querySelector('[data-count]');
  let n = +count.dataset.count;
  const fmt = new Intl.NumberFormat('en-US');
  b.add(whileVisible(root, {
    every: 1200,
    run() {
      const c = cells[Math.floor(Math.random() * cells.length)];
      const base = +c.dataset.ms;
      c.textContent = String(base + Math.round((Math.random() - 0.5) * 4));
      n += Math.round((Math.random() - 0.45) * 900);
      count.textContent = fmt.format(n);
    },
  }));
  return b;
}
