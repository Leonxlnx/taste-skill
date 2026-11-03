# Sections

A page is built from its kind's plan; a deal changes the parts a template would fix. Every id has a
recipe in `sections-library.md`. The kind and what it may carry: `SKILL.md` sections 1 to 3 and
`effects-usage.md`. Heights and edges: `layout-v4.md`.

## 1. Plan in screens

Write the plan before building: line 1 the kind, line 2 the deal, then one line per section: its
id, its one idea, its picture, its screens (1 or 2, from the content height: `layout-v4.md`
section 2) and, on tech, the section that holds the effect, the scene or a moment.

- **Every section shows the real thing:** a photograph, a portrait, real icons, the client's UI, a
  diagram card or (tech only) the effect. A section without a picture is allowed only for a price
  list, an FAQ, a specs table, a booking form or a dealt statement moment's own section, once each,
  and two picture-less sections are never neighbours. A quote needs a face or merges into the section above. The picture takes a real share:
  half a tile or more, 50/50 in a split, a whole screen as a layer. The close is its own picture (a
  photograph, the big button or the name set wide).
- **One idea per section,** one h2, one action at most besides the main one (a pair only in the
  hero, or where a product needs "compare" beside "buy"). A two-screen section holds one list, table
  or form, or one idea in two groups, never two ideas.
- **The main action** reads the same, word for word, in the nav, the hero, the close (or the
  booking) and the phone bar, and nowhere else as a filled button.
- **Merge short blocks:** a quote, logo row, stat row or FAQ that alone would hold under 495px (464
  at 390) goes into the section above as its last element, 64 to 96px under its content, with no
  heading or ground of its own. An FAQ that reaches 495px with its answers open is its own section.
- **Repeats:** a card layout (2x2, bento, three cards, split card, open tiles) at most twice a page;
  neighbours never share a layout; on software, product and service a calmer section (quote, prices,
  FAQ) after at most two visual ones, and the back third of the page calm before the close. Repeat
  the section scaffold (head, padding, ground logic) so it is learned once.
- **Proof as small exact objects,** only from the brief: a named quote with a face, a footnoted
  figure, press lines, a rating line, real customer logos with permission. No row of big stat
  numbers, no filler stat strips, no check-icon lists, no customer-logo wall.
- **Two boxes deep at most:** a card and its picture panel, or a panel and its UI. A card whose
  panel holds UI drops its box (`.card--open`) or runs the panel flush (`.panel--flush`).
- **One page, real links:** every nav word, button and footer link goes to an `#id` on the page (the
  main action to the booking form, the order section or `#contact`), the logo to `#top`. Privacy,
  Terms and Imprint go to small pages you write (Imprint only when the brief gives the company's own
  details), or are left out. Never `/contact`, `/[page]` or a bare `#`.
- **At 390** the page keeps the desktop's grounds, photographs and order, each photograph after
  its text.

## 2. The deal

Deal the parts a template fixes from your kind's lists, never by taste:

```bash
node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" "<nav>" "<footer>" "<close>" "<rhythm>" "<buttons>" "wordmark|initial|arc|ring|stack|dots"
```

The hero comes from `assets/layout/deal.mjs` and the pairing from `start.mjs` (`layout-v4.md`),
never from this line; a place takes the place hero. Write the results on plan line 2 and in the
comment at the top of `<body>`, and build exactly those. Deal one part again only when its recipe's
"use" does not fit (a photograph close with no photograph left to show).

- **Nav** (one fixed, opaque bar on the `.wrap`; `system.md`): `nav-mega` (link columns and one
  picture card in the panel), `nav-cards` (three or four picture cards), `nav-centre` (the words in
  the middle), `nav-split` (the words left, the name in the middle). `nav--tone` puts the bar on the
  inverse ground (tech only).
- **Footer** (`footer.closing` row 2): `footer-columns`, `footer-dark`, `footer-statement` (the lit
  ground, tech only), `footer-visit` (a place or a service with a door).
