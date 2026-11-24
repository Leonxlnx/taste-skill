# Effects usage

Who gets effects, how many, how they are dealt and where they sit. An effect is anything a shader,
canvas, WebGL, a print pass or a scroll drive makes: effect grounds (`data-fx`, `assets/effects`),
the WebGL creative parts (`effects-creative.md`), objects and prints (`effects-objects.md`), big
scenes (`scenes.md`), the WebGL moment (`liquid-hover`; the other moments are not effects,
`moments.md`), a film or 3D hero and timed loops. `cards.md` wins on
any card detail; `motion.md` holds every timing.

## The fit rule (house rule 8)

Effects are dealt by fit, like the moments and the scenes (`moments.md`, The fit rule): each effect's
`meta.json` carries `tones`, `intensity` and `webgl`, and `effects.mjs pick --page <kind>` deals
only what the page's kind takes.

| page kind | effects it is dealt |
|---|---|
| tech (hardware), software, gaming | any effect whose tones the kind takes (tech: product, tech, editorial; software: tech, editorial, product; gaming: playful, tech), any intensity |
| place, service | none: the plan says "no WebGL" there, and every effect is a shader, the quiet treatments too |
| product | none. For hardware eligible for shaders, use `--page tech` |

Quiet treatments also use WebGL. The dealer keeps them off place, service and product pages.

- `grain-gradient`: soft page colours under still-looking film grain; it reads as printed paper, not
  as a screen.
- `soft-light-bars`: light through slats on a wall, breathing slowly; it is the window light of a
  room in the morning.
- `line-engraving`: still engraved lines like a banknote or an old print; a law firm, a bookshop, a
  roastery's label.
- `film-light-leak`: light bleeding in at the edge of a dark or coloured frame with film grain; a
  bar, a photographer, a night kitchen (dark and colour pages only).
- `duotone-grade`: never dealt, only named (`--slots hero:duotone-grade`), as a calm study of
  window light; never on a client's photograph.

Kept off place and service, and why: the light shows (`orb-sphere`, `spotlight-cone`, `god-rays`,
`prism-dispersion`, `aurora-curtains`, `caustics`) are stage lighting with a subject of their own;
the patterns (`grid-pulse`, `dotted-globe`, `dot-terrain`, `ruled-grounds`, `contour-lines`,
`ridgeline`) and the dithers (`ascii-shade`, `bayer-dither`, `halftone-screen`) read as data or code;
`gradient-mesh`, `silk-folds`, `fluted-glass` and `painterly-landscape` are made to sit under a UI
`edge-glow` lights a prompt box. Use a flat interface on place, service and product. Choose the lead picture with the ladder in `photos.md`. A built drawing, chart or working control can show the subject. Keep shaders, tech gradients, glass and prints off these pages. A requested 3D product view can use its own rendered still.

## What each kind gets

| | tech | product, service (other) | place |
|---|---|---|---|
| Lead picture | Client art, product UI or built world | Product, work or a drawing of it | The place or its region |
| The one effect | A live ground, WebGL part or object | None | None |
| Card panel grounds | One group from the effect's family, held still | Flat ground | Flat ground |
| Big scene | 0 or 1, dealt by fit (`scenes.md`) | 0 or 1, dealt by fit | 0 or 1, dealt by fit |
| Diagram cards | 0 to 2, pulsing | 0 or 1 | none |
| Loops | inside card visuals, one per card group | inside card visuals | inside card visuals |
| CSS grounds | 0 to 2 (`backgrounds.md`) | flat tokens | flat tokens |

**Show the subject first.** Put the product or game world in the hero. Use `photos.md` for missing pictures. Keep the effect behind the subject and the photograph free of filters.

## Tech budget

- **One effect:** one live ground (the hero ground, or a ground inside the one framed
  `[data-visual]` window under an h2), or one WebGL part (an `fx-*` that holds a context: the button
  fill, a search or prompt glow, the edge-glow plan, spotlight, globe, avatar, logos, progress,
  dither object, filled headline or stat), or one object. A dealt big scene is a beat of its own
  beside it, in another section; a scene dealt as the hero takes the effect's place (the plan deals
  none then), and a game's effect goes on a band, never over its key art. A grain, dither or
  texture CSS ground counts as it. Never in a fixed layer, never behind body copy, never a
  page-long canvas; a 3D world lives in the hero only.
