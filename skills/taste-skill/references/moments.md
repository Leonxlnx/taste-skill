# Moments

A moment is the award-site part of a page (house rule 8): the one place, or two, where a page does
something a visitor remembers, in a section of its own; besides it the page has only the hero's
entrance and the hover layer (`motion.md`, The rule). Each is a folder in `assets/moments/<id>/`
(`moment.js`, `moment.css`, `meta.json`, a full `demo.html`); `index.json` lists them,
`gallery.html` links the demos and `moments.js` runs them. Eighteen folders: five retired
(`headline-arrives`, `closing-lift`, `lines-rise`, `window-parallax`, `word-rotate`), and thirteen
dealt by kind (below).

**Which pages: every page.** One moment on a short page, two on a long one (eight sections or more,
in two different sections), never three, on every kind. The place's short page (under 8
photographs, `sections.md` section 4) skips the type moment: its one moment is `picture-develops`
on the section's photograph (`--fits section --photo`, dealt again with `--exclude photo-chapters`
when it gives `photo-chapters`), or, with no photograph, `word-highlight` in a one-screen statement
section of its own, so the page is four screens.

| page kind | dealt from | look |
|---|---|---|
| place (cafe, bakery, guesthouse, shop, gym; a studio with a door is passed as `--page place`, since `--page studio` reads as service) | `photo-chapters`, `picture-develops` (film), `word-highlight` | photographs and type |
| product (site-kind other) | `photo-chapters`, `pinned-chapters`, `picture-develops` (film), `word-highlight` | photographs and type |
| service (firm, clinic, agency, trade) | `photo-chapters`, `pinned-chapters`, `picture-develops` (film), `word-highlight` | photographs and type |
| software, gaming, tech | the eleven that list them: every dealt moment but `photo-chapters` and `picture-develops` | as before 2.5.1 |

Why these for the other kinds: each is led by the client's own photographs or words, moves only in
its own section, costs no WebGL and reads as calm (a hotel, a law firm, a wedding photographer). Not
on them: anything with a shader, WebGL or a liquid or pointer effect (`liquid-hover`,
`liquid-type`, `cursor-spotlight`), anything that reads as a graphic trick (`iris-opens`,
`line-carries-colour`, `letters-assemble`, the halftone of `picture-develops`, and
`giant-type-pass`: a photograph inside letters reads as a template trick, muddies a warm palette
and is a parallax), a loop (`marquee-row`) and a count (`counter-rolls`). On those
pages the two of a long page are the statement moment (`word-highlight`) and one section moment
(the photographs), or the photograph that develops beside one of the chapters moments (two kinds:
one runs once as it enters, the other follows the scroll). `photo-chapters` and `pinned-chapters` never share a page and do different
jobs: photo-chapters tells a story in full-width photographs with one chapter at a time on a panel;
pinned-chapters walks through steps listed beside one frame (how a booking or an order goes).
A moment counts against a tech page's big scene (`effects-usage.md`) as one of its beats.

## Deal them, never choose by taste

```bash
# a place, product or service page: one on a short page, two on eight sections or more
node <skill>/scripts/moments.mjs pick --page place|product|service --count 1|2 --fits section,statement \
  --photo --history .taste-skill/history.json
# a software, gaming or tech page (less a hero moment)
node <skill>/scripts/moments.mjs pick --page <kind> --count 1|2 --fits section,statement \
  [--scene <id>] [--effects <ids>] [--contexts <n>] [--photo] --history .taste-skill/history.json
# a hero moment on tech (0 or 1): the same with --count 1 --fits hero; kept only when the dealt hero lists it
```

- **`--page`** is the page's kind (`SKILL.md` section 1: `software`, `gaming`, `tech`, `place`,
  `product` or `service`; `ai`, `saas`, `technical-product`, `cafe`, `bakery`, `guesthouse`,
  `hotel`, `shop`, `studio`, `agency`, `firm`, `clinic` and a few more are read too). A word that
  names no kind (`other` is three kinds) stops the deal with exit 1: say which.
- **`--photo`** on every place, product or service page (they all have photographs): without it
  the photo moments drop out and a long page cannot be dealt two.
- **`--fits section,statement`:** a statement is a section of its own, so the letters, liquid type,
  word-highlight and the counter come only with it; `section` alone deals none of them.
