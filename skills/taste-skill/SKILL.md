---
name: design-taste-frontend
description: >-
  tasteskill 2.5.4, the anti-slop frontend skill. Builds professional company websites at the level
  of figma.com and x.ai: plain copy written from a fact sheet and a voice card first, one system, a
  clean first screen, air in a clear rhythm, equal edges, and sections composed for their content
  (a timeline for a timeline product, a booking bar for a stay) on a dealt frame, so pages differ.
  Pictures show the thing itself: real photographs, the product's own UI, drawings and charts made
  in code. Motion is quiet, with one or two set pieces dealt by fit. Small
  sub-skills handle single jobs (a mascot, an illustration, a logo mark, a chart, photo direction),
  and a checker and finish gate hold it in a real browser. Use this whenever you build or
  design a landing page, company, product, shop, cafe, hotel, studio, SaaS, AI, developer-tool or
  game site, as static HTML/CSS or inside an existing React, Next.js, Vue, Svelte, Astro or
  Tailwind project, or when the user says a page looks generic, templated or "AI-made".
hooks:
  Stop:
    - hooks:
        - type: command
          command: 'for f in ${CLAUDE_SKILL_DIR:+"$CLAUDE_SKILL_DIR/scripts/gate.mjs"} ${CLAUDE_PLUGIN_ROOT:+"$CLAUDE_PLUGIN_ROOT/scripts/gate.mjs" "$CLAUDE_PLUGIN_ROOT/skills/taste-skill/scripts/gate.mjs"} ${CLAUDE_PROJECT_DIR:+"$CLAUDE_PROJECT_DIR/.claude/skills/design-taste-frontend/scripts/gate.mjs" "$CLAUDE_PROJECT_DIR/.agents/skills/design-taste-frontend/scripts/gate.mjs"} ${HOME:+"$HOME/.claude/skills/design-taste-frontend/scripts/gate.mjs" "$HOME/.agents/skills/design-taste-frontend/scripts/gate.mjs"}; do if [ -f "$f" ]; then exec node "$f" --hook claude; fi; done; if [ -d .taste-skill ]; then printf "%s gate.mjs not found; CLAUDE_SKILL_DIR=%s CLAUDE_PLUGIN_ROOT=%s CLAUDE_PROJECT_DIR=%s HOME=%s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${CLAUDE_SKILL_DIR-}" "${CLAUDE_PLUGIN_ROOT-}" "${CLAUDE_PROJECT_DIR-}" "${HOME-}" > .taste-skill/gate-hook-missing.txt 2>/dev/null; fi; for d in .taste-skill */.taste-skill; do if [ -f "$d/build.json" ]; then echo "tasteskill gate: gate.mjs not found (CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT-}); the build in $d is not checked" >&2; break; fi; done; exit 0'
          timeout: 600
---

# tasteskill 2.5

Build the website a good company would ship: it says plainly what is sold, shows the real thing on
every screen, and looks made for this client, not from a template and not like an art piece.
figma.com and x.ai are the bar (in words: `layout-v4.md`).

`<skill>` is this folder. It needs Node 22+ and Chrome, Edge or Chromium (ffmpeg optional).

**How it works.** The skill deals the frame, you compose the content, the kit holds the floor.

- **The frame is dealt**, so two pages never come out alike and none falls back on a model's
  habits: palette, type pairing, hero, entrance, nav, footer, close, buttons, mark, the rhythm of
  grounds, the density (step 4). Build the frame as dealt.
- **The content is yours.** Every section takes the form its content asks for: a timeline for a
  timeline product, a booking bar for a stay, a slider over the plans, a comparison as two bars,
  the product's own screen built large. A dealt photo composition is only for content that is
  photographs with words. `compose.md` is the method; the plan's idea seeds push pages apart.
- **The kit is the floor:** `assets/starter.html` and the kit carry the type scale, the spacing,
  the grid and edges, the nav and the phone menu, forms, the hero entrance, reveals, hover and
  press. Every page is built in a copy of the starter with the kit copied into `assets`; the finish
  gate fails a page built without it.
