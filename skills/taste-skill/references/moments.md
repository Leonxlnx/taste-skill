# Moments

A moment is the award-site part of a page (house rule 8): a place on the page where something
happens that a visitor remembers, in a section of its own; besides the moments the page has the
hero's entrance, the quick section reveals and the hover layer (`motion.md`, The rule). Each is a
folder in `assets/moments/<id>/` (`moment.js`, `moment.css`, `meta.json`, a full `demo.html`);
`index.json` lists them, `gallery.html` links the demos and `moments.js` runs them. Eighteen
folders: seventeen dealt by fit (below) and one retired (`headline-arrives`, now a hero entrance).

**Which pages: every page.** Two moments on every page, three on a long page (eight sections or
more), each in a section of its own, never two in one section. The first one dealt is lively or
bold and goes in the first three screens, so something clearly moves before the visitor decides to
stay; the others go further down. At least one of them runs on a phone (the deal sees to it), and
a moment that only answers a mouse (`liquid-hover`, `cursor-spotlight`, `pointerOnly` in its
`meta.json`) is never one of the two: it comes only as the extra third on a long page. A dealt
scene (`scenes.md`) counts as its own beat, not as one of the moments.

## The fit rule

Nothing is locked to one kind. Every moment, scene and effect carries three fields in its
`meta.json`: `tones` (the trades it suits), `intensity` (how much it moves) and `webgl` (0 or 1).
The deal reads them against the page's kind:

| tone | trades |
|---|---|
| `warm` | cafe, bakery, restaurant, bar, guesthouse, shop, florist, gym |
| `editorial` | studio, architect, agency, clinic, law, photographer, hotel brand |
| `product` | physical goods |
| `tech` | software, AI, developer tools, fintech, hardware |
| `playful` | games, kids, consumer apps, events |

| page kind | tones it takes | intensity | WebGL |
|---|---|---|---|
| place | warm, editorial | quiet, lively | no |
| service | editorial, warm, product | quiet, lively | no |
| product (site-kind other) | product, editorial, warm | quiet, lively, bold | no effect; only a render the brief asks for |
| tech (hardware) | product, tech, editorial | any | yes |
| software | tech, editorial, product | any | yes |
| gaming | playful, tech | any | yes |

A moment fits a kind when one of its tones is in the kind's tones, its intensity is in the kind's
list, and (with `webgl` 1) the kind takes WebGL. A place, service or product page is strict: the
moment must also carry the kind's own tone (place `warm`, service `editorial`, product `product`),
or the brief's `--tone` when one is passed, so a part made for games and software never reaches a
florist through a shared second tone. So a cafe gets letters that assemble, a marquee of its
breads, a photograph passing through giant type or a statement that lights up, never a liquid
ripple; a game gets the loud ones. `--tone` narrows the deal to the brief's own tone (a cafe:
`warm`; a hotel brand or an architect: `editorial`). The index writes every kind a moment can be
dealt to, with or without a tone, as `pages` (the checker reads them); the fit fields are the source.

| id | tones | intensity |
|---|---|---|
| closing-lift | warm, editorial, product | lively |
| counter-rolls | all five | lively |
| cursor-spotlight | tech, playful, product | quiet |
| giant-type-pass | all five | lively |
| iris-opens | all five | lively |
| letters-assemble | all five | lively |
| line-carries-colour | editorial, warm, product, tech | lively |
| lines-rise | all five | quiet |
| liquid-hover | tech, playful (WebGL) | bold |
| liquid-type | playful, tech | lively |
| marquee-row | all five | lively |
| photo-chapters | warm, editorial, product | lively |
| picture-develops | warm, editorial, product | quiet |
| pinned-chapters | product, editorial, tech, warm | lively |
| window-parallax | warm, editorial, product | quiet |
| word-highlight | all five | quiet |
| word-rotate | playful, tech, product, warm | lively |

`photo-chapters` and `pinned-chapters` never share a page and do different jobs: photo-chapters
tells a story in full-width photographs with one chapter at a time on a panel; pinned-chapters walks
through steps listed beside one frame (how a booking or an order goes).

## Deal them, never choose by taste

```bash
# every page: two moments, a scene about one page in two (--scene deal), the history keeps sites apart
node <skill>/scripts/moments.mjs pick --page <kind> --scene deal --history .taste-skill/history.json
# a long page (eight sections or more): three
node <skill>/scripts/moments.mjs pick --page <kind> --long --scene deal --history .taste-skill/history.json
# the brief's tone, effects already dealt on a tech page
node <skill>/scripts/moments.mjs pick --page place --tone warm --scene deal --history .taste-skill/history.json
node <skill>/scripts/moments.mjs pick --page software --effects silk-folds --scene deal --history .taste-skill/history.json
```

