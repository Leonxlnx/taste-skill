/*
  ui.js - the taste-skill UI fragment kit. One ES module, no dependencies.

  A fragment is a folder next to this file: <name>/fragment.html, fragment.css, meta.json and,
  when it moves, fragment.js (export default function (root, opts) -> { destroy() }).

  Load into a placeholder (the HTML, both stylesheets and the script are fetched once):
    <div data-ui-load="calendar"></div>
    import ui from './assets/ui/ui.js'; ui.loadAll(document);
  Stylesheets: ui.js links base.css and each fragment's CSS from script, so with scripts off (or before it
  runs) a fragment would be unstyled and leave an empty ground. A page therefore links assets/ui/base.css and
  assets/ui/<name>/fragment.css for every fragment it uses in its own <head> (starter.html does); link() here
  skips a stylesheet that is already present, so nothing loads twice.
  Or paste fragment.html into the page, edit its text to the client's content, then
  ui.startAll(document): it links base.css and the fragment's CSS and reads data-ui-opts on the root.

  The fragment takes its colours from the custom properties around it:
    --fx-bg --fx-surface --fx-ink --fx-muted --fx-accent --fx-accent-ink, and --ui-font --ui-mono --ui-radius.

  Motion: one rule, the same as system.js. Put data-ui-loop on the group's one loop (the fragment,
  its placeholder or an element around it); every other fragment holds its finished picture.
  - With system.js the page needs nothing else: it marks every other fragment data-ui-still before
    it loads (and on a phone, under 640px, on kind other and on a place, every fragment).
  - Without system.js (cards.html), ui.loadAll / ui.startAll do the same as soon as the page holds
    any data-ui-loop. A page with none (the kit's index.html) lets every fragment loop.
  - data-ui-still on the placeholder (or any ancestor) holds a fragment by hand, from the moment its
    own load resolves. voice is held like the rest (its orb holds one frame).
  - data-ui-cycles="2" plays that many cycles when first seen, then rests on the finished picture.
  - One cycle is 2.5 to 4 s and repeats while on screen, 0.6 s after the fragment first shows. The
    pointer entering its card restarts it from the top; a held fragment plays while the pointer is on
    its card. ui.restart(el) restarts every fragment in el (a tab shown again).
  - A loop runs while on screen and gets a pause button (a solid 32px disc) when it starts to move:
    in a .card beside the card's title (never over the panel, which a cropped fragment fills to its
    corners); in [data-ui-pause-host], or a .panel/.frame outside a card, 12px in from its bottom-right
    corner; with no panel, under the fragment. Not where the place already holds a .loop-pause. Under prefers-reduced-motion nothing
    moves and no button is shown.
  - A fragment's script never writes words of its own over the page's: every state it shows comes
    from the markup (data-* beside the text it changes) or from opts.
  Grounds: ui.grounds(document, fx) mounts the [data-fx] grounds of a page of cards. A still ground is
  drawn once at the screen's sharpness (up to 2 device pixels) and kept as a plain picture, its WebGL
  context freed; a ground a fragment drives stays live (at 1 device pixel) only near the screen. So
  the page needs one or two contexts. See grounds() below.
*/
const BASE = new URL('./', import.meta.url);
const reducedQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
export const reduced = () => !!(reducedQuery && reducedQuery.matches);
/** true when el sits under data-ui-still: it shows its finished picture and never cycles */
export const isStill = el => !!(el && el.closest && el.closest('[data-ui-still]'));

const css = new Map();
function link(href) {
  if (!css.has(href)) {
    const done = [...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href === href);
    css.set(href, done ? Promise.resolve() : new Promise(res => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = l.onerror = () => res();
      document.head.appendChild(l);
    }));
  }
  return css.get(href);
}
const cache = new Map();
const fetchText = url => {
  if (!cache.has(url)) cache.set(url, fetch(url).then(r => { if (!r.ok) throw new Error(`ui: ${r.status} ${url}`); return r.text(); }));
  return cache.get(url);
};

let uid = 0;
// SVG ids (gradients, masks) must be unique per copy of a fragment
function uniqueIds(root) {
  const n = ++uid;
  for (const el of root.querySelectorAll('[id]')) {
    const old = el.id, id = `${old}-u${n}`;
    el.id = id;
    for (const ref of root.querySelectorAll('*')) {
      for (const a of ['fill', 'stroke', 'mask', 'clip-path', 'filter', 'href', 'xlink:href']) {
        const v = ref.getAttribute(a);
        if (!v || !v.includes('#' + old)) continue;
        const nv = v.split(`url(#${old})`).join(`url(#${id})`);
        ref.setAttribute(a, nv === '#' + old ? '#' + id : nv);
      }
    }
  }
}

const mods = new Map();
function script(name) {
  if (!mods.has(name)) mods.set(name, import(new URL(`${name}/fragment.js`, BASE).href).then(m => m.default));
  return mods.get(name);
}

