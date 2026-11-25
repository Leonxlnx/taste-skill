# Section library

Read `compose.md` before the first page. Look up a recipe here when it fits the section's content. Each gives its job, markup and sizes at 1440 and 390. For place pages see `sections.md` section 4.

<!-- recipe index -->
[Navigation](#navigation) · [Heroes](#heroes) · [Proof](#proof) · [Features](#features) · [Photographs, rooms, services and people](#photographs-rooms-services-and-people) · [Sections for a kind of content](#sections-for-a-kind-of-content) · [Price and questions](#price-and-questions) · [Closes](#closes) · [Compositions](#compositions) · [Footers](#footers) · [Page plans](#page-plans)
<!-- end recipe index -->

## What every recipe assumes

- **Frame.** `system.css` at 1440: `.wrap` 1280 at x 80, gutter 24, h1 64,
  h2 40; at 390: 342 at x 24. Every section is as tall as its content, its h2 first, `--padt` over
  it and `--padb` under its last block (`layout-v4.md` section 2); the "At 1440" sizes below are what
  the content takes, never a screen to fill. Never add a number the system lacks; a missing value
  becomes a token.
- **Splits.** Align the top edges. Keep text first in the markup and at phone width, including the mirrored composition.
- **Cards.** For a quiet page use these roles with the panel placements in `cards.md`. Keep repeated features, services, steps, posts and people open. A picture may sit above the title and sentence. Put plans with a price and action, goods, rooms and documents in a flat `.card--boxed` or `.card--plan` when the whole item needs a boundary. Use 16px corners, a visible 1px edge or a tint, and no resting shadow. Padding and gaps are 24px on desktop and 20px on phones. Separate ordinary lists with space. Keep hairlines for tables, definitions, fields and the top of the footer.
- **Grounds in frames (tech).** The page has one effect and one card group's still grounds
  (`effects-usage.md`). Where a recipe below says "the card ground", it means that group's dealt id
  with its own seed per panel; "the effect" means the page's one effect, only in the hero or the one
  `[data-visual]` frame. Every other frame takes the lit ground plain (`.frame--lit`), a flat
  `--g-alt` panel, a photograph or a diagram. Product, service and place use flat grounds.
- **Fragments** are pasted from `assets/ui/<name>/fragment.html` into their slot and rewritten:
  every name, number, subject, app and logo becomes the client's (`data-ui-load` shows the kit's
  sample text: drafts only). They sit in a `.stage` at their true size (`meta.json` `size`,
  `fluid`), never scaled, at the place the recipe names (else `meta.json`'s `place`). A `.fit` slot
  takes only a fragment whose minimum width fits it (`cards.md`): 324 in a 2x2 card at 1024, 256 in
  a span-4 card. The edge rule (every edge 24px clear, or cut by 24px or more with a fade) holds at
  1440, 1280, 1024 and 768; move `--ax`/`--ay` until it does. On the phone cards.css places each
  fragment 16px in, its top at `--ay-sm` (24px unless set).
- **Motion.** A UI fragment holds its finished picture. A looping group has a pause button. See `motion.md` for timings.
- **Classes.** Use the kit markup below. Put a composed section's scoped layout rules in the page's `own-css` block (`compose.md`).
- **Pictures.** Use the ladder in `photos.md`. A project, room or product may carry one fact line under house rule 1 in `copy.md`.
- **Names** in the examples (Ferrow, Rotaro, Kestrow, Ledgewick, Clausewise, Fenn, Halden...) are
  invented to show the form. Copy how they are written, never the words. Proof, quotes, customers
  and figures come only from the brief (`copy.md`).
- **Logo, buttons, links.** `.nav__logo` holds the client's SVG, else the dealt mark and the name
  (the same in the footer). Buttons take the dealt look from `<html data-buttons>`; the nav's main
  action is `.btn.btn--primary` at the one button height (`system.md` Nav). Nav words, buttons and footer links go to `#ids`, the logo
  to `#top`, Contact to `#contact`; Privacy and Imprint to pages you write, or left out.

# Navigation

All four share the bar in `system.md`: fixed, opaque, 72px (56 on a phone), a 1px hairline, the
same at every depth; a panel opens after 150ms of hover with a fade and a 6px drop, a click on the
word goes to its section, never `preventDefault`. system.js adds the phone sheet, Esc and
`aria-expanded`; never write a second handler.

## nav-mega

**Job and use.** The company's map one hover away: the product grouped by what the visitor wants,
each link named and explained in one grey line, the newest release in one picture card. Software
with 6 to 12 feature pages, or a company with several product lines.

**At 1440.** `header.nav` > `.wrap.nav__bar`: the logo, 4 to 6 one-word `.nav__link`s (a `.chev`
only on those that open), then `.nav__actions` with Sign in (a plain `.nav__link`, only for an app
with accounts) and the primary. A menu is the item's `.nav__menu`, full width under the bar,
holding `.wrap.grid`: two or three `.menu-col.span-3`, then one `a.menu-card.span-3` ending at x
1360 (`start-10` with two columns). A column is a `.t-label` heading over 3 or 4 links, each the
feature's name with one grey line of at most 30 characters. Small menus (Resources, Company) open
the same panel with plain columns and no card.

**At 390.** The system's sheet: rows of 56px; a word with a menu opens its links in place under
it on a tap (system.js's `.nav__expand`; it opens at once, nothing animates height), the menu
card as a plain row, the two buttons full width at the foot.

**Copy.** Bar labels: one plain word in the buyer's words. Links: the feature's name (1 to 3 words)
and what it does (3 to 7 words). Example, Ferrow (booking and notes software for physio clinics):
bar Product, Clinics, Pricing, Resources, Company; Product: Front desk (Online booking / Patients
book a free slot; Reminders / Texts before each visit) and Treatment (Patient notes / Templates for
every treatment). Card: New / Online payments / Take a deposit at booking.

**Visual.** Only the menu card: its `.panel` (160px) holding a `.stage.stage--fade-br` with one
fragment `.at-corner` (24px in) cut by the right and bottom, rewritten to the newest feature, held
still, on the lit ground plain. No icons in the columns.

**Mistakes.** A bar narrower than the `.wrap` or links wrapping; chevrons on plain links; a menu off
the grid; a second picture card; grey lines over 30 characters; vague labels ("Solutions",
"Platform").

## nav-cards

**Job and use.** Two to four distinct products shown as picture cards with a plain name and one
line; resources as plain link columns. A company with two to four products that each have a screen
or a real photograph, a studio with three service lines and real work, or a place's offer (four
photograph cards).

**At 1440.** The bar as in nav-mega. Product's `.nav__menu` holds `.wrap.grid` with three
`a.menu-card.span-4` (410 wide): a `.panel` (page CSS `.menu-card .panel { --p-h: 200px }`) with
that product's fragment `.at-corner` in a `.stage.stage--fade-br`, or its photograph filling the
panel; the title in `.t-card`, one grey line of at most 52 characters, inside the card. A place:
three span-4 cards at 411x308 (4:3), each the client's photograph, the name at 16/500 and the price
from, no fragment, ground or shadow.

**At 390.** The sheet shows each menu card as a row, its title over its line, the picture hidden.

**Copy.** Card title: the product's name or plain job; the line what it does. Example, Ferrow: Online
booking / Patients book a free slot from your website; Patient notes / Notes from your own
templates.

**Mistakes.** One seed on all three; panels of different heights; text on the panel; titles
wrapping; names that mean nothing alone ("Flow", "Pulse").

## nav-centre

**Job and use.** The quietest bar: the words in the middle of the bar, the logo on the left line,
the main action on the right line. Software and services with four or five plain words.

**At 1440.** `header.nav.nav--centre`: system.css centres the `.nav__links` group on the page axis;
the logo and actions keep the `.wrap` lines. Four or five words, never wrapping at 1024. Menus as
nav-mega's small menus.

**At 390.** The logo left, the toggle right; the system's sheet.

**Mistakes.** A group so wide it touches the logo or the button at 1024; a second row.

## nav-split

**Job and use.** A place, shop, restaurant or studio people visit: the name in the middle, three
short words on the left, the main action on the right. Only a group of related destinations opens
the panel with photograph cards of what is offered.

**At 1440.** `header.nav.nav--split`: system.css puts the links in the left third, the logo (mark and
name, 28px in the display face) on the page's centre line and the actions in the right third.
Four words, the low end of `system.md` Nav's four to six, since they share the left third; at
1024 a word never wraps.
The menu word's `.nav__menu` holds `.wrap.grid` with three or four `a.menu-card.span-3` (on a place
four at 302x227, 4:3), each the client's photograph (`img.frame__img`, no effect) with the name in
`.t-card` and the price from inside the card. Actions: the primary ("Book a table") and at most one
plain word the client really has (Gift cards when it sells them), else none.

