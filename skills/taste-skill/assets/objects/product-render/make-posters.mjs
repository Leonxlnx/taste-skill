#!/usr/bin/env node
/*
  product-render/make-posters.mjs - checks a product spec and writes its posters and stills beside it.

    node assets/objects/product-render/make-posters.mjs <spec.json> [more specs] [--profile <chrome dir>] [--port 5905]
         [--variants three-quarter,side,detail-saddle,three-quarter+loaded] [--grounds light,dark] [--px 1100] [--legacy]
    node assets/objects/product-render/make-posters.mjs --check <spec.json>   (no browser: the spec, its views, scenes and shaders)

  First the spec is built in Node, with every view and scene it will make: unknown part types, props
  or materials, a part a view or a scene names that is not there, too many parts, and words in the
  shader a laptop's GPU rejects (glslProblems) stop it with exit 1. Then make-posters.html is opened
  in a headless Chrome (software rendering: --disable-gpu --use-angle=swiftshader, its own profile,
  closed by its own PID), served over http on 127.0.0.1 (--port, default 5905, and the 4 after it;
  never 3000), and what it prints is written beside the spec.

  The views (spec.make.variants, or --variants; "view+scene" for a scene): for each variant and ground
  (spec.make.grounds, default light) one render, from which it writes
    <poster>-<variant>.fallback-render[-dark].png         the view's poster (the live render's fallback)
    stills/<poster>-<variant>-<colour>[-dark].webp        a still per colourway (spec.colors), transparent,
    stills/<poster>-<variant>-<colour>[-dark]-half.webp   cropped to the product and its shadow, and at half size
    <poster>.stills.json                                  what was made and where the product sits in each still
  The colourways are the one render with its accent part lit again in each colour (as the poster is),
  so a colour costs no render. --legacy also writes the turntable's four posters (the old places:
  <poster>.fallback-render.png, -render-dark.png, .fallback.png, -dark.png). --variants takes a part of
  the list (one call each keeps a run short); the manifest is merged with the earlier run's.
  spec.supports (a list of view names) is the views the product draws well: make.variants and the page's views stay inside it, and a
  view dropped from it loses its entry in the manifest on the next run (delete its files with it).
  A spec without its posters shows nothing until WebGL draws: run this after every change to a spec.
  A CPU renders a big product slowly: one to four minutes a variant for 60-90 parts. Each variant is
  written as soon as it is made, so a run cut short by --timeout (minutes, default 30) keeps the ones done.
  --quiet leaves out the file lines.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from './build.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');              // assets/objects: ../_print-core resolves
const args = process.argv.slice(2);
const VALUED = ['--profile', '--port', '--variants', '--grounds', '--px', '--timeout'];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const specs = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUED.includes(args[i - 1])));
if (!specs.length) { console.error('usage: make-posters.mjs <spec.json> [...] [--profile dir] [--port 5905] [--variants a,b+scene] [--grounds light,dark] [--px 1100] [--legacy] [--check]'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const variantsOf = spec => String(typeof opt('variants') === 'string' ? opt('variants') : (spec.make?.variants || []).join(',')).split(',').map(s => s.trim()).filter(Boolean);

// 1. every spec builds, with every view and scene it will make, and its shaders hold no word a GPU rejects
let bad = 0;
for (const s of specs) {
  try {
    const spec = JSON.parse(fs.readFileSync(s, 'utf8')), base = pathToFileURL(path.resolve(s)).href;
    const obj = build(spec, { base });
    const p = obj.problems();
    if (p.length) { bad++; console.log(`${s}: the shader uses words a GPU rejects\n  ${p.join('\n  ')}`); }
    else console.log(`${s}: builds (${obj.spec.parts.length} parts)`);
    for (const v of variantsOf(spec)) {
      const [view, scene] = v.split('+');
      const o = build(spec, { base, view, scene: scene || null });
      const q = o.problems();
      if (q.length) { bad++; console.log(`  ${v}: the shader uses words a GPU rejects\n    ${q.join('\n    ')}`); }
      else console.log(`  ${v}: builds (${o.spec.parts.length} parts; framed ${o.fit.ex.map(x => (2 * x).toFixed(3)).join(' x ')} units)`);
    }
  } catch (e) { bad++; console.log(`${s}: ${e.message}`); }
  const rel = path.relative(root, path.resolve(s));
  if (rel.startsWith('..')) { bad++; console.log(`${s}: keep the spec under ${root} (the poster page loads it from there)`); }
}
if (bad || opt('check')) process.exit(bad ? 1 : 0);

// 2. the posters and stills, in a headless Chrome
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
let port = +opt('port', 5905);
for (let i = 0; ; i++) {
  if (port === 3000) port++;
  const ok = await new Promise(r => { server.once('error', () => r(false)); server.listen(port, '127.0.0.1', () => r(true)); });
  if (ok) break;
  if (i >= 4) { console.error('no free port'); process.exit(1); }
  port++;
}
function findChrome() {
  const local = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null;
  const c = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', local,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const f = c.find(p => p && fs.existsSync(p));
  if (!f) throw new Error('no Chrome found (set CHROME_PATH)');
  return f;
}
// default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'posters-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-posters-' + process.pid);
const profile = path.resolve(opt('profile', defaultProfile()));
fs.mkdirSync(profile, { recursive: true });
const portFile = path.join(profile, 'DevToolsActivePort');
try { fs.rmSync(portFile); } catch { /* none */ }
const child = spawn(findChrome(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=900,900', 'about:blank'], { stdio: 'ignore', windowsHide: true });
console.log(`chrome pid ${child.pid}, port ${port}`);
const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
process.on('SIGINT', () => { kill(); process.exit(130); });
process.on('SIGTERM', () => { kill(); process.exit(143); });
const guard = setTimeout(() => { console.error('make-posters: timed out'); kill(); process.exit(2); }, (+opt('timeout', 30) + 0.5) * 60 * 1000);
let code = 0;
try {
  let dp = null;
  for (let i = 0; i < 150 && !dp; i++) { await sleep(100); try { dp = parseInt(fs.readFileSync(portFile, 'utf8'), 10) || null; } catch { /* not yet */ } }
  if (!dp) throw new Error('Chrome did not start');
  const ver = await (await fetch(`http://127.0.0.1:${dp}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
  let id = 0; const pend = new Map();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }, sessionId); return r.result?.result?.value; };
  for (const s of specs) {
    const rel = path.relative(root, path.resolve(s)).split(path.sep).join('/');
    const spec = JSON.parse(fs.readFileSync(s, 'utf8'));
    // one page load per variant, its files written as soon as it is made (a run cut short keeps what it made)
    const items = variantsOf(spec), batches = items.length ? items.map(v => [v]) : [[]];
    const t0 = Date.now();
    for (const [bi, batch] of batches.entries()) {
      const qs = new URLSearchParams({ spec: '../' + rel });
      if (opt('render-only')) qs.set('only', 'render');
      if (opt('legacy') && bi === 0) qs.set('legacy', '1');
      qs.set('variants', batch.join(','));
      for (const k of ['grounds', 'px']) if (typeof opt(k) === 'string') qs.set(k, opt(k));
      await send('Page.navigate', { url: `http://127.0.0.1:${port}/product-render/make-posters.html?${qs}` }, sessionId);
      let state = null;
      while (Date.now() - t0 < +opt('timeout', 30) * 60 * 1000) { await sleep(500); state = await ev('document.documentElement.dataset.ready || ""'); if (state) break; }
      if (state !== '1') { code = 1; console.log(`${s} ${batch.join(',') || 'legacy'}: nothing made (${state ? await ev('window.__posterError') : 'timed out'})`); break; }
      const dir = path.dirname(path.resolve(s));
      for (const name of (await ev('Object.keys(window.__files)')) || []) {
        const data = await ev(`window.__files[${JSON.stringify(name)}]`);
        const file = path.join(dir, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
        if (!opt('quiet')) console.log(`  wrote ${name} (${Math.round(fs.statSync(file).size / 1024)} kB)`);
      }
      // the manifest: what was made, merged with the earlier runs' (each variant keeps the size it was made at: a
      // close-up at --px 800 and the hero at 1100 live in one manifest; the page reads each still's own w, h and box)
      const made = await ev('window.__manifest');
      if (made && Object.keys(made.variants).length) {
        const mf = path.join(dir, `${spec.poster || spec.id}.stills.json`);
        let prev = null; try { prev = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch { /* none */ }
        // an earlier run's variants stay, unless the spec no longer supports their view (spec.supports: a view dropped as it read wrong)
        const keep = Object.fromEntries(Object.entries(prev && prev.variants ? prev.variants : {}).filter(([, v]) => !spec.supports || spec.supports.includes(v.view) || /^detail[:-]/.test(v.view)));
        for (const v of Object.values(made.variants)) v.px = made.px;
        const merged = { ...made, variants: { ...keep, ...made.variants } };
        fs.writeFileSync(mf, JSON.stringify(merged, null, 1) + '\n');
        console.log(`  wrote ${path.relative(dir, mf)} (${Object.keys(merged.variants).length} variants)`);
      }
      for (const r of (await ev('window.__report')) || []) console.log(`  ${r.key} (${r.ground}): ${r.frame.join('x')} frame, product measured/predicted ${r.measuredVsPredicted.join(' / ')}, off centre ${r.centrePx.join(', ')} px, ${Math.round(r.ms / 1000)} s`);
    }
    console.log(`${s}: done in ${Math.round((Date.now() - t0) / 1000)} s`);
  }
} catch (e) { code = 1; console.error(e.message); }
clearTimeout(guard);
kill();
server.close();
process.exit(code);
