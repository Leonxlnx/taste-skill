# Photographs

On quiet pages, check aligned 1440 × 900 screens, including the last partial screen. At least three in four show the section’s subject. A product window in HTML, a photograph from the ladder, a drawing, a figure from supplied numbers, a map, a document or a named logo can carry the point. Use another view for another claim. Decorative shapes, icon tiles and unrelated photographs add no evidence.


## Choose the picture

1. **The client's own pictures.** Start with the photographs, art, screenshots or renders supplied with the brief.
2. **A built picture of the thing itself.** Show the product UI in HTML, draw the product, its output or its world in one style, or build a chart or scale from the data. Start here for a game without art files, an unphotographed product or a software claim. Read `subskills/illustrate/SKILL.md` for a drawing and `subskills/data-picture/SKILL.md` for figures.
3. **A photograph whose subject fits.** A stand-in can show a landscape, street, material, hands at work or a room of the right kind. A room needs the whole room or the building. A detail belongs beside a whole view. Never another maker's product, carrots for breakfast, a pillow for a room or mood beside prices. If no frame shows the claim, build its picture or leave it in type.

For photographs, write `data-source` and `data-subject` on the image. For a drawing of an attachment and its companion screen, put `data-subject` on the bought part, so the phone crop checks that part. Sources include `client`, `commissioned`, `phone`, `supplier`, `illustration`, a library id or `stand-in`. Keep one drawing style across the page and use real logos.

## Where to find a photograph

The library supplies licensed detail photographs of hands, tools, materials and processes. `photos.mjs pick` normally caps them at one in three pictures. For a place with no client files, `--draft-lead` allows a lead and lifts the cap. A deal is a set of candidates. Look at the actual frame before using it.

If the brief names a region, pass `--place "<region>"` or `--brief BRIEF.md`. A landscape of that region can lead. Use `--own-land` for land sections when the brief says the business uses that land. A live search can supply a street, a room of the right kind or the material the page names. Do not claim stock depicts a named client's work.

For a project case, show the client’s photograph when supplied. Otherwise use a whole interior of the right kind, identify the reference in the case and list it as a stand-in in the report. A plan can explain the change beside that picture. List the client shots needed to replace stand-ins. For a guesthouse ask for each whole room from the door, the building, the breakfast as served and a daylight detail. For a workshop ask for the bench, a hand using the tool and the finished piece.

## A product without photographs (PH-04)

Draw the product from its known shape, controls and output. A dimension view can show fit. For variants, tie each swatch to its matching picture and price. Use a supplied render or the product-render helper when the brief asks for 3D (`effects-objects.md`). A material or workshop photograph can show context. Cropping the badge off someone else's product does not make it the client's. For the shot list, ask for the product whole, its use and the parts named in the copy.

## Live search (stand-ins for what the library lacks)

`photos.mjs search` asks Wikimedia Commons for photographs (JPEG, 1600 px wide or more; CC0, CC BY, CC BY-SA or public
domain; files named as paintings, drawings, maps, logos or posters left out; one file of a series) and keeps the
results in `.taste-skill/found.json` under `--out`, so `fetch` and `credits` take their ids (`f` and a number) like
library ids. `fetch` reads an entry only as `search` wrote it (an `f` id, a Commons file and its Commons page, no
`files`): an entry made or changed by hand is skipped with a warning, and `credits` skips a credit whose links are not
its source's own (Commons, creativecommons.org, Unsplash). With `--trade` and no words it runs the trade's own search words:

| Trade | search words |
|---|---|
| yoga, pilates, spa, wellness | yoga studio, yoga class, pilates studio, sauna interior |
| pottery, ceramics | pottery wheel, pottery studio, ceramics workshop |
| a studio (art, design, photography) | artist studio, design studio, photography studio |
| bike shop or workshop | bicycle workshop, bicycle repair stand, bicycle mechanic, city bicycle, cargo bicycle |
| hotel, guesthouse, inn | hotel facade, guesthouse, hotel room, hotel bedroom, inn exterior (the building and the rooms: never the library) |
| wedding | wedding ceremony, wedding table, wedding bouquet, wedding reception, wedding rings |
| restaurant | restaurant kitchen, restaurant interior, chef plating |
| workshop by craft | woodworking workshop, blacksmith forge, workshop tools |
| bakery, cafe, florist, salon | the trade's own: bakery bread, bakery counter, baker dough; coffee shop interior, espresso machine; florist shop, flower market; barber shop, hair salon |

Search for the actual subject in two or three plain words, such as “bicycle workshop” or “linen weave”. Use `--count`, `--min 1200` for a row picture, or `--orientation portrait`.

