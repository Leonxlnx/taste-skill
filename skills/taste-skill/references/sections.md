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
  and two picture-less sections are never neighbours (the short page's statement hero and its one
  section are the one exception, section 4). A quote needs a face or merges into the section above. The picture takes a real share:
  half a tile or more, 50/50 in a split, a whole screen as a layer. The close is its own picture (a
  photograph, the big button or the name set wide).
- **One idea per section,** one h2, one action at most besides the main one (a pair only in the
  hero, or where a product needs "compare" beside "buy"). A two-screen section holds one list, table
  or form, or one idea in two groups, never two ideas.
- **The main action** reads the same, word for word, in the nav, the hero, the close (or the
  booking) and the phone bar, and nowhere else as a filled button (a place whose action is Get
  directions keeps it out of the nav, section 4).
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
- **One page, real links:** every nav word, button and footer link goes to an `#id` on the page, the
  logo to `#top`. The main action goes where it is done: the booking form's or the order section's
  id, `#visit` (the visit block) for Get directions, or, when the page has no form or booking system,
  a `mailto:` on `.example` (`copy.md`). Never `#contact` from outside the footer: `footer.closing`
  carries that id, and the checker WARNs a link that lands in the footer. Privacy, Terms and
  Imprint go to small pages you write (Imprint only when the brief gives the company's own details),
  or are left out. Never `/contact`, `/[page]` or a bare `#`.
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
"use" does not fit. With no photograph to show, these dealt parts do not fit, and each is dealt
again from its own list without them, never drawn: `nav-cards` (and any nav panel of photograph
cards) to `nav-split` with no panel, or `nav-centre`; `close-photo` to the head row of `close-word`
without the name (the h2 and one line on the left, the main button on the right, both on the
`.wrap` lines); `media-band` to `space` (a game without art keeps it: its world render is the layer); a place's hero to the `statement` hero on `.ground-brand`.
Write the change and its reason on plan line 2.

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
(the game, named), the world (one or two sections, full bleed), what you do (feature cards: three
or four open cards, one verb each, sail, salvage, rebuild, each with its picture), [a system of
the game as a diagram card: matchmaking, saves, stores], platforms and editions (the real store and
platform icons, prices from), [press lines or a quote the brief gives], [faq], footer.closing with
the main action (Add to Steam wishlist, Pre-order). Round C: a game page that never named the game
and showed an abstract effect for key art lost 3.5 to 5.5 to one with a launch date, a scene of the
game's world, feature cards and real platform icons. So:
- **The hero names the game:** the h1 is its name and genre ("Driftmoor, a co-op salvage game",
  40 characters at most on the `product` stage), or its wordmark (the client's logo file) over an
  h1 naming the genre. The lead or a line under it carries the launch date or status the brief
  gives ("Out 12 March on Steam", "Early access now"); with no date, the status ("Coming to PC"),
  never an invented date.
- **Key art in the hero and the world sections, full bleed:** the client's trailer (a film hero),
  key art and in-engine shots, one grade, as layers or on the column lines. Deal the hero with
  `deal.mjs --type software --kind gaming --has film,photo` when the art is supplied.
- **No art files** (the brief names art it does not supply, or none): the key art is **rendered**,
  never replaced by an effect. Write a product-render spec (`effects-objects.md`, Product renders)
  of the game's hero object (its ship, crane barge, mech, car) or a scene of its world composed from
  its own objects on one floor (the barge at the quay with its crates, lanterns and cables; under 90
  parts), in the game's palette, `light` material for its fires, lamps and screens; make its
  posters. Deal `deal.mjs --type software --kind gaming --has object` (the `product` stage): the
  render whole on the stage, turning slowly. The one effect (`effects.mjs pick --page gaming
  --palette dark --slots hero --exclude ruled-grounds,grid-pulse,contour-lines,dot-terrain,dotted-globe,ridgeline,bayer-dither,halftone-screen,ascii-shade,line-engraving,duotone-grade`,
  again until it reads as water, fog, embers or light, or the product hero's `spotlight-cone`,
  `edge-glow`) may sit behind it as the stage's ground, the
  render drawn over it (every placement is transparent over its frame's ground), never instead of it. The world
  section: the scene again from another angle or closer, `data-product-place="stage"` in a
  full-bleed `media-band` or `dark-band` frame, the h2 above the render, never on it. Each feature card shows the object its
  verb uses as a still (`data-product-place="card"`, `{"turn":0}`) or a crop of the world. One
  render turns; the rest are stills. The helper cannot model characters, faces, creatures, cloth
  or glass: compose the world's machines, buildings and props, never a character. The report
  names the art to replace.
- **Platforms:** the real Steam, PlayStation and Epic Games marks (`icons.mjs apps --tag gaming`);
  Xbox and Nintendo named in type, never a drawn mark.
Nav `nav-mega|nav-centre|nav-cards` · footer `footer-dark|footer-statement` · close
`close-word|close-type` · rhythm `dark-band|media-band|space` · buttons `solid|pill|block`.
Never: a hero that never names the game; an abstract effect, pattern or `statement` hero in place
of key art; UI fragments from `assets/ui` (no UI kit on gaming), a dashboard, SaaS widgets on
panels; a toy object of another kind, a drawn SVG or an empty panel in place of the world; stock
players at screens.

**Product.** nav, hero, the range or line-up within the first three sections, two or three feature
sections (one benefit each, text beside one big photograph on the page's split; photo-pair; bento),
[media-band], specs (`rows--spec` or comparison-table), proof (a review or press line the brief
gives), [visit-map for a showroom], [faq, five questions at most], footer.closing with the
newsletter. Every main section shows the product, two or three photographs a screen (one per
feature section of the part it names; a grid of 4 to 8 cut-outs on one backdrop). Prices are "from"
prices on cards or in a table, never a plan table or a monthly switch. A technical product (site-kind
tech) may take its render or the effect; any other product takes no effect, and its render only
when it has no photographs (below).
- **No photographs: the product is shown, never hidden** (round C: a cargo bike's page that never
  showed the bike scored 3 of 10). A picture the brief gives (a render, a CAD view, a cut-out) goes
  on the hero's stage. Else the product is **rendered**: one crafted studio render of this product,
  composed from its parts with the objects kit's product-render helper (`assets/objects/
  product-render`; `effects-objects.md`, Product renders): write a short JSON spec of its frame,
  wheels, box, arm or shade, sized from the brief's figures, in its own materials and colours (the
  kit's `specs/` show the format; never ship a kit spec as the client's product), make its posters
  with `make-posters.mjs`, and mount it as `<div class="frame" data-product="assets/objects/product-render/specs/<name>.json"
  data-product-place="stage">` with `product-render/auto.js` (`stage` on the `product` hero's
  stage, `tile` in a `split` frame, `hero` in a full-bleed frame with the words over its left). The render is the product's picture, not an effect:
  a still or a quiet turntable on the page's flat ground, one live context, its poster under it,
  no print, shader ground, moment or scene beside it; the same on a product of site-kind other and
  on hardware. Deal the hero with `deal.mjs --type product --has object` (hardware adds `--kind
  tech`; the `product` stage or a `split` with the render in its frame), the render whole on it. Then the **full product page**, never the short page:
  1. hero: the render on the stage, the h1 naming the product and its buyer, the order action;
  2. the product: the render again from a second angle or closer on the part that sells it (the
     box, the motor, the shade), with three facts as `rows--spec` beside it;
  3. what it does or carries (a split: the render loaded or switched on, beside the uses in plain
     rows), or the parts as a 2x2 of open cards each showing that part's render close up;
  4. how it is used: three steps or a lanes diagram card held still (charge, ride, park);
  5. specs as `rows--spec` (sizes, weight, load, range, materials, warranty), with the real colour
     icons of the component brands the brief names;
  6. ordering: a live order card (model or size, colour as swatches, delivery slot or town, the
     price that updates, the main action), beside the render in the chosen colour when the spec
     allows it; [faq, five questions at most]; footer.closing.
  At most three renders of the product a page, each a different angle, crop or state; the other
  sections carry the order card, rows and real icons. The heading and the text say what the thing
  is; no line calls it a render, model or illustration (Leon's rule 1). The report lists the
  photographs to shoot (`photos.md`). Never a drawn SVG, a model of loose primitives the helper did
  not compose, mood stock, a photograph of another maker's product or an object of another kind (a
  wheel is not a bicycle). **Hardware without photographs or renders goes here too** (round C: a
  robot arm's page with a silk shader and an order form lost; CAD renders or a film the brief names
  but does not supply count as missing): a robot arm follows the kit's worked
  `robot-arm` spec, rebuilt to the client's own sizes, joints and colours; a drone is a rounded box body, beam arms, cylinder motors and disc rotors; a camera a
  rounded box and a cylinder lens; a curved shell is rounded boxes and fillets (`round`, `blend`,
  `seams`) at its real measurements. Never a `split` hero holding only an order form or the
  effect in place of the product; the order card is its own section (6).
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
also teaches or sells online stays a place: the door decides, the web shop is its goods section).
`<html data-type="place">`,
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
- **No client photographs (the draft path):** `photos.mjs pick --trade <trade> --sections <words>
  --draft-lead --pictures 12` lifts the 1-in-3 cap, and the page is a whole place page that leads
  with photographs, never the short page. `pick` deals one frame per word: repeat a word for each
  row or detail (`bar,bar,coffee,coffee,beans,beans`; `rooms,rooms,rooms,breakfast,breakfast`)
  until it returns 8 or more (a cafe 8 to 12, a guesthouse 9). **The hero is always a photograph
  when any frame fits:** the lead `pick` returns (a cafe's bar); a place whose trade leads with land
  (a guesthouse, a lodge, a remote inn) and whose brief names its region (Westfjords, Lofoten, the
  Lake District, a town) passes that region as `--place "<region as written>"`, and the landscape
  of that region leads, because a remote place is sold by where it stands (round C: a remote
  guesthouse shown as a type band scored 3.5). The `statement` hero on `.ground-brand` only when
  the library holds no frame of the region and no lead. Every frame is listed in the report as a
  stand-in to replace; nothing on the page says so. Only a trade whose frames total under 8
  (florist, wellness, office) or none (pottery) takes the short page.

These three names mean only these lengths everywhere in the skill.
- **Photographs by section,** all distinct: hero 1; visit 1 (0 with a map); menu or prices 1; rooms
  2 to 6; goods 4; the place 3 (row), 1 (story) or a wall; orders 2 or 3, or booking 1; close 1. Nav
  panel photographs do not count.

### The deal

Never by taste; the hero and the splits are never dealt, the close is `close-photo` while a
photograph is left to show (else the re-deal of section 2):

```bash
node -e "for(const l of process.argv.slice(1)){const o=l.split('|');console.log(o[Math.floor(Math.random()*o.length)])}" "nav-split|nav-cards" "footer-visit|footer-columns" "surface-pairs|space|colour-band" "block|solid|arrow" "dots|arc|ring|petal|leaf|stack" "pair|strip|tall-small" "bleed|trio|strip|pair|wall|story" "address|name" "row|side"
```

Read them in order: nav, footer, rhythm, buttons, mark, the offer's composition, the place's
composition (deal it again while it equals the offer's), the type moment, the rooms layout. Rhythm:
`surface-pairs` (the offer on one full `--g-alt` band; the visit section on the page ground with its
panel on `--g-alt`), `space` (one ground throughout, sections parted by space), `colour-band` (the
close on `.ground-brand`, a flat fill in the place's own colour; then the footer has no name across
it).

### Designed variety without effects

A place earns its creativity from photographs, their arrangement and one moment of type, never
from an effect (round C: correct cafe and guesthouse pages scored creativity 2.5 to 4 and motion 3
to 4.5 because every section was text beside one picture and nothing answered the pointer).

- **Never two sections built round one picture.** The visit keeps its 6/6 split with one
  photograph; every other photographed section takes a composition, the offer and the place each a
  different one, neighbours never the same. Text beside a single photograph happens once a page
  besides the visit (`story`, or the booking form).
- **The five compositions** (1200 column, gap 24; grid widths span-3 282, span-4 384, span-5 486,
  span-6 588; square corners, one grade, no words on any photograph):

  | id | at 1440 | at 390 |
  |---|---|---|
  | `bleed` | the head row on the `.wrap` (its line at the right), then one photograph across the whole viewport, 1440x560, nothing on it; once a page, never right after the hero | 390x488 (4:5 crop) |
  | `pair` | two photographs on span-6, the same ratio (4:3 at 588x441 or 4:5 at 588x735 in a 2-screen section), tops level; the head row above | stacked, 342 wide, 24 apart |
  | `trio` | the offset trio: three photographs on span-5 (4:5, 486x607), span-4 (1:1, 384x384) and span-3 (4:3, 282x212), tops on one line, three sizes of one subject family (the room, its table, a cup) | the first 342 wide, the other two two-up at 165 |
  | `strip` | the detail strip: four 1:1 details on span-3 (282x282) or six on span-2 (180x180) from line to line, hands, tools and materials of one trade, under the section's text or groups | two-up at 165, four at most |
  | `tall-small` | a tall 4:5 photograph on span-6 (588x735) at the left line; on span-5 at the right the h2, its lines and link at the top and a 1:1 on span-3 (282x282) at the bottom, its foot level with the tall one's | text, the tall one at 342, the small one at 165 |

  The offer deals `pair`, `strip` or `tall-small`: `strip` runs under the menu's groups, `pair`
  and `tall-small` take the photograph slot beside them (the groups narrow to span-6). The place
  deals `bleed`, `trio`, `strip`, `pair`, `wall` or `story` (below). Rooms keep their own grid.
- **One display-type moment** (dealt `address|name`): `address` sets the street and district large
  right under the visit section's h2 ("Find us" at the page's h2 size, so the heading scale holds):
  `<p class="type-moment"><a href="<map search>">Mill Street, Leith</a></p>`, page CSS
  `.type-moment { font: var(--display-weight) clamp(48px, 7vw, 104px)/1.02 var(--font-display);
  letter-spacing: -0.03em }`, one or two lines on the `.wrap`'s left line, the drawn underline on
  hover; `name` makes the
  close `close-word` (the h2 and the button, then the name across the `.wrap`), its photograph
  going to the place's composition. Ink on the ground or on the brand
  band, never outline, pale, rotated or on a photograph. One a page; the footer's name set wide is
  then capped at `12vw` (about 170px at 1440) or left out.
- **Hover you can see:** every photograph that leads somewhere is a link (a room to its booking, a
  goods photograph to its card, the place to its story) and zooms 1.03 inside its frame while its
  card lifts 2px; the head row's link carries the arrow; the nav words draw their underline
  (`motion.md`). Each section after the hero holds at least one such link.
- **One main action a screen:** a transaction (Book a room, Order a cake) is the nav's button and
  the hero's, as on any page, and nowhere else but the booking or close and the phone bar. Get
  directions is never repeated: the hero's one button and the phone bar's; the nav says "Visit"
  as a word to `#visit`, the visit block adds no second button for it, and the footer gives the
  address linked to the map, never a button (round C: Get directions in the bar, the hero and the
  footer read as clutter).
- **List text at 16px:** menu rows, descriptions, room facts and hours at 16/24 at least (the muted
  colour, never a smaller size, marks a description); 13px only for a group label.
- **Credits:** the one footer line that links the credits list (`photos.md`, Credits), never one
  link per photograph in the footer.

### The sections (1200 column, x 120 to 1320)

- **Hero:** the place hero (`layout-v4.md` section 3). What, where and one fact: h1 "Bakery on Mill
  Street, Leith" (40 characters at most); sub-line "Sourdough, rye and cardamom buns from 7:30,
  Tuesday to Sunday." (80 at most); one button, the main action.
- **Visit, always screen 2,** marked `data-place="visit"` and `id="visit"`, directly after the hero:
  a panel on `--g-alt` (page CSS: `.visit { background: var(--g-alt); padding: 48px }`, on span-6
  only: a ground box 80% of the section or wider is a band and FAILs `one-section`) and a 1:1 or 4:3 photograph of the shopfront straight-on or the
  room from the door, 6/6, the panel left. With the `address` type moment the h2 and the street
  set large run across the `.wrap` above the split (the photograph then 4:3) and the panel opens
  with the open-now line; else the panel's top line is the h2 "Visit", the open-now line
  (`[data-open-now]`) at its right, never a 13px eyebrow. 16px below, two columns 24 apart: the address on two lines at
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
  - **Menu or prices** (drinks, a bakery counter, repairs, bouquet sizes, classes): the groups with
    the offer's dealt composition (Designed variety): `strip`: three groups on span-4, the strip of
    four details under them; `pair` or `tall-small`: two groups on span-3 at the left, the
    photographs on the right span-6, their top level with the group labels. A group: a 13px label, a
    1px ink rule 12px under it, then rows: the name at 16/24/500 left, the price right in tabular
    figures, an optional description at 16/24 muted; rows 44px (64 with a description), at most 6
    with descriptions or 8 without, the rest behind the head row's link. Always text, whole, prices
    visible: never an image, a PDF, tabs or an accordion. At 390 one column, the photographs after
    the first group.
  - **Rooms:** h2 "Rooms and prices", the side line "Breakfast 8 to 10. Check-in from 15, check-out
    by 11." Each room: a 4:3 photograph of the whole room, straight-on, window light; 20px; the name
    (`h3.t-card`, 20/28); the facts at 16/24 muted ("2 guests · 18 m² · garden side"); the price
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
- **The place** (dealt): one of the five compositions under the head row (Designed variety), `wall`
  (the head row, then a wall of photographs from line to line, gap 0 or 2px) or `story` (6/6, text
  left: the h2 on one or two lines, three to six lines at 20/30 on who runs it, since when and what
  exactly, one link; a 4:3 photograph of people at work right, 588x441). One story row a page. No
  names under the photographs. At 390 `wall` two-up, `story` text first.
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
  sits on `.ground-brand`, every word at 7:1 (`backgrounds.md`), the button inverted.
- **Footer:** `footer-visit` (the address at 32/40 on span-7, linked to the map search, with one
  line on the way there and no button, the hours from the split line with today marked, the nav
  row, the legal row with the one credits line; then the name set wide across the `.wrap` in the
  display face at 400, at most `12vw`, except on `colour-band` or with the `name` moment) or
  `footer-columns` (Visit, Contact as given, the nav's words, delivery or check-in or the
  newsletter; the legal row).
- **Phone bar** (`nav.actionbar`, required): the order or booking as one full-width button; without
  either, Get directions (primary) and Call (secondary, only with a phone the brief gives).
- **Notice line** (a florist's delivery cut-off, changed or holiday hours): one still 14px line with
  a number above the h1 (`layout-v4.md`), repeated where the fact belongs; never rotating.
- **Splits** 6/6, text left, top-aligned, never mirrored; on a phone the text first.

### Order by trade

Each starts hero, visit; the rest in this order, 4 to 6 screens:
- **Cafe:** menu as text with its composition; the place (its composition or a story row); beans
  or goods only if sold.
- **Bakery:** what it bakes (goods with prices); orders (one card per kind); the process (its
  composition, a `strip` or `trio`, one screen at most). Several shops: a ruled list, each with its street.
- **Guesthouse or small hotel:** the hero is the landscape of its region when the brief names one
  (a remote house is sold by where it stands, as Fogo Island Inn is); location as the visit (how to
  arrive, the `address` moment fits); rooms; the house (shared spaces and breakfast in its
  composition, `bleed` for the land around it, no labels); booking. Check-in and check-out beside the rooms and in the footer.
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
- **Motion:** the hover layer only (`motion.md`), and it must show: the nav words and links draw
  their underline, a linked photograph zooms 1.03 inside its frame while its card lifts 2px,
  buttons step and press, arrows move 3px. Nothing moves by itself, on load or on scroll.

### The short page (under 8 photographs)

Under 8 usable: three screens, 2,700px at most at 1440: hero, one `--h: 1` section holding the
visit and the offer, footer.closing. With one or two good photographs, the best is the hero's and
the other sits in that section, the menu or prices as ruled text beside it and the visit block
under both. With none, the hero is a statement on `.ground-brand` (`deal.mjs --hero statement`: the
h1, the sub-line, the inverted button) and the section has no picture on purpose (the one
exception to "two picture-less sections are never neighbours").
- **The section** is open type on the page ground, never a card or a ground box (across the `.wrap`
  that is a band): the offer as ruled text in groups (a maker's tableware and its classes are two
  groups of rows, prices visible), then the visit block as three `span-4` columns on the grid
  (address, hours with today marked, access; a phone only when the brief gives one). A maker's
  story is one 20/30 paragraph at the head of the visit block, never a section of its own.
- **Nav and the main action:** three or four words, one per group, each pointing at an `id` on that
  group (`#tableware`, `#classes`, `#visit`); the main action points at the group that does it
  (section 1, One page). One section has no scroll-marked word: leave `aria-current` off.
- **Re-dealt without pictures** (section 2): `nav-split` with no panel, the close as the head row
  of `close-word` without the name. Either the brand band (the close on `colour-band`) or the name
  set wide in the footer, not both.

No mood stock, code ground, drawing, empty box or note. The report lists the shots to take
(`photos.md`). At 8 good photographs it grows to the compact page, at 12 to the full page. A place
with no photographs of its own takes the draft path first (Plan and length); the short page is for
a trade the library cannot fill (`photos.mjs` names no trade for it: pottery, a restaurant, a salon)
or deals under 8.

## 5. Visuals

- **UI** (`cards.md`): paste `assets/ui/<name>/fragment.html` into the slot its recipe gives and
  rewrite every name, number, subject and logo, and a loop's arriving text in `data-ui-opts` (its
  `meta.json` `edit`). A pasted `<img src="assets/ui/icons/x.svg">` is the kit's sample mark: write
  each as the client's tool, `<img data-icon="<id>" src="assets/icons/<id>.svg" alt="">`, and
  `icons.mjs scan --colour` fetches it. The product UI section shows the product's own subject, never a stand-in
  fragment. `data-ui-load` shows the kit's sample text: drafts only. None on gaming.
- **Diagram cards** (`diagrams.md`): when the point is how things connect; tech 0 to 2 with pulses,
  product and service one held still, place none.
- **Real icons** (`icons.md`): every tool, app or file type the page names, in its own colours; on
  other pages only tools the client really uses.
- **Shader grounds** (tech only): the one effect and the card group's still grounds
  (`effects-usage.md`).
- **Photographs** (`photos.md`): the client's, else `photos.mjs pick`; every `<img>` carries
  `data-source` and `data-subject`.
