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
  node scripts/start.mjs plan --page <kind> [--trade <trade>] [--type <page type>]
      [--sections N] [--long] [--has photo,ui,film,object,setting,logo,art]
      [--carry words,list,photos,steps,figures] [--action booking|order|trial|visit|contact] [--last-section form]
      [--tone warm|editorial|product|tech|playful] [--axis] [--history .taste-skill/history.json]
      Deal the frame and four prompts for the content. Sections include the hero and close (default 7).
      The plan has one moment, two with --long or at least seven sections. --carry names what the
      copy notes hold. With no flag only place, product and service assume photos. --has names actual
      assets, including product for a photograph of the client's own product, archive for a large set,
      film for footage, route or site for those subjects. A booking docks a bar on a place or service hero.
      The printed PLAN and the machine-readable plan.json beside the history describe the same page.

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
import { writeHistory } from './moments.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = f => JSON.parse(fs.readFileSync(path.join(here, '..', 'library', f), 'utf8'));
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : true); };

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

function tokens(p, adjustSurface = true) {
  const bg = color.hex(p.bg), ink = color.hex(p.ink);
  const supplied = color.hex(p.surface || color.mix(bg, ink, 0.05));
  const distance = Math.abs(color.lab(supplied)[0] - color.lab(bg)[0]);
  const derived = adjustSurface && (distance < 0.04 || distance > 0.09);
  const surface = derived ? color.lighten(bg, color.isDark(bg) ? 0.06 : -0.06) : supplied;
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
  return { bg, surface, derived, ink, muted, accent, accentInk, action, actionInk, invBg, invSurface, invInk, invMuted, invAccent, invAccentInk, invAction, invActionInk };
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
if (cmd === 'deal' || cmd === 'plan') {
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
  grounds: { software: 'blocks|blocks|alternate|calm|islands', gaming: 'islands|islands|alternate|blocks|calm', tech: 'blocks|blocks|alternate|islands|calm',
    product: 'alternate|alternate|islands|blocks|calm', service: 'calm|calm|blocks|alternate|islands', place: 'calm|calm|islands|alternate|blocks' },
};
// section compositions (system.css, compositions; sections-library.md, Compositions), a pool per section type
const COMPS = {
  offer: 'list-tall|split-7-5|split-5-7|offset-pair',            // a menu, prices, services, repairs
  showcase: 'bleed-panel|offset-pair|three-up|mirrored|wall|story',      // the place, the work, the house, the product in use
  rooms: 'row|side|list-tall',                                           // rooms, goods, bouquets, models
  feature: 'split-7-5|split-5-7|mirrored|bleed-panel|offset-pair|three-up', // a product's or a service's point
  visit: 'split-6-6|mirrored|street-large',    // never bleed-panel: the visit comes right after a place's hero (sections-library.md)
  form: 'form-photo|form-band|close-form',
};
const KIND_COMPS = { software: ['feature', 'form'], gaming: ['showcase', 'form'], tech: ['feature', 'showcase'],
  product: ['feature', 'showcase', 'rooms'], service: ['offer', 'showcase', 'feature', 'visit', 'form'],
  place: ['visit', 'offer', 'showcase', 'rooms', 'form'] };
const COMP_WHAT = { offer: 'the offer (menu, prices, services)', showcase: 'the showcase (the place, the work, the house, in use)',
  rooms: 'rooms or goods', feature: 'each feature section', visit: 'the visit', form: 'the booking or order form' };
// compositions sections-library.md allows once a page (2.5.3: a showcase and a feature were both dealt bleed-panel)
const ONCE_A_PAGE = ['bleed-panel', 'mirrored'];
const sectionsArg = opt('sections', 7);
const sections = Number(sectionsArg);
const action = opt('action');
if (['plan', 'deal'].includes(cmd)) {
  if (sectionsArg === true || !Number.isSafeInteger(sections) || sections < 1) { console.error('start: --sections needs a positive integer'); process.exit(2); }
  if (action !== undefined && !['booking', 'order', 'trial', 'visit', 'contact'].includes(action)) { console.error('start: --action needs booking, order, trial, visit or contact'); process.exit(2); }
}

const groundCopy = {
  alternate: 'alternate page and tint from section 2, moving the inverse to the strongest picture',
  blocks: 'repeat two page sections and one tint, ending with an inverse close',
  islands: 'keep the page ground around two full-width islands, one inverse and one brand or tint',
  calm: 'change ground at the main picture and at the close when marked',
};
function groundsFor(pattern, n) {
  const bySection = Array(n).fill('page');
  const middle = Math.max(1, Math.floor((n - 1) / 2));
  if (pattern === 'alternate') {
    for (let i = 1; i < n; i += 2) bySection[i] = 'ground-surface';
    if (n > 2) bySection[middle] = 'ground-inverse';
  } else if (pattern === 'blocks') {
    for (let i = 2; i < n; i += 3) bySection[i] = 'ground-surface';
    if (n > 1) bySection[n - 1] = 'ground-inverse';
  } else if (pattern === 'islands') {
    if (n > 1) bySection[Math.max(1, Math.floor(n / 3))] = 'ground-inverse';
    if (n > 2) bySection[Math.min(n - 1, Math.ceil(n * 2 / 3))] = Math.random() < 0.5 ? 'ground-brand' : 'ground-surface';
  } else if (n > 1) {
    bySection[middle] = Math.random() < 0.5 ? 'ground-surface' : 'ground-inverse';
    if (n >= 5 && Math.random() < 0.5) bySection[n - 1] = 'ground-brand';
  }
  return { pattern, bySection };
}
function groundLine({ pattern, bySection }) {
  const map = bySection.map((g, i) => (i + 1) + ' ' + (g === 'page' ? g : '.' + g));
  return pattern + ' · ' + map.join(', ') + '. If the length changes, ' + groundCopy[pattern] + '.';
}
function dealIdeas(h) {
  const recent = (h.ideas || []).slice(-8);
  const pool = lib('ideas.json').filter(s => s.kinds.includes(page) && !recent.includes(s.id));
  if (pool.length < 4) throw new Error('too few fresh idea seeds for ' + page);
  const shuffled = drawFresh(pool, pool.length, []);
  const picks = [];
  while (picks.length < 4) {
    const ix = shuffled.findIndex(s => !picks.some(p => p.shape === s.shape));
    picks.push(shuffled.splice(Math.max(0, ix), 1)[0]);
  }
  h.ideas = [...recent, ...picks.map(s => s.id)].slice(-8);
  return picks;
}
function dealLayout(h) {
  const L = (h.layout && typeof h.layout === 'object' && !Array.isArray(h.layout)) ? h.layout : (h.layout = {});
  // not: options this page cannot take (a once-a-page composition already dealt, the feature's first one)
  const pick = (key, line, avoidLast = 1, not = []) => {
    const all = line.split('|'), opts = all.filter(o => !not.includes(o)), list = opts.length ? opts : all;
    const recent = (L[key] || []).slice(-avoidLast);
    const fresh = list.filter(o => !recent.includes(o)), pool = fresh.length ? fresh : list;
    const v = pool[Math.floor(Math.random() * pool.length)];
    L[key] = [...(L[key] || []), v].slice(-8);
    return v;
  };
  const k = page;
  const get = key => LISTS[key][k] || LISTS[key]['*'];
  const out = {};
  for (const key of ['nav', 'footer', 'close', 'buttons', 'mark']) out[key] = pick(`${k}:${key}`, get(key), key === 'close' ? 2 : 1);
  out.grounds = groundsFor(pick(`${k}:grounds`, get('grounds'), 2), sections);
  const densities = techPage ? 'compact|regular|compact|regular|open' : page === 'product' ? 'open|regular|compact' : 'open|regular|open|regular|compact';
  out.density = pick(`${k}:density`, densities);
  out.align = pick(`${k}:align`, 'left|centred heads on proof and close');
  out.pictures = pick(`${k}:pictures`, 'square|soft|soft with one shaped mask');
  out.compositions = {};
  const lines = [], used = [];
  const dealt = v => { if (ONCE_A_PAGE.includes(v)) used.push(v); return v; };
  for (const sec of KIND_COMPS[k] || []) {
    if (sec === 'feature') {
      const a = dealt(pick(`${k}:feature`, COMPS.feature, 2, used));
      const b = dealt(pick(`${k}:feature`, COMPS.feature, 2, [...used, a]));
      out.compositions.feature = [a, b];
      lines.push(`${COMP_WHAT.feature}: ${a}, then ${b} (no composition twice in a row)`);
    } else {
      const booking = action === 'booking' && (k === 'place' || k === 'service');
      const options = sec === 'form' && booking ? 'close-form' : COMPS[sec];
      const v = dealt(pick(`${k}:${sec}`, options, 2, used));
      out.compositions[sec] = v;
      // a form dealt as close-form is the page's close: no other close row beside it (2.5.3: close-photo and
      // close-form were both dealt, and one build made both, one after the other)
      if (sec === 'form' && v === 'close-form') { out.close = 'close-form'; L[`${k}:close`][L[`${k}:close`].length - 1] = 'close-form'; }
      lines.push(`${COMP_WHAT[sec]}: ${v}${v === 'close-form' ? ' (the form is the close)' : ''}`);
    }
  }
  if (cmd === 'plan') return out;
  console.log(`\nLAYOUT for ${k} (build the frame as dealt, choose section forms from the content):`);
  console.log(`  nav ${out.nav} · footer ${out.footer} · close ${out.close} · buttons ${out.buttons} · mark ${out.mark}`);
  console.log('  grounds: ' + groundLine(out.grounds));
  if (lines.length) {
    console.log('  compositions (markup: sections-library.md, Compositions; use only the sections the page has):');
    for (const l of lines) console.log('    ' + l);
  }
  console.log(`  ${out.close === 'close-type' ? 'close-type: the h2 large, the button at its own width (never across the .wrap)'
    : out.close === 'close-form' ? 'close-form: the booking or order form is the close, in the footer\'s close row; use one full form'
    : `${out.close}; a page whose last section is a form ends on close-form instead`}; the footer never repeats hours or a form printed above`);
  return out;
}

const histFile = opt('history', '.taste-skill/history.json');

function dealFrame(h) {
  let palette;
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
      palette = dealt[0];
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
  const layout = dealLayout(h);
  h.dealt = [...(h.dealt || []), ...tys.map(t => t.id)].slice(-30);
  if (cmd === 'deal' && !opt('axis') && !placePage) console.log('  (a word or editorial hero needs a weight or width axis: deal again with --axis)');
  const self = fileURLToPath(import.meta.url).split(path.sep).join('/');
  if (cmd === 'deal') console.log(`\nthen: node ${/\s/.test(self) ? `"${self}"` : self} css --page ${page} --palette <id> --type <id> --radius soft --history ${histFile}${placePage ? '\n  (the client\'s own colours, a painted shopfront or a logo the brief gives, in place of the palette: start.mjs brand)' : ''}`);
  return { palette, type: tys[0], layout };
}
if (cmd === 'deal') {
  const h = readHistory(histFile);
  dealFrame(h);
  if (!opt('no-record')) writeHistory(histFile, h);
} else if (cmd === 'plan') {
  const { spawnSync } = await import('node:child_process');
  const { randomBytes } = await import('node:crypto');
  const { FIT, fitsKind, HAS_BY_KIND, carryFor, momentSource, rideLine, textRule, rng } = await import('./moments.mjs');
  const skill = path.join(here, '..');
  const dir = path.dirname(histFile);
  const seed = String(opt('seed', randomBytes(8).toString('hex')));
  const requestedType = opt('type', ({ gaming: 'software', tech: 'product' })[page] || page);
  const pageType = requestedType === 'gaming' ? 'software' : requestedType;
  const tone = opt('tone');
  if (!['software', 'product', 'service', 'place'].includes(pageType)) throw new Error('invalid hero page type: ' + pageType);
  if (tone && !FIT[page].tones.includes(tone)) throw new Error('invalid tone for ' + page + ': ' + tone);
  const has = opt('has', HAS_BY_KIND[page].join(','));
  if (typeof has !== 'string') throw new Error('--has needs a comma-separated list of assets');
  const assets = new Set(String(has).split(',').map(s => s.trim()).filter(Boolean));
  const carry = carryFor(page, opt('carry'));
  const run = (file, args) => {
    const result = spawnSync(process.execPath, [file, ...args, '--json'], { encoding: 'utf8', windowsHide: true });
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error || result.status !== 0) throw result.error || new Error(path.basename(file) + ' failed (exit ' + result.status + ')');
    return JSON.parse(result.stdout);
  };
  const frameHistory = readHistory(histFile);
  const { palette, type, layout } = dealFrame(frameHistory);
  if (!palette || !type) throw new Error('no palette or pairing fits the requested flags');
  const { hero, form, peek, book, peekLine, bookLine } = run(path.join(skill, 'assets/layout/deal.mjs'), [
    '--type', pageType, '--kind', page, '--has', has, '--history', path.join(dir, 'layout-history.json'),
    ...(action ? ['--action', action] : []), ...(opt('no-record') ? ['--no-record'] : []),
  ]);
  const ownFormClose = opt('last-section') === 'form';
  const reserveClose = ownFormClose || layout.close === 'close-form';
  const common = ['--page', page, '--history', histFile, '--seed', seed, ...(tone ? ['--tone', tone] : []),
    ...(opt('no-record') ? ['--no-record'] : [])];
  const motion = run(path.join(here, 'moments.mjs'), ['pick', ...common, '--scene', 'deal', '--has', has,
    '--carry', [...carry].join(','), '--sections', String(sections), ...(opt('long') ? ['--long'] : []),
    ...(peek || book ? ['--keep-hero'] : []), ...(reserveClose ? ['--keep-close'] : []), ...(action ? ['--action', action] : [])]);
  const sceneHero = motion.sceneFits.includes('hero');
  const sceneClose = motion.sceneFits.includes('close');
  const effectSlot = page === 'gaming' ? 'band' : 'hero';
  const effect = techPage && !sceneHero ? run(path.join(here, 'effects.mjs'), ['pick', ...common, '--palette',
    color.isDark(palette.bg) ? 'dark' : 'light', '--slots', effectSlot]).picks[0]?.id || null : null;

  const h = readHistory(histFile);
  h.layout = frameHistory.layout;
  h.dealt = frameHistory.dealt;
  const deck = JSON.parse(fs.readFileSync(path.join(skill, 'assets/motion/meta.json'), 'utf8')).entrances;
  const picture = assets.has('art') || assets.has('photo') || assets.has('film') || assets.has('object') || ['place', 'split', 'photo', 'product', 'film'].includes(hero.id);
  const meets = need => /window|ui/i.test(need) ? hero.window && assets.has('ui')
    : /moving|scene/i.test(need) ? sceneHero || hero.id === 'film'
    : /70%|half/i.test(need) ? picture && (form || hero.id) !== 'split'
    : /photograph/i.test(need) ? assets.has('photo') : /picture/i.test(need) ? picture : true;
  const fit = deck.filter(e => e.id !== 'still' && (e.weight ?? 1) > 0 && fitsKind(e, page, { tone }) && e.needs.every(meets));
  const freshEntrances = fit.filter(e => !(h.entrances || []).slice(-2).includes(e.id));
  const pool = freshEntrances.length ? freshEntrances : fit;
  let ticket = Math.random() * pool.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  const entrance = sceneHero ? deck.find(e => e.id === 'still') : pool.find(e => (ticket -= e.weight ?? 1) < 0) || deck.find(e => e.default);
  h.entrances = [...(h.entrances || []), entrance.id].slice(-8);

  const closeMoment = motion.picks.find(p => p.fits.length === 1 && p.fits[0] === 'closing');
  const closeTaken = ownFormClose ? 'the final form section' : sceneClose ? motion.scene : closeMoment?.id;
  const order = action === 'order';
  const close = closeTaken ? null : order ? 'close-type' : layout.close;
  const comps = layout.compositions;
  if ((closeTaken || order) && comps.form === 'close-form') {
    comps.form = assets.has('photo') ? 'form-photo' : 'form-band';
    const forms = h.layout[page + ':form'];
    forms[forms.length - 1] = comps.form;
  }
  const closes = h.layout[page + ':close'];
  closes[closes.length - 1] = close;

  const ideas = dealIdeas(h);
  const sub = {};
  if (page === 'gaming' && !assets.has('art')) sub.illustrate = "draw the game's own world";
  if (['product', 'tech'].includes(page) && !assets.has('photo')) sub.illustrate = 'show the product itself in a built picture';
  if (['software', 'tech', 'service'].includes(page)) sub['data-picture'] = 'show a figure, range or comparison when the copy supplies one';
  if (['place', 'product', 'service'].includes(page) && assets.has('photo')) sub['image-direction'] = 'direct the crops and scale when the page carries six or more photographs';
  if (!assets.has('logo')) sub['brand-mark'] = 'draw a mark if the brief needs one, or use the dealt mark';
  if (['software', 'gaming', 'product'].includes(page) && !['clinic', 'law', 'hotel'].includes(trade)) {
    const mascot = rng(seed + ':mascot')() < 1 / 3;
    h.mascot = [...(h.mascot || []), { seed, dealt: mascot }].slice(-40);
    if (mascot) sub.mascot = 'give a recurring guide or character one consistent form';
  }
  const plan = {
    version: '2.5.4', kind: page, pageType, trade: trade || null, sections, palette: palette.id, type: type.id,
    hero: hero.id, ...(form ? { heroForm: form } : {}), heroPeek: peek, heroBook: book, entrance: entrance.id, nav: layout.nav, footer: layout.footer,
    close, buttons: layout.buttons, mark: layout.mark, grounds: layout.grounds, density: layout.density,
    align: layout.align, pictures: layout.pictures, compositions: comps, own: sections < 6 ? 1 : 2,
    ideas: ideas.map(s => s.id), sub: Object.keys(sub), moments: motion.picks.map(m => m.id), rides: motion.rides,
    scene: motion.scene, effect,
  };
  if (!opt('no-record')) writeHistory(histFile, h);
  writeHistory(path.join(dir, 'plan.json'), plan, 2);

  const ref = '<skill>';
  console.log('\n==== PLAN (build the frame as dealt: palette, type, hero, entrance, nav, footer, close, buttons, mark, grounds, density. Section forms come from the content.) ====');
  const line = (name, value) => console.log('  ' + name.padEnd(13) + value);
  line('kind', page + ' · page type ' + pageType + (trade ? ' · trade ' + trade : '') + ' · ' + sections + ' sections · ' + FIT[page].tones.join('/') + ' · ' + (techPage ? 'WebGL available' : 'no WebGL'));
  line('copy first', '.taste-skill/copy.md from references/copy.md. Lint it with node ' + ref + '/scripts/copy-lint.mjs .taste-skill/copy.md');
  line('palette', palette.id + ', type ' + type.id + ': node ' + ref + '/scripts/start.mjs css --page ' + page + ' --palette ' + palette.id + ' --type ' + type.id + ' --radius ' + (placePage ? 'sharp' : 'soft') + ' --history ' + histFile.split(path.sep).join('/'));
  line('hero', hero.id + (form ? ' data-form="' + form + '"' : '') + ': copy the hero section of ' + ref + '/assets/layout/' + hero.demo + (peek ? ' · ' + peekLine : '') + (sceneHero ? '. Use the dealt scene for the hero visual and entrance.' : ''));
  if (book) console.log('  ' + bookLine);
  if (order) line('order', 'put the configurator or order pad within the first three sections, with delivery and return facts at the close');
  const entranceDetail = entrance.markup.replace(/^data-enter(?:="[\w-]+")?\s*/, '').replace(/^\((.*)\)$/, '$1');
  line('entrance', 'data-enter="' + entrance.id + '" on the hero' + (entranceDetail && entrance.id !== 'rise' ? ' ' + entranceDetail : '') + '. ' + entrance.sees + ' (references/motion.md, The entrance deck)');
  line('nav', plan.nav + ' (starter.html NAV comment)');
  line('close', closeTaken ? 'none: ' + closeTaken + ' is the close. Keep only the footer links row.' : close + (close === 'close-form' ? ' (the full form in the footer, starter.html close-form template)' : ' (use only if the final section has no form or booking panel)'));
  line('footer', plan.footer + (plan.footer === 'footer-visit' ? ' (links-visit template)' : ''));
  line('buttons', 'data-buttons="' + plan.buttons + '" on <html> · mark data-mark="' + plan.mark + '" (or the client\'s logo)');
  line('grounds', groundLine(plan.grounds) + (techPage ? ' Use data-ground="' + ['sand', 'sky', 'sage'][Math.floor(Math.random() * 3)] + '" on <html>.' : ''));
  line('density', 'data-density="' + plan.density + '" on <html>');
  line('align', plan.align + (plan.align === 'left' ? '' : ': use .section-head--center on those headings'));
  line('pictures', plan.pictures + ': set data-pictures="' + (plan.pictures === 'square' ? 'square' : 'soft') + '" on <html>' + (plan.pictures.includes('mask') ? ' and data-picture-mask on one inset picture frame' : ''));
  for (const [key, v] of Object.entries(comps)) line('composition', COMP_WHAT[key] + ': ' + (Array.isArray(v) ? v.join(', then ') + ' (no composition twice in a row)' : v) + ' (references/sections-library.md, Compositions)');
  console.log('  Use a dealt composition for photographs with words. Steps, a core view, plans, a comparison, cases with facts, hours or a booking take an own section (references/compose.md). An own section is never drift.');
  line('own', 'at least ' + (plan.own === 1 ? 'one section of this page is' : 'two sections of this page are') + ' your own design for its content (data-own); name ' + (plan.own === 1 ? 'it' : 'them') + ' in the plan');
  console.log('  Take a seed as a prompt for your own section where the content has that shape, or compose something else (references/compose.md).');
  for (const s of ideas) line('ideas', s.id + ': ' + s.line);
  for (const [name, why] of Object.entries(sub)) line('sub', name + ': ' + why + '. ' + ref + '/subskills/' + name + '/SKILL.md');
  if (!techPage || assets.has('photo')) line('photos', "show the subject itself with client pictures, a built view or a matching photograph (references/photos.md)");
  line('reveals', "each section's h2 and lead photograph rise once (motion.js). Use data-still to keep a section still.");
  if (!motion.picks.length) line('moment', 'none: use the entrance, reveals, hover feedback and motion in own sections.');
  motion.picks.forEach((m, i) => {
    const place = motion.rides[m.id] ? rideLine(motion.rides[m.id]) : m.fits.includes('closing') ? 'at the close' : 'in a content section';
    line('moment ' + (i + 1), m.id + ' ' + place + (i === 0 && m.early ? ', within the first three screens' : '') + ': ' + momentSource(m.id) + ', link assets/moments/' + m.id + '/moment.css' + textRule(m.text) + (m.id === 'photo-chapters' ? '. Phone photographs flow with their captions' : m.phoneRuns ? '. Runs on a phone' : '') + ' (references/moments.md)');
  });
  line('scene', motion.scene ? motion.scene + ' ' + (sceneHero ? 'as the hero' : sceneClose ? 'at the close' : 'in the matching content section') + ': ' + ref + '/assets/scenes/' + motion.scene + '/demo.html. Link scenes.css and ' + motion.scene + '/scene.css and load scenes.js.' : 'none this page');
  line('effect', effect ? effect + ' on the ' + effectSlot + (page === 'gaming' ? ', clear of the key art' : '') + (motion.scene ? ', outside the scene' : '') + ' (' + ref + '/assets/effects/README.md; data-fx="' + effect + '")' : 'none this page');
  line('hover layer', 'motion.js handles buttons, links, linked cards and photographs (references/motion.md)');
  line('re-deal', 'to replace one moment, write "<id> (re-dealt for <the old id>)" on the plan comment\'s moments line.');
  line('then', 'record this plan in the comment at the top of <body>, build in index.html from starter.html, then run node ' + ref + '/scripts/gate.mjs index.html');
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
  const tk = tokens(p, cmd === 'css');
  if (tk.derived) console.log('<!-- Surface tint derived from the page ground at 6% OKLCH lightness distance. -->');
  console.log(block(tk, typeVars(t), radius));
  if (cmd === 'css') {
    const h = readHistory(histFile);
    h.palettes.push(p.id); h.types.push(t.id);
    writeHistory(histFile, h);
  }
} else {
  console.log('usage: node scripts/start.mjs plan --page <kind> [--sections N] [--carry words,list,photos,steps,figures] [--action booking|order|trial|visit|contact] [--last-section form] | deal --page <kind> | css --page <kind> --palette <id> --type <id> [--radius soft] | brand --page <kind> --bg .. --ink .. --accent .. --type <id> | types --page <kind>\n  kind: ' + PAGES.join(' | '));
}
