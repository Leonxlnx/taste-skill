# Forms and feedback gap source research

Checked: 2026-07-20
Scope: permissively licensed open-source React components in the Forms and feedback taxonomy only: specialized inputs, selectors, validation, editing, and recoverable feedback.
Boundary: no complete forms, login/checkout flows, page sections, layouts, templates, dashboards, cosmetic input variants, fake submission behavior, or wrappers without a distinct runtime contract.
Status: source research only. No source, package, asset, registry entry, commit, or push was made in this pass.

## Decision

This pass found **three accepted additive candidates**, **ten conditional additive candidates**, and **two replacement-only upstreams**. The ceiling is intentionally lower than the 20-item shortlist gap because masks, date pickers, file upload, tags, color, time, toast, and ordinary controls already have canonical winners.

| Bucket | Source family | Additive count | Decision |
| --- | --- | ---: | --- |
| Accept | Rich Textarea | **1** | Native textarea behavior plus a synchronized, assistive-technology-hidden decoration layer and IME-aware caret geometry. |
| Accept | React Error Boundary | **1** | A real render-failure capture/reset state machine; the hook and HOC are support, not extra counts. |
| Accept | React Dual Listbox | **1** | Transfers ownership between available and selected pools, including filtering, ordering, native form validity, keyboard transfer, and RTL. |
| Conditional | React Aria Components | **3** | Number Field, segmented Date Field, and Date Range Picker are strong, but require the package closure, Apache notice handling, and collision-specific previews. |
| Conditional | rc-component hierarchical selectors | **2** | Cascader and Tree Select are distinct hierarchical selection mechanisms, but require maintained packages and controlled-form adapters. |
| Conditional | Specialized editors | **2** | Simple Code Editor and Markdown Editor are distinct from the shortlisted TipTap rich-text editor, subject to the named focus, resize, RTL, and security gates. |
| Conditional | Structured value editors | **2** | Cron Editor and Query Builder each edit one structured value, but their dependency and accessibility costs must pass before import. |
| Conditional | Error Summary | **1** | Useful validation-navigation feedback, but the young source needs narrow focus, reduced-motion, RTL, and test repairs. |
| Replacement only | React Textarea Autosize and Sonner | **0** | Both are credible canonical upstreams, but their behaviors are already represented in the shortlisted shadcn textarea and toast families. |
| Reject | Audited collisions and structural failures | **0** | Duplicate masks/currency inputs, inaccessible canvas/JSON/spreadsheet editors, and dependency-heavy duplicate PrimeReact controls. |

The current shortlist projects **35 of 55** Forms and feedback components, leaving **20**. Applying only the three accepted results would project **38**, leaving **17**. If all ten conditional candidates later clear their named gates, the maximum projection from this pass is **48**, leaving **7**.

Those are research projections, not verified registry counts. The shortlist and manifest remain unchanged. Helpers, hooks, parsers, buttons, field segments, toolbar commands, popup anatomy, adapters, modes, presets, and demos never add entries.

## Global deduplication result

- Rich Textarea wins one decorated-native-text-entry family. Its sibling Rich Input, regex renderer, autocomplete demos, and auto-height option are anatomy or modes, not additional components.
- React Error Boundary wins one render-crash recovery family. It does not collide with Error Summary: one catches React render failures; the other navigates users to invalid submitted fields.
- React Dual Listbox wins one transfer-list family. It is not Dice Listbox, which selects within one collection, and not Cult Sortable List, which reorders one collection.
- React Aria Number Field is eligible only for locale-aware numeric parsing, stepping, spinbutton semantics, and numeric validation. Currency styling alone collides with Dice Mask Input.
- React Aria Date Field is eligible for locale/calendar-aware segmented entry without a popup. Date Range Picker is eligible only as the single coordinated range family and must replace, not accompany, the unselected shadcn and Tremor range examples.
- Cascader and Tree Select remain separate because a path-by-columns drill and an expandable tree-in-combobox are different keyboard and disclosure contracts. Nodes, columns, checkboxes, search, and async loading are internal anatomy.
- Simple Code Editor, Markdown Editor, and the shortlisted Kibo TipTap Editor represent code editing, Markdown source/preview, and structured rich text respectively. Syntax themes, toolbar commands, preview modes, and language grammars do not add counts.
- Cron Editor and Query Builder are allowed only as embedded editors of one value. Their demos must not become scheduler pages, filter screens, or complete forms.
- React Textarea Autosize is already used by shortlisted <code>input-group-textarea-examples.tsx</code>. Sonner collides with shortlisted SmoothUI <code>basic-toast</code> and the already inventoried 9ui Sonner wrapper. Either may replace a weaker implementation, but both are net-zero.

## Accept — Rich Textarea

