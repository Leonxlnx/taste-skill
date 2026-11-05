/*
  taste-skill components - shared helpers. Every component imports this file and fx.js from
  ../effects/. A component folder holds component.html (the markup), component.css, component.js
  (export default init(root) -> { destroy }) and meta.json.

  Four ways a component puts an effect somewhere other than a background:
    fill(el, id)      the glyphs of el (or its [data-fill] parts) show the effect: type, numbers, icons, logos
    windows(el, ...)  one effect seen only through a few shapes (icon chips, bars, cards): one canvas, many holes
    ring              a host with the class cx-ring shows its effect only in a thin border (padding = width)
    glow              a host with the class cx-glow is blurred into a soft light behind an object
  All of them take their colours from the page palette (fx.readPalette), never a fixed hue.

  Every part whose motion runs on its own for more than about 5 s gets pauser(): a round pause button
  in one corner of the looping visual (WCAG 2.2.2).

  Cost (a laptop's integrated GPU shares its memory with everything else):
    still(el, id)     an effect that does not move is drawn once, kept as a plain picture and its WebGL
                      context freed: it costs no context and no frames at rest. Stills draw one after
                      another, so they never hold more than one context at a time on the whole page.
                      fill(el, id, { still: true }) does the same inside glyphs.
    a page keeps at most 3 live WebGL contexts (moving effects only); everything pauses off screen
    and in a hidden tab (fx.js does this for every mounted effect).
*/
import fx from '../effects/fx.js';

export { fx };
export const color = fx.color;

const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
export const reduced = () => mqReduce.matches;
export const hoverable = () => mqHover.matches;

export const palette = el => fx.readPalette(el);
export const isDark = p => color.isDark(p.bg);
/** a step of ink over the ground, the same mix the CSS does with color-mix(in oklab, ink k, bg) */
export const tone = (p, k) => color.mix(p.bg, p.ink, k);

/** move c's lightness away from `against` until the contrast reaches min */
export function safe(c, against, min = 4.5) {
  let out = c;
  const away = color.isDark(against) ? 0.02 : -0.02;
  for (let i = 0; i < 40 && color.contrast(out, against) < min; i++) out = color.lighten(out, away);
  return out;
}

/**
  The palette for an effect drawn inside glyphs: the opposite ground, so the fill reads as ink.
  On a dark page the letters come out pale with the accent moving in them; on a light page dark.
*/
export function inkPalette(p) {
  return fx.normalizePalette({
    bg: p.ink,
    surface: color.mix(p.ink, p.bg, 0.1),
    ink: p.bg,
    muted: color.mix(p.ink, p.bg, 0.45),
    accent: safe(p.accent, p.bg, 3),
    accentInk: p.accentInk,
  });
}

/**
  The palette for an effect inside an accent-filled control (button, tab, chip): kept close to the
  accent, with the light side checked against the label colour so the label always reads.
*/
export function accentPalette(p, { min = 4.5, lift = 0.1 } = {}) {
  const a = p.accent;
  const label = p.accentInk;
  const towards = color.isDark(label) ? lift : -lift * 0.6;
  const deep = color.adjust(a, { l: -towards * 0.5, c: 1.05 });
  const light = safe(color.adjust(a, { l: towards, c: 1.1 }), label, min);
  return fx.normalizePalette({
    bg: safe(a, label, min),
    surface: safe(deep, label, min),
    ink: label,
    muted: color.mix(a, label, 0.25),
    accent: light,
    accentInk: label,
  });
}

/** mount an effect with a fixed palette; resolves to the fx controller */
export function mount(el, id, { palette: pal, params, seed } = {}) {
  return fx.mount(el, id, { palette: pal || palette(el), params, seed });
}

/* ------------------------------------------------------------------ still */

// stills render one after another: at most one WebGL context is open for them on the whole page
let stillChain = Promise.resolve();
// the stills near the screen that have no picture yet. On a CPU renderer each takes about a second (a new
// context, its shader compiled, one frame), so a screenshot taken a fixed time after a scroll catches
// some blank: <html data-cx-baking="n"> says how many are still to come, and a screenshot script waits
// until it is gone (it is removed at 0)
const pendingStills = new Set();
const markPending = () => {
  const d = document.documentElement.dataset;
  if (pendingStills.size) d.cxBaking = String(pendingStills.size); else delete d.cxBaking;
};
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
const STILL_CSS = {
  position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1',
  pointerEvents: 'none', borderRadius: 'inherit', objectFit: 'cover',
};