**At 390.** The logo moves left, the toggle right; the sheet (a place adds the street and the week's
hours at its foot).

**Copy.** Example, Fenn (a pottery studio in Leipzig): Classes (menu: Taster evening / from €39;
Six-week course / from €260; Open studio / €18 a day), Shop, Studio, Visit; "Gift cards", "Book a
class".

**Mistakes.** Unequal thirds pushing the logo off centre; more than four words; UI fragments in the
menu; a second row of links; a shadow on the open panel.

# Heroes

The ten heroes and the place hero, with their numbers at 1440 and 390, are in `layout-v4.md`
section 3; paste the dealt one from `assets/layout/hero-<id>.html` and rewrite its words and
pictures. What the recipes add:

- **Copy** (`copy.md`): the h1 names the category and the buyer or place in 2 to 8 words; the
  sub-line 15 to 30 words on how it works and the main benefit, with one hard fact (a place: 80
  characters with today's hours); the primary as a verb and an object, word for word in the nav, the
  close and the phone bar, and one quieter action (a place: none). Example, Halden Dental (a clinic
  in Malmö): "Dental clinic in central Malmö"; "Check-ups, cleaning and fillings from €95. Book
  online, most visits within a week."; "Book a check-up", "See prices".
- **Pictures** are the work: a photograph of the product in use, the place or the people (product,
  place, service); a phone for an app (a `.device` 280x570 built in page CSS, an 8px bezel, radius
  32, one fragment in its phone layout, `role="img"`); one window for a web app (`.frame--split` with
  `window` `.at-corner.to-edge` 56/56 and `cursor` or `notify` `.at-over` its lower-right edge); a
  technical product's object (`<div data-print="print-…">` on the lit ground, tech only). App
  buttons in text ("Download for iPhone"), never store badges beside the system buttons.
- **Window heroes** (`centred`, `collage`, a split window): the fragments pasted and rewritten to the
  client's names; the main one may loop (tech, with the frame's pause button), the second holds
  still; never more than two pieces, never tilted or scaled, never the kit's sample text, never a
  lone fragment floating in the middle of the frame.
- **Dimension drawing.** Use `figure.drawing` from `starter.html` when size or fit matters. Draw the side view in proportion in inline SVG. Put two or three dimension lines (`.dim`) beside their figures in `span.drawing__dim`. For a product or game without art, see `subskills/illustrate/SKILL.md`.

# Proof

Proof only from the brief: real customers, quotes, reviews, press and figures (`copy.md`). Without
it, leave proof out; never invent it.

## logo-row

**Job and use.** Real organisations that use the product, docked under the hero's content (software
and product only): only the client's real customers whose logos may be shown.

**At 1440.** The hero's docked row (`layout-v4.md`, at most 96px): `p.t-small.muted` (14px, grey,
on the left line, 24px above the row), then `.logos`, one row from x 80 to 1360: up to six logos
28px tall, each the customer's own SVG in its full colours (rule 7, `icons.md`). Still: no
marquee, light band, fade or tiles; a logo never moves (MO-57).

**At 390.** Hidden, unless the hero still ends by H - 24 - bar; then a 3-column grid.

**Copy.** The line over the row: who uses it, plain ("Clinics using Ferrow").

**Mistakes.** Logos of non-customers or invented wordmarks; a marquee; mono or dimmed marks; a boasting line; a logo
row on a service or place page.

## quote-stat

**Job and use.** A named customer describes a change and the brief supplies the number to back it up. Merge a short quote into the section showing the result.

**At 1440.** Put the quote and its figure in the same row.
`.grid`: `figure.quote.span-8` and a `div.stat-aside.span-3.start-10`, both from one top line. The
`blockquote` (28px, at most 40 words), then 32px under it `div.person` (a `div`, never a
`figcaption`): a 40px photograph of the person (a quote needs a face) or the company's logo, the
name over role and company. The stat: `p.t-stat` (38 at 1440, 28 at 390) and a grey line of up to eight words.

**At 390.** Quote, person, then the stat, 24px above it.

**Copy.** A before and an after, no praise words. Example form: "We used to rebuild the rota every
Sunday night. Now it takes twenty minutes on Friday." / name, role, home / "20 min", "to plan a week
of shifts".

**Visual and motion.** Still. On tech the number may be filled with the effect (`fx-stat`) only when
that is the page's one effect.

**Mistakes.** A quote the brief does not give; a stock or missing portrait; a stat that is a slogan;
a count-up.

## customer-proof-row

**Job and use.** Three named customers from the brief, one measured result each. B2B software,
studios, products sold to businesses.

**At 1440.** `.section-head.section-head--row`: the h2 left, `a.link` "All customer stories" right
on its bottom line. 48px below, three `article.card.span-4`: the customer's logo as an `img` 28px
high, or its name as `p.t-card`; 24px; the story title (one line, at most 7 words); one line;
`a.link` "Read the story"; then `.panel.panel--flush` with `stat` `.at-corner.to-edge` (`--ax: 24px;
--ay: 40px`, `data-ui-opts='{"fill":true}'`) in a `.stage.stage--fade-br`, cut by the right and
bottom, its number and change in view. A service or studio: a photograph of each customer's work
fills the panel instead.

**At 1024 to 1279.** Two cards, then the third across the row. **At 768 and 390.** One column.

**Copy.** Title: who did what. Stat: what was counted (at most 28 characters), whole numbers, the
change chip, "Before x · After y".

**Motion.** Tech: the first card's stat loops; the other two hold still.

**Mistakes.** Customers the brief does not name; a percentage as the count; a carousel; cards turned
into quote cards.

# Features

## product-statement

**Job and use.** One plain paragraph on what the product is and what makes it different, then the
product in one wide picture with three facts. Products (never on a place). Never straight after a
hero frame of the same width.