Count: **1 additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [inokawa/rich-textarea](https://github.com/inokawa/rich-textarea) |
| Pinned commit | [044fbb88065f634203fee79ac2d745911505c36f](https://github.com/inokawa/rich-textarea/tree/044fbb88065f634203fee79ac2d745911505c36f), 2026-07-13 |
| Package | <code>rich-textarea@0.27.1</code> |
| Canonical component | [src/textarea.tsx](https://github.com/inokawa/rich-textarea/blob/044fbb88065f634203fee79ac2d745911505c36f/src/textarea.tsx) |
| Complete runtime closure | [src](https://github.com/inokawa/rich-textarea/tree/044fbb88065f634203fee79ac2d745911505c36f/src): <code>textarea.tsx</code>, <code>dom.ts</code>, <code>observer.ts</code>, <code>selection.ts</code>, <code>useStatic.ts</code>, <code>useIsomorphicLayoutEffect.ts</code>, <code>utils.tsx</code>, and <code>types.ts</code> |
| Optional sibling/support | <code>src/input.tsx</code> and <code>src/renderers/regex/*</code>; neither adds a count |
| License | [MIT, copyright 2021 inokawa](https://github.com/inokawa/rich-textarea/blob/044fbb88065f634203fee79ac2d745911505c36f/LICENSE) |
| Notices/assets | Preserve the MIT notice. No separate NOTICE or required media asset was present. |

### Behavior, dependencies, and integration

- The real control remains a native textarea. A pointer-inert, <code>aria-hidden</code> backdrop mirrors layout and renders caller-defined decoration while the native element owns text, selection, form behavior, and accessibility.
- The observer closure synchronizes computed typography, scroll position, size, value, selection, and caret geometry. Composition events and Safari's post-composition key event are handled explicitly.
- All native textarea props pass through, including <code>name</code>, <code>form</code>, <code>required</code>, <code>aria-*</code>, <code>value</code>, <code>defaultValue</code>, and constraint attributes. React Hook Form and similar libraries can use the native ref/controller path without inventing a second value.
- Runtime dependencies: none beyond the React peer, which is <code>>=16.14</code>. No animation or media dependency.
- This is not a second autosizing textarea. The optional <code>autoHeight</code> behavior remains a mode and does not displace the existing shadcn autosize family.

### Interaction and accessibility

| Gate | Result |
| --- | --- |
| Keyboard/focus | **Strong native base.** Editing, selection, clipboard, undo, focus, and assistive-technology interaction remain on the textarea. The backdrop does not enter the tab order. |
| Touch | **Strong native base.** Mobile selection and virtual-keyboard behavior are delegated to the textarea rather than a contenteditable surface. |
| RTL | **Good source basis, final test required.** The backdrop copies computed <code>direction</code> and <code>textAlign</code>. Run mixed-direction, horizontal-scroll, and caret-position tests before release. |
| Validation | **Native.** Labeling, required state, browser constraints, and framework validation props pass through. Decorations must never be the only error signal. |
| Reduced motion | **Not applicable.** No motion is authored. |

Accept one plain-text decoration/highlighting preview. Do not count autocomplete, mentions, regex highlighting, Rich Input, or auto-height as separate components, and do not duplicate Dice Mention.

## Accept — React Error Boundary

Count: **1 additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [bvaughn/react-error-boundary](https://github.com/bvaughn/react-error-boundary) |
| Pinned commit | [1ba91f439ecd500f72464ab35feb29545195c999](https://github.com/bvaughn/react-error-boundary/tree/1ba91f439ecd500f72464ab35feb29545195c999), 2026-07-12 |
| Package | <code>react-error-boundary@6.1.2</code> |
| Canonical component | [lib/components/ErrorBoundary.tsx](https://github.com/bvaughn/react-error-boundary/blob/1ba91f439ecd500f72464ab35feb29545195c999/lib/components/ErrorBoundary.tsx) |
| Component closure | [lib/types.ts](https://github.com/bvaughn/react-error-boundary/blob/1ba91f439ecd500f72464ab35feb29545195c999/lib/types.ts), [lib/context/ErrorBoundaryContext.ts](https://github.com/bvaughn/react-error-boundary/blob/1ba91f439ecd500f72464ab35feb29545195c999/lib/context/ErrorBoundaryContext.ts), and [lib/index.ts](https://github.com/bvaughn/react-error-boundary/blob/1ba91f439ecd500f72464ab35feb29545195c999/lib/index.ts) |
| License | [MIT, copyright 2020 Brian Vaughn](https://github.com/bvaughn/react-error-boundary/blob/1ba91f439ecd500f72464ab35feb29545195c999/LICENSE) |
| Notices/assets | Preserve the MIT notice. No separate NOTICE, runtime asset, or runtime package dependency was present. |

### Why it is countable

The component catches descendant render failures, exposes the thrown value, calls <code>onError</code>, supports static/render-prop/component fallbacks, resets imperatively, invokes <code>onReset</code>, and resets when <code>resetKeys</code> change. That is a distinct failure-and-recovery state machine, not a styling wrapper.

The exported <code>useErrorBoundary</code> hook and <code>withErrorBoundary</code> HOC are integration support and add zero. Prefer the maintained package; a source copy must also adapt the source's <code>import.meta.env.DEV</code> check to the host build.

### Interaction and accessibility

- The boundary deliberately owns no markup, keyboard behavior, touch behavior, direction, or animation; the fallback owns them. Taste Blocks' preview must supply a named native Retry button wired to <code>resetErrorBoundary</code>, visible focus, and a concise error announcement.
- Use <code>role="alert"</code> for a newly surfaced local failure, or focus a labeled fallback region when task continuity requires it. Do not automatically move focus for every background error.
- The retry action must actually reset the failing state or invalidate the relevant request. A decorative button that only hides the fallback is fake functionality and is not allowed.
- Document the upstream boundary: it does not catch server-rendering errors, its own errors, event-handler errors, or arbitrary asynchronous failures unless those failures are passed to the boundary path.

## Accept — React Dual Listbox

Count: **1 additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [jakezatecky/react-dual-listbox](https://github.com/jakezatecky/react-dual-listbox) |
| Pinned commit | [a71657198ebd51971cea0161d41fd5304ebda885](https://github.com/jakezatecky/react-dual-listbox/tree/a71657198ebd51971cea0161d41fd5304ebda885), 2026-06-17 |
| Package | <code>react-dual-listbox@6.1.0</code> |
| Canonical component | [src/js/components/DualListBox.jsx](https://github.com/jakezatecky/react-dual-listbox/blob/a71657198ebd51971cea0161d41fd5304ebda885/src/js/components/DualListBox.jsx) |
| Complete source closure | [src/js](https://github.com/jakezatecky/react-dual-listbox/tree/a71657198ebd51971cea0161d41fd5304ebda885/src/js): <code>DualListBoxWrapper.jsx</code>, contexts/constants/language, <code>components/Action.jsx</code>, <code>ListBox.jsx</code>, <code>Filter.jsx</code>, <code>HiddenInput.jsx</code>, <code>ObjectValueWrapper.jsx</code>, shapes, and utilities |
| Style source | [src/scss/react-dual-listbox.scss](https://github.com/jakezatecky/react-dual-listbox/blob/a71657198ebd51971cea0161d41fd5304ebda885/src/scss/react-dual-listbox.scss) |
| License | [MIT, copyright 2017 Jake Zatecky](https://github.com/jakezatecky/react-dual-listbox/blob/a71657198ebd51971cea0161d41fd5304ebda885/LICENSE.txt) |
| Notices/assets | Preserve the MIT notice. No separate NOTICE or required media asset was present. |

### Behavior, dependencies, and integration

- Two native multi-select controls transfer selected or all options between pools. The selected pool can be reordered; both pools can be filtered; optgroups, disabled options, localization, duplicate policy, and selection-order policy are supported.
- Controlled state is <code>selected</code>/<code>onChange</code>. A named hidden input serializes the value. When <code>required</code> is enabled, the source switches to a visually hidden text input and applies a localized custom-validity error when the selected pool is empty.
- Runtime dependencies are <code>classnames ^2.2.5</code>, <code>lodash ^4.17.21</code>, and <code>prop-types ^15.5.8</code>; React peer support is 16.8 through 19. Prefer the package for now. A later source-copy pass may replace narrow lodash calls only if that demonstrably reduces the closure.
- The SCSS is a replaceable visual skin. Port the states to local Tailwind tokens without changing list ownership or native select behavior.

### Interaction and accessibility

| Gate | Result |
| --- | --- |
| Keyboard | **Strong.** Native select traversal/multiselection remains available. Space and Enter transfer by default, and move/reorder controls are named native buttons. |
| Semantics | **Good.** Each select has a visible associated label; filters and icon-only actions have localized accessible labels; the required proxy input is named. |
| Touch | **Good with host sizing.** Native selects and buttons work without drag. Ensure every transfer/reorder target is at least 44 px. |
| RTL | **Explicit.** <code>htmlDir="rtl"</code> sets the root direction. Verify icon meaning, pool order, and move/reorder announcements in the final skin. |
| Validation | **Built in plus adapter-friendly.** Native required validity and a hidden form value exist; a framework controller may also consume <code>selected</code>/<code>onChange</code>. |
| Reduced motion | **Not applicable.** No authored motion is required. |

## Conditional — React Aria Number Field, Date Field, and Date Range Picker

Count: **3 conditional additive candidates**.

| Field | Evidence |
| --- | --- |
| Repository | [adobe/react-spectrum](https://github.com/adobe/react-spectrum) |
| Pinned commit | [57a1c82c87100e80ebefe8f79626bea5d8499302](https://github.com/adobe/react-spectrum/tree/57a1c82c87100e80ebefe8f79626bea5d8499302), 2026-07-18 |
| Package | <code>react-aria-components@1.19.0</code> |
| Number Field | [packages/react-aria-components/src/NumberField.tsx](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/src/NumberField.tsx) and [export](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/exports/NumberField.ts) |
| Date Field | [packages/react-aria-components/src/DateField.tsx](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/src/DateField.tsx), [HiddenDateInput.tsx](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/src/HiddenDateInput.tsx), and [export](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/exports/DateField.ts) |
| Date Range Picker | [packages/react-aria-components/src/DatePicker.tsx](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/src/DatePicker.tsx) and [export](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/packages/react-aria-components/exports/DateRangePicker.ts) |
| Underlying behavior | <code>packages/@react-aria/numberfield</code>, <code>packages/@react-stately/numberfield</code>, <code>packages/@react-aria/datepicker</code>, <code>packages/@react-stately/datepicker</code>, and <code>@internationalized/date</code> |
| License | [Apache-2.0](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/LICENSE); component files carry <code>Copyright 2022 Adobe</code> headers |
| Required notice | [NOTICE.txt](https://github.com/adobe/react-spectrum/blob/57a1c82c87100e80ebefe8f79626bea5d8499302/NOTICE.txt), including the applicable Adobe, React, react-window, focus-options-polyfill, ICU, Temporal, Tabster, Yarn, and other bundled notices |
| Assets | None required by these three unstyled components. |

### Distinct behavior

1. **Number Field** parses and formats according to locale, supports decimal/currency/unit/percentage options, min/max/step, increment and decrement actions, and spinbutton keyboard behavior. It serializes an unformatted numeric value through a hidden <code>name</code>/<code>form</code> input.
2. **Date Field** exposes locale-ordered editable date segments, calendar systems, granularity, min/max/unavailable-date validation, and native or ARIA validation without requiring a calendar popup.
3. **Date Range Picker** coordinates start/end segmented fields, range validation, and a range calendar/popover. Its form contract uses <code>startName</code>, <code>endName</code>, and <code>form</code>.

Number Field must be demonstrated as a generic localized numeric stepper, not another credit-card, phone, percentage, or currency mask. Date Range Picker must become the sole date-range winner; the shadcn and Tremor range examples remain zero.

### Dependency and integration boundary

- Direct package dependencies are <code>@internationalized/date ^3.12.2</code>, <code>@internationalized/string ^3.2.9</code>, <code>@react-types/shared ^3.36.0</code>, <code>@swc/helpers ^0.5.0</code>, <code>client-only ^0.0.1</code>, <code>react-aria 3.50.0</code>, and <code>react-stately 3.48.0</code>; React and ReactDOM 16.8 through 19 are peers.
- Use the maintained package. Copying three entry files would omit a large internationalization, state, focus, validation, calendar, overlay, and collection closure.
- Preserve the Apache license, all file headers, applicable NOTICE material, and prominent modification notices. Run a transitive-license report for the installed package.
- Controlled values work with React Hook Form or another controller. Also test the package's hidden/native form inputs, reset behavior, server validation errors, locale changes, and SSR/hydration in the actual host version.

### Interaction and accessibility

| Gate | Result |
| --- | --- |
| Keyboard | **Strong upstream basis.** Number stepping, segment traversal/editing, calendar navigation, open/close, and focus-visible states are implemented and covered by upstream tests. |
| Semantics | **Strong upstream basis.** Labels/descriptions/errors, spinbutton segments, required/invalid state, and hidden form values are wired through React Aria contexts. |
| Touch | **Strong upstream basis.** Press and overlay primitives support mouse, touch, and keyboard. Preview skins must retain 44 px stepper, calendar, and trigger targets. |
| RTL/i18n | **Core strength.** Locale determines number symbols, segment order, calendars, and direction-aware interaction. Test Arabic and a non-Gregorian locale rather than only mirroring English. |
| Validation | **Core strength.** Native and ARIA validation behaviors, controlled invalid state, server errors, min/max, and unavailable-date rules are represented. |
| Reduced motion | **No required field motion.** Any animation added to the popover/calendar skin must honor reduced motion. |

### Conditions before counting

1. Install the pinned package in isolation and record JavaScript size, SSR behavior, and the exact transitive license/NOTICE output.
2. Build one local Tailwind composition per candidate without importing Spectrum's visual system.
3. Verify native form submission/reset and framework-controller integration. Do not rely only on controlled Storybook state.
4. Run keyboard, touch, screen-reader naming, 200% zoom, narrow viewport, Arabic RTL, non-Gregorian calendar, and validation tests.
5. Prove Date Range Picker is the sole range family in the global ledger.

Reject React Aria <code>TimeField</code> against Dice Time Picker; plain <code>DatePicker</code> against shortlisted shadcn date/calendar behavior; Color components against Dice Color Picker; Token Field against Dice Tags Input; DropZone/FileTrigger against Dice File Upload; and Toast against the existing toast family. Support components such as Form, Label, FieldError, DateInput, DateSegment, Calendar, Popover, and Button do not add counts here.

## Conditional — rc-component Cascader and Tree Select

Count: **2 conditional additive candidates**.

### Cascader

| Field | Evidence |
| --- | --- |
| Repository | [react-component/cascader](https://github.com/react-component/cascader) |
| Pinned commit | [fd411117976bdf1322d5d0d0849d9c1d2f1d4dfa](https://github.com/react-component/cascader/tree/fd411117976bdf1322d5d0d0849d9c1d2f1d4dfa), 2026-07-10 |
| Package | <code>@rc-component/cascader@1.21.0</code> |
| Canonical source | [src/Cascader.tsx](https://github.com/react-component/cascader/blob/fd411117976bdf1322d5d0d0849d9c1d2f1d4dfa/src/Cascader.tsx) |
| Complete local closure | [src](https://github.com/react-component/cascader/tree/fd411117976bdf1322d5d0d0849d9c1d2f1d4dfa/src), especially <code>OptionList/*</code>, hooks, context, Panel, and utilities |
| License | [MIT, copyright 2019-present react-component](https://github.com/react-component/cascader/blob/fd411117976bdf1322d5d0d0849d9c1d2f1d4dfa/LICENSE) |

### Tree Select

| Field | Evidence |
| --- | --- |
| Repository | [react-component/tree-select](https://github.com/react-component/tree-select) |
| Pinned commit | [5a718680d0430861cdb86b1960a9abeb1fbdd272](https://github.com/react-component/tree-select/tree/5a718680d0430861cdb86b1960a9abeb1fbdd272), 2026-07-10 |
| Package | <code>@rc-component/tree-select@1.15.0</code> |
| Canonical source | [src/TreeSelect.tsx](https://github.com/react-component/tree-select/blob/5a718680d0430861cdb86b1960a9abeb1fbdd272/src/TreeSelect.tsx) |
| Complete local closure | [src](https://github.com/react-component/tree-select/tree/5a718680d0430861cdb86b1960a9abeb1fbdd272/src), especially <code>OptionList.tsx</code>, contexts, hooks, interfaces, and utilities |
| License | [MIT, copyright 2015-present Alipay.com](https://github.com/react-component/tree-select/blob/5a718680d0430861cdb86b1960a9abeb1fbdd272/LICENSE.md) |

Both packages depend on <code>@rc-component/select ~1.10.0</code>, <code>@rc-component/tree ~1.3.2</code>, <code>@rc-component/util ^1.11.1</code>, and <code>clsx ^2.1.1</code>. Cascader declares React/ReactDOM <code>>=18</code>; Tree Select uses open React/ReactDOM peers. Preserve each MIT notice and audit the installed rc-component packages. No required media asset or separate NOTICE was present.

### Behavior and interaction audit

- Cascader chooses a hierarchical path across adjacent columns, supports single or checkable multiple selection, search, field-name mapping, disabled nodes, change-on-select, and asynchronous child loading.
- Its keyboard hook covers Up/Down, Enter, Escape, Backspace, and column traversal. It explicitly reverses Left/Right behavior under <code>direction="rtl"</code>. Option rows expose menu/check states. Use click expansion in the Taste Blocks preview; hover expansion cannot be the only path.
- Tree Select combines searchable combobox behavior with an expandable tree, single or multiple/checkable selection, parent/child conduction strategies, async loading, virtualized lists, and controlled expansion.
- Its option-list adapter forwards arrow keys to rc-tree, handles Enter and Escape, and announces the active node through a live region. Verify the complete combobox/tree role relationship and RTL arrow behavior in the installed dependency versions.
- Both are controlled values and do not provide a reliable native named form input in their local source. Integrate through a framework Controller or one documented hidden input owned by the preview; test reset, required, invalid, and server-error states.
- Touch is click/press based when hover expansion is disabled. Make expand/select targets at least 44 px. Any popup transition supplied by local CSS must honor reduced motion.

### Conditions before counting

1. Use the maintained packages. Copying only either repository's local <code>src</code> tree omits rc-select, rc-tree, trigger, focus, portal, and utility behavior.
2. Prove that the package/CSS cost is smaller than importing PrimeReact or another design system.
3. Supply visible labels, descriptions, invalid/error associations, controlled-form adapters, and local Tailwind skins.
4. Test single, multiple, disabled, search, async loading, Escape/focus restoration, touch, narrow viewports, zoom, and RTL.
5. Keep Cascader and Tree Select as the only two hierarchical-selector contracts. Panels, columns, nodes, checkboxes, and search inputs add zero.

## Conditional — React Simple Code Editor

Count: **1 conditional additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [react-simple-code-editor/react-simple-code-editor](https://github.com/react-simple-code-editor/react-simple-code-editor) |
| Pinned commit | [e1b92329844a99484837659a5e79d2e9d7af5b58](https://github.com/react-simple-code-editor/react-simple-code-editor/tree/e1b92329844a99484837659a5e79d2e9d7af5b58), 2024-07-05 |
| Package | <code>react-simple-code-editor@0.14.1</code> |
| Complete source | [src/index.tsx](https://github.com/react-simple-code-editor/react-simple-code-editor/blob/e1b92329844a99484837659a5e79d2e9d7af5b58/src/index.tsx) |
| License | [MIT](https://github.com/react-simple-code-editor/react-simple-code-editor/blob/e1b92329844a99484837659a5e79d2e9d7af5b58/LICENSE.md), whose notice reads exactly <code>Copyright (C) 2018 - 2019 </code> with no named owner |
| Dependencies/assets | Zero runtime dependencies; React/ReactDOM <code>>=16.8</code> peers. Syntax highlighting is caller supplied. No bundled grammar, font, media, or separate NOTICE. |

This remains a native textarea over an <code>aria-hidden</code> highlighted preformatted layer, but adds code-specific Tab capture, indent/unindent, indentation-preserving newline, selected-text bracket/quote wrapping, and its own bounded undo/redo history. It is controlled through <code>value</code>/<code>onValueChange</code> and passes <code>name</code>, <code>form</code>, <code>required</code>, length constraints, and a textarea ID.

Keyboard editing is the core strength. Escape blurs; Ctrl+M, or Ctrl+Shift+M on Mac-like platforms, toggles Tab capture so the user can leave the editor. The preview must provide a real label through <code>textareaId</code>, add a narrow textarea <code>aria-describedby</code> passthrough for that instruction (generic ARIA props currently land on the wrapper), and test IME and screen-reader editing. Touch remains native textarea behavior.

Code content should stay explicitly LTR inside an RTL page; the source hardcodes left alignment/positioning. Verify that surrounding labels and validation chrome use logical direction. Preserve the upstream notice verbatim rather than inventing a copyright owner. The older maintenance date, custom history, composition behavior, mobile editing, and React 19 host build must pass before counting.

## Conditional — React Markdown Editor

Count: **1 conditional additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [uiwjs/react-md-editor](https://github.com/uiwjs/react-md-editor) |
| Pinned commit | [40c69066bdfeaaf1bb11e8c97d2219b8d82c777b](https://github.com/uiwjs/react-md-editor/tree/40c69066bdfeaaf1bb11e8c97d2219b8d82c777b), 2026-05-22 |
| Package | <code>@uiw/react-md-editor@4.1.1</code> |
| Canonical implementation | [core/src/Editor.factory.tsx](https://github.com/uiwjs/react-md-editor/blob/40c69066bdfeaaf1bb11e8c97d2219b8d82c777b/core/src/Editor.factory.tsx) |
| Complete source closure | [core/src](https://github.com/uiwjs/react-md-editor/tree/40c69066bdfeaaf1bb11e8c97d2219b8d82c777b/core/src), including Context, TextArea, Toolbar, DragBar, selected commands, utilities, and styles |
| License | [MIT, copyright 2020 uiw](https://github.com/uiwjs/react-md-editor/blob/40c69066bdfeaaf1bb11e8c97d2219b8d82c777b/LICENSE) |
| Notices/assets | Preserve the MIT notice. No separate NOTICE or required external media asset was present; command icons are inline SVG. |

The component edits one Markdown string with edit/live/preview modes, synchronized source and preview scrolling, named toolbar commands, keyboard shortcuts, optional fullscreen, and a controlled <code>value</code>/<code>onChange</code> contract. <code>textareaProps</code> pass native naming, labeling, required state, and form attributes to the source textarea.

Dependencies are <code>@babel/runtime ^7.14.6</code>, <code>@uiw/react-markdown-preview ^5.2.0</code>, <code>rehype ~13.0.0</code>, and <code>rehype-prism-plus ~2.0.0</code>; React/ReactDOM <code>>=16.8</code> are peers. Prefer the maintained package; source copying requires the complete editor and preview/parser license closure.

Toolbar buttons have accessible names and the textarea owns native keyboard/touch editing. The package has a <code>direction</code> prop and RTL CSS. The height drag bar is pointer/touch only, however, so disable <code>visibleDragbar</code> for the first import or add a named keyboard-resizable separator. Fullscreen must restore focus and close with Escape. Untrusted Markdown must use a reviewed sanitization policy; do not enable raw HTML through caller plugins without sanitization and CSP review.

Count the editor, toolbar, preview, commands, drag bar, and modes together as one. It is distinct from Kibo's TipTap rich-text editor and shadcn's read-only Markdown renderers.

## Conditional — React JS Cron

Count: **1 conditional additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [xrutayisire/react-js-cron](https://github.com/xrutayisire/react-js-cron) |
| Pinned commit | [e063ea901f5113a4abf06830034b64adda2dbb0d](https://github.com/xrutayisire/react-js-cron/tree/e063ea901f5113a4abf06830034b64adda2dbb0d), 2026-04-03 |
| Package | <code>react-js-cron@6.0.2</code> |
| Canonical component | [src/Cron.tsx](https://github.com/xrutayisire/react-js-cron/blob/e063ea901f5113a4abf06830034b64adda2dbb0d/src/Cron.tsx) |
| Complete source closure | [src](https://github.com/xrutayisire/react-js-cron/tree/e063ea901f5113a4abf06830034b64adda2dbb0d/src): fields, <code>components/CustomSelect.tsx</code>, converter, constants, locale, types, utilities, and <code>styles.css</code> |
| License | [MIT, copyright Xavier Rutayisire](https://github.com/xrutayisire/react-js-cron/blob/e063ea901f5113a4abf06830034b64adda2dbb0d/LICENSE.md) |
| Dependencies/assets | Zero owned runtime dependencies, but hard peers on Ant Design <code>>=6</code> and React/ReactDOM 18 or 19. No required media or separate NOTICE. |

The component parses and serializes one cron expression across period, month, month-day, weekday, hour, and minute selectors. It supports controlled value/error callbacks, empty-value policies, shortcuts, 12/24-hour display, localization, disabled/read-only states, and converter tests.

The dependency is the primary gate. Import only if the host already carries Ant Design 6 or an isolated package measurement shows acceptable cost and style containment. A Tailwind rewrite of AntD Select behavior is outside minimal adaptation.

Keyboard, touch, popup, and disabled semantics are inherited from AntD. The source's prose prefixes are not associated as field labels, it has no native <code>name</code> input, and RTL relies on an external AntD ConfigProvider. Before counting, add localized accessible names to every active selector, connect the error to the group, serialize the controlled cron value through one documented form field/controller, test AntD RTL, and verify popup motion under reduced motion. Reject if AntD is otherwise absent.

## Conditional — React Query Builder

Count: **1 conditional additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [react-querybuilder/react-querybuilder](https://github.com/react-querybuilder/react-querybuilder) |
| Pinned commit | [fed74f2a83fa22ceb3a901536af6edc7ce4cb1e1](https://github.com/react-querybuilder/react-querybuilder/tree/fed74f2a83fa22ceb3a901536af6edc7ce4cb1e1), 2026-07-02 |
| Package | <code>react-querybuilder@8.20.2</code> plus <code>@react-querybuilder/core@8.20.2</code> |
| Canonical component | [packages/react-querybuilder/src/components/QueryBuilder.tsx](https://github.com/react-querybuilder/react-querybuilder/blob/fed74f2a83fa22ceb3a901536af6edc7ce4cb1e1/packages/react-querybuilder/src/components/QueryBuilder.tsx) |
| Component closure | [packages/react-querybuilder/src/components](https://github.com/react-querybuilder/react-querybuilder/tree/fed74f2a83fa22ceb3a901536af6edc7ce4cb1e1/packages/react-querybuilder/src/components), related hooks/redux/defaults, and the required [packages/core/src](https://github.com/react-querybuilder/react-querybuilder/tree/fed74f2a83fa22ceb3a901536af6edc7ce4cb1e1/packages/core/src) algorithms/styles |
| License | [MIT, copyright 2024 Jake Boone and other contributors](https://github.com/react-querybuilder/react-querybuilder/blob/fed74f2a83fa22ceb3a901536af6edc7ce4cb1e1/LICENSE.md) |
| Notices/assets | Preserve the MIT notice. No separate NOTICE or required asset was present. |

This is eligible only as one editor for a nested query value: fields, operators, values, combinators, groups, add/remove/clone/lock, controlled/default query, field/query validators, and export/parse utilities. Rows, groups, value editors, parsers, formatters, adapters, and drag backends add zero.

The React package depends on <code>@react-querybuilder/core ^8.20.2</code>, <code>@reduxjs/toolkit ^2.12.0</code>, and <code>react-redux ^9.3.0</code>. Core depends on <code>@ts-jison/lexer 0.4.1-alpha.1</code>, <code>@ts-jison/parser 0.4.1-alpha.1</code>, <code>immer ^11.1.8</code>, and <code>numeric-quantity ^3.2.2</code>, with many optional parser/database peers. Use the maintained packages and import no optional formatter/parser that the preview does not need.

Native buttons/selects/inputs provide a keyboard and touch base. Do not enable drag-and-drop: enable <code>showShiftActions</code> so named Up/Down buttons provide the reorder path. The core SCSS includes explicit <code>:dir(rtl)</code> branches. However, many default controls rely on <code>title</code> rather than actual accessible labels, and the root renders <code>role="form"</code> despite being embedded as a field.

Before counting, supply accessible labels/descriptions through the control-elements API, expose validation messages and invalid state, use a labeled group rather than a nested form landmark, wire the controlled query to one host form value, disable DnD, and test keyboard reorder, touch, RTL branches, nested depth, zoom, and serialization. Reject if this turns into a filter page or if the dependency surface is disproportionate.

## Conditional — Compa11y Error Summary

Count: **1 conditional additive candidate**.

| Field | Evidence |
| --- | --- |
| Repository | [trajkovskiivan/compa11y](https://github.com/trajkovskiivan/compa11y) |
| Pinned commit | [2812a02e09c23d9260dff02e9a7eda0d661d2328](https://github.com/trajkovskiivan/compa11y/tree/2812a02e09c23d9260dff02e9a7eda0d661d2328), 2026-04-10 |
| Package | <code>@compa11y/react@0.2.3</code> |
| Canonical source | [packages/react/src/components/error-summary/error-summary.tsx](https://github.com/trajkovskiivan/compa11y/blob/2812a02e09c23d9260dff02e9a7eda0d661d2328/packages/react/src/components/error-summary/error-summary.tsx) |
| Local closure | [component index](https://github.com/trajkovskiivan/compa11y/blob/2812a02e09c23d9260dff02e9a7eda0d661d2328/packages/react/src/components/error-summary/index.ts), [use-id.ts](https://github.com/trajkovskiivan/compa11y/blob/2812a02e09c23d9260dff02e9a7eda0d661d2328/packages/react/src/hooks/use-id.ts), and the warning helper from <code>@compa11y/core</code> |
| License | [MIT, copyright 2026 Ivan Trajkovski](https://github.com/trajkovskiivan/compa11y/blob/2812a02e09c23d9260dff02e9a7eda0d661d2328/LICENSE) |
| Dependencies/assets | <code>@compa11y/core@0.2.3</code>; React/ReactDOM <code>>=18</code> peers. No required asset or separate NOTICE. |

The form variant focuses a labeled summary and links errors to field IDs; the page variant can announce a system error and expose caller actions/dismissal. Native links and buttons provide keyboard/touch interaction, and link targets have a 44 px minimum height. Form libraries can map their error objects to <code>{message, fieldId}</code>; the source does not discover React Hook Form, Zod, or native validity automatically.

The pinned source has no Error Summary-specific tests. Focus runs only on mount, field navigation always uses smooth scrolling, and styles use physical <code>borderLeft</code>, <code>paddingLeft</code>/<code>paddingRight</code>, and <code>right</code>. Before counting:

1. Refocus or announce when a new submit produces a changed error batch, without stealing focus for background validation.
2. Use instant scrolling under reduced motion and fall back to the anchor when script fails.
3. Convert physical sides to logical properties and verify the accent, list indent, and dismiss button under RTL.
4. Test missing field IDs, hidden/disabled targets, duplicate messages, focus restoration, screen-reader announcement, touch, and repeated submits.
5. Keep only validation navigation. Page-level actions are a mode, not another component.

## Replacement-only upstreams

### React Textarea Autosize — zero additive

| Field | Evidence |
| --- | --- |
| Repository/pin | [Andarist/react-textarea-autosize at ed1894cd8611d99fbea1c47adcf6ee522b1030fd](https://github.com/Andarist/react-textarea-autosize/tree/ed1894cd8611d99fbea1c47adcf6ee522b1030fd), 2025-03-31 |
| Package | <code>react-textarea-autosize@8.5.9</code> |
| Source closure | [src/index.tsx](https://github.com/Andarist/react-textarea-autosize/blob/ed1894cd8611d99fbea1c47adcf6ee522b1030fd/src/index.tsx), <code>calculateNodeHeight.ts</code>, <code>getSizingData.ts</code>, <code>forceHiddenStyles.ts</code>, hooks, utilities, and browser conditions under [src](https://github.com/Andarist/react-textarea-autosize/tree/ed1894cd8611d99fbea1c47adcf6ee522b1030fd/src) |
| License | [MIT, copyright 2013 Andrey Popp](https://github.com/Andarist/react-textarea-autosize/blob/ed1894cd8611d99fbea1c47adcf6ee522b1030fd/LICENSE) |
| Dependencies | <code>@babel/runtime ^7.20.13</code>, <code>use-composed-ref ^1.3.0</code>, and <code>use-latest ^1.2.1</code>; React 16.8 through 19 peer |

It is a strong native textarea implementation with measured height, min/max rows, controlled/uncontrolled support, refs, SSR guards, and native form/keyboard/touch/RTL behavior. It adds **zero** because shortlisted shadcn <code>input-group-textarea-examples.tsx</code> already depends on this package for the same autosize behavior. Use this pin as the upstream provenance for that example; do not publish a second autosize component.

Preserve its MIT notice. No separate NOTICE or required asset was present.

### Sonner — zero additive

| Field | Evidence |
| --- | --- |
| Repository/pin | [emilkowalski/sonner at 45d894085af8ca8421912789a8f5a4ac4ac3d0ea](https://github.com/emilkowalski/sonner/tree/45d894085af8ca8421912789a8f5a4ac4ac3d0ea), 2025-12-24 |
| Package | <code>sonner@2.0.7</code> |
| Source closure | [src/index.tsx](https://github.com/emilkowalski/sonner/blob/45d894085af8ca8421912789a8f5a4ac4ac3d0ea/src/index.tsx), [src/state.ts](https://github.com/emilkowalski/sonner/blob/45d894085af8ca8421912789a8f5a4ac4ac3d0ea/src/state.ts), hooks, types, inline assets, and [src/styles.css](https://github.com/emilkowalski/sonner/blob/45d894085af8ca8421912789a8f5a4ac4ac3d0ea/src/styles.css) |
| License | [MIT, copyright 2023 Emil Kowalski](https://github.com/emilkowalski/sonner/blob/45d894085af8ca8421912789a8f5a4ac4ac3d0ea/LICENSE.md) |
| Dependencies | Zero runtime packages beyond React/ReactDOM peers |

Sonner is credible canonical toast infrastructure, but it collides with shortlisted SmoothUI <code>basic-toast</code> and the inventoried 9ui Sonner wrapper. It may replace the weaker wrapper while keeping one toast family; it cannot add a second count.

Preserve its MIT notice. No separate NOTICE or required external asset was present.

## Rejected and zero-count sources

| Source | Pin and license | Audited source | Reason for zero |
| --- | --- | --- | --- |
| React Number Format | [503a85ea16c182a114731405f6a504d7e86a5dcb](https://github.com/s-yadav/react-number-format/tree/503a85ea16c182a114731405f6a504d7e86a5dcb), 2026-03-22; [MIT, copyright 2020-present Sudhanshu Yadav](https://github.com/s-yadav/react-number-format/blob/503a85ea16c182a114731405f6a504d7e86a5dcb/LICENSE) | [src](https://github.com/s-yadav/react-number-format/tree/503a85ea16c182a114731405f6a504d7e86a5dcb/src): NumberFormatBase, NumericFormat, PatternFormat, utilities, types | PatternFormat duplicates Dice Mask Input. Numeric/currency formatting duplicates Dice's localized mask modes and the conditional React Aria Number Field. Zero runtime dependencies do not create a new behavior. |
| React Currency Input Field | [e8f7c9c3a3d322d1b47cae08abe08c93563e5fa0](https://github.com/cchanxzy/react-currency-input-field/tree/e8f7c9c3a3d322d1b47cae08abe08c93563e5fa0), 2026-07-14; [MIT, copyright 2020 Chun Chan](https://github.com/cchanxzy/react-currency-input-field/blob/e8f7c9c3a3d322d1b47cae08abe08c93563e5fa0/LICENSE) | [src/components/CurrencyInput.tsx](https://github.com/cchanxzy/react-currency-input-field/blob/e8f7c9c3a3d322d1b47cae08abe08c93563e5fa0/src/components/CurrencyInput.tsx), props, and utilities | Good Intl formatting, abbreviations, and Arrow stepping, but still the same currency-entry contract already covered by Dice Mask Input and the Number Field candidate. |
| React Sketch Canvas | [e0712a2bb82ae5a74c40d7c0a6b35dcb6f8ae2e0](https://github.com/vinothpandian/react-sketch-canvas/tree/e0712a2bb82ae5a74c40d7c0a6b35dcb6f8ae2e0), 2026-05-26; [MIT, copyright 2018 Vinoth Pandian](https://github.com/vinothpandian/react-sketch-canvas/blob/e0712a2bb82ae5a74c40d7c0a6b35dcb6f8ae2e0/LICENSE) | [packages/react-sketch-canvas/src](https://github.com/vinothpandian/react-sketch-canvas/tree/e0712a2bb82ae5a74c40d7c0a6b35dcb6f8ae2e0/packages/react-sketch-canvas/src) | Mouse/touch/pen drawing, history, and SVG export are real, but there is no keyboard-equivalent drawing/input path or equivalent semantic value. Repair would redesign the input. Signature-pad wrappers inherit the same failure. |
| JSON Edit React | [c6fa40c42bdec242aae64c8a5e620e2200d8a736](https://github.com/CarlosNZ/json-edit-react/tree/c6fa40c42bdec242aae64c8a5e620e2200d8a736), 2026-07-02; [MIT, copyright 2024 Carl Smith](https://github.com/CarlosNZ/json-edit-react/blob/c6fa40c42bdec242aae64c8a5e620e2200d8a736/LICENSE) | [src](https://github.com/CarlosNZ/json-edit-react/tree/c6fa40c42bdec242aae64c8a5e620e2200d8a736/src) | Toolbar actions are removed from the tab order, and editing begins through pointer double-click/modifier-click on non-focusable values. Keyboard support starts only after pointer entry. The beta package needs structural renderer changes, not a narrow repair. |
| React Spreadsheet | [bb80b60b82981527d5172ce8268af61a517f7e46](https://github.com/iddan/react-spreadsheet/tree/bb80b60b82981527d5172ce8268af61a517f7e46), 2025-11-17; [MIT, copyright 2018 Iddan Aaronsohn](https://github.com/iddan/react-spreadsheet/blob/bb80b60b82981527d5172ce8268af61a517f7e46/LICENSE) | [src](https://github.com/iddan/react-spreadsheet/tree/bb80b60b82981527d5172ce8268af61a517f7e46/src) | Range selection is mouse-driven, no touch path was found, explicit ARIA grid semantics are absent, every cell is tabbable, and physical coordinate assumptions do not support RTL. It also drifts into application/data-grid scope. |
| PrimeReact specialized controls | [8db7b9495b9e1b0619c8b9784116bdb1e4e632aa](https://github.com/primefaces/primereact/tree/8db7b9495b9e1b0619c8b9784116bdb1e4e632aa), 2026-06-29; [MIT, copyright 2016-2025 PrimeTek](https://github.com/primefaces/primereact/blob/8db7b9495b9e1b0619c8b9784116bdb1e4e632aa/LICENSE.md) | <code>components/lib/{cascadeselect,treeselect,picklist,inputnumber,password,tristatecheckbox,multistatecheckbox}</code> | PickList loses to React Dual Listbox; InputNumber loses to Number Field/Dice; TreeSelect and CascadeSelect lose to the smaller rc-component sources; tri/multi-state checkboxes are ordinary checkbox state; Password is a heuristic input wrapper. The shared PrimeReact API, overlay, transition, tooltip, icon, tree, button, ripple, and style closure is disproportionate. |

No separate NOTICE file was present in the rejected repositories above at their pinned snapshots. Preserve their license notices if any code is later reconsidered; a root MIT declaration never licenses unrelated demo media or transitive packages.

## Import evidence checklist

For any accepted or conditional family that advances:

1. Re-fetch the exact commit and compare the named source before copying or installing.
2. Use the maintained package where the source closure crosses a mature accessibility/state system. Do not copy an entry file and silently omit its runtime.
3. Record repository, commit, version, original paths, full license/copyright notice, required NOTICE text, transitive licenses, and every modification.
4. Keep one value contract and one behavior family. Do not count helpers, modes, commands, segments, controls, demos, adapters, or visual variants.
5. Supply original Taste Blocks demo data and copy. No source in the accepted/conditional set requires upstream photos, fonts, audio, or video.
6. Test real controlled and native form behavior: submit, reset, required/invalid, server errors, disabled/read-only, and React Hook Form-style integration.
7. Run keyboard, focus restoration, touch/no-hover, 44 px targets, screen-reader naming, 200% zoom, narrow viewport, RTL, locale, reduced-motion, SSR/hydration, cleanup, and visual QA.
8. Re-run the global ledger immediately before import. A stronger replacement still contributes zero if its behavior is already counted.
