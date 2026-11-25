# Compose a section

Write `shows  <subject> | <source>` on each section line, or `shows  nothing` for a text-only section. Show what a heading describes beside or below it. Use `illustrate` for a drawing or `data-picture` for supplied numbers. Keep text-only sections to one quarter of a quiet plan and picture-free desktop screens to one in four.

Print the answer first. Add a control when changing an input gives a materially different result supported by the brief. One price or one threshold reads as text. Carry a real selection into its form with `data-choice`.

## The method

1. **Say what the content is, as a thing.** Not "features" but "five steps, each with a duration
   and something the customer gets"; not "pricing" but "two plans that differ by one number". If
   one line cannot say it, the section holds two ideas: split it or cut one.
2. **Take the form that shape asks for** (the table below). The test: cover the heading. Can a
   visitor still tell what kind of information this is?
3. **Give it one dominant element.** One thing is clearly the largest: the chart, the first step,
   the total, the open tab's frame. Everything else is smaller by a clear step, about half, not a
   tenth. A section where everything has the same weight reads as a template.
4. **Keep pairs together.** Use an uneven grid only where the content needs it. Short definition lists use `.facts--compact` (42rem maximum). Put the caption in its own figure and keep menu name and price on one row in a column sized for both.
5. **Type is the first tool.** One display-size numeral or word for the thing that matters, the
   scale's steps for the rest, tabular numerals in every column of numbers, labels in the small
   size and the muted colour. Space separates list entries, hairlines define tables, and a ground is for the one
   thing that is a surface (a window, a ticket, a card). No decoration that carries no fact.
6. **Build it with the kit's tokens** and this client's content: real names, plausible numbers
   rounded as a person would write them, units. Changing one item preserves every other item’s selection.
   On a phone keep the chosen result in the same view as its control, with the picture directly under its picker.
7. **Check the phone first** (390): one column, the dominant element still dominant, controls 44
   px tall. Then read it without script, try touch and keyboard, then the desktop edges and air.

A section is right when it could only belong to this client: take the words away and its shape
still says what kind of business this is.

## The page is a sequence

A section's form comes from its content; its place comes from the story (`story.md`). Read the h2s
alone, in order: they should make sense as a paragraph. A picture that comes back shows its subject
in a new state; the same picture twice says nothing new. One thing travels through the page (a named
record, a sum, a booking, a character), with the same identity and a legible change each time.

| Content | Form |
|---|---|
| Ordered steps with times or handoffs | Use order only for dependent steps with a distinct result each |
| The product's timeline, diff, board or map | That view built large in HTML or SVG |
| Several uses of one product | One frame with tabs or a switcher |
| Plans priced by quantity | Print supported prices. A meter requires several supplied rates and `--carry figures` |
| A price argument or two costs | Comparison bars or an itemised receipt |
| A range or spec | Scale with reference points, or spec rows beside a dimension drawing |
| Projects, rooms or goods with facts | Case rows or an index with a fact line per item |
| Two states | Toggle or divider |
| Hours or a schedule | Print identical days together. Use a day bar only for differences |
| A dated stay, table or class | Booking bar on the hero, full form at the close |
| Items sold or served | A captioned row of their pictures |
| Goods sold here | Configurator or order pad within the first three sections |
| Photographs with words | A dealt composition (`sections-library.md`) |

A section about goods, dishes or rooms shows them. Spend the available photographs in rows so the visitor can see the range.

- Show independent choices together, with the selected language, environment or plan’s content visible. Show dependent steps in reading order. Only a small side picture may stick.
- Place a fact, unit, source or link 16–32px from its picture or table at 1440 and 12–20px on a phone, closer than the next heading.
- One standalone statement of twelve words or fewer may break into two or three lines starting on different column lines.
- Related sections may share the page ground.

## The section

```html
<section class="section own" id="process" data-own="process-rail">
  <div class="wrap"><h2>How installation works</h2><!-- steps in order --></div>
</section>
```

One `.wrap`, h2 first. Name `data-own` in one or two words. Put scoped rules in one `<style id="own-css">` in the head after the kit stylesheets, or link `own.css` there. Use the kit's fonts, type scale, palette, radii and `--s-1` through `--s-10`. One display numeral or word per page may leave the type scale.

Use any layout on the wrap lines and `.grid` where twelve columns help. Tabs, a two-state toggle, slider, stepper, accordion, switcher and copy button respond to click, tap and keyboard. Give a chart the same readout on hover and focus. One element may use `position: sticky` within a section at most 2.5 screens tall.

