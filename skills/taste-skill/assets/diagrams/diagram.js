/*
  taste-skill diagram.js - node-and-line visuals for a card panel or a section (references/diagrams.md).
  One ES module, no dependencies. diagram.css draws it from the palette tokens around it
  (--ink, --muted, --accent, --accent-ink, --card or --bg; --frag for the node fill if set).

    <link rel="stylesheet" href="assets/diagrams/diagram.css">
    <div class="panel"><div class="dg" data-diagram="lanes-agent"></div></div>      a preset from presets.json
    <div class="dg" data-diagram='{"layout":"hub","center":{...},"spokes":[...]}'></div>   or a spec inline
    <script type="module">import dg from './assets/diagrams/diagram.js'; dg.auto(document);</script>

    const d = dg.mount(el, spec);   d.play()  d.pause()  d.seek(seconds)  d.destroy()  d.T (loop length)

  Layouts (the spec's "layout"; the fields each one reads are in presets.json and diagrams.md):
    hub       a centre with 3 to 8 spokes, straight rays from its rim; spokes may hold children (a mind
              map, or a web round the centre with "shape": "radial", up to 4 branches)
    tree      a root that branches out to the right (an indented outline under 480px)
    lanes     one input into a core that splits into parallel lanes, optionally joining into an output
    fanin     many sources into one target, then on along a short chain
    bowtie    many sources into one core and out to many destinations ("targets")
    ring      a centre with nodes on an orbit; the pulse walks the orbit and reports to the centre
    sync      two systems with a sync line through a small chip; records light as they cross
    timeline  steps on a line that complete in turn
    grid      a group of sources (icons in a grid) into a pipeline of stages
    free      nodes at fractions of the box ("at": [x, y]) and edges you list; "shots" sets the order

  Everything is laid out at the element's real size (a ResizeObserver lays it out again), so it is
  crisp at 390 and at 1440: under 480px wide flows turn vertical and nodes become icon tiles; from
  900px nodes with a "sub" become small cards. Text is never scaled.

  Icons ("icon" on a node) are files, written by the one resolver, scripts/icons.mjs (references/icons.md). Fetch every id a
  page names in one go from the site root:
    node <skill>/scripts/icons.mjs scan index.html --out assets/icons
  (or fetch ids by hand: node <skill>/scripts/icons.mjs fetch google-docs slack ui:database --out assets/icons). They load from
  assets/icons/ (beside this folder; "iconBase" in the spec, data-icon-base on the element or around it, or
  mount(el, spec, { iconBase }) moves it). Nothing is fetched or tinted at runtime, and no CDN is called:
    google-docs    a curated app or file type, in full colour (or, where no colour mark exists, the Simple Icons mark in its
                   brand hex, which icons.mjs painted) -> <base>google-docs.svg
    ui:database    an interface glyph, drawn in the ink                 -> <base>ui-database.svg
    logos:<name>, file:<name>, si:<slug>   one icon of a set, as fetched  -> <base><name>.svg
    text:Ab        a one- or two-letter mark (the product's own)
    any path or URL to an .svg or .png (the client's logo)
  icons.mjs bakes its decisions into each file (data-ic): a black mark takes the ink, so GitHub or Vercel read on dark
  grounds too, and a mark that is mostly violet (Stripe) is drawn in the text colour, as icons.mjs prints it; a wordmark
  (over 1.8:1) gets a 2:1 slot and its tile becomes a pill. An icon that is not in the folder shows the name's first letter,
  never an empty box, and the console says the scan line that fetches it.

  Motion: a short light runs along each line (a gradient that fades out behind its head, with a soft glow and a bright point;
  the line it has crossed stays lit for a moment and the node it reaches answers). The whole pulse is ONE cycle of 2.5 to 4 s
  (3.2 s unless "motion": {"cycle": 2.5..4}) that repeats: the program is laid out as a ripple (each branch or spoke starts a
  beat after the one before it, so lines overlap and stay staggered) and then fitted to the cycle, so T never leaves 2.5 to 4 s
  (d.T). It restarts from its first beat when the pointer enters the card or focus moves into it. It runs only while on
  screen. Hovering a node lights every path through it. Under prefers-reduced-motion, on a phone (under 640px), or with
  "motion": {"pulse": "none"} it holds one still: the busiest moment of the loop, frozen. On a page of kind other (site-kind other, or a place) it always holds the
  still, never plays on hover and has no ground under it (flat colour): there it is the one still diagram a product or service page may carry. data-dg-still on the element or
  around it holds it by hand and plays it while the pointer is on its card (data-ui-still does not hold a diagram: a diagram
  card's pulse is its own loop). A loop gets the system's pause button (button.loop-pause, 12px in from the bottom-right
  corner of its .panel, .panel__screen or .frame). data-ui-cycles="n" on the element or around it plays n loops, then rests
  on the still.

  Grounds ("ground"): "dots", "rings", "grid", "glow" (a soft light of the accent under the core with a
  fine grain), "none"; "glow dots" and "glow rings" combine. Defaults: rings round a hub, none under an
  orbit, a timeline or a sync, dots elsewhere; glow added where the diagram leads a section (900px+);
  none on a panel with an effect ground.

  Size: a flat drawing first takes the next size up (cards, larger tiles), a timeline turns into a
  checklist down the box, and one still under 45% of its panel's height sets data-size="band" (the
  panel takes --p-h 240px). "size": "band" asks for that, "size": "card" keeps the panel, "fit": false
  keeps the first size.
*/

const NS = 'http://www.w3.org/2000/svg';
const HERE = import.meta.url;
const ICON_BASE = new URL('../icons/', HERE).href;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u, 0, 1));
const unease = y => Math.acos(1 - 2 * clamp(y, 0, 1)) / Math.PI;
const r1 = v => Math.round(v * 10) / 10;
const reducedMQ = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const phoneMQ = typeof matchMedia === 'function' ? matchMedia('(max-width: 639px)') : { matches: false };
let uid = 0;
// kind other (product, service, place: a cafe, a shop, a studio, a firm): nothing moves by itself and no pattern or glow
// ground sits under a drawing (MO-07, backgrounds.md "Other kinds stay flat"), the same test as system.js, ui.js and layout.js
const kindOther = () => {
  if (typeof document === 'undefined') return false;
  const m = document.querySelector('meta[name="site-kind"]');
  return document.documentElement.dataset.type === 'place' || (!!m && m.content.trim().toLowerCase() === 'other');
};

