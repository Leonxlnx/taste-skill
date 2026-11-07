#!/usr/bin/env node
/*
  taste-skill perf.mjs - a performance check for a built page. Node 22 or later (global WebSocket and fetch), no packages.

    node <skill>/scripts/perf.mjs <page.html | folder | http(s) url> [--profile <own chrome dir>] [--json <file to write>] [--w 1440 --w 390] [--runs 3] [--port 5740] [--root <dir>]

  A file or folder is served by a small local http server (ports 5740-5749, or the --port named and the 9 after it, text gzipped like a static host),
  because module scripts do not load from file://. --root serves from that folder instead (a built site whose links start at its root, /style.css). Then ONE headless Chrome on the CPU (--headless=new
  --disable-gpu --use-angle=swiftshader --enable-unsafe-swiftshader) loads the page at 1440x900 and at 390x844 over the
  Chrome DevTools Protocol, waits until the effects near the viewport are mounted, scrolls to the bottom one screen at a
  time, and measures. Chrome is closed by its own PID. No fps measurement, no soak: it only counts.

  Timing (long tasks, blocking time, FCP, LCP, layout shift) is the MEDIAN of --runs loads (default 3), with the spread
  printed, because one CPU sample is noise. Host CPU load is sampled before and after; a busy host (over 50%) is reported
  and caps the timing verdicts at WARN. --json writes the result to the file named and nothing else.

  Reports PASS / WARN / FAIL per check against the budget in references/perf.md:
    bytes by type + total, requests, fonts (families, files), JS parsed, images (size attrs, lazy below the fold,
    oversized or upscaled; <img>, CSS background and SVG <image>), WebGL contexts at load / after the scroll / peak,
    long tasks, FCP, LCP, layout shift, effect / object / component modules loaded but never mounted, broken requests.
  FCP and LCP are CPU-rendered: compare pages with each other, never with field data. With WebGL on, SwiftShader runs
  the shaders on the CPU: the timing verdicts come from loads where every WebGL piece shows its still fallback, which
  is a proxy (it does not measure shader compile or link on a real GPU).
  --profile: the Chrome profile, a folder of its own in the OS temp folder or the project's .taste-skill folder, never
  outside the project; a relative one that leads out of the current folder (../prof) is replaced, with a warning, by
  .taste-skill/chrome-perf.
  Exit code 1 when any check FAILs, 2 when the run timed out (partial results are printed).
*/
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const pos = [], widths = [];
let profileArg = null, jsonOut = null, rootArg = null, RUNS = 3, PORT0 = 5740;
const die = m => { console.error('perf: ' + m); process.exit(1); };
const val = i => { const v = args[i + 1]; if (v == null || v.startsWith('--')) die(args[i] + ' needs a value'); return v; };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--profile') profileArg = val(i++);
  else if (args[i] === '--json') jsonOut = val(i++);
  else if (args[i] === '--root') rootArg = path.resolve(val(i++));
  else if (args[i] === '--w') { const w = +val(i++); if (!(w >= 200 && w <= 4000)) die('--w needs a width in px'); widths.push(w); }
  else if (args[i] === '--port') { PORT0 = parseInt(val(i++), 10); if (!(PORT0 >= 1024 && PORT0 <= 65500)) die('--port needs a port from 1024 to 65500'); }
  else if (args[i] === '--runs') RUNS = Math.max(1, Math.min(9, parseInt(val(i++), 10) || 3));
  else if (args[i].startsWith('--')) die('unknown option ' + args[i]);
  else pos.push(args[i]);
}
if (!pos.length) die('usage: perf.mjs <page.html | folder | url> [--profile <dir in the OS temp folder or .taste-skill>] [--json file] [--w 1440 --w 390] [--runs 3] [--port 5740] [--root <dir>]');
if (typeof WebSocket === 'undefined' || typeof fetch === 'undefined') die('Node 22 or later is needed (global WebSocket and fetch)');
if (!widths.length) widths.push(1440, 390);
const target = pos[0];
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------------------------------------------------------- budget */
// [warn above, fail above]; lower is better. Sizes are KiB (1024 bytes).
const B = {
  totalKB: [1500, 3000], imagesKB: [1200, 2400], oneImageKB: [350, 700], jsKB: [450, 900], cssKB: [120, 250],
  fontKB: [160, 320], fontFamilies: [2, 3], fontFiles: [4, 6], requests: [60, 110],
  glPeak: [4, 4], glCreated: [12, 24], blockingMs: [1500, 4000], longTasks: [8, 20],
  fcp: [2500, 4500], lcp: [4500, 8000], cls: [0.1, 0.25], unmounted: [0, 2],
};
const rate = (v, [w, f]) => (v > f ? 'FAIL' : v > w ? 'WARN' : 'PASS');
const count = n => (n === 0 ? 'PASS' : n > 3 ? 'FAIL' : 'WARN');   // 1 to 3 WARN, 4 or more FAIL
const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
const spread = (a, f = Math.round) => (a.length > 1 ? `${f(Math.min(...a))}..${f(Math.max(...a))}` : '');

