#!/usr/bin/env node
/*
  taste-skill layout check - runs assets/layout/layout-check.js on a page in one headless Chrome (WebGL on
  the CPU), at each width, and prints every finding. Closes Chrome by its own PID.

    node <skill>/assets/layout/check.mjs --url <url or file> --profile <own chrome dir>
         [--sizes 1440x900,1024x768,820x1180,768x1024,390x844] [--shots <dir>] [--json]

  --shots writes, per size, the first screen (first-<w>.png) and every section framed as the check
  frames it (screen-<w>-<n>.png): the shot a reviewer takes of one section, to look at.
  Then, once per size, it lengthens the hero's h1 to its type's longest headline (heroes.json
  h1.maxChars, with words from the lead) and checks again: the hero must still be one screen
  (hero-maxchars) and the h1 within its lines at 1440 and 390 (hero-lines). --no-stress skips it.
  A file (or its folder, for index.html) is served from its folder over http on 127.0.0.1 (5770-5779).
  Exit code 1 when there is a finding.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
// default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'layout-check-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-layout-check-' + process.pid);
const target = opt('url'), profileArg = (p => (p && p !== true ? p : defaultProfile()))(opt('profile')), shots = opt('shots');
const sizes = String(opt('sizes', '1440x900,1024x768,820x1180,768x1024,390x844')).split(',').map(s => s.split('x').map(Number));
if (!target || target === true) { console.error('usage: check.mjs --url <url or file> [--profile <dir>] [--sizes 1440x900,1024x768,820x1180,768x1024,390x844] [--shots dir] [--json]'); process.exit(2); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => p && fs.existsSync(p));
if (!chrome) { console.error('no Chrome found (set CHROME_PATH)'); process.exit(2); }
const src = fs.readFileSync(path.join(here, 'layout-check.js'), 'utf8');
// a page file is served from its folder over http on 127.0.0.1 (5770-5779), never opened from file://
let url = target, server = null;
if (!/^https?:\/\//i.test(target)) {
  let file = path.resolve(/^file:/i.test(target) ? fileURLToPath(target) : target);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { console.error(`check: no page at ${file}`); process.exit(2); }
  // serve from high enough that the page's ../ references resolve
  const ups = Math.max(0, ...[...fs.readFileSync(file, 'utf8').matchAll(/(?:(?:src|href)\s*=\s*|\bfrom\s*|\bimport\s*\(?\s*|url\(\s*)["']?((?:\.\.\/)+)/g)].map(m => m[1].length / 3));
  let root = path.dirname(file); for (let i = 0; i < ups; i++) root = path.dirname(root);
  const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.glb': 'model/gltf-binary', '.txt': 'text/plain', '.ico': 'image/x-icon' };
  server = http.createServer((req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!(f === root || f.startsWith(root + path.sep)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(fs.readFileSync(f));
    } catch { res.writeHead(404); res.end('not found'); }
  });
  let port = 0;
  for (let p = 5770; p <= 5779 && !port; p++) port = await new Promise(r => { server.once('error', () => r(0)); server.listen(p, '127.0.0.1', () => r(p)); });
  if (!port) { console.error('check: no free port in 5770-5779'); process.exit(2); }
  url = `http://127.0.0.1:${port}/${path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/')}`;
}
const { heroes } = JSON.parse(fs.readFileSync(path.join(here, 'heroes.json'), 'utf8'));
// the stress: the page's own h1 markup (from its source, before layout.js split it) with words from the
// lead added to its last plain text until it holds maxChars characters; the letters moment is left off
const STRESS = String.raw`(async (maxChars) => {
  const h1 = document.querySelector('main > section h1'); if (!h1) return null;
  const doc = new DOMParser().parseFromString(await (await fetch(location.href)).text(), 'text/html');
  const src = doc.querySelector('main > section h1'); if (!src) return null;
  const words = (document.querySelector('main > section .hero__lead')?.textContent || 'what the company makes and sells every day').replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(w => w.length > 2).map(w => w.toLowerCase());
  const len = () => src.textContent.replace(/\s+/g, ' ').trim().length;
  const tw = doc.createTreeWalker(src, NodeFilter.SHOW_TEXT); let last = null;
  for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.textContent.trim() && !n.parentElement.closest('.ly-word, .ly-pic, .ly-mark')) last = n;
  if (!last || !words.length) return null;
  for (let i = 0; len() < maxChars && i < 80; i++) {
    const w = words[i % words.length], room = maxChars - len() - 1;
    if (room < 2) break;
    last.textContent = last.textContent.replace(/\s*$/, '') + ' ' + w.slice(0, room) + (/\s$/.test(last.textContent) ? ' ' : '');
  }
  h1.removeAttribute('data-ly-letters'); h1.classList.remove('ly-locked', 'ly-letters');
  h1.innerHTML = src.innerHTML;
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 300)));
  return { chars: len(), text: h1.textContent.replace(/\s+/g, ' ').trim() };
})`;

const profile = path.resolve(profileArg);
fs.mkdirSync(profile, { recursive: true });
const portFile = path.join(profile, 'DevToolsActivePort');
try { fs.rmSync(portFile); } catch { /* none */ }
const [w0, h0] = sizes[0];
const child = spawn(chrome, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--hide-scrollbars', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--window-size=${w0},${h0}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
const guard = setTimeout(() => { console.error('check: timed out'); kill(); process.exit(2); }, 240000);

let failed = false;
const report = [];
try {
  let port = null;
  for (let i = 0; i < 150 && !port; i++) { await sleep(100); try { port = parseInt(fs.readFileSync(portFile, 'utf8'), 10) || null; } catch { /* not yet */ } }
  if (!port) throw new Error('Chrome did not start');
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
  let id = 0; const pend = new Map(), subs = [];
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } else subs.forEach(f => f(m)); });
  const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = async (m, p) => { const r = await send(m, p, sessionId); if (r.error) throw new Error(`${m}: ${r.error.message}`); return r.result; };
  const ev = async x => { const r = await S('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const errors = [];
  subs.push(m => { if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]); });
  await S('Page.enable'); await S('Runtime.enable');
  const snap = async file => { const { data } = await S('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(file, Buffer.from(data, 'base64')); };
  for (const [W, H] of sizes) {
    await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });
    const loaded = new Promise(r => subs.push(m => { if (m.method === 'Page.loadEventFired') r(); }));
    await S('Page.navigate', { url });
    await Promise.race([loaded, sleep(20000)]);
    await ev(`new Promise(r => { const t = performance.now(); (function w() { if (document.documentElement.dataset.ready || performance.now() - t > 5000) r(); else setTimeout(w, 50); })(); })`);
    await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
    await sleep(900);
    const res = await ev(src + '\n;window.lyCheck()');
    res.size = `${W}x${H}`;
    res.overflowX = await ev('document.documentElement.scrollWidth > document.documentElement.clientWidth');
    if (res.overflowX) res.findings.push({ rule: 'overflow-x', where: 'page', detail: 'the page scrolls sideways' });
    report.push(res);
    if (shots && shots !== true) {
      fs.mkdirSync(shots, { recursive: true });
      await ev('scrollTo(0, 0)'); await sleep(500);
      await snap(path.join(shots, `first-${W}.png`));
      const frames = res.sections.map(q => q.frame);   // the views the check judged (layout-check.js)
      for (let k = 1; k < frames.length; k++) { await ev(`scrollTo(0, ${frames[k]})`); await sleep(700); await snap(path.join(shots, `screen-${W}-${k}.png`)); }
      await ev('scrollTo(0, 0)');
    }
    if (!opt('no-stress')) {
      const id = await ev(`(document.querySelector('main > section')?.className.match(/hero--([a-z]+)/) || [])[1] || ''`);
      const h = heroes.find(x => x.id === id);
      if (h) {
        const st = await ev(`${STRESS}(${h.h1.maxChars})`);
        if (st) {
          const again = await ev(src + '\n;window.lyCheck()');
          const lines = again.hero?.h1?.lines ?? 0, allowed = W >= 1400 ? h.h1.lines[0] : W <= 420 ? h.h1.lines[1] : null;
          res.stress = { hero: id, maxChars: h.h1.maxChars, chars: st.chars, lines, height: again.hero?.height };
          for (const f of again.findings.filter(f => f.rule === 'hero-fold')) res.findings.push({ rule: 'hero-maxchars', where: f.where, detail: `with a ${st.chars}-character h1 (heroes.json maxChars): ${f.detail}` });
          if (allowed && lines > allowed) res.findings.push({ rule: 'hero-lines', where: 'h1', detail: `a ${st.chars}-character h1 takes ${lines} lines; heroes.json allows ${allowed} at ${W}: lower maxChars` });
          if (await ev('document.documentElement.scrollWidth > document.documentElement.clientWidth')) res.findings.push({ rule: 'hero-maxchars', where: 'page', detail: `with a ${st.chars}-character h1 the page scrolls sideways` });
        }
      }
    }
    if (errors.length) { res.errors = [...errors]; errors.length = 0; }
  }
  ws.close();
} catch (e) {
  console.error('check:', e.message);
  failed = true;
} finally {
  clearTimeout(guard);
  kill();
  server?.close();
}

