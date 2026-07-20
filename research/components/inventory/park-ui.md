# Park UI component inventory

Checked: 2026-07-20
Scope: React source-copy components only. No page sections, layouts, templates, dashboards, framework duplicates, or cosmetic variants.
Status: legally usable under MIT; technically conditional because the source is built for Panda CSS, not a Tailwind/shadcn stack. This is a source review, not legal advice.

## Decision

| Gate | Result |
| --- | --- |
| Official source | [`chakra-ui/park-ui`](https://github.com/chakra-ui/park-ui) |
| Pinned revision | [`102769cc91a9d36753dbc5893c74b7954b495efe`](https://github.com/chakra-ui/park-ui/commit/102769cc91a9d36753dbc5893c74b7954b495efe), current `main` HEAD when checked |
| Commit date | 2026-02-21 13:21:10 UTC |
| Upstream license | [MIT](https://github.com/chakra-ui/park-ui/blob/102769cc91a9d36753dbc5893c74b7954b495efe/LICENSE), copyright 2025 cschroeter |
| Upstream React registry entries | 62 `registry:ui` entries plus 56 recipes |
| Countable Taste Blocks candidates | **46 materially distinct component families** |
| Excluded from the count | **16** wrappers, layout helpers, or cosmetic specializations |
| Candidate demo coverage | **294** React demo files; demos and variants do not increase the component count |
| Immediate Tailwind/shadcn drop-ins | **0** without a Panda integration or an explicit style port |

Park UI is a good source for accessible, composable application controls. It is not a React Bits-style source of expressive text effects, shaders, or high-concept motion. Use its candidates as the functional foundation of Taste Blocks, not as evidence that the creative-effects target has been met.

## License and redistribution

The repository has one root MIT license covering the reviewed source. It permits use, copying, modification, publication, distribution, sublicensing, and sale. A redistribution must include the upstream copyright notice and the MIT permission notice in all copies or substantial portions.

For Taste Blocks:

- Keep the Park UI MIT notice in the project-wide third-party notices and attach the pinned repository, commit, and original paths to every imported component.
- Record modifications. A Panda-to-Tailwind rewrite is a derivative adaptation, not an original Taste Blocks component.
- Do not present Park UI code as exclusively authored by Taste Blocks.
- Prefer dependencies over vendoring Ark UI, React, Panda, or Lucide source. If dependency code or icon source is copied, preserve its own license too.
- The component implementations contain no bundled image, font, video, or shader assets. Several demos load third-party images; those URLs and images are demo-only and must not be redistributed as if MIT-covered assets.

The root package is private and the project distributes source through its CLI/registry. The review therefore pins source paths at the commit rather than assuming a published `@park-ui/react` package can be vendored.

## Technical dependency boundary

Versions are taken from `components/react/package.json` and `packages/preset/package.json` at the pinned commit.

| Dependency | Pinned by Park UI | License | Role |
| --- | --- | --- | --- |
| `@ark-ui/react` | `5.30.0` | MIT | Headless behavior, state machines, accessibility, component anatomy |
| `lucide-react` | `0.563.0` | ISC | Default icons in selected components |
| `react` / `react-dom` | peer `>=18.0.0`; workspace `19.2.3` | MIT | Runtime |
| `@pandacss/dev` | `1.8.1` | MIT | Compiles Park UI recipes and theme tokens |

Every listed source component imports generated `styled-system/jsx` and, where styled, `styled-system/recipes`. Copying only the `.tsx` file is insufficient. A faithful Panda integration needs the matching recipe plus the Park UI preset/theme tokens, keyframes, animation styles, conditions, colors, and Panda code generation. A Tailwind-based Taste Blocks registry must instead port the recipe semantics and test all Ark state selectors. Do not publish either route as install-ready until its clean-project build and live demo pass.

Dependency key used below: `Ark` = `@ark-ui/react@5.30.0`; `Lucide` = `lucide-react@0.563.0`; `React` = React 18 or newer; every recipe also requires `@pandacss/dev@1.8.1`. `Support` names are upstream registry dependencies that must ship with the component but are not counted as additional component families here.

Quality labels:

- **Strong functional**: substantial state, keyboard, focus, overlay, selection, or data interaction supplied by Ark UI; highest-value Park UI candidates.
- **Foundation**: materially distinct and useful, but visually conventional. It does not satisfy a React Bits-level creative-motion bar by itself.

## Candidate inventory

All component paths begin at the pinned repository root. Demo paths follow `components/react/src/examples/<name>/`; the number is the count of non-Storybook `.tsx` demos in that directory.

| Component | Component source | Recipe source | Runtime and support | Demos | Quality | Assets |
| --- | --- | --- | --- | ---: | --- | --- |
| Accordion | `components/react/src/components/ui/accordion.tsx` | `packages/preset/src/recipes/accordion.ts` | Ark, Lucide, React | `accordion/` (1) | Strong functional | None |
| Alert | `components/react/src/components/ui/alert.tsx` | `packages/preset/src/recipes/alert.ts` | Ark, Lucide, React | `alert/` (7) | Foundation | None |
| Avatar | `components/react/src/components/ui/avatar.tsx` | `packages/preset/src/recipes/avatar.ts` | Ark, Lucide, React | `avatar/` (11) | Foundation | Remote GitHub avatar URLs in demos only |
| Badge | `components/react/src/components/ui/badge.tsx` | `packages/preset/src/recipes/badge.ts` | Ark, React | `badge/` (4) | Foundation | None |
| Breadcrumb | `components/react/src/components/ui/breadcrumb.tsx` | `packages/preset/src/recipes/breadcrumb.ts` | Ark, Lucide, React | `breadcrumb/` (9) | Foundation | None |
| Button | `components/react/src/components/ui/button.tsx` | `packages/preset/src/recipes/button.ts` | Ark, React; Support: `group`, `loader` | `button/` (11) | Foundation | None |
| Card | `components/react/src/components/ui/card.tsx` | `packages/preset/src/recipes/card.ts` | Ark, React | `card/` (6) | Foundation | Remote Unsplash images in demos only |
| Carousel | `components/react/src/components/ui/carousel.tsx` | `packages/preset/src/recipes/carousel.ts` | Ark, React | `carousel/` (6) | Strong functional | Remote image URLs in one demo only |
| Checkbox | `components/react/src/components/ui/checkbox.tsx` | `packages/preset/src/recipes/checkbox.ts` | Ark, React | `checkbox/` (12) | Foundation | None |
| Clipboard | `components/react/src/components/ui/clipboard.tsx` | `packages/preset/src/recipes/clipboard.ts` | Ark, Lucide, React | `clipboard/` (4) | Foundation | None |
| Collapsible | `components/react/src/components/ui/collapsible.tsx` | `packages/preset/src/recipes/collapsible.ts` | Ark, React | `collapsible/` (3) | Foundation | None |
| Color Picker | `components/react/src/components/ui/color-picker.tsx` | `packages/preset/src/recipes/color-picker.ts` | Ark, React | `color-picker/` (1) | Strong functional | None |
| Combobox | `components/react/src/components/ui/combobox.tsx` | `packages/preset/src/recipes/combobox.ts` | Ark, Lucide, React | `combobox/` (3) | Strong functional | None |
| Date Picker | `components/react/src/components/ui/date-picker.tsx` | `packages/preset/src/recipes/date-picker.ts` | Ark, React | `date-picker/` (1) | Strong functional | None |
| Dialog | `components/react/src/components/ui/dialog.tsx` | `packages/preset/src/recipes/dialog.ts` | Ark, React | `dialog/` (14) | Strong functional | None |
| Drawer | `components/react/src/components/ui/drawer.tsx` | `packages/preset/src/recipes/drawer.ts` | Ark, React | `drawer/` (3) | Strong functional | None |
| Editable | `components/react/src/components/ui/editable.tsx` | `packages/preset/src/recipes/editable.ts` | Ark, React | `editable/` (5) | Strong functional | None |
| Field | `components/react/src/components/ui/field.tsx` | `packages/preset/src/recipes/field.ts` | Ark, React | `field/` (6) | Foundation | None |
| Fieldset | `components/react/src/components/ui/fieldset.tsx` | `packages/preset/src/recipes/fieldset.ts` | Ark, React | `fieldset/` (3) | Foundation | None |
| File Upload | `components/react/src/components/ui/file-upload.tsx` | `packages/preset/src/recipes/file-upload.ts` | Ark, Lucide, React; Support: `span` through `@/components/ui` | `file-upload/` (8) | Strong functional | Browser-selected files only; no bundled asset |
| Hover Card | `components/react/src/components/ui/hover-card.tsx` | `packages/preset/src/recipes/hover-card.ts` | Ark, React | `hover-card/` (6) | Strong functional | Remote GitHub avatar URL in demos only |
| Input | `components/react/src/components/ui/input.tsx` | `packages/preset/src/recipes/input.ts` | Ark, React | `input/` (10) | Foundation | None |
| Menu | `components/react/src/components/ui/menu.tsx` | `packages/preset/src/recipes/menu.ts` | Ark, Lucide, React | `menu/` (8) | Strong functional | Remote GitHub avatar URL in one demo only |
| Number Input | `components/react/src/components/ui/number-input.tsx` | `packages/preset/src/recipes/number-input.ts` | Ark, Lucide, React | `number-input/` (13) | Strong functional | None |
| Pagination | `components/react/src/components/ui/pagination.tsx` | `packages/preset/src/recipes/pagination.ts` | Ark, Lucide, React; Support: `icon-button` and its button chain | `pagination/` (1) | Foundation | None |
| Pin Input | `components/react/src/components/ui/pin-input.tsx` | `packages/preset/src/recipes/pin-input.ts` | Ark, React | `pin-input/` (11) | Strong functional | None |
| Popover | `components/react/src/components/ui/popover.tsx` | `packages/preset/src/recipes/popover.ts` | Ark, React | `popover/` (11) | Strong functional | None |
| Progress | `components/react/src/components/ui/progress.tsx` | `packages/preset/src/recipes/progress.ts` | Ark, React | `progress/` (10) | Foundation | None |
| Radio Card Group | `components/react/src/components/ui/radio-card-group.tsx` | `packages/preset/src/recipes/radio-card-group.ts` | Ark, React | `radio-card-group/` (2) | Foundation | None |
| Radio Group | `components/react/src/components/ui/radio-group.tsx` | `packages/preset/src/recipes/radio-group.ts` | Ark, React | `radio-group/` (6) | Foundation | None |
| Rating Group | `components/react/src/components/ui/rating-group.tsx` | `packages/preset/src/recipes/rating-group.ts` | Ark, Lucide, React | `rating-group/` (9) | Strong functional | None |
| Scroll Area | `components/react/src/components/ui/scroll-area.tsx` | `packages/preset/src/recipes/scroll-area.ts` | Ark, React | `scroll-area/` (6) | Strong functional | None; virtualization demo additionally uses `@tanstack/react-virtual` |
| Segment Group | `components/react/src/components/ui/segment-group.tsx` | `packages/preset/src/recipes/segment-group.ts` | Ark, React | `segment-group/` (5) | Foundation | None |
| Select | `components/react/src/components/ui/select.tsx` | `packages/preset/src/recipes/select.ts` | Ark, Lucide, React | `select/` (3) | Strong functional | None |
| Skeleton | `components/react/src/components/ui/skeleton.tsx` | `packages/preset/src/recipes/skeleton.ts` | Ark, React | `skeleton/` (6) | Foundation | None |
| Slider | `components/react/src/components/ui/slider.tsx` | `packages/preset/src/recipes/slider.ts` | Ark, React | `slider/` (1) | Strong functional | None |
| Spinner | `components/react/src/components/ui/spinner.tsx` | `packages/preset/src/recipes/spinner.ts` | Ark, React | `spinner/` (7) | Foundation | None |
| Splitter | `components/react/src/components/ui/splitter.tsx` | `packages/preset/src/recipes/splitter.ts` | Ark, React | `splitter/` (5) | Strong functional | None |
| Switch | `components/react/src/components/ui/switch.tsx` | `packages/preset/src/recipes/switch.ts` | Ark, React | `switch/` (9) | Foundation | None |
| Table | `components/react/src/components/ui/table.tsx` | `packages/preset/src/recipes/table.ts` | Ark, React | `table/` (8) | Foundation | None |
| Tabs | `components/react/src/components/ui/tabs.tsx` | `packages/preset/src/recipes/tabs.ts` | Ark, React | `tabs/` (6) | Strong functional | None |
| Tags Input | `components/react/src/components/ui/tags-input.tsx` | `packages/preset/src/recipes/tags-input.ts` | Ark, Lucide, React | `tags-input/` (3) | Strong functional | None |
| Textarea | `components/react/src/components/ui/textarea.tsx` | `packages/preset/src/recipes/textarea.ts` | Ark, React | `textarea/` (9) | Foundation | None |
| Toast | `components/react/src/components/ui/toast.tsx` | `packages/preset/src/recipes/toast.ts` | Ark, Lucide, React; Support: `close-button`, `icon`, `spinner` and transitive button support | `toast/` (7) | Strong functional | None |
| Toggle Group | `components/react/src/components/ui/toggle-group.tsx` | `packages/preset/src/recipes/toggle-group.ts` | Ark, React | `toggle-group/` (3) | Foundation | None |
| Tooltip | `components/react/src/components/ui/tooltip.tsx` | `packages/preset/src/recipes/tooltip.ts` | Ark, React | `tooltip/` (11) | Strong functional | Remote avatar URL in one demo only |

## Exclusions

These files may be required as transitive support for a candidate, but they do not count toward the 46-component total.

| Upstream entry | Source | Reason not counted |
| --- | --- | --- |
| Absolute Center | `components/react/src/components/ui/absolute-center.tsx` | Positioning/layout helper, not a component experience |
| Close Button | `components/react/src/components/ui/close-button.tsx` | Preset specialization of Icon Button |
| Code | `components/react/src/components/ui/code.tsx` | Styled text primitive |
| Display Value | `components/react/src/components/ui/display-value.tsx` | Formatting wrapper around Span; no independent recipe |
| Group | `components/react/src/components/ui/group.tsx` | Layout/composition helper |
| Heading | `components/react/src/components/ui/heading.tsx` | Typography wrapper |
| Icon | `components/react/src/components/ui/icon.tsx` | Styling wrapper for supplied icon content |
| Icon Button | `components/react/src/components/ui/icon-button.tsx` | Button specialization; cosmetic/form-factor variant |
| Image | `components/react/src/components/ui/image.tsx` | Thin image primitive and no dedicated demos |
| Input Addon | `components/react/src/components/ui/input-addon.tsx` | Styling accessory for Input, not an independent behavior |
| Input Group | `components/react/src/components/ui/input-group.tsx` | Input composition/layout helper |
| Kbd | `components/react/src/components/ui/kbd.tsx` | Styled text primitive |
| Link | `components/react/src/components/ui/link.tsx` | Styled anchor primitive |
| Loader | `components/react/src/components/ui/loader.tsx` | Composition of Absolute Center, Span, and Spinner; no dedicated demos |
| Span | `components/react/src/components/ui/span.tsx` | Native-element styling wrapper |
| Text | `components/react/src/components/ui/text.tsx` | Typography wrapper |

Also excluded entirely: Solid/framework ports of the same component families, recipes as separate items, color-token registry items, Storybook stories, demo variants, docs-only website components, marketing cards, navigation/site chrome, the Figma Pro kit, and every full-page or section-level composition.

## Import gate

Park UI may contribute at most 46 countable component families. Before any one enters Taste Blocks:

1. Copy from the pinned component and recipe paths, not from an unpinned docs snippet.
2. Choose one styling route: install Panda and the required Park preset pieces, or perform an explicit Tailwind/CSS port. Do not mix half of each.
3. Replace demo-only remote media with clearly licensed local test assets or asset-free examples.
4. Preserve the Park UI MIT notice and dependency provenance.
5. Build the component in a clean Next.js consumer, exercise its documented keyboard behavior, test reduced motion where recipes animate, and verify the live catalog preview.
6. Count the component family once. Sizes, colors, placements, orientations, controlled examples, and framework ports remain demos or props, never additional components.

The official project already supplies a CLI and source registry. Reuse its dependency graph and metadata as the ingestion source; do not invent a second scraper for Park UI.
