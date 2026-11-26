/*
  classic.js - runs a restored 2.4 scene under the 2.5 loader (taste-skill, references/scenes.md).

  Thirty-five scenes were built on the 2.4 stage: GSAP 3.15.0 with ScrollTrigger (and SplitText for the
  ones that split text), a shared stage.js, and one file per scene that registers Scenes['<id>']. They
  are kept as they were. Each one's <id>/scene.js is a thin module the loader imports like any other:

    import { run } from '../classic/classic.js';
    export default (root, opts) => run(root, opts, '<id>', { split: true });

  run() links classic/stage.css, loads GSAP and its plugins once from the pinned CDN (or uses the ones the
  page already loaded), then classic/stage.js and <id>/classic.js, and calls Scenes['<id>'](root, opts).
  The page writes the section as the loader asks, with the old classes kept, because each scene's CSS is
  written for them:

    <section class="sc scene" data-big-scene="<id>" data-big-scene-opts='{…}'><div class="scene-stage">…</div></section>

  The stage div is .scene-stage, not .sc__stage (scenes.css takes the padding off .sc__stage at rest).
  Without script, under reduced motion, when the CDN fails and on a phone set to rest, the section shows
  its finished composition: the scene's CSS is written for exactly that.
  Options every classic scene takes besides its own: "smooth": 1 turns on weighted wheel scrolling (Lenis)
  for the page, which the scrubbed scenes were tuned for; off by default, the page scrolls natively.
  When a scene has been built, root gets data-classic-ready="1" and window gets the event sc-classic-ready.
*/
const BASE = new URL('./', import.meta.url);
const CDN = {
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js',
  st: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js',
  split: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js',
};
const loads = new Map();

function script(src) {
  if (!loads.has(src)) {
    const have = [...document.scripts].find(s => s.src === src);
    loads.set(src, new Promise((res, rej) => {
      if (have && have.dataset.classic !== 'loading') { res(); return; }   // the page loaded it itself (it ran before modules)
      const s = have || document.createElement('script');
      s.addEventListener('load', () => { s.dataset.classic = 'done'; res(); }, { once: true });
      s.addEventListener('error', () => rej(new Error(`${src} did not load`)), { once: true });
      if (!have) { s.src = src; s.async = false; s.dataset.classic = 'loading'; document.head.appendChild(s); }
    }));
  }
  return loads.get(src);
}
function css(href) {
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href === href)) return Promise.resolve();
  return new Promise(res => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
    l.onload = l.onerror = () => res();
    document.head.appendChild(l);
  });
}

function rest(root) { root.classList.remove('is-live'); root.classList.add('sc', 'scene', 'is-rest'); }

export function run(root, opts = {}, id, needs = {}) {
  root.classList.add('scene');
  const stage = root.querySelector(':scope > .scene-stage') || root.querySelector(':scope > .sc__stage');
  if (stage) stage.classList.add('scene-stage');
  let made = null, gone = false;
  const ready = (async () => {
    await css(new URL('stage.css', BASE).href);
    // in order: each waits for the one before it, the downloads run side by side
    const list = [];
    if (!window.gsap) list.push(CDN.gsap);
    if (!window.ScrollTrigger) list.push(CDN.st);
    if (needs.split && !window.SplitText) list.push(CDN.split);
    if (opts.smooth && !window.Lenis) list.push(CDN.lenis);
    list.push(new URL('stage.js', BASE).href, new URL(`../${id}/classic.js`, BASE).href);
    for (const p of list.map(script)) await p;
    if (gone) return;
    const make = window.Scenes && window.Scenes[id];
    if (!make) throw new Error(`Scenes['${id}'] is not registered`);
    if (opts.smooth) window.Stage.smooth();
    made = make(root, opts) || null;
    await window.Stage.ready();
    root.dataset.classicReady = '1';
    window.dispatchEvent(new CustomEvent('sc-classic-ready', { detail: { id, root } }));
  })().catch(e => {
    console.warn(`scenes: ${id} (classic) fell back to its finished composition: ${e.message}`);
    root.dataset.bigSceneFailed = e.message;
    rest(root);
  });
  return {
    ready,
    destroy() {
      gone = true;
      try { if (made && typeof made.revert === 'function') made.revert(); else if (made && typeof made.kill === 'function') made.kill(); } catch { /* gone */ }
      if (root.__routeTeardown) try { root.__routeTeardown(); } catch { /* gone */ }
    },
  };
}