/** fill el with the fragment `name` and start it; returns its controller (or null) */
export async function load(el, name, opts = {}) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`ui: bad fragment name "${name}"`);
  const base = new URL(`${name}/`, BASE);
  const [meta, html] = await Promise.all([
    fetchText(new URL('meta.json', base).href).then(JSON.parse),
    fetchText(new URL('fragment.html', base).href),
    link(new URL('base.css', BASE).href),
    link(new URL('fragment.css', base).href),
  ]);
  // the kit's sample marks live in assets/ui/icons: a fragment pasted into the project's index.html asks for assets/ui/icons/ (from the project root),
  // and one loaded here is pointed at the kit's own folder, whatever page loads it
  el.innerHTML = html.replace(/src="(?:assets\/ui\/)?icons\//g, `src="${new URL('icons/', BASE).href}`);
  const root = el.querySelector('[data-ui]') || el.firstElementChild;
  uniqueIds(root);
  return meta.js ? start(root, opts) : null;
}

/** start a fragment already in the page (its markup pasted from fragment.html and edited to the
    client's content); links its stylesheets, reads data-ui-opts='{...}' on the root for its options */
export async function start(root, opts) {
  if (root.__ui) return root.__ui;
  const name = root.dataset.ui;
  if (!/^[a-z0-9-]+$/.test(name || '')) return null;
  if (!opts) { try { opts = root.dataset.uiOpts ? JSON.parse(root.dataset.uiOpts) : {}; } catch { opts = {}; } }
  await Promise.all([link(new URL('base.css', BASE).href), link(new URL(`${name}/fragment.css`, BASE).href)]);
  const init = await script(name).catch(() => null);
  if (!init) return null;
  root.__ui = init(root, opts) || { destroy() {} };
  return root.__ui;
}

/*
  The motion plan, as system.js deals it: once the page marks a loop (data-ui-loop), every fragment
  that is not that loop or inside one is held still; on a phone (under 640px), on kind other
  (<meta name="site-kind" content="other">) and on a place nothing runs by itself, voice included.
  A page with no data-ui-loop anywhere leaves every fragment to loop (a gallery of the kit).
*/
const LOOPS = '[data-ui-loop], [data-ui-cycles]';
export function plan(root = document) {
  const doc = root.ownerDocument || root;
  if (!doc.querySelector || !doc.querySelector('[data-ui-loop]')) return;
  const kind = doc.querySelector('meta[name="site-kind"]');
  const other = (doc.documentElement && doc.documentElement.dataset.type === 'place') || (!!kind && kind.content.trim().toLowerCase() === 'other');
  const phone = other || (typeof matchMedia === 'function' && matchMedia('(max-width: 639px)').matches);
  for (const el of root.querySelectorAll('[data-ui-load], [data-ui]')) {
    if (el.parentElement && el.parentElement.closest('[data-ui-load]')) continue;   // inside a loaded one
    if (phone || !el.closest(LOOPS)) el.setAttribute('data-ui-still', '');
  }
}

/* every placeholder resolves on its own: a still one is held the moment its own load is done */
export function loadAll(root = document) {
  plan(root);
  return Promise.all([...root.querySelectorAll('[data-ui-load]')].map(el => {
    let opts = {};
    try { opts = el.dataset.uiOpts ? JSON.parse(el.dataset.uiOpts) : {}; } catch (e) { console.warn('ui: bad data-ui-opts', el); }
    return load(el, el.dataset.uiLoad, opts).catch(e => { console.warn(e); return null; });
  }));
}
export function startAll(root = document) {
  plan(root);
  return Promise.all([...root.querySelectorAll('[data-ui]')].map(el => start(el)));
}

/** hold a fragment (its placeholder or root) on its finished picture from now on; it still plays while
    the pointer is on its card */
export function hold(el) {
  el.setAttribute('data-ui-still', '');
  const root = el.matches('[data-ui]') ? el : el.querySelector('[data-ui]');
  if (!root || !root.__ui) return;
  if (root.__ui.hold) root.__ui.hold();
  else { root.__ui.destroy(); root.__ui = null; }
}

/* ---------------------------------------------------------------- pause button */
const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4.25" y="3.25" width="2.75" height="9.5" rx="0.9"/><rect x="9" y="3.25" width="2.75" height="9.5" rx="0.9"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.25 3.7v8.6c0 .62.68 1 1.2.66l6.5-4.3c.47-.31.47-1 0-1.32l-6.5-4.3c-.52-.34-1.2.04-1.2.66Z"/></svg>';
const boxes = new WeakMap();
const boxOf = root => root.closest('[data-ui-pause-host], .panel__screen, .panel, .frame') || root.parentElement;
// a card's title: the first h3 or .card__title in the card that is not inside its panel
const titleOf = card => [...card.querySelectorAll('h3, .card__title')].find(t => !t.closest('.panel, .frame, .ui') && t.closest('.card') === card);

/**
  pausable(box, ctrl): the same pause button for anything else that moves on its own in a panel for
  more than about 5 s (an object from assets/objects, a moving ground): ctrl needs pause() and
  resume(). One button per place, shared by every loop in it. Returns a function that removes it.
  Nothing is added under reduced motion (those hold still by themselves).
  Where it goes, so it never covers what the panel shows (a cropped panel runs its UI into every corner):
  - in a .card with a title: beside the title, at the right of the card's text column (the title keeps
    44px clear for it); one button for the card;
  - a box marked [data-ui-pause-host]: its bottom-right corner, as the page chose;
  - a .panel or .frame outside a card: its bottom-right corner (keep that corner clear);
  - a fragment with no panel round it: under its bottom-right corner, in 44px kept free below it.
*/
export function pausable(box, ctl) {
  if (!box || reduced()) return () => {};
  const explicit = box.matches('[data-ui-pause-host]');
  const card = explicit ? null : box.closest('.card');
  const title = card ? titleOf(card) : null;
  const key = title ? card : box;
  let p = boxes.get(key);
  if (!p) {
    if (box.querySelector(':scope > .loop-pause') || (title && card.querySelector(':scope > .loop-pause'))) return () => {};   // the page put its own there
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ui-pause loop-pause';
    p = { btn, ctls: new Set(), paused: false, off: () => {} };
    const show = () => {
      const label = `${p.paused ? 'Play' : 'Pause'} animation`;
      btn.innerHTML = p.paused ? ICON_PLAY : ICON_PAUSE;
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.classList.toggle('is-paused', p.paused);
    };
    btn.addEventListener('click', () => { p.paused = !p.paused; show(); p.ctls.forEach(c => (p.paused ? c.pause() : c.resume())); });
    show();
    if (title) {
      // beside the title: top on the title's first line, right on the text column's right edge
      title.classList.add('ui-pause-beside');
      btn.classList.add('ui-pause--title');
      const place = () => {
        const c = card.getBoundingClientRect(), t = title.getBoundingClientRect(), col = title.parentElement;
        const cs = getComputedStyle(col), r = col.getBoundingClientRect();
        const colRight = r.right - (parseFloat(cs.paddingRight) || 0) - (parseFloat(cs.borderRightWidth) || 0);
        const lh = parseFloat(getComputedStyle(title).lineHeight) || 26;
        const k = c.width / (card.offsetWidth || c.width) || 1;      // a scaled card (fit) measures in its own px
        btn.style.top = `${Math.round((t.top - c.top) / k + (lh - 32) / 2)}px`;
        btn.style.right = `${Math.max(8, Math.round((c.right - colRight) / k))}px`;
      };
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.append(btn);
      place();
      const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null;
      if (ro) { ro.observe(card); ro.observe(title); }
      p.off = () => { if (ro) ro.disconnect(); };   // the title keeps its 44px: no reflow when the button goes
    } else {
      const bare = !explicit && !box.matches('.panel__screen, .panel, .frame');
      if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
      if (bare) {
        // no panel round it: the fragment fills its box to every corner, so the button sits under it
        btn.classList.add('ui-pause--below');
        if (!box.dataset.uiPauseRoom) { box.dataset.uiPauseRoom = ''; box.style.paddingBottom = `calc(${getComputedStyle(box).paddingBottom} + 44px)`; }
      }
      box.append(btn);
    }
    boxes.set(key, p);
  }
  p.ctls.add(ctl);
  if (p.paused) ctl.pause();
  return () => { p.ctls.delete(ctl); if (!p.ctls.size) { p.btn.remove(); p.off(); boxes.delete(key); } };
}
const addPause = (root, ctl) => pausable(boxOf(root), ctl);

/* ---------------------------------------------------------------- the finished picture, tidied */
/* A finished picture keeps some text hidden on purpose (the other state of a button, a tag shown on hover, a label cut where it
   would meet the edge). That text is hidden from assistive technology too (aria-hidden), so nothing in a fragment reads as
   present but invisible; it is taken off again when the fragment starts to move. */
const tidying = new WeakMap();
function sweep(root) {
  const walk = (el, up) => {
    if (typeof SVGElement === 'function' && el instanceof SVGElement) return;
    const cs = getComputedStyle(el);
    const self = cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05;
    if (self && !up && cs.display !== 'none' && el.textContent.trim()) {
      if (!el.hasAttribute('aria-hidden')) { el.setAttribute('aria-hidden', 'true'); el.dataset.uiAh = ''; }
    } else if (el.dataset.uiAh != null && !(self && !up)) { el.removeAttribute('aria-hidden'); delete el.dataset.uiAh; }
    for (const c of el.children) walk(c, up || self);
  };
  for (const c of root.children) walk(c, false);
}
function tidy(root) {
  if (tidying.has(root)) return;
  tidying.set(root, requestAnimationFrame(() => requestAnimationFrame(() => { tidying.delete(root); if (root.isConnected) sweep(root); })));
}
function untidy(root) {
  if (tidying.has(root)) { cancelAnimationFrame(tidying.get(root)); tidying.delete(root); }
  for (const el of root.querySelectorAll('[data-ui-ah]')) { el.removeAttribute('aria-hidden'); delete el.dataset.uiAh; }
}

/* ---------------------------------------------------------------- the loop */
const STOP = Symbol('stop'), AGAIN = Symbol('again');
// the card (or tile, or link) a fragment sits in: the pointer entering it restarts the fragment's cycle
const hostOf = root => root.closest('[data-ui-hover], .card, .tile, .menu-card, a') || boxOf(root);
const hosted = new WeakMap();
const QUARTER = 800;        // a restart within this long of a cycle's start changes nothing (no stutter)

/* one set of listeners per card: the pointer (a mouse or pen, never a tap) or keyboard focus entering it
   restarts every loop in it from the top; a card whose fragments are all held plays its top fragment
   (the last in the page, the dialog over a window) while the pointer stays, and rests when it leaves.
   Keyboard focus plays it once only: a held fragment never loops with no pause button while a link in
   its card keeps focus */
function hostListen(host, rec) {
  let set = hosted.get(host);
  if (!set) {
    set = new Set();
    hosted.set(host, set);
    const enter = pointer => {
      const live = [...set].filter(r => r.running());
      if (live.length) { live.forEach(r => r.restart()); return; }
      const top = [...set].sort((a, b) => (a.root.compareDocumentPosition(b.root) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)).pop();
      if (top) (pointer ? top.hover(true) : top.restart());
    };
    const leave = () => set.forEach(r => r.hover(false));
    host.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') enter(true); });
    host.addEventListener('pointerleave', leave);
    host.addEventListener('focusin', e => { if (!e.target.closest('.loop-pause')) enter(false); });   // not the pause button itself
    host.addEventListener('focusout', e => { if (!host.contains(e.relatedTarget)) leave(); });
  }
  set.add(rec);
  return () => set.delete(rec);
}

/**
  Run cycle(api) again and again while the fragment is on screen. One cycle is 2.5 to 4 s and ends on
  the finished picture (references/motion.md). api.wait(ms) waits that long of on-screen time;
  api.tween(ms, fn, ease) calls fn(0..1) on frames; api.alive is false after destroy.
  The waits and tweens of a cycle add up on the cycle's own timeline (api.time is its clock): each one
  ends at its place on it, so a busy page (six loops at once, a CPU renderer, a scroll) cannot stretch
  the cycle past its plan, a late step just catches up. The dev warning reads the plan (the sum) and the
  time it took (4.4 s at most); ui-cycle-end on the root says both ({ ms, planned, stalled }).
  A held or reduced-motion fragment hides its intentionally hidden text from assistive technology too.
  Returns { destroy, pause, resume, restart, hold }.
  - still() (the finished picture) is shown at once and held `rest` ms (600) before the first cycle,
    so a visitor or a screenshot never meets an empty window.
  - The pointer entering the fragment's card (.card, .tile, a, or [data-ui-hover]) restarts it from
    the top (not in its first 800 ms, not while paused); restart() does the same for the page (a tab
    shown again). Restarting shows still() and runs the cycle at once, so a cycle must start from the
    finished picture without a jump.
  - Held (data-ui-still, or its `cycles` done): it shows still() and plays its cycle only while the
    pointer is on its card, then rests; restart() plays it once. Under reduced motion nothing plays.
  - `cycles` (or data-ui-cycles on an ancestor) plays that many cycles, then holds; `pause: false` adds
    no button (the page runs its own). Page loops use this as well:
    ui.loop(el, async api => { ... }, { still: () => showFinished(el) })
*/
export function loop(root, cycle, { still, rest = 600, rootMargin = '0px', cycles, pause = true } = {}) {
  const show = () => { if (still) still(); tidy(root); };
  const setHeld = on => root.classList.toggle('is-ui-held', on);
  if (reduced()) {
    setHeld(true);
    show();
    const none = () => {};
    return { destroy: none, pause: none, resume: none, restart: none, hold: none };
  }
  const cyclesHost = root.closest('[data-ui-cycles]');
  const maxCycles = cycles || (cyclesHost ? Math.max(1, parseInt(cyclesHost.dataset.uiCycles, 10) || 2) : 0);
  let mode = isStill(root) ? 'held' : 'run';
  let want = mode === 'run' ? Infinity : 0;      // cycles still to play
  let needRest = mode === 'run' && rest > 0;
  let visible = false, stopped = false, paused = false, hovering = false, unpause = null;
  let gen = 0, cur = 0, began = 0, played = 0;     // gen moves on at every restart; cur is the cycle's own
  let stalled = false, warned = false;             // a cycle that waited off screen or paused is not measured
  const queue = [], aborts = new Set(), wake = [];
  const active = () => visible && !paused && !document.hidden && !stopped;
  const flush = () => { if (!active()) return; while (queue.length) queue.shift()(); };
  const abort = why => { gen++; const fs = [...aborts]; aborts.clear(); queue.length = 0; fs.forEach(f => f(why)); };
  const kick = () => { while (wake.length) wake.shift()(); };
  // the cycle's own clock: the waits of a cycle add up on a timeline that starts when the cycle starts,
  // and each wait ends at its place on that timeline, not a delay after the last one. So a busy main
  // thread (a CPU renderer, six loops on one page, a scroll) cannot stretch the cycle: a wait that
  // comes late is shortened and the cycle catches up. Time spent off screen or paused is not counted.
  let t0 = 0, planned = 0, lost = 0;
  const LAG = 1200;       // behind by more than this (a stalled tab): give up catching up and go on from here
  const gate = () => new Promise((res, rej) => {
    if (stopped) return rej(STOP);
    if (cur !== gen) return rej(AGAIN);
    if (active()) return res();
    stalled = true;
    const from = performance.now();
    const ab = why => rej(why);
    aborts.add(ab);
    queue.push(() => { aborts.delete(ab); lost += performance.now() - from; res(); });
  });
  const sleep = ms => new Promise((res, rej) => {
    const ab = why => { clearTimeout(t); rej(why); };
    const t = setTimeout(() => { aborts.delete(ab); res(); }, ms);
    aborts.add(ab);
  });
  // behind the timeline: give the page one frame (at most 50 ms) to paint what the last step changed
  const frame = () => new Promise((res, rej) => {
    let done = false, t = 0;
    const go = () => { if (done) return; done = true; clearTimeout(t); aborts.delete(ab); res(); };
    const ab = why => { done = true; clearTimeout(t); rej(why); };
    aborts.add(ab);
    t = setTimeout(go, 50);
    requestAnimationFrame(go);
  });
  const api = {
    get alive() { return !stopped; },
    /** the cycle's own clock: ms of cycle time since it started (on screen and not paused) */
    get time() { return began ? performance.now() - t0 - lost : 0; },
    async wait(ms) {
      await gate();
      if (!began) { await sleep(ms); await gate(); return; }       // before the cycle starts (the rest): a plain wait
      planned += ms;
      const due = t0 + planned + lost - performance.now();
      if (due < -LAG) { lost -= due; await frame(); }               // far behind (a stalled tab): go on from here
      else if (due > 1) await sleep(due);
      else await frame();
      await gate();
    },
    // frames count only while the loop is active, so a pause or a scroll away holds the tween where it is
    async tween(ms, fn, ease = t => 1 - Math.pow(1 - t, 3)) {
      await gate();
      if (began) planned += ms;
      await new Promise((res, rej) => {
        let done = 0, last = null, dead = false;
        const ab = why => { dead = true; rej(why); };
        aborts.add(ab);
        const step = now => {
          if (dead) return;
          if (!active()) { last = null; gate().then(() => requestAnimationFrame(step), e => { aborts.delete(ab); rej(e); }); return; }
          if (last != null) done += now - last;
          last = now;
          const k = Math.min(1, done / ms);
          fn(ease(k));
          if (k < 1) requestAnimationFrame(step); else { aborts.delete(ab); res(); }
        };
        requestAnimationFrame(step);
      });
      await gate();
    },
  };
  const io = new IntersectionObserver(es => {
    const was = visible;
    visible = es[es.length - 1].isIntersecting;
    // scrolled away mid-cycle: rest on the finished picture, never on a cleared or half-built frame; the cycle starts again from the top when it is back
    if (was && !visible && began && !paused) { abort(AGAIN); began = 0; show(); if (mode === 'run' && rest > 0) needRest = true; }
    flush();
  }, { rootMargin });
  io.observe(root);
  const onVis = () => flush();
  document.addEventListener('visibilitychange', onVis);
  // effects inside the fragment (the voice orb) stop and start with it
  const inner = on => root.querySelectorAll('[data-fx-mounted]').forEach(el => { try { on ? el.__fx?.resume() : el.__fx?.pause(); } catch {} });
  const ctl = {
    pause() { paused = true; if (began) { abort(AGAIN); began = 0; show(); if (mode === 'run' && rest > 0) needRest = true; } root.classList.add('is-ui-paused'); inner(false); root.dispatchEvent(new CustomEvent('ui-pause', { detail: { paused: true } })); },
    resume() { paused = false; root.classList.remove('is-ui-paused'); inner(true); root.dispatchEvent(new CustomEvent('ui-pause', { detail: { paused: false } })); flush(); },
    /** from the top: a loop starts its cycle again at once; a held fragment plays it once */
    restart() {
      if (stopped || paused) return;
      if (want > 0 && began && performance.now() - began < QUARTER) return;
      abort(AGAIN);
      needRest = false;
      began = 0;
      show();
      if (mode === 'held') want = Math.max(want, 1);
      kick();
    },
    /** from now on the finished picture; it still plays while the pointer is on its card */
    hold() {
      if (stopped) return;
      mode = 'held'; want = 0; hovering = false;
      if (unpause) { unpause(); unpause = null; }
      abort(AGAIN);
      show();
      setHeld(true);
    },
    destroy() {
      if (stopped) return;
      stopped = true;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      abort(STOP);
      kick();
      unlisten();
      if (unpause) unpause();
      root.classList.remove('is-ui-paused');
      setHeld(true);
      show();
    },
  };
  const rec = {
    root,
    running: () => !stopped && mode === 'run',
    restart: () => ctl.restart(),
    hover(on) {
      if (stopped || mode !== 'held') return;
      hovering = on && !paused;
      if (hovering && want <= 0) { want = 1; kick(); }
      // leaving: the cycle under way plays to its end and rests on the finished picture
    },
  };
  const unlisten = hostListen(hostOf(root), rec);
  setHeld(mode === 'held');
  show();
  (async () => {
    for (;;) {
      if (stopped) return;
      if (want <= 0) { setHeld(true); await new Promise(r => wake.push(r)); continue; }
      cur = gen;
      setHeld(false);
      try {
        await gate();   // a cycle starts only while the fragment is on screen and not paused: its first step clears the picture
        if (needRest) { await api.wait(rest); needRest = false; }
        // the button appears when the picture starts to move; a loop with a cycle count stops by itself
        if (mode === 'run' && pause && !maxCycles && !unpause) unpause = addPause(root, ctl);
        began = performance.now();
        t0 = began; planned = 0; lost = 0;
        untidy(root);
        stalled = false;
        // a page that wants to follow the cycle (a caption, a second piece in step) listens for this
        root.dispatchEvent(new CustomEvent('ui-cycle', { bubbles: true, detail: { held: mode === 'held' } }));
        await cycle(api);
        // a dev warning (references/motion.md): one cycle is 2.5 to 4 s, the finished picture held at most
        // 15% of it; a cycle that waited off screen, paused or was restarted is not measured
        const len = performance.now() - began;
        root.dispatchEvent(new CustomEvent('ui-cycle-end', { bubbles: true, detail: { ms: Math.round(len), planned: Math.round(planned), stalled } }));
        // the plan (the sum of the cycle's waits and tweens) is what the author controls, so it is the
        // measure; the time the cycle took is checked too, for one that ran long on a busy page
        if (!warned && !stalled && (planned < 2400 || planned > 4000 || len > 4400)) {
          warned = true;
          console.warn(`ui.js: a cycle planned at ${(planned / 1000).toFixed(2)} s and run in ${(len / 1000).toFixed(2)} s (keep one cycle 2.5 to 4 s)`, root);
        }
        began = 0;
        want--;
        if (mode === 'run' && maxCycles && ++played >= maxCycles) { mode = 'held'; want = 0; }
        if (mode === 'held' && hovering) want = Math.max(want, 1);     // again while the pointer stays
        if (want <= 0) show();
      } catch (e) {
        began = 0;
        if (e === STOP) return;
        if (e !== AGAIN) { console.error(e); return; }
      }
    }
  })();
  return ctl;
}

/** restart every fragment in el (or el itself): a loop starts its cycle again from the top, a held one
    plays it once. For a tab or a panel the page shows again */
export function restart(el = document) {
  const roots = el.matches && el.matches('[data-ui]') ? [el] : [...el.querySelectorAll('[data-ui]')];
  for (const r of roots) { try { r.__ui?.restart?.(); } catch (e) { console.warn(e); } }
}

/* ---------------------------------------------------------------- grounds */
/*
  grounds(root, fx, opts): mounts every [data-fx] ground under root so a page of cards stays light on a
  laptop's integrated GPU: one or two WebGL contexts in all, never one per panel.
  - A still ground (every ground in a card holds still) is drawn once when it first comes near the
    screen, copied into a plain 2D canvas, and its WebGL context is freed at once. One at a time, so
    baking never holds more than one extra context. It is drawn again after a resize.
  - A ground a fragment drives (data-fx-live on it, or a fragment inside it whose data-ui-opts has a
    "drive": the slider) stays live while it is near the screen, draws a frame only when it changes,
    and is freed when it leaves the screen.
  - Under prefers-reduced-motion nothing drives a ground, so every ground is baked.
  A baked ground is drawn at min(devicePixelRatio, 2) device pixels per CSS pixel (its context lives
  for that one frame), so it stays sharp on a 1.25-2x laptop screen; a live ground draws at 1. It also
  caps fx.config at 3 live contexts; fx.config.maxDpr is left alone, so a moving hero the page mounts
  keeps its own sharpness. opts.skip(el) leaves a ground to the page (that moving hero). Call it again
  after a theme change: every ground is drawn again in the new colours. Resolves when the grounds near
  the screen are drawn.
*/
const grounded = new WeakMap();
const bakeQueue = [];
let bakeBusy = null;
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
const parseJSON = s => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
// live: marked so, or holding a fragment that drives it and is not held still (a still slider never
// moves); never under reduced motion, where no fragment moves
const isLive = el => !reduced() && (el.hasAttribute('data-fx-live') ||
  [...el.querySelectorAll('[data-ui-opts]')].some(f => /"drive"/.test(f.dataset.uiOpts || '') && !f.closest('[data-ui-still]')));
// mount with a device-pixel cap of its own: fx.shader reads fx.config.maxDpr once, when it is made
async function mountAt(fx, el, spec, dpr) {
  await fx.load(el.dataset.fx);
  const cfg = fx.config, keep = cfg ? cfg.maxDpr : null;
  if (cfg) cfg.maxDpr = dpr;
  try { return await fx.mount(el, el.dataset.fx, spec); } finally { if (cfg) cfg.maxDpr = keep; }
}
const bakeDpr = () => Math.min(2, Math.max(1, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1));

function groundSpec(el, fx, extra) {
  let palette = fx.readPalette(el);
  const over = parseJSON(el.dataset.fxPalette);
  if (over) palette = fx.normalizePalette({ ...palette, ...over });
  // a seed is kept on the element, so a ground drawn again (resize, theme) is the same picture
  if (!el.dataset.fxSeed) el.dataset.fxSeed = String(Math.floor(Math.random() * 10000));
  return { palette, params: { ...(parseJSON(el.dataset.fxParams) || {}), ...(extra || {}) }, seed: el.dataset.fxSeed };
}
function unground(el) { if (el.__fx) { try { el.__fx.destroy(); } catch { /* gone */ } } }

async function bakeOne(el, fx, st) {
  st.queued = false;
  if (!el.isConnected || !st.near || !st.dirty) return;
  const gen = ++st.gen;
  unground(el);
  // a baked picture is kept for good, so it is drawn at full scale: fx's adaptive scale (which lowers the
  // render scale when frames run slow) is off while it draws; bakes run one at a time
  const cfg = fx.config, adaptive = cfg ? cfg.adaptive : undefined;
  if (cfg) cfg.adaptive = false;
  try { await bakeDraw(el, fx, st, gen); } finally { if (cfg) cfg.adaptive = adaptive; }
}
// a ground that could not be drawn (no WebGL, a shader error, too slow) still shows a picture: a still
// field in its own colours (fx.fallbackCSS), never an empty panel; it is tried again when it comes back
function stand(el, fx) {
  if (el.style.background || !fx.fallbackCSS) return;
  try { el.style.background = fx.fallbackCSS(groundSpec(el, fx).palette); el.dataset.uiStandIn = ''; } catch { /* the panel's own fill stays */ }
}
async function bakeDraw(el, fx, st, gen) {
  let api;
  // a second try (after a frame that never came) draws at 1 device pixel: a slower machine still gets a picture
  try { api = await mountAt(fx, el, groundSpec(el, fx), st.tries ? 1 : bakeDpr()); } catch (e) { console.warn('ui: ground', e); stand(el, fx); st.dirty = false; return; }
  // fx makes the context once it sees the element; wait for its first drawn frame (slow on a CPU renderer)
  let src = null;
  for (const t0 = performance.now(); performance.now() - t0 < 10000;) {
    if (el.__fx !== api) return;                                    // replaced meanwhile
    if (gen !== st.gen || !st.near) { api.destroy(); if (st.near) queueBake(el, fx, st); return; }
    if (el.dataset.fxFallback) { st.dirty = false; return; }      // no WebGL: the CSS fallback stays
    const c = el.querySelector(':scope > canvas.fx-canvas:not(.is-baked)');
    if (c && c.style.opacity === '1') { src = c; break; }
    await nextFrame();
  }
  if (!src) {
    // too slow: a still field in its colours for now, and one more try a moment later at 1 device pixel
    api.destroy(); stand(el, fx);
    if (!st.tries) { st.tries = 1; setTimeout(() => { if (st.near && st.dirty) queueBake(el, fx, st); }, 1200); }
    return;
  }
  api.set({});                    // one more frame now, so the drawing buffer is whole when it is copied
  const out = document.createElement('canvas');
  out.width = src.width; out.height = src.height;
  out.getContext('2d').drawImage(src, 0, 0);
  out.className = 'fx-canvas is-baked';
  out.setAttribute('aria-hidden', 'true');
  Object.assign(out.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', zIndex: '-1', pointerEvents: 'none', borderRadius: 'inherit' });
  api.destroy();                                                     // frees the WebGL context
  el.insertBefore(out, el.firstChild);
  if (el.dataset.uiStandIn != null) { el.style.background = ''; delete el.dataset.uiStandIn; }   // the real picture replaces the stand-in
  const id = el.dataset.fx;
  const stub = {
    id, el, baked: true, params: api.params, palette: api.palette, seed: api.seed,
    pause() {}, resume() {}, set() { return stub; }, setPalette() { return stub; },
    destroy() { out.remove(); if (el.__fx === stub) delete el.__fx; el.removeAttribute('data-fx-mounted'); },
    get info() { return { webgl: 0, baked: true, size: [out.width, out.height] }; },
  };
  el.__fx = stub;                 // fx.mountAll skips it; fx.mount on it replaces the picture
  el.setAttribute('data-fx-mounted', id);
  st.size = [el.clientWidth, el.clientHeight];
  st.dirty = false;
}
// the next ground to draw: one on the screen first (the top one), then the nearest to it, so a scroll
// past a group never makes the panel in view wait for the ones it passed
function nextBake() {
  const vh = innerHeight;
  let best = 0, bd = Infinity;
  bakeQueue.forEach(([el], i) => {
    const r = el.getBoundingClientRect();
    const d = r.bottom > 0 && r.top < vh ? Math.max(0, r.top) - 1e6 : r.top >= vh ? r.top - vh : -r.bottom;
    if (d < bd) { bd = d; best = i; }
  });
  return bakeQueue.splice(best, 1)[0];
}
function pump() {
  if (!bakeBusy) bakeBusy = (async () => {
    await null;                   // every ground the same scroll brought near is queued before one is picked
    while (bakeQueue.length) {
      const [el, fx, st] = nextBake();
      try { await bakeOne(el, fx, st); } catch (e) { console.warn('ui: ground', e); }
      await nextFrame();
    }
    bakeBusy = null;
  })();
  return bakeBusy;
}
function queueBake(el, fx, st) {
  if (st.queued || !st.dirty) return;
  st.queued = true;
  bakeQueue.push([el, fx, st]);
  pump();
}
async function liveOn(el, fx, st) {
  if (el.__fx && !el.__fx.baked) return;
  const gen = ++st.gen;
  unground(el);
  const api = await mountAt(fx, el, groundSpec(el, fx, st.extra), 1).catch(e => { console.warn('ui: ground', e); return null; });
  if (!api) return;
  if (gen !== st.gen || !st.near) { api.destroy(); return; }
  api.pause();                    // no frame loop: it draws when shown, resized or set() by its fragment
  const set = api.set;
  api.set = next => { st.extra = { ...st.extra, ...next }; return set(next); };
}

const groundWaiters = [];
const groundIO = typeof IntersectionObserver === 'function' ? new IntersectionObserver(es => {
  for (const e of es) {
    const st = grounded.get(e.target);
    if (!st) continue;
    st.near = e.isIntersecting;
    if (st.live) {
      if (st.near) liveOn(e.target, st.fx, st);
      else { st.gen++; unground(e.target); }                      // its context is freed off screen
    } else if (st.near) queueBake(e.target, st.fx, st);
  }
  for (const r of groundWaiters.splice(0)) r();
}, { rootMargin: '12% 0px' }) : null;   // the same margin fx.js makes its contexts at
const groundRO = typeof ResizeObserver === 'function' ? new ResizeObserver(es => {
  for (const e of es) {
    const st = grounded.get(e.target);
    if (!st || st.live || !st.size) continue;
    const w = e.target.clientWidth, h = e.target.clientHeight;
    if (Math.abs(w - st.size[0]) < 2 && Math.abs(h - st.size[1]) < 2) continue;
    clearTimeout(st.rt);
    st.rt = setTimeout(() => { st.dirty = true; if (st.near) queueBake(e.target, st.fx, st); }, 250);
  }
}) : null;

export async function grounds(root, fx, { skip } = {}) {
  root = root || document;
  if (fx.config) fx.config.maxLive = Math.min(fx.config.maxLive || 3, 3);
  const els = [...root.querySelectorAll('[data-fx]')].filter(el => !(skip && skip(el)));
  if (root.matches && root.matches('[data-fx]') && !(skip && skip(root))) els.unshift(root);
  if (!groundIO) return fx.mountAll(root);
  const seen = new Promise(r => groundWaiters.push(r));
  for (const el of els) {
    let st = grounded.get(el);
    if (st) {
      // again (a theme change): draw it once more in the new colours
      st.dirty = true; st.gen++;
      if (st.live) { unground(el); if (st.near) liveOn(el, fx, st); }
      else if (st.near) queueBake(el, fx, st);
      continue;
    }
    st = { fx, live: isLive(el), near: false, dirty: true, queued: false, gen: 0, size: null, extra: null, tries: 0 };
    grounded.set(el, st);
    groundIO.observe(el);
    if (groundRO) groundRO.observe(el);
  }
  await Promise.race([seen, new Promise(r => setTimeout(r, 300))]);
  if (bakeBusy) await bakeBusy;
}

/** the pointer arrow used by fragments that click */
export const POINTER_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 2.8v13.4c0 .5.6.7.9.4l3.2-3.1 2.2 4.9c.1.3.5.4.8.3l1.6-.7c.3-.1.4-.5.3-.8l-2.2-4.8 4.4-.3c.5 0 .7-.6.3-.9L5.4 2.4c-.4-.3-.9 0-.9.4Z" fill="#111" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>';

/** a controller that also restarts, pauses and holds: for a fragment that returns its own destroy() */
export const withLoop = (ctl, destroy) => ({ pause: ctl.pause, resume: ctl.resume, restart: ctl.restart, hold: ctl.hold, destroy });

const ui = { load, loadAll, start, startAll, plan, loop, restart, hold, pausable, grounds, isStill, reduced, POINTER_SVG };
export default ui;
