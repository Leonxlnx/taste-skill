// fx-spotlight: one effect canvas over the card row, a fine dot ruling at a few percent of the ink. Each
// card shows it only in its empty top-right corner (a mask that fades out long before the icon and the
// text), faintly at rest; a small soft light under the pointer brings that corner up. Without a fine
// pointer (touch) the corner simply rests at its faint level. The ruling is still: drawn once and kept
// as a picture (no WebGL context at rest); only the CSS mask follows the pointer.
import { still, palette, tone, color, windows, roundRectFade, smoother, hoverable, reduced, bag } from '../shared.js';

export default function init(root) {
  const b = bag();
  const host = root.querySelector('.cx-spot__fx');
  const cards = [...root.querySelectorAll('.cx-spot__card')];
  const page = palette(root);
  const live = hoverable();
  // each card: the ruling only in its far corner, gone by about two thirds of the way to the text
  const shape = (w, h, r) => roundRectFade(w, h, r, { cx: 1, cy: 0, reach: 0.62, peak: 1 });
  // the pointer light: small and soft; at rest the corner keeps a third of its strength
  const spot = 'radial-gradient(circle max(1px, var(--cx-spot-r)) at var(--mx) var(--my), #000 0%, rgb(0 0 0 / .6) 45%, rgb(0 0 0 / var(--rest, .34)) 100%)';
  const rest = 'linear-gradient(rgb(0 0 0 / .34), rgb(0 0 0 / .34))';
  b.add(windows(host, cards, { shape, extra: () => [{ image: live ? spot : rest }] }));

  // the whole card opens its link, unless the visitor is selecting text
  const click = e => {
    const card = e.target.closest('.cx-spot__card');
    if (!card || e.target.closest('a') || String(getSelection())) return;
    card.querySelector('.cx-spot__link')?.click();
  };
  root.addEventListener('click', click);
  b.add(() => root.removeEventListener('click', click));

  const card = tone(page, 0.035);
  const effect = root.dataset.cxEffect || 'ruled-grounds';
  const PARAMS = {
    'ruled-grounds': { cell: 14, major: 4, ink: 0.5, focus: 0, speed: 0, reach: 1, grain: 0, calm: 0 },
    'contour-lines': { levels: 18, scale: 1.4, lineWidth: 1, indexEvery: 0, opacity: 0.4, speed: 0, tint: 0, shade: 0, edge: 0, calm: 0 },
  };
  b.add(still(host, effect, {
    // the ground is the card itself; the marks are a quiet step of the ink
    palette: { ...page, bg: card, surface: card, ink: color.mix(card, page.ink, 0.42), accent: color.mix(card, page.accent, 0.5) },
    seed: root.dataset.cxSeed,
    params: PARAMS[effect] || { speed: 0, calm: 0 },
  }));
  if (!live) return b;

  // the light trails the pointer a little (or jumps there under reduced motion)
  const cur = [0, 0], target = [0, 0];
  let first = true;
  const sm = smoother(dt => {
    const k = reduced() ? 1 : 1 - Math.exp(-dt * 10);
    cur[0] += (target[0] - cur[0]) * k;
    cur[1] += (target[1] - cur[1]) * k;
    root.style.setProperty('--mx', `${cur[0].toFixed(1)}px`);
    root.style.setProperty('--my', `${cur[1].toFixed(1)}px`);
    return Math.abs(target[0] - cur[0]) + Math.abs(target[1] - cur[1]) > 0.3;
  });
  const at = (x, y) => {
    const r = root.getBoundingClientRect();
    target[0] = x - r.left; target[1] = y - r.top;
    if (first) { cur[0] = target[0]; cur[1] = target[1]; first = false; }
    sm.kick();
  };
  const on = () => root.classList.add('is-on');
  const off = () => { root.classList.remove('is-on'); first = true; };
  const move = e => { if (e.target.closest('.cx-spot__card')) { on(); at(e.clientX, e.clientY); } else off(); };
  const focus = e => {
    const c = e.target.closest('.cx-spot__card');
    if (!c) return;
    const r = c.getBoundingClientRect();
    on(); first = true; at(r.right - r.width * 0.18, r.top + r.height * 0.2);
  };
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', off);
  root.addEventListener('focusin', focus);
  root.addEventListener('focusout', off);
  b.add(() => {
    sm.stop();
    root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', off);
    root.removeEventListener('focusin', focus); root.removeEventListener('focusout', off);
  });
  return b;
}
