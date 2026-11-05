# Scene objects (`assets/objects/<id>`, runtime in `_scenes`)

Real things shown through a print effect, alive under the pointer. Four of them take the client's
own photographs (`src`); one models a generic thing in code. Each is the picture of one card or one
hero frame: still or nearly still at rest, and it moves under the pointer, never on scroll.

| id | what it shows | moves by itself | hover / touch |
|---|---|---|---|
| `split-reveal` | one photograph, half printed as a halftone, a line between | no | the line follows the pointer; drag on touch; a slider for the keyboard |
| `dither-sequence` | 2 to 6 photographs that belong together, dithered, cut one to the next | yes: holds, then wipes (pause disc) | the pointer scrubs the frames; drag on touch |
| `dot-object` | one object cut out of its photograph and set in dots | no | under the pointer the dots take the photograph's real colour, like a loupe |
| `exploded-layers` | one photograph (or up to four) as four printed sheets in perspective | no | the sheets open apart; with `names` each gets a label; tap on touch |
| `product-turntable` | a generic camera, chair, speaker or cup on a turntable, dithered | yes: one step every 1.7 s (pause disc) | moving across turns it step by step; drag on touch |

`index.json` lists them; each folder's `meta.json` has every param (and its `for` and `never`), and
`demo.html` (served, not from disk) shows the object in a hero and two cards with a palette switch.

## Where they go: software pages only

**A scene is a print (halftone, dither, dots) and prints belong to software, tech, AI, developer
tool and games pages**, as their one moment: a hero frame or one feature card. House rule: effects
fit tech or gaming sites, a local coffee shop never.

- **Place, service and local-business pages** (a cafe, a bar, a shop, a hotel, a clinic, a studio
  people visit): no scene. Their photographs show plain, never printed as a halftone, a dither or
  dots (`references/photos.md`).
- **Product pages** (a maker of bikes, furniture, lamps, devices): no scene. The product's own
  photographs show plain; without photographs its object render (`assets/objects/print-*`,
  `_print-core/README.md`), never a scene and never stock of something else.
