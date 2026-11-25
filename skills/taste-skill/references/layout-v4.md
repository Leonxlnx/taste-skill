# Layout: the first screen, sections and their air, equal edges, heroes, type

The layout spec for every page (house rules 3, 4 and 6). `system.css` implements the tokens, the
section box, the grid and the hero frame; `assets/layout/` holds the heroes (`layout.css`,
`layout.js`, `heroes.json`, `hero-<id>.html`), the hero dealer (`deal.mjs`) and the check
(`layout-check.js`, `check.mjs`). Link `layout.css` after `system.css`, `ui/cards.css`,
`motion/motion.css` and (tech) `backgrounds/backgrounds.css`; load `layout.js` after `system.js`
(`starter.html` does both). Tokens, buttons and the nav: `system.md`.

An optional `.section--pause` doubles the same-ground gap before the turn or close, once per page.

## 1. Air follows the ground

Use the PLAN's ground on each section. Page inherits `--bg`. Tint, inverse and brand use `.ground-surface`, `.ground-inverse` and `.ground-brand`. Adjacent sections may share a ground. The hero stays on its page ground except on tech. The quiet ground deal is in `sections.md`.

The kit sets three distances. These are CSS pixels at regular density.

| Boundary | Desktop | Tablet | Phone |
|---|---:|---:|---:|
| Across a ground change and after the hero | 96 each side | 80 each side | 72 each side |
| Between content on the same ground | 144 total | 128 total | 120 total |
| Thin section padding | 64 each side | 56 each side | 48 each side |

`--padt` and `--padb` use `--air-side`. Between sections of the same ground the kit shortens the next top padding to reach `--air-same`. `.section--thin` uses `--air-thin` on both sides. Set the dealt `data-density` on `html`. Open multiplies air by 1.15, regular by 1 and compact by 0.85. Leave the arithmetic to the kit.

## 2. Sections as tall as their content

A content-led hero may end before the fold. The rest of the page grows to fit the whole menu, all rooms or every question. The shell is `header.nav`, `main`, `footer.closing` and the phone's `nav.actionbar`. Keep popups and floating controls out of it.

```html
<section class="section" id="features"><div class="wrap"> the h2 first, then the content </div></section>
```

On a place page, or a product or service page with four or more photographs, put a photograph against a screen edge after the hero with full bleed, edge-split, colour-half or near. Break up three consecutive sections whose photographs all sit inside the wrap.

- Use one in-flow `.wrap` per section. The h2 comes first, with 16px to its lead. Heading block to content is `--head-gap`, 48px at 1440 and 32px on a phone. Grid gaps are 24px, 12px on a phone.
- On desktop a kit split fills the taller column up to a 2:3 portrait crop. Keep the focal point visible when it crops. Tiles keep `--tile-ratio`, panels `--p-h`. At phone width the stacked picture takes its own ratio.
- Merge short quotes, logo rows and a few words of statement with their subject. For the page's one main claim that can stand alone, use `.section--thin`.
- Start neighbours on the page ground. Change at a new question or task. Use `.section--compact` for a short continuation (48px desktop and 32px phone). Use a rule to separate list rows inside the wrap. A tinted box behind the heading cannot replace the section ground.
- `footer.closing > .wrap` holds the close above the links and legal row. Its bottom padding is 64px plus the phone bar.
- A composed section can hold one sticky element when the section is at most 2.5 screens tall (`compose.md`). Keep normal scrolling. A pinned kit moment or scene holds at most half a screen per chapter, up to three chapters. A one-sentence scene gets at most one screen in total (`moments.md`, `scenes.md`).

## 3. The hero

