# Words

Copy is the first design decision. A headline that needs four lines cannot be rescued by typography,
and a page of slogans cannot be rescued by layout. Write the page as plain text before any markup.

## Contents

1. Write the argument first
2. The two-line headline (with the character budget)
3. Headline shapes that work
4. Supporting line, body, buttons
5. Proof without inventing it
6. Things that read as generated
7. Micro-typography

## 1. Write the argument first

Answer in one line each, in a scratch note:

- Who is reading, and what do they already know?
- What is this, said the way its maker would say it to a friend?
- What single thing should the reader believe after one screen?
- What would make them believe it (a picture of the thing, a number, a name, a demonstration)?
- What do they do next?

Then list the page as claims, one per section, each with its proof:

```
1. It is a three-legged oak stool, made to order.             → the stool, large
2. Each seat is cut from one board, so the grain is yours.    → three close-ups
3. It takes six weeks, and you can follow it.                 → the stages, photographed
4. It costs 240 and is delivered by the maker.                → price, button
```

A section with no claim is filler; delete it. This is also how you escape the stock order of
hero, logos, features, testimonial, pricing, call to action: the order of the argument is the order of
the page. Five or six claims after the hero are plenty; two that say one thing are one section.

**Budgets.** The owner's verdict on the recent pages was "too much text: cut almost everything", and
the inspector now counts:

| Where | At most |
| --- | --- |
| The first screen, everything in it | 30 words |
| Its headline | 12 words (about 32 characters is safer) |
| A section, outside a list or a table | 60 words |
| A card or an item | one sentence, about 25 words |
| The whole page | about 500 words |

Past one and a half times a budget the inspector fails the page. Write the deck, count it, then cut
every sentence that repeats the heading, explains the design or could stand on a competitor's page.

## 2. The two-line headline

A headline is a title. It is held in one glance. On the studied gallery sites the hero headline has a
median of 5 words and 70% sit on one or two lines at desktop width. Every headline on your page, at
every viewport, fits in **two lines or fewer**. `inspect.mjs` measures this at 1440, 768 and 390 pixels
and fails the page otherwise.

The constraint is arithmetic, so do it before you fall in love with a sentence:

```
characters per line ≈ line width in px ÷ (font size in px × k)

k ≈ 0.40  condensed faces
k ≈ 0.50  most grotesks and serifs at display size, tight tracking
k ≈ 0.58  wide / extended faces, all-caps settings
```

| Where | Line width | Size | Per line | Two-line budget |
| --- | --- | --- | --- | --- |
| Phone 390, 20px gutters | 350px | 44px | ~16 | **~32 characters** |
| Phone 390, 20px gutters | 350px | 34px | ~21 | ~42 characters |
| Tablet 768 | 690px | 64px | ~22 | ~44 characters |
| Desktop, 12-col measure | 1100px | 104px | ~21 | ~42 characters |
| Desktop, half width | 620px | 72px | ~17 | ~34 characters |

So a hero headline of **about 32 characters or fewer** (four to six words) survives everywhere at a
confident size. Up to about 42 works if the phone size comes down to the mid-30s. Past that you are
writing a sentence; move the rest into the supporting line.

Controlling the break:

- Give the headline a `max-width` in `ch` so it breaks where you intend, and add
  `text-wrap: balance` so two lines come out even.
- Where the break matters (it usually does), author it: `Stools for<br> small kitchens`. Check the
  phone screenshot; if an authored line wraps there, hide the `<br>` under a breakpoint or shorten.
- Never fix a long headline only by shrinking it. A timid 28px headline of nine words is worse than
  five words at 64px.
- Avoid a single orphan word on line two. Rebalance by cutting a word, not by nudging the width.

Section headings follow the same rule and are shorter: two to five words.

