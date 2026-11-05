#!/usr/bin/env node
/*
  effects.mjs - the effects kit command line (taste-skill).

    node scripts/effects.mjs index                 scan assets/effects/<id>/meta.json into index.json
    node scripts/effects.mjs list [--json] [--on hero] [--palette dark] [--family light] [--quiet]
    node scripts/effects.mjs pick --page tech|gaming|software --palette light|dark|colour --slots card,card,hero [--seed S]
                                  [--history file.json] [--exclude a,b] [--quiet] [--tech-subject] [--json]
    node scripts/effects.mjs pick --page software --palette light --count 3 --on card [...]   (one kind of slot)
    node scripts/effects.mjs gallery [--palettes file]     write assets/effects/gallery.html and lab.html
    node scripts/effects.mjs publish [--out publish]       the gallery as one folder: index.html, system.css,
                                                           effects/, ui/, components/, objects/ and files.json
                                                           (relative paths only; rerun after the assets change)
    node scripts/effects.mjs serve --port 5230             static server for the taste-skill folder
    node scripts/effects.mjs shot --url URL --out file.png --profile DIR [--w 1440 --h 900 --dpr 1
                                  --wait 1500 --full --reduced --gpu]
    node scripts/effects.mjs perf --url URL --profile DIR [--seconds 5 --w 1440 --h 900 --gpu]

  pick: one effect per slot (card = a card group, hero = the hero frame or a large split frame, band =
  a full-width band or the closing call to action), at random, weighted against the history file's last
  20 picks, never the same id twice on one page, spread over families; it appends the picks to the
  history file. Only effects made for the page's palette kind and for that slot are dealt. Effects that
  follow the pointer (motion "interactive") are left out unless --interactive is passed. Effects with
  meta "random": false (the dotted globe, the photo grade) are never dealt; name one in its slot when
  the content calls for it: --slots hero:dotted-globe,card,card (still refused on a kind or slot it is
  not made for, when named twice, or with an effect it avoids). Effects that list each other in
  meta.avoidWith never share a page. --page is required (like moments.mjs): effects are dealt only on tech, gaming and
  software pages (and a product with a technical subject: --page product --tech-subject); a place, shop, cafe, service
  or other product page gets an empty deal (exit 0), so the caller places no effect (house rule: effects fit the trade). --quiet leaves out the focal grounds (meta "focal": true: a sphere,
  a beam, peaks), for slots that carry a big UI window, a screenshot or text.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pick as dealEffects, filterEffects, SLOTS, KINDS } from '../assets/effects/pick.js';
import { pageKind } from './moments.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FX = path.join(ROOT, 'assets', 'effects');
const INDEX = path.join(FX, 'index.json');
const TEMPLATE = path.join(ROOT, 'scripts', 'fx-gallery.template.html');
const LAB_TEMPLATE = path.join(ROOT, 'scripts', 'fx-lab.template.html');
const PALETTE_SOURCES = [path.join(ROOT, 'library', 'palettes.json')];
const PRESETS = { light: 'moss-sand', dark: 'blue-black-cornflower', colour: 'cobalt-field' };
const ENUMS = {
  bestOn: ['hero', 'card', 'band', 'footer'],
  motion: ['still', 'slow', 'interactive'],
  cost: ['low', 'mid', 'high'],
  palettes: ['light', 'dark', 'colour'],
};

/* ------------------------------------------------------------------ args */

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next == null || next.startsWith('--')) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}
const die = msg => { console.error(msg); process.exit(1); };

/* ------------------------------------------------------------------ index */