- **The first screen.** Content-led heroes occupy 72–100svh. Large pictures and product windows fill the available screen. Keep the next heading or action whole if it appears at load.
- **Content.** The h1, lead and at most two buttons (one main action on a place). Use the client's subject for the picture. For a place taking dated reservations for stays, tables or classes, dock `.hero-book` at the foot of the hero's wrap. Include dates or day, guests, room or time, the “from” price and the main button. Carry the choices to the full closing form.
- **Heading and terms.** Stack the headline, lead, action and one supplied offer line. Check the heading at 390. A still, dismissible `.service-notice` may sit above the nav links for one service fact, change or deadline from the brief. Use the starter’s optional notice with its source. Leave it out for marketing copy.
- **Product window.** Under a centred headline the complete product window always uses `.hero--peek`. On a split dealt with `.hero--peek` (software, gaming or tech), the hero's own window may continue below the fold. At 1440×900 at least 420px of it shows and its full height is at most 760px. Keep the next section below it. For an ordinary hero keep the picture whole or use the deliberate bleed below.
- In a work-led software hero the actual window fills 85–100% of the wrap, with at most 40px of stage on either side. Aim for its top at y350–480 at 1440×900 when the copy allows. Use data-work-window on a split or collage to put the view under its heading.
- A shop selling several kinds can put up to three linked picks under its buttons. Each .hero-picks link carries a small picture, name and price and lands on the item’s section. The hero may extend past the fold by the height of that row.
- **Standard heroes at 768 and 820.** The split stacks: the words, then the picture in what is
  left. Its bottom edge ends on a whole element or clearly bleeds a large picture on purpose:
  - whole: the picture (a fragment, a phone, a render) ends 24px or more above the hero's foot;
  - a bleed: a photograph or ground filling its frame (`.frame--photo`, `object-fit: cover`), or a
    fragment in `.frame > .stage` cut by the frame's bottom through 96px or more of its rows under
    `.stage--fade-b`, the point (the comment, the button, the row worked on) above the fade.
  Avoid accidental cuts through a card or control. A dealt peek keeps the window inside the hero as it extends below the fold. Below 1024 `.at-over` pieces hide; give the main piece a `.fit` width
  (it narrows), never a fixed one. Shoot 820x1180 and 768x1024 and read the first screen's foot.
- **Offer terms.** Put price, delivery, limits or eligibility in a 16px `.terms` line touching its action group. Inspect the first 390×844 crop for the specific part, room, plate or working record sold. Only independent supplied proof or dated inventory merits a separate row. A phone booking action links to the full form.
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

Deal the hero from the page kind and the available material:

```bash
node <skill>/assets/layout/deal.mjs --type software|product|place|service [--kind gaming|tech] --has photo,ui,film,object,setting --history .taste-skill/layout-history.json
```

Use the page type from the PLAN. Gaming uses software with `--kind gaming`, hardware uses product with `--kind tech`. Pass assets the client actually supplied. A film hero needs a film. Without a product photo, art or film, hardware gets a split for its built view. An edge-to-edge product stage needs the product photograph or a drawing that shows it. Without game art, fill the dealt hero with the built world. For a place, use the dealt form below.

It prints the hero (its demo, numbers, and the moment, ground and effect ids that fit the kind; on
other only the hero itself counts). Copy only its `<section class="hero …">` from
`assets/layout/hero-<id>.html`: each file is a whole demo page, and its nav, other sections, footer
and credit line (which names photographers, against `copy.md` Credits) never come with it;
`hero-place.html`'s latte close-up is a demo, never the place hero. `word` and `statement` are
dealt only without a strong photograph.