**At 1440.** The statement on `span-8`: an h2 (48px, at most 4 lines), the first sentence in ink,
the rest in `<span class="muted">`. 48px below, `.frame.frame--hero` on `span-12` (page CSS
`aspect-ratio: 2 / 1`) holding the cut-out photograph, centred, at least 64px from every edge; 48px
below, three facts on `span-4`: the value at 28px with its unit, a grey line. A
technical product may show the client's render or its object of its own kind instead (`.frame--lit`
with `<div data-print="print-…">`, its `hero` preset large and right of centre, the facts in
`div.frame__text` at the lower left). For a product without photographs, draw its known shape or output. A requested 3D view uses `data-product` (`effects-objects.md`).

**At 390.** The h2 at 30px; the frame square, facts under it as a list.

**Copy.** Example, Pellum (a desk lamp): "Pellum lights a whole desk without glare. <grey>One dial
dims it and turns it from warm light to daylight.</grey>"; facts "1,100 lm" Brightness, "2,700 to
6,500 K" Colour, "9 W" Power.

**Motion.** A cut-out: none. A technical product's object: its slow turn and its answer to the
pointer (the page's effect), with its own pause button.

**Mistakes.** A slogan; the grey part in a second paragraph; a cut-out in a box or touching the
edge; an object that is not the client's kind of product; facts that are claims.

## features-2x2

**Job and use.** What it does, in one screen: four features of equal weight, each with its own
small working visual (the 2x2: a headline, two lines, an inset panel with a smaller card on it).
When one feature matters more, use the bento.

**At 1440.** `.section-head` with an h2 that runs on in grey. 48px below, `.grid` with four
`article.card.card--row.span-6`, two boxes deep: on a light page `.card--open` (the title and lines
on the page ground, the panel under them), on a dark page the card's box with `.panel.panel--flush`
(x.ai's cards). Each card: the title, two lines in ink (16 to 20 words), then the panel (page CSS
`#<section> .panel { --p-h: 336px }`) holding a `.stage.stage--fade-b` with one pasted fragment:
- `chat` `.at-rise.fit` (`--fit-max: 400px; --ax: max(24px, 50% - 200px)`, `--ay` and `--ay-sm`
  56px): out through the bottom by 24px or more; `search` or `stat` the same with `.to-edge`
  (`stat` with `data-ui-opts='{"fill":true}'`);
- a short stack (`notify` with titles of at most 26 characters, `checklist`, `integrations`)
  `.at-rise.fit` low, `--ay` and `--ay-sm` `calc(100% - 180px)`, its last row cut;
- `toggles` `.at-right.to-edge` (`--ax: 32px; --ay: 56px`), cut by the bottom;
- `window` (`{"compact":true}`) `.at-corner` 24/28 on a flush `.panel--device` whose bar names the
  app and its status;
- a diagram card (`diagrams.md`): `<div class="dg" data-diagram="<preset>">` filling the panel.
Not `calendar` (its month must show whole), `doc` or `code` (wider than the 324px slot at 1024).

**At 1024.** The panels are 372 wide: a `.fit` fragment narrows to 324, the others stay cut.
**At 768 and 390.** One card per row; each fragment at its corner in its own layout.

**Copy.** The h2 at most 12 words with its grey part. Titles: a verb and a concrete object. Lines:
one or two sentences with one concrete detail. No buttons in the cards. Example, Ferrow: "Run your
practice from one app. <grey>Bookings, notes and payments.</grey>"; "Takes online bookings", "Takes
card payments", "Builds treatment plans", "Sends text reminders".

**Visual.** Tech: the card ground, one seed per panel, `data-fx-params='{"drift":0}'`, lit by
system.js; four different fragments or diagrams, real app icons where it names an app. Product or
service: a photograph of each feature fills the panel.

**Motion.** Tech: the first card's fragment or diagram loops (`data-ui-loop`); the others hold still
and play while the pointer rests on their card. A linked card can underline its title on hover.

**Mistakes.** A card that moves on scroll; panels out of line; a fourth line of text; the kit's
sample text; noun titles ("Peace of mind"); three boxes deep; a widget floating dead centre; a
1-23px strip of ground under a fragment.

## bento

**Job and use.** One main feature large and four small. Software with one lead feature, or a
product with real photographs of its main part and four details.

**At 1440.** `.grid`: row one `article.card.card--row.span-8` and `.span-4`, row two three
`.span-4`. Every card: title, two lines in ink, then the panel, two boxes deep as in features-2x2,
one `--p-h` for the group (336px). Wide card: `window` `.at-corner` (40/48, cut by the right and
bottom, `.stage--fade-br`), or `files` `.at-corner.wide` (`--w: 680px`). Small cards (panel 347 at
1440, a `.fit` slot of 256): one fragment cut by the bottom: one that narrows to 256 centred
`.at-rise.fit` (`chat`, `search` with `.to-edge`, a short stack low); `toggles`
`.at-right.to-edge`; or a wider one (`stat`, `notify`, `cursor`) at its true width `.at-corner`
(`--ax: 24px; --ay: 40px`), cut by the right and bottom. A `voice` call goes where its `meta.json`
says and is then the group's loop.

**At 1024 to 1279.** The wide card across the row, the four small ones two by two.
**At 768 and 390.** One card per row.

**Copy.** Wide card: the main feature as a verb and an object; small ones 2 to 4 words. Example,
Ledgewick (bookkeeping for freelance designers): "Reads every receipt" / "Drop in PDFs or phone
photos. The date, amount and VAT are filled in."; small: "Matches bank payments", "Tracks VAT",
"Sends invoices", "Exports for your accountant".

**Visual.** As features-2x2. For a product, use the actual parts in one picture style.

**Motion.** Tech: the wide card loops; the four small ones hold still. Never two loops in one bento.

**Mistakes.** Text in different places on different cards; small-card copy over two lines;
`calendar`, `doc` or `code` in a small card; a bento next to another card grid.

## split-text-left

**Job and use.** One thing the product does, in a few sentences and three facts, beside a picture
that shows exactly that. The workhorse for software, products and studios.

**At 1440.** `.grid`, top-aligned: the text on `span-5` (h2; 24px; two or three sentences at 20px;
24px; up to three short facts as plain lines; 24px; one `.link`) and
`.frame.frame--split.span-6.start-7` (5:4, square on a phone) holding a `.stage.stage--fade-br`. The
main piece is cut by the bottom, never floating with ground on all four sides:
- `window` or the client's screenshot `.at-corner.to-edge` at `--ax`/`--ay` 56px, cut by the right
  and bottom; `files` the same with `.wide` (`--w: 680px`);
- a narrower piece (`doc`, `code`, `chat`, `search`, `checklist`) `.at-rise.to-edge`, centred by
  `--w` and 56px down; a short one (`slider`, `toggles`) `.at-rise.fit` 40px down, cut below its
  second row.
One small piece that shows the result (`cursor`, `notify`) only over a `window` or screenshot:
`.at-over` its lower-right edge (`--bx: 24px; --by: -40px`), never over its first rows (Figma's
panel with a small card over the product UI).
A product or service: the frame holds the photograph of the part or the work the text names
(`.frame--photo`, 628x471), never UI.

**At 1024 to 1279.** The frame is 436 to 564 wide: the main piece alone.
**At 768 and 390.** Text first, the frame 48px below, full width.

**Copy.** Heading: the job and its result. Sentences in the order the picture plays. Example,
Clausewise (contract review for small law firms): "Finds risky clauses in contracts"; "Upload a
contract and every clause is checked against your firm's playbook."; link "See how review works";
`doc` rising out of the bottom with "unlimited liability" marked.

**Visual.** Tech: the effect when this frame is the page's `[data-visual]`, else the lit ground
plain. The main piece shows the text step for step; the small one shows what comes out.

**Motion.** Tech: one loop, in the small piece or the main one.

**Mistakes.** Text and frame not top-aligned; a four-line h2; a picture that shows something the
text does not say; a button pair instead of one link; a second split on the other side.

## tabs-tour

**Job and use.** Three to six uses of one subject share a frame. Switch by click, tap or keyboard.

**At 1440.** `.grid`, top-aligned: left `span-5`, the `.section-head` (h2, grey line), then
`div.tabs[role=tablist]` with 3 to 6 `button.tab[role=tab]`, each with `aria-controls` naming its
`[role=tabpanel]` (two sentences and a `.link`) and its screen (`aria-controls="tab-1 screen-1"`).
Right, `.frame.frame--split.span-6.start-7` with a `.stage.stage--fade-br`: one slot per tab (all
but the first `hidden`), each placed as split-text-left's main piece, cut by the bottom; every panel
one fixed height, so the frame never resizes. system.js shows a tab's panel and screen together.

**At 390.** The tabs wrap onto rows (never a swipe row); the frame 48px under the active panel.

**Copy.** Tab labels: a verb and an object, 2 or 3 words, one grammar. Example, Ferrow: "Book a
session", "Move an appointment", "Pay by card", "Follow exercises".

**Motion.** The indicator slides on a click (`motion.md`); only the shown screen loops.

**Mistakes.** Tabs made from divs, a changing frame height or several tabs that show the same thing.

## chapter

**Job and use.** One feature area in depth: a paragraph, a link, a wide frame of the product doing
it, four feature names. Two to four in a row for a platform: a chapter series is the one place
where neighbours share a layout.

**At 1440.** `.grid`, top-aligned: the h2 on `span-5`, and on `span-6 start-7` a grey paragraph
(about 25 words) with a `.link`. 64px below, `.frame.frame--hero` with a `.stage` (16:7): the area's
main screen (`window`, `code`, `doc` or `files`) `.at-rise.to-edge` 64px down and the one action
(`cursor`, `notify`, `stat`, `search`) `.at-over` its right edge. 48px below, four `div.span-3`: a
feature name and one grey line.

**At 390.** Text first; the square frame keeps the main screen; the four names as a list.

**Copy.** Example, Kestrow (freight booking for haulage firms): "Book loads in one place"; "See
every load your customers send, quote it and book a truck from one screen."; names "Imports orders"
/ "From email or a CSV file".

**Motion.** One loop per chapter; in a series only every other chapter loops. Nothing revealed or
scrubbed by scroll.

**Mistakes.** Fragments half-transparent or tilted; the action covering the main screen's only
readable rows; repeats that change the template.

## app-frame

**Job and use.** Build the product's list and selected item in one window when that is its central view. A timeline, board, diff or map can use its own section instead (`compose.md`).

**The two panes** (kit fragments, rewritten to the client's names; the list is always `window`):

| Product | List pane | Open pane |
|---|---|---|
| Code review | `window`: pull requests | `diff-review` (the comment and Apply in its top 250px) |
| Support, inbox, CRM, agents | `window`: conversations | `chat` (the open thread) |
| Docs, contracts, knowledge | `window`: documents | `doc` (the page with its marked phrase) |
| CI, deploys | `window`: runs | `pipeline-board` (wide: nodes and log) or `terminal-run` |
| Booking, scheduling | `window`: bookings | `calendar` |

The `window`'s rows: `.ui-win__who` the person (author, customer, owner), `.ui-win__sub` the item
and its detail ("Retry settle jobs · +4 −3"), the status chip the product's own states (`data-open`,
`data-work`, `data-done`), sidebar labels one word each. Write 9 or more rows and enough lines in
the open item (24 or more for a diff) that both panes run past the frame's bottom: the frame cuts
them under its fade, never an empty strip of pane under the last row.

**At 1440.** `.grid`, top-aligned: the h2 on `span-5`, a grey paragraph (about 25 words) with one
`.link` on `span-6 start-7`. 48px below, the frame across the wrap, 560px tall (640 on a tablet,
480 on a phone: the panes run past its foot and it cuts them):

```html
<div class="ui app" role="img" aria-label="[what the window shows]" data-ui-pause-host>
  <div class="app__pane app__pane--list"> [window fragment] </div>
  <div class="app__pane app__pane--open" data-ui-loop> [the open item's fragment] </div>
</div>
```

`class="ui"` gives the frame the kit's tokens, and tells the checks it is one drawn window. Page
CSS (the whole recipe):

```css
.app.ui { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); height: 560px; margin-top: var(--s-7); background: var(--u-bg); border: 1px solid var(--u-border); border-radius: var(--u-r); box-shadow: var(--u-shadow); }
.app > .app__pane { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.app > .app__pane + .app__pane { border-left: 1px solid var(--u-line); }
.app > .app__pane > .ui-panel { width: 100%; border: 0; border-radius: 0; box-shadow: none; }
.app > .app__pane::after { content: ""; position: absolute; inset: auto 0 0 0; height: 64px; background: linear-gradient(transparent, var(--u-bg)); pointer-events: none; }
@media (min-width: 1024px) and (max-width: 1279px) { .app.ui { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); } }
@media (max-width: 1023px) {
  .app.ui { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); height: 640px; }
  .app > .app__pane--list { max-height: 252px; }
  .app > .app__pane--list::after { display: none; }
  .app .ui-win__side { display: none; }
  .app .ui-win__body { grid-template-columns: minmax(0, 1fr); }
  .app > .app__pane + .app__pane { border-left: 0; border-top: 1px solid var(--u-line); }
}
@media (max-width: 639px) {
  .app.ui { grid-template-rows: minmax(0, 1fr); height: 480px; }
  .app > .app__pane--list { display: none; }
  .app > .app__pane + .app__pane { border-top: 0; }
}
```

The `window` lays itself out for its pane (rows stacked name over item at 1440, columns on a
tablet). The fragments keep their natural height: the pane cuts them, never their own box. One box:
the frame is the window, the panes are its columns, no panel, card or ground behind it (it sits on
the section's ground; on a `dark-band` the kit's dark surface). A second piece over it (`cursor`,
`notify`) only `.at-over` the open pane's lower-right, never over the list.

**At 1024 to 1279.** The list narrows to 4 columns (its sidebar goes); the open item takes 8.
**At 768 to 1023.** The list on top (its bar, column heads and four whole rows, 252px), the open
item under it to the section's foot. **At 390.** The open item alone, its own header as the chrome.

**Copy.** The h2 names what the window shows ("Every pull request, reviewed in one place"); the
paragraph says the steps in the order the window shows them.

**Motion.** One loop: the open item (`data-ui-loop` on its pane: the Apply pressed, the answer
written); the list holds still. Nothing scrolls inside the window.

**Mistakes.** The open item alone on a lit panel (that is a card, not the product); the list and
the item as two boxes side by side with ground between; a pane that ends in empty white; the kit's
sample rows; a fragment stretched to the pane's height (its own overflow then cuts its text).

## steps

**Job and use.** How the product is used, in order, each step's result shown. Only with three real
steps.

**At 1440.** `.section-head`, then `.grid` with three `article.card.card--row.span-4`:
`span.step-num`, the title (a verb and an object, one line), one or two lines in ink, then the
panel, two boxes deep (336px; a service: a photograph of the step fills it), with one fragment
placed as in the bento's small cards. Not `calendar`, `files`, `doc` or `cursor`. No arrows or lines
between the cards.

**At 1024 to 1279.** Two cards, then the third across the row. **At 768 and 390.** One column.

**Copy.** The heading holds the count. Example, Ledgewick: "Set up Ledgewick in 3 steps"; "Upload
your receipts" / "Drop in PDFs or phone photos."; "Check the matches" / "You confirm the few it is
unsure about."

**Motion.** Tech: the first card loops; the others hold still. Never chained or staggered.

**Mistakes.** Arrows or stair-stepped cards; huge display numerals; panels of different heights.

# Photographs, rooms, services and people

## photo-band

**Job and use.** One photograph fills the section. Put the headline in space that stays calm on desktop and phone.

**At 1440.** `section.photo-band.photo-band--bleed` in `main`, at least 80% of the screen (a section
with a layer, `system.css`): the `img` as the layer,
then `div.photo-band__text` in a `.wrap`: an h2 of at most eight words, one line, an optional
`.link`, on the photograph's calm side (`--left`, or `--light` with dark words on a pale crop). No
scrim, gradient or box. A muted film (tech only) plays with a pause button.

**At 390.** The photograph's phone crop with a calm area, or the words under it on the ground.

**Copy.** Example, Brinwood (standing desks made in Porto): "Built to order in Porto"; "Each desk is
cut, oiled and tested in our workshop before it ships."

**Mistakes.** Words cover the subject or disappear into a busy crop.

## photo-pair

**Job and use.** Two photographs side by side: inside and out, a detail and the whole, two cases of
work. A light section between heavier ones.

**At 1440.** The h2 and one line above, then `.grid` with two photographs on `span-6`, 4:5 or 4:3,
one ratio, one light. A fact line can distinguish the two projects (`copy.md`).

**At 390.** One column.

**Mistakes.** Two incompatible grades or copy that just describes the picture.

## line-up

**Job and use.** The models or sizes of a product, picture first, each with a price from, so the
buyer can choose (8 of 15 good product sites show the range early).

**At 1440.** `.section-head.section-head--row` (h2 "Three sizes", `.link` "Compare sizes"), then
`.grid` with three `a.tile.span-4` (four `span-3` for four), each a card: the cut-out on `--g-alt`
(`object-fit: contain`, 32px in) or a photograph from one angle at the top, then inside the card's
padding the name in `h3`, "from €1,290" and one facts line ("Top 140 x 70 cm · 65 to 130 cm").

**At 390.** One column, or two-up at 165.

**Visual.** Every model at one scale on one backdrop, or one camera angle; a technical product may
show the client's render per size. No line-up without pictures of every model.

**Mistakes.** Plan cards with checks and a featured badge; a monthly price; mixed angles and scales.

## rooms-list

**Job and use.** Rooms, cabins or studios to rent. On a place the rooms are `sections.md` section 4
(Rooms: tiles, row or side). A service or product with rooms (a co-working space) uses the same
tiles: a 4:3 photograph of the whole room, the name, the facts, the price from with its season,
"Book this room".

**Mistakes.** Rooms as plan cards with checks or badges; a calendar standing in for the photographs;
a price without its season; rooms that alternate sides.

## services-list

**Job and use.** What a clinic, firm or trade does, each service with one line and a price from: a
list beside one photograph of the work, never a grid of icon cards.

**At 1440.** `.grid`, top-aligned: the h2, one line and `ul.rows` on `span-5` (per service
`span.rows__name`, a `<p>` line, `span.rows__value` "from €95"; a `.link` under the list), and the
photograph on `span-6 start-7` (`.frame.frame--photo`, 4:5 or 4:3).

**At 390.** The text and list first, the photograph 48px under it.

**Copy.** Example, Halden Dental: "Check-up and clean" / "Every six months, 40 minutes" / "from
€95".

**Mistakes.** Services as icon cards; prices missing; more than eight rows (link to a page).

## peek-list

**Job and use.** A short list beside one photograph that changes to the row under the pointer, the
focus or a tap: a studio's rooms, a clinic's treatments, a bakery's kinds of bread. Every row needs
its own photograph; with fewer, use services-list.

**At 1440.** `starter.html` `peek-list`: `.grid[data-peek]`, top-aligned: on `span-5` `ul.rows` of
three to six `li[data-peek-to][tabindex="0"]` (the name, one line in ink, the value right), and on
`span-6 start-7` the photograph frame holding one `img.frame__img[data-peek-for]` per row (all but
the first `hidden`, none lazy). system.js swaps the photograph (instant on other kinds; a 200ms
fade on tech) and marks the row in view.

**At 768 and 390.** The list first, the photograph 48px under it; a tap on a row changes it.

**Mistakes.** Rows share a picture or focus and touch fail to select the corresponding view.

## people-row

**Job and use.** The people a client will meet, a portrait each, for a service or a small maker,
only the real team the brief gives.

**At 1440.** `.section-head`, then `.grid` with four `.tile.tile--portrait.span-3` cards: the
portrait (4:5) at the top, then inside the card's padding the name in `h3`, the role and one line
on what they do.

**At 390.** Two-up at 165, the names under in the card.

**Mistakes.** Stock or invented portraits; mixed light and grounds; more than eight people.

# Sections for a kind of content

## integrations-grid

**Job and use.** Which tools and file types the product works with, by their real full-colour icons
(house rule). When the point is what feeds the product, a `fanin-warehouse` or `hub-tools` diagram card
with the real icons on its spokes, inside a feature section. Up to eight tools: four cards. The big
grid only for 9 or more tools the brief lists.

**At 1440.** Four cards: `.section-head`, then four `article.card.card--row.span-6`, each a title
naming the tool ("Syncs with Notion and Dropbox"), two lines, and the panel (336px) holding one
fragment: `integrations` with its apps swapped for the client's real tools, `.at-rise.fit` low
(`--fit-max: 380px`, `--ay` and `--ay-sm` `calc(100% - 180px)`); `files` with the real files and
icons, `.at-corner.wide` (`--w: 680px`); or a hub diagram (`hub-tools`) with the product at the
centre and its real tools on the spokes. Big grid: `.frame` on `span-12` (48px padding) with eight
72px tiles across (24px column gap, 32px row gap), each a real icon over the tool's name in
`.t-label`; no "See all integrations" link (a one-page site has nowhere to send it).

**At 390.** Cards in one column; tiles four across at 64px.

**Visual.** Icons from `icons.mjs fetch` in their own colours (`icons.md`), never drawn or tinted.

**Motion.** Tech: the first card loops (or the hub pulses); the rest hold still.

**Mistakes.** Drawn or recoloured logos; tools the product does not support; more than five tiles
in a card.

## calendar-frame

**Job and use.** The dates the product deals with, on the client's real month, beside what they are
for. Tech only, with real dates.

**At 1440.** As split-text-left, with the frame one height at every width so the month shows whole
(page CSS `#dates .frame--split { --ratio: 0px; min-height: 600px }`), holding the pasted `calendar`
alone, `.at-rise.fit.to-edge` 48px down (`--fit-max: 440px; --ax: max(48px, 50% - 220px)`). No
second piece.

**At 390.** Text first; the frame 600 tall, the calendar in its phone layout.

**Copy.** A heading that says what the dates are for. Example, Keelday (booking for sailing
schools): "Plan the season's courses".

**Visual.** Set the month label, `data-month`, the leading `.is-out` days for the weekday of the 1st,
`data-d` on every real day, `data-start`/`data-end`, one `is-mark`, the three `[data-ev]` rows, as
the calendar's `meta.json` says; `is-today` only in the current month.

**Mistakes.** The wrong weekday for the 1st; the kit's sample month; the calendar scaled or cut
through its rows.

## timeline-rail

**Job and use.** Four dated moments in order on one line, each with a small panel: releases, a
history. Software and product only, never a place.

**At 1440.** `.section-head--row` with the h2 and a `.link`. 48px below, `ol.grid.rail`: four
`li.span-3`, each with a `.panel` on top (200px), then the rail row (page CSS: a 1px line to the
next column, an 8px still dot, the newest in `--accent`), the date in `.t-label`, the title in
`.t-card`, one sentence of at most 10 words.

**At 390.** One column; the rail vertical.

**Motion.** At most one loop, in the newest panel (tech). Nothing on the rail moves.

**Mistakes.** Points zig-zagging; a pulsing dot; panels of different heights.

## menu-in-type

**Job and use.** Group a menu or price list in live text. Put item and price on the same row. A product sold by weight or size includes its unit. The list can stand alone.

**Mistakes.** Ragged prices, mixed currency formats, a menu available only as a PDF or image, or a strip of unrelated details under the prices.

## visit-map

**Job and use.** Where the place is, when it opens and how to get there, with the practical facts
(parking, dogs, step-free access, check-in) as two to six rows. Showrooms, studios, services with a
door; on a place the visit section is `sections.md` section 4 (Visit) and this recipe gives only
the map.

**At 1440.** The page's split: the text (h2, the `<address>` as street and district (no street in the brief: the district, `copy.md`), the hours as
`dl.hours` with `data-tz`, the phone and email only when the brief gives them, the main action and
Get directions (with a street from the brief; a district only: "See the area"; a town only: no map link)); on the right the street map: `fx-map` baked from OpenStreetMap
(`effects-creative.md`) only for a street the brief gives, the pin on the street line, still on
other kinds; otherwise a photograph of the shopfront.

