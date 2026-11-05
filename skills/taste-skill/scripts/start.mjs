#!/usr/bin/env node
/*
  taste-skill start.mjs - deals colours and type, then prints the Google Fonts link, the six stylesheet links
  and the :root block. library/type.json is the one source of every face, weight, tracking and size.

  node scripts/start.mjs deal --page <kind> [--history .taste-skill/history.json] [--dark|--light] [--axis]
                               [--types-only]
      three palettes and three type pairings for that kind of page, at random, away from the recent ones,
      weighted by how well each face suits the kind (the Figma and x.ai faces first on tech and software).
      --page is required. A place is dealt one serif, one plain sans and one soft sans. Add --axis when
      the hero is a word or editorial one: it keeps only faces with a weight or width axis.
  node scripts/start.mjs css --page <kind> --palette <id> --type <id> [--radius sharp|soft|round]
                             [--no-mono|--mono] [--force] [--history <file>]
      prints the Google Fonts link, the six stylesheet links in their order, and the :root block (palette,
      --font-display, --font-text, --font-mono, --display-weight, --display-tracking, --display-tracking-xl,
      --display-stretch, --display-axes, --ly-scale), and records the choice in the history. A pairing that
      is not on the kind's list stops (exit 2) unless --force.
  node scripts/start.mjs brand --page <kind> --bg "#.." --ink "#.." --accent "#.." [--surface "#.."] [--muted "#.."] --type <id>
      the same block from a client's own colours
  node scripts/start.mjs types --page <kind>
      every pairing the kind can be dealt, with its exact Google Fonts link

  --page, the SKILL.md kinds as start.mjs names them:
      Tech (software, an app, AI, developer tools, fintech) ......... software
      Technical product (hardware, a device, a technical product) ... tech
      Gaming ........................................................ gaming
      Product (any other product or brand) .......................... product
      Service (people are hired) .................................... service
      Place (people come to it) ..................................... place
  tech, software and gaming take display 500 and a mono face (the UI fragments use it as --font-mono).
  A product page prints a mono only with --mono (an app or code is shown); service and place never.
  Every face is on Google Fonts and every printed value comes from type.json: keep the block as printed.
  Weights: display 400 (500 on tech, software and gaming), text 400, 500 for buttons, labels, card titles
  and strong; 600 is loaded only for the nav's initial tile (system.css), never 700 or 800. A static face
  such as Instrument Serif has one weight: set that tile in var(--display-weight). --kind is the same
  flag as --page. --google is accepted and changes nothing.
  The six links come first and the <style> after them: layout.css resets --ly-scale to 1 when it is
  linked after the :root block.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { color } from '../assets/effects/fx.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = f => JSON.parse(fs.readFileSync(path.join(here, '..', 'library', f), 'utf8'));
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };

// company-site palettes: quiet grounds
const isViolet = c => { const [, C, h] = color.lch(c); return C > 0.05 && h > 275 && h < 330; };
const paletteOk = p => color.chroma(p.bg) < 0.045 && !isViolet(p.accent) && !p.tags.includes('flat-loud');

const palettes = lib('palettes.json').filter(paletteOk);

// the history file is shared with moments.mjs and others: keep their keys, make sure ours exist
function readHistory(file) {
  let h = {};
  try { h = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* none yet */ }
  if (!h || typeof h !== 'object' || Array.isArray(h)) h = {};
  for (const k of ['palettes', 'types', 'dealt']) if (!Array.isArray(h[k])) h[k] = [];
  return h;
}
function writeHistory(file, h) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(h, null, 2));
}
function draw(list, n, recent) {
  const fresh = list.filter(x => !recent.includes(x.id));
  const pool = (fresh.length >= n ? fresh : list).slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
}

// make grey text readable on both grounds (4.5:1), keep its hue
function readableMuted(muted, ink, grounds) {
  let m = muted;
  for (let i = 0; i < 40 && grounds.some(g => color.contrast(m, g) < 4.6); i++) m = color.mix(m, ink, 0.08);
  return m;
}
function buttonInk(accent, ...cands) { return color.readable(accent, ...cands); }

