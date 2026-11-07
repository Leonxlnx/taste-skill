#!/usr/bin/env node
/*
  taste-skill icons.mjs - the one resolver for real brand, file-type and interface icons, as local SVG files.
  Every icon comes from a pinned source on cdn.jsdelivr.net, is cached outside the site (the system temp folder) and is
  written into the site as a file (no runtime CDN, full colour kept) with an icons-credits.json beside it. diagram.js
  and every page read those files; nothing else resolves an icon, tints one or fetches one at runtime.

    node <skill>/scripts/icons.mjs find google docs          which icons match, in every set, with licence
    node <skill>/scripts/icons.mjs apps [--tag storage]      the curated list: apps and file types by short name
    node <skill>/scripts/icons.mjs list --set logos --tag storage
    node <skill>/scripts/icons.mjs fetch google-docs slack file:pdf2 ui:arrow-right --out assets/icons
    node <skill>/scripts/icons.mjs fetch --tag storage --out assets/icons     every curated app with that tag
    node <skill>/scripts/icons.mjs fetch --all --out <dir>     every curated icon (the demo uses this)
    node <skill>/scripts/icons.mjs scan index.html [more.html ...] --out assets/icons
                                                             fetch every icon a page's diagrams and data-icon tags name
    node <skill>/scripts/icons.mjs check                     does every entry resolve, are the ids unique, which marks are wide / ink / paper
    node <skill>/scripts/icons.mjs check --mark              the same, and writes wide / tone / violet back into index.json
    node <skill>/scripts/icons.mjs measure                   maintenance: measures every colour mark's drawn box in headless Chrome
                                                             (CPU flags, closed by its own PID) into index.json "boxes"; fetch crops to it

  ids   <app>          a curated app or file type by its short name (google-docs, pdf, slack)
        <set>:<name>   one icon of a set
  sets  logos    Gil Barbara's logos, full-colour SVGs (CC0), read from cdn.jsdelivr.net/gh/gilbarbara/logos at the commit
                 pinned below (the repository has no tags): the first choice, about 1,500 brands
        si       Simple Icons 16.30.0, one-colour marks painted in the brand hex (CC0): the fallback, only where no colour
                 mark exists (the Google Docs, Sheets and Slides editors, Calendly, Evernote ...)
        file     Iconify "vscode-icons" 1.2.30, file types and folders in colour (MIT): a document type, never a brand
        ui       Iconify "lucide" 1.2.100, interface glyphs, one clean line set (ISC)
  There is no other source: theSVG ("brands") was dropped, because the licence it records per mark is its own
  label and not a grant by the owner (some of its Microsoft marks say outright that no licence was supplied), and a press-kit
  download is not a path this skill takes. Brand marks belong to their owners: use them only to name tools the product
  really works with, never to imply endorsement.
  The violet rule (a judgement, stated): "never violet or lavender" is about the page's own design. A third-party logo is
  its owner's mark and is never recoloured: fetch and scan keep every mark's own colours by default, violet ones too (Stripe,
  Twitch, Sentry, Google Forms: half or more of their coloured fills are violet), because the real logo is what makes the
  page look official. Such a mark is flagged [violet] and fetch says so on stderr: keep it small (an icon tile, a diagram
  node, never a block of violet), or pass --mono to print it in the text colour (paper parts cut out), or leave it out.
  --colour is accepted and is the default. Pass --mono for a row of customer logos.
  The cache of downloaded sets lives outside the site (the system temp folder, or TASTE_SKILL_ICON_CACHE); fetch refuses
  a cache that sits under --out, so it can never be published with the site.

  fetch prints one tag per icon. Colour icons come as <img class="ic ic-24" src="...">. A ui glyph and any
  --mono icon come as an inline <svg class="ic ic-svg ic-24"> in the text colour, which works from file://
  and over http alike (--mask prints the old <span class="ic-mask"> form instead; a mask needs http, Chrome
  drops it from file://). The default size is 24 for a glyph and 40 for a colour icon. A black mark such as GitHub or Notion gets class ic-ink, a white one ic-paper; icon.css
  turns them to suit the ground. A wordmark (width over 1.8 times its height: Stripe, Visa) gets ic-wide
  and a note on stderr: print it with --tile, which wraps every icon in an .ic-tile (a wordmark in
  .ic-tile--wide) and reads --size as the tile size (24 32 40 48 56 72).
  --size 16|20|24|28|32|36|40|48|56 sets the printed size, --mono turns any set into a one-colour glyph,
  --base /assets/icons sets the folder written into src (default: --out as given, relative to where you run this; an
  absolute --out outside the current folder is refused). "get" is the old name of "fetch".
  From code: import { resolveIcon, loadIndex } from './icons.mjs' gives the same resolver (the CLI only runs when this file is
  run directly).
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.resolve(HERE, '..', 'assets', 'icons', 'index.json');
/* Gil Barbara's repository has no tags or releases, so the source is pinned to a commit (26 Oct 2026). jsDelivr serves
   gh/<user>/<repo>@<commit>/<path>; the logos are logos/<name>.svg and logos.json lists them with their site. */