**A statement is not a headline.** An intro sentence or a quotation set large (the manifesto line
after the hero, a testimonial) is a paragraph: mark it up as `<p>` or `<blockquote>`, keep it to about
25 words, and set it at statement size, which the inspector takes as 36px or less on desktop, 32px on
a tablet and 24px on a phone. It may then run to about three lines (four on a phone). Set larger than
that, or marked up as a heading, or placed as the main line of the first screen, it is a headline and
gets two lines. In blind judging, a sentence set big over three or more lines was read as a long
headline every time, whatever its markup; if the words matter that much, cut them to a two-line
headline instead.

## 3. Headline shapes that work

All seen repeatedly on the gallery sites. Pick the plainest one that is true.

- **The name.** The brand or the person, set very large, with a one-line description elsewhere.
  Strongest when the name is short and the subject is visual (studios, restaurants, hotels, people),
  and when the page is built on what the name means (Klee is clover; Hvit is white). The name then
  appears once on the first screen: the bar shows the mark alone, or its wordmark arrives once the
  hero has scrolled away. A headline that repeats the logo beside it reads as a template (a roastery's
  first screen, round 10).
- **What it is.** "A vinyl shelf in your pocket." "Furniture for small rooms." Category, stated with
  one specific word.
- **The claim.** "Your bank won't do this." One sentence a competitor could not sign.
- **The instruction.** "Understand your money." Verb first, short.
- **The place or the moment.** "Antarctica." "Lisbon, since 1984." For hospitality, events, travel.

Shapes to avoid, because they are the average of every landing page:

- The mad-lib: "The AI-powered platform for modern teams".
- The tricolon: "Fast. Simple. Secure." or "Plan. Build. Ship."
- The correction: "It's not just a tool, it's a workflow". Also "More than a …".
- "X, reimagined / redefined / made simple". "Welcome to …". "Meet …" for a product nobody has met.
- A question the reader did not ask.
- A headline that needs its colon: "Ledgerly: invoicing for freelancers". Drop the name, it is in the
  navigation.
- One word of the headline styled differently (italic, serif, coloured, underlined, in a pill).
- Not the name plus its category ("Kaffee Klee, roastery and bar"), and not a bare category line
  with nothing of this client in it ("Roasted and poured in Berlin"). For a name whose meaning the
  page is built on (Klee is clover), the name itself is the headline, the largest type on the screen,
  and the sentence under it says what the place is and what the name means; otherwise the line says
  what only this place could say, from the inventory ("Roasted in the courtyard on Tuesdays and
  Fridays"), and the name stays in the bar and the title.

Sentence case. No full stop unless the direction's voice uses them everywhere.

## 4. Supporting line, body, buttons

**Supporting line.** One sentence, at most about 18 words, that says concretely what the thing is and
who it is for. It is where the detail cut from the headline goes. It never repeats the headline in
other words. The offer is one sentence, never a stacked list of labels (city / service / service).

**Body.** Short paragraphs of plain statements. Prefer the specific noun and the real number: "ships
in a week" over "fast delivery"; "38 seats" over "intimate". Read every sentence and ask whether a
different company could print it unchanged; if so, sharpen it or cut it.

**Buttons.** Name the action or the thing: "Book a table", "See the plans", "Download for Mac".
One to three words. The primary action keeps one name everywhere on the page. One primary button per
screen; the second action takes the treatment the dealt button design names (a text link, a quieter
fill). An arrow only where that design has one, never on every link. One action appears once in a
block: never two buttons or links to the same place in one screen or section (a roastery's first
screen had two Directions buttons). The bar's action counts: where it and the hero's button would go
to one place, give the hero's button another or bring the bar's action in once the hero has scrolled
away (`duplicate-action`).

**Navigation.** The wordmark, up to five plain links, one action. Link labels are single nouns, one
or two words; never a sentence or a tagline in the bar, and no announcement or information strip
above it.

## 5. Proof without inventing it

Never invent customers, quotes from named people, press logos, user counts, ratings or benchmarks.
Invented proof is both dishonest and a recognised tell.

When the brief supplies no proof, use what is true by construction:

- Show the thing itself, large. A real demonstration outranks any quote.
- State how it works, specifically.
- Use facts from the brief (price, place, year, materials, what is included).
- If a testimonial or logo section is explicitly requested and no real ones exist, build the section
  with plainly fictional sample content and say so in your final report so it is replaced before
  launch. Do not put real company names or real people in it.

**Sample details are different from proof, and they are expected.** Where the brief gives the shape of
the content but not every detail (six rooms "from €140", "a short menu", twelve speakers), write the
full set of plausible details: each room with a name, a bed, a view and its own rate; each dish with
its price; each speaker with a talk title; or, when there are fewer good pictures than rooms, each
kind of room (references/imagery.md §2), with its picture and its rate. A design can only be judged at
its real density, and a page that shows one rate where six rooms exist looks unfinished. The details
sit beside the room's picture, or beside the dish's own photograph where the client has one
(references/imagery.md §2), never in a spec panel or a filled box standing in for it. List every
sample detail in the report so the client confirms or replaces it.

**Words beside a stand-in never claim it.** A picture that is not the client's own (a detail of a
room, the load of a product, the place) carries the facts of the room or the product, never a line
that says it is the client's photograph, and never another business's name from its credit. The
`data-slot="product-photo"` slot sits on the product statement (its name, its true figures, its
colourways and its measured size, never an empty box), a `work` frame holds the project's own still
or its title, set in the page's type; a `room-photo` or `house-photo` frame
holds its photograph (a detail, the place) with the facts beside it. None says "photo coming soon" or
"placeholder", or notes that a picture is missing.