- **Close** (`footer.closing` row 1): `close-type` (the h2, a line, the big button across the
  `.wrap`), `close-photo` (the head row, then the client's photograph down to the links),
  `close-word` (the h2 and the button, then the name set across the `.wrap`).
- **Rhythm:** `dark-band` (one `.ground-inverse` section at the page's middle or later, holding the
  strongest visual), `media-band` (one full-width photograph layer section mid-page, never on a
  place), `surface-pairs` (one `.ground-surface` band of one or two sections), `space` (one ground,
  sections parted by space only), `brand-band` (product: one section in the brand's own colour,
  `.ground-brand`, in the second half). No hairline rhythm.
- **Buttons** on `<html data-buttons>`: `solid`, `pill`, `tonal`, `arrow`, `block`.
- **Mark** beside the name in the nav and footer (`system.md`); a client's own logo replaces it.

## 3. The plans

Optional parts in brackets; each list is the order on the page. Tell it as a story: say what it
does, show it, prove it, let people explore. Tabs only on software, click only.

**Software** (and AI, developer tools, fintech). nav, hero, [logo-row docked in the hero],
two or three feature sections in different layouts (features-2x2, bento, split-text-left,
tabs-tour, chapter, steps), [integrations as a `fanin-warehouse` or `hub-tools` diagram card;
integrations-grid only for 9 or more tools the brief lists],
[quote-stat (a quote the brief gives) or customer-proof-row (customers the brief names); with
neither, the calm section is pricing or the FAQ], [pricing-three, pricing-two or
comparison-table], faq, footer.closing. Pictures:
the client's screens as live HTML, else fragments from `assets/ui` rewritten to its names, each
showing the product's own subject (`cards.md`, The fragment on it: a code-review tool shows a red
and green diff with its Accept action); diagram cards for how things connect; real icons for the
tools it works with. The effect, moments and scene as `effects-usage.md` deals them.
Nav `nav-mega|nav-cards|nav-centre` · footer `footer-dark|footer-statement|footer-columns` · close
`close-type|close-word` · rhythm `dark-band|surface-pairs|space` · buttons `solid|pill|tonal|arrow`.
Never: stock people at screens; an object render in place of the product.

**Gaming** (a game, a studio launching its game; page type software, site-kind gaming). nav, hero
(the game), the world (one or two sections), how it plays (a split or a 2x2 of play), [a system of
the game as a diagram card: matchmaking, saves, stores], platforms and editions (the real store and
platform icons, prices from), [press lines or a quote the brief gives], [faq], footer.closing with
the main action (Add to Steam wishlist, Pre-order). The page shows the game itself on every
screen: its trailer (a film hero), key art and in-engine shots, full bleed as layers or on the
column lines, one grade. Deal the hero with `deal.mjs --type software --kind gaming --has
film,photo` when the art is supplied.
- **No art files** (the brief names art it does not supply): the `statement` hero (`deal.mjs
  --type software --kind gaming --hero statement`), built with the effect as its full-bleed
  layer, composed as key art (`effects.mjs pick --page gaming --palette dark --slots hero --exclude
  ruled-grounds,grid-pulse,contour-lines,dot-terrain,dotted-globe,ridgeline,bayer-dither,halftone-screen,ascii-shade,line-engraving,duotone-grade`,
  again until it reads as a terrain, water or light), the words on its calm part. The plan
  becomes: hero; one section holding the dealt moment (a text moment gets a statement of its
  own); how it plays as a lanes or sync diagram card of the loop (`lanes-matchmaking`,
  `sync-saves`); platforms with the real store icons; [faq]; footer.closing. No section promises pictures it cannot show; the report names the
  art to replace.
Nav `nav-mega|nav-centre|nav-cards` · footer `footer-dark|footer-statement` · close
`close-word|close-type` · rhythm `dark-band|media-band|space` · buttons `solid|pill|block`.
Never: UI fragments from `assets/ui` (no UI kit on gaming), a dashboard, SaaS widgets on panels,
a toy object or an empty panel in place of the world, stock players at screens.

