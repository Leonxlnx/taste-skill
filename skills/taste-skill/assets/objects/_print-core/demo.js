/*
  The demo page every print-* object uses: the object full-bleed, its name and one plain line, and two
  switches (the print, the paper). URL: ?effect=halftone&paper=dark&size=0.8&x=0.2 (any param),
  ?place=card|tile|hero for a placement preset, ?fallback=1 for the no-WebGL2 path.
  window.__print = { obj, ctrl, meta } for tests.
*/
import { EFFECTS } from './print3d.js';

// four papers from the effects gallery: light, dark, colour, white
const PAPERS = {
  light:  { label: 'Sand',   bg: '#ddd6c6', surface: '#e8e2d5', ink: '#2a2a26', muted: '#59574e', accent: '#4f6238', accentInk: '#ffffff' },
  dark:   { label: 'Night',  bg: '#0a0d14', surface: '#131824', ink: '#e9edf3', muted: '#8891a1', accent: '#5ab9fc', accentInk: '#0a0d14' },
  colour: { label: 'Cobalt', bg: '#0034eb', surface: '#002fd6', ink: '#ffffff', muted: '#dfe4f2', accent: '#e9e34a', accentInk: '#111111' },
  white:  { label: 'Sheet',  bg: '#ffffff', surface: '#f6f6f4', ink: '#111111', muted: '#6b6b6b', accent: '#1a4be0', accentInk: '#ffffff' },
};
const EFFECT_LABEL = { render: 'Render', dither: 'Dither', halftone: 'Halftone', engrave: 'Engraving', ascii: 'Type' };

export async function demo(obj, base) {
  const q = new URLSearchParams(location.search);
  if (q.get('fallback') === '1') window.__printForceFallback = true;
  let meta = {};
  try { meta = await (await fetch(new URL('./meta.json', base))).json(); } catch (_) { /* the page still works */ }
  let paper = PAPERS[q.get('paper')] ? q.get('paper') : (meta.demo?.paper || 'light');
  const params = { ...(meta.demo?.params || {}) };
  for (const [k, v] of q) if (k in obj.params) params[k] = v;
  // a phone's tall stage: the object's width sets its size, so it takes more of the width
  if (!q.has('size') && !q.has('place') && innerWidth < innerHeight * 0.8) params.size = Math.min(0.96, (obj.params.size?.default ?? 0.78) * 1.22);

  document.title = obj.name;
  const root = document.createElement('main');
  root.className = 'pd';
  root.innerHTML = `
    <section class="pd-stage" aria-label="${obj.name}"></section>
    <header class="pd-head">
      <p class="pd-id">${obj.id}</p>
      <h1>${obj.name}</h1>
      <p class="pd-shows">${meta.line || meta.shows || ''}</p>
    </header>
    <aside class="pd-hint">${meta.hover || ''}${meta.step ? `<br>${meta.step}` : ''}</aside>
    <nav class="pd-bar" aria-label="Print and paper">
      <div class="pd-seg" role="group" aria-label="Print">${['render', ...EFFECTS.filter(e => e !== 'render')].map(e => `<button type="button" data-effect="${e}">${EFFECT_LABEL[e]}</button>`).join('')}</div>
      <div class="pd-seg" role="group" aria-label="Paper">${Object.entries(PAPERS).map(([k, p]) => `<button type="button" data-paper="${k}"><i style="background:${p.bg};border-color:${p.ink}"></i>${p.label}</button>`).join('')}</div>
    </nav>`;
  document.body.appendChild(root);
  const stage = root.querySelector('.pd-stage');

  const applyPaper = () => {
    const p = PAPERS[paper];
    for (const [k, v] of Object.entries({ bg: p.bg, surface: p.surface, ink: p.ink, muted: p.muted, accent: p.accent, 'accent-ink': p.accentInk })) document.documentElement.style.setProperty('--' + k, v);
    root.querySelectorAll('[data-paper]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.paper === paper)));
  };
  applyPaper();
  const ctrl = obj.mount(stage, { palette: PAPERS[paper], params, place: q.get('place') || undefined });
  const mark = () => root.querySelectorAll('[data-effect]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.effect === ctrl.params.effect)));
  mark();
  root.querySelector('.pd-bar').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.effect) { ctrl.set({ effect: b.dataset.effect, cell: 0 }); mark(); }
    if (b.dataset.paper) { paper = b.dataset.paper; applyPaper(); ctrl.setPalette(PAPERS[paper]); }
  });
  window.__print = { obj, ctrl, meta, papers: PAPERS };
  document.documentElement.dataset.ready = '1';
  return ctrl;
}