**At 390.** Text first; the map or photograph 342 wide.

**Copy.** Example, Fenn (a pottery studio): "Visit the studio"; "Book a class", "Get directions".

**Mistakes.** A map embed or screenshot; a map of a street the brief does not give; a moving route
on an other page; the credit on the map (it joins the footer line); today from the visitor's clock.

## booking-form

**Job and use.** The one task of a place or service page: send a booking request. When the client
books through a system, its link is the button instead.

**At 1440.** The page's split: text on the left (h2 "Book a room", what happens next, the phone
and email only when the brief gives them); on the right the form on `--g-alt` (48px padding, never
over a photograph, texture or glass), beside or under a photograph of the room or counter on a
place (`sections.md`, Booking): dates, guests, name, email, at most six fields, the `.btn-row` with
the primary, the status line and the reply line: `starter.html` `booking-form`, run by system.js
(`system.md`, Forms). It posts to `data-endpoint`, the client's form address, when the brief gives
one; else its `action` is a `mailto:` on `.example`, a stand-in the report lists. Labels you can
see, each error under its field, the type and autocomplete each field needs. Text fields, not
`type="date"`, on a page not in English.

**At 390.** Text first, the form full width, one field a row.

**Copy.** Labels say what goes in ("Arrival", "Guests"); the button is the main action word for
word; a line says when the reply comes ("We reply within a day").

