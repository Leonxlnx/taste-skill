#!/usr/bin/env node
/*
  moments.mjs - the creative moments command line (taste-skill, references/moments.md).

    node scripts/moments.mjs index                      scan assets/moments/<id>/meta.json into index.json
    node scripts/moments.mjs list [--kind text] [--fits hero] [--page tech] [--json]
    node scripts/moments.mjs pick --page tech|gaming|software|place|product|service --history .taste-skill/history.json
                                  [--long] [--tone warm|editorial|product|tech|playful] [--scene deal|<id>]
                                  [--count 1|2|3] [--seed S] [--effects a,b] [--contexts n]
                                  [--exclude a,b] [--kind text,scroll] [--fits hero,section] [--photo|--no-photo] [--json]
    node scripts/moments.mjs scene --page <kind> --history .taste-skill/history.json [--tone t] [--seed S] [--json]
                                  deal 0 or 1 scene by fit (about one page in two gets one)
    node scripts/moments.mjs check <page.html> [--page tech] [--scene <id>] [--effects a,b] [--contexts n]
                                  audit a built page: its moments, the still rule, cards, the WebGL budget
    node scripts/moments.mjs gallery                    write assets/moments/gallery.html (every demo, one page)
    node scripts/moments.mjs serve --port 5720          static server for the taste-skill folder (5720-5729)
    node scripts/moments.mjs shoot --out <out-dir> --profile <profile-dir in the OS temp folder or .taste-skill>
                                  [--only a,b] [--widths 1440,390] [--states start,middle,end] [--port 5720] [--reduced]
                                  [--probe "<js expression>"]   (its value is printed after every state)
    node scripts/moments.mjs sheet --out <out-dir>        rebuild index.html from the shots in that folder
    (shoot --url assets/moments/_demo/in-card.html shoots one other page of the skill, e.g. a test page)

  pick deals by fit. --page is required: tech, gaming or software (ai and saas are tech and software;
  "technical product" is software), or place, product or service (a cafe, shop or guesthouse is a place,
  a studio, firm or clinic a service, a brand's goods a product). Every moment, scene and effect carries
  meta.tones (warm, editorial, product, tech, playful), meta.intensity (quiet, lively, bold) and
  meta.webgl (0 or 1), and FIT below says what each kind takes; nothing is locked to one kind. --tone
  narrows the deal to one tone of the brief (a cafe: warm; a hotel brand or an architect: editorial).
  Every page gets two moments, three on a long page (--long: eight sections or more), in different
  sections, and the first one dealt is lively or bold: it goes in the first three screens. Two may
  share a kind when one is a statement and the other a section. A retired moment (meta.retired,
  weight 0) is never dealt. --scene deal deals the scene first (as the scene command does) and then
  the moments around it. The WebGL budget: a page holds at most 4 live contexts (perf.mjs glPeak). The deal
  counts the contexts the page already spends - the big scene (--scene <id>: its `webgl` in
  assets/scenes/<id>/meta.json; it also leaves out that scene's avoidMoments, its twins and the ones that
  fight it, so neither pick nor check needs them as --exclude), each effect (--effects a,b: one each, worst case) and any others
  (--contexts n: objects, components) - and never deals a moment whose own meta.webgl would push the
  total over 4. Every moment has a still variant for reduced motion and one for phones (meta.phone,
  meta.reduced; the loader enforces it, moments.js), but a moment light enough for a phone runs there
  (meta.phoneRuns true, and `export const phone = true` in its moment.js: word-highlight, the film look
  of picture-develops, photo-chapters), and none may sit in a card (check reports it).

  scene reads every assets/scenes/<id>/meta.json at run time (a scene without tones is read by its
  `types`; on tech, software and gaming its `types` still name which of the three it suits), leaves
  out retired ones and every scene the history's `scenes` list holds (never one scene twice), and
  deals one about half the time when one fits; "none" is an answer, not a fault.

  pick deals two or three moments at random, seeded. The history file's `moments` list is read as
  cycles: once every moment that fits has been dealt, the next cycle starts empty, so an id comes
  back only after all the others, never straight after itself (the three dealt last stay out even
  across a cycle's end), and when a cycle has one fresh id left and two are asked for, that one is
  dealt first and the second comes from the ids dealt longest ago. Never two of one kind on a page
  (hover and liquid count as one kind: one pointer effect a page), never two of one slot, never two
  that list each other in meta.avoidWith, never two WebGL moments, and a moment that needs a
  photograph only with --photo. It appends the deal to the history (the same file start.mjs and
  effects.mjs use; their keys are kept).

  shoot opens every moment's demo page in one headless Chrome with WebGL on the CPU (SwiftShader),
  one page at a time, at each width, and captures the viewport in the start, middle and end states
  that meta.states describe (a scroll position, a wait, a pointer path), reloading the page for each
  state so load and enter moments are caught fresh. Files: <out>/<id>-<w>-<state>.png and a contact
  sheet <out>/index.html. Chrome is closed by its own PID.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets', 'moments');
const INDEX = path.join(DIR, 'index.json');
const KINDS = ['text', 'scroll', 'hover', 'transition', 'liquid'];
const FITS = ['hero', 'section', 'statement', 'closing', 'between'];
const TRIGGERS = ['load', 'enter', 'scroll', 'hover', 'pointer', 'loop'];
const COSTS = ['low', 'mid', 'high'];
const TECH = ['tech', 'gaming', 'software'];
const OTHER = ['place', 'product', 'service'];   // site-kind other: photographs, type and flat colour lead
const PAGES = [...TECH, ...OTHER];
const BUDGET = 4;                       // live WebGL contexts a page may hold (references/perf.md, perf.mjs glPeak)
export const TONES = ['warm', 'editorial', 'product', 'tech', 'playful'];
export const INTENSITIES = ['quiet', 'lively', 'bold'];
// the fit rule (references/moments.md, The fit rule): what each kind takes. A moment, scene or effect
// fits a kind when one of its tones is in the kind's tones, its intensity is in the kind's list and,
// with webgl 1, the kind takes WebGL. A cafe gets nothing too wild; a tech page may take anything.
export const FIT = {
  place:    { tones: ['warm', 'editorial'], intensity: ['quiet', 'lively'], webgl: false },
  service:  { tones: ['editorial', 'warm', 'product'], intensity: ['quiet', 'lively'], webgl: false },
  product:  { tones: ['product', 'editorial', 'warm'], intensity: ['quiet', 'lively', 'bold'], webgl: false }, // WebGL only as a photo treatment or a render the brief asks for
  tech:     { tones: ['product', 'tech', 'editorial'], intensity: INTENSITIES, webgl: true },
  software: { tones: ['tech', 'editorial', 'product'], intensity: INTENSITIES, webgl: true },
  gaming:   { tones: ['playful', 'tech'], intensity: INTENSITIES, webgl: true },
};
// a scene written before the fit fields: its types read as tones
const TYPE_TONES = { tech: ['tech', 'product'], software: ['tech'], gaming: ['playful'], place: ['warm'], service: ['editorial'], product: ['product'] };
export const tonesOf = x => (Array.isArray(x.tones) && x.tones.length ? x.tones : [...new Set((x.types || []).flatMap(t => TYPE_TONES[t] || []))]);
// does a moment, scene or effect fit this kind (and, with tone, carry that tone)? webglOk lets a
// WebGL item through on a kind without WebGL (an effect marked as a photo treatment)
export function fitsKind(x, kind, { tone, webglOk = false } = {}) {
  const f = FIT[kind];
  if (!f) return false;
  const tones = tonesOf(x);
  if (!tones.some(t => f.tones.includes(t))) return false;
  if (tone && !tones.includes(tone)) return false;
  if (!f.intensity.includes(x.intensity || 'lively')) return false;
  if ((x.webgl || 0) > 0 && !f.webgl && !webglOk) return false;
  return true;
}
const kindsFor = x => (x.retired ? [] : PAGES.filter(k => fitsKind(x, k)));
function toneArg(a, page) {
  if (a.tone == null) return undefined;
  const t = String(a.tone).toLowerCase();
  if (!TONES.includes(t)) die(`--tone "${a.tone}": use one of ${TONES.join(', ')}`);
  if (page && !FIT[page].tones.includes(t)) die(`--tone ${t} is not a tone a ${page} page takes (${FIT[page].tones.join(', ')})`);
  return t;
}
// page kinds as other files say them -> the three kinds a moment is dealt on
const PAGE_ALIAS = { tech: 'tech', technology: 'tech', ai: 'tech', gaming: 'gaming', game: 'gaming', games: 'gaming', software: 'software', saas: 'software', app: 'software', 'technical-product': 'software', 'tech-product': 'software',
  place: 'place', cafe: 'place', 'café': 'place', bar: 'place', bakery: 'place', restaurant: 'place', guesthouse: 'place', hotel: 'place', shop: 'place', florist: 'place', gym: 'place',
  product: 'product', brand: 'product', goods: 'product', service: 'service', studio: 'service', agency: 'service', firm: 'service', clinic: 'service', trade: 'service' };

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2), next = argv[i + 1];
      if (next == null || next.startsWith('--')) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}
const die = m => { console.error(m); process.exit(1); };
const list = v => (v && v !== true ? String(v).split(',').map(s => s.trim()).filter(Boolean) : null);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ------------------------------------------------------------------ index */
function validate(meta, folder) {
  const errs = [];
  for (const k of ['id', 'name', 'look', 'reduced']) if (typeof meta[k] !== 'string' || !meta[k].trim()) errs.push(`meta.${k} must be a non-empty string`);
  if (meta.id && meta.id !== folder) errs.push(`meta.id "${meta.id}" must match the folder "${folder}"`);
  if (!KINDS.includes(meta.kind)) errs.push(`meta.kind must be one of ${KINDS.join(', ')}`);
  if (!Array.isArray(meta.fits) || !meta.fits.length || meta.fits.some(f => !FITS.includes(f))) errs.push(`meta.fits must list some of ${FITS.join(', ')}`);
  if (!TRIGGERS.includes(meta.trigger)) errs.push(`meta.trigger must be one of ${TRIGGERS.join(', ')}`);
  if (!COSTS.includes(meta.cost)) errs.push(`meta.cost must be one of ${COSTS.join(', ')}`);
  if (typeof meta.webgl !== 'number' || meta.webgl < 0 || meta.webgl > 1) errs.push('meta.webgl must be 0 or 1 (at most one context)');
  if (!Array.isArray(meta.tones) || !meta.tones.length || meta.tones.some(t => !TONES.includes(t))) errs.push(`meta.tones must list some of ${TONES.join(', ')}`);
  if (!INTENSITIES.includes(meta.intensity)) errs.push(`meta.intensity must be one of ${INTENSITIES.join(', ')}`);
  if (meta.pages != null) errs.push('meta.pages is gone: the kinds a moment is dealt to come from meta.tones, meta.intensity and meta.webgl (the index writes them as "pages")');
  if (meta.retired != null && !(typeof meta.retired === 'string' && meta.retired.trim())) errs.push('meta.retired must say why');
  if (typeof meta.phone !== 'string' || !meta.phone.trim()) errs.push('meta.phone must say what a phone shows (a static variant, or how it runs there with phoneRuns)');
  if (meta.phoneRuns != null && typeof meta.phoneRuns !== 'boolean') errs.push('meta.phoneRuns must be true or false');
  if (meta.phoneRuns && !/export const phone = true/.test(fs.existsSync(path.join(DIR, folder, 'moment.js')) ? fs.readFileSync(path.join(DIR, folder, 'moment.js'), 'utf8') : '')) errs.push('meta.phoneRuns needs `export const phone = true` in moment.js (the loader reads that)');
  if (meta.retired && (meta.weight ?? 1) !== 0) errs.push('a retired moment needs weight 0');
  if (meta.maxPerPage !== 1) errs.push('meta.maxPerPage must be 1');
  if (meta.avoidWith != null && !Array.isArray(meta.avoidWith)) errs.push('meta.avoidWith must be an array');
  if (!meta.states || !['start', 'middle', 'end'].every(s => meta.states[s])) errs.push('meta.states needs start, middle and end');
  for (const f of ['moment.js', 'moment.css', 'demo.html']) if (!fs.existsSync(path.join(DIR, folder, f))) errs.push(`${f} is missing`);
  return errs;
}
function buildIndex({ quiet = false } = {}) {
  const dirs = fs.readdirSync(DIR, { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name).sort();
  const moments = [], problems = [];
  for (const id of dirs) {
    const mp = path.join(DIR, id, 'meta.json');
    if (!fs.existsSync(mp)) continue;
    let meta;
    try { meta = JSON.parse(fs.readFileSync(mp, 'utf8')); } catch (e) { problems.push(`${id}: meta.json: ${e.message}`); continue; }
    const errs = validate(meta, id);
    if (errs.length) { problems.push(...errs.map(e => `${id}: ${e}`)); continue; }
    // pages: the kinds the fit rule deals it to (consistency.mjs reads this list)
    moments.push({ ...meta, weight: meta.weight ?? 1, avoidWith: meta.avoidWith || [], needs: meta.needs || {}, pages: kindsFor(meta) });
  }
  const kinds = {};
  moments.forEach(m => { kinds[m.kind] = (kinds[m.kind] || 0) + 1; });
  const dealt = moments.filter(m => !m.retired);
  const index = { version: 3, generated: new Date().toISOString(), count: moments.length, dealt: dealt.length, kinds, pages: PAGES, fit: FIT, budget: BUDGET, moments };
  fs.writeFileSync(INDEX, JSON.stringify(index, null, 1) + '\n');
  if (!quiet) {
    console.log(`index: ${moments.length} moments, ${dealt.length} dealt (${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ')})`);
    if (problems.length) console.log('problems:\n  ' + problems.join('\n  '));
  }
  return index;
}
function readIndex() {
  if (!fs.existsSync(INDEX)) return buildIndex({ quiet: true });
  try { return JSON.parse(fs.readFileSync(INDEX, 'utf8')); } catch { return buildIndex({ quiet: true }); }
}

/* ------------------------------------------------------------------ list */
function cmdList(a) {
  const idx = readIndex();
  let ms = idx.moments;
  const kinds = list(a.kind), fits = list(a.fits), pg = pageKind(a.page || a.type);
  const tone = toneArg(a, pg && pg.page);
  if (pg && pg.page) ms = ms.filter(m => !m.retired && fitsKind(m, pg.page, { tone }));
  if (pg && !pg.page) ms = [];
  if (kinds) ms = ms.filter(m => kinds.includes(m.kind));
  if (fits) ms = ms.filter(m => m.fits.some(f => fits.includes(f)));
  if (a.json) return console.log(JSON.stringify(ms, null, 1));
  for (const m of ms) console.log(`${m.id.padEnd(20)} ${m.kind.padEnd(10)} ${m.fits.join(',').padEnd(18)} ${(m.intensity || '').padEnd(6)} ${(m.tones || []).join(',').padEnd(34)} ${m.webgl ? 'gl ' : '   '}${m.retired ? 'retired' : ''}`);
}

/* ------------------------------------------------------------------ pick */
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h >>> 0) || 1;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function readHistory(file) {
  if (!file || file === true || !fs.existsSync(file)) return {};
  try { const h = JSON.parse(fs.readFileSync(file, 'utf8')); return h && typeof h === 'object' && !Array.isArray(h) ? h : {}; } catch { return {}; }
}
// a page kind as a caller says it -> { page } or { none: why } (a word that names no kind: "other" is
// three kinds, so the caller says which)
export function pageKind(v) {
  if (v == null || v === true) return null;
  const k = String(v).toLowerCase().trim();
  if (PAGE_ALIAS[k]) return { page: PAGE_ALIAS[k] };
  return { none: `"${k}" is not a page kind: pass the kind from SKILL.md section 1, one of ${PAGES.join(', ')} (site-kind other is place, product or service)` };
}
export const isOther = page => OTHER.includes(page);
const group = m => (m.kind === 'hover' || m.kind === 'liquid' ? 'pointer' : m.kind);
const isStatement = m => m.fits.includes('statement');
// two moments that may share a page (pick and check use the same rule)
export function canShare(m, p) {
  const kindOk = group(m) !== group(p) || (group(m) !== 'pointer' && isStatement(m) !== isStatement(p));
  return kindOk && !(p.avoidWith || []).includes(m.id) && !(m.avoidWith || []).includes(p.id)
    && !(m.fits.length === 1 && p.fits.length === 1 && m.fits[0] === p.fits[0])
    && !((m.webgl || 0) && (p.webgl || 0));
}
// the live WebGL contexts the page already spends besides a moment: the scene, the effects, the rest
// and the moments that scene keeps off its page (its meta avoidMoments in assets/scenes/index.json: its twins and the ones that fight it)
export function pageContexts({ scene, effects = [], contexts = 0 } = {}) {
  let n = Math.max(0, +contexts || 0);
  const notes = [];
  let avoid = [];
  if (scene) {
    const sc = readScenes().find(x => x.id === scene);
    if (!sc) notes.push(`pick: scene "${scene}" has no assets/scenes/${scene}/meta.json; counted as one context`);
    n += sc ? (sc.webgl || 0) : 1;
    avoid = sc && Array.isArray(sc.avoidMoments) ? sc.avoidMoments : [];
  }
  n += effects.length;
  return { n, notes, avoid };
}
// every scene folder's meta.json, read now (scenes restored later are dealt without a rebuilt index)
export function readScenes() {
  const dir = path.join(ROOT, 'assets', 'scenes');
  const out = [];
  let dirs = [];
  try { dirs = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name).sort(); } catch { return out; }
  for (const id of dirs) {
    try { const m = JSON.parse(fs.readFileSync(path.join(dir, id, 'meta.json'), 'utf8')); out.push({ ...m, id: m.id || id }); } catch { /* no meta: not a scene */ }
  }
  return out;
}
// 0 or 1 scene by fit: never a retired one, never one dealt in this cycle of the history's scenes,
// and about one page in two (chance) gets one when any fits
export function dealScene(scenes, { page, tone, seed, history = [], chance = 0.5, exclude = [] } = {}) {
  seed = seed != null ? String(seed) : crypto.randomBytes(4).toString('hex');
  const rand = rng(seed + ':scene');
  const notes = [];
  // on tech, software and gaming a scene's `types` still say which of the three it was made for (a
  // software screen is not a game's); on the other kinds its tones decide
  const madeFor = s => !TECH.includes(page) || !Array.isArray(s.types) || !s.types.length || s.types.includes(page);
  const pool = scenes.filter(s => !s.retired && (s.weight ?? 1) > 0 && !exclude.includes(s.id) && fitsKind(s, page, { tone }) && madeFor(s));
  if (!pool.length) return { seed, scene: null, notes: [`scene: none fits a ${page} page${tone ? ` in the ${tone} tone` : ''}`] };
  // never a scene the history already holds, so no two sites share one
  const seen = new Set(history);
  const cands = pool.filter(s => !seen.has(s.id));
  if (!cands.length) return { seed, scene: null, notes: [`scene: every scene that fits a ${page} page is in the history already (${pool.map(s => s.id).join(', ')})`] };
  if (rand() >= chance) return { seed, scene: null, notes: [`scene: none this time (${cands.length} would fit; about one page in two gets one)`] };
  const total = cands.reduce((t, s) => t + (s.weight ?? 1), 0);
  let r = rand() * total, chosen = cands[cands.length - 1];
  for (const s of cands) { r -= (s.weight ?? 1); if (r <= 0) { chosen = s; break; } }
  return { seed, scene: chosen, notes };
}
export function deal(moments, { count = 2, seed, history = [], exclude = [], kinds, fits, photo = false, page, tone, used: spent = 0 } = {}) {
  seed = seed != null ? String(seed) : crypto.randomBytes(4).toString('hex');
  const rand = rng(seed);
  const notes = [];
  let pool = moments.filter(m => !exclude.includes(m.id) && (m.weight ?? 1) > 0 && !m.retired);
  if (page) pool = pool.filter(m => fitsKind(m, page, { tone }));
  // the WebGL budget: what the page already holds plus the moment's own contexts stays within BUDGET
  const room = BUDGET - spent;
  const over = pool.filter(m => (m.webgl || 0) > room);
  if (over.length) { notes.push(`pick: ${over.map(m => m.id).join(', ')} left out: the page already holds ${spent} live WebGL context(s) of ${BUDGET}`); pool = pool.filter(m => (m.webgl || 0) <= room); }
  if (kinds) pool = pool.filter(m => kinds.includes(m.kind));
  if (fits) pool = pool.filter(m => m.fits.some(f => fits.includes(f)));
  if (!photo) pool = pool.filter(m => !m.needs?.photo);
  if (!pool.length) throw new Error('pick: no moment fits these filters');
  const ids = new Set(pool.map(m => m.id));
  // the history as cycles: walking it forward, each time every id in the pool has been dealt a cycle
  // ends and the next starts empty. `used` is the current, unfinished cycle; those ids are out.
  const used = new Set(), lastAt = new Map();
  history.forEach((id, i) => {
    if (!ids.has(id)) return;
    lastAt.set(id, i);
    used.add(id);
    if (used.size === ids.size) used.clear();
  });
  // the few dealt last never come straight back, even when a cycle has just ended
  const tail = new Set(), keep = Math.min(3, Math.max(0, ids.size - count));
  for (let i = history.length - 1; i >= 0 && tail.size < keep; i--) if (ids.has(history[i])) tail.add(history[i]);
  // what can share a page: hover and liquid are one group (one pointer effect a page); two of one
  // kind only when one is a statement and the other a section (type, then photographs); one of a
  // slot, never two that avoid each other, never two WebGL contexts
  const together = (m, p) => canShare(m, p) && (m.webgl || 0) + (p.webgl || 0) <= room;
  const picks = [];
  for (let n = 0; n < count; n++) {
    let open = pool.filter(m => !picks.includes(m) && picks.every(p => together(m, p)));
    // the first one dealt is lively or bold, so something clearly moves in the first three screens
    // (a moment that fits only the close cannot be early)
    const early = m => m.intensity !== 'quiet' && m.fits.some(f => f !== 'closing');
    if (n === 0 && open.some(early)) open = open.filter(early);
    if (!open.length) { notes.push(`pick: only ${picks.length} moment(s) fit together`); break; }
    let cands = open.filter(m => !used.has(m.id) && !tail.has(m.id));
    if (!cands.length) {
      // this cycle is used up: the ones dealt longest ago, the oldest half of what fits
      const stale = open.filter(m => !tail.has(m.id)).sort((a, b) => (lastAt.get(a.id) ?? -1) - (lastAt.get(b.id) ?? -1));
      const from = stale.length ? stale : open;
      cands = from.slice(0, Math.max(1, Math.ceil(from.length / 2)));
      notes.push('pick: every moment that fits has been dealt this cycle; dealing from the ones dealt longest ago');
    }
    const total = cands.reduce((s, m) => s + (m.weight ?? 1), 0);
    let r = rand() * total;
    let chosen = cands[cands.length - 1];
    for (const m of cands) { r -= (m.weight ?? 1); if (r <= 0) { chosen = m; break; } }
    picks.push(chosen);
    used.add(chosen.id);
  }
  return { seed, picks, notes };
}
const seedArg = a => (a.seed != null && a.seed !== true ? String(a.seed) : undefined);
function writeHistory(file, hist) {
  if (!file || file === true) return;
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(hist, null, 1) + '\n');
}
function pageArg(a, cmd) {
  const pg = pageKind(a.page || a.type);
  if (!pg) die(`${cmd}: pass --page <kind>, one of ${PAGES.join(', ')} (SKILL.md section 1). Every kind gets two moments, three on a long page.`);
  if (!pg.page) die(`${cmd}: ` + pg.none);
  return pg.page;
}
// the scene deal, shared by `scene` and `pick --scene deal`; it appends the scene to the history
function sceneFor(a, page, tone, hist) {
  const out = dealScene(readScenes(), { page, tone, seed: seedArg(a), history: (hist.scenes || []).map(s => s.id), exclude: list(a.exclude) || [] });
  out.notes.forEach(n => console.error(n));
  if (out.scene) hist.scenes = [...(hist.scenes || []), { id: out.scene.id, at: new Date().toISOString(), seed: out.seed }].slice(-200);
  return out;
}
const sceneLine = s => (s ? `scene ${s.id} · ${(s.fits || []).join('/')} · ${s.intensity || ''}${s.webgl ? ` · ${s.webgl} WebGL context` : ''}\n   ${s.look || ''}\n   needs: ${Object.values(s.needs || {}).join('; ')}` : 'scene: none (the page carries its moments)');
function cmdScene(a) {
  const page = pageArg(a, 'scene');
  const tone = toneArg(a, page);
  const hist = readHistory(a.history);
  const out = sceneFor(a, page, tone, hist);
  writeHistory(a.history, hist);
  if (a.json) console.log(JSON.stringify({ seed: out.seed, page, scene: out.scene ? { id: out.scene.id, fits: out.scene.fits, intensity: out.scene.intensity, webgl: out.scene.webgl || 0, needs: out.scene.needs } : null }));
  else console.log(sceneLine(out.scene));
}
function cmdPick(a) {
  const idx = readIndex();
  const page = pageArg(a, 'pick');
  const tone = toneArg(a, page);
  const count = Math.max(1, Math.min(3, +(a.count || (a.long ? 3 : 2))));
  const hist = readHistory(a.history);
  // --scene deal: deal the scene first, then the moments around it
  let scene = a.scene && a.scene !== true ? String(a.scene) : null, dealtScene;
  if (scene === 'deal') { dealtScene = sceneFor(a, page, tone, hist); scene = dealtScene.scene ? dealtScene.scene.id : null; }
  const ctx = pageContexts({ scene, effects: list(a.effects) || [], contexts: a.contexts });
  ctx.notes.forEach(n => console.error(n));
  // the scene's own avoidMoments are left out of the deal: the caller need not pass them as --exclude
  const exclude = [...new Set([...(list(a.exclude) || []), ...ctx.avoid])];
  if (ctx.avoid.length) console.error(`pick: scene ${scene} keeps off its page: ${ctx.avoid.join(', ')} (its avoidMoments, left out of the deal)`);
  const history = (hist.moments || []).map(p => p.id);
  // photographs: every place, product and service page has them; elsewhere --photo says so
  const photo = a['no-photo'] ? false : (!!a.photo || isOther(page));
  // the slots a page deals by default: sections, statements, the close; a hero moment only with --fits hero
  const fits = list(a.fits) || ['section', 'statement', 'closing', 'between'];
  let out;
  try {
    out = deal(idx.moments, { count, seed: seedArg(a), history, exclude, kinds: list(a.kind), fits, photo, page, tone, used: ctx.n });
  } catch (e) { die(e.message); }
  out.notes.forEach(n => console.error(n));
  if (a.history && a.history !== true) {
    const at = new Date().toISOString();
    hist.moments = [...(hist.moments || []), ...out.picks.map(p => ({ id: p.id, at, seed: out.seed }))].slice(-200);
    writeHistory(a.history, hist);
  }
  const gl = ctx.n + out.picks.reduce((t, p) => t + (p.webgl || 0), 0);
  if (a.json) console.log(JSON.stringify({ seed: out.seed, page, tone: tone || null, scene: dealtScene ? (dealtScene.scene ? dealtScene.scene.id : null) : scene, contexts: { page: ctx.n, moments: gl - ctx.n, budget: BUDGET }, picks: out.picks.map((p, i) => ({ id: p.id, kind: p.kind, fits: p.fits, intensity: p.intensity, early: i === 0 && p.intensity !== 'quiet', trigger: p.trigger, webgl: p.webgl, phone: p.phone, needs: p.needs })) }));
  else {
    console.log(`seed ${out.seed} · page ${page}${tone ? ' · tone ' + tone : ''} · live WebGL contexts ${gl} of ${BUDGET}`);
    if (dealtScene) console.log(sceneLine(dealtScene.scene));
    out.picks.forEach((p, i) => console.log(`${i + 1}. ${p.id.padEnd(20)} ${p.kind} · ${p.fits.join('/')} · ${p.intensity}${i === 0 && p.intensity !== 'quiet' && p.fits.some(f => f !== 'closing') ? ' · place it in the first three screens' : ''}${p.fits.length === 1 && p.fits[0] === 'closing' ? ' · the close' : ''}${p.webgl ? ' · one WebGL context' : ''}${p.needs?.photo ? ' · needs a photograph' : ''}\n   ${p.look}`));
    console.log('Each in a section of its own, never two in one section; write each id, its section and its purpose in the plan.');
  }
}