**Product.** nav, hero, the range or line-up within the first three sections, two or three feature
sections (one benefit each, text beside one big photograph on the page's split; photo-pair; bento),
[media-band], specs (`rows--spec` or comparison-table), proof (a review or press line the brief
gives), [visit-map for a showroom], [faq, five questions at most], footer.closing with the
newsletter. Every main section shows the product, two or three photographs a screen (one per
feature section of the part it names; a grid of 4 to 8 cut-outs on one backdrop). Prices are "from"
prices on cards or in a table, never a plan table or a monthly switch. A technical product (site-kind
tech) may take its render or the effect; any other product takes none.
- **No photographs:** a picture the brief gives (a render, a CAD view, a cut-out) goes on the
  hero's stage. Else an other product works down the shot ladder (`photos.md`: the client's shoot,
  a phone shoot, the products on one plain backdrop), then the short page (under 8 photographs: 3
  screens, 2,700px at most at 1440; the hero `deal.mjs --type product --hero statement` on
  `.ground-brand`; the specs as `rows--spec` with the real colour icons of the component brands the
  brief names, or the one still diagram), never an object render or a drawing (MO-08, PH-07). A
  technical product (hardware) shows its object only when `assets/objects` or `fx-dither-object`
  holds its own kind; else the `split` hero (`deal.mjs --type product --hero split`): the client's
  order form as live HTML (model, options, delivery slot, price) in the frame on the effect's lit
  ground, the specs as `rows--spec`, how it moves as a lanes diagram card. Renders the brief names
  but does not supply count as missing; the report lists them. Never `hero-product` without the
  object, a drawn SVG or a model built of primitives. Never a stand-in product, mood stock or an
  object of another kind; write the weak case in the plan and the report.
Nav `nav-cards|nav-split|nav-mega` · footer `footer-columns|footer-dark` · close
`close-photo|close-type|close-word` · rhythm `media-band|dark-band|surface-pairs|brand-band` ·
buttons `arrow|solid|block|pill`.
Never: a photograph of something else; screens of an app the product does not have; logo rows;
tabs; anything that apologises for what is missing.

**Service** (clinics, firms, agencies, studios, trades). nav, hero, services-list (each with one line
and a price from; a peek-list when each service has its own photograph), work (a grid of 3 to 6
project photographs, or photo-pair, one per case), steps, people-row, proof (a quote the brief
gives), [pricing-two or a `rows` price list], [faq], booking-form with the address, footer.closing.
Pictures: photographs of the work, the team at work and the rooms, one or two a screen; real icons
for tools a studio really uses.
Nav `nav-mega|nav-split|nav-centre` · footer `footer-visit|footer-dark|footer-columns` · close
`close-type|close-photo` · rhythm `surface-pairs|dark-band|space` · buttons `solid|tonal|block|arrow`.
Never: product UI the firm does not run; stock handshakes; logos of invented clients; tabs.

## 4. Place

Cafes, bars, bakeries, restaurants, guesthouses and small hotels, shops, bookshops, florists, bike
shops, local studios (pottery, yoga; a creative agency stays service; a maker people visit who
also teaches or sells online stays a place). `<html data-type="place">`,
`<meta name="page-kind" content="place">`, place CSS under `html[data-type="place"]`. Real still
photographs, type and flat colour carry the page; the interface around them is one ground, one ink,
hairlines and one button style. Where a recipe and this section differ on a place, this section
wins. Open these references first for the feel (never copy one): Daunt Books, Prufrock, Bourke
Street Bakery, Gail's, Tartine, Bonanza (a still where Bonanza has film).

**Never on a place:** an effect, WebGL, canvas, CSS gradient, grain, glass, print, scene, moment,
loop, count, UI fragment or diagram; feature or plan cards, tabs, accordions, switches, logo rows,
timelines, fact strips (address or hours as labels), a calendar card, a map of a street the brief
does not give; a rating, review, figure or quote the brief does not give; words on a photograph, a
rounded or filtered photograph, a see-through or blurred nav; outline, pale, blurred or rotated
display type; SaaS furniture (a two-tone headline, a filled-plus-outline pair, a dotted timeline
rail, a carousel); a dark section except the one brand band.

### Plan and length

The nav is not a screen; `footer.closing` is one; a 2-screen section counts two.