- **The gate checks it in a real browser** and blocks what is broken (step 6).

## House rules

These nine win over everything else in this skill.

1. **No caption that explains, apologises for or labels a picture.** A work, project, room or
   product may carry one fact line (`.fact-line`: name, place, size, year or price, 60 characters
   at most). Licence credits go in one footer line.
2. **Every visual renders, never an empty ground,** at 1440, 1024, 768 and 390, and every section
   is complete and correct without script: a counter shows its final number, nothing waits hidden.
3. **The hero alone on the first screen** (its own product window or one row of up to three linked shop picks may run past the fold, nothing
   of the next section shows at load), **then air in a clear rhythm:** more across a change of
   ground, less between two sections on the same ground, least round a short block. The tokens do
   it (`layout-v4.md` section 1); never set a section's height or padding yourself. Grounds carry
   the rhythm: follow the dealt pattern, never one flat ground from top to bottom.
4. **Equal left and right content edges.**
5. **Quiet motion everywhere, set pieces only where the content carries them.** The motion layer
   gives every control a hover and a press, every hero its dealt entrance, every section its
   reveal; never strip or override it. One dealt moment a page (a second from seven sections), a
   scene on about one page in three, none where nothing fits. No tilt (a lively or loud page's
   stickers excepted), no carousel or tab that moves by itself, no section that only animates words.
6. **Show the thing itself.** In this order: the client's own pictures; a picture built for this
   page (the product's UI as live HTML, a drawing of the product or its world in one style, a
   chart from believable data); a stand-in photograph only where its subject is right (a
   landscape, a material, a street, hands at work, a room of the right kind). Never another
   maker's product, never a detail standing for the whole, never a mood picture beside a price.