const LOGOS_SHA = 'd6960edc1b7309d392c76e40d3a320df7f9ff85c';
const CDN = 'https://cdn.jsdelivr.net/npm/';
const GH = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@' + LOGOS_SHA + '/';
const SETS = {
  logos: { pkg: 'gilbarbara/logos', ver: LOGOS_SHA, label: 'SVG Logos (Gil Barbara)', kind: 'colour', licence: 'CC0-1.0', author: 'Gil Barbara', url: 'https://github.com/gilbarbara/logos',
    terms: 'CC0 covers the drawings as collected (LICENSE.txt at the pinned commit). Each mark is still the trademark of its owner: nominative use only, never to imply endorsement.' },
  file: { pkg: '@iconify-json/vscode-icons', ver: '1.2.30', label: 'VSCode Icons', kind: 'colour', licence: 'MIT', author: 'Roberto Huertas', url: 'https://github.com/vscode-icons/vscode-icons', prefixes: ['file-type-', 'default-', 'folder-type-'] },
  ui: { pkg: '@iconify-json/lucide', ver: '1.2.100', label: 'Lucide', kind: 'line', licence: 'ISC', author: 'Lucide Contributors', url: 'https://github.com/lucide-icons/lucide' },
  si: { pkg: 'simple-icons', ver: '16.30.0', label: 'Simple Icons', kind: 'mono', licence: 'CC0-1.0', author: 'Simple Icons Collaborators', url: 'https://github.com/simple-icons/simple-icons',
    terms: 'CC0 covers the drawings. A one-colour mark painted in the brand hex, used only where no colour mark exists. Each mark is still the trademark of its owner: nominative use only.' },
};
const ALIAS = { vscode: 'file', lucide: 'ui', logo: 'logos', gilbarbara: 'logos', simple: 'si' };
const REMOVED = ['brands', 'brand', 'thesvg'];
const logoListUrl = () => GH + 'logos.json';
const logoFileUrl = n => GH + 'logos/' + n + '.svg';
const siData = () => `${CDN}simple-icons@${SETS.si.ver}/data/simple-icons.json`;
const siIcon = s => `${CDN}simple-icons@${SETS.si.ver}/icons/${s}.svg`;
const setJson = s => `${CDN}${SETS[s].pkg}@${SETS[s].ver}/icons.json`;

const CACHE = path.resolve(process.env.TASTE_SKILL_ICON_CACHE || path.join(os.tmpdir(), 'taste-skill-icons-cache'));
const argv = process.argv.slice(2);
const valueFlags = new Set(['out', 'set', 'tag', 'size', 'limit', 'base']);
const flag = k => argv.includes('--' + k);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const positional = () => argv.slice(1).filter((a, i, arr) => !a.startsWith('--') && !valueFlags.has((arr[i - 1] || '').replace(/^--/, '')));

async function fetchCached(url) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, url.replace(/^https:\/\//, '').replace(/[^a-z0-9.@-]+/gi, '_'));
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const t = await r.text();
  fs.writeFileSync(f, t);
  return t;
}
let noCrop = false;
const memo = {};
const loadBoxes = () => (memo.boxes ||= (() => { try { return loadIndex().boxes || {}; } catch { return {}; } })());
const iconify = async s => (memo[s] ||= JSON.parse(await fetchCached(setJson(s))));
const logoIndex = async () => (memo.logos ||= JSON.parse(await fetchCached(logoListUrl())));
/* the set's own file names: logos.json lists them per brand (shortname, name, site, files) */
const logoNames = async () => (memo.logoNames ||= (await logoIndex()).flatMap(b => b.files.map(f => ({ key: f.replace(/\.svg$/, ''), brand: b }))));
/* a raw logo SVG reduced to what the pipeline works with: its inner markup and its drawing box */
function rawLogo(text) {
  const t = text.replace(/<\?xml[\s\S]*?\?>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->|<metadata[\s\S]*?<\/metadata>|<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/gi, '').trim();
  const root = t.match(/<svg\b([^>]*)>/i);
  if (!root) throw new Error('not an svg');
  const num = k => { const m = root[1].match(new RegExp('\\s' + k + '="\\s*([-\\d.]+)')); return m ? +m[1] : null; };
  const vbm = root[1].match(/viewBox="([^"]+)"/i);
  let vb = vbm ? vbm[1].trim().split(/[\s,]+/).map(Number) : null;
  if (!vb || vb.length !== 4 || vb.some(n => !isFinite(n))) vb = [0, 0, num('width') || 24, num('height') || 24];
  const body = t.slice(root.index + root[0].length, t.lastIndexOf('</svg>')).trim();
  return { body, width: vb[2], height: vb[3], left: vb[0], top: vb[1], xlink: /xlink:/.test(body) };
}
const siList = async () => (memo.si ||= (j => (Array.isArray(j) ? j : j.icons))(JSON.parse(await fetchCached(siData()))));
const siSlug = t => t.slug || t.title.toLowerCase().replace(/\+/g, 'plus').replace(/\./g, 'dot').replace(/&/g, 'and').normalize('NFD').replace(/[^a-z0-9]/g, '');
const clean = s => s.replace(/[^a-z0-9._-]/gi, '');
const loadIndex = () => JSON.parse(fs.readFileSync(INDEX, 'utf8'));

