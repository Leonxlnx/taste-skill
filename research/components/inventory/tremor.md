# Tremor Raw and Tremor Blocks

Checked: 2026-07-20
Scope: reusable React components only; no page sections, layouts, templates, dashboards, chart compositions, or cosmetic variants.
Status: source and license inventory, not legal advice.

## Decision

| Source | Pinned commit | License at that commit | Strict candidates | Decision |
| --- | --- | --- | ---: | --- |
| [Tremor Raw](https://github.com/tremorlabs/tremor/tree/ca4d588f47820ff3d514d37fa4ee08a4222dec11) | `ca4d588f47820ff3d514d37fa4ee08a4222dec11` (2025-10-10) | [Apache-2.0 with bundled third-party MIT notices](https://github.com/tremorlabs/tremor/blob/ca4d588f47820ff3d514d37fa4ee08a4222dec11/LICENSE) | **30 component families** | Eligible with attribution and modification notices. Useful mainly for accessible controls; it is not a React Bits-style motion/effects source. |
| [Tremor Blocks](https://github.com/tremorlabs/tremor-blocks/tree/b319e8d3d3678a4f60f4802f7e85bc1abc52d598) | `b319e8d3d3678a4f60f4802f7e85bc1abc52d598` (2025-01-22) | [MIT, Copyright (c) 2025 Tremor Labs, Inc.](https://github.com/tremorlabs/tremor-blocks/blob/b319e8d3d3678a4f60f4802f7e85bc1abc52d598/LICENSE.md) | **0 direct component candidates** | Legally reusable, but its 323 published examples are blocks or variants rather than reusable component APIs. Do not inflate the library count with them. One file-upload example is a possible later extraction, not a current component candidate. |

**Strict total: 30 families from 31 source files.** `Toast.tsx` and `Toaster.tsx` are one component family. Tremor Blocks adds no direct candidate after scope and duplicate filtering.

## Tremor Raw candidates

All paths below are relative to the pinned [`tremorlabs/tremor`](https://github.com/tremorlabs/tremor/tree/ca4d588f47820ff3d514d37fa4ee08a4222dec11) snapshot. Every demo is an upstream Storybook story, not a new Taste Blocks implementation.

| # | Component family | Exact source path | Upstream demo | Direct external dependencies |
| ---: | --- | --- | --- | --- |
| 1 | Accordion | `src/components/Accordion/Accordion.tsx` | `src/components/Accordion/accordion.stories.tsx` | `@radix-ui/react-accordion`, `@remixicon/react` |
| 2 | Badge | `src/components/Badge/Badge.tsx` | `src/components/Badge/badge.stories.tsx` | `tailwind-variants` |
| 3 | Button | `src/components/Button/Button.tsx` | `src/components/Button/button.stories.tsx` | `@radix-ui/react-slot`, `@remixicon/react`, `tailwind-variants` |
| 4 | Calendar | `src/components/Calendar/Calendar.tsx` | `src/components/Calendar/calendar.stories.tsx` | `date-fns`, `react-day-picker`, `@remixicon/react` |
| 5 | Callout | `src/components/Callout/Callout.tsx` | `src/components/Callout/callout.stories.tsx` | `tailwind-variants` |
| 6 | Card | `src/components/Card/Card.tsx` | `src/components/Card/card.stories.tsx` | `@radix-ui/react-slot` |
| 7 | Checkbox | `src/components/Checkbox/Checkbox.tsx` | `src/components/Checkbox/checkbox.stories.tsx` | `@radix-ui/react-checkbox` |
| 8 | Date Picker / Date Range Picker | `src/components/DatePicker/DatePicker.tsx` | `src/components/DatePicker/datepicker.stories.tsx`; `src/components/DatePicker/daterangepicker.stories.tsx` | `@internationalized/date`, `@radix-ui/react-popover`, `@react-aria/datepicker`, `@react-stately/datepicker`, `@remixicon/react`, `date-fns`, `tailwind-variants`; local Button and Calendar |
| 9 | Dialog | `src/components/Dialog/Dialog.tsx` | `src/components/Dialog/dialog.stories.tsx` | `@radix-ui/react-dialog` |
| 10 | Divider | `src/components/Divider/Divider.tsx` | `src/components/Divider/divider.stories.tsx` | none beyond React and Tailwind |
| 11 | Drawer | `src/components/Drawer/Drawer.tsx` | `src/components/Drawer/drawer.stories.tsx` | `@radix-ui/react-dialog`, `@remixicon/react`; local Button |
| 12 | Dropdown Menu | `src/components/DropdownMenu/DropdownMenu.tsx` | `src/components/DropdownMenu/dropdownmenu.stories.tsx` | `@radix-ui/react-dropdown-menu`, `@remixicon/react` |
| 13 | Input | `src/components/Input/Input.tsx` | `src/components/Input/input.stories.tsx` | `@remixicon/react`, `tailwind-variants` |
| 14 | Label | `src/components/Label/Label.tsx` | `src/components/Label/label.stories.tsx` | `@radix-ui/react-label` |
| 15 | Popover | `src/components/Popover/Popover.tsx` | `src/components/Popover/popover.stories.tsx` | `@radix-ui/react-popover` |
| 16 | Progress Bar | `src/components/ProgressBar/ProgressBar.tsx` | `src/components/ProgressBar/progressbar.stories.tsx` | `tailwind-variants` |
| 17 | Progress Circle | `src/components/ProgressCircle/ProgressCircle.tsx` | `src/components/ProgressCircle/progresscircle.stories.tsx` | `tailwind-variants` |
| 18 | Radio Card Group | `src/components/RadioCardGroup/RadioCardGroup.tsx` | `src/components/RadioCardGroup/radiocardgroup.stories.tsx` | `@radix-ui/react-radio-group` |
| 19 | Radio Group | `src/components/RadioGroup/RadioGroup.tsx` | `src/components/RadioGroup/radiogroup.stories.tsx` | `@radix-ui/react-radio-group` |
| 20 | Select | `src/components/Select/Select.tsx` | `src/components/Select/select.stories.tsx` | `@radix-ui/react-select`, `@remixicon/react` |
| 21 | Native Select | `src/components/SelectNative/SelectNative.tsx` | `src/components/SelectNative/selectnative.stories.tsx` | `tailwind-variants` |
| 22 | Slider | `src/components/Slider/Slider.tsx` | `src/components/Slider/slider.stories.tsx` | `@radix-ui/react-slider` |
| 23 | Switch | `src/components/Switch/Switch.tsx` | `src/components/Switch/switch.stories.tsx` | `@radix-ui/react-switch`, `tailwind-variants` |
| 24 | Table | `src/components/Table/Table.tsx` | `src/components/Table/table.stories.tsx` | none beyond React and Tailwind |
| 25 | Tab Navigation | `src/components/TabNavigation/TabNavigation.tsx` | `src/components/TabNavigation/tabnavigation.stories.tsx` | `@radix-ui/react-navigation-menu` |
| 26 | Tabs | `src/components/Tabs/Tabs.tsx` | `src/components/Tabs/tabs.stories.tsx` | `@radix-ui/react-tabs` |
| 27 | Textarea | `src/components/Textarea/Textarea.tsx` | `src/components/Textarea/textarea.stories.tsx` | none beyond React and Tailwind |
| 28 | Toast / Toaster | `src/components/Toast/Toast.tsx`; `src/components/Toast/Toaster.tsx` | `src/components/Toast/toast.stories.tsx` | `@radix-ui/react-toast`, `@remixicon/react`; local `src/hooks/useToast.ts` |
| 29 | Toggle / Toggle Group | `src/components/Toggle/Toggle.tsx` | `src/components/Toggle/toggle.stories.tsx` | `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group` |
| 30 | Tooltip | `src/components/Tooltip/Tooltip.tsx` | `src/components/Tooltip/tooltip.stories.tsx` | `@radix-ui/react-tooltip` |

### Shared files and runtime baseline

Copy only the helpers actually imported by a selected component:

- `src/utils/cx.ts`
- `src/utils/focusInput.ts`
- `src/utils/focusRing.ts`
- `src/utils/hasErrorInput.ts`
- `src/hooks/useToast.ts` for the Toast family
- the relevant animation keyframes from `src/globals.css` for Accordion, Dialog, Drawer, Dropdown Menu, Popover, Select, Toast, and Tooltip

The pinned manifest targets React `^18.3.1`, Tailwind CSS `^4.1.3`, `clsx ^2.1.1`, `tailwind-merge ^3.2.0`, and `tailwind-variants ^1.0.0`. Keep component-specific packages narrow; do not install the repository's chart, Storybook, Playwright, or formatting dependencies for these candidates.

### Quality classification

The following 13 families have enough behavior to merit an individual catalog review: Accordion, Calendar, Date Picker, Dialog, Drawer, Dropdown Menu, Popover, Radio Card Group, Select, Slider, Tabs, Toast, and Tooltip.

The other 17 are useful foundations but visually conventional. They may be shipped when the library needs a complete control set, but they should not be presented as evidence that Taste Blocks has React Bits-level animation or creative effects. Do not create extra counts for color, size, or Storybook variants.

## Tremor Raw exclusions

Nine source families are excluded from this component-only inventory:

| Excluded family | Exact source path | Reason |
| --- | --- | --- |
| Area Chart | `src/components/AreaChart/AreaChart.tsx` | chart/data-visualization component |
| Bar Chart | `src/components/BarChart/BarChart.tsx` | chart/data-visualization component |
| Bar List | `src/components/BarList/BarList.tsx` | dashboard-oriented data ranking visualization |
| Category Bar | `src/components/CategoryBar/CategoryBar.tsx` | dashboard-oriented data visualization |
| Combo Chart | `src/components/ComboChart/ComboChart.tsx` | chart/data-visualization component |
| Donut Chart | `src/components/DonutChart/DonutChart.tsx` | chart/data-visualization component |
| Line Chart | `src/components/LineChart/LineChart.tsx` | chart/data-visualization component |
| Spark Chart | `src/components/SparkChart/SparkChart.tsx` | chart/data-visualization component |
| Tracker | `src/components/Tracker/Tracker.tsx` | status/data visualization aimed at dashboards |

Stories, tests, changelogs, repository UI, and documentation are evidence and demos, not separate components.

## Tremor Blocks audit

The pinned Blocks repository contains **323** example files under `src/content/components/` across 28 categories:

| Category | Files | Scope decision |
| --- | ---: | --- |
| Account and user management | 15 | account/page compositions; exclude |
| Area charts | 16 | charts; exclude |
| Badges | 13 | cosmetic examples of the same primitive; exclude as trivial variants |
| Banners | 5 | page-width marketing/application blocks; exclude |
| Bar charts | 12 | charts; exclude |
| Bar lists | 7 | dashboard data views; exclude |
| Billing and usage | 10 | dashboard/account layouts; exclude |
| Chart compositions | 15 | charts; exclude |
| Chart tooltips | 21 | chart-specific variants; exclude |
| Dialogs | 9 | hard-coded workflow demos over the Raw Dialog primitive; exclude as compositions/duplicates |
| Donut charts | 7 | charts; exclude |
| Empty states | 10 | content/layout blocks; exclude |
| Feature sections | 12 | website sections; exclude |
| File upload | 7 | form/layout examples; no direct reusable API; see conditional lead below |
| Filterbar | 16 | dashboard filter layouts; exclude |
| Form layouts | 6 | layouts; exclude |
| Grid lists | 15 | content layouts; exclude |
| KPI cards | 29 | dashboard metric blocks; exclude |
| Line charts | 12 | charts; exclude |
| Logins | 10 | page/form sections; exclude |
| Onboarding and feed | 16 | workflow/feed layouts with hard-coded data; exclude |
| Page shells | 6 | page layouts; exclude |
| Pricing sections | 8 | website sections; exclude |
| Spark charts | 6 | charts; exclude |
| Status monitoring | 10 | dashboard views; exclude |
| Table actions | 11 | dashboard/table compositions; exclude |
| Table pagination | 8 | table-layout variants; exclude |
| Tables | 11 | dashboard table compositions; exclude |

The repository also carries **39** primitive files in `src/components/`. Their filenames match the Tremor Raw primitives exactly except that the older Blocks snapshot has no `Toggle.tsx`. Treat all 39 as older duplicates and source primitives from the newer pinned Tremor Raw commit instead.

### Conditional lead, not counted

`src/content/components/file-upload/file-upload-02.tsx` is the only Blocks example with substantive standalone interaction: it uses `react-dropzone`, keeps selected files in state, lists them, and supports removal. Its paired demo is `src/content/markdown/file-upload/file-upload-02.mdx`; direct dependencies are `react-dropzone`, `@remixicon/react`, local `cx`, Button, Divider, Input, Label, and Native Select.

It is still a full form example with hard-coded copy and surrounding layout rather than a reusable `FileDropzone` API. It may become **one** candidate only after a later extraction and quality review. Do not count the other six static upload presentations as variants of a component.

## License and notice requirements

### Tremor Raw

For any copied Raw source:

1. Ship a copy of the pinned root `LICENSE` with the distributed source or registry package.
2. Keep applicable copyright, patent, trademark, and attribution notices.
3. Add a prominent notice to every modified upstream file stating that Taste Blocks changed it and summarizing the change.
4. Preserve the root license's third-party MIT attribution section. It specifically identifies copied influence in Accordion, Checkbox, Date Picker, Dialog, Input, Popover, Radio Group, Radio Card Group, Select, Switch, Tabs, Toast/Toaster, Tooltip, Tab Navigation, and `useToast`.
5. The snapshot contains no `NOTICE` file, so Apache-2.0 section 4(d) adds no separate NOTICE-file content. The full root license still needs to travel with the copied code.
6. Do not imply Tremor endorsement and do not use Tremor names or logos as Taste Blocks branding; Apache-2.0 does not grant trademark rights.

Recommended provenance record per imported family: upstream repository, exact commit, exact source path, exact demo path, original license file hash, imported date, and a human-readable modification list.

### Tremor Blocks

If the conditional file-upload source is ever extracted, preserve the complete pinned MIT text and `Copyright (c) 2025 Tremor Labs, Inc.` in the distributed notices. MIT does not require a modified-file marker, but the Taste Blocks provenance record should still describe every adaptation. The repository contains no `NOTICE` file.

### Assets and third-party packages

- None of the 30 Raw source candidates require Tremor's `public/images` banner or logo assets. Do not copy them.
- Do not copy Blocks thumbnails, `dot.svg`, `next.svg`, or bundled JetBrains Mono font files. They are unnecessary for the component candidates; the repository does not bundle a separate font license file, and the logo files also create avoidable trademark risk.
- The selected source uses third-party packages such as Radix UI, React Aria, Remix Icon, date-fns, react-day-picker, and tailwind-variants. Keep them as package dependencies rather than copying their source, and record their own licenses in the generated dependency notices.
- The conditional file-upload example uses no remote media asset. Other Blocks examples contain external logos or demo content; those are outside this inventory and must not be imported implicitly.

## Import gate

Before any Tremor candidate becomes a published Taste Blocks entry:

- import from the pinned path, not the live default branch;
- retain the required license and provenance record;
- verify that the result is a reusable prop-driven component rather than an `Example` layout;
- remove demo copy and data without inventing a second design;
- run TypeScript, production build, keyboard, screen-reader naming, mobile, dark-mode, and reduced-motion checks;
- compare against already imported primitives so Tremor does not create duplicates under new names;
- count one component family once, regardless of sizes, colors, states, or story variants.

Tremor is therefore a legally usable source for a compact accessible-control layer, not a source of hundreds of high-motion Taste Blocks components.
