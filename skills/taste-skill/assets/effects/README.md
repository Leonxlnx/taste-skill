# Effects

25 effect grounds drawn in code, for hero frames, feature cards and bands. Each one takes all its
colours from the page palette. Nothing here loads a video or another library; only the photo grade
takes an image, the section's own photograph.

- `gallery.html` shows every effect live, with a palette switcher, a random pick and the UI kit's
  feature cards. `lab.html` has a slider for every param and card, wide and hero layouts.
- Both pages need http, not `file://`. Run `node scripts/effects.mjs serve --port 5230` and open
  `/assets/effects/gallery.html`.

## Mount

Give an element a size and a `data-fx` id, then mount every one on the page:

```html
<div class="panel" data-fx="caustics" data-fx-seed="21"></div>

<script type="module">
  import fx from './assets/effects/fx.js';
  fx.mountAll(document);
</script>
```

- **Palette.** Each element reads `--bg`, `--surface`, `--ink`, `--muted`, `--accent` and
  `--accent-ink`, or `--fx-bg` and the other `--fx-*` names, which win. You can also pass one:
  `fx.mountAll(document, { bg, surface, ink, muted, accent, accentInk })`. To change a single colour
  on one element, use `data-fx-palette='{"accent":"#..."}'`.
- **Seed.** `data-fx-seed` fixes the composition. Without a seed you get a new picture on every load.
- **Params.** `data-fx-params='{"speed":0.3}'`. `index.json` lists each param with its range. Text on
  an effect: set `calmX` and `calmY` (0 to 1 of the frame) to where the text sits. The effect keeps that
  area quiet.
- **One element.** `const c = await fx.mount(el, 'caustics', { palette, seed, params })`. The result `c`
  has `pause()`, `resume()`, `set(params)`, `setPalette(p)` and `destroy()`.
- **Built in.** An effect stops drawing when it leaves the screen or the tab is hidden. Under
  `prefers-reduced-motion` it shows one still frame. Without WebGL it shows a CSS picture in the same
  colours. Device pixel ratio is capped (1.75 unless an effect needs crisp pixels). When a page has
  more than 14 live WebGL contexts, the idle off-screen ones are freed first.
- Put text and UI fragments inside the element. The canvas sits under them (`z-index: -1` in an
  isolated element).

## Random pick

A page gets its effects dealt, never chosen by taste. One effect per slot: `hero` is the hero or a
large split frame, `card` is a card group, `band` is a wide band or the closing call to action, and
`footer` is the footer. Only effects made for the page's palette kind (`palettes` in meta.json) and
that slot are dealt, never the same id twice on one page (when every effect for a slot is on the
page already, one repeats with its own seed and pick prints a note). The command needs `--palette`;
in the browser, a call without a palette deals only effects made for all three kinds. Ids from
recent pages and second picks from a family already dealt are less likely. Two effects that list
each other in `avoidWith` never share a page.

A **focal** ground (`"focal": true`) has its own subject: a sphere, a beam, peaks, a pool of light.
It takes one compact UI piece, never a big window, a screenshot or text. `--quiet` (`quiet: true` in
the browser) deals only the even, **quiet** grounds, for a slot that carries a big window.

Four effects are never dealt (`"random": false` in meta.json): `dotted-globe` (a literal subject, only
for a product whose reach is global: payments, infrastructure, logistics, networks), `duotone-grade`
(grades the section's own photograph), `edge-glow` (the lit border of the one key object, a prompt box
or the featured plan) and `ridgeline` (the divider band in `assets/components/fx-band`). Name one in
its slot when the content calls for it. It is still refused on a palette kind or a slot it is not made
for, when the same id is named twice, and next to an effect it avoids (named or passed in `--exclude`):

```bash
node scripts/effects.mjs pick --palette dark --slots hero,card,band --seed 4821 --history .taste-skill/effects-history.json
node scripts/effects.mjs pick --palette dark --slots hero:dotted-globe,card,band --seed 4821 --history .taste-skill/effects-history.json
```

In the browser, the same code:

```js
import { pick } from './assets/effects/pick.js';
const index = await fetch('./assets/effects/index.json').then(r => r.json());
const { picks } = pick(index.effects, { palette: fx.paletteKind(palette), slots: ['hero', 'card', 'card'], history });
// picks: [{ slot: 'hero', id: 'god-rays' }, ...]; history: the ids of earlier picks, oldest first
// a named slot: slots: ['hero:dotted-globe', 'card'] (or { slot: 'hero', id: 'dotted-globe' })
```

`fx.paletteKind(palette)` gives `light`, `dark` or `colour` from the background colour.

## The list

