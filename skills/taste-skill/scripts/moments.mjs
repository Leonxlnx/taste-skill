#!/usr/bin/env node
/*
  moments.mjs - the creative moments command line (taste-skill, references/moments.md).

    node scripts/moments.mjs index                      scan assets/moments/<id>/meta.json into index.json
    node scripts/moments.mjs list [--kind text] [--fits hero] [--page tech] [--json]
    node scripts/moments.mjs pick --page tech|gaming|software --count 1|2 --seed S --history .taste-skill/history.json
                                  [--scene <id>] [--effects a,b] [--contexts n]
                                  [--exclude a,b] [--kind text,scroll] [--fits hero,section] [--photo] [--json]
    node scripts/moments.mjs check <page.html> [--page tech] [--scene <id>] [--effects a,b] [--contexts n]
                                  audit a built page: its moments, the still rule, cards, the WebGL budget
    node scripts/moments.mjs gallery                    write assets/moments/gallery.html (every demo, one page)
    node scripts/moments.mjs serve --port 5720          static server for the taste-skill folder (5720-5729)
    node scripts/moments.mjs shoot --out <out-dir> --profile <profile-dir>
                                  [--only a,b] [--widths 1440,390] [--states start,middle,end] [--port 5720] [--reduced]
                                  [--probe "<js expression>"]   (its value is printed after every state)
    node scripts/moments.mjs sheet --out <out-dir>        rebuild index.html from the shots in that folder
    (shoot --url assets/moments/_demo/in-card.html shoots one other page of the skill, e.g. a test page)

  pick deals by the page's kind (the house overrides). --page is required: tech, gaming or software
  (ai and saas are tech and software; "technical product" is software). A place, shop, cafe, service or
  any other kind gets none: pick prints an empty deal and says why, exit 0, so the caller simply places
  no moment. A moment lists the kinds it fits in meta.pages; a retired moment (meta.retired, weight 0)
  is never dealt. The WebGL budget: a page holds at most 4 live contexts (perf.mjs glPeak). The deal
  counts the contexts the page already spends - the big scene (--scene <id>: its `webgl` in
  assets/scenes/index.json; it also leaves out that scene's avoidMoments, its twins and the ones that
  fight it, so neither pick nor check needs them as --exclude), each effect (--effects a,b: one each, worst case) and any others
  (--contexts n: objects, components) - and never deals a moment whose own meta.webgl would push the
  total over 4. Every moment has a still variant for phones and reduced motion (meta.phone,
  meta.reduced; the loader enforces it, moments.js), and none may sit in a card (check reports it).

  pick deals one or two moments at random, seeded. The history file's `moments` list is read as
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
const PAGES = ['tech', 'gaming', 'software'];
const BUDGET = 4;                       // live WebGL contexts a page may hold (references/perf.md, perf.mjs glPeak)
// page kinds as other files say them -> the three kinds a moment is dealt on
const PAGE_ALIAS = { tech: 'tech', technology: 'tech', ai: 'tech', gaming: 'gaming', game: 'gaming', games: 'gaming', software: 'software', saas: 'software', app: 'software', 'technical-product': 'software', 'tech-product': 'software' };

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
  if (!Array.isArray(meta.pages) || meta.pages.some(p => !PAGES.includes(p))) errs.push(`meta.pages must list some of ${PAGES.join(', ')} (empty only with meta.retired)`);
  else if (!meta.pages.length && !(typeof meta.retired === 'string' && meta.retired.trim())) errs.push('meta.pages is empty: a moment that fits no page kind needs meta.retired (a reason) and weight 0');
  if (typeof meta.phone !== 'string' || !meta.phone.trim()) errs.push('meta.phone must say what a phone shows (every moment has a static phone variant)');
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
    moments.push({ ...meta, weight: meta.weight ?? 1, avoidWith: meta.avoidWith || [], needs: meta.needs || {}, pages: meta.pages || [] });
  }
  const kinds = {};
  moments.forEach(m => { kinds[m.kind] = (kinds[m.kind] || 0) + 1; });
  const dealt = moments.filter(m => !m.retired);
  const index = { version: 2, generated: new Date().toISOString(), count: moments.length, dealt: dealt.length, kinds, pages: PAGES, budget: BUDGET, moments };
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
  if (pg && pg.page) ms = ms.filter(m => m.pages.includes(pg.page) && !m.retired);
  if (pg && !pg.page) ms = [];
  if (kinds) ms = ms.filter(m => kinds.includes(m.kind));
  if (fits) ms = ms.filter(m => m.fits.some(f => fits.includes(f)));
  if (a.json) return console.log(JSON.stringify(ms, null, 1));
  for (const m of ms) console.log(`${m.id.padEnd(20)} ${m.kind.padEnd(10)} ${m.fits.join(',').padEnd(18)} ${m.trigger.padEnd(7)} ${m.cost.padEnd(4)} ${m.webgl ? 'gl ' : '   '} ${m.look}`);
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
// a page kind as a caller says it -> { page } (a kind moments are dealt on) or { none: why } (a kind that gets none)
export function pageKind(v) {
  if (v == null || v === true) return null;
  const k = String(v).toLowerCase().trim();
  if (PAGE_ALIAS[k]) return { page: PAGE_ALIAS[k] };
  return { none: `a "${k}" page gets no moment: moments are dealt only on tech, gaming and software pages (never a place, shop, cafe, service or other local page; they lead with photographs)` };
}
// the live WebGL contexts the page already spends besides a moment: the scene, the effects, the rest
// and the moments that scene keeps off its page (its meta avoidMoments in assets/scenes/index.json: its twins and the ones that fight it)
export function pageContexts({ scene, effects = [], contexts = 0 } = {}) {
  let n = Math.max(0, +contexts || 0);
  const notes = [];
  let avoid = [];
  if (scene) {
    try {
      const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'scenes', 'index.json'), 'utf8')).scenes.find(x => x.id === scene);
      if (!sc) notes.push(`pick: scene "${scene}" is not in assets/scenes/index.json; counted as one context`);
      n += sc ? (sc.webgl || 0) : 1;
      avoid = sc && Array.isArray(sc.avoidMoments) ? sc.avoidMoments : [];
    } catch { notes.push('pick: assets/scenes/index.json unreadable; the scene is counted as one context'); n += 1; }
  }
  n += effects.length;
  return { n, notes, avoid };
}
export function deal(moments, { count = 1, seed, history = [], exclude = [], kinds, fits, photo = false, page, used: spent = 0 } = {}) {
  seed = seed != null ? String(seed) : crypto.randomBytes(4).toString('hex');
  const rand = rng(seed);
  const notes = [];
  let pool = moments.filter(m => !exclude.includes(m.id) && (m.weight ?? 1) > 0 && !m.retired);
  if (page) pool = pool.filter(m => (m.pages || []).includes(page));
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
  // what can share a page: hover and liquid are one group (one pointer effect a page), one of a kind,
  // one of a slot, never two that avoid each other, never two WebGL contexts
  const group = m => (m.kind === 'hover' || m.kind === 'liquid' ? 'pointer' : m.kind);
  const together = (m, p) => group(m) !== group(p)
    && !(p.avoidWith || []).includes(m.id) && !(m.avoidWith || []).includes(p.id)
    && !(m.fits.length === 1 && p.fits.length === 1 && m.fits[0] === p.fits[0])
    && (m.webgl || 0) + (p.webgl || 0) <= room;
  const picks = [];
  for (let n = 0; n < count; n++) {
    const open = pool.filter(m => !picks.includes(m) && picks.every(p => together(m, p)));
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
function cmdPick(a) {
  const idx = readIndex();
  const count = Math.max(1, Math.min(2, +(a.count || 1)));
  const pg = pageKind(a.page || a.type);
  if (!pg) die('pick: pass --page tech|gaming|software (the page\'s kind). A place, shop, cafe or service page gets no moment.');
  if (!pg.page) {
    console.error(pg.none);
    if (a.json) console.log(JSON.stringify({ seed: null, page: String(a.page || a.type), picks: [], reason: pg.none }));
    else console.log('no moment: ' + pg.none);
    return;
  }
  const ctx = pageContexts({ scene: a.scene && a.scene !== true ? a.scene : null, effects: list(a.effects) || [], contexts: a.contexts });
  ctx.notes.forEach(n => console.error(n));
  // the scene's own avoidMoments are left out of the deal: the caller need not pass them as --exclude
  const exclude = [...new Set([...(list(a.exclude) || []), ...ctx.avoid])];
  if (ctx.avoid.length) console.error(`pick: scene ${a.scene} keeps off its page: ${ctx.avoid.join(', ')} (its avoidMoments, left out of the deal)`);
  const hist = readHistory(a.history);
  const history = (hist.moments || []).map(p => p.id);
  let out;
  try {
    out = deal(idx.moments, { count, seed: a.seed != null && a.seed !== true ? String(a.seed) : undefined, history, exclude, kinds: list(a.kind), fits: list(a.fits), photo: !!a.photo, page: pg.page, used: ctx.n });
  } catch (e) { die(e.message); }
  out.notes.forEach(n => console.error(n));
  if (a.history && a.history !== true) {
    const at = new Date().toISOString();
    hist.moments = [...(hist.moments || []), ...out.picks.map(p => ({ id: p.id, at, seed: out.seed }))].slice(-200);
    fs.mkdirSync(path.dirname(path.resolve(a.history)), { recursive: true });
    fs.writeFileSync(a.history, JSON.stringify(hist, null, 1) + '\n');
  }
  if (a.json) console.log(JSON.stringify({ seed: out.seed, page: pg.page, contexts: { page: ctx.n, moments: out.picks.reduce((t, p) => t + (p.webgl || 0), 0), budget: BUDGET }, picks: out.picks.map(p => ({ id: p.id, kind: p.kind, fits: p.fits, trigger: p.trigger, webgl: p.webgl, phone: p.phone, needs: p.needs })) }));
  else {
    console.log(`seed ${out.seed} · page ${pg.page} · live WebGL contexts ${ctx.n + out.picks.reduce((t, p) => t + (p.webgl || 0), 0)} of ${BUDGET}`);
    out.picks.forEach((p, i) => console.log(`${i + 1}. ${p.id.padEnd(20)} ${p.kind} · ${p.fits.join('/')} · ${p.trigger}${p.webgl ? ' · one WebGL context' : ''}${p.needs?.photo ? ' · needs a photograph' : ''}\n   ${p.look}`));
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
  const rows = shown.map(m => `<li><a href="${m.id}/demo.html"><b>${m.name}</b> <span>${m.kind} · ${m.fits.join(', ')} · ${m.trigger}${m.webgl ? ' · WebGL' : ''} · ${m.pages.join(', ')}</span><p>${m.look}</p><p class="ph">Phone and reduced motion: ${m.phone}</p></a></li>`).join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Moments</title>
<style>body{margin:0;font:16px/1.5 system-ui,sans-serif;color:#111;background:#fff;padding:48px 24px}h1{font-size:28px;font-weight:500;margin:0 0 8px}p.lead{color:#555;margin:0 0 32px;max-width:60ch}ul{list-style:none;padding:0;margin:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}li a{display:block;padding:16px 20px;border:1px solid #e5e5e5;border-radius:12px;color:inherit;text-decoration:none}li a:hover{border-color:#999}li b{font-weight:500}li span{display:block;color:#666;font-size:13px;margin:2px 0 6px}li p{margin:0;color:#333;font-size:14px}li p.ph{margin-top:6px;color:#666;font-size:13px}</style></head>
<body><h1>Moments</h1><p class="lead">${shown.length} creative moments for tech, gaming and software pages, one or two a page, never on a place page (references/moments.md). Each link is a full demo page; the moment is marked data-moment in its source.</p><ul>${rows}</ul></body></html>`;
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
async function cmdShoot(a) {
  const out = a.out && a.out !== true ? path.resolve(a.out) : die('shoot: pass --out <dir>');
  // default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
  const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'moments-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-moments-' + process.pid);
  const profile = a.profile && a.profile !== true ? path.resolve(a.profile) : defaultProfile();
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
          // the still rule: on a phone width or under reduced motion the host says so and nothing runs
          const still = await ev(`(() => { const el = document.querySelector('[data-moment]'); return (el && el.dataset.momentStill) || ''; })()`);
          const running = await ev(`document.getAnimations().filter(x => x.playState === 'running' && x.effect && x.effect.target && x.effect.target.closest && x.effect.target.closest('[data-moment]')).length`);
          const expectStill = a.reduced || W < 640;
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
  if (found.length > 2) faults.push(`${found.length} moments on the page (one or two)`);
  const ids = found.map(f => f.id);
  ids.filter((id, i) => ids.indexOf(id) !== i).forEach(id => faults.push(`${id} twice`));
  let gl = 0;
  for (const f of found) {
    const m = byId.get(f.id);
    if (!m) { faults.push(`${f.id} is not a moment (assets/moments/index.json)`); continue; }
    if (m.retired) faults.push(`${f.id} is retired (${m.retired})`);
    if (pg && pg.page && !m.pages.includes(pg.page)) faults.push(`${f.id} does not fit a ${pg.page} page`);
    if (f.inCard) faults.push(`${f.id} sits in a card: nothing on a card moves on scroll`);
    if (f.captions) faults.push(`${f.id} holds a figcaption: no caption under a visual`);
    gl += m.webgl || 0;
  }
  for (const f of found) for (const g of found) {
    if (f === g) continue;
    const m = byId.get(f.id), n = byId.get(g.id);
    if (m && n && f.id < g.id) {
      if ((m.avoidWith || []).includes(n.id) || (n.avoidWith || []).includes(m.id)) faults.push(`${f.id} and ${g.id} avoid each other`);
      const grp = x => (x.kind === 'hover' || x.kind === 'liquid' ? 'pointer' : x.kind);
      if (grp(m) === grp(n)) faults.push(`${f.id} and ${g.id} are both ${grp(m)} moments`);
    }
  }
  const ctx = pageContexts({ scene: a.scene && a.scene !== true ? a.scene : null, effects: list(a.effects) || [], contexts: a.contexts });
  for (const f of found) if (ctx.avoid.includes(f.id)) faults.push(`${f.id} is in the avoidMoments of the scene ${a.scene} (assets/scenes/index.json)`);
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
  else if (cmd === 'check') cmdCheck(a);
  else if (cmd === 'gallery') cmdGallery();
  else if (cmd === 'serve') cmdServe(a);
  else if (cmd === 'shoot') cmdShoot(a);
  else if (cmd) die(`unknown command "${cmd}"`);
  else console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].split('\n').slice(1).join('\n'));
}
