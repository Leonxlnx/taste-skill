# Type

Typography is most of what a visitor sees and most of what makes a page look designed or assembled.
The direction sheet deals you a type system (faces, weights, settings). This file is how to use it.

## Contents

1. What the study measured
2. The scale: few sizes, far apart
3. Setting display type
4. Setting text
5. Loading the fonts properly
6. One family or two
7. Details that separate set type from typed text
8. Mistakes the inspector cannot see

## 1. What the study measured

From 202 measurable sites out of the 247 studied (Chrome, 1440×900 and 390×844):

| | Median | Middle half | Note |
| --- | --- | --- | --- |
| Hero headline size | 72px (5.0vw) | 43–109px | Top-scored sites: 6.0vw median |
| Largest type on the page | 6.4vw | up to 10.4vw | Top-scored sites 8.4vw, weak sites 5.0vw |
| Hero headline on a phone | 40px | 32–59px | |
| Hero tracking | -0.01em | -0.03 to 0 | Tighter as size grows |
| Hero leading | 1.0 | 0.95–1.1 | |
| Body size | 16px | 14–18px | |
| Headline ÷ body size | 4.3 | | Top-scored sites 4.7 |
| Typefaces in real use | 2 | 31% use one, 45% two, 22% three | |
| Hero weight | regular 48%, medium 18%, bold or heavier 22% | | Big type does not need to be bold |
| Hero in capitals | 24% | | |
| Hero centred | 39% | | 52% on the weak sites |

Two things to take from it. First, size contrast is a lever, and award sites pull it hard for one
moment. Second, weight is not: half of the heroes are set in a regular weight. Scale and spacing make
type confident; bold is one option among several.

The October 2026 comparison adds the other side. On 65 professional sites (technology companies and
good shops) the largest type is about 3.8vw (middle half 2.5-4.5vw, about 55px at 1440) and body text
14-16px; the 30 pages built with the previous version of this skill set their largest type at 14vw and
body text at 17-19px, and read as shouting. So the sheet now deals the display size per page: most pages
get a confident professional size, and a giant headline is a dealt event, never a habit: it comes only
with a hero blueprint built on it (a name across the width, one word filling the lower half), printed
as `--step-hero` (§2) for the `h1` alone, while every other heading keeps its step.

## 2. The scale: the six dealt steps

The sheet deals the scale with the faces: a ratio (1.2 to 1.6), a body size (16-18px) and a display
size, as six steps: `--step-small`, `--step-body`, `--step-lead`, `--step-sub`, `--step-head` and
`--step-display`. They are the whole scale. Every size a blueprint names maps onto the nearest step;
nothing in between. The common failure is nine sizes that are all near each other (16, 18, 20, 24, 28,
32...), which reads as mush; the inspector warns past seven.

- `--step-display` is the hero headline's size, dealt for this page (usually 3.5-6vw at 1440). A
  section blueprint that names another size is overruled by the sheet. A hero blueprint that sets its
  headline well above the step (a 120px title, a name about 430px tall) is not: on the first screen
  the hero's geometry and its display size come before the type steps. The sheet prints that size as
  `--step-hero`: the blueprint's size at 1440 (letters given as a height are about 0.72 of the size),
  held to what two lines (or one) fit under the bar, the step's own floor on a phone. Only the `h1`
  takes it, in the dealt display face and weight. Two pages built such a hero at the 72-84px step and
  read as timid.
- The hero headline stays two lines at most, every word whole between the margins, and its last
  line, descenders included, ends above the first screen's bottom edge with the page margin under it
  (`hero-cut`). A name the fold cut read as cut off.
- `--step-head` is every section heading; `--step-sub` a subheading or a large figure; `--step-lead`
  the supporting line under a headline; `--step-small` legal lines and table notes only, never 12px.
- Keep the gap: the display size is about three times the body size or more on desktop; a headline
  that is only a little larger than the section headings reads as a section heading.
- Resist a "subheading" size for every card and label. If two sizes look almost the same, make them
  the same.

## 3. Setting display type

Large type exposes spacing that is invisible at text size. Apply all of these to anything over 40px:

```css
.display {
  font-size: var(--step-display);
  line-height: 0.95;              /* 0.85–1.05; tighter for capitals and condensed faces */
  letter-spacing: -0.035em;       /* -0.02 to -0.05em; use the value on the direction sheet */
  font-kerning: normal;
  text-wrap: balance;
  max-width: 14ch;                /* choose the measure so lines break where you want */
  margin: 0;
}
```

- **Tracking scales with size.** The larger the type, the tighter it needs to be; a value right for
  120px will choke 32px. Set tracking per step, not once for all headings.
- **Leading below 1.0 needs checking.** Look for collisions between descenders and the ascenders or
  accents of the next line. Two-line headlines make this easy to verify by eye.
- **Two lines are one block.** A name or headline set on two lines keeps them tight: line-height
  0.9–1.0, no margin, padding or gap between the lines, and the weight the sheet deals for the display
  step, stepped up to the face's 400 or next weight where that is 300 or lighter. Never a lighter cut to
  make a large size look elegant: a café's thin two-line name with a gap between its lines read as two
  stray words, and as a bug, in a blind test.
