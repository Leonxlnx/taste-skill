# Big scenes

The one stretch of a page where the whole screen becomes a scene, driven by the scroll. Each is a
folder in `assets/scenes/<id>/` (`scene.js`, `scene.css`, `meta.json`, `demo.html`); `index.json`
lists them, `lib.js` is the held stage they share, `scenes.js` loads them, `print.js` mounts an
object render for the two object scenes.

## Who gets one

- **Every kind, by fit.** Each scene's `meta.json` carries `tones` (warm, editorial, product, tech,
  playful), `intensity` (quiet, lively, bold) and `webgl`, read against the page's kind by the fit
  rule (`moments.md`, The fit rule): a place takes warm and editorial scenes that are quiet or lively
  and draw no WebGL (a room, a route, the hospitality scenes; a type scene such as
  `dot-becomes-the-full-stop`); a service the same plus product; a product any intensity, WebGL only
  for a render the brief asks for; tech, software and gaming anything that fits their tones. On
  those three a scene's `types` still say which of them it was made for (a software screen is not a
  game's). A cafe gets nothing loud: no burst of letters, no camera through the clouds.
- **Dealt, 0 or 1 a page, about one page in two.** The deal reads every `assets/scenes/*/meta.json`
  when it runs (a scene added later is dealt without a rebuilt index), leaves out a retired one
  (`"retired": "<why>"`) and every scene the history already holds, so no two sites share a scene:

  ```bash
  node <skill>/scripts/moments.mjs scene --page <kind> [--tone warm] --history .taste-skill/history.json
  # or in one go with the moments, which then leave out the scene's avoidMoments:
  node <skill>/scripts/moments.mjs pick --page <kind> --scene deal --history .taste-skill/history.json
  ```

  "scene: none" is an answer: the page carries its moments. Name the dealt scene and its section in
  the plan.
- **Only when the brief has what the scene `needs`** (its own photographs, its own screen, its own
  words; a game's key art and in-engine shots are its photographs). A need the brief cannot meet:
  deal again with the scene in `--exclude`; never a stand-in for the client's pictures. A game
  without art files sets its name large over stand-in photographs of its setting (the `photo` hero
  and its world section; a render only when the brief asks for 3D), never an effect in its place
  (`sections.md`, Gaming). A scene's `never` line is a rule too.
- **A scene is a beat of its own,** beside the page's two or three moments. On tech, software and
  gaming it shares the page with at most one shader ground (`effects-usage.md`, Big scene), and
  never with a WebGL part that pushes the page over 4 live contexts.
- **The hero holds one screen at rest,** so a scene is dealt as the hero only when its `restH` is 1.
  A scene whose `restH` is 2 goes below the hero only, as a two-screen section (`--h: 2`) whose
  heading is an h2; the hero is then dealt as usual.
- **The two object scenes** (`fixed-hero-object`, `object-through-giant-type`) draw a WebGL render
  of an object of the client's own trade (a deck of cards for a card-game engine, a globe for an
  edge network); never an object of another trade.
- **The rest of the page stays calm:** no card, row or tile moves because the page scrolled. The
  moments go in other sections, never the scene's or the one beside it, never one in the scene's
  `avoidMoments` (`pick --scene deal` or `--scene <id>` leaves them out).

| id | fits | tones | intensity | needs | WebGL | restH | phone |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `descend-through-weather` | hero (below it only) | tech, playful, editorial | bold | two photographs of the client's world, high and low | - | 2 | still |
| `shaped-window-over-fixed-world` | hero (below it only) | tech, playful, product | bold | one wide photograph of the client's world | - | 2 | still |
| `fixed-hero-object` | hero (below it only) | tech, product, playful | bold | an object render or cut-out, 1-4 chapters | 1 | 2 | still |
| `powers-of-ten-pullback` | product | tech, product | bold | the product's UI at true size | - | 1 | still |
| `product-assembles-into-its-action` | product | tech | lively | the screen as HTML, 4-6 steps | - | 1 | still |
| `parts-lock-into-the-whole` | product | tech | lively | the screen cut along its panels | - | 1 | still |
| `fly-into-the-shape` | between, product | tech, playful, product, editorial | bold | the mark as one path, one dark photograph | - | 1 | still |
| `letter-physics` | statement | tech, playful | bold | a claim and its answer | - | 1 | light |
| `object-through-giant-type` | statement | tech, playful, product | bold | a quote of 3-5 short lines, an object | 1 | 1 | still |
| `dot-becomes-the-full-stop` | statement | all five | lively | one claim of 4-6 words | - | 1 | light |
| `letter-bar-floods-the-ground` | between, statement | tech, editorial, playful, product | lively | two statements, an inverse section after | - | 1 | still |