- **On a software page**, a scene shows a real thing the product works on or with:
  - `split-reveal`, `exploded-layers`: a photograph a photo, design or print tool works on, the
    device a tech company makes, a game's key art. `exploded-layers` labels only with `names` in the
    client's words (the layers its software works on); without names it opens without labels, and
    never names the sheets after the techniques (halftone, dither).
  - `dither-sequence`: two to six photographs that belong together (a device from several sides,
    the stages of what the software makes, a game's scenes), never a random or mood set.
  - `dot-object`: only an object shot on a seamless plain ground (lighter or darker than the object,
    or another colour), or a cut-out PNG with a clear ground. A busy or sunlit background does not
    cut out: use `split-reveal` instead.
  - `product-turntable` draws a generic thing, never the client's product: a card about a kind of
    thing the software handles (cameras in a rental platform's inventory, a chair in a furniture
    marketplace, a speaker an audio app controls).
- One scene per screen, at most two on a page, and the page's other WebGL counted with them.
- No caption under a scene that explains it or apologises for it ("made in code", "a print of",
  "a stand-in"); the card's heading and text say what the thing is.
- The demo photographs are test pictures. Never ship them as the client's.

## Put one on a page

```html
<article class="card">
  <h3>Every edit on its own layer</h3>
  <p>Turn any adjustment off later without touching the rest.</p>
  <div class="panel">
    <div data-scene="exploded-layers" data-scene-src="assets/img/sample-edit.jpg"
         data-scene-params='{"names":["Photo","Colour","Shade","Masks"]}'
         aria-label="A portrait taken apart into its four edit layers"></div>
  </div>
</article>
<!-- once, after system.js -->
<script type="module" src="assets/objects/_scenes/auto.js"></script>
```

One per object, copy and change the `src` and the words:

```html
<div data-scene="split-reveal" data-scene-src='{"src":"assets/img/raw-scan.jpg","alt":"A scanned print, half of it screened","focus":[0.5,0.4]}' data-scene-params='{"split":0.6}'></div>
<div data-scene="dither-sequence" data-scene-src='[{"src":"assets/img/a.jpg","alt":"Front"},{"src":"assets/img/b.jpg","alt":"Side"},{"src":"assets/img/c.jpg","alt":"Back"}]'></div>
<div data-scene="dot-object" data-scene-src="assets/img/sensor-on-white.jpg" aria-label="The sensor the app reads"></div>
<div data-scene="exploded-layers" data-scene-src="assets/img/map-tile.png" data-scene-params='{"names":["Imagery","Roads","Labels","Terrain"]}'></div>
<div data-scene="product-turntable" data-scene-params='{"form":"chair"}' aria-label="A side chair from the catalogue"></div>
```

- The host is an empty `div`. In a `.panel`, `.panel__screen` or `.frame` it fills the box (give
  the box its size: an aspect ratio or a height); elsewhere give it a size yourself.
- `data-scene-src`: a page-relative path or URL, or JSON: `{ src, alt, focus: [x, y], by, page,
  licence, licenceUrl }`, or an array of them. Serve photographs from the site itself (a host that
  sends no CORS headers cannot be printed: the plain photograph shows instead).
- `data-scene-params`: JSON, every param in `meta.json`. `data-scene-palette`: JSON `{ bg, ink,
  muted, accent }`. `aria-label`: what the picture shows (else the photograph's alt).
- **Colours**: without a palette the scene prints in the page tokens (`--bg`, `--surface`, `--ink`,
  `--muted`, `--accent`) on the ground of the box it sits in (a `.panel` on `--surface` prints on
  `--surface`; a dark band prints in a light ink). It paints its own ground: put it in a plain
  panel, never over a dealt effect ground.
- **One moving scene per group**: in a section (or a `[data-scene-group]`) only the first
  `product-turntable` or `dither-sequence` moves by itself, or the one with `data-scene-loop`; the
  others hold still until the pointer reaches them. A moving scene puts the shared 32 px pause disc
  (`.loop-pause`) in the box's bottom-right corner: keep that corner clear.
- Text goes above or beside the panel, never over the scene. No caption that explains the effect,
  no chips; the photograph's credit goes in the page's one credit line.
- **Credits**: `import { credits } from 'assets/objects/_scenes/kit.js'`; `credits([entry, ...])`
  returns the footer's one line of small print for every photograph the scenes print, each named
  once ("Photographs: A on Unsplash, adapted; B, CC BY-SA 4.0, via Wikimedia Commons, adapted.").
  Never a credit under the picture, never a line per photograph. The client's own photographs need
  none.
- **Script**: `import obj from 'assets/objects/split-reveal/object.js'; const ctrl = obj.mount(el,
  { src, params, palette })`. The controller has `pause()`, `resume()`, `setPalette(p | null)`,
  `destroy()` and `ready` (a promise, once the photographs are in). `auto.js` exports `scenes`, a Map
  from element to controller; after a theme change call `setPalette(null)` on each.

## Behaviour

- **Still at rest**: `split-reveal`, `dot-object` and `exploded-layers` draw once and again only
  while the pointer moves them. `product-turntable` and `dither-sequence` draw only while they step
  or wipe (30 frames a second at most) and nothing while they hold.
- **Never on scroll**: nothing animates as it comes on screen; it is drawn finished.
- **Reduced motion**: one still frame, no pause disc; the pointer still moves the line, the frame,
  the loupe and the turntable, at once.
- **No WebGL, a shader that fails, or a photograph that fails**: the plain photograph
  (cover-cropped at its focus) takes the panel and the overlays go; the turntable shows a still of
  its form (`fallback-<form>-light|dark.png`, made by `make-fallbacks.html`). A sequence leaves a
  failed photograph out of the loop. The panel never stays empty: the still also goes in when a
  shader breaks a rule of GLSL ES 1.00 or 3.00 (`glslLint` in `kit.js` reads every shader before it
  is compiled), fails to compile or link, a frame throws, or the first frame comes out one flat
  colour. Only a photograph that cannot load at all (its host down or blocked) leaves the panel's
  own ground: the host gets `data-scene-empty` and the console an error. Serve the photographs from
  the site itself.
- **Shaders**: the test Chromes render WebGL on the CPU (SwiftShader), which compiles words a
  laptop's GPU rejects (a struct field named `flat` once left a hero empty). After changing a
  shader run `node assets/objects/_scenes/lint-glsl.mjs`: it checks every scene shader as compiled
  and exits 1 on a reserved word, a keyword or type used as a name or field, a double underscore, an
  unknown `gl_` name, or a name that hides a built-in function.

## Light on a laptop GPU

- Each scene has one canvas and one WebGL context, paused off screen and with the tab hidden, and
  freed 1.5 s after it leaves the screen; it is made again before it returns.
- At most 2 scene contexts live at once (`config.live` in `kit.js`), a hard cap: off-screen ones
  give theirs up first, then idle ones, then still ones (each keeps its last frame as a picture).
  Count them with the page's grounds and other effects: keep a page to 4 live contexts.
- A smooth canvas renders at most 1 canvas px per CSS px (0.75 in a frame over 1 MP for the
  layers) and never over 1.5 MP; a dithered one holds one canvas px per dither cell. No MSAA.
  Dots and layers draw from static buffers; nothing runs per frame on the CPU.
