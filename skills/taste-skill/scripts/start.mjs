#!/usr/bin/env node
/*
  taste-skill start.mjs - deals colours and type, then prints the Google Fonts link, the six stylesheet links
  and the :root block. library/type.json is the one source of every face, weight, tracking and size.

  node scripts/start.mjs deal --page <kind> --trade <trade> [--history .taste-skill/history.json] [--dark|--light] [--axis]
                               [--types-only] [--no-recent]
      three palettes and three type pairings for that kind of page, at random, away from the recent ones,
      weighted by how well each face suits the kind (the Figma and x.ai faces first on tech and software).
      --page is required (--trade alone names it: a cafe is a place, a law firm a service). --trade deals
      the palettes made for the trade first (library/palettes.json "trades"), so two cafes do not share a
      ground and an accent; a place takes only palettes whose ground fits a place (light, low saturation).
      Take the first palette and the first pairing; the next only when the first clashes with the client's
      own logo or photographs, said on plan line 2 with the one sentence on why the palette fits the trade.
      A place is dealt one serif, one plain sans and one soft sans, the trade's group first. Add --axis when
      the hero is a word or editorial one: it keeps only faces with a weight or width axis.
      Trades: cafe, bakery, restaurant, hotel, wellness, studio, workshop, wedding, retail, law, clinic,
      agency, saas, devtool, fintech, ai, game, hardware, consumer-product (a brief's word works too:
      guesthouse, yoga studio, bike shop, florist, dentist, developer tool).
      Besides the --history file, the deals can be shared across folders: set TASTE_SKILL_RECENT=<file> and the
      deals of every build go in that one small file, so the next cafe in another folder is dealt other palettes.
      Unset (the default), nothing is written outside the project; --no-recent leaves the file out for one run.
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
  node scripts/start.mjs plan --page <kind> --trade <trade> [--type <page type>] [--has photo,ui,film,object,setting]
                              [--long] [--tone warm|editorial|product|tech|playful] [--axis] --history .taste-skill/history.json
      the whole deal in one block, for any model: it runs the dealers themselves (start.mjs deal for the palettes,
      the type and the LAYOUT block; assets/layout/deal.mjs for the hero; moments.mjs pick --scene deal for 2-3
      moments and 0-1 scene; effects.mjs pick for 0-1 effect) and deals the hero's entrance from
      assets/motion/meta.json by fit. It ends with PLAN: one line per part, each naming the file or recipe to copy.
      The hero's history goes to layout-history.json beside the --history file.

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
// fresh ones first in a random order, then the recent ones, the oldest first: n of them
function drawFresh(list, n, recent) {
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fresh = shuffle(list.filter(x => !recent.includes(x.id)));
  const stale = list.filter(x => recent.includes(x.id)).sort((a, b) => recent.lastIndexOf(a.id) - recent.lastIndexOf(b.id));
  return [...fresh, ...stale].slice(0, n);
}

// the deals of every build that shares one file (shared with photos.mjs): a page in a new folder starts with an empty
// --history, so without it two cafes built one after the other are dealt from the same start. Opt-in: only a path
// set in TASTE_SKILL_RECENT is read or written; by default nothing is written outside the project.
const RECENT_FILE = process.env.TASTE_SKILL_RECENT || null;
function readRecent() {
  if (!RECENT_FILE || opt('no-recent')) return null;
  try { const r = JSON.parse(fs.readFileSync(RECENT_FILE, 'utf8')); return r && typeof r === 'object' && !Array.isArray(r) ? r : {}; } catch { return {}; }
}
function writeRecent(r) {
  if (!r) return;
  try { fs.mkdirSync(path.dirname(RECENT_FILE), { recursive: true }); fs.writeFileSync(RECENT_FILE, JSON.stringify(r, null, 1) + '\n'); } catch { /* optional: never stop a deal over it */ }
}

// ---------------------------------------------------------------- trades
// library/palettes.json gives each palette the trades it is made for; --trade deals those first
const TRADES = ['cafe', 'bakery', 'restaurant', 'hotel', 'wellness', 'studio', 'workshop', 'wedding', 'retail', 'law', 'clinic',
  'agency', 'saas', 'devtool', 'fintech', 'ai', 'game', 'hardware', 'consumer-product'];
