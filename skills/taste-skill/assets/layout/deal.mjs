#!/usr/bin/env node
/*
  taste-skill layout deal - deals the hero (heroes.json) for a page at random, weighted by the business
  type, away from the last pages' deals (references/layout-v4.md). It deals the hero only: the type
  pairing comes from start.mjs (VI-02), and its :root lines stay as start.mjs prints them. A place
  with a photograph gets hero-place, in one of four forms dealt here (band, bleed, split, name: layout.css 0b),
  away from the last two places' forms; --form <id> prints that one. No photograph: the statement hero.

    node <skill>/assets/layout/deal.mjs --type software|product|place|service
         [--kind tech]                         hardware or a tech device (page type product, kind tech): the grounds, moments
                                               and effects print as for software; without it a product, service or
                                               place prints none (kind other is flat)
         [--kind gaming]                       a game: page type software, kind gaming (SKILL.md section 1).
                                               It deals the game's world or actual product window;
                                               --type gaming means the same. Also read as a game:
                                               --type software with film, photo or setting in --has and no ui
         [--has photo,ui,film,object,setting,ground,logo,art]   material supplied by the brief
         [--action booking|order|trial|visit|contact]          booking adds a bar to a place or service hero
         [--hero <id>]                         print that one instead of dealing it
         [--history .taste-skill/layout-history.json] [--json] [--stats 1000]

  Prints the hero: its demo page, its numbers, and the moment, ground and effect ids that fit the type
  (tech-only ids and effects for software only). word and editorial need a face with a wght or wdth
  axis: when start.mjs's pairing has none, deal the type again with start.mjs (VI-02).
  Node 18+, no packages.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const { heroes } = JSON.parse(fs.readFileSync(path.join(here, 'heroes.json'), 'utf8'));
const TYPES = ['software', 'product', 'place', 'service'];
let type = opt('type');
if (type === 'gaming') type = 'software';   // a game is page type software, kind gaming
if (!TYPES.includes(type) && !opt('hero')) { console.error('deal: --type software|product|place|service (a game: --kind gaming)'); process.exit(2); }
// A product uses a built view until the brief supplies its own picture.
const HAS = { software: ['ui', 'ground'], product: ['ground'], place: ['photo', 'ground'], service: ['photo', 'ground'] };
const given = typeof opt('has') === 'string' ? String(opt('has')).split(',').map(s => s.trim()).filter(Boolean) : null;
const gaming = type === 'software' && (opt('kind') === 'gaming' || opt('type') === 'gaming'
  || (!opt('kind') && given && !given.includes('ui') && (given.includes('film') || given.includes('photo') || given.includes('setting'))));
const has = new Set(given ? given.concat('ground') : (gaming ? ['ground'] : (HAS[type] || [])));
// A game can supply its actual playable window with --has ui.
if (!gaming && has.delete('setting')) has.add('photo');   // only a game has a setting: on any other page it is a photograph
const weightKey = gaming ? 'gaming' : type;    // the types weights to read
const histFile = opt('history');
let hist = { heroes: [] };
if (histFile) try { hist = { heroes: [], ...JSON.parse(fs.readFileSync(histFile, 'utf8')) }; } catch { /* a new history */ }

// weighted draw, away from the recent ones while others are left
function draw(list, weight, recent) {
  const fresh = list.filter(x => !recent.includes(x.id));
  const pool = (fresh.length ? fresh : list).filter(x => weight(x) > 0);
  const total = pool.reduce((a, x) => a + weight(x), 0);
  let r = Math.random() * total;
  for (const x of pool) { r -= weight(x); if (r <= 0) return x; }
  return pool[pool.length - 1];
}
const needsMet = h => h.needs.every(n => n.split('|').some(k => has.has(k))) && !(h.avoid || []).some(k => has.has(k));
// heroes.json moments / grounds / effects are { id, only?, dark?, as? }: only "tech" is for software briefs
// Tech is software, a game, or hardware passed as --kind tech. Every other page (product, service, place)
// is flat: heroes.json's grounds, moments and effects are all tech-only except the photograph ground,
// so a page of kind other is printed none (backgrounds.md "Other kinds stay flat").
const tech = type === 'software' || opt('kind') === 'tech';   // a game counts as tech
const fits = x => (tech ? (!x.only || x.only === 'tech') : (!x.only && x.id === 'photo'));
const ids = list => (list || []).filter(fits).filter(x => !x.dark).map(x => x.id);
const darkIds = list => (list || []).filter(fits).filter(x => x.dark).map(x => x.id);

