---
name: design-taste-frontend
description: >-
  tasteskill 2.5.0, the anti-slop frontend skill. Builds professional company websites at the level
  of figma.com and x.ai: plain copy, one system, one section per screen, equal edges, real
  photographs and real product UI (product renders when there are no photographs), with shader
  effects, scenes and moments only on tech, gaming and software pages, quiet micro-interactions,
  and a checker that enforces it in a real browser. Use this whenever you build, design, redesign,
  restyle, polish or review a landing page, company, product, shop, cafe, hotel, studio, SaaS, AI,
  developer-tool or game site, in any stack (HTML/CSS, React, Next.js, Vue, Svelte, Astro,
  Tailwind), or when the user says a page looks generic, templated or "AI-made".
---

# tasteskill 2.5

Build the website a good company would ship: it says plainly what is sold, shows the real thing on
every screen, and looks made for this client, not from a template and not like an art piece.
figma.com and x.ai are the bar (in words: `layout-v4.md` section 1).

`<skill>` is this folder. It needs Node 22+ and Chrome, Edge or Chromium (ffmpeg optional). Copy `<skill>/assets` into the project's
`assets` and start from `assets/starter.html`.

## House rules

These nine win over everything else in this skill.

1. **No caption or description under any image, render or visual.** Licence credits go in one
   footer line.
2. **Every visual renders, never an empty ground,** at 1440, 1024, 768 and 390.
3. **One section per screen:** the hero alone on the first screen, every section exactly one or
   two screens tall at 1440x900, no second section heading peeking in.
4. **Equal left and right content edges.**
5. **Hover micro-animations:** a linked card lifts 2px, a photo zooms 1.02-1.03 inside its frame,
   buttons step on hover and press on click, underlines draw, card loops cycle in 2.5-4 s, repeat
   and restart on hover. The motion layer does it; never strip or override it. No tilt, carousels
   or timed tabs.
6. **More and better real photographs where they fit;** nicer backgrounds; better heroes, layouts
   and fonts.
