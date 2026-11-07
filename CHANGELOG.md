# Changelog

All notable changes to taste-skill live here. The repo follows SemVer-ish discipline: experimental pre-releases iterate freely; stable releases lock the API.

---

## 2.5.1 - 2026-11-07

What a 44-site test of `2.5.0` showed, fixed: builds now iterate until the checker is clean, every page moves a little, products without photographs are shown in photographs, palettes fit the trade, the copy gets a voice of its own, and nothing lies on anything else on a phone. The kit's own page models now pass the checker at 1440 and 390.

### What's new

- **The finish gate (`scripts/gate.mjs`, `references/gate.md`):** A build arms the gate at its first step (`gate.mjs --start`), and `start.mjs deal` arms it too. `gate.mjs index.html` runs the checker and `assets/layout/check.mjs` at `1440` and `390`, plus static checks for an edited kit file and for page code that hunts for a headless browser, and ends on exactly one line: `GATE: PASS`, `GATE: FAIL`, `GATE: OPEN` (three rounds used up), `GATE: SETUP` (no page yet, a framework's source shell or a page that is not local: arm the right one and run again), `GATE: ERROR` (the checks could not run) or `GATE: OFF`. It holds two checker WARNs as FAILs, a hero without its entrance (`hero-enter`) and a page with no dealt moment (`moment-none`), lints the copy of the page as the browser built it when the file is an app shell, and opens only local pages. A FAIL judged false is waived in `.taste-skill/waivers.json` with its reason (five at most), and the report starts with the `GATE:` line, the waivers and every open FAIL. In Claude Code the skill's frontmatter adds the gate as a Stop hook (it looks for the gate in the skill's folder and the usual install folders, does nothing in a folder with no build, except to say once how to arm a tasteskill page changed in the last day, and says on stderr when a build there goes unchecked); Codex and Antigravity take the same command from their own hook files. The gate never traps an agent: blocks are counted and capped; a crash or a framework shell blocks once, then allows, and a crashed run is reused, not rerun on every stop; a stop before the first run by hand is no round, so a question mid-build costs none; after a block that lists FAILs the next stop on the unchanged page is allowed once, and other stops on it block twice, then count as a round. When the user ends the build, `gate.mjs --done "<what they said>"` closes it. A PASS, or the last round's OPEN, closes it too, so a later deal starts a build of its own. Where a `.taste-skill` folder exists, every hook call, an allowed one too, is recorded in `gate.json`'s history (`"mode": "hook"`, the decision and why), and a hook that cannot find the gate leaves `.taste-skill/gate-hook-missing.txt` with the time and the variables it read. Every script that opens Chrome keeps its default profile in the OS temp folder or the project's `.taste-skill`: a relative `--profile` that leads out of the project is replaced by `.taste-skill/chrome-<script>`, with a warning (an absolute one is used as given).
- **Motion on every page (`assets/motion`, `references/motion.md`, `references/moments.md`):** Every hero enters once on load (`data-enter` on the hero and one line in the head): the h1 rises line by line, the lead and buttons follow, the picture settles from 1.05, about a second in all, and without JavaScript, in print or under reduced motion the hero shows as written. Every page deals one moment, two on a long page: a cafe, shop, studio or service gets the photo- and type-led ones (`photo-chapters`, new: one photograph per chapter uncovered over the last; `picture-develops` in a new film look; `word-highlight`; `pinned-chapters` on product and service), still with zero WebGL. The short page (under 8 photographs) carries `picture-develops` on its section's photograph, or, with no photograph, `word-highlight` in a one-screen statement section. Shader effects and scenes stay tech only. `lines-rise`, `window-parallax` and `word-rotate` are retired (each repeated the hero's entrance or the word hero, or was a parallax), so no kind needs `--exclude`. The kit's own motion is calmer: one ease-out curve, no overshoot, hover moves only on a fine pointer, hover out at 120ms against 150ms in, the focus ring shown at once, the tab pill and switch moved by transform only. A link inside a moment's statement keeps its accessible name.
- **Photographs over renders (`scripts/photos.mjs search`, `references/photos.md`):** A physical product, hardware or a game without the client's pictures is shown in licensed stand-in photographs of the same kind of thing, each listed in the report. `photos.mjs search` asks Wikimedia Commons for large CC0, CC BY, CC BY-SA or public-domain JPEGs (no NC or ND licences, no paintings, maps, logos or renders), and `fetch` and `credits` take its results like library frames. A product render (`assets/objects/product-render`) is made only when the brief asks for 3D or a render; the product hero has no default hotspots. A game without art leads with its name set large over a stand-in of its setting (`deal.mjs --has setting`). Set `TASTE_SKILL_RECENT=<file>` to share recent frames and palettes across folders: frames another build used lately go behind fresh ones, so two cafes no longer start from the same photographs. Unset, nothing is written outside the project. A live search's file is fetched only from Commons' own file host.
- **Palettes by trade (`start.mjs deal --trade`):** Every palette names the trades it was made for, and `--trade cafe`, `--trade "yoga studio"` or `--trade "developer tool"` deals those first, away from the folder's last twelve built palettes (`start.mjs css` records them) and, with `TASTE_SKILL_RECENT`, the trade's last six across folders. Eight new light palettes give every place trade seven to thirteen to deal from, and a place only gets grounds that fit a place. The builder takes the first palette and writes one sentence on why it fits the trade; the place look no longer hard-codes its colours. The trade is read from the brief more carefully (an estate agent is an agency, a kitchen fitter a workshop, a delivery service no deli), and a deal in a folder under an open build joins that build instead of arming a second gate.
- **Copy layer (`references/copy-voice.md`, `copy-registers.md`, `copy-moves.md`, `copy-tells.md`, `scripts/copy-lint.mjs`):** Leon's copy-taste research and skill, rewritten for tasteskill: a fact sheet from the brief, a voice card on the plan, the page's shape from the reader's questions, one register, the moves for each part of the page and a budget for each device. `copy.md` routes to them and now allows one verb-led heading form and the page's one pun as its brand line. `copy-lint.mjs` counts the tells of model copy (old slop words, stock lines, two-fragment headings, contrast frames, virtue words, invented stat strips, default-cast names, footer sign-offs) in about 30 ms a page with no browser; a device used past twice its budget FAILs (two-fragment and number-pair headings, contrast frames, negation runs, virtue words; riders, puffery, reveals and repeated promises only WARN). It leaves UI mocks, menus, timetables and one wording repeated alone; literal trade and virtue words (a quiet room, leverage up to 1:30, a 2,000 W motor) and abbreviations (St. Ives) pass; a part with a missing end tag no longer hides the rest of the page; a `.md` draft lints like the page. The gate runs it and its FAILs block: one finding per slop word with its sentence, a tic waived only by its whole finding, and a word from the client's own copy waived hit by hit with the brief as the reason. A listed word inside the client's own name (Elevate Pilates), as the logo, the title before its ":" or `og:site_name` writes it, is not counted and WARNs once (`copy-brand-word`).
- **Accessibility, forms and metadata (`basics` in the checker, `references/system.md`):** The checker now reads accessible names, alt text, visible field labels, heading order, a Tab walk with a focus ring you can see at once and never under the header, the skip link, the menu button's state, `lang`, the title, description and share tags, one action at most twice a screen, map links that only send a street to directions, assumed hours that never drive an open-now line, and forms that only say thank you after a real send. The starter gains the head block, a skip link, `lang`, a `booking-form` template with each error under its own field, and `system.js` checks forms on submit.
- **Phones (`system.css`, `collide`, `tap-size`):** On a phone a section is at least its screens and grows with its content; it used to keep a fixed height and lay its last rows over the next section, in eight of the kit's own hero demos too. The hero grows on a short phone, and on one under 700px tall its photograph and facts give way so its button stays on the first screen. Links, the nav name, footer links, credits and small buttons are 44px targets; without script a phone's bar keeps the name and the main button; a page's own phone-only hiding of a section wins over the kit's phone rule. The phone action bar waits until the hero's button has scrolled away and steps aside while the screen shows one of its actions (without script it simply stays, covering nothing); the place hero's photograph grows into what its words leave of the first screen (up to 4:5, with the 4:5 phone crop `photos.mjs` now prints and its `data-phone-fill`), and the visit block's photograph into the rest of its screen, so neither ends in an empty band. A two-screen section's four open tiles stack into its two phone screens (180px panels, 32px between every tile, the second group clear of the header), and the centred hero keeps a three-line headline and its window's whole answer on the first screen. The checker gains `collide` (words over words, over another section's picture, button or card, a picture over a button, a fixed bar over content at the top or the end of the page), `tap-size` (a target under 32px tall or 24px wide FAILs when another target is under 8px away, else WARNs; under 44px WARNs) and a walk at 320 for collide, tap-size, the first screen's fold (WARN) and anything past the screen (`off-viewport [320]`); the gate checks 390 and 320 on every run, `--quick` too.
- **Checker fixes and `empty-area` (`scripts/consistency.mjs`, `tests/kit-clean.mjs`):** Six false positives that failed the kit's own heroes are fixed at their cause (a centred or boxed hero measured against its own frame, the product render as one box, a dealt moment's display type, drawn mocks in the stagger check), and no fix text reads as an invitation to invent a fact. New `empty-area` WARNs on a section over 35% empty inside its container and FAILs over 50%. Motion inside a dealt moment's section is accepted on every kind, the hero entrance is no reveal, and `hidden-content` also loads the page with scripts off. A hero or section with `overflow: clip` is not read as spilling, a panel with its own fill counts to its edges, the starter hero's facts at the foot of its column are no hole, and a mounted statement moment's own section is left out of `section-gaps` (and of the layout check's `sparse`). A live `photo-chapters` section may run to four whole screens, counted in viewports under any header, and any section holding `word-highlight` counts as a statement. A hero whose big scene is its entrance (`data-enter="off"`) passes `hero-enter`. `check.mjs`'s long-headline stress test adds a long compound word only on pages whose language builds them, so `hero-lines` can be fixed or waived.
- **The kit's page models pass the checker at 1440 and 390 (`tests/kit-clean.mjs`):** All 11 hero demos, the starter and two new pages that mount moments in a real page (`assets/moments/_demo/in-page.html` for a place, `in-page-service.html` for a service) report no FAIL at those widths; before, 30 of 31 kit pages had one. The hero demos link their logos to `#top`, set later splits text left and picture right, name what they sell in their titles and keep their phone panels whole. A product page is dealt only the product, photo and film heroes (`heroes.json`), since a split, word, statement or triptych hero cannot show the product at 80% of the content width; the split demo is now a service page. The starter's two-screen features section has all four tiles, the close's big button stays within half the container, and `pinned-chapters` sits on the page's 6/6 split. `kit-clean.mjs` checks the hero demos, the starter and the in-page pages with the checker and `check.mjs` at the gate's widths (the gate also holds `hero-enter` and `moment-none` and lints the copy); `--demos` adds the standalone moment demos, which show a moment alone and are not page models.
- **The stack:** An empty folder builds a static page from `assets/starter.html`; an existing project builds in its own stack with the kit served from its public folder; a brief that asks for Next.js builds a static export, checked on its built page with `--root`. The description no longer promises any stack.

