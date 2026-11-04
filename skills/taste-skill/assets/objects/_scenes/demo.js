// demo.js - builds the demo page of a scene object from a small config (see any demo.html) and
// mounts the object in the hero and in each card. ?p=<palette id> picks the palette.
import { credits as creditsLine } from './kit.js';

export const PALETTES = [
  { id: 'stone', name: 'Stone', bg: '#dfdedb', surface: '#d3d2ce', ink: '#26251e', muted: '#5f5d55', accent: '#2456d6', accentInk: '#ffffff' },
  { id: 'white', name: 'White', bg: '#ffffff', surface: '#f3f3f1', ink: '#111111', muted: '#6b6b6b', accent: '#d92b21', accentInk: '#ffffff' },
  { id: 'graphite', name: 'Graphite', bg: '#18191b', surface: '#222427', ink: '#eff0f1', muted: '#9c9ea3', accent: '#ff4a1f', accentInk: '#18191b' },
  { id: 'night', name: 'Night', bg: '#0a0d14', surface: '#131824', ink: '#e9edf3', muted: '#8891a1', accent: '#5ab9fc', accentInk: '#0a0d14' },
  { id: 'cobalt', name: 'Cobalt', bg: '#0034eb', surface: '#002fd6', ink: '#ffffff', muted: '#dfe4f2', accent: '#e9e34a', accentInk: '#111111' },
];

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function demo(obj, cfg) {
  const q = new URLSearchParams(location.search);
  let pal = PALETTES.find(p => p.id === (q.get('p') || cfg.palette)) || PALETTES[0];
  const credits = cfg.credits || [];
  document.title = cfg.name || obj.name;
  document.body.innerHTML = `
  <header class="top"><div class="wrap">
    <b>${esc(obj.name)}</b><span class="kind">${esc(cfg.kind || 'Scene object')}</span>
    <div class="controls">
      <div class="seg" role="group" aria-label="Palette">${PALETTES.map(p => `<button type="button" data-p="${p.id}">${p.name}</button>`).join('')}</div>
      <div class="seg"><button type="button" data-act="pause" aria-pressed="false">Pause</button></div>
    </div>
  </div></header>
  <main class="wrap">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${esc(cfg.eyebrow)}</p>
        <h1>${esc(cfg.title)}</h1>
        <p class="lede">${esc(cfg.lede)}</p>
        <div class="actions"><a class="btn btn--primary" href="#cards">${esc(cfg.cta || 'See it in a card')}</a>${credits.length ? '<a class="btn" href="#credits">Credits</a>' : ''}</div>
      </div>
      <div class="panel${cfg.hero?.surface ? ' panel--surface' : ''}" data-obj="hero"></div>
    </section>
    <section class="sec" id="cards">
      <div class="sec-head"><h2>${esc(cfg.section?.title || 'In a card panel')}</h2><p>${esc(cfg.section?.text || '')}</p></div>
      <div class="cards">${(cfg.cards || []).map((c, i) => `
        <figure class="card${c.wide ? ' wide' : ''}"><div class="panel${c.surface ? ' panel--surface' : ''}" data-obj="card${i}"></div>
        <figcaption><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></figcaption></figure>`).join('')}
      </div>
    </section>
    ${credits.length ? `<footer class="credits" id="credits">${creditsLine(credits)}</footer>` : '<footer class="credits" aria-hidden="true"></footer>'}
  </main>`;

  const slots = [{ el: document.querySelector('[data-obj="hero"]'), ...(cfg.hero || {}) },
    ...(cfg.cards || []).map((c, i) => ({ el: document.querySelector(`[data-obj="card${i}"]`), ...c }))];
  const paletteFor = (s, p) => (s.surface ? { ...p, bg: p.surface, surface: p.bg } : p);
  let ctrls = [];
  const apply = p => {
    pal = p;
    const r = document.documentElement.style;
    r.setProperty('--bg', p.bg); r.setProperty('--surface', p.surface); r.setProperty('--ink', p.ink);
    r.setProperty('--muted', p.muted); r.setProperty('--accent', p.accent); r.setProperty('--accent-ink', p.accentInk);
    document.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === p.id)));
    const u = new URL(location.href); u.searchParams.set('p', p.id); history.replaceState(null, '', u);
  };
  const mountAll = () => {
    ctrls.forEach(c => c.destroy());
    ctrls = slots.map(s => obj.mount(s.el, { palette: paletteFor(s, pal), src: s.src, params: s.params || {} }));
    window.__objects = ctrls;
    return Promise.all(ctrls.map(c => c.ready || Promise.resolve()));
  };
  apply(pal);
  document.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => {
    const p = PALETTES.find(x => x.id === b.dataset.p);
    apply(p);
    ctrls.forEach((c, i) => (c.setPalette ? c.setPalette(paletteFor(slots[i], p)) : null));
    if (ctrls.some(c => !c.setPalette)) mountAll();
  }));
  const pauseBtn = document.querySelector('[data-act="pause"]');
  pauseBtn.addEventListener('click', () => {
    const on = pauseBtn.getAttribute('aria-pressed') !== 'true';
    pauseBtn.setAttribute('aria-pressed', String(on));
    pauseBtn.textContent = on ? 'Play' : 'Pause';
    ctrls.forEach(c => (on ? c.pause() : c.resume()));
  });
  await mountAll().catch(err => console.warn(err));
  if (document.fonts) await document.fonts.ready;
  document.documentElement.dataset.ready = '1';
}
