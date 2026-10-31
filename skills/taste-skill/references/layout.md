# Layout

How the page is put together: margins, the grid, where text sits, how sections differ, navigation,
endings and the phone. The direction sheet gives the specific compositions; this file gives the habits
behind them, taken from the panel's notes on the 114 studied sites that scored 7.3 or higher (counts
below are hand tallies from those notes, so read them as "about").

## Contents

1. What strong pages do
2. Margins and the grid
3. Where text sits
4. Empty space
5. The frame: margins, balance and titles
6. Sections: carry the idea, vary the arrangement
7. Navigation
8. Endings
9. The phone is a second composition
10. How pages fail

## 1. What strong pages do

- **Tight margins, large things to both edges.** About 45 of 114 use outer margins of 32px or less;
  only about 8 use 80px or more. The centred 1100–1300px container is the minority among strong sites
  and the usual frame of the ones the panel called stock. Here the margins are dealt (section 0 of the
  sheet), and nothing runs into one edge alone (§5).
- **Text hangs from an off-centre line.** About 22 anchor text to one fixed line that is neither the
  centre nor the margin: a third across, 42%, the midpoint.
- **Two or three type sizes with nothing between** (about 30): one very large with one small, or
  everything small with the scale given to the image.
- **One thing per screen** (about 20): one statement, one object, one project.
- **Sections told apart by their ground.** About 20 change the whole background colour at each
  section; about 12 alternate light and dark; about 10 never change and separate by space alone.
- **Sections recomposed, not repeated.** About 14 rearrange every section; about 12 alternate a
  full-bleed image screen with a near-empty type screen.
- **The system broken once, on purpose** (about 14): one centred line on a split page, one paper card
  on a dark page, colour held back until the last screen.
- **Often no navigation bar** (about 45), and endings that are a designed scene rather than link
  columns.
- **Few words.** Median 575 on the whole study; some of the best carry under 200.

## 2. Margins and the grid

```css
:root {
  /* section 0 of the sheet prints the dealt pair; these are standard (16-20vh, 32-48px at 1440) */
  --margin: clamp(1.25rem, 3vw, 3rem);              /* airy clamp(1.5rem, 4.5vw, 4.5rem); open clamp(1.5rem, 4vw, 4rem) */
  --gutter: clamp(0.75rem, 1.4vw, 1.5rem);
  --section-gap: clamp(6rem, 9vh + 5vw, 11.25rem);  /* airy clamp(7rem, 12vh + 7vw, 15.75rem); open clamp(8rem, 14vh + 10vw, 20rem) */
}
.wrap { padding-inline: var(--margin); }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); }
/* half the gap above and below each section after the hero: the same space on one ground or across two,
   never a strip of page ground between two sections with their own grounds */
main > section:not(:first-child) { padding-block: calc(var(--section-gap) / 2); }
/* and half the gap under the hero's last content, or the first section sits too close (`section-air`) */
main > section:first-child { padding-bottom: calc(var(--section-gap) / 2); }
```

- One pair of margins and one grid for the whole page, as section 0 of the sheet deals them. Every
  left edge is a column line.
- Do not wrap the page in a `max-width: 1200px; margin: auto` container by reflex. Let large things
  (type, images, colour fields) run the full width, both edges at once, and constrain only the
  measure of running text (`max-width` in `ch` on the paragraph, not on the page).
- On very wide screens cap the layout at about 1760–1920px, or let type sized in `vw` stop growing with
  a `clamp()`.
- Directions that call for wide margins (uneven photographs, the quiet instrument) say so on the
  sheet; follow the sheet.
- Never draw the grid. Column lines, crosshairs and guides are banned ornaments here even though they
  are fashionable; the grid is felt through alignment.

## 3. Where text sits

- **Pick the anchor line and reuse it.** If the hero headline starts at column 5, the section
  headings, the pricing figure and the footer links start there too. Two or three anchor lines on a
  whole page; six means nothing was decided.
- **Off-centre beats centred.** A heading in the left third with its paragraph in the far-right
  column on the same baseline and nothing between; a headline in the bottom third under a deliberate
  void; text docked in corners with the middle given to the picture.
- **Opposite ends.** Two short texts at opposite ends of one baseline (name left, one-line description
  right) is the commonest alternative to the centred stack.
