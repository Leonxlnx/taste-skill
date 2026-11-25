# Copy

Say what it is and what it does, in words a stranger understands in five seconds, in a voice that
belongs to this client and no other. Every sentence is one the owner would say out loud to a
customer. No mood paragraphs, poetry, invented terms or ad wording; a figure of speech only as the
page's one brand line (rule 3) or the hero form the voice card chose. Every studied site is a
description only: learn how the examples are written, never take their words, code, pictures or
signature effect.

“Tell our story”, “show how it plays” and “meet the bosses” each need a `show` ask mapped to the section that answers it.

## The copy layer

Write `.taste-skill/copy.md` before the page. It holds the fact sheet, asks, voice card and draft.
- `copy-voice.md`: how to fill the notes: the fact sheet from the brief, the voice card, the page's
  shape from the reader's questions, the device budget, the checks. Start here.
- `copy-registers.md`: the twelve voices to choose from, and which suit which trade.
- `copy-moves.md`: the move for each part of the page: the 14 hero forms, headings, the story,
  features, proof, prices, buttons and the close, microcopy, the footer.
- `copy-tells.md`: what gives model copy away and the fix for each, what over-correction breeds, and
  what is not a tell.

Use the rules here for assumptions, picture facts and buttons. The hero tells a stranger what is sold within five seconds.