7. **Real full-colour icons** (a known product's real icon, never a drawn look-alike); small
   diagram visuals in cards (`diagrams.md`).
8. **At least two sections are your own design for this content** (one on a page under six
   sections), marked `data-own`. What the brief names becomes an element on the page, never a
   mailto in its place, and the main action comes early: a booking bar on the hero for a stay or a
   table, the order within the first three sections for a shop.
9. **Addresses:** street and district only (no street given: the district), no house number,
   postcode or coordinates; no register or VAT numbers; no phone in a real format; contacts on
   `.example`.

## 1. The kind of business

Write the kind on the plan's first line and declare it on the page: the page type on
`<html data-type>` and `<meta name="page-type">` (the same value), and `<meta name="site-kind">`;
a place adds `<meta name="page-kind" content="place">`. The dealers take the last column.

| Brief | page type | site-kind | kind |
|---|---|---|---|
| App, SaaS, AI, developer tool, fintech or banking app, a studio selling its own software | software | software | software |
| A game, a studio launching its game | software | gaming | gaming |
| Hardware or a tech device (a drone, a robot arm, a keyboard) | product | tech | tech |
| Any other physical product or brand (a chair, a bike, coffee beans sold online) | product | other | product |
| People are hired: clinic, law firm, agency, creative studio, trade | service | other | service |
| People come to it: cafe, bar, bakery, restaurant, guesthouse, small hotel, shop, florist, bike shop, gym, local studio | place | other | place |

A maker that also opens its door or teaches (a ceramics studio, a bakery with a web shop) is a
**place**; its web shop becomes the goods section. It is a product only when nothing happens at
the door. "Tech" below means site-kind software, gaming or tech; "other" is everything else.

What each kind leads with (the full plans: `sections.md` section 3):

- **Software:** its own UI as live HTML showing what it works on, the central view built large, real tool icons, a chart
  where the copy holds a figure. Never a generic dashboard.
- **Gaming:** the game's name and its world. With the client's art, that art everywhere; without
  it, the world drawn in one style (`subskills/illustrate`), never a stock coastline in its place.
- **Tech hardware and products:** the product big and whole, a different view each section, every
  headline promise pictured; with no photograph, a drawing of the product and its output before a
  stand-in of something else.
- **Service:** the work as cases with a fact line each, the process with what the client gets at
  each step, what it costs, who does it.
- **Place:** photographs of the place and what it serves, the visit (street, hours) on screen
  two, the offer, the booking or order as real fields.
- **Shader grounds, WebGL effects and dark pages are tech only.** A place, service or product
  page takes none (`effects-usage.md`); its richness comes from pictures, grounds, type and its
  own sections.

**The temper.** The plan deals `quiet`, `lively` or `loud` from the brief's words, the kind and the
art. A quiet page keeps every rule as written. A lively or loud one (a game, a mascot app, a drink
or toy brand) sets `<html data-temper>` and may take a face, frames, edges and stickers from its own
world within the limits of `expressive.md`, each naming its source.

## 2. The run

0. **The stack.** An empty folder builds a static page: copy `<skill>/assets` into `assets` and
   use `assets/starter.html` when building in step 5. An existing
   project builds in its own stack, its components taking the starter's markup and classes, with
   the kit copied into its public folder and loaded from there by root paths once the page has
   hydrated; a Next.js brief builds a static export. Any framework build reads `frameworks.md`
   first.

1. **Read the brief.** Write down the kind, what is sold, who buys it, the one main action (the
   transaction: Book a room, Order a cake, Start a free trial; a place with neither: Get
   directions) and the real material: logo, screens, photographs, art, prices, address, hours.
   List every concrete thing the brief names (each feature, number, asset and ask): all of it
   lands on the page. Then arm the finish gate, before any page exists:

   ```bash
   node <skill>/scripts/gate.mjs --start index.html --kind <kind> --category "<what is sold>" --primary "<main action>"
   ```

   A framework build names its dev server's URL or its built page (`--start dist/index.html
   --root dist`) in place of `index.html`, and rebuilds before every gate run.

2. **Write the copy notes, then all the copy,** before the page. Copy the block in `copy.md` (The
   copy notes) to `.taste-skill/copy.md` and fill it from the brief: the fact sheet; the six
   questions; the voice card (`copy-voice.md`, `copy-registers.md`, `copy-moves.md`); `Asks:` with
   one line per request, `- <ask> -> #<id> : <outcome>`. Use `play` for media, `go` for a destination,
   `send` for a form, `file` for a download or `show` for on-page content. Before the draft, the `## Story`
   block (`story.md`): a shape from its table, the thread that comes back in three sections, the turn,
   the bookend, and the spine, every heading with its `beat: <id> | section: #id` and the word joining it to the one before (so,
   but, then; never *also*). Write the draft one line per
   part (`H1:`, `Lead:`, `H2:`, `Button:`). Lint it: `node <skill>/scripts/copy-lint.mjs
   .taste-skill/copy.md`. The hero tells a stranger in five seconds what is sold and where or for
   whom, with one hard fact; a noun in every heading; buttons a verb and an object; the close says
   something new. Nothing is invented but a coined brand name and the plain facts the page needs
   that the brief leaves out (hours, menu items, a district), each marked `data-assumed`
   and listed in the report. Record a supplied brand in `names.json` if copy-lint flags its name (`copy.md`). Never reviews, quotes, customers, awards, named people or result
   figures. An assumed fact never contradicts the brief.

3. **Plan the page from its content** (`compose.md`, `sections.md` section 1). Line 1: the kind.
   Name what the visitor needs to know before acting and the fact in the brief that answers it.
   Give that answer its own section high on the page in the form the fact takes.
   Merge a heading, one sentence and a picture with a neighbour.
   Then one line per section in spine order with its id, beat, visitor’s question, worked form and change to the thread, its picture and where that picture comes from on the ladder of rule 6, its ground.
   Mark the sections that are your own design. Count the sections, and note what the page really
   carries: a sentence worth a statement, a list the brief names, photographs that show a claim,
   steps, figures. The deal needs both.

4. **Deal the frame.**

   ```bash
   node <skill>/scripts/start.mjs plan --page <kind> --trade <trade> --sections <n> --brief "<client words>" [--view wide] --has <photo,ui,film,object,setting,logo,art> --carry <words,list,photos,steps,figures> --action <booking|order|trial|visit|contact> --history .taste-skill/history.json
   ```

   `--has` lists material available for this build, including verified stand-ins from the picture ladder; `--carry` is what the copy notes really hold (a price alone is no `figures`). For a dated place reservation pass `--action booking --booking stay|table|class`, choosing the booked item. A service intro call uses `--action contact`. Pass `--last-section form` when the page ends with its own form or booking panel.
   It ends with a PLAN block and writes `.taste-skill/plan.json`. Copy the PLAN into the comment
   at the top of `<body>` and onto plan line 2.

   - **Story:** the dealt shape and its beats; keep it, or deal again with `--story <id>` for the
     one your `## Story` names, and say why on plan line 3.
   - **Temper:** pass the brief's words with `--brief "<words>"`; a lively or loud PLAN names
     `expressive.md`.
   - **Built as dealt:** palette and type (the `start.mjs css` line it prints; the client's own
     colours go through `start.mjs brand`), hero and its entrance, nav, footer, close, buttons,
     mark, the ground of each section (`grounds`), `data-density`, heading alignment, picture
     corners. Never violet: deal again.
   - **Suggestions:** `composition` lines, for sections that are photographs with words.
   - **Prompts:** four `ideas` seeds. Take one where your content has that shape, or compose
     something else; a seed is never a part to paste.
   - **`sub` lines** name a sub-skill for one job on this page (a mascot, an illustration, a logo
     mark, a chart, photo direction). Read the ones printed and use each where its condition holds: `subskills/<name>/SKILL.md`.
   - **`moment` and `scene`:** what the page's material can carry; `none` is a valid deal.
     Never write copy or invent a list to feed one. To swap a moment, `moments.mjs pick` again and
     note it on the plan comment as it says.

5. **Build.** Copy the kit into the page once at the start from the installed skill folder, never from a working copy of the skill repository. Copy `assets/starter.html` to `index.html`. In it set `<html lang data-type data-radius data-buttons data-density
   data-pictures data-motion>`, the metas, the head block (`system.md`, Head) and the nav class; copy only the
   `<section class="hero …" data-enter>` of the dealt `assets/layout/hero-<id>.html` and make
   every word and picture the client's; move the dealt close and footer out of their
   `<template>`s and delete the rest. Content sections are `main > section` with one `.wrap`, h2 first. A final form or booking panel is the close. Put only links in the footer after an own form section. A dealt `close-form` shares the footer with its links. Count hero and close.

   - **Own sections:** `<section class="section own" id="…" data-own="<what it is>">`, styled in
     the one `<style id="own-css">` block with the kit's tokens only (spacing, type, colour,
     radius; no new font or colour). `assets/own/` holds worked examples of the craft and
     the token use; build for this client's content. Interaction is
     click, tap and keyboard: tabs, a toggle, a slider, a stepper, an accordion, a chart readout.
     Motion shows the content working (`data-m-progress`, `data-m-draw`, `data-m-count`:
     `motion.md`); one sticky element in a section of at most 2.5 screens.
   - **Photo sections:** the kit's compositions and recipes (`sections-library.md`), directed
     with `subskills/image-direction` when the page has six photographs or more.
   - **Kit parts** (UI fragments, diagram cards, effects, moments, scenes) are mounted exactly as
     their reference says, with every name, number and logo rewritten to the client's; run
     `icons.mjs scan index.html --out assets/icons --colour` last. A form is the starter's
     `booking-form` (`system.md`, Forms).
   - Credits: the one footer line from `photos.mjs credits`. After shooting, copy `shots/tiles/desktop-sec-01-a.jpg` beside the page as `share.jpg`.