function tokens(p) {
  const bg = color.hex(p.bg), ink = color.hex(p.ink);
  const surface = color.hex(p.surface || color.mix(bg, ink, 0.05));
  const muted = readableMuted(color.hex(p.muted || color.mix(ink, bg, 0.45)), ink, [bg, surface]);
  const accent = color.hex(p.accent || ink);
  const accentInk = color.contrast(accent, p.accentInk || bg) >= 4.5 ? color.hex(p.accentInk || bg) : buttonInk(accent, '#ffffff', '#111111', ink, bg);
  // the one inverse band: a dark field of the palette when there is one, else the ink
  const dark = color.isDark(bg);
  const field = (p.fields || []).map(f => f.bg).find(c => dark ? !color.isDark(c) : color.lab(c)[0] < 0.4);
  const invBg = color.hex(field || ink);
  const invInk = color.contrast(invBg, bg) >= 7 ? bg : color.readable(invBg, '#ffffff', '#111111');
  const invSurface = color.mix(invBg, invInk, 0.07);
  const invMuted = readableMuted(color.mix(invInk, invBg, 0.38), invInk, [invBg, invSurface]);
  const invAccent = color.contrast(accent, invBg) >= 3 && (color.chroma(invBg) < 0.03 || color.hueDistance(accent, invBg) > 20) ? accent : invInk;
  const invAccentInk = invAccent === accent ? accentInk : invBg;
  // buttons and links: the accent when it stands out from the ground, else the ink
  const action = color.contrast(accent, bg) >= 2.2 ? accent : ink;
  const actionInk = action === accent ? accentInk : bg;
  const invAction = color.contrast(invAccent, invBg) >= 2.2 ? invAccent : invInk;
  const invActionInk = invAction === invAccent ? invAccentInk : invBg;
  return { bg, surface, ink, muted, accent, accentInk, action, actionInk, invBg, invSurface, invInk, invMuted, invAccent, invAccentInk, invAction, invActionInk };
}

// ---------------------------------------------------------------- type
const PAGES = ['tech', 'software', 'gaming', 'product', 'service', 'place'];
const ALIAS = { other: 'service', 'technical-product': 'tech', technical: 'tech', hardware: 'tech', device: 'tech',
  app: 'software', ai: 'software', dev: 'software', developer: 'software', fintech: 'software', saas: 'software',
  game: 'gaming', games: 'gaming', brand: 'product', shop: 'product', studio: 'service', firm: 'service' };
const TECH = new Set(['tech', 'software', 'gaming']);
const pageArg = opt('page', opt('kind', undefined));
let page = typeof pageArg === 'string' ? pageArg.toLowerCase() : '';
page = ALIAS[page] || page;
if (page && !PAGES.includes(page)) { console.error(`start: --page must be one of ${PAGES.join(', ')} (got "${pageArg}")`); process.exit(2); }
if (cmd === 'deal' && !page) {
  console.error(`start: deal needs --page <${PAGES.join('|')}>: the kind decides which faces are dealt, the display weight and the mono.\n  Tech (software, apps, AI, fintech) = software; technical product (hardware) = tech; add --axis for a word or editorial hero.\n  node scripts/start.mjs deal --page <kind> [--axis] --history .taste-skill/history.json`);
  process.exit(2);
}
let placePage = page === 'place';
let techPage = TECH.has(page);
const setPage = p => { page = p; placePage = p === 'place'; techPage = TECH.has(p); };
const GROUPS = { serif: 'a serif', plain: 'a plain sans', soft: 'a soft sans' };

const allTypes = lib('type.json');
function suits(t, p) {
  if (!p) return Object.values(t.kinds || {}).some(n => n > 0) || !!t.place;
  if (p === 'place') return !!t.place;
  return (t.kinds || {})[p] > 0;
}
const weightOf = t => techPage ? t.display.tech : 400;
const kindWeight = (t, p) => p === 'place' ? 1 : ((t.kinds || {})[p] || 1);
// the kind a pairing is first meant for (when a caller leaves --page out of css or brand)
const inferPage = t => (t.place && !Object.values(t.kinds || {}).some(n => n > 0)) ? 'place'
  : PAGES.filter(p => p !== 'place').sort((a, b) => ((t.kinds || {})[b] || 0) - ((t.kinds || {})[a] || 0))[0];
