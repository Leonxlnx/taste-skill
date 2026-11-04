// integrations: one cycle (about 3.4 s): the pointer clicks Connect on one app, it spins, then shows
// Connected; it holds, then starts again. The count keeps the page's words: only its figure follows.
import { loop, POINTER_SVG } from '../ui.js';

export default function init(root) {
  const row = root.querySelector('[data-apps-target]') || root.querySelector('.ui-app:not(.is-on)');
  if (!row) return null;
  const btn = row.querySelector('.ui-app__connect');
  if (!btn) return null;
  const count = root.querySelector('[data-apps-count]');
  const count0 = count ? count.textContent : '';
  const total = () => root.querySelectorAll('.ui-app.is-on').length;
  const tally = () => { if (count) count.textContent = count0.replace(/\d+/, String(total())); };
  const pointer = document.createElement('span');
  pointer.className = 'ui-pointer';
  pointer.innerHTML = POINTER_SVG;
  pointer.style.opacity = '0';
  root.appendChild(pointer);
  const at = (x, y, instant) => {
    if (instant) pointer.style.transition = 'none';
    pointer.style.transform = `translate(${x}px, ${y}px)`;
    if (instant) { pointer.getBoundingClientRect(); pointer.style.transition = ''; }
  };
  const target = () => {
    const r = root.getBoundingClientRect(), b = btn.getBoundingClientRect();
    return [b.left - r.left + b.width * 0.55, b.top - r.top + b.height * 0.6];
  };
  return loop(root, async api => {
    row.classList.remove('is-on', 'is-busy');
    tally();
    const [tx, ty] = target();
    pointer.style.opacity = '0';
    at(tx - 130, ty + 70, true);
    await api.wait(300);
    pointer.style.opacity = '1';
    at(tx, ty);
    await api.wait(900);
    btn.classList.add('is-pressed');
    await api.wait(140);
    btn.classList.remove('is-pressed');
    row.classList.add('is-busy');
    await api.wait(760);
    row.classList.remove('is-busy');
    row.classList.add('is-on');
    tally();
    await api.wait(260);
    at(tx + 40, ty + 60);
    pointer.style.opacity = '0';
    await api.wait(400);
  }, { still: () => { pointer.style.opacity = '0'; row.classList.remove('is-busy'); row.classList.add('is-on'); tally(); } });
}
