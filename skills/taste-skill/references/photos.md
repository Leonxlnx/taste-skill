# Photographs

A place (café, bakery, guesthouse, shop, studio) is its photographs: two or three on every screen, the
client's own. Software leads with its real interface; a photograph there is a real person or the real
product. A game leads with its own art (key art, in-engine shots, the trailer's poster), never library frames; with no art files its key art is a product render of its hero object or world (`sections.md`, Gaming), never a photograph or an effect in its place. A photograph never stands where an effect, a drawing or an empty box would.

## Where pictures come from (PH-01, PH-02, PH-05)

1. **The client's own**, shot for the page or on a phone, each file named in the brief. Every `<img>` carries
   `data-source` (`client`, `commissioned`, `phone`, `supplier`, `illustration`, `library-057`) and
   `data-subject`.
2. **The library** (`scripts/photos.mjs`): Wikimedia Commons and Unsplash frames, vetted one by one. They are
   stock of another place, so they fill **detail slots only**: hands, tools, materials, a process (an oven, dough, a
   roasting drum, stems, a hammer on a bar). Never the hero, a room, a shopfront, a product or a person, and never more
   than **1 in 3 of the page's pictures**. `pick` deals exactly that by default and prints the cap with the deal;
   the draft path below lifts both limits.
   `fetch` prints `data-source="library-057"`. Every frame was looked at again at 100% (the subject and the centre of
   the 2400 file) for softness, grade, readable brands and recognisable people; a frame that failed is out of
   `photos.json` and off disk, and a frame that is a car, a sign or another business's whole room stays
   `weak` (kept with its credit and its why, no file on disk) and is never dealt; a rating below 7 is never dealt either (`quality`): a whole meeting room, lounge or breakfast room is the same fault. The thin trades get at most as many
   frames as they hold: wine 0, bar 0, office 3 (a notebook, stacked books, sheets of card), florist 3, farm 3, shop 3, wellness 3, bakery 4, and a
   workshop by its craft (smith 4, instrument 1, weaving 0, letterpress 0). The rest of the page is the client's own photographs, the object, the real UI or type.
3. **Nothing**: a product's own render (`effects-objects.md`, Product renders), the real UI, or type. Never a near
   fit, never mood in place of the subject.

With no client photographs, say so plainly in the report: strong pages run on a half-day shoot with a local
photographer, then a one-morning phone shoot, then products on one backdrop; the library covers details only. The
shot list: shopfront straight on, the room from the door, the counter or bench, three products on one surface, hands
at work, one detail, each room of a guesthouse; 1x lens, window light, no flash, no filter, landscape and portrait.
**The draft path (a place with no client photographs):** `pick --trade <trade> --sections <words> --draft-lead
--pictures 12` lifts the 1-in-3 cap. `pick` deals one frame per word, so repeat a word for each row or detail
(`bar,bar,coffee,coffee,beans,beans`, `rooms,rooms,rooms,breakfast,breakfast`) until it returns 8 or more: a cafe
reaches 8 to 12, a guesthouse 9 detail frames. The page stays a whole place page that leads with photographs (house
rule 6), the compact page at 8 to 12 frames. The hero is the lead `pick` returns (a
cafe's bar). A place whose trade leads with land (a guesthouse, a lodge, a remote inn) passes the region its brief
names as `--place "<region>"` (or the brief itself, `--brief BRIEF.md`, which reads the region from it) and leads with that region's landscape: a place hero always carries a photograph when
any frame fits, and the `statement` hero is left for a place the library holds no frame of (`sections.md` section 4). Every frame is listed in the report as a stand-in to replace; nothing on the page says so
(no caption, no note). **The count decides, not the trade:** when `pick`, with each word repeated until it says "no new
motif left", still returns under eight frames, the page is the short page (PH-07: 2,700 px at most at 1440; `sections.md`
section 4, The short page), whatever the trade: a bakery (4), florist, wellness, office, pottery or a restaurant are examples. No drawn box, grid
or effect takes the place of a photograph.

Two exceptions, both for a draft or the short page and both named in the report as stand-ins to replace:

- **A hero** (`--draft-lead`): the client has no hero photograph yet. A place hero is still Recipe 3: the frame is the
  full-bleed top photograph with nothing on it.
- **The land around a place** (`--place "<region>"`): a place whose brief names its region (Westfjords, Lofoten, the
  Lake District, a town) is dealt that region's landscape as its lead, because a remote place is sold by where it
  stands. `--own-land` adds the land sections (area, road) when the brief says the business is that landscape (a
  tour, a lodge on its own land). Another region's land, a cafe's street and the sky are never dealt (PH-03, PH-50).

## A product without photographs (PH-04)

A maker of a physical thing (a bike, a chair, a lamp, a stroller, a device) with no photographs of its own gets **no
stock photographs**: no forest for "the ride", no groceries for "what it carries", no other trade dealt to fill the page.
`pick --product-without-photos` (or a maker's, brand's or company's word: "backpack brand", "electric scooter")
deals nothing and says so. **The product is still shown, never hidden:** it is rendered with the objects kit's
product-render helper (`assets/objects/product-render`, `effects-objects.md` Product renders), one crafted studio
render composed from a JSON spec of its own parts, sizes and materials, and the page is the full product page
(`sections.md`, Product: hero, the product, what it carries, how it is used, specs as rows, a live order card), never
the short page (in testing: a cargo bike's page that never showed the bike scored 3 of 10). The render is the product's
picture on a flat ground, not an effect, on a product of site-kind other as on hardware. Never a drawn SVG, mood
stock, another maker's product or an object of another kind (a wheel is not a bicycle). A render or CAD view the
brief supplies comes first; renders it names but does not supply count as missing. The report lists the shots to
take: the product on one plain backdrop, three angles, a detail of each part the page names, the product in use. A
shop, workshop or rental for every make is a place (`--trade "bike shop"`): it is dealt parts and a basket load for
those sections only.

## Pick and fetch

```bash
node <skill>/scripts/photos.mjs list                       # trades: detail frames dealt by default, land, can lead
node <skill>/scripts/photos.mjs list --places              # the place names the library knows, for --place
node <skill>/scripts/photos.mjs pick --trade bakery --sections oven,dough,bread --pictures 14 \
     --history .taste-skill/history.json
node <skill>/scripts/photos.mjs pick --trade cafe --sections hero,bar,bar,coffee,coffee,beans,beans,hands --draft-lead --pictures 12 \
     --history .taste-skill/history.json                                                     # no client photographs
node <skill>/scripts/photos.mjs pick --trade guesthouse --sections hero,rooms,rooms --pictures 12 \
     --draft-lead --own-land --place "Lofoten, Norway" --history .taste-skill/history.json   # a draft only
node <skill>/scripts/photos.mjs fetch <ids> [--hero <lead id>] --out . [--big id] [--lqip]   # run from the project root
node <skill>/scripts/photos.mjs credits --out . --write     # the footer line and credits.html; --text for a report
```

- **Order and places.** `pick` prints its follow-up `fetch` with the script's absolute path (forward slashes, quoted when it holds a
  space) and `--out .`, so it runs as printed from the site folder (from elsewhere, give `--out` the site's path). `fetch` writes the files into `assets/img/` under `--out` (the project's own folder, `--dir` changes it; `--out .` from the
  project root, so the markup says `assets/img/photo-<id>-1200.webp`), and prints the `<img>` or `<picture>` to paste; if the
  folder it prints differs, use that one. `credits` reads the page, so run it last, after the markup references the
  photographs: before that it exits 1 with "none of the fetched photographs is on the page".

- `--trade`: cafe, bakery, hotel, bike (--shop only), food, florist, workshop, studio, office, shop, books,
  outdoors, wellness, farm, wine, bar; a brief's word works (roastery, bread, inn, bookshop, yoga studio, blacksmith). No trade for a
  restaurant, a ceramics studio, a patisserie, a salon, a jeweller, a goldsmith, a locksmith: its own photographs, else type. A **workshop**
  names its craft (`--trade blacksmith`, `weaving`, `letterpress`): only that craft's frames are dealt, so a smith's page
  never shows a weaver's loom; no craft named, nothing is dealt.
- `--sections`: the page's sections in order, in plain words (bar, roastery, oven, dough, rooms, breakfast, workshop,
  stems...). Each gets a detail of its subject; a section the library cannot show comes back empty and goes to the
  client's own photograph, the object, UI or type. Repeat a word for a row (`rooms,rooms,rooms`: three details, one
  orientation). **Dealt nothing, on purpose:** hero (unless `--draft-lead`), menu, visit, contact, booking, closing and
  call to action, and, without `--own-land`, area, landscape, road, street and sky.