- **No kind needs `--exclude`:** each pool is what lists the kind in `meta.json` (the short page's
  `photo-chapters`, above, is the one case).
  `picture-develops` is dealt only in its film look, on place, product and service; its halftone
  look stays in the kit as `data-moment-opts='{"look": "print"}'` with its print-shop demo, never
  dealt. A dealt scene's twins and avoidMoments are left out by `--scene <id>` itself.
- **The hero moment** (0 or 1, never on a big-scene hero) is kept only when the dealt hero lists it
  in `heroes.json` (`moments[].id`): that is `liquid-hover` on `split` and
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
  photograph only with `--photo`; on a place, product or service page one statement and one
  section, or two kinds (`picture-develops` with a chapters moment). Write each id, its section and its purpose in the plan (`motion.md`, Why it moves). A dealt moment with
  nothing to carry is dealt again with it added to `--exclude`.
- **Retired** (`meta.retired`, weight 0, never dealt): `headline-arrives` (every hero now enters
  through the motion layer, `motion.md`, The hero's entrance; a moment that also moves the headline
  would be a second entrance) and `closing-lift` (it needs a closing band of its own and its words stand on a
  gradient over the photograph); since 2.5.1 also `lines-rise` (every hero's lines already rise on
  load), `window-parallax` (a parallax on a photograph) and `word-rotate` (the `word` hero carries
  its own live word, `layout-v4.md`). `magnetic-button` (CK-94) is gone.

## Where each fits

| id | kind · fits | phone and reduced motion |
|---|---|---|
| word-rotate | retired · hero, three rounds then rests | the written word stands |
| lines-rise | retired · one section or statement, once | the heading and its lines stand |
| counter-rolls | text · the proof figures, once; never in a card | the figures stand |
| word-highlight | scroll · one statement | runs on a phone; reduced motion: the whole statement in ink |
| giant-type-pass | scroll · one statement with a photograph of mid to dark tones (tech only) | the photograph stands in the letters, smaller type |
| letters-assemble | scroll · one statement of 2-5 words, set very large: its letters fly into the line | the statement as written |
| pinned-chapters | scroll · one feature section of 2-4 steps, two screens live | static rows (or each step with its visual under it) |
| window-parallax | retired · one wide photograph | the photograph stands in its frame |
| marquee-row | scroll · a row of real words (trades, cities, formats; never logos: a logo never moves), with a pause button | the words in a wrapped row |
| line-carries-colour | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) is cleared by a line climbing from its foot; each block shows whole once the line has passed it | the section on its own ground, no panel, no line |
| iris-opens | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) opens a disc with a hairline accent ring; each block shows whole once the disc holds it | the section on its own ground, no panel, no ring |
| picture-develops | transition · one large photograph with a clear subject, once, 1.6 s (look `film`): it comes up out of a faint grey print, darks first, then colour; the halftone look `print` is not dealt | the film look runs on a phone; reduced motion: the photograph stands |
| photo-chapters | scroll · one section of 3-5 chapters (a title and two lines each, one photograph each) under its h2 and lead: one photograph the width of the page, each next one uncovered from its foot over the last, the chapter on a panel at its lower left; about two thirds of a screen of scroll a chapter, so the section is three screens live (four with four or five chapters); place, product, service | runs on a phone held upright; reduced motion: the chapters side by side, each photograph over its words (a phone stacks them), the section as tall as they are |
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
`"phone"` or `"card"`. **Phones still get a moment:** the ones light enough for a phone (one
picture or one paragraph at a time; transform, clip, filter or colour) say `export const phone =
true` in their `moment.js` and `"phoneRuns": true` in `meta.json`, and run there; only reduced
motion and a card keep them still. Those are `word-highlight`, `picture-develops` (film) and
`photo-chapters` (from 600px of height), which covers every place, product and service deal. The answer is taken when the moment mounts (a window resized across 640px
applies it on the next load; `pinned-chapters` and `photo-chapters` ask again on resize). Each `meta.json` says what the
still shows (`reduced`, `phone`). Hover moments do nothing on touch screens either.

**Nothing on a card moves on scroll** (house rule). A moment sits on a hero, a statement, one
section, a transition or the close, never in a card, a plan, a result or a bento cell: the loader
leaves one that does still (`data-moment-still="card"`, `data-moments-card` on `<html>`) and
`moments.mjs check` calls it a fault.

## Put one on the page