/* the next frame the runtime draws into this context, copied into a plain 2D canvas placed first in
   host (null if no frame comes within a second and a half, e.g. the tab was hidden) */
function grab(ctrl, gl, cv, host) {
  return new Promise(resolve => {
    let done = false, timer = 0;
    let nudge = 0;
    const finish = shot => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(nudge);
      delete gl.drawArrays;
      resolve(shot);
    };
    const own = gl.drawArrays;
    gl.drawArrays = function (...a) {
      own.apply(this, a);
      // read back in the same task as the draw, before the browser presents and clears the buffer.
      // The copy is a plain CPU canvas (willReadFrequently): it owns its pixels at once and holds no GPU
      // memory
      const c = document.createElement('canvas');
      c.width = cv.width;
      c.height = cv.height;
      c.className = 'cx-still';
      c.setAttribute('aria-hidden', 'true');
      Object.assign(c.style, STILL_CSS, { imageRendering: cv.style.imageRendering || 'auto' });
      host.insertBefore(c, host.firstChild);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(cv, 0, 0);
      finish(c);
    };
    timer = setTimeout(() => finish(null), 1500);
    ctrl.resume();
    // an effect that holds itself still (a photograph with no drift) draws nothing on resume: set({})
    // asks it for one frame (every effect's controller redraws on set)
    nudge = setTimeout(() => { if (!done) { try { ctrl.set?.({}); } catch (_) { /* no frame: finish(null) */ } } }, 250);
  });
}

