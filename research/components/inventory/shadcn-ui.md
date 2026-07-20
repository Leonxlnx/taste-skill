# shadcn/ui source inventory

Checked: 2026-07-20
Repository: https://github.com/shadcn-ui/ui
Pinned commit: [d28738b183c5eaa69d8d540826e450f30d39ab6c](https://github.com/shadcn-ui/ui/tree/d28738b183c5eaa69d8d540826e450f30d39ab6c)
Commit date: 2026-07-17
Scope: components only. Page blocks, layouts, templates, charts, dashboard examples, and cosmetic-only variants are excluded.

## Decision

shadcn/ui is legally usable as a source-copy pool under MIT, but it is mainly a strong accessible foundation, not a React Bits-level visual-effects library.

- 58 materially different core component implementations are in scope.
- 138 materially different current example compositions remain after deduplicating 494 Radix examples.
- 196 source items are therefore technically copyable from this pinned commit.
- Only 25 examples are on the initial high-bar shortlist. The other 171 items are support patterns or primitives and must not be presented as 171 React Bits-level showcase components.
- Nothing here is approved merely because it builds. Every shortlisted item still needs an exact-source import, live preview, asset replacement where noted, and visual QA.

The 25-item shortlist is:

1. attachment-group
2. attachment-states
3. bubble-collapsible
4. bubble-markdown
5. bubble-reactions
6. calendar-custom-days
7. calendar-hijri
8. calendar-time
9. collapsible-file-tree
10. combobox-custom
11. combobox-multiple
12. date-picker-natural-language
13. drawer-dialog
14. file-upload-list
15. input-group-custom
16. input-group-textarea-examples
17. markdown-demo
18. marker-shimmer
19. message-attachment
20. message-markdown
21. message-scroller-animation
22. message-scroller-load-history
23. message-scroller-streaming
24. shimmer-demo
25. shimmer-once

This shortlist is intentionally strict. It favors distinct behavior, content handling, or motion instead of counting every ordinary button, menu state, size, direction, or color as a separate component.

## License and required notice

The repository root [LICENSE.md](https://github.com/shadcn-ui/ui/blob/d28738b183c5eaa69d8d540826e450f30d39ab6c/LICENSE.md) is the MIT License. Its exact copyright notice is:

> MIT License
> Copyright (c) 2023 shadcn

MIT permits use, copying, modification, distribution, sublicensing, and sale. A redistributed source copy or substantial portion must retain the copyright notice and the complete MIT permission and warranty text. Taste Blocks should therefore:

1. save the pinned upstream URL and commit on every imported entry;
2. include the full pinned LICENSE.md verbatim in third-party notices;
3. identify changed files and changes;
4. retain licenses for installed dependencies separately;
5. avoid claiming original authorship of copied shadcn source.

The repository license does not grant rights to images merely hotlinked by examples. Those assets are excluded and must be replaced.

## Path conventions

The core table uses this exact implementation prefix:

apps/v4/registry/new-york-v4/ui/

The example table uses this exact current-demo prefix:

apps/v4/examples/radix/

Most current examples import matching style-layer components from apps/v4/styles/radix-nova/ui/. Chat and AI examples import apps/v4/styles/radix-rhea/ui/. Copying an example while silently substituting a different style implementation will change the result. Pin and copy the matching style dependency, or record the adaptation explicitly.

React, Tailwind CSS, the repository cn helper, and ordinary TypeScript types are baseline dependencies and are omitted from repeated cells. Package dependencies and dependent local UI components are listed.

## Core implementations

All 58 are functionally distinct and source-copyable. None is counted as a high-bar showcase item on its own; they are foundations for the shortlisted compositions.

| Component | Exact source after prefix | Package and local dependencies | Current official demo | React Bits-level fit |
| --- | --- | --- | --- | --- |
| Accordion | accordion.tsx | radix-ui, lucide-react | apps/v4/examples/radix/accordion-demo.tsx | Support only |
| Alert | alert.tsx | class-variance-authority | apps/v4/examples/radix/alert-demo.tsx | Support only |
| Alert Dialog | alert-dialog.tsx | radix-ui; Button | apps/v4/examples/radix/alert-dialog-demo.tsx | Support only |
| Aspect Ratio | aspect-ratio.tsx | radix-ui | apps/v4/examples/radix/aspect-ratio-demo.tsx | Support only |
| Attachment | attachment.tsx | radix-ui, class-variance-authority; Button | apps/v4/examples/radix/attachment-demo.tsx | Support for shortlisted attachment compositions |
| Avatar | avatar.tsx | radix-ui | apps/v4/examples/radix/avatar-demo.tsx | Support only |
| Badge | badge.tsx | radix-ui, class-variance-authority | apps/v4/examples/radix/badge-demo.tsx | Support only |
| Breadcrumb | breadcrumb.tsx | radix-ui, lucide-react | apps/v4/examples/radix/breadcrumb-demo.tsx | Support only |
| Bubble | bubble.tsx | radix-ui, class-variance-authority | apps/v4/examples/radix/bubble-demo.tsx | Support for shortlisted bubble compositions |
| Button | button.tsx | radix-ui, class-variance-authority | apps/v4/examples/radix/button-demo.tsx | Support only |
| Button Group | button-group.tsx | radix-ui, class-variance-authority; Button, Separator | apps/v4/examples/radix/button-group-demo.tsx | Support only |
| Calendar | calendar.tsx | react-day-picker, date-fns, lucide-react; Button | apps/v4/examples/radix/calendar-demo.tsx | Support for shortlisted calendar compositions |
| Card | card.tsx | none beyond baseline | apps/v4/examples/radix/card-demo.tsx | Support only |
| Carousel | carousel.tsx | embla-carousel-react, lucide-react; Button | apps/v4/examples/radix/carousel-demo.tsx | Support only |
| Checkbox | checkbox.tsx | radix-ui, lucide-react | apps/v4/examples/radix/checkbox-demo.tsx | Support only |
| Collapsible | collapsible.tsx | radix-ui | apps/v4/examples/radix/collapsible-demo.tsx | Support for shortlisted file tree |
| Combobox | combobox.tsx | @base-ui/react, lucide-react; Button, Input Group | apps/v4/examples/radix/combobox-demo.tsx | Support for shortlisted combobox compositions |
| Command | command.tsx | cmdk, lucide-react; Dialog | apps/v4/examples/radix/command-demo.tsx | Support only |
| Context Menu | context-menu.tsx | radix-ui, lucide-react | apps/v4/examples/radix/context-menu-demo.tsx | Support only |
| Dialog | dialog.tsx | radix-ui, lucide-react; Button | apps/v4/examples/radix/dialog-demo.tsx | Support only |
| Drawer | drawer.tsx | vaul | apps/v4/examples/radix/drawer-demo.tsx | Support for shortlisted responsive drawer/dialog |
| Dropdown Menu | dropdown-menu.tsx | radix-ui, lucide-react | apps/v4/examples/radix/dropdown-menu-demo.tsx | Support only |
| Empty | empty.tsx | class-variance-authority | apps/v4/examples/radix/empty-demo.tsx | Support only |
| Field | field.tsx | class-variance-authority; Label, Separator | apps/v4/examples/radix/field-demo.tsx | Support only |
| Form | form.tsx | radix-ui, react-hook-form, @hookform/resolvers, zod; Button, Label | No current direct Radix demo; legacy wrapper examples only | Support only; prefer current Field patterns |
| Hover Card | hover-card.tsx | radix-ui | apps/v4/examples/radix/hover-card-demo.tsx | Support only |
| Input | input.tsx | none beyond baseline | apps/v4/examples/radix/input-demo.tsx | Support only |
| Input Group | input-group.tsx | class-variance-authority; Button, Input, Textarea | apps/v4/examples/radix/input-group-demo.tsx | Support for shortlisted input compositions |
| Input OTP | input-otp.tsx | input-otp, lucide-react | apps/v4/examples/radix/input-otp-demo.tsx | Support only |
| Item | item.tsx | radix-ui, class-variance-authority; Separator | apps/v4/examples/radix/item-demo.tsx | Support only |
| Kbd | kbd.tsx | none beyond baseline | apps/v4/examples/radix/kbd-demo.tsx | Support only |
| Label | label.tsx | radix-ui | apps/v4/examples/radix/label-demo.tsx | Support only |
| Marker | marker.tsx | radix-ui, class-variance-authority | apps/v4/examples/radix/marker-demo.tsx | Support for shortlisted shimmer marker |
| Menubar | menubar.tsx | radix-ui, lucide-react | apps/v4/examples/radix/menubar-demo.tsx | Support only |
| Message | message.tsx | none beyond baseline | apps/v4/examples/radix/message-demo.tsx | Support for shortlisted message compositions |
| Message Scroller | message-scroller.tsx | @shadcn/react/message-scroller, lucide-react; Button | apps/v4/examples/radix/message-scroller-demo.tsx | Support for shortlisted scroller behaviors |
| Native Select | native-select.tsx | lucide-react | apps/v4/examples/radix/native-select-demo.tsx | Support only |
| Navigation Menu | navigation-menu.tsx | radix-ui, lucide-react, class-variance-authority | apps/v4/examples/radix/navigation-menu-demo.tsx | Support only |
| Pagination | pagination.tsx | lucide-react; Button | apps/v4/examples/radix/pagination-demo.tsx | Support only |
| Popover | popover.tsx | radix-ui | apps/v4/examples/radix/popover-demo.tsx | Support only |
| Progress | progress.tsx | radix-ui | apps/v4/examples/radix/progress-demo.tsx | Support only |
| Radio Group | radio-group.tsx | radix-ui, lucide-react | apps/v4/examples/radix/radio-group-demo.tsx | Support only |
| Resizable | resizable.tsx | react-resizable-panels, lucide-react | apps/v4/examples/radix/resizable-demo.tsx | Support only |
| Scroll Area | scroll-area.tsx | radix-ui | apps/v4/examples/radix/scroll-area-demo.tsx | Support only |
| Select | select.tsx | radix-ui, lucide-react | apps/v4/examples/radix/select-demo.tsx | Support only |
| Separator | separator.tsx | radix-ui | apps/v4/examples/radix/separator-demo.tsx | Support only |
| Sheet | sheet.tsx | radix-ui, lucide-react | apps/v4/examples/radix/sheet-demo.tsx | Support only |
| Skeleton | skeleton.tsx | none beyond baseline | apps/v4/examples/radix/skeleton-demo.tsx | Support only |
| Slider | slider.tsx | radix-ui | apps/v4/examples/radix/slider-demo.tsx | Support only |
| Sonner | sonner.tsx | sonner, next-themes, lucide-react | apps/v4/examples/radix/sonner-demo.tsx | Support only |
| Spinner | spinner.tsx | lucide-react; registry manifest also declares class-variance-authority | apps/v4/examples/radix/spinner-demo.tsx | Support only |
| Switch | switch.tsx | radix-ui | apps/v4/examples/radix/switch-demo.tsx | Support only |
| Table | table.tsx | none beyond baseline | apps/v4/examples/radix/table-demo.tsx | Support only; table compositions excluded |
| Tabs | tabs.tsx | radix-ui, class-variance-authority | apps/v4/examples/radix/tabs-demo.tsx | Support only |
| Textarea | textarea.tsx | none beyond baseline | apps/v4/examples/radix/textarea-demo.tsx | Support only |
| Toggle | toggle.tsx | radix-ui, class-variance-authority | apps/v4/examples/radix/toggle-demo.tsx | Support only |
| Toggle Group | toggle-group.tsx | radix-ui, class-variance-authority; Toggle | apps/v4/examples/radix/toggle-group-demo.tsx | Support only |
| Tooltip | tooltip.tsx | radix-ui | apps/v4/examples/radix/tooltip-demo.tsx | Support only |

Core assets: none are bundled or referenced by the implementation files above.

## Materially distinct current examples

Every filename below is an exact file under apps/v4/examples/radix/ and is itself the current official demo source. The 138 files were selected from 494 TSX examples. “Shortlist” names are the only examples presently suitable for the high-bar Taste Blocks queue. Every other enumerated file is support/reference only and must not inflate the React Bits-level count.

Local UI dependencies refer to the matching apps/v4/styles/radix-nova/ui/ source unless the row says radix-rhea. External dependencies are in addition to React and Tailwind.

| Family | Exact example filenames after prefix | External and local source dependencies | Assets | Demo | High-bar shortlist |
| --- | --- | --- | --- | --- | --- |
| Accordion | accordion-multiple.tsx | radix-nova Accordion | None | Yes | — |
| Alert | alert-action.tsx | radix-nova Alert, Button | None | Yes | — |
| Alert Dialog | alert-dialog-media.tsx | lucide-react; radix-nova Alert Dialog, Button | None | Yes | — |
| Attachment | attachment-group.tsx; attachment-image.tsx; attachment-states.tsx; attachment-trigger.tsx | lucide-react; radix-rhea Attachment, Dialog, Spinner | attachment-image hotlinks Unsplash; replace | Yes | attachment-group; attachment-states |
| Avatar | avatar-badge.tsx; avatar-dropdown.tsx; avatar-group.tsx; avatar-group-count.tsx | radix-nova Avatar, Button, Dropdown Menu | Hotlinked GitHub avatars; replace | Yes | — |
| Badge | badge-link.tsx; badge-spinner.tsx | lucide-react; radix-nova Badge, Spinner | None | Yes | — |
| Breadcrumb | breadcrumb-dropdown.tsx; breadcrumb-ellipsis.tsx | next/link, lucide-react; radix-nova Breadcrumb, Dropdown Menu | None | Yes | — |
| Bubble | bubble-collapsible.tsx; bubble-group-demo.tsx; bubble-markdown.tsx; bubble-popover.tsx; bubble-reactions.tsx; bubble-tooltip.tsx | sonner, lucide-react; apps/v4/components/markdown.tsx; radix-rhea Bubble, Button, Collapsible, Popover, Tooltip | None | Yes | bubble-collapsible; bubble-markdown; bubble-reactions |
| Button | button-spinner.tsx | radix-nova Button, Spinner | None | Yes | — |
| Button Group | button-group-dropdown.tsx; button-group-input-group.tsx; button-group-nested.tsx; button-group-popover.tsx; button-group-select.tsx | lucide-react; radix-nova Button, Button Group, Dropdown Menu, Field, Input, Input Group, Popover, Select, Textarea, Tooltip | None | Yes | — |
| Calendar | calendar-booked-dates.tsx; calendar-custom-days.tsx; calendar-hijri.tsx; calendar-multiple.tsx; calendar-presets.tsx; calendar-range.tsx; calendar-time.tsx; calendar-week-numbers.tsx | date-fns, react-day-picker, react-day-picker/locale, react-day-picker/persian, next/font/google, lucide-react; radix-nova Button, Calendar, Card, Field, Input Group; apps/v4/lib/utils.ts | No images. calendar-hijri loads Vazirmatn through next/font/google; self-host or retain its font license | Yes | calendar-custom-days; calendar-hijri; calendar-time |
| Carousel | carousel-api.tsx; carousel-multiple.tsx; carousel-plugin.tsx | embla-carousel-autoplay; radix-nova Card, Carousel | None | Yes | — |
| Checkbox | checkbox-group.tsx | radix-nova Checkbox, Field | None | Yes | — |
| Collapsible | collapsible-file-tree.tsx; collapsible-settings.tsx | lucide-react; radix-nova Button, Card, Collapsible, Field, Input, Tabs | None | Yes | collapsible-file-tree |
| Combobox | combobox-auto-highlight.tsx; combobox-clear.tsx; combobox-custom.tsx; combobox-groups.tsx; combobox-input-group.tsx; combobox-multiple.tsx; combobox-popup.tsx | lucide-react; radix-nova Button, Combobox, Input Group, Item | None | Yes | combobox-custom; combobox-multiple |
| Command | command-dialog.tsx; command-groups.tsx; command-scrollable.tsx; command-shortcuts.tsx | lucide-react; radix-nova Button, Command | None | Yes | — |
| Context Menu | context-menu-checkboxes.tsx; context-menu-radio.tsx; context-menu-submenu.tsx | radix-nova Context Menu | None | Yes | — |
| Date Picker | data-picker-with-dropdowns.tsx; date-picker-dob.tsx; date-picker-input.tsx; date-picker-natural-language.tsx; date-picker-range.tsx; date-picker-time.tsx | chrono-node, date-fns, react-day-picker, lucide-react; radix-nova Button, Calendar, Field, Input, Input Group, Popover | None | Yes | date-picker-natural-language |
| Dialog | dialog-scrollable-content.tsx; dialog-sticky-footer.tsx | radix-nova Button, Dialog | None | Yes | — |
| Drawer | drawer-dialog.tsx; drawer-scrollable-content.tsx | radix-nova Button, Dialog, Drawer, Input, Label; apps/v4/hooks/use-media-query.ts and apps/v4/lib/utils.ts | None | Yes | drawer-dialog |
| Dropdown Menu | dropdown-menu-avatar.tsx; dropdown-menu-checkboxes.tsx; dropdown-menu-complex.tsx; dropdown-menu-radio-group.tsx; dropdown-menu-submenu.tsx | lucide-react; radix-nova Avatar, Button, Dropdown Menu | dropdown-menu-avatar hotlinks a GitHub avatar; replace | Yes | — |
| Empty | empty-avatar-group.tsx; empty-card.tsx; empty-input-group.tsx | lucide-react; radix-nova Avatar, Button, Empty, Input Group, Kbd | empty-avatar-group hotlinks GitHub avatars; replace | Yes | — |
| Field | field-choice-card.tsx; field-fieldset.tsx; field-group.tsx; field-responsive.tsx | radix-nova Button, Checkbox, Field, Input, Radio Group | None | Yes | — |
| File Upload | file-upload-list.tsx | lucide-react; radix-nova Item, Progress | None | Yes | file-upload-list |
| Input | input-button-group.tsx; input-file.tsx | radix-nova Button, Button Group, Field, Input | User-selected local file only; no bundled asset | Yes | — |
| Input Group | input-group-button-group.tsx; input-group-custom.tsx; input-group-dropdown.tsx; input-group-in-card.tsx; input-group-textarea-examples.tsx; input-group-with-addons.tsx; input-group-with-buttons.tsx; input-group-with-kbd.tsx; input-group-with-tooltip.tsx | react-textarea-autosize, sonner, lucide-react; radix-nova Button, Button Group, Card, Dropdown Menu, Field, Input, Input Group, Kbd, Label, Popover, Spinner, Textarea, Tooltip | None | Yes | input-group-custom; input-group-textarea-examples |
| Input OTP | input-otp-alphanumeric.tsx; input-otp-controlled.tsx; input-otp-form.tsx | input-otp, lucide-react; radix-nova Button, Card, Field, Input OTP | None | Yes | — |
| Item | item-dropdown.tsx; item-group.tsx; item-header.tsx; item-image.tsx; item-link.tsx | next/image, lucide-react; radix-nova Avatar, Button, Dropdown Menu, Item | GitHub avatars, avatar.vercel.sh, and Unsplash URLs; replace | Yes | — |
| Kbd | kbd-input-group.tsx; kbd-tooltip.tsx | lucide-react; radix-nova Button, Button Group, Input Group, Kbd, Tooltip | None | Yes | — |
| Markdown | markdown-demo.tsx | apps/v4/components/markdown.tsx and its dependencies | example.com is only a sample hyperlink | Yes | markdown-demo |
| Marker | marker-link-button.tsx; marker-shimmer.tsx; marker-status.tsx | sonner, lucide-react; radix-rhea Marker, Spinner | None | Yes | marker-shimmer |
| Menubar | menubar-checkbox.tsx; menubar-radio.tsx; menubar-submenu.tsx | radix-nova Menubar | None | Yes | — |
| Message | message-actions.tsx; message-attachment.tsx; message-group.tsx; message-markdown.tsx | lucide-react; apps/v4/components/markdown.tsx; radix-rhea Attachment, Avatar, Bubble, Button, Message | message-attachment hotlinks Unsplash; replace | Yes | message-attachment; message-markdown |
| Message Scroller | message-scroller-anchoring.tsx; message-scroller-animation.tsx; message-scroller-commands.tsx; message-scroller-group-chat.tsx; message-scroller-load-history.tsx; message-scroller-opening-position.tsx; message-scroller-previous-context.tsx; message-scroller-scrollable.tsx; message-scroller-streaming.tsx; message-scroller-visibility.tsx | @ai-sdk/react, sonner, lucide-react; apps/v4/components/message-animated.tsx, apps/v4/lib/ai.ts, apps/v4/lib/message-animations.ts; radix-rhea Bubble, Button, Card, Dropdown Menu, Empty, Hover Card, Input Group, Marker, Message, Message Scroller, Select, Slider, Tabs, Toggle Group, Tooltip | None | Yes | message-scroller-animation; message-scroller-load-history; message-scroller-streaming |
| Native Select | native-select-groups.tsx | radix-nova Native Select | None | Yes | — |
| Popover | popover-form.tsx | radix-nova Button, Field, Input, Popover | None | Yes | — |
| Progress | progress-controlled.tsx | radix-nova Progress, Slider | None | Yes | — |
| Radio | radio-fields.tsx; radio-group-choice-card.tsx | radix-nova Field, Radio Group | None | Yes | — |
| Scroll | scroll-area-horizontal-demo.tsx; scroll-fade-horizontal.tsx; scroll-fade-overflow.tsx | next/image; radix-nova Scroll Area | scroll-area-horizontal-demo hotlinks Unsplash; replace | Yes | — |
| Select | select-groups.tsx; select-scrollable.tsx | radix-nova Select | None | Yes | — |
| Shimmer | shimmer-demo.tsx; shimmer-marker.tsx; shimmer-once.tsx | radix-rhea Button, Marker, Spinner | None | Yes | shimmer-demo; shimmer-once |
| Slider | slider-controlled.tsx; slider-multiple.tsx; slider-range.tsx | radix-nova Label, Slider | None | Yes | — |
| Switch | switch-choice-card.tsx | radix-nova Field, Switch | None | Yes | — |
| Toggle Group | toggle-group-font-weight-selector.tsx | radix-nova Field, Toggle Group | None | Yes | — |

Count check: the table enumerates 138 unique current example files. The high-bar column contains exactly 25 unique files.

## Asset and portability gates

The following are source references, not assets covered safely enough for Taste Blocks redistribution:

| Affected examples | Upstream reference | Required action |
| --- | --- | --- |
| attachment-image | Three images.unsplash.com URLs | Replace with owned or explicitly redistributable local assets |
| avatar examples, dropdown-menu-avatar, empty-avatar-group, item-dropdown | github.com user-avatar URLs | Replace; do not hotlink people’s avatars |
| item-image | avatar.vercel.sh plus three Unsplash URLs | Replace with local licensed media |
| message-attachment | Unsplash URL | Replace with local licensed media |
| scroll-area-horizontal-demo | Three Unsplash URLs | Replace with local licensed media |
| calendar-hijri | Vazirmatn through next/font/google | Prefer a pinned self-hosted font package and retain its OFL notice |

Next-specific examples using next/link, next/image, or next/font/google need documented adapters if Taste Blocks promises framework-neutral React support. The adapter is not a new component and must not be counted separately.

## Exclusions

### Repository areas excluded entirely

- apps/v4/registry/new-york-v4/blocks/: page sections and blocks.
- apps/v4/registry/new-york-v4/charts/ and all chart examples: charts were explicitly excluded.
- Dashboard, task, authentication, and playground page examples under apps/v4/app/(app)/examples/: application/page compositions.
- templates/: complete project templates.
- apps/v4 app-shell, docs, customizer, site navigation, card grids, and route components: site-specific layouts or product UI, not portable components.
- sidebar.tsx and its examples: application layout/navigation shell.
- direction.tsx: provider utility, not a visible component.
- toast registry entry: current registry metadata references toast.tsx, toaster.tsx, and use-toast.ts, but those files are absent from the pinned new-york-v4 source tree. Sonner is the maintained alternative.

### Example classes excluded from the 138

- Basic and demo duplicates when the core implementation already has a representative demo.
- Color, destructive, outline, ghost, secondary, border, rounded, spacing, size, side, alignment, and position-only variants.
- Disabled, invalid, and RTL-only variants.
- Icon-only versions when behavior is unchanged.
- Typography examples.
- Skeleton shape variations.
- Table and data-table examples.
- Chart examples.
- Pure orientation/layout variations such as input-grid, input-inline, and carousel-orientation.
- Form-library duplicates that reproduce the same form with React Hook Form, TanStack Form, Formisch, or Next actions. The current Field-based source is preferred; a form engine is a dependency choice, not a separate visual component.

## Import recommendation

Use shadcn/ui as a pinned foundation and a small source of strong behavioral compositions. Do not bulk-publish its 58 primitives or every docs example as “premium” Taste Blocks content. Begin with the 25-item shortlist, copy the exact upstream files and matching style dependencies, replace all external media, then reject any item whose live preview still looks like ordinary default shadcn rather than a deliberate catalog component.