The 35 classic scenes of the 2.4 library (rooms, a route, closing scenes, light and type scenes)
are dealt the same way: see Classic scenes below, with their markup and their table.

`powers-of-ten-pullback` is never the hero: its first screen has no headline and no action.
Every scene's header comment in `scene.js` holds its markup and options; `meta.json` holds its
`look`, `needs`, `never` and `avoidWith`.

## Put one on the page

Copy the scene's folder and the shared files (`scenes.js`, `lib.js`, `scenes.css`, and `print.js`
for an object scene) into `assets/scenes`. Write the markup from the scene's header comment with
the client's own words and pictures. In `<head>`, the one line that marks script early and both
stylesheets, so the finished composition is styled without script and nothing jumps when the scene
mounts; at the end of `<body>`, the runtime once:

```html
<head>
  …
  <script>document.documentElement.classList.add('sc-js');setTimeout(()=>document.documentElement.classList.add('sc-safe'),2500)</script>
  <link rel="stylesheet" href="assets/scenes/scenes.css">
  <link rel="stylesheet" href="assets/scenes/<id>/scene.css">
</head>
…
<section class="sc" data-big-scene="<id>" data-big-scene-opts='{"hold": 1}' style="--h: <the scene's restH>" aria-labelledby="…">
  <div class="sc__stage">…</div>
</section>
…
<script type="module" src="assets/scenes/scenes.js"></script>
```

The section is a direct child of `main`. `<html data-scenes-ready>` says it is mounted;
`data-scenes-over` is a fault. Scenes take the page's tokens, face, radius and buttons.

### Its height (rule 3)

The scene's section stays in the page rhythm like every other: exactly one or two screens, its
words under the nav. Live it is (hold + 1) screens; `lib.js` and every scene default `hold` to 1,
so the live section is two screens (1800px at 1440x900). At rest (a phone, reduced motion, no
script) `scenes.css` keeps the section's `--h` and padding as a minimum height, so give it `--h` =
the scene's `restH` (the table above) and write no page CSS for it: a fixed height would cut the
composition and run it over the next section. Never hide a scene from the check with
`data-screen="free"`. Look at the 390 shot: a rest composition that fills under half its screen
reads empty (rule 2).

## Classic scenes

35 scenes of the 2.4 library (`meta.classic` 1) run unchanged on a shared classic stage
(`assets/scenes/classic/`) under the same loader. The deal treats them like the rest: by fit, never
one the history holds. A retired one is never dealt (it mounts by id for reference only).

- **Markup:** copy the section from the scene's `demo.html` and write the client's words and
  photographs into it: `<section class="sc scene" data-big-scene="<id>" data-big-scene-opts='{…}'><div class="scene-stage">…</div></section>`.
  The stage is `.scene-stage`, never `.sc__stage`. Never write `[data-scene]` on the section:
  that attribute belongs to the print objects.
- **Head and body:** link `scenes.css` and `<id>/scene.css` in `<head>` as for any scene, add
  `<link rel="preconnect" href="https://cdn.jsdelivr.net">`, and load `scenes.js` once at the end
  of `<body>`. The loader fetches GSAP 3.15.0 and ScrollTrigger once from cdn.jsdelivr.net (about
  115 KB; SplitText too for a scene that splits text) and reuses a copy the page already loaded.
  `data-scenes-ready` is set once the scene is built; `data-classic-ready` marks the scene itself.
- **Options:** `"smooth": 1` turns on Lenis wheel smoothing (off by default; leave it off unless the
  brief asks). Each scene's `classic.js` header is its whole contract: markup, options, phone.
- **Its height:** `restH` below is the finished composition's height in screens under reduced
  motion. A `restH` of 3 or more belongs on a long page only (`room-walk-track`: 8).
- **No script, a failed library, reduced motion:** the scene shows its finished composition
  (`.is-rest`), so nothing is ever blank.

