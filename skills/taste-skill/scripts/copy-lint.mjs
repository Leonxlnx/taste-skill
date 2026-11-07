#!/usr/bin/env node
/*
  taste-skill copy-lint.mjs - counts the countable tells of model-written website copy. Node 22, no packages.
  The rules it counts are in references/copy-tells.md.

    node <skill>/scripts/copy-lint.mjs <page.html | folder | .md | .txt> [more files] [--kind <kind>] [--json] [--year 2026]

  It reads the copy a visitor reads: headings, text, buttons, the footer, the <title> and the meta description. It
  skips scripts, styles, svg, code, <template>, <noscript>, hidden and aria-hidden parts, and the UI mocks (ui-*
  fragments, [data-ui], [data-fx], [data-diagram], role="img", app-frame, device): their words are the product's
  screen, not the page's copy. Names are still counted inside the mocks (a default-cast name is a tell anywhere), and
  a slop word or stock phrase inside a skipped part is a WARN (copy-unread). A part whose end tag is left out ends
  where the HTML rules end it. Words literal for a trade pass (a climbing harness, leverage up to 1:30, a powerful
  2,000 W motor), and so do literal virtue words (a quiet room, calm water, genuine parts).
  --kind (tech, software, gaming, product, place, service) lets a game keep its own nouns (realm, beacon); without it
  the kind the page declares is read (<meta name="site-kind">, page-kind, page-type, <html data-type>), as the gate does.
  A .md or .txt draft: the voice card lines (Voice:, Pairs:, Person:, Never: ...), fenced blocks and part labels
  (## Hero, ## Footer) are notes, not copy; the footer is what stands under a heading named Footer.

  Levels:
    FAIL  fix it: chatbot residue, a left [NEED] or markdown, the old slop words and stock phrases, and any device
          used twice its budget plus one times or more (a tic, not a device). The gate blocks on these.
    WARN  over budget, or a weak spot: fix it, or keep it on purpose and say why in the report.
    INFO  look at it.
  Each finding has an id (copy-slop-word, copy-two-fragment, ...; the checker's copy-headline, copy-fact and the
  rest are its own), a count, examples, a fix and, in --json, every hit with its sentence (the gate makes one
  finding of each slop word, stock phrase and residue hit).
  With several files it also prints the first headings side by side and the heading phrases they share.
  --json prints {files: [...], cross: {...}} and nothing else. --year sets the year the copyright line should
  carry (default: this year).
  Exit 0 no FAIL, 1 a FAIL in any file, 2 usage or an unreadable file.
*/
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const die = (m) => { console.error('copy-lint: ' + m); process.exit(2); };
const files = [];
let asJson = false, KIND = '', YEAR = new Date().getFullYear();
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') asJson = true;
  else if (a === '--kind' || a === '--page') { KIND = String(args[++i] || '').toLowerCase(); if (!/^(tech|software|gaming|product|place|service)$/.test(KIND)) die('--kind takes tech, software, gaming, product, place or service'); }
  else if (a === '--year') { YEAR = parseInt(args[++i], 10); if (!(YEAR > 1990 && YEAR < 2200)) die('--year needs a year'); }
  else if (a.startsWith('--')) die('unknown option ' + a);
  else files.push(a);
}
if (!files.length) die('usage: copy-lint.mjs <page.html | folder | .md | .txt> [more] [--kind <kind>] [--json] [--year 2026]');

// ---------------------------------------------------------------- reading the copy
const ENT = { nbsp: ' ', amp: '&', mdash: '—', ndash: '–', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', bdquo: '"', middot: '·', hellip: '…', quot: '"', apos: "'", lt: '<', gt: '>', times: '×', deg: '°', euro: '€', pound: '£', copy: '©', shy: '', thinsp: ' ', ensp: ' ', emsp: ' ', bull: '•', rarr: '→', larr: '←', trade: '™', reg: '®', hairsp: '', zwj: '', zwnj: '' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return ' '; } })
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch { return ' '; } })
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? ' ');
// curly quotes and odd spaces read as their plain forms, so one rule matches both
const tidy = (s) => s.replace(/[‘’ʼ′]/g, "'").replace(/[“”„″]/g, '"').replace(/[    ]/g, ' ');
const squash = (s) => s.replace(/\s+/g, ' ').trim();

const BLOCK = new Set('address article aside blockquote body br dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr html li main nav ol p section summary table tbody td tfoot th thead tr ul option caption legend'.split(' '));
// a link or a button inside a sentence stays in its sentence, but is a line of its own (a label, a price)
const APART = new Set(['a', 'button', 'label']);
const LINE = new Set(['span', 'strong', 'small', 'b', 'em', 'i', 'mark', 'sup', 'sub', 'time', 'abbr', 'cite', 'q', 'data']);
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
// the tags that shut an element whose end tag may be left out (the HTML rules for <p>, <li>, <dt>, <option>, table rows)
const SHUTS = { p: /^(address|article|aside|blockquote|details|dialog|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hgroup|hr|main|menu|nav|ol|p|pre|search|section|table|ul)$/, li: /^li$/, dt: /^(dt|dd)$/, dd: /^(dt|dd)$/,
  option: /^(option|optgroup)$/, optgroup: /^optgroup$/, tr: /^tr$/, td: /^(td|th|tr)$/, th: /^(td|th|tr)$/, thead: /^(tbody|tfoot)$/, tbody: /^(tbody|tfoot)$/ };
