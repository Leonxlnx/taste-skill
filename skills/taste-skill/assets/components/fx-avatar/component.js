// fx-avatar: one small effect host shaped by a radial mask into a ring with a soft glow; it sits on the
// speaking person's avatar and glides to the next speaker every few seconds (the card never moves).
// A pause button at the end of the status line holds the ring, the turns and the level bars.
import { mount, palette, accentPalette, color, whileVisible, bag, pauser, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'gradient-mesh': { speed: 0.35, lines: 0, warp: 0.8, softness: 0.4, tint: 1, calm: 0 },
  'silk-folds': { speed: 0.3, folds: 0.7, sheen: 0.7, scale: 1.2, grain: 0, calm: 0 },
  'aurora-curtains': { speed: 0.25, bands: 3, height: 0.8, intensity: 1.6, stars: 0, calm: 0 },
  'grain-gradient': { speed: 1, softness: 0.5, warp: 0.7, grain: 0.3, grainMotion: 0, tint: 1, contrast: 0.8, calm: 0 },
};

export default function init(root) {
  const b = bag();
  const host = root.querySelector('.cx-call__fx');
  const people = [...root.querySelectorAll('.cx-call__person')];
  const name = root.querySelector('[data-speaker]');
  const page = palette(root);
  const ring = accentPalette(page, { min: 1, lift: 0.2 });
  const p = b.add(pauser(root, { label: 'the call preview', into: root.querySelector('.cx-call__status') }));
  const effect = root.dataset.cxEffect || 'gradient-mesh';
  b.add(p.add(mount(host, effect, {
    palette: { ...ring, bg: color.mix(page.accent, page.ink, 0.25) },
    seed: root.dataset.cxSeed,
    params: tuned(PARAMS, effect, { speed: 0.3, calm: 0 }),
  })));

  let i = Math.max(0, people.findIndex(p => p.classList.contains('is-speaking')));
  const place = () => {
    const ava = people[i].querySelector('.cx-call__ava');
    const r = root.getBoundingClientRect(), a = ava.getBoundingClientRect();
    const pad = (host.offsetWidth - a.width) / 2;
    root.style.setProperty('--fx-x', `${(a.left - r.left - pad).toFixed(1)}px`);
    root.style.setProperty('--fx-y', `${(a.top - r.top - pad).toFixed(1)}px`);
  };
  const speak = n => {
    people[i].classList.remove('is-speaking');
    i = n;
    people[i].classList.add('is-speaking');
    name.textContent = people[i].querySelector('.cx-call__name').textContent;
    place();
  };
  // the first placement without a glide
  host.style.transition = 'none';
  place();
  requestAnimationFrame(() => requestAnimationFrame(() => { host.style.transition = ''; }));
  const ro = new ResizeObserver(place);
  ro.observe(root);
  b.add(() => ro.disconnect());
  const order = [0, 2, 1, 0, 3, 2];
  let step = 0;
  b.add(whileVisible(root, { every: 3400, run: () => { step = (step + 1) % order.length; speak(order[step] % people.length); } }));
  return b;
}
