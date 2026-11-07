#!/usr/bin/env node
/*
  taste-skill gate.mjs - the finish gate: a build may not end while fixable FAILs remain.

    node <skill>/scripts/gate.mjs --start <page.html | http://localhost:5173/> [--root dist] [--kind <kind>]
         [--category "<what is sold>"] [--primary "<main action>"] [--rounds 3] [--new]
        arm the gate for a build in this folder; on a build that is still open it only updates what is checked
        (page, url, root, kind, category, primary) and keeps its rounds; --new starts a new build anyway
    node <skill>/scripts/gate.mjs [page.html | url] [--root ..] [--kind ..] [--category ..] [--primary ..]
        the manual gate: run the checks, print the open FAILs (a page or flag given here is stored for the hook)
    node <skill>/scripts/gate.mjs --hook claude|codex|antigravity   the same as an agent's Stop hook (stdin: the hook JSON)
         [--quick] [--profile <chrome dir>]
    node <skill>/scripts/gate.mjs --done "<what the user said>"
        only when the user tells the agent to stop or to ship the page as it is: closes the build with their words
        (status done, build.json renamed to build.done.json), so every later stop is allowed; GATE: DONE (...)
  --profile is the folder the checks' Chrome profiles go under: the OS temp folder (the default) or the project's
  .taste-skill folder, never outside the project; a relative one that leads out of the current folder (../prof) is
  replaced, with a warning, by .taste-skill/chrome-gate.

  A build is active while .taste-skill/build.json exists in the project folder (the hook's cwd, else the current
  folder, or one or two folders below it), or while .taste-skill/gate.json says its rounds are still open (a deleted
  build.json does not end a build). start.mjs writes the marker at a deal in a folder with no open build.
  No build: exit 0 at once in hook mode, but once for a tasteskill page (one with a page-type meta, changed in the
  last day, never armed or finished) in the folder or one below: it says how to arm it. A manual run says so
  (GATE: OFF) and arms nothing.

  The page: the one named, else the marker's page or url, else index.html, else the only .html file, else the
  index.html of the only folder below that has one. A url (a dev server) and --root (a built site's folder) go
  to both checkers as they are.
  The checks, one at a time, each in its own headless Chrome with its own temp profile:
    consistency.mjs --quick --widths 1440,390 --json   (with the marker's --page kind, --category, --primary, --root;
                                                        it walks the page at 320x640 too: overflow, collide, tap-size)
    assets/layout/check.mjs --sizes 1440x900,390x844 --json
  and two static ones: kit-edited (a file the page loads from assets/ differs from the skill's copy, whitespace,
  quotes and semicolons aside) and checker-gaming (the page's own code looks for a headless browser or an automation
  tool). gaming-suspect, waivable: a user-agent test for headless, or aria-hidden stripped from many pictures.
  And the copy: scripts/copy-lint.mjs --json on the page's file, or, when the file holds no sections (a built app, a
  dev server), on the page as the browser built it (consistency.mjs saves it as rendered.html); copy-lint's ids (copy-slop-word,
  copy-virtue, ...; the checker's copy-headline, copy-fact and the rest are its own); its FAILs
  block (the old slop words, stock phrases, residue, a device used as a tic), its WARNs do not. A file whose text is a
  kit file's, wherever it sits, is the kit's and is skipped. The two checkers' ids for the
  same fault on the same section (section-height / screen-height / screen-short, one-section / neighbour) are one
  finding. WARNs never block, except two the checker WARNs and the gate holds as FAILs: hero-enter (the hero does not
  enter on load) and moment-none (the page deals no moment).
  Only a local page is checked: a file, or a URL on localhost, 127.0.0.1, [::1], *.localhost or *.test.

  Waivers: a FAIL judged false is waived in .taste-skill/waivers.json, an array of
  {"check": "<id>", "target": "<part of where it is>", "reason": "<12+ characters>"}. A waiver covers exactly one
  finding: a target that matches several is ignored and says so. A target is 3+ characters, or the whole of a
  short where. Each copy word, stock phrase or residue hit is its own finding (where: the word and its sentence); a
  copy device used as a tic is one finding, waived only by its whole where (its count and hits), so a word added
  later is never covered. kit-edited and checker-gaming cannot be waived;
  more than 5 waivers is itself a FAIL. Waivers are printed so the report can list them.

  Rounds (.taste-skill/gate.json): a run whose page or waivers changed since the last round is a round, but a hook
  stop before the gate's first run by hand in the build is not (it lists the FAILs and blocks; that first run by
  hand counts the page's round). After a hook block, the next stop on the unchanged page is allowed once without a
  round (a question to the user: the block says "just stop again"); other stops on it block twice without a round
  (nothing was fixed), then each counts as one. A changed page starts that count again.
  Below --rounds (3, set with --start): FAIL, fix and finish again. At the last round: OPEN, told once; every
  later stop is allowed and the open FAILs go in the report. PASS and OPEN rename build.json to build.done.json.
  The last line of a manual run is exactly one of:
    GATE: PASS | GATE: FAIL <n> (round <k> of <max>) | GATE: OPEN <n> (rounds used up) | GATE: QUICK <n> (...)
    | GATE: DONE (<the user's words>), after --done
  or GATE: SETUP (...) when the armed target cannot be checked yet (no page, a framework's source shell, a URL that
  is not local): arm the right one and run again; GATE: ERROR (...) when the checks themselves could not run;
  GATE: OFF when no build is active.
  Exit 0 PASS, OFF or DONE, 1 FAIL or OPEN, 2 ERROR, 3 SETUP.
  --quick is a look between rounds: the checker at 1440 and 390 (and the 320 pass), the layout check at 1440, not a round, never closes the build (GATE: QUICK <n>).

  Hook mode blocks with exit 0 and JSON on stdout: {"decision":"block","reason":...} for claude and codex,
  {"decision":"continue","reason":...} for antigravity; it allows by printing nothing. It never traps an agent:
  - every block is counted in .taste-skill/gate-blocks.json, which --start never clears; past rounds + 4 blocks
    for one build (the blocks before the first run by hand have as many of their own), or 30 in 6 hours in the
    folder, every stop is allowed;
  - no page, a framework shell, or crashed checks block once each with what to do, then allow; a crashed or
    timed-out run is stored for its page, so a stop on the unchanged page reuses it (one retry at most);
  - after --done (the user ended the build) every stop is allowed;
  - it allows when builds are active in two or more folders below (an orchestrator, not a builder), when the
    build has been idle for 24 hours, in a session other than the one it first held, and when it cannot record;
  - stdin is read for 2 seconds at most; the whole run stops at 9.5 minutes. Each check runs with a watchdog that
    kills that check (and its Chrome) if the gate itself is killed; nothing else is ever killed.
  Every hook call, an allowed one too, leaves one entry in gate.json's history: {"mode": "hook", "host", "decision":
  "allow" or "block", "reason"} (with the round's status and FAIL count when it ran the checks). With no build armed it
  goes in the newest gate.json in the folder or one or two below (a finished build's), else in the folder's own
  .taste-skill when there is one; never in a new folder, nor in a build below that this session does not hold. An
  entry alone keeps the file's time, so the 24-hour idle rule still reads the build's own last change.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const here = path.dirname(SELF);
const SKILL = path.join(here, '..');
const GATE = `node "${SELF}"`;
const args = process.argv.slice(2);
const VALUE = new Set(['hook', 'rounds', 'profile', 'root', 'kind', 'page', 'category', 'primary', 'done']);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const str = k => { const v = opt(k); return typeof v === 'string' && v.trim() ? v.trim() : null; };
const has = k => args.includes('--' + k);
const positional = args.filter((a, i) => !a.startsWith('--') && !VALUE.has((args[i - 1] || '').replace(/^--/, '')))[0] || null;
const isUrl = s => typeof s === 'string' && /^https?:\/\//i.test(s);
// the gate opens only a page on this machine: a file, or a dev server on a local host
const isLocalUrl = s => { try { const h = new URL(s).hostname.toLowerCase(); return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(h) || /\.(localhost|test)$/.test(h); } catch { return false; } };
const NOT_LOCAL = 'the gate checks a local page or dev server only (localhost, 127.0.0.1, [::1], *.localhost, *.test)';
const HOOK = opt('hook', null);
const MODES = { claude: 'block', codex: 'block', antigravity: 'continue' };
if (HOOK !== null && !MODES[HOOK]) { console.error('gate: --hook takes claude, codex or antigravity'); process.exit(HOOK === true ? 2 : 0); }
const QUICK = has('quick'), START = has('start');
const T0 = Date.now(), BUDGET = 570000; // 9.5 min: under the 10 min a hook may take
const MAX_WAIVERS = 5, TOP = 8, IDLE = 2, EXTRA = 4, RECENT = 30, DAY = 864e5;
const KINDS = /^(tech|software|gaming|product|place|service)$/;

// ---------------------------------------------------------------- hook plumbing: never trap the agent
const children = new Set();
// the hook's trace: one history entry per hook call in gate.json (T.file), written once, on the way out
const T = { file: null, state: null, entry: null, saved: false, done: false, off: false };
function traceEntry(decision, reason) {
  if (!HOOK || T.done || T.off) return null;
  T.done = true;
  const file = T.file || traceFile();
  if (!file) return null;
  let s = T.state;
  if (!s) { s = readJson(file, {}); if (!s || typeof s !== 'object' || Array.isArray(s)) s = {}; }
  const why = String(reason || '').split('\n')[0].replace(/\s+/g, ' ').trim().slice(0, 160);
  if (T.entry) Object.assign(T.entry, { decision, reason: why });
  else s.history = [...(Array.isArray(s.history) ? s.history : []), { at: new Date().toISOString(), mode: 'hook', host: HOOK, decision, reason: why, stopHookActive: !!input.stop_hook_active }].slice(-20);
  return { file, s };
}
function trace(decision, reason) {
  try {
    const e = traceEntry(decision, reason);
    if (!e) return;
    let st = null;
    if (!T.saved) { try { st = fs.statSync(e.file); } catch { /* a new file */ } }
    writeJson(e.file, e.s);
    if (st) fs.utimesSync(e.file, st.atime, st.mtime);
  } catch { /* a trace never holds a stop */ }
}
// with no build armed: the newest gate.json here or one or two folders below (a finished build's), else this folder's
// .taste-skill when it exists; a new .taste-skill folder is never made for it
function traceFile() {
  const found = [base, ...below(1), ...below(2)].map(d => path.join(dotOf(d), 'gate.json')).filter(f => fs.existsSync(f));
  found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return found[0] || (fs.existsSync(dotOf(base)) ? path.join(dotOf(base), 'gate.json') : null);
}
const allow = (note, quiet) => { trace('allow', note || 'allowed'); if (note && !quiet) process.stderr.write('gate: ' + note + '\n'); process.exit(0); };
// anything unexpected in hook mode lets the agent stop: a broken gate must not hold a session
if (HOOK) for (const ev of ['uncaughtException', 'unhandledRejection']) process.on(ev, e => allow('crashed, stop allowed: ' + (e && e.message)));
// every way out takes the gate's own checks (and their Chromes) with it
process.on('exit', () => { for (const c of children) killTree(c); });
for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) { try { process.on(s, () => process.exit(HOOK ? 0 : 2)); } catch { /* not on this platform */ } }

