# Tells — the dated registry

A tell is a device that makes a page read as generated. Tells are not bad design in themselves; most
began as good ideas on good sites. They became tells by being produced by default, everywhere, without
a reason. That is why this registry is dated, and why it never names a replacement font, colour or
component: every published "use this instead" list has become the next wave of tells within months.
Replacements here are procedures (draw from the library, derive from the subject), not products.

`scripts/inspect.mjs` and `scripts/lint.mjs` detect most entries. Status: **banned** means the
inspector fails the page; **warned** means it flags it and you need a reason.

## Contents

1. First wave (2023–2024)
2. Second wave (2025)
3. Third wave (2025–2026): the "fix" that became the look
4. Gallery fashion, banned as house style
5. Structural tells
6. Copy tells
7. Motion tells
8. Why removal is not enough

## 1. First wave (2023–2024)

| Tell | Status | Do instead |
| --- | --- | --- |
| Violet / indigo gradients on hero, buttons and glows | banned | The dealt palette; flat colour |
| Gradient-filled headline text | banned | Solid ink |
| Glass panels: backdrop blur, translucent cards | warned (2 or more) | Opaque surfaces one tone step from the ground |
| Glowing or gradient "Get started" button | banned | Flat button named for its action |
| Soft grey drop shadow under every card | banned | Tone step, or no box |
| Three identical feature cards, each with an icon in a rounded square | banned (the icon) | Cards in the dealt style, with no icon on top, or the dealt section blueprint |
| Emoji as icons or bullets | banned | Words, or a real picture |
| Centred headline, subtitle, two buttons, screenshot below | no rule; the draw avoids it | The dealt hero |
| The same typeface on every generated page | warned (lint: default-font) | The dealt type system |

## 2. Second wave (2025)

| Tell | Status | Do instead |
| --- | --- | --- |
| Eyebrow / kicker: tiny tracked uppercase label above every heading | banned | Fold it into the heading, or delete |
| Pill badge above the hero headline ("New", "Beta", "Introducing") | banned | Say it in the supporting sentence |
| One word of the headline in italic serif, colour or underline | warned | One face, one colour |
| Bento grid of rounded tiles as the feature section | failed when two of its cards are half empty or more (`bento`); outlined boxes in a row fail (`boxed-list`) | The dealt card style for a group of one kind; the rest set as type on the ground |
| Near-black ground with one neon accent and a glow | banned via shadow, gradient | A dealt dark palette, no glow |
| Floating rounded pill navigation with blur | warned when blurred or see-through (`pill-nav`) | The navigation section 0 deals; a floating capsule only opaque, one tone step from the ground |
| Fake dashboard hero built from grey bars and donut charts | no rule; see imagery.md §7 | A real interface fragment, or no image |
| Decorative status dot ("Available for work", pulsing "live") | lint: bounce | Remove |
| Fade-and-rise on every section | no rule; see motion.md | One signature move |

## 3. Third wave (2025–2026): the "fix" that became the look

The remedy published for the first two waves was "warm it up and make it editorial". Models adopted
the remedy wholesale and it is now the most recognisable generated look of all.

| Tell | Status | Do instead |
| --- | --- | --- |
| Yellow-cream ground + terracotta / rust / clay accent | banned together; terracotta banned alone; cream warned | The dealt palette. Warmth from a low-chroma stone, a deep ink, a photograph, or a full warm field |
| High-contrast or soft serif display as the shortcut to "premium" | no rule | The dealt type system, whatever class it is |
| Oversized italic serif headline | no rule | As dealt |
| Broadsheet cosplay: hairline rules everywhere, zero radius, dense columns | banned via hairline | Structure from space and tone |
| "Field notes", "Quietly trusted by", "On our desks": performative labels | lint: copy | Plain section names |

## 4. Gallery fashion, banned as house style

These are common on award sites right now. In the study they appear *more* often on the top-scored
sites than on the weak ones (panel observations: monospace labels 44% against 24%, index numbering 38%
against 21%; measured thin rules 61% against 52%). They are banned here regardless, by the owner's
decision: they are the first things a generator copies from the gallery, they carry no information,
and a page built without them has to find real structure.

| Tell | Status | Do instead |
| --- | --- | --- |
| Monospace micro-labels, mono as a "technical" voice, mono captions | banned | The text face; tabular figures for data |
| Index numbering: 01 / 02 / 03, (001), "Step 02", numbered section markers | banned | Order by position, scale, or the words; `<ol>` when it is truly a list |
| Thin rules: hairline dividers, ruled grids, 1px outlined boxes and tiles | banned (boxes: 3 or more) | Space, tone steps, filled shapes, a thick bar if a bar is the idea |
| Design-tool chrome as ornament: crosshairs, crop marks, selection handles, dashed guides, rulers | banned via hairline, dashed | Remove |
| Agency micro-meta: local time, coordinates, weather, version stamps, "©2026 — Scroll", middle-dot strings | lint: copy; micro-label | Remove |
| Tiny uppercase letter-spaced captions scattered around the viewport | banned (3 or more) | Sentence case at readable size, placed with the content it describes |