7. **Real full-colour icons** (a known product's real icon, never a drawn one); small diagram
   visuals in cards (a hub with branches; one input, a main processor, three parallel lanes;
   pulses running along the lines).
8. **The big award-site scenes and creative moments are part of the skill,** but shader effects
   only where the trade has a technical subject (tech, AI, developer tools, gaming, fintech,
   hardware), never on a local cafe, bakery, guesthouse or shop: those get photographs.
9. **Addresses:** street and district only (no street given: the district), no house number, postcode or coordinates; no register
   or VAT numbers; no phone in a real format; contacts on `.example`.

## 1. The kind of business decides everything

Write the kind on the plan's first line and declare it on the page: the page type on
`<html data-type>` and `<meta name="page-type">` (the same value), and `<meta name="site-kind">`;
a place adds `<meta name="page-kind" content="place">`. The dealers take the last column
(`start.mjs --page`, `moments.mjs --page`), the hero dealer the page type; `consistency.mjs` reads
the metas.

| Brief | page type | site-kind | kind |
|---|---|---|---|
| App, SaaS, AI, developer tool, fintech or banking app, a studio selling its own software | software | software | software |
| A game, a studio launching its game | software | gaming | gaming |
| Hardware or a tech device (a drone, a robot arm, a keyboard) | product | tech | tech |
| Any other physical product or brand (a chair, a bike, coffee beans sold online) | product | other | product |
| People are hired: clinic, law firm, agency, creative studio, trade | service | other | service |
| People come to it: cafe, bar, bakery, restaurant, guesthouse, small hotel, shop, florist, bike shop, gym, local studio | place | other | place |

A maker that also opens its door or teaches (a ceramics studio, a bakery with a web shop) is a
**place**; its web shop becomes the goods section. It is a product only when nothing happens at the door.

"Tech" below means site-kind software, gaming or tech; "other" is everything else. Effects,
scenes, moments, loops, counts, CSS grounds, dark pages and dark heroes are tech only. An other
page is photographs, flat colour, type, real icons and the hover layer.

## 2. The page plan by kind

The full plans, deal lists and section order: `references/sections.md`.

- **Place** (a cafe, bakery, guesthouse, shop). Photographs lead: 12 to 20 on the full page, 8 to
  12 compact, under 8 frames the 3-screen short page, whatever the trade; no client photographs: the draft path
  (`photos.md`), then count. The hero a photograph whenever a frame fits (a remote place: its region's
  landscape), the visit block on screen two, the offer, the place, orders or booking.
  **Variety without effects** (`sections.md` section 4): the offer and the place deal different
  compositions, never two sections round one picture; one type moment (the address or name set large); one main action a screen; list text 16px. Flat grounds, square
  photographs, one button style, the phone bar; no effect, ground, moment, loop, fragment, diagram
  or tab.
- **Product and service** (site-kind other). Photographs lead: the product, the people, the rooms,
  the work, two or more a screen on a product page. Real icons for the tools a studio uses; one
  still diagram at most; flat grounds and one brand band. No shader effect, print, grain, gradient,
  moment, scene or loop; WebGL only for the product render. **A physical product with no
  photographs is shown:** its render (`assets/objects/product-render`, stills) leads the hero,
  then the full product page, never a drawing or mood stock (`sections.md`).
- **Every product page** (photographed or rendered, hardware too; the bar is Figure and 1X;
  `sections.md`, Product): the product **big** where it stands
  whole (most of its frame, or on the ground at anchor scale), never mid-size in a grey rounded
  panel on a grey ground; **a different picture each section**, never one view twice; **every headline promise pictured** (a family bike shows the child bench); dealt
  compositions, no structure twice, one contrasting ground; the **swatch changes the picture**,
  every colour shown once; **no fact twice**; buttons step and press (rule 5).
- **Tech** (software, gaming, hardware). The client's own subject leads at true size. Software: its
  own UI as live HTML showing what it works on (a code-review tool: a red and green diff with its
  Accept action) in one `app-frame`, never a generic dashboard or only fragments on panels; cards:
  fragments on lit panels, pulsing diagrams, real icons. Hardware: its photographs, else its
  render (as above), never a split hero of only an order form or a drawn SVG. A game: its name in
  the h1, a launch line, its world as full-bleed key art (else its render), an effect never in its
  place (`sections.md`, Gaming). **60 to 80 words a screen** outside UI mocks (`copy.md`). By
  deal: **one effect** (a shader ground in the hero or the one `[data-visual]` frame, a WebGL
  part, an object or one big scene) and **one or two moments** in their own sections; four live
  WebGL contexts at most; no card moves with the scroll (`effects-usage.md`).
- **One object never carries the page.** The product or hero object whole leads the hero and **two more sections at
  most**; another kind of visual the brief supports carries the rest (`sections.md` section 1,
  its table): a game's world, crew and map; hardware's use at the bench, an exploded or parts
  view; a still diagram card, a type moment, a context photograph where the trade allows.
- **The client's own assets get slots.** A trailer, key art, screenshots, CAD renders or a motion
  video the brief names each get a frame that reads finished now (a real `<video>` with a kit
  poster, a play control only when there is a page or file to play, three to five world
  captures from the kit, a CAD frame), named in a comment for the client's file, never empty
  (`sections-library.md`, client-slots).

## 3. What serves which page

Open the reference of every asset family the page uses first. A dash means never.

| Need | Asset | Software, gaming | Hardware | Product, service | Place | Reference |
|---|---|---|---|---|---|---|
| Heights, edges, heroes, type | `system.css`, `assets/layout` | dealt hero | dealt hero | dealt hero | place hero | `layout-v4.md` |
| Sections and recipes | `starter.html` | its plan | product plan | its plan | place plan | `sections.md`, `sections-library.md` |
| Tokens, grid, buttons, nav, footer, colour | `system.css`, `system.js` | yes | yes | yes | place tokens | `system.md` |
| Copy, contacts, credits | | yes | yes | yes | yes | `copy.md` |
| Hover, press, focus, nav, tabs | `assets/motion` | yes | yes | yes | yes | `motion.md` |
| Card loops, a count | `assets/motion`, `assets/ui` | yes | yes | - | - | `motion.md`, `cards.md` |
| Photographs | `scripts/photos.mjs` | people, customers; a game's art | lead | lead | lead, 12-20 | `photos.md` |
| Real tool, app and file icons | `scripts/icons.mjs` | yes | yes | tools really used | - | `icons.md` |
| Feature cards, UI fragments | `assets/ui` | lead (gaming: none) | its app | an app the client runs | - | `cards.md` |
| Diagram cards (hub, lanes, pulses) | `assets/diagrams` | 0-2, pulsing | 0-2, pulsing | 0-1, still | - | `diagrams.md` |
| CSS grounds | `assets/backgrounds` | 0-2 dealt | 0-2 dealt | flat tokens | flat tokens | `backgrounds.md` |
| Shader grounds | `assets/effects` | the one effect | the one effect | - | - | `effects-usage.md` |
| Creative parts (`fx-*`) | `assets/components` | yes | yes | `fx-photo` plain, `fx-map` still | `fx-map` still | `effects-creative.md` |
| Objects and prints | `assets/objects` | one, as the effect; a game without art: its render | its render without photographs | its render without photographs | - | `effects-objects.md` |
| Award-site moments | `assets/moments` | 0-2 | 0-2 | - | - | `moments.md` |
| Big scenes | `assets/scenes` | 0-1 | 0-1 | - | - | `scenes.md` |
| Speed and weight | `scripts/perf.mjs` | yes | yes | yes | yes | `perf.md` |

Read `copy.md`, `system.md`, `layout-v4.md` and `sections.md` in full before the first page.

## 4. The run

1. **Read the brief.** Write down the kind (section 1), what is sold, who buys it, the one main
   action (the transaction: Book a room, Order a cake, Start a free trial; a place with neither:
   Get directions) and the real material: logo, screens, photographs, prices, address, hours.

2. **Write all the copy first,** as `copy.md` says: the h1 names the category
   and the buyer or the place (a game: its name and genre), one hard fact on the first screen, a noun in every heading, buttons
   as a verb and an object. Nothing is invented but a coined brand name (searched first, the result
   kept in `names.json` beside the page) and, on a place, plausible hours and prices.

3. **Plan the page as screens.** Line 1: the kind. Line 2: the deal (step 4). Then one line per
   section: its id, its one idea, its picture and its kind (object, use, parts, world, slot, diagram, type; three object lines at most), its
   screens (1 or 2, from its content height, `layout-v4.md` section 2), and on tech which section
   holds the effect, the scene or a moment. Pick the photographs now (`photos.md`); their count,
   stand-ins included, sets a place's length (section 2). Then read `cards.md` and the recipe of
   every id you use in `sections-library.md`.

4. **Deal, never choose by taste.** Each command keeps a history, so pages differ:

   ```bash
   node <skill>/assets/layout/deal.mjs --type <page type> --has <photo,ui,object,film> --history .taste-skill/layout-history.json   # the hero; a game adds --kind gaming, hardware --kind tech
   node <skill>/scripts/start.mjs deal --page <kind> --history .taste-skill/history.json    # three palettes, three pairings; add --axis after a word or editorial hero
   node <skill>/scripts/start.mjs css --page <kind> --palette <id> --type <id> --radius soft --history .taste-skill/history.json
   node <skill>/scripts/start.mjs brand --page place --bg "#.." --ink "#.." --accent "#.." [--surface "#.."] [--muted "#.."] --type <id> --radius soft   # a place: its own colours, in place of css
   node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" <the kind's lists in sections.md>
   ```

   A product, hardware or a game with no photographs or art deals with `--has object`: always the
   `product` hero, its render's widest view across the wrap, no box (a game always passes `--has`). A place's hero is printed, never dealt (`--type
   place`). A dealt part that needs a photograph the page lacks is dealt again (`sections.md` section 2). Take the palette and pairing that suit
   the client (its own colours: `start.mjs brand`, always on a place, with `sections.md` section 4,
   Look); never violet: deal again. Keep the `:root` block as printed. Radius: `sharp` for fintech and developer tools, `soft` by default,
   `round` for consumer apps, square on a place. On tech only: the lit ground (`<html data-ground>`:
   `sand|sky|sage` through the one-liner), the CSS grounds (`backgrounds.md`), the one effect
   (`effects-usage.md`) and the moments (`moments.md`). Write every result on plan line 2 and in
   the comment at the top of `<body>`, and build exactly that (a short page drops what it has no section for: `sections.md` section 4).

5. **Build.** In `starter.html`: set `<html data-type data-radius data-buttons data-motion>` and the
   three metas, the nav class; copy only the `<section class="hero …">` of
   `assets/layout/hero-<id>.html` (never its nav, other sections, footer or credit line; every word
   and picture becomes the client's); move the dealt close and footer out of their `<template>`s
   and delete the rest. Every section is `main > section` with
   one `.wrap`, its h2 first, `--h: 1` or `2`. Build each to its recipe with the system's classes
   and tokens; write page CSS only where a reference says page CSS (inside a visual, `--p-h`,
   `.wall`, `.rail`, `.device`). Paste UI from `assets/ui/<name>/fragment.html` and rewrite every
   name, number and logo to the client's (kit icons become `data-icon`, `cards.md`); a diagram card is `data-diagram="<preset>"`
   with the client's labels; run `icons.mjs scan index.html --out assets/icons --colour` last, so every icon
   the page names is a local file. Mount an effect, object, moment or scene exactly as its
   reference says, never from your own script. Credits: the one footer line from
   `photos.mjs credits`, once the markup uses the photographs (it reads the page).

6. **Check and look.** Only the skill's scripts, each running one headless Chrome with WebGL on the
   CPU, closed by its own PID, one at a time; never a windowed browser or a browser tool.
   Each serves the page file itself over http on 127.0.0.1 (never `file://`), so no server is needed;
   for a built page whose links start at the site root (`/_astro/page.css`), pass `--root` with the build folder (`dist`). Then:

   ```bash
   node <skill>/scripts/consistency.mjs index.html --widths 1440,1024,820,768,390 --rhythm-widths 1440,820,768,390 --profile <dir> --page <kind> --category "<what is sold>" --primary "<main action>"
   node <skill>/assets/layout/check.mjs --url index.html --profile <dir> --sizes 1440x900,1024x768,820x1180,768x1024,390x844 --shots shots/layout
   node <skill>/scripts/shoot.mjs --url index.html --w 1440 --out shots/1440.png --profile <dir>
   node <skill>/scripts/perf.mjs index.html --profile <dir>
   ```

   Shoot 1024, 820x1180, 768x1024 and 390 as well. Every `check.mjs` finding fails the page (no `--no-stress`).
   Fix every FAIL (one you judge false goes in the report with its reason), shoot again, and read
   every screenshot against the checklist.

7. **Report:** the kind, the deal (palette, pairing, hero, grounds, effect, moments, scene); the
   checker, layout and perf results; what you could not check; every assumed price, hour or
   address and the coined name's search; the photographs and art the client must supply, every
   stand-in frame among them; every client slot, its file and its stand-in.

## 5. Checklist

Each line names its checks: `consistency.mjs` ids in brackets, `check.mjs` findings in braces,
`perf.mjs` rows. The last line is for your eyes.

- **First screen:** says what is sold, for whom or where, with one hard fact [copy-headline,
  copy-fact]; the hero fills it alone at every width, its main button inside it [hero-screen,
  hero-fill, fold-action, fold-cut] {hero-fold}.
- **One section per screen:** every section 1 or 2 screens, its h2 first and top-aligned, no
  neighbour's heading or picture in its tile, nothing sparse [section-height, one-section,
  one-heading, section-air, one-screen, section-gaps] {screen-short, screen-height, sparse,
  neighbour, neighbour-ground}.
- **Equal edges:** every block on the `.wrap` lines or the grid's columns, nothing out to one side,
  no sideways scroll [container-edges, row-lines, split-pair, off-grid, right-edge, col-edge,
  spill, off-viewport, stagger, top-stagger] {edge-left, edge-right, spill, bleed-one-side,
  one-sided, lines}.
- **Every visual draws** at 1440, 1024, 768 and 390; a refused effect shows its still fallback
  [visual-empty, empty-visual, gl-fallback, shader-lint, no-visual, photo-weight].
- **No caption** explains, apologises for or labels a picture; credits in one footer line
  [visual-caption, caption, credit-wall, photo-credit]; no placeholder, sample note or printed
  `.example` address [placeholder, sample-label].
- **The right things for the kind:** no effect ground, print, scene or moment outside tech
  (WebGL only for a product render) [effect-kind, effects-fit, photo-print]; the subject itself
  shows: the product big, whole in three sections at most, a new picture each [product-shown,
  same-object, photo-repeat]; each asset the brief names in its slot; a game's name and its world as key art,
  the diff of a code-review tool, software's `app-frame`;
  real photographs where they fit, none twice [photo-set, photo-repeat, photo-upscale]; real icons in their own
  colours; flat grounds on other [grounds]; a place deals two different compositions and one type
  moment.
- **Motion:** every button, link, linked card and linked photograph visibly answers the pointer,
  nothing tilts [motion-layer, hover, hover-move, tilt]; card loops cycle in 2.5-4 s [loop-cycle]; nothing moves because the page scrolled except a dealt moment or the big
  scene inside its own section on tech [scroll-linked, scroll-reveal, pinned: expected only there]; anything
  moving past 5 s has a pause button [loop-pause]; under reduced motion everything rests and nothing
  stays hidden [reduced-motion, hidden-content]; at most four live contexts [webgl].
- **Contacts** as rule 9 [street-number, postcode, coordinates, company-number, phone-number].
- **One system:** one button pair, one card style, one radius scale, one link look [button-styles,
  button-shape, card-family, card-layout, link-styles]; two boxes deep at most [nesting]; one
  heading scale, its faces loaded [heading-scale, font-load]; text contrast [text-contrast,
  contrast].
- **Copy and links:** headings name things, buttons a verb and an object, at most two hero actions
  [copy-headings, copy-buttons, copy-actions, action-count]; one fact, one wording [fact-agree];
  every link lands, forms send [links, forms].
- **Fast:** no FAIL row in `perf.mjs` (image weight, contexts, layout shift).
- **820, 768 and 390:** sections on their screens [section-height], the first screen ending whole
  or on a clear bleed [fold-card] (`layout-v4.md`); splits stack text first, no row half empty; one column at 390, buttons full
  width, a full-screen menu; the place action bar.
- **Your eyes:** beside the figma.com and x.ai frames it reads as a professional company site;
  nothing tilted, staggered, cut or overlapping; the hero is the work, not a mood.

## 6. Never

- A card, row or tile that animates on scroll; a reveal, fade-in or parallax; random blinking.
- Stock photographs passed off as the client's product, people or place; a product page that
  never shows the product.
- A drawn look-alike of a real logo; invented reviews, quotes, customers or figures.
- Violet or lavender in the page's own design: accent, ground, gradient, effect colour or tint (a
  real third-party logo keeps its own colours, `icons.md`).
- Copying a reference site's code, copy, pictures or signature effect.
- Deleting or editing the kit's own files (`assets/`, `scripts/`) to clear a check: a check that
  flags a kit file is reported, and the page is checked again after any change.

## References

All in `references/`; section 3 names the one each asset needs.