function validateMeta(meta, folder) {
  const errs = [];
  const str = k => (typeof meta[k] === 'string' && meta[k].trim() ? null : `meta.${k} must be a non-empty string`);
  for (const k of ['id', 'name', 'family', 'look']) { const e = str(k); if (e) errs.push(e); }
  if (meta.id && meta.id !== folder) errs.push(`meta.id "${meta.id}" must match the folder "${folder}"`);
  if (meta.id && !/^[a-z0-9][a-z0-9-]*$/.test(meta.id)) errs.push('meta.id must be lower-case letters, digits and hyphens');
  if (meta.look && meta.look.length > 160) errs.push('meta.look should be one sentence (160 characters at most)');
  for (const k of ['bestOn', 'palettes']) {
    if (!Array.isArray(meta[k]) || !meta[k].length) errs.push(`meta.${k} must be a non-empty array`);
    else for (const v of meta[k]) if (!ENUMS[k].includes(v)) errs.push(`meta.${k} has "${v}" (allowed: ${ENUMS[k].join(', ')})`);
  }
  for (const k of ['motion', 'cost']) if (!ENUMS[k].includes(meta[k])) errs.push(`meta.${k} must be one of ${ENUMS[k].join(', ')}`);
  // optional: random false = never dealt, only named (a literal subject); avoidWith = ids never on the same page;
  // focal true = a ground with its own subject (a sphere, a beam, peaks), left out by --quiet
  for (const k of ['random', 'focal']) if (meta[k] != null && typeof meta[k] !== 'boolean') errs.push(`meta.${k} must be true or false`);
  for (const k of ['avoidWith', 'subjects']) {
    if (meta[k] != null && (!Array.isArray(meta[k]) || meta[k].some(v => typeof v !== 'string' || !v))) errs.push(`meta.${k} must be an array of strings`);
  }
  return errs;
}

function validateParams(params) {
  const errs = [];
  if (!params || typeof params !== 'object') return ['effect.params must be an object'];
  for (const [k, d] of Object.entries(params)) {
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)) errs.push(`param "${k}" must be a plain identifier (it becomes u_${k})`);
    for (const f of ['default', 'min', 'max']) if (typeof d?.[f] !== 'number') errs.push(`param "${k}" needs a number ${f}`);
    if (typeof d?.default === 'number' && (d.default < d.min || d.default > d.max)) errs.push(`param "${k}" default is outside min..max`);
  }
  return errs;
}

async function buildIndex({ quiet = false } = {}) {
  const dirs = fs.existsSync(FX) ? fs.readdirSync(FX, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort() : [];
  const effects = [];
  const problems = [];
  for (const id of dirs) {
    const metaPath = path.join(FX, id, 'meta.json');
    const effPath = path.join(FX, id, 'effect.js');
    if (!fs.existsSync(metaPath) && !fs.existsSync(effPath)) continue;
    const errs = [];
    let meta = null;
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) { errs.push(`meta.json: ${e.message}`); }
    if (meta) errs.push(...validateMeta(meta, id));
    let params = null;
    if (!fs.existsSync(effPath)) errs.push('effect.js is missing');
    else {
      try {
        const mod = await import(pathToFileURL(effPath).href + '?t=' + fs.statSync(effPath).mtimeMs);
        const e = mod.default;
        if (!e || typeof e.mount !== 'function') errs.push('effect.js must export default { id, name, family, params, mount }');
        else {
          if (e.id !== id) errs.push(`effect.id "${e.id}" must match the folder "${id}"`);
          if (meta && e.family !== meta.family) errs.push(`effect.family "${e.family}" differs from meta.family "${meta.family}"`);
          errs.push(...validateParams(e.params));
          params = e.params;
        }
      } catch (e) { errs.push(`effect.js did not import in node: ${e.message.split('\n')[0]}`); }
    }
    if (errs.length) { problems.push(...errs.map(e => `${id}: ${e}`)); continue; }
    effects.push({ ...meta, params });
  }
  const families = {};
  for (const e of effects) families[e.family] = (families[e.family] || 0) + 1;
  const index = { version: 1, generated: new Date().toISOString(), count: effects.length, families, effects };
  fs.writeFileSync(INDEX, JSON.stringify(index, null, 1) + '\n');
  if (!quiet) {
    console.log(`index.json: ${effects.length} effects in ${Object.keys(families).length} families`);
    if (problems.length) console.log('left out:\n  ' + problems.join('\n  '));
  }
  return { index, problems };
}

async function readIndex() {
  if (!fs.existsSync(INDEX)) return (await buildIndex({ quiet: true })).index;
  return JSON.parse(fs.readFileSync(INDEX, 'utf8'));
}


