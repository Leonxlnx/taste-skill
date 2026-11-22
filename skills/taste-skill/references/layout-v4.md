# Layout: the first screen, sections and their air, equal edges, heroes, type

The layout spec for every page (house rules 3, 4 and 6). `system.css` implements the tokens, the
section box, the grid and the hero frame; `assets/layout/` holds the heroes (`layout.css`,
`layout.js`, `heroes.json`, `hero-<id>.html`), the hero dealer (`deal.mjs`) and the check
(`layout-check.js`, `check.mjs`). Link `layout.css` after `system.css`, `ui/cards.css`,
`motion/motion.css` and (tech) `backgrounds/backgrounds.css`; load `layout.js` after `system.js`
(`starter.html` does both). Tokens, buttons and the nav: `system.md`.

## 1. What the good sites do

- figma.com and x.ai (the reference recording): the hero fills the first screen and nothing of the next
  section shows at load; sections hold 0.45 to 1.25 screens of content with about a quarter screen
  between them, and a shot of one section often shows the next: the air between them does the parting.
- A study of 327 sites at 1440x900 and 390x844: the hero is alone on the first screen on 78% of
  company sites; a section shows alone more often the taller it is (0.29 under 0.6 screens, 0.80
  at 0.95 to 1.1) and the wider the gap (0.42 under 60px, 0.82 at 220px and more). Its place sample
  holds no local shops, so the place numbers below are the house's own ask and taste, not measurements.
