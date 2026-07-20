# Navigation and menu gap source research

Checked: 2026-07-20
Scope: permissively licensed open-source React components in the `Navigation and menus` taxonomy only: menus, command surfaces, tabs, breadcrumbs, pagination, docks, and context/navigation primitives.
Boundary: no complete navbars, headers, sidebars, app shells, page sections, layouts, templates, or dashboards.
Status: source research only. No component source, package, asset, or registry entry was imported in this pass.

## Decision

This pass found **one accepted additive candidate**, **two conditional additive candidates**, and **one replacement-only command-surface candidate**. The count stays deliberately small because the existing inventories already cover most standard menu, command, tabs, toolbar, context-menu, pagination, breadcrumb, scroll-spy, and dock behavior.

| Bucket | Source family | Additive count | Decision |
| --- | --- | ---: | --- |
| Accept | [React Responsive Pagination](#accept--react-responsive-pagination) | **1** | A measured-width pagination renderer is materially different from the conventional pagination examples already inventoried. Add a small semantic/localization wrapper. |
| Conditional | [React Spectrum responsive breadcrumbs](#conditional--react-spectrum-responsive-breadcrumbs) | **1** | Strong adaptive collapse and accessibility, but only viable if the maintained Spectrum dependency and style cost pass an isolated bundle review. |
| Conditional | [PatternFly drilldown menu](#conditional--patternfly-drilldown-menu) | **1** | A real hierarchical drill-in interaction, but it needs RTL and reduced-motion/focus fixes and carries the PatternFly style system. |
| Replacement only | [kbar action palette](#replacement-only--kbar-action-palette) | **0** | Deeper than the shortlisted 9ui Command, but still the same command-surface family. It may replace that winner; it must not be added beside it. |
| Reject from additive count | [Audited rejections](#rejected-and-zero-count-sources) | **0** | Duplicate behavior, source-only foundations, missing provenance, non-permissive terms, or interaction-quality failures. |

The current shortlist projects **17 of 55** Navigation and menu components, leaving a gap of **38**. Applying only the accepted result would project **18**, leaving **37**. If both conditional candidates later clear their named gates, the maximum projection from this pass is **20**, leaving **35**. kbar is net-zero because it can only replace the existing command winner.

These are research projections, not verified registry counts. Every candidate remains non-release until provenance, dependency, build, preview, keyboard, touch, RTL, reduced-motion, responsive, and cleanup gates pass.

## Global deduplication result

- Responsive Pagination wins a new `measured adaptive pagination` family. Origin UI, Flowbite, 9ui, Park UI, and other conventional pagination examples expose page/ellipsis styling or fixed responsive presets; they do not measure the rendered control and choose the widest fitting composition.
- React Spectrum wins a conditional `measured breadcrumb collapse into menu` family. Its hidden-middle overflow behavior is not a cosmetic breadcrumb variant. `BreadcrumbItem`, its overflow trigger, and its overflow menu are anatomy of this one family, not extra counts.
- PatternFly wins a conditional `drill-in hierarchical menu` family. It replaces the current panel with a child level and maintains a back path. That is different from an adjacent flyout or context menu. `Menu`, `MenuItem`, `DrilldownMenu`, `MenuBreadcrumb`, search, and groups together count as **one** component.
- kbar collides with the already shortlisted 9ui Command. Its action registry, nested action pages, shortcut routing, fuzzy search, virtualization, and history make it a credible alternative, not a second command count. All kbar exports together count as **one** replacement family.
- `@szhsin/react-menu` is a strong implementation but collides with the already represented dropdown, submenu, and context-menu contracts. It is useful comparison material only.
- Radial-menu implementations were treated as one possible behavior family. No audited implementation passed the combined license, keyboard, focus, touch, RTL, and reduced-motion bar, so the family contributes zero.
- Presets, directions, animation settings, submenu depths, breadcrumb item counts, pagination widths, examples, hooks, helpers, and component anatomy never add entries.

## Accept — React Responsive Pagination

Count: **1 additive candidate** (`Responsive Pagination`).

| Field | Evidence |
| --- | --- |
| Repository | [`jonelantha/react-responsive-pagination`](https://github.com/jonelantha/react-responsive-pagination) |
| Pinned commit | [`a4b8427065ff62e4f8187215da4d5157a0345809`](https://github.com/jonelantha/react-responsive-pagination/tree/a4b8427065ff62e4f8187215da4d5157a0345809), 2026-06-30 |
| Package | `react-responsive-pagination@2.14.0` |
| Canonical component | [`packages/react-responsive-pagination/src/index.tsx`](https://github.com/jonelantha/react-responsive-pagination/blob/a4b8427065ff62e4f8187215da4d5157a0345809/packages/react-responsive-pagination/src/index.tsx) |
| Complete source closure | [`packages/react-responsive-pagination/src/`](https://github.com/jonelantha/react-responsive-pagination/tree/a4b8427065ff62e4f8187215da4d5157a0345809/packages/react-responsive-pagination/src) |
| Package manifest | [`packages/react-responsive-pagination/package.json`](https://github.com/jonelantha/react-responsive-pagination/blob/a4b8427065ff62e4f8187215da4d5157a0345809/packages/react-responsive-pagination/package.json) |
| License | [MIT, copyright 2021 jonelantha](https://github.com/jonelantha/react-responsive-pagination/blob/a4b8427065ff62e4f8187215da4d5157a0345809/LICENSE) |
| Notices | Preserve that MIT notice. No separate root `NOTICE` or additional embedded-source notice was present at the pinned snapshot. |

### Why it is countable

The component observes the rendered container and content widths, builds narrow-to-wide page compositions, and selects the widest composition that actually fits. That is a behavior contract, not a breakpoint or visual preset. It responds to font, label, theme, and container changes without the caller guessing a page count per breakpoint.

The count is one. `narrowBehaviour`, `labelBehaviour`, presets, individual pagination items, ellipses, width hooks, and composition helpers are configuration or anatomy.

### Dependency and source boundary

- Runtime dependencies are React/ReactDOM peers plus `prop-types`. The manifest supports React 16.8 through 19.
- A maintained package dependency is the smallest integration. If source is copied instead, copy the complete internal closure under `packages/react-responsive-pagination/src/`; `index.tsx` alone is not self-contained.
- The important internal paths are `hooks/usePaginationItems.tsx`, `hooks/useWidestComposition.tsx`, `hooks/useWidthCalculator.tsx`, `hooks/useAvailableWidth.ts`, `hooks/useContentWidth.ts`, `hooks/useFoutDetector.tsx`, `compositions/index.ts`, `compositions/ranges.ts`, `paginationItem.ts`, `compositionItem.ts`, `labelBehaviour.tsx`, `narrowBehaviour.ts`, and the referenced `helpers/*` files.
- Do not import the upstream Bootstrap-like theme as the Taste Blocks design. Supply local Tailwind classes while preserving the measured composition behavior.

### Interaction and accessibility audit

| Gate | Result |
| --- | --- |
| Keyboard | **Good with native controls.** Items render as native anchors or buttons, so Tab and activation do not require custom key handling. Disabled previous/next controls use disabled or `aria-disabled` semantics depending on rendering mode. |
| Focus | **Good.** The component does not move focus unexpectedly when its visible composition changes. Host testing must confirm that a currently focused item is not removed during a live resize. |
| Semantics | **Small wrapper required.** It renders a `<ul>`, uses `aria-current="page"`, labels navigation controls, and hides ellipses from assistive technology, but it does not render the containing `<nav>`. Taste Blocks must wrap it in `<nav aria-label="Pagination">`. |
| RTL | **Integration gate.** There is no explicit RTL mode. Page order itself is DOM/logical, but the defaults are `«` for previous and `»` for next with English labels. Supply localized labels and direction-aware icons; test visual order and previous/next meaning under `dir="rtl"`. |
| Touch | **Good with host sizing.** Native anchors/buttons provide pointer and touch activation. Taste Blocks still owns a minimum 44 px target in the preview skin. |
| Reduced motion | **Not applicable.** The source does not author a transition or animation. Do not add one just to make the preview feel active. |
| Responsive | **Core strength.** `ResizeObserver`-based measurement selects a fitting composition rather than hiding items with a fixed breakpoint. |

### Import gate

Accept into the import queue only as the single measured-pagination family. The registry adapter must add the labeled `nav`, localized/direction-aware previous and next controls, local focus-visible styling, and a deterministic ResizeObserver test. These are narrow host adaptations; they do not rewrite the upstream interaction.

## Conditional — React Spectrum responsive breadcrumbs

Count: **1 conditional additive candidate** (`Responsive Breadcrumbs`).

| Field | Evidence |
| --- | --- |
| Repository | [`adobe/react-spectrum`](https://github.com/adobe/react-spectrum) |
| Pinned commit | [`57a1c82c87100e80ebefe8f79626bea5d8499302`](https://github.com/adobe/react-spectrum/tree/57a1c82c87100e80ebefe8f79626bea5d8499302), 2026-07-18 |
| Package | `@react-spectrum/breadcrumbs@3.10.1` |
| Behavior implementation | [`packages/@adobe/react-spectrum/src/breadcrumbs/Breadcrumbs.tsx`](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/%40adobe/react-spectrum/src/breadcrumbs/Breadcrumbs.tsx) |
| Item implementation | [`packages/@adobe/react-spectrum/src/breadcrumbs/BreadcrumbItem.tsx`](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/%40adobe/react-spectrum/src/breadcrumbs/BreadcrumbItem.tsx) |
| Public package entry | [`packages/@react-spectrum/breadcrumbs/src/index.ts`](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/%40react-spectrum/breadcrumbs/src/index.ts) |
| Package manifest | [`packages/@react-spectrum/breadcrumbs/package.json`](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/%40react-spectrum/breadcrumbs/package.json) |
| License | [Apache-2.0](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/LICENSE); the two implementation files carry `Copyright 2020 Adobe` headers |
| Required notice | [`NOTICE.txt`](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/NOTICE.txt) |

### Distinct behavior

The component measures its container, keeps the current/root context according to policy, and collapses hidden middle crumbs into an accessible overflow menu. It also supports `showRoot` and multiline behavior. This is materially different from the fixed breadcrumb renderers already present in the 9ui, SmoothUI, Flowbite, Origin UI, and Park UI inventories.

This remains one component. `BreadcrumbItem`, the overflow ActionButton, MenuTrigger, and hidden-item menu are its required anatomy.

### Dependency and license gate

- The public package depends on `@adobe/react-spectrum`, `react-stately`, and `@swc/helpers`, with React/ReactDOM peers. The actual implementation also consumes React Aria breadcrumb, menu, focus-ring, locale, hover, resize-observer, and private utility modules plus Spectrum CSS.
- The newer Spectrum 2 implementation is even more coupled to internal style macros. It is not a smaller source-copy route.
- Prefer the maintained package if this candidate proceeds. Flattening the implementation into Tailwind would require a broad menu/button/focus/i18n/style closure and is beyond minimal adaptation.
- A source copy or modification must preserve the Apache license, Adobe file headers, applicable `NOTICE.txt` material, and a prominent modified-file notice. Transitive package licenses and notices must also be emitted by the normal dependency audit.

### Interaction and accessibility audit

| Gate | Result |
| --- | --- |
| Keyboard/focus | **Strong.** `useBreadcrumbs`, `useBreadcrumbItem`, `FocusRing`, and the React Spectrum Menu/ActionButton path provide native link behavior, focus-visible treatment, menu keyboard interaction, and focus handling. |
| Semantics | **Strong.** The component obtains labeled `nav` props from React Aria, and the current item semantics are owned by `useBreadcrumbItem`. The overflow trigger is a named button rather than a decorative ellipsis. |
| RTL | **Strong.** `BreadcrumbItem` reads `useLocale()`, reverses its direction-sensitive visual treatment for RTL, and Spectrum uses logical-direction infrastructure. Still run the host RTL screenshot and keyboard suite. |
| Touch | **Strong.** Links and the overflow ActionButton/MenuTrigger use React Aria press interaction rather than hover-only behavior. |
| Reduced motion | **No breadcrumb-specific motion found.** Any animation supplied by the transitive Spectrum menu/overlay layer must still pass the host reduced-motion check. |
| Responsive | **Core strength.** A resize observer recomputes visible crumbs from actual width and exposes an overflow menu for the hidden path. |

### Conditions before counting

1. Install the pinned package in an isolated preview and record the actual client bundle and CSS impact.
2. Verify that its Spectrum provider/style requirements do not leak into unrelated Tailwind/shadcn previews.
3. Run keyboard, screen-reader-name, touch, RTL, narrow-width, zoom, and reduced-motion checks on the packaged overflow menu.
4. If the only viable route is a broad source port of Spectrum internals, reject it rather than recreating the component.

Until all four pass, this remains conditional and does not enter the accepted subtotal.

## Conditional — PatternFly drilldown menu

Count: **1 conditional additive candidate** (`Drilldown Menu`).

| Field | Evidence |
| --- | --- |
| Repository | [`patternfly/patternfly-react`](https://github.com/patternfly/patternfly-react) |
| Pinned commit | [`8c89c01501b2db096a23267b585cb46cf438aaea`](https://github.com/patternfly/patternfly-react/tree/8c89c01501b2db096a23267b585cb46cf438aaea), 2026-07-17 |
| Package | `@patternfly/react-core@6.6.0` in the pinned manifest; the workspace publishes this line under its prerelease tag |
| Complete component source | [`packages/react-core/src/components/Menu/`](https://github.com/patternfly/patternfly-react/tree/8c89c01501b2db096a23267b585cb46cf438aaea/packages/react-core/src/components/Menu) |
| Basic drilldown example | [`MenuWithDrilldown.tsx`](https://github.com/patternfly/patternfly-react/blob/8c89c01501b2db096a23267b585cb46cf438aaea/packages/react-core/src/components/Menu/examples/MenuWithDrilldown.tsx) |
| Breadcrumb drilldown example | [`MenuWithDrilldownBreadcrumbs.tsx`](https://github.com/patternfly/patternfly-react/blob/8c89c01501b2db096a23267b585cb46cf438aaea/packages/react-core/src/components/Menu/examples/MenuWithDrilldownBreadcrumbs.tsx) |
| Filtered drilldown example | [`MenuFilterDrilldown.tsx`](https://github.com/patternfly/patternfly-react/blob/8c89c01501b2db096a23267b585cb46cf438aaea/packages/react-core/src/components/Menu/examples/MenuFilterDrilldown.tsx) |
| Package manifest | [`packages/react-core/package.json`](https://github.com/patternfly/patternfly-react/blob/8c89c01501b2db096a23267b585cb46cf438aaea/packages/react-core/package.json) |
| License | [MIT, copyright 2019 Red Hat, Inc.](https://github.com/patternfly/patternfly-react/blob/8c89c01501b2db096a23267b585cb46cf438aaea/LICENSE) |
| Notices | Preserve the MIT notice. No separate root `NOTICE` file was present at the pinned snapshot. Audit notices for installed PatternFly packages independently. |

### Distinct behavior

This menu navigates into a child hierarchy by replacing the visible menu panel, supports arbitrary depth, can expose a breadcrumb/back path, and can combine drilldown with filtering or lazy submenu functions. It is not another adjacent submenu, context menu, or dropdown skin.

The source closure includes `Menu.tsx`, `MenuItem.tsx`, `DrilldownMenu.tsx`, `MenuBreadcrumb.tsx`, `MenuList.tsx`, `MenuContent.tsx`, `MenuContext.ts`, `MenuContainer.tsx`, and the selected search/group support. These are one drilldown-menu product, not separate counts.

### Dependency and integration boundary

- `@patternfly/react-core` depends on `@patternfly/react-icons`, `@patternfly/react-styles`, `@patternfly/react-tokens`, `focus-trap`, `react-dropzone`, and `tslib`; React 17 through 19 are peers. The Menu path mainly consumes PatternFly styles, tokens, icons, and shared helpers, but the package-level install surface is still material.
- Prefer a maintained package import if the isolated dependency/style test passes. A Tailwind source port would need to reproduce PatternFly's menu CSS state machine and is not automatically minimal.
- Import one focused drilldown example, not the whole PatternFly example catalog and not its page layouts.

### Interaction and accessibility audit

| Gate | Result |
| --- | --- |
| Keyboard | **Substantial existing support.** The Menu keyboard handler covers vertical traversal and activation; drilldown handles Enter/Space and moves focus to the child or parent target. `MenuContainer` closes on Escape/Tab and can restore focus to the toggle. |
| Semantics | **Good base.** Menu/listbox roles, menuitem roles, `aria-haspopup`, expanded/current/disabled states, labels, and link/button elements are present. The final example must choose one coherent menu role model. |
| Focus | **Conditional.** Focus after drill-in/out is queued until `transitionend`. The current source needs a no-transition path or timeout fallback so focus cannot stall when motion is disabled or an event is missed. |
| RTL | **Patch required.** Flyout logic defaults to the right, and literal ArrowRight/ArrowLeft handling is present without a locale-direction branch. Map open/close keys and visual direction from document direction, then test nested levels under `dir="rtl"`. |
| Touch | **Good base.** Drill-in items use click-capable buttons/links, so the hierarchy is reachable without hover. Verify nested targets at mobile sizes. |
| Reduced motion | **Patch required.** Drilldown relies on a CSS transition and a global `transitionend` listener; no `prefers-reduced-motion` branch was found in the Menu source. Disable the transition and complete the state/focus move synchronously for reduced motion. |

### Conditions before counting

1. Prove an isolated `@patternfly/react-core` Menu import has acceptable JavaScript, CSS, and style-isolation cost.
2. Add direction-aware ArrowLeft/ArrowRight behavior and mirror the drill transition in RTL.
3. Add a reduced-motion path that completes state and focus movement without waiting for `transitionend`.
4. Run keyboard traversal, Escape/focus restoration, touch, RTL, zoom, and nested-depth tests.

If the dependency cannot be isolated or those interaction fixes become a rewrite, reject the source. Do not count its breadcrumb, filter, groups, or depth examples separately.

## Replacement only — kbar action palette

Additive count: **0**. Possible replacement count: **1**, only if it replaces the shortlisted 9ui Command family.

| Field | Evidence |
| --- | --- |
| Repository | [`timc1/kbar`](https://github.com/timc1/kbar) |
| Pinned commit | [`7a9af307bc186461009214b09d271aeb57e83c8f`](https://github.com/timc1/kbar/tree/7a9af307bc186461009214b09d271aeb57e83c8f), 2025-07-28 |
| Package | `kbar@0.1.0-beta.47` |
| Complete runtime source | [`src/`](https://github.com/timc1/kbar/tree/7a9af307bc186461009214b09d271aeb57e83c8f/src) |
| Package manifest | [`package.json`](https://github.com/timc1/kbar/blob/7a9af307bc186461009214b09d271aeb57e83c8f/package.json) |
| License | [MIT, copyright 2021 Tim](https://github.com/timc1/kbar/blob/7a9af307bc186461009214b09d271aeb57e83c8f/LICENSE) |
| Embedded provenance concern | [`src/tinykeys.ts`](https://github.com/timc1/kbar/blob/7a9af307bc186461009214b09d271aeb57e83c8f/src/tinykeys.ts) says it was copied from Tinykeys, but kbar does not carry Tinykeys' separate notice. Current upstream Tinykeys is [MIT, copyright 2020 Jamie Kyle](https://github.com/jamiebuilds/tinykeys/blob/9f321b0d1e556d737b418d7a1e8c1770ef63a6aa/LICENSE). |

### Why it is a credible replacement

kbar provides a registered action graph, nested action pages, fuzzy matching, shortcut sequences, undo/redo command history, and virtualized results. `KBarProvider`, portal, positioner, animator, search, results, matching hooks, and action/history classes are one command-palette implementation.

Runtime dependencies are `@radix-ui/react-portal`, `fast-equals`, `fuse.js`, `react-virtual`, and `tiny-invariant`, with React/ReactDOM peers through 19.

### Quality and blockers

- Search uses `role="combobox"`, `aria-expanded`, `aria-controls`, and `aria-activedescendant`; results expose `listbox`/`option` semantics and `aria-selected`.
- ArrowUp/ArrowDown and Ctrl+P/Ctrl+N traverse results, Enter activates, Backspace leaves a nested action page, Escape closes, and focus is restored to the element that was active before opening.
- The portal/positioner do not themselves provide a dialog role, `aria-modal`, a focus trap, or background inerting. Tab can escape into the page. A replacement must put kbar inside the project's audited Dialog primitive rather than inventing another overlay model.
- `KBarAnimator` uses the Web Animations API and ResizeObserver height animation without a reduced-motion check. Durations must become zero and state changes remain synchronous when reduced motion is requested.
- Vertical result navigation is direction-neutral, but there is no explicit RTL/localization layer. Preview copy, nested-page affordances, and shortcut presentation still need RTL QA.
- Pointer selection exists, but this keyboard-first surface needs an obvious touch trigger and mobile target sizing in the preview.
- Source copying must retain the kbar MIT notice and resolve the embedded Tinykeys notice/provenance. Replacing the copied snapshot with an installed, separately licensed Tinykeys dependency is preferable if API-compatible.

Do not add this beside 9ui Command. Re-evaluate the command-family winner only if Taste Blocks explicitly wants the action-registry and nested-history contract and accepts the beta dependency plus overlay fixes.

## Rejected and zero-count sources

| Source | Pinned evidence | License / notices | Count | Reason |
| --- | --- | --- | ---: | --- |
| `@szhsin/react-menu` | [`b7cde9916a1522dd911b7127baa59543d1755283`](https://github.com/szhsin/react-menu/tree/b7cde9916a1522dd911b7127baa59543d1755283), source [`src/`](https://github.com/szhsin/react-menu/tree/b7cde9916a1522dd911b7127baa59543d1755283/src), package `4.5.2` | [MIT, copyright 2020 Zheng Song](https://github.com/szhsin/react-menu/blob/b7cde9916a1522dd911b7127baa59543d1755283/LICENSE) | **0** | High-quality dropdown/context/submenu implementation with native menu semantics, typeahead, nested keyboard handling, focus restoration, pointer support, SSR, and tests. It is nevertheless globally duplicate behavior. RTL uses literal left/right submenu keys, and optional CSS transitions need a reduced-motion override. Keep only as replacement evidence. |
| Animate UI Radial Menu / Radial Nav | [`efeb96ffd7a3b7a4868667e4ac3c346620fb3044`](https://github.com/imskyleen/animate-ui/tree/efeb96ffd7a3b7a4868667e4ac3c346620fb3044); [`radial-menu/index.tsx`](https://github.com/imskyleen/animate-ui/blob/efeb96ffd7a3b7a4868667e4ac3c346620fb3044/apps/www/registry/components/community/radial-menu/index.tsx), [`radial-nav/index.tsx`](https://github.com/imskyleen/animate-ui/blob/efeb96ffd7a3b7a4868667e4ac3c346620fb3044/apps/www/registry/components/community/radial-nav/index.tsx) | [MIT plus Commons Clause, copyright 2025 Elliot Sutton](https://github.com/imskyleen/animate-ui/blob/efeb96ffd7a3b7a4868667e4ac3c346620fb3044/LICENSE.md) | **0** | The current license forbids selling or redistributing the components themselves, including in a bundle, so it is not permissive source for Taste Blocks. Independently, Radial Nav lacks a complete roving/arrow-key menu model and neither wrapper adds reduced-motion handling. Legal rejection is decisive. |
| `@psychobolt/react-pie-menu` | [`7ffa9aeed4bac8d6d3248f412bd3776c3d77288c`](https://github.com/psychobolt/react-pie-menu/tree/7ffa9aeed4bac8d6d3248f412bd3776c3d77288c); [`src/PieMenu/PieMenu.tsx`](https://github.com/psychobolt/react-pie-menu/blob/7ffa9aeed4bac8d6d3248f412bd3776c3d77288c/src/PieMenu/PieMenu.tsx), [`packages/circle-ui-react/src/Pie/`](https://github.com/psychobolt/react-pie-menu/tree/7ffa9aeed4bac8d6d3248f412bd3776c3d77288c/packages/circle-ui-react/src/Pie) | [MIT, copyright 2026 psychobolt](https://github.com/psychobolt/react-pie-menu/blob/7ffa9aeed4bac8d6d3248f412bd3776c3d77288c/LICENSE) | **0** | The radial geometry is implemented, but the audited component path has no menu roles, accessible names, focus model, keyboard navigation, RTL policy, or reduced-motion handling. Adding those would be an interaction redesign, not a narrow adaptation. `Slice`, `Pie`, `Circle`, and `Sector` are anatomy, not counts. |
| `spaceymonk/react-radial-menu` | [`53537e02624f07a5221297cabbb8705ba70e7175`](https://github.com/spaceymonk/react-radial-menu/tree/53537e02624f07a5221297cabbb8705ba70e7175); [`src/components/`](https://github.com/spaceymonk/react-radial-menu/tree/53537e02624f07a5221297cabbb8705ba70e7175/src/components) | `package.json` says MIT, but the pinned repository contains no license text or copyright notice | **0** | Provenance is incomplete for redistribution, and the implementation is click/div/CSS-transition driven without a complete ARIA, keyboard, focus, RTL, or reduced-motion model. Reject unless upstream supplies the license artifact and substantially improves interaction quality. |
| Norigin Spatial Navigation | [`58b5da03e2054961db895f19b493b99863465854`](https://github.com/NoriginMedia/Norigin-Spatial-Navigation/tree/58b5da03e2054961db895f19b493b99863465854); [`packages/react/src/useFocusable.ts`](https://github.com/NoriginMedia/Norigin-Spatial-Navigation/blob/58b5da03e2054961db895f19b493b99863465854/packages/react/src/useFocusable.ts), [`packages/core/src/SpatialNavigation.ts`](https://github.com/NoriginMedia/Norigin-Spatial-Navigation/blob/58b5da03e2054961db895f19b493b99863465854/packages/core/src/SpatialNavigation.ts) | [MIT, copyright 2022 NoriginMedia](https://github.com/NoriginMedia/Norigin-Spatial-Navigation/blob/58b5da03e2054961db895f19b493b99863465854/LICENSE) | **0** | Strong directional/remote-focus foundation with explicit RTL tests, but the React surface is hooks/context around a navigation engine, not a visible installable component. The rules exclude hooks/helpers as counts. It could support a future original TV/grid component; it does not close this source-component gap itself. |

### Unpin-able leads

These were not promoted to candidates because an immutable public source path could not be established:

- `@tvuikit/navigation-react@0.2.0` advertises an open-source spatial-navigation React package and names `github.com/dobreadi/tvkit`, but that repository was unavailable during this audit. No repository SHA, source path, license artifact, copyright notice, or tests could be verified.
- `react-web-radial-menu@1.0.6` names `github.com/crocogiciel/react-web-radial-menu`, but the repository was unavailable during this audit. Mutable npm metadata saying MIT is not enough for source-copy provenance.
- `@gregogun/radial-menu@0.1.0-alpha.0` advertises MIT and a Base UI radial context menu, but its published metadata exposes no verifiable repository URL. There is no immutable source/license path to record.

They remain zero-count search leads. Do not import tarball code or reconstruct a component from documentation screenshots.

## Recommended follow-up order

1. Import and validate only React Responsive Pagination behind the required semantic/localization wrapper.
2. Measure React Spectrum Breadcrumbs in an isolated build. Accept it only if package and CSS isolation are reasonable.
3. Measure PatternFly's Menu slice, then decide whether the RTL and transition/focus patches remain narrow enough.
4. Leave kbar out unless a deliberate command-winner replacement is requested.
5. Do not spend implementation time rehabilitating the rejected radial sources; a future radial-menu candidate should arrive with its keyboard/focus model and permissive provenance already intact.