- `--pictures N`: how many pictures the whole page carries, the client's own included (12 if not said). At most N/3
  library frames are dealt, earlier sections first; the later ones come back empty and say so. With `--draft-lead`
  the cap lifts: every section that is not text gets a frame when the library has one.
- Only photographs rated 7 or more, with no whole figure, no animal, no vehicle, no landmark and no mood frame (a
  curtain or plant shadows, a sky, fog, an aurora, a waterfall, a viewpoint), are dealt. A frame the curators or this
  review held back (`weak`, with its reason in `photos.json`) is never dealt.
- **The land is only ever the client's own.** Library land is a draft stand-in, dealt only for the region a `--place` or the `--brief` names (as the lead; `--own-land` adds the land sections).
  A photograph's source names its places, the most exact first (Westfjords, Iceland), and a frame is dealt when its
  most exact name is the client's place, or the client's place is a broader one it lies in. `--place "Lofoten, Norway"`
  deals Lofoten; `--place Iceland` every photograph of Iceland; `--place "Reykjavik, Iceland"` neither the Westfjords nor
  a frame tagged only "Iceland" (a broader tag than the client's place is never dealt); names match whole, so "Senjavegen"
  is not Senja. Several places go in one value: `--place "Iceland; Norway; Faroe Islands"`. A place the source names
  overrides `--setting`; `--setting coast,mountain,...` only narrows frames whose source names no place, and never
  deals land by itself. With a `--place` and no photograph of it, the land sections stay empty.
- Frames marked `moodOnly` (the file names a business, or it is another's named room) are never the client's room,
  counter or product: not the lead, not dealt to a trade that has its own premises (cafe, bakery, hotel, bar, bike,
  florist, workshop, food, shop, farm), and into a mood or interior section only for the rest.
- `--draft-lead`: a lead may be dealt (a sharp landscape frame of the trade's lead subjects; a latte-art close-up or a
  soft, hazy older file never opens a page). A hero the library cannot fill comes back empty: never a row picture blown
  up. `--own-land`: see above. `--detail-only` is accepted and does nothing: it is the default.
- `--commons-only`: Wikimedia Commons files only (the credit line then reads "Photographs via Wikimedia Commons").
- `--tone light|dark`, `--mono` (black and white, one deliberate frame), `--shop` (every make).
- A place page's `pick` prints its hints for a place: words **under** the photograph on the ground, no band, no tab, no
  closing text. Product and service pages get the band and calm-side hints.
- When `pick` says the library is short, search the open collections with the queries it prints (CC0, CC BY, CC BY-SA,
  looked at full size) before leaving the slot to the client's own or type. Detail frames held by default (`list` prints them live, after the full-size review that dropped 27 frames and merged 4; the 3 office rooms of the second merge were then set `weak`, as whole rooms; the third merge looked at 8 more at full size and kept none: a shopfront with its sign, two bars' counters and back bars, a breakfast room, a made-bed room, two breakfast tables rated below 7 and a half-eaten breakfast with a diner in the frame are all `weak`): cafe 19,
  bakery 4 (oven 3, dough 1), hotel 9 (7 details and 2 breakfast frames; its land only with `--own-land`), bike 6 (parts and a load, --shop only), workshop 5
  (smith 4, instrument 1, weaving 0, letterpress 0: a craft is dealt only its own), studio 5, books 5 (desk only: a pencil on a notebook, a binding, stacked books, pencils; the hands frames beside a laptop are not dealt, and the bookbinder's gilding is dealt only to a bindery, `craft: bookbinding`), food 5, shop 3, florist 3, farm 3, wellness 3, office 3 (2 desk, 1 card),
  bar 0, outdoors 0 (land only), wine 0. A trade that
  holds 3 or fewer gives a page at most that many; the rest is the client's own. `list` marks those trades `thin`.
- **Sections and subjects:** `hands`, `writing`, `notebook`, `paper` deal a hands or desk frame; `detail`, `texture`, `surface`, `linen`, `material` a detail, texture or desk frame; `breakfast` a hotel's breakfast frame (never a deli's);
  `rooms` a detail of a room, never the room. When a section's frames exist but these options keep them out (no `--own-land`, another craft, a motif already dealt), `pick` says so instead of "nothing in the library shows it".
- **Variety:** the seed ranks the deal (a frame rated 8 or more has a head start of 0.3 in a 0-1 draw, not a place at the top), so a cafe's or a bike shop's deals differ from seed to seed; a trade with only a few frames (bakery 4, office 3, the two breakfast frames) returns the same set in every seed, in a different order. `--history` is the only way to vary those: pass it every time, and a frame dealt before goes behind the fresh ones. A frame marked `soft` (the rusty chain on a cassette, bike) is dealt only when no sharper frame of its subject is left, and never leads.

## Place them

- A place page uses 4:5, 4:3 and 1:1 only; other kinds add 3:2. One ratio per row, equal sizes in a row, one dominant
  picture per screen or a row of three or four. Frames sit on the container lines (x 120-1320 on a place, 80-1360
  elsewhere; 342 wide at 390): full-bleed only as a hero or section layer. Left and right edges stay the same down the page.
- One visual world: one light, one grade, one register across the set. Hard sun on one product, a low-key set on
  dark timber or steel only when the whole set matches. Never studio black with daylight, HDR beside a snapshot,
  two photographers' grades. Black and white is one deliberate frame. Never the same frame twice on a page (a smaller
  file, a crop or a mirror of a frame is the same frame) and never three near-identical ones. On a product page
  the product whole in three sections at most, its use, its parts and the people with it in the rest (`sections.md`, Product, rule 2).