if (opt('json')) console.log(JSON.stringify(report, null, 1));
else for (const r of report) {
  console.log(`\n${r.size}  lines x ${r.L} and ${r.R}, nav ${r.nav}px, one screen ${r.screen}px`);
  if (r.hero) { const h = r.hero, b = v => v ? `${v.w}x${v.h} at ${v.x},${v.y}` : '-';
    console.log(`  hero ${h.height} tall; h1 ${h.h1 ? `${h.h1.size}px/${h.h1.leading}, ${h.h1.lines} lines, ${b(h.h1)}` : '-'}; lead ${h.lead ? `${h.lead.size}/${h.lead.lineHeight}, ${h.lead.lines} lines, ${h.lead.w} wide` : '-'}; buttons ${h.buttons ? `${h.buttons.n} x ${h.buttons.h}` : '-'}; visual ${b(h.visual)}`); }
  if (r.stress) console.log(`  stress: ${r.stress.hero} h1 at ${r.stress.chars} of ${r.stress.maxChars} characters takes ${r.stress.lines} lines, hero ${r.stress.height} tall`);
  for (const s of r.sections) console.log(`  section ${s.where.slice(0, 60).padEnd(60)} y ${String(s.top).padStart(5)}  h ${String(s.height).padStart(5)}  content ${s.content}`);
  if (!r.findings.length) console.log('  no findings');
  for (const f of r.findings) console.log(`  ${f.rule.padEnd(16)} ${f.where.slice(0, 70)}: ${f.detail}`);
  if (r.errors) for (const e of r.errors) console.log(`  page error: ${e}`);
}
const n = report.reduce((a, r) => a + r.findings.length, 0);
process.exit(failed ? 2 : n ? 1 : 0);