| id | fits | tones | intensity | WebGL | restH | needs | what it does |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `arrive-and-settle-track` **retired** | close | warm, editorial, product, tech | quiet | - | 1 | pictures:0 | A held row slides sideways with the scroll and each item's height and tilt come from where it is on screen, so the letters of one giant closing line enter scattered … |
| `closing-cut-under-the-rise` | close | product, warm, playful | lively | - | 1 | product-photo, pictures:1 | In the last section the one thing the page is about stands, as a cut-out masked from the closing photograph itself, in a flat room of two tints: that photograph's … |
| `closing-line-in-a-field-of-words` | close | warm, editorial, product | lively | - | 1 | pictures:0, names:16 | The closing section holds one line still at the lower left of a calm ground, at display size in two lines with the page's one action after its last word, while a … |
| `closing-object-turns` | close | product, editorial | lively | - | 1 | product-photo, pictures:1 | In the last screen the one object the page is about, a cut-out photograph of something flat (a book, a card, a ticket, a box lid, a label), rises from below, square, … |
| `depth-card-flythrough` **retired** | statement | warm, editorial, product, playful | bold | - | 4 | pictures:6 | The camera runs forward into one picture with a strong vanishing point (a jetty, a road, a long hall) while captioned photo cards grow out of the distance on … |
| `dither-field-opener` | hero | editorial, tech, playful | bold | 1 | 1 | pictures:0 | The first screen is printed, not pictured: one huge numeral, year or initial in the page's display face turns slowly inside a drifting noise field, and the whole … |
| `hinged-sheets` | statement | warm, editorial, playful | lively | - | 1 | pictures:0 | Two to four tickets lie face-down in one row under the section's headline, ink-coloured backs with one large word each, and turn over one by one as the page scrolls, … |
| `instrument-dial-stage` | statement | editorial, product, warm | lively | - | 2 | series:3 | A stage drawn like an instrument reads off three to six items one at a time: a wide dial arc lights tick by tick to each item's own number, a bezel clicks round to … |
| `lens-over-thumbnail-stream` | statement | editorial, product, playful | lively | - | 3 | product-photo, pictures:25 | A held strip of colour thumbnails grouped by project slides left under an unseen lens, and every picture near it swells and heaps into a collage of its project … |
| `light-flood` | statement | all five | lively | - | 1 | pictures:0 | One sentence on a held stage plays out a day: a soft dome of colour rises behind it like a sun, swells until the whole screen is lit, then night falls from the top … |
| `object-lowered-onto-the-last-line` | close | product | quiet | - | 1 | product-photo, pictures:1 | The type is the table |
| `one-figure-reforms` | statement | tech, editorial | lively | - | 3 | product-ui | One held stage carries three to five chapters on a single large window in the accent that re-forms under the scroll instead of cutting: a tall bar rounds into a … |
| `orbit-to-formation` | statement | editorial, product, playful | bold | - | 1 | pictures:12 | One set of square photographs rides a single invisible wheel that changes shape as the page scrolls: a huge arch turning over the opening statement, then a ring … |
| `page-lifts-off-closing-picture` | close | warm, editorial, product, tech | quiet | - | 1 | pictures:1 | The last content section slides up like a sheet, at its full width and in its own ground, and uncovers a picture that was held underneath it all along; while the … |
| `panels-reproportion-on-arrival` | hero | editorial, warm | quiet | - | 1 | pictures:4, names:4 | A short statement holds at display size in a solid column of the page's ground on the left, as tall as the stage, while four to six large panels arrive one at a time … |
| `peel-tear-and-drag` | between | playful, product | bold | - | 2 | pictures:2 | A physical thing brings in the next section: a cloud deck closes over the old chapter, a huge photographed plane breaks out of it, slows as it pulls the next page in … |
| `raster-cut` **retired** | between | editorial, product, tech | lively | - | 1 | pictures:1 | On a held stage the next chapter's full-bleed picture prints over the current ground through a raster of horizontal slats with whole-pixel edges, while the chapter … |
| `room-walk-track` | statement | editorial, warm | lively | - | 8 | product-photo, pictures:14 | A full-height row of flat-coloured rooms is walked sideways at one screen of width per screen of scroll, each room with its own moment (a photograph that swaps in a … |
| `route-journey` | statement | warm, editorial, product, tech | lively | - | 2 | route | A traveller (a top-down truck, a boat, a drone) stays parked on screen while a tilted map slides and turns under it along a route that draws itself, stopping at … |
| `scatter-and-lock` | statement | editorial, product, playful | lively | - | 1 | pictures:1 | One photograph is cut into a grid of big live pieces scattered through real 3D space; the scroll flies them home from the centre out into a gapped contact sheet, … |
| `scroll-turned-drum` | statement | editorial, warm, product, playful | lively | - | 2 | names:8, pictures:8 | A list of short names sits on the face of a horizontal drum that the scroll cranks like a slot reel, the name on the front line in full ink while the others roll … |
| `scrubbed-transformation-sequence` | statement | product, editorial, warm | lively | - | 1 | product-photo, video | One object goes through one change of state as the page scrolls (raw to finished, closed to open, lifted and handed over), played as a frame sequence on a canvas on … |
| `seam-pocket-gathers-the-words` | between | warm, editorial, product | quiet | - | 1 | names:8 | The stage holds a section's heading and sentence across the top, with eight to twelve short words (what the section was about, one or two words each) lying scattered … |
| `shaped-edge-ground-change` | between | warm, editorial | quiet | - | 2 | pictures:2 | A photograph with a wide, even sky zooms slowly while a field painted exactly in the sky's colour rises over it as a full-width arch, a short heading spreading word … |
| `sheets-tip-in-and-away` | statement | editorial, warm, product | lively | - | 4 | product-photo, pictures:3 | Three to five chapters lie in one held stage as full-screen sheets of the page's own ground, each with its name set very large along the top edge and a photograph … |
| `speed-bent-row` | statement | playful, product, editorial | lively | - | 1 | product-photo, pictures:6 | The stage holds for two screens while the page scroll carries one row of six to eight pictures of one body of work sideways along a gentle curved surface in CSS 3D, … |
| `stepped-columns-raise-a-stage` **retired** | statement | editorial, product, tech | lively | - | 1 | pictures:0 | A row of three to five columns of short copy on one flat page colour fills with solid ink from the foot, each column at its own pace, so the row reads first as a … |
| `through-the-openings` | between | editorial, warm | lively | - | 1 | pictures:1 | Five to eight full-screen sheets of the page's own ground, each with one opening cut into it (round arches, square doorways or pointed arches, one family a page), … |
| `thumbnail-becomes-the-stage` | statement | all five | lively | - | 2 | pictures:3 | A statement of one or two lines at display size sits over a row of large thumbnails on the layout's columns, whose middle one is a keyhole onto a full-screen … |
| `twin-image-scanner` | statement | product, editorial, tech | lively | - | 1 | product-photo | Two registered pictures of one subject are stacked, its surface (a photograph on the light ground) and its structure (a line drawing on the dark ground), and a scan … |
| `type-flip-relayout` **retired** | statement | editorial, tech | lively | - | 1 | pictures:0 | A short list in giant capitals on a held, picture-free stage is re-set three times by the scroll: its ragged lines spread into a justified slab and the short last … |
| `warp-jump` **retired** | statement | tech, playful | bold | 1 | 1 | pictures:0 | Over a full-bleed field of radial streaks that speeds up and heats from ink into the accent with the scroll, a centred manifesto in capitals changes in timed beats, … |
| `window-names-its-parts` | statement | tech | lively | - | 1 | product-ui | The product's own window takes stock of itself |
| `window-relay-with-stamps` | statement | warm, editorial, product | lively | - | 1 | pictures:4 | A short set of four to six pictures of one family is told as a relay on a held stage |
| `wordmark-under-strain` | close | playful, editorial | bold | - | 1 | pictures:0 | A closing word in giant type is held and put under load by the scroll: it is crushed onto its baseline and springs back, and its full stop loosens, falls out and … |

## Rules

- **The demo is a placeholder:** every picture, word and object in a shipped scene is the client's.
  Credit the photographs in the footer line, with "adapted" for one cropped beyond its frame.
- **Readable without it:** the scene's words are real text in the markup, in reading order; the
  finished composition says everything the scene says.
- **Native scroll only:** the stage sticks for `hold` screens; nothing captures the wheel.
- **Phones get the still or the light version, never the full scene:** under 768px every scene
  shows its finished composition, except the two type scenes marked light (no depth, nothing
  overlapping).
- **Reduced motion, no script, a failed module:** the finished composition, which is also the
  hold's end. The object scenes then show the object's still picture and mount no WebGL.
- **WebGL:** one context at most a scene, taken from the page's shared budget (`lib.glBudget`,
  `window.__tpGl`, four on a page), mounted only while the section is live and within a screen of
  the viewport, destroyed when it leaves; a still picture under it whenever WebGL or the shader
  fails. Never a GLSL ES reserved word as a name.