// a Google mono when a face has none of its own (tech pages, or --mono)
const DEFAULT_MONO = { family: 'JetBrains Mono', w: [400, 500] };
const monoOf = t => (!placePage && !opt('no-mono') && (techPage || opt('mono'))) ? (t.mono || DEFAULT_MONO) : null;

// the Google Fonts CSS2 link: one request, the exact axes, display=swap
const axisVal = r => (r[0] === r[1] ? String(r[0]) : r[0] + '..' + r[1]);
const isLower = x => x[0] === x[0].toLowerCase();
const axisOrder = (a, b) => (isLower(a) !== isLower(b) ? (isLower(a) ? -1 : 1) : (a < b ? -1 : a > b ? 1 : 0));
function fontLink(t) {
  const letters = !placePage && t.display.letters;
  const fam = new Map();
  const add = (f, isDisplay) => {
    if (!f) return;
    const e = fam.get(f.family) || { axes: {}, statics: new Set(), variable: false };
    fam.set(f.family, e);
    if (f.w) {
      e.variable = true;
      // the letters moment lifts the weight by 200 on a face with a weight axis: load 700 for it
      const w = isDisplay && letters === 'wght' ? [f.w[0], 700] : f.w;
      const put = (k, r) => { const c = e.axes[k]; e.axes[k] = c ? [Math.min(c[0], r[0]), Math.max(c[1], r[1])] : r; };
      put('wght', w);
      for (const k of ['wdth', 'opsz', 'SOFT', 'WONK']) if (f[k]) put(k, f[k]);
    } else if (f.s && f.s.length) f.s.forEach(x => e.statics.add(x));
  };
  add(t.display, true); add(t.text, false);
  add(monoOf(t), false);
  const parts = [];
  for (const [name, e] of fam) {
    const nm = name.replace(/ /g, '+');
    if (e.variable) {
      const keys = Object.keys(e.axes).sort(axisOrder);
      parts.push(`${nm}:${keys.join(',')}@${keys.map(k => axisVal(e.axes[k])).join(',')}`);
    } else if (e.statics.size) parts.push(`${nm}:wght@${[...e.statics].sort().join(';')}`);
    else parts.push(nm);
  }
  return 'https://fonts.googleapis.com/css2?' + parts.map(p => 'family=' + p).join('&') + '&display=swap';
}

const stack = (f, serif) => `"${f.family}", ${serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
function typeVars(t) {
  const clamp = v => Math.max(-0.045, Math.min(0, v));
  const w = Math.max(400, Math.min(techPage ? 500 : 400, weightOf(t) || 400));
  const serif = t.class === 'serif' || t.class === 'slab';
  return {
    w, tr: clamp(t.display.tracking), trXl: clamp(t.display.trackingXl ?? t.display.tracking),
    stretch: placePage ? '100%' : (t.display.stretch || '100%'), axes: t.display.axes || '',
    scale: placePage ? 1 : (t.display.scale || 1),
    display: stack(t.display, serif), text: stack(t.text, false),
    mono: monoOf(t) ? `"${monoOf(t).family}", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` : '',
    link: fontLink(t),
  };
}
const FONT_TAGS = link => `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${link}" rel="stylesheet">`;