/* ---------------------------------------------------------------- host load */
const cpuSnap = () => os.cpus().reduce((a, c) => { const t = c.times; a.idle += t.idle; a.all += t.user + t.nice + t.sys + t.idle + t.irq; return a; }, { idle: 0, all: 0 });
async function hostLoad(ms = 1200) {
  const a = cpuSnap(); await sleep(ms); const b = cpuSnap();
  const all = b.all - a.all; return all > 0 ? Math.round((1 - (b.idle - a.idle) / all) * 100) : 0;
}

/* ---------------------------------------------------------------- chrome + server */
function findChrome() {
  const c = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const f = c.find(p => p && fs.existsSync(p));
  if (!f) throw new Error('no Chrome found (set CHROME_PATH)');
  return f;
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain', '.ico': 'image/x-icon' };
const GZ = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt']);

async function serve(root) {
  const cache = new Map();
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(file).toLowerCase();
    const h = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
    let body = fs.readFileSync(file);
    if (GZ.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      if (!cache.has(file)) cache.set(file, zlib.gzipSync(body, { level: 6 }));
      body = cache.get(file); h['Content-Encoding'] = 'gzip';
    }
    res.writeHead(200, h); res.end(body);
  });
  for (let port = PORT0; port <= PORT0 + 9; port++) {
    const ok = await new Promise(r => { srv.once('error', () => r(false)); srv.listen(port, '127.0.0.1', () => r(true)); });
    if (ok) return { srv, port };
  }
  throw new Error(`no free port in ${PORT0}-${PORT0 + 9}`);
}

/* ---------------------------------------------------------------- in-page probes (run before any page script) */
const PROBE = `(() => {
  const P = window.__perf = { lcp: 0, fcp: 0, cls: 0, tasks: [], gl: [], glPeak: 0, glCreated: 0, ever: [], canvases: 0 };
  new MutationObserver(l => l.forEach(r => { const t = r.target; if (!P.ever.includes(t)) P.ever.push(t); }))
    .observe(document, { attributes: true, subtree: true, attributeFilter: ['data-fx-mounted', 'data-fx-fallback'] });
  const obs = (type, fn) => { try { new PerformanceObserver(l => l.getEntries().forEach(fn)).observe({ type, buffered: true }); } catch (e) {} };
  obs('paint', e => { if (e.name === 'first-contentful-paint') P.fcp = e.startTime; });
  obs('largest-contentful-paint', e => { P.lcp = e.startTime; P.lcpEl = e.element ? (e.element.tagName.toLowerCase() + (typeof e.element.className === 'string' && e.element.className ? '.' + e.element.className.split(' ')[0] : '')) : ''; });
  obs('layout-shift', e => { if (!e.hadRecentInput) P.cls += e.value; });
  obs('longtask', e => P.tasks.push([Math.round(e.startTime), Math.round(e.duration)]));
  const live = () => P.gl.filter(g => { try { return g.c.isConnected && !g.x.isContextLost(); } catch (e) { return false; } }).length;
  P.live = live;
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (type !== 'webgl' && type !== 'webgl2' && type !== 'experimental-webgl') { P.canvases++; return orig.call(this, type, ...rest); }
    if (window.__NOGL) return null;
    const x = orig.call(this, type, ...rest);
    if (x && !P.gl.some(g => g.x === x)) { P.gl.push({ c: this, x }); P.glCreated++; P.glPeak = Math.max(P.glPeak, live()); setTimeout(() => { P.glPeak = Math.max(P.glPeak, live()); }, 0); }
    return x;
  };
  setInterval(() => { P.glPeak = Math.max(P.glPeak, live()); }, 200);
})();`;