The host is a section of the page (or, for the text moments, the headline or the row inside it);
mark it as the moment's header comment shows (`data-moment="<id>"`, options in `data-moment-opts`).
Every section stays one or two screens tall (`layout-v4.md`, `--h`), live and at rest, but the two
chapters moments: `photo-chapters` is (hold + 1) screens live (three for three chapters, four for
four or five; write no `--h` and no `data-screen` on it: the checker and the layout check both read a
live photo-chapters section as whole screens, four at most) and both are as tall as their content at rest. A transition's
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

A moment's section in a page is copied from one of the two page models, which mount moments inside
a starter page and pass the checker: `assets/moments/_demo/in-page.html` (a place:
`photo-chapters`, `word-highlight`) and `in-page-service.html` (a service: `pinned-chapters`,
`picture-develops` in its film look). A moment's own `demo.html` shows it alone and is not a page
model.

## Rules

- **The kind's count, an id once.** `data-moments-over` and `data-moments-repeat` on `<html>` are faults.
- **No random effects as you scroll.** A scroll moment is scrubbed to the scrollbar inside its own
  section, which stays one or two screens tall (`photo-chapters` three or four), and does one purposeful thing; at the section's top
  and bottom it shows a finished state (every transition and `letters-assemble` finish before the
  section's top is a fifth of the screen down), so each judge tile shows one whole section. No card,
  row or tile ever enters on scroll. `consistency.mjs` reports a scroll finding inside the dealt
  `[data-moment]` section; that one is expected, any other is a fault.
- **Content is readable without the motion:** the words are in the HTML, in their finished place; a
  moment never hides a headline on load (the hero's own entrance is the motion layer's, `motion.md`).
- **Photo-led on the other kinds:** a place, product or service page's moment carries the client's
  own photographs (or library ones that pass `photos.md`), each used once on the page, and its
  words are the page's real copy; never a stand-in picture to give the moment something to move.
- **One count a page:** `counter-rolls` or `data-m-count` (`motion.md`), never both.
- **Nothing blinks, bounces or overshoots.** Ease-outs (cubic-bezier(.22,1,.36,1) for a settle),
  600-1,000 ms for a reveal, 1.6-1.8 s for a photograph developing; a scrubbed wipe or change takes
  about half of its chapter's share of the scroll and holds for the rest; a loop runs its rounds and
  rests, or carries a pause button.
- **The page's edges.** A moment's text sits in a `.container` or `.wrap` like every other section: its
  words end on the page's left and right edges. A transition's cover is an inset panel inside the host
  section with an even gutter on every side (card corners, never touching the section's edges), its
  line or ring inside the panel; every heading, paragraph, button and picture appears whole, never cut
  by the line or the disc (each moment's `meta.json`, `look`, says how).
- **Cost:** no WebGL but `liquid-hover` (tech only) (one context, only near the screen; a plain photograph without
  WebGL or when the shader fails). `liquid-type` is one SVG filter on one headline, on only while a
  ripple is alive. Every other moment costs CSS variables, a transform or a clip and a passive
  listener.
- **One pointer effect a page:** a hover or liquid moment rules out `fx-button`, `fx-spotlight` and an
  object that turns to the pointer, and the reverse; `pick` never deals two of them.
- **Photographs:** `giant-type-pass` and `liquid-hover` (tech) want mid to dark tones with edges and detail; a
  pale dusk sky reads lavender in a letter and a flat sea shows no ripple. Never violet or lavender.
- **No captions;** the photograph's credit goes in the footer line.

## Check it

- `node <skill>/scripts/moments.mjs check <page.html> --page <kind> [--scene <id>] [--effects a,b] [--contexts n]`
  reads the built page: how many moments, any twice, retired, off its page kind (a WebGL or effect
  moment on a place is off its kind), in a card, holding a figcaption, two that avoid each other, two
  of one slot on a place, product or service page, the WebGL total against 4, a missing loader. Exit 1
  on a fault.
- `node <skill>/scripts/moments.mjs shoot --out shots/moments --profile <own chrome dir> --port 5720 --only <id> [--reduced]`
  shoots the demo's start, middle and end states at 1440 and 390 in the skill's headless Chrome (WebGL
  on the CPU); the end must be the finished section. Under `--reduced`, and at 390 for a moment
  without `phoneRuns`, it also checks the still rule: the host must say `data-moment-still` and no
  animation may run inside it (a line `STILL?` otherwise). `--probe "<js expression>"` prints a value after each state.
- The headless Chrome draws WebGL on the CPU, so `liquid-hover` shows a fainter ripple there than on a
  GPU and its end state waits 6 s to be the plain picture; a text or scroll moment looks the same on both.
