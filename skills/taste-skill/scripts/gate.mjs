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
  The marker names the gate.mjs that armed it ("gate"); another install's gate.mjs hands the run over to that one.
  No build: exit 0 at once in hook mode, but once for a tasteskill page (one with a page-type meta, changed in the
  last day, never armed or finished) in the folder or one below: it says how to arm it. A manual run says so
  (GATE: OFF) and arms nothing.

  The page: the one named, else the marker's page or url, else index.html, else the only .html file, else the
  index.html of the only folder below that has one. A url (a dev server) and --root (a built site's folder) go
  to both checkers as they are.
  The checks, one at a time, each in its own headless Chrome with its own temp profile:
    consistency.mjs --quick --widths 1440,390 --json   (with the marker's --page kind, --category, --primary, --root;
                                                        it walks the page at 320x640 too: overflow, collide, tap-size)
    assets/layout/check.mjs --sizes 1440x900,390x844 --json   (the layout rules, then the finish checks of
        layout-check.js lyFinish: empty-band, blank-screen, placeholder, moment-target, moment-hidden, entrance-heavy,
        reveal-heavy, hover-shift, and console-error for every error or failed file on load; its WARNs (empty-band 15-25%,
        subject-repeat, number-repeat, heading-repeat, moment-idle) never block)
  and static ones: script-twice / script-module (a script loaded twice, a module loaded as a classic script), kit-edited (a file the page loads from assets/ differs from the skill's copy, whitespace,
  quotes and semicolons aside) and checker-gaming (the page's own code looks for a headless browser or an automation
  tool). gaming-suspect, waivable: a user-agent test for headless, or aria-hidden stripped from many pictures.
  deal-drift: the page against what start.mjs plan dealt (.taste-skill/history.json, layout-history.json, else the plan
  comment): the deal that counts is the whole deal the plan comment's moments part matches, else the latest whole
  deal; a moment of it missing with no moment dealt after it standing in, a moment the plan names missing, a dealt
  scene missing, or a place hero dealt bleed, split or name built as band, FAILs, naming the history.json line and the
  page line that decided it; another hero form, close or composition WARNs; the fix names the file to copy from.
  photo-credit: every photograph of assets/img/credits.json the page uses has its line on the credits page the
  footer's credits link opens, that line names every source, and no author is a Commons category.
  photo-product (WARN): a heading names a product of the fact sheet (copy.md Products, else What it is) and its
  section's photographs (alt, data-subject) show none of it.
  One check that throws (a fault in the gate, as a Products line with a bracket once broke a regular expression and
  with it the whole run) never ends the run: it is a WARN, gate-check, naming the check, and the run goes on to a
  verdict. The static, browser, copy and motion checks carry the verdict, so a throw there is also "not checked".
  And the copy: scripts/copy-lint.mjs --json on the page's file, or, when the file holds no sections (a built app, a
  dev server), on the page as the browser built it (consistency.mjs saves it as rendered.html); copy-lint's ids (copy-slop-word,
  copy-virtue, ...; the checker's copy-headline, copy-fact and the rest are its own); its FAILs
  block (the old slop words, stock phrases, residue, a fact held back, a device used as a tic), its WARNs do not. A file whose text is a
  kit file's, wherever it sits, is the kit's and is skipped. The two checkers' ids for the
  same fault on the same section (section-height / screen-height / screen-short, one-section / neighbour) are one
  finding. And the motion: scripts/motion-lint.mjs, once it exists, run exactly as copy-lint (its FAILs block).
  The gate promotes photo-repeat to a failure. A missing planned moment fails deal-drift.
  Only a local page is checked: a file, or a URL on localhost, 127.0.0.1, [::1], *.localhost or *.test.

  Waivers: a FAIL judged false is waived in .taste-skill/waivers.json, an array of
  {"check": "<id>", "target": "<part of where it is>", "reason": "<12+ characters>"}. A waiver covers every eligible finding with that check and target. A target is 3+ characters, or the whole of a
  short where. Each copy word, stock phrase, residue or withheld hit is its own finding (where: the word and its sentence); a
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
  A run whose checks could not all run and found no FAIL is ERROR: it counts rounds as a FAIL does (a run on a changed
  page is a round; at the last round it closes the build); fix what it names and run again. The same crash on an
  unchanged page is retried once, then reused, never run a third time.
  After a close (PASS, OPEN or --done) the page is fingerprinted as it was. A run on a page that changed since the
  close (the page or a file it loads) reopens the build for one more round (build.done.json back to build.json); a run
  on the unchanged page stays GATE: OFF. The hook reopens it too, but never after --done (the user's word), never
  for a close idle over 24 hours, and never in a session other than the one the build held.
  The last line of a manual run is exactly one of:
    GATE: PASS | GATE: FAIL <n> (round <k> of <max>) | GATE: OPEN <n> (rounds used up) | GATE: QUICK <n> (...)
    | GATE: DONE (<the user's words>), after --done
  or GATE: SETUP (...) when the armed target cannot be checked yet (no page, a framework's source shell, a URL that
  is not local): arm the right one and run again; GATE: ERROR (...) when the checks themselves could not run: fix
  what it names and run again (with "rounds used up" in it, the build is closed: report it);
  GATE: OFF when no build is active, or the build closed and the page has not changed since.
  Exit 0 PASS, OFF or DONE, 1 FAIL or OPEN, 2 ERROR, 3 SETUP.
  --quick is a look between rounds: the checker at 1440 and 390 (and the 320 pass), the layout check at 1440, not a round, never closes the build (GATE: QUICK <n>).

  Hook mode blocks with exit 0 and JSON on stdout: {"decision":"block","reason":...} for claude and codex,
  {"decision":"continue","reason":...} for antigravity; it allows by printing nothing. It never traps an agent:
  - every block is counted in .taste-skill/gate-blocks.json, which --start never clears; past rounds + 4 blocks
    for one build (the blocks before the first run by hand have as many of their own), or 30 in 6 hours in the
    folder, every stop is allowed;
  - no page or a framework shell blocks once with what to do, then allows; crashed checks block once per page
    (a round when the page changed), then allow; a crashed or timed-out run is stored for its page, so a stop on
    the unchanged page reuses it (one retry at most);
  - a reopened build (a page changed after its close) has one round, so it blocks once at most before it closes again;
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
let input = {}, rawInput = '';
if (HOOK) { try { rawInput = await readStdin(2000); const o = JSON.parse(rawInput.replace(/^\uFEFF/, '') || '{}'); input = o && typeof o === 'object' ? o : {}; } catch { input = {}; } }
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
// a closed build (PASS, rounds used up, --done): its gate.json and the marker it closed with (build.done.json, else
// gate.json's copy of it)
const CLOSED_STATES = /^(pass|open|done)$/;
function closedIn(d) {
  if (fs.existsSync(path.join(dotOf(d), 'build.json'))) return null;
  const s = readJson(path.join(dotOf(d), 'gate.json'), null);
  if (!s || typeof s !== 'object' || Array.isArray(s) || typeof s.start !== 'string' || !CLOSED_STATES.test(s.status || '')) return null;
  let m = readJson(path.join(dotOf(d), 'build.done.json'), null);
  if (!m || typeof m !== 'object' || m.start !== s.start) m = s.marker && typeof s.marker === 'object' ? { ...s.marker, start: s.start } : null;
  return m ? { dir: d, marker: m, state: s } : null;
}
// the closed build of the named page's folder or this one, else the only one a folder below, else two below
function findClosed() {
  for (const d of [...(positional && !isUrl(positional) ? [path.dirname(path.resolve(base, positional))] : []), base]) { const c = closedIn(d); if (c) return c; }
  for (const depth of [1, 2]) { const c = below(depth).map(closedIn).filter(Boolean); if (c.length) return c.length === 1 ? c[0] : null; }
  return null;
}
// its page changed since the close: the fingerprint (the page, what it loads, what the checks are told) against the
// one stored at the close (a gate.json from before 2.5.3: the last run's); none stored, nothing to compare: unchanged
function changedSinceClose(c) {
  const was = String(('closedFp' in c.state ? c.state.closedFp : c.state.fp) || '').replace(/-quick$/, '');
  if (!was) return false;
  const P = findPage(c.dir, c.marker);
  if (!P || (P.url && !isLocalUrl(P.url))) return false;
  let html = ''; if (P.file) { try { html = fs.readFileSync(P.file, 'utf8'); } catch { return false; } }
  return fingerprint(c.dir, c.marker, P, html).fp !== was;
}
// one more round for a closed build whose page changed: build.json back, the rounds one past the last one used. The
// hook's block cap stays the build's first one (baseMax), so reopening never buys a session more blocks
function reopen(c) {
  const d = dotOf(c.dir), s = c.state, from = s.status;
  s.baseMax = Number(s.baseMax) || Number(s.max) || Number(c.marker.rounds) || 3;
  writeJson(path.join(d, 'build.json'), { ...c.marker, rounds: Math.max(1, (Number(s.round) || 0) + 1) });
  try { fs.rmSync(path.join(d, 'build.done.json'), { force: true }); } catch { /* build.json is what counts */ }
  s.history = [...(Array.isArray(s.history) ? s.history : []), { at: new Date().toISOString(), mode: 'reopen', from, round: s.round || 0 }].slice(-20);
  // a reopened build counts its round on the first run, hook or manual: it checks edits made after a close
  Object.assign(s, { status: 'active', reopened: (Number(s.reopened) || 0) + 1, manual: true, idle: 0, idleFree: false, blockKey: null, openTold: false, errorTold: null, setupTold: false });
  delete s.doneReason;
  writeJson(path.join(d, 'gate.json'), s);
  return from;
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
  // the starter's comments name a <meta> as an example ("A place adds <meta name="page-kind" ...>"): never read those
  html = html.replace(/<!--[\s\S]*?-->/g, '');
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
// what a run checks and its fingerprint: the target, what the checks are told (kind, root, category, primary) and
// every file the page loads (a dev server's or a framework's source too). A changed fingerprint is a changed page:
// a new round, and after a close a reopened build
function fingerprint(dir, m, P, html) {
  const target = P.url || P.file;
  const root = typeof m.root === 'string' && m.root ? path.resolve(dir, m.root) : null;
  const kind = (html && kindOf(html)) || (KINDS.test(m.kind || '') ? m.kind : '') || '';
  const opts = { kind, root, category: typeof m.category === 'string' ? m.category : '', primary: typeof m.primary === 'string' ? m.primary : '' };
  const walked = P.file ? walk(P.file, root || path.dirname(P.file)) : [];
  const files = [...new Set([...walked, ...(P.url || fs.existsSync(path.join(dir, 'package.json')) ? sourceFiles(dir) : [])])];
  const h = crypto.createHash('sha1');
  h.update(JSON.stringify({ rules:'2.5.4-ask-outcome', stillFinish:2, target, opts }));
  // Download anchors aren't loaded by the browser. Installing or removing the
  // file after a gate run must invalidate its verdict too.
  if (P.file) for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const ref = attrs(m[0]).href;
    if (!local(ref) || /\\|^[a-z][\w+.-]*:/i.test(ref)) continue;
    try {
      const name = stripRef(ref);
      if (!name || /\\|^\/\/|:/.test(name)) continue;
      const file = name.startsWith('/') ? path.join(root || path.dirname(P.file), name) : path.resolve(path.dirname(P.file), name);
      const st = fs.statSync(file, {throwIfNoEntry:false});
      h.update(file + '\0' + (st?.isFile() ? `${st.size}:${st.mtimeMs}` : 'absent'));
    } catch { /* malformed href */ }
  }
  for (const name of ['copy.md','plan.json','sections.txt','history.json','layout-history.json']) {
    try { h.update(name).update(fs.readFileSync(path.join(dir,'.taste-skill',name))); } catch { /* optional building input */ }
  }
  for (const f of files) {
    try { const st = fs.statSync(f); h.update(f + '\0' + (/\.(html?|m?js|css|jsx|tsx?|vue|svelte|astro)$/i.test(f) && st.size < 2e6 ? fs.readFileSync(f) : `${st.size}:${st.mtimeMs}`)); } catch { /* gone */ }
  }
  return { target, root, kind, opts, files, fp: h.digest('hex').slice(0, 16) };
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
  // a script loaded twice, or a module loaded as a classic script (the bakery's second <script src="assets/system.js"
  // defer>: an import.meta SyntaxError on every load)
  if (html && page) {
    const tags = [...html.matchAll(/<script\b([^>]*)>/gi)].map(m => ({ src: (m[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1], mod: /\btype\s*=\s*["']?module/i.test(m[1]) }))
      .filter(t => t.src && !/^(https?:)?\/\//i.test(t.src)).map(t => ({ ...t, key: t.src.replace(/^\.\//, '').split(/[?#]/)[0] }));
    const told = new Set();
    for (const { src, key } of tags) {
      const all = tags.filter(t => t.key === key);
      if (all.length < 2 || told.has(key)) continue;
      told.add(key);
      F.push({ check: 'script-twice', where: `<script src="${src}">`, msg: `${src} is loaded ${all.length} times${all.some(t => t.mod) && all.some(t => !t.mod) ? ', once as a module and once as a classic script (it throws there)' : ''}: its code runs twice, or fails`, fix: `keep one <script${all.some(t => t.mod) ? ' type="module"' : ''} src="${src}"></script> (the starter's last lines) and delete the other` });
    }
    for (const { src, key, mod } of tags) {
      if (mod || told.has(key)) continue;
      let text = ''; try { text = fs.readFileSync(path.resolve(path.dirname(page), key), 'utf8'); } catch { continue; }
      if (/^\s*(import|export)\s[^(]|import\.meta/m.test(codeOnly(text))) F.push({ check: 'script-module', where: `<script src="${src}">`, msg: `${src} is a module (import/export) loaded as a classic script: it throws on load and does nothing`, fix: `<script type="module" src="${src}"></script>, once, as the starter loads it` });
    }
    // a play control with no film behind it (2.5.3: a trailer poster's play disc opened a store search): it plays a
    // video file the page has, or opens the trailer's own page the brief gives (a store page, a video page), or is not
    // there (sections-library.md, the trailer slot); a search, "#" or no target is a dead control
    const live = html.replace(/<!--[\s\S]*?-->|<(template|script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, m=>' '.repeat(m.length));
    const film = /<video\b[^>]*\ssrc\s*=\s*["'][^"']+|<source\b[^>]*\ssrc\s*=\s*["'][^"']+\.(mp4|webm|mov|m4v|ogv)\b|<iframe\b[^>]*\ssrc\s*=\s*["'][^"']*(youtube|youtu\.be|vimeo|player\.)/i.test(live);
    for (const m of live.matchAll(/<(a|button)\b([^>]*)>/gi)) {
      const at = attrs(m[0]), cls = at.class || '', label = at['aria-label'] || '';
      if (!/(^|\s)(ly-play|play|play-button|btn--play)(\s|$)|__play\b/.test(cls) && !/^(play|watch)\b[^"]*\b(trailer|film|video|teaser)\b/i.test(label)) continue;
      const href = m[1].toLowerCase() === 'a' ? String(at.href || '').trim() : '';
      const search = /[?&](q|query|term|search|s|k|keywords?)=|\/search\b|\/results\b/i.test(href);
      const dead = m[1].toLowerCase() === 'a' ? (!href || href === '#' || /^javascript:/i.test(href) || search || (href.startsWith('#') && !film)) : !film;
      if (dead) F.push({ check: 'play-dead', at: m.index, where: `${m[1].toLowerCase()}${cls ? '.' + cls.trim().split(/\s+/)[0] : ''}${label ? ` "${label.slice(0, 40)}"` : ''}`, msg: `a play control with no film behind it: ${search ? `it opens a search (${href.slice(0, 70)})` : href ? `it goes to ${href.slice(0, 40)}, and the page has no video file` : 'the page has no video file for it to play'}`, fix: 'link the trailer\'s own page the brief gives (its store or video page), or the video file with controls; with neither, no play control: the poster stands as the still (sections-library.md, the trailer slot)' });
    }
  }
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

// ---------------------------------------------------------------- photo credits: counted against the photographs used
// assets/img/credits.json (photos.mjs fetch) lists every stand-in and library photograph; each one the page loads
// (photo-<id> in its markup) has its line on the credits page the footer's one credits link opens, the footer line
// names every source those photographs come from, and no author is a Commons category name. FAIL: rerun
// photos.mjs credits --out . --write and paste its footer line.
function creditChecks(page, html) {
  const F = [];
  if (!page || !html) return F;
  const dir = path.dirname(page);
  let cred; try { cred = JSON.parse(fs.readFileSync(path.join(dir, 'assets', 'img', 'credits.json'), 'utf8')); } catch { return F; }
  const list = Array.isArray(cred && cred.photos) ? cred.photos.filter(c => c && typeof c.id === 'string' && c.id) : [];
  const ids = new Set([...html.matchAll(/photo-([a-z]?\d+)(?![0-9A-Za-z])/g)].map(m => m[1]));
  const used = list.filter(c => ids.has(c.id));
  if (!used.length) return F;
  const fix = `node ${slash(path.join(SKILL, 'scripts', 'photos.mjs'))} credits --out . --write (it writes credits.html for the photographs the page uses) and paste its one footer line`;
  const link = html.match(/<a\b[^>]*\bclass\s*=\s*["'][^"']*\bcredits\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
  if (!link) { F.push({ check: 'photo-credit', where: 'footer credits line', msg: `${used.length} credited photographs are on the page and the footer has no credits line (<a class="credits">)`, fix }); return F; }
  const text = link[1].replace(/<[^>]+>/g, ' ');
  const missingSrc = [...new Set(used.map(c => c.source))].filter(s => s && !text.toLowerCase().includes(String(s).toLowerCase()));
  if (missingSrc.length) F.push({ check: 'photo-credit', where: 'footer credits line', msg: `the footer line "${text.trim().slice(0, 60)}" leaves out ${missingSrc.join(' and ')}, a source of photographs the page uses`, fix });
  const href = (attrs(link[0].match(/<a\b[^>]*>/i)[0]).href || '').split(/[?#]/)[0];
  let cp = ''; if (href && !/^[a-z]+:/i.test(href)) try { cp = fs.readFileSync(path.resolve(dir, href), 'utf8'); } catch { /* none */ }
  if (!cp) { if (href && !/^[a-z]+:|^#/i.test(href)) F.push({ check: 'photo-credit', where: `credits page ${href}`, msg: `the footer's credits link goes to ${href}, which does not exist`, fix }); return F; }
  const esc = s => String(s).replace(/&/g, '&amp;');
  const bare = used.filter(c => !(c.page && (cp.includes(c.page) || cp.includes(esc(c.page)))));
  if (bare.length) F.push({ check: 'photo-credit', where: `credits page ${href}`, msg: `${used.length} credited photographs are on the page, ${used.length - bare.length} of them on ${href}; not credited: ${bare.map(c => c.id).join(', ')}`, fix });
  const cat = cp.match(/>\s*(Category:[^<]{1,60})</i);
  if (cat) F.push({ check: 'photo-credit', where: `credits page ${href} author "${cat[1].trim().slice(0, 30)}"`, msg: `an author on ${href} is a Commons category ("${cat[1].trim()}"), not a person`, fix: `credit it as "unknown author, Wikimedia Commons": ${fix}` });
  return F;
}

// ---------------------------------------------------------------- photo-product: a heading's product against its photograph
// The products of the fact sheet (.taste-skill/copy.md: its Products line, else the nouns after "serves", "sells",
// "makes" or "bakes" in What it is): a section whose h2 or h3 names one and whose photographs' alt and data-subject show
// none of it WARNs (a cafe's cake chapter over beans in a cooling tray). A few words stand for one another (a slice is
// cake, an espresso is coffee). WARN only: photos.md, Every product on the fact sheet gets its picture.
const SAME = { coffee: 'espresso|latte|cappuccino|flat white|cortado|filter|pour-over|cup|beans|roast', cake: 'slice|tart|torte|gateau|pastry|pastries|bake|baking|sponge|cheesecake', bread: 'loaf|loaves|sourdough|baguette|roll|crust',
  room: 'bedroom|bed|suite', bike: 'bicycle|cycle', bicycle: 'bike|cycle', flower: 'bouquet|rose|tulip|bloom|stems', bouquet: 'flower|rose|tulip|bloom', tea: 'teapot|cup', breakfast: 'bread|egg|jam|table', pizza: 'pie|oven', beer: 'glass|tap|pint', wine: 'glass|bottle' };
function productChecks(html, dot) {
  const W = [];
  if (!html) return W;
  let notes = '';
  for (const d of [dot, path.join(dot, '..', '..', '.taste-skill'), path.join(dot, '..', '..', '..', '.taste-skill')]) { try { notes = fs.readFileSync(path.join(d, 'copy.md'), 'utf8'); break; } catch { /* next */ } }
  if (!notes) return W;
  const line = k => ((notes.match(new RegExp(`^\\s*${k}\\s*:\\s*(.+)$`, 'im')) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
  // brackets go before the split, so "the keyboard (one model, three colours)" is one product and never leaves
  // "colours)" behind (2.5.3: that ")" went into a regular expression and ended the whole run)
  const unbracket = s => { let t = s, o; do { o = t; t = t.replace(/\([^()]*\)|\[[^[\]]*\]|\{[^{}]*\}/g, ' '); } while (t !== o); return t.replace(/[()[\]{}]/g, ' '); };
  const split = s => unbracket(s).split(/,|;|\band\b/i);
  let phrases = /^\s*(none|n\/a|-)(?![\p{L}])/iu.test(line('Products')) ? [] : split(line('Products'));
  if (!phrases.join('').trim()) phrases = split((line('What it is').match(/\b(?:serves|sells|makes|bakes|roasts|brews|offers|rents|repairs)\s+(.+)$/i) || [])[1] || '');
  const stem = w => w.toLowerCase().replace(/ies$/, 'y').replace(/(s|x|sh|ch)es$/, '$1').replace(/([^s])s$/, '$1');
  // a noun is letters (an apostrophe or a hyphen inside), escaped all the same: nothing from the notes is read as pattern
  const nouns = [...new Set(phrases.map(p => (p.replace(/[.!?]/g, ' ').trim().split(/\s+/).pop() || '').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''))
    .filter(w => w.length > 2 && /^\p{L}[\p{L}'’-]*$/u.test(w)).map(stem))];
  if (!nouns.length) return W;
  // the u flag takes no "\-": escape the syntax characters only
  const esc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const word = s => new RegExp(`(^|[^\\p{L}])(${s})(e?s)?(?![\\p{L}])`, 'iu');
  const live = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<template\b[\s\S]*?<\/template>/gi, '');
  for (const m of live.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)) {
    const body = m[2], id = (attrs('<x ' + m[1] + '>').id || '');
    const imgs = [...body.matchAll(/<(img|svg|canvas|figure|div|section)\b[^>]*>/gi)].map(t => ({...attrs(t[0]),tag:t[1].toLowerCase()})).filter(a =>
      a.alt || a['data-subject'] || (a['aria-label'] && (['svg','canvas'].includes(a.tag) || a.role==='img' || a['data-ui'] !== undefined || /app-frame|chart|diagram/.test(a.class || ''))));
    const titles = [...body.matchAll(/<svg\b[^>]*>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<\/svg>/gi)].map(m=>m[1]);
    if (!imgs.length && !titles.length) continue;
    const heads = [...body.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)].map(h => h[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    const shows = [...imgs.map(a => [a.alt,a['aria-label'],a['data-subject']].filter(Boolean).join(' ')),...titles].join(' ');
    for (const n of nouns) {
      const h = heads.find(x => word(esc(n)).test(x));
      if (h && nouns.some(other => word(esc(other)).test(h) && word(esc(other) + (Object.hasOwn(SAME,other) ? '|' + SAME[other] : '')).test(shows))) continue;
      const namedProduct = notes.match(/^# Copy notes:\s*(.+)$/im)?.[1]?.trim();
      if (h && namedProduct && word(esc(n)).test(line('Category')) && new RegExp('(?:view|profile|drawing|render|detail) of (?:the )?' + esc(namedProduct) + '(?![\\p{L}])','iu').test(shows)) continue;
      if (!h || word(esc(n) + (Object.hasOwn(SAME, n) ? '|' + SAME[n] : '')).test(shows)) continue;
      W.push({ check: 'photo-product', where: `section${id ? '#' + id : ''} "${h.slice(0, 40)}"`, msg: `the heading names ${n} (a product on the fact sheet); the section's picture identifies "${shows.trim().slice(0, 70)}"`, fix: `show the ${n} in a photograph, drawing or working view and name it in the accessible description` });
    }
  }
  return W;
}

// ---------------------------------------------------------------- deal drift: the page against what was dealt
// What start.mjs plan dealt for this page: .taste-skill/history.json (the moments and the scene of a deal, the layout's
// close and compositions) and layout-history.json (the place hero's form), else the plan comment at the top of <body>.
// Which deal counts: the one the page says it builds. One pick run is one deal (one seed, one time); a run of two or
// three is a whole deal, a run of one (--count 1) deals one slot again. The plan's moments part (the comment at the top
// of <body>, else the "plan line" comment at the top of the file: "moments: a on .., b on .." or "moment 1  a ...")
// picks the whole deal of this build it shares the most moments with; with no moments part, the latest whole deal
// counts. A moment of that deal the page lacks is not asked for when a moment dealt after it (a later pick) is on the
// page in its place, one for one: a moment the builder dealt again is not demanded, and the moments the new pick dealt
// beside the one it took are not either. A moment the plan names, dealt in this project, and missing from the page
// FAILs too, so the plan and the page say the same. Asides in brackets ("photo-chapters (re-dealt for iris-opens)")
// and the words after "instead of", "replaces", "not" are never read as a moment the page builds. Each FAIL names the
// history.json line of the deal and the page line of the plan that decided it (2.5.3: a builder that dealt again to
// escape a FAIL was then asked for the two moments the new deal brought along, and ran out of rounds).
// A dealt moment or scene the page lacks with nothing dealt later in its place, or a place hero dealt bleed, split
// or name and built as band (data-form missing is band), or a dealt composition the page lacks (2.5.3: two shops built
// neither bleed-panel nor statement-short, and a WARN let both pass), FAILs; another hero form or close WARNs. A form
// built as close__form is the close-form, in the footer or in a section of its own. The fix names the file to copy
// from. A dealt part the brief cannot fill: deal again (start.mjs plan --has), or waive it.
const COMP_MARK = {
  'edge-split': [/\bedge-split\b/, 'an .edge-split section with five columns of text beside its photograph'],
  'colour-half': [/\bcolour-half\b/, 'a .colour-half.ground-brand section with the photograph beside the panel'],
  mirrored: [/\bgrid--mirror\b/, 'class="grid grid--mirror" on the split (sections-library.md, Compositions)'],
  'bleed-panel': [/\bcomp-bleed\b/, '<section class="section comp-bleed"> with the photograph as its layer and the words on .comp-panel (sections-library.md, Compositions)'],
  'offset-pair': [/\bcomp-offset\b/, '<div class="grid comp-offset"> with two figures of one subject (sections-library.md, Compositions)'],
  'three-up': [/\bcomp-three\b/, '<div class="grid comp-three"> with three figures on span-4 (sections-library.md, Compositions)'],
  'street-large': [/\btype-moment\b/, 'the supplied street set large as the visit\'s h2 (sections.md section 4)'],
  'statement-short': [/\bstatement--short\b/, '<section class="section statement statement--short"> (sections-library.md, Compositions)'],
  'close-form': [/\bclose--form\b|\bclose__form\b/,'the <template data-part="close-form"> of <skill>/assets/starter.html as the close'],
};
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
// the plan's words for one part (its moments): from the part's name at the start of a line or after a "·"
// to the next "·" or the next line that starts another part. Asides in brackets, and the words from "instead of",
// "replaces", "re-dealt for", "not" to the next comma, are blanked first (to spaces, so every offset still points at
// its line of the page). Returns [{ words, at }], at: where the words start in text.
const PLAN_KEYS = 'kind|plan|type|story|copy|palette|hero|entrance|nav|close|footer|buttons|mark|rhythm|bands|grounds|density|align|pictures|ideas|sub|own|compositions?|photos|reveals|moments?|scenes?|effects?|hover|then';
const blankOut = s => s.replace(/[^\n]/g, ' ');
function planPart(text, key) {
  let t = text, o;
  do { o = t; t = t.replace(/\([^()]*\)/g, blankOut); } while (t !== o);
  t = t.replace(/\([^)]*$/, blankOut)
    .replace(/\b(?:re-?dealt (?:for|from)|dealt away|instead of|in place of|rather than|replac(?:es|ed|ing)|swapped for|not|no longer|without)\b[^,;·\n]*/gi, blankOut);
  const out = [];
  for (const m of t.matchAll(new RegExp(`(?:^|\\n|·)[ \\t]*(?:${key})(?![\\w-])`, 'gi'))) {
    const from = m.index + m[0].length, rest = t.slice(from);
    const end = rest.search(new RegExp(`·|\\n[ \\t]*(?:${PLAN_KEYS})(?![\\w-])`, 'i'));
    out.push({ words: end < 0 ? rest : rest.slice(0, end), at: from });
  }
  return out;
}
// ---------------------------------------------------------------- perf.mjs's last run (.taste-skill/perf.json)
// The gate does not run perf.mjs; perf.mjs records its last run beside the page. Each FAIL of a run on this page, made
// after the page and every file it loads last changed, is a FAIL here; a run older than a change is a WARN to run it
// again (2.5.3: perf.mjs measured a layout shift of 0.569 at 390px and the gate, which never read it, said PASS).
function perfFindings(dot, file, files) {
  const out = { fails: [], warns: [] };
  let r = null; try { r = JSON.parse(fs.readFileSync(path.join(dot, 'perf.json'), 'utf8')); } catch { return out; }
  if (!r || !file || !Array.isArray(r.fails) || !r.fails.length || typeof r.page !== 'string') return out;
  const same = (a, b) => { const x = path.resolve(a), y = path.resolve(b); return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y; };
  if (!same(r.page, file)) return out;
  const changed = [file, ...(files || [])].filter(f => { try { return fs.statSync(f).mtimeMs > (+r.at || 0); } catch { return false; } });
  const when = new Date(+r.at || 0).toISOString().slice(0, 16).replace('T', ' ');
  if (changed.length) {
    out.warns.push({ check: 'perf', where: '.taste-skill/perf.json', msg: `perf.mjs FAILed ${r.fails.length} check${r.fails.length > 1 ? 's' : ''} (${r.fails.slice(0, 3).map(x => `${x.name} ${x.value} at ${x.w}px`).join('; ')}) at ${when}, before ${path.basename(changed[0])} changed`, fix: 'run perf.mjs on the page again: the gate reads its last run', widths: [], from: 'perf' });
    return out;
  }
  const by = new Map();
  for (const x of r.fails) {
    const k = x.name; if (!by.has(k)) by.set(k, { ...x, ws: [] });
    const g = by.get(k); if (!g.ws.includes(x.w)) g.ws.push(x.w);
    if (x.w < g.w) Object.assign(g, { w: x.w, value: x.value, note: x.note });
  }
  for (const x of by.values()) out.fails.push({ check: 'perf', where: `perf ${x.name}`, msg: `perf.mjs (${when}) FAILs ${x.name}: ${x.value}${x.note ? ` (${x.note})` : ''}`, fix: 'fix it as references/perf.md says (a layout shift: reserve the space the moving part takes), then run perf.mjs again: the gate reads its last run', widths: x.ws, from: 'perf' });
  return out;
}
async function dealDrift(html, dot, kind, page, frame, source) {
  const fails = [], warns = [];
  if (!html) return { fails, warns };
  const raw = f => { try { return fs.readFileSync(path.join(dot, f), 'utf8'); } catch { return ''; } };
  const read = f => { try { return JSON.parse(raw(f)); } catch { return null; } };
  const hRaw = raw('history.json'), h = read('history.json') || {}, lh = read('layout-history.json') || {};
  const plan = ((html.split(/<body\b/i)[1] || '').match(/<!--([\s\S]*?)-->/) || [])[1] || '';
  const live = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<template\b[\s\S]*?<\/template>/gi, '');
  const markup = live.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  const mounts = [...markup.matchAll(/<[a-z][\w:-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)].map(m => attrs(m[0]));
  const has = (attr,id) => mounts.some(a=>a[attr]===id);
  const named = (text, id) => new RegExp(`(^|[^\\w-])${reEsc(id)}(?![\\w-])`).test(text);
  const ids = d => { try { return fs.readdirSync(path.join(SKILL, 'assets', d), { withFileTypes: true }).filter(x => x.isDirectory() && !x.name.startsWith('_')).map(x => x.name); } catch { return []; } };
  const lineOf = (text, i) => text.slice(0, i).split('\n').length;
  const SRC = '.taste-skill/history.json';
  // the plan's moments: the comment at the top of <body>, else a comment before it that holds the plan (the starter's
  // "plan line 2"); the first one whose moments part names a moment
  const planSource = source || html;
  const bodyAt = planSource.search(/<body\b/i), comments = [...planSource.matchAll(/<!--([\s\S]*?)-->/g)];
  const sources = [comments.find(c => bodyAt >= 0 && c.index > bodyAt), ...comments.filter(c => (bodyAt < 0 || c.index < bodyAt) && /\bplan\b/i.test(c[1]))].filter(Boolean);
  const machine = read('plan.json');
  const archived = new Set();
  for (const deck of ['moments','scenes']) {
    try {
      const index = JSON.parse(fs.readFileSync(path.join(SKILL,'assets',deck,'index.json'),'utf8'));
      for (const part of index[deck]) if (part.retired || part.weight === 0 || (deck === 'moments' && part.counts === false)) archived.add(part.id);
    } catch { /* an older installed deck may have no index */ }
  }
  let momentIds = [];
  try { momentIds = JSON.parse(fs.readFileSync(path.join(SKILL,'assets/moments/index.json'),'utf8')).moments.map(m => m.id); } catch { momentIds = ids('moments'); }
  momentIds = momentIds.filter(id => !archived.has(id));
  if (machine?.version === '2.5.4') {
    const record = (field, expected, actual, list = fails) => list.push({check:'deal-drift',where:field + ' ' + expected,msg:'The plan requires ' + field + ' ' + expected + ' and the page shows ' + (actual || 'none') + ', so apply ' + expected + ' from the plan to the ' + field + '.',fix:'use the dealt ' + field + ' on the page'});
    // A replacement is explicit, carried on a moments line and built in its slot.
    const replacements = new Map(), used = new Set();
    const history = Array.isArray(h.moments) ? h.moments : [];
    const recordedLater = (oldId,newId) => {
      const old = history.findLastIndex(m=>m.id===oldId);
      return old < 0 || history.slice(old+1).some(m=>m.id===newId);
    };
    for (const c of sources) for (const line of c[1].split(/[\n·]/).filter(t => /^\s*moments?\b/i.test(t))) {
      for (const m of line.matchAll(/([\w-]+)\s*\(\s*re-dealt for ([\w-]+)\s*\)/gi)) {
        if (!used.has(m[1]) && !replacements.has(m[2]) && (machine.moments || []).includes(m[2]) && recordedLater(m[2],m[1]) && !(machine.moments || []).includes(m[1]) && momentIds.includes(m[1]) && has('data-moment',m[1])) { replacements.set(m[2],m[1]); used.add(m[1]); }
      }
    }
    for (const id of machine.moments || []) if (!archived.has(id) && !has('data-moment',id) && !replacements.has(id)) record('moment', id);
    if (machine.scene && !archived.has(machine.scene) && !has('data-big-scene',machine.scene)) record('scene',machine.scene);
    if (frame) {
      for (const key of ['hero','entrance','nav','footer','close','buttons','mark']) {
        if (key === 'nav' && frame.nav === 'direct') continue;
        if (key === 'mark' && frame.mark === 'client-logo') continue;
        if (key === 'entrance' && ['still','off','focus','exposure','aperture','doors','product-at-work'].includes(machine.entrance) &&
            (!frame.entrance || ['still','off','focus','exposure','aperture','doors','product-at-work'].includes(frame.entrance))) continue;
        if (machine[key] && machine[key] !== frame[key]) record(key,machine[key],frame[key]);
      }
      if (machine.heroVariant && !has('data-view',machine.heroVariant)) record('hero variant',machine.heroVariant);
      for (const [part,label] of [['heroPeek','hero--peek'],['heroBook','hero-book']]) {
        if (machine[part] !== true || frame[part]) continue;
        const msg = part === 'heroBook'
          ? 'The hero has 0 booking bars and the plan requires 1, so add the hero-book form from hero-place.html inside the hero.'
          : 'The plan requires a peek hero and the page has none, so use the hero--peek layout for its product window.';
        fails.push({check:'deal-drift', where:'hero ' + label, msg, fix:msg});
      }
      if (machine.density && frame.density !== machine.density) record('density',machine.density,frame.density,warns);
      const library = file => JSON.parse(fs.readFileSync(path.join(SKILL,'library',file + '.json'),'utf8'));
      const palette = machine.palette && library('palettes').find(p => p.id === machine.palette);
      const colour = c => String(c).trim().toLowerCase().replace(/^#([\da-f])([\da-f])([\da-f])$/, '#$1$1$2$2$3$3');
      if (palette && ['bg','ink','accent'].some(k => colour(frame[k]) !== colour(palette[k]))) record('palette',machine.palette,[frame.bg,frame.ink,frame.accent].join(', '));
      const type = machine.type && library('type').find(t => t.id === machine.type);
      if (type && (frame.display !== type.display.family || frame.text !== type.text.family)) record('type',machine.type,[frame.display,frame.text].join(', '));
    }
    return { fails, warns };
  }
  let mo;
  try { mo = await import('./moments.mjs'); } catch { return { fails, warns }; }
  let P = [], planLine = '';
  for (const c of sources) {
    const parts = planPart(c[1], 'moments?(?:[ \\t]*\\d+)?').map(p => ({ ...p, ids: momentIds.filter(id => named(p.words, id)) })).filter(p => p.ids.length);
    if (parts.length) { P = [...new Set(parts.flatMap(p => p.ids))]; planLine = page ? `${page} line ${lineOf(planSource, c.index + 4 + parts[0].at)}` : 'the plan comment'; break; }
  }
  const planHint = sources.length && page ? `${page} line ${lineOf(html, sources[0].index)}` : 'the top of <body>';
  // the deals, oldest first (one pick run: one seed, one time), and the history.json line each starts on
  const deals = [];
  for (const m of (Array.isArray(h.moments) ? h.moments : []).filter(m => m && m.id && !archived.has(m.id))) {
    const d = deals.find(x => x.seed === m.seed && x.at === m.at);
    if (d) { if (!d.ids.includes(m.id)) d.ids.push(m.id); } else deals.push({ seed: m.seed, at: m.at, t: Date.parse(m.at) || 0, ids: [m.id] });
  }
  const histLine = (at, key) => { const k = hRaw.indexOf(key), i = at && k >= 0 ? hRaw.indexOf(String(at), k) : -1; if (i < 0) return SRC; const b = hRaw.lastIndexOf('{', i); return `${SRC} line ${lineOf(hRaw, b < 0 ? i : b)}`; };
  // Older histories identify this build by the complete deal that shares the most moments with its plan,
  // the later one on a tie; with no moments part, or one that matches none, the latest whole deal. This build's deals:
  // since the build marker's start, or the six hours before the latest deal when that reaches further back (a build
  // armed again with --new after its deal); an older page's deal in this folder never counts
  const whole = deals.filter(d => d.ids.length >= 2), pool = whole.length ? whole : deals, latest = pool[pool.length - 1] || null;
  const mk = read('build.json') || read('build.done.json') || {};
  const since = latest ? Math.min(Date.parse(mk.start) - 60000 || Infinity, latest.t - 6 * 3600e3) : 0;
  let base = latest, matched = false;
  if (latest && P.length) {
    let best = 0;
    for (const d of pool) {
      if (d !== latest && d.t < since) continue;
      const k = d.ids.filter(id => P.includes(id)).length;
      if (k && k >= best) { best = k; base = d; matched = true; }
    }
  }
  // what decided the deal, and the way out when the page builds another deal on purpose
  const why = matched ? `in the deal the plan's moments (${planLine}) match` : P.length ? `in the last whole deal (the plan's moments, ${planLine}, match no deal)` : `in the last whole deal (the plan comment, ${planHint}, has no moments part to name another)`;
  const instead = id => (matched
    ? `or, when a moment dealt after it took its place, build that one and write "(re-dealt for ${id})" after it in the plan's moments part (${planLine})`
    : `or, when the page builds an earlier deal with one moment dealt again, list the page's moments in the plan comment's moments part (${planLine || planHint}): the deal they match counts`);
  let scene = null, sceneMsg = '';
  if (base) {
    // a moment of that deal the page lacks is not asked for while a moment dealt after it stands in on the page, one for one
    const later = new Set(deals.filter(d => d.t > base.t).flatMap(d => d.ids));
    const missing = base.ids.filter(id => !has('data-moment', id));
    const standIns = momentIds.filter(id => has('data-moment', id) && !base.ids.includes(id) && later.has(id));
    const told = missing.length > standIns.length ? missing : [];
    for (const id of told) fails.push({ check: 'deal-drift', where: `moment ${id}`, msg: `${histLine(base.at, '"moments"')} requires ${id} ${why} and the page has ${standIns.length} replacements for ${missing.length} missing moments, so mount ${id} on its intended section.`, fix: `${mo.momentSource(id)} on the content it carries and link assets/moments/${id}/moment.css; ${instead(id)}; a brief that cannot fill it: deal again` });
    // a moment the plan names, dealt in this project, is built: the plan and the page say the same
    const dealt = new Set(deals.flatMap(d => d.ids));
    for (const id of P) if (dealt.has(id) && !has('data-moment', id) && !told.includes(id)) fails.push({ check: 'deal-drift', where: `moment ${id}`, msg: `the plan's moments part (${planLine}) requires ${id} from ${histLine(deals.filter(d => d.ids.includes(id)).pop().at, '"moments"')} and the page has none, so mount ${id} on the section named in the plan.`, fix: `${mo.momentSource(id)} on the content it carries and link assets/moments/${id}/moment.css; a moment dealt away: off that part, or in brackets after its stand-in, "(re-dealt for ${id})"` });
    // its scene (dealt within a few seconds of it); a scene dealt with a later pick and built stands in
    const scenes = (Array.isArray(h.scenes) ? h.scenes : []).filter(s => s && s.id && !archived.has(s.id)), sc = scenes.filter(s => Math.abs(base.t - Date.parse(s.at)) < 10000).pop();
    if (sc && !scenes.some(s => Date.parse(s.at) > base.t + 10000 && has('data-big-scene', s.id))) { scene = sc.id; sceneMsg = `${histLine(sc.at, '"scenes"')} dealt the scene ${scene} ${why}`; }
  } else if (plan) {
    // no deal in the history: the plan comment is the deal
    const named0 = P.length ? P : momentIds.filter(id => named(plan, id));
    for (const id of named0) if (!has('data-moment', id)) fails.push({ check: 'deal-drift', where: `moment ${id}`, msg: `the plan comment (${planLine || planHint}) requires one ${id} moment and the page has none, so mount ${id} on its intended content.`, fix: `${mo.momentSource(id)} on the content it carries and link assets/moments/${id}/moment.css (references/moments.md); a brief that cannot fill it: deal again with start.mjs plan --has` });
    scene = ids('scenes').find(id => named(plan, id)) || null;
    sceneMsg = `the plan comment (${planHint}) names the scene ${scene}`;
  }
  if (scene && !archived.has(scene) && !has('data-big-scene', scene)) fails.push({ check: 'deal-drift', where: `scene ${scene}`, msg: `${sceneMsg} and the page has none, so mount data-big-scene="${scene}" on the planned scene.`, fix: `${mo.sceneSource(scene)} (references/scenes.md)` });
  // the place hero's form
  const heroTag = (live.match(/<(?:section|header)\b[^>]*\bclass\s*=\s*["'][^"']*\bhero--place\b[^>]*>/i) || [])[0];
  const pf = Array.isArray(lh.placeForms) && lh.placeForms.length ? lh.placeForms[lh.placeForms.length - 1] : (plan.match(/\bform\s*[:=]?\s*["']?(band|bleed|split|name|foot)\b/i) || [])[1];
  if (heroTag && pf) {
    const built = (attrs(heroTag)['data-form'] || 'band').toLowerCase();
    if (built !== pf && !(pf === 'foot' && built === 'bleed')) (built === 'band' ? fails : warns).push({ check: 'deal-drift', where: `hero data-form="${built}"`, msg: `The place hero uses ${built} and its plan requires ${pf}, so set data-form="${pf}" and use that layout from hero-place.html.`, fix: `data-form="${pf}" on <section class="hero hero--place">, built as <skill>/assets/layout/hero-place.html and layout.css 0b show it (deal.mjs --type place --form ${pf} prints its markup)` });
  }
  // the close and the compositions: the last value dealt per part for this kind
  const L = h.layout && typeof h.layout === 'object' ? h.layout : {};
  const prefixes = [...new Set(Object.keys(L).filter(k => /:close$/.test(k)).map(k => k.split(':')[0]))];
  const k = prefixes.includes(kind) ? kind : prefixes.length === 1 ? prefixes[0] : null;
  if (k) {
    const lastOf = key => (Array.isArray(L[`${k}:${key}`]) ? L[`${k}:${key}`].slice(-1)[0] : null);
    const close = lastOf('close');
    if (close && !new RegExp(`\\bclose--${reEsc(close.replace(/^close-/, ''))}\\b`).test(live) && !(close === 'close-form' && COMP_MARK['close-form'][0].test(live))) {
      const builtClose = (live.match(/\bclose--(\w+)/) || [])[1];
      warns.push({ check: 'deal-drift', where: `close ${builtClose ? 'close-' + builtClose : 'none'}`, msg: `the deal dealt the close ${close}; the page builds ${builtClose ? 'close-' + builtClose : 'no dealt close'}${builtClose === 'form' ? ' (close-form only when the last section is the booking form)' : ''}`, fix: close === 'close-type' ? 'the closing section\'s default <div class="closing__cta close--type"> of <skill>/assets/starter.html' : `the <template data-part="${close}"> of <skill>/assets/starter.html in the last section of main` });
    }
    for (const key of ['visit', 'offer', 'showcase', 'rooms', 'feature', 'form', 'statement']) {
      const c = lastOf(key);
      if (c && !/<section\b[^>]*\sdata-own(?:[\s=>])/i.test(live) && COMP_MARK[c] && !COMP_MARK[c][0].test(live)) fails.push({ check: 'deal-drift', where: `composition ${key} ${c}`, msg: `The plan requires one ${c} composition for ${key} and the page has none, so build the section with ${COMP_MARK[c][1]}.`, fix: `build it: ${COMP_MARK[c][1]}; a part the brief cannot fill: deal again (start.mjs plan --has), or waive it with the reason` });
    }
  }
  return { fails, warns };
}

// ---------------------------------------------------------------- the copy: copy-lint.mjs on the words the page shows
// a FAIL blocks like any other (copy-slop-word, copy-stock-phrase, copy-residue, copy-withheld, a device past twice its budget);
// a WARN is listed and never blocks. A page file with sections is linted as written; a dev server's page, or a built
// app whose file is a shell, is linted as the browser built it (rendered.html, saved by consistency.mjs); with neither
// the copy is listed as not checked, so the run cannot PASS.
const HAS_COPY = /<(main|section|h1)\b/i;
// the two linters share one CLI and one report (copy-lint.mjs, motion-lint.mjs: <file> --json --kind <kind> ->
// { files: [{ findings: [{ id, sev, msg, fix, hits, count, examples }] }] }); motion-lint runs only once it exists
const LINTS = {
  copy: { script: 'copy-lint.mjs', ref: 'references/copy-tells.md', what: 'the copy', perHit: /^copy-(slop-word|stock-phrase|residue|unread|withheld)$/ },
  motion: { script: 'motion-lint.mjs', ref: 'references/motion.md', what: 'the motion', perHit: null },
};
const copyChecks = (P, kind, html, rendered) => lintChecks(LINTS.copy, P, kind, html, rendered);
const motionChecks = (P, kind, html, rendered) => fs.existsSync(path.join(here, LINTS.motion.script)) ? lintChecks(LINTS.motion, P, kind, html, rendered) : { fails: [], warns: [], crashed: [] };
function lintChecks(L, P, kind, html, rendered) {
  const res = { fails: [], warns: [], crashed: [] };
  let file = P.file && HAS_COPY.test(html) ? P.file : null;
  if (!file) {
    let t = ''; try { t = fs.readFileSync(rendered, 'utf8'); } catch { /* the checker did not save it */ }
    if (!HAS_COPY.test(t)) { res.crashed.push(`${L.what} (the page showed no <main>, <section> or <h1> to lint)`); return res; }
    file = rendered;
  }
  const k = L === LINTS.copy ? kind : /^(tech|software|gaming|product|place|service)$/.test(kind || '') ? kind : '';   // motion-lint takes the six kinds only
  // copy-lint also takes the marker's category (copy-h1-category reads it; runs after opts is set, line ~802)
  const cat = L === LINTS.copy && opts && opts.category ? ['--category', opts.category] : [];
  const assets = [];
  if (L === LINTS.copy) {
    const root = opts.root || (P.file ? path.dirname(P.file) : projDir);
    const page = P.file || path.join(root, new URL(P.url).pathname.replace(/\/$/,'/index.html'));
    assets.push('--asset-root',root,'--asset-page',page);
  }
  const r = spawnSync(process.execPath, [path.join(here, L.script), file, '--json', ...(k ? ['--kind', k] : []), ...cat, ...assets], { encoding: 'utf8', timeout: 30000, windowsHide: true, maxBuffer: 1 << 24 });
  const rep = parseJson(r.stdout || '');
  if (r.error || !rep || !Array.isArray(rep.files) || !rep.files[0]) { res.crashed.push(`${L.script} could not run (exit ${r.status}${errLine(r.stderr || (r.error && r.error.message))})`); return res; }
  if (L === LINTS.copy) res.asks = rep.files[0].asks || [];
  // a word or a phrase is one finding per hit, named by the word and its sentence, so a waiver covers that one hit and
  // never a word added later; a device used as a tic is one finding whose where carries its count and its hits, and a
  // waiver must give that whole where (a new hit changes it, and the waiver no longer matches)
  const q = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 3) + '...' : s; };
  const tag = L === LINTS.copy ? 'copy' : 'motion';
  for (const f of rep.files[0].findings || []) {
    if (f.sev !== 'FAIL' && f.sev !== 'WARN') continue;
    const ref = f.id==='ask-outcome' ? 'references/copy.md' : L.ref;
    const base = { check: f.id, msg: f.msg || '', fix: (f.fix || '') + ` (${ref})`, widths: [], from: tag };
    const list = f.sev === 'FAIL' ? res.fails : res.warns;
    const hits = Array.isArray(f.hits) ? f.hits.filter((h) => h && (h.match || h.sentence)) : [];
    if (L.perHit && L.perHit.test(f.id) && hits.length) {
      for (const h of hits) { const m = q(h.match, 28); list.push({ ...base, where: `${tag} "${m}" in "${q(h.sentence, Math.max(24, 66 - m.length))}"` }); }
      continue;
    }
    const ex = hits.length ? [...new Set(hits.map((h) => q(h.match === h.sentence ? h.sentence : h.match, 24)))] : (f.examples || []).filter((x) => typeof x === 'string' && x.trim()).map((x) => q(x, 24));
    const where = (tag === 'motion' || f.id==='ask-outcome') && f.where ? q(`${tag} ${f.where}`, 80) : ex.length ? q(`${tag} x${f.count || ex.length}: ${ex.map((x) => `"${x}"`).join(', ')}`, 80) : `(${L.what})`;
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
const exactProfile = process.env.TASTE_SKILL_CHROME_PROFILE && path.resolve(process.env.TASTE_SKILL_CHROME_PROFILE);
const freshProfile = name => { if (exactProfile) { fs.mkdirSync(exactProfile,{recursive:true}); return exactProfile; } const d = path.join(profileBase(), `gate-${process.pid}-${name}-${Date.now().toString(36)}`); fs.mkdirSync(d, { recursive: true }); return d; };
// Chrome's helpers can hold the profile's files for a moment after it exits
const rmProfile = d => { if (d === exactProfile) return; for (let i = 0; i < 20; i++) { try { fs.rmSync(d, { recursive: true, force: true }); return; } catch { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); } } };
const parseJson = t => { try { return JSON.parse(t); } catch { const i = t.indexOf('{'), j = t.indexOf('['); const k = [i, j].filter(x => x >= 0).sort((a, b) => a - b)[0]; try { return k >= 0 ? JSON.parse(t.slice(k)) : null; } catch { return null; } } };

// the line of a child's stderr that says what went wrong: Node's own "XError: ..." line before a quoted source line
const errLine = t => { const l = String(t || '').split('\n').map(x => x.trim()).filter(Boolean); const e = l.find(x => /^\w*Error\b:/.test(x)) || l.find(x => /could not|did not|no such|timed out|not found/i.test(x)) || l[0]; return e ? ': ' + e.slice(0, 160) : ''; };
const LAYOUT_FIX = {
  'bleed-one-side': 'bleed the visual to both edges or keep it on the .wrap lines', spill: 'keep it inside the .wrap; nothing past the right edge',
  'edge-left': 'start it on the .wrap left line', 'edge-right': 'end it on the .wrap right line', 'one-sided': 'let the row reach both .wrap edges',
  lines: 'put the block on the .wrap lines or the grid columns', 'section-height': 'let the section be as tall as its content: drop any fixed or min height you set; never cut or hide content to fit (layout-v4.md section 2)',
  'section-air': 'keep the kit padding (--padt, --padb) on the section; never zero it or add your own', sparse: 'give the section the content its heading promises, or merge it into the section next to it',
  neighbour: "keep the next section's heading and picture out of this screen", 'neighbour-ground': 'end the ground with the section',
  'hero-fold': 'the hero contains its offer and action; keep the next heading or control whole at the fold', 'hero-maxchars': 'shorten the h1 or give the hero room for the longest headline',
  'hero-lines': 'widen the headline column so the page headline fits its line limit', 'overflow-x': 'remove what scrolls sideways', container: 'put the content in one .wrap',
};

// Keep the gate promotion for a repeated photograph.
const HELD = new Set(['photo-repeat']);
async function browserChecks(target, proj, opts, gateDir) {
  const res = { fails: [], warns: [], crashed: [], seconds: {} };
  // 390 always, the quick look too (the phone is where sections run into each other); the 320 pass (overflow, collide, tap-size) comes with it
  const widths = '1440,390', sizes = QUICK ? '1440x900' : '1440x900,390x844';
  const root = opts.root && !isUrl(target) ? ['--root', opts.root] : [];
  // consistency.mjs, with what step 6 passes it
  {
    const prof = freshProfile('consistency'), out = path.join(gateDir, 'consistency'), t = Date.now();
    try { fs.rmSync(path.join(out, 'rendered.html'), { force: true }); } catch { /* none */ }
    let products = '', askIds = [];
    try {
      const notes = fs.readFileSync(path.join(gateDir, '..', 'copy.md'), 'utf8');
      askIds = [...notes.matchAll(/^\s*-.*?->\s*#([\w-]+)/gm)].map(m=>m[1]);
      products = notes.match(/^\s*Products:\s*([^\r\n]+)/im)?.[1].trim() || '';
    } catch { /* copy lint reports missing notes */ }
    const argv = [target, ...(askIds.length ? ['--ask-ids',askIds.join(',')] : []), ...(products ? ['--products', products] : []), '--quick', '--widths', widths, '--json', '--profile', prof, '--out', out, ...root,
      ...(opts.kind ? ['--page', opts.kind] : []), ...(opts.category ? ['--category', opts.category] : []), ...(opts.primary ? ['--primary', opts.primary] : [])];
    const r = await run(path.join(here, 'consistency.mjs'), argv, proj, 420000, exactProfile ? [] : [prof]);
    rmProfile(prof); res.seconds.consistency = Math.round((Date.now() - t) / 1000);
    const rep = parseJson(r.out) || readJson(path.join(out, 'report.json'), null);
    if (r.timedOut) res.crashed.push('consistency.mjs timed out');
    else if (!rep || !Array.isArray(rep.widths)) res.crashed.push(`consistency.mjs gave no report (exit ${r.code}${errLine(r.err)})`);
    else {
      if (r.code === 2 || (rep.notCheckedAt || []).length) res.crashed.push(`consistency.mjs could not walk ${(rep.notCheckedAt || []).join(', ') || 'every width'}`);
      res.previews = rep.widths.map(w => ({width:w.width, scopes:w.previewEvidence || {}}));
      res.frame = rep.widths.find(w => w.frame)?.frame;
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
    const r = await run(path.join(SKILL, 'assets', 'layout', 'check.mjs'), ['--url', target, '--profile', prof, '--sizes', sizes, '--json', ...root], proj, 300000, exactProfile ? [] : [prof]);
    rmProfile(prof); res.seconds.layout = Math.round((Date.now() - t) / 1000);
    const rep = parseJson(r.out);
    if (r.timedOut) res.crashed.push('check.mjs timed out');
    else if (r.code === 2 || !Array.isArray(rep)) res.crashed.push(`check.mjs could not run (exit ${r.code}${errLine(r.err)})`);
    // every finding fails but the finish checks' WARNs (empty-band under 25%, the repeats, moment-idle)
    else for (const s of rep) for (const f of s.findings || []) (f.sev === 'WARN' ? res.warns : res.fails).push({ check: f.rule, where: f.where, msg: f.detail || '', fix: f.fix || LAYOUT_FIX[f.rule] || 'layout-v4.md', widths: [Number(String(s.size).split('x')[0])], from: 'layout' });
  } else res.crashed.push('no time left for check.mjs');
  return res;
}

// one finding per check and place, with every width it showed at
function merge(list) {
  const m = new Map();
  for (const f of list) {
    const k = f.check + '|' + (f.check === 'copy-headings' && f.msg.startsWith('Name the subject in ') ? 'slogans' : f.where);
    if (m.has(k)) { const g = m.get(k); for (const w of f.widths || []) if (!g.widths.includes(w)) g.widths.push(w); } else m.set(k, { ...f, widths: [...(f.widths || [])] });
  }
  return [...m.values()];
}
// the two checkers name one fault of one section twice: one finding, one waiver
const FAMILY = { 'section-height': 'height', 'screen-height': 'height', 'screen-short': 'height', 'one-section': 'neighbour', neighbour: 'neighbour',
  'empty-band': 'empty', sparse: 'empty', 'empty-area': 'empty', 'section-air': 'empty' };
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

// ---------------------------------------------------------------- waivers by check and target
function applyWaivers(fails, file) {
  const raw = fs.existsSync(file) ? readJson(file, undefined) : [];
  const out = { open: [], waived: [], waivers: [], problems: [] };
  if (raw === undefined || !Array.isArray(raw)) {
    out.problems.push({ check: 'waivers', where: '.taste-skill/waivers.json', msg: 'waivers.json is not a JSON array', fix: 'write it as [{"check": "<id>", "target": "<part of where>", "reason": "<why it is false>"}]', hard: true });
    out.open = fails; return out;
  }
  // a target copied whole from the printed FAIL line is read as its where: the "FAIL <id>" before it, the widths
  // after it ("  [390]") and runs of spaces drop (2.5.3: a waiver ending " [390]" matched no open finding)
  const sp = t => String(t).replace(/\s+/g, ' ').trim();
  const bare = (t, check) => { let s = sp(t).replace(/^FAIL\s+/, ''); if (check && s.startsWith(check + ' ')) s = s.slice(check.length + 1); return s.replace(/\s+\[\d+(?:\s*,\s*\d+)*\]$/, '').trim(); };
  out.waivers = raw.map(w => ({ check: String(w && w.check || ''), target: bare(String(w && w.target || ''), String(w && w.check || '')), reason: String(w && w.reason || '').trim() }));
  if (out.waivers.length > MAX_WAIVERS) {
    out.problems.push({ check: 'waivers', where: '.taste-skill/waivers.json', msg: `too many waivers: fix instead (${out.waivers.length}, ${MAX_WAIVERS} at most)`, fix: `fix the findings and keep ${MAX_WAIVERS} waivers at most`, hard: true });
    out.open = fails; return out;
  }
  const taken = new Map();
  const ids = f => f.ids || [f.check], wheres = f => (f.wheres || [f.where]).map(sp);
  for (const w of out.waivers) {
    if (!w.check) { w.invalid = 'no check id'; continue; }
    // a short target is taken only when it is the whole of a finding's where (a layout finding at "h1")
    if (w.target.length < 3 && !fails.some(f => ids(f).includes(w.check) && wheres(f).includes(w.target))) { w.invalid = 'target under 3 characters'; continue; }
    if (w.reason.length < 12) { w.invalid = 'reason under 12 characters'; continue; }
    // a copy tic (copy-lint's count and hits in its where) is waived only by its whole where
    const all = fails.filter(f => ids(f).includes(w.check) && wheres(f).some(x => (f.exact ? x === w.target : x.includes(w.target))));
    const hits = all.filter(f => !f.hard);
    if (!hits.length) { w.invalid = all.length ? `${w.check} cannot be waived` : fails.some(f => f.exact && ids(f).includes(w.check) && wheres(f).some(x => x.includes(w.target))) ? 'a copy tic is waived only by its whole where, as the gate prints it' : 'matches no open finding'; continue; }
    for (const f of hits) if (!taken.has(f)) taken.set(f, w);
  }
  for (const f of fails) { const w = taken.get(f); if (w) out.waived.push({ ...f, reason: w.reason }); else out.open.push(f); }
  return out;
}

// ---------------------------------------------------------------- run
const proj = START ? null : findProject();
// a closed build whose page changed since the close: the run checks it again, one more round. The hook does so only
// for a PASS or rounds-used-up close (never after --done, the user's word), within a day of it and in the session
// the build held; --quick and --done never reopen
let reopened = null, closedHere = null;
if (!START && !proj.dir) {
  const c = findClosed();
  const mayHook = c && (c.state.status !== 'done' && Date.now() - lastTouch(c.dir) <= DAY && !(c.state.session && typeof input.session_id === 'string' && input.session_id !== c.state.session));
  if (c && (HOOK ? mayHook : true) && changedSinceClose(c)) {
    if (!HOOK && (QUICK || has('done'))) closedHere = { ...c, changed: true };
    else { reopened = reopen(c); proj.dir = c.dir; }
  } else if (c) closedHere = c;
}
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
  // a closed build: nothing changed since its close (or a --quick or --done run, which never reopens one)
  if (closedHere) {
    const how = { pass: 'with a PASS', open: 'with its rounds used up', done: "at the user's word" }[closedHere.state.status] || '';
    const where = slash(path.relative(base, closedHere.dir)) || '.';
    if (closedHere.changed) console.log(`gate: the build in ${where} closed ${how}, and its page changed since: run ${GATE} without --quick or --done to check it again (one more round)`);
    else console.log(`gate: the build in ${where} closed ${how}, and its page has not changed since: nothing to check. A change to the page is checked again by the next run, one more round; never re-arm it with --start to get rounds back`);
    console.log(`GATE: OFF (${closedHere.changed ? 'the build closed; run without --quick to check the changes' : 'the build closed and the page has not changed since'})`); process.exit(0);
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

// the build is judged by the gate that armed it: with two installs the hook may have found another version's gate.mjs.
// The marker's gate (an installed skill's scripts/gate.mjs, outside the project's own files unless in its skills
// folders) runs instead, with the same arguments and stdin, and its output and exit code are this run's. A marker
// without one (2.5.1 and older), a gate that is gone, or a run already handed over (the env flag) runs here.
function armingGate() {
  if (START || process.env.TASTE_SKILL_GATE_HANDOFF) return null;
  let m = readJson(markerFile, null);
  // build.json gone mid-build: the open round state's copy of it
  if (!fs.existsSync(markerFile)) { const s = readJson(stateFile, null); m = s && typeof s === 'object' && OPEN_STATES.test(s.status || '') ? s.marker : null; }
  if (!m || typeof m !== 'object' || typeof m.gate !== 'string' || !path.isAbsolute(m.gate) || path.basename(m.gate) !== 'gate.mjs') return null;
  const real = p => { try { return fs.realpathSync(p); } catch { return null; } };
  const to = real(m.gate), me = real(SELF) || SELF, same = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
  if (!to || same(to, me) || !fs.statSync(to).isFile()) return null;
  const skill = path.dirname(path.dirname(to));
  try { if (!/^name:\s*design-taste-frontend\s*$/m.test(fs.readFileSync(path.join(skill, 'SKILL.md'), 'utf8').slice(0, 400))) return null; } catch { return null; }
  // a gate inside the project is taken only from its skills folders: a page's own files never name the code that judges it
  const under = (p, d) => { const r = path.relative(d, p); return r && !r.startsWith('..') && !path.isAbsolute(r); };
  for (const d of new Set([base, projDir].map(x => real(x) || x))) if (under(to, d) && !['.claude', '.agents'].some(a => under(to, path.join(d, a, 'skills')))) return null;
  return to;
}
{
  const to = armingGate();
  if (to) {
    const r = spawnSync(process.execPath, [to, ...args], { cwd: process.cwd(), input: HOOK ? rawInput : undefined, stdio: [HOOK ? 'pipe' : 'inherit', 'inherit', 'inherit'], env: { ...process.env, TASTE_SKILL_GATE_HANDOFF: SELF }, windowsHide: true, timeout: BUDGET + 20000 });
    if (r.status !== null) process.exit(r.status);
    // it could not start: this gate judges; it started and was stopped (its time ran out): the run is over
    if (r.pid) {
      T.file = stateFile;
      if (HOOK) allow(`the gate that armed this build (${to}) did not finish; stop allowed`);
      console.log(`GATE: ERROR (the gate that armed this build, ${to}, did not finish)`); process.exit(2);
    }
  }
}
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
  m.gate = SELF; // this gate judges the build, whichever install the hook finds
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
if (reopened && !HOOK) console.log(`gate: the page changed after the build closed (${{ pass: 'PASS', open: 'rounds used up', done: "the user's word" }[reopened] || reopened}): this run checks it again, round ${(state.round || 0) + 1} of ${MAX}, the last`);

// --done: the user ended the build (stop now, or ship it as it is). Their words are recorded, the marker is renamed and
// every later stop is allowed. Never the agent's own call: an agent that wants to stop fixing has its rounds
if (has('done') && !HOOK) {
  const why = str('done');
  if (!why || why.length < 12) { console.error(`gate: --done needs the user's words, 12+ characters: ${GATE} --done "<what they said>"`); process.exit(2); }
  const left = Array.isArray(state.open) ? state.open.length : null;
  // the page as it is now: a later run on a changed page checks it again (never the hook, after the user's word)
  let closedFp = null;
  try { const p = findPage(projDir, marker); if (p && !(p.url && !isLocalUrl(p.url))) closedFp = fingerprint(projDir, marker, p, p.file ? fs.readFileSync(p.file, 'utf8') : '').fp; } catch { /* none: a later run stays OFF */ }
  Object.assign(state, { status: 'done', doneReason: why, closedFp });
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
  // a reopened build keeps the cap of its first rounds: one more round never buys more blocks
  if (mine >= (Number(state.baseMax) || MAX) + EXTRA || recent >= RECENT) allow(`blocked ${mine} times for this build${early ? ' before the gate was run by hand' : ''} (${recent} in 6 hours here); stop allowed`);
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

const relPage = P.url || slash(path.relative(projDir, P.file));
// the page, what it loads and what the checks are told; waivers are applied after the checks, so a new waiver needs no new run
const { target, root, kind, opts, files, fp: PAGE_FP } = fingerprint(projDir, marker, P, html);
const FP = PAGE_FP + (QUICK ? '-quick' : '');
let waiverText = ''; try { waiverText = fs.readFileSync(waiverFile, 'utf8'); } catch { /* none */ }
const ROUND_KEY = FP + ':' + crypto.createHash('sha1').update(waiverText).digest('hex').slice(0, 8);

// an ERROR is fixed and run again like a FAIL: what it names is often the page's (a page that does not load, a
// script that hangs the browser, no <main>); one that names nothing of the page is reported
const errorReason = (what, k) => `tasteskill gate: the checks could not run (${what}), so the page was not fully checked${k ? ` (round ${k} of ${MAX})` : ''}. Fix what that names (a page or a file that does not load, a script that throws or hangs, a page with no <main>), then finish again. If it names nothing on the page (Chrome would not start, a fault in the gate), put "GATE: ERROR (${what})" and what was not checked in your report, then finish.`;
// the whole run has a budget: past it, our children die; the agent is told once for this page, and a changed page's
// timeout counts its round as any other run does
const guard = setTimeout(() => {
  for (const c of children) killTree(c);
  state.errors = (state.errors || 0) + 1; state.note = 'the checks ran past 9.5 minutes';
  // stored as this page's crashed result, so a stop on the same page counts it toward "crashed twice" and is not run again
  state.fp = FP; state.found = { fails: [], warns: [], crashed: ['the checks ran past 9.5 minutes'], seconds: {} };
  if (!QUICK && state.status !== 'open' && state.roundKey !== ROUND_KEY) {
    if (!early) state.round = (state.round || 0) + 1;
    Object.assign(state, { roundKey: ROUND_KEY, roundFree: early, idle: 0, idleFree: false, blockKey: null });
  }
  if (!QUICK) state.status = 'error';
  if (HOOK && state.errorTold !== FP) { state.errorTold = FP; block(errorReason('the checks ran past 9.5 minutes', early ? 0 : state.round)); }
  try { save(); } catch { /* best effort */ }
  if (HOOK) allow('checks timed out; stop allowed');
  console.log(`gate: the checks ran past 9.5 minutes (round ${state.round || 0} of ${MAX}): make the page lighter where it hangs (a heavy script, a huge image, a loop that never ends), then run it again`);
  console.log('GATE: ERROR (the checks ran past 9.5 minutes)'); process.exit(2);
}, BUDGET);

// one check that throws never ends the run (2.5.3: a bracket in copy.md's Products line broke photo-product's regular
// expression, and five builds lost every finding of minutes of browser checks to one GATE: ERROR). It is listed as a
// WARN naming the check and the run goes on to its verdict; the checks the verdict rests on (static, browser, copy,
// motion) are also listed as not checked, so a throw there is never a PASS
const thrown = [], skipped = [];
async function safely(name, fn, empty, core) {
  try { return await fn(); } catch (e) {
    const why = String((e && e.message) || e).split('\n')[0].slice(0, 160);
    thrown.push({ check: 'gate-check', where: `the ${name} check`, msg: `the gate's own ${name} check threw (${why}) and was skipped`, fix: 'nothing on the page: a fault in the gate; name it in your report', widths: [], from: 'gate' });
    if (core) skipped.push(`the ${name} check threw: ${why}`);
    return empty;
  }
}
let found, reused = false;
if (state.fp === FP && state.found && Array.isArray(state.found.crashed) && !state.found.crashed.length) { found = state.found; reused = true; }
else if (state.fp === FP && state.found && Array.isArray(state.found.crashed) && (state.errors >= 2 || (HOOK && state.errorTold === FP))) {
  // the checks crashed twice on this very page, or crashed on it and the agent was told: do not spend minutes on
  // another try (a crashed run that found FAILs still lists them)
  clearTimeout(guard);
  if (HOOK && state.errorTold === FP && !(state.found.fails || []).length) allow('the checks crashed on this unchanged page and the agent was told; stop allowed');
  found = state.found; reused = true;
} else {
  print(`gate: checking ${relPage}${kind ? ` (${kind})` : ''}; this takes a few minutes on a CPU Chrome`);
  try {
    const rendered = path.join(gateDir, 'consistency', 'rendered.html'), none = { fails: [], warns: [], crashed: [] };
    const stat = [...await safely('static', () => staticChecks(P.file, html, projDir, files), [], true), ...await safely('photo-credit', () => creditChecks(P.file, html), [])];
    const b = await safely('browser', () => browserChecks(target, projDir, opts, gateDir), { ...none, seconds: {} }, true);
    const c = await safely('copy', () => copyChecks(P, kind, html, rendered), none, true);
    const mo = await safely('motion', () => motionChecks(P, kind, html, rendered), none, true);
    let renderedHtml = ''; if (!HAS_COPY.test(html) || fs.existsSync(path.join(dot,'plan.json'))) try { renderedHtml = fs.readFileSync(rendered, 'utf8'); } catch { /* none */ }
    const dd = await safely('deal-drift', () => dealDrift(renderedHtml || html, dot, kind, html ? relPage : null, b.frame, html), { fails: [], warns: [] });
    const pp = await safely('photo-product', () => productChecks(html || renderedHtml, dot), []);
    const headingMessages = new Set(b.fails.filter(f => f.check === 'copy-headings').map(f => f.msg));
    const sourceFails = c.fails.filter(f => f.check !== 'copy-headings' || !headingMessages.has(f.msg));
    const covered = new Set((c.asks || []).flatMap(a=>a.playControls || []));
    const handoffs = [];
    for (const ask of c.asks || []) if (ask.state === 'preview' && ask.id) {
      const widths = (b.previews || []).filter(w => w.scopes[ask.id] === false).map(w => w.width);
      if (widths.length) handoffs.push({check:'preview-handoff',where:'#'+ask.id,widths,msg:'The preview needs a visible body-size handoff beside its action.',fix:'Name what opens and explain it beside the button.'});
    }
    const staticFails = stat.filter(f=>f.check!=='play-dead' || !covered.has(f.at));
    found = { asks: c.asks || [], fails: mergeFamilies(merge([...staticFails, ...b.fails, ...sourceFails, ...mo.fails, ...dd.fails])), warns: merge([...b.warns, ...c.warns, ...mo.warns, ...dd.warns, ...handoffs, ...pp, ...thrown]), crashed: [...c.crashed, ...mo.crashed, ...b.crashed, ...skipped], seconds: b.seconds || {} };
  } catch (e) {
    for (const c of children) killTree(c);
    found = { fails: [], warns: [], crashed: ['the gate itself failed: ' + e.message], seconds: {} };
  }
}
clearTimeout(guard);
// perf.mjs's last run on this page, read fresh on every run (a reused result keeps none of an older one)
{
  const pf = P.file ? perfFindings(dot, P.file, files) : { fails: [], warns: [] };
  found = { ...found, fails: [...found.fails.filter(f => f.from !== 'perf'), ...pf.fails], warns: [...found.warns.filter(f => f.from !== 'perf'), ...pf.warns] };
}

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
// Keep the measurement and its remedy together in the short Stop-hook reply too.
const directAdvice = f => ['container-edges','copy-headings','deal-drift','edge-right','hero-fold','hero-lines','hero-maxchars','no-visual','product-shown','split-pair'].includes(f.check) && /, so /.test(f.msg);
const line = f => `${idsOf(f)}, ${f.where.slice(0, 80)}${f.widths && f.widths.length ? ` [${f.widths.join(',')}]` : ''}, ${directAdvice(f) ? f.msg : 'fix: ' + (f.fix || f.msg).slice(0, 160)}`;
const waivedText = () => W.waived.length ? `Waived (put these in your report): ${W.waived.map(w => `${w.check} ${w.where.slice(0, 50)} - ${w.reason}`).join('; ')}.` : '';
const waiverExample = w => {
  const candidate = found.fails.find(f => !f.hard && (f.ids || [f.check]).includes(w.check)) || found.fails.find(f => !f.hard);
  return JSON.stringify({check: candidate?.check || '<check id>', target: candidate?.where || '<where from FAIL>', reason: '<specific reason, 12+ characters>'});
};
const ignoredWaiver = w => `waiver ignored for ${w.check} "${w.target}": ${w.invalid}. Entry format: ${waiverExample(w)}`;
const badWaivers = () => W.waivers.filter(w => w.invalid).map(ignoredWaiver).join('\n');
const rule = `To waive matching FAILs, add {"check":"<id>","target":"<part of where>","reason":"<specific reason, 12+ characters>"} to ${slash(path.relative(base, waiverFile)) || waiverFile} (${MAX_WAIVERS} entries at most). Record the reason in your report. Fix kit-edited and checker-gaming in the page.`;
function printAll(head) {
  print(head);
  for (const f of open) print(`  FAIL ${idsOf(f).padEnd(16)} ${f.where.slice(0, 90)}${f.widths && f.widths.length ? `  [${f.widths.join(', ')}]` : ''}\n       ${directAdvice(f) ? f.msg : f.msg.slice(0, 220) + '\n       fix: ' + (f.fix || '').slice(0, 220)}`);
  for (const w of W.waived) print(`  WAIVED ${w.check} ${w.where.slice(0, 80)}: ${w.reason}`);
  for (const w of W.waivers.filter(x => x.invalid)) print(ignoredWaiver(w));
  if (found.warns.length) print(`  ${found.warns.length} WARN (not blocking), first: ${found.warns.slice(0, 5).map(x => `${x.check} ${x.where.slice(0, 40)}`).join('; ')}`);
  if (crashed) print(`  not checked: ${found.crashed.join('; ')}`);
  for (const ask of found.asks || []) print('  '+ask.line+(ask.hint ? ' '+ask.hint : ''));
}
function archiveRun(status) {
  const dir = path.join(gateDir,'runs');
  fs.mkdirSync(dir,{recursive:true});
  let time = Date.now();
  for (;;) {
    const at = new Date(time++).toISOString();
    const name = at.replace(/:/g,'-')+'-r'+(state.round || 0)+'.json';
    const snapshot = {at,status,round:state.round || 0,quick:QUICK,reused,page:relPage,fingerprint:PAGE_FP,
      checkFingerprint:FP,...found,open,waivers:W.waivers,waived:W.waived};
    try { fs.writeFileSync(path.join(dir,name),JSON.stringify(snapshot,null,2)+'\n',{flag:'wx'}); }
    catch (error) { if (error.code==='EEXIST') continue; throw error; }
    return 'gate/runs/'+name;
  }
}
const record = (status, extra = {}) => {
  state.latestRun = archiveRun(status);
  Object.assign(state, { status, fp: FP, page: relPage, found, open: open.map(({ hard, ...f }) => f), waived: W.waived, ignoredWaivers: W.waivers.filter(w => w.invalid).map(ignoredWaiver), warnCount: found.warns.length, ...extra });
  const entry = { at: new Date().toISOString(), mode: HOOK ? 'hook' : QUICK ? 'quick' : 'manual', ...(HOOK ? { host: HOOK } : {}), status, fails: n, round: state.round, reused, stopHookActive: !!input.stop_hook_active };
  state.history = [...(state.history || []), entry].slice(-20);
  if (HOOK && !T.done) T.entry = entry;
  try { save(); return true; } catch (e) { process.stderr.write('gate: could not write gate.json: ' + e.message + '\n'); return false; }
};

if (QUICK) {
  state.latestRun = archiveRun('quick');
  save();
  // a look between rounds: no round, never closes the build
  printAll(`gate (quick look at 1440 and 390): ${n} FAIL${crashed ? ', some checks did not run' : ''}`);
  if (!HOOK) { console.log(`GATE: QUICK ${n} (not a round; run without --quick to finish)`); process.exit(n ? 1 : 0); }
  allow([badWaivers(), 'a --quick run never blocks'].filter(Boolean).join('\n'));
}

if (n === 0 && !crashed) {
  // the page as it passed: a later run on a changed page checks it again (one more round)
  record('pass', { closedFp: PAGE_FP });
  try { fs.renameSync(markerFile, path.join(dot, 'build.done.json')); } catch { try { fs.copyFileSync(markerFile, path.join(dot, 'build.done.json')); fs.rmSync(markerFile, { force: true }); } catch { /* left armed */ } }
  if (HOOK) { const ignored = badWaivers(); allow(ignored || 'GATE: PASS', !ignored); }
  printAll('gate: no open FAIL');
  console.log('GATE: PASS'); process.exit(0);
}

// FAILs remain, or the checks could not all run and found none (ERROR): both count rounds alike. A run on a changed
// page (or changed waivers) is a round; a manual rerun of an unchanged one is not.
// Before the gate's first run by hand in this build, a hook stop is not a round (a question to the user mid-build must
// not spend one): it lists the FAILs and blocks, and the first run by hand counts that page's round. After a hook block,
// the next stop on the unchanged page is allowed once without a round (a question to the user: "just stop again");
// other stops on it block twice without a round (nothing was fixed), then each counts as one; a change starts again
const status = n ? 'fail' : 'error', what = found.crashed.join('; ');
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
    state.idleFree = true; record(status, n ? {} : { note: what }); allow('nothing changed since the last block; this stop is allowed once without a round (a question to the user)');
  } else if ((state.idle || 0) < IDLE) { state.idle = (state.idle || 0) + 1; idle = true; }
  else if (!early) state.round = (state.round || 0) + 1;
}
const k = state.round || 1, last = already || (state.round || 0) >= MAX;
const top = open.slice(0, TOP).map(f => '- ' + line(f)).join('\n') + (n > TOP ? `\n(${n - TOP} more in ${slash(path.relative(base, stateFile)) || stateFile}; crops in .taste-skill/gate/consistency)` : '');
const notChecked = crashed ? ` (not checked: ${what})` : '';

if (last && !idle) {
  const told = !!state.openTold;
  // the page as it closed: a later run on a changed page checks it again (one more round)
  if (!record('open', { openTold: true, closedFp: PAGE_FP, ...(n ? {} : { note: what }) })) { if (HOOK) allow('could not record the round; stop allowed'); }
  // a used-up build is closed like a passed one, so a later deal or a build one folder down is not tied to it
  try { fs.renameSync(markerFile, path.join(dot, 'build.done.json')); } catch { try { fs.copyFileSync(markerFile, path.join(dot, 'build.done.json')); fs.rmSync(markerFile, { force: true }); } catch { /* gate.json's status ends it */ } }
  if (HOOK) {
    if (told) allow('rounds used up, told before', true);
    block(n
      ? [`tasteskill gate: rounds used up (${MAX} of ${MAX}), ${n} FAIL${n > 1 ? 's' : ''} open${notChecked}:`, top, waivedText(), badWaivers(), 'Rounds used up: stop fixing. Put "GATE: OPEN" and these open FAILs in your report (with any waivers and their reasons), then finish.'].filter(Boolean).join('\n')
      : `tasteskill gate: rounds used up (${MAX} of ${MAX}), and the checks could not run (${what}), so the page was not fully checked. Stop fixing: put "GATE: ERROR (${what}; rounds used up)" and what was not checked in your report, then finish.`);
  }
  if (!n) {
    printAll('gate: rounds used up; no FAIL in what ran, but not everything ran');
    print('Stop fixing: put the GATE line and what was not checked in your report, then finish.');
    console.log(`GATE: ERROR (${what}; rounds used up)`); process.exit(2);
  }
  printAll(`gate: rounds used up; ${n} FAIL open${reused ? ' (page unchanged since the last run)' : ''}`);
  print('Stop fixing: put these open FAILs and the waivers in your report, then finish.');
  console.log(`GATE: OPEN ${n} (rounds used up)`); process.exit(1);
}

if (!n) {
  // no FAIL in what ran, but not everything ran: never a PASS. Fix what it names and run again, a round like a FAIL;
  // the hook blocks once for this page and then lets the session stop
  if (HOOK) state.blockKey = ROUND_KEY;
  if (!record('error', { note: what })) { if (HOOK) allow('could not record the run; stop allowed'); }
  if (HOOK) { if (state.errorTold === FP) allow('checks crashed (' + what + '); told once for this page, stop allowed'); state.errorTold = FP; block(errorReason(what, early ? 0 : k)); }
  printAll(`gate: no FAIL in what ran, but not everything ran (round ${k} of ${MAX})`);
  print(reused
    ? 'The checks crashed twice on this unchanged page, so they were not run a third time. Change what the line names and run the gate again; if it names nothing on the page (Chrome would not start, a fault in the gate), put the GATE line and what was not checked in your report, then finish.'
    : `Fix what the line names (a page or a file that does not load, a script that throws or hangs, a page with no <main>), then run the gate again (round ${k} of ${MAX}). If it names nothing on the page (Chrome would not start, a fault in the gate), put the GATE line and what was not checked in your report, then finish.`);
  console.log(`GATE: ERROR (${what})`); process.exit(2);
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