function h(tag, cls, parent, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
function s(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

/* ================================================================ icons */
const iconCache = new Map();
const cleanName = n => String(n).toLowerCase().replace(/[^a-z0-9._-]/g, '');
// where an icon id loads from: the files scripts/icons.mjs wrote (the one resolver), never a CDN
function iconSource(spec, base) {
  const m = /^([a-z]+):(.+)$/.exec(spec);
  if (!m && /[/.]/.test(spec)) return { set: 'url', urls: [new URL(spec, document.baseURI).href] };
  // a curated short name (gmail, google-docs, pdf): the file icons.mjs wrote under that name
  if (!m) return { set: 'app', urls: [base + cleanName(spec) + '.svg'] };
  const [, set, raw] = m, name = cleanName(raw);
  if (set === 'ui') return { set, urls: [base + 'ui-' + name + '.svg'] };
  // logos:google-gmail, file:file-type-pdf2, si:googledocs: the file under its set name or its short name
  const short = name.replace(/^(file-type-|default-)/, '').replace(/-icon$/, '');
  return { set: 'app', urls: [...new Set([base + name + '.svg', base + short + '.svg'])] };
}
// a colour mark that was not fetched into the site falls back to a one-colour mark or a letter: that
// is an error, said once on the console with the line that fixes it (collected over the whole page)
const missing = new Map();   // base -> Set of icon ids
let missingT = 0;
function relOut(base) {
  try {
    const b = new URL(base), d = new URL('.', document.baseURI);
    if (b.origin !== d.origin) return base;
    const bs = b.pathname.split('/').filter(Boolean), ds = d.pathname.split('/').filter(Boolean);
    let i = 0; while (i < bs.length && i < ds.length && bs[i] === ds[i]) i++;
    return [...ds.slice(i).map(() => '..'), ...bs.slice(i)].join('/') || '.';
  } catch { return 'assets/icons'; }
}
function reportMissing(spec, base) {
  if (!missing.has(base)) missing.set(base, new Set());
  missing.get(base).add(spec);
  clearTimeout(missingT);
  missingT = setTimeout(() => {
    for (const [b, ids] of missing) {
      if (!ids.size) continue;
      const list = [...ids].join(' ');
      console.error(`diagram.js: ${ids.size} icon${ids.size > 1 ? 's are' : ' is'} not in ${b} and show${ids.size > 1 ? '' : 's'} as a letter: ${list}\n` +
        `Fetch ${ids.size > 1 ? 'them' : 'it'} from the site root:  node <skill>/scripts/icons.mjs fetch ${list} --out ${relOut(b)}   (or: icons.mjs scan <page.html> --out ${relOut(b)})`);
      ids.clear();
    }
  }, 600);
}
function loadIcon(spec, base) {
  const key = base + '|' + spec;
  if (iconCache.has(key)) return iconCache.get(key);
  const src = iconSource(spec, base);
  const p = (async () => {
    for (const url of src.urls) {
      if (/\.(png|jpe?g|webp|avif)(\?|$)/i.test(url)) return { img: url };
      try {
        const r = await fetch(url);
        if (r.ok) { const t = await r.text(); if (/<svg[\s>]/i.test(t)) return { ...src, svg: t }; }
      } catch { /* next */ }
    }
    // a page opened from file:// cannot fetch: an <img> still shows the colour mark
    if (location.protocol === 'file:' && src.set !== 'ui') return { img: src.urls[0] };
    reportMissing(spec, base);
    return null;   // not fetched into the site: the name's first letter, never an empty tile
  })();
  iconCache.set(key, p);
  return p;
}
const lum = hex => {
  let x = hex.replace('#', '');
  if (x.length === 3) x = x.split('').map(c => c + c).join('');
  const v = [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
// a full-colour mark drawn in black (GitHub, Vercel, OpenAI) takes the ink, unless it also has white parts (Notion)
function inkify(body) {
  const fills = body.match(/fill="#[0-9a-fA-F]{3,6}"/g) || [];
  const hasWhite = /fill="(#fff|#ffffff|white)"/i.test(body) || fills.some(f => lum(f.slice(6, -1)) > 0.85);
  if (hasWhite) return body;
  return body.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (all, c) => (lum(c) < 0.05 ? 'fill="currentColor"' : all));
}
/* "never violet or lavender": icons.mjs decides which marks are mostly violet (Stripe, Twitch, Google Forms) and writes
   data-ic="violet" into the file; such a mark is shown in the text colour with its near-white parts kept as cut-outs,
   exactly as icons.mjs prints it. This file does not judge a colour itself. */
const rgbOf = c => {
  let x = String(c).trim().toLowerCase().replace('#', '');
  if (!/^[0-9a-f]{3,8}$/.test(x)) return null;
  if (x.length <= 4) x = x.slice(0, 3).split('').map(k => k + k).join('');
  return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16));
};
const COLOUR_RE = /(fill|stroke|stop-color)(\s*=\s*"|\s*:\s*)(#[0-9a-f]{3,8})/gi;
function monoMark(body) {
  return body.replace(COLOUR_RE, (all, prop, eq, hex) => {
    const c = rgbOf(hex);
    const paper = c && Math.min(...c) >= 235;
    if (paper && prop.toLowerCase() === 'fill' && eq.includes('=')) return `style="fill:var(--dg-node)" data-p${eq}${hex}`;
    return `${prop}${eq}${paper ? hex : 'currentColor'}`;
  });
}
// what is known of an icon before it is drawn (a wordmark needs a wide slot): base|spec -> { wide }
const iconMeta = new Map();
const letter = (span, text) => { span.classList.add('dg-ic--text', 'dg-ic--missing'); span.textContent = (text || '?').trim().slice(0, 1).toUpperCase(); };
function putIcon(span, spec, color, fallbackText, base, onWide) {
  if (!spec) { span.remove(); return; }
  span.dataset.icon = spec;
  if (spec.startsWith('text:')) { span.classList.add('dg-ic--text'); span.textContent = spec.slice(5, 7); return; }
  const key = (base || ICON_BASE) + '|' + spec;
  if (iconMeta.get(key)?.wide) span.classList.add('dg-ic--wide');
  loadIcon(spec, base || ICON_BASE).then(d => {
    if (!d) return letter(span, fallbackText);
    if (d.img) {
      const im = h('img', '', span);
      im.src = d.img; im.alt = ''; im.decoding = 'async'; im.draggable = false;
      im.onerror = () => { im.remove(); letter(span, fallbackText); };
      return;
    }
    // the file's own <svg>, cleaned, its ids made unique on the page
    const id = 'dgi' + (++uid);
    let t = d.svg.replace(/<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<title>[\s\S]*?<\/title>|<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son[a-z]+="[^"]*"/gi, '')
      .replace(/\sid="([^"]+)"/g, ` id="$1-${id}"`)
      .replace(/url\(#([^)]+)\)/g, `url(#$1-${id})`)
      .replace(/href="#([^"]+)"/g, `href="#$1-${id}"`);
    const tag = (t.match(/<svg\b[^>]*\sdata-ic="([a-z]+)"/i) || [])[1] || '';
    if (d.set === 'ui') t = t.replace(/stroke-width="2"/g, 'stroke-width="1.75"');
    else if (tag === 'violet') {
      // a one-colour mark (the root carries its fill) or a multi-colour one: the text colour, paper parts cut out
      t = /<svg\b[^>]*\sfill="#/i.test(t) ? t.replace(/(<svg\b[^>]*\sfill=")#[0-9a-f]{3,8}"/i, '$1currentColor"') : monoMark(t);
      span.classList.add('dg-ic--mono');
    } else if (tag === 'ink' || !tag) t = inkify(t);
    // an explicit color on the node tints a one-colour mark (the root's fill), never a full-colour one
    if (color && /<svg\b[^>]*\sfill="#/i.test(t) && /^#[0-9a-f]{3,6}$/i.test(color.trim())) t = t.replace(/(<svg\b[^>]*\sfill=")#[0-9a-f]{3,8}"/i, `$1${color.trim()}"`);
    span.innerHTML = t;
    const svg = span.querySelector('svg');
    if (!svg) return letter(span, fallbackText);
    const w = svg.getAttribute('width'), hh = svg.getAttribute('height');
    if (!svg.hasAttribute('viewBox') && w && hh) svg.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(hh)}`);
    svg.removeAttribute('width'); svg.removeAttribute('height'); svg.removeAttribute('class');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    // a wordmark (over 1.8 times as wide as tall: Stripe, Visa) gets a 2:1 slot; the first time one is
    // seen the diagram is laid out again, after that the slot is known before the icon draws
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const wide = vb.length === 4 && vb[3] > 0 && vb[2] / vb[3] > 1.8;
    if (wide && !span.classList.contains('dg-ic--wide')) {
      iconMeta.set(key, { wide: true });
      span.classList.add('dg-ic--wide');
      if (onWide) onWide();
    }
  });
}

/* ================================================================ the model */
const NODE_FIELDS = ['label', 'sub', 'meta', 'icon', 'color', 'kind', 'kindCompact', 'tone', 'done', 'rows', 'at', 'atCompact', 'cap'];
function normalise(spec) {
  const nodes = new Map();
  const used = new Set();
  const slug = t => (String(t || 'n').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'n');
  function add(raw, role, parent) {
    if (raw == null) return null;
    const n = typeof raw === 'string' ? { label: raw } : { ...raw };
    let id = n.id || slug(n.label);
    while (used.has(id)) id += '-';
    used.add(id);
    const node = { id, role, parent: parent || null, kids: [] };
    for (const k of NODE_FIELDS) if (n[k] !== undefined) node[k] = n[k];
    nodes.set(id, node);
    if (parent) nodes.get(parent).kids.push(id);
    return node;
  }
  const arr = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const L = spec.layout || 'free';
  const m = { layout: L, nodes };
  if (L === 'hub' || L === 'ring') {
    m.center = add(spec.center, 'core').id;
    m.spokes = arr(spec.spokes || spec.ring).map(sp => {
      const n = add(sp, 'spoke');
      for (const c of arr(sp && sp.children)) add(c, 'child', n.id);
      return n.id;
    });
  } else if (L === 'tree') {
    const walk = (raw, parent, depth) => {
      const n = add(raw, depth === 0 ? 'root' : depth === 1 ? 'branch' : 'leaf', parent);
      for (const c of arr(raw && raw.children)) walk(c, n.id, depth + 1);
      return n.id;
    };
    m.root = walk(spec.root, null, 0);
  } else if (L === 'lanes') {
    m.inputs = arr(spec.input).map(n => add(n, 'input').id);
    m.core = add(spec.core, 'core').id;
    m.lanes = arr(spec.lanes).map(l => arr(l).map(n => add(n, 'lane').id));
    m.output = spec.output ? add(spec.output, 'output').id : null;
  } else if (L === 'fanin' || L === 'bowtie') {
    m.sources = arr(spec.sources).map(n => add(n, 'source').id);
    const tg = spec.target || spec.core;
    m.target = add(tg, tg && tg.kind ? 'node' : 'core').id;
    if (L === 'bowtie' || spec.targets) {
      // many into one and out to many (a bowtie): sources at the left, the core, destinations at the right
      m.layout = 'bowtie';
      m.targets = arr(spec.targets).map(n => add(n, 'dest').id);
    } else m.then = arr(spec.then).map(n => add(n, 'node').id);
  } else if (L === 'sync') {
    m.left = add(spec.left, 'system').id;
    m.link = add(spec.link || { label: 'Sync', icon: 'ui:refresh-cw' }, 'link').id;
    m.right = add(spec.right, 'system').id;
  } else if (L === 'timeline') {
    m.steps = arr(spec.steps).map(n => add(n, 'step').id);
  } else if (L === 'grid') {
    m.group = add({ label: spec.group || '', kind: 'group' }, 'group').id;
    m.tiles = arr(spec.sources).map(n => add(n, 'tile', m.group).id);
    m.stages = arr(spec.stages).map(n => add(n, 'stage').id);
    m.output = spec.output ? add(spec.output, 'stage').id : null;
  } else {
    m.layout = 'free';
    for (const n of arr(spec.nodes)) add(n, n.role || 'node');
    m.edges = arr(spec.edges).map(e => (typeof e === 'string' ? { from: e.split('>')[0], to: e.split('>')[1] } : Array.isArray(e) ? { from: e[0], to: e[1] } : e));
    m.shots = spec.shots || null;
  }
  return m;
}

// the node's look at this size: tier c (under 480), n (480 to 899), l (900 and over); a higher
// level is a tighter try when the first one did not fit (see build)
function kindOf(n, ctx) {
  const { tier, L, level, mind } = ctx;
  if (tier === 'c' && n.kindCompact) return n.kindCompact;
  if (n.kind) return n.kind;
  const icon = !!n.icon;
  // a hub with branches under 480px is drawn as an outline: one row per node
  if (ctx.outline) return n.role === 'core' ? 'core-pill' : 'pill';
  if (L === 'ring' && n.role === 'spoke') return icon ? 'disc' : 'pill';
  const hubKids = L === 'hub' && n.role === 'spoke' && n.kids.length;
  if (hubKids && (tier === 'c' || level >= 1) && icon) return 'tile';
  switch (n.role) {
    // a core without an icon is a pill with its name, never a letter in a tile
    // (in a radial web too: the pill carries its name inside, where a caption under a tile would lie on the rays)
    // a crowded mind map (the tight try) takes the icon tile with its name below, to give its sides room
    case 'core': return !icon || ((L === 'hub' || L === 'ring') && tier !== 'c' && !(mind && ctx.tight)) ? 'core-pill' : 'core';
    case 'system': return 'system';
    case 'group': return 'group';
    case 'link': return 'chip';
    case 'step': return icon ? 'tile' : 'step';
    case 'tile': return 'gtile';
    // a branch's leaves: pills in a mind map; in a radial web an icon leaf is a small tile, the rest dots
    case 'child': return ctx.radial && icon && level < 2 ? 'tile' : tier === 'c' || level >= 1 || !mind ? 'dot' : 'pill';
    default:
      // spokes, sources, lanes, inputs and outputs become icon tiles under 480px; named stages stay pills
      if (tier === 'c') return icon && ['spoke', 'source', 'dest', 'lane', 'input', 'output'].includes(n.role) ? 'tile' : 'pill';
      return tier === 'l' && n.sub ? 'card' : 'pill';
  }
}
// tiles under 480px carry their label below them in these layouts (elsewhere the icon alone stands, labelled for screen readers)
const CAPS = { lanes: true, timeline: true, grid: false, fanin: false, bowtie: false, hub: false, ring: false, tree: false, free: true, sync: false };

const CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 6.2 5 8.2 9 3.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function makeNode(n, kind, ctx, layer, reg) {
  const { tier, L } = ctx;
  const el = h('div', `dg-node dg-node--${kind}`, layer);
  el.dataset.id = n.id;
  // the core is the product: an ink tile by default ("tone": "accent" puts it on the accent, "plain" on the node fill)
  const isCore = kind === 'core' || kind === 'core-pill';
  const tone = n.tone || (isCore ? ctx.coreTone || 'ink' : null);
  if (tone === 'accent') el.classList.add('is-accent');
  else if (tone === 'ink') el.classList.add('is-ink');
  const ic = cls => { const sp = h('span', 'dg-ic' + (cls ? ' ' + cls : ''), null); putIcon(sp, n.icon, n.color, n.label, ctx.iconBase, ctx.relayout); return sp; };
  const label = n.label || '';
  // a node with work to finish ("done") carries a small status ring at its end that fills when the light arrives
  const status = () => { if (n.done) h('span', 'dg-st', el).innerHTML = CHECK; };
  if (kind === 'pill' || kind === 'core-pill' || kind === 'chip') {
    if (n.icon) el.appendChild(ic());
    h('span', 'dg-label', el, label);
    if (n.meta && tier !== 'c' && kind !== 'chip') h('span', 'dg-meta', el, n.meta);
    if (kind === 'pill') status();
  } else if (kind === 'card') {
    const logo = h('span', 'dg-logo', el);
    if (n.icon) logo.appendChild(ic()); else logo.remove();
    const txt = h('span', 'dg-txt', el);
    h('span', 'dg-label', txt, label);
    if (n.sub) h('span', 'dg-sub', txt, n.sub);
    if (n.meta) h('span', 'dg-meta', el, n.meta);
    status();
  } else if (kind === 'tile' || kind === 'disc' || kind === 'core' || kind === 'gtile') {
    if (n.icon) el.appendChild(ic()); else h('span', 'dg-ic dg-ic--text', el, label.slice(0, 1).toUpperCase());
    const wantsCap = kind === 'core' ? !!label && n.cap !== false && !(tier === 'c' && (L === 'hub' || L === 'ring'))
      : kind === 'disc' ? n.cap === true || (n.cap !== false && ctx.ringLabels)
      : n.cap === true || (n.cap !== false && kind === 'tile' && ((tier === 'c' && ctx.caps) || n.role === 'step'));
    if (wantsCap && label) {
      // the core names itself INSIDE its own tile (under its icon): the name can never run past the node,
      // be cut by the diagram's edge or lie on the ground and its rays; every other tile names itself below
      const cap = h('span', kind === 'core' ? 'dg-cap dg-cap--in' : 'dg-cap', el);
      h('span', 'dg-cap__l', cap, label);
      if (n.role === 'step' && n.sub) h('span', 'dg-cap__s', cap, n.sub);
    }
  } else if (kind === 'step' || kind === 'dot') {
    h('i', 'dg-dot', el).innerHTML = kind === 'step' ? CHECK : '';
    // a branch's leaf in a mind map carries its name beside it
    if (kind === 'dot' && ctx.mind && n.role === 'child') el.classList.add('dg-node--side');
    if (label && (kind === 'step' || n.cap || (kind === 'dot' && ctx.mind))) {
      const cap = h('span', 'dg-cap', el);
      h('span', 'dg-cap__l', cap, label);
      if (n.sub) h('span', 'dg-cap__s', cap, n.sub);
    }
  } else if (kind === 'system') {
    const head = h('div', 'dg-sys__head', el);
    if (n.icon) head.appendChild(ic());
    h('span', 'dg-label', head, label);
    if (n.meta) h('span', 'dg-meta', head, n.meta);
    const rows = (n.rows || []).slice(0, tier === 'c' ? 2 : 4);
    rows.forEach((r, i) => {
      const row = h('div', 'dg-row', el);
      const rr = typeof r === 'string' ? { label: r } : r;
      h('span', 'dg-row__l', row, rr.label || '');
      if (rr.meta) h('span', 'dg-meta', row, rr.meta);
      reg.set(`${n.id}#${i}`, row);
    });
  } else if (kind === 'group') {
    if (label) h('span', 'dg-group__label', el, label);
    h('div', 'dg-group__grid', el);
  }
  if ((n.done || n.role === 'step') && ['tile', 'disc', 'core', 'gtile', 'system'].includes(kind)) h('span', 'dg-check', el).innerHTML = CHECK;
  if (ctx.level >= 1) el.querySelectorAll('.dg-meta, .dg-sub').forEach(x => { if (!x.closest('.dg-row, .dg-sys__head')) x.remove(); });
  reg.set(n.id, el);
  return el;
}

