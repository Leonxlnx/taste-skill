#!/usr/bin/env node
/*
  taste-skill backgrounds pick.mjs - deals a page's grounds at random, in a calm rhythm.

    node <skill>/assets/backgrounds/pick.mjs --type software --sections hero-split,logo-row,features-2x2,bento,quote-stat,pricing-three,faq,closing-band
                                             [--roles hero,body,body,proof,close] [--effect] [--seed S] [--mode light|dark] [--history .taste-skill/bg-history.json] [--json]

  Grounds are dealt to software, tech and gaming pages only (VI-41, VI-42). --type product, service or place
  (site-kind other) is answered with plain for every section and no page ground: those pages are flat colour and
  photographs. A product page with a technical subject says so with --kind tech (or software, gaming) and is dealt as software.

  --sections takes the plan's section ids (nav and footer ids are skipped); a section the rhythm already
  gives a band keeps it: bento:dark (.ground-inverse), bento:band (lit ground), bento:surface (.ground-surface),
  and is dealt nothing; --roles takes roles instead
  (hero, body, proof, close). No page ground is dealt: the page keeps its flat tokens, and every section
  that is not given a ground stays plain on them (VI-42: at most 2 CSS grounds a page beyond the flat tokens).
  The grain ground and the paper page ground are never dealt (a ground with grain is the page's one effect,
  chosen by hand under effects-usage.md); --effect says another effect is already dealt, and the textured
  grounds (field, stage, deep, liquid) are skipped too. The result is a list: one ground or "plain"
  per section. A section that brings its own ground (hero-photo, photo-band, closing-photo, closing-band)
  is kept as it is and counts as a strong neighbour. Also an ES module: import { deal } from './pick.mjs'.

  The rhythm rules (references/backgrounds.md) are checked on every deal, by random attempts until one
  holds: 2 grounds a page (the cap, VI-42); each ground once; two grounds that list each other in "avoids" never
  share a page; no two neighbours both strong (a hard ground, or weight 2 or 3); never three dealt
  grounds in a row (moot at two); at most one loud ground (weight 3) up to six sections, two up to ten; at most two
  dark ones; a page of five sections or more holds at least one strong ground and at least one coloured
  one (band, field or stage: never a page of pale washes and dark bands only). A ground used in
  the last 20 deals is less likely. Grounds that list their sections (index.json) go to those; band and
  field also fit by role when the plan has none of their ids, so every plan gets its colour. Dusk
  melts into the page at both ends, so it needs no particular neighbour.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TYPES = ['software', 'product', 'place', 'service'];
const FLAT_TYPES = new Set(['product', 'place', 'service']);   // flat pages: no ground is dealt (VI-41)
const TECH_KINDS = new Set(['tech', 'software', 'gaming']);
const DARK = new Set(['horizon', 'deep', 'photo']);

/* a section id -> its role, or null when it is skipped, or 'own' when it brings its own ground */
export function roleOf(id) {
  if (/^(nav|footer)/.test(id)) return null;
  if (/^(hero-photo|photo-band|media-band|closing-photo|closing-band)$/.test(id)) return 'own';
  if (/^hero/.test(id)) return 'hero';
  if (/^(closing|close)/.test(id)) return 'close';
  if (/^(quote|stat|logo|customer-proof|press)/.test(id)) return 'proof';
  return 'body';
}
const OWN_LOUD = new Set(['hero-photo', 'photo-band', 'media-band', 'closing-photo']);

