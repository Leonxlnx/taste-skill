#!/usr/bin/env node
/*
  product-render/make-posters.mjs - checks a product spec and writes its posters beside it.

    node assets/objects/product-render/make-posters.mjs <spec.json> [more specs] [--profile <chrome dir>] [--port 5905] [--render-only]
    node assets/objects/product-render/make-posters.mjs --check <spec.json>   (no browser: the spec and its shader only)

  First the spec is built in Node: unknown part types or materials, too many parts, and words in the
  shader a laptop's GPU rejects (glslProblems) stop it with exit 1. Then make-posters.html is opened
  in a headless Chrome (software rendering: --disable-gpu --use-angle=swiftshader, its own profile,
  closed by its own PID), served over http on 127.0.0.1 (--port, default 5905, and the 4 after it;
  never 3000), and the posters it prints are written beside the spec:
    <poster>.fallback-render.png  <poster>.fallback-render-dark.png  (the render: what a page shows
    <poster>.fallback.png         <poster>.fallback-dark.png          until WebGL draws, and for good when it cannot)
  A spec without its posters shows nothing until WebGL draws and nothing at all without it: run this
  after every change to a spec. A CPU renders a big product slowly: allow a few minutes.
*/
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from './build.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');              // assets/objects: ../_print-core resolves
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const specs = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--profile', '--port'].includes(args[i - 1])));
if (!specs.length) { console.error('usage: make-posters.mjs <spec.json> [...] [--profile dir] [--port 5905] [--render-only] [--check]'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 1. every spec builds, and its shader holds no word a GPU rejects
let bad = 0;
for (const s of specs) {
  try {
    const obj = build(JSON.parse(fs.readFileSync(s, 'utf8')), { base: pathToFileURL(path.resolve(s)).href });
    const p = obj.problems();
    if (p.length) { bad++; console.log(`${s}: the shader uses words a GPU rejects\n  ${p.join('\n  ')}`); }
    else console.log(`${s}: builds (${obj.spec.parts.length} parts)`);
  } catch (e) { bad++; console.log(`${s}: ${e.message}`); }
  const rel = path.relative(root, path.resolve(s));
  if (rel.startsWith('..')) { bad++; console.log(`${s}: keep the spec under ${root} (the poster page loads it from there)`); }
}
if (bad || opt('check')) process.exit(bad ? 1 : 0);

// 2. the posters, in a headless Chrome
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };
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
const profile = path.resolve(opt('profile', path.join(process.env.TEMP || '/tmp', 'product-render-posters')));
fs.mkdirSync(profile, { recursive: true });
const portFile = path.join(profile, 'DevToolsActivePort');
try { fs.rmSync(portFile); } catch { /* none */ }
const child = spawn(findChrome(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=900,900', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
const guard = setTimeout(() => { console.error('make-posters: timed out'); kill(); process.exit(2); }, 20 * 60 * 1000);
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
    const url = `http://127.0.0.1:${port}/product-render/make-posters.html?spec=../${rel}${opt('render-only') ? '&only=render' : ''}`;
    await send('Page.navigate', { url }, sessionId);
    const t0 = Date.now();
    let state = null;
    while (Date.now() - t0 < 15 * 60 * 1000) { await sleep(500); state = await ev('document.documentElement.dataset.ready || ""'); if (state) break; }
    if (state !== '1') { code = 1; console.log(`${s}: no posters (${state ? await ev('window.__posterError') : 'timed out'})`); continue; }
    const plates = await ev('window.__plates');
    for (const [name, data] of Object.entries(plates)) {
      const file = path.join(path.dirname(path.resolve(s)), name);
      fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
      console.log(`  wrote ${file}`);
    }
    console.log(`${s}: posters in ${Math.round((Date.now() - t0) / 1000)} s`);
  }
} catch (e) { code = 1; console.error(e.message); }
clearTimeout(guard);
kill();
server.close();
process.exit(code);
