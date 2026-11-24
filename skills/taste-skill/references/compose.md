# Compose a section

Read before the first page. A dealt composition arranges photographs with words. Everything else
on a page has a shape of its own, and the section takes that shape. This file is how.

## The method

1. **Say what the content is, as a thing.** Not "features" but "five steps, each with a duration
   and something the customer gets"; not "pricing" but "two plans that differ by one number". If
   one line cannot say it, the section holds two ideas: split it or cut one.
2. **Take the form that shape asks for** (the table below). The test: cover the heading. Can a
   visitor still tell what kind of information this is?
3. **Give it one dominant element.** One thing is clearly the largest: the chart, the first step,
   the total, the open tab's frame. Everything else is smaller by a clear step, about half, not a
   tenth. A section where everything has the same weight reads as a template.
4. **Place it on the twelve columns, uneven where that helps:** 7 and 5, 8 and 4, a narrow column
   of labels beside a wide one of content. Every edge sits on a column line or a `.wrap` line.
   One element may break the rhythm on purpose (a figure hanging in the margin, a picture crossing
   into the next ground), never several.
5. **Type is the first tool.** One display-size numeral or word for the thing that matters, the
   scale's steps for the rest, tabular numerals in every column of numbers, labels in the small
   size and the muted colour. Hairlines rule a list, space groups, and a ground is for the one
   thing that is a surface (a window, a ticket, a card). No decoration that carries no fact.
6. **Build it with the kit's tokens** and this client's content: real names, plausible numbers
   rounded as a person would write them, units. Changing one item preserves every other item’s selection.
   On a phone keep the chosen result in the same view as its control, with the picture directly under its picker.
7. **Check the phone first** (390): one column, the dominant element still dominant, controls 44
   px tall. Then read it without script, try touch and keyboard, then the desktop edges and air.

A section is right when it could only belong to this client: take the words away and its shape
still says what kind of business this is.

| Content | Form |
|---|---|
| Ordered steps with times or handoffs | Numbered rail, week strip or route |
| The product's timeline, diff, board or map | That view built large in HTML or SVG |
| Several uses of one product | One frame with tabs or a switcher |
| Plans priced by quantity | Slider or stepper above the plans |
| A price argument or two costs | Comparison bars or an itemised receipt |
| A range or spec | Scale with reference points, or spec rows beside a dimension drawing |
| Projects, rooms or goods with facts | Case rows or an index with a fact line per item |
| Two states | Toggle or divider |
| Hours or a schedule | Day bar or week grid |
| A stay or table to book | Booking bar on the hero, full form at the close |
| Goods sold here | Configurator or order pad within the first three sections |
| Photographs with words | A dealt composition (`sections-library.md`) |

## The section

```html
<section class="section own" id="process" data-own="process-rail">
  <div class="wrap"><h2>How installation works</h2><!-- steps in order --></div>
</section>
```

One `.wrap`, h2 first. Name `data-own` in one or two words. Put scoped rules in one `<style id="own-css">` in the head after the kit stylesheets, or link `own.css` there. Use the kit's fonts, type scale, palette, radii and `--s-1` through `--s-10`. One display numeral or word per page may leave the type scale.

Use any layout on the wrap lines and `.grid` where twelve columns help. Tabs, a two-state toggle, slider, stepper, accordion, switcher and copy button respond to click, tap and keyboard. Give a chart the same readout on hover and focus. One element may use `position: sticky` within a section at most 2.5 screens tall.

Use motion tokens for a working feed or a bar filling once. Anything timed needs a pause. Never auto-advance a carousel, hijack scrolling, tilt an element or position text absolutely over other text. Without script the still must be complete and correct.

Count hero and close. Compose at least two own sections from six sections up, one on shorter pages. No maximum. Keep the dealt nav, hero, close and footer.

General checks still cover edges, overflow, collisions, contrast, tap targets, headings, empty space, visibility and reduced motion.

## Idea seeds

Use seeds from `library/ideas.json` as prompts, never as parts to paste.

**Steps**

- `rail` A vertical line with numbered stops; each stop says what happens and what the customer gets; the line fills as the reader passes.
- `week-strip` The process on a strip of weeks or days as columns, each step a bar across the time it takes.
- `route` The steps as stops on a drawn route or transit line, stop names set like a line map.

**Offer**

