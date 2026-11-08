# Copy

Say what it is and what it does, in words a stranger understands in five seconds, in a voice that
belongs to this client and no other. Every sentence is one the owner would say out loud to a
customer. No mood paragraphs, poetry, invented terms or ad wording; a figure of speech only as the
page's one brand line (rule 3) or the hero form the voice card chose. Every studied site is a
description only: learn how the examples are written, never take their words, code, pictures or
signature effect.

## The copy layer

This file holds the rules every page keeps. What the words say and how they sound is the copy layer, read at step 2
before the first sentence:

- **The copy notes** (below): `.taste-skill/copy.md`, written before the page. The fact sheet, the
  voice card and the draft. copy-lint FAILs a page without them.
- `copy-voice.md`: how to fill the notes: the fact sheet from the brief, the voice card, the page's
  shape from the reader's questions, the device budget, the checks. Start here.
- `copy-registers.md`: the twelve voices to choose from, and which suit which trade.
- `copy-moves.md`: the move for each part of the page: the 14 hero forms, headings, the story,
  features, proof, prices, buttons and the close, microcopy, the footer.
- `copy-tells.md`: what gives model copy away and the fix for each, what over-correction breeds, and
  what is not a tell.

Where they differ, this file wins: nothing invented, nothing bracketed or left open on the page, no
captions, the hero tells a stranger in five seconds what is sold, buttons are a verb and an object.

**copy-lint.** `node <skill>/scripts/copy-lint.mjs index.html --kind <kind> --category "<what is sold>"`
counts the countable tells in well under a second a page (no browser). FAIL: no copy notes, or a
voice card with a field left empty [copy-notes]; residue (a `[NEED]`, a template token, markdown,
chatbot lines); the old slop words and stock lines; a close whose heading repeats the section above
it [copy-close-repeat]; a device used more than twice its budget plus one (three two-fragment
headings, five contrast frames, five virtue words): fix every one. WARN: an h1 that is only a
category label [copy-h1-category], a close heading that only restates its button [copy-close-ask],
two headings sharing three content words [copy-heading-echo], a device over its budget, a strip of
figures, a default-cast name, a footer sign-off, a response-time promise worded twice, proof figures,
capped words (innovative, curated), typed arrows, emoji bullets, exclamation marks, puffery, a stale
year: fix it or keep it and say why in the report. Several pages at once also print their first
headings side by side and the heading phrases they share. `--json` for scripts; exit 1 on a FAIL. The
gate runs it on the page as a static check: its FAILs block like the checker's (ids `copy-*`), its
WARNs do not.

## The copy notes

Before the page, write `.taste-skill/copy.md` in the project folder (beside `index.html`). Copy this
block, fill every line from the brief, then write the page from the draft. A field the brief cannot
fill gets the plainest true answer you have, and what the client must supply goes to the last list,
never onto the page. copy-lint checks that the five voice card fields hold a value.

```markdown
# Copy notes: <brand>

## Fact sheet
What it is: <one plain sentence, no adjective>
Category: <the plain words for what is sold, as passed to --category>
For whom: <the best-fit buyer>  Not for: <who should look elsewhere>
Instead today: <what they do now: a spreadsheet, the big rival, the bakery across town, nothing>
True difference: <what is true here and not elsewhere, and its proof from the brief>
Numbers: <each figure the brief gives, with where it came from; none invented>
People: <names and roles the brief gives, or none>
Odd true details: <history, an object, a ritual, a house word, the awkward bit, from the brief>
Offer: <price, trial, booking terms, the one action>

## Six questions, answered from the brief
1. Who switched to them from what, and why? <answer, or: not in the brief>
2. The one number they would bet the business on? <answer>
3. The objection buyers raise most? <answer>
4. What are they bad at, or not for? <answer>
5. A strange true detail of how they work? <answer>
6. Three real customer messages? <quotes from the brief, or: not in the brief>

## Voice card
Register: <number and name from copy-registers.md, and why it fits>
Hero form: <number and name from copy-moves.md, and why; not the form of the last page you wrote>
Admission: <the one limit the page says plainly: closed Mondays, iPhone only, no lift>
Enemy: <a habit or a category the page pushes against, never the reader>
Customer words: <the buyer's own phrase, from the brief; else how a buyer of this trade says the problem>
Pairs: <two pairs, such as: exact, not cold; sure, not loud>
Person: <"you" for what the buyer gets, "we" for the work>
Humour: <where it may go (the microcopy), and where never (prices, the hero of a serious purchase)>
House words: <the brief's own nouns, the same word every time>
Never: <three habits this voice avoids>
Five seconds: <what a stranger says after reading only the hero: what is sold, where or for whom>

## Draft
H1: <the hero line in the chosen form>
Eyebrow: <optional; the category or the place when the h1 does not say it>
Lead: <one fact or one mechanism, 15 to 30 words; a place: the fact and today's hours>
Button: <verb and object>
H2: <each section's heading, then its lines>
Body: <...>
H2: <the close: something new, never the ask of the section above>
Button: <the main action, the same words as the hero's>
Error: <a form error in the register>
Sent: <the sent line in the button's words>
Footer: <the facts line>

## Client must supply
- <each fact the brief lacks, as [NEED: what]; it never reaches the page>
```