Show the result when someone uses the feed or changes a value. Keep a loop inside its product or media frame, with a pause control in the corner when it runs over five seconds. Never auto-advance a carousel, hijack scrolling, tilt an element or position text absolutely over other text. Without script the still must be complete and correct.

On a lively or loud page (`expressive.md`) the world's own forms join the table: a log as a field document, items as collectibles, a character's line in a dialogue box, art crossing a ground edge. Each names its source in the plan.

Count hero and close. Compose at least two own sections from six sections up, one on shorter pages. No maximum. Keep the dealt nav, hero, close and footer.

General checks still cover edges, overflow, collisions, contrast, tap targets, headings, empty space, visibility and reduced motion.

## Idea seeds

Use seeds from `library/ideas.json` as prompts, never as parts to paste.

**Steps**

- `rail` A vertical line with numbered stops; each stop says what happens and what the customer gets; the line connects the stops.
- `week-strip` The process on a strip of weeks or days as columns, each step a bar across the time it takes.
- `route` The steps as stops on a drawn route or transit line, stop names set like a line map.

**Offer**

- `menu-tabs` Use the menu categories as the heading, the open one in ink and the others muted. Without script all categories show in order.
- `receipt` The offer as a receipt: items, dotted leaders, a total, what is included ticked off under it.
- `meter` Only with several prices supported by the brief and `--carry figures`.
- `ladder` Plans as rungs growing left to right, each saying only what it adds to the one before.
- `menu-board` A list in two sizes like a board: categories in display type, items with leaders, one special set apart.

**Product**

- `record-handoff` Show one identifiable record at its source and destination with the changed field legible in both.
- `setup-by-environment` Choose a supported environment and see its first working instruction, expected result and next action in the same panel.
- `core-view` The product's central view built large, with three callouts pinned to real parts of it.
- `switcher` One frame; three to five use cases as click tabs that change what the frame shows.
- `anatomy` The product in the middle, thin leader lines to labelled parts round it.
- `divider` Two states under one draggable divider, or side by side: before and after, with and without.
- `spec-sheet` A datasheet: a dimension drawing on one side, a ruled table with aligned units on the other.
- `scale` One measured range as a horizontal scale with reference points the reader knows.
- `console` A command or code panel beside the result it produces; steps advance on click.
- `stack` The layers of a product or service as stacked slabs, one line each, the top one lifted.

**Proof**

- `test-record` Place a documented reading beside its object, unit, conditions and source.
- `ledger` Figures in a ruled ledger with their sources as footnotes; one row set large.
- `bars` Two or three bars comparing with and without; the difference is the label.
- `big-figure` One figure from the brief set very large with its unit and one line of meaning.

**Work**

- `intro-rail` Put a heading, two lines and one button in a narrow column beside three or four item cards. Repeat with the column on the same side for the next category.
- `case-rows` Each project a wide row: picture one side, name and fact line the other, sides alternating.
- `index` A typographic index of every item (name, place, year); one picture changes with the row under the pointer or focus.
- `contact-sheet` Many small frames in a grid like a photographer's sheet, three of them enlarged.
- `key-tags` Rooms or goods as cards shaped like door signs or tags: number, size, price.
- `shelf` Goods standing on one drawn line, name and price under each; arrows move the shelf.

**Place**

- `edge-split` Keep words on five wrap columns and take the photograph from the next column to the screen edge. Alternate sides on a repeat.
- `colour-half` Set a heading, short list and action on one brand-colour half with a photograph filling the other. Use the secondary ground only where the ground deal puts it.
- `shopfronts` Show each front in a portrait photograph with the street and one fact underneath.
- `day-bar` Opening hours as a bar of the day with the open stretches filled.
- `neighbourhood` A small drawn map: a few streets, water or a park, the place and two landmarks. No map tiles.
- `postcard` Address and hours set like the back of a postcard beside its picture side.
- `season-pair` Two seasons or two times of day as a toggle over one picture area.

**People**

- `roster` The people as a ruled list with roles and one line each; small equal portraits or initials.
- `flat-lay` The tools and materials of the trade laid out as a flat lay: real icons, swatches, samples.

**Story**

- `name-foot` When the PLAN deals a large wordmark, the client’s name may span the footer.
- `story-line` Set the origin in one sentence at 40–56px with two or three little photographs in the line at text height.
- `archive-prints` Place four to six dated photographs on an offset grid around a short paragraph. Give each a white border and its year and keep the prints straight.
- `release-documents` Give each release its date, one line on what changed and aligned links to its real files.
- `margin-facts` A reading column with facts pulled large into the margin.
- `year-axis` The history on a horizontal year axis; only dates the brief gives.

**Detail**

