# The finish gate

Arm the build before writing the page. A framework can name its running local URL or a built HTML file with `--root dist`.

```sh
node <skill>/scripts/gate.mjs --start index.html --kind service --category "interior design" --primary "Book an introduction"
node <skill>/scripts/gate.mjs index.html
```

The gate checks 1440 and 390 px, with a 320 px overflow and controls probe. It runs consistency, layout, copy and motion checks, reads the last performance result, and records the findings in `.taste-skill/gate.json`. A stale performance failure asks for a new measurement.

## What the gate holds

- `deal-drift` reads the 2.5.4 `.taste-skill/plan.json` first. Build the dealt frame and mount the listed moments and scene. One moment can be the whole deal. An explicit replacement goes on the moments line as `new-id (re-dealt for old-id)`. Pages with an older plan use their history and plan comment. Compositions are suggestions for content. A different density warns.
- `brief-ask` reads the `Asks:` block in `.taste-skill/copy.md`. Write one `- ask -> #id` per line. Booking, order and sign-up targets need a field or button. A deferred ask uses `- ask -> none: reason` and prints the reason as a warning.
- `section-air` measures content to content. The minimum is 72 px on desktop and 56 px on a phone. `empty-band` catches continuous empty ground over 280 or 200 px respectively, and holes occupying a third of a section. Density scales the pixel limits. Six sections on one ground without a full-width picture fail `ground-flat`.
- Composed sections keep the same wrap, overflow, visibility, focus, contrast and reduced-motion checks. `own-count` warns below two composed sections on a page of six sections or more, or one on a shorter page. `still-wrong` reads the page without scripts and checks hidden content and counter targets. `own-timer` catches detectable automatic advances without a pause button.
- A picture may be a photograph, drawing, chart or live interface. Give a picture at most one `.fact-line` of up to 60 characters naming the work, place, size, year or price. Explaining the picture fails.
- A text moment can use a content h2 or closing heading. A peek hero can extend past the fold when at least 420 px of its window shows on desktop or 300 px on a phone. Keep the next section below the fold and the heading readable.
- A missing dealt moment fails `deal-drift`. A page without a moment receives a `moment-none` warning. The gate promotes `hero-enter` and `photo-repeat` warnings to failures. Broken resources, console errors, clipped content, missing controls and edited kit files still block.

## Finish a round

Fix the named element and run the gate again. `--quick` checks progress without spending a round. An unchanged page reuses its result. Edits to the copy notes or plan trigger a fresh check. A checker error is reported separately from a page failure.

Waive a false positive in `.taste-skill/waivers.json` with its exact check ID, target from the report and a specific reason. One entry covers every eligible finding matching its check and target. A passing round closes the build. The normal limit is three rounds. At the limit the gate keeps outstanding findings in its report. Use `--start --new` for a new build and `--done "reason"` to record an intentional stop.
