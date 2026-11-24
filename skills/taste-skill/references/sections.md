# Sections

Build the dealt frame. Choose each section's form from its content. Read `compose.md` before the first page, then the recipes you use in `sections-library.md`. Edges and spacing are in `layout-v4.md`.

## 1. Plan the sections

Before planning, name what the visitor needs to know before acting and which supplied fact answers it. Give that answer a section high on the page in its natural form: a guesthouse explains what guests get by booking direct and what follows their request, while an integration shows one real example in the existing system. Merge a section with only a heading, a sentence and a picture into its neighbour.

Write the kind, then the frame from the PLAN. Give each section a row with its id, idea, content, form and picture. Include every item the brief names. Mark the hosts for dealt motion and effects. A long menu or list of rooms grows to fit.

**Match each ask to an element.** In `.taste-skill/copy.md`, put every ask under `Asks:` as `- <ask> -> #<id>`. The id must be on the page. The gate checks the block and its targets (`brief-ask`). A contact link cannot take a booking or an order.

  | Brief asks | Element on the page |
  |---|---|
  | book a slot, a class, a table, a repair | the day and the time as choices (`<fieldset>` of radio pills or two `<select>`s), then name and email |
  | a stay (rooms, a guesthouse, a hotel) | arrival and departure as `type="date"` (text fields on a page not in English), guests, and the room as a `<select>` or radio cards with each room's name and price |
  | sell online (beans, bread, goods) | an order form: each item with a quantity (`type="number" min="1"`), the total line, collection or delivery, then name and email |
  | a product | its price (or "from"), the colours as swatches that change the picture |
  | a place | its street and district (the town alone only when the brief gives no more), its hours |
  | a quote, a project enquiry | the type of work as a `<select>`, the budget or size, a textarea across the form |

  The form's markup and errors: `system.md`, Forms; `sections-library.md`, booking-form. Without a
  form service the action stays a `mailto:` on `.example`, but the fields are still the real ones.

**Match the content to a form.** The section can show a rail, comparison, booking bar, chart or working UI as its picture.

| Content | Form |
|---|---|
| Ordered steps with times or handoffs | Numbered rail, week strip or route |
| The product's timeline, diff, board or map | Build that view large in HTML or SVG |
| Several uses of one product | One frame with tabs or a switcher |
| Plans priced by quantity | Slider or stepper above the plans |
| A price argument or two costs | Comparison bars or an itemised receipt |
| A range or spec | Scale with reference points, or spec rows beside a dimension drawing |
| Projects, rooms or goods with facts | Case rows or an index with a fact line per item |
| Two states | Toggle or divider |
| Hours or a schedule | Day bar or week grid |
| A dated stay, table or class | Booking bar on the hero, full form at the close |
| Goods sold here | Configurator or order pad within the first three sections |
| Photographs with words | A composition from `sections-library.md` |

**Show the subject.** Use the client's pictures first, including screens, art and renders. Next build the actual view, draw the product or its world, or plot its data. Start here for a game without art, an unphotographed product or a software claim. Use a stand-in photograph only for what it shows, such as a street, a material, hands at work or a whole room of the right kind. Never use another maker's product, a detail for a whole or mood beside prices. For each photograph write “heading says X, picture shows Y”. A list, table, form or FAQ may stand on type alone. Change ground between two such neighbours.

- **One object cannot show every claim.** Show the whole product in the hero and at most two further sections. Elsewhere show its use, parts, output or setting. A recolour of the whole product still counts as a whole view. A game's crew, tools and world can share one drawing style.
- **Client files.** Reserve slots at their final ratio for promised art, renders, screenshots or films. Use a complete built picture until the file arrives. Name the file in a comment and the handoff report. Show a play control only for a playable source. See `sections-library.md`, client-slots.
- **One idea per section,** one h2, one action at most besides the main one (a pair only in the
  hero, or where a product needs "compare" beside "buy"). A long section holds one list, table or
  form, or one idea in two groups, never two ideas.