/**
  still(el, id, opts): an effect that does not move (speed and drift 0), drawn once and kept as a
  picture. When el first comes into view the effect is mounted paused, one frame is copied into a plain
  2D canvas where the effect canvas was (with any layer the effect adds, such as a grain), and the
  effect and its WebGL context are removed. When el changes size by more than a few percent the picture
  is drawn again (until then it is cropped to fit, never stretched). Without WebGL the effect's own CSS
  fallback stays; an effect drawn on a 2D canvas is simply kept paused. opts: palette, params, seed,
  fade (a short fade-in of the first picture). Returns { el, ready, info, pause(), resume(), destroy() };
  ready resolves once the first picture is in place.
*/
export function still(el, id, { palette: pal, params, seed, fade = true } = {}) {
  // fade: false where the effect hides something of its own that comes back when it is removed (the
  // photograph under duotone-grade), so the picture takes its place at once
  let destroyed = false, pic = null, extras = [], kept = null, size = null, visible = false, queued = false, timer = 0, tries = 0;
  let ready;
  const readyP = new Promise(r => { ready = r; });
  const stale = () => {
    if (!size) return true;
    const w = el.clientWidth, h = el.clientHeight;
    return Math.abs(w - size[0]) > Math.max(2, size[0] * 0.04) || Math.abs(h - size[1]) > Math.max(2, size[1] * 0.04);
  };
  const token = {};
  const pend = () => {
    if (!destroyed && visible && !document.hidden && !pic && !kept && tries <= 3 && el.clientWidth && el.clientHeight) pendingStills.add(token);
    else pendingStills.delete(token);
    markPending();
  };
  const want = () => {
    pend();
    if (destroyed || queued || kept || !visible || document.hidden || !stale() || tries > 3) return;
    queued = true;
    stillChain = stillChain.then(render, render).then(() => { queued = false; want(); });
  };
  const keep = ctrl => { kept = ctrl; ready(); pend(); };

  async function render() {
    if (destroyed || !visible || document.hidden) return;
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    const before = new Set(el.children);
    let ctrl;
    try { ctrl = await fx.mount(el, id, { palette: pal || palette(el), params, seed }); }
    catch (err) { console.warn('still:', err); tries = 9; return; }
    ctrl.pause();
    // the runtime makes its canvas and draws one frame as soon as el is in view
    let cv = null, seenAt = 0;
    for (const t0 = performance.now(); ;) {
      if (destroyed) { ctrl.destroy(); return; }
      if (ctrl.info?.fallback) return keep(ctrl);             // the CSS fallback: no context to free
      const c = [...el.querySelectorAll(':scope > canvas')].find(n => !before.has(n));
      if (c) {
        if (!cv) { cv = c; seenAt = performance.now(); }
        if (cv.style.opacity === '1' || performance.now() - seenAt > 600) break;
      }
      if (performance.now() - t0 > 5000) {                     // never drawn (scrolled away): try again later
        ctrl.destroy();
        if (visible) tries++;
        return;
      }
      await nextFrame();
    }
    // not a context of its own: cv is the canvas fx.mount made above, so this returns the context fx.js already counts in
    // window.__tpGl (its liveGL set: enforceBudget before the mount, released by ctrl.destroy() below); one still at a time
    const gl = cv.getContext('webgl2') || cv.getContext('webgl');
    if (!gl) return keep(ctrl);                               // drawn on a 2D canvas: paused, it costs nothing
    const shot = await grab(ctrl, gl, cv, el);
    if (destroyed) { shot?.remove(); ctrl.destroy(); return; }
    // no frame came (hidden tab, scrolled away, a renderer that never calls drawArrays): on screen the
    // paused effect stays as it is; off screen it goes and the picture is tried again later
    if (!shot) { if (visible && !document.hidden) return keep(ctrl); ctrl.destroy(); return; }
    const added = [...el.children].filter(n => !before.has(n) && n !== cv && n !== shot);
    const copies = added.map(n => { const k = n.cloneNode(true); k.setAttribute('data-cx-still', ''); return k; });
    ctrl.destroy();
    const old = [pic, ...extras];
    shot.after(...copies);
    old.forEach(n => n?.remove());
    if (fade && !pic && !reduced()) shot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
    pic = shot;
    extras = copies;
    size = [w, h];
    ready();
  }

  // the same margin fx.js makes its contexts at, so the picture is ready as el comes into view
  const io = new IntersectionObserver(e => { visible = e[e.length - 1].isIntersecting; want(); }, { rootMargin: '12% 0px' });
  io.observe(el);
  const ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(want, size ? 250 : 0); });
  ro.observe(el);
  document.addEventListener('visibilitychange', want);
  return {
    el,
    still: true,
    ready: readyP,
    pause() {},
    resume() {},
    get info() { return kept ? kept.info : { still: true, webgl: 0, running: false, size: pic ? [pic.width, pic.height] : null }; },
    destroy() {
      destroyed = true;
      pend();
      io.disconnect();
      ro.disconnect();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', want);
      kept?.destroy();
      kept = null;
      [pic, ...extras].forEach(n => n?.remove());
      pic = null;
      extras = [];
    },
  };
}

/* ------------------------------------------------------------------ fill */

/**
  fill(el, id, opts): the glyphs of el show the effect. Mark the parts with data-fill (text, an
  icon drawn in currentColor, a .cx-glyph mask icon) or data-fill="box" (the element's whole box,
  its border-radius kept); with no mark, all of el's text is filled. opts.still: the effect does not
  move, so it is drawn once and kept as a picture (see still()).

  How: one effect canvas sits in an overlay placed NEXT TO el (its next sibling, positioned over
  el's box), never inside it, so el's own text and HTML stay clean: a <ul> holds only <li>, a <dl>
  only its groups, and an <h1> reads once. The overlay holds a copy of el's content that paints the
  filled parts white and the rest black (or the reverse) and blends with the canvas; the overlay
  blends with the page (screen on a dark ground, multiply on a light one), so outside the glyphs the
  page shows unchanged. The copy of a heading or paragraph is a <div> with the same classes and
  computed type, so the page keeps one h1. The overlay is aria-hidden, inert and data-nosnippet.
  Before the script runs, and in forced colours, the text keeps its own colour. el needs a parent
  element and no border (its padding is fine).
*/
const TYPE_PROPS = ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'line-height', 'letter-spacing',
  'word-spacing', 'text-align', 'text-transform', 'text-indent', 'font-feature-settings', 'font-variation-settings',
  'font-variant-numeric', 'font-kerning', 'text-wrap-mode', 'text-wrap-style', 'white-space-collapse', 'padding'];