- **Nothing moving crosses words being read;** statements read whole at every rest. Text over a
  photograph stands on a flat band of the page's ground or on the photograph's calm, dark part at
  4.5:1 (3:1 for display text); never a scrim or gradient over a photograph (`system.md`).
- **Cost:** transform, opacity and clip-path on fixed-size layers; never width, height or an SVG
  clip repainted every frame.
- **No captions** that explain the scene, under it or beside it; no card chrome, chips or labels
  flying with the scroll.

## Check it

```bash
node <skill>/assets/scenes/_demo/shoot.mjs shoot --out <dir> --profile <your own Chrome profile dir> [--only <id>] [--page <url>] [--reduced] [--port 5836]
node <skill>/assets/scenes/_demo/shoot.mjs index [--out <file|dir>]   # from the project folder: its own index.json
```

`index` writes the project's own `assets/scenes/index.json` when run from a project folder that has `assets/scenes` (or with `--out <file|dir>`).
Inside the installed skill it refuses and writes nothing; `--in-skill` rewrites the skill's own index on purpose, which
is not a page's work. A page needs it only after a scene's `meta.json` changes, so on a normal page skip it.

One headless Chrome with WebGL on the CPU, closed by its own PID: start, middle and end at 1440 and
390, a contact sheet a scene. Read every sheet; shoot `--reduced` once.