- **Centred is a decision.** When a strong page centres, it uses one axis with wide empty flanks and a
  single element per screen, not a centred stack of heading, paragraph and two buttons.
- **Rows for long copy:** heading in the left third, body in the right two-thirds, the same split for
  every row on the page.
- Stagger sparingly: a second line indented by a third so a two-line headline steps across the screen.
- **Nothing crosses a held word.** In a section that holds one large word while its text scrolls past
  (one verb at a time, a pinned title), the caption takes its own column or sits below the word's box,
  never on a path that crosses the word.
- **An edge falls between lines.** Where a picture's edge meets text (a paragraph interlocked with a
  full-bleed picture, a headline over a picture's top edge), the edge lands in a line gap, never through
  a line, and a paragraph sits wholly on a calm area of the picture at 4.5:1 or wholly off it. Half a
  paragraph on paper and half on sky reads as an accident.

## 4. Empty space

Empty space is placed, not left over. In the study of 97 Sites of the Day captured in October 2026,
readers judged every large empty area either a rest, which something closes, or a hole, which nothing
closes. Strong sites have plenty of rests. About half of them still leave at least one hole, and the
holes are what visitors name ("big random blank spaces").

**A void is placed when something closes it.** In the readers' notes the closer is, most often:

- the picture itself (sky, ground, the object, the film) with the type docked at its edge;
- a picture across the void: the photograph at the far side of an empty band, the full-width row
  rising under a statement, the opposite picture in a stagger;
- the type: a headline large enough to span the space, or two short texts at the two ends of one
  baseline;
- on a one-screen page, the wordmark, the navigation and one fact in the corners, like a mount around
  a print.

About one closer in five in the study is a hairline or grid line. That device is banned here; close the
void with the picture, the type, a step in ground tone or a field of flat colour.

**Where holes come from.** In order of frequency in the study:

1. A gap between sections stretched too far: bands of 250–760px of plain ground. (Here the dealt gap
   is 16-36vh; generous air between sections is wanted, a whole screen of nothing is not.)
2. Text in one half of a section and nothing in the other.
3. Content that arrives late: a reveal not yet fired, so the visitor scrolls onto bare ground while the
   words fade in.
4. A short block stretched to a full screen: a footer padded to the viewport height, a section title
   alone on a whole screen.
5. A pinned scene that holds almost nothing for several screens.
6. Pictures of different heights top-aligned in a row, leaving a hole under the short one.

**Rules**

- Decide where the void is and name what closes it. If nothing does, it is a hole: move the section's
  picture into it, make the main element bigger, or take the space out.
- Keep the void clean: no stray caption, no decorative shape, no faint watermark, no grid lines.
- **The hero fills the first screen alone** (`min-height: 100svh`, the navigation inside it): nothing
  of the next section, its heading, text, picture or ground, is in view on load at 1440 by 900 or 390
  by 844. In the owner's review the next section already showing in the first view was what made the
  pages read as cluttered.
- Sections sit 16vh or more apart at 1440, as section 0 deals it (16-20vh, 22-28vh or 30-36vh, about
  144-320px by a 900px screen), counted from the last line of one to the first line of the next (the
  median in the study is about 230–250px), and about 96-160px on a phone. A change of ground colour
  never shortens it. More than about 40% of a screen of plain ground between two sections is a hole.
- The gap between sections is clearly larger than any gap inside one. Related things sit close and
  unrelated things far; a heading has at least twice as much space above it as below.
- No stretch of the page taller than about half a screen holds nothing at all. In the study, runs of a
  screen or more with nothing in the page were almost always scroll distance for a pinned scene; the
  pinned stage must then hold something at every scroll position.
- Content is in place on the first paint. An entrance moves what is already there (see `motion.md`);
  it never leaves a screen of bare ground while the words arrive.
- Size a section to its content. `min-height: 100vh` belongs to a section that fills the screen, not
  to a footer or a lone heading.
- In a row of pictures of different heights, align the bottoms or put something under the short one,
  or crop the row to one ratio.
- A rest is one thing on a screen: a single line, one object, one picture or a field of colour. Once
  per page at most. A screen of nothing is never a rest, and the inspector fails two near-empty screens.
- When a section looks empty, the answer is almost never "add something". Make the main element
  bigger, or cut the section.

## 5. The frame: margins, balance and titles

