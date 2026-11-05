# Objects (`assets/objects/print-*`)

Everyday things modelled in 3D in code: a cup and saucer, a bicycle wheel, a desk lamp, a desk globe,
playing cards. Each one is shown as a **render** (the default: a studio render in its own materials,
the page's accent on one part, soft shadows and the reflections of a softbox) or as a **print** of
that render (halftone, engraving, dither or type). It turns slowly, leans toward the pointer and
takes one small step on a click (the lamp switches on, the cards fan out).

**Where it goes**
- **A product page without photographs**: the object of the product's own kind is the product's
  picture: the hero (`hero` preset, or `tile` in a hero split) and the statement's picture, as a
  render. A desk lamp for a lamp maker, a cup for a tableware maker, a wheel for a maker of wheels.
  Never an object of another kind: a wheel does not show a whole bicycle, a cup does not show a
  coffee machine. No object of its kind: compose the product itself from a spec of its parts
  with `../product-render` (its README), never `hero-product` without the product's picture.
- **A software, tech or games page**: the one moment on a feature card or a wide frame, about the
  thing the card says (a globe for regions, cards for a games feature). Here a print fits.
- **Not on a place page** (a cafe, a shop, a hotel, a studio people visit) and not beside the
  client's own photographs: those lead with photographs.
- Prints (halftone, engraving, dither, type) only on software, tech, AI and games pages. A product
  page shows the render.
- No caption under it, and no words calling it a render, a drawing, an illustration, a model, a
  sample or a stand-in. The section's heading and text say what the product is. Leave
  `aria-label` alone or name the thing plainly ("A desk lamp, switched on").

| id | the render | prints | click |
|---|---|---|---|
| `print-cup` | porcelain cup of coffee on its saucer, the glaze in the accent | halftone, engraving | rings run across the coffee |
| `print-wheel` | road wheel: tan-wall tyre, alloy rim, 24 spokes, hub in the accent | halftone (spokes as solid lines) | it spins up |
| `print-lamp` | balanced-arm desk lamp: stepped base, paired rods, chrome springs, a domed shade; base and shade enamelled in the accent | halftone | it switches on |
| `print-globe` | desk globe, real coastlines, brass meridian, walnut stand | engraving | it spins |
| `print-cards` | playing cards, the ace of diamonds face up, backs in the accent | halftone | the cards fan out |

`index.json` lists them; each folder's `meta.json` has the object's own notes, and `demo.html` shows
it full screen with switches for the picture and the paper.

## Put one on a page

```html
<!-- a split section's visual (references/sections-library.md): whole, standing low -->
<div class="frame frame--square">
  <div data-print="print-lamp" data-print-place="tile"></div>
</div>

<!-- a feature card: large, cut by the panel's bottom-left edge -->
<article class="card card--row">
  <h3>Regions</h3>
  <p>Pick where your data lives: 14 regions on four continents.</p>
  <div class="panel" data-fx="grain-gradient" data-fx-params='{"speed":0,"grainMotion":0}'>
    <div data-print="print-globe" data-print-params='{"effect":"engrave"}'></div>
  </div>
</article>

<!-- once, after system.js -->
<script type="module" src="assets/objects/_print-core/auto.js"></script>
```

- `auto.js` mounts every `[data-print]`. The host is an empty `div`; in a `.panel`,
  `.panel__screen` or `.frame` it fills it and draws over the panel's ground.
- **Where it sits** (`data-print-place`, or picked from the box it is in):
  - `card` in a `.panel`: large, cut by the bottom-left edge, as on x.ai's and Figma's feature
    cards; the bottom-right corner stays clear for the pause button. In a panel about as tall as wide
    (a card on a phone) it is cut less, so the thing still reads. The card's text sits above the
    panel, never over the object.
  - `tile` in a `.panel--top` or a square frame: whole, standing low.
  - `hero` in a wide `.frame`: large, right of centre, the text in the clear left half. In a frame
    about as tall as wide (a phone) it sits smaller and low, under the text.
  - `none`: centred on its own paper.
- **Options**: `data-print-params='{"angle":-20}'` over the preset (every param is in `meta.json`);
  a print: `data-print-params='{"effect":"halftone"}'`. `data-print-palette='{"bg":..,"ink":..,"accent":..}'`.
- **Colours**: on a dealt ground it draws on that ground's paper with an ink that reads on it and the
  page's accent; elsewhere in the page tokens (`--bg`, `--surface`, `--ink`, `--accent`). The accent
  goes on one part (the glaze, the hub, the shade and base, the card backs; the globe's sea when the
  accent is a blue or teal).
  Until that ground has drawn (it bakes one panel at a time, slowly on a CPU renderer, and a bake can
  fail), the object lays the ground's paper under itself, flat, and gives it back when the ground
  draws (`data-print-paper` is `own` or `ground`), so a print for dark paper never stands on a pale,
  undrawn panel. `blank-ground.html` tests it (`data-ready` is `pass` or `fail`).
- **One loop per group**: one object per card group turns by itself (the first, or the one with
  `data-print-loop`); the others hold still until the pointer reaches their card. A turning object
  puts its own round pause button in the panel's bottom-right corner once it has drawn (never on a
  poster): keep that corner clear.