- So the look comes from the first screen and the air: the hero alone on it, then every section as
  tall as its content with the same generous padding round it (a third of a screen between two
  sections' content at 1440). A section held to a whole screen stretched short content into empty
  bands on every test page and made builders cut content to fit; that model is gone.

## 2. Sections as tall as their content

**The first screen.** The hero fills it alone and nothing of the next section shows at load (section
3). It is the one screen the page is cut to. `html { scroll-padding-top: 0; scroll-behavior: auto }`,
so an anchor jump lands on a section's top (the fixed header covers part of its top padding).

**The shell.** `body` renders only `header.nav`, `main`, `footer.closing` and, on a phone,
`nav.actionbar` (plus script, style, template). No popups, newsletter modals, chat bubbles, help
pills, back-to-top squares, badges, award strips or asks in a modal; nothing else is fixed.

**The section box.** `main > section` and `footer.closing` are as tall as their content: `--padt`
above the h2 and `--padb` under the last block (128 and 128 from 1024, 104 on a tablet, 88 on a
phone; `footer.closing` adds `--bar`, the phone action bar). So the content of two sections always
sits `--padb + --padt` apart, 256px at 1440, 208 on a tablet, 176 on a phone: the same air
everywhere, generous but never an empty band. `.wrap` is a section's only in-flow child (`z-index: 1`); a layer sits
beside it, and from 640 a section with a layer is at least 80% of the screen. Never a height,
min-height or padding of your own on a section, never `dvh`, never a height set by script. `--h`,
`--hm`, `.g2`, `.g2m` and `.fill` (the old screen counts) are read nowhere: they change nothing.

```html
<section class="section" id="features"><div class="wrap"> the h2 first, then the content </div></section>
```

- **Content decides the length.** Never cut content to fit a screen, and never hide it on a phone
  to make a section shorter. In testing, builders dropped a wine bar's menu, a hotel's location and
  an FAQ question, and hid six blocks with `display: none` at 390, to meet a screen count. A long
  menu, six rooms, ten questions: the section grows. Split a section only where the subject
  changes, each part with its own h2.
- **Air, never an empty band.** A section ends where its content ends, `--padb` under it; nothing
  is stretched to fill a screen. Pictures keep their own ratio: a split's photograph stands beside
  the words at its ratio, top-aligned with them (a `.frame--fill` also grows with its row when the
  words run taller); tiles keep `--tile-ratio`, a card's panel its `--p-h`. A frame names its ratio
  (`.frame--portrait`, `--square`, `--split`, or `--ratio`); one that names none and holds only a
  photograph laid over it is 4:3, never 0px. Nothing is pulled apart with `space-between`.
- **Short blocks merge.** A quote, a logo row or a stat row that alone is a few lines goes into the
  section above as its last element, with no heading or ground of its own. No strip sections.
- **Top-aligned:** the one h2 is the first content, `--padt` (160, 96 on a phone) under the section
  top, about 88px under the header when an anchor lands on it. Without a `.section-head` round them,
  the h2 and its lead keep the head's spacing (16px, then `--head-gap` before the content). Never
  centre content vertically; never a second h2.
- **Separation** by a full-width ground change or space only: no rules, shadows or inner hairlines
  between or inside sections, and no inset coloured box standing in for a ground. A list may close
  each row with a 1px rule inside the content edges.
- **The close and the footer are one section,** `footer.closing`, as tall as what it holds:
  `footer.closing > .wrap` holds exactly two children, row 1 the dealt close and row 2 the links and
  the legal row, 128px apart (64 on a phone), so a form or a photograph never runs under the
  columns. No separate closing band.
- **No scroll tricks:** no scroll-snap, scroll-jacking or smooth-scroll library. The one exception:
  the big scene and a dealt scroll moment (every kind, `moments.md`) run inside their own section
  (`data-big-scene`, `data-moment`) at the heights their own modules set: a scene's section keeps
  the `--h` it writes (its composition at rest one or two screens, (hold + 1) live: `scenes.md`, Its
  height); `photo-chapters` and `pinned-chapters` are (hold + 1) whole screens live, set by the
  moment, and as tall as their chapters at rest. They may pin only with `position: sticky` inside
  that box. Nothing else on any page is sticky.

`consistency.mjs` reads it (SR-2 `section-height`: an empty band beyond a section's padding, or a hole
inside it, a third of its height or more FAILs, a sixth WARNs; SR-3 `section-air`: two sections'
content under 128px apart, 96 on a phone, or over 600 FAILs), at 1440, 768 and 390 by default;
`--rhythm-widths 1440,820,768,390` adds the tablet held upright.

## 3. The hero

- **Exactly the first screen,** `100svh`, the fixed header over its top:
  padding-top `--nav + --photo + --hgap` (120 at 1440, 96 on a phone), padding-bottom `--hpadb +
  --bar` (64, 24 + bar on a phone). Content ends by y 836 at 1440x900. Nothing of the next section
  shows at 1440, 1280, 1024, 820, 768 and 390.
- **Content:** `.wrap > .hero-text` holds the composition: an optional notice line, the h1, the
  sub-line (`p.hero__lead`, layout.css), at most two buttons (a place one), and the picture. One plain claim, never a slogan;
  no caption under the picture, no second float card, no three button styles. The buttons sit above
  the fold at every width.
- **The h1** first, top at y 120 (96 on a phone), at most three lines at every width, never
  smaller than an h2 (28 to 60px on a phone). A notice line (one 14px line in the body face with a
  number, 4.5:1: changed hours, a delivery cut-off) sits 16px above it; never a bar above the header.
- **The picture ends inside the hero:** a layer behind the words, beside them in a split, or above
  or below them only if the whole hero ends by H - 24. A frame under the words ends by y 836 (about
  296px under a 356px text block); larger becomes a layer. Never a first screen that ends on a
  visual cut by the fold, never half a picture under the text.
- **The first screen at 768 and 820.** The split stacks: the words, then the picture in what is
  left. Its bottom edge ends on a whole element or clearly bleeds a large picture on purpose:
  - whole: the picture (a fragment, a phone, a render) ends 24px or more above the hero's foot;
  - a bleed: a photograph or ground filling its frame (`.frame--photo`, `object-fit: cover`), or a
    fragment in `.frame > .stage` cut by the frame's bottom through 96px or more of its rows under
    `.stage--fade-b`, the point (the comment, the button, the row worked on) above the fade.
  Never a card, window or diff in a wrapper of your own whose lower edge the fold slices (in testing:
  a 480x688 diff in `div.hero__art` lost its lower edge at 820, `fold-card` FAIL); never 1 to 95px
  of a box under the fold. Below 1024 `.at-over` pieces hide; give the main piece a `.fit` width
  (it narrows), never a fixed one. Shoot 820x1180 and 768x1024 and read the first screen's foot.
- **Docked strip:** software and product may dock one row under the hero's content (real customer
  logos with permission, a rating line the brief gives, or three facts), at most 96px, still, hidden
  on a phone unless it ends by H - 24 - bar. Service and place dock nothing.
- **Phone:** the text first; a photograph above it only when the whole hero ends by H - 24 - bar.
  Hero buttons stack at one width, unless both fit on one line.
- **Allowed types:** a full-bleed still photograph, a product whole on a stage, an inset frame, a
  statement followed by the work. Tech only: a film in a frame or behind the text (muted, inline,
  poster first, a pause button: the page's effect or loop) or a 3D hero (poster first, the canvas
  swapped in when ready). On other a film is a still that plays on a click. Never a slider or
  crossfade between screens or products, an entry gate, a loader or an entrance that hides words.
- **Pictures in the hero are the work:** the client's product, place or work, never a colour field
  or a mood.

### The eleven heroes