- **Full page,** 12 to 20 photographs, 2 to 3 a screen, at most 6 screens: hero, visit, the offer
  (a second offer may follow: a roaster's beans after the menu), the place, then orders or booking
  when taken (last before the footer, its cards or form in place of the close), footer.closing.
  Over 6 screens drop the place, never the booking.
- **Compact page,** 8 to 12 photographs, 4 or 5 screens: hero, visit, the offer, [the place],
  footer.closing.
- **Short page,** under 8 usable photographs (below): 3 screens, 2,700px at most at 1440,
  `<html data-page-mode="short">`.
- **No client photographs (the draft path):** `photos.mjs pick --trade <trade> --sections <the
  plan's sections> --draft-lead --pictures 8` deals a lead and a detail for every section that is
  not text (the 1-in-3 cap lifts for a draft), and the page is a whole place page that leads with
  photographs at the length the frames allow (8 to 12 the compact page, more the full page), never
  the short page. Every frame is listed in the report as a stand-in to
  replace; nothing on the page says so. Under 8 frames dealt (a thin trade), the short page.

These three names mean only these lengths everywhere in the skill.
- **Photographs by section,** all distinct: hero 1; visit 1 (0 with a map); menu or prices 1; rooms
  2 to 6; goods 4; the place 3 (row), 1 (story) or a wall; orders 2 or 3, or booking 1; close 1. Nav
  panel photographs do not count.

### The deal

Never by taste; the hero and the splits are never dealt, the close is always `close-photo`:

```bash
node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" "nav-split|nav-cards" "footer-visit|footer-columns" "surface-pairs|space|colour-band" "block|solid|arrow" "dots|arc|ring|petal|leaf|stack" "row|wall|story" "row|side"
```

Read them in order: nav, footer, rhythm, buttons, mark, the place, the rooms layout. Rhythm:
`surface-pairs` (the offer on one full `--g-alt` band; the visit section on the page ground with its
panel on `--g-alt`), `space` (one ground throughout, sections parted by space), `colour-band` (the
close on `.ground-brand`, a flat fill in the place's own colour; then the footer has no name across
it).

### The sections (1200 column, x 120 to 1320)

- **Hero:** the place hero (`layout-v4.md` section 3). What, where and one fact: h1 "Bakery on Mill
  Street, Leith" (40 characters at most); sub-line "Sourdough, rye and cardamom buns from 7:30,
  Tuesday to Sunday." (80 at most); one button, the main action.
- **Visit, always screen 2,** marked `data-place="visit"`, directly after the hero: a panel on
  `--g-alt` (a card, 48px padding) and a 1:1 or 4:3 photograph of the shopfront straight-on or the
  room from the door, 6/6, the panel left. Top line "Visit" at 13px muted, the open-now line
  (`[data-open-now]`) at its right; 16px below, two columns 24 apart: the address on two lines at
  20/30, linked to the map search, the phone as a `tel:` link only when the brief gives one, then
  one secondary button: "Get directions" when the main action is something else, "Call" only when
  the brief gives a phone, else none; and
  the week's hours (days left, times right in tabular figures, one line per day or range, one size;
  a holiday change as one line above). Under both, at most two 44px rows: access, a florist's
  delivery (area, price, cut-off), a guesthouse's check-in and check-out, a bike shop's repair
  turnaround, or "By appointment" for a studio. At 390 the panel first (24px padding, address
  18/28), then the photograph at 342. Hours, address and directions are never only in the footer.
- **Map** only when the brief gives the street: `fx-map` baked still (`effects-creative.md`) in the
  photograph's frame, the pin on the street line; never an embed, a contour or a dot pattern.
