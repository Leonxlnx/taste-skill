---
name: design-taste-frontend
description: >-
  tasteskill 2.5.0, the anti-slop frontend skill. Builds professional company websites at the
  figma.com and x.ai level: plain copy, one system, one section per screen, equal edges, real
  photographs, real brand icons and real product UI, with shader effects, creative moments and
  scroll scenes kept only for tech and gaming pages, checked in a real browser. Use this whenever
  you build, design, redesign, restyle, polish or review a landing page, company, product, shop,
  cafe, hotel, studio, SaaS, AI, developer-tool or game site, in any stack (HTML/CSS, React,
  Next.js, Vue, Svelte, Astro, Tailwind), or when the user says a page looks generic, templated or
  "AI-made" and asks to make it look designed and professional.
---

# tasteskill 2.5.0

Build the website a good company would ship: it says plainly what is sold, shows the real thing on
every screen, and looks made for this client, not from a template and not like an art piece.
figma.com and x.ai are the bar (the look in words: `references/layout-v4.md` section 1). The judge
asks one question:
does this read as a professional, clean site made for this client, with real pictures and plain
words, and nothing added only to look less machine-made?

`<skill>` is this folder. It needs Node 22+ and Chrome. Copy `<skill>/assets` into the project's
`assets` and start from `assets/starter.html`.

## Leon's rules

These nine win over everything else in this skill.

1. **No caption or description under any image, render or visual.** Licence credits go in one
   footer line.
2. **Every visual renders, never an empty ground,** at 1440, 1024, 768 and 390.
3. **One section per screen:** the hero alone on the first screen, every section exactly one or
   two screens tall at 1440x900, no second section heading peeking in.
4. **Equal left and right content edges.**
5. **Hover micro-animations:** a linked card lifts 2px, a photo zooms 1.02-1.03 inside its frame,
   buttons step and press, underlines draw, card loops cycle in 2.5-4 s, repeat and restart on
   hover. No tilt, carousels or timed tabs.
6. **More and better real photographs where they fit;** nicer backgrounds; better heroes, layouts
   and fonts.