function block(tk, ty, radius) {
  const lines = [
    `  --font-display: ${ty.display};`,
    `  --font-text: ${ty.text};`,
    ...(ty.mono ? [`  --font-mono: ${ty.mono};`] : []),
    `  --display-weight: ${ty.w};`,
    `  --display-tracking: ${ty.tr}em;`,
    ...(placePage ? [] : [`  --display-tracking-xl: ${ty.trXl}em;`]),
    ...(ty.stretch !== '100%' ? [`  --display-stretch: ${ty.stretch};`] : []),
    ...(ty.axes ? [`  --display-axes: ${ty.axes};`] : []),
    ...(ty.scale !== 1 ? [`  --ly-scale: ${ty.scale};`] : []),
  ];
  return `${FONT_TAGS(ty.link)}
<link rel="stylesheet" href="assets/system.css">
<link rel="stylesheet" href="assets/ui/cards.css">
<link rel="stylesheet" href="assets/motion/motion.css">
<link rel="stylesheet" href="assets/backgrounds/backgrounds.css">
<link rel="stylesheet" href="assets/layout/layout.css">
<link rel="stylesheet" href="assets/icons/icon.css">
<!-- <html lang="en" data-radius="${radius}">; keep this <style> after the links: layout.css resets --ly-scale -->
<style>
:root {
  --p-bg: ${tk.bg}; --p-surface: ${tk.surface}; --p-ink: ${tk.ink}; --p-muted: ${tk.muted};
  --p-accent: ${tk.accent}; --p-accent-ink: ${tk.accentInk}; --p-action: ${tk.action}; --p-action-ink: ${tk.actionInk};
  --p-inv-bg: ${tk.invBg}; --p-inv-surface: ${tk.invSurface}; --p-inv-ink: ${tk.invInk}; --p-inv-muted: ${tk.invMuted};
  --p-inv-accent: ${tk.invAccent}; --p-inv-accent-ink: ${tk.invAccentInk}; --p-inv-action: ${tk.invAction}; --p-inv-action-ink: ${tk.invActionInk};
${lines.join('\n')}
}
</style>`;
}

// ---------------------------------------------------------------- dealing
function wpick(items, wf) {
  const tot = items.reduce((n, x) => n + wf(x), 0);
  let r = Math.random() * tot;
  for (const x of items) { r -= wf(x); if (r <= 0) return x; }
  return items[items.length - 1];
}
function dealTypes(h, { axis = false } = {}) {
  const pool = allTypes.filter(t => suits(t, page) && (!axis || t.display.letters));
  const used = (h.types || []).slice(-3), dealt = (h.dealt || []).slice(-3);
  const out = [];
  if (placePage) {
    const seen = [...(h.types || []).slice(-6), ...dealt];
    for (const g of Object.keys(GROUPS)) {
      const gp = pool.filter(t => t.place === g);
      const gf = gp.filter(t => !seen.includes(t.id));
      const pick = wpick(gf.length ? gf : gp, () => 1);
      if (pick) out.push(pick);
    }
    return out;
  }
  // the kind's weight counts cubed (3 is 27 times a 1) and a recent face is only dimmed, never removed:
  // the faces that suit the kind keep coming up, a pairing just built or dealt rests
  const recency = t => used.includes(t.id) ? 0.15 : dealt.includes(t.id) ? 0.5 : 1;
  let src = pool.slice();
  const cls = new Set();
  while (out.length < 3 && src.length) {
    const pick = wpick(src, t => kindWeight(t, page) ** 3 * recency(t) * (cls.has(t.class) ? 0.15 : 1));
    out.push(pick); cls.add(pick.class);
    src = src.filter(t => t.id !== pick.id);
  }
  return out;
}
const pc = n => (Math.round(n * 1000) / 10) + '%';
function describe(t, withLink) {
  const mono = monoOf(t) ? ` + ${monoOf(t).family}` : '';
  const fams = t.display.family === t.text.family ? t.display.family : `${t.display.family} / ${t.text.family}`;
  const axis = placePage ? '' : (t.display.letters ? `, axis ${t.display.letters}` : ', static');
  const tag = placePage ? GROUPS[t.place] : t.class;
  const trk = placePage ? '' : `, tracking ${pc(t.display.trackingXl ?? t.display.tracking)} at hero size`;
  let s = `  ${t.id.padEnd(18)} ${fams}${mono}  (${tag}; display ${weightOf(t) || 400}${trk}${axis}; ${t.moods.join(', ')})\n      suits: ${t.suits}`;
  if (withLink) s += `\n      ${fontLink(t)}`;
  return s;
}

const histFile = opt('history', '.taste-skill/history.json');