/* ------------------------------------------------------------------ list */

// a filter value that matches nothing is a typo, not an empty library: say so
function checkFilters(a, effects) {
  const one = (k, allowed) => {
    if (a[k] == null) return;
    if (a[k] === true || !allowed.includes(String(a[k]))) die(`${a._[0]}: --${k} ${a[k] === true ? '(no value)' : `"${a[k]}"`} (use ${allowed.join(', ')})`);
  };
  one('palette', [...KINDS, 'color']);
  one('on', SLOTS);
  one('motion', ENUMS.motion);
  one('cost', ENUMS.cost);
  one('family', [...new Set(effects.map(e => e.family))].sort());
}

async function list(a) {
  const idx = await readIndex();
  checkFilters(a, idx.effects);
  const rows = filterEffects(idx.effects, a);
  if (a.json) return console.log(JSON.stringify(rows.map(({ params, ...m }) => m), null, 1));
  const w = (s, n) => String(s).padEnd(n);
  console.log(w('id', 24) + w('family', 14) + w('motion', 12) + w('cost', 6) + w('palettes', 20) + w('ground', 8) + w('dealt', 9) + 'best on');
  for (const e of rows) console.log(w(e.id, 24) + w(e.family, 14) + w(e.motion, 12) + w(e.cost, 6) + w(e.palettes.join(','), 20) + w(e.focal ? 'focal' : 'quiet', 8) + w(e.random === false ? 'by name' : 'random', 9) + e.bestOn.join(','));
  const named = rows.filter(e => e.random === false).length;
  console.log(`${rows.length} effects${named ? `; ${named} chosen on purpose only (dealt "by name": --slots hero:<id>)` : ''}`);
}

/* ------------------------------------------------------------------ pick */

function readHistory(file) {
  if (!file || !fs.existsSync(file)) return { picks: [] };
  try {
    const h = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(h)) return { picks: h.map(x => (typeof x === 'string' ? { id: x } : x)) };
    return { picks: Array.isArray(h.picks) ? h.picks : [] };
  } catch (_) { return { picks: [] }; }
}

async function pick(a) {
  const idx = await readIndex();
  // --palette is required: only effects made for the page's ground (meta.palettes) are dealt. The
  // dealing itself is assets/effects/pick.js, which the gallery runs in the browser too.
  if (!a.palette || a.palette === true) die('pick: pass --palette light, dark or colour (the kind of the page\'s ground)');
  // the page's kind gates the deal: no shader for a cafe, a shop, a guesthouse or a service page (moments.mjs and backgrounds/pick.mjs refuse the same way)
  const pgWord = a.page != null && a.page !== true ? a.page : a.type;
  if (pgWord == null || pgWord === true) die('pick: pass --page tech|gaming|software (the page\'s kind). A place, shop, cafe or service page gets no effect; a product with a technical subject: --page product --tech-subject.');
  const pg = pageKind(pgWord);
  if (!pg.page && !(a['tech-subject'] && /^(product|tech-?product|hardware|device)$/i.test(String(pgWord)))) {
    const why = String(pg.none).replace('moments are dealt only on', 'effects are dealt only on').replace('gets no moment', 'gets no effect');
    console.error(why);
    if (a.json) console.log(JSON.stringify({ seed: null, page: String(pgWord), picks: [], reason: why })); else console.log('no effect: ' + why);
    return;
  }
  checkFilters(a, idx.effects);
  const slots = a.slots && a.slots !== true ? String(a.slots).split(',').map(s => s.trim()).filter(Boolean) : null;
  const hist = readHistory(a.history);
  let dealt;
  try {
    dealt = dealEffects(idx.effects, {
      palette: a.palette || undefined, slots, count: a.count, on: a.on, interactive: !!a.interactive, quiet: !!a.quiet,
      seed: a.seed != null && a.seed !== true ? String(a.seed) : undefined, history: hist.picks.map(p => p.id),
      exclude: a.exclude && a.exclude !== true ? a.exclude : undefined, motion: a.motion, family: a.family, cost: a.cost,
    });
  } catch (e) { die(e.message); }
  for (const n of dealt.notes) console.error(n);
  const { seed } = dealt;
  const out = dealt.picks.map(p => p.id);
  if (slots) for (let i = 0; i < slots.length; i++) slots[i] = dealt.slots[i]; // 'hero:dotted-globe' -> 'hero'
  if (a.history) {
    const at = new Date().toISOString();
    hist.picks.push(...out.map(id => ({ id, at, seed })));
    hist.picks = hist.picks.slice(-500);
    fs.mkdirSync(path.dirname(path.resolve(a.history)), { recursive: true });
    fs.writeFileSync(a.history, JSON.stringify(hist, null, 1) + '\n');
  }
  if (a.json) console.log(JSON.stringify({ seed, picks: slots ? dealt.picks : out }));
  else if (slots) out.forEach((id, i) => console.log(`${String(i + 1).padStart(2)}. ${slots[i].padEnd(6)} ${id}${dealt.picks[i].named ? '  (named)' : ''}`));
  else console.log(out.join('\n'));
}

