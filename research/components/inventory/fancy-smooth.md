# Fancy Components and SmoothUI component inventory

Checked: 2026-07-20
Scope: React components only. No sections, page layouts, templates, dashboards, or cosmetic/demo variants.
Status: both public source repositories are permissively licensed candidates; no component code was copied in this pass.

## Decision

Both sources can legally feed Taste Blocks Free at the pinned commits, subject to preserving their MIT notices and separately clearing dependencies, assets, names, and demo content.

| Source | Raw upstream inventory | Countable component families | Decision |
| --- | ---: | ---: | --- |
| Fancy Components | 40 documented items | **37** | Accept the public MIT component source; exclude the non-component sticky-footer recipe and merge two specialized duplicates into their more general families. |
| SmoothUI | 114 component source directories | **91** | Accept the public MIT component source; keep the complete path inventory, but count shared engines and obvious direction/skin duplicates once. Exclude all 34 section blocks. |
| Combined ceiling before cross-source dedupe | 154 | **128** | This is a source-inventory ceiling, not a release count. Cross-library duplicates and QA failures must reduce it further. |

The obvious cross-source collisions include Typewriter, Scramble Hover, numeric flow/ticker, and marquee/infinite slider. They must be compared as one product family each before import; do not add the two source totals directly to a public component count.

## Pinned sources and licenses