- `pantry-tiles` Show ingredients, materials or origins on square brand-ground tiles with one single-colour drawing and a name each.
- `answer-index` Questions as an index on the left that stays; the answers scroll on the right.
- `glossary` Terms with short definitions in three columns.

**Gaming**

- `day-cycle` The game's world in one drawn frame whose light changes over four steps of a day.
- `card-set` Things of the game's world as a set of collectible cards with one stat line each.
- `notebook` Dated devlog posts as a notebook column, a picture with each.

**Booking**

- `booking-bar` Show date and party for real inventory; include a selector only if it changes an available choice.
- `configurator` Choices as chips (size, colour, set); the picture and the price follow.
- `order-pad` Items with steppers and a running total, like an order pad.
- `enquiry-preview` The enquiry fields beside a concrete view of what is being requested; on a phone the submit stays with its fields.

**More, by shape** (each line in full in `library/ideas.json`)

- Steps: `stage-sequence` (adjacent stages on one wide view, unrolled in order on a phone).
- Offer: `availability-list` (formats and destinations under the title they serve).
- Product: `device-handoff` (install links by device, a scan code beside each).
- Proof: `activity-strip` (one operating record in a narrow band), `quote-columns` (accounts with speaker and source under each), `quote-and-measure` (an account beside a sourced measure).
- Work: `edition-archive` (covers or spines with a dated title list).
- Story: `signed-letter` (a first-person account ending at a name and role), `chapter-contents` (named destinations grouped by subject).
- Detail: `directory-foot` (destinations under headings, then locale and policy), `site-notice` (one dated change above the menu), `claim-notes` (numbered conditions with return links).

## Worked examples

`assets/own/index.html` and `assets/own/README.md` show how to adapt these to the client. Never ship example words or repeat its exact form on a page.

Galleries: `index.html`, `gallery-own-a.html`, `gallery-own-b.html`.

**Steps, states and chapters**

- `rail.html` · Deliverables by step
- `states.html` · One record through four states, the same id in each
- `chapter-stage.html` · A physical change in three stages, one drawing
- `chapter-links.html` · Guide chapters with a printable reference sheet
- `margin-track.html` · Chapters on a gutter line, use before machine
- `day-bar.html` · Weekly opening hours

**Prices, plans and orders**

- `meter.html` · Seat count selects a price tier
- `billing-matrix.html` · Plans billed monthly or yearly, real bills
- `fee-comparison.html` · Two tariffs compared at the reader's quantity
- `receipt.html` · Item costs, total and inclusions
- `booking-bar.html` · Stay priced by date and occupancy
- `configurator.html` · Choices update a product and price
- `edition-outlets.html` · Editions by platform, gaps explained

**The product at work**

- `core-view.html` · Jobs across teams on one clock
- `switcher.html` · Four room configurations
- `system-paths.html` · Inputs, one decision, two destinations
- `annotated-source.html` · Lines of code with lettered notes
- `environment-setup.html` · One first task in three runtimes
- `connector-finder.html` · Integrations found by name or type
- `model-matrix.html` · Models compared on shared properties
- `coverage-map.html` · Stops on a drawn route with their times

**Proof and figures**

- `bars.html` · Packing times against one baseline
- `scale.html` · Range with familiar references
- `source-ledger.html` · Figures with their counting rules
- `evidence-grid.html` · Several proofs before an approval
- `witness-selector.html` · Named accounts from the brief, each with its thing

**Work, cases and people**

- `case-rows.html` · Book jackets and edition facts
- `index.fragment.html` · Archive entries linked to specimens
- `case-foldout.html` · Cases with a measured result and a job sheet
- `field-roster.html` · People and their actions, before and after
- `media-desk.html` · A press kit in several formats

**Words, news and answers**

- `letter.html` · A signed letter with the practical facts beside it
- `release-register.html` · Dated releases and their files
- `lead-digest.html` · One lead report and shorter dispatches
- `answer-finder.html` · Answers by topic, searchable

## Sub-skills

Read the indicated `sub` files.

| Name | Makes | When | File |
|---|---|---|---|
| illustrate | Product or world in one drawing style | Game without art, hardware or goods without a product photo, or a drawn subject | `subskills/illustrate/SKILL.md` |
| data-picture | Chart, scale or comparison | Software, tech or service with figures, a range, comparison or series | `subskills/data-picture/SKILL.md` |
| image-direction | Crops, scale and placement | Six or more photographs | `subskills/image-direction/SKILL.md` |
| brand-mark | Mark and favicon | No logo. Dealt mark remains available | `subskills/brand-mark/SKILL.md` |
| mascot | A recurring character | One in three eligible software, gaming or consumer product deals. Quiet trades by request | `subskills/mascot/SKILL.md` |
