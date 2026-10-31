#!/usr/bin/env node
// tasteskill / inspect — render the page in a real browser, measure it, and photograph it.
//
//   node inspect.mjs <url | path/to/file.html> [--out DIR] [--widths 1440,768,390] [--allow rule,rule] [--app] [--film] [--json]
//
// Every width is walked to the foot of the page, one screen at a time (up to 40 screens; a longer page is
// sampled evenly), and every screen is photographed into the page sheets and checked.
//
// --film also photographs the scroll as a visitor sees it (a frame every third of a screen, real wheel
// input) into desktop-film-NN.jpg, so a scroll scene is judged by its in-between states: a short line held
// with nothing new (line-holds) and held frames that are mostly empty ground (held-dead-screen). A direction
// that dealt scroll scenes or a product replay switches it on by itself, and so does a page with a [data-replay]:
// every beat of the replay must show in the film (replay-unseen).
//
// Round 6 checks: a section heading alone in its column or on its screen (lone-heading), a list drawn as boxes
// (boxed-list), switches, checkboxes and sliders that change nothing when used (decorative-control: each is used
// once and put back), and a product replay that is small (replay-small) or not held while it plays
// (replay-not-held).
//
// Round 7: the product replay beat by beat. On desktop each beat it shows is photographed with its stage held and
// any drawn cursor hidden, and compared with the beat before inside the window: a replay most of whose beats barely
// change the screen fails, one faint beat warns (replay-faint), and a held stage with empty bands round it fails
// (replay-bands). Its beats are
// laid side by side in desktop-replay-NN.jpg, at a size the words can be read. From the page itself: type under 14px
// in the window (replay-type), a drawn cursor (replay-cursor), boxes in the window (replay-nested), an item that
// changes among its look-alikes (replay-lookalike) and the accent on what does not change (replay-accent).
//
// Round 9: every picture the page asks for and does not get (404, any way it is asked for: img, srcset, a CSS
// background, a preload, an Image() built in script) fails (missing-image). At every width each screen of the walk
// measures the text that lies on a photograph against the pixels under its letters (text-on-photo); on a phone a
// heading set in letters that a screen shows mid-way, letters still turned, moved or faded once it rests, fails
// (letters-mid-reveal); on desktop a wall of six or more tiles is photographed and fails when three fills or more
// colour it (tile-wall). From the page: a split hero's headline under 5vw (split-hero-title), placeholder streets and
// phones (placeholder-contact), small list and table text (small-body), drawn diagrams (drawn-illustration) and
// lines with dots or a knob that read as sliders (decorative-control).
//
// Round 10 (r9-p44, a roastery page that won and still read as a template): after the film, the page is walked again
// and each screen is looked at once it rests, with a short scroll after it to keep only what held still (so a mask on
// its way in, a picture flying in or a ticker is not at rest), and each running scene at its end. Text cut off by a box
// that clips it fails (clipped-text; display type on one line cropped at the screen's side or its foot is a crop, as the
// library deals it), and so does one picture shown three times or more (repeated-picture: copies, or
// one held while the steps change); a heading followed in its section by one that restates it (restated-heading) and
// one short label shown three times (repeated-label) warn. From the page: the first screen as the generic stack of a
// centred headline, a line, two actions and a rounded picture card fails (template-hero), and a visit block with
// no street, district or map link warns (visit-without-directions).
//
// Round 10, part B (r9-p41 a notes app, r9-p42 Haulet, r9-p43 Hvít; each won and read as a template): from the page
// as built, three framed elements in one section fail and two warn (framed-elements: the product's window alone is the
// section's one frame); a row of big figures over short labels (stats-band), two email fields (duplicate-form), three
// sections in a row with the same picture/text split (repeated-split), a column that runs out beside one that runs on
// (empty-left), a picture with no entry in the page's credits (uncredited-picture) and a control on the first screen
// that changes nothing when used (dead-control) warn. Any gradient fails, a scrim or a faded mask too, and so does a
// pale or coloured veil on a photograph at rest (gradient); violet, lavender and periwinkle fail on the accent and on
// any large fill (palette-purple); running text under 4.5:1 fails (contrast); a list's labels count as list text
// (small-body). A replay beat that changes under 15% of its window is faint (replay-faint), and a held stage's heading
// cut off above a tablet or phone screen fails (held-heading-cut). Lists drawn as boxes and framed elements inside
// scenes are looked for in the scenes' finished compositions, on the reduced-motion page.
//
// Round 11 (Leon, 29 October: cluttered pages, too much text, cards wanted): cards on a fill pass in any number; a box in
// a box, a box laid on a photograph with half of itself, a box cut to a shape (a ticket, a torn edge), three
// outlined boxes in a section and three product windows on the first screen fail (framed-elements), and so does a list of such boxes (boxed-list) and a page built of
// nothing but boxes (boxed-page). At 1440 and 390 the next section showing on the first screen, or the fold cutting through
// a line of words, fails (hero-not-alone); on desktop under 12% of the screen between two sections warns and under 6%
// fails (section-air). At rest, a window, a box or a picture that runs into one side of the screen while the page keeps
// its margin fails (edge-run; a plain picture as tall as its section or a wide field flush with one side warns). A strip over the navigation
// (announcement-bar) and a sentence or an item over three words in the bar (nav-sentence) fail. Words: the first screen 30
// at most, a section 60 outside its lists, the page about 500, the headline 12; half as much again fails (wordy-hero,
// wordy-section, wordy-page, hero-words). The template stack counts a row of two or three cards under the line, actions
// or not (template-hero), and a picture cut hard while it carries lettering or shows the work warns (cropped-lettering).
//
// Round 11b (r11-p51, a portfolio on seven grounds and panels with its work as type cards): on desktop, four tones on the
// page's grounds and large panels warn and five fail, the ink, the accent and the dealt fields aside (surface-count, now
// one measurement); where section 0 dealt a footer, one that is a single row of words or under 160px tall fails
// (footer-not-as-dealt); a portfolio whose work shows fewer than three pictures of the work or slots marked for them
// warns (portfolio-without-work).
//
// Round 11c (Leon: three button shapes at one size, a plain bar that hides on scroll; r12-p53, r12-p54, r12-p52): on
// desktop, more than two button shapes on the page (by corner and kind; the bar's, a card's or a form's height is the same
// shape) fail (button-family); the navigation is read at load, past the hero on the way down (a dealt side index or dock
// that has stepped aside is read again a screen later) and after a short scroll back up, and a form other than the one
// section 0 dealt fails, and so does a bar that hides on scroll, which warns where none was dealt (nav-not-as-dealt);
// three sections built round the same thing warn and four fail (same-structure); and four sections or more after the
// hero, all but one standing in a box, a product window counted, warn (boxed-page).
//
// Round 11d (r12-p55, p57 and p58: another business's product, rooms or work shown as the client's, and four grounds
// passed): on desktop the grounds are read at every screen of the walk and counted by the screens they cover, the ink, a
// dealt field and the accent once past a band, a band sampled from a photograph like any tone, and a ground the dealt
// pieces ask for named and never failing alone; three warn and four fail (surface-count). A picture shown as the
// client's (a marked slot, their name in its caption, the work, a room, the house, their own place, anything on a page
// that sells one product of its own) whose credit names a business fails, and so do a photograph in the product's frame
// that is not theirs and, on a page dealt no product photograph, a picture whose title names a product of its kind
// (credit-names-business); a photograph credited to another among the work fails too (portfolio-without-work). At 1440
// and 390 the hero's title whose letters run on under the foot of the first screen fails at any size (hero-cut).
//
// Round 11e (review-006: two buttons to one place on four pages of six; r13-p59's footer of word processors and style
// guides; r13-p60's folder tabs and round monogram): on desktop, one place twice on one screen fails, a button and another
// action by the same address or label, in one block or two (in the bar only its buttons count), read at every screen of
// the walk and, for what stands in the page, within one screen's height at the top after it (duplicate-action); footer
// links to other companies' products or sites warn, and fail at three (footer-other-sites); and button-family counts a
// tab or a toggle drawn as a folder tab and a monogram drawn round, the bar read again past the hero.
//
// Round 11f (r14-p63: a private person's room as Hvit's, sun hours cut in half, Send request stranded on a moor; r14-p64's
// row of three grey cards three times; r14-p66's cream footer beside a band sampled from a photograph): at rest, a figure
// cut by its box fails at any size, never a crop (cut-figure), and a button on a busy photograph warns (button-on-photo);
// on desktop, a picture by another in a room, house, product or work slot whose credit, title or alt names a room or a
// home warns (room-not-theirs), and so does one by another whose words name a drink or a dish its section prices
// (menu-not-theirs); same-structure counts a footer of three cards or more; surface-count counts the ink's, a field's
// or the accent's band once a band no role names has taken the page's one; nav-not-as-dealt knows the toolbar of the
// hero's product window, held or scrolling with it; button-family reads a dog-ear's folded corner as one shape; and
// hollow-box reads the product's frame alone, a box holding its name and a few facts.
//
// --app judges an app screen (dashboard, admin, settings) by the rules in references/app-screens.md; a
// direction dealt with draw.mjs --app switches it on by itself.
//
// Exit code 0 = no FAIL findings. Exit code 1 = at least one FAIL (the page is not done).
// Zero dependencies: drives an installed Chrome/Edge/Chromium. Node 22+.
// Widths sharing a viewport class receive width-qualified screenshot filenames.
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, createReadStream, readdirSync, unlinkSync } from 'node:fs';
import { resolve, join, relative, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { Browser, sleep } from './lib/cdp.mjs';
import { probe, frame, reach, layout, app, colourShare, groundShare, cellDiff } from './lib/probe.mjs';
import { judge, judgeLayout, judgeApp, APP_SKIP } from './lib/rules.mjs';
import { extra, controls, replayState, photoText, photoTextDone, photoContrast, splitLetters, tileFills } from './lib/probe-extra.mjs';
import { judgeExtra, judgeBuild, navKind } from './lib/rules-extra.mjs';
import { restLook, restStops, restGo, heroStack, visitBlocks, photoBusy } from './lib/probe-rest.mjs';
import { pageBuild, deadControls, space, navBar, crops, groundPoints, grounds, footing, workShown, pictureCredits, navForm, buttonShapes, structures, samePlace, footerLinks } from './lib/probe-page.mjs';
import { viewportClass as name, screenshotLabel, isInspectionScreenshot } from './lib/inspection-files.mjs';
import { PRODUCT_WORD } from './lib/business.mjs';

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); if (i === -1) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const has = (name) => { const i = args.indexOf('--' + name); if (i === -1) return false; args.splice(i, 1); return true; };
const outDir = resolve(flag('out', '.taste-skill/inspect'));
const widths = flag('widths', '1440,768,390').split(',').map(Number).filter(Boolean);
let allow = flag('allow', '').split(',').filter(Boolean);
const asJson = has('json');
let appMode = has('app');
let film = has('film');
let dealtFonts = []; // the faces the saved sheet dealt, to catch a build that quietly fell back to a default
let dealtEntrance = null; // the entrance the saved sheet dealt, to catch a build that quietly went back to the old rise
let dealtReplay = null; // the product replay the saved sheet dealt (software pages), to catch a build without it
let dealtFooter = null; // the footer section 0 dealt, to catch a build that went back to one line
let dealtNav = null; // the navigation section 0 dealt, to catch a build that went back to a plain bar
let dealtPalette = null; // the dealt ink, accent and fields, which may stand as bands beside the ground and its surface
let sector = null; // the brief's sector: a portfolio shows its work in pictures
const PORTFOLIO = ['studio-portfolio', 'personal-portfolio', 'agency', 'architecture']; // (as draw.mjs deals them)
let client = null; // the client's name, as the brief opens it ("Hvit: a small guesthouse"): a picture captioned with it is theirs
let ownsProduct = false; // a page that sells one product of its own: every picture on it stands beside that product
let ownPlace = false; // a café's, a restaurant's or a house's page: a section named for its own place shows it as theirs
let hasOwn = false; // the client gave pictures of their own (--have photography or product-photo), which carry no credit
let productKind = null; // on a page dealt no photograph of its product, the words for a product of its kind
let dealtAsk = null; // the grounds the dealt pieces ask for beside the page's ground and its surface
const nameOf = (brief) => { const n = String(brief || '').split(/[:,;.(]/)[0].trim(); return n && n.split(/\s+/).length <= 4 ? n : null; };
// the words for the product's kind: its trade's (library/photos.json, as draw.mjs deals the pictures) and the brief's own
// product words ("cargo bike" gives bike, bikes)
const kindOf = (d) => {
  let trade = null;
  try { trade = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'library', 'photos.json'), 'utf8')).trades?.find((t) => t.name === d.photos?.trade?.name)?.product || null; } catch {}
  const words = [...new Set(String(d.input?.brief || '').split(/[^\p{L}-]+/u).filter((w) => PRODUCT_WORD.test(w)).map((w) => { w = w.toLowerCase(); return /(?:ch|sh|x|ss)es$/.test(w) ? w.slice(0, -2) : w.replace(/s$/, ''); }))];
  return [trade, words.length ? `\\b(?:${words.join('|')})(?:e?s)?\\b` : null].filter(Boolean).join('|') || null;
};
// the grounds a dealt hero, section, frame part, scene or technique asks for beside the page's ground and its surface, by
// the id of the first that asks: a veil, a window or a band in the accent (lib-0312, one-figure-reforms), the ground and
// the ink swapped (lib-0312), a ground sampled from a photograph (shaped-edge-ground-change). surface-count names them,
// and they fail nothing alone (r11-p49, published, failed on the sky-blue chapter its scene asks for)
const ASK = {
  accent: /\b(?:veil|window|sheet|band|field|panes?)\b[^.;"]{0,40}\b(?:in|on|is|to) the (?:page's )?(?:single )?accent\b|\bveil the page's single accent\b/i,
  ink: /\bswap(?:s|ped|ping)? (?:the )?(?:page's )?ground and (?:the )?ink\b|\bground, ink and chrome swap|\bpaper-on-ink\b|\bink-on-paper\b/i,
  sampled: /\b(?:ground|field|band)\b[^.;"]{0,30}\bsampled from\b|\bin the sky's colour\b/i,
};
const groundsAsked = (parts) => { const out = {}; for (const p of parts) { if (!p || typeof p !== 'object') continue; const t = JSON.stringify(p); for (const [k, re] of Object.entries(ASK)) if (!out[k] && re.test(t)) out[k] = p.id || p.name || 'the deal'; } return out; };
const target = args[0];
if (!target || target === '-h' || target.startsWith('--')) {
  console.error('usage: node inspect.mjs <url | file.html> [--out DIR] [--widths 1440,768,390] [--allow rule,rule] [--app] [--film] [--json]');
  process.exit(2);
}
// Allowances granted by the drawn direction (written by draw.mjs) apply automatically.
for (const p of ['.taste-skill/direction.json', join(outDir, '..', 'direction.json')]) {
  if (existsSync(p)) { try { const d = JSON.parse(readFileSync(p, 'utf8')); allow = [...new Set([...allow, ...(d.allow || [])])]; if (d.kind === 'app') appMode = true; if (Array.isArray(d.scenes) && d.scenes.length) film = true; dealtFonts = (d.input?.keep || []).includes('type') ? [] : d.kind === 'app' ? [d.style?.tokens?.font?.family].filter(Boolean) : [d.type?.display?.family, d.type?.text?.family].filter(Boolean); dealtEntrance = d.kind === 'app' ? null : d.entrance?.id || null; dealtReplay = d.kind === 'app' ? null : d.replay || null; dealtFooter = d.kind === 'app' ? null : d.frame?.footer?.id ? d.frame.footer : null; dealtNav = d.kind === 'app' ? null : d.frame?.nav?.id ? d.frame.nav : null; dealtPalette = d.palette ? { ink: d.palette.ink, accent: d.palette.accent, surface: d.palette.surface, fields: (d.palette.fields || []).map((f) => f.bg) } : null; sector = d.input?.sector || null; client = nameOf(d.input?.brief); ownsProduct = d.imagery === 'no-product-photo' || d.input?.sector === 'physical-product'; ownPlace = ['restaurant', 'hospitality', 'real-estate'].includes(sector); hasOwn = (d.input?.have || []).some((h) => /photo/.test(h)); productKind = d.imagery === 'no-product-photo' ? kindOf(d) : null; dealtAsk = d.kind === 'app' ? null : groundsAsked([d.hero, ...(d.sections || []), ...Object.values(d.frame || {}), ...(d.scenes || [])]); } catch {} break; }
}
// A local file is served over http from a throwaway server on 127.0.0.1, so the browser never has to
// open a file path (some sandboxes show Node and the browser different views of the disk) and relative
// assets, fetch() and module scripts behave as they will when the page is hosted.
let url = target; let server = null;
if (!/^https?:\/\//.test(target)) {
  const file = resolve(target);
  if (!existsSync(file)) { console.error('No such file: ' + file); process.exit(2); }
  const cwd = resolve('.');
  // serve from high enough that the page's ../ references resolve (a scene demo loads ../stage.js)
  const ups = Math.max(0, ...[...readFileSync(file, 'utf8').matchAll(/(?:src|href)\s*=\s*["']((?:\.\.\/)+)/g)].map((m) => m[1].length / 3));
  let base = dirname(file); for (let i = 0; i < ups; i++) base = dirname(base);
  const root = file.startsWith(cwd + sep) && (base === cwd || base.startsWith(cwd + sep)) ? cwd : base;
  const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
  server = createServer((req, res) => {
    try {
      let f = resolve(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
      if (f !== root && !f.startsWith(root + sep)) { res.writeHead(403); return res.end(); }
      if (statSync(f).isDirectory()) f = join(f, 'index.html');
      res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': statSync(f).size, 'cache-control': 'no-store' });
      createReadStream(f).pipe(res);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/${relative(root, file).split(sep).map(encodeURIComponent).join('/')}`;
}
const HEIGHT = { 1440: 900, 1280: 800, 1024: 768, 768: 1024, 390: 844, 375: 812 };

mkdirSync(outDir, { recursive: true });
// Screenshots from an earlier run would sit beside the new ones when the page got shorter.
for (const f of readdirSync(outDir)) if (isInspectionScreenshot(f)) unlinkSync(join(outDir, f));
const browser = await Browser.launch();
const helper = await browser.newPage({ width: 1600, height: 1000 });
const report = { url: server ? target : url, at: new Date().toISOString(), allow, viewports: [], findings: [], images: [] };

const MOTION_MIN = 8, MOTION_GOOD = 16; // distinct moving elements over load + one scroll through the page
const MAX_SCREENS = 40; // screens photographed and checked at each width; a longer page is sampled evenly
// Runs in the page before any of its own scripts: counts the distinct elements that actually move while
// the page loads and is scrolled (CSS animations, CSS transitions, Web Animations, and script-driven
// transform/opacity changes such as GSAP), so a page that never moves can be told from one that does.
const MOTION_RECORDER = `(() => {
  const seen = new WeakSet(); const c = { elements: 0, css: 0, transitions: 0, scripted: 0 };
  const note = (t, k) => { if (!(t instanceof Element) || seen.has(t)) return; seen.add(t); c.elements++; c[k]++; };
  addEventListener('animationstart', (e) => note(e.target, 'css'), true);
  addEventListener('transitionrun', (e) => note(e.target, 'transitions'), true);
  const watch = () => new MutationObserver((list) => { for (const m of list) { const s = m.target.getAttribute && m.target.getAttribute('style') || ''; if (/transform|translate|opacity|scale|rotate|clip-path/.test(s)) note(m.target, 'scripted'); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['style'], subtree: true });
  if (document.documentElement) watch(); else addEventListener('DOMContentLoaded', watch);
  window.__motionSample = () => { for (const a of document.getAnimations ? document.getAnimations() : []) { const t = a.effect && a.effect.target; if (t) note(t, a.constructor && a.constructor.name === 'CSSTransition' ? 'transitions' : 'css'); } };
  window.__motion = () => { window.__motionSample(); const v = [...document.querySelectorAll('video')]; return { ...c, videos: v.length, playingVideos: v.filter((x) => x.autoplay || !x.paused).length }; };
})();`;

// Is the page's title on screen and readable: in the viewport, not faded, not masked away?
const TITLE_SEEN = `(() => {
  const h = document.querySelector('h1'); if (!h) return { found: false };
  const r = h.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return { found: true, visible: false, why: 'it has no size yet' };
  if (r.bottom < 0 || r.top > innerHeight) return { found: false }; // a title below the first screen is the no-title check's business
  let o = 1; for (let p = h; p && p !== document.documentElement; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || cs.display === 'none') return { found: true, visible: false, why: 'it is hidden' }; o *= +cs.opacity; }
  if (o < 0.5) return { found: true, visible: false, why: 'it is at ' + Math.round(o * 100) + '% opacity' };
  // text moved out of its own masked line, or a cover lying over it, shows up as nothing at its centre
  const range = document.createRange(); range.selectNodeContents(h); const rr = range.getBoundingClientRect();
  const x = Math.min(innerWidth - 1, Math.max(0, rr.left + rr.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, rr.top + Math.min(rr.height, 80) / 2));
  const hit = document.elementFromPoint(x, y);
  if (hit && !h.contains(hit) && !hit.contains(h)) { const cs = getComputedStyle(hit); if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || /^(IMG|VIDEO|CANVAS)$/.test(hit.tagName)) return { found: true, visible: false, why: 'something lies over it' }; }
  return { found: true, visible: true };
})()`;

// The entrance the page carries, and any headline line of a masked or covered entrance that wraps at this width
// (a wrapped line gets one block across the whole column, or two lines rise as one).
const ENTRANCE_SEEN = `(() => {
  const id = document.body ? document.body.dataset.entrance || null : null;
  const wrapped = [...document.querySelectorAll('[data-e="headline"] [data-line]')].filter((el) => {
    const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    return el.getClientRects().length > 1 || el.getBoundingClientRect().height > lh * 1.6;
  }).map((el) => el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 48));
  return { id, wrapped };
})()`;

// How many times one element is shown, from its sightings at rest in scroll order ({ y, t, seen }: the scroll, its top
// on the screen, and what else the screen showed): a sighting is a new showing when the element stands more than half
// a screen from where the page last showed it, so it was held while the page moved on under it, and something new
// arrived beside it (r9-p44's roaster photograph under each of the four steps). An element that simply scrolls past,
// or a held one with nothing new beside it, is shown once.
function showings(list, h) {
  let n = 0, last = null; const at = [];
  for (const x of [...list].sort((a, b) => a.y - b.y)) {
    const doc = x.y + x.t;
    if (last == null || (Math.abs(doc - last.doc) > h * 0.5 && (!x.seen || !last.seen || x.seen.some((s) => !last.seen.includes(s))))) { n++; at.push(Math.round(x.y / h) + 1); last = { doc, seen: x.seen }; }
  }
  return { n, at };
}
const wordSet = (t) => new Set(String(t).toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean));

async function sheet(frames, cols, cellW, cellH, path) {
  const rows = Math.ceil(frames.length / cols);
  await helper.setViewport({ width: cols * cellW, height: rows * cellH, dsf: 1 });
  await helper.eval((a) => {
    document.body.style.cssText = `margin:0;background:#888;display:grid;grid-template-columns:repeat(${a.cols},${a.cellW}px)`;
    document.body.innerHTML = a.frames.map((s) => `<img src="data:image/jpeg;base64,${s}" style="width:${a.cellW}px;height:${a.cellH}px;display:block;outline:1px solid #888">`).join('');
    return Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  }, { frames, cols, cellW, cellH });
  await helper.screenshot({ path, quality: 76 });
}

// The product replay, beat by beat (replay-faint, replay-bands). A held replay is scrolled to the middle of each
// beat's stretch of its hold; one on its own clock is put in the middle of the screen and played from its Replay
// button, each new state taken once it rests. Every state is photographed twice, the second time with any drawn
// cursor hidden, after its change has run (2s); a beat is then the part of the window that changed since the beat
// before, as a share of the window's part on the screen (cellDiff measures it against the screen).
const HIDE_CURSOR = `(() => { if (!document.getElementById('ts-hide-cursor')) { const s = document.createElement('style'); s.id = 'ts-hide-cursor'; s.textContent = '[data-replay-cursor], .replay__cursor { visibility: hidden !important; }'; document.head.appendChild(s); } return 1; })()`;
const SHOW_CURSOR = `(() => { const s = document.getElementById('ts-hide-cursor'); if (s) s.remove(); return 1; })()`;
async function replayBeats(page, i, w, h) {
  const state = () => page.eval(replayState, i).catch(() => null);
  const shoot = async (s) => {
    const cursor = s.cursor ? await page.screenshot({ format: 'png' }) : null;
    await page.eval(HIDE_CURSOR).catch(() => {});
    const png = await page.screenshot({ format: 'png' });
    await page.eval(SHOW_CURSOR).catch(() => {});
    return { ...s, png, cursorPng: cursor };
  };
  const states = [];
  const s0 = await state();
  if (!s0) return null;
  if (s0.held && s0.beat != null) {
    // where on the page each beat shows with the stage held (scanned once), then each beat from the middle of its stretch
    const span = await page.eval(`(() => { const r = document.querySelectorAll('[data-replay]')[${i}]; const p = r.closest('.replay-stage').parentElement.getBoundingClientRect(); return { top: Math.round(p.top + scrollY), bottom: Math.round(p.bottom + scrollY) }; })()`);
    const at = new Map(), stepY = Math.max(24, Math.round(h * 0.04));
    for (let y = Math.max(0, span.top - h); y <= span.bottom; y += stepY) {
      await page.eval(`window.scrollTo({ top: ${y}, behavior: 'instant' })`).catch(() => {});
      await sleep(45);
      const s = await page.eval(`(() => { const r = document.querySelectorAll('[data-replay]')[${i}]; const st = r.closest('.replay-stage'); return [r.dataset.beat ?? null, Math.abs(st.getBoundingClientRect().top - (parseFloat(getComputedStyle(st).top) || 0)) < 2, Math.round(scrollY)]; })()`).catch(() => null);
      if (!s || s[0] == null || !s[1]) continue;
      const g = at.get(+s[0]) || { from: s[2], to: s[2] }; g.to = s[2]; at.set(+s[0], g);
    }
    for (const k of [...at.keys()].sort((a, b) => a - b)) {
      const g = at.get(k);
      await page.eval(`window.scrollTo({ top: ${Math.round((g.from + g.to) / 2)}, behavior: 'instant' })`).catch(() => {});
      await sleep(2000);
      const s = await state();
      if (s && s.beat != null && +s.beat === k) states.push({ k, ...(await shoot(s)) });
    }
  } else {
    // on its own clock: in the middle of the screen, played once from its Replay button
    const list = await page.eval(`String(document.querySelectorAll('[data-replay]')[${i}].dataset.replay || '')`).catch(() => '');
    const ms = String(list).split(',').map(Number).filter((n) => n > 0);
    const total = (ms.length === 1 && ms[0] <= 8 ? ms[0] * 1200 : ms.reduce((a, b) => a + b, 0)) + 2500;
    await page.eval(`(() => { const r = document.querySelectorAll('[data-replay]')[${i}]; const b = r.getBoundingClientRect(); window.scrollTo({ top: Math.max(0, Math.round(b.top + scrollY - (innerHeight - b.height) / 2)), behavior: 'instant' }); return 1; })()`).catch(() => {});
    await sleep(900);
    const pressed = await page.eval(`(() => { const r = document.querySelectorAll('[data-replay]')[${i}]; const sc = r.closest('.replay-stage, .replay-hold, section, article, [data-replay-scope]') || r.parentElement; const b = sc && (sc.querySelector('[data-replay-again]') || [...sc.querySelectorAll('button')].find((x) => /replay|again/i.test(x.textContent))); if (!b) return false; b.click(); return true; })()`).catch(() => false);
    if (!pressed) return { states: [], clock: true };
    await sleep(120);
    let s = await state(); if (!s) return null;
    states.push({ k: 0, ...(await shoot(s)) });
    // (compared with the state as photographed, so a change that lands while a photograph is taken is still seen)
    let last = s.sig, k = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < total && k < 6) {
      await sleep(90);
      const now = await state(); if (!now || now.sig === last) continue;
      // a change: taken once its parts have rested for 450ms (1.6s at most)
      let rest = now.sig, since = Date.now();
      for (const t1 = Date.now(); Date.now() - t1 < 1600;) { await sleep(110); const x = await state(); if (!x) break; if (x.sig !== rest) { rest = x.sig; since = Date.now(); } else if (Date.now() - since >= 450) break; }
      s = await state(); if (!s) break;
      states.push({ k: ++k, ...(await shoot(s)) });
      last = s.sig;
    }
  }
  // each beat against the one before, inside the window, with the stage where it was
  const diffs = [];
  for (let j = 1; j < states.length; j++) {
    const a = states[j - 1], b = states[j];
    if (Math.abs(a.win.y - b.win.y) > 2 || Math.abs(a.win.x - b.win.x) > 2 || !b.win.w) { diffs.push({ k: b.k, cells: null }); continue; }
    const d = await helper.eval(cellDiff, ['data:image/png;base64,' + a.png, 'data:image/png;base64,' + b.png, b.win, w, h]).catch(() => null);
    const dc = a.cursorPng && b.cursorPng ? await helper.eval(cellDiff, ['data:image/png;base64,' + a.cursorPng, 'data:image/png;base64,' + b.cursorPng, b.win, w, h]).catch(() => null) : null;
    diffs.push({ k: b.k, cells: d ? d.cells : null, withCursor: dc ? dc.cells : null });
  }
  return { states, diffs, clock: !(s0.held && s0.beat != null) };
}
// The beats of one replay side by side, each the window as photographed, at a size its words can be read
async function replaySheet(rb, w, h, path) {
  const tiles = rb.states.filter((s) => s.win.w > 8 && s.win.h > 8);
  if (!tiles.length) return null;
  const tileW = 720, cols = tiles.length > 1 ? 2 : 1, sc = tileW / Math.max(...tiles.map((s) => s.win.w));
  const tileH = Math.round(Math.max(...tiles.map((s) => s.win.h)) * sc);
  const label = (s) => { const d = rb.diffs.find((x) => x.k === s.k); return `${rb.clock ? 'Change' : 'Beat'} ${s.k}` + (d && d.cells != null ? ` · ${Math.round(Math.min(1, (d.cells * w * h) / Math.max(1, s.win.w * s.win.h)) * 100)}% of the window changed` : s.k === 0 ? (rb.clock ? ' · as Replay was pressed' : ' · the first state') : ' · not measured: the stage moved'); };
  await helper.setViewport({ width: cols * tileW + (cols + 1) * 16, height: Math.ceil(tiles.length / cols) * (tileH + 40) + 16, dsf: 1 });
  await helper.eval((a) => {
    document.body.style.cssText = `margin:0;padding:16px;background:#777;display:grid;grid-template-columns:repeat(${a.cols},${a.tileW}px);gap:16px;font:600 16px/24px system-ui,sans-serif;color:#fff`;
    document.body.innerHTML = a.tiles.map((t) => `<div><div>${t.label}</div><div style="position:relative;overflow:hidden;width:${Math.round(t.win.w * a.sc)}px;height:${Math.round(t.win.h * a.sc)}px"><img src="data:image/png;base64,${t.png}" style="position:absolute;left:${-t.win.x * a.sc}px;top:${-t.win.y * a.sc}px;width:${a.vw * a.sc}px;height:${a.vh * a.sc}px;max-width:none"></div></div>`).join('');
    return Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  }, { tiles: tiles.map((s) => ({ png: s.png, win: s.win, label: label(s) })), cols, tileW, sc, vw: w, vh: h });
  await helper.screenshot({ path, quality: 80 });
  return path;
}

try {
  for (const w of widths) {
    const h = HEIGHT[w] || Math.round(w * 0.625);
    const label = name(w);
    const imageLabel = screenshotLabel(w, widths);
    const page = await browser.newPage({ width: w, height: h, dsf: 1, mobile: w < 600 });
    await page.send('Page.addScriptToEvaluateOnNewDocument', { source: MOTION_RECORDER }).catch(() => {});
    // every picture the page asks for and does not get (missing-image): a 4xx answer or a file not found, whether an
    // img, a srcset candidate, a CSS background, a preload or an Image() built in script asked for it
    const missingPics = new Map(), asked = new Map();
    const isPicture = (type, u) => !/^data:/.test(u) && (type === 'Image' || /\.(jpe?g|png|webp|avif|gif|svg|jxl|heic)(\?|#|$)/i.test(u));
    await page.send('Network.enable').catch(() => {});
    const netOff = [
      browser.on(page.sessionId, 'Network.requestWillBeSent', (p) => { if (asked.size < 4000) asked.set(p.requestId, { url: p.request.url, type: p.type }); }),
      browser.on(page.sessionId, 'Network.responseReceived', (p) => { const s = p.response.status; if (s >= 400 && s < 500 && isPicture(p.type, p.response.url)) missingPics.set(p.response.url, s); }),
      browser.on(page.sessionId, 'Network.loadingFailed', (p) => { const q = asked.get(p.requestId); if (q && !p.canceled && /ERR_FILE_NOT_FOUND|ERR_INVALID_URL/.test(p.errorText || '') && isPicture(p.type || q.type, q.url)) missingPics.set(q.url, p.errorText); }),
    ];
    const how = await page.goto(url, { timeoutMs: 30000, settleMs: 600 });
    await sleep(600); // about 1.2s after the load event: is the title there to read yet?
    const early = await page.eval(TITLE_SEEN).catch(() => null);
    // a dev server is not what ships: bundlers and minifiers change the CSS a visitor receives
    const devServer = await page.eval(`(() => { const s = [...document.scripts].map((x) => x.src || '').join(' '); if (/@vite\\/client|webpack-dev-server|\\/_next\\/static\\/development\\/|react-refresh|webpack-hmr/.test(s)) return true; try { return !!(window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId === 'development'); } catch { return false; } })()`).catch(() => false);
    await page.eval('document.fonts.ready.then(() => true)').catch(() => {});
    await sleep(800); // let the load choreography finish before judging the first screen
    const fold = join(outDir, `${imageLabel}-fold.jpg`);
    await page.screenshot({ path: fold, quality: 82 });
    const metrics = await page.eval(probe);
    // round 11: the site's bar as the page opens (a bar that hides on the way down may not be back after the walk)
    const navAtLoad = !appMode ? await page.eval(navBar).catch(() => null) : null;
    // round 11c, on desktop: the navigation's form as the page opens; the walk reads it again past the hero (a dealt side
    // index or dock steps aside while a band, a scene or the replay is on the screen, so nothing there is read again)
    const navSeen = w >= 1100 && !appMode ? { load: await page.eval(navForm, 'load').catch(() => null), down: null, up: null, held: 0, aside: ['side index', 'bottom dock'].includes(navKind(dealtNav)?.form) } : null;
    // each product replay's window before the walk: replay.js has not armed it yet, so it shows its final state
    const replayAtLoad = await page.eval(`[...document.querySelectorAll('[data-replay]')].map((r) => { const u = (r.querySelector('[data-ui]') || r).getBoundingClientRect(); return { w: u.width / innerWidth, h: u.height / innerHeight }; })`).catch(() => []);

    // walk the whole page one screen at a time so scroll reveals fire, photographing and checking each screen.
    // A page longer than MAX_SCREENS is walked in even strides, so its last screen is always seen.
    const total = Math.max(1, Math.ceil((metrics.page.height || h) / h));
    const stride = Math.max(1, Math.ceil(total / MAX_SCREENS));
    const frames = [readFileSync(fold).toString('base64')];
    const frameErrors = []; // a check that throws loses its screen; the report keeps why
    const check = (opts) => page.eval(frame, opts).catch((e) => { if (frameErrors.length < 5) frameErrors.push(String(e.message).slice(0, 200)); return null; });
    // text on a photograph against the pixels under its letters (text-on-photo): its words made transparent for one
    // photograph of what lies under them, then put back
    const photoRuns = [];
    const photoCheck = async () => {
      const units = await page.eval(photoText).catch((e) => { if (frameErrors.length < 5) frameErrors.push('photo text: ' + String(e.message).slice(0, 160)); return null; });
      if (!units || !units.length) return;
      let png = null;
      try { png = await page.screenshot({ format: 'png' }); } catch {} finally { await page.eval(photoTextDone).catch(() => {}); }
      if (!png) return;
      const y = await page.eval('Math.round(scrollY || document.scrollingElement.scrollTop || 0)').catch(() => 0);
      const res = await helper.eval(photoContrast, ['data:image/png;base64,' + png, units]).catch(() => null);
      for (const r of res || []) if (r) photoRuns.push({ ...r, y });
    };
    // a heading set in letters on a phone, at each screen once it rests (letters-mid-reveal): measured again after a
    // second when any letter is off, so an entrance still running on its own clock is let finish
    const letterSeen = new Map();
    // each letter against the word's own middle (the median letter): a word that moves or scales as one, a parallax or
    // a line set lower, is not a word coming apart
    const relLetters = (ls) => { const med = (k) => { const v = ls.map((l) => l[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; }; const m = [0, med(1), med(2), med(3) || 1, med(4)]; return ls.map((l) => [l[0], l[1] - m[1], l[2] - m[2], l[3] / m[3], l[4] - m[4]]); };
    // (a letter is off once it is faded under 0.85 or out of place; it reads as gone, a dot, under 0.5 or out of place)
    const letterOff = (size, l, faded = 0.85) => l[0] < faded || Math.abs(l[1]) > Math.max(2, size * 0.08) || Math.abs(l[2]) > Math.max(2, size * 0.08) || Math.abs(l[3] - 1) > 0.06 || Math.abs(l[4]) > 4;
    const letterCheck = async () => {
      if (w >= 600) return;
      let s = await page.eval(splitLetters, {}).catch(() => null); if (!s || !s.length) return;
      if (s.some((x) => relLetters(x.letters).some((l) => letterOff(x.size, l)))) { await sleep(1000); s = (await page.eval(splitLetters, {}).catch(() => null)) || s; }
      const y = await page.eval('Math.round(scrollY || document.scrollingElement.scrollTop || 0)').catch(() => 0);
      for (const x of s) { if (!x.inView) continue; const v = letterSeen.get(x.id) || { text: x.text, size: x.size, at: [] }; v.at.push({ y, top: x.top, chars: x.chars, letters: x.letters, shows: relLetters(x.letters).map((l, i) => (letterOff(x.size, l, 0.5) ? '·' : x.chars[i])).join('') }); letterSeen.set(x.id, v); }
    };
    // the grounds a visitor sees, on desktop at every screen once it rests (surface-count): a veil or a band that holds
    // the screen in a scene counts with the sections' grounds. The first look stands for its screen and each after it for
    // the scroll since the one before (a screen of the walk, the ones a stride passes over, a third of a screen of the
    // film; the foot of the page, reached in less, once)
    const seenGrounds = w >= 1100 && !appMode ? { page: null, tones: new Map() } : null;
    const addGrounds = (acc, g, k) => { acc.page = acc.page || g.page; for (const t of g.tones) { const x = acc.tones.get(t.hex); if (x) { x.n += t.n * k; x.wide = x.wide || t.wide; x.scene = x.scene || t.scene; x.blocks = [...new Set([...x.blocks, ...t.blocks])]; } else acc.tones.set(t.hex, { ...t, n: t.n * k }); } };
    const groundCheck = async (k) => {
      if (!seenGrounds || !(k > 0)) return;
      const g = await page.eval(groundPoints).catch((e) => { if (frameErrors.length < 5) frameErrors.push('grounds: ' + String(e.message).slice(0, 160)); return null; });
      if (g) addGrounds(seenGrounds, g, k);
    };
    // round 11e, on desktop at every screen once it rests: two ways to one place on the screen, the bar, a chip and a
    // sticky stage read where they stand (duplicate-action)
    const seenPlaces = w >= 1100 && !appMode ? [] : null;
    const placeCheck = async () => {
      if (!seenPlaces) return;
      const p = await page.eval(samePlace, { screen: true }).catch((e) => { if (frameErrors.length < 5) frameErrors.push('places: ' + String(e.message).slice(0, 160)); return null; });
      if (p) seenPlaces.push(...p);
    };
    const frameChecks = [await check()];
    await photoCheck(); await letterCheck(); await groundCheck(1); await placeCheck();
    const reached = [await page.eval(reach, metrics.reach).catch(() => null)];
    let upReach = null, atFoot = total <= 1;
    const where = () => page.eval('({ y: Math.round(scrollY || document.scrollingElement.scrollTop || 0), max: Math.round(document.scrollingElement.scrollHeight - innerHeight) })').catch(() => null);
    for (let i = 1, lastY = 0; i <= MAX_SCREENS + 8; i++) {
      const to = `window.scrollTo({ top: ${i * stride * h}, behavior: 'instant' })`;
      await page.eval(to).catch(() => {});
      await page.wheel(2);
      await sleep(650);
      let pos = await where();
      // a smooth-scroll library still easing toward an earlier target can take the jump back: settle it and retry once
      if (pos && pos.y <= lastY + 2 && pos.y < pos.max - 2) { await page.wheel(Math.round(h / 2)); await sleep(1000); await page.eval(to).catch(() => {}); await page.wheel(2); await sleep(650); pos = await where(); }
      if (!pos || pos.y <= lastY + 2) { atFoot = !!pos && pos.y >= pos.max - 2; break; } // the screen before was the end of the page
      const moved = (pos.y - lastY) / h;
      lastY = pos.y;
      frames.push(await page.screenshot({ quality: 78 }));
      frameChecks.push(await check());
      await photoCheck(); await letterCheck(); await groundCheck(moved); await placeCheck();
      reached.push(await page.eval(reach, metrics.reach).catch(() => null));
      await page.eval('window.__motionSample && window.__motionSample()').catch(() => {});
      // once, past the hero on the way down (a screen held by a scene or a sticky stage, where a dock or an index may step
      // aside, is passed over three times at most, and so is any screen with nothing on it where one was dealt), then after
      // a short scroll back up, where a bar that hides comes back
      if (navSeen && !navSeen.down && pos.y >= h * 1.5) {
        const s = await page.eval(navForm, 'down').catch(() => null);
        if (s && (s.form !== 'none' || !(s.held || navSeen.aside) || ++navSeen.held > 3)) {
          navSeen.down = s;
          // round 11e: the bar's buttons as it stands past the hero (a monogram that comes in once the hero has gone)
          navSeen.buttons = await page.eval(buttonShapes, { bar: true, client }).catch(() => null);
          await page.wheel(-240, { step: 120, pauseMs: 30 });
          await sleep(900);
          navSeen.up = await page.eval(navForm, 'up').catch(() => null);
          await page.wheel(240, { step: 120, pauseMs: 30 });
          await sleep(700);
        }
      }
      // once, about two thirds down a long page: back up half a screen, where a bar that hides on the way down returns
      if (upReach === null && total > 6 && pos.y >= pos.max * 0.6) {
        await page.wheel(-Math.round(h / 2), { step: 120, pauseMs: 30 });
        await sleep(900);
        upReach = await page.eval(reach, metrics.reach).catch(() => ({ found: false }));
        await page.wheel(Math.round(h / 2), { step: 120, pauseMs: 30 }); // back down, so a smooth scroller's target is ahead again
        await sleep(1000);
      }
      if (pos.y >= pos.max - 2) { atFoot = true; break; }
    }
    // each heading set in letters at the end of the walk, the whole page scrolled through: its letters' final state
    const letterEnd = letterSeen.size ? new Map(((await page.eval(splitLetters, { all: true }).catch(() => null)) || []).map((x) => [x.id, x.letters])) : new Map();
    const motion = await page.eval('window.__motion ? window.__motion() : null').catch(() => null);
    // re-measure after everything has revealed (catches content that only exists post-reveal)
    await page.eval(`window.scrollTo({ top: 0, behavior: 'instant' })`).catch(() => {});
    await sleep(350);
    const after = await page.eval(probe).catch(() => metrics);
    const m = after.headings.length >= metrics.headings.length ? after : metrics;
    const lay = await page.eval(layout).catch(() => null);
    const ex = await page.eval(extra).catch((e) => { frameErrors.push('extra: ' + String(e.message).slice(0, 160)); return null; });
    // round 10, at the top of the page: the first screen as the generic stack (desktop), and visit blocks
    const hero = w >= 1100 && !appMode ? await page.eval(heroStack).catch((e) => { frameErrors.push('hero: ' + String(e.message).slice(0, 160)); return null; }) : null;
    const visits = !appMode ? await page.eval(visitBlocks).catch((e) => { frameErrors.push('visit: ' + String(e.message).slice(0, 160)); return null; }) : null;
    // round 10, part B: what the sections are built from, the forms, the splits and the credits
    const build = !appMode ? await page.eval(pageBuild, {}).catch((e) => { frameErrors.push('build: ' + String(e.message).slice(0, 160)); return null; }) : null;
    // round 11, at the top of the page: the hero alone on the first screen and the air between sections, the bar as the
    // page opened, and pictures cut hard while they carry lettering or show the work
    if (build) {
      build.space = await page.eval(space).catch((e) => { frameErrors.push('space: ' + String(e.message).slice(0, 160)); return null; });
      build.nav = navAtLoad;
      build.crops = await page.eval(crops).catch((e) => { frameErrors.push('crops: ' + String(e.message).slice(0, 160)); return null; });
      // round 11b, on desktop: the grounds the walk saw, the footer against the one section 0 dealt, and a portfolio's work
      if (w >= 1100) {
        build.grounds = await page.eval(grounds, [dealtPalette, seenGrounds && { page: seenGrounds.page, tones: [...seenGrounds.tones.values()] }, dealtAsk]).catch((e) => { frameErrors.push('grounds: ' + String(e.message).slice(0, 160)); return null; });
        if (dealtFooter) build.foot = await page.eval(footing).then((f) => ({ ...f, dealt: dealtFooter })).catch((e) => { frameErrors.push('footer: ' + String(e.message).slice(0, 160)); return null; });
        if (PORTFOLIO.includes(sector)) build.work = await page.eval(workShown).catch((e) => { frameErrors.push('work: ' + String(e.message).slice(0, 160)); return null; });
        // round 11c: the button shapes, the navigation against the one section 0 dealt, and the sections' structures
        build.buttons = await page.eval(buttonShapes, { client }).catch((e) => { frameErrors.push('buttons: ' + String(e.message).slice(0, 160)); return null; });
        if (build.buttons && navSeen?.buttons) for (const s of navSeen.buttons) if (!build.buttons.some((x) => x.key === s.key)) build.buttons.push({ ...s, past: true });
        if (navSeen) build.navs = { ...navSeen, dealt: dealtNav };
        // round 11e: one place twice on one screen (with what the walk saw at each screen), and the footer's links to other
        // companies' sites
        build.places = await page.eval(samePlace).then((p) => [...p, ...(seenPlaces || [])]).catch((e) => { frameErrors.push('places: ' + String(e.message).slice(0, 160)); return seenPlaces; });
        build.footLinks = await page.eval(footerLinks, { client }).catch((e) => { frameErrors.push('footer links: ' + String(e.message).slice(0, 160)); return null; });
        build.structures = await page.eval(structures).catch((e) => { frameErrors.push('structures: ' + String(e.message).slice(0, 160)); return null; });
        // round 11d: the pictures shown as the client's, with their credits, a portfolio's work among them, marked or not
        // (the grounds above are the walk's, and the film's take their place where it runs)
        build.pictures = await page.eval(pictureCredits, { client, product: ownsProduct, place: ownPlace, own: hasOwn, work: build.work?.files || [] }).then((p) => ({ ...p, kind: productKind })).catch((e) => { frameErrors.push('pictures: ' + String(e.message).slice(0, 160)); return null; });
      }
    }
    const appM = appMode ? await page.eval(app).catch(() => null) : null;
    if (appM) appM.colourShare = await helper.eval(colourShare, 'data:image/jpeg;base64,' + frames[0]).catch(() => null);

    // scroll scenes (assets/scenes): each must have started, run live on desktop, and leave the page room
    const sceneState = w >= 1100 && !appMode ? await page.eval(`[...document.querySelectorAll('section.scene, .scene[data-scene]')].map((s) => ({ id: s.dataset.scene || s.id || 'scene', live: s.classList.contains('is-live'), rest: s.classList.contains('is-rest'), h: Math.round(s.getBoundingClientRect().height) }))`).catch(() => []) : [];
    const sceneFindings = [];
    if (sceneState.length) {
      const idle = sceneState.filter((s) => !s.live && !s.rest);
      if (idle.length && !allow.includes('scene-not-started')) sceneFindings.push({ level: 'FAIL', id: 'scene-not-started', width: w, message: `${idle.length} scene(s) never started: ${idle.map((s) => s.id).join(', ')}.`, fix: 'Load assets/scenes/stage.js and the scene file for each data-scene, then call Stage.smooth(); Stage.init(); at the end of <body> (references/scenes.md, "Putting a scene on a page").' });
      const atRest = sceneState.filter((s) => s.rest);
      if (atRest.length && !allow.includes('scene-not-live')) sceneFindings.push({ level: 'FAIL', id: 'scene-not-live', width: w, message: `${atRest.length} scene(s) show their finished composition on desktop instead of running: ${atRest.map((s) => s.id).join(', ')}.`, fix: 'GSAP or ScrollTrigger did not load (check the pinned CDN lines and the console), or the scene threw while building. The scene must run where motion is allowed.' });
      if (sceneState.length > 4 && !allow.includes('many-scenes')) sceneFindings.push({ level: 'WARN', id: 'many-scenes', width: w, message: `${sceneState.length} scroll scenes on one page.`, fix: 'Two or three scenes, with quiet sections between them, so each one lands. Cut the weakest.' });
      // held screens against the page (a share alone rewards padding the rest of it), against an absolute budget,
      // and the long set pieces (five screens or more), of which a page carries one
      const held = sceneState.reduce((a, s) => a + Math.max(0, s.h - h), 0);
      const longSets = sceneState.filter((s) => s.h - h >= h * 4.5);
      const heavy = [held > (metrics.page.height || 1) * 0.6 && `they are ${Math.round((held / (metrics.page.height || 1)) * 100)}% of the page`, held > h * 7 && 'more than about 6.5 screens of hold in all', longSets.length > 1 && `${longSets.length} of them hold five screens or more (${longSets.map((s) => `${s.id} ${Math.round((s.h - h) / h)}`).join(', ')})`].filter(Boolean);
      if (heavy.length && !allow.includes('scene-heavy')) sceneFindings.push({ level: 'WARN', id: 'scene-heavy', width: w, message: `Scenes hold ${Math.round(held / h)} of the page's ${Math.round((metrics.page.height || 0) / h)} screens: ${heavy.join('; ')}.`, fix: 'Shorten the holds (one screen per beat, and a hold with nothing new to show is cut), keep one long set piece at most, or cut a scene; the reading sections need room between them (references/scenes.md §7).' });
    }

    // --film: the scroll as a visitor sees it. Real wheel input and a frame every third of a screen, so a
    // scroll scene shows its in-between states, not only where each screen lands.
    // Each step is also checked twice while it moves (about 120 and 280ms after the wheel) for texts drawn over
    // each other and for which blocks of text can be read at all.
    const filmSheets = [], filmChecks = [], filmGround = [];
    const filmHere = (film || !!dealtReplay || !!(ex && ex.replays && ex.replays.length)) && w >= 1100;
    if (filmHere) {
      await page.eval(`window.scrollTo({ top: 0, behavior: 'instant' })`).catch(() => {});
      await sleep(700);
      const shots = []; let lastY = -1, still = 0;
      // (a veil a scene draws over the screen for less than a screen of scroll falls between two screens of the walk: where
      // the film runs, its frames count the grounds; a frame where the wheel no longer moves the page is the foot again, and
      // is left out)
      const filmGrounds = seenGrounds ? { page: null, tones: new Map() } : null; let groundAt = null;
      for (let i = 0; i < Math.min(150, Math.ceil(total / stride) * 3 + 6); i++) {
        shots.push(await page.screenshot({ quality: 70 }));
        const at = i ? lastY : 0;
        if (filmGrounds && at >= 0 && (groundAt === null || at > groundAt)) {
          const g = await page.eval(groundPoints).catch((e) => { if (frameErrors.length < 5) frameErrors.push('film grounds: ' + String(e.message).slice(0, 160)); return null; });
          if (g) addGrounds(filmGrounds, g, groundAt === null ? 1 : (at - groundAt) / h);
          groundAt = at;
        }
        await page.wheel(Math.round(h / 3) * stride, { step: 100, pauseMs: 16 });
        for (const ms of [120, 160]) { await sleep(ms); const c = await check({ film: true }); if (c) c.step = i; filmChecks.push(c); }
        await sleep(140);
        const y = await page.eval('Math.round(scrollY || document.scrollingElement.scrollTop || 0)').catch(() => -1);
        if (y === lastY) { if (++still >= 2) break; } else still = 0;
        lastY = y;
      }
      if (build && filmGrounds?.tones.size) build.grounds = await page.eval(grounds, [dealtPalette, { page: filmGrounds.page, tones: [...filmGrounds.tones.values()] }, dealtAsk]).catch((e) => { frameErrors.push('film grounds: ' + String(e.message).slice(0, 160)); return build.grounds; });
      // how much of each frame is flat empty ground (held-dead-screen)
      for (const s of shots) filmGround.push(await helper.eval(groundShare, 'data:image/jpeg;base64,' + s).catch(() => null));
      for (let i = 0; i < shots.length; i += 24) {
        const p = join(outDir, `${imageLabel}-film-${String(i / 24 + 1).padStart(2, '0')}.jpg`);
        await sheet(shots.slice(i, i + 24), 6, 320, 200, p);
        filmSheets.push(p);
      }
    }

    // the product replay beat by beat (replay-faint, replay-bands), on desktop; it scrolls the page, so before the controls
    const replayRuns = [], replaySheets = [];
    if (w >= 1100 && !appMode && ex && (ex.replays || []).length) {
      for (let i = 0; i < Math.min(ex.replays.length, 8); i++) {
        const rb = await replayBeats(page, i, w, h).catch((e) => { frameErrors.push('replay beats: ' + String(e.message).slice(0, 160)); return null; });
        replayRuns.push(rb);
        if (rb && rb.states.length) {
          const p = await replaySheet(rb, w, h, join(outDir, `${imageLabel}-replay-${String(i + 1).padStart(2, '0')}.jpg`)).catch(() => null);
          if (p) replaySheets.push(p);
          for (const s of rb.states) { delete s.png; delete s.cursorPng; delete s.sig; }
        }
      }
    }

    // tile walls (tile-wall), on desktop: each candidate extra() marked is brought into view and photographed, and each
    // tile's fill read from the pixels; it scrolls the page, so it runs before the controls too
    const wallRuns = [];
    if (w >= 1100 && !appMode && ex && (ex.tileWalls || []).length) {
      for (const [i, wall] of ex.tileWalls.slice(0, 3).entries()) {
        await page.eval(`window.scrollTo({ top: ${Math.max(0, Math.round(wall.top + Math.min(wall.h, h) / 2 - h / 2))}, behavior: 'instant' })`).catch(() => {});
        await page.wheel(2); await sleep(900);
        const rects = await page.eval(`[...document.querySelectorAll('[data-ts-tile^="${i}-"]')].map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })`).catch(() => []);
        const png = rects.length ? await page.screenshot({ format: 'png' }).catch(() => null) : null;
        const fills = png ? await helper.eval(tileFills, ['data:image/png;base64,' + png, rects, ex.ground]).catch(() => null) : null;
        if (fills) wallRuns.push({ ...wall, ...fills });
      }
    }

    // round 10: the page at rest, after the film. At each screen of the walk and at the end of each running scene, the
    // page is put on the spot, its animations waited out, looked at, scrolled on a little and looked at again; only what
    // held still between the two looks counts (clipped-text, repeated-picture, restated-heading, repeated-label)
    const restRuns = [];
    if (!appMode) {
      const stops = await page.eval(restStops, stride).catch((e) => { frameErrors.push('rest: ' + String(e.message).slice(0, 160)); return null; });
      if (stops) {
        const list = [...stops.ys.map((y) => ({ y })), ...stops.ends.map((e) => ({ y: e.y, end: e.id }))].sort((a, b) => a.y - b.y);
        const looks = [];
        for (const s of list) { const prev = looks[looks.length - 1]; if (prev && Math.abs(prev.y - s.y) < h / 8) { if (s.end) { prev.end = s.end; prev.y = s.y; } continue; } looks.push({ ...s }); }
        const maxY = Math.max(0, (await page.eval('document.scrollingElement.scrollHeight - innerHeight').catch(() => 0)) || 0);
        const nudge = Math.max(24, Math.round(h * 0.03));
        for (const s of looks.slice(0, MAX_SCREENS + 12)) {
          const y0 = await page.eval(restGo, s.y).catch(() => null); if (y0 == null) continue;
          const a = await page.eval(restLook, { phase: 0 }).catch((e) => { if (frameErrors.length < 8) frameErrors.push('rest look: ' + String(e.message).slice(0, 160)); return null; });
          if (!a) continue;
          await page.eval(restGo, y0 + nudge <= maxY ? y0 + nudge : Math.max(0, y0 - nudge)).catch(() => null);
          const r = await page.eval(restLook, { phase: 1 }).catch((e) => { if (frameErrors.length < 8) frameErrors.push('rest look: ' + String(e.message).slice(0, 160)); return null; });
          // round 11f: a button on a photograph, the picture round it measured on this screen as it rests
          if (r && r.strands?.length) {
            const png = await page.screenshot({ format: 'png' }).catch(() => null);
            const busy = png ? await helper.eval(photoBusy, ['data:image/png;base64,' + png, r.strands]).catch(() => null) : null;
            r.strands.forEach((x, i) => { x.busy = busy ? busy[i] : null; });
          }
          if (r) restRuns.push({ ...r, end: s.end || null });
        }
      }
    }

    // decorative controls: each switch, checkbox or slider is used once and put back (it touches the page, so it runs last)
    if (ex) ex.controls = await page.eval(controls).catch((e) => { frameErrors.push('controls: ' + String(e.message).slice(0, 160)); return null; });
    // the first screen's controls, each clicked once (dead-control); last, since it may leave a menu open
    const dead = w >= 1100 && !appMode ? await page.eval(deadControls).catch((e) => { frameErrors.push('dead controls: ' + String(e.message).slice(0, 160)); return null; }) : null;
    // a heading alone on a screen of the walk (any width) or of the film
    const screenAt = (f, i) => (f && f.y != null ? Math.round(f.y / h) + 1 : i * stride + 1);
    // (round 10, part B: a display heading over content still to come counts when it holds alone for more than a moment:
    // two screens of the walk, or two steps of the film, a third of a screen apart; r9-p43's "The light decides the
    // season". One frame of a scene's change is not a heading left alone)
    const loneHeld = new Map();
    for (const f of [...frameChecks, ...filmChecks]) if (f && f.lone) { const s = loneHeld.get(f.lone.text) || { walk: 0, steps: new Set() }; if (f.step != null) s.steps.add(f.step); else s.walk++; loneHeld.set(f.lone.text, s); }
    if (ex) ex.loneScreens = [...new Map([...frameChecks, ...filmChecks].map((f, i) => (f && f.lone && (!f.lone.big || loneHeld.get(f.lone.text).walk >= 2 || loneHeld.get(f.lone.text).steps.size >= 2) ? [f.lone.text, { ...f.lone, screen: screenAt(f, i) }] : null)).filter(Boolean)).values()];
    if (ex) ex.loneHeld = [...loneHeld.entries()].slice(0, 8).map(([t, s]) => ({ text: t.slice(0, 40), walk: s.walk, film: s.steps.size }));
    // each replay's window at its smallest (replay-small): extra() saw it at the page top after the walk, where
    // replay.js has put it back to its first beat; it is also measured at load (its final state) and in the film at
    // every beat it showed (the largest frame of each beat, so a window still growing in is not taken for its size)
    if (ex) (ex.replays || []).forEach((r, i) => {
      const byBeat = new Map();
      for (const c of filmChecks) for (const [j, b, , rw, rh] of c?.replays || []) if (j === i && rw != null) { const s = byBeat.get(b) || { w: 0, h: 0 }; byBeat.set(b, { w: Math.max(s.w, rw), h: Math.max(s.h, rh) }); }
      for (const s of [replayAtLoad[i], ...byBeat.values()]) if (s) { r.w = Math.min(r.w, +s.w.toFixed(2)); r.h = Math.min(r.h, +s.h.toFixed(2)); }
    });

    const cols = w >= 1100 ? 2 : w >= 600 ? 3 : 4;
    const cellW = w >= 1100 ? 800 : w >= 600 ? 512 : 390;
    const cellH = Math.round((cellW * h) / w);
    const perSheet = w >= 1100 ? 4 : w >= 600 ? 6 : 8;
    const sheets = [];
    for (let i = 0; i < frames.length; i += perSheet) {
      const p = join(outDir, `${imageLabel}-page-${String(i / perSheet + 1).padStart(2, '0')}.jpg`);
      await sheet(frames.slice(i, i + perSheet), cols, cellW, cellH, p);
      sheets.push(p);
    }
    let findings = [...judge(m, { width: w, allow }), ...sceneFindings];
    if (devServer && !allow.includes('dev-server')) findings.push({ level: 'WARN', id: 'dev-server', width: w, message: 'This page is served by a development server (Vite, webpack or Next in dev mode).', fix: 'Run the last gate on the production build too (vite build && vite preview, next build && next start, or the built index.html): minifiers and bundlers change the CSS a visitor receives.' });
    if (dealtFonts.length && w >= 1100 && !allow.includes('font-not-dealt')) {
      const norm = (f) => String(f).toLowerCase().replace(/["']/g, '').replace(/\s+variable$/, '').trim();
      const used = m.type.families.filter((f) => f.share >= 0.1).map((f) => norm(f.family));
      const missing = dealtFonts.filter((f) => !used.some((u) => u === norm(f) || u.startsWith(norm(f))));
      if (missing.length === dealtFonts.length) findings.push({ level: appMode ? 'FAIL' : 'WARN', id: 'font-not-dealt', width: w, message: `The sheet dealt ${dealtFonts.join(' and ')}, but the page renders ${m.type.families.slice(0, 2).map((f) => f.family).join(', ')}.`, fix: 'Load the dealt face (the link on the sheet) and put it first in font-family. A build that falls back to a default face lands on the default look.' });
    }
    // a third of the studied award pages were still unreadable 4.5s after load; the house sequence is over by 1.2s
    if (!appMode && early && early.found && !early.visible && !allow.includes('late-title')) findings.push({ level: 'FAIL', id: 'late-title', width: w, message: `The title is not readable 1.2s after the page loaded (${early.why}).`, fix: 'Put the headline in the HTML, painted on the first frame; the dealt entrance only adds arrival and is still by 1.24s (references/motion.md, "The entrance is dealt"). No preloader, no gate, no waiting for the load event.' });
    // the dealt entrance (draw.mjs section 8): built as dealt, and its headline lines each fit one line
    const ent = appMode ? null : await page.eval(ENTRANCE_SEEN).catch(() => null);
    if (ent && dealtEntrance && w >= 1100 && ent.id !== dealtEntrance && !allow.includes('entrance-not-dealt')) findings.push({ level: 'FAIL', id: 'entrance-not-dealt', width: w, message: `The sheet dealt the "${dealtEntrance}" entrance, but the page ${ent.id ? `carries data-entrance="${ent.id}"` : 'has no data-entrance on its body'}.`, fix: `Build the dealt entrance (sheet section 8): <body data-entrance="${dealtEntrance}">, its markers on the first screen, its CSS from base.css, and only its own rule below the fold. Never swap it for another or for the old line rise; redraw it only for a reason you can state (draw.mjs --redraw entrance).` });
    if (ent && ['line-blocks', 'set-type'].includes(ent.id) && ent.wrapped.length && !allow.includes('entrance-line-wraps')) findings.push({ level: ent.id === 'line-blocks' ? 'FAIL' : 'WARN', id: 'entrance-line-wraps', width: w, message: `${ent.wrapped.length} headline line(s) wrap at this width, so ${ent.id === 'line-blocks' ? 'one block covers the whole column and leaves a bar beside the shorter line' : 'two lines rise as one'}: ` + ent.wrapped.slice(0, 3).map((t) => `"${t}"`).join(', '), fix: 'Each [data-line] must fit on one line at every width: break the headline into shorter lines (three at most), or set a smaller display step on phones.' });
    if (lay) findings.push(...judgeLayout(lay, { width: w, allow }));
    if (ex) findings.push(...judgeExtra(ex, { width: w, allow, screens: total, app: !!appMode }));
    // (a list of cards on a fill is not reported, so it does not hide its section's other frames)
    if (build) findings.push(...judgeBuild(build, { width: w, allow, boxed: (ex?.boxedLists || []).filter((b) => b.how !== 'filled').map((b) => b.head), dead, boxedText: ex?.boxed }));
    // ---------- round 9 ----------
    // pictures the page asks for that are not there (r8-p37 asked for four)
    netOff.forEach((off) => off());
    const tail = (u) => { try { const x = new URL(u); return x.origin === new URL(url).origin ? decodeURIComponent(x.pathname).replace(/^\//, '') : x.host + decodeURIComponent(x.pathname); } catch { return u; } };
    if (missingPics.size && !allow.includes('missing-image')) findings.push({ level: 'FAIL', id: 'missing-image', width: w, message: `${missingPics.size} picture(s) the page asks for are not there: ${[...missingPics.entries()].slice(0, 5).map(([u, s]) => `${tail(u).slice(-60)} (${s})`).join(', ')}.`, fix: 'Every src, srcset candidate, CSS background, preload and Image() in script names a file that exists: fetch the picture, correct the path or the crop\'s name, or take the reference out. A picture missing on one width only is usually a srcset or a media query naming a crop that was never saved.' });
    // text on a photograph: the worst screen of each block, against the pixels under its letters (r7-p35's sentence
    // under "Hvít means white" over the sea stack: 16% of its letters' ground under 4.5:1 on a tablet, 24% on a phone,
    // where the judge could not read it; the blocks the judges read measured 9% or less). It fails when 12% or more of
    // its letters' ground is under the target (4.5:1), or two stretches of a word or so or more (a tenth of the block)
    // are. Display type from 24px reads through more of a busy picture (r5-p28's 208px "Tern", 16% of its ground under
    // 3:1 where a wing crosses the T, read clearly): it fails when a stretch of a word or so is under 3:1, or 30% of
    // its ground is.
    const onPhoto = new Map(), lowShare = (r) => (r.segs ? r.segLow / r.segs : 0), bad = (r) => r.under * 2 + lowShare(r);
    const unreadOnPhoto = (r) => (r.size >= 24 ? r.segLow >= 1 || r.under >= 0.3 : r.under >= 0.12 || r.p25 < r.need || (r.segLow >= 2 && lowShare(r) >= 0.1));
    const rank = (r) => (unreadOnPhoto(r) ? 10 : 0) + bad(r); // (each block's worst screen, a failing one first)
    for (const r of photoRuns) { const o = onPhoto.get(r.text); if (!o || rank(r) > rank(o)) onPhoto.set(r.text, r); }
    const lowOnPhoto = [...onPhoto.values()].filter(unreadOnPhoto).sort((a, b) => bad(b) - bad(a));
    if (lowOnPhoto.length && !allow.includes('text-on-photo')) findings.push({ level: 'FAIL', id: 'text-on-photo', width: w, message: `${lowOnPhoto.length} block(s) of text on a photograph cannot be read against the picture under them: ` + lowOnPhoto.slice(0, 4).map((r) => `"${r.text.slice(0, 40)}" ${r.size}px on ${r.media}: ${r.segLow} of its ${r.segs} words or so under ${r.need}:1 against the picture (the worst ${r.segWorst}:1), ${Math.round(r.under * 100)}% of its letters' ground under it, screen ${Math.round(r.y / h) + 1}`).join('; ') + '.', fix: 'Text on a picture sits on its calm part: move the words or the crop (object-position) so the letters fall on sky, wall or shadow of one tone, or set the text beside the picture on the ground. A scrim strong enough to rescue busy detail greys the photograph; never a text shadow. Check it at every width: the crop moves when the screen narrows.' });
    // a heading in letters left mid-way on a phone (r7-p35's "Booking" as "B o"): at a screen of the walk, once it
    // rested, letters still turned, moved or faded unlike both their own place and their state at the end of the walk
    if (w < 600 && letterSeen.size && !allow.includes('letters-mid-reveal')) {
      const caught = [];
      for (const [id, v] of letterSeen) {
        const end = letterEnd.get(id) ? relLetters(letterEnd.get(id)) : null; const tol = Math.max(2, v.size * 0.08);
        const differs = (a, b) => !b || Math.abs(a[0] - b[0]) > 0.15 || Math.abs(a[1] - b[1]) > tol || Math.abs(a[2] - b[2]) > tol || Math.abs(a[3] - b[3]) > 0.06 || Math.abs(a[4] - b[4]) > 4;
        for (const s of v.at) {
          const rel = relLetters(s.letters), mask = rel.map((l, i) => letterOff(v.size, l) && differs(l, end && end[i])), off = mask.filter(Boolean).length;
          // (what the visitor reads: a letter turned, moved, clipped or faded under half prints as a dot)
          if (off >= 2 && off >= s.letters.length * 0.2) { caught.push({ text: v.text, shows: s.chars.map((ch, i) => (mask[i] && letterOff(v.size, rel[i], 0.5) ? '·' : ch)).join(''), off, n: s.letters.length, screen: Math.round(s.y / h) + 1, at: Math.round((s.top / h) * 100) }); break; }
        }
      }
      if (caught.length) findings.push({ level: 'FAIL', id: 'letters-mid-reveal', width: w, message: `${caught.length} heading(s) set in letters stand half-drawn on a screen where the visitor stops: ` + caught.slice(0, 3).map((c) => `"${c.text}" shows as "${c.shows}" (${c.off} of ${c.n} letters still turned, moved or faded, screen ${c.screen}, ${c.at}% down it)`).join('; ') + '.', fix: 'On a phone a heading is whole wherever the scroll stops: let its letters arrive on a short clock as it enters (done within about a second), or show it whole (the scene\'s phone: "rest"). A letter reveal tied to the scroll leaves words like "B o" on the screen in between.' });
    }
    // a wall of tiles in several fills (r8-p37's hero: frames of flat red, teal, brown and yellow in six columns)
    for (const wr of wallRuns) {
      if (allow.includes('tile-wall') || wr.filled < 6 || wr.fills.length < 3) continue;
      findings.push({ level: 'FAIL', id: 'tile-wall', width: w, message: `${wr.hero ? 'The first screen' : `"${wr.head}"`} is a wall of ${wr.n} tiles, ${wr.filled} of them filled in ${wr.fills.length} colours (${wr.fills.slice(0, 6).map((f) => `${f.hex} ×${f.n}`).join(', ')}).`, fix: 'One picture leads a section: the strongest frame large, two or three more beside it at most, each on the page\'s ground. Fields of flat colour, one per project or card, read as a wall of boxes and spread the palette; keep a project\'s colours inside its one frame and set the rest of the work as a list of type (references/layout.md).' });
    }
    // ---------- round 10 ----------
    // the first screen as the generic stack (r9-p44: "Roasted and poured in Berlin" centred, a subline, a green pill and a
    // text link, a rounded photo card under them; the judge: it could be any café)
    // (round 11, r10-p47: the actions optional, and a row of two or three cards under the line counts as the card)
    if (hero && hero.stack && !allow.includes('template-hero')) findings.push({ level: 'FAIL', id: 'template-hero', width: w, message: `The first screen is the generic stack: a centred headline ("${hero.h1}"), a line under it${hero.actions ? `, two actions side by side (${hero.actions.join(', ')})` : ''} and ${hero.card ? `a rounded picture card ${hero.card.where} (${hero.card.src}, ${hero.card.radius}px corners, ${Math.round(hero.card.w * 100)}% of the width)` : `a row of ${hero.cards.n} cards under them (${hero.cards.src}, each ${Math.round(hero.cards.w * 100)}% of the width)`}.`, fix: 'Build the first screen round the page\'s one idea, not the default stack. The name or the subject is the dominant type at real scale, set in the dealt display face; the picture is cropped hard or runs to the edges, set beside or behind the words rather than parked as a card or a row of cards under them; one action. Change at least two of the parts: the centring, the line under the headline, the actions, the card or the row of cards.' });
    // text cut off by a box that clips it once the page rests (r9-p44 on a phone: the coffee panel cut its list after
    // Huila and Guji, so Cerrado and Decaf were never shown)
    const restClip = new Map(), restFig = new Map();
    for (const r of restRuns) for (const c of r.clipped || []) { const m = c.figure ? restFig : restClip, o = m.get(c.text); if (!o || c.past > o.past) m.set(c.text, { ...c, screen: Math.round(r.y / h) + 1, end: r.end }); }
    // round 11f: a figure cut by its box once the page rests (r14-p63's sun hours, 23 and 3 cut at 56% of their height on
    // every width: the judge read the digit roll as a bug)
    if (restFig.size && !allow.includes('cut-figure')) findings.push({ level: 'FAIL', id: 'cut-figure', width: w, message: `${restFig.size} figure(s) are cut by the box that holds them once the page rests: ` + [...restFig.values()].slice(0, 4).map((c) => `"${c.text}" at ${c.size}px loses ${c.past}px past the ${c.side} of ${c.by}${c.end ? ` (the end of ${c.end})` : ` (screen ${c.screen})`}`).join('; ') + '.', fix: 'A figure is read whole: a 3 cut at its middle reads as another digit, or as a bug. Give the box the figure\'s full height (line-height 1 and no fixed height under 1em), let a rolling digit land with its whole glyph inside its window, or set the figure a step smaller. A figure is never cropped at the screen\'s side or the foot of its box, as a word may be.' });
    if (restClip.size && !allow.includes('clipped-text')) findings.push({ level: 'FAIL', id: 'clipped-text', width: w, message: `${restClip.size} block(s) of text are cut off by a box that clips them once the page rests: ` + [...restClip.values()].slice(0, 4).map((c) => `"${c.text.slice(0, 40)}" ${c.short ? `is shrunk to a screen-reader-only ${c.by} while the items beside it show` : `${c.whole ? 'lies wholly' : `runs ${c.past}px`} past the ${c.side} of ${c.by}`}${c.end ? ` (the end of ${c.end})` : ` (screen ${c.screen})`}`).join('; ') + '.', fix: 'Nothing a visitor should read is cut off once the page rests. Let the box grow with its words (no fixed height with overflow: hidden round text), set a list that lies over a picture into the flow under the picture on a phone or tablet, or cut what does not fit; never shrink the items that do not fit into screen-reader-only boxes while the rest of the list shows. A mask may hide words on their way in, never once they have arrived; look at the end of each scene at 390 and 768.' });
    // one picture shown three times or more: copies of one file (the query and size suffixes taken off), or one held while
    // the steps change (r9-p44's roastery: one photograph under all four steps, three or four times down the tablet
    // page). A copy shown at under 40% of the size it reaches elsewhere is a stamp or a chip of it, and inside one scene a
    // copy under 40% of the largest is the stamp of a hand-over: neither counts again.
    const picEls = new Map();
    for (const r of restRuns) for (const p of r.pics || []) { const e = picEls.get(p.id) || { key: p.key, file: p.file, scene: p.scene, s: [] }; e.s.push({ y: r.y, t: p.t, area: p.area, seen: (r.seen || []).filter((x) => x !== 'pic:' + p.id) }); picEls.set(p.id, e); }
    const byFile = new Map();
    for (const e of picEls.values()) { const max = Math.max(...e.s.map((x) => x.area)); const sh = showings(e.s.filter((x) => x.area >= max * 0.4), h); const k = byFile.get(e.key) || { file: e.file, els: [] }; k.els.push({ scene: e.scene, max, n: sh.n, at: sh.at }); byFile.set(e.key, k); }
    const repeatedPics = [];
    for (const k of byFile.values()) {
      const big = new Map(); for (const x of k.els) if (x.scene) big.set(x.scene, Math.max(big.get(x.scene) || 0, x.max));
      const counted = k.els.filter((x) => !x.scene || x.max >= big.get(x.scene) * 0.4);
      const n = counted.reduce((a, x) => a + x.n, 0);
      if (n >= 3) repeatedPics.push({ file: k.file, n, copies: counted.length, at: [...new Set(counted.flatMap((x) => x.at))].sort((a, b) => a - b) });
    }
    if (repeatedPics.length && !allow.includes('repeated-picture')) {
      findings = findings.filter((f) => !(f.id === 'repeated-picture' && f.level === 'WARN' && f.message.startsWith('The same large picture'))); // (the page-top count of copies says less; the picture-series WARN stays)
      findings.push({ level: 'FAIL', id: 'repeated-picture', width: w, message: `${repeatedPics.length} picture(s) are shown three times or more at rest: ` + repeatedPics.slice(0, 3).map((p) => `${p.file} ${p.n} times (${p.copies > 1 ? `${p.copies} copies` : 'one picture held while the page moves on'}, screens ${p.at.slice(0, 6).join(', ')})`).join('; ') + '.', fix: 'Show each photograph once. Each step of a pinned or stepped sequence gets its own picture, or at least its own crop or detail; a layout for narrower screens never repeats one picture down the page. With one picture only, show it once and set the steps beside or under it as text.' });
    }
    // headings at rest, in the order a visitor meets them, within each section: one that restates the one before it
    // ("Four coffees on the shelf", then "Four coffees" over the picture), and one short label shown three times or more
    // ("The roastery" over every step of a held sequence)
    // (each heading wholly on the screen, by the words it shows: one heading whose second line has gone behind its mask
    // reads as a second, shorter heading)
    const headFirst = new Map();
    for (const r of restRuns) for (const x of [...(r.heads || [])].sort((a, b) => a.t - b.t || a.l - b.l)) { const k = x.id + '|' + x.text.toLowerCase(); if (x.kind !== 'l' && x.whole && !headFirst.has(k)) headFirst.set(k, { ...x, y: r.y }); }
    const bySection = new Map();
    for (const x of headFirst.values()) { if (!x.section) continue; if (!bySection.has(x.section)) bySection.set(x.section, []); bySection.get(x.section).push(x); }
    const restated = [];
    for (const list of bySection.values()) for (let i = 1; i < list.length; i++) {
      const a = list[i - 1], b = list[i], A = wordSet(a.text), B = wordSet(b.text);
      const [s, l] = A.size <= B.size ? [A, B] : [B, A];
      if (s.size < 2 || ![...s].every((x) => l.has(x))) continue;
      // (a figure and its unit, "km/h" then "20 km/h": the longer one adds only numbers)
      if ([...l].filter((x) => !s.has(x)).every((x) => /^\d+$/.test(x))) continue;
      // (one heading whose lines arrive one by one adds words: that is the heading being set, not restated; and one set in
      // letters that come apart, "STA I RS", is not a shorter heading)
      if (a.id === b.id) { const F = wordSet(a.full || ''); if (B.size >= A.size || ![...A, ...B].every((x) => F.has(x))) continue; }
      // (one heading drawn twice in layers, as a scene does, is one heading: in the same place, or carried through one
      // scene's layers word for word)
      if (A.size === B.size && ((Math.abs(a.y + a.t - (b.y + b.t)) < 8 && Math.abs(a.l - b.l) < 8) || (a.scene && a.scene === b.scene))) continue;
      restated.push({ a: a.text, b: b.text, screen: Math.round(b.y / h) + 1 });
    }
    if (restated.length && !allow.includes('restated-heading')) findings.push({ level: 'WARN', id: 'restated-heading', width: w, message: `${restated.length} heading(s) restate the one before them in the same section: ` + restated.slice(0, 3).map((x) => `"${x.a.slice(0, 40)}" then "${x.b.slice(0, 40)}" (screen ${x.screen})`).join('; ') + '.', fix: 'One heading per idea. Cut the second, or let it say what the first does not (a name, a figure, the next point). A scene\'s statement and the heading of the section it leads into are one heading, set once.' });
    // (one element held over several steps is a label when larger words show beside it in its section: "The roastery"
    // over each step's statement; a held statement that is itself the largest text there is the scene's subject)
    const labelEls = new Map();
    for (const r of restRuns) for (const x of r.heads || []) {
      if (x.text.split(' ').length > 4 || /\d/.test(x.text)) continue;
      // (beside it: on its scene's stage when it is held on one, its chapters in their own <article>s; else in its section.
      // The larger words are a statement of two words or more, each step with a heading of its own: a held title over one
      // changing word or figure names what changes and is read once, "One climb, four heights" over "Valley", "The ride"
      // over "30 km/h")
      const over = (r.heads || []).some((o) => o.id !== x.id && o.kind !== 'l' && (x.stage ? o.stage === x.stage : o.section === x.section) && o.size > x.size * 1.2 && [...wordSet(o.text)].filter((t) => /^\p{L}{3,}$/u.test(t)).length >= 2);
      const e = labelEls.get(x.id) || { text: x.text, s: [] }; e.s.push({ y: r.y, t: x.t, over, seen: (r.seen || []).filter((s) => s !== x.text) }); labelEls.set(x.id, e);
    }
    const byLabel = new Map();
    for (const e of labelEls.values()) { let sh = showings(e.s, h); if (sh.n > 1 && !e.s.some((x) => x.over)) sh = { n: 1, at: sh.at.slice(0, 1) }; const k = e.text.toLowerCase(); const v = byLabel.get(k) || { text: e.text, n: 0, els: 0, at: [] }; v.n += sh.n; v.els++; v.at.push(...sh.at); byLabel.set(k, v); }
    const labelsAgain = [...byLabel.values()].filter((v) => v.n >= 3);
    if (labelsAgain.length && !allow.includes('repeated-label')) findings.push({ level: 'WARN', id: 'repeated-label', width: w, message: `${labelsAgain.length} short heading(s) or label(s) are shown three times or more at rest: ` + labelsAgain.slice(0, 3).map((v) => `"${v.text}" ${v.n} times (${v.els > 1 ? `${v.els} copies` : 'held while the steps change'}, screens ${[...new Set(v.at)].sort((a, b) => a - b).slice(0, 6).join(', ')})`).join('; ') + '.', fix: 'A label is read once. Over a held sequence, name the section once as it arrives and let each step carry its own heading; never print the same label over every step or card.' });
    // a visit block with no way to get there (r9-p44: opening hours and an email under "Visit the bar", the city in a
    // label, no street, district or map; the judge marked it high)
    if (visits && visits.length && !allow.includes('visit-without-directions')) findings.push({ level: 'WARN', id: 'visit-without-directions', width: w, message: `${visits.length} block(s) read as a visit (${visits.slice(0, 2).map((v) => `"${v.head}", by ${v.why}`).join('; ')}) but give no street or district and no link to a map.`, fix: 'A visit block says where to go: a real street in the right district (no house number unless the brief gives one; for a remote place, the nearest town and the road from it), the district, the nearest stop and its line, and a "Directions" link to a map (OpenStreetMap, Google or Apple Maps) beside the opening hours and one contact. The city alone is not an address; never a placeholder street.' });
    // round 10, part B: a pale or coloured veil on a photograph at rest, blurred or flat (r9-p43: white at 50% and 80%
    // over the lower left of the full-bleed fjord); it fails with the gradients
    const veils = new Map();
    for (const r of restRuns) for (const v of r.veils || []) { const k = v.media + '|' + v.what; const o = veils.get(k); if (!o || v.share > o.share) veils.set(k, { ...v, screen: Math.round(r.y / h) + 1 }); }
    if (veils.size && !allow.includes('gradient')) findings.push({ level: 'FAIL', id: 'gradient', width: w, message: `${veils.size} photograph(s) lie under a veil at rest: ` + [...veils.values()].slice(0, 3).map((v) => `${v.media} under ${v.how}${v.blur ? ', blurred,' : ''} (${v.what}, ${v.colour}) over ${Math.round(v.share * 100)}% of it, screen ${v.screen}`).join('; ') + '.', fix: 'Take the veil off: a photograph shows at full colour and contrast. Set the words on a calm part of the picture (move the crop) or beside it on the ground; where words must sit on a busy part, a flat dark band under them at most, never a pale fog, a tint or a blurred patch.' });
    // a held stage's heading cut off above the screen on a tablet or a phone (r9-p41 at 390: "Find the note you" above
    // the screen while the replay held, "half remember" on it)
    const cutHeads = new Map();
    for (const r of restRuns) for (const c of r.cutHeads || []) { const o = cutHeads.get(c.text); if (!o || c.past > o.past) cutHeads.set(c.text, { ...c, screen: Math.round(r.y / h) + 1 }); }
    if (cutHeads.size && !allow.includes('held-heading-cut')) findings.push({ level: 'FAIL', id: 'held-heading-cut', width: w, message: `${cutHeads.size} heading(s) of a held stage are cut off above the screen while it holds: ` + [...cutHeads.values()].slice(0, 3).map((c) => `"${c.text.slice(0, 48)}" ${c.whole ? 'wholly above the screen' : `${c.past}px above its top`} (${c.stage}, screen ${c.screen})`).join('; ') + '.', fix: 'A held stage fits the screen with its heading in view: on a tablet or phone, set the window shorter (fewer rows, the panel that does the task), put the heading over the stage outside the hold, or release the hold and let the replay play on its own clock in the flow (references/motion.md, "Product replay").' });
    // ---------- round 11 ----------
    // an object that runs into one side of the screen at rest while the page keeps its margin (r9-p41's product window,
    // flush with the right edge, 58px of margin on the left). A product window, a box or a picture cut by the edge or
    // rounded fails, and so does a picture in the middle of its section (r10-p46's village); a plain picture as tall as
    // its section, or a wide field of colour, flush with one edge (a half-bleed split) warns
    const edgeEls = new Map();
    for (const r of restRuns) for (const e of r.edges || []) { const o = edgeEls.get(e.id); if (!o || e.past > o.past) edgeEls.set(e.id, { ...e, screen: Math.round(r.y / h) + 1 }); }
    const margin = lay && lay.margins ? Math.max(lay.margins.left || 0, lay.margins.right || 0) : 0;
    if (edgeEls.size && margin >= 16 && !appMode && !allow.includes('edge-run')) {
      const field = (e) => !e.round && e.past < 8 && (e.what === 'a picture' ? !!e.fullH : e.what === 'a box' && e.share >= 0.4);
      for (const level of ['FAIL', 'WARN']) {
        const es = [...edgeEls.values()].filter((e) => (level === 'FAIL' ? !field(e) : field(e)));
        if (es.length) findings.push({ level, id: 'edge-run', width: w, message: `${es.length} element(s) run into the ${[...new Set(es.map((e) => e.side))].join(' and ')} side of the screen at rest while the page keeps a ${margin}px margin: ` + es.slice(0, 3).map((e) => `${e.what} ("${e.text}", ${e.w}px wide${e.round ? ', rounded' : ''}) ${e.past ? `runs ${e.past}px past` : 'touches'} the ${e.side} edge, screen ${e.screen}`).join('; ') + '.', fix: level === 'FAIL' ? 'Nothing runs into one side of the screen. Keep the window, the card or the picture inside the page\'s margins (max-width and the same gutter on both sides), or let it span the whole width from edge to edge on purpose. A product window cut by the screen\'s side reads as a layout that broke.' : 'A picture or a field flush with one side of the screen reads as running out of the page. Keep it inside the margins, or run it from edge to edge; a split whose picture fills its half to the edge is a choice to defend in one sentence.' });
      }
    }
    // ---------- round 11f ----------
    // a button whose ground is a busy photograph at rest (r14-p63's Send request on the moor's scrub, 24, its form in the
    // band beside the picture): the picture round it changes by 12 or more of 255 from one pixel to the next on average
    // (a clear sky or fog under 4, a meadow or a hillside 6 to 11, stones on a shore 17)
    const strands = new Map();
    for (const r of restRuns) for (const x of r.strands || []) { const o = strands.get(x.id); if (x.busy != null && (!o || x.busy > o.busy)) strands.set(x.id, { ...x, screen: Math.round(r.y / h) + 1, end: r.end }); }
    const busyOnes = [...strands.values()].filter((x) => x.busy >= 12);
    if (busyOnes.length && !appMode && !allow.includes('button-on-photo')) findings.push({ level: 'WARN', id: 'button-on-photo', width: w, message: `${busyOnes.length} button(s) stand on a busy photograph: ` + busyOnes.slice(0, 3).map((x) => `"${x.text}" on ${x.media || 'a picture'} (it changes by ${x.busy} of 255 from one pixel to the next round the button${x.away ? '; its form stands elsewhere' : ''}${x.end ? `, the end of ${x.end}` : `, screen ${x.screen}`})`).join('; ') + '.', fix: 'An action stands where its words and its form stand: on the ground or a card beside the picture, under the sentence it completes. On a picture only the hero\'s one action, on a calm part of it (sky, wall, shadow of one tone); never a form\'s submit button parted from its fields and left on grass, scrub or a crowd.' });
    if (appMode) {
      findings = findings.filter((f) => !APP_SKIP.has(f.id) && f.id !== 'no-title' && f.id !== 'small-title');
      if (appM) findings.push(...judgeApp(appM, m, { width: w, allow }));
    }
    // what only shows up while scrolling: text hidden under something, and screens with almost nothing on them
    const screenOf = (f, i) => (f && f.y != null ? Math.round(f.y / h) + 1 : i * stride + 1);
    const coveredText = [...new Map(frameChecks.filter(Boolean).flatMap((f, i) => f.covered.map((c) => [c.text, { ...c, screen: screenOf(f, i) }]))).values()];
    if (coveredText.length && !allow.includes('covered-text')) findings.push({ level: 'FAIL', id: 'covered-text', width: w, message: `Large text lies under another element at some scroll position: ` + coveredText.slice(0, 4).map((c) => `"${c.text}" (screen ${c.screen}, ${Math.round(c.share * 100)}% hidden)`).join('; '), fix: 'Nothing may sit on top of a headline or statement. Move the picture, shorten the pinned run, or raise the text above it (z-index) and give it a ground.' });
    const clippedText = [...new Map(frameChecks.filter(Boolean).flatMap((f, i) => (f.clipped || []).map((c) => [c.text, { ...c, screen: screenOf(f, i) }]))).values()];
    if (clippedText.length && !allow.includes('clipped-text')) findings.push({ level: 'FAIL', id: 'clipped-text', width: w, message: 'Large text is cut off along its top by the box that holds it: ' + clippedText.slice(0, 3).map((c) => `"${c.text}" (screen ${c.screen})`).join('; '), fix: 'Jurors read a wordmark sliced at the top as broken. Give the box room for the ascenders (line-height and padding), or crop at the bottom or a side edge on purpose.' });
    const overPictures = [...new Map(frameChecks.filter(Boolean).flatMap((f, i) => (f.pinnedOver || []).map((c) => [c.text, { ...c, screen: screenOf(f, i) }]))).values()];
    if (overPictures.length && !allow.includes('pinned-over-picture')) findings.push({ level: 'WARN', id: 'pinned-over-picture', width: w, message: 'Pinned large text slides across pictures while the page scrolls: ' + overPictures.slice(0, 3).map((c) => `"${c.text}" (screen ${c.screen}, ${Math.round(c.share * 100)}% over a picture)`).join('; '), fix: 'Jurors read a pinned title crossing drawings or photographs as a collision. Keep the pictures in the column the title does not occupy, or unpin it.' });
    // two texts drawn over each other at some scroll position (walk and film frames)
    const checks = [...frameChecks, ...filmChecks].filter(Boolean);
    const overText = [...new Map(checks.flatMap((f) => (f.overText || []).map((o) => [o.a + '|' + o.b, { ...o, y: f.y }]))).values()];
    if (overText.length && !allow.includes('text-over-text')) findings.push({ level: 'FAIL', id: 'text-over-text', width: w, message: 'Two texts are drawn on top of each other while the page scrolls: ' + overText.slice(0, 3).map((o) => `"${o.a}" over "${o.b}" (at ${o.y}px)`).join('; '), fix: 'Two text states never share pixels. A swap is out, then in (the incoming line starts when the outgoing one has gone), or a masked wipe; a card or caption that travels never crosses a line of text that is still on screen.' });
    // a block of text that was in view and covered every time: a caption the visitor never gets to read
    const sightings = new Map();
    for (const f of checks) for (const [t, ok] of f.seen || []) { const s = sightings.get(t) || { n: 0, ok: 0, at: [] }; s.n++; s.ok += ok; if (s.at.length < 6) s.at.push(f.y); sightings.set(t, s); }
    const unread = [...sightings.entries()].filter(([, s]) => s.n >= 2 && !s.ok).map(([t, s]) => ({ text: t, n: s.n, at: s.at }));
    if (unread.length && !allow.includes('never-readable')) findings.push({ level: 'FAIL', id: 'never-readable', width: w, message: `${unread.length} block(s) of text are covered at every scroll position they were seen at: ` + unread.slice(0, 4).map((u) => `"${u.text.slice(0, 44)}" (${u.n} frames)`).join('; '), fix: 'Something lies on these words whenever they are in view (the next picture of a sequence, a pinned layer, a card). Give each its held moment on top: a longer slot before the next picture arrives, the caption above the layer that covers it, or the caption beside the picture instead of on it.' });
    // loops that play for more than five seconds with nothing on the page to stop them (WCAG 2.2.2)
    const playingVideos = [...new Set(checks.flatMap((f) => f.playing || []))];
    if (playingVideos.length && !m.page.pauseControl && !allow.includes('no-pause')) findings.push({ level: 'WARN', id: 'no-pause', width: w, message: `${playingVideos.length} video loop(s) play with no control to pause them: ${playingVideos.slice(0, 3).join(', ')}.`, fix: 'Give moving pictures that run past five seconds a visible pause: one "Pause films" button in the navigation is enough for a page of loops, or a small pause on the clip itself. Loops still stop under reduced motion and off screen.' });
    // small text set on a large picture: more than one short line, or captions and labels, belong beside or under it
    const onMedia = new Map();
    for (const f of frameChecks.filter(Boolean)) for (const o of f.onMedia || []) { const v = onMedia.get(o.media) || new Set(); for (const t of o.texts) v.add(t); onMedia.set(o.media, v); }
    const captioned = [...onMedia.entries()].map(([media, set]) => ({ media, texts: [...set], words: [...set].join(' ').split(/\s+/).filter(Boolean).length })).filter((o) => o.texts.length >= 2 || o.words > 12);
    if (captioned.length && !allow.includes('caption-on-media')) findings.push({ level: 'WARN', id: 'caption-on-media', width: w, message: `Small text is set on ${captioned.length} large picture(s): ` + captioned.slice(0, 3).map((o) => `${o.media} under ${o.texts.slice(0, 3).map((t) => `"${t.slice(0, 32)}"`).join(', ')}`).join('; '), fix: 'On a picture put only display text, one short line and one action (references/imagery.md, "Text over pictures"). A caption, a label or a description goes in the gutter beside or under the picture, or in a corner it leaves empty; never in a band across a piece of work.' });
    // a picture's edge through a paragraph: half of it on the paper, half on the picture
    const straddled = [...new Map(checks.flatMap((f, i) => (f.straddle || []).map((s) => [s.text, { ...s, screen: screenOf(f, i) }]))).values()];
    if (straddled.length && !allow.includes('text-straddles-edge')) findings.push({ level: 'WARN', id: 'text-straddles-edge', width: w, message: 'A picture\'s edge runs through a paragraph, so part of it sits on the picture and part on the ground: ' + straddled.slice(0, 3).map((s) => `"${s.text}" (screen ${s.screen}, ${Math.round(s.share * 100)}% on the picture)`).join('; '), fix: 'Set the text wholly inside a calm part of the picture (4.5:1 there) or wholly outside it. When text interlocks with a picture, the overlap is whole lines and the edge falls in a line gap, never through a line.' });
    // nav-lost: on a page over about 6 screens, a stretch of more than 3 screens with no way back to the navigation's
    // anchors or the action. It fails over 10 screens; between 6 and 10 it warns (the v2.1 test pages ran 7-8
    // screens without a bar and the judges did not miss one). A phone or tablet page runs longer for the same content.
    const pageScreens = Math.round(((m.page.height || 0) / h) * 10) / 10;
    const lengthScale = w >= 1100 ? 1 : w >= 600 ? 1.2 : 1.6;
    if (!appMode && (metrics.reach?.dest?.length || metrics.reach?.labels?.length) && pageScreens > 6 * lengthScale && !(upReach && upReach.found) && !allow.includes('nav-lost')) {
      let run = 0, worst = 0, from = 0, span = null;
      reached.forEach((r, i) => { if (i === 0) return; if (r && r.found) { run = 0; return; } if (!run) from = i; run += stride; if (run > worst) { worst = run; span = [from * stride + 1, i * stride + 1]; } });
      if (worst > 3) findings.push({ level: pageScreens > 10 * lengthScale ? 'FAIL' : 'WARN', id: 'nav-lost', width: w, message: `On this ${pageScreens}-screen page nothing leads back to the navigation or the main action from screen ${span[0]} to ${span[1]}: no navigation stays on the screen, and no link to its anchors is in view.`, fix: 'Keep the navigation section 0 dealt in reach on every screen after the first, the way it says: a bar fixed on a solid band, the wordmark and the action in their corners, a side index or a dock, never one that hides on scroll; on a phone the menu button and the action stay in view (references/layout.md §7).' });
    }
    const empty = frameChecks.map((f, i) => ({ f, i })).filter(({ f }) => f && f.filled < 0.2);
    // the same large statement on screen for three screens or more in a row
    const runs = new Map();
    frameChecks.forEach((f, i) => { for (const t of f?.big || []) { const r = runs.get(t) || { start: i, last: i - 1, best: 0 }; if (r.last === i - 1) r.last = i; else { r.start = i; r.last = i; } r.best = Math.max(r.best, r.last - r.start + 1); runs.set(t, r); } });
    const longPins = [...runs.entries()].filter(([, r]) => r.best >= 3);
    if (w >= 1100 && longPins.length && !allow.includes('long-pin')) findings.push({ level: 'WARN', id: 'long-pin', width: w, message: `The same large text stays on screen for ${Math.max(...longPins.map(([, r]) => r.best))} screens in a row: ` + longPins.slice(0, 2).map(([t]) => `"${t}"`).join('; '), fix: 'A pinned element earns two screens, and something must change at each. Shorten the run or give every screen its own content.' });
    // a page that barely moves: counted from what really animated while it loaded and was scrolled
    if (w >= 1100 && motion && !allow.includes('still-page')) {
      const moving = motion.elements + motion.playingVideos * 4;
      if (moving < MOTION_MIN) findings.push({ level: 'FAIL', id: 'still-page', width: w, message: `Only ${motion.elements} element(s) moved while the page loaded and scrolled${motion.playingVideos ? ` (plus ${motion.playingVideos} playing video)` : ''}.`, fix: 'Build the motion layer (SKILL.md step 9): the scenes and the signature move, the dealt entrance and only its own rule below the fold, feedback on every control, and the moving picture section 0 deals. Do not add reveals the entrance does not name.' });
      else if (moving < MOTION_GOOD) findings.push({ level: 'WARN', id: 'still-page', width: w, message: `Little motion: ${motion.elements} element(s) moved while the page loaded and scrolled.`, fix: 'Check that the scenes and the signature move run at this width; add motion there, never a fade on every section.' });
    }
    // screens with almost no words or pictures on them, counting the scroll film: a glow, a burst of lines or a
    // coloured stage with one heading reads as dead scroll (judges named it the costliest fault of round 1)
    if (w >= 1100 && !appMode && !allow.includes('dead-scroll')) {
      const dead = [...frameChecks, ...filmChecks].filter((f) => f && f.content != null && f.content < 0.1);
      const seen = frameChecks.length + filmChecks.length;
      const ys = [...new Set(dead.map((f) => Math.round(f.y / h)))];
      if (ys.length >= 2) findings.push({ level: ys.length >= 4 || dead.length / Math.max(1, seen) > 0.25 ? 'FAIL' : 'WARN', id: 'dead-scroll', width: w, message: `${ys.length} screen(s) show almost no words or pictures while scrolling (under 10% of the screen): around screens ${ys.slice(0, 8).map((y) => y + 1).join(', ')}.`, fix: 'Every screen of scroll carries something to read or see. Shorten the scene or pin (one screen per beat), bring the next content in sooner, or cut the atmosphere: a glow, a burst or a lone line over an empty stage is not a section.' });
    }
    // the steps of the film in order: what each shows (two checks a step, merged)
    const filmSteps = new Map();
    for (const c of filmChecks) {
      if (!c || c.step == null) continue;
      const s = filmSteps.get(c.step) || { lines: new Set(), tops: new Map(), texts: new Set(), media: new Set(), pictures: 0, held: null, y: c.y };
      s.pictures = Math.max(s.pictures, c.pictures || 0);
      for (const l of c.shortLines || []) s.lines.add(l); for (const x of c.texts || []) s.texts.add(x); for (const x of c.media || []) s.media.add(x);
      for (const [l, t] of Object.entries(c.shortTops || {})) s.tops.set(l, t); // the later check of the step wins
      if (c.held) s.held = c.held;
      s.y = c.y; filmSteps.set(c.step, s);
    }
    const stepOrder = [...filmSteps.keys()].sort((a, b) => a - b);
    // a replay beat that changed under 0.5% of the screen (the beat pass) is not something new in the film: it reads as
    // the beat before it, so a held stage whose beats barely change is held empty (held-dead-screen, line-holds)
    replayRuns.forEach((rb, i) => {
      if (!rb || !rb.diffs.length || rb.clock) return;
      const uid = rb.states[0]?.uid; if (uid == null || uid < 0) return;
      const faint = new Set(rb.diffs.filter((d) => d.cells != null && d.cells < 0.005).map((d) => d.k));
      if (!faint.size) return;
      const eff = (b) => { let k = b; while (faint.has(k) && k > 0) k--; return k; };
      for (const s of filmSteps.values()) s.media = new Set([...s.media].map((x) => { const m = x.match(/^ui:(\d+):(\d+)$/); return m && +m[1] === uid ? `ui:${uid}:${eff(+m[2])}` : x; }));
    });
    // line-holds: a short line at display size that is nearly all the screen has to read (two other blocks of
    // 20 words or fewer beside it: a support line, a button) while nothing new arrives (no new words, picture or fragment)
    // and the line stands still (it moved 4% of the screen or less since the last step: the frames where it slides in
    // and out are ordinary scroll). An ordinary section brings something new within a third of a screen; a held line
    // over an empty stage does not.
    if (w >= 1100 && !appMode && stepOrder.length && !allow.includes('line-holds')) {
      const runs = new Map(), best = new Map(); let prev = null;
      for (const k of stepOrder) {
        const s = filmSteps.get(k);
        const newTexts = prev ? [...s.texts].filter((x) => !prev.texts.has(x)) : [...s.texts];
        const newMedia = prev ? [...s.media].filter((x) => !prev.media.has(x)) : [...s.media];
        for (const l of [...runs.keys()]) if (!s.lines.has(l)) runs.delete(l);
        const wordsOf = (x) => { const m = x.match(/ …(\d+)$/); return m ? +m[1] : x.split(' ').length; };
        for (const l of s.lines) {
          const same = (x) => x === l || l.startsWith(x.slice(0, 24)) || x.startsWith(l.slice(0, 24));
          const others = newTexts.filter((x) => !same(x));
          // a line among a list or a set of columns is not a line held alone
          const besides = [...s.texts].filter((x) => !same(x));
          if (besides.length > 2 || besides.reduce((a, x) => a + wordsOf(x), 0) > 20) { runs.delete(l); continue; }
          const r = runs.get(l);
          const still = !!prev && prev.tops.has(l) && s.tops.has(l) && Math.abs(s.tops.get(l) - prev.tops.get(l)) <= h * 0.04;
          const n = r && r.last === k - 1 && still && !others.length && !newMedia.length ? r.n + 1 : 1;
          runs.set(l, { n, last: k, from: n === 1 ? k : r.from });
          if (n > (best.get(l)?.n || 0)) best.set(l, { n, from: n === 1 ? k : r.from });
        }
        prev = s;
      }
      const held = [...best.entries()].map(([l, b]) => ({ l, n: b.n, held: Math.round(((b.n - 1) * stride / 3) * 10) / 10, at: Math.round((filmSteps.get(b.from)?.y || 0) / h) + 1 })).filter((x) => x.held > 0.9).sort((a, b) => b.held - a.held);
      if (held.length) findings.push({ level: held[0].held > 1.2 ? 'FAIL' : 'WARN', id: 'line-holds', width: w, message: held.slice(0, 3).map((x) => `"${x.l}" holds the screen for ${x.held} screens of scroll with nothing new (${x.n} film frames from screen ${x.at})`).join('; ') + '.', fix: 'One line of copy is worth about one screen of scroll. Cut the hold (data-options hold; a closing scene holds about one screen), give the stage a second beat with new content, or let the line scroll as an ordinary section.' });
    }
    // held-dead-screen: frames of a held stage (a pinned scene, a sticky layer over most of the screen) that are
    // mostly flat empty ground with little to see and nothing new: a full-screen photograph is not empty ground,
    // pictures over 15% of the screen are something to see, and a canvas or picture that changed since the last
    // step is the stage at work
    if (w >= 1100 && !appMode && stepOrder.length && !allow.includes('held-dead-screen')) {
      let worst = null, run = null, prev = null;
      for (const k of stepOrder) {
        const s = filmSteps.get(k);
        const ground = filmGround[k + 1] ?? filmGround[k];
        const changed = !!prev && [...s.media].some((x) => !prev.media.has(x));
        prev = s;
        const dead = !!s.held && ground != null && ground >= 0.6 && s.pictures < 0.15 && !changed;
        if (dead && run && run.id === s.held && run.last === k - 1) { run.n++; run.last = k; run.at.push(Math.round(s.y / h) + 1); }
        else run = dead ? { id: s.held, n: 1, last: k, at: [Math.round(s.y / h) + 1] } : null;
        if (run && (!worst || run.n > worst.n)) worst = { ...run, at: [...run.at] };
      }
      if (worst && worst.n >= 3) findings.push({ level: worst.n >= 4 ? 'FAIL' : 'WARN', id: 'held-dead-screen', width: w, message: `${worst.id}: ${Math.round((worst.n * stride / 3) * 10) / 10} screens of its hold are mostly empty ground (around screens ${[...new Set(worst.at)].join(', ')}).`, fix: 'Every frame of a held stage shows something to read or see. Shorten the hold to its beats, make the held picture large (at least half the screen), bring the next content in sooner, or cut the scene. A line of type on an empty stage is done in about one screen.' });
    }
    // every beat of each product replay in the film: replay.js marks the beat it shows (data-beat)
    if (filmHere && ex && (ex.replays || []).length && !allow.includes('replay-unseen')) {
      const seenBeats = new Map(), stuck = new Map();
      for (const c of filmChecks) for (const [i, b] of c?.replays || []) { if (!seenBeats.has(i)) seenBeats.set(i, new Set()); if (b != null && b !== '') seenBeats.get(i).add(+b); }
      // how long each window stood still on screen while the film scrolled (the hold as a visitor gets it: an
      // ancestor with overflow: hidden breaks a sticky stage that the markup alone says is held)
      for (const k of [...new Set(filmChecks.filter((c) => c && c.step != null).map((c) => c.step))].sort((a, b) => a - b)) {
        const c = [...filmChecks].reverse().find((x) => x && x.step === k);
        for (const [i, , top] of c?.replays || []) { const s = stuck.get(i) || { last: null, prev: null, run: 0, best: 0 }; s.run = s.prev === k - 1 && s.last != null && Math.abs(top - s.last) <= h * 0.08 ? s.run + 1 : 0; s.best = Math.max(s.best, s.run); s.last = top; s.prev = k; stuck.set(i, s); }
      }
      ex.replays.forEach((r, i) => {
        const filmHeld = Math.round((((stuck.get(i)?.best) || 0) * stride) / 3 * 10) / 10;
        // (replay.js plays from data-replay-start when the window's first state shows under half its words)
        const played = Math.max(1, r.beats - (r.start || 0));
        if (r.held >= played * 0.35 && filmHeld < played * 0.3 && !allow.includes('replay-not-held')) findings.push({ level: 'FAIL', id: 'replay-not-held', width: w, message: `The product replay's stage is marked held, but in the scroll film it stood still for only ${filmHeld} screens for ${played} beats.`, fix: 'Something breaks the sticky stage: an ancestor with overflow: hidden or auto (overflow: clip keeps it working), or a section with other children after the stage. The stage stays put while the beats play.' });
        const got = seenBeats.get(i), want = Array.from({ length: Math.max(1, r.beats) }, (_, k) => k + 1), missing = want.filter((k) => !got || !got.has(k));
        const skipped = r.start && missing.length && missing.every((k) => k <= r.start);
        if (missing.length) findings.push({ level: 'FAIL', id: 'replay-unseen', width: w, message: !got ? `The product replay${ex.replays.length > 1 ? ` ${i + 1}` : ''} never stood in view in the scroll film.` : !got.size ? `The product replay${ex.replays.length > 1 ? ` ${i + 1}` : ''} showed no beat in the scroll film (no data-beat: it does not run on the current assets/replay.js).` : skipped ? `Beat(s) ${missing.join(', ')} of ${want.length} of the product replay never show: its window shows under half its words before beat 1, so replay.js starts at beat ${r.start}.` : `Beat(s) ${missing.join(', ')} of ${want.length} of the product replay never showed in the scroll film (it saw ${[...got].sort().join(', ') || 'none'}).`, fix: skipped ? 'Write the window\'s first state full: the visitor\'s own rows and figures before the task, and mark only what the task adds (references/motion.md, "Product replay"); an empty window before beat 1 is skipped.' : 'Build it with assets/replay.js in a held stage (.replay-hold > .replay-stage): each beat then holds about half a screen of scroll and every one of them is on screen long enough to read. A replay that runs on its own clock is over, or not begun, while the visitor scrolls past.' });
      });
    }
    // round 7: how much of the screen each beat visibly changes, measured with the stage still and any drawn cursor
    // hidden (r7-p33's beats changed 0.6%, 0.0%, 3.8% and 0.4% of the screen; the judge saw no big moment). A beat that
    // registers changes about 2.5% of the screen or more (a row 650px by 50px at 1440); the largest, 8% or more.
    // Round 9: a faint beat (under 2.5%) is a warning, and so is a largest beat under 8%; most beats faint (more than
    // half) fails. r8-p38's replay, whose first beat measured 0.4% to 0.7%, was seen and named by its judge.
    // Round 10, part B: measured against the window, not the screen. Each beat changes about a third of the window; one
    // that changes under 15% of it is faint (r9-p41's beats changed 4% to 24% of the screen, 7% to 40% of its window, and
    // the judge found the replay quiet): one faint beat, or a largest beat under 30%, warns; most beats faint fails.
    replayRuns.forEach((rb, i) => {
      if (!rb) return;
      const r = ex?.replays?.[i] || {}, which = ex?.replays?.length > 1 ? ` ${i + 1}` : '';
      const pct = (v) => `${Math.round(v * 100)}%`;
      const winOf = (k) => (rb.states.find((s) => s.k === k) || rb.states[rb.states.length - 1] || {}).win || null;
      const ds = rb.diffs.filter((d) => d.cells != null).map((d) => { const wn = winOf(d.k); const share = wn && wn.w * wn.h > 0 ? Math.min(1, (d.cells * w * h) / (wn.w * wn.h)) : d.cells; return { ...d, share }; });
      if (ds.length && !allow.includes('replay-faint')) {
        const max = Math.max(...ds.map((d) => d.share));
        const faint = ds.filter((d) => d.share < 0.15);
        const cursorOnly = ds.filter((d) => d.withCursor != null && d.cells < 0.005 && d.withCursor >= d.cells + 0.0004);
        const level = faint.length > ds.length / 2 ? 'FAIL' : faint.length || max < 0.3 ? 'WARN' : null;
        if (level) findings.push({ level, id: 'replay-faint', width: w, message: `The product replay${which} ${level === 'FAIL' ? 'barely changes its window from beat to beat' : faint.length ? `has ${faint.length === 1 ? 'a faint beat' : `${faint.length} faint beats`}` : 'has no large beat'}${rb.clock ? ' (played on its own clock from its Replay button, each change taken once it rested)' : ''}: ${ds.map((d) => `${rb.clock ? 'change' : 'beat'} ${d.k} ${pct(d.share)}${faint.includes(d) ? ' (faint)' : ''}${cursorOnly.includes(d) ? ' (only the cursor moved)' : ''}`).join(', ')} of the window, the largest ${pct(max)}. A beat changes about a third of the window; under 15% is faint, and most beats faint fails.${r.boxes?.length >= 3 ? ' Its items are boxes a step from the window\'s fill, so a change among them hardly shows.' : ''}`, fix: 'Make each beat one large change, about a third of the window: a panel or drawer opens (data-open-at), the item at work takes the accent fill (data-focus-at), a full-size item arrives or moves while the rest make room (data-push, data-flip-at), a figure at display size rolls, or the view moves in on the region at work (data-zoom-at). The decisive change is the largest, in the accent; the window\'s text is 18px or more. A word swapped in a muted line, one figure, a 2px press or frame, a fill a step from its ground or a cursor moving is not a beat (references/motion.md, "Product replay"); look at the beats side by side in the replay sheet.' });
      }
      // the held stage fills the screen: the empty bands above and below it (a bar fixed to the top is not empty)
      const held = rb.states.filter((s) => s.stuck);
      if (held.length && !allow.includes('replay-bands')) {
        const s = held[held.length - 1];
        const above = Math.max(0, s.top - s.bar), below = Math.max(0, h - s.foot), share = (above + below) / h;
        const level = share > 0.33 ? 'FAIL' : share > 0.25 || above > h * 0.15 || below > h * 0.15 ? 'WARN' : null;
        if (level) findings.push({ level, id: 'replay-bands', width: w, message: `While the product replay${which} is held, ${Math.round(share * 100)}% of the screen is empty: ${above}px above its stage and ${below}px below it.`, fix: 'The held stage fills the screen: replay.js centres it, so the stage (heading, window, sentence, Replay) is 75% of the screen\'s height or more (about 680px at 1440 by 900). Make the window larger (larger type, more of the rows, the panel that does the task at full height), the heading and the sentence close to it, no padding round the stage; empty bands while the visitor scrolls through the hold read as dead space.' });
      }
    });
    // the product replay the sheet dealt (draw.mjs section 8)
    if (dealtReplay && w >= 1100 && ex && !(ex.replays || []).length && !allow.includes('replay-missing')) findings.push({ level: 'FAIL', id: 'replay-missing', width: w, message: `The sheet dealt the product replay "${dealtReplay.name || dealtReplay.id}" in the ${dealtReplay.carries || ''} section, but the page has no [data-replay].`, fix: 'Build the product replay the sheet deals (section 8): the product\'s window in its final state with data-replay and its marked beats, assets/replay.js, and a Replay button under it.' });
    if (w >= 1100 && empty.length >= 2 && !allow.includes('empty-screens')) findings.push({ level: 'FAIL', id: 'empty-screens', width: w, message: `${empty.length} of ${frameChecks.length} desktop screens are almost empty ground (under 20% of the screen holds text, a picture or a colour field): screens ${empty.map(({ f, i }) => screenOf(f, i)).join(', ')}.`, fix: 'An empty screen is a rest only once per page. Elsewhere it means the section is underbuilt: set its content larger, give it the full information, put it on a colour field, or cut it.' });
    report.viewports.push({ width: w, height: h, load: how, screens: frames.length, pageScreens, stride, extra: ex, reached: reached.map((r) => (r ? r.found : null)), upReach: upReach ? upReach.found : null, unread, overText, frameErrors, filled: frameChecks.map((f) => f?.filled ?? null), content: frameChecks.map((f) => f?.content ?? null), filmContent: filmChecks.map((f) => (f ? [Math.round(f.y / h * 10) / 10, f.content] : null)), motion, metrics: m, layout: lay, app: appM, consoleErrors: page.consoleErrors.slice(0, 5), missingImages: [...missingPics.keys()].slice(0, 12), photoText: [...onPhoto.values()].slice(0, 24), letters: [...letterSeen.values()].map((v) => ({ text: v.text, size: v.size, shows: v.at.map((s) => s.shows) })), tileWalls: wallRuns, hero, visits, build, dead, rest: restRuns.map((r) => ({ y: r.y, dy: r.dy, end: r.end, clipped: r.clipped, pics: (r.pics || []).map((p) => `${p.file} ${p.area} @${p.t}`), heads: (r.heads || []).map((x) => `${x.kind} ${x.text.slice(0, 40)} @${x.t}`), veils: r.veils, cutHeads: r.cutHeads, edges: r.edges, strands: (r.strands || []).map(({ mask, ...x }) => x) })) });
    report.findings.push(...(appMode ? findings.filter((f) => !APP_SKIP.has(f.id)) : findings));
    report.images.push({ viewport: label, width: w, fold, pages: sheets, film: filmSheets, replay: replaySheets, walked: frames.length, stride, pageScreens, atFoot });
    if (replayRuns.length) report.viewports[report.viewports.length - 1].replayBeats = replayRuns.map((rb) => (rb ? { clock: rb.clock, beats: rb.diffs, states: rb.states.map((s) => ({ k: s.k, win: s.win, top: s.top, foot: s.foot, bar: s.bar, bare: s.bare, stuck: s.stuck })) } : null));
    await page.close();
  }
  // Under prefers-reduced-motion the page is the finished page: nothing may stay hidden waiting for an
  // animation that will not run. Two in three studied award pages had no reduced-motion rules at all.
  if (!appMode && widths.some((x) => x >= 1100) && !allow.includes('reduced-hidden')) {
    const rp = await browser.newPage({ width: 1440, height: 900, dsf: 1, reducedMotion: true });
    try {
      await rp.goto(url, { timeoutMs: 30000, settleMs: 1500 });
      const hidden = await rp.eval(`(() => {
        const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const rg = document.createRange();
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          const t = n.nodeValue.trim(); const el = n.parentElement; if (t.length < 3 || !el || el.closest('script, style, noscript, [aria-hidden="true"]')) continue;
          rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width < 2 || r.top > innerHeight || r.bottom < 0) continue;
          let o = 1, gone = false; for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.visibility === 'hidden') { gone = true; break; } o *= +cs.opacity; }
          if (gone || o < 0.1) out.push(t.slice(0, 40));
        }
        return out;
      })()`).catch(() => []);
      if (hidden.length >= 2) report.findings.push({ level: 'FAIL', id: 'reduced-hidden', width: 1440, message: `With reduced motion requested, ${hidden.length} text block(s) on the first screen stay invisible: ` + hidden.slice(0, 4).map((t) => `"${t}"`).join(', '), fix: 'Put every hidden starting state inside @media (prefers-reduced-motion: no-preference); the reduced page is the finished page (references/motion.md §8).' });
      // the product replay is its final state under reduced motion: nothing in it waits for a beat
      const replayHidden = await rp.eval(`(async () => {
        const out = [];
        for (const r of document.querySelectorAll('[data-replay]')) {
          r.scrollIntoView({ block: 'center' }); await new Promise((ok) => setTimeout(ok, 400));
          for (const e of r.querySelectorAll('[data-at]')) { let o = 1; for (let p = e; p && p !== r.parentElement; p = p.parentElement) o *= +getComputedStyle(p).opacity; if (o < 0.1) out.push((e.textContent || e.tagName).trim().slice(0, 30)); }
        }
        return out;
      })()`).catch(() => []);
      if (replayHidden.length) report.findings.push({ level: 'FAIL', id: 'reduced-hidden', width: 1440, message: `With reduced motion requested, ${replayHidden.length} part(s) of the product replay stay hidden: ` + replayHidden.slice(0, 4).map((t) => `"${t}"`).join(', '), fix: 'The replay\'s HTML is its final state: hide a beat\'s part only under .is-armed inside @media (prefers-reduced-motion: no-preference), as base.css does, and let replay.js do nothing under reduced motion.' });
    } finally { await rp.close(); }
  }
  // round 10, part B: the scenes in their finished compositions, on the reduced-motion page: lists drawn as boxes and
  // framed elements inside them (r9-p43's seasons: four perforated ticket boxes, which the live scene shows in flight)
  if (!appMode && widths.some((x) => x >= 1100)) {
    const sp = await browser.newPage({ width: 1440, height: 900, dsf: 1, reducedMotion: true });
    try {
      await sp.goto(url, { timeoutMs: 30000, settleMs: 1500 });
      if (await sp.eval(`document.querySelectorAll('.scene, [data-scene]').length`).catch(() => 0)) {
        const sx = await sp.eval(extra, { scenes: true }).catch(() => null);
        const sb = await sp.eval(pageBuild, { scenes: true }).catch(() => null);
        const lists = sx?.boxedLists || [];
        report.findings.push(...judgeExtra({ boxedLists: lists }, { width: 1440, allow, screens: 1 }).map((f) => ({ ...f, message: f.message.replace(/^(\d+ list\(s\) drawn as boxes that are not cards)/, '$1 in a scene\'s finished composition') })));
        if (sb) report.findings.push(...judgeBuild({ framed: sb.framed }, { width: 1440, allow, boxed: lists.filter((b) => b.how !== 'filled').map((b) => b.head) }));
        if (report.viewports[0]) report.viewports[0].scenesAtRest = { boxedLists: lists, framed: sb?.framed || [] };
      }
    } finally { await sp.close(); }
  }
} finally {
  await browser.close();
  if (server) server.close();
}

// de-duplicate findings that repeat across viewports (keep the widest occurrence, note the others)
const merged = [], joined = new Map();
for (const f of report.findings) {
  const same = merged.find((x) => x.id === f.id && x.level === f.level);
  // (a second finding under the same id at the same width says something else: keep its words)
  if (same && same.width === f.width && same.message !== f.message && f.id !== 'headline-lines' && f.id !== 'overflow') {
    const k = (joined.get(same) || 0) + 1; joined.set(same, k);
    if (k > 3 || same.message.includes(f.message)) continue;
    same.message += ' ' + f.message;
    const more = String(f.fix || '').split(/(?<=\.)\s+/).filter((s) => s && !String(same.fix || '').includes(s)).join(' ');
    if (more) same.fix = same.fix ? same.fix + ' ' + more : more;
    continue;
  }
  // (text cut off at another width names other words: a wordmark cut at its top on desktop must not hide a list cut
  // short on a phone, so those words are kept with their width)
  if (same && f.id === 'clipped-text' && f.width !== same.width) {
    const quoted = (m) => (m.match(/"[^"]+"/g) || []), k = (joined.get(same) || 0) + 1;
    if (k <= 3 && quoted(f.message).some((q) => !same.message.includes(q))) {
      joined.set(same, k); same.message += ` At ${f.width}px: ` + f.message;
      if (!(same.alsoAt || []).includes(f.width)) same.alsoAt = [...(same.alsoAt || []), f.width];
      const more = String(f.fix || '').split(/(?<=\.)\s+/).filter((s) => s && !String(same.fix || '').includes(s)).join(' ');
      if (more) same.fix = same.fix ? same.fix + ' ' + more : more;
      continue;
    }
  }
  if (same && f.id !== 'headline-lines' && f.id !== 'overflow') { if (f.width !== same.width && !(same.alsoAt || []).includes(f.width)) same.alsoAt = [...(same.alsoAt || []), f.width]; continue; }
  merged.push(f);
}
report.findings = merged;
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 1));

if (asJson) { console.log(JSON.stringify(report, null, 1)); process.exit(merged.some((f) => f.level === 'FAIL') ? 1 : 0); }

const d = report.viewports[0].metrics;
const line = (s = '') => console.log(s);
line(`TASTESKILL · INSPECT   ${report.url}`);
line('');
line('MEASURED (first viewport listed)');
if (d.hero) line(`  hero headline   "${d.hero.text.slice(0, 70)}"  ${d.hero.words} words · ${d.hero.lines} line(s) · ${d.hero.size}px (${d.hero.vw}vw) · ${d.hero.font} ${d.hero.weight} · tracking ${d.hero.tracking}em · leading ${d.hero.leading}`);
for (const v of report.viewports.slice(1)) if (v.metrics.hero) line(`  @${v.width}px          ${v.metrics.hero.lines} line(s) · ${v.metrics.hero.size}px`);
line(`  typefaces       ${d.type.families.filter((f) => f.share >= 0.02).map((f) => `${f.family} ${Math.round(f.share * 100)}%`).join(', ')}`);
line(`  sizes in use    ${d.type.sizes.join(' / ')} px${d.type.body ? `   body ${d.type.body.size}px / ${d.type.body.leading}` : ''}`);
line(`  colour          page ${d.color.bodyBg}${d.color.sectionBgs.length ? ' · sections ' + d.color.sectionBgs.map((s) => s.color).slice(0, 6).join(' ') : ''}${d.color.button ? ' · button ' + d.color.button.bg : ''}`);
line(`  page            ${d.page.screens} screens · ${d.page.words} words (${Math.round(d.page.words / Math.max(0.1, d.page.screens))} a screen) · ${d.page.img} images · hero media ${d.heroMedia[0] ? Math.round(d.heroMedia[0].ratio * 100) + '% ' + d.heroMedia[0].type : 'none'}`);
line(`  headings        ${d.headingSummary.count} · longest ${d.headingSummary.maxLines} line(s) · median ${d.headingSummary.medianWords ?? '-'} words`);
line('');
const fails = merged.filter((f) => f.level === 'FAIL'), warns = merged.filter((f) => f.level === 'WARN');
if (!fails.length && !warns.length) line('FINDINGS  none. Measurements are clean — now judge the pictures.');
for (const [title, list] of [['FAIL — fix every one of these', fails], ['WARN — fix, or be able to defend', warns]]) {
  if (!list.length) continue;
  line(title);
  for (const f of list) {
    line(`  [${f.id}] @${f.width}px${f.alsoAt ? ' (+' + f.alsoAt.join(', ') + ')' : ''}  ${f.message}`);
    line(`      → ${f.fix}`);
  }
  line('');
}
line('LOOK AT THE RENDER — open these with your image viewer / Read tool before saying anything about quality:');
const rel = (p) => relative(process.cwd(), p).split('\\').join('/');
for (const im of report.images) {
  line(`  ${(im.viewport + ' ' + im.width + 'px').padEnd(15)} ${rel(im.fold)}   (${im.walked} screens photographed and checked${im.stride > 1 ? `, one in every ${im.stride}` : ''}; ${im.atFoot ? 'the walk reached the foot of the page' : `the walk stopped before the foot of a ${im.pageScreens}-screen page`})`);
  for (const p of im.pages) line(`  ${''.padEnd(15)} ${rel(p)}`);
  for (const p of im.film || []) line(`  ${'scroll film'.padEnd(15)} ${rel(p)}  (6 frames a row, a third of a screen apart)`);
  for (const p of im.replay || []) line(`  ${'replay beats'.padEnd(15)} ${rel(p)}  (each beat of the product replay, its window held still, with the share of the window it changed)`);
}
line('');
line(`report: ${rel(join(outDir, 'report.json'))}`);
line(fails.length ? `RESULT: ${fails.length} FAIL, ${warns.length} WARN — not done.` : `RESULT: 0 FAIL, ${warns.length} WARN — measurements pass. Passing the meter is the floor, not the grade: score the screenshots with references/critique.md.`);
process.exit(fails.length ? 1 : 0);