7. **Real full-colour icons** (a known product's real icon, never a drawn one); small diagram
   visuals in cards (a hub with branches; one input, a main processor, three parallel lanes;
   pulses running along the lines).
8. **The big award-site scenes and creative moments are part of the skill,** but shader effects
   only where the trade has a technical subject (tech, AI, developer tools, gaming, fintech,
   hardware), never on a local cafe, bakery, guesthouse or shop: those get photographs.
9. **Addresses:** street and district only, no house number, postcode or coordinates; no register
   or VAT numbers; no phone in a real format; contacts on `.example`.

## 1. The kind of business decides everything

Write the kind on the plan's first line and declare it on the page, one convention: the page type
on `<html data-type>` and `<meta name="page-type">` (the same value), and `<meta name="site-kind">`;
a place adds `<meta name="page-kind" content="place">`. The dealers take the word in the last
column (`start.mjs --page`, `moments.mjs --page`), the hero dealer the page type; `consistency.mjs`
reads the metas.

| Brief | page type | site-kind | kind |
|---|---|---|---|
| App, SaaS, AI, developer tool, fintech or banking app, a studio selling its own software | software | software | software |
| A game, a studio launching its game | software | gaming | gaming |
| Hardware or a tech device (a drone, a robot arm, a keyboard) | product | tech | tech |
| Any other physical product or brand (a chair, a bike, coffee beans sold online) | product | other | product |
| People are hired: clinic, law firm, agency, creative studio, trade | service | other | service |
| People come to it: cafe, bar, bakery, restaurant, guesthouse, small hotel, shop, florist, bike shop, gym, local studio | place | other | place |

"Tech" below means site-kind software, gaming or tech; "other" is everything else. Effects,
scenes, moments, loops, counts, CSS grounds, dark pages and dark heroes are tech only. An other
page is photographs, flat colour, type, real icons and the hover layer.

## 2. The page plan by kind

The full plans, deal lists and section order: `references/sections.md`.

- **Place** (a cafe, bakery, guesthouse, shop). Photographs lead every section: 12 to 20 on the
  full page, 8 to 12 on the compact page, under 8 the 3-screen short page. The place hero (a
  full-bleed photograph with nothing on it, the words on the ground below), the visit block on
  screen two, the offer as text beside photographs, the place, orders or booking, the footer.
  Flat grounds in the place's colours, square photographs, one button style, the phone action
  bar; no effect, CSS ground, moment, scene, loop, count, UI fragment, diagram, tab or accordion;
  nothing moves except under the pointer. No client photographs: the draft path (`photos.md`),
  each frame a stand-in in the report, never on the page. The rest: `sections.md` section 4 and
  the Place recipes.
- **Product and service** (site-kind other). Photographs lead: the product, the people, the rooms,
  the work, two or more a screen on a product page. Real icons for the tools a studio uses; one
  still diagram at most; flat grounds and one brand band. No shader, WebGL, print, grain, gradient,
  moment, scene or loop. A product with no photographs follows the shot ladder (`photos.md`), never
  a stand-in or a drawing.
- **Tech** (software, gaming, hardware). The client's own subject leads at true size. Software: its
  UI as live HTML showing what the product works on (a code-review tool: a red and green diff with
  its Accept action, never a generic dashboard). Hardware: its photographs or the client's render;
  without either, the `split` hero with its order form as live HTML, never `hero-product` without
  the object, a drawn SVG or a model of primitives. A game: the game itself (trailer, key art,
  in-engine shots) in the hero and the world sections; art the brief names but does not supply
  becomes a `statement` hero with the effect as full-bleed key art, never UI widgets: no UI kit on
  gaming (`sections.md`, Gaming). Feature cards hold UI fragments on lit panels, pulsing diagram
  cards, real icons in colour. On top, by deal: **one effect** (a live shader ground in the hero or
  the one `[data-visual]` frame, a WebGL part, an object or one big scene) and **one or two section
  moments** that may follow the scroll inside their own section. At most four live WebGL contexts;
  no card ever moves with the scroll. Budgets and gates: `effects-usage.md`.

## 3. What serves which page

Use the asset family the table names for the kind and open its reference first. A dash means never.

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
| Objects and prints | `assets/objects` | one, as the effect | a render of its own kind, else none | - | - | `effects-objects.md` |
| Award-site moments | `assets/moments` | 0-2 | 0-2 | - | - | `moments.md` |
| Big scenes | `assets/scenes` | 0-1 | 0-1 | - | - | `scenes.md` |
| Speed and weight | `scripts/perf.mjs` | yes | yes | yes | yes | `perf.md` |

Read `copy.md`, `system.md`, `layout-v4.md` and `sections.md` in full before the first page.

## 4. The run

1. **Read the brief.** Write down the kind (section 1), what is sold, who buys it, the one main
   action (the transaction: Book a room, Order a cake, Start a free trial; a place with neither:
   Get directions) and the real material: logo, screens, photographs, prices, address, hours.

2. **Write all the copy first,** in a plain text file, as `copy.md` says: the h1 names the category
   and the buyer or the place, one hard fact on the first screen, a noun in every heading, buttons
   as a verb and an object. Nothing is invented but a coined brand name (searched first, the result
   kept in `names.json` beside the page) and, on a place, plausible hours and prices. No invented
   quotes, reviews, customers or figures. Contacts as rule 9 says.

3. **Plan the page as screens.** Line 1: the kind. Line 2: the deal (step 4). Then one line per
   section: its id, its one idea, its picture (photograph, UI, diagram, real icons, the effect), its
   screens (1 or 2, from its content height, `layout-v4.md` section 2), and on tech which section
   holds the effect, the scene or a moment. Pick the photographs now (`photos.md`; a place without
   its own takes the draft path): 8 to 12 usable, stand-ins included, make the compact page, under 8
   the short page. Then read `cards.md` and the recipe of every id you use in `sections-library.md`.

4. **Deal, never choose by taste.** Each command keeps a history, so pages differ:

   ```bash
   node <skill>/assets/layout/deal.mjs --type <page type> --has <photo,ui,object,film> --history .taste-skill/layout-history.json   # the hero; a game adds --kind gaming
   node <skill>/scripts/start.mjs deal --page <kind> --history .taste-skill/history.json    # three palettes, three pairings; add --axis after a word or editorial hero
   node <skill>/scripts/start.mjs css --page <kind> --palette <id> --type <id> --radius soft --history .taste-skill/history.json
   node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" <the kind's lists in sections.md>
   ```

   Printed, never dealt: a place's hero (`--type place`), a game with no art files (`--kind gaming
   --hero statement`), a product's short page (`--type product --hero statement`), hardware with
   no photographs or render (`--type product --hero split`). Take the palette and pairing that suit
   the client (its own colours: `start.mjs brand`, always on a place, with the tokens of
   `sections.md` section 4, Look); never violet, deal again. Keep the `:root` block as printed
   (`library/type.json` is the one source of faces). Radius: `sharp` for fintech and developer
   tools, `soft` by default, `round` for consumer apps, square on a place. Then, on tech only: the
   lit ground (`<html data-ground>`: `sand|sky|sage` through the one-liner), the CSS grounds (`backgrounds.md`), the one effect (a live ground, a WebGL part, an
   object or the big scene: `effects-usage.md`) and the moments (`moments.md`). Write every result
   on plan line 2 and in the comment at the top of `<body>`, and build exactly that.

5. **Build.** In `starter.html`: set `<html data-type data-radius data-buttons data-motion>` and the
   three metas, the nav class; copy only the `<section class="hero …">` of
   `assets/layout/hero-<id>.html` (never its nav, other sections, footer or credit line; every word
   and picture becomes the client's); move the dealt close and footer out of their `<template>`s
   and delete the rest. Every section is `main > section` with
   one `.wrap`, its h2 first, `--h: 1` or `2`. Build each to its recipe with the system's classes
   and tokens; write page CSS only where a reference says page CSS (inside a visual, `--p-h`,
   `.wall`, `.rail`, `.device`). Paste UI from `assets/ui/<name>/fragment.html` and rewrite every
   name, number and logo to the client's (each `<img src="icons/x.svg">` becomes `<img
   data-icon="<id>" src="assets/icons/<id>.svg">`); a diagram card is `data-diagram="<preset>"`
   with the client's labels; run `icons.mjs scan index.html --out assets/icons` last, so every icon
   the page names is a local file. Keep the motion layer (`motion.md`); if a check complains about
   it, fix the markup, not the layer. Mount an effect, object, moment or scene exactly as its
   reference says, never from your own script.
   Credits: the one footer line from `photos.mjs credits`.

6. **Check and look.** Only the skill's scripts, each running one headless Chrome with WebGL on the
   CPU, closed by its own PID, one at a time; never a windowed browser or a browser tool. Serve the
   page on a free local port, then:

   ```bash
   node <skill>/scripts/consistency.mjs <url> --widths 1440,1024,768,390 --profile <dir> --page <kind> --category "<what is sold>" --primary "<main action>"
   node <skill>/assets/layout/check.mjs --url <url> --profile <dir> --sizes 1440x900,1024x768,768x1024,390x844 --shots shots/layout
   node <skill>/scripts/shoot.mjs --url <url> --w 1440 --out shots/1440.png --profile <dir>
   node <skill>/scripts/perf.mjs <site/index.html> --profile <dir>
   ```

   Shoot 1024, 768 and 390 as well. `check.mjs` runs without `--no-stress` and every finding fails
   the page. Fix every FAIL (one you judge false goes in the report with the reason), shoot again,
   and read every screenshot against the checklist, with figma.com and x.ai as the bar, until
   every line holds.

7. **Report:** the kind, the deal (palette, pairing, hero, grounds, effect, moments, scene); the
   checker, layout and perf results; what you could not check; every assumed price, hour or
   address and the coined name's search; the photographs and art the client must supply, every
   stand-in frame among them.

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
- **The right things for the kind:** no WebGL, effect ground, print, scene or moment outside tech
  [effect-kind, effects-fit, photo-print]; the subject itself shows: the product [product-shown],
  a game's world, the diff of a code-review tool; real photographs where they fit, none twice
  [photo-set, photo-repeat, photo-upscale]; real icons in their own colours; flat grounds on other
  [grounds].
- **Motion:** every button, link and linked card answers the pointer, nothing tilts [motion-layer,
  hover, hover-move, tilt]; card loops cycle in
  2.5-4 s [loop-cycle]; nothing moves because the page scrolled except a dealt moment or the big
  scene inside its own section on tech [scroll-linked, scroll-reveal, pinned: a finding inside the
  dealt `[data-moment]` or `[data-big-scene]` section is expected, any other is a fault]; anything
  moving past 5 s has a pause button [loop-pause]; under reduced motion everything rests and nothing
  stays hidden [reduced-motion, hidden-content]; at most four live contexts [webgl].
- **Contacts** as rule 9 [street-number, postcode, coordinates, company-number, phone-number].
- **One system:** one button pair, one card style, one radius scale, one link look [button-styles,
  button-shape, card-family, card-layout, link-styles]; two boxes deep at most [nesting]; one
  heading scale [heading-scale]; text contrast [text-contrast, contrast].
- **Copy and links:** headings name things, buttons a verb and an object, at most two hero actions
  [copy-headings, copy-buttons, copy-actions, action-count]; one fact, one wording [fact-agree];
  every link lands, forms send [links, forms].
- **Fast:** no FAIL row in `perf.mjs` (image weight, contexts, layout shift).
- **768 and 390:** splits stack text first, no row half empty; one column at 390, buttons full
  width, a full-screen menu; the place action bar.
- **Your eyes:** measured against figma.com and x.ai it reads as a professional company site;
  plain copy; nothing tilted, staggered, cut or overlapping; the hero is the work, not a mood.

## 6. Never

- A card, row or tile that animates on scroll; a reveal, fade-in or parallax; random blinking.
- Shader effects, prints, dither, grain, gradients or WebGL on a page whose trade is not
  technical; an effect where a photograph belongs.
- Stock photographs passed off as the client's product, people or place.
- A caption under a visual; a drawn look-alike of a real logo; invented reviews, quotes, customers
  or figures.
- Violet or lavender in the page's own design: accent, ground, gradient, effect colour or tint (a
  real third-party logo keeps its own colours, `icons.md`).
- Copying a reference site's code, copy, pictures or signature effect.

## References

| File | What it holds |
|---|---|
| `copy.md` | Plain copy, what may be assumed, contacts, credits |
| `system.md` | Tokens, grid, type, colour, buttons, nav, footer, forms |
| `layout-v4.md` | Screens, edges, splits, the heroes, type |
| `sections.md` | The plans by kind, the deal lists, the place plan and its numbers |
| `sections-library.md` | The recipe of every section id, place recipes included |
| `cards.md` | Feature cards, panels, fragments, card grounds and loops |
| `motion.md` | Every hover, press, loop and reduced-motion number |
| `backgrounds.md` | The three ground tokens, the brand band, the tech CSS grounds |
| `effects-usage.md` | The effect gate, budget and deals |
| `effects-creative.md` | The creative parts (`fx-*`) |
| `effects-objects.md` | Objects and prints |
| `moments.md`, `scenes.md` | Award-site moments and big scenes |
| `photos.md`, `icons.md`, `diagrams.md` | Photographs, real icons, diagram cards |
| `perf.md` | The speed budget |