- **Card grounds** (house rule: "gradients and effects ... as a card's background with a smaller
  card of text or UI on top"): one card group may hold quiet grounds from the effect's family,
  drawn once and held as pictures (system.js frees their contexts); not a second live effect. With
  a big scene the one dealt effect is the only `data-fx` outside a moment (a second FAILs, MO-16,
  MO-23): the card panels take the lit ground (`data-ground`).
- **Moments and scenes.** Follow the PLAN's host for each. A text moment belongs on an existing heading unless the notes hold the page's main claim. See `moments.md` for carries and counts. Keep a calm section between two scrubbed parts.
- **One pointer effect** a page: a hover or liquid moment, `fx-button`, `fx-spotlight` or an object
  that turns to the pointer, never two. Never a replaced cursor, never a magnetic button.
- **At most four live WebGL contexts** at once (house rule): the effect plus the moments' own canvases;
  `perf.mjs` fails above four.

## Deal the effect, never by taste

`node <skill>/scripts/effects.mjs list` shows each id with its family, `quiet` or `focal`, and its
slots. `<kind>` is the page's ground: `light`, `dark` or `colour`; `<site-kind>` is the page's kind (on place, service and product one slot, `--slots hero` or `--slots band`).

```bash
# the effect: an effect hero takes --slots hero; a photograph or UI hero puts it in the one [data-visual] frame: --slots band;
# a game always --slots band (its key art is the hero); start.mjs plan does all of this
node <skill>/scripts/effects.mjs pick --page <site-kind> --palette <kind> --slots hero --quiet --seed <S> --history .taste-skill/effects-history.json
# one card group's still grounds, same family (a pattern or dither effect: --family mesh)
node <skill>/scripts/effects.mjs pick --page <site-kind> --palette <kind> --slots card --family <the effect's family> --exclude <the effect>,<NOUI> --quiet --seed <S> --history .taste-skill/effects-history.json
```

`--quiet` leaves out only the focal grounds, not the patterns. When the slot holds UI (a window, a
fragment, a card group), add the patterns and prints to `--exclude`; `<NOUI>` is
`ruled-grounds,grid-pulse,contour-lines,dot-terrain,dotted-globe,ridgeline,halftone-screen,bayer-dither,ascii-shade,line-engraving,duotone-grade`.

- **Quiet** grounds are an even field that holds UI (`grain-gradient`, `painterly-landscape`,
  `gradient-mesh`, `silk-folds`, `fluted-glass`): a soft field behind UI, never a pattern. **Focal**
  grounds have a subject (`orb-sphere`, `spotlight-cone`, `god-rays`, `aurora-curtains`,
  `caustics`): alone in the hero, nothing over them.
- Two ids a page at most outside the moments; each panel its own `data-fx-seed`. No echo of the
  effect in the close, no pattern panel, no focal tile. `dotted-globe` only by name, for global
  reach, as the effect; `duotone-grade` never on a client's photograph. If `pick` says nothing fits
  a slot, drop the slot.
- A visual on `.ground-inverse` takes an id made for that kind (`--palette dark`).
- Retired or renamed ids never appear: `mesh-gradient` is `gradient-mesh`, `iridescent-foil` is
  `fluted-glass`; `riso-print`, `paper-texture` and `liquid-chrome` are gone.

## Deal the moments and the scene

`start.mjs plan` runs the motion dealer. For a direct pick pass the actual section count, material in the copy notes and the dealt effect:

```bash
node <skill>/scripts/moments.mjs pick --page <kind> --sections <N> --carry <material> --scene deal --effects <id> --history .taste-skill/history.json
```

Use the printed host and the matching recipe in `moments.md` or `scenes.md`. A scene needs its own material.

## Where things sit

- **The effect:** the hero (`.frame.frame--hero` holding a `.stage.stage--fade-b`, or the hero's
  layer), or the one `[data-visual]` frame under an h2 (a window up to 1280x540 at 1440, 342x256 at
  390), or the scene's own section. One `[data-visual]` a page. A hero with an effect in a frame is
  a 5/7 or 6/6 split with the visual right, or moves the effect to its own section; an effect as the
  hero's layer (a game's world, a focal ground) keeps the words on its calm part at 4.5:1.
- **Split frame:** `.frame.frame--split` holding a `.stage`; a window `.at-corner.to-edge` at 56/56,
  cut by the right and bottom; a second piece (`cursor`, `notify`) only over a window's lower-right
  edge (`.at-over`), hidden from 1024 to 1279 and on a phone. Text and UI never share a half.
- **Card panels:** `cards.md` (the panel, the fragment on it, fades, the lit palettes, the loop).
- **Text over an effect** only on its quiet part at 4.5:1 or more; a noise or fog ground never holds
  content.
- **Video** (tech, hero or `[data-visual]` only, as the effect or loop): muted, inline, poster
  first, a 6 to 12 s loop or a story that plays once and holds its last frame, a pause button,
  separate phone and desktop files. On other a still that opens the film on a click.
- **The lit ground** (`<html data-ground>`, tech): system.js gives it to every ground that holds UI,
  so page, card, panel and UI are never four near-black layers.

## Motion and cost

- The effect reacts to the pointer or to time (the scene and a moment may react to scroll); after
  assembling it holds, with no constant churn; ambient cycles 4 s or longer, a drift of a few px a
  second, 2 to 10% of pixels changing in 0.9 s; it is still at rest or has a pause button; it shows
  a poster first and a still fallback under reduced motion, on a phone and when WebGL fails. Never
  sound on entry; pointer play off on touch.
- Draw an effect 20 to 25px larger than its box and clip it. One sample per CSS px or less (0.75
  when large), about 1.5 megapixels, pixel ratio 1.5 at most; noise, particles and ray marching at
  half resolution and 30fps or less. A noise ground is one baked texture drifting on time; a caustic
  net is its flat floor net only.
- Blend modes only for a job inside the effect (a glint), never on text. No glass or frosted look on
  any kind: a menu curtain is a flat 40% dim.
- system.js mounts grounds (`ui.grounds`), never `fx.mountAll` from a page script. After any shader
  change run `lint-glsl.mjs` in `assets/objects/_print-core` and `_scenes`: never a GLSL ES reserved
  word (`flat`, `smooth`, `sample`, `filter`, `input`, `output`...) as a name; every WebGL piece
  shows its still fallback when its shader fails. Speed: `perf.md`.

## Never

- An effect, print, grain, gradient or WebGL on a page of kind other; an effect where a photograph
  belongs.
- A print, dither, grade or filter over a photograph, on any kind.
- A live effect or a moving canvas inside a card; a card that animates on scroll.
- A caption explaining a visual (credits go in the one footer line); blinking or random effects;
  violet or lavender.
- A site's code, assets or signature device copied: take only the generic idea, built from the
  skill's own scenes and moments with the client's content.
