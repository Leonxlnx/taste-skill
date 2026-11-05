// cursor: one cycle (about 3.4 s): the pointer glides in, clicks the main button (a ring, a press), a
// short spin, then done; it drifts off and the dialog rests on its finished picture (the done state).
// The words for the busy and done states are the page's own, written beside the text they replace:
// data-busy and data-done on the button, data-done on the state chip and on the line under the item
// (or opts.busy, opts.done, opts.state, opts.sub). Without them a text stays as written.
import { loop, POINTER_SVG } from '../ui.js';

export default function init(root, opts = {}) {
  const btn = root.querySelector('[data-cur-btn]'), label = root.querySelector('[data-cur-label]');
  if (!btn) return null;
  const state = root.querySelector('[data-cur-state]'), sub = root.querySelector('[data-cur-sub]');
  const two = (el, a, b) => {
    const idle = el ? el.textContent : '';
    return { idle, busy: a != null ? a : idle, done: b != null ? b : idle };
  };
  const words = {
    label: two(label, opts.busy ?? btn.dataset.busy, opts.done ?? btn.dataset.done),
    state: two(state, null, opts.state ?? state?.dataset.done),
    sub: two(sub, null, opts.sub ?? sub?.dataset.done),
  };
  const text = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };
  const pointer = document.createElement('span');
  pointer.className = 'ui-pointer';
  pointer.innerHTML = POINTER_SVG;
  pointer.style.opacity = '0';
  const ring = document.createElement('span');
  ring.className = 'ui-ring';
  root.append(ring, pointer);
  const at = (x, y, instant) => {
    if (instant) pointer.style.transition = 'none';
    pointer.style.transform = `translate(${x}px, ${y}px)`;
    if (instant) { pointer.getBoundingClientRect(); pointer.style.transition = ''; }
  };
  const target = () => {
    const r = root.getBoundingClientRect(), b = btn.getBoundingClientRect();
    return [b.left - r.left + b.width * 0.5, b.top - r.top + b.height * 0.55];
  };
  function reset() {
    root.classList.remove('is-live');
    btn.classList.remove('is-busy', 'is-done');
    text(label, words.label.idle); text(state, words.state.idle); text(sub, words.sub.idle);
  }
  function done() {
    btn.classList.remove('is-busy');
    btn.classList.add('is-done');
    text(label, words.label.done); text(state, words.state.done); text(sub, words.sub.done);
    root.classList.add('is-live');
  }
  return loop(root, async api => {
    reset();
    const [tx, ty] = target();
    pointer.style.opacity = '0';
    at(tx - 150, ty + 80, true);
    await api.wait(300);
    pointer.style.opacity = '1';
    at(tx - 4, ty - 2);
    await api.wait(1000);
    pointer.classList.add('is-down');
    btn.classList.add('is-pressed');
    ring.style.setProperty('--at', `translate(${tx - 4}px, ${ty - 2}px)`);
    ring.classList.remove('is-on'); void ring.offsetWidth; ring.classList.add('is-on');
    await api.wait(140);
    pointer.classList.remove('is-down');
    btn.classList.remove('is-pressed');
    btn.classList.add('is-busy');
    text(label, words.label.busy);
    await api.wait(620);
    done();
    await api.wait(300);
    at(tx + 50, ty + 80);
    pointer.style.opacity = '0';
    await api.wait(400);
  }, { still: () => { pointer.style.opacity = '0'; pointer.classList.remove('is-down'); done(); } });
}