Copy what it prints into the plan: the scene (or "none"), then each moment with the section it goes
in. The first moment says "place it in the first three screens".

- **`--page`** is the page's kind (`SKILL.md` section 1: `software`, `gaming`, `tech`, `place`,
  `product` or `service`; `ai`, `saas`, `technical-product`, `cafe`, `bakery`, `guesthouse`,
  `hotel`, `shop`, `studio`, `agency`, `firm`, `clinic` and a few more are read too). A word that
  names no kind (`other` is three kinds) stops the deal with exit 1: say which.
- **Photographs:** a place, product or service page has them, so the photo moments are in its deal
  without a flag (`--no-photo` leaves them out); on tech, software and gaming pass `--photo` when the
  page has photographs.
- **Slots:** the deal fills sections, statements and the close by default; a statement is a section
  of its own (the letters, the counter, the liquid type and word-highlight come only with one).
  `--fits hero` deals a hero moment, kept only when the dealt hero lists it in `heroes.json`
  (`liquid-hover` on `split` and `photo`, `cursor-spotlight` on `product`, `collage`, `film` and
  `centred`, `liquid-type` on `statement`).
- **`--scene deal`** deals the scene first (`scenes.md`), then the moments around it, leaving out
  the scene's `avoidMoments`. A scene chosen on purpose is passed as `--scene <id>` instead.
- **The WebGL budget.** A page holds at most 4 live contexts (`perf.md`). The deal adds up what the
  page already spends and never deals a moment whose own `webgl` (only `liquid-hover` has 1) would
  push the total over 4: the scene (its `webgl` in its `meta.json`), each dealt effect in
  `--effects a,b` (one each, the worst case) and anything else in `--contexts <n>`. It prints the total.
