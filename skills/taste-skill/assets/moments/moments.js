/*
  moments.js - the loader for the page's one or two creative moments (taste-skill, references/moments.md).

    <section data-moment="pinned-chapters" data-moment-opts='{"hold": 2.4}'>…</section>

    in system.js:   const m = await import(new URL('moments/moments.js', HERE).href); await m.ready;
    on its own:     <script type="module" src="assets/moments/moments.js"></script>

  It finds every [data-moment], links <id>/moment.css, imports <id>/moment.js and calls its default
  export mount(root, opts, lib) -> { destroy }. The page keeps scrolling natively; every moment shows
  its finished state under prefers-reduced-motion, without script, and when its module fails.

  Mounting is idempotent: an element mounts once however many times mount() or mountAll() is called
  (the mount promise is kept on the element as __momentP, before any await), mountAll(document) is
  one cached promise, and `ready` is that promise: it resolves with the mounted elements. Importing
  this module starts mountAll(document) on its own unless window.__momentsManual is set first.

  Marks on <html>: .mo-js as soon as this runs (a moment's CSS may hide what it will reveal only under
  .mo-js, and .mo-safe arrives 2.5 s later as a fallback that shows everything); data-moments-ready="n"
  when every moment is mounted (shoot scripts wait for it); data-moments-over="n" when a page holds
  more than two, and data-moments-repeat when an id is used twice (both are faults: one or two a page,
  an id once). A moment whose module fails gets data-moment-failed and the class mo-safe on its own
  element (its CSS shows the finished state at once). The 2.5 s timer and .mo-js can also be set
  earlier by one line in <head>, with modulepreload links for this file, lib.js and the dealt moment:
    <script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
    <link rel="modulepreload" href="assets/moments/moments.js"><link rel="modulepreload" href="assets/moments/lib.js">
*/
import * as lib from './lib.js';

const BASE = new URL('./', import.meta.url);
const html = document.documentElement;
const linked = new Map();
function css(href) {
  if (!linked.has(href)) {
    const done = [...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href === href);
    linked.set(href, done ? Promise.resolve() : new Promise(res => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = l.onerror = () => res();
      document.head.appendChild(l);
    }));
  }
  return linked.get(href);
}

export function mount(el) {
  if (el.__momentP) return el.__momentP;
  const id = el.dataset.moment;
  if (!id) return Promise.resolve(null);
  el.__momentP = (async () => {
    let opts = {};
    try { opts = JSON.parse(el.dataset.momentOpts || '{}'); } catch { console.warn(`moments: bad data-moment-opts on ${id}`); }
    const why = lib.stillWhy(), card = lib.inCard(el);
    if (card) { el.dataset.momentStill = 'card'; html.dataset.momentsCard = [html.dataset.momentsCard, id].filter(Boolean).join(' '); console.warn(`moments: ${id} sits in a card; it stays still`); }
    else if (why) el.dataset.momentStill = why;
    const mlib = { ...lib, reduced: () => card || lib.still() };
    const [, mod] = await Promise.all([css(new URL(`${id}/moment.css`, BASE).href), import(new URL(`${id}/moment.js`, BASE).href)]);
    const api = mod.default(el, opts, mlib) || {};
    el.__moment = api;
    el.dataset.momentMounted = '1';
    return api;
  })();
  return el.__momentP;
}

let docP = null, resolveReady;
export const ready = new Promise(r => { resolveReady = r; });

export function mountAll(root = document) {
  if (root === document && docP) return docP;
  const p = (async () => {
    html.classList.add('mo-js');
    const els = [...root.querySelectorAll('[data-moment]')].filter(el => !el.parentElement?.closest('[data-moment]'));
    const ids = els.map(el => el.dataset.moment);
    const repeat = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (repeat.length) { html.dataset.momentsRepeat = [...new Set(repeat)].join(' '); console.warn(`moments: an id twice on one page: ${repeat.join(', ')}`); }
    if (ids.length > 2) { html.dataset.momentsOver = String(ids.length); console.warn(`moments: ${ids.length} moments on one page (one or two)`); }
    await Promise.all(els.map(el => mount(el).catch(e => {
      if (!el.dataset.momentFailed) console.warn(`moments: ${el.dataset.moment} failed: ${e.message}`);
      el.dataset.momentFailed = e.message;
      el.classList.add('mo-safe');
      el.classList.remove('is-live');   // the hide rules are written under .is-live and ignore .mo-safe: a failed moment shows as written
      el.classList.add('is-done');
    })));
    if (root === document) html.dataset.momentsReady = String(els.length);
    return els;
  })();
  if (root === document) { docP = p; p.then(resolveReady, () => resolveReady([])); }
  return p;
}

export function unmountAll(root = document) {
  root.querySelectorAll('[data-moment-mounted]').forEach(el => { try { el.__moment?.destroy?.(); } catch { /* gone */ } delete el.__moment; delete el.__momentP; el.removeAttribute('data-moment-mounted'); });
  if (root === document) docP = null;
}

html.classList.add('mo-js');
setTimeout(() => html.classList.add('mo-safe'), 2500);
const start = () => { if (!window.__momentsManual) mountAll(document); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

export default { mount, mountAll, unmountAll, ready, lib };