The draft lints on its own: `node <skill>/scripts/copy-lint.mjs .taste-skill/copy.md` reads only
what stands under `## Draft` (each line names its part: `H1:`, `H2:`, `Lead:`, `Button:`), and a
`[NEED]` there is only listed. On the page, copy-lint finds the notes beside it or one or two folders
up.

## Five rules

1. **The hero, its h1 and lead together, tells a stranger in five seconds what is sold and where or
   for whom.** The h1 takes any of the 14 hero forms of `copy-moves.md` (a greeting, the reader's
   state, a mission, plain news, a question, a mantra, the category with a twist, a striking
   customer, a scope, an enemy, an outcome, a place and a year, a twisted idiom with the spec under
   it, a narrow superlative), chosen on purpose and written on the voice card, 2 to 9 words. The
   category and the place or buyer then sit in the lead or the eyebrow, plainly ("Bakery on Mill
   Street, Leith. Open from 7:30."). Never a riddle: a stranger who reads the h1, the eyebrow and the
   lead must be able to say what this is. A game: its name, and its genre in the h1 or the line under
   it; the launch date or status the brief gives is the hard fact. A bare category label as the h1
   ("Yoga studio in Brooklyn") is the default this replaces: copy-lint WARNs it unless the voice card
   chose that form (9 or 12).
2. **The first screen holds one hard fact:** a number, a place, a price or a date.
3. **Every heading has a noun that names a thing:** the product, a part of it, the place, a section
   noun (prices, rooms, menu, opening hours, questions, getting here, visit) or a digit. One brand
   line a page at most: the page's one figure of speech, pun or mantra, with a fact in the line under
   it; it may be the h1 when the voice card's hero form is one (6, 13). Each heading says its own
   thing: two headings never share a key phrase.
4. **Buttons are a verb plus what the visitor gets,** 1 to 5 words, starting with book, buy, order,
   pre-order, reserve, try, start, get, download, compare, see, watch, read, find, join, subscribe,
   sign up, contact, configure, add, send, email or request; a bare noun only where the link opens
   that thing. Never "Learn more", "Read more", "Discover", "Explore", "More" or "Click here".
5. **Few actions, each with one wording:** at most 2 in the hero (one on a place), 10 different
   labels a page at most. The main action names the transaction (Book a room, Order a cake, Start a
   free trial; on a place the brief's order or booking, else Get directions, never a side event) and
   reads the same in the nav, the hero, the close and the phone bar, and nowhere else. One screen
   shows it twice at most: the nav's button and the hero's on a desktop (the checker WARNs it, so
   look that nothing else repeats it), the hero's on a phone (system.js keeps the phone bar away
   from a screen that already shows its action); a third copy on one screen FAILs [action-repeat].
   The button keeps its words; the headings around it do not borrow them. **The close's heading says
   something new:** the hero's promise with one fact from the brief, the admission turned into a
   reason ("Closed Mondays. Every other day the oven is lit by six."), a time or a price, or a
   low-pressure exit. Never the ask of the section above it, its heading or its button
   [copy-close-repeat], and never only its own button as a heading [copy-close-ask].

## Plain versions

When a lead, a heading or a card line is vague, and the hero fails the five-second test: the
category noun first, then one count, place or price from the brief, no figure of speech. (A vague
line is a line with no fact; a hero form is a choice with its fact beside it.)

| Vague | Plain |
| --- | --- |
| "Every shift, sorted" | Shift planning for restaurant teams |
| "Where the city climbs" | Climbing gym with 180 routes in Leipzig-Plagwitz |
| "Come climb" | Day pass 14 €, shoes included |
| "A second read of every word" | AI proofreader for book publishers |

## Headlines and text

- **Hero sub-line:** software, product and service: how it works and the main benefit, 15 to 30
  words, one line to two sentences. A place: the fact, 80 characters at most, with today's hours
  ("Sourdough, rye and cardamom buns from 7:30, Tuesday to Sunday."); a hotel the rooms and the town.
- **Section headings** name the thing ("Rooms and prices", "Works with your tools") or make a short
  plain claim ("Pays staff on the same day"), 1 to 6 words, at most two lines. A noun phrase, "we
  do X for Y", a full-sentence claim, a real figure from the brief, or a verb with the thing it acts
  on ("Send invoices from the van"); never a bare command ("Get started", "Come climb"), a colon
  heading or a line that only makes sense after the page ("Continuity slips", "It reads everything
  you decide"). A question only in the FAQ, the close, or once as a kicker with a short answer under
  it. Two fragments ("Twelve rooms. Three ways to stay.") once a page at most (`copy-tells.md`).
  The story section may take one odd heading in the register (a year, "The fairly short history"),
  with the facts under it. Mix the shapes: a page whose headings all share one shape reads as a form.
  **Card titles:** a verb and an object ("Warns about double shifts"), one line, real words, never a
  coy label ("The market run"). A heading with a grey second half is two sentences: the first ends
  with a full stop before the `.muted` span ("Rooms and prices. <span class="muted">Breakfast
  included.</span>"), never two phrases that run into one [run-on].
- **Under a heading** one line to two sentences (10 to 40 words); a card body 1 or 2 sentences, 25
  words at most, in the buyer's words with one concrete detail; no paragraph over five lines at
  1440. A price does the selling, not a mood heading ("Rooms from 140 € a night, breakfast
  included").
- **Words per screen** stay low: product 47, place 44, service 34; a page about 900 words at most,
  the footer aside. Long copy goes to sub-pages.
- **The tech word budget** (software, gaming, hardware): 60 to 80 words a screen at 1440, counted
  outside UI mocks, diagrams and code (headings, lines, card titles and bodies, buttons, labels);
  over 80 the checker WARNs (in testing: a fintech page at 117 words a screen read as wordy). Cut in
  this order: a second sentence under a heading, card bodies to one sentence of 12 to 18 words, a
  fourth card, a list a fragment already shows. The UI says the rest.
- **Numbers** sit in sentences with their unit ("4.5 hours a week"), uneven where real (212, 38%).
  A real claim from the brief that needs a source gets a numbered footnote near the footer (13px
  and up).
- **Pictures** stand beside short copy, never in place of it, and words never stand where a
  photograph fits. Every word is live text.
- **Form words:** a label says what goes in ("Arrival", "Guests"), never a question or a
  placeholder in its place; an error names the field and what to type ("Write the day you want to
  come"); the sent line names what was sent in the button's own words ("Your table request is in. We
  reply within a day."). The rest of the recipe: `system.md`, Forms.
- **Self-check:** read each line aloud to a customer. Is it clear what the product does? If not,
  rewrite it. Then the copy layer's checks (`copy-voice.md` section 6), copy-lint first, and the
  five-second test: cover everything but the hero and say what is sold, and where or for whom.

## What may be assumed

- **Prices, address, hours and dates come from the brief;** the report lists any you assumed. Only
  two things may be assumed when the brief lacks them: a coined brand name (below), and on a place
  plausible hours and prices for the trade, uneven and in the local currency (3.60, not 4.00).
  Nothing else is invented: a product or service with no price in the brief says "Price on
  request" or shows none. Each assumed price, hour, date or place carries `data-assumed` on its own
  element (`<span class="rows__value" data-assumed>3.60 €</span>`, `<dl class="hours"
  data-assumed>`); the checker lists every one for the report [assumed], and assumed hours never
  drive an open-now line [open-now].
- **No invented proof:** no invented reviews, ratings, review counts, quotes, testimonials,
  statistics, customer counts, customer names, portraits, clients, awards, press lines or products.
  Customer logos only for real customers the brief names and that may be shown; a real tool the
  product works with keeps its real icon in its own colours (`icons.md`), never a drawn imitation.
  Without proof, a strip of plain facts from the brief, or nothing.
- **No pressure and no missing caveats:** never invented urgency or scarcity ("only 3 left", a
  countdown, "book now before it's gone") unless the brief gives the real stock or date, and never a
  caveat the business needs (legal, medical, financial) cut for rhythm.
- **A made-up client** (the brief says the business is fictional, a demo or a test): beyond the
  coined name, hours and prices, a few odd details may be invented the way a novelist would: fewer
  than feel natural, stranger, true only of this one place, one of them a little unflattering, each
  listed in the report as assumed. Still never a figure, a quote, a review, a customer or an award:
  the demo shows the voice, never fake proof.
- **No sample notes:** no "sample", "(sample)", "examples", "illustrative" tag, note or asterisk
  footnote anywhere. A target value the brief itself gives is worded inside it ("target 2 days").
- **No placeholders:** no square brackets, "lorem ipsum", "your name here", "to be added", TODO,
  kit sample text, and no link to `#` or an empty href. Write the real words, or leave the element
  out. "Coming soon" only for what the brief says is coming.
- **No caption, label or description under or on any visual** (house rule): not "A drawing made in code",
  "Photographs follow", "Representative image", not a name, price or link line under a bare picture,
  no hashtags. A heading names the set; a sold item's name and price sit inside its card's padding.
  The picture shows the thing or is left out; the report lists the photographs the client must
  supply.
- **Credits:** one short line at the end of the footer naming only the sources used, never the
  photographers: "Photographs via Unsplash and Wikimedia Commons" (as `photos.mjs credits` prints
  it; 110 characters at most, one line from 1024) that links or opens the credits list. Paste the
  line and the list exactly as `photos.mjs credits` prints them; never write a credit link per
  photograph into the footer (in testing: 18 and 20 credit links in a footer read as a credit wall).
  Map data credits join it. A page that shows real logos
  adds "Product names and logos are trademarks of their owners".
- **Each fact once:** an opening time, a price or an address has one value and one wording,
  repeated word for word only where it belongs (the hero, the visit panel, the phone sheet, the
  close, the footer); never two hours for one day.

## Contacts the brief does not give

What the brief gives is printed exactly as given. Each kind is separate: a brief that gives only a
phone number still gets the address, email and imprint rules.

- **Address: a street and a district only** ("Elmgatan, Malmö-Möllevången"). Never a house number,
  a postcode or map coordinates. One street address a page (the visit block and the footer, at 390
  too), never readable only on a sign in a photograph. Several shops: each name, then its street. A
  studio by appointment says so.
- **A brief with no street:** print the district only ("Eimsbüttel, Hamburg"), the town when no district is named,
  and never an invented street or number; the type moment `address` sets that district. List the missing street in the report
  as the client's to supply.
- **Maps:** no map loads with the page. Get directions opens
  `https://www.openstreetmap.org/search?query=<street>+<district>`, with no coordinates and no
  route; on the phone the address opens the same search. No street given: the link says "See the
  area" and opens `?query=<district>+<town>`; only a town: no map link and no directions button at
  all, since a search for a whole city shows nobody the door [map-link]. A map is drawn only for a street the brief gives (`fx-map` baked still, the pin on the
  street line, never a building); a builder's real street never gets a real map, since it pins a
  stranger's door. Never an iframe.
- **Phone: none, unless the brief gives one.** No number, no `tel:` link, no Call button. A
  "Request a call" form may stand in.
- **No imprint page and no company details:** no register number (HRB), VAT or tax id, company
  number, managing director or court. The legal row holds the brand, the current year, Privacy,
  Terms and the credits line; an Imprint link only when the brief gives the company's own details.
- **Email and web:** a form (`system.md`, Forms: it posts to the client's form address when the
  brief gives one, else its `mailto:` on `.example` stands in and the report lists it), or a button
  ("Email us") whose `mailto:` is on `.example` (`hello@brand.example`). Never print an email
  address, a domain or a social handle, not even a `.example` one. `.socials` stays empty unless the brief gives the accounts.
- **Names are coined,** not dictionary words and not a business that exists, unless the brief gives
  the name, and never one that models keep coining (Kestrel, Halcyon, Lumen, Nimbus, Fieldnote:
  `copy-tells.md`; copy-lint FAILs one as the page's own name, in its title or h1, and WARNs one
  anywhere else, a logo wall or a mock); person names come only from the brief. Search a coined name with its trade ("name
  coffee") and as a domain; if a business of that trade or a famous person has that exact name in
  the first 10 results, coin another. Write each query and result in `names.json` beside the page
  (`"searched": false` with no search tool).
- **Links** go where their label says: a part of the page (`#rooms`) or a page that exists; never
  "here", never two different labels to one target, never a link to a closed answer.
- **Newsletter:** asked once, in or just above the footer, "Subscribe" or "Sign up", an email field
  only; never in a modal, never twice.

## Banned

Metaphors and "where X meets Y" (the one brand line aside); a slogan, greeting or boast in the hero
that the voice card did not choose, or one with no fact beside it; questions as section headings
outside the FAQ, the close and one kicker; exclamation marks; all-caps labels; invented capitalised concepts ("the Proof Layer"); unexplained
programme names; jokes or slang in labels; mood paragraphs; a literary quote as a full-screen band;
filler (seamless, effortless, cutting-edge, unlock, elevate, supercharge, reimagine,
next-generation, game-changing, powerful, robust, and the rest of `copy-tells.md`); virtue words about the client (honest, calm, quiet, actually, simply); a sign-off or a pun
in the footer; the model's default voice (`copy-voice.md` section 2). copy-lint FAILs the old slop words,
the stock phrases, left residue and a device used past twice its budget; it WARNs the rest it can
count, and the rival's-name check and the read-aloud (`copy-voice.md` section 6) catch what it cannot.
