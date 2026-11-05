/*
  _print-core/auto.js - mounts every [data-print] element on the page, so a page needs no script of
  its own for its objects. Load it once, after system.js:

    <div class="panel" data-fx="grain-gradient" data-fx-seed="4" data-fx-params='{"speed":0,"grainMotion":0}'>
      <div data-print="print-cup" data-print-place="card"></div>
    </div>
    <script type="module" src="assets/objects/_print-core/auto.js"></script>

  data-print          the object's id (its folder beside _print-core): print-cup, print-lamp ...
  data-print-place    card | tile | hero | none: the object's placement preset (meta.json "place").
                      Missing: tile in a .panel--top or a square or portrait .frame, card in any
                      other .panel, hero in any other .frame, else none (centred, on its own paper)
  data-print-params   JSON over the preset, e.g. '{"angle":-20}'; a print: '{"effect":"halftone"}'
                      (software, tech and games pages only; the render is the default)
  data-print-palette  JSON { bg, surface, ink, accent }; without it an object on a ground prints in
                      the ground's paper with the page's ink and accent, else in the page's tokens
  data-print-loop     in a group (the same [data-print-group], else the same section), the one object
                      that turns by itself; the others hold still until hovered or clicked. Without
                      it the first object of the group turns.
  aria-label          what the object shows, if the meta's label does not fit the page

  The controllers: (await import('.../auto.js')).prints, a Map from element to controller
  (pause(), resume(), step(on), set(params), setPalette(p), destroy()).
*/
export const prints = new Map();
// the preset an object takes from where it sits, unless data-print-place names one
function placeOf(el) {
  const p = el.dataset.printPlace;
  if (p) return p === 'none' ? undefined : p;
  const box = el.parentElement;
  if (!box) return undefined;
  if (box.matches('.panel--top, .frame--square, .frame--portrait')) return 'tile';
  if (box.matches('.panel, .panel__screen')) return 'card';
  if (box.matches('.frame')) return 'hero';
  return undefined;
}
const claimed = new WeakSet();
const json = s => { try { return s ? JSON.parse(s) : {}; } catch (_) { console.warn('auto.js: bad JSON', s); return {}; } };

export async function mountAll(root = document) {
  const els = [...root.querySelectorAll('[data-print]')].filter(el => !claimed.has(el));
  els.forEach(el => claimed.add(el));
  // one object turns per group
  const groups = new Map();
  for (const el of els) {
    const g = el.closest('[data-print-group]') || el.closest('section') || document.body;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(el);
  }
  const turns = new Set();
  for (const [g, list] of groups) {
    // a group mounted earlier may already hold its turning object
    const before = [...prints.keys()].some(el => g.contains(el) && prints.get(el).params.turn > 0);
    if (!before) turns.add(list.find(el => el.hasAttribute('data-print-loop')) || list[0]);
  }
  await Promise.all(els.map(async el => {
    const id = el.dataset.print;
    if (!/^print-[a-z0-9-]+$/.test(id)) { console.warn('auto.js: unknown object', id); return; }
    try {
      const obj = (await import(new URL(`../${id}/object.js`, import.meta.url).href)).default;
      const params = json(el.dataset.printParams);
      if (!turns.has(el) && params.turn == null) params.turn = 0;
      const opts = { place: placeOf(el), params };
      if (el.dataset.printPalette) opts.palette = json(el.dataset.printPalette);
      prints.set(el, obj.mount(el, opts));
    } catch (e) { console.warn('auto.js:', id, e); }
  }));
  return prints;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountAll(), { once: true });
  else mountAll();
}
export default { mountAll, prints };