- **Hero**: plain full colour, as the client's own (Recipe 3 on a place: a full-bleed top photograph, 480 px tall, with
  nothing on it and the words below it); a software or product hero ends inside the screen. **Rooms**: one detail per
  room beside its facts, a place's rooms are the client's own photographs first. **Menu or goods**: the list in plain
  text beside the offer's composition, never one photograph per line, never a tab. **Photo bands**: product one or
  two; a place one, its `bleed` composition, never next to the hero, and a place closes on a 1:1 shopfront with no
  words (PH-72). **Compositions** on a place (`bleed`, `pair`, `trio`, `strip`, `tall-small`): `sections.md`
  section 4, Designed variety; never two sections built round one picture.
- Text on a photograph: never on a place; elsewhere the hero and one closing band only, on a calm part that is empty and
  dark (or light) at the desktop and the phone crop, or in a solid box, or off the photograph. No scrim, gradient, fade
  or blur. For product, service and software `pick` prints `words:` from the photograph's calm side; for a place it
  prints "under it on the ground". At 768 a 3:2 lead is cropped to its middle: when that puts the words over the
  subject, they go under it as on a phone.
- Every full-bleed photograph that carries words has a crop for 390 (`<picture>`, subject inside the middle 342px).
- Cut-outs only of the client's own subject (transparent WebP, `data-subject="product"`), on the page ground or one
  backdrop, no drop or fake shadow, never stock, never people or buildings. Supplier or maker images only inside a
  product grid, only what is sold, never the hero. Illustration only when the client already owns it, still.