**Mistakes.** A form that sends nowhere; more than six fields; a success message with no send
behind it; a placeholder as the only label; an error shown only in red or only at the top; a modal.

## client-slots

**Job and use.** The client's own trailer, key art, in-engine screenshots, CAD renders, exploded
model or motion video, when the brief says the client has them (`sections.md` section 1): each
gets a frame that reads finished now and takes the client's file later with one line changed. Tech
pages (software, gaming, hardware) and a product's CAD frame use this recipe. Fill the frame with the client's file, or a built view of the same subject. See `photos.md` for stand-ins. Record the replacement in the report.

**The comment.** Every slot opens with one comment the client's team can search for:
`<!-- CLIENT FILE trailer: assets/client/trailer.mp4 (1920x1080, H.264, the 60 s trailer) and
assets/client/trailer.jpg (its poster); stand-in poster: <spec>-<view>.webp -->`. The report lists
each slot: its name, file, ratio and stand-in.

**Trailer or motion video frame.** Its own section after the hero (or the world's section), the
h2 above it, the frame across the wrap: `figure.frame.frame--photo.fit-screen` (page CSS `--ratio: 56.25%`; at 16:9 the frame across
the wrap is about 720px tall at 1440x900, so `fit-screen` (`layout.css`: about a screen with its heading, 720px at most, `auto`
under 1024px so a tablet and a phone keep 16:9) keeps the frame and its heading on one screen; the contained poster then sits
letterboxed on the dark ground)
holding `<video class="frame__img" playsinline preload="none" poster="<the stand-in still>">`, the
poster showing the subject of the film. Only show a play control when the film is available.
dead. With the file: `controls`, `preload="metadata"`, `<source src="assets/client/trailer.mp4"
type="video/mp4">`, the client's poster. Without it: no `<source>` and no `controls` (a missing
file or a dead control bar is a broken frame). A built poster can fill the frame. For a transparent render poster, use `object-fit: contain` on the `.frame__img` and generate it on the frame's ground (`make-posters.mjs --grounds dark`). The play control is `<a
class="ly-play" href="<the trailer's page the brief gives: the store page>"
aria-label="Watch the trailer">` with its `.ly-play__disc`: the `.frame` is a centring flex box, but system.css's rule `.frame > :not(canvas, .stage, .loop-pause, .frame__fx, .frame__img, [data-print], [data-scene], .print3d)` makes the
control `position: relative`, so `.ly-play`'s `left` and `bottom` (`--s-6` each) move the disc 32px right and up of dead centre, not
to a corner; page CSS `.frame > .ly-play { left: auto; bottom: auto }` centres it; with no such page,
no control: the poster stands as the section's still until the file lands. With its file, a
motion video on tech may play muted and looped instead (`autoplay muted loop`), with its pause
button (`motion.md`), the poster alone under reduced motion and on a phone; never with sound.

**Screenshot strip.** Use three to five supplied game frames at 16:9, each showing a distinct action. Put `<img class="frame__img">` in `figure.frame.frame--photo`. If captures are missing, draw the actions in the game's visual style. Keep the stills complete, labelled in the file comments and legible in one column on a phone.

**CAD or render frame.** Show the client's CAD view in the product's split frame (`frame--split`) or across the section. Without it, build a dimension or exploded drawing of the same parts. Use dimensions the brief supports.

**Key art.** Fill the dealt hero with the game's own art or its built world. Record the expected client file in the slot comment.

**Mistakes.** A slot the brief names and the page leaves out; an empty, grey or black frame; a
play button that does nothing; a `<source>` pointing at a file that is not there; a caption saying
the file is coming; one stand-in photograph in every slot.

# Price and questions

## pricing-three

**Job and use.** Software: three plans side by side, the middle one recommended, an optional
monthly or yearly switch.

**At 1440.** `.section-head` on the left line: "Pricing", one grey line, and the switch (two
`role=tab` buttons). 48px below, three `.card.card--plan.span-4`, the middle `.is-featured` with a
"Most popular" `.badge`. Each: the name, who it is for, the `.price` with "/month", a billing line
in both modes, a full-width button (`.btn--primary` only in the middle), 5 to 7 lines of what it
includes. From 1024 each card is a subgrid of its rows so buttons and lines align. If both billing periods are offered, each tab uses `aria-controls` to show its matching `role="tabpanel"` with the correct price and billing line. With one period, omit the switch.

**At 390.** One column in plan order.

**Copy.** Example, Rotaro: "Priced per restaurant. Try any plan free for 14 days."; Team: "For
restaurants with 15 to 50 staff", €59/month.

**Visual and motion.** Keep the plan still with an ink border. Its button changes colour on hover.

**Mistakes.** Cards that change height on the switch; a saving that does not match the prices; plans
for something that is no subscription (a product, a place).

## pricing-two

**Job and use.** A free and a paid plan, or two fixed prices for a service; what both include said
once.

**At 1440.** `.grid`: on `span-4` the h2 "Pricing", a grey line, what every plan includes and a
`.link`; on `span-4 start-5` and `span-4 start-9` two `.card.card--plan` (name, who for, price,
button, 5 to 7 lines), the recommended one `.is-featured`.

**At 390.** One column.

**Mistakes.** Buttons at different heights; the every-plan list repeated in the cards.

## comparison-table

**Job and use.** Plans or models, or the product against how the job is done today, row by row.

**At 1440.** `.section-head`, then rows of `.grid` with `role=table` and its roles: the feature on
`span-4`; two options on `span-4 start-5` and `span-4 start-9`, three on `span-2`. A header row on
`--g-main` with each option's name, price and a button (`.btn--primary` only for the recommended).
Group headings in `.t-label`; 48px rows, each closed by a 1px rule; a check with an `.sr-only`
"Included", a grey dash ("Not included") or a short value. Keep this table in flow.

**At 390.** Each option as its own block of rows; never sideways scroll.

**Mistakes.** Sideways scroll on the phone; columns off the grid.

## faq

**Job and use.** Answer the buyer's questions about price, terms or use. Put a short set with the subject that raised the questions.

**At 1440.** The page's split: on the left the h2 "Questions", a grey line and a `.link` to
`#contact` (a `mailto:` or `tel:` only with an address or number the brief gives); on the right
one `.faq__item` per question with an h3, answer and closing rule. Keep answers open for this recipe. For a folding FAQ see `system.md`.

