# Moments

A moment is the award-site part of a page (house rule 8; with the house overrides): the one place, or
two, where a page does something a visitor remembers; the rest stays still. Each is a folder in
`assets/moments/<id>/` (`moment.js`, `moment.css`, `meta.json`, a full `demo.html`); `index.json`
lists them, `gallery.html` links the demos and `moments.js` runs them. Seventeen folders: two
retired (`headline-arrives`, `closing-lift`), four left out of the house deal (below), and eleven
dealt: letters that fly into a statement, liquid type, a circle or a line that changes the ground,
a statement that lights up word by word, a photograph seen through giant type, pinned chapters, a counter, a marquee row, a pointer
light, a liquid photograph.

**Which pages.** Kind software, gaming or tech (hardware: a product page with a technical subject)
only: one moment on a short page, two on a long one (eight sections or more, in two different
sections), never three. **A plain product, a service, a place, shop, cafe or guesthouse gets none**:
they lead with photographs, type and flat colour (the house overrides, point 3). `pick` makes this
the rule: it needs `--page`, and any other kind returns an empty deal. A moment counts against the
page's big scene (`effects-usage.md`) as one of its beats.

## Deal them, never choose by taste

```bash
# the section moments: one on a short page, two on eight sections or more (less a hero moment)
node <skill>/scripts/moments.mjs pick --page <kind> --count 1|2 --fits section,statement \
  --exclude lines-rise,picture-develops,window-parallax,word-rotate \
  [--scene <id>] [--effects <ids>] [--contexts <n>] [--photo] --history .taste-skill/history.json
# a hero moment (0 or 1): the same with --count 1 --fits hero; kept only when the dealt hero lists it
```

- **`--page`** is the page's kind (`SKILL.md` section 1: `software`, `gaming` or `tech`; `ai`,
  `saas` and `technical-product` are read too). Any other kind prints `no moment: ...` and an empty
  deal (`--json`: `"picks": []` with a `reason`), exit 0: the plan then writes "no moment".
- **`--fits section,statement`:** a statement is a section of its own, so the letters, liquid type,
  word-highlight and the counter come only with it; `section` alone deals none of them.
- **Always out:** `lines-rise` (a reveal), `picture-develops` (a photograph that develops),
  `window-parallax` (parallax on a photograph) and `word-rotate` (the `word` hero carries its own
  live word, `layout-v4.md`). A dealt scene's twins and avoidMoments are left out by `--scene <id>`
  itself.
- **The hero moment** (0 or 1, never on a big-scene hero) is kept only when the dealt hero lists it
  in `heroes.json` (`moments[].id`): after the excludes that is `liquid-hover` on `split` and
  `photo`, `cursor-spotlight` on `product`, `collage`, `film` and `centred`, `liquid-type` on
  `statement` (tech, a headline of six words or fewer), and none on the others. Off touch only;
  reduced motion rests. Two moments in all at most.
- **The WebGL budget.** A page holds at most 4 live contexts (`perf.md`). The deal adds up what the
  page already spends and never deals a moment whose own `webgl` (in its `meta.json`: only
  `liquid-hover` has 1) would push the total over 4: pass the big scene as `--scene <id>` (its `webgl`
  is read from `assets/scenes/index.json`), each dealt effect in `--effects a,b` (counted as one
  each, the worst case) and anything else in `--contexts <n>` (an object, a component with a canvas).
  The deal prints the total it reached.
- **The rest of the deal.** Placed in different sections. The history's `moments` list is read as
  cycles: once every moment that fits has been dealt, the next cycle starts empty, so an id comes
  back only after all the others and never straight after itself (the three dealt last stay out
  even across a cycle's end). Never two of one kind (hover and liquid count as one: one pointer
  effect a page), never two of one slot, never two that avoid each other, a moment that needs a
  photograph only with `--photo`. Write each id and its section in the plan. A dealt moment with
  nothing to carry is dealt again with it added to `--exclude`.
- **Retired** (`meta.retired`, weight 0, never dealt): `headline-arrives` (MO-62, the headline never
  hides on load) and `closing-lift` (it needs a closing band of its own and its words stand on a
  gradient over the photograph). `magnetic-button` (CK-94) is gone.

## Where each fits

| id | kind · fits | phone and reduced motion |
|---|---|---|
| word-rotate | text · hero, three rounds then rests | the written word stands |
| lines-rise | text · one section or statement, once | the heading and its lines stand |
| counter-rolls | text · the proof figures, once; never in a card | the figures stand |
| word-highlight | scroll · one statement | the whole statement in ink |
| giant-type-pass | scroll · one statement with a photograph of mid to dark tones | the photograph stands in the letters, smaller type |
| letters-assemble | scroll · one statement of 2-5 words, set very large: its letters fly into the line | the statement as written |
| pinned-chapters | scroll · one feature section of 2-4 steps, two screens live | static rows (or each step with its visual under it) |
| window-parallax | scroll · one wide photograph | the photograph stands in its frame |
| marquee-row | scroll · a row of real words (trades, cities, formats; never logos: a logo never moves), with a pause button | the words in a wrapped row |
| line-carries-colour | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) is cleared by a line climbing from its foot; each block shows whole once the line has passed it | the section on its own ground, no panel, no line |
| iris-opens | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) opens a disc with a hairline accent ring; each block shows whole once the disc holds it | the section on its own ground, no panel, no ring |
| picture-develops | transition · one photograph with a clear subject, once | the photograph stands |
| closing-lift | transition · the close, with a photograph | a plain closing section |
| cursor-spotlight | hover · the hero frame | the light rests |
| liquid-type | liquid · a hero or statement headline ripples like water under the pointer, an SVG filter, no WebGL | the headline as written |
| liquid-hover | liquid · one photograph with edges and detail, one WebGL context | the plain photograph, no canvas |

