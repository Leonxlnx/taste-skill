// fx-search: the glow is an effect host behind the field, blurred into ambient light; it fades in and
// runs only while the field has focus. At rest it holds no WebGL context: the effect is mounted on the
// first focus and removed (its context freed) a few seconds after the field loses focus. The
// suggestions filter as you type and work with the keyboard.
import { mount, palette, color, bag, tuned } from '../shared.js';

// each effect this part takes, tuned on its own: one effect's params mean something else to another
const PARAMS = {
  'aurora-curtains': { speed: 0.12, bands: 3, height: 0.8, intensity: 1.6, stars: 0, calm: 0 },
  'grain-gradient': { speed: 0.12, calm: 0 },
  'gradient-mesh': { speed: 0.12, lines: 0, warp: 0.7, softness: 0.55, tint: 1, calm: 0 },
  'soft-light-bars': { speed: 0.4, softness: 0.7, glow: 1, haze: 0.5, stipple: 0.2, grain: 0.3, calm: 0 },
};

export default function init(root) {
  const b = bag();
  const glow = root.querySelector('.cx-search__glow');
  const input = root.querySelector('.cx-search__input');
  const list = root.querySelector('.cx-search__list');
  const empty = root.querySelector('.cx-search__empty');
  const items = [...list.querySelectorAll('[role="option"]')];
  const page = palette(root);
  let ctrl = null, pending = null, dead = false, timer = 0, freeT = 0, active = -1;
  const ensure = () => {
    if (ctrl || pending) return;
    const effect = root.dataset.cxEffect || (color.isDark(page.bg) ? 'aurora-curtains' : 'grain-gradient');
    pending = mount(glow, effect, {
      // the effect's own ground is already an accent tint, so the blurred light reaches all round the field
      palette: { ...page, bg: color.mix(page.bg, page.accent, color.isDark(page.bg) ? 0.38 : 0.3), accent: color.isDark(page.bg) ? page.accent : color.saturate(page.accent, 1.1) },
      seed: root.dataset.cxSeed,
      params: tuned(PARAMS, effect, { speed: 0.12, calm: 0 }),
    }).then(c => {
      pending = null;
      if (dead) { c.destroy(); return; }
      ctrl = c;
      if (!root.classList.contains('is-focus')) c.pause();
    }, err => { pending = null; console.warn('fx-search:', err); });
  };
  const free = () => { ctrl?.destroy(); ctrl = null; };
  b.add(() => { dead = true; clearTimeout(freeT); free(); });

  const visible = () => items.filter(li => !li.hidden);
  const select = n => {
    const v = visible();
    items.forEach(li => li.setAttribute('aria-selected', 'false'));
    if (!v.length) { active = -1; input.removeAttribute('aria-activedescendant'); return; }
    active = (n + v.length) % v.length;
    v[active].setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', v[active].id);
  };
  const open = yes => {
    const v = visible();
    list.hidden = !yes || !v.length;
    empty.hidden = !yes || !!v.length;
    input.setAttribute('aria-expanded', String(yes && !!v.length));
  };
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    items.forEach(li => { li.hidden = !!q && !li.textContent.toLowerCase().includes(q); });
    select(0);
    open(true);
  };
  const focus = () => { clearTimeout(timer); clearTimeout(freeT); root.classList.add('is-focus'); ensure(); ctrl?.resume(); filter(); };
  const blur = () => {
    root.classList.remove('is-focus');
    open(false);
    timer = setTimeout(() => ctrl?.pause(), 700);
    freeT = setTimeout(free, 4000);
  };
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); input.value = visible()[active].lastChild.textContent.trim(); filter(); }
    else if (e.key === 'Escape') { input.value = ''; input.blur(); }
  };
  const pick = e => {
    const li = e.target.closest('[role="option"]');
    if (!li) return;
    e.preventDefault();
    input.value = li.lastChild.textContent.trim();
    filter();
  };
  // "/" focuses the field from anywhere on the page (the kbd hint shows it)
  const slash = e => {
    if (e.key !== '/' || e.defaultPrevented || /input|textarea|select/i.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    e.preventDefault();
    input.focus();
  };
  input.addEventListener('focus', focus);
  input.addEventListener('blur', blur);
  input.addEventListener('input', filter);
  input.addEventListener('keydown', key);
  list.addEventListener('mousedown', pick);
  document.addEventListener('keydown', slash);
  b.add(() => {
    clearTimeout(timer);
    input.removeEventListener('focus', focus); input.removeEventListener('blur', blur);
    input.removeEventListener('input', filter); input.removeEventListener('keydown', key);
    list.removeEventListener('mousedown', pick); document.removeEventListener('keydown', slash);
  });
  return b;
}