Tiny tracked capitals are the one item in this group the data condemns as well: 16% of top sites
against 57% of weak ones.

## 5. Structural tells

| Tell | Status | Do instead |
| --- | --- | --- |
| Headline as a full sentence at display size, three or four lines | banned (over two lines) | A title of about five words; the rest goes below |
| Stock section order: hero, logos, features, testimonial, pricing, CTA | no rule; see copy.md §1 | The order of the argument |
| Every section the same layout family | critique.md pass 9 | Different composition per section, from the sheet |
| Everything centred | warned over 72% | Left-anchored, one centred moment |
| One medium border radius (12–16px) on everything | none | The dealt corner for cards and pictures, the dealt button design for buttons |
| Nine nearly equal font sizes | warned over 9 | Five sizes, far apart |
| Invented social proof: logos, quotes, star rows, "10,000+ teams" | copy.md §5 | Real proof, or none |
| Text or a CSS box where a picture belongs | critique.md cap | A real picture, or a design that needs none |
| Headline in a card on a darkened photo (October 2026) | failed (`hero-in-card`) | The headline on the ground or on its picture |
| The email or the name set at display size, anywhere (October 2026) | failed (`giant-contact`) | The email at the h3 step, a Copy button and a mailto link |
| Bento grid of feature cards with empty cells (October 2026) | failed (`bento`) | An editorial list, or one large product view with annotations |
| A range slider as an estimator (October 2026) | failed (`range-slider`) | Stepped buttons of real values |
| A scene drawing wheels, waves or a scrubber rail (October 2026) | failed (`scene-drawing`, `scene-track`) | Real pictures, the product's interface, or type |
| A link-column footer on a one-page site (October 2026) | not dealt | One of the other footer designs section 0 deals |
| A short line held for two screens or more (October 2026) | failed over 1.2 screens (`line-holds`) | One screen a line, or a second beat with new content |
| The template stack: a centred headline and a line over a round-cornered photograph card or a row of two or three cards, with or without actions (October 2026) | failed (`template-hero`) | The dealt hero's geometry, its largest type the page's idea or the name |
| One photograph held under every step of a stepped scene, repeated down the page without the pin (October 2026) | failed at three showings on tablet and phone (`repeated-picture`) | Its own picture per step; one picture shown once, the steps beside it |
| A band of big figures, each over a one- or two-word label (October 2026) | warned (`stats-band`) | A figure in the line that says what it counts |
| Two email forms on one page, the closing section and the footer (October 2026) | warned (`duplicate-form`) | One form |
| Boxes in boxes (a card in a panel, a product window on a card), a box laid half or more over a photograph or cut to a shape, three outlined boxes in one section, three product windows on the first screen (October 2026) | failed (`framed-elements`); a page of nothing but boxes fails `boxed-page` | Filled cards side by side in the dealt style, never one inside another; no outlines |
| Picture beside text in every section, 50/50 all the way down (October 2026) | warned at three in a row (`repeated-split`) | One section breaks the split: a full-bleed picture, a headline across the width, an 8/4 asymmetry |
| A milky or dark fade over a full-bleed photograph (October 2026) | failed (`gradient`) | Words on its calm part, or beside it; at most a flat dark scrim |
| A blue lightened for a dark ground into periwinkle (October 2026) | failed (`palette-purple`); the draw turns it | Lighten toward the cyan side, or another accent |
| A held replay or scene whose heading is cut off above the screen or under the bar on a tablet or phone (October 2026) | failed (`held-heading-cut`) | Fewer rows in the window there; replay.js holds the stage below the bar |
| A search box or button in a product fragment that does nothing when used (October 2026) | warned (`dead-control`) | It works, or it reads as static: no pointer, hover or focus |
| A photograph with no line in the Image credits (October 2026) | warned (`uncredited-picture`) | One credit for every photograph that is not the client's own |
| A product replay whose beats change a few percent of its window (October 2026) | warned at one faint beat (under 15% of the window) or a largest beat under 30%, failed when most are faint (`replay-faint`) | Each beat changes about a third of the window; the result large and in the accent |
| A list drawn as boxes that are not cards: outlined items, tickets cut to a shape, items that each hold a box of their own (October 2026) | failed (`boxed-list`, in a scene's finished composition too) | Filled cards in the dealt style, or the items as type on the ground |
| A display statement alone on its screen while its section's content waits below (October 2026) | failed when it holds alone for two screens (`lone-heading`) | The heading over its content from the first frame |
| Running text in a pale grey (October 2026) | failed under 4.5:1 (`contrast`) | The full ink; grey only for notes |
| A left column that ends while the text beside it runs on (October 2026) | warned (`empty-left`) | Balance the columns, or let the text run full width below |
| A scene frame with a heading's letters turned or off their line, or a picture cut to a sliver by the screen edge mid-hold (October 2026) | warned on the contact sheets (`tilted-letters`, `edge-sliver`) | Every settled step finished and level |

On 29 October 2026 the owner looked at the test pages himself. What he named, and what it is now:

| Tell | Status | Do instead |
| --- | --- | --- |
| Everything alike: three button shapes at one size, one plain bar that hides on scroll, a one-line footer | not dealt; each is one of about fifteen designs or one of the study's patterns in section 0, none on more than about one page in ten | The navigation, footer, cards and buttons the sheet deals |
| The next section already in view on the first screen | failed (`hero-not-alone`) | The hero alone, `min-height: 100svh` |
| Sections crowding each other, no air between them | warned under 12% of the screen, failed under 6% (`section-air`) | 16vh or more between sections at 1440, as dealt |
| A product window or picture run into one screen edge while the other keeps its margin | failed (`edge-run`; a picture or colour field as tall as its section, flush with one side, is warned) | Inside both margins, or full-bleed across both edges |
| An announcement or information strip above the navigation | failed (`announcement-bar`) | Nothing above the bar |
| A sentence in the navigation | failed (`nav-sentence`, also any link or button over three words) | One- or two-word links |
| Text floating with no card or container where it belongs to a group | critique.md | The dealt card style for the group |
| A one-line footer | not dealt; where section 0 dealt a footer, one row of words or under 160px at 1440 fails (`footer-not-as-dealt`) | The footer section 0 deals, built as described |
| Documentary or archive photographs: old Commons or museum pictures, postcards, old maps, news-like shots | banned | Modern, well-lit photographs (the library's), or none |
| Too much text: long supporting lines, paragraphs, a heading and two sentences over every list | warned over the budget, failed past 1.5 times (`wordy-hero`, `hero-words`, `wordy-section`, `wordy-page`) | The first screen 30 words, a section 60, the page about 500 |
| A headline that repeats the logo beside it | critique.md | The name once on the first screen |
| Two buttons to the same place on one screen | failed where one screen shows two ways to one place, in one block or two: a button and another button or link by the same address or label, or one link twice under one label (`duplicate-action`). In the bar only its buttons count: its action beside the hero's button to the same place fails, and so does a bar that stays on the screen beside a section's button to its place. A footer's lists of links count within the footer only. Cards of one group, each with its own address or none, are each card's own action | One action once a screen |

The round-11 test pages (30 October 2026) showed two more:

| Tell | Status | Do instead |
| --- | --- | --- |
| A new ground or panel colour for each section or card | warned at three grounds by the screens a visitor sees them on, failed at four (`surface-count`; a surface a step from the ground counts as its one surface, and a tint a step off the ground beside it is one more; the ink and a dealt field count once they ground more than the footer and one section or two and a half screens, the accent more than one section or a screen and a half; any other tone counts from a quarter of a screen, or from any band across the width, a band sampled from a photograph included, and such a band takes the page's one band, so the ink, a field or the accent grounding a band beside it counts as well; a ground the dealt scene, technique or section asks for is named and only warns) | The ground and one surface tone; the ink, the accent or the field as one band |
| A portfolio whose work is type cards, no picture of the work | warned under three pictures or marked slots in the work; a photograph credited to another among the work, in a `data-slot="work"` frame or not, fails (`portfolio-without-work`) | Frames, stills or films of the work; `data-slot="work"` frames holding the project's own still where the client's own are missing |

The round-12 test pages (30 October 2026) showed four more:

| Tell | Status | Do instead |
| --- | --- | --- |
| A third button shape: an outline, a pill or a block of its own beside the dealt button and its sibling | failed over two shapes on the page, by corner and kind at any height; tabs and toggles (a disclosure's rows too) do not count unless drawn as folder tabs, and a mark linking home counts only drawn round, a monogram in a circle, in the bar past the hero too; the square tile a dealt bar carries does not; a square block with one corner cut off by its clip-path (the dog-ear) is a folded corner, one shape at any depth of fold and with its sibling (`button-family`) | The dealt button for every action, and one quieter sibling |
| The dealt navigation built as a plain bar, or a bar that hides on scroll | failed where the built form is not the dealt one (top bar, dock, side index, corners, centred wordmark, masthead, the toolbar of the hero's product window); a bar that hides on the way down fails too, and is warned where no navigation was dealt (`nav-not-as-dealt`) | The navigation section 0 deals, on the screen after the hero |
| Section after section built one way: a small heading, a line and a list panel | warned at three sections round the same thing (a list, cards, a window, one picture), failed at four; the footer counts with them as a row of three cards or more alike, never as halves or keys (`same-structure`) | Each section the structure its content asks for, none three times; the footer stays as dealt and the sections change |
| Every section a box: product windows, panels and cards on one fill | warned when four sections or more after the hero, all but one, stand in a box (`boxed-page`) | Cards and windows in two or three sections, the rest on the ground |

The four pages on the round-11b commit (30 October 2026) showed two more: three could not be published for the first, and the fourth was marked down for the second:

| Tell | Status | Do instead |
| --- | --- | --- |
| Another business's product, room or work shown as the client's: a maker's bike with its name on the frame, a named hotel's room, another roastery's roaster, another artist's work | failed when a picture shown as the client's (a marked slot, their name in its caption, the work, a room, the house, their own place, any picture on a page that sells one product) has a credit that names a business: a hotel or a shop by its name, a maker and its model, or the record's own words that it carries another maker's name; so does any photograph in the product's frame that is not the client's, a picture titled with a product of its kind on a page dealt no product photograph, and a picture shown as theirs with no credit while the page's credits name a business (`credit-names-business`) | The slot as the sheet describes it: the product's name and facts in its frame, details that belong to no one, the project's own still |
| The hero's title running on under the fold, set to cross it on purpose | failed at 1440 and 390, at any size, once its letters end more than 6px under the fold (`hero-cut`) | The title whole on the first screen, with air under it |

The round-13 test pages (30 October 2026) showed one more:

| Tell | Status | Do instead |
| --- | --- | --- |
| A footer of links to other companies: the word processors the product opens, the style guides it follows | warned at one or two, failed at three or more, a column of them (`footer-other-sites`; a map, the client's own site, profiles on social networks, picture libraries and credits aside) | The client's own sections, pages and contact; another product named in a line where it matters |

The round-14 test pages (31 October 2026) showed five more:

| Tell | Status | Do instead |
| --- | --- | --- |
| A private person's room shown as the client's: a furnished corner from a picture library as the guesthouse's family room | warned when a picture by another in a room, house, product or work slot has a credit, title or alt that names a room, a bedroom, an apartment, an interior, furniture or a person's home (`room-not-theirs`) | Details that belong to no one (linen in window light, a chair, a lamp, the view) until the client's own photographs arrive |
| A figure cut by its box: a rolling number resting half-masked | failed once the page rests, at any width; a figure is never a crop at the screen's side or the foot of its box, as a display word may be (`cut-figure`) | The whole figure inside its box, a step smaller where it does not fit |
| A button stranded on a busy photograph, away from its form | warned when a drawn button stands on a photograph that changes by 12 or more of 255 from one pixel to the next round it (scrub, stones; a sky or a meadow stays under it) (`button-on-photo`) | The action on the ground or a card beside the picture, with its form |
| The product's frame a filled box holding its name and three facts | warned when the `data-slot="product-photo"` frame is filled or outlined, holds no picture and its words cover under a sixth of it, a row of three marked cards aside (`hollow-box`) | The product statement: its name and four to six true figures set large, on the ground |
| A named item of the menu shown by another's photograph: a stock flat white beside "Flat white 3.80 €" | warned when a picture by another has an alt, caption or title that names an item its section prices (`menu-not-theirs`) | The menu in type, or the client's own photographs; stock of the trade only for the mood, away from the menu |

## 6. Copy tells

Flagged by `lint.mjs`: the genre's verbs and adjectives (unlock, supercharge, seamless, elevate,
effortless, cutting-edge, all-in-one …); the correction ("not just X, it's Y"); tricolon headlines;
"Get started" and "Learn more" as labels; more than a handful of em dashes; lorem ipsum. See
`copy.md` §6.

## 7. Motion tells

Identical fade-up on every block; a dozen staggered hero entrances; hover lift on every card; bounce
easing; infinite loops that mean nothing; reveals that fail and leave a blank band. See `motion.md` §9.

## 8. Why removal is not enough

A page with every tell removed and nothing put in their place is an empty page with good manners, and
that is a tell too (the "avoidance aesthetic": anyone could guess it from the category plus the list of
things to avoid). The tells were filling a gap where an idea should have been. The order of work in
`SKILL.md` exists to fill that gap first: the idea from the subject, the dealt composition, real
pictures or committed type, and only then the checks.