Every result is a **candidate**: open its page and look at the file full size. Keep it only when it shows the subject
sharp, in plain colour; no readable name, sign or logo of another business (a hotel's name on its facade, a club's
name on its wall: drop it or crop it out); no face shown as the client's staff, guests or customers; no landmark
passed off as the client's place; one light and grade with the rest of the page. Write its alt text new (the file's
title names someone else's place). It is a **stand-in**: the report lists it with the photograph to shoot in its
place; nothing on the page says so; its credit goes in the one footer line like any other.

## Against the claim, not the keyword

Each photograph is picked for what its section's heading says, never for a word in it. In testing
the pictures matched their keyword and contradicted the page: five other headphone models (two
with cables) on a wireless page, latte art for "roasted on Tuesdays", 40 people in a "small-class"
studio, pillows and a lamp for "the rooms", a sauna "by the water" with no water, a coffee sack as
a design studio's "work", the same oven twice in a row.

- **The plan writes one line per photograph:** `heading says X, picture shows Y`. Y must show X:
  "Rooms from €95 / the double room with its bed and window" passes; "Rooms from €95 / a pillow"
  fails. Change the picture, never the heading to fit it.
- **A product page:** never another model of the product, never the opposite of a feature (a cable
  on a wireless page, a full-size bike on a folding-bike page), never a colour the brief does not
  sell. Every colour the swatches offer is a picture the swatch shows.
- **Rooms.** Show the whole room or building. A detail belongs beside the whole. For work, show the client's finished work. For a workshop, show the process. For a menu, show the named dish as served.
- **Products.** Match each product in the copy notes to a supplied or built picture. Keep the name in the alt or `data-subject` when it describes the picture. Use a library or search frame only for the subject it truly shows.
- **Missing files.** A room can have its bed, view, size and price in a list. A studio can show a dimensioned plan. A game can use a scene built from the brief. Record any client file still due (`sections-library.md`, client-slots).

## Pick and fetch