6. **Check and look.** Only the skill's scripts, each running one headless Chrome with WebGL on
   the CPU, one at a time in the foreground with a 10-minute timeout; never in the background, a
   windowed browser or a browser tool. Each serves the page over http on 127.0.0.1; `--profile
   <dir>` is a Chrome profile folder inside the project's `.taste-skill` folder or the OS temp
   folder.

   ```bash
   node <skill>/scripts/copy-lint.mjs index.html --kind <kind> --category "<what is sold>"
   node <skill>/scripts/motion-lint.mjs index.html --kind <kind>
   node <skill>/scripts/shoot.mjs --url index.html --w 1440 --out shots/1440.png --profile <dir>
   node <skill>/scripts/shoot.mjs --url index.html --w 390 --out shots/390.png --profile <dir>
   node <skill>/scripts/gate.mjs index.html
   ```

   **Look at the screenshots before the gate,** section by section, at both widths: is each
   section's form the one its content asks for; does every picture show what its heading says;
   where is the page empty or cramped? Fix that first: the gate measures geometry, your eyes judge
   the page. Then the gate, which runs
   the checker at 1440 and 390, walks the page at 320, and runs copy-lint, motion-lint and the
   last `perf.mjs` result. Fix what it lists and run it again until its last line is `GATE: PASS`
   or `GATE: OPEN`, three rounds at most (in Claude Code it also runs when you finish). Between
   rounds use `consistency.mjs index.html --quick --widths 1440,390` for the part you changed, not the full
   run. Before the last round run `node <skill>/scripts/perf.mjs index.html --profile <dir>` and
   shoot 1024 and 768 once.

   `GATE: SETUP`: arm what a browser can open (step 1) and run it again. `GATE: ERROR`: fix what
   it names (a round, like a FAIL). `GATE: OFF`: after any edit to a closed page run the gate
   again; never re-arm a closed build with `--start`. When the user tells you to stop or ship as
   it is, `gate.mjs --done "<what they said>"`. Never edit the kit's files or hide anything from
   the checker. A FAIL you judge false is waived in `.taste-skill/waivers.json` with its reason
   (`gate.md`), never fixed by gaming the check.