- **Script**: `import obj from '<assets>/objects/print-cup/object.js'; const ctrl = obj.mount(el,
  { place: 'card', params: {...}, palette: {...} })`. The controller has `pause()`, `resume()`,
  `step(on)`, `set(params)`, `setPalette(p | null)`, `destroy()`. `auto.js` exports `prints`, a Map
  from element to controller; on a theme change call `setPalette(null)` on each.

## Do and don't

- One object per card group, at most two in view, and never over a moving ground: the ground holds
  still (`"speed":0,"grainMotion":0`). On a product page a plain lit ground or the page's surface.
- The object is the picture. No UI fragment over it, no second effect beside it.
- Never centred dead in a card panel with even ground all round: use the presets.
- Never animated by scroll. It moves only by its own slow turn, the pointer and a click.
- The client's own photographs and screenshots come first; an object never takes their place.

## It always shows a picture

- A **poster** shows at once: the object drawn ahead of time (`fallback-render.png`, or
  `fallback.png` for a print), in the page's palette, where the live picture will be. The live
  picture fades in over it.
- Every shader source is checked for words a laptop's GPU rejects before it is compiled
  (`glslProblems` in `print3d.js`: GLSL ES reserved words, a qualifier such as `flat` used as a
  name, names of built-in functions, double underscores). CPU-rendered Chrome compiles some of
  these, so a screenshot never proves a shader builds on a real GPU. Run
  `node assets/objects/_print-core/lint-glsl.mjs` after changing a model (exit 1 on a problem).
- A shader that fails the check, fails to compile or link, no WebGL2, a lost context, or a first
  frame that comes out empty: the poster stays, never an empty ground. Tests force each case with
  `window.__printBreak = 'compile' | 'link' | 'reserved' | 'empty'` before the object mounts, or
  `?fallback=1` on a demo page (no WebGL2).

## Light on a laptop GPU

- All objects of a page share **2 live WebGL contexts** (`config.maxLive` in `print3d.js`), so a page
  with its baked grounds and one other effect stays within 3.
- An object holds a context only while something on it moves near the screen (its turn, the
  pointer, a step). A still object draws once, keeps that frame as a plain picture and frees its
  context; it takes one again when the pointer comes onto its card. Off screen (beyond 40% of a
  screen) or in a hidden tab its context is freed.
- The raymarch runs at most 1 texel per CSS pixel (0.75 x 0.75 once the frame passes about 0.48
  megapixels); dither runs 1 texel per cell and its canvas holds one pixel per cell, scaled up
  crisp; no canvas passes about 1.5 megapixels. Slow frames lower the texels, then the march steps,
  then stop the turn.
- A render at rest (an object that does not turn, the frame kept when its context is freed, a
  reduced-motion frame) is drawn once more at up to one texel per canvas pixel (`config.fineTexels`,
  1.2 megatexels), so the picture that stays on the page is sharp. One frame, never a loop.
- Under `prefers-reduced-motion`: one still frame, kept as a picture, and the context freed at once
  (none held at rest); no hover, no pause button; a click shows the step at once.

## Posters

`make-fallbacks.html` makes every object's posters (open `?ids=print-cup` for one): `fallback.png`
and `fallback-dark.png` are print plates (red ink, green accent, blue the silhouette);
`fallback-render.png` and `fallback-render-dark.png` are twice as wide: the plates on the left (red
the floor's shadow, green the accent part, blue the coverage) and the render in colour on the right,
its accent part in a neutral grey that the page's accent replaces. An object whose picture depends on
the palette lists extra plates (`plates`) and picks them with `poster(palette, dark, render)`: the
globe has `-sea` posters for a blue accent. Make them again after every change to a model.

## A new object

`definePrint({ id, name, label, press, base: import.meta.url, glsl, pivot, radius, extent, camera,
turn, step, params, place, update, texture, poster, plates, posterPrint })` in `<id>/object.js`,
where `glsl` defines `vec2 map(vec3 p)` (distance, material id; y up, the floor at y = 0) and
`void surf(float id, vec3 p, vec3 n, inout Surf s)`, which sets the print's tone (`albedo`, `gloss`,
`wire`, `lo`, `hi`) and, when `u_render > 0.5`, the render's material (`col` in linear colour,
`metal`, `gloss`, `shine`, `accent`). The header of `print3d.js` lists the rest. Model it as the
real thing (proportions, parts, materials) so the render reads as a product shot, not a drawing;
run the lint, make its posters, and check it at 1440, 820 and 390 on light and dark paper. If it
still looks cheap after two honest tries, drop it.
