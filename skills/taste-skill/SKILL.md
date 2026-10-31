---
name: design-taste-frontend
description: >-
  tasteskill v2.5, the anti-slop frontend skill. Art direction for websites from a study of 247
  gallery sites and 65 professional sites. A script deals the whole direction at random (idea,
  composition, type pairing, palette, frame, scroll scenes) so no two pages look alike, a strict
  no-slop house style is checked in a real browser, and a look-and-fix loop runs on screenshots. Use
  this whenever you build, design, redesign, restyle, polish or review a landing page, marketing site,
  portfolio, product page, one-pager, hero or any public-facing web page, in any stack (HTML/CSS, React,
  Next.js, Vue, Svelte, Astro, Tailwind) — also when the user says a page looks generic, templated,
  "AI-made", sloppy, or asks to make it look designed, premium, award-level or less like every other
  site. Also for app screens: dashboards, admin and analytics views, settings, inboxes and other screens
  people work in, with their own run and rules.
---

# tasteskill v2.5

A page built by a model usually looks like the average of every page the model has seen: a centred
headline over three lines, a little label above it, a row of icon cards, a soft gradient, a few thin
rules and a monospace caption. Nothing in it is wrong and nothing in it was decided. And every model
has favourites of its own: left to choose, it builds the same page every time, whatever the brief.

This skill replaces those defaults with decisions, in four ways:

1. **A script deals the direction; you build it.** `scripts/draw.mjs` deals, at random and away from
   recent builds, the direction, a type pairing from 169 faces with its own scale, a restrained
   palette, the navigation, the footer, the cards and the buttons (each one of about twelve tested
   designs or of the patterns a design-anatomy study read off great sites), the hero and the sections
   (from blueprints and those patterns), one to three small moves, corners, spacing, how pictures are
   treated, whether the page has an interactive piece or a video, and its scroll scenes, none of them
   on more than about one page in ten. You do not choose among options: your
   own choice is the bias this skill exists to remove.
2. **The idea comes from the subject.** In the study, what separated the best sites from the forgettable
   ones was a concept taken from the thing itself, not the styling.
3. **A house style with no ornaments,** measured in a real browser by `scripts/inspect.mjs`, so the
   rules are checked rather than hoped for.
4. **You look at what you made.** Screenshots at three widths, a juror's rubric, fix, look again.

What professional sites do, measured (October 2026, 65 tech companies and shops against 30 pages built
with the previous version of this skill): their largest type is about 3.8vw (the builds: 14vw), body
text 14-16px (17-19), pictures cover about 30% of every screen (10%), almost no page area stands on a
coloured ground (20%), none has a giant name in the footer (53%), and they have half as many blank
stretches. A good page is not louder; it is clearer: the full content in few words, sharp pictures of
the subject large enough to see, a real navigation and footer, and one or two moments of motion that
earn their place.

In the commands below `<skill>` is this skill's folder. Run them from the project's root, so the
working files land in `.taste-skill/` there. The scripts need Node 22+ and an installed Chrome, Edge
or Chromium, and install nothing. `assets.mjs` also needs network access; it uses no API keys.

## Page or app screen

Decide first which of two kinds of work this is.

- **A page** is read and scrolled: a landing page, a marketing or product site, a portfolio, an
  event, a restaurant, a one-pager. It follows **the run** below.
- **An app screen** is worked in: a dashboard, an admin or analytics view, settings, billing, an inbox
  or queue to work through, a wallet, a list with filters, an editor or builder. It follows
  **`references/app-screens.md`**: its own run, its own draw (`draw.mjs --app`), its own house rules
  (quiet borders, small labels and repeated panels are normal there; gradients, glows, icons in tinted
  squares, rainbow charts and invented vanity numbers are not) and `inspect.mjs --app`. Read that file
  whole before you start; the page run below does not apply.

A product site that shows its app is a page; the interface fragments on it follow the app-screen
rules for their insides. Deal the product's app style once, in its own folder, with the page's colours
and type kept:

```bash
node <skill>/scripts/draw.mjs --app --kind <kind> --brief "<the product>" --keep palette,type --out .taste-skill/app
```

and build every fragment the page shows (the hero's live screen, a feature's crop, a chart) as a real
piece of that app: `assets/app.css` for its panels, tables and controls, `assets/charts.js` for its
charts, real data that adds up, one finding stated, cropped and scaled the way the page's blueprint
treats a picture. A fragment that looks like a working product is the strongest picture a software page
has; grey bars and lorem numbers are the weakest. When a request mixes both (a landing page and the
dashboard behind it), build each with its own run and one shared palette and typeface.

## The run

Do these in order. Steps 1–5 take a few minutes and decide whether the page is any good.

### 1. Read the brief and the project

Find out what is real: the subject, the audience, the one thing the page must get someone to do, the
stack, any existing brand (colours, fonts, logo), and above all **what imagery truly exists**: the
project's own photographs or product shots, a real interface that can be shown, an image generation
tool you can call, or nothing. Do not plan around pictures you do not have. Without pictures of its
own, the page uses fewer, sharper pictures of the subject's world (step 6) and lets type and space
carry the rest; it never fills slots with whatever a search returns.

Name the pictures a visitor needs before deciding: for a place to stay, the rooms, the house and the
table; for food, the plates and the room; for a product, the product; for a practice, its work. When
the project has none of them, say in the report that they are missing (or ask, when the user is there
to answer); for a practice's work, choose a direction that does not promise them. **The client's own
thing is never shown by another's:** no other maker's product however cropped, no named hotel's or
other house's room, no other artist's work, no other house captioned as the client's, whatever the
credit says (three test pages could not be published for this alone, all three credited). Without the
client's pictures, the product is a designed frame (`data-slot="product-photo"`: its name and two or
three facts, no drawing) and its photographs show its use, its load and its place with no product of
its kind in them; each room is a detail that belongs to no one (bed linen, window light, a chair) in a
`data-slot="room-photo"` frame and the house is shown as its place; each piece of work is the
project's own still made for the page (`data-slot="work"`). The sheet prints the rule under its
photograph total, and the inspector fails a picture shown as the client's whose credit names a business
(`credit-names-business`). **Rooms, dishes and products are shown, not boxed:** as many pictures as
items listed, each room or product in two columns, its picture at 55% of the width or more beside one
grouped block of its name, facts and price; never a grey spec panel or a filled box in its place (a
guesthouse whose rooms were grey panels read as tabs in a blind test). Never a drawing, and never the
place's birds and weather in their place (`references/imagery.md` §8). The brief decides what the
product is, whatever a search returns; never a page without pictures (a cargo-bike page with none
lost).

If the request is vague, decide and state your reading in one line instead of asking. Ask only when a
missing fact blocks the work (for example, no product name).

Then **inventory the subject** in your notes: eight to twelve things that belong to this client and to
no competitor. Look for its name and what the name means; its address, door number, street and
neighbourhood, and what that place looks like (its tiles, signs, paint colours, typefaces on its shop
fronts, its light, its weather); the numbers in the brief (seats, rooms, minutes to the sea, the
price, the year); the constraint it lives with (only one batch a month, closed in winter, by
appointment); its materials and colours; its rituals and hours (the oven lit at five, the ferry at
seven); the printed things of its world (a timetable, a label, a ticket, a sign). This list is where
the idea comes from in step 4. In blind tests, the page that won each brief was built from an item on
such a list (the client's name and what it means, the street it stands in, the one constraint that
makes it what it is), and the pages that lost had a good composition with a category idea. The list
is also your picture search: each place, material and printed thing on it is a query for step 6.