```bash
node <skill>/scripts/photos.mjs list                       # trades: detail frames dealt by default, land, can lead
node <skill>/scripts/photos.mjs list --places              # the place names the library knows, for --place
node <skill>/scripts/photos.mjs pick --trade bakery --sections oven,dough,bread --pictures 14 \
     --history .taste-skill/history.json
node <skill>/scripts/photos.mjs pick --trade cafe --sections hero,bar,bar,coffee,coffee,beans,beans,hands --draft-lead --pictures 12 \
     --history .taste-skill/history.json                                                     # no client photographs
node <skill>/scripts/photos.mjs pick --trade guesthouse --sections hero,breakfast --pictures 12 \
     --draft-lead --own-land --place "Lofoten, Norway" --history .taste-skill/history.json
node <skill>/scripts/photos.mjs search --trade "yoga studio" --out .                       # what the library lacks: stand-ins
node <skill>/scripts/photos.mjs search "linen weave" --count 8 --out .                     # a material detail
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
  restaurant, a ceramics studio, a patisserie, a salon, a jeweller, a goldsmith, a locksmith: its own photographs, else
  stand-ins from a live search (`search --trade restaurant`, the table above), else type. A **workshop**
  names its craft (`--trade blacksmith`, `weaving`, `letterpress`): only that craft's frames are dealt, so a smith's page
  never shows a weaver's loom; no craft named, nothing is dealt.
- `--sections` takes subject words in page order. Repeat a subject only when distinct views are useful. For `rooms` the detail library leaves the slot open. Supply a whole room or building, with any detail beside it. An empty deal leaves the choice of a built picture, a better source or type.
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
- `list` gives current trade counts. Look at the pixels before accepting an id. `hands` can yield a desk detail and `breakfast` may yield one ingredient. Neither proves a whole scene. Treat placement hints from `pick` as suggestions and follow the actual crop.
- **Variety:** the seed ranks the deal (a frame rated 8 or more has a head start of 0.3 in a 0-1 draw, not a place at the top), so a cafe's or a bike shop's deals differ from seed to seed; a trade with only a few frames (bakery 4, office 3, the two breakfast frames) returns the same set in every seed, in a different order. `--history` varies the deals of one site: pass it every time, and a frame dealt before goes behind the fresh ones. **Across folders**, set `TASTE_SKILL_RECENT=<file>` to share recent frames and palettes: `pick` and `fetch` then keep the frames of every build in that one small file (unset, the default, nothing is written outside the project; `--no-recent` leaves it out for one run), and a frame another build used lately goes behind the fresh ones of its subject, the most recent furthest back, so two cafes built in two folders show different frames where the library has them; when it has none left `pick` says so, and a live search fills the rest. A frame marked `soft` (the rusty chain on a cassette, bike) is dealt only when no sharper frame of its subject is left, and never leads.

## Place them

- Give each photograph a job. Show the whole, then the construction detail at a different scale. For six or more photographs read `subskills/image-direction/SKILL.md`.
- Line the main frame up with the wrap or take it full bleed as the section ground. Try an overlap within the picture area or one shaped mask per page when it follows the subject. Keep one light and grade across the set. Use the PLAN's corner treatment.
- **Rooms** show the whole room or building, with a detail only beside a whole view. A menu or price list can stand on type.
- **Words on a photograph** can sit on a calm part on every page kind. Check text contrast at desktop, tablet and phone crops. When the subject moves under the words, change the crop, use a solid panel or move the words onto the page ground. Leave the image free of scrims, blur and grading.
- Give a full-bleed photograph carrying words a phone crop in `<picture>`. Check that the visitor can still recognise the subject at 390.
- Keep a cut-out of the client's own product on one ground. A supplier image belongs with the item actually sold.

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
  and a 3x phone to the largest file), `fetchpriority="high"`, eager, and a 780x975 (4:5) crop for the phone in a `<picture>`
  `<source media="(max-width: 639px)">` (needs `ffmpeg`; subject inside the middle 342 px via the frame's `focus`;
  without `ffmpeg` the img's sizes get a phone term that covers the same 4:5 box). Both carry `data-phone-fill`: keep it,
  so a place hero's photograph grows on a phone into what its words leave (`layout-v4.md`, the place hero). A hero
  photograph of your own gets it only when its phone source covers 4:5 at 390 (else it stays 4:3: shown taller, a 4:3
  file is blown up and FAILs `photo-upscale`).
  Every other picture is `loading="lazy"` and `decoding="async"`, `width` and `height` set, `sizes` set to the shown
  width. `--big id` adds the largest file to a full-bleed band only when it is within the 250 KB cap; `--lqip` puts the
  picture's 24px colours behind it.
- A photograph in a menu or tab panel drops `loading="lazy"`. Set `object-position` to keep the subject in the phone crop.
- **A photograph is visible from the first paint**: never in an element that starts at opacity 0, clipped or moved for a
  scroll reveal, never under a print, dissolve or mask that develops on load, never a video in its place. Shoot 1440,
  1024, 768 and 390 and look for any empty frame (a grey, blank or half-loaded frame counts): an empty ground is a fault.
- **No print, grade or effect on any photograph**: no halftone, dither, duotone, engraving, grain, glitch, filter or
  blend mode, and no canvas over half of it. Mixed light gets a crop and one ratio system, not an effect. A print is a
  tech page's one effect, on a non-photo ground.
- Keep the linked picture's hover inside its frame (`motion.md`). Apply the corners from the PLAN.

## Credits and words (PH-38, CO-22)

A work, project, room or product may have one `.fact-line` beside or below its picture: name, place, size, year or price, up to 60 characters. Mark assumed facts `data-assumed`. Leave out captions that explain, apologise or label the picture (“illustration”). See house rule 1 in `copy.md`.

**Credits** go in one footer line linking to the credits list. `photos.mjs credits --out .`
prints the line, "Photographs via Unsplash and Wikimedia Commons" (the sources used, never the photographers; at
most 110 characters), and the list; paste the line in the footer and the list on its own page: `--write` makes `credits.html` in the site's legal-page shell, `--href <page>` points the line elsewhere. The list gives each photographer, licence and
source page, `adapted` after any frame cropped beyond its frame (`--adapted id`). A
public-domain frame (the Public Domain Mark) is listed with the Mark's page and its photographer still named. `--text`
prints the same line and list as plain text for a report. Every word on a page is live text, never baked into an image.

## Never

- Never pass off another business's room, work or product as the client's. Faces in stock cannot stand for the client's team or guests. Keep the region and street true to the brief.
- Skip a stock detail chosen only for mood. Plain materials, a street or a landscape can show a specific claim. Leave gradients, grain and shaders off the photograph.
- The library's frames repeated across builds: pass `--history` every time, and when one session builds in several
  folders set `TASTE_SKILL_RECENT` to one file, so a frame another build used lately goes behind the fresh ones.
- A live search result used without looking at it full size, with another business's name or logo readable, or left
  out of the report's stand-ins.

When a physical product lacks a photograph, draw the object itself in the hero before showing its companion app. At 390×844 check that the actual item and its connection remain visible.