const SNAP = `(() => {
  const P = window.__perf; P.glPeak = Math.max(P.glPeak, P.live());
  return { fcp: P.fcp, lcp: P.lcp, lcpEl: P.lcpEl || '', cls: P.cls, tasks: P.tasks.slice(), glLive: P.live(), glPeak: P.glPeak, glCreated: P.glCreated };
})()`;

// resolves when no visible [data-fx] near the viewport is still waiting to mount (or on the timeout); returns how many are still waiting
const SETTLE = (min, max) => `new Promise(r => { const t0 = performance.now(); (function w() {
  const vh = innerHeight, el = performance.now() - t0;
  const pend = [...document.querySelectorAll('[data-fx]:not([data-glow])')].filter(e => { const b = e.getBoundingClientRect();
    return b.width >= 2 && b.height >= 2 && b.top < vh * 1.5 && b.bottom > -vh * 0.5 && !e.hasAttribute('data-fx-mounted') && !e.hasAttribute('data-fx-fallback') && !e.querySelector('canvas,[data-fx-mounted]'); });
  if (el > ${max} || (el > ${min} && (!pend.length || document.documentElement.dataset.ready))) r(pend.length); else setTimeout(w, 80); })(); })`;

const AUDIT = `(async () => {
  const sy = scrollY, out = { imgs: [], fonts: [], mountedFx: [], declaredFx: [], dom: document.getElementsByTagName('*').length };
  const size = u => new Promise(res => { const i = new Image(); const t = setTimeout(() => res(null), 4000); i.onload = () => { clearTimeout(t); res([i.naturalWidth, i.naturalHeight]); }; i.onerror = () => { clearTimeout(t); res(null); }; i.src = u; });
  // loading=lazy as the page's source wrote it: the skill's system.js switches every lazy image to eager once the page has loaded
  // (so no frame shows empty), and the check reads the page after that: the attribute it finds is then eager. An image the source
  // marks lazy counts as lazy, however it reads now
  const liveImgs = [...document.querySelectorAll('img')], srcLazy = new Map();
  try {
    const html = await (await fetch(location.href)).text();
    const srcImgs = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('img')];
    const same = srcImgs.length === liveImgs.length && srcImgs.every((x, i) => x.getAttribute('src') === liveImgs[i].getAttribute('src'));
    if (same) srcImgs.forEach((x, i) => srcLazy.set(liveImgs[i], x.getAttribute('loading') === 'lazy'));
    else liveImgs.forEach(im => { const k = im.getAttribute('src'); if (k != null && srcImgs.some(x => x.getAttribute('src') === k && x.getAttribute('loading') === 'lazy')) srcLazy.set(im, true); });
  } catch (e) { /* no source to read: the live attribute counts */ }
  liveImgs.forEach(im => {
    const r = im.getBoundingClientRect();
    out.imgs.push({ kind: 'img', src: (im.currentSrc || im.src || '').slice(-80), top: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height), nw: im.naturalWidth, nh: im.naturalHeight,
      hasWH: im.hasAttribute('width') && im.hasAttribute('height'), lazy: im.loading === 'lazy' || srcLazy.get(im) === true, lazySwapped: im.loading !== 'lazy' && srcLazy.get(im) === true, visible: r.width > 0 && r.height > 0,
      sized: getComputedStyle(im).aspectRatio !== 'auto' });
  });
  // CSS background photos and SVG <image>: counted in the bytes already, checked here for slot size and place on the page
  const extra = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect(); if (r.width < 40 || r.height < 40) return;
    if (el instanceof SVGImageElement) { const u = el.href && el.href.baseVal; if (u && !/^data:/.test(u)) extra.push({ kind: 'svg', u: new URL(u, location.href).href, el, r }); return; }
    const bg = getComputedStyle(el).backgroundImage; if (!bg || bg === 'none') return;
    for (const m of bg.matchAll(/url\\(["']?([^"')]+)["']?\\)/g)) if (!/^data:/.test(m[1])) extra.push({ kind: 'bg', u: new URL(m[1], location.href).href, el, r });
  });
  for (const x of extra.slice(0, 40)) {
    const nat = await size(x.u);
    out.imgs.push({ kind: x.kind, src: x.u.slice(-80), top: Math.round(x.r.top + sy), w: Math.round(x.r.width), h: Math.round(x.r.height), nw: nat ? nat[0] : 0, nh: nat ? nat[1] : 0,
      hasWH: true, lazy: false, visible: true, sized: true });
  }
  document.fonts.forEach(f => { if (f.status === 'loaded') out.fonts.push(f.family.replace(/["']/g, '') + '|' + f.weight + '|' + f.style); });
  const P = window.__perf, ever = P.ever;
  ever.forEach(e => out.mountedFx.push(e.getAttribute('data-fx-mounted') || e.getAttribute('data-fx') || e.getAttribute('data-glow')));
  // a glow (data-glow) mounts on hover by design; a hidden host (closed tab) is not expected to mount
  document.querySelectorAll('[data-fx]:not([data-glow])').forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return; out.declaredFx.push([e.getAttribute('data-fx'),
    ever.includes(e) || e.hasAttribute('data-fx-mounted') || !!e.querySelector('canvas,[data-fx-mounted]') || e.hasAttribute('data-fx-fallback')]); });
  out.tokens = [...new Set([...document.querySelectorAll('*')].flatMap(e => [...e.classList, ...[...e.attributes].filter(a => /^data-/.test(a.name) && a.value.length < 40).map(a => a.value)]))];
  // hosts that an object or component drew into: a canvas, a fallback host, a WebGL context made
  out.hosts = document.querySelectorAll('canvas').length + document.querySelectorAll('[data-fx-fallback]').length;
  out.glMade = P.glCreated; out.canvasesMade = P.canvases;
  out.docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  out.overflowX = document.documentElement.scrollWidth > innerWidth + 1;
  return out;
})()`;