The frame is what readers judge before any detail: "no good margin", "everything is shifted to one
side", "no clear title", "random unclear sections". The inspector measures each of these. The numbers
are from the study of 97 Sites of the Day (October 2026).

**One pair of equal margins.**

- The left and right margins are the same, at every width. On the studied sites with scrolling
  sections the two sides match to a few pixels: 16 and 16, 20 and 21, 32 and 32, 140 and 137. No
  strong page in the study was pushed to one side.
- The usual margin is tight: median about 28px at 1440, half the sites between about 18 and 45px, a
  few at 80px or more. Here it is the one section 0 deals (32-72px at 1440, 20-24px on a phone), and
  never under 16px at any width. About one award site in seven sets text 8–15px from the edge; that
  studio habit is excluded here.
- The navigation sits on the same margins as the content. The commonest small fault in the study is a
  header on one inset and the page on another (40px against 20px, or 34px on the left against 10px on
  the right).
- **Nothing runs into one edge.** A bleed spans both edges: a full-bleed picture, film or band runs
  to the left and the right edge together. Anything else (a product window, a picture, a strip, a row
  of cards, an object) keeps the margin on both sides at rest; a notes app's product window ran into
  the right edge while the left margin held, and the owner named it first (`edge-run`). A row of
  pictures fits the width inside the margins. A bleed never moves the margin.
- Asymmetry belongs inside the frame: an off-centre anchor line (a third across, 42%, the centre line)
  on symmetric margins.

**Use the width the page has set up.**

- In the study about one text section in a hundred leaves half the width empty. Text that sits in one
  half is common, in roughly one site in three, but the other half then holds the section's own
  picture (most often), a full-bleed picture behind the text, a second column, a list or a figure.
- When the text takes one side, put the picture, the second column, the list or the large number on
  the other. Never leave the other half to plain ground.
- The middle counts too: a card at the left edge and a lone button at the right with the middle third
  empty is the same hole.
- The first screen counts too. When the sentence and the button take the left third above a name
  docked at the foot, the upper right holds something (the picture or film, one fact, the action) or
  the name grows up to meet them; in testing, 60% of a first screen left as plain ground under the
  navigation read as a hole, and the inspector now warns when one empty block takes 28% of the first
  screen or more. In an inset-frame hero the column opposite the frame is closed by the name (spanning
  the column, or raised to meet the top) or by a second element; a lone sentence floating in it does
  not close it.
- A display line fitted to the width is fitted by measurement (a small script that sets its size from
  the content box, or SVG text with `textLength`), never by a size guessed for one face: a name that
  starts on the margin and runs a few pixels off the other edge reads as a mistake.
- A centred composition has one axis, equal flanks and one thing on it, not a stack of heading,
  paragraph and two buttons. On the first screen a centred headline and its line over a photograph
  card with round corners or a row of two or three cards, with or without the buttons, is the
  template every model builds whatever hero was dealt; the inspector fails it (`template-hero`). Build the dealt hero's geometry instead, its
  largest type the page's idea or the name.

**A title that says what this is, on the first screen.**

- Asked whether a stranger could say what the page is within five seconds, readers found that 40 of
  the 97 first screens say it in words, 42 say it only through pictures, small print or a bare name,
  and 15 do not say it at all. The last group lost usability and content points, not design points.
- Size alone does not do it: 66 of the 97 first screens carry a display-size line, but 26 of those are
  a name, a slogan or a place with nothing saying what is offered.
- The first screen has one `h1`, at display size (32px or more on desktop; on the clear first
  screens in the study mostly 50–150px), two lines at most, that says what this is: the name with
  what it does, the product with what it is for, the event with its date and place. If the `h1` is
  the name, the line under it, at 18px or more, says what the thing is.
- The `h1` stands whole on the first screen: its last line, descenders included, ends above the
  bottom edge with the page margin under it, at 1440 by 900 and 390 by 844 (`hero-cut`). A name the
  fold cut read as cut off. Its size is the hero blueprint's where that is well above the display
  step (`--step-hero`, references/type.md §2): the hero's geometry and its display size come before
  the type steps on the first screen.