const productPage = type === 'product' || ['tech', 'product'].includes(opt('kind'));
function dealOnce(recentHeroes) {
  let hero = opt('hero') && opt('hero') !== true ? heroes.find(h => h.id === opt('hero')) : null;
  // a place: the place hero in one of its four forms (dealt below); with no photograph, the statement hero on .ground-brand
  if (!hero && type === 'place') hero = heroes.find(h => h.id === (has.has('photo') ? 'place' : 'statement'));
  if (!hero && !productPage && has.has('object') && !has.has('photo') && !has.has('film')) hero = heroes.find(h => h.id === 'product');
  // A product with no photograph or art uses the split for its built view.
  if (!hero && productPage && !has.has('photo') && !has.has('art') && !has.has('film')) hero = heroes.find(h => h.id === 'split');
  if (!hero && gaming && has.has('setting') && !has.has('ui') && !has.has('film')) hero = heroes.find(h => h.id === 'photo');
  if (!hero) {
    const ok = heroes.filter(h => h.id !== 'place' && (h.id !== 'product' || !productPage || has.has('photo') || has.has('art')) && (h.types[weightKey] || 0) > 0 && needsMet(h));
    if (!ok.length) { console.error(`deal: no hero for ${gaming ? 'a game' : type} with ${[...has].join(', ')}`); process.exit(1); }
    hero = draw(ok, h => h.types[weightKey], recentHeroes);
  }
  return hero;
}
if (opt('stats')) {
  const n = parseInt(opt('stats'), 10) || 1000, H = {};
  const rh = [];
  for (let i = 0; i < n; i++) { const h = dealOnce(rh.slice(-3)); rh.push(h.id); H[h.id] = (H[h.id] || 0) + 1; }
  const show = o => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${Math.round(100 * v / n)}%`).join(', ');
  console.log(`${n} pages of ${gaming ? 'a game' : 'type ' + type} with ${[...has].join(', ')}, each away from the last pages' deals:
heroes: ${show(H)}`);
  process.exit(0);
}
const hero = dealOnce(hist.heroes.slice(-3));
if (!hero) { console.error('deal: unknown --hero id'); process.exit(2); }

// a place's hero has four forms (layout.css 0b), dealt away from the last two: two cafes in a row never share one.
// A place with no photograph keeps the statement hero (sections.md section 2), so no form is dealt.
// band is the old place hero the rework moves away from: it stays in the deck at the lowest weight (about one place in nine)
const PLACE_FORMS = [
  { id: 'band', w: 1, how: 'the photograph under the header down to the words; the words end on the fold. data-form="band"' },
  { id: 'bleed', w: 3, how: 'the photograph over the whole first screen; the h1, the line and the button on a solid panel of the page ground in its lower left corner (data-corner="end" when the calm side is right). data-form="bleed"' },
  { id: 'split', w: 3, how: 'the words on five columns (the h1 at the top, the line and the button at the foot), the photograph on seven down to the fold. data-form="split"' },
  { id: 'name', w: 2, how: 'band, with the name or the street set large across the .wrap first in .hero__text: <p class="hero__name">Henderson Street</p>. It is the page\'s one type moment (the address|name moment is then this). data-form="name"' },
];
let placeForm = null;
if (hero.id === 'place') {
  const forced = opt('form') && opt('form') !== true ? PLACE_FORMS.find(f => f.id === opt('form')) : null;
  const recent = (hist.placeForms || []).slice(-2);
  placeForm = forced || draw(PLACE_FORMS, f => f.w, recent);
}

const window = !!hero.window && has.has('ui') && tech;
const recentPeeks = (hist.heroPeek || []).slice(-2);
const peek = window && (recentPeeks.length === 2 && recentPeeks[0] === recentPeeks[1] ? !recentPeeks[0] : Math.random() < 0.5);
const book = opt('action') === 'booking' && ['place', 'service'].includes(opt('kind') || type);
const peekLine = 'class hero--peek: the window may run past the first screen (its top inside it, at least 420 px showing at 1440x900), up to 760 px tall';
const bookLine = "hero-book: a one-row booking bar docked on the hero's foot (copy the commented form in assets/layout/hero-place.html; assets/own/booking-bar.html shows the full section); the full form stays at the close";
if (histFile && !opt('hero') && !opt('no-record')) {
  if (window) hist.heroPeek = [...(hist.heroPeek || []), peek].slice(-20);
  if (type !== 'place') { hist.heroes.push(hero.id); hist.heroes = hist.heroes.slice(-20); }
  if (placeForm && !opt('form')) hist.placeForms = [...(hist.placeForms || []), placeForm.id].slice(-12);
  fs.mkdirSync(path.dirname(path.resolve(histFile)), { recursive: true });
  const pending = histFile + '.' + process.pid + '.tmp';
  try {
    fs.writeFileSync(pending, JSON.stringify(hist, null, 1) + '\n');
    fs.renameSync(pending, histFile);
  } finally {
    fs.rmSync(pending, { force: true });
  }
}

if (opt('json')) {
  console.log(JSON.stringify({ type, kind: gaming ? 'gaming' : undefined, has: [...has], hero, peek, book, peekLine, bookLine, form: placeForm ? placeForm.id : undefined }, null, 1));
} else {
  const s = h => (typeof h === 'object' ? Object.entries(h).map(([k, v]) => `    ${k}: ${v}`).join('\n') : h);
  const axis = hero.id === 'word' || hero.id === 'editorial' ? ' This hero needs a face with a wght or wdth axis.' : '';
  console.log(`hero: ${hero.id} (${hero.name})  demo: <skill>/assets/layout/${hero.demo}${placeForm ? `\n  form: ${placeForm.id}: ${placeForm.how}` : ''}
  ${hero.job}${peek ? '\n  ' + peekLine : ''}${book ? '\n  ' + bookLine : ''}
  h1: ${hero.h1.token} ${hero.h1.size.join(' / ')}px, leading ${hero.h1.leading}, at most ${hero.h1.lines.join(' / ')} lines, ${hero.h1.maxChars} characters
  grid:\n${s(hero.grid)}
  at 1440:\n${s(hero.at1440)}
  at 390:\n${s(hero.at390)}
  moment: ${hero.moment}${tech ? '' : '\n  grounds: flat (kind other: flat colour, photographs, type; --kind tech for hardware); one moment, a second on a long page and an occasional scene are dealt by fit (start.mjs plan, or moments.mjs pick --page <kind> --scene deal)'}${ids(hero.moments).length ? `\n  moments: ${ids(hero.moments).join(', ')}` : ''}${ids(hero.grounds).length ? `\n  grounds: ${ids(hero.grounds).join(', ')}` : ''}${darkIds(hero.grounds).length ? `\n  grounds on a dark page: ${darkIds(hero.grounds).join(', ')}` : ''}${hero.effects && hero.effects.length && tech ? `\n  effects: ${hero.effects.map(e => e.id).join(', ')}` : ''}
  mistakes: ${hero.mistakes.join('; ')}

type: the pairing start.mjs dealt (VI-02); keep its :root lines as printed (headlines 400; 400 to 500 on tech).${axis}`);
}
