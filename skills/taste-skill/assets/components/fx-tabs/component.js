// fx-tabs: the indicator pill is the effect host; it glides to the chosen tab. The effect is a still,
// low-contrast grain in the accent (no motion, no sheen), so the pill reads as a flat accent with a
// printed texture and the label stays clear. Being still, it is drawn once and kept as a picture (no
// WebGL context at rest). Full keyboard support (arrows, Home, End) with roving
// tabindex, as the ARIA tabs pattern asks.
import { still, palette, accentPalette, bag } from '../shared.js';

export default function init(root) {
  const b = bag();
  const bar = root.querySelector('[role="tablist"]');
  const ind = root.querySelector('.cx-tabs__ind');
  const tabs = [...bar.querySelectorAll('[role="tab"]')];
  const page = palette(root);
  const effect = root.dataset.cxEffect || 'grain-gradient';
  // 'flat' mounts nothing: the pill keeps its plain accent fill
  if (effect !== 'flat') {
    b.add(still(ind, effect, {
      palette: accentPalette(page, { lift: 0.05 }),
      seed: root.dataset.cxSeed,
      params: { speed: 0, grainMotion: 0, grain: 0.32, contrast: 0.18, tint: 0.4, softness: 0.8, warp: 0.3, calm: 0 },
    }));
  }

  const place = (tab, animate = true) => {
    if (!animate) ind.style.transition = 'none';
    ind.style.setProperty('--x', `${tab.offsetLeft}px`);
    ind.style.setProperty('--w', `${tab.offsetWidth}px`);
    if (!animate) requestAnimationFrame(() => { ind.style.transition = ''; });
  };
  const choose = (tab, focus = true) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = root.querySelector('#' + t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    place(tab);
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  const click = e => { const t = e.target.closest('[role="tab"]'); if (t) choose(t, false); };
  const key = e => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (n == null) return;
    e.preventDefault();
    choose(tabs[(n + tabs.length) % tabs.length]);
  };
  bar.addEventListener('click', click);
  bar.addEventListener('keydown', key);
  // the faded far edge shows only while there is more bar to scroll to
  const scroller = root.querySelector('.cx-tabs__scroll');
  const edge = () => scroller.classList.toggle('is-end', scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2);
  scroller.addEventListener('scroll', edge, { passive: true });
  const current = () => tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  place(current(), false);
  const ro = new ResizeObserver(() => { place(current(), false); edge(); });
  ro.observe(bar);
  ro.observe(scroller);
  document.fonts?.ready.then(() => { place(current(), false); edge(); });
  edge();
  b.add(() => { ro.disconnect(); bar.removeEventListener('click', click); bar.removeEventListener('keydown', key); scroller.removeEventListener('scroll', edge); });
  return b;
}
