# HyperUI and Flowbite component inventory

Checked: 2026-07-20
Scope: components only. No website sections, layout blocks, page templates, dashboards, paid code, or cosmetic light/dark duplicates.
Status: source and license candidate inventory. No upstream code was copied in this pass.

## Decision

These sources are legally and technically different and must not be treated as one copy-paste pool:

- **HyperUI:** root MIT license; **118 structurally distinct candidate recipes across 42 component families** survive the component-only and deduplication pass. The examples are raw Tailwind HTML, not React components. Most interactive-looking examples are visual markup only and must not be marked ready until behavior and accessibility are implemented.
- **Flowbite React:** root and package MIT license; **38 distinct React component families** survive the component-only and quality-floor pass. This is the clean Flowbite source pool for a React catalog.
- **Flowbite Core documentation:** its own official license page says documentation code is **CC BY 3.0**, despite the released library code being MIT. Seventeen otherwise relevant HTML/plugin families are listed as research-only and are **not included** in the permissive/MIT candidate count.
- **Do not add the counts together as global uniques.** HyperUI and Flowbite overlap on accordions, alerts, badges, inputs, menus, modals, tabs, toasts, and other commodity primitives. Prefer the tested Flowbite React implementation for shared interactive behavior; use a HyperUI recipe only when its composition is materially different.

Neither source is a React Bits-level motion/effects source. HyperUI is useful for copyable Tailwind compositions; Flowbite React is useful for maintained interaction primitives. They supply breadth, not the catalog's premium animated identity.

## Pinned sources and license evidence

