# Cards

How a feature card is built so it looks like x.ai's and Figma's, not a template. Measured from
the reference recording (x.ai Grok Bot 2x2, Figma's tile wall) and a study of 41 company sites.
Showcase: `assets/ui/cards.html` (nine layouts: 2x2, bento, split, stat, integrations,
testimonial, pricing, tall cards, developer tools; light and dark). Every fragment on its own: `assets/ui/index.html`.
Styles: `assets/ui/cards.css` (card, panel, placements) and `assets/ui/base.css` (fragments).
Motion: `assets/ui/ui.js`. Objects instead of photographs: `assets/ui/_lab/object-card.html`.

## Why theirs look expensive

1. The card is barely there: one step off the page, a hairline, generous padding. The colour is
   inside the panel.
2. The panel holds a real, lit picture (a painted landscape, a grain field, a mesh, satin), never a
   flat two-stop gradient and never a pattern of lines or dots. On a dark page it is the brightest
   thing in the card: x.ai puts a daylight painting behind its dark UI.
3. The UI on it is a real product at true size, cut by the panel's edge: a glimpse of something
   bigger, not a toy floating in the middle.
4. One thing moves per card group, inside a panel (tech pages). The card never moves by itself; a
   card with a link lifts 2px on hover (`motion.md`).
5. Everything lines up: panel edge with text edge, radii nested, titles level across a row.

## The card

- Fill `--card`, one clear step off the page (light: white on `#f3f3f1`; dark: `#151517` on
  `#070708`, as x.ai's dark cards read against their page), or no border at all when the photograph
  or flat fill is the card.
- Border 1px, ink at 8 to 14%; inner top highlight 1px (white 5-7%, dark only). No blurred shadow at
  rest (a hard zero-blur offset is allowed as the rest style); a card with a link may show a soft
  shadow on hover only (`motion.md`). A card with a link lifts 2px on hover; a card without one
  carries `.m-nolift`. Never tilted, never a carousel: rows show whole cards; press quotes stack.
- Rows on the grid: two-up 6+6, three-up 4+4+4, four-up 3+3+3+3, the first card on the left line,
  the last on the right, one height per row, every row full (`layout-v4.md` section 4). Mark every
  frame that holds a visual or UI with `.frame` or `[data-visual]` so it never counts as a band.
- Radius `--r-lg` (20 on `soft`; 18 on a phone). Padding 32 from 1024px, 28 below, 24 on a phone:
  never under 24, and the text always inside it. A filled split panel pads 48.
- Title one line at the card-title token (20/18), weight 500. 8px, then at most two lines at 16/24
  in the ink (`--c-text`, 84% ink: never small grey text), at most 46ch. All running text in a card
  is 16/24 in that ink: points, the line under a stat, plan lines and lists, a quote's name and role, a
  result's bar labels. Muted small text is for labels only (a price's "/ month", a section tag).
  `.card--row` holds the lines at 2 from 1024px so titles and panels line up across a row.
- 32px from the last line to the panel. One `--p-h` per card group (page CSS), and a phone value beside it when
  the group's tiles stack into a two-screen section (`@media (max-width: 639px) { #features .panel { --p-h: 180px } }`
  holds four tiles of two lines each in two phone screens).

## Two levels, never three

A card holds a picture, and the picture holds the product. That is all:

- **card > panel (a lit picture) > fragment.** The panel must read as a picture, not as a box: a
  soft field with no border lines, grid, ruling or dots of its own, so the fragment sits *on a
  picture*, not in a frame in a frame.
- Never card > patterned panel > white UI card (in testing, "card, grid-paper panel, white UI card"
  read as three nested boxes). Never a fragment that is itself a card holding cards of text.
- Never a card inside a card for text, never glass.

## The panel

- Default (x.ai): side edges on the text column, runs off the card's bottom edge, top radius 12,
  the lower 60-65% of the card (`--p-h` 264-340px).
- `.panel--inset`: even 8px margin; radius = card radius - margin (20 - 8 = 12), never under 6,
  so the corners read as one family. Every panel in a row has one ratio (4:3 or 16:10) and one
  inset. A smaller UI card on a panel is solid (never frosted), 40 to 60% of the panel's width,
  offset so the panel's bottom or right edge cuts it.
- `.panel--flush`: runs to the card's side and bottom edges (Figma's image band).
- `.panel--top`: on top with an 8px margin, the card's lines below (tall cards).
- `.panel--device`: a status row on the card itself (app, muted context, a quiet status with a
  still dot), then the ground as its screen, radius 12, running off the bottom: x.ai's "Computer"
  card. The row is not a frame of its own (a filled device frame made a fourth box).