/* ================================================================ geometry */
const CAPGAP = 6;
function geo(n, el) {
  const cap = el.querySelector(':scope > .dg-cap:not(.dg-cap--in)');   // a caption inside its tile is part of the tile's own size
  const side = el.classList.contains('dg-node--side');
  const g = { id: n.id, el, w: el.offsetWidth, h: el.offsetHeight, capW: 0, capH: 0, capB: 0, side, round: el.matches('.dg-node--step, .dg-node--dot, .dg-node--disc') };
  if (cap) {
    g.capW = cap.offsetWidth; g.capH = cap.offsetHeight;
    if (!side) g.capB = CAPGAP + g.capH;
  }
  g.x = 0; g.y = 0;
  return g;
}
// centres of `sizes` laid along [a, b] with gaps between gmin and gmax, the whole row centred
function spread(sizes, a, b, gmin = 8, gmax = Infinity) {
  const n = sizes.length;
  if (!n) return [];
  const tot = sizes.reduce((x, y) => x + y, 0);
  const gap = n > 1 ? clamp((b - a - tot) / (n - 1), gmin, gmax) : 0;
  let p = a + (b - a - (tot + gap * (n - 1))) / 2;
  return sizes.map(sz => { const c = p + sz / 2; p += sz + gap; return c; });
}
function axesOf(B) {
  const v = B.vert;
  return {
    v, M: v ? B.H : B.W, C: v ? B.W : B.H, ax: v ? 'y' : 'x',
    // main and cross extents of a node's box with its caption
    mE: g => (v ? g.h + g.capB : Math.max(g.w, g.capW)),
    cE: g => (v ? Math.max(g.w, g.side ? 0 : g.capW) + (g.side ? CAPGAP + 4 + g.capW : 0) : g.h + g.capB),
    // place a node by its box centre on the main axis and its box-and-caption centre on the cross axis.
    // In a row that runs sideways a column lines up on the side its lines meet: align "start" (the
    // left edges, for nodes lines come into) or "end" (the right edges, for nodes lines leave), in a
    // column `col` wide
    put(g, u, c, crossIsBox, align, col) {
      if (v) { g.x = c; g.y = u - g.capB / 2; } else { g.x = u; g.y = crossIsBox ? c : c - g.capB / 2; }
      if (v && g.side) g.x = c - (CAPGAP + 4 + g.capW) / 2;
      if (!v && align && col) {
        const bw = Math.max(g.w, g.capW);
        g.x = align === 'start' ? u - col / 2 + bw / 2 : u + col / 2 - bw / 2;
      }
    },
  };
}
const portOut = (g, ax) => (ax === 'x' ? [g.x + g.w / 2, g.y] : [g.x, g.y + g.h / 2 + (g.side ? 0 : g.capB)]);
const portIn = (g, ax) => (ax === 'x' ? [g.x - g.w / 2, g.y] : [g.x, g.y - g.h / 2]);
function rayPort(g, ang, extra = 0) {
  const c = Math.cos(ang), sn = Math.sin(ang);
  if (g.round) { const r = g.w / 2 + extra; return [g.x + c * r, g.y + sn * r]; }
  const hw = g.w / 2 + extra, hh = g.h / 2 + extra;
  const t = Math.min(Math.abs(c) > 1e-6 ? hw / Math.abs(c) : 1e9, Math.abs(sn) > 1e-6 ? hh / Math.abs(sn) : 1e9);
  return [g.x + c * t, g.y + sn * t];
}
const P = p => `${r1(p[0])} ${r1(p[1])}`;
function pLine(a, b) { return `M${P(a)}L${P(b)}`; }
function pCurve(a, b, ax) {
  const d = ax === 'x' ? b[0] - a[0] : b[1] - a[1];
  if (Math.abs(ax === 'x' ? b[1] - a[1] : b[0] - a[0]) < 0.75) return pLine(a, b);
  const k = Math.max(12, Math.abs(d) * 0.5) * Math.sign(d || 1);
  return ax === 'x'
    ? `M${P(a)}C${r1(a[0] + k)} ${r1(a[1])} ${r1(b[0] - k)} ${r1(b[1])} ${P(b)}`
    : `M${P(a)}C${r1(a[0])} ${r1(a[1] + k)} ${r1(b[0])} ${r1(b[1] - k)} ${P(b)}`;
}
// rounded orthogonal: along the axis to the bus, across, then along to the end; radius r at both corners
function pElbow(a, b, ax, r = 12, bus) {
  if (ax === 'y') {
    const flip = q => [q[1], q[0]];
    return pElbow(flip(a), flip(b), 'x', r, bus).replace(/(-?[\d.]+) (-?[\d.]+)/g, (m, x, y) => `${y} ${x}`);
  }
  const dy = b[1] - a[1];
  if (Math.abs(dy) < 0.75) return pLine(a, b);
  const bx = bus == null ? (a[0] + b[0]) / 2 : bus;
  const sg = Math.sign(dy), sx = Math.sign(b[0] - a[0]) || 1;
  const rr = Math.max(0, Math.min(r, Math.abs(dy) / 2, Math.abs(bx - a[0]), Math.abs(b[0] - bx)));
  return `M${P(a)}L${r1(bx - sx * rr)} ${r1(a[1])}Q${r1(bx)} ${r1(a[1])} ${r1(bx)} ${r1(a[1] + sg * rr)}` +
    `L${r1(bx)} ${r1(b[1] - sg * rr)}Q${r1(bx)} ${r1(b[1])} ${r1(bx + sx * rr)} ${r1(b[1])}L${P(b)}`;
}
function joint(curve, a, b, ax, bus, r) {
  return curve === 'elbow' ? pElbow(a, b, ax, r, bus) : curve === 'line' ? pLine(a, b) : pCurve(a, b, ax);
}

// an indented outline (a file tree) for a narrow box: one row per node, trunks running down the left
// with a rounded turn into each row. Returns the branches { head, tail } for the program.
function outline(B, G, root, kids, E) {
  const rows = [];
  const walk = (id, d) => { rows.push([id, d]); kids(id).forEach(c => walk(c, d + 1)); };
  walk(root, 0);
  // the root (a core pill, taller than a row) keeps 8px clear of the first row under it
  const rootH = Math.max(G[root].h + 8, 28);
  const rowMin = Math.max(28, ...rows.slice(1).map(([id]) => G[id].h + 4));
  const rowH = clamp((B.H - 2 * B.pad - rootH) / Math.max(1, rows.length - 1), rowMin, Math.max(rowMin, 42));
  const indent = B.tier === 'c' ? 20 : 26;
  const widest = Math.max(...rows.map(([id, d]) => d * indent + G[id].w));
  const x0 = Math.max(B.pad, (B.W - widest) / 2);
  const y0 = (B.H - rootH - rowH * (rows.length - 1)) / 2;
  rows.forEach(([id, d], i) => { const g = G[id]; g.x = x0 + d * indent + g.w / 2; g.y = i ? y0 + rootH + rowH * (i - 0.5) : y0 + rootH / 2 - 4; });
  const link = (a, b) => {
    const pa = G[a], pb = G[b];
    const tx = pa.x - pa.w / 2 + Math.min(14, pa.w / 2);
    const st = [tx, pa.y + pa.h / 2], en = [pb.x - pb.w / 2, pb.y];
    const r = Math.min(8, (en[1] - st[1]) / 2, en[0] - tx);
    return E.push({ from: a, to: b, d: `M${P(st)}L${r1(tx)} ${r1(en[1] - r)}Q${r1(tx)} ${r1(en[1])} ${r1(tx + r)} ${r1(en[1])}L${P(en)}` }) - 1;
  };
  return kids(root).map(b => ({ head: link(root, b), tail: kids(b).map(l => link(b, l)) }));
}

/* ================================================================ layouts
   Each takes (m, B, G, A) - the model, the box {W, H, pad, tier, vert, gapMax}, the node geometry by id
   (sizes measured) and the axes - sets every node's x and y, and returns { edges, program(Prog) }.
   An edge: { from, to, d, cls }. cls "faint" (a quiet line), "idle" (a branch that never runs), "track". */