- A split first screen (the words in one part, a picture holding the other half or more) has a large
  headline or a full-bleed picture: the `h1` beside the picture is about 5vw or more at 1440 (72px),
  on two lines of about 13-15 characters each; words that cannot be that large go over the picture,
  full-bleed, on its calm side. A 48px headline beside a half-screen photograph read as a shop
  template in a blind test ("an undersized headline and no focal point", §10).
- **On a software page the product stands beside the headline, never under it.** The `h1` at the
  size the sheet gives it on one side, the product's window on the other, level with the words and
  never starting below the headline's last line. A notes app with its product under the headline
  left the right half of the first screen empty and its judge called it generic. The sheet deals
  software only heroes that set it so, and not all of them halves: the window beside the words or
  before them, a screen at phone width beside wide words, three columns of words, window and facts,
  a window across a change of tone; and a software page seldom gets halves after one that had them.
- It is there on the first paint. About a third of the studied pages still showed a loader or nothing readable 4.5
  seconds.

**A heading on every section.**

- 82% of the text sections on the studied sites open with a heading: median 57px (40–96px for the
  middle half), about three and a half times the body size, one or two lines.
- Headings start on the outer margin or on the page's inner anchor line (in the study about a third
  each) and in the same place for every section. About a quarter of the headings in the study are
  centred; centre one moment per page here.
- Where a studied section has no heading, the usual stand-in is a small label: caps, mono or a number
  in brackets. All three are banned here. Put the label's words in a heading in the heading face at the
  section size ("The rooms", "How it works", "Prices"), set them on the anchor line, and let the first
  sentence carry the rest.
- A statement can open a section as its heading only when it names what the section holds.
- **One heading per idea.** A section names its subject once. No second heading that restates the
  first ("Four coffees on the shelf", then "Four coffees" over the picture), and no label printed over
  every step of a list or a held scene ("The roastery" above each of four statements): the section's
  heading names it as it arrives, and each step carries its own words. The inspector warns on both
  (`restated-heading`, `repeated-label`).

## 6. Sections: carry the idea, vary the arrangement

The most common failure in every score band is a distinctive first screen followed by stock blocks:
icon cards, a three-up row, an accordion, a link-column footer. About 25 of the studied sites lose
points this way, including several above 7.5.

- **The idea survives to the last pixel.** Ask of each section, pricing and FAQ included: what does
  the page's idea do here? If the page is a menu, the prices are menu lines. If the name is a
  monument, the hero carries it, never the footer. If the object's shape is the motif, the button and
  the image masks carry it.
- **Cards group what belongs together** (below): the plans, the rooms, the visit details, the
  features a visitor compares. Never a page of nothing but cards, never a card inside a card, never
  empty space inside one.