- **Main action.** Use the same words in the nav, hero, phone bar and wherever the visitor completes it. For orders put the controls early. For dated stays, tables and classes dock the booking bar on the hero and keep the full form at the close.
- **Merge short blocks.** Put a quote, logo row or short FAQ with the section it belongs to. A text moment rides on an existing h2 or the close. Only the page's main claim may stand alone, once, in a thin statement section.
- **Repeats:** a card layout (2x2, bento, three cards, split card, open tiles) at most twice a page;
  neighbours never share a layout; on software, product and service a calmer section (quote, prices,
  FAQ) after at most two visual ones, and the back third of the page calm before the close. Repeat
  the section scaffold (head, padding, ground logic) so it is learned once.
- **Proof.** Use the brief's named quotes, footnoted figures, reviews or permitted customer logos. A comparison needs comparable numbers and a source.
- **Two boxes deep at most:** a card and its picture panel, or a panel and its UI. A card whose
  panel holds UI drops its box (`.card--open`) or runs the panel flush (`.panel--flush`).
- **One page, real links:** every nav word, button and footer link goes to an `#id` on the page, the
  logo to `#top`. The main action goes where it is done: the booking form's or the order section's
  id, `#visit` (the visit block) for Get directions, or, when the page has no form or booking system,
  a `mailto:` on `.example` (`copy.md`). Never `#contact` from outside the footer: `footer.closing`
  carries that id, and the checker WARNs a link that lands in the footer. Privacy, Terms and
  Imprint go to small pages you write (Imprint only when the brief gives the company's own details),
  or are left out. Never `/contact`, `/[page]` or a bare `#`.
- **At 390** the page keeps the desktop's grounds, photographs and order, each photograph after
  its text.
- **At 768 and 820** (the judges' tablet, held upright) the sections stack and grow; the first
  screen ends on a whole picture or a clear bleed (`layout-v4.md` section 3).

## 2. The deal

Run `node <skill>/scripts/start.mjs plan` with the kind, assets, main action and section count. Count the hero and close. Pass the material the copy actually holds with `--carry`. Record the PLAN in the comment at the top of `<body>`. Its machine copy is `.taste-skill/plan.json` beside the default history.

Build the palette, type pairing, hero, entrance, nav, footer, close, buttons, mark, grounds and density as dealt. A client logo takes the mark's place. An order goes within the first three sections. A booking for a stay, table or class gets the hero bar. The close keeps the full booking form or the shop's delivery and return facts.

- `grounds` lists a ground per section. `alternate` alternates page and tint from section two, with inverse for the strongest picture. `blocks` repeats page, page, tint and closes on inverse. `islands` sets an inverse island and a brand or tint island on the page ground. `calm` changes ground at the main picture and sometimes again at the close. Neighbours may share a ground. Keep non-tech heroes off bands.
- `density` sets `data-density="open|regular|compact"` on `html`. Follow `align` for left headings throughout or centred heads on proof and close. Apply `pictures` to picture corners: square, soft, or soft with one shaped mask.
- `composition` suggests a layout for photographs with words. Use it where it fits. A different form for steps, plans or a central view is part of the plan. Name the own sections. Each `ideas <id>: <line>` is one of four prompts to try or leave. `sub <name>: <why>` names the sub-skill to read (`compose.md`).
- `moment` names the host or heading. Use one, with a second from seven sections. A scene appears about once in three eligible deals and needs content to carry it. See `moments.md` and `scenes.md`.
- **Nav** (one fixed, opaque bar on the `.wrap`; `system.md`): `nav-mega` (link columns and one
  picture card in the panel), `nav-cards` (three or four picture cards), `nav-centre` (the words in
  the middle), `nav-split` (the words left, the name in the middle). `nav--tone` puts the bar on the
  inverse ground (tech only).
- **Footer** (`footer.closing` row 2): `footer-columns`, `footer-dark`, `footer-statement` (the lit
  ground, tech only), `footer-visit` (a place or a service with a door).
- **Close** (`footer.closing` row 1, `system.css` footer.closing): `close-type` (the h2 large, a
  line, the big button at its own width at the row's foot), `close-photo` (the head row, then the
  client's photograph down to the links), `close-word` (the h2 and the button, then the name set
  across the `.wrap`), `close-split` (a tinted panel with the h2, one line, up to three short facts
  and the button, beside a photograph), `close-form` (the full form at the close). Use the form once. When a final content section holds the form or booking panel, pass `--last-section form` and put only `.closing__links` in the footer. If the visit section already gives the hours, put the address, way there and nav in `footer-visit`.
- **Buttons** on `<html data-buttons>`: `solid`, `pill`, `tonal`, `arrow`, `block`.
- **Mark** beside the name in the nav and footer (`system.md`); a client's own logo replaces it.

## 3. The plans

Start with the material the brief gives. Use these routes to place it.

**Software** (including developer tools and fintech). Show the product's central view near the top. Build its timeline, diff, board or map large enough to read. If the real task is to select a record and read its details, `app-frame` fits. For several uses, switch one frame by click, tap or keyboard. Show real tool icons for integrations. Put quantity-sensitive plans under a meter, then the FAQ and close. Use supplied customer proof only. Rewrite any kit fragment to the client's subject and data (`cards.md`).

**Gaming.** Name the game and its genre in the hero. Give the release date or status from the brief and the main action, such as wishlisting. A supplied trailer gets the film hero only when the dealer picks it. Make the poster playable when there is a film. For a world section show what the player does through in-engine shots or the game's own key art. Without art files, draw the world in one style (`subskills/illustrate/SKILL.md`). Let a player switch the light or inspect an item if that shows how the game works.

- `devlog`: two or three dated posts, each with a picture and enough text to say what changed.
- `press-kit`: link to the downloadable file and give its size. Test the link.
- Use real store marks where available and plain type elsewhere (`icons.md`). Keep the wishlist or purchase action easy to find at the close.

**Product and hardware.** The hero shows the thing itself. Use supplied photographs, art or CAD first. If there is no product picture, draw the product or its output. Choose views for what they show: a cargo bike carrying the stated load, the controls at the bench, the light a lamp casts. Use the product-render helper for a requested 3D view (`effects-objects.md`). An edge-to-edge product hero needs a product picture or a drawing to fill it. A film hero needs a film.

- Give the product room. Where the whole object leads, use about eight columns or let the photograph bleed. Put dimensions beside a drawing. Put use cases in a switcher when the same view can show each one.
- **Selling on the page:** place the order pad or configurator within the first three sections. A colour choice changes the photograph or recolours the drawing and updates the chosen variant and price. Keep the delivery and return facts at the close.
- Give a spec, price or unit once where it helps the decision. Use actual figures for results. A supporting photograph shows the part named or the claimed use. Never fill a price list with prop photographs.

**Service.** Name each service and its fee where applicable. When the brief asks to show work, give each project a case with its type, district, size and year. Mark invented facts with `data-assumed`. Show the client’s photograph or an identified reference interior of the right kind. A drawn plan can sit beside the photograph. Put a process with durations and deliverables on a rail. Follow with the people the brief names, supplied proof and the enquiry or booking. A service enquiry has one action leading to its form.

## 4. Place

Cafes, bars, bakeries, restaurants, guesthouses and small hotels, shops, bookshops, florists, bike
shops, local studios (pottery, yoga; a creative agency stays service; a maker people visit who
also teaches or sells online stays a place: the door decides, the web shop is its goods section).
`<html data-type="place">`,
`<meta name="page-kind" content="place">` and place styles under `html[data-type="place"]`. The door, counter, rooms or work give the pictures their subjects. The plan sets the grounds and picture corners.

A season toggle can share one room view. Hours can use a day bar. A direct-booking price can use comparison bars if the figures support it. Keep shaders, WebGL, tech-looking gradients and prints off a place page. Apply the ordinary rules for contrast, motion and assumed facts.

### Plan and length

The length follows the content: every section as tall as what the brief gives it (the whole menu,
every room, the location), never a section dropped or cut to make the page shorter.

Use the usable photographs for the parts they show. A full set may cover the visit, rooms, goods and work. With fewer pictures, combine related material. For a photo-led place, 8 to 12 usable frames suit a compact page and 12 or more a full one. With fewer, a short page can put the offer and visit together. Built pictures can carry a longer brief. Keep every ask, including the order or booking. The form, menu, map or room facts can carry the section.

### The deal

Use the frame and ground map from section 2. A place hero has a dealt form (`band`, `bleed`, `split` or `name`). Use `--action booking` with `--booking stay`, `table` or `class` for dated reservations. Goods use `--action order`.

### Photographs and type

For photographs with words, see `sections-library.md`, Compositions. A pair can put the whole room beside its joinery. A trio can show the workshop, a bench and the work in hand. A strip suits four details of the same process. Keep it away from price lists. Give the main picture enough width and check its crop at 390.

In `street-large`, set the supplied street or district beneath the visit h2 in `.type-moment`. If the brief gives only a district, use that. Link the address where the visitor can find it. Align headings, rows, controls and picture edges to the wrap.

- Link a room to its booking or a product to its order when that is the next task. Keep hover on an inner layer (`motion.md`).
- **Main action.** Use the same words where the visitor books or orders. On a visit page, link the address to directions. The phone bar waits until the hero action scrolls away.
- **List text at 16px:** menu rows, descriptions, room facts and hours at 16/24 at least (the muted
  colour, never a smaller size, marks a description); 13px only for a group label.
- **Credits:** the one footer line that links the credits list (`photos.md`, Credits), never one
  link per photograph in the footer.

### The sections (1280px column, x 80 to 1360)

- **Hero:** the place hero in its dealt form (`layout-v4.md` section 3). What, where and one fact: an
  h1 with the place's own voice, never the brief's category ("Bread out of the oven before the
  street wakes up", not "Bakery in Leith"; the kind and the street go in the sub-line), 48 characters at most; sub-line "Sourdough, rye and cardamom buns from 7:30,
  Tuesday to Sunday." (80 at most). For a stay, table or class, the hero's booking button belongs to `.hero-book` (`layout-v4.md`).
- **Visit** (`data-place="visit"`, `id="visit"`) near the top:
  put the address, routes and opening hours where visitors can find them. Give directions to a supplied street, an area link for a district, and a call link only for a supplied phone. Use a day bar, ruled week or a split with a shopfront view, according to the material. `[data-open-now]` requires supplied hours. Mark assumed hours `data-assumed` and leave them as text.
- **Map** only when the brief gives the street: `fx-map` baked still (`effects-creative.md`) in the
  photograph's frame, the pin on the street line; never an embed, a contour or a dot pattern.
- **The offer** opens with a head row: the h2 on the left line, one line, 40 characters at most
  (40/50; 28/35 at 390); at its right, on its baseline, one 16px line and a link ("Full menu", "See
  all"); leave `--head-gap` to the content.
  - **Menu or prices.** Group the full list by what the visitor orders. Use `.rows`, with the name left, price right in tabular figures, and a description beneath when needed. Rows are at least 44px high. On a phone stack the groups. Leave prices in live text. A photograph may show the dish or service named. Keep a price list free of detail strips.
  - **Rooms.** Show the room types and which beds they hold. Include the rate, its season and how to book that room. Use whole rooms for the photographs. A row, index or simple list can carry the room facts when no suitable picture exists.
  - **Goods** (beans, bread, books, parts, bouquets): four linked cards on span-3, 1:1 at 302x302
    (bouquets 4:5 at 302x378), one ratio per grid, one backdrop, angle and light. Each card a flat
    fill one step off the ground or a 1px hairline, no shadow, radius or pill; inside its padding
    under the photograph only the name (a two-line slot, 16/500) and the price; an outline Add
    button aligned across the row where it sells online. One or two full rows. At 390 two-up at 165,
    four or six, then a full-width button to the range. For a captioned shelf use the item-row recipe.
- **The place.** If the photographs and words carry a story, use the suggested showcase. A wall suits a set, a split suits the owner beside their work. Use the fact-line rule in `copy.md` when a project needs identifying.
- **Orders** (cakes, a bike service, weddings, classes): three kinds on span-4 under the head row,
  or two beside the head in the first span-4. Each: a 4:3 photograph of this business's own goods
  (411x308), a 1px hairline, a 13px label, the title at 20/28, one or two sentences at 16/26 with the
  lead time, where to collect and the price from, one text link with an arrow. A florist's events
  kind says what to send: date, venue, guests, budget.
- **Booking.** For a stay, table or class use the hero bar to choose dates or day, guests, room or time. Carry those choices into the full form at the close. Label the fields, state the price and use the same action words (`system.md`, Forms).
- **Close.** Follow the PLAN. A shop states delivery and returns here. Keep booking and newsletter forms distinct.
- **Footer.** Use the dealt link layout. Keep one credits line. Include directions, delivery or check-in where useful and avoid repeating hours or forms.
- **Phone bar** (`nav.actionbar`, required): the order or booking as one full-width button; without
  either, Get directions (primary; "See the area" when the brief gives no street) and Call (secondary, only with a
  phone the brief gives). system.js keeps it off the phone's first screen until the hero's button has scrolled away,
  and away from any screen that already shows one of its actions (`system.md`, Nav; `copy.md` rule 5).
- **Notice line** (a florist's delivery cut-off, changed or holiday hours): one still 14px line with
  a number above the h1 (`layout-v4.md`), repeated where the fact belongs; never rotating.
- **Splits** as dealt (7/5, 5/7, 6/6, mirrored once a page at most), top-aligned, the picture down to
  the section's foot; on a phone the text first.
- **Phone:** the hours a ruled list (days left, times right on one line; system.css does it), at
  most two footer columns, no photograph under 200px tall.

### Order by trade

Keep the main task near the top. Place the remaining material in the order a visitor uses it.

- **Cafe or bakery.** Visit and opening hours, full menu, the counter and the work. If the page sells beans or takes bread orders, its order pad belongs in the first three sections. For multiple shops, give each address.
- **Guesthouse or small hotel.** Start with the house or its region and a booking bar. Show the room types and prices, what breakfast includes, how to arrive and the full booking form. Use a season switch when the same stay has two different uses.
- **Shop or bookshop.** Show the goods and order controls early, then categories, a story and each shop's address and hours.
- **Bike shop:** visit and workshop (usual repair turnaround); workshop prices as ruled rows with
  "Book a service"; new in (cut-outs on white, name and price); brands as a plain text list; story.
- **Florist:** a notice line with delivery area, cut-off and price; delivery and visit as the section after the hero;
  bouquets (four 4:5 tiles, each with a price from); weddings and events (three photographs of real
  installations, what to send); workshops as ruled rows.

### Look

- **Palette.** Use the palette and pairing on the PLAN. For client colours, run `start.mjs brand` with `--bg`, `--ink`, `--accent` and `--type`. Quote hex values so the shell reads the colour.
- **Grounds.** Use the flat grounds on the PLAN. The palette's accent colours the main button and focus ring through `--p-action`. Check the label reaches 4.5:1 and the control 3:1 against its ground.
- **Type.** Use the display and text faces printed by the dealer. Sizes are in `layout-v4.md` section 5.
- **Motion.** Keep hover inside the link or picture. Use the dealt entrance and moments. A section can show its own content working within the limits in `compose.md`.

### The short page

Use `<html data-page-mode="short">` for this form. Keep the hero, the visit and offer, and the closing footer. Combine the hours and access with the address and put the menu or services in ruled groups. Give each group an id so the nav lands on it. Use a fitting picture where one exists. At 390 stack the groups in reading order. A text moment can ride the section's h2. A small page still has at least one own section.

## 5. Visuals

- **UI** (`cards.md`): paste `assets/ui/<name>/fragment.html` into the slot its recipe gives and
  rewrite every name, number, subject and logo, and a loop's arriving text in `data-ui-opts` (its
  `meta.json` `edit`). A pasted `<img src="assets/ui/icons/slack.svg">` is the kit's sample mark: write
  each as the client's tool, `<img data-icon="<id>" src="assets/icons/<id>.svg" alt="">`, and
  `icons.mjs scan --colour` fetches it. The product UI section shows the product's own subject, never a stand-in
  fragment. `data-ui-load` shows the kit's sample text: drafts only. None on gaming.
- **Diagram cards** (`diagrams.md`): when the point is how things connect; tech 0 to 2 with pulses,
  product and service one held still, place none.
- **Real icons** (`icons.md`): every tool, app or file type the page names, in its own colours; on
  other pages only tools the client really uses.
- **Shader grounds** (tech only): the one effect and the card group's still grounds
  (`effects-usage.md`).
- **Pictures.** Use the ladder in `photos.md`. Give photographs a `data-source` and `data-subject`.