## The still rule (every moment, no exception)

Every moment has a static variant for a **phone** and for **reduced motion**, and a finished state
without script or when its module fails. The loader decides: it hands each moment a `lib` whose
`reduced()` answers `lib.still()`, which is true under `prefers-reduced-motion` and on a phone (under
640px wide, or a touch screen turned sideways under 500px tall). A moment written against `reduced()`
therefore shows its finished state there, and the host carries `data-moment-still="reduced"`,
`"phone"` or `"card"`. The answer is taken when the moment mounts (a window resized across 640px
applies it on the next load; `pinned-chapters` asks again on resize). Each `meta.json` says what the
still shows (`reduced`, `phone`). Hover moments do nothing on touch screens either.

**Nothing on a card moves on scroll** (house rule). A moment sits on a hero, a statement, one
section, a transition or the close, never in a card, a plan, a result or a bento cell: the loader
leaves one that does still (`data-moment-still="card"`, `data-moments-card` on `<html>`) and
`moments.mjs check` calls it a fault.

## Put one on the page

The host is a section of the page (or, for the text moments, the headline or the row inside it);
mark it as the moment's header comment shows (`data-moment="<id>"`, options in `data-moment-opts`).
Every section stays one or two screens tall (`layout-v4.md`, `--h`), live and at rest: a transition's
host is the whole section that sits on the new ground, a statement moment is one section with its h2
first, a marquee or counter row merges into the section above as its last row. In `<head>`, the one line plus a `modulepreload` for
the loader, its lib and the dealt moment:

```html
<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="assets/moments/moments.js"><link rel="modulepreload" href="assets/moments/lib.js"><link rel="modulepreload" href="assets/moments/<id>/moment.js">
```

Then the loader once. On a page with `system.js`, `system.js` imports it and waits for it. On a page
without, the demo pages' tag at the end of `<body>`:

```html
<script type="module" src="assets/moments/moments.js"></script>
```

The loader links each moment's CSS and starts it; `<html data-moments-ready>` says when. A failed
module gets `data-moment-failed` and the class `mo-safe` on its own element, which the moment's CSS
reads as "show the finished state now". A demo's copy and photographs are placeholders. Every moment
takes the page's tokens (`--bg`, `--ink`, `--muted`, `--accent`, `--line`, the display face).

## Rules

- **The kind's count, an id once.** `data-moments-over` and `data-moments-repeat` on `<html>` are faults.
- **No random effects as you scroll.** A scroll moment is scrubbed to the scrollbar inside its own
  section, which stays one or two screens tall, and does one purposeful thing; at the section's top
  and bottom it shows a finished state (every transition and `letters-assemble` finish before the
  section's top is a fifth of the screen down), so each judge tile shows one whole section. No card,
  row or tile ever enters on scroll. `consistency.mjs` reports a scroll finding inside the dealt
  `[data-moment]` section; that one is expected, any other is a fault.
- **Content is readable without the motion:** the words are in the HTML, in their finished place; a
  moment never hides a headline on load (`headline-arrives` is retired for it).
- **One count a page:** `counter-rolls` or `data-m-count` (`motion.md`), never both.
- **Nothing blinks, bounces or overshoots.** Ease-outs, 600-1,000 ms for a reveal; a loop runs its
  rounds and rests, or carries a pause button.
- **The page's edges.** A moment's text sits in a `.container` or `.wrap` like every other section: its
  words end on the page's left and right edges. A transition's cover is an inset panel inside the host
  section with an even gutter on every side (card corners, never touching the section's edges), its
  line or ring inside the panel; every heading, paragraph, button and picture appears whole, never cut
  by the line or the disc (each moment's `meta.json`, `look`, says how).
- **Cost:** no WebGL but `liquid-hover` (one context, only near the screen; a plain photograph without
  WebGL or when the shader fails). `liquid-type` is one SVG filter on one headline, on only while a
  ripple is alive. Every other moment costs CSS variables, a transform or a clip and a passive
  listener.
- **One pointer effect a page:** a hover or liquid moment rules out `fx-button`, `fx-spotlight` and an
  object that turns to the pointer, and the reverse; `pick` never deals two of them.
- **Photographs:** `giant-type-pass` and `liquid-hover` want mid to dark tones with edges and detail; a
  pale dusk sky reads lavender in a letter and a flat sea shows no ripple. Never violet or lavender.
- **No captions;** the photograph's credit goes in the footer line.

## Check it

- `node <skill>/scripts/moments.mjs check <page.html> --page tech [--scene <id>] [--effects a,b] [--contexts n]`
  reads the built page: how many moments, any twice, retired, off its page kind, in a card, holding a
  figcaption, two that avoid each other, the WebGL total against 4, a missing loader. Exit 1 on a fault.
- `node <skill>/scripts/moments.mjs shoot --out shots/moments --profile <own chrome dir> --port 5720 --only <id> [--reduced]`
  shoots the demo's start, middle and end states at 1440 and 390 in the skill's headless Chrome (WebGL
  on the CPU); the end must be the finished section. At 390 and under `--reduced` it also checks the
  still rule: the host must say `data-moment-still` and no animation may run inside it (a line
  `STILL?` otherwise). `--probe "<js expression>"` prints a value after each state.
- The headless Chrome draws WebGL on the CPU, so `liquid-hover` shows a fainter ripple there than on a
  GPU and its end state waits 6 s to be the plain picture; a text or scroll moment looks the same on both.