const attrOf = (a, k) => { const m = a.match(new RegExp(`(?:^|\\s)${k}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')); return m ? (m[1] ?? m[2] ?? m[3]) : null; };
const hasAttr = (a, k) => new RegExp(`(?:^|\\s)${k}(?=[\\s=/>]|$)`, 'i').test(a);
// a UI mock, a drawn diagram or a part nobody sees: its words are not the page's copy
function hiddenOrMock(tag, a) {
  if (hasAttr(a, 'hidden') || /^true$/i.test(attrOf(a, 'aria-hidden') || '') || /^(img|presentation)$/i.test(attrOf(a, 'role') || '')) return true;
  if (hasAttr(a, 'data-ui') || hasAttr(a, 'data-fx') || hasAttr(a, 'data-fx-mounted') || hasAttr(a, 'data-diagram')) return true;
  const cls = (attrOf(a, 'class') || '').split(/\s+/);
  return cls.some((c) => /^ui(-|$)/.test(c) || c === 'app-frame' || c === 'device');
}
const EYEBROW = /^(eyebrow|kicker|overline|pretitle|section-label|section-kicker|tagline|tag-line)(__|--|$)/;

function readHtml(raw) {
  const title = tidy(decode(((raw.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/<[^>]+>/g, ' ')));
  const metaTag = [...raw.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => /name\s*=\s*["']?description/i.test(t));
  const meta = metaTag ? tidy(decode(attrOf(metaTag.slice(5), 'content') || '')) : '';
  // the full text, mocks included, for the names
  const strip = (h) => h
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<![^>]*>|<\?[^>]*>/g, ' ')
    .replace(/<head\b[\s\S]*?<\/head>/gi, ' ')
    .replace(/<(script|style|svg|template|noscript|code|pre|kbd|samp|textarea|select|canvas|math|iframe|object)\b[\s\S]*?<\/\1>/gi, ' ');
  const html = strip(raw);
  const all = tidy(decode(html.replace(/<[^>]+>/g, ' ')));
  const blocks = [], lines = [], headings = [], unread = [];
  let block = '', line = '', head = null, foot = 0, skip = null, eyebrows = 0;
  const flushLine = () => { const t = squash(line); if (t) lines.push({ text: t, footer: foot > 0 }); line = ''; };
  const flushBlock = () => { flushLine(); const t = squash(block); if (t) blocks.push({ text: t, heading: head ? head.level : 0, footer: foot > 0 }); block = ''; };
  const endSkip = () => { const t = squash(skip.text); if (t) unread.push(t); skip = null; };
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>|([^<]+)|</g)) {
    if (m[4] !== undefined || m[0] === '<') {
      const t = tidy(decode(m[4] ?? '<'));
      if (skip) { skip.text += t; continue; }
      block += t; line += t; if (head) { head.text += t; if (!head.grey) head.main += t; }
      continue;
    }
    const close = m[1] === '/', tag = m[2].toLowerCase(), a = m[3] || '';
    const selfClose = VOID.has(tag) || /\/\s*$/.test(a);
    // a skipped part ends at its end tag, at an end tag of a part around it, or where the next tag shuts it (an <li>
    // or a <p> whose end tag is left out): a missing end tag never hides the rest of the page
    if (skip) {
      if (selfClose) { if (BLOCK.has(tag)) skip.text += ' '; continue; }
      if (!close) {
        if (!skip.stack.length && SHUTS[skip.tag] && SHUTS[skip.tag].test(tag)) endSkip();
        else { skip.stack.push(tag); if (BLOCK.has(tag)) skip.text += ' '; continue; }
      } else {
        const i = skip.stack.lastIndexOf(tag);
        if (i >= 0) { skip.stack.length = i; if (BLOCK.has(tag)) skip.text += ' '; continue; }
        const own = tag === skip.tag;
        endSkip();
        if (own) continue;
      }
    }
    if (!close && hiddenOrMock(tag, a)) { if (!selfClose) { flushBlock(); skip = { tag, stack: [], text: '' }; } continue; }
    if (!close && (attrOf(a, 'class') || '').split(/\s+/).some((c) => EYEBROW.test(c))) eyebrows++;
    // a heading's grey second half (<span class="muted">, system.md) is the line under a name, not a second fragment
    if (head && !selfClose) {
      if (head.grey) { if (tag === head.grey.tag) head.grey.depth += close ? -1 : 1; if (head.grey.depth <= 0) head.grey = null; }
      else if (!close && (attrOf(a, 'class') || '').split(/\s+/).includes('muted')) head.grey = { tag, depth: 1 };
    }
    if (/^h[1-6]$/.test(tag)) {
      flushBlock();
      if (!close) head = { level: +tag[1], text: '', main: '', grey: null };
      else if (head) { const t = squash(head.text); if (t && head.level <= 4) headings.push({ level: head.level, text: t, main: squash(head.main), footer: foot > 0 }); head = null; }
      continue;
    }
    if (tag === 'footer') { flushBlock(); foot = Math.max(0, foot + (close ? -1 : 1)); continue; }
    if (BLOCK.has(tag)) { flushBlock(); if (head) { head.text += ' '; head.main += ' '; } continue; }
    if (APART.has(tag)) { flushLine(); block += ' '; if (head) { head.text += ' '; head.main += ' '; } continue; }
    if (LINE.has(tag)) { flushLine(); if (!/\s$/.test(block)) block += ' '; }
  }
  flushBlock();
  if (skip) endSkip();
  return { title: squash(title), meta: squash(meta), blocks, lines, headings, eyebrows, all: squash(all), unread, kind: declaredKind(raw), brands: brandsOf(raw, squash(title)) };
}
// the client's name as the page writes it: og:site_name or application-name, the logo's text (a class ending in logo,
// brand or wordmark) and the title before its first ":", "|" or dash; one to five words each
function brandsOf(raw, title) {
  const out = new Set();
  const keep = (s) => { s = squash(tidy(decode(String(s || '').replace(/<[^>]+>/g, ' ')))).replace(/^[\s"'.,:;|·–—-]+|[\s"'.,:;|·–—-]+$/g, ''); const n = wc(s); if (n >= 1 && n <= 5 && /[a-z]/i.test(s)) out.add(s); };
  for (const m of raw.matchAll(/<meta\b[^>]*>/gi)) if (/(property|name)\s*=\s*["']?(og:site_name|application-name)["'\s>]/i.test(m[0])) keep(attrOf(m[0].slice(5), 'content'));
  const body = raw.replace(/<head\b[\s\S]*?<\/head>/i, ' ').replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/gi, ' ');
  for (const m of body.matchAll(/<(a|div|span|p|strong|b|h1)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    if ((attrOf(m[2], 'class') || '').split(/\s+/).some((c) => /(^|[_-])(logo|brand|wordmark)$/i.test(c))) keep(m[3]);
  }
  const t = title.split(/\s*[:|]\s*|\s+[–—·-]\s+/)[0];
  if (t && t !== title) keep(t);
  return [...out];
}
// the kind the page declares, read as gate.mjs and the checker read it (site-kind, page-kind, page-type, <html data-type>)
function declaredKind(raw) {
  const meta = (n) => { const t = [...raw.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((x) => new RegExp(`name\\s*=\\s*["']?${n}["'\\s>]`, 'i').test(x)); return t ? String(attrOf(t.slice(5), 'content') || '').trim().toLowerCase() : ''; };
  const site = meta('site-kind');
  if (/^(software|gaming|tech)$/.test(site)) return site;
  if (meta('page-kind') === 'place') return 'place';
  const t = meta('page-type') || (((raw.match(/<html\b[^>]*>/i) || [''])[0].match(/data-type\s*=\s*["']?([\w-]+)/i) || [])[1] || '').toLowerCase();
  return /^(software|product|place|service)$/.test(t) ? t : '';
}
// a draft in a .md or .txt file: the voice card (copy-voice.md section 2: Voice:, Pairs:, Person:, Never: ...) and
// fenced blocks are notes, not copy; the footer is what stands under a heading named Footer
const DRAFT_LABEL = /^((the )?(hero|footer|prices?|faq|about|story|close|closing|nav|header|buttons|microcopy|meta)|(copy )?draft\b.*)$/i;
const CARD = /^(voice|register|pairs|person|sentences|humou?r|house words|never|tone|reader|notes?)\s*:/i;
function readText(raw) {
  const ls = []; let fence = false;
  for (const l0 of tidy(raw).split(/\r?\n/)) {
    const l = l0.trim();
    if (/^(```|~~~)/.test(l)) { fence = !fence; continue; }
    if (fence || !l || CARD.test(l.replace(/^[-*]\s+/, ''))) continue;
    ls.push(l);
  }
  const blocks = []; let foot = false;
  for (const l of ls) {
    const lv = (l.match(/^#{1,6}(?=\s)/) || [''])[0].length;
    if (lv) foot = /^#+\s*(the\s+)?footer\b/i.test(l);
    blocks.push({ text: l.replace(/^#+\s*/, '').replace(/^[-*]\s+/, ''), heading: lv <= 4 ? lv : 0, footer: foot && !lv });
  }
  // a heading that only labels a part of the draft (## Hero, ## Footer, # Copy draft: ...) is not copy
  const copy = blocks.filter((b) => !(b.heading && DRAFT_LABEL.test(b.text)));
  const headings = copy.filter((b) => b.heading).map((b) => ({ level: b.heading, text: b.text, footer: false }));
  return { title: '', meta: '', blocks: copy, lines: copy.map((b) => ({ text: b.text, footer: b.footer })), headings, eyebrows: 0, all: copy.map((b) => b.text).join(' '), unread: [], kind: '', brands: [] };
}

// ---------------------------------------------------------------- the rules (references/copy-tells.md)
// the first generation: one is a tell. A word that is literal for a trade keeps it (a climbing harness, bespoke
// tailoring, leverage up to 1:30, a powerful 2,000 W motor): a regex on the words after it, or a test of (after, before).
const SLOP = ['delve', 'delves', 'tapestry', 'testament to', 'realm', 'embark', 'beacon', 'multifaceted', 'paradigm', 'myriad', 'plethora', 'meticulous', 'meticulously', 'intricate', 'interplay', 'garner',
  'elevate', 'elevates', 'elevated', 'elevating', 'unlock', 'unlocks', 'unleash', 'unleashes', 'empower', 'empowers', 'empowering', 'harness', 'supercharge', 'supercharged', 'turbocharge', 'seamless', 'seamlessly', 'effortless', 'effortlessly',
  'cutting-edge', 'revolutionary', 'revolutionize', 'revolutionise', 'transformative', 'holistic', 'next-level', 'world-class', 'best-in-class', 'game-changer', 'game changer', 'game-changing', 'state-of-the-art', 'bespoke', 'synergy', 'leverage',
  'reimagine', 'reimagined', 'reimagining', 'next-generation', 'next-gen', 'powerful', 'robust', 'nestled', 'boasts', 'unparalleled', 'unrivaled', 'unrivalled'];
const SPEC = String.raw`\d[\d,.]*\s?(w|kw|hp|ps|v|nm|mah|wh|kwh|lumens?|lm|watts?|volts?|pa|bar|cc|l|litres?|liters?|kg|rpm)\b`;
const LITERAL = {
  harness: /^(?!(es|ed|ing)?\s+(the|your|our|its|their|this|that|every|all|ai|data|power)\b)/i,
  unlock: /^s?\s+(the |your |a )?(door|doors|bike|bikes|car|phone|scooter|scooters|locker|lockers|gate|box|room)\b/i,
  unlocks: /^\s+(the |your |a )?(door|doors|bike|car|phone|scooter|locker|gate|box|room)\b/i,
  elevated: /^\s+(train|track|tracks|walkway|platform|terrace|deck|heart rate|heart-rate|position|ground|site|plot|bed|beds|garden|view|views|railway|line)\b/i,
  seamless: /^\s+(knit|knitted|knitting|garments?|socks?|tights|leggings|bras?|tubes?|pipes?|steel|gutters?|flooring|floors?|stockings|underwear)\b/i,
  bespoke: /^\s+(tailoring|tailor|tailors|suits?|shirts?|shoes|boots|jackets?|trousers|joinery|kitchens?|furniture|cabinetry|wardrobes?)\b/i,
  // finance: the ratio a broker allows ("leverage up to 1:30", "with leverage")
  leverage: (a, b) => /^\s+(of\s+\d|up to|ratios?|limits?|\d)/i.test(a) || /^[^.]{0,24}\b\d+:\d+\b/.test(a) || /\b(with|max(imum)?|margin|financial|high|low|no)\s+$/i.test(b),
  tapestry: (a, b) => /^\s+(weaving|weavers?|workshops?|class(es)?|courses?|looms?|museum|studio|restoration|conservation|kits?|wool|yarn|frames?)\b/i.test(a) || /\b(woven|wool|silk|hand-woven|medieval|antique)\s+$/i.test(b),
  intricate: /^\s+(lace|beadwork|embroidery|carvings?|inlays?|marquetry|filigree|knotwork|cutwork|quilting|stitch(ing|es)?|engravings?|joints?|dovetails?|smocking|plasterwork|ironwork|woodwork|tracery)\b/i,
  // hardware: a figure with its unit right after the word ("a powerful 2,000 W motor")
  powerful: new RegExp(String.raw`^\s+(and\s+)?${SPEC}`, 'i'),
  robust: /^\s+(steel|stainless|aluminium|aluminum|alloy|oak|ash|beech|timber|cast[- ]iron|iron|carbon|frames?|chassis|casing|housing|hinges?|axles?|welds?|tyres?|tires?|zips?|stitching|canvas|leather)\b/i,
  realm: () => KIND === 'gaming', embark: () => KIND === 'gaming', beacon: () => /^(gaming|tech|software)$/.test(KIND),
};
const literal = (w, after, before) => { const l = LITERAL[w]; return !!l && (typeof l === 'function' ? l(after, before) : l.test(after)); };
const STOCK = [/in today'?s (fast-paced|digital|modern|ever-changing|busy)/i, /unlock the (power|potential)/i, /harness the power/i, /the future of [a-z]+ is (here|now)/i, /say goodbye to/i,
  /whether you'?re an? /i, /look no further/i, /join (thousands|millions|hundreds) of/i, /trusted by (teams|businesses|companies|brands|people) (worldwide|everywhere|around the world)/i, /imagine a world/i,
  /ready to (transform|take your|elevate|level up)/i, /ever-evolving/i, /one-stop shop/i, /take (it|your [a-z]+|things) to the next level/i,
  /\b(it'?s|this is|we'?re|we are) not just (a|an|another)\b/i, /\bnot only\b[^.!?]{1,60}\bbut also\b/i, /\bhere'?s the thing\b/i, /\blet that sink in\b/i, /\blet'?s dive in\b/i,
  /\bit'?s (important|worth) (to note|noting)\b/i, /\b(in|with) just a few clicks\b/i, /\bwe'?ve got you covered\b/i, /\bthe possibilities are endless\b/i, /\bat your fingertips\b/i, /\b[a-z]+ made (simple|easy)\b/i];
const RESIDUE = [/lorem ipsum/i, /\[(your |company |brand |business )?(company|brand|business|product) name\]/i, /\bcertainly!/i, /\bi hope this helps\b/i, /\bas an ai\b/i, /\[insert\b/i, /\[NEED\b[^\]]*\]?/i,
  /\{\{\s*[\w.]+\s*\}\}/, /\bgreat question!/i];
// markdown that leaked into a rendered page (a .md draft keeps its own); "** 4242" on a card mask is not bold
const MARKDOWN = [/\*\*(?=[^\s*])[^*\n]{1,60}(?<=[^\s*])\*\*/, /(^|\s)#{2,3} [A-Z]/];
const VIRTUE = ['honest', 'honestly', 'calm', 'calmly', 'quiet', 'quietly', 'actually', 'genuine', 'genuinely', 'truly', 'simply', 'thoughtful', 'thoughtfully', 'carefully', 'intentional', 'intentionally', 'steady', 'dependable'];
// a virtue word that is literal: a quiet room, calm water, genuine parts, a motor that runs quietly, a bay that stays calm
const VIRTUE_THING = /^\s+(rooms?|bedrooms?|hours?|streets?|lanes?|roads?|corners?|carriages?|coach|zones?|side|end|areas?|nights?|mornings?|evenings?|seasons?|months?|days?|weeks?|times?|tables?|spots?|places?|gardens?|courtyards?|villages?|valleys?|bays?|beach(es)?|coves?|waters?|seas?|lakes?|loch|rivers?|harbou?r|conditions|weather|winds?|mode|motors?|fans?|pumps?|engines?|compressors?|keyboards?|keys|switches|cabins?|wards?|floors?|carriage|neighbou?rhoods?|parts?|spares?|leather|wool|silk|antiques?|replacements?|oem|flow|current|supply|pace|state|climb|descent|rain|breeze)\b/i;
const VIRTUE_LIT_WORDS = new Set(['calm', 'quiet', 'steady', 'genuine']);
const VIRTUE_MACHINE = /\b(runs?|running|hums?|closes?|shuts?|opens?|spins?|turns?|rolls?|glides?|operates?|works?|starts?|drives?|flows?|sits?)\s+$/i;
const VIRTUE_SELF = /^(team|service|staff|approach|process|brand|company|studio|design|support|people|tone|voice|work|product|app|software|advice|prices?|pricing|way|style|we|i)$/i;
const VIRTUE_PLACE = /\b(the|a|this|that|its|their|each|every|our)\s+([a-z-]+)(\s+[a-z-]+)?\s+(is|are|stays?|gets?|was|were|feels?|remains?|keeps?|lies|lie|turns?|goes|go|falls?)\s+(\w+\s+)?$/i;
function virtueLiteral(w, after, before) {
  if (/ly$/.test(w)) return VIRTUE_MACHINE.test(before);
  if (!VIRTUE_LIT_WORDS.has(w)) return false;
  if (VIRTUE_THING.test(after)) return true;
  const p = before.match(VIRTUE_PLACE);
  return !!p && !VIRTUE_SELF.test(p[3] ? p[3].trim() : p[2]) && p[1].toLowerCase() !== 'our';
}
const CAST = ['Priya', 'Okafor', 'Raman', 'Natarajan', 'Sarah J', 'Elara', 'Aisha', 'Lena M', 'Marcus', 'Dana', 'Tomas', 'Nora', 'Mara', 'Isla', 'Maya', 'Ines', 'Jess'];
const CAST_CO = ['Fieldnote', 'Kestrel', 'Halcyon', 'Brightloop', 'Acme', 'Northwind', 'Lumen', 'Nimbus', 'Zenith', 'Apex', 'Vertex'];
// the names copy.md says never to coin: as the page's own brand (its title or h1) they FAIL
const COINED = new Set(['Fieldnote', 'Kestrel', 'Halcyon', 'Lumen', 'Nimbus']);
const NUM = '(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+)';
const PUFF = [/\bserves as\b/i, /\bstands as\b/i, /\bpivotal\b/i, /\bcrucial\b/i, /\bplays an? (key|vital|crucial|pivotal|central) role\b/i, /\bin the heart of\b/i, /\bwhere [a-z]+(?: [a-z]+)? meets [a-z]+/i, /\bas seen in\b/i, /\bthe world of\b/i];
const REVEAL = [/\b(the result|the best part|the catch|the secret|the difference|the twist|the answer)\?\s/i, /\bwhy does (this|it) matter\?/i, /\b(one|a single) (thing|change|idea|question|rule)[^.:!?\n]{0,30}: /i, /\b(this section|below,? (we|you'?ll)|here are \d+ reasons|we'?ve added)\b/i];
// an abbreviation's full stop does not end a sentence or a heading fragment ("Rooms in St. Ives", "Breakfast at No. 7")
const ABBR = /\b(St|Ste|Dr|Mt|Mr|Mrs|Ms|Co|No|Nos|Nr|Ave|Rd|Ln|Ltd|Inc|Jr|Sr|Ft|Pt|Prof|Rev|Capt|Sgt|Lt|vs|approx|est|incl|excl|dept|tel|fig|vol|ca|cf|e\.g|i\.e|a\.m|p\.m)\./gi;
const unabbr = (s) => s.replace(ABBR, (m) => m.replace(/\./g, '․'));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (w) => new RegExp(`\\b${esc(w).replace(/ /g, '\\s')}\\b`, 'gi');
const sentencesOf = (text) => unabbr(text).split(/(?<=[.!?])\s+(?=[A-Z"'(])/).map((s) => s.trim().replace(/․/g, '.')).filter((s) => /[a-z]/i.test(s));
const clip = (s, n = 110) => (s.length > n ? s.slice(0, n - 3) + '...' : s);
const wc = (s) => s.split(/\s+/).filter(Boolean).length;
// the sentence of a block that holds the character at i
function sentenceAt(b, i) {
  const t = unabbr(b);
  let s = 0; for (const m of t.matchAll(/[.!?](?=\s+[A-Z"'(])/g)) { if (m.index >= i) break; s = m.index + 1; }
  const e = t.slice(i).search(/[.!?](\s+[A-Z"'(]|\s*$)/);
  return b.slice(s, e < 0 ? b.length : i + e + 1).trim();
}

function lint(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const isHtml = /\.html?$/i.test(file);
  const R = isHtml ? readHtml(raw) : readText(raw);
  // --kind wins; else the kind the page declares (as the gate reads it), so a game linted by hand keeps its nouns
  const kindNow = KIND || R.kind || '';
  const saved = KIND; KIND = kindNow;
  try { return { ...lintRead(R, isHtml), file, kind: kindNow || null }; } finally { KIND = saved; }
}
function lintRead(R, isHtml) {
  const body = R.blocks.map((b) => b.text);
  const text = body.join('\n');
  const prose = R.blocks.filter((b) => wc(b.text) >= 5).map((b) => b.text).join(' ');
  const proseBlocks = R.blocks.filter((b) => wc(b.text) >= 5).map((b) => b.text);
  const words = wc(text);
  const out = [];
  // hits are { m: what matched, s: the sentence it is in } (or plain strings); the gate makes one finding of each
  const hitOf = (h) => (typeof h === 'string' ? { m: h, s: h } : h);
  const exOf = (h) => { const x = hitOf(h); return x.m === x.s ? x.s : `"${x.m}" in: ${x.s}`; };
  const add = (sev, id, hits, msg, fix, extra = {}) => out.push({ sev, id, count: Array.isArray(hits) ? hits.length : hits, msg, fix,
    examples: Array.isArray(hits) ? [...new Set(hits.map(exOf))].slice(0, 4).map((e) => clip(e)) : [],
    hits: Array.isArray(hits) ? hits.map(hitOf).map((x) => ({ match: clip(x.m, 80), sentence: clip(x.s, 160) })) : [], ...extra });
  // every match of a pattern, with its sentence; checked against the copy and, for the old slop, the title and meta too
  const hitsIn = (re, src = body) => src.flatMap((b) => [...b.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))].map((m) => ({ m: m[0].trim(), s: sentenceAt(b, m.index) })));
  const withMeta = [...body, R.title, R.meta].filter(Boolean);

  // ---- FAIL: residue, the old slop, stock phrases
  const residue = [...RESIDUE, ...(isHtml ? MARKDOWN : [])].flatMap((re) => hitsIn(re, withMeta));
  if (residue.length) add('FAIL', 'copy-residue', residue, 'chatbot residue, a template token, markdown or a [NEED] left on the page', 'write the real words from the brief, or leave the element out and list what is missing in the report');
  // a listed word inside the client's name (Elevate Pilates, Beacon Dental) is the name, not copy: the name as the
  // page writes it (same case, whole words) is left out and counted once below
  const brandRes = (R.brands || []).filter((n) => SLOP.some((w) => wordRe(w).test(n))).map((n) => new RegExp(`(?<![\\w-])${esc(n).replace(/ /g, '\\s+')}(?![\\w-])`, 'g'));
  const inBrand = (b, i, len) => brandRes.some((re) => [...b.matchAll(re)].some((x) => x.index <= i && i + len <= x.index + x[0].length));
  const branded = [];
  const slopIn = (src, mark) => {
    const found = [];
    for (const w of SLOP) for (const b of src) for (const m of b.matchAll(wordRe(w))) {
      const after = b.slice(m.index + m[0].length, m.index + m[0].length + 40), before = b.slice(Math.max(0, m.index - 40), m.index);
      if (literal(w, after, before)) continue;
      if (inBrand(b, m.index, m[0].length)) { if (mark) branded.push({ m: m[0].toLowerCase(), s: sentenceAt(b, m.index) }); continue; }
      found.push({ m: m[0].toLowerCase(), s: sentenceAt(b, m.index) });
    }
    return found;
  };
  const slop = slopIn(withMeta, true);
  if (slop.length) add('FAIL', 'copy-slop-word', slop, `old slop words (${[...new Set(slop.map((s) => s.m))].slice(0, 6).join(', ')})`, 'replace each word with the fact it stands in for: the step count, the figure, the material, the place (a word in the client\'s own name is not counted when the logo, the title before its ":" or og:site_name writes the name)');
  if (branded.length) add('WARN', 'copy-brand-word', branded, `the brand name holds a listed word (${[...new Set(branded.map((s) => s.m))].join(', ')}): read as the name, not counted`, 'keep it when the brief gives this name and say so in the report; a name you coined gets another (copy.md, names.json)');
  const stock = STOCK.flatMap((re) => hitsIn(re, withMeta));
  if (stock.length) add('FAIL', 'copy-stock-phrase', stock, 'stock phrases that fit any business', 'say what this business does, for whom, with one fact from the brief');
  // words in a part the lint skips (a UI mock, a hidden or aria-hidden part): a product's own screen may hold them,
  // but copy moved into such a part to get past the lint is still copy
  const unread = R.unread || [];
  const hid = [...slopIn(unread), ...STOCK.flatMap((re) => hitsIn(re, unread))];
  if (hid.length) add('WARN', 'copy-unread', hid, `${hid.length} slop word${hid.length > 1 ? 's or phrases' : ' or phrase'} inside a UI mock or a hidden part (not counted above)`, 'if a visitor reads it as the page\'s copy, it is copy: fix it there; a real product screen\'s own strings may stay, say so in the report');

  // ---- budgeted devices: WARN over the budget, FAIL at twice the budget plus one or more
  const budget = (id, hits, max, msg, fix, failAt = max * 2 + 1) => {
    if (hits.length >= failAt) add('FAIL', id, hits, `${msg}: ${hits.length}, budget ${max} (a tic, not a device)`, fix, { budget: max });
    else if (hits.length > max) add('WARN', id, hits, `${msg}: ${hits.length}, budget ${max}`, fix, { budget: max });
    else if (hits.length) add('INFO', id, hits, `${msg}: ${hits.length} of ${max}`, '', { budget: max });
  };
  const hText = R.headings.filter((h) => !h.footer).map((h) => h.text);
  const hMain = R.headings.filter((h) => !h.footer).map((h) => h.main ?? h.text);
  budget('copy-two-fragment', hMain.filter((h) => /^[^.?!]{2,48}[.!] [^.?!]{2,55}[.!]?$/.test(unabbr(h)) && wc(h) <= 14), 1, 'two-fragment headings "X. Y."', 'spend it once where it lands hardest; give the other headings a plain label, a claim or the thing they name');
  budget('copy-number-pair', hMain.filter((h) => new RegExp(`^${NUM}\\b[^.]*?[,.]\\s+${NUM}\\b`, 'i').test(unabbr(h))), 1, 'number-pair headings "Four X, one Y"', 'say what the section holds ("Recent buildings") and let the first line carry the claim');
  // a question in the buyer's words (an FAQ entry) is not the device
  const contrast = hitsIn(/, not (?!only|just)[a-z]|\bisn't\b|\bnot just\b|\brather than\b|\binstead of\b|\bwithout the\b|\bnot by\b/i, body.filter((b) => !/\?\s*$/.test(b)));
  budget('copy-contrast', contrast, 2, 'contrast frames ("X, not Y", isn\'t, rather than, instead of, without the)', 'state the positive fact on its own; count all the forms together');
  budget('copy-negation', hitsIn(/\bNo [^.,\n]{1,30}(, no |\. No )[^.\n]{0,40}/), 1, 'negation runs "No X, no Y"', 'keep one, and only if each item is a refusal a buyer can check');
  const virtue = [];
  for (const b of proseBlocks) for (const w of VIRTUE) for (const m of b.matchAll(wordRe(w))) {
    const word = m[0].toLowerCase(), after = b.slice(m.index + m[0].length, m.index + m[0].length + 30), before = b.slice(Math.max(0, m.index - 50), m.index);
    if (virtueLiteral(word, after, before)) continue;
    virtue.push({ m: word, s: sentenceAt(b, m.index) });
  }
  budget('copy-virtue', virtue, 2, 'virtue words about the business (honest, calm, quiet, actually, simply...; a quiet room or calm water is literal and not counted)', 'show it with a fact or a limit from the brief instead of saying it');
  const riders = hitsIn(/, (ensuring|enabling|allowing|empowering|helping|letting|giving|making it|creating|delivering|fostering)\b[^\n]*/i);
  budget('copy-ing-rider', riders, 1, '-ing riders (", ensuring...", ", allowing...")', 'end the sentence at its claim, or make the rider its own sentence with a subject', 99);
  // one fact repeated word for word where it belongs (copy.md) is one use
  const phrases = (re) => [...new Set(body.flatMap((b) => [...b.matchAll(new RegExp(re.source, 'gi'))].map((m) => m[0].toLowerCase())))];
  budget('copy-since', phrases(/\bsince (19|20)\d\d\b/), 1, '"since [year]"', 'say it once, where it matters', 99);
  budget('copy-response-time', phrases(/\b(within|in under) (one|two|three|24|48|\d+) (working |business )?(days?|hours?)\b/), 1, 'response-time promises', 'keep one, only if the brief gives it', 99);
  const puff = PUFF.flatMap((re) => hitsIn(re));
  budget('copy-puffery', puff, 0, 'puffery and dead metaphors (serves as, pivotal, in the heart of, where X meets Y, as seen in)', 'name the street, the figure or the outlet; plain "is" and "has" read as a person', 99);
  budget('copy-reveal', REVEAL.flatMap((re) => hitsIn(re)), 0, 'staged reveals and process talk ("The result?", "One thing changed: X", "this section")', 'make the point directly; the page never talks about itself', 99);
  const proofy = hitsIn(/\b\d+(\.\d+)?\s?x (faster|more|better|cheaper|quicker)\b|\b\d[\d,.]*\s?(k|m)?\+ (teams|customers|users|companies|businesses|clients|people|members|creators|developers|happy)\b|\b(9\d|100)% (of )?(customers|clients|users|satisfaction|satisfied)\b/i);
  if (proofy.length) add('WARN', 'copy-proof-figure', proofy, `${proofy.length} proof figure${proofy.length > 1 ? 's' : ''} ("3x faster", "10,000+ teams", "98% satisfied")`, 'keep a figure only when the brief gives it, with its unit and in a sentence; never round, never invented');

  // ---- punctuation
  const emd = (prose.match(/—/g) || []).length;
  if (emd > 2) add('WARN', 'copy-em-dash', emd, `${emd} em dashes in the body (budget 2)`, 'use a comma, a colon, parentheses or a full stop where each is natural');
  const bang = [...body.filter((b) => b.includes('!') && /[a-z]/i.test(b))];
  if (bang.length) add('WARN', 'copy-exclaim', bang, `${bang.length} line${bang.length > 1 ? 's' : ''} with an exclamation mark`, 'end on a full stop: copy.md bans exclamation marks');

  // ---- numbers in strips, markers, labels
  // a run of short number lines with no sentence between: a stat strip. Prices and times are a menu or a timetable,
  // and step numbers set apart (01, 02) are counted as step numbers (copy-numbered), not as figures.
  const PRICE = /^([$€£]\s?)?(\d{1,6}|\d{1,3}([.,' ]\d{3})+)([.,]\d{1,2})?\s?(€|£|\$|eur|kr|chf|zł|,-)?$/i;
  const TIME = /^\d{1,2}[:.]\d\d\s?(am|pm|a\.m\.|p\.m\.)?(\s?[–-]\s?\d{1,2}[:.]\d\d\s?(am|pm)?)?$/i;
  const STAT = /^[~<>≈+−-]?\s?[$€£]?\d[\d,.]*\s?(%|\+|k|kg|m|ms|min|x|×|★|\/5|\/10| ?of \d+| ?days?| ?hrs?| ?hours?| ?years?| ?weeks?)?$|^\d+(\.\d)?\s?\/\s?5$/i;
  let run = { s: 0, t: 0, l: [] }; const strips = [];
  // one unit down a column (75 min, 60 min, 45 min) is a timetable or a spec list, not a strip of claims
  const unit = (l) => (l.match(/[^\d\s.,]+\s*$/) || [''])[0].trim().toLowerCase();
  const endRun = () => {
    const units = new Set(run.l.filter((l) => !TIME.test(l)).map(unit));
    if ((run.s >= 3 || (run.s >= 2 && run.s + run.t >= 3)) && !(units.size === 1 && !units.has(''))) strips.push(run.l.join(' / '));
    run = { s: 0, t: 0, l: [] };
  };
  for (const { text: l } of R.lines) {
    if (/^0\d\.?$/.test(l)) continue;
    if (PRICE.test(l) && /[.,]\d{2}\b|[$€£]|eur|kr|chf/i.test(l)) continue;
    if (TIME.test(l)) { run.t++; run.l.push(l); } else if (STAT.test(l)) { run.s++; run.l.push(l); } else if (wc(l) > 9) endRun();
  }
  endRun();
  if (strips.length) add('WARN', 'copy-stat-strip', strips, `stat strip x${strips.length}`, 'a strip only of figures the brief gives (a price, hours, a count); otherwise put each number in the sentence it proves, or leave it out');
  const numbered = R.lines.filter((l) => /^0\d\.?$/.test(l.text)).length;
  if (numbered >= 6) add('WARN', 'copy-numbered', numbered, `${numbered} step numbers`, 'number only steps that happen in order');
  if (R.eyebrows >= 5) add('WARN', 'copy-eyebrows', R.eyebrows, `${R.eyebrows} eyebrow or kicker labels`, 'one or two a page; a heading that names the thing needs no label over it');

  // ---- people and names, mocks included
  const people = CAST.filter((n) => new RegExp(`\\b${esc(n)}\\b`).test(R.all));
  if (people.length) add('WARN', 'copy-cast', people, `default-cast names: ${people.join(', ')}`, 'person names come only from the brief; a mock\'s names fit its locale and are not the names every model picks');
  const brandText = [R.title, ...R.headings.filter((h) => h.level === 1).map((h) => h.text)].join(' ');
  const cos = CAST_CO.filter((n) => new RegExp(`\\b${esc(n)}\\b`).test(R.all));
  const brandCos = cos.filter((n) => COINED.has(n) && new RegExp(`\\b${esc(n)}\\b`).test(brandText));
  if (brandCos.length) add('FAIL', 'copy-cast-company', brandCos, `the brand is a name every model coins: ${brandCos.join(', ')}`, 'coin another name and search it (copy.md, names.json); if the brief gives this name, waive it with the brief as the reason');
  const otherCos = cos.filter((n) => !brandCos.includes(n));
  if (otherCos.length) add('WARN', 'copy-cast-company', otherCos, `default fictional company names: ${otherCos.join(', ')}`, 'coin another name (copy.md, names.json)');
  const quotes = body.filter((b) => /^["“][^\n]{20,}["”]$/.test(b)).length;
  if (quotes >= 3) add('INFO', 'copy-quotes', quotes, `${quotes} quoted testimonials`, 'only quotes the brief gives, with name and role or town; none is fine');

  // ---- the footer: facts, not a sign-off
  const footLines = R.lines.filter((l) => l.footer).map((l) => l.text);
  const tailLines = footLines.length || !isHtml ? footLines : R.lines.slice(-10).map((l) => l.text);
  const signoff = tailLines.filter((l) => /^(made|designed|built|crafted|roasted|grown|brewed|baked|written|fired|poured|stitched|shot|printed|sewn|cooked)\b[^.]{0,40}\b(in|by|on|with|at|since)\b/i.test(l) || /^(every|since) [^.]{3,30}\.$/i.test(l));
  if (signoff.length) add('WARN', 'copy-footer-signoff', signoff, 'a sign-off line in the footer', 'the footer holds facts: the brand, the year, Privacy, Terms, the credits line');
  const cy = [...(R.all + ' ' + R.title).matchAll(/©\s*(?:[^\d\n]{0,30}?)((?:19|20)\d\d)(?:\s*[–-]\s*((?:19|20)\d\d))?/g)].map((m) => +(m[2] || m[1]));
  if (cy.length && Math.max(...cy) < YEAR) add('WARN', 'copy-stale-year', cy.map(String), `the copyright line says ${Math.max(...cy)}`, `write the current year (${YEAR})`);

  // ---- lists of three and rhythm: information only, unless the rhythm is a drumbeat
  const triads = [...prose.matchAll(/(?:^|[.:;!?] |, )([a-z][\w'-]*(?: [\w'-]+){0,2}), ([a-z][\w'-]*(?: [\w'-]+){0,2}),? (?:and|or) ([\w'-]+)/gi)].map((m) => m[0].replace(/^[.:;!?,] /, ''));
  if (triads.length) add('INFO', 'copy-triads', triads, `${triads.length} list${triads.length > 1 ? 's' : ''} of three (about one in ${Math.round(words / triads.length)} words)`, 'fine when there are three things; never back to back');
  const sents = sentencesOf(prose);
  if (sents.length >= 15) {
    const lens = sents.map(wc), mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length), frag = lens.filter((n) => n <= 4).length / lens.length;
    add('INFO', 'copy-rhythm', 0, `${sents.length} sentences, mean ${mean.toFixed(1)} words, spread ${sd.toFixed(1)}, ${(frag * 100).toFixed(0)}% of 4 words or fewer`, '');
    if (sd < 4) add('WARN', 'copy-rhythm', 0, `every sentence about ${mean.toFixed(0)} words long (spread ${sd.toFixed(1)})`, 'let length follow meaning: one sentence a section may run long');
    if (frag > 0.3) add('WARN', 'copy-rhythm', 0, `${(frag * 100).toFixed(0)}% of sentences are 4 words or fewer`, 'join the fragments that carry one thought');
  }
  const order = { FAIL: 0, WARN: 1, INFO: 2 };
  out.sort((a, b) => order[a.sev] - order[b.sev]);
  return { words, headings: hText, findings: out };
}

// ---------------------------------------------------------------- across files
function crossFile(results) {
  if (results.length < 2) return { heroes: [], shared: [] };
  const shape = (h) => h.toLowerCase().replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/g, '#').replace(/[^a-z# ]/g, '').trim();
  // each file by its path below the folder all of them share (pages/x and pages/mobile/x are two files)
  const dirs = results.map((r) => path.resolve(path.dirname(r.file)).split(path.sep));
  let k = 0; while (dirs.every((d) => k < d.length && d[k] === dirs[0][k])) k++;
  const name = (f) => path.relative(dirs[0].slice(0, k).join(path.sep) || path.sep, path.resolve(f)).split(path.sep).join('/');
  const grams = new Map();
  for (const r of results) {
    const seen = new Set();
    for (const h of r.headings) {
      const toks = shape(h).split(/\s+/);
      for (let i = 0; i + 3 <= toks.length; i++) {
        const g = toks.slice(i, i + 3).join(' ');
        if (/^(the|a|of|and|to|in|for|your|our|we|you)( |$)/.test(g) && /( the| a| of| and| to)$/.test(g)) continue;
        if (!seen.has(g)) { seen.add(g); grams.set(g, (grams.get(g) || []).concat(name(r.file))); }
      }
    }
  }
  const shared = [...grams].filter(([, fs_]) => fs_.length >= 2).map(([g, fs_]) => `"${g}" in ${fs_.length} files: ${fs_.join(', ')}`).slice(0, 25);
  return { heroes: results.map((r) => `${name(r.file)}: ${r.headings[0] || '(no heading)'}`), shared };
}

// ---------------------------------------------------------------- run
const paths = files.map((f) => { try { return fs.statSync(f).isDirectory() ? path.join(f, 'index.html') : f; } catch { return f; } });
const results = [];
for (const f of paths) { try { results.push(lint(f)); } catch (e) { die(`cannot read ${f}: ${e.message}`); } }
const cross = crossFile(results);
const failed = results.some((r) => r.findings.some((f) => f.sev === 'FAIL'));
if (asJson) console.log(JSON.stringify({ files: results, cross }, null, 1));
else {
  for (const r of results) {
    const n = (s) => r.findings.filter((f) => f.sev === s).length;
    console.log(`\n== ${r.file}  (${r.words} words)  ${n('FAIL')} FAIL, ${n('WARN')} WARN`);
    for (const f of r.findings) {
      console.log(`  ${f.sev.padEnd(4)} ${f.id.padEnd(20)} ${f.msg}`);
      for (const e of f.examples) console.log(`       - ${e}`);
      if (f.fix && f.sev !== 'INFO') console.log(`       fix: ${f.fix}`);
    }
  }
  if (cross.heroes.length) {
    console.log('\n== across files: the first headings side by side');
    for (const h of cross.heroes) console.log('  ' + h);
    if (cross.shared.length) { console.log('== heading phrases shared across files'); for (const s of cross.shared) console.log('  ' + s); }
  }
}
process.exit(failed ? 1 : 0);