- **A section may be a pattern of the study.** The sheet deals each section from the blueprints of its
  role and from the section patterns of the design-anatomy study that stand in for that role (by their
  names and what they do: quotes for a testimonial, logos for proof, steps for how it works, a closing
  line for the call to action) and fit the page (its sector, tone, the air it wants, what it really
  has). One is marked as a pattern and its description is the spec. The page keeps its order of
  sections, its budgets (60 words a section, its share of the sheet's photograph total) and its
  closing rules, whichever is dealt; no section or pattern comes back on more than about one page in
  ten.
- **A section that pins is a scene.** A pinned stage, a sticky stage in a wrapper of several screens
  or a stretch held for so many screens counts with the page's scroll scenes: no more held stretches
  than the page takes scenes, none next to another, none on a page built without a scene. So does a
  hold written in words, the hero's too: a window that widens "over about one screen of scroll", a
  picture that grows as you scroll. The sheet deals one only where it fits and says so under it. A
  sticky heading or picture beside content that scrolls is not a pin, nor a move on native scroll as
  the section passes.
- **A gallery shows three photographs or more.** The photograph total keeps three for it before the
  hero takes its share, and no other section; a gallery whose three would take the page over its
  total is dealt as a smaller section. A section built from one picture and a text card, or a pair,
  is not dealt as a gallery. On a page with no photographs of its own, no gallery or showcase whose
  captions name a maker, a model or a price: only another business's products fit them.
- **The photograph total.** Section 5 of the sheet gives the photographs of the whole page and each
  part's share (the hero, the scenes, each section, the footer). A blueprint takes its share,
  whatever number it names; a section a scene carries is that scene and has no blueprint of its own.
- **No two neighbours share a layout.** Use the shape of each dealt blueprint (list, split, statement,
  full-bleed, mosaic, table, strip, pinned …). Count them in the screenshot; a shape used three times
  is the template showing. Three or more full-bleed picture screens in a row, each a picture with a
  strip of text, count as one shape used three times, whichever sections they belong to; so does a
  picture beside text, whichever side it is on. At least one section breaks the split grid: a
  full-bleed picture, a headline across the width, an 8/4 asymmetry (a cargo-bike page ran 50/50
  blocks all the way down and read as a stock theme).
- **Key content in the open.** On a one-page site the specs, the loads, the rooms, the plans and the
  menu stand on the page, readable without a click; tabs and accordions only for secondary detail
  such as the questions (a cargo-bike page hid two thirds of its specs behind tabs and four of its
  five loads in an accordion).
- **Rooms and products in two columns:** the photograph at 55% of the width or more beside one grouped
  block of the name, the facts and the price; never a small picture centred in wide margins with the
  name at one edge and the price at the other.
- **Take a blueprint's geometry, never its props.** A blueprint written for a café brings its
  opening-hours bar, its scalloped menu sheet and its visit card; on an architecture practice the list
  of buildings becomes a drawing register or a schedule, not a menu. Ask of every ornament whether it
  would appear on this trade's own site.
- **The work is shown whole.** A piece of work (a film, a building's drawing, a plan, a product) is
  seen whole and large at least once: it fits one screen with its caption (100svh less the caption),
  and the caption sits under or beside it, never across it (`imagery.md`, Text over pictures).
- **Tables and price lists.** Size columns to their content (`table-layout: auto`, or `fr` ratios from
  the content) and keep what is read together side by side (the time beside the price), never four
  equal columns with the price alone at the far edge. A table whose cells wrap at some width switches
  to its stacked layout at that width, not only below the phone breakpoint. In a stacked order form the
  running total sits above the primary action, or rides in the button ("Pre-order · €4,630").
- **Alternate dense and empty, image and type, light and dark** so the scroll has rhythm. A long page
  on one dark ground still gets one lit or tinted section (the price list, the booking card on the
  ink colour) as its planned exception; twenty screens of the same graphite read as one long screen.
- **A repeated module is for items of one kind** (a work index, a menu, a schedule, the plans, the
  rooms), as rows or in the dealt card style. Repeated round things of different kinds, it reads as a
  kit.
- **Break the system once.** After the page has established its rule, one planned exception (a single
  centred line, one inverted section, one image at a different scale) is what makes the rule visible.
- **Short pages are fine.** A quarter of the studied sites are one or two screens. Do not add sections
  to seem complete; each one must carry a claim (see `copy.md` §1).
- **Long pages have a budget.** The study's median page is 8.7 screens at 1440 with 575 words (the
  middle half up to 14.4 screens; `research.md`). Keep a page to about 8-12 screens, and to about 12-16
  with scroll scenes, which replace their sections' content rather than adding screens to it
  (`scenes.md` §7). Under about 45 words a screen the content is stretched (§10, "thin content
  stretched over many screens"): shorten the holds, merge the full-bleed screens that repeat one shape,
  or cut a section. In testing, pages of 26-28 screens lost on content and usability whatever their
  scenes did. On a portfolio the first piece of work at full size is on the first or second screen,
  before any statement, scene or photograph of the city (a motion designer's page opened on four
  screens of Rotterdam before her work). The work is pictures of the work, four to six pieces, each
  at its own ratio: never type cards in their place (another motion designer's page showed her work
  only as titles on cards). Without the client's own pictures, each piece gets a marked slot (sheet
  section 7) that the report lists.

### The chrome: what the best designs share

A blind test built 85 navigation, footer, card and button designs on five briefs, each as written,
and two jurors scored the stills. Five scored 7 of 10 or more from both: the navigation as the
product window's own toolbar, the week's opening hours drawn as bars, a closing footer that steps
like a stair, a set of cards fused into one capsule, buttons with a folded corner. None of the 48
designs dealt before reached 7, and 30 of them scored under 5 ("the plain template bar"). What the
five share, and what to build into any dealt design:

- **They carry the client's trade.** A writing tool's window and its marked page, a café's hours, a
  set of figures. The plain designs carry nothing of the client.
- **The idea shows at rest.** Each is a shape or a material a still shows: a capsule, a fold, a step,
  bars, views in a window. Ideas that live only in a hover scored 3 to 5.
- **They need no photograph.** They are made of type and fill. Designs that need what the brief
  lacks (its goods, hours, dates, portraits) were built on stand-ins and scored 2 to 5, so the deal
  gives them only to a brief that has those facts: the hours only from the brief's own (in any
  footer that prints them), the capsule's figures only from a brief that gives two or more, the
  toolbar only over a hero whose window starts at the top, the keyboard of links only with eight
  real destinations.
