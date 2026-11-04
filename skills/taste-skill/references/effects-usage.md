# Effects usage

Who gets effects, how many, how they are dealt and where they sit. An effect is anything a shader,
canvas, WebGL, a print pass or a scroll drive makes: effect grounds (`data-fx`, `assets/effects`),
the WebGL creative parts (`effects-creative.md`), objects and prints (`effects-objects.md`), big
scenes (`scenes.md`), moments (`moments.md`), a film or 3D hero and timed loops. `cards.md` wins on
any card detail; `motion.md` holds every timing.

## The gate (house rule 8)

Effects are for site-kind tech, software and gaming (AI and developer tools count as software) and
for a product page with a technical subject (hardware, devices). Never on a place, an ordinary
product brand or shop, a service firm, an agency or a studio: they are site-kind other.

On other, photographs, type and flat colour carry the page. Banned there: canvas and WebGL, autoplay
video, any CSS gradient (grounds, panels, glows, scrims), SVG pattern or texture grounds,
`backdrop-filter` (the nav too), `filter`, `mix-blend-mode`, `mask-image`, glass, grain, halftone,
dither, duotone, print, `[data-fx]`, `[data-print]`, `[data-scene]`, `[data-big-scene]`,
`[data-moment]`, `[data-ui-loop]`, `[data-m-loop]`, `[data-m-count]`, SVG animation, GIFs, Lottie, a
custom cursor and any scroll or animation library. Allowed: `fx-map` baked still, `fx-photo` as a
plain photograph, real icons, a still diagram (not on a place), and on a physical product with no
photographs its own product render (`[data-product]`, `effects-objects.md`): the product's
picture, not an effect: stills by default, live only when asked (`data-product-mode="live"`), at
most one live context, on the flat ground, its poster beneath.

## What each kind gets

| | tech | product, service (other) | place |
|---|---|---|---|
| Lead picture | the client's UI (hardware: its photographs or render, else its product render, never an effect or an order form alone; a game: its name and its art, else its key art rendered with the product-render helper, an effect at most behind it) | its photographs; a product without them: its product render | its photographs (a remote place: its region's landscape) |
| The one effect | a live ground, a WebGL part, an object or a big scene | none | none |
| Card panel grounds | one card group, still, from the effect's family; with a big scene the lit ground (`data-ground`), no `data-fx` | the client's photograph | none |
| Moments | up to 2 in sections, at most 1 in the hero | none | none |
| Big scene | 0 or 1 (it is the effect) | none | none |
| Diagram cards | 0 to 2, pulsing | 0 or 1, still | none |
| Loops | one timed loop, one per card group | none | none |
| CSS grounds | 0 to 2 (`backgrounds.md`) | flat tokens | flat tokens |

**The subject before the effect** (in testing: a robot arm shown as a silk shader and an order form,
and an unnamed game shown as an abstract effect, both lost to pages that showed the thing). An
effect never stands where the product, the device or the game's world should be. Hardware with no
photographs or client renders, and a game with no art files, take a product render
(`effects-objects.md`, Product renders) as their picture: the hardware itself, the game's hero
object or a scene of its own objects, whole on the stage and full bleed in the world section. The
render is the picture, not the effect: the page's one effect may sit behind it as the stage's
ground (every render placement is transparent over its frame), counts as the beat and shares the
four contexts with it; it never replaces it and never sits beside it as a second focal visual.

Every visual that is not the effect, a card ground, a moment, the scene or a product render is a
real UI capture or a real photograph. A photograph is never filtered, printed, dithered or graded on any page.

## Tech budget

- **One effect:** one live ground (the hero ground, or a ground inside the one framed
  `[data-visual]` window under an h2), or one WebGL part (an `fx-*` that holds a context: the button
  fill, a search or prompt glow, the edge-glow plan, spotlight, globe, avatar, logos, progress,
  dither object, filled headline or stat), or one object, or one big scene. A grain, dither or
  texture CSS ground counts as it. Never in a fixed layer, never behind body copy, never a
  page-long canvas; a 3D world lives in the hero only.
- **Card grounds** (house rule: "gradients and effects ... as a card's background with a smaller
  card of text or UI on top"): one card group may hold quiet grounds from the effect's family,
  drawn once and held as pictures (system.js frees their contexts); not a second live effect. With
  a big scene there is no `data-fx` outside a moment (the checker FAILs it, MO-16, MO-23): the card
  panels take the lit ground (`data-ground`).
- **Moments** (house rule): up to two section moments that may follow the scroll (letters, liquid,
  a section transition, a counter, a marquee row), each in its own section, and at most one
  non-scroll moment (load, hover or click) in the hero or `[data-visual]`, never in or beside the
  scene's section; two moments in all at most. A moment built as an `fx` part carries its own `data-fx` id on its
  own section; it is not a second ground.
- **Beats:** the effect, the scene and the moments are the page's beats, up to three on tech. Name
  each and its section in the plan; never two in one section or in neighbouring sections; a calm
  section between them; the back third of the page calm before the close. CSS grounds, card
  grounds, diagrams, card loops and hovers are not beats.
- **One pointer effect** a page: a hover or liquid moment, `fx-button`, `fx-spotlight` or an object
  that turns to the pointer, never two. Never a replaced cursor, never a magnetic button.
- **At most four live WebGL contexts** at once (house rule): the effect plus the moments' own canvases;
  `perf.mjs` fails above four.

## Deal the effect, never by taste

`node <skill>/scripts/effects.mjs list` shows each id with its family, `quiet` or `focal`, and its
slots. `<kind>` is the page's ground: `light`, `dark` or `colour`; `<site-kind>` is software, gaming or tech.

```bash
# the effect: an effect hero takes --slots hero; a photograph or UI hero puts it in the one [data-visual] frame: --slots band
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

**Moments** (0 to 2): dealt with `moments.mjs pick --page <kind>`, the excludes and the hero rule
exactly as `moments.md` (Deal them) says; pass the scene and the effect so the WebGL total stays
within four. Never a moment in the scene's section or beside it.

**Big scene** (0 or 1, the page's effect): one at random from the scenes whose `types` in
`assets/scenes/index.json` hold the page's site-kind and whose `needs` the brief meets (the table in
`scenes.md`), away from the last three:

```bash
node -e "const fs=require('fs'),f='.taste-skill/scenes-history.json';let h=[];try{h=JSON.parse(fs.readFileSync(f))}catch{}const a=process.argv.slice(1),k=Math.min(3,a.length-1),p=a.filter(i=>!(k?h.slice(-k):[]).includes(i));const id=p[Math.floor(Math.random()*p.length)];fs.mkdirSync('.taste-skill',{recursive:true});fs.writeFileSync(f,JSON.stringify([...h,id]));console.log(id)" <the fitting ids>
```

When the dealt scene's `needs` turn out unmet, deal again without that id; none when no id is
left. A scene is the hero only when its `restH` is 1; the three hero scenes rest in two screens
today, so they go below the dealt hero as a two-screen section (`scenes.md`, Who gets one). Never
a scene with a moment its `avoidMoments` (in `index.json`) lists, or with its twin: pass the scene
as `--scene <id>` to the moments deal, and `pick` leaves out its avoidMoments and twins itself.
Markup and checks: `scenes.md`.

**Its height (rule 3):** `{"hold": 1}` and `--h` = the scene's `restH`, as `scenes.md` (Its
height) says; no page CSS; the scene's section stays one or two screens like every other.

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