const LAYOUTS = {
  lanes(m, B, G, A) {
    const ins = m.inputs.map(id => G[id]), core = G[m.core], out = m.output ? G[m.output] : null;
    const depth = Math.max(1, ...m.lanes.map(l => l.length));
    const cols = [ins, [core]];
    for (let d = 0; d < depth; d++) cols.push(m.lanes.map(l => G[l[d]]).filter(Boolean));
    if (out) cols.push([out]);
    const colW = cols.map(c => Math.max(...c.map(A.mE)));
    const us = spread(colW, B.pad, A.M - B.pad, 24, B.gapMax);
    const mid = A.C / 2;
    const ic = spread(ins.map(A.cE), B.pad, A.C - B.pad, 8, 20);
    ins.forEach((g, i) => A.put(g, us[0], ins.length > 1 ? ic[i] : mid, ins.length === 1, 'end', colW[0]));
    A.put(core, us[1], mid, true);
    const lc = spread(m.lanes.map(l => Math.max(...l.map(id => A.cE(G[id])))), B.pad, A.C - B.pad, B.tier === 'c' ? 6 : 10, B.tier === 'l' ? 56 : 36);
    m.lanes.forEach((l, i) => l.forEach((id, d) => A.put(G[id], us[2 + d], lc[i], false, 'start', colW[2 + d])));
    if (out) A.put(out, us[us.length - 1], mid, true);
    const E = [], ax = A.ax, curve = B.curve || 'elbow';
    const eIn = ins.map(g => E.push({ from: g.id, to: core.id, d: joint('curve', portOut(g, ax), portIn(core, ax), ax) }) - 1);
    const coreOut = portOut(core, ax);
    const firstIn = portIn(G[m.lanes[0][0]], ax);
    const bus = ax === 'x' ? (coreOut[0] + firstIn[0]) / 2 : (coreOut[1] + firstIn[1]) / 2;
    const eSplit = m.lanes.map(l => E.push({ from: core.id, to: l[0], d: joint(curve, coreOut, portIn(G[l[0]], ax), ax, bus, B.tier === 'c' ? 8 : 12) }) - 1);
    const eChain = [];
    for (let d = 1; d < depth; d++) eChain.push(m.lanes.filter(l => l[d]).map(l => E.push({ from: l[d - 1], to: l[d], d: pLine(portOut(G[l[d - 1]], ax), portIn(G[l[d]], ax)) }) - 1));
    let eJoin = [];
    if (out) {
      const oi = portIn(out, ax);
      const lastOuts = m.lanes.map(l => portOut(G[l[l.length - 1]], ax));
      const far = Math.max(...lastOuts.map(p => (ax === 'x' ? p[0] : p[1])));
      const jb = (far + (ax === 'x' ? oi[0] : oi[1])) / 2;
      eJoin = m.lanes.map((l, i) => E.push({ from: l[l.length - 1], to: out.id, d: joint(curve, lastOuts[i], oi, ax, jb, B.tier === 'c' ? 8 : 12) }) - 1);
    }
    const marks = id => (m.nodes.get(id).done ? { mark: true } : null);
    return {
      edges: E,
      program(Pr) {
        Pr.step(eIn, 0.25);
        Pr.step(eSplit.map(e => [e, 1, marks(E[e].to)]), 0.14);
        eChain.forEach(ch => Pr.step(ch.map(e => [e, 1, marks(E[e].to)]), 0.14));
        if (eJoin.length) Pr.step(eJoin.map(e => [e, 1, marks(E[e].to)]), 0.1);
      },
    };
  },

  fanin(m, B, G, A) {
    const src = m.sources.map(id => G[id]), tg = G[m.target], then = m.then.map(id => G[id]);
    const cols = [src, [tg], ...then.map(g => [g])];
    const colW = cols.map(c => Math.max(...c.map(A.mE)));
    const us = spread(colW, B.pad, A.M - B.pad, 32, B.gapMax);
    const cs = spread(src.map(A.cE), B.pad, A.C - B.pad, 6, B.tier === 'l' ? 18 : 12);
    src.forEach((g, i) => A.put(g, us[0], cs[i], false, 'end', colW[0]));
    A.put(tg, us[1], A.C / 2, true);
    then.forEach((g, i) => A.put(g, us[2 + i], A.C / 2, true));
    const E = [], ax = A.ax;
    const tin = portIn(tg, ax);
    const eSrc = src.map(g => E.push({ from: g.id, to: tg.id, d: pCurve(portOut(g, ax), tin, ax) }) - 1);
    const eThen = then.map((g, i) => E.push({ from: (i ? then[i - 1] : tg).id, to: g.id, d: pLine(portOut(i ? then[i - 1] : tg, ax), portIn(g, ax)) }) - 1);
    return {
      edges: E,
      program(Pr) {
        const n = eSrc.length, order = [];
        for (let k = 0; k < n; k++) order.push((k * (n > 4 ? 3 : 1) + (n > 4 && n % 3 === 0 ? Math.floor(k / (n / 3)) : 0)) % n);
        const seen = new Set(), ord = order.filter(i => !seen.has(i) && seen.add(i));
        for (let i = 0; i < n; i++) if (!seen.has(i)) ord.push(i);
        let last = Pr.t;
        ord.forEach((i, k) => { last = Math.max(last, Pr.fire(eSrc[i], Pr.t + k * 0.42)); });
        Pr.t = last + 0.3;
        eThen.forEach(e => Pr.step([e]));
      },
    };
  },

  // many into one and out to many: each source in turn reaches the core, which answers two destinations
  bowtie(m, B, G, A) {
    const src = m.sources.map(id => G[id]), core = G[m.target], dst = m.targets.map(id => G[id]);
    const colW = [Math.max(...src.map(A.mE)), A.mE(core), Math.max(...dst.map(A.mE))];
    const us = spread(colW, B.pad, A.M - B.pad, 36, B.gapMax * 1.15);
    const gm = B.tier === 'c' ? 6 : 8, gx = B.tier === 'l' ? 20 : 14;
    const cs = spread(src.map(A.cE), B.pad, A.C - B.pad, gm, gx);
    const ct = spread(dst.map(A.cE), B.pad, A.C - B.pad, gm, gx);
    src.forEach((g, i) => A.put(g, us[0], cs[i], false, 'end', colW[0]));
    A.put(core, us[1], A.C / 2, true);
    dst.forEach((g, i) => A.put(g, us[2], ct[i], false, 'start', colW[2]));
    const E = [], ax = A.ax;
    const cin = portIn(core, ax), cout = portOut(core, ax);
    const eS = src.map(g => E.push({ from: g.id, to: core.id, d: pCurve(portOut(g, ax), cin, ax) }) - 1);
    const eD = dst.map(g => E.push({ from: core.id, to: g.id, d: pCurve(cout, portIn(g, ax), ax) }) - 1);
    return {
      edges: E,
      program(Pr) {
        const n = eS.length, k = eD.length;
        const shots = Math.min(Math.max(n, 3), 4);
        for (let i = 0; i < shots; i++) {
          Pr.step([eS[(i * (n > 3 ? 2 : 1) + (n > 3 && i >= Math.ceil(shots / 2) ? 1 : 0)) % n]], 0, 0.06);
          const a = (i * 2) % k, b = (i * 2 + 1 + Math.floor(k / 2)) % k;
          Pr.step((a === b ? [eD[a]] : [eD[a], eD[b]]).map(e => [e, 1, m.nodes.get(E[e].to).done ? { mark: true } : null]), 0.14, 0.4);
        }
      },
    };
  },

  tree(m, B, G, A) {
    const kids = id => m.nodes.get(id).kids;
    const E = [], branches = [];
    if (!B.vert) {
      const levels = [];
      const leaves = [];
      const walk = (id, d) => { (levels[d] = levels[d] || []).push(id); const k = kids(id); if (!k.length) leaves.push(id); k.forEach(c => walk(c, d + 1)); };
      walk(m.root, 0);
      const colW = levels.map(l => Math.max(...l.map(id => A.mE(G[id]))));
      const us = spread(colW, B.pad, A.M - B.pad, 28, B.gapMax);
      const cs = spread(leaves.map(id => A.cE(G[id])), B.pad, A.C - B.pad, 6, B.tier === 'l' ? 22 : 14);
      leaves.forEach((id, i) => { G[id].cc = cs[i]; });
      const place = (id, d) => {
        const k = kids(id);
        k.forEach(c => place(c, d + 1));
        const c = k.length ? k.reduce((a, c2) => a + G[c2].y, 0) / k.length : G[id].cc;
        A.put(G[id], us[d], c, !!k.length, d ? 'start' : 'end', colW[d]);
      };
      place(m.root, 0);
      const link = (a, b) => E.push({ from: a, to: b, d: joint(B.curve || 'curve', portOut(G[a], 'x'), portIn(G[b], 'x'), 'x', null, 12) }) - 1;
      kids(m.root).forEach(b => branches.push({ head: link(m.root, b), tail: kids(b).map(l => link(b, l)), deep: [] }));
    } else {
      outline(B, G, m.root, kids, E).forEach(b => branches.push(b));
    }
    const marks = e => (m.nodes.get(E[e].to).done ? { mark: true } : null);
    return {
      edges: E,
      program(Pr) {
        Pr.ripple(branches.map(br => () => {
          Pr.step([[br.head, 1, marks(br.head)]]);
          if (br.tail.length) Pr.step(br.tail.map(e => [e, 1, marks(e)]), 0.12);
        }), 0.3);
      },
    };
  },

  hub(m, B, G, A) {
    if (B.mind) return LAYOUTS.mind(m, B, G, A);
    const hasKids = m.spokes.some(id => m.nodes.get(id).kids.length);
    if (B.outline) {
      const E = [];
      const kidsOf = id => (id === m.center ? m.spokes : m.nodes.get(id).kids);
      const br = outline(B, G, m.center, kidsOf, E);
      return { edges: E, program(Pr) { Pr.ripple(br.map(b => () => { Pr.step([b.head]); if (b.tail.length) Pr.step(b.tail, 0.12); }), 0.26); } };
    }
    const c = G[m.center], sp = m.spokes.map(id => G[id]);
    c.x = B.W / 2; c.y = B.H / 2;
    const n = sp.length;
    const allKids = m.spokes.flatMap(id => m.nodes.get(id).kids.map(k => G[k]));
    const outer = hasKids ? allKids : sp;
    const ow = Math.max(...outer.map(g => Math.max(g.w, g.capW))), oh = Math.max(...outer.map(g => g.h + g.capB));
    const rx = Math.max(40, B.W / 2 - B.pad - ow / 2), ry = Math.max(30, B.H / 2 - B.pad - oh / 2);
    const a0 = -Math.PI / 2 + (n % 2 ? 0 : Math.PI / n) + (B.turn || 0);
    const ang = sp.map((g, i) => a0 + (2 * Math.PI * i) / n);
    // with branches, the spokes sit on an inner ring: the one that leaves the most room on both sides
    // (to the core and to their own leaves on the outer ring)
    // a branch's leaves fan out wide enough that neighbours keep 14px between them at the outer ring
    const spreadOf = i => {
      const kk = m.nodes.get(m.spokes[i]).kids;
      const base = Math.min((2 * Math.PI) / n * 0.4, 0.66);
      if (kk.length < 2) return base;
      const kw = Math.max(...kk.map(k => Math.max(G[k].w, G[k].capW)));
      const rl = Math.hypot(rx * Math.cos(ang[i]), ry * Math.sin(ang[i]));
      return clamp((kw + 14) / Math.max(rl, 1), base, (2 * Math.PI) / n / Math.max(1, kk.length - 1) * 0.62);
    };
    let k1 = 1;
    if (hasKids) {
      const gap = (a, ax, ay, b, bx, by) => Math.max(Math.abs(ax - bx) - (a.w + b.w) / 2, Math.abs(ay - by) - (a.h + b.h) / 2);
      // the core with its caption (a square core names itself below)
      const cBox = { w: Math.max(c.w, c.capW), h: c.h + 2 * c.capB };
      let best = -1e9;
      for (let k = 0.4; k <= 0.8; k += 0.02) {
        let worst = 1e9;
        sp.forEach((g, i) => {
          const x = c.x + rx * k * Math.cos(ang[i]), y = c.y + ry * k * Math.sin(ang[i]);
          worst = Math.min(worst, gap(g, x, y, cBox, c.x, c.y));
          const kk = m.nodes.get(g.id).kids;
          kk.forEach((kid, j) => {
            const a = ang[i] + (j - (kk.length - 1) / 2) * spreadOf(i);
            worst = Math.min(worst, gap(g, x, y, G[kid], c.x + rx * Math.cos(a), c.y + ry * Math.sin(a)));
          });
        });
        if (worst > best + 0.5) { best = worst; k1 = k; }
      }
    }
    sp.forEach((g, i) => { g.x = c.x + rx * k1 * Math.cos(ang[i]); g.y = c.y + ry * k1 * Math.sin(ang[i]) - g.capB / 2; });
    const E = [], spokes = [], twigs = [];
    // spokes are straight rays from the core's rim to the node's (a clean star, the default);
    // "curve": "curve" leaves the core from the side that faces the node and bends into it,
    // "elbow" draws rounded right angles, "swirl" a slight arc
    const cv = B.curve || 'line';
    const sideOf = t => { const a = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return Math.abs(Math.cos(a)) > 0.77 ? 'x' : 'y'; };
    const link = (a, b, cls, t0) => {
      const ga = G[a], gb = G[b];
      const t = Math.atan2(gb.y - ga.y, gb.x - ga.x);
      let d;
      if (cv === 'line' || cv === 'swirl' || ga.id !== c.id || B.radial) {
        const p1 = rayPort(ga, t, ga.id === c.id ? 2 : 0), p2 = rayPort(gb, t + Math.PI);
        if (cv === 'swirl') {
          const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2, len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
          d = `M${P(p1)}Q${r1(mx - Math.sin(t) * len * 0.16)} ${r1(my + Math.cos(t) * len * 0.16)} ${P(p2)}`;
        } else d = pLine(p1, p2);
      } else {
        const ax = B.curve === 'elbow' ? (Math.abs(gb.x - ga.x) > ga.w / 2 + 24 ? 'x' : 'y') : sideOf(t0 == null ? t : t0);
        const sg = ax === 'x' ? Math.sign(gb.x - ga.x) || 1 : Math.sign(gb.y - ga.y) || 1;
        const p1 = ax === 'x' ? [ga.x + sg * (ga.w / 2 + 2), ga.y] : [ga.x, ga.y + sg * (ga.h / 2 + 2)];
        const p2 = ax === 'x' ? [gb.x - sg * gb.w / 2, gb.y] : [gb.x, gb.y - sg * (gb.h / 2) + (sg < 0 ? gb.capB : 0)];
        d = B.curve === 'elbow' ? pElbow(p1, p2, ax, 14) : pCurve(p1, p2, ax);
      }
      return E.push({ from: a, to: b, d, cls }) - 1;
    };
    if (B.web && n > 2) {
      // a quiet orbit through the spokes (the "web"), drawn before the spokes so it sits under them
      E.push({ track: true, d: `M${r1(c.x + rx * k1)} ${r1(c.y)}A${r1(rx * k1)} ${r1(ry * k1)} 0 1 1 ${r1(c.x - rx * k1)} ${r1(c.y)}A${r1(rx * k1)} ${r1(ry * k1)} 0 1 1 ${r1(c.x + rx * k1)} ${r1(c.y)}`, cls: 'track' });
    }
    m.spokes.forEach((id, i) => {
      spokes.push(link(m.center, id, undefined, ang[i]));
      const kk = m.nodes.get(id).kids;
      const spreadA = spreadOf(i);
      twigs.push(kk.map((kid, j) => {
        const a = ang[i] + (j - (kk.length - 1) / 2) * spreadA;
        const g = G[kid];
        g.x = c.x + rx * Math.cos(a); g.y = c.y + ry * Math.sin(a) - g.capB / 2;
        return link(id, kid);
      }));
    });
    const mode = B.order || (hasKids ? 'branch' : 'route');
    return {
      edges: E,
      program(Pr) {
        if (mode === 'branch') {
          Pr.ripple(spokes.map((e, i) => () => { Pr.step([e]); if (twigs[i].length) Pr.step(twigs[i], 0.12); }), 0.26);
        } else if (mode === 'broadcast') {
          Pr.step(spokes, 0.16);
        } else if (mode === 'gather') {
          Pr.step(spokes.map(e => [e, -1]), 0.3);
        } else {
          // routes through the centre (a spoke in, another out), started a beat apart so they overlap
          const routes = Math.min(n, B.routes || 3), half = Math.floor(n / 2);
          Pr.ripple(Array.from({ length: routes }, (_, k) => () => {
            const a = k % n, b = (a + half) % n;
            Pr.step([[spokes[a], -1]], 0, 0.12);
            Pr.step([spokes[b]]);
          }), 0.5);
        }
      },
    };
  },

  // a hub whose spokes have children, in a wide box: branches out to both sides (a mind map)
  mind(m, B, G, A) {
    const c = G[m.center];
    c.x = B.W / 2; c.y = B.H / 2;
    const n = m.spokes.length, half = Math.ceil(n / 2);
    const sides = [{ ids: m.spokes.slice(0, half), dir: 1 }, { ids: m.spokes.slice(half), dir: -1 }];
    const kidsOf = id => m.nodes.get(id).kids;
    const bw = g => g.w + (g.side ? CAPGAP + 4 + g.capW : 0);
    const E = [], branches = [];
    for (const side of sides) {
      if (!side.ids.length) continue;
      const sw = Math.max(...side.ids.map(id => G[id].w));
      const kw = Math.max(0, ...side.ids.flatMap(id => kidsOf(id).map(k => bw(G[k]))));
      const avail = B.W / 2 - B.pad - c.w / 2;
      const gap = clamp((avail - sw - kw) / 2, 14, B.tier === 'l' ? 120 : 72);
      const inner = B.W / 2 + side.dir * (c.w / 2 + gap);            // spokes' inner edge
      const kidIn = inner + side.dir * (sw + gap);                     // children's inner edge
      // rows: every child, or the spoke itself when it has none; a little more air between branches
      const items = [];
      side.ids.forEach((id, i) => {
        if (i) items.push({ gap: true });
        const kk = kidsOf(id);
        if (kk.length) kk.forEach(k => items.push({ id: k, h: G[k].h + 10 })); else items.push({ id, h: G[id].h + 10, self: true });
      });
      const ys = spread(items.map(it => (it.gap ? (B.tier === 'l' ? 22 : 14) : it.h)), B.pad, B.H - B.pad, 0, B.tier === 'l' ? 30 : 20);
      items.forEach((it, i) => { if (!it.gap) it.y = ys[i]; });
      side.ids.forEach(id => {
        const g = G[id], kk = kidsOf(id);
        const own = items.filter(it => kk.includes(it.id) || it.id === id);
        g.y = own.reduce((a, it) => a + it.y, 0) / own.length;
        g.x = inner + side.dir * (g.w / 2);
        kk.forEach(k => {
          const kg = G[k];
          kg.y = items.find(it => it.id === k).y;
          kg.x = kidIn + side.dir * (kg.w / 2);
          if (side.dir < 0 && kg.side) kg.el.classList.add('dg-node--side-l');
        });
        const ps = side.dir > 0 ? [c.x + c.w / 2, c.y] : [c.x - c.w / 2, c.y];
        const pi = side.dir > 0 ? [g.x - g.w / 2, g.y] : [g.x + g.w / 2, g.y];
        const head = E.push({ from: m.center, to: id, d: pCurve(ps, pi, 'x') }) - 1;
        const po = side.dir > 0 ? [g.x + g.w / 2, g.y] : [g.x - g.w / 2, g.y];
        const tail = kk.map(k => {
          const kg = G[k];
          return E.push({ from: id, to: k, d: pCurve(po, side.dir > 0 ? [kg.x - kg.w / 2, kg.y] : [kg.x + kg.w / 2, kg.y], 'x') }) - 1;
        });
        branches.push({ head, tail });
      });
    }
    // the light takes one branch at a time, right and left in turn
    const half2 = Math.ceil(branches.length / 2), order = [];
    for (let i = 0; i < half2; i++) { order.push(branches[i]); if (branches[half2 + i]) order.push(branches[half2 + i]); }
    return {
      edges: E,
      program(Pr) {
        Pr.ripple(order.map(br => () => { Pr.step([br.head]); if (br.tail.length) Pr.step(br.tail, 0.12); }), 0.26);
      },
    };
  },

  // an orbit: the satellites (logo discs) sit on a ring round the core, a second ring hugs the core.
  // The light runs along the orbit from one satellite to the next, then in to the core.
  ring(m, B, G, A) {
    const c = G[m.center], sp = m.spokes.map(id => G[id]), n = sp.length;
    c.x = B.W / 2; c.y = B.H / 2;
    const ow = Math.max(...sp.map(g => Math.max(g.w, g.capW))), oh = Math.max(...sp.map(g => g.h + g.capB));
    const ry = Math.max(30, B.H / 2 - B.pad - oh / 2);
    const rx = Math.max(40, Math.min(B.W / 2 - B.pad - ow / 2, ry * 1.55));
    const t0 = -Math.PI / 2 + (n % 2 ? 0 : Math.PI / n) + (B.turn || 0);
    const T = sp.map((g, i) => t0 + (2 * Math.PI * i) / n);
    const pt = (t, k = 1) => [c.x + rx * k * Math.cos(t), c.y + ry * k * Math.sin(t)];
    sp.forEach((g, i) => { [g.x, g.y] = pt(T[i]); g.y -= g.capB / 2; });
    const ell = k => `M${r1(c.x + rx * k)} ${r1(c.y)}A${r1(rx * k)} ${r1(ry * k)} 0 1 1 ${r1(c.x - rx * k)} ${r1(c.y)}A${r1(rx * k)} ${r1(ry * k)} 0 1 1 ${r1(c.x + rx * k)} ${r1(c.y)}`;
    const E = [], arcs = [], spokes = [];
    const kIn = clamp((Math.max(c.w / 2 * ry / rx, c.h / 2) + (B.tier === 'c' ? 14 : 22)) / ry, 0.3, 0.62);
    E.push({ d: ell(1), cls: 'track' });
    E.push({ d: ell(kIn), cls: 'track' });
    // a satellite's box (and caption) cut out of the orbit, so a light starts and ends at its rim
    const inside = (g, p, pad) => Math.hypot(p[0] - g.x, p[1] - g.y) < Math.max(g.w, g.h) / 2 + pad;
    const trim = (g, t, dir) => { let tt = t; for (let i = 0; i < 400 && inside(g, pt(tt), 4); i++) tt += dir * 0.004; return tt; };
    for (let i = 0; i < n; i++) {
      const a = sp[i], b = sp[(i + 1) % n];
      const ta = trim(a, T[i], 1), tb = trim(b, T[i] + (2 * Math.PI) / n, -1);
      arcs.push(E.push({ from: a.id, to: b.id, arc: true, cls: 'ghost', d: `M${P(pt(ta))}A${r1(rx)} ${r1(ry)} 0 ${tb - ta > Math.PI ? 1 : 0} 1 ${P(pt(tb))}` }) - 1);
    }
    sp.forEach((g, i) => {
      const t = Math.atan2(g.y + g.capB / 2 - c.y, g.x - c.x);
      const p1 = pt(T[i], kIn), p2 = rayPort(g, t + Math.PI, 3);
      spokes.push(E.push({ from: c.id, to: g.id, d: pLine(p1, p2), cls: 'spoke' }) - 1);
    });
    return {
      edges: E,
      program(Pr) {
        const shots = Math.min(n, B.routes || 3);
        for (let k = 0; k < shots; k++) {
          const i = (k * 2) % n, j = (i + 1) % n;
          Pr.step([arcs[i]], 0, 0.04);
          Pr.step([[spokes[j], -1]], 0, 0.5);
        }
      },
    };
  },

  sync(m, B, G, A) {
    const L = G[m.left], C = G[m.link], R = G[m.right];
    const us = spread([L, C, R].map(A.mE), B.pad, A.M - B.pad, 28, B.tier === 'l' ? 120 : 64);
    [L, C, R].forEach((g, i) => A.put(g, us[i], A.C / 2, true));
    const ax = A.ax;
    const E = [];
    const eL = E.push({ from: L.id, to: C.id, d: pLine(portOut(L, ax), portIn(C, ax)) }) - 1;
    const eR = E.push({ from: C.id, to: R.id, d: pLine(portOut(C, ax), portIn(R, ax)) }) - 1;
    const rowsL = (m.nodes.get(m.left).rows || []).length, rowsR = (m.nodes.get(m.right).rows || []).length;
    const lim = B.tier === 'c' ? 2 : 4;
    return {
      edges: E,
      program(Pr) {
        const shots = Math.max(2, Math.min(4, Math.max(rowsL, rowsR)));
        for (let k = 0; k < shots; k++) {
          if (k % 2 === 0) {
            Pr.step([eL], 0, 0.05);
            Pr.step([[eR, 1, rowsR ? { row: `${m.right}#${(k >> 1) % Math.min(rowsR, lim)}` } : null]]);
          } else {
            Pr.step([[eR, -1]], 0, 0.05);
            Pr.step([[eL, -1, rowsL ? { row: `${m.left}#${((k >> 1) + 1) % Math.min(rowsL, lim)}` } : null]]);
          }
          Pr.wait(0.55);
        }
      },
    };
  },

  timeline(m, B, G, A) {
    const st = m.steps.map(id => G[id]);
    const E = [];
    if (!B.vert) {
      const us = spread(st.map(A.mE), B.pad, A.M - B.pad, 16, B.gapMax);
      const capB = Math.max(...st.map(g => g.capB));
      st.forEach((g, i) => { g.x = us[i]; g.y = A.C / 2 - capB / 2; });
    } else {
      const us = spread(st.map(g => Math.max(g.h, g.side ? g.capH : 0)), B.pad, B.H - B.pad, 10, 44);
      const wid = Math.max(...st.map(g => g.w + (g.side ? CAPGAP + 4 + g.capW : 0)));
      const x0 = Math.max(B.pad, (B.W - wid) / 2);
      st.forEach((g, i) => { g.x = x0 + g.w / 2; g.y = us[i]; });
    }
    const ax = A.ax;
    for (let i = 1; i < st.length; i++) E.push({ from: st[i - 1].id, to: st[i].id, d: pLine(portOut(st[i - 1], ax), portIn(st[i], ax)) });
    return {
      edges: E,
      rest: 2.2,
      program(Pr) {
        Pr.ping(st[0].id, { mark: true }).wait(0.55);
        E.forEach((e, i) => Pr.step([[i, 1, { mark: true, keep: true }]], 0, 0.42));
      },
    };
  },

  grid(m, B, G, A) {
    const grp = G[m.group], stg = m.stages.map(id => G[id]), out = m.output ? G[m.output] : null;
    const chain = [grp, ...stg, ...(out ? [out] : [])];
    const us = spread(chain.map(A.mE), B.pad, A.M - B.pad, 28, B.gapMax);
    chain.forEach((g, i) => A.put(g, us[i], A.C / 2, true));
    const ax = A.ax, E = [];
    for (let i = 1; i < chain.length; i++) E.push({ from: chain[i - 1].id, to: chain[i].id, d: pLine(portOut(chain[i - 1], ax), portIn(chain[i], ax)) });
    return {
      edges: E,
      program(Pr) {
        const nt = m.tiles.length, shots = Math.min(3, nt);
        for (let k = 0; k < shots; k++) {
          Pr.ping(m.tiles[(k * Math.max(1, Math.floor(nt / shots)) + k) % nt]).wait(0.3);
          E.forEach((e, i) => Pr.step([i], 0, 0.12));
          Pr.wait(0.35);
        }
      },
    };
  },

  free(m, B, G, A) {
    for (const [id, n] of m.nodes) {
      const g = G[id];
      const at = (B.tier === 'c' && n.atCompact) || n.at || [0.5, 0.5];
      g.x = clamp(at[0] * B.W, B.pad + g.w / 2, B.W - B.pad - g.w / 2);
      g.y = clamp(at[1] * B.H, B.pad + g.h / 2, B.H - B.pad - g.h / 2 - g.capB);
    }
    const E = m.edges.map(e => {
      const a = G[e.from], b = G[e.to];
      if (!a || !b) return null;
      const dx = b.x - a.x, dy = b.y - a.y;
      const ax = e.axis || (Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y');
      const flip = ax === 'x' ? dx < 0 : dy < 0;
      const pa = flip ? portIn(a, ax) : portOut(a, ax), pb = flip ? portOut(b, ax) : portIn(b, ax);
      return { from: e.from, to: e.to, d: joint(e.curve || 'curve', pa, pb, ax, null, 12), cls: e.idle ? 'idle' : e.faint ? 'faint' : '' };
    }).filter(Boolean);
    const idx = (a, b) => E.findIndex(e => e.from === a && e.to === b);
    return {
      edges: E,
      program(Pr) {
        if (m.shots) {
          // a shot is a list of steps; a step is "a>b" or a list of them run together. The light runs
          // from a to b, against the drawn direction if the edge was listed as b to a
          for (const shot of m.shots) {
            for (const stepList of shot) {
              const list = (Array.isArray(stepList) ? stepList : [stepList]).map(x => {
                const [a, b] = String(x).split('>');
                let e = idx(a, b), dir = 1;
                if (e < 0) { e = idx(b, a); dir = -1; }
                const tgt = m.nodes.get(b);
                return e < 0 ? null : [e, dir, tgt && tgt.done ? { mark: true } : null];
              }).filter(Boolean);
              if (list.length) Pr.step(list, 0.12);
            }
            Pr.wait(0.45);
          }
          return;
        }
        // default: breadth first from the nodes nothing points at, idle branches left dark
        const live = E.map((e, i) => i).filter(i => E[i].cls !== 'idle');
        const into = new Set(live.map(i => E[i].to));
        let front = [...m.nodes.keys()].filter(id => !into.has(id));
        const done = new Set();
        while (front.length) {
          const step = live.filter(i => front.includes(E[i].from) && !done.has(i));
          if (!step.length) break;
          step.forEach(i => done.add(i));
          Pr.step(step.map(i => [i, 1, m.nodes.get(E[i].to).done ? { mark: true } : null]), 0.12);
          front = [...new Set(step.map(i => E[i].to))];
        }
      },
    };
  },
};

/* ================================================================ the program: when each light runs */
function Program(E, speed) {
  const F = [];
  const Pr = {
    F, t: 0.35,
    fire(e, at, dir = 1, extra) {
      const ed = E[e];
      const d = clamp((ed.len + ed.c) / (205 * speed), 0.55, 2.3);
      const hitT = d * unease(ed.len / (ed.len + ed.c));
      F.push({ e, t0: at, dur: d, dir, hitT, hit: dir > 0 ? ed.to : ed.from, ...(extra || {}) });
      return at + hitT;
    },
    step(list, stagger = 0.12, dwell = 0.2) {
      let end = Pr.t;
      list.forEach((x, i) => {
        const [e, dir, extra] = Array.isArray(x) ? x : [x, 1, null];
        end = Math.max(end, Pr.fire(e, Pr.t + i * stagger, dir, extra));
      });
      Pr.t = end + dwell;
      return Pr;
    },
    // branches run as a ripple: each starts `gap` after the one before it, while that one is still travelling, so the
    // lines overlap and stay staggered (a hub, a tree) instead of waiting in a queue; the program ends when the last ends
    ripple(fns, gap = 0.24) {
      const t0 = Pr.t; let end = t0;
      fns.forEach((fn, k) => { Pr.t = t0 + k * gap; fn(); end = Math.max(end, Pr.t); });
      Pr.t = end;
      return Pr;
    },
    ping(id, extra) { F.push({ e: -1, t0: Pr.t, dur: 0.01, dir: 1, hitT: 0, hit: id, ...(extra || {}) }); return Pr; },
    wait(sec) { Pr.t += sec; return Pr; },
  };
  return Pr;
}

const HIT = 0.95;      // how long a node answers a light, s
const DECAY = 0.9;     // how long a crossed line stays lit, s

/* ================================================================ the diagram */
class Diagram {
  constructor(el, spec, opts = {}) {
    this.el = el;
    this.spec = spec || {};
    this.opts = opts;
    this.model = normalise(this.spec);
    this.t = 0;
    this.playing = false;
    this.userPaused = false;
    this.visible = false;
    this.focusId = null;
    this.reg = new Map();
    this.cls = { hit: new Set(), done: new Set() };
    el.classList.add('dg');
    el.dataset.layout = this.model.layout;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'img');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', this.spec.alt || this.altText());
    this.cycles = +(el.closest('[data-ui-cycles]')?.dataset.uiCycles || this.spec.cycles || 0);
    this.tick = this.tick.bind(this);
    // an icon turned out to be a wordmark: lay out again once (its slot is known from then on)
    this.relayout = () => { if (this.rq) return; this.rq = requestAnimationFrame(() => { this.rq = 0; if (this.el.isConnected) this.build(); }); };
    this.ro = new ResizeObserver(() => this.queue());
    this.ro.observe(el);
    this.io = new IntersectionObserver(es => { this.visible = es[es.length - 1].isIntersecting; this.sync(); }, { threshold: 0.12 });
    this.io.observe(el);
    this.onVis = () => this.sync();
    document.addEventListener('visibilitychange', this.onVis);
    this.onRM = () => { this.build(); this.sync(); };
    this.bindCard();
    reducedMQ.addEventListener?.('change', this.onRM);
    phoneMQ.addEventListener?.('change', this.onRM);
    // the web font changes every label's width: lay out again once it is in
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (this.el.isConnected) this.build(); });
    this.build();
  }

  altText() {
    const labels = [...this.model.nodes.values()].map(n => n.label).filter(Boolean);
    return labels.length ? `Diagram: ${labels.slice(0, 8).join(', ')}` : 'Diagram';
  }

  // how many nodes (with their captions) leave the box or overlap another, as laid out
  problems(G) {
    const o = this.el.getBoundingClientRect();
    const boxes = [];
    for (const id in G) {
      const el = G[id].el;
      const b = el.getBoundingClientRect();
      boxes.push({ id, l: b.left - o.left, t: b.top - o.top, r: b.right - o.left, b: b.bottom - o.top });
      const cap = el.querySelector(':scope > .dg-cap');
      if (cap) { const c = cap.getBoundingClientRect(); boxes.push({ id, l: c.left - o.left, t: c.top - o.top, r: c.right - o.left, b: c.bottom - o.top }); }
    }
    let n = 0;
    this.extH = boxes.length ? Math.max(...boxes.map(b => b.b)) - Math.min(...boxes.map(b => b.t)) : 0;
    for (const b of boxes) if (b.l < -0.5 || b.t < -0.5 || b.r > o.width + 0.5 || b.b > o.height + 0.5) n++;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.id === b.id) continue;
      if (Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1) n++;
    }
    return n;
  }

  // one still picture instead of a loop: reduced motion, "pulse": "none", a held group
  // ([data-ui-still], as system.js marks every visual but a group's one loop), or a phone (under
  // 640px nothing loops, as in the rest of the system; data-dg-phone="loop" or "phoneLoop": true
  // keeps this one moving)
  get still() {
    const m = this.spec.motion || {};
    const phone = phoneMQ.matches && !(this.spec.phoneLoop || this.el.closest('[data-dg-phone="loop"]'));
    return reducedMQ.matches || kindOther() || m.pulse === 'none' || phone || (this.heldByPage && !this.hoverPlay);
  }
  // held by hand: data-dg-still on the element or around it (a diagram card's pulse is its own loop, so data-ui-still,
  // which the page puts on every fragment but a group's one loop, does not hold it)
  get heldByPage() { return !!this.el.closest('[data-dg-still]'); }

  // a held diagram plays while the pointer is on its card: it starts from its still and, after the
  // pointer leaves, runs on to that same moment and rests there, so it never jumps
  bindCard() {
    // the card, not the nearest panel inside it: the pointer on the card's title plays it too
    const host = this.el.closest('.card') || this.el.closest('.frame, .panel') || this.el;
    this.onEnter = ev => {
      if (ev.pointerType === 'touch' || reducedMQ.matches || phoneMQ.matches || kindOther() || (this.spec.motion || {}).pulse === 'none' || this.spec.hoverPlay === false) return;
      // a looping diagram starts its cycle again from the first beat
      if (!this.heldByPage) return this.restart();
      if (!this.hoverPlay) { this.hoverPlay = true; this.t = this.stillT; }
      this.stopAt = null;
      this.el.classList.remove('is-still');
      this.sync();
    };
    // keyboard focus moving into the card does the same as the pointer
    this.onFocus = ev => { if (ev.target.matches && ev.target.matches(':focus-visible')) this.onEnter({ pointerType: 'keyboard' }); };
    this.onLeave = () => {
      if (!this.hoverPlay) return;
      const ph = ((this.t % this.T) + this.T) % this.T;
      this.stopAt = this.t + (((this.stillT - ph) % this.T + this.T) % this.T || this.T);
    };
    host.addEventListener('pointerenter', this.onEnter);
    host.addEventListener('pointerleave', this.onLeave);
    host.addEventListener('focusin', this.onFocus);
    this.hoverHost = host;
  }

  // the loop starts again from its first beat (pointer or focus entering the card); a loop the visitor paused stays paused,
  // a still (phone, reduced motion) stays a still
  restart() {
    if (this.still || this.userPaused || this.finished || !this.E || !this.E.length) return;
    this.t = 0;
    this.stopAt = null;
    this.render(0);
    if (!this.playing) this.sync();
  }

  // is the ground dark? (the ink is light) - a dark ground takes a stronger halo
  darkGround() {
    const c = (getComputedStyle(this.el).color.match(/[\d.]+/g) || [0, 0, 0]).map(Number);
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 > 0.5;
  }

  queue() {
    if (this.q) return;
    this.q = requestAnimationFrame(() => { this.q = 0; const W = this.el.clientWidth, H = this.el.clientHeight; if (Math.abs(W - this.W) > 0.5 || Math.abs(H - this.H) > 0.5) this.build(); });
  }

  build() {
    const el = this.el, sp = this.spec, m = this.model;
    // a free-standing diagram (not filling a panel) takes its own proportions
    const fill = getComputedStyle(el).position === 'absolute';
    const W0 = el.clientWidth;
    if (!fill && W0) {
      const size = sp.size === 'section' ? [1200, 560] : sp.size === 'band' ? [560, 220] : Array.isArray(sp.size) ? sp.size : [560, 340];
      const small = sp.sizeCompact || (W0 < 480 ? [6, 5] : null);
      el.style.aspectRatio = small ? `${small[0]} / ${small[1]}` : `${size[0]} / ${size[1]}`;
    }
    const W = el.clientWidth, H = el.clientHeight;
    this.W = W; this.H = H;
    if (!W || !H) return;
    const L = m.layout;
    const tier = W < 480 ? 'c' : W >= 900 && H >= 380 ? 'l' : 'n';
    const flowL = ['lanes', 'fanin', 'bowtie', 'tree', 'grid', 'timeline', 'sync'].includes(L);
    const orient = sp.orient || 'auto';
    const vert = flowL && (orient === 'v' || (orient === 'auto' && (tier === 'c' || H > W * 1.15)));
    el.replaceChildren();
    if (this.btn && !this.btn.isConnected) this.btn = null;
    this.cls = { hit: new Set(), done: new Set() };

    const svg = s('svg', { class: 'dg-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false' }, el);
    const defs = s('defs', {}, svg);
    const layer = h('div', 'dg-nodes', el);
    layer.setAttribute('aria-hidden', 'true');

    // 1. nodes at their true size, measured, laid out and checked: a try that spills or overlaps is
    // made again tighter (level 1 drops meta and sub lines, 2 takes the next size down, 3 turns a
    // flow vertical); the first clean try wins, else the one with the fewest problems
    const hasKids = L === 'hub' && m.spokes.some(id => m.nodes.get(id).kids.length);
    // an orbit of logos needs no names under them (the mark is the name); glyphs and letters do
    const ringLabels = sp.labels ?? (L === 'ring' && m.spokes.some(id => !/^[a-z0-9-]+$|^(logos|brands|file|si):/.test(m.nodes.get(id).icon || 'ui:')));
    // where the icon files are: the spec, the element or a parent (data-icon-base), the mount
    // options, else assets/icons/ beside this folder
    const baseRaw = sp.iconBase || el.closest('[data-icon-base]')?.dataset.iconBase || this.opts.iconBase;
    this.iconBase = baseRaw ? new URL(baseRaw.replace(/\/?$/, '/'), document.baseURI).href : ICON_BASE;
    // "shape": "radial" keeps a hub with branches round its centre (a web) at every width over 480px,
    // up to 4 branches; with more it is drawn as the mind map (a web of 5+ branches crowds its leaves)
    const radialOK = sp.shape === 'radial' && L === 'hub' && m.spokes.length <= 4;
    const attempt = (level, t, v, tight) => {
      layer.replaceChildren();
      this.reg = new Map();
      el.dataset.tier = t;
      el.dataset.orient = v ? 'v' : 'h';
      // a tight try: less air round the box and in the pills, before nodes lose their names
      el.classList.toggle('dg--tight', !!tight);
      const pad = tight ? 16 : t === 'c' ? 14 : t === 'l' ? 40 : 24;
      const ctx = {
        tier: t, L, level, mind: hasKids && t !== 'c' && level < 2 && W > H * 1.1 && !radialOK,
        radial: hasKids && t !== 'c' && radialOK, outline: hasKids && t === 'c',
        // the core's tone: "coreTone" ("ink", "accent", "plain"); a string "core" works too where the
        // layout does not use "core" for its node (lanes and bowtie do)
        iconBase: this.iconBase, coreTone: sp.coreTone || (typeof sp.core === 'string' ? sp.core : null), ringLabels,
        // tiles keep their names below them in a hub drawn small on a box 480px or wider (a desktop card)
        caps: CAPS[L] || (L === 'hub' && W >= 480),
        relayout: this.relayout, tight: !!tight,
      };
      if (L === 'sync') el.style.setProperty('--dg-sys-w', Math.round(v ? Math.min(W - 2 * pad, 300) : clamp((W - 2 * pad - 112 - 56) / 2, 150, t === 'l' ? 270 : 220)) + 'px');
      const G = {};
      for (const [id, n] of m.nodes) {
        if (n.role === 'tile') continue;
        const kind = kindOf(n, ctx);
        const nodeEl = makeNode(n, kind, ctx, layer, this.reg);
        if (L === 'timeline' && v) nodeEl.classList.add('dg-node--side');
        if (kind === 'group') {
          const grid = nodeEl.querySelector('.dg-group__grid');
          const tiles = m.tiles || [];
          const cols = tiles.length <= 4 ? tiles.length : level >= 1 && !v ? 2 : Math.ceil(tiles.length / 2);
          grid.style.setProperty('--cols', cols);
          tiles.forEach(tid => makeNode(m.nodes.get(tid), 'gtile', ctx, grid, this.reg));
        }
      }
      for (const [id, n] of m.nodes) if (n.role !== 'tile') G[id] = geo(n, this.reg.get(id));
      const B = { W, H, tier: t, vert: v, level, mind: ctx.mind, radial: ctx.radial, outline: ctx.outline, pad, gapMax: sp.gapMax || (t === 'l' ? 140 : 96), curve: sp.curve, web: sp.web, order: (sp.motion || {}).order, routes: sp.routes, turn: sp.turn };
      let out;
      try { out = (LAYOUTS[L] || LAYOUTS.free)(m, B, G, axesOf(B)); } catch (err) { console.warn('diagram: layout failed', err); return null; }
      for (const id in G) {
        const g = G[id];
        g.el.style.left = Math.round(g.x - g.w / 2) + 'px';
        g.el.style.top = Math.round(g.y - g.h / 2) + 'px';
      }
      const issues = this.problems(G);
      return { level, t, v, G, B, out, issues, extH: this.extH };
    };
    const plan = [[0, tier, vert], [1, tier, vert]];
    // a hub of named pills tries a tighter ellipse before its pills become nameless tiles
    if (L === 'hub' && tier !== 'c') plan.push([1, tier, vert, true]);
    if (tier !== 'c') plan.push([2, tier === 'l' ? 'n' : 'c', vert]);
    if (flowL && !vert && orient === 'auto') plan.push([3, 'c', true]);
    let best = null, lastRun = null;
    for (const [lv, t, v, tg] of plan) {
      lastRun = attempt(lv, t, v, tg);
      if (lastRun) lastRun.tight = !!tg;
      if (lastRun && (!best || lastRun.issues < best.issues)) best = lastRun;
      if (lastRun && !lastRun.issues) break;
    }
    if (!best) return;
    // a flat drawing (a timeline, a sync, a short chain) that fills under 55% of the box's height
    // takes the next size up (cards with their sub lines, larger tiles, wider gaps) when that fits clean
    const FLAT = ['timeline', 'sync', 'grid', 'tree', 'free', 'lanes', 'fanin', 'bowtie'];
    let up = null;
    if (!best.issues && best.t === 'n' && tier === 'n' && !best.v && best.level === 0 && FLAT.includes(L) && best.extH < 0.55 * H && W >= 480 && sp.fit !== false) {
      up = attempt(0, 'l', false);
      if (up && !up.issues && up.extH > best.extH + 8) { best = up; lastRun = up; }
      else lastRun = up;
      // steps that still lie in a thin line read better as a checklist down the box
      if (L === 'timeline' && best.extH < 0.45 * H && orient === 'auto') {
        const dn = attempt(0, 'n', true);
        lastRun = dn;
        if (dn && !dn.issues && dn.extH > best.extH * 1.6) best = dn;
      }
    }
    const last = best === lastRun ? best : attempt(best.level, best.t, best.v, best.tight);
    if (!last) return;
    // still a thin band in a card's panel: the panel takes the band height (diagram.css, data-size
    // "band": --p-h 240px), so the card is not mostly empty ground. "size": "band" asks for it
    // outright; "size": "card" keeps the panel as the page set it
    const hostP = el.parentElement;
    if (hostP && hostP.matches('.panel')) {
      const band = sp.size === 'band' || (sp.size == null && last.t !== 'c' && tier !== 'l' && !last.v && FLAT.includes(L) && last.extH < 0.45 * H) || (el.dataset.size === 'band' && tier === 'n' && sp.size == null);
      if (band) el.dataset.size = 'band'; else delete el.dataset.size;
    }
    const { G, B, out } = last;
    const tierUsed = last.t;
    this.level = last.level;
    // still too tall for its panel: the panel grows to fit (diagram.css reads --dg-min) and the
    // ResizeObserver lays it out again
    const host = el.parentElement;
    if (last.issues && host && host.matches('.panel, .panel__screen, .frame') && last.extH + 2 * B.pad > H + 1) {
      const need = Math.ceil(last.extH + 2 * Math.min(B.pad, 18));
      if (need > (parseFloat(host.style.getPropertyValue('--dg-min')) || 0)) host.style.setProperty('--dg-min', need + 'px');
    }
    el.classList.toggle('is-still', this.still);
    el.dataset.ground = this.darkGround() ? 'dark' : 'light';
    // the ground under the lines, one or two words: "dots" a faint dot ruling that fades out towards
    // the edges, "grid" a hairline grid, "rings" hairline circles round the core (the default for a hub),
    // "glow" a soft light of the accent under the core with a fine grain, "none" (the default on a panel
    // that has its own effect ground). "glow dots" and "glow rings" combine.
    const onFx = !!el.closest('[data-fx], [data-effect], [data-ground-fx]');
    // the default varies with the drawing, so a page of diagrams is not one dot ruling throughout:
    // rings round a hub, nothing under an orbit (its tracks are the ground), a timeline or a sync
    // (a line on plain ground), the soft light under the core where the diagram leads a section
    const lead = tier === 'l' && !!(m.center || m.core || m.target);
    const ground = String(kindOther() ? 'none' : sp.ground || (onFx ? 'none'
      : L === 'hub' && !B.mind && !B.outline ? (lead ? 'glow rings' : 'rings')
      : ['ring', 'timeline', 'sync'].includes(L) ? (lead ? 'glow' : 'none')
      : lead ? 'glow dots' : 'dots'));
    el.dataset.dgGround = ground;
    const coreId = m.center || m.core || (m.layout === 'fanin' || m.layout === 'bowtie' ? m.target : null);
    const cg = coreId && G[coreId];
    el.style.setProperty('--dg-cx', r1(cg ? cg.x : W / 2) + 'px');
    el.style.setProperty('--dg-cy', r1(cg ? cg.y : H / 2) + 'px');
    if (/\brings\b/.test(ground)) {
      const cx = cg ? cg.x : W / 2, cy = cg ? cg.y : H / 2;
      const step = clamp(Math.min(W, H) * 0.19, 46, 112);
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
      const n = Math.max(2, Math.floor(far / step));
      const rg = s('g', { class: 'dg-rings' }, svg);
      for (let k = 1; k <= n; k++) s('circle', { cx: r1(cx), cy: r1(cy), r: r1(step * k), 'stroke-opacity': r1(Math.max(0, 1 - (k - 0.6) / (n * 0.82)) * 100) / 100 }, rg);
    }

    // a soft light behind the centre of the diagram (the core), in the colour of the light
    if (coreId && G[coreId] && sp.halo !== false) {
      const gid = 'dgh' + (++uid);
      const rg = s('radialGradient', { id: gid }, defs);
      s('stop', { offset: '0', class: 'dg-halo__in' }, rg);
      s('stop', { offset: '1', class: 'dg-halo__out' }, rg);
      const g = G[coreId];
      s('circle', { class: 'dg-halo', cx: r1(g.x), cy: r1(g.y), r: r1(Math.min(W, H) * (tierUsed === 'c' ? 0.36 : 0.3)), fill: `url(#${gid})` }, svg);
    }
    // the pause button takes the first corner no node or caption covers (bottom right, as everywhere
    // in the system, when it is free)
    {
      const boxes = [];
      for (const id in G) {
        const g = G[id];
        boxes.push([g.x - g.w / 2, g.y - g.h / 2, g.x + g.w / 2, g.y + g.h / 2 + g.capB]);
        if (g.side && g.capW) boxes.push([g.x - g.w / 2, g.y - g.h / 2, g.x + g.w / 2 + CAPGAP + 4 + g.capW, g.y + g.h / 2]);
        if (!g.side && g.capW > g.w) boxes.push([g.x - g.capW / 2, g.y, g.x + g.capW / 2, g.y + g.h / 2 + g.capB]);
      }
      const free = (x0, y0) => !boxes.some(b => b[0] < x0 + 44 && b[2] > x0 && b[1] < y0 + 44 && b[3] > y0);
      const corners = [['br', W - 50, H - 50], ['tr', W - 50, 6], ['bl', 6, H - 50], ['tl', 6, 6]];
      this.corner = (corners.find(([, x, y]) => free(x, y)) || corners[0])[0];
    }

    const edgesG = s('g', { class: 'dg-edges' }, svg);
    const pulse = (sp.motion || {}).pulse || 'comet';
    this.E = out.edges.map((e, i) => {
      const g = s('g', { class: 'dg-e' + (e.cls ? ' is-' + e.cls : '') }, edgesG);
      const line = s('path', { class: 'dg-line', d: e.d }, g);
      const len = line.getTotalLength();
      const ed = { ...e, i, g, line, len, layers: [], lit: null, c: clamp(len * 0.4, 30, tierUsed === 'l' ? 150 : 112), litState: '' };
      if (e.cls === 'track' || e.cls === 'idle') return ed;
      ed.lit = s('path', { class: 'dg-lit', d: e.d }, g);
      // the light: a short stretch of the line stroked with a gradient that runs from clear at its tail
      // to full at its head (the gradient's ends follow the light every frame), a wide soft glow under
      // its front half, and a bright point on its head. "pulse": "dot" is the point alone with a short tail.
      const big = len + ed.c * 2 + 40;
      const gid = 'dgc' + (++uid);
      ed.grad = s('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
      s('stop', { offset: '0', class: 'dg-c0' }, ed.grad);
      s('stop', { offset: '0.55', class: 'dg-c1' }, ed.grad);
      s('stop', { offset: '1', class: 'dg-c2' }, ed.grad);
      const tail = pulse === 'dot' ? ed.c * 0.45 : ed.c;
      const L2 = [['dg-glow', tail * 0.55], ['dg-comet', tail]];
      for (const [cls, l] of L2) {
        const p = s('path', { class: cls, d: e.d, stroke: `url(#${gid})`, 'stroke-dasharray': `${r1(l)} ${r1(big)}`, 'stroke-dashoffset': r1(big) }, g);
        ed.layers.push({ el: p, len: l });
      }
      ed.tailLen = tail;
      ed.halo = s('circle', { class: 'dg-spark-halo', r: tierUsed === 'c' ? 5 : 6, cx: -50, cy: -50 }, g);
      ed.spark = s('circle', { class: 'dg-spark', r: tierUsed === 'l' ? 2.4 : 2.1, cx: -50, cy: -50 }, g);
      return ed;
    });
    // ports: a small dot where a line meets a card or a pill
    if (sp.ports !== false) {
      const portsG = s('g', { class: 'dg-ports' }, svg);
      for (const e of this.E) {
        if (e.cls === 'track' || e.arc) continue;
        const a = e.line.getPointAtLength(0), b = e.line.getPointAtLength(e.len);
        for (const [p, id] of [[a, e.from], [b, e.to]]) {
          const node = m.nodes.get(id);
          const k = this.reg.get(id)?.className || '';
          if (!node || /--(step|dot|gtile|disc)/.test(k)) continue;
          s('circle', { class: 'dg-port', cx: r1(p.x), cy: r1(p.y), r: 2 }, portsG);
        }
      }
    }

    // 3. the program
    const Pr = Program(this.E, (sp.motion || {}).speed || 1);
    out.program(Pr);
    this.F = Pr.F.filter(f => f.e < 0 || (this.E[f.e] && this.E[f.e].lit));
    const end0 = Math.max(0.5, ...this.F.map(f => f.t0 + f.dur));
    // one cycle of 2.5 - 4 s (3.2 s unless motion.cycle says otherwise): the program is fitted to the cycle less its rest
    // (the lines fading), every start, length and arrival scaled together, so the order and the stagger are kept
    const mo = sp.motion || {};
    const cycle = clamp(+mo.cycle || 3.2, 2.5, 4);
    const rest = clamp(mo.rest ?? cycle * 0.28, 0.5, 1.2);
    const k = clamp((cycle - rest) / end0, 0.25, 1.6);
    this.F.forEach(f => { f.t0 *= k; f.dur *= k; f.hitT *= k; });
    this.T = clamp(end0 * k + rest, 2.5, 4);
    this.byEdge = this.E.map(() => []);
    this.F.forEach(f => { if (f.e >= 0) this.byEdge[f.e].push(f); });
    this.stillT = this.pickStill();
    this.applyFocus();
    this.bindHover(layer);
    this.render(this.still || this.finished ? this.stillT : this.t % this.T);
    this.sync();
  }

  // the busiest moment of the loop: the most lines lit or running, frozen as the still
  pickStill() {
    let best = 0, bestScore = -1;
    for (let k = 0; k < 160; k++) {
      const lt = (this.T * k) / 160;
      const st = this.state(lt);
      let score = 0;
      st.run.forEach((f, e) => { if (f) { const u = (lt - f.t0) / f.dur; score += u > 0.25 && u < 0.62 ? 2.2 : 0.6; } });
      st.lit.forEach(a => { score += a > 0.5 ? 1 : 0; });
      score += st.hits.size * 0.5 + st.done.size * 0.4;
      if (score > bestScore + 0.01) { bestScore = score; best = lt; }
    }
    return best;
  }

  state(lt) {
    const run = new Array(this.E.length).fill(null);
    const lit = new Array(this.E.length).fill(0);
    const hits = new Set(), done = new Set();
    for (const f of this.F) {
      const dt = lt - f.t0;
      if (dt < 0) continue;
      const ht = dt - f.hitT;
      if (ht >= 0 && ht < HIT) { hits.add(f.hit); if (f.row) hits.add(f.row); }
      if (f.mark && ht >= 0 && lt < this.T - 0.35) done.add(f.hit);
    }
    this.E.forEach((e, i) => {
      const fs = this.byEdge[i];
      if (!fs || !fs.length) return;
      let last = null;
      for (const f of fs) {
        const dt = lt - f.t0;
        if (dt >= 0 && dt < f.dur) run[i] = f;
        if (dt >= f.hitT && (!last || f.t0 > last.t0)) last = f;
      }
      if (run[i]) lit[i] = 1;
      else if (last) lit[i] = last.keep ? (lt < this.T - 0.35 ? 1 : 0) : clamp(1 - (lt - last.t0 - last.hitT) / DECAY, 0, 1);
    });
    return { run, lit, hits, done };
  }

  render(lt) {
    if (!this.E) return;
    const st = this.state(lt);
    this.E.forEach((e, i) => {
      if (!e.lit) return;
      const f = st.run[i];
      if (f) {
        const u = (lt - f.t0) / f.dur;
        const p = ease(u) * (e.len + e.c);
        for (const ly of e.layers) ly.el.setAttribute('stroke-dashoffset', r1(f.dir > 0 ? ly.len - p : p - e.len));
        // the gradient runs from the light's tail to its head, so the light fades out behind itself
        const at = d => e.line.getPointAtLength(clamp(f.dir > 0 ? d : e.len - d, 0, e.len));
        const hd = at(p), td = at(p - e.tailLen);
        if (Math.hypot(hd.x - td.x, hd.y - td.y) > 0.5) {
          e.grad.setAttribute('x1', r1(td.x)); e.grad.setAttribute('y1', r1(td.y));
          e.grad.setAttribute('x2', r1(hd.x)); e.grad.setAttribute('y2', r1(hd.y));
        }
        const sa = p <= e.len ? clamp(p / 10, 0, 1) : 0;
        e.spark.setAttribute('cx', r1(hd.x)); e.spark.setAttribute('cy', r1(hd.y));
        e.halo.setAttribute('cx', r1(hd.x)); e.halo.setAttribute('cy', r1(hd.y));
        e.spark.style.opacity = e.halo.style.opacity = sa;
        const q = Math.min(p, e.len);
        e.lit.setAttribute('stroke-dasharray', f.dir > 0 ? `${r1(q)} ${r1(e.len + 2)}` : `0 ${r1(e.len - q)} ${r1(q)} ${r1(e.len + 2)}`);
        e.lit.style.opacity = '1';
        if (!e.running) { e.g.classList.add('is-run'); e.running = true; }
      } else {
        if (e.running) { e.g.classList.remove('is-run'); e.running = false; }
        const a = st.lit[i];
        if (a > 0) { e.lit.setAttribute('stroke-dasharray', 'none'); e.lit.style.opacity = r1(a * 100) / 100 + ''; }
        else if (e.lit.style.opacity !== '0') e.lit.style.opacity = '0';
      }
    });
    this.swap('hit', st.hits, 'is-hit');
    this.swap('done', st.done, 'is-done');
  }

  swap(key, next, cls) {
    const prev = this.cls[key];
    for (const id of prev) if (!next.has(id)) this.reg.get(id)?.classList.remove(cls);
    for (const id of next) if (!prev.has(id)) this.reg.get(id)?.classList.add(cls);
    this.cls[key] = next;
  }

  /* ---------------------------------------------------------------- motion */
  sync() {
    const can = !this.still && !this.held && this.visible && !document.hidden && !this.userPaused && !this.finished && this.E && this.E.length;
    if (can && !this.playing) this.play(true);
    else if (!can && this.playing) this.stop();
    this.pauseButton();
  }
  play(auto) {
    if (!auto) { this.userPaused = false; this.held = false; if (!this.visible) return this.sync(); }
    if (this.playing || this.still) return;
    this.playing = true;
    this.started = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    this.pauseButton();
  }
  stop() {
    this.playing = false;
    cancelAnimationFrame(this.raf);
  }
  pause() { this.userPaused = true; this.stop(); this.pauseButton(); }
  tick(now) {
    if (!this.playing) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    if (this.stopAt != null && this.t >= this.stopAt) {
      this.t = this.stopAt; this.stopAt = null; this.hoverPlay = false;
      this.stop(); this.render(this.stillT); this.el.classList.add('is-still'); this.pauseButton(); return;
    }
    if (this.cycles && this.t >= this.cycles * this.T) {
      this.finished = true; this.stop(); this.render(this.stillT); this.pauseButton(); return;
    }
    this.render(this.t % this.T);
    this.raf = requestAnimationFrame(this.tick);
  }
  // hold one moment (screenshots, a scrubber): seek(d.stillT) is the still, seek(d.T - 0.05) the rest
  seek(sec) {
    this.stop();
    this.held = true;
    this.el.classList.remove('is-still');
    this.t = sec;
    this.render(((sec % this.T) + this.T) % this.T);
    this.pauseButton();
  }

  // the system's pause button: one solid disc in the corner of the visual's box, for a loop that runs on
  pauseButton() {
    const loops = !this.still && !this.hoverPlay && !this.finished && !(this.cycles && this.cycles * this.T <= 5) && this.E && this.E.some(e => e.lit);
    const host = this.el.closest('.panel__screen, .panel, .frame') || this.el;
    let b = this.btn;
    if (!loops || this.opts.controls === false) { if (b) { b.remove(); this.btn = null; } return; }
    if (!b) {
      const other = host.querySelector(':scope > .loop-pause');
      if (other && other !== b) return;
      b = this.btn = h('button', 'loop-pause dg-pause', host);
      b.type = 'button';
      b.addEventListener('click', () => (this.userPaused ? this.play() : this.pause()));
    }
    const corner = this.corner || 'br';
    if (b.dataset.corner !== corner) {
      b.dataset.corner = corner;
      b.style.top = corner[0] === 't' ? '12px' : '';
      b.style.bottom = corner[0] === 't' ? 'auto' : '';
      b.style.left = corner[1] === 'l' ? '12px' : '';
      b.style.right = corner[1] === 'l' ? 'auto' : '';
    }
    const paused = this.userPaused;
    b.setAttribute('aria-pressed', paused ? 'true' : 'false');
    b.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    b.classList.toggle('is-paused', paused);
    const icon = paused ? '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.5v9l7.5-4.5z"/></svg>' : '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 2.5h2.5v9H3.5zM8 2.5h2.5v9H8z"/></svg>';
    if (b.dataset.state !== String(paused)) { b.innerHTML = icon; b.dataset.state = String(paused); }
  }

  /* ---------------------------------------------------------------- hover: light every path through a node */
  bindHover(layer) {
    if (this.spec.hover === false) return;
    layer.addEventListener('pointerover', ev => {
      if (ev.pointerType === 'touch') return;
      const n = ev.target.closest('.dg-node');
      const id = (n && n.dataset.id) || null;
      if (id !== this.focusId) { this.focusId = id; this.applyFocus(); }
    });
    layer.addEventListener('pointerleave', () => { this.focusId = null; this.applyFocus(); });
  }
  applyFocus() {
    const id = this.focusId;
    this.el.classList.toggle('is-focus', !!id);
    this.reg.forEach(el => el.classList && el.classList.remove('is-focus'));
    (this.E || []).forEach(e => e.g.classList.remove('is-focus'));
    if (!id || !this.E) return;
    const live = this.E.filter(e => e.cls !== 'track' && e.from && e.to);
    const nodes = new Set([id]);
    const up = [id], down = [id];
    const parentOf = nid => this.model.nodes.get(nid)?.parent;
    const walks = e => e.cls !== 'faint' && e.cls !== 'ghost';
    while (up.length) { const x = up.pop(); for (const e of live) if (e.to === x && walks(e) && !nodes.has(e.from)) { nodes.add(e.from); up.push(e.from); } }
    while (down.length) { const x = down.pop(); for (const e of live) if (e.from === x && walks(e) && !nodes.has(e.to)) { nodes.add(e.to); down.push(e.to); } }
    const p = parentOf(id);
    if (p && this.model.layout === 'grid') nodes.add(p);
    live.forEach(e => { if (nodes.has(e.from) && nodes.has(e.to)) e.g.classList.add('is-focus'); });
    nodes.forEach(nid => this.reg.get(nid)?.classList.add('is-focus'));
  }

  destroy() {
    this.stop();
    cancelAnimationFrame(this.rq);
    this.ro.disconnect();
    this.io.disconnect();
    document.removeEventListener('visibilitychange', this.onVis);
    reducedMQ.removeEventListener?.('change', this.onRM);
    phoneMQ.removeEventListener?.('change', this.onRM);
    if (this.btn) this.btn.remove();
    if (this.hoverHost) { this.hoverHost.removeEventListener('pointerenter', this.onEnter); this.hoverHost.removeEventListener('pointerleave', this.onLeave); this.hoverHost.removeEventListener('focusin', this.onFocus); }
    this.el.replaceChildren();
    instances.delete(this);
  }
}

