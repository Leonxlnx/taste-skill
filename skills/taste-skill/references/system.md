# System

One system for the whole page, in `assets/system.css` and `system.js`. Use its classes and tokens;
never add a second grid, spacing scale, type scale, radius, button, card, hairline, fade or link
style. One strict system per page: one button shape, one radius family, one card recipe, one
hairline, one corner-control size, one link look, one block template repeated. Section heights,
the hero frame, edges, splits and type sizes: `layout-v4.md`. Grounds: `backgrounds.md`. Every hover
and loop number: `motion.md`.

## Base

- `*{box-sizing:border-box}`, `html,body{margin:0}` and `<meta name="viewport" content="width=device-width,
  initial-scale=1, viewport-fit=cover">` (without the reset the hero ends at 908 and `.wrap` at x 88).
- Spacing scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (`--s-1` to `--s-10`) for every margin, gap
  and padding you write. Heading to content 48px (32 on a phone); cards 24px apart (12).
- One height per card row and per tile kind, page-wide; sections at H or 2H.
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
| `--padt` | 120 / 96 | a section's top padding: the h2 sits here |
| `--padb` | 72 / 48 | a section's bottom padding (plus `--bar`) |
| `--gut` | 80 / 24 (place 120 from 1024) | the `.wrap`'s side margin: 1280 wide, 1200 on a place |
| `--hgap` | 48 / 40 (place 40 / 24) | the header to the hero's words, under `--photo` on a place |
| `--hpadb` | 64 / 24 | the hero's bottom padding (plus `--bar`) |
| `--bar` | 0, or `calc(64px + env(safe-area-inset-bottom))` with `nav.actionbar` under 640 | added to every bottom padding (the hero's only without script: the bar is never on the first screen); content is never cut to hide behind the bar |

Grid: `.grid` is 12 columns with a 24px gap (12 under 640); the column numbers are in
`layout-v4.md` section 4. A picture wall is its own grid with a gap of 0 or 2px (page CSS
`.wall`), so the base grid keeps its gap.

## Type

The dealt pairing (`layout-v4.md` section 5) at the tokens `--t-h1`, `--t-h2`, `--t-h3`,
`--t-lead`, `--t-card`, `--t-body` 16, `--t-small` 14, `--t-label` 13, `--t-stat` (38/28,
under the h2). A place sets `--t-h2: clamp(24px, .762vw + 21px, 32px)`.

- Headline and text weights: `layout-v4.md` section 5 (the one place they are set); tight tracking.
- Text people read (sub-lines, card lines, list items, answers) is 16px or more, line height 1.5 to
  1.8, in `--ink` at 7:1 or more. `--muted` (4.5:1 or more) only for labels, dates, meta and a
  heading's grey run-on: `<h2>Send invoices in minutes. <span class="muted">Clients pay by
  card.</span></h2>`. Large text (24px+) in a muted half or an inactive row 3:1 at least. On a place
  every text is 4.5:1 or more, and every word on the brand band 7:1. Never 14px paragraphs or 15px grey card text.
- The hero has one quieter level of small text at most (a grey fact line, or a pill above the h1).
- Highlight by contrast, never by colour: no marker highlights or coloured bars behind words; colour
  inside a word once a page at most, never on a place.
- Sentence case everywhere; labels 13px at 500, never tracked capitals or small caps; italic only
  for quotes, attributions and contact lines. Curly quotes; a number never breaks from its unit
  (never "250 / W"); lines at most 62 characters (`.measure`). Nothing under 13px: notes, the legal
  line, dropdown heads, image text.
- One size per kind of element across the page (every card title, address, figure). A figure never
  outgrows the h2 or the h1, at 390 too. Every word is live text, never baked into a picture; text
  never shrinks to fit.

## Colour

- **The interface stays 90 to 95% neutral;** colour comes from the photographs, the product, the
  work and real logos. One near-black ink, often warm, never #000, for text, hairlines (12 to 15% of
  it), button borders, interface glyphs and a designed mark.
- **Real logos keep their own full colours** (house rule): a client's logo or a known product's icon (the
  Google Docs icon) from `icons.mjs` or the brand's press kit, never redrawn or tinted
  (`icons.md`). A fictional client's own mark is designed, not borrowed.
- **One accent at most,** from the client (its product, shopfront paint, tiles, a bag label): the
  primary button (the only filled accent), the focus ring, links, state in visuals, small marks and
  the one brand band; under 3% of a screen elsewhere; its label 4.5:1 on it and it 3:1 on the
  ground. `--action` drives buttons, links and focus.
- **Grounds:** three tokens (`--g-main`, `--g-alt`, `--g-dark`), a brand band on product and place,
  and the tech CSS grounds: `backgrounds.md`. Dark pages and dark heroes are for tech only.
- **The grade** (light or evening) is chosen once on load or by a click, never by scrolling; the dark
  evening grade is tech only.
- **Words on a photograph** only in the hero and one closing band, on tech, product and service, on
  a crop whose calm part is dark and empty at the phone crop too, or on a solid box; no scrim or
  gradient over a photograph; never on a place.
- **Never violet or lavender:** a token whose OKLCH hue falls between about 270 and 330 degrees is
  turned to 255 (blue) or 345 (rose), whichever is nearer; a deal that returns violet is dealt again.

## Radius and buttons

- `<html data-radius>`: `sharp` 4/6/8, `soft` 8/12/20 (default), `round` 10/16/24. `--r-lg` cards
  and frames, `--r-md` panels, `--r-sm` controls, `--r-btn` buttons; software windows one radius
  (12 to 20) with a 1px line. A place: `--r-lg: 0; --r-md: 0; --r-sm: 2px; --r-btn: 2px` (square
  photographs and cards, 2px buttons).
- `.btn.btn--primary` and `.btn.btn--secondary`, 44px high (48 on a place, with
  `data-buttons="block"` and in the phone bar; the nav's button is the same `--btn-h`, never
  smaller), label 16px, 24px side padding, at most two in a `.btn-row`, full width on a phone.
  The look is dealt once on `<html data-buttons="solid|pill|tonal|arrow|block">`; the markup never
  changes. Exactly one filled button marks the main action in any view; every secondary takes one
  style; text links use `.link`. `.btn--xl` once, in the type close. Never a slanted, gradient,
  ghost or shadowed button, or a third style. Their hover and press: `motion.md`.
- The primary carries the drawn arrow `svg.m-arrow` as its last child where the look shows one; one
  arrow style a page, only on the actions that need one.

## Nav

- `header.nav`: `position: fixed`, full width, `--nav` tall, opaque ground, a 1px hairline under it
  from the first paint, `z-index: 10`, the same at every scroll depth: no blur, transparency,
  shrink, hide, shadow, colour flip or floating pill, and nothing else on the page is sticky. Its
  `.wrap` is the page's: the logo on the left line, the main button ending on the right one.
- The dealt type is a class (`sections.md`): `nav` (nav-mega, nav-cards), `nav nav--centre`,
  `nav nav--split`; `nav--tone` puts the bar on the inverse ground (tech).
- The logo: the client's SVG; else the dealt mark and the name at 20px in the display face
  (each kind deals from its own list in `sections.md`: `<span class="mark"
  data-mark="arc|ring|stack|dots|petal|leaf">`, `<span class="mark mark--initial">K</span>`, or the
  name alone for `wordmark`). The footer repeats it.
- Four to six plain one-word nouns (ST-09; a place: Menu, Rooms, Workshop, Visit, About) at
  15px/500 that never wrap, each with its own anchor; a second action as a plain word only when the client has one
  (Sign in for an app with accounts, Gift cards for a shop that sells them); the main action as the
  one button. One word opens a full-width flat panel on hover after 150ms (link columns and a
  picture card, or picture cards; a place: its photographs with the name and the price from); a click
  on the word goes to its section. On other the panel has no shadow, only its ground and a 1px line.
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
  booking button or the footer's directions), is on the screen: one screen never shows an action
  twice [action-repeat]. Hidden, it is off the screen and inert, so nothing in it takes the focus;
  it never hides while the focus is in it. The hero does not pad for it then. Without script the
  bar is simply always at the foot and every section, the hero too, pads for it, so it covers
  nothing. Write it as the starter does, a child of `body` after the footer, and add no script of your own.

## Footer

`footer.closing` is the page's last section (`layout-v4.md`): row 1 the dealt close, row 2 the
directory on one ground (link columns, the legal row). Types: `footer-columns`, `footer--dark` (the
name large, columns right; on a dark page a step darker), `footer--statement` (the lit ground; tech),
`footer--visit` (the address set large with the way there and the hours beside it). The legal row:
the brand, the current year, Privacy, Terms (Imprint only with the company's own details from the
brief) and the one credits line (`<details class="credits">`, `copy.md`). `.socials` stays empty
unless the brief gives the accounts.

## Cards, lists and forms

- `.card` as `cards.md` builds it; one height per row; never text in a box in a box. Open tiles
  (`.tile`) for rooms, models and people; `.rows` for menus, prices and specs (a 1px rule closing
  each row); FAQs open in full (`.faq`, no accordion).
- Opening hours: `<dl class="hours">` of `dt`/`dd` pairs with `data-days="tue-sun"` or `data-days="sat,sun"` on each `dt` (the row's label; the `dd` takes none) and
  `data-tz="Europe/Berlin"` on the `dl.hours` itself (the venue's zone; system.js reads it only there): system.js marks today's row (weight 500) and
  fills `[data-open-now]` ("Open now, until 16:00"; "Closed, opens Tuesday at 7:30"); never
  `.is-today` by hand. Without `data-tz` the rows read as plain text, and the panel must read right
  without the script. Hours the brief does not give carry `data-assumed` on the `dl` and get no
  open-now line: system.js never fills it from them [open-now].
- Forms: the recipe below.
- A `[bracketed placeholder]` or "(sample)" tag left in visible text is outlined in red by
  system.js, as is a visual that fails to draw: fix both.

## Forms

One recipe for every form (booking, enquiry, call request, newsletter); `starter.html` has it as
`booking-form`, system.js runs it. A booking system the brief names replaces the form with its link.

- **Where it sends:** `data-endpoint` holds the address of the client's form service when the
  brief gives one; system.js posts to it. Without one the form's `action` is a `mailto:` on
  `.example` (`hello@brand.example`, `copy.md`): a stand-in, listed in the report as the address
  the client must supply. Never `action="#"`, an empty action or a submit a page script swallows.
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

`motion.md`.