| id | composition at 1440 | at 390 | its motion |
|---|---|---|---|
| `split` | text span-7; the picture span-5 start-8, top-aligned with the h1, ending on the right line; one opaque float card on its lower left | text, then the picture (at least 240 tall) | the float card's dot (tech) |
| `photo` | One full-screen image with the copy grouped on its calm side | Picture above the group | none |
| `product` | One copy stack, then the whole object or product window | Keep the bought part visible at 390 | none |
| `editorial` | the headline is the picture: 64px across the wrap, one or two photographs set in the line as pills | 36px | the pills open once on load (tech); still elsewhere |
| `collage` | work-led copy above a wrap-wide stock window, with a compact order result alongside its rows | the window alone | one card loop (tech) |
| `word` | One stable display heading, its lead and action | Keep the heading readable | none |
| `film` | a cinema frame on the lines holding the poster, h1 white on a calm part, the play disc at its foot | the frame, then the words | plays on a click |
| `statement` | A brief statement with its lead and action | One reading group | none |
| `triptych` | Three separate subjects in the exhibit, one action beneath the lead | Copy and button before the exhibit | Pause inside moving media |
| `centred` | pill, centred h1 64 with the mark inline, lead, two pill buttons, then the complete product window in flow, on a neutral matte across the wrap | the window less its list column | the window's story (tech) |

Keep one h1 within the hero's `maxChars` (`heroes.json`). Protect the action and the subject at the phone crop. Follow `photos.md` for type over pictures and `copy.md` for fact lines.

### The place hero

