#!/usr/bin/env node
/*
  taste-skill backgrounds check.mjs - measures the contrast of the page ink (7:1) and the muted ink (4.5:1)
  on every ground, on every palette, from real pixels.

    node assets/backgrounds/check.mjs --profile <profile-dir> [--palettes id,id] [--grounds mist,halo]
                                      [--lit sand,painting] [--json out.json] [--save dir] [--min-ink 7] [--min-muted 4.5] [--port 5967]

  It serves the skill folder over http on 127.0.0.1 (5965-5969) and opens check.html in ONE headless Chrome (WebGL on the CPU flags, no window; closed by its own PID),
  sets each palette's --p-* tokens and the lit ground, screenshots the grounds' boxes, and reads the ink and
  muted colours the ground really resolves to. Each ground's text zone (index.json, fractions of its box)
  is cut into 8px blocks; the worst block's ratio is the result. Exit code 1 when a ground fails.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
// default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'bg-check-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-bg-check-' + process.pid);
const profile = (p => (p && p !== true ? p : defaultProfile()))(opt('profile'));
const MIN_INK = +opt('min-ink', 7), MIN_MUTED = +opt('min-muted', 4.5), SCALE = 0.5, BLOCK = 4;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------------------------------------------------------- data */
const meta = JSON.parse(fs.readFileSync(path.join(HERE, 'index.json'), 'utf8')).grounds;
const zones = {};                                    // box id -> text zone
for (const g of meta) { zones[g.id] = g.textZone; if (g.variants) for (const v of g.variants) zones[v.id] = v.textZone || g.textZone; if (g.checkFrames) for (const f of g.checkFrames) zones[f] = g.textZone; }
const boxIds = Object.keys(zones);
const wantGrounds = opt('grounds') ? String(opt('grounds')).split(',') : null;
const lits = opt('lit') ? String(opt('lit')).split(',') : ['sand', 'painting'];
const tokensOf = id => {
  const css = execFileSync('node', [path.join(SKILL, 'scripts', 'start.mjs'), 'css', '--page', 'software', '--palette', id, '--type', 'hanken', '--radius', 'soft', '--history', path.join(path.resolve(profile), 'start-history.json')], { encoding: 'utf8' });   // the face does not matter here, only the --p-* colours; the history goes into the profile folder, not the page's .taste-skill
  const t = {};
  for (const m of css.matchAll(/--p-([a-z-]+):\s*(#[0-9a-fA-F]{3,8})/g)) t[m[1]] = m[2];
  return t;
};
const allIds = JSON.parse(fs.readFileSync(path.join(SKILL, 'library', 'palettes.json'), 'utf8')).map(p => p.id);
const palIds = opt('palettes') ? String(opt('palettes')).split(',') : allIds;

/* ---------------------------------------------------------------- PNG (8-bit RGB/RGBA) */
function decodePNG(buf) {
  let pos = 8, w = 0, h = 0, type = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), name = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (name === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; } else if (name === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(w * h * 3);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 3; px[o] = line[x * bpp]; px[o + 1] = line[x * bpp + 1]; px[o + 2] = line[x * bpp + 2]; }
    prev = line;
  }
  return { w, h, px };
}
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* ---------------------------------------------------------------- Chrome */
const findChrome = () => ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => p && fs.existsSync(p));
const prof = path.resolve(profile); fs.mkdirSync(prof, { recursive: true });
const portFile = path.join(prof, 'DevToolsActivePort'); try { fs.rmSync(portFile); } catch { /* none */ }
const child = spawn(findChrome(), ['--headless=new', `--user-data-dir=${prof}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--hide-scrollbars', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=800,900', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
// the page is served over http on 127.0.0.1 (5965-5969, --port), never opened from file://
const PORT = +opt('port', 5967);
if (PORT < 5965 || PORT > 5969) { console.error('check: --port must be 5965-5969'); process.exit(1); }
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const srv = http.createServer((req, res) => {
  const file = path.join(SKILL, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(SKILL) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve, reject) => { srv.on('error', reject); srv.listen(PORT, '127.0.0.1', resolve); });
const guard = setTimeout(() => { console.error('check: timed out'); kill(); process.exit(2); }, 25 * 60 * 1000);

const results = [];
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
  await S('Page.enable'); await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: 800, height: 900, deviceScaleFactor: 1, mobile: false });
  const loaded = new Promise(r => subs.push(m => { if (m.method === 'Page.loadEventFired') r(); }));
  await S('Page.navigate', { url: `http://127.0.0.1:${PORT}/assets/backgrounds/check.html` });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(300);

  for (const pid of palIds) {
    const tk = tokensOf(pid);
    for (const lit of lits) {
      const info = await ev(`(async () => {
        const root = document.documentElement, tk = ${JSON.stringify(tk)};
        for (const [k, v] of Object.entries(tk)) root.style.setProperty('--p-' + k, v);
        root.dataset.ground = ${JSON.stringify(lit)};
        window.tasteBackgrounds.detect();
        const only = ${JSON.stringify(wantGrounds)};
        for (const el of document.querySelectorAll('.box')) el.style.display = !only || only.includes(el.dataset.g) || only.includes(el.dataset.g.split('-')[0]) ? '' : 'none';
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const rgb = c => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); return [...cv.getImageData(0, 0, 1, 1).data.slice(0, 3)]; };
        const out = { mode: root.dataset.mode, tint: root.dataset.tint || '', boxes: {} };
        for (const el of document.querySelectorAll('.box')) {
          const r = el.getBoundingClientRect();
          out.boxes[el.dataset.g] = { top: r.top + scrollY, left: r.left + scrollX, h: r.height, w: r.width, rad: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, ink: rgb(getComputedStyle(el.querySelector('.pi')).color), muted: rgb(getComputedStyle(el.querySelector('.pm')).color) };
        }
        out.k = getComputedStyle(root).getPropertyValue('--g-k').trim(); out.kd = getComputedStyle(root).getPropertyValue('--g-kd').trim();
        out.height = document.documentElement.scrollHeight;
        return out;
      })()`);
      await sleep(250);
      const { data } = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 800, height: info.height, scale: SCALE } });
      if (opt('save') && opt('save') !== true) { fs.mkdirSync(opt('save'), { recursive: true }); fs.writeFileSync(path.join(String(opt('save')), `${pid}-${lit}.png`), Buffer.from(data, 'base64')); }
      const img = decodePNG(Buffer.from(data, 'base64'));
      for (const bid of boxIds) {
        if (wantGrounds && !wantGrounds.includes(bid) && !wantGrounds.includes(bid.split('-')[0])) continue;
        const b = info.boxes[bid]; if (!b || !b.h) continue;
        const [zx0, zy0, zx1, zy1] = zones[bid];
        const ins = b.rad ? Math.ceil(b.rad * 0.3) + 2 : 0;   // a rounded box (bg-inset): the four corners outside the curve are the page, not the ground
        const x0 = Math.floor((b.left + b.w * zx0 + (zx0 === 0 ? ins : 0)) * SCALE), x1 = Math.floor((b.left + b.w * zx1 - (zx1 === 1 ? ins : 0)) * SCALE), y0 = Math.floor((b.top + b.h * zy0 + (zy0 === 0 ? ins : 0)) * SCALE), y1 = Math.floor((b.top + b.h * zy1 - (zy1 === 1 ? ins : 0)) * SCALE);
        const Li = lum(...b.ink), Lm = lum(...b.muted);
        let worstInk = 99, worstMuted = 99;
        for (let by = y0; by + BLOCK <= y1; by += BLOCK) for (let bx = x0; bx + BLOCK <= x1; bx += BLOCK) {
          let r = 0, g = 0, bl = 0;
          for (let y = by; y < by + BLOCK; y++) for (let x = bx; x < bx + BLOCK; x++) { const o = (y * img.w + x) * 3; r += img.px[o]; g += img.px[o + 1]; bl += img.px[o + 2]; }
          const n = BLOCK * BLOCK, Lb = lum(r / n, g / n, bl / n);
          worstInk = Math.min(worstInk, ratio(Li, Lb)); worstMuted = Math.min(worstMuted, ratio(Lm, Lb));
        }
        results.push({ inkRgb: b.ink.join(','), box: [b.left, b.top, b.w, b.h].map(Math.round).join(','), palette: pid, lit, ground: bid, mode: info.mode, tint: info.tint, k: info.k, kd: info.kd, ink: +worstInk.toFixed(2), muted: +worstMuted.toFixed(2), pass: worstInk >= MIN_INK && worstMuted >= MIN_MUTED });
      }
    }
    process.stderr.write(`${pid} `);
  }
  try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch { /* closing */ }
} catch (e) {
  console.error('check:', e.message); process.exitCode = 1;
} finally {
  clearTimeout(guard); await sleep(300); kill(); srv.close();
}