// a host that leaves stdin open must not hold the hook until its timeout
const readStdin = ms => new Promise(res => {
  if (process.stdin.isTTY) return res('');
  let s = '';
  const done = () => { clearTimeout(t); try { process.stdin.pause(); process.stdin.destroy(); } catch { /* closed */ } res(s); };
  const t = setTimeout(done, ms);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', d => { s += d; if (s.length > 1e6) done(); });
  process.stdin.on('end', done); process.stdin.on('error', done);
});
let input = {};
if (HOOK) { try { const o = JSON.parse((await readStdin(2000)).replace(/^\uFEFF/, '') || '{}'); input = o && typeof o === 'object' ? o : {}; } catch { input = {}; } }
const base = path.resolve(typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd());

// a PowerShell write puts a BOM before the JSON
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '')); } catch { return d; } };
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 1) + '\n'); };
const slash = p => p.split(path.sep).join('/');

// ---------------------------------------------------------------- the project folder
const dotOf = d => path.join(d, '.taste-skill');
const OPEN_STATES = /^(active|fail|error)$/;
// build.json, or a round state still open: deleting or renaming the marker mid-build does not end the build
function activeIn(d) {
  if (fs.existsSync(path.join(dotOf(d), 'build.json'))) return true;
  const s = readJson(path.join(dotOf(d), 'gate.json'), null);
  return !!(s && typeof s.start === 'string' && OPEN_STATES.test(s.status || ''));
}
const lastTouch = d => Math.max(0, ...['build.json', 'gate.json'].map(f => { try { return fs.statSync(path.join(dotOf(d), f)).mtimeMs; } catch { return 0; } }));
const SKIP_DIR = /^(node_modules|\.git|\.taste-skill|\.next|\.astro|\.svelte-kit|\.cache)$/;
function findProject() {
  if (positional && !isUrl(positional)) { const d = path.dirname(path.resolve(base, positional)); if (activeIn(d)) return { dir: d, others: 0 }; }
  if (activeIn(base)) return { dir: base, others: 0 };
  // one folder below, else two (a build in site/web/ of the session's folder)
  let found = below(1).filter(activeIn);
  if (!found.length) found = below(2).filter(activeIn);
  found.sort((a, b) => lastTouch(b) - lastTouch(a));
  return { dir: found[0] || null, others: Math.max(0, found.length - 1) };
}
// the folders one or two levels below the session's folder, at most 400, never node_modules, .git or a hidden one
function below(depth) {
  let level = [base];
  for (let i = 0; i < depth; i++) {
    const next = [];
    for (const d of level) {
      try { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory() && !SKIP_DIR.test(e.name) && !(i > 0 && e.name.startsWith('.')) && next.length < 400) next.push(path.join(d, e.name)); } catch { /* unreadable folder: no build */ }
    }
    level = next;
  }
  return level;
}
// a tasteskill page (it declares its page-type) in this folder or one below, with no build armed and none finished:
// the hook says once how to arm it, so a build that skipped --start is still checked
function unarmedPage() {
  for (const d of [base, ...below(1)]) {
    const f = path.join(d, 'index.html');
    try {
      const st = fs.statSync(f);
      if (st.size > 4e6 || Date.now() - st.mtimeMs > DAY) continue;
      if (['build.done.json', 'unarmed.json'].some(x => fs.existsSync(path.join(dotOf(d), x)))) continue;
      if (/<meta\b[^>]*\bname\s*=\s*["']?page-type\b/i.test(fs.readFileSync(f, 'utf8'))) return { dir: d, file: f };
    } catch { /* no page here */ }
  }
  return null;
}

// ---------------------------------------------------------------- the page and what it declares
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m => [m[1].toLowerCase(), m[3] ?? m[4] ?? m[5]]));
function metas(html) {
  const o = {};
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) { const a = attrs(m[0]); if (a.name) o[a.name.toLowerCase()] = (a.content || '').trim().toLowerCase(); }
  o.dataType = ((html.match(/<html\b[^>]*>/i) || [''])[0].match(/data-type\s*=\s*["']?([\w-]+)/i) || [])[1]?.toLowerCase() || '';
  return o;
}
// consistency.mjs --page: the site-kind when it names a tech kind, else the page type it states
function kindOf(html) {
  const m = metas(html), site = m['site-kind'] || '';
  if (/^(software|gaming|tech)$/.test(site)) return site;
  if (m['page-kind'] === 'place') return 'place';
  const t = m['page-type'] || m.dataType;
  return /^(software|product|place|service)$/.test(t) ? t : '';
}
const fileAt = f => { try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); return fs.statSync(f).isFile() ? f : null; } catch { return null; } };
// { url } or { file }, or null
function findPage(proj, marker) {
  if (isUrl(positional)) return { url: positional };
  if (positional) { const f = fileAt(path.resolve(base, positional)); if (f) return { file: f }; }
  if (isUrl(marker.url)) return { url: marker.url };
  for (const p of [marker.page, 'index.html']) { if (typeof p !== 'string' || !p) continue; const f = fileAt(path.resolve(proj, p)); if (f) return { file: f }; }
  let names = [];
  try { names = fs.readdirSync(proj).filter(n => /\.html?$/i.test(n) && !/^credits/i.test(n)); } catch { /* none */ }
  if (names.length === 1) return { file: path.join(proj, names[0]) };
  // the page one folder down (site/index.html): only when one folder has one
  const subs = [];
  try { for (const e of fs.readdirSync(proj, { withFileTypes: true })) if (e.isDirectory() && !SKIP_DIR.test(e.name) && !/^(src|assets|shots)$/.test(e.name)) { const f = path.join(proj, e.name, 'index.html'); if (fs.existsSync(f)) subs.push(f); } } catch { /* none */ }
  return subs.length === 1 ? { file: subs[0] } : null;
}

