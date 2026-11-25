# System

Use the kit's fonts, palette, spacing, radius and button families throughout. Use `layout-v4.md` for edges and air, `backgrounds.md` for grounds and `motion.md` for timings. For a content-shaped section, see `compose.md`.

## Base

- `*{box-sizing:border-box}`, `html,body{margin:0}` and `<meta name="viewport" content="width=device-width,
  initial-scale=1, viewport-fit=cover">` (without the reset the hero ends at 908 and `.wrap` at x 88).
- Spacing scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (`--s-1` to `--s-10`) for every margin, gap
  and padding you write. Heading to content 48px (32 on a phone); cards 24px apart (12).
- Let each section grow with its content. Keep cards aligned within a row.
- The skip link is the first child of the header's `.wrap`, as `starter.html` has it:
  `<a class="skip-link" href="#top">Skip to content</a>` (`main id="top"`), in the page's language.
  `.skip-link` keeps it out of the layout until the first Tab, then shows it over the logo, so it
  never pushes the logo off the left line [skip-link].
- `<html lang>` is the language the page is written in, from the brief, or its market when the
  brief does not say ("de" for a German page). Screen readers read in it and the headings hyphenate
  by it (`hyphens: auto` for words of 10 letters or more) [lang].

## Rhythm tokens

On `:root`, used everywhere (desktop / under 640px):

| Token | Value | Use |
|---|---|---|
| `--nav` | 72 / 56 | the fixed header |
| `--air-side` | 96 / 80 tablet / 72 phone | base for `--padt` and `--padb` at a ground change and after the hero |
| `--air-same` | 144 / 128 tablet / 120 phone | total gap on one ground |
| `--air-thin` | 64 / 56 tablet / 48 phone | padding per side of `.section--thin` |
| `--gut` | 80 / 24 | the `.wrap`'s side margin: 1280 wide at 1440 |
| `--hgap` | 48 / 40 (place 40 / 24) | the local hero gap, subject to `--hero-clearance` (122 / 74px) for the opening copy |
| `--hpadb` | 64 / 24 | the hero's bottom padding (plus `--bar`) |
| `--bar` | 0, or `calc(64px + env(safe-area-inset-bottom))` with `nav.actionbar` under 640 | added to the footer's bottom padding (the hero's only without script: the bar is never on the first screen), so the page's end clears it; content is never cut to hide behind the bar |

These air values are at regular density. The PLAN sets `data-density` on `html`. The kit scales the three distances by 1.15, 1 or 0.85. A closing footer ends with 64px plus `--bar`.

`.grid` has twelve columns and a 24px gap (12px on a phone). Section and header edges share `.wrap`.

## Type

Use the dealt pairing. At 1440/390 the headline is 64/36px, the section heading 40/28px, the small heading and item title 20/18px at 500, and the lead 18/16px. Body text is 16px. Keep supporting paragraphs in secondary ink at 7–10:1 against their ground. Headings, prices and other decision terms take full ink. Every text role needs at least 4.5:1.

- The hero has one quieter level of small text at most (one supplied offer term by its action, or an optional dated service notice).
- Highlight by contrast, never by colour: no marker highlights or coloured bars behind words; colour
  inside a word once a page at most, never on a place.
- Sentence case everywhere; labels 13px at 500, never tracked capitals or small caps; italic only
  for quotes, attributions and contact lines. Curly quotes; a number never breaks from its unit
  (never "250 / W"); lines at most 62 characters (`.measure`). Nothing under 13px: notes, the legal
  line, dropdown heads, image text.
- Use one type size per role. An own section may use the page's one off-scale display word or numeral (`compose.md`). Keep text live and legible at 390.
- A lively or loud page (`expressive.md`) sets its dealt expressive face at that face's own weight, capitals on h1 and h2
  only in a face drawn for them, an h1 up to 160px and two off-scale words; reading text keeps every rule above.

The centred proof and close deal uses `.section-head--center` on the heading or heading group. A close with a button may combine it with `.section-head--split`.

## Colour

- **The interface stays 90 to 95% neutral;** colour comes from the photographs, the product, the
  work and real logos. One near-black ink, often warm, never #000, for text, hairlines (12 to 15% of
  it), button borders, interface glyphs and a designed mark.
- Body copy, labels and tables inherit the neutral ink for their ground. Use full ink for quiet headings.
- **Real logos keep their own full colours** (house rule): a client's logo or a known product's icon (the
  Google Docs icon) from `icons.mjs` or the brand's press kit, never redrawn or tinted
  (`icons.md`). A fictional client's own mark is designed, not borrowed.
