# Icons

A page that names a tool shows that tool's real logo, in its own colours. A file card that says Google Docs
carries the Google Docs icon, a Word file the Word file icon. Never draw a look-alike, never put a letter in a
circle or a generic page glyph where a real icon exists. A fictional client's own mark is designed, never borrowed.

`scripts/icons.mjs` is the one resolver. Pages, `diagram.js` and every other part read the SVG files it writes;
nothing fetches, tints or judges an icon at runtime, and no page calls a CDN for an icon.

## Where they come from

| set | source (pinned) | holds | drawings licence |
|---|---|---|---|
| `logos` | `cdn.jsdelivr.net/gh/gilbarbara/logos` at commit `d6960edc1b73` (26 Oct 2026; the repository has no tags) | about 1,500 brands in full colour: the first choice | CC0 (LICENSE.txt at the commit) |
| `si` | `simple-icons` 16.30.0 | one-colour marks painted in the brand hex: the fallback, only where no colour mark exists | CC0 |
| `file` | `@iconify-json/vscode-icons` 1.2.30 | file types in colour (pdf, markdown, zip, Word, Excel, PowerPoint): a document type, never a brand | MIT |
| `ui` | `@iconify-json/lucide` 1.2.100 | interface glyphs, one line set | ISC |

`si` is used for Google Docs, Sheets, Slides, Forms, Chat and Tasks, Calendly, Evernote, QuickBooks, Revolut and the
console and game-store marks (PlayStation, Epic Games, Riot, Battle.net, itch.io, Roblox, EA, Ubisoft, Rockstar, Valve,
CurseForge, Modrinth, GOG). Xbox and Nintendo are in no permitted set: name the console in type, never a drawn
mark; a game's store row is Steam, PlayStation and Epic Games (`apps --tag gaming`). The Google editors are in their brand blue, green and yellow; the Microsoft Office
marks exist in no permitted source, so a Word, Excel or PowerPoint file card uses the file-type icon (`docx`, `xlsx`, `pptx`).

**theSVG (the `brands` set) was dropped.** Its package is MIT, which covers the compilation only; the licence it
records per mark is its own label, not a grant by the owner, and 37 of its Microsoft marks say "no express redistribution
licence supplied". A press-kit download is not a path this skill takes. `brands:` ids now fail with a message that says so.

Every mark is still its owner's trademark: nominative use only. Name tools the product really works with, never imply
endorsement. The footer carries "Product names and logos are trademarks of their owners" and the site carries
`icons-credits.json` (file, set, source with the commit, licence, trademark flag, the brand's site).

## Commands

`node <skill>/scripts/icons.mjs ...` from the site root:

- `find google docs`: what matches, in every set, with licence.
- `apps --tag gaming`: the curated list, 458 apps and 38 file types by short name (`google-docs`, `steam`, `pdf`);
  `list --tags` shows the tags (dev, ai, gaming, engine, hardware, chips, cloud, db, monitoring, payments, social ...).
  Interface glyphs: `list --set ui --tag gaming` (435: gamepad-2, swords, microchip, circuit-board ...).
- `fetch google-docs slack file:pdf2 ui:arrow-right --out assets/icons`: writes the files, prints the tags to paste.
- `scan index.html --out assets/icons`: fetches every icon a page names (diagram specs, `data-diagram` preset names, `data-icon`).
  Run it last, so a finished page has no missing icon.
- `check`: does every entry resolve; lists wordmarks, one-colour fallbacks, black and violet marks.
- `measure`: maintenance. Measures every colour mark's drawn box in headless Chrome (CPU flags, closed by its own PID) into
  `index.json` `boxes`; `fetch` crops to it. Run it when the curated list changes (`--profile <dir>` sets the Chrome profile).
- From code: `import { resolveIcon } from './icons.mjs'`.

Each written file carries the decision: `data-ic="violet"`, `"ink"` or `"paper"` on the root, so `diagram.js` and any page treat it
as `icons.mjs` printed it.

## Which one

- Brand or file type: the colour icon, from the curated list first (`logos`), a `si` mark only where the list says so.
- Interface glyphs (search, arrow, check, a feature point): `ui:` only, never a second line set. A glyph is an inline svg and takes the text colour.
- One-colour (`--mono`) is better in a row of customer logos, in footer social links, and where a brand has no colour version.
  A multi-tone mark keeps its detail in one colour: its paper-coloured parts are cut out of the silhouette instead of filling solid.
- Black marks (GitHub, Apple, X) carry `ic-ink`: icon.css turns them white on a dark ground. A wordmark-only logo (Stripe, NVIDIA, Go)
  carries `ic-wide`: print it with `--tile`, which gives it a wide tile.
- Light marks that vanish on a light tile are not in the list (Wise, Klarna were dropped for it).

### The violet rule (a judgement, stated)

"Never violet or lavender" is a rule for the page's own design. A third-party logo is its owner's mark and is not
recoloured, but a block of violet breaks the palette. By the share of coloured fills that are violet (`check` prints it; deep navy is not violet):

- Half or more (Stripe, Twitch, Google Forms, Terraform, Datadog, ClickUp, Loom, Kotlin, C#, .NET, Bootstrap, ESLint ...): flagged
  `[violet]`. A tool the product really works with keeps its own colours: `fetch` or `scan` it with `--colour` (without it the mark
  prints in the text colour, and a grey stand-in of a known logo is a fault). The violet ban covers the page's
  palette, never a third-party logo; `--mono` only for a row of customer logos.
- Under half (Figma 20%, Google Drive 14%): printed as drawn; the real logo is what makes the page look official. `--mono` prints it in one colour.

## How they sit

Link `assets/icons/icon.css` after system.css. `.ic-tile` is the soft tile behind a logo (a light tile on a dark
ground, so every colour reads); `.ic-row` a list row; `.ic-chip` a name with an icon; `.ic-stack` overlapping
tiles; `.ic-grid--mosaic` with `.ic-cell` an integration grid; `.ic-file` and `.ic-file--tile` a file card;
`.ic-point` a glyph with a short text. Sizes 16, 20, 24, 28, 32, 36, 40, 48, 56. Nothing animates. `assets/icons/demo.html`
shows the mosaic, the file cards, all 458 tools by kind, a dark page and the glyphs (every icon sits in `assets/icons/demo/`).

Shapes: `fetch` crops a mark to its measured drawing (2% margin) and gives it a shape class from the cropped proportions:
`ic-wide` (over 1.8:1), `ic-land` (over 1.25:1), `ic-tall` (under 0.8:1: Google Docs, Figma). A tile sizes a landscape mark to 70% of its
width and a portrait one to 68% of its height. The `file` set is not cropped on purpose.

File cards, integration grids and "reads from" lists use real icons at 20 to 40px, never a grey box. A logo keeps its own
proportions and colours.