/* ------------------------------------------------------------------ serve */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain' };
function server(port, root = ROOT) {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => { srv.on('error', reject); srv.listen(port, '127.0.0.1', () => resolve(srv)); });
}
async function cmdServe(a) {
  const port = +(a.port || 5720);
  if (port < 5720 || port > 5729) die('serve: use a port from 5720 to 5729');
  await server(port);
  console.log(`serving ${ROOT} at http://127.0.0.1:${port}/  (demos: /assets/moments/<id>/demo.html, gallery: /assets/moments/gallery.html)`);
}

/* ------------------------------------------------------------------ gallery */
function cmdGallery() {
  const idx = readIndex();
  const shown = idx.moments.filter(m => !m.retired);
  const rows = shown.map(m => `<li><a href="${m.id}/demo.html"><b>${m.name}</b> <span>${m.kind} · ${m.fits.join(', ')} · ${m.trigger} · ${m.intensity}${m.webgl ? ' · WebGL' : ''} · ${(m.tones || []).join(', ')}</span><p>${m.look}</p><p class="ph">Phone and reduced motion: ${m.phone}</p></a></li>`).join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Moments</title>
<style>body{margin:0;font:16px/1.5 system-ui,sans-serif;color:#111;background:#fff;padding:48px 24px}h1{font-size:28px;font-weight:500;margin:0 0 8px}p.lead{color:#555;margin:0 0 32px;max-width:60ch}ul{list-style:none;padding:0;margin:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}li a{display:block;padding:16px 20px;border:1px solid #e5e5e5;border-radius:12px;color:inherit;text-decoration:none}li a:hover{border-color:#999}li b{font-weight:500}li span{display:block;color:#666;font-size:13px;margin:2px 0 6px}li p{margin:0;color:#333;font-size:14px}li p.ph{margin-top:6px;color:#666;font-size:13px}</style></head>
<body><h1>Moments</h1><p class="lead">${shown.length} creative moments, two a page on every kind (three on a long page), dealt by fit: each carries tones (warm, editorial, product, tech, playful) and an intensity, and every kind takes the tones and intensities that fit it (references/moments.md, The fit rule). Each link is a full demo page; the moment is marked data-moment in its source.</p><ul>${rows}</ul></body></html>`;
  fs.writeFileSync(path.join(DIR, 'gallery.html'), html);
  console.log(`wrote ${path.join(DIR, 'gallery.html')} (${shown.length} moments)`);
}

/* ------------------------------------------------------------------ shoot */
function findChrome() {
  const c = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const f = c.find(p => p && fs.existsSync(p));
  if (!f) throw new Error('no Chrome found (set CHROME_PATH)');
  return f;
}
// a profile stays in the OS temp folder or the project: a relative --profile that leads out of this folder (or the folder
// itself) goes to .taste-skill/chrome-<name>
const inProject = (p, name) => {
  const abs = path.resolve(p), rel = path.relative(process.cwd(), abs);
  const out = !path.isAbsolute(p) && (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel));
  if (rel !== '' && !out) return abs;
  const to = path.join(process.cwd(), '.taste-skill', 'chrome-' + name);
  console.error(`${name}: --profile ${p} ${out ? 'leads outside the project folder' : 'is the project folder itself'}; using ${to} (a profile goes in the OS temp folder or the project's .taste-skill folder)`);
  return to;
};
async function cmdShoot(a) {
  const out = a.out && a.out !== true ? path.resolve(a.out) : die('shoot: pass --out <dir>');
  // default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
  const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'moments-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-moments-' + process.pid);
  const profile = a.profile && a.profile !== true ? inProject(a.profile, 'moments') : defaultProfile();
  const port = +(a.port || 5720);
  const widths = (list(a.widths) || ['1440', '390']).map(Number);
  const states = list(a.states) || ['start', 'middle', 'end'];
  const idx = readIndex();
  const only = list(a.only);
  let moments = idx.moments.filter(m => !only || only.includes(m.id));
  if (a.url && a.url !== true) { const rel = String(a.url).replace(/^\/+/, ''); moments = [{ id: path.basename(rel, '.html'), demo: rel, states: { start: { see: true, wait: 400 }, middle: { see: true, wait: 400 }, end: { see: true, wait: 900 } } }]; }
  if (!moments.length) die('shoot: no moment matches --only');
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(profile, { recursive: true });
  const srv = await server(port);
  const portFile = path.join(profile, 'DevToolsActivePort');
  try { fs.rmSync(portFile); } catch { /* none */ }
  const W0 = widths[0], H0 = W0 < 600 ? 844 : 900;
  const child = spawn(findChrome(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--hide-scrollbars', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    `--window-size=${W0},${H0}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
  const guard = setTimeout(() => { console.error('shoot: timed out'); kill(); process.exit(2); }, 20 * 60 * 1000);
  const report = [];
  try {
    let dport = null;
    for (let i = 0; i < 150 && !dport; i++) { await sleep(100); try { dport = parseInt(fs.readFileSync(portFile, 'utf8'), 10) || null; } catch { /* not yet */ } }
    if (!dport) throw new Error('Chrome did not start');
    const ver = await (await fetch(`http://127.0.0.1:${dport}/json/version`)).json();
    const ws = new WebSocket(ver.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
    let id = 0; const pend = new Map(), subs = [];
    ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } else subs.forEach(f => f(m)); });
    const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
    const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
    const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
    const S = async (m, p) => { const r = await send(m, p, sessionId); if (r.error) throw new Error(`${m}: ${r.error.message}`); return r.result; };
    const ev = async x => (await S('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.value;
    let logs = [];
    subs.push(m => {
      if (m.sessionId !== sessionId) return;
      if (m.method === 'Runtime.exceptionThrown') logs.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
      if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(`${m.params.type}: ${m.params.args.map(x => x.value ?? x.description ?? '').join(' ').slice(0, 200)}`);
    });
    await S('Page.enable'); await S('Runtime.enable');
    if (a.reduced) await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    let loaded;
    subs.push(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired' && loaded) loaded(); });
    for (const m of moments) {
      for (const W of widths) {
        const VH = W < 600 ? 844 : 900;
        await S('Emulation.setDeviceMetricsOverride', { width: W, height: VH, deviceScaleFactor: 1, mobile: W < 600 });
        for (const st of states) {
          const spec = m.states[st] || {};
          logs = [];
          const url = `http://127.0.0.1:${port}/${m.demo || `assets/moments/${m.id}/demo.html`}`;
          const waitLoad = new Promise(r => { loaded = r; });
          await S('Page.navigate', { url });
          await Promise.race([waitLoad, sleep(15000)]);
          await ev(`new Promise(r => { const t = performance.now(); (function w() { if (document.documentElement.dataset.momentsReady != null || performance.now() - t > 6000) r(); else setTimeout(w, 30); })(); })`);
          await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
          // the state: a scroll position relative to the moment's box, then a pointer path, then a wait
          await ev(`(async () => {
            const st = ${JSON.stringify(spec)};
            const el = document.querySelector('[data-moment]');
            if (!el) return;
            const vh = innerHeight; const r = el.getBoundingClientRect(); const top = r.top + scrollY;
            let y = scrollY;
            if (st.p != null) y = top + st.p * Math.max(0, r.height - vh);
            else if (st.view != null) y = top - (vh - st.view * (vh + r.height));
            else if (st.see) y = r.height < vh ? top - (vh - r.height) / 2 : top;
            if (st.y != null) y = top + st.y;
            scrollTo(0, Math.max(0, Math.round(y)));
          })()`);
          if (spec.pointer) {
            const sel = spec.pointer.target ? JSON.stringify(spec.pointer.target) : 'null';
            const box = await ev(`(() => { const el = document.querySelector('[data-moment]'); const t = (${sel} && el.querySelector(${sel})) || el; const r = t.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()`);
            if (!Array.isArray(box)) { console.log(`${m.id}-${W}-${st}: no box for the pointer`); continue; }
            const [x0, y0, w, h] = box;
            const from = spec.pointer.from || [0.3, 0.5], to = spec.pointer.to || from, n = spec.pointer.moves || 1;
            for (let i = 0; i <= n; i++) {
              const t = n ? i / n : 1;
              const x = x0 + w * (from[0] + (to[0] - from[0]) * t), y = y0 + h * (from[1] + (to[1] - from[1]) * t);
              await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(x), y: Math.round(y) });
              await sleep(spec.pointer.step || 24);
            }
          }
          await sleep(spec.wait ?? 400);
          const { data } = await S('Page.captureScreenshot', { format: 'png' });
          const name = `${m.id}-${W}-${st}${a.reduced ? '-reduced' : ''}.png`;
          fs.writeFileSync(path.join(out, name), Buffer.from(data, 'base64'));
          if (a.probe && a.probe !== true) { try { console.log(`  probe: ${JSON.stringify(await ev(String(a.probe)))}`); } catch (e) { console.log(`  probe failed: ${e.message}`); } }
          const failed = await ev(`[...document.querySelectorAll('[data-moment-failed]')].map(e => e.dataset.moment + ': ' + e.dataset.momentFailed).join('; ')`);
          const gl = await ev(`document.querySelectorAll('canvas').length`);
          // the still rule: under reduced motion, and on a phone width unless the moment runs there
          // (meta.phoneRuns), the host says so and nothing runs
          const still = await ev(`(() => { const el = document.querySelector('[data-moment]'); return (el && el.dataset.momentStill) || ''; })()`);
          const running = await ev(`document.getAnimations().filter(x => x.playState === 'running' && x.effect && x.effect.target && x.effect.target.closest && x.effect.target.closest('[data-moment]')).length`);
          const expectStill = a.reduced || (W < 640 && !m.phoneRuns);
          const note = expectStill && (still !== (a.reduced ? 'reduced' : 'phone') || running) ? `  STILL? mark "${still}", ${running} running` : '';
          report.push({ id: m.id, w: W, state: st, file: name, failed, canvases: gl, still, running, logs: [...new Set(logs)].slice(0, 6) });
          console.log(`${name}${still ? '  still:' + still : ''}${note}${failed ? '  FAILED ' + failed : ''}${logs.length ? '  ' + [...new Set(logs)].slice(0, 3).join(' | ') : ''}`);
        }
      }
    }
    try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch { /* closing */ }
  } catch (e) {
    console.error('shoot:', e.message);
    process.exitCode = 1;
  } finally {
    clearTimeout(guard);
    await sleep(300);
    kill();
    srv.close();
  }
  // contact sheet
  const byMoment = new Map();
  report.forEach(r => { if (!byMoment.has(r.id)) byMoment.set(r.id, []); byMoment.get(r.id).push(r); });
  const sheet = `<!doctype html><html><head><meta charset="utf-8"><title>moment shots</title><style>body{margin:0;padding:24px;font:14px system-ui;background:#eee;color:#111}h2{font-weight:500;margin:32px 0 8px}div.row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}figure{margin:0}img{display:block;border:1px solid #ccc;background:#fff;max-height:420px}figcaption{color:#555;font-size:12px;margin-top:4px}.bad{color:#b00}</style></head><body><h1 style="font-weight:500">Moments: ${moments.length} × ${widths.join('/')} × ${states.join('/')}${a.reduced ? ' (reduced motion)' : ''}</h1>${[...byMoment].map(([mid, rows]) => `<h2>${mid}</h2><div class="row">${rows.map(r => `<figure><img src="${r.file}" alt=""><figcaption>${r.w} · ${r.state}${r.failed ? ` <span class="bad">${r.failed}</span>` : ''}${r.logs.length ? ` <span class="bad">${r.logs.join(' | ')}</span>` : ''}</figcaption></figure>`).join('')}</div>`).join('')}</body></html>`;
  fs.writeFileSync(path.join(out, 'index.html'), sheet);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  console.log(`contact sheet: ${path.join(out, 'index.html')}`);
}

/* ------------------------------------------------------------------ sheet: a contact sheet of the shots already in --out */
function cmdSheet(a) {
  const out = a.out && a.out !== true ? path.resolve(a.out) : die('sheet: pass --out <dir>');
  const files = fs.readdirSync(out).filter(f => /\.png$/i.test(f)).sort();
  const by = new Map();
  for (const f of files) {
    const m = f.match(/^(.+?)-(\d+)-(start|middle|end)(-reduced)?\.png$/);
    if (!m) continue;
    if (!by.has(m[1])) by.set(m[1], []);
    by.get(m[1]).push({ file: f, w: m[2], state: m[3] + (m[4] || '') });
  }
  const order = { start: 0, middle: 1, end: 2 };
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>moment shots</title><style>body{margin:0;padding:24px;font:14px system-ui;background:#eee;color:#111}h2{font-weight:500;margin:32px 0 8px}div.row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}figure{margin:0}img{display:block;border:1px solid #ccc;background:#fff;max-height:420px}figcaption{color:#555;font-size:12px;margin-top:4px}</style></head><body><h1 style="font-weight:500">Moments: ${by.size} (${files.length} shots)</h1>${[...by].map(([id, rows]) => `<h2>${id}</h2><div class="row">${rows.sort((x, y) => (+y.w - +x.w) || (order[x.state.split('-')[0]] - order[y.state.split('-')[0]])).map(r => `<figure><img src="${r.file}" alt="" loading="lazy"><figcaption>${r.w} · ${r.state}</figcaption></figure>`).join('')}</div>`).join('')}</body></html>`;
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`contact sheet: ${path.join(out, 'index.html')} (${files.length} shots, ${by.size} moments)`);
}

/* ------------------------------------------------------------------ check: a built page, read as text */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'stop', 'use']);
const CARDISH = /(^|\s)(card|plan|result|knock|bento)(\s|$)|data-card/;
// the page's moments: id, whether one sits in a card, a caption inside it (a figcaption under a visual)
export function auditPage(html) {
  const found = [];
  const stack = [];
  const tag = /<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, x => x.slice(0, x.indexOf('>') + 1) + '</' + x.match(/^<(\w+)/)[1] + '>');
  while ((m = tag.exec(body))) {
    const [, close, name, attrs] = m, n = name.toLowerCase();
    if (close) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].n === n) { stack.length = i; break; }
      continue;
    }
    const cls = (attrs.match(/class\s*=\s*"([^"]*)"/) || [])[1] || '';
    const el = { n, cls, card: CARDISH.test(cls) || /data-card/.test(attrs) };
    const dm = attrs.match(/data-moment\s*=\s*"([^"]+)"/);
    if (n === 'figcaption') { const host = [...stack].reverse().find(x => x.moment); if (host) host.moment.captions++; }
    if (dm) {
      el.moment = { id: dm[1], inCard: el.card || stack.some(x => x.card), captions: 0 };
      found.push(el.moment);
    }
    if (!VOID.has(n) && !/\/\s*$/.test(attrs)) stack.push(el);
  }
  return found;
}
function cmdCheck(a) {
  const file = a._[1] ? path.resolve(a._[1]) : die('check: pass the page, node moments.mjs check <page.html>');
  if (!fs.existsSync(file)) die(`check: no such file ${file}`);
  const html = fs.readFileSync(file, 'utf8');
  const idx = readIndex();
  const byId = new Map(idx.moments.map(m => [m.id, m]));
  const pg = pageKind(a.page || a.type);
  const faults = [], warns = [];
  if (pg && !pg.page) faults.push(pg.none);
  const found = auditPage(html);
  if (found.length && !pg) warns.push('pass --page <kind> to check the page kind and the WebGL budget');
  if (found.length > 3) faults.push(`${found.length} moments on the page (two, three on a long page)`);
  if (found.length < 2) warns.push(`${found.length} moment(s) on the page: every page gets two (moments.mjs pick --page <kind>), three on a long page`);
  const ids = found.map(f => f.id);
  ids.filter((id, i) => ids.indexOf(id) !== i).forEach(id => faults.push(`${id} twice`));
  let gl = 0;
  for (const f of found) {
    const m = byId.get(f.id);
    if (!m) { faults.push(`${f.id} is not a moment (assets/moments/index.json)`); continue; }
    if (m.retired) faults.push(`${f.id} is retired (${m.retired})`);
    if (pg && pg.page && !m.retired && !fitsKind(m, pg.page)) faults.push(`${f.id} does not fit a ${pg.page} page (its tones ${(m.tones || []).join(', ')}, ${m.intensity}${m.webgl ? ', WebGL' : ''}; a ${pg.page} page takes ${FIT[pg.page].tones.join(', ')}, ${FIT[pg.page].intensity.join(', ')})`);
    if (f.inCard) faults.push(`${f.id} sits in a card: nothing on a card moves on scroll`);
    if (f.captions) faults.push(`${f.id} holds a figcaption: no caption under a visual`);
    gl += m.webgl || 0;
  }
  for (const f of found) for (const g of found) {
    if (f === g) continue;
    const m = byId.get(f.id), n = byId.get(g.id);
    if (m && n && f.id < g.id) {
      if ((m.avoidWith || []).includes(n.id) || (n.avoidWith || []).includes(m.id)) faults.push(`${f.id} and ${g.id} avoid each other`);
      else if (!canShare(m, n)) faults.push(`${f.id} and ${g.id} do not share a page: two of one kind are one statement and one section, one pointer moment a page, one WebGL moment a page`);
    }
  }
  const ctx = pageContexts({ scene: a.scene && a.scene !== true ? a.scene : null, effects: list(a.effects) || [], contexts: a.contexts });
  for (const f of found) if (ctx.avoid.includes(f.id)) faults.push(`${f.id} is in the avoidMoments of the scene ${a.scene} (assets/scenes/${a.scene}/meta.json)`);
  if (ctx.n + gl > BUDGET) faults.push(`${ctx.n + gl} live WebGL contexts (${ctx.n} on the page, ${gl} in moments), the cap is ${BUDGET}`);
  if (found.length) {
    if (!/moments\.js|system\.js/.test(html)) faults.push('no loader: the page names neither assets/moments/moments.js nor system.js');
    if (!/classList\.add\('mo-js'\)/.test(html)) warns.push("the head line (mo-js and the 2.5 s mo-safe timer) is missing: a hidden-until-mounted moment may flash");
    if (!/rel="modulepreload"[^>]*moments\.js/.test(html)) warns.push('no modulepreload for moments.js and the dealt moment');
  }
  console.log(`${path.basename(file)}: ${found.length} moment(s) ${ids.join(', ') || '-'} · WebGL ${ctx.n + gl} of ${BUDGET}`);
  faults.forEach(f => console.log('  FAULT ' + f));
  warns.forEach(w => console.log('  WARN  ' + w));
  if (!faults.length) console.log('  ok');
  process.exitCode = faults.length ? 1 : 0;
}

/* ------------------------------------------------------------------ main (only when run, not when `deal` is imported) */
// a path compared by its real location, so a symlinked install (install.sh) is the same file
const realOf = (p) => { try { return fs.realpathSync(p).toLowerCase(); } catch { return path.resolve(p).toLowerCase(); } };
const isMain = process.argv[1] && realOf(process.argv[1]) === realOf(fileURLToPath(import.meta.url));
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  const cmd = a._[0];
  if (cmd === 'index') buildIndex();
  else if (cmd === 'sheet') cmdSheet(a);
  else if (cmd === 'list') cmdList(a);
  else if (cmd === 'pick') cmdPick(a);
  else if (cmd === 'scene') cmdScene(a);
  else if (cmd === 'check') cmdCheck(a);
  else if (cmd === 'gallery') cmdGallery();
  else if (cmd === 'serve') cmdServe(a);
  else if (cmd === 'shoot') cmdShoot(a);
  else if (cmd) die(`unknown command "${cmd}"`);
  else console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].split('\n').slice(1).join('\n'));
}