Dealt by kind and by the material the brief really has, never by taste, never the same within three
pages; a place gets the place hero in a dealt form (below):

```bash
node <skill>/assets/layout/deal.mjs --type software|product|place|service [--kind gaming|tech] --has photo,ui,film,object,setting --history .taste-skill/layout-history.json
```

`--type` is the page type (`SKILL.md` section 1: a game is `software`, hardware `product`; a place
prints the place hero and deals its form). A game
adds `--kind gaming` (its own weights, never `ui`): `--has film,photo` when the brief supplies its
trailer or key art, `--has setting` without art files (stand-in photographs of its setting from
`photos.mjs search`: it prints the `photo` hero, the game's name set large on the calm side; a
game never deals `statement` or `word`, and always passes `--has`); hardware adds `--kind tech`.
A product or hardware with no photographs of its own passes `--has photo` for its stand-ins
(`photos.md`, A product without photographs); `--has object` only for a cut-out or when the brief
asks for 3D or a render, and it always prints the `product` hero: the product whole on the
full-width stage, its widest view, never a `split` column or an order form alone (`sections.md`,
Product). A product page is dealt only the `product`, `photo` and `film` heroes: a `split`,
`word`, `statement` or `triptych` hero cannot show the product at 80% of the content width.
The place hero is printed, its form dealt (The place hero, below).

It prints the hero (its demo, numbers, and the moment, ground and effect ids that fit the kind; on
other only the hero itself counts). Copy only its `<section class="hero …">` from
`assets/layout/hero-<id>.html`: each file is a whole demo page, and its nav, other sections, footer
and credit line (which names photographers, against `copy.md` Credits) never come with it;
`hero-place.html`'s latte close-up is a demo, never the place hero. `word` and `statement` are
dealt only without a strong photograph.

