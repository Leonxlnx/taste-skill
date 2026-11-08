# Copy tells

What makes website copy read as model-written, with the fix for each. Dated November 2026: the tells
move with every model generation, so learn why each one reads as a model and do not just memorise the
list. One tell proves little; clusters and repetition are the signal. `scripts/copy-lint.mjs` counts the
ones that can be counted; its id is in brackets.

Severity: **ban** (one is a tell), **cap** (fine once, a tell when repeated), **context** (counts only
beside other tells).

## Why it happens

A model picks the phrasing that fits the most pages, and tuning smooths it toward safe, positive,
dense prose. The odd true fact gets replaced by a claim that fits any business. So the specific has to
come from the input (the brief, the client's words), never from style rules; and every rule that bans a
habit needs a positive move beside it, or the model reaches for the nearest substitute.

## First generation: the old tells (mostly avoided now; still checked)

- **Ban words** [copy-slop-word]: delve, tapestry, testament to, realm, embark, beacon, multifaceted,
  paradigm, myriad, plethora, meticulous, intricate, interplay, garner, boasts (for "has"); elevate,
  unlock, unleash, empower, harness, supercharge, turbocharge, seamless, effortless, cutting-edge,
  revolutionary, transformative, holistic, next-level, next-generation, world-class, best-in-class,
  game-changer, game-changing, state-of-the-art, bespoke, synergy, leverage, reimagine, powerful,
  robust, nestled, unparalleled, unrivalled. Each stands in for a fact: "seamless" for the setup steps,
  "robust" for the failure case, "powerful" for the figure. A word that is literal for the trade stays:
  a climbing harness, bespoke tailoring, a seamless knit, an elevated terrace, a game's realm. So
  does the client's own name (Elevate Pilates) where the logo, the title before its ":" or
  `og:site_name` writes it: one WARN [copy-brand-word], kept when the brief gives the name. In the
  pre-model sample of about 60 brand pages, leverage, cutting-edge, state-of-the-art, bespoke,
  best-in-class and high-quality appeared zero times; seamless twice in 30 tech pages.
- **Capped words** [copy-cap-word, WARN]: innovative, streamlined, curated, high-quality, hassle-free,
  unforgettable. Fine where literal ("curated by" a named person); a tell when they carry the claim.
- **Stock lines** [copy-stock-phrase]: "In today's fast-paced world", "Unlock the power of", "The
  future of X is here", "Say goodbye to", "Whether you're A or B", "Join thousands of", "Trusted by teams
  worldwide", "Imagine a world where", "Ready to transform your X?", "Look no further", "one-stop shop",
  "X made simple", "at your fingertips", "in just a few clicks", "It's not just a X, it's a Y", "Not
  only X but also Y", "Here's the thing", "Let that sink in", "X, reimagined", and "from startups to
  enterprises" or any false range that means "everyone".
- **Residue** [copy-residue]: "Certainly!", "I hope this helps", "[Company Name]", lorem ipsum,
  `{{tokens}}`, markdown asterisks or `##` on the rendered page, a `[NEED]` left in, a placeholder logo
  row, "Sarah J., Marketing Manager", "© 2024" on a page of a later year [copy-stale-year]. The
  strongest single tell: a conversation or a template pasted into the page. (In the notes' draft a
  `[NEED]` is only listed [copy-need]; it goes to "Client must supply".)
- **Shapes:** the -ing rider tacked onto a fact (", ensuring a smooth start") [copy-ing-rider]; the
  question answered at once ("The result? Three hours back.") and the colon reveal ("One thing changed:
  X") [copy-reveal]; "serves as", "stands as", "plays a key role" where "is" or "has" would do
  [copy-puffery].
- **Punctuation:** em dashes everywhere [copy-em-dash]; exclamation marks in body copy
  [copy-exclaim]; emoji as bullets [copy-emoji]; a typed arrow after each link's words, whatever the
  link [copy-arrows].
- **Dead metaphors:** landscape, ecosystem, journey (unless it is travel), "in the X space", hub,
  "the world of", "where X meets Y", "in the heart of", experience as the thing sold ("a unique
  experience") [copy-puffery]. Name the street or the thing.

## Second generation: the tells now

These look like good copy, which is why they survive review.

- **The house voice** (the meta tell). Warm, wry, modest, a little literary, for every client. Fix:
  a register from `copy-registers.md`, chosen per client.
- **Invented specifics** (ban). "6:12 a.m., from the window of Room 9", "Batch No. 047", "38% fewer
  re-runs": detail produced as decoration because detail persuades. Fix: the brief's details only;
  without them, a plainer line.
- **The strip of figures** [copy-stat-strip]. A row of three or four figures, each over a one-word
  label, under the hero or the story, on nearly every model page. Fix: each number in the sentence it proves; a strip only
  of plain facts the brief gives (a price, the hours, a count). A menu's prices, a timetable and a column
  of one unit are not strips.
- **Two-fragment headings "X. Y."** (cap 1) [copy-two-fragment]. "Twelve rooms. Three ways to stay."
  Fix: the other heading shapes in `copy-moves.md`: a name with a claim under it, a verb and the thing,
  a full-sentence claim, a question kicker with its answer, a real customer's words.
- **Number-pair headings** (cap 0 to 1) [copy-number-pair]. "Four projects, four very different
  problems." Two unrelated model pages wrote almost exactly this. Fix: say what the section holds.
- **Contrast frames and their substitutes** (cap 2 in all) [copy-contrast]. "Freshness isn't a
  slogan here." Suppress "not X but Y" and it returns as "rather than", "instead of", "without the".
  Fix: state the positive fact alone ("We roast on Tuesday and sell by Saturday" argues with no
  slogan). A buyer's question in the FAQ is not the device.
- **Negation runs** (cap 1) [copy-negation]. "No forms, no back-and-forth." Two unrelated model
  pages wrote nearly that line. Keep one only when each item is a refusal the buyer can check (Allbirds'
  "No flashy logos" run worked because you could look).
- **Virtue words** (ban about ourselves) [copy-virtue]. honest, calm, quiet, actually, genuinely,
  truly, simply, thoughtful, carefully, intentional, steady, dependable. Fix: show it with an admission
  or a fact (Oatly called itself "not a perfect company"). A page never calls itself honest.
- **The dry closer.** "They hold spoons now." on the end of most paragraphs; the same joke on two
  unrelated sites. Fix: end on information; the humour moves to the microcopy.
- **The footer sign-off** [copy-footer-signoff]. "Made in Rotterdam, fired at 1,260 degrees."
  "Every Tuesday since 2019." Fix: the legal row of `copy.md`, nothing else.
- **The name's metaphor run into the ground.** A brand called Kiln that "fires" every section. Fix:
  once, or never.
- **The origin template.** "In [year], [two first names] found [an old hardware store] and kept [one
  original detail]." Fix: the brief's real story; with none, no story section.
- **Polished testimonials** [copy-quotes]. Always three, each a small story with a number and a
  punchline. On a tasteskill page there are none unless the brief gives them, word for word.
- **The default cast** [copy-cast, copy-cast-company]. People: Priya (Raman, Shah, Nair), Daniel or
  Amara Okafor, Marcus, Dana, Aisha, Lena M., Tomas, Nora, Maya, Mara and Theo, Isla, Ines, Jess, Sarah J.,
  Elara. Companies: Fieldnote, Kestrel, Halcyon, Brightloop, Acme, Northwind, Lumen, Nimbus, Apex, Zenith,
  Vertex. Places a model reaches for when none is given: a Maine harbour, Portland (Oregon),
  Copenhagen, Rotterdam, Lisbon. Fix: person names only from the brief; a mock's names fit its town
  and generation, never reused across pages; a coined brand is none of these (`copy.md`, names.json);
  a made-up client's town comes from the brief.
- **The section template.** Eyebrow, claim heading, short lede, three or four cards, every section;
  "Kind words" over the quotes; step numbers on parallel features [copy-numbered]; a small label set
  over each section's heading [copy-eyebrows]; "Most popular" on the middle plan and "No card required"
under every button. Fix: shape from the reader's questions
  (`copy-voice.md` section 3).
- **Response-time promises** [copy-response-time]. "Within two working days" on site after site. Fix:
  one, from the brief, worded the same wherever it repeats.
- **"Since [year]"** [copy-since]: once, where it matters, from the brief.
- **Proof figures** [copy-proof-figure]. "3x faster", "10,000+ teams", "98% satisfied": round, neat
  and unsourced. Fix: only figures the brief gives, with their unit, in a sentence.
- **Perfect evenness.** Every card the same length, every paragraph the same arc [copy-rhythm]. Fix:
  spend words where the brief knows most; one section may run long, one may be two lines.
- **Microcopy left unwritten.** A hand-tuned hero over a stock form error and a stock thank-you. Fix:
  write them in the register (`copy-moves.md`).
- **The category label as the hero** [copy-h1-category]. "Small-class yoga studio in Brooklyn",
  "Observability tool for developers": correct, and true of every rival in the next town (the swap
  test). Fix: a hero form chosen on purpose (`copy-moves.md`), the category plain in the lead.
- **The close that repeats the ask** [copy-close-repeat, copy-close-ask]. Five place pages in one test
  closed on their button's words as the heading ("Book a free class" over "Book a free class"); a bike
  shop said "Book a repair slot" and then "Book your repair slot". Fix: the close says something new
  (`copy-moves.md`, Buttons and the close).
- **One phrase in three headings** [copy-heading-echo]. "Houses and cabins in wood" three times on one
  page. Fix: each heading names its own part.
- **No notes** [copy-notes]. A page written without a fact sheet and a voice card fills a template
  with plausible inventions; every other tell here follows from that.
- **Process talk** [copy-reveal]. "This section shows", "Below, you'll find", "Here are 3 reasons",
  "We've added". The page never talks about itself or about how it was built.
- **The stale year** [copy-stale-year]. A copyright line older than this year.

## Over-correction: what the rules themselves produce

| Rule applied | Habit it breeds | Counter |
| --- | --- | --- |
| No em dashes | Comma splices, full stops only | colons, brackets, semicolons where natural |
| No "not X but Y" | "rather than", "instead of", "without the" | count them together; state the positive |
| No hype words | calm vocabulary: quietly, steady, honest, practical | a fact in place of any adjective |
| Avoid threes | everything in pairs | list as many items as there are |
| Be specific | invented numbers and anecdotes | the fact sheet, or a plainer line |
| Short, punchy sentences | a drumbeat of fragments | one sentence a section may run long |
| End strong | a moral or a quip on every paragraph | end on information |
| Add personality | a joke in every section | a humour budget, spent in the microcopy |
| Vary section length | one huge and one tiny section on every page | length follows the material |
| One rule pack on every page | a new uniform house style | the sameness check across pages |

## Not tells (leave them alone)

Perfect grammar. Plain "is" and "has". "In order to". A transition word on its own. Title case when it
is the client's house style. One "no card needed" when it is true. A narrow superlative the brief can
prove. A refrain repeated on purpose. A list of three when there are three things. Copy the client wrote
themselves (when copy-lint FAILs a word of it, the gate takes a waiver for that one hit with the brief
as the reason: `gate.md`). Selling on a sales page: persuasion is the genre; the test is whether it stands on facts.