function knockOf(el) {
  let copy;
  if (/^(H[1-6]|P)$/.test(el.tagName)) {
    copy = document.createElement('div');
    for (const a of el.attributes) if (a.name !== 'id') copy.setAttribute(a.name, a.value);
    copy.append(...[...el.childNodes].map(n => n.cloneNode(true)));
    const cs = getComputedStyle(el);
    for (const p of TYPE_PROPS) copy.style.setProperty(p, cs.getPropertyValue(p));
  } else {
    copy = el.cloneNode(true);
    copy.removeAttribute('id');
  }
  copy.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  copy.querySelectorAll('.cx-fill').forEach(n => n.remove());
  return copy;
}

export async function fill(el, id, { seed, params, palette: pal, page, keep = false, still: isStill = false } = {}) {
  page = page || palette(el);
  const parent = el.parentElement;
  if (!parent) return { el: null, ctrl: null, destroy() {} };
  const dark = isDark(page);
  const whole = !el.querySelector('[data-fill]');
  // keep: the glyphs keep their own colour and the effect is laid over them (a passing light)
  const filled = keep ? ['cx-overlaid'] : whole ? ['cx-filled', 'cx-filled--all'] : ['cx-filled'];
  const over = document.createElement('div');
  over.className = `cx-fill ${dark ? 'cx-fill--screen' : 'cx-fill--multiply'}`;
  over.setAttribute('aria-hidden', 'true');
  over.setAttribute('data-nosnippet', '');
  over.inert = true;
  const knock = knockOf(el);
  knock.classList.add('cx-knock');
  if (whole) knock.classList.add('cx-knock--all');
  over.append(knock);
  const movedParent = getComputedStyle(parent).position === 'static';
  if (movedParent) parent.style.position = 'relative';
  // the overlay covers el's border box, measured from the parent's padding box
  const place = () => {
    const pr = parent.getBoundingClientRect(), r = el.getBoundingClientRect(), s = over.style;
    s.left = `${(r.left - pr.left - parent.clientLeft + parent.scrollLeft).toFixed(2)}px`;
    s.top = `${(r.top - pr.top - parent.clientTop + parent.scrollTop).toFixed(2)}px`;
    s.width = `${r.width.toFixed(2)}px`;
    s.height = `${r.height.toFixed(2)}px`;
    s.borderRadius = getComputedStyle(el).borderRadius;
  };
  el.classList.add(...filled);
  el.after(over);
  place();
  const ro = new ResizeObserver(place);
  ro.observe(el);
  ro.observe(parent);
  addEventListener('resize', place);
  document.fonts?.ready.then(place);
  const undo = () => {
    ro.disconnect();
    removeEventListener('resize', place);
    over.remove();
    el.classList.remove(...filled);
    if (movedParent) parent.style.position = '';
  };
  let ctrl = null;
  try {
    // a fill that does not move is drawn once and kept as a picture (no context, no frames at rest)
    ctrl = isStill
      ? still(over, id, { palette: pal || inkPalette(page), params, seed })
      : await fx.mount(over, id, { palette: pal || inkPalette(page), params, seed });
  } catch (err) {
    console.warn('fill:', err);
    undo();
    return { el: over, ctrl: null, destroy() {} };
  }
  return {
    el: over,
    ctrl,
    ready: ctrl?.ready || Promise.resolve(),
    pause: () => ctrl?.pause(),
    resume: () => ctrl?.resume(),
    destroy() {
      ctrl?.destroy();
      undo();
    },
  };
}

/* ------------------------------------------------------------------ windows */

const svgURL = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
/** a rounded rectangle as a mask image, w x h CSS px */
export function roundRect(w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`);
}

/**
  a rounded rectangle that fades out from one corner: opaque at (cx, cy) (0..1 of the box), clear at
  `reach` of the box diagonal. Used to keep an effect to the empty corner of a card, away from its text.
*/
export function roundRectFade(w, h, r, { cx = 1, cy = 0, reach = 0.7, peak = 1 } = {}) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const d = Math.hypot(w, h) * reach;
  return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><radialGradient id="f" gradientUnits="userSpaceOnUse" cx="${(cx * w).toFixed(1)}" cy="${(cy * h).toFixed(1)}" r="${d.toFixed(1)}"><stop offset="0" stop-color="#fff" stop-opacity="${peak}"/><stop offset=".55" stop-color="#fff" stop-opacity="${(peak * 0.45).toFixed(3)}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="url(#f)"/></svg>`);
}