- A 1px inner edge (`::after`) sits over the ground and over any fragment it cuts.
- The vignette (`::before`: `--vx`, `--vy`, `--calm-k`) calms the ground where the fragment sits.
  On a lit ground set `--calm-k: 0%` and use the effect's own `calm` params.

## The fragment on it

- **The product's own subject**: the fragment shows what this product works on, as its
  users see it. A code-review tool shows a real diff, red and green, with the comment and its
  Accept or Apply action (`diff-review`); an invoicing app an invoice; a booking app its calendar; a
  CI product its pipeline (`pipeline-board`, `terminal-run`). Never a generic dashboard, chat or stat
  card standing in for it; when no fragment shows the subject, build it from the client's screens.
  Cards show parts; the product is shown whole once, big, in an `app-frame` (`sections-library.md`:
  `window` as the list beside the open item, one window across the `.wrap`). A software page whose
  product appears only as small fragments centred on coloured panels reads as fragments, not as
  the product (in testing: about 3.5 points under Linear).
  A gaming page takes no fragment at all: it shows the game (`sections.md`, Gaming). Its feature cards are open cards for what you do in it, one verb each (sail, salvage, rebuild), each holding an in-engine shot, else the still render of the object that verb uses (`data-product-place="card"`).
- The product's real UI as live HTML at true size, complete and legible, never a flat picture:
  13px text, 12px meta, never under 11px; weights 400 and 500. Real data (names, amounts, order
  numbers, times) and real app marks (`icons.md`). Each fragment keeps its minimum width (chat
  140, checklist 160, slider 215, toggles 230, search 240, terminal-run 280, calendar 280, stat 285,
  cursor 290, files 300, diff-review 280, pipeline-board 280, notify 340, code 365, doc 400, window 456).
  A phone mock or UI card runs past its panel
  only where the panel clips it, never past `.wrap`.
- Surface white on light, `#1c1d20` on dark (one step lighter than the `#151517` card; `--frag`
  sets it); 1px border at 12%; radius 12; the layered shadow lives only inside the panel.
- The primary button is the ink; switches that are on are ink; the product's own mark
  (`.ui-agent`) is ink. **The accent appears once per fragment**: the row being worked on, the
  marked date, the marked line's bar, the last bar, the slider being dragged. A range, keywords,
  numbers, today's dot and status chips are ink tints. Never a row of green dots.
