#!/usr/bin/env node
/*
  taste-skill shoot.mjs - a full-page screenshot of a page with live effects, and one tile per section.

    node <skill>/scripts/shoot.mjs --url <url or file> --w 1440 --out shots/1440.png --profile <own chrome dir>
      [--h 900] [--reduced] [--dark] [--wait 450] [--port 5300] [--root <dir>] [--tiles <dir>] [--no-tiles]

  A file (a path, or a folder holding index.html) is served over http on 127.0.0.1 from a free port (5300-5399, or
  --port and the 9 after it) for the run, from high enough that the page's ../ links resolve: Chrome runs no module
  script from file://, so a page opened that way shows its kit, effects and diagrams empty. Never port 3000.
  --root serves from that folder instead (a built site whose links start at its root, /style.css).

  Section tiles: at 1440 and at a phone width (under 600) it first shoots one screen
  per top-level section (the children of main, a body > section, a closing footer, the footer), starting at the
  section's top with the fixed header over it as a visitor sees it (check CK-16: a judge tile at k x 900 at 1440x900, k x 844 at 390x844: one screen is exactly that tall, as consistency.mjs section-height measures it), every
  whole screen after it, and a last screen with its bottom on the section's bottom when the section is taller than one
  screen. A section whose top the page cannot scroll to (the last short one) is cut out of the last screen, so its tile
  shows it alone. That is the judge's tile: one section per tile, never the next one peeking in. They go to --tiles,
  else tiles/ beside --out, as desktop-sec-NN-a.jpg (-b, -c in order down the section) or mobile-sec-NN-a.jpg, with
  sections.json (each section's top, its height in screens, its tiles; both views of one page kept, whatever port
  served it). Each tile waits for the screen to settle (fonts
  ready, no picture loading, the boxes still over three reads 300 ms apart, at most 6 s, then 800 ms for canvases and
  shaders). --no-tiles skips them. Nothing is judged here: consistency.mjs judges (hero-screen, section-height,
  one-section and the rest).

  It scrolls one screen at a time, captures each screen while its effects are on view, and stitches
  the screens into one PNG in Node (a single capture of a tall page with many WebGL canvases can hang
  Chrome). After the first screen a sticky part renders in place, where it sits in the page (a nav
  at the top, a table's header row over its table, a side column at the top of its section), and a
  fixed bar or button is left out; a ground fixed behind the whole page stays. So the nav shows on
  the first screen only and nothing leaves an empty gap. A held stage (a sticky panel as wide and
  nearly as tall as the screen) stays held, as the visitor sees it. --dark emulates
  prefers-color-scheme: dark. Uses its own Chrome profile and closes Chrome by its own PID. The profile (--profile) is a
  folder of its own in the OS temp folder or the project's .taste-skill folder, never outside the project; a relative one
  that leads out of the current folder (../prof) is replaced, with a warning, by .taste-skill/chrome-shoot.

  No empty bands: smooth scrolling and scroll snapping are switched off while it shoots (a snap or
  a smooth scroll that has not arrived leaves rows no screen covered), each screen is placed where
  the page really scrolled to, a part stuck to the bottom of the screen renders in place from the
  first screen on, a pass-through layer over the whole page (grain, a ground) stays, and any rows
  still uncovered are shot again; rows that cannot be reached are reported, never left blank. A
  header that shrinks or turns fixed once the page scrolls moves the page under it: later screens
  are placed by that shift, so no band is lost or doubled at the first seam. A held stage gets a
  screen where its hold starts and one where it ends, so it shows whole each time, never cut at a
  seam. Each screen waits up to 3 s for its pictures (a lazy photograph just reached) and gives a
  WebGL piece on it one more settle to draw; pictures still loading are named, and so are pictures
  that have loaded but show nothing on screen (under 0.1 opacity or hidden: a reveal that never
  fired). The picture stops at 32000px; a longer page is said to be cut there. Without --h, the
  screen is as tall as consistency.mjs takes it: 1440x900, 1024x768, a tablet upright (820x1180,
  768x1024) and a phone (390x844), so a hero sized to the screen is shot as that device shows it.
*/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
// default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'shoot-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-shoot-' + process.pid);
const target = opt('url'), out = opt('out'), profileArg = (p => (p && p !== true ? p : defaultProfile()))(opt('profile')), rootArg = opt('root');
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
// the screen's height, as consistency.mjs has it: a tablet is held upright (820x1180, 768x1024), so a hero sized
// to the screen (100svh) is shot at the height a tablet shows it
const HEIGHTS = { 1440: 900, 1366: 768, 1280: 800, 1152: 864, 1024: 768, 896: 800, 834: 1194, 820: 1180, 810: 1080, 800: 1280, 768: 1024, 430: 932, 414: 896, 390: 844, 375: 812, 360: 780 };
const W = +opt('w', 1440), VH = +opt('h', HEIGHTS[+opt('w', 1440)] || (W < 600 ? 844 : 900)), settle = +opt('wait', 450);
if (!target || target === true || !out || out === true || rootArg === true) {
  console.error('usage: shoot.mjs --url <url or file> --w 1440 --out file.png [--profile <dir in the OS temp folder or .taste-skill>] [--h 900] [--reduced] [--dark] [--wait 450] [--port 5300] [--root <dir>] [--tiles <dir>] [--no-tiles]');
  process.exit(1);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------------------------------------------------------- a local file is served over http (port 5300-5399) */
const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.glsl': 'text/plain; charset=utf-8', '.frag': 'text/plain; charset=utf-8', '.vert': 'text/plain; charset=utf-8' };
let url = String(target), server = null;
if (!/^https?:\/\//i.test(url)) {
  // a file: URL keeps its leading slash on Linux and macOS (file:///home/x is /home/x)
  let file = path.resolve(/^file:/i.test(url) ? fileURLToPath(url) : url);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { console.error('shoot: no such file: ' + file); process.exit(1); }
  // served from high enough that the page's ../ references resolve
  const ups = Math.max(0, ...[...fs.readFileSync(file, 'utf8').matchAll(/(?:(?:src|href)\s*=\s*|\bfrom\s*|\bimport\s*\(?\s*|url\(\s*)["']?((?:\.\.\/)+)/g)].map((m) => m[1].length / 3));
  let root = path.dirname(file); for (let i = 0; i < ups; i++) root = path.dirname(root);
  if (rootArg) { root = path.resolve(rootArg); const rel = path.relative(root, file); if (rel.split(path.sep)[0] === '..' || path.isAbsolute(rel)) { console.error(`shoot: the page is not inside --root ${root}: ${file}`); process.exit(2); } }
  server = http.createServer((req, res) => {
    try {
      let f = path.resolve(path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
      if (f !== root && !f.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
      if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': fs.statSync(f).size, 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  const from = Number(opt('port', 5300)), to = from >= 5300 && from <= 5399 ? 5399 : from + 9;
  const port = await new Promise((res, rej) => {
    let p = from;
    const next = () => { if (p > to) return rej(new Error(`no free port in ${from}-${to}`)); server.once('error', () => { p++; next(); }); server.listen(p, '127.0.0.1', () => { server.removeAllListeners('error'); res(p); }); };
    next();
  }).catch((e) => { console.error('shoot: ' + e.message); process.exit(1); });
  url = `http://127.0.0.1:${port}/${path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/')}`;
}

function findChrome() {
  const local = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null;
  const c = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', local,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const f = c.find(p => p && fs.existsSync(p));
  if (!f) throw new Error('no Chrome found (set CHROME_PATH)');
  return f;
}

/* ---------------------------------------------------------------- PNG (8-bit RGB/RGBA, no interlace) */
function decodePNG(buf) {
  let pos = 8, w = 0, h = 0, type = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), name = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (name === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; if (data[8] !== 8 || data[12]) throw new Error('png: unsupported format'); }
    else if (name === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : 0;
  if (!bpp) throw new Error('png: colour type ' + type);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      px[o] = line[x * bpp]; px[o + 1] = line[x * bpp + 1]; px[o + 2] = line[x * bpp + 2]; px[o + 3] = bpp === 4 ? line[x * bpp + 3] : 255;
    }
    prev = line;
  }
  return { w, h, px };
}
function encodePNG(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const chunk = (name, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(name, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------------------------------------------------------------- section tiles */
// the page's top-level sections and the fixed or sticky header over them; the
// elements are kept on window.__tilesSecs for viewOf() and removed by the caller
function sectionsProbe(o) {
  const H = innerHeight, vw = document.documentElement.clientWidth || innerWidth;
  const sel = (el) => {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.body && e !== document.documentElement && parts.length < 4; e = e.parentElement) {
      const tag = e.tagName.toLowerCase();
      if (e.id && /^[A-Za-z][\w-]*$/.test(e.id)) { parts.unshift(tag + '#' + e.id); break; }
      const cls = [...e.classList].filter((c) => /^[A-Za-z_][\w-]*$/.test(c) && !/^(is|js|has)-/.test(c)).slice(0, 2);
      let s = tag + cls.map((c) => '.' + c).join('');
      const p = e.parentElement;
      if (p) { const same = [...p.children].filter((x) => x.tagName === e.tagName); if (same.length > 1 && (!cls.length || same.filter((x) => cls.every((c) => x.classList.contains(c))).length > 1)) s += `:nth-of-type(${same.indexOf(e) + 1})`; }
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  let navH = 0;
  for (const el of document.querySelectorAll('body > header, header.nav, body > nav, [role=banner]')) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if ((cs.position === 'fixed' || cs.position === 'sticky') && r.top <= 1 && r.height < H / 3) navH = Math.max(navH, Math.round(r.bottom));
  }
  const main = document.querySelector('main');
  const cands = [...(main ? main.children : []), ...document.querySelectorAll('body > section, footer.closing, body > footer, main ~ footer')];
  const seen = new Set();
  const secs = cands.filter((e) => {
    if (seen.has(e) || /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(e.tagName)) return false;
    seen.add(e);
    const r = e.getBoundingClientRect();
    return r.height > 40 && getComputedStyle(e).display !== 'none';
  }).filter((e, _, a) => !a.some((x) => x !== e && x.contains(e)));
  secs.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  window.__tilesSecs = secs;
  // a held stage: a sticky panel 60% of the screen each way, a GSAP pin, or a scroll scene (its height is its runway)
  const held = (e) => e.matches('[data-scene], [data-big-scene], .pin-spacer') || !!e.closest("[data-scene], [data-big-scene]") || !!e.querySelector('.pin-spacer, [data-scene], [data-big-scene]') ||
    [...e.querySelectorAll('*')].some((x) => { if (getComputedStyle(x).position !== 'sticky') return false; const q = x.getBoundingClientRect(); return q.width >= vw * 0.6 && q.height >= H * 0.6; });
  const label = (e) => (e ? e.innerText || e.textContent || '' : '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const sections = secs.map((e) => {
    const r = e.getBoundingClientRect();
    const row = { tag: e.tagName.toLowerCase(), id: e.id || '', cls: typeof e.className === 'string' ? e.className.slice(0, 60) : '', top: Math.round(r.top + scrollY), h: Math.round(r.height) };
    if (o && o.full) Object.assign(row, { sel: sel(e), text: label(e.querySelector('h1, h2, h3') || e), foot: e.tagName === 'FOOTER' || e.getAttribute('role') === 'contentinfo', held: held(e) });
    return row;
  });
  return { H, vw, navH, scrollY: Math.round(scrollY), scrollHeight: document.scrollingElement.scrollHeight, sections };
}
// a jump, not a glide: a smooth-scroll library is told to jump too, or it eases the page back
function jumpTo(y) {
  const L = window.lenis || window.__lenis;
  try { if (L && L.scrollTo) L.scrollTo(y, { immediate: true, force: true }); } catch (e) { /* not ours */ }
  scrollTo({ top: y, left: 0, behavior: 'instant' });
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(Math.round(scrollY)))));
}
// the screen settled: fonts ready, no picture on the page loading, and the boxes on screen and the stylesheets the same
// over three reads 300ms apart (at most o.max), then o.tail more for canvases and shaders
function settleProbe(o) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  return (async () => {
    try { if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, wait(3000)]); } catch (e) { /* no fonts api */ }
    const t0 = performance.now();
    let last = '', same = 0;
    while (performance.now() - t0 < o.max) {
      let n = 0, a = 0;
      for (const e of document.querySelectorAll('body *')) {
        const r = e.getBoundingClientRect();
        if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) { n++; a += Math.round((r.width * r.height) / 100); }
      }
      const sig = `${n}:${a}:${document.styleSheets.length}:${[...document.images].filter((i) => !i.complete).length}`;
      if (sig === last) { if (++same >= 3) break; } else { same = 0; last = sig; }
      await wait(300);
    }
    await wait(o.tail);
    return 1;
  })();
}
const call = (fn, arg) => `(${fn.toString()})(${JSON.stringify(arg ?? null)})`;

// page: { eval(expression) -> value, send(method, params) -> result } (shoot.mjs's ev and S; consistency's Tab works too)
async function shootTiles(page, outDir, o = {}) {
  try { return await tilesOf(page, outDir, o); } catch (e) { return { view: o.view || null, error: e.message, line: `tiles: not shot (${e.message})` }; }
}
async function tilesOf(page, outDir, o) {
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const W = o.width || (await page.eval('innerWidth'));
  const view = o.view || (W < 600 ? 'mobile' : W === 1440 ? 'desktop' : null);
  if (!view) return null;
  const out = path.resolve(outDir);
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (new RegExp(`^${view}-sec-\\d{2,}-[a-z]\\.jpg$`).test(f)) fs.rmSync(path.join(out, f), { force: true });
  // one pass down the page so lazy images and load-on-view content arrive, then back to the top
  // one screen is exactly o.height (900 at 1440x900, 844 at 390x844: the unit consistency.mjs section-height measures in); a
  // tab that reports another height is put back on it, and a tile is never cut at a different one
  const SCREEN = o.height || (await page.eval('innerHeight'));
  if (o.height && (await page.eval('innerHeight')) !== SCREEN && o.fit) { await o.fit(); await pause(400); }
  const H0 = await page.eval('innerHeight');
  if (H0 !== SCREEN) return { view, error: `innerHeight is ${H0}, one screen is ${SCREEN}px at ${W}px wide`, line: `tiles: not shot (innerHeight is ${H0}, one screen is ${SCREEN}px at ${W}px wide: a tile is k x ${SCREEN})` };
  if (o.prescroll !== false) {
    const sh0 = await page.eval('document.scrollingElement.scrollHeight');
    for (let y = 0; y < sh0; y += H0) { await page.eval(call(jumpTo, y)); await pause(250); }
  }
  await page.eval(call(jumpTo, 0)); await pause(500);
  let info;
  try { info = await page.eval(call(sectionsProbe, {})); } finally { try { await page.eval('delete window.__tilesSecs'); } catch { /* gone with the page */ } }
  const maxY = Math.max(0, info.scrollHeight - info.H);
  const sections = [];
  for (const [i, s] of info.sections.entries()) {
    const nn = String(i + 1).padStart(2, '0');
    // the judge's tile (check CK-16, 1H/2H sections on the screen grid): the screen starting at the section's top, the
    // fixed header over its top padding as a visitor sees it; a section taller than one screen also gets the screen
    // ending at its bottom, and every whole screen between (a three-screen section gets three tiles). A section the page
    // cannot scroll to the top of (the last short one: its top is past the max scroll) is cut out of the last screen, so
    // its tile shows that section alone, never mostly the one before it
    // (consistency.mjs section-height: one screen is H +/- 2px, two screens 2H +/- 2px)
    const want = [s.top];
    for (let y = s.top + info.H; y < s.top + s.h - info.H - 2; y += info.H) want.push(y);
    if (s.h > info.H + 2) want.push(s.top + s.h - info.H);
    const tiles = [];
    for (const [k, y0] of want.slice(0, 8).entries()) {
      const y = Math.min(maxY, Math.max(0, y0));
      await page.eval(call(jumpTo, y));
      const at = await page.eval('Math.round(scrollY)');
      await page.eval(call(settleProbe, { max: 6000, tail: 800 }));
      const file = `${view}-sec-${nn}-${String.fromCharCode(97 + k)}.jpg`;
      // clip in page coordinates: from the section's top (or the screen's) to the screen's bottom or the section's end
      const cut = y0 > at + 1 ? Math.round(y0 - at) : 0;
      const clipH = Math.min(info.H - cut, Math.max(1, s.top + s.h - (at + cut)));
      const shot = cut > 0 ? { format: 'jpeg', quality: 78, clip: { x: 0, y: at + cut, width: info.vw, height: clipH, scale: 1 } } : { format: 'jpeg', quality: 78 };
      const { data } = await page.send('Page.captureScreenshot', shot);
      fs.writeFileSync(path.join(out, file), Buffer.from(data, 'base64'));
      tiles.push(cut > 0 ? { file, scrollY: at, cutTop: cut, height: clipH } : { file, scrollY: at });
    }
    sections.push({ n: i + 1, ...s, hScreens: Math.round((s.h / info.H) * 100) / 100, offGrid: Math.round(((s.h / info.H) % 1) * info.H), tiles });
  }
  await page.eval(call(jumpTo, 0));
  // sections.json holds both views: this run's view is set, the other kept when it is of the same page
  const url = await page.eval('location.href'), jf = path.join(out, 'sections.json');
  // the same page is the same path on any local port (a served file gets a free port each run), so the other view stays
  const pageKey = (u) => { try { const x = new URL(u); return (/^(127\.0\.0\.1|localhost|\[::1\])$/.test(x.hostname) ? 'local' : x.protocol + '//' + x.host) + x.pathname + x.search; } catch { return String(u); } };
  let report = null;
  try { report = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch { /* the first view */ }
  if (!report || !report.views || pageKey(report.url) !== pageKey(url)) report = { url, views: {} };
  report.url = url;
  report.at = new Date().toISOString();
  report.views[view] = { width: W, height: info.H, navH: info.navH, scrollHeight: info.scrollHeight, screens: Math.round((info.scrollHeight / info.H) * 100) / 100, sections, consoleErrors: (o.logs || []).slice(0, 10) };
  fs.writeFileSync(jf, JSON.stringify(report, null, 1));
  const v = report.views[view];
  return { view, ...v, line: `${view}: ${v.sections.length} sections, ${v.screens} screens, navH ${v.navH}, tiles ${v.sections.reduce((a, s) => a + s.tiles.length, 0)}; heights ${v.sections.map((s) => s.hScreens).join(' ')}` };
}
/* ---------------------------------------------------------------- Chrome */
const profile = inProject(profileArg, 'shoot');
fs.mkdirSync(profile, { recursive: true });
const portFile = path.join(profile, 'DevToolsActivePort');
try { fs.rmSync(portFile); } catch { /* none */ }
const child = spawn(findChrome(), ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--window-size=${W},${VH}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const kill = () => { if (child.exitCode != null) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { try { child.kill(); } catch { /* gone */ } } };
const noTiles = !!opt('no-tiles'), tilesDir = opt('tiles', null);
const guard = setTimeout(() => { console.error('shoot: timed out'); kill(); process.exit(2); }, noTiles ? 300000 : 480000); // screens wait for their pictures and effects: a long page needs the time

try {
  let port = null;
  for (let i = 0; i < 150 && !port; i++) { await sleep(100); try { port = parseInt(fs.readFileSync(portFile, 'utf8'), 10) || null; } catch { /* not yet */ } }
  if (!port) throw new Error('Chrome did not start');
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
  let id = 0; const pend = new Map(), subs = [], logs = [];
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } else subs.forEach(f => f(m)); });
  const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = async (m, p) => { const r = await send(m, p, sessionId); if (r.error) throw new Error(`${m}: ${r.error.message}`); return r.result; };
  const ev = async x => (await S('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.value;
  subs.push(m => { if (m.method === 'Runtime.exceptionThrown') logs.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]); });
  await S('Page.enable'); await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: W, height: VH, deviceScaleFactor: 1, mobile: W < 600 });
  const media = [];
  if (opt('reduced')) media.push({ name: 'prefers-reduced-motion', value: 'reduce' });
  if (opt('dark')) media.push({ name: 'prefers-color-scheme', value: 'dark' });
  if (media.length) await S('Emulation.setEmulatedMedia', { features: media });
  const loaded = new Promise(r => subs.push(m => { if (m.method === 'Page.loadEventFired') r(); }));
  await S('Page.navigate', { url });
  await Promise.race([loaded, sleep(20000)]);
  await ev(`new Promise(r => { const t = performance.now(); (function w() { if (document.documentElement.dataset.ready || performance.now() - t > 6000) r(); else setTimeout(w, 50); })(); })`);
  await ev('document.fonts ? document.fonts.ready.then(() => 1) : 1');
  await sleep(600);
  // no smooth scrolling and no snapping while shooting: every screen lands where it is asked to
  await ev(`(() => { const s = document.createElement('style'); s.id = '__shoot-scroll'; s.textContent = 'html, body, html * { scroll-behavior: auto !important; scroll-snap-type: none !important; }'; document.head.appendChild(s); return 1; })()`);
  // one tile per section, as the judge reads the page (1440 and a phone width; nothing at other widths)
  let tileLine = '';
  if (!noTiles) {
    const T = await shootTiles({ eval: ev, send: S }, tilesDir && tilesDir !== true ? tilesDir : path.join(path.dirname(path.resolve(out)), 'tiles'), { width: W, height: VH, logs, fit: () => S('Emulation.setDeviceMetricsOverride', { width: W, height: VH, deviceScaleFactor: 1, mobile: W < 600 }) });
    if (T) tileLine = T.error ? `\nWARNING: ${T.line}` : `\ntiles ${T.line}`;
  }
  // the stitched picture is capped at CAP rows (a 1440px row is 5.6 KB in memory); a longer page is cut, and said so
  const CAP = 32000;
  const fullH = await ev('Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))');
  const H = Math.min(CAP, fullH);
  const overflowX = await ev('document.documentElement.scrollWidth > innerWidth');
  // after the first screen: a sticky part renders in place (position relative at its own spot in the flow, so the
  // layout does not move and no gap is left), a fixed bar, button or banner is left out, and a fixed ground behind the
  // whole page stays. Run before every later capture: a header can turn fixed only once the page has scrolled.
  // On the first screen only a part stuck to the screen's bottom is put in place (it would sit over the hero, and
  // again where it belongs); from the second screen on, every sticky part.
  const inPlace = (firstScreen) => `(() => {
    const done = window.__shootDone || (window.__shootDone = new WeakSet()), vw = innerWidth, vh = innerHeight;
    const put = (e) => { done.add(e); for (const [k, v] of [['position', 'relative'], ['top', 'auto'], ['bottom', 'auto'], ['left', 'auto'], ['right', 'auto'], ['inset', 'auto']]) e.style.setProperty(k, v, 'important'); };
    for (const e of document.querySelectorAll('body *')) {
      if (done.has(e)) continue;
      const c = getComputedStyle(e);
      if (c.position === 'sticky') {
        const r = e.getBoundingClientRect();
        if (r.width >= vw * 0.6 && r.height >= vh * 0.6) continue; // a held stage: shown held, as it is seen
        if (${firstScreen} && (c.bottom === 'auto' || c.top !== 'auto')) continue; // a top-sticky part is in place on the first screen
        put(e);
      } else if (c.position === 'fixed' && !${firstScreen}) {
        const r = e.getBoundingClientRect();
        const cover = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / (vw * vh);
        const z = parseInt(c.zIndex, 10);
        // a ground or a pass-through layer (grain, a glow) over the whole page: covers most of the screen and holds no
        // words or links of its own; it stays on every screen
        if (cover >= 0.6 && (!(z > 0) || c.pointerEvents === 'none') && !e.querySelector('a[href], button, input') && (e.innerText || '').trim().length < 40) { done.add(e); continue; }
        done.add(e);
        e.style.setProperty('visibility', 'hidden', 'important');
      }
    }
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(1))));
  })()`;
  // (a smooth-scroll library is told to jump too, or it eases the page back to where it was)
  const shots = [], at = (y) => ev(`((() => { const L = window.lenis || window.__lenis; try { if (L && L.scrollTo) L.scrollTo(${y}, { immediate: true, force: true }); } catch (e) {} })(), scrollTo({ top: ${y}, left: 0, behavior: 'instant' }), new Promise(r => setTimeout(() => r(Math.round(scrollY)), ${settle})))`);
  // pictures on screen still loading (a lazy one just reached): waited for up to 3 s, so a frame is not shot empty;
  // the ones that never arrive are named
  const slow = new Set(), ghosts = new Set();
  // pictures on screen that have loaded but show nothing (under 0.1 effective opacity, or hidden): a reveal that never
  // fired leaves its frame showing only its ground; named, as the slow ones are
  const ghostIn = `(() => { const op = (e) => { let v = 1; for (let a = e; a && a.nodeType === 1; a = a.parentElement) { const c = getComputedStyle(a); v *= parseFloat(c.opacity) || 0; if (c.visibility === 'hidden') return 0; } return v; }; const out = []; for (const m of document.querySelectorAll('img, video')) { const ok = m.tagName === 'IMG' ? m.complete && m.naturalWidth > 0 : m.readyState >= 2; if (!ok || m.closest('dialog, [hidden], [aria-hidden="true"], nav, a[href], button, [role="tabpanel"], [inert]')) continue; const r = m.getBoundingClientRect(); if (r.width < 64 || r.height < 48 || r.bottom < innerHeight * 0.15 || r.top > innerHeight * 0.85 || getComputedStyle(m).display === 'none') continue; if (op(m) >= 0.1) continue; const cover = [...document.querySelectorAll('img, video, canvas')].some((o) => { if (o === m) return false; const q = o.getBoundingClientRect(); const ov = Math.max(0, Math.min(q.right, r.right) - Math.max(q.left, r.left)) * Math.max(0, Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top)); return ov >= 0.5 * r.width * r.height && op(o) >= 0.5; }); if (!cover) out.push((m.currentSrc || m.getAttribute('src') || m.tagName.toLowerCase()).split('/').pop().slice(0, 60)); } return out; })()`;
  const picsIn = `new Promise(res => { const t0 = performance.now(); const pend = () => [...document.images].filter(i => { if (i.complete || !i.getAttribute('src')) return false; const r = i.getBoundingClientRect(); return r.width > 8 && r.bottom > 0 && r.top < innerHeight; }); (function w() { const p = pend(); if (!p.length || performance.now() - t0 > 3000) res(p.map(i => (i.currentSrc || i.getAttribute('src') || '').split('/').pop().slice(0, 60))); else setTimeout(w, 100); })(); })`;
  // a WebGL ground or object on screen (mounted as it came into view) gets one more settle and two frames to draw its
  // first picture, so it is not shot as its bare ground
  const fxWait = `(() => { const on = [...document.querySelectorAll("canvas, [data-fx], [data-fx-mounted], [data-object], [data-scene], [data-big-scene]")].some(e => { const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < innerHeight; }); return on ? new Promise(r => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => r(1))), ${settle})) : 0; })()`;
  const grab = async () => { const { data } = await S('Page.captureScreenshot', { format: 'png' }); return decodePNG(Buffer.from(data, 'base64')); };
  // the first screen, as the visitor lands on it
  await at(0);
  for (const s of (await ev(picsIn)) || []) slow.add(s);
  await ev(fxWait);
  await ev(inPlace(true));
  for (const g of (await ev(ghostIn)) || []) ghosts.add(g);
  shots.push([0, await grab()]);
  // A header that shrinks or turns fixed once the page scrolls moves everything under it: the element at the foot of
  // the first screen is found again after the first scroll, and every later screen is placed by that shift, so no
  // band is lost or doubled at the first seam and no rows are missing at the end.
  const anchor0 = await ev(`(() => { const free = (e) => { for (let a = e; a && a !== document.body; a = a.parentElement) { const p = getComputedStyle(a).position; if (p === "fixed" || p === "sticky") return false; } return true; }; const e = document.elementsFromPoint(innerWidth / 2, innerHeight - 6).find((x) => x !== document.body && x !== document.documentElement && free(x)); window.__shootAnchor = e || null; return e ? e.getBoundingClientRect().top + scrollY : null; })()`);
  await at(Math.min(VH, H - VH)); await ev(inPlace(false));
  let shift = anchor0 == null ? 0 : Math.round(anchor0 - await ev(`(() => { const e = window.__shootAnchor; return e && e.isConnected ? e.getBoundingClientRect().top + scrollY : ${anchor0}; })()`));
  if (Math.abs(shift) > 400) shift = 0; // not a header settling: something else moved
  const H1raw = await ev('Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))');
  const H1 = Math.min(CAP, H1raw);
  const HI = Math.min(CAP, Math.max(VH, H1 + shift)); // the stitched picture's height
  const cut = Math.max(fullH, H1raw + shift) > CAP ? Math.max(fullH, H1raw + shift) : 0;
  // a held stage (sticky, nearly the screen): the scroll positions where it starts and stops being held; a screen is
  // put on each, so the stage shows whole every time (as the visitor sees it held), never cut at a seam
  const held = await ev(`(() => { const out = []; for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (c.position !== 'sticky') continue; const r = e.getBoundingClientRect(); if (r.width < innerWidth * 0.6 || r.height < innerHeight * 0.6) continue; const p = e.parentElement.getBoundingClientRect(), top = parseFloat(c.top) || 0; const a = Math.round(p.top + scrollY - top), b = Math.round(p.bottom + scrollY - r.height - top); if (b > a) out.push([a, b]); } return out; })()`);
  const stops = held.flat().map((v) => v + shift);
  // covered rows of the picture, as [from, to) bands
  const covered = [[0, Math.min(HI, shots[0][1].h)]];
  const cover = (a, b) => { covered.push([a, b]); covered.sort((p, q) => p[0] - q[0]); for (let i = 0; i + 1 < covered.length;) { if (covered[i + 1][0] <= covered[i][1]) { covered[i][1] = Math.max(covered[i][1], covered[i + 1][1]); covered.splice(i + 1, 1); } else i++; } };
  const firstGap = () => { let y = 0; for (const [a, b] of covered) { if (a > y) return y; y = Math.max(y, b); } return y < HI ? y : null; };
  // a later screen: asked for picture row p (page row p - shift), placed where the page really scrolled to
  const snap = async (p) => {
    const y = Math.max(0, Math.min(p - shift, H1 - VH));
    let sy = await at(y);
    // a scroll that did not arrive (a script easing it, a page that grew): once more, a little longer
    if (Math.abs(sy - y) > 2) { await sleep(settle); sy = await at(y); }
    for (const s of (await ev(picsIn)) || []) slow.add(s);
    await ev(fxWait);
    await ev(inPlace(false));
    for (const g of (await ev(ghostIn)) || []) ghosts.add(g);
    const img = await grab(), top = sy + shift;
    shots.push([top, img]); cover(top, Math.min(HI, top + img.h));
    return top;
  };
  for (let p = shots[0][1].h, prev = 0; shots.length <= 60 && p < HI;) {
    // the next seam: one screen on, or sooner where a held stage starts or stops being held
    const next = Math.min(p, ...stops.filter((s) => s > prev && s < p));
    const top = await snap(next);
    if (top + VH >= HI || top <= prev) break; // the end, or a page that will not scroll further
    prev = top; p = top + VH;
  }
  // rows no screen covered (the page scrolled elsewhere than asked): shot again where they start
  const gaps = [];
  for (let tries = 0, g; (g = firstGap()) !== null && tries < 12; tries++) {
    const top = await snap(g);
    if (top > g || top + VH <= g) { const end = covered.find(([a]) => a > g)?.[0] ?? HI; gaps.push([g, end]); cover(g, end); }
  }
  try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch { /* closing */ }
  const px = Buffer.alloc(W * HI * 4);
  for (const [top, img] of shots) {
    const rows = Math.min(img.h, HI - top);
    for (let r = 0; r < rows; r++) img.px.copy(px, ((top + r) * W) * 4, r * img.w * 4, r * img.w * 4 + Math.min(img.w, W) * 4);
  }
  // rows that could not be reached are drawn as a hatched band, never left transparent
  for (const [a, b] of gaps) for (let yy = a; yy < Math.min(b, HI); yy++) for (let x = 0; x < W; x++) { const o = (yy * W + x) * 4, on = ((x + yy) >> 4) & 1; px[o] = on ? 230 : 200; px[o + 1] = on ? 60 : 40; px[o + 2] = on ? 60 : 40; px[o + 3] = 255; }
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, encodePNG(W, HI, px));
  console.log(`saved ${out} (${W}x${HI}, ${shots.length} screens)${overflowX ? '\nWARNING: the page scrolls sideways at this width' : ''}${gaps.length ? `\nWARNING: rows ${gaps.map(([a, b]) => `${a}-${b}`).join(', ')} could not be scrolled to (drawn hatched red)` : ''}${slow.size ? `\nWARNING: still loading 3 s after they came on screen (their frames may show empty): ${[...slow].join(', ')}` : ''}${ghosts.size ? `\nWARNING: loaded but invisible on screen (under 0.1 opacity or hidden: their frames show only the ground): ${[...ghosts].join(', ')}` : ''}${cut ? `\nWARNING: the page is ${cut}px tall and the picture stops at ${CAP}px: its end (the closing call, the footer) is not in it` : ''}${tileLine}`);
  if (logs.length) console.log(logs.slice(0, 8).join('\n'));
} catch (e) {
  console.error('shoot:', e.message);
  process.exitCode = 1;
} finally {
  clearTimeout(guard);
  await sleep(400);
  kill();
  server?.close();
}