**A menu item's name is never set beside a stock picture.** "Flat white, 3.80" beside someone else's
cup claims that cup as this café's: without the client's own photographs the menu stands in type, and
the trade's pictures (the pour, the beans, the street) carry no item's name or price (a café page
showed stock drinks as its menu). On a product page the opposite holds: the copy names the uses and the
loads (the weekly shop, two children and their bags, the school run in the rain), and each photograph
stands beside the line that names what it shows. A picture no line names is cut, not captioned to fit
(a child's boots in a puddle stood beside a cargo bike's range).

**Facts about the real world are not sample details, and they are not to be left out either.** A page
about a real place names the real, checkable things a visitor needs to get there and to picture it:
the village it stands in, the region and its towns, the road that reaches it, the ferry, the train
or the airport that serves it, and the drive from the nearest town with its time ("70 km by road,
about an hour and a quarter"): from the road distance on a map when one can be read in this session,
otherwise at about 60 km an hour on country roads, rounded up and marked in the report to confirm.
A visitor plans by the time, and a page that names no village and no drive time leaves them guessing
(a Westfjords guesthouse, round 10). No time ever makes a place nearer than it is: "forty minutes
from Reykjavik" for a house in the Westfjords, hours away, is wrong to every reader who knows. What
cannot be checked from a map or the brief stays off the page: populations, history, awards, records
and "the oldest" or "the only". List every real-world fact the page states in the report,
with where it came from, for the client to confirm.

**A place people go to says how to get there.** A café, a bar, a restaurant, a shop, a guesthouse or
a studio with a door gets a visit block with six things: the street, a real street in the right
district of the town the brief names (one such a place would stand in, with no house number unless
the brief gives one), or for a remote place, or a brief that names only a region, the village it
stands in and the nearest town with the road from it, and no street; the district or area; the
nearest stop and its line, read from a map in this session or one you are sure of, otherwise the
district's main station (for a remote place, the drive from that town with its time, as the
paragraph above says); the opening hours
(a house or a hotel may print its season and its check-in times instead); a "Directions" link to a
maps service (OpenStreetMap, Google or Apple Maps) searching that street and town, or that road and
town; and one contact. The street, district, way there and hours the brief does not give are sample
copy, and the report marks them for the client to confirm. Never a placeholder street (Musterstrasse
12, 1 Main Street, Example Road), and never the city's name alone: a roastery page that printed
hours and an email under "Open in Berlin" left the visitor nowhere to go, and the judge marked it
high. With no phone number in the brief, the page prints none: never a zeroed or patterned number
(030 000 000 00, 555-0123) and never a real area code with random digits, which can ring a real
line; the contact is then the email at the brand's own domain, never `.example`, unless the name is
coined (below). A page with no door
in its brief (a product sold online, an app, a portfolio) prints no street, hours or phone at all:
the email and the city the brief names. When the brief gives no email address, the sample one is
sample content, and no form that sends a visitor's details (an order, a booking, a delivery address,
a sign-up) is wired to it: for a made-up brand that
domain belongs to a stranger. Such a form posts to an endpoint the client gives, or stays unwired with
its handler named in the report; the visible contact line and a mailto link on it stay as the house
rules ask.