- **One accent at most,** from the client (its product, shopfront paint, tiles, a bag label): the
  primary button (the only filled accent), links, focus and at most one small mark. Use ink on rules, large type and repeated figures or icons. A dealt ink action keeps saturated colour off controls. Set `data-action="ink"` or `data-action="accent"` on the root as dealt. A quiet brand band uses the palette’s separate field. Use `--action` for buttons, links and focus. Check the label reaches 4.5:1 and the button 3:1 on its ground.
- **Grounds.** Any section can take its planned ground. Page inherits `--bg`. Add `.ground-surface`, `.ground-inverse` or `.ground-brand` directly to the section for tint, inverse or brand. The hero uses the page ground outside tech.
- **The grade** (light or evening) is chosen once on load or by a click, never by scrolling; the dark
  evening grade is tech only.
- **Words on a photograph.** Choose the crop and check contrast at each width (`photos.md`).
- **Never violet or lavender:** a token whose OKLCH hue falls between about 270 and 330 degrees is
  turned to 255 (blue) or 345 (rose), whichever is nearer; a deal that returns violet is dealt again.

## Radius and buttons

- `<html data-radius>`: `sharp` 4/6/8, `soft` 8/12/16 (default), `round` 10/16/24. `--r-lg` cards
  and frames, `--r-md` panels, `--r-sm` controls, `--r-btn` buttons; software windows one radius
  (12 to 20) with a 1px line. Set the PLAN's `data-pictures="square|soft"` on html. For a shaped mask, mark one inset picture frame `data-picture-mask`. Full-bleed grounds reach the edges.
- `.btn.btn--primary` and `.btn.btn--secondary`, 44px high (48 on a place, with
  `data-buttons="block"` and in the phone bar; the nav's button is the same `--btn-h`, never
  smaller), label 15px, 20px side padding, at most two in a `.btn-row`, full width on a phone.
  The look is dealt once on `<html data-buttons="solid|pill|tonal|arrow|block">`; the markup never
  changes. Exactly one filled button marks the main action in any view; every secondary takes one
  style; text links use `.link`. `.btn--xl` once, in the type close. Never a slanted, gradient,
  ghost or shadowed button, or a third style. Their hover and press: `motion.md`.
- Keep the main button text-only. An external link or download may carry one mark, once per page. At most two text links carry arrows.

## Nav

- `header.nav`: `position: fixed`, full width, `--nav` tall, opaque ground, a 1px hairline under it
  from the first paint, `z-index: 10`, the same at every scroll depth: no blur, transparency,
  shrink, hide, shadow, colour flip or floating pill. Its `.wrap` puts the logo and main action on the page's edges. Sticky content belongs inside its own section (`compose.md`); the one page-level exception is the `chapter-nav` (Story parts).
- The dealt type is a class (`sections.md`): `nav` (nav-mega, nav-cards), `nav nav--centre`,
  `nav nav--split`; `nav--tone` puts the bar on the inverse ground (tech).
- Use the client's logo, the mark supplied by `brand-mark`, or the dealt `data-mark` and name. Repeat it in the footer.
- Four to six plain one-word nouns (ST-09; a place: Menu, Rooms, Workshop, Visit, About) at
  14px/500 on quiet pages, each on one line, each with its own anchor; a second action as a plain word only when the client has one
  (Sign in for an app with accounts, Gift cards for a shop that sells them); the main action as the
  one button. Link directly to each destination. A panel groups several related destinations with a label that predicts what opens.
  The current page: `aria-current="page"` on one word at most, a 2px bar under it.
- 640 to 1023: the bar keeps the primary button beside the 44x44 menu button, never a bar of only
  the logo and the menu. The menu button takes the secondary button's look.
- Under 640: the menu opens a full-screen sheet (56px rows, closes on any tap; a place adds the
  street and the week's hours at its foot). `nav.actionbar` (required on a place, optional
  elsewhere) is fixed at the foot, on the ground with a 1px top hairline: one 342x48 main action or
  two 165x48 buttons; `--bar` is then its height. It never covers a label or link. With the bar
  the nav's button moves into the sheet (system.css). system.js shows the bar only once the hero's
  main button has scrolled off the top, and hides it again while that button, or a link or button
  that does what one of the bar's does (the same address or the same words, such as the close's
  booking button or the footer's directions), or the form it links to, is on the screen: one screen never shows an action
  twice [action-repeat]. Hidden, it is off the screen and inert, so nothing in it takes the focus;
  it never hides while the focus is in it. The hero does not pad for it then. Without script the
  bar is simply always at the foot, over the page as it scrolls by; the hero and the footer pad for
  it, so it covers neither the first screen's button nor the page's end. Write it as the starter does, a child of `body` after the footer, and add no script of your own.

## Footer

