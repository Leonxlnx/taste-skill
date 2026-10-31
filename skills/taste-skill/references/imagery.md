# Imagery

Pictures are where generated pages most obviously give up: a grey box, an icon in a square, a fake
dashboard, an abstract blob. This file is how to decide what the pictures are, where to find real ones,
how to crop and place them, and what to do when there are none.

## Contents

1. What the study measured
2. Decide what imagery exists
3. Real pictures from the open collections
4. The dealt photographs
5. Cropping and placing
6. Treatment
7. Showing software
8. Drawings: the logo and small icons only
9. Type and colour alone
10. Markup and credits
11. Video
12. Where pictures and footage go

## 1. What the study measured

- On 60% of the studied sites one piece of media covers at least half of the first screen; on half of
  them it covers nearly all of it. Top-scored sites: 68% and 56%. Weak sites: 48% and 39%.
- Only 15% of heroes have no media at all, and those are deliberate typographic statements.
- Media has square corners on 73% of sites. Where corners are rounded the usual radius is about 12px,
  applied to every image alike.
- Top-scored pages carry far more imagery (a median of 37 images against 5 on weak pages): the strong
  sites show, the weak ones tell.
- What the imagery is, by the panel's classification: a mix of kinds 32%, photography 14%, generative
  or WebGL scenes 13%, real product interface 12%, 3D renders 11%, illustration 9%, video 6%, type only
  3%.
- Among the 54 sites the panel scored under 6.8, legibility (text lost over a busy image, or too
  little contrast) was named as a weakness in 13.
- In the October 2026 study of 91 Awwwards Sites of the Day (section 12), the median page carries 7
  pictures (top sites 8, the lowest 2) and footage appears on 42% of sites (half of the top ones, one
  of the 16 lowest).
- Pictures come in whole screens: 42% of scrolled screens hold none and 19% are 90% picture or more.
- 94% of pictures have square corners, and on a typical site two ratios hold three-quarters of them.

## 2. Decide what imagery exists

In order of preference:

1. **The project's own images.** Product shots, the place, the people, the work. Even ordinary
   photographs of the real thing beat beautiful photographs of something else. Ask what exists; look in
   the repository.
2. **Images you can generate** with an image tool in this session. Write prompts as a photographer's
   brief: subject, angle, light, background, crop ratio, and "no text". Generate the hero first and
   make the rest match its light.
3. **The photographs dealt on the direction sheet** and the rest of the library (section 4): sharp,
   modern photographs of places, light, texture and materials, free of credits. Use them where an
   honestly generic picture fits (the open sea for a house on the sea, stone for a mason). They never
   stand in for a person or a screen, and for a room, a dish or a product only as below.
4. **Sharp modern photographs from the open collections** (section 3), 1800px or wider, only for what
   the library lacks (a detail of a room, a dish, the product's use and its load): modern, well lit,
   professional-looking. Honest means nobody could take one for the client's own building, premises,
   person, team or customers, or for its own product, rooms or work (below).
   **Never documentary or archive photographs:** no old Commons or museum pictures, no history
   photographs, postcards, old maps or engravings, no news-like or snapshot-looking shots. In October
   2026 the owner looked at the test pages himself and named them first: serious, old-looking pictures
   made the pages look bad, even where they carried an idea (a card catalogue for a notes app). Say
   the history in words, if at all.
5. **What the subject makes, built in HTML** (section 7), for what no honest picture exists of: the
   document a tool produces, the interface of a piece of software, at true size with real words and
   figures. Never a drawing of an object, a product or a place in its stead (section 8).
6. **Type and space alone,** done on purpose (section 9). An empty slot is better than a bad picture.

**The client's own thing is never shown by another's.** The product, a room, the house and a piece of
work are the client's own or a marked slot: never another maker's product however cropped, unbranded
or out of focus, never a named hotel's room or another house's, never another artist's work, never
another house captioned as the client's, whatever the credit says. Three of four test pages on one
commit failed the publish review for this alone: another maker's cargo bike with its name on the frame
as the hero, two named hotels' rooms as a guesthouse's, another artist's comic on a pen display as a
motion designer's work. All three were credited; the credit did not make them honest. When the client
gives none:

- **A product.** Its large picture (the hero, or the section about it) is a designed frame at the
  product's real ratio with `data-slot="product-photo"`: the product's name in the page's display type
  and its two or three facts (what it carries, its range, its price), on `--surface` or the ink, in
  the dealt corners. Where the hero lays its picture behind the words (full-bleed, filling the first
  screen, or the headline or the name set on or across it), that picture is the use or the place and
  the frame comes in the section the sheet names after it, never a frame under the headline. No
  silhouette, no outline, no drawing, no photograph of another make. With an image tool, the frame
  may hold this product generated as the brief describes it, listed in the Image credits as made for
  the page and in the report (`credit-names-business` fails any other photograph in that frame). The
  photographs show only its use, its load and its place, with no product of its kind in
  them: the shopping in a crate, a child's helmet on a hook, the school street in the rain. At least
  one shows who it is for, the people from behind or far off and without the product. Never a page
  without pictures: a cargo-bike page that shipped none lost its blind test as undesigned.
- **Rooms and the house.** Each room is shown by a detail that belongs to no one (bed linen in window
  light, a chair by the window, a cup on the bedside table, the view from a window) in a frame with
  `data-slot="room-photo"`, beside that room's facts; never a whole room from another house. The
  house is shown as its place (the fjord, the village), captioned with what and where it is.
  `data-slot="house-photo"`, the frame its own photograph of the house replaces, goes on a picture of
  the named place itself from the open collections, its source naming that place; never on a library
  photograph, which names no place.
- **Work.** Each piece is the project's own still made for the page, in its frame with
  `data-slot="work"` at the piece's ratio and size: a frame from your own motion of it first (a CSS or
  canvas loop built for the piece, resting on its best frame), otherwise its title frame, the whole
  frame designed as the piece's own opening title (its name alone, large, in the page's display face
  on `--surface` or the ink, as a film's title fills the screen), with its client, year and role as
  the caption under it. Never a small card of a name and a line in its place (a motion designer's
  page showed her work only as such type cards and was marked down), and never a photograph of someone
  else making or showing work (a pen display, a sketchbook, a light table), however close to the
  trade.

A credit or file title that names another business (a hotel, a maker, a brand) never sits on a picture
shown as the client's: such a picture shows only the world around, captioned with what and where it
is, or is left out. `assets.mjs` notes a find whose title or author plainly names one (a hotel word
beside a name, a maker's name before its product, a work's author); it cannot tell every name from a
place, so read the title and the credit of each find yourself. The report lists
every marked slot and what holds it, so the client's own pictures can replace them. The sheet prints
this rule under the photograph total.

**Rooms, dishes and products are shown, not boxed.** On a page for a place to stay, each room the
page lists has its own picture beside its facts (the client's own, or the detail above); on a
restaurant's page each dish it features has a photograph of that dish as served (the menu itself stays
a list of names and prices); on a shop each product has its own photograph or its designed frame. A
stand-in sits beside the room or dish it stands for, with that one's facts, never as the first picture
of the house or the restaurant. Never grey spec panels, tabs or filled boxes in their place: in a blind
test five rooms set as grey panels read as folder tabs.

**As many pictures as items listed.** A section that lists four rooms shows four pictures, one beside
each room; three featured dishes, three photographs. Never one picture for the lot, and never a detail
in place of a dish. With fewer good pictures than items, list fewer: the kinds of room the house has,
each with its picture, or the dishes you can show with the rest of the menu as a plain list of names
and prices.

**The brief decides what the product is, never the photographs found.** No word, specification or
picture slot changes to match what a search returned: one builder turned a two-wheeled cargo bike into
a trike to fit its stock photographs.

**The quality bar, for every picture before it goes on the page.** Open it at full size and look:

- Sharp at the size it is shown: the source is at least 1.5 times the shown width (twice for the
  hero). The inspector fails pictures shown more than 1.25 times their own size.
- It shows this subject's world, and would not fit the nearest competitor's page or any page at all.
- **It shows this trade, never a neighbouring one.** The sheet names what the pictures show for the
  brief (the trade, its things, its place) and what they never show: a mixing desk is sound, not a
  motion designer's work; wine and tea are not a coffee bar; a car or a scooter is not a cargo bike;
  a skyline, a bridge or a landmark the brief does not name is a postcard. A portfolio lost marks for
  both. What the brief itself names is never banned: a bakery and café shows its coffee, a café with a
  lunch kitchen its dishes. The look-and-fix drops a picture that does not show the client's own world,
  however good it is.
- **It is not the category's stock shot,** unless it is art-directed for this page (its own light, a
  crop chosen for the slot, a detail only this client has). Coffee: full-frame beans, burlap sacks,
  top-down latte art. Bakeries: flour dusted over a board. Wine: a glass swirled against the light.
  Software: hands on a laptop, a team round a screen. Hotels and guesthouses: a made bed shot straight
  on, a folded towel. Food: a flat lay of ingredients, a chef plating with tweezers. Property: keys
  handed over. Health: a stethoscope on a desk. Products: the product floating in mid-air on a
  bright colour with no ground under it. A roastery page with full-frame beans and burlap sacks read
  as generic to its judge. The client's own pictures come first; without them, its use, its load, its
  place and the details that belong to no one (a cup on a sill, the street at its door), never its
  own thing by another's (above). For software, the product's own interface and the customer's world
  come first.
- **It looks like a photograph made this decade for a brand:** well lit, sharp, composed, colour
  clean, the quality of a good Unsplash or Pexels photograph. Not documentary, archival, news-like, a
  tourist snapshot or a museum scan.
- It belongs to one family with the others: one light, one treatment.
- No watermark, burned-in text, frame, scanner edge, noise or heavy compression.
- **Fewer.** No more photographs of the subject and its world than the sheet's photograph total
  (section 5), scenes included, each earning its slot; none at all is a real option (the product, the
  type, the colour, the interface), except on a product page, which shows its use, its load and its
  place (above).
  The rooms, dishes or products a page pictures are their own set, one photograph each beside its
  facts; a gallery or a wall of work is cut to six.
- Nothing in it that is not the client's to show, stand-ins and open-collection finds above all: no
  other maker's brand name or logo, no shop or company sign, no readable house number or licence
  plate, no words that would embarrass the client (a sticker, a slogan, a scrawl), and no child who
  could be recognised (children only from behind, far off or unrecognisable). Crop it out or drop the
  picture; never blur, pixelate or paint it out. A blurred face reads as news or surveillance footage
  (a family photograph with blurred faces lost a cargo-bike page its best slot): take shots with faces
  turned away, out of frame or naturally out of focus, or frame the load and the place. A cargo-bike
  page in a preview showed children outside private homes, other makers' bikes with their names
  readable, a shop's logo and a profane sticker.
- It earns its size: a picture in a large slot has a clear subject; a picture that only fills a gap
  is removed and the gap closed.

Tell `draw.mjs` the truth with `--have`. If you have no product photographs and no image tool, do not
pass `product-photo`; the draw will avoid the directions that depend on showing the object. Pictures
found in the open collections are not the project's own: do not pass `photography` for them.

## 3. Real pictures from the open collections

`scripts/assets.mjs` searches open sources without keys and prints, for each find, a direct image
URL, the page it comes from, its size, its creator, its licence and a credit line. It searches
**Openverse** (one index over Flickr, StockSnap, rawpixel and others) and, when Openverse fails or
finds nothing usable, **Wikimedia Commons**, each through its own API, which gives every find's author
and licence. Their modern photographs are what a page can use; the museum sources (the Art Institute
of Chicago, the Metropolitan Museum) and the archive scans on Commons are the documentary look the
owner ruled out.

```bash
node <skill>/scripts/assets.mjs "bed linen window light"
node <skill>/scripts/assets.mjs "basalt texture" --min-width 2400
node <skill>/scripts/assets.mjs --get openverse:<id>,commons:<id>     # download, record the credits
node <skill>/scripts/assets.mjs --credits                             # the credits dialog and report list
```

By default it keeps CC0, CC BY and CC BY-SA (a public-domain mark is mostly an old archive picture:
`--license safe` adds them), pictures at least 1800 pixels wide, nothing dated before 2000 or titled
with an earlier year, no survey snapshots (Geograph) and no files titled with a camera's number, and
checks that every image it prints actually loads; a source named with `--source` that only holds old
films or objects (the museums, the Internet Archive) keeps its dates. A call that fails
is tried again 1, 2 and 4 seconds apart (Openverse answered 504 for whole sessions in October 2026).
`--orientation`, `--min-width` and `--limit` narrow the list; `--source` picks the sources (Openverse,
then Commons, by default; Commons and NASA for footage; the museum sources only when named); `--json`
gives the raw results. Each result has a ref (`commons:36649959`) that `--get` takes, and a note when
its title or author plainly names a business or a maker (a hotel, a brand, a work's author): such a
picture is never shown as the client's own (§2). No note is no proof: read the title and the credit.

**What to search for.** The inventory (SKILL.md step 1), not the category: "bakery" finds other
people's bakeries. The subject's world is specific:

- **Its place as it looks now:** the city, the street, the harbour, the valley ("gent korenmarkt",
  "lofoten harbour").
- **Its materials,** close enough to read as a surface: the stone of its quay, the grain of its oak,
  its glaze, its tiles ("azulejo tiles", "basalt cobblestones", "oak grain").
- **Its use, its load and its details:** what the product carries and where, without the product in
  it; the details that belong to no one (bed linen, a cup on a sill); the landscape it works in.
- **Never the client's own thing:** not "cargo bike", "guesthouse" or "motion design reel", since what
  comes back is another business's product, rooms or work (§2). Search the use, the load, the place
  and the details instead ("groceries in a crate", "bed linen window light", "flateyri village").
- **Never its history in pictures:** no old photographs, postcards, maps or engravings, however well
  they fit; a history the page needs is told in one line of text.

Search in the place's own words (azulejo, not "blue tile"; Korenmarkt, not "market square") and try
two or three queries per idea. If nothing sharp and fitting turns up, do not fill the slot.

**What makes a good find.**

- It belongs to this subject's world and would not fit the nearest competitor's page.
- It still reads at the crop the slot needs. Look at it before deciding: `--get` downloads it, then
  open the file. A title is not a picture.
- It is large enough: twice the width it is shown at for anything full-bleed (the script prints the
  largest size available). A 1024-pixel Flickr photograph is a half-width picture at most.
- It belongs to one family with the others on the page: modern photographs in one light, or all close
  surfaces in one light. A postcard beside a modern photograph beside a botanical plate reads as a
  scrapbook, and old pictures are out anyway.
- No watermark, no burned-in text or logo, no frame or scanner edge you cannot crop away, and no
  recognisable living person who could be taken for the client's staff or customers. Look at it at
  full size for what the quality bar in §2 rules out (another maker's name or logo, a sign, a house
  number or plate, embarrassing words, a recognisable child) and crop or drop it.
- In colour, unless the brief asks for black and white (section 6). A stand-in whose file is
  black-and-white is left out however well it fits, since a grey dish, room, product or season tells
  the visitor nothing; the client's own pictures are shown as they are.

**Use it with intent.** One sharp picture of the place, large, beats a row of small ones; a material
close-up can hold a whole section behind its text. Each picture appears once on the page, never again
as a crop. Treatments stay within section 6 and the treatment the sheet deals.

**Stay honest.**

- **A found picture is never the client's own.** It may show the client's city as it is today, its
  materials, the details that belong to no one, the use and the load of its product; it may never
  stand in for the client's building, premises, people, team or customers (a bakery counter, the
  house from outside, a smiling barista, a chef at the pass), nor for its product, rooms or work (§2:
  the client's own thing is never shown by another's). A detail or a dish sits beside the room or the
  dish it stands for, never as the first picture of the house or restaurant; the report lists each as
  not the client's. A find whose
  title or credit names another business (a real hotel's room, another maker's product) is never shown
  as the client's own, marked as a placeholder or not (a guesthouse's rooms were real hotels' rooms from
  the open collections, and one of them had no credit at all).
