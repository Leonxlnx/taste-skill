// tasteskill / frame-deal — deal the parts every page has and every model builds the same way:
// navigation, footer, cards, buttons, corners, spacing, how pictures are treated, and whether the page has an
// interactive piece or a moving picture at all. Left to the builder, these came out identical on 51 reviewed pages
// (a live widget on 33 of 34, video on 29, a giant footer name on 28, square buttons on 22), and in October 2026 the
// owner still saw three button shapes, one plain bar that hides on scroll and a one-line footer on nearly every page.
// The four parts every page shows (navigation, footer, cards, buttons) now hold twelve designs each, dealt away from
// the last draws in the history beside the study's patterns (below), so no one comes back on more than about one page
// in ten.
//
// Each entry: [id, weight, what to build (or a function of ctx that writes it), fit(ctx) -> a weight multiplier
// (optional)]. ctx: { tone, sector, software, door, multiPage, emailElsewhere, creative, few, nameHero, closingScene,
// visitShown (a section blueprint is itself the visit block: then the footer is not), window (the hero shows the
// product's window beside the headline), accentField (the palette's band in the accent, `--field-N`, or null),
// accentShown (the hero or a section above stands on the accent), tilted (the hero or a section turns something off the
// level), sectionCount }, and from the brief: hours (briefHours), times, fact, figures, paper, links.
//
// Round 12 (October 2026): the owner still saw about ten special things and everything else alike, and asked for
// hundreds, each on about one page in ten. The twelve designs of each part now share the deal with the patterns of the
// design-anatomy study (library/patterns/<family>.json: 107 great sites read for their heroes, sections, navigation,
// footers, cards, buttons, type and motion), fit-filtered by sector, tone, density and what the page really has, and
// every design or pattern used in the last nine draws is out while others fit. A missing pattern file deals the
// designs alone. The loading, fitting and house checks of the patterns live here; draw.mjs deals the heroes, sections,
// small moves and type notes from them with the same rules.
//
// Round 11c (October 2026): the patterns built at 4.5 of 10 against the tested designs' 5.3, and asked for assets the
// sheet never dealt (review-004). Each now carries a harsh quality score, the assets it needs and a must-show signature
// (the lab's round 11c pass): none at 3 or below is dealt, the rest weigh by their score against the tested designs,
// none is dealt to a page that lacks its assets, and the sheet prints each dealt part's signature as "Must show". No
// navigation hides on scroll (the owner named the hiding bar as the generic one), and the page has one button family.
//
// Round 11e (October 2026): built as written, seven of the tested designs were the usual written down (review-006: the
// plain bar painted black, a header without its ground, the stock grey box twice, the slightly rounded rectangle twice,
// the SaaS mega-footer). They weigh 0.3 until better designs replace them (rolling-label is out: its still is the
// plain shape), a pattern scored 5 or more weighs three times as much, and the library takes up to three of the four
// parts. Every Must show line is something a still confirms (a hover may follow it, never be all of it), and no card,
// tile or panel is dealt with its middle left empty.
//
// Round 11f (October 2026): a blind test built the 48 designs and 37 new ones on five briefs (review-007). Five new
// ones scored 7 of 10 or more from both jurors and none of the old: each carries the client's trade, shows its idea at
// rest and needs no photograph. They are dealt at full weight, each only where its facts are real (the product's window
// beside the headline, the brief's own opening hours); four near misses, rewritten on the jurors' sentences, at half;
// the old designs by their scores (under 5 of 10 at 0.3). A design that needs facts the brief lacks (hours, figures, a
// price, a date, the product's window, eight real destinations) is not dealt without them, and a page has one tilted
// thing at most.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------- the pattern library ----------
export const PATTERN_FAMILIES = ['hero', 'section', 'nav', 'footer', 'card', 'button', 'type', 'motion'];
// no design or pattern on more than about one page in ten: one used in the last nine draws is out while others fit
export const ONE_IN = 10;
export const RECENT_OUT = ONE_IN - 1;
// the weight of one used `at` draws ago when too few fresh ones fit: the longest unused first, and each under half
// of a fresh one, so the fresh ones that fit still come first
export const comeBack = (at) => 0.5 * ((Math.max(0, at) + 1) / RECENT_OUT) ** 2;
// how a pattern weighs beside a tested design, a dealt hero of the direction or a section blueprint of the direction
// (each 1), times its quality weight: a frame pattern scored 4 is half as likely as one of the twelve tested designs of
// its part, and one scored 5 or more three times as likely or more (GOOD_LIFT, below); the hero and section patterns
// are many, so they weigh less
export const PATTERN_SHARE = { frame: 1, hero: 0.6, section: 0.5 };
// The quality the lab's round 11c pass gave each pattern (1-10, harsh): one at 3 or below is never dealt, a 4 weighs half
// a tested design, a 5 as much, a 6 or more half as much again. One with no score weighs as a 4.
export const QUALITY_FLOOR = 4;
const QUALITY_WEIGHT = { 4: 0.5, 5: 1, 6: 1.5 };
// In the frame a pattern scored 5 or more weighs three times as much again (review-006: the patterns built at 5.5, the
// tested designs at 4.6), and the library takes up to three of the four parts: one stays a tested design while three of
// its part are fresh. (Round 11e first dealt such a pattern wherever a fresh one fitted, and a physics footer came back
// on every tenth page.)
export const GOOD_FRAME = 5;
export const GOOD_LIFT = 3;
export const LIBRARY_MOST = 3;
export const qualityWeight = (e) => (Number.isFinite(e?.quality) ? QUALITY_WEIGHT[Math.min(6, e.quality)] ?? 0 : 0.5);
// Each file is an array of entries {id, name, description, signature, fits {sectors, tone, density}, needs {pictures,
// productUi, video, words, assets}, phone, avoidWith, houseRuleCheck, quality} (motion adds basic). A file that is
// missing or unreadable is an empty family; an entry without an id or a description, marked banned, scored under the
// quality floor, hollow or with a signature only a hover shows is never dealt (the signatures rewritten below first).
export function loadPatterns(dir) {
  const out = {};
  for (const f of PATTERN_FAMILIES) {
    let list = [];
    try { const j = JSON.parse(readFileSync(join(dir, `${f}.json`), 'utf8')); list = Array.isArray(j) ? j : Array.isArray(j?.patterns) ? j.patterns : []; } catch { /* no file: today's designs alone */ }
    const seen = new Set();
    out[f] = list.filter((e) => e && typeof e.id === 'string' && typeof e.description === 'string' && e.description.trim() && !(e.banned === true || (Array.isArray(e.banned) && e.banned.length)) && !(Number.isFinite(e.quality) && e.quality < QUALITY_FLOOR) && !houseClash(e) && !seen.has(e.id) && seen.add(e.id))
      .map(stillSignature).filter((e) => !hollow(e) && !(MUST_SHOW.includes(f) && e.signature && hoverOnly(e.signature)));
  }
  return out;
}
// the families whose signature the sheet prints as Must show (a small move's is its own description)
export const MUST_SHOW = ['hero', 'nav', 'footer', 'card', 'button'];
// ---------- what a still shows ----------
// A Must show line is checked on a screenshot, so it names what a still at rest shows (or a still at a scroll
// position: past the hero, after 80px); a hover, a roll or a scrub may follow it, never be all of it. Review-006 built
// two button lines that were a hover alone ("on hover the label rolls up") as the slightly rounded rectangle. A line is
// hover-only when, cut at its first moving clause (or its first moving word), what is left names nothing but the plain
// thing: a size, a fill, a corner, the word for a button, a box, a row of cards, and the label, its weight and an arrow
// at either end (round 11e: "a fixed 220px ink button with its label at the left and the arrow pinned at the right"
// passed, and was ll-03's dark rectangle with an arrow).
const MOVING = /\bon (?:hover|focus|tap|press|click|scroll)\b|\bhover(?:ed|ing|s)?\b|\bfocus(?:ed|es)?\b|\bas (?:you|the (?:page|section|footer|card|row|stage)|it) (?:scroll|cross|pass|arriv)\w*|\bwhile (?:you |the page )?scroll\w*|\b(?:rolls?|rolling) (?:up|in|out|through|down)\b|\bwipes?\b|\bfloods?\b|\bslides? (?:\d+px )?(?:across|up|in|over|out)\b/i;
const CLAUSE = /,\s+|\s+(?:that|whose|where|which|while|until|when|and)\s+/g;
const PLAIN_WORDS = /\b(?:an?|the|one|two|three|four|its|it|them|of|and|with|in|on|at|to|by|for|about|between|inside|fixed|compact|sharp|soft|slim|large|small|wide|tall|equal|open|filled?|fills?|solid|plain|square-cornered|rounded|rows?|buttons?|blocks?|box(?:es)?|plates?|rectangles?|cards?|panels?|links?|labels?|words?|text|letters|weight|regular|medium|bold|arrows?|glyphs?|icons?|leading|trailing|pinned|left|right|ends?|sides?|alone|own|line|rest|second|actions?|ink|accent|surface|tone|ground|colou?r|corners?|radius|padding|width|height|each|every|same|never|changing|\d+(?:-\d+)?(?:px|ms|s)?)\b/gi;
export function stillPart(line) {
  return String(line || '').split(/(?<=[.;:])\s+/).map((t) => {
    const m = t.match(MOVING);
    if (!m) return t;
    const cuts = [...t.slice(0, m.index).matchAll(CLAUSE)];
    return cuts.length ? t.slice(0, cuts.at(-1).index) : t.slice(0, m.index);
  }).join(' ').trim();
}
export const hoverOnly = (line) => MOVING.test(String(line || '')) && !/[a-z]{3,}/i.test(stillPart(line).replace(PLAIN_WORDS, ' ').replace(/[^a-z\s-]/gi, ' '));
// The study's signatures that were a hover or a scroll alone, rewritten to what a still shows first (the export ships
// them so; read here too, so an older export is dealt the same). The first and third, so written, show the plain shape
// at rest, and hoverOnly drops them.
export const SIGNATURE_FIXES = {
  'btn-soft-label-glyph-push': 'A fixed 220px ink button with its label at the left and the arrow pinned at the right, about 30px of open fill between them at rest; on hover the label slides across to meet the arrow, the width never changing.',
  'btn-square-solid-label-roll': 'A compact 48px ink block with square corners, its label in the ground colour; on hover the label rolls up and the fill turns the accent.',
  'btn-rect-surface-arrow-flood': 'A sharp 52px box about 220px wide in the surface tone, its label at the left and an arrow at the right end; on hover the ink floods it from the left while the arrow travels 6px.',
  'card-tall-padded-title-button-row': 'Three wide filled rows about 240px tall, in turn the surface tone, the ink and the surface tone, a title at the left and the dealt button at the right; each sticks 16px lower than the last, so a 16px sliver of each shows above the next.',
};
export const stillSignature = (e) => (SIGNATURE_FIXES[e.id] && e.signature !== SIGNATURE_FIXES[e.id] ? { ...e, signature: SIGNATURE_FIXES[e.id] } : e);
// A card, tile or panel whose middle is left empty, or that holds one label: built, it is a hollow box, and a row of
// them a bento wall (review-006: "the space between left empty", 360px tiles holding a label each, a short paragraph in
// a 480px tile). Read from its words, and the patterns whose words do not say it (a title and twenty words in a 480px
// tile). (Round 11e's check missed "leave their lower half empty", "with empty colour between" and "the panel is empty".)
const HOLLOW_WORDS = /\bthe (?:space|room) between\b[^.]{0,30}\bleft empty\b|\b(?:the )?(?:rest|middle|centre|upper part|lower part|remainder)(?: of (?:the |each |its )?(?:card|tile|panel|box|block|bar|board))?\b[^.]{0,16}\b(?:is |stays? |left )?empty\b|\b(?:upper|lower|left|right|top|bottom) (?:half|third|two thirds|quarter)\b[^.]{0,20}\b(?:is |stays? |left )?empty\b|\bempty (?:middle|centre|fill|colou?r)\b|\b(?:card|tile|panel|box|block)s? (?:is|are|stays?|stands?) (?:left |almost |nearly )?empty\b|\b(?:holding|holds?) (?:only )?(?:a|one) (?:centred )?(?:[\w-]+ )?(?:label|name|title|word)\b[^.]{0,20}\bnothing else\b|\ba label each\b/i;
const BOXY = /\b(?:cards?|tiles?|panels?|boxe?s?|blocks?|bars?|boards?)\b/i;
const HOLLOW_IDS = new Set(['card-text-tile-diagonal-split', 'btn-tile-colour-block']);
// (read by whole sentences: "a tall tile …; it holds one figure …, with empty colour between" names its tile before
// the semicolon)
export const hollow = (e) => HOLLOW_IDS.has(e.id) || [e.description, e.signature, e.blueprint].some((t) => String(t || '').split(/\bPhone:/)[0].split(/(?<=\.)\s+/).some((x) => BOXY.test(x) && says(x, HOLLOW_WORDS)));
// The ids the round 11c pass renamed (library/patterns/id-map.json, {old id: new id}, written by the export) and the
// patterns promoted to a tested design (PROMOTED): read through them, a history written before still keeps its draws
// away. A missing map leaves the ids as they are.
export function loadIdMap(dir) {
  let map = {};
  try { map = JSON.parse(readFileSync(join(dir, 'id-map.json'), 'utf8')) || {}; } catch { /* no map */ }
  return (id) => (typeof id === 'string' ? PROMOTED[map[id] || id] || map[id] || id : id);
}
// a history entry with its pattern ids read through the map: the frame's parts, the hero, the sections, the small moves
// and the type note
export function historyIds(h, rename) {
  if (!h || typeof h !== 'object') return h;
  const each = (x) => (Array.isArray(x) ? x.map(rename) : rename(x));
  const out = { ...h };
  if (h.frame && typeof h.frame === 'object') out.frame = Object.fromEntries(Object.entries(h.frame).map(([k, v]) => [k, rename(v)]));
  for (const k of ['hero', 'sections', 'moves', 'typeNote']) if (h[k] !== undefined) out[k] = each(h[k]);
  return out;
}
// The house rules a description can break in so many words (the export drops what the study marked banned; this is
// the last check, so a pattern that still asks for one is never dealt): an announcement strip, a progress bar, a drag
// rail, glass, a gradient, a shadow, monospace, an eyebrow, a drawn illustration, emoji, the violet family. A negated
// mention ("no gradient") is no clash.
const HOUSE_TELLS = /\bannouncement (?:bar|strip)\b|\binformation strip\b|\binfo bar\b|\bprogress (?:bar|rail|ring)\b|\bdrag(?:gable)? (?:rail|row|cards?)\b|\bglass(?:morphism)?\b|\bbackdrop[- ]blur\b|\bgradients?\b|\bdrop shadows?\b|\bmonospace\b|\beyebrows?\b|\billustrat\w*|\bline drawings?\b|\bdoodles?\b|\bemoji\b|\bviolet\b|\blavender\b|\bperiwinkle\b/i;
export const houseClash = (e) => says(`${e.name || ''}. ${e.description}`, HOUSE_TELLS);
// A positive mention: the words match somewhere not negated just before ("no outline", "never a shadow", "without
// a border" are not an outline, a shadow or a border).
const NEGATED = /\b(?:no|never|not|without|nor|instead of)\b[^.;:]{0,28}$/i;
export function says(text, re) {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  for (const m of String(text || '').matchAll(g)) if (!NEGATED.test(String(text).slice(Math.max(0, m.index - 40), m.index))) return true;
  return false;
}
// how the study designed a house-rule conflict out of a pattern (its houseRuleCheck), when it names one. A bare verdict
// ("Clean.", "No conflict.") prints nothing; a verdict followed by its terms ("Clean. Pictures designed, not
// documentary"; "No conflict: the mat is a fill") prints the terms; a conditional one ("Clean when the headline is there
// from the first frame", "No conflict if the pictures are art-directed") prints whole. (The first export hid all of
// them: some 350 notes, the documentary-photograph and outline conditions among them, never reached the sheet.)
const VERDICT = /^(?:none|ok|n\/a|no conflicts?(?: left)?|clean|passes)\b/i;
export const houseNote = (e) => {
  const x = [].concat(e.houseRuleCheck ?? []).filter((v) => typeof v === 'string')
    .map((v) => { const t = v.trim(); if (!VERDICT.test(t)) return t; const m = t.match(/^(?:none|ok|n\/a|no conflicts?(?: left)?|clean|passes)\s*[.:;,]\s*(.*)$/is); return m ? m[1] : /^\S+(?:\s+conflicts?)?\s*\.?$/i.test(t) ? '' : t; })
    .map((v) => v.trim().replace(/\.$/, '')).filter(Boolean).map((v) => v[0].toUpperCase() + v.slice(1));
  return x.length ? ` House rules for it: ${x.join('; ')}.` : '';
};
// the builder's spec of a pattern: its description in full, how the house rules bend it, then how it adapts on a phone
// (most descriptions already end on their phone plan, "Phone: …": then the phone field is not printed again)
export const phoneIn = (text) => /\b(?:on a phone|phone)\s*:/i.test(String(text || ''));
export const patternPhone = (e) => (e.phone && !phoneIn(e.description) ? String(e.phone).trim() : null);
export const patternText = (e) => `${e.description.trim()}${houseNote(e)}${patternPhone(e) ? ` On a phone: ${patternPhone(e)}` : ''}`;
// the photographs a pattern takes (its needs.pictures label; a "2-3" whose assets name two photographs is a pair and
// takes two: a photo pair dealt as a gallery was told to show three)
const PICTURES = { 0: 0, 1: 1, '2-3': 3, '4-8': 6, many: 8 };
const needsOf = (e) => (e.pneeds || (e.needs && !Array.isArray(e.needs) ? e.needs : {}));
export const patternPictures = (e) => { const n = PICTURES[String(needsOf(e).pictures ?? 0)] ?? 0; return n === 3 && photosOf(e) === 2 ? 2 : n; };
// the page's tones in the study's words (quiet is calm there)
export const studyTones = (tones) => [...new Set((tones || []).map((t) => (t === 'quiet' ? 'calm' : t)))];
// sector words the study may use for a group of the skill's sectors
const SOFTWARE_SECTORS = ['saas', 'dev-tool', 'ai-product', 'consumer-app', 'finance'];
const SECTOR_WORDS = {
  software: SOFTWARE_SECTORS, tech: SOFTWARE_SECTORS, technology: SOFTWARE_SECTORS, 'b2b-software': SOFTWARE_SECTORS, app: ['consumer-app'], ai: ['ai-product'], fintech: ['finance'],
  portfolio: ['studio-portfolio', 'personal-portfolio', 'agency', 'architecture'], studio: ['studio-portfolio', 'agency'], creative: ['agency', 'studio-portfolio', 'personal-portfolio', 'music', 'fashion', 'event', 'culture'],
  retail: ['ecommerce', 'physical-product', 'fashion'], commerce: ['ecommerce', 'physical-product'], shop: ['ecommerce', 'physical-product'], product: ['physical-product', 'ecommerce'], 'consumer-product': ['physical-product', 'ecommerce'], automotive: ['physical-product'],
  food: ['restaurant', 'hospitality'], 'food-drink': ['restaurant', 'hospitality', 'physical-product'], drink: ['restaurant', 'physical-product'], travel: ['hospitality'], hotel: ['hospitality'], place: ['hospitality', 'restaurant', 'real-estate', 'architecture'], property: ['real-estate', 'architecture'],
  arts: ['culture', 'music', 'event'], art: ['culture'], museum: ['culture'], film: ['culture', 'music', 'event'], entertainment: ['music', 'event', 'culture'], gaming: ['consumer-app', 'culture'], sport: ['event', 'physical-product'], luxury: ['fashion', 'hospitality', 'real-estate', 'physical-product'], beauty: ['fashion', 'physical-product', 'health'],
  wellness: ['health'], healthcare: ['health'], learning: ['education'], charity: ['nonprofit'], 'non-profit': ['nonprofit'], brand: ['agency', 'physical-product', 'fashion'],
};
function sectorFits(list, sector) {
  if (!Array.isArray(list) || !list.length) return true;
  return list.some((x) => { const w = String(x).toLowerCase(); return w === '*' || w === sector || (SECTOR_WORDS[w] || []).includes(sector); });
}
// whether an avoidWith entry names something on the page: its id, an id it begins ("nav-transparent"), or a kind of
// thing the page has ("scene", "replay", "video", "dark-ground")
function names(set, x) { const w = String(x || '').toLowerCase(); if (!w) return false; for (const d of set) if (d === w || d.startsWith(w + '-')) return true; return false; }
// What the builder must have for a pattern to work (its needs.assets): the product's own interface, footage, a 3D model,
// cut-outs from the client's own photographs, real logos of clients or press, a real map or route, real figures, quotes
// or prices, so many photographs. Round 12's builders drew an outline laptop for a 3D scene, a number badge for a
// picture block and a play button with no film (review-004): a pattern whose assets the page lacks is never dealt. What
// a page has, from --have (real figures, quotes or prices only with --have data: a brief's opening hours are no quote,
// and a page dealt a quote card it has no quote for invents one):
export function pageAssets(input, software) {
  const have = new Set(input.have || []);
  const has = new Set(['none']);
  if (software || have.has('product-ui')) has.add('product-ui');
  for (const a of ['video', '3d', 'logos', 'map']) if (have.has(a)) has.add(a);
  if (have.has('product-photo') || have.has('photography')) has.add('cut-out');
  if (have.has('route')) has.add('map');
  if (have.has('data')) has.add('real-data');
  return has;
}
const ASSET_WORDS = { 'product-ui': 'the product\'s own interface', video: 'footage of this very subject', '3d': 'a 3D model of the subject', 'cut-out': 'cut-outs from the client\'s own photographs', logos: 'real logos of clients or press', map: 'a real map or route', 'real-data': 'real figures, quotes or prices the brief gives' };
// the photographs a pattern's assets name ("photos:4"), 0 when none; and the most it takes by either count
const photosOf = (e) => Math.max(0, ...[].concat(needsOf(e).assets || []).map((a) => +(String(a).match(/^photos:(\d+)$/)?.[1] || 0)));
export const photosNeeded = (e) => Math.max(patternPictures(e), photosOf(e));
// Why a pattern cannot go on this page, or null: written for other sectors, a need the brief does not meet (the
// product's own interface, footage, an asset the page lacks, more photographs than its photograph total), or a clash it
// names with something already dealt. pc: { sector, tones, loud, software, video, assets: Set (pageAssets), pictureCap,
// density, dealt: Set, avoid: Set }.
export function patternWhyNot(e, pc) {
  const n = needsOf(e);
  if (!sectorFits(e.fits?.sectors, pc.sector)) return `it is not written for a ${pc.sector} page`;
  if (n.productUi && !pc.software) return 'it needs the product\'s own interface';
  if (n.video && !pc.video) return 'it needs footage of this very subject';
  const lacks = pc.assets && [].concat(n.assets || []).find((a) => !/^photos:/.test(a) && !pc.assets.has(a));
  if (lacks) return `it needs ${ASSET_WORDS[lacks] || lacks}, which this page does not have`;
  if (photosNeeded(e) > pc.pictureCap) return `it needs more photographs than this page can honestly show (${pc.pictureCap})`;
  if ((e.avoidWith || []).some((a) => names(pc.dealt || new Set(), a)) || names(pc.avoid || new Set(), e.id)) return 'it clashes with something already dealt';
  if (e.fits?.density === 'dense' && pc.density !== 'dense-ok') return 'it is dense, and this page wants air';
  return null;
}
function toneFits(e, pc) {
  const t = e.fits?.tone;
  if (!Array.isArray(t) || !t.length || t.includes('*') || !pc.tones?.length) return true;
  return t.some((x) => pc.tones.includes(x) || (x === 'raw' && pc.loud));
}
// The patterns of one family that fit the page, as [entry, weight]: sector, needs, clashes and density always; the
// tone while at least `min` still fit, then the others of other tones at half the weight rather than an empty pool. On
// an airy page the airy ones weigh most; and each weighs by its quality (qualityWeight).
export function fitPool(list, pc, min = 3) {
  const ok = (list || []).filter((e) => !patternWhyNot(e, pc));
  const toned = ok.filter((e) => toneFits(e, pc));
  const w = (e) => qualityWeight(e) * (pc.density === 'airy' && e.fits?.density && e.fits.density !== 'airy' ? 0.7 : 1) * (toneFits(e, pc) ? 1 : 0.5);
  return (toned.length >= min ? toned : ok).map((e) => [e, w(e)]);
}
// Whether a pattern can be the page's navigation, footer, card style or button design at all, under the house rules
// (the export drops what the study marked banned; this keeps out what is not that part: no navigation, a footer of one
// line, a media tile with no words, an icon disc or a field in place of the button).
const TEXT_OF = (e) => `${e.name || ''}. ${e.description}`;
// A navigation that hides on the way down and comes back on the way up, or scrolls away with the hero and leaves
// nothing in its place: the owner named the bar that hides as the generic one (October 2026). A bar that hands over to
// fixed corners, a tab or a dock still navigates; one that hides while a pinned scene holds the screen is no hide.
const HIDES_ON_SCROLL = /\bhides?\b(?!\s*(?:\([^)]*\)\s*)?(?:while|during)\b)|\b(?:on|any|the first|first|every) scroll(?:ing)? (?:up|down)\b|\bscroll(?:ing)? down\b[^.]{0,60}\b(?:hides?|slides?|leaves|out of view|off)\b|\b(?:returns?|comes? back|reappears?)\b[^.]{0,30}\bscroll(?:ing)? up\b|\bon the way (?:down|up)\b|\bnothing replaces it\b|\bno bar until\b|\bnothing is fixed on the first screen\b/i;
// (and a bar that scrolls away with the first screen while what replaces it comes only once the hero has gone: for a
// screen of scroll nothing navigates)
const SCROLLS_AWAY = /\bscroll(?:s|ing)? away\b/i;
const AFTER_HERO = /\b(?:once|after|when) the hero (?:has )?(?:gone|left|scrolled (?:out|away|past))\b[^.]{0,240}\b(?:fades? in|drops? in|appears?|arrives?|comes? in|stays? fixed)\b|\bonly after that\b/i;
export const hidesOnScroll = (e) => { const t = `${TEXT_OF(e)} ${e.signature || ''}`; return says(t, HIDES_ON_SCROLL) || (says(t, SCROLLS_AWAY) && says(t, AFTER_HERO)); };
export function partUsable(part, e) {
  const id = e.id; const d = e.description; const all = TEXT_OF(e);
  // (no part is a bento grid: the sheet's Always line)
  if (houseClash(e) || says(all, /\bannouncement\b|\bbento\b/i)) return false;
  // a navigation or footer that lives on a 3D, canvas or shader stage, or on a page that does not scroll, is not this
  // page's (round 11b left a footer over a shader band)
  const staged = /\bcanvas\b|\bWebGL\b|\b3D\b|\bshader\b|\bnon-scrolling\b|\bHUD\b/i.test(all);
  // (nor one that hides on scroll, or a pattern now dealt as a tested design)
  if (part === 'nav') return !staged && !PROMOTED[id] && !hidesOnScroll(e) && !/^nav-none\b|phone-only/.test(id) && !/\bno desktop nav\b|\bon any screen at any width\b/i.test(d) && !says(all, /\bdot rail\b|\brail of (?:\w+ )?(?:scene )?dots\b|\bscroll(?:ing)? progress\b|\bsentence\b/i);
  // a footer holds real links (in columns or a row), never one line, never a lone link or headline, never one the study
  // calls sparse (a link, a logo and open ground: the one-line footer again)
  // (nor a pile of tiles the pointer pushes: a toy, with a 30kB physics engine for a footer, round 11e)
  if (part === 'footer') return !staged && !says(all, /\bphysics\b/i) && !/^foot-(?:none|unrecorded|thin-row|single-baseline)/.test(id) && !/^no footer\b|\bno footer object\b|\bsingle (?:\d+(?:-\d+)?px )?row\b|\bone line of\b|\bonly (?:footer )?element\b|\bnothing (?:else )?(?:but|stands)\b|\beverything else is empty\b|\bnearly empty\b|\bsparse\b|\beverything else is open ground\b/i.test(d) && says(d, /\blinks\b|\bcolumns?\b|\bsitemap\b|\bdirectory\b|\blink row\b/i) && !says(d, /\b(?:giant|huge|full-width|screen-wide)\s+(?:wordmark|name|logo|e-?mail)\b|\bcredits? wall\b|\bcredit roll\b/i);
  // (a card holds the page's own content: never a generative canvas, a flow field or particles as its picture; and no
  // row whose next card peeks in at the screen edge, which runs into one edge: `edge-run`)
  // (nor a card built on one quote or review: the page's card style holds every group it has, and a page with no quote
  // invented one for it)
  if (part === 'card') return !/\b(?:quotes?|reviews?|testimonials?)\b/i.test(`${id.replace(/-/g, ' ')} ${e.name || ''}`) && !/\bno text\b|\bunboxed\b|\bno words\b/i.test(d) && !says(all, /\bcanvas\b|\bgenerative\b|\bparticles?\b|\bflow (?:field|lines)\b/i) && (!says(d, /\bpeek\w*\b/i) || /\b(?:inside|within|at) the container\b/i.test(d)) && !/bento|marquee|stat|number|logo|chip|form|ui-|symbol|blank|icon/.test(id) && says(d, /\bfill(?:ed)?\b|\bpanel\b|\bsurface\b|\bsolid\b|\btile\b|\bcard\b|\bphoto\b|\bpicture\b|\bimage\b|\bvideo\b|\brender\b|\bcut-?out\b/i) && says(d, /\btitle\b|\bname\b|\bheading\b|\blabel\b|\bparagraph\b|\btext\b|\bprice\b|\bsentence\b|\bcaption\b|\bstatement\b/i) && !says(d, /\bicon\b[^.]{0,30}\b(?:on top|above|at the top)\b|\boutlined?\b|\bthin frame\b|\bborder\b/i);
  // (never a button the study marked basic: the stock square, soft and pill shapes the owner saw on every page)
  // (nor one whose label scrambles: references/motion.md, every frame of a word reads whole)
  // (nor a label that stands bare at rest: the first screen's action is a real button, the sheet's Always line)
  if (part === 'button') return e.basic !== true && !/^btn-(?:circle|icon|input|text)-|menu-trigger|burger|store-badge|dashed/.test(id) && !says(all, /\bscrambl\w*|\brandom (?:letters|characters|glyphs)\b|\bcharacters? cycles?\b/i) && !/^(?:transparent|unboxed|unfilled)\b|\bno fill\b|\bat rest\b[^.]{0,40}\b(?:bare|unfilled|transparent)\b|\bstands bare\b/i.test(d.trim()) && !says(d, /\bupper-?case\b|\ball caps\b|\bin caps\b|\bcaps (?:label|word|text)\b|\btracked\b/i) && !(says(d, /\b(?:outline|border|ring)\b/i) && !says(d, /\b(?:solid|filled?)\b/i));
  return true;
}
// a footer pattern that opens on its own closing line and button (it carries the call to action, like CLOSING_FOOTERS;
// "a one-line prompt and a split button" is one, dealt under a closing scene in round 11b), or on a statement or headline
// at the display step with no button: that closes the page as well (round 11c: a cta section, then a footer's two-line
// display statement)
const closingPattern = (e) => says(e.description, /\bclosing (?:line|statement|headline)\b|\bcall to action\b|\bcta\b/i) || says(e.description, /\b(?:headline|statement|prompt)\b[^.]{0,80}\bbutton\b/i) || says(e.description.split(/\bPhone:/)[0], /\b(?:headline|statement|sentence|line)\b[^.]{0,60}\bat the display step\b/i);
// a navigation pattern that sets the wordmark large on the first screen (dealt less under a hero whose headline is the name)
const largeMark = (e) => says(e.description, /\b(?:giant|large|big|wide|full-width)\b[^.]{0,30}\b(?:wordmark|logo|lockup)\b/i);
// a button pattern whose label is set in the pairing's serif: never on a page whose pairing has none (draw.mjs checks it
// again after --redraw type)
export const needsSerif = (text) => says(text, /\bthe serif of the pairing\b|\bneeds a serif\b/i);
// A navigation whose bar holds no section links, only Menu (the band that names the section in view, the Menu button, a
// pattern with a Menu and no links on desktop): the sheet then puts the sections in the Menu panel, not in the bar.
const MENU_ONLY = new Set(['chapter-band', 'menu-button']);
const BAR_LINKS = /\b(?:two|three|four|five|six)(?: (?:or|to|and) (?:three|four|five|six))?(?: one-word| one- or two-word)? (?:links?|link (?:chips|tiles|buttons)|section names)\b/i;
export function menuOnly(id, e = null) {
  if (MENU_ONLY.has(id)) return true;
  const desk = String(e?.description || '').split(/\bOn a phone\b|\bPhone:/)[0];
  return !!e && says(desk, /\bMenu\b/) && !says(desk, BAR_LINKS);
}
// ---------- the facts a design needs ----------
// The opening hours the brief gives (review-007: week-in-bars built on sample hours drew seven near-equal bars, and the
// jurors asked for the client's own): null when it gives none; 'times' for hours with no days ("open from 8 to 18");
// 'flat' when its days keep one set of hours; 'varied' when the week has two or more (a closed day, a split day, a late
// night, or hours for fewer than seven days: "Tuesday to Sunday 8:00-18:00", "Mon-Fri 9-17"). A range counts as hours
// when it has minutes or am/pm, or follows a day, "open" or "hours", and never beside an age, a size or a price ("ages
// 4-10", "lunch menu 12-15 €").
const DAY_NAME = /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekends?|weekdays?)s?\b|\bdaily\b|\bevery day\b/i;
const DAY_SHORT = /\b(?:Mon|Tue|Tues|Wed|Thu|Thur|Thurs|Fri|Sat|Sun)\b/;
const day = (t) => DAY_NAME.test(t) || DAY_SHORT.test(t);
const CLOCK = '(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm)?';
const RANGE = new RegExp(`\\b${CLOCK}\\s*(?:-|–|to|until|till)\\s*${CLOCK}(?![\\d%])(?!\\s*(?:[€$£]|(?:guests?|people|persons?|rooms?|beds?|km|kg|miles?|minutes?|mins?|years?|weeks?|months?|days?|nights?|seats?|EUR|USD|GBP|CHF|euros?|dollars?|pounds?|francs?|cm|mm|metres?|meters?|percent)\\b))`, 'gi');
const NOT_HOURS = /(?:\b(?:ages?|aged|sizes?|grades?|levels?)|[€$£])\s*$/i;
const OPEN_WORDS = /\b(?:open|opens|hours|daily|every day|kitchen|lunch|dinner|breakfast|brunch)\b/i;
const hoursRange = (b, m) => {
  const before = b.slice(Math.max(0, m.index - 40), m.index);
  return !NOT_HOURS.test(before) && +m[1] <= 24 && +m[4] <= 24 && !!(m[2] || m[3] || m[5] || m[6] || OPEN_WORDS.test(before) || day(before));
};
// the days a stretch of the brief names, Monday 0 to Sunday 6: a run ("Tuesday to Sunday", "Mon-Fri") counts every day
// in it, weekdays and weekends theirs, daily or every day all seven
const WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_WORD = /\b(?:[Mm]on|[Tt]ues|[Ww]ednes|[Tt]hurs|[Ff]ri|[Ss]atur|[Ss]un)days?\b|\b(?:Mon|Tues?|Wed|Thu(?:rs?)?|Fri|Sat|Sun)\b|\b[Ww]eek(?:day|end)s?\b/g;
const dayNums = (w) => (/^week/i.test(w) ? (/end/i.test(w) ? [5, 6] : [0, 1, 2, 3, 4]) : [WEEK.indexOf(w.slice(0, 3).toLowerCase())]);
function daysNamed(t) {
  if (/\b(?:daily|every day|seven days)\b/i.test(t)) return new Set(WEEK.keys());
  const words = [...t.matchAll(DAY_WORD)]; const out = new Set();
  words.forEach((m, i) => {
    const next = words[i + 1];
    const run = next && ![m[0], next[0]].some((w) => /^week/i.test(w)) && /^\s*(?:-|–|to|through|thru|until|till)\s*$/i.test(t.slice(m.index + m[0].length, next.index));
    if (!run) { for (const d of dayNums(m[0])) out.add(d); return; }
    for (let d = dayNums(m[0])[0]; ; d = (d + 1) % 7) { out.add(d); if (d === dayNums(next[0])[0]) break; }
  });
  return out;
}
export function briefHours(brief) {
  const b = String(brief || '');
  const at = (h, m, ap) => `${ap ? (+h % 12) + (/pm/i.test(ap) ? 12 : 0) : +h}:${m || '00'}`;
  const found = [...b.matchAll(RANGE)].filter((m) => hoursRange(b, m));
  const ranges = found.map((m) => `${at(m[1], m[2], m[3])}-${at(m[4], m[5], m[6])}`);
  if (!ranges.length) return null;
  if (!day(b)) return 'times';
  const closedDay = [...b.matchAll(/\bclosed\b/gi)].some((m) => day(b.slice(Math.max(0, m.index - 40), m.index + 40)));
  // (a night that runs later: "Thursday until 20:00" beside the week's ranges, or "until late")
  const inRange = (i) => found.some((m) => i >= m.index && i < m.index + m[0].length);
  const later = [...b.matchAll(/\b(?:until|till)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/gi)].some((m) => !inRange(m.index + m[0].length - 1) && !ranges.some((r) => r.endsWith(`-${at(m[1], m[2], m[3])}`)));
  // (and a week whose ranges each follow their days and name fewer than seven of them: the others are closed)
  const leads = found.map((m, i) => b.slice(Math.max(i ? found[i - 1].index + found[i - 1][0].length : 0, m.index - 50), m.index).split(/[.;](?:\s|$)/).at(-1));
  const named = leads.map(daysNamed);
  const short = named.every((d) => d.size) && new Set(named.flatMap((d) => [...d])).size < 7;
  return new Set(ranges).size > 1 || closedDay || later || short || /\b(?:until|till) late\b/i.test(b) ? 'varied' : 'flat';
}
const MONTH = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
// a lodging's season or check-in times, which its visit block prints in place of opening hours
const SEASON = new RegExp(`\\bcheck-?in\\b|\\b(?:open )?all year\\b|\\bseason\\b|\\b(?:open|closed) (?:(?:from|in|between|until) ${MONTH}|${MONTH} (?:to|until|till|through|-|–) ${MONTH})\\b`, 'i');
// a price, a time or a date the brief gives (a button that carries the fact prints one)
const PRICE = '[€$£]\\s?\\d|\\b\\d+(?:[.,]\\d+)?\\s?(?:€|(?:EUR|USD|GBP|CHF|kr|NOK|DKK|SEK|ISK|euros?|dollars?|pounds?|francs?|kron[eo]r)\\b)';
const DATE = `\\b\\d{1,2}(?:st|nd|rd|th)?\\s+${MONTH}\\b|\\b${MONTH}\\s+\\d{1,2}\\b`;
const FACT = new RegExp(`${PRICE}|\\b\\d{1,2}[:.]\\d{2}\\b|\\b\\d{1,2}\\s?(?:am|pm)\\b|${DATE}`, 'i');
// The figures the brief gives, each with what it counts (a price, a date, a measure or a count with its unit; never a
// time of day, which is the visit block's): the capsule's pieces show one each (review-007: "it needs four short
// figures", and on briefs with none its 96px figures were made up)
const FIGURE = new RegExp(`${PRICE}|${DATE}|\\b\\d+(?:[.,]\\d+)?\\s?(?:%|(?:km|kg|kWh|Wh|cm|mm|m²|litres?|liters?|ml|hours?|minutes?|mins?|people|guests|rooms|seats|beds|courses|dishes|plans?|users|members|years|months|weeks|days|nights|works|objects|languages|countries|cities|shops|stores)\\b)`, 'gi');
// A product for writing and paper (a writing, notes, document or publishing tool), a publisher, a magazine or a literary
// festival: the folded corner is its button. Never a verb or a word any brief may use ("book a tour", "write tests", "a
// video editor", "upload documents", "an API with docs").
const PAPER = /\b(?:writing|note-taking|notes?|notebook|journal(?:ing)?|documents?|docs|manuscripts?|essays?|text|markdown|word|publishing|proofreading|research|citations?|legal|contracts?)\s+(?:apps?|tools?|editors?|software|platforms?|workspaces?|assistants?|processors?|suites?)\b|\bfor (?:writers|authors|novelists|journalists|poets|copywriters|researchers)\b|\b(?:publishers?|publishing house|magazines?|literary|poetry|book (?:fairs?|festivals?))\b/i;
// a footer pattern's opening hours in any words ("opening hours", "address and hours", "the city and hours"), never a
// length of time ("48 hours", "hours of work")
const PLACE_HOURS = /\b(?:opening|visiting|kitchen) hours\b|(?<!\b(?:\d+|a few|few|two|three|four|five|six|eight|twelve|many|several)\s)\bhours\b(?!\s+(?:of|ago|later|long|per|a day|a week)\b)/i;
// the pages beyond this one a brief names (a keyboard of links holds them beside the sections and the two legal pages)
const PAGES = /\b(?:docs|documentation|blog|changelog|careers|status page|help (?:centre|center)|api reference|templates|integrations|community|forum)\b/gi;
// A description that sets something off the level at rest (tilted, skewed, or turned so many degrees): a page has one at
// most (the dealt hand, the tilted sticker, a skewed tag, a picture masked at 45°, a hero object tilted 8 degrees). A
// sentence about a hover, a press, the pointer, the scroll, an entrance or an exit is left out, and one that drops the
// tilt or lands level: what only turns then is level at rest. A turn of 90 degrees is a label set upright, no tilt.
const TILT = /\b(?:tilt(?:ed|s)?|skew(?:ed|s)?|askew)\b|(?<![\d.])(?!90\b)[1-9]\d?(?:\.\d+)?\s?(?:°|deg(?:rees?)?\b)/i;
const MOVES_IT = /\bhover\w*|\bfocus\w*|\bpointer\b|\bcursor\b|\bmouse\b|\bscroll\w*|\bpress(?:es|ed)?\b|\bdrag\w*|\bclick\w*|\btap(?:s|ping|ped)?\b|\bslides?\b|\bfades?\b|\bglides?\b|\barriv\w*|\bfl(?:y|ies) in\b|\bentrance\b|\bon exit\b|\bwhen (?:it is )?open(?:ed)?\b|\bstraighten\w*|\bsettles? straight\b|\blands? level\b|\b(?:dropped|left out|removed)\b/i;
export const tilts = (text) => String(text || '').split(/(?<=[.;])\s+/).some((t) => !MOVES_IT.test(t) && !MOVING.test(t) && says(t, TILT));
// a hero or section that stands on the accent (a field, band or block of it), which leaves the stair footer the ink
export const onAccent = (text) => says(String(text || '').split(/\bPhone:|\bOn a phone\b/)[0], /\b(?:field|band|ground|block|panel|column) (?:in|of) the accent\b|\bon the accent(?: colou?r| tone)?\b(?!'s| ?(?:ink|button|fill|letters|link))|\baccent (?:field|ground|band)\b|\bthe accent as (?:a |the )?ground\b/i);

const ALWAYS_NAV = 'Nothing stands above it (no announcement, information or language strip: `announcement-bar` fails it), and every link is one or two words, never a sentence (`nav-sentence` fails a sentence in the bar and any link or button over three words). It sits on the page\'s margins, on an opaque ground wherever it is fixed. It never hides on the way down and comes back on the way up, and never scrolls away leaving nothing in its place: where the first screen\'s bar scrolls away, what this design keeps fixed takes over at once (`nav-not-as-dealt` fails a bar that hides).';
// a first screen whose headline is the name shows no second wordmark (sheet section 6): the two designs that set the
// wordmark large on the first screen say how, and are dealt less often under such a hero
const NAME_MARK = 'When the hero\'s headline is the name, the first screen shows the mark alone in the wordmark\'s place (or leaves it empty) and the wordmark arrives in the fixed band once the hero has gone.';
// (the plain bar that hides on the way down, the owner's generic bar, is no longer one of them: round 11c put the
// study's best navigation in its place, the band that names the section in view, nav-live-chapter-caption)
// (a design at 0.3 is one review-007's jurors scored under 5 of 10 built as written, 30 of the 48, among them the seven
// review-006 found to be the usual written down; soft-large stays at 0.3 from then, and rolling-label is not dealt at
// all: its Must show line is a hover on the plain shape. The six they scored 6 keep their weight: bottom-dock,
// hours-and-place, two-halves, overlapping, circle-arrow, fact-inside)
export const PROMOTED = { 'nav-live-chapter-caption': 'chapter-band' };
const NAV = [
  ['chapter-band', 1, 'A band that names where you are: fixed at the top, 56px tall, a solid band of the page ground on every screen. The wordmark at the left margin at the h4 step; at the right margin a Menu text button beside the one action (40px tall); dead centre the name of the section in view at 16px in the ink: the section\'s one- or two-word name (its link in Menu), never a sentence or a number. When the next section takes the screen the old name slides up out of a 24px mask and the new one slides up in (280ms, ease-out); over the hero the centre is empty. Menu opens the section names full-screen on the ink, with the action and the email. On a phone: a 56px band with the wordmark, Menu and the action; the live name is dropped.'],
  ['centred-logo', 0.3, `Split round a centred wordmark: two or three links at the left margin, the wordmark centred at the h3 step, the action at the right margin with one secondary link (Visit, Sign in) beside it; 80px tall over the hero. After the hero it stays fixed as a 56px band of the ground with the wordmark centred and the action at the right; below 900px the links go behind a Menu text button. ${NAME_MARK}`, (c) => (c.nameHero ? 0.3 : 1)],
  ['floating-pill', 0.3, 'A floating capsule: centred at the top, 16px below the edge, as wide as its content (about 520-640px at 1440), 52-56px tall, fully round, filled with the surface tone and opaque (no blur, no border, no shadow at rest); in it the wordmark, three or four links at 15-16px and the action as the accent fill at its right end. It stays fixed on every screen on its solid fill, and every held heading keeps clear of it. On a phone: the wordmark and a Menu button in a 48px capsule, 12px from the edges.'],
  ['menu-button', 0.3, 'Minimal: the wordmark at the left margin, and at the right margin a Menu text button beside the one action, both 44-48px tall, at every width. Menu opens a full-screen panel on the ink: the section names as links at the h2 step stacked on the left, the action, the email and the address or hours on the right, Close where Menu was; it slides down in 320ms. The 72px bar\'s ground scrolls away with the hero while the wordmark and the two buttons never leave: they stay fixed in their corners, each on a solid tab of the ground.'],
  ['shrinks', 0.3, 'A bar that changes on scroll: over the hero it is 104-120px tall with the wordmark at the h2 step and the links at body size; after 80px of scroll it settles into a 56-64px band of the ground (or the surface tone) with the wordmark at the h4 step, by transform alone (scale and translate, 300ms), and stays fixed. Never fades to glass. On a phone: 72px with the wordmark at the h4 step and a Menu button, settling to 56px the same way.'],
  ['side-index', 0.7, 'A side index: at 1200px and wider the section names stand as a short vertical list at the left margin in grid columns 1-2, at body size, sticky from the end of the hero to the footer (position: sticky inside the page grid), the current one in the ink at weight 600 and the others in the muted ink. Every section after the hero keeps its content in columns 3-12, so the margins stay equal and nothing runs under the list: map each blueprint\'s columns 1-12 onto columns 3-12. The index hides (opacity 0, 200ms) while a full-bleed band, a scene or the replay is on screen, and comes back after. Over the hero the wordmark and the action stand in a plain top row; below 1200px it is a top bar with a Menu button.', (c) => (c.software ? 0.6 : 1)],
  ['bottom-dock', 1, 'A dock at the bottom: at the top of the first screen only the wordmark, at the left margin, which scrolls away with the hero. The links and the action live in a capsule fixed 20px above the bottom edge and centred, there from the first screen on, 56px tall, as wide as its content, filled with the ink and lettered in the ground colour (on a dark page the surface tone with ink letters), opaque, no border, no shadow: three or four section names at 15-16px, the current one at weight 600, and the action as its one filled item in the accent. On a phone the dock spans the width less the margins, 60px plus the safe area, each target 44px or taller, and the page keeps 96px free under its last line. It slides down out of view while a pinned scene or the replay holds the screen, and comes back after.'],
  ['corners', 0.3, 'No bar, four corners: the wordmark top-left and the action top-right, each on a small solid tab of the ground (10-14px padding, the dealt corner), fixed on every screen; on the first screen three or four links stand beside the wordmark and scroll away with the hero. On a phone the links go behind a Menu button beside the action.'],
  ['masthead', 0.3, `A masthead: two rows over the hero, the wordmark centred at the h2 step and under it the links centred in one row at body size, the action at the right margin of the links row; 120-140px in all, 24px between the rows. Past the hero only the links row stays fixed, 56px, on a solid band of the ground, with the wordmark small at its left. Never an information strip over it. On a phone: the wordmark centred at the h3 step over one row with Menu at the left and the action at the right, about 112px in all; past the hero a 56px band with the wordmark and Menu. ${NAME_MARK}`, (c) => (c.nameHero ? 0.3 : 1) * (['restaurant', 'hospitality', 'culture', 'fashion', 'event', 'music'].includes(c.sector) || c.tone === 'editorial' || c.tone === 'luxury' ? 1.3 : c.software ? 0.4 : 1)],
  ['ink-band', 0.3, 'A band in the ink: full width, 60-64px, filled with the page\'s ink colour (on a dark page the surface tone), the wordmark, links and action in the ground colour, the action a button of the ground colour with ink letters. It stays fixed at the top on every screen, a solid frame for the page. On a phone the band is 56px with the wordmark and a Menu button in the ground colour; Menu opens the links full-screen on the ink.', (c) => (c.tone === 'quiet' ? 0.5 : 1)],
  ['contained-bar', 0.3, 'A contained bar: a filled band inside the page margins, 16px below the top edge, 60-64px tall, in the surface tone with the dealt panel corner; the wordmark at its left inner edge, the links and the action at its right. Fixed, opaque, no border, no shadow. On a phone it keeps the margins and holds the wordmark and Menu.'],
  ['big-links', 0.7, 'Large links over the hero: the wordmark top-left and the section names as links at the h3 step in the text face at weight 500, spread across the top of the first screen on the grid columns, the action as a button at the right margin; 96px tall in all. Past the hero the links fold into a Menu text button beside the wordmark, the two fixed top-left on one solid tab of the ground (12px padding, the dealt corner), and the action stays fixed top-right on a tab of its own; Menu opens the same large links full-screen. On a phone: the wordmark and Menu on one tab, the action on the other.', (c) => (c.creative ? 1.4 : c.software ? 0.5 : 1)],
  // (review-007's keeper, 7 and 7: only where the hero sets the product's window beside the headline, wide enough to
  // carry the bar as its toolbar and starting at the top (draw.mjs, frameCtx `window`); the jurors' faults fixed: the
  // views in words at body size, no track and chip behind them, a Menu button on the phone in place of the view's name)
  ['window-toolbar', 1, 'The bar is the product window\'s toolbar. The hero\'s product window stands where the hero sets it beside the headline (columns 6-12 where it names no place), from 16px below the top edge, in the dealt corner; its top 64px, in the surface tone, is the navigation: the wordmark at the h4 step where the product names its workspace, three or four section links as the product\'s views (words at body size, weight 500, the one in view in the ink at weight 600 and the others in the muted ink, nothing behind them), and the action, the dealt button at 44px, going to another place than the hero\'s button. The headline stands on the ground beside the window, its first line level with the toolbar. Under the toolbar the window shows the product\'s real screen; hovering or focusing a view swaps in its section\'s screen (240ms fade). Past the hero the toolbar stays fixed where it stood, opaque, while the window\'s body passes under it. On a phone: the toolbar spans the margins over the window (the wordmark, a Menu button and the action), then the headline; Menu opens a sheet of the views from the foot.', (c) => (c.software && c.window ? (['luxury', 'editorial'].includes(c.tone) ? 0.5 : 1) : 0)],
];
const ALWAYS_FOOTER = 'The footer is a designed section, never a single line: it stands on its own ground (the surface tone or the ink; the page ground where its cards carry the surface tone; the palette\'s band in the accent only where the design here names it), at least 40% of a screen tall at 1440, its links at body size. **Build it as dealt,** every part and size written here: never cut down to a line of credits or a © row (a portfolio\'s dealt three cards were built as one credit line); the inspector compares the built footer with this one (`footer-not-as-dealt`). Never the name or the email at display size, never a credit wall (the credits sit behind one small "Image credits" link that opens a dialog), never a list the page already shows as content (the menu, the rooms). Every link goes to this page, the client\'s own pages or the client\'s own accounts, never to another company\'s product (a footer that sent six of ten links to other companies\' apps read as their advert).';
// (under a footer that opens on the page's closing line: the closing footer tested in round 11c tripped four checks)
const CLOSING_FOOTER = 'Its closing line is 6vw at most (`min(var(--step-display), 6vw)`; `giant-footer` fails 7vw), two lines at most, on one screen with its button and links (`lone-heading`); the footer is as tall as its content, and nothing in it pins, holds or reveals word by word on scroll (`held-dead-screen`, `line-holds`).';
// A footer that opens on its own closing line and button closes the page: the cta section before it is carried by that
// line (draw.mjs), and it is not dealt after a closing scene, so a page ends once (round 11: nine of thirty pages ended
// on a call to action and then a footer's closing line). On a door place the visit block stands once on the page: the
// hours-and-place footer is that block; the others give the city and Directions and leave the rest to it.
export const CLOSING_FOOTERS = new Set(['closing-columns', 'picture-footer', 'two-halves', 'statement-and-row', 'picture-and-facts', 'stepped-close']);
// the footers that are the page's visit block (the hours, the street and Directions): no section above repeats them
export const VISIT_FOOTERS = new Set(['hours-and-place', 'week-in-bars']);
const ends = (c) => (c.closingScene ? 0 : 1);
const FOOTER = [
  ['closing-columns', 0.3, 'A closing line over columns: the closing line at the h2 step (the action as a statement, four to seven words, two lines at most) with the one button under it; 96px below, three or four short columns at body size: the sections, the contact (the email, a phone only if the brief gives one), the place or the social links, the legal links with Image credits; the © line at the foot. On the surface tone, as tall as its content, about 60svh at 1440, so the line, the button and the columns share one screen. On a phone the columns stack in pairs.', ends],
  ['contact-block', 1, (c) => `A big contact block on the ink: the heading (Visit, Write, Book) at the h2 step on the left half; on the right half the email at the h3 step with a Copy button and a mailto link, and the city${c.door ? ' with a Directions link (the full visit block stands in the section above)' : ''}; under both, a row of the section links, the legal links and Image credits. About 60-70svh.`],
  ['sitemap-grid', 0.3, 'A sitemap grid: four or five columns of real links at body size, each under a short heading at the h4 step in the display face (the sections, the contact, the social links, the legal pages with Image credits), across the content width on the surface tone with 48px gaps; the wordmark at the h3 step top-left and the © line at the foot. About 45-55svh. Only links that go somewhere, no column of filler.', (c) => (c.multiPage ? 1.2 : 0.4)],
  ['picture-footer', 1, 'A picture footer: a photograph of the subject the page has not shown yet, full-bleed, 55-65svh, with the closing line at the h2 step and the button on its calm part (one tone under the words, no gradient, no card); under it a 30svh band of the ground with the contact, the links and the legal line in three columns.', (c) => ends(c) * (c.few ? 0.3 : c.software ? 0.5 : 1)],
  ['newsletter-card', 0.3, 'A newsletter block on the page ground: one filled card on the surface tone with the dealt corner, whatever the page\'s card style, across eight columns, holding one sentence at the h3 step and an email field with its button in one row; beside it, on four columns, the contact and two or three links; the legal line and Image credits under both. It is the page\'s one email form.', (c) => (c.emailElsewhere ? 0 : 1)],
  ['big-link-list', 1, (c) => `Large links on the ink: the page's sections and Contact stacked as links at the h2 step in the display face on the left two thirds (on hover each moves 8px and takes the accent); on the right third the email, the city${c.door ? ' with a Directions link (the full visit block stands in the section above)' : ''} and the social links at body size; the legal line and Image credits at the foot. About 70svh.`, (c) => (c.creative ? 1.3 : 1)],
  ['three-cards', 1, (c) => `Three filled cards in a row on the ground, on the surface tone with the dealt corner, whatever the page's card style: ${c.door ? 'the place (the city and the district with a Directions link; the full visit block stands in the section above)' : c.software ? 'the company (its city and who makes the product)' : 'the studio\'s or company\'s city and what it takes on'}, the contact (the email with Copy, a phone only if given), and the news or the social links; each as tall as what it holds, its heading at the h3 step over three or four lines, never stretched hollow to a set height; the © line, the legal links and Image credits under them. It counts as a row of cards: one section above it in cards at most, never two (\`same-structure\` counts the footer).`],
  ['two-halves', 1, 'Two halves: the left half on the ink (or the accent field the palette names) holds the closing line at the h2 step and the button in the ground colour; the right half on the surface tone holds the links in two short columns, the contact and the legal line. Full width, 50-60svh, the halves meeting on the centre line; on a phone they stack.', ends],
  ['hours-and-place', 1, 'The place, in full: two columns on the surface tone: the opening hours the brief gives (or a lodging\'s season and check-in times) as a real table with tabular figures on the left; the street and district, the nearest stop or the road from the town, a Directions link and the contact on the right; under both the section links, the legal links and Image credits. About 55svh. It is this page\'s visit block: no section above repeats the address, the hours or Directions.', (c) => (c.door && !c.visitShown && c.times ? 1.4 : 0)],
  ['statement-and-row', 0.3, 'A closing statement: one line of five to eight words (the action as a statement) at the display step held to 6vw at most, two lines at most, with the button 32px under it, on the ground; then 96px of space and one band of the surface tone, 120-160px tall, with the links on the left, the contact in the middle, the © line and Image credits on the right. As tall as its content, about 60svh, so the statement, its button and the band share one screen.', ends],
  ['link-columns', 0.3, 'Link columns for a site with pages beyond this one: four or five columns of real links to other pages (product, company, resources, legal), each under a heading at the h4 step; the wordmark and one sentence of what the company does at the top-left; the © line at the foot; on the surface tone, about 50svh. Never the navigation again, never a link that goes nowhere.', (c) => (c.multiPage ? 1.2 : 0)],
  ['picture-and-facts', 1, 'A split footer: a photograph of the subject on the left six columns, from the left margin, 60svh tall; on the right six columns, on the surface tone, the closing line at the h3 step, the button, the contact, the links and the legal line, 32px between the groups.', (c) => ends(c) * (c.few ? 0.3 : c.software ? 0.5 : 1)],
  // (review-007's keepers. The week drawn only from the brief's own hours, never sample ones: a week of one pattern is a
  // third as likely, since seven equal bars say less than one line of text, and a lodging's hours are check-in times.
  // The stair is a closing footer, never on a quiet page; a group's name is no longer its first link, and the line
  // keeps its size on the phone. It stands on the palette's band in the accent where it has one and no section above
  // stands on the accent, with the ink rising; otherwise on the ink, with the surface tone rising: sheet section 4 keeps
  // the accent off every other ground, and an ink footer under a rising ink had no stair)
  ['week-in-bars', 1, 'The opening hours, drawn, on the ink (letters in the ground colour), about 80svh at 1440. At the top in columns 1-8 the live line at the h2 step, worked out in the place\'s time zone: "Open now, until 23:00" or "Closed now, opens Thursday at 8:00"; beside it the street and the district. Under it the week as the brief gives it, never sample hours: seven rows 40px apart, the day\'s name in a 120px column, one time axis shared by all rows to the end of column 9 on which each opening is a 24px bar in the ground colour (lunch and dinner two bars, a closed day an empty axis), and in columns 10-12 the day\'s hours in tabular figures or "Closed". Today\'s row takes the accent where it reads 3:1 on the ink, otherwise weight 600. Every third hour under the axis, no grid lines or ticks; a visually hidden table of the same hours. Then the way there with Directions, the contact, the section and social links, and the legal line with © and Image credits. It is this page\'s visit block: no section above repeats the hours, the street or Directions. On a phone each day is its short name and hours on one line over a 12px bar.', (c) => (c.door && !c.visitShown && !c.software ? { varied: 1, flat: 0.3 }[c.hours] ?? 0 : 0) * (c.sector === 'hospitality' ? 0.5 : 1)],
  ['stepped-close', 1, (c) => { const band = c.accentField && !c.accentShown; const rise = band ? 'the ink' : 'the surface tone'; return `The page ends on a stair of two flat colours, about 85svh at 1440. The footer stands on ${band ? `the palette's band in the accent (\`${c.accentField}\`, lettered in \`${c.accentField}-ink\`; no other section takes it)` : 'the ink, lettered in the ground colour'}, and from its foot ${rise} rises across the full width in one square step, 190px high in columns 1-6 and about 420px in columns 7-12, with no rule or curve between. In columns 1-8, 112px from the top, the closing line of four to seven words at min(var(--step-display), 5.5vw) in the display face's heaviest weight, two lines at most, and 40px under it the dealt button${band ? ' filled with the ground colour, with ink letters' : ''}. On the high step three short groups in ${band ? 'the ground colour' : 'the ink'}, each a name at weight 600 over its links at body size on a 44px step: the sections, the contact with the email, the social links (a group's name is never its own first link). On the low step the wordmark and the legal line with © and Image credits. As the footer arrives the high step rises 120px into place, tied to the scroll, never pinned. On a phone: the line at the h2 step (40px or more) and the button across the content width; under them ${rise}, its right 60% stepping 48px higher, holding the groups one under another, then the wordmark and the legal line.`; }, (c) => ends(c) * (['quiet', 'luxury', 'editorial'].includes(c.tone) ? 0 : c.tone === 'calm' ? 0.5 : 1)],
  // (a near miss, 6 and 7, at half: rewritten on the jurors' sentences, its keys flat with no side that read as a
  // shadow, its letters as large as a heading step, and a keyboard still on the phone; only where the page has eight to
  // eleven real destinations, since the build had fallen back to links that go nowhere)
  ['keyboard-sitemap', 0.5, 'A keyboard of links on the page ground, about 55svh at 1440. Columns 1-4: the wordmark, one sentence of what the product does, the dealt button, the email and the city. Columns 5-12: the page\'s real destinations (its sections, the pages the brief names, the legal pages; never a link to nowhere) as flat keys in three rows, the second starting 44px right of the first and the third 88px right, all ending on one right edge, 8px between keys and 12px between rows. Each key is 72px tall on the surface tone, the dealt corner up to 16px, with no side, border or shadow: its letter at the h4 step in the muted ink at the upper left, its name at body size, weight 500, at the lower left. The last key of the first two rows widens to the edge, and the most used destination closes the third row as a space bar at least 2.5 times the narrowest key. Hover or focus fills a key with the accent; typing g and its letter follows the link at 1024px and wider. The legal line under the keys. On a phone it stays a keyboard: 60px keys in rows of two or three, every other row 24px in.', (c) => (c.software && !c.door && c.links >= 8 && c.links <= 11 ? (['luxury', 'editorial'].includes(c.tone) ? 0 : ['calm', 'quiet'].includes(c.tone) ? 0.5 : 1) : 0)],
];
const ALWAYS_CARDS = 'Cards group what belongs together and give the page its hierarchy: use them in two or three sections (the things a visitor compares or chooses between, the facts that belong together) and let the rest stand on the ground. One card style on the page. Filled, never outlined; no shadow at rest; no icon on top; never a card inside a card (a product window on a card is one), never a card laid half or more over a photograph, never more than one product window on the first screen, never a page built only of cards (`framed-elements`, `boxed-list`, `boxed-page`); the hero headline never in a card.';
const CARDS = [
  ['surface', 0.3, 'Filled cards: the surface tone (one step from the ground), the dealt corner, 32-40px padding, no border, no shadow; a heading at the h3 step, one or two sentences at body size, a link or a price at the foot. Two or three to a row with 16-24px gaps, equal heights; hover steps the fill one tone. On a phone they stack, full width.'],
  ['picture-top', 0.3, 'Picture-led cards: the picture runs to the card\'s top and side edges at 4:3, the words under it on the card\'s surface tone with 24-28px padding: the name at the h4 step, one line of facts, the price or the link. Three to a row on desktop (two for rooms), 24px gaps; the corner on the card, the picture clipped by it; hover scales the picture 3% inside the card. On a phone one to a row.', (c) => (c.few ? 0.4 : 1)],
  ['rows', 0.3, 'Rows with a surface: each item a full-width row on the surface tone, 80-104px tall, 8px apart, the dealt corner: the name at the h4 step on the left, one fact in the middle columns, the price or the link at the right. No line between them, no outline; hover steps the fill. For a menu, the plans, the rooms in short, a schedule. On a phone each row sets its parts on two lines.'],
  ['horizontal', 0.3, 'Horizontal cards: wide cards on the surface tone, the picture on the left 40% (square or 4:5) running to the card\'s edges, the name, two facts and the action on the right 60% with 32-40px padding. Two to a row at 1440, or one to a row across the content width for two or three items. On a phone the picture goes on top.', (c) => (c.few ? 0.4 : 1)],
  ['ink', 0.3, 'Cards in the ink: filled with the page\'s ink colour and lettered in the ground colour (dark cards on a light page, light cards on a dark one), the dealt corner, 36-44px padding. For the groups that must stand out (the plans, the three things a visitor chooses between), in two sections at most; the other groups stand on the ground.'],
  ['one-panel', 0.3, 'One large panel a section: a single filled card in the surface tone, 8-10 columns wide, 48-64px padding, holding one group whole (the price and everything it includes, the visit block, the booking choices), beside or under the section heading on the ground. Nothing framed inside it.'],
  ['overlapping', 1, 'Overlapping cards: a row of three or four filled cards with the dealt corner, in turn the surface tone and the ink (an ink card lettered in the ground colour), so every edge reads with no border, no shadow and no third tone. Each overlaps the one before by 24-32px and sits 24px lower, so the row steps down from left to right; its padding on the covered side is the overlap plus 24px or more, so no word sits under the card above. Hover or focus brings one to the front with a 6px rise. On a phone they stack with no overlap.'],
  ['staggered', 0.3, 'Staggered cards: two columns of filled cards on the surface tone, the right column starting 96-140px lower than the left, 24px gaps, each card holding its picture at its own ratio and its words under it. For four to six items of one kind; on a phone one column, no stagger.', (c) => (c.few ? 0.5 : 1)],
  ['sticky-stack', 1, 'Cards that stack as you scroll: three to five cards across the content width (a corner of 16px or more), in turn the surface tone and the ink (an ink card lettered in the ground colour), so the edge of the card sliding up reads with no border, no shadow and no third tone; each about 70svh tall with its heading at the h2 step, its picture or figure and two lines of text; each sticks 96px below the top as the next slides up over it, the one beneath scaling to 0.96. Native scroll (position: sticky), no pin; reduced motion and phones show them one after another.'],
  // (built as hollow grey boxes at rest, the idea in the hover alone (r14-p64), and as washed-out pictures that read as
  // loading (review-007): now every card is full in a still, and it needs a picture for each)
  ['expanding', 0.3, 'Cards that open, every one full at rest: a row of three or four filled cards on the surface tone, 520-560px tall, each holding its own picture at full colour from its top edge (never dimmed, washed or greyed) and its words on the fill under it. At rest the first stands open across about half the row: its picture over the top 60%, its name at the h3 step and one sentence under it; each of the others is a narrow card about a sixth of the row wide, its picture a tall strip over the top 60% and its name at the h4 step with its one fact under it. Hovering or focusing a narrow card opens it and narrows the open one (grid-template-columns, 400ms); no still ever shows an empty or ghosted card. On a phone they stack, each at its natural height with its picture and its words; everything a visitor needs reads in every card at rest and in the plain fallback.', (c) => (c.few ? 0 : 1)],
  ['poster', 0.3, 'Poster cards: tall cards at 3:4, the picture filling the card to its edges, the name and one fact on a solid foot of the surface tone across the card\'s bottom 88-104px, never on the picture itself. Three or four to a row, 20px gaps; on hover the foot rises 8px to show one more line. For work, rooms, products, places.', (c) => (c.few ? 0.3 : c.software ? 0.6 : 1)],
  ['tall-text', 0.3, 'Tall cards of words, filled top to foot: narrow cards at 4:5 on the surface tone with the dealt corner and 28px padding, four to a row with 16px gaps, the name at the h3 step on two lines at the top, under it two short facts as lines at the lead step (what it includes, for whom), and the price or the link at the foot; a card with less to say is cut to 1:1, never left hollow. Hover steps the fill one tone and moves the link 4px. For services, plans in short, reasons to choose. On a phone they stack at their natural height.'],
  // (review-007's keeper, 7 and 7: the words of every piece centred, so the end pieces' sit as the middle ones' do, and a
  // hover that moves the figure; only on a brief that gives two figures or more (FIGURE), in the sectors the candidate
  // named, never a portfolio)
  ['capsule-set', 1, 'The group as one capsule in two tones: two to four filled pieces in one row across the content width, 8px apart, shaped as one rounded bar: the outer corners of the first and the last piece take half the row\'s height as their radius, every seam stays square (this replaces the dealt corner). The row is 400px tall at 1440, the end pieces a quarter wider than the middle ones. One piece rests in the ink, lettered in the ground colour: the one a visitor should pick (otherwise the first); the others on the surface tone. Each piece is one link holding one centred block clear of the curve: the name at the h4 step, the price or the one fact at the display step (96px at 1440, 64px for four pieces, one line) and one line at body size; no picture. The figures are the brief\'s own, never made up. Hover or focus steps a surface piece one tone and lifts its figure 4px. The page\'s other card group takes the same capsule cut in two; never two capsules in one view. On a phone: one upright capsule, the pieces stacked 8px apart, the end pieces at least 320px tall and rounded on their outer end, the figure at 56px.', (c) => (CAPSULE_SECTORS.includes(c.sector) && c.figures >= 2 ? { luxury: 0.3, editorial: 0.6, technical: 0.7 }[c.tone] ?? 1 : 0)],
  // (two near misses, 7 and 6, at half, rewritten on the jurors' sentences: the specimens on cards of two fills, each as
  // tall as what it holds, the side cards' text readable; the dealt hand's names heavy, one card to a row on a phone so
  // no tilt reaches the margin, and in the ink and the surface tone, since no card is filled with the accent (sheet
  // section 4); one tilted thing a page: `tilts`)
  ['specimen-cards', 0.5, 'Cards whose face is the product\'s own work, as a triptych on one centre line, 24px apart, in the dealt corner: the centre card 6 columns wide in the ink (letters in the ground colour), the two beside it 3 columns wide on the surface tone, each as tall as what it holds plus 40px of padding. Each holds one specimen of what the product makes as live text, never a screenshot or a window: a paragraph of the user\'s writing with the tool\'s one change marked (struck words in the muted ink, the replacement in the accent or underlined 2px), a note with its linked words underlined, a question with its answer and two sources; at 22px in the centre card (60 words at most), 18px at the sides (30 at most). Under it the feature\'s name at the h4 step and one line at body size. The finished state rests, so a still shows the result; the change plays once as the card comes into view. Never in a section with the product\'s window. On a phone the centre card first, all three at the content width.', (c) => (c.software ? (c.tone === 'luxury' ? 0.3 : c.tone === 'playful' ? 0.7 : 1) : 0)],
  ['dealt-deck', 0.5, 'Cards laid on the table like a dealt hand: three to five filled cards with the dealt corner in one row, centred, 40px apart, each turned about its centre by an angle fixed for its place (-2.5°, 1.5°, -1°, 2°, -1.5°), never overlapping, their corners 16px apart or more and inside the margins. In turn the ink (lettered in the ground colour) and the surface tone, the first in the ink. Each holds, 28px in, the name at the h2 step in the display face\'s heaviest weight, one line at body size and the price or the fact at the h4 step at its foot, as tall as its words; where the items have pictures, the picture inset 16px at the top at 4:3. The deal plays once as the row arrives (the cards fly from one squared pile to their places, 90ms apart), and a still shows them dealt. Hover or focus straightens a card and raises it 8px. For the three things to try, the dishes of the day, the hosts, a small range. On a phone one card to a row at the content width less 16px, at a third of the angle.', (c) => ({ luxury: 0.2, technical: 0.4, quiet: 0.4, editorial: 0.6, calm: 0.7 }[c.tone] ?? 1) * (c.creative ? 1.3 : c.software ? 0.6 : 1)],
];
// One button family on a page (round 12: r12-p53 had three unrelated shapes): the dealt button and at most one quieter
// sibling, and no pattern brings a shape of its own
// (the family is the shape, fill, type and hover; the size written for it holds where the action stands out, and the
// navigation, a card or a form sets its own height: a 72px block in a 56px bar asked for the impossible)
const ALWAYS_BUTTONS = 'One button family on the whole page: this button, and at most one quieter sibling for the second action (the label alone with this button\'s arrow where it has one, or the same shape in the surface tone). The family is its shape, fill, type and hover, and every button on the page takes them: the navigation\'s action, the hero, the sections, the cards, the forms and the footer. It keeps the size written here in the hero, the sections and the footer; in the navigation, on a card and in a form it takes the height that part gives it (40-48px where it names none). Where a hero, section, card, footer or navigation above or below names a button of its own (a pill, a play disc, a 64px block, a split button), build this one in its place (`button-family` fails three unrelated shapes). The primary action takes it on the first screen (a real button, 44px or taller). Sentence case, no tracked capitals, no gradient, no shadow, no outline as the only shape. Where the brand has its own button, the brand\'s wins (say so in the report). One action once a screen, the bar\'s included (`duplicate-action` fails two buttons, or a button and a link, to one place on one screen): the bar\'s action and the hero\'s button go to different places, or the bar\'s action comes in once the hero\'s button has scrolled away; a fixed bar\'s action steps aside while a section\'s or the footer\'s button to its place or under its label is on the screen; each card of a group sends to its own place (a plan\'s sign-up with that plan chosen).';
const BUTTONS = [
  ['pill-accent', 0.3, 'Pills: fully round, 48px tall, 24px side padding, the text face at 16px weight 500, filled with the accent; hover darkens the fill one step, press scales to 0.97. The second action is a text link at the same size in the ink with an arrow (→) that moves 4px on hover.', (c) => (c.tone === 'luxury' ? 0.4 : c.tone === 'playful' || c.tone === 'warm' ? 1.4 : 1)],
  ['pill-large-ink', 0.3, 'Large pills in the ink: fully round, 60-64px tall, 32px padding, the text face at 18-20px weight 500, filled with the ink and lettered in the ground colour; hover turns the fill the accent. The second action is the same pill in the surface tone with ink letters.', (c) => (c.tone === 'bold' || c.tone === 'playful' ? 1.4 : 1)],
  ['square-block', 0.3, 'Square blocks: no radius, 56px tall, 28-32px padding, the text face at 17px weight 600, filled with the ink; hover swaps the fill to the accent in 160ms. The second action is the label alone in the ink, underlined on hover.', (c) => (c.tone === 'playful' ? 0.4 : c.tone === 'technical' || c.tone === 'editorial' ? 1.4 : 1)],
  ['wide-split', 0.3, 'Wide bars with a split label: square or the dealt corner, 60-64px tall, as wide as four grid columns, the label at the left inner edge and an arrow (→) at the right inner edge, the text face at 18px weight 500, filled with the accent; hover slides the arrow 6px right. The second action is a plain text link. On a phone the bar runs the full content width.'],
  ['soft-accent', 1, 'Soft rectangles: 8px radius, 44-48px tall, 20px padding, the text face at 15-16px weight 600, filled with the accent; hover lightens the fill one step, press darkens it. The second action is the same shape in the surface tone with ink letters.', (c) => (c.software ? 1.3 : 1)],
  ['soft-large', 0.3, 'Large soft buttons: 14px radius, 56px tall, 28px padding, the text face at 18px weight 500, filled with the ink on a light page or the accent on a dark one; press scales to 0.98. The second action is a text link at the same size with an arrow (→).'],
  ['circle-arrow', 1, 'A label with a round arrow: the label at 18-20px in the ink, weight 500, then 12px on a 52-56px circle filled with the accent holding an arrow in the accent\'s ink; label and circle are one link, 56px tall; hover turns the arrow 45° and slides the label 4px. The second action is the label alone, without the circle.', (c) => (c.software ? 0.6 : 1)],
  ['fact-inside', 1, 'Buttons that carry the fact: 4-6px radius, 52px tall, the label, 16px of space and the price, time or date the brief gives on the same line in the regular weight ("Book a room · from 140 €"), the text face at 16px, the label at weight 600, filled with the accent. In the navigation the action carries the label alone (a label and a fact read as a sentence there). The second action is a text link.', (c) => (c.fact ? (c.door || ['physical-product', 'ecommerce', 'event'].includes(c.sector) ? 1.4 : 0.6) : 0)],
  ['rolling-label', 0.3, 'Rolling labels: 4px radius, 52px tall, 24px padding, the text face at 16px weight 600, filled with the accent; on hover the label rolls up out of the button and a copy rolls in from below (two stacked spans, translateY, 280ms, clipped by the button); reduced motion swaps the fill instead. The second action is a text link that rolls the same way.'],
  ['wipe-fill', 0.3, 'A fill that wipes in: fully round, 52px tall, 28px padding, the text face at 16px weight 500; at rest the surface tone with an ink label, on hover the accent wipes in from the left (a scaleX layer behind the label, 300ms) and the label turns the accent\'s ink. The second action is a text link.'],
  ['big-block', 1, 'Big blocks: square, 72px tall, 280px wide or more, the text face at the h4 step, weight 600, filled with the accent, the label at the left; hover darkens the fill. For the one action of a confident page. The second action is a text link at the same size.', (c) => (c.tone === 'bold' || c.creative ? 1.4 : c.tone === 'quiet' || c.tone === 'luxury' ? 0.4 : 1)],
  ['slim-ink', 0.3, 'Slim buttons: 4px radius, 44px tall, 18px padding, the text face at 15px weight 500, filled with the ink; the second action is the same shape in the surface tone. Quiet and exact, for a page of a lot of content.', (c) => (c.tone === 'luxury' || c.tone === 'quiet' || c.software ? 1.3 : 1)],
  // (review-007's keeper, 7 and 7, only for a writing, notes, document or publishing product and for a publisher or a
  // literary festival with no door (PAPER: never dev tools, finance or a museum); the sibling that faded into a ground of
  // its own tone now stands a full step from what is under it)
  ['dog-ear', 1, 'Buttons that are pages: a filled block in the ink (the accent on a dark page), 56px tall in the hero, the sections and the footer, square at three corners and its top-right corner folded down: a 20px diagonal cut with the fold\'s back inside it as a 20px triangle in the accent (in the ink on an accent block). The label in the text face at the body step in the dealt weight, sentence case, in the ground colour, 28px in from the left and 36px from the right, so the fold stays clear of it. Hover or focus deepens the fold to 28px (320ms) and steps the fill one tone; press flattens it to 12px. The second action is the same folded block with ink letters, on the surface tone over the ground and on the ground colour over a surface panel, a full step from what is under it. In the navigation, on a card and in a form: 44px with a 14px fold. On a phone the block runs the content width at 56px with the same fold.', (c) => (((['saas', 'ai-product', 'consumer-app'].includes(c.sector) && c.software) || (c.sector === 'culture' && c.tone === 'editorial' && !c.door)) && c.paper ? (['playful', 'bold'].includes(c.tone) ? 0.4 : 1) : 0)],
  // (a near miss, 7 and 6, at half: the hero's sticker aligned with everything round it on the phone, and its label at a
  // weight the face really has. The button that carries a key letter is not dealt: a juror read it as a real company's)
  ['tilted-sticker', 0.5, 'One sticker, everything else level: every button is a filled block in the accent, 56px tall in the hero, the sections and the footer, 28px side padding, the dealt corner held between 12px and 20px (never a pill), its label in the display face at the lead step (20-22px) at the face\'s heaviest real weight (in the text face at 700 where the display face has one weight), sentence case, in the accent\'s ink. Only two are tilted: the hero\'s primary at -3°, the only tilted thing on the first screen, and the footer\'s closing primary at +2°; every other button stands level in the same fill, corner and face. Hover or focus straightens a sticker (300ms); a level one steps its fill one tone. The second action is a level text link in the ink at the lead step, underlined 2px. On a phone the hero sticker keeps its -3° and 56px, aligned to the left margin with everything round it (8px in, so its corners stay inside); level buttons run the content width.', (c) => (['restaurant', 'consumer-app', 'event', 'music', 'physical-product', 'ecommerce'].includes(c.sector) ? 1 : 0.3) * ({ playful: 1.5, bold: 1.2, warm: 1.2, luxury: 0.2, quiet: 0.2, calm: 0.2, editorial: 0.2 }[c.tone] ?? 1) * (['finance', 'dev-tool', 'saas'].includes(c.sector) ? 0.5 : 1)],
];
// the sectors the capsule's figures belong to (the candidate's list: plans, sizes, seasons, a menu's parts; never a
// portfolio)
const CAPSULE_SECTORS = ['consumer-app', 'finance', 'health', 'education', 'ecommerce', 'physical-product', 'restaurant', 'event', 'nonprofit', 'saas'];
// What each tested design must show once built (the sheet's "Must show" line, as the study's patterns carry one): the
// one thing that tells it from the plain bar, the one-line footer and the stock card (review-004: a masthead built as a
// plain bar after one screen, a footer cut to a line).
const SIGNATURES = {
  nav: {
    'chapter-band': 'The centre of the fixed 56px band shows the name of the section in view and swaps it by sliding the old name up out of a mask.',
    'centred-logo': 'The wordmark stands centred between the links at the left and the action at the right, and stays centred in the fixed 56px band after the hero.',
    'floating-pill': 'An opaque capsule as wide as its content floats 16px below the top edge, centred, with the action as its accent end, on every screen.',
    'menu-button': 'At every width only the wordmark and a Menu button beside the action; Menu opens a full-screen panel on the ink with the section names at the h2 step.',
    shrinks: 'A 104-120px bar with the wordmark at the h2 step over the hero that settles into a fixed 56-64px band after 80px of scroll.',
    'side-index': 'At 1200px and wider the section names stand as a sticky list in columns 1-2, the current one at weight 600, with all content in columns 3-12.',
    'bottom-dock': 'The links and the action live in a capsule in the ink fixed 20px above the bottom edge; at the top only the wordmark.',
    corners: 'No bar: the wordmark top-left and the action top-right on small solid tabs, fixed on every screen.',
    masthead: 'Two centred rows over the hero, the wordmark at the h2 step over the links; past the hero a fixed 56px band of the links with the wordmark small at its left.',
    'ink-band': 'A full-width 60-64px band filled with the ink, its wordmark, links and action in the ground colour, fixed on every screen.',
    'contained-bar': 'A filled bar inside the page margins, 16px below the top edge, in the surface tone with the dealt corner, never full width.',
    'big-links': 'The section names as links at the h3 step spread across the top of the first screen; past the hero they fold into a Menu tab beside the wordmark.',
    'window-toolbar': 'The navigation is the top of the hero\'s product window: the wordmark, the section links as the product\'s views in words at body size and the action sit on the window\'s toolbar beside the headline, and past the hero that toolbar stays fixed where it stood.',
  },
  footer: {
    'closing-columns': 'A closing line at the h2 step with its one button, then three or four short columns 96px below, on the surface tone, about 60svh, all on one screen.',
    'contact-block': 'On the ink: the heading at the h2 step on the left half, the email at the h3 step with a Copy button on the right half.',
    'sitemap-grid': 'Four or five columns of real links, each under a short heading in the display face, with the wordmark at the h3 step top-left.',
    'picture-footer': 'A full-bleed photograph of 55-65svh carrying the closing line and the button, over a 30svh band of contact, links and legal line.',
    'newsletter-card': 'One filled card across eight columns with a sentence at the h3 step and the email field and its button in one row.',
    'big-link-list': 'The sections and Contact stacked as links at the h2 step in the display face on the ink, the contact at body size in the right third.',
    'three-cards': 'Three filled cards in a row on the surface tone, each as tall as its heading at the h3 step and the three or four lines under it.',
    'two-halves': 'Two halves meeting on the centre line: the closing line and button on the ink at the left, the links and contact on the surface tone at the right.',
    'hours-and-place': 'The opening hours as a real table beside the street, the way there and Directions, in two columns on the surface tone.',
    'statement-and-row': 'One line at the display step (6vw at most) with its button on the ground, then 96px of space and one band of the surface tone with the links, contact and legal line, all on one screen.',
    'link-columns': 'Four or five columns of links to real pages beyond this one, with the wordmark and one sentence at the top-left.',
    'picture-and-facts': 'A 60svh photograph on the left six columns beside the closing line, the button, the contact and the links on the surface tone.',
    'week-in-bars': 'The week\'s opening hours from the brief drawn as bars on one time axis on the ink, each day\'s hours written beside its bars and today\'s row set apart, under a live line at the h2 step saying whether the place is open now.',
    'stepped-close': 'Two flat colours locked in one square stair step across the full width: the closing line in the heaviest weight with its button on the upper one, the links on the high step of the lower one.',
    'keyboard-sitemap': 'Three offset rows of flat filled keys ending on one right edge, each key its letter at the h4 step over its name, a wide space bar closing the third row, beside the company block.',
  },
  cards: {
    surface: 'Filled cards one tone from the ground, two or three to a row at equal heights, a heading at the h3 step and a link or price at the foot.',
    'picture-top': 'The picture runs to the card\'s top and side edges at 4:3, the words under it on the card\'s fill.',
    rows: 'Full-width filled rows 80-104px tall, 8px apart: the name at the left, one fact in the middle, the price or link at the right.',
    horizontal: 'Wide cards with the picture on the left 40% running to the card\'s edges and the name, two facts and the action on the right.',
    ink: 'Cards filled with the ink and lettered in the ground colour, in two sections at most.',
    'one-panel': 'One large filled panel 8-10 columns wide holding one whole group, beside or under its heading.',
    overlapping: 'A row of three or four cards, in turn the surface tone and the ink, each overlapping the one before by 24-32px and sitting 24px lower.',
    staggered: 'Two columns of filled cards, the right column starting 96-140px lower than the left.',
    'sticky-stack': 'Cards about 70svh tall, in turn the surface tone and the ink, each sticking 96px below the top as the next slides over it.',
    expanding: 'A row of filled cards, each with its own picture at full colour and its name at rest: the first open across about half the row with a sentence, the others narrow strips of picture over their name and one fact.',
    poster: 'Tall 3:4 cards with the picture to their edges and the name on a solid foot of the surface tone across the bottom.',
    'tall-text': 'Narrow 4:5 cards of words, four to a row, filled top to foot: the name at the h3 step on two lines, two facts at the lead step under it, the price or the link at the foot.',
    'capsule-set': 'One rounded bar cut into two to four pieces 8px apart, one piece in the ink, each piece showing its price or fact at the display step, centred.',
    'specimen-cards': 'Three cards on one centre line, the wide centre one in the ink, each face a live specimen of the product\'s own output with its one change marked, and no window round it.',
    'dealt-deck': 'Three to five cards lying at small fixed angles in one row, in turn the ink and the surface tone, each name at the h2 step in the heaviest weight.',
  },
  buttons: {
    'pill-accent': 'Fully round 48px pills in the accent; the second action a text link with an arrow that moves 4px on hover.',
    'pill-large-ink': 'Large fully round pills in the ink, 60-64px tall in the hero and the sections, that turn the accent on hover.',
    'square-block': 'Square 56px blocks in the ink with no radius that swap to the accent on hover.',
    'wide-split': 'Bars four grid columns wide and 60-64px tall in the hero and the sections, the label at the left and an arrow at the right that slides 6px on hover.',
    'soft-accent': '8px-radius buttons 44-48px tall in the accent; the second action the same shape in the surface tone.',
    'soft-large': '14px-radius buttons 56px tall, in the ink on a light page or the accent on a dark one.',
    'circle-arrow': 'A label followed by a 52-56px circle in the accent holding an arrow that turns 45 degrees on hover; label and circle are one link.',
    'fact-inside': 'The label and its price, time or date on one line inside a 52px button in the accent.',
    'rolling-label': 'Accent buttons 52px tall with 4px corners and the label at weight 600, the second action a text link; on hover the label rolls up and a copy rolls in from below.',
    'wipe-fill': 'A fully round button in the surface tone that the accent wipes across from the left on hover.',
    'big-block': 'Square blocks in the accent, 72px tall and 280px wide or more in the hero and the sections, the label at the h4 step at the left.',
    'slim-ink': 'Slim 44px buttons in the ink with a 4px radius; the second action the same shape in the surface tone.',
    'dog-ear': 'Square ink blocks with the top-right corner folded down 20px, the fold\'s back an accent triangle, on every button including the navigation\'s.',
    'tilted-sticker': 'One accent sticker tilted -3° in the hero, its heavy label in the display face, the only tilted thing on the first screen; every other button the same block standing level.',
  },
};
const CORNERS = [
  [{ id: 'square', radius: '0' }, 3, 'Square corners on pictures, cards, panels and fields.'],
  [{ id: 'hint', radius: '4px' }, 2.5, 'A 4px radius on cards, panels and fields; pictures square or at the same 4px.'],
  [{ id: 'soft', radius: '10px' }, 2, 'A 10px radius on cards, panels and pictures alike.'],
  [{ id: 'round', radius: '16px' }, 1.5, 'A 16px radius on cards and panels; pictures at 16px or square inside a card.'],
  [{ id: 'large', radius: '24px' }, 1, 'A large 24px radius on cards, panels and pictures, as consumer apps do.'],
];
// The space between sections starts at about 16vh at 1440 (144px by a 900px screen): pages with 80-140px between
// sections read as cluttered to the owner (October 2026), the next section already in view. The hero fills the
// first screen alone whatever is dealt here.
// gap and margin are the CSS the sheet prints for each (references/layout.md §2): the gap reaches the range at 1440 by
// 900 and at 390 by 844 alike (9vh + 5vw is 153px on the one and 96px on the other)
const SPACING = [
  [{ id: 'standard', section: '16-20vh', margin: '32-48px', gap: 'clamp(6rem, 9vh + 5vw, 11.25rem)', marginCss: 'clamp(1.25rem, 3vw, 3rem)' }, 3, 'Standard: 16-20vh between sections (about 144-180px at 1440 by 900, 96-120px on a phone), page margins 32-48px at 1440 and 20px on a phone.'],
  [{ id: 'airy', section: '22-28vh', margin: '48-72px', gap: 'clamp(7rem, 12vh + 7vw, 15.75rem)', marginCss: 'clamp(1.5rem, 4.5vw, 4.5rem)' }, 3, 'Airy: 22-28vh between sections (200-250px at 1440, 112-140px on a phone), page margins 48-72px at 1440 and 24px on a phone.'],
  [{ id: 'open', section: '30-36vh', margin: '40-64px', gap: 'clamp(8rem, 14vh + 10vw, 20rem)', marginCss: 'clamp(1.5rem, 4vw, 4rem)' }, 2, 'Open: 30-36vh between sections (270-320px at 1440, 128-160px on a phone), page margins 40-64px at 1440 and 24px on a phone; one section to a screen at most.'],
];
// Black-and-white is never dealt at random (weight 0): it greyed a notes app's one photograph (r9-p41) and a house
// named white (r6-p30). It is the treatment only where the brief itself asks for black and white.
const TREATMENT = [
  ['natural', 5, 'Pictures in natural colour, as shot, with matching light; no filters, no tints, no grain.'],
  ['one-grade', 1.5, 'One grade over every picture (slightly warm or slightly cool, a little lifted shadows), the same on all of them.'],
  ['mono', 0, 'Black-and-white pictures, all of them, as the brief asks, with the page\'s one accent as the only colour.'],
  ['cut-out', 0.6, 'Objects cut out on the page ground (product shots with no background), people and places in natural colour.'],
];
// ("black-and-white photographs", "pictures in black and white", "shoots in black and white", "prints are all in
// monochrome", "pictures should be black and white"; never a black-and-white logo). draw.mjs vetoes it where the
// pictures carry colour (a café whose walls are hung with black-and-white photographs keeps its food in colour)
const BW = '(?:black[- ](?:and|&)[- ]white|b ?& ?w|monochrome|gr[ae]yscale)';
export const BW_BRIEF = new RegExp(`\\b${BW}\\s+(?:photo\\w*|pictures?|images?|imagery|film|portraits?|prints?)\\b|\\b(?:photo\\w*|pictures?|images?|imagery|portraits?|prints?|works?|shot|shoots?|shooting|printed)\\s+(?:(?:are|is|all|only|always|entirely|should|must|will|be|stay)\\s+){0,2}(?:in\\s+)?${BW}(?![- ](?:logo|sign|tiles?|floor))`, 'i');
const INTERACTION = [
  ['none', 5, 'No interactive widget. The page is read: its content, pictures and motion carry it. Controls are the navigation, the links, the action and any real form.'],
  // (a load gauge and a range planner only for a product: a motion designer's sheet named them)
  ['tool', 2.5, (c) => `One working tool the visitor would really use, built from the subject's content (${c.product ? 'a load gauge or a range planner from the product\'s own figures, a size or price calculator, a configurator' : 'a price or size calculator, a booking with real dates, a filter over the real list'}). Not a toy, not a demo of the page's own design. It works on a phone with a thumb and has a plain fallback.`],
  ['product', 1.5, 'The product itself, operable in one place: a real fragment of the interface the visitor can click through (software), or a view of the object they can turn or switch (colour, size). Only where the subject has a product to operate.'],
];
const CLIP = [
  ['none', 5, 'No video. Motion comes from the page itself.'],
  ['one-clip', 2, 'One moving picture of the subject: a muted loop with a poster frame and a pause control, used once, large. Only if an honest clip of this subject exists.'],
  ['slow-picture', 1.5, 'One photograph that moves slowly as the page scrolls (a scale or drift of a few percent), once.'],
];
// the rules every design of a part shares, printed under it on the sheet
export const FRAME_RULES = { nav: ALWAYS_NAV, footer: ALWAYS_FOOTER, closingFooter: CLOSING_FOOTER, cards: ALWAYS_CARDS, buttons: ALWAYS_BUTTONS };
// every design of the parts with many, for counting and listing
export const FRAME_DESIGNS = { nav: NAV.map((x) => x[0]), footer: FOOTER.map((x) => x[0]), cards: CARDS.map((x) => x[0]), buttons: BUTTONS.map((x) => x[0]) };
// a tested design's text for the page as it now stands (draw.mjs writes the stair footer again for a new palette, hero or
// sections: it names the band it stands on)
export function designText(key, id, ctx) { const x = { nav: NAV, footer: FOOTER, cards: CARDS, buttons: BUTTONS }[key]?.find((y) => y[0] === id); return x && (typeof x[2] === 'function' ? x[2](ctx) : x[2]); }

// history: the frames of the last draws, newest first ({ nav: id, footer: id, … } each); recent: the last one alone
// (older callers). ctx: what the page is (see the top). bw: whether the brief asks for black-and-white pictures
// (draw.mjs decides, with its colour veto). patterns: { nav, footer, card, button } lists from loadPatterns, and pc the
// page as fitPool reads it (draw.mjs, patternCtx); without them the twelve designs of each part are dealt alone. keep:
// the parts to keep as they are, when one part is dealt again ({ ...frame, footer: null }); tried: the ids this sheet
// has had for a part ({ footer: [id, …] }), left out while others fit (once put at the head of the history, they took
// the place of real draws there, and a footer came back nine pages on).
export function dealFrame({ rnd, input, imagery, history = null, recent = {}, ctx = {}, bw = BW_BRIEF.test(input.brief || ''), patterns = null, pc = null, keep = null, tried = null }) {
  const hist = (history || [recent]).filter(Boolean);
  const wpick = (pairs) => { const t = pairs.reduce((s, x) => s + x[1], 0); let r = rnd() * t; for (const x of pairs) { r -= x[1]; if (r <= 0) return x; } return pairs.at(-1); };
  const idOf = (x) => x[0]?.id ?? x[0];
  // the parts with many designs: one used in the last nine draws is out (while three others fit), and each is weighed
  // down by how often the history holds it, so a run of draws cycles through the whole set, the patterns included
  // (none on more than about one page in ten)
  // (when fewer fit, as on a door place with a booking block and a closing scene, the ones of the last nine come back,
  // the longest unused first and never the last draw's while another fits: round 11 dealt one footer twice running)
  const away = (key, pairs) => {
    const w = pairs.map((x) => {
      const at = hist.findIndex((h) => h?.[key] === idOf(x));
      const damp = x[1] / (1 + hist.filter((h) => h?.[key] === idOf(x)).length);
      return { x, at, v: damp * (at >= 0 && at < RECENT_OUT ? 0 : 1), back: damp * comeBack(at) };
    });
    const live = w.filter((e) => e.v > 0);
    const pool = live.length >= 3 ? live : w.filter((e) => e.at !== 0).length ? w.filter((e) => e.at !== 0) : w;
    return pool.map((e) => [e.x[0], e.v || e.back, e.x[2], e.x[3]]);
  };
  // the parts with few: the last draw's is about a third as likely
  const not = (key, pairs) => pairs.map((x) => [x[0], x[1] * (hist[0]?.[key] === idOf(x) ? 0.35 : 1), x[2]]);
  const tone = input.tone;
  const software = imagery === 'interface';
  // link columns belong to sites with pages beyond this one (software, shops); a one-page site (a portfolio, a
  // studio, a restaurant, a house, an event) that got them repeated its own navigation in the footer
  const multiPage = software || ['ecommerce', 'physical-product'].includes(input.sector);
  // (and the facts the brief gives, for the designs that print them: its hours, a lodging's season, a price, a time or a
  // date, its figures, a trade of writing and paper, and the destinations a keyboard of links holds: the sections, the
  // pages the brief names and the two legal pages)
  const brief = String(input.brief || ''); const hours = briefHours(brief);
  const c = { tone, sector: input.sector, software, multiPage, product: ['physical-product', 'ecommerce'].includes(input.sector), creative: ['bold', 'playful'].includes(tone) || ['agency', 'studio-portfolio', 'personal-portfolio', 'music', 'fashion', 'event', 'culture'].includes(input.sector), hours, times: !!hours || (input.sector === 'hospitality' && SEASON.test(brief)), fact: !!hours || FACT.test(brief), figures: [...brief.matchAll(FIGURE)].length, paper: PAPER.test(brief), links: (ctx.sectionCount || 0) + 2 + new Set([...brief.matchAll(PAGES)].map((m) => m[0].toLowerCase())).size, ...ctx };
  // (a design whose text depends on the page, a door or none, is written here)
  const fit = (list) => list.map((x) => [x[0], x[1] * (x[3] ? x[3](c) : 1), typeof x[2] === 'function' ? x[2](c) : x[2]]).filter((x) => x[1] > 0);
  // The study's patterns of one part beside its designs: fitted to the page (fitPool, its assets and quality with it),
  // kept to what can be that part under the house rules (partUsable), so a pattern scored 4 is half as likely as a
  // tested design and a 5 or more three times as likely or more (GOOD_LIFT, below), and weighed by the same reasons the
  // designs give (a hero whose headline is the name, a closing scene, an email form elsewhere, a door, few pictures).
  // Each part is dealt in turn, so a pattern that names a clash with one already dealt (avoidWith) is left out.
  const dealt = new Set(pc?.dealt || []); const avoid = new Set(pc?.avoid || []);
  // (one tilted thing a page: none once the hero, a section or a kept part turns one, and none after a part dealt here
  // does)
  let askew = !!c.tilted || ['nav', 'footer', 'cards', 'buttons'].some((k) => tilts(keep?.[k]?.text));
  const pats = (part, list, adjust = () => 1) => {
    if (!pc || !list?.length) return [];
    return fitPool(list.filter((e) => partUsable(part, e)), { ...pc, dealt, avoid }, 3)
      .map(([e, w]) => {
        const closes = part === 'footer' && closingPattern(e);
        const text = patternText(e) + (part === 'nav' && largeMark(e) ? ` ${NAME_MARK}` : '');
        return [e.id, w * PATTERN_SHARE.frame * adjust(e, closes), text, { pattern: true, quality: e.quality, name: e.name || e.id, avoidWith: e.avoidWith || [], ...(e.signature ? { signature: e.signature } : {}), ...(closes ? { closes } : {}) }];
      })
      .filter((x) => x[1] > 0);
  };
  const pictured = (e) => patternPictures(e) > 0 || says(e.description, /\bphoto(?:graph)?s?\b|\bpictures?\b|\bimages?\b|\bvideo\b/i);
  const take = (x) => { dealt.add(String(x[0]).toLowerCase()); for (const a of x[3]?.avoidWith || []) avoid.add(String(a).toLowerCase()); askew ||= tilts(x[2]); return x; };
  // (a button that is a shell command only for a product that has one: a developer tool, or a brief that names its
  // command line; round 12's first run gave an invoicing app a copy-the-install-line button)
  const command = input.sector === 'dev-tool' || /\b(?:CLI|command[- ]line|terminal|npm|pip|brew|install)\b/i.test(input.brief || '');
  // (a tested design whose Must show line a still cannot confirm is not dealt either: rolling-label, the slightly
  // rounded rectangle and a hover)
  const shown = (key, list) => list.filter((x) => !hoverOnly(SIGNATURES[key]?.[x[0]]));
  // (the designs and patterns that tilt, skew or turn a thing, the dealt hand, the tilted sticker, a skewed tag, a picture
  // masked at 45°, once the page has one)
  const level = (list) => (askew ? list.filter((x) => !tilts(x[2])) : list);
  const pools = {
    nav: () => level([...fit(shown('nav', NAV)), ...pats('nav', patterns?.nav, (e) => (largeMark(e) && c.nameHero ? 0.3 : 1))]),
    footer: () => level([...fit(shown('footer', FOOTER)), ...pats('footer', patterns?.footer, (e, closes) => {
      if (closes && c.closingScene) return 0;
      if (c.emailElsewhere && says(e.description, /\bnewsletter\b|\be-?mail (?:field|form|input)\b|\bsign-?up\b/i)) return 0;
      // (a footer that prints opening hours only where the brief gives them: "address and hours", "the city and hours"
      // too, which round 11f's first deal gave a museum with none)
      if (says(e.description, PLACE_HOURS) || says(e.description, /\bDirections\b/)) return c.door && !c.visitShown && (c.times || !says(e.description, PLACE_HOURS)) ? 1.4 : 0;
      return pictured(e) ? (c.few ? 0.3 : c.software ? 0.5 : 1) : 1;
    })]),
    cards: () => level([...fit(shown('cards', CARDS)), ...pats('card', patterns?.card, (e) => (c.few && pictured(e) ? 0.4 : 1))]),
    // (nor a label in the pairing's serif on a page whose pairing has none)
    buttons: () => level([...fit(shown('buttons', BUTTONS)), ...pats('button', patterns?.button, (e) => ((says(e.description, /\bshell command\b|\bcode face\b/i) && !command) || (c.serif === false && needsSerif(e.description)) ? 0 : 1))]),
  };
  // The parts in a random order: in each the patterns scored 5 or more (GOOD_FRAME) weigh three times as much
  // (GOOD_LIFT) while the library has fewer than three parts (LIBRARY_MOST), and once it has three, the part goes to the
  // tested designs while three of them are fresh (never a part back within ten pages for the cap's sake: a software run
  // dealt one footer four pages apart). keep: the parts of a frame already dealt (a redeal of one part), counted and not
  // dealt again.
  const lift = (x) => (x[3]?.pattern && x[3].quality >= GOOD_FRAME ? [x[0], x[1] * GOOD_LIFT, x[2], x[3]] : x);
  const got = {}; let library = Object.values(keep || {}).filter((x) => x?.pattern).length;
  for (const [key] of Object.keys(pools).filter((k) => !keep?.[k]).map((k) => [k, rnd()]).sort((a, b) => a[1] - b[1])) {
    const every = pools[key](); const left = every.filter((x) => !(tried?.[key] || []).includes(x[0]));
    const pool = left.length ? left : every; const tested = pool.filter((x) => !x[3]?.pattern);
    const fresh = (x) => { const at = hist.findIndex((h) => h?.[key] === x[0]); return at < 0 || at >= RECENT_OUT; };
    got[key] = take(wpick(away(key, library < LIBRARY_MOST ? pool.map(lift) : tested.filter(fresh).length >= 3 ? tested : pool)));
    if (got[key][3]?.pattern) library++;
  }
  const { nav, footer, cards, buttons } = got;
  // (each with what it must show: the pattern's signature, or the tested design's)
  const part = (x, key, extra = {}) => {
    const signature = x[3]?.signature || SIGNATURES[key]?.[x[0]];
    return { id: x[0], text: x[2], ...(signature ? { signature } : {}), ...(x[3]?.pattern ? { pattern: true, name: x[3].name, avoidWith: x[3].avoidWith } : {}), ...extra };
  };
  const corners = wpick(not('corners', CORNERS.map((x) => [x[0], x[1] * (tone === 'luxury' && x[0].id === 'large' ? 0.2 : tone === 'playful' && x[0].id === 'square' ? 0.5 : 1), x[2]])));
  const spacing = wpick(not('spacing', SPACING.map((x) => [x[0], x[1] * (tone === 'luxury' && x[0].id === 'open' ? 2 : multiPage && x[0].id === 'open' ? 0.5 : 1), x[2]])));
  // (cut-outs are product shots: only from the client's own photographs, since a stock cup cut out on the ground passes
  // for the café's own drink and another maker's object for the client's product)
  const treatment = bw ? TREATMENT.find((x) => x[0] === 'mono') : wpick(not('treatment', TREATMENT.filter((x) => x[1] > 0).map((x) => [x[0], x[1] * (x[0] === 'cut-out' ? (imagery !== 'own' && !software ? 0 : software ? 0.3 : 1) : 1), x[2]])));
  // a physical product takes a working tool more often than none (r11-p50 lost a cargo-bike page whose judge remembered
  // the reference's load gauge and range planner)
  const interaction = wpick(not('interaction', INTERACTION.map((x) => [x[0], x[1] * (x[0] === 'product' && !(software || c.product) ? 0 : 1) * (input.sector === 'physical-product' ? { none: 0.4, tool: 2 }[x[0]] ?? 1 : 1), typeof x[2] === 'function' ? x[2](c) : x[2]])));
  const clip = wpick(not('clip', CLIP.map((x) => [x[0], x[1] * (software && x[0] === 'one-clip' ? 0.5 : 1), x[2]])));
  return {
    nav: keep?.nav || part(nav, 'nav'), footer: keep?.footer || part(footer, 'footer', CLOSING_FOOTERS.has(footer[0]) || footer[3]?.closes ? { closes: true } : {}),
    cards: keep?.cards || part(cards, 'cards'), buttons: keep?.buttons || part(buttons, 'buttons'),
    corners: { ...corners[0], text: corners[2] }, spacing: { ...spacing[0], text: spacing[2] },
    treatment: { id: treatment[0], text: treatment[2] }, interaction: { id: interaction[0], text: interaction[2] }, clip: { id: clip[0], text: clip[2] },
  };
}