| Source | Pinned commit | Commit date | License evidence |
| --- | --- | --- | --- |
| [markmead/hyperui](https://github.com/markmead/hyperui) | [`076b25db00c6527263567a31e46b64a7c5eb1082`](https://github.com/markmead/hyperui/tree/076b25db00c6527263567a31e46b64a7c5eb1082) | 2026-07-11 | [MIT `LICENSE`](https://github.com/markmead/hyperui/blob/076b25db00c6527263567a31e46b64a7c5eb1082/LICENSE), copyright Mark Mead |
| [themesberg/flowbite](https://github.com/themesberg/flowbite) | [`232ebdb33a9e37b31b293b9988d89b862ee121e5`](https://github.com/themesberg/flowbite/tree/232ebdb33a9e37b31b293b9988d89b862ee121e5) | 2026-06-27 | [MIT `LICENSE.md`](https://github.com/themesberg/flowbite/blob/232ebdb33a9e37b31b293b9988d89b862ee121e5/LICENSE.md) for released library code; [official license page in the same commit](https://github.com/themesberg/flowbite/blob/232ebdb33a9e37b31b293b9988d89b862ee121e5/content/getting-started/license.md) assigns documentation code to CC BY 3.0 and Pro to a separate EULA |
| [themesberg/flowbite-react](https://github.com/themesberg/flowbite-react) | [`85319bd067822f7aa9670688780aeb58cc187aa5`](https://github.com/themesberg/flowbite-react/tree/85319bd067822f7aa9670688780aeb58cc187aa5) | 2026-06-27 | [MIT `LICENSE`](https://github.com/themesberg/flowbite-react/blob/85319bd067822f7aa9670688780aeb58cc187aa5/LICENSE), copyright Bergside Inc.; package `flowbite-react` 0.12.17 also declares MIT |

The MIT notices must be preserved in Taste Blocks third-party notices and per-component provenance. Flowbite names and logos are Bergside trademarks; do not use them as Taste Blocks branding or imply endorsement.

## HyperUI

### Source mechanics and quality

- Canonical metadata lives under `src/content/collection/{application,marketing,neobrutalism}/<family>.mdx`.
- Copyable markup lives under `public/examples/<collection>/<family>/<number>.html`. The `-dark.html` files are dark-color renderings of the same recipe and never count separately.
- The repository baseline is Tailwind CSS 4.3.1. Conversion requires HTML-to-JSX attribute changes and a React API; it does not require carrying Astro site code.
- Apart from charts, the examples use inline SVG and Tailwind classes rather than a component dependency. The eleven chart recipes load Chart.js 4.5.1 from a CDN upstream; a real import should use the npm package and separately preserve its MIT notice.
- HyperUI's preview shell script only blocks navigation/submission and switches preview direction. It is not component behavior. Outside charts and modals, the examples contain no local behavior script. Dropdown buttons, tabs, dismiss buttons, quantity controls, and similar controls therefore look interactive but do nothing as copied.
- No reduced-motion handling was found in the application, marketing, or neobrutalism example trees.
- Several card, cart, side-menu, and product examples hotlink Unsplash images. Treat all remote images and example copy as fixtures, not redistributable component assets. Replace them with caller-provided or owned media.
- Inline SVG can be retained with the MIT-covered recipe, but normalize SVG attributes for JSX and keep decorative icons `aria-hidden`.

### Application components — 86 recipes in 32 families

Paths below are relative to the pinned HyperUI repository. Every named file is the light source recipe; its `-dark.html` twin is not another component. For compactness, a bare filename after the first full path in a table row resolves inside the same displayed directory.

| Family | Kept candidates and exact source files | Count | Dependencies, assets, and quality notes |
| --- | --- | ---: | --- |
| Accordion | Base — `public/examples/application/accordions/1.html`; Nested — `public/examples/application/accordions/4.html` | 2 | Native `details`/`summary`; no runtime dependency. Icon/divider/compact skins excluded. |
| Badge | Base — `public/examples/application/badges/1.html`; Dismissible — `3.html`; Icon-only — `4.html` | 3 | Dismiss button has no removal behavior; wire state and accessible status semantics. |
| Breadcrumb | Base — `public/examples/application/breadcrumbs/1.html`; Grouped chevron — `5.html` | 2 | Inline SVG only. Slash/home-icon permutations are cosmetic duplicates. |
| Button group | Text group — `public/examples/application/button-groups/1.html`; Icon group — `2.html`; Primary plus secondary — `3.html` | 3 | Static buttons; layout-spacing permutations excluded. |
| Chart | Area line — `public/examples/application/charts/1.html`; Bar — `2.html`; Donut — `3.html`; Sparkline — `4.html`; Stacked bar — `5.html`; Combo bar/target — `6.html`; Two-period line — `7.html`; Radar — `8.html`; Polar area — `9.html`; Scatter — `10.html`; Bubble — `11.html` | 11 | Chart.js 4.5.1 and canvas. These are distinct chart models, not color variants. React lifecycle, resize cleanup, data inputs, and accessible summaries are still required. |
| Checkbox | Base — `public/examples/application/checkboxes/1.html`; Described — `2.html` | 2 | Native input. Divide-only variant excluded. |
| Details list | Base — `public/examples/application/details-list/1.html` | 1 | Semantic description list; striped/bordered skins excluded. |
| Divider | Base — `public/examples/application/dividers/1.html` | 1 | Decorative gradient/alignment versions excluded. |
| Dropdown menu | Base — `public/examples/application/dropdown/1.html`; Grouped — `3.html` | 2 | Visual markup only: trigger has no menu behavior or focus management. Divided skin excluded. |
| Empty state | Import-or-create — `public/examples/application/empty-states/2.html`; No results — `5.html` | 2 | Two materially different action models. Other copy-only presets excluded. |
| File uploader | Drop area — `public/examples/application/file-uploaders/1.html`; Button-led uploader — `2.html` | 2 | Native file input; validate drag/drop, keyboard label, file list, and errors during import. |
| Filter control | Dropdown filters — `public/examples/application/filters/1.html`; Accordion filters — `2.html` | 2 | Native details plus inputs. Treat as controls, not page filter layouts. |
| Text input | Base — `public/examples/application/inputs/1.html`; Leading icon — `2.html`; Attached action — `3.html`; Floating label — `4.html` | 4 | Native input; attached-action and floating-label structures are materially different. |
| Loader | Spinner — `public/examples/application/loaders/1.html`; Progress loader — `4.html`; Pulse dots — `5.html`; Ping dots — `6.html`; Bounce dots — `7.html` | 5 | CSS animation only; add reduced-motion fallbacks and live-region policy. Text/inline spinner copies excluded. |
| Modal | Closeable — `public/examples/application/modals/2.html`; Action modal — `4.html`; Input modal — `6.html` | 3 | Native `dialog` plus local `showModal()`/`close()` script. Non-close twin files excluded; React adapter must restore focus and handle submit semantics. |
| Pagination | Page navigation — `public/examples/application/pagination/1.html`; Direct page input — `2.html`; X-of-Y controls — `3.html` | 3 | Three different control models; wire state and valid navigation targets. |
| Progress | Basic — `public/examples/application/progress-bars/1.html`; Label/status — `2.html`; Compact metadata — `3.html`; Circular — `4.html` | 4 | Static values in examples. Add progress semantics and reduced motion if animated. |
| Quantity input | Spinnerless stepper — `public/examples/application/quantity-inputs/2.html` | 1 | Plus/minus buttons have no behavior. Border/text versions are the same control and are excluded. |
| Radio group | Base — `public/examples/application/radio-groups/1.html`; Radio with freeform input — `2.html` | 2 | Native inputs. Color-only version excluded. |
| Range input | Live output — `public/examples/application/range-inputs/2.html`; Native ticks — `4.html`; Labeled marks — `5.html` | 3 | Example output is not wired. Base and min/max-label-only copies excluded. |
| Select | Base — `public/examples/application/selects/1.html`; Option groups — `2.html`; Datalist combobox — `3.html` | 3 | Native controls. Datalist is retained as a different browser primitive. |
| Side menu | Profile/accordion menu — `public/examples/application/side-menu/1.html`; Icon/tooltip menu — `2.html` | 2 | Navigation components, not page shells. Replace avatar media; tooltip version needs real accessible tooltip behavior. |
| Skip links | Single target — `public/examples/application/skip-links/1.html`; Multiple targets — `2.html` | 2 | Native anchors; preserve visible-on-focus behavior and real target IDs. Title skin excluded. |
| Stat | Inline growth stat — `public/examples/application/stats/1.html`; Stacked stat — `5.html` | 2 | Content components only. Icon permutations excluded. Never ship invented metrics in demos. |
| Stepper | Compact progress — `public/examples/application/steps/1.html`; Grouped step list — `4.html`; Timeline stepper — `5.html` | 3 | Distinct structures. Two other compact status-icon variants excluded. |
| Table | Base — `public/examples/application/tables/1.html`; Sticky header — `4.html`; Sticky first column — `5.html` | 3 | Border/stripe skins excluded. Preserve table semantics and test narrow overflow. |
| Tabs | Horizontal — `public/examples/application/tabs/1.html`; Vertical — `3.html` | 2 | Visual markup only: no tab activation or keyboard behavior. Icons/underline/pill skins excluded. |
| Textarea | Base — `public/examples/application/textareas/1.html`; Actions inside — `2.html`; Actions outside — `3.html` | 3 | Native textarea; action placements are distinct compositions. |
| Timeline | Vertical — `public/examples/application/timelines/1.html`; Horizontal — `3.html` | 2 | Middle-line version excluded as styling only. |
| Toast | Status toast — `public/examples/application/toasts/1.html`; Toast with action — `5.html` | 2 | Visual markup only. Status-color copies and standout skin excluded; add announcement and dismissal behavior. |
| Toggle | Base — `public/examples/application/toggles/1.html`; State-icon toggle — `2.html` | 2 | Native checkbox. Material/Apple skins excluded. |
| Vertical menu | Base — `public/examples/application/vertical-menu/1.html`; Accordion menu — `6.html` | 2 | Badge/icon/divider permutations excluded. Accordion version needs disclosure state semantics. |

The `src/content/collection/application/<slug>.mdx` file matching each directory is the authoritative title/order metadata. Keep that MDX path in provenance alongside the exact HTML file.

### Distinctive neobrutalism recipes — 4 recipes in 3 families

| Family | Kept candidates and exact source files | Count | Why retained |
| --- | --- | ---: | --- |
| Alert | Base alert — `public/examples/neobrutalism/alerts/1.html` | 1 | Adds the only HyperUI alert family; success/error are content/color copies. |
| Button | Press-depth — `public/examples/neobrutalism/buttons/2.html`; Underline-shift — `4.html` | 2 | Different interaction treatments. Plain, inset, and double-border visual skins are excluded. |
| Card | Retro-window card — `public/examples/neobrutalism/cards/4.html` | 1 | Materially different framed-object composition; other cards are border/stack skins. |

All other neobrutalism files duplicate an application family with thicker borders and hard shadows, so they do not create additional catalog entries.

### Marketing object components — 28 recipes in 8 families

| Family | Kept candidates and exact source files | Count | Dependencies, assets, and quality notes |
| --- | --- | ---: | --- |
| Announcement | Inline dismissible — `public/examples/marketing/announcements/2.html`; Fixed dismissible — `4.html`; Floating dismissible — `6.html` | 3 | Dismiss buttons are visual only. Non-dismissible twins excluded. Fixed/floating placement is part of the component contract, not a whole page layout. |
| Banner | Centered — `public/examples/marketing/banners/1.html`; Media banner — `3.html` | 2 | Left-only alignment copy excluded. Replace media if used. |
| Blog card | Floating image — `public/examples/marketing/blog-cards/2.html`; Animated gradient border — `4.html`; Icon-led — `5.html`; Background-overlay — `7.html` | 4 | Structurally distinct. Uses remote Unsplash media in several demos; inject owned images. Basic border/CTA permutations excluded. Animated border needs reduced motion. |
| Content card | Author/meta — `public/examples/marketing/cards/1.html`; Background reveal — `3.html`; Bordered hover reveal — `4.html`; Profile/project — `6.html`; Shaped media — `7.html`; Podcast — `8.html`; Forum post — `9.html` | 7 | Product-style card is excluded in favor of the dedicated product-card family. Remote media must be replaced. |
| Cart popover | Popup with actions — `public/examples/marketing/carts/2.html` | 1 | Base popup is a weaker duplicate; page cart is a page composition and excluded. Remote product media is a fixture. |
| Contact form | Base — `public/examples/marketing/contact-forms/1.html`; Triage — `2.html`; Consent/checkboxes — `3.html` | 3 | Retained as bounded form components. Grid and side-by-side section compositions excluded. Add real submission/error states; never imply a demo form works. |
| Poll | Single choice — `public/examples/marketing/polls/1.html`; Multiple choice — `2.html`; Rating — `3.html` | 3 | Three distinct input models. No invented result data. |
| Product card | Base — `public/examples/marketing/product-cards/1.html`; Variant selector — `5.html`; Wishlist/action — `6.html`; Offer/action — `7.html`; Multi-action — `8.html` | 5 | Rounded-image and copy-only variants excluded. Replace all remote product photos. Wire actions or label previews as nonfunctional. |

## Flowbite React — 38 MIT candidates

### Integration baseline

- Candidate source root: `packages/ui/src/components/<Name>/` at the pinned Flowbite React commit.
- Upstream package: `flowbite-react` 0.12.17; React 18/19, React DOM 18/19, and Tailwind CSS 3/4 peers.
- Most components import Flowbite's internal theme resolver, Tailwind merge helper, provider, types, and icons. Copying only the headline TSX file will break. Either depend on the MIT package or vendor the exact internal dependency closure and record every copied path.
- Dropdown, Popover, and Tooltip use `@floating-ui/react`; Tooltip/Floating also use `@floating-ui/core`. Those dependency licenses must be preserved independently.
- Package source contains no bundled demo photos, videos, or fonts. Components accept children or caller content. Do not pull media from the documentation site into the registry.
- Many components have colocated Vitest/Testing Library tests. Tabs implement tab roles and keyboard focus; Dropdown uses Floating UI list navigation/typeahead. This is useful evidence, not a release waiver.
- No `prefers-reduced-motion` or `motion-reduce` handling was found in the component source tree. Modal, Drawer, Carousel, menu focus, and animation cleanup still need independent Taste Blocks QA.

### Candidate list

Source paths are relative to the pinned Flowbite React repository. Example directories are evidence only and do not create extra components.

| Component family | Source | Example evidence | Extra dependency or quality note |
| --- | --- | --- | --- |
| Accordion | `packages/ui/src/components/Accordion/` | `apps/web/examples/accordion/` | Composite family; panel/title subcomponents do not count separately. |
| Alert | `packages/ui/src/components/Alert/` | `apps/web/examples/alert/` | Status colors are props, not extra entries. |
| Avatar | `packages/ui/src/components/Avatar/` | `apps/web/examples/avatar/` | Avatar group/counter are part of the same family; caller supplies media. |
| Badge | `packages/ui/src/components/Badge/` | `apps/web/examples/badge/` | One family across color/icon variants. |
| Banner | `packages/ui/src/components/Banner/` | `apps/web/examples/banner/` | Bounded dismissible UI, not a page section. |
| Breadcrumb | `packages/ui/src/components/Breadcrumb/` | `apps/web/examples/breadcrumb/` | Item subcomponent stays inside the family. |
| Button | `packages/ui/src/components/Button/` | `apps/web/examples/button/`, `apps/web/examples/buttonGroup/` | Button and ButtonGroup form one product family; color/size variants do not multiply count. |
| Card | `packages/ui/src/components/Card/` | `apps/web/examples/card/` | Generic surface; caller content/media. |
| Carousel | `packages/ui/src/components/Carousel/` | `apps/web/examples/carousel/` | Internal drag-scroll helper; autoplay needs reduced-motion and pause QA. |
| Checkbox | `packages/ui/src/components/Checkbox/` | `apps/web/examples/forms/forms.checkbox.tsx` | Native input wrapper. |
| Clipboard | `packages/ui/src/components/Clipboard/` | `apps/web/examples/clipboard/` | Icon/text renderers are one copy-feedback family. Test permissions and failure feedback. |
| Dark theme toggle | `packages/ui/src/components/DarkThemeToggle/` | `apps/web/content/docs/customize/dark-mode.mdx` | Depends on Flowbite's theme store; one toggle, not icon variants. |
| Datepicker | `packages/ui/src/components/Datepicker/` | `apps/web/examples/datepicker/` | Large internal date/view implementation. Audit locale, keyboard grid, range constraints, and timezone assumptions before release. |
| Drawer | `packages/ui/src/components/Drawer/` | `apps/web/examples/drawer/` | Escape and dialog semantics exist; verify focus trap/return and scroll lock. |
| Dropdown | `packages/ui/src/components/Dropdown/` | `apps/web/examples/dropdown/` | `@floating-ui/react`; list navigation/typeahead present. Divider/header/item are subparts. |
| File input | `packages/ui/src/components/FileInput/` | `apps/web/examples/fileInput/` | Native input wrapper; file validation remains consumer logic. |
| Floating label | `packages/ui/src/components/FloatingLabel/` | `apps/web/examples/floatingLabel/` | Input composition, not a cosmetic TextInput variant because label positioning/state is structural. |
| List group | `packages/ui/src/components/ListGroup/` | `apps/web/examples/listGroup/` | Interactive list family; plain typography List is excluded. |
| Mega menu | `packages/ui/src/components/MegaMenu/` | `apps/web/examples/megaMenu/` | Navigation component, not a complete header/section. Audit disclosure and mobile behavior. |
| Modal | `packages/ui/src/components/Modal/` | `apps/web/examples/modal/` | Composite header/body/footer count once. Verify focus containment, Escape, return focus, and nested overlays. |
| Navbar | `packages/ui/src/components/Navbar/` | `apps/web/examples/navbar/` | Navigation component only; brand/collapse/link/toggle are subparts, not separate catalog items. |
| Pagination | `packages/ui/src/components/Pagination/` | `apps/web/examples/pagination/` | One component across layout/size presets. |
| Popover | `packages/ui/src/components/Popover/` | `apps/web/examples/popover/` | `@floating-ui/react`; verify hover/click trigger and focus dismissal. |
| Progress | `packages/ui/src/components/Progress/` | `apps/web/examples/progress/` | One family across colors/sizes. Add reduced motion if animated downstream. |
| Radio | `packages/ui/src/components/Radio/` | `apps/web/examples/forms/forms.radioButton.tsx` | Native input wrapper. |
| Range slider | `packages/ui/src/components/RangeSlider/` | `apps/web/examples/forms/forms.rangeSlider.tsx` | Native range wrapper. |
| Rating | `packages/ui/src/components/Rating/` | `apps/web/examples/rating/` | Base, star, and advanced display stay one family; clarify display versus interactive mode. |
| Select | `packages/ui/src/components/Select/` | `apps/web/examples/forms/forms.select.tsx` | Native select wrapper. |
| Sidebar | `packages/ui/src/components/Sidebar/` | `apps/web/examples/sidebar/` | Navigation component, not a dashboard page. Collapse/CTA/items/logo are subparts; transitively uses Tooltip. |
| Spinner | `packages/ui/src/components/Spinner/` | `apps/web/examples/spinner/` | One loader family; add reduced-motion and announcement policy. |
| Table | `packages/ui/src/components/Table/` | `apps/web/examples/table/` | Compound semantic table; head/body/row/cell are subparts. |
| Tabs | `packages/ui/src/components/Tabs/` | `apps/web/examples/tabs/` | Tab roles and keyboard focus implemented; visual styles remain variants. |
| Textarea | `packages/ui/src/components/Textarea/` | `apps/web/examples/forms/forms.textarea.tsx` | Native textarea wrapper. |
| Text input | `packages/ui/src/components/TextInput/` | `apps/web/content/docs/components/forms.mdx` | Native input wrapper. |
| Timeline | `packages/ui/src/components/Timeline/` | `apps/web/examples/timeline/` | Compound content component; orientation/style variants count once. |
| Toast | `packages/ui/src/components/Toast/` | `apps/web/examples/toast/` | Toast/toggle subparts count once. Add queue, timeout, pause, focus, and live-region policy. |
| Toggle switch | `packages/ui/src/components/ToggleSwitch/` | `apps/web/examples/forms/forms.toggleSwitch.tsx` | One switch family across colors/sizes. |
| Tooltip | `packages/ui/src/components/Tooltip/` | `apps/web/examples/tooltip/` | `@floating-ui/core` through shared floating hooks; verify keyboard and touch behavior. |

### Flowbite React exclusions — 8 source directories

| Upstream directory | Reason |
| --- | --- |
| `packages/ui/src/components/Footer/` | Website section; layout phase, not component phase. |
| `packages/ui/src/components/Floating/` | Internal positioning primitive used by overlays, not a catalog-facing component. |
| `packages/ui/src/components/Blockquote/` | Styled native text element; below this catalog's component quality floor. |
| `packages/ui/src/components/HR/` | Styled horizontal-rule variants only. |
| `packages/ui/src/components/HelperText/` | Form subpart, not a standalone product component. |
| `packages/ui/src/components/Kbd/` | Styled native text token only. |
| `packages/ui/src/components/Label/` | Form subpart; ship with its owning control, not as a catalog count. |
| `packages/ui/src/components/List/` | Styled native list; ListGroup is the actual interactive component candidate. |

The repository has 46 top-level component directories. Subtracting these eight leaves the stated **38** candidates.

## Flowbite Core documentation — 17 held candidates, not counted

The Flowbite Core license page is unusually important here:

- `src/**` released library code is MIT.
- `content/**` documentation code is expressly CC BY 3.0.
- Flowbite Pro is under a separate EULA.

The component demos below live in `content/**`. CC BY 3.0 allows adaptation and commercial use with attribution, but it is outside the current MIT/BSD/Apache/ISC/CC0 ingestion policy and would require a separate attribution design. Keep these as research references unless that policy changes; do not silently label them MIT.

| Research-only family | Exact documentation path | Dependency/assets note |
| --- | --- | --- |
| Bottom navigation | `content/components/bottom-navigation.md` | Flowbite tooltip behavior; icon-only mobile navigation. |
| Chat bubble | `content/components/chat-bubble.md` | Flowbite dropdown/tooltip behavior; several demos use remote images. |
| Device mockups | `content/components/device-mockups.md` | Remote Flowbite/S3 screen images are not cleared as reusable assets; replace all media. |
| Gallery | `content/components/gallery.md` | Remote Flowbite/S3 photos; markup only, media excluded. |
| Indicators | `content/components/indicators.md` | Static status primitives. |
| QR code | `content/components/qr-code.md` | `qrcode` package plus Flowbite popover/clipboard behavior. |
| Skeleton | `content/components/skeleton.md` | CSS animation; requires reduced-motion treatment. |
| Speed dial | `content/components/speed-dial.md` | Flowbite `dial` and tooltip behavior. |
| Stepper | `content/components/stepper.md` | Static step structures; avoid counting style/color variants. |
| Video | `content/components/video.md` | Native video/player compositions; caller-provided media only. |
| Number input | `content/forms/number-input.md` | Flowbite input-counter behavior. |
| Phone input | `content/forms/phone-input.md` | Flowbite dropdown/clipboard behavior; flags/phone validation need separate provenance and implementation. |
| Search input | `content/forms/search-input.md` | Flowbite dropdown behavior in compound variants. |
| Timepicker | `content/forms/timepicker.md` | Combines dropdown, collapse, modal/drawer, and sometimes datepicker behavior. |
| Charts | `content/plugins/charts.md` | ApexCharts 3.46.0; separate dependency/license and lifecycle work. |
| Data table | `content/plugins/datatables.md` | `simple-datatables` 9.0.3; separate dependency/license and React integration. |
| WYSIWYG editor | `content/plugins/wysiwyg.md` | TipTap 2.6.6 extensions plus Flowbite Typography; large dependency and security/accessibility review. |

Flowbite Core's MIT `src/components/` contains 14 JavaScript behavior engines: accordion, carousel, clipboard, collapse, datepicker, dial, dismiss, drawer, dropdown, input-counter, modal, popover, tabs, and tooltip. They are useful implementation evidence but are not extra React/Tailwind catalog components and overlap the Flowbite React families, so their count is **zero**.

## Explicit global exclusions

| Excluded source area | Reason |
| --- | --- |
| HyperUI `src/content/collection/templates/**` and `public/examples/templates/**` | Full SaaS landing page and analytics dashboard templates. |
| HyperUI application `grids` and `media` | Layout recipes, not components. |
| HyperUI marketing `ctas`, `feature-grids`, `footers`, `headers`, `logo-clouds`, `newsletter-signup`, `pricing`, `product-collections`, `sections`, and `team-sections` | Website sections or layout blocks. |
| HyperUI marketing `faqs` and `empty-content` | Duplicate accordion/empty-state families already represented in the application collection. |
| HyperUI `carts/3.html`, contact-form grid/side-by-side examples | Page or section compositions rather than bounded components. |
| HyperUI dark files and omitted numbered examples | Same component with dark colors, alignment, borders, icons, spacing, or copy changes only. |
| Flowbite `content/components/footer.md` and `jumbotron.md` | Website sections. |
| Flowbite typography pages | Styled HTML elements, not React Bits-level components. |
| Flowbite Blocks | Website sections and outside this component-only phase. |
| Flowbite Pro, paid templates, Figma products, authenticated downloads | Separate commercial/EULA scope; never copy into the free redistributable registry. |
| Documentation media, product screenshots, company logos, demo data, and remote URLs | Not automatically covered as reusable Taste Blocks assets. |

## Import gates

No candidate becomes a Taste Blocks entry until all of these are true:

1. Copy from the pinned commit and exact path recorded above; never scrape the rendered website or a paid endpoint.
2. Preserve the upstream license notice and record author, repository, commit, source path, and modifications.
3. Keep one catalog entry per behavior/composition. Dark mode, color, size, icon, alignment, content, and spacing variants stay props or demos.
4. For HyperUI, convert markup to React without inventing a replacement design; implement only the behavior required by the original control and document that adaptation.
5. For Flowbite React, vendor the complete internal dependency closure or declare the upstream package dependency. Do not paste a single TSX file and guess the missing helpers.
6. Replace all remote media and sample copy with owned fixtures or caller inputs. Never ship fake product metrics, people, endorsements, or working-form claims.
7. Verify every non-upstream runtime dependency license: Chart.js, Floating UI, ApexCharts, simple-datatables, TipTap, QRCode, and any transitive package actually shipped.
8. Run TypeScript/build, hydration, console, keyboard, focus, screen-reader semantics, mobile overflow, reduced-motion, and cleanup checks before status can become verified.
9. Do a visual gate after correctness. Commodity Flowbite/HyperUI styling alone does not satisfy the React Bits-level quality target.