**A brand the brief does not name gets a coined name.** A plausible word (Engram, Inkwell, Kasten) is
often already a real product's name, sometimes in the same trade, and the page then reads as theirs.
Coin one that reads as invented: two short roots joined, or a word bent out of shape, never a dictionary
word alone or a known product's name. **Check it before use:** search the name with the trade's word
("<name> notes app", "<name> invoicing", "<name> café Leipzig") and the domain it would use
("<name>.com", "<name>.app"), and drop it when a product or company of that trade already has it or
the domain is a live site. Two names coined in tests, for a notes app and for a tool, were real
products of the same kind, and one page had to be renamed before it could be shown; another linked the
live address of a product with its coined name. The same goes for a product, plan or feature name the
page coins. A coined name's email and links use the `.example` domain (hello@<name>.example) until the
client gives its own: any other address may be a stranger's. The inspector warns on it
(`placeholder-contact`); the report names it with the name. Say in the report that the name is a
placeholder, searched but not checked against trademarks, and is to be replaced by the client's own.

## 6. Things that read as generated

`lint.mjs` flags most of these.

- Verbs and adjectives of the genre: unlock, unleash, supercharge, elevate, empower, streamline,
  seamless, effortless, robust, cutting-edge, next-generation, world-class, all-in-one, blazing fast.
- Labels pretending to be editorial: "Field notes", "The details", "Our philosophy", "Quietly trusted
  by". A section heading can simply be "Pricing".
- Furniture text: locale or time strips, "Est. 2024", coordinates, version stamps, "Scroll", "(Scroll
  to explore)", fake photo credits, status lines such as "Available for work" with a dot, strings of
  words separated by middle dots or slashes.
- The em dash as a habit. One or two on a page read as writing; ten read as a model. Use a full stop.
- Explainer captions that narrate the design: "A clean, minimal layout for…".
- Step labels that duplicate numbers: "Step 1", "Phase 02".
- Three parallel items everywhere: three features, three stats, three steps. Use the number the
  content has. And the stats band itself, big figures each over a one- or two-word label: a figure
  stands in the line that says what it counts ("Notes from 2019 still come back: 1,284 of them").
- Two sign-up forms on one page (the closing section and the footer). One email form a page.

## 7. Micro-typography

- Curly quotes and apostrophes (“ ” ’), a real ellipsis (…), an en dash for ranges (9–5).
- Non-breaking space between a number and its unit, and before the last short word of a headline
  when it would otherwise orphan (`&nbsp;`).
- `font-variant-numeric: tabular-nums` where numbers line up in columns (prices, tables).
- Every price carries its unit, the same way on every line ("60 €", not "60"); emails, URLs and phone
  numbers never break (`white-space: nowrap` on their link).
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- No all-caps for anything longer than three words; if you set caps, add 0.02–0.06em tracking.
- No text under 13px. No centred paragraphs longer than three lines. No justified text.