- **Say what and where it is.** A photograph of a place that is not the client's own is captioned
  with what and where it is, as its source names it ("Suðureyri in June", "The Korenmarkt, Ghent"),
  never with a place the source does not name and never in words that tie it to the client; a
  detail beside a room or a photograph of a dish has that one's facts beside it (bed, view, rate;
  name, price), never a line saying it is the client's photograph.
  A picture under or beside a line shows what the line names: a guesthouse set "A white house on the
  fjord" over a village of coloured houses, and its booking section over a lighthouse nobody books.
- **A caption names only what the picture shows.** Read every caption, label and number beside a
  picture against the picture at full size and against its source title: never a breed, a place, an
  object or a use that neither supports ("a dog in a crate", not "a Labrador, crated", when the source
  says only "a dog in a box behind the bicycle"). A picture placed to prove a claim shows the claim
  (two children on the bike, not women riding ordinary bikes); when no photograph does, the claim is
  made in words, never by a drawing of the product (section 8).
- **Record every picture; credit every one that is not the client's own, out of sight.** `--get`
  writes the source, creator, licence and page of each download to `assets/credits.json`. CC BY and
  CC BY-SA require a credit with the title, the creator, a link to the source and a link to the
  licence; `--credits` prints them as a dialog opened by one small "Image credits" link in the footer
  (section 10). Public-domain, CC0 and library pictures go in that dialog too, with their source, so
  every stand-in can be traced and replaced. Never a list of credits across the footer: reviewers
  named it as one of the ugliest parts of the pages.
- **Respect the licence.** CC BY-SA: an altered version (recoloured, combined with other pictures)
  must be shared under the same licence. Non-commercial (NC) and no-derivatives (ND) licences are out
  for a client's site, which is why the script leaves them out unless asked. Read the `note` lines:
  some pictures carry personality rights or a trademark, are public domain only in the United States,
  or come with an archive's statement instead of a licence.
- **Download, do not hotlink.** Save what you use into the project: `--get` puts it in `assets/` at
  1920 pixels wide (pass `--width 1280` for a picture shown at half the screen, `--width 3840` for a
  very large hero where the source has it). The page then works offline, does not break when an
  archive moves a file, and does not load from someone else's server. Every licence the script
  allows by default permits copying.
- **List them in the report:** file, title, creator, licence, source page. `--credits` prints that
  list too.

If two or three honest queries per idea find nothing sharp, modern and fitting, leave the slot out
and let type, colour or the product carry it (section 9); never a drawing (section 8). A picture that
is merely nearby is worse than none. **When the search fails** (the script retries, then searches
Commons when Openverse fails; with no source reached it says so), take the dealt photographs and the
library (`draw.mjs --photos <words>`), then type or the slot's marked frame (§2); never a museum or
archive source in their place, and say in the report which searches failed. For moving pictures, the
same script searches real footage with `--video` (section 11).

## 4. The dealt photographs

- The sheet lists up to eight from one set, so they share a subject and a light. Use no more than its
  photograph total.
- Every photograph dealt and the first two of each sheet are kept in the history, with the trade, so
  the next project's sheet leads with others (one café was dealt the same first picture ten times in
  ten; later six café sheets led with the same two).
- For a trade the library knows (coffee, bread, wine, beer, a place to stay, a bike, furniture, film,
  ceramics) the list comes from every set: at most half of its things, then at most half of its
  places (two at most), the ones other pages were dealt least leading and the ones the trade's last
  sheet listed behind the others, so two sheets of one brief share no photograph while the library
  holds others. Never its stock shot, a neighbouring trade, a landmark the brief does not name, a
  logo, a house number or the inside of a café. A place leads only where the library has none of its
  things. Each trade draws only on the sets that fit it (`sets`: a café never on night streets or a
  bar, a place to stay never on offices, a bike never on cars). A café, a bakery and a bike are dealt
  no night, nightlife or neon. Where the brief names the town of a café, a bakery, a brewery or a
  place to stay (`town`), no library street or coast stands for it (a place to stay on a fjord still
  gets the sea): another city's would pass for its own, so search its place. A place to stay in the
  north or named for a light is dealt no warm coast (turquoise water, white sand, palms, chalk
  cliffs). A portfolio is dealt none of the things, since its work is its own, and one picture of its
  place at most. A place to stay's things are the details that belong to no one (bed linen, a chair,
  a cup, a window), never houses. On a product page with no photographs of its own, none that shows a
  product of its kind is dealt (`product` in library/photos.json): its pictures are the use, the load
  and the place.
- With fewer than six of the trade's things in the library, the sheet says how many there are and
  **Search first**: search the open collections with the trade's queries (Openverse, then Commons)
  before taking any dealt one; the dealt ones are the fallback.
- Each line says where the calm area is. Put text there or keep text off the image.
- More from the same or another set: `node scripts/draw.mjs --photos list`, `--photos <set>`, or
  `--photos "fog coast"` to search descriptions.
- URLs have the form `https://picsum.photos/id/<id>/<width>/<height>`. Request the exact pixel size you
  render at twice the CSS size for sharpness, capped around 2400 wide. Add `?grayscale` only when
  section 0 deals the black-and-white treatment.
- A line marked black-and-white is a black-and-white file. Unless the brief asks for black and white
  (section 6) the draw leaves those out; leave them out of `--photos` searches too.
- These are photographs from Unsplash served by Lorem Picsum under the Unsplash licence. List the ids
  you used in your report and in the Image credits dialog; they are meant to be replaced by the
  project's own pictures.

## 5. Cropping and placing

- **Choose a small set of ratios and stick to them:** for example 4:5 for portraits, 16:10 for
  landscapes and 1:1 for details. Random ratios look like a stock dump.
- **Go large.** A photograph at full width, or at half the screen and full height, has presence. Six
  small ones in a grid have none. If the image is good, give it the room; if it is not, cut it.
- **Crop with intent.** Use `object-fit: cover` with an `object-position` chosen per image so the
  subject sits where the composition needs it (off-centre, on a third, against the text side). The
  first screen's crop shows the subject recognisably (the place with its water and its house, the
  building), not a texture of it.
- **Keep a picture's own lettering whole, or out of the frame.** A film still, a poster, a sign, a
  label or a product shot with type in it (a title card, a gauge, an interface) is shown at its own
  ratio, or cropped so its lettering stays inside the middle 90% at every width (`object-position` per
  breakpoint, `contain` on narrow screens), or cropped so the lettering leaves the frame entirely. A
  blind cover crop that cuts its words reads as broken: a portfolio cut its own work titles to
  "Pelik", "ZUIDKAI" and "KAAP" (round 10), and the inspector warns on heavy crops of such pictures
  (`cropped-lettering`: 15% or more of the width or height cut away).
- **Full-bleed or inside the margins, never into one edge.** A picture at full bleed runs to both
  edges and reads as designed; every other picture keeps the page margin on both sides. A picture,
  window or strip cut by one side of the screen while the other side keeps its margin reads as a
  mistake (`edge-run`).
- **Overlap sparingly and on purpose:** a headline whose last line runs over the top edge of the
  picture, a small image overlapping a large one by a fixed 40–80px. One overlap per screen at most.
