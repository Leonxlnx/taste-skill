# Origin UI component inventory

Checked: 2026-07-20
Scope: React components only. No landing-page sections, page layouts, templates, dashboards, navbars, or color/size-only variants.
Status: source and license candidate inventory; no implementation code was copied in this pass.

## Decision

Origin UI's preserved legacy app is legally usable source material for a public Taste Blocks registry, provided the MIT notice is retained and copying stays strictly inside the MIT-scoped `apps/origin/` directory. It is **not** accepted as a 466-component pool.

The pinned snapshot contains 599 numbered examples. The list below preserves **466 source fixtures for discovery**, not 466 countable components:

- 599 numbered source examples
- minus 20 navbar compositions (`comp-577` through `comp-596`)
- minus 113 obvious color, status, border, radius, size, spacing, disabled-state, or otherwise cosmetic duplicates
- **466 source fixtures retained for review**

Direct audit found that 454 of these 466 files export a parameterless demo function and 449 wrap existing `registry/default/ui/*` primitives. Examples such as `comp-01`, `comp-02`, and `comp-03` are different fixtures around the same input contract. They therefore do not enter the Taste Blocks target count. Only a genuinely distinct composed interaction may be reconsidered individually after global family deduplication; the underlying Origin primitives are dependency or comparison material, not hundreds of separate products.

## Pinned source and license