// a brief's word for its trade, the first rule that matches wins
const TRADE_WORDS = [
  [/wedding|bridal|\belope(?:ment)?s?\b/i, 'wedding'], [/bak(?:e|ery|er)|patisserie|boulangerie|sourdough|bread/i, 'bakery'],
  [/caf[eé]|coffee|espresso|barista|roast|tea ?room/i, 'cafe'], [/\b(?:brand|maker|manufacturer)s?\b/i, 'consumer-product'], [/restaurant|bistro|brasserie|trattoria|pizzeria|diner|\bbar\b|\bpub\b|wine|kitchen(?! ?(?:fitt|design|install|renovat|refit|cabinet|worktop))|eatery/i, 'restaurant'],
  [/hotel|guest ?house|\binn\b|lodge|hostel|b&b|bed and breakfast|cabin|holiday (?:home|rooms?)/i, 'hotel'],
  [/yoga|pilates|spa\b|sauna|massage|wellness|retreat|gym|fitness|bath ?house/i, 'wellness'],
  [/dentist|dental|clinic|physio|therap|doctor|medical|\bvet\b|optician|pharmac/i, 'clinic'],
  [/\blaw\b|\blaw ?firm|lawyer|solicitor|notary|legal|attorney|accountan|tax advis/i, 'law'],
  [/bike ?shop|repair|workshop|smith|joiner|carpent|\bfitters?\b|forge|garage|mechanic|letterpress|weav/i, 'workshop'],
  [/potter|ceramic|photo(?:graphy)? studio|studio/i, 'studio'],
  // an estate, travel or insurance agent is a service business, never an AI product
  [/agency|consult|architect|design firm|branding|marketing|\b(?:estate|travel|letting|insurance|property|recruitment|talent|booking) agents?\b|realtor|real estate/i, 'agency'],
  [/florist|bookshop|book ?store|boutique|shop|store|grocer|\bdeli\b|delicatessen|gift|homeware|retail/i, 'retail'],
  [/game|gaming/i, 'game'], [/fintech|bank|payment|invoic|accounting (?:app|software)|wallet|lending|payroll/i, 'fintech'],
  [/\bai\b|\bllms?\b|machine learning|\b(?:ai|language|ml|foundation) models?\b|\bai agents?\b|\bagentic\b/i, 'ai'], [/developer|dev ?tool|\bapi\b|\bsdk\b|\bcli\b|code|database|infra/i, 'devtool'],
  [/saas|software|\bapp\b|platform|dashboard/i, 'saas'],
  [/hardware|device|robot|drone|sensor|keyboard|camera|printer|charger/i, 'hardware'],
  [/product|brand|maker|bike|bicycle|chair|lamp|furniture|bottle|bag|shoe|skincare|cosmetic|apparel|kettle|tableware/i, 'consumer-product'],
];
// the kind a trade is when --page is left out (a yoga or pottery studio people visit is a place: pass --page place)
const TRADE_PAGE = { cafe: 'place', bakery: 'place', restaurant: 'place', hotel: 'place', wellness: 'place', studio: 'service',
  workshop: 'place', wedding: 'service', retail: 'place', law: 'service', clinic: 'service', agency: 'service', saas: 'software',
  devtool: 'software', fintech: 'software', ai: 'software', game: 'gaming', hardware: 'tech', 'consumer-product': 'product' };
const TRADE_NAME = { cafe: 'a cafe', bakery: 'a bakery', restaurant: 'a restaurant', hotel: 'a hotel or guesthouse', wellness: 'a wellness or yoga studio',
  studio: 'a studio', workshop: 'a workshop', wedding: 'a wedding business', retail: 'a shop', law: 'a law firm', clinic: 'a clinic', agency: 'an agency',
  saas: 'a software product', devtool: 'a developer tool', fintech: 'a fintech product', ai: 'an AI product', game: 'a game', hardware: 'hardware',
  'consumer-product': 'a consumer product' };
