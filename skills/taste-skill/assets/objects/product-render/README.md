# Product render (`assets/objects/product-render`)

A studio render of **any physical product**, composed from a short JSON spec: a list of parts with
sizes and positions in the product's own units. `build.js` turns the spec into a model and
`_print-core/print3d.js` renders it: real materials (painted metal, alloy, chrome, rubber, wood,
fabric, leather, plastic, a light), soft studio light with soft shadows, a softbox in glossy parts, a
floor shadow, the page's accent on the parts that ask for it. It sways slowly as a turntable, or holds
still; a lamp switches on and off on a click; a robot's joints move.

Use it when the **brief asks for 3D or a render** (a configurator, a product that exists only as a
model): the render is the product's picture, in the hero and the statement. A product without
photographs and without that ask is shown in photographs, its own or stand-ins
(`references/photos.md`). Never for a product that has photographs, never on a place page, never
captioned, never a product of another kind. One product render a page.

## Mount: the product at anchor scale

```html
<div class="frame" id="bike" data-product="assets/objects/product-render/specs/my-bike.json"
     data-product-place="stage" data-product-view="side" data-product-color="blue"></div>
<script type="module" src="assets/objects/product-render/auto.js"></script>
```

The frame is the picture: the product's own bounds fill a share of it (the tighter way, width or height)
and it stands on the page's ground with its floor shadow, transparent round it: **no panel, no grey box**.
Give the frame its size (a hero column as tall as the screen, a full-width stage, a tile); the product
fills it.

