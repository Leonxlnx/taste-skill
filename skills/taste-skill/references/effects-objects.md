# Objects and prints (`assets/objects`)

Thirteen objects in three families; each family's README is the contract, each `meta.json` the params.
`assets/objects/index.html` shows them all.

| Family | Objects | What it is |
|---|---|---|
| Print objects | `print-cup`, `print-wheel`, `print-lamp`, `print-globe`, `print-cards` | a thing modelled in code: a studio render (default) or a print of it (halftone, engraving, dither); `_print-core/README.md` |
| Photo prints | `photo-halftone`, `photo-engraving`, `photo-dither` | one real photograph printed by a shader, the photograph under the pointer; `photo-kit/README.md` |
| Scenes | `split-reveal`, `dither-sequence`, `dot-object`, `exploded-layers`, `product-turntable` | photographs (the turntable: a generic form) through a print, alive under the pointer; `_scenes/README.md` |

## When to use one

- **One strong object moment a page.** Never beside a second effect or over a moving ground.
- **Place, service and every page of site-kind other** (cafe, guesthouse, shop, studio, clinic,
  product brand): none; plain photographs lead. Leon, 1 Nov 19:45: shader effects only where the
  trade has a technical subject.
- **Product with photographs**: the photograph leads.
- **Product of site-kind other without photographs** (a lamp maker, a chair, a bike): no object and
  no render (MO-08, Leon's rule 8); the shot ladder, then the short page (`photos.md`,
  `sections.md` Product).
- **Technical product (hardware) without photographs**: the client's render leads; else an object
  of its own kind, as a render, in the hero and the statement, only when a kit holds that kind (a
  `print-*` here, or `fx-dither-object`'s drone, camera or headphones, `effects-creative.md`); else
  the `split` hero (`deal.mjs --type product --hero split`) with the client's order form as live
  HTML in its frame on the effect's lit ground, specs as `rows--spec`, how it moves as a lanes
  diagram card. Never `hero-product` without the object, never an object of another kind, a drawn
  SVG or a model built of primitives.
- **Software, AI, games**: a print object as a print on the card it is about (a globe for regions);
  a game's own world object for `fixed-hero-object` (`scenes.md`).
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

## GPU cost

| Family | Class | Contexts |
|---|---|---|
| Print objects | high per frame (raymarch), only while it moves near the screen; at rest one sharp frame, kept | share 2 |
| Photo prints | low, still at rest | 1 each, at most 3 |
| Scenes | low, drawn only while moved or stepping | at most 2 |

With the page's grounds and effects: **at most 4 live WebGL contexts**. Freed off screen and in a hidden
tab; one still frame under reduced motion.

## Never

- **Captioned.** No line under a render or print explaining or apologising ("made in code", "a
  stand-in"). The heading says what the thing is; credits go in the footer.
- **Animated on scroll,** except inside the dealt big scene (`fixed-hero-object`,
  `object-through-giant-type`). Elsewhere only its own slow turn, the pointer and a click.
- **Over the hero photograph**, or in place of the client's photographs.
- **Empty.** A failed shader or missing WebGL leaves its poster. After a shader change run
  `_print-core/lint-glsl.mjs` and `_scenes/lint-glsl.mjs`: no GLSL ES reserved words as names.