**A colour in the name sets the ground.** When the client's name names a colour, a material or a
light (white, black, ember, slate, linen, fog, in any language: Hvit is Norwegian for white), the
page's ground and palette follow it, unless the brand already fixes its colours (`--keep palette`): a
house called Hvit stands on white. The sheet names such a word in its colour section; when the dealt
palette contradicts it (a dark ground for a white name, a pale one for Ember), redraw the palette
(`--redraw palette`) and say so in the report. Elsewhere in the brief such a word lends its colours
only when it describes the client, never something it replaces (paper, for an invoicing app). In a
blind test a guesthouse named Hvit lost on a navy-black ground. A name of light or a pale colour also
asks for bright, high-key pictures: never a dark overlay, a dimmed hero or a grey sky first
(`references/imagery.md` §6). Every picture is in colour unless the brief asks for black and white:
a stand-in whose file is black-and-white is left out, like a grey filter; the client's own pictures
are shown as they are.

### 2. Write the argument

Before any design, list the page as claims with their proof, one line per section, the way
`references/copy.md` §1 shows. The claims decide which sections exist and in what order. Delete any
section that has no claim. This is how you avoid the stock sequence of hero, logos, three features,
testimonial, pricing, call to action.

### 3. Draw the direction

```bash
node <skill>/scripts/draw.mjs --sector <sector> --brief "<one line about the subject>" \
  --sections <roles in the order of your argument> [--tone <tone>] [--have <assets>] [--keep palette,type]
```

This deals the whole sheet. Do not ask for options and do not pick a direction yourself (`--options`
and `--direction` exist for a person choosing, not for you): models given a choice took the same five
directions for 19 of 25 pages. If the dealt direction truly cannot carry this subject (it needs
photographs that cannot exist, or contradicts a stated brand), redraw it once with `--redraw direction`
and say why in the report.

- `--sector`: `node <skill>/scripts/draw.mjs --list sectors`. Pick the closest.
- `--sections`: roles from `--list roles` (features, showcase, how-it-works, testimonial, proof, stats,
  pricing, faq, cta, footer, intro, about, work, gallery, list, contact). The hero is implied.
- `--tone` (optional): quiet, bold, warm, technical, playful, luxury, editorial. Only pass it when the
  brief clearly asks for one.