**At 390.** One column.

**Copy.** Questions in the buyer's words, at most 60 characters; answers under 50 words, starting
with the answer. Example, Ferrow: "Can I cancel at any time?" "Yes. Cancel in Settings and you are
not billed again."

**Mistakes.** Questions written for the seller or answers that evade the question.

# Closes

The close is row 1 of `footer.closing` (`layout-v4.md`), on the footer's own ground, never a band of
its own. It asks for the main action once more, word for word.

## close-type

**Job and use.** A final reason to act. Omit a repeated action when the same decision is directly above.

**At both widths.** Set the action immediately under its offer, at the width of its label. Put eligibility, price or other conditions in body-size `.terms` beside it.

**Copy.** Example, Rotaro: "Plan next week's rota in ten minutes" / "Start free trial" / "Free for
14 days. No card needed."

**Mistakes.** A second button; the big button anywhere else on the page; a ground behind it.

## close-photo

**Job and use.** The close for a place, a product or a service: the main action beside a photograph
of the place or the product in use. One of the closes `start.mjs deal` deals.

**At 1440.** `.closing__cta.close--photo`: a head row (the h2 of at most eight words, one line such
as "Open today 7:30 to 16:00", the main action), then the client's photograph down to the links,
from line to line. Keep the action and text clear of the subject. A place can use a square crop on five columns with the words beside it.

