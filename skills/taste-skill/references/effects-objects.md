# Objects and prints (`assets/objects`)

Thirteen objects in three families and one builder; each family's README is the contract, each `meta.json` the params.
`assets/objects/index.html` shows the objects; `product-render/demo.html` the builder's three worked specs.

| Family | Objects | What it is |
|---|---|---|
| Print objects | `print-cup`, `print-wheel`, `print-lamp`, `print-globe`, `print-cards` | a thing modelled in code: a studio render (default) or a print of it (halftone, engraving, dither); `_print-core/README.md` |
| Photo prints | `photo-halftone`, `photo-engraving`, `photo-dither` | one real photograph printed by a shader, the photograph under the pointer; `photo-kit/README.md` |
| Scenes | `split-reveal`, `dither-sequence`, `dot-object`, `exploded-layers`, `product-turntable` | photographs (the turntable: a generic form) through a print, alive under the pointer; `_scenes/README.md` |
| Product render | `product-render` (a builder, no fixed object) | any physical product composed from a JSON spec of its parts, rendered in real materials as a studio still or a slow turn; `product-render/README.md` |

## When to use one

- **One strong object moment a page.** Never beside a second effect or over a moving ground.
- **Place, service and every page of site-kind other** (cafe, guesthouse, shop, studio, clinic,
  product brand): no object, print or scene; plain photographs lead. Leon, 1 Nov 19:45: shader
  effects only where the trade has a technical subject. The one exception is below: a physical
  product with no photographs shows its own render.
- **Product with photographs**: the photograph leads.
- **Any physical product without photographs** (a lamp, a chair, a bike, a stroller, a robot arm),
  of site-kind other or tech: **the product is rendered, never hidden** (round C: a cargo bike's
  page that never showed the bike scored 3 of 10). The client's own render or CAD view comes
  first; else `assets/objects/product-render` composes this product from a JSON spec of its own
  parts, sizes and materials (Product renders, below) and it leads the hero (`deal.mjs --type
  product --has object`), then shows again, from another angle, closer or loaded, in at most two
  more sections of the full product page (`sections.md`, Product). It is the product's picture, not
  an effect: on the page's flat ground or the lit ground on tech, a still or a slow turn, no print,
  no shader ground or moment beside it on site-kind other. A `print-*` object of the product's own
  kind (a lamp maker's lamp) may stand in for the spec; never an object of another kind (a wheel is
  not a bicycle), a drawn SVG, a model of loose primitives the helper did not compose, mood stock
  or another maker's product. **Hardware and devices too** (a robot arm, a drone, a camera, a
  sensor; round C: a robot arm shown as a silk shader and an order form lost): with no photographs
  or client renders it takes its product render, `deal.mjs --type product --kind tech --has
  object`. A curved shell is composed of rounded boxes, cylinders and fillets at its real
  measurements; never a `split` hero holding only an order form, never an effect in its place.
- **A game without art files**: its key art is a product render of its hero object (the ship, the
  crane barge, the mech) or a scene of its world composed from its own objects on one floor, on the
  `product` stage (`deal.mjs --type software --kind gaming --has object`) and full bleed in the
  world section; an effect may sit behind it, never replace it (`sections.md`, Gaming).
- **Software, AI, games with art**: a print object as a print on the card it is about (a globe for
  regions); a game's own world object for `fixed-hero-object` (`scenes.md`).
- **Photo prints and the photo scenes** print a photograph, and no page prints, dithers or grades a
  photograph (`photos.md`, `effects-usage.md`): they stay in the kit's gallery, never on a page.
  `product-turntable` (a generic form, no photograph) is a technical product's object only when the
  form is its own.

## Mount

```html
<div class="panel"><div data-print="print-globe" data-print-place="card"
  data-print-params='{"effect":"engrave"}'></div></div>
<script type="module" src="assets/objects/_print-core/auto.js"></script>
```

(The kit's photo scenes mount the same way with `data-scene` and `_scenes/auto.js`, for the gallery
only; `data-scene` here is not a big scene, which is `data-big-scene`, `scenes.md`.)