| id | composition at 1440 | at 390 | its motion |
|---|---|---|---|
| `split` | text span-5; the picture span-6 start-7, top-aligned with the h1, ending on the right line; one opaque float card on its lower left | text, then the picture (at least 240 tall) | the float card's dot (tech) |
| `photo` | a full-bleed photograph layer, the words on its calm, dark side on six columns (h1 80, two lines), four facts at the foot | the photograph cut to the top, the words under it on the ground | none |
| `product` | a head row (h1 cols 1-7 on two lines; the lead and the buttons stacked on cols 9-12, their foot on the h1's), then the product itself big, nothing on it (hotspots only when the brief asks for them): a product photograph edge to edge down to the fold, square corners; a cut-out or a render (its widest view, `data-product-place="stage"`, only when the brief asks for 3D) on the page's ground across the wrap, no box, gradient or radius, the stage down to 24 above the fold (1280x566 at 1440x900: the city bike's side 1046 wide, 82% of the wrap). A game names itself in the h1; a `[data-print]` or `[data-scene]` on the stage keeps the lit, rounded stage | stacked; the photograph the screen width, a render 86% of the column (294 of 342) | none; a render is a still (live only when asked, `data-product-mode="live"`) |
| `editorial` | the headline is the picture: 156px on three lines across the wrap, one or two photographs set in the line as pills | 56px on four lines | the pills open once on load (tech); still elsewhere |
| `collage` | text span-5; a lit frame span-6 start-7 with the product window cut by its bottom, one result card that loops | the window alone | one card loop (tech) |
| `word` | an oversized h1 (144px, two lines) with one live word last, underlined; lead and buttons span-6, four facts span-5 start-8 | 54px on three lines | the live word, two rounds then rest (tech only) |
| `film` | a cinema frame on the lines holding the poster, h1 white on a calm part, the play disc at its foot | the frame, then the words | plays on a click |
| `statement` | one calm sentence (56px, two lines) over the page ground (tech: a dark ground on a dark page), lead, buttons, four facts | 34px on three lines | none |
| `triptych` | h1 52 on span-3, a collage of three to five pieces on span-6 start-4 whose sets change every 2.8 s, one large button ending on the right line | collage 342 wide, button full width | set change (tech only; still elsewhere) |
| `centred` | pill, centred h1 72 with the mark inline, lead, two pill buttons, then a lit frame across the wrap holding the product window, fading over its last 18% | the window less its list column | the window's story (tech) |

Every hero is one screen, stands on the edge lines, has one h1 within its `maxChars`
(`heroes.json`) and one motion of its own at most, which rests under reduced motion and on a phone.
A hero fails with a picture out to one viewport edge, a hero taller than the screen, the visual
above the text on a phone, words over the busy part of a picture, a second float card, a slogan, a
caption under the picture.

### The place hero

Every place page: one still photograph of the place leads the first screen, in the form `deal.mjs
--type place` deals (`data-form` on `<section class="hero hero--place">`, layout.css 0b; the
markup is the same for all four, so only the attribute changes). In testing every place had the
same band hero with 120 to 200px of empty ground under its words; two cafes could not be told apart.
It enters once on load like every hero (`motion.md`, The hero's entrance).

| form | at 1440 | at 390 |
|---|---|---|
| `band` | the photograph under the header down to the words, which end 64px above the fold (h1 on columns 1-6, the line and the button from the split line); nothing on the photograph | the photograph, then the words (as below) |
| `bleed` | the photograph over the whole screen; the h1, the line and the button on a solid panel of the page ground (580 wide, 48 inside) in its lower left corner, `data-corner="end"` for the right one when the calm side is right | the photograph, then the words on the ground |
| `split` | the words on five columns (the h1 at the top, the line and the button at the foot), the photograph on seven, from 40px under the header to the hero's foot | as band |
| `name` | band, with the name or the street set large across the `.wrap` first in `.hero__text` (`<p class="hero__name">Henderson Street</p>`, up to 160px): the page's one type moment | the name at 44 to 72px |

- 1440, `band` and `name`: the photograph takes what the words leave (at least 340px), so the words
  always end on the fold, never over an empty band. `--hgap: 40px`; the h1 at 48/53 on columns 1 to
  6, at most three lines; from the split line (x 732) the sub-line at 20/30 (the kind of place and
  where, with today's hours; at most two lines, 80 characters) and one filled 48px button 24px under it.
- A shop or bookshop may take a letterbox inside the column instead: 1200 x 504, 24px under the
  header (`--photo: 528px`).
- 640 to 1023: the photograph at most 56vw tall, the words stacked under it, the hero ending by
  H - 24. 390: the photograph at least 390 x 292 (a phone crop, subject centred); with
  `data-phone-fill` on it (photos.mjs prints it with the 4:5 phone crop) it grows by whatever the
  words leave of the screen, to 390 x 488 at most (about 390 x 480 at 390x844), so the screen ends
  on the button and never on an empty band; `--hgap` 24, the h1 at 32/37 (three lines at most), the
  sub-line at 18/28, one 342 x 48 button; the stack ends at H - 24 (the phone bar waits until the
  button has scrolled away; without script, H - 24 - bar).
- The photograph is real and of this place in daylight: the room from the door, the counter with
  the machine, bread on shelves, the shopfront with customers, the workshop stand, an arrangement in
  a real room, the best room or the house. Never a mood shot, scenery, a cut-out or a hazy file; a
  florist never opens without flowers. The visit block is the section after the hero, never inside
  the first screen.

## 4. Equal edges and the grid

- **One `.wrap`** for the header, every section and the footer: `width: min(100% - 2 * var(--gut),
  1280px)`. Lines at x 80 and 1360 at 1440 (a place: 1200 at x 120 to 1320), x 24 and 366 at 390.
  The same all the way down.
- **12 columns, 24px gutter** (12 on a phone). Column starts at 1440: 80, 189, 297, 406, 515, 623,
  732, 841, 949, 1058, 1167, 1275; spans 3 = 302, 4 = 410, 5 = 519, 6 = 628, 7 = 737. On a place
  (1200): starts 120, 222, 324, 426, 528, 630, 732, 834, 936, 1038, 1140, 1242; spans 282, 384, 486,
  588, 690. On a phone one 342 column or two 165 tiles 12 apart; nothing narrower than 165.
- **Every block starts on the left line or a column start,** and every block that ends on the right
  ends on a column end, the last on the right line. Anything wider than half the `.wrap` runs the
  full `.wrap`. Card rows (6+6, 4+4+4, 3+3+3+3): the first card on the left line, the last on the
  right, all one height, every row full. Text inside a card or visual is not a page line.
- **Two text lines:** the left line and the page's split line (the right column's start: k = 5, 6
  or 7, x 623, 732 or 841; a place always 6/6 at 732). Pick the split pair before building and use
  it on every split, the hero split, FAQ and visit included. Centred text moves left: the h1,
  section heads, the close and pricing heads all start on the left line (the `centred` hero is the
  one exception, on the page axis). No centred or right-aligned block wider than half the `.wrap`.
- **Splits:** text left, the visual right, top-aligned, on every split of the page: never mirrored,
  never alternating. The h2 and its intro sit on the left line above the grid. A filled column is a
  card and may pad its text 48px; text never sits inset in a bare column. Phone: text, then the
  visual, both 342.
- **Pictures:** a photograph spans 0 to the viewport as a layer, or starts and ends on the column
  lines (628, 410, 302 wide; place 588, 384, 282), one ratio per row (4:5, 4:3, 3:2 or 1:1; a place
  4:5, 4:3, 1:1). No photograph taller than the screen under the header less 128px (700 at
  1440x900) outside the hero.
- **Bleed:** full width only for layers: a section's photograph or ground behind its words
  (`img.layer`, `aria-hidden`, covering 90% or more of the section; the hero holds one layer).
  Never out to one side only: a cut window is cut by its frame inside the `.wrap`. A picture wall
  is `.wall` (gap 0 or 2px), from line to line.
- **Nothing** crosses a section edge, is cut off (no sliced heading, no ellipsis), staggered or
  peeking out behind another, and there is no dead space beside a short text.
- **1024 to 1279:** span-4 cards with a panel go two-up. **640 to 1023** (checked at 820 and 768):
  splits stack text first, panel cards take the full row, no row half empty. Nothing scrolls
  sideways at any width; no swipe rows.

## 5. Type

- **Dealt, never picked:** `start.mjs deal --page <kind>` deals three Google pairings for the
  kind; take the first (the next only when the first clashes with the client's own logo or
  photographs, or the hero's stress test fails `hero-lines`), then `start.mjs css --page <kind>`. A `word` or
  `editorial` hero needs a face with a weight or width axis: deal with `--axis`. Every pairing a
  kind can be dealt, with its exact Google Fonts link: `start.mjs types --page <kind>`.
  `library/type.json` is the one source of every face, weight, tracking and `--ly-scale`: keep the
  `:root` block as start.mjs prints it. (`assets/layout/fonts.html` reads type.json and shows every
  pairing; a hero demo's face is a specimen, not a source.) Load from Google
  Fonts with `display=swap`; a fallback face never shows (`font-load` warns a family that
  never loaded).
- One family, or a display face plus a text face with fixed jobs; never three; at most four font
  files. Never Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Space Grotesk, Plus Jakarta Sans
  or the system look.
- **Weights:** headlines at `--display-weight`, as start.mjs prints it: 400 on product, service and
  place, 500 on tech; size and tight tracking (-0.5% to -4.5% at 40px and up) carry them, never
  bold-and-big. Text 400 and 500 only (labels, buttons, today's row, strong). 600 is loaded for
  one thing, the nav mark's initial tile (`.mark--initial`); a static face (Instrument Serif) sets
  that tile in `var(--display-weight)`. Never 700 or 800 (the letters moment's own 700 aside). No
  light weight under 20px.
- **Sizes** (1440/390): h1 72/38 (the hero; each hero's own token in `heroes.json`), h2 48/30, h3
  and quotes 28/24, lead and card titles 20/18, body 16/26, small 14, labels 13/500 in sentence
  case, a stat 38/28 (`--t-stat`, under the h2). A place: h1 48/53 and 32/37, h2 32/40 and 24/30, names 20/28 and
  18/26, sub-line 20/30 and 18/28, body 16/26, small 14/20, labels 13/16. Each level at least 1.3x
  the next from 1024 (1.2x below); nothing under 13px; lines at most 62 characters.
- Display text of 40px or more outside a grid item counts as a heading; a statement set at h2 size
  is a fault. A footer wordmark may be larger.

## 6. The check

`layout-check.js` reads every section; `check.mjs` runs it in one headless Chrome (WebGL on the CPU,
closed by its own PID) and writes a shot from each section's top:

```bash
node <skill>/assets/layout/check.mjs --url index.html --profile <own dir> \
     --sizes 1440x900,1024x768,820x1180,768x1024,390x844 [--shots <dir>] [--json]     # pass these five: the judges shoot the tablet at 768x1024 and 820x1180
```

| Finding | Means |
|---|---|
| `hero-fold` | the hero does not fill the first screen, runs past it, or the next section shows |
| `hero-maxchars`, `hero-lines` | with the h1 lengthened to its `maxChars`, the hero runs past the screen or the h1 takes too many lines |
| `section-height` | a section stretched past its content: an empty band beyond its padding, or a hole between its parts, a third of its height or more |
| `section-air` | the content of two sections under 128px apart (96 on a phone) |
| `edge-left`, `edge-right`, `spill`, `bleed-one-side`, `one-sided` | a block off the lines, past them, out to one viewport edge, or visuals stopping short of the right line |
| `lines` | text starts on more than two left lines |
| `overflow-x` | the page scrolls sideways |

Run it without `--no-stress`; every finding fails the page. In another script:
`await page.evaluate(src + ';window.lyCheck()')` returns `{ vw, vh, L, R, nav, screen, hero, sections, findings }`.