- **All capitals** want slightly open tracking (0 to +0.03em) even at display size, and leading around
  0.9.
- **Optical alignment.** Big letters with round or diagonal left edges (O, C, A, T, W) look indented.
  Pull the headline left by about 0.04–0.06em (`margin-left: -0.05em`) so it aligns optically with the
  text beneath it.
- **Viewport-wide type.** For a line that must span the screen, size it in `vw` and verify at 390 and
  1440; set `white-space: nowrap` and let the container clip rather than wrap. Calculate the size from
  the character count: `font-size ≈ container width ÷ (characters × k)` with k from `copy.md` §2.
- Never add a text shadow, an outline stroke, or a gradient fill to display type.

## 4. Setting text

```css
body { font-size: var(--step-body); line-height: 1.5; font-kerning: normal; text-rendering: optimizeLegibility; }
p { max-width: 62ch; text-wrap: pretty; margin: 0; }
p + p { margin-top: 0.9em; }
.lead { font-size: var(--step-lead); line-height: 1.35; max-width: 40ch; }
small, .caption { font-size: var(--step-small); line-height: 1.45; }
```

- Measure: 45–75 characters. Wider than that and the eye loses the next line; the inspector warns
  past about 88.
- Leading: 1.45–1.6 for body, tighter (1.3–1.4) for the larger lead size, looser for long reading.
- Secondary text is the same face in a softer ink (`--muted`), not a lighter weight and not smaller
  than 13px.
- Do not centre paragraphs longer than three lines. Do not justify.
- Light text on a dark ground looks heavier: drop one weight step or add 0.01em tracking, and raise
  leading slightly.

## 5. Loading the fonts properly

The sheet gives a `<link>` tag. Use it exactly; do not swap in a face you prefer.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="…from the direction sheet…" rel="stylesheet">
```

```css
:root {
  --font-display: "Family From Sheet", "Helvetica Neue", Arial, sans-serif;
  --font-text: "Family From Sheet", Georgia, serif;
}
```

- Request only the weights you use (usually two or three in total).
- Always give a fallback stack of the same broad kind (sans for sans, serif for serif).
- In a framework, use its font loader with the same family and weights (`next/font/google`, or a
  self-hosted `@font-face` with `font-display: swap`). Fontshare faces load from the
  `api.fontshare.com` stylesheet on the sheet.
- After building, `inspect.mjs` reports the families that actually rendered. If it warns that a face
  did not load, the screenshots show a fallback and nothing you judge from them is real. Fix the link
  first.

## 6. One family or two

A third of the studied sites use a single family for everything, and it is the safest way to look
coherent. When the dealt system has two faces:

- Give each a job and never swap them: one sets headlines, the other sets everything else.
- Do not introduce a third face for labels, numbers or quotes.
- Do not mix two faces inside one headline.
- Italic is for titles of works and real emphasis inside paragraphs, never as decoration.

**The type note.** Under the type system the sheet may print a type note: how a site of the
design-anatomy study set type of the same kind as the dealt pairing (one family or two, serif or sans
on each side, condensed, wide or rounded as dealt, capitals only where the system sets them). Take
from it how the steps relate (how far they jump, where the big jump falls, which steps carry the page)
and its leading, tracking and case where the system allows them. The dealt faces, weights and six
steps stand: map its sizes onto the steps, nothing under 13px, running text 16px or more.

## 7. Details that separate set type from typed text

- Curly quotes and apostrophes, real dashes, a real ellipsis (see `copy.md` §7).
- `font-variant-numeric: tabular-nums` for prices, tables, dates in columns; `oldstyle-nums` suits
  serif body text.
- A figure set large (a product's load, its range, its price: the product statement a page without
  product photographs is shown by) is a tabular figure with its unit at about half its size after it,
  on one baseline, and under it a label at the body step that says what it counts ("in the box", "on
  one charge"). The figures of one composition take two or three sizes, the one that matters most the
  largest, never one row of equal figures over one-word labels (`stats-band`).
- `text-underline-offset: 0.18em; text-decoration-thickness: 0.07em` on links, so underlines clear the
  descenders.
- `hyphens: none` on headings. `overflow-wrap: anywhere` only on long URLs or emails.
- A heading belongs to the text after it: space above a heading is at least twice the space below.
- `::selection { background: var(--accent); color: var(--accent-ink); }` and a visible
  `:focus-visible` outline in the accent, so even the browser's own states belong to the design.
- Do not change weight on hover; the line reflows.

## 8. Mistakes the inspector cannot see

- A headline that passes the two-line rule but breaks badly: one orphan word on line two, or a break
  that splits a phrase ("Stools for small / kitchens"). Author the break.
- Display type so tight that letters touch, or so loose it falls apart.
- A confident hero followed by section headings almost as large. Keep one size dominant per screen.
- Section headings hold at their size: a sans display face sets them at 500 or more (the sheet says
  which). Headings sit on one left edge; no stepped or staggered heading lines.
- Body text set in the display face when that face was drawn for large sizes only.
- Everything bold. If every line is emphasised, none is.