- **Script**: `obj.mount(el, opts)` from `<id>/object.js`. Print objects take `{ place, params,
  palette }`; photo prints and scenes `{ src, params, palette }`. Controllers have `pause()`,
  `resume()`, `setPalette()`, `destroy()`.
- **Placement** (print objects): `card` large, cut by the bottom-left edge; `tile` whole, low in a square
  tile; `hero` right of centre in a wide frame. Never centred dead. Photo prints and scenes fill their
  box: give it an aspect ratio.
- **Palette**: the tokens `--bg`, `--surface`, `--ink`, `--muted`, `--accent`, or that object. After a
  theme switch call `setPalette(null)` (photo prints: `setPalette(fx.readPalette(el))`). The globe's sea
  is the accent: give it a blue or teal.
- **Pause**: a turning or looping object puts a round pause button in the panel's bottom-right corner
  once it has drawn. Keep that corner clear; one mover per group.
- **Credits**: photographs a print or scene shows go in the footer's one credit line (`photos.mjs
  credits --adapted`, `creditsLine()` in `photo.js`, `credits()` in `kit.js`). A render needs none.

## Product renders

`assets/objects/product-render`: the picture of a physical thing that has no photographs or client
renders: a product of site-kind other (a bike, a lamp, a chair), hardware (a robot arm, a drone, a
device) and a game's hero object or world without art files (`sections.md`, Product and Gaming).
`build.js` turns a JSON spec of the thing's own parts into a raymarched studio render (real
materials, soft light and shadows, a softbox in glossy parts, a floor shadow, the page's accent on
the parts that ask for it); `auto.js` mounts it; `make-posters.mjs` checks the spec and prints its
posters. The README beside them is the full contract; `demo.html` shows the three worked specs in
`specs/` (`city-bike` 64 parts, `desk-lamp` 19, `robot-arm` 28; `?only=desk-lamp`, `?turn=0`,
`?fallback=1`). Copy their format, never ship one as the client's product.

### Mount

```html
<div class="frame" data-product="assets/objects/product-render/specs/<id>.json"
     data-product-place="stage"></div>