## Show them

- Paste the `<img>` fetch prints. **What a library file is:** WebP, always a 1200 wide, some also a 1600, 1800, 2144
  or 2400 (list them with `list --trade`; the largest is the frame's own pixel width). The older Unsplash and Commons
  frames are downloaded at 500, 960 and 1280 (1920 for the hero) and converted to WebP when `ffmpeg` is on the path,
  else kept as JPEG. `fetch` leaves any file over its cap out of the `srcset` (hero 400 KB, any other 250 KB) and says so,
  so the 2400 of a busy frame often does not ship; it then prints the page estimate against 2,400 KiB, the figure
  `perf.mjs` FAILs above. **The hero's 2x at 1440 (2880 wide,
  PH-27) is not in the library**: the library hero is the largest file within 400 KB (1200 to 1800) and looks soft on a
  retina desktop. Another reason to replace it with the client's own.
- A hero (`--hero id`): `sizes="100vw"` (Recipe 3's top photograph is full width; never a vh term, which sends a tablet
  and a 3x phone to the largest file), `fetchpriority="high"`, eager, and a 780x584 crop for the phone in a `<picture>`
  `<source media="(max-width: 639px)">` (needs `ffmpeg`; subject inside the middle 342 px via the frame's `focus`).
  Every other picture is `loading="lazy"` and `decoding="async"`, `width` and `height` set, `sizes` set to the shown
  width. `--big id` adds the largest file to a full-bleed band only when it is within the 250 KB cap; `--lqip` puts the
  picture's 24px colours behind it.
- A photograph in a nav menu or a tab panel drops `loading="lazy"`; neither holds more than it must (carousels and
  sideways rows are never built). `object-position` is the subject's place (`focus`), so a phone's square crop keeps the cup or the hand; a
  `wide` one (a row of three) keeps `--ratio: 66.7%` on its frame at every width.
- **A photograph is visible from the first paint**: never in an element that starts at opacity 0, clipped or moved for a
  scroll reveal, never under a print, dissolve or mask that develops on load, never a video in its place. Shoot 1440,
  1024, 768 and 390 and look for any empty frame (a grey, blank or half-loaded frame counts): an empty ground is a fault.
- **No print, grade or effect on any photograph**: no halftone, dither, duotone, engraving, grain, glitch, filter or
  blend mode, and no canvas over half of it. Mixed light gets a crop and one ratio system, not an effect. A print is a
  tech page's one effect, on a non-photo ground.
- **Hover** (PH-25, one wording with `motion.md`): a photograph in a card that links zooms to 1.03 (1.02 to 1.03 is the
  range) over 600 ms inside its own mask (the frame is `overflow: hidden`, never grows or moves); a photograph outside a
  linked card does nothing, so on a place every photograph that leads somewhere is a link (a room to its booking,
  goods to their card, the place to its story) and the hover shows in every section. No tilt, no rotation, no Ken Burns at rest; on a place the photograph never changes
  opacity. The linked card also lifts 2px (`motion.md`).
- Place photographs are square-cornered, with no border, shadow, overlay or frame; product and service use one radius
  for every photograph; software windows one radius of 12 to 20px.

## Credits and words (PH-38, CO-22)

No caption, label or description sits under or on any picture (house rule), and no credit, "sample" or example note: a sold
item's name and price sit inside its card's padding (`copy.md`), never as a line under a bare picture. The place's name
goes in the alt text. **Credits are ONE footer line** in the legal row that links or opens the credits list, never a
link per photograph in the footer (in testing: 18 and 20 credit links read as a credit wall). `photos.mjs credits --out .`
prints the line, "Photographs via Unsplash and Wikimedia Commons" (the sources used, never the photographers; at
most 110 characters), and the list; paste the line in the footer and the list on its own page: `--write` makes `credits.html` in the site's legal-page shell, `--href <page>` points the line elsewhere. The list gives each photographer, licence and
source page, `adapted` after any frame cropped beyond its frame (`--adapted id`). A
public-domain frame (the Public Domain Mark) is listed with the Mark's page and its photographer still named. `--text`
prints the same line and list as plain text for a report. Every word on a page is live text, never baked into an image.

## Never

- Another business's identifiable room, counter, sign, cup, bag or product shown as the client's (a whole meeting room, lounge or breakfast room counts: it would pass for the client's own); a machine with its
  maker's name; a named bar's whole room. A face as staff, guest or customer: the library holds hands, backs and faces
  out of frame only. Another place's coast, street or landmark as the client's; a lone house on a hotel page.
- The trade's stock shot: latte art from above, beans filling the frame, the croissant-and-cappuccino still life, a
  made bed, flour thrown on black, a whole figure.
- Mood stock (a curtain, plant shadows, a sky, grass, a forest, fog, an aurora, a waterfall), an animal or a vehicle in
  the frame, a recognisable viewpoint, AI images, composites, Street View, a sight far from the place, a gradient,
  grain, pattern or shader standing in for a photograph.
- The library's frames repeated across builds: pass `--history` every time, so a frame dealt before is not dealt again.
