# Big scenes

The one stretch of a tech page where the whole screen becomes a scene, driven by the scroll. Each is
a folder in `assets/scenes/<id>/` (`scene.js`, `scene.css`, `meta.json`, `demo.html`); `index.json`
lists them, `lib.js` is the held stage they share, `scenes.js` loads them, `print.js` mounts an
object render for the two object scenes.

## Who gets one

- **Tech pages only:** software (apps, AI, developer tools, fintech), tech (a technical product,
  hardware, a network) and gaming. A place, a service or a plain product (site-kind other: a cafe,
  a guesthouse, a shop, a studio) never gets a scene: it gets photographs. The `types` in `index.json` are exactly
  `software`, `tech` and `gaming`.
- **At most one a page,** and only when the brief has what the scene `needs` (its own photographs,
  its own screen, its own words; a game's key art and in-engine shots are its photographs). No need
  met, no scene: never a stand-in for the client's pictures. A game without art files sets its name
  large over stand-in photographs of its setting (the `photo` hero and its world section; a render
  only when the brief asks for 3D), never an effect in its place (`sections.md`, Gaming).
- **Deal at random** among the scenes whose `fits` has the section, whose `types` has the page's
  type and whose `needs` the brief meets, weighted by `weight`, away from the last three in
  `.taste-skill/scenes-history.json` (the command is in `effects-usage.md`). Name the scene and its
  section in the plan. A big scene is the page's one effect: no shader ground, no WebGL part beside
  it.
- **The hero holds one screen at rest,** so a scene is dealt as the hero only when its `restH` is 1.
  A scene whose `restH` is 2 (today all three hero scenes) goes below the hero only, as a
  two-screen section (`--h: 2`) whose heading is an h2; the hero is then dealt as usual.
- **The two object scenes** (`fixed-hero-object`, `object-through-giant-type`) draw a WebGL render
  of an object of the client's own trade (a deck of cards for a card-game engine, a globe for an
  edge network); never an object of another trade, never a cup on a cafe.
- **The rest of the page stays calm:** no card, row or tile moves because the page scrolled. Beside
  a scene the page may still take one or two section moments (the house overrides: one big scene and
  one or two scroll moments), dealt as `moments.md` says (one on a short page, two on eight
  sections or more), never in the scene's section or the one beside it, never one in the scene's
  `avoidMoments` or its twin (`effects-usage.md`, Big scene).

| id | fits | types | needs | WebGL | restH | phone |
| --- | --- | --- | --- | --- | --- | --- |
| `descend-through-weather` | hero (below it only) | tech, gaming | two photographs of the client's world, high and low | - | 2 | still |
| `shaped-window-over-fixed-world` | hero (below it only) | tech, gaming | one wide photograph of the client's world | - | 2 | still |
| `fixed-hero-object` | hero (below it only) | tech, gaming | an object render or cut-out, 1-4 chapters | 1 | 2 | still |
| `powers-of-ten-pullback` | product | software, tech | the product's UI at true size | - | 1 | still |
| `product-assembles-into-its-action` | product | software, tech | the screen as HTML, 4-6 steps | - | 1 | still |
| `parts-lock-into-the-whole` | product | software, tech | the screen cut along its panels | - | 1 | still |
| `fly-into-the-shape` | between, product | software, tech, gaming | the mark as one path, one dark photograph | - | 1 | still |
| `letter-physics` | statement | software, tech, gaming | a claim and its answer | - | 1 | light |
| `object-through-giant-type` | statement | software, tech, gaming | a quote of 3-5 short lines, an object | 1 | 1 | still |
| `dot-becomes-the-full-stop` | statement | software, tech, gaming | one claim of 4-6 words | - | 1 | light |
| `letter-bar-floods-the-ground` | between, statement | software, tech, gaming | two statements, an inverse section after | - | 1 | still |

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