On a photo-led place page the picture leads the first screen, in the form `deal.mjs
--type place` deals (`data-form` on `<section class="hero hero--place">`, layout.css 0b; the
markup is the same for all five, so only the attribute changes). In testing every place had the
same band hero with 120 to 200px of empty ground under its words; two cafes could not be told apart.
It enters once on load like every hero (`motion.md`, The hero's entrance).

| form | at 1440 | at 390 |
|---|---|---|
| `band` | the photograph under the header down to the words, which end 64px above the fold (h1 on columns 1–8, the line and the button from the split line); nothing on the photograph | the photograph, then the words (as below) |
| `bleed` | the photograph over the whole screen; the h1, the line and the button on a solid panel of the page ground (68% wide, 48px inside) in its lower left corner, `data-corner="end"` for the right one when the calm side is right | the photograph, then the words on the ground |
| `foot` | Full-screen photograph, h1 at 56–64px, one line and action starting at x80 and ending about 72px above the fold. Use a calm lower left with 4.5:1 text contrast, or fall back to bleed. The bottom scrim reaches 35% across the lowest 40%. | Same composition with a 36–40px h1. Check contrast on this crop too. |
| `split` | the words on seven columns (title, lead and action grouped at the top, with 24px and 32px gaps), the photograph on five, from 120px under the header to the hero's foot | as band |
| `name` | band, with the name or the street set large across the `.wrap` first in `.hero__text` (`<p class="hero__name">Henderson Street</p>`, up to 160px): the page's one type moment | the name at 44 to 72px |

- At 1440 the photograph fills what the words leave. The place h1 uses the pairing’s display size, 64px at 1440 and 36px at 390. Longer titles take the smaller size. Keep it to two lines at 1440 and three on the phone, with the sub-line and one main action. Leave room for the booking bar when dealt.
- A shop or bookshop may take a letterbox inside the column instead: 1280 x 538, 24px under the
  header (`--photo: 528px`).
- On tablet and phone, stack the copy and controls. Use the phone crop and the kit's fluid display size. At 390 show one link to the full booking form at the close. A service enquiry uses one enquiry action.
- Show the room from the door, the counter in use, flowers in the shop, or the landscape the brief locates. See `photos.md` for choosing and cropping the picture. Keep the visit details high on the page.

On a phone, a product or hardware split with offer facts keeps its lead, action and price or dispatch line together beside or above the picture. At 390×844 show the object the buyer receives, its connection to the host for an accessory, and its offer within the first 844px.

## 4. Equal edges and the grid

- **One `.wrap`** for the header, every section and the footer: `width: min(100% - 2 * var(--gut),
  1280px)`. Lines at x 80 and 1360 at 1440 for every kind, x 24 and 366 at 390.
  The same all the way down.
- **12 columns, 24px gutter** (12 on a phone). Column starts at 1440: 80, 189, 297, 406, 515, 623,
  732, 841, 949, 1058, 1167, 1275; spans 3 = 302, 4 = 411, 5 = 519, 6 = 628, 7 = 737. On a phone one 342 column or two 165 tiles 12 apart; nothing narrower than 165.
- **Every block starts on the left line or a column start,** and every block that ends on the right
  ends on a column end, the last on the right line. Anything wider than half the `.wrap` runs the
  full `.wrap`. Card rows (6+6, 4+4+4, 3+3+3+3): the first card on the left line, the last on the
  right, all one height, every row full. Text inside a card or visual is not a page line.
- **Text lines.** Align the left column to the wrap and the right to a column start. Keep repeated splits on a common line. Follow the PLAN for heading alignment: left throughout or centred on proof and close. The centred hero uses its own axis.
- **Splits.** Align the tops. Keep text first on a phone, including a mirrored composition. A filled panel may pad its text 48px. In an own section use the column lines that fit the content (`compose.md`).
- **Pictures:** a photograph spans 0 to the viewport as a layer, or starts and ends on the column
  lines (628, 411, 302 wide), one ratio per row (4:5, 4:3, 3:2 or 1:1; a place
  4:5, 4:3, 1:1). No photograph taller than the screen under the header less 128px (700 at
  1440x900) outside the hero.
- **Bleed:** full width only for layers: a section's photograph or ground behind its words
  (`img.layer`, `aria-hidden`, covering 90% or more of the section; the hero holds one layer).
  The edge-split and colour-half photographs reach one side. A near stack leaves 8px at each edge. A cut window stays inside the `.wrap`. A picture wall
  is `.wall` (gap 0 or 2px), from line to line.
- Keep words, controls and focus rings inside the section. Pictures can overlap within their frame if the subject still reads at 390.
- **1024 to 1279:** span-4 cards with a panel go two-up. **640 to 1023** (checked at 820 and 768):
  splits stack text first, panel cards take the full row, no row half empty. The page stays inside the viewport. A captioned item-row scrolls within its own width on phones.

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
  place, 500 on tech; size and tight tracking (−0.012em by default, at least −0.02em) carry them, never
  bold-and-big. Text 400 and 500 only (labels, buttons, today's row, strong). 600 is loaded for
  one thing, the nav mark's initial tile (`.mark--initial`); a static face (Instrument Serif) sets
  that tile in `var(--display-weight)`. Never 700 or 800 (the letters moment's own 700 aside). No
  light weight under 20px.
- **Quiet sizes at 1440 and 390.** H1 64/36, H2 40/28, H3 and item titles 20/18 at weight 500, lead 18/16, body 16, nav 14 and buttons 15. H2 tracking is −0.008em, H3 tracking zero. Set the headline across at least 54% of the wrap. A title of 45 characters or fewer fits two desktop lines. Use up to 80px for at most 20 characters or 48px for long titles. Leave 120px below the nav at desktop and 72px on phone, or centre the copy against its picture.
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
| `hero-fold` | the hero misses its height range, a product peek exceeds its allowance, or the fold cuts the next heading or action |
| `hero-maxchars`, `hero-lines` | with the h1 lengthened to its `maxChars`, the hero runs past the screen or the h1 takes too many lines |
| `section-height` | a section stretched past its content: an empty band beyond its padding, or a hole between its parts, a third of its height or more |
| `section-air` | content in adjacent sections is closer than 72px at 1440 or 56px on a phone |
| `empty-band` | an empty stretch exceeds 280px at 1440 or 200px on a phone, without a ground change, picture or moment |
| `edge-left`, `edge-right`, `spill`, `bleed-one-side`, `one-sided` | a block off the lines, past them, out to one viewport edge, or visuals stopping short of the right line |
| `lines` | text starts on more than two left lines |
| `overflow-x` | the page scrolls sideways |

The air limits above are for regular density. The checker scales them with `--density`.

Run it without `--no-stress`; every finding fails the page. In another script:
`await page.evaluate(src + ';window.lyCheck()')` returns `{ vw, vh, L, R, nav, screen, hero, sections, findings }`.
