/*
  _scenes/auto.js - mounts every [data-scene] on the page, so a page needs no script of its own for
  its scene objects. Load it once, after system.js (README.md beside it has the whole contract):

    <div class="frame frame--square">
      <div data-scene="product-turntable" data-scene-params='{"form":"chair"}'></div>
    </div>
    <div class="panel">
      <div data-scene="split-reveal" data-scene-src="assets/img/raw-scan.jpg" aria-label="A scanned print, half of it screened"></div>
    </div>
    <script type="module" src="assets/objects/_scenes/auto.js"></script>

  data-scene          the object's id: product-turntable | dot-object | split-reveal |
                      dither-sequence | exploded-layers
  data-scene-src      the client's photograph: a page-relative path or URL, or JSON: one entry
                      { src, alt, by, page, licence, licenceUrl, focus } or an array of them
                      (dither-sequence: 2 to 6 frames; exploded-layers: up to 4 sheets, top first)
  data-scene-params   JSON params (each object's meta.json lists them)
  data-scene-palette  JSON { bg, surface, ink, muted, accent }; without it the scene prints in the page
                      tokens, on the ground of the box it sits in
  data-scene-loop     in a group (the same [data-scene-group], else the same section), the one scene
                      that moves by itself; the others hold still until the pointer reaches them.
                      Without it the first looping scene of the group moves.
  aria-label          what the picture shows (else the photograph's alt)

  The controllers: (await import('.../auto.js')).scenes, a Map from element to controller
  (pause(), resume(), setPalette(p | null), destroy()). On a theme change call setPalette(null)
  on each: it reads the page tokens again.
*/
export const scenes = new Map();
const IDS = ['product-turntable', 'dot-object', 'split-reveal', 'dither-sequence', 'exploded-layers'];
const LOOPING = new Set(['product-turntable', 'dither-sequence']);
const claimed = new WeakSet();
const json = (s, d = {}) => { try { return s ? JSON.parse(s) : d; } catch (_) { console.warn('scenes: bad JSON', s); return d; } };
const srcOf = s => {
  if (!s) return undefined;
  s = s.trim();
  return s[0] === '{' || s[0] === '[' ? json(s, undefined) : s;
};

export async function mountAll(root = document) {
  const els = [...root.querySelectorAll('[data-scene]')].filter(el => !claimed.has(el));
  els.forEach(el => claimed.add(el));
  // one moving scene per group
  const groups = new Map();
  for (const el of els) {
    if (!LOOPING.has(el.dataset.scene)) continue;
    const g = el.closest('[data-scene-group]') || el.closest('section') || document.body;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(el);
  }
  const moving = new Set();
  for (const [g, list] of groups) {
    const before = [...scenes.keys()].some(el => g.contains(el) && el.dataset.sceneMoving === '1');
    if (!before) moving.add(list.find(el => el.hasAttribute('data-scene-loop')) || list[0]);
  }
  await Promise.all(els.map(async el => {
    const id = el.dataset.scene;
    if (!IDS.includes(id)) { console.warn('scenes: unknown object', id); return; }
    try {
      const obj = (await import(new URL(`../${id}/object.js`, import.meta.url).href)).default;
      const params = json(el.dataset.sceneParams);
      if (LOOPING.has(id) && params.autoplay == null) params.autoplay = moving.has(el) ? 1 : 0;
      if (params.autoplay) el.dataset.sceneMoving = '1';
      if (el.getAttribute('aria-label') && params.alt == null) params.alt = el.getAttribute('aria-label');
      const opts = { params, src: srcOf(el.dataset.sceneSrc) };
      if (el.dataset.scenePalette) opts.palette = json(el.dataset.scenePalette);
      scenes.set(el, obj.mount(el, opts));
    } catch (e) { console.warn('scenes:', id, e); }
  }));
  return scenes;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountAll(), { once: true });
  else mountAll();
}
export default { mountAll, scenes };
