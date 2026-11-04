// fx-button: an effect fades into the button's fill or border on hover and focus, and runs only then.
// At rest a button holds no WebGL context: the effect is mounted on the first hover or focus, paused
// half a second after the pointer leaves and removed (its context freed) a few seconds later.
import { mount, palette, accentPalette, bag, paramsOf, color } from '../shared.js';

// the fill is even across the button: low contrast, no blobs that settle at one end, a fine grain that
// moves while it is pointed at (the button's own params can override)
const FILL = { speed: 0.35, tint: 0.22, contrast: 0.1, grain: 0.3, softness: 1, scatter: 0, warp: 0.15, grainMotion: 1, calm: 0 };

export default function init(root) {
  const b = bag();
  root.querySelectorAll('[data-cx-btn]').forEach(btn => {
    const host = btn.querySelector('.cx-fxbtn__fx');
    const page = palette(btn);
    const edge = btn.classList.contains('cx-fxbtn--edge');
    // the fill is one even step off the accent (lighter under a dark label, deeper under a light one;
    // the label keeps 4.5:1) with a fine grain; the edge is drawn brighter than the ground so it reads
    // as light
    const ap = accentPalette(page, { lift: 0.07 });
    const pal = edge
      ? { ...accentPalette(page, { min: 1, lift: 0.14 }), bg: color.mix(page.accent, page.bg, 0.15) }
      : { ...ap, bg: ap.accent };
    const params = edge ? paramsOf(btn) : { ...FILL, ...(paramsOf(btn) || {}) };
    let ctrl = null, pending = null, dead = false, pauseT = 0, freeT = 0;
    const lit = () => btn.classList.contains('is-lit');
    const ensure = () => {
      if (ctrl || pending) return;
      pending = mount(host, btn.dataset.cxBtn, { palette: pal, seed: btn.dataset.cxSeed, params })
        .then(c => {
          pending = null;
          if (dead) { c.destroy(); return; }
          ctrl = c;
          if (!lit()) c.pause();
        }, err => { pending = null; console.warn('fx-button:', err); });
    };
    const free = () => { ctrl?.destroy(); ctrl = null; };
    const on = () => {
      clearTimeout(pauseT);
      clearTimeout(freeT);
      btn.classList.add('is-lit');
      ensure();
      ctrl?.resume();
    };
    const off = () => {
      if (btn.matches(':hover') || btn.matches(':focus-visible')) return;
      btn.classList.remove('is-lit');
      clearTimeout(pauseT);
      clearTimeout(freeT);
      pauseT = setTimeout(() => ctrl?.pause(), 500);
      freeT = setTimeout(free, 4000);
    };
    const focus = () => { if (btn.matches(':focus-visible')) on(); };
    btn.addEventListener('pointerenter', on);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('focus', focus);
    btn.addEventListener('blur', off);
    b.add(() => {
      dead = true;
      clearTimeout(pauseT);
      clearTimeout(freeT);
      free();
      btn.classList.remove('is-lit');
      btn.removeEventListener('pointerenter', on);
      btn.removeEventListener('pointerleave', off);
      btn.removeEventListener('focus', focus);
      btn.removeEventListener('blur', off);
    });
  });
  return b;
}
