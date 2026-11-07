# Motion

Every page loads the micro-interaction layer: `<html data-motion>`, `assets/motion/motion.css`
after `ui/cards.css`, `assets/motion/motion.js` (module) after `system.js` (`starter.html` has all
three). **It is not optional:** never remove, skip or override it; if a check complains about it,
fix the markup, not the layer. A missing or invisible hover layer is a fault on every kind (round
C: a fintech, a cafe and a guesthouse page lost motion points because a hovered card or button
showed no change), and since 2.5.1 so is a page without its hero entrance or its dealt moment. Give it markup to act on: a linked card is a `.card`
holding its link (never `.m-nolift`), a photograph that leads somewhere is `<a class="m-zoom">`
round its `<img>` (or `img.frame__img` inside a linked frame), buttons are `.btn`, links in
running text `.link`. Shoot a hovered card and a hovered photograph at 1440 and see
them change: the card 2px up, the photograph at 1.03. `assets/motion/demo.html` shows every interaction. This file
holds every hover, press, loop and reduced-motion number; other files point here.

## The rule: every page moves, in three places

Every page, every kind, has the same three layers of motion, and nothing else moves:

1. **The hero's entrance** on load, once (below): the h1 line by line, then its lead and buttons, the
   picture settling. About 1.1 s, then the hero stands.
2. **One dealt moment** in a section of its own (two on a long page: eight sections or more), big
   enough to remember: `moments.mjs pick --page <kind>` deals it (`moments.md`). On a place, product
   or service page it is photo- or type-led (photographs that change in place, a photograph that
   develops, a statement that lights up); shader and WebGL
   effects stay on tech, gaming and software (house rule 8: a cafe, bakery, guesthouse or shop gets
   photographs, never a shader).
