# Story

A page is a story when its headings, read alone in order, make a paragraph and something from the
hero comes back changed; a list when two neighbours could swap places.

For each spine line name the visitor’s question, its worked form and what changes there.
A float leads to a clue, or a delayed call changes three teams’ times. Map every required `beat: <id> | section: #id`. Use `Short:` only to quote a brief asking for a small page.

## The method

1. **Take a shape.** `start.mjs plan` deals one from `library/stories.json`. Take it, or the one the
   table below gives (deal again with `--story <id>`), and say why on plan line 3. 
2. **Write the spine first,** under `## Story` in the copy notes (`copy.md`): the h1, then every h2
   in order, each with its beat and the word that joins it to the one before. The draft's `H2:`
   lines are the spine's lines, in the same order.
3. **The join test.** Between two neighbouring headings write one word: *so*, *but*, *then*,
   *until*, *which means*. Where the only honest word is *also* or *and*, the two are a list:
   reorder, merge, or give the second a reason to follow the first.
4. **One thing travels.** The thread is one record, object, person or time in the hero and again,
   with the same identity and a new state, time, amount or place in two later sections or more, each in the state that section
   is about. A picture that comes back shows its subject in a new state.
5. **Name the turn and the bookend:** where something changes, and what the close brings back from
   the hero with the fact the page earned.

copy-lint FAILs notes without the block, an unknown shape, an empty thread or an unmapped required beat [copy-story]. The
checker WARNs a page that drifts from the planned order [spine-drift], three bare labels in a row
[label-run], a thread that never comes back [thread-lost], a close that answers nothing in the hero
[close-unanswered] and grounds that stripe a chaptered page [stripe-grounds].

## The brief has: the shape

| The brief has | Shape |
|---|---|
| A pain, a rival or an old way it replaces ("instead of", "no more", "without") | `problem-turn` |
| A product used in a sequence (install, use, result), or a service with a process | `work-path` |
| One object or platform with four to six distinct qualities or areas | `chapters` |
| Something lived through a day, a stay, a session or a working shift | `day-with-it` |
| A promise in two parts, two products or two audiences | `two-part-promise` |
| A small team or owner speaking, or a change of course (launch, sunset, new edition) | `letter` |
| A new version of something that existed | `sequel` |
| Many items to choose from, a body of work, releases | `catalogue-argued` |
| Buyers so different that the page should ask first | `question-first` |
| Makers, merchants or founders who grow with it | `reader-rise` |
| Real figures, standards or named customers to prove a claim | `claim-proofs` |

When two fit, take the one whose thread the brief can supply; without a thread a shape is a list with
a label on it. The order rules stay (visit on screen two, order within three sections).

## The shapes

- **`claim-proofs`:** claim with a fact, the mechanism, proof at two scales, the objection, the ask. Faked: adjectives in cards.
- **`problem-turn`:** the pain, the old way pictured, the same object after (its heading answers the one before), the outcome. Faked: a frustration paragraph and a feature grid.
- **`work-path`:** the central view, then each step of the work with the product in that step's state, the result, the price. Faked: features in any order, one screenshot repeated.
- **`chapters`:** contents in the hero, one chapter a section on one scaffold, use before machine, then price and makers. Faked: labels painted on unrelated bands.
- **`day-with-it`:** arrival, each hour or stage with what happens then, the practical part where it falls, the end of the day as the ask. Faked: time words pasted on.
- **`two-part-promise`:** a hero line in two halves, each half kept together, a hinge, where they meet. Faked: the halves interleaved.
- **`letter`:** news, a signed letter (the makers' past, one limit, a name and role from the brief), the practical part, a sign-off. No person in the brief, no letter.
- **`sequel`:** the object first, the difference with a number, everything changed as one list, the changes close up, specs. Faked: no predecessor named.
- **`catalogue-argued`:** the range in an order that argues, one item opened, the rest with a fact each, why buy here. Faked: a grid in no order.
- **`question-first`:** a question, the reader's pick answered in the same view, the cost, the question turned back. Faked: a picker that changes nothing.
- **`reader-rise`:** the reader named, people like them now, tools that grow with them, the reader's first three steps as the close. Faked: "you" in the hero, a corporate list after.

## Handover devices

- **Two-tone heading:** a claim, then a reason in `.muted`; the h2s alone become an argument.
- **Heading pair:** two neighbouring h2s that answer each other, the second showing the first's object after.
- **Contents and chapter bar:** `contents-row`, `chapter-nav` (four to six chapters).
- **Margin track:** a gutter line with a stop per chapter (`assets/own/margin-track.html`).
- **Ground per chapter:** the plan's `chapters` grounds; never a new ground every section.
- **Recurring object:** at three turns, doing something new each time.
- **Bookend:** the close brings back the hero, changed (step 5).
- **Question answered:** a heading asks the reader's question; the next section answers.
- **Edge at the turn:** one shaped edge (`data-edge`, lively and loud pages only, `expressive.md`).
- **Footnote marks** (`end-notes`) and **one constant action** (the phone bar).

## Kit parts (`system.md`, Story parts)

- `chapter-nav` with `chapter-head`: the chapter bar, pinned from the first chapter to the last, the one page-level exception to "nothing sticky outside its section". A `chapter-head` names a chapter above its h2 only where a `chapter-nav` or `contents-row` lists the same names.
- `contents-row`: up to five chapter links under the hero's lead.
- `end-notes`: numbered marks and their notes above the footer, each with a way back.
- `.record`: one look for one named record in every built UI.
- Worked examples: `assets/own/states.html` (one object through several states), `letter.html`, `margin-track.html`.

## Rules that bend for a story

- On a `chapters` page the chapters may share one scaffold when each shows the product in another state.
- The turn may be the page's one standalone statement; then nothing else stands alone.
- Proof without invented customers: the product working on a plausible example of the reader's own case, labelled once as an example.