if (cmd === 'deal') {
  const h = readHistory(histFile);
  const tys = dealTypes(h, { axis: !!opt('axis') });
  if (!opt('types-only')) {
    let pals = palettes;
    if (!techPage && page) pals = pals.filter(p => !color.isDark(p.bg)); // dark pages are tech only
    if (opt('dark')) pals = pals.filter(p => color.isDark(p.bg));
    if (opt('light')) pals = pals.filter(p => !color.isDark(p.bg));
    console.log('PALETTES (pick the one that suits the brand; ignore its "note" about layout):');
    for (const p of draw(pals, 3, h.palettes.slice(-12))) {
      const tk = tokens(p);
      console.log(`  ${p.id.padEnd(26)} ${p.name}  bg ${tk.bg} surface ${tk.surface} ink ${tk.ink} accent ${tk.accent}  [${p.tags.join(', ')}]`);
    }
  }
  console.log(`TYPE for ${page} (all Google Fonts; headlines ${techPage ? '400 or 500' : '400'}, text 400, 500 for buttons and labels; sentence case, sizes come from system.css):`);
  for (const t of tys) console.log(describe(t, false));
  if (!tys.length) console.log('  (no pairing matches; drop --axis)');
  h.dealt = [...(h.dealt || []), ...tys.map(t => t.id)].slice(-30);
  if (!opt('no-record')) writeHistory(histFile, h);
  if (!opt('axis') && !placePage) console.log('  (a word or editorial hero needs a weight or width axis: deal again with --axis)');
  console.log(`\nthen: node scripts/start.mjs css --page ${page} --palette <id> --type <id> --radius soft --history ${histFile}`);
} else if (cmd === 'types') {
  for (const t of allTypes.filter(t => suits(t, page))) console.log(describe(t, true));
} else if (cmd === 'css' || cmd === 'brand') {
  let typeId = opt('type');
  // a retired id such as hanken-medium still resolves to its pairing (the weight is the kind's now)
  if (typeof typeId === 'string' && !allTypes.some(x => x.id === typeId)) {
    const base = typeId.replace(/-(regular|medium|semibold|bold)$/, '');
    if (base !== typeId && allTypes.some(x => x.id === base)) { console.error(`start: note: --type ${typeId} is retired, using ${base}.`); typeId = base; }
  }
  const t = allTypes.find(x => x.id === typeId);
  if (!t) { console.error('start: --type <id> is required; ids: ' + allTypes.map(x => x.id).join(', ')); process.exit(1); }
  if (!page) {
    setPage(inferPage(t));
    console.error(`start: note: no --page, taking ${page} from the pairing (display weight, mono). Pass --page <${PAGES.join('|')}> so the block fits the page.`);
  } else if (!suits(t, page) && !opt('force')) {
    console.error(`start: ${t.id} is not on the ${page} list; pick one from: node scripts/start.mjs types --page ${page} (--force to use it anyway).`);
    process.exit(2);
  }
  let p;
  if (cmd === 'css') {
    p = lib('palettes.json').find(x => x.id === opt('palette'));
    if (!p) { console.error('start: --palette <id> from library/palettes.json is required'); process.exit(1); }
  } else {
    p = { bg: opt('bg'), ink: opt('ink'), accent: opt('accent'), surface: opt('surface', undefined), muted: opt('muted', undefined), fields: [] };
    if (typeof p.bg !== 'string' || typeof p.ink !== 'string' || typeof p.accent !== 'string') { console.error('start: brand needs --bg --ink --accent'); process.exit(1); }
  }
  const radius = ['sharp', 'soft', 'round'].includes(opt('radius')) ? opt('radius') : 'soft';
  console.log(block(tokens(p), typeVars(t), radius));
  if (cmd === 'css') {
    const h = readHistory(histFile);
    h.palettes.push(p.id); h.types.push(t.id);
    writeHistory(histFile, h);
  }
} else {
  console.log('usage: node scripts/start.mjs deal --page <kind> | css --page <kind> --palette <id> --type <id> [--radius soft] | brand --page <kind> --bg .. --ink .. --accent .. --type <id> | types --page <kind>\n  kind: ' + PAGES.join(' | '));
}