**At 390.** The words and the full-width button, then the photograph.

**Copy.** Example, Fenn: "Book a Saturday wheel class"; "Three hours, €65, clay and firing
included."; "Book a class".

**Mistakes.** Repeating the hero crop or losing the action against the picture.

## close-word

**Job and use.** The h2 and the button, then the client's name set across the `.wrap` in the display
face only when the quiet plan also deals a large wordmark. Otherwise show the heading and action alone.

**At 1440.** `.closing__cta.close--word`: the h2 and the button on one head row, then the name as
one line. The shared script fits its font size to the real name and font. Very long names wrap.

**At 390.** The head stacked; the name across 342.

**Mistakes.** The name larger than the page can hold at 1024; the name repeated in a footer
wordmark.

## close-split

**Job and use.** Any kind with a photograph left to show: the main action on a tinted panel with
the facts that decide it, beside a photograph.

```html
<div class="closing__cta close--split">          <!-- data-side="end": the panel on the right -->
  <div class="close__panel">
    <h2 id="close-h">Order a cake</h2>
    <p class="t-lead">Two days' notice, collected from the counter.</p>
    <dl class="close__facts"><div><dt>Notice</dt><dd>2 days</dd></div><div><dt>From</dt><dd>£28</dd></div><div><dt>Reply</dt><dd>Same day</dd></div></dl>
    <a class="btn btn--primary" href="#order">Order a cake</a>
  </div>
  <div class="close__media"><img src=".." alt=".." loading="lazy"></div>
</div>
```

**At 1440.** The panel on span-6 (the tinted ground, 48px inside, the button at its foot), the
photograph on the other six, both down to the links. **At 390.** The panel, then the photograph
(200px at least), the facts one under another.

**Mistakes.** Facts the brief does not give; the hero's photograph; a fourth fact.

## close-form

**Job and use.** The full booking form at the close. A hero booking bar carries its choices here. For an on-page shop put the order pad within the first three sections and keep delivery and returns at the close.

```html
<div class="closing__cta close--form">
  <div class="section-head"><h2 id="close-h">Book a room</h2><p>We reply within a day.</p></div>
  <form class="form close__form" ..> the booking-form fields (starter.html, booking-form) </form>
</div>
```

**At 1440.** The head on five columns (the h2 up to 88px), the form on the tinted ground on the
right six, as tall as the row; the links row starts 128px under the form. **At 390.** The head,
then the form full width, then the links.

**Mistakes.** Asking for the same details twice or dropping a date chosen on the hero.

# Compositions

A composition arranges photographs with words. The PLAN suggests one where that is the material. For steps, specs, comparisons and controls, choose the form in `compose.md`. Keep the text on the wrap lines and choose a crop that shows the claim.

- **split-7-5, split-5-7, split-6-6**: the words and one picture.
  `<div class="wrap grid grid--top"><div class="span-7"> h2, lines, rows or a link </div><figure class="pl-photo span-5"><img ..></figure></div>`
  (5/7: `span-5` and `span-7`; 6/6: `span-6 start-7`). The picture runs to the foot by itself.
  Match the two columns to the actual copy. For a coffee counter, put “At the counter”, a line about the neighbour bakery, the espresso and filter prices and the hours on the text side. On the picture side crop a pour to that block's height. For a visit, use the address and weekly hours beside the entrance. For a booking, use the stay dates, guests and room beside its price, breakfast and cancellation terms. If the brief has only one line, use one compact row; never stretch a short line beside a tall portrait.