/* ================================================================ public */
const instances = new Set();
let presetsP = null;
function presets(url) {
  if (!presetsP || url) presetsP = fetch(url || new URL('presets.json', HERE)).then(r => r.json()).then(j => j.presets || j);
  return presetsP;
}
function mount(el, spec, opts) {
  const old = [...instances].find(d => d.el === el);
  if (old) old.destroy();
  const d = new Diagram(el, spec, opts);
  instances.add(d);
  return d;
}
// a spec that cannot be read leaves the names it could still find as a plain row of pills, never an
// empty panel (the checker still counts it as no visual: it has no .dg-svg)
function fallbackList(el, text) {
  const names = [...new Set([...String(text || '').matchAll(/"label"\s*:\s*"([^"]{1,40})"/g)].map(x => x[1]))].slice(0, 8);
  el.classList.add('dg', 'dg--broken');
  el.replaceChildren();
  if (!names.length) return;
  const ul = h('ul', 'dg-fallback', el);
  names.forEach(t => h('li', '', ul, t));
}
async function auto(root = document, opts = {}) {
  const els = [...root.querySelectorAll('[data-diagram]')];
  const out = [];
  for (const el of els) {
    let spec = null;
    const v = (el.dataset.diagram || '').trim();
    const inline = el.querySelector(':scope > script[type="application/json"]');
    try {
      if (inline) spec = JSON.parse(inline.textContent);
      else if (v.startsWith('{')) spec = JSON.parse(v);
      else if (v) { const all = await presets(opts.presets); spec = all[v] && JSON.parse(JSON.stringify(all[v])); }
    } catch (err) {
      // usually a label with an apostrophe inside data-diagram='{...}', which ends the attribute there
      console.error(`diagram.js: the spec on this element is not valid JSON (${err.message}). A label with ' or " in it: put the spec in a <script type="application/json"> inside the .dg instead of data-diagram='{...}'.`, el);
    }
    if (!spec) {
      if (!(v.startsWith('{') || inline)) console.error(`diagram.js: no preset called "${v}" (presets.json)`, el);
      fallbackList(el, inline ? inline.textContent : v);
      continue;
    }
    if (el.dataset.diagramOpts) { try { Object.assign(spec, JSON.parse(el.dataset.diagramOpts)); } catch { /* ignore */ } }
    out.push(mount(el, spec, opts));
  }
  return out;
}

// resolves when every icon asked for so far has loaded (or fallen back to its letter)
function ready() {
  return Promise.all([...iconCache.values()]).then(() => new Promise(r => requestAnimationFrame(() => r())));
}

const api = { mount, auto, presets, ready, instances, version: '1.2.0' };
if (typeof window !== 'undefined') window.TPDiagram = api;
export default api;
export { mount, auto, presets, ready };