**copy-lint.** `node <skill>/scripts/copy-lint.mjs index.html --kind <kind> --category "<what is sold>"`
counts the countable tells in well under a second a page (no browser). FAIL: no copy notes, or a
voice card with a field left empty [copy-notes]; no `## Story` block, a shape not in `library/stories.json` or an
empty thread [copy-story]; residue (a `[NEED]`, a template token, markdown,
chatbot lines); a fact held back ("Price on request", an address that "comes with your confirmation
email", a note about the client or the build) [copy-withheld]; the old slop words and stock lines; a close whose heading repeats the section above
it [copy-close-repeat]; a device used more than twice its budget plus one (three two-fragment
headings, five contrast frames, five virtue words): fix every one. WARN: an h1 that is only a
category label [copy-h1-category], a close heading that only restates its button [copy-close-ask],
two headings sharing three content words [copy-heading-echo], a spine that is not the draft's H2 lines in order or a
join word "also" or "and" [copy-story], a device over its budget, a strip of
figures, a default-cast name, a footer sign-off, a response-time promise worded twice, proof figures,
capped words (innovative, curated), typed arrows, emoji bullets, exclamation marks, puffery, a stale
year: fix it or keep it and say why in the report. Several pages at once also print their first
headings side by side and the heading phrases they share. `--json` for scripts; exit 1 on a FAIL. The
gate runs it on the page as a static check: its FAILs block like the checker's (ids `copy-*`), its
WARNs do not.

## The copy notes

Before the page, write `.taste-skill/copy.md` in the project folder (beside `index.html`). Copy this
block, fill every line from the brief, then write the page from the draft. A fact the page needs to
work and the brief leaves out is assumed and written under `Assumed:` (What may be assumed, below);
proof the brief lacks (a quote, a result figure, a customer) goes to the last list, never onto the
page. copy-lint checks that the five voice card fields hold a value.

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
Products: <plain nouns for what is sold and shown>
Assumed: <working facts the brief leaves out, their values and where each is marked data-assumed>

Asks:
- <ask> -> #<id> : <outcome>

## Six questions, answered from the brief
1. Who switched to them from what, and why? <answer, or: not in the brief>
2. The one number they would bet the business on? <answer>
3. The objection buyers raise most? <answer>
4. What are they bad at, or not for? <answer>
5. A strange true detail of how they work? <answer>
6. Three real customer messages? <quotes from the brief, or: not in the brief>

## Story
Shape: <id from library/stories.json, and why the brief fits it>
Thread: <the one record, object, person or time that travels; its name and numbers>
Turn: <the section where something changes, and what changes>
Bookend: <what the close brings back from the hero, and what it adds>
Short: <include only when quoting the brief’s request for a small page>
Spine:
- H1: <hero line> | beat: <id> | section: #<hero-id>
- <h2 of section 2> | beat: <dealt id> | section: #<id> | joins the previous by: <so / but / then / until / which means>
- ...
- Close: <the close's heading> | beat: <id> | section: #<close-id>

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
- <each fact the client must send or confirm (every assumed one, the street, the photographs, any proof), as [NEED: what]; a [NEED] never reaches the page>
```

Write each request at its target, for example `- Book a double room -> #booking : send`, choosing `play` for media, `go` for a product destination, `send` for a form, `file` for a download or `show` for on-page content. Describe the action in visitor terms. List each missing piece under “Client must supply” with its `#id`.

Lint the draft with `node <skill>/scripts/copy-lint.mjs .taste-skill/copy.md`. Label each line under `## Draft` with its part (`H1:`, `Lead:`, `Button:`).

Cover the paragraph. The first heading or its clearly pictured subject identifies what is sold. Later headings name what the reader can learn, choose or do. Read each at 390. Cut explanations of the column, list or length of the answer.
Use a link button for sign-up, starting free, opening an app, downloads, store purchases and booking through a named service. Use the supplied address or a reserved URL such as `https://app.brand.example/signup` with `data-needs="sign-up address"`. List that address first under “Client must supply” in the notes and handoff. The link keeps the action’s name.

Use a short form for an enquiry, slot booking, pre-order, demo request or newsletter. Its submit repeats the main action word for word. With no receiving address, open an email draft and put one plain sentence under the button, such as “Opens your email with the order filled in.” Keep build notes and missing services in the handoff. Source every public total, project credit and time limit.

## Five rules

1. **The hero, its h1 and lead together, tells a stranger in five seconds what is sold and where or
   for whom.** The h1 takes any of the 14 hero forms of `copy-moves.md` (a greeting, the reader's
   state, a mission, plain news, a question, a mantra, the category with a twist, a striking
   customer, a scope, an enemy, an outcome, a place and a year, a twisted idiom with the spec under
   it, a narrow superlative), chosen on purpose and written on the voice card, 2 to 9 words. The
   category and place or buyer belong in the lead when the h1 leaves them out. Read both aloud. A stranger should know what is sold. For a game, include the name, genre and release date or status from the brief. A bare category label as the h1
   ("Yoga studio in Brooklyn") is the default this replaces: copy-lint WARNs it unless the voice card
   chose that form (9 or 12).
2. **The first screen holds one hard fact:** a number, a place, a price or a date; the brief's, else an
   assumed one marked `data-assumed` (opening hours or the district).
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
   reads the same in the nav, hero, phone bar and form or order controls. One screen
   shows it twice at most: the nav's button and the hero's on a desktop,
   the hero's on a phone (system.js keeps the phone bar away
   from a screen that already shows its action); a third copy on one screen FAILs [action-repeat].
   The button keeps its words; the headings around it do not borrow them. **The close's heading says
   something new:** the hero's promise with one fact from the brief, the admission turned into a
   reason ("Closed Mondays. Every other day the oven is lit by six."), a time or a price, a
   low-pressure exit, or a bookend: the hero's words, field or object back with the one fact the page
   earned (the price, the date, the reader's first step). Never the ask of the section above it, its heading or its button
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
   you decide"). Use questions where the page answers them, such as an FAQ. Two fragments in a heading once a page at most (`copy-tells.md`).
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
- **Words per screen.** For general copy at 1440, aim for roughly 47 words on product, 44 on place, 34 on service and 60 to 80 on tech (software, gaming and hardware). Exclude product UI, diagrams, code, devlog posts, FAQ answers, spec rows, menus and price lists. Give each item the words it needs. Cut repeated claims first.
- **Guesthouses.** Name the room types, beds and rates, and what breakfast includes. Give the dishes and serving time when known. Mark any assumed room or breakfast facts `data-assumed` and record them in the notes.
- **Numbers** sit in sentences with their unit ("4.5 hours a week"), uneven where real (212, 38%).
  A real claim from the brief that needs a source gets a numbered footnote near the footer (13px
  and up).
- Keep the words live. Show the subject using the ladder in `photos.md`.
- **Form words:** a label says what goes in ("Arrival", "Guests"), never a question or a
  placeholder in its place; an error names the field and what to type ("Write the day you want to
  come"); the sent line names what was sent in the button's own words ("Your table request is in. We
  reply within a day."). The rest of the recipe: `system.md`, Forms.
- **Self-check:** read each line aloud to a customer. Is it clear what the product does? If not,
  rewrite it. Then the copy layer's checks (`copy-voice.md` section 6), copy-lint first, and the
  five-second test: cover everything but the hero and say what is sold, and where or for whom.

## What may be assumed

Label a working object once on the object itself, for example “Example incident” or “Sample week”. Calculate public totals from confirmed prices and limits. Write invented dated entries as plain notes and identify them as examples in the report.

- Mark assumed opening hours, menu items or a district with `data-assumed` and list them in the notes and report. Quote the supplied rate with its unit and any “from”. Use only supplied rates in totals. Leave other prices, delivery and response times, rollout durations and discounts for the enquiry.
- **Never held back instead:** no "Price on request" or "Pricing on request", no "we reply with the
  price" on a page that shows none, no "the street address comes with your confirmation email" or
  "street and district are on the way", no note about the client, the brief or the build ("hours are
  confirmed with the shop", "client to confirm"), no `[NEED]` on the page [copy-withheld,
  copy-residue]. When the brief itself says its prices are on request, keep its words and waive the
  hit with the brief as the reason.
- **Never assumed: proof and people.** No invented reviews, ratings, review counts, quotes,
  testimonials, customers or customer counts, clients, awards, certifications, press lines, named
  people or portraits, result figures ("38% fewer re-runs", "3x faster", a saving), house numbers,
  postcodes or phone numbers in a real format. Customer logos only for real customers the brief
  names and that may be shown; a real tool the product works with keeps its real icon in its own
  colours (`icons.md`), never a drawn imitation. Without proof, a strip of plain facts, or the product
  working on a plausible example of the reader's own case (a sum converted, an incident resolved, a
  week planned), labelled once as an example: proof without invented customers.
- **No pressure and no missing caveats:** never invented urgency or scarcity ("only 3 left", a
  countdown, "book now before it's gone") unless the brief gives the real stock or date, and never a
  caveat the business needs (legal, medical, financial) cut for rhythm.
- **A made-up client** (the brief says the business is fictional, a demo or a test): beyond the
  facts above, a few odd details may be invented the way a novelist would: fewer
  than feel natural, stranger, true only of this one place, one of them a little unflattering, each
  listed in the report as assumed. Still never a figure, a quote, a review, a customer or an award:
  the demo shows the voice, never fake proof.
- Word a target from the brief inside the value itself ("target 2 days").
- **No placeholders:** no square brackets, "lorem ipsum", "your name here", "to be added", TODO,
  kit sample text, and no link to `#` or an empty href. Write the real words, an assumed fact
  (above), or leave the element out. "Coming soon" only for what the brief says is coming.
- **House rule 1.** No caption that explains, apologises for or labels a picture. A work, project, room or product may carry one `.fact-line` under or beside the picture. Use name, place, size, year or price, up to 60 characters. Mark assumed facts `data-assumed`.
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
- **A brief with no street:** print the district ("Eimsbüttel, Hamburg") with "See the area" (Maps,
  below); with only a town, a plausible district of it marked `data-assumed` and listed in the report.
  Never an invented street or number, never "the address comes later"; the type moment `address` sets
  that district. List the missing street in the report as the client's to supply.
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
  (`"searched": false` with no search tool). A name the brief gives goes there too, as
  `{"name": "Kestrel", "coined": false, "source": "the brief"}`: copy-lint then keeps it, no waiver.
- **Links** go where their label says: a part of the page (`#rooms`) or a page that exists; never
  "here", never two different labels to one target, never a link to a closed answer.
- **Newsletter:** asked once, in or just above the footer, "Subscribe" or "Sign up", an email field
  only; never in a modal, never twice.

## Banned

Metaphors and "where X meets Y" (the one brand line aside); a slogan, greeting or boast in the hero
that the voice card did not choose, or one with no fact beside it; questions as section headings
outside the FAQ and close; exclamation marks; all-caps labels; invented capitalised concepts; unexplained
programme names; jokes or slang in labels; mood paragraphs; a literary quote as a full-screen band;
filler (seamless, effortless, cutting-edge, unlock, elevate, supercharge, reimagine,
next-generation, game-changing, powerful, robust, and the rest of `copy-tells.md`); virtue words about the client (honest, calm, quiet, actually, simply); a sign-off or a pun
in the footer; the model's default voice (`copy-voice.md` section 2). copy-lint FAILs the old slop words,
the stock phrases, left residue and a device used past twice its budget; it WARNs the rest it can
count, and the rival's-name check and the read-aloud (`copy-voice.md` section 6) catch what it cannot.