- **Square corners** unless the direction or the one-motif shape says otherwise. If rounded, one radius
  for every image on the page.
- **No frames:** no borders, no shadows, no device mock-ups, no browser chrome around pictures.
- **Captions** are one short line in the small size and soft ink under the image, left-aligned to its
  edge. Most images need none. A caption never crosses a piece of work ("Text over pictures", section
  12).
- **Each piece of work once.** On a portfolio, each piece appears at full size once and at most once
  more as a thumbnail. A hero reel is a cut across all the pieces: it does not open on the piece the
  first panel shows, and it opens on a frame without a client's brand mark (or with that mark smaller
  than the site's own name). A scene's cards are as many as the distinct pieces, never padded with
  repeats of the same few.
- Where each picture goes on the page, how large, and what the phone does with it: section 12.

## 6. Treatment

One treatment for the whole page:

- **Untouched.** The default. Pick images whose light already agrees.
- **Greyscale.** `filter: grayscale(1) contrast(1.05)`, or `?grayscale` on the URL. Only where the
  brief asks for black-and-white pictures: section 0 then deals it, for every image on the page. The
  draw never deals it otherwise. A notes app greyed its one colour photograph of card drawers, and a
  guesthouse called Hvit, white, turned grey and its four seasons looked alike.
- **A black-and-white file is the same treatment.** On a page in colour, a stand-in whose file is
  black-and-white (a monochrome photograph from the open collections, a library line marked
  black-and-white, an old print) is left out like a grey filter would be, even when every other picture
  is in colour: check the file, not only the CSS. The client's own pictures are shown as they are (a
  photographer's black-and-white work stays black-and-white). A blueprint that turns its pictures grey
  (a mosaic, a wall of portraits) keeps them in colour.
- **Multiply on a field.** On a light flat ground, `mix-blend-mode: multiply` makes a white studio
  background vanish so a product sits directly on the colour.
- **Darkened for a dark page.** `filter: brightness(0.85) contrast(1.05)` so the image edges sink into
  the ground.

Not treatments: colour washes over photographs, duotone overlays, blur, grain overlays, vignettes,
gradients and fades (a milky white fog over a guesthouse's full-bleed fjord was marked down), tilted
"polaroid" frames with shadows.

For text on a photograph, its calm part first; failing that, a flat dark scrim covering only the
text area, black at 40–55%, on a dark page as on a light one. Never a fade, a gradient or a coloured overlay (the
inspector fails a gradient anywhere). A page named for a light (below) takes no scrim at all.

**A client named for a light or a pale colour** (white, snow, chalk, linen, fog, light, in any
language: Hvit is white, Snø is snow, Lys is light) gets bright, high-key pictures: daylight, pale
grounds, open shadows, the colours clean. They are bright pictures of this place (snow, a white house
in summer light, a pale fjord), never a sunnier coast standing in for it. No scrim and no dark
overlay on any picture, never a dimmed or darkened hero (`filter: brightness()` under 1 included), and
never a dull grey sky or a dusk shot as the first picture (a pale mist is high-key; an overcast grey
is not). Text on such a picture sits on its calm pale part in the ink, or beside the picture; a
blueprint that darkens a picture for white type is set this way instead. The draw deals the brighter
photographs for such a name, keeps the heroes that sit in the dark away from it, and says so beside
the ground. A guesthouse named white opened on a grey sky under a dark overlay and lost its blind
test.

## 7. Showing software

- Build a real fragment of the interface in HTML at its true size, with believable content, instead of
  a shrunken screenshot or a decorative mock-up. Crop to the part that makes the point: one control,
  one row, one panel.
- Believable means real labels, real numbers that add up, one item hovered or selected, proper
  alignment. Grey bars standing in for text are worse than no image.
- Put the fragment directly on the page or on one flat stage colour. No laptop, no phone frame unless
  the product is a phone app and the frame is a plain rounded rectangle.
- **The interface sits in the page's own ground,** in the page's colours, cropped inside the page
  margins or within its section, never run into one screen edge (a notes app's window ran into the
  right edge and the owner named it first: `edge-run`); at most one framed window on the whole page
  (the replay's, when one is dealt). Never the black ground with a white interface slab in every
  section: a blind judge called it generic dark SaaS.
- **One picture that is not interface** and carries the product's idea is worth more than another
  panel: a modern photograph of what the product works on, or the object that carries its idea, shot
  today (never an archive photograph).
- **No form controls as decoration.** Switches, checkboxes and sliders appear only where they do what
  the product does; a row of greyed toggles beside nothing reads as a template.
- Inside a fragment the product's own interface conventions apply (its small radii, its 1px control
  borders, a shadow on its open menu). Put the attribute `data-ui` on the fragment's root element: the
  inspector and the linter then leave what is inside alone, and hold the page around it to the house
  rules. `data-ui` is for cropped fragments only; wrapping a heading or a whole section in it fails.
  Write the fragment's CSS under a `[data-ui]` selector (`[data-ui] .row { … }`) so the linter can
  tell it apart from page styles.
- If the user supplies real screenshots, show them large and uncropped at least once.
- One fragment on a software page replays the product doing its job (sheet section 8, motion.md
  "Product replay"); every pane of every fragment is filled: no empty editor, no half-empty sidebar
  above the fold (the inspector warns, `hollow-fragment`).

## 8. Drawings: the logo and small icons only

Do not illustrate. Drawn objects, products, people, rooms, buildings, food, animals, landscapes,
mascots and decorative motifs in SVG or CSS were the commonest reason reviewers called a page amateur:
next to award sites they read as clip art, however carefully they are drawn. When there is no picture
of something, the section is set in type, or it shows the product's own interface, or a real photograph
of the subject's world, or the marked frame of §2 (the product's name and facts, a work's title
frame); it never gets a drawing in place of a photograph.

SVG is right for these, and only these:

- **The logo and the wordmark.** The project's own is designed for it (a wordmark in the dealt type,
  or the client's real file). Known products the page names (Gmail, Figma, Slack, Chrome, ChatGPT,
  Claude) appear with their real marks, never redrawn: `assets.mjs --logo <brand>,<brand>` saves them
  from Simple Icons at a pinned version (CC0, currentColor, so a row takes the page's ink); a brand
  missing there (Slack, Microsoft, OpenAI, xAI) comes from its own press kit, unchanged. No initial in a
  circle in place of a logo; with no official file, set the name in type. Only products this one really
  works with: never invented customers or press.
- **Small icons:** an arrow in a button, a chevron on a question, the icons inside a product fragment
  (`data-ui`), 64px or less.

A chart appears only inside the product's own interface, marked `data-ui`, the way the product draws
it (app screens: `assets/charts.js`). On the page a figure is set as type: the number large, a short
table, a list of values. A process is said in words, three short steps as type, or shown by the
product at work or the client's own photograph of the hands doing it. A diagram, a chart, a route or a site map
drawn for the page fails, labelled or not: round 9 explained a process with three SVG diagrams of
squares and bars, labels and all, and they read as clip art beside the work.

A real plan stays: the architect's floor plan or the client's own map, supplied as a file or
photographed, shown whole as it is and marked `data-plan` (a map, `data-map`). Never one traced or
drawn for the page; without the real file, give the rooms, the sizes or the route as type.

Never: hand-built illustrations of the product or the place, drawn people, scenes or skylines, blobs
and abstract shapes, isometric art, rows of small drawn motifs, a drawn version of the brand idea
(stones, leaves, waves) repeated as decoration. The inspector fails a drawing past icon size, a
diagram or chart included (`drawn-illustration`), and warns on scattered small ones (`svg-doodles`).

A drawing rendered to PNG or drawn on a canvas is still a drawing: motion is shown with the work's own
stills or with type that moves, never with drawn shapes (round 4: a bouncing-ball onion skin around the
hero). An atmospheric backdrop is shaded toward the page's ground so the work carries the colour.

## 9. Type and colour alone

This is a legitimate design, not a gap to disguise. Only 7 of the studied sites use no imagery at all,
and they hold their own: a median panel score of 7.5 against 7.2 for the whole set.

- Make the typography the image: one statement at 10–14vw, a list set at 5vw, numerals at display size.
- Use colour at scale: a full field, an inverted section, a two-field split.
- Use cards with a fill (the dealt style) to group the facts, so the page has hierarchy without
  pictures.
- Do not add: drawn shapes or motifs, icons in squares, abstract gradients, dot grids, wave dividers,
  floating shapes, emoji, generic line illustrations, or an empty box where a picture "will go".

## 10. Markup and credits

A found picture, downloaded into the project with `--get`, used as the hero:

```html
<img src="assets/korenmarkt-morning.jpg" width="3200" height="2000" fetchpriority="high" decoding="async"
     alt="The Korenmarkt in Ghent in early morning light, trams crossing the empty square">
```

A dealt photograph further down the page:

```html
<img src="https://picsum.photos/id/626/2400/1500" width="2400" height="1500"
     alt="Red and white lighthouse in a turquoise sea below a chalk cliff" loading="lazy" decoding="async">
```

The credits a licence requires, as `--credits` prints them: one small link in the footer's legal line
opens a dialog. Nothing about the pictures' sources appears anywhere else on the page.

```html
<button type="button" class="credits-link" onclick="document.getElementById('credits').showModal()">Image credits</button>
<dialog id="credits" aria-label="Image credits"><form method="dialog"><button aria-label="Close">Close</button></form>
  <ul><li><a href="https://www.flickr.com/photos/…">“Korenmarkt, Ghent”</a> by …, <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>, via Openverse</li></ul>
</dialog>
```

- Always `width` and `height` (or `aspect-ratio` in CSS) so nothing jumps while loading.
- `loading="lazy"` on everything except the hero image, which gets `fetchpriority="high"`, and except
  a picture that an entrance reveal or a scene shows as it arrives: give that one `loading="eager"`,
  or the reveal opens on an empty box.
- `alt` describes the picture in plain words. Decorative repeats get `alt=""`. The script's suggested
  alt is the source's title; rewrite it to say what the picture shows.
- A coloured `background-color` on the image container (the ground or surface tone) so the layout is
  whole before the image arrives.
- The "Image credits" link sits with the legal links at their size; the dialog is plain (the page's
  ground, the text face, a close button) and lists only the pictures the page still uses. The
  inspector fails a footer that carries three or more credits in the open. No credit captions laid
  over the pictures themselves.
- A broken image fails the inspector. Check every picture in the screenshots.

## 11. Video

A moving picture of the subject's world can carry a section the way a photograph does: the river at
the end of the street, the roaster's drum turning, a timber frame going up. `assets.mjs --video`
searches real footage without keys: Wikimedia Commons (every video there comes with web-sized
transcodes; the best source for short clips), the Internet Archive's Prelinger Archives and NASA (the
Earth from orbit, launches). Take only modern, well-shot clips (`--source commons,nasa`, the default): the
Prelinger films (industrial and home films from the 1920s to the 1970s) and any old or news-like
footage are the documentary look ruled out for pictures (section 2). The rest of the Internet Archive
is left out: anyone can upload there, and the licence claims are unchecked.

```bash
node <skill>/scripts/assets.mjs "coffee roasting" --video --source commons,nasa
node <skill>/scripts/assets.mjs "river" --video --source commons,nasa --orientation landscape
node <skill>/scripts/assets.mjs --get commons:49769620        # the clip, a poster frame, the credit
```