- **Real icons in their own colours** (house rule: "more colour, more official"): a mark on a
  tile (`.ui-logo`, `.ui-file__icon`, `.ui-field__tile`) sits on a light tile on every surface, in
  its brand colours: a colour file from `assets/icons` (`icons.mjs fetch` or `scan`,
  `references/icons.md`) as `<img>`. The kit's sample marks are local files in `assets/ui/icons`
  (`<img src="assets/ui/icons/x.svg">`): after pasting, write each as the client's tool,
  `<img data-icon="<id>" src="assets/icons/<id>.svg" alt="">`, and `icons.mjs scan --colour` fetches it; no page calls a CDN for an icon. One treatment per set: never colour marks beside ink marks. A small mark inline beside text (a breadcrumb, a source chip) stays in the ink.
  Glyph marks only; a wordmark (Zoom's) is illegible at tile size.
- Placement (`.stage` holds them, absolute in the panel; each `meta.json` has its own `place`):
  - `.at-corner`: 28-40px from the top-left, cut by the right and bottom (19 of 41 sites).
  - `.at-rise`: starts 24-56px down and leaves through the bottom (chat, voice, a calendar).
  - `.at-right`: anchored top-right; it narrows on a small panel rather than cut its text.
  - A short stack (notify) sits low: `--ay` and `--ay-sm` `calc(100% - 180px)`, its last row cut.
  - `.at-over`: a second fragment over the first one's lower-right edge. The `cursor` dialog only
    ever sits here, over a window: never alone on a ground, never centred.
  - `.at-center`: only a small control (at most about 250 x 130) on a focal tile: the compact
    slider driving its ground (Figma's Texture tile). Never a window or a dialog. It never runs
    past the panel (cards.css caps it at the panel less 24px a side, 16px on a phone).
  - `.fit` + `--fit-max: <true width>`: keeps its width on a wide panel, centred between the
    insets (even ground at both sides), and narrows on a small one, so 1024 never shows a 1-23px
    sliver or cut. `window` lays itself out for the width it gets
    (rows stack under 540px, the sidebar goes under 420px), so it may sit in a `.fit`.
  - `.wide` + `--w`: a fluid grid (files) set wider than the panel, so it is cut by the right
    edge like a window; it always runs 64px or more past it.
  - `.to-edge`: the wrapper reaches 72px past the bottom, whatever the panel's height; `chat`,
    `doc`, `stat` (`fill`) and `voice` grow into it, so they are always cut, never a few px short.
  - Developer tools (tech and software pages only; all three lay themselves out for the width they
    get, so none is ever sliced):
    - `diff-review` (a code review on a diff): `.at-corner.fit` (or `.at-rise.fit` in a wide panel)
      with `--fit-max: 480px` (up to 760px wide), 32-40px in, cut by the bottom with `.stage--fade-b`:
      the reviewed line, its suggestion, the comment and the Apply button stay in the top 250px, and
      the diff runs two context lines further, so a 352px panel at 36px down cuts it by 32px or more
      at every width (never leave less than 24px of it past the edge). Never cut it by the right edge.
      Under 440px it keeps one gutter and drops the function name from the hunk header; on a phone give
      its panel 340px or more. The file's real mark (TypeScript) sits on a light tile in its header.
      The accent is the short bar beside the comment's text, set in from the comment's edge.
    - `terminal-run` (a test run in a terminal): `.at-rise.fit` with `--fit-max: 440px`, 32-40px in
      and 32-40px down, always whole with 24px or more of ground under it (a 352px panel at 40px
      down). Never cut or faded: the status line with its green check sits one row above the bottom.
      In a wide panel or a split card `--fit-max` goes up to 560px (the path column stops at 28
      characters). The counts go under 380px; the branch and the repo's parent folder under 300px.
      The status check is the one green and the strongest mark; the meter's thin bar is the one
      accent; the per-file ticks stay ink.
    - `pipeline-board` (a CI run on a rail of steps) sits whole: `.at-rise.fit` with
      `--fit-max: 420px`, 32-40px down, 24px or more of ground under it and no fade, since the
      running step reaches the last row. In a large panel or a split card it goes `.at-corner.fit`
      at its full width (680px or more), where it becomes a row of nodes with a log about 300px
      tall, and the bottom-right corner stays clear for the pause button. Waiting steps say
      "Queued" in the markup, so no node is an empty box. Each step names the real mark of its tool
      (Git, npm, Node.js, Docker, Kubernetes) on a light tile, one treatment for all five. The cycle
      starts and ends on the markup as written, so write the picture to rest on (the run part done).
- Vary the placements across a group: a 2x2 shows at least three (rise, corner or device, a low
  stack, right). Never one card layout four times.

## Edges and fades

- Every edge keeps 24px of ground or is cut by 24px or more (16px a side on a phone, by design).
  A cut never slices text: `.stage--fade-b`, `--fade-r`, `--fade-br` dissolve the last
  `--fade-h` (64px; 40px on a short panel such as the tall cards) into the ground.
- **A fade never crops the point.** It only covers context: the row below the one that changes,
  a chat's input, a page's later paragraphs, a list's last rows. The thing the card is about (the
  row being worked on, the connecting app, the number, the button, the orb and its transcript line) sits
  above `100% - --fade-h`. Put the moving row near the top (the integrations target third, not
  last), or lower the fragment's start, or shorten the fade.
- A fade only where an edge cuts: a fragment that keeps 24px of ground on a side has no fade on
  that side (`--fade-br` on a window that ends inside the panel fades it for nothing).
- Measure at 1440, 1024, 768 and 390; on a phone cards.css places the fragment 16px in on both
  sides, cut only at the bottom.

## Grounds

Shader grounds in panels are for tech pages (software and hardware; a gaming page has no feature
cards of UI), one card group a page, still, from the family of the
page's one effect (`effects-usage.md`). On a product or service page a panel holds the client's
photograph (`<img class="frame__img">`, zooming 1.02 to 1.03 inside it when the card links), real
icons or a still diagram on a flat `--g-alt` or `--g-main` panel; a place has no feature cards.
Other tech card groups take a flat panel, the lit ground plain, a photograph or a diagram.

- One ground id for the card group, a new `data-fx-seed` per panel, never the id of the hero's
  effect (one effect in hero, cards and close reads as a stock motif).
- **Behind a fragment, a soft field**: `painterly-landscape`, `grain-gradient`, `gradient-mesh`,
  `silk-folds` (and other mesh, grain and material families). Never a pattern that fights the UI:
  no `grid-pulse`, `ruled-grounds`, `contour-lines`, `dot-terrain`, `ridgeline`, `halftone-screen`
  or `bayer-dither` behind a window, list or card. Those are pictures on their own: a panel with
  no fragment, an object's print, or the data cut out of the UI (below).
- Lit behind UI, on both themes: give each panel that holds UI a light `data-fx-palette` of its
  own, the same in light and dark. On the dark page it is clearly lighter than the card (3:1 or
  more), so page, card, panel and UI are never four near-black layers; on the light page it is a
  clear step darker than the white UI. The palettes in the showcase:
  - painting: `{"bg":"#a3b0b6","accent":"#c49a6c"}` with params `"blur":1,"brush":0.35,"slope":0,
    "hillY":0.3,"horizon":0.62` (a level mist over warm sand, fully soft). Never a blue sky over a
    green hill with a diagonal crest: it reads as a stock desktop wallpaper, not a crafted ground.
    At most one painted panel in a card group (one per page is better); the others take the sand, sky
    or sage palette on grain, mesh or silk.
  - sand: `{"bg":"#d9ccb7","surface":"#e9e0d2","ink":"#2a2622","accent":"#a8794a"}`
  - sky: `{"bg":"#c6d3df","surface":"#d6e0e9","ink":"#25303a","accent":"#3f6a92"}` (silk-folds
    takes a softer accent, `#7f9fbd`, with `"tone":1`)
  - sage: `{"bg":"#cdd6c6","surface":"#dce3d6","ink":"#262d24","accent":"#6c8e63"}`
- A calm hue of its own keeps the page's accent rare. Never violet or lavender.
- Hold every ground still in a card: `speed` 0 or `drift` 0, and `grainMotion` 0 on
  grain-gradient (its film grain moves otherwise). Where the bottom fade shows the ground, calm it
  there (`calmY` near 1) so the fade meets a quiet field, not a bright highlight.
- A ground shows something behind something. A strip of effect under a stat or a line of text, holding
  nothing, is decoration: leave the card plain (Figma's "64%" is a number and one line).

## Light on a laptop GPU

Every page must run on an integrated laptop GPU (2 GB shared), so:

- system.js mounts card grounds through `ui.grounds(document, fx)` (a page without system.js calls
  it itself, never `fx.mountAll`): each still ground is drawn once as it nears the screen, at up to
  2 device pixels (sharp on a 1.25-2x laptop), kept as a plain picture, and its WebGL context freed,
  one at a time, the panel on screen first (a scroll past a group never makes the one in view
  wait). A ground a fragment drives (the slider) carries `data-fx-live`: it is live near the
  screen only, at 1 device pixel, and draws only when it changes; under reduced motion it is baked
  like the rest.
- Live contexts: the page's one effect is the moving hero ground (system.js keeps it live) or one
  of these: the driven ground, the voice orb (dark surfaces only; on light it is CSS), a hover
  light (the featured plan's lap), an object (`effects-usage.md`). Never two of them on a page.
  `ui.grounds` bakes the card grounds one at a time (one context while baking, none after:
  `effects-creative.md`, Cost) and caps the `fx` library at 3 live contexts; the page's cap of 4
  (`perf.md`) counts everything live at once, the effect, a scene and a moment's canvas included.
  It leaves `fx.config.maxDpr` alone.
- An object or any raymarched canvas mounts when its panel nears the screen and is destroyed when
  it leaves (`_lab/object-card.html`); one per card group; never two objects and a moving ground in
  one view. It renders at most 1 CSS px per pixel (0.75 when large), about 1.5 megapixels, and
  stops off screen and in a hidden tab.

## Motion

Card loops are for tech pages; every number (cycle, restart, pause disc, life signs) is in
`motion.md`. The same rule as system.js, in one line: **put `data-ui-loop` on the group's one loop;
every other fragment holds its finished picture.**

- With system.js nothing else is needed: it marks every other fragment `data-ui-still` before it
  loads, and on a phone (under 640px) every fragment but `voice`.
- Without system.js (`cards.html`), `ui.loadAll` / `ui.startAll` do the same as soon as the page
  holds any `data-ui-loop`. A page with none (the kit's `index.html`) lets every fragment loop.
- The group's loop is the one whose motion shows the point (the slider that drives the ground,
  the chat answering). `voice` always runs (held, it loses its orb), so it is its group's loop.
  `data-ui-still` holds a fragment by hand; `data-ui-cycles="2"` plays two cycles when first
  seen, then rests on the finished picture, with no button.
- Below the hero, two loops are never on one screen: a group next to a looping one holds still.
- ui.js puts a pause button on every loop when it starts to move: a solid 32px disc in the page
  colours. In a `.card` it sits beside the card's title, at the right of the text column (the
  title keeps 44px clear for it), so it never covers a cropped panel's UI, which runs into every
  corner. In `[data-ui-pause-host]`, or a `.panel`/`.frame` outside a card, it sits 12px in from
  the bottom-right corner (keep that corner clear); a fragment with no panel gets it under its
  bottom-right corner, in 44px kept free. A place that already holds a `.loop-pause` gets no
  second one. Keyboard focus in a card plays a held fragment's cycle once; only a pointer resting
  on the card repeats it (a held fragment has no button).
- Anything else that moves on its own for more than 5 s (an object, a moving ground) gets the
  same button: `ui.pausable(panel, ctrl)`, where `ctrl` has `pause()` and `resume()`.
- Loops start on the finished picture and never show an empty window or greyed text: the chat
  writes only its answer's last sentence again, and the voice its transcript line, each in under 0.8 s
  with no word below 72% ink (4.5:1 on white), then hold the finished text for the rest of the cycle. The files
  status line shows only the page's words (`data-reading="Reading {n} of {total}"` on the root,
  in the page's language; without it only the line's number counts). A tile the panel cuts
  hides its name, never half a word. They stop off screen and hold still under
  reduced motion (no buttons then). Nothing moves because the page scrolled.
- **Cadence and hover** (house rule 5): one cycle of 2.5 to 4 s that repeats and restarts when the
  pointer or focus enters the card; every number is in `motion.md`, Loops inside a card's visual. A
  card whose fragments are all held plays its top fragment while the pointer stays. The card itself
  never moves by itself.
- **From the page**: `ui.restart(el)` restarts every fragment in `el` (a tab or panel shown
  again); a held one plays once. Every fragment root fires a bubbling `ui-cycle` event as each
  cycle starts, for a page that keeps a second piece in step.
- **The page's words, never the kit's**: a fragment's script shows only text from the markup. Its
  finished picture is the markup as written (the doc's note, the slider's value, the stat's number,
  the voice transcript and timer); its other states are written beside the text they change
  (`data-done`, `data-busy`, `data-note`, `data-msg`, `data-work`) or passed as opts. A count
  keeps its words and only its figure follows ("4 of 5 on" reads "3 of 5 on").

## Effects that are not backgrounds

- **The control drives the ground**: `slider` with `{"drive":{"param":"grain"}}` changes the
  panel effect as the thumb moves. Make it the group's loop. `{"compact":true}` keeps the name and
  the one slider, small enough for `.at-center` on a focal tile.
- **Data cut out of the UI**: `stat` with `{"window":true}` cuts its bars out, so the ground shows
  through them.
- **A number filled with an effect**: `.knock`, a still canvas under white text with
  `mix-blend-mode: darken` on dark (black text, `lighten`, on light); the card fill must be exactly
  `--card`.
- **A live object in the UI**: on a dark surface `voice` mounts `orb-sphere` as the call's orb, a
  pale nebula with specks of light (x.ai's voice orb); on a light surface it is a pearl drawn in
  CSS with clouds of the accent and the ink turning slowly inside it and a few specks of light, never
  a plain white disc. The accent is only the thin ring round it. Never a dark glass ball on a light card.
- **A real object, no photograph** (tech only): an object from `assets/objects` is the whole
  picture of a `.panel--top` on one of the lit palettes above, centred because it is the subject;
  how to mount, print and pause it is in `effects-objects.md`. It turns, never tilts the card.
- **A lit border** on the one featured object: `data-glow="edge-glow"` and
  `data-glow-params='{"fill":1,"wash":0,"speed":400,...}'` on the featured plan (never `data-fx`).
  It rests on a quiet accent hairline; on hover or keyboard focus one light runs round the edge
  (about 4.6 s, mounted for that lap only), then fades. Never on scroll or on view. The hairline is
  the plan's one accent, so its badge is quiet ink.

## Never

- A big fragment dead centre with even ground all round; a dialog alone on a ground.
- Three levels of boxes: a card, a patterned panel, a white card on it.
- A pattern (grid, ruling, contours, dots) behind a window or a list.
- A fade over the point of a fragment; a sliver of 1-23px at any edge.
- A dark ground behind dark UI on a dark page.
- The accent on every chip, date and keyword; brand colours mixed with ink marks; glossy 3D blobs.
- A loop over 5 s with no pause button; a spinner, caret or pulse running on in a still picture.
- A card or panel that moves with scroll or lights up when it scrolls into view.
- One WebGL context per panel, or a still ground left running its frame loop.
- A "sample", "example" or "to follow" note anywhere, even one line in the footer (in testing:
  "Names and figures on this page are examples" read as an apology), a caption under a visual
  that explains or apologises, and a placeholder (`[Name]`, `Example Street 1`, a `.example`
  address, lorem ipsum). Licence credits go in one footer line.
- Small grey card text (15px muted): card text is 16px in the ink.