| Field | Fancy Components | SmoothUI |
| --- | --- | --- |
| Repository | [danielpetho/fancy](https://github.com/danielpetho/fancy) | [educlopez/smoothui](https://github.com/educlopez/smoothui) |
| Pinned commit | [`f9f62c61207b2dd3210476dd98af3c9a5be24094`](https://github.com/danielpetho/fancy/tree/f9f62c61207b2dd3210476dd98af3c9a5be24094) | [`1fa17cd10e646f704891b89a569fefb9e6f49a20`](https://github.com/educlopez/smoothui/tree/1fa17cd10e646f704891b89a569fefb9e6f49a20) |
| Commit date | 2026-03-14T11:34:10+01:00 | 2026-07-12T19:19:31+02:00 |
| License | [MIT, copyright 2024 Daniel Petho](https://github.com/danielpetho/fancy/blob/f9f62c61207b2dd3210476dd98af3c9a5be24094/LICENSE) | [MIT, copyright 2024 Eduardo Calvo](https://github.com/educlopez/smoothui/blob/1fa17cd10e646f704891b89a569fefb9e6f49a20/LICENSE) |
| Official catalog | [fancycomponents.dev/components](https://www.fancycomponents.dev/components) | [smoothui.dev/docs/components](https://smoothui.dev/docs/components) |
| Mutable registry | `https://fancycomponents.dev/r/{name}.json` | `https://smoothui.dev/r/{name}.json` |

The MIT grants permit use, copying, modification, distribution, sublicensing, and sale. Copies or substantial portions must retain the relevant copyright and permission notice. No conflicting per-file license was found in either candidate component directory at the pinned commits. Repository `private: true` package flags only prevent accidental npm publication; they do not override the root MIT license.

This conclusion covers source at the pinned commits, not every related right. MIT does not grant trademark rights or automatically license remote images, profile data, fonts, API content, or third-party packages. Taste Blocks must retain both upstream notices, record every copied path, replace unverified demo media, and independently audit runtime dependencies.

## Shared integration rules

- Copy from the pinned Git commit and exact path, never from the mutable live registry without reconciling it to that commit.
- Store the upstream repository, commit, source path, license, original author, and every modification per imported component.
- Preserve only one public entry for one behavior. Directions, colors, content presets, demo pages, and wrappers around the same engine are not new components.
- Do not copy documentation-site navigation, landing sections, public fonts, screenshots, sounds, sample avatars, or remote demo media.
- Rename components based on Apple, Figma, Siri, Dynamic Island, X/Twitter, or another third-party product before release; replace branded defaults and do not imply endorsement.
- A source-license pass is not a release-quality pass. Every candidate still needs build, hydration, mobile, keyboard, reduced-motion, cleanup, console, and visual QA.

## Fancy Components

### Source integrity and quality notes

- Canonical source root: `src/fancy/components/`; canonical demos: `src/fancy/examples/`; docs: `src/content/docs/components/`.
- The official catalog contains 40 pages, but Sticky Footer explicitly says it contains no component. It is excluded.
- Letter Swap and Random Letter Swap each publish forward and ping-pong implementation files behind one documented component. Underline Animation publishes three direction files behind one documented component. Each group counts once.
- `element-along-svg-path.tsx` and `simple-carousel.tsx` are internal helpers, not additional catalog products.
- The repository has no component tests. Only Box Carousel contains a direct reduced-motion check; all other motion components require a reduced-motion adaptation before release.
- The component source uses React, Tailwind CSS 4, `motion`, `uuid`, `lodash`, `matter-js`, `poly-decomp`, and `clsx`, plus small local hooks/utilities. These dependencies need their own pinned license records during import.
- No candidate requires a bundled image, video, sound, or font. Media components accept caller content. Variable-font components require a caller-supplied variable font.
- Do not copy anything under `public/fonts/`; the repository does not provide a per-font license ledger there.
- Some docs credit inspiration or contributors such as Framer University, Codrops, Khoa Phan, David DeSandro, and award-site examples. Preserve meaningful source credits in provenance even though the repository code is MIT.

Paths below are relative to the Fancy repository. Demo globs name evidence only and never increase the component count.

### Text and typography — 18 families

| Component family | Source path(s) | Extra dependencies/helpers | Inputs or assets | Demo evidence | Quality note |
| --- | --- | --- | --- | --- | --- |
| Letter Swap | `src/fancy/components/text/letter-swap-forward-anim.tsx`; `letter-swap-pingpong-anim.tsx` | `motion`; ping-pong also uses `lodash` | text | `src/fancy/examples/text/letter-swap-demo*.tsx` | One family; forward/ping-pong are behavior modes, not two products. |
| Letter 3D Swap | `src/fancy/components/text/letter-3d-swap.tsx` | `motion`, `cn` | text | `src/fancy/examples/text/letter-3d-swap*.tsx` | Distinct 3D character-box interaction. |
| Random Letter Swap | `src/fancy/components/text/random-letter-swap-forward-anim.tsx`; `random-letter-swap-pingpong-anim.tsx` | `motion`, `lodash` | text | `src/fancy/examples/text/random-letter-swap-demo.tsx` | One family; timing modes are variants. |
| Vertical Cut Reveal | `src/fancy/components/text/vertical-cut-reveal.tsx` | `motion`, `cn` | text; word/character/line split | `src/fancy/examples/text/vertical-cut-reveal*.tsx` | Trigger and split demos are presets, not products. |
| Text Rotate | `src/fancy/components/text/text-rotate.tsx` | `motion`, `cn` | string list | `src/fancy/examples/text/text-rotate*.tsx` | Flexible text-switching primitive; strong candidate. |
| Variable Font Hover | `src/fancy/components/text/variable-font-hover-by-letter.tsx` | `motion`, `lodash` | caller variable font and axes | `src/fancy/examples/text/variable-font-hover-by-letter-demo.tsx` | Canonical family; random ordering is merged below. |
| Scroll and Swap Text | `src/fancy/components/text/scroll-and-swap-text.tsx` | `motion`, `cn` | text and scroll container | `src/fancy/examples/text/scroll-and-swap-text-demo.tsx` | Distinct scroll-driven typography behavior. |
| Text Cursor Proximity | `src/fancy/components/text/text-cursor-proximity.tsx` | `motion`, `use-mouse-position-ref`, `cn` | text and interpolated CSS values | `src/fancy/examples/text/text-cursor-proximity*.tsx` | Use this generalized proximity engine instead of its variable-font-only specialization. |
| Variable Font and Cursor | `src/fancy/components/text/variable-font-and-cursor.tsx` | `motion`, `use-mouse-position-ref`, `cn` | caller variable font and axes | `src/fancy/examples/text/variable-font-and-cursor-demo.tsx` | Whole-text two-axis mapping; distinct from per-character proximity. |
| Breathing Text | `src/fancy/components/text/breathing-text.tsx` | `motion`, `cn` | caller variable font | `src/fancy/examples/text/breathing-text-demo.tsx` | Continuous motion; require reduced-motion stop and performance test. |
| Underline Animation | `src/fancy/components/text/underline-center.tsx`; `underline-comes-in-goes-out.tsx`; `underline-goes-out-comes-in.tsx` | `motion`, `cn`/`clsx` | text/children | `src/fancy/examples/text/underline-demo.tsx` | One family; three directions are cosmetic variants. |
| Underline to Background | `src/fancy/components/text/underline-to-background.tsx` | `motion`, `cn` | text/children | `src/fancy/examples/text/underline-to-background-demo.tsx` | Materially different fill/contrast transition. |
| Basic Number Ticker | `src/fancy/components/text/basic-number-ticker.tsx` | `motion`, `cn` | numeric value | `src/fancy/examples/text/*number-ticker-demo.tsx` | Cross-source duplicate candidate with SmoothUI Number Flow. |
| Typewriter | `src/fancy/components/text/typewriter.tsx` | `motion`, `cn` | string or string list | `src/fancy/examples/text/typewriter-demo.tsx` | Cross-source duplicate candidate with SmoothUI Typewriter Text. |
| Scramble Hover | `src/fancy/components/text/scramble-hover.tsx` | `motion`, `cn` | text and optional character set | `src/fancy/examples/text/scramble-hover*.tsx` | Cross-source duplicate candidate with SmoothUI Scramble Hover. |
| Text Highlighter | `src/fancy/components/text/text-highlighter.tsx` | `motion`, `cn` | text/children | `src/fancy/examples/text/text-highlighter*.tsx` | Hover, ref, and scroll are trigger modes, not separate entries. |
| Scramble In | `src/fancy/components/text/scramble-in.tsx` | React timers; no extra package | text | `src/fancy/examples/text/scramble-in-demo.tsx` | Distinct enter/reveal behavior. Verify timer cleanup. |
| Text Along Path | `src/fancy/components/text/text-along-path.tsx` | `motion`; inline SVG path | text and caller path | `src/fancy/examples/text/text-along-path*.tsx` | Auto/scroll demos are modes of one component. |

### Visual, media, and physics components — 10 families

| Component family | Source path | Extra dependencies/helpers | Inputs or assets | Demo evidence | Quality note |
| --- | --- | --- | --- | --- | --- |
| Animated Gradient with SVG | `src/fancy/components/background/animated-gradient-with-svg.tsx` plus adjacent `.json` CSS metadata | `use-debounced-dimensions`, `cn`; registry keyframes | inline SVG/colors | `src/fancy/examples/background/animated-gradient-demo.tsx` | Copy the registry CSS metadata with the TSX. |
| Pixel Trail | `src/fancy/components/background/pixel-trail.tsx` | `motion`, `uuid`, `use-dimensions`, `cn` | generated pixel grid | `src/fancy/examples/background/pixel-trail*.tsx` | Pointer-intensive; add touch/reduced-motion fallback. |
| Box Carousel | `src/fancy/components/carousel/box-carousel.tsx` | `motion`, `cn` | caller items/media | `src/fancy/examples/carousel/box-carousel*.tsx` | Keyboard and reduced motion already exist; still test focus semantics. |
| Gooey SVG Filter | `src/fancy/components/filter/gooey-svg-filter.tsx` | inline SVG filter | caller content | `src/fancy/examples/filter/gooey-svg-filter*.tsx` | Safari support is limited upstream; document fallback. |
| Pixelate SVG Filter | `src/fancy/components/filter/pixelate-svg-filter.tsx` | inline SVG filter | caller content | `src/fancy/examples/filter/pixelate-svg-filter*.tsx` | Safari unsupported upstream; require graceful no-filter fallback. |
| Image Trail | `src/fancy/components/image/image-trail.tsx` | `motion`, `cn` | caller images/video/SVG/HTML | `src/fancy/examples/image/image-trail*.tsx` | No demo media may be copied; verify touch and DOM cleanup. |
| Parallax Floating | `src/fancy/components/image/parallax-floating.tsx` | `motion`, `use-mouse-position-ref`, `cn` | caller media/children | `src/fancy/examples/image/parallax-floating-demo.tsx` | Pointer-dependent; disable or simplify on touch/reduced motion. |
| Elastic Line | `src/fancy/components/physics/elastic-line.tsx` | `motion`, dimension and elastic-line hooks | inline SVG geometry | `src/fancy/examples/physics/elastic-line-demo.tsx` | Distinct spring interaction; test resize/listener cleanup. |
| Gravity | `src/fancy/components/physics/gravity.tsx` plus adjacent `.json` dependency metadata | `matter-js`, `lodash`, `poly-decomp`, `@types/matter-js`; position/SVG utilities | caller HTML/SVG bodies | `src/fancy/examples/physics/gravity*.tsx` | Heavy runtime; lazy-load and pause offscreen. |
| Cursor Attractor and Gravity | `src/fancy/components/physics/cursor-attractor-and-gravity.tsx` plus adjacent `.json` | same Matter.js stack plus mouse-position hook | caller HTML/SVG bodies | `src/fancy/examples/physics/cursor-attractor-and-gravity*.tsx` | Distinct cursor-attractor behavior; needs touch fallback. |

### Interaction and motion wrappers — 9 families

These live in Fancy's upstream `blocks` folder but are reusable behavior components, not page sections. They remain in scope after semantic reclassification.

| Component family | Source path(s) | Extra dependencies/helpers | Inputs or assets | Demo evidence | Quality note |
| --- | --- | --- | --- | --- | --- |
| Circling Elements | `src/fancy/components/blocks/circling-elements.tsx` plus adjacent `.json` CSS metadata | `motion`, `cn`; registry keyframes | caller children | `src/fancy/examples/blocks/circling-elements*.tsx` | Copy keyframes; continuous motion needs a reduced-motion stop. |
| 3D CSS Box | `src/fancy/components/blocks/css-box.tsx` | `motion`, `cn`, CSS 3D transforms | caller face content | `src/fancy/examples/blocks/css-box*.tsx` | Hover/scroll demos are modes, not entries. |
| Drag Elements | `src/fancy/components/blocks/drag-elements.tsx` | Motion drag gestures | caller children | `src/fancy/examples/blocks/drag-elements*.tsx` | Provide keyboard alternative where dragged position has meaning. |
| Float | `src/fancy/components/blocks/float.tsx` | `motion`, `cn` | caller child | `src/fancy/examples/blocks/float*.tsx` | Very small continuous-motion wrapper; low priority and never count offset demos separately. |
| Marquee Along SVG Path | `src/fancy/components/blocks/marquee-along-svg-path.tsx`; helper `element-along-svg-path.tsx` | `motion`, `cn`, inline SVG path | caller elements/path | `src/fancy/examples/blocks/marquee-along-svg-path*.tsx` | Helper is part of this family, not a second component. |
| Media Between Text | `src/fancy/components/blocks/media-between-text.tsx` | `motion`, `cn` | caller text and image/video | `src/fancy/examples/blocks/media-between-text*.tsx` | Reusable compound component, not a hero/section. Replace demo artwork. |
| Screensaver | `src/fancy/components/blocks/screensaver.tsx` | `motion`, `use-dimensions`, `cn` | caller child | `src/fancy/examples/blocks/screensaver-demo.tsx` | Continuous movement; pause offscreen and under reduced motion. |
| Simple Marquee | `src/fancy/components/blocks/simple-marquee.tsx`; internal helper `simple-carousel.tsx` | `motion`, `cn` | caller children | `src/fancy/examples/blocks/simple-marquee*.tsx` | One family; drag/3D/easing demos are options. Cross-source duplicate with SmoothUI Infinite Slider. |
| Stacking Cards | `src/fancy/components/blocks/stacking-cards.tsx` | `motion`, `cn` | caller card children | `src/fancy/examples/blocks/stacking-cards-demo.tsx` | Reusable scroll interaction, not a prewritten website section. |

### Fancy merges and exclusions

| Upstream item | Path | Decision |
| --- | --- | --- |
| Variable Font Hover by Random Letter | `src/fancy/components/text/variable-font-hover-by-random-letter.tsx` | Merge into Variable Font Hover; only ordering differs. |
| Variable Font Cursor Proximity | `src/fancy/components/text/variable-font-cursor-proximity.tsx` | Merge into generalized Text Cursor Proximity; it specializes the same distance mapping to font axes. |
| Sticky Footer | No component source; demo at `src/fancy/examples/blocks/sticky-footer-demo.tsx` | Exclude. Upstream documentation explicitly describes it as a Tailwind layout recipe, not a component. |
| `element-along-svg-path.tsx` | `src/fancy/components/blocks/element-along-svg-path.tsx` | Internal helper for Marquee Along SVG Path; do not count separately. |
| `simple-carousel.tsx` | `src/fancy/components/blocks/simple-carousel.tsx` | Internal helper for Simple Marquee; do not count separately. |
| Demo variants | `src/fancy/examples/**` | Test evidence only; never separate catalog entries. |
| Landing/docs UI and public fonts | `src/components/**`, `src/components/landing/**`, `public/fonts/**` | Outside component source pool and asset licensing not established here. |

## SmoothUI

### Source integrity and quality notes

- Canonical component root: `packages/smoothui/components/<name>/index.tsx`.
- Every one of the 114 component directories has an adjacent `package.json`, a docs page at `apps/docs/content/docs/components/<name>.mdx`, and a primary demo at `apps/docs/examples/<name>.tsx`.
- Tweet Card additionally uses `client.tsx` and has `tweet-card.tsx`, `tweet-card-top.tsx`, and `tweet-card-avatars.tsx` demos. AI Input, Figma Comment, and Gooey Popover include `use-click-outside.tsx`; Cursor Follow includes `use-cursor-position.tsx`. These helpers belong to their parent component.
- The separate `packages/smoothui/blocks/` tree contains 34 website sections: CTAs, FAQs, features, footers, headers, logo clouds, pricing, stats, team, and testimonials. All 34 are explicitly excluded.
- 91 of 114 component directories have tracked tests. The 23 without tests are: Blur Out Up, Bottom Up Letters, Depth Parallax Words, Fade Through, Focus Blur Resolve, Line-by-Line Slide, Mask Reveal Up, Micro Scale Fade, Per Character Rise, Per Word Crossfade, Photo Stack, Scale Down Fade, Shared Axis X/Y/Z, Shimmer Sweep, Shine Text, Short Slide Right, Soft Blur In, Spring Scale In, Stagger From Center/Edges, and Top Down Letters.
- Upstream metadata marks eight items as lacking reduced-motion support: Gooey Popover, Number Flow, Price Flow, Scramble Hover, Siri Orb, Skeleton Loader, Switchboard Card, and Tweet Card. Treat all eight as blocked until fixed. Shared shader/SDF wrappers delegate reduced motion to their engine.
- The package metadata schema and actual metadata have drifted: live entries use categories such as `transitions`/`others`, complexity `advanced`, and animation types such as `ease`, `shared-axis`, and `kinetic-build`, although the checked-in type unions omit them. Ingest from actual directories and validate locally; do not trust the API schema blindly.
- Common dependencies are `motion` (92 directories) and `lucide-react` (27). Other dependencies include Radix primitives, `class-variance-authority`, `react-use-measure`, `usehooks-ts`, `input-otp`, `popmotion`, `react-tweet`, and GSAP. Local `@repo/*` dependencies must be flattened into Taste Blocks registry dependencies.
- Component directories contain source, package metadata, tests, and no bundled media assets. Documentation-site assets under `apps/docs/public/**` are excluded.

Path shorthand below expands `name` to `packages/smoothui/components/<name>/index.tsx`; the demo is `apps/docs/examples/<name>.tsx` unless noted. `Keep` means a distinct source candidate, not release approval. `Merge` means preserve the source path in provenance but count it under the named canonical family.

### AI, interactive, and composite components — 19 source paths / 19 families

| Name / exact source directory | Dependencies beyond React/Tailwind/local `cn` | Inputs or external assets | Decision and quality note |
| --- | --- | --- | --- |
| `agent-avatar` | — | caller state/content | **Keep.** Compact stateful avatar; test exists. |
| `ai-branch` | `motion`, `lucide-react` | caller branches/content | **Keep.** Distinct branching interaction. |
| `ai-input` | `motion`, `class-variance-authority`; local Smooth Button and click-outside helper | caller text/actions | **Keep.** Flatten local dependency; complex keyboard QA required. |
| `siri-orb` | CSS/React | generated gradients | **Keep after rename and reduced-motion fix.** “Siri” is an Apple mark; do not ship that name. |
| `app-download-stack` | `motion`, `lucide-react` | defaults embed four remote third-party app icons | **Hold.** Replace remote icons and branded default app names; require caller data. |
| `apple-invites` | `motion`, `lucide-react`, `popmotion` | caller event cards | **Keep after rename.** Remove Apple naming/trade-dress cues before publication. |
| `book` | `motion` | caller content | **Keep.** Distinct page/cover interaction, not a page layout. |
| `cursor-follow` | `motion`; local cursor-position helper | caller label/content | **Keep.** Pointer-only enhancement needs touch fallback. |
| `dynamic-island` | `motion`, `lucide-react` | built-in demo states/content | **Keep after rename/content cleanup.** Apple product/trade-dress naming is not granted by MIT. |
| `exposure-slider` | `motion` | caller before/after media | **Keep.** Strong gesture component; verify keyboard range semantics. |
| `figma-comment` | `motion`, local data/avatar utility and click-outside helper | hardcoded remote author avatar, name, and Figma-derived name | **Hold.** Remove remote identity, flatten data helper, and rename generically. |
| `gooey-popover` | `gsap`; click-outside helper | inline SVG filter, caller content | **Hold.** Source is MIT, but GSAP uses its own no-charge Standard License rather than a permissive OSS license; legal policy must explicitly allow it. Reduced motion metadata also needs correction/QA. |
| `infinite-slider` | `motion`, `react-use-measure` | caller children | **Keep.** Cross-source duplicate with Fancy Simple Marquee. |
| `interactive-image-selector` | `motion`, `lucide-react` | caller images/options | **Keep.** Distinct image-selection control. |
| `phototab` | `motion`, `@radix-ui/react-tabs` | caller images/tabs | **Keep.** Media tabs, not a section. |
| `power-off-slide` | `motion`, `lucide-react` | caller action | **Keep.** Distinct hold/slide gesture; verify keyboard equivalent. |
| `social-selector` | `motion` | hardcoded X, Threads, and Bluesky SVGs/links/handle defaults | **Hold for default cleanup.** Require caller platforms; preserve accessibility labels. |
| `switchboard-card` | React/CSS | generated grid and caller text | **Keep after reduced-motion/determinism fix.** Random mode must be stable for SSR and stoppable. |
| `user-account-avatar` | `motion`, `lucide-react`, `@radix-ui/react-popover` | caller account/avatar | **Keep.** Strong compound account control. |

### Controls and basic UI — 26 source paths / 23 families

| Name / exact source directory | Dependencies | Decision and quality note |
| --- | --- | --- |
| `animated-file-upload` | `motion` | **Keep.** Verify real file-input semantics, validation, and drag/drop keyboard fallback. |
| `animated-input` | `motion` | **Keep.** Distinct animated field treatment. |
| `animated-o-t-p-input` | `motion`, `lucide-react`, `input-otp` | **Keep.** Preserve paste/autofill and accessible labeling. |
| `animated-progress-bar` | `motion` | **Keep.** Ensure semantic progress values. |
| `animated-stepper` | `motion` | **Keep.** Distinct progress/navigation component. |
| `animated-tabs` | `motion` | **Keep.** Verify ARIA tab keyboard model, not just visual indicator. |
| `animated-tags` | `motion`, `lucide-react` | **Keep.** Distinct add/remove token control. |
| `animated-toggle` | `motion` | **Keep.** Preserve switch/button semantics. |
| `animated-tooltip` | `motion` | **Keep.** Verify focus, escape, and delay behavior. |
| `basic-accordion` | `motion`, `lucide-react` | **Keep.** Standard but valid reusable component. |
| `basic-dropdown` | `motion`, `lucide-react` | **Merge into `dropdown-menu`.** Same product intent; retain only the stronger accessible implementation after QA. |
| `basic-modal` | `motion`, `lucide-react`, `usehooks-ts` | **Merge into `dialog`.** Same product intent; one dialog family. |
| `checkbox` | `motion`, `radix-ui` | **Keep.** Three tests; standard secondary candidate. |
| `combobox` | `motion`, `lucide-react`; local Smooth Button | **Keep.** Canonical searchable selection family. |
| `context-menu` | `motion` | **Keep.** Distinct pointer/keyboard menu type. |
| `dialog` | `motion`, `lucide-react`, `radix-ui` | **Keep.** Canonical modal/dialog family; three tests. |
| `drawer` | `motion` | **Keep.** Distinct spatial overlay; three tests. |
| `dropdown-menu` | `motion` | **Keep.** Canonical dropdown menu family. |
| `form` | `motion`, `lucide-react` | **Keep.** Reusable validation/form interaction, not a page template; three tests. |
| `notification-badge` | `motion` | **Keep.** Small but distinct state animation. |
| `radio-group` | `motion`, `radix-ui` | **Keep.** Standard secondary candidate. |
| `rich-popover` | `motion`, `lucide-react`, `@radix-ui/react-popover` | **Keep.** Strong compound overlay. |
| `scrubber` | `motion` | **Keep.** Distinct timeline/value control; verify range semantics. |
| `searchable-dropdown` | `motion`, `lucide-react` | **Merge into `combobox`.** Same searchable-selection intent. |
| `select` | `motion`, `lucide-react` | **Keep.** Standard selection component; three tests. |
| `skeleton-loader` | CSS/React | **Keep after reduced-motion fix.** Low differentiation; secondary priority. |

### Buttons — 5 source paths / 4 families

| Name / exact source directory | Dependencies | Decision and quality note |
| --- | --- | --- |
| `button-copy` | `motion`, `lucide-react` | **Keep.** Distinct async feedback action. |
| `clip-corners-button` | `motion`; local Smooth Button | **Merge into `smooth-button`.** Primarily a visual skin. |
| `dot-morph-button` | `motion`; local Smooth Button | **Keep.** Materially distinct morphing interaction. |
| `magnetic-button` | `motion`, `@radix-ui/react-slot`, `class-variance-authority` | **Keep.** Pointer enhancement needs touch/reduced-motion fallback. |
| `smooth-button` | `motion`, `@radix-ui/react-slot`, `class-variance-authority` | **Keep.** Canonical base action component. |

### Data, media, cards, and feedback — 17 source paths / 16 families

| Name / exact source directory | Dependencies | Inputs or external assets | Decision and quality note |
| --- | --- | --- | --- |
| `animated-avatar-group` | `motion` | caller avatars | **Keep.** Replace all demo identities/media. |
| `contribution-graph` | `motion` | caller contribution data | **Keep.** Data visualization component, not dashboard. |
| `github-stars-animation` | `motion`, `lucide-react` | runtime GitHub REST requests and avatar data | **Keep with API disclosure.** Add error/rate-limit handling; GitHub content/marks remain separate. |
| `image-metadata-preview` | `motion`, `lucide-react`, `react-use-measure` | caller image metadata | **Keep.** Distinct inspection overlay. |
| `number-flow` | `lucide-react` plus CSS animation | numeric value/control | **Keep after reduced-motion fix.** Canonical numeric-flow family. |
| `photo-stack` | `motion` | caller images | **Keep.** No tests upstream; replace demo media and verify gestures. |
| `price-flow` | CSS/React | two-digit number | **Merge into `number-flow`.** Specialized duplicate and also lacks reduced motion. |
| `reviews-carousel` | `motion`, `lucide-react` | caller reviews/avatars | **Keep.** Carousel component, not testimonial section; no fabricated content in production demos. |
| `tweet-card` | `react-tweet`; extra `client.tsx` | runtime X/Twitter post, profile, and media data | **Keep only with external-service policy.** Reduced motion is absent; API/content rights and branding are separate from MIT. |
| `product-card` | `motion`; local Smooth Button | caller product/media | **Keep.** Atomic card, not a pricing or product section. |
| `expandable-cards` | `motion`, `lucide-react` | caller cards/media | **Keep.** Reusable compound component despite upstream `layout` category. |
| `glow-hover-card` | `motion` | caller child | **Keep.** Distinct pointer surface; touch fallback required. |
| `job-listing-component` | `motion`, `usehooks-ts` | caller job data | **Keep.** Atomic listing/card, not career-page layout. |
| `scrollable-card-stack` | `motion` | caller cards | **Keep.** Reusable gesture component, not a section. |
| `basic-toast` | `motion`, `lucide-react` | caller message/action | **Keep.** Verify live-region and focus behavior. |
| `grid-loader` | `motion` | generated grid | **Keep.** Distinct loader; ensure accessible status text. |
| `prism-sweep-transition` | `motion` | caller children/state | **Keep.** Distinct masked transition despite upstream feedback category. |

### Navigation — 2 source paths / 2 families

| Name / exact source directory | Dependencies | Decision and quality note |
| --- | --- | --- |
| `breadcrumb` | `motion`, `lucide-react` | **Keep.** Standard secondary component; verify current-page semantics. |
| `pagination` | `motion`, `lucide-react`; local Smooth Button | **Keep.** Standard secondary component; preserve link/button semantics. |

### Text and typography — 29 source paths / 23 families

| Countable family | Exact source path(s) | Dependencies | Decision and quality note |
| --- | --- | --- | --- |
| Blur Out Up | `packages/smoothui/components/blur-out-up/index.tsx` | `motion` | **Keep.** No upstream test. |
| Vertical Letter Reveal | `bottom-up-letters/index.tsx`; `top-down-letters/index.tsx` | `motion` | **Keep as one family.** Direction is a prop/preset, not two components; neither has tests. |
| Depth Parallax Words | `depth-parallax-words/index.tsx` | `motion` | **Keep.** No upstream test. |
| Fade Through | `fade-through/index.tsx` | `motion` | **Keep.** No upstream test. |
| Focus Blur Resolve | `focus-blur-resolve/index.tsx` | `motion` | **Keep.** No upstream test. |
| Kinetic Center Build | `kinetic-center-build/index.tsx` | `motion` | **Keep.** More complex/distinct than a direction preset; test exists. |
| Line-by-Line Slide | `line-by-line-slide/index.tsx` | `motion` | **Keep.** No upstream test. |
| Mask Reveal Up | `mask-reveal-up/index.tsx` | `motion` | **Keep.** No upstream test. |
| Micro Scale Fade | `micro-scale-fade/index.tsx` | `motion` | **Keep.** No upstream test; low differentiation. |
| Per Character Rise | `per-character-rise/index.tsx` | `motion` | **Keep.** No upstream test. |
| Per Word Crossfade | `per-word-crossfade/index.tsx` | `motion` | **Keep.** No upstream test. |
| Reveal Text | `reveal-text/index.tsx` | `motion` | **Keep.** Flexible reveal primitive; test exists. |
| Scale Down Fade | `scale-down-fade/index.tsx` | `motion` | **Keep.** No upstream test; low differentiation. |
| Scramble Hover | `scramble-hover/index.tsx` | React timers | **Keep after reduced-motion fix.** Cross-source duplicate with Fancy Scramble Hover. |
| Scroll Reveal Paragraph | `scroll-reveal-paragraph/index.tsx` | `motion` | **Keep.** Distinct scroll-progress typography; test exists. |
| Shared Axis | `shared-axis-x/index.tsx`; `shared-axis-y/index.tsx`; `shared-axis-z/index.tsx` | `motion` | **Keep as one family.** Axis is configuration; all three lack tests. |
| Shine/Shimmer Text | `shine-text/index.tsx`; `shimmer-sweep/index.tsx` | `motion` | **Keep one after visual comparison.** Same gradient-sweep product intent; neither has tests. |
| Directional Short Slide | `short-slide-down/index.tsx`; `short-slide-right/index.tsx` | `motion` | **Keep as one family.** Direction is configuration; Right lacks a test. |
| Soft Blur In | `soft-blur-in/index.tsx` | `motion` | **Keep.** No upstream test. |
| Spring Scale In | `spring-scale-in/index.tsx` | `motion` | **Keep.** No upstream test. |
| Edge/Center Stagger | `stagger-from-center/index.tsx`; `stagger-from-edges/index.tsx` | `motion` | **Keep as one family.** Ordering is configuration; neither has tests. |
| Typewriter Text | `typewriter-text/index.tsx` | React timers | **Keep.** Cross-source duplicate with Fancy Typewriter. |
| Wave Text | `wave-text/index.tsx` | `motion` | **Keep.** Distinct looping/stagger behavior; test exists. |

### Visual transitions — 16 source paths / 4 families

| Countable family | Exact source path(s) | Dependencies | Decision and quality note |
| --- | --- | --- | --- |
| Aperture Blur Transition | `aperture-blur-transition/index.tsx` | `motion` | **Keep.** Independent DOM/filter transition; test and reduced-motion metadata exist. |
| Chroma Blur Transition | `chroma-blur-transition/index.tsx` | `motion` | **Keep.** Independent chromatic/filter transition. |
| SDF Transition Engine | `sdf-blob-transition/index.tsx`; wrappers `sdf-circle-transition`, `organic-merge-transition`, `radial-circles-transition`, `warped-circle-transition` | `motion`; wrappers depend on local SDF engine | **Keep as one configurable family.** Five directories share one engine; wrappers are presets, not five public products. |
| Shader Reveal Engine | `shader-reveal-transition/index.tsx`; wrappers `shader-reveal-circle-transition`, `shader-reveal-luma-transition`, `shader-reveal-noise-transition`, `shader-reveal-planetary-transition`, `shader-reveal-push-transition`, `shader-reveal-stripes-transition`, `shader-reveal-wipe-transition`, `shader-reveal-zoom-transition` | `motion`; wrappers depend on local shader engine | **Keep as one configurable family.** Nine directories share one WebGL engine; shader presets must not inflate the count. Verify WebGL fallback, context cleanup, texture CORS, and mobile GPU cost. |

### SmoothUI block and non-component exclusions

| Upstream area | Exact path | Decision |
| --- | --- | --- |
| 34 page sections | `packages/smoothui/blocks/**` | Exclude all CTA, FAQ, feature, footer, header, logo-cloud, pricing, stats, team, and testimonial entries. Layout work comes later. |
| Landing/docs components | `apps/docs/components/landing/**`, gallery/docs shell components | Exclude; they belong to the documentation website, not the public component registry. |
| Section demos | `apps/docs/examples/cta-*`, `faq-*`, `features-*`, `footer-*`, `header-*`, `logo-cloud-*`, `pricing-*`, `stats-*`, `team-*`, `testimonials-*` | Exclude; examples of blocked section packages. |
| Documentation public assets | `apps/docs/public/**` | Exclude. They are site media, sounds, screenshots, and branding, not component assets. |
| Shader/SDF wrappers | Paths listed in the transition table | Preserve as implementation presets only; count each engine once. |
| Direction/skin duplicates | Paths marked Merge above | Preserve only as modes or provenance references; not separate catalog entries. |

## Asset and identity release gates

| Component | Required action before import/release |
| --- | --- |
| SmoothUI App Download Stack | Delete the four hardcoded Back4App image URLs and branded default app list. Require caller-supplied icon data and use owned fixtures in demos. |
| SmoothUI Figma Comment | Remove the remote ImageKit avatar, Eduardo Calvo identity defaults, local data helper, and Figma name. Rename to a generic anchored comment/popover. |
| SmoothUI Social Selector | Replace author-specific profile links and handle. Treat platform SVG marks as optional caller content and follow each platform's brand rules. |
| SmoothUI Dynamic Island, Siri Orb, Apple Invites | Rename and restyle away from Apple product identifiers/trade dress. The MIT source license does not grant Apple trademark rights. |
| SmoothUI GitHub Stars Animation | Add explicit network/error/rate-limit handling and disclose GitHub API usage. Do not bundle fetched avatars. |
| SmoothUI Tweet Card | Review `react-tweet`, X/Twitter API/content terms, remote image behavior, and branding; provide a non-network fallback. |
| Fancy media components | Use owned or clearly licensed demo media only. Upstream example artwork and remote inspiration assets are not part of the source-code clearance. |
| Fancy variable-font components | Require a caller-provided, properly licensed variable font; do not copy the repository's public font files. |

## Priority for an import pass

The best first batch from these two sources is the smallest set that proves the difficult integrations without importing obvious duplicates:

1. Fancy: Text Rotate, Vertical Cut Reveal, Text Cursor Proximity, Text Along Path, Pixel Trail, Box Carousel, Elastic Line, Image Trail, Marquee Along SVG Path, and Stacking Cards.
2. SmoothUI: Animated Tabs, Dynamic Island after rename, Exposure Slider, Gooey Popover only after dependency-policy approval, Interactive Image Selector, Power Off Slide, User Account Avatar, Scroll Reveal Paragraph, one SDF engine, and one Shader Reveal engine.
3. Import one winner—not both—for Typewriter, Scramble Hover, numeric flow/ticker, and marquee/infinite slider.

This batch exercises text splitting, pointer motion, gestures, SVG, physics, compound accessibility, WebGL, assets, local registry dependencies, and reduced-motion paths. If these cannot pass the Taste Blocks gates, bulk-copying the remaining components would only multiply cleanup work.

## Release checklist

1. Re-fetch the pinned commit and verify the SHA before copying.
2. Copy only listed source and necessary helper files; flatten `@repo/*` and `@/` aliases without rewriting behavior.
3. Preserve Daniel Petho's and Eduardo Calvo's MIT notices in `THIRD_PARTY_NOTICES` and per-component provenance.
4. Pin and audit every third-party runtime package independently; do not describe GSAP as MIT.
5. Replace remote identities, images, branded defaults, and documentation-site media.
6. Collapse all paths marked Merge into a single configurable public family.
7. Add reduced-motion behavior to every animated Fancy component and the eight flagged SmoothUI components.
8. Run TypeScript/build, hydration, keyboard, screen-reader smoke, mobile/touch, cleanup, console, and visual-quality checks per candidate.
9. Count a component only after its live preview and installation payload both pass; never count docs, tests, helpers, engines, wrappers, or demos separately.