/**
  windows(host, targets, opts): host (an effect element over the group) is masked to the boxes of
  targets, each with its own border-radius, so one canvas shows through many shapes. `extra` adds
  mask layers on top (CSS images) that intersect the union, e.g. a moving band or a spotlight.
  `shape(w, h, r)` replaces the plain rounded box (e.g. roundRectFade). Rebuilt when anything
  resizes; returns { update, destroy }.
*/
export function windows(host, targets, { extra = () => [], radius, shape = roundRect } = {}) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const hr = host.getBoundingClientRect();
    const layers = [], sizes = [], pos = [], comp = [];
    for (const extraLayer of extra()) {
      layers.push(extraLayer.image);
      sizes.push(extraLayer.size || '100% 100%');
      pos.push(extraLayer.position || '0 0');
      comp.push('intersect');
    }
    const list = typeof targets === 'function' ? targets() : targets;
    list.forEach(t => {
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const w = Math.round(r.width * 100) / 100, h = Math.round(r.height * 100) / 100;
      const rad = radius != null ? radius : parseFloat(getComputedStyle(t).borderTopLeftRadius) || 0;
      layers.push(shape(w, h, rad));
      sizes.push(`${w}px ${h}px`);
      pos.push(`${(r.left - hr.left).toFixed(2)}px ${(r.top - hr.top).toFixed(2)}px`);
      comp.push('add');
    });
    const s = host.style;
    s.maskImage = s.webkitMaskImage = layers.join(', ') || 'none';
    s.maskSize = s.webkitMaskSize = sizes.join(', ');
    s.maskPosition = s.webkitMaskPosition = pos.join(', ');
    s.maskRepeat = s.webkitMaskRepeat = 'no-repeat';
    s.maskComposite = comp.join(', ');
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
  const ro = new ResizeObserver(queue);
  ro.observe(host);
  (typeof targets === 'function' ? targets() : targets).forEach(t => ro.observe(t));
  update();
  return { update: queue, now: update, destroy() { ro.disconnect(); cancelAnimationFrame(raf); } };
}

/* ------------------------------------------------------------------ small things */

/** run fn on the next frames while the condition holds (pointer smoothing and the like) */
export function smoother(step) {
  let raf = 0, last = 0;
  const tick = ts => {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
    last = ts;
    raf = step(dt) ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  };
  return {
    kick() { if (!raf) raf = requestAnimationFrame(tick); },
    stop() { cancelAnimationFrame(raf); raf = 0; last = 0; },
  };
}

/** true while el sits inside a part whose pause button is pressed */
export const held = el => !!el.closest('.cx-paused');

/** a timer that only runs while el is on screen, the tab is visible, motion is allowed and no pause button holds it */
export function whileVisible(el, { every, run, still }) {
  let timer = 0, onScreen = false;
  const go = () => {
    clearInterval(timer);
    timer = 0;
    if (onScreen && !document.hidden && !reduced() && !held(el)) timer = setInterval(run, every);
    else if (reduced() && still) still();
  };
  const io = new IntersectionObserver(e => { onScreen = e[e.length - 1].isIntersecting; go(); });
  io.observe(el);
  document.addEventListener('visibilitychange', go);
  document.addEventListener('cx-pause', go);
  mqReduce.addEventListener?.('change', go);
  return {
    destroy() {
      clearInterval(timer);
      io.disconnect();
      document.removeEventListener('visibilitychange', go);
      document.removeEventListener('cx-pause', go);
      mqReduce.removeEventListener?.('change', go);
    },
  };
}

/* ------------------------------------------------------------------ pause */

const PAUSE_ICON = '<svg class="cx-pause__off" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="4" y="3" width="2.6" height="10" rx="1"/><rect x="9.4" y="3" width="2.6" height="10" rx="1"/></svg>';
const PLAY_ICON = '<svg class="cx-pause__on" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 3.2v9.6a.8.8 0 0 0 1.2.7l7.6-4.8a.8.8 0 0 0 0-1.4L6.2 2.5A.8.8 0 0 0 5 3.2Z"/></svg>';

