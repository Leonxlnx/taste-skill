# UI-X component audit

## Source and rights

- Repository: `https://github.com/junwen-k/ui-x`
- Pinned revision: `800d4f47fec33524967f97fde59a762df4afbf00`
- Retrieved: `2026-07-20`
- Repository identity was verified from the exact Git remote and detached commit.
- License: MIT. The copied `LICENSE` matches the repository blob at the pinned revision with SHA-256 `a80d52497975e3a97ebf893008dab7ad8ea176e9b48b179b443c60650af770e2`.
- Every shipped file has an immutable GitHub permalink, exact upstream Git-blob SHA-256, copied-content SHA-256, and modification record in `drafts.json`.

The tested direct dependencies are permissive: Base UI React 1.6.0, Base UI Utils 0.3.1, clsx 2.1.1, react-day-picker 9.7.0, timescape 0.8.0, tailwind-merge 3.6.0, react-dropzone 17.0.0, react-phone-number-input 3.4.17, and Virtua 0.49.3 declare MIT; Lucide React 0.511.0 declares ISC.

## Retained components

1. Date Time Range Field
2. Dropzone
3. Phone Input
4. Virtualized Collection

These are standalone components. None is a website section, layout, template, screen, dashboard, or ordinary atom. Internal primitives and hooks needed by a retained component are bundled as support files and are not counted as additional components.

## Rejected registry items

UI-X exposes 27 registry items at the pinned revision. Four headline components were retained and 23 entries were rejected:

- Emoji Picker: Frimousse 0.3.0 fetches Emojibase data from jsDelivr by default, violating the no-remote-runtime-assets rule.
- Wheel Picker: duplicates the existing momentum wheel-picker family.
- Sortable: substantially overlaps the existing selectable, draggable grid-list family.
- Badge Group: duplicates the existing selectable/removable tag-group family.
- Date Picker and Date Picker Primitive: overlap existing segmented date pickers and calendar date-time controls.
- BProgress Provider for Next App and Next Pages: near-duplicate framework integration wrappers, not distinct visual components.
- Confirmer: a thin imperative alert-dialog wrapper and an ordinary modal action pattern.
- Password Input and Password Input Primitive: ordinary input enhancement already covered by standard form controls.
- Description List, Time, and Timeline: ordinary semantic/display primitives without a distinct interaction model.
- Date Field, Date Time Field, and Time Field: narrower variants of the retained range field and redundant as separate catalog entries.
- Date Time Field Primitive, Date Time Range Field Primitive, Dropzone Primitive, Phone Input Primitive, and Use Timescape: implementation layers or hooks, not headline components. Required source is bundled only inside the relevant retained item.

## Adaptations

- Changed UI-X internal aliases to relative source-local imports so every retained item has a closed install graph.
- Kept official shadcn dependencies explicit through `registryDependencies` rather than copying or disguising them.
- Set the optional Dropzone trigger to `type="button"` so it cannot submit a parent form.
- Disabled the Dropzone color transition under `prefers-reduced-motion`.
- No component behavior, styling system, or public API was replaced with an invented substitute.

## Verification

- Source verifier against Git blobs at the pinned revision: passed for all 4 retained components.
- Taste Blocks source/draft policy: 4 drafts passed.
- Current-manifest global name, family, source-hash, content-hash, and structure-hash collision check: no UI-X collision.
- Official shadcn registry build: 4 component payloads and root registry built successfully.
- Strict TypeScript: passed inside UI-X's own React 19.2.7 and Next.js 16.2.10 application.
- Next.js production build: passed, including the isolated QA route.
- Chrome runtime QA: file drop acceptance, date-segment keyboard input, country selection and phone formatting, 10,000-item virtualization, touch viewport, RTL, reduced motion, navigation unmount/remount, and narrow viewport all passed.
- Desktop and 390 px viewport overflow: 0 px.
- Virtualized DOM: 23 rendered rows for a 10,000-item collection.
- Runtime errors: 0.
- Component-originated external requests: 0. The upstream QA application's own exact `site.webmanifest` request was excluded from component traffic.
- Remote runtime asset and secret scans: no retained source hit.
