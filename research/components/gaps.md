# Research gaps

Checked: 2026-07-20

Seven focused source audits searched for components missing from the strict shortlist. The reports add **5 import-ready research candidates** and **45 conditional candidates** after source-level deduplication. These are candidates, not published or verified components.

| Category | Previous gap | Import-ready found | Conditional found | Best-case gap |
| --- | ---: | ---: | ---: | ---: |
| Text and typography motion | 43 | 0 | 4 | 39 |
| Visual effects | 32 | 0 | 17 | 15 |
| Buttons and actions | 42 | 0 | 3 | 39 |
| Navigation and menus | 38 | 1 | 2 | 35 |
| Media and galleries | 14 | 0 | 8 | 6 |
| Forms and feedback | 20 | 3 | 10 | 7 |
| Status and progress | 15 | 1 | 1 | 13 |
| **Total** | **204** | **5** | **45** | **154** |

The strict research pool can therefore move from 512 to **517 candidates** without conditional repairs, or to a theoretical ceiling of **562** if every conditional candidate passes import and release QA. The verified public count remains unchanged.

## Import-ready research candidates

- Rich Textarea
- React Error Boundary
- React Dual Listbox
- React Responsive Pagination
- Primer Segmented Progress

Each still needs the normal source import, manifest, build, preview, accessibility, responsive, dedupe, and registry-output gates. Import-ready means no blocking source-research issue was found; it does not mean published.

## What the research did not find

- No additional import-ready text-motion, visual-effect, action, or media component passed the full source-level bar.
- Most visually novel effects require WebGL cleanup, static fallback, reduced-motion work, or complete third-party shader provenance.
- Most action and navigation libraries duplicate existing behavior or fail keyboard, focus, RTL, touch, or reduced-motion requirements.
- Generic loaders, standard controls, alternate carousels, style variants, demos, wrappers, and page compositions were not used to fill the gap.

## Decision

1. Import the five clean candidates after the already-running source batches.
2. Use conditional candidates only when the repair is narrow and remains recognizably upstream source.
3. Reject a candidate when repair becomes a redesign or substitute component.
4. Keep animated icons reported separately so they do not disguise category imbalance.
5. Do not lower license, dedupe, accessibility, or anti-slop standards to preserve a target count.

Detailed evidence is in the seven `gap-*-sources.md` inventories beside this file.