- **mirrored**: a split with `.grid--mirror` on the grid: the picture on the left at 1024 and up,
  the words still first in the markup. Once a page.
- **list-tall**: a list (menu rows, prices, hours, services) on span-6 or span-7 beside one tall
  photograph: the split markup with `.rows` in the words' column.
- **bleed-panel**: the photograph is the section's layer, the words on a solid panel of the page
  ground in its lower corner. Once a page, never right after the hero.
  `<section class="section comp-bleed" [data-corner="end"]><img class="layer" src=".." alt=".."><div class="wrap"><div class="comp-panel"><h2>..</h2><p>..</p><a class="link" href="#..">..</a></div></div></section>`
The new photo compositions are shown at both widths in `assets/layout/compositions.html`.

- **edge-split** puts the words on five columns and the image on the remaining width to the screen edge. Repeating the section reverses the side. On a phone the photo leads.
  `<section class="section edge-split"><img class="edge-photo" src="counter.jpg" alt="Bread on the counter"><div class="wrap"><div class="edge-copy"><h2>The morning bake</h2><p>...</p></div></div></section>`
- **colour-half** uses the same markup with `class="section colour-half ground-brand"`. Put a heading, a short list and one action in .edge-copy. Use at most twice. Keep the ground’s own text colours and check for 4.5:1.
- **near** uses a .near-stack inside the section’s .wrap. One to three .frame--near figures each hold an image and a div with a heading and action on the calm corner. The inset and gap are both 8px. Set --photo-ink to the ink that reads on the crop.
- **item-row** places three to five named dishes, rooms, goods or projects inside the wrap. Use a shared ratio for goods that a buyer compares. Add .stagger for editorial pictures to align their tops and step their captions. On a phone swipe the row from the wrap line. Once per page the season’s item may take .ground-brand on its li.
  `<ul class="item-row"><li><img src="loaf.jpg" alt="A seeded rye loaf"><div class="item-caption"><strong>Seeded rye</strong><span class="fact-line">Wholemeal with sunflower seeds</span><span class="price">£4.80</span></div></li><!-- two to four more items --></ul>`

- **offset-pair**: two photographs of one subject on seven and five columns, tops on one line.
  `<div class="grid comp-offset"><figure class="media span-7"><img ..></figure><figure class="media span-5"><img ..></figure></div>` after the head.
- **three-up**: three photographs on span-4, one height, filling the row.
  `<div class="grid comp-three"><figure class="media span-4"><img ..></figure> x3</div>` after the head.
- **strip, wall, story, row, side**: a strip groups process details, never under a price list. A wall holds a set, a story pairs a picture with prose. For a row of rooms or rooms beside a heading see `sections.md`, Rooms.
- **street-large**: the supplied street as the visit's h2, set large (`.type-moment`, sections.md section
  4), then the split of the panel and the photograph.
- **form-photo, form-band**: the heading and booking form together in a seven-column block beside a five-column photograph that takes the form’s height (booking-form), or on a tinted
  band across the section. Use the left five columns for the heading and the terms the guest needs before booking. Put the form on the right seven. For **close-form**, see above.
- **Statement.** A text moment rides on an existing h2 or the close heading. Only a single sentence that carries the page's main claim may stand alone in `<section class="section statement section--thin">` with `.statement__text`. Use it at most once. Keep the moment host from its recipe.
- **Grounds.** Put the PLAN's ground class on the section itself (`layout-v4.md`).

# Footers

Row 2 of `footer.closing`: the directory on one ground and the legal row (`system.md`).

## footer-columns

**Job and use.** The quiet footer on the base ground: the company in one plain line, the sitemap,
the legal row. Software, products, services.

**At 1440.** As `starter.html`: the company block on `span-4` (the logo, then `p.footer__lede`, one
line of at most eight words in the display face at 28px), four `.footer__col.span-2` named and
ordered as the nav, each link a section of the page and Contact `#contact`; the newsletter field
(once, "Subscribe") when the page has one; then `.footer__legal`: the brand and year, Privacy, Terms
(an Imprint only when the brief gives the company's own details), the empty `.socials`, the credits
line last.

**At 390.** Columns two-up, the legal row stacked.

**Mistakes.** Columns that differ from the nav; links to pages the build does not have; drawn or
coloured social icons; effects in the footer.

## footer-dark

**Job and use.** A dark ground for the company name and link columns.
Software and product (the one dark band at the end).

**At 1440.** `footer.closing.footer--dark.ground-inverse`: `.grid` with the company block on
`span-4` (the mark and name at the item-title size), four `.footer__col.span-2`, the legal
row. On a dark page system.css keeps it a step darker than the page with a hairline on top.

**At 390.** Keep the normal name size and set the columns two-up. Only a dealt large wordmark spans the footer.

**Mistakes.** A second dark section right above it.

## footer-visit

**Job and use.** A place's or a local firm's footer: where it is, set large, with the way there
and the hours, so a visitor needs nothing else.

**At 1440.** `footer.closing.footer--visit` as `starter.html` (`links-visit`): on `span-7`
`address.footer__address` (street and district on two lines, the district alone when the brief names no street, 32/40 on a place, 48px elsewhere, in the
display face), one line on the way there (the stop, minutes on foot) and `a.link` "Get directions"
(the OpenStreetMap search, `copy.md`; "See the area" with a district only, none with a town only); on
`span-4 start-9` "Opening hours" over `dl.hours` with
`data-tz` (system.js marks today). Then the nav row (the logo, the nav's words, Contact), the legal
row with the credits line last; a wide name is optional only when the PLAN deals it. No button.

**At 390.** The address at 24 to 30px, the hours under it, the nav row wrapping.

**Mistakes.** Hours that differ from the visit section; today from the visitor's clock; a map in
the footer; a printed email or phone the brief does not give.

## footer-statement

**Job and use.** The close and the footer as one designed slab on the page's lit ground (sand, sky,
sage or painting): one big line, one full-width button, then the columns (Figma's close and footer).
Tech only.

**At 1440.** `footer.closing.footer--statement`: system.css insets it 8px from the window's sides
and bottom with `--r-lg` corners. The close as close-type's, 96px to the columns, the legal row.

**At 390.** Full bleed, square corners.

**Mistakes.** A second big button; an effect on it.

# Page plans

These sketches start with the content. Keep the frame printed for the actual brief.

## Software

An invoicing tool can show the open invoice beside the client thread. Give the visitor a switcher for disputed, due and paid invoices. Use a pricing meter only when the supplied rates support different outcomes. If a text moment is dealt, put it on the heading that explains the invoice.

## Product

A desk shop can put the configurator second. Size and finish change the desk drawing and the quoted price together. Put the measured height range beside a dimension view and the delivery and return terms at the close. A photograph of wood belongs with the finish it shows.

## Gaming

A sailing game can use its trailer in a film hero when the file exists. A tide switch can show what becomes reachable as the water falls. Draw the harbour if there is no supplied art. Give each devlog post its date and picture. Make the press kit a file link with its size.

## Place

For a pottery studio, put class times on a week strip. Use a photograph pair to show the workshop and a student's work where the brief supplies both. Give each class its fee and booking controls. Put opening hours and access beside the address.

## Service

For a clinic, match each treatment to the stated fee. Show the steps from check-in to follow-up, the people named in the brief and answers to patients' questions. Put the enquiry fields where the visitor can act.

Keep a project caption inside its own figure. Use a column sized for both menu name and price so they share a row.