- `--have`: assets that really exist, comma-separated: `photography` (the project's own photographs of
  the place, people or work), `product-photo` (photographs or renders of the specific product, building
  or work, or an image tool that can make them; a practice or a house with its own photographs of its
  pieces or rooms passes `photography,product-photo`), `product-ui` (real screenshots), `illustration`,
  `video`, `mark` (the brand's own solid mark), `route` (a real route with stops the subject travels),
  `plan` (a real floor plan or exploded drawing), `names` (eight or more real names of its rooms,
  dishes, places, projects or products), `document` (a document the product really makes, such as an
  invoice or a contract, when the brief does not name it), `logos` (real logos of clients or press),
  `map` (a real map or route), `data` (real figures, quotes or prices the brief gives: opening hours
  are not quotes), `3d` (a 3D model of the subject). A pattern that needs one of these is never dealt
  without it. Leave it out if you have none: the draw then avoids compositions that depend on them and
  the sheet says how to fill picture slots honestly (software shows its own interface built in HTML; a
  product with no photographs of its own is shown by its designed frame and photographs of its use,
  its load and its place, never another maker's product, never a drawing). Pictures you will find in the
  open collections are not the project's own; leave them out of `--have`.
- `--keep palette,type`: when the brand already fixes colours or typefaces. The draw then deals only
  the composition, and you map the brand's values onto the roles.

The command prints a **direction sheet**. It is the art direction for this build:

- **Adopt it.** Do not blend it with the layout you would have made anyway. If it feels unfamiliar,
  good: the familiar layout is the one this skill exists to prevent.
- Redraw one slot (`--redraw hero | type | palette | photos | scenes | entrance | moves | section:<role> | direction`) only for a
  reason you can state: it contradicts a stated brand constraint, needs an asset that does not exist,
  or is a section that cannot hold the real content (next point). Never redraw to get something more
  comfortable. Record every redraw in your report. Scenes are redrawn twice at most: a third
  `--redraw scenes` lists the ones that still fit, with what each needs, and you take one by id
  (`--redraw scenes=<id>`) or build without one (`--redraw scenes=none`). A page with one honest scene,
  or none, beats a fifth redraw.
- When a dealt section cannot hold the real content (it compares three plans and there is one price;
  it wants five quotations and there are none), do not bend the content to fit. List the others with
  `--alternatives <role>`, pick the one whose assumptions match the content, and take it with
  `--redraw section:<role>=<id>` (the list includes the study's patterns that fit, taken the same way).
  The footer is section 0's: `--redraw section:footer` deals another of its designs.
- **A part, hero or section marked as a pattern** (of the design-anatomy study) is printed as the study
  saw it on a great site: its description is the spec. Build that composition with this page's own
  words and pictures, in the dealt type, colour, corners and card style; where it names a colour, a
  face, a radius or a size the dealt system lacks, the dealt system wins, and the house rules win over
  both. The type note under the type system (section 3) says how a site of the same kind set its
  type: take how its steps relate, never its faces or its sizes.
- **Take the accent from the subject.** If the dealt accent has nothing to do with the subject (a
  software teal on a coffee roaster), keep its lightness and strength and move its hue to the subject's
  own colour (crema amber, copper, the green of the name), and say so in the report.
- **Check the palette against the subject.** A dealt palette is a set of proportions (one ground, one
  ink, one accent, fields) as much as a set of colours. If its colours fight the subject's own material
  (candy pastels for a peat whisky, neon for a mountain hut), redraw the palette once; if the subject
  has unmistakable colours of its own (its material, the paint of its street, the landscape outside
  its windows), keep the dealt proportions and take the colours from the subject instead, and say so
  in the report. A colour, material or light in the client's name decides the ground (step 1).
- Reprint it any time with `node <skill>/scripts/draw.mjs --show`. In a long session, re-read it before each
  section you build.

### 4. Find the idea

The direction is a way of composing. The idea is what makes the page belong to this subject and no
other. Write this sentence in your notes and do not start building until both blanks are filled from
the subject itself:

> On this page, **[something that belongs to the subject]** becomes **[the device the direction calls for]**.

Places to look for the first blank:

- **Its output.** What does the thing produce? Put the real output on the page as material. (A camera
  that prints poems delivered its copy as paper slips.)
- **Its object or shape.** What does it physically look like, in cross-section, in silhouette?
  Enlarge it, crop it, make it the frame or the one motif.
- **Its name.** What does it mean, and what does that meaning look like? (Never a picture inside the
  letters or between the words: that is a generated-page tell now.) On a product page the meaning
  lives in the words, never in place of the product's pictures (step 1).
- **Its place.** Is there one view that makes someone want to be there?
- **Its ritual.** Is there a sequence the page can perform as it scrolls?
- **Its artefact.** What printed thing already exists in its world: ticket, menu, label, receipt,
  invitation, folder, manual?
- **Its opposite.** Which other category owns the feeling this one lacks?

Fill the first blank from your inventory (step 1), not from the category. **The competitor test:** put
the nearest real competitor in the sentence (the bakery two streets away, another oak furniture maker,
another hut on the same mountain). If the sentence still works, the idea belongs to the category: a
loaf of bread is every bakery; the seven doors of the street this one is named after are only this one.
"Clean and modern" is not an idea. The sites the study's panel scored lowest were the ones whose idea
was recorded as "none beyond the standard formula".

**The interactive piece, only when the sheet deals one** (section 0). Most pages get none: when every
page had a live widget, it became the kit (33 of 34 reviewed pages), and half of them were toys.
When one is dealt, it is a tool the visitor would really use, made from the subject's real content: set
the loan and read the real monthly figure; pick the dates and see the free rooms; choose a size and see
it against the room. Rules: it works on a phone with a thumb, it has a plain fallback without script,
it never blocks reading, and it is one thing, not a playground. Its result stays in view while the
visitor works the controls, at every width, and every heading beside it is true for every state it can
reach. It comes after the content it works on (the menu before the brew calculator, the price list
before the estimate), its controls before its result at every width, the result on the section's
ground. Lengths, sizes and counts are stepped buttons of real values, never a range slider. Build it in step 6, then drive every control to its extremes and look at the widest result at
1440, 768 and 390, since the inspector only sees the default state.

**The scenes carry the idea too.** The scroll scenes on the sheet are devices waiting for a subject.
Decide what each one shows from your inventory before building: the row that bends with the scroll is
this photographer's own series, the words gathered into the pocket are what this farm really grows,
the picture that opens to the whole screen is the room the guest will wake up in. A scene filled with pictures that could belong
to anyone is a screensaver, and one still filled with its demo's town, photographs or words is not
started.

### 5. Write the words

Write the whole page as a copy deck (plain text) before markup, following `references/copy.md`:

- **Every headline fits in two lines or fewer at every width.** Do the arithmetic in copy.md §2 before
  committing to a sentence: about 32 characters is safe everywhere at a confident size. The studied
  gallery heroes have a median of 5 words and 32 characters.
- One supporting sentence, directly under the headline (32–48px below it) and shown with it, never
  docked at the foot of the first screen or held back by an animation. When the headline is a name or
  a figure of speech, this sentence says plainly what the thing is. One primary action, named for what
  it does, as a real button on the first screen, and once: never two buttons or links to the same
  place in one block (a roastery's first screen had two Directions buttons).
- **The first screen answers the visitor's first question in large type.** For an event: what it is,
  when and where (the dates belong in the headline or at the second size, never only in small text).
  For a product: what it is and what it costs or does. For a person: who and what they do. Every
  section the visitor came for (the line-up, the menu, the rooms, the price) has its own heading and
  its own place in the navigation.
- **Cut hard: far less text than you think.** The first screen holds 30 words at most, its headline
  12 at most; a section holds 60 words at most outside a list or a table; the whole page about 500
  (award sites carry about 27 words a screen). The inspector warns over each and fails past one and a
  half times (`wordy-hero`, `hero-words`, `wordy-section`, `wordy-page`).
  Fewer, shorter sections: five or six after the hero is plenty; drop any that carries no claim and
  merge two that say one thing. Count before you build.
- **The full content, in few words.** Every section the brief asks for delivers its information
  completely (the whole menu with prices, each room with its details, every speaker, the price with
  what it includes, an answer for each real question), as facts: lists, tables, names and numbers, not
  paragraphs about them. Budgets: a section heading of two to six words; one sentence under it, two at
  most; card or item text of one sentence; no paragraph over about 40 words. Plain words that say what
  the thing is and does, never jargon the visitor has to decode ("Folgezettel spine", "0.8 ms at 90k
  cards"). If a sentence could be cut without losing a fact, cut it.
- **No labels that carry nothing.** No timestamps, "connected source", status chips, tags, kickers or
  captions on cards unless the visitor needs that fact. A caption under a picture says what a visitor
  needs to know about it, or is not there. One heading per idea: no heading that restates the one
  above it ("Four coffees on the shelf", then "Four coffees"), no label repeated over every step of a
  list or a scene ("The roastery" over each of four statements); the inspector warns on both
  (`restated-heading`, `repeated-label`).
- **The sections that convert are complete.** The price says what it includes and the terms (trial,
  billing, cancelling) as a short list; a place people book ends with a real booking block (the dates
  or a request, the guests and the room or table, what is included, the price from), never a bare
  email field (a guesthouse ended on one); proof is facts the page can stand behind (what the file
  format is, how many rooms face the fjord, the warranty), never invented customers or quotes, and
  never a stats band of big figures over one-word labels: a figure stands in the line that says what
  it counts (`stats-band` warns). One email form on the page: a sign-up in the closing section and
  again in the footer reads as a template (`duplicate-form` warns).
- **Nothing on the page talks to the client.** No "drawn until the rooms are photographed", no "sample
  content", no `.example` addresses: what is missing goes in the report (the inspector fails notes,
  template streets and zeroed or 555 phones, and warns on other placeholder contacts).
- Sample details are expected where the brief leaves gaps (dish names, room names and rates, project
  titles) so the design is seen at full density; list them in the report for the client to confirm.
  Proof is never invented: no customers, quotes, reviews, press, logos or business statistics. A
  name you coin (the client's, the product's) is searched with the trade's word before use and
  replaced if a product of that trade has it (references/copy.md §5).
- **Name the real, checkable things; leave out only what cannot be checked.** A page about a real place
  names what a visitor needs to get there and picture it: on the first screen the specific place the
  brief gives (the fjord, the village, the district); when it names only a region, a real place in it
  chosen with the visit block and marked as sample copy in the report, never the region alone (a
  Westfjords guesthouse never named its fjord); then the village, the region's towns, the road, the
  ferry, train or airport that serves it, and the drive time from the nearest town (from the road
  distance on a map, or at about 60 km an hour on country roads when no map can be read, rounded up,
  and marked to confirm). Populations, history and awards come from the brief or stay off the page,
  and no time ever makes a place nearer than it is: a guesthouse in the Westfjords set "forty minutes
  from Reykjavik" (it is hours away), another named no village and no drive time and left the visitor
  guessing. The report lists the facts to confirm (`references/copy.md` §5).
- **A place people go to says how to get there.** A café, bar, restaurant, shop, guesthouse or studio
  with a door gets a visit block with the street (a real street in the right district of the town
  the brief names, no house number unless the brief gives one; for a remote place, or a brief that
  names only a region, the village it stands in and the nearest town with the road from it, and no
  street), the district, the nearest stop (read from a map or one you are sure of, otherwise the
  district's main station) or the drive from that town with its time, the opening hours (for a house, its season and check-in times), a
  "Directions" link to a maps service for that street or road, and one contact. Never a placeholder
  street, never a zeroed or patterned phone (with no phone in the brief, the contact is the email on
  the brand's own domain), never the city's name alone: a roastery that printed hours and an email
  under "Open in Berlin" was marked down for it (the inspector warns `visit-without-directions`). The
  report marks the street, district, stop and hours as sample copy to confirm. A page with no door
  (a product sold online, an app, a portfolio) prints no street, hours or phone.

### 6. Build it, still

Build the page with motion switched off in your head; a page that needs animation to look finished is
not finished. Order of work:

1. **Tokens.** Colour and type roles from the sheet as CSS custom properties. Everything downstream
   references tokens only. `<skill>/assets/base.css` is a neutral foundation you may start from (reset, token
   names, fluid type steps, grid, focus and selection styles, the motion helpers); it has no look of
   its own.
2. **The hero, in the shape its blueprint describes,** set in the dealt type, colour and frame, at
   desktop and at phone width. Within the house rules its geometry is binding, over the direction's
   composition too: what is large, where the words sit, how the picture is cut. The headline takes
   the dealt display step, or `--step-hero` where the sheet prints the blueprint's own giant size (two
   pages built such a hero at the step and read as timid), and stands whole on the first screen, its
   last line clear of the fold (`hero-cut` fails a title the fold cuts). **It fills the first screen alone:**
   `min-height: 100svh` with the navigation inside it, and nothing of the next section (its heading,
   text, picture or ground) in view at 1440 by 900 or 390 by 844; on the owner's review the next
   section crowding into the first view was what made the pages read as cluttered
   (`hero-not-alone` fails it). Get the main thing clear before anything
   else exists: the first screen is built round the page's own idea at display scale, and its largest
   type carries that idea or, for a name whose meaning the page is built on (Klee is clover), the
   name; never a bare category line with nothing of this client in it ("Roasted and poured in
   Berlin"). **The headline never repeats the logo:** when the name is the headline, the bar shows no
   second wordmark on the first screen (the mark alone, or the wordmark once the hero has scrolled
   away); otherwise the headline says something new. **Never the template stack:** a centred headline and a line under it over a photograph
   card with round corners or a row of two or three cards, with or without actions. A roastery page
   dealt "the object on a plain ground" built exactly that, and the judge called it any café; a
   portfolio set its name over two work cards; the inspector fails both (`template-hero`). **A split hero has a large headline
   or a full-bleed picture:** beside a picture that holds half the screen, or in a strip between
   pictures above and below it, the `h1` is about 5vw or more at 1440 (72px; the sheet raises the
   display step for a split hero), on two lines; words that cannot be that large go over the picture,
   full-bleed. A 48px headline in a 50/50 split read as a shop template in a blind test, and the
   inspector fails one under 64px.
3. **Each section in the shape of its blueprint,** with this project's content. A blueprint is one
   example of a shape (what is large, what sits beside what), not a drawing to trace: let the real
   content decide the details, and leave its props behind (a café blueprint's opening-hours bar stays
   with cafés). Neighbouring sections never share a layout, and picture beside text twice running is
   one layout; at least one section breaks the split grid (a full-bleed picture, a headline across the
   width, an 8/4 asymmetry): a cargo-bike page ran 50/50 blocks all the way down and read as a stock
   theme (`repeated-split` warns at three in a row). Each section keeps the structure the sheet prints
   for it (a list, a grid, a split, a statement …): never one structure three times on a page, never
   two alike in a row (a notes page built six sections as a heading, a line and a list panel;
   `same-structure` warns at three and fails at four). The key content stands in the open (the specs, the loads, the rooms, the menu); tabs and
   accordions only for secondary detail such as the questions. **Cards group what belongs together:**
   in two or three sections, the things a visitor compares or reads as one (the plans, the rooms, the
   visit details, the features) stand in the card style section 0 deals, filled, never outlined; text
   floating loose where it belongs to a group loses the hierarchy. Never a card inside a card (a
   product window on a card is one), never a card laid half or more over a photograph, never more
   than one product window on the first screen, never a page of nothing but cards
   (`framed-elements`, `boxed-page`); the other sections stand on the ground. A card or tile is filled
   top to foot, as tall as what it holds: never a name at the top and a line at the foot with the
   middle empty. **Carry the idea into every
   section,** pricing and FAQ included: the commonest failure in the study is a distinctive first
   screen followed by stock blocks.
4. **Pictures: fewer, better, larger.** Professional sites give about 30% of every screen to pictures;
   the builds this skill used to make gave 10%, mostly small, soft or random. Order of sources:
   1. the project's own;
   2. generated, if you have an image tool: the best way to show this exact subject;
   3. the photographs dealt on the sheet and the rest of the library (`draw.mjs --photos <words>`):
      sharp, modern, no credit needed; atmosphere, never a stand-in for a person, and never the
      client's own product, room, house or work (step 1); where the sheet says **Search first** (a
      trade the library holds fewer than six photographs of), source 4 comes before these;
   4. only for what the library lacks (a detail of a room, a dish, the product's use and its load),
      sharp modern photographs from the open collections (`node <skill>/scripts/assets.mjs "<query>"`:
      Openverse, then Wikimedia Commons when it fails, with retries; 1800px or wider by default; never
      the museum sources; never a search for the client's own thing). Look at each one, and
      every stand-in, at full size before using it, and crop or drop any that shows another maker's
      name or logo, a shop or company sign, a readable house number or licence plate, words that would
      embarrass the client, or a child who could be recognised (children only from behind, far off or
      unrecognisable);
   5. never a drawing in place of a picture: inline SVG is for the logo and small icons, and a chart
      only inside a product fragment (`data-ui`); a drawn diagram, chart or illustration on the page
      fails, labels or not, so say a process in words (references/imagery.md §8);
   6. type and space alone. An empty slot is better than a bad picture.

   Rules: every picture shows this subject's own trade and world, as the sheet's "What the pictures
   show" line says, never a neighbouring trade's things (a mixing desk for a motion designer) or a
   landmark the brief does not name, never the category's stock shot unless it is art-directed
   (full-frame beans, hands on a laptop: `references/imagery.md` §2), and is requested at least 1.5
   times the size it is shown (twice for the hero); one treatment for all (section 0); no more
   pictures of the subject and its world than the sheet's photograph total (section 5), which keeps three for a gallery: a few good
   ones beat twelve weak ones (the rooms, dishes or products a page pictures are their own set, one
   each), and none beats a bad one. **Never documentary or
   archive photographs:** no old Commons or museum pictures, history photographs, postcards, old maps
   or engravings, no news-like or snapshot shots; the owner found they made pages look serious, old and
   cheap. Every photograph is modern, well lit and professional-looking (a good Unsplash or Pexels
   photograph; the library's are), or the slot goes to the product, the type, the colour or the
   interface. Every file the page asks for exists: a `src`, a
   `srcset` crop or a CSS background that is not there fails. Words on a photograph sit on its calm part, of one tone, at 1440, 768 and
   390 alike: the crop moves as the screen narrows, and the inspector reads the pixels under the
   letters. Flat colour tiles, one per project or card, are a wall of boxes: one picture leads, on
   the page's ground. The first picture a visitor sees shows the product or the place itself (the cup
   and the bar, the room, the product working), never a street, a facade or a blurred mood shot; if no
   such picture exists, the hero is set in type (a product with no photographs of its own shows its
   designed frame, or a picture of its use or its place with the frame in the section after: step 1). Each photograph appears once on the page, never again as a crop (a
   scene's stamp of the picture it has just shown is the one exception): a cargo-bike page showed its
   one family photograph three times. Never a blurred or pixelated face: take shots with faces turned
   away, out of frame or naturally out of focus, or frame the load and the place (that photograph's
   blurred faces read as news footage). A picture under or beside a line shows what the line names: "A
   white house on the fjord" stood over a village of coloured houses. A photograph of a place that is
   not the client's own is captioned with what and where it is, as its source names it, never with a
   place the source does not name; a room or product stand-in has the name beside it; each has its
   credit in the Image credits dialog.
   Pictures of one series count as one: at most two from one shoot. A drawing rendered to PNG is still a
   drawing. A picture that carries its own lettering (a title card, a sign, a label, a poster) is
   cropped so the lettering stays whole or leaves the frame, at every width: a portfolio cut its own
   work titles to "Pelik" and "ZUIDKAI" (`cropped-lettering` warns). Never a picture inside a headline
   or a thumbnail inside a sentence. Software shows itself large on the first screen, at a size a
   visitor can read, beside the headline and never under it (the sheet deals only heroes that set it
   so), and at least one other large picture that is not an interface card; never more
   than two sections in a row made of interface cards. Its interface sits in the page's own ground,
   cropped inside the page margins (never run into one screen edge), with at most one framed window on
   the page; never the black ground
   with a white interface slab in every section that every model builds. One modern photograph or object
   that carries the product's idea (a card catalogue for a notes app, shot today) does more than
   another panel.
   Switches, checkboxes and sliders appear only where they do what the product does, never as
   decoration, and a control in a product fragment (a search box, a New note button) either works or
   reads as static: no pointer, hover or focus, never a field the visitor types into in vain
   (`dead-control` warns). Credits go in one "Image credits" dialog opened from a small footer link
   (`assets.mjs --credits` prints it), one for every photograph that is not the client's own, whether
   its licence asks or not (`uncredited-picture` warns), never as a list across the footer, never as a
   sentence on the page. When the project has footage or a real picture of its own product, the first screen shows it,
   large. A portfolio shows its work on the first or second screen, before any statement, scene or
   photograph of its city, with one place photograph on the whole page at most (a motion designer's
   page opened on four screens of Rotterdam before her work). The work is pictures of the work, never
   small type cards (`portfolio-without-work` warns). Work invented for the brief is shown as the
   project's own still made for the page (a still generated as the copy describes it, a frame of your
   own motion of it, or its title frame filling the whole frame at the piece's ratio), in a frame
   marked `data-slot="work"` that the report lists; never a photograph of someone else making or
   showing work, nor a stock or location photograph posing as a piece (`portfolio-without-work` fails
   a photograph credited to another among the work), never an empty frame.

   **Logos of known products are the real ones, never drawn.** When the page names products it works
   with or the brief names (Gmail, Google Calendar, Figma, Slack, Teams, Chrome, ChatGPT, Claude),
   `node <skill>/scripts/assets.mjs --logo gmail,figma` saves their marks from Simple Icons at a pinned
   version; a mark it lacks comes from the brand's own press kit, used unchanged. Never a hand-drawn
   logo, never an initial in a circle in its place; with no official file, the name is set in type. A
   row of logos takes the page's ink at one size. The project's own logo is designed for it: a wordmark
   in the dealt type, or the client's real one.

   `references/imagery.md` covers searching, licences, video, drawing, crops and treatments.
5. **The navigation, the footer, the cards and the buttons** as section 0 deals them, each one of
   about twelve tested designs or one of the study's patterns, built at the sizes and with the
   behaviour written there: the owner found every page with the same plain bar, the same three button
   shapes and a one-line footer. Each part, and the hero, ends on a **Must show** line: the built part
   is checked against it, and it names what a still at rest shows (a hover may follow, never be all of
   it). One button family on the page: the dealt button for every action (in the
   bar, on a card and in a form at that part's height) and at most one quieter sibling
   (`button-family` fails a third shape; folder tabs and a round monogram count). One action once a
   screen: the bar's action and the hero's button never go to one place (`duplicate-action`). The
   navigation never hides on scroll and is built in the
   form dealt (`nav-not-as-dealt`). The
   navigation carries the page's sections as one- or two-word links and the one action; nothing
   stands above it (no announcement or information strip, `announcement-bar`) and nothing in it is a
   sentence (a manuscript tool put a sentence in its bar and the page read as chaos; `nav-sentence`
   fails it, and any link or button there over three words). The footer is a designed
   section on its own ground, built as dealt, never a single line or a credit row
   (`footer-not-as-dealt`): links, contact, legal and the Image credits link at
   text sizes, never a giant name or email, never a list the page already shows as content, never a
   link to another company's product (`footer-other-sites`); a closing
   line in it is 6vw at most, on one screen with its button and links. A page ends once: a footer that opens on its own closing line carries the call to action (the sheet then
   builds no cta section), and the visit details of a place stand in one place only. **The
   interactive piece,** only if dealt, in the section where it proves the claim, with real content, a
   thumb-sized phone version and a plain fallback.
6. **The scroll scenes,** when the sheet deals them (section 9), each with the section it carries: the page's big
   moments, the row of work that bends with the scroll, the picture that opens to the whole screen,
   the word that buckles under the scroll. Copy the shared stage and the scene's files from
   `<skill>/assets/scenes/`, fill the scene with this project's own pictures and words, and set the
   page's tokens so it takes the page's look. `assets/scenes/demo/<id>.html` is a working example of
   each, and its content is a placeholder: every picture, word and drawn thing in your scene comes from
   this subject. A scene whose pictures or words are still the demo's, or the stand-in a script draws
   when it is given nothing, is unfinished. A scene is composition: it decides how long the page is and what
   each screen shows, so it is built now and seen in every look round, not added at the end. It
   replaces the content of the section it carries, never adds screens of nothing in front of it, and a
   page with scenes still has a length budget: about 12-16 screens at 1440 in all, of which the scenes
   hold about six. `references/scenes.md` says how to put one on a page, fill it, fit it and check it.
   On a phone a heading set in letters is whole wherever the scroll stops: its letters land on a short
   clock as it enters, or the scene rests (the inspector fails a word left half-drawn). Below 600px a
   list laid over a picture drops into the normal flow under it, and nothing is clipped by its stage:
   a coffee panel that showed two of its four coffees on a phone was marked broken, and the inspector
   fails text cut off by its box at rest (`clipped-text`; one line of display type cropped on purpose
   at the screen's side or foot is a crop and passes). The inspector also looks at each scene's
   finished composition and fails a list drawn as boxes there (`boxed-list`: outlined items, tickets
   cut to a shape, items that each hold a box of their own) and a display heading left alone on its screen for two screens (`lone-heading`);
   `scenes.mjs` warns a settled step whose heading's letters are turned or off their line
   (`tilted-letters`) or whose picture or filled box the screen edge cuts to a sliver (`edge-sliver`).
   A software page gets one scroll scene at most. A page built without one (`--redraw scenes=none`) is
   about 8-12 screens, with nothing pinned in a scene's place. A section that pins counts with the
   scenes, and so does a hold written in words (a hero whose window widens over a screen of scroll):
   the sheet deals one only where a scene would fit, and says so under it. About one page in
   two, one of its scenes is a researched technique instead (`library/techniques.json`): a principle,
   a direction to take and what breaks it, with no files and no demo. Build it on the shared stage as
   `references/scenes.md` §8 shows, in this page's own type, colour, pictures and words, never as a
   copy of any site. Avoid what
   breaks it first, and make every frame of its hold a finished, readable composition: never one strip
   on an empty screen, a fan that hides the texts or a text a screen away from its title. A hold that
   steps (a technique or a scene of your own), where its steps carry pictures, gives each step its own
   picture, never one photograph held under every step; where it needs
   none, its statements stand on the ground alone, with no photograph added. It sets its statements as
   short headlines at display size (40px or more on desktop, marked up as h2 or h3: the 36px statement
   rule is for paragraphs), leaves no step frame near empty, and without the pin never repeats one
   picture: with only one, show it once and set the steps beside it. A roastery added one photograph
   to a type-only focus pull, set four 30px statements beside it and repeated it three times down the
   tablet page; it read as stock, and the inspector fails a picture shown three times
   (`repeated-picture`). Check it with `scenes.mjs` like any scene; if it cannot be built honestly
   within three look-and-fix rounds, `--redraw scenes`, which counts toward the same limit of two.
7. **Fullness and air.** Look at each desktop screen as a poster: one dominant thing and the content
   it carries, with clear air round it. The space between sections (section 0) is generous, never a
   whole screen: a screen that is mostly empty ground is an underbuilt section, not a rest; one
   deliberate rest per page is the limit, and the inspector fails a page with two or more near-empty
   screens.
   Running text, lists and tables are in the full ink at 16px or more (15px on a phone), on dark
   grounds too; under 14px fails (under 15px on a phone), and a list's own labels count as the list.
   Only captions and the footer's legal line are smaller. Under a display heading text is 18px or more
   on desktop. Grey is for secondary notes; running text under 4.5:1 against its ground fails
   (`contrast`).
8. **The frame.** The page has one pair of equal outer margins at every width (as section 0 deals
   them, 16px at the least on a phone), and nothing that is not full-bleed touches or runs past one
   screen edge while the margin holds at the other: a notes app's product window ran into the right
   edge and the owner named it first (`edge-run` fails it). Every section uses the width the page has
   set up: when its text sits in the left half, the right half holds its picture, its second column,
   its list or its figure, never nothing, and a left column never ends while the one beside it runs
   on (`empty-left` warns). Asymmetry lives inside the grid, never in the frame: a void is placed only
   when something closes it on the far side. Sections stand apart by the space section 0 deals, 16vh
   or more at 1440 counted from the last content of one to the first of the next (`section-air`);
   no stretch of the page taller than about half a screen holds nothing at all. Every section the
   visitor came for opens with a heading that names it, and the first screen carries the page's title
   in an `h1`. These are what readers name first when a page looks wrong ("no clear title", "random
   empty space", "everything is pushed to one side"), and the inspector measures each of them. On a
   page longer than about ten screens at 1440 (a page with scenes always is), the navigation or at
   least the one action stays in reach on every screen, the way the dealt navigation says. A hero that
   animates its bar away hands it on to that navigation (`references/layout.md` §7).
9. **States and semantics.** Real links and buttons, visible focus, alt text, a phone layout that is
   its own composition. Every navigation and skip link lands on the section that holds what it names,
   never on a scene that only introduces it. Every control, any tool included, works from the
   keyboard alone in reading order and has an accessible name: its visible label, or `aria-label` when
   it shows only an icon.

Read `references/type.md`, `references/colour.md` and `references/layout.md` when you need the detail
behind a decision; the laws below are the short form.

### 7. Gate

```bash
node <skill>/scripts/lint.mjs <source files or folder>
node <skill>/scripts/inspect.mjs <url or path/to/index.html>
node <skill>/scripts/scenes.mjs <url or path/to/index.html>     # when the page has scroll scenes
```

`scenes.mjs` photographs every scroll scene at 0, 10 … 100% of its hold, on desktop and on a phone,
and the reduced-motion page; with scenes or a product replay on the sheet, `inspect.mjs` also films the
whole scroll (`desktop-film-NN.jpg`). A scene that never started or rests on desktop is a `FAIL`, and
so is a replay beat the film never shows.

`lint.mjs` scans source for banned patterns and stock phrases. `inspect.mjs` opens the page in a real
browser at 1440, 768 and 390 pixels, measures it (headline line counts, type sizes, fonts actually
loaded, colours, rules, shadows, gradients, contrast, overflow, and the frame: equal margins, sections
huddled on one side, blank stretches, the title, untitled sections, text against the screen edge) and
saves screenshots to `.taste-skill/inspect/`. Fix every `FAIL`. Treat each `WARN` as wrong unless you can defend it to a
designer in one sentence. Re-run until there are no `FAIL`s. Do not argue with the meter and do not
hide things from it. The inspector serves local files over a throwaway local server; if the page must
also open straight from the file system, open `index.html` that way once before you finish.

Inspect what the visitor receives. With a build step, run the last gate on the production build
(`vite build && vite preview`, `next build && next start`, or the built `index.html`), not only on the
dev server: minifiers and bundlers change what ships (one dropped a `backdrop-filter` that the dev
server showed). The inspector warns when it is looking at a dev server.

### 8. Look

Passing the gate means nothing banned was measured. It does not mean the page is good. Open the
screenshots the inspector lists (every viewport, with your image viewer or Read tool) and critique them
with `references/critique.md`: the sixteen passes, the Awwwards-weighted score, the caps. Write the critique
down in its format, fix the top three problems, run the inspector again, look again. Three rounds at
most.

Judge only the pictures. If a problem is visible in a screenshot, it is real, whatever the code says.

### 9. Move

Now build the motion layer. It is required, and it is more than one fade: the inspector counts the
elements that really move while the page loads and is scrolled, and fails a page under eight (it warns
under sixteen). Any scroll scenes are already built (step 6); around them the layer has five parts:

1. **The signature move** named on the sheet: one, done well (a dealt scene can be it). On a software
   page it is the product replay: the product's own window, large, acts out what the product does for
   the visitor, its section held while the scroll steps the beats (sheet section 8,
   `<skill>/assets/replay.js`). Its first state is a full window, the visitor's own work before the
   task, never an empty table waiting for its first beat. It is loud enough to register: its content
   fills the window in every frame, its text is 18px or more (16px on a phone), each beat changes about
   a third of the window, the result lands large and in the accent, a panel that opens is in the page's
   own tokens over whole rows (never a second white ground on a dark page), and on a phone the held
   heading stays in view (`held-heading-cut` fails one cut off above the screen or under the bar). A
   notes app's replay whose beats changed 4-24% of its window read as quiet: under about 15% of the
   window a beat is faint, and `replay-faint` warns on one (or on a largest beat under 30%) and fails
   when most are.
2. **The entrance the sheet deals** (section 8): `data-entrance` on the body, its markers on the first
   screen, its CSS already in base.css, and only its own rule below the fold. Nothing else enters: no
   fade-up on every block, and no masked line rise or shutter unless the dealt entrance is `set-type`.
3. **Feedback on every control:** press, hover and focus on buttons, links, cards and any tool.
4. **The small moves the sheet deals** (section 8, one to three from the study's motion patterns: a
   hover on the cards or a list, a scroll-linked line, a picture that drifts in its frame): each once,
   where its line says, on native scroll or under the hand. A good site has many special motions, not
   one; these are the page's others, never something entering below the fold and never a pin.
5. **Video or a moving picture only as section 0 deals it.** Most pages get none; motion comes from
   the page itself.

Transform and opacity only; every move has a `prefers-reduced-motion` fallback that keeps the content
and drops the travel. A move that changes the colour or the layout of whole screens (colour by
chapter, a pinned story) is part of the composition, so build it in step 6 and let every look round see
it. `references/motion.md` has the tokens and tested recipes. Then run the inspector once more and check
every screenshot for content that failed to appear.

### 10. Report

Do not report until all of these are true; each one was skipped in a test run that came out badly:

- `inspect.mjs` shows **0 FAIL** at 1440, 768 and 390, on the final version of the page.
- You opened every screenshot it listed after the last change, not only the first screen.
- With scroll scenes: `scenes.mjs` ran on the final page with no problems, and you read every sheet
  (desktop, phone, reduced motion).
- A stranger reading the first screen for five seconds can say what this is and what to do.
- The first screen at 1440 and at 390 shows the hero alone; the sections stand well apart; nothing
  runs into one edge of the screen.
- Every section has a heading; the margins match on both sides; no stretch of the page is empty.
- The words are counted: the first screen 30 at most, a section 60, the page about 500.
- The page is about 16 screens or fewer at 1440 (the inspector's header counts them), and the
  navigation or the one action can be reached from every screen.
- The critique of your last round is written down in the shape of `references/critique.md` §4.

Tell the user, briefly: the direction dealt (name and seed) and any redraws with reasons; the idea
sentence and the interactive piece, if one was dealt; the final scores from your last critique round
and what still falls short; every picture and clip with its source (and, where a licence asks, its
credit in the Image credits dialog); which bundled photographs stand in for photography, and every
marked slot (`data-slot`) with what holds it, so the client's own pictures can replace them; and any sample content that must be swapped before launch. Do
not claim a check you did not run.

## House rules

These hold on every build, whatever the direction. `inspect.mjs` measures them.

| Rule | Instead |
| --- | --- |
| **Headlines: two lines or fewer, at every width.** Every `h1`–`h6`, and the main line of the first screen whatever its tag. | Cut words. Then widen the measure. Size last. |
| **A clear title on the first screen**, in the page's one `h1`, and a heading on every section, one per idea. | Say what this is: the name with what it does, the product with what it is for, the event with its date and place. |
| **The hero alone on the first screen.** Nothing of the next section in view on load, at 1440 or on a phone; its title whole above the fold (`hero-cut`). | `min-height: 100svh`, the navigation inside it, the next section after the section gap. |
| **Air between sections:** 16vh or more at 1440, as section 0 deals it. | Fewer sections, fewer words, each with room round it. |
| **Equal outer margins; nothing run into one screen edge; no section huddled on one side** with the other half of the screen empty. | Everything that is not full-bleed keeps the margin on both sides; close every void with something on its far side: the section's picture, a second column, a list, a figure. |
| **No blank stretches** taller than about half a screen. | The dealt section gap. A deliberate rest is a placed picture or a field of colour, once per page. |
| **Statements are paragraphs.** An intro sentence or a quotation set large is marked up as `<p>` or `<blockquote>`, stays at statement size (36px or less on desktop, 24px on a phone) and runs to about 25 words, three lines. | Larger than that it is a headline and the two-line rule applies. In blind tests jurors read a 42px sentence over four lines as a four-line headline. |
| **No eyebrows.** No small label above a heading, no pill badge above the headline, no "New ·" chip. | Put the information in the heading or the first sentence, or drop it. |
| **No monospace** outside real code blocks. | The text face. Tabular figures where numbers align. |
| **No index numbering.** No 01 / 02 / 03, no (001), no "Step 2". | Order shown by position, size, or the words. A real `<ol>` if order matters. |
| **No thin rules.** No hairline dividers, no 1px outlined boxes, no grid lines, crosshairs or crop marks. | Space. A step in background tone. A change of scale. A filled shape. |
| **No gradients.** Not as backgrounds, not on buttons, not in text, not as a fade or a milky fog over a photograph (`gradient`). | Flat colour, or a real photograph with the words on its calm part; at most a flat dark scrim under the text, black at 40–55%. |
| **No shadows on things at rest.** No glows. | A tone step between surfaces. Shadows only on what truly floats: a menu, a dialog. |
| **No assistant palette.** No yellow-cream ground with terracotta or rust; no violet, indigo, lavender or periwinkle (a blue lightened for a dark ground drifts there; `palette-purple`). | The dealt palette; a blue lightened toward its cyan side. |
| **No tiny uppercase letter-spaced labels.** | Sentence case at a readable size. |
| **No icon-topped cards, no outlined cards.** | Filled cards in the style section 0 deals, where things belong together. |
| **No glass.** No backdrop blur, no translucent panels or bars. | Opaque surfaces a clear tone step from the ground; the navigation section 0 deals (a floating pill too is opaque). |
| **No bar above the navigation, no sentence in it.** No announcement or information strip over the bar. | The dealt navigation: the wordmark, one- or two-word links, one action. |
| **The navigation never hides on scroll** and is the one dealt, not a plain bar (`nav-not-as-dealt`). | The navigation section 0 deals, on every screen after the hero, as its Must show line says. |
| **One button family:** the dealt button and one quieter sibling, no third shape (`button-family`). | The dealt button in the bar, the hero, the cards, the forms and the footer, at that part's height. |
| **The footer is a designed section,** never a single line. | The footer section 0 deals, built as dealt (`footer-not-as-dealt`), on its own ground: links, contact, legal, Image credits. |
| **No documentary or archive photographs.** No old Commons or museum pictures, history photographs, postcards, old maps, engravings, news-like shots. | Modern, well-lit, professional photographs (the library's first), or none: the product, the type, the colour. |
| **The client's own thing is never shown by another's.** No other maker's product however cropped, no named hotel's room, no other artist's work, whatever the credit says (`credit-names-business`). | The marked slot as the sheet says: the product's designed frame, a detail that belongs to no one, the project's own still; around it the use, the load and the place. |
| **No emoji, no gradient blobs, no decorative shapes, no drawn diagrams, charts or illustrations, no fake dashboards of grey bars.** | A real picture, a real interface fragment, the process said in words, or nothing. |
| **No styled accent word** in a headline (italic, serif, coloured, underlined). | One face, one colour. The words carry the emphasis. |
| **The dealt type system:** its faces, its weights, its six steps. Two families at most. | Map every other size onto the nearest step. |
| **No pictures in headlines or sentences.** No photograph between the words of a headline, no picture inside the letters, no thumbnails inside running text. | The picture gets its own place, beside, above or behind the words, at a size that shows what it is. |
| **No headline in a card, no template stack.** The hero headline stands on the page ground or on its picture, never in a panel, card or box; and never a centred headline and a line over a round-cornered photograph card or a row of two or three cards, with or without actions (`template-hero`). | The first screen as one composition in the dealt hero's geometry, built round the page's idea: headline, one sentence, the action, the picture. |
| **One ground, one ink, one accent.** No page on a coloured ground with a second hue on it, no third hue anywhere, no tinted cards, chips or badges, no ground or panel colour per section or card, no band sampled from a photograph (`surface-count`). | Neutral ground (white, off-white, near-black) and one surface tone; the ink, the accent or the dealt field as one band; colour from the pictures; the accent on the action. |
| **No giant name or email anywhere, no credit walls.** | The email at the h3 step or smaller, with a Copy button and a mailto link; the dealt footer with its links, contact and legal at text sizes; picture credits behind one small "Image credits" link. |
| **No drag rails or progress bars** outside a working tool, no range sliders, no line with a knob or dots on it that reads as one, and no switch, checkbox or toggle that changes nothing: a length or a count is a row of stepped buttons; no sideways scrollers on desktop. | A list or grid that fits the width; stepped buttons of real values; features as lines of text at full ink; a control only where it does what it says. |
| **No page built only of boxes, no boxes in boxes,** no box laid over a photograph, no outlined boxes in a row, no bento grids, no wall of tiles in several fills, no staggered folder tabs, no heading alone in its column or on its screen, no empty half-rows (nothing on the left, text on the right) (`framed-elements`, `boxed-list`, `boxed-page`, `bento`). | Filled cards in the dealt style where things belong together, in two or three sections, side by side and never one inside another; the rest on the ground, separated by space and size: questions as plain rows, specs as name and figure; the heading over its content; the key content in the open, tabs or an accordion only for secondary detail. The product's window holds no card inside it. |
| **No labels that carry nothing**, no walls of text, no stats band of big figures over one-word labels. | Facts, few words, a figure in the line that says what it counts; see step 5. |

Three places keep their own conventions and are left alone by the inspector: real code in
`<pre>`/`<code>` (monospace is correct there), real tables and form fields (they may have lines), and
a real interface fragment whose root carries the attribute `data-ui` (the product's own borders and
menus; see `references/imagery.md` §7).

Why these, honestly. Some are what the study measured: among the 247 sites, those the panel scored
7.5 or higher used icon feature cards 1% of the time against 28% for sites under 6.5, pill badges 14%
against 34%, gradients 22% against 52%, shadows 24% against 48%, tiny tracked caps 16% against 57%.
Others are the owner's taste and go against current gallery fashion: monospace labels, index numbers
and hairline grids are actually *more* common on award sites than on weak ones, which is exactly why
generators imitate them and why they now read as costume. They are banned here without exception.
`references/tells.md` keeps the dated registry.

Removing ornament leaves space. Never fill it with another ornament. Fill it with the full content,
with a good picture of this subject, or close the gap inside the section; the air between sections
stays. Leave a screen empty on purpose once per page at most.

## Laws of the craft

Short form. Numbers are from the study unless marked as house style.

**Type**
- The dealt six steps are the scale. The hero takes the display step the sheet deals, or `--step-hero`
  where section 3 prints it for a hero built on giant type: on professional sites the largest type is
  about 3.8vw (55px at 1440); a giant headline is a dealt event, not a habit.
- Display type: tracking and leading as dealt. Text: 16–18px, leading 1.45–1.6, 45–75 characters a line.
- Weights: only those the sheet loads. A weight the face lacks is faked by the browser (the inspector
  fails it).
- Left-aligned by default. Centre at most one moment.

**Space**
- One grid, one pair of margins as section 0 deals them (32-72px at 1440, 20-24px on a phone), used
  everywhere; a full-bleed picture runs to both edges, everything else keeps both margins. Text blocks
  share two or three left edges on the whole page.
- Asymmetry inside the grid, never in the frame: the two outer margins are equal, and an off-centre
  heading is answered by something at the far side of the grid.
- The hero fills the first screen alone. The gap between sections is clearly larger than any gap
  inside one: 16vh or more at 1440 as dealt (the study's median is about 240px).
- Each section has a different composition from its neighbours; cards group what belongs together
  in two or three of them, in the dealt style.

**Colour**
- One ground, one ink, one accent. The accent appears on the action and perhaps one other thing.
  Professional sites put almost no page area on coloured grounds; colour comes from their pictures.
- Running text in the full ink. A page set in soft grey reads unfinished.
- Surfaces are separated by a clear step in tone (the dealt `--surface`, 6-9 lightness points from
  the ground), never by a line or a shadow, and never softened back to a faint grey-on-grey.
- Two grounds: the page ground and one surface tone. At most one section changes to a field in the
  ink or the accent (the sheet deals it). Nothing fades into anything.

**Imagery**
- One dominant, sharp picture beats six small ones. On the top-scored sites the hero media covers at
  least half the first screen 68% of the time.
- Same crop ratios, same treatment, the dealt corners.
- No image is better than a placeholder, an icon, an abstract shape, or a blurry or random picture.
- Every picture is in the project, listed in the report; none is presented as the client's own.
- Nothing ever lies on top of a headline or a statement (the inspector fails it).

**Components**
- Buttons: the dealt design (section 0: its shape, height, type, fill and hover), flat, decided once
  for the page; the brand's own button wins where there is one. Most strong heroes have one button,
  or two (the action and a quieter second).
- Navigation: the dealt design, on every page, with the real sections as links and the one action,
  nothing above it and no sentence in it. On a long page it stays in reach the way its design says.
- Cards: the dealt style, filled, for what belongs together; one style on the page.
- A control explains how to use it by its form, its label and its place. When it seems to need a
  sentence on how to operate it, redesign the control instead of adding the sentence. What a field
  accepts is different. First remove the limit where you can: a date picker, or a parser that takes
  any common format. A limit that remains, such as password rules or file type and size, stays visible
  beside the field and is tied to it with `aria-describedby`.
- The footer is the dealt design, a section of its own: it works (links, contact, legal) at text
  sizes. None of the 65 professional sites studied sets a giant name or email there.

## Special cases

**An existing brand or design system.** Pass `--keep palette,type`, map the brand's colours and faces
onto the roles, and take only composition from the draw. The house rules still apply; if the brand
itself requires a banned device (its logo sits in a gradient, its accent is violet), keep the brand
asset, say so in the report, and pass `--allow <rule>` to the inspector for that rule only.

**Redesign, restyle or review of an existing page or app screen.**

1. **Record the before.** Run the project as it is and inspect it into its own folder
   (`inspect.mjs <url> --out .taste-skill/before`, with `--app` for an app screen) and lint its
   source. Read the code: the framework, the styling method (Tailwind v3 or v4, CSS modules,
   styled-components, plain CSS), the components, and what must survive: routes, forms, data,
   behaviour, the brand's own assets.
2. **A review stops here.** Critique the before screenshots with `references/critique.md`, list the
   findings with the inspector's measurements, and name the three changes that would move the page
   most.
3. **Keep the stack, the content and what works.** No framework or styling-library migration; check the
   dependency file before adding anything. A restyle keeps the layout and takes type, colour and
   components from a dealt direction (`--keep` whatever the brand fixes); a redesign deals a full
   direction and rebuilds the sections from its blueprints inside the existing components. Either way
   proceed from step 2 of the run with the page's real content.
4. **Order of work, biggest effect for least risk:** type (faces and scale), colour (one ground, one
   ink, one accent), the frame (margins, section rhythm, a title on the first screen and a heading on
   every section), states (hover, focus, loading, empty, error), then the stock components (icon
   cards, pill badges, gradient blobs, bento grids) replaced by the dealt blueprints and section 0's
   navigation, footer, cards and buttons.
5. **Prove it.** Inspect again into `.taste-skill/after`, compare before and after at every width,
   click through every link, form and menu that worked before, and report the before and after
   measurements side by side.

**A component or a single section, not a page.** Skip the draw unless there is no direction to follow.
Match the surrounding design, apply the house rules and the laws, and still inspect the result.

**No checkout, no form backend.** The primary button goes to the real destination when the brief names
one. Otherwise it opens an email to the client's real address with a written subject and body (`mailto:`
with the visitor's choices filled in); with no real address, it points at the page's own contact or
`#checkout` section and the report says it must be wired before launch. A sample address the brief did
not give is not a real one (for a made-up brand its domain belongs to a stranger): the report lists it
as sample content, and no form that sends a visitor's details (orders, bookings, delivery addresses,
sign-ups) is wired to it; such a form posts to an endpoint the client gives, or stays unwired with its
handler named in the report. The visible contact line and its mailto link stay (`references/copy.md`
§5). Never a made-up `.example` address, never a fake payment form.

**No Chrome or Node 22.** Run `lint.mjs` (Node 18+), take screenshots with whatever browser tool you
have, and critique those. Say in the report that the inspector could not run.

**No network.** If `assets.mjs` reaches no source, use the dealt photographs and type, and say in the
report that the open collections could not be searched.

## Files

| File | Read it when |
| --- | --- |
| `references/app-screens.md` | Any dashboard, admin, settings or other app screen: its own run, rules, tokens and checks. |
| `references/copy.md` | Writing the argument and the copy deck (steps 2 and 5). The two-line arithmetic. |
| `references/type.md` | Setting type: scales, tracking, measure, loading fonts, pairing. |
| `references/colour.md` | Applying the palette: roles, proportions, tone steps, dark pages, contrast. |
| `references/layout.md` | Grid, margins, rhythm, section variety, navigation, footer, the phone composition. |
| `references/imagery.md` | Choosing, finding, crediting, cropping and treating pictures; what to do with none. |
| `references/motion.md` | Step 9. Budget, tokens, recipes, reduced motion. |
| `references/scenes.md` | Step 6, when the sheet deals scroll scenes: putting one on a page, filling, fitting, the phone, checking, the catalogue. |
| `references/critique.md` | Step 8. How to look, how to score, what to fix first. |
| `references/tells.md` | The dated registry of generated-page tells and what each is replaced by. |
| `references/research.md` | The study: method, numbers, what the best and worst sites do. Cite it, do not guess. |
| `scripts/draw.mjs` | Deals and reprints the direction; `--photos`, `--site <id>` for more references; `--app` deals an app style instead. |
| `scripts/assets.mjs` | Step 6: searches open collections for real pictures of the subject's world; `--get` downloads with the credit, `--credits` prints them. |
| `scripts/lint.mjs` · `scripts/inspect.mjs` | The gate. |
| `scripts/scenes.mjs` | The gate for scroll scenes: each scene at 0-100% of its hold, desktop, phone, reduced motion. |
| `assets/base.css` · `assets/base.js` | An optional neutral foundation to build on. |
| `assets/replay.js` · `assets/replay-demo.html` | Step 9 on a software page: the product replay the sheet deals, and a working example of its six patterns. |
| `assets/scenes/` | The scroll scenes: the shared stage (`stage.js`, `stage.css`) and, for each scene in the library, its `.js`, `.css` and a working demo page in `demo/`. |
| `assets/app.css` · `assets/charts.js` | For app screens: a neutral shell, panels, tables and controls, and small SVG charts drawn to the app rules. |
| `library/` | The data the draw reads: directions, heroes, sections, type systems, palettes, photographs, studied sites, motions, scroll scenes (`scenes.json`), researched techniques dealt in place of a scene (`techniques.json`), product replays (`replays.json`), the patterns of the design-anatomy study (`patterns/`: heroes, sections, navigation, footers, cards, buttons, type and motion, with what each fits and needs; `--list patterns`), and the app styles, shells and screen patterns (`app.json`). Do not read it whole; use the script. |