/* ------------------------------------------------------------------ gallery */

function readPalettes(file) {
  const src = file ? [file] : PALETTE_SOURCES;
  for (const f of src) {
    if (fs.existsSync(f)) {
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      return raw.map(p => ({ id: p.id, name: p.name, bg: p.bg, surface: p.surface, ink: p.ink, muted: p.muted, accent: p.accent, accentInk: p.accentInk }));
    }
  }
  die('gallery: no palettes.json found (pass --palettes <file>)');
}

async function gallery(a) {
  await buildIndex();
  const pals = readPalettes(a.palettes);
  // gallery.html: the showpiece (every effect, a random pick, the feature cards); lab.html: the
  // workbench (sliders for every param, card, wide and hero layouts, sample text on the effect)
  for (const [tpl, name] of [[TEMPLATE, 'gallery.html'], [LAB_TEMPLATE, 'lab.html']]) {
    const html = fs.readFileSync(tpl, 'utf8')
      .replace('/*PALETTES*/', JSON.stringify(pals).replace(/</g, '\\u003c'))
      .replace('/*PRESETS*/', JSON.stringify(PRESETS));
    fs.writeFileSync(path.join(FX, name), html);
  }
  console.log(`gallery.html and lab.html: ${pals.length} palettes; presets ${Object.values(PRESETS).join(', ')}`);
  console.log('open it over http, e.g. node scripts/effects.mjs serve --port 5230 then /assets/effects/gallery.html');
}

/* ------------------------------------------------------------------ publish */

/*
  publish: one folder that runs on its own, for the gallery artifact. index.html is the gallery
  (scripts/fx-gallery.template.html) and next to it a copy of the assets it loads, in the same layout
  as assets/ so every relative import inside them still works:
    system.css                      the page system the gallery is built on
    effects/                        fx.js, pick.js, index.json, <id>/effect.js, lab.html (the workbench)
    ui/                             ui.js, base.css, cards.css, cards.html (the card layouts the gallery
                                    shows), index.json and every fragment folder
    components/                     shared.js, base.css and every fx-* folder
    objects/                        the print core, the scene kit, the photo kit with its photographs
                                    and every object folder
  Demo, lab and readme pages of the parts are left out. files.json lists every file except index.html
  and shots/. Run it again after the assets change: it starts from a clean copy each time (shots/ stays).
  It writes nothing into assets/.
*/
const PUBLISH_PARTS = ['system.css', 'effects', 'ui', 'components', 'objects'];
const PUBLISH_EXT = new Set(['.js', '.json', '.css', '.html', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.woff2']);
// pages and notes for people working on a part, never loaded by the gallery
const PUBLISH_SKIP = [
  /(^|\/)_lab(\/|\.html$)/, /(^|\/)demo\.(html|css|js)$/, /(^|\/)make-fallbacks\.html$/, /(^|\/)README\.md$/,
  /^effects\/(gallery|lab)\.html$/, /^effects\/[^/]+\/meta\.json$/, /^(ui|components)\/index\.html$/,
  /^objects\/_print-core\/cards\.html$/, /^ui\/apps\/.*\.(png|jpg)$/,
];

function walk(dir, base = dir) {
  const out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...walk(f, base));
    else out.push(path.relative(base, f).split(path.sep).join('/'));
  }
  return out;
}