It takes a rendition of 720p or smaller (`--res` changes that), lists short clips first, prints each
clip's length and file size, and flags anything over 25 MB or longer than a minute. `--get` refuses a
clip over 25 MB unless you pass `--max-mb`, and saves the source's still frame beside it as the
poster (Commons and NASA; the archive's own stills are too small). An archive film of ten minutes is
too heavy as it stands: trim a few seconds from it with ffmpeg if it is installed, or choose a
shorter clip. Licences, credits and honesty work exactly as for pictures (section 3).

**Choosing a clip.**

- **Short:** 5 to 20 seconds that loop without a visible jump: water, smoke, a turning drum, traffic,
  leaves, a crowd from far away. Watch it to the end before choosing.
- **Light:** under about 5 MB for a section and 10 MB for a hero. In the study sources are 1920×1080
  (the commonest) or 1280×720, median length 10 s; 720p is plenty behind type. For a full-bleed hero,
  cut a tall 720×1280 version for the phone, or set `object-position` on the subject.
- **Clean:** no slate, title card, logo, watermark or burned-in caption. NASA and archive films often
  open with a slate, and the source's poster frame may be that slate. No recognisable person who could
  be taken for the client's staff or customers.
- **Never the client's own:** a found clip of a roastery is not this roastery.
- **Found clips: one per page, two at most.** A found clip shows the world around the client; a
  third makes a theme of it. The project's own footage can carry more: in the study a site with
  footage carries a median of three or four clips. Either way, **one moving picture per screen**;
  two loops running side by side are noise.

**On the page.**

- Muted, looping, inline, with a poster and a fixed size, as `--get` prints it:
  `<video autoplay muted loop playsinline preload="metadata" poster="assets/river-poster.jpg"
  width="854" height="480" aria-hidden="true"><source src="assets/river.webm" type="video/webm"></video>`.
  No sound and no controls on a decorative loop. `aria-hidden` because it is decoration: whatever the
  clip says that matters belongs in the text beside it.
- Anything that moves for more than five seconds can be stopped (WCAG 2.2.2): a page of loops carries
  one visible pause control, and a "Pause films" toggle in the bar is enough for all of them. Footage
  that is the work itself (a motion designer's films, a studio's reel) also offers a way to watch each
  piece whole, with sound, behind a play button that opens a player with controls.
- The poster shows before the clip plays, on slow connections and under reduced motion, so it must
  work as a picture on its own. If the source's still is a slate or a blur, take a frame from the clip
  yourself or use a found picture.
- In the study only 31% of clips had a poster, and the panel recorded the blank and grey boxes
  before they played as faults. Here every clip has one.
- Play a clip only while it is in view, and none under `prefers-reduced-motion: reduce`, where the
  poster shows instead:

  ```html
  <script>
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const clips = [...document.querySelectorAll('video[autoplay]')];
    const inView = new Set();
    const sync = (v) => {
      if (calm.matches) return;
      if (inView.has(v)) v.play().catch(() => {}); else v.pause();
    };
    const settle = () => {
      for (const v of clips) {
        if (calm.matches) { v.removeAttribute('autoplay'); v.pause(); v.load(); }
        else if (inView.has(v)) v.play().catch(() => {});
      }
    };
    const watch = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target); else inView.delete(e.target);
        sync(e.target);
      }
    }, { threshold: 0.2 });
    clips.forEach((v) => watch.observe(v));
    settle();
    calm.addEventListener('change', settle);
  </script>
  ```

- Crop and place it like a photograph (sections 5 and 6): `object-fit: cover`, one ratio, square
  corners, no frame, a ground-coloured `background-color` while it loads.
- Never under body text. On a clip put a headline, one line and one action at most, and check the
  contrast where they sit across the whole loop, not only on the poster: footage that is dark at
  one second can be bright at the next. If any frame drops below 4.5:1 (3:1 for 24px and up), use the
  scrim in section 6 or move the text off the clip. Nothing lies on top of a headline or a statement.
- It is motion: let it be the page's one moving thing, or sit in a section where nothing else moves.
- Credit it with the pictures: `--credits` prints one credits line for both ("Pictures and footage:")
  for the Image credits dialog, and the list for the report, with each clip's length.
- Where footage goes (hero background, inline loop, the frame that grows, a docked card), and what
  the study measured about it: section 12. Nothing that matters plays on hover only, and a full film
  with sound sits behind a play button that opens a player with controls.

## 12. Where pictures and footage go

What strong pages do with their pictures, measured on the latest 100 Awwwards Sites of the Day
(10 July to 17 October 2026, captured at 1440×900 and 390×844). 91 were usable. A panel described where
every picture sat and scored each site the Awwwards way, and a script measured how much of each screen
is picture. "Top" means a panel score of 7.5 or more (36 sites), "lowest" under 7.3 (16 sites). The
scores sit close together (6.7 to 7.9) and a single score carries about half a point of noise, so read
the links between a placement and the score as leanings, not laws.

### How much of each screen is picture

- **All or nothing.** Counting photographs, footage and picture backgrounds (not canvases), the median
  scrolled screen in the study is 16% picture, but few screens sit near it: 42% hold no picture and
  19% are 90% picture or more. Only 19% fall between 20% and 60%. A picture either leads its screen or
  stays out of it.
- **About a third, with rests.** On the 67 sites that put pictures in the page, the average screen is
  36% picture (middle half 18–69%). Top sites sit at 30% and leave 28% of their screens with no picture
  at all: screens of type are the rests between picture screens.
- **The first screen.** A picture covers at least half of it on 41% of the sites and nearly all of it
  on 32%. A full-bleed photograph or film is the whole first screen on 29%; footage is the main hero
  picture on about a quarter.
- **A scene is not a picture.** 66 of the 91 keep a WebGL canvas over at least 30% of the screen, so
  counting canvases the median screen is entirely covered. On the lowest-scored sites that canvas is
  often all there is: the five lowest usable sites (6.7 to 7.0) draw everything in it and put two
  pictures at most in the page.
- **Text is small in area.** The median screen is 8% text. Type is set large and sparse around the
  pictures, not packed beside them.
- **Off-centre.** Measured per section across the crawled sites, pictures sit to the left or right
  939 times, centred 273 times, and full-bleed or behind text 269 times.
- **The phone carries more picture,** not less: 19% of a phone screen at the median, and 27% of the
  first phone screen against 17% on desktop. Full-bleed pictures re-crop to portrait and fill the
  screen; splits put the picture first at full width.

### How many

- **Seven pictures per page** at the median (middle half 1–25). Top sites 8 (middle half 4–27), lowest
  2 (0–4). The floor in SKILL.md step 6, four and usually six to twelve, is the strong half of the
  study.
- **Footage on 42% of sites:** on half of the top sites and half of the middle band, and on one of the
  16 lowest. A site with footage carries a median of three or four clips.
- **Three to five placements.** Sites that use two or fewer of the placements below average 7.31;
  sites that use three or more average about 7.5. The median top site uses four, the median lowest
  site one. Where the pictures go changes from section to section on a designed page.

### The placements, ranked

| Placement | Sites (of 91) | Top (of 36) | Lowest (of 16) | Mean score with / without |
| --- | --- | --- | --- | --- |
| Split: picture in a half or two-thirds | 32 | 17 | 2 | 7.50 / 7.38 |
| Horizontal gallery | 32 | 13 | 4 | 7.44 / 7.41 |
| Full-bleed band between sections | 31 | 14 | 3 | 7.48 / 7.40 |
| Full-bleed picture or film as the first screen | 26 | 10 | 3 | 7.45 / 7.41 |
| Uneven mosaic | 25 | 11 | 1 | 7.49 / 7.40 |
| Picture held while text scrolls | 23 | 12 | 1 | 7.52 / 7.39 |
| Footage behind text | 22 | 8 | 2 | 7.46 / 7.41 |
| Even grid | 20 | 11 | 2 | 7.48 / 7.41 |
| Scattered collage | 19 | 6 | 3 | 7.47 / 7.41 |
| Panel sliding over a held picture | 19 | 8 | 2 | 7.48 / 7.41 |
| Inset frame that grows | 17 | 7 | 1 | 7.52 / 7.40 |
| One picture centred on a field | 14 | 5 | 3 | 7.38 / 7.43 |
| Cut-out object on a flat field | 13 | 7 | 1 | 7.57 / 7.40 |
| Index with hover preview | 12 | 6 | 1 | 7.49 / 7.41 |
| 3D gallery | 12 | 4 | 4 | 7.30 / 7.44 |
| Small card docked in a corner | 11 | 5 | 1 | 7.47 / 7.42 |
| Picture inside or in front of display type | 11 | 7 | 1 | 7.50 / 7.41 |
| One small picture beside a statement | 8 | 5 | 0 | 7.56 / 7.41 |
| Small pictures between words | 6 | 4 | 0 | 7.52 / 7.42 |

- Found on top pages more than their share and almost never on the lowest: the split, the picture held
  while text scrolls, the uneven mosaic, the inset frame that grows, the cut-out on a flat field, and
  pictures set with the type (the last three rows together: 24 sites, 16 of them top, 1 lowest;
  here a picture sits beside or behind the type, never inside a sentence or a headline).
- The horizontal gallery is common in every band and lifts nothing. Use it where browsing is the point.
- The 3D gallery is the one placement that goes with lower scores, and with the lowest usability in the
  table (5.9 against 6.35 for all sites).

### Each placement

Each entry gives when to use it, the geometry at 1440×900, the phone version and how it fails.

**Split: picture in a half or two-thirds**

- *When.* A claim and the picture that proves it. The commonest way strong pages pair words and a
  picture.
- *Geometry.* The picture takes 42% of the width at the median (middle half 33–49%), up to two-thirds,
  at the full height of its section: 680×850 and 720×900 are typical. 38% of these pictures are
  portrait, mostly 4:5 or 3:4. The text starts on the 50% line (x = 720) or on the line where the
  picture ends, top-aligned or docked low, not centred in its half. Let the picture touch the viewport
  on its outer side: only about 30% do in the study, and the ones with margin on every side read as
  placed by default (section 5). Alternate sides only across three or more rows.
- *Phone.* Picture first at full width (4:5, or 4:3 for a landscape), text under it.
- *Fails.* The same split in three sections running; a picture floating in the middle of its half; a
  text column narrower than about 30 characters.

**Full-bleed band**

- *When.* One picture carries a whole screen between type screens: the place, the work, the object at
  full size. One every three or four screens at most.
- *Geometry.* 100% wide and one to one and a half screens tall (median 900px at 1440×900, middle half
  890–1,170px; ratios 1.4 to 1.9). For a slow parallax the picture is oversized in its frame by 4–10%
  (32–72px a side in the study) and travels no further than that. Text is a headline and one line, or
  nothing, docked 32–64px in from a corner over the calm part of the picture.
- *Phone.* A portrait re-crop that fills the screen, with `object-position` set on the subject; the
  text moves to the bottom quarter.
- *Fails.* 11–14px white text over a bright area; three bands with nothing between them; a band that
  only decorates.

**Picture held while text scrolls**

- *When.* A list, steps or a long paragraph that all belong to one picture. If the picture changes for
  each item, it is the index with a preview, below.
- *Geometry.* A 100vh sticky stage inside a section two to six screens long (runways of 1,800–5,400px
  are typical in the study). The picture holds one half (685×880 is a typical portrait), two-thirds, or
  the whole screen with the text passing over it on a solid panel. Text rows about 150px apart, so two
  or three are in view at once.
- *Phone.* Release the stick: picture first, text under it. If the picture swaps per item, keep it as
  a band in the top 40% of the screen.
- *Fails.* Long runways where the text has faded out and the held picture is all that is left (the
  panel recorded several empty stages on phones); body copy set on the held picture.

**Inset frame that grows**

- *When.* Once per page, for the film or picture the page is about, as the move from type into
  picture.
- *Geometry.* The frame starts centred at 35–50% of the width (549×366, 710×480 and 864×540 in the
  study) or as a 16px inset round a full screen, and grows to the full width and height over
  720–2,700px of scroll. Any corner radius goes to 0 as it reaches the edges. A headline sits above it
  before it starts; nothing else on the screen moves while it grows.
- *Phone.* Start at full width inside the 16px margins and grow to a full-bleed portrait, or skip the
  growth.
- *Fails.* The growth is the only thing on screen for three scrolls; a loading spinner or a blank box
  in the first frame (give it a poster, start loading before it enters); used twice.

**Uneven mosaic**

- *When.* A body of work, or one place seen several ways: five to twelve pictures.
- *Geometry.* Two columns, or rows of three on a 24-column grid. Two or three picture widths (for
  example 32%, 48% and 65% of the width, or 5, 7 and 12 columns), neighbours offset vertically by
  120–190px, 130–450px between rows, one or two ratios, a caption under each.
- *Phone.* One column alternating full width and about 70% width, or two columns of 120–180px tiles
  that keep the offsets.
- *Fails.* Random ratios with random offsets, which read as a stock dump. Captions in 9–12px mono with
  index numbers, the award-site habit: here the caption is one line in the text face at body size, with
  no number.

**Horizontal gallery**

- *When.* A set people browse in any order: products, rooms, events, a team.
- *Geometry.* In the study: cards 25–35% of the width with a fourth cut by the right edge, or a
  slider with its neighbours showing. Here a row fits the width inside the margins (three or four
  cards in full, in the dealt card style), since nothing runs into one screen edge and there are no
  sideways scrollers on desktop; a marquee of pictures that crosses both edges, moving slowly (60–120s
  per loop), is the one exception.
- *Phone.* The cards stack, one to a row, or two narrow ones for a long list.
- *Fails.* Arrows and no drag or swipe; a marquee of things people need to read; a carousel holding the
  page's one important picture.

**Panel sliding over a held picture**

- *When.* A change of chapter: the picture holds, and the next section rises over it.
- *Geometry.* The picture is sticky at 100vh; the next section's ground slides up over it at full width,
  its top edge straight or shaped from the subject (the study has the arch of a building's windows).
  Here it is a solid panel with square corners: no rounded sheet tops, no frosted glass.
- *Phone.* Unchanged.
- *Fails.* Decks of five or six cards whose earlier cards linger as slivers; stacking for its own sake.

**Even grid**

- *When.* A set of one kind (layout.md §6, Cards): a shop range, the rooms, the team, the full list
  of work, in the dealt card style.
- *Geometry.* Two, three or four across, equal cells, 8–16px gaps, one ratio (4:5 is the commonest),
  the caption under each picture.
- *Phone.* Two across for products, one for work and people.
- *Fails.* Three equal cards as "features". Cards with a dark gradient at the foot so the label can sit
  on the picture, common in the study: here the label goes under the picture.

**Index with hover preview**

- *When.* A list of eight or more projects or clients where the names matter as much as the pictures.
- *Geometry.* Rows on a 45–80px pitch, names at 30–60px. One picture at a time, about a third of the
  width at 16:9 or a portrait 300–450px tall, at a fixed place (the right half from the 50% line, or
  the centre), swapped within 0.3s. A version that needs no mouse: the names scroll across a picture
  fixed at the centre and the picture shows whichever name is crossing it. In the study the picture
  sits on top of the names; here nothing lies on top of large type, so the names pass in front of it.
- *Phone.* No hover. Give each row a thumbnail about 100px wide, or use the scroll version.
- *Fails.* Pictures that never appear on a touch screen. Rows divided by hairlines, the award-site
  habit: here rows are separated by space, and the active row by ink or a change of ground.

**One picture on a field, or one small picture beside a statement**

- *When.* A pause in the page: a single portrait or object. Or a small picture that gives a statement
  a face.
- *Geometry.* A single centred picture at 3:4 and 75% of the viewport height, on a ground taken from
  the picture. Or a small picture 7–26% of the width (108–374px) beside or above a 48–136px
  statement, aligned to one of its lines, never between its lines or its words.
- *Phone.* The picture above the statement at 60–100% of the width.
- *Fails.* Used as the default for every picture: a picture with equal margins on all sides reads as
  placed by default (section 5).

**Small pictures between words: not here**

In the study, two to four small chips sit inside a statement or between the words of a name. Here a
sentence is words and a headline is words (the inspector fails `picture-in-sentence` and
`picture-in-headline`): the same pictures go beside or above the statement, as above, or in a row of
their own under it at a size that shows what each is.

**Picture behind display type**

- *When.* The object is the subject: a product, a building, a person.
- *Geometry.* The object stands behind 150–200px display type, showing around the letters, or touches
  the edge of the word without covering a letter. In the study a small picture window also sits inside
  the block of type, or the object stands in front and covers one or two letters; here neither: no
  picture inside a headline, and nothing lies on top of one (the inspector fails large text a fifth or
  more hidden), so the type stays in front and whole.
- *Phone.* Keep it, with the type at about 15vw, and check the word still reads.
- *Fails.* A window in the words; an object over the letters; type displaced or glitched by the
  picture.

**Cut-out object on a flat field**

- *When.* Products and objects. The highest mean score in the table, on 7 of the 36 top sites.
- *Geometry.* The object at 35–60% of the width on a flat ground taken from its own colours, standing
  on the bottom edge, inside the page margins or cut by both sides alike, with the type beside it.
- *Phone.* The object at 80–90% of the width under the headline.
- *Fails.* A render floating in a void with no ground; a drop shadow added to a cut-out (no resting
  shadows here; keep a contact shadow only if it was photographed).

**Scattered collage**

- *When.* Archives, ephemera, a festival of many small things. Sparingly: it is about as common on the
  lowest pages as on the top ones.
- *Geometry.* Six to sixteen pictures of 100–300px at a few sizes around a centred heading, never over
  it.
- *Phone.* Re-stack as overlapping pairs in one column.
- *Fails.* Tilted prints and stickers with offset shadows, common in the study and not a treatment
  here (section 6); pictures crossing the text.

**Small card docked in a corner**

- *When.* A standing pointer to the reel or to the next thing.
- *Geometry.* About 216×144 to 240×140, 30–43px from the corner; one per page.
- *Phone.* Drop it, or move it into the flow.
- *Fails.* Content scrolling under it; a second one.

**3D gallery**

- *What.* Pictures on a ring, sphere, helix or tunnel in a WebGL scene, turned by the wheel or by
  dragging.
- *In the study.* 12 sites, 4 of them among the 16 lowest; mean score 7.30 against 7.44, usability 5.9
  against 6.35.
- *Here.* Do not build one. Show the same pictures as an index with previews or a horizontal gallery.

### Footage

**What the study measured.**

- Footage on 38 of 91 sites (42%): 18 of the 36 top sites, 19 of the 39 in the middle, 1 of the 16
  lowest. A site with footage carries a median of three or four clips (middle half 1–8).
- Footage covers at least half of the first screen on about a quarter of the sites, and is full-bleed
  on nearly all of them.
- Clips are short: median 10s, middle half 5–14s; 61% run 10s or less and 88% 20s or less.
- Every decorative clip is muted, loops, plays inline and has no controls. The autoplay attribute is on
  44% of clips; the rest are started by script, mostly as they come into view.
- Only 31% of clips have a poster (13 of the 38 sites). The rest show a blank or grey box until they
  play, and the panel recorded those as blank first paints. Here a poster is required (section 11).
- Sources: 1920×1080 is the commonest, then 1280×720; tall clips at 450×800 or 540×960 for phones and
  portrait tiles. Median source width 1,080px.
- On the page: 16:9 41%, square 19%, portrait (4:5 to 9:16) 25%, 4:3 or 3:2 12%. Corners square on 75%
  (the rest 8px or less, or 20–32px). `object-fit: cover` on 84%, contain on 16% (product strips, letterboxed
  films).

**Where it goes.**

- **Hero background:** full-bleed, cover, often oversized by 1–25% so a drift or zoom never shows an
  edge. Either one slow take or a montage cutting every second or two.
- **Inline, as a picture:** in splits, tiles and cards, at about a third of the width (median 33%,
  middle half 24–45%); a third of these clips are under a quarter of the width and fewer than one in
  ten is full width. Slow, near-still subjects (water, skin, light, a turning object) read as living
  photographs and sit well among stills.
- **The frame that grows** (above), for a reel.
- **A docked card** (above): one small clip in a corner.
- **On hover:** only two or three sites play clips on hover, all of them in an index or list. Nothing
  that matters should play on hover only; phones have no hover.
- **Full films:** about ten sites offer a full film behind a play button that opens a player with
  controls. None autoplays it.
- **Sound:** six sites offer sound behind a toggle; no clip starts with sound.

**How text sits on it.**

- Of about 30 sites with a full-bleed picture or film behind text on the first screen, about 14 set the
  type straight on it and rely on the footage being graded dark where the type sits; about 10 dim it
  (to half brightness, under a 30–40% dark layer, or with a dark fade along the bottom 180–590px);
  about 6 keep the text off the picture, above it or on a solid card.
- What goes on footage in the study is the name or a headline at 47–136px and one short line, docked
  bottom-left or centred. Where body text at 11–14px went on footage or a busy photograph, the panel
  named it as a fault, on top-scored sites too.
- Here: one headline, one line and one action on footage at most, and never body text. Check contrast
  where the type sits across the whole loop, not only on the poster; if any frame drops below 4.5:1
  (3:1 for type of 24px and up), use the scrim in section 6 or a solid band.

**On the phone.** Footage re-crops to a full-screen portrait (a separate tall source, or
`object-position` on the subject); inset frames go full-bleed. One site in the study adds a 40% scrim
on the phone only, where the type covers more of the picture.

### Crops and treatment

- **Ratios.** Of 1,356 pictures and clips measured: 4:5 21%, 16:9 19%, 1:1 16%, 16:10 10%, 3:2 7%, 2:3
  5%, 4:3 5%, 5:4 4%, 3:4 3%, wider than 2:1 6%, 9:16 or taller 3%. Landscape 52%, portrait 33%,
  square 15%.
- **Two ratios do most of the work.** On sites with four pictures or more, the two commonest ratios
  hold 76% of the pictures. The others (five ratios in all at the median) are exceptions with a reason:
  one tall portrait in a run of landscapes, one wide band.
- **Square corners** on 94% of pictures; 62 of the 68 sites with pictures in the page keep at least 80%
  of them square. Where corners are rounded, it is 5px or less on two-thirds of them, or 20–32px on
  card interfaces, one value per site.
- **Cover.** `object-fit: cover` on 78%, contain on 10% (a product on a tile, a letterboxed film).
- **Untouched.** CSS filters touch pictures on only 9 sites, mostly for hover states. A handful use
  black-and-white photography as a set; two multiply scanned paper onto the ground. Several keep the
  interface black, white and grey and let the photographs carry all the colour.
- **Common in the study, not treatments here** (section 6): a fixed grain layer over the whole page
  (about a third of the sites), duotone or tinted photographs, blurred copies behind a picture as a
  glow, tilted prints and stickers with offset shadows.
- **Oversize only by the distance it moves.** 22 sites move pictures with the scroll, oversizing them by
  1–25%. Oversize by the travel and no more, on one picture per screen.
- **Resolution.** The study serves pictures at a median 1.9 times their CSS width, but 17% are served
  smaller than they are shown and full-width pictures at a median of only 1,440px. Here: twice the CSS
  width, capped at about 2,400px (section 4).

### Text over pictures

- In the study, text sits on pictures often and is checked rarely: about 28 notes record text set
  straight on a picture with no scrim, and the faults of 16 sites include text lost over pictures: 8–14px
  labels and body over photographs, and navigation in a difference blend or with no backing passing
  over them.
- Where it works, the text is display size and sits over the calm part (sky, a dark wall, the shadow
  side), docked in a corner or along one edge. Two other forms in the study: a solid card in the
  ground colour inset over the photograph and carrying the heading, and text on the white of a picture
  that fades into the page.
- Here: on a picture put only display text, one short line and one action. Body text, captions and
  labels go beside or under it. Measure contrast at the text's own position (4.5:1, or 3:1 for 24px and
  up). If it fails, move the text to a calmer part or beside the picture, or use the flat scrim in
  section 6; never a fade or a milky fog over the picture. A fixed navigation that passes over pictures gets a solid band, or hides
  while scrolling down.
- **A caption never crosses a piece of work.** On a film, a project frame, a drawing or a product
  shot, the title, the year and the description go in the gutter under or beside it, or in a corner
  the piece leaves empty; never a band across its middle, translucent or not. The middle is where a
  title card, a plan or a product puts its subject, so a band there covers the very thing the section
  presents. A piece that carries its own type or detail (a title card, an interface, a wordmark, a
  drawing's figures and labels) takes no text over it at all. The phone layout, where the caption
  falls under the frame, is usually the right desktop layout too.

### Rules for a generator

1. **About a third of the page is picture.** Across the scrolled screens, pictures fill 30–40% of the
   area, and at least one screen in four carries no picture (top sites: 30% and 28%).
2. **A picture leads its screen or stays small.** A leading picture takes at least 60% of its screen;
   an accent stays under 10% of it. Avoid screen after screen of pictures at 20–40%: in the study 42% of
   screens are 0% and 19% are 90% or more.
3. **Three to five placements per page,** and no two neighbouring sections with the same one. Sites
   with two or fewer average 7.31, sites with three or more about 7.5.
4. **Three to six good pictures,** more only when they are the client's own (study median 7; top
   sites 4–27; lowest 2). Fewer, chosen better, beats a page filled with stand-ins.
5. **Two ratios for at least 75% of the pictures** (76% in the study), a third only for a deliberate
   exception. Defaults: 4:5 for portraits, 16:9 or 3:2 for landscapes.
6. **Square corners on every picture** (94% in the study). If the direction rounds them, one radius of
   4px for every picture and clip.
7. **Split pictures take 42–50% of the width, or two-thirds,** at the full height of the section,
   inside the page margins (the study's sites often touch the viewport on the outer side; here nothing
   runs into one edge, so a picture that must reach the edge goes full-bleed behind the words); the
   text starts on the 50% line. On the phone the picture goes first, full width inside the margins.
8. **Full-bleed bands are 100% wide and 100–150vh tall,** one every three or four screens, oversized by
   10% at most for parallax, with text only in one corner at least 32px in. On the phone, re-crop to a
   full-screen portrait.
9. **One inset frame that grows per page,** from 35–50% of the width to the full screen over
   720–2,700px of scroll, with nothing else moving on that screen.
10. **A row of cards fits the width:** three or four in full inside the margins, 16–24px gaps, in the
    dealt card style; on the phone they stack. Never a fourth cut by the edge.
11. **One moving picture per screen.** Clips of 5–15s (median 10s), muted, looped, inline, with a
    poster, paused out of view; a hero source of 1920×1080 under 10MB, inline clips at 1280×720 or
    smaller under 5MB.
12. **Only display text on a picture:** a headline, one line and one action at most, with contrast
    measured at the text's position across the whole loop. Body text, 16px or more, goes beside or
    under the picture, never on it.
13. **No text across a piece of work.** The title, year and description of a film, a project, a
    drawing or a product go under or beside it, or in a corner it leaves empty.
