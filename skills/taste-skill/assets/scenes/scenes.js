/*
  scenes.js - the loader for the page's one big scene (taste-skill, references/scenes.md).

    <link rel="stylesheet" href="assets/scenes/scenes.css"><link rel="stylesheet" href="assets/scenes/<id>/scene.css">   in <head>
    <section class="sc" data-big-scene="<id>" data-big-scene-opts='{"hold": 1}' style="--h: 1"><div class="sc__stage">…</div></section>
    <script type="module" src="assets/scenes/scenes.js"></script>
  style="--h" is the screens of the finished composition (the scene's meta.json restH: 1, or 2 for the three scenes whose rest is long);
  scenes.css keeps it and the page padding at rest, and the live section is hold + 1 = two screens (hold 1).

  It finds every [data-big-scene], links scenes.css and <id>/scene.css when the page has not (the page
  links both in <head>, so the finished composition is styled without script and nothing jumps), imports <id>/scene.js and calls its
  default export mount(root, opts, lib) -> { destroy }. The page keeps scrolling natively; every scene shows
  its finished composition under prefers-reduced-motion, on a screen too small for it, without script and
  when its module fails.

  Marks on <html>: .sc-js as soon as this runs (a scene's CSS may hide what it will reveal only under
  .sc-js, and .sc-safe arrives 2.5 s later as a fallback that shows everything); data-scenes-ready="n"
  when every scene is mounted (shoot scripts wait for it); data-scenes-over="n" when a page holds more
  than one (a fault: one big scene a page). The attribute is data-big-scene, not data-scene, which the
  print objects (assets/objects) use. One line in <head> sets .sc-js and the timer earlier:
    <script>document.documentElement.classList.add('sc-js');setTimeout(()=>document.documentElement.classList.add('sc-safe'),2500)</script>
*/
import * as lib from './lib.js';

const BASE = new URL('./', import.meta.url);
const html = document.documentElement;
const linked = new Map();
function css(href) {
  if (!linked.has(href)) {
    const done = [...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href === href);
    linked.set(href, done ? Promise.resolve() : new Promise(res => {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
      l.onload = l.onerror = () => res();
      document.head.appendChild(l);
    }));
  }
  return linked.get(href);
}

export async function mount(el) {
  const id = el.dataset.bigScene;
  if (!id || el.__scene) return el.__scene || null;
  let opts = {};
  try { opts = JSON.parse(el.dataset.bigSceneOpts || '{}'); } catch { console.warn(`scenes: bad data-big-scene-opts on ${id}`); }
  el.classList.add('sc');
  await Promise.all([css(new URL('scenes.css', BASE).href), css(new URL(`${id}/scene.css`, BASE).href)]);
  const mod = await import(new URL(`${id}/scene.js`, BASE).href);
  const api = mod.default(el, opts, lib) || {};
  el.__scene = api;
  el.dataset.bigSceneMounted = '1';
  return api;
}

export async function mountAll(root = document) {
  html.classList.add('sc-js');
  const els = [...root.querySelectorAll('[data-big-scene]')].filter(el => !el.parentElement?.closest('[data-big-scene]'));
  if (els.length > 1) { html.dataset.scenesOver = String(els.length); console.warn(`scenes: ${els.length} big scenes on one page (one a page)`); }
  await Promise.all(els.map(el => mount(el).catch(e => {
    console.warn(`scenes: ${el.dataset.bigScene} failed: ${e.message}`);
    el.dataset.bigSceneFailed = e.message;
    el.classList.add('sc', 'is-rest');
  })));
  // fonts and the scenes' pictures, then every live scene measured again (a fitted line, a card's place)
  await lib.ready();
  html.dataset.scenesReady = String(els.length);
  return els;
}

export function unmountAll(root = document) {
  root.querySelectorAll('[data-big-scene-mounted]').forEach(el => { try { el.__scene?.destroy?.(); } catch { /* gone */ } delete el.__scene; el.removeAttribute('data-big-scene-mounted'); });
}

html.classList.add('sc-js');
setTimeout(() => html.classList.add('sc-safe'), 2500);
const start = () => { if (!window.__scenesManual) mountAll(document); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

export default { mount, mountAll, unmountAll, lib };