| attribute | |
|---|---|
| `data-product-place` | `hero` 0.88, `stage` 0.86, `tile` 0.84, `card` 0.9 of the frame (`legacy`: the old turntable right of the words) |
| `data-product-view` | `three-quarter` (default), then only the views the spec lists in `supports` (`side`, `front`, `top`, a close-up of its own such as `detail-saddle`); `product.views` lists them; any other (the bike's `top`) throws and the frame carries `data-product-error`; or `detail:<part name>` |
| `data-product-scene` | a scene of the spec: the product loaded or in use (`loaded`, `desk`, `work`) |
| `data-product-color` | a colourway id of the spec (`spec.colors`); default its first |
| `data-product-mode` | `auto` (default): the still make-posters made, else the turn, else one frame rendered here; `image`, `still`, `live` force one |
| `data-product-fill` | 0.3-1.2, over the place's share |
| `data-product-params` | `{"turn":1}` asks for the live turn; `{"x":0.1,"y":-0.05}` moves it; `{"step":0}` a lamp off |
| `data-product-palette` | `{ bg, surface, ink, accent }`; else the page's tokens `--bg`, `--ink`, `--accent` |

**Each section a different view.** A product page shows the product big, whole in three sections at most, and never the
same view twice: the widest view in the hero (a bike's `side`; a lamp's or an arm's `three-quarter`), another angle by the specs, a close-up on the part a section
talks about, the loaded scene where the copy promises what it carries. Every promise in a headline is
shown in a picture (a child seat with its belts, the crates, a lamp's light on the desk).

**A close-up** (`detail-*`, `detail:<part>`) frames the named parts and centres them on the frame (their box, `focus`
in the manifest, fills the place's share); the rest of the product runs off the frame's edges (the frame clips it),
never a hard cut inside it. So that holds in a wide tile too, a close-up's shot is made wide enough (`cover`, default 2:
a frame up to twice as wide as tall, 1 : 1.25 tall) with the product running on past the parts as far as it goes, and its
still is cropped evenly round the parts' centre, never to the product's own box.

**Colour from an order card.** A swatch drives the frames it names, no script needed:

```html
<button type="button" data-product-swatch="#bike, #bike-loaded" value="red" aria-pressed="false">Signal red</button>
<input type="radio" name="colour" value="red" data-product-swatch="#bike">
```

On click (a button: `aria-pressed` is kept, one pressed per group) or change (an input), the named frames
(default: every frame whose spec has that colourway) set `data-product-color` and swap to that colour's
still. Setting `data-product-color`, `-view` or `-scene` on a mounted frame does the same, and so does
an event: `el.dispatchEvent(new CustomEvent('product:set', { detail: { color: 'red', view: 'side' } }))`,
or on `document` with `detail.target` a selector.

**What a frame tells** (for checkers and tests): `data-product-mode`, `data-product-state` (`image` |
`still` | `live` | `poster`), `data-product-view`, `data-product-color-shown`; the picture is
`img.product-render__img`; `window.__tpProduct` = `{ stills, images, live, freed }`. In `image` mode
the page holds no canvas and no WebGL context; a `still` renders once, keeps an `<img>`, frees its
context and removes its canvases; only `live` keeps a context (and counts in `window.__tpGl`). A
product page uses the stills (the default once make-posters has run). A `still` is measured (its opaque pixels, and a
close-up's parts) and placed by the same layout as a poster still, so it fills its place's share exactly (tile .84) and is centred.

Script: `import { loadProduct } from '.../product-render/build.js'; const p = await loadProduct(url);
const ctrl = p.mount(el, { place: 'stage', view: 'side', scene, color, mode });` The controller:
`setColor(id)`, `setView(v)`, `setScene(s)`, `ready()`, `pause()`, `resume()`, `step(on)`,
`set(params)`, `setPalette(p | null)`, `destroy()`. `auto.js` exports `products` (frame to controller)
and `ready`. `views.html` beside this file is the worked example (every view, a scene per spec, two
colour switches, one `still` mount).

## Stills and posters: run this after every change to a spec

```
node assets/objects/product-render/make-posters.mjs path/to/spec.json --profile <own chrome dir> [--port 5905]
     [--variants side,detail-saddle,three-quarter+loaded] [--grounds light,dark] [--px 1100] [--timeout 9] [--quiet] [--legacy]
node assets/objects/product-render/make-posters.mjs --check path/to/spec.json      (spec, views, scenes and shaders only)
```

It checks the spec (unknown parts, props or materials, a part a view or scene names that is not there,
too many parts, shader words a laptop GPU rejects), then renders in a headless, software-rendered Chrome
(its own profile, closed by its own PID, never port 3000) every variant in `spec.make.variants`
(`view` or `view+scene`) on each ground in `spec.make.grounds`, and writes beside the spec:
`stills/<id>-<variant>-<colour>[-dark].webp` and `-half.webp` (one still per colourway, transparent,
cropped to the product and its shadow), `<id>-<variant>.fallback-render[-dark].png` (the live render's
poster) and `<id>.stills.json` (what was made, where the product and a close-up's framed parts sit, and
which sides a close-up cuts). A colourway costs no render: the accent part is lit again in each colour.
Each variant is written as soon as it is made; a CPU takes one to four minutes a variant for 60-90
parts, so pass `--variants` a few at a time. `--legacy` also writes the turntable's four posters. A view
with no still renders itself once on the page (`still` mode) and frees its context.

## The spec

```json
{
  "id": "city-bike", "name": "City bicycle", "label": "A city bicycle with a front basket",
  "units": "m", "angle": -34, "turn": { "mode": "sway", "amp": 22, "period": 24 },
  "materials": { "frame": { "kind": "paint", "color": "accent", "finish": "gloss" } },
  "parts": [
    { "type": "wheel", "at": [-0.53, 0.35, 0], "r": 0.35, "spokes": 36, "wall": "#c7a57a" },
    { "type": "tube", "from": [-0.07, 0.29, 0], "to": [-0.23, 0.81, 0], "r": 0.017, "mat": "frame", "blend": 0.01 }
  ]
}
```

Axes: **x forward** (the product's front), **y up**, **z across** (toward the viewer at angle 0). Any
unit; the model is scaled so its largest side is one unit and set on the floor at its lowest point.
Model the product from its real measurements: proportions are most of what makes it read as a render.

| key | what |
|---|---|
| `id`, `name`, `label` | the label is what a screen reader hears ("A desk lamp, switched on") |
| `poster` | the posters' file name (default the id) |
| `angle` | its turn at rest and in the still, degrees (default -32: a three-quarter view) |
| `turn` | `{ "mode": "sway", "amp": 26, "period": 22 }` (default), `{ "mode": "spin", "speed": 10 }`, `{ "mode": "still" }` |
| `camera` | `{ "elev": 12 }` degrees above the floor |
| `click` | `"light"`: a click switches every `light` material (and `glow`) on and off; it starts on |
| `pool` | `{ "at": [x, 0, z], "r": 0.2 }`: the light it throws on the floor while on |
| `materials` | named materials for the parts |
| `motion` | moving groups (joints), below |
| `colors` | colourways: `[{ "id": "blue", "name": "Deep blue", "accent": "#2c4f7c" }]` (the accent parts take it; `materials` swaps materials too, at a render each) |
| `views` | close-ups and own views: `{ "detail-saddle": { "part": ["saddle*", "seat post"], "angle": -42, "elev": 16, "margin": 1.3, "cover": 2 } }` (a name ending in `*` takes every part it begins; `cover` the widest frame the shot fills, 1 for the margin alone: a close-up render of 2-3 MP takes a CPU 2-9 minutes) |
| `scenes` | the product loaded or in use, below |
| `supports` | the views the product draws well, `["three-quarter", "side", "front", "detail-saddle"]`: only these are offered (`product.views`), made (`make.variants` outside it fails `--check`) and mounted; list a view only after looking at its still (a bike from above reads as lying on its side, so the city bike omits `top`). Keep `three-quarter` (the default view) |
| `make` | `{ "variants": ["three-quarter", "side", "detail-saddle", "three-quarter+loaded"], "grounds": ["light", "dark"], "px": 1100 }`: what make-posters makes |
| `parts` | the parts, below (keep it under about 90) |

### Parts

Every part takes `mat` (a material name or an inline material), `blend` (a fillet in units where it
meets the parts listed before it: welded tubes, a cast body), `in` (a motion group) and `name` (for you).
It is placed by `from` + `to` (a linear part runs between them; `up` turns its section), or by `at`
plus `axis` (`"x"`, `"y"`, `"z"` or a vector) and/or `rot` ([x, y, z] degrees).

| type | sizes | use |
|---|---|---|
| `tube` | `r`, `r2` (taper), `cap` `flat`/`round`, `round`, `seams` | frame tubes, posts, rods, handles, a tapered robot link |
| `beam` | `w`, `d` (section), `round`, `seams` | flat bars, cranks, rails |
| `box` | `size` [x, y, z], `round`, `seams` | housings, bodies, pedals, a gripper |
| `panel` | `size` (thin), rounder | plates, lids, a screen's back |
| `cylinder` / `disc` | `r`, `h`, `round`, `seams` | bases, hubs, motor housings, caps |
| `sphere`, `ellipsoid` | `r` / `size` | a bulb, a bell, a knob |
| `torus` | `R`, `r` | rings, a chainring, a status light |
| `joint` | `r`, `w`, `capMat` | a hinge: knuckle about `axis` (default z) with caps on both faces |
| `wheel` | `r`, `tyre` [width, height], `rim` [depth, width], `hub` [r, length], `spokes`, `spokeR`, `style` `spoked`/`disc`/`solid`, `wall` (sidewall colour), `rimMat`, `hubMat`, `spin` (deg/s) | bicycles, strollers, carts, casters; axle along `axis` (default z) |
| `shade` | `from` (closed end) `to` (open end), `r1`, `r2`, `t`, `bulge` 0..1, `innerMat` | lamp shades, bells, horns, a speaker cone |
| `seat` | `size` [length, height, width], `style` `saddle`/`cushion` | saddles, seats, cushions (local x forward) |
| `basket` | `size`, `style` `wire`/`slats`/`solid`, `pitch`, `wire`, `rimMat` | baskets, crates, bins, trays (open top) |
| `arc` | `R`, `a0`, `a1` (degrees), `r` or `size` [radial, axial] | mudguards, handles, bent frames, hoops |
| `spring` | `from`, `to`, `R`, `r`, `turns` | springs, coiled cords |
| `path` | `points` [[x,y,z]...], `r`, `smooth` (on with 3+ points) | handlebars, cables, bent tubes |

`seams`: panel lines cut round the part at heights along its length (-1..1 of its half length):
the seams of a robot's shell, a base's groove. `seamWidth`, `seamDepth` in units.

### Materials

A name from `materials`, a built-in name, or `{ "kind": ..., "color": "#hex" | "accent", "finish": "gloss" | "satin" | "matte" }`.

| kind | | built-in names |
|---|---|---|
| `paint` | enamel or powder coat; `color: "accent"` takes the page's accent | `accent`, `paint`, `white`, `black`, `graphite` |
| `metal` | brushed alloy | `alloy`, `aluminium` |
| `chrome` | polished | `chrome` |
| `steel` | dark stainless (spokes, wire) | `steel` |
| `rubber` | tyres, pads, grips | `rubber` |
| `plastic` | satin plastic | `plastic` |
| `wood` | oiled wood with rings; `grain` x/y/z, `scale` | `wood`, `oak`, `walnut` |
| `fabric` | a fine weave; `weave` | `fabric` |
| `leather` | | `leather` |
| `light` | gives light; with `click: "light"` it switches | `light` |

Any material takes `glow` (0..1): a lit inner face (a shade's inside when the lamp is on).

### Motion

```json
"motion": [
  { "id": "yaw", "pivot": [0, 0.14, 0], "axis": "y", "amp": 26, "period": 13 },
  { "id": "shoulder", "parent": "yaw", "pivot": [0, 0.32, 0], "axis": "z", "amp": 9, "period": 11, "phase": 0.2 }
]
```

A group turns its parts (`"in": "shoulder"`) about `pivot` and `axis` by `rest` + `amp` x a sine of
`period` seconds, after its parent. Pivots are given at rest, in the spec's units. Up to four groups.
The joints move only while the product turns: a still, a phone and reduced motion show the rest pose.

### Scenes and props: the product loaded or in use

```json
"scenes": {
  "loaded": { "label": "A city bicycle with a child seat on the rack, a crate of fruit and a pannier",
    "hide": ["basket"],
    "props": [ { "prop": "child-seat", "at": [-0.578, 0.796, 0] },
               { "prop": "crate", "at": [0.6, 0.76, 0], "size": [0.3, 0.2, 0.32], "contents": "fruit" },
               { "prop": "bag", "at": [-0.62, 0.42, 0.152], "hooks": true } ] },
  "desk": { "lit": { "at": [0.53, 0.11], "r": 0.19, "k": 3.6 }, "pool": null,
    "props": [ { "prop": "desk", "at": [0.2, -0.032, 0.02] }, { "prop": "book", "at": [0.3, 0, -0.15], "count": 2 } ] }
}
```

A scene adds props (and plain `parts`), hides parts by name, and may change `label`, `pool`, `click`
and `materials`. `lit` throws a lamp's warm pool of light on the props' upward faces. Props are made of
ordinary parts at the size of the real thing, standing on y = 0 and facing x, in metres (`scale`
converts: 1000 for a spec in millimetres); each takes `at`, `yaw`, `scale`, `size`, `color`,
`mats` { role: material }, `in` (a motion group: a parcel held in a gripper) and `name`.

| prop | what | options |
|---|---|---|
| `child-seat` | a rack seat: high back, wings, cushion, shoulder and lap belts to a red buckle, footrests | `color`; roles shell, pad, belt, buckle |
| `bench` | a padded bench for 1-3 children or passengers in a row (a cargo box): two belts and a buckle a seat | `seats`, `width`, `color`; roles frame, pad, belt, buckle |
| `crate` | a slatted wooden crate, open on top | `size`, `contents` fruit / bottles / loaves / parcels / none |
| `bag` | a pannier (flap, straps, handle, `hooks` for a rack) or `style: "tote"` | `size`, `color` |
| `parcel` | a cardboard box with tape and a label | `size`, `color` |
| `tray` | a low open bin with parcels standing in it | `size`, `parcels` 0-4 |
| `desk` | a tabletop | `size`, `color` |
| `book` | 1-3 stacked books | `count`, `colors` |
| `mug` | a mug of coffee | `r`, `h`, `color` |
| `sheet` | a sheet of paper | `size` |

Keep a scene under about 110 parts. Its props must read at the size the page shows them (belts,
buckles, a crate's slats, a bag's flap), and a scene goes where the copy promises it.

## Behaviour and limits

- **It always shows a picture**: the view's still (no WebGL); without one, the poster at once and the
  render over it, the poster staying when WebGL fails. Under `prefers-reduced-motion`, and on a phone (max-width 700px or a coarse pointer),
  one still frame, drawn sharp, and the context freed. A turning product has a pause button in its
  frame's bottom-right corner.
- **At most one live context** for a product: only the first product render mounted turns (when the
  page asks for the turn, or no still was made); a second holds still. The page's cap of 4 contexts
  (`window.__tpGl`) counts it.
- **Cost**: every part is evaluated per ray step, skipped when its bounding sphere is further than
  the nearest part so far. About 20 parts renders like a print object; 60-70 (a bicycle with its
  spokes) is fine on a laptop GPU and slow on a CPU renderer (posters: about 90 s). Keep under 90.
- **What it cannot do**: text or logos on the product, transparent glass, cloth that drapes, a
  freeform organic shell (a shoe, a face, a car body), anything thinner than about a texel (it is
  thickened). For those: the client's photographs or renders, never this.
- **Never** a product of another kind, never on a place page, never a caption under it.

The three specs in `specs/` (a city bicycle, a desk lamp, a robot arm) are worked examples, each with
its views, a scene and colourways (run `make-posters.mjs` on a spec to make its stills; until then each frame renders itself once): `views.html` shows them at anchor scale with colour switches
(`?only=bike|lamp|arm`, `?mode=still|live`); `demo.html` the turntable (`?turn=0`, `?fallback=1`).