/* ------------------------------------------------------------- resolving one icon */
function iconifyKey(set, j, name) {
  const cands = [name, ...(SETS[set].prefixes || []).map(p => (name.startsWith(p) ? name : p + name))];
  for (const k of cands) {
    if (j.icons[k]) return { key: k, icon: j.icons[k] };
    const parent = j.aliases?.[k]?.parent;
    if (parent && j.icons[parent]) return { key: parent, icon: j.icons[parent] };
  }
  return null;
}
function colours(body) {
  const out = [];
  for (const m of body.matchAll(/(?:fill|stroke|stop-color)\s*[=:]\s*["']?\s*(#[0-9a-f]{3,8}|[a-z]+)/gi)) out.push(m[1].toLowerCase());
  return out;
}
const rgb = h => {
  const n = { white: 'ffffff', black: '000000' }[h] || h.replace('#', '');
  if (!/^[0-9a-f]{3,8}$/.test(n)) return null;
  const f = n.length <= 4 ? n.split('').slice(0, 3).map(c => c + c).join('') : n.slice(0, 6);
  return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16));
};
/* 'ink' = a mark of near-black only (it vanishes on a dark ground), 'paper' = a mark of near-white only */
function tone(body) {
  if (/gradient|<image|<filter/i.test(body)) return '';
  const raw = colours(body).filter(c => c !== 'none' && c !== 'currentcolor' && c !== 'url');
  const cs = raw.map(rgb);
  if (cs.some(c => !c)) return '';   // a named or unparsed colour (red, ...) is a colour mark
  if (!cs.length) return /<path|<rect|<circle/.test(body) && !/fill="none"/.test(body) ? 'ink' : '';
  const grey = c => Math.max(...c) - Math.min(...c) < 36;
  if (cs.every(c => grey(c) && Math.max(...c) < 90)) return 'ink';
  if (cs.every(c => grey(c) && Math.min(...c) > 225)) return 'paper';
  return '';
}

/* 'violet' = most of the coloured pixels are violet or lavender (Stripe, Twitch): the skill's palette has none */
function violetShare(body) {
  const cs = colours(body).map(rgb).filter(c => c && Math.max(...c) - Math.min(...c) >= 36);
  if (!cs.length) return 0;
  const isV = ([r, g, b]) => {
    const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, d = mx - mn, l = (mx + mn) / 2;
    if (!d) return false;
    const sat = d / (1 - Math.abs(2 * l - 1));
    const h = mx * 255 === r ? ((g - b) / 255 / d + (g < b ? 6 : 0)) * 60 : mx * 255 === g ? ((b - r) / 255 / d + 2) * 60 : ((r - g) / 255 / d + 4) * 60;
    return h >= 240 && h <= 312 && sat > 0.25 && l > 0.3 && l < 0.88;
  };
  return cs.filter(isV).length / cs.length;
}
const violet = body => violetShare(body) >= 0.5;
/* paper = the near-white parts of a multi-tone mark (a page, a letter, a highlight): in a one-colour print they must stay
   cut out, or the whole mark fills solid */
const isPaper = v => { const c = rgb(String(v).trim().toLowerCase()); return !!c && Math.min(...c) >= 235; };
const hasPaper = svg => [...svg.matchAll(/\sfill="([^"]*)"/gi)].some(m => isPaper(m[1]));
const hasInk = svg => [...svg.matchAll(/\sfill="([^"]*)"/gi)].some(m => !/^(none|currentcolor)$/i.test(m[1]) && !isPaper(m[1]));
/* a one-colour silhouette in currentColor, from the same alpha shape a CSS mask would use (null: too complex, use a mask).
   A multi-tone mark with near-white parts gets a real knockout: the shapes are drawn into an SVG mask (colour = shown,
   paper = cut out, in the same paint order) and one currentColor plate is shown through it. */
/* a dark tile with light letters (Premiere, After Effects: #00005b with #99f): the first fill is the tile, and a clearly lighter
   fill on it is a cut-out too, or the print is a solid square */
const lum = c => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
function paperTest(svg) {
  const first = [...svg.matchAll(/\sfill="([^"]*)"/gi)].map(m => rgb(m[1].trim().toLowerCase())).find(Boolean);
  const dark = first && lum(first) <= 0.15;
  return v => { if (isPaper(v)) return true; const c = dark && rgb(String(v).trim().toLowerCase()); return !!c && lum(c) >= 0.45; };
}
function monoSvg(svg, key = 'm') {
  if (/<mask|<filter|<image|<style|\sstyle="(?![^"]*fill)/i.test(svg)) return null;
  let s = svg.replace(/\sstyle="[^"]*"/gi, '');
  const paper = paperTest(s);
  const knocks = [...s.matchAll(/\sfill="([^"]*)"/gi)].map(m => m[1]);
  if (knocks.some(paper) && knocks.some(v => !/^(none|currentcolor)$/i.test(v) && !paper(v))) {
    const root = s.match(/^<svg[^>]*>/)[0];
    const vb = (root.match(/viewBox="([^"]+)"/) || [])[1];
    if (!vb) return null;
    const [x, y, w, h] = vb.split(/[\s,]+/).map(Number);
    const inner = s.slice(root.length, s.lastIndexOf('</svg>')).replace(/\s(fill|stroke)="([^"]*)"/gi, (m, k, v) => (/^none$/i.test(v) ? m : ' ' + k + '="' + (paper(v) ? '#000' : '#fff') + '"'));
    const id = 'k-' + String(key).replace(/[^a-z0-9]/gi, '');
    const root2 = root.replace(/\sfill="[^"]*"/, '');
    return root2 + '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"><g fill="#fff">' + inner + '</g></mask></defs><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="currentColor" mask="url(#' + id + ')"/></svg>';
  }
  s = s.replace(/\s(fill|stroke)="(?!none")[^"]*"/gi, (m, k) => ` ${k}="currentColor"`);
  if (!/^<svg[^>]*\sfill=/.test(s)) s = s.replace(/^<svg /, '<svg fill="currentColor" ');
  return s;
}

/* The box the drawing really fills. Some brands (Visa, Wix) are a wordmark in a square viewBox: judged by the
   viewBox they look square and print as a tiny bare stripe, so the box is measured from the shapes
   (control points count, so curves read slightly large; a transform, mask or image gives up and returns null). */