async function publish(a) {
  const out = path.resolve(a.out && a.out !== true ? a.out : path.join(ROOT, 'publish'));
  if (out === ROOT || out === path.parse(out).root || out.startsWith(path.join(ROOT, 'assets'))) die(`publish: refusing to write into ${out}`);
  const ASSETS = path.join(ROOT, 'assets');
  const idx = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
  for (const e of idx.effects) if (!fs.existsSync(path.join(FX, e.id, 'effect.js'))) die(`publish: index.json lists ${e.id} but ${e.id}/effect.js is missing (run: node scripts/effects.mjs index)`);
  if (!fs.existsSync(path.join(ASSETS, 'ui', 'cards.html'))) die('publish: assets/ui/cards.html is missing (the gallery shows its card layouts)');

  // the page: the template with its asset root moved from assets/effects/ (../) to the folder itself (./)
  const ROOT_DEV = '<script id="paths" type="application/json">{"root": "../"}</script>';
  let page = fs.readFileSync(TEMPLATE, 'utf8');
  if (!page.includes(ROOT_DEV)) die('publish: the template has no paths block ({"root": "../"})');
  const [head, rest] = page.split('<!--assets-->');
  if (!rest || !rest.includes('<!--/assets-->')) die('publish: the template has no <!--assets--> ... <!--/assets--> block of stylesheet links');
  const [links, tail] = rest.split('<!--/assets-->');
  page = head + '<!--assets-->' + links.replaceAll('href="../', 'href="./') + '<!--/assets-->' + tail;
  page = page.replace(ROOT_DEV, '<script id="paths" type="application/json">{"root": "./"}</script>')
    .replace('/*PRESETS*/', JSON.stringify(PRESETS));
  if (/(href|src)="\.\.\//.test(page)) die('publish: the page still points at ../ outside the assets block');

  fs.mkdirSync(out, { recursive: true });
  // a fresh copy each time; screenshots in shots/ stay
  for (const n of ['index.html', 'files.json', ...PUBLISH_PARTS]) fs.rmSync(path.join(out, n), { recursive: true, force: true });
  const files = [];
  const put = (rel, data) => {
    const f = path.join(out, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, data);
    if (rel !== 'index.html') files.push(rel);
  };
  put('index.html', page);
  for (const part of PUBLISH_PARTS) {
    const src = path.join(ASSETS, part);
    if (!fs.existsSync(src)) die(`publish: assets/${part} is missing`);
    const list = fs.statSync(src).isDirectory() ? walk(src).map(f => `${part}/${f}`) : [part];
    for (const rel of list) {
      if (!PUBLISH_EXT.has(path.extname(rel).toLowerCase())) continue;
      if (PUBLISH_SKIP.some(re => re.test(rel))) continue;
      // effects: only the runtime, the index and the effects it lists
      if (part === 'effects' && !/^effects\/(fx\.js|pick\.js|index\.json|[a-z0-9-]+\/effect\.js)$/.test(rel)) continue;
      if (part === 'effects' && /\/effect\.js$/.test(rel) && !idx.effects.some(e => rel === `effects/${e.id}/effect.js`)) continue;
      put(rel, fs.readFileSync(path.join(ASSETS, rel)));
    }
  }
  // the parameter workbench, linked from the gallery's footer (rendered here, not into assets/)
  put('effects/lab.html', fs.readFileSync(LAB_TEMPLATE, 'utf8')
    .replace('/*PALETTES*/', JSON.stringify(readPalettes(a.palettes)).replace(/</g, '\\u003c'))
    .replace('/*PRESETS*/', JSON.stringify(PRESETS)));

  files.sort();
  const bytes = files.reduce((s, f) => s + fs.statSync(path.join(out, f)).size, fs.statSync(path.join(out, 'index.html')).size);
  fs.writeFileSync(path.join(out, 'files.json'), JSON.stringify({ page: 'index.html', count: files.length, bytes, files }, null, 1) + '\n');
  const per = PUBLISH_PARTS.map(p => `${p} ${files.filter(f => f === p || f.startsWith(p + '/')).length}`).join(', ');
  console.log(`publish: ${out}${path.sep}index.html and ${files.length} files (${(bytes / 1024).toFixed(0)} KB): ${per}; list in files.json`);
  if (files.length > 255) console.log('publish: more than 255 files: publish the artifact in two calls to the same url (255 files per call)');
}

/* ------------------------------------------------------------------ serve */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

function serve(a) {
  const port = parseInt(a.port ?? 5230, 10);
  if (port === 3000) die('serve: port 3000 is reserved; use 5200-5299');
  const root = path.resolve(a.root || ROOT);
  const server = http.createServer((req, res) => {
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (_) { res.writeHead(400).end(); return; }
    let file = path.resolve(root, '.' + rel);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404, { 'content-type': 'text/plain' }).end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  server.listen(port, '127.0.0.1', () => console.log(`serving ${root} at http://localhost:${port}/  (gallery: /assets/effects/gallery.html)`));
}

/* ------------------------------------------------------------------ chrome (shot, perf) */

function findChrome() {
  const c = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
  const f = c.find(p => fs.existsSync(p));
  if (!f) die('no Chrome found (set CHROME=path)');
  return f;
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.n = 0; this.pending = new Map(); this.handlers = [];
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const p = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? p.rej(new Error(`${p.method}: ${m.error.message}`)) : p.res(m.result);
      } else for (const h of this.handlers) h(m);
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.n;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej, method }));
  }
  on(fn) { this.handlers.push(fn); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function launch(a) {
  // default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
  const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'fx-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-fx-' + process.pid);
  const profile = path.resolve(a.profile && a.profile !== true ? a.profile : defaultProfile());
  fs.mkdirSync(profile, { recursive: true });
  const portFile = path.join(profile, 'DevToolsActivePort');
  try { fs.rmSync(portFile); } catch (_) { /* none */ }
  const w = +(a.w || 1440), h = +(a.h || 900);
  const args = [
    '--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--hide-scrollbars', '--mute-audio', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', `--window-size=${w},${h}`,
  ];
  if (a.gpu) args.push('--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-unsafe-webgpu');
  else args.push('--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'); // WebGL on the CPU: several GPU Chromes at once crashed an integrated GPU
  args.push('about:blank');
  const child = spawn(findChrome(), args, { stdio: 'ignore', windowsHide: true });
  let port = null;
  for (let i = 0; i < 150 && !port; i++) {
    await sleep(100);
    try { if (fs.existsSync(portFile)) port = parseInt(fs.readFileSync(portFile, 'utf8').split('\n')[0], 10) || null; } catch (_) { /* still being written */ }
  }
  const close = async (cdp) => {
    try { if (cdp) await Promise.race([cdp.send('Browser.close'), sleep(3000)]); } catch (_) { /* closing */ }
    for (let i = 0; i < 40 && child.exitCode == null; i++) await sleep(100);
    if (child.exitCode == null) {
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { try { child.kill(); } catch (_) { /* gone */ } }
    }
  };
  if (!port) { await close(null); die('Chrome did not start (no DevToolsActivePort)'); }
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  const cdp = new CDP(ws);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => cdp.send(m, p, sessionId);
  const logs = [];
  cdp.on(m => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(`${m.params.type}: ${m.params.args.map(x => x.value ?? x.description ?? '').join(' ')}`);
    if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push(`log: ${m.params.entry.text}`);
  });
  await S('Page.enable');
  await S('Runtime.enable');
  await S('Log.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: +(a.dpr || 1), mobile: false });
  if (a.reduced) await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const evalJS = async (expr) => (await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
  const goto = async (url) => {
    const loaded = new Promise(res => cdp.on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') res(); }));
    await S('Page.navigate', { url });
    await Promise.race([loaded, sleep(15000)]);
  };
  return { cdp, S, evalJS, goto, logs, close: () => close(cdp), w, h, pid: child.pid };
}

const FX_REPORT = `(() => {
  const gl = document.createElement('canvas').getContext('webgl');
  const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : 'no webgl');
  const fx = [...document.querySelectorAll('[data-fx-mounted]')].map(el => ({ id: el.__fx && el.__fx.id, ...(el.__fx && el.__fx.info || {}) }));
  return { renderer, fx };
})()`;

async function shot(a) {
  if (!a.url || !a.out) die('shot: --url and --out are required');
  const b = await launch(a);
  try {
    await b.goto(a.url);
    await b.evalJS(`new Promise(r => { const t0 = performance.now(); (function w() { if (document.documentElement.dataset.ready || performance.now() - t0 > 8000) r(); else setTimeout(w, 50); })(); })`);
    if (a.eval) { // e.g. --eval "document.querySelector('[data-act=params]').click()"; a returned value is printed
      const ev = await b.evalJS(String(a.eval));
      if (ev !== undefined) console.log('eval:', typeof ev === 'string' ? ev : JSON.stringify(ev));
    }
    if (a.full) {
      const m = await b.S('Page.getLayoutMetrics');
      const height = Math.min(12000, Math.ceil((m.cssContentSize || m.contentSize).height));
      await b.S('Emulation.setDeviceMetricsOverride', { width: b.w, height, deviceScaleFactor: +(a.dpr || 1), mobile: false });
    }
    await sleep(+(a.wait || 1500));
    const rep = await b.evalJS(FX_REPORT);
    const { data } = await b.S('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
    fs.writeFileSync(a.out, Buffer.from(data, 'base64'));
    console.log(`saved ${a.out}`);
    if (a.zoom) {
      // --zoom "x,y,w,h" [--factor 3]: also save an enlarged crop (nearest neighbour) as <out>-zoom.png
      const [x, y, zw, zh] = String(a.zoom).split(',').map(Number);
      const f = +(a.factor || 3);
      await b.goto('about:blank');
      const url = await b.evalJS(`new Promise(res => { const im = new Image(); im.onload = () => {
        const c = document.createElement('canvas'); c.width = ${zw * f}; c.height = ${zh * f};
        const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
        g.drawImage(im, ${x}, ${y}, ${zw}, ${zh}, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); };
        im.src = 'data:image/png;base64,${data}'; })`);
      const zout = a.out.replace(/\.png$/i, '') + '-zoom.png';
      fs.writeFileSync(zout, Buffer.from(url.split(',')[1], 'base64'));
      console.log(`saved ${zout}`);
    }
    console.log(`renderer: ${rep.renderer}`);
    for (const f of rep.fx) console.log(`  ${f.id}: webgl ${f.webgl}${f.fallback ? ' fallback ' + f.fallback : ''} scale ${f.scale} size ${f.size}`);
    if (b.logs.length) console.log('console:\n  ' + b.logs.slice(0, 12).join('\n  '));
  } finally { await b.close(); }
}

async function perf(a) {
  if (!a.url) die('perf: --url is required');
  const b = await launch(a);
  const secs = +(a.seconds || 5);
  try {
    await b.goto(a.url);
    await sleep(+(a.wait || 1500));
    const r = await b.evalJS(`new Promise(res => {
      const d = []; let last = 0; const end = performance.now() + ${secs * 1000};
      function f(t) { if (last) d.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else {
        d.sort((x, y) => x - y); const avg = d.reduce((s, x) => s + x, 0) / d.length;
        res({ frames: d.length, fps: +(1000 / avg).toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), slow: d.filter(x => x > 20).length });
      } }
      requestAnimationFrame(f);
    })`);
    const rep = await b.evalJS(FX_REPORT);
    console.log(JSON.stringify({ url: a.url, size: `${b.w}x${b.h}`, ...r, renderer: rep.renderer, fx: rep.fx }, null, 1));
    if (b.logs.length) console.log('console:\n  ' + b.logs.slice(0, 12).join('\n  '));
  } finally { await b.close(); }
}

/* ------------------------------------------------------------------ main */

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
const commands = { index: () => buildIndex(), list, pick, gallery, publish, serve, shot, perf };
if (!commands[cmd]) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].split('/*')[1].trim());
  process.exit(cmd ? 1 : 0);
}
await commands[cmd](args);