`footer.closing` is the page's last section (`layout-v4.md`): row 1 the dealt close, row 2 the
directory on one ground (link columns, the legal row). Types: `footer-columns`, `footer--dark` (columns on a darker ground), `footer--statement` (the lit ground; tech),
`footer--visit` (directions and opening hours). Start with the next job: contact or support, then only the distinct routes that exist. Repeat hours, directions, downloads and delivery or return terms where useful. Keep legal and credits separate:
the brand, the current year, Privacy, Terms (Imprint only with the company's own details from the
brief) and the one credits link (`<a class="credits" href="credits.html">`, `photos.md`). `.socials` stays empty
unless the brief gives the accounts.

Only the dealt large-wordmark option adds `data-wordmark="large"` to the footer. Use the supplied contact at 18–20px in `.footer-contact`. Put supplied sign-in, docs, status or app store routes in both navigation and footer. For software without those URLs, link the setup section as Quickstart in both.

## Cards, lists and forms

- `.card` as `cards.md` builds it; one height per row; never text in a box in a box. Open tiles
  (`.tile`) for rooms, models and people; `.rows` for menus, prices and specs (space between ordinary rows, rules for tabular data). `.faq` shows answers in full. Use `.faq.faq--fold` for a long set. For a composed accordion follow `compose.md` and `motion.md`.
