#!/usr/bin/env node
// tasteskill / draw — deal an art direction from the research library.
//
// The script chooses, not the model: a model asked to pick a direction returns the category
// default every time. The draw is random within what fits the brief, and it remembers recent
// draws so consecutive projects do not look alike.
//
//   node draw.mjs --sector <sector> --brief "one line" [--sections hero,showcase,pricing,footer]
//                 [--tone quiet|bold|warm|technical|playful|luxury|editorial]
//                 [--have photography,product-photo,product-ui,illustration,video,document]   assets you really have
//                        also mark (the brand's own solid mark), route (a real route with stops), plan (a real plan or exploded drawing),
//                        names (eight or more real names of its rooms, dishes, places, projects or products),
//                        logos (real logos of clients or press), map, data (real figures, quotes or prices), 3d (a model)
//                 [--keep palette,type]        the brand already fixes these; draw the rest
//                 [--avoid id,id] [--seed N] [--out DIR]
//                 [--options 3]                show three dealt directions to choose from, write nothing
//                 [--direction <id>]           deal the full sheet for the chosen direction
//                 [--technique <id> | --no-technique]   force one researched technique in place of a scene, or deal none
//   node draw.mjs --show                       reprint the saved direction sheet
//   node draw.mjs --redraw hero|type|palette|photos|scenes|entrance|replay|moves|section:<role>|direction   re-deal one slot
//   node draw.mjs --redraw scenes=<id>[,<id>] | scenes=none   take scenes by id, or build without one. Scenes are redrawn
//                                              twice at most: a third --redraw scenes lists the ones that still fit instead
//   node draw.mjs --list sectors|directions|roles|tones|scenes|techniques|entrances|replays|frame|patterns
//   node draw.mjs --site <id>                  print one studied reference site in full
//   node draw.mjs --app --kind <kind> ...      deal a style for an app screen instead (see lib/app-draw.mjs)
//
// The history of recent draws lives in ~/.taste-skill/history.json (TASTE_SKILL_HISTORY moves it); the patterns of the
// design-anatomy study in library/patterns/ (TASTE_SKILL_PATTERNS points at another folder, for tests).
// Zero dependencies. Node 18+.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';
import { homedir } from 'node:os';
import { dealTypeSystem, THIN_TEXT } from './lib/type-deal.mjs';
import { dealPaletteV25, contrast, firmSurface, readableMuted } from './lib/colour-deal.mjs';
import { dealFrame, BW_BRIEF, FRAME_RULES, FRAME_DESIGNS, PATTERN_FAMILIES, PATTERN_SHARE, QUALITY_FLOOR, RECENT_OUT, comeBack, loadPatterns, loadIdMap, historyIds, pageAssets, hidesOnScroll, menuOnly, needsSerif, fitPool, patternWhyNot, partUsable, houseNote, patternPhone, patternPictures, photosNeeded, phoneIn, studyTones, says, hollow } from './lib/frame-deal.mjs';
import { colourFamily } from './lib/rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = join(HERE, '..', 'library');
// The patterns of the design-anatomy study (library/patterns/<family>.json, exported from the lab): heroes, sections,
// navigation, footers, cards, buttons, type and motion, each with what it fits and needs. TASTE_SKILL_PATTERNS points
// at another folder (tests). A family whose file is missing deals today's designs alone. The history's pattern ids are
// read through the export's id map (ids renamed in round 11c).
const PATTERNS = loadPatterns(process.env.TASTE_SKILL_PATTERNS || join(LIB, 'patterns'));
const PATTERN_IDS = loadIdMap(process.env.TASTE_SKILL_PATTERNS || join(LIB, 'patterns'));
const ASSETS_PATH = join(HERE, 'assets.mjs').split('\\').join('/');
const ASSETS_CMD = `node ${/\s/.test(ASSETS_PATH) ? `"${ASSETS_PATH}"` : ASSETS_PATH}`;
const load = (name) => JSON.parse(readFileSync(join(LIB, name + '.json'), 'utf8'));

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf('--' + name); if (i === -1) return def; const v = argv[i + 1]; return v === undefined || v.startsWith('--') ? true : v; };
const list = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const outDir = resolve(String(opt('out', '.taste-skill')));
const sheetPath = join(outDir, 'direction.json');

const SECTORS = ['saas', 'dev-tool', 'ai-product', 'consumer-app', 'finance', 'agency', 'studio-portfolio', 'personal-portfolio', 'ecommerce', 'physical-product', 'fashion', 'hospitality', 'restaurant', 'real-estate', 'architecture', 'event', 'health', 'education', 'nonprofit', 'culture', 'music', 'other'];
const TONES = ['quiet', 'bold', 'warm', 'technical', 'playful', 'luxury', 'editorial'];
const SOFTWARE = ['saas', 'dev-tool', 'ai-product', 'consumer-app', 'finance']; // the sectors whose subject is software
// Scenes judged hollow twice (stepped columns built empty ink boxes in r4-p23 and r5-p26) or a stock trope twice
// (scatter and lock, r4-p24 and r5-p28): never dealt; the files stay. (Peel and tear, the page curl and the torn-paper
// seam judged cheap twice, are modes of peel-tear-and-drag that are never dealt: only its drag is, at half weight.)
const NEVER_SCENES = new Set(['stepped-columns-raise-a-stage', 'scatter-and-lock']);
// Atmosphere scenes (light, a burst of lines, letters) carry one line and no information. In round 1 of the v2.5 tests
// every one of them was the stretch judges called dead scroll on a product page: dealt only to loud or creative pages.
const ATMOSPHERE = new Set(['warp-jump', 'light-flood', 'letter-physics', 'wordmark-under-strain', 'object-through-giant-type', 'type-flip-relayout']);
// The signature moves that hold the stage (library/motions.json) and the screens each holds: one of the page's held
// stretches, counted with its scenes and the sections that pin (settlePins; round 11b left them uncounted).
const MOVE_HOLD = { 'pinned-story': 2, 'sideways-gallery': 2, 'opening-window': 1, 'sheet-over': 1 };
// Signature moves the deal leaves out: never the four that built the reviewed pages' worst parts (drag rails, a scaling
// giant name, colour chapters, a curtain footer), and two more except as a hero's or a direction's own.
const NO_MOTION = new Set(['drag-row', 'scaling-wordmark', 'colour-on-scroll', 'curtain-footer']);
const NOT_DEALT_MOVES = new Set([...NO_MOTION, 'carried-picture', 'index-preview']);
// The first screen's picture. Archetypes that set it small (a poster, a mosaic, a strip), unless the blueprint makes the
// picture full-bleed, and the heroes whose blueprint sets it small whatever their archetype: a photograph on three of
// twelve columns, two 280px doors, a portrait or a print a third of the width, one 450px control on half the screen.
const SMALL_PICTURE = new Set(['type-poster', 'giant-wordmark', 'colour-field', 'inline-media-sentence', 'index', 'mosaic', 'tiles', 'quiet-column', 'artefact']);
const SMALL_PICTURE_HEROES = new Set(['name-split-to-corners', 'pinned-title-over-portraits', 'two-doors-on-a-dark-wall', 'counter-object-wide-wordmark', 'two-prints-in-darkness', 'control-reads-the-page']);
// What each library hero must show once built (sheet section 6's "Must show", as a pattern hero carries its own
// signature; round 11c's first run printed none on 21 of 30 sheets): the one thing that tells it from the template
// stack of a centred headline over a picture.
const HERO_SIGNATURES = {
  'name-under-photograph': 'A full-bleed photograph over the top 58% of the screen and, on the flat band under it, the name on one line across all twelve columns, whole on the bottom margin.',
  'stacked-name-two-inks': 'One saturated field and no picture: the name on two tight lines, the first in a light ink and the second in a dark one, filling the top 58% of the screen.',
  'name-split-to-corners': 'The name cut in two, the first word held top-left and the second bottom-right while the page passes between them.',
  'pinned-title-over-portraits': 'One line of title across about 82% of the width, held in a sticky layer, crossing the upper quarter of one centred 2:3 portrait.',
  'headline-across-two-fields': 'Two flat fields meeting at half height, and the two-line headline centred across the seam, changing ink where it crosses it.',
  'swatch-column-beside-view': 'One photograph panel on columns 1-10 inside a 10px frame, and on columns 11-12 a full-height stack of five colour blocks that is the navigation.',
  'film-title-on-bottom-edge': 'One full-screen photograph with the name across the full width, whole on the bottom margin.',
  'small-name-open-sky': 'One photograph whose empty upper part carries no type: small type in the corners, and the name at 44-64px bottom-left as the only larger type.',
  'giant-cropped-shape': 'A photograph of the subject cut to one simple shape about 110vh tall on columns 7-12, cropped by the hero\'s top and bottom, beside the headline on the bare ground.',
  'fragment-on-shaped-stage': 'The headline on columns 1-5, and beside it from its first line to the foot one flat stage in a saturated colour on columns 6-12 holding the interface fragment at true size.',
  'control-reads-the-page': 'Two halves split by tone alone: the words anchored bottom-left, and on the right one working control of the product, about 450px square, that acts on the page.',
  'column-on-one-line': 'Everything hangs on one line at the start of column 4: a 380px column of words beside a panel with two real rows of the interface, the right half left blank.',
  'single-object-on-plinth': 'One photographed object dead centre, about half the screen tall, on a plinth one step lighter than the page, the wordmark top-left the only large type.',
  'object-crops-three-edges': 'One object about 150% of the hero\'s height, turned 10-20 degrees on the left 60% and cropped by the top and bottom, beside a two-line headline on the right margin.',
  'object-on-the-seam': 'A darker panel over the top 44% of the screen and the object straddling its lower edge, half on the panel and half on the page, the headline far left.',
  'statement-beside-specimen-mosaic': 'Two halves split by tone: the statement filling the upper left, and on the right a loose mosaic of seven tiles, each holding one cut-out item.',
  'specimen-wall-docked-panel': 'No headline: a wall of cut-out items on equal tiles in brickwork rows to every edge, with one ink panel docked at the bottom centre holding the sentence and the action.',
  'single-specimen-name-list': 'One item on a tile dead centre with a list of item names right-aligned towards it; choosing a name swaps the item and the tile colour.',
  'shouted-headline-rising-photo': 'A two-line headline centred across about 60% of the width, and one portrait photograph tucked under its last line, cropped by the bottom edge.',
  'counter-object-wide-wordmark': 'One object photograph centred on a dark field, and under it the name as an ultra-wide wordmark across 72% of the width and only about 45px tall.',
  'text-band-then-sheet': 'No display type: one band of text at 16px across seven columns, then from mid-height a sheet of thumbnails, one per column.',
  'sheet-with-text-cell': 'The whole screen a sheet of photographs in six offset columns, one of its cells a filled panel holding the wordmark, the sentence and the action.',
  'lit-strip-four-corners': 'A dark field crossed by one strip of photographs wider than the screen, the frame nearest the centre the brightest, and only small text in the four corners.',
  'mosaic-masthead-title-on-axis': 'A gutterless mosaic of photographs and flat tiles across the top 52%, and under it the title starting exactly at 42% of the width.',
  'narrow-talk-wide-headline': 'A narrow left column with the sentence and the action, and from the 34% line a very heavy two-line headline over a photograph cropped by the bottom edge.',
  'waterline-headline': 'Two flat fields meeting at half height, the seam cutting through the headline\'s second line, the letters in one ink above it and another below.',
  'flush-left-shout-seam-photo': 'A heavy two-line headline flush left on a saturated field, and one arched portrait turned 5 degrees right of centre, straddling the seam to the bottom band.',
  'menu-column-sticky-photo': 'Two equal halves: a photograph of the place that stays put on the right while the left half, set like a menu and centred, scrolls.',
  'anchored-text-specimen-half': 'Two halves split by tone: the words anchored bottom-left, and a sticky right half with one cut-out item on a square tile at its centre.',
  'stepped-title-two-photos': 'A two-line headline stepping across the middle third, the second line indented to column 6, with two photographs placed against the step.',
  'three-prints-one-line': 'Three photographs of three sizes hanging from one top line at 18% of the height, the tall 3:4 the largest thing on the screen, and the type small.',
  'two-prints-in-darkness': 'A near-black field about 75% empty with two low-key photographs far apart, the larger 4:5 the brightest thing on the screen.',
  'two-line-statement-full-width': 'No picture: a two-line statement filling the upper two thirds, the first line flush left and the second flush right, margin to margin.',
  'void-then-statement-on-axis': 'The upper 60% empty but for the top row, and the statement hanging from a vertical axis at 42% of the width in the bottom third.',
  'colour-field-two-ink-statement': 'One saturated field with no bar and no picture: a two-line statement in a pale ink and a dark ink, the lines nearly touching, filling the top 55%.',
  'one-word-cropped': 'One word spanning the width between the page margins, whole, its capitals filling the lower half of the screen.',
  'window-opens-to-the-edges': 'A picture seen through a small centred window that opens to the whole screen over the first screen of scroll, the words beside it never moving.',
  'ring-of-frames-around-the-headline': 'Eighteen to twenty-four frames on a tilted ellipse round the centre, and the headline in its empty core.',
  'title-in-the-sky-line-on-the-horizon': 'One wide photograph with the headline centred in its empty sky and one sentence split in two on the horizon, the subject showing through the gap.',
  'name-across-the-middle': 'No picture: the name on one line across the vertical centre from margin to margin, everything else in the four corners.',
  'square-over-a-moving-line': 'One line of display type moving slowly edge to edge across a square photograph, its letters turning light where they cross it.',
  'two-doors-on-a-dark-wall': 'Two portrait photographs side by side on a near-black field, each the link to one half of the subject with its name beneath it.',
  'title-from-top-to-bottom-edge': 'One full-screen picture with the headline pulled apart: line one at the top-left, line two indented and set whole on the bottom margin.',
  'line-up-on-an-arc': 'The current item cut out at the centre and its siblings on a shallow arc behind it, smaller and darker; a swipe, a key or a click brings another forward.',
  'view-with-two-cards-in-the-corner': 'One full-screen picture with the headline on the left at mid-height and, in the bottom-right corner, the two newest things as text links with arrows.',
  'product-under-headline': 'The headline, sentence and action at the top, and the product filling the content width under them, cropped by the bottom edge of the first screen.',
  'words-beside-product': 'The content width split about 5 to 7: a headline of 72px or more beside the product, the object or the place at the full height of the screen.',
  'photograph-with-a-line': 'One photograph filling the first screen, with a short line and one action on its calmest part and nothing else.',
  'two-photographs-and-a-line': 'Two photographs of one family side by side filling the width, the line and the action under them or on the lower edge of one.',
  'object-on-plain-ground': 'The name or the idea as the largest type across the top on the centre axis, and the object standing large under it on the same ground, with no box round it.',
  'answer-first': 'A headline that says what the service is and for whom, one real picture beside or under it, and three or four complete facts as short lines under both.',
  'screen-at-phone-width': 'The headline across columns 1-7 and, on columns 9-11, the product\'s screen at phone width with no device frame, its top level with the headline\'s first line and its foot cut by the hero\'s bottom edge.',
  'words-window-facts': 'Three columns from one top line: the headline on columns 1-6, the product\'s window in portrait on columns 7-10 cut by the hero\'s foot, and two or three short facts stacked on columns 11-12.',
  'window-on-the-seam': 'A panel of the surface tone over the top 60% of the screen with the headline on it at the left, and beside the headline the product\'s window from its first line down across the seam, its upper part on the panel and its lower part on the ground.',
  'window-left-words-right': 'The product\'s window on the left seven columns from under the navigation to the hero\'s foot, and the headline beside it on the right, its first line level with the window\'s top.',
  'screen-first-words-beside': 'The product\'s screen at phone width on columns 2-4 with no device frame, cut by the hero\'s foot, and beside it on columns 6-12 the headline, its first line level with the screen\'s top.',
};
// A software page's first screen sets the product beside the headline, never under it (r13-p60's judge: the product
// under the headline generic, the right half empty; r13-p59: a wide picture under a centred headline): the library
// heroes whose blueprint sets the product level with the headline on one side of it, and a hero pattern that says so.
// Their Must show line there names the product's window, never a photograph the sheet then swaps for it (review-006:
// "one full-screen picture" beside "a photograph it names is this window"). Not the halves whose words sit at the foot
// of an empty column, whose product is a small control or a photograph that scrolls, or that need product photographs
// (round 11e's first pass dealt them, and the sheet asked for the product beside the headline and after it too); and
// not all halves: a phone-width screen beside wide words or before them, three columns, a window across a change of
// tone. (The one hero pattern that fits today pins for a screen, so it stands only where the page has room for it.)
const PRODUCT_BESIDE = new Set(['words-beside-product', 'answer-first', 'fragment-on-shaped-stage', 'window-left-words-right', 'screen-at-phone-width', 'screen-first-words-beside', 'words-window-facts', 'window-on-the-seam']);
function productBeside(h) {
  if (!h?.pattern) return PRODUCT_BESIDE.has(h?.id);
  const t = `${h.signature || ''} ${String(h.blueprint || '').split(/\bPhone:|\bOn a phone\b/)[0]}`;
  return says(t, /\bbeside\b|\b(?:left|right) (?:half|column)\b|\bhalves\b/i) && !says(t, /\bunder (?:a |the |its )?(?:one- or )?(?:two-line )?(?:headline|button)\b|\bbelow the (?:headline|button)\b/i);
}
const SOFTWARE_HERO_SIGNATURES = {
  'words-beside-product': 'The content width split about 5 to 7: the headline at its dealt size in the narrower part, beside the product\'s window at the full height of the screen in the wider part.',
  'answer-first': 'A headline that says what the product does and for whom, the product\'s window beside it, and three or four complete facts as short lines under both.',
};
// What the product's interface shows on a software page's first screen, through the history (review-004: every hero of
// an invoicing app was a window of ledger rows). One with `fits` only where the brief names what it needs, one with
// `needs` only where the page has that asset (a map it could only draw fails drawn-illustration), and none over a
// replay that shows the same (`notWith`). How any of it arrives is section 8's entrance, never its own.
const HERO_SUBSTANCES = [
  { id: 'document', name: 'a document', notWith: ['turns', 'source-output'], text: 'One document the product makes or keeps, set as a page at reading size (an invoice, a note, a report, a brief) with its real heading, lines and figures; the rest of the interface is only its edge.' },
  { id: 'chart', name: 'a chart', notWith: ['source-output'], fits: /\b(?:invoic\w*|expens\w*|budget\w*|bookkeep\w*|accounting|financ\w*|money|payments?|payroll|sales|revenue|metrics?|analytics?|tracking|spend\w*|savings?|invest\w*|energy|fitness)\b/i, text: "One chart of the user's own figures (a month of income, the hours of a week), built in HTML in the product's window, and the figure that matters in words beside it." },
  { id: 'timeline', name: 'a timeline', text: "The product's own time axis: a week or a month of the user's items along it (due dates, sessions, sends), today marked and one item set apart with its facts." },
  { id: 'object', name: 'a single object of the product', text: 'One thing the product holds, opened large and alone: one card, one record, one note, its fields readable, nothing listed around it.' },
  { id: 'conversation', name: 'a conversation', notWith: ['turns', 'agent-run'], text: 'An exchange inside the product: a message and its answer, or a comment on an item and the reply, two to four turns.' },
  { id: 'map', name: 'a map', needs: 'map', fits: /\b(?:maps?|routes?|places|locations?|deliver\w*|travel\w*|trips?|fleets?|stores|logistics|shipping|rides?)\b/i, text: "The product's map of the user's own places (the stops, sites or routes it keeps), one of them marked with its facts beside it." },
];
// What a scene really takes ("needs" in library/scenes.json), checked against what the brief has (--have, its words
// and the imagery mode):
//   product-photo  photographs or renders of this very product, building or work (--have product-photo)
//   pictures:N     N distinct photographs of one family of the subject's world
//   series:N       N photographs shot or chosen as one series: one subject and framing, in other states or light
//   names:N        N or more real names of the client's own rooms, dishes, places, projects or products (--have names,
//                  or a sector that has such lists; never a product page without photographs or a software page)
//   mark           the brand's own solid mark (--have mark or --have logo; a brief saying "no logo yet" has none)
//   route          a real route with stops that the subject travels (--have route, or one the brief names)
//   product-ui     the product's own interface (a software page)
//   plan           a real plan or exploded drawing (--have plan)
//   video          footage or a frame sequence of this very product (--have video)
//   own            (techniques) the client's own photographs: --have photography or product-photo
//   document       (techniques) a document the product makes: one the brief names, or --have document
//   a|b            either
// A page with no photographs of its product, or a software page, can honestly show about three photographs of the
// subject (its use, its load, its world, never a product of its kind) and no series; a page with no photographs of its
// own at all plans three to six of its world (the sheet's imagery section), and its scenes take four of them at most, so
// the sections keep some. The
// cap counts the scenes of a page together: in r6-p31 a cargo bike page redrew its scenes five times for photo cards,
// chapters, a mark and a route it could not fill.
const SCENE_PICTURE_CAP = { 'no-product-photo': 3, interface: 3, atmosphere: 4 };
// A page short of pictures of its own subject (no photographs of its product, or a brief that says it has few) is dealt
// first from the scenes and techniques that need no photograph or one: scenes of type, the product's own interface
// where the page has it, techniques labelled 0 or 1. In r7-p34 a cargo bike page with no photographs redrew its scenes
// three times, each wanting three to six photographs of one family, and was built with no scene at all.
const FEW_PICTURE_WORDS = /\b(?:no|few|without|hardly any|not many)\s+(?:(?:good|real|own|usable|product)\s+)?(?:photo(?:graph)?s?|pictures?|images?|imagery)\b/i;
function fewPictures(input) { const mode = imageryMode(input); return mode === 'no-product-photo' || (mode !== 'own' && FEW_PICTURE_WORDS.test(input.brief || '')); }
function lightScene(sc) { return scenePictures(sc) <= 1; }
const ROUTE_WORDS = /\b(?:routes?|treks?|itinerar(?:y|ies)|voyages?|crossings?|ferr(?:y|ies)|pilgrimages?|expeditions?)\b/i;
// months, weekdays and seasons are not places: "open from May to September" names no route
const NOT_PLACE = /^(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|mon(?:day)?|tues?(?:day)?|wed(?:nesday)?|thu(?:rs?(?:day)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?|spring|summer|autumn|fall|winter|easter|christmas)s?$/i;
// "from Oban to Mull"
const routeInBrief = (brief) => ROUTE_WORDS.test(brief) || [...String(brief || '').matchAll(/\bfrom (\p{Lu}\p{L}+) to (\p{Lu}\p{L}+)/gu)].some((m) => !NOT_PLACE.test(m[1]) && !NOT_PLACE.test(m[2]));
// a portfolio's first or second screen shows its work (r10-p47): no scene before the work, and the sheet says so
const PORTFOLIO = ['studio-portfolio', 'personal-portfolio', 'agency', 'architecture'];
// sectors whose pages really list eight or more names of their own (rooms, dishes, places, projects, products)
const NAME_SECTORS = ['hospitality', 'restaurant', 'event', 'culture', 'music', 'agency', 'studio-portfolio', 'personal-portfolio', 'architecture', 'real-estate', 'education', 'nonprofit'];
// A place people go to: a café, a bar, a restaurant, a shop, a guesthouse, a studio with a door. The restaurant and
// hospitality sectors, or a word for one in the brief's own subject ("a design studio" has no door to visit; "a pottery
// studio" has; "a studio designing for restaurants" has none: briefHead stops before the clients).
// Its visit block names the street and the way there (visitBlock).
const DOOR_WORDS = /\b(?:caf[eé]s?|coffee (?:bar|shop|house)s?|bars?|pubs?|restaurants?|bistros?|trattorias?|osterias?|bakery|bakeries|roaster(?:y|ies)|brewer(?:y|ies)|taprooms?|delis?|shops?|stores?|boutiques?|bookshops?|florists?|market halls?|guest ?houses?|hotels?|inns?|hostels?|b&bs?|lodges?|cabins?|huts?|campsites?|salons?|barbers?|galler(?:y|ies)|museums?|saunas?|spas?|gyms?|clinics?|(?:dental|medical|physio\w*|vet\w*|doctors?'?|family) practices?|dentists?|theat(?:re|er)s?|cinemas?|venues?|librar(?:y|ies)|winer(?:y|ies)|distiller(?:y|ies)|kiosks?|(?:yoga|pilates|dance|pottery|ceramics?|tattoo|hair|nail|fitness|climbing|print) studios?)\b/i;
// a brief that says people book it (bookingBlock), and a blueprint that asks for an email (asksEmail)
// (never "a book shop" or "the reservoir")
const BOOK_WORDS = /\b(?:bookings?|bookable|book (?:a|your|the|online)|reserv(?:e|es|ed|ations?)|appointments?)\b/i;
// a price the brief gives ("from 4,890 euro", "€95 a night")
const PRICE_GIVEN = /[€$£]\s?\d|\b\d[\d.,]*\s?(?:€|euros?\b|eur\b|usd\b|dollars?\b|pounds?\b|kr\b|isk\b|nok\b|sek\b|dkk\b|chf\b)/i;
const EMAIL_FORM = /\b(?:e-?mail|newsletter|sign-?up|subscribe)\b[^.]{0,120}\b(?:input|field|form)\b|\b(?:input|field|form)\b[^.]{0,60}\be-?mail\b/i;
// Something one side of the screen crops (adjustments): "runs off the right edge", "flush against the right viewport
// edge", "cut by the top and right edges", "the top, right and bottom edges of the viewport crop it", "past the right
// margin".
const ONE_EDGE = /\b(?:runs?|running|bleeds?|bleeding|pushed|cut off|cropped|crops?)\b[^.;]{0,40}?\b(?:the )?(?:right|left) (?:viewport |screen )?edges?\b|\b(?:runs?|running|bleed(?:s|ing)?) off the (?:right|left)\b(?! and (?:the )?(?:right|left))|\bthe (?:right|left) (?:viewport |screen )?edge crops\b|\bflush against the (?:right|left) (?:viewport |screen )?edge\b|\b(?:cut|cropped) by the (?:(?:top|bottom),? (?:and )?)?(?:right|left) edges?\b|\b(?:right|left)\b[^.;]{0,30}\bedges? of the viewport\b[^.;]{0,12}\bcrop|\bto the (?:right|left) viewport edge\b|\bpast the (?:right|left) margin\b|\bleaves? the (?:right|left) edge\b/gi;
// numbers written as words in the blueprints ("four to six times", "Eight to fourteen items")
const NUMBER = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fourteen: 14, sixteen: 16, twenty: 20 };
const asNumber = (w) => +w || NUMBER[String(w).toLowerCase()] || 0;
const briefHead = (b) => String(b || '').split(/\s(?:that|which|who|for|with|whose|making|selling|serving|shooting|designing|building)\s|[:;(]/i)[0];
// The category's stock shots, named on the sheet so they stay off the page unless art-directed (r9-p44 filled a
// roastery page with full-frame beans and burlap sacks, and the judge read them as generic). The brief's trade first,
// then the sector's; references/imagery.md §2 keeps the list. The third part finds them among the dealt photographs.
const CLICHES = [
  [/\b(?:coffee(?! tables?\b)|espresso|roaster(?:y|ies)?)\b|\bcaf[eé]s?(?![a-zà-ÿ])/i, 'full-frame beans, burlap sacks, top-down latte art', /\bbeans filling\b|\bcoffee beans\b|\bburlap\b|\bhessian\b|\bjute sacks?\b|\blatte art\b|\b(?:cup|mug) of coffee\b[^.]*\bfrom above\b/i],
  [/\b(?:bakery|bakeries|bakers?|bread|patisserie|pastr(?:y|ies))\b/i, 'flour dusted over a board, a loaf on a cloth from above', /\bflour\b[^.]*\bboard\b|\bloaf\b[^.]*\bfrom above\b/i],
  [/\b(?:wines?|winery|vineyards?)\b/i, 'a glass swirled against the light, vines at sunset', /\bwine ?glass\b|\bvines?\b[^.]*\b(?:sunset|dusk)\b/i],
  [/\b(?:teas?)\b/i, 'leaves spilled from a spoon, steam over a cup', /\bsteam\b[^.]*\b(?:cup|mug)\b|\btea leaves\b/i],
  [/\b(?:beers?|brewer(?:y|ies)|taprooms?)\b/i, 'a row of taps, a pint held to the light', /\b(?:beer )?taps\b|\bpint\b/i],
  [/\b(?:yoga|pilates|fitness|gyms?)\b/i, 'a silhouette at sunrise, a row of dumbbells', /\bdumbbells?\b|\bsilhouett\w*\b[^.]*\bsunrise\b/i],
];
const SECTOR_CLICHES = {
  saas: 'hands on a laptop, a team round a screen', 'dev-tool': 'hands on a laptop, code on a dark screen', 'ai-product': 'a glowing brain, hands on a laptop', 'consumer-app': 'a hand holding up a phone', finance: 'stacked coins, a handshake, a chart on a screen',
  hospitality: 'a made bed shot straight on, a folded towel, a pool at sunset', restaurant: 'a flat lay of ingredients, a chef plating with tweezers', 'real-estate': 'keys handed over, a drone shot of roofs', architecture: 'a drone shot of roofs, a hard hat on drawings',
  agency: 'sticky notes on a glass wall, a team laughing at a laptop', 'studio-portfolio': 'a desk with a laptop and a plant', education: 'a raised hand in a lecture hall, books with an apple', health: 'a stethoscope on a desk, a silhouette at sunrise', nonprofit: 'hands joined in a circle, a child looking into the lens',
  ecommerce: 'smiling models in a studio, the product floating in mid-air on a bright colour', 'physical-product': 'the product floating in mid-air on a bright colour, a smiling model holding it', event: 'confetti over a crowd, a microphone in close-up',
};
const SECTOR_CLICHE_PHOTOS = {
  restaurant: /\b(?:bowls?|salad|plates?|ingredients|cutting board|pastry|nuts)\b[^.]*\b(?:from above|overhead)\b|\boverhead (?:view|arrangement)\b[^.]*\b(?:board|bowls?|pan|kitchen)\b|\bflat ?lay\b/i,
  hospitality: /\bmade bed\b|\bfolded towels?\b|\bpool at (?:sunset|dusk)\b/i,
  saas: /\blaptop\b/i, 'dev-tool': /\blaptop\b/i, 'ai-product': /\blaptop\b/i, finance: /\bcoins?\b(?!-operated)|\bhandshake\b/i,
  'real-estate': /\bkeys\b|\bdrone\b/i, health: /\bstethoscope\b/i, event: /\bconfetti\b/i,
};
const NEED_WORDS = { 'product-photo': 'photographs of this very product, building or work', mark: "the brand's own solid mark", route: 'a real route with stops', 'product-ui': "the product's own interface", plan: 'a real plan or exploded drawing', video: 'footage or a frame sequence of this very product' };
function needWords(need) {
  const parts = need.split('|').map((n) => {
    const [k, v] = n.split(':');
    if (k === 'pictures') return +v > 1 ? `${v} photographs of one family` : +v ? 'one photograph' : 'no photographs';
    if (k === 'series') return `${v} photographs shot or chosen as one series`;
    // (never its clients: a wall of client names is a credit wall)
    if (k === 'names') return `${v} or more real names of the client's own rooms, dishes, places, projects or products`;
    return NEED_WORDS[k] || k;
  });
  return parts.length > 1 ? `one of: ${parts.join('; ')}` : parts[0];
}
// The distinct photographs a scene takes (its pictures:N), for the page's cap.
function scenePictures(sc) { return Math.max(0, ...(sc.needs || []).flatMap((n) => n.split('|')).filter((n) => n.startsWith('pictures:')).map((n) => +n.split(':')[1] || 0)); }
function sceneNeedsWords(sc) { const w = (sc.needs || []).map(needWords); return w.length > 1 ? `${w.slice(0, -1).join(', ')}, and ${w.at(-1)}` : w[0] || 'its words only'; }
// Researched techniques (library/techniques.json, exported from the lab's study of award sites): about one page in two
// gets one in place of one of its dealt scenes, so the deal spreads over the whole research library and not only over
// the scenes already built. The builder makes it fresh on the shared stage (sheet section 9).
const TECHNIQUE_RATE = 0.5;
const TECHNIQUE_TRIGGERS = ['scroll-scrub', 'scroll-enter']; // a scene runs on native scroll (references/scenes.md §7 rule 3)
// the sections a technique can carry: its position, and in the middle of the page what it carries
const TECHNIQUE_ROLES = {
  opening: ['hero'],
  closing: ['cta', 'contact'],
  transition: ['intro', 'about', 'work', 'features', 'gallery', 'list', 'how-it-works', 'contact'],
  work: ['work', 'gallery', 'showcase'],
  content: ['features', 'showcase', 'how-it-works', 'list', 'gallery', 'stats', 'about'],
  // the page's own statement: a customer's quote with its attribution cannot fill a manifesto set at display size
  statement: ['intro', 'about'],
  atmosphere: ['intro', 'about', 'gallery'],
  // a middle one built from the product's interface goes where the product is explained; a statement made of a list
  // (what the business does) is no quotation
  ui: ['how-it-works', 'features', 'showcase', 'intro', 'about'],
  'statement-list': ['intro', 'about', 'features'],
};
function techniqueRoles(t) {
  const roles = t.position !== 'middle' ? TECHNIQUE_ROLES[t.position] || []
    : t.needs?.ui ? TECHNIQUE_ROLES.ui
    : TECHNIQUE_ROLES[t.carries === 'statement' && t.needs?.words === 'list' ? 'statement-list' : t.carries] || [];
  // a gallery is pictures: one made of type, or of a single picture, never takes its place
  return (TECHNIQUE_PICTURES[t.needs?.pictures] ?? 0) < 2 ? roles.filter((r) => r !== 'gallery') : roles;
}
// its picture label as the photographs it takes (the scene vocabulary above, counted against the page's cap): the
// directions ask for the top of the range more often than the bottom (three of '2-3', six or more of '4-8')
const TECHNIQUE_PICTURES = { 0: 0, 1: 1, '2-3': 3, '4-8': 6, many: 8 };
NEED_WORDS.own = "the client's own photographs of this very subject (its work, this product, one place in two states)";
NEED_WORDS.document = 'a document the product really makes (an invoice, a contract, a report, a ticket)';
// what the brief must name for a technique that needs a document (`--have document` says it too)
const DOCUMENT_WORDS = /\b(invoic\w*|contracts?|receipts?|statements?|reports?|reporting|quotes?|quoting|proposals?|tickets?|ticketing|invitations?|letters?|documents?)\b/i;
// A technique in the shape of a scene, so the scene deal checks and places it by the same rules. The client's own
// photographs are needed for a work-carrying one with pictures: a stand-in is never a studio's work.
function techniqueScene(t) {
  const n = t.needs || {}; const pictures = TECHNIQUE_PICTURES[n.pictures] ?? 0;
  const needs = [`pictures:${pictures}`, (n.own || (t.carries === 'work' && pictures > 0)) && 'own', n.names && 'names:8', n.ui && 'product-ui', n.video && 'video', n.document && 'document'].filter(Boolean);
  return {
    id: t.id, technique: true, name: t.name, family: t.family, position: t.position, trigger: t.trigger, energy: t.energy, kind: t.carries,
    roles: techniqueRoles(t), sectors: t.sectors || ['*'], needs,
    // the stage holds a scene one screen at least; a closing one holds about one screen (scenes.md §7 rule 2)
    hold: Math.max(1, t.hold || 0), researchHold: t.hold || 0, lines: t.position === 'closing' ? 1 : undefined,
    phone: t.phone, score: t.score, principle: t.principle, freshTake: t.freshTake, breaksWhen: t.breaksWhen,
  };
}
// Fewer, shorter sections (October 2026: the owner found the pages cluttered and wordy): five or six after the hero
// at most, none that only restates another (a testimonial without real quotes, a stats band). No questions section
// unless the brief asks for one (FAQ_WORDS): the dealt ones held eight to fourteen answers.
const DEFAULT_SECTIONS = {
  saas: ['hero', 'showcase', 'features', 'how-it-works', 'pricing', 'cta', 'footer'],
  'dev-tool': ['hero', 'showcase', 'features', 'how-it-works', 'pricing', 'cta', 'footer'],
  'ai-product': ['hero', 'showcase', 'features', 'how-it-works', 'pricing', 'cta', 'footer'],
  'consumer-app': ['hero', 'showcase', 'features', 'how-it-works', 'cta', 'footer'],
  finance: ['hero', 'showcase', 'features', 'pricing', 'cta', 'footer'],
  agency: ['hero', 'work', 'intro', 'services', 'about', 'cta', 'footer'],
  'studio-portfolio': ['hero', 'work', 'intro', 'services', 'cta', 'footer'],
  'personal-portfolio': ['hero', 'work', 'about', 'cta', 'footer'],
  ecommerce: ['hero', 'gallery', 'features', 'intro', 'cta', 'footer'],
  'physical-product': ['hero', 'showcase', 'features', 'gallery', 'pricing', 'cta', 'footer'],
  fashion: ['hero', 'gallery', 'intro', 'work', 'cta', 'footer'],
  hospitality: ['hero', 'intro', 'gallery', 'list', 'contact', 'footer'],
  restaurant: ['hero', 'intro', 'list', 'gallery', 'contact', 'footer'],
  'real-estate': ['hero', 'intro', 'gallery', 'features', 'contact', 'footer'],
  architecture: ['hero', 'work', 'intro', 'about', 'contact', 'footer'],
  event: ['hero', 'intro', 'list', 'pricing', 'cta', 'footer'],
  health: ['hero', 'intro', 'features', 'how-it-works', 'cta', 'footer'],
  education: ['hero', 'intro', 'features', 'how-it-works', 'pricing', 'cta', 'footer'],
  nonprofit: ['hero', 'intro', 'features', 'about', 'cta', 'footer'],
  culture: ['hero', 'intro', 'gallery', 'list', 'cta', 'footer'],
  music: ['hero', 'list', 'gallery', 'about', 'cta', 'footer'],
  other: ['hero', 'intro', 'features', 'showcase', 'cta', 'footer'],
};
// a brief that asks for answers to questions gets a questions section before the closing one
const FAQ_WORDS = /\bFAQs?\b|\bfrequently asked\b|\bcommon questions\b|\bquestions (?:section|and answers)\b/i;
// requested role names → the role vocabulary used by library/sections.json
const ROLE_ALIAS = { features: 'features', feature: 'features', benefits: 'features', services: 'features', showcase: 'showcase', product: 'showcase', demo: 'showcase', 'how-it-works': 'how-it-works', how: 'how-it-works', process: 'how-it-works', steps: 'how-it-works', testimonial: 'testimonial', testimonials: 'testimonial', quotes: 'testimonial', proof: 'proof', logos: 'proof', press: 'proof', stats: 'stats', numbers: 'stats', pricing: 'pricing', plans: 'pricing', faq: 'faq', cta: 'cta', footer: 'footer', intro: 'intro', manifesto: 'intro', about: 'about', team: 'about', work: 'work', projects: 'work', index: 'work', 'case-studies': 'work', gallery: 'gallery', images: 'gallery', list: 'list', menu: 'list', schedule: 'list', lineup: 'list', 'line-up': 'list', speakers: 'list', agenda: 'list', programme: 'list', program: 'list', timetable: 'list', rooms: 'list', tickets: 'pricing', price: 'pricing', contact: 'contact', booking: 'contact', newsletter: 'contact', signup: 'contact' };
// The structure a section pattern's name says (structureOf), first match first: the product's own window or a working
// control, a split, a list of rows, a grid of cards; a bare row is a list only where no headline or quote leads it (the
// third item: round 11c tagged a portrait beside a big quote a list). Then whether pictures or footage lead it, then a
// statement, then its shape.
const STATEMENT_NAME = /\bstatement\b|\bheadline\b|\bquote\b|\bparagraph\b|\bsentence\b/;
const STRUCTURE_NAMES = [
  ['tool', /\bui\b|\b(?:product|app|demo|browser) (?:windows?|screens?)\b|\binterface\b|\bdashboard\b|\bconfigurator\b|\bcalculator\b/],
  ['split',/\bsplit\b|\bhalves\b|\bbeside\b|\btwo[- ]pane\b|\bleft\b.*\bright\b|\bright\b.*\bleft\b|\b(?:text|copy|title|heading|statement|list|names?) (?:left|right)\b/],
  ['table', /\btable\b|\bboard\b|\bledger\b|\bcomparison\b/],
  ['list', /\blist\b|\bindex\b|\bnames\b|\bmenu\b|\bschedule\b|\bagenda\b|\bline ?up\b/],
  ['grid', /\bgrid\b|\bcards?\b|\btiles?\b|\bthree[- ]up\b|\bcolumns\b|\bcells?\b/],
  ['list', /\brows?\b/, STATEMENT_NAME],
  ['band', /\bband\b|\bmarquee\b|\bticker\b/],
];
const GALLERY_NAME = /\b(?:photos?|photographs?|pictures?|images?|portraits?|artworks?|stills|prints|frames|videos?|collage|mosaic|masonry|lookbook|reel|gallery|scatter\w*|carousel|fan)\b/;
const SHAPE_STRUCTURE = { split: 'split', table: 'table', list: 'list', index: 'list', grid: 'grid', mosaic: 'gallery', carousel: 'gallery', strip: 'band', band: 'band', statement: 'statement', 'full-bleed': 'band', pinned: 'split', stack: 'column' };

// ---------- the study's patterns as heroes, section blueprints, small moves and type notes ----------
// (lib/frame-deal.mjs loads them, fits them to the page and deals the navigation, footer, cards and buttons from them)
const PHONE_FALLBACK = 'Its own phone composition: the same parts in one column inside the phone margins, the picture first or behind the words where the description sets it, the headline on two lines at most, nothing cropped by the screen edge.';
// A hero pattern is dealt beside the direction's heroes, never one that is a gate, a loader or a first screen with no
// headline: the title is readable 1.2s after load (`late-title`) and the first screen says what this is.
const P_HEROES = PATTERNS.hero.filter((e) => !/^hero-(?:gate|loader|phone)-/.test(e.id) && !/\b(?:entry gate|preloader|loader screen|loading screen|percent counter|start prompt|click to (?:start|enter)|press to (?:start|enter)|tap to (?:start|enter))\b|\bno (?:display |big |large )?(?:headline|title)\b|\bheadless\b|\bno scroll\b|\bshows only (?:a|the) (?:logo|lockup|wordmark)\b|\bonly (?:a|the) logo lockup\b/i.test(`${e.name || ''} ${e.description}`)
  // (nor particles rushing past: references/scenes.md §7, no drawn shapes, tracks or particles)
  && !says(`${e.name || ''}. ${e.description}`, /\bparticles?\b/i)).map((e) => ({
  id: e.id, name: e.name || e.id, pattern: true,
  // a hero whose largest type is the name counts as a giant wordmark (nameHero, the frame's navigation)
  archetype: says(e.description, /\b(?:giant|huge|large|full-width|screen-wide)\s+(?:wordmark|name|logo(?:type)?)\b/i) ? 'giant-wordmark' : 'pattern',
  blueprint: e.description.trim() + houseNote(e), mobile: e.phone ? String(e.phone).trim() : PHONE_FALLBACK,
  headline: says(e.description, /\b(?:giant|huge|large|full-width|screen-wide)\s+(?:wordmark|name|logo(?:type)?)\b/i) ? 'The name itself, on one line where it fits, when the page is built on what the name means; otherwise the page\'s own idea in two lines at most.' : 'The page\'s own idea, in this client\'s words, on two lines at most (12 words or fewer).',
  needs: e.needs?.video ? ['video'] : [], pneeds: e.needs || {}, fits: e.fits || {}, avoidWith: e.avoidWith || [],
  // (its quality weighs it in fitPool; its signature is the sheet's "Must show")
  quality: e.quality, ...(e.signature ? { signature: e.signature } : {}),
  split: says(e.description, /\bsplit\b|\b(?:left|right) half\b|\bhalves\b|\b50\/50\b/i),
}));
// A section pattern stands in for a blueprint of the role its name and description say. One that is a transition, a
// 3D world, a camera ride, a gate, an index of other pages or a stretch the study could not read carries no role and is
// never dealt: the scenes own the page's big held moments, every one on native scroll, and a one-page site links to
// its own sections only.
const NOT_A_SECTION = /\b(?:unrecorded|unseen|gate|preloader|loader|wordless|drivable|camera|3d|webgl|orbit|fly ?through|dive|world|shreds?|blob|comb edge|wave edge|wave mask|sheet slides|ground sheet|intro film|skip|globe|tunnel|portal|link index|hotspots?|cutaway|sphere|photo mode|autoscroll|scroll lock(?:ed)?)\b/i;
// (nor a title whose letters are cut, scrambled or flown in: references/scenes.md, every frame of a word reads whole)
const LETTERS_APART = /\beach (?:letter|character|glyph) (?:is )?(?:cut|split|sliced|broken)\b|\bletters? (?:fly|flies|scatter|tumble|assemble)\w*|\bscrambl\w*|\bflying letters\b|\bfrom fragments\b|\brandom (?:letters|characters|glyphs)\b/i;
const NOT_A_SECTION_TEXT = new RegExp(`${/\bWebGL\b|\bshader\b|\bthree\.js\b|\bcanvas\b|\b3D (?:scene|world|model|figure|object|camera|stage|environment)\b|\bno native scroll\b|\bscroll(?:ing)? (?:is )?locked\b|\bwheel[- ](?:driven|input drives)\b/.source}|${LETTERS_APART.source}`, 'i');
// the study's own prefixes, then words of the name, then of the description (first match wins)
const ROLE_PREFIX = { statement: ['intro', 'about'], intro: ['intro'], stats: ['stats'], team: ['about'], testimonial: ['testimonial'], quote: ['testimonial'], process: ['how-it-works'], news: ['list'], timeline: ['how-it-works'] };
const ROLE_RULES = [
  [/\btestimonials?\b|\bquotes?\b|\breviews?\b/i, ['testimonial']],
  [/\blogos?\b|\bpress\b|\bclients?\b|\bpartners?\b/i, ['proof']],
  [/\bstats?\b|\bstatistics\b|\bnumerals?\b|\bbig numbers\b/i, ['stats']],
  // (a "ticket-style" signup card is no price list, under its round 11c id either: "notched ticket signup card")
  [/\bpric(?:e|es|ing)\b|\bplans?\b|\btiers?\b|\btickets?\b(?![- ](?:style|sign ?up))/i, ['pricing']],
  [/\bfaqs?\b|\bquestions\b/i, ['faq']],
  [/\bcontact\b|\bsign ?up\b|\bnewsletter\b|\bbooking\b|\bmap tile\b/i, ['contact']],
  [/\bcta\b|\bcall to action\b|\bclosing\b/i, ['cta']],
  // (never "about": the study writes it for "roughly")
  [/\bteam\b|\bbios?\b|\bfounders?\b|\bour people\b/i, ['about']],
  [/\bprocess\b|\bsteps?\b|\bhow it works\b/i, ['how-it-works']],
  [/\bprojects?\b|\bcase stud\w*|\breel\b|\blookbook\b|\bartworks?\b|\bname stack\b|\btitle rows\b|\bgiant list\b|\bwork\b/i, ['work']],
  [/\bgallery\b|\bcollage\b|\bmosaic\b|\bmasonry\b|\bpinboard\b|\bphoto (?:pair|trio|grid|strip|band|card)\b|\bimage (?:scatter|column|stream)\b|\bfilm strip\b|\bposter wheel\b|\bportrait (?:cards?|tiles?|trio|frame)\b|\bprints\b/i, ['gallery', 'work']],
  [/\blist\b|\bmenu\b|\bschedule\b|\bagenda\b|\bline ?up\b|\barticles?\b/i, ['list']],
  [/\bproducts?\b|\bui windows?\b|\bapp window\b|\bdevice\b|\bobject\b|\brender\b|\bcut ?outs?\b|\bshowcase\b/i, ['showcase']],
  [/\bfeatures?\b|\bcapabilit\w*|\bservices?\b|\bpanel cards?\b|\bthree up\b|\bgrid\b|\btiles?\b|\bcolumns?\b|\bcards?\b/i, ['features']],
  [/\bstatement\b|\bmanifesto\b|\bparagraph\b|\bheadline\b|\bdisplay line\b|\btitle\b|\bline\b/i, ['intro', 'about']],
];
function sectionRoles(e) {
  const words = `${e.id.replace(/^sec-/, '')} ${e.name || ''}`.replace(/-/g, ' ');
  if (NOT_A_SECTION.test(words) || NOT_A_SECTION_TEXT.test(e.description)) return [];
  // (no bento grid: the sheet's Always line)
  if (says(`${e.name || ''}. ${e.description}`, /\bbento\b/i)) return [];
  // (nor a dialog, a drawer or an overlay a button opens: it is no section of the page, and a place's visit block, which
  // stands in its contact section, went behind it; round 11c dealt a contact overlay to a café and a guesthouse)
  if (/^[^.]*\b(?:overlay|dialog|drawer)\b[^.]*\bopen(?:ed|s)\b/i.test(e.description.trim())) return [];
  const known = new Set(Object.values(ROLE_ALIAS));
  // the export may name the roles itself
  const given = [].concat(e.roles || e.role || []).map((r) => ROLE_ALIAS[r] || r).filter((r) => known.has(r) && r !== 'footer');
  if (given.length) return [...new Set(given)];
  const head = e.id.replace(/^sec-/, '').split('-')[0];
  if (ROLE_PREFIX[head]) return ROLE_PREFIX[head];
  for (const [re, roles] of ROLE_RULES) if (re.test(words)) return roles;
  // the description only for the roles a section cannot fake (quotes, logos, prices, questions, a form, a closing
  // line, the team, the steps): "a title" or "a grid" in it says nothing of what the section is for
  for (const [re, roles] of ROLE_RULES.slice(0, 9)) if (says(e.description, re)) return roles;
  return [];
}
// the shape vocabulary of library/sections.json, read from the name first, then the description
const SHAPES = [['pinned', /\bpinned\b|\bsticky\b|\bheld\b/], ['full-bleed', /\bfull[- ]bleed\b|\bfull[- ]screen\b|\bfull[- ]viewport\b|\b100vw\b/], ['split', /\bsplit\b|\bhalves\b|\b(?:left|right) half\b|\bbeside\b|\btwo[- ]columns?\b/], ['table', /\btable\b/], ['mosaic', /\bmosaic\b|\bcollage\b|\bmasonry\b|\bbento\b|\bpinboard\b|\bscatter\w*\b/], ['grid', /\bgrid\b|\bthree[- ]up\b|\b(?:three|four) (?:across|columns)\b|\bcards?\b|\btiles?\b/], ['list', /\blist\b|\brows\b|\bindex\b/], ['strip', /\bstrip\b|\bmarquee\b|\bcarousel\b|\btrack\b|\brow of\b/], ['band', /\bband\b/], ['statement', /\bstatement\b|\bheadline\b|\bquote\b|\bparagraph\b|\bline\b/]];
function shapeOf(e) {
  for (const t of [`${e.id} ${e.name || ''}`.replace(/-/g, ' '), e.description]) for (const [shape, re] of SHAPES) if (says(t, new RegExp(re.source, 'i'))) return shape;
  return 'stack';
}
const P_SECTIONS = PATTERNS.section.map((e) => ({ e, roles: sectionRoles(e) })).filter((x) => x.roles.length).map(({ e, roles }) => ({
  id: e.id, name: e.name || e.id, pattern: true, role: roles[0], roles, shape: shapeOf(e), tags: [], directions: [],
  needs: e.needs?.video ? ['video'] : [], pneeds: e.needs || {}, fits: e.fits || {}, avoidWith: e.avoidWith || [],
  blueprint: e.description.trim() + houseNote(e), mobile: patternPhone(e), quality: e.quality,
}));
// A section that pins the screen (a pinned stage or scene, a sticky stage in a wrapper of several screens, a stretch held
// for so many screens or pixels) holds it like a scroll scene, so it counts against the page's scenes (settlePins); a
// sticky heading, column or picture beside content that scrolls holds nothing. The screens it holds, or 0 (about one
// section pattern in four pins: the study's pinned stages).
const PIN_WORDS = /\bpinned (?:[\w-]+ ){0,2}(?:stage|scene|screen|canvas|run|stretch|section|track|viewport|strip|panel|opening|transition|beats?|swap|video|room|scroll|sequence|chapter)\b|\bpinned (?:for|about|behind|full)\b|\b(?:viewport|stage|strip|track|scene|section) is pinned\b|\bstays? (?:pinned|held)\b|\bheld stage\b|\bsticky (?:full-bleed |\d+s?vh )?(?:stage|layer)\b|\bheld (?:sticky|with position: sticky )?for (?:about |the whole )?(?:(?:[\d.,]+|one|two|three|four|five|six) ?(?:px|screens?|viewports?)|chapter)\b|\bheld behind\b[^.]*?\b\d{3}s?vh of scroll\b|\bwrapper (?:about )?[2-9]\d\d(?:[–-]\d{3})?s?vh\b/i;
const NO_PIN =/\b(?:no|not|never|without)\s+(?:a\s+|any\s+)?(?:pin|pinned|pins|sticky)\b/i;
// (a section that follows or precedes another's pin holds nothing itself: "a quiet breath after a heavy pinned scene")
const OTHER_PIN = /\b(?:after|before|following|from|out of)\s+(?:a|an|the|its)\s+(?:[\w-]+\s+){0,3}?pinned\b[^.]*/gi;
// A hold written in words holds the screen too: the stage changes over a stated stretch of scroll ("over about one
// screen of scroll the hole widens", "about two screens of scroll in all", "three beats of about 60vh each (under three
// screens in all)"), or widens, grows or opens as the visitor scrolls, or "pins and grows"; never a move made on native
// scroll as the section passes (round 11c left a hero's widening window uncounted beside two scenes)
const HOLD_WORDS = /\b(?:over|across|during|about|roughly) (?:about |roughly )?(?:(?:\d+(?:\.\d+)?|one|two|three|half a|a) )?(?:full )?(?:screens?|viewports?) of scroll\b|\b(?:screens?|viewports?) (?:of scroll )?in all\b|\b(?:over|across|during) (?:about |roughly )?\d{3,4}px of scroll\b|\b(?:widens?|grows?|expands?|opens?|shrinks?)\b[^.]{0,80}\b(?:as (?:you|the visitor|the reader|the page) scrolls?|on scroll|with (?:the )?scroll)\b|\bpins (?:and|while|for|over|as)\b/i;
const NATIVE_SCROLL = /\bnative scroll\b|\bas (?:the |its )?(?:stage|section|it) (?:arrives|enters|passes)\b/i;
// the screens of hold for a page's scenes and pinned sections together (dealScenes, settlePins)
const HOLD_BUDGET = 6.5;
function pinHold(bp) {
  const text = String(bp?.blueprint || '').split(/\bPhone:/)[0];
  const said = text.split(/(?<=\.)\s+/).map((t) => t.replace(OTHER_PIN, ''));
  // (the study names its pinned stages so: sec-pinned-…; a blueprint of library/sections.json says so by its structure)
  const pinned = /^sec-pinned-/.test(bp?.id || '') || bp?.structure === 'stage' || said.some((t) => (/^pinned\b/i.test(t) || PIN_WORDS.test(t)) && !NO_PIN.test(t));
  if (!pinned && !said.some((t) => HOLD_WORDS.test(t) && !NO_PIN.test(t) && !NATIVE_SCROLL.test(t))) return 0;
  // "about two screens", "about 2640px of scroll", "a wrapper 300vh tall", "about 200svh of scroll", "about 800px of
  // scroll per scene, three scenes"; two screens when it does not say (one for a hold written in words)
  const n = text.match(/\b(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight) (?:full )?(?:screens?|viewports?)\b/i);
  const steps = text.match(/\b(\d{3,4})px of (?:pinned )?scroll (?:per|a|each) (?:scene|step|beat|stop)\b[^.]*?\b(two|three|four|five|six|[2-6]) (?:scenes|steps|beats|stops)\b|\b(two|three|four|five|six|[2-6]) (?:scenes|steps|beats|stops) of (?:about )?(\d{3,4})px\b/i);
  const px = text.match(/\b(\d{3,4})px of (?:pinned )?scroll\b|\b(?:lasting|over) (?:about )?(\d{3,4})px\b/i);
  // (a wrapper is its hold and one screen tall; the scroll it names is the hold itself)
  const vh = text.match(/\b(\d{3})s?vh (?:long|tall)\b|\bwrapper (?:about )?(\d{3})(?:[–-]\d{3})?s?vh\b|\b(\d{3})s?vh of (?:scroll|pin)\b/i);
  const held = n ? (n[1].toLowerCase() === 'one' ? 1 : asNumber(n[1])) : steps ? (+(steps[1] || steps[4]) * asNumber(steps[2] || steps[3])) / 900 : px ? +(px[1] || px[2]) / 900 : vh ? (vh[3] ? +vh[3] : +(vh[1] || vh[2]) - 100) / 100 : pinned ? 2 : 1;
  // (held three screens at most: the adjustment under a longer one cuts it back)
  return Math.min(3, Math.max(1, Math.round(held * 2) / 2));
}
// The shape of a first screen, for the history: a split (the archetype, or a hero that splits the screen), a library
// archetype, or none for a pattern of the study (each its own composition).
function heroShape(h) { return !h ? null : h.split || h.archetype === 'split' ? 'split' : h.pattern && h.archetype === 'pattern' ? null : h.archetype || null; }
// Small moves beyond the basics (the motion patterns not marked basic): never a WebGL world, a pin, a scroll that is not
// native, a preloader, a counter, a cursor in place of the pointer, a drawn line, a footer uncovered from under the
// page, a move that makes something enter on load or entry (the dealt entrance owns arrival and its rule below the
// fold), or a hover on the buttons (section 0's button design has its own).
const NOT_A_MOVE = /^mo-(?:3d|gl|pin|hpan|pre|nav|route|counter|drag|vector|shape|physics|scroll|colour|reveal)-/;
function smallMove(e) {
  if (e.basic === true || NOT_A_MOVE.test(e.id)) return false;
  const d = `${e.name || ''}. ${e.description}`;
  // (particles are read in its phone version too: a click burst whose phone line says particles is particles)
  const all = `${d} ${e.phone || ''}`;
  // a move that is the call to action or rides on a button is a button design (section 0 deals one for the page; round
  // 12's first run dealt a ticker inside the main button on seven of thirty pages), and a theme switch recolours the
  // dealt palette
  if (says(all, /\bcall to action\b|\bpill-shaped link\b|\b(?:word|label|link) or button\b|\btheme switch\b/i)) return false;
  if (/\bWebGL\b|\bshader\b|\bcanvas\b|\bpost pass\b|\b3D\b|\bno native scroll\b|\bscroll(?:er| is)? lock|\bwheel\b|\bprogress\b|\bpre-?loader\b|\bcounter\b|\bnative cursor\b|\bcustom (?:dot )?cursor\b|\bSVG\b|\bstroke\b|\bfixed footer\b|\bpage-swap\b|\broutes?\b|\bstacked scenes\b|\btimed keyframes\b/i.test(d)) return false;
  // the house rules: no drawn shapes, decoration or illustration, no outline or glow, no colour sprawl, nothing that
  // flickers, beeps or splits into RGB ghosts, no picture in a line of type, no hero slides on a timer
  if (/\bparticles?\b|\bshapes?\b|\bdecor\b|\bline drawings?\b|\billustrat\w*|\bsprites?\b|\bicons?\b|\bbadge\b|\boutlined?\b|\bring\b|\bglow\b|\btheme colou?r\b|\bsound\b|\bbeep\b|\bflicker\b|\bhard-cuts?\b|\bRGB\b|\bchromatic\b|\bauto-advance\b|\bon a timer\b|\bown photo in a window\b|\bscroll hint\b|\bhow to scroll\b|\bspine\b|\bnumber tile\b/i.test(d) || says(all, /\bparticles?\b|\bconfetti\b|\bgrain\b|\bnoise tile\b/i) || /^mo-carousel-hero|^mo-video-clip-cycle/.test(e.id)) return false;
  // no word split into flying letters (references/scenes.md: every frame reads whole)
  if (/\bscatter\w*\b|\bcharacters apart\b|\bsplitting (?:characters|letters)\b|\bslot machine\b|\bflying letters\b/i.test(d)) return false;
  // ("Nothing pins" is no pin)
  if (says(d, /\bpinned\b|(?<!\bnothing )\bpins\b/i)) return false;
  // an arrival: on load or entry, or a rise or fade that no scroll, hover, click or pointer drives ("once the block
  // passes" is a when, not a single arrival: a scrubbed blur that reverses once the block passes was left out)
  if (says(d, /\bon (?:load|entry|arrival)\b|\bonce\b(?! (?:the|it|they|this|its|their)\b)|\bas (?:it|they) (?:enters?|arrives?)\b|\bentering\b/i) || (/\b(?:rises?|fades? in|slides? (?:up|in)|arrives?|pops?|drops?|types? in)\b/i.test(d) && !/\bscroll|\bscrub|\bhover|\bclick|\btap|\bpointer\b|\bcursor\b/i.test(d))) return false;
  if (moveKind(e) === 'hover' && says(d, /\bbuttons?\b/i)) return false;
  // no heading laid on a picture (round 11b: "Cover rises and grows" asked for an h1 on a photograph, a second h1), no
  // fills of its own (a band, bars, rows or cards that are not section 0's card style: round 11b dealt three tints), and
  // nothing that hides the navigation on the way down (section 0's never hides); a hover, focus or active state in the
  // ink or the surface tone is the palette's own, no fill of its own (a row that takes the ink fill under the hand)
  if (says(d, MOVE_ON_PICTURE) || says(d.split(/(?<=\.)\s+/).filter((t) => !/\bdealt card style\b/.test(t) && !PALETTE_STATE(t)).join(' '), MOVE_FILLS)) return false;
  if (/\bnav(?:igation)?\b|\bbar\b|\bheader\b/i.test(d) && hidesOnScroll(e)) return false;
  return true;
}
const MOVE_ON_PICTURE = /\b(?:headlines?|headings?|h1|titles?)\b[^.]{0,120}\b(?:on|over|across) (?:the |a |its )?(?:picture|photo(?:graph)?|image|cover|clip|footage|video)\b|\b(?:pictures?|photo(?:graph)?s?|covers?|images?)\b[^.]{0,40}\b(?:carrying|carries|holding|holds) (?:a |the )?(?:headline|heading|h1|title)\b|\bunder the type\b|\b(?:in front of|behind) (?:the |a )?(?:picture|figure|cut-?out|photo\w*)\b/i;
const MOVE_FILLS = /\btints?\b|\bfills?:|\bfilled (?:bars?|bands?|blocks?|discs?|circles?|shapes?|squares?|strips?)\b|\b(?:takes?|turns?) the (?:ink|accent) fill\b|\bon the ink field\b|\b(?:cards?|tiles?|bars?|bands?|rows?|panels?|blocks?) (?:is |are )?(?:on|in) the (?:surface tone|ink|accent)\b/i;
const PALETTE_STATE = (t) => /\bhover\w*|\bfocus\w*|\bactive\b|\bpress\w*|\bselected\b|\b(?:takes?|turns?) the (?:ink|surface)\b/i.test(t) && !/\btints?\b|\baccent\b|\bnew (?:hue|colou?r)\b/i.test(t);
const P_MOVES = PATTERNS.motion.filter(smallMove);
// type notes: never a monospace voice, a system with no display step or a single step
const P_TYPES = PATTERNS.type.filter((e) => !says(`${e.name || ''}. ${e.description}`, /\bmono(?:space)?\b/i) && !/\bno display\b|\bonly one step\b|\bexactly one step\b|\bscene-level\b|\bno big display\b/i.test(e.description));
// the kind of a move (hover, text, parallax, …): one of each kind on a page
function moveKind(e) { const m = String(e.id).match(/^mo-([a-z0-9]+)-/); return m ? m[1] : String(e.name || e.id).toLowerCase().split(/\s+/)[0]; }

// a hero pattern whose large picture is the product's own interface (the one kind a software first screen takes)
const SHOWS_UI = /\binterface\b|\bUI\b|\bproduct (?:window|screen|shot|frame)s?\b|\bproduct in use\b|\bdevice\b|\bscreenshots?\b|\bapp (?:window|screen)s?\b|\bdemo window\b|\bdashboard\b|\bmock-?ups?\b|\bbrowser window\b/i;
// the photographs a pattern may take on a page, by what pictures the page can honestly have (fewer where the brief says so)
const PATTERN_PICTURE_CAP = { own: Infinity, atmosphere: 6, 'no-product-photo': 3, interface: 3 };
// the photographs a whole page shows at most, by what it can honestly have (photoPlan), and the count a blueprint names
const PHOTO_CAP = { atmosphere: 6, 'no-product-photo': 5, interface: 2 };
const PHOTO_WHY = { atmosphere: 'a page with no photographs of its own can honestly show', 'no-product-photo': 'a product page with no photographs of its own can honestly show', interface: 'a software page shows beside its interface' };
// (one or two digits, and no article between: "at 1440 the frames" is a width, not 1440 photographs)
const PHOTO_COUNT = /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen|sixteen)(?:\s*(?:[–-]|to|or)\s*(\d{1,2}|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen|sixteen))?\s+(?:(?!(?:the|a|an|its|their|each|every|this|that)\s)[\w-]+\s+){0,2}?(?:photo(?:graph)?s|pictures|images|portraits|frames|stills)\b/gi;
// the photographs a product page with none of its own shows at least: its use, its load, its place (photoPlan;
// r11-p50 lost with none)
const PHOTO_FLOOR = { 'no-product-photo': 3 };
// a small move that would only repeat the dealt signature move
const SAME_AS_SIGNATURE = { 'ink-fill': /\bink fill\b|\bto full ink\b|\bpale to ink\b/i, 'edge-marquee': /\bmarquee\b|\bseamless (?:horizontal )?loop\b/i, 'sideways-gallery': /\bsideways\b|\bpans?\b/i, 'opening-window': /\b(?:widens?|grows?) to (?:full|cover)\b/i, 'sheet-over': /\bsheet\b[^.]*\bover\b/i, 'slow-crossfade': /\bcrossfades?\b/i, 'rolling-figures': /\broll\w* (?:up )?(?:digits|figures|numbers)\b/i };
// Where each kind of small move goes, printed under it.
const MOVE_WHERE = {
  hover: 'Under the hand on the cards, rows or pictures it names, never on the buttons (their hover is section 0\'s); the same on focus.',
  parallax: 'On one or two large pictures or groups, never on every one; still for reduced motion.',
  scale: 'On one picture or group, once on the page, on native scroll; still for reduced motion.',
  text: 'On one paragraph or heading of the page, never on every one, and never the hero\'s headline (the entrance has it); the words read whole at rest and for reduced motion.',
  marquee: 'Once, in the section whose content it carries; it stops on hover and for reduced motion, and everything in it is also readable without it.',
  cursor: 'For a pointer only: with touch or a keyboard the page reads the same without it, and the pointer itself stays.',
  loop: 'Once, small, where it says; still for reduced motion.',
  click: 'On the control it names, doing something real; with a keyboard too.',
  carousel: 'Stepped by its arrows and keys, never dragged; on a phone the items stack or scroll natively.',
  video: 'Only with the footage the brief has (section 0 says whether the page has video).',
  scrub: 'On native scroll in the section it fits, without a pin; still for reduced motion.',
};

// App screens (dashboards, admin, settings) have their own library and sheet: scripts/lib/app-draw.mjs.
const savedKind = (() => { try { return JSON.parse(readFileSync(sheetPath, 'utf8')).kind; } catch { return null; } })();
if (opt('app') || ((opt('show') || opt('redraw')) && savedKind === 'app')) await import('./lib/app-draw.mjs');

if (opt('list')) {
  const what = opt('list');
  if (what === 'sectors') console.log(SECTORS.join('\n'));
  else if (what === 'tones') console.log(TONES.join('\n'));
  else if (what === 'roles') console.log([...new Set(Object.values(ROLE_ALIAS))].join('\n'));
  else if (what === 'scenes') { const all = existsSync(join(LIB, 'scenes.json')) ? load('scenes') : []; for (const sc of all) console.log(`${sc.id.padEnd(34)} ${sc.name} — ${sc.family}; ${sc.summary.split(/(?<=\.)\s/)[0]} Needs: ${sceneNeedsWords(sc)}.${sc.weight === 0 || NEVER_SCENES.has(sc.id) ? ' (not dealt)' : sc.tones ? ` (only for a ${sc.tones.join(' or ')} tone)` : ''}`); if (!all.length) console.log('No scene library yet.'); }
  else if (what === 'techniques') { const all = existsSync(join(LIB, 'techniques.json')) ? load('techniques') : []; const scenes = existsSync(join(LIB, 'scenes.json')) ? load('scenes') : []; for (const t of all) { const sc = techniqueScene(t); const built = scenes.find((x) => x.source === t.id); console.log(`${t.id}  ${t.name} — ${t.family}; ${t.position}, ${t.energy}, hold ${t.hold}; ${t.sectors.join(', ')}. Needs: ${sceneNeedsWords(sc)}.${built ? ` (not dealt: now the tested scene ${built.id})` : ''}`); } if (!all.length) console.log('No technique library yet.'); }
  else if (what === 'entrances') { const all = existsSync(join(LIB, 'entrances.json')) ? load('entrances') : []; for (const e of all) console.log(`${e.id.padEnd(16)} ${e.name} — ${e.family}, ${e.energy}, weight ${e.weight}; ${e.summary || e.sees.split(/(?<=\.)\s/)[0]}`); if (!all.length) console.log('No entrance library yet.'); }
  else if (what === 'frame') {
    const FAMILY = { nav: 'nav', footer: 'footer', cards: 'card', buttons: 'button' };
    for (const [part, ids] of Object.entries(FRAME_DESIGNS)) { const n = PATTERNS[FAMILY[part]].filter((e) => partUsable(FAMILY[part], e)).length; console.log(`${part.padEnd(8)} ${ids.join(', ')}${n ? ` + ${n} patterns of the study (--list patterns)` : ''}`); }
  }
  else if (what === 'patterns') {
    // what each family holds and what the deal can use of it (section patterns by the roles they stand in for)
    const usable = { hero: P_HEROES, section: P_SECTIONS, nav: PATTERNS.nav.filter((e) => partUsable('nav', e)), footer: PATTERNS.footer.filter((e) => partUsable('footer', e)), card: PATTERNS.card.filter((e) => partUsable('card', e)), button: PATTERNS.button.filter((e) => partUsable('button', e)), type: P_TYPES, motion: P_MOVES };
    if (!PATTERN_FAMILIES.some((f) => PATTERNS[f].length)) console.log('No pattern library yet (library/patterns/*.json): the deal uses the designs alone.');
    for (const f of PATTERN_FAMILIES) {
      console.log(`## ${f}: ${PATTERNS[f].length} in the file at quality ${QUALITY_FLOOR} or more, ${usable[f].length} dealt${f === 'motion' ? ' as small moves (the basic ones and the big ones are not)' : ''}`);
      if (f === 'section') { const by = {}; for (const s of P_SECTIONS) for (const r of s.roles) (by[r] ||= []).push(s.id); for (const [r, ids] of Object.entries(by)) console.log(`${r.padEnd(13)} ${ids.join(', ')}`); }
      else if (usable[f].length) console.log(usable[f].map((e) => e.id).join(', '));
    }
  }
  else if (what === 'replays') { const all = existsSync(join(LIB, 'replays.json')) ? load('replays') : []; for (const r of all) console.log(`${r.id.padEnd(14)} ${r.name} — ${r.sectors.join(', ')}${r.brief ? ` (or a brief matching /${r.brief}/)` : ''}; ${r.beats}`); if (!all.length) console.log('No replay library yet.'); }
  else for (const d of load('directions')) console.log(`${d.id.padEnd(30)} ${d.name} — ${d.sectors.join(', ')}`);
  process.exit(0);
}
if (opt('photos')) {
  const lib = load('photos'); const q = String(opt('photos'));
  const line = (ph) => `- https://picsum.photos/id/${ph.id}/1600/1000 — ${ph.alt} · ${ph.tone} tone · ${(ph.colours || []).join(', ')}${ph.mono ? ' · black-and-white' : ''}${ph.calm && ph.calm !== 'none' ? ` · calm area: ${ph.calm}` : ''} · photo: ${ph.by}`;
  // (never one no deal takes: a logo, a house number, a plate or the inside of a café; the search found 42 first)
  const unusable = new RegExp(lib.unusable || '(?!)', 'iu'), usable = (ph) => !unusable.test(ph.alt);
  if (q === 'list' || q === 'true') { for (const [id, set] of Object.entries(lib.sets)) console.log(`${id.padEnd(22)} ${String(set.photos.length).padStart(3)} photos — ${set.note}`); }
  else if (lib.sets[q]) { console.log(`# ${lib.sets[q].title} — ${lib.sets[q].note}`); for (const ph of lib.sets[q].photos.filter(usable)) console.log(line(ph)); }
  else { // free-text search across all descriptions
    const words = q.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 3);
    const hits = Object.values(lib.sets).flatMap((s) => s.photos).filter((ph) => usable(ph) && words.some((w) => (ph.alt + ' ' + (ph.colours || []).join(' ')).toLowerCase().includes(w)));
    if (!hits.length) console.log('No photograph matches. `--photos list` shows the sets.'); else for (const ph of hits.slice(0, 24)) console.log(line(ph));
  }
  console.log('\nPath numbers are width/height; ?grayscale only where section 0 of the sheet deals the black-and-white treatment, which it does only when the brief asks for black and white. A line marked black-and-white is a black-and-white file: left out everywhere else. Photographs are atmosphere, never a stand-in for a person, and never the client\'s own product, room, house or work: section 5 of the sheet says what stands in their slots.');
  process.exit(0);
}
if (opt('site')) {
  const s = load('sites').find((x) => x.id === opt('site') || x.name.toLowerCase() === String(opt('site')).toLowerCase());
  if (!s) { console.error('No studied site with that id. Ids appear in the direction sheet under "Real references".'); process.exit(2); }
  console.log(siteCard(s, true)); process.exit(0);
}

// ---------- randomness (seedable) ----------
let seed = opt('seed') !== undefined && opt('seed') !== true ? Number(opt('seed')) : randomInt(1, 2 ** 31 - 1);
const startSeed = seed;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const wpick = (pairs) => { const t = pairs.reduce((s, [, w]) => s + w, 0); let r = rnd() * t; for (const [v, w] of pairs) { r -= w; if (r <= 0) return v; } return pairs.at(-1)[0]; };
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// prefer items not used recently, without ever emptying the pool
const fresh = (pool, recent) => { const f = pool.filter((x) => !recent.includes(x.id)); return f.length ? f : pool; };
// [item, weight] pairs weighed against the history (the hist entries' `key`, one id or a list of ids): one used in the
// last nine draws is out while `keep` others fit, and each is divided by (1 + its uses in the history), so a run of
// draws cycles through the whole pool and none comes back on more than about one page in ten (round 11: one call to
// action on seven of sixteen saas pages, one visit card on three door pages in a row; round 12: the owner asked for each
// section and component on about one page in ten). The same rule deals the frame's parts (lib/frame-deal.mjs).
// (when fewer fit, the ones of the last nine come back, the longest unused first)
const histHas = (h, key, id) => (Array.isArray(h?.[key]) ? h[key].includes(id) : h?.[key] === id);
// the pairs not used in the last nine draws, each divided by its uses in the history
const liveOf = (pairs, key) => pairs.filter(([x]) => { const at = hist.findIndex((h) => histHas(h, key, x.id)); return at < 0 || at >= RECENT_OUT; }).map(([x, wt]) => [x, wt / (1 + hist.filter((h) => histHas(h, key, x.id)).length)]);
const awayFrom = (pairs, key, keep = 2) => {
  const has = (h, id) => histHas(h, key, id);
  const w = pairs.map(([x, wt]) => {
    const at = hist.findIndex((h) => has(h, x.id));
    const damp = wt / (1 + hist.filter((h) => has(h, x.id)).length);
    return [x, damp * (at >= 0 && at < RECENT_OUT ? 0 : 1), damp * comeBack(at)];
  });
  const live = w.filter(([, v]) => v > 0);
  if (live.length >= keep) return live.map(([x, v]) => [x, v]);
  // (never the last draw's while another fits)
  const last = (x) => has(hist[0], x.id);
  const back = w.filter(([x]) => !last(x)).length ? w.filter(([x]) => !last(x)) : w;
  return back.map(([x, v, b]) => [x, v || b]);
};

// ---------- history (project + user level) ----------
const userHist = process.env.TASTE_SKILL_HISTORY || join(homedir(), '.taste-skill', 'history.json');
const readHist = () => { for (const p of [userHist]) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch {} } return []; };
const writeHist = (entry) => { try { mkdirSync(dirname(userHist), { recursive: true }); const h = readHist(); h.unshift(entry); writeFileSync(userHist, JSON.stringify(h.slice(0, 24), null, 1)); } catch {} };
const patchHist = (at, fields) => { try { const h = readHist(); const e = h.find((x) => x.at === at); if (!e || Object.entries(fields).every(([k, v]) => JSON.stringify(e[k]) === JSON.stringify(v))) return; Object.assign(e, fields); writeFileSync(userHist, JSON.stringify(h, null, 1)); } catch {} };

// ---------- show / redraw ----------
const saved = existsSync(sheetPath) ? JSON.parse(readFileSync(sheetPath, 'utf8')) : null;
if (opt('show')) {
  if (!saved) { console.error('No saved direction. Run a draw first.'); process.exit(2); }
  console.log(render(saved)); process.exit(0);
}

const L = { directions: load('directions'), heroes: load('heroes'), sections: load('sections'), type: load('type'), palettes: load('palettes'), photos: load('photos'), sites: load('sites'), motions: load('motions'), fonts: load('fonts').fonts, scenes: existsSync(join(LIB, 'scenes.json')) ? load('scenes') : [], entrances: existsSync(join(LIB, 'entrances.json')) ? load('entrances') : [], replays: existsSync(join(LIB, 'replays.json')) ? load('replays') : [] };
// a technique since built and tested as a scene (the scene's `source`) is dealt as that scene, never built fresh again
L.techniques = (existsSync(join(LIB, 'techniques.json')) ? load('techniques') : []).filter((t) => !L.scenes.some((sc) => sc.source === t.id)).map(techniqueScene);
const sceneById = (id) => L.scenes.find((x) => x.id === id) || L.techniques.find((x) => x.id === id);
// --technique <id> forces one in place of a scene (for tests); --no-technique deals none, and the sheet keeps it so
const FORCED_TECHNIQUE = opt('technique') === undefined ? null : opt('technique');
if (FORCED_TECHNIQUE === true) { console.error('--technique needs an id. `node draw.mjs --list techniques` lists them.'); process.exit(2); }
if (FORCED_TECHNIQUE && opt('no-technique')) { console.error('Use --technique <id> or --no-technique, not both.'); process.exit(2); }
const hist = readHist().map((h) => historyIds(h, PATTERN_IDS));
const recent = (key, n) => hist.slice(0, n).map((h) => h[key]).filter(Boolean);
// the value of `key` in this sector's last draw of the nine, as a list (empty when none): briefs drawn between two of
// the same sector push it out of the shorter windows
const sectorLast = (input, key) => [hist.slice(0, RECENT_OUT).find((h) => h.sector === input.sector)?.[key]].filter(Boolean);

let sheet;
if (opt('alternatives')) {
  // The other blueprints of one role that suit the saved direction: for when the dealt one cannot hold
  // the real content (it assumes three plans and there is one; it needs five quotes and there are none).
  if (!saved) { console.error('Run a draw first.'); process.exit(2); }
  const role = ROLE_ALIAS[String(opt('alternatives'))] || String(opt('alternatives'));
  // the footer is a part of the frame, dealt in section 0 from its own designs, not a section blueprint
  if (role === 'footer' && saved.frame?.footer) { console.log(`The footer is dealt in section 0 of the sheet (\`${saved.frame.footer.id}\`): ${saved.frame.footer.text}\nBuild that one; it replaces any footer blueprint. \`node draw.mjs --redraw section:footer\` deals another of section 0's designs.`); process.exit(0); }
  const dir = L.directions.find((d) => d.id === saved.direction.id);
  const current = saved.sections.find((s) => s.role === role)?.id;
  const pool = sectionPool(dir, role, saved.input);
  const pats = patternSections(dir, role, saved.input, saved).map(([s]) => s);
  if (!pool.length && !pats.length) { console.error('No blueprints for role ' + role + '. Roles: --list roles'); process.exit(2); }
  const line = (s) => `- \`${s.id}\`${s.id === current ? ' (dealt)' : ''} — **${s.name}** (${s.shape}). ${s.blueprint.split(/(?<=\.)\s/).slice(0, 2).join(' ')}\n`;
  if (pool.length) console.log(`# ${role}: blueprints that suit "${dir.name}"\n`);
  for (const s of pool) console.log(line(s));
  const software = imageryMode(saved.input) === 'interface';
  const others = L.sections.filter((s) => s.role === role && !s.banned && !hollow(s) && !pool.includes(s) && (software || !softwareOnly(s)) && (s.needs || []).every((n) => saved.input.have.includes(n) || (n === 'product-ui' && software)));
  if (others.length) {
    console.log(`# Other ${role} blueprints (written for other directions; if one fits the content better, take its geometry and set it in this direction's type, colour and manner)\n`);
    for (const s of others) console.log(line(s));
  }
  if (pats.length) {
    console.log(`# ${role}: patterns of the design-anatomy study that fit this page (its sector, tone and what it really has)\n`);
    for (const s of pats) console.log(line(s));
  }
  console.log(`Choose by what the content really is (how many plans, quotes, items exist), then: node draw.mjs --redraw section:${role}=<id>   and say why in your report.`);
  process.exit(0);
}
if (opt('redraw')) {
  if (!saved) { console.error('Nothing to redraw. Run a draw first.'); process.exit(2); }
  sheet = saved; sheet.redraws = (sheet.redraws || 0) + 1; // the sheet keeps its original seed; slot redraws are counted
  const what = String(opt('redraw'));
  const dir = L.directions.find((d) => d.id === sheet.direction.id);
  let heroTried = null; // the heroes a new hero is dealt away from (settlePins)
  if (what === 'direction') {
    // a new direction keeps the count of scene redraws, so it is no way around the limit of two, and deals none of the
    // scenes already redrawn away from
    // (the old direction's own scenes among them: r9 brought the same track back under a new direction)
    const { sceneRedraws } = sheet;
    const scenesTried = [...new Set([...(sheet.scenesTried || []), ...(sheet.scenes || []).map((x) => x.id)])];
    sheet = deal({ ...sheet.input, direction: null, avoid: [...(sheet.input.avoid || []), sheet.direction.id] }, sheet.redraws, scenesTried);
    Object.assign(sheet, { scenesTried, ...(sceneRedraws ? { sceneRedraws } : {}) });
  }
  else if (what === 'hero') { heroTried = [sheet.hero?.id]; sheet.hero = dealHero(dir, sheet.input, heroTried, sheet); }
  else if (what === 'type') { sheet.type = dealType(dir, [sheet.type?.id], sheet.input.tone, isDark(sheet.palette)); sheet.typeNote = dealTypeNote(sheet); }
  else if (what === 'moves') sheet.moves = dealMoves(sheet, (sheet.moves || []).map((m) => m.id));
  else if (what === 'palette') {
    sheet.palette = dealPalette(dir, sheet.input, [sheet.palette?.id], nameColours(sheet.input.brief).lean);
    // the type deal leaves thin text faces off dark grounds; one dealt for a pale ground is dealt again
    if (isDark(sheet.palette) && sheet.type && THIN_TEXT.has(sheet.type.text.family)) { sheet.type = dealType(dir, [sheet.type.id], sheet.input.tone, true); sheet.typeNote = dealTypeNote(sheet); }
  }
  else if (what === 'photos') sheet.photos = dealPhotos(dir, sheet.input, sheet.photos?.set);
  else if (what === 'scenes' || what.startsWith('scenes=')) {
    // the replay keeps its section; a scene never carries it or a section next to it; a kept signature move keeps its
    // stretch (keptHold)
    const reserved = sheet.replay ? [sheet.replay.carries] : []; const kept = keptHold(sheet);
    const wanted = what.startsWith('scenes=') ? what.slice(7).trim().toLowerCase() : null;
    delete sheet.lightOptions;
    // none is still allowed, but the sheet names the scenes that need no photograph or one and still fit
    if (wanted === 'none') { sheet.scenesTried = [...new Set([...(sheet.scenesTried || []), ...(sheet.scenes || []).map((x) => x.id)])]; sheet.scenes = []; sheet.noScenes = true; delete sheet.noScenesWhy; sheet.lightOptions = lightOptions(dir, sheet); }
    else if (wanted !== null) {
      // a scene taken by id: it must fit this page (sector, needs) and find a section to carry. The ones it replaces are
      // kept as dealt, so a later redraw does not bring them back (r9: a fly-through returned after a scene taken by id)
      try {
        const next = dealScenes(dir, sheet.input, [], reserved, list(wanted), false, kept);
        sheet.scenesTried = [...new Set([...(sheet.scenesTried || []), ...(sheet.scenes || []).map((x) => x.id)])];
        sheet.scenes = next; sheet.noScenes = false; delete sheet.noScenesWhy;
      } catch (e) { console.error(e.message); process.exit(2); }
    } else {
      // Scenes are redrawn twice at most: the builder of r6-p31 redrew them five times for scenes it could not fill. The
      // third asks for a choice instead: the scenes that still fit, with what each needs, and the two ways out.
      sheet.sceneRedraws = (sheet.sceneRedraws || 0) + 1;
      if (sheet.sceneRedraws > 2) {
        sheet.redraws -= 1; // a list, not a redraw
        mkdirSync(outDir, { recursive: true });
        writeFileSync(sheetPath, JSON.stringify(sheet, null, 1));
        console.log(sceneChoices(dir, sheet));
        process.exit(0);
      }
      // a technique that could not be built honestly gives way to tested scenes; otherwise the redraw may deal one again.
      // Nothing dealt on this sheet before comes back, across all its redraws: in r7-p36 two redraws both returned the
      // same fly-through.
      const hadTechnique = (sheet.scenes || []).some((x) => x.technique);
      sheet.scenesTried = [...new Set([...(sheet.scenesTried || []), ...(sheet.scenes || []).map((x) => x.id)])];
      let next = dealScenes(dir, sheet.input, sheet.scenesTried, reserved, null, false, kept);
      // (a page short of pictures may take another technique that needs none or one: better than a scene it cannot fill)
      // (and when no tested scene is left to deal, a technique that fits is dealt rather than nothing)
      if (!hadTechnique || fewPictures(sheet.input) || !next.length || next.stale) next = dealTechnique(dir, sheet.input, next, reserved, { exclude: sheet.scenesTried, always: !next.length || !!next.stale, kept });
      // (no technique dealt lately can be placed either: a scene dealt on another page lately, as the first deal does)
      if (!next.length && next.stale) next = dealScenes(dir, sheet.input, sheet.scenesTried, reserved, null, true, kept);
      if (!next.length) {
        // nothing that has not been dealt here fits: no redraw, the list of what does instead
        sheet.sceneRedraws -= 1; sheet.redraws -= 1;
        mkdirSync(outDir, { recursive: true });
        writeFileSync(sheetPath, JSON.stringify(sheet, null, 1));
        console.log(sceneChoices(dir, sheet, 'none-new'));
        process.exit(0);
      }
      sheet.scenes = next; sheet.noScenes = false; delete sheet.noScenesWhy;
    }
  } else if (what === 'entrance') sheet.entrance = dealEntrance(sheet, [sheet.entrance?.id].filter(Boolean));
  else if (what === 'replay') {
    if (!isSoftware(sheet.input)) { console.error('A product replay is dealt only on a software page (a software sector, or --have product-ui).'); process.exit(2); }
    sheet.replay = dealReplay(sheet, [sheet.replay?.id].filter(Boolean));
    if (sheet.replay) sheet.motion = null;
  }
  else if (what.startsWith('section:')) {
    // section:<role> re-deals at random; section:<role>=<id> takes a named alternative (see --alternatives)
    const [roleRaw, wanted] = what.slice(8).split('=');
    const role = ROLE_ALIAS[roleRaw] || roleRaw;
    // the footer is section 0's: another of its designs, never one this sheet has had
    if (role === 'footer' && sheet.frame) {
      if (wanted) { console.error(`The footer is one of section 0's designs (\`node draw.mjs --list frame\`), not a blueprint: \`--redraw section:footer\` deals another.`); process.exit(2); }
      sheet.frame.footer = redealFooter(sheet);
    } else {
    const i = sheet.sections.findIndex((s) => s.role === role);
    if (i === -1) { console.error('No section with role ' + role + ' in this sheet.'); process.exit(2); }
    const used = sheet.sections.map((s) => s.id);
    if (wanted) {
      // a blueprint written for another role may be borrowed when its geometry fits the content better
      // (a pattern of the study is taken the same way, by its id)
      const chosen = L.sections.find((s) => s.id === wanted) || P_SECTIONS.find((s) => s.id === wanted);
      if (!chosen) { console.error(`No blueprint with id ${wanted}. List them with --alternatives <role>.`); process.exit(2); }
      if (chosen.banned) { console.error(`${wanted} is not dealt: ${chosen.bannedWhy || 'it is retired.'}`); process.exit(2); }
      sheet.sections[i] = chosen.pattern ? { ...chosen, role, ...(chosen.roles.includes(role) ? {} : { name: `${chosen.name} (borrowed from ${chosen.role})` }) } : chosen.role === role ? chosen : { ...chosen, role, name: `${chosen.name} (borrowed from ${chosen.role})` };
    } else sheet.sections[i] = dealSection(dir, role, used, i ? sheet.sections[i - 1]?.shape : (sheet.hero?.split ? 'split' : undefined), sheet.sections[i + 1]?.shape, sheet.input, sheet) || sheet.sections[i];
    }
  } else { console.error('Unknown slot. Use hero, type, palette, photos, scenes, scenes=<id>[,<id>], scenes=none, entrance, replay, moves, section:<role>, section:<role>=<id> or direction.'); process.exit(2); }
  // a section or hero that pins counts against the scenes, after new scenes, a new section (one taken by id stays) or a
  // new hero; and a section made of pictures keeps a share of the photographs (settlePhotos)
  if (/^(?:scenes|section:|hero$)/.test(what)) {
    const [r, id] = what.slice(8).split('='); const keep = what.startsWith('section:') && id ? ROLE_ALIAS[r] || r : null;
    settlePins(sheet, keep, heroTried); settlePhotos(sheet, keep); settleStructures(sheet, keep);
  }
  // a page ends once: new scenes that close the page take a footer that does not open on its own closing line
  if (sheet.frame?.footer?.closes && closingScene(sheet)) sheet.frame.footer = redealFooter(sheet);
  // a button set in the pairing's serif goes when a new pairing has none (the frame deal's own check)
  if (sheet.frame?.buttons && frameCtx(sheet).serif === false && needsSerif(sheet.frame.buttons.text)) sheet.frame.buttons = redealButtons(sheet);
  // a new hero or new scenes can change what the first screen shows: keep the entrance only while it still fits
  if (sheet.entrance && what !== 'direction') {
    const mode = heroMode(sheet);
    sheet.entrance = entranceFits(sheet, sheet.entrance, mode) ? { ...sheet.entrance, mode } : dealEntrance(sheet, []);
    settleMotion(sheet);
  }
} else {
  const sector = String(opt('sector', ''));
  if (!SECTORS.includes(sector)) {
    console.error(`--sector is required. One of:\n  ${SECTORS.join(', ')}\nPick the closest; use "other" only when nothing fits.`);
    process.exit(2);
  }
  const requested = list(opt('sections'));
  const brief = typeof opt('brief') === 'string' ? opt('brief') : '';
  const defaults = [...DEFAULT_SECTIONS[sector]];
  if (FAQ_WORDS.test(brief) && !defaults.includes('faq')) defaults.splice(defaults.findIndex((r) => ['cta', 'contact', 'footer'].includes(r)), 0, 'faq');
  const input = {
    brief, sector,
    tone: TONES.includes(opt('tone')) ? opt('tone') : null,
    have: list(opt('have')), keep: list(opt('keep')), avoid: list(opt('avoid')),
    // (one section a role: services and benefits are the features role, and the deal finds every section, scene, pin and
    // structure by its role; three of one gave three features grids in a row)
    sections: [...new Set((requested.length ? requested : defaults).map((r) => ROLE_ALIAS[r] || r).filter((r) => r !== 'hero'))],
    direction: typeof opt('direction') === 'string' ? opt('direction') : null,
    ...(opt('no-technique') ? { noTechnique: true } : {}),
  };
  if (input.direction && !L.directions.some((d) => d.id === input.direction)) { console.error(`No direction with id ${input.direction}. List them with --list directions.`); process.exit(2); }
  if (input.direction && imageryMode(input) === 'no-product-photo' && bareForProduct(L.directions.find((d) => d.id === input.direction))) { console.error(`${input.direction} lets a product page go without a picture of the product, and this one has no photographs of its own: take another (\`--options 3\` deals three that fit).`); process.exit(2); }
  if (opt('options')) {
    const n = Math.max(2, Math.min(5, Number(opt('options')) || 3));
    const options = dealOptions(input, n);
    console.log(`# ${n} directions dealt for this brief\n`);
    console.log('Choose the one whose way of composing can best carry an idea from your inventory (SKILL.md steps 1 and 4), not the');
    console.log('most familiar one. Then deal it in full with the same command plus `--direction <id>` (and without --options).\n');
    for (const d of options) {
      console.log(`## \`${d.id}\` — ${d.name}`);
      console.log(`Idea engine: ${d.idea.split(/(?<=\.)\s/).slice(0, 2).join(' ')}`);
      console.log(`Composition: ${d.composition.split(/(?<=\.)\s/).slice(0, 2).join(' ')}`);
      if (d.needsPictures) console.log('Needs: many pictures. Without photographs of its own, each is a real picture of the subject\'s world found with scripts/assets.mjs, or a drawing you make.');
      console.log('');
    }
    process.exit(0);
  }
  sheet = deal(input, 0);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(sheetPath, JSON.stringify(sheet, null, 1));
// a slot redraw keeps the history entry of its sheet, but the scenes and the entrance it builds are the ones the next
// deal must avoid (scenes taken by id, or none, included)
const techniqueOf = (s) => (s.scenes || []).find((x) => x.technique)?.id || null;
// the photographs' set, every photograph dealt and the first two, so the next deals lead with others (dealPhotos; the
// second led too: six Kaffee Klee draws led with the same pair in turn), and the trade, whose next deal lists others;
// a lead given up with --redraw photos stays in the entry (a redraw brought 42 back after 113)
const photoHist = (s) => { const was = hist.find((h) => h.at === s.at); const ids = (s.photos?.photos || []).map((ph) => ph.id); const lead = ids.slice(0, 2); return { photoSet: s.photos?.set || null, photoLead: [...[].concat(was?.photoLead ?? []).filter((id) => !lead.includes(id)), ...lead], photoTrade: s.photos?.trade?.id || null, photoIds: [...new Set([...(was?.photoIds || []), ...ids])] }; };
// a technique given up (--redraw scenes) stays in the entry, so the next draws still avoid it
if (opt('redraw') && String(opt('redraw')) !== 'direction') patchHist(sheet.at, { sections: builtSections(sheet), ...(sheet.frame ? { frame: Object.fromEntries(Object.entries(sheet.frame).map(([k, v]) => [k, v.id])) } : {}), hero: sheet.hero?.id, heroShape: heroShape(sheet.hero), scenes: (sheet.scenes || []).map((x) => x.id), technique: techniqueOf(sheet) || hist.find((h) => h.at === sheet.at)?.technique || null, entrance: sheet.entrance?.id || null, replay: sheet.replay?.id || null, moves: (sheet.moves || []).map((m) => m.id), typeNote: sheet.typeNote?.id || null, ...photoHist(sheet) });
if (!opt('redraw') || String(opt('redraw')) === 'direction') writeHist({ at: sheet.at, direction: sheet.direction.id, type: sheet.type?.id, families: sheet.type ? [...new Set([sheet.type.display.family, sheet.type.text.family])] : [], palette: sheet.palette?.id, ground: sheet.palette?.ground || null, hue: sheet.palette?.hue || null, frame: sheet.frame ? Object.fromEntries(Object.entries(sheet.frame).map(([k, v]) => [k, v.id])) : null, hero: sheet.hero?.id, heroShape: heroShape(sheet.hero), heroSubstance: sheet.heroSubstance?.id || null, sector: sheet.input.sector, sections: builtSections(sheet), scenes: (sheet.scenes || []).map((x) => x.id), technique: techniqueOf(sheet), entrance: sheet.entrance?.id || null, replay: sheet.replay?.id || null, moves: (sheet.moves || []).map((m) => m.id), typeNote: sheet.typeNote?.id || null, ...photoHist(sheet) });
console.log(render(sheet));

// ---------- dealing ----------
// What kind of pictures this build can honestly have. It decides which blueprints are dealt and how the
// sheet tells the agent to fill picture slots.
function imageryMode(input) {
  if (input.have.includes('product-photo') || input.have.includes('photography')) return 'own';
  if (SOFTWARE.includes(input.sector)) return 'interface';
  if (['physical-product', 'ecommerce'].includes(input.sector)) return 'no-product-photo';
  return 'atmosphere';
}
// A software page (its product replay, one scene at most) is decided by what the subject is, not by its
// pictures: a saas page with its own photography is still software.
function isSoftware(input) { return SOFTWARE.includes(input.sector) || (input.have || []).includes('product-ui'); }
function pictureLed(x) { return (x.tags || []).includes('photo-led') || (x.tags || []).includes('object-led'); }
function worksWithoutPictures(x) { return !pictureLed(x) || (x.tags || []).some((t) => ['ui-led', 'type-led', 'colour-field'].includes(t)); }

// The directions that suit this brief and the assets it really has.
function directionPool(input) {
  const has = (need) => input.have.includes(need) || need === 'photography'; // the photo library covers photography
  // a direction of weight 0 stays in the library (and --direction) but is never dealt or offered
  let pool = L.directions.filter((d) => (d.sectors.includes(input.sector) || d.sectors.includes('*')) && !input.avoid.includes(d.id) && (d.weight ?? 1) > 0);
  const feasible = pool.filter((d) => (d.needs || []).every(has));
  if (feasible.length) pool = feasible;
  // directions built on photographs of the subject itself are not dealt when it has none: software shows its own
  // interface, and a product with none is shown by its designed frame and photographs of its use, its load and its
  // place, which fill its picture slots but never a direction built around a portrait of this one model
  const mode = imageryMode(input);
  if (mode === 'interface' || mode === 'no-product-photo') { const plain = pool.filter((d) => !d.needsPictures); if (plain.length >= 3) pool = plain; }
  // and never one a product page can be built in with no picture of the product (bareForProduct): r11-p50 redrew a
  // cargo-bike page to the dark room and shipped it without a bike, and lost (its frame now stands in its place)
  if (mode === 'no-product-photo') { const shown = pool.filter((d) => !bareForProduct(d)); if (shown.length >= 2) pool = shown; }
  // software shows itself large on the first screen: not a direction whose first screen has no picture, or none of whose
  // heroes sets one large (a first screen of type only was dealt to saas pages whose sheet asked for the product large)
  if (isSoftware(input)) { const meets = heroMeets(input); const shown = pool.filter((d) => !firstScreenBare(d) && heroPool(d, input).some((h) => meets(h) && heroShowsLarge(h))); if (shown.length >= 3) pool = shown; }
  // a client named for a light or a pale colour stands on a light ground with bright pictures: not a direction whose
  // grounds are nearly all dark (Hvit lost on navy-black in r6, and r7-p35 put a dark overlay on a house named white)
  if (nameColours(input.brief).lean === 'light') { const lit = pool.filter((d) => !darkDirection(d)); if (lit.length >= 3) pool = lit; }
  if (input.tone) { const toned = pool.filter((d) => (d.tones || []).includes(input.tone)); if (toned.length >= 2) pool = toned; }
  // directions that put whole pages on loud colour are dealt only when the brief asks for a loud tone
  if (!['bold', 'playful'].includes(input.tone)) { const calm = pool.filter((d) => !d.loud); if (calm.length >= 2) pool = calm; }
  if (!pool.length) pool = L.directions.filter((d) => !input.avoid.includes(d.id) && (d.weight ?? 1) > 0);
  return pool;
}
// A direction a page can be built in without a picture of its subject: its first screen has none, or its pictures are
// optional or low-key ones the open collections rarely hold for a product (directions.json `bare`).
function bareForProduct(d) { return !!d.bare || firstScreenBare(d); }
// A direction whose own palettes are nearly all on dark grounds (dark-room).
function darkDirection(d) {
  const pool = L.palettes.filter((p) => (d.palettes || []).includes(p.id) || (p.tags || []).some((t) => (d.paletteTags || []).includes(t)));
  return pool.length > 0 && pool.filter((p) => groundTone(p) === 'dark').length / pool.length > 0.8;
}
// Three directions dealt at random from the pool, for the builder to choose the one that carries its idea.
function dealOptions(input, n) {
  const pool = directionPool(input); const out = [];
  let rest = fresh(pool, recent('direction', Math.min(5, pool.length - n)));
  while (out.length < n && pool.length > out.length) {
    if (!rest.length) rest = pool.filter((d) => !out.includes(d));
    const d = pick(rest); out.push(d); rest = rest.filter((x) => x !== d);
  }
  return out;
}
function deal(input, redraws, sceneExclude = []) {
  const pool = directionPool(input);
  const forced = input.direction ? L.directions.find((d) => d.id === input.direction) : null;
  // weighted: the directions every model already reaches for carry a weight under 1 in the library, and a direction
  // whose fitting heroes were all dealt in the last eight draws a third as likely (round 11: a software direction with
  // three heroes dealt the same one twice running)
  const last8 = recent('hero', 8); const meets = heroMeets(input);
  const spent = (d) => { const hs = heroPool(d, input).filter(meets); return hs.length > 0 && hs.every((h) => last8.includes(h.id)); };
  // (the last five out while others fit, the window one or two shorter at random: with six directions to deal from, a
  // window of five dealt them in a fixed cycle, Haulet's sixth draw always the first's again)
  // (and the direction of this sector's last draw: with other briefs between, a café was dealt one direction three
  // times running, its earlier draws outside the window)
  const away = Math.max(1, Math.min(5, pool.length - 1) - Math.floor(rnd() * 3));
  const dir = forced || wpick(fresh(pool, [...recent('direction', away), ...sectorLast(input, 'direction')]).map((d) => [d, (d.weight ?? 1) * (spent(d) ? 0.3 : 1)]));
  const s = { version: 1, at: new Date().toISOString(), seed: startSeed, redraws, input, imagery: imageryMode(input), allow: dir.allow || [], direction: dir };
  s.hero = dealHero(dir, input, [], s);
  // colour first, so a dark ground never gets a hairline text face
  // a colour or a light in the client's name decides the ground from the first deal (SKILL.md step 1)
  s.palette = input.keep.includes('palette') ? null : dealPalette(dir, input, [], nameColours(input.brief).lean);
  s.type = input.keep.includes('type') ? null : dealType(dir, [], input.tone, isDark(s.palette));
  s.photos = dealPhotos(dir, input);
  // the hero's own move most of the time; otherwise any allowed move (NOT_DEALT_MOVES), so the same few do not repeat.
  // A direction built on its move's hold (pinned-poster: its composition is the sticky layer) always takes that move, so
  // the hold section 2 asks for is the one section 8 names and the page counts (round 11c: under another move's name it
  // went uncounted)
  const built = MOVE_HOLD[dir.motion] && pinHold({ blueprint: dir.composition }) ? dir.motion : null;
  const wanted = built || (rnd() < 0.4 ? null : [s.hero?.motion, dir.motion].find((id) => id && !NO_MOTION.has(id)));
  s.motion = L.motions.find((m) => m.id === wanted) || wpick(L.motions.filter((m) => !NOT_DEALT_MOVES.has(m.id)).map((m) => [m, m.id === 'stillness' ? 0.5 : 1]));
  s.sections = [];
  for (const role of input.sections) {
    // the footer is section 0's, dealt with the frame below: no blueprint is dealt for it (review-003: a banned footer
    // blueprint sat in every direction.json)
    if (role === 'footer') { s.sections.push({ id: null, role, shape: null, name: role, blueprint: null }); continue; }
    // the first section follows the hero: a split hero counts as a split (r9-p42 ran split hero, split showcase)
    const sec = dealSection(dir, role, s.sections.map((x) => x.id), s.sections.at(-1)?.shape ?? (s.hero?.split ? 'split' : undefined), null, input, s);
    if (sec) s.sections.push(sec); else s.sections.push({ id: null, role, shape: null, name: role, blueprint: null });
  }
  s.references = dealReferences(dir, input);
  // a software page's big moment is its product replaying one task in its own window, not a second scene:
  // the replay takes its section first, and the one scene goes where it neither carries nor touches it. The
  // replay is the signature move, so no other one is dealt
  s.replay = dealReplay(s, []);
  if (s.replay) s.motion = null;
  // what the hero's window shows, once the replay is known (dealSubstance)
  s.heroSubstance = dealSubstance(s);
  // a signature move kept for its hold takes one of the scenes and its screens (keptHold)
  const kept = keptHold(s);
  s.scenes = dealScenes(dir, input, sceneExclude, s.replay ? [s.replay.carries] : [], null, false, kept);
  // r9-p41: the replay took how-it-works, every scene that fits a notes app carries features or how-it-works or sits
  // next to them, so none could be placed and the sheet went from section 8 to 10. Then the replay tries its other
  // sections, with the scenes dealt round each
  if (s.replay && !s.scenes.length) moveReplay(dir, s, sceneExclude);
  // a forced technique is for the first deal only; a new direction deals at the usual rate. When still no tested scene
  // could be placed, a technique is dealt always, not one time in two (this raises the share of techniques on software
  // pages whose scenes do not fit: finance about 9 in 12)
  const technique = (always) => { try { s.scenes = dealTechnique(dir, input, s.scenes, s.replay ? [s.replay.carries] : [], { forced: opt('redraw') ? null : FORCED_TECHNIQUE, exclude: sceneExclude, always, kept }); } catch (e) { console.error(e.message); process.exit(2); } };
  const staleSlot = !!s.scenes.stale;
  technique(!s.scenes.length || staleSlot);
  // no technique could be placed either: the stale scene after all, rather than none
  if (staleSlot && !s.scenes.length) s.scenes = dealScenes(dir, input, sceneExclude, s.replay ? [s.replay.carries] : [], null, true, kept);
  // and with nothing still, the replay may take the proof or testimonial section (moveReplay)
  if (s.replay && !s.scenes.length && moveReplay(dir, s, sceneExclude, ['proof', 'testimonial'])) technique(false);
  if (!s.scenes.length) { s.noScenes = true; s.noScenesWhy = noSceneWhy(s); }
  // a section or a hero that pins counts against the scenes (settlePins); and no structure comes three times or twice
  // in a row once the scenes and the replay have their sections (settleStructures), before the frame is dealt to the
  // sections as they stand (frameCtx)
  settlePins(s, null, []);
  settleStructures(s);
  // the frames of the draws in the history (24): the navigation, footer, cards and buttons are dealt from the designs
  // and the study's patterns, away from the last nine and from the ones it holds most, so none comes back on more than
  // about one page in ten (lib/frame-deal.mjs)
  const history = hist.map((h) => h.frame).filter(Boolean);
  // black-and-white pictures only where the brief asks for them (lib/frame-deal.mjs); everywhere else they keep colour
  const ctx = frameCtx(s);
  s.frame = dealFrame({ rnd, input, imagery: s.imagery, history, ctx, bw: asksBW(input), patterns: PATTERNS, pc: patternCtx(dir, input, s) });
  // a section made of pictures keeps a share of the page's photographs, once the footer's is known (settlePhotos), and
  // the structures are settled again around one dealt anew for that. A section dealt anew may be a visit block or ask for
  // an email the footer already has: then another footer (round 11c: an address section over the hours-and-place footer)
  settlePhotos(s);
  settleStructures(s);
  if (['visitShown', 'emailElsewhere'].some((k) => frameCtx(s)[k] && !ctx[k])) s.frame.footer = redealFooter(s);
  // last, because whether an entrance fits depends on the hero, the move and the scenes
  s.entrance = dealEntrance(s, []);
  settleMotion(s);
  // two or three small moves from the study, around the signature move and the entrance; a note on how the dealt type
  // is set, from a type pattern of the same kind
  s.moves = dealMoves(s, []);
  s.typeNote = dealTypeNote(s);
  return s;
}
// ---------- the study's patterns on this page ----------
// What a pattern is fitted against (lib/frame-deal.mjs, fitPool): the sector, the tones (the brief's, or the
// direction's when it gives none), whether the page is software and has footage, the assets it has (pageAssets), the
// photographs it can honestly show and its photograph total, how much air it wants, and what is already dealt on the
// sheet (for the clashes a pattern names, avoidWith).
function patternCtx(dir, input, s = null) {
  const dealt = new Set(); const avoid = new Set();
  const add = (x) => { if (!x?.id) return; dealt.add(String(x.id).toLowerCase()); for (const a of x.avoidWith || []) avoid.add(String(a).toLowerCase()); };
  if (s) {
    add(s.hero); (s.sections || []).forEach(add); (s.scenes || []).forEach(add); (s.moves || []).forEach(add);
    if (s.frame) for (const k of ['nav', 'footer', 'cards', 'buttons']) add(s.frame[k]);
    // the kinds of thing the page has, as a pattern's avoidWith may name them
    if (s.scenes?.length) ['scene', 'scroll-scene', 'pinned', 'pinned-scene'].forEach((k) => dealt.add(k));
    if (s.replay) ['replay', 'product-replay'].forEach((k) => dealt.add(k));
    if (s.frame && s.frame.clip?.id !== 'none') dealt.add('video');
    if (s.palette && isDark(s.palette)) dealt.add('dark-ground');
    if (s.hero?.split) dealt.add('split-hero');
  }
  return {
    sector: input.sector, tones: studyTones(input.tone ? [input.tone] : dir?.tones || []),
    loud: ['bold', 'playful'].includes(input.tone) || (!input.tone && creativePage(input)),
    software: isSoftware(input), video: (input.have || []).includes('video'), assets: pageAssets(input, isSoftware(input)),
    // (never more than the page's photograph total, photoPlan's cap: a pattern that takes more is not dealt)
    pictureCap: Math.min(fewPictures(input) ? 1 : PATTERN_PICTURE_CAP[imageryMode(input)] ?? Infinity, photoCap(dir?.pictures ?? 6, imageryMode(input), input.sector)),
    // a quiet or luxurious page wants air; a site with pages beyond this one (software, shops, schools, events) may
    // take a dense pattern; the rest a balanced one
    density: ['quiet', 'luxury'].includes(input.tone) ? 'airy' : isSoftware(input) || ['ecommerce', 'physical-product', 'education', 'event'].includes(input.sector) ? 'dense-ok' : 'balanced',
    dealt, avoid,
  };
}
// the page's photograph total at most (photoPlan's cap): the direction's budget, held to what the page can honestly
// show by its imagery mode and a portfolio's three, raised to a product page's floor
// (a portfolio without pictures of its own shows its work in the other slots, and one photograph of its place at most)
function photoCap(budget, mode, sector) {
  return Math.max(PHOTO_FLOOR[mode] || 0, Math.min(budget, PHOTO_CAP[mode] ?? Infinity, PORTFOLIO.includes(sector) && mode !== 'own' ? 3 : Infinity));
}
// The study's hero patterns that can open this page, as [hero, weight], by the rules the direction's heroes keep
// (heroPool): software shows its own interface large, a product with no photographs of its own shows its frame large
// or opens on type, a direction whose first screen has no picture takes none with one, a client named for a light gets
// no dark first screen, and no picture is turned grey unless the brief asks.
function patternHeroes(dir, input, exclude = [], s = null) {
  const meets = heroMeets(input);
  // (on software the large picture is the interface itself: a pattern hero over footage, a 3D world or a photograph
  // took six of eight software first screens in round 12's first run; kept before the tone, so the few that fit are not
  // lost to the many of the page's tone that cannot: round 11e dealt none in 65 software draws)
  const own = isSoftware(input) ? P_HEROES.filter((h) => (h.pneeds?.productUi || (heroShowsLarge(h) && SHOWS_UI.test(h.blueprint))) && productBeside(h)) : P_HEROES;
  let list = fitPool(own, patternCtx(dir, input, s), 3).filter(([h]) => !exclude.includes(h.id) && meets(h));
  if (imageryMode(input) === 'no-product-photo') list = list.filter(([h]) => heroNoPicture(h) || heroShowsLarge(h));
  if (firstScreenBare(dir)) list = list.filter(([h]) => heroNoPicture(h));
  if (!asksBW(input)) list = list.filter(([h]) => !/gr[ae]yscale|black-and-white/i.test(h.blueprint));
  if (nameColours(input.brief).lean === 'light') list = list.filter(([h]) => !/low-key|near-black|in the dark(?! ink)|darken|brightness\(0\.|All type is white/i.test(h.blueprint));
  return list.map(([h, w]) => [h, w * PATTERN_SHARE.hero]);
}
// The study's section patterns that can stand in for a blueprint of this role on this page, as [blueprint, weight].
function patternSections(dir, role, input, s = null) {
  if (role === 'footer') return [];
  // a portfolio's work is pictures of the work, its own or marked slots for it, never stand-ins: no cap on them, and
  // never a work section of type alone (r11-p51 showed a motion designer's work only as type cards)
  const work = role === 'work' && PORTFOLIO.includes(input.sector);
  const pc = work ? { ...patternCtx(dir, input, s), pictureCap: Infinity } : patternCtx(dir, input, s);
  // (a place's contact section holds its visit block: never a sign-up card there, whose column holds "nothing else";
  // round 11c dealt a guesthouse a ticket-style newsletter card as its contact)
  const signup = role === 'contact' && hasDoor(input);
  const list = P_SECTIONS.filter((x) => x.roles.includes(role) && (!work || picturesLead(x)) && !(signup && /\bsign ?up\b|\bnewsletter\b|\bsubscri\w*/i.test(`${x.id} ${x.name}`)));
  return fitPool(list, pc, 2).map(([bp, w]) => [bp.role === role ? bp : { ...bp, role }, w * PATTERN_SHARE.section]);
}
// A pattern whose pictures are its main element: never one whose pictures are chips, thumbnails or icons beside rows of
// titles, or all smaller than about 200px with nothing full-width (r11-p51's work as type rows: round 11b dealt title
// rows with 64px picture chips as a motion designer's work).
function picturesLead(bp) {
  if (!patternPictures(bp)) return false;
  const SMALL_PICTURES = /\bchips?\b|\bthumbnails?\b|\bthumbs\b|\bicons?\b|\bavatars?\b|\bbadges?\b|\bsmall (?:real )?(?:pictures?|photo(?:graph)?s?|images?)\b/i;
  const text = String(bp.blueprint || '').split(/\bPhone:/)[0];
  const pictured = text.split(/(?<=\.)\s+/).filter((t) => says(t, /\bpictures?\b|\bphoto(?:graph)?s?\b|\bimages?\b|\bstills?\b|\bartworks?\b|\bposters?\b|\bportraits?\b|\bclips?\b|\bvideos?\b|\bfootage\b/i));
  if (pictured.length && pictured.every((t) => SMALL_PICTURES.test(t))) return false;
  const sides = [...text.matchAll(/\b(\d{2,4}) ?[x×] ?(\d{2,4})\b/g)].map((m) => Math.max(+m[1], +m[2]));
  return !(sides.length && Math.max(...sides) < 200 && !/\bfull[- ](?:width|bleed|screen)\b|\b100s?vh\b|\bfills?\b/i.test(text));
}
// Two or three small moves from the study's motion patterns (P_MOVES: beyond the basics, nothing big, nothing that
// enters): fitted to the page, one of each kind (one hover, one scroll-linked text move, one parallax), never the
// signature move again, only feedback under the hand on a page whose signature is stillness, and each away from the
// last nine draws. exclude: ids not to deal (a redraw).
function dealMoves(s, exclude = []) {
  if (!P_MOVES.length) return [];
  const pc = patternCtx(s.direction, s.input, { ...s, moves: [] });
  const same = SAME_AS_SIGNATURE[s.motion?.id];
  // (the tone narrows the pool only while ten still fit: the small moves are few, and a move suits more tones than a
  // hero; and a move the study saw only in other sectors joins at a third of the weight, since a hover or a scrubbed
  // line suits more sectors than it was seen in: twelve saas pages in a row otherwise ran out of moves by the fourth)
  const fitted = fitPool(P_MOVES, pc, 10); const seen = new Set(fitted.map(([m]) => m.id));
  const wider = P_MOVES.filter((m) => !seen.has(m.id) && !patternWhyNot({ ...m, fits: { ...(m.fits || {}), sectors: ['*'] } }, pc)).map((m) => [m, 0.3]);
  // (a move's photographs are the page's own: it rides on a part that holds as many, or takes what the photograph total
  // leaves; round 11c dealt a strip of eight picture cards to a page whose eight were all shared out)
  const plan = photoPlan(s);
  const room = Math.max(plan.cap - plan.total, ...plan.parts.map((x) => (s.imagery === 'interface' ? x.asked : x.share) || 0), ...plan.work.map((x) => x.asked || 0), 0);
  let pool = [...fitted, ...wider].filter(([m]) => !exclude.includes(m.id) && !(same && same.test(`${m.name || ''}. ${m.description}`)) && photosNeeded(m) <= room);
  if (s.motion?.id === 'stillness') pool = pool.filter(([m]) => ['hover', 'click'].includes(moveKind(m)));
  const n = s.motion?.id === 'stillness' ? 1 : creativePage(s.input) || rnd() < 0.35 ? 3 : 2;
  const out = [];
  // Each away from the last nine draws. When none of those fits, one the last six draws did not have may come back, the
  // longest unused first, in the first two slots: the house rules leave few small moves, and with only the first slot
  // coming back pages had 1.2 moves each (round 11c; the owner finds too little motion). A third comes only fresh, so
  // one page does not take what the next needs (every slot coming back left eight of thirty pages with none). Never one
  // of the last six: round 12's first run dealt one move on seven of thirty pages, twice running.
  const lastAt = (m) => hist.findIndex((h) => histHas(h, 'moves', m.id));
  while (out.length < n) {
    const kinds = new Set(out.map(moveKind));
    const cands = pool.filter(([m]) => !kinds.has(moveKind(m)) && !out.includes(m));
    const live = liveOf(cands, 'moves');
    const back = out.length < 2 ? cands.filter(([m]) => lastAt(m) < 0 || lastAt(m) >= 6) : [];
    if (!live.length && !back.length) break;
    out.push(wpick(live.length ? live : awayFrom(back, 'moves', 1)));
  }
  return out.map((m) => ({ id: m.id, name: m.name || m.id, kind: moveKind(m), description: m.description.trim() + houseNote(m), phone: patternPhone(m), avoidWith: m.avoidWith || [] }));
}
// A note on how to set the dealt type, from a type pattern of the same kind: one or two families as dealt, serif or
// sans on the display and on the text, condensed, wide or rounded as dealt, in capitals only where the type system
// sets them; then the closer its weight and size, the likelier. Away from the last nine draws. None when nothing fits.
function typeTraits(e) {
  // (from the description alone: its name often says "over" too)
  const t = String(e.description).toLowerCase();
  const cut = t.search(/\bover\b/);
  const disp = cut < 0 ? t : t.slice(0, cut), text = cut < 0 ? '' : t.slice(cut);
  const first = disp.split(/(?<=\.)\s/).slice(0, 2).join(' ');
  const serif = (x) => /(?<!sans[- ])\bserif\b|\bdidone\b|\bold-?style\b|\btransitional\b|\bslab\b/.test(x);
  const pair = /\bover\b/.test(t) || /\bwith (?:a|an) [^.]{0,50}\b(?:text|body) (?:face|font)\b/.test(t);
  return {
    pair, dSerif: serif(disp), tSerif: pair ? serif(text) : serif(disp),
    condensed: /\bcondensed\b/.test(first), wide: /\b(?:wide|extended)\b/.test(first), rounded: /\brounded\b/.test(first),
    caps: /\bcaps\b|\bcapitals\b|\bupper-?case\b/.test(first) && !/\bmixed[- ]case\b/.test(first),
    heavy: /\b(?:bold|black|heavy|700|800|850|900)\b/.test(first), light: /\b(?:light|thin|hairline|100|200|300)\b/.test(first),
    giant: /\bgiant\b|\bscreen-filling\b|\b(?:1[2-9]|[2-9]\d)(?:\.\d+)?vw\b/.test(first),
  };
}
function dealTypeNote(s) {
  const t = s.type;
  if (!t?.display || !P_TYPES.length) return null;
  const solo = t.display.family === t.text.family;
  const dSerif = /serif|slab/.test(t.display.cls || t.class || ''), tSerif = /serif|slab/.test(t.text.cls || '');
  const fits = (e) => {
    const x = typeTraits(e);
    return x.pair === !solo && x.dSerif === dSerif && x.tSerif === tSerif && x.caps === !!t.caps
      && x.condensed === (t.display.cls === 'condensed') && x.wide === (t.display.cls === 'wide') && (!x.rounded || t.display.cls === 'rounded');
  };
  // (a hairline note for a display dealt at 500 or more, or a black one for a display at 300 or less, is out)
  const near = (e) => { const x = typeTraits(e); const w = t.display.weight || 400; if ((x.light && w >= 500) || (x.heavy && w <= 300)) return 0; return (x.heavy ? (w >= 600 ? 1.5 : 0.5) : 1) * (x.light ? (w <= 300 ? 1.5 : 0.5) : 1) * (x.giant ? (t.displayVw >= 9 ? 1.5 : 0.4) : 1); };
  const pool = fitPool(P_TYPES.filter(fits), patternCtx(s.direction, s.input, s), 2).map(([e, w]) => [e, w * near(e)]).filter(([, w]) => w > 0);
  // a pairing has few notes of its kind: one used in the last nine draws comes back only when none fresh fits, and
  // never one of the last three (then the page has none)
  const live = liveOf(pool, 'typeNote');
  const back = pool.filter(([e]) => { const at = hist.findIndex((h) => h.typeNote === e.id); return at < 0 || at >= 3; });
  if (!live.length && !back.length) return null;
  const e = wpick(live.length ? live : awayFrom(back, 'typeNote', 1));
  return { id: e.id, name: e.name || e.id, description: e.description.trim() + houseNote(e) };
}
// What the frame deal needs to know about the page (lib/frame-deal.mjs). One email form on the page (r9-p41 asked for
// the address in its closing sentence and again in a sign-up footer): no newsletter footer under a section that already
// asks for one, or when the booking block carries the email field. A hero whose headline is the name takes the
// navigations with a large wordmark less often; a page with a closing scene takes no footer with a closing line; a button
// set in the pairing's serif needs a serif in the dealt pairing (serif: unknown when the brand keeps its type).
function frameCtx(s) {
  return { door: hasDoor(s.input), emailElsewhere: s.sections.some(asksEmail) || !!bookingBlock(s), few: fewPictures(s.input), nameHero: nameHero(s.hero), closingScene: closingScene(s), visitShown: s.sections.some(visitShaped), serif: s.type ? [s.type.display, s.type.text].some((x) => /serif|slab/.test(x?.cls || '')) : null };
}
// a section blueprint that is itself a visit block (a visit card, the address rows): the visit stands there, and the
// footer that is one (hours-and-place) is not dealt beside it (round 11: a visit card over an hours-and-place footer)
function visitShaped(bp) { return !!bp?.blueprint && bp.role !== 'footer' && /\bDirections\b|\bopening hours\b|\bthe street\b/.test([bp.blueprint, bp.mobile].filter(Boolean).join(' ')); }
// a hero whose largest type is the client's name (its headline says so, or it is a giant wordmark)
function nameHero(h) { return h?.archetype === 'giant-wordmark' || /^(?:the|none beyond the) name\b/i.test(h?.headline || ''); }
// a scene that closes the page, or carries its call to action
function closingScene(s) { return (s.scenes || []).some((x) => x.position === 'closing' || x.carries === 'cta'); }
// the footer dealt in section 0 opens on the page's closing line and button: the cta section is carried by it
function ctaByFooter(s) { return !!s.frame?.footer?.closes && s.sections.some((x) => x.role === 'cta') && !closingScene(s) && s.replay?.carries !== 'cta'; }
// the blueprints the page really builds, for the history
// (the footer is section 0's whenever the sheet has a frame, and a section a scene carries is that scene: their
// blueprints are not built)
function builtSections(s) { return s.sections.filter((x) => x.id && !(x.role === 'cta' && ctaByFooter(s)) && !(x.role === 'footer' && s.frame) && !carriedBy(s, x)).map((x) => x.id); }
// The scene that is this section (it carries it from the middle, as the first screen or as the close), or null; a
// hand-over scene only opens the section it carries, and the section's own shape follows it.
function carriedBy(s, sec) { return (s.scenes || []).find((x) => x.carries === sec.role && x.position !== 'transition') || null; }
// another footer of section 0's designs, never one this sheet has had (--redraw section:footer, or new closing scenes)
function redealFooter(s) {
  s.footersTried = [...new Set([...(s.footersTried || []), s.frame.footer.id])];
  const history = hist.map((h) => h.frame).filter(Boolean);
  const pc = patternCtx(s.direction, s.input, { ...s, frame: { ...s.frame, footer: null } });
  return dealFrame({ rnd, input: s.input, imagery: s.imagery, history, ctx: frameCtx(s), bw: asksBW(s.input), patterns: PATTERNS, pc, keep: { ...s.frame, footer: null }, tried: { footer: s.footersTried } }).footer;
}
// Another button design for one the page can no longer set (a label in the pairing's serif after --redraw type dealt a
// pairing with none), away from it and the last draws.
function redealButtons(s) {
  const history = hist.map((h) => h.frame).filter(Boolean);
  const pc = patternCtx(s.direction, s.input, { ...s, frame: { ...s.frame, buttons: null } });
  return dealFrame({ rnd, input: s.input, imagery: s.imagery, history, ctx: frameCtx(s), bw: asksBW(s.input), patterns: PATTERNS, pc, keep: { ...s.frame, buttons: null }, tried: { buttons: [s.frame.buttons.id] } }).buttons;
}
// The first screen's entrance (library/entrances.json; the CSS is in assets/base.css). Every model built the same
// one (lines rising out of masks, a clip-path shutter on the picture), so it had become the plainest sign of this
// skill: it is now one of seven, dealt by weight from those that fit the tone and what the first screen shows.
// What the first screen shows: 'type-only' when the direction or the hero puts no picture there, 'interface' when the
// pictures are the product's own interface, otherwise 'photo'.
function heroMode(s) {
  const noPicture = firstScreenBare(s.direction) || s.hero?.picture === false || /\bno (?:image|picture)\b/i.test(s.hero?.blueprint || '');
  return noPicture ? 'type-only' : s.imagery === 'interface' ? 'interface' : 'photo';
}
function entranceFits(s, e, mode = heroMode(s)) {
  // no tone in the brief: the direction's own tones decide, so a quiet direction never gets the bold entrances
  const tones = s.input.tone ? [s.input.tone] : (s.direction.tones || []);
  const blueprint = s.hero?.blueprint || ''; const scenes = s.scenes || [];
  const WINDOW_SCENES = new Set(['thumbnail-becomes-the-stage', 'fly-into-the-shape', 'shaped-window-over-fixed-world']);
  const dealtPhotos = (s.photos?.photos || []).slice(0, 4);
  const meets = {
    // a page whose first screen does not move needs life somewhere else, or the inspector fails it as still
    'page-has-scene-or-moving-picture': () => scenes.length > 0 || (s.frame && s.frame.clip.id !== 'none') || s.motion?.id === 'slow-crossfade' || !!s.replay,
    'photo-in-first-screen': () => mode === 'photo',
    'ui-fragment-in-first-screen': () => mode === 'interface',
    'hero-picture-at-least-half-the-screen': () => mode !== 'type-only' && heroPictureLarge(s.hero),
    // the same trick twice on one page: a window opening on load and again on scroll
    'no-opening-window-move-on-sheet': () => s.motion?.id !== 'opening-window' && !scenes.some((x) => WINDOW_SCENES.has(x.id)) && !/small window|becomes the whole screen/i.test(blueprint),
    'no-scene-on-first-screen': () => !scenes.some((x) => x.carries === 'hero'),
    // heroes set wholly at text size (a specimen wall, a text band) have no display lines to mask or cover
    'display-headline': () => !s.hero?.noHeadline,
    // a black-and-white picture has no colour to bring up, and an img filter would snap at the end
    'no-filter-treatment': () => s.frame?.treatment?.id !== 'mono' && !/grayscale/i.test(s.direction.photoTreatment || ''),
    // on a pale photograph the over-exposed first frame is nearly the photograph and reads as a glitch
    'mid-or-dark-photos-or-dark-page': () => isDark(s.palette) || !dealtPhotos.length || dealtPhotos.filter((ph) => ph.tone !== 'light').length * 2 >= dealtPhotos.length,
  }; // the hero's height and the headline's lines are measured by the inspector on the built page
  return e.fits.imagery.includes(mode) && (!tones.length || e.fits.tones.some((t) => tones.includes(t))) && e.fits.requires.every((r) => (meets[r] || (() => true))());
}
function dealEntrance(s, exclude) {
  if (!L.entrances.length) return null;
  const mode = heroMode(s);
  const TONE_OF = { quiet: 'calm', luxury: 'calm', warm: 'calm', editorial: 'serious', technical: 'serious', bold: 'bold', playful: 'playful' };
  // Through the history (review-003: the entrance where nothing arrives on five of ten pages): one of the last three
  // draws is out while two others fit (one of the last two while any other does), this sector's last counting as one
  // of the last two, and each is divided by its uses in the last nine.
  const here = sectorLast(s.input, 'entrance');
  const last2 = [...recent('entrance', 2), ...here], last3 = [...recent('entrance', 3), ...here];
  // Stillness promises a page with no load animation: only the entrance where nothing arrives keeps that promise (when it
  // was one of the last two, another is dealt and settleMotion deals another signature move)
  if (s.motion?.id === 'stillness' && !exclude.includes('already-there') && !last2.includes('already-there')) { const still = L.entrances.find((e) => e.id === 'already-there'); if (still && entranceFits(s, still, mode)) return { ...still, mode }; }
  let pool = L.entrances.filter((e) => !exclude.includes(e.id) && entranceFits(s, e, mode));
  if (!pool.length) pool = L.entrances.filter((e) => entranceFits(s, e, mode));
  if (!pool.length) pool = L.entrances.filter((e) => e.id === 'already-there'); // nothing moves, so it fits every page
  const unused = pool.filter((e) => !last3.includes(e.id)), unused2 = pool.filter((e) => !last2.includes(e.id));
  if (unused.length >= 2) pool = unused; else if (unused2.length) pool = unused2;
  const uses = (id) => hist.slice(0, RECENT_OUT).filter((h) => h.entrance === id).length;
  // One of the same family as either of the last two builds (two mask reveals, two lens changes) is about a third as
  // likely, like the frame's history; and with no tone in the brief, the bold ones are half as likely.
  const familyOf = (id) => L.entrances.find((x) => x.id === id)?.family || id;
  const used = last2.map(familyOf);
  const e = wpick(pool.map((x) => [x, (x.weight * (x.toneWeight?.[TONE_OF[s.input.tone]] ?? 1) * (used.includes(x.family || x.id) ? 0.35 : 1) * (x.energy === 'bold' && !s.input.tone ? 0.5 : 1)) / (1 + uses(x.id))]));
  return { ...e, mode };
}
// The masked headline and the shutter are the set-type entrance now: never dealt as the signature move, with set-type
// or without it (set-type already holds both). Aperture never shares a page with the opening window, and Stillness
// (no load animation) only comes with the entrance where nothing arrives.
function settleMotion(s) {
  if (!s.motion || !s.entrance) return;
  const clash = (m) => ['masked-headline', 'shutter-image'].includes(m.id) || (m.id === 'opening-window' && s.entrance.id === 'aperture') || (m.id === 'stillness' && s.entrance.id !== 'already-there');
  if (!clash(s.motion)) return;
  // (one that holds the stage only where the page has room for another held stretch: moveRoom)
  s.motion = wpick(L.motions.filter((m) => !NOT_DEALT_MOVES.has(m.id) && !clash(m) && (!MOVE_HOLD[m.id] || moveRoom(s, MOVE_HOLD[m.id]))).map((m) => [m, m.id === 'stillness' ? 0.5 : 1]));
}
// Why a scene cannot go on this page, or null when it can: never dealt, written for other sectors, a need the brief
// does not meet, a first screen it would take from the product, a closing scene on a software page, or an atmosphere
// scene on a page that is neither loud nor creative. With sector false the sector is not asked (the deal's fallback
// when fewer than two fit it).
function sceneWhyNot(sc, input, sector = true) {
  if (sc.technique) return techniqueWhyNot(sc, input);
  if (NEVER_SCENES.has(sc.id) || (sc.weight ?? 1) <= 0) return 'it is not dealt (references/scenes.md §9 says why)';
  if (sector && !(sc.sectors || ['*']).some((x) => x === '*' || x === input.sector)) return `it is not written for a ${input.sector} page`;
  const unmet = unmetNeeds(sc, input);
  if (unmet.length) return `it needs ${unmet.map((n) => needWhy(n, input)).join(' and ')}`;
  // a client named for a light or a pale colour takes a light ground and bright pictures (imagery.md §6): never a
  // chapter on the ink that ends on a dark photograph (Hvit was dealt line-carries-colour-swap into its intro)
  if (sc.inkChapter && nameColours(input.brief).lean === 'light') return "it puts a chapter on the ink under a dark photograph, and this client's name asks for a light ground and bright pictures";
  // a product with no photographs of its own shows its frame large on the first screen; a scene there shows a place (r6-p31)
  if (imageryMode(input) === 'no-product-photo' && sc.position === 'opening') return "it takes the first screen for a picture of a place, and this page's first screen shows the product large";
  // a software page's first screen shows its own interface large: never an opening scene that carries the first screen
  // without it (r8-p38 was dealt the dither field, which allows no pictures, and had to redraw it away)
  if (isSoftware(input) && sc.position === 'opening' && !(sc.needs || []).some((n) => n.split('|').includes('product-ui'))) return "it takes the first screen, which on a software page shows the product's own interface large";
  // on a software page the product replay is the big moment: a closing scene would end the page on a second one
  if (isSoftware(input) && sc.position === 'closing') return 'a software page ends on its product, not on a closing scene';
  if (!creativePage(input) && ATMOSPHERE.has(sc.id)) return 'it carries one line and no information, which only a loud or creative page can spend';
  // a scene written for a loud brand only (scenes.json `tones`): wordmark-under-strain was dealt to quiet portfolios
  if (sc.tones && !sc.tones.includes(input.tone)) return `it is for a ${sc.tones.join(' or ')} page only, and this one is ${input.tone || 'given no tone'}`;
  return null;
}
// Why a technique cannot go on this page, or null: by its labels, with the scene rules above and two of its own (a
// software page's first screen shows its interface; the energy suits the tone). Its sector is always asked.
function techniqueWhyNot(t, input) {
  if (!TECHNIQUE_TRIGGERS.includes(t.trigger)) return 'it does not run on scroll';
  if (!t.sectors.some((x) => x === '*' || x === input.sector)) return `it is not written for a ${input.sector} page`;
  const unmet = unmetNeeds(t, input);
  if (unmet.length) return `it needs ${unmet.map((n) => needWhy(n, input)).join(' and ')}`;
  if (imageryMode(input) === 'no-product-photo' && t.position === 'opening') return "it takes the first screen, and this page's first screen shows the product large";
  if (isSoftware(input) && t.position === 'closing') return 'a software page ends on its product, not on a closing scene';
  if (isSoftware(input) && t.position === 'opening' && !t.needs.includes('product-ui')) return "it takes the first screen, which on a software page shows the product's own interface large";
  if (t.kind === 'atmosphere' && !creativePage(input)) return 'it carries atmosphere and no information, which only a loud or creative page can spend';
  // loud ones on a loud page (a bold or playful tone, or a creative sector with no tone given); calm ones never on a bold or playful one
  const loud = ['bold', 'playful'].includes(input.tone);
  if (t.energy === 'loud' && !loud && !(!input.tone && creativePage(input))) return input.tone ? `it is loud, and this page is ${input.tone}` : 'it is loud, and this page is not';
  if (t.energy === 'calm' && loud) return `it is calm, and this page is ${input.tone}`;
  return null;
}
function isAtmosphere(sc) { return ATMOSPHERE.has(sc.id) || (sc.technique && sc.kind === 'atmosphere'); }
// The needs of a scene this brief does not meet (see the vocabulary at the top).
function unmetNeeds(sc, input) {
  const mode = imageryMode(input); const have = input.have || [];
  const met = (need) => {
    const [k, v] = need.split(':');
    if (k === 'pictures') return +v <= (SCENE_PICTURE_CAP[mode] ?? Infinity);
    if (k === 'series') return !(mode in SCENE_PICTURE_CAP);
    // a reel of bare names held a dead screen on a cargo bike page (r6-p31): never there or on software
    if (k === 'names') return mode !== 'no-product-photo' && !isSoftware(input) && (have.includes('names') || NAME_SECTORS.includes(input.sector));
    if (k === 'product-ui') return isSoftware(input);
    // only a mark the client has: "no logo yet" or "designs logos" in a brief is none
    if (k === 'mark') return have.includes('mark') || have.includes('logo');
    if (k === 'route') return have.includes('route') || routeInBrief(input.brief);
    // the client's own photographs (a technique's need): a stand-in from the open collections is not its own
    if (k === 'own') return mode === 'own';
    // a document the product makes, named in the brief (a technique's need): not every product makes one
    if (k === 'document') return have.includes('document') || DOCUMENT_WORDS.test(input.brief || '');
    return k === 'photography' || have.includes(k);
  };
  return (sc.needs || []).filter((n) => !n.split('|').some(met));
}
function needWhy(need, input) {
  const cap = SCENE_PICTURE_CAP[imageryMode(input)];
  if (need.startsWith('pictures:')) return `${needWords(need)}, and this page can honestly show about ${cap}`;
  if (need.startsWith('series:')) return `${needWords(need)}, which this page cannot honestly have`;
  if (need.startsWith('names:')) return `${needWords(need)}, which ${imageryMode(input) === 'no-product-photo' || isSoftware(input) ? 'this kind of page does not list' : 'this page does not have (`--have names` when it does)'}`;
  if (need === 'own') return `${needWords(need)}, which the brief does not give (\`--have photography\` or \`product-photo\` when it does)`;
  if (need === 'document') return `${needWords(need)}, which the brief does not name (\`--have document\` when the product makes one)`;
  return `${needWords(need)}, which the brief does not give`;
}
function creativePage(input) { return ['bold', 'playful'].includes(input.tone) || ['agency', 'studio-portfolio', 'personal-portfolio', 'music', 'fashion', 'event', 'culture'].includes(input.sector); }
// How many scenes a page takes: one on a software page (its big moment is the product replay), three on a long, loud page.
function sceneMost(input) {
  const loud = ['bold', 'playful'].includes(input.tone) || (!input.tone && ['agency', 'fashion', 'music', 'event'].includes(input.sector));
  return isSoftware(input) ? 1 : input.sections.length + 1 >= 8 && loud ? 3 : 2;
}
// The page's big scroll moments (references/scenes.md): two tested scenes from different families, each
// placed on a section of the argument it can carry; three only on a long, loud page (eight sections or
// more, with a bold or playful tone, or a loud sector when no tone is given); one on a software page, whose
// big moment is the product replay. A page with scenes keeps its length budget (about 12-16 screens at
// 1440), so the scenes hold about six screens in all.
// reserved: sections a scene may neither carry nor touch (the product replay's)
// chosen: ids the builder takes (--redraw scenes=<id>,<id>), placed in that order; one that does not fit or
// cannot be placed throws, with the reason
// kept: the screens a kept signature move holds (keptHold): it takes one of the page's scenes and its hold
function dealScenes(dir, input, exclude, reserved = [], chosen = null, staleOk = false, kept = 0) {
  if (!L.scenes.length) { if (chosen) throw new Error('There is no scene library.'); return []; }
  const BUDGET = HOLD_BUDGET - kept; // screens of hold for all the page's scenes together
  const LONG = 3;     // a scene over this is the page's one long scene, and never carries the work
  const creative = creativePage(input);
  // A scene of weight 0 (scenes.json) stays in the library but is never dealt; a software page with nothing that
  // fits gets no scene at all.
  // (whether the sector is asked is decided before the exclusions: a redraw that has used up a sector's scenes deals
  // a technique or prints the list, never scenes written for other sectors)
  let sectorAsked = true;
  let pool = L.scenes.filter((sc) => !sceneWhyNot(sc, input));
  if (pool.length < 2) { sectorAsked = false; pool = L.scenes.filter((sc) => !sceneWhyNot(sc, input, false)); }
  pool = pool.filter((sc) => !exclude.includes(sc.id));
  const most = sceneMost(input) - (kept ? 1 : 0);
  if (chosen) {
    if (!chosen.length) throw new Error('Name a scene: --redraw scenes=<id>, scenes=<id>,<id> or scenes=none.');
    if (new Set(chosen).size !== chosen.length) throw new Error('The same scene is named twice.');
    if (chosen.length > most) throw new Error(`This page takes ${['', 'one scene', 'two scenes', 'three scenes'][most]} at most${kept ? ' beside its signature move, which holds the stage (section 8)' : most === 1 ? ': on a software page the product replay is the big moment' : ''}.`);
    for (const id of chosen) {
      const sc = sceneById(id);
      if (!sc) throw new Error(`No scene with id ${id}. \`node draw.mjs --list scenes\` lists them all; once scenes have been redrawn twice, \`--redraw scenes\` lists the ones that fit this page.`);
      const why = sceneWhyNot(sc, input, sectorAsked);
      if (why) throw new Error(`${id} does not fit this page: ${why}. Once scenes have been redrawn twice, \`--redraw scenes\` lists the ones that fit; \`--redraw scenes=none\` builds the page without one.`);
    }
  }
  if (!pool.length && !chosen) return []; // chosen ones are checked above (a technique may go where no scene fits)
  const roles = ['hero', ...input.sections];
  const n = Math.min(pool.length, most);
  const recentIds = hist.slice(0, 4).flatMap((h) => h.scenes || []);
  // Each scene is placed as it is picked, on a section of the argument it can carry, with a quiet section
  // between it and every other scene; a scene with no such section is not dealt. Closing scenes take their
  // latest section, the others their own first choice. At most one scene over three screens, about six
  // screens in all; a scene that carries the work holds three screens at most, so the work itself is on
  // screen by the fourth or fifth screen and not after a long ride. The exception is a scene that stops each
  // piece flat and large on the work (its byRole.work says how): it holds what its pieces need.
  const out = []; const families = new Set(); const taken = new Set();
  const reset = () => { out.length = 0; families.clear(); taken.clear(); for (const r of reserved) { const i = roles.indexOf(r); if (i >= 0) taken.add(i); } };
  reset();
  const holdOf = (sc) => sc.hold || 2;
  // a scene earns about one screen per beat: two screens of hold on most pages, three on a loud or creative one
  const cap = creative ? 3 : 2;
  // a closing scene of type holds about one screen (its own hold, never more than a screen a line): the line has been read
  const CLOSING = new Set(['cta', 'contact', 'footer']);
  // the screens such a scene holds on the work: the fly-through in stop mode (not dealt) for the most pieces it
  // takes (six: 0.7 a piece plus 0.3); sheets that tip in and away with {"rest": 0.5}, three pieces in 2.5
  const WORK_HOLD = { 'depth-card-flythrough': 0.7 * 6 + 0.3, 'sheets-tip-in-and-away': 2.5 };
  const stops = (sc, r) => r === 'work' && WORK_HOLD[sc.id] !== undefined && !!sc.byRole?.work;
  const holdAt = (sc, r) => (stops(sc, r) ? WORK_HOLD[sc.id] : Math.min(holdOf(sc), cap, CLOSING.has(r) ? sc.lines ?? Infinity : Infinity));
  const free = (r) => { const i = roles.indexOf(r); return i >= 0 && !taken.has(i) && !taken.has(i - 1) && !taken.has(i + 1); };
  // a portfolio shows its work on the first or second screen (r10-p47 spent four screens of city photographs, two of
  // them scenes, before the work): no scene on the hero or on a section before the work, unless it carries the work
  const workAt = PORTFOLIO.includes(input.sector) ? roles.indexOf('work') : -1;
  const beforeWork = (r) => workAt > 0 && r !== 'work' && roles.indexOf(r) < workAt;
  const place = (sc) => {
    if (sc.position === 'opening') return free('hero') && !(workAt > 0 && !(sc.roles || []).includes('work')) ? 'hero' : null;
    // (and a portfolio's work is pictures of the work: never a scene of type alone in its place)
    const ok = (sc.roles || []).filter((r) => r !== 'hero' && free(r) && !beforeWork(r) && !(r === 'work' && holdOf(sc) > LONG && !stops(sc, r)) && !(r === 'work' && workAt > 0 && !scenePictures(sc) && !(sc.needs || []).some((n) => /product-photo|own/.test(n))));
    if (!ok.length) return null;
    return sc.position === 'closing' ? ok.sort((a, b) => roles.indexOf(b) - roles.indexOf(a))[0] : ok[0];
  };
  const held = () => out.reduce((s, x) => s + x.hold, 0);
  // the photographs a page can honestly show are counted for its scenes together, not for each alone
  const pictureCap = SCENE_PICTURE_CAP[imageryMode(input)];
  const whyNotPlaced = (sc) => {
    if (out.some((o) => o.id === sc.id)) return 'it is already on the page';
    const kin = out.find((o) => o.family === sc.family); if (kin) return `it is of one family with ${kin.id} (${sc.family}); take two families`;
    if (isAtmosphere(sc) && out.some(isAtmosphere)) return 'a page takes one atmosphere scene at most';
    if (sc.technique && out.some((o) => o.technique)) return 'a page takes one technique at most';
    const pictures = out.reduce((t, o) => t + scenePictures(o), 0) + scenePictures(sc);
    if (pictureCap !== undefined && out.length && pictures > pictureCap) return `together the scenes would need ${pictures} photographs, and this page can honestly show about ${pictureCap}`;
    const role = place(sc);
    if (!role) return sc.position === 'opening' ? (workAt > 0 ? 'a portfolio shows its work on the first or second screen, and this scene would hold the first screen without it' : 'the first screen, or the section after it, is taken') : `none of the sections it can carry (${(sc.roles || []).filter((r) => r !== 'hero').join(', ')}) is on this page${workAt > 0 ? ' after the work' : ''} and clear of the replay and the other scenes, with a section between`;
    // the budget counts a scene at its default hold (a capped hold is a promise the builder may not keep),
    // a scene that stops its pieces on the work at the hold its pieces need
    const h = holdAt(sc, role);
    if (h > LONG && out.some((o) => o.hold > LONG)) return 'the page already has its one long scene';
    if (held() + (stops(sc, role) ? h : holdOf(sc)) > BUDGET) return 'together the scenes would hold more than about six screens';
    return null;
  };
  const allowed = (sc) => !whyNotPlaced(sc);
  const add = (sc) => { const role = place(sc); taken.add(roles.indexOf(role)); families.add(sc.family); out.push({ ...sc, carries: role, hold: holdAt(sc, role), defaultHold: holdOf(sc) }); };
  if (chosen) {
    // where each one lands depends on the order they are placed in: try every order (six at most) before refusing
    const orders = (xs) => (xs.length < 2 ? [xs] : xs.flatMap((x, i) => orders([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest])));
    let first = null;
    for (const order of orders(chosen)) {
      reset(); let why = null;
      for (const id of order) { const sc = sceneById(id); const w = whyNotPlaced(sc); if (w) { why = `${id} cannot be placed on this page: ${w}`; break; } add(sc); }
      if (!why) return out.sort((a, b) => roles.indexOf(a.carries) - roles.indexOf(b.carries));
      first ||= why;
    }
    throw new Error(chosen.length > 1 ? `These scenes do not go on this page together, in any order (${first}).` : `${first}.`);
  }
  // a page short of pictures takes the scenes that need no photograph or one first (fewPictures, at the top)
  const tiers = fewPictures(input) ? [pool.filter(lightScene), pool] : [pool];
  // A scene dealt in the last eight draws, or three times in the history, is stale: when only stale ones fit, the slot
  // goes to a researched technique instead (dealTechnique), never to the same scene again (round 11: the one scene
  // that fits an app came back on ten of thirty pages, twice running). Without techniques, the old fallback holds.
  const stale = (sc) => { const at = hist.findIndex((h) => (h.scenes || []).includes(sc.id)); return (at >= 0 && at < 8) || hist.filter((h) => (h.scenes || []).includes(sc.id)).length >= 3; };
  const techniques = !staleOk && L.techniques.length > 0 && !input.noTechnique;
  while (out.length < n) {
    let cands = [];
    // (a stale one, when nothing else is left: never one of the last two draws' while another fits)
    const older = (xs) => { const o = xs.filter((sc) => !hist.slice(0, 2).some((h) => (h.scenes || []).includes(sc.id))); return o.length ? o : xs; };
    for (const tier of tiers) { cands = (techniques ? tier.filter((sc) => !stale(sc)) : fresh(tier, recentIds)).filter(allowed); if (!cands.length && !techniques) cands = older(tier.filter(allowed)); if (cands.length) break; }
    if (!cands.length) { if (techniques && tiers.some((tier) => tier.some(allowed))) out.stale = true; break; }
    // a scene's weight (scenes.json, default 1) lowers the odds of the ones pages across models already
    // repeat, so the deal spreads over the whole library instead of the same few set pieces; and the history weighs
    // it down as it does a section (a quarter as likely in the last eight draws, divided by its uses: round 11 dealt
    // one closing scene on six of thirty pages)
    // (and when the few left weigh less than one scene between them, a technique takes the slot as often as they fall
    // short: the one scene of weight 0.3 still fitting a software page came back the draw it left the window, 4 of 30)
    const own = cands.reduce((t, c) => t + (c.weight ?? 1), 0);
    if (techniques && own < 1 && rnd() >= own) { out.stale = true; break; }
    add(wpick(cands.map((c) => { const at = hist.findIndex((h) => (h.scenes || []).includes(c.id)); return [c, (c.weight ?? 1) * (at >= 0 && at < 8 ? 0.25 : 1) / (1 + hist.filter((h) => (h.scenes || []).includes(c.id)).length)]; })));
  }
  return out.sort((a, b) => roles.indexOf(a.carries) - roles.indexOf(b.carries));
}
// About one page in two (TECHNIQUE_RATE), one researched technique takes the place of one dealt scene (or the one slot
// of a page dealt none). It is picked by its labels (techniqueWhyNot: sector, needs, position, energy), weighted by
// score, avoiding the techniques of the last few draws, and placed by the scene rules (a free section for its position
// clear of the replay and the other scenes, another family, the picture cap, the hold budget, one long scene).
// forced: an id that must go on (--technique); it throws with the reason when it cannot. exclude: ids not to deal.
// kept: the screens a kept signature move holds (dealScenes).
function dealTechnique(dir, input, scenes, reserved, { forced = null, exclude = [], always = false, kept = 0 } = {}) {
  if (!L.techniques.length || input.noTechnique) return scenes;
  // A page short of pictures takes only those that need no photograph or one, and always one when no tested scene of
  // that kind could be dealt (none, or one that wants several photographs), in place of the hungriest first, even one
  // dealt as lately as two draws back: it ends with no scene, or a scene it cannot fill, only when every light one was
  // dealt in the last two.
  const few = fewPictures(input);
  const hungry = few && (!scenes.length || scenes.some((x) => !lightScene(x)));
  if (!forced && !hungry && !always && rnd() >= TECHNIQUE_RATE) return scenes;
  const ids = scenes.map((x) => x.id);
  let why = null;
  const take = (chosen) => dealScenes(dir, input, [], reserved, chosen, false, kept);
  const placed = (t) => {
    // in the slot a stale scene left empty (dealScenes), beside the scenes dealt, when it fits there
    if (scenes.stale && ids.length) { try { const out = take([...ids, t.id]); if (out.some((x) => x.id === t.id)) return out; } catch (e) { why = e.message; } }
    // in place of each dealt scene in turn, in random order (on a page short of pictures, the hungry ones first)
    const order = ids.length ? shuffle(ids.map((_, k) => k)) : [-1];
    if (few) order.sort((a, b) => (a < 0 || b < 0 ? 0 : scenePictures(scenes[b]) - scenePictures(scenes[a])));
    for (const i of order) {
      try { const out = take([...ids.filter((_, k) => k !== i), t.id]); if (out.some((x) => x.id === t.id)) return out; } catch (e) { why = e.message; }
    }
    // on a page short of pictures, alone, keeping only the dealt scenes that need no photograph or one beside it
    if (few && ids.length) {
      const light = scenes.filter(lightScene).map((x) => x.id);
      for (const keep of [light, []]) { if (keep.length === ids.length) continue; try { const out = take([...keep, t.id]); if (out.some((x) => x.id === t.id)) return out; } catch (e) { why = e.message; } }
    }
    return null;
  };
  if (forced) {
    const t = L.techniques.find((x) => x.id === forced);
    const built = L.scenes.find((sc) => sc.source === forced);
    if (!t) throw new Error(built ? `${forced} is now the tested scene ${built.id}: deal without --technique, then take it with \`--redraw scenes=${built.id}\`.` : `No technique with id ${forced}. \`node draw.mjs --list techniques\` lists them.`);
    const unfit = techniqueWhyNot(t, input);
    if (unfit) throw new Error(`${forced} does not fit this page: ${unfit}.`);
    // in place of one dealt scene, else alone: the scene it would sit beside may clash with it
    let out = placed(t);
    if (!out) { try { out = take([t.id]); } catch (e) { why = e.message; } }
    if (!out) throw new Error(why || `${forced} cannot go on this page.`);
    return out;
  }
  let fits = L.techniques.filter((t) => !exclude.includes(t.id) && !techniqueWhyNot(t, input));
  if (few) fits = fits.filter(lightScene);
  // Through the history, like the sections and the frame: one dealt in the last nine draws is out while another can be
  // placed, each divided by its uses in the history; then one of those, the longest unused first; never one of the last
  // five, so a page whose few techniques were all dealt lately takes none (review-003: the one technique that suits a
  // notes app came back on five of ten pages, three running), unless it is hungry (above). Score 7, 8, 9 weigh 1, 2, 3;
  // one written for every sector at half, so the few that fit every page do not take most deals.
  const weight = (x) => Math.max(1, x.score - 6) * (x.sectors.includes('*') ? 0.5 : 1);
  const lastAt = (x) => hist.findIndex((h) => histHas(h, 'technique', x.id));
  const uses = (x) => hist.filter((h) => histHas(h, 'technique', x.id)).length;
  const tiers = [
    fits.filter((x) => lastAt(x) < 0 || lastAt(x) >= RECENT_OUT).map((x) => [x, weight(x) / (1 + uses(x))]),
    // (a hungry page from the third draw back: its few light ones then come back in no fixed order)
    fits.filter((x) => lastAt(x) >= (hungry ? 2 : 5) && lastAt(x) < RECENT_OUT).map((x) => [x, (weight(x) / (1 + uses(x))) * comeBack(lastAt(x))]),
  ];
  for (let pool of tiers) {
    while (pool.length) {
      const t = wpick(pool);
      const out = placed(t);
      if (out) return out;
      pool = pool.filter(([x]) => x !== t);
    }
  }
  return scenes;
}
// After two scene redraws, a choice instead of a third: every scene that fits this page and has a section to carry,
// one line each with what it needs, and the two ways out (one by id, or none).
// why: 'cap' after two redraws; 'none-new' when no scene that has not been dealt on this sheet fits
function sceneChoices(dir, s, why = 'cap') {
  const reserved = s.replay ? [s.replay.carries] : []; const kept = keptHold(s);
  const now = (s.scenes || []).map((x) => x.id); const before = s.scenesTried || [];
  const few = fewPictures(s.input);
  const fit = [];
  for (const sc of L.scenes) { try { const [d] = dealScenes(dir, s.input, [], reserved, [sc.id], false, kept); if (d) fit.push(d); } catch { /* does not fit */ } }
  const lightTechniques = few || !fit.length ? fittingTechniques(dir, s).filter(lightScene).slice(0, 5) : [];
  const most = sceneMost(s.input) - (kept ? 1 : 0);
  const o = why === 'none-new' ? ['# Scroll scenes: nothing new fits, so a choice', ''] : ['# Scroll scenes: redrawn twice, so now a choice', ''];
  o.push(why === 'none-new' ? 'Every scene that fits this page, and every technique that would, has been dealt on this sheet already, so a redraw would only deal one again. This one did not count.' : 'Scenes are redrawn at most twice: a page with one honest scene, or none, beats a fifth redraw.', '');
  if (!fit.length && !lightTechniques.length) {
    o.push('No scene in the library fits this page. Build it without one: `node draw.mjs --redraw scenes=none`, and say so in your report.');
    return o.join('\n');
  }
  // two that fit alone may still clash (one family, one section, the photographs between them): each line names the
  // ones it goes with
  const partners = new Map(fit.map((d) => [d.id, []]));
  if (most > 1) for (let i = 0; i < fit.length; i++) for (let j = i + 1; j < fit.length; j++) { try { dealScenes(dir, s.input, [], reserved, [fit[i].id, fit[j].id], false, kept); partners.get(fit[i].id).push(fit[j].id); partners.get(fit[j].id).push(fit[i].id); } catch { /* not together */ } }
  const pairs = [...partners.values()].some((x) => x.length);
  const goes = (d) => (most < 2 ? '' : partners.get(d.id).length ? ` Goes with ${partners.get(d.id).map((x) => `\`${x}\``).join(', ')}.` : ' Goes with none of the others.');
  const sceneLine = (d) => `- \`${d.id}\` — ${d.name} (${d.family}). Needs: ${sceneNeedsWords(d)}. Carries ${d.carries === 'hero' ? 'the first screen' : `the ${d.carries} section`}, hold ${d.hold}.${goes(d)}${now.includes(d.id) ? ' On the sheet now.' : before.includes(d.id) ? ' Dealt before.' : ''}`;
  const techLine = (d) => `- \`${d.id}\` — ${d.name} (${d.family}), a researched technique to build fresh. ${String(d.principle || '').split(/(?<=\.)\s/)[0]} Needs: ${sceneNeedsWords(d)}. Carries ${d.carries === 'hero' ? 'the first screen' : `the ${d.carries} section`}, hold ${d.hold}.${now.includes(d.id) ? ' On the sheet now.' : before.includes(d.id) ? ' Dealt before.' : ''}`;
  const TECH = 'A technique has no files and no demo: you build it on the shared stage (references/scenes.md §8) and check it like any scene.';
  if (few) {
    // a page short of pictures of its own subject: the ones that need no photograph or one first, tested or not
    const lightFit = fit.filter(lightScene), heavy = fit.filter((d) => !lightScene(d));
    if (lightFit.length || lightTechniques.length) {
      o.push('This page is short of pictures of its own subject. These need no photograph or one and still fit it (its sector, what the brief really has, a section free to carry them); take one of them first. Its one picture is one the page shows nowhere else; with none to spare, take one that needs no photograph.', '');
      for (const d of lightFit) o.push(sceneLine(d));
      for (const d of lightTechniques) o.push(techLine(d));
      if (lightTechniques.length) o.push('', TECH);
    }
    if (heavy.length) { o.push('', `${lightFit.length || lightTechniques.length ? 'These fit too, but need more photographs than this page is likely to find:' : 'These still fit this page (its sector, what the brief really has, a section free to carry them):'}`, ''); for (const d of heavy) o.push(sceneLine(d)); }
  } else {
    if (fit.length) { o.push('These still fit this page (its sector, what the brief really has, a section free to carry them):', ''); for (const d of fit) o.push(sceneLine(d)); }
    if (lightTechniques.length) { o.push('', 'No tested scene fits, but a researched technique that needs no photograph or one does:', ''); for (const d of lightTechniques) o.push(techLine(d)); o.push('', TECH); }
  }
  const light = fit.some(lightScene) || lightTechniques.length > 0;
  o.push('', 'Two ways out; say which in your report:');
  o.push(`- Take ${pairs ? 'one, or two that go together,' : 'one'} you can fill honestly: \`node draw.mjs --redraw scenes=<id>\`${pairs ? ', or `--redraw scenes=<id>,<id>`' : ''}.`);
  o.push(`- Build without a scene: \`node draw.mjs --redraw scenes=none\`${light ? ', only when not even one that needs no photograph or one can be filled' : ''}. The page's motion then comes from the entrance, the replay or moving pictures, and its length budget drops.`);
  return o.join('\n');
}
// Why the deal found no scene and no technique for this page, for the sheet's section 9.
function noSceneWhy(s) {
  const fits = [...L.scenes, ...(s.input.noTechnique ? [] : L.techniques)].filter((sc) => !sceneWhyNot(sc, s.input));
  if (!fits.length) return `no tested scene${s.input.noTechnique ? '' : ' or researched technique'} is written for a ${s.input.sector} page with what this brief has`;
  if (s.replay) return `the scenes${s.input.noTechnique ? '' : ' and techniques'} that fit carry sections this page does not have, the ${s.replay.carries} section the product replay holds, or a section next to it`;
  return `the scenes${s.input.noTechnique ? '' : ' and techniques'} that fit find no section of this page to carry`;
}
// The researched techniques that fit this page and find a section to carry, alone.
function fittingTechniques(dir, s) {
  const reserved = s.replay ? [s.replay.carries] : [];
  const out = [];
  for (const t of L.techniques) { try { const [d] = dealScenes(dir, s.input, [], reserved, [t.id], false, keptHold(s)); if (d) out.push(d); } catch { /* does not fit */ } }
  return out.sort((a, b) => (b.score || 0) - (a.score || 0));
}
// The scenes, then the techniques, that need no photograph or one and still fit this page: printed under a page built
// without a scene, since none should be the way out only when not even these can be filled.
function lightOptions(dir, s) {
  const reserved = s.replay ? [s.replay.carries] : [];
  const scenes = [];
  for (const sc of L.scenes.filter(lightScene)) { try { const [d] = dealScenes(dir, s.input, [], reserved, [sc.id], false, keptHold(s)); if (d) scenes.push(d.id); } catch { /* does not fit */ } }
  return [...scenes, ...fittingTechniques(dir, s).filter(lightScene).map((d) => d.id)].slice(0, 6);
}
// The product replay (library/replays.json, built with assets/replay.js): on a software page the product's
// own window, large, acts out what the product does for the visitor. The best software sites (Linear, Stripe,
// Vercel, Attio) make that their big moment, held while the visitor's scroll steps its beats. Dealt by weight
// from the patterns that fit the sector or the brief, a pattern of either of the last two builds about a third
// as likely.
function dealReplay(s, exclude = []) {
  if (!isSoftware(s.input) || !L.replays.length) return null;
  const brief = s.input.brief || '';
  const recentIds = recent('replay', 2);
  const weight = (r) => {
    const byBrief = !!r.brief && new RegExp(r.brief, 'i').test(brief);
    const bySector = r.sectors.includes('*') || r.sectors.includes(s.input.sector);
    const base = r.weightBy?.[s.input.sector] ?? r.weight;
    const w = byBrief ? r.briefWeight ?? base * 2 : base;
    return (bySector || byBrief) && !exclude.includes(r.id) ? w * (recentIds.includes(r.id) ? 0.35 : 1) : 0;
  };
  const pool = L.replays.map((r) => [r, weight(r)]).filter(([, w]) => w > 0);
  if (!pool.length) return null;
  return placeReplay(s, wpick(pool));
}
// The section it plays in: never the hero (the hero's fragment is the entrance's), never a section a scene
// carries or touches. Its own preferred sections first, then the usual places for the product.
function placeReplay(s, r) {
  const roles = ['hero', ...s.input.sections];
  const near = new Set();
  for (const sc of s.scenes || []) { const i = roles.indexOf(sc.carries); near.add(i); near.add(i - 1); near.add(i + 1); }
  const order = replayRoles(r);
  const free = (role) => role !== 'hero' && roles.includes(role) && !near.has(roles.indexOf(role));
  const carried = (role) => (s.scenes || []).some((sc) => sc.carries === role);
  const carries = order.find(free) || order.find((x) => x !== 'hero' && roles.includes(x) && !carried(x)) || s.input.sections.find((x) => !['footer', 'cta', 'faq', 'pricing'].includes(x) && !carried(x)) || null;
  return carries ? { id: r.id, name: r.name, sees: r.sees, beats: r.beats, action: r.action, phone: r.phone, carries } : null;
}
// The sections a replay may hold, best first: its own, then the usual places for the product. (Never the proof,
// testimonial or stats section: the replay is the section it holds, so the page would lose its proof.)
function replayRoles(r) { return [...new Set([...(r.roles || []), 'showcase', 'how-it-works', 'features', 'intro'])]; }
// When no scene could be placed round the replay's section: the replay tries the sections given (its own others, in
// its order; last of all the proof or testimonial section, which a product with no real customers yet cannot fill
// honestly, so the product doing its task is the proof there), the scenes are dealt round each, and it moves to the
// first that leaves a scene room. Returns whether it moved.
function moveReplay(dir, s, exclude, places) {
  const entry = L.replays.find((r) => r.id === s.replay.id);
  if (!entry) return false;
  for (const at of (places || replayRoles(entry)).filter((x) => s.input.sections.includes(x) && x !== s.replay.carries)) {
    const scenes = dealScenes(dir, s.input, exclude, [at]);
    if (scenes.length) { s.replay = { ...s.replay, carries: at }; s.scenes = scenes; return true; }
  }
  return false;
}
// The heroes this direction can deal on this brief, before the deal picks one. dirs: the directions whose heroes are
// taken (the dealt one; or every direction that suits the brief, when its own were all dealt lately; or none, for all).
function heroPool(dir, input, dirs = [dir]) {
  // the direction's own list, and any hero written for this direction since (the October 2026 study added some)
  // banned heroes (pictures in the letters, folder tabs) are never dealt; saturated first screens only for a loud tone
  const loudOk = ['bold', 'playful'].includes(input.tone);
  const allowed = (h) => !h.banned && (loudOk || !h.loud);
  let pool = L.heroes.filter((h) => allowed(h) && (!dirs.length || dirs.some((d) => (d.heroes || []).includes(h.id) || (h.directions || []).includes(d.id))));
  if (!pool.length) pool = L.heroes.filter(allowed);
  if (imageryMode(input) !== 'interface' && !input.have.includes('product-ui')) { const plain = pool.filter((h) => !softwareOnly(h)); if (plain.length) pool = plain; }
  // a product with no photographs of its own is shown large on the first screen, or the first screen is type and it
  // comes large right after: never a strip on three columns, two small doors or a small figure under open sky (r6-p31)
  const meets = heroMeets(input);
  // (a direction with none such keeps its other heroes but the sky-led ones, and the product comes right after them)
  if (imageryMode(input) === 'no-product-photo') {
    const shown = pool.filter((h) => meets(h) && (heroNoPicture(h) || heroShowsLarge(h)));
    const noSky = pool.filter((h) => meets(h) && !heroSkyLed(h));
    if (shown.length) pool = shown; else if (noSky.length) pool = noSky;
  }
  // software shows its own interface large on the first screen, at a size a visitor can read (SKILL.md step 6), so only
  // the heroes that set their picture large: never type alone, a small frame or a subject under open sky. The sheet's
  // imagery section asked for the product large over a first screen of type in round 6. directionPool keeps the
  // directions with none such away from software; one taken by --direction keeps its heroes and the sheet says so
  // (and beside the headline, never under it: a hero that sets the product beside the words shows it large there,
  // whatever its archetype; from any direction when the dealt one has no such hero, one taken by --direction too)
  if (isSoftware(input)) {
    const shown = pool.filter((h) => meets(h) && heroShowsLarge(h));
    const beside = pool.filter((h) => meets(h) && productBeside(h)); const any = L.heroes.filter((h) => allowed(h) && meets(h) && productBeside(h));
    pool = beside.length ? beside : any.length ? any : shown.length ? shown : pool;
  }
  // pictures are never turned grey by the hero's own blueprint, unless the brief asks for black and white
  if (!asksBW(input)) { const coloured = pool.filter((h) => !/gr[ae]yscale/i.test(h.blueprint || '')); if (coloured.length) pool = coloured; }
  // a client named for a light or a pale colour gets no hero that sits in the dark or darkens its picture for white
  // type (Hvit was dealt two prints in darkness and a darkened open sky beside its bright line)
  if (nameColours(input.brief).lean === 'light') { const lit = pool.filter((h) => !/low-key|near-black|in the dark(?! ink)|darken|brightness\(0\.|All type is white/i.test(h.blueprint || '')); if (lit.length) pool = lit; }
  return pool;
}
function heroMeets(input) { return (h) => (h.needs || []).every((n) => n === 'photography' || input.have.includes(n)); }
// What a software page's first screen shows in its interface (HERO_SUBSTANCES), away from the last nine draws and
// weighed down by its uses, like the hero; never what the replay shows under it (dealt after it); null on any other page.
function dealSubstance(s) {
  if (!isSoftware(s.input)) return null;
  const has = pageAssets(s.input, true);
  const pool = HERO_SUBSTANCES.filter((x) => (!x.fits || x.fits.test(s.input.brief || '')) && (!x.needs || has.has(x.needs)) && !(x.notWith || []).includes(s.replay?.id)).map((x) => [x, 1]);
  const x = wpick(awayFrom(pool, 'heroSubstance', 1));
  return { id: x.id, name: x.name, text: x.text };
}
function dealHero(dir, input, exclude, s = null) {
  const pool = heroPool(dir, input); const meets = heroMeets(input);
  const ok = pool.filter((h) => !exclude.includes(h.id) && meets(h));
  const cands = ok.length ? ok : pool.filter((h) => !exclude.includes(h.id)).length ? pool.filter((h) => !exclude.includes(h.id)) : pool;
  // The direction's heroes and the study's hero patterns that fit the page (patternHeroes), away from the heroes of the
  // last nine draws and weighed down by how often the history holds each (round 11: one hero came back on six of
  // thirty pages, twice running; round 12: none on more than about one page in ten). A direction with one to three
  // heroes left after the filters (a software direction: the product large) soon has none that is fresh: then the
  // heroes of the other directions that suit this brief, then any hero, each through the same filters and beside the
  // patterns, before one is repeated
  const pats = patternHeroes(dir, input, exclude, s);
  const fits = (h) => !exclude.includes(h.id) && meets(h) && (!firstScreenBare(dir) || heroNoPicture(h));
  // The shape goes through the history too: a hero of the shape of one of the last four pages, or of this sector's last
  // page, is out while one of another shape fits (a fifth as likely beside the study's patterns, which have no shape of
  // their own), and each is divided by its shape's uses in the last nine (review-003: a split hero on four of ten pages
  // for both briefs, though no hero itself came back; round 11b: four saas splits in five with other briefs between).
  // A tier whose fresh heroes all have such a shape gives way to the next, as a spent one does: a software direction's
  // heroes are mostly splits. A split, the shape every model reaches for, is out while one of the last nine pages has it,
  // the window the heroes themselves keep (round 11c: with four, splits came on four to six of thirty pages, once twice
  // running).
  // (a software page's split is the product beside its headline: it is out while the last software page had one, so the
  // software heroes that are not halves take every other page, and another page's split never holds it back. Round
  // 11e's first pass held none back, and every software first screen was a split. Another page still counts it: kept
  // apart both ways, a café's two photographs came the page after a notes app's window and its words)
  const soft = isSoftware(input);
  const shapes = hist.slice(0, RECENT_OUT).map((h) => (h.heroShape === 'split' && soft && !SOFTWARE.includes(h.sector) ? null : h.heroShape));
  const softSplit = hist.slice(0, RECENT_OUT).find((h) => SOFTWARE.includes(h.sector))?.heroShape === 'split';
  const lastHere = sectorLast(input, 'heroShape');
  const lately = (h) => { const k = heroShape(h); return !!k && (k === 'split' && soft ? softSplit : shapes.slice(0, k === 'split' ? RECENT_OUT : 4).includes(k) || lastHere.includes(k)); };
  const byShape = (pairs) => pairs.map(([h, w]) => { const k = heroShape(h); return [h, k ? (w * (lately(h) ? 0.2 : 1)) / (1 + shapes.filter((x) => x === k).length) : w]; });
  let first = null;
  for (const tier of [cands.map((h) => [h, 1]), heroPool(dir, input, directionPool(input)).filter(fits).map((h) => [h, 1]), heroPool(dir, input, []).filter(fits).map((h) => [h, 1])]) {
    const use = liveOf([...tier, ...pats], 'hero');
    if (!use.length) continue;
    first ||= use;
    const shaped = use.filter(([h]) => heroShape(h)), other = shaped.filter(([h]) => !lately(h)), plain = use.filter(([h]) => !heroShape(h));
    // (beside the patterns a lately shape comes back a fifth as likely, but a split of the last nine never does)
    const back = shaped.filter(([h]) => heroShape(h) !== 'split' || !lately(h));
    if (other.length || plain.length) return wpick(byShape([...plain, ...(other.length ? other : back)]));
  }
  if (first) return wpick(byShape(first));
  // (and never the last draw's hero while another fits: from the heroes of every tier, the half of them unused longest,
  // so a direction with one hero left does not deal it twice running and a small pool turns over; round 11e's software
  // runs dealt one hero twice running, another three pages apart)
  const every = new Map([...cands, ...heroPool(dir, input, directionPool(input)).filter(fits), ...heroPool(dir, input, []).filter(fits)].map((h) => [h.id, h]));
  const since = ([h]) => { const at = hist.findIndex((x) => histHas(x, 'hero', h.id)); return at < 0 ? Infinity : at; };
  const all = [...[...every.values()].map((h) => [h, 1]), ...pats].sort((a, b) => since(b) - since(a)).slice(0, Math.max(2, Math.ceil((every.size + pats.length) / 2)));
  const notLast = all.filter(([h]) => h.id !== hist[0]?.hero);
  return wpick(byShape(awayFrom(notLast.length ? notLast : all, 'hero', 1)));
}
// The first screen's picture: none, small or large (SMALL_PICTURE and SMALL_PICTURE_HEROES at the top).
function heroNoPicture(h) {
  const b = h?.blueprint || '';
  return h?.picture === false || /\bno (?:image|picture)\b/i.test(b) || !/photo|picture|image|film|footage|video|render|product|object|cut-out/i.test(b);
}
function heroPictureLarge(h) {
  if (!h || heroNoPicture(h) || SMALL_PICTURE_HEROES.has(h.id)) return false;
  // the picture and its size in one sentence: "a flat field of one soft colour fills the viewport" is not a picture
  const big = (h.blueprint || '').split(/(?<=\.)\s/).some((x) => /photo|picture|image|film|footage|video/i.test(x) && /full-bleed|100vw|100svh|fills/i.test(x));
  return !SMALL_PICTURE.has(h.archetype) || big;
}
// The size a fluid step reaches at a width, in px: lib/type-deal.mjs writes clamp(<a>rem, <b>rem + <c>vw, <d>rem).
function stepAt(v, width) {
  const m = String(v || '').match(/clamp\(\s*([\d.]+)rem,\s*(-?[\d.]+)rem\s*\+\s*([\d.]+)vw,\s*([\d.]+)rem\s*\)/);
  if (!m) return null;
  const [a, b, c, d] = m.slice(1).map(Number);
  return Math.min(Math.max(a * 16, b * 16 + (c * width) / 100), d * 16);
}
// The display step of a split hero: the same floor for phones, about 76px at 1440, up to 88px or the step's own top.
function splitDisplay(v) {
  const m = String(v || '').match(/clamp\(\s*([\d.]+)rem,.*?,\s*([\d.]+)rem\s*\)/);
  return m ? `clamp(${m[1]}rem, 0.600rem + 4.60vw, ${Math.max(+m[2], 5.5).toFixed(3)}rem)` : v;
}
// The headline size a hero blueprint gives at 1440, in px (0 when it names none): a clamp() of display type (its floor
// 40px or more: "both are set at clamp(72px, 9vw, 140px)"), or in a sentence about the headline, the name or the words
// the size set before it ("a 250px two-line heavy sans title") or the height of its letters, as a font size (capitals
// stand about 0.72 of it: "the letters stand about 280px tall" is a 390px face). Never a width, a gap or a distance
// ("a centred column about 830px wide holds the headline", "40px under the headline"), and never a sentence that sets
// the headline at the display step.
function heroSize(h) {
  let px = 0;
  for (const t of String(h?.blueprint || '').split(/\bPhone:|\bOn a phone\b/)[0].split(/(?<=\.)\s+/)) {
    if (/\bat the display step\b/i.test(t)) continue;
    const named = /\b(?:headline|h1|name|words?|title|letters|statement)\b/i.test(t);
    // (not the wordmark's: a logo set large is no headline)
    for (const m of t.matchAll(/clamp\(\s*(\d+)px,\s*([\d.]+)vw,\s*(\d+)px\s*\)/g)) if (+m[1] >= 40 && (named || !/\bwordmark\b|\blogo\b/i.test(t))) px = Math.max(px, Math.min(Math.max(+m[1], 14.4 * m[2]), +m[3]));
    if (!named) continue;
    const tall = t.match(/\b(?:words?|letters|name|headline)\b[^.]{0,80}?\b(\d{3})px tall\b/i);
    if (tall) px = Math.max(px, +tall[1] / 0.72);
    const set = [...t.matchAll(/\b(\d{2,3})px ((?:[\w-]+ ){0,4})(?:headline|title|name)\b/gi)].filter((m) => !m[2].split(' ').some((w) => /^(?:wide|high|gap|column|from|under|above|below|margin|apart|beside|clear|across|between|in|down|up|left|right|of)$/i.test(w)));
    for (const m of set) px = Math.max(px, +m[1]);
  }
  return Math.round(px);
}
// The hero's own display step, where its blueprint sets the headline well above the type system's (by 15% at 1440):
// on the first screen the hero's geometry and its display size win over the six steps (r12-p53 and r12-p58 asked for
// 120px and for words about 430px tall, and were built at the 72-84px step: timid both times). Within the house rules:
// the blueprint's size at 1440, never taller than its lines fit under the bar (two lines in 34svh, about 306px by 900;
// one line or one word in 56svh), and the display step's own floor on a phone. Measured against what the display step
// reaches at 1440, a split hero's raised. Beside the product's window on a software page it also comes down to the
// blueprint's size (about 5.4vw where it names none): a 130px display step in five columns beside the window does not
// hold two lines, and the sheet says never to set the headline smaller to make room (round 11e).
function heroStep(s) {
  const disp = s.type?.scale?.['step-display']; const own = stepAt(disp, 1440);
  const at = s.hero?.split && own !== null && own < 72 ? stepAt(splitDisplay(disp), 1440) : own;
  const beside = !!s.heroSubstance && productBeside(s.hero);
  const px = heroSize(s.hero) || (beside ? 78 : 0); const floor = String(disp || '').match(/clamp\(\s*([\d.]+)rem/)?.[1];
  if (!px || !floor || at === null) return null;
  const lower = beside && at >= px * 1.15;
  if (px < at * 1.15 && !lower) return null;
  const said = String(s.hero.blueprint).split(/\bPhone:|\bOn a phone\b/)[0].split(/(?<=\.)\s+/).filter((t) => /\b(?:headline|name|words?|title|statement)\b/i.test(t)).join(' ');
  const tall = /\b(?:on )?one line\b|\bnowrap\b|\bone (?:[\w-]+ ){0,2}word\b/i.test(said) ? 56 : 34;
  return { asked: px, at: Math.round(at), tall, lower, px: Math.round(Math.min(px, (tall * 900) / 100)), css: `clamp(${Math.min(+floor, px / 16).toFixed(3)}rem, min(${(px / 14.4).toFixed(2)}vw, ${tall}svh), ${(px / 16).toFixed(3)}rem)` };
}
// a hero chosen for its open sky sets the subject low and small under it
function heroSkyLed(h) { return /\b(?:sky|horizon)\b/i.test(h?.blueprint || ''); }
// a first screen whose picture shows the product large enough to see: large, and not a small subject under open sky
function heroShowsLarge(h) { return heroPictureLarge(h) && !heroSkyLed(h); }
// a direction whose own first screen has no picture, whatever hero it deals
function firstScreenBare(d) { return d.photos === false || /first screen has no picture/i.test(d.imagery || ''); }
// Type is dealt from the font collection (library/fonts.json): the kind of pairing, the faces, weights,
// case and a six-step scale, avoiding the faces of recent builds. The direction leans the deal, never fixes it.
function isDark(p) { return groundTone(p) === 'dark'; }
// dark, light (white, off-white, stone, a pale tint) or mid (a coloured field)
function groundTone(p) { if (!p?.bg || !/^#[0-9a-f]{6}$/i.test(p.bg)) return 'mid'; const n = parseInt(p.bg.slice(1), 16); const y = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; return y < 0.35 ? 'dark' : y >= 0.8 ? 'light' : 'mid'; }
function dealType(dir, exclude, tone, dark = false) {
  const recentFamilies = hist.slice(0, 6).flatMap((h) => h.families || []);
  const without = exclude.filter(Boolean).flatMap((id) => L.fonts.filter((f) => String(id).includes(f.family.toLowerCase().replace(/\s+/g, '-'))).map((f) => f.family));
  return dealTypeSystem({ rnd, fonts: L.fonts, tone: tone || null, dirClasses: dir.typeClasses || [], recentFamilies, exclude: without, dark });
}
// Colour: about half the time a restrained palette generated for this page (one ground, one ink, one
// accent), otherwise a studied palette from the library. Loud, many-field palettes are dealt only for a
// bold or playful tone: on other pages they made the site look like a sweet shop.
function LOUD(p) { return (p.tags || []).some((t) => ['flat-loud', 'pastel-fields'].includes(t)) || (p.fields || []).length >= 3; }
function dealPalette(dir, input, exclude, lean = null) {
  // a redraw for a client whose name names a light or a dark colour (Hvit, Ember) keeps to that ground
  if (lean) {
    let p = null; const tried = [...exclude];
    for (let i = 0; i < 16; i++) { p = dealPalette(dir, input, tried); if (groundTone(p) === lean) return p; tried.push(p?.id); }
    return p;
  }
  const loudOk = ['bold', 'playful'].includes(input.tone);
  const recentGrounds = hist.slice(0, 4).map((h) => h.ground).filter(Boolean);
  if (rnd() < 0.55) return readableMuted(offViolet(dealPaletteV25({ rnd, tone: input.tone, recent: [...recentGrounds, ...hist.slice(0, 3).map((h) => h.hue).filter(Boolean)] })));
  let pool = L.palettes.filter((p) => (dir.palettes || []).includes(p.id) || (p.tags || []).some((t) => (dir.paletteTags || []).includes(t)));
  if (!pool.length) pool = L.palettes;
  if (!loudOk) { const calm = pool.filter((p) => !LOUD(p)); pool = calm.length >= 2 ? calm : L.palettes.filter((p) => !LOUD(p)); }
  const p = pool.filter((x) => !exclude.includes(x.id));
  // (a studied palette's surface is taken to a real step from its ground first, then turned off violet, then --muted
  // stepped to read on both: 55 of the 56 stepped under 6 points, review-006's #ebebeb on #f7f7f7 among them)
  return accentFill(oneSurface(readableMuted(offViolet(firmSurface(pick(fresh(p.length ? p : pool, recent('palette', Math.min(6, pool.length - 1))))))), loudOk));
}
// An accent under 3:1 on its ground is a fill under its own text colour, never a word, a link or a thin mark (13 of the
// studied palettes, brass on paper grey among them, whose notes put it on "a single word"; the generated deal holds a
// yellow on a light ground the same way: references/colour.md §3).
function accentFill(p) {
  if (!p?.accent || !p.bg || p.accent === p.ink || contrast(p.accent, p.bg) >= 3) return p;
  return { ...p, note: `${String(p.note || '').replace(/ for the primary action and links\b/, ' for the primary action')} The accent reads under 3:1 on this ground, so, whatever this note says before, it is a fill with its own text colour (the button, one block), never the colour of a word, a link or a thin mark: those take the ink.`.trim() };
}
// The page ground and one surface tone, no more (r11-p51 used seven grounds and panels, and its judge marked the colour
// down as sprawl): a library palette keeps one band in the ink or the accent, the ink first; a bold or playful page may
// keep one of each. A field of any other colour is left out (lib/colour-deal.mjs deals the generated ones the same
// way), and a palette that loses one is named and described by what it keeps, since its own name and note describe
// the fields it lost ("Orange, sky, lime" kept no sky).
function oneSurface(p, loud) {
  if (!p?.fields?.length) return p;
  const near = (a, b) => [a, b].every((x) => /^#[0-9a-f]{6}$/i.test(x || '')) && contrast(a, b) < 1.15;
  const ink = p.fields.find((f) => near(f.bg, p.ink)), accent = p.accent !== p.ink && p.fields.find((f) => near(f.bg, p.accent) && !near(f.bg, p.ink));
  const fields = [ink, accent].filter(Boolean).slice(0, loud ? 2 : 1);
  if (fields.length === p.fields.length) return p;
  const word = colourWord, kind = (f) => (f === ink ? 'the ink as ground' : `the ${word(p.accent)} accent`);
  const name = `${word(p.bg)[0].toUpperCase()}${word(p.bg).slice(1)}${p.accent !== p.ink ? ` and ${word(p.accent)}` : ` and ${word(p.ink)}`}`;
  const note = `A studied palette with its other fields left out: ${word(p.bg)} ground, ${word(p.ink)} ink${p.accent !== p.ink ? `, one ${word(p.accent)} accent for the primary action and links` : ', the action set in the ink'}. ${fields.length ? `Two grounds and ${fields.length > 1 ? 'two bands' : 'one band'}: the page ground and --surface, and ${fields.map(kind).join(' and ')}, one section at most${fields.length > 1 ? ' each' : ''}.` : 'Two grounds, no field: the page ground and --surface.'} Every other colour on the page comes from photographs or the product.`;
  return { ...p, fields, name, note, trimmed: true };
}
// A plain word for a colour (oneSurface): its lightness, then its hue.
function colourWord(hex) {
  const [h, s, l] = hslOf(hex);
  if (l < 0.12) return 'black';
  if (l > 0.96 && s < 0.5) return 'white';
  if (s < 0.14 || (l < 0.2 && s < 0.3)) return l < 0.3 ? 'charcoal' : l > 0.8 ? 'pale grey' : 'grey';
  const hue = [[15, 'red'], [42, 'orange'], [68, 'yellow'], [95, 'lime'], [165, 'green'], [190, 'teal'], [215, 'sky blue'], [250, 'blue'], [290, 'violet'], [335, 'pink'], [361, 'red']].find(([x]) => h < x)[1];
  // (a soft pale one or a deep one by its common name: sand, sage, brown, olive)
  if (s < 0.35 && l > 0.6) return { red: 'blush', orange: 'sand', yellow: 'sand', lime: 'sage', green: 'sage', teal: 'sage', 'sky blue': 'slate', blue: 'slate' }[hue] || 'pale grey';
  if (l < 0.3) return { orange: 'brown', yellow: 'olive', lime: 'olive' }[hue] || `deep ${hue}`;
  return l > 0.82 ? (hue === 'red' ? 'pale pink' : `pale ${hue}`) : hue;
}
// No colour of the palette in the violet, lavender or periwinkle range (references/colour.md §9), by the one test the
// inspector runs (colourFamily in lib/rules.mjs, palette-purple), over the accent, the ground, the surface, the inks
// and the fields. A blue lightened for a dark ground drifts there: r9-p41's generated cobalt came out as #76a4fe,
// which its judge read as periwinkle. Such a colour turns to its cyan side (hue 205 when light, 225 when deep) at the
// same lightness and strength, and the text on it is checked again.
function hslOf(hex) { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return [0, 0, l]; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l]; }
function hexOf(h, s, l) { const f = (n) => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }; return `#${f(0)}${f(8)}${f(4)}`; }
// (running text in --muted at 4.5:1 on the ground and the surface is lib/colour-deal.mjs's readableMuted, run after
// offViolet: thirteen library palettes and some generated ones held 4.3-4.5:1 on their surface)
function violetish(hex) { if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return false; const [h, s, l] = hslOf(hex); return colourFamily({ h: Math.round(h), s, l }) === 'ai-purple'; }
function offViolet(p) {
  const KEYS = ['accent', 'bg', 'surface', 'ink', 'muted', 'accentInk'];
  if (!p || ![...KEYS.map((k) => p[k]), ...(p.fields || []).flatMap((f) => [f.bg, f.ink])].some(violetish)) return p;
  const turn = (hex) => { if (!violetish(hex)) return hex; const [, s, l] = hslOf(hex); return [l > 0.55 ? 205 : 225, 200, 190].map((h) => hexOf(h, s, l)).find((x) => !violetish(x)) || hexOf(190, s, l); };
  // text that lost contrast in the turn steps away from its ground until it reads again (4.5:1, or what it had)
  const keep = (fg, bg, min) => { if (!fg || contrast(fg, bg) >= min) return fg; const [h, s, l] = hslOf(fg); const up = l >= hslOf(bg)[2]; for (let k = 1; k <= 20; k++) { const x = hexOf(h, s, Math.max(0, Math.min(1, l + (up ? 0.025 : -0.025) * k))); if (contrast(x, bg) >= min) return x; } return contrast('#ffffff', bg) >= contrast('#111111', bg) ? '#ffffff' : '#111111'; };
  const out = { ...p };
  for (const k of KEYS) if (p[k]) out[k] = turn(p[k]);
  for (const k of ['ink', 'muted', 'accent']) if (out[k]) out[k] = keep(out[k], out.bg, Math.min(4.5, contrast(p[k], p.bg)));
  out.accentInk = keep(out.accentInk, out.accent, Math.min(4.5, contrast(p.accentInk, p.accent)));
  out.fields = (p.fields || []).map((f) => { const bg = turn(f.bg), ink = f.ink ? turn(f.ink) : f.ink; return bg === f.bg && ink === f.ink ? f : { ...f, bg, ink: keep(ink || out.ink, bg, Math.min(4.5, contrast(f.ink || p.ink, f.bg))) }; });
  // the name and note: the accent's word ("rich blue" to "rich sky blue") only when the accent turned, and every
  // colour that turned by its new value
  let note = String(p.note || ''); for (const k of KEYS) if (p[k] && out[k] !== p[k]) note = note.split(p[k]).join(out[k]);
  const word = (t) => (out.accent !== p.accent && p.generated && p.hue ? String(t).replace(new RegExp(`\\b(vivid|rich|muted) ${p.hue}\\b`, 'g'), '$1 sky blue') : t);
  return { ...out, name: word(p.name), note: word(note), offViolet: true };
}
function dealPhotos(dir, input, redealt = null) {
  if (dir.photos === false) return null; // image-free directions
  // a software page's pictures are its interface and, at most, one photograph of the world it works on: never a dealt
  // set of fog, churches and bridges beside a support inbox (round 11)
  const mode = imageryMode(input);
  if (mode === 'interface') return null;
  const words = briefWords(input.brief);
  const SOFT_SETS = ['architecture', 'fog-and-quiet', 'sky-and-space', 'texture', 'water'];
  // a photograph whose file is black-and-white is dealt only where the brief asks for black and white (references/
  // imagery.md §6), and a set is counted by its photographs in colour
  const grey = asksBW(input);
  const usable = (set) => (grey ? set.photos : set.photos.filter((ph) => !ph.mono));
  // subject first (sector + words of the brief), then the direction's preferred tone
  const scored = Object.entries(L.photos.sets).map(([id, set]) => {
    let score = (set.sectors || []).includes(input.sector) ? 3 : 0;
    if ((set.primary || []).includes(input.sector)) score += 5;
    // the dealt set carries the hero and the atmosphere, where a stock room or table would pass for this very house:
    // for places to stay it is the surroundings. Each room is shown beside its facts by a detail that belongs to no one
    // (the imagery section's "shown, not boxed" line and its hard rule)
    if (mode === 'atmosphere' && ['hospitality', 'real-estate'].includes(input.sector) && id === 'interior-and-table') score -= 6;
    score += words.filter((w) => (set.keywords || []).some((k) => k === w || (k.length >= 5 && w.startsWith(k)) || (w.length >= 5 && k.startsWith(w)))).length * 4;
    score += set.photos.filter((ph) => words.some((w) => ph.alt.toLowerCase().includes(w))).length;
    if (dir.photoTone) score += set.photos.filter((ph) => ph.tone === dir.photoTone).length / set.photos.length;
    // a client named for a light or a pale colour leans to the sets with the most bright photographs
    if (nameColours(input.brief).lean === 'light') score += (2 * set.photos.filter((ph) => ph.tone === 'light').length) / set.photos.length - (2 * set.photos.filter((ph) => ph.tone === 'dark').length) / set.photos.length;
    return { id, set, score };
  }).filter((x) => usable(x.set).length >= 5 && (mode !== 'interface' || SOFT_SETS.includes(x.id))).sort((a, b) => b.score - a.score);
  // The pictures show this trade (photoTrade): never a neighbouring trade's things or a landmark the brief does not name
  // (r11-p51: a mixing desk for a motion designer, a postcard bridge), and never a person for a listed trade's things or
  // place (two men at another café's table would pass for its customers). Any other brief keeps the sets that fit its
  // sector and words, as before.
  const trade = photoTrade(input);
  // A product page with no photographs of its own is dealt none that shows a product of its kind: another maker's bike
  // passed for Haulet's three times, cropped, credited or not (r12-p55). Its pictures are the use, the load and the place:
  // none whose alt names the trade's product or the brief's own product word (an oak dining chair was dealt a wooden
  // chair by a window and a tufted bench)
  const named = productNamed(input);
  const productShown = (alt) => mode === 'no-product-photo' && (trade.product?.test(alt) || named(alt));
  const kindOf = (ph, set) => (trade.banned(ph.alt) || productShown(ph.alt) || (trade.known && set.people) ? null : trade.things.test(ph.alt) ? 'thing' : trade.place?.test(ph.alt) ? 'place' : set.matchOnly || trade.known ? null : 'world');
  const best = Math.max(0, ...scored.map((x) => x.score));
  const fits = scored.map((x) => ({ ...x, own: usable(x.set).filter((ph) => kindOf(ph, x.set)).map((ph) => ({ ...ph, from: x.id, kind: kindOf(ph, x.set) })) }))
    .filter((x) => (trade.known ? x.own.length && (!trade.sets || trade.sets.includes(x.id)) : x.score > 0 && x.score >= best * 0.6 && x.own.length >= 5));
  if (!fits.length) return null;
  // a client named for a light or a pale colour (Hvit, Snow, Linen) gets bright pictures, whatever the direction's tone
  const bright = nameColours(input.brief).lean === 'light';
  // A picture that matches the brief comes first (on a product page none shows the product: productShown, above)
  const names = (ph, w) => new RegExp(`\\b${w.replace(/[^\p{L}\p{N}]/gu, '')}`, 'iu').test(ph.alt);
  const matches = (ph) => words.filter((w) => w.length >= 5).some((w) => names(ph, w));
  const rank = (ph) => ph.quality + (matches(ph) ? 2 : 0) + (bright && ph.tone === 'light' ? 1 : 0);
  // The photographs no draw led with or dealt lately come first (photoLead and photoIds: every one led with, a
  // redraw's given-up leads among them, and every one dealt), then the one led with longest ago, then the best
  // (within one entry, the earlier of its leads)
  const uses = (ph, key) => hist.slice(0, RECENT_OUT).filter((h) => histHas(h, key, ph.id)).length;
  const lastAt = (ph, key) => { const at = hist.findIndex((h) => histHas(h, key, ph.id)); if (at < 0) return Infinity; const list = [].concat(hist[at][key]); return at + (list.length - 1 - list.lastIndexOf(ph.id)) / list.length; };
  const fresher = (a, b) => uses(a, 'photoLead') - uses(b, 'photoLead') || lastAt(b, 'photoLead') - lastAt(a, 'photoLead') || uses(a, 'photoIds') - uses(b, 'photoIds') || rank(b) - rank(a);
  if (trade.known) {
    // A listed trade's photographs come from every set as one list (round 11b: Kaffee Klee was dealt the same set and
    // first photograph ten times in ten, then a street first half the time): half its things, the freshest leading, then
    // half its places, two at most, never its stock shot. A portfolio's work is its own, so it is dealt one of its place at
    // most and none of the things. A place leads only where the library holds none of the things (on a product page,
    // whose pictures are its use, its load and its place, as well). The direction's tone and a bright name hold for the
    // whole list, unless they would leave none of the things.
    const portfolio = PORTFOLIO.includes(input.sector);
    let all = [...new Map(fits.flatMap((x) => x.own).map((ph) => [ph.id, ph])).values()].filter((ph) => !clichePhoto(input, ph.alt) && !(portfolio && ph.kind === 'thing'));
    // (the things the library holds are counted before the tone: a café named for a light lost its dark pour-over and
    // was told the library held two)
    const held = all.filter((ph) => ph.kind === 'thing').length;
    const anyThing = (list) => list.some((ph) => ph.kind === 'thing');
    const keep = (list) => (anyThing(list) || (list.length && !anyThing(all)) ? list : all);
    if (dir.photoTone) all = keep(all.filter((ph) => ph.tone === dir.photoTone || ph.tone === 'mid'));
    if (bright) all = keep(all.filter((ph) => ph.tone !== 'dark'));
    // the ones the trade's last deal listed (a redraw's among them) go behind the others, so two deals of one brief list
    // different photographs: six Kaffee Klee sheets listed the same three, the last of any brief deciding (round 11e)
    const last = hist.find((h) => h.photoTrade === trade.id)?.photoIds || [], lately = (ph) => (last.includes(ph.id) ? 1 : 0);
    all = shuffle(all).sort((a, b) => lately(a) - lately(b) || fresher(a, b));
    // (a portfolio's one is never one dealt in the last nine draws: a furniture designer was dealt the same room four
    // times in four, the library holding one)
    // At most half of the things and of the places, so the next deal takes the others; a trade with fewer than six of
    // its things in the library sends the builder to the open collections first (searchFirst), these the fallback
    const half = (list, most) => list.slice(0, Math.min(most, Math.max(1, Math.floor(list.length / 2))));
    const things = all.filter((ph) => ph.kind === 'thing'), thin = !portfolio && held < 6;
    const places = half(all.filter((ph) => ph.kind === 'place' && !(portfolio && uses(ph, 'photoIds'))), portfolio ? 1 : 2);
    if (!things.length && !places.length) return null;
    // (its place always among the eight: a guesthouse's eight cups and mugs left out the fjord its first screen shows)
    const photos = [...half(things, 8 - places.length), ...places];
    const from = L.photos.sets[photos[0].from];
    return { set: photos[0].from, title: from.title, note: from.note, trade: { id: trade.id, name: [trade.name, ...trade.also].join(' or '), things: held, ...(thin ? { thin } : {}) }, treatment: dir.photoTreatment || null, others: [], photos };
  }
  // Any other brief: one set, rotated through the history (photoSet), so the photographs share a subject and a light;
  // a set with the brief's things weighs twice, and a redraw deals another set while one fits
  const left = fits.filter((x) => x.id !== redealt);
  const chosen = wpick(awayFrom((left.length ? left : fits).map((x) => [x, x.own.some((ph) => ph.kind === 'thing') ? 2 : 1]), 'photoSet', 2));
  // a page in colour is dealt no black-and-white photographs, however few are left
  let pool = chosen.own;
  if (dir.photoTone) { const toned = pool.filter((ph) => ph.tone === dir.photoTone || ph.tone === 'mid'); if (toned.length >= 6) pool = toned; }
  if (bright) { const b = pool.filter((ph) => ph.tone !== 'dark'); if (b.length >= 6) pool = b; }
  // the brief's things before the rest, the stock shot last; a thing that led in the last nine draws goes behind the
  // others (a river museum led with the one river of its set six times in ten)
  const led = (ph) => uses(ph, 'photoLead') > 0;
  const tier = (ph) => (clichePhoto(input, ph.alt) ? 4 : 0) + (ph.kind === 'thing' && !led(ph) ? 0 : 2);
  const ranked = shuffle(pool).sort((a, b) => tier(a) - tier(b) || fresher(a, b));
  // (a portfolio without pictures of its own shows one, of its place: three to choose from, where eight buildings dealt
  // to an architect's page would pass for its work)
  const most = PORTFOLIO.includes(input.sector) && mode !== 'own' ? 3 : 8;
  return { set: chosen.id, title: chosen.set.title, note: chosen.set.note, treatment: dir.photoTreatment || null, others: fits.filter((x) => x !== chosen).slice(0, 4).map((x) => x.id), photos: ranked.slice(0, most) };
}
function briefStop() {
  return new Set(['with', 'that', 'this', 'from', 'page', 'site', 'website', 'landing', 'their', 'they', 'have', 'will', 'your', 'about', 'into', 'make', 'build', 'create', 'design', 'small', 'based', 'called', 'named', 'which', 'where', 'what', 'need', 'want', 'like', 'also', 'some', 'very', 'more', 'most', 'just', 'than', 'then', 'them', 'and', 'the', 'for', 'one', 'hand', 'handmade', 'made', 'batch', 'ship', 'ships', 'week', 'within', 'across', 'euro', 'euros', 'cost', 'price', 'open', 'only', 'each', 'every', 'there', 'images', 'photos', 'photograph', 'static', 'html']);
}
// The words of the brief, the client's name among them, that name a colour, a material or a light. One in the
// client's name decides the ground (SKILL.md step 1): a guesthouse named Hvit, "white", lost a blind test on a
// navy-black ground. Elsewhere in the brief a word may name what the client replaces or works on ("invoicing
// that replaces paper"), so there it only lends the palette its colours.
function briefColours(brief, inName = false) {
  const LIGHT = ['white', 'snow', 'chalk', 'linen', 'paper', 'salt', 'milk', 'bone', 'ivory', 'pearl', 'fog', 'foggy', 'mist', 'haze', 'frost', 'ice', 'cotton', 'porcelain', 'birch', 'hvit', 'hvid', 'hvít', 'vit', 'weiss', 'weiß', 'blanc', 'blanche', 'blanco', 'blanca', 'bianco', 'bianca', 'branco', 'branca',
    // snow and light in other languages ("Snø" was dealt a dark room, "Lys" a black ground); never "lin", a surname
    'snø', 'sne', 'snö', 'schnee', 'neige', 'neve', 'nieve', 'lumi', 'kreide', 'craie', 'alabaster'];
  // light itself counts only as a name, capitalised ("Lys, a guesthouse"): "light-filled rooms" or "a light lunch" in a
  // brief names no ground
  const LIGHT_NAMES = ['light', 'lys', 'ljus', 'licht', 'lumen', 'lux', 'luz', 'luce'];
  const lit = inName ? [...new Set((String(brief || '').match(/\p{Lu}\p{Ll}+/gu) || []).map((w) => w.toLowerCase()).filter((w) => LIGHT_NAMES.includes(w)))] : [];
  const DARK =['black', 'night', 'midnight', 'coal', 'charcoal', 'soot', 'ink', 'obsidian', 'ebony', 'raven', 'onyx', 'ember', 'slate', 'iron', 'basalt', 'peat', 'svart', 'schwarz', 'noir', 'noire', 'nero', 'nera', 'zwart', 'preto', 'preta'];
  const OTHER = ['red', 'blue', 'green', 'yellow', 'orange', 'grey', 'gray', 'gold', 'golden', 'silver', 'copper', 'brass', 'bronze', 'rust', 'amber', 'honey', 'moss', 'olive', 'sage', 'sand', 'clay', 'ochre', 'oak', 'walnut', 'cedar', 'stone', 'marble', 'concrete', 'granite', 'wool', 'leather', 'steel', 'ash', 'smoke', 'dusk', 'dawn', 'moon', 'saffron', 'coral'];
  const words = String(brief || '').toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  const hit = (list) => [...new Set(words.filter((w) => list.some((k) => w === k || w === k + 's' || w === k + 'y')))];
  const light = [...new Set([...hit(LIGHT), ...lit])], dark = hit(DARK), other = hit(OTHER);
  return { words: [...light, ...dark, ...other], lean: light.length && !dark.length ? 'light' : dark.length && !light.length ? 'dark' : null };
}
// Whether the pictures are black-and-white: only where the brief asks for it (BW_BRIEF, lib/frame-deal.mjs), and on a
// page whose pictures carry colour only when it is a portfolio or a culture page (a café "whose walls are hung with
// black-and-white photographs" keeps its food in colour; a photographer who shoots in black and white does not)
function asksBW(input) {
  if (!BW_BRIEF.test(input.brief || '')) return false;
  return ['studio-portfolio', 'personal-portfolio', 'culture'].includes(input.sector) || !picturesCarryColour(input);
}
// The client's name is the brief's first phrase, up to its first comma ("Hvit, a guesthouse in the Westfjords").
function nameColours(brief) { return briefColours(String(brief || '').split(',')[0], true); }
// Why this page's pictures must carry colour, or null: food and drink (a hot sauce, a gin), flowers, fashion, cosmetics
// and jewellery, the seasons and landscapes
// through the year, rooms and tables, or a client whose name or brief names a colour or a light. A black-and-white
// treatment turned Hvit ("white") grey and made its four seasons look alike (r6-p30). Greys, fog and hard materials
// (stone, steel, oak) are not reasons: black-and-white suits them.
// Products count too: a product shown grey hides the colour the brief gives it.
function picturesCarryColour(input) {
  const brief = String(input.brief || '');
  const BY_SECTOR = { restaurant: 'a restaurant page', hospitality: 'a hospitality page', fashion: 'a fashion page', 'physical-product': "the product's own colours", ecommerce: "the products' own colours" };
  if (BY_SECTOR[input.sector]) return BY_SECTOR[input.sector];
  const NEUTRAL = new Set(['grey', 'gray', 'ash', 'smoke', 'smoky', 'silver', 'slate', 'charcoal', 'iron', 'steel', 'concrete', 'stone', 'granite', 'marble', 'basalt', 'oak', 'walnut', 'cedar', 'wool', 'leather', 'coal', 'soot', 'peat', 'obsidian', 'ebony', 'ink', 'fog', 'foggy', 'mist', 'misty', 'haze', 'hazy']);
  // pale materials count in the client's name (a house called Linen is a white house), elsewhere only colours do
  // ("invoicing that replaces paper" names no colour)
  const PALE = new Set(['paper', 'linen', 'cotton', 'porcelain', 'bone', 'salt', 'birch']);
  const plain = (w) => w.replace(/(?:s|y)$/, '');
  const named = [...new Set([...nameColours(brief).words, ...briefColours(brief).words.filter((w) => !PALE.has(w) && !PALE.has(plain(w)))])].filter((w) => !NEUTRAL.has(w) && !NEUTRAL.has(plain(w)));
  if (named.length) return `the brief names ${named.map((w) => `"${w}"`).join(', ')}`;
  const SUBJECT = /\b(?:food|foods|drinks?|wines?|winery|vineyards?|coffee|tea|teas|bakery|bakers?|bread|pastry|pastries|patisserie|chocolate|gelato|ice cream|cheese|fruits?|vegetables?|greengrocer|kitchen|chefs?|menus?|dish|dishes|recipes?|restaurants?|bistro|caf[eé]s?|brewery|beers?|cocktails?|sauces?|chil(?:l?i|l?ies|l?is)|spices?|honey|jams?|oils?|gin|whiske?y|whiskies|rum|spirits|distiller(?:y|ies)|ciders?|sake|juices?|smoothies?|kombucha|snacks?|sweets|cand(?:y|ies)|pizzas?|sushi|ramen|tacos?|burgers?|deli|butchers?|grocer(?:y|ies)|farms?|orchards?|harvests?|dining|brunch|breakfasts?|dinners?|cosmetics|make-?up|lipsticks?|perfumes?|jewell?ery|jewelry|flowers?|florists?|floral|gardens?|plants?|blooms?|fashion|clothing|clothes|knitwear|textiles?|dyes?|paints?|seasons?|spring|summer|autumn|winter|all year|year-round|through the year|hotels?|guesthouses?|guest house|inns?|hostels?|lodges?|cabins?|resorts?|campsites?|glamping|rooms|bedrooms?|interiors?|sunlight|daylight|sunsets?|sunrises?|aurora|northern lights|colou?rs?|colou?rful)\b/i;
  const m = brief.match(SUBJECT);
  return m ? `its pictures show ${m[0].toLowerCase()}` : null;
}
// The line under the palette that says so.
function colourWords(s) {
  const { words: inBrief, lean } = briefColours(s.input.brief);
  // (a light that counts only as a name, Lys, is among the name's words alone)
  const words = [...new Set([...nameColours(s.input.brief).words, ...inBrief])];
  if (!words.length) return 'When the client\'s name names a colour, a material or a light (white, black, ember, slate, linen, fog, in any language), the page\'s ground follows it; redraw this palette if it contradicts that (SKILL.md step 1).';
  const name = nameColours(s.input.brief), nameLean = name.lean;
  const tone = groundTone(s.palette);
  const list = (ws) => ws.map((w) => `"${w}"`).join(', ');
  const ground = nameLean || (lean === tone ? lean : null);
  const eg = ground === 'dark' ? 'a dark material for the ground' : ground === 'light' ? 'a pale material for the ground' : 'the material for the ground';
  if (nameLean) {
    const named = `**The client's name carries ${list(name.words)}: the page's ground follows it.**`;
    // a name of light or a pale colour is a promise about the pictures too: Hvit (r7-p35) opened on a grey sky under a
    // dark overlay
    const bright = nameLean === 'light' ? ' **Its pictures are bright and high-key too:** daylight, pale grounds, open shadows, bright pictures of its own place or subject (snow, a white house in summer light, a pale fjord), never a sunnier coast standing in for it; no dark overlay, no scrim and no dimmed hero, and never a grey-sky or dusk photograph as the first picture. Text on a picture sits on its calm pale part in the ink, or beside it.' : '';
    if (tone !== nameLean) return `${named} It asks for a ${nameLean} ground and the one dealt above is ${tone === 'mid' ? 'a coloured field' : tone}: redraw the palette (\`--redraw palette\` keeps to a ${nameLean} ground) and say so in the report.${bright}`;
    return `${named} The ${nameLean} ground dealt above fits it; take the colours from what it names where the dealt ones do not fit (${eg}, a strong hue for the accent), and say so in the report.${bright}`;
  }
  const many = words.length > 1;
  return `**The brief names ${list(words)}.** Where ${many ? 'they describe' : 'it describes'} the client or what it makes (its name, its material, its light) rather than something it replaces or works on, keep the proportions above and take the colours from what ${many ? 'they name' : 'it names'} where the dealt ones do not fit (${eg}, a strong hue for the accent), and say so in the report.`;
}
function briefWords(brief) {
  const stop = briefStop();
  return [...new Set(String(brief || '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4 && !stop.has(w)).map((w) => w.replace(/(ies|es|s)$/, '')))].filter((w) => w.length >= 4);
}
// First queries for scripts/assets.mjs, built from the brief. (These once asked for "<place> postcard" and "<place> old
// map": the archive pictures they found were the documentary look the owner named as the worst of the pages in October
// 2026.) A start only: the better queries come from the builder's inventory. They never name the client's own thing,
// on any page, since what comes back is another business's (r12-p55 found three other makers' cargo bikes, r12-p58 two
// named hotels' rooms, "restaurant" finds other restaurants and "notes app" other apps' screens): the trade's searches,
// or the details that belong to no one in its sector, then its place; on a product page none that names its product;
// a portfolio and software their place only (the work and the interface are their own).
function assetQueries(input) {
  const place = briefPlace(input);
  const mode = imageryMode(input), t = photoTrade(input);
  const DETAILS = { hospitality: ['bed linen window light', 'wool blanket chair'], 'real-estate': ['window light on a wooden floor', 'morning light on a white wall'], restaurant: ['plated dish close up'] };
  const named = productNamed(input);
  const first = PORTFOLIO.includes(input.sector) || isSoftware(input) ? [] : (t.queries || DETAILS[input.sector] || []).filter((q) => !named(q) && !(mode === 'no-product-photo' && t.product?.test(q)));
  return [...new Set([...first, ...(place ? [`${place.toLowerCase()} ${t.placeWord || 'street'}`] : [])])];
}
// The line that sends the builder to the open collections before the library, or null: a listed trade the library
// holds fewer than six of its things for (dealPhotos' thin), or none dealt at all. Six Kaffee Klee sheets on one
// history led with the library's only two coffee photographs (round 11e).
function searchFirst(s, qs) {
  const t = photoTrade(s.input), n = s.photos?.trade?.things || 0;
  if (!t.known || PORTFOLIO.includes(s.input.sector) || ['interface', 'own'].includes(s.imagery) || (s.photos && !s.photos.trade?.thin)) return null;
  const find = qs.length ? `\`${ASSETS_CMD} "${qs[0]}"\`${qs.length > 1 ? `, then ${qs.slice(1).map((q) => `"${q}"`).join(' and ')}` : ''}` : `\`${ASSETS_CMD} "<a detail, use or place from your inventory>"\``;
  // (with none dealt there is no library photograph to put the search before)
  return `**Search first: the library holds ${n ? `only ${n === 1 ? 'one photograph' : `${n} photographs`}` : 'no photograph'} of the ${t.name}${s.imagery === 'no-product-photo' ? '\'s use and load' : ''}.** ${s.photos ? 'For this trade the open collections come before the library (source 4 before 3, above): search them' : 'Search the open collections'} with ${find} (Openverse, then Wikimedia Commons when Openverse fails or finds nothing) and use the sharp, modern finds.${s.photos ? ' The photographs listed below are the fallback, for the slots the search cannot fill.' : ''}`;
}
// The place the brief names ("in Berlin", "at Flateyri"), or null.
function briefPlace(input) {
  const notPlace = /^(?:january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?$/i;
  const placeRe = /(?:^|[\s,(])(?:in|at|near|from|on|above|below|beside|outside|off|over)\s+(\p{Lu}[\p{L}'’-]*(?:\s+(?:\p{Lu}[\p{L}'’-]*|de|da|do|dos|das|di|del|van|von|der|den))*)/gu;
  return [...String(input.brief || '').matchAll(placeRe)].map((m) => m[1].trim()).find((p) => !notPlace.test(p.split(/\s+/)[0])) || null;
}
// The trade the brief names first among library/photos.json's trades: what its pictures show, what they must not show
// (a neighbouring trade's things), and its things and place as patterns over the photographs' alt text. A brief of no
// listed trade is matched by its own longer words (a listed one never: "front-box" matched a coyote "in front of" a
// forest, "motion designer" a motion-blurred train). The other trades the brief names are its own too, and so are the
// dishes of a restaurant or of a brief with a kitchen: their things are never banned ("a bakery and cafe" was told
// never to show coffee, a cafe with a lunch kitchen never a plated dish). A landmark the brief does not name is off for
// every trade, except where buildings are the subject, and so is a photograph that shows a logo, a house number, a
// plate or the inside of a café. (Read from the file, since `--show` renders before the library is loaded.)
function photoTrade(input) {
  const lib = load('photos'); const brief = String(input.brief || '');
  const at = (t) => brief.search(new RegExp(t.brief, 'iu'));
  const [t, ...also] = (lib.trades || []).filter((x) => at(x) >= 0).sort((a, b) => at(a) - at(b));
  const name = brief.split(/[,:]/)[0].toLowerCase();
  const words = t ? [] : briefWords(brief).filter((w) => w.length >= 5 && !name.includes(w)).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean);
  const marks = ['architecture', 'real-estate'].includes(input.sector) ? [] : (lib.landmarks || []).filter((w) => !new RegExp(`\\b${w}`, 'i').test(brief));
  // what the brief owns: the other trades' things, and the dishes where it names a kitchen (in the bans it prints, a
  // restaurant's too)
  const kitchen = !!lib.dishes && new RegExp(lib.dishes.brief, 'iu').test(brief);
  const owns = (text, dishes = kitchen) => [...also.map((x) => x.things), ...(dishes && lib.dishes ? [lib.dishes.things] : [])].some((r) => new RegExp(r, 'iu').test(text));
  // (a day trade's never shows night, nightlife or neon: a café was dealt night streets and a lit alley; a place to
  // stay in the north or named for a light never a warm coast: Hvit in the Westfjords was dealt a white sand bay)
  const cold = !!t?.north && (new RegExp(t.north, 'iu').test(brief) || nameColours(brief).lean === 'light');
  const never = new RegExp([marks.length ? `\\b(?:${marks.join('|')})s?\\b` : null, lib.unusable, t?.day ? lib.night : null, cold ? lib.warm : null].filter(Boolean).join('|') || '(?!)', 'iu');
  // (`not` is clauses at ";", items at "," and "or": an item the brief owns is dropped)
  const not = (t?.not || '').split('; ').map((c) => c.split(/, | or /).filter((x) => !owns(x, kitchen || input.sector === 'restaurant'))).filter((c) => c.length).map((c) => (c.length > 1 ? `${c.slice(0, -1).join(', ')} or ${c.at(-1)}` : c[0])).join('; ');
  return {
    id: t?.id || null, known: !!t, name: t?.name || null, show: t?.show || null, not: not || null, also: also.map((x) => x.name),
    // (what the trade makes or sells as a product: on a product page with none of its own, a picture showing one is
    // another maker's and is not dealt)
    product: t?.product ? new RegExp(t.product, 'iu') : null,
    // (first searches of the open collections where the client's own thing has no photographs, and the word its place
    // is searched with: assetQueries)
    queries: t?.queries || null, placeWord: t?.placeWord || null,
    things: new RegExp([t?.things, ...also.map((x) => x.things), words.length ? `\\b(?:${words.join('|')})` : null].filter(Boolean).join('|') || '(?!)', 'iu'),
    // (the first of its places the brief names, if any: a guesthouse on a fjord is shown by the sea; otherwise none for
    // a trade marked town when the brief names its town, since another city's street or coast passes for its own)
    place: (t?.places || []).filter(([b]) => new RegExp(b, 'iu').test(brief)).map(([, pl]) => new RegExp(pl, 'iu'))[0] || (t?.place && !(t.town && briefPlace(input)) ? new RegExp(t.place, 'iu') : null),
    // (the sets its pictures are dealt from, by fit, its other trades' too: a café never from the night streets)
    sets: t?.sets ? [...new Set([t, ...also].flatMap((x) => x.sets || []))] : null,
    // (each word of a neighbouring trade in the alt, unless the brief owns that word: a mug beside bedding stays off)
    banned: (alt) => never.test(alt) || (!!t?.off && [...alt.matchAll(new RegExp(t.off, 'giu'))].some((m) => !owns(m[0]))),
  };
}
// The subject: the last plain words of the first noun phrase ("a 38-seat Italian restaurant in ..." gives "restaurant",
// "an electric front-box cargo bike for families" gives "cargo bike").
function briefSubject(input) {
  const stop = briefStop();
  const generic = new Set(['seat', 'seats', 'room', 'rooms', 'minute', 'minutes', 'hour', 'hours', 'night', 'nights', 'year', 'years', 'people', 'family', 'local', 'short', 'best', 'making', 'selling', 'serving', 'offering', 'business', 'company', 'brand', 'shop', 'store', 'studio', 'service', 'services', 'dinner', 'lunch', 'breakfast', 'included', 'online', 'modern']);
  const words = String(input.brief || '').split(/\s+/).filter(Boolean); const phrase = [];
  for (let k = words.findIndex((w) => /^an?$/i.test(w)) + 1; k < words.length; k++) {
    if (/^(?:in|at|on|for|from|with|near|above|below|by|that|which|who|of|and|to)$/i.test(words[k])) break;
    phrase.push(words[k].replace(/[,.;:()!?]+$/, ''));
    if (/[,.;:()!?]$/.test(words[k])) break;
  }
  return phrase.filter((w) => /^\p{Ll}{3,}$/u.test(w) && !stop.has(w) && !generic.has(w)).slice(-2);
}
// Whether a text names a product page's own product by the brief's word for it: the subject's last word ("cargo bike"
// gives "bike", "oak dining chair" "chair"), the head alone, since "city" of "city bike" would leave out every street.
// Never true on another page. (dealPhotos, assetQueries)
function productNamed(input) {
  const w = imageryMode(input) === 'no-product-photo' ? (briefSubject(input).at(-1) || '').toLowerCase().replace(/(?:es|s)$/, '').replace(/[^\p{L}\p{N}]/gu, '') : '';
  const re = w.length >= 3 ? new RegExp(`\\b${w}`, 'iu') : null;
  return (text) => !!re && re.test(text);
}
// The category's stock shots for this brief: every trade's it names, in the brief's order ("a bakery and cafe" names
// the flour before the beans), then its sector's (CLICHES at the top), or none.
function clichesOf(input) { const b = String(input.brief || ''); return CLICHES.filter(([re]) => re.test(b)).sort(([a], [c]) => b.search(a) - b.search(c)); }
function clicheFor(input) { return [...clichesOf(input).map((x) => x[1]), SECTOR_CLICHES[input.sector]].filter(Boolean).join('; ') || null; }
// Whether a dealt photograph is one of those stock shots.
function clichePhoto(input, alt) { return [...clichesOf(input).map((x) => x[2]), SECTOR_CLICHE_PHOTOS[input.sector]].some((re) => re && re.test(alt || '')); }
// Blueprints written for showing software (an interface fragment is their picture).
function softwareOnly(x) { return (x.directions || [])[0] === 'product-performs' || (x.tags || []).includes('ui-led') || /data-ui|interface fragment/i.test(x.blueprint || ''); }
// The photographs of the whole page, its hero's, scenes', sections' and footer's together (round 11a: a gallery asked
// for six to ten on top of a hero of five to eight portraits, about fifteen against "three to six"): the direction's
// budget (directions.json `pictures`), held to what the page can honestly show (PHOTO_CAP). The scenes take theirs
// first (already held to the page's cap), then the hero up to half, then the sections and the footer one photograph at
// a time in page order. A portfolio's own work is counted apart: pictures of the work, in marked slots where the brief
// has none (sheet section 7). On a software page a picture the blueprint lets the interface take is a fragment
// (`data-ui`), never counted (round 11b: "a cropped interface fragment" was told to go without a picture); a product
// page shows its use, its load and its place at least PHOTO_FLOOR times.
function picturesAsked(bp, s = null) {
  if (!bp?.blueprint) return 0;
  if (s?.imagery === 'interface' && uiPicture(bp)) return 0;
  // (a software hero's picture is the product's window showing its dealt substance: a photograph it names is that
  // window, round 11c counted "one photograph of the place" beside a chart in the window)
  if (s?.heroSubstance && bp === s.hero) return 0;
  if (bp.pattern) return patternPictures(bp);
  const text = bp.blueprint; let n = 0;
  for (const m of text.matchAll(PHOTO_COUNT)) n = Math.max(n, asNumber(m[2] || m[1]) || 1);
  const held = text.match(/\bHolds? (?:about )?(\d+)[–-](\d+) (?:tiles|projects|pictures|photographs|frames|images)\b/i);
  if (held) n = Math.max(n, +held[2]);
  // (a gallery's tiles are its pictures: "a dense masonry of about twenty tiles" was counted as one photograph)
  const tiles = bp.role === 'gallery' && text.match(/\b(\d{1,2}|six|eight|ten|twelve|sixteen|twenty)(?:\s*(?:[–-]|to)\s*(\d{1,2}|twelve|sixteen|twenty))? tiles\b/i);
  if (tiles) n = Math.max(n, asNumber(tiles[2] || tiles[1]));
  return n || (says(text, /\bphoto(?:graph)?s?\b|\bpictures?\b|\bimages?\b/i) ? 1 : 0);
}
// A blueprint whose picture may be the product's own interface.
function uiPicture(bp) { const t = bp.blueprint || ''; return softwareOnly(bp) || !!bp.pneeds?.productUi || SHOWS_UI.test(t) || /\bbuilt in HTML\b/i.test(t); }
// A section made of pictures: a photo-led blueprint or one that does not work without them, or a pattern whose
// pictures are its main element (a photo card beside a text card is two text cards without it).
function madeOfPictures(bp) { return bp.pattern ? picturesLead(bp) : (bp.tags || []).includes('photo-led') || !worksWithoutPictures(bp); }
// A gallery: a section of three pictures or more, by its structure or, in the gallery role, by its own count; a pair is
// none (a photo pair dealt as the gallery was told to show three).
function galleryOf(bp) {
  if (!bp?.role || !bp.blueprint) return false;
  return bp.pattern ? patternPictures(bp) >= 3 && (bp.role === 'gallery' || structureOf(bp) === 'gallery') : structureOf(bp) === 'gallery' || (bp.role === 'gallery' && picturesAsked(bp) >= 3);
}
// A section of pictures whose captions name a maker, a model, a price or a room: a catalogue, which only pictures of
// the products or rooms themselves fit (dealSection, adjustments).
function catalogue(bp) {
  const said = String(bp?.blueprint || '').split(/\bPhone:/)[0].split(/(?<=\.)\s+/);
  return madeOfPictures(bp) && said.some((t) => /\b(?:makers?|brands?|prices?|priced)\b|\b(?:names?|captions?|labels?) (?:the |its )?(?:model|room)\b|\bmodel (?:name|number)\b/i.test(t) && !/\b(?:no|never|without)\b[^.]{0,20}\b(?:prices?|makers?|brands?)\b/i.test(t));
}
// The photographs a section keeps at the least (photoPlan, settlePhotos): three for a gallery, so it is never cut to one
// (round 11c gave a gallery of six to eight one photograph beside a pattern hero's three), and one for another section
// made of pictures, so one left none is dealt again.
function picturesKept(x) { return x?.scene ? 0 : galleryOf(x?.bp) ? 3 : x?.bp?.role && madeOfPictures(x.bp) ? 1 : 0; }
// reserve: a gallery keeps three before the hero, and no other section (settlePhotos counts without it and first deals
// again one the count leaves fewer than it keeps, where the role has another). trim: a gallery whose three still break
// the page's total gives back down to two (settlePhotos counts without it, to deal a smaller section in its place first).
function photoPlan(s, reserve = true, trim = true) {
  const portfolio = PORTFOLIO.includes(s.input.sector);
  const budget = s.direction.pictures ?? 6;
  const floor = PHOTO_FLOOR[s.imagery] || 0;
  const cap = photoCap(budget, s.imagery, s.input.sector);
  const parts = [];
  for (const sc of s.scenes || []) parts.push({ what: `the scene on the ${sc.carries === 'hero' ? 'first screen' : `${sc.carries} section`}`, bp: sc, asked: scenePictures(sc), scene: true, work: portfolio && sc.carries === 'work' });
  // (on a product page with none of its own, a hero that shows the product large holds its designed frame, no photograph)
  const frame = frameInHero(s);
  if (!(s.scenes || []).some((x) => x.carries === 'hero')) parts.push({ what: 'the hero', bp: s.hero, asked: Math.max(0, picturesAsked(s.hero, s) - (frame ? 1 : 0)), frame });
  // (or the section frameSection names; and a house's rooms list pictures each kind of room, a detail each in a frame with
  // data-slot="room-photo", three counted apart like a portfolio's work: the sheet asked for as many pictures as rooms,
  // their own set, and the total gave the list none)
  const held = frameSection(s);
  for (const sec of s.sections) {
    // (a scene that carries the rooms with no pictures of its own still shows each room's)
    const rooms = s.input.sector === 'hospitality' && sec.role === 'list' && !(carriedBy(s, sec) && scenePictures(carriedBy(s, sec)) > 0);
    if (!sec.blueprint || (carriedBy(s, sec) && !rooms) || (s.replay && sec.role === s.replay.carries) || (sec.role === 'cta' && ctaByFooter(s)) || (sec.role === 'footer' && s.frame)) continue;
    // (a gallery asks three at the least, whatever count its words give: "three to five panels, each one photograph")
    const asked = picturesAsked(sec, s);
    parts.push({ what: rooms ? 'the rooms list' : `the ${sec.role}`, bp: sec, asked: rooms ? 3 : Math.max(0, asked && galleryOf(sec) ? Math.max(asked, 3) : asked - (sec === held ? 1 : 0)), frame: sec === held, rooms, work: portfolio && sec.role === 'work' });
  }
  const f = s.frame?.footer;
  if (f && (['picture-footer', 'picture-and-facts'].includes(f.id) || (f.pattern && says(f.text, /\bphoto(?:graph)?s?\b|\bpictures?\b/i)))) parts.push({ what: 'the footer', bp: f, asked: 1 });
  const counted = parts.filter((x) => !x.work && !x.rooms && (x.asked > 0 || x.frame));
  // (in the final count a gallery that the plain count leaves under three keeps three before the hero takes its half, so
  // the hero gives way and the page stays nearer its budget: the reserve on top of a hero's three gave a museum ten
  // photographs against a budget of six; reserved for every section made of pictures, it put six pages of thirty over
  // their total; and a gallery whose three still break it is dealt again: settlePhotos)
  const starved = reserve && s.imagery !== 'interface' ? photoPlan(s, false).parts.filter((x) => !x.scene && galleryOf(x.bp) && x.share < 3).map((x) => x.bp) : [];
  let left = cap;
  for (const x of counted.filter((y) => y.scene)) { x.share = x.asked; left -= x.share; }
  const rest = counted.filter((y) => !y.scene && y.bp !== s.hero && y.bp !== f);
  for (const x of rest) { x.share = starved.includes(x.bp) ? Math.min(x.asked, 3) : 0; left -= x.share; }
  for (const x of counted.filter((y) => y.bp === s.hero)) { x.share = Math.min(x.asked, Math.ceil(cap / 2), Math.max(1, left)); left -= x.share; }
  // (a picture footer is dealt for its photograph: it keeps one)
  for (const x of counted.filter((y) => y.bp === f)) { x.share = 1; left -= 1; }
  // (where nothing smaller fits the gallery's role, a bold or warm page's: the total holds before the gallery's third)
  if (trim) for (const x of rest.filter((y) => starved.includes(y.bp)).reverse()) while (left < 0 && x.share > 2) { x.share -= 1; left += 1; }
  // (one at a time in page order, the gallery role first, each section first up to what it keeps, then the rest: a pair
  // dealt as the gallery was left none behind an intro's one, and the gallery role has nothing without pictures to deal)
  const order = [...rest].sort((a, b) => (b.bp.role === 'gallery') - (a.bp.role === 'gallery'));
  for (const most of [(x) => Math.min(x.asked, picturesKept(x)), (x) => x.asked]) while (left > 0 && order.some((x) => x.share < most(x))) for (const x of order) if (left > 0 && x.share < most(x)) { x.share += 1; left -= 1; }
  // (a product page short of its floor: the rest are its use, its load and its place, where section 5 places them)
  const sum = counted.reduce((t, x) => t + x.share, 0);
  if (sum < floor) counted.push({ what: `${floor - sum} more of its use, its load and its place, where this section places ${floor - sum > 1 ? 'them' : 'it'} above`, asked: floor - sum, share: floor - sum, extra: true });
  // (a portfolio without pictures of its own shows one photograph, of its place, in the last part that takes a picture
  // and never in the hero; the others are pieces of its work in marked frames: any other photograph would be of another's
  // making, as r12-p57's pen display was)
  if (portfolio && s.imagery !== 'own') {
    const at = (x) => (x.bp === f ? Infinity : x.scene ? s.sections.findIndex((y) => y.role === x.bp.carries) : s.sections.indexOf(x.bp));
    const place = counted.filter((x) => x.share > 0 && at(x) >= 0).sort((a, b) => at(b) - at(a))[0];
    for (const x of counted) { x.photos = x === place ? 1 : 0; x.pieces = x.share - x.photos; }
  }
  return { cap, budget, floor, total: Math.max(sum, floor), parts: counted, work: parts.filter((x) => x.work), rooms: parts.filter((x) => x.rooms) };
}
// A section made of pictures that the page's photograph total leaves fewer than it keeps (none, or a gallery's one or
// two: picturesKept) is dealt again from those that are not, as a pin over the budget is (round 11b: a gallery of six to
// eight photographs was told to go without, under two scenes that took the page's eight); the gallery role keeps its
// gallery, three before the hero (photoPlan's reserve). A gallery whose three then take the page over its total, the
// last first, is dealt again as a smaller section that asks no more than the total leaves it (round 11d's first run:
// a museum with a scene of four, a gallery of three and the footer's one against six); where none fits, it gives back
// down to two (photoPlan's trim), never the hero's picture or a scene's. Not on a software page, whose
// pictures are its interface. keep: a role whose section was taken by id.
function settlePhotos(s, keep = null) {
  if (s.imagery === 'interface') return;
  const dir = L.directions.find((d) => d.id === s.direction.id) || s.direction;
  const again = (i, out) => { s.sections[i] = dealSection(dir, s.sections[i].role, s.sections.map((y) => y.id), s.sections[i - 1]?.shape ?? (s.hero?.split ? 'split' : undefined), s.sections[i + 1]?.shape, s.input, s, out) || s.sections[i]; };
  // (a pair dealt in the gallery role is no gallery and keeps no three: left none, it is dealt again like any other)
  const short = (plan) => { for (const x of plan.parts) { const i = s.sections.indexOf(x.bp); if (i >= 0 && x.share < picturesKept(x) && x.bp.role !== keep && !(x.bp.role === 'gallery' && galleryOf(x.bp))) again(i, (y) => madeOfPictures(y) || !!pinHold(y)); } };
  // (the plain count first; then the galleries over the total, the last first; then the final count, where a gallery's
  // three may have left another section of pictures none)
  short(photoPlan(s, false));
  for (const role of photoPlan(s, true, false).parts.filter((x) => galleryOf(x.bp) && x.bp.role !== keep).map((x) => x.bp.role).reverse()) {
    const plan = photoPlan(s, true, false), x = plan.parts.find((y) => y.bp?.role === role), i = s.sections.indexOf(x?.bp);
    const over = plan.parts.reduce((t, y) => t + y.share, 0) - plan.cap;
    if (over <= 0 || i < 0 || !galleryOf(x.bp)) continue;
    // (one that asks no more than is left, else one more, else any that is no gallery: the gallery role has few, a pair
    // the most common; never one dealt in the last nine draws, else the gallery stays and gives back down to two: the
    // museum was dealt the same photo pair four times in four)
    const room = Math.max(0, x.share - over);
    const lately = (y) => hist.slice(0, RECENT_OUT).some((h) => histHas(h, 'sections', y.id));
    for (const most of [room, room + 1, Infinity]) if (galleryOf(s.sections[i])) again(i, (y) => galleryOf(y) || picturesAsked(y, s) > most || !!pinHold(y) || lately(y));
  }
  short(photoPlan(s));
}
// The hard rule printed under the photograph total: the client's own thing (its product, its rooms and house, its work)
// is never shown by another business's or another person's, and what stands in its slot when the brief gives none.
// Three of four pages on the 11b commit failed the publish review for this alone: another maker's cargo bike with its
// name on the frame (r12-p55), another artist's comic on a pen display as a motion designer's work (r12-p57), two named
// hotels' rooms as a guesthouse's (r12-p58), each credited, so the credit never made it honest.
function ownThingRule(s) {
  const sector = s.input.sector;
  const rule = '**Hard rule: the client\'s own thing is never shown by another\'s.** No other maker\'s product however cropped, no named hotel\'s or other house\'s room, no other artist\'s work, no other house captioned as the client\'s, whatever the credit says; and no picture shown as the client\'s carries a credit or file title that names another business (a hotel, a maker, a brand): a picture so credited shows only the world around, captioned with what and where it is, or is left out.';
  if (s.imagery === 'interface') return `${rule} Here the product is its interface, built for the page (\`data-ui\`), never another product's screenshot.`;
  const slot = (name) => `\`data-slot="${name}"\``;
  const PRODUCT = `Without the client's photographs, the product is a designed frame with ${slot('product-photo')}: its name in the page's display type and its two or three facts (what it carries, its range, its price), on \`--surface\` or the ink, in the dealt corners; no silhouette, no outline, no drawing. The photographs show only its use, its load and its place, with no product of its kind in them, however cropped, unbranded or out of focus.`;
  const HOUSE = `Without the client's photographs, each room is a detail that belongs to no one (bed linen, window light, a chair, a cup, the view from a window) in a frame with ${slot('room-photo')}, never a whole room; the house is shown as its place (the fjord, the village, captioned as what and where it is). ${slot('house-photo')} goes on a picture of the named place itself from the open collections, its source naming that place, never on a library photograph, which names no place: the frame its own photograph of the house replaces.`;
  // (a frame of the builder's own motion fits a trade whose work moves; a chair or a room built in CSS is a drawing)
  const moving = photoTrade(s.input).id === 'motion';
  const WORK = `Without the client's pictures, each piece of work is the project's own still made for the page, in its frame with ${slot('work')} at the piece's ratio and size: ${moving ? 'a frame from your own motion of it first (a CSS or canvas loop built for the piece, resting on its best frame)' : 'a still of the piece generated as the copy describes it first, if you have an image tool (never a drawing of it)'}, otherwise its title frame, the whole frame designed as the piece's own opening title (its name alone, large, in the page's display face on \`--surface\` or the ink, as a film's title fills the screen), its client, year and role as the caption under it. Never a small card of a name and a line in its place, and never a photograph of someone else making or showing work (a pen display, a sketchbook, a light table), however close to the trade.`;
  // (other roasteries' rooms and counters passed for a café's own in r10-p45)
  const KITCHEN = 'Without the client\'s photographs, a dish is a photograph of that dish as served beside its name and price, and its room, its counter and its people are never another café\'s or restaurant\'s: show the cup, the dish and the street, never a whole room.';
  // (with pictures of its own, a slot they cannot fill takes the same fallback)
  const fallback = ['physical-product', 'ecommerce'].includes(sector) ? PRODUCT : sector === 'restaurant' ? KITCHEN : ['hospitality', 'real-estate'].includes(sector) ? HOUSE : PORTFOLIO.includes(sector) ? WORK
    : 'Without the client\'s photographs, its place, its people and its things are never another\'s: the pictures show the world around it, captioned with what and where they are, and a slot only the client\'s own picture can fill goes to type.';
  return `${rule} ${fallback}`;
}
// Where a product page with no photographs of its own sets the product's designed frame: in a hero that shows the
// product large, unless any sentence of it lays the picture behind or under the words (full-bleed, filling the first
// screen, or the headline, the name or the lettering on or across the picture): there the hero holds a photograph of
// the use or the place, and the frame comes in a section after it (frameSection), since a frame under the headline
// would be a card on a photograph. (Only the first sentence was read, and an inset frame that "fills the first screen"
// with its lettering on the photo, or a wordmark crossing a portrait, kept the frame under the words.)
function heroBleeds(h) {
  const behind = /(?<!\b(?:no|never|not|without)\s(?:[\w-]+\s){0,3})(?:\bfull-(?:bleed|viewport|screen)\b|\bfills? the (?:viewport|first screen|screen)\b|\bbleed\w* (?:to|off) (?:all|every|the four) edges\b|\b100s?vh cover\b|\bscrim\b)/i;
  const wordsOn = /(?<!\b(?:no|never|not|without)\s(?:[\w-]+\s){0,3})\b(?:headline|heading|title|name|wordmark|statement|lettering|letters|type|words)\b[^.;]*\b(?:on|over|across|overlap\w*|cross\w*) (?:the |its |a )?(?:photo(?:graph)?|picture|image|film|footage|object)(?:'s)?\b(?! (?:of|and|beside|next))/i;
  const clear = /\b(?:no|never|not|nothing)\b[^.;]{0,40}\b(?:on|over|across|cross\w*) (?:the |its |a )?(?:photo(?:graph)?|picture|image|film|footage|object)/i;
  // (a fallback is no geometry: "When the words cannot be that large, the picture goes full-bleed behind them instead")
  return String(h?.blueprint || '').split(/\bPhone:/)[0].split(/(?<=\.)\s/).some((x) => !/^(?:when|if|where|unless|without)\b|\binstead\b|\bcannot\b/i.test(x) && (behind.test(x) || (wordsOn.test(x) && !clear.test(x))));
}
function frameInHero(s) { return s.imagery === 'no-product-photo' && heroMode(s) !== 'type-only' && heroShowsLarge(s.hero) && !heroBleeds(s.hero); }
// The section that holds the product's frame when the hero does not: the first after the first screen that a scene or
// the replay does not carry, or the second where only it has a picture to give (r11d: the frame was sent to "the first
// section", and the first section, two giant words, was told to go without a picture).
function frameSection(s) {
  if (s.imagery !== 'no-product-photo' || frameInHero(s)) return null;
  const open = (s.sections || []).filter((x) => x.blueprint && !carriedBy(s, x) && !(s.replay && x.role === s.replay.carries) && !['cta', 'footer'].includes(x.role));
  return open.slice(0, 2).find((x) => picturesAsked(x, s) > 0) || open[0] || null;
}
// The photograph total, printed in sheet section 5.
function photoTotalBlock(s, p) {
  const plan = photoPlan(s);
  const why = PORTFOLIO.includes(s.input.sector) && s.imagery !== 'own' ? 'a portfolio without pictures of its own shows beside its work' : PHOTO_WHY[s.imagery];
  const held = (plan.cap < plan.budget ? `, held to the ${plan.cap} ${why}` : plan.cap > plan.budget ? `, raised to the ${plan.cap} a product page shows of its use, its load and its place` : '') + (plan.total > plan.cap ? ', more only where a scene, the hero, the footer or a section of pictures needs its own' : '');
  // (on a software page a part left with none takes an interface fragment in its picture's place)
  const ui = s.imagery === 'interface';
  const each = plan.parts.map((x) => (x.extra ? x.what : x.frame ? `${x.what} the product's frame${x.share ? ` and ${x.share}` : ''}` : `${x.what} ${x.share || (ui ? 'an interface fragment' : 'none')}`));
  const and = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0]);
  // (a portfolio without pictures of its own: one photograph of its place, the rest pieces of its work: photoPlan)
  if (PORTFOLIO.includes(s.input.sector) && s.imagery !== 'own') {
    const place = plan.parts.find((x) => x.photos), pieces = plan.parts.filter((x) => x.pieces);
    p(`**The photograph total: ${place ? `one on the whole page, of its place, in ${place.what}` : 'none on this page'}** (a portfolio without pictures of its own shows its work, never another's making).${pieces.length ? ` The other picture slots hold pieces of the client's work, each in its frame with \`data-slot="work"\` (section 7), or type: ${and(pieces.map((x) => `${x.what} ${x.pieces}`))}.` : ''} The work section's own pieces are counted apart (section 7). Each blueprint below takes its share, whatever number it names; a part left with none is built from its words, the colour and the dealt card style, never with a picture shown again at another crop.`);
    return;
  }
  p(`**The photograph total: at most ${Math.max(plan.cap, plan.total)} on the whole page${plan.floor ? `, at least ${plan.floor}` : ''}** (this direction takes ${plan.budget}${held})${each.length ? `: ${and(each)}` : ''}. Each blueprint below takes its share, whatever number it names; a part left with none ${ui ? 'takes an interface fragment (`data-ui`) in its picture\'s place, no photograph' : 'is built from its words, the colour and the dealt card style'}, never with a photograph shown again at another crop.${PORTFOLIO.includes(s.input.sector) ? ` The client's work is not counted here: it is pictures of the work (section 7)${s.imagery === 'own' ? '' : ', and a slot left without a photograph may show a piece of it, marked the same way'}.` : ''}${plan.rooms.length ? ` The rooms are their own set, counted apart: one picture beside each room the list shows (two or three kinds of room where pictures are few)${s.imagery === 'own' ? '' : ', a detail in a frame with `data-slot="room-photo"`'}.` : ''}`);
}
// Blueprints were measured on real sites and carry that site's sizes, greys, faces, colours and corners.
// This lists, for one blueprint, exactly where it disagrees with the house rules and the dealt system,
// so the builder does not have to work it out section by section.
function adjustments(bp, s) {
  const text = [bp.blueprint, bp.mobile, bp.headline].filter(Boolean).join(' ');
  // (the text without the sentences that forbid a thing: "No label, dash, side rule, tab strip or card over the
  // photograph" was told it lays a card over a photograph and draws lines, round 11e)
  const asked = text.split(/(?<=[.;:])\s+/).filter((t) => !/^(?:no|never|nothing|not|without)\b/i.test(t)).join(' ');
  const notes = [];
  const sizes = (re) => [...new Set([...text.matchAll(re)].map((m) => m[1] + 'px'))];
  const notSpacing = String.raw`(?!\s*(?:gaps?|gutters?|margins?|padding|radius|corners?|apart|from|inset|offset|high|tall|wide|thick|square|borders?|stroke|rules?|line\b|dots?|circles?|bars?|of|between|beneath|below|above|under|down|up|across|deep|left|right|in\b|to\b|and\b|each))`;
  const tiny = sizes(new RegExp(String.raw`(?<!(?:radius|radii|gap|margin|padding|inset|offset|top|bottom|left|right|height|width)[:\s]{0,3}(?:of\s)?)\b(9|10|11|12)(?:\.\d)?px\b` + notSpacing, 'g'));
  if (tiny.length) notes.push(`It sets text at ${tiny.join(', ')}: use your small step (13px or more) for a caption or a label, and your body step for running, list or table text.`);
  // (round 9: running, list and table text under 14px fails, 14-15px warns on desktop, under 15px fails on a phone)
  const running = [...new Set([...sizes(/\b(13|14|15)px\s*(?:paragraphs?|body|text|descriptions?|copy|sentences?|answers?)/gi), ...sizes(/(?<!legal )\b(?:paragraphs?|text(?! links?)|descriptions?|copy|sentences?|answers?|notes?)\b[^.;:]{0,24}?\bat\s+(13|14|15)(?:\.\d)?(?:[–-]1[4-6])?px\b/gi)])].sort();
  if (running.length) notes.push(`It sets running, list or table text at ${running.join(', ')}: use your body step (16px or more, 15px at the least on a phone). The inspector fails it under 14px and warns under 16px (\`small-body\`).`);
  // (round 9: a wall of six or more tiles in three fills or more fails, r8-p37)
  if (/\btile colou?rs rotate|\btiles\b[^.]{0,80}\b(?:colou?rs? rotate|rotat\w+ through[^.]{0,20}colou?rs|(?:its|their) own (?:flat )?colou?r|(?:different|alternating) colou?rs|in (?:two|three|four|several)\b[^.]{0,20}colou?rs)|\b(?:tile|fill) is a flat (?:palette )?colou?r\b|\bflat fill, rotating\b/i.test(text)) notes.push('It fills its tiles in several colours: set every tile on one fill (the ground, or one surface) and let the pictures carry the colour. Six tiles or more in three fills read as a wall of boxes (`tile-wall`).');
  // (round 11: four flat fields of four colours side by side read as colour sprawl)
  // (and r11-p51 used seven grounds and panels: "three or four full-bleed flat colour fields", "each panel takes its own
  // ground colour", "a field whose flat colour is taken from its own photograph")
  const fields = text.match(/\b(two|three|four|five|six|[2-6])(?: or (?:three|four|five|six|[3-6]))? (?:[\w-]+ ){0,2}?(?:flat )?colou?r(?:ed)? (?:fields|panels|grounds|bands|blocks)\b|\b(three|four|five|six|[3-6]) (?:colou?r )?fields\b[^.]{0,80}\b(?:differ\w*|own colou?r)\b|\b(?:each|every) (?:panel|field|section|card) (?:may )?takes? its own (?:flat )?(?:ground )?colou?r\b|\b(?:each|every|whose)\b[^.]{0,60}\bcolou?r\b[^.]{0,20}\b(?:taken|sampled) from (?:its|their) own (?:photo(?:graph)?|picture|image)s?\b|\beach is the ground colou?r of\b/i);
  if (fields) notes.push(`It sets ${fields[1] || fields[2] ? `${(fields[1] || fields[2]).toLowerCase()} fields` : 'its parts'} in colours of their own: on this page they take the ground and \`--surface\` in turn${s.palette?.fields?.length ? ', one of them `--field-1`' : ''} (section 4: two grounds, no more), never a new colour per field (\`surface-count\`).`);
  // (round 9: words on a photograph are read against the pixels under them, at every width; r7-p35 failed on the tablet and the phone)
  if (/(?<!\b(?:no|nothing|never|without|not) (?:\w+ ){0,2})\b(?:on|over|across) (?:the |a |its |each )?(?:full-bleed )?(?:photograph|picture|image|photo)(?:'s)?\b(?! (?:of|and|beside|next))|\b(?:photograph|picture|image)'s (?:calm(?:est)?|quiet(?:est)?) (?:area|part|side|corner)|\boverlap\w* (?:the )?(?:photograph|picture|image)/i.test(text)) notes.push('It sets words on a photograph: put them on its calm part, of one tone, and look again at 768 and 390, where the crop moves; the inspector reads the pixels under the letters at every width (`text-on-photo`).');
  if (/\d{1,2}% (?:opacity|black|ink|grey|gray|white)|opacity:? ?0?\.\d|\b(?:rest|others?|remaining)\b[^.;]{0,25}\b(?:at|to) \d{1,2}%(?! (?:of|width|wide))|full (?:ink|white|strength)[^.;]{0,60}\bat \d{1,2}%(?! (?:of|width|wide))/i.test(text)) notes.push('It fades text: anything a visitor reads, inactive items of a list included, is `--ink` or `--muted` at full strength (contrast 4.5:1 or more). The active item is told apart by `--ink` against `--muted`, weight or the accent, not by fading the rest.');
  if (/\d+px (?:corner )?radius|radius (?:of )?\d+px|\brounded\b|\bpill/i.test(text)) notes.push('It names its own corners: use the corner and the button design section 0 deals, one of each on the page.');
  // the hero fills the first screen alone (October 2026): a blueprint that lets the next section peek in, or runs part
  // of the hero below the fold, is cut back to one screen
  if (bp.archetype && /\bpeeks? in\b|\bnext section begins\b|\b(?:below|past|under) the fold\b|\bcontinues? (?:below|for \d+s?vh past)/i.test(text)) notes.push('It lets something run past the first screen (a peek of the next section, rows under the fold): the hero fills the first screen alone. Leave the peek out, fit what it needs into 100svh, and start the next section after the section gap (`hero-not-alone`).');
  // nothing runs into one screen edge (October 2026: r9-p41's product window ran into the right edge, the owner's
  // first complaint): a picture, a window, a strip or an object that one side of the screen crops keeps the margins
  // (a sentence that crops both sides, "the first letter cut by the left edge and the last runs off the right", spans
  // the width and passes)
  if (text.split(/(?<=\.)\s/).some((t) => new Set([...t.matchAll(ONE_EDGE)].flatMap((m) => m[0].toLowerCase().match(/\b(?:left|right)\b/g) || [])).size === 1)) notes.push('It runs something into one side of the screen (cropped by the left or right edge while the other side keeps its margin): nothing runs into one screen edge. Keep it inside the page margins on both sides, or let it span both edges as a full-bleed band (`edge-run`).');
  // no section huddled on one side (the Always block): a blueprint that keeps a half or three-quarters of the width as
  // untouched ground beside a narrow column (round 11e: "the remaining three-quarters of the 1440 screen is untouched
  // ground" was dealt to a café beside the sheet's own ban)
  if (/\b(?:remaining|rest of the)\b[^.]{0,40}\b(?:screen|width)\b[^.]{0,20}\b(?:untouched|empty|bare|blank)\b|\b(?:left|right) half of the (?:field|screen|section) stays empty\b/i.test(String(bp.blueprint || '').split(/\bPhone:|\bOn a phone\b/)[0])) notes.push('It keeps most of the width as untouched ground beside its content: no section is huddled on one side (`lopsided`). Set its words across the grid at a size that fills it, or put the section\'s picture or figure on the other side.');
  // fewer pictures, fewer words (round 11: a page needed twenty photographs; questions sections held fourteen answers)
  // (each part takes its share of the page's photograph total, section 5, whatever number it names)
  const plan = photoPlan(s);
  const share = plan.parts.find((x) => x.bp === bp);
  if (share && share.asked > share.share) notes.push(share.share ? `It asks for ${share.asked} photographs: on this page it takes ${share.share}, the best (section 5 counts the page's photographs), and a plain line of names for the rest where it lists more.` : `It asks for ${share.asked > 1 ? `${share.asked} photographs` : 'a photograph'}, and the page's photograph total leaves none here (section 5): ${s.imagery === 'interface' ? 'its picture is an interface fragment (`data-ui`), no photograph.' : share.frame ? 'build it round the product\'s frame, with no photograph.' : 'build it from its words, the colour and the dealt card style, with no picture.'}`);
  // (the product's frame where the hero does not hold it, and a portfolio's pictures that are pieces of its work)
  if (share?.frame && bp !== s.hero) notes.push('It holds the product\'s frame (section 5\'s hard rule): its largest picture is the designed frame with `data-slot="product-photo"`, about half the screen or more at the product\'s real ratio, and any other object or product photograph it names (a second panel, a row of cut-outs) is left out, never another make; where the blueprint has no picture, the frame stands beside its words at that size.');
  // (the rooms list keeps the rooms' own layout, whatever rows or thumbnails its blueprint draws: a guesthouse's rooms
  // were dealt a narrow column of 16px dots beside the sheet's "picture at 55% of the width")
  if (plan.rooms.some((x) => x.bp === bp)) notes.push(`It is the rooms list (section 5): each room it lists stands in two columns, its picture at 55% of the width or more${s.imagery === 'own' ? '' : ' (a detail in a frame with `data-slot="room-photo"`)'} beside one grouped block of its facts, whatever rows or thumbnails the blueprint draws.`);
  if (share?.pieces) notes.push(`On this page ${share.pieces > 1 ? `its ${share.pieces} pictures are pieces` : 'its picture is a piece'} of the client's work, each in its frame with \`data-slot="work"\` (section 7), never a photograph${share.photos ? `, beside the one photograph of its place` : ''}.`);
  const pieces = plan.work.find((x) => x.bp === bp);
  if (pieces && pieces.asked > 6) notes.push(`It holds ${pieces.asked} pieces: six of the client's work at most here, the best, each a picture of the piece (section 7), and a plain line of names for the rest.`);
  const wordsHeld = text.match(/\bHolds? (?:about )?(\d+)[–-](\d+) words\b/i);
  if (wordsHeld && +wordsHeld[2] > 60 && !['list', 'pricing'].includes(bp.role)) notes.push(`It holds up to ${wordsHeld[2]} words: a section carries 60 at most outside a list or a table (section 7). Cut it to two or three sentences.`);
  const questions = bp.role === 'faq' && text.match(/\b(\w+)(?: to | or |[–-])(\w+) (?:items|questions)\b/i);
  if (questions && asNumber(questions[2]) > 4) notes.push(`It holds ${questions[1].toLowerCase()} to ${questions[2]} questions: four at most, each answered in one or two sentences; the rest go to the contact.`);
  const repeats = ['features', 'how-it-works', 'showcase', 'about', 'intro'].includes(bp.role) && text.match(/\b(three|four|five|six|[3-6])(?: to | or |[–-])(four|five|six|seven|eight|[4-8]) (?:(?:capability|feature|text) )?(?:times|modules|features|blocks|steps|items|panels)\b/i);
  if (repeats && asNumber(repeats[2]) > 3) notes.push(`It repeats its unit ${repeats[1].toLowerCase()} to ${repeats[2]} times: three at most, each a heading and one sentence, so the section stays within 60 words.`);
  if (/\b(?:serif|sans-serif|condensed|grotesk|italic|monospace|mono|all caps|uppercase|capitals|script)\b/i.test(text)) notes.push(s.type ? `It names a kind of typeface: use the dealt faces (display ${s.type.display.family}, text ${s.type.text.family}) and their settings; capitals only where the type system sets them.` : 'It names a kind of typeface: use the brand faces.');
  const colours = [...new Set([...text.matchAll(/\b(green|red|blue|yellow|orange|pink|purple|teal|navy|cream|beige|brown|grey|gray|white|black)\b(?![- ](?:space|studio|background disappears))/gi)].map((m) => m[1].toLowerCase()))];
  if (colours.length) notes.push(`It names colours (${colours.join(', ')}): map them onto this palette's roles (ground \`--bg\`, panels \`--surface\` and the fields, text \`--ink\`/\`--muted\`, the accent \`--accent\` on the primary action only).`);
  if (/(?<!\b(?:no|without|never|not|nor) (?:a |any )?)(?<!\bhouse )\b(?:rule|rules|hairline|border|borders|divider|underline|thin line|1px line)\b/i.test(asked)) notes.push('It draws lines or borders: keep them only inside a table, a form or a `data-ui` fragment; elsewhere separate with space or a change of ground.');
  if (/shadow|glow/i.test(text)) notes.push('It mentions a shadow: only on something open above the page (a menu, a dialog), never on a resting element.');
  const bigSentence = [...text.matchAll(/\b(?:sentence|statement|paragraph|quotation|quote)\b[^.;]{0,40}?\b(?:at|to)\s+(?:clamp\(\s*\d+(?:\.\d+)?px,\s*)?(\d+(?:\.\d+)?)(px|vw)/gi)].some((m) => (m[2] === 'px' && +m[1] > 36) || (m[2] === 'vw' && +m[1] > 2.6));
  // (a split hero's headline is 5vw or more, so the smaller statement is no way out there: split-hero-title fails it; and a
  // hero's statement on two lines is its headline, at the hero's size)
  if (bigSentence && !(bp.archetype && /\btwo(?:-| )lines?\b/i.test(text))) notes.push(bp.split ? 'It sets a sentence large over several lines: jurors read that as a long headline. Cut it to a two-line headline at display size (5vw, 72px at 1440); beside the picture a smaller statement is not a way out (`split-hero-title`).' : 'It sets a sentence large over several lines: jurors read that as a long headline. Either cut it to a two-line headline at display size, or keep it a statement at 36px or less on three lines (24px, four lines on a phone).');
  // (the study's patterns give the length as 450vh, a pin lasting 2700px or three steps of 1500px)
  if (/(?:sticky|pinned|pins?\b|stays? (?:fixed|put|in place))/i.test(text) && /\b(?:three|four|five|six) (?:to (?:four|five|six) )?(?:viewports|screens)\b|\b(?:[3-9]\d\d|1\d\d\d)s?vh\b|\bpin\w*\b[^.]{0,40}\b[2-9]\d{3}px\b|\b(?:two|three|four|five|six) steps of (?:about )?[1-9]\d{3}px\b/i.test(text)) notes.push('It pins something for three screens or more: hold a pin for two or three screens at most, give every screen under it its own content, and let nothing pass over the pinned words (the inspector checks all three).');
  // a section that pins is one of the page's held stretches (settlePins)
  if (bp.role && !bp.archetype && pinHold(bp) && !carriedBy(s, bp)) notes.push(`It pins the screen like a scroll scene: it is one of this page's held stretches, counted with the scenes in section 9 (about ${pinHold(bp)} screen${pinHold(bp) === 1 ? '' : 's'}), on native scroll, with something new on screen at every step.`);
  // (and a hero that holds the first screen while its scroll plays, in pin words or not)
  if (bp === s.hero && pinHold(bp) && !(s.scenes || []).some((x) => x.carries === 'hero')) notes.push(`It holds the first screen while its scroll plays (about ${pinHold(bp)} screen${pinHold(bp) === 1 ? '' : 's'}): one of this page's held stretches, counted with the scenes in section 9, on native scroll (\`position: sticky\`), and the next section follows it.`);
  // the hero's headline stays whole above the first screen's bottom edge (r12-p56: a title cut by the fold read as cut off)
  const nearEdge = text.match(/\bbaseline (?:sits |rests )?(\d+)px above the (?:bottom|lower) edge\b/i);
  if (bp.archetype && (/\b(?:headline|name|word|title|letters)\b[^.]{0,40}\b(?:cut|cropped|clipped|sliced) by the (?:fold|bottom|lower edge)|\bbaseline (?:sits |rests )?[\d.]+%? below the (?:bottom|lower) edge\b|\bfeet of the letters are cut\b|\bcrosses the fold\b/i.test(text) || (nearEdge && +nearEdge[1] < 48))) notes.push('It sets the headline on or across the first screen\'s bottom edge: the `h1` stays whole above it, its last line\'s descenders clear of the edge by the page margin at 1440 by 900 and 390 by 844, at rest and through the entrance (`hero-cut`). Move it up or set it smaller; a title the fold cuts reads as cut off.');
  // a catalogue of pictures left on a page with none of its own (dealSection found no other): its captions change job
  if (['gallery', 'showcase'].includes(bp.role) && catalogue(bp) && ['no-product-photo', 'atmosphere'].includes(s.imagery) && s.input.sector !== 'restaurant') notes.push('Its captions name a maker, a model, a price or a room, which only another business\'s products or rooms would fit here: they carry the place and the use (what is shown, where, when), never a maker, a model, a price or a room (the hard rule in section 5).');
  // a heading is two lines at most (the Always line): one set on three or more is cut back
  if (/\b(?:heading|headline|title)s?\b[^.;]{0,40}?\b(?:in|on|over|across) (?:three|four|five)(?: or (?:four|five))? (?:short |stacked |tight )?lines\b|\b(?:three|four|five)-line (?:heading|headline|title)\b/i.test(text)) notes.push('It sets a heading on three lines or more: a heading is two lines at most at every width. Cut its words to two lines at the same size, never a smaller size in their place.');
  if (/\b(indented|stepped|staggered)\b[^.]{0,60}\b(line|heading|title)|\b(heading|title)[^.]{0,60}\b(indented|stepped|staggered)/i.test(text)) notes.push('It steps or indents the lines of a heading: set every line of a heading on one left edge. A staggered heading read as a gimmick in round 4.');
  if (/\b(paper|slip|receipt|sheet of paper|card)\b[^.]{0,80}\b(on|over) (a |the )?(contrasting|full-bleed|dark|flat)\b/i.test(text)) notes.push('It puts the content on a panel of another tone: set it on the section\'s own ground, or as the card style section 0 deals on the surface tone. A panel in a colour the palette does not name is one more ground (`surface-count`).');
  if (/mix-blend-mode:\s*(?:difference|exclusion)/i.test(text)) notes.push('It blends text with `difference`: over anything but black, white or grey that gives random hues. Use a solid ink chosen for each ground instead.');
  if (/tops? of the (?:letters|word|name|wordmark)|(?:letters|wordmark|name|word)\b[^.;]{0,30}\b(?:sliced|cut|cropped|clipped)[^.;]{0,20}\btop/i.test(text)) notes.push('It crops letters along their top: the inspector fails that (jurors read it as broken). Crop at the bottom edge or a side instead.');
  if (bp.archetype && /single action[^.;]{0,40}?\b(?:text link|underlined (?:text )?link)/i.test(text)) notes.push('Its action is a text link: the primary action on the first screen is a real button (filled or solid-bordered, 44px or taller), placed where the blueprint puts the link. A second action may stay a link.');
  if (['condensed-heavy', 'condensed'].includes(s.type?.class) &&/\d+(?:\.\d+)?vw/.test(text)) notes.push('Its vw sizes assume a face of normal width: with this condensed display face, size the words to fill the measure the blueprint gives them instead of copying the vw value.');
  // (never a decimal: "leading 1.02" is no numbering)
  if (/(?<![\d.])\b0[1-9]\b(?![:.,]\d)|numbered|index number/i.test(text)) notes.push('It numbers things 01, 02: drop the numbers unless they are real data (a price, a date, a count).');
  // a card laid over a photograph is a box over a picture (r9-p43's dark room cards on photographs): cards stand on the
  // ground, beside their picture
  if (/\b(?:card|panel|box|(?:solid|filled) (?:bar|band|strip|label))\b[^.;]{0,60}\b(?:on|over|across) (?:a |the |its )?(?:full-bleed |closing )?(?:photograph|picture|image|photo)(?:'s (?:bottom|top|lower|upper) (?:edge|part|third))?\b(?! (?:of|and|beside|next))|\b(?:photograph|picture|image)\b[^.;]{0,60}\bcarries (?:one )?(?:solid )?(?:card|panel)\b/i.test(asked) || (bp.archetype && /\bcards?\b/i.test(bp.blueprint || '') && /\b(?:photograph|picture|film)\b[^.]{0,40}\b(?:fills the viewport|full-bleed|100vw)/i.test(bp.blueprint || '') && !/\bno cards?\b/i.test(bp.blueprint || ''))) notes.push('It lays a card or panel over a photograph: a box on a picture fails the inspector, like a box in a box. Set the card beside the picture on the ground, in the card style section 0 deals, or put the words on the picture\'s calm part with no box.');
  // the rooms of a house and the products of a shop are each shown (r7-p35 listed four rooms and pictured one)
  const each = { hospitality: 'room', ecommerce: 'product' }[s.input.sector];
  if (each && bp.role === 'list' && !plan.rooms.some((x) => x.bp === bp) && !/photo|picture|image/i.test(bp.blueprint || '')) notes.push(`It lists without pictures: on this page each ${each} it names has its own picture beside it (section 5), as many pictures as ${each}s. Set each ${each}'s row beside its picture, or take a list that pictures each item (\`--alternatives list\`); with fewer good pictures, list fewer ${each}s.`);
  const visit = visitNote(s, text);
  if (visit) notes.push(visit);
  // the visit block stands once: where the footer section 0 deals is that block, a section leaves the street, the hours
  // and Directions to it (after a section redraw, or a blueprint with an address line among its facts)
  if (s.frame?.footer?.id === 'hours-and-place' && bp.role && (/\bDirections\b/.test(text) || /\b(?:opening hours|street|address(?:es)?|postcode)\b/i.test(text))) notes.push('It prints the street, the hours or Directions, and on this page the footer section 0 deals is the visit block: leave them to it. Keep this shape for what the section still says (the booking block where the page books, otherwise one sentence and the email), or take another (`--alternatives ' + bp.role + '`).');
  // round 9: r9-p42 hid its specs and four of its five loads behind tabs and an accordion; r9-p41 put a band of figures
  // over one-word labels on the page and asked for an email twice (the closing sentence and the footer)
  if (bp.role && bp.role !== 'faq' && /(?<!\b(?:no|never|not|without|nor|into an?)\s(?:\w+\s){0,2})\b(?:tabs?|accordions?|collapsible)\b/i.test(text)) notes.push(`It hides content behind tabs or an accordion: on a one-page site the key content (specs, loads, rooms, plans, the menu) stands in the open, all of it readable without a click; tabs or an accordion only for secondary detail such as the questions. Set every panel of it in the open, one after another, or take another shape (\`--alternatives ${bp.role}\`).`);
  if (/\b(?:three|four|five|six)(?: or (?:four|five|six))? (?:big |large |key )?(?:facts|figures|numbers|stats|statistics)\b[^.]{0,160}\b(?:values?|figures?|numbers?) at the (?:head|sub|display) (?:step|size)|\b(?:three|four|five|six) (?:big |large )?(?:figures|numbers|stats|statistics)\b|\bstats? (?:band|row|strip)\b/i.test(text)) notes.push('It sets figures over short labels: never a band of big figures each over a one- or two-word label (`stats-band`). Each figure stands in the line that says what it counts ("Notes from 2019 still come back: 1,284 of them"), or the figures go.');
  if (asksEmail(bp)) {
    const i = (s.sections || []).indexOf(bp);
    const before = (s.sections || []).slice(0, i < 0 ? 0 : i).some(asksEmail);
    const signUp = s.frame?.footer?.id === 'newsletter-card';
    const booking = !before && !signUp && bookingBlock(s);
    // (the section that holds the booking block builds it in this form's place)
    const bookingHere = booking && bp.role === (s.input.sections.includes('contact') ? 'contact' : 'cta');
    if (bookingHere) notes.push('It asks for an email, and on this page its form is the booking block (section 7): build that block in the form\'s place, its choices in the open with the email field and the one button that sends them, as the page\'s one email form.');
    else if (before || signUp || booking) notes.push(`It asks for an email, and ${before ? 'a section before it already does' : booking ? 'the booking block (section 7) has the page\'s email field' : 'the footer dealt in section 0 has the sign-up'}: one email form on the page. Here the action is a button to ${before ? 'that form' : booking ? 'the booking block' : 'the footer\'s sign-up'}, or the section takes its other shape without a field.`);
  }
  // a booking button with nothing to choose (r9-p43's contact card ended on one): the booking block goes there
  if (bookingBlock(s) && /\b(?:booking|book|reserv\w*)\b[^.]{0,30}\b(?:button|link)\b/i.test(text)) notes.push('It ends on a booking button or link: on this page the booking block (section 7) goes there, its choices (the dates or the time, the guests) set in the open with the button that sends them, never a lone button with nothing to choose.');
  // a blueprint that turns its pictures grey keeps the page's one treatment: colour (a black-and-white file included),
  // black-and-white only where the brief asks for it and section 0 deals it
  if (s.frame?.treatment?.id !== 'mono' && /(?<!\b(?:no|never|not|without)\s(?:\w+\s)?)\b(?:gr[ae]yscale|black-and-white|desaturat\w*)/i.test(text)) notes.push('It turns its pictures grey: keep every picture in colour with the treatment section 0 deals, and leave out any stand-in whose file is black-and-white (references/imagery.md §6).');
  // a client named for a light gets bright pictures: a blueprint that darkens one for white type is set the other way
  if (nameColours(s.input.brief).lean === 'light' && /darken|brightness\(0\.|scrim|low-key|white type|type is white/i.test(text)) notes.push('This client\'s name asks for bright pictures (section 4): keep the photograph untouched, no scrim and no `brightness()` under 1; set the words in the ink on its pale calm part, or beside it.');
  // a hero written without a navigation bar fails the inspector's no-nav check (r8-p38's mid-screen rail)
  // a hero that sets its words in a panel among its pictures is a headline in a card (a contact sheet's text cell)
  if (bp.archetype && /\b(?:filled )?panel\b[^.]{0,160}\.\s*Inside it\b[^.]{0,80}\b(?:wordmark|headline|sentence|name)\b/i.test(text)) notes.push('It sets the first screen\'s words inside a panel: no headline in a card, panel or box (`hero-in-card`). Keep the panel\'s place in the composition as the page\'s own ground with no fill, or set the words beside the pictures on the ground, and the headline at the display step.');
  if (bp.archetype && /\bno (?:navigation|header)\b/i.test(text)) notes.push('It has no navigation bar: the page keeps the navigation section 0 deals, a bar at the top of the first screen apart from the h1, with the real sections as links and the one action.');
  // the hero's geometry is binding, within the house rules: a drawn shape and a headline on a card are not (round 10)
  if (/(?<!\bno (?:\w+ )?)\b(?:dot(?:ted)? leaders?|leaders? of (?:round )?(?:\d+px )?dots)\b/i.test(text)) notes.push('It joins a name and its value with a leader of dots: join them with space alone (`justify-content: space-between`), no dots and no line.');
  if (/drawn in CSS|inline SVG path|flat shape at enormous scale/i.test(text)) notes.push('It draws a shape: no drawn or decorative shapes on this page. Cut a photograph of the subject to that outline at the same size and place, or leave the ground plain; the button keeps the page\'s one shape.');
  // (a zigzag of text set flush left and right is no edge; a notch cut from a card like a coupon is: round 11c dealt a ticket card)
  if (!bp.archetype && /scallop|zigzag (?:edge|foot|tear|cut|bottom)|(?:edges?|edge is|cut into) (?:a |shallow )?(?:scallops or a )?zigzag|tear-off strip|\bnotch(?:es)? cut\b|\bnotched\b|\bcoupon\b/i.test(text)) notes.push('It cuts scalloped, zigzag, notched or torn edges: no drawn or decorative shapes on this page, and a card is never cut into a ticket. Every edge stays straight, and the content stands on the section\'s own ground.');
  if (bp.archetype && /\b(?:printed|menu) card\b/i.test(text)) notes.push('It sets the headline on a card: no headline in a card, panel or box (`hero-in-card`). That half is the page\'s own ground, the same colour, running to the edges with no inset and no corners; the words keep their place and size on it, and the photograph keeps its half.');
  if (bp.archetype && /\bportrait card\b/i.test(text)) notes.push('It sets the title on a card: no headline in a card, panel or box (`hero-in-card`). The page\'s ground is the paper: the names and the date, time and place sit straight on it where the card held them, with no card, no scalloped corners and no diamond between the lines.');
  return notes;
}
// A blueprint that puts an email field (a sign-up, a newsletter, a sentence with a blank for the address) on the page
// (EMAIL_FORM at the top).
function asksEmail(bp) { return !!bp?.blueprint && bp.role !== 'footer' && EMAIL_FORM.test([bp.blueprint, bp.mobile].filter(Boolean).join(' ')); }
// A street, hours and a phone the brief does not give are never made up as placeholders (r7-p36 printed Musterstrasse
// 12 and 030 000 000 00 in its visit and footer block). Asked of every blueprint and of the footer dealt in section 0,
// which outranks them. A product sold online, an app or a portfolio has no door to print, unless its brief gives a
// street; a place people go to prints a real street without a number and the way there (visitBlock, section 7).
function visitNote(s, text) {
  const given = visitGiven(s.input.brief);
  // ("on a phone" is the phone layout; a delivery or email address is a form field, and the "address, time or price" of
  // a table row is not where the client is)
  const asksStreet = /\bpostcode\b|(?<!(?:delivery|billing|shipping|e-?mail|web|ip) )\baddress(?:es)?\b(?!,\s*time)/i.test(text);
  const asksPhone = /\b(?:tele)?phone numbers?\b|\btelephone\b/i.test(text);
  if (noDoor(s.input)) return asksStreet || asksPhone ? `This page has no door in its brief: no street, hours${given.phone ? '' : ' or phone'}. In their place the email on the brand's own domain${given.phone ? ', the phone the brief gives' : ''} and the city, if the brief names one; the report lists what to fill (references/copy.md §5).` : null;
  const street = asksStreet && !given.street, phone = asksPhone && !given.phone;
  if (!street && !phone) return null;
  const where = hasDoor(s.input)
    ? 'in place of the street address, a real street in the right district of the town, with no house number, and the way there, as "The visit" in section 7 says'
    : 'in place of the street, the town the brief names';
  return `It prints ${[street && 'a street address', phone && 'a phone number'].filter(Boolean).join(' and ')}, which the brief does not give: ${[street && `${where}; never a placeholder street (Musterstrasse 12, 1 Main Street)`, phone && 'leave the phone out, never a zeroed or patterned number'].filter(Boolean).join('; ')}. The email stays on the brand's own domain, and the report lists what to fill (references/copy.md §5).`;
}
function noDoor(input) { return (isSoftware(input) || ['physical-product', 'ecommerce', 'personal-portfolio'].includes(input.sector)) && !visitGiven(input.brief).street; }
// A place people go to (DOOR_WORDS at the top): its sector, or a word for one in the brief's own subject (never its
// clients: "designs for restaurants, bars and hotels" is a studio with no door; an event is dated, never open daily).
function hasDoor(input) { return !noDoor(input) && (['hospitality', 'restaurant'].includes(input.sector) || (input.sector !== 'event' && DOOR_WORDS.test(briefHead(input.brief)))); }
// The visit block of a place people go to (r9-p44 gave hours and an email under "Open in Berlin": no street, district,
// stop or map, and the judge marked it high). Printed once in section 7; the inspector warns visit-without-directions.
function visitBlock(s) {
  if (!hasDoor(s.input)) return null;
  const given = visitGiven(s.input.brief);
  const house = s.input.sector === 'hospitality';
  // printed once: the hours-and-place footer is the visit block itself, and the other footers give the city and
  // Directions only (round 11: the visit block in the contact section, and the address, the season and Directions
  // again in the footer, on about two door pages in five)
  const inFooter = s.frame?.footer?.id === 'hours-and-place';
  const where = inFooter ? 'the footer dealt in section 0, which is this page\'s visit block' : s.input.sections.includes('contact') ? 'the contact section' : 'a short visit section before the footer, which a place people go to always has';
  // a district the brief names ("Berlin-Neukoelln", "the Kiez") is the client's, not sample copy
  const district = /\b\p{Lu}\p{L}+-\p{Lu}\p{L}+\b|\b(?:district|quarter|neighbou?rhood|borough|arrondissement|Kiez)\b/u.test(String(s.input.brief || ''));
  const sample = [!given.street && 'the street or the village', !district && 'the district', 'the way there and its time', house ? 'the season' : 'the hours', !given.phone && 'the email'].filter(Boolean);
  const remote = (x) => (given.street ? '' : x);
  return `**The visit: this is a place people go to, so the page says how to get there** (in ${where}): ${given.street ? 'the address the brief gives' : 'the street, a real street in the right district of the town the brief names, with no house number (the brief gives none), or for a remote place or a brief that names only a region, the village it stands in (a real one in that place, chosen and marked as sample copy when the brief names none) and the nearest town with the road from it'}; the district or area${district ? ' the brief names' : ''}; the nearest stop and its line (read from a map in this session or one you are sure of, otherwise the district\'s main station)${remote(', or for a remote place the drive from that town with its time, and from the airport or city most visitors come from (from the road distance on a map, or at about 60 km an hour on country roads when no map can be read, rounded up; never a time that makes the place nearer than it is: a Westfjords house once claimed forty minutes from Reykjavik)')}; ${house ? 'the season and the check-in times' : 'the opening hours'}; a "Directions" link to a maps service searching that ${given.street ? 'street' : 'street, village or road'} and town; and one contact (${given.phone ? 'the phone the brief gives, or ' : ''}the email on the brand's own domain${given.phone ? '' : ', since the brief gives no phone'}). ${inFooter ? `Set it as the footer's two columns and nowhere else: no section above repeats the address, the hours or Directions${bookingBlock(s) ? ', and the booking block keeps its own place' : ''}.` : 'Set it as one group, in the card style section 0 deals or as one panel, and only here: the footer gives the city and Directions, not the block again.'} Never a placeholder street, never a zeroed phone, never the city's name alone (\`visit-without-directions\`). The report marks ${sample.slice(0, -1).join(', ')} and ${sample.at(-1)} as sample copy for the client to confirm.`;
}
// A place people book ends with a real booking block: r9-p43 (Hvit) ended on a bare email field under a photograph of
// a lighthouse. Printed once in section 7, under the visit block (BOOK_WORDS at the top).
// A house always takes it; a restaurant or another place people go to only when its brief books (a café that never
// mentions a booking gets none).
function bookingBlock(s) {
  const house = s.input.sector === 'hospitality', table = s.input.sector === 'restaurant';
  if (!house && !((table || hasDoor(s.input)) && BOOK_WORDS.test(s.input.brief || ''))) return null;
  const where = s.input.sections.includes('contact') ? 'the contact section' : 'the closing section';
  const what = house ? 'the dates (arrival and departure), the guests and the room, what the rate includes and the price from, per night' : table ? 'the date, the time and the party size, beside the hours' : 'the date or a short request, what is included and the price from';
  const priced = !table && !PRICE_GIVEN.test(s.input.brief || '');
  return `**The booking: a place people book ends with a real booking block** (in ${where}): ${what}, sent as one filled request with its email field (wired as SKILL.md's "No checkout, no form backend" says); it is the page's one email form. Never a bare email field or a lone "Book" button with nothing to choose (a guesthouse page ended on one).${priced ? ` The report marks the ${house ? 'rates' : 'prices'} as sample copy.` : ''}`;
}
// Whether the brief gives a street address (a number beside a street word) and a phone number.
function visitGiven(brief) {
  const b = String(brief || '');
  const STREET = '(?:street|st\\.?|road|rd\\.?|avenue|ave\\.?|lane|row|square|quay|terrace|rue|via|calle|avenida|piazza|plaza|strasse|straße|gasse|weg|platz|allee|ufer|damm)';
  return {
    street: new RegExp(`\\b\\d{1,4}[a-z]?,?\\s+(?:[\\p{L}'’.-]+\\s+){0,3}${STREET}(?![\\p{L}])|\\b${STREET}\\s+(?:[\\p{L}'’.-]+\\s+){0,3}\\d{1,4}\\b|\\p{L}+(?:strasse|straße|str\\.|gasse|weg|platz|allee|vej|gata|gade|vegur|vägen|straat|laan)\\s*\\d{1,4}\\b`, 'iu').test(b),
    // international or national ("+47 ...", "030 ..."), and North American ("(212) 555-0147", "212-555-0147")
    phone: /(?:\+\d|\b0\d)[\d\s()./-]{6,}\d|\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/.test(b),
  };
}
// Every blueprint of a role that suits this direction and this build's real assets.
function sectionPool(dir, role, input) {
  // banned blueprints (drag rails, progress bars, folder tabs) are never dealt, nor one whose tile or panel leaves its
  // middle empty (hollow, as the patterns are read: round 11e found four in this file)
  let pool = L.sections.filter((s) => s.role === role && !s.banned && !hollow(s));
  if (!pool.length) return [];
  const mode = imageryMode(input);
  const feasible = pool.filter((s) => (s.needs || []).every((n) => n === 'photography' || input.have.includes(n) || (n === 'product-ui' && mode === 'interface')));
  if (feasible.length) pool = feasible;
  if (mode !== 'interface' && !input.have.includes('product-ui')) { const plain = pool.filter((s) => !softwareOnly(s)); if (plain.length) pool = plain; }
  if (mode === 'interface' || mode === 'no-product-photo') {
    // prefer compositions that do not hang on a photograph of the thing
    const honest = pool.filter((s) => (mode === 'interface' ? worksWithoutPictures(s) : !(s.tags || []).includes('object-led') || worksWithoutPictures(s)));
    if (honest.length >= 2) pool = honest;
  }
  // a portfolio's work is shown as pictures of the work, never as an index of names alone (patternSections)
  if (role === 'work' && PORTFOLIO.includes(input.sector)) { const shown = pool.filter((s) => (s.tags || []).includes('photo-led') || (s.tags || []).includes('object-led')); if (shown.length) pool = shown; }
  const byDirection = pool.filter((s) => (s.directions || []).includes(dir.id));
  if (byDirection.length) return byDirection;
  const byTag = pool.filter((s) => (s.tags || []).some((t) => (dir.sectionTags || []).includes(t)));
  return byTag.length ? byTag : pool;
}
// The structure of a section as built: split, grid, list, table, statement, gallery, single-picture, object (one printed
// or product object on a field), column (one reading column), tool (the product's own interface or a working control),
// band (full-width fields, a row of names) or stage (it pins). library/sections.json gives each blueprint its own; a
// pattern of the study is read from its name, its pictures, then its shape. Within one page no structure comes three
// times and none twice in a row (r12-p54 built six middle sections as a heading, a line and a list panel). The words of
// a pattern's name for each are at the top (STRUCTURE_NAMES).
function structureOf(bp) {
  if (!bp?.blueprint) return null;
  if (bp.structure) return bp.structure;
  if (pinHold(bp)) return 'stage';
  const words = `${bp.id} ${bp.name || ''}`.replace(/-/g, ' ');
  // (a pattern made of several pictures that its name calls pictures is a gallery, whatever else it names; its footage
  // counts as pictures, several where it says videos, clips or video slides, none where it only previews under the
  // pointer)
  const footage = bp.pneeds?.video && !/\bpreview\b/.test(words) ? (/\b(?:videos|clips|video slides)\b/i.test(bp.blueprint) ? 2 : 1) : 0;
  const pictures = Math.max(picturesLead(bp) ? patternPictures(bp) : 0, footage);
  if (pictures > 1 && GALLERY_NAME.test(words)) return 'gallery';
  for (const [k, re, unless] of STRUCTURE_NAMES) if (re.test(words) && !unless?.test(words)) return k;
  if (pictures) return pictures > 1 ? 'gallery' : 'single-picture';
  if (STATEMENT_NAME.test(words)) return 'statement';
  return bp.pneeds?.productUi ? 'tool' : SHAPE_STRUCTURE[bp.shape] || 'column';
}
// The page's sections in order with their structures, as built: the replay's section is its window (a tool), a section
// a scene carries is that scene, and the footer, a cta the footer carries and an empty slot are left out. skip: a role
// left out (the one being dealt).
function structureRun(s, skip = null) {
  const out = [];
  for (const sec of s.sections) {
    if (sec.role === skip || (sec.role === 'footer' && s.frame) || (sec.role === 'cta' && ctaByFooter(s))) continue;
    const scene = carriedBy(s, sec);
    const k = s.replay?.carries === sec.role ? 'tool' : scene ? `scene:${scene.id}` : structureOf(sec);
    if (k) out.push({ role: sec.role, k, replay: s.replay?.carries === sec.role });
  }
  return out;
}
// Whether a structure may stand in this role's place: not twice on the page already, not the structure of the section
// built before or after it (a split hero counts as a split before the first).
function structureFits(s, role) {
  const roles = ['hero', ...s.input.sections];
  const at = roles.indexOf(role);
  const run = structureRun(s, role);
  const before = run.filter((x) => roles.indexOf(x.role) < at).at(-1)?.k ?? (heroShape(s.hero) === 'split' ? 'split' : null);
  const after = run.find((x) => roles.indexOf(x.role) > at)?.k ?? null;
  return (k) => !k || (k !== before && k !== after && run.filter((x) => x.k === k).length < 2);
}
// A section is dealt from every blueprint of its role that suits the brief, not only the one to three the direction
// names: the direction's own weigh 1, those that suit its tags 0.6, the rest 0.3 (the sheet keeps the geometry and sets
// it in the direction's type and colour). Then away from the last draws (awayFrom: round 11 dealt one call to action on
// seven of sixteen saas pages and one visit card on three door pages in a row, with only the page itself checked).
// The study's section patterns that stand in for this role and fit the page join the pool (patternSections, at about
// half a direction's own blueprint each), so a role draws on far more than its few blueprints; the page keeps its order
// of sections, its word and picture budgets (the adjustments under each) and its closing rules.
// s: the sheet so far, for the clashes a pattern names.
function dealSection(dir, role, usedIds, prevShape, nextShape, input, s = null, out = null) {
  // out: the blueprints to leave out (settlePins: any that pins, the page's held stretches being full; settlePhotos: any
  // made of pictures, the page's photograph total leaving it none)
  const own = sectionPool(dir, role, input).filter((x) => !out?.(x));
  const pats = patternSections(dir, role, input, s).filter(([x]) => !out?.(x));
  // (the blueprints of other directions too, before giving up: with `out`, a direction's own can all be left out)
  const all = sectionPool({ ...dir, id: null, sectionTags: [] }, role, input).filter((x) => !out?.(x));
  if (!own.length && !pats.length && !all.length) return null;
  const tagged = (s) => (s.tags || []).some((t) => (dir.sectionTags || []).includes(t));
  const named = own.some((s) => (s.directions || []).includes(dir.id));
  let pool = [...new Set([...own, ...all])].map((s) => [s, own.includes(s) ? 1 : tagged(s) && named ? 0.6 : 0.3]);
  pool.push(...pats);
  // a software page leans to the blueprints built from its own interface
  if (imageryMode(input) === 'interface') pool = pool.map(([s, w]) => [s, w * ((s.tags || []).includes('ui-led') || s.pneeds?.productUi ? 2.5 : 1)]);
  // (a gallery shows three photographs or more: one that holds a single picture beside a text card, or a pair, is no
  // gallery)
  if (role === 'gallery') { const many = pool.filter(([x]) => galleryOf(x)); if (many.length) pool = many; }
  // (a gallery or a showcase of pictures captioned with a maker, a model, a price or a room is a catalogue: on a page with
  // no photographs of its own only another business's products or rooms fit it, and a cargo-bike page's tiles named the
  // maker or model; a café's dishes beside their prices are its own, as section 5 says)
  if (['gallery', 'showcase'].includes(role) && ['no-product-photo', 'atmosphere'].includes(imageryMode(input)) && input.sector !== 'restaurant') { const honest = pool.filter(([x]) => !catalogue(x)); if (honest.length) pool = honest; }
  const unused = pool.filter(([s]) => !usedIds.includes(s.id)); if (unused.length) pool = unused;
  // no structure three times on the page and none twice in a row (structureFits), while one not dealt lately fits; else
  // the fresh one stays and settleStructures deals its neighbour again (round 11c: a gallery role after a gallery intro
  // took the one single-picture gallery three draws after the last page had it). With none fresh, one that fits unless
  // the only ones that fit are the last page's (a café's contact rows came back on the guesthouse drawn next)
  if (s) {
    const fits = structureFits(s, role); const kept = pool.filter(([x]) => fits(structureOf(x)));
    if (liveOf(kept, 'sections').length || (!liveOf(pool, 'sections').length && kept.some(([x]) => !histHas(hist[0], 'sections', x.id)))) pool = kept;
  }
  // never two of one shape side by side (split-stage's showcases for a product are both splits, after a split hero: r9-p42)
  const varies = ([s]) => s.shape !== prevShape && s.shape !== nextShape;
  const varied = pool.filter(varies); if (varied.length) pool = varied;
  // (a role with few blueprints, the contact of a door place, keeps any one fresh rather than repeat a recent one)
  return wpick(awayFrom(pool, 'sections', 1));
}
// A section that pins (pinHold) is one of the page's held stretches beside its scenes: together no more than the page
// takes scenes (sceneMost), no more than about six and a half screens held, none next to a scene, the replay or another
// pin, and none on a page built without a scene (its sheet asks for no pinned stretch). One over that is dealt again from
// the blueprints and patterns that do not pin (round 12: Hvit had two scenes, a held picture and a 200vh collage
// section). keep: a role whose section was taken by id. heroTried: the heroes left out so far (null: the hero stays).
function settlePins(s, keep = null, heroTried = null) {
  const dir = L.directions.find((d) => d.id === s.direction.id) || s.direction;
  const roles = ['hero', ...s.input.sections];
  const scenes = s.scenes || [];
  const busy = new Set([...scenes.map((x) => x.carries), s.replay?.carries].filter(Boolean).map((r) => roles.indexOf(r)));
  // (a section a hand-over scene opens is still built, so its pin would follow the scene's at once; a cta the footer
  // dealt in section 0 carries is never built)
  const opened = new Set(scenes.filter((x) => x.position === 'transition').map((x) => roles.indexOf(x.carries)));
  const built = (sec) => !!sec.blueprint && !(sec.role === 'cta' && ctaByFooter(s));
  let count = scenes.length, held = scenes.reduce((t, x) => t + (x.hold || 2), 0);
  // (a hero that pins, a name held in two corners while the page passes, is one of them too: it stays only where it
  // fits beside the scenes and the sections that pin, never next to a scene, else another hero is dealt; round 11b
  // dealt two pinned heroes in twelve beside a scene on the first section)
  const pins = s.sections.filter((x) => built(x) && !busy.has(roles.indexOf(x.role)) && pinHold(x));
  // (beside a kept signature move, in what its stretch leaves: keptMove)
  const beside = () => (keptMove(s) ? moveHold(s) : 0);
  const heroFits = (h) => scenes.length && count + pins.length + (beside() ? 1 : 0) < sceneMost(s.input) && held + h + beside() + pins.reduce((t, x) => t + pinHold(x), 0) <= HOLD_BUDGET && !busy.has(1) && !pins.some((x) => roles.indexOf(x.role) === 1);
  while (heroTried && !busy.has(0) && pinHold(s.hero) && !heroFits(pinHold(s.hero)) && heroTried.length < 8) { heroTried.push(s.hero.id); s.hero = dealHero(dir, s.input, heroTried, s); }
  const heroHold = busy.has(0) ? 0 : pinHold(s.hero);
  if (heroHold) { busy.add(0); count += 1; held += heroHold; }
  // (a signature move that holds the stage, a pinned story or a sideways gallery, is one of them too, counted with the
  // hero when it is the hero's pin (moveHold): a kept one stays, another only where it fits beside the scenes and the
  // hero, else another move is dealt; round 11b left these holds uncounted)
  const mv = moveHold(s);
  if (mv && (keptMove(s) || (scenes.length && count < sceneMost(s.input) && held + mv <= HOLD_BUDGET))) { count += 1; held += mv; }
  else if (mv) s.motion = otherMove(s);
  // (the cta last: when the footer carries it, its pin pushes out no other)
  const order = s.sections.map((_, i) => i).sort((a, b) => (s.sections[a].role === 'cta') - (s.sections[b].role === 'cta'));
  for (const i of order) {
    const sec = s.sections[i];
    const at = roles.indexOf(sec.role);
    const hold = built(sec) && (!busy.has(at) || opened.has(at)) ? pinHold(sec) : 0;
    if (!hold) continue;
    const fits = scenes.length && !busy.has(at) && count < sceneMost(s.input) && held + hold <= HOLD_BUDGET && ![at - 1, at + 1].some((k) => busy.has(k));
    if (fits || sec.role === keep) { busy.add(at); count += 1; held += hold; continue; }
    s.sections[i] = dealSection(dir, sec.role, s.sections.map((x) => x.id), s.sections[i - 1]?.shape ?? (s.hero?.split ? 'split' : undefined), s.sections[i + 1]?.shape, s.input, s, pinHold) || sec;
  }
  // (a section taken by id stays over the count: then a move with a stretch of its own gives way; round 11c kept a
  // scene, a pinned section and the move on a page that takes two)
  if (moveHold(s) && (count > sceneMost(s.input) || held > HOLD_BUDGET)) s.motion = otherMove(s);
}
// The screens the signature move holds as a stretch of its own: none with the replay or a move that holds nothing, and
// none when it is the hero's own move and the hero pins where no scene carries it, since the hero's pin is that one
// stretch (round 11c counted a name held in two corners and its pinned story twice).
function moveHold(s) {
  const hold = s.replay ? 0 : MOVE_HOLD[s.motion?.id] || 0;
  return hold && s.motion.id === s.hero?.motion && pinHold(s.hero) && !(s.scenes || []).some((x) => x.carries === 'hero') ? 0 : hold;
}
// A signature move that holds the stage and is the direction's or the hero's own stays (settlePins), and the scenes leave
// its stretch free, on a page that takes two scenes or more (round 11c: it was swapped whenever the scenes filled the
// page, while the sheet's composition still asked for its hold). One dealt at random gives way instead.
function keptMove(s) { return !s.replay && !!MOVE_HOLD[s.motion?.id] && [s.direction?.motion, s.hero?.motion].includes(s.motion.id) && sceneMost(s.input) > 1; }
// The screens the scenes leave free for a kept move: its own hold, or the hero's pin where that is the same stretch.
function keptHold(s) { return keptMove(s) ? Math.max(MOVE_HOLD[s.motion.id], moveHold(s) ? 0 : pinHold(s.hero)) : 0; }
// Whether a move that holds the stage fits beside the page's scenes, a hero that pins and the sections that pin.
function moveRoom(s, hold) {
  const scenes = s.scenes || [];
  const heroHold = scenes.some((x) => x.carries === 'hero') ? 0 : pinHold(s.hero);
  const pins = pinnedSections(s);
  return !s.replay && scenes.length > 0 && scenes.length + (heroHold ? 1 : 0) + pins.length < sceneMost(s.input) && scenes.reduce((t, x) => t + (x.hold || 2), 0) + heroHold + pins.reduce((t, x) => t + pinHold(x), 0) + hold <= HOLD_BUDGET;
}
// Another signature move for one that cannot stay: never one the deal leaves out, the set-type entrance's own two
// (settleMotion) or one that holds the stage.
function otherMove(s) {
  return wpick(L.motions.filter((m) => m.id !== s.motion?.id && !NOT_DEALT_MOVES.has(m.id) && !['masked-headline', 'shutter-image'].includes(m.id) && !MOVE_HOLD[m.id]).map((m) => [m, m.id === 'stillness' ? 0.5 : 1]));
}
// A section whose structure would come a third time on the page, or twice in a row, once the scenes, the replay and the
// pins have settled, is dealt again from those that keep the run varied; never one that pins or, where it had none, one
// made of pictures (settlePins and settlePhotos have counted them). keep: a role whose section was taken by id.
function settleStructures(s, keep = null) {
  const dir = L.directions.find((d) => d.id === s.direction.id) || s.direction;
  for (const sec of [...s.sections]) {
    const i = s.sections.indexOf(sec);
    if (sec.role === keep || !structureRun(s).some((x) => x.role === sec.role && !x.replay && !x.k.startsWith('scene:'))) continue;
    const fits = structureFits(s, sec.role);
    if (fits(structureOf(sec))) continue;
    // (a fresh one that fits first; else any that fits, one dealt lately included, since the rule holds on the page, but
    // never the last page's)
    const out = (y) => !!pinHold(y) || (madeOfPictures(y) && !madeOfPictures(sec));
    const again = (o) => dealSection(dir, sec.role, s.sections.map((x) => x.id), s.sections[i - 1]?.shape ?? (s.hero?.split ? 'split' : undefined), s.sections[i + 1]?.shape, s.input, s, o);
    let next = again(out);
    if (next && !fits(structureOf(next))) next = again((y) => out(y) || !fits(structureOf(y)) || histHas(hist[0], 'sections', y.id));
    if (next && fits(structureOf(next))) s.sections[i] = next;
  }
}
// The sections that pin and are built (a scene does not carry them), with the screens each holds, for the sheet.
function pinnedSections(s) { return s.sections.filter((x) => x.blueprint && !carriedBy(s, x) && !(s.replay && x.role === s.replay.carries) && !(x.role === 'cta' && ctaByFooter(s)) && pinHold(x)); }
function dealReferences(dir, input) {
  const named = (dir.seenIn || []).map((n) => L.sites.find((s) => s.id === n || s.name === n)).filter(Boolean);
  // the October 2026 panel scored on a lower scale (its top band starts at 7.5, the first panel's at about 7.6)
  const good = (s, a, b) => s.score >= (s.panel === '2026-10' ? b : a);
  const sameKind = L.sites.filter((s) => s.kind === input.sector && good(s, 7.2, 7.3) && !named.includes(s));
  const out = [...shuffle(named).slice(0, 2), ...shuffle(sameKind).slice(0, 1)];
  return out.length ? out : shuffle(L.sites.filter((s) => good(s, 7.6, 7.5))).slice(0, 2);
}

// ---------- rendering ----------
function siteCard(s, full) {
  // on the sheet only the idea: the details of another site's look are what builders copied literally
  const lines = [`- **${s.name}** (${s.source}, studied score ${s.score}) \`${s.id}\``, `  Idea: ${s.idea}`];
  if (full) {
    lines.push(`  Hero: ${s.hero}`, `  Type: ${s.type}`, `  Colour: ${s.colour}`, `  Imagery: ${s.imagery}`, `  Layout: ${s.layout}`);
    if (s.media) lines.push(`  Pictures and footage: ${s.media}`);
    if (s.motion) lines.push(`  Motion: ${s.motion}`);
    for (const sec of s.sections || []) lines.push(`  Section (${sec.role}): ${sec.description}`);
    for (const t of s.steal || []) lines.push(`  Worth taking: ${t}`);
    lines.push(`  URL: ${s.url}`);
  }
  return lines.join('\n');
}
// The dealt entrance, printed under the signature move: what it is, the markup, where its CSS lives, the rule below the fold.
function entranceBlock(e, s, p) {
  const mode = e.mode || 'photo';
  p();
  p(`### Entrance — ${e.name} (\`${e.id}\`), dealt`);
  p(e.id === 'set-type'
    ? 'This is the masked line rise with the clip-path shutter: once every page\'s default, now one entrance of seven and rarely dealt. Build it as base.css has it.'
    : 'It replaces the old default (headline lines rising out of masks, a clip-path shutter on the picture): build this one and neither of those.');
  p(`- **What the visitor sees:** ${e.sees}${e.byImagery?.[mode] ? ' ' + e.byImagery[mode] : ''} Settled by ${e.settled}.`);
  const parts = mode === 'type-only'
    ? '`data-e="headline"`, `data-e="lead"` and `data-e="action"` (no picture on this first screen)'
    : '`data-e="headline"`, `data-e="lead"`, `data-e="action"` and `data-e="picture"` (on the element that already crops the picture, with `--picture-ground` sampled from the picture; the img, video, picture or `[data-ui]` is its first child)';
  // what the script already knows is decided here, not left to the builder
  const serious = s.input.tone ? ['editorial', 'technical'].includes(s.input.tone) : !(s.direction.tones || []).some((t) => ['bold', 'playful'].includes(t));
  const decided = [
    e.id === 'line-blocks' && (serious ? 'The blocks are the ink: put `--block: var(--ink)` on the body.' : 'The blocks are the accent (the default `--block`).'),
    e.id === 'exposure' && isDark(s.palette) && 'This page is dark, so the photograph comes up from dim: put `--exposure-from: brightness(0.35) saturate(0.5)` on the body.',
  ].filter(Boolean).join(' ');
  p(`- **Markup:** \`<body data-entrance="${e.id}">\`; the first screen is \`[data-hero]\`, its parts ${parts}.${e.markup ? ' ' + e.markup : ''}${decided ? ' ' + decided : ''}`);
  if (mode === 'photo') p('- **The hero picture:** paste the snippet from motion.md, "The hero picture", in a `<script>` right after the hero, so a photograph that has not arrived waits on its ground instead of the entrance playing over an empty frame.');
  if ((s.scenes || []).some((x) => x.carries === 'hero')) p('- **A scene carries the first screen:** mark its headline, sentence and action only; its picture moves with the scene.');
  p(`- **CSS:** already in \`<skill>/assets/base.css\` (the \`${e.id}\` block under "the entrance"); write none of your own. It needs \`<script>document.documentElement.classList.add('js')</script>\` in the head and base.js at the end of the body. To watch it run: \`<skill>/assets/entrances/demo.html?e=${e.id}\`.`);
  const rule = e.below.rule;
  p(`- **Below the fold: ${e.below.label}.** ${rule}${/data-reveal/.test(rule) && /nothing else|nothing enters|stray/i.test(rule) ? '' : ' No other block gets `data-reveal`: no fade-up on every block.'}`);
}
// The small moves dealt from the study (dealMoves), printed after the entrance: each in full, with where it goes.
function movesBlock(s, p) {
  p();
  p(`### Small moves — ${['', 'one', 'two', 'three'][s.moves.length] || s.moves.length}, dealt from the design-anatomy study`);
  p(`A good page has more than one kind of motion. Beyond ${s.replay ? 'the product replay' : s.motion?.id === 'stillness' ? 'the stillness above' : 'the signature move'} and the entrance, build ${s.moves.length > 1 ? 'each of these once' : 'this once'}, where its line says, on native scroll or under the hand, with transform and opacity, and a reduced-motion fallback that keeps the content where it rests. None makes anything enter below the fold (the entrance's rule stands), none pins, and none replaces feedback on the controls. Each description is the spec: set it in this page's own content, type and colour (its fills take \`--surface\`, the ink or the accent, never tints of their own: section 4). A move written as rows, tiles or a list of its own goes on a section of this page already built that way, in its structure and with its pictures; where there is none, leave the move out and say so in the report.`);
  // (round 11c's sheets: a move that names a hold asked for a held hero beside "none pins", and one on the hero's headline
  // ran into the entrance's)
  const held = (m) => (/\bheld\b|\bsticky\b/i.test(m.description) ? ' Nothing of it pins: where it names a hold or a sticky layer, it runs over the same plain scroll.' : '');
  const onHero = (m) => (/\bhero (?:headline|heading|title)\b/i.test(m.description) ? ' On the hero\'s headline it runs on scroll only, once the entrance has set the headline in place.' : '');
  for (const m of s.moves) p(`- **${m.name}** (\`${m.id}\`): ${m.description}${m.phone ? ` On a phone: ${m.phone}` : ''}${held(m)}${onHero(m)} ${MOVE_WHERE[m.kind] || 'Once, where it carries something; still for reduced motion.'}`);
}
// The dealt product replay, printed as the signature move of a software page.
function replayBlock(r, s, p) {
  p(`**The product replay: ${r.name}, in the ${r.carries} section.** This is the page's big moment: the product's own window, large, acts out what the product does for the visitor, a beat at a time, while its section holds and the visitor's scroll steps the beats. ${r.sees}`);
  p(`- **Beats:** ${r.beats}. Three to five, each changing about a third of the window (a beat that changes under about 15% of it is faint), with real labels and figures that add up (a count is right at every beat); the decisive one, the result, is large and in the accent. A panel, menu or comment that opens is in the page's own tokens (the ink of a light page, the accent of a dark one: the one place the accent grounds text, since the panel is the decisive change), never a second white ground on a dark page, and covers whole rows or a whole column, never half a row (round 9: a white preview over half a dark list read as a second page). ${r.action === 'agent' ? 'The agent acts: its status line names what it does to the rows in view, and the rows it works on take the accent fill.' : r.action === 'zoom' ? 'The view moves in on a whole column or block at each stop (data-zoom-at, never a single row, so the crop falls in a gap), the value there changes as its row takes the accent, and the last beat moves back out.' : r.action === 'names' ? 'Each person changes one whole block in turn; the block takes the accent fill and carries their name inside it, and a comment opens on the ink and closes as its change lands.' : r.action === 'move' ? 'The item at work takes the accent fill (data-focus-at) and travels at full size from column to column (data-flip-at) while the items round it make room; no panel opens.' : 'The item at work takes the accent fill (data-focus-at) and the panel that does the work opens over whole rows or a whole column (data-open-at).'} No drawn cursor: the change itself shows the action (\`replay-cursor\`).`);
  p('- **Size and hold:** the heading (the promise), the window, one sentence and a Replay button stand in one stage, the last thing in its section: `<section class="replay-hold"><div class="replay-stage">`. The window 70% of the width or more on desktop and 40% of the screen\'s height, nearly the full width on a phone; its content fills 70% of it or more in every frame (no empty corner or band inside it: fill its columns to the same depth, or crop the window to its content); its text 18px or more (16px on a phone). replay.js centres the held stage, so the stage is 75% of the screen\'s height or more (about 680px at 1440 by 900). On a tablet and a phone the heading and the window fit the screen under the bar together (fewer rows and columns); replay.js holds the stage below a bar fixed at the top and a taller stage from its heading, so the promise stays in view (`held-heading-cut`). It holds the stage about half a screen of scroll per beat; scrolling back steps back; Replay plays the beats once in place.');
  p('- **The first state is a full window:** before beat 1 the visitor scrolls the window in and sees its first state for about a screen, so it is the visitor\'s own work before the task: the rows, figures and labels already there, at full size. Beats change it or add to it; they never fill an empty one. Never empty table headers, a count of 0 or a blank list waiting for its rows (round 8: the judge scrolled past an empty box). Mark only what the task adds or changes with `data-at`; a window that shows under half its words at beat 0 is started by replay.js on the first beat that fills it, and the changes up to that beat never play.');
  p('- **The still:** the HTML is the final state, every pane filled. Reduced motion and no script see it, and nothing is held.');
  p('- **Never** a video, a GIF or screenshots in sequence, never a device frame or browser dots.');
  p(`- **Not with the entrance:** this fragment carries \`data-replay\` and no \`data-e\`, \`data-reveal\` or \`data-moment\`; the hero's fragment is the entrance's.${s.entrance?.id === 'product-at-work' ? ' The dealt entrance animates the hero\'s fragment; the replay is a second fragment further down.' : ''}`);
  p(`- **Build it** with \`<skill>/assets/replay.js\` (references/motion.md, "Product replay"); a working example of all six patterns: \`<skill>/assets/replay-demo.html\`. On a phone: ${r.phone || 'one panel of it, the same beats.'}`);
  p('Around it the page still needs the rest of the motion layer (SKILL.md step 9): the entrance below and feedback on every control. The inspector fails a page without the replay the sheet deals (`replay-missing`), a window too small (`replay-small`), a stage that is not held (`replay-not-held`), a beat that never shows in the scroll film (`replay-unseen`), most beats faint (`replay-faint`; one faint beat, or a largest beat under 30% of the window, warns), empty bands round the held stage (`replay-bands`), type under 14px in the window (`replay-type`), a held heading cut off above the screen or under the bar on a tablet or phone (`held-heading-cut`) and a drawn cursor (`replay-cursor`).');
}
// A dealt technique in sheet section 9: printed like a scene, but marked as one to build fresh, with the direction to
// take, what breaks it, its hold and phone, how to build it on the stage and the way out.
function techniqueBlock(sc, s, p) {
  const what = sc.carries === 'hero' ? 'the first screen' : `the ${sc.carries} section`;
  p(`### ${sc.name} (\`${sc.id}\`) — a technique to build fresh, ${sc.position === 'transition' ? `the hand-over into ${what}` : `carries ${what}`}`);
  p(`Not a tested scene: a technique from the research library (\`<skill>/library/techniques.json\`), dealt so pages stop reusing the same few big moments. It has no files and no demo: you build it, and it is checked like any scene. ${sc.principle}`);
  // what broke the dealt techniques of round 8 comes first: r8-p40's card hand (lib-0109) was one strip on an empty
  // screen, then a fan that hid three of its four texts, each text 900px from its title; r8-p39's line (lib-0240)
  // stranded its words with wide gaps between them and ended on the line alone on flat colour
  p(`- **Avoid, first of all, what breaks it:** ${sc.breaksWhen}`);
  p('- **Every frame of the hold is a finished, readable composition,** not only the last: never one strip, card or word alone on an empty screen while the rest waits; never a fan, stack or overlap that hides the texts a visitor needs (a covered card shows only what still reads, or nothing); every text beside its own title, never a screen away from it; every word whole and in its place or clearly on its way to it, never stranded with wide gaps between words; no word split into flying letters, no title sliced by a mask, nothing that looks broken halfway (scenes.mjs warns letters turned or off their line at a settled step, `tilted-letters`, and a picture or filled box cut to a sliver by the screen edge mid-hold, `edge-sliver`). **A hold that steps** (statements or pictures in turn): where its steps carry pictures, each step its own picture, never one photograph held under every step; where it needs none (see Needs below), the statements stand on the ground alone, with no photograph added; statements as short headlines at display size (40px or more on desktop, two lines at most, marked up as h2 or h3: the 36px statement rule is for paragraphs), never 30px lines beside a picture; no frame between two steps near empty; and without the pin (reduced motion, tablet, phone) no picture repeats: with one picture, show it once and set the steps beside it (`repeated-picture`). Check the 10% frames of the scenes.mjs sheets one by one: a frame you would not ship as a still is unfinished.');
  p(`- **The direction to take:** ${sc.freshTake} That was written for another client: keep the principle and the manner, and take the subject, the pictures and the words from this page.`);
  const why = sc.hold < sc.defaultHold ? ` (the research held it for ${sc.defaultHold}; ${sc.position === 'closing' ? 'a closing scene holds about one screen' : `on this page a scene holds ${sc.hold} at most`})` : !sc.researchHold ? ' (the research ran it without a pin; on the stage it holds one screen)' : '';
  p(`- **Hold:** ${sc.hold} screen${sc.hold === 1 ? '' : 's'} of scroll${why}: \`hold: ${sc.hold}\` in \`Stage.scene\`, its section ${sc.hold + 1} screens tall, each beat about half a screen and something new on screen in every one.`);
  if (sc.trigger === 'scroll-enter') p('- **On the scroll, not on a clock:** in the research it plays once on entry; here spread its timings over the hold so it moves under the scroll, never on a clock inside a held screen.');
  p(`- **Needs:** ${sceneNeedsWords(sc)}.`);
  p(`- **On a phone:** ${sc.phone === 'same' ? "the same move at phone size (`phone: 'same'`)." : "its own version, as the direction above says (`phone: { hold, build }` in `Stage.scene`), or `phone: 'rest'` with a finished composition that reads whole; never the desktop move squeezed."} Below 600px a list laid over a picture drops into the flow under it, and nothing a visitor reads is clipped by the stage (\`clipped-text\`). Check it at phone width like the desktop.`);
  if (s.replay && sc.needs.includes('product-ui')) p("- **Beside the product replay:** the replay keeps the page's one framed window and its task. Build this one from the product's own interface on the page's own ground, cropped, with no window frame, and let it show something the replay does not.");
  p(`- **Build it on the shared stage** as references/scenes.md §8 shows: a file of your own that registers \`Scenes['<a short id>'] = (root, opts = {}) => Stage.scene(root, { hold: opts.hold ?? ${sc.hold}, build(tl, { q, phone }) { … } })\`, the markup \`<section class="scene" data-scene="<that id>">\` holding one \`.scene-stage\`, and its CSS written as the finished composition first, the live layout under \`.scene.is-live\`. Build it with transforms, clip-path and CSS 3D on the stage's pinned GSAP; where the direction mentions WebGL or a 3D library, take its CSS 3D route. Never copy any site: no layout, picture, word or colour from wherever this was seen; set it in this page's own type, colour, pictures and words. Every rule of references/scenes.md §7 holds (native scroll, readable at rest, no drawn shapes, tracks or particles, no dead frames). Check it with \`node <skill>/scripts/scenes.mjs <page>\` like any scene and look at every sheet.`);
  p(`- **If it cannot be built honestly** within the usual three look-and-fix rounds, take \`--redraw scenes\` and say why in your report; it counts toward the same limit of two scene redraws, and the redraw deals ${fewPictures(s.input) ? 'another scene or technique that needs no photograph or one' : 'tested scenes'}.`);
}
function render(s) {
  const d = s.direction; const o = [];
  const p = (x = '') => o.push(x);
  p(`# DIRECTION SHEET — ${d.name}`);
  p(`seed ${s.seed} · drawn ${s.at.slice(0, 10)}${s.redraws ? ` · redraws: ${s.redraws}` : ''}${s.sceneRedraws ? ` (scenes ${Math.min(s.sceneRedraws, 2)} of 2)` : ''} · sector ${s.input.sector}${s.input.tone ? ' · tone ' + s.input.tone : ''}`);
  if (s.input.brief) p(`Brief: ${s.input.brief}`);
  p();
  p('| | |'); p('| --- | --- |');
  p(`| Direction | ${d.name} |`);
  p(`| Hero | ${s.hero.name} |`);
  p(`| Type | ${s.type ? s.type.name : 'kept from the brand'} |`);
  p(`| Colour | ${s.palette ? s.palette.name : 'kept from the brand'} |`);
  const ctaFooter = ctaByFooter(s);
  p(`| Sections | ${s.sections.map((x) => x.role + (s.replay && x.role === s.replay.carries ? ' (the product replay)' : x.role === 'footer' && s.frame ? ' (as section 0)' : x.role === 'cta' && ctaFooter ? ' (the footer\'s closing line)' : carriedBy(s, x) ? ` (the scene ${carriedBy(s, x).name})` : x.name && x.name !== x.role ? ' (' + x.name + ')' : '')).join(' → ')} |`);
  p(`| Motion | ${s.replay ? `the product replay: ${s.replay.name}, in the ${s.replay.carries} section` : s.motion ? s.motion.name : '—'} |`);
  if (s.entrance) p(`| Entrance | ${s.entrance.name} |`);
  if (s.moves?.length) p(`| Small moves | ${s.moves.map((m) => m.name).join(' · ')} |`);
  p(`| Photographs | ${s.photos?.trade ? `${s.photos.photos.length} matched to this trade` : s.photos ? 'the "' + (s.photos.title || s.photos.set) + '" set, as atmosphere' : 'none'} |`);
  if (s.frame) {
    const f = s.frame;
    p(`| Navigation · footer | ${f.nav.id} · ${f.footer.id} |`);
    if (f.cards) p(`| Cards · buttons | ${f.cards.id} · ${f.buttons.id} |`);
    p(`| Corners · spacing · pictures | ${f.corners.id} · ${f.spacing.id} · ${f.treatment.id} |`);
    p(`| Interactive piece · video | ${f.interaction.id} · ${f.clip.id} |`);
  }
  p();
  if (s.frame) {
    const f = s.frame;
    p('## 0. The frame (dealt; these replace whatever a blueprint below says about them)');
    p(`Pages built by models came out alike in exactly these parts: three button shapes, one plain bar, a one-line footer, text floating with nothing grouping it. Each part below is one of about twelve tested designs${['nav', 'footer', 'card', 'button'].some((k) => PATTERNS[k].length) ? ' or one of the patterns of the design-anatomy study (great sites read part by part)' : ''}, dealt away from the last pages built; build it as written, at the sizes given. Its **Must show** line is what the built part is checked against: a part that does not show it is not built as dealt.${[f.nav, f.footer, f.cards, f.buttons].some((x) => x?.pattern) ? ' A part marked as a pattern is described as the study saw it: its description is your spec, built with this page\'s own content, in the dealt type, colour and corners (where it names a colour, a face, a radius or a size the dealt system lacks, the dealt system wins), within the rules printed after it.' : ''}${[f.nav, f.footer, f.cards, f.buttons, s.hero, ...(s.sections || [])].some((x) => x?.pattern) || s.moves?.length || s.typeNote ? ' A pattern\'s id (in code type, here and below) is only its handle for redraws: where the id names something its description leaves out (capitals, an outline, glass, mono, a nested card), the description wins; and where a description makes its content arrive (on load, or as it comes into view: it rises, fades, slides or wipes in), section 8\'s entrance decides instead, on the first screen and below the fold.' : ''}`);
    const label = (x) => `\`${x.id}\`${x.pattern ? `, ${x.name}: a pattern of the study` : ''}`;
    // (each part ends on what it must show once built: the builder's acceptance line, round 11c)
    const must = (x) => (x?.signature ? ` **Must show:** ${x.signature}` : '');
    // (a navigation whose bar holds only Menu keeps the sections in its Menu panel)
    p(`- **Navigation (${label(f.nav)}):** ${f.nav.text} ${FRAME_RULES.nav} ${menuOnly(f.nav.id, f.nav.pattern ? PATTERNS.nav.find((e) => e.id === f.nav.id) : null) ? 'The real sections as the links of the Menu panel, and the one action.' : 'The real sections as links and the one action.'}${must(f.nav)}`);
    const visit = visitNote(s, f.footer.text);
    p(`- **Footer (${label(f.footer)}):** ${f.footer.text}${visit ? ` ${visit}` : ''} ${FRAME_RULES.footer}${f.footer.pattern && f.footer.closes ? ` It opens on the page's closing line${says(f.footer.text, /\bbutton\b/i) ? ' and its button' : ', with the dealt button under it'}: that is the call to action, and the page closes there once.` : ''}${f.footer.closes ? ` ${FRAME_RULES.closingFooter}` : ''}${must(f.footer)}`);
    if (f.cards) p(`- **Cards (${label(f.cards)}):** ${f.cards.text} ${FRAME_RULES.cards}${s.imagery === 'interface' ? ' On this software page a card\'s picture is a crop of the product\'s interface running to the card\'s edges with no frame of its own: a window inside a card is a box in a box.' : ''}${must(f.cards)}`);
    if (f.buttons) p(`- **Buttons (${label(f.buttons)}):** ${f.buttons.text} ${FRAME_RULES.buttons}${must(f.buttons)}`);
    p(`- **Corners:** ${f.corners.text} (\`--radius: ${f.corners.radius}\`${f.corners.button ? `, buttons \`${f.corners.button === 'square' ? '0' : f.corners.button}\`` : '; buttons as dealt above'}).`);
    p(`- **Space:** ${f.spacing.text}${f.spacing.gap ? ` In CSS: \`--section-gap: ${f.spacing.gap}; --margin: ${f.spacing.marginCss};\`, the gap set as \`padding-block: calc(var(--section-gap) / 2)\` on every section after the hero and as \`padding-bottom\` of the same half under the hero's last content, so it is the same on one ground or across two (references/layout.md §2).` : ''} **The first screen is the hero alone:** \`min-height: 100svh\` at every width with the navigation inside it, and nothing of the next section (its heading, text, picture or ground) in view at 1440 by 900 or 390 by 844 (\`hero-not-alone\`). The space between sections counts from the last content of one to the first content of the next, and a change of ground never shortens it (\`section-air\`). **Nothing runs into one screen edge:** whatever is not full-bleed keeps the page margin on both sides at rest; a product window that ran into the right edge while the left margin held failed a notes page (\`edge-run\`).`);
    p(`- **Pictures:** ${f.treatment.text}${f.treatment.id === 'mono' ? '' : ' Never greyed: no grayscale filter, and no stand-in whose file is black-and-white (the client\'s own pictures as they are).'}`);
    p(`- **Interactive piece:** ${f.interaction.text}`);
    p(`- **Video:** ${f.clip.text}`);
    p();
  }
  p('This is the direction for this build. Adopt it. Do not blend it with the layout you would have made anyway,');
  p('and do not redraw because it is unfamiliar: unfamiliar is the point. Redraw a slot only when it conflicts');
  p('with a stated brand constraint or needs an asset that does not exist, and say why in your report.');
  p();
  p('The parts of this sheet were written separately and will disagree in small ways. Settle every disagreement in this order:');
  p('**house rules** (including type no smaller than 13px, and running, list and table text of 16px or more) → **the direction** (the idea, the composition habits, where the');
  p('one accent goes) → **the frame, the type system and the palette** (sections 0, 3 and 4: they win over any colour, face, size, corner, spacing,');
  p('navigation, footer, card or button a direction or blueprint names) → **the hero blueprint** → **the section blueprints**. Under each blueprint, "Adjusted for this page" lists where it disagrees.');
  p('The hero\'s geometry is binding (section 6): on the first screen it outranks the direction\'s composition, never the house rules, the frame, the type system\'s faces and weights or the palette. On the first screen one more order holds: **the hero\'s geometry and its display size > the type steps** (the `h1` at `--step-hero` where section 3 prints it; every other size there keeps its step). Section blueprints are examples of a shape, not drawings to trace: keep the idea of the shape (what is large, what sits beside what) and let the real');
  p('content decide the details. Map every size onto the six type steps. One button shape, one corner radius and one pair of page margins on the');
  p('whole page. If a direction or blueprint asks for a loud colour, a heavy face or a giant size the dealt system does not have, the dealt system wins (the hero\'s display size excepted, as above).');
  p();
  p('## 1. The idea'); p(d.idea); p();
  p('Before anything else, write one sentence in your notes: "On this page, <the subject\'s own material> becomes <the device>."');
  p('Fill the first blank from your inventory of what only this client has (its name and what it means, its street, its numbers, its');
  p('constraint), then put the nearest competitor in the sentence: if it still works, the idea is the category\'s, not the client\'s.');
  p('If section 0 deals an interactive piece, decide now what it is, from the subject (SKILL.md step 4).'); p();
  p('## 2. Composition'); p(d.composition); p();
  if (s.type) {
    const t = s.type;
    p(`## 3. Type — ${t.name}`); p(t.note);
    p('```html'); for (const l of [...new Set([t.display.css, t.text.css].filter(Boolean))]) p(l); p('```');
    p(`- Display: **${t.display.family}** — ${t.display.settings}`);
    p(`- Text: **${t.text.family}** — ${t.text.settings}`);
    // a split hero takes a large headline (r7-p34: 48px beside a half-screen picture read as a shop template): the display
    // step is raised to reach 72px (5vw) at 1440 when the type system's own falls short
    const disp = t.scale?.['step-display']; const at = stepAt(disp, 1440); const raise = s.hero?.split && at !== null && at < 72 ? splitDisplay(disp) : null;
    // (and the hero's own size where its blueprint sets the headline well above the step: heroStep)
    const hero = t.scale ? heroStep(s) : null;
    if (t.scale) { p('```css'); p(':root {'); for (const [k, v] of Object.entries(t.scale)) p(`  --${k}: ${k === 'step-display' && raise ? raise : v};`); if (hero) p(`  --step-hero: ${hero.css};`); p('}'); p('```'); }
    if (raise) p(`\`--step-display\` is raised above for this page's split hero (section 6): it reaches ${Math.round(stepAt(raise, 1440))}px at 1440, where the type system's own stops at ${Math.round(at)}px. The other steps stand.`);
    if (hero) p(`\`--step-hero\` is the hero headline's own size (section 6): ${hero.lower ? `beside the product's window it is about ${hero.asked}px at 1440, where \`--step-display\` reaches ${hero.at}px, so two lines fit beside the window and the two do not crowd each other` : `its blueprint sets it at about ${hero.asked}px at 1440, where \`--step-display\` stops at ${hero.at}px`}${hero.asked > hero.px ? `; it is held to ${hero.px}px by a 900px screen (${hero.tall}svh) so ${hero.tall > 34 ? 'its line fits' : 'two lines fit'} under the bar` : ''}. The first screen's \`h1\` takes it and nothing else does: in the dealt display face and weight, two lines at most, every word whole between the margins (where the longest line would not fit, the size comes down until it does).`);
    if (d.typography) p(d.typography);
    p('The direction decides sizes and how many of them; the type system decides how this face is set. Where the two give different tracking or leading, use the values of the type system: they are tuned to this face.');
    p(`These six steps are the whole scale. Map every size a blueprint names onto the nearest step; the hero headline takes ${hero ? '`--step-hero`, the one size beside them' : '`--step-display`, whatever size the hero blueprint gives'}.`);
    // a type pattern of the same kind as the dealt pairing (dealTypeNote): how a great site of that kind set it
    if (s.typeNote) p(`**Type note (\`${s.typeNote.id}\`, ${s.typeNote.name}): how a site of the study set type of this kind.** ${s.typeNote.description} Take from it how the steps relate (how far they jump, where the big jump falls, which steps carry the page), and its leading, tracking and case where the type system above allows them. The faces, weights and six steps dealt above stand: map its sizes onto the steps, nothing under 13px, running text 16px or more, and no face it names in place of the dealt ones.`);
    p();
  } else { p('## 3. Type'); p('Kept from the brand. ' + (d.typography || '')); p(); }
  if (s.palette) {
    const c = s.palette;
    p(`## 4. Colour — ${c.name}`); p('```css'); p(':root {');
    for (const k of ['bg', 'surface', 'ink', 'muted', 'accent', 'accentInk']) if (c[k]) p(`  --${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${c[k]};`);
    (c.fields || []).forEach((f, i) => p(`  --field-${i + 1}: ${f.bg};${f.ink ? `  --field-${i + 1}-ink: ${f.ink};` : ''}`));
    p('}'); p('```'); p(c.note); if (d.colour) p(d.colour); p(colourWords(s));
    // one ground and one surface tone (r11-p51: seven grounds and panels on one page)
    const bands = (c.fields || []).map((f, i) => `\`--field-${i + 1}\``);
    // (the ink where section 0 deals it: ink cards, cards in turn on the surface and the ink, an ink bar or footer)
    p(`**Two grounds, no more:** every section stands on \`--bg\`; cards, panels and form fields take \`--surface\`, or the ink where section 0 deals ink cards or an ink bar; the footer takes the ground section 0 gives it (\`--surface\`, the ink or \`--bg\`)${bands.length ? `; ${bands.length > 1 ? `each of ${bands.join(', ')}` : bands[0]} grounds one section at most, as a band` : ''}. No other ground or panel colour on the page: no tint between them, no colour per section or per card, no new tone for an overlap, and no card or panel filled with the accent (a pattern above that fills one takes \`--surface\` or the ink; the accent marks the action). Where the note or the direction above names more grounds, these tokens win (\`surface-count\`).`);
    p();
  } else { p('## 4. Colour'); p('Kept from the brand. ' + (d.colour || '')); p(); }
  p('## 5. Imagery');
  // where to look for real pictures of the subject's world, with first queries built from the brief
  const qs = assetQueries(s.input);
  const find = qs.length
    ? `\`${ASSETS_CMD} "${qs[0]}"\`${qs.length > 1 ? `, then ${qs.slice(1).map((q) => `"${q}"`).join(' and ')}` : ''}, then queries from your inventory (its place, its materials, its use and its details; never the client\'s own thing: the hard rule below)`
    : `\`${ASSETS_CMD} "<a place, material or use from your inventory>"\``;
  const SOURCES = 'Fewer photographs, chosen better: no more of the subject and its world than the photograph total below allows (the rooms, dishes or products a page pictures are their own set, one photograph each beside its facts), each one modern, well lit and professional-looking (the quality of a good Unsplash or Pexels photograph)' + (s.imagery === 'no-product-photo' ? ', never none: a product page shows its use, its load and its place (below)' : ', or none at all, with the product, the type, the colour and the interface carrying the page') + '. **Never documentary or archive photographs:** no old Commons or museum pictures, no history photographs, postcards, old maps or engravings, no news-like or snapshot-looking shots; they made recent pages look serious, old and cheap, and the owner named them first. Order of sources: (1) the project\'s own pictures; (2) pictures you generate, if you have an image tool (the best way to show this exact subject); (3) the dealt photographs below and the rest of the library (`node <skill>/scripts/draw.mjs --photos <words>`): sharp, modern and free of credits; (4) only for what the library lacks (a detail of a room, a dish, the product\'s use and load), photographs from the open collections (' + find + '), only sharp modern photographs at 1800px or more, never from the museum sources, each looked at full size first and cropped or dropped if it shows another maker\'s name or logo, a shop or company sign, a readable house number or licence plate, words that would embarrass the client, or a child who could be recognised (references/imagery.md §2), never retouched or blurred instead (no blurred or pixelated face: take shots with faces turned away, out of frame or naturally out of focus, or frame the load and the place), never one whose title or credit names another business (a real hotel\'s room) shown as the client\'s own, and every one credited in the Image credits dialog (`--credits` prints it), never in the footer. **When the search fails** (the script retries, and searches Wikimedia Commons when Openverse fails or finds nothing), take the dealt photographs and the library; where none fits, the slot goes to type or to its marked frame (the hard rule below), never to a museum or archive source, and the report names the searches that failed; (5) type and space: never a drawing in place of a picture (inline SVG only for the logo and small icons, and a chart only inside a product fragment, `data-ui`; a drawn diagram, chart or illustration on the page fails, labels or not, so say a process in words: `drawn-illustration`). Logos of known products the page names (Gmail, Figma, Slack, Chrome, ChatGPT, Claude) are the real marks, never drawn: `' + ASSETS_CMD + ' --logo gmail,figma` saves them from Simple Icons at a pinned version, and a brand missing there comes from its own press kit, unchanged; never an initial in a circle in its place. A picture that carries its own lettering (a title card, a sign, a label, a poster) is cropped so the lettering stays whole or leaves the frame entirely, at every width: a portfolio cut its own work titles to "Pelik" and "ZUIDKAI".';
  const MODE = {
    interface: '**This subject is software and there are no screenshots, so its pictures are its own interface.** Wherever this sheet says photograph, image or object, build a believable fragment of the product in HTML at real size (real labels, numbers that add up, one item hovered or selected) by the app-screen rules (references/app-screens.md: deal its style once with `node <skill>/scripts/draw.mjs --app --kind <kind> --keep palette,type --out .taste-skill/app`, and build it with assets/app.css and assets/charts.js), put the attribute `data-ui` on its root, and crop or scale it the way the blueprint treats a photograph: a full-bleed close crop, a tile, the fixed half of a split. Where a fragment makes no sense, use a flat colour field with type on it. Never a fake dashboard of grey bars, never a device frame. **The interface sits in the page\'s own ground:** in the page\'s colours (the app style dealt with `--keep palette`), cropped inside the page margins or within its section, never run into one screen edge while the other keeps its margin (a notes app\'s window ran into the right edge: `edge-run`), with at most one framed window on the whole page (the replay\'s, when one is dealt). Never the template every model builds: a black ground with a white interface slab in every section. Never form controls as decoration: a switch, checkbox or slider appears only where it does what the product does, never as a row of greyed toggles, and a control in a fragment (a search box, a New note button) either works or reads as static (no pointer, hover or focus), never a field the visitor types into in vain. ' + (heroMode(s) !== 'type-only' && (heroShowsLarge(s.hero) || productBeside(s.hero)) ? 'The first screen shows the product large (at least half the screen\'s height, at the width its blueprint gives), in the picture slot the hero blueprint sets,' : `The first screen of this sheet is ${heroMode(s) === 'type-only' ? 'set in type' : 'one whose picture is small'} (a direction taken by choice; a dealt one never is), so the product comes large (at least half the screen) in the first section after it, before anything else,`) + ' at a size a visitor can read (labels 12px or more, its main text 14px or more; crop to fewer rows rather than shrink it). Further down, at least one more large picture that is not interface: a photograph or an object that carries the product\'s idea (for a notes app, a card catalogue), or a large figure. Never more than two sections in a row built from interface cards: a page of dark cards on a dark ground reads as one long screenshot. If the product works on something physical (ships, plants, buildings, a city), one real picture of that world can carry a section: find it with `' + ASSETS_CMD + ' "<that world>"`, download it with `--get`, credit it in the Image credits dialog, and never let it pass for the product or its customers.',
    'no-product-photo': '**There are no photographs of this product: its large picture is the designed frame of the hard rule under the photograph total,** at the product\'s real ratio, ' + (frameInHero(s) ? 'in the hero, about half the hero or more' : `about half the screen or more, in the ${frameSection(s)?.role || 'first'} section (section 7): ${heroMode(s) === 'type-only' || heroNoPicture(s.hero) ? 'the first screen dealt here is set in type' : heroSkyLed(s.hero) ? 'the first screen dealt here sets its subject small under open sky' : heroBleeds(s.hero) ? 'the first screen dealt here lays its picture behind the words, so it holds a photograph of the use or the place, never the frame under the headline' : 'the picture the first screen dealt here holds is too small for it'}`) + '. It is the slot for the client\'s product shot, named in the report. If you have an image tool, it may hold this product generated as the brief describes it, listed in the Image credits as made for this page (and in the report). Its photographs (the shopping in a crate, a child\'s helmet on a hook, the school street in the rain) show at least once who it is for (people from behind or far off, without the product). The page is never without them (a cargo-bike page with none read as undesigned): find them in the open collections (`' + ASSETS_CMD + ' "<its use, its load or its place>"`), sharp and of one light, each shown once and credited in the Image credits dialog. **The brief decides what the product is, never the photographs found:** its words and specifications stay as the brief gives them. A picture of what the name means (the bird the brand is named after) never stands in for the product. In your report, list the frame and every photograph, and say that the client\'s own product photography replaces the frame.',
    atmosphere: '**The project has no photographs of its own yet.** Plan the set before building: sharp pictures of one family, as many as the photograph total below allows (one light, one treatment) that show the subject\'s world, each shown once, the scenes\' pictures counted among them (a gallery or a wall of twelve is cut to six); a slot with no good picture left goes to type, never to the same picture at another crop. They show the world around the client and never pass for its people, its team or its customers. Where no honest picture exists, leave the slot to type and space; never a drawn illustration in its place (references/imagery.md §8). List every picture and its source in your report.',
    own: '**Use the images that belong to the project in every picture slot.** For slots they cannot fill, the dealt photographs or sharp photographs of the subject\'s world come next.',
  };
  p(MODE[s.imagery || 'atmosphere']); p();
  // what this trade's pictures show and must not show (photoTrade): r11-p51 showed a mixing desk for a motion designer
  // (a portfolio's are its own work, in the slots marked for it; a place is pictured where the client's world is a place,
  // never "Denmark as it is today" for a chair maker; landmarks are the subject of an architect's or an agent's page)
  if (s.imagery !== 'interface') {
    const t = photoTrade(s.input); const portfolio = PORTFOLIO.includes(s.input.sector);
    const where = briefPlace(s.input), place = !portfolio && !['physical-product', 'ecommerce'].includes(s.input.sector) && where && !String(s.input.brief || '').includes(`made in ${where}`) && where;
    // (without its own pictures, never its things and its work: those found are another's)
    const subject = briefSubject(s.input).join(' ') || 'subject';
    const show = `${t.show || (s.imagery === 'own' ? `the ${subject}'s own world: its things and its work` : s.imagery === 'no-product-photo' ? 'its use, its load and its place, with no product of its kind in them' :`the ${subject}'s world: its place, its materials and the details that belong to no one`)}${t.also.length ? `; its ${t.also.join(' and ')} too` : ''}`;
    p(`**What the pictures show for this brief:** ${portfolio ? `the client's own work${s.imagery === 'own' ? '' : ', in the slots marked for it (`data-slot="work"`)'}${t.show && s.imagery === 'own' ? `: ${t.show}` : ''}${s.imagery === 'own' ? '' : '; a slot still without the client\'s own picture holds the project\'s own still made for the page (section 7)'}, never another maker's piece or a photograph of someone else making or showing work` : show}${place ? `; and ${place} as it is today` : ''}. **Never:** ${t.not ? `${t.not}; ` : ''}another trade's tools or goods${['architecture', 'real-estate'].includes(s.input.sector) ? '' : '; a skyline, a bridge or a landmark the brief does not name'}. The look-and-fix drops a picture that does not show the client's own world, however good it is.`); p();
  }
  // Rooms, dishes and products are shown, not boxed: Hvit (r6-p30) set its five rooms as grey spec panels
  // N listed, N pictures: Hvit (r7-p35) listed four rooms and pictured one, with a blurred mug and a stock dining set
  // Without the client's own, a room is a detail that belongs to no one and a product its designed frame, never another
  // house's room or another maker's product (r12-p58 showed two named hotels' rooms as Hvit's: the hard rule, below)
  const SHOWN = {
    hospitality: ['room', 'Every room the page lists has its own picture, matched to its details', `a detail that belongs to no one (bed linen, window light, a chair, a cup, the view from a window) from the library or the open collections (\`${ASSETS_CMD} "bed linen window light"\`), in a frame with \`data-slot="room-photo"\`, never a whole room of another house`, 'a grey spec panel, a tab or a filled box', 'its facts (bed, size, view, rate)', 'the house', 'four rooms', 'list the kinds of room the house has, two or three, each with its picture'],
    restaurant: ['dish', 'Every dish the page features has its own photograph of that dish as served (the menu itself stays a list of names and prices)', `a real photograph of that dish as served, from the library (\`node <skill>/scripts/draw.mjs --photos interior-and-table\`) or the open collections (\`${ASSETS_CMD} "<the dish>"\`)`, 'a filled box or a coloured panel', 'its name and price', 'the restaurant', 'three dishes', 'feature the dishes you can show and leave the rest to the menu list'],
    ecommerce: ['product', 'Every product the page sells has its own picture', 'its designed frame (`data-slot="product-photo"`: its name and two or three facts, as the hard rule below says), never another maker\'s product', null, 'its name and price', null, 'six products', 'show the products you can picture and name the others in one plain line'],
  }[s.input.sector];
  if (SHOWN) {
    const [what, each, stand, box, facts, place, eg, fewer] = SHOWN;
    const whats = what === 'dish' ? 'dishes' : what + 's';
    const layout = what === 'dish' ? `${facts} sit beside or under the photograph, on the page's ground` : `each ${what} stands in two columns, its picture at 55% of the width or more beside one grouped block of ${facts}, on the page's ground; never a small picture centred in wide margins with the name at one edge and the price at the other (a guesthouse's four identical bands read as timid)`;
    p(`**Each ${what} is shown, not boxed: as many pictures as ${whats} listed.** ${each}: the client's own where they exist; otherwise ${stand}, all in one light, and the report lists each as a stand-in for the client's own. A section that lists ${eg} shows ${eg.replace(/ \w+$/, '')} pictures, one beside each, never one picture for the lot${what === 'dish' ? ' or a detail (a mug, a corner) in place of the dish' : ''}; with fewer good pictures, ${fewer}, rather than a ${what} without its picture. ${box ? `Never ${box} in place of the picture: ${layout}` : layout[0].toUpperCase() + layout.slice(1)}. ${place ? `A stand-in sits beside the ${what} it stands for, never as the first picture of ${place}, and one` : 'A stand-in'} whose title or credit names another business (a real hotel's room, another maker's product) is never shown as this one, marked as a placeholder or not: take one that names none.`);
    p();
  }
  p(SOURCES); p(); p(d.imagery);
  const cliche = clicheFor(s.input);
  p(); p(`**Pictures: fewer, better, larger (the inspector checks them).** No more pictures of the subject and its world than the photograph total below${SHOWN ? ` (the ${SHOWN[0] === 'dish' ? 'dishes' : SHOWN[0] + 's'} the page pictures are their own set, as above)` : ''}, scenes included, each requested at least 1.5 times the size it is shown (twice for the hero), all with the treatment dealt in section 0. Before placing one, look at it: if it is soft, random, or could belong to any site, leave the slot out instead.${cliche ? ` Not the category's stock shot (${cliche}) unless it is art-directed for this page; ${isSoftware(s.input) ? 'the product\'s own interface and the customer\'s world come first' : PORTFOLIO.includes(s.input.sector) ? 'the client\'s own work comes first, in its marked slots' : 'the client\'s own pictures come first, and without them its use, its load, its place and the details that belong to no one, never its own thing by another\'s'} (references/imagery.md §2).` : ''}` + ' No thumbnails inside sentences, no pictures inside headlines, no small pictures filling a gap, no caption under a picture unless it says something the visitor needs. Each photograph once on the page, never again as a crop (a scene\'s stamp of the picture it has just shown excepted); a picture under or beside a line shows what the line names; a photograph of a place that is not the client\'s own is captioned with what and where it is, as its source names it, never with a place the source does not name. SVG drawings do not count as pictures. Every file the page asks for exists: a `src`, a `srcset` crop or a CSS background that is not there fails (`missing-image`). Words on a photograph sit on its calm part, of one tone, at 1440, 768 and 390 alike, since the crop moves as the screen narrows (`text-on-photo`), with no gradient, fade or milky fog laid over it. Video only as section 0 deals it.');
  const first = searchFirst(s, qs);
  if (s.photos) {
    // (no place is dealt where the brief names the town of a trade marked town: photoTrade)
    const placed = s.photos.photos.some((ph) => ph.kind === 'place');
    p(); if (first) { p(first); p(); }
    p(s.imagery === 'interface' ? `Optional atmosphere, two at most, from the "${s.photos.title || s.photos.set}" set (${s.photos.note}). The page does not need them.` : s.photos.trade ? `Photographs dealt for this build from every set, matched to this trade by their descriptions: ${s.photos.trade.things ? `the ${s.photos.trade.name}${s.imagery === 'no-product-photo' ? '\'s use and load' : ''} first (the ones dealt least lately lead)${placed ? ', then its place' : ''}` : 'its place only'}. Look at each at full size before using it.` :`Photographs dealt for this build, from the "${s.photos.title || s.photos.set}" set (${s.photos.note}). They were matched to the brief by their descriptions: look at each at full size before using it.`);
    p('They are real photographs (Unsplash licence, no credit needed, served by picsum.photos) of places, light and texture: atmosphere,');
    p('never a stand-in for a person or an interface, and a room, dish or product only as this section says. List the ones you use in your report and in the Image credits dialog, so they can be traced and replaced.');
    const mono = s.frame?.treatment?.id === 'mono';
    const brightName = nameColours(s.input.brief).lean === 'light';
    if (s.photos.treatment) p(brightName && /dark|dim|brightness|scrim|overlay/i.test(s.photos.treatment) ? 'Treatment: bright and untouched, never darkened, dimmed or under a scrim: the client\'s name asks for light (section 4); text goes on a picture\'s calm pale part, or beside it.' : !mono && /gr[ae]yscale|black-and-white/i.test(s.photos.treatment) ? 'Treatment: every photograph in full colour, never greyscale.' : `Treatment: ${s.photos.treatment}`);
    else if (brightName) p('Treatment: bright and untouched, high-key, never darkened, dimmed or under a scrim (section 4).');
    // one treatment for every picture (references/imagery.md §6): a black-and-white file is listed only where section 0
    // deals the black-and-white treatment, so a page in colour never mixes the two (nor does --redraw photos)
    for (const ph of s.photos.photos.filter((x) => !x.mono || mono)) p(`- \`https://picsum.photos/id/${ph.id}/1600/1000\` — ${ph.alt} · ${ph.tone} tone · ${(ph.colours || []).join(', ')}${ph.mono ? ' · black-and-white' : ''}${ph.calm && ph.calm !== 'none' ? ` · calm area: ${ph.calm}` : ''} · native ${ph.ratio >= 1.15 ? 'landscape' : ph.ratio <= 0.87 ? 'portrait' : 'square'} · photo: ${ph.by}${clichePhoto(s.input, ph.alt) ? ' · **the stock shot named above: leave it out unless art-directed**' : ''}`);
    p('The last two path numbers are width and height: request the exact crop you render (`/1200/1500` for a 4:5 portrait, `/2400/1350` for a hero) and');
    // a page with no photographs of its product is not filled with whatever was dealt (Haulet's cargo bikes got a honey
    // dipper and a teapot), and none dealt shows a product of its kind (dealPhotos): these are its use, load and place
    // a listed trade with fewer than six photographs of its things in the library sends the builder to the open
    // collections first (searchFirst), so its pages do not all show the same three (rounds 11b and 11e)
    const tr = s.photos.trade;
    const howMany = s.imagery === 'interface' ? 'Use at most two.' : s.imagery === 'no-product-photo' ? 'None of these shows a product of this kind: use them for its use, its load and its place, and find more of those in the open collections, as above.'
      : PORTFOLIO.includes(s.input.sector) ? `Use ${tr || s.imagery !== 'own' ? 'one' : 'one or two'} at most, for the place or the light, never as a piece of the work: the work is the client's own, as above.`
      : tr?.thin ? 'These are the fallback, for the slots the search above cannot fill.'
      : 'Use no more of them than the photograph total below allows, not all eight.';
    p((mono ? 'add `?grayscale` for the black-and-white treatment the brief asks for. ' : 'keep them in colour, as shot; a black-and-white stand-in from anywhere else is left out too (references/imagery.md §6). ') + howMany + ' Always set `width`, `height`, `alt` and `loading="lazy"` (not on the hero image).');
    if (s.photos.others?.length) p(`Other sets that fit this brief: ${s.photos.others.join(', ')} — \`node draw.mjs --photos <set>\` prints one in full; \`--photos list\` shows all sets. Taking photographs from another set is your call and is not a redraw; keep them to one light and one treatment.`);
  } else if (d.photos === false) {
    p(); p('This direction does not lead with photographs: use the few pictures the content really needs, where the direction allows them.');
  } else if (s.imagery !== 'interface') {
    // (the search line says the library holds none itself: never the two as one paragraph)
    p(); p(first || (PORTFOLIO.includes(s.input.sector) ? 'No photograph in the library is dealt: the pictures are the client\'s own work, in the slots marked for it, and one of its place at most from the open collections.' : 'No photograph in the library shows this trade, so none is dealt: the pictures come from the project, an image tool or the open collections, as above.'));
  }
  p();
  photoTotalBlock(s, p); p(); p(ownThingRule(s)); p();
  const adjust = (bp) => { const n = adjustments(bp, s); if (n.length) { p(); p('Adjusted for this page:'); for (const x of n) p(`- ${x}`); } };
  p(`## 6. Hero — ${s.hero.name}${s.hero.pattern ? ` (\`${s.hero.id}\`, a pattern of the design-anatomy study)` : ''}`);
  if (s.hero.pattern) p('Described as the study saw it on a great site: build this composition with this page\'s own words and pictures, in the dealt type, colour and corners, its buttons section 0\'s; a backdrop it names that this page cannot honestly have (a 3D scene, footage) is a photograph of the subject or the product\'s own interface at the same size and place, or the ground itself.');
  p(s.hero.blueprint); p(); p(`On a phone: ${s.hero.mobile}`); if (s.hero.headline) p(`Headline: ${s.hero.headline}`);
  // (dealt through the history: every software hero had become a window of rows)
  if (s.heroSubstance) p(`**What the product shows here: ${s.heroSubstance.name}.** ${s.heroSubstance.text} It is the hero's picture, whatever the blueprint calls it: a photograph it names is this window (section 5 counts none for the hero). Never a list of rows; whether it moves is section 8's entrance.`);
  // (the hero's signature, a pattern's own or the library hero's: what the built first screen is checked against; on a
  // software page the one that names the product's window, and the window beside the headline)
  const heroMust = (s.heroSubstance && SOFTWARE_HERO_SIGNATURES[s.hero.id]) || s.hero.signature || HERO_SIGNATURES[s.hero.id];
  // (only where the dealt hero sets it so: the line once stood beside heroes that leave half the screen empty or set
  // the product below the words, round 11e)
  if (s.heroSubstance && productBeside(s.hero)) p(`**The product stands beside the headline, never under it** (a notes page with its product under the headline left the right half empty and read as generic): the \`h1\` at the size this section gives it, never set smaller to make room, on one side, and the window on the other where the blueprint puts it, level with the words and never starting below the headline's last line, so no half of the first screen is plain ground.`);
  if (heroMust) p(`**Must show:** ${heroMust}`);
  // r9-p44 was dealt the object on a plain ground and built the stack every model builds (the judge: any café)
  const sceneHero = (s.scenes || []).some((x) => x.carries === 'hero');
  p(`**Within the house rules and the adjustments under it, this geometry is binding:** what is large, where the words sit and how the picture is cut, in the dealt type and colour; where section 2 describes the first screen otherwise, this is it${sceneHero ? '. The scene in section 9 sets the first screen\'s picture and its motion; the words keep their places here' : ''}. **It fills the first screen alone** (\`min-height: 100svh\`, the navigation inside it): nothing of the next section shows under it at 1440 by 900 or on a phone, and a part of this blueprint that would run below the fold (a peek of the next section, a row continuing under the fold) is left out. **Its headline stands whole on the first screen:** the \`h1\` ${heroStep(s) ? 'at `--step-hero` (section 3)' : s.type ? 'at `--step-display` (section 3)' : 'at the brand\'s display size'}, its last line, descenders included, clear of the bottom edge by the page margin at 1440 by 900 and 390 by 844, at rest and through the entrance (\`hero-cut\`); a name the fold cuts reads as cut off. At most 30 words in it. Its largest type carries the page's own idea (the Headline above says how) or, for a name whose meaning the page is built on (Klee is clover), the name; never a bare category line with nothing of this client in it. **The headline never repeats the logo:** when the name is the headline, the bar shows no second wordmark on the first screen (the mark alone, or the wordmark arriving once the hero has scrolled away); otherwise the headline says something new and the name stays in the bar. One action appears once on this screen, the bar\'s included: never two buttons to the same place (two Directions buttons on one first screen; "Start free" in the bar and again under the headline). Never the template stack of a centred headline and a line under it over a photograph card with round corners or a row of two or three cards, with or without actions (\`template-hero\`). Its picture shows what the headline names${hasDoor(s.input) ? ': the place itself, never the village next door under "a white house on the fjord" (with no such picture, the first screen is set in type); and the first screen names the specific place the brief gives (the fjord, the village, the district), or when the brief names only a region, a real place in it chosen with the visit block and marked as sample copy in the report, never the region alone' : ''}.`);
  if (s.hero.split) p('**A split hero takes a large headline:** beside a picture that holds half the screen, the `h1` is 72px (5vw) or more at 1440, on two lines at most, so about 26-30 characters. If the words cannot be that large in their part, the picture goes full-bleed behind them instead; never a small headline in a 50/50 split, which reads as a shop template.');
  adjust(s.hero); p();
  p('## 7. Sections, in order');
  p('**Words: cut hard.** The first screen 30 words at most, its headline 12 at most; a section 60 words at most outside a list or a table; the whole page about 500 (the inspector warns over each and fails past one and a half times: \`wordy-hero\`, \`hero-words\`, \`wordy-section\`, \`wordy-page\`). Fewer, shorter sections: drop any that carries no claim, and merge two that say one thing. Award sites carry about 27 words a screen. Say each thing once, as a fact: one heading per idea, never a heading that restates the one above it or a label repeated over every step (`restated-heading`, `repeated-label`).');
  p('Each is one example of a shape for this section: keep what is large and what sits beside what, and let the real content decide the');
  p('details (sizes from the six steps, colours from section 4, corners from section 0). Re-order or drop a section when the argument of the');
  p('page needs it (see references/copy.md), never to fall back to a page of cards. A section a scene carries (section 9) is that scene.');
  // r9-p42 ran 50/50 picture-and-text blocks all the way down and hid its specs and loads behind tabs and an
  // accordion; r9-p41 printed a band of figures over one-word labels and two sign-up forms
  p('**The run of sections:** never two in a row with the same picture and text arrangement (picture left, text right twice running is one layout), and at least one that breaks the split grid: a full-bleed picture, a headline across the width, an 8/4 asymmetry (three splits in a row warn, `repeated-split`). The key content stands in the open (specs, loads, rooms, the menu); tabs and accordions only for secondary detail such as the questions. No stats band of big figures over one-word labels: a figure stands in the line that says what it counts (`stats-band` warns). One email form on the page (`duplicate-form` warns). **Cards where things belong together:** in two or three sections the group a visitor compares or reads as one (the plans, the rooms, the visit details, the features) stands in the card style section 0 deals, and no text floats loose where it belongs to a group; never a card inside a card or a window, never outlined boxes in a row, never a page of nothing but cards (`framed-elements`). A control drawn in a product fragment works or reads as static (`dead-control` warns), and every photograph that is not the client\'s own has its line in the Image credits (`uncredited-picture` warns).');
  if (PORTFOLIO.includes(s.input.sector)) { p(); p('**The work comes first.** A piece of the work at full size stands on the first or second screen: in the hero, or in the section right after it. No screens of city or stock photographs, no statement and no scene before it, and one photograph of the place on the whole page at most: a motion designer\'s page opened on four screens of Rotterdam before her work and read as stock. Each piece is cropped so its own lettering stays whole or leaves the frame.');
    // the work is pictures of the work (r11-p51 showed a motion designer's work only as type cards)
    p(`**The work is pictures of the work:** each piece is shown by a picture of it (a still, a frame, a spread, the object), large and at its own ratio, four to six pieces; never a small card of a name and a line in the picture's place (a motion designer's page showed her work only as such type cards), never a photograph of another trade standing in for it.${s.imagery === 'own' ? '' : ' The brief gives none of the client\'s own pictures, so each piece is a marked slot, its frame at the piece\'s size and ratio with `data-slot="work"`, holding the project\'s own still made for the page, as section 5\'s hard rule says. Never a photograph of someone else making or showing work (another artist\'s comic on a pen display passed as a motion designer\'s, r12-p57), never an empty or grey frame, and never a visible note that a picture is missing: the report lists every slot for the client\'s own pictures.'} A card style of section 0 that holds no picture is for the services or the contact, never the work.`);
  }
  const visitText = visitBlock(s); if (visitText) { p(); p(visitText); }
  const booking = bookingBlock(s); if (booking) { p(); p(booking); }
  // each section's structure, so six of them are not built as one heading, a line and a panel (r12-p54)
  const run = structureRun(s);
  if (run.length > 1) { p(); p(`**Structures, in order:** ${run.map((x) => `${x.role} ${x.replay ? 'the replay' : x.k.startsWith('scene:') ? 'the scene' : x.k}`).join(', ')}. Build each section in the structure its heading names: a list stays rows, a grid stays a grid of cells, tiles or columns, a split stays two sides; never three on one structure, nor three sections round the same thing (three lists, three rows of cards, three single pictures), and never two alike in a row (\`same-structure\` warns at three and fails at four).`); }
  s.sections.forEach((sec, i) => {
    p();
    // (built as dealt: r11-p51's dealt three cards came out as one credit line)
    if (sec.role === 'footer' && s.frame) { const visit = visitNote(s, s.frame.footer.text); p(`### ${i + 1}. footer — as dealt in section 0`); p(`${s.frame.footer.text}${visit ? ` ${visit}` : ''} Build it as dealt, every part and size of it, never a line of credits or a © row in its place (\`footer-not-as-dealt\`).`); return; }
    // a page ends once: the footer's own closing line is the call to action (round 11: nine of thirty pages closed twice)
    if (sec.role === 'cta' && ctaFooter) { p(`### ${i + 1}. cta — carried by the footer's closing line (section 0)`); p('The footer dealt in section 0 opens on the page\'s closing line and its button: that is this page\'s call to action. Build no section here; the section before it runs straight into the footer after the section gap.'); return; }
    // the replay's stage is the last thing in its section and is held (replay-not-held): no second shape around it
    if (s.replay && sec.role === s.replay.carries) { p(`### ${i + 1}. ${sec.role} — the product replay (section 8)`); p(`This section is the replay's held stage: the heading that states the promise, the window, one sentence and the Replay button, with nothing after them. No other shape is built here.${['proof', 'testimonial'].includes(sec.role) ? ` It holds the ${sec.role} section so a scene has room: the product doing its task is the proof. Real quotes or names the brief gives go in a short block of their own after it; none are invented.` : ''}`); return; }
    // a section a scene carries is that scene: no blueprint beside it (round 11a printed a panorama and display address
    // rows under two sections their scenes carried)
    const scene = carriedBy(s, sec);
    if (scene) { p(`### ${i + 1}. ${sec.role} — the scene \`${scene.id}\` (section 9)`); p(`This section is the scene: what it says (${sec.role === 'work' ? 'the work' : `the ${sec.role}`}) is set in the scene as section 9 says, with no second shape around it and no blueprint here.`); return; }
    if (!sec.blueprint) { p(`### ${i + 1}. ${sec.role}`); p('No blueprint in the library for this role. Compose it from the direction above, using a layout shape not used by its neighbours.'); return; }
    p(`### ${i + 1}. ${sec.role} — ${sec.name} (${structureOf(sec) || sec.shape})${sec.pattern ? ` — \`${sec.id}\`, a pattern of the design-anatomy study` : ''}`);
    const opens = (s.scenes || []).find((x) => x.carries === sec.role && x.position === 'transition');
    if (opens) p(`The hand-over scene \`${opens.id}\` (section 9) opens this section; ${opens.technique ? 'its direction' : 'its "Where" line'} says what of the section it carries, and the rest follows in this shape.`);
    if (sec.pattern) p('A pattern of the study standing in for this section\'s blueprint: its description is the spec, built with this page\'s content, in the dealt type, colour, corners, card style and button, within the word and picture budgets above.');
    p(sec.blueprint); if (sec.mobile || (sec.pattern && !phoneIn(sec.blueprint))) p(`On a phone: ${sec.mobile || PHONE_FALLBACK}`); adjust(sec);
  });
  p();
  if (s.motion || s.entrance || s.replay || s.moves?.length) {
    p(`## 8. Motion${s.replay ? ' — the product replay' : s.motion ? ` — ${s.motion.name}` : ''}`);
    if (s.replay) replayBlock(s.replay, s, p);
    else if (s.motion) { p(s.motion.description); p(`This is the signature move, the one loud moment. Around it the page still needs the rest of the motion layer (SKILL.md step 9): ${s.entrance ? 'the entrance below' : 'a quiet entrance on the first screen (never a fade on every section)'}${s.moves?.length ? ', the small moves below' : ''} and feedback on every control; video only as section 0 deals it. The inspector fails a page that barely moves. Recipes: references/motion.md.`); }
    // (counted once: as its own stretch, or as the hero's pin when it is the hero's own move: moveHold)
    if (!s.replay && MOVE_HOLD[s.motion?.id]) p(moveHold(s) ? `It holds the stage about ${moveHold(s)} screen${moveHold(s) > 1 ? 's' : ''}: one of this page's held stretches, counted with the scenes in section 9, and no section beside it pins.` : `It is the hero's own move: the hero's held first screen (section 6) is this hold, one held stretch counted in section 9, and no section beside it pins.`);
    if (s.entrance) entranceBlock(s.entrance, s, p);
    if (s.moves?.length) movesBlock(s, p);
    p();
  }
  if (s.scenes?.length) {
    p('## 9. Scroll scenes');
    const one = s.scenes.length === 1;
    const toBuild = s.scenes.filter((x) => x.technique).length; const tested = s.scenes.length - toBuild;
    const kinds = !toBuild ? 'tested and ready to fill' : one ? 'a researched technique to build fresh' : `${['', 'one', 'two'][tested] || tested} tested and ready to fill, and one researched technique to build fresh`;
    p(`${s.replay ? `One scroll scene, ${kinds}; the big moment is the product replay (section 8).` : one ? `The page's big moment: one scroll scene, ${kinds}.` : `The page's big moments: ${s.scenes.length} scroll scenes, ${kinds}.`} ${one ? 'It is part of the composition, so build it in step 6 with the section it carries' : 'They are part of the composition, so build them in step 6 with the section they carry'}, not as a motion afterthought. ${one ? 'It runs' : 'Each runs'} on the shared stage (assets/scenes/stage.js and stage.css, with GSAP and Lenis from the pinned CDN lines in stage.js) and ships its own finished composition for reduced motion and for phones that rest. How to put one on a page, fill it and check it: references/scenes.md. Check them with \`node <skill>/scripts/scenes.mjs <page>\` and look at every sheet.`);
    const held = s.scenes.reduce((t, x) => t + (x.hold || 2), 0);
    // a section that pins is a held stretch too (settlePins)
    const pins = [...(s.scenes.some((x) => x.carries === 'hero') || !pinHold(s.hero) ? [] : [{ ...s.hero, role: 'hero' }]), ...pinnedSections(s)];
    p(`**The length budget.** ${s.scenes.length === 1 ? 'This scene holds' : 'Together these scenes hold'} about ${+held.toFixed(1)} screens of scroll (a scene's section is its hold plus one screen tall)${pins.length ? `, and the ${pins.map((x) => x.role).join(' and ')}${pins.length > 1 ? ' pin' : ' pins'} about ${pins.reduce((t, x) => t + pinHold(x), 0)} more: held stretches as well, and no other section pins` : ''}${moveHold(s) ? `; the signature move (${s.motion.name}) holds about ${moveHold(s)} more` : ''}. A scene replaces the content of the section it carries: it is that section, not extra screens in front of it, and it never adds screens of nothing. The whole page still runs about 12-16 screens at 1440 (the inspector's header counts them), so build the other sections to their content and keep each hold to the beats it has.`);
    p(`**The ${tested ? 'demo' : 'example'} is not the content.** ${tested ? "Each scene's demo page is a working example for a made-up client: its town, its photographs, its map, its object and its words are placeholders." : "The direction a technique gives is written for another client: its business, its objects and its words are examples."} Every picture, word and drawn thing in your scene comes from this subject (your inventory, SKILL.md step 1): a row of work is this client's own work; the words a scene gathers are what this client really makes or grows; a quote is the client's own words. A scene that still shows the ${tested ? "demo's" : "example's"} content${tested ? ', or the stand-in a script draws when it is given nothing,' : ''} is unfinished.`);
    if (fewPictures(s.input) && s.scenes.every(lightScene)) p(`**This page is short of pictures of its own subject, so ${one ? 'its scene needs' : 'its scenes need'} no photograph or one.** Fill ${one ? 'it' : 'them'} from the words and the product's own facts; a scene's one picture is one the page shows nowhere else (a cargo-bike page showed its one family photograph three times, the scene's among them). If even that cannot be filled, \`--redraw scenes\` deals another of the same kind before any that needs more.`);
    for (const sc of s.scenes) {
      p();
      if (sc.technique) { techniqueBlock(sc, s, p); continue; }
      const what = sc.carries === 'hero' ? 'the first screen' : `the ${sc.carries} section`;
      p(`### ${sc.name} (\`${sc.id}\`) — ${sc.position === 'transition' ? `the hand-over into ${what}` : `carries ${what}`}`);
      p(`${sc.summary}${sc.hold ? ` Hold: ${sc.hold} screen${sc.hold === 1 ? '' : 's'}${sc.defaultHold > sc.hold ? ` (set \`data-options\` hold to ${sc.hold}, or the lowest value the scene allows; its default is ${sc.defaultHold})` : ''}. Every frame of the hold must read as a finished layout: no word split into flying letters, no title sliced by a mask, nothing that looks broken halfway (scenes.mjs warns \`tilted-letters\` and \`edge-sliver\` at a settled step); its finished composition is no list drawn as boxes (\`boxed-list\`) and no display heading alone on its screen (\`lone-heading\`); on a phone a heading set in letters is whole wherever the scroll stops (\`letters-mid-reveal\`), and below 600px a list laid over the picture drops into the flow under it, never clipped by the stage (\`clipped-text\`).` : ''}`);
      if (sc.place) p(`Where: ${sc.place}`);
      if (sc.carries === 'work' && !sc.byRole?.work) p('On the work, the scene is the work: four to six pieces, each stopped flat and large with its own title under it for half a screen, each linking to its piece; the rest go to a plain index under the scene.');
      if (sc.byRole?.[sc.carries]) p(sc.byRole[sc.carries]);
      if (sc.content) p(`Content: ${sc.content}`);
      if (sc.options) p(`Options (data-options): ${sc.options}`);
      // the closing scenes were written for a one-line footer pulled over their foot; the footer is a designed section now
      if (sc.position === 'closing' && s.frame && /\bfoot\b/.test(sc.options || '')) p(`Leave \`foot\` unset: the footer dealt in section 0 (\`${s.frame.footer.id}\`) follows the held stage as its own section, after the section gap, and is never pulled over the picture.`);
      // a scene that shades its picture for white type keeps it bright for a client named for a light
      const shades = [...String(sc.options || '').matchAll(/\b(shade|dim)\s+0?\.\d+/g)].map((m) => m[1]);
      if (shades.length && nameColours(s.input.brief).lean === 'light') p(`For this client's bright pictures (section 4): set ${shades.map((x) => `\`${x}\``).join(' and ')} to 0, and put the words in the ink on the picture's pale calm part.`);
      p(`Files: \`<skill>/assets/scenes/${sc.id}.js\` and \`${sc.id}.css\`; a working example (its content is a placeholder): \`<skill>/assets/scenes/demo/${sc.id}.html\`.${sc.phone ? ' On a phone: ' + sc.phone : ''}`);
    }
    p();
    p('Leave a quiet section between two scenes so each one lands. A scene whose content you cannot fill honestly is redrawn (`--redraw scenes`), never faked; scenes are redrawn twice at most, and after that you take one that fits by id or build without one (`--redraw scenes=none`): one honest scene, or none, beats a fifth redraw. A page with scenes is long: keep the navigation, or at least the one action, in reach on every screen (references/layout.md §7).');
    p();
  } else {
    // section 9 always prints: scenes, a technique, or none with the reason (r9-p41's sheet went from 8 to 10)
    p('## 9. Scroll scenes');
    // an entrance where nothing arrives is not motion
    const moves = [s.entrance && s.entrance.family !== 'still' && `the entrance (${s.entrance.name})`, s.replay && `the product replay (${s.replay.name})`, !s.replay && s.motion && s.motion.id !== 'stillness' && `the signature move (${s.motion.name})`, s.frame && s.frame.clip.id !== 'none' && 'the moving picture section 0 deals', s.moves?.length && 'the small moves section 8 deals'].filter(Boolean);
    const and = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0]);
    const chosen = s.noScenes && !s.noScenesWhy;
    p(`**None: this page is built without a scroll scene** ${chosen ? '(`--redraw scenes=none`): no scene could be filled honestly.' : `(none dealt): ${s.noScenesWhy || noSceneWhy(s)}.`} ${moves.length ? `Its motion comes from ${and(moves)}: build ${moves.length > 1 ? 'them' : 'it'} with care, with feedback on every control, and put no ${moveHold(s) ? `other pinned stretch in place of a scene (the signature move's hold of about ${moveHold(s)} screens is the page's one)` : 'pinned stretch in place of a scene'}.` : 'Nothing else dealt here moves (the entrance is one where nothing arrives): take a moving one with `--redraw entrance`, since the inspector fails a page that barely moves, and put no pinned stretch in place of a scene.'}`);
    p('**The length budget drops:** about 8-12 screens at 1440 (the study\'s median page is 8.7; references/layout.md), every section built to its content, with no stretch held for a scene.');
    if (s.lightOptions?.length) p(`**A scene that needs no photograph, or one, still fits this page:** ${s.lightOptions.map((id) => `\`${id}\``).join(', ')} (\`node draw.mjs --list scenes\` and \`--list techniques\` say what each is). Before building without one, take one of them with \`node draw.mjs --redraw scenes=<id>\` (taking one by id is not one of the two redraws) and fill it from the words and the one picture you have; none is for a page that cannot fill even these, and the report says why.`);
    p();
  }
  if (d.richness) { p('## 10. Where the richness comes from'); p(d.richness); p(); }
  if (d.pitfalls) { p('## 11. How this direction goes wrong'); p(d.pitfalls); p(); }
  if (s.references?.length) {
    p('## 12. Real references');
    p('Studied sites that work this way. Take the principle, never the specifics: no names, copy, images or signature assets of theirs.');
    for (const r of s.references) p(siteCard(r, false));
    p('Full notes on any of them: `node draw.mjs --site <id>`.'); p();
  }
  p('## Always');
  p('Headlines two lines or fewer at every width. No eyebrow labels, no monospace, no 01/02/03, no thin rules or outlined boxes, no gradients,');
  p('no shadows at rest, no glass, no cream-and-terracotta, no violet, lavender or periwinkle. The frame: the hero alone on the first screen');
  p('(100svh), one h1 there that says what this is, 16vh or more between sections, equal outer margins and nothing run into one edge, no');
  p('section huddled on one side, no blank stretch over half a screen, a heading on every section. No bar above the navigation and no sentence');
  p('in it; the footer a designed section, never one line. Cards with a fill where things belong together, in the dealt style; never a card');
  p('in a card, never a page of nothing but cards. No picture inside a headline or a sentence, no headline in a card, no centred stack of');
  p('headline, line, two actions and photograph card, no giant name or email anywhere, no credit wall, no drag or progress bars or range');
  p('sliders, no switch that changes nothing, no bento grid, no wall of tiles in several fills, no heading alone on its screen, no drawn');
  p('shapes, diagrams or charts outside a product fragment, no documentary or archive photographs, one accent hue. Few words: the first');
  p('screen 30, a section 60, the page about 500; running, list and table text 16px or more at 4.5:1. One email form a page, no stats band');
  p('of one-word labels, key content in the open, no two sections in a row with the same split, each photograph once, in colour, never blurred.');
  p('`inspect.mjs` measures all of it.');
  // (r13-p60's builder named a notes app after a real one; an earlier page took another real tool's name)
  p('A name the brief does not give (the client\'s, the product\'s) is coined, then searched with the trade\'s word ("<name> notes app") before use, and replaced if a product or company of that trade has it: two coined names in tests were real apps of the same kind (references/copy.md §5).');
  if (s.allow?.length) p(`This direction is allowed: ${s.allow.join(', ')} (the inspector reads this from the saved sheet).`);
  p();
  p(`Saved to ${sheetPath.split('\\').join('/')} · reprint with \`node draw.mjs --show\``);
  return o.join('\n');
}