7. **Report:** the `GATE:` line first, then every waiver with its reason and every open FAIL;
   the kind and the deal; which sections are your own and what form each took; where each ask of
   the brief landed and its gate state; what the client must supply for each preview; every assumed fact; the pictures the client must supply, every stand-in
   among them; the form's `.example` stand-in; what you could not check.

## 3. What to read

Before the first page, in full: `compose.md`, `sections.md`, `layout-v4.md`, `system.md`,
`copy.md`, `story.md`. Then only what the page uses:

| For | Read | Kit |
|---|---|---|
| Composing a section from its content, the idea seeds, the worked examples | `compose.md` | `assets/own`, `library/ideas.json` |
| The page as a story: shapes, spine, handover devices | `story.md` | `library/stories.json` |
| The plan by kind, the deal, compositions and recipes | `sections.md`, `sections-library.md` | `assets/starter.html` |
| A lively or loud page: its moves, limits and type | `expressive.md` | `assets/expressive` |
| Air, grounds, heroes, edges, type | `layout-v4.md` | `assets/system.css`, `assets/layout` |
| Tokens, nav, footer, forms, head tags | `system.md` | `assets/system.css`, `assets/system.js` |
| Copy, voice, registers, hero forms, tells | `copy.md`, `copy-voice.md`, `copy-registers.md`, `copy-moves.md`, `copy-tells.md` | `scripts/copy-lint.mjs` |
| Pictures and stand-ins | `photos.md` | `scripts/photos.mjs` |
| Motion floor, helpers, entrances | `motion.md` | `assets/motion` |
| The dealt moment or scene | `moments.md`, `scenes.md` | `assets/moments`, `assets/scenes` |
| Feature cards, UI fragments, diagram cards, real icons | `cards.md`, `diagrams.md`, `icons.md` | `assets/ui`, `assets/diagrams`, `scripts/icons.mjs` |
| Grounds and effects (tech only) | `backgrounds.md`, `effects-usage.md`, `effects-creative.md`, `effects-objects.md` | `assets/backgrounds`, `assets/effects`, `assets/objects` |
| A framework build | `frameworks.md` | |
| The gate, waivers, speed | `gate.md`, `perf.md` | `scripts/gate.mjs`, `scripts/perf.mjs` |

Sub-skills, each one small job, read only when the plan names it:

| Sub-skill | Makes |
|---|---|
| `subskills/illustrate` | the product, its output or a game's world drawn in one style, in code |
| `subskills/data-picture` | a chart, scale, comparison or timeline from believable data |
| `subskills/image-direction` | photographs with scale contrast, deliberate crops, overlap and type on a calm part |
| `subskills/brand-mark` | a logo mark, wordmark and favicon for a client with none |
| `subskills/mascot` | a brand character in a few poses, built from simple shapes |

## 4. Checklist

For your eyes first, then the gate (its check ids in brackets):

- **First screen:** the hero says what is sold, for whom or where, with one hard fact; it fills
  the screen alone, its main button inside it [hero-screen, hero-fill, fold-action, fold-cut].
- **Each ask lands at its named element** [brief-ask, ask-outcome]. Put the main action early and label any preview.
- **Sections from their content:** two own sections from six sections up, one below six [own-count]; no section holds a few
  words in an empty band; no content cut or hidden to fit [section-height, empty-area,
  still-wrong].
- **Air and grounds:** nothing cramped, no empty stretch on one ground, the dealt rhythm of
  grounds [section-air, empty-band, ground-flat].
- **Equal text edges,** with the page inside the viewport [container-edges, right-edge,
  spill, off-viewport].
- **Photo-led pages** take a picture to a screen edge after the hero and keep runs of boxed picture sections to two [boxed-run].
- **Pictures show their claim** (your eyes: heading says X, picture shows Y); every visual draws
  at every width; no explaining caption [visual-empty, no-visual, visual-caption]; no stand-in of
  the wrong subject.
- **Nothing ships broken:** no console error or failed file, every link lands, forms send to
  their `.example` stand-in with real fields and each error under its field [console-error,
  links, forms, form-fields].
- **Motion:** every control answers the pointer and the press; the hero enters once; nothing
  advances by itself without a pause; under reduced motion everything rests and nothing stays
  hidden [motion-layer, hover, hero-enter, loop-pause, reduced-motion, hidden-content].
- **One system:** one button pair, one card style, one radius scale, one heading scale, text
  contrast [button-styles, card-family, heading-scale, text-contrast].
- **Story:** the h2s alone read in order; the thread comes back; the close answers the hero
  [copy-story, spine-drift, label-run, thread-lost, close-unanswered].
- **Copy:** the notes first; headings name things, buttons a verb and an object; assumed facts
  marked and none against the brief; no slop word or stock line [copy-notes, copy-headings,
  copy-buttons, assumed, copy-slop-word].
- **Keyboard and head:** every control named and reachable, the skip link first, alt on pictures,
  lang, title, description and share tags [a11y-name, skip-link, focus-visible, img-alt,
  page-meta].
- **Phones:** one column at 390, nothing past the screen at 320, every control 44px tall, the
  menu and the action bar work [off-viewport, collide, tap-size, menu-toggle].
- **Fast:** no FAIL row in `perf.mjs`.

## 5. Never

Slop bans hold on every page; style limits follow the temper.

- A section that exists only to animate a few words; a card, row or tile that fades in on
  scroll; parallax on text; scroll-jacking; anything that moves by itself with no pause.
- A stand-in photograph of the wrong subject; stock passed off as the client's product, people or
  place; two drawing styles on one page; a product page that never shows the product.
- A drawn look-alike of a real logo; invented reviews, quotes, customers or figures; an assumed
  fact that contradicts the brief; a fake success message.
- Monospace uppercase labels, plain kickers (chapter names follow `story.md`; one drawn world tag per section on loud pages follows `expressive.md`), check-icon lists, a row of big
  stat numbers as filler.
- Violet or lavender the page invents (a real logo or the client's own art keeps its colours).
- Reading text in a pixel, hand, blackletter or condensed face or in capitals; text on busy art
  without a plate; a turned paragraph or control; three turned things on a screen.
- Tilt, capitals, a heavy display weight, a fourth ground or a game's frames on a quiet page; past
  its limit or without its source on a lively or loud one.
- Copying a reference site's code, copy, pictures or signature effect.
- Deleting or editing the kit's own files (`assets/`, `scripts/`) to clear a check.