3. **The hover and press layer** below, on every link, button, linked card and linked photograph,
   and the swaps a click or a tap makes (a tab on software, a peek-list's photograph).

On tech, gaming and software pages also: loops inside a card's visual (diagram pulses included),
one timed loop in the hero or the `[data-visual]` frame, one count, and the effect and scene
`effects-usage.md` deals. Other pages have none of those: no ticker, marquee, slideshow, looping
picture, pulsing dot or count. An open-now line may be filled once at load; the panel reads right
without it. A product render is a still by default; live only when asked
(`data-product-mode="live"`), at most one live context, with its pause button in the corner, a still
on a phone and under reduced motion (`effects-objects.md`).

**Scrolling moves nothing but the dealt moment.** No card, row or tile ever fades, rises or staggers
in as the page scrolls (stock reveals), no text moves at another speed than the page (parallax on
text), and the page is never held or steered by script (scroll-jacking, smooth-scroll libraries).
A moment may hold its own section on screen with `position: sticky` while the page scrolls natively.

**Why it moves.** The plan names each motion and its purpose in a few words, one line each: "hero
entrance: the name arrives first, then what to do"; "photo-chapters in Rooms: three rooms shown in
the space of one"; "hover: every link answers". A motion with no purpose is cut. Content is
readable at rest, without script and under reduced motion: motion only ever adds to a page that is
already whole.

## Tokens

`--m-in` 150ms (hover in), `--m-out` 120ms (hover out), `--m-press` 90ms, `--m-panel` 200ms (a menu opening), `--m-close` 120ms, `--m-slide`
240ms (an indicator travelling), `--m-image` 600ms in and `--m-image-out` 400ms, `--m-cycle` 3.2s;
tech loop tokens: `--m-roll` 700ms, `--m-count` 1000ms, `--m-level` .6s, `--m-bob` 3.2s.
Curves: one UI ease-out, `--ease` in `system.css` = cubic-bezier(.2,.8,.2,1) (`--m-ease` and the
fragments' `--u-ease` read it) for every UI step; `--m-ease-enter` cubic-bezier(.22,1,.36,1) for
an entrance settling (the hero, a moment, a digit roll; `--u-spring` in `ui/base.css` is the same
curve); `--m-ease-io` cubic-bezier(.65,0,.35,1) only for travel; linear for loops and drifts. No
curve passes its mark: no bounce, no overshoot. The motion layer moves transform, scale and opacity
only (a hover also changes colours) and never animates width, height, top, left, margin or padding.
Inside a dealt moment a few more cheap properties move, each named in its `meta.json`: a clip-path
(a wipe), a filter (a photograph developing), the colour of words (a statement lighting up) and,
on tech only, a background position (a photograph passing through type). Distances: card lift 2px, photo zoom 1.02 to 1.03, arrow 3px, menu drop 6px, button step 1px
up (2px on `.btn--xl`; none on the text-link secondary of the `arrow` and `block` looks), press 1px
down and scale .985 (that secondary: scale only); no others (`assets/motion/motion.css`, buttons).

## The hover layer

Hover moves only for a fine pointer (`(hover: hover) and (pointer: fine)`; keyboard focus shows the
same state anywhere); every hover control also works by tap and keyboard and has a focus state; nothing resizes or pushes a neighbour; no rotate, skew, glow, shine sweep or chip glide.

| Part | Motion | Time |
|---|---|---|
| Button | on hover the fill steps 14% toward the ink (an outline gains a faint fill and a stronger border) and the box steps up 1px (2px on `.btn--xl`); press sinks it to 1px below rest and scales .985, so a hover shot and a press shot each show a move; the text-link secondary of the `arrow` and `block` button looks keeps its underline and does not step (its press scales .985 only); fine pointer only; page CSS never sets a `.btn`'s `transform` or `transition` | 150ms in, 120ms out, 90ms press |
| Arrow | `svg.m-arrow` moves 3px right and settles back; one arrow style a page | 150 / 120ms |
| Link | one underline style at regular weight: running text and `.link` rest on a faint 1px hairline and an ink line draws left to right, leaving to the right; nav and footer words rest bare, darken and draw a 1px line 4px under the word | 150 / 120ms |
| Nav | the words take the drawn underline (no gliding pill on any kind); the panel opens after 150ms of intent, fades in with a 6px drop with its columns together (one surface, never column after column), closes in 120ms; with one open the next word swaps it at once; the chevron turns 180 degrees on tech, flips at once on other | 200ms, 120ms |
| Current page | a 2px bar under its nav word (`aria-current="page"`) | still |
| Tabs (software, click only) | one indicator slides to the clicked tab by transform alone (it takes the new tab's size at once, starts scaled to the old one and settles to scale 1): the ink pill `system.css` draws, its label in the ground colour; the panel swaps (200ms at most); every panel one fixed height; on other no tabs | 240ms |
| Card with a link | lifts 2px, its border darkens a step, an optional soft shadow (blur 24px, 10% ink at most, only on hover) | 180ms in, 120ms out |
| Card without a link | nothing (`.m-nolift`) | |
| Photograph in a linked card or link | scales 1.02 to 1.03 inside its frame (`overflow: hidden`); the frame, card and boxes never grow; never dims, fades or takes an overlay; a product card's name underlines with it (`.m-zoom` for any other wrapper) | 600ms in, 400ms out |
| Focus | a 2px ring in the action colour, 2px off the control, drawn in full in the frame the focus lands; no transition | none |
| Field | the action border and a 3px soft ring | 140ms |
| `.m-switch`, `.m-check` (tech) | the knob slides 16px and stretches 4px while pressed, both by transform; the tick fades in as it grows from 70% to full size; on other they jump | 180, 90, 160ms |
| Copy button (tech) | the glyph swaps to a check in place, holds 1.5 to 2 s, returns | 150ms |

FAQs show every answer open (`system.css`): no accordion, and nothing ever animates height,
max-height or padding. Hooks: `[data-m-loop]` (your own CSS loop, tech), `data-ui-loop` (a card
group's one fragment loop, tech), `data-m-count` (tech hero only), `.m-link`, `.m-zoom`, `.m-nolift`.

## The hero's entrance (every kind)

Once on load the hero arrives, then stands: the h1 rises line by line out of word masks (700ms each,
the lines 80ms apart, at most 240ms between the first and the last; each word starts wholly under
its mask), then whatever follows it in its column (the lead, each button, the facts) fades up 12px,
520ms each, 60ms apart, starting as the last line is half way up; a line above the h1 (a notice, a
pill) comes with its first line. The hero's picture is never hidden and never fades: a photograph
settles from 1.05 to 1 over 1.1 s inside its frame (a full-bleed one inside the hero), a window,
object or collage from .98 over 900ms, each as one block (the words on a menu card or a note in it
never step on their own); a panel the words sit on stands from the first paint. All of it about
1.1 s, ease-out (`--m-ease-enter`), transform, scale and opacity only, once a visit, never again on
scroll.
An h1 that `layout.js` reworks (a live word, letters that answer the pointer, a picture in the
line) rises whole instead of line by line.

The builder writes two things, and nothing else (`starter.html` has both):

```html
<!-- in <head>, after the stylesheets (where starter.html has it): the words wait for motion.js instead of flashing -->
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
<!-- on the dealt hero's section -->
<section class="hero hero--split" data-enter aria-labelledby="hero-h">
```

Optional: `data-enter-media` on the hero's picture when it is none of the layouts' own
(`.hero__bg`, `.hero__media`, `.hero__stage`, `.hero__art`, `.hero__window`, `.hero-visual`,
`.ly-collage`); `data-enter-whole` on an h1 that must rise as one; `data-enter="off"` on a hero
that holds a big scene with its own load motion (the checker takes the scene as the entrance, and only
inside such a hero). `motion.js` does the rest (`enter()`): it lends
the h1 its word masks for the length of the entrance and gives the h1 its own nodes back afterwards
(`.is-entering` while it runs, `.is-entered` after). Only the words are hidden, and only while
`html.m-enter` is on and before `motion.js` takes over or the 700ms mark passes: without script,
under reduced motion, in print and with `data-motion="off"` the hero stands as written; when the
script is later than the mark, the words fade in over 400ms and the picture settles by CSS alone. A headless screenshot sees the hero at rest (as it sees a count's final number)
unless `<html data-motion="live">`. Never a loader, a gate, a delay before reading, or a second
entrance (`headline-arrives` is retired for it).

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
- **Load:** the hero's entrance above, on every kind. On tech also at most one load-once motion
  inside the `[data-visual]` frame (a visual assembling, 600 to 1200ms), settled by 1.5 s; a click
  swap 400 to 600ms. No gate, loader or intro.
- **Pause:** anything still moving 5 s after it is seen has one round pause button per panel: a
  solid 32px disc, 12px in from the bottom-right (in a card beside its title), always shown or
  fading in on hover and focus, the same size and place on every card, never over copy, never on a
  still. A click freezes the frame and swaps to a play glyph (`ui.pausable(panel, ctrl)` for your
  own movers). Scroll-driven moments need none.
- **Timed loops start on load** and never start, stop or resume on scroll; an IntersectionObserver
  only mounts lazily. A canvas may skip drawing off screen only on a clock from load, so no visible
  start shows on return. A hidden tab may pause everything.

## Scroll

- **Outside the dealt moment's section (and the tech page's big scene), on every kind:** nothing
  animates on scroll. No card, row or tile reveal of any kind (fade, rise, stagger, mask wipe), no
  parallax or drift, no scroll-snap, scroll-tinted ground, progress line, scroll-spy marker or count
  on view.
- **Every kind:** the one or two dealt moments may follow the scroll, each inside its own section
  (`data-moment`; on tech also the big scene, `data-big-scene` with `{"hold": 1}`), which stays 1H
  or 2H (`scenes.md`, Its height; `photo-chapters` is 3H or 4H live, about two thirds of a screen a
  chapter, `moments.md`), pinned only with `position: sticky` inside that box. A scroll
  moment is scrubbed to the scrollbar (it runs back on the way up) and shows a finished state at both
  ends; an enter moment (`picture-develops`) runs once, 1.6 to 1.8 s. Its text is live and visible without the motion (opacity 1,
  4.5:1 at every step); reduced motion and no script show the finished still; phones run the light
  ones (`word-highlight`, the film develop, `photo-chapters`: transform, clip, filter or colour, no
  WebGL) and get the still of the rest; `perf.mjs` passes. It never moves a card, a
  photograph, pricing, an FAQ, a quote block or the footer. Driven by native `animation-timeline`, a
  passive scroll read written to a custom property once a frame, or GSAP ScrollTrigger scoped to that
  section without its pin (tech only). No smooth-scroll library (Lenis, Locomotive, ScrollSmoother)
  on any page, no animation library at all on other: the kit's moments need none.
- The header and the phone bar look the same at every scroll position; the bar only comes up once
  the hero's button has scrolled away and steps down while the screen shows one of its actions
  (system.js, 240ms, at once under reduced motion).

## Reduced motion, no script, phones

Colours still change; menus fade; a press shows as a deeper tone instead of a move; the tab
indicator and the switch knob jump to their place; the tick appears at full size; the underline
appears without travelling (`motion.css`, reduced motion: `transition-property` limited to
opacity and colours on links, `.m-tab-ind`, `.m-switch::before`, `.m-check::before`). The hero
stands as written. Every loop, effect, moment and scene shows its finished frame, marquees stand as a still row, numbers show their final text, pause buttons are hidden. On a
phone card loops and effects hold their finished picture or poster, heavy canvases become stills,
there are no hover states and no pointer simulations; the hero still enters, and the moments light
enough for a phone run there (`moments.md`, The still rule), so a phone page moves in two places too.

## Never

- A card, row or tile that reveals, staggers, slides or fades in as the page scrolls; parallax on
  text; a scroll scrub outside the dealt moment's section (and the tech page's scene); a shader or
  WebGL moment on a place, product or service page.
- A section heading that rises on every section, a second hero entrance, an entrance longer than
  about 1.1 s, or an entrance that hides text a visitor could already be reading.
- A card that tilts, flips, scales, follows the pointer or glows at the cursor; a magnetic button.
- A carousel, a slider that advances by itself, timed tabs, a rotating notice, a logo marquee.
- Blinking at random: twinkling dots, glitter, flicker, hue cycling, scrambled text; every change
  shows a state, a step or real data.
- A loop that plays once (outside a card story's replay), a card loop's cycle over 4 s, two loops in
  one panel.
- A hover slower than its token, an overshooting ease, a delay before a button reacts, a focus ring
  that animates, a second underline or indicator style, an animated width, height or margin.
