# Motion

Every page loads the micro-interaction layer: `<html data-motion>`, `assets/motion/motion.css`
after `ui/cards.css`, `assets/motion/motion.js` (module) after `system.js` (`starter.html` has all
three). **It is not optional:** never remove, skip or override it; if a check complains about it,
fix the markup, not the layer. A missing or invisible hover layer is a fault on every kind (round
C: a fintech, a cafe and a guesthouse page lost motion points because a hovered card or button
showed no change); a still page is not. Give it markup to act on: a linked card is a `.card`
holding its link (never `.m-nolift`), a photograph that leads somewhere is `<a class="m-zoom">`
round its `<img>` (or `img.frame__img` inside a linked frame), buttons are `.btn`, links in
running text `.link`. Shoot a hovered card and a hovered photograph at 1440 and see
them change: the card 2px up, the photograph at 1.03. `assets/motion/demo.html` shows every interaction. This file
holds every hover, press, loop and reduced-motion number; other files point here.

What may move, by kind (house rules 5 and 8):
- **Every kind:** the hover and focus layer below, and swaps a click or a tap makes (a tab on
  software, a peek-list's photograph). Every change is the visitor's.
- **Tech:** also loops inside a card's visual (diagram pulses included), one timed loop in the hero
  or the `[data-visual]` frame, one count, and the effect, moments and scene `effects-usage.md`
  deals.
- **Other (product, service, place):** the hover layer alone. Nothing moves by itself, on load, by
  time or on scroll: no entrance, ticker, marquee, slideshow, looping picture, pulsing dot, count or
  moment. An open-now line may be filled once at load; the panel reads right without it. A
  product render is a still by default; live only when asked (`data-product-mode="live"`), at
  most one live context, with its pause button in the corner, a still on a phone and under reduced
  motion (`effects-objects.md`).

## Tokens

`--m-in` 140ms (hover in), `--m-out` 200ms, `--m-press` 90ms, `--m-panel` 200ms, `--m-slide`
240ms (an indicator travelling), `--m-image` 600ms, `--m-cycle` 3.2s; tech loop tokens:
`--m-roll` 700ms, `--m-count` 1000ms, `--m-level` .6s, `--m-bob` 3.2s. Ease `--m-ease`
cubic-bezier(.2,.8,.2,1) for every UI step; `--m-ease-io` cubic-bezier(.65,0,.35,1) only for
travel; cubic-bezier(.22,1,.36,1) only for digit rolls; linear for loops and drifts. No bounce or
overshoot. Distances: card lift 2px, photo zoom 1.02 to 1.03, arrow 3px, menu drop 6px, button step 1px
up (2px on `.btn--xl`; none on the text-link secondary of the `arrow` and `block` looks), press 1px
down and scale .985 (that secondary: scale only); no others (`assets/motion/motion.css`, buttons).

## The hover layer

Hover only for a fine pointer; every hover control also works by tap and keyboard and has a focus
state; nothing resizes or pushes a neighbour; no rotate, skew, glow, shine sweep or chip glide.

| Part | Motion | Time |
|---|---|---|
| Button | on hover the fill steps 14% toward the ink (an outline gains a faint fill and a stronger border) and the box steps up 1px (2px on `.btn--xl`); press sinks it to 1px below rest and scales .985, so a hover shot and a press shot each show a move; the text-link secondary of the `arrow` and `block` button looks keeps its underline and does not step (its press scales .985 only); fine pointer only; page CSS never sets a `.btn`'s `transform` or `transition` | 140ms in, 200ms out, 90ms press |
| Arrow | `svg.m-arrow` moves 3px right and settles back; one arrow style a page | 140 / 200ms |
| Link | one underline style at regular weight: running text and `.link` rest on a faint 1px hairline and an ink line draws left to right, leaving to the right; nav and footer words rest bare, darken and draw a 1px line 4px under the word | 140 / 200ms |
| Nav | the words take the drawn underline (no gliding pill on any kind); the panel opens after 150ms of intent, fades in with a 6px drop, its columns together, closes in 120ms; with one open the next word swaps it at once; the chevron turns 180 degrees on tech, flips at once on other | 200ms, 120ms |
| Current page | a 2px bar under its nav word (`aria-current="page"`) | still |
| Tabs (software, click only) | one indicator slides to the clicked tab: the ink pill `system.css` draws, its label in the ground colour; the panel swaps (200ms at most); every panel one fixed height; on other no tabs | 240ms |
| Card with a link | lifts 2px, its border darkens a step, an optional soft shadow (blur 24px, 10% ink at most, only on hover) | 180ms, border 140 / 200ms |
| Card without a link | nothing (`.m-nolift`) | |
| Photograph in a linked card or link | scales 1.02 to 1.03 inside its frame (`overflow: hidden`); the frame, card and boxes never grow; never dims, fades or takes an overlay; a product card's name underlines with it (`.m-zoom` for any other wrapper) | 600ms |
| Focus | a 2px ring in the accent, its offset settling from 6px to 2px | 200ms |
| Field | the action border and a 3px soft ring | 140ms |
| `.m-switch`, `.m-check` (tech) | the knob slides 16px and stretches 4px while pressed; the tick draws; on other they jump | 180, 90, 160ms |
| Copy button (tech) | the glyph swaps to a check in place, holds 1.5 to 2 s, returns | 150ms |

FAQs show every answer open (`system.css`): no accordion, and nothing ever animates height,
max-height or padding. Hooks: `[data-m-loop]` (your own CSS loop, tech), `data-ui-loop` (a card
group's one fragment loop, tech), `data-m-count` (tech hero only), `.m-link`, `.m-zoom`, `.m-nolift`.

## Loops inside a card's visual (tech)

House rule: a bit faster, and repeating.

- One cycle is 2.5 to 4 s (`--m-cycle`, 3.2 s default), then it starts again. It is seeded on its
  finished picture and never shows an empty window: a ui.js fragment rests 600ms on it before the
  first cycle; a `[data-m-loop]` starts at once; the last 10 to 15% of each cycle holds the finished
  picture, and a reset dims and rewrites, never blanks.
- The pointer or keyboard focus entering its card restarts it from the top (not in its first
  800ms). A paused loop stays paused. The card, its panel and the window never move: no zoom, tilt
  or camera pan inside the window.
- One subject per cycle (a pointer clicks, a status turns, a bar fills, a line is written): one
  change every 1 to 2 s, each change 300ms or less. Several subjects: the next one each cycle. A
  changing label never shows two words at once.
- One fragment loop per card group (`data-ui-loop`); the other fragments hold their finished
  picture and play while the pointer rests on their card. A small diagram card's pulse is that
  card's own loop, on the same cycle, restart and pause rules (house rule: pulses running along the
  lines); system.js never holds it (`data-ui-still` does not reach a diagram). Below the hero, two
  loops are never on one screen: in a group with a pulsing diagram, give the fragments
  `data-ui-still` too, or hold the diagram with `data-dg-still` (it then plays under the pointer).
- A page's own CSS loop sits in `[data-m-loop]`, every keyframe on `var(--m-cycle)`, `--m-still`
  (0 to 1) the finished frame, a 48px band (`--m-safe`) kept clear for the pause button.
- Life signs inside the looping visual only: spinner 1s (12 to 16px, then a check), live dot 2.4s
  (the dot still, a ring grows and fades), caret 1s with a hard step inside a field, level bars .6s.
  No typing dots, no lone pulsing dot elsewhere, no block cursor after a headline.
- Kinds of card story (each in a box of fixed height): a prompt types at 12 to 20 characters a
  second and holds; an answer streams about a bubble a second; a notification enters at the top and
  the oldest leaves through the fade; a checklist ticks about once a second; a calendar's events
  fade in one by one; a pointer glides about 200px in 1 s, presses (scale .96 at least, a 28px ring)
  and holds. A speaker or avatar front item changes no more than every 3 s. A chart stays still.
- Not yet placed, so not used: a stepping slot strip, a before/after divider, path-following items,
  a dock tab that grows, a pointer-linked mascot, a comet along a hero strand.

## Tech budget

- **One timed loop** a page, in the hero or the `[data-visual]` frame, in whatever form (a story, a
  reel, a lit border, a live ground, a turning object, a marquee); its life signs are part of it.
  One timed loop plus the one effect at most; with a live effect in the hero, no other timed loop
  runs. Never two self-moving things in one 900px window, never two loops in one panel. Card loops
  (one per card group), diagram pulses (one per diagram card) and the dealt moments are outside
  this count.
- **A count** once a page (`data-m-count` or the `counter-rolls` moment, never both): on load in the
  hero (1000ms, 1.2 s at most), or as the dealt counter moment in its own section. On the open
  ground, never in a card, panel or `[data-visual]`; its width reserved; the final figure in the
  HTML, shown under reduced motion, without script and on phones; never a year, price or phone
  number. A live counter changes only its last one to three digits.
- **Load:** hero text is in place on the first frame on every kind, never faded or moved. On tech at
  most one load-once motion inside the hero or `[data-visual]` (a visual assembling, 600 to
  1200ms), settled by 1.5 s; a click swap 400 to 600ms. No gate, loader or intro.
- **Pause:** anything still moving 5 s after it is seen has one round pause button per panel: a
  solid 32px disc, 12px in from the bottom-right (in a card beside its title), always shown or
  fading in on hover and focus, the same size and place on every card, never over copy, never on a
  still. A click freezes the frame and swaps to a play glyph (`ui.pausable(panel, ctrl)` for your
  own movers). Scroll-driven moments need none.
- **Timed loops start on load** and never start, stop or resume on scroll; an IntersectionObserver
  only mounts lazily. A canvas may skip drawing off screen only on a clock from load, so no visible
  start shows on return. A hidden tab may pause everything.

## Scroll

- **Other kinds, and every card on every kind:** nothing animates on scroll. No pinned or sticky
  scene, scroll-snap, scroll or view timeline, reveal of any kind (fade, rise, stagger, mask wipe,
  letters filling, words lighting, lines drawing), parallax, drift, scroll-tinted ground, progress
  line, scroll-spy marker or count on view.
- **Tech:** the big scene and one or two dealt section moments may follow the scroll, each inside
  its own section (`data-big-scene` with `{"hold": 1}`, `data-moment`), which stays 1H or 2H
  (`scenes.md`, Its height), pinned only with `position: sticky` inside that box. Its text is live and visible without the motion (opacity 1,
  4.5:1 at every step); reduced motion and no script show the finished still; phones get the still
  or a light version (transform and opacity, no WebGL); `perf.mjs` passes. It never moves a card, a
  photograph, pricing, an FAQ, a quote block or the footer. Driven by native `animation-timeline`, a
  passive scroll read written to a custom property once a frame, or GSAP ScrollTrigger scoped to that
  section without its pin. No smooth-scroll library (Lenis, Locomotive, ScrollSmoother) on any page,
  no animation library at all on other.
- The header and the phone bar look the same at every scroll position.

## Reduced motion, no script, phones

Colours still change; menus fade; the tab indicator jumps; the underline appears without travelling
(`transition-property: opacity, color, background-color, border-color` on links, `.m-tab-ind`,
`.m-switch::before`, `.m-check::before`). Every loop, effect, moment and scene shows its finished
frame, marquees stand as a still row, numbers show their final text, pause buttons are hidden. On a
phone card loops and effects hold their finished picture or poster, heavy canvases become stills,
there are no hover states and no pointer simulations.

## Never

- A card, row or tile that reveals, staggers, slides or fades in as the page scrolls; parallax or a
  scroll scrub outside the tech page's dealt moments and scene.
- A card that tilts, flips, scales, follows the pointer or glows at the cursor; a magnetic button.
- A carousel, a slider that advances by itself, timed tabs, a rotating notice, a logo marquee.
- Blinking at random: twinkling dots, glitter, flicker, hue cycling, scrambled text; every change
  shows a state, a step or real data.
- A loop that plays once (outside a card story's replay), a card loop's cycle over 4 s, two loops in
  one panel.
- A hover slower than its token, an overshooting ease, a delay before a button reacts, a second
  underline or indicator style.
