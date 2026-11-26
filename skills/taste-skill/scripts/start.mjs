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
      Recent palette, type and hero IDs are shared in ~/.taste-skill/recent.json. TASTE_SKILL_RECENT sets another file; off disables it.
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
      [--sections N] [--section-plan <file>] [--motion ask] [--effect ask] [--street "<street from brief>"] [--long] [--has photo,ui,film,object,setting,logo,art]
      [--carry words,list,photos,steps,figures] [--action booking|order|trial|visit|contact] [--booking stay|table|class] [--last-section form]
      [--tone warm|editorial|product|tech|playful] [--axis] [--story <id>] [--history .taste-skill/history.json]
      Deal the frame, four prompts for the content and one story shape (library/stories.json: one that lists the kind,
      weighted by --carry, --action and --has, away from the folder's last three; --story <id> chooses it). On quiet pages, one ground or a single band is usual.
      A requested story or eight sections also permits a two-ground chapter run. Sections include the hero and close (default: mapped row count, otherwise the kind’s suggested sequence).
      Quiet plans have no moment or scene unless --motion ask is set; eligible pages get one moment. --carry names what the
      copy notes hold. With no flag only place, product and service assume photos. --has names actual
      assets, including product for a photograph of the client's own product, archive for a large set,
      film for footage, route or site for those subjects. For a dated place reservation pass --booking stay|table|class. Service enquiries use one action.
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
import { dealRhythm } from './page-rhythm.mjs';
import { mascotRequest } from './heading-copy.mjs';
import { suppliedStreet } from './place-address.mjs';
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

import { recentIds, recordIds } from '../assets/layout/recent.mjs';

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

// Choose a neutral secondary ink for both reading grounds, aiming for 8.5:1.
function readableMuted(grounds, supplied) {
  if (supplied && grounds.every(g => color.contrast(supplied,g) >= 7 && color.contrast(supplied,g) <= 10)) return supplied;
  let best = '#555555', penalty = Infinity;
  for (let i = 0; i <= 255; i++) {
    const grey = '#' + i.toString(16).padStart(2, '0').repeat(3);
    const ratios = grounds.map(g => color.contrast(grey, g));
    const low = Math.min(...ratios), high = Math.max(...ratios);
    const distance = 100 * Math.max(0, 7 - low, high - 10) + Math.abs((low + high) / 2 - 8.5);
    if (distance < penalty) { penalty = distance; best = grey; }
  }
  return best;
}
function buttonInk(accent, ...cands) { return color.readable(accent, ...cands); }

// Preserve the lightness and a trace of the hue on coloured grounds.
function readingInk(c) {
  const [l, chroma, hue] = color.lch(c);
  return chroma <= 0.02 ? color.hex(c) : color.fromLch([l, 0.014, hue]);
}

function tokens(p, adjustSurface = true) {
  const bg = color.hex(p.bg), ink = readingInk(p.ink);
  const supplied = color.hex(p.surface || color.mix(bg, ink, 0.05));
  const distance = Math.abs(color.lab(supplied)[0] - color.lab(bg)[0]);
  const derived = adjustSurface && (distance < 0.04 || distance > 0.09);
  const surface = derived ? color.lighten(bg, color.isDark(bg) ? 0.06 : -0.06) : supplied;
  const muted = readableMuted([bg, surface], p.muted && readingInk(p.muted));
  const accent = color.hex(p.accent || ink);
  const preferred = readingInk(p.accentInk || bg);
  const accentInk = color.contrast(accent, preferred) >= 4.5 ? preferred : buttonInk(accent, '#ffffff', '#111111');
  // the one inverse band: a dark field of the palette when there is one, else the ink
  const dark = color.isDark(bg);
  const field = (p.fields || []).map(f => f.bg).find(c => dark ? !color.isDark(c) : color.lab(c)[0] < 0.4);
  const invBg = color.hex(field || ink);
  const neutralGround = readingInk(bg);
  const inverseTint = color.mix(invBg, neutralGround, 0.07);
  const invInk = [invBg, inverseTint].every(g => color.contrast(g, neutralGround) >= 7) ? neutralGround : color.readable(invBg, '#ffffff', '#111111');
  const tint = color.mix(invBg, invInk, 0.07);
  const invSurface = color.contrast(tint, invInk) >= 7 ? tint : color.lighten(invBg, color.isDark(invInk) ? 0.04 : -0.04);
  const invMuted = readableMuted([invBg, invSurface]);
  const invAccent = color.contrast(accent, invBg) >= 3 && (color.chroma(invBg) < 0.03 || color.hueDistance(accent, invBg) > 20) ? accent : invInk;
  const inverseLabel = readingInk(invBg);
  const invAccentInk = invAccent === accent ? accentInk : buttonInk(invAccent, inverseLabel, '#ffffff', '#111111');
  // buttons and links: the accent when it stands out from the ground, else the ink
  const action = opt('action-colour') !== 'ink' && color.contrast(accent, bg) >= 3 ? accent : ink;
  const actionInk = action === accent ? accentInk : buttonInk(action, neutralGround, '#ffffff', '#111111');
  const invAction = opt('action-colour') !== 'ink' && color.contrast(invAccent, invBg) >= 3 ? invAccent : invInk;
  const invActionInk = invAction === invAccent ? invAccentInk : buttonInk(invAction, inverseLabel, '#ffffff', '#111111');
  const headingInk = expressive && p.headingInk && [bg, surface].every(g => color.contrast(p.headingInk, g) >= 3) ? p.headingInk : null;
  return { bg, surface, derived, ink, headingInk, muted, accent, accentInk, action, actionInk, invBg, invSurface, invInk, invMuted, invAccent, invAccentInk, invAction, invActionInk };
}

// ---------------------------------------------------------------- type
const PAGES = ['tech', 'software', 'gaming', 'product', 'service', 'place'];
const ALIAS = { other: 'service', 'technical-product': 'tech', technical: 'tech', hardware: 'tech', device: 'tech',
  event:'service', 'consumer-app':'software', leisure:'product', 'food-brand':'product', 'drink-brand':'product', app: 'software', tool: 'software', devtool: 'software', food: 'place', ai: 'software', dev: 'software', developer: 'software', fintech: 'software', saas: 'software',
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

// ---------------------------------------------------------------- temper (references/expressive.md)
// quiet keeps every rule as it is; lively and loud are the expressive pages. Decided in this order: the client's own
// words for a quiet look win; then loud or lively words in the brief (--brief "<the brief's own words>"); then the kind;
// then supplied art with a strong style moves it one step toward loud. --temper sets it outright.
const TEMPERS = ['quiet', 'lively', 'loud'];
const TEMPER_WORDS = {
  quiet: /\b(calm|serious|premium|clinical|financial|legal|minimal(?:ist)?|trusted|enterprise|regulated|sober|understated)\b/i,
  loud: /\b(loud|punk|metal|retro|arcade|pixel(?:[- ]?art)?|pixels|8[- ]?bit|16[- ]?bit|horror|chiptune|comedy)\b/i,
  lively: /\b(fun|playful|weird|cute|cos[yz]|mascot|character|kids?|toys?|snacks?|candy|drinks?|soda|music|festival|merch|silly|cartoon)\b/i,
};
const ART_STYLE = /\b(pixel|sprites?|hand[- ]?drawn|painted|drawn|cartoon|illustrated)\b/i;
const briefWords = typeof opt('brief') === 'string' ? opt('brief') : '';
function decideTemper({ kind, words = '', has = '', forced } = {}) {
  if (forced !== undefined) return { temper: forced, why: 'set with --temper' };
  const cues = mascotRequest(words) === false ? words.replace(/\bmascots?\b/gi, '') : words;
  const hit = k => (cues.match(TEMPER_WORDS[k]) || [])[0];
  if (hit('quiet')) return { temper: 'quiet', why: `"${hit('quiet').toLowerCase()}" in the brief: the client's words win` };
  // a place or a service is quiet whatever its words: only --temper makes one expressive
  if (kind==='software' && (['fintech','devtool'].includes(trade) || /\b(?:medical|finance|banking|business|b2b|payroll|invoicing|employees?|developer tools?|for (?:[\w-]+ ){0,3}(?:teams|staff)|health app)\b/i.test(words))) return {temper:'quiet',why:'business, developer, finance or health software'};
  if (pageArg==='event' || kind !== 'place' && /\b(?:ticketed event|conference|festival|concert|event page|event website)\b/i.test(words)) return { temper:'lively', why:'an event' };
  if (['place', 'service'].includes(kind) && !/\b(?:mascot|character)\b/i.test(cues)) return { temper: 'quiet', why: `a ${kind} page` };
  let t = 'quiet', why = `a ${kind} page`;
  if (hit('loud')) { t = 'loud'; why = `"${hit('loud').toLowerCase()}" in the brief`; }
  else if (hit('lively')) { t = 'lively'; why = `"${hit('lively').toLowerCase()}" in the brief`; }
  else if (kind === 'software' && /\b(?:iphone|android|habits?|fitness|food|travel|games?|children|hobbies|hobby|character)\b/i.test(words)) { t = 'lively'; why = 'an app for personal use'; }
  else if (kind === 'gaming') {
    if (/\b(strategy|simulation|management|4x|wargame)\b/i.test(words)) why = 'a strategy or simulation game with a sober brief';
    else { t = 'lively'; why = 'a game'; }
  } else if (kind === 'software' && (['app','consumer-app'].includes(pageArg) || /\b(?:consumer|mobile|personal|walking|travel|notebook|fitness|consumer mobile) app\b/i.test(words)) && !/\b(?:finance|health|medical|business|developer|banking)\b/i.test(words)) { t = 'lively'; why = 'a consumer app'; }
  else if (kind === 'product' && (['leisure','food-brand','drink-brand'].includes(pageArg) || /\b(?:food|leisure|children|children’s|children's|juice|coffee|tea|beverage|bread|spice|ice cream)\b/i.test(words))) { t='lively'; why='a food, children’s or leisure product'; }
  else if (kind === 'software' && /\b(streaks?|points|badges|habits?|levels?|xp|game)\b/i.test(words)) { t = 'lively'; why = 'an app with a game mechanic'; }
  else if (kind === 'product' && /\b(drinks?|soda|snacks?|toys?|apparel|sneakers?|music gear|synth|candy|chocolate|beer|cider)\b/i.test(words)) { t = 'lively'; why = 'a drink, snack, toy, apparel or music brand'; }
  const art = String(has).split(',').map(s => s.trim()).includes('art') && ART_STYLE.test(words);
  if (art && t !== 'loud' && (t === 'lively' || kind === 'gaming')) { t = t === 'quiet' ? 'lively' : 'loud'; why += `, supplied ${(words.match(ART_STYLE) || [])[0].toLowerCase()} art`; }
  return { temper: t, why };
}
const temperArg = opt('temper');
if (temperArg !== undefined && !TEMPERS.includes(temperArg)) { console.error(`start: --temper needs ${TEMPERS.join(', ')}`); process.exit(2); }
const { temper, why: temperWhy } = page ? decideTemper({ kind: page, words: briefWords, has: opt('has', ''), forced: temperArg }) : { temper: 'quiet', why: '' };
const expressive = temper !== 'quiet';
const isExpressiveType = t => t.temper === 'expressive';

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
// a one-weight expressive face (Anton, Lilita One, Press Start 2P) or a heavy one keeps its own designed weight
const weightOf = t => t.display.fixedWeight || (techPage ? t.display.tech : 400);
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
    // a static face dealt at its own weight loads that weight too
    if (isDisplay && !f.w && f.s && f.fixedWeight) e.statics.add(f.fixedWeight);
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

// the fallback while the face loads, by its class: a pixel or mono face falls back to a monospace, a hand face to
// cursive, a slab or blackletter face to a serif
const FALLBACK = { pixel: 'ui-monospace, monospace', 'mono-voice': 'ui-monospace, monospace', hand: 'cursive, system-ui, sans-serif',
  slab: 'Georgia, serif', blackletter: 'Georgia, serif', serif: 'Georgia, serif' };
const stack = (f, cls) => `"${f.family}", ${FALLBACK[cls] || 'system-ui, sans-serif'}`;
function typeVars(t) {
  // tracking: 0 or tighter, except a face drawn for capitals or on a pixel grid (up to +0.06em, study section 4)
  const open = t.display.caps || t.class === 'pixel';
  const clamp = v => Math.max(expressive ? -0.045 : -0.02, Math.min(open ? 0.06 : 0, v));
  const w = t.display.fixedWeight || Math.max(400, Math.min(techPage ? 500 : 400, weightOf(t) || 400));
  return {
    w, tr: clamp(t.display.tracking), trXl: clamp(t.display.trackingXl ?? t.display.tracking),
    caps: !!t.display.caps, grid: t.display.grid || 0, expressive: isExpressiveType(t), cls: t.class,
    stretch: placePage ? '100%' : (t.display.stretch || '100%'), axes: t.display.axes || '',
    scale: placePage ? 1 : (t.display.scale || 1),
    display: stack(t.display, t.class), text: stack(t.text, 'plain'),
    mono: monoOf(t) ? `"${monoOf(t).family}", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` : '',
    link: fontLink(t),
  };
}
const FONT_TAGS = link => `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${link}" rel="stylesheet">`;

function block(tk, ty, radius, materials = []) {
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
    // an expressive face (assets/expressive/expressive.css reads these): capitals on h1 and h2, sizes on its pixel grid
    ...(ty.expressive ? [`  --display-class: ${ty.cls};`] : []),
    ...(ty.caps ? ['  --display-case: uppercase;'] : []),
    ...(ty.grid ? [`  --display-grid: ${ty.grid}px;`] : []),
  ];
  return `${FONT_TAGS(ty.link)}
<link rel="stylesheet" href="assets/system.css">
<link rel="stylesheet" href="assets/ui/cards.css">
<link rel="stylesheet" href="assets/motion/motion.css">
<link rel="stylesheet" href="assets/backgrounds/backgrounds.css">
<link rel="stylesheet" href="assets/layout/layout.css">
<link rel="stylesheet" href="assets/icons/icon.css">${materials.map(file => `\n<link rel="stylesheet" href="${file}">`).join('')}${ty.expressive ? '\n<link rel="stylesheet" href="assets/expressive/expressive.css">' : ''}
<!-- <html lang="en" data-radius="${radius}" data-action="${opt('action-colour') === 'ink' ? 'ink' : 'accent'}"${ty.expressive ? ` data-temper="${temper === 'quiet' ? 'lively' : temper}"` : ''}>; keep this <style> after the links: layout.css resets --ly-scale -->
<style>
:root {
  --p-bg: ${tk.bg}; --p-surface: ${tk.surface}; --p-ink: ${tk.ink}; --p-muted: ${tk.muted};${tk.headingInk ? ` --p-heading-ink: ${tk.headingInk};` : ''}
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
// a face whose cues (pixel, arcade, cosy ...) are in the brief's words comes up first on an expressive page
const cueWeight = t => (t.cues || []).some(c => new RegExp('\\b' + c, 'i').test(briefWords)) ? 30 : 1;
const temperWeight = t => !t.tempers || t.tempers.includes(temper) ? 1 : 0.2;
function dealTypes(h, { axis = false } = {}) {
  // a quiet page never sees an expressive face; a lively or loud one is dealt two of them and one plain pairing as the exit
  let pool = allTypes.filter(t => suits(t, page) && (!axis || t.display.letters || isExpressiveType(t)) && (expressive || !isExpressiveType(t)));
  const recent = recentIds('types');
  const fresh = pool.filter(t => !recent.includes(t.id));
  if (fresh.length >= 3) pool = fresh;
  const used = (h.types || []).slice(-3), dealt = (h.dealt || []).slice(-3);
  const out = [];
  // The first suggestion becomes the project choice. Keep any eligible fresh face ahead
  // of repeat alternatives when fewer than three fresh faces remain.
  const choices = () => {
    if (!fresh.length || !out.length || !recent.includes(out[0].id)) return out;
    const first = out.find(t => !recent.includes(t.id)) || fresh[0];
    return [first, ...out.filter(t => t.id !== first.id)].slice(0,out.length);
  };
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
    return choices();
  }
  // the kind's weight counts cubed (3 is 27 times a 1) and a recent face is only dimmed, never removed:
  // the faces that suit the kind keep coming up, a pairing just built or dealt rests
  const recency = t => used.includes(t.id) ? 0.15 : dealt.includes(t.id) ? 0.5 : 1;
  let src = pool.slice();
  const cls = new Set();
  const want = expressive ? [true, true, false] : [null, null, null];
  for (const wantExp of want) {
    const from = src.filter(t => wantExp === null || isExpressiveType(t) === wantExp);
    if (!from.length) continue;
    const pick = wpick(from, t => kindWeight(t, page) ** 3 * recency(t) * (cls.has(t.class) ? 0.15 : 1) * (expressive ? cueWeight(t) * temperWeight(t) : 1));
    out.push(pick); cls.add(pick.class);
    src = src.filter(t => t.id !== pick.id);
  }
  return choices();
}
const pc = n => (Math.round(n * 1000) / 10) + '%';
function describe(t, withLink) {
  const mono = monoOf(t) ? ` + ${monoOf(t).family}` : '';
  const fams = t.display.family === t.text.family ? t.display.family : `${t.display.family} / ${t.text.family}`;
  const axis = placePage ? '' : (t.display.letters ? `, axis ${t.display.letters}` : ', static');
  const tag = placePage ? GROUPS[t.place] : t.class;
  const trk = placePage ? '' : `, tracking ${pc(t.display.trackingXl ?? t.display.tracking)} at hero size`;
  const exp = isExpressiveType(t) ? `expressive${t.display.caps ? ', capitals' : ''}${t.display.grid ? `, ${t.display.grid}px grid` : ''}; ` : '';
  let s = `  ${t.id.padEnd(18)} ${fams}${mono}  (${tag}; ${exp}display ${weightOf(t) || 400}${trk}${axis}; ${t.moods.join(', ')})\n      suits: ${t.suits}${t.avoid ? `\n      avoid: ${t.avoid}` : ''}`;
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
  grounds: { software: 'blocks|blocks|contrast|calm|islands', gaming: 'islands|islands|contrast|blocks|calm', tech: 'blocks|blocks|contrast|islands|calm',
    product: 'contrast|contrast|islands|blocks|calm', service: 'calm|calm|blocks|contrast|islands', place: 'calm|calm|islands|contrast|blocks' },
};
// an expressive page deals one of the world's button families (assets/expressive/expressive.css), one a page
const EXPRESSIVE_BUTTONS = 'push|bevel|ribbon|offset';
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
  place: ['visit', 'offer', 'showcase', 'feature', 'rooms', 'form'] };
const COMP_WHAT = { offer: 'the offer (menu, prices, services)', showcase: 'the showcase (the place, the work, the house, in use)',
  rooms: 'rooms or goods', feature: 'each feature section', visit: 'the visit', form: 'the booking or order form' };
// compositions sections-library.md allows once a page (2.5.3: a showcase and a feature were both dealt bleed-panel)
const ONCE_A_PAGE = ['bleed-panel', 'mirrored'];
const sectionsArg = opt('sections', 7);
let sections = Number(sectionsArg);
const action = opt('action');
const bookingSubject = opt('booking');
if (['plan', 'deal'].includes(cmd)) {
  if (sectionsArg === true || !Number.isSafeInteger(sections) || sections < 1) { console.error('start: --sections needs a positive integer'); process.exit(2); }
  if (bookingSubject !== undefined && !['stay', 'table', 'class'].includes(bookingSubject)) { console.error('start: --booking needs stay, table or class'); process.exit(2); }
  if (action !== undefined && !['booking', 'order', 'trial', 'visit', 'contact'].includes(action)) { console.error('start: --action needs booking, order, trial, visit or contact'); process.exit(2); }
}

// the ground of a chapters or two-part-promise page (references/story.md): one ground per chapter run or half,
// changing only at their boundaries, never at every section (the study's stripe-grounds)
function chapterGrounds(story, n) {
  const by = Array(n).fill('page');
  if (n < 3) return { pattern: 'chapters', bySection: by };
  const last = techPage ? 'ground-inverse' : 'ground-brand';
  if (story === 'two-part-promise') {
    const mids = n - 2, meet = mids >= 3 ? 1 : 0, a = Math.ceil((mids - meet) / 2);
    for (let i = 1 + a; i <= mids - meet; i++) by[i] = 'ground-surface';
    if (meet) by[n - 2] = last;
    by[n - 1] = last;
  } else {
    const tail = n >= 9 ? 2 : n >= 5 ? 1 : 0, run = n - 2 - tail;
    for (let i = 1; i <= run; i++) by[i] = 'ground-surface';
    for (let i = run + 1; i < n - 1; i++) by[i] = techPage ? 'ground-inverse' : 'page';
    by[n - 1] = last;
  }
  return { pattern: 'chapters', bySection: by };
}
// the story shape (library/stories.json): one that lists the kind, weighted by what the brief carries, its action and
// its material, kept off this folder's last three (references/story.md). A prompt like the idea seeds: the brief decides.
const STORY_FAVOURS = {
  carry: { steps: { 'work-path': 3 }, photos: { 'day-with-it': 2.5, 'catalogue-argued': 2 }, words: { letter: 3, 'two-part-promise': 1.5 },
    figures: { 'claim-proofs': 3, 'problem-turn': 1.5 }, list: { 'catalogue-argued': 2.5, chapters: 2.5, sequel: 1.5 } },
  action: { booking: { 'day-with-it': 3 }, visit: { 'day-with-it': 2.5, letter: 1.3 }, order: { 'catalogue-argued': 2.5 },
    trial: { 'work-path': 1.5, 'problem-turn': 1.5 }, contact: { letter: 1.5, 'work-path': 1.3 } },
  has: { ui: { 'work-path': 1.5, 'problem-turn': 1.3 }, object: { chapters: 1.5, sequel: 1.2 }, product: { chapters: 1.3 },
    setting: { 'day-with-it': 1.5 }, art: { 'day-with-it': 1.3, chapters: 1.2 }, photo: { 'day-with-it': 1.3 }, archive: { 'catalogue-argued': 1.5 } },
};
function dealStory(h, { carry, action: act, assets, rand, forced, mappedCount }) {
  const all = lib('stories.json');
  h.stories = Array.isArray(h.stories) ? h.stories : [];
  let story;
  if (forced) {
    story = all.find(s => s.id === forced);
    if (!story) throw new Error('--story needs one of ' + all.map(s => s.id).join(', '));
  } else {
    const eligible = all.filter(s => s.kinds.includes(page));
    const withinRows = eligible.filter(s => s.beats.filter(b => b.required).length <= mappedCount);
    const fits = withinRows.length ? withinRows : eligible;
    const recent = h.stories.slice(-Math.min(3, fits.length - 1));
    const fresh = fits.filter(s => !recent.includes(s.id));
    const pool = fresh.length ? fresh : fits;
    const weight = s => {
      let w = sections >= s.sections[0] && sections <= s.sections[1] ? 1 : 0.35;
      for (const c of carry) w *= (STORY_FAVOURS.carry[c] || {})[s.id] || 1;
      if (act) w *= (STORY_FAVOURS.action[act] || {})[s.id] || 1;
      for (const a of assets) w *= (STORY_FAVOURS.has[a] || {})[s.id] || 1;
      return w;
    };
    let ticket = rand() * pool.reduce((sum, s) => sum + weight(s), 0);
    story = pool.find(s => (ticket -= weight(s)) < 0) || pool[pool.length - 1];
  }
  h.stories = [...h.stories, story.id].slice(-8);
  return story;
}
function groundsFor(pattern, n) {
  const bySection = Array(n).fill('page');
  const middle = Math.max(1, Math.floor((n - 1) / 2));
  if (pattern === 'contrast') {
    if (n > 1) bySection[n - 1] = 'ground-surface';
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
function groundLine({ bySection }) {
  const names = [...new Set(bySection)].map(g => g === 'ground-surface' ? 'tint' : g === 'ground-inverse' ? 'dark' : g === 'ground-brand' ? 'brand' : 'page');
  return names.length + (names.length === 1 ? ' ground (' : ' grounds (') + names.join(', ') + '). Follow the section order: ' + bySection.join(', ') + '.';
}
function dealIdeas(h, carry) {
  const recent = (h.ideas || []).slice(-8);
  const pool = lib('ideas.json').filter(s => s.kinds.includes(page) && !recent.includes(s.id) && !(action === 'trial' && s.id === 'enquiry-preview') && (s.id !== 'meter' || carry.has('figures')) && (s.id !== 'week-strip' || carry.has('steps')));
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
  const closeDeck = lib('closes.json');
  const materials = String(opt('has', ['place','service'].includes(k) ? 'photo' : '')).split(',');
  const amount = materials.find(v => /^pictures:\d+$/.test(v));
  const pictures = amount ? Number(amount.split(':')[1]) : materials.some(v => ['photo','setting','archive'].includes(v)) ? 1 : 0;
  const carry = opt('carry');
  const acceptsClose = entry => entry.kinds.includes(k) && entry.tempers.includes(temper) &&
    entry.needs.every(need => need === 'form' ? ['order','booking','contact'].includes(action) || !action :
      pictures >= Number(need.split(':')[1]) && (carry === undefined || String(carry).split(',').includes('photos')));
  const get = key => {
    const options = LISTS[key][k] || LISTS[key]['*'];
    return key === 'close' ? options.split('|').filter(id => closeDeck.some(entry => entry.id === id && acceptsClose(entry))).join('|') : options;
  };
  const out = {};
  for (const key of ['nav', 'footer', 'close', 'buttons', 'mark']) out[key] = pick(`${k}:${key}`, key === 'buttons' && expressive ? EXPRESSIVE_BUTTONS : get(key), key === 'close' ? 2 : 1);
  if (expressive) out.grounds = groundsFor(pick(k + ':grounds', get('grounds'), 2), sections);
  else {
    const eligible = sections >= 8 || !!opt('story');
    const roll = Math.random() * (eligible ? 100 : 85);
    const pattern = sections === 1 || roll < 45 ? 'one' : roll < 85 ? 'band' : 'chapters';
    const bySection = Array(sections).fill('page');
    if (pattern === 'band') {
      const at = 1 + Math.floor(Math.random() * (sections - 1));
      bySection[at] = Math.random() < .27 ? 'ground-brand' : 'ground-surface';
    } else if (pattern === 'chapters') {
      bySection.fill('ground-surface', Math.floor(sections / 2));
    }
    out.grounds = {pattern, bySection};
  }
  const densities = techPage ? 'compact|regular|compact|regular|open' : page === 'product' ? 'open|regular|compact' : 'open|regular|open|regular|compact';
  out.density = pick(`${k}:density`, densities);
  out.align = pick(`${k}:align`, 'left|centred heads on proof and close');
  out.pictures = pick(`${k}:pictures`, 'square|soft|soft with one shaped mask');
  out.compositions = {};
  const lines = [], used = [];
  const dealt = v => { if (ONCE_A_PAGE.includes(v)) used.push(v); return v; };
  // Name the supplied street explicitly when the brief uses a local address format.
  const namedStreet = opt('street');
  const hasStreet = !!suppliedStreet(briefWords) || typeof namedStreet === 'string' && briefWords.toLowerCase().includes(namedStreet.toLowerCase()) &&
    (/\p{L}/u.test(namedStreet) && /\d/.test(namedStreet) || /^(?:rue|via|calle|rua|avenida|quai|chemin|piazza)\s+\S/i.test(namedStreet));
  for (const sec of KIND_COMPS[k] || []) {
    if (sec === 'form' && (action === 'trial' || action === 'visit')) continue;
    const edgeOptions = ['place', 'product', 'service'].includes(k) && ['showcase', 'feature'].includes(sec);
    const pool = (sec === 'visit' && !hasStreet ? COMPS.visit.replace('|street-large','') : COMPS[sec]) + (edgeOptions ? '|edge-split|colour-half' : '');
    if (sec === 'feature') {
      const a = dealt(pick(`${k}:feature`, pool, 2, used));
      const b = dealt(pick(`${k}:feature`, pool, 2, [...used, a]));
      out.compositions.feature = [a, b];
      lines.push(`${COMP_WHAT.feature}: ${a}, then ${b} (no composition twice in a row)`);
    } else {
      const booking = action === 'booking' && k === 'place' && !!bookingSubject;
      const options = sec === 'form' && booking ? 'close-form' : pool.split('|').filter(id =>
        id !== 'close-form' || acceptsClose(closeDeck.find(entry => entry.id === id))).join('|');
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
    : out.close === 'close-form' ? 'close-form: the booking or order form is the close, in the last section of main; use one full form'
    : `${out.close}; a page whose last section is a form ends on close-form instead`}; keep the name, link groups and legal line in the footer; use the form once`);
  return out;
}

const histFile = opt('history', '.taste-skill/history.json');

function dealFrame(h, artPalette = false) {
  let palette;
  const tys = dealTypes(h, { axis: !!opt('axis') });
  if (artPalette) palette = {id:'art'};
  else if (!opt('types-only')) {
    // a loud page may take a flat poster palette (flat-loud): four flat grounds at most, the expressive limit
    let pals = temper === 'loud' ? lib('palettes.json').filter(p => paletteOk(p) || (p.tags.includes('flat-loud') && !isViolet(p.accent))) : palettes;
    if (!techPage && page) pals = pals.filter(p => !color.isDark(p.bg)); // dark pages are tech only
    if (opt('dark')) pals = pals.filter(p => color.isDark(p.bg));
    if (opt('light')) pals = pals.filter(p => !color.isDark(p.bg));
    if (placePage) pals = pals.filter(placeGround);   // a place's ground: light and quiet (backgrounds.md, --g-main)
    // the palettes made for the trade first, away from this folder's last ones and (with TASTE_SKILL_RECENT) the trade's
    // last six in the shared file; topped up from the rest of the kind only when fewer than three are made for it
    if (!expressive && !placePage) pals = pals.filter(p => !['moss-sand','green-mat-chocolate','warm-paper-walnut','flour-terracotta','limewash-ochre','clay-pine'].includes(p.id));
    const shared = recentIds('palettes');
    const avoid = [...shared, ...h.palettes.slice(-12)];
    const fresh = pals.filter(p => !shared.includes(p.id));
    if (fresh.length >= 3) pals = fresh;
    if (!expressive && techPage && !opt('dark') && !opt('light')) {
      const dark = Math.random() < .25;
      const group = pals.filter(p => color.isDark(p.bg) === dark);
      if (group.length >= 3 && (!shared.length || fresh.length >= 3)) pals = group;
    }
    const fit = trade ? pals.filter(p => (p.trades || []).includes(trade)) : [];
    const consumerFields = page === 'software' && temper === 'lively' ? fit.filter(p => p.tags.some(t => ['pastel-fields','flat-loud'].includes(t))) : [];
    const dealt = drawFresh(consumerFields.length ? consumerFields : fit, 3, avoid);
    if (dealt.length < 3) dealt.push(...drawFresh(pals.filter(p => !dealt.includes(p)), 3 - dealt.length, avoid));
    if (fresh.length && dealt.length && shared.includes(dealt[0].id)) {
      const first = dealt.find(p => !shared.includes(p.id)) || fresh[0];
      const alternatives = dealt.filter(p => p.id !== first.id);
      dealt.splice(0,dealt.length,first,...alternatives.slice(0,2));
    }
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
  }
  console.log(expressive && !placePage
    ? `TYPE for ${page}, ${temper} (take the first; all Google Fonts; two expressive faces and one plain pairing as the exit; the display face at its own weight, capitals only in a face drawn for them, on h1 and h2; reading text stays in the text face at 400; references/expressive.md):`
    : `TYPE for ${page}${placePage && PLACE_GROUP[trade] ? ` (${TRADE_NAME[trade]}: ${GROUPS[PLACE_GROUP[trade]]} first)` : ''} (take the first; all Google Fonts; headlines ${techPage ? '400 or 500' : '400'}, text 400, 500 for buttons and labels; sentence case, sizes come from system.css):`);
  for (const t of tys) console.log(describe(t, false));
  if (!tys.length) console.log('  (no pairing matches; drop --axis)');
  const layout = dealLayout(h);
  h.dealt = [...(h.dealt || []), ...tys.map(t => t.id)].slice(-30);
  if (cmd === 'deal' && !opt('axis') && !placePage) console.log('  (a word or editorial hero needs a weight or width axis: deal again with --axis)');
  const self = fileURLToPath(import.meta.url).split(path.sep).join('/');
  if (cmd === 'deal') console.log(`\nthen: node ${/\s/.test(self) ? `"${self}"` : self} css --page ${page} --palette <id> --type <id> --radius soft${expressive ? ' --temper ' + temper : ''} --history ${histFile}${placePage ? '\n  (the client\'s own colours, a painted shopfront or a logo the brief gives, in place of the palette: start.mjs brand)' : ''}`);
  recordIds({ palettes: palette?.id, types: tys[0]?.id });
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
  const forcedStory = opt('story');
  if (forcedStory === true) throw new Error('--story needs a shape id from library/stories.json');
  const defaultSections = path.join(dir,'sections.txt');
  const sectionPlan = opt('section-plan', fs.existsSync(defaultSections) ? defaultSections : undefined);
  if (sectionPlan !== undefined && typeof sectionPlan !== 'string') throw new Error('--section-plan needs a text file with one line per section');
  const rows = sectionPlan === undefined ? [] : fs.readFileSync(sectionPlan,'utf8').trim().split(/\r?\n/).filter(row => row.trim());
  if (!opt('sections')) sections = sectionPlan === undefined ? dealRhythm(page).sequence.length : rows.length;
  const story = dealStory(frameHistory, { carry: [...carry], action, assets: [...assets], rand: rng(seed + ':story'), forced: forcedStory, mappedCount: rows.length });
  const minimum = story.beats.filter(b => b.required).length;
  if (sections < minimum) {
    console.log('Raised --sections from ' + sections + ' to ' + minimum + ' for the required beats of ' + story.id + '.');
    sections = minimum;
  }
  let shows, reactionSection;
  if (sectionPlan !== undefined) {
    shows = rows.map(row => row.match(/\bshows\s+([^|]+?)(?:\s*\||$)/i)?.[1].trim());
    if (rows.length !== sections || shows.some(subject => !subject)) throw new Error('Each of the '+sections+' section lines needs shows followed by its subject.');
    const reaction = rows.findIndex((row,i) => i > 0 && i < rows.length-1 && !/^nothing\.?$/i.test(shows[i]));
    if (reaction >= 0) reactionSection = rows[reaction].split('|')[0].trim() + ' showing ' + shows[reaction];
    if (!expressive && shows.filter(subject => /^nothing[.]?$/i.test(subject)).length * 4 > sections) throw new Error('More than a quarter of the section plan shows nothing. Show the subject or merge a section.');
  }
  const physical = page === 'product' || trade === 'hardware' || ['hardware','device','technical-product'].includes(pageArg) || page === 'tech' && (assets.has('object') || /\b(?:hardware|camera|sensor|keyboard|device|headphones|drone)\b/i.test(briefWords));
  const rhythm = dealRhythm(physical ? 'physical' : page, rows, shows);
  if (rhythm.families.includes(null)) throw new Error('Each section row needs | family <layout-family>.');
  if (rhythm.families.some((f,i,a) => f === 'split' && a[i-1] === f && a[i-2] === f)) throw new Error('Three consecutive splits. Choose another family for one subject.');
  const artPalette = expressive && (assets.has('art') || page === 'gaming');
  const { palette, type, layout } = dealFrame(frameHistory, artPalette);
  if (!palette || !type) throw new Error('no palette or pairing fits the requested flags');
  if (artPalette && opt('bg') && opt('accent')) {
    palette.bg = color.hex(opt('bg'));
    palette.accent = color.hex(opt('accent'));
  }
  const { hero, variant, form, peek, book, peekLine, bookLine } = run(path.join(skill, 'assets/layout/deal.mjs'), [
    '--type', pageType, '--kind', page, '--has', has, '--temper', temper,
    '--subjects', String(opt('subjects', 1)), ...(opt('no-recent') ? ['--no-recent'] : []),
    ...(opt('view') === 'wide' ? ['--view','wide'] : []), ...(page === 'gaming' && !assets.has('art') ? ['--illustrate'] : []), '--history', path.join(dir, 'layout-history.json'),
    ...(action ? ['--action', action] : []), ...(bookingSubject ? ['--booking', bookingSubject] : []), ...(opt('no-record') ? ['--no-record'] : []),
  ]);
  const ownFormClose = opt('last-section') === 'form';
  const reserveClose = ownFormClose || layout.close === 'close-form';
  const common = ['--page', page, '--history', histFile, '--seed', seed, ...(tone ? ['--tone', tone] : []),
    ...(opt('no-record') ? ['--no-record'] : [])];
  const motion = run(path.join(here, 'moments.mjs'), ['pick', ...common, '--temper', temper, ...(opt('motion') === 'ask' ? ['--motion','ask'] : []), '--scene', 'deal', '--has', has,
    '--carry', [...carry].join(','), '--sections', String(sections), ...(opt('long') ? ['--long'] : []),
    ...(peek || book || variant ? ['--keep-hero'] : []), ...(reserveClose ? ['--keep-close'] : []), ...(action ? ['--action', action] : [])]);
  const sceneHero = motion.sceneFits.includes('hero');
  const sceneClose = motion.sceneFits.includes('close');
  const effectRequest = opt('effect') === 'ask' || /\b(?:add|use|want|include|with|show)\s+(?:an? |a subtle |a quiet )?(?:shader|background effect|canvas background)\b/i.test(briefWords);
  const { dealContent } = await import('./content-deal.mjs');
  const { parts, gradient, demo, tools } = dealContent({ page, hardware: trade === 'hardware' || ['hardware','device'].includes(pageArg),
    assets: typeof opt('has') === 'string' ? assets : new Set(), rows, seed, palette, heroWindow: hero.window || variant === 'wide',
    dark: palette.bg && color.isDark(palette.bg), sceneHero, sceneClose, moving: effectRequest || opt('motion') === 'ask', brief: briefWords });
  const occupiedHero = variant === 'wide' || hero.window && assets.has('ui') || ['photo','film','place','collage','triptych'].includes(hero.id) || ['split','product'].includes(hero.id) && assets.has('photo');
  let effect = gradient?.moving ? gradient.effect : null;
  if (!gradient && effectRequest && techPage && !sceneHero && !occupiedHero && !expressive) {
    effect = run(path.join(here,'effects.mjs'), ['pick', ...common, '--palette', color.isDark(palette.bg) ? 'dark' : 'light', '--slots', page === 'gaming' ? 'band' : 'hero']).picks[0]?.id || null;
  }
  const h = readHistory(histFile);
  h.layout = frameHistory.layout;
  h.dealt = frameHistory.dealt;
  const deck = JSON.parse(fs.readFileSync(path.join(skill, 'assets/motion/meta.json'), 'utf8')).entrances;
  const picture = assets.has('art') || assets.has('photo') || assets.has('film') || assets.has('object') || ['place', 'split', 'photo', 'product', 'film'].includes(hero.id);
  const meets = need => /window|ui/i.test(need) ? hero.window && assets.has('ui')
    : /moving|scene/i.test(need) ? sceneHero || hero.id === 'film'
    : /70%|half/i.test(need) ? picture && (form || hero.id) !== 'split'
    : /photograph/i.test(need) ? assets.has('photo') : /picture/i.test(need) ? picture : true;
  const pool = deck.filter(e => (!e.tempers || e.tempers.includes(temper)) && fitsKind(e, page, { tone }) && e.needs.every(meets));
  let ticket = rng(seed + ':entrance')() * pool.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  const still = deck.find(e => e.default);
  const entrance = sceneHero ? still : pool.find(e => (ticket -= e.weight ?? 1) < 0) || still;
  const reveals = rng(seed + ':reveals')() < 1/3 ? 'fade' : 'none';
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

  const ideas = dealIdeas(h, carry);
  h.stories = frameHistory.stories;
  // a chapters or two-part-promise page changes ground only where a chapter or half begins (the dealt pattern stays in the history)
  if (expressive && ['chapters', 'two-part-promise'].includes(story.id)) layout.grounds = chapterGrounds(story.id, sections);
  const sub = {};
  if (page === 'gaming' && !assets.has('art')) sub.illustrate = "draw the game's own world";
  if (['product', 'tech'].includes(page) && !assets.has('photo')) sub.illustrate = 'show the product itself in a built picture';
  if (['software', 'tech', 'service'].includes(page)) sub['data-picture'] = 'show a figure, range or comparison when the copy supplies one';
  if (['place', 'product', 'service'].includes(page) && assets.has('photo')) sub['image-direction'] = 'direct the crops and scale when the page carries six or more photographs';
  if (!assets.has('logo')) sub['brand-mark'] = 'draw a mark if the brief needs one, or use the dealt mark';
  const requestedMascot = mascotRequest(briefWords);
  if (requestedMascot === true || (requestedMascot === null && ['software', 'gaming', 'product'].includes(page) && !['clinic', 'law', 'hotel'].includes(trade))) {
    const mascot = requestedMascot === true || rng(seed + ':mascot')() < 1 / 3;
    h.mascot = [...(h.mascot || []), { seed, dealt: mascot }].slice(-40);
    if (mascot) sub.mascot = 'give a recurring guide or character one consistent form';
  }
  let placements;
  if (requestedMascot) {
    const beat = story.beats[1];
    placements = [
      {place:'hero', pose:'greeting'},
      {place:reactionSection || beat.id + ' showing ' + beat.show, pose:'reacting to the result'},
      {place:'footer', pose:'resting'}
    ];
    sub.mascot = placements.map(p => p.place + ': ' + p.pose).join('. ') + '. Use three distinct poses from subskills/mascot, each marked data-mascot and at least 96px tall at 1440px';
  }
  const actionColour = !expressive && rng(seed + ':action-colour')() < 1/3 ? 'ink' : 'accent';
  const footerWordmark = !expressive && rng(seed + ':footer-wordmark')() < 1/8;
  const split = ['split','collage','triptych'].includes(hero.id);
  const acrossRoll = rng(seed + ':across')();
  // Keep the suited hero and its recency history. A split can also stage its subject below the offer.
  const builtProduct = pageType === 'product' && !['photo','film','art'].some(material => assets.has(material));
  const stackChance = builtProduct ? .6 : pageType === 'software' ? .44 : pageType === 'product' ? 0 : .2;
  let headline = 'across';
  if (hero.id === 'place' && (form === 'split' || form === 'bleed' && acrossRoll < .5)) headline = 'split';
  if (split && opt('view') !== 'wide' && (expressive || acrossRoll >= stackChance)) headline = 'split';
  const fragmentSets = {
    software:['window','doc','stat'], tech:['terminal-run','stat'], gaming:['slider','stat'],
    product:['slider','stat'], service:['calendar','doc'], place:['calendar','checklist']
  };
  let views = fragmentSets[page];
  if (physical) views = ['object in use', 'two or three close details with callouts (tools/frame.mjs)', 'specification table', 'box contents', 'connections and compatibility', 'comparison if supplied', 'price and delivery'];
  else if (trade==='devtool' || page==='software' && /\b(build|repository|developer tool|commit)\b/i.test(briefWords)) views=['diff-review','terminal-run','stat'];
  else if (page==='software' && /\b(schedule|scheduling|calendar|booking)\b/i.test(briefWords)) views=['calendar','checklist','notify'];
  const plan = {
    rhythm,
    actionColour, footerWordmark, headline, ...(requestedMascot ? {mascot: placements} : {}), ...(shows ? {shows} : {}),
    version: '2.5.4', kind: page, pageType, trade: trade || null, temper, temperWhy, sections, palette: artPalette ? "art" : palette.id, type: type.id,
    hero: hero.id, ...(variant ? {heroVariant:variant} : {}), ...(form ? { heroForm: form } : {}), heroPeek: peek, heroBook: book, entrance: entrance.id, reveals, nav: layout.nav, footer: layout.footer,
    close, buttons: layout.buttons, mark: layout.mark, grounds: layout.grounds, density: layout.density,
    align: gradient?.slot === 'close' && layout.align !== 'left' ? 'centred heads on proof, left on the closing band' : layout.align, pictures: layout.pictures, compositions: comps, own: sections < 6 ? 1 : 2,
    ideas: ideas.map(s => s.id), sub: Object.keys(sub), moments: motion.picks.map(m => m.id), rides: motion.rides,
    parts, gradient, demo, tools, seed, scene: motion.scene, effect, story: story.id, ...(briefWords ? { brief: briefWords } : {}),
  };
  if (!opt('no-record')) writeHistory(histFile, h);
  writeHistory(path.join(dir, 'plan.json'), plan, 2);

  const ref = '<skill>';
  console.log('\n==== PLAN (build the frame as dealt: palette, type, hero, entrance, nav, footer, close, buttons, mark, density. Use the dealt grounds. Section forms come from the content.) ====');
  const line = (name, value) => console.log('  ' + name.padEnd(13) + value);
  line('kind', page + ' · page type ' + pageType + (trade ? ' · trade ' + trade : '') + ' · ' + sections + ' sections · ' + FIT[page].tones.join('/') + ' · ' + (techPage ? 'WebGL available' : 'no WebGL'));
  line('rhythm', rhythm.usualSections + ' ± 2 sections when supported: ' + rhythm.sequence.map((family,i) => family + ' (' + rhythm.widths[i] + ')').join(' → '));
  line('widths', rhythm.rules + (physical ? ' Set data-physical on html. Draw the object with illustrate or use the picture ladder. Give it five of twelve columns or more and 420px height. At 1440px start copy within 200px below navigation when the hero is shorter than the viewport.' : ''));
  if (rows.length) line('mapped', rhythm.mapped.map(({subject,family,width}) => subject + ' (' + family + ', ' + width + ')').join(' → '));

  if (!physical && (rhythm.families.includes('pricing') || rhythm.sequence.includes('pricing'))) line('plans','Give each plan its supplied inclusions, price and action in a full column or card.');
  line('views',physical ? views.join(', ') : views.map(f=>'assets/ui/'+f).join(', ')+'; tools/device.mjs for the frame, tools/chart.mjs for a chart.');
  line('temper', temper + ': ' + temperWhy + (expressive
    ? '. Set data-temper="' + temper + '" on <html> and enable the expressive.css line in starter.html. Every expressive move names its source in the game or brand on the plan comment ("torn edge: the game\'s menus are paper"); no source, no move. Permissions, limits and the never list: ' + ref + '/references/expressive.md'
    : '. Every style rule holds as written (references/expressive.md only for a lively or loud page: --temper)'));
  line('story', story.id + ': ' + story.line + (forcedStory ? ' (chosen with --story)' : ''));
  const pad = ' '.repeat(15);
  console.log(pad + 'minimum ' + minimum + ' sections; map every required beat to its section id.');
  story.beats.forEach((b, i) => console.log(pad + 'beat ' + (i + 1) + ' ' + (b.required ? 'required' : 'optional') + ' | beat: ' + b.id + ' | ' + b.show));
  console.log(pad + 'thread: ' + story.thread);
  console.log(pad + 'not this: ' + story.fake);
  console.log(pad + 'Take it, or another shape from ' + ref + '/library/stories.json when the brief fits it better (the table in references/story.md): deal again with --story <id> to match the story in your notes, and say why on plan line 3. Write the ## Story block in the copy notes first.');
  if (['software','tech'].includes(page) && assets.has('ui') && !variant) line('view','For one wide timeline, schedule or board, deal again with --view wide.');
  line('copy first', '.taste-skill/copy.md from references/copy.md. Lint it with node ' + ref + '/scripts/copy-lint.mjs .taste-skill/copy.md');
  if (artPalette) line('palette','art, type ' + type.id + ': take the grounds, ink and action colour from the art. Run node '+ref+'/scripts/start.mjs brand --page '+page+' --type '+type.id+' --temper '+temper+' --bg "<art ground>" --surface "<second ground>" --ink "<reading ink>" --accent "<action colour>"');
  else line('palette', palette.id + ', type ' + type.id + ': node ' + ref + '/scripts/start.mjs css --page ' + page + ' --palette ' + palette.id + ' --type ' + type.id + ' --radius ' + (placePage ? 'sharp' : 'soft') + (expressive ? ' --temper ' + temper : '') + ' --action-colour ' + actionColour + ' --history ' + histFile.split(path.sep).join('/'));
  if (variant==='wide') line('hero',hero.id+' with data-view="wide" and class hero--peek: copy the frame from '+ref+'/assets/layout/wide-view.html and show the project’s working view. Keep labels beside their values on phones.');
  else if (variant==='world') line('hero',hero.id+' with data-view="world": copy the hero from '+ref+'/assets/expressive/demo.html. Use the supplied or illustrated world edge to edge with the game name as lettering on a plate.');
  else line('hero', hero.id + (form ? ' data-form="' + form + '"' : '') + ': copy the hero section of ' + ref + '/assets/layout/' + hero.demo + (form === 'foot' ? ' · Use a photograph with a calm lower left at both crops. Fall back to bleed when it has none.' : '') + (['split','collage'].includes(hero.id) && page === 'software' && headline === 'across' ? ' · For a work-led window add data-work-window.' : '') + (peek ? ' · ' + peekLine : '') + (sceneHero ? '. Use the dealt scene for the hero visual and entrance.' : ''));
  if (book) console.log('  ' + bookLine);
  if (action === 'trial') line('destination','Use a link button to the app. With no address use https://app.brand.example/signup and data-needs="sign-up address". List it first under Client must supply.');
  if (page === 'service') line('work', 'Use supplied project titles or caption the kinds of work. List every stand-in with its section first under Client must supply. Give process steps their deliverables and only durations from the brief.');
  if (order) line('order', 'put the configurator or order pad within the first three sections; give supplied delivery and return terms at the close');
  const entranceDetail = entrance.markup.replace(/^data-enter(?:="[\w-]+")?\s*/, '').replace(/^\((.*)\)$/, '$1');
  line('entrance', 'data-enter="' + entrance.id + '" on the hero' + (entranceDetail && entrance.id !== 'rise' ? ' ' + entranceDetail : '') + '. ' + entrance.sees + ' (references/motion.md, Build the plan)');
  line('headline', headline + (split && headline === 'across' ? ': add data-headline="across" to stack the picture below the full-width copy.' : form === 'bleed' && headline === 'split' ? ': add data-headline="split" for a seven-column panel.' : split && headline === 'split' ? ': keep seven copy columns and five picture columns. Omit data-work-window from the side-by-side template.' : ''));
  line('action', actionColour + ': set data-action="' + actionColour + '" on html.');
  if (shows) shows.forEach((subject,i) => line('section ' + (i+1), 'shows  ' + subject));
  line('nav', plan.nav + ': link directly. A panel groups several real destinations.' + (page === 'software' ? ' Put supplied sign-in, docs, status or store routes here and in the footer. Otherwise link the setup section as Quickstart in both.' : ''));
  line('close', closeTaken ? 'none: ' + closeTaken + ' is the close. Keep only the footer links row.' : close + (close === 'close-form' ? ' (the full form in the last section of main, starter.html close-form template)' : ' in the last section of main (use only if the final section has no form or booking panel)'));
  line('footer', plan.footer + (footerWordmark ? ' with data-wordmark="large"' : '') + ': group supplied product parts, page sections, company routes and legal links by task. Set the name, links and supplied legal line in a row for sparse destinations. A column heading needs at least three links. Put a statement or gradient ground on the closing section, leaving the links on their own ground.');
  line('buttons', 'data-buttons="' + plan.buttons + '" on <html>' + (expressive ? ' (an expressive family, expressive.css; name its source, else take solid)' : '') + (plan.buttons === 'arrow' ? ' (keep the main button text-only)' : '') + ' · mark data-mark="' + plan.mark + '" (or the client\'s logo)');
  line('grounds', groundLine(plan.grounds) + (techPage ? ' Use data-ground="' + ['sand', 'sky', 'sage'][Math.floor(Math.random() * 3)] + '" on <html>.' : ''));
  line('density', 'data-density="' + plan.density + '" on <html>');
  line('align', plan.align + (plan.align === 'left' ? '' : gradient?.slot === 'close' ? ': use .section-head--center on proof only' : ': use .section-head--center on those headings') + '. Keep headings left on bands with a left text zone.');
  line('pictures', plan.pictures + ': set data-pictures="' + (plan.pictures === 'square' ? 'square' : 'soft') + '" on <html>' + (plan.pictures.includes('mask') ? ' and data-picture-mask on one inset picture frame' : ''));
  for (const [key, v] of Object.entries(comps)) {
    if (key === 'feature' && !assets.has('photo')) continue;
    line('composition', COMP_WHAT[key] + ': ' + (Array.isArray(v) ? v.join(', then ') + ' (no composition twice in a row)' : v) + ' (references/sections-library.md, Compositions)');
  }
  console.log('  Use a dealt composition for photographs with words. Steps, a core view, plans, a comparison, cases with facts, hours or a booking take an own section (references/compose.md). An own section is never drift.');
  line('own', 'at least ' + (plan.own === 1 ? 'one section of this page is' : 'two sections of this page are') + ' your own design for its content (data-own); name ' + (plan.own === 1 ? 'it' : 'them') + ' in the plan');
  console.log('  Take a seed as a prompt for your own section where the content has that shape, or compose something else (references/compose.md).');
  for (const s of ideas) line('ideas', s.id + ': ' + s.line);
  for (const [name, why] of Object.entries(sub)) line('sub', name + ': ' + why + '. ' + ref + '/subskills/' + name + '/SKILL.md');
  if (!techPage || assets.has('photo')) line('photos', "show the subject itself with client pictures, a built view or a matching photograph (references/photos.md)");
  line('reveals', reveals === 'fade' ? 'fade · mark one section content block data-reveal="fade".' : 'none');
  if (!motion.picks.length) line('moment', 'none');
  motion.picks.forEach((m, i) => {
    const place = motion.rides[m.id] ? rideLine(motion.rides[m.id]) : m.fits.includes('closing') ? 'at the close' : 'in a content section';
    line('moment ' + (i + 1), m.id + ' ' + place + (i === 0 && m.early ? ', within the first three screens' : '') + ': ' + momentSource(m.id) + ', link assets/moments/' + m.id + '/moment.css' + textRule(m.text) + (m.id === 'photo-chapters' ? '. Phone photographs flow with their captions' : m.phoneRuns ? '. Runs on a phone' : '') + ' (references/moments.md)');
  });
  line('scene', motion.scene ? motion.scene + ' ' + (sceneHero ? 'as the hero' : sceneClose ? 'at the close' : 'in the matching content section') + ': ' + ref + '/assets/scenes/' + motion.scene + '/demo.html. Link scenes.css and ' + motion.scene + '/scene.css and load scenes.js.' : 'none');
  line('parts', 'Copy matching static markup and its local stylesheet and script (references/interactions.md).');
  for (const part of parts) line('  ' + part.id, ref + '/' + part.path + ' · ' + part.needs);
  if (parts.some(p => ['feature-tabs','logo-row','video-inview'].includes(p.id))) line('playback', 'When two frames can share a viewport or more than two play automatically, set data-playback="manual" on extra tabs, film or logo rows.');
  if (demo) line('demo', 'loop in the ' + demo.place + ' only, 8 to 14 seconds. Script 3 to 5 steps from the notes: ' + demo.source);
  else if (page === 'software' && (typeof opt('has') === 'string' && assets.has('ui') || rows.some(row => /\b(product window|core view)\b/i.test(row)))) line('demo', 'still: keep product windows on their complete result. Set data-ui-still on a kit UI fragment.');
  if (gradient?.tier === 'quiet') {
    line('gradient', 'quiet mist · ' + gradient.place + '. node "' + path.join(skill,'tools','gradient.mjs') + '" --tier quiet --preset mist --from index.html --zone left --seed ' + gradient.seed + ' --out assets/field.css');
  } else if (gradient) {
    const command = 'node "' + path.join(skill,'tools','gradient.mjs') + '" --tier show --preset ' + gradient.preset +
      ' --from index.html --zone left --seed ' + gradient.seed + (gradient.placement ? ' --placement ' + gradient.placement : '');
    line(gradient.moving ? 'moving field' : 'gradient', 'show ' + gradient.preset + ' · ' +
      gradient.place + (gradient.slot === 'close' ? '; set data-text-zone="left" on the closing section' : '') + '; white ink in the left 38%; hues ' + (gradient.hues?.join(', ') || 'art accent at 0, −29, −58 and −87 degrees; brand resolves the four colours') + '. ' +
      command + (gradient.moving ? ' --format settings --out assets/field.json' : ' --out assets/field.css'));
    if (gradient.moving) line('mount', 'node "' + path.join(skill,'scripts','effects.mjs') + '" mount --settings assets/field.json');
  }
  line('effect', effect || 'none this page');
  line('tools', tools + '. Use only what the section needs.');

  line('hover layer', 'Colour or underline on hover; press .98 (references/motion.md)');
  if (motion.picks.length) line('re-deal', 'to replace one moment, write "<id> (re-dealt for <the old id>)" on the plan comment\'s moments line.');
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
    console.error(`start: ${t.id} is not on the ${page} list; pick one from: node "${fileURLToPath(import.meta.url)}" types --page ${page} (--force to use it anyway).`);
    process.exit(2);
  }
  let p;
  if (cmd === 'css') {
    if (opt('brand') !== undefined) {
      try {
        const {generate} = await import('../tools/lib/palette.js');
        p = generate({brand:opt('brand')}).json;
      } catch (error) { console.error('start: --brand '+error.message); process.exit(2); }
    } else p = lib('palettes.json').find(x => x.id === opt('palette'));
    if (!p) { console.error('start: --palette <id> from library/palettes.json is required'); process.exit(1); }
  } else {
    p = { bg: opt('bg'), ink: opt('ink'), accent: opt('accent'), surface: opt('surface', undefined), muted: opt('muted', undefined), fields: [] };
    if (typeof p.bg !== 'string' || typeof p.ink !== 'string' || typeof p.accent !== 'string') { console.error('start: brand needs --bg --ink --accent'); process.exit(1); }
  }
  const radius = ['sharp', 'soft', 'round'].includes(opt('radius')) ? opt('radius') : 'soft';
  const tk = tokens(p, cmd === 'css');
  if (tk.derived) console.log('<!-- Surface tint derived from the page ground at 6% OKLCH lightness distance. -->');
  const planFile = path.join(path.dirname(histFile), 'plan.json');
  const materials = [];
  if (fs.existsSync(planFile)) {
    const dealt = JSON.parse(fs.readFileSync(planFile,'utf8'));
    if (dealt.kind === page && dealt.type === t.id && (dealt.palette === p.id || dealt.palette === 'art' || cmd==='css' && opt('brand')!==undefined)) {
      if ((cmd === 'brand' && !dealt.gradient?.hues || cmd === 'css' && opt('brand')!==undefined) && dealt.gradient?.tier === 'show') {
        const {spectrum} = await import('../tools/lib/colour.js');
        const field = dealt.gradient;
        field.hues = spectrum(tk.accent,.88);
        field.placement = field.slot === 'close' || color.isDark(tk.bg) ? 'ground' : 'panel';
        field.place = field.slot === 'close' ? 'closing band' : field.placement === 'ground' ? 'dark hero ground' : 'hero panel';
        writeHistory(planFile,dealt,2);
        console.log('<!-- Show field: '+field.place+', left reading zone, '+field.hues.join(', ')+' -->');
      }
      for (const {id} of dealt.parts || []) {
        if (['nav-highlight','menu-sheet','form-states'].includes(id) || !/^[a-z]+(?:-[a-z]+)*$/.test(id)) continue;
        const file = 'assets/motion/parts/' + id + '/part.css';
        if (fs.existsSync(path.join(here,'..',file))) materials.push(file);
      }
      if (dealt.gradient && !dealt.gradient.moving) materials.push('assets/field.css');
    }
  }
  console.log(block(tk, typeVars(t), radius, materials));
  if (cmd === 'css') {
    const h = readHistory(histFile);
    h.palettes.push(p.id); h.types.push(t.id);
    writeHistory(histFile, h);
  }
} else {
  console.log('usage: node scripts/start.mjs plan --page <kind> [--sections N] [--carry words,list,photos,steps,figures] [--action booking|order|trial|visit|contact] [--booking stay|table|class] [--last-section form] | deal --page <kind> | css --page <kind> (--palette <id> | --brand <hex>) --type <id> [--radius soft] | brand --page <kind> --bg .. --ink .. --accent .. --type <id> | types --page <kind>\n  kind: ' + PAGES.join(' | '));
}