/**
  pauser(host, opts): a round pause button for a looping visual, as every loop that runs on its own
  for more than about 5 s needs one (WCAG 2.2.2). It sits in a corner (`corner`: br, bl, tr, tl) of
  `at` (host by default, e.g. the panel that loops inside a card) or, with `into`, at the end of a row
  of the part's own UI. Pressing it adds .cx-paused to host (CSS animations inside stop), pauses
  every effect controller given to add(), and holds every whileVisible() timer inside host;
  components with their own frame loop check held(el). Under reduced motion the loops already hold
  one state, so the button is not shown. Returns { el, add(ctrl | promise), paused(), destroy() }.
*/
export function pauser(host, { label = 'animation', corner = 'br', at = host, into = null } = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = into ? 'cx-pause cx-pause--inline' : `cx-pause cx-pause--${corner}`;
  btn.innerHTML = PAUSE_ICON + PLAY_ICON;
  const ctrls = new Set();
  let paused = false;
  const set = v => {
    paused = v;
    host.classList.toggle('cx-paused', v);
    btn.classList.toggle('is-paused', v);
    btn.setAttribute('aria-label', `${v ? 'Play' : 'Pause'} ${label}`);
    btn.title = `${v ? 'Play' : 'Pause'} ${label}`;
    ctrls.forEach(c => { try { v ? c.pause?.() : c.resume?.(); } catch (_) {} });
    // a CSS transition in flight (a pointer gliding) stops where it is, then carries on
    if (typeof CSSTransition === 'function') {
      for (const a of host.getAnimations?.({ subtree: true }) || []) if (a instanceof CSSTransition) v ? a.pause() : a.play();
    }
    host.dispatchEvent(new CustomEvent('cx-pause', { bubbles: true, detail: { paused: v } }));
  };
  set(false);
  const click = () => set(!paused);
  btn.addEventListener('click', click);
  const movedAt = !into && getComputedStyle(at).position === 'static';
  if (movedAt) at.style.position = 'relative';
  (into || at).append(btn);
  const api = {
    el: btn,
    add(c) {
      if (!c) return c;
      if (typeof c.then === 'function') { c.then(v => api.add(v), () => {}); return c; }
      ctrls.add(c);
      if (paused) c.pause?.();
      return c;
    },
    paused: () => paused,
    destroy() {
      btn.removeEventListener('click', click);
      btn.remove();
      host.classList.remove('cx-paused');
      if (movedAt) at.style.position = '';
      ctrls.clear();
    },
  };
  return api;
}

/** collect destroy functions */
export function bag() {
  const fns = [];
  let done = false;
  const kill = x => (typeof x === 'function' ? x() : x?.destroy?.());
  const api = {
    /** a destroy function, an object with destroy(), or a promise of either */
    add(x) {
      if (!x) return x;
      if (typeof x.then === 'function') {
        x.then(v => (done ? kill(v) : api.add(v)), () => {});
        return x;
      }
      if (done) kill(x); else fns.push(() => kill(x));
      return x;
    },
    destroy() {
      done = true;
      while (fns.length) { try { fns.pop()(); } catch (e) { console.warn(e); } }
    },
  };
  return api;
}

/**
  tuned(table, id): the params a part has tuned for effect id, a copy. Every part that takes several
  effects keeps one entry per effect and passes only that one: one effect's numbers mean something else
  to another (contour-lines' opacity and calm left dot-terrain almost blank on the map). An effect with
  no entry gets `base` only, so its own defaults hold.
*/
export function tuned(table, id, base = { calm: 0 }) { return { ...(table[id] || base) }; }

/** data-cx-params='{"speed":0.2}' on an element, parsed */
export function paramsOf(el) {
  try { return el.dataset.cxParams ? JSON.parse(el.dataset.cxParams) : undefined; } catch (_) { return undefined; }
}

export default { fx, color, reduced, hoverable, palette, isDark, tone, safe, inkPalette, accentPalette, mount, still, fill, windows, tuned, roundRect, roundRectFade, smoother, whileVisible, held, pauser, bag, paramsOf };
