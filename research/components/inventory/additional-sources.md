# Additional React component sources

Checked: 2026-07-20
Scope: React components only. No page sections, layouts, templates, dashboards, paid packs, demo variants, or cosmetic variants.
Status: research and import candidates only; no component code was copied in this pass.

## Decision

Six additional repositories provide useful source-copy candidates that are not covered by the dedicated source inventories. Their **source-local ceiling is 380 components**, before cross-source deduplication and release QA.

| Source | Raw relevant inventory | Countable candidates | Decision |
| --- | ---: | ---: | --- |
| [AnimateIcons](https://github.com/Avijit07x/animateicons) | 281 animated icons | **248** | Accept only the Lucide-derived set, with AnimateIcons MIT plus Lucide ISC and Feather MIT notices. Exclude the Huge set. |
| [Paper Shaders](https://github.com/paper-design/shaders) | 29 React shaders | **28** | Accept at the pinned Apache-2.0 commit. Merge animated/static mesh gradient into one family. |
| [Dice UI](https://github.com/sadmann7/diceui) | broad registry | **32** | Accept the selected behavior-heavy Radix implementations. Do not also import their Base equivalents. |
| [9ui](https://github.com/borabaloglu/9ui) | broad Base UI set | **44** | Accept as a clean Base UI source pool, but expect heavy dedupe against shadcn/origin inventories. |
| [trickle](https://github.com/akaieuan/trickle-UI-kit) | 47 text effects | **12** | Conditional: import only the restrained, materially distinct subset below. Reject its typewriter, scramble, bounce, glow, glitch, and perpetual-motion effects. |
| [Loading UI](https://github.com/turbostarter/loading-ui) | 47 loaders | **16** | Conditional: one mechanism per family, only for real pending states, and only after a reduced-motion patch. |
| **Source-local ceiling** |  | **380** | Not a release count. Cross-source collisions and QA failures must reduce it. |

The 248 icons are real installable React components with different semantic glyphs, but they must be reported separately as an icon family. They must not make a diverse-component KPI look larger than it is.

Known collisions already prevent simple addition:

- 9ui overlaps shadcn, Origin UI, Dice UI, Park UI, and ReUI on standard controls.
- trickle overlaps Fancy Components, SmoothUI, Magic UI, Motion Primitives, and Animata on text reveals and word transitions.
- Loading UI overlaps other spinner and status components.
- Paper Shaders overlaps other sources conceptually on gradients, noise, dithering, and liquid effects; keep the stronger implementation for each behavior.

## Import rules for this inventory

- Import from the exact pinned commit and path, never from a mutable registry URL alone.
- Preserve the upstream license and all required third-party notices.
- One behavior is one component. Directions, colors, timings, styles, presets, static/animated modes, and demos do not add entries.
- Demo assets, fonts, photos, video, copy, brand marks, and documentation-site code are excluded unless separately licensed and recorded.
- A permissive root license does not cure code copied from an incompatible upstream. Sources with suspicious or missing provenance are rejected below.
- Every candidate remains `draft` until build, keyboard, touch, mobile, reduced-motion, cleanup, visual, and provenance checks pass.

## AnimateIcons — 248 animated Lucide components

| Field | Value |
| --- | --- |
| Repository | [Avijit07x/animateicons](https://github.com/Avijit07x/animateicons) |
| Pinned commit | [`380adb3b8eda68ee9c26e846ab8f9799d77f8815`](https://github.com/Avijit07x/animateicons/tree/380adb3b8eda68ee9c26e846ab8f9799d77f8815) |
| Commit date | 2026-06-19 |
| Project license | [MIT, copyright 2025 Avijit Dey](https://github.com/Avijit07x/animateicons/blob/380adb3b8eda68ee9c26e846ab8f9799d77f8815/LICENSE) |
| Upstream glyph license | [Lucide ISC plus Feather MIT](https://github.com/lucide-icons/lucide/blob/main/LICENSE) |
| Count | **248** Lucide components; exclude 33 Huge components |
| Canonical source | `icons/lucide/*-icon.tsx` |
| Canonical enumeration | `data/lucide-icons.json` |

### Dependencies and integration

- React, `motion/react`, and the local `cn` helper.
- Every inspected Lucide file uses `LazyMotion`, an imperative animation handle, and `useReducedMotion`.
- Each icon is a single source file and can be copied through the project's CLI or shadcn path.
- Preserve AnimateIcons MIT, Lucide ISC, and the Feather-derived MIT notice together. The root AnimateIcons MIT notice alone is not enough for Lucide-derived SVG geometry.
- Keep the public category `icons-loaders`; do not create one category per glyph family.

### Quality notes

- Motion is authored at path/group level rather than applying one generic transform to every SVG.
- The API supports hover and imperative control, configurable duration, size, color, and animation disablement.
- Reduced motion is implemented in all 248 checked files.
- Prefer this set over Lucide Animated, LivelyIcons, and Lucide React Motion. Importing multiple Lucide-derived animated sets would create hundreds of semantic duplicates.
- Keyboard focus parity must still be tested in the final host control. An icon's hover animation is decorative; the surrounding button or link owns focus and accessible naming.

### Excluded boundary

Do not ingest `icons/huge/*.tsx`. Hugeicons' current asset terms do not provide a safe public component-library redistribution path for the glyph source. AnimateIcons' project MIT notice cannot grant rights it does not own in upstream icon assets.

## Paper Shaders — 28 shader families

| Field | Value |
| --- | --- |
| Repository | [paper-design/shaders](https://github.com/paper-design/shaders) |
| Pinned commit | [`4d78ae940db2c73c22b6633fb05a3e4743f22551`](https://github.com/paper-design/shaders/tree/4d78ae940db2c73c22b6633fb05a3e4743f22551) |
| Commit date | 2026-07-15 |
| License | [Apache-2.0](https://github.com/paper-design/shaders/blob/4d78ae940db2c73c22b6633fb05a3e4743f22551/LICENSE) |
| Required notice | [NOTICE](https://github.com/paper-design/shaders/blob/4d78ae940db2c73c22b6633fb05a3e4743f22551/NOTICE) |
| Raw React exports | 29 |
| Countable families | **28**; `mesh-gradient` and `static-mesh-gradient` are modes of one family |

Exact React paths, all below `packages/shaders-react/src/shaders/`:

```text
color-panels.tsx
dithering.tsx
dot-grid.tsx
dot-orbit.tsx
fluted-glass.tsx
gem-smoke.tsx
god-rays.tsx
grain-gradient.tsx
halftone-cmyk.tsx
halftone-dots.tsx
heatmap.tsx
image-dithering.tsx
liquid-metal.tsx
mesh-gradient.tsx
metaballs.tsx
neuro-noise.tsx
paper-texture.tsx
perlin-noise.tsx
pulsing-border.tsx
simplex-noise.tsx
smoke-ring.tsx
spiral.tsx
static-mesh-gradient.tsx
static-radial-gradient.tsx
swirl.tsx
voronoi.tsx
warp.tsx
water.tsx
waves.tsx
```

Shared implementation:

```text
packages/shaders-react/src/shader-mount.tsx
packages/shaders-react/src/index.ts
packages/shaders/src/shader-mount.ts
```

### Dependencies and quality

- `@paper-design/shaders-react@0.0.77` depends on same-repository `@paper-design/shaders@0.0.77`; the core package has zero dependencies.
- Peers: React 18/19 and optional React types.
- Native WebGL2, Canvas, `ResizeObserver`, `IntersectionObserver`, and `requestAnimationFrame`.
- The shared engine caps pixel work, handles DPR and resize, pauses while hidden/offscreen, avoids recurring RAF when speed is zero, and disposes observers, textures, programs, frames, and canvas resources.
- Add a deterministic fallback for missing WebGL and connect `prefers-reduced-motion` to `speed={0}`.
- Apache redistribution requires the license, NOTICE propagation, retained relevant notices, and prominent modification markings.
- Stale search indexes still describe older Paper Shaders releases as PolyForm Shield. This approval applies only to the pinned Apache-2.0 commit above.

## Dice UI — 32 behavior-heavy controls

| Field | Value |
| --- | --- |
| Repository | [sadmann7/diceui](https://github.com/sadmann7/diceui) |
| Pinned commit | [`d9763d82530416dfa4c81c462387b55d06bae4ec`](https://github.com/sadmann7/diceui/tree/d9763d82530416dfa4c81c462387b55d06bae4ec) |
| Commit date | 2026-06-29 |
| License | [MIT, copyright 2024 Sadman Sakib](https://github.com/sadmann7/diceui/blob/d9763d82530416dfa4c81c462387b55d06bae4ec/LICENSE) |
| Count | **32** selected logical controls |

All paths are under `docs/registry/bases/radix/ui/` unless stated otherwise:

```text
action-bar.tsx
angle-slider.tsx
banner.tsx
checkbox-group.tsx
circular-progress.tsx
color-picker.tsx
combobox.tsx
compare-slider.tsx
cropper.tsx
editable.tsx
file-upload.tsx
gauge.tsx
key-value.tsx
listbox.tsx
mask-input.tsx
media-player.tsx
mention.tsx
phone-input.tsx
rating.tsx
responsive-dialog.tsx
scroll-spy.tsx
scroller.tsx
segmented-input.tsx
selection-toolbar.tsx
speed-dial.tsx
status.tsx
stepper.tsx
swap.tsx
tags-input.tsx
time-picker.tsx
tour.tsx
```

The 32nd candidate is `docs/registry/bases/radix/components/pending.tsx`.

### Dependencies and quality

- React, Tailwind, `radix-ui`, Dice's local/package primitives, DnD Kit, Floating UI, `media-chrome`, and `vaul`, depending on the selected component.
- Registry items can include hooks and support files; those helpers never increase the component count.
- This is the strongest additional source for application behavior: controlled/form/RTL examples and focused tests exist for editing, masking, rating, scroll-spy, speed-dial, and stepper behavior.
- Use only the Radix version in this inventory. Parallel Base/Radix implementations are ports, not separate components.
- Exclude generic shadcn wrappers, tables/data grids, timelines, cards, marquees, demos, and all page composition.
- Dice UI is strong functionally, but its standard controls will collide with other inventories. Keep the implementation with the better keyboard, RTL, form, test, and dependency profile.

## 9ui — 44 Base UI controls

| Field | Value |
| --- | --- |
| Repository | [borabaloglu/9ui](https://github.com/borabaloglu/9ui) |
| Pinned commit | [`3ec1af7cb6b7a3e402fb7955ea6c1142bb700abb`](https://github.com/borabaloglu/9ui/tree/3ec1af7cb6b7a3e402fb7955ea6c1142bb700abb) |
| Commit date | 2026-02-06 |
| License | [MIT, copyright 2025 borabaloglu](https://github.com/borabaloglu/9ui/blob/3ec1af7cb6b7a3e402fb7955ea6c1142bb700abb/LICENSE.md) |
| Count | **44** source-local components |

All paths are below `apps/www/src/components/ui/`:

```text
accordion.tsx
alert-dialog.tsx
alert.tsx
autocomplete.tsx
breadcrumbs.tsx
button.tsx
calendar.tsx
checkbox.tsx
checkbox-group.tsx
collapsible.tsx
combobox.tsx
command.tsx
context-menu.tsx
dialog.tsx
drawer.tsx
dropdown-menu.tsx
emoji-picker.tsx
form.tsx
input-otp.tsx
input.tsx
menubar.tsx
meter.tsx
navigation-menu.tsx
number-field.tsx
pagination.tsx
phone-input.tsx
popover.tsx
preview-card.tsx
progress.tsx
radio-group.tsx
scroll-area.tsx
select.tsx
sheet.tsx
skeleton.tsx
slider.tsx
sonner.tsx
switch.tsx
tabs.tsx
textarea.tsx
toast.tsx
toggle-group.tsx
toggle.tsx
toolbar.tsx
tooltip.tsx
```

Toast additionally uses `apps/www/src/hooks/use-toast.tsx`.

### Dependencies and quality

- Baseline: `@base-ui/react`, React, Tailwind 4, `lucide-react`, CVA, `clsx`, and `tailwind-merge`.
- Component-specific dependencies include React Hook Form, Zod, `cmdk-base`, `input-otp`, React Day Picker, React Phone Number Input, `sonner`, and `vaul-base`.
- Clean compound APIs, Base UI keyboard/focus semantics, and relatively little custom state machinery.
- Do not copy examples, site cards, charts, tables, carousels, or layout components.
- This is not an additive 44 beside shadcn/Origin/Park/Dice. It is an alternative implementation pool. Dedupe each semantic primitive before import.

## trickle — 12 selected text-motion components

| Field | Value |
| --- | --- |
| Repository | [akaieuan/trickle-UI-kit](https://github.com/akaieuan/trickle-UI-kit) |
| Pinned commit | [`b99c513b1806028137d9d907cebc829d46b62686`](https://github.com/akaieuan/trickle-UI-kit/tree/b99c513b1806028137d9d907cebc829d46b62686) |
| Commit date | 2026-05-02 |
| Component license | [MIT](https://github.com/akaieuan/trickle-UI-kit/blob/b99c513b1806028137d9d907cebc829d46b62686/LICENSE) |
| Demo boundary | `registry/examples/` is separately declared CC0 in `LICENSE-DEMOS`; demos are not needed for ingestion |
| Raw catalog | 47 effects |
| Countable subset | **12** |

Selected paths:

```text
registry/default/text-reveal/text-reveal.tsx
registry/default/word-cascade/word-cascade.tsx
registry/default/ink-bleed/ink-bleed.tsx
registry/default/highlighter-sweep/highlighter-sweep.tsx
registry/default/underline-draw/underline-draw.tsx
registry/default/morph-swap/morph-swap.tsx
registry/default/grain/grain.tsx
registry/default/pixelate/pixelate.tsx
registry/default/wireframe/wireframe.tsx
registry/default/shutter/shutter.tsx
registry/default/static-text/static-text.tsx
registry/default/reflect/reflect.tsx
```

Shared orchestration: `registry/default/text-root/text-root.tsx`. Component CSS variables, keyframes, and reduced-motion overrides live in each item in `registry.json`; copying only the TSX is incomplete.

### Dependencies and quality

- React and Tailwind 4; no animation runtime. Most selected components render as server components with native CSS animation.
- Every registry item supplies a `prefers-reduced-motion` override.
- The sub-character techniques in Pixelate and Wireframe are materially different from a normal opacity/stagger reveal.
- The repository is young and has little adoption history. Treat all twelve as conditional until browser, line-wrap, selectable-text, accessible-name, SSR, and performance QA passes.
- Do not import Typewriter, Decrypt Scramble, Typo Correct, Aurora Text, Shiny Shimmer, Rainbow Roll, Neon Flicker, Bounce, Float, Spin In, Wave, Flutter, Glitch Split, Confetti Text, Marquee Ribbon, or other always-on/decorative entries. They conflict with Taste Blocks' anti-slop rules or duplicate stronger sources.

## Loading UI — 16 selected loader mechanisms

| Field | Value |
| --- | --- |
| Repository | [turbostarter/loading-ui](https://github.com/turbostarter/loading-ui) |
| Pinned commit | [`8d6dc5c0a8610e5f3c093bc2d88b50897f263cdd`](https://github.com/turbostarter/loading-ui/tree/8d6dc5c0a8610e5f3c093bc2d88b50897f263cdd) |
| Commit date | 2026-07-09 |
| License | [MIT, copyright 2026 Bartosz Zagrodzki](https://github.com/turbostarter/loading-ui/blob/8d6dc5c0a8610e5f3c093bc2d88b50897f263cdd/LICENSE.md) |
| Raw registry components | 47 |
| Countable subset | **16** |

All selected paths are below `registry/components/loading-ui/`:

```text
ring.tsx
spiral.tsx
swirling.tsx
comet-spinner.tsx
ripple.tsx
bobbing-dots.tsx
twin-orbit.tsx
morphing-infinity.tsx
accordion-loader.tsx
symmetric-wave.tsx
square-grid.tsx
conveyor-loop.tsx
square-snake.tsx
infinity-track.tsx
analyzing-image.tsx
terminal.tsx
```

### Dependencies and quality

- React, Tailwind, and local `cn` (`clsx` plus `tailwind-merge`). Spiral, Bobbing Dots, Morphing Infinity, and Analyzing Image use `motion`; the other selected entries are CSS/SVG.
- The full registry has good ARIA coverage, but no checked component implements reduced-motion behavior. Add a static or minimally changing status fallback before verification.
- A loader is only valid while real work is pending. Do not run loaders as decoration, invent progress, or leave them looping after work ends.
- Ring/arc/dot variants were collapsed to one representative mechanism. Text shimmer, skeleton, pulse-dot variants, multiple arcs, multiple dot sequences, and shape/color variants are not additional components.
- The repository is new. Validate screen-reader naming, forced colors, high contrast, small sizes, and cleanup before release.

## Mature permissive packages — dependency preferred

These repositories contain excellent React components, but copying their internal multi-file engines would create maintenance work without product value. Use the maintained package and expose only a thin Taste Blocks registry recipe when needed. A wrapper does not become an original component and does not inflate the source-copy count above.

### NumberFlow — 1 component

- Repository: [barvian/number-flow](https://github.com/barvian/number-flow/tree/a7b78f5d4d4b1e2cd4cb53d09d7158461bad493a)
- Commit: `a7b78f5d4d4b1e2cd4cb53d09d7158461bad493a`
- License: [MIT](https://github.com/barvian/number-flow/blob/a7b78f5d4d4b1e2cd4cb53d09d7158461bad493a/LICENSE.md)
- React source: `packages/react/src/NumberFlow.tsx`, `packages/react/src/index.tsx`; core implementation is in the same repository's `packages/core/` source.
- Dependencies: `number-flow`, `esm-env`; React/ReactDOM peers.
- Count: **1** formatted numeric-transition component. Grouping, hooks, continuous mode, trend, currency, percentages, and timing options are capabilities, not new components.
- Quality: locale formatting, stable digit-level motion, grouping, CSP support, explicit motion preference support, and a mature test/release history. Prefer `@number-flow/react` over copying its custom-element engine.

### React Compare Slider — 1 component

- Repository: [nerdyman/react-compare-slider](https://github.com/nerdyman/react-compare-slider/tree/475edaf8b52e7bb844f7c5193bf762e1c0f4f81e)
- Commit: `475edaf8b52e7bb844f7c5193bf762e1c0f4f81e`
- License: [MIT](https://github.com/nerdyman/react-compare-slider/blob/475edaf8b52e7bb844f7c5193bf762e1c0f4f81e/LICENSE)
- Main source: `lib/src/react-compare-slider.tsx`; anatomy in `lib/src/components/{provider,root,item,handle-root,handle,image}.tsx`; support in `lib/src/{hooks,consts,types,utils,register}.ts`.
- Dependencies: zero runtime packages; React/ReactDOM peers.
- Count: **1** compare behavior. Handle and Image are anatomy helpers.
- Quality: slider ARIA, keyboard, pointer/touch, controlled/uncontrolled state, arbitrary React media, iframe contexts, and reduced-motion handling.

### React Photo Album — 3 components

- Repository: [igordanchenko/react-photo-album](https://github.com/igordanchenko/react-photo-album/tree/1b889f47ec271144c16f32f2a7219ae6c53358c9)
- Commit: `1b889f47ec271144c16f32f2a7219ae6c53358c9`
- License: [MIT](https://github.com/igordanchenko/react-photo-album/blob/1b889f47ec271144c16f32f2a7219ae6c53358c9/LICENSE)
- Components: `src/client/rows/RowsPhotoAlbum.tsx`, `src/client/columns/ColumnsPhotoAlbum.tsx`, and `src/client/masonry/MasonryPhotoAlbum.tsx`.
- Required styles: `src/styles/{rows,columns,masonry}.css` plus `src/styles/modules/common.css`.
- Dependencies: zero runtime packages; React peer.
- Count: **3** genuinely different gallery algorithms. Aggregate, static, server, SSR, and infinite-scroll adapters are delivery modes, not new visual components.
- Quality: optimized packing/balancing, responsive image `sizes`/`srcset`, SSR/server/static delivery, and extensive tests. It remains a media component, not a website section.

### Yet Another React Lightbox — 11 functional modules

- Repository: [igordanchenko/yet-another-react-lightbox](https://github.com/igordanchenko/yet-another-react-lightbox/tree/18dc3afe76de67c4f6ea576ab9289b98bf36c550)
- Commit: `18dc3afe76de67c4f6ea576ab9289b98bf36c550`
- License: [MIT](https://github.com/igordanchenko/yet-another-react-lightbox/blob/18dc3afe76de67c4f6ea576ab9289b98bf36c550/LICENSE)
- Core: `src/Lightbox.tsx`.
- Functional plugins: `src/plugins/{captions,counter,download,fullscreen,inline,share,slideshow,thumbnails,video,zoom}/`.
- Dependencies: zero runtime packages; React/ReactDOM peers; core CSS plus optional plugin CSS.
- Count: **1 core plus 10 non-cosmetic plugins**. They can be separate registry additions that depend on the same core, but never duplicate the core code.
- Quality: keyboard/mouse/touch navigation, responsive images, bounded preloading, RTL, modular bundles, tests, type tests, and accessibility linting. Use the package; cherry-picking only `Lightbox.tsx` is incomplete.

## Rejected or held sources

| Source | Decision | Reason |
| --- | --- | --- |
| [Componentry](https://github.com/harshjdhv/componentry) | Reject ingestion | Root is MIT, but several files reproduce excluded-source names and APIs without per-file provenance. `magnet-lines.tsx` closely tracks React Bits' component API, and other entries overlap React Bits/Magic UI. Its generated registry also omits declared GSAP dependencies for Image Trail and Layered Stack. A downstream MIT notice cannot launder incompatible upstream code. |
| [Lucide Animated / pqoqubbw](https://github.com/pqoqubbw/icons) | Hold; prefer AnimateIcons | Root MIT, but README restricts redistribution of tutorials/demos, the 439 icon files lack reduced-motion handling and keyboard-focus parity, and the Lucide/Feather notices are not carried in the repo. It duplicates AnimateIcons semantically. |
| [LivelyIcons](https://github.com/livelyicons/icons) | Reject duplicate | 1,300+ generated Lucide-shape files reuse 14 generic animation modes. It would inflate count through one engine applied to many glyphs and does not document Lucide/Feather notices. |
| [Lucide React Motion](https://github.com/Aadil1505/Lucide-React-Motion) | Reject | Package metadata says MIT, but the checked repository has no root LICENSE file. A package field alone is insufficient for this ingestion policy. |
| [Tent UI](https://www.tentui.com/) | Reject pending evidence | The site says free/open source but exposes no verifiable public source repository and license scope for its registry payloads. Website claims are not enough. |
| [Atlas UI](https://github.com/SnehdeepDupare/atlas-ui) | Hold for quality | Root MIT and 22 React files, but only one implements reduced motion; several are cursor trails, random hacker text, typewriter, duplicate reveals, or page-level parallax. The remaining subset is not strong enough to prioritize over verified sources. |
| [Velora UI](https://github.com/ColorlibHQ/velora-ui) | Reject duplicate/provenance risk | Root MIT, but most of its 32 entries mirror Magic UI/Aceternity names and behaviors without a per-file upstream ledger. Use the original verified source instead of a downstream repackage. |
| [ExtrudeUI](https://github.com/Oia20/ExtrudeUI) | Hold | Root says MIT while the publishable package says ISC; source includes a default remote font with no recorded license and carries a heavy Three/Fiber/Drei/React Spring stack. Clarify package scope and remove the font before reconsidering. |
| uicomponents.dev | Reject | The advertised GitHub target returned 404; no pinned public source or license artifact could be verified. |
| `GriffinJohnston/ldrs` | Not a source-copy candidate | MIT and polished, but it is a Web Component/npm loader package rather than React source-copy components. Do not wrap 44 loaders merely to increase count. |

## Recommended order

1. Import AnimateIcons' Lucide subset as a separately labeled icon collection with all three notices.
2. Import Paper Shaders with the shared engine, Apache NOTICE, deterministic fallback, and reduced-motion wiring.
3. Use Dice UI for behavior-heavy gaps after semantic dedupe against existing control inventories.
4. Use 9ui only where its Base UI implementation wins the comparison; do not bulk-copy duplicate primitives.
5. Visually audit the 12 trickle and 16 Loading UI candidates before copying any of them.
6. Keep NumberFlow, Compare Slider, Photo Album, and Lightbox as dependencies unless a concrete maintenance reason justifies vendoring.

This ordering yields strong components quickly without repeating the earlier mistake of manufacturing a large count from weak variants or untraceable code.