| id | Name | Family | Slots | Palettes | Ground | Motion |
|---|---|---|---|---|---|---|
| `film-light-leak` | Film light leak | Grain | hero, card, band | dark, colour | focal | slow |
| `grain-gradient` | Grain gradient | Grain | hero, card, band, footer | light, dark, colour | quiet | slow |
| `ascii-shade` | ASCII shade | Dither | hero, card, footer | light, dark, colour | focal | slow |
| `bayer-dither` | Bayer dither | Dither | hero, card, band, footer | light, dark, colour | quiet | slow |
| `halftone-screen` | Halftone screen | Dither | hero, band | light, dark, colour | quiet | slow |
| `line-engraving` | Line engraving | Dither | hero, card, band | light, dark, colour | quiet | still |
| `aurora-curtains` | Aurora curtains | Mesh | hero, band, footer | dark, colour | focal | slow |
| `gradient-mesh` | Gradient mesh | Mesh | hero, card, band | light, dark, colour | quiet | slow |
| `painterly-landscape` | Painterly landscape | Mesh | hero, card | light, dark, colour | quiet | slow |
| `god-rays` | God rays | Light | hero, band | dark, colour | focal | slow |
| `orb-sphere` | Light orb | Light | hero, card, band | light, dark, colour | focal | slow |
| `prism-dispersion` | Prism light | Light | hero, card, band | dark | focal | slow |
| `soft-light-bars` | Soft light bars | Light | hero, card, band, footer | light, dark, colour | focal | slow |
| `spotlight-cone` | Stage spotlight | Light | hero, card | dark, colour | focal | slow |
| `caustics` | Water caustics | Light | hero, card, band | light, dark, colour | focal | slow |
| `edge-glow` | Edge glow (named only) | Light | card | light, dark, colour | border | slow |
| `dot-terrain` | Dot terrain | Pattern | hero, card, band | light, dark, colour | quiet | slow |
| `grid-pulse` | Grid pulse | Pattern | hero, card, band | light, dark, colour | quiet | slow |
| `ruled-grounds` | Ruled dot ground | Pattern | card, band | light, dark, colour | quiet | slow |
| `contour-lines` | Topographic contours | Pattern | hero, card, band, footer | light, dark, colour | quiet | slow |
| `dotted-globe` | Dotted globe (named only) | Pattern | hero, card, band | light, dark, colour | focal | slow |
| `ridgeline` | Ridgeline (named only) | Pattern | band | light, dark, colour | focal | slow |
| `fluted-glass` | Fluted glass | Material | hero, card, band | light, dark, colour | quiet | slow |
| `silk-folds` | Silk folds | Material | hero, card, band | light, dark, colour | quiet | slow |
| `duotone-grade` | Duotone grade (named only) | Photo | hero, card, band | light, dark, colour | quiet | still |

Each effect's one-line description is the `look` field in `index.json`. `node scripts/effects.mjs list`
prints this table, and you can filter it with `--family`, `--on`, `--palette`, `--motion` and
`--quiet`. A filter value that does not exist is an error, not an empty list.

Retired on 31 Oct because they looked bad or cheap: `riso-print`, `ink-bloom`, `liquid-chrome`,
`metaballs`, `brushed-metal` and `paper-texture`, then `terrazzo-speckle` (a kitchen floor),
`marble-warp` (zebra stripes), `pixel-mosaic` (broken JPEG blocks), `truchet-arcs` (thick grey
worms) and `soft-particles` (stock bokeh). They are not in the
index. `ridgeline` reads as a record cover when dealt on its own, so it is named only.

## Commands

```bash
node scripts/effects.mjs index      # rebuild index.json from every <id>/meta.json and effect.js
node scripts/effects.mjs gallery    # write gallery.html and lab.html from scripts/*.template.html
node scripts/effects.mjs publish    # the gallery as one folder: publish/index.html, effects/, ui/, files.json
```

Edit the templates in `scripts/`, not `gallery.html` or `lab.html`. `publish` rebuilds both pages,
then copies only the files the gallery loads. `files.json` lists them, all at relative paths.

## Adding an effect

A folder `<id>/` with two files:

- `meta.json`: `id`, `name`, `family` (grain, dither, mesh, light, pattern, material or photo),
  `look` (one sentence), `bestOn`, `palettes`, `motion` (`still`, `slow` or `interactive`) and `cost`.
  Optional: `"random": false` for a literal subject that is only named, never dealt; `"focal": true`
  for a ground with its own subject; `avoidWith` (ids that never share its page); `subjects` (what a
  named effect is for).
- `effect.js`: `export default { id, name, family, params, mount(el, { palette, params, seed }) }`.
  `mount` returns `{ destroy, pause, resume }`.
  - For a fragment shader, use `fx.shader(el, { frag, schema, params, palette, seed, fallback })`. It
    handles the canvas, the lifecycle, the DPR cap, the context budget and the CSS fallback.
  - For canvas 2D, use `fx.lifecycle(el, { draw })`.
  - An effect that makes its own WebGL context calls `fx.glBudget(holder)` just before, so the
    context counts in the page's budget (see `dotted-globe`).

Every colour comes from the palette, mixed in OKLab (`fx.color`). Never use a fixed hue, and never
default to violet or lavender. Text on an effect must read at 4.5:1. Keep shader code small enough to
compile fast: the D3D compiler behind Chrome on Windows inlines every function call. A helper called
16 times took 40 s to compile. Loops counted by a uniform avoid that (see `halftone-screen`). Run
`index`, then check the effect in the gallery in light, dark and colour.