### Thanks

To the community contributors whose pull requests went into `2.5.x`: @bougieL (each checked page gets its own report folder, [#181](https://github.com/Leonxlnx/taste-skill/pull/181)), @hummbl-dev (`--root` for the scripts that serve a page file, [#182](https://github.com/Leonxlnx/taste-skill/pull/182)), @ALANDVO (`font-load` warns for each web font that never loads, [#186](https://github.com/Leonxlnx/taste-skill/pull/186)) and @ICR-1 (the eyebrow fix in [#185](https://github.com/Leonxlnx/taste-skill/pull/185), written for the inspector that 2.5 replaced).

## 2.5.0 - 2026-11-05

A complete rebuild of `design-taste-frontend` (`tasteskill 2.5.0`) around professional company websites at the `figma.com` and `x.ai` bar, replacing the `2.1.x` direction-sheet and app-screen pipeline (`draw.mjs`, `assets.mjs`, `lint.mjs`, `inspect.mjs`, `scenes.mjs`).

### What's new compared with 2.1.x

- **One page system (`starter.html`, `system.css`, `system.js`, `assets/layout/`):** Every build starts from a shared HTML/CSS foundation instead of open-ended layout generation. The hero fills the first screen alone, every body section and `footer.closing` is planned to one or two full screens at `1440x900` with no neighbour peeking into a section tile, and left and right content edges match across the page. `assets/layout/deal.mjs` deals eleven tested hero layouts (`split`, `centred`, `product`, `photo`, `place`, `collage`, `editorial`, `word`, `film`, `statement`, `triptych`), verified by `assets/layout/check.mjs` including max-headline stress tests.
- **Strict business-kind routing (effects only on tech and gaming pages):** Every page declares its kind up front (`software`, `gaming`, `tech` for technical hardware, `product`, `service` or `place`). Shader grounds (`scripts/effects.mjs`, `assets/effects/`), creative scroll and pointer moments (`scripts/moments.mjs`, `assets/moments/`), scroll-held big scenes (`assets/scenes/`) and WebGL object prints (`assets/objects/`) are dealt only on `software`, `tech` and `gaming` pages within a shared cap of 4 live WebGL contexts, and every effect has a static phone and reduced-motion state. Cafes, hotels, shops, studios, services and non-technical products get zero WebGL or scroll effects and lead with photographs, typography and flat colour.
- **Real product UI fragments, components and diagrams:** `assets/ui/` ships 19 HTML product UI fragments (`chat`, `diff-review`, `pipeline-board`, `stat`, `notify`, `terminal-run`, `voice` and others) staged inside lit feature-card panels (`assets/ui/cards.css`, `assets/ui/ui.js`, `references/cards.md`), joined by interactive feature components in `assets/components/` and preset-driven node-and-line diagrams in `assets/diagrams/`.
- **Curated photographs, no captions, real brand icons:** `scripts/photos.mjs` deals vetted Unsplash and Wikimedia Commons photographs (`assets/photos/`, a set of them bundled as offline WebP) by trade as detail slots (capped at 1 in 3 page images unless `--draft-lead` is passed for a client without photographs), enforces image weight budgets, and writes a single expandable footer credit line (`photos.mjs credits`). Captions under images, renders and UI visuals are banned across all page kinds. `scripts/icons.mjs` resolves real full-colour brand marks (Gil Barbara's logos, Simple Icons where no colour mark exists), file-type icons and Lucide interface icons into local SVGs (`assets/icons/`).
- **Palettes, typography, CSS grounds and calm motion:** `scripts/start.mjs` deals palettes and Google Fonts pairings by page kind (`library/palettes.json`, `library/type.json`) and emits the exact `<head>` links and `:root` tokens. `assets/backgrounds/` provides 16 contrast-verified CSS grounds for tech sections, and `assets/motion/` supplies restrained hover, press, tab, focus, count and single-loop card interactions.
- **Real-browser consistency, performance and screenshot checks over HTTP:** `scripts/consistency.mjs` replaces `inspect.mjs` and `lint.mjs` with over 100 browser checks across `1440`, `1024`, `768` and `390` (rendered visual emptiness, GLSL ES reserved-word linting, forced shader-failure fallbacks, WCAG text and button contrast, grid and split alignment, section rhythm, placeholder and invented-address detection, slow-mobile image loading and reduced-motion compliance), paired with `scripts/perf.mjs` and `scripts/shoot.mjs`.
- **A product is always shown, and shown big (`assets/objects/product-render`):** When a physical product has no photographs, the page renders it from a JSON spec of its parts in real studio materials (a city bike, a desk lamp, a robot arm) instead of hiding it behind an abstract shader or an order form. The hero product stands on the page ground with no box around it and fills most of the content width (the checker fails a product hero under 60% of it), every section shows a different view (`side`, `three-quarter`, `front`, close-ups of a named part, loaded or in-use scenes with props such as a child seat or crates), and an order card's colour buttons swap the picture with no page script (`data-product-swatch`, or the `product:set` event). `make-posters.mjs` turns a spec into stills, which pages show by default once they are made; a live turn then runs only when a page asks for it (`data-product-mode="live"`). The checker fails a product page whose pictures never show the product or repeat a picture, and one that shows a view twice in one colour or in neighbouring sections (another colour further down warns).
- **One object never carries the page:** The product or hero object is shown whole in the hero and two more sections at most; the other sections are carried by a different kind of picture (for a game its world and crew, for hardware the product in use, its parts or an exploded view, close-ups, a still diagram, a type moment). The checker warns when one object, shown whole, is the main picture of more than three sections (`same-object`, on product, tech and gaming pages).
- **The client's own assets get slots (`client-slots` in `references/sections-library.md`):** When a brief says the client has a trailer, key art, screenshots, CAD renders or a motion video, the page holds a designed slot for each that already reads finished (a video frame with a poster, a strip of captures, a CAD frame), named in a comment for the client's file.
- **Software shows its product in one app window (`app-frame` in `references/sections-library.md`):** Every software page has one app window across the full content width, a list pane beside the open item, composed from the `assets/ui` fragments (pull requests beside a diff, an inbox beside a thread, a pipeline board). It stacks at tablet width and shows the open item alone on a phone.
- **Hover you can see:** Buttons step 1px on hover and press on click, linked cards lift 2px, photographs zoom 1.02-1.03 inside their frame and underlines draw; under reduced motion only the colours change.
- **Scroll moments stay inside their section:** `iris-opens` and `line-carries-colour` open inside an inset panel with an even gutter and reveal each block whole, so no word is cut mid-move.
- **Tablet screens are planned and checked:** Sections are planned at `768` to `820` as well as `1440` and `390`, and the checker's rhythm pass runs at `768` by default.
- **Runs on any machine:** Every script that opens Chrome takes `--profile` for its Chrome profile, then the `TASTE_SKILL_TMP` folder, then the system temp folder.
- **Install on Windows:** `install.sh` makes a real link (or a directory junction when symlinks are not allowed) instead of silently copying the folder in Git Bash, and an older copied folder or a failed link ends the run with an error instead of a quiet skip.
- **Tested on a fresh install:** A clean install built a small bakery page from `SKILL.md` alone and ran every script; what it tripped on is fixed. The split nav, the hero photograph `photos.mjs fetch` prints and the offer's menu groups beside a photograph pass the checks; a place with under 8 photographs is the short page whatever its trade, with one layout for its menu, its visit block and the photograph beside the menu that passes at every width; a brief without a street prints the district only; `assets/layout/check.mjs` serves a page file itself like the other checkers; `photos.mjs` prints commands that run from any folder; the scene index is never written into the installed skill; and every script runs the same through a symlinked install (`install.sh`).
- **Honest reports:** A check whose measurement timed out reads `partly measured` (WARN) instead of PASS, a product without stills is told to run `make-posters.mjs`, and a product's own render is never counted as a page effect.
- **Plain words and honest pictures:** `references/copy.md` and the checker cap the words on a screen and the footer to one line, and every picture must render (a visual that comes up empty fails at `1440`, `1024`, `768` and `390`).

## 2.1.5 - 2026-10-25

Fixes from the community. Thanks to everyone who reported and sent them.

- **Safe text in charts and split headings** ([#160](https://github.com/Leonxlnx/taste-skill/issues/160), [#169](https://github.com/Leonxlnx/taste-skill/pull/169), thanks @jcastilla89 and @Pablolakotek): `charts.js` and the `Stage.split` fallback escape the text they insert, so a chart label or heading that comes from user data can no longer inject markup.
- **No lost screenshots when two widths share a class** ([#162](https://github.com/Leonxlnx/taste-skill/issues/162), [#165](https://github.com/Leonxlnx/taste-skill/pull/165), thanks @nosawavey-spec and @ketpatil77): `--widths 1280,1024,768,390` keeps both tablet renders (`tablet-1024-*`, `tablet-768-*`).
- **Keyboard and accessible names** ([#170](https://github.com/Leonxlnx/taste-skill/pull/170), thanks @MrBinnacle): every control works from the keyboard and has an accessible name; a control explains itself by its form, not by a sentence beside it.
- **The italic faces load** ([#161](https://github.com/Leonxlnx/taste-skill/issues/161), with the fix from [#166](https://github.com/Leonxlnx/taste-skill/pull/166), thanks @nosawavey-spec and @ketpatil77): Boska, Erode and Sentient request their italic weight, so the browser no longer fakes it.
- **`edge-text` no longer fails ellipsised lines** ([#156](https://github.com/Leonxlnx/taste-skill/issues/156), thanks @shoctroper): text is measured where the reader sees it, clipped by `overflow`.
- **Inspect the production build** ([#171](https://github.com/Leonxlnx/taste-skill/issues/171), thanks @lilozzy): the Gate step says to run the last check on the built page, and the inspector warns (`dev-server`) when it is looking at a Vite, webpack or Next dev server.
- **The redraw rule names its third reason** ([#163](https://github.com/Leonxlnx/taste-skill/issues/163), thanks @Tsury): a section that cannot hold the real content.
- CI now also checks that every text file is clean UTF-8 (a double-encoded save is caught), runs the inspector file-name tests, and parses the scene scripts.

## 2.1.4 - 2026-10-20

- **Fix: one inspector run could delete the browser profile of another run that was still going** ([#157](https://github.com/Leonxlnx/taste-skill/issues/157), fixed in [#158](https://github.com/Leonxlnx/taste-skill/pull/158) by @t4sh). On macOS and Linux Chrome keeps no `lockfile`, so the sweep added in 2.1.0 judged a profile unused by its age alone, and a second run started during a long one could pull that run's profile away. #158 removed the sweep and added a regression test.
- **Leftover profiles are cleaned up again, safely.** Every profile now carries `taste-skill-owner.json` with the machine and the process IDs of the run and its Chrome. A later run removes a profile left by a killed run only when that file names this machine and neither process is alive; a profile without the file is never touched. Profiles left by earlier versions are not removed automatically: delete the `ad-chrome-*` folders in your temp folder (or in `TASTE_SKILL_TMP`) by hand.

## 2.1.3 - 2026-10-19

One repo, one skill. Nothing in `design-taste-frontend` changed.

- **The classic skills moved** to their own repo, [Leonxlnx/taste-skill-classics](https://github.com/Leonxlnx/taste-skill-classics): `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `gpt-taste`, `stitch-design-taste`, `design-taste-frontend-v1` and `design-taste-frontend-v2-experimental`. Same install names, same files. The `taste-skill-classics` Claude Code plugin moved with them (`/plugin marketplace add Leonxlnx/taste-skill-classics`).
- **The pointer folders are gone:** `brandkit`, `image-to-code`, `imagegen-frontend-web` and `imagegen-frontend-mobile` (in [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) since 2.1.1) and `redesign-existing-projects` (part of `design-taste-frontend` since 2.1.1). The README lists where every old install name lives now.
- **Removed:** `research/laziness/` (it belonged to `full-output-enforcement`, removed in 2.1.1), the outdated `skills/llms.txt`, `skill.sh` and its test, and unused images.
- **README:** a wordmark instead of the banner, a TasteCode banner that stands out in dark mode, fewer badges, the community sponsors always shown.
- The Codex plugin loads only `design-taste-frontend` now.

## 2.1.2 - 2026-10-19

- **Fix: `design-taste-frontend` did not load in Claude Code** ([#151](https://github.com/Leonxlnx/taste-skill/issues/151)). The description added in 2.1.0 contained an unquoted `: `, so its YAML frontmatter failed to parse and the skill was silently dropped ("Unknown skill"). It is now a folded block scalar.
- **So it cannot happen again:** `tests/frontmatter.mjs` parses every `SKILL.md` frontmatter (and every `agents/openai.yaml`) with a strict YAML parser, checks names, description length and the plugin manifests, and a GitHub Actions workflow (`check-skills.yml`) runs it, the registry test and a syntax check of the scripts on every push and pull request.

## 2.1.1 - 2026-10-19

One skill to reach for. Installing the repo no longer means an agent might pick an older skill for the job.

- **The classic skills are opt-in.** soft, minimalist, brutalist, gpt-taste, Stitch, v1 and v2-experimental run only when called by name: `disable-model-invocation: true` for Claude Code, `allow_implicit_invocation: false` (`agents/openai.yaml`) for Codex, and descriptions that say so for every other agent.
- **Redesigns are part of taste-skill.** `SKILL.md` has a full route for a redesign, restyle or review of an existing page or app screen: record the before in a real browser, keep the stack, the content and what works, change type, colour, the frame, states and stock components in that order, prove it with before and after. `redesign-existing-projects` is retired and points there.
- **The image-generation skills moved** to their own repo, [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills): `imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit`, `image-to-code`. Same install names; the folders here point there.
- **`full-output-enforcement` is removed.**
- **Two Claude Code plugins:** `taste-skill` carries only the default skill; `taste-skill-classics` carries the classic skills for whoever wants them.

## 2.1.0 - 2026-10-19

### The scroll-scene engine

The groundwork for big scroll scenes, the moments award sites are remembered for (a camera flying through a field of pictures, a picture that grows from a window to the whole screen). The library of tested scenes, taken apart from 43 motion-led Sites of the Day and rebuilt from scratch, follows in 2.2; this release ships what they run on and the checks that judge them.

- **`assets/scenes/stage.js` and `stage.css`**: a sticky stage scrubbed by native scroll with GSAP ScrollTrigger (pinned versions), optional Lenis smoothing that stays off for touch and reduced motion, and a finished composition for reduced motion, no script and a failed CDN. `references/scenes.md` says how to build a scene on it.
- **`scripts/scenes.mjs`** photographs every scene on a page at 0-100% of its hold on desktop and phone, and the reduced-motion page. **`inspect.mjs --film`** films the whole scroll a third of a screen at a time, and the inspector fails a scene that never started or rests on desktop.
- `draw.mjs` can deal scenes from `library/scenes.json` once it exists (`--redraw scenes`, `--list scenes`).
- `motion.md`: smoothing allowed through the stage; inside a scene the scene's numbers apply; outside scenes the quiet limits stay. Still no preloader, gate, custom cursor or wheel capture.

### Product pages that show their app

A software product's page builds every interface fragment it shows (the hero's live screen, a feature crop, a chart) as a real piece of the app: its style dealt once with `draw.mjs --app --keep palette,type --out .taste-skill/app`, built with `app.css` and `charts.js`, real data that adds up.

### Fixes

- The inspector's throwaway Chrome profiles are removed reliably (Chrome is stopped before its profile is deleted, the profile cache is capped, profiles left by killed runs are swept); a long test session had left tens of GB in the temp folder. `TASTE_SKILL_TMP` moves them off the system drive.
- `motion.md` and `research.md`: a claim that smooth-scroll pages showed empty frames mid-scroll was a capture artefact and is gone.

### App screens: dashboards, admin, settings, inboxes

The default skill now builds the screens people work in, not only the pages they read. `SKILL.md` asks first whether the job is a page or an app screen; an app screen takes its own route.

- **`references/app-screens.md`**, a new chapter: the run for an app screen (inventory the data and the jobs, name the screen's one question and its one finding, write the data with assertions, deal a style, build the shell, the data and every state, check, look), the shell, the canvas and title, KPIs, charts, tables and lists, forms and settings, type and colour for light and dark, density, empty, zero, loading and error states, the phone and the tablet, the house rules for app screens and the tells of generated dashboards with what replaces each.
- Distilled from a study of 23 real product screens chosen by the owner (17 products, 17 light and 6 dark), measured from their pixels. The screenshots stay private; the skill carries only the measurements and the rules.
- **`draw.mjs --app`** deals an app style from `library/app.json`: seven styles (achromatic ledger, framed sheet, accent ladder, editorial greeting, pastel consumer, true-black flat, data terminal), each with tokens, type, a colour budget and the one move that makes it recognisable, plus five shells and 21 screen patterns for 13 kinds of product.
- **`inspect.mjs --app`** and **`lint.mjs --app`** (switched on by an app sheet) judge app screens by their own rules: quiet borders, small labels, repeated panels and tables are allowed; heavy shadows, glass, icons in tinted squares, rainbow charts, placeholder data, text under 11px, a sidebar left on the phone, ragged rows, a thin first screen, landing-page titles and figures, a dead strip beside the canvas and colour sprawl are not.
- **`assets/app.css`** (a neutral shell, panels, divided KPI strip, tables, pills, controls, tabs, empty states and the phone fold) and **`assets/charts.js`** (line, bars, ring, bar list, plan against spent, share against target, with annotations, reference lines, forecasts and capped ranges), both set to the study's defaults.
- Tested in four blind rounds of eight, six, five and three builds judged from screenshots against the reference screens; the warnings at the top of the chapter come from what the judges marked down. The last round's complaint, "a well-applied kit, not a product with its own face", led to a required face step (each style lists ways to take one from the brief) and signature patterns for kinds of product (a power-flow summary, a leave timeline, a cover matrix, a sell-out strip).

### The frame of a page

Generated pages most often fail before any detail: no clear title, margins that do not match, a section pushed to one side with half the screen empty, long blank stretches, sections with no heading, text against the screen edge.

- `SKILL.md` step 6 gains "The frame", the house rules three new rows, and a finish line before the report.
- `inspect.mjs` measures each of them: `no-title`, `name-only-title`, `off-centre` (FAIL, and a WARN from 16px of drift), `lopsided`, `empty-middle`, `blank-gap`, `untitled-section`, `edge-text`, `ragged-edges`, `small-title`, `many-h1`. The thresholds come from the study below: strong pages hold their margins within a few pixels, about one text section in a hundred leaves half the width empty, 82% of text sections open with a heading.
- `critique.md`: a five-second pass, a frame pass and new caps. `layout.md`: empty space rewritten and a new section on the frame.

### A study of the latest 100 Awwwards Sites of the Day

Captured on 18 October 2026 at 1440 and 390, with what moved and the CSS that loaded measured in the page, and read by a panel of one model reader per site (91 usable). Learning only: nothing a site owns is reproduced.

- **Pictures and footage:** `imagery.md` §12, where pictures go (picture share per screen, nineteen placements ranked with their geometry and phone versions, footage, crops, text over pictures) and stricter video rules (a poster on every clip, one moving picture per screen, contrast checked across the whole loop).
- **Motion:** `motion.md` gains what strong pages do with motion (the curves and durations that actually ran, staggers, scroll triggers, the cost of preloaders), new tokens (`--ease-expo`, `--ease-exit`, `--t-open`, staggers), scroll behaviours ranked, ten new recipes (lines that rise, an opening window, a held picture with passing captions, a sideways gallery, a receding hero, an index anchored to its row, a 1.2-second load sequence, view transitions between pages, an ink fill, rolling figures), the gimmicks to avoid and rules. Seven new signature moves in `library/motions.json`.
- **Library:** 10 hero and 13 section compositions, 21 new studied sites and media and motion notes on 70 more (`draw.mjs --site <id>`).
- **New checks:** `late-title` (the title is not readable 1.2s after load), `reduced-hidden` (content that stays hidden under reduced motion), `no-poster`.

---

## 2.0.0 - 2026-10-13

### Repo

- `taste-skill` (install name `design-taste-frontend`) is now **v2**, a new skill (see below). The install name did not change.
- The previous default, v2 (experimental), is preserved as `taste-skill-v2-experimental` (install name `design-taste-frontend-v2-experimental`).
- v1 is unchanged at `taste-skill-v1` (install name `design-taste-frontend-v1`).
- `CHANGELOG.md` (this file).
- Codex can install the collection as a plugin (`.codex-plugin/`, `.agents/plugins/`).
- Plugin manifests are at 2.0.0.
- `skill.sh` accepts install names as well as folder names.
- Removed: unused sponsor and README images, the one-off asset scripts in `scripts/`, and the old Copilot instructions, which contradicted v2.

---

## v2 - the new default for `taste-skill`

v2 is not an edit of the earlier files. It is a new skill built from a study of 247 curated sites (One Page Love and Awwwards Sites of the Day), and it is a folder, not a single `SKILL.md`: instructions, nine reference files, a library and four zero-dependency scripts.

### How it works

1. **Inventory.** Before any design, the agent lists what only this client has: the name and what it means, the street, the numbers, the one constraint.
2. **Draw.** `scripts/draw.mjs` deals three of 20 researched directions; the agent picks the one that can carry something from the inventory, and the script deals the rest from the library (48 hero compositions, 172 section compositions, 44 type systems of free fonts, 56 palettes, 420 photographs, 11 motions, 181 studied reference sites). Under every dealt blueprint it prints where that blueprint disagrees with the house rules.
3. **Idea and one live thing.** One sentence tying the client's own material to the direction's device, checked against the nearest competitor, plus one thing the visitor can do on the page.
4. **Build** with full content; when there are no photographs of its own, real pictures of the subject's world come from open collections (`scripts/assets.mjs`), and only what no honest picture exists of is drawn in code.
5. **Gate.** `scripts/lint.mjs` scans the source; `scripts/inspect.mjs` opens the page in a real browser at 1440 / 768 / 390, measures it and fails it on: eyebrow labels, monospace outside code, 01/02/03 numbering, hairlines and outlined boxes, gradients, resting shadows, cream-and-terracotta or violet palettes, headlines over two lines, text under 13px, no focal point on the first screen, near-empty screens, text covered or cut off, sideways overflow.
6. **Look.** The agent critiques its own screenshots with an Awwwards-weighted rubric and fixes the top three problems, up to three rounds.

### Real pictures from open collections

Agents with no photographs used to draw everything in SVG. `scripts/assets.mjs` searches Openverse, Wikimedia Commons, the Art Institute of Chicago and The Metropolitan Museum of Art without API keys and prints, for each find, a direct image URL, the source page, its size, creator, licence and a one-line credit. By default it keeps only licences that allow commercial use (CC0, public domain, CC BY, CC BY-SA) and checks that every image it prints loads; `--source`, `--license`, `--orientation` and `--min-width` narrow the search. `--get <ref>` downloads a picture into the project's `assets/` and records its credit in `assets/credits.json`; `--credits` prints the footer credit line and the list for the report.

The imagery order is now: the project's own; generated; **real pictures of the subject's world found in open collections** (its street in old postcards, old maps, its materials, engravings of its trade, museum objects of its kind); drawn in code, for what no honest picture exists of; the dealt atmosphere photographs; type and colour alone. A found picture is never presented as the client's own product, room, dish, person or team, and every one is credited on the page and listed in the report. The direction sheet suggests first queries built from the brief (`"ghent postcard"`, `"ghent old map"`), and `references/imagery.md` §3 covers what to search for, what makes a good find, creative uses and the licences.

### Pictures, footage and motion are required

Testing showed agents skip pictures and motion when nothing forces them: ten pages built with the first v2 carried no real pictures at all and almost no motion. The inspector now enforces both:

- `few-pictures` (fail): fewer than four real pictures on the page (photographs, archival images, footage, raster artwork; for software, cropped interface fragments). SVG drawings do not count. `no-real-pictures` and `no-footage` warn when a page has fewer than two real photographs or no video.
- `still-page` (fail under 8, warn under 16): counts the distinct elements that actually move while the page loads and is scrolled, from CSS animations, transitions, Web Animations and script-driven transforms.
- `assets.mjs --video` finds open-licence footage (Wikimedia Commons, the Internet Archive, NASA) for a muted looping clip.

The motion guidance changed with it: one loud signature move, plus a choreographed entrance for the parts of every section, feedback on every control, and one moving picture. The old "one moment and nothing else" budget is gone; identical fade-ups on every block are still banned.

### Requirements

Node 22+ and an installed Chrome, Edge or Chromium for the inspector (nothing is installed; it drives the browser over the DevTools protocol). `draw.mjs`, `lint.mjs` and `assets.mjs` run on Node 18+; `assets.mjs` needs network access and no API keys. Working files go to `.taste-skill/` in the project; the draw history lives in `~/.taste-skill/history.json`.

### How it was tested

Five rounds of blind comparisons on six briefs: a fresh agent built each page with no skill, with v2, and on three briefs with another design skill; a separate agent judged anonymous screenshots on the Awwwards weighting. Final round, three briefs: v2 7.7, no skill 7.8, other skill 7.2, with v2 ranked first on two of three. Under the inspector the v2 pages measured 0 failures each and the no-skill pages 8 to 13. Limits: one juror per brief per round (about half a point of noise), model jurors, and the final round's briefs had been used in the round before. The full record is in `skills/taste-skill/references/research.md` §11.

### Cost

A full run with the look-and-fix loop takes an agent roughly 30 to 45 minutes and a few hundred thousand tokens, most of it finding or drawing pictures when a project has no photographs.

---

## v2 (experimental) - the previous default, now `taste-skill-v2-experimental`

v2 (experimental) is a substantial rewrite of the original taste-skill. It keeps the dial-driven philosophy (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) and adds structure, hard rules, and concrete implementation patterns the agent can actually follow.

**This was a pre-release.** It was the default install until v2 replaced it, and it is kept as `taste-skill-v2-experimental` for projects that depend on it. It is no longer iterated.

### What's new in v2 (experimental)

**New sections**

- **§0 Brief Inference** - before any code, the agent reads the room (page kind, vibe words, references, audience, constraints) and declares a one-line design read. Anti-default discipline.
- **§2 Brief → Design System Map** - when a brief reads as Material / Fluent / Carbon / Polaris / Atlassian / Primer / GOV.UK / USWDS / Bootstrap / Radix / shadcn / Tailwind, reach for the **official** package. When the brief is an aesthetic (glassmorphism, bento, brutalism, editorial, dark tech, aurora, kinetic typography), use web standards and label the implementation honestly. Apple Liquid Glass is documented as an approximation, not an official package.
- **§8 Dark Mode Protocol** - dual-mode by default, token strategy declared per project, contrast and hierarchy parity enforced.
- **§11 Redesign Protocol** - mode detection (Greenfield / Preserve / Overhaul), audit before touching, modernisation levers in priority order, what never changes silently (URL structure, nav labels, form field names, brand wordmark, legal copy).
- **§12 The Block Library (Contract)** - schema for iteratively adding real, source-backed block implementations (hero, feature, social-proof, pricing, cta, footer, portfolio, transition, navigation).
- **§13 Out of Scope** - explicit list of what taste-skill is NOT for (dashboards, data tables, multi-step forms, code editors, native mobile, realtime collab UIs).
- **§14 Final Pre-Flight Check** - hard checklist. Every box must honestly pass before shipping.

**Hardened bans (Section 9, "AI Tells")**

- **§9.G Em-Dash Ban (complete)** - zero em-dashes (`—`) anywhere on the page. Headlines, eyebrows, pills, body copy, quotes, attribution, captions, button text, alt text. Use a hyphen (`-`) or restructure the sentence. This was the single most-violated stylistic Tell in pre-v2 testing.
- Section numbering eyebrows (`00 / INDEX`, `001 · Capabilities`, `06 · how it works`) banned outright.
- Version labels in hero (`V0.6`, `INVITE-ONLY PREVIEW`, `BETA`) banned unless the brief is explicitly a product launch.
- Photo-credit captions as decoration (`Field study no. 12 · Ines Caetano`) banned unless real attribution.
- Decoration text strips at hero bottom (`BRAND. MOTION. SPATIAL.`) banned.
- Pills / labels overlaid on images banned.
- Version footers (`v1.4.2`, `Build 0048`) banned on marketing pages.
- Locale / city-name / time / weather strips (`Lisbon, working with founders`) banned for 99% of briefs.
- Scroll cues (`Scroll`, `↓ scroll`, `Scroll to explore`) banned.
- Zero decorative status dots by default.
- `border-t` + `border-b` on every row of long lists banned (use a different UI component).
- Scoring / progress bars with filled background tracks banned as comparison visuals.
- Div-based fake product UI (fake task lists / dashboards / terminals built from styled divs) banned.
- Floating top-right sub-text in section headings banned.
- Hand-rolled SVG icons strongly discouraged; use Phosphor / HugeIcons / Radix / Tabler.

**Hardened design rules**

- **Color Consistency Lock** - one accent across the whole page; no random color swaps in section 7.
- **Shape Consistency Lock** - one corner-radius system per page.
- **Button Contrast Check** - every CTA passes WCAG AA contrast (no white-on-white).
- **Hero Discipline** - headline ≤ 2 lines, subtext ≤ 20 words and ≤ 4 lines, CTAs visible without scroll, font scale planned with image size.
- **Navigation** - single line at desktop, height ≤ 80px.
- **"Used by / Trusted by"** logo wall lives UNDER the hero, uses real SVG logos (Simple Icons / devicon), never plain text wordmarks.
- **Section-Layout-Repetition Ban** - across 8 sections, at least 4 different layout families.
- **Bento Cell Count Rule** - N items = exactly N cells; no empty middle or trailing cells.
- **Page Theme Lock** - one theme (light / dark / auto) for the whole page; no mid-page light/dark flips.
- **Italic Descender Clearance** - italic display words with `y g j p q` need `leading-[1.1]` minimum and `pb-1` reserve.
- **Long lists need a different UI component** - `<ul>` + `divide-y` for > 5 items is the lazy default; reach for cards / tabs / marquee / carousel / scroll-snap pills.
- **Long-list-divider-overuse banned** - no `border-t` + `border-b` on every row.

**Animation discipline**

- Motion library standardised on **Motion** (`motion/react`, the rebrand of Framer Motion). Legacy `framer-motion` package still works as alias.
- **§5.A GSAP Sticky-Stack** - canonical code skeleton (`start: "top top"`, `pin: true`, `scrub: true`, transform driven by NEXT card's trigger).
- **§5.B GSAP Horizontal-Pan** - canonical code skeleton (`start: "top top"`, `pin: true`, `end: "+=" + distance`, `scrub: 1`).
- **§5.C Scroll-Reveal Stagger** - lighter Motion-only pattern using `whileInView`. Use this for simple reveals; save GSAP for actual pinning/scrubbing.
- **§5.D Forbidden Animation Patterns** - `window.addEventListener('scroll')`, custom scroll calculations in React state, `requestAnimationFrame` loops touching React state. Banned outright.
- **Reduced motion mandatory** for anything `MOTION_INTENSITY > 3` - wrap in `useReducedMotion()` or `@media (prefers-reduced-motion: reduce)`.
- **"Motion claimed, motion shown"** - pages claiming `MOTION_INTENSITY > 4` must actually animate; otherwise drop the dial to 3 and ship clean static.

**Stack updates**

- Tailwind v4 default; v3 only when the existing project demands it.
- Motion replaces Framer Motion as the recommended import path.
- Icons: Phosphor / HugeIcons / Radix / Tabler (in priority order). Lucide discouraged. Hand-rolled SVG icons banned.

### What's the same

- Three dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) - same spirit, expanded with preset matrix and inference rules.
- Anti-slop philosophy - same direction, harder enforcement.
- Performance guardrails - `transform`/`opacity` only, no `top/left/width/height` animation, hardware acceleration.

### Why we made v2 (experimental) the new default

Pre-v2, the original taste-skill set the right direction but was easy for agents to skim past. Production testing showed the same Tells emerging across builds (em-dash everywhere, section-number eyebrows, "Quietly in use at", decorative dots, fake screenshots out of styled divs, broken GSAP scroll triggers).

v2 closes those gaps with hard rules, canonical code skeletons, and a pre-flight checklist the agent must run. It is the version we now recommend.

### How to pin to v1 if you need it

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend-v1"
```

This installs the original SKILL.md unchanged.

### Stability note

v2 (experimental) is the new default AND it is actively iterating. Refinements may land in any pre-release while we converge on v2.0.0 stable. Breaking changes (rename of install name, removal of sections) will be batched and called out clearly when v2.0.0 stable cuts.

---

## v1 - the original taste-skill

The original release. Dial-driven philosophy, anti-slop rules, reference vocabulary of pattern names. Preserved at `skills/taste-skill-v1/` and installable as `design-taste-frontend-v1`.
