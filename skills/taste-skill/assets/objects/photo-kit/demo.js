/*
  photo-kit/demo.js - the shared demo page of a photo object: three vetted photographs of different
  kinds (a product, a room, a building), each credited, in the light, dark or colour palette.

    demo(object, { blurb, notes: [[title, text] x3], photos: ['lamp', 'room', 'concrete'], params, per: { lamp: {...} } })

  Query: ?palette=light|dark|colour, ?solo=<photo key> (one picture filling the window),
  ?photos=lamp,room,platform, ?p={"cell":4} (params as JSON), ?clock=8 (frozen, for screenshots).
  window.__pk holds the mounted controllers (info.fps, replay()).
*/
import fx from '../../effects/fx.js';
import { photoCredit } from './photo.js';

const q = new URLSearchParams(location.search);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function demo(object, opts = {}) {
  const lib = await fetch(new URL('./photos.json', import.meta.url)).then(r => r.json());
  const byKey = Object.fromEntries(lib.photos.map(p => [p.key, p]));
  const solo = q.get('solo');
  const keys = solo ? [solo] : (q.get('photos') || '').split(',').filter(k => byKey[k]).concat(opts.photos || ['lamp', 'room', 'concrete']).slice(0, 3);
  const palette = ['light', 'dark', 'colour'].includes(q.get('palette')) ? q.get('palette') : opts.palette || 'light';
  let extra = {};
  try { extra = JSON.parse(q.get('p') || '{}'); } catch (_) { /* ignore */ }

  document.documentElement.dataset.palette = palette;
  // ?clock=8 freezes every object at 8 s with the entry done (screenshots: no frames run, hover still answers)
  if (q.has('clock')) fx.setClock(+q.get('clock'));
  // ?webgl1 tests the GLSL ES 1.00 path
  if (q.has('webgl1')) fx.config.forceWebGL1 = true;
  if (solo) document.body.classList.add('solo');
  document.title = object.name;

  const figs = keys.map((k, i) => {
    const p = byKey[k];
    return `<figure class="${i === 2 ? 'wide' : ''}">
      <div class="frame" data-key="${esc(k)}" role="img" aria-label="${esc(p.alt)}"></div>
      <figcaption><span><span class="kind">${esc(p.kind[0].toUpperCase() + p.kind.slice(1))}</span> &middot; ${esc(p.alt)}</span>
      <span class="credit">${photoCredit(p)}</span></figcaption>
    </figure>`;
  }).join('');
  const notes = (opts.notes || []).map(([h, t]) => `<div><h2>${esc(h)}</h2><p>${esc(t)}</p></div>`).join('');

  document.body.innerHTML = `<main class="page">
    <header class="top">
      <div>
        <p class="eyebrow"><b>Photo objects</b> &middot; a real photograph through an effect</p>
        <h1>${esc(object.name)}</h1>
        <p class="blurb">${esc(opts.blurb || '')}</p>
      </div>
      <div class="controls">
        <div class="seg" role="group" aria-label="Palette">
          ${['light', 'dark', 'colour'].map(n => `<button type="button" data-pal="${n}" aria-pressed="${n === palette}">${n[0].toUpperCase() + n.slice(1)}</button>`).join('')}
        </div>
        <button type="button" class="btn" data-replay>Replay</button>
      </div>
    </header>
    <section class="grid">${figs}</section>
    ${notes ? `<section class="notes">${notes}</section>` : ''}
  </main>`;

  const ctrls = [...document.querySelectorAll('.frame')].map(el => {
    const p = byKey[el.dataset.key];
    const params = { focusX: p.focus[0], focusY: p.focus[1], ...(opts.params || {}), ...((opts.per || {})[p.key] || {}), ...extra };
    const c = object.mount(el, { palette: fx.readPalette(el), src: new URL(p.file, import.meta.url).href, params });
    c.key = p.key;
    return c;
  });
  window.__pk = ctrls;

  document.querySelectorAll('[data-pal]').forEach(b => b.addEventListener('click', () => {
    document.documentElement.dataset.palette = b.dataset.pal;
    document.querySelectorAll('[data-pal]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const u = new URL(location.href);
    u.searchParams.set('palette', b.dataset.pal);
    history.replaceState(null, '', u);
    requestAnimationFrame(() => document.querySelectorAll('.frame').forEach((el, i) => ctrls[i].setPalette(fx.readPalette(el))));
  }));
  document.querySelector('[data-replay]')?.addEventListener('click', () => ctrls.forEach(c => c.replay && c.replay()));
  return ctrls;
}