const tradeArg = opt('trade');
let trade = '';
if (typeof tradeArg === 'string') {
  const w = tradeArg.toLowerCase().trim();
  trade = TRADES.includes(w) ? w : (TRADE_WORDS.find(([re]) => re.test(w)) || [])[1] || '';
  if (!trade) { console.error(`start: --trade "${tradeArg}" names no trade; one of ${TRADES.join(', ')}`); process.exit(2); }
} else if (tradeArg === true) { console.error(`start: --trade needs a trade: ${TRADES.join(', ')}`); process.exit(2); }
// a place's ground (backgrounds.md, --g-main): light (0.80 or more), saturation 0.12 or less
const rgb01 = h => [1, 3, 5].map(i => parseInt(color.hex(h).slice(i, i + 2), 16) / 255);
const placeGround = p => { const c = rgb01(p.bg); return !color.isDark(p.bg) && color.lab(p.bg)[0] >= 0.8 && Math.max(...c) - Math.min(...c) <= 0.12; };
// plain words for a colour, for the one sentence on plan line 2 (why the palette fits the trade)
function hueWord(c) {
  const [L, C, h] = color.lch(c);
  if (C < 0.03) return L > 0.9 ? 'white' : L < 0.3 ? 'near-black' : 'grey';
  const name = h < 20 || h >= 345 ? (L < 0.55 ? 'deep rose' : 'pink') : h < 40 ? (L < 0.45 ? 'oxblood' : 'red') : h < 70 ? (L < 0.55 ? 'brown' : 'orange')
    : h < 95 ? (L < 0.6 ? 'ochre' : 'gold') : h < 115 ? 'yellow' : h < 135 ? (L > 0.85 ? 'lime' : 'olive') : h < 175 ? 'green' : h < 225 ? 'teal' : h < 275 ? (L < 0.4 ? 'navy' : 'blue') : 'magenta';
  return C < 0.06 ? 'muted ' + name : name;
}
function groundWord(c) {
  const [L, C, h] = color.lch(c);
  if (color.isDark(c)) return C < 0.02 ? 'near-black' : `dark ${hueWord(c).replace(/^muted /, '')}`;
  if (L > 0.985 && C < 0.006) return 'white';
  const warm = C > 0.004 && h > 30 && h < 115, cool = C > 0.004 && h > 180 && h < 280;
  return `${warm ? 'warm ' : cool ? 'cool ' : ''}${L > 0.95 ? 'off-white' : L > 0.88 ? 'stone' : 'putty'}`;
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
if (!page && trade) page = TRADE_PAGE[trade];   // --trade alone names the kind
if (page && !PAGES.includes(page)) { console.error(`start: --page must be one of ${PAGES.join(', ')} (got "${pageArg}")`); process.exit(2); }
if ((cmd === 'deal' || cmd === 'plan') && !page) {
  console.error(`start: deal needs --page <${PAGES.join('|')}> (or --trade <trade>): the kind decides which faces are dealt, the display weight and the mono.\n  Tech (software, apps, AI, fintech) = software; technical product (hardware) = tech; add --axis for a word or editorial hero.\n  node scripts/start.mjs deal --page <kind> --trade <trade> [--axis] --history .taste-skill/history.json`);
  process.exit(2);
}
let placePage = page === 'place';
let techPage = TECH.has(page);
const setPage = p => { page = p; placePage = p === 'place'; techPage = TECH.has(p); };

// the finish gate (scripts/gate.mjs) holds a build open from a deal until its checks pass. Only a deal arms it (a
// css or brand run restyles a page that may be finished): a folder with an open build keeps it, a folder one or two below
// an open build joins that one, any other gets a new one. The page is left to gate.mjs to find in this folder (or one
// below); gate.mjs --start names it.
if (cmd === 'deal') {
  try {
    const read = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return null; } };
    // an open build here, or one or two folders up (gate.mjs --start run in the session's folder, the site in site/ or
    // site/web/ of it): the nearest one is kept, so the folder never holds a second build that its PASS would not close
    const open = d => { const b = read(path.join(d, '.taste-skill', 'build.json')), g = read(path.join(d, '.taste-skill', 'gate.json'));
      return (b && typeof b === 'object' && typeof b.start === 'string') || (g && typeof g.start === 'string' && /^(active|fail|error)$/.test(g.status || '')); };
    const here = path.resolve('.'), up = [here, path.dirname(here), path.dirname(path.dirname(here))].filter((d, i, a) => a.indexOf(d) === i);
    const home = up.find(open) || here;
    const dot = path.join(home, '.taste-skill'), marker = path.join(dot, 'build.json');
    const m = read(marker);
    if (home !== here) console.error(`start: the finish gate is already armed in ${home}; this deal joins that build`);
    if (m && typeof m === 'object' && typeof m.start === 'string') {
      let changed = false;
      if (!m.kind && page) { m.kind = page; changed = true; }
      // a build joined from below whose page is not there yet names this folder as its page (gate.mjs reads a folder as
      // its index.html), so the gate finds a page two folders down too
      if (home !== here && !m.url && !(typeof m.page === 'string' && m.page && fs.existsSync(path.resolve(home, m.page)))) { m.page = path.relative(home, here).split(path.sep).join('/'); changed = true; }
      if (changed) fs.writeFileSync(marker, JSON.stringify(m, null, 1) + '\n');
    } else if (home === here) {
      fs.mkdirSync(dot, { recursive: true });
      fs.writeFileSync(marker, JSON.stringify({ page: null, dir: process.cwd(), kind: page || null, start: new Date().toISOString(), by: 'start.mjs',
        gate: path.join(path.dirname(fileURLToPath(import.meta.url)), 'gate.mjs') }, null, 1) + '\n'); // the gate that judges this build
      console.error(`start: the finish gate is armed in ${process.cwd()}; run start.mjs from the project folder (the one that holds the page)`);
    }
  } catch { /* the gate is optional: never stop a deal over it */ }
}
const GROUPS = { serif: 'a serif', plain: 'a plain sans', soft: 'a soft sans' };
const PLACE_GROUP = { bakery: 'serif', hotel: 'serif', restaurant: 'serif', wedding: 'serif', retail: 'plain', workshop: 'plain',
  studio: 'plain', clinic: 'plain', law: 'plain', agency: 'plain', wellness: 'soft', cafe: 'soft' };

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
    // the trade's group first (sections.md section 4, Look): a serif for a bakery or a guesthouse, a plain sans
    // for a shop, a workshop or a studio, a soft sans for a cafe; so the first pairing is the one to take
    const first = PLACE_GROUP[trade];
    for (const g of Object.keys(GROUPS).sort((a, b) => (b === first) - (a === first))) {
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

// ---------------------------------------------------------------- the layout deal (sections.md section 2)
// In testing every page of one kind had the same parts in the same order: one place hero, one close (a big
// button across the .wrap), the same visit split. So the parts a template fixes are dealt here with the
// palette and the pairing, each away from the last pages' (h.layout keeps the last ids per part).
const LISTS = {
  nav: { software: 'nav-mega|nav-cards|nav-centre', gaming: 'nav-mega|nav-centre|nav-cards', tech: 'nav-cards|nav-split|nav-mega',
    product: 'nav-cards|nav-split|nav-mega', service: 'nav-mega|nav-split|nav-centre', place: 'nav-split|nav-cards|nav-centre' },
  footer: { software: 'footer-dark|footer-statement|footer-columns', gaming: 'footer-dark|footer-statement', tech: 'footer-columns|footer-dark',
    product: 'footer-columns|footer-dark', service: 'footer-visit|footer-dark|footer-columns', place: 'footer-visit|footer-columns' },
  close: { software: 'close-type|close-word|close-split', gaming: 'close-word|close-type|close-split', tech: 'close-photo|close-type|close-word|close-split',
    product: 'close-photo|close-type|close-word|close-split', service: 'close-type|close-photo|close-split|close-word', place: 'close-photo|close-split|close-word|close-type' },
  buttons: { software: 'solid|pill|tonal|arrow', gaming: 'solid|pill|block', tech: 'arrow|solid|block|pill', product: 'arrow|solid|block|pill',
    service: 'solid|tonal|block|arrow', place: 'block|solid|arrow' },
  mark: { place: 'dots|arc|ring|petal|leaf|stack', '*': 'wordmark|initial|arc|ring|stack|dots' },
  // grounds: one or two bands from the palette on every page (tint: .ground-surface; dark: .ground-inverse; brand: .ground-brand)
  bands: { software: 'dark|tint|dark+tint', gaming: 'dark|dark+brand', tech: 'dark|brand|tint+dark', product: 'brand|dark|tint+brand|tint+dark',
    service: 'tint|dark|tint+dark|brand', place: 'tint|brand|tint+brand|tint+dark' },
};
// section compositions (system.css, compositions; sections-library.md, Compositions), a pool per section type
const COMPS = {
  offer: 'list-tall|split-7-5|split-5-7|strip|offset-pair',            // a menu, prices, services, repairs
  showcase: 'bleed-panel|offset-pair|three-up|mirrored|wall|story',      // the place, the work, the house, the product in use
  rooms: 'row|side|list-tall',                                           // rooms, goods, bouquets, models
  feature: 'split-7-5|split-5-7|mirrored|bleed-panel|offset-pair|three-up', // a product's or a service's point
  visit: 'split-6-6|mirrored|street-large|bleed-panel',
  form: 'form-photo|form-band|close-form',
  statement: 'statement-type|statement-short',
};
const KIND_COMPS = { software: ['feature', 'statement', 'form'], gaming: ['showcase', 'statement', 'form'], tech: ['feature', 'showcase', 'statement'],
  product: ['feature', 'showcase', 'rooms', 'statement'], service: ['offer', 'showcase', 'feature', 'visit', 'form'],
  place: ['visit', 'offer', 'showcase', 'rooms', 'form'] };
const COMP_WHAT = { offer: 'the offer (menu, prices, services)', showcase: 'the showcase (the place, the work, the house, in use)',
  rooms: 'rooms or goods', feature: 'each feature section', visit: 'the visit', form: 'the booking or order form', statement: 'a statement section' };
function dealLayout(h) {
  const L = (h.layout && typeof h.layout === 'object' && !Array.isArray(h.layout)) ? h.layout : (h.layout = {});
  const pick = (key, line, avoidLast = 1) => {
    const opts = line.split('|'), recent = (L[key] || []).slice(-avoidLast);
    const fresh = opts.filter(o => !recent.includes(o)), pool = fresh.length ? fresh : opts;
    const v = pool[Math.floor(Math.random() * pool.length)];
    L[key] = [...(L[key] || []), v].slice(-8);
    return v;
  };
  const k = page;
  const get = key => LISTS[key][k] || LISTS[key]['*'];
  const out = {};
  for (const key of ['nav', 'footer', 'close', 'buttons', 'mark']) out[key] = pick(`${k}:${key}`, get(key), key === 'close' ? 2 : 1);
  out.bands = pick(`${k}:bands`, get('bands'));
  console.log(`\nLAYOUT for ${k} (dealt away from the last pages; build exactly these, write them on plan line 2):`);
  console.log(`  nav ${out.nav} · footer ${out.footer} · close ${out.close} · buttons ${out.buttons} · mark ${out.mark}`);
  console.log(`  bands: ${out.bands.split('+').map(b => ({ tint: 'one tinted band (.ground-surface)', dark: 'one dark band (.ground-inverse, the palette\'s dark)', brand: 'one band in the accent (.ground-brand)' })[b]).join(' and ')}; never two bands side by side, never the hero`);
  const lines = [];
  for (const sec of KIND_COMPS[k] || []) {
    if (sec === 'feature') {
      const a = pick(`${k}:feature`, COMPS.feature, 2); let b = pick(`${k}:feature`, COMPS.feature, 2);
      for (let i = 0; b === a && i < 6; i++) b = pick(`${k}:feature`, COMPS.feature, 1);
      lines.push(`${COMP_WHAT.feature}: ${a}, then ${b} (no composition twice in a row)`);
    } else lines.push(`${COMP_WHAT[sec]}: ${pick(`${k}:${sec}`, COMPS[sec], 2)}`);
  }
  if (lines.length) {
    console.log('  compositions (markup: sections-library.md, Compositions; use only the sections the page has):');
    for (const l of lines) console.log('    ' + l);
  }
  console.log(`  ${out.close === 'close-type' ? 'close-type: the h2 large, the button at its own width (never across the .wrap)' : out.close}; a page whose last section is a form ends on close-form instead; the footer never repeats hours or a form printed above`);
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
    if (placePage) pals = pals.filter(placeGround);   // a place's ground: light and quiet (backgrounds.md, --g-main)
    // the palettes made for the trade first, away from this folder's last ones and (with TASTE_SKILL_RECENT) the trade's
    // last six in the shared file; topped up from the rest of the kind only when fewer than three are made for it
    const recent = readRecent();
    const key = trade || page;
    const shared = recent && recent.palettes && Array.isArray(recent.palettes[key]) ? recent.palettes[key] : [];
    const avoid = [...shared.slice(-6), ...h.palettes.slice(-12)];
    const fit = trade ? pals.filter(p => (p.trades || []).includes(trade)) : [];
    const dealt = drawFresh(fit, 3, avoid);
    if (dealt.length < 3) dealt.push(...drawFresh(pals.filter(p => !fit.includes(p)), 3 - dealt.length, avoid));
    console.log(trade
      ? `PALETTES for ${TRADE_NAME[trade]} (made for the trade; take the first, the next only when the first clashes with the client's own logo or photographs; ignore a "note" about layout):`
      : `PALETTES (take the first; --trade <trade> deals the palettes made for the trade; ignore a "note" about layout):`);
    for (const p of dealt) {
      const tk = tokens(p);
      const made = !trade ? `made for ${(p.trades || []).join(', ') || 'any trade'}` : (p.trades || []).includes(trade) ? `made for ${trade}` : `from the rest of the ${page} palettes: fewer than three are made for ${trade}`;
      console.log(`  ${p.id.padEnd(26)} ${p.name}  bg ${tk.bg} surface ${tk.surface} ink ${tk.ink} accent ${tk.accent}  [${p.tags.join(', ')}]`);
      console.log(`      ${groundWord(tk.bg)} ground, ${hueWord(tk.accent)} accent; ${made}`);
    }
    if (dealt.length) {
      const p = dealt[0], tk = tokens(p);
      console.log(`  plan line 2: "palette ${p.id}" and one sentence on why it fits ${trade ? TRADE_NAME[trade] : 'the client'}: what in the trade its ${groundWord(tk.bg)} ground and ${hueWord(tk.accent)} accent answer (the room, the material, the goods; never a fact the brief does not give)`);
    }
    if (recent && !opt('no-record')) {
      recent.palettes = recent.palettes && typeof recent.palettes === 'object' && !Array.isArray(recent.palettes) ? recent.palettes : {};
      recent.palettes[key] = [...shared, ...dealt.map(p => p.id)].slice(-12);
      writeRecent(recent);
    }
  }
  console.log(`TYPE for ${page}${placePage && PLACE_GROUP[trade] ? ` (${TRADE_NAME[trade]}: ${GROUPS[PLACE_GROUP[trade]]} first)` : ''} (take the first; all Google Fonts; headlines ${techPage ? '400 or 500' : '400'}, text 400, 500 for buttons and labels; sentence case, sizes come from system.css):`);
  for (const t of tys) console.log(describe(t, false));
  if (!tys.length) console.log('  (no pairing matches; drop --axis)');
  dealLayout(h);
  h.dealt = [...(h.dealt || []), ...tys.map(t => t.id)].slice(-30);
  if (!opt('no-record')) writeHistory(histFile, h);
  if (!opt('axis') && !placePage) console.log('  (a word or editorial hero needs a weight or width axis: deal again with --axis)');
  const self = fileURLToPath(import.meta.url).split(path.sep).join('/');
  console.log(`\nthen: node ${/\s/.test(self) ? `"${self}"` : self} css --page ${page} --palette <id> --type <id> --radius soft --history ${histFile}${placePage ? '\n  (the client\'s own colours, a painted shopfront or a logo the brief gives, in place of the palette: start.mjs brand)' : ''}`);
} else if (cmd === 'plan') {
  // one command for the whole deal: the dealers run as they are (never copied here), their output kept in full under
  // each heading, then PLAN sums it up one line a part with the file to copy from
  const { spawnSync } = await import('node:child_process');
  const { FIT, fitsKind } = await import('./moments.mjs');
  const skill = path.join(here, '..');
  const rel = p => p.split(path.sep).join('/');
  const run = (file, list) => {
    const r = spawnSync(process.execPath, [file, ...list], { encoding: 'utf8', cwd: process.cwd() });
    if (r.stderr && r.stderr.trim()) process.stderr.write(r.stderr);
    return (r.stdout || '').replace(/\s+$/, '');
  };
  const flag = k => (opt(k) === true ? ['--' + k] : []);
  const val = k => (typeof opt(k) === 'string' ? ['--' + k, opt(k)] : []);
  const histDir = path.dirname(histFile);
  const layoutHist = path.join(histDir, 'layout-history.json');
  const pageType = typeof opt('type') === 'string' ? opt('type')
    : ({ software: 'software', gaming: 'software', tech: 'product', product: 'product', service: 'service', place: 'place' })[page];
  const has = typeof opt('has') === 'string' ? opt('has')
    : ({ software: 'ui', gaming: 'setting', tech: 'photo', product: 'photo', service: 'photo', place: 'photo' })[page];

  // 1. palettes, type and the LAYOUT block (also arms the finish gate, as a deal always does)
  const dealOut = run(fileURLToPath(import.meta.url), ['deal', '--page', page, ...val('trade'), '--history', histFile, ...flag('axis'), ...flag('dark'), ...flag('light'), ...flag('no-recent')]);
  // 2. the hero
  const heroOut = run(path.join(skill, 'assets', 'layout', 'deal.mjs'), ['--type', pageType, '--has', has, '--history', layoutHist,
    ...(page === 'gaming' ? ['--kind', 'gaming'] : page === 'tech' ? ['--kind', 'tech'] : [])]);
  // 3. moments and the scene, by fit
  const momOut = run(path.join(here, 'moments.mjs'), ['pick', '--page', page, '--scene', 'deal', '--history', histFile, ...flag('long'), ...val('tone')]);
  // 4. the effect: tech kinds always deal one for the hero; a place, service or product page one quiet treatment
  //    about one page in three, on a band (effects-usage.md, The fit rule)
  const bg = (dealOut.match(/\bbg (#[0-9a-f]{6})/i) || [])[1];
  const ground = bg && color.isDark(bg) ? 'dark' : 'light';
  const fxRoll = techPage || Math.random() < 1 / 3;
  const fxOut = fxRoll ? run(path.join(here, 'effects.mjs'), ['pick', '--page', page, '--palette', ground, '--slots', techPage ? 'hero' : 'band',
    '--history', histFile, ...val('tone'), ...flag('tech-subject')]) : '';
  // 5. the hero's entrance from the deck (assets/motion/meta.json), by fit, what the hero has, away from the last two
  const deck = JSON.parse(fs.readFileSync(path.join(skill, 'assets', 'motion', 'meta.json'), 'utf8')).entrances || [];
  const heroId = (heroOut.match(/^hero: (\S+)/m) || [])[1] || '';
  const heroForm = (heroOut.match(/^\s*form: (\w+)/m) || [])[1] || '';
  const hasSet = new Set(has.split(','));
  const picture = hasSet.has('photo') || hasSet.has('film') || hasSet.has('object') || hasSet.has('setting') || /place|photo|film|product|editorial/.test(heroId);
  const meets = need => /window|ui/i.test(need) ? (hasSet.has('ui') || heroId === 'ui')
    : /moving|scene/i.test(need) ? (hasSet.has('film') || heroId === 'film')
    : /70%|half/i.test(need) ? picture && !/split/.test(heroForm || heroId)
    : /picture|photograph/i.test(need) ? picture : true;
  const h = readHistory(histFile);
  const lastEnter = Array.isArray(h.entrances) ? h.entrances.slice(-2) : [];
  const fitE = deck.filter(e => fitsKind(e, page, { tone: typeof opt('tone') === 'string' ? opt('tone') : undefined }) && (e.needs || []).every(meets) && e.id !== 'still');
  const freshE = fitE.filter(e => !lastEnter.includes(e.id));
  const poolE = freshE.length ? freshE : fitE.length ? fitE : deck.filter(e => e.default);
  const enter = poolE[Math.floor(Math.random() * poolE.length)] || { id: 'rise', sees: 'the h1 rises line by line', markup: 'data-enter' };
  h.entrances = [...(h.entrances || []), enter.id].slice(-8);
  if (!opt('no-record')) writeHistory(histFile, h);
  // grounds: a lit ground for tech (the old one-liner, now here); flat tokens and the dealt bands elsewhere
  const litGround = techPage ? ['sand', 'sky', 'sage'][Math.floor(Math.random() * 3)] : '';

  const head = t => console.log(`\n==== ${t} ${'='.repeat(Math.max(4, 72 - t.length))}`);
  head('PALETTES, TYPE, LAYOUT (start.mjs deal)'); console.log(dealOut);
  head('HERO (assets/layout/deal.mjs)'); console.log(heroOut);
  head('MOMENTS AND SCENE (moments.mjs pick --scene deal)'); console.log(momOut);
  head('EFFECT (effects.mjs pick)'); console.log(fxOut || '  none this page (a place, service or product page takes a quiet treatment about one page in three)');

  // the summary, read from the dealers' own lines
  const pal = (dealOut.match(/^ {2}([a-z0-9-]+) {2,}/m) || [])[1] || '?';
  const typ = (dealOut.match(/^TYPE[^\n]*\n {2}([a-z0-9-]+)/m) || [])[1] || '?';
  const lay = (dealOut.match(/nav (\S+) · footer (\S+) · close (\S+) · buttons (\S+) · mark (\S+)/) || []);
  const bands = (dealOut.match(/^ {2}bands: ([^;\n]+)/m) || [])[1] || 'flat';
  const compBlock = (dealOut.split(/^ {2}compositions \(.*$/m)[1] || '').split(/\n(?! {4})/)[0];
  const comps = [...compBlock.matchAll(/^ {4}(.+?): (.+)$/gm)].map(m => `${m[1]}: ${m[2]}`);
  const [, scene = '', sceneAt = ''] = momOut.match(/^scene (\S+) · ([^·\n]+?) ·/m) || [];
  const SCENE_AT = { hero: 'as the hero (the entrance becomes data-enter="still")', close: 'as the last section before the footer (the close row stays)', between: 'between two sections', statement: 'as a statement section' };
  const moments = [...momOut.matchAll(/^\d+\. (\S+)\s+\S+ · ([^·\n]+?) · (\w+)/gm)].map(m => ({ id: m[1], fits: m[2].trim(), intensity: m[3] }));
  const fx = (fxOut.match(/^\s*\d+\. (\w+)\s+(\S+)/m) || []);
  const skillRef = '<skill>';
  head('PLAN (write it on plan line 2 and in the comment at the top of <body>; build exactly this)');
  const L = [];
  L.push(`kind ${page} · page type ${pageType}${trade ? ` · trade ${trade}` : ''} · ${FIT[page] ? `fits tones ${FIT[page].tones.join('/')}, ${FIT[page].intensity.join('/')}${FIT[page].webgl ? ', WebGL' : ', no WebGL'}` : ''}`);
  L.push(`copy first   .taste-skill/copy.md from the block in references/copy.md (The copy notes); lint it: node ${skillRef}/scripts/copy-lint.mjs .taste-skill/copy.md`);
  L.push(`palette      ${pal}, type ${typ}: node ${skillRef}/scripts/start.mjs css --page ${page} --palette ${pal} --type ${typ} --radius ${page === 'place' ? 'sharp' : 'soft'} --history ${rel(histFile)}  (paste its block into the starter's head)`);
  L.push(`hero         ${heroId || '?'}${heroForm ? ` data-form="${heroForm}"` : ''}: copy only the <section class="hero ..."> of ${skillRef}/assets/layout/hero-${heroId || '<id>'}.html`);
  const enterMore = String(enter.markup || '').replace(/^data-enter(?:="[\w-]+")?\s*/, '').replace(/^\((.*)\)$/, '$1').trim();
  L.push(`entrance     data-enter="${enter.id}" on that hero section${enterMore ? `, ${enterMore}` : ''}: ${enter.sees}; references/motion.md, The entrance deck`);
  if (lay.length) {
    L.push(`nav          ${lay[1]} (starter.html NAV comment for its class)`);
    L.push(`close        ${lay[3]} (starter.html: <template data-part="${lay[3]}">, or the default close--type in the footer)`);
    L.push(`footer       ${lay[2]}${page === 'place' ? ' (links-visit template on a place)' : ''}`);
    L.push(`buttons      data-buttons="${lay[4]}" on <html> · mark data-mark="${lay[5]}" (or the client's logo)`);
  }
  L.push(`rhythm       ${bands}; every other section on the page ground`);
  L.push(`grounds      ${techPage ? `data-ground="${litGround}" on <html>; section grounds from references/backgrounds.md` : 'flat tokens and the bands above; no data-ground on <html>'}`);
  for (const c of comps) L.push(`composition  ${c}  (references/sections-library.md, Compositions)`);
  L.push(`reveals      automatic: each section's h2 and lead photograph rise once (motion.js); nothing to add, data-still on a section to keep it still`);
  const SLOT = { section: 'a content section', statement: 'a statement section', closing: 'the last section', hero: 'the hero', between: 'a section between two others' };
  const slotOf = f => { const s = f.split('/'); return SLOT[s.find(x => x !== 'hero') || s[0]] || 'a section'; };
  moments.forEach((m, i) => L.push(`moment ${i + 1}     ${m.id} in ${slotOf(m.fits)} of its own (${m.intensity})${i === 0 ? ', within the first three screens' : ''}: its [data-moment] element from ${skillRef}/assets/moments/${m.id}/demo.html inside a section built like assets/moments/_demo/in-page.html; references/moments.md`));
  if (!moments.length) L.push('moments      none dealt: run moments.mjs pick again (every page takes two)');
  L.push(`scene        ${scene ? `${scene} ${SCENE_AT[sceneAt.trim().split('/')[0]] || 'in a section of its own'}: copy the <section data-big-scene> of ${skillRef}/assets/scenes/${scene}/demo.html, link scenes.css and ${scene}/scene.css, load assets/scenes/scenes.js; references/scenes.md` : 'none this page'}`);
  L.push(`effect       ${fx[2] ? `${fx[2]} on the ${fx[1] === 'hero' ? 'hero (or its one [data-visual] frame when a photograph fills the hero)' : `${fx[1]}: one of the dealt bands`} (${skillRef}/assets/effects/${fx[2]}/demo.html; references/effects-usage.md)` : 'none'}`);
  L.push(`hover layer  automatic (motion.js): buttons, links, linked cards and photos; loops inside every card visual (references/motion.md)`);
  L.push(`then         build in a copy of starter.html, then: node ${skillRef}/scripts/gate.mjs index.html`);
  for (const l of L) console.log('  ' + l);
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