/* ---------------------------------------------------------------- report */
const fails = results.filter(r => !r.pass);
const by = {};
for (const r of results) { const k = r.ground; (by[k] ||= { n: 0, fail: 0, minInk: 99, minMuted: 99, bad: new Set() }); by[k].n++; by[k].minInk = Math.min(by[k].minInk, r.ink); by[k].minMuted = Math.min(by[k].minMuted, r.muted); if (!r.pass) { by[k].fail++; by[k].bad.add(r.palette); } }
console.log('\n');
console.log('ground'.padEnd(12), 'runs'.padStart(5), 'fail'.padStart(5), 'min ink'.padStart(8), 'min muted'.padStart(10), ' failing palettes');
for (const [k, v] of Object.entries(by)) console.log(k.padEnd(12), String(v.n).padStart(5), String(v.fail).padStart(5), v.minInk.toFixed(2).padStart(8), v.minMuted.toFixed(2).padStart(10), ' ', [...v.bad].slice(0, 12).join(', ') + (v.bad.size > 12 ? ` +${v.bad.size - 12}` : ''));
const jf = opt('json'); if (jf && jf !== true) fs.writeFileSync(jf, JSON.stringify(results, null, 1));
console.log(`\n${results.length - fails.length}/${results.length} passed (ink >= ${MIN_INK}, muted >= ${MIN_MUTED})`);
if (fails.length) process.exitCode = 1;