- `receipt` The offer as a receipt: items, dotted leaders, a total, what is included ticked off under it.
- `meter` One slider or stepper for the quantity that sets the price; the plans answer it.
- `ladder` Plans as rungs growing left to right, each saying only what it adds to the one before.
- `menu-board` A list in two sizes like a board: categories in display type, items with leaders, one special set apart.

**Product**

- `core-view` The product's central view built large, with three callouts pinned to real parts of it.
- `switcher` One frame; three to five use cases as click tabs that change what the frame shows.
- `anatomy` The product in the middle, thin leader lines to labelled parts round it.
- `divider` Two states under one draggable divider, or side by side: before and after, with and without.
- `spec-sheet` A datasheet: a dimension drawing on one side, a ruled table with aligned units on the other.
- `scale` One measured range as a horizontal scale with reference points the reader knows.
- `console` A command or code panel beside the result it produces; steps advance on click.
- `stack` The layers of a product or service as stacked slabs, one line each, the top one lifted.

**Proof**

- `ledger` Figures in a ruled ledger with their sources as footnotes; one row set large.
- `bars` Two or three bars comparing with and without; the difference is the label.
- `big-figure` One figure from the brief set very large with its unit and one line of meaning.

**Work**

- `case-rows` Each project a wide row: picture one side, name and fact line the other, sides alternating.
- `index` A typographic index of every item (name, place, year); one picture changes with the row under the pointer or focus.
- `contact-sheet` Many small frames in a grid like a photographer's sheet, three of them enlarged.
- `key-tags` Rooms or goods as cards shaped like door signs or tags: number, size, price.
- `shelf` Goods standing on one drawn line, name and price under each; arrows move the shelf.

**Place**

- `day-bar` Opening hours as a bar of the day with the open stretches filled.
- `neighbourhood` A small drawn map: a few streets, water or a park, the place and two landmarks. No map tiles.
- `postcard` Address and hours set like the back of a postcard beside its picture side.
- `season-pair` Two seasons or two times of day as a toggle over one picture area.

**People**

- `roster` The people as a ruled list with roles and one line each; small equal portraits or initials.
- `flat-lay` The tools and materials of the trade laid out as a flat lay: real icons, swatches, samples.

**Story**

- `margin-facts` A reading column with facts pulled large into the margin.
- `year-axis` The history on a horizontal year axis; only dates the brief gives.

**Detail**

- `answer-index` Questions as an index on the left that stays; the answers scroll on the right.
- `glossary` Terms with short definitions in three columns.

**Gaming**

- `day-cycle` The game's world in one drawn frame whose light changes over four steps of a day.
- `card-set` Things of the game's world as a set of collectible cards with one stat line each.
- `notebook` Dated devlog posts as a notebook column, a picture with each.

**Booking**

- `booking-bar` Dates, guests and room in one row with a live total, docked under the hero.
- `configurator` Choices as chips (size, colour, set); the picture and the price follow.
- `order-pad` Items with steppers and a running total, like an order pad.

## Worked examples

`assets/own/index.html` and `assets/own/README.md` show how to adapt these to the client. Never ship example words or repeat its exact form on a page.

- `rail.html` · Deliverables by step
- `meter.html` · Seat count selects a price tier
- `core-view.html` · Jobs across teams on one clock
- `switcher.html` · Four room configurations
- `bars.html` · Packing times against one baseline
- `scale.html` · Range with familiar references
- `case-rows.html` · Book jackets and edition facts
- `index.fragment.html` · Archive entries linked to specimens
- `day-bar.html` · Weekly opening hours
- `booking-bar.html` · Stay priced by date and occupancy
- `configurator.html` · Choices update a product and price
- `receipt.html` · Item costs, total and inclusions

## Sub-skills

Read the indicated `sub` files.

| Name | Makes | When | File |
|---|---|---|---|
| illustrate | Product or world in one drawing style | Game without art, hardware or goods without a product photo, or a drawn subject | `subskills/illustrate/SKILL.md` |
| data-picture | Chart, scale or comparison | Software, tech or service with figures, a range, comparison or series | `subskills/data-picture/SKILL.md` |
| image-direction | Crops, scale and placement | Six or more photographs | `subskills/image-direction/SKILL.md` |
| brand-mark | Mark and favicon | No logo. Dealt mark remains available | `subskills/brand-mark/SKILL.md` |
| mascot | A recurring character | One in three eligible software, gaming or consumer product deals. Quiet trades by request | `subskills/mascot/SKILL.md` |
