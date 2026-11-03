# Product render (`assets/objects/product-render`)

A studio render of **any physical product**, composed from a short JSON spec: a list of parts with
sizes and positions in the product's own units. `build.js` turns the spec into a model and
`_print-core/print3d.js` renders it: real materials (painted metal, alloy, chrome, rubber, wood,
fabric, leather, plastic, a light), soft studio light with soft shadows, a softbox in glossy parts, a
floor shadow, the page's accent on the parts that ask for it. It sways slowly as a turntable, or holds
still; a lamp switches on and off on a click; a robot's joints move.

Use it for a **product without photographs**: the render is the product's picture, in the hero and
the statement. Never for a product that has photographs, never on a place page, never captioned,
never a product of another kind. One product render a page.

## Mount

```html
<div class="frame" data-product="assets/objects/product-render/specs/my-stroller.json"
     data-product-place="hero"></div>
<script type="module" src="assets/objects/product-render/auto.js"></script>
```

- `data-product-place`: `hero` (right of the text, smaller when the product is wide; under the text
  in a phone-shaped frame), `stage` (centred, a full-width product section), `tile` (whole, low in a
  square), `card` (large, cut by a card panel's bottom-left edge).
- `data-product-params`: `{"angle":-20}`, `{"turn":0}` (a still), `{"step":0}` (a lamp off), `{"size":0.7,"x":0.1,"y":-0.05}`.
- `data-product-palette`: `{ bg, surface, ink, accent }`; else the page's tokens `--bg`, `--ink`, `--accent`.
- Script: `import { loadProduct } from '.../product-render/build.js'; const p = await loadProduct(url);
  const ctrl = p.mount(el, { place: 'hero' });` The controller: `pause()`, `resume()`, `step(on)`,
  `set(params)`, `setPalette(p | null)`, `destroy()`. `auto.js` exports `products` and `ready`.

## Posters: run this after every change to a spec

```
node assets/objects/product-render/make-posters.mjs path/to/spec.json --profile <own chrome dir> [--port 5905]
node assets/objects/product-render/make-posters.mjs --check path/to/spec.json      (spec and shader only)
```

It checks the spec (unknown parts or materials, more than 90 parts, shader words a laptop GPU
rejects), then prints four posters beside the spec in a headless, software-rendered Chrome:
`<poster>.fallback-render.png`, `-render-dark.png` (the render) and `.fallback.png`, `-dark.png` (a
halftone print). The poster shows at once, is lit again in the page's accent, and stays for good when
WebGL2 is missing, a shader fails or a frame comes out empty. A spec without posters shows nothing
until WebGL draws, and nothing at all without it. Keep the spec under `assets/objects`.

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

## Behaviour and limits

- **It always shows a picture**: the poster at once, the live render over it; the poster stays when
  WebGL fails. Under `prefers-reduced-motion`, and on a phone (max-width 700px or a coarse pointer),
  one still frame, drawn sharp, and the context freed. A turning product has a pause button in its
  frame's bottom-right corner.
- **At most one live context** for a product: only the first product render mounted turns; a
  second holds still until touched. The page's cap of 4 contexts (`window.__tpGl`) counts it.
- **Cost**: every part is evaluated per ray step, skipped when its bounding sphere is further than
  the nearest part so far. About 20 parts renders like a print object; 60-70 (a bicycle with its
  spokes) is fine on a laptop GPU and slow on a CPU renderer (posters: about 90 s). Keep under 90.
- **What it cannot do**: text or logos on the product, transparent glass, cloth that drapes, a
  freeform organic shell (a shoe, a face, a car body), anything thinner than about a texel (it is
  thickened). For those: the client's photographs or renders, never this.
- **Never** a product of another kind, never on a place page, never a caption under it.

The three specs in `specs/` (a city bicycle, a desk lamp, a robot arm) are worked examples:
`demo.html` shows them (`?only=desk-lamp`, `?turn=0`, `?fallback=1`).