- **One clear shape a part, kept on the phone.** Designs that fell apart at 390 lost points, and
  trend shapes stopped short of the keepers: the floating pill at 4, the dock at the bottom and the
  tilted cards at 6. The deal keeps the ones at 6, and a page has one tilted thing at most.

The deal follows the scores: the five at full weight where their facts are real, four near misses
rewritten on the jurors' sentences at half, the old designs that scored under 5 at 0.3.

### Cards

The owner's reading of the round-10 pages: text floating with no card or container has no
hierarchy, and cards show what belongs together. The earlier ban on cards made every page a column
of loose text. Cards are wanted, varied, and kept to their job.

- **Where:** in two or three sections, on the groups a visitor compares or reads as one: the plans,
  the rooms, the dishes of a course, the visit details, the three things the product does, the
  people. The other sections stand on the ground, separated by space and size.
- **One style a page, dealt.** Section 0 of the sheet deals one of about fifteen: filled surface
  cards, picture-led cards, rows with a surface, horizontal cards, cards in the ink, one large panel,
  overlapping, staggered, cards that stack as you scroll, cards that open, poster cards, tall cards of
  words, one capsule cut into pieces, cards whose face is the product's own work, a dealt hand; or one
  of the card patterns of the design-anatomy study that holds words on a fill or under a picture (a
  round panel of title, text and button, a landscape photograph over a large title, a tall text
  panel …), never a media tile with no words, an icon card, an outlined one, a generative
  canvas in place of a picture, or a row whose next card peeks in at the screen edge. Build the one
  dealt, at its sizes; another page gets another. Cards that overlap or stack
  take the surface tone and the ink in turn, so each edge reads with no border, no shadow and no third
  tone (`colour.md` §4).
- **Filled, not outlined.** A card is a surface one tone step from the ground (or the ink), in the
  dealt corner, with 24-64px of padding. No border as its frame, no shadow at rest, no icon on top,
  no gradient. A hover steps its fill or moves it a few pixels, once.
