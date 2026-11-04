/*
  product-render/auto.js - mounts every [data-product] element on the page. Load it once:

    <div class="frame" data-product="assets/objects/product-render/specs/city-bike.json"
         data-product-place="stage" data-product-view="side" data-product-color="blue"></div>
    <script type="module" src="assets/objects/product-render/auto.js"></script>

  data-product          the spec's URL, relative to the page (its posters and stills sit beside it)
  data-product-place    hero | stage | tile | card | legacy | none (default: hero in a .frame, card in a
                        .panel, tile in a square frame, else stage). Sets how much of the frame the product
                        fills (hero 0.88, stage 0.86, tile 0.84, card 0.9 of the frame's width or height,
                        the tighter way); legacy is the old turntable placed right of the words.
  data-product-view     three-quarter (default) | side | side-left | front | rear | top | low | a view of the
                        spec's own (its close-ups: detail-saddle...) | detail:<part name>
  data-product-scene    a scene of the spec (loaded, desk, work...): the product with its props
  data-product-color    a colourway id of the spec (spec.colors); default its first
  data-product-mode     auto (default) | image (make-posters' still, no WebGL) | still (rendered once here,
                        the context freed) | live (the turn)
  data-product-fill     0.3..1.2 over the place's share
  data-product-params   JSON over the preset, e.g. '{"turn":0}' for a still, '{"x":0.1}' to move it right
  data-product-palette  JSON { bg, surface, ink, accent }; else the page's tokens (--bg, --ink, --accent)
  aria-label            what the product is, if the spec's label does not fit the page

  Changing data-product-color, -view or -scene on a mounted frame shows that variant (the still swaps,
  or it renders again). An order card drives it with no script of its own:

    <input type="radio" name="colour" value="blue" data-product-swatch="#bike-hero">     (or a button)

  data-product-swatch on an input (its value) or a button (data-product-swatch-value, else its value):
  on change or click the frames the selector names (default: every product frame whose spec has that
  colourway) take that colour. Or dispatch an event on the frame or on document:
    el.dispatchEvent(new CustomEvent('product:set', { detail: { color: 'blue', view: 'side' } }));
    document.dispatchEvent(new CustomEvent('product:set', { detail: { color: 'blue', target: '#bike-hero' } }));
  Every frame tells what it shows: data-product-color-shown, data-product-view, data-product-mode,
  data-product-state (image | still | live | poster).

  products: a Map from element to controller (setColor(id), setView(v), setScene(s), pause(), resume(),
  step(on), set(params), setPalette(p | null), destroy()); after a theme switch call setPalette(null) on each.
*/
import { loadProduct } from './build.js';

export const products = new Map();
const claimed = new WeakSet();
const json = s => { try { return s ? JSON.parse(s) : {}; } catch (_) { console.warn('product-render: bad JSON', s); return {}; } };
function placeOf(el) {
  const p = el.dataset.productPlace;
  if (p) return p;
  const box = el.closest('.frame, .panel, .panel__screen');
  if (!box || box === el) return el.matches('.frame') ? 'hero' : 'none';
  if (box.matches('.panel--top, .frame--square, .frame--portrait')) return 'tile';
  if (box.matches('.panel, .panel__screen')) return 'card';
  return 'hero';
}
const cache = new Map();
const productOf = el => {
  const url = new URL(el.dataset.product, document.baseURI).href;
  if (!cache.has(url)) cache.set(url, loadProduct(url));
  return cache.get(url);
};
// the frame's own attributes, as mount options
function optsOf(el) {
  const d = el.dataset, o = { place: placeOf(el), params: json(d.productParams) };
  if (d.productView) o.view = d.productView;
  if (d.productScene) o.scene = d.productScene;
  if (d.productColor) o.color = d.productColor;
  if (d.productMode) o.mode = d.productMode;
  if (d.productFill) o.fill = +d.productFill;
  if (d.productPalette) o.palette = json(d.productPalette);
  return o;
}
// a changed attribute shows that variant on the mounted frame
const ATTRS = ['data-product-color', 'data-product-view', 'data-product-scene'];
const watcher = typeof MutationObserver === 'undefined' ? null : new MutationObserver(list => {
  for (const m of list) {
    const ctrl = products.get(m.target), v = m.target.getAttribute(m.attributeName);
    if (!ctrl || v == null) continue;
    if (m.attributeName === 'data-product-color' && v !== ctrl.color) ctrl.setColor(v);
    else if (m.attributeName === 'data-product-view' && v !== ctrl.view) ctrl.setView(v || 'three-quarter');
    else if (m.attributeName === 'data-product-scene' && v !== (ctrl.scene || '')) ctrl.setScene(v || null);
  }
});
function apply(el, d = {}) {
  if (d.color != null) el.setAttribute('data-product-color', d.color);
  if (d.view != null) el.setAttribute('data-product-view', d.view);
  if (d.scene != null) el.setAttribute('data-product-scene', d.scene);
}
export async function mountAll(root = document) {
  const els = [...root.querySelectorAll('[data-product]')].filter(el => !claimed.has(el));
  els.forEach(el => claimed.add(el));
  await Promise.all(els.map(async el => {
    try {
      const product = await productOf(el);
      products.set(el, product.mount(el, optsOf(el)));
      watcher?.observe(el, { attributes: true, attributeFilter: ATTRS });
      el.addEventListener('product:set', e => { if (e.detail) apply(el, e.detail); });
    } catch (e) { console.error('product-render:', el.dataset.product, e); el.dataset.productError = String(e.message || e).split('\n')[0]; }
  }));
  return products;
}

// swatches: an order card's colour inputs or buttons drive the frames they name
function swatch(e) {
  const s = e.target.closest?.('[data-product-swatch]');
  if (!s) return;
  if (e.type === 'click' && s.matches('input, select')) return;   // an input reports on change
  if (s.matches('input[type=radio], input[type=checkbox]') && !s.checked) return;
  const color = s.dataset.productSwatchValue || s.value;
  if (!color) return;
  targets(s.dataset.productSwatch, color).forEach(el => apply(el, { color }));
  if (s.matches('button, [role=button]')) {
    // one pressed swatch in its group
    const group = s.closest('[role=radiogroup], fieldset, [data-product-swatches]') || s.parentElement;
    group?.querySelectorAll('[data-product-swatch]').forEach(b => { if (b.matches('button, [role=button]')) b.setAttribute('aria-pressed', String(b === s)); });
  }
}
function targets(sel, color) {
  if (sel) { try { return [...document.querySelectorAll(sel)].filter(el => el.hasAttribute('data-product')); } catch (_) { return []; } }
  return [...products.entries()].filter(([, c]) => c.colors?.some(x => x.id === color)).map(([el]) => el);
}
if (typeof document !== 'undefined') {
  document.addEventListener('change', swatch);
  document.addEventListener('click', swatch);
  document.addEventListener('product:set', e => {
    if (e.target !== document || !e.detail) return;
    const { target, ...d } = e.detail;
    (target ? targets(target) : d.color ? targets('', d.color) : [...products.keys()]).forEach(el => apply(el, d));
  });
}
/** resolves with products once the page's first mount is done */
export const ready = typeof document === 'undefined' ? Promise.resolve(products)
  : document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', () => r(mountAll()), { once: true }))
  : mountAll();
export default { mountAll, products, ready };