function contentBox(body) {
  if (/\stransform=|<use|<image|<text|<mask|<clipPath|<filter/i.test(body)) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, n = 0;
  const pt = (x, y) => { if (isFinite(x) && isFinite(y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; } };
  const attr = (src, k) => +((src.match(new RegExp('\\s' + k + '="([-\\d.]+)"')) || [])[1] || 0);
  for (const m of body.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)) {
    let cx = 0, cy = 0, sx = 0, sy = 0;
    for (const seg of m[1].matchAll(/([a-zA-Z])([^a-zA-Z]*)/g)) {
      const c = seg[1], r = c === c.toLowerCase();
      const v = (seg[2].match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || []).map(Number);
      const L = c.toLowerCase();
      if (L === 'z') { cx = sx; cy = sy; continue; }
      const take = (k, f) => { for (let i = 0; i + k <= v.length; i += k) f(v.slice(i, i + k)); };
      if (L === 'm') take(2, a => { cx = r ? cx + a[0] : a[0]; cy = r ? cy + a[1] : a[1]; sx = cx; sy = cy; pt(cx, cy); });
      else if (L === 'l' || L === 't') take(2, a => { cx = r ? cx + a[0] : a[0]; cy = r ? cy + a[1] : a[1]; pt(cx, cy); });
      else if (L === 'h') take(1, a => { cx = r ? cx + a[0] : a[0]; pt(cx, cy); });
      else if (L === 'v') take(1, a => { cy = r ? cy + a[0] : a[0]; pt(cx, cy); });
      else if (L === 'c') take(6, a => { for (let i = 0; i < 6; i += 2) pt(r ? cx + a[i] : a[i], r ? cy + a[i + 1] : a[i + 1]); cx = r ? cx + a[4] : a[4]; cy = r ? cy + a[5] : a[5]; });
      else if (L === 's' || L === 'q') take(4, a => { for (let i = 0; i < 4; i += 2) pt(r ? cx + a[i] : a[i], r ? cy + a[i + 1] : a[i + 1]); cx = r ? cx + a[2] : a[2]; cy = r ? cy + a[3] : a[3]; });
      else if (L === 'a') take(7, a => { cx = r ? cx + a[5] : a[5]; cy = r ? cy + a[6] : a[6]; pt(cx, cy); });
    }
  }
  for (const m of body.matchAll(/<rect\b([^>]*)>/g)) { pt(attr(m[1], 'x'), attr(m[1], 'y')); pt(attr(m[1], 'x') + attr(m[1], 'width'), attr(m[1], 'y') + attr(m[1], 'height')); }
  for (const m of body.matchAll(/<circle\b([^>]*)>/g)) { const [cx, cy, r] = ['cx', 'cy', 'r'].map(k => attr(m[1], k)); pt(cx - r, cy - r); pt(cx + r, cy + r); }
  for (const m of body.matchAll(/<(?:polygon|polyline)\b[^>]*?\spoints="([^"]+)"/g)) { const v = m[1].match(/-?[\d.]+/g).map(Number); for (let i = 0; i + 1 < v.length; i += 2) pt(v[i], v[i + 1]); }
  return n ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

async function resolve(id, idx) {
  let set, name;
  const app = idx && (idx.apps.find(a => a.id === id) || idx.files.find(a => a.id === id) || idx.apps.find(a => a.id === id.replace(/^app:/, '')));
  if (!id.includes(':') || id.startsWith('app:')) {
    if (!app) throw new Error(`"${id}" is not a curated app or file (try: icons.mjs find ${id.replace(/^app:/, '').slice(0, 6)})`);
    [set, name] = app.icon.split(':');
  } else [set, name] = id.split(':');
  set = ALIAS[set] || set;
  name = clean(name);
  if (REMOVED.includes(set)) throw new Error(`the "${set}" set (theSVG) was dropped: no licence per mark is verified. Use logos:<name>, or the si: one-colour mark where no colour mark exists (icons.mjs find <name>)`);
  if (!SETS[set]) throw new Error(`unknown set "${set}" (${Object.keys(SETS).join(', ')})`);
  const meta = SETS[set];
  let j, hit, ic, brand = null, xlink = false, siT = null;
  if (set === 'si') {
    siT = (await siList()).find(x => siSlug(x) === name);
    if (!siT) throw new Error(`si:${name} not found (try: icons.mjs find ${name.slice(0, 5)})`);
    ic = rawLogo(await fetchCached(siIcon(name)));
    hit = { key: name, icon: ic };
    j = { width: ic.width, height: ic.height };
  } else if (set === 'logos') {
    const known = (await logoNames()).find(x => x.key === name);
    if (!known) throw new Error(`logos:${name} not found (try: icons.mjs find ${name.slice(0, 5)})`);
    brand = known.brand;
    ic = rawLogo(await fetchCached(logoFileUrl(name)));
    xlink = ic.xlink;
    hit = { key: name, icon: ic };
    j = { width: ic.width, height: ic.height };
  } else {
    j = await iconify(set);
    hit = iconifyKey(set, j, name);
    if (!hit) throw new Error(`${set}:${name} not found (try: icons.mjs find ${name.slice(0, 5)})`);
    ic = hit.icon;
  }
  const w = ic.width || j.width || 16, h = ic.height || j.height || 16;
  const left = ic.left || 0, top = ic.top || 0;
  let vb = [left, top, w, h], W2 = w, H2 = h;
  /* Crop at fetch time. The drawing's true box comes from `icons.mjs measure` (index.json "boxes", measured in a
     browser, so a transform, a clip or a mask is no obstacle); a mark that is not in that table is measured from its
     path points when it has no transform. A logos mark that fills less than 94% of its box in either
     direction is cut to its drawing (2% margin), so it fills its tile like the rest and a landscape or portrait mark gets
     its true proportions (the tile and file card then size it by class, see ic-land / ic-tall in icon.css). A wordmark in a
     squarer box is cut the same way. Not for the file set (its page shapes are padded on purpose, so a folder and a file
     keep the same footing) and not for the ui set. --nocrop keeps the set's own box. */
  const known = set === 'ui' ? null : (loadBoxes()[`${set}:${hit.key}`] || null);
  const cb = set === 'ui' ? null : known ? { x: known[0], y: known[1], w: known[2], h: known[3] } : contentBox(ic.body);
  let cropped = false;
  const cut = pad => { vb = [cb.x - pad, cb.y - pad, cb.w + 2 * pad, cb.h + 2 * pad].map(n => +n.toFixed(3)); W2 = vb[2]; H2 = vb[3]; cropped = true; };
  if (!noCrop && cb && cb.w > 0 && cb.h > 0) {
    if (cb.w / cb.h > 1.8 && w / h < 1.8 && cb.h < h * 0.7) cut(Math.max(cb.w, cb.h) * 0.01);   // a wordmark in a squarer box
    else if ((set === 'logos' || set === 'si') && !flag('nocrop') && (cb.w < w * 0.94 || cb.h < h * 0.94)) cut(Math.max(cb.w, cb.h) * 0.02);
  }
  const line = set === 'ui' ? ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' : set === 'si' ? ` fill="#${siT.hex}"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"${xlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ''} viewBox="${vb.join(' ')}" width="${+W2.toFixed(2)}" height="${+H2.toFixed(2)}"${line}>${ic.body}</svg>`;
  const nice = name.replace(/^(file-type-|default-|folder-type-)/, '').replace(/-?\d+$/, '').split('-').filter(x => x && x !== 'icon').map(x => x[0].toUpperCase() + x.slice(1)).join(' ');
  const colBody = set === 'si' ? svg : ic.body;   // a Simple Icons mark carries its fill on the root
  return { set, name: hit.key, svg, title: app ? app.name : siT ? siT.title : nice, w: W2, h: H2, tone: set === 'ui' ? '' : tone(colBody), violet: set === 'ui' ? false : violet(colBody), violetShare: set === 'ui' ? 0 : violetShare(colBody), knock: set !== 'ui' && set !== 'si' && hasPaper(ic.body) && hasInk(ic.body), cropped, fill: cb ? +Math.max(cb.w / w, cb.h / h).toFixed(2) : null, kind: meta.kind, app, brand };
}

/* ------------------------------------------------------------- commands */
function fileName(r, id, idx, used) {
  const named = r.app && !id.includes(':');
  if (r.set === 'ui') return 'ui-' + r.name + '.svg';
  const base = named ? r.app.id : r.name.replace(/^(file-type-|default-)/, '');
  const taken = used[base] && used[base] !== `${r.set}:${r.name}`;
  return (taken ? `${r.set}-${base}` : base) + '.svg';
}

const SIZES = [16, 20, 24, 28, 32, 36, 40, 48, 56];
const TILES = [24, 32, 40, 48, 56, 72];
const fileCards = (idx, tag, set) => [...idx.apps, ...idx.files].filter(a => (!tag || a.tags.includes(tag)) && (!set || a.icon.startsWith(set + ':')));

async function fetchCmd(idsOverride, quiet) {
  const say = quiet ? () => {} : t => console.log(String(t).replace(/\s*\n\s*/g, ' '));   // one tag a line, always
  const idx = loadIndex();
  const out = opt('out', 'assets/icons');
  /* src must load from the page: a path relative to where this runs (the site root), or --base */
  let rel = out.replace(/\\/g, '/');
  if (path.isAbsolute(out)) {
    rel = path.relative(process.cwd(), path.resolve(out)).replace(/\\/g, '/');
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
      console.error(`icons: --out ${out} is outside the folder you run this from, so no page could load it. cd to the site root and use --out assets/icons (or pass --base /assets/icons to set the src folder yourself).`);
      process.exit(1);
    }
  }
  const base = (opt('base', rel) || rel).replace(/\/+$/, '');
  const tile = flag('tile');
  let ids = idsOverride || positional();
  const tag = opt('tag');
  if (flag('all')) ids = [...idx.apps.map(a => a.id), ...idx.files.map(a => a.id), ...idx.ui.map(u => 'ui:' + u.id)];
  else if (tag && !ids.length) {
    ids = fileCards(idx, tag, opt('set') && (ALIAS[opt('set')] || opt('set'))).map(a => a.id);
    if (tag && (!opt('set') || ALIAS[opt('set')] === 'ui' || opt('set') === 'ui')) ids.push(...idx.ui.filter(u => u.tags.includes(tag)).map(u => 'ui:' + u.id));
  }
  if (!ids.length) { console.error('icons: nothing to fetch (give ids, or --tag <tag>; icons.mjs list --tags shows the tags)'); process.exit(1); }
  { const o = path.resolve(out), c = path.resolve(CACHE), rl = path.relative(o, c); if (!rl || (!rl.startsWith('..') && !path.isAbsolute(rl))) { console.error(`icons: the cache (${c}) is inside --out (${o}) and would be published with the site: set TASTE_SKILL_ICON_CACHE to a folder outside it`); process.exit(1); } }
  fs.mkdirSync(out, { recursive: true });
  const credFile = path.join(out, 'icons-credits.json');
  let credits = [];
  try { credits = JSON.parse(fs.readFileSync(credFile, 'utf8')); } catch {}
  const used = Object.fromEntries(credits.map(c => [c.file.replace(/\.svg$/, ''), c.icon]));
  let failed = 0, brandsNote = false;
  for (const id of ids) {
    try {
      const r = await resolve(id, idx);
      const file = fileName(r, id, idx, used);
      used[file.replace(/\.svg$/, '')] = `${r.set}:${r.name}`;
      /* the decision is baked into the file, so diagram.js and any page read it and never guess again: data-ic is violet
         (print in the text colour), ink (a black mark: take the ink) or paper (a white mark) */
      const dataIc = r.set === 'ui' ? '' : r.violet && flag('mono') ? 'violet' : r.tone || '';   // violet (text colour in diagram.js) only when --mono asks for it
      fs.writeFileSync(path.join(out, file), dataIc ? r.svg.replace(/^<svg /, '<svg data-ic="' + dataIc + '" ') : r.svg);
      const m = SETS[r.set];
      credits = credits.filter(c => c.file !== file);
      credits.push({ file, icon: `${r.set}:${r.name}`, name: r.title, kind: r.kind, source: `${m.pkg}@${m.ver}`, author: m.author, licence: m.licence, url: m.url, trademark: r.set !== 'ui' && r.set !== 'file', ...(r.brand && r.brand.url ? { markUrl: r.brand.url } : {}), ...(r.set === 'si' ? { colour: 'one-colour fallback in the brand hex' } : {}) });
      if (r.set === 'si' && !brandsNote) { brandsNote = true; console.error('icons: a one-colour Simple Icons mark is the fallback where no colour mark exists. The marks are trademarks of their owners: name tools the product really works with, never imply endorsement. See references/icons.md.'); }
      const src = path.posix.join(base, file);
      const toMono = flag('mono');   // a third-party mark keeps its own colours, violet too (its owner's mark); --mono prints it in the text colour
      const glyph = toMono || r.set === 'ui';
      const size = +opt('size', (r.set === 'ui' || flag('mono')) && !tile ? 24 : 40);
      if (!SIZES.includes(size) && !(tile && TILES.includes(size))) console.error(`icons: size ${size} has no ic-${size} class in icon.css (${SIZES.join(' ')}), add one`);
      const k = r.w / r.h, wide = k > 1.8 && r.set !== 'ui';
      /* the drawn shape decides the class: a landscape mark (Salesforce, AWS) or a portrait one (Google Docs, Figma) is sized
         by icon.css so it fills a tile like a square mark does, instead of shrinking to fit a square box */
      const shape = r.set === 'ui' ? '' : wide ? ' ic-wide' : k > 1.25 ? ' ic-land' : k < 0.8 ? ' ic-tall' : '';
      const tileSize = TILES.includes(size) ? size : 40;
      const wrap = t => tile ? `<span class="ic-tile ic-tile--${tileSize}${wide ? ' ic-tile--wide' : ''}${r.set === 'ui' ? ' ic-tile--glyph' : ''}">${t}</span>` : t;
      if (wide && !tile) console.error(`icons: ${r.title} is a wordmark (${k.toFixed(1)}:1), print it with --tile so it gets a wide tile`);
      if (!r.violet && r.violetShare >= 0.1 && !flag('mono')) console.error(`icons: ${r.title} has a violet part (${Math.round(r.violetShare * 100)}% of its fills), printed as drawn: the real logo stays. --mono prints it in the text colour`);
      if (r.knock && glyph && flag('mask')) console.error(`icons: ${r.title} is multi-tone: --mask loses its cut-out parts, print it without --mask (inline svg keeps them)`);
      if (r.violet && !flag('mono')) console.error(`icons: ${r.title} is violet, printed in its own colours (its owner's mark): keep it small (a tile, a node), never a block of violet; --mono prints it in the text colour, or leave it out`);
      const mono = glyph && !flag('mask') ? (r.set === 'ui' ? r.svg : monoSvg(r.svg, r.name)) : null;
      if (mono) {
        /* only the root tag loses its width and height (a rect inside keeps its own) */
        const root = mono.match(/^<svg[^>]*>/)[0];
        const root2 = root.replace(/ (width|height)="[^"]*"/g, '').replace(/^<svg /, `<svg class="ic ic-svg ic-${size}${shape}" role="img" aria-label="${r.title}" `);
        say(wrap(root2 + mono.slice(root.length)));
      } else if (glyph) { const du = 'data:image/svg+xml,' + encodeURIComponent(r.svg).replace(/'/g, '%27'); say(wrap(`<span class="ic ic-${size} ic-mask" role="img" aria-label="${r.title}" style="-webkit-mask-image: url('${du}'); mask-image: url('${du}')"></span>`)); }
      else {
        const W = k >= 1 ? size : Math.round(size * k), H = k >= 1 ? Math.round(size / k) : size;
        say(wrap(`<img class="ic ic-${size}${shape}${r.tone === 'ink' ? ' ic-ink' : r.tone === 'paper' ? ' ic-paper' : ''}" src="${src}" alt="${r.title}" width="${W}" height="${H}">`));
      }
    } catch (e) { failed++; console.error(`icons: ${e.message}`); }
  }
  credits.sort((a, b) => a.file.localeCompare(b.file));
  fs.writeFileSync(credFile, JSON.stringify(credits, null, 2) + '\n');
  process.exit(failed ? 1 : 0);
}

const words = s => s.toLowerCase().split(/[\s,]+/).filter(Boolean);
const rank = (name, ws) => {
  const n = name.toLowerCase(), flat = n.replace(/-/g, '');
  let best = 9;
  for (const w of ws) {
    const v = n === w ? 0 : n.startsWith(w + '-') || n.startsWith(w) ? 1 : n.includes('-' + w) ? 2 : n.includes(w) || flat.includes(w.replace(/-/g, '')) ? 3 : 99;
    if (v === 99) return 99;
    best = Math.min(best, v);
  }
  return best;
};

async function findCmd() {
  const ws = words(positional().join(' '));
  if (!ws.length) { console.error('usage: icons.mjs find <words> [--set logos|file|ui|si] [--limit 24]'); process.exit(1); }
  const limit = +opt('limit', 24), only = opt('set') && (ALIAS[opt('set')] || opt('set'));
  const idx = loadIndex();
  const apps = [...idx.apps, ...idx.files].filter(a => (!only || a.icon.startsWith(only + ':')) && rank(a.id + ' ' + a.name + ' ' + a.tags.join(' '), ws) < 99 && rank(a.id + '-' + a.name.replace(/ /g, '-'), ws) < 99);
  if (apps.length) {
    console.log('curated (use the short name):');
    for (const a of apps.slice(0, 12)) console.log(`  ${a.id.padEnd(18)} ${a.name.padEnd(22)} -> ${a.icon}`);
  }
  for (const s of Object.keys(SETS)) {
    if (only && only !== s) continue;
    let names;
    if (s === 'si') names = (await siList()).map(siSlug);
    else if (s === 'logos') names = [...new Set((await logoNames()).map(x => x.key))];
    else { const j = await iconify(s); names = [...Object.keys(j.icons), ...Object.keys(j.aliases || {})]; }
    const hits = names.map(n => [n, rank(n, ws)]).filter(x => x[1] < 99).sort((a, b) => a[1] - b[1] || a[0].length - b[0].length).slice(0, limit).map(x => x[0]);
    const m = SETS[s];
    console.log(`${s} (${m.label}, ${m.kind}, ${m.licence}): ${hits.join(' ') || '-'}`);
  }
}

function listCmd() {
  const idx = loadIndex();
  const set = opt('set') && (ALIAS[opt('set')] || opt('set')), tag = opt('tag');
  if (flag('tags')) {
    const c = {};
    for (const a of [...idx.apps, ...idx.files]) for (const t of a.tags) c[t] = (c[t] || 0) + 1;
    console.log(Object.entries(c).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} (${n})`).join('  '));
    return;
  }
  if (set === 'ui') {
    const rows = idx.ui.filter(u => !tag || u.tags.includes(tag));
    for (const u of rows) console.log(`${('ui:' + u.id).padEnd(30)} ${u.tags.join(' ')}`);
    return;
  }
  const rows = [...idx.apps, ...idx.files].filter(a => (!set || a.icon.startsWith(set + ':')) && (!tag || a.tags.includes(tag)));
  for (const a of rows) console.log(`${a.id.padEnd(18)} ${a.name.padEnd(22)} ${a.icon.padEnd(36)} ${(a.tags || []).join(' ')}${a.wide ? '  [wordmark: --tile]' : ''}${a.tone ? `  [${a.tone}]` : ''}${a.violet ? '  [violet: kept in its colours; --mono for the text colour]' : ''}${a.icon.startsWith('si:') ? '  [one colour: no colour mark exists]' : ''}`);
  console.log(`${rows.length} icons`);
}

async function checkCmd() {
  const idx = loadIndex();
  let bad = 0, n = 0;
  const entries = [...idx.apps, ...idx.files];
  const seen = {};
  for (const a of entries) {
    if (seen[a.id]) { bad++; console.log(`DUPLICATE id "${a.id}": ${seen[a.id]} and ${a.icon}`); }
    seen[a.id] = a.icon;
  }
  const uiSeen = new Set();
  for (const u of idx.ui) { if (uiSeen.has(u.id)) { bad++; console.log(`DUPLICATE ui id "${u.id}"`); } uiSeen.add(u.id); }
  const all = [...entries.map(a => ({ a, id: a.icon })), ...idx.ui.map(u => ({ a: u, id: 'ui:' + u.id }))];
  const mono = [], wide = [], ink = [], paper = [], vio = [], part = [], knock = [], crop = [], unmeasured = [], small = [];
  for (const { a, id } of all) {
    n++;
    try {
      const r = await resolve(id, idx);
      if (r.set === 'ui') continue;
      if (r.set === 'si') { mono.push(a.id); if (r.tone === 'ink') ink.push(a.id); if (r.violet) vio.push(a.id); continue; }
      const isWide = r.w / r.h > 1.8;
      if (isWide) wide.push(a.id);
      if (r.tone === 'ink') ink.push(a.id);
      if (r.tone === 'paper') paper.push(a.id);
      if (r.violet) vio.push(a.id);
      else if (r.violetShare >= 0.1) part.push(`${a.id} ${Math.round(r.violetShare * 100)}%`);
      if (r.knock) knock.push(a.id);
      if (r.cropped) crop.push(a.id);
      if (r.fill === null && r.set === 'logos') unmeasured.push(a.id);
      else if (r.fill !== null && !r.cropped && r.fill < 0.7 && r.set === 'logos') small.push(`${a.id} ${r.fill}`);
      if (flag('mark')) { delete a.wide; delete a.tone; delete a.violet; if (isWide) a.wide = true; if (r.tone) a.tone = r.tone; if (r.violet) a.violet = true; delete a.violetShare; if (!r.violet && r.violetShare >= 0.1) a.violetShare = +r.violetShare.toFixed(2); delete a.knock; if (r.knock) a.knock = true; }
    } catch (e) { bad++; console.log(`MISSING ${a.id}: ${e.message}`); }
  }
  console.log(`wordmarks (print with --tile): ${wide.join(' ') || '-'}`);
  console.log(`black marks (ic-ink): ${ink.join(' ') || '-'}`);
  console.log(`white marks (ic-paper): ${paper.join(' ') || '-'}`);
  console.log(`violet marks (print with --mono or leave out): ${vio.join(' ') || '-'}`);
  console.log(`partly violet (a minority of the fills: printed as drawn, see references/icons.md): ${part.join(', ') || '-'}`);
  console.log(`multi-tone marks (a one-colour print cuts the paper parts out): ${knock.length}: ${knock.join(' ') || '-'}`);
  console.log(`cropped to their drawing at fetch: ${crop.length}`);
  console.log(`colour marks whose box could not be measured (transform, clip or mask: printed in the set's own box): ${unmeasured.length}: ${unmeasured.join(' ') || '-'}`);
  console.log(`still small in their box after the crop (fill < 70%): ${small.join(', ') || '-'}`);
  console.log(`one-colour fallbacks (si:, no colour mark exists): ${entries.filter(a => a.icon.startsWith('si:')).map(a => a.id).join(' ') || '-'}`);
  if (flag('mark') && !bad) { fs.writeFileSync(INDEX, JSON.stringify(idx, null, 1)); console.log('index.json marked'); }
  console.log(`${n} entries, ${bad} problems`);
  process.exit(bad ? 1 : 0);
}

/* ------------------------------------------------------------ measure: the true drawn box of every colour mark
   `measure` renders each curated colour mark once in headless Chrome (CPU WebGL flags, its own profile, closed by its
   own PID; --profile: a folder of its own in the OS temp folder or the project's .taste-skill folder, never outside
   the project, else .taste-skill/chrome-icons) and asks the browser for the box the drawing really fills (getBBox, with every transform, use and nested group
   resolved: the path-point reader above gives up on those). The boxes go into index.json "boxes" keyed by icon id, and
   fetch crops to them. Needs a Chrome (CHROME_PATH or the usual places); run it when the curated list changes. */
async function measureCmd() {
  noCrop = true;
  const { spawn, execFileSync } = await import('node:child_process');
  const idx = loadIndex();
  // default Chrome profile folder: --profile, else $TASTE_SKILL_TMP/chrome/<tool>-<pid>, else a fresh folder under the system temp dir
  const defaultProfile = () => process.env.TASTE_SKILL_TMP ? path.join(process.env.TASTE_SKILL_TMP, 'chrome', 'icons-' + process.pid) : path.join(os.tmpdir(), 'taste-skill-icons-' + process.pid);
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
  const profile = opt('profile') ? inProject(opt('profile'), 'icons') : path.resolve(defaultProfile());
  const chromePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => p && fs.existsSync(p));
  if (!chromePath) { console.error('icons: no Chrome found (set CHROME_PATH)'); process.exit(1); }
  const seen = new Set(), items = [];
  for (const a of [...idx.apps, ...idx.files]) {
    if (seen.has(a.icon)) continue;
    seen.add(a.icon);
    const r = await resolve(a.icon, idx);
    const [x, y] = [0, 0];
    const vb = (r.svg.match(/viewBox="([^"]+)"/) || [])[1];
    items.push({ key: a.icon, svg: r.svg.replace(/viewBox="[^"]+"/, `viewBox="${vb}"`), vb: vb.split(/\s+/).map(Number), x, y });
  }
  fs.rmSync(profile, { recursive: true, force: true });
  fs.mkdirSync(profile, { recursive: true });
  const child = spawn(chromePath, ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
  const killChrome = () => { try { if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); else child.kill('SIGKILL'); } catch {} };
  try {
    let port = 0;
    for (let i = 0; i < 100 && !port; i++) { await new Promise(r => setTimeout(r, 150)); try { port = +fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {} }
    if (!port) throw new Error('Chrome did not start');
    let target;
    for (let i = 0; i < 50 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {} if (!target) await new Promise(r => setTimeout(r, 150)); }
    if (!target) throw new Error('no page target');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const send = expression => new Promise((res, rej) => {
      const id = 1;
      ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id === id) d.error ? rej(new Error(d.error.message)) : d.result.exceptionDetails ? rej(new Error(d.result.exceptionDetails.text)) : res(d.result.result.value); };
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }));
    });
    const boxes = await send(`(() => { const out = {}; const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:0;top:0;width:400px;height:400px;visibility:hidden'; document.body.appendChild(host);
      for (const it of ${JSON.stringify(items)}) { host.innerHTML = it.svg; const s = host.firstElementChild; try { const b = s.getBBox(); out[it.key] = [b.x, b.y, b.width, b.height]; } catch (e) {} }
      return out; })()`);
    ws.close();
    const o = {};
    let n = 0, hidden = 0;
    for (const it of items) {
      const b = boxes[it.key];
      if (!b || !(b[2] > 0) || !(b[3] > 0)) continue;
      const [vx, vy, vw, vh] = it.vb;
      const x0 = Math.max(b[0], vx), y0 = Math.max(b[1], vy), x1 = Math.min(b[0] + b[2], vx + vw), y1 = Math.min(b[1] + b[3], vy + vh);   // never wider than the mark's own box
      if (x1 - x0 < vw * 0.08 || y1 - y0 < vh * 0.08) { hidden++; continue; }
      o[it.key] = [x0, y0, x1 - x0, y1 - y0].map(v => +v.toFixed(3));
      n++;
    }
    idx.boxes = o;
    fs.writeFileSync(INDEX, JSON.stringify(idx, null, 1));
    console.log(`measured ${n} of ${items.length} colour marks (${hidden} skipped as implausible), written to index.json boxes`);
  } finally { killChrome(); }
}

/* ------------------------------------------------------------ scan: every icon a page names, fetched at once
   Reads the pages (or spec files) it is given and collects the ids that diagram specs ("icon": "gmail"), data-icon tags and
   data-diagram preset names carry (and the name of every <img src="icons/<name>.svg"> a pasted UI fragment holds), then fetches them like `fetch` does, so a finished page has no missing icon. */
async function scanCmd() {
  const files = positional().filter(x => !x.startsWith('--'));
  if (!files.length) { console.error('usage: icons.mjs scan <page.html|spec.json> [more ...] --out assets/icons'); process.exit(1); }
  let presets = {};
  try { presets = JSON.parse(fs.readFileSync(path.resolve(HERE, '..', 'assets', 'diagrams', 'presets.json'), 'utf8')).presets || {}; } catch {}
  const ids = new Set();
  const take = v => {
    v = String(v || '').trim();
    if (!v || v.startsWith('text:') || /[/.]/.test(v) || /^(data|https?):/i.test(v)) return;
    if (/^[a-z0-9-]+$/i.test(v) || /^(logos|file|ui|si):[a-z0-9._-]+$/i.test(v)) ids.add(v);
  };
  const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const k in o) { if (k === 'icon') take(o[k]); else walk(o[k]); } };
  for (const file of files) {
    const t = fs.readFileSync(file, 'utf8');
    for (const m of t.matchAll(/"icon"\s*:\s*"([^"]+)"/g)) take(m[1]);
    for (const m of t.matchAll(/&quot;icon&quot;\s*:\s*&quot;([^&]+)&quot;/g)) take(m[1]);
    // <img data-icon="stripe" ...>, <span data-icon='logos:aws'>
    for (const m of t.matchAll(/\sdata-icon=(["'])([^"']+)\1/g)) take(m[2]);
    // a UI fragment pasted into the page keeps its <img src="icons/<name>.svg">: the name is the icon to fetch (si-<name> is the Simple Icons copy)
    // (src="icons/x.svg", "assets/ui/icons/x.svg", "./assets/icons/x.svg", "/assets/icons/x.svg?v=2", in either quote)
    for (const m of t.matchAll(/<img\b[^>]*?\ssrc=(["'])(?:[^"']*\/)?icons\/([a-z0-9_-]+)\.svg(?:[?#][^"']*)?\1/gi)) take(m[2].replace(/^si-/, 'si:'));
    for (const m of t.matchAll(/\sdata-diagram="([a-z0-9-]+)"/gi)) if (presets[m[1]]) walk(presets[m[1]]);
    if (/\.json$/i.test(file)) { try { walk(JSON.parse(t)); } catch {} }
  }
  if (!ids.size) { console.error('icons: no icon ids found in ' + files.join(', ')); process.exit(0); }
  console.error('icons: scan found ' + [...ids].join(' '));
  return fetchCmd([...ids], true);
}

process.stdout.on('error', e => { if (e.code === 'EPIPE') process.exit(0); });

/* the same resolver for code (diagram tooling, a build script): the icon as { svg, title, set, name, tone, violet, w, h, ... } */
export async function resolveIcon(id, opts = {}) { if (opts.noCrop) noCrop = true; return resolve(id, loadIndex()); }
export { loadIndex, SETS, LOGOS_SHA };

const here = p => { try { return fs.realpathSync(p).toLowerCase(); } catch { return String(p).toLowerCase(); } };
if (process.argv[1] && here(process.argv[1]) === here(fileURLToPath(import.meta.url))) {
  const cmd = argv[0];
  (async () => {
    if (cmd === 'fetch' || cmd === 'get') return fetchCmd();
    if (cmd === 'scan') return scanCmd();
    if (cmd === 'find') return findCmd();
    if (cmd === 'list' || cmd === 'apps') return listCmd();
    if (cmd === 'check') return checkCmd();
    if (cmd === 'measure') return measureCmd();
    console.log('usage: icons.mjs find <words> | apps [--tag t] | list --set logos --tag storage | fetch <app|set:name ...> --out <dir> [--size 24] [--tile] [--mono] [--mask] [--colour] [--base /assets/icons] | scan <page.html ...> --out <dir> | check | measure');
  })().catch(e => { console.error('icons:', e.message); process.exit(1); });
}