| Field | Evidence |
| --- | --- |
| Historical repository URL | [`origin-space/originui`](https://github.com/origin-space/originui), now redirected to `cosscom/coss` |
| Current official repository | [`cosscom/coss`](https://github.com/cosscom/coss) |
| Pinned repository commit | [`b4591e7f73941b8da93724426bd6d6cca46c81e9`](https://github.com/cosscom/coss/tree/b4591e7f73941b8da93724426bd6d6cca46c81e9), 2026-07-15T21:59:26+05:30 |
| In-scope source root | [`apps/origin/`](https://github.com/cosscom/coss/tree/b4591e7f73941b8da93724426bd6d6cca46c81e9/apps/origin) |
| Canonical manifest | [`apps/origin/registry.json`](https://github.com/cosscom/coss/blob/b4591e7f73941b8da93724426bd6d6cca46c81e9/apps/origin/registry.json) |
| Category manifest | [`apps/origin/config/components.ts`](https://github.com/cosscom/coss/blob/b4591e7f73941b8da93724426bd6d6cca46c81e9/apps/origin/config/components.ts) |
| Mixed-repository boundary | [`LICENSING.md`](https://github.com/cosscom/coss/blob/b4591e7f73941b8da93724426bd6d6cca46c81e9/LICENSING.md) makes the repository AGPL by default but explicitly assigns `apps/origin/` and `apps/ui/` to MIT |
| Applicable nested license | [`apps/origin/LICENSE.md`](https://github.com/cosscom/coss/blob/b4591e7f73941b8da93724426bd6d6cca46c81e9/apps/origin/LICENSE.md): MIT, copyright 2025 coss.com, originally copyright 2025 Origin UI |

The MIT grant permits use, modification, publication, redistribution, sublicensing, and sale. A public free registry may therefore redistribute copied or adapted files, and a separate later paid tier may coexist with it. The copyright and permission notice must remain in every copy or substantial portion. Upstream-derived files do not become exclusively proprietary merely because Taste Blocks also offers original paid components.

This is a provenance conclusion, not legal advice. It applies only to the pinned `apps/origin/` files. Runtime packages, remote media, photographs, trademarks, and any later upstream license change require separate review.

## Hard boundaries

Include only:

- numbered React examples under `apps/origin/registry/default/components/`
- their required primitives under `apps/origin/registry/default/ui/`
- their explicitly listed local hooks and event-calendar support files
- the MIT notice and exact pinned provenance

Exclude:

- `apps/www/`, root packages, and every other AGPL-default path in `cosscom/coss`
- `apps/ui/` from this inventory; it is a different current product and needs its own source review even though the directory is also MIT-scoped
- [`origin-space/ui-experiments`](https://github.com/origin-space/ui-experiments); its official README permits project use but explicitly forbids partial or complete redistribution/resale
- `comp-577` through `comp-596`; these are complete navbar compositions, not atomic components
- Origin's catalog app, marketing UI, page wrappers, and generated site files
- alternate semantic colors, sizes, radii, icon directions, border treatments, disabled-only examples, and content-only presets as separate products
- bundled or remote demo media until asset provenance is independently cleared

## Discovery fixture paths

Every ID below expands to the exact source path `apps/origin/registry/default/components/<ID>.tsx` at the pinned commit. Origin uses opaque numbered filenames rather than stable descriptive component names. Duplicate files that appear in multiple upstream categories are assigned once here: `comp-125`/`comp-126` to File upload, `comp-41`/`comp-42` to Calendar, and `comp-554` to Image Cropper.

| Category | Count | Fixture IDs |
| --- | ---: | --- |
| Accordion | 15 | `comp-334`, `comp-335`, `comp-336`, `comp-337`, `comp-338`, `comp-339`, `comp-340`, `comp-342`, `comp-345`, `comp-348`, `comp-349`, `comp-350`, `comp-351`, `comp-352`, `comp-353` |
| Alert | 3 | `comp-267`, `comp-275`, `comp-277` |
| Avatar | 11 | `comp-390`, `comp-391`, `comp-392`, `comp-394`, `comp-397`, `comp-398`, `comp-400`, `comp-401`, `comp-409`, `comp-410`, `comp-412` |
| Badge | 10 | `comp-413`, `comp-415`, `comp-416`, `comp-417`, `comp-418`, `comp-419`, `comp-420`, `comp-423`, `comp-424`, `comp-425` |
| Banner | 11 | `comp-301`, `comp-302`, `comp-303`, `comp-304`, `comp-305`, `comp-306`, `comp-308`, `comp-309`, `comp-310`, `comp-311`, `comp-312` |
| Breadcrumb | 6 | `comp-446`, `comp-447`, `comp-448`, `comp-449`, `comp-450`, `comp-453` |
| Button and action | 46 | `comp-78`, `comp-81`, `comp-82`, `comp-85`, `comp-86`, `comp-87`, `comp-88`, `comp-89`, `comp-90`, `comp-91`, `comp-92`, `comp-93`, `comp-94`, `comp-95`, `comp-96`, `comp-98`, `comp-99`, `comp-100`, `comp-101`, `comp-102`, `comp-104`, `comp-105`, `comp-106`, `comp-107`, `comp-108`, `comp-109`, `comp-110`, `comp-111`, `comp-112`, `comp-113`, `comp-114`, `comp-115`, `comp-116`, `comp-117`, `comp-118`, `comp-119`, `comp-120`, `comp-121`, `comp-122`, `comp-123`, `comp-124`, `comp-127`, `comp-128`, `comp-129`, `comp-130`, `comp-131` |
| Calendar and date picker | 21 | `comp-41`, `comp-42`, `comp-487`, `comp-488`, `comp-489`, `comp-490`, `comp-491`, `comp-492`, `comp-497`, `comp-498`, `comp-499`, `comp-500`, `comp-502`, `comp-503`, `comp-504`, `comp-505`, `comp-506`, `comp-507`, `comp-510`, `comp-511`, `comp-512` |
| Checkbox | 17 | `comp-132`, `comp-133`, `comp-137`, `comp-138`, `comp-139`, `comp-140`, `comp-141`, `comp-142`, `comp-143`, `comp-144`, `comp-145`, `comp-146`, `comp-147`, `comp-148`, `comp-149`, `comp-150`, `comp-151` |
| Image cropper | 5 | `comp-554`, `comp-555`, `comp-561`, `comp-563`, `comp-564` |
| Dialog and modal | 21 | `comp-313`, `comp-314`, `comp-315`, `comp-316`, `comp-317`, `comp-318`, `comp-319`, `comp-320`, `comp-321`, `comp-322`, `comp-323`, `comp-324`, `comp-325`, `comp-326`, `comp-327`, `comp-328`, `comp-329`, `comp-330`, `comp-331`, `comp-332`, `comp-333` |
| Dropdown | 14 | `comp-366`, `comp-368`, `comp-369`, `comp-370`, `comp-371`, `comp-372`, `comp-373`, `comp-374`, `comp-375`, `comp-376`, `comp-377`, `comp-378`, `comp-379`, `comp-380` |
| File upload | 13 | `comp-125`, `comp-126`, `comp-543`, `comp-544`, `comp-545`, `comp-546`, `comp-547`, `comp-548`, `comp-549`, `comp-550`, `comp-551`, `comp-552`, `comp-553` |
| Event calendar | 1 | `comp-542` |
| Input | 49 | `comp-01`, `comp-02`, `comp-03`, `comp-04`, `comp-06`, `comp-09`, `comp-11`, `comp-13`, `comp-14`, `comp-15`, `comp-16`, `comp-17`, `comp-18`, `comp-19`, `comp-20`, `comp-21`, `comp-22`, `comp-23`, `comp-24`, `comp-25`, `comp-26`, `comp-27`, `comp-28`, `comp-29`, `comp-30`, `comp-31`, `comp-32`, `comp-33`, `comp-34`, `comp-35`, `comp-36`, `comp-37`, `comp-38`, `comp-39`, `comp-40`, `comp-43`, `comp-44`, `comp-45`, `comp-46`, `comp-47`, `comp-48`, `comp-50`, `comp-51`, `comp-53`, `comp-54`, `comp-55`, `comp-56`, `comp-58`, `comp-486` |
| Notification and toast | 14 | `comp-279`, `comp-283`, `comp-287`, `comp-288`, `comp-289`, `comp-290`, `comp-293`, `comp-294`, `comp-295`, `comp-296`, `comp-297`, `comp-298`, `comp-299`, `comp-300` |
| Pagination | 12 | `comp-454`, `comp-455`, `comp-456`, `comp-457`, `comp-458`, `comp-459`, `comp-460`, `comp-461`, `comp-462`, `comp-463`, `comp-464`, `comp-465` |
| Popover | 9 | `comp-381`, `comp-382`, `comp-383`, `comp-384`, `comp-385`, `comp-386`, `comp-387`, `comp-388`, `comp-389` |
| Radio | 18 | `comp-152`, `comp-155`, `comp-156`, `comp-157`, `comp-158`, `comp-159`, `comp-160`, `comp-161`, `comp-162`, `comp-163`, `comp-164`, `comp-165`, `comp-166`, `comp-167`, `comp-168`, `comp-169`, `comp-170`, `comp-171` |
| Select, combobox, and multiselect | 38 | `comp-189`, `comp-191`, `comp-192`, `comp-197`, `comp-198`, `comp-199`, `comp-200`, `comp-201`, `comp-202`, `comp-203`, `comp-205`, `comp-206`, `comp-208`, `comp-211`, `comp-213`, `comp-214`, `comp-216`, `comp-217`, `comp-218`, `comp-220`, `comp-221`, `comp-222`, `comp-224`, `comp-225`, `comp-226`, `comp-227`, `comp-228`, `comp-229`, `comp-230`, `comp-231`, `comp-232`, `comp-233`, `comp-234`, `comp-235`, `comp-236`, `comp-237`, `comp-238`, `comp-239` |
| Slider | 22 | `comp-240`, `comp-245`, `comp-246`, `comp-247`, `comp-248`, `comp-249`, `comp-250`, `comp-251`, `comp-252`, `comp-254`, `comp-255`, `comp-256`, `comp-257`, `comp-258`, `comp-259`, `comp-260`, `comp-261`, `comp-262`, `comp-263`, `comp-264`, `comp-265`, `comp-266` |
| Stepper | 16 | `comp-513`, `comp-514`, `comp-516`, `comp-517`, `comp-518`, `comp-519`, `comp-520`, `comp-521`, `comp-522`, `comp-523`, `comp-524`, `comp-525`, `comp-526`, `comp-527`, `comp-528`, `comp-529` |
| Switch | 10 | `comp-172`, `comp-179`, `comp-180`, `comp-181`, `comp-182`, `comp-183`, `comp-185`, `comp-186`, `comp-187`, `comp-188` |
| Table | 19 | `comp-466`, `comp-467`, `comp-468`, `comp-470`, `comp-471`, `comp-472`, `comp-473`, `comp-474`, `comp-475`, `comp-476`, `comp-477`, `comp-478`, `comp-479`, `comp-480`, `comp-481`, `comp-482`, `comp-483`, `comp-484`, `comp-485` |
| Tabs | 19 | `comp-426`, `comp-428`, `comp-429`, `comp-430`, `comp-431`, `comp-432`, `comp-433`, `comp-434`, `comp-435`, `comp-436`, `comp-437`, `comp-438`, `comp-439`, `comp-440`, `comp-441`, `comp-442`, `comp-443`, `comp-444`, `comp-445` |
| Textarea | 11 | `comp-59`, `comp-60`, `comp-61`, `comp-62`, `comp-64`, `comp-68`, `comp-69`, `comp-71`, `comp-72`, `comp-73`, `comp-74` |
| Timeline | 10 | `comp-530`, `comp-531`, `comp-533`, `comp-534`, `comp-535`, `comp-536`, `comp-537`, `comp-538`, `comp-539`, `comp-540` |
| Tooltip and hover card | 10 | `comp-354`, `comp-357`, `comp-358`, `comp-359`, `comp-360`, `comp-361`, `comp-362`, `comp-363`, `comp-364`, `comp-365` |
| Tree | 15 | `comp-565`, `comp-566`, `comp-567`, `comp-568`, `comp-569`, `comp-570`, `comp-571`, `comp-572`, `comp-573`, `comp-574`, `comp-575`, `comp-576`, `comp-597`, `comp-598`, `comp-599` |
| **Total** | **466** | Source fixture files, not component count |

## Dependencies

Upstream's host baseline at the pinned commit is React `^19.2.6`, React DOM `^19.2.6`, Tailwind CSS `^4.1.17`, `lucide-react ^0.539.0`, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.4.0`, and `tw-animate-css ^1.4.0`.

The table below lists meaningful transitive package dependencies after resolving each candidate's local registry primitives. A dash means no extra package beyond the baseline.

| Candidate family | Extra packages |
| --- | --- |
| Accordion, Avatar, Badge, Banner, Breadcrumb, Checkbox, Dropdown, File upload, Pagination, Popover, Slider, Stepper, Switch, Tabs, Textarea, Timeline, Tooltip | `radix-ui` |
| Alert | — |
| Button | `radix-ui`, `@remixicon/react` |
| Calendar | `radix-ui`, `react-aria-components`, `react-day-picker`, `@internationalized/date`, `date-fns` |
| Image cropper | `radix-ui`, `@origin-space/image-cropper` |
| Dialog | `radix-ui`, `cmdk`, `input-otp`, `react-payment-inputs` |
| Event calendar | `radix-ui`, `react-day-picker`, `date-fns`, `sonner`, `next-themes`, `@remixicon/react`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/utilities` |
| Input | `radix-ui`, `react-aria`, `react-aria-components`, `@internationalized/date`, `emblor`, `input-otp`, `react-payment-inputs`, `react-phone-number-input`, `use-mask-input` |
| Notification | `radix-ui`, `sonner` |
| Radio | `radix-ui`, `@remixicon/react` |
| Select | `radix-ui`, `cmdk`, `react-aria-components`, `@remixicon/react` |
| Table | `radix-ui`, `@tanstack/react-table`, `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Tree | `radix-ui`, `@headless-tree/core`, `@headless-tree/react` |

Required local support files are declared by the upstream manifest and must travel with the relevant candidate. They include:

- `registry/default/hooks/use-character-limit.ts`
- `registry/default/hooks/use-file-upload.ts`
- `registry/default/hooks/use-pagination.ts`
- `registry/default/hooks/use-slider-with-input.ts`
- `registry/default/hooks/use-toast.ts`
- all 18 files under `registry/default/components/event-calendar/` for `comp-542`
- the referenced primitives under `registry/default/ui/`, not arbitrary copies from another shadcn version

## Assets

Most candidates are code-only. The following selected candidates reference media from `apps/origin/public/`:

- avatar images: `comp-94`, `comp-95`, `comp-226`, `comp-228`, `comp-295`, `comp-331`, `comp-363`, `comp-364`, `comp-376`, `comp-377`, `comp-390`, `comp-394`, `comp-397`, `comp-398`, `comp-400`, `comp-401`, `comp-409`, `comp-410`, `comp-412`, `comp-518`, `comp-536`, and `comp-539`
- `dialog-content.png`: `comp-332`, `comp-359`, and `comp-365`
- `profile-bg.jpg`: `comp-331`
- `ui-dark.png`, `ui-light.png`, and `ui-system.png`: `comp-169`
- `comp-555`, `comp-561`, and `comp-563` use remote sample images from `origin-space/origin-images`

Although these files sit inside the MIT-scoped directory, the repository does not provide separate authorship or model-release evidence for the photographs. Do not redistribute them in Taste Blocks until provenance is cleared. Prefer caller-provided media or owned neutral fixtures. The component code remains a candidate if its demo media is replaced.

## Demo and registry availability

- Every selected ID has a tracked TSX source file and a generated JSON entry under `apps/origin/public/r/` at the pinned commit.
- The live category pages are available at `https://coss.com/origin/<category-slug>`; for example, [Accordion](https://coss.com/origin/accordion) and [Button](https://coss.com/origin/button).
- Individual registry payloads are served at `https://coss.com/origin/r/<ID>.json`; for example, [`comp-334`](https://coss.com/origin/r/comp-334.json).
- Live availability is evidence for previewing, not provenance. Import from the pinned GitHub source, never by silently scraping the mutable live endpoint.

## Import gates

Before any candidate becomes a Taste Blocks entry:

1. Copy only the exact pinned TSX, declared support files, and required primitives.
2. Record original repository, commit, path, author copyright, MIT license, and every local modification.
3. Preserve the full Origin UI/coss.com MIT notice in third-party notices distributed with the registry.
4. Independently verify every external package license and pin a compatible version; dependency names above are not license clearance.
5. Replace or separately clear every demo photograph, screenshot, remote image, external logo, and branded example.
6. Give the opaque `comp-*` entry a descriptive Taste Blocks name without implying original authorship or endorsement.
7. Run build, hydration, keyboard, screen-reader semantics, mobile, reduced-motion, cleanup, and console checks.
8. Reject visually weak, obsolete, inaccessible, or duplicate candidates instead of importing them to inflate the count.