- Opening hours: `<dl class="hours">` of `dt`/`dd` pairs with `data-days="tue-sun"` or `data-days="sat,sun"` on each `dt` (the row's label; the `dd` takes none) and
  `data-tz="Europe/Berlin"` on the `dl.hours` itself (the venue's zone; system.js reads it only there): system.js marks today's row (weight 500) and
  fills `[data-open-now]` ("Open now, until 16:00"; "Closed, opens Tuesday at 7:30"); never
  `.is-today` by hand. Without `data-tz` the rows read as plain text, and the panel must read right
  without the script. Hours the brief does not give carry `data-assumed` on the `dl` and get no
  open-now line: system.js never fills it from them [open-now].
- Forms: the recipe below.
- A `[bracketed placeholder]` or "(sample)" tag left in visible text is outlined in red by
  system.js, as is a visual that fails to draw: fix both. `[data-placeholder]` (a stand-in such as
  an `.example` address) is outlined only while the checker runs (`html[data-check]`), never for a
  visitor; the finish gate fails a page that still holds one.
- On a phone the hours are a ruled list (days left, times right, one line each) and the footer has at
  most two columns; system.css does both, so never set a footer's spans for the phone yourself.

## Pictures, statements and compositions

- A split picture fills its row beside the text and takes its own ratio when stacked. See `layout-v4.md`.
- `.fact-line` styles one line under a picture. Add `.fact-line--beside` when it sits alongside. Content and length are in `copy.md`, house rule 1.
- Use `section.own[data-own]` for a composed section. Put its scoped rules in `<style id="own-css">` after the kit styles or link `own.css` there. See `compose.md` for the markup and interaction limits.
- A text moment rides on a heading. For a standalone main claim use `.section.statement.section--thin`.
- `.hero--peek` lets the dealt hero window cross the fold. `.hero-book` docks a booking row inside the hero's wrap. See `layout-v4.md`, The hero.
- Photo compositions and closes keep the markup in `sections-library.md`. `.btn--xl` fits the closing row.

## Story parts

For the page as a story (`story.md`); each is complete without script and reachable by keyboard.

- **`chapter-nav`:** `<nav class="chapter-nav" data-chapter-nav aria-label="Chapters"><div class="chapter-nav__bar"><div class="chapter-nav__in"><ol>` with one `<li><a href="#id"><span>1</span> Name</a></li>` per chapter, four to six, as the first child of the first chapter's `.wrap`, before its h2. system.js pins it under the fixed nav from the first chapter to the last and marks the chapter on screen; under 640px it folds to one line "2 / 5 · Name" that opens the list. It is the one page-level exception to "nothing sticky outside its section", on `chapters` pages only.
- **`chapter-head`:** `<p class="chapter-head"><span>2</span> Planning</p>` directly above a chapter's h2, the same name as its `chapter-nav` or `contents-row` link; never uppercase, never mono, never on a section that is no chapter.
- **`contents-row`:** `<nav class="contents-row" aria-label="On this page"><p>` holding up to five chapter links (`<a href="#id"><span>1</span> Name</a>`) under the hero's lead, in the order the page takes them.
- **`end-notes`:** a figure's source as `<sup class="note-mark"><a href="#note-1" id="ref-1">1</a></sup>`, the notes as `<ol class="end-notes">` above the footer, each `<li id="note-1">` ending in `<a class="note-back" href="#ref-1">Back to the text</a>`.
- **`.record`:** one named record (an id, a sum, a booking line) in one look in every built UI of the page (`--record-bg`, `--record-ink`, `--record-line`); `.record--quiet` without its fill. Name its fields once in the copy notes' Thread.

## Forms

Match controls and form fields with `data-choice="name"`. A `data-choice-set="name:value"` link selects its tab or field before the jump.


One recipe for every form (booking, enquiry, call request, newsletter); `starter.html` has it as
`booking-form`, system.js runs it. A booking system the brief names replaces the form with its link.

- **Where it sends:** `data-endpoint` holds the address of the client's form service when the
  brief gives one; system.js posts to it. Without one the form's `action` is a `mailto:` on
  `.example` (`hello@brand.example`, `copy.md`): a stand-in, listed in the report as the address
  the client must supply. Keep a message field and its submit group on separate full rows with `.field--full`. Name the actual destination on the button (Open email draft). Explain beside it in a visible `.terms` line that it opens the visitor’s email with the request filled in. Disclose preview limits before the fields.
- **Size:** fields 48px with labels at 14px and 16px text (on the phone too, so the browser never
  enlarges the page), tap targets 44px, six fields at most, one column under 640.
- **Labels you can see:** every field has a `<label for>` above it, in words that say what goes in
  ("Arrival", "Guests"). A placeholder is never the label, and an `aria-label` alone is not one
  [field-label].
- **The right field:** `type="email"` with `autocomplete="email"`, `type="tel"` only for a phone
  the brief asks to collect, `autocomplete="name"`, `inputmode="numeric"` for a count, text fields
  for dates on a page not in English. A visitor may paste into any field, and the button stays live
  until it is pressed [form-fields].
- **Errors under their fields:** checked on submit, never while typing. Each field that fails gets
  `aria-invalid="true"` and its reason in the `.field__error` under it, named by
  `aria-describedby`; the reason names the field and what to type ("Write an email address with an
  @"). The first field that failed takes the focus, and the status line says how many there are.
- **One status line:** `<p class="form__status" role="status" data-form-status>` under the button,
  read out as it changes: "Sending" after 300ms, then the confirmation or the failure. A failure
  keeps everything typed.
- **Success only after a real send:** `data-sent` shows only once `data-endpoint` answered. A
  mailto stand-in shows no success line, and no page script writes "Thank you" on submit
  [form-send]. Never a modal.
- **The button names the action:** the button is the main action word for word ("Request a
  table"), the sent line names what was sent in the button's own words ("Your table request is in.
  We reply within a day."), and a line under the form says when the reply comes.

## Access

The page works by keyboard and screen reader as it ships; consistency.mjs FAILs each of these.

- **Every control has a name:** a link, a button, a field, a tab, a toggle; an icon-only button gets
  `aria-label` in the page's language [a11y-name].
- **Pictures:** a content photograph has `alt` saying what it shows; a decorative one `alt=""`;
  a drawn mock `role="img"` with an `aria-label` [img-alt].
- **Headings step down one level at a time** in `main` (h1, h2, h3); a footer's column heads are
  `h3` [heading-order].
- **Tab order is the reading order:** no `tabindex` above 0 [tabindex].
- **Focus shows at once:** the kit's ring (`:focus-visible`, 2px in `--action`, 3:1 on the
  ground) never animates; a page that removes it puts a change of the same strength in its place.
  A focused control is never hidden under the fixed header [focus-visible, focus-hidden].
- **The menu button says its state:** `aria-expanded` on `.nav__toggle`, which system.js flips
  [menu-toggle].

## Head

Every page's `<head>` holds, as `starter.html` has it:

- `<title>` "Name: what it is for whom or where" and a `meta description` of one sentence; never
  the same words [page-meta].
- `og:title`, `og:description`, `og:type` and `og:image`, with `twitter:card`
  `summary_large_image`. The picture is a still of the page's own hero: copy the hero's tile from
  `shoot.mjs` (`tiles/desktop-sec-01-a.jpg`) beside the page as `share.jpg`.
- `link rel="icon"`: the client's logo, else the dealt mark as `favicon.svg` (the mark's 24x24 path
  from `system.css` `.mark[data-mark]`, filled with `--p-ink`; for `initial` the letter on a
  rounded square in `--p-ink`).
- `meta name="theme-color"`: the page ground, `--p-bg` as `start.mjs` prints it.
- `link rel="canonical"` only with the client's domain; until then it stays a comment and the
  report lists it [share-meta].

## Motion

Keep the page still by default. Follow the PLAN’s entrance and reveals lines. Use colour on hover, .98 on press and a visible focus ring. Timing and frame helpers are in `motion.md`.
