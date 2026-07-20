# Kibo UI and ReUI component inventory

Audited 2026-07-20. This inventory is intentionally limited to reusable React components. It does not count website sections, page layouts, templates, dashboards, documentation examples, style variants, or alternate primitive implementations as separate components.

## Result

| Source | Pinned public commit | License at that commit | Distinct component candidates | Supporting demos | Excluded from the count |
| --- | --- | --- | ---: | ---: | --- |
| Kibo UI | [`3d63cdb15b79d972e3dc38a10997987672f9b263`](https://github.com/shadcnblocks/kibo/tree/3d63cdb15b79d972e3dc38a10997987672f9b263) | [MIT](https://github.com/shadcnblocks/kibo/blob/3d63cdb15b79d972e3dc38a10997987672f9b263/license.md) | 40 | 138 | 28 blocks, 1,101 patterns, the CSS-only Typography package, repo tooling |
| ReUI | [`93cea255c5a201ee3691283b682e1ae01a3b624c`](https://github.com/keenthemes/reui/tree/93cea255c5a201ee3691283b682e1ae01a3b624c) | [MIT](https://github.com/keenthemes/reui/blob/93cea255c5a201ee3691283b682e1ae01a3b624c/LICENSE.md) for files in the public repository | 17 | 195 | 1,019 Base examples plus their 1,019 Radix equivalents, paid blocks/icons/templates, the hook-only File Upload family |
| **Combined** |  |  | **57** | **333** | No variant inflation |

These are source-pool candidates, not automatic Taste Blocks admissions. Visual quality, accessibility, runtime behavior, dependency weight, and overlap with other sources still need the normal import gate.

## License and redistribution boundary

### Kibo UI

- The official repository and documentation describe Kibo UI as free and open source under MIT.
- MIT permits copying, modification, commercial use, sublicensing, and redistribution. Every distributed copy or substantial portion must retain the Kibo copyright notice and MIT permission notice.
- The pinned repository contains all 41 documented families. Forty are React component packages; `packages/typography/styles.css` is styles only and is therefore outside this component-only inventory.
- Kibo's links to premium Shadcnblocks offerings do not make those separate commercial products part of the MIT repository. Do not fetch or redistribute anything from a paid Shadcnblocks endpoint under the Kibo provenance record.

### ReUI

- The pinned public repository carries a repository-level MIT license: copyright 2025 KeenThemes Inc. Files copied from this exact public commit may be redistributed if the copyright and MIT permission notice remain with the distributed code.
- ReUI also sells Pro and Ultimate material under a separate [commercial license](https://reui.io/legal/license). That license prohibits redistribution, publishing the source, repackaging it as a component library, and using it to build a competing UI kit.
- Therefore the safe boundary is mechanical: import only files provably present in the public GitHub tree at the pinned commit. Never use an authenticated registry response, license key, paid download, Pro block, motion icon, or template as Taste Blocks source.
- The public site documents unauthenticated `c-*` components as free, but this inventory still excludes the 1,019 examples because they are configurations and composed demos, not 1,019 distinct component primitives.
- Preserve the ReUI MIT notice in Taste Blocks notices and attach the pinned source URL to every imported item. If a future registry response cannot be matched to a public MIT-licensed file hash, reject it pending written permission.

Dependencies listed below are package references, not bundled source. Their own licenses must be recorded by the dependency lockfile/SBOM; if any dependency code is vendored, its notice must also be copied.

## Kibo UI candidates

All source paths below are relative to the pinned Kibo repository. Unless stated otherwise, the source is `packages/<name>/index.tsx`. Every package depends on React; most also use Kibo's internal `@repo/shadcn-ui`, which must be mapped to the host project's shadcn primitives during import. The dependency column lists additional runtime packages only.

| Component family | Exact distributable source path(s) | Additional runtime dependencies | Official demos |
| --- | --- | --- | --- |
| Announcement | `packages/announcement/index.tsx` | None | `apps/docs/examples/announcement{,-tagless,-themes}.tsx` (3) |
| Avatar Stack | `packages/avatar-stack/index.tsx` | None | `apps/docs/examples/avatar-stack{,-hover}.tsx` (2) |
| Banner | `packages/banner/index.tsx` | `@radix-ui/react-use-controllable-state`, `lucide-react` | `apps/docs/examples/banner{,-inset,-themes}.tsx` (3) |
| Calendar | `packages/calendar/index.tsx` | `date-fns`, `jotai`, `lucide-react` | `apps/docs/examples/calendar{,-headless}.tsx` (2) |
| Choicebox | `packages/choicebox/index.tsx` | `lucide-react`, `radix-ui` | `apps/docs/examples/choicebox{,-inline}.tsx` (2) |
| Code Block | `packages/code-block/index.tsx`; `packages/code-block/server.tsx` | `@radix-ui/react-use-controllable-state`, `@shikijs/transformers`, `lucide-react`, `react-icons`, `shiki` | `apps/docs/examples/code-block{,-diff,-focus,-headless,-highlight-line,-highlight-word,-no-highlighting,-numberless,-theme}.tsx` (9) |
| Color Picker | `packages/color-picker/index.tsx` | `color`, `lucide-react`, `radix-ui` | `apps/docs/examples/color-picker.tsx` (1) |
| Combobox | `packages/combobox/index.tsx` | `@radix-ui/react-use-controllable-state`, `lucide-react` | `apps/docs/examples/combobox{,-controlled,-create-new,-fixed-width}.tsx` (4) |
| Comparison | `packages/comparison/index.tsx` | `lucide-react`, `motion` | `apps/docs/examples/comparison{,-event-handlers,-hover}.tsx` (3) |
| Contribution Graph | `packages/contribution-graph/index.tsx` | `date-fns` | `apps/docs/examples/contribution-graph{,-custom-blocks,-custom-footer,-custom-theme,-minimal,-size,-tooltip}.tsx` (7) |
| Credit Card | `packages/credit-card/index.tsx` | `react-svg-credit-card-payment-icons` | `apps/docs/examples/credit-card{,-amex,-apple,-back}.tsx` (4) |
| Cursor | `packages/cursor/index.tsx` | None | `apps/docs/examples/cursor{,-color,-message,-name-message,-name,-only}.tsx` (6) |
| Deck | `packages/deck/index.tsx` | `@radix-ui/react-use-controllable-state`, `lucide-react`, `motion` | `apps/docs/examples/deck{,-controlled,-product-cards}.tsx` (3) |
| Dialog Stack | `packages/dialog-stack/index.tsx` | `@radix-ui/react-use-controllable-state`, `radix-ui` | `apps/docs/examples/dialog-stack{,-controlled,-navigation,-six}.tsx` (4) |
| Dropzone | `packages/dropzone/index.tsx` | `lucide-react`, `react-dropzone` | `apps/docs/examples/dropzone{,-accept,-custom-empty-state,-image-preview,-min-max,-multiple}.tsx` (6) |
| Editor | `packages/editor/index.tsx` | `@floating-ui/dom`, Tiptap core/react/starter-kit/extensions/PM/suggestion packages, `fuse.js`, `lowlight`, `lucide-react`, `tippy.js` | `apps/docs/examples/editor.tsx` (1) |
| Gantt | `packages/gantt/index.tsx` | `@dnd-kit/core`, `@dnd-kit/modifiers`, `@uidotdev/usehooks`, `date-fns`, `jotai`, `lodash.throttle`, `lucide-react` | `apps/docs/examples/gantt{,-lanes,-no-sidebar,-read-only}.tsx` (4) |
| Glimpse | `packages/glimpse/index.tsx`; `packages/glimpse/server.tsx` | None | `apps/docs/examples/glimpse{,-custom}.tsx` (2) |
| Image Crop | `packages/image-crop/index.tsx` | `lucide-react`, `radix-ui`, `react-image-crop` | `apps/docs/examples/image-crop{,-circular,-custom}.tsx` (3) |
| Image Zoom | `packages/image-zoom/index.tsx` | `react-medium-image-zoom` | `apps/docs/examples/image-zoom{,-background,-margin}.tsx` (3) |
| Kanban | `packages/kanban/index.tsx` | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `tunnel-rat` | `apps/docs/examples/kanban{,-simple}.tsx` (2) |
| List | `packages/list/index.tsx` | `@dnd-kit/core`, `@dnd-kit/modifiers` | `apps/docs/examples/list{,-simple}.tsx` (2) |
| Marquee | `packages/marquee/index.tsx` | `react-fast-marquee` | `apps/docs/examples/marquee{,-no-fade,-raw,-spacing}.tsx` (4) |
| Mini Calendar | `packages/mini-calendar/index.tsx` | `@radix-ui/react-use-controllable-state`, `date-fns`, `lucide-react`, `radix-ui` | `apps/docs/examples/mini-calendar{,-controlled,-custom,-days}.tsx` (4) |
| Pill | `packages/pill/index.tsx` | `lucide-react` | `apps/docs/examples/pill{,-avatar-group,-avatar,-button,-delta,-icon,-indicator,-status}.tsx` (8) |
| QR Code | `packages/qr-code/index.tsx`; `packages/qr-code/server.tsx` | `culori`, `qrcode` | `apps/docs/examples/qr-code{,-robust,-server,-styling}.tsx` (4) |
| Rating | `packages/rating/index.tsx` | `@radix-ui/react-use-controllable-state`, `lucide-react` | `apps/docs/examples/rating{,-colors,-controlled,-icon,-size}.tsx` (5) |
| Reel | `packages/reel/index.tsx`; `packages/reel/reel-controlled.tsx` | `@radix-ui/react-use-controllable-state`, `lucide-react`, `motion` | `apps/docs/examples/reel{,-custom,-images,-minimal}.tsx` (4) |
| Relative Time | `packages/relative-time/index.tsx` | `@radix-ui/react-use-controllable-state` | `apps/docs/examples/relative-time{,-controlled,-format-date,-format-time}.tsx` (4) |
| Sandbox | `packages/sandbox/index.tsx` | `@codesandbox/sandpack-react` | `apps/docs/examples/sandbox{,-no-file-explorer}.tsx` (2) |
| Snippet | `packages/snippet/index.tsx` | `lucide-react` | `apps/docs/examples/snippet{,-npm}.tsx` (2) |
| Spinner | `packages/spinner/index.tsx` | `lucide-react` | `apps/docs/examples/spinner{,-customization,-variants}.tsx` (3) |
| Status | `packages/status/index.tsx` | None | `apps/docs/examples/status{,-custom}.tsx` (2) |
| Stories | `packages/stories/index.tsx` | None | `apps/docs/examples/stories{,-avatars,-images}.tsx` (3) |
| Table | `packages/table/index.tsx` | `@tanstack/react-table`, `jotai`, `lucide-react` | `apps/docs/examples/table{,-simple}.tsx` (2) |
| Tags | `packages/tags/index.tsx` | `lucide-react` | `apps/docs/examples/tags{,-create,-filter}.tsx` (3) |
| Theme Switcher | `packages/theme-switcher/index.tsx` | `@radix-ui/react-use-controllable-state`, `lucide-react`, `motion` | `apps/docs/examples/theme-switcher{,-uncontrolled}.tsx` (2) |
| Ticker | `packages/ticker/index.tsx` | None | `apps/docs/examples/ticker{,-currency,-inline,-percent}.tsx` (4) |
| Tree | `packages/tree/index.tsx` | `lucide-react`, `motion` | `apps/docs/examples/tree{,-controlled,-custom-icons,-no-lines,-simple}.tsx` (5) |
| Video Player | `packages/video-player/index.tsx` | `media-chrome` | `apps/docs/examples/video-player.tsx` (1) |

### Kibo assets and integration notes

- The 40 candidate package directories contain only TSX plus package/TypeScript metadata; no fonts, photos, videos, shaders, or other static assets are bundled.
- Image Crop, Image Zoom, Reel, Stories, and Video Player require caller-supplied media. Demo media is not part of the component and must not be copied without separate provenance.
- Credit Card obtains card artwork through `react-svg-credit-card-payment-icons`; Cursor, Spinner, and Ticker contain inline SVG markup. QR Code generates output at runtime.
- Replace Kibo's `@repo/shadcn-ui/*` imports with Taste Blocks' existing shadcn paths. This is a compatibility edit, not a new component.
- Keep the server files for Code Block, Glimpse, and QR Code, and the controlled Reel helper with their parent family. They are not extra components.

## ReUI candidates

ReUI publishes Base UI and Radix trees. They are alternate implementations of the same API and must never be counted twice. The table uses the Base tree as the canonical source. The corresponding Radix alternative is the same relative path under `registry-reui/bases/radix/reui/`. Use one flavor per imported component, selected for the host project.

The generated install artifact for each candidate is `public/r/styles/base-nova/<name>.json`; other style folders are visual variants and do not create additional components.

| Component family | Exact canonical source path(s) | Package dependencies; registry dependencies | Base demos |
| --- | --- | --- | --- |
| Alert | `registry-reui/bases/base/reui/alert.tsx` | `class-variance-authority`; none | `registry-reui/bases/base/components/alert/c-alert-*.tsx` (20) |
| Autocomplete | `registry-reui/bases/base/reui/autocomplete.tsx` | `@base-ui/react`, `class-variance-authority`; `scroll-area` | `registry-reui/bases/base/components/autocomplete/c-autocomplete-*.tsx` (12) |
| Badge | `registry-reui/bases/base/reui/badge.tsx` | `@base-ui/react`, `class-variance-authority`; none | `registry-reui/bases/base/components/badge/c-badge-*.tsx` (25) |
| Data Grid | all 10 TSX files under `registry-reui/bases/base/reui/data-grid/` | `@base-ui/react`, DnD Kit core/modifiers/sortable/utilities, `@tanstack/react-table`, `@tanstack/react-virtual`, `class-variance-authority`; badge, button, checkbox, dropdown menu, input, popover, select, separator, skeleton, spinner | `registry-reui/bases/base/components/data-grid/c-data-grid-*.tsx` (29) |
| Date Selector | `registry-reui/bases/base/reui/date-selector.tsx` | `date-fns`, `react-day-picker`; button, calendar, input, scroll area, tabs, `use-mobile` | `registry-reui/bases/base/components/date-selector/c-date-selector-*.tsx` (4) |
| Filters | `registry-reui/bases/base/reui/filters.tsx` | `@base-ui/react`, `class-variance-authority`; button, button group, dropdown menu, input, input group, kbd, scroll area, tooltip | `registry-reui/bases/base/components/filters/c-filters-*.tsx` (9) |
| Frame | `registry-reui/bases/base/reui/frame.tsx` | `class-variance-authority`; none | `registry-reui/bases/base/components/frame/c-frame-*.tsx` (19) |
| Icon Stack | `registry-reui/bases/base/reui/icon-stack.tsx` | None; none | `registry-reui/bases/base/components/icon-stack/c-icon-stack-*.tsx` (6) |
| Kanban | `registry-reui/bases/base/reui/kanban.tsx` | `@base-ui/react`, DnD Kit core/sortable/utilities; none | `registry-reui/bases/base/components/kanban/c-kanban-*.tsx` (5) |
| Number Field | `registry-reui/bases/base/reui/number-field.tsx` | `@base-ui/react`, `class-variance-authority`; label | `registry-reui/bases/base/components/number-field/c-number-field-*.tsx` (6) |
| Phone Input | `registry-reui/bases/base/reui/phone-input.tsx` | `react-phone-number-input`; button, combobox, input, scroll area | `registry-reui/bases/base/components/phone-input/c-phone-input-*.tsx` (8) |
| Rating | `registry-reui/bases/base/reui/rating.tsx` | `class-variance-authority`; none | `registry-reui/bases/base/components/rating/c-rating-*.tsx` (9) |
| Scrollspy | `registry-reui/bases/base/reui/scrollspy.tsx` | None; none | `registry-reui/bases/base/components/scrollspy/c-scrollspy-*.tsx` (2) |
| Sortable | `registry-reui/bases/base/reui/sortable.tsx` | `@base-ui/react`, DnD Kit core/sortable/utilities; none | `registry-reui/bases/base/components/sortable/c-sortable-*.tsx` (7) |
| Stepper | `registry-reui/bases/base/reui/stepper.tsx` | None; none | `registry-reui/bases/base/components/stepper/c-stepper-*.tsx` (15) |
| Timeline | `registry-reui/bases/base/reui/timeline.tsx` | `@base-ui/react`; none | `registry-reui/bases/base/components/timeline/c-timeline-*.tsx` (12) |
| Tree | `registry-reui/bases/base/reui/tree.tsx` | `@base-ui/react`, `@headless-tree/core`; none | `registry-reui/bases/base/components/tree/c-tree-*.tsx` (7) |

### ReUI assets and integration notes

- The 17 canonical primitive sources contain no bundled photos, fonts, videos, or other static assets.
- Phone Input imports flag SVG components from `react-phone-number-input/flags`; Icon Stack requires caller-provided icon children. These are dependency/runtime content, not ReUI media assets.
- Twelve canonical source files still import ReUI's site-only `IconPlaceholder`: Autocomplete; five Data Grid helpers; Date Selector; Filters; Number Field; Phone Input; Rating; and Tree. The generated public registry JSON retains that site import. An importer must replace each placeholder with the declared open icon equivalent before the component can be portable. Reject the component if that mapping cannot be made deterministic.
- The Base and Radix implementations sometimes share dependencies despite their names. Trust the pinned registry JSON rather than assuming a complete Base-to-Radix dependency swap.

## Rejected paths

### Kibo

- `apps/docs/content/blocks/*.mdx` and their `apps/docs/examples/` block demos: 28 page sections such as hero, pricing, footer, CTA, and testimonial. Rejected because layouts/sections are out of scope.
- `packages/patterns/**`: 1,101 shadcn usage examples. Rejected because they are mostly configurations and presentational variants of base primitives, not 1,101 distinct components.
- `packages/typography/styles.css`: styling only, no React component implementation.
- `packages/shadcn-ui/**`: upstream base primitives and internal plumbing, not Kibo-original component candidates.
- `packages/stories` is not rejected: despite its name, it is the actual Stories media component. Do not confuse it with repo documentation or Storybook files.

### ReUI

- `registry-reui/bases/base/components/**/c-*.tsx`: 1,019 composed examples. Useful as demos, but excluded from the component count to prevent variant inflation.
- `registry-reui/bases/radix/components/**/c-*.tsx`: the same 1,019 examples in the alternate primitive flavor; duplicate by design.
- `registry-reui/bases/radix/reui/**`: allowed only as an alternative implementation, never as another component count.
- `registry-reui/bases/{base,radix}/hooks/use-file-upload.ts` and the ten File Upload examples: the reusable core is a hook, not a React component. Keep it out of this component-only batch unless a later scope explicitly admits hooks.
- `registry/bases/**/ui/**`: shadcn foundation primitives, not ReUI-original candidates and likely duplicates of the dedicated shadcn source inventory.
- All authenticated Pro/Ultimate registry material, including 485+ paid blocks, 562 paid motion icons and full-page templates: commercially licensed and expressly non-redistributable.
- `public/screenshots/blocks/**`, `public/videos/**`, site marketing assets, and website implementation files: previews/site assets, not distributable components.

## Import gate for these sources

1. Pin the exact source commit and file path above; store the upstream blob hash with the Taste Blocks item.
2. Copy only the component family source, never its block, layout, or page demo.
3. Choose one ReUI primitive flavor and one style; do not count flavors or themes as components.
4. Retain the source repository's complete MIT copyright and permission notice in `THIRD_PARTY_NOTICES` and link it from item metadata.
5. Record all external packages and registry dependencies exactly; do not inline or vendor dependency code without its own license review.
6. Replace only project-local import aliases, demo data, and ReUI icon placeholders. Record every edit in provenance.
7. Supply original Taste Blocks demo data/media. Do not copy remote demo images, avatars, videos, brand marks, or marketing copy without separate provenance.
8. Run the normal accessibility, reduced-motion, responsive, build, and duplicate gates before changing a candidate to verified.
