/*
  product-render/auto.js - mounts every [data-product] element on the page. Load it once:

    <div class="frame" data-product="assets/objects/product-render/specs/city-bike.json"
         data-product-place="hero"></div>
    <script type="module" src="assets/objects/product-render/auto.js"></script>

  data-product          the spec's URL, relative to the page (its posters sit beside it)
  data-product-place    hero | stage | tile | card | none (default: hero in a .frame, card in a
                        .panel, tile in a square frame, else none)
  data-product-params   JSON over the preset, e.g. '{"angle":-20}' or '{"turn":0}' for a still
  data-product-palette  JSON { bg, surface, ink, accent }; else the page's tokens (--bg, --ink, --accent)
  aria-label            what the product is, if the spec's label does not fit the page

  products: a Map from element to controller (pause(), resume(), step(on), set(params),
  setPalette(p | null), destroy()); after a theme switch call setPalette(null) on each.
*/
import { loadProduct } from './build.js';

export const products = new Map();
const claimed = new WeakSet();
const json = s => { try { return s ? JSON.parse(s) : {}; } catch (_) { console.warn('product-render: bad JSON', s); return {}; } };
function placeOf(el) {
  const p = el.dataset.productPlace;
  if (p) return p === 'none' ? undefined : p;
  const box = el.closest('.frame, .panel, .panel__screen');
  if (!box || box === el) return el.matches('.frame') ? 'hero' : undefined;
  if (box.matches('.panel--top, .frame--square, .frame--portrait')) return 'tile';
  if (box.matches('.panel, .panel__screen')) return 'card';
  return 'hero';
}
const cache = new Map();
export async function mountAll(root = document) {
  const els = [...root.querySelectorAll('[data-product]')].filter(el => !claimed.has(el));
  els.forEach(el => claimed.add(el));
  await Promise.all(els.map(async el => {
    const url = new URL(el.dataset.product, document.baseURI).href;
    try {
      if (!cache.has(url)) cache.set(url, loadProduct(url));
      const obj = await cache.get(url);
      const opts = { place: placeOf(el), params: json(el.dataset.productParams) };
      if (el.dataset.productPalette) opts.palette = json(el.dataset.productPalette);
      products.set(el, obj.mount(el, opts));
    } catch (e) { console.error('product-render:', url, e); el.dataset.productError = String(e.message || e).split('\n')[0]; }
  }));
  return products;
}
/** resolves with products once the page's first mount is done */
export const ready = typeof document === 'undefined' ? Promise.resolve(products)
  : document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', () => r(mountAll()), { once: true }))
  : mountAll();
export default { mountAll, products, ready };
