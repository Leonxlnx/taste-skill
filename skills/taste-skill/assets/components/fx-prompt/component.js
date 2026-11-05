// fx-prompt: edge-glow draws the prompt card itself, with one light lapping its border about every 12 s;
// a pause button at the end of the examples row holds it
import { mount, palette, bag, tone, pauser } from '../shared.js';

export default function init(root) {
  const b = bag();
  const box = root.querySelector('.cx-prompt__box');
  const input = root.querySelector('.cx-prompt__input');
  const page = palette(root);
  const inset = parseFloat(getComputedStyle(root).getPropertyValue('--inset')) || 20;
  const radius = parseFloat(getComputedStyle(root).getPropertyValue('--r-lg')) || 16;
  const p = b.add(pauser(root, { label: 'the light around the field' }));
  b.add(p.add(mount(box, 'edge-glow', {
    palette: { ...page, surface: tone(page, 0.035) },
    seed: root.dataset.cxSeed,
    params: { inset, radius, width: 1.2, glow: 22, bloom: 0.55, segment: 0.38, speed: 110, idle: 0.32, wash: 0.4, fill: 1 },
  })));
  root.querySelectorAll('.cx-prompt__hints button').forEach(h => {
    const f = () => { input.value = h.textContent; input.focus(); };
    h.addEventListener('click', f);
    b.add(() => h.removeEventListener('click', f));
  });
  return b;
}