// every local file the page loads (and what those load in turn), for the fingerprint and the static checks
const local = r => r && !/^(https?:|data:|blob:|mailto:|tel:|#|javascript:|\/\/)/i.test(r.trim());
const stripRef = r => decodeURIComponent(r.trim().split(/[?#]/)[0]);
function refsOf(file, text, root) {
  const out = [], dir = path.dirname(file), ext = path.extname(file).toLowerCase();
  const add = r => { if (!local(r)) return; try { const s = stripRef(r); if (s) out.push(s.startsWith('/') ? path.join(root, s) : path.resolve(dir, s)); } catch { /* bad escape */ } };
  if (ext === '.html' || ext === '.htm') {
    for (const m of text.matchAll(/<(link|script|img|source|video|audio|iframe|image|use)\b[^>]*>/gi)) {
      const a = attrs(m[0]);
      if (m[1].toLowerCase() === 'link' && !/stylesheet|modulepreload|preload|icon|manifest/i.test(a.rel || '')) continue;
      for (const k of ['src', 'href', 'poster', 'xlink:href']) if (a[k]) add(a[k]);
      if (a.srcset) for (const s of a.srcset.split(',')) add(s.trim().split(/\s+/)[0]);
    }
    for (const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) if (!/\bsrc\s*=/.test(m[1])) for (const r of jsRefs(m[2])) add(r);
    for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) for (const r of cssRefs(m[1])) add(r);
  } else if (/^\.(m?js)$/.test(ext)) for (const r of jsRefs(text)) add(r);
  else if (ext === '.css') for (const r of cssRefs(text)) add(r);
  return out;
}
const jsRefs = t => [...t.matchAll(/\b(?:import|export)\s*(?:[\w*{}\s,$]+\s*from\s*)?["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)].map(m => m[1] || m[2]).filter(r => /^\.{0,2}\//.test(r));
const cssRefs = t => [...t.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)|url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(m => m[1] || m[2]);
function walk(page, root) {
  const seen = new Set([page]), queue = [page];
  while (queue.length && seen.size < 600) {
    const f = queue.shift();
    if (!/\.(html?|m?js|css)$/i.test(f)) continue;
    let t; try { t = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const r of refsOf(f, t, root)) if (!seen.has(r) && fs.existsSync(r) && fs.statSync(r).isFile()) { seen.add(r); queue.push(r); }
  }
  return [...seen];
}
// a framework project's own source: the static checks read it, the fingerprint covers it (a dev server serves it)
const SRC_EXT = /\.(m?js|cjs|jsx|tsx?|vue|svelte|astro|css|scss|html?|json|mdx?)$/i;
function sourceFiles(proj) {
  const out = [];
  const go = (d, depth) => {
    if (out.length >= 3000 || depth > 8) return;
    let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!SKIP_DIR.test(e.name) && !/^(dist|build|out|coverage|shots|\.vercel|\.output)$/.test(e.name)) go(p, depth + 1); }
      else if (SRC_EXT.test(e.name) && !/^(package-lock|pnpm-lock|yarn)\b/.test(e.name)) out.push(p);
    }
  };
  for (const d of ['src', 'app', 'pages', 'components', 'lib', 'public']) go(path.join(proj, d), 0);
  try { for (const n of fs.readdirSync(proj)) if (/\.(html?|m?[jt]s|json)$/i.test(n) && !/lock/i.test(n)) out.push(path.join(proj, n)); } catch { /* none */ }
  return out;
}

// ---------------------------------------------------------------- the kit, by content
// a format-on-save pass changes whitespace, quotes and semicolons, never what a kit file does
const norm = t => t.replace(/^\uFEFF/, '').replace(/\s+/g, '').replace(/[`']/g, '"').replace(/[;,]/g, '');
const hashOf = t => crypto.createHash('sha1').update(norm(t)).digest('hex');
let KIT = null;
function kitIndex() {
  if (KIT) return KIT;
  KIT = new Map();
  const go = d => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const p = path.join(d, e.name); if (e.isDirectory()) go(p); else if (/\.(m?js|css)$/i.test(e.name)) { try { KIT.set(hashOf(fs.readFileSync(p, 'utf8')), p); } catch { /* unreadable */ } } } };
  go(path.join(SKILL, 'assets'));
  return KIT;
}
// a project file's counterpart in the kit: the path after its first assets/ folder
function kitTwin(file, root) {
  const parts = path.relative(root, file).split(path.sep), i = parts.indexOf('assets');
  if (i < 0) return null;
  const twin = path.join(SKILL, 'assets', ...parts.slice(i + 1));
  return fs.existsSync(twin) && fs.statSync(twin).isFile() ? twin : null;
}

// ---------------------------------------------------------------- the static checks
// the code without its strings and comments: a code sample in a string is not the page testing for a tool
function codeOnly(t) {
  let out = '', i = 0, prev = '';
  while (i < t.length) {
    const c = t[i], n = t[i + 1];
    if (c === '/' && n === '/') { const j = t.indexOf('\n', i); i = j < 0 ? t.length : j; continue; }
    if (c === '/' && n === '*') { const j = t.indexOf('*/', i + 2); i = j < 0 ? t.length : j + 2; out += ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < t.length && t[j] !== c) { if (t[j] === '\\') j++; else if (c !== '`' && t[j] === '\n') break; j++; }
      out += c + c; i = j + 1; prev = c; continue;
    }
    // a regex literal stays (it is code), but its quotes must not open a string
    if (c === '/' && (/^$|[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case)\s*$/.test(out.slice(-8)))) {
      let j = i + 1, cls = false;
      while (j < t.length && t[j] !== '\n' && (cls || t[j] !== '/')) { if (t[j] === '\\') j++; else if (t[j] === '[') cls = true; else if (t[j] === ']') cls = false; j++; }
      out += t.slice(i, j + 1); i = j + 1; prev = '/'; continue;
    }
    out += c; if (!/\s/.test(c)) prev = c; i++;
  }
  return out;
}
const HOOKS = /\bnavigator\s*\.\s*webdriver\b|\b(__playwright\w*|__pw_\w+|__puppeteer\w*|__selenium\w*|__webdriver\w*|__nightmare|callPhantom|_phantom|domAutomation\w*|__cc\w*)\b/;
const HOOKS_RAW = /navigator\s*\[\s*["'`]webdriver["'`]\s*\]/;
const UA = /userAgent[\s\S]{0,200}?(HeadlessChrome|headless|webdriver|puppeteer|playwright|lighthouse)|(HeadlessChrome|Headless|Lighthouse)[\s\S]{0,200}?userAgent/i;
const STRIP = /removeAttribute\(\s*[`'"]aria-hidden|setAttribute\(\s*[`'"]aria-hidden[`'"]\s*,\s*(?:[`'"]false|false\b)|\.ariaHidden\s*=\s*(?:null|false|[`'"]false)|toggleAttribute\(\s*[`'"]aria-hidden/;
const VENDOR = /\.min\.m?js$|[\\/](vendor|vendors|third[-_]party)[\\/]/i;
function staticChecks(page, html, proj, files) {
  const F = [];
  const rel = f => slash(path.relative(proj, f));
  const kit = kitIndex(), kitFiles = new Set([...kit.values()].map(p => path.resolve(p)));
  const own = [];
  for (const f of files) {
    if (kitFiles.has(path.resolve(f))) continue; // the gate run inside the skill itself
    let text; try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (/\.(m?js|css)$/i.test(f)) {
      if (kit.has(hashOf(text))) continue; // a kit file, unchanged, wherever it sits
      const twin = kitTwin(f, proj);
      if (twin) {
        F.push({ check: 'kit-edited', where: rel(f), msg: `${rel(f)} is not this version's kit copy (edited, or copied from an older version)`, fix: `copy it back from <skill>/assets/${slash(path.relative(path.join(SKILL, 'assets'), twin))} (from this skill version, also when it came from an older one) and make the change in the page's own CSS or markup`, hard: true });
        continue;
      }
    }
    if (/\.(m?js|cjs|jsx|tsx?|vue|svelte|astro)$/i.test(f) && !VENDOR.test(f) && text.length < 400000) own.push({ where: rel(f), text });
  }
  if (html) for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) if (!/\bsrc\s*=/.test(m[1]) && !/json|template|text\/(?!javascript)/i.test(m[1])) own.push({ where: rel(page) + ' (inline script)', text: m[2] });
  for (const s of own) {
    const code = codeOnly(s.text), m = code.match(HOOKS) || s.text.match(HOOKS_RAW);
    if (m) F.push({ check: 'checker-gaming', where: s.where, msg: `the page's own code tests for ${m[0].replace(/\s+/g, '')}: the page must behave the same for the checker as for a visitor`, fix: 'delete that branch; fix what the check found instead', hard: true });
    else if (UA.test(s.text)) F.push({ check: 'gaming-suspect', where: s.where, msg: 'the page\'s own script reads the user agent near "headless" or an automation tool\'s name', fix: 'delete the user-agent test; a visitor and the checker get the same page' });
    // a menu or tabs toggle aria-hidden on their own panels; stripping it from every picture hides them from the checks
    for (const q of s.text.matchAll(/querySelectorAll\(\s*[`'"]([^`'"]*)[`'"]/g)) {
      if (!/aria-hidden|\b(img|svg|picture|canvas|figure|video)\b|still|render/i.test(q[1]) || /role|tab|menu|dialog|modal|drawer|accordion|panel|nav/i.test(q[1])) continue;
      if (STRIP.test(s.text.slice(q.index, q.index + 240))) { F.push({ check: 'gaming-suspect', where: s.where, msg: `the page's own script strips aria-hidden from every ${q[1].slice(0, 40)} at run time`, fix: 'delete it; a decorative picture keeps aria-hidden, a picture that matters loses it in the markup' }); break; }
    }
  }
  return F;
}

// ---------------------------------------------------------------- the copy: copy-lint.mjs on the words the page shows
// a FAIL blocks like any other (copy-slop-word, copy-stock-phrase, copy-residue, a device past twice its budget);
// a WARN is listed and never blocks. A page file with sections is linted as written; a dev server's page, or a built
// app whose file is a shell, is linted as the browser built it (rendered.html, saved by consistency.mjs); with neither
// the copy is listed as not checked, so the run cannot PASS.
const HAS_COPY = /<(main|section|h1)\b/i;
function copyChecks(P, kind, html, rendered) {
  const res = { fails: [], warns: [], crashed: [] };
  let file = P.file && HAS_COPY.test(html) ? P.file : null;
  if (!file) {
    let t = ''; try { t = fs.readFileSync(rendered, 'utf8'); } catch { /* the checker did not save it */ }
    if (!HAS_COPY.test(t)) { res.crashed.push('the copy (the page showed no <main>, <section> or <h1> to lint)'); return res; }
    file = rendered;
  }
  const r = spawnSync(process.execPath, [path.join(here, 'copy-lint.mjs'), file, '--json', ...(kind ? ['--kind', kind] : [])], { encoding: 'utf8', timeout: 30000, windowsHide: true, maxBuffer: 1 << 24 });
  const rep = parseJson(r.stdout || '');
  if (r.error || !rep || !Array.isArray(rep.files) || !rep.files[0]) { res.crashed.push(`copy-lint.mjs could not run (exit ${r.status}${errLine(r.stderr || (r.error && r.error.message))})`); return res; }
  // a word or a phrase is one finding per hit, named by the word and its sentence, so a waiver covers that one hit and
  // never a word added later; a device used as a tic is one finding whose where carries its count and its hits, and a
  // waiver must give that whole where (a new hit changes it, and the waiver no longer matches)
  const PER_HIT = /^copy-(slop-word|stock-phrase|residue|unread)$/;
  const q = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 3) + '...' : s; };
  for (const f of rep.files[0].findings || []) {
    if (f.sev !== 'FAIL' && f.sev !== 'WARN') continue;
    const base = { check: f.id, msg: f.msg || '', fix: (f.fix || '') + ' (references/copy-tells.md)', widths: [], from: 'copy' };
    const list = f.sev === 'FAIL' ? res.fails : res.warns;
    const hits = Array.isArray(f.hits) ? f.hits.filter((h) => h && (h.match || h.sentence)) : [];
    if (PER_HIT.test(f.id) && hits.length) {
      for (const h of hits) { const m = q(h.match, 28); list.push({ ...base, where: `copy "${m}" in "${q(h.sentence, Math.max(24, 66 - m.length))}"` }); }
      continue;
    }
    const ex = hits.length ? [...new Set(hits.map((h) => q(h.match === h.sentence ? h.sentence : h.match, 24)))] : (f.examples || []).filter((x) => typeof x === 'string' && x.trim()).map((x) => q(x, 24));
    const where = ex.length ? q(`copy x${f.count || ex.length}: ${ex.map((x) => `"${x}"`).join(', ')}`, 80) : '(the copy)';
    list.push({ ...base, where, exact: f.sev === 'FAIL' && ex.length > 0 });
  }
  return res;
}

// ---------------------------------------------------------------- the browser checks, one at a time, own children only
function killTree(c) {
  if (!c || c.exitCode !== null || c.signalCode) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(c.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else { try { process.kill(-c.pid, 'SIGKILL'); } catch { try { c.kill('SIGKILL'); } catch { /* gone */ } } }
}
// a watchdog per check: it holds a pipe from the gate, and when the gate dies without saying "ok" (a host killed the
// hook) it kills that check's tree and removes its profile; Windows does not take a killed process's children with it
const WATCHDOG = `let ok=false;const fin=()=>{if(ok)process.exit(0);const[pid,...dirs]=process.argv.slice(1);const cp=require('child_process'),fs=require('fs');
try{if(process.platform==='win32')cp.spawnSync('taskkill',['/pid',pid,'/T','/F'],{stdio:'ignore',windowsHide:true});else process.kill(-Number(pid),'SIGKILL');}catch{}
setTimeout(()=>{for(const d of dirs){try{fs.rmSync(d,{recursive:true,force:true});}catch{}}process.exit(0);},1500);};
process.stdin.on('data',d=>{if(String(d).includes('ok'))ok=true;});process.stdin.on('end',fin);process.stdin.on('error',fin);process.stdin.resume();`;
const left = () => BUDGET - (Date.now() - T0);
function run(script, argv, cwd, limit, dirs) {
  return new Promise(res => {
    const ms = Math.max(5000, Math.min(limit, left() - 10000));
    const c = spawn(process.execPath, [script, ...argv], { cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, detached: process.platform !== 'win32' });
    children.add(c);
    let wd = null;
    try { wd = spawn(process.execPath, ['-e', WATCHDOG, String(c.pid), ...dirs], { stdio: ['pipe', 'ignore', 'ignore'], detached: true, windowsHide: true }); wd.on('error', () => {}); wd.stdin.on('error', () => {}); wd.unref(); } catch { wd = null; }
    const settle = () => { try { wd && wd.stdin.end('ok'); } catch { /* gone */ } };
    let out = '', err = '', timedOut = false;
    c.stdout.on('data', d => { out += d; });
    c.stderr.on('data', d => { err += d; });
    const t = setTimeout(() => { timedOut = true; killTree(c); }, ms);
    c.on('error', e => { clearTimeout(t); children.delete(c); settle(); res({ code: 2, out, err: err + e.message, timedOut }); });
    c.on('close', code => { clearTimeout(t); children.delete(c); settle(); res({ code: code ?? 2, out, err, timedOut }); });
  });
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
const profileBase = () => path.resolve(typeof opt('profile') === 'string' ? inProject(opt('profile'), 'gate') : process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome') : os.tmpdir());
const freshProfile = name => { const d = path.join(profileBase(), `gate-${process.pid}-${name}-${Date.now().toString(36)}`); fs.mkdirSync(d, { recursive: true }); return d; };
// Chrome's helpers can hold the profile's files for a moment after it exits
const rmProfile = d => { for (let i = 0; i < 20; i++) { try { fs.rmSync(d, { recursive: true, force: true }); return; } catch { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); } } };
const parseJson = t => { try { return JSON.parse(t); } catch { const i = t.indexOf('{'), j = t.indexOf('['); const k = [i, j].filter(x => x >= 0).sort((a, b) => a - b)[0]; try { return k >= 0 ? JSON.parse(t.slice(k)) : null; } catch { return null; } } };

// the line of a child's stderr that says what went wrong: Node's own "XError: ..." line before a quoted source line
const errLine = t => { const l = String(t || '').split('\n').map(x => x.trim()).filter(Boolean); const e = l.find(x => /^\w*Error\b:/.test(x)) || l.find(x => /could not|did not|no such|timed out|not found/i.test(x)) || l[0]; return e ? ': ' + e.slice(0, 160) : ''; };
const LAYOUT_FIX = {
  'bleed-one-side': 'bleed the visual to both edges or keep it on the .wrap lines', spill: 'keep it inside the .wrap; nothing past the right edge',
  'edge-left': 'start it on the .wrap left line', 'edge-right': 'end it on the .wrap right line', 'one-sided': 'let the row reach both .wrap edges',
  lines: 'put the block on the .wrap lines or the grid columns', 'screen-short': 'make the section one full screen (--h: 1, layout-v4.md section 2)',
  'screen-height': 'make the section exactly one or two screens (--h: 1 or 2)', sparse: 'fill the section or make it a screen shorter',
  neighbour: "keep the next section's heading and picture out of this screen", 'neighbour-ground': 'end the ground with the section',
  'hero-fold': 'the hero fills the first screen alone, its button inside it', 'hero-maxchars': 'shorten the h1 or give the hero room for the longest headline',
  'hero-lines': "the check fills the h1 to this hero's maxChars, not your own: take the next type pairing the deal printed (start.mjs); when the h1 is final and fits, waive it (target: section.hero h1)", 'overflow-x': 'remove what scrolls sideways', container: 'put the content in one .wrap',
};

// two house rules the checker only WARNs (its own kit demos carry neither) and the gate holds: every hero enters
// once on load, and every page deals a moment (SKILL.md house rules 5 and 8)
const HELD = new Set(['hero-enter', 'moment-none']);
async function browserChecks(target, proj, opts, gateDir) {
  const res = { fails: [], warns: [], crashed: [], seconds: {} };
  // 390 always, the quick look too (the phone is where sections run into each other); the 320 pass (overflow, collide, tap-size) comes with it
  const widths = '1440,390', sizes = QUICK ? '1440x900' : '1440x900,390x844';
  const root = opts.root && !isUrl(target) ? ['--root', opts.root] : [];
  // consistency.mjs, with what step 6 passes it
  {
    const prof = freshProfile('consistency'), out = path.join(gateDir, 'consistency'), t = Date.now();
    try { fs.rmSync(path.join(out, 'rendered.html'), { force: true }); } catch { /* none */ }
    const argv = [target, '--quick', '--widths', widths, '--json', '--profile', prof, '--out', out, ...root,
      ...(opts.kind ? ['--page', opts.kind] : []), ...(opts.category ? ['--category', opts.category] : []), ...(opts.primary ? ['--primary', opts.primary] : [])];
    const r = await run(path.join(here, 'consistency.mjs'), argv, proj, 420000, [prof]);
    rmProfile(prof); res.seconds.consistency = Math.round((Date.now() - t) / 1000);
    const rep = parseJson(r.out) || readJson(path.join(out, 'report.json'), null);
    if (r.timedOut) res.crashed.push('consistency.mjs timed out');
    else if (!rep || !Array.isArray(rep.widths)) res.crashed.push(`consistency.mjs gave no report (exit ${r.code}${errLine(r.err)})`);
    else {
      if (r.code === 2 || (rep.notCheckedAt || []).length) res.crashed.push(`consistency.mjs could not walk ${(rep.notCheckedAt || []).join(', ') || 'every width'}`);
      const lists = [...rep.widths.map(w => w.findings.map(f => ({ ...f, width: w.width }))), ...(rep.sweep ? [rep.sweep.findings] : []), ...(rep.narrow ? [rep.narrow.findings] : [])];
      for (const f of lists.flat()) {
        const item = { check: f.check, where: (f.sel || '(the page)') + (f.text ? ` "${String(f.text).slice(0, 40)}"` : ''), msg: f.msg || '', fix: f.fix || '', widths: [f.width].filter(Boolean), from: 'consistency' };
        (f.sev === 'FAIL' || HELD.has(f.check) ? res.fails : res.warns).push(item);
      }
    }
  }
  // check.mjs: every finding fails
  if (left() > 60000) {
    const prof = freshProfile('layout'), t = Date.now();
    const r = await run(path.join(SKILL, 'assets', 'layout', 'check.mjs'), ['--url', target, '--profile', prof, '--sizes', sizes, '--json', ...root], proj, 300000, [prof]);
    rmProfile(prof); res.seconds.layout = Math.round((Date.now() - t) / 1000);
    const rep = parseJson(r.out);
    if (r.timedOut) res.crashed.push('check.mjs timed out');
    else if (r.code === 2 || !Array.isArray(rep)) res.crashed.push(`check.mjs could not run (exit ${r.code}${errLine(r.err)})`);
    else for (const s of rep) for (const f of s.findings || []) res.fails.push({ check: f.rule, where: f.where, msg: f.detail || '', fix: LAYOUT_FIX[f.rule] || 'layout-v4.md', widths: [Number(String(s.size).split('x')[0])], from: 'layout' });
  } else res.crashed.push('no time left for check.mjs');
  return res;
}

// one finding per check and place, with every width it showed at
function merge(list) {
  const m = new Map();
  for (const f of list) {
    const k = f.check + '|' + f.where;
    if (m.has(k)) { const g = m.get(k); for (const w of f.widths || []) if (!g.widths.includes(w)) g.widths.push(w); } else m.set(k, { ...f, widths: [...(f.widths || [])] });
  }
  return [...m.values()];
}
// the two checkers name one fault of one section twice: one finding, one waiver
const FAMILY = { 'section-height': 'height', 'screen-height': 'height', 'screen-short': 'height', 'one-section': 'neighbour', neighbour: 'neighbour' };
const sectionId = w => (String(w).split('"')[0].match(/#([\w-]+)/) || [])[1];
function mergeFamilies(list) {
  const out = [], by = new Map();
  for (const f of list) {
    const fam = FAMILY[f.check], id = fam && sectionId(f.where), k = id ? fam + '#' + id : null;
    const g = k && by.get(k);
    if (g) {
      if (!g.ids.includes(f.check)) g.ids.push(f.check);
      if (!g.wheres.includes(f.where)) g.wheres.push(f.where);
      for (const w of f.widths || []) if (!g.widths.includes(w)) g.widths.push(w);
      continue;
    }
    const n = { ...f, ids: [f.check], wheres: [f.where], widths: [...(f.widths || [])] };
    out.push(n); if (k) by.set(k, n);
  }
  return out;
}

// ---------------------------------------------------------------- waivers: one finding each
function applyWaivers(fails, file) {
  const raw = fs.existsSync(file) ? readJson(file, undefined) : [];
  const out = { open: [], waived: [], waivers: [], problems: [] };
  if (raw === undefined || !Array.isArray(raw)) {
    out.problems.push({ check: 'waivers', where: '.taste-skill/waivers.json', msg: 'waivers.json is not a JSON array', fix: 'write it as [{"check": "<id>", "target": "<part of where>", "reason": "<why it is false>"}]', hard: true });
    out.open = fails; return out;
  }
  out.waivers = raw.map(w => ({ check: String(w && w.check || ''), target: String(w && w.target || ''), reason: String(w && w.reason || '').trim() }));
  if (out.waivers.length > MAX_WAIVERS) {
    out.problems.push({ check: 'waivers', where: '.taste-skill/waivers.json', msg: `too many waivers: fix instead (${out.waivers.length}, ${MAX_WAIVERS} at most)`, fix: `fix the findings and keep ${MAX_WAIVERS} waivers at most`, hard: true });
    out.open = fails; return out;
  }
  const taken = new Map();
  const ids = f => f.ids || [f.check], wheres = f => f.wheres || [f.where];
  for (const w of out.waivers) {
    if (!w.check) { w.invalid = 'no check id'; continue; }
    // a short target is taken only when it is the whole of a finding's where (a layout finding at "h1")
    if (w.target.length < 3 && !fails.some(f => ids(f).includes(w.check) && wheres(f).includes(w.target))) { w.invalid = 'target under 3 characters'; continue; }
    if (w.reason.length < 12) { w.invalid = 'reason under 12 characters'; continue; }
    // a copy tic (copy-lint's count and hits in its where) is waived only by its whole where
    const all = fails.filter(f => ids(f).includes(w.check) && wheres(f).some(x => (f.exact ? x === w.target : x.includes(w.target))));
    const hits = all.filter(f => !f.hard);
    if (!hits.length) { w.invalid = all.length ? `${w.check} cannot be waived` : fails.some(f => f.exact && ids(f).includes(w.check) && wheres(f).some(x => x.includes(w.target))) ? 'a copy tic is waived only by its whole where, as the gate prints it' : 'matches no open finding'; continue; }
    // a target that names several findings would wave a whole check through: it must name one
    const exact = hits.filter(f => wheres(f).includes(w.target));
    const one = hits.length === 1 ? hits[0] : exact.length === 1 ? exact[0] : null;
    if (!one) { w.invalid = `target matches ${hits.length} findings; name one (more of its where)`; continue; }
    if (!taken.has(one)) taken.set(one, w);
  }
  for (const f of fails) { const w = taken.get(f); if (w) out.waived.push({ ...f, reason: w.reason }); else out.open.push(f); }
  return out;
}

// ---------------------------------------------------------------- run
const proj = START ? null : findProject();
if (!START && !proj.dir) {
  if (HOOK) {
    const u = input.stop_hook_active ? null : unarmedPage();
    if (!u) allow('no build is active here', true);
    // told once per folder: unarmed.json never arms a build
    try { writeJson(path.join(dotOf(u.dir), 'unarmed.json'), { page: slash(path.relative(u.dir, u.file)), at: new Date().toISOString() }); } catch { allow('an unarmed page, but its .taste-skill cannot be written', true); }
    const rel = slash(path.relative(base, u.file)) || 'index.html';
    T.file = path.join(dotOf(u.dir), 'gate.json'); trace('block', `${rel} is a tasteskill page with no build armed: told how to arm it`);
    process.stdout.write(JSON.stringify({ decision: MODES[HOOK], reason: `tasteskill gate: ${rel} is a tasteskill page, but no build is armed, so it was never checked. Run ${GATE} --start ${rel}, then ${GATE}, and fix what it lists. If you are stopping to ask the user something, or this page is not one you are building, just stop again.` }));
    process.exit(0);
  }
  // never arm a folder by accident: only --start (or start.mjs) begins a build
  console.log(`gate: no build is active in ${base} (no .taste-skill/build.json); begin one with: ${GATE} --start index.html`);
  console.log('GATE: OFF (no build active)'); process.exit(0);
}
// builds in two or more folders below: this session runs them (an orchestrator), it does not build one
if (HOOK && proj.others) { T.file = fs.existsSync(dotOf(base)) ? path.join(dotOf(base), 'gate.json') : null; T.off = !T.file; }
if (HOOK && proj.others) allow(`builds are active in ${proj.others + 1} folders below ${base}; not holding this session`);
const projDir = START ? (positional && !isUrl(positional) && activeIn(path.dirname(path.resolve(base, positional))) ? path.dirname(path.resolve(base, positional)) : base) : proj.dir;
const dot = dotOf(projDir);
const markerFile = path.join(dot, 'build.json'), stateFile = path.join(dot, 'gate.json'), ledgerFile = path.join(dot, 'gate-blocks.json');
const waiverFile = path.join(dot, 'waivers.json'), gateDir = path.join(dot, 'gate');
T.file = stateFile;
const roundsArg = () => { const r = opt('rounds'); return typeof r === 'string' && /^\d+$/.test(r) ? Math.max(1, Math.min(10, Number(r))) : 3; };
const kindArg = () => { const k = (str('kind') || str('page') || '').toLowerCase(); return KINDS.test(k) ? k : null; };
// what --start and a manual run may set on the marker; --rounds only on a new build
function applyFlags(m) {
  if (positional) {
    if (isUrl(positional)) { m.url = positional; m.page = null; }
    else { const f = fileAt(path.resolve(base, positional)); m.page = slash(path.relative(projDir, f || path.resolve(base, positional))); m.url = null; }
  }
  if (str('root')) m.root = slash(path.relative(projDir, path.resolve(base, str('root')))) || '.';
  if (kindArg()) m.kind = kindArg();
  for (const k of ['category', 'primary']) if (str(k)) m[k] = str(k);
  return m;
}

// --start arms the gate: a new build, or new targets for the one still open
if (START) {
  if (isUrl(positional) && !isLocalUrl(positional)) { console.log(`gate: ${positional}: ${NOT_LOCAL}; nothing armed`); console.log('GATE: SETUP (not a local page)'); process.exit(3); }
  const old = readJson(markerFile, null), st = readJson(stateFile, null);
  const live = !!(old && typeof old === 'object' && typeof old.start === 'string' && !(st && st.start === old.start && /^(pass|open|done)$/.test(st.status || '')));
  const keep = live && !has('new');
  const m = applyFlags(keep ? { ...old } : { page: null, url: null, root: null, kind: null, category: null, primary: null, rounds: roundsArg(), start: new Date().toISOString(), by: 'gate.mjs --start' });
  if (!m.kind) { const p = findPage(projDir, m); if (p && p.file) { try { m.kind = kindOf(fs.readFileSync(p.file, 'utf8')) || null; } catch { /* unreadable */ } } }
  writeJson(markerFile, m);
  const what = m.url || m.page || '(the page, found when checked)';
  if (keep) console.log(`gate: a build is already open here (round ${st && st.start === old.start ? st.round || 0 : 0} of ${old.rounds || 3}); now checking ${what}${m.root ? ` with --root ${m.root}` : ''}. Its rounds stay${opt('rounds') !== undefined ? ' (--rounds is set only for a new build: --new)' : ''}.`);
  else console.log(`gate: build started for ${what}${m.kind ? ` (${m.kind})` : ''}, ${m.rounds} round${m.rounds > 1 ? 's' : ''}; finish with: ${GATE}`);
  process.exit(0);
}

let state = readJson(stateFile, null);
if (!state || typeof state !== 'object' || Array.isArray(state)) state = null;
let marker = readJson(markerFile, null), recovered = false;
if (!marker || typeof marker !== 'object' || typeof marker.start !== 'string') {
  // build.json gone or broken mid-build: the open round state carries the build on
  if (state && typeof state.start === 'string' && OPEN_STATES.test(state.status || '')) { marker = { ...(state.marker || {}), start: state.start }; recovered = true; }
  else {
    // a marker with no start cannot be told apart from the next build's, so its rounds could never end
    if (HOOK) allow('.taste-skill/build.json is unreadable or has no start; stop allowed');
    console.log(`gate: ${markerFile} is unreadable or has no "start"; arm the build again: ${GATE} --start <page.html>`);
    console.log('GATE: ERROR (build.json unreadable)'); process.exit(2);
  }
}
if (!state || (state.start ?? null) !== marker.start) state = { start: marker.start, round: 0, idle: 0, errors: 0, status: 'active', history: [] };
T.state = state;
const MAX = Math.max(1, Math.min(10, Math.floor(Number(marker.rounds)) || 3));
state.max = MAX;
const save = () => { state.at = new Date().toISOString(); writeJson(stateFile, state); T.saved = true; };
if (!HOOK && !QUICK) {
  if (opt('rounds') !== undefined) console.log('gate: --rounds is set when a build starts (--start --rounds N); ignored here');
  // a page or flag named here is what the hook checks too
  if (positional || str('root') || kindArg() || str('category') || str('primary')) { marker = applyFlags({ ...marker }); if (!recovered) { try { writeJson(markerFile, marker); } catch { /* read-only: this run only */ } } }
}
state.marker = marker;
// a hook stop before the gate's first run by hand in this build: never a round, and its blocks have a ledger of their own
const early = !!HOOK && !state.manual;
if (recovered && !HOOK) console.log('gate: build.json is missing or broken, but the rounds in gate.json are still open: the build goes on');

// --done: the user ended the build (stop now, or ship it as it is). Their words are recorded, the marker is renamed and
// every later stop is allowed. Never the agent's own call: an agent that wants to stop fixing has its rounds
if (has('done') && !HOOK) {
  const why = str('done');
  if (!why || why.length < 12) { console.error(`gate: --done needs the user's words, 12+ characters: ${GATE} --done "<what they said>"`); process.exit(2); }
  const left = Array.isArray(state.open) ? state.open.length : null;
  Object.assign(state, { status: 'done', doneReason: why });
  state.history = [...(state.history || []), { at: new Date().toISOString(), mode: 'done', status: 'done', reason: why.slice(0, 160), round: state.round || 0 }].slice(-20);
  try { save(); } catch (e) { console.error(`gate: could not write ${stateFile}: ${e.message}`); process.exit(2); }
  try { fs.renameSync(markerFile, path.join(dot, 'build.done.json')); } catch { try { fs.copyFileSync(markerFile, path.join(dot, 'build.done.json')); fs.rmSync(markerFile, { force: true }); } catch { /* gate.json's status ends it */ } }
  console.log(`gate: build closed at the user's word, after round ${state.round || 0} of ${MAX}${left ? `; ${left} FAIL${left > 1 ? 's were' : ' was'} open at the last run (in ${slash(path.relative(base, stateFile))})` : left === 0 ? '' : '; the gate never ran on it'}. Every later stop is allowed. Put this line, the user's words and any open FAILs in your report.`);
  console.log(`GATE: DONE (${why.replace(/\s+/g, ' ').slice(0, 100)})`); process.exit(0);
}

// every block counts here, outside gate.json, and --start never clears it
const readLedger = () => { const l = readJson(ledgerFile, []); return Array.isArray(l) ? l.filter(b => b && typeof b.at === 'string') : []; };
function block(reason) {
  const L = readLedger(); L.push({ at: new Date().toISOString(), start: marker.start, ...(early ? { early: true } : {}) });
  if (typeof input.session_id === 'string' && !state.session) state.session = input.session_id;
  traceEntry('block', reason.replace(/^tasteskill gate[:,]?\s*/, ''));
  try { writeJson(ledgerFile, L.slice(-100)); save(); } catch (e) { allow('could not record the block (' + e.message + '); stop allowed'); }
  process.stdout.write(JSON.stringify({ decision: MODES[HOOK], reason })); process.exit(0);
}

if (HOOK) {
  // the session the gate first held is the building one; another session in this project is not held
  if (state.session && typeof input.session_id === 'string' && input.session_id !== state.session) allow('a build is active here, held by another session; stop allowed');
  // rounds used up and told, or the build closed at the user's word (--done): every later stop is allowed
  if (state.status === 'open' && state.openTold) allow('rounds used up and told; every later stop is allowed', true);
  if (state.status === 'done') allow('the user ended this build (gate.mjs --done); stop allowed', true);
  if (Date.now() - lastTouch(projDir) > DAY) allow('the build has been idle over 24 hours; stop allowed (gate.mjs --start re-arms it)');
  const L = readLedger(), now = Date.now();
  // the blocks before the first run by hand count apart, so questions mid-build never use up the finish's blocks
  const mine = L.filter(b => b.start === marker.start && !!b.early === early).length, recent = L.filter(b => now - Date.parse(b.at) < 6 * 3600e3).length;
  if (mine >= MAX + EXTRA || recent >= RECENT) allow(`blocked ${mine} times for this build${early ? ' before the gate was run by hand' : ''} (${recent} in 6 hours here); stop allowed`);
}

const print = HOOK ? () => {} : (...a) => console.log(...a);
const HOW = `${GATE} --start <page.html> (a framework build: --start http://localhost:<port>/ with its dev server running, or --start dist/index.html --root dist after a build), then ${GATE}`;
const P = findPage(projDir, marker);
let html = '', setup = null;
if (!P) setup = `no page was found in ${projDir}`;
else if (P.url && !isLocalUrl(P.url)) setup = `${P.url} is not local: ${NOT_LOCAL}`;
else if (P.file) {
  try { html = fs.readFileSync(P.file, 'utf8'); } catch { html = ''; }
  const rp = slash(path.relative(projDir, P.file));
  const srcs = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']?([^"'\s>]+)/gi)].map(m => m[1]);
  if (srcs.some(s => /\.(jsx|tsx|ts|vue|svelte)([?#]|$)|^\/?src\//i.test(s))) setup = `${rp} is a framework's source shell (its sections exist only once it is served or built)`;
  // an agent that stops on a question before the page has sections
  else if (HOOK && !/<main\b|<section\b/i.test(html) && !/<script\b[^>]*type\s*=\s*["']?module|<div\b[^>]*\bid\s*=\s*["']?(root|app|__next|svelte)\b/i.test(html)) setup = `${rp} has no <main> or <section> yet`;
}
if (setup) {
  if (HOOK) {
    if (state.setupTold) allow(setup + '; told once, stop allowed');
    state.setupTold = true;
    block(`tasteskill gate: a build is active in ${projDir}, but ${setup}, so nothing was checked. If you are stopping to ask the user something, just stop again. Otherwise run ${HOW}, and fix what it lists.`);
  }
  // not a crash: the armed target is wrong or not there yet; arm the right one and run the gate again
  console.log(`gate: ${setup}. Run ${HOW}.`);
  console.log(`GATE: SETUP (${!P ? 'no page' : P.url ? 'not a local page' : 'the page cannot be checked as a file'}; arm the right target and run again)`); process.exit(3);
}

const target = P.url || P.file;
const relPage = P.url || slash(path.relative(projDir, P.file));
const root = typeof marker.root === 'string' && marker.root ? path.resolve(projDir, marker.root) : null;
const kind = (html && kindOf(html)) || (KINDS.test(marker.kind || '') ? marker.kind : '') || '';
const opts = { kind, root, category: typeof marker.category === 'string' ? marker.category : '', primary: typeof marker.primary === 'string' ? marker.primary : '' };
const walked = P.file ? walk(P.file, root || path.dirname(P.file)) : [];
const files = [...new Set([...walked, ...(P.url || fs.existsSync(path.join(projDir, 'package.json')) ? sourceFiles(projDir) : [])])];
// the page, what it loads and what the checks are told; waivers are applied after the checks, so a new waiver needs no new run
const fp = crypto.createHash('sha1');
fp.update(JSON.stringify({ target, opts }));
for (const f of files) {
  try { const st = fs.statSync(f); fp.update(f + '\0' + (/\.(html?|m?js|css|jsx|tsx?|vue|svelte|astro)$/i.test(f) && st.size < 2e6 ? fs.readFileSync(f) : `${st.size}:${st.mtimeMs}`)); } catch { /* gone */ }
}
const FP = fp.digest('hex').slice(0, 16) + (QUICK ? '-quick' : '');
let waiverText = ''; try { waiverText = fs.readFileSync(waiverFile, 'utf8'); } catch { /* none */ }
const ROUND_KEY = FP + ':' + crypto.createHash('sha1').update(waiverText).digest('hex').slice(0, 8);

const errorReason = what => `tasteskill gate: the checks could not run (${what}), so the page was not fully checked. Do not rerun them: put "GATE: ERROR (${what})" and what was not checked in your report, then finish.`;
// the whole run has a budget: past it, our children die; the first time the agent is told to report it
const guard = setTimeout(() => {
  for (const c of children) killTree(c);
  state.errors = (state.errors || 0) + 1; state.note = 'the checks ran past 9.5 minutes';
  // stored as this page's crashed result, so a stop on the same page counts it toward "crashed twice" and is not run again
  state.fp = FP; state.found = { fails: [], warns: [], crashed: ['the checks ran past 9.5 minutes'], seconds: {} };
  if (HOOK && !state.errorTold) { state.errorTold = true; block(errorReason('the checks ran past 9.5 minutes')); }
  try { save(); } catch { /* best effort */ }
  if (HOOK) allow('checks timed out; stop allowed');
  console.log('GATE: ERROR (the checks ran past 9.5 minutes)'); process.exit(2);
}, BUDGET);

let found, reused = false;
if (state.fp === FP && state.found && Array.isArray(state.found.crashed) && !state.found.crashed.length) { found = state.found; reused = true; }
else if (state.fp === FP && state.found && Array.isArray(state.found.crashed) && (state.errors >= 2 || (HOOK && state.errorTold))) {
  // the checks crashed twice on this very page, or crashed on it and the agent was told to report it: do not spend
  // minutes on another try (a crashed run that found FAILs still lists them)
  clearTimeout(guard);
  if (HOOK && state.errorTold && !(state.found.fails || []).length) allow('the checks crashed on this unchanged page and the agent was told; stop allowed');
  found = state.found; reused = true;
} else {
  print(`gate: checking ${relPage}${kind ? ` (${kind})` : ''}; this takes a few minutes on a CPU Chrome`);
  try {
    const stat = staticChecks(P.file, html, projDir, files);
    const b = await browserChecks(target, projDir, opts, gateDir);
    const c = copyChecks(P, kind, html, path.join(gateDir, 'consistency', 'rendered.html'));
    found = { fails: mergeFamilies(merge([...stat, ...b.fails, ...c.fails])), warns: merge([...b.warns, ...c.warns]), crashed: [...c.crashed, ...b.crashed], seconds: b.seconds };
  } catch (e) {
    for (const c of children) killTree(c);
    found = { fails: [], warns: [], crashed: ['the gate itself failed: ' + e.message], seconds: {} };
  }
}
clearTimeout(guard);

const W = applyWaivers(found.fails, waiverFile);
const open = [...W.problems, ...W.open];
const n = open.length;
const crashed = found.crashed.length > 0;
// only crashes in a row count toward "crashed twice": a fresh run that crashed counts, with or without FAILs found
if (!crashed) state.errors = 0;
else if (!reused) state.errors = (state.errors || 0) + 1;
if (!HOOK && !QUICK) state.manual = true;   // the gate has been run by hand: hook stops count rounds from here

// ---------------------------------------------------------------- the verdict
const idsOf = f => (f.ids && f.ids.length > 1 ? `${f.check} (${f.ids.slice(1).join(', ')})` : f.check);
const line = f => `${idsOf(f)}, ${f.where.slice(0, 80)}${f.widths && f.widths.length ? ` [${f.widths.join(',')}]` : ''}, fix: ${(f.fix || f.msg).slice(0, 160)}`;
const waivedText = () => W.waived.length ? `Waived (put these in your report): ${W.waived.map(w => `${w.check} ${w.where.slice(0, 50)} - ${w.reason}`).join('; ')}.` : '';
const badWaivers = () => { const b = W.waivers.filter(x => x.invalid); return b.length ? `Waivers ignored: ${b.map(w => `${w.check} "${w.target}" (${w.invalid})`).join('; ')}.` : ''; };
const rule = `A FAIL you judge false: add {"check": "<id>", "target": "<its where, enough to name that one finding>", "reason": "<why, 12+ characters>"} to ${slash(path.relative(base, waiverFile)) || waiverFile} (one finding each, ${MAX_WAIVERS} at most, never for kit-edited or checker-gaming); it goes in your report. Never edit the kit's files or hide the page from the checker.`;
function printAll(head) {
  print(head);
  for (const f of open) print(`  FAIL ${idsOf(f).padEnd(16)} ${f.where.slice(0, 90)}${f.widths && f.widths.length ? `  [${f.widths.join(', ')}]` : ''}\n       ${f.msg.slice(0, 220)}\n       fix: ${(f.fix || '').slice(0, 220)}`);
  for (const w of W.waived) print(`  WAIVED ${w.check} ${w.where.slice(0, 80)}: ${w.reason}`);
  for (const w of W.waivers.filter(x => x.invalid)) print(`  waiver ignored (${w.invalid}): ${w.check} "${w.target}"`);
  if (found.warns.length) print(`  ${found.warns.length} WARN (not blocking), first: ${found.warns.slice(0, 5).map(x => `${x.check} ${x.where.slice(0, 40)}`).join('; ')}`);
  if (crashed) print(`  not checked: ${found.crashed.join('; ')}`);
}
const record = (status, extra = {}) => {
  Object.assign(state, { status, fp: FP, page: relPage, found, open: open.map(({ hard, ...f }) => f), waived: W.waived, warnCount: found.warns.length, ...extra });
  const entry = { at: new Date().toISOString(), mode: HOOK ? 'hook' : QUICK ? 'quick' : 'manual', ...(HOOK ? { host: HOOK } : {}), status, fails: n, round: state.round, reused, stopHookActive: !!input.stop_hook_active };
  state.history = [...(state.history || []), entry].slice(-20);
  if (HOOK && !T.done) T.entry = entry;
  try { save(); return true; } catch (e) { process.stderr.write('gate: could not write gate.json: ' + e.message + '\n'); return false; }
};

if (QUICK) {
  // a look between rounds: no round, never closes the build
  printAll(`gate (quick look at 1440 and 390): ${n} FAIL${crashed ? ', some checks did not run' : ''}`);
  if (!HOOK) { console.log(`GATE: QUICK ${n} (not a round; run without --quick to finish)`); process.exit(n ? 1 : 0); }
  allow('a --quick run never blocks');
}

if (n === 0 && crashed) {
  // no FAIL found, but not everything ran: never a PASS; the agent is told once to report it
  const what = found.crashed.join('; ');
  if (!record('error', { note: what })) { if (HOOK) allow('could not record the run; stop allowed'); }
  if (HOOK) { if (state.errorTold) allow('checks crashed (' + what + '); told once, stop allowed'); state.errorTold = true; block(errorReason(what)); }
  printAll('gate: no FAIL in what ran, but not everything ran');
  print('Do not rerun it: put the GATE line and what was not checked in your report, then finish.');
  console.log(`GATE: ERROR (${what})`); process.exit(2);
}

if (n === 0) {
  record('pass');
  try { fs.renameSync(markerFile, path.join(dot, 'build.done.json')); } catch { try { fs.copyFileSync(markerFile, path.join(dot, 'build.done.json')); fs.rmSync(markerFile, { force: true }); } catch { /* left armed */ } }
  if (HOOK) allow('GATE: PASS', true);
  printAll('gate: no open FAIL');
  console.log('GATE: PASS'); process.exit(0);
}

// FAILs remain. A run on a changed page (or changed waivers) is a round; a manual rerun of an unchanged one is not.
// Before the gate's first run by hand in this build, a hook stop is not a round (a question to the user mid-build must
// not spend one): it lists the FAILs and blocks, and the first run by hand counts that page's round. After a hook block,
// the next stop on the unchanged page is allowed once without a round (a question to the user: "just stop again");
// other stops on it block twice without a round (nothing was fixed), then each counts as one; a change starts again
const already = state.status === 'open';
let idle = false;
if (!already) {
  if (state.roundKey !== ROUND_KEY) {
    if (!early) state.round = (state.round || 0) + 1;
    Object.assign(state, { roundKey: ROUND_KEY, roundFree: early, idle: 0, idleFree: false, blockKey: null });
  } else if (!HOOK) {
    // the round a hook stop before this first run by hand did not count
    if (state.roundFree) Object.assign(state, { roundFree: false, round: (state.round || 0) + 1, idle: 0, idleFree: false, blockKey: null });
  } else if (state.blockKey === ROUND_KEY && !state.idleFree) {
    state.idleFree = true; record('fail'); allow('nothing changed since the last block; this stop is allowed once without a round (a question to the user)');
  } else if ((state.idle || 0) < IDLE) { state.idle = (state.idle || 0) + 1; idle = true; }
  else if (!early) state.round = (state.round || 0) + 1;
}
const k = state.round || 1, last = already || (state.round || 0) >= MAX;
const top = open.slice(0, TOP).map(f => '- ' + line(f)).join('\n') + (n > TOP ? `\n(${n - TOP} more in ${slash(path.relative(base, stateFile)) || stateFile}; crops in .taste-skill/gate/consistency)` : '');
const notChecked = crashed ? ` (not checked: ${found.crashed.join('; ')})` : '';

if (last && !idle) {
  const told = !!state.openTold;
  if (!record('open', { openTold: true })) { if (HOOK) allow('could not record the round; stop allowed'); }
  // a used-up build is closed like a passed one, so a later deal or a build one folder down is not tied to it
  try { fs.renameSync(markerFile, path.join(dot, 'build.done.json')); } catch { try { fs.copyFileSync(markerFile, path.join(dot, 'build.done.json')); fs.rmSync(markerFile, { force: true }); } catch { /* gate.json's status ends it */ } }
  if (HOOK) {
    if (told) allow('rounds used up, told before', true);
    block([`tasteskill gate: rounds used up (${MAX} of ${MAX}), ${n} FAIL${n > 1 ? 's' : ''} open${notChecked}:`, top, waivedText(), 'Rounds used up: stop fixing. Put "GATE: OPEN" and these open FAILs in your report (with any waivers and their reasons), then finish.'].filter(Boolean).join('\n'));
  }
  printAll(`gate: rounds used up; ${n} FAIL open${reused ? ' (page unchanged since the last run)' : ''}`);
  print('Stop fixing: put these open FAILs and the waivers in your report, then finish.');
  console.log(`GATE: OPEN ${n} (rounds used up)`); process.exit(1);
}

if (HOOK) state.blockKey = ROUND_KEY;
if (!record('fail')) { if (HOOK) allow('could not record the round; stop allowed'); }
if (HOOK) {
  const fails = `${n} FAIL${n > 1 ? 's' : ''} remain${notChecked}`;
  const left = IDLE - (state.idle || 0);
  const head = early
    ? `tasteskill gate: ${idle ? 'nothing changed, and ' : ''}${fails} (not a round: the gate has not been run by hand in this build yet):`
    : idle
      ? `tasteskill gate: nothing changed since round ${k} of ${MAX}, and ${fails}. Finishing again without a fix is ${left ? `blocked ${left} more time${left === 1 ? '' : 's'}, then ` : ''}counted as a round:`
      : `tasteskill gate, round ${k} of ${MAX}: ${fails}:`;
  const next = early ? `Fix them; when the page is finished, run ${GATE} by hand (that run is round 1 of ${MAX}).` : `Fix them, then finish again; round ${k} of ${MAX}.`;
  // true only while this page's one free stop is unused: the next stop on it is then allowed without a round
  const ask = state.idleFree ? '' : 'If you are stopping to ask the user something, just stop again: that one stop is allowed and costs no round.';
  const done = `If the user told you to stop or to ship it as it is: ${GATE} --done "<what they said>".`;
  block([head, top, waivedText(), badWaivers(), rule, [next, ask, done].filter(Boolean).join(' ')].filter(Boolean).join('\n'));
}
printAll(`gate: ${n} FAIL open${reused ? ' (page unchanged since the last run: results reused, not a new round)' : ''}`);
print(rule);
console.log(`GATE: FAIL ${n} (round ${k} of ${MAX})`); process.exit(1);