- **Never a box in a box.** No card inside a card, a panel or a product window; no product window on
  a card; no framed picture inside a card (the picture runs to the card's edges); no card laid half
  or more over a photograph; the hero headline never in a card (`framed-elements`).
- **Never only boxes.** A page whose every section is cards, or a bento of tiles, is the kit again
  (`boxed-page`, `bento`).
- **Content first.** A card holds a name, one or two facts and a price or a link; no paragraph over
  about 25 words, no label that says nothing. Cards of one row share a height and a structure.
- **Filled top to foot.** A card, tile or panel is as tall as what it holds: never a name at the top
  and a line at the foot with the space between left empty, never a large tile holding one label.
  Built, those were hollow boxes, and a row of them a bento wall (a review of six frames). Cut a tall
  card shorter or set what it holds larger, never with more words; the deal no longer deals a card,
  tile or panel that leaves its middle empty, the section blueprints included.
- **On a phone** cards stack one to a row (or two narrow ones for a long list), full width inside
  the margins, never a sideways scroller.

### Buttons

- **One family a page.** Section 0 deals one button design. The family is its shape, fill, type and
  hover, and every button on the page takes them: the navigation's action, the hero, the sections,
  the cards, the forms and the footer. It keeps its dealt size in the hero, the sections and the
  footer; in the navigation, on a card and in a form it takes the height that part gives it
  (40-48px where it names none), so a 72px block becomes a 44px block of the same shape and fill in
  the bar. The second action is at most one
  quieter sibling: the label alone with the button's arrow, or the same shape in the surface tone. A
  hero, section or footer pattern that names a button of its own (a pill, a play disc, a 64px block,
  a split button) takes the dealt one in its place. A test page with three unrelated button shapes
  read as a kit (`button-family`).

## 7. Navigation

- **The dealt design.** Section 0 of the sheet deals one of thirteen navigation designs: a band that
  names the section in view, links split round a centred wordmark, an opaque floating capsule, a
  minimal wordmark with a Menu button, a bar that shrinks on scroll, a side index, a dock fixed at the
  bottom, four fixed corners, a masthead, a band in the ink, a contained bar, large links over the hero,
  the product window's own toolbar (only over a hero that shows the window beside the headline).
  Or, as often, one of the navigation patterns a design-anatomy study read off great sites (a split bar
  round a centred mark, a floating strip, a rail of tiles in the left margin, a compact panel at the
  top right, link clusters on the grid columns …), marked as a pattern and printed with its full
  description. A pattern scored 5 of 10 or more is three times as likely as a tested design, a 4 half
  as likely, up to three of the four parts (navigation, footer, cards, buttons), and the tested designs
  a blind test scored under 5 of 10 weigh less (§6, the chrome). Build the one dealt with its sizes and its
  behaviour, and check it against its **Must show** line, which names what a still at rest shows (a
  hover may follow it, never be all of it); no design or pattern is dealt on more than about one page
  in ten. The wordmark, three to five links, one
  action. Median link count in the study is 3.
- **It never hides on scroll.** No bar that slides away on the way down and comes back on the way
  up, and no navigation that scrolls away with the hero leaving nothing in its place: the owner found
  that plain hiding bar on nearly every page and named it as the generic one. Where the first
  screen's bar scrolls away, what the dealt design keeps fixed (the wordmark and the action in their
  corners, a Menu tab, a dock) is there at once. The inspector reads the built form at load, past the
  hero and on a scroll back up, and fails a bar that hides or a form other than the one dealt
  (`nav-not-as-dealt`).
- **Nothing above it, no sentence in it.** No announcement, information or language strip over the
  bar (the owner: not modern); every link one or two words, never a sentence or a tagline (a
  manuscript tool set a sentence in its bar and the page read as chaos).
- If it stays fixed, it must never sit on top of content: it carries an opaque ground (never glass,
  never translucent), and every held heading keeps clear of it. Check every scroll position in the
  screenshots, especially on the phone; floating bars are where the panel most often recorded a nav
  covering text.
- **On a long page it stays in reach.** Past about ten screens at 1440 (a page with scroll scenes
  always is), the navigation, or at least the one action, can be reached from every screen, the way
  the dealt design says (it stays fixed, it shrinks, or the wordmark and the action keep their
  corners). A hero that animates its bar away hands it on to that navigation. In
  testing, three long pages kept their navigation only inside the hero, leaving the booking twenty
  screens away with no way back, and the blind judges named it on all three. Scenes that can keep
  their type clear of a fixed bar take its selector as an option (`scenes.md` §4).
- **Links land on what they name.** "Buildings" goes to the buildings, not to a scene that introduces
  them; a link into a held scene points at the section that holds the content it names.
- On a phone: wordmark and one action in view; the links go in a simple full-screen sheet opened by a
  text button ("Menu"), or move to the footer when there are only three. The open sheet carries the
  page's one action and the email address too, so opening the menu never hides the way to act.
- Navigation is small furniture, however it is drawn. On desktop it takes no more than about a tenth
  of the first screen; on a phone it is one row. A blueprint that builds the navigation as a column of
  colour blocks or a stack of tabs gets that treatment on desktop only, and collapses to one row on
  the phone so the headline, the supporting sentence and the action stay in the first screen. In
  blind tests a nav that ate the hero cost a whole point of usability.

## 8. Endings

- The page ends on a closing line at display size (the action as a statement) and the facts a visitor
  needs at text size: the email at the h3 step at most, with a Copy button and a mailto link, the
  address, the hours. Never the email or the name set across the width: none of the 65 professional
  sites does it, and it lost a round-4 page points.