- **The rest of the deal.** The history's `moments` list is read as cycles: once every moment that
  fits has been dealt, the next cycle starts empty, so an id comes back only after all the others and
  never straight after itself (the three dealt last stay out even across a cycle's end). Two of one
  kind only when one is a statement and the other a section; one pointer moment a page (hover and
  liquid); never two of one slot, never two that avoid each other, never two WebGL moments. A dealt
  moment with nothing to carry is dealt again with it added to `--exclude`.
- **Phones and the mouse.** When none of the dealt moments runs on a phone, the last one that can
  be swapped is dealt again from those that do. `pointerOnly` moments never fill the two.
- **One close.** A dealt scene that is the close leaves `closing-lift` out; a closing scene or
  `closing-lift` is the page's close, so the plan writes `close none` and the footer keeps its
  links row only (`start.mjs plan`).
- **The copy's count.** `pick` prints each moment's `needs.words` and, where its `meta.json` has
  `text`, the count the checker measures on the built page (`moment-text`): `liquid-type` 2-6
  words, `letters-assemble` 2-5, `giant-type-pass` 2-4, `word-highlight` 12-40, `closing-lift`'s
  line 3-7, `marquee-row` 6-14 items, `counter-rolls` 2-4 figures (a FAIL), `lines-rise` 2-3 lines
  at a desktop width (a WARN). Write the copy to the count, or deal again.
- **Un-retired in 2.5.2:** `closing-lift` (the close as a section of its own, a plain footer after
  it; its words stand on the calm, darker lower part of the photograph), `lines-rise` (a statement
  heading of two or three lines, slower and larger than the automatic section reveal),
  `window-parallax` (one wide photograph in a frame, a quiet parallax for a guesthouse or a hotel)
  and `word-rotate` (one word of a statement, the close or a hero other than the `word` hero; since
  2.5.3 it keeps changing while on screen, with a pause button under the headline). **Retired:**
  `headline-arrives`: its look is one of the hero entrances
  (`motion.md`, The hero's entrance); as a moment it would be a second entrance.

## Where each fits

| id | kind · fits | phone (390) | reduced motion |
|---|---|---|---|
| word-rotate | text · one word of a statement, the close or a hero (not the `word` hero); it keeps changing while on screen, with a pause button under the headline; a comma after it stays on its line | runs as on a desktop | the written word stands |
| lines-rise | text · one statement heading of two or three lines, once | runs as on a desktop | the heading and its lines stand |
| counter-rolls | text · the proof figures, once; never in a card | runs as on a desktop | the figures stand |
| word-highlight | scroll · one statement | runs as on a desktop | the whole statement in ink |
| giant-type-pass | scroll · one statement with a photograph of mid to dark tones | smaller type, two thirds of the travel | the photograph stands in the letters |
| letters-assemble | scroll · one statement of 2-5 words, set very large: its letters fly into the line | no scrub: the letters fly in once, 1.1 s, from a third as far | the statement as written |
| pinned-chapters | scroll · one feature section of 2-4 steps, two screens live | nothing pinned: the step at the middle takes the accent rule, each picture settles from a close crop | each step with its visual under it |
| window-parallax | scroll · one wide photograph in a frame, a little slower than the page | two thirds of the travel | the photograph stands in its frame |
| marquee-row | scroll · a row of real words (trades, cities, formats; never logos: a logo never moves); the first word whole as it starts, the pause button after the row, never over a word | runs slower | the words in a wrapped row |
| line-carries-colour | transition · a section on a new ground keeps it edge to edge; inside, an inset panel in the old ground (even gutter, card corners) is cleared by a line climbing from its foot; each block shows whole once the line has passed it; two grounds too close to tell apart get a lighter or darker panel and a 2px line | runs, 20px gutter | the section on its own ground, no panel, no line |
| iris-opens | transition · as line-carries-colour, the panel opening a disc with a hairline accent ring (2px on close grounds); each block shows whole once the disc holds it | runs, 20px gutter | the section on its own ground, no panel, no ring |
| picture-develops | transition · one large photograph with a clear subject, once, 1.6 s (look `film`): it comes up out of a faint grey print, darks first, then colour; the halftone look `print` is not dealt | the film look runs | the photograph stands |
| photo-chapters | scroll · one section of 3-5 chapters (a title and two lines each, one photograph each) under its h2 and lead: one photograph the width of the page, each next one uncovered from its foot over the last, the chapter on a panel at its lower left; about two thirds of a screen of scroll a chapter, so the section is three screens live (four with four or five chapters) | runs held upright; under 600px tall the chapters stack | the chapters side by side, each photograph over its words, the section as tall as they are |
| closing-lift | transition · the close as a section of its own, with a photograph; the last section lifts away like a sheet | no held sheet: the photograph settles from a close crop as it rises, the line fades up | a plain closing section |
| liquid-type | liquid · a hero or statement headline ripples like water: once as it comes on screen, under the pointer, at a tap or touch drag; an SVG filter, no WebGL | runs (the entry ripple and touch) | the headline as written |
| cursor-spotlight | hover · the hero frame; mouse only (`pointerOnly`) | the light rests | the light rests |
| liquid-hover | liquid · one photograph with edges and detail, one WebGL context; mouse only (`pointerOnly`) | the plain photograph, no canvas | the plain photograph |

## The still rule (every moment, no exception)

Every moment has a static variant for a **phone** and for **reduced motion**, and a finished state
without script or when its module fails. The loader decides: it hands each moment a `lib` whose
`reduced()` answers `lib.still()`, which is true under `prefers-reduced-motion` and on a phone (under
640px wide, or a touch screen turned sideways under 500px tall). A moment written against `reduced()`
therefore shows its finished state there, and the host carries `data-moment-still="reduced"`,
`"phone"` or `"card"`. **Phones get the moments too:** every moment but the two mouse ones says
`export const phone = true` in its `moment.js` and `"phoneRuns": true` in `meta.json` and runs on a
phone in a lighter version of the same idea (branching on `lib.phone()`: no pin and no scrub where a
phone cannot hold one; transform, clip, filter or colour on one element); only reduced motion and a
card keep them still. `liquid-hover` and `cursor-spotlight` show their finished state there, and
the deal makes sure at least one of the page's moments runs on a phone. The answer is taken when the
moment mounts (a window resized across 640px applies it on the next load; `pinned-chapters` and
`photo-chapters` ask again on resize). Each `meta.json` says what a phone and reduced motion show
(`phone`, `reduced`). Hover moments do nothing on touch screens either.

**Nothing on a card moves on scroll** (house rule). A moment sits on a hero, a statement, one
section, a transition or the close, never in a card, a plan, a result or a bento cell: the loader
leaves one that does still (`data-moment-still="card"`, `data-moments-card` on `<html>`) and
`moments.mjs check` calls it a fault.

## Put one on the page

The host is a section of the page (or, for the text moments, the headline or the row inside it);
mark it as the moment's header comment shows (`data-moment="<id>"`, options in `data-moment-opts`).
A moment's section is as tall as its content plus the kit padding (`layout-v4.md` section 2), live and at rest, but the two
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
  section, which is as tall as its content (`photo-chapters` three or four screens live), and does one purposeful thing; at the section's top
  and bottom it shows a finished state (every transition and `letters-assemble` finish before the
  section's top is a fifth of the screen down), so each judge tile shows one whole section. No card,
  row or tile ever enters on scroll. `consistency.mjs` leaves the scroll inside a dealt kit
  `[data-moment]` section untold; any other scroll finding is a fault.
- **Content is readable without the motion:** the words are in the HTML, in their finished place; a
  moment never hides a headline on load (the hero's own entrance is the motion layer's, `motion.md`).
- **The client's own material:** a moment carries the client's
  own photographs (or library ones that pass `photos.md`), each used once on the page, and its
  words are the page's real copy; never a stand-in picture to give the moment something to move.
- **One count a page:** `counter-rolls` or `data-m-count` (`motion.md`), never both.
- **Only what the page can fill:** a moment's `needs.list` is read against `--has` as a scene's is
  (`scenes.md`): `counter-rolls` needs `figures`, two proof figures on the fact sheet's Numbers line
  (counts, times, prices; opening hours are not proof), so a cafe without them is never dealt it;
  `photo-chapters` needs three photographs. Pass `--has photo,figures` when the brief has both.
- **Nothing blinks, bounces or overshoots.** Ease-outs (cubic-bezier(.22,1,.36,1) for a settle),
  600-1,000 ms for a reveal, 1.6-1.8 s for a photograph developing; a scrubbed wipe or change takes
  about half of its chapter's share of the scroll and holds for the rest; a loop that runs past 5 s
  (`word-rotate`, `marquee-row`) carries a pause button beside it, never over a word, and pauses
  under the pointer.
- **The page's edges.** A moment's text sits in a `.container` or `.wrap` like every other section: its
  words end on the page's left and right edges. A transition's cover is an inset panel inside the host
  section with an even gutter on every side (card corners, never touching the section's edges), its
  line or ring inside the panel; every heading, paragraph, button and picture appears whole, never cut
  by the line or the disc (each moment's `meta.json`, `look`, says how).
- **Cost:** no WebGL but `liquid-hover` (tones tech and playful, intensity bold: never on a place, service or product page) (one context, only near the screen; a plain photograph without
  WebGL or when the shader fails). `liquid-type` (tones playful and tech: tech, software and gaming
  pages) is one SVG filter on one headline, on only while a ripple is alive. Every other moment costs CSS variables, a transform or a clip and a passive
  listener.
- **One pointer effect a page:** a hover or liquid moment rules out `fx-button`, `fx-spotlight` and an
  object that turns to the pointer, and the reverse; `pick` never deals two of them.
- **Photographs:** `giant-type-pass` and `liquid-hover` want mid to dark tones with edges and detail; a
  pale dusk sky reads lavender in a letter and a flat sea shows no ripple. Never violet or lavender.
- **No captions;** the photograph's credit goes in the footer line.

## Check it

- `node <skill>/scripts/moments.mjs check <page.html> --page <kind> [--scene <id>] [--effects a,b] [--contexts n]`
  reads the built page: how many moments (a fault over three, a warning under two), any twice,
  retired, off its page kind by the fit rule (its tones, intensity and WebGL against the kind), in a
  card, holding a figcaption, two that may not share a page, the WebGL total against 4, a missing
  loader. Exit 1 on a fault. `consistency.mjs` (the gate) measures the copy's count (`moment-text`)
  and leaves the kit moment's own scroll, pin and reveal untold in its section (the first three
  moments; a builder's own scroll moment WARNs), its still judged under reduced motion; the kit's
  marquee track and the offset pair are no card row, split or stagger to it, and a statement the
  moment split into letters (`letters-assemble`) is one part to the reveal check at every width and
  no tilt while its letters fly home.
- `node <skill>/scripts/moments.mjs shoot --out shots/moments --profile <own chrome dir> --port 5720 --only <id> [--reduced]`
  shoots the demo's start, middle and end states at 1440 and 390 in the skill's headless Chrome (WebGL
  on the CPU); the end must be the finished section. Under `--reduced`, and at 390 for a moment
  without `phoneRuns`, it also checks the still rule: the host must say `data-moment-still` and no
  animation may run inside it (a line `STILL?` otherwise). `--probe "<js expression>"` prints a value after each state.
- The headless Chrome draws WebGL on the CPU, so `liquid-hover` shows a fainter ripple there than on a
  GPU and its end state waits 6 s to be the plain picture; a text or scroll moment looks the same on both.