function strHash(s) { let h = 2166136261 >>> 0; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function random(seed) {
  let a = strHash(seed) || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const strong = g => !!g && (g.kind === 'hard' || g.weight >= 2);

/**
  index: backgrounds index.json (its "grounds"). opts: { type, kind, sections: [ids] | roles: [roles], seed, history: [ids] }.
  Returns { seed, page: null, picks: [{ section, role, ground | null, own? }], notes }.
*/
export function deal(index, opts = {}) {
  let type = opts.type;
  if (!TYPES.includes(type)) throw new Error(`pick: --type is one of ${TYPES.join(', ')}`);
  if (type === 'product' && TECH_KINDS.has(opts.kind)) type = 'software';   // only a technical product page is dealt as tech (VI-41); place and service stay flat
  const flat = FLAT_TYPES.has(type);
  const ids = opts.sections && opts.sections.length ? opts.sections : (opts.roles || []);
  // an id may carry a flag for a section the page's rhythm already gives a ground (sections.md): id:dark is a
  // .ground-inverse band (strong, dark), id:band a lit-ground band (strong), id:surface a .ground-surface band (calm).
  // Such a section keeps that ground and is dealt none.
  const slots = ids.map(id => {
    const [name, flag = ''] = String(id).split(':'), r = opts.sections ? roleOf(name) : name;
    return { section: id, name, flag, role: r && ['dark', 'band', 'surface'].includes(flag) ? 'own' : r };
  }).filter(s => s.role);
  if (!slots.length) throw new Error('pick: give --sections (the plan\'s ids) or --roles');
  for (const s of slots) if (!['hero', 'body', 'proof', 'close', 'own'].includes(s.role)) throw new Error(`pick: unknown role "${s.role}" (hero, body, proof, close)`);
  const n = slots.length;
  if (flat) {   // product, service and place stay flat: plain for every section, no page ground (VI-41)
    return { seed: String(opts.seed ?? ''), page: null, picks: slots.map(s => ({ section: s.section, role: s.role, ground: null, ...(s.role === 'own' ? { own: true } : {}) })), notes: ['pick: a ' + opts.type + ' page is flat (VI-41): every section stays plain, no page ground.' + (opts.type === 'product' ? ' A technical subject: --kind tech' : '')] };
  }
  const byId = new Map(index.grounds.map(g => [g.id, g]));
  // never dealt: paper (the page ground) and grain (a grain ground is the page's one effect, VI-42); with opts.effect the textured grounds go too
  const pool = index.grounds.filter(g => g.dealt !== false && g.id !== 'paper' && g.id !== 'grain' && !(opts.effect && g.texture) && g.types.includes(type));
  const seed = opts.seed != null && opts.seed !== '' ? String(opts.seed) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rand = random(seed);
  const recent = (opts.history || []).slice(-20);
  const maxLoud = n <= 6 ? 1 : 2;
  const notes = [];

  // a ground that lists its sections (index.json "sections") goes to those ids. A "strict" one (photo, horizon, deep, liquid,
  // arcs, stage, ruled) goes nowhere else. A byRole one (band, field) also fits by role when NONE of its listed sections is in
  // the plan, so a plan without those ids still gets its colour.
  const listedIn = g => slots.some(s => g.sections.includes(s.name));
  const fits = (g, slot) => {
    if (!(opts.sections && g.sections)) return fitsRole(g, slot.role);
    if (g.sections.includes(slot.name)) return true;
    return !!g.byRole && !g.strict && !listedIn(g) && fitsRole(g, slot.role);
  };
  const fitsRole = (g, role) => role === 'hero' ? g.roles.includes('hero')
    : role === 'close' ? g.roles.includes('close')
    : g.roles.some(r => r === 'body' || r === 'band' || r === 'proof') && (role !== 'proof' || g.roles.includes('proof') || g.roles.includes('body'));
  const weightOf = (g, nbrs, used) => {
    const uses = recent.filter(x => x === g.id).length;
    let w = Math.pow(0.35, uses);
    if (recent.lastIndexOf(g.id) >= recent.length - 5 && recent.includes(g.id)) w *= 0.5;
    for (const nb of nbrs) if (nb && (g.pairs || []).includes(nb.id)) w *= 1.6;
    return w;
  };
  const choose = (cands, nbrs, used) => {
    const ws = cands.map(g => weightOf(g, nbrs, used)), tot = ws.reduce((s, x) => s + x, 0);
    let r = rand() * tot, i = 0;
    while (i < ws.length - 1 && (r -= ws[i]) > 0) i++;
    return cands[i];
  };

  const valid = pl => {                                   // pl: ground or null per slot
    const dealt = pl.filter(Boolean);
    if (dealt.length < Math.min(2, n) || dealt.length > 2) return false;
    if (new Set(dealt.map(g => g.id)).size !== dealt.length) return false;
    for (const a of dealt) for (const b of dealt) if (a !== b && (a.avoids || []).includes(b.id)) return false;
    const strongAt = pl.map((g, i) => strong(g) || (slots[i].role === 'own' && slots[i].flag !== 'surface'));
    for (let i = 1; i < n; i++) if (strongAt[i] && strongAt[i - 1]) return false;
    // a section with its own ground (not a calm surface band) counts as grounded for the run of three and the page total
    const occ = pl.map((g, i) => !!g || (slots[i].role === 'own' && slots[i].flag !== 'surface'));
    for (let i = 2; i < n; i++) if (occ[i] && occ[i - 1] && occ[i - 2]) return false;
    if (occ.filter(Boolean).length > 5) return false;
    const loud = pl.filter((g, i) => (g && g.weight === 3) || OWN_LOUD.has(slots[i].name)).length;
    if (loud > maxLoud) return false;
    if (dealt.filter(g => DARK.has(g.id)).length + slots.filter(s => s.flag === 'dark').length > 2) return false;
    if (n >= 5 && !strongAt.some(Boolean)) return false;
    if (needColour && !hasColour(pl)) return false;
    return true;
  };

  // a page of five sections or more holds a coloured ground (band, field, stage) besides the dark ones: the page is
  // never one pale wash. A band the rhythm already gives (id:band) counts. Relaxed after 450 failed attempts.
  const COLOURED = new Set(index.grounds.filter(g => g.coloured && g.dealt !== false && g.id !== 'grain').map(g => g.id));
  let needColour = n >= 5;
  const hasColour = pl => pl.some(g => g && COLOURED.has(g.id)) || slots.some(s => s.flag === 'band');
  let plan = null;
  for (let t = 0; t < 600 && !plan; t++) {
    if (t === 450 && needColour) { needColour = false; notes.push('pick: no deal with a coloured ground found; the page may be all pale'); }
    const free = slots.map((s, i) => (s.role === 'own' ? -1 : i)).filter(i => i >= 0);
    if (free.length < 2) { notes.push('pick: fewer than two sections can take a ground; the page ground only'); break; }
    const want = Math.min(free.length, 2);
    const at = new Set();
    const hero = free.find(i => slots[i].role === 'hero'), close = [...free].reverse().find(i => slots[i].role === 'close');
    if (hero != null && rand() < 0.8) at.add(hero);
    if (close != null && close !== hero && rand() < 0.5) at.add(close);
    while (at.size < want) at.add(free[Math.floor(rand() * free.length)]);
    const pl = new Array(n).fill(null);
    let ok = true;
    for (const i of [...at].sort((a, b) => a - b)) {
      const used = pl.filter(Boolean);
      const cands = pool.filter(g => fits(g, slots[i]) &&!used.some(u => u.id === g.id || (u.avoids || []).includes(g.id) || (g.avoids || []).includes(u.id)));
      if (!cands.length) { ok = false; break; }
      pl[i] = choose(cands, [pl[i - 1], pl[i + 1]], used);
    }
    if (ok && valid(pl)) plan = pl;
  }
  if (!plan) { notes.push('pick: no calm deal found; every section stays plain on the page ground'); plan = new Array(n).fill(null); }
  return { seed, page: null, picks: slots.map((s, i) => ({ section: s.section, role: s.role, ground: plan[i] ? plan[i].id : null, ...(s.role === 'own' ? { own: true } : {}) })), notes };
}

export function readIndex() { return JSON.parse(fs.readFileSync(path.join(HERE, 'index.json'), 'utf8')); }

/* ---------------------------------------------------------------- command line */
// a path compared by its real location, so a symlinked install (install.sh) is the same file
const realOf = (p) => { try { return fs.realpathSync(p).toLowerCase(); } catch { return path.resolve(p).toLowerCase(); } };
if (process.argv[1] && realOf(process.argv[1]) === realOf(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
  const list = k => (opt(k) && opt(k) !== true ? String(opt(k)).split(',').map(s => s.trim()).filter(Boolean) : null);
  const die = m => { console.error(m); process.exit(1); };
  const histFile = opt('history') && opt('history') !== true ? opt('history') : null;
  let hist = {};
  if (histFile && fs.existsSync(histFile)) { try { hist = JSON.parse(fs.readFileSync(histFile, 'utf8')); } catch { hist = {}; } }
  if (Array.isArray(hist)) hist = { picks: hist };
  hist.grounds = Array.isArray(hist.grounds) ? hist.grounds : [];
  let out;
  try {
    out = deal(readIndex(), { type: opt('type'), kind: opt('kind') === true ? undefined : opt('kind'), sections: list('sections'), roles: list('roles'), effect: !!opt('effect'), seed: opt('seed') === true ? undefined : opt('seed'), history: hist.grounds.map(x => x.id) });
  } catch (e) { die(e.message); }
  for (const x of out.notes) console.error(x);
  if (histFile) {
    const at = new Date().toISOString();
    hist.grounds.push(...out.picks.filter(p => p.ground).map(p => ({ id: p.ground, at, seed: out.seed })));
    hist.grounds = hist.grounds.slice(-200);
    fs.mkdirSync(path.dirname(path.resolve(histFile)), { recursive: true });
    fs.writeFileSync(histFile, JSON.stringify(hist, null, 1) + '\n');
  }
  if (opt('json')) console.log(JSON.stringify(out));
  else {
    const dark = opt('mode') === 'dark';
    const label = p => p.own ? '(its own ground)' : !p.ground ? 'plain'
      : p.ground === 'stage' ? 'bg-stage  (a panel behind the visual: <div class="bg-stage"> round the card, never on the <section>)'
      : 'bg-' + p.ground + (dark && (p.ground === 'band' || p.ground === 'field') ? '  (inset by itself on a dark page; bg-bleed keeps it full-bleed)' : '');
    console.log(out.page ? `page    ${out.page}    seed ${out.seed}` : `page    flat       (no page ground; the flat tokens only)    seed ${out.seed}`);
    out.picks.forEach((p, i) => console.log(`${String(i + 1).padStart(2)}. ${p.section.padEnd(18)} ${label(p)}`));
  }
}