/* ---------------------------------------------------------------- one measurement */
async function measure(chrome, url, W, H, nogl = false) {
  const { send, S, ev, on } = chrome;
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  const Sx = (m, p) => S(sessionId, m, p), E = x => ev(sessionId, x);
  const reqs = new Map(), errors = [];
  const off = on(m => {
    if (m.sessionId !== sessionId) return;
    const p = m.params;
    if (m.method === 'Network.requestWillBeSent') reqs.set(p.requestId, { url: p.request.url, type: p.type || 'Other', status: 0, bytes: 0, decoded: 0 });
    else if (m.method === 'Network.responseReceived' && reqs.has(p.requestId)) { const r = reqs.get(p.requestId); r.status = p.response.status; r.type = p.type || r.type; r.mime = p.response.mimeType; }
    else if (m.method === 'Network.loadingFinished' && reqs.has(p.requestId)) reqs.get(p.requestId).bytes = p.encodedDataLength;
    else if (m.method === 'Network.dataReceived' && reqs.has(p.requestId)) reqs.get(p.requestId).decoded += p.dataLength;
    else if (m.method === 'Network.loadingFailed' && reqs.has(p.requestId)) { const r = reqs.get(p.requestId); r.failed = true; }
    else if (m.method === 'Runtime.exceptionThrown') errors.push((p.exceptionDetails.exception?.description || p.exceptionDetails.text).split('\n')[0]);
  });
  await Sx('Page.enable'); await Sx('Runtime.enable'); await Sx('Network.enable');
  await Sx('Network.setCacheDisabled', { cacheDisabled: true });
  await Sx('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });
  await Sx('Page.addScriptToEvaluateOnNewDocument', { source: (nogl ? 'window.__NOGL = 1;' : '') + PROBE });
  const loaded = new Promise(r => { const o = on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') { o(); r(); } }); });
  await Sx('Page.navigate', { url });
  await Promise.race([loaded, sleep(25000)]);
  // ready: the page's own data-ready flag, or every visible effect near the viewport mounted (or showing its fallback), at most 10 s
  const waiting0 = await E(SETTLE(300, 10000));
  await E('document.fonts ? document.fonts.ready.then(() => 1) : 1');
  await sleep(400);
  const atLoad = await E(SNAP);
  const loadReqs = reqs.size;
  // scroll to the bottom one screen at a time; each stop waits for the effects now in view to mount
  const total = await E('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)');
  for (let y = 0, n = 0; y < total && n < 60; y += Math.round(H * 0.85), n++) { await E(`window.scrollTo(0, ${y})`); await E(SETTLE(200, 2500)); }
  await E('window.scrollTo(0, document.documentElement.scrollHeight)');
  const stuck = await E(SETTLE(600, 4000));
  await sleep(400);
  const atEnd = await E(SNAP);
  const audit = await E(AUDIT);
  off();
  await send('Target.closeTarget', { targetId }).catch(() => {});
  return { reqs: [...reqs.values()], atLoad, atEnd, audit, loadReqs, errors, docH: audit.docH, stuck, waiting0 };
}

/* ---------------------------------------------------------------- analysis */
const kb = n => Math.round(n / 102.4) / 10;
// timing rows from several runs: the median per run-set, the spread printed, verdict capped at WARN on a busy host
function timing(add, runs, label, busy) {
  const cap = v => (busy && v === 'FAIL' ? 'WARN' : v);
  const bt = a => a.reduce((s, t) => s + Math.max(0, t[1] - 50), 0);
  const tasks = runs.map(m => m.atEnd.tasks), nT = tasks.map(t => t.length), blk = tasks.map(bt), blkL = runs.map(m => bt(m.atLoad.tasks));
  const maxT = Math.max(0, ...tasks.map(t => t.reduce((a, x) => Math.max(a, x[1]), 0)));
  const note = (a, f) => `runs ${a.length}, ${spread(a, f)}` + (busy ? ', busy host' : '');
  add('long tasks' + label, median(nT), cap(rate(median(nT), B.longTasks)), `${note(nT)}, max ${maxT}ms`);
  add('blocking time' + label, median(blk) + ' ms', cap(rate(median(blk), B.blockingMs)), `${note(blk)} ms; at load ${median(blkL)}ms`);
  const fcp = runs.map(m => m.atLoad.fcp), lcp = runs.map(m => m.atLoad.lcp), cls = runs.map(m => m.atEnd.cls);
  add('FCP (CPU, relative)', Math.round(median(fcp)) + ' ms', cap(rate(median(fcp), B.fcp)), runs.length > 1 ? note(fcp) : '');
  add('LCP (CPU, relative)', Math.round(median(lcp)) + ' ms', cap(rate(median(lcp), B.lcp)), (runs.length > 1 ? note(lcp) + ', ' : '') + runs[0].atLoad.lcpEl);
  add('layout shift', median(cls).toFixed(3), rate(median(cls), B.cls), (runs.length > 1 ? `runs ${runs.length}, ${spread(cls, x => x.toFixed(3))}; ` : '') + `at load ${median(runs.map(m => m.atLoad.cls)).toFixed(3)}`);
}

function analyse(m, W, timed, glRun, load) {
  const rows = [], add = (name, value, verdict, note = '') => rows.push({ name, value, verdict, note });
  const busy = load > 50;
  add('host CPU load (before/after)', load + ' %', busy ? 'WARN' : 'PASS', busy ? 'busy host: timing verdicts capped at WARN, rerun when idle' : '');
  const own = m.reqs.filter(r => !/^(data|chrome|blob):/.test(r.url) && !/\/favicon\.ico$/.test(r.url));
  const by = {};
  own.forEach(r => {
    const t = { Script: 'js', Stylesheet: 'css', Image: 'img', Font: 'font', Document: 'html', Media: 'media' }[r.type] || 'other';
    (by[t] ||= { n: 0, bytes: 0 }); by[t].n++; by[t].bytes += r.bytes || r.decoded;
  });
  const g = t => (by[t]?.bytes || 0);
  const total = own.reduce((a, r) => a + (r.bytes || r.decoded), 0);
  const types = ['html', 'css', 'js', 'font', 'img', 'media', 'other'].filter(t => by[t]).map(t => `${t} ${kb(g(t))}K`).join('  ');
  add('total transfer', kb(total) + ' KiB', rate(kb(total), B.totalKB), types);
  add('requests', own.length, rate(own.length, B.requests), `${m.loadReqs} by load`);
  add('images bytes', kb(g('img')) + ' KiB', rate(kb(g('img')), B.imagesKB), `${by.img?.n || 0} files`);
  const big = own.filter(r => r.type === 'Image').sort((a, b) => b.bytes - a.bytes)[0];
  if (big) add('largest image', kb(big.bytes) + ' KiB', rate(kb(big.bytes), B.oneImageKB), big.url.split('/').slice(-2).join('/'));
  const js = own.filter(r => r.type === 'Script'), jsParsed = js.reduce((a, r) => a + (r.decoded || r.bytes), 0);
  add('JS parsed', kb(jsParsed) + ' KiB', rate(kb(jsParsed), B.jsKB), `${js.length} files, ${kb(js.reduce((a, r) => a + r.bytes, 0))}K gz`);
  add('CSS', kb(g('css')) + ' KiB', rate(kb(g('css')), B.cssKB), `${by.css?.n || 0} files`);
  const fontFiles = own.filter(r => r.type === 'Font');
  const fams = [...new Set(m.audit.fonts.map(f => f.split('|')[0]))];
  add('font families', fams.length, rate(fams.length, B.fontFamilies), fams.join(', '));
  add('font files', fontFiles.length, rate(fontFiles.length, B.fontFiles), `${kb(g('font'))}K`);
  if (g('font') > 0) add('font bytes', kb(g('font')) + ' KiB', rate(kb(g('font')), B.fontKB));
  // images: <img> plus CSS background photos and SVG <image> (named by kind in the notes)
  const imgs = m.audit.imgs.filter(i => i.visible || i.nw);
  const reqBytes = u => (own.find(r => r.url.endsWith(u.slice(-60))) || {}).bytes || 0;
  const nm = list => list.slice(0, 3).map(i => (i.kind === 'img' ? '' : i.kind + ' ') + i.src.split('/').pop()).join(', ');
  const tags = imgs.filter(i => i.kind === 'img');
  const noWH = tags.filter(i => !i.hasWH && !i.sized);
  add('images without width+height', noWH.length, count(noWH.length), nm(noWH));
  const notLazy = tags.filter(i => i.top > m.vh * 1.1 && !i.lazy);
  const swapped = tags.filter(i => i.lazySwapped);
  add('below-fold images not lazy', notLazy.length, count(notLazy.length), nm(notLazy) || (swapped.length ? `${swapped.length} marked lazy in the page source, set eager by system.js once the page has loaded` : ''));
  const heroLazy = tags.filter(i => i.top < m.vh * 0.8 && i.lazy && i.w > 200);
  if (heroLazy.length) add('above-fold image set lazy', heroLazy.length, 'WARN', nm(heroLazy));
  const bgFar = imgs.filter(i => i.kind !== 'img' && i.top > m.vh * 1.1 && reqBytes(i.src) > 40 * 1024);
  if (bgFar.length) add('below-fold photos as CSS/SVG background', bgFar.length, count(bgFar.length), 'cannot be lazy: use <img loading="lazy">; ' + nm(bgFar));
  const over = imgs.filter(i => i.w > 40 && i.nw > Math.max(300, i.w * 2.2));
  add('oversized images (natural > 2.2x shown)', over.length, count(over.length), over.slice(0, 3).map(i => `${nm([i])} ${i.nw}px for ${i.w}`).join('; '));
  const soft = imgs.filter(i => i.w > 120 && i.nw && i.nw < i.w * 0.75);
  if (soft.length) add('upscaled images (natural < 0.75x shown)', soft.length, 'WARN', soft.slice(0, 3).map(i => `${nm([i])} ${i.nw}px for ${i.w}`).join('; '));
  // WebGL (counted on the load that had WebGL on)
  add('WebGL live at load', glRun.atLoad.glLive, rate(glRun.atLoad.glLive, B.glPeak));
  add('WebGL live at bottom', glRun.atEnd.glLive, rate(glRun.atEnd.glLive, B.glPeak));
  add('WebGL peak live', glRun.atEnd.glPeak, rate(glRun.atEnd.glPeak, B.glPeak), `${glRun.atEnd.glCreated} contexts made in all`);
  if (glRun.atEnd.glCreated > B.glCreated[0]) add('WebGL contexts made', glRun.atEnd.glCreated, rate(glRun.atEnd.glCreated, B.glCreated), 'mount and release churn');
  // timing: median of the repeated loads
  if (glRun.atEnd.glCreated > 0) {
    timing(add, timed, ' (WebGL off)', busy);
    const t = glRun.atEnd.tasks, bt = t.reduce((s, x) => s + Math.max(0, x[1] - 50), 0);
    add('  info: one load with WebGL on the CPU', bt + ' ms', 'INFO', `${t.length} long tasks; SwiftShader runs shaders on the CPU, not a verdict, and shader compile on a real GPU is not measured`);
  } else timing(add, timed, '', busy);
  // modules loaded but never mounted: entry files only (effect.js, object.js, component.js, a ui fragment.js); helpers such as photo-kit never count
  const toks = m.audit.tokens || [], tok = new Set(toks), mod = new Set();
  own.filter(r => r.type === 'Script').forEach(r => {
    const x = r.url.match(/\/(effects|objects|components|ui)\/([^/]+)\/(effect|object|component|fragment)\.m?js(\?|$)/);
    if (x && !x[2].startsWith('_')) mod.add(x[1] + '/' + x[2]);
  });
  const mounted = new Set(m.audit.mountedFx);
  const hosts = Math.max(m.audit.hosts, m.audit.canvasesMade + m.audit.glMade, glRun.atEnd.glCreated);
  const objs = [...mod].filter(k => k.startsWith('objects/'));
  const dead = [...mod].filter(k => {
    const [kind, id] = k.split('/');
    if (kind === 'effects') return !mounted.has(id) && !tok.has(id);   // tok holds every data-fx / data-glow value on the page
    if (kind === 'objects') return false;                              // judged by count below: an object draws into a host the page names itself
    const s = id.replace(/^fx-/, '');   // a component fx-band marks its host with cx-band, cx-band__title ...
    return !(tok.has(id) || tok.has(s) || tok.has('cx-' + s) || toks.some(t => t.startsWith(s + '__') || t.startsWith('cx-' + s + '__') || t.startsWith(id + '__') || t.startsWith(id + '-')));
  });
  // more object modules loaded than canvases or fallback hosts drawn: the extra ones were imported and never mounted
  const objDead = Math.max(0, objs.length - hosts);
  const names = dead.slice(0, 4).join(', ') + (objDead ? (dead.length ? ', ' : '') + `${objDead} of ${objs.length} objects (${objs.map(o => o.slice(8)).join(' ')}) vs ${hosts} hosts` : '');
  const nDead = dead.length + objDead;
  add('modules loaded, never mounted', nDead, nDead > B.unmounted[1] ? 'FAIL' : nDead > B.unmounted[0] ? 'WARN' : 'PASS', names);
  const undrawn = m.audit.declaredFx.filter(d => !d[1]);
  if (undrawn.length) add('effects declared, not drawn by the bottom', undrawn.length, 'WARN', [...new Set(undrawn.map(d => d[0]))].slice(0, 4).join(', ') + (m.stuck ? `, ${m.stuck} still waiting` : ''));
  const bad = own.filter(r => r.status >= 400 || r.failed);
  add('broken requests', bad.length, bad.length ? 'FAIL' : 'PASS', bad.slice(0, 3).map(r => r.url.split('/').slice(-2).join('/')).join(', '));
  if (m.errors.length) add('script errors', m.errors.length, 'WARN', m.errors[0].slice(0, 90));
  if (m.audit.overflowX) add('horizontal overflow', 'yes', 'FAIL', `scrollWidth > ${W}`);
  add('page height', Math.round(m.docH / m.vh * 10) / 10 + ' screens', 'PASS', `DOM ${m.audit.dom} nodes`);
  return rows;
}

/* ---------------------------------------------------------------- report */
const results = [];
const label = target.replace(/\\/g, '/').split('/').slice(-3).join('/');
function report(partial) {
  let fails = 0, warns = 0;
  for (const r of results) {
    console.log(`\nperf ${label} @ ${r.w}px`);
    for (const x of r.rows) {
      if (x.verdict === 'FAIL') fails++;
      if (x.verdict === 'WARN') warns++;
      console.log(`  ${x.verdict.padEnd(4)}  ${x.name.padEnd(42)} ${String(x.value).padEnd(14)} ${x.note}`);
    }
  }
  console.log(`\nSUMMARY ${label}: ${fails} FAIL, ${warns} WARN` + (partial ? '  (PARTIAL: timed out)' : '') + (fails ? '  -> FAIL' : warns ? '  -> WARN' : '  -> PASS'));
  if (jsonOut) { try { fs.writeFileSync(jsonOut, JSON.stringify({ page: target, partial: !!partial, results }, null, 1)); } catch (e) { console.error('perf: could not write ' + jsonOut + ': ' + e.message); } }
  return fails;
}

/* ---------------------------------------------------------------- run */
let url = target, srvObj = null;
if (!/^https?:/.test(target)) {
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) die('not found: ' + abs);
  const isDir = fs.statSync(abs).isDirectory(), dir = rootArg || (isDir ? abs : path.dirname(abs)), rel = path.relative(dir, abs);
  if (rel.split(path.sep)[0] === '..' || path.isAbsolute(rel)) { console.error(`perf: the page is not inside --root ${dir}: ${abs}`); process.exit(2); }
  srvObj = await serve(dir);
  url = `http://127.0.0.1:${srvObj.port}/` + rel.split(path.sep).map(encodeURIComponent).join('/') + (isDir && rel ? '/' : '');
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
// a fresh profile folder per run (a reused one can still be locked by the Chrome just closed); removed once Chrome has exited
// default profile folder: --profile, else $TASTE_SKILL_TMP/chrome/perf, else a folder under the system temp dir
const profileBase = path.resolve(profileArg ? inProject(profileArg, 'perf') : (process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'perf') : path.join(os.tmpdir(), 'taste-skill-perf')));
fs.mkdirSync(profileBase, { recursive: true });
for (const d of fs.readdirSync(profileBase)) if (/^run-\d+$/.test(d)) { try { fs.rmSync(path.join(profileBase, d), { recursive: true, force: true }); } catch { /* another run, or locked */ } }
const profile = path.join(profileBase, 'run-' + process.pid);
fs.mkdirSync(profile, { recursive: true });
const portFile = path.join(profile, 'DevToolsActivePort');
const loadBefore = await hostLoad();
const child = spawn(findChrome(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--hide-scrollbars', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore', windowsHide: true });
const exited = new Promise(r => child.once('exit', r));
const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
// the guard scales with the work; on a timeout the results so far are printed, not lost
const guard = setTimeout(() => { console.error('perf: timed out'); kill(); const f = report(true); process.exit(f ? 1 : 2); }, 150000 * widths.length * (RUNS + 1));
let loadAfter = loadBefore;
try {
  let port = null;
  for (let i = 0; i < 150 && !port; i++) { await sleep(100); try { port = parseInt(fs.readFileSync(portFile, 'utf8'), 10) || null; } catch { /* not yet */ } }
  if (!port) throw new Error('Chrome did not start');
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
  let id = 0; const pend = new Map(), subs = new Set();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } else subs.forEach(f => f(m)); });
  const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const S = async (sid, m, p) => { const r = await send(m, p, sid); if (r.error) throw new Error(`${m}: ${r.error.message}`); return r.result; };
  const ev = async (sid, x) => (await S(sid, 'Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.value;
  const on = f => { subs.add(f); return () => subs.delete(f); };
  const chrome = { send, S, ev, on };
  const loads = [];
  for (const W of widths) {
    const H = W < 600 ? 844 : 900;
    // load 1: WebGL as the page asks for it (counts, bytes, audit). If it made WebGL contexts, the timing comes from RUNS loads with WebGL off;
    // otherwise load 1 is the first timing run and RUNS-1 more follow.
    const first = await measure(chrome, url, W, H); first.vh = H;
    const usesGl = first.atEnd.glCreated > 0;
    const timed = usesGl ? [] : [first];
    while (timed.length < RUNS) timed.push(await measure(chrome, url, W, H, usesGl));
    const m = usesGl ? timed[0] : first; m.vh = H;
    loads.push({ W, first, timed, m, usesGl });
    results.push({ w: W, rows: analyse({ ...m, vh: H, audit: first.audit, reqs: first.reqs, loadReqs: first.loadReqs, errors: first.errors, docH: first.docH, stuck: first.stuck }, W, timed, first, loadBefore) });
  }
  try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch { /* closing */ }
} finally {
  clearTimeout(guard); kill(); if (srvObj) srvObj.srv.close();
  await Promise.race([exited, sleep(4000)]);
  for (let i = 0; i < 8; i++) { try { fs.rmSync(profile, { recursive: true, force: true }); break; } catch { await sleep(500); } }
}
loadAfter = await hostLoad(800);
const load = Math.max(loadBefore, loadAfter);
for (const r of results) {
  const h = r.rows[0]; h.value = `${loadBefore}/${loadAfter} %`;
  if (load > 50) { h.verdict = 'WARN'; h.note = 'busy host: timing verdicts capped at WARN, rerun when idle'; r.rows.forEach(x => { if (x.verdict === 'FAIL' && /^(long tasks|blocking time|FCP|LCP)/.test(x.name)) x.verdict = 'WARN'; }); }
}
process.exit(report(false) ? 1 : 0);
