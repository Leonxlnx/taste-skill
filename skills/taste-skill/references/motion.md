# Motion

Almost everything is simply there. What moves is small, short and answers something the visitor did.

## What well-known sites do, measured

The probe sampled 39 outside pages and 12 pages built with the kit. Counts refer to those pages and the capture window. Distances include zero for fades. Medians use the pages where a measurement was available.

| Desktop observation | Outside pages | Earlier kit pages |
| --- | --- | --- |
| Elements changing on load, median | 1 | 7 |
| Area covered on the first screen, median | 31% | 49% |
| Entrance travel and duration, median | 10px in 336ms | 4px in 429ms |
| Sections with a heading, paragraph or media reveal, median | 0% | 100% |
| Sections with any moving entrant, including product UI, median | 33% | 100% |
| Travel of a reveal, median | 2px | 48px |
| Pages with three or more animated heading fragments on scroll | 0 of 39 | 12 of 12 |
| Pages clipping a photograph on scroll | 0 of 39 | 6 of 12 |
| Primary hover, most frequent response | Background colour | Background plus icon travel |
| Primary hover duration, median | 126ms in, 148ms out | 120ms in, 101ms out |
| Linked card lift and picture scale, median | 0px and 1 across 12 targets | 0px and 1 on one measured target |

## Build the plan

Load `assets/motion/motion.css` after the component styles and the module `motion.js` after `system.js`. Keep the starter’s early `m-enter` mark and safety timeout for an optional hero entrance. Without script or under reduced motion, all content is present.

- **Still** is dealt about half the time. Write `data-enter="still"` on the hero. Omitted, empty or retired values also stand still.
- **Fade** uses `data-enter="fade"`. The copy column and principal picture fade together in 300ms. Mark a custom column with `data-enter-copy` and its picture with `data-enter-media`.
- **Rise** uses `data-enter="rise"`. The same copy block rises 10px as it fades in 350ms. The picture only fades.
- **Reveals** are usually `none`. For the optional `fade` deal, mark one content block below the fold with `data-reveal="fade"`. Its whole composition fades once in 400ms as one third comes into view. Use a block small enough to reach that threshold. Leave individual headings, cards and photographs alone.
- **Moment and scene** are both `none` on a quiet page. Pass `--motion ask` when the brief asks for animation, scroll effects or “wow”. A requested, lively or loud page can receive one moment and occasionally a scene, when the content fits.

Only a loud hero may use `set-type` or `line-blocks`. A loud section may use the named `lines-rise` detail. Limit the treatment to its marked host.

## Controls and timing

Use `--m-ease: cubic-bezier(.4, 0, .2, 1)`. Buttons change background or border colour. A linked card changes its border, ground or title underline. Text links change colour or underline. The navigation chevron turns when its panel is expanded.

- Hover uses `--m-in` (130ms) and `--m-out` (150ms).
- Press scales the control to .98 over `--m-press` (100ms). Keyboard focus has a visible ring. Reduced motion keeps the control still.
- Tabs, accordion answers and menus use `--m-state` (180ms). Dialogs and sheets use `--m-sheet` (280ms).
- Entrances use `--m-fade` (300ms) or `--m-rise` (350ms). The section fade uses `--m-reveal` (400ms).

## Show the product working

Give a visitor an action with a visible result. In a section marked `data-own`, a button can show a count of completed steps with `data-m-count` or draw a chart path with `data-m-draw`. Write the complete number and path in HTML. For progress linked to the visitor’s scroll, put `data-m-progress` on the small indicator. It receives `--p` from 0 to 1, with a CSS fallback of 1. Keep prices and headings still.

A loop belongs inside the product window or media frame it explains. A loop lasting over five seconds has a pause button inside that frame’s corner. Keep each chapter’s text in normal flow. Only its small side picture can stick. Phones show the picture beside its own text in reading order.

## Never

Avoid rotating words, photo masks, automatic card staggers, hover lifts, zooms and moving arrows. Keep loops off backgrounds, headings and whole cards. Preserve native scrolling, keyboard controls and the finished reduced-motion state.