<script type="module" src="assets/objects/product-render/auto.js"></script>
```

- `data-product`: the spec's URL from the page; its posters sit beside it. Keep the spec under
  `assets/objects` (`make-posters.mjs` refuses one outside it), e.g. `product-render/specs/<id>.json`.
- `data-product-place`: `hero` (a full-bleed frame with the words over its left: the product right
  of them, drawn smaller when it is wide; under the words on a phone), `stage` (centred low in a
  full-width frame with the heading above: the `product` hero's stage, a robot maker's or a game's
  world section), `tile` (whole, low in a square), `card` (large, cut by a card panel's bottom-left
  edge), `none`. Unset: `hero` in a `.frame`, `card` in a `.panel`, `tile` in a square frame. Every
  place draws transparent over the frame's ground, so a dealt ground or effect behind it shows.
- `data-product-params` (JSON over the place's preset): `{"turn":0}` a still, `{"angle":-20}`,
  `{"step":0}` a lamp off, `{"size":0.7,"x":0.1,"y":-0.05}`.
- `data-product-palette`: `{ bg, surface, ink, accent }`; else the page's `--bg`, `--ink`,
  `--accent`. `aria-label` overrides the spec's `label`; the render sets `role="img"` with it (a button when a click
  switches it), which `product-shown` reads.
- Script: `import { loadProduct, checkSpec } from '…/product-render/build.js'`;
  `(await loadProduct(url)).mount(el, { place, params, palette })`. The controller: `pause()`,
  `resume()`, `step(on)`, `set(params)`, `setPalette(p | null)` (call `setPalette(null)` after a
  theme switch), `destroy()`. `auto.js` exports `products` (element to controller), `ready` and
  `mountAll(root)`. A spec that fails to load sets `data-product-error` on its element.

### The spec

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

- **Axes**: x the product's front, y up, z across (toward the viewer at angle 0). Any unit; the
  model is scaled so its largest side is one unit and set on the floor at its lowest point. Model
  from real measurements: proportions are most of what makes it read as the thing.
- **Keys**: `id`, `name`, `label` (what a screen reader hears), `poster` (the posters' file name,
  default the id), `angle` (rest and still turn, default -32, a three-quarter view), `turn`
  (`{"mode":"sway","amp":26,"period":22}` default, `{"mode":"spin","speed":10}`,
  `{"mode":"still"}`), `camera` (`{"elev":12}`), `click: "light"` (a click switches every `light`
  material and `glow`; it starts on), `pool` (`{"at":[x,0,z],"r":0.2}`: its light on the floor),
  `materials`, `motion`, `parts`.
- **Every part** takes `mat` (a name or an inline material), `blend` (a fillet in units where it
  meets the parts before it: welded tubes, a cast body), `in` (a motion group), `name`. It is placed
  by `from` + `to` (a linear part between them; `up` turns its section) or by `at` with `axis`
  (`"x"`, `"y"`, `"z"` or a vector) and/or `rot` ([x, y, z] degrees). `seams` on a tube, beam, box or
  cylinder (heights -1..1 along its half length, `seamWidth`, `seamDepth`) cut panel lines: a robot's shell, a base's groove.

| type | sizes | for |
|---|---|---|
| `tube` | `r`, `r2` (taper), `cap` `flat`/`round`, `round` | frame tubes, posts, rods, a tapered robot link |
| `beam` | `w`, `d`, `round` | flat bars, cranks, rails, a drone's arms |
| `box` | `size` [x,y,z], `round` | housings, bodies, pedals, grippers, crates |
| `panel` | `size` (thin) | plates, lids, a screen's back, a hull's deck |
| `cylinder` / `disc` | `r`, `h`, `round` | bases, hubs, motors, lenses, rotors |
| `sphere`, `ellipsoid` | `r` / `size` | a bulb, a bell, a knob, a buoy |
| `torus` | `R`, `r` | rings, a chainring, a status light |
| `joint` | `r`, `w`, `capMat` | a hinge knuckle about `axis` (default z) with caps |
| `wheel` | `r`, `tyre`, `rim`, `hub`, `spokes`, `spokeR`, `style` `spoked`/`disc`/`solid`, `wall`, `rimMat`, `hubMat`, `spin` | bikes, strollers, carts, casters |
| `shade` | `from` (closed) `to` (open), `r1`, `r2`, `t`, `bulge`, `innerMat` | lamp shades, bells, horns, a speaker cone |
| `seat` | `size` [length,height,width], `style` `saddle`/`cushion` | saddles, seats, cushions |
| `basket` | `size`, `style` `wire`/`slats`/`solid`, `pitch`, `wire`, `rimMat` | baskets, crates, bins, trays |
| `arc` | `R`, `a0`, `a1`, `r` or `size` | mudguards, handles, hoops, bent frames |
| `spring` | `from`, `to`, `R`, `r`, `turns` | springs, coiled cords |
| `path` | `points` (2 or more), `r`, `smooth` | handlebars, cables, bent tubes, a crane's rope |

- **Materials**: a name from `materials`, a built-in name, or `{ "kind", "color": "#hex" |
  "accent", "finish": "gloss" | "satin" | "matte" }`. Kinds: `paint` (`color: "accent"` takes the
  page's accent), `metal` (brushed alloy), `chrome`, `steel` (dark stainless: spokes, wire),
  `rubber`, `plastic`, `wood` (rings; `grain`, `scale`), `fabric` (`weave`), `leather`, `light`
  (gives light; switches with `click`). Any material takes `glow` 0..1 (a lit inner face).
  Built-in names: `accent`, `paint`, `white`, `black`, `graphite`, `alloy`, `aluminium`, `chrome`,
  `steel`, `rubber`, `plastic`, `wood`, `oak`, `walnut`, `fabric`, `leather`, `light`.
- **Motion**: up to four groups, `{ "id", "parent", "pivot": [x,y,z], "axis", "amp", "period",
  "phase", "rest" }`; a part joins with `"in"`. Each turns about its pivot (given at rest, in the
  spec's units) by `rest` + `amp` x a sine of `period` seconds, after its parent (a robot's yaw,
  shoulder, elbow, wrist). Joints move only while the product turns.

### Posters

Run after every change to a spec, on a port inside the round's window (default 5905 and the 4
after it):

```bash
node assets/objects/product-render/make-posters.mjs <spec.json> --profile <own chrome dir> --port <port>
node assets/objects/product-render/make-posters.mjs --check <spec.json>     # spec and shader only, no browser
```

It exits 1 on a fault (an unknown part type or material, an `in` naming no group, a path with
fewer than two points, more than 90 parts, a shader word a laptop GPU rejects), else writes
`<poster>.fallback-render.png` and `-render-dark.png` (the render) and `.fallback.png`, `-dark.png`
(a halftone print) beside the spec in one headless, software-rendered Chrome. The poster shows at
once and stays for good when WebGL2 is missing, a shader fails or a frame comes out empty; a spec
without posters shows nothing until WebGL draws. About 90 s for 70 parts on a CPU renderer.

### Limits

- **One live render a page**: the first one mounted turns; every other holds still until touched.
  All count in the page's four contexts (`window.__tpGl`). Phones (max-width 700px or a coarse
  pointer) and reduced motion get one sharp still frame and the context freed. A turning product
  has a pause button in its frame's bottom-right corner.
- **Cost**: every part is evaluated per ray step (skipped when its bounding sphere is beyond the
  nearest hit). About 20 parts costs like a print object; 60-70 is fine on a laptop GPU, slow on a
  CPU. Keep a spec under 90.
- **It cannot**: text or logos on the product, transparent glass, cloth that drapes, a freeform
  organic shell (a shoe, a car body, a face, a creature), anything thinner than about a texel (it
  is thickened). Those need the client's photographs or renders; a game composes its machines,
  buildings and props, never a character. A hard device shell (a drone, a camera, a sensor) is
  rounded boxes, cylinders and fillets at its real measurements, never a reason for a `split` hero
  with only an order form.
- **Craft**: include the details that name the thing (a bike's spokes, chain, mudguards, saddle
  springs; a lamp's springs, knobs, cord; a robot's caps, seams, gripper pads; a barge's bollards,
  cables and lamps). Accent on the part a maker would paint; metals and rubber stay themselves.
  Check it at 1440 and 390 before it ships.
- **Never** a product of another kind, never on a place page, never captioned or called a render,
  model or illustration on the page; it is the thing's picture, not an effect (on tech an effect
  may sit behind it, never beside it as a second beat).

## GPU cost

| Family | Class | Contexts |
|---|---|---|
| Print objects | high per frame (raymarch), only while it moves near the screen; at rest one sharp frame, kept | share 2 |
| Photo prints | low, still at rest | 1 each, at most 3 |
| Scenes | low, drawn only while moved or stepping | at most 2 |
| Product render | high per frame (raymarch, cost grows with parts), only while it turns near the screen; one sharp still at rest, on a phone and under reduced motion | 1 |

With the page's grounds and effects: **at most 4 live WebGL contexts**. Freed off screen and in a hidden
tab; one still frame under reduced motion.

## Never

- **Captioned.** No line under a render or print explaining or apologising ("made in code", "a
  stand-in"). The heading says what the thing is; credits go in the footer.
- **Animated on scroll,** except inside the dealt big scene (`fixed-hero-object`,
  `object-through-giant-type`). Elsewhere only its own slow turn, the pointer and a click.
- **Over the hero photograph**, or in place of the client's photographs.
- **Empty.** A failed shader or missing WebGL leaves its poster. After a shader change run
  `_print-core/lint-glsl.mjs` and `_scenes/lint-glsl.mjs`: no GLSL ES reserved words as names. A
  product spec: `product-render/make-posters.mjs` (the check and the posters in one).
