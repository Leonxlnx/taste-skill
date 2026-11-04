# Copy

Say what it is and what it does, in words a stranger understands in five seconds. Every sentence is
one you would say out loud to a customer. No metaphors, poetry, invented terms or ad wording. Every
studied site is a description only: copy how the examples are written (plain, category first),
never their words, code, pictures or signature effect.

## Five rules

1. **The h1 names the category, and for a brand nobody knows, the buyer or the place,** in 2 to 8
   words: payroll app, dental clinic, standing desk, plus who it is for or where. A place: what and
   where in 40 characters at most ("Bakery on Mill Street, Leith"; "Six-room guesthouse on a fjord").
   A game: its name and genre ("Kelpmoor, a co-op sailing game"), or its wordmark over an h1 naming
   the genre; the launch date or status the brief gives is the hard fact. Never a riddle, a command, a mood, or a brand line over a plain sub-line.
2. **The first screen holds one hard fact:** a number, a place, a price or a date.
3. **Every heading has a noun that names a thing:** the product, a part of it, the place, a section
   noun (prices, rooms, menu, opening hours, questions, getting here, visit) or a digit. One brand
   line a page at most, never the h1.
4. **Buttons are a verb plus what the visitor gets,** 1 to 5 words, starting with book, buy, order,
   pre-order, reserve, try, start, get, download, compare, see, watch, read, find, join, subscribe,
   sign up, contact, configure, add, send, email or request; a bare noun only where the link opens
   that thing. Never "Learn more", "Read more", "Discover", "Explore", "More" or "Click here".
5. **Few actions, each with one wording:** at most 2 in the hero (one on a place), 10 different
   labels a page at most. The main action names the transaction (Book a room, Order a cake, Start a
   free trial; on a place the brief's order or booking, else Get directions, never a side event) and
   reads the same in the nav, the hero, the close and the phone bar, and nowhere else.

## Plain versions

When a line is vague: the category noun first, then one count, place or price from the brief, no
figure of speech.

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
  plain claim ("Pays staff on the same day"), 1 to 6 words, at most two lines. A noun phrase or "we
  do X for Y", never a command, a question (FAQ entries may be questions), a colon heading or a line
  that only makes sense after the page ("Continuity slips", "It reads everything you decide").
  **Card titles:** a verb and an object ("Warns about double shifts"), one line, real words, never a
  coy label ("The market run").
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
- **Self-check:** read each line aloud to a customer. Is it clear what the product does? If not,
  rewrite it.

## What may be assumed

- **Prices, address, hours and dates come from the brief;** the report lists any you assumed. Only
  two things may be assumed when the brief lacks them: a coined brand name (below), and on a place
  plausible hours and prices for the trade, uneven and in the local currency (3.60, not 4.00).
  Nothing else is invented.
- **No invented proof:** no invented reviews, ratings, review counts, quotes, testimonials,
  statistics, customer counts, customer names, portraits, clients, awards, press lines or products.
  Customer logos only for real customers the brief names and that may be shown; a real tool the
  product works with keeps its real icon in its own colours (`icons.md`), never a drawn imitation.
  Without proof, a strip of plain facts from the brief, or nothing.
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
  `https://www.openstreetmap.org/search?query=<street>+<district>` (no street given:
  `?query=<district>+<town>`), with no coordinates and no route; on the phone the address opens the
  same search. A map is drawn only for a street the brief gives (`fx-map` baked still, the pin on the
  street line, never a building); a builder's real street never gets a real map, since it pins a
  stranger's door. Never an iframe.
- **Phone: none, unless the brief gives one.** No number, no `tel:` link, no Call button. A
  "Request a call" form may stand in.
- **No imprint page and no company details:** no register number (HRB), VAT or tax id, company
  number, managing director or court. The legal row holds the brand, the current year, Privacy,
  Terms and the credits line; an Imprint link only when the brief gives the company's own details.
- **Email and web:** a form, or a button ("Email us") whose `mailto:` is on `.example`
  (`hello@brand.example`). Never print an email address, a domain or a social handle, not even a
  `.example` one. `.socials` stays empty unless the brief gives the accounts.
- **Names are coined,** not dictionary words and not a business that exists, unless the brief gives
  the name; person names come only from the brief. Search a coined name with its trade ("name
  coffee") and as a domain; if a business of that trade or a famous person has that exact name in
  the first 10 results, coin another. Write each query and result in `names.json` beside the page
  (`"searched": false` with no search tool).
- **Links** go where their label says: a part of the page (`#rooms`) or a page that exists; never
  "here", never two different labels to one target, never a link to a closed answer.
- **Newsletter:** asked once, in or just above the footer, "Subscribe" or "Sign up", an email field
  only; never in a modal, never twice.

## Banned

Metaphors and "where X meets Y"; slogans, greetings and boasts in the hero; questions as headlines;
exclamation marks; all-caps labels; invented capitalised concepts ("the Proof Layer"); unexplained
programme names; jokes or slang in labels; mood paragraphs; a literary quote as a full-screen band;
filler (seamless, effortless, cutting-edge, unlock, elevate, supercharge, reimagine,
next-generation, game-changing, powerful, robust).