- **The offer** opens with a head row: the h2 on the left line, one line, 40 characters at most
  (32/40; 24/30 at 390); at its right, on its baseline, one 16px line and a link ("Full menu", "See
  all"); 56px to the content.
  - **Menu or prices** (drinks, a bakery counter, repairs, bouquet sizes, classes): two open groups
    on span-4 and one 1:1 photograph on span-4 (384x384), or three groups on span-3 and the
    photograph on span-3 (282x282), its top level with the group labels. A group: a 13px label, a
    1px ink rule 12px under it, then rows: the name at 16/24/500 left, the price right in tabular
    figures, an optional description at 14/20 muted; rows 44px (56 with a description), at most 6
    with descriptions or 8 without, the rest behind the head row's link. Always text, whole, prices
    visible: never an image, a PDF, tabs or an accordion. At 390 one column, the photograph 342 after
    the first group.
  - **Rooms:** h2 "Rooms and prices", the side line "Breakfast 8 to 10. Check-in from 15, check-out
    by 11." Each room: a 4:3 photograph of the whole room, straight-on, window light; 20px; the name
    (`h3.t-card`, 20/28); the facts at 14/20 muted ("2 guests · 18 m² · garden side"); the price
    from with its season at 16/24; a "Book this room" link. `row`: three rooms on span-4 (384x288)
    or four on span-3 (282x212); two rooms always `side`. `side`: the head as the first cell at the
    left line, top-aligned with the tiles (two rooms span-4; three span-3; four: rooms 2x2 on span-4,
    `--h: 2`). Five or six rooms: rows of three on span-4 in a two-screen section. At 390 one column,
    342x256, 48px apart.
  - **Goods** (beans, bread, books, parts, bouquets): four linked cards on span-3, 1:1 at 282x282
    (bouquets 4:5 at 282x352), one ratio per grid, one backdrop, angle and light. Each card a flat
    fill one step off the ground or a 1px hairline, no shadow, radius or pill; inside its padding
    under the photograph only the name (a two-line slot, 16/500) and the price; an outline Add
    button aligned across the row where it sells online. One or two full rows. At 390 two-up at 165,
    four or six, then a full-width button to the range; no swipe row.
- **The place** (dealt): `row` (the head row, then three 1:1 photographs on span-4), `wall` (the
  head row, then a wall of photographs from line to line, gap 0 or 2px) or `story` (6/6, text left:
  a 13px label, the h2 on one or two lines, three to six lines at 20/30 on who runs it, since when
  and what exactly, one link; a 4:3 photograph of people at work right, 588x441). At most two story
  rows a page. No names under the photographs. At 390 `row` and `wall` two-up, `story` text first.
- **Orders** (cakes, a bike service, weddings, classes): three kinds on span-4 under the head row,
  or two beside the head in the first span-4. Each: a 4:3 photograph of this business's own goods
  (384x288), a 1px hairline, a 13px label, the title at 20/28, one or two sentences at 16/26 with the
  lead time, where to collect and the price from, one text link with an arrow. A florist's events
  kind says what to send: date, venue, guests, budget.
- **Booking** (rooms, or classes with dates): the head row ("Book a room"; "We reply within a
  day."), then a 4:3 photograph on span-6 (588x441) and beside it the form on `--g-alt`, the same
  height, 48px padding: arrival and departure on one row, guests and name on the next, email, the
  main action, the reply line at 14px. Text fields, not `type=date`, on a page not in English. Never
  a photograph, texture or glass under the form. A booking system the brief names replaces the form.
- **Close:** `close-photo`: the h2 (eight words at most), one line ("Open today 7:30 to 16:00"), the
  main action, a 1:1 photograph never used above and never with words on it. On `colour-band` it
  sits on `.ground-brand`, the words at 7:1 (4.5:1 for the h2 and labels, `system.md`), the button inverted.
- **Footer:** `footer-visit` (the address at 32/40 on span-7 with one line on the way there and Get
  directions, the hours from the split line with today marked, the nav row, the legal row; then the
  name set wide across the `.wrap` in the display face at 400, except on `colour-band`) or
  `footer-columns` (Visit, Contact as given, the nav's words, delivery or check-in or the
  newsletter; the legal row).
- **Phone bar** (`nav.actionbar`, required): the order or booking as one full-width button; without
  either, Get directions (primary) and Call (secondary, only with a phone the brief gives).
- **Notice line** (a florist's delivery cut-off, changed or holiday hours): one still 14px line with
  a number above the h1 (`layout-v4.md`), repeated where the fact belongs; never rotating.
- **Splits** 6/6, text left, top-aligned, never mirrored; on a phone the text first.

### Order by trade

Each starts hero, visit; the rest in this order, 4 to 6 screens:
- **Cafe:** menu as text with one photograph; the place (a story row); beans or goods only if sold.
- **Bakery:** what it bakes (goods with prices); orders (one card per kind); the process (one row of
  three photographs, one screen at most). Several shops: a ruled list, each with its street.
- **Guesthouse or small hotel:** location as the visit (how to arrive, two or three stills of the
  street it owns); rooms; the house (shared spaces and breakfast as a row of stills, no labels);
  booking. Check-in and check-out beside the rooms and in the footer.
- **Shop or bookshop:** new in (goods with Add); categories as a plain text list; one story row; the
  footer with each shop's address and hours and the newsletter. Nav: four to six category words (`system.md` Nav; four on nav-split).
- **Bike shop:** visit and workshop (usual repair turnaround); workshop prices as ruled rows with
  "Book a service"; new in (cut-outs on white, name and price); brands as a plain text list; story.
- **Florist:** a notice line with delivery area, cut-off and price; delivery and visit as screen 2;
  bouquets (four 4:5 tiles, each with a price from); weddings and events (three photographs of real
  installations, what to send); workshops as ruled rows.

### Look

- **Grounds:** the page ground from the place's walls, paper or shopfront: warm off-white by default
  (`#F7F3EC`; white for a shop that sells mostly online), the surface one step darker (`#EDE6DA`),
  ink `#2A2622`, muted `#665E55` (5.8:1 on the ground), hairline `#DAD3C8`; then
  `start.mjs brand --bg #F7F3EC --surface #EDE6DA --ink #2A2622 --muted #665E55 --accent <hex> --type <pairing>`.
  One full surface band at most; one brand band (`backgrounds.md`); no dark section except that
  band (the nav bar may take the dark ink). Flat colour only (`backgrounds.md`).
- **Accent:** one, from the place (the shopfront paint, the tiles, a bag label) on the primary
  button, the focus ring and the `colour-band` close; darken it in steps until its label passes
  4.5:1 and it passes 3:1 on both grounds.
- **Type:** a pairing from `start.mjs deal --page place`, display 400, text 400 and 500: a serif head
  with a plain sans for a bakery, roaster, guesthouse or bookshop; one plain sans in two weights for
  a shop, bike shop, florist or studio; a soft sans for a cafe. Sizes in `layout-v4.md` section 5.
- **Motion:** the hover layer only (`motion.md`): the nav words underline, a linked photograph zooms
  1.02 inside its frame, buttons step and press. Nothing moves by itself, on load or on scroll.

### The short page (under 8 photographs)

Under 8 usable: three screens, 2,700px at most at 1440: hero, one `--h: 1` section holding the
visit and the offer, footer.closing. With one or two good photographs, the best is the hero's and
the other sits in that section, the menu or prices as ruled text beside it and the visit panel
under both. With none, the hero is a statement on `.ground-brand` (`deal.mjs --hero statement`: the
h1, the sub-line, the inverted button), and the section is the visit panel across the `.wrap` in three columns (address,
hours, access; a phone only when the brief gives one) over the menu as ruled text in two or three
groups; either the brand band or the name set wide in the footer, not both. No mood stock, code
ground, drawing, empty box or note. Any dealt part that needs a picture is dealt again without it
(no photographs: `nav-split` with no panel, the close `close-type`), and the nav words point at
ids on the groups inside the one section. The report lists the shots to take (`photos.md`). At 8
good photographs it grows to the compact page, at 12 to the full page. A place with no photographs
of its own takes the draft path first (Plan and length); the short page is for a trade the library
cannot fill (`photos.mjs` names no trade for it, or deals under 8).

## 5. Visuals

- **UI** (`cards.md`): paste `assets/ui/<name>/fragment.html` into the slot its recipe gives and
  rewrite every name, number, subject and logo, and a loop's arriving text in `data-ui-opts` (its
  `meta.json` `edit`). A pasted `<img src="icons/x.svg">` points at nothing: write each as the
  client's tool, `<img data-icon="<id>" src="assets/icons/<id>.svg" alt="">`, and `icons.mjs scan`
  fetches it. The product UI section shows the product's own subject, never a stand-in
  fragment. `data-ui-load` shows the kit's sample text: drafts only. None on gaming.
- **Diagram cards** (`diagrams.md`): when the point is how things connect; tech 0 to 2 with pulses,
  product and service one held still, place none.
- **Real icons** (`icons.md`): every tool, app or file type the page names, in its own colours; on
  other pages only tools the client really uses.
- **Shader grounds** (tech only): the one effect and the card group's still grounds
  (`effects-usage.md`).
- **Photographs** (`photos.md`): the client's, else `photos.mjs pick`; every `<img>` carries
  `data-source` and `data-subject`.
