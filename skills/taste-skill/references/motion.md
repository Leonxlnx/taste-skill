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

## The rule: every page moves, on every kind, by fit

Motion is not a tech privilege. A cafe gets motion too, only of its own kind: a picture that comes
into focus, a heading that rises, a price row that answers the pointer, a route that draws. What a
page may use is decided by fit, never by a lock: every entrance, moment, scene, effect and
micro-interaction carries `tones` (warm, editorial, product, tech, playful), an `intensity` (quiet,
lively, bold) and `webgl` (0 or 1), and the dealers deal by them (the fit table below). Every page
has these layers:

1. **The hero's entrance**, dealt from the deck (below): once on load, settled by 1.4 s.
2. **Section reveals**, automatic: below the first screen each section's h2 rises out of its masks
   and its lead photograph settles, once. Never a card, row, tile or list.
3. **Two dealt moments** in different sections (three on a long page of eight sections or more),
   at least one lively, bold or clearly moving within the first three screens:
   `moments.mjs pick --page <kind>` deals them (`moments.md`).
4. **A scene** where one fits the kind (0 or 1; a hospitality, route or room scene on a place):
   `scenes.md`.
5. **The hover and press layer** below, on every link, button, linked card, linked photograph and
   row, and the swaps a click or a tap makes (a tab, a peek list's photograph, a swatch).
6. **Loops inside card visuals** wherever the page has card visuals, on any kind (a route that draws,
   a booking that fills, a product story), one loop a card group.

| Kind | Tones | Intensity | WebGL |
|---|---|---|---|
| place (cafe, bakery, restaurant, guesthouse, shop, gym) | warm, editorial | quiet, lively | 0 |
| service (studio, agency, clinic, law, architect) | editorial, warm, product | quiet, lively | 0 |
| product (physical goods) | product, editorial, warm | quiet, lively, bold | a photo treatment or a render the brief asks for |
| tech (hardware) | product, tech, editorial | any | yes |
| software | tech, editorial, product | any | yes |
| gaming | playful, tech | any | yes |

Tech-looking shader grounds stay off place and service pages (a cafe gets nothing too wild); a quiet
photo treatment tagged warm or editorial may be dealt there. Some motion fits tech and not a bakery
(a lit border, a pointer demo), some fits a bakery and not a devtool (a crust that comes into focus,
an open-now dot): fit is the rule, not the kind alone.

**Scrolling never steers the page.** No text moves at another speed than the page (parallax on
text), the page is never held or steered by script (scroll-jacking, smooth-scroll libraries), and
no card, row or tile fades, rises or staggers in (stock reveals). A moment or scene may hold its own
section with `position: sticky` while the page scrolls natively.

**Why it moves.** The plan names each motion with one purpose word and a few words more, one line
each: "entrance (arrive): the name first, then what to do"; "reveal (orient): each chapter's title
announces it"; "photo-chapters (show): three rooms in the space of one"; "hover (answer): every link
answers". Purpose words: arrive, orient, answer, show, explain, confirm. A motion with no purpose
word is cut. Content is readable at rest, without script and under reduced motion: motion only ever
adds to a page that is already whole.

## Motion craft

How tasteskill moves, in its own numbers. `motion.css` and `motion.js` follow every line;
`motion-lint.mjs` catches the faults it can read from the code.

- **Easing by purpose.** Something answering the hand (hover, press, a menu): `--m-ease`, a fast
  start and a soft landing. Something arriving (the entrance, a reveal, a digit landing):
  `--m-ease-enter`, a long soft tail. Something travelling on screen from one place to another (a tab
  pill, a cover parting, a window opening): `--m-ease-io`, soft at both ends. Loops and drifts:
  linear. Never `ease-in` on anything a visitor waits for: it starts late and stops hard.
- **Duration by distance and size.** A 1px button step 90 to 150ms; an underline or a 6px menu drop
  150 to 200ms; a 240px pill 240ms; a heading 620ms; a photograph 600 to 700ms; a whole hero 1.1 to
  1.4 s. Bigger and farther takes longer; nothing a hand starts takes over 400ms.
- **Entrances slower than exits.** In 150ms, out 120ms; a menu opens in 200ms and closes in 120ms.
  Leaving is not news.
- **Small capped staggers.** Lines of one heading 70 to 80ms apart, at most 240ms first to last; a
  hero's parts 60ms apart. Never a list, grid or row of cards item after item.
- **Interruptible.** Hover and press are transitions, so a pointer that leaves half way turns them
  back from where they are; keyframes are for loops and the one-time arrivals.
- **Transform and opacity.** Plus clip-path for a mask, filter for a photograph developing or
  focusing, colour for words. Never width, height, top, left, margin or padding, never
  `transition: all`.
- **Never from nothing.** Nothing grows from scale 0: start at .94 to .98, or let it fade; a
  photograph settles from 1.03 to 1.12, never pops.
- **Origin-aware.** A menu or popover grows from the edge it hangs from (`transform-origin` at its
  trigger); a full-width panel drops 6px from the bar; a modal stays centred.
- **Springs only where something is physical.** A switch knob that stretches, a sheet a thumb drags:
  at most 2% past the mark. A page section never bounces.
- **Reduced motion is rest.** The finished frame, at once: no travel, no scale, no loop; colours and
  the press tone still change.
- **One look a page.** One underline style, one arrow style, one entrance, one roll style.

## Tokens

`--m-in` 150ms (hover in), `--m-out` 120ms (hover out), `--m-press` 90ms, `--m-panel` 200ms (a menu opening), `--m-close` 120ms, `--m-slide`
240ms (an indicator travelling), `--m-image` 600ms in and `--m-image-out` 400ms, `--m-cycle` 3.2s,
`--m-reveal` 620ms (a section's heading) and `--m-reveal-img` 700ms (its lead photograph);
tech loop tokens: `--m-roll` 700ms, `--m-count` 1000ms, `--m-level` .6s, `--m-bob` 3.2s.
Curves: one UI ease-out, `--ease` in `system.css` = cubic-bezier(.2,.8,.2,1) (`--m-ease` and the
fragments' `--u-ease` read it) for every UI step; `--m-ease-enter` cubic-bezier(.22,1,.36,1) for
an entrance settling (the hero, a moment, a digit roll; `--u-spring` in `ui/base.css` is the same
curve); `--m-ease-io` cubic-bezier(.65,0,.35,1) only for travel; linear for loops and drifts. No
curve passes its mark: no bounce, no overshoot. The motion layer moves transform, scale and opacity
only (a hover also changes colours) and never animates width, height, top, left, margin or padding.
Inside a dealt moment a few more cheap properties move, each named in its `meta.json`: a clip-path
(a wipe), a filter (a photograph developing), the colour of words (a statement lighting up) and a
background position (a photograph passing through type). Distances: card lift 2px, photo zoom 1.02 to 1.03, arrow 3px, menu drop 6px, button step 1px
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
| Row (`.rows > li`, automatic, any kind) | a 1px ink line draws under the row from the left while the pointer reads it, leaves to the right; a row's `svg.m-arrow` slides 3px; the row on show in a peek list keeps its line | 320ms in, 180ms out |
| Rolling label (`.m-swap`, opt-in) | on a button or nav word: the words roll up and the same words come up from below; editorial, product, tech, playful; one a page's look | 280ms in, 120ms out |
| Number that rolls (`[data-m-roll]`, any kind) | a price or a count: each digit rolls up three places into its own figure, 40ms apart, once when first seen; the written number is the HTML | 700ms |
| Swatches (`[data-m-swatches]`, product, warm, editorial) | a click or tap crossfades the named photograph; the pressed swatch wears an ink ring, a press scales .94 | 260ms |
| Open now (`[data-open-now]`, automatic, place) | while the line says Open now it wears a green dot that sends out a soft ring twice the first time it is seen, then rests; closed: no dot | 2 x 2.4 s |

Markup to copy:

```html
<li><span class="rows__name"><a href="#order">Saturday box <svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg></a></span><span class="rows__value" data-m-roll>EUR 19.00</span></li>
<a class="btn btn--primary m-swap" href="#book">Book a table</a>
<div class="m-swatches" data-m-swatches="#jacket" role="group" aria-label="Colour">
  <button type="button" class="m-swatch" style="--sw:#2f3a2c" data-src="olive.jpg" data-alt="The jacket in olive" aria-pressed="true" aria-label="Olive"></button>
  <button type="button" class="m-swatch" style="--sw:#1d2433" data-src="navy.jpg" data-alt="The jacket in navy" aria-pressed="false" aria-label="Navy"></button>
</div>
```

FAQs show every answer open (`system.css`): no accordion, and nothing ever animates height,
max-height or padding. Hooks: `[data-m-loop]` (your own CSS loop, any kind), `data-ui-loop` (a card
group's one fragment loop), `data-m-count` (a hero fact, once a page), `data-m-roll`, `.m-swap`,
`[data-m-swatches]`, `data-still`, `.m-link`, `.m-zoom`, `.m-nolift`.

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

## The entrance deck

The rise above is the default. The deck brings back the entrances collected from the award sites:
`data-enter="<id>"` on the hero picks one, as dealt (the fit tags are in `assets/motion/meta.json`,
`entrances`; nothing else changes in the markup). Each is settled by 1.4 s, runs once, and stands
still under reduced motion, without script and in print. A variant whose picture is missing stands
(exposure, aperture) or runs the rise (product-at-work without steps).

| id | What the visitor sees | Needs | Tones | Intensity |
|---|---|---|---|---|
| `rise` (default) | the h1 rises line by line, then the lead and buttons; the picture settles | | all | quiet |
| `set-type` | the lines rise while the picture opens downward like a blind | a picture | all | lively |
| `focus` | the picture and the h1 come into focus; nothing travels | | warm, editorial, product, tech | quiet |
| `exposure` | the type stands; the photograph comes up from pale | a mid or dark photograph | warm, editorial, product | quiet |
| `aperture` | the type stands; the picture opens from a window in its middle (`--m-window` on the hero) | a picture half the hero | all | lively |
| `line-blocks` | blocks of the accent cover each line and slide off to the line ends | | editorial, product, tech, playful | bold |
| `doors` | a cover in one colour parts along one line (`--m-door`, `--m-door-at`) | a hero of 70% of the screen | editorial, tech, playful | bold |
| `product-at-work` | the h1 rises; inside the window the parts marked `data-enter-step` (two to four) appear one after another | a window in the hero | tech, product | lively |
| `still` | nothing arrives; the hero's own clip, scene or loop is the motion | a moving picture | all | quiet |

`assets/motion/deck.html?enter=<id>` shows each one on a bakery page. A place page takes rise,
set-type, focus, exposure or aperture; a bold one (line-blocks, doors) belongs to editorial, tech,
product and playful pages.

## Section reveals (automatic, every kind)

`motion.js` does them; the builder writes nothing. Below the first screen, each `main` section's
first h2 (outside cards, rows and lists) rises out of its line masks in 620ms, lines 70ms apart, and
its lead photograph (the first image at least 280 by 160 outside cards, tiles and lists) settles
from a slight window and 1.06 in 700ms, once, as each comes 12% into the screen. Never in the first
screen, never a card, row, tile, list or paragraph, nothing staggered. A section holding a dealt
moment or a scene keeps its own motion and gets no reveal; `data-still` on a section keeps it
still. Only what `motion.js` marked waits (`.m-rv-wait`, `data-m-rv`), so without script, under
reduced motion, in print and in a headless shot (unless `data-motion="live"`) nothing is hidden; a
heading passed by a jump simply shows; a heading whose masks would set it on other lines rises whole
(no layout shift).

## Loops inside a card's visual (any kind)

House rule: a bit faster, and repeating. Any page with card visuals has them: on software a product
story, on a place a route that draws (`<path class="m-draw" pathLength="1">` inside a
`[data-m-loop]` svg), a table filling for the evening, a basket being packed.

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
  solid 32px disc, 12px in from the bottom-right (in a card with no panel, beside its title), always shown or
  fading in on hover and focus, the same size and place on every card, never over copy, never on a
  still. A click freezes the frame and swaps to a play glyph (`ui.pausable(panel, ctrl)` for your
  own movers). Scroll-driven moments need none.
- **Timed loops start on load** and never start, stop or resume on scroll; an IntersectionObserver
  only mounts lazily. A canvas may skip drawing off screen only on a clock from load, so no visible
  start shows on return. A hidden tab may pause everything.

## Scroll

- **Outside the dealt moments' and the scene's sections, on every kind:** only the section reveals
  above (a section's h2 and its lead photograph, once). No card, row or tile reveal of any kind
  (fade, rise, stagger, mask wipe), no parallax or drift, no scroll-snap, scroll-tinted ground,
  progress line or scroll-spy marker.
- **Every kind:** the two or three dealt moments and the dealt scene may follow the scroll, each inside its own section
  (`data-moment`; also the scene, `data-big-scene` with `{"hold": 1}`), which stays 1H
  or 2H (`scenes.md`, Its height; `photo-chapters` is 3H or 4H live, about two thirds of a screen a
  chapter, `moments.md`), pinned only with `position: sticky` inside that box. A scroll
  moment is scrubbed to the scrollbar (it runs back on the way up) and shows a finished state at both
  ends; an enter moment (`picture-develops`) runs once, 1.6 to 1.8 s. Its text is live and visible without the motion (opacity 1,
  4.5:1 at every step); reduced motion and no script show the finished still; phones run the light
  ones (`word-highlight`, the film develop, `photo-chapters`: transform, clip, filter or colour, no
  WebGL) and get the still of the rest; `perf.mjs` passes. It never moves a card, a
  photograph, pricing, an FAQ, a quote block or the footer. Driven by native `animation-timeline`, a
  passive scroll read written to a custom property once a frame, or GSAP ScrollTrigger scoped to that
  section (a classic scene's loader brings it once, on any kind it fits). No smooth-scroll library
  (Lenis, Locomotive, ScrollSmoother) of your own on any page (a classic scene's `"smooth": 1` only
  when the brief asks), and no animation library you add yourself: the kit's moments and scenes
  bring what they need.
- The header and the phone bar look the same at every scroll position; the bar only comes up once
  the hero's button has scrolled away and steps down while the screen shows one of its actions
  (system.js, 240ms, at once under reduced motion).

## Reduced motion, no script, phones

Colours still change; menus fade; a press shows as a deeper tone instead of a move; the tab
indicator and the switch knob jump to their place; the tick appears at full size; the underline
appears without travelling (`motion.css`, reduced motion: `transition-property` limited to
opacity and colours on links, `.m-tab-ind`, `.m-switch::before`, `.m-check::before`). The hero
stands as written, whatever its variant; no section reveals; a row's line appears at once; numbers
do not roll; a swatch swaps its photograph at once. Every loop, effect, moment and scene shows its finished frame, marquees stand as a still row, numbers show their final text, pause buttons are hidden. On a
phone card loops and effects hold their finished picture or poster, heavy canvases become stills,
there are no hover states and no pointer simulations; the hero still enters, and the moments light
enough for a phone run there (`moments.md`, The still rule), so a phone page moves in two places too.

## Never

- A card, row or tile that reveals, staggers, slides or fades in as the page scrolls; parallax on
  text; a scroll scrub outside a dealt moment's or the scene's section; a tech-looking shader ground
  on a place or service page.
- A reveal written by hand (data-aos, a page's own IntersectionObserver fade, GSAP ScrollTrigger on
  headings): the kit's reveals are the only ones. A second hero entrance, an entrance over 1.4 s, a
  data-enter value not in the deck, or an entrance that hides text a visitor could already be reading.
- A card that tilts, flips, scales, follows the pointer or glows at the cursor; a magnetic button.
- A carousel, a slider that advances by itself, timed tabs, a rotating notice, a logo marquee.
- Blinking at random: twinkling dots, glitter, flicker, hue cycling, scrambled text; every change
  shows a state, a step or real data.
- A loop that plays once (outside a card story's replay), a card loop's cycle over 4 s, two loops in
  one panel.
- A hover slower than its token, an overshooting ease, a delay before a button reacts, a focus ring
  that animates, a second underline or indicator style, an animated width, height or margin.

## The lint

`node <skill>/scripts/motion-lint.mjs <page.html>` reads the page's own CSS, style attributes and
scripts (the kit's files under `assets/` pass on their own) and prints the same lines as
`copy-lint.mjs`: FAIL motion-transition-all, motion-ease-in, motion-scale-zero, motion-layout,
motion-no-reduced, motion-enter-variant, motion-scroll-library; WARN motion-ease-in-ui,
motion-slow-ui, motion-linear-ui, motion-overshoot, motion-endless, motion-stagger. Exit 0 no FAIL,
1 a FAIL, 2 usage. Fix every FAIL before the gate; a kept WARN is named in the report with its
reason.