- **The footer is a designed section, never a single line.** Section 0 deals one of about fifteen
  designs (a closing line over columns, a big contact block, a sitemap grid, a picture footer, a
  newsletter card, large links, three cards, two halves, the hours and the place, a closing statement
  over one row, link columns for a site with more pages, a picture beside the facts, the week's hours
  drawn as bars, a closing stair of two colours, a keyboard of links), or one of the
  study's footer patterns (a closing headline beside a link grid, a mark beside link columns, link
  columns with a sign-up …), never one of the study's one-line, no-footer or nearly empty endings,
  nor a bento grid or a band over a shader. It stands on its own ground (the surface tone or the ink; the closing stair on the palette's band in the accent where it has one), at least 40% of a screen tall at 1440, with the links,
  the contact, the legal links and the Image credits link at text sizes. The owner found the footers
  of the recent pages ignored, one line each. Build the dealt one as dealt, every part and size of
  it: a dealt three-card footer built as one credit line fails (`footer-not-as-dealt`). Link columns only for real pages beyond this one; never
  a list the page already shows as content. Every link goes to this page, the client's own pages or
  the client's own accounts, never to another company's product: a product page whose footer sent six
  of ten links to other companies' apps read as their advert. Style every list: no browser bullets in a footer or a
  nav.
- The last section carries a closing line at display size (the action as a statement, or the name),
  never a label-sized heading: its title is at least the size of the other section headings. No card
  over the closing photograph: its words sit on its calm part, or the card stands beside it on the
  ground. A page ends once: when the dealt footer opens on its own closing line (or on a statement
  at the display step, with a button or without), that line is the call to action and no cta
  section stands before it; after a closing scene the footer has no closing line of its own.
- A closing line in the footer is 6vw at most (`giant-footer` fails 7vw), two lines at most, on the
  same screen as its button and the footer's links (`lone-heading`). The footer is as tall as its
  content and never a held stage: no line of it holds or reveals word by word while the scroll runs
  (`held-dead-screen`, `line-holds`). A closing headline 160-200vh tall tripped all four checks.
- Put the practical facts (address, hours, email, legal line) in the text face at a readable size, on
  the same anchor lines as the rest of the page.

## 9. The phone is a second composition

Design the 390px screen as its own page, not the desktop page squeezed. Strong sites that neglect this
lose usability points; weak ones are often just broken.

- Each blueprint on the sheet has its own phone paragraph. Build it.
- Keep one dominant thing on the first screen. A wordmark that was 20vw wide on desktop might stack on
  two lines at 26vw on the phone and be even stronger.
- Re-author line breaks; re-crop images to portrait (`object-position` per breakpoint, or a different
  crop size in the image URL); keep unevenness with alternating widths rather than making everything
  full width.
- Margins as dealt, 20-24px (16px at the least). Body text 16–18px. Touch targets at least 44px high.
- The hero fills the phone's first screen alone too (`100svh`), the headline, the sentence and the
  action in it.
- **Nothing is clipped on the phone.** Below 600px a list laid over a picture (the coffees over a
  full-bleed panel, the facts over a room) drops into the normal flow under the picture, and no box
  with a fixed height or `overflow: hidden` cuts the words it holds. A coffee panel that showed two of
  its four coffees on a phone was marked broken; the inspector fails it (`clipped-text`).
- Check 390px in the inspector's screenshots for every round: sideways scroll and three-line headlines
  usually appear here first.

## 10. How pages fail

From the panel's notes on the 54 sites scoring under 6.8 (counts out of 54):

- The whole page is the category's stock template; swap the logo and it could be any competitor
  (about 20).
- Centred headline, pill badge, two buttons, screenshot or tile grid below (about 9).
- A distinctive hero, then stock modules in the usual order (about 8, and about 17 more in the middle
  band).
- A default typeface with no character (about 13).
- Text too small or too low in contrast (about 13); legibility lost over busy photographs (about 9).
- An undersized headline and no focal point (about 9).
- The page never says what the thing is, or shows no work (about 12 and 7).
- Thin content stretched over many screens, or a single gag (about 11).
- Gates, preloaders and entry pop-ups before any content (about 9).
- A phone layout that is the desktop shrunk, or broken (about 8).
- Fixed elements sitting on content; careless details such as colliding lines (about 7 and 5).

And the faults of the best sites, which are not to be copied: body text at 9–13px (about 24 of the 90
sites at 7.5 or more), information hidden behind the concept (about 20), the idea running out
mid-page (about 15), text over footage with no scrim (about 12), gates and blank first paints (about
12), floating elements colliding with content (about 11), and a first screen with no statement of what
this is and no action (about 9). Say what the thing is, and offer the action, on the first screen.
