# Component Shortlist

Checked: 2026-07-20

This is the strict, globally deduplicated import queue for Taste Blocks. It is not a verified manifest count.

## Decision

- The current research can nominate **512 distinct source-backed components**.
- **248 are animated Lucide glyph components** from AnimateIcons. They are valid components only when the glyph geometry and authored interaction are materially distinct. Duration, color, size, trigger, and timing variants never add a count.
- The remaining sources contribute **264 non-AnimateIcons candidates**.
- The projected category mix contains 250 icon or microinteraction entries in total. Capping every category at the targets in `categories.md` leaves only **296 of 500 target-aligned slots filled**.
- The original balanced 500-component goal therefore still has an honest **204-component research gap**.
- The raw 512 makes "500 including animated icons" mathematically possible, but it is not a safe release projection: only 12 candidates may fail before the total drops below 500, and the verified manifest count is currently zero.

Do not describe this file as a 512-component library. A component counts only after source import, provenance, license, deduplication, build, preview, accessibility, responsive, reduced-motion, and visual gates pass.

## Bucket meanings

- **Import now:** source may enter the staging importer. Normal verification still applies.
- **Conditional repair:** a known issue has a narrow repair path. Reject it if the change becomes a redesign or a new component.
- **Reject:** do not import in this phase. This includes legal conflicts, sections, layouts, screens, variants, weak wrappers, unlicensed assets, excessive dependency systems, duplicate families, and anti-slop failures.

## Projected globally deduplicated count

The category columns use the nine categories in `categories.md`.

| Source | Text | Effects | Actions | Navigation | Media | Containers | Forms | Icons | Status | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AnimateIcons | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 248 | 0 | 248 |
| Paper Shaders | 0 | 16 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 16 |
| Dice UI | 0 | 0 | 3 | 1 | 3 | 3 | 14 | 0 | 4 | 28 |
| 9ui | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 1 | 3 |
| trickle | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 |
| Loading UI | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 10 |
| Mature packages | 0 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | 1 | 16 |
| Animata | 3 | 0 | 3 | 3 | 4 | 21 | 0 | 0 | 1 | 35 |
| Cult UI | 2 | 3 | 3 | 2 | 3 | 3 | 3 | 0 | 1 | 20 |
| UI Layouts | 0 | 2 | 0 | 2 | 2 | 2 | 1 | 0 | 0 | 9 |
| Fancy Components | 8 | 6 | 0 | 0 | 2 | 1 | 1 | 0 | 0 | 18 |
| SmoothUI | 3 | 5 | 3 | 1 | 6 | 11 | 3 | 2 | 0 | 34 |
| Kibo UI | 1 | 0 | 1 | 1 | 4 | 7 | 3 | 0 | 1 | 18 |
| Kokonut UI | 0 | 0 | 3 | 3 | 0 | 2 | 3 | 0 | 0 | 11 |
| Magic UI Free | 1 | 4 | 2 | 0 | 5 | 2 | 0 | 0 | 0 | 14 |
| Motion Primitives | 3 | 2 | 0 | 2 | 0 | 3 | 0 | 0 | 1 | 11 |
| shadcn/ui examples | 0 | 0 | 0 | 1 | 2 | 6 | 6 | 0 | 0 | 15 |
| **Projected candidates** | **27** | **38** | **18** | **17** | **46** | **61** | **35** | **250** | **20** | **512** |

### Gap against the planned category mix

| Category | Target | Current candidates | Gap |
| --- | ---: | ---: | ---: |
| Text and typography motion | 70 | 27 | 43 |
| Visual effects | 70 | 38 | 32 |
| Buttons and actions | 60 | 18 | 42 |
| Navigation and menus | 55 | 17 | 38 |
| Media and galleries | 60 | 46 | 14 |
| Cards and containers | 55 | 61 | 0 |
| Forms and feedback | 55 | 35 | 20 |
| Icons and microinteractions | 40 | 250 | 0 |
| Status and progress | 35 | 20 | 15 |
| **Missing target-aligned components** |  |  | **204** |

The next research round should prioritize actions, navigation, text, effects, forms, and status. More icon packs, card skins, loaders, and generic reveal presets do not close this gap.

## Global family winners

These choices prevent the same behavior from being counted under several source names.

| Family | Canonical source | Reject as duplicates |
| --- | --- | --- |
| Animated glyphs | AnimateIcons Lucide set | Lucide Animated, LivelyIcons, Lucide React Motion, other generated Lucide ports |
| Numeric transition | NumberFlow | Cult Animated Number, Motion Animated Number and Sliding Number, Magic Number Ticker, SmoothUI Number Flow and Price Flow, Animata Counter |
| Image comparison | React Compare Slider | Dice Compare Slider, Motion Image Comparison, Kibo Comparison |
| Standard behavior-heavy controls | Dice UI Radix tree | Matching 9ui, Park UI, ReUI, Flowbite, Tremor, Origin, and ordinary shadcn fixtures |
| Device/media frame | Magic UI Safari | Magic Android and iPhone plus other source-equivalent device skins |
| Direction-aware tabs | Cult UI | Generic animated-tabs skins from other sources |
| Animated dock | Motion Primitives | Cult Dock, Magic Dock, UI Layouts Magnified Doc |
| Tree | Kibo UI | Magic File Tree and duplicate standard tree implementations |
| Theme transition | Magic UI Animated Theme Toggler | Kibo, Kokonut, and Flowbite theme toggles |
| Text morph | Motion Primitives | trickle Morph Swap and source-equivalent phrase morphs |
| Shader effects | Paper Shaders for matching shader families | Downstream or weaker copies with the same shader result |

## Additional sources

### AnimateIcons - 248

**Import now**

- All 248 entries enumerated by `data/lucide-icons.json` whose exact source is `icons/lucide/<name>-icon.tsx` at commit `380adb3b8eda68ee9c26e846ab8f9799d77f8815`.
- Count each normalized SVG glyph and authored motion state graph once.
- Preserve AnimateIcons MIT, Lucide ISC, and Feather MIT notices together.

**Conditional repair**

- Host controls must provide keyboard focus, accessible names, and a non-hover trigger where motion communicates state.
- Remove any alias whose normalized SVG geometry and interaction are equivalent to another entry. The projected 248 assumes this final alias check passes.

**Reject**

- `icons/huge/*.tsx`.
- Duration, color, size, easing, hover-versus-imperative, and disabled-animation variants.
- Lucide Animated, LivelyIcons, Lucide React Motion, and other semantically duplicate animated Lucide collections.

### Paper Shaders - 16

**Import now**

- None. Every selected shader first needs the Apache notice, modified-file marker, fallback, and reduced-motion wiring.

**Conditional repair**

All paths are below `packages/shaders-react/src/shaders/`:

- `color-panels.tsx`
- `dithering.tsx`
- `fluted-glass.tsx`
- `gem-smoke.tsx`
- `god-rays.tsx`
- `halftone-cmyk.tsx`
- `heatmap.tsx`
- `image-dithering.tsx`
- `liquid-metal.tsx`
- `metaballs.tsx`
- `paper-texture.tsx`
- `perlin-noise.tsx`
- `spiral.tsx`
- `voronoi.tsx`
- `warp.tsx`
- `water.tsx`

Use the shared `shader-mount` implementation once. Add a deterministic no-WebGL fallback and map reduced motion to a static frame.

**Reject**

- `dot-grid.tsx` and `dot-orbit.tsx`: empty decorative grid/orbit motion.
- `pulsing-border.tsx`: decorative looping border.
- `mesh-gradient.tsx` and `static-mesh-gradient.tsx`: one generic gradient family and a static/animated mode pair.
- `static-radial-gradient.tsx` and `grain-gradient.tsx`: weak generic decoration.
- `neuro-noise.tsx` and `simplex-noise.tsx`: product-level duplicates of the selected noise family.
- `halftone-dots.tsx`: duplicate halftone mechanism.
- `smoke-ring.tsx`: duplicate smoke family.
- `swirl.tsx` and `waves.tsx`: overlap the selected spatial field effects and add no needed contract.

### Dice UI - 28

All selected files are below `docs/registry/bases/radix/ui/` except `pending.tsx`.

**Import now**

- `action-bar.tsx`
- `angle-slider.tsx`
- `checkbox-group.tsx`
- `color-picker.tsx`
- `combobox.tsx`
- `cropper.tsx`
- `editable.tsx`
- `file-upload.tsx`
- `listbox.tsx`
- `mask-input.tsx`
- `mention.tsx`
- `phone-input.tsx`
- `rating.tsx`
- `scroll-spy.tsx`
- `scroller.tsx`
- `segmented-input.tsx`
- `selection-toolbar.tsx`
- `speed-dial.tsx`
- `stepper.tsx`
- `tags-input.tsx`
- `time-picker.tsx`

**Conditional repair**

- `circular-progress.tsx` and `gauge.tsx`: verify semantic values, forced colors, and reduced motion.
- `media-player.tsx`: include the complete Media Chrome closure and verify keyboard, captions, and mobile controls.
- `responsive-dialog.tsx`: verify focus trap, return focus, Escape, labels, and drawer behavior.
- `swap.tsx`: retain only if its interaction differs from a visual before/after skin.
- `tour.tsx`: verify focus movement, skip/close controls, and non-modal reading order.
- `docs/registry/bases/radix/components/pending.tsx`: only for real pending work; never simulate progress.

**Reject**

- `banner.tsx`: page-width composition and cross-source duplicate.
- `compare-slider.tsx`: React Compare Slider is the canonical winner.
- `key-value.tsx`: weak presentational wrapper.
- `status.tsx`: trivial state skin, not a separate high-bar component.
- Base ports, demos, tables, data grids, timelines, cards, marquees, and page compositions.

### 9ui - 3

**Import now**

- `apps/www/src/components/ui/command.tsx`
- `apps/www/src/components/ui/emoji-picker.tsx`
- `apps/www/src/components/ui/meter.tsx`

**Conditional repair**

- Flatten only the exact Base UI and local dependency closure. Verify the command and emoji focus models and meter semantics.

**Reject**

- The other 41 source-local components. They duplicate the chosen Dice, Motion, Kibo, shadcn, or maintained-package winners.
- Site examples, navigation systems, layouts, charts, tables, and cosmetic variants.

### trickle - 6

**Import now**

- None. The repository is young and each effect needs browser, wrapping, selectable-text, and accessible-name QA.

**Conditional repair**

- `registry/default/ink-bleed/ink-bleed.tsx`
- `registry/default/highlighter-sweep/highlighter-sweep.tsx`
- `registry/default/underline-draw/underline-draw.tsx`
- `registry/default/pixelate/pixelate.tsx`
- `registry/default/wireframe/wireframe.tsx`
- `registry/default/shutter/shutter.tsx`

Include the matching registry CSS and reduced-motion override.

**Reject**

- `text-reveal` and `word-cascade`: generic reveal duplicates.
- `morph-swap`: Motion Primitives Text Morph is the winner.
- `grain`, `static-text`, and `reflect`: weak or decorative treatments.
- Typewriter, decrypt/scramble, typo-correct, aurora, shimmer, rainbow, neon, bounce, float, spin, wave, flutter, glitch, confetti, and marquee entries.

### Loading UI - 10

**Import now**

- None. Every selected loader needs a static reduced-motion status.

**Conditional repair**

All paths are below `registry/components/loading-ui/`:

- `ring.tsx`
- `spiral.tsx`
- `swirling.tsx`
- `comet-spinner.tsx`
- `morphing-infinity.tsx`
- `accordion-loader.tsx`
- `symmetric-wave.tsx`
- `conveyor-loop.tsx`
- `analyzing-image.tsx`
- `terminal.tsx`

Use them only while real work is pending. Require a semantic status label and stop immediately when work completes.

**Reject**

- The other 37 loaders, including text shimmer, skeleton copies, pulse-dot copies, arc copies, shape/color variants, and empty decorative grids.

### Mature permissive packages - 16

**Import now as maintained dependencies**

- NumberFlow: `packages/react/src/NumberFlow.tsx` - 1.
- React Compare Slider: `lib/src/react-compare-slider.tsx` with its anatomy - 1.
- React Photo Album: `RowsPhotoAlbum.tsx`, `ColumnsPhotoAlbum.tsx`, and `MasonryPhotoAlbum.tsx` - 3 different layout algorithms.
- Yet Another React Lightbox: `src/Lightbox.tsx` plus the ten functional plugin directories `captions`, `counter`, `download`, `fullscreen`, `inline`, `share`, `slideshow`, `thumbnails`, `video`, and `zoom` - 11.

**Conditional repair**

- None beyond exact package/version pinning, registry installation, notices, and preview fixtures.

**Reject**

- Thin wrappers, delivery adapters, SSR/static aliases, anatomy helpers, configuration presets, and copied partial engines as extra counts.

## Dedicated source inventories

### Animata - 35

**Import now**

- `animata/button/status-button.tsx`
- `animata/card/card-spread.tsx`
- `animata/card/card-stack.tsx`
- `animata/card/led-board.tsx`
- `animata/container/sibling-focus-nav.tsx`
- `animata/image/disclose-image.tsx`
- `animata/list/flipping-cards.tsx`
- `animata/list/menu-animation.tsx`
- `animata/text/swap-text.tsx`
- `animata/text/underline-hover-text.tsx`

**Conditional repair**

- `animata/button/animated-follow-button.tsx` and `swipe-button.tsx`: touch, keyboard, and reduced-motion parity.
- `animata/card/flip-card.tsx` and `swap-text-card.tsx`: stable reading order and keyboard state.
- `animata/fabs/flower-menu.tsx`: real controls, labels, focus order, and Escape behavior.
- `animata/image/images-reveal.tsx`, `tilted-cover.tsx`, and `animata/list/reveal-image.tsx`: caller-owned media and reduced motion.
- `animata/progress/animatedtimeline.tsx`: real progress state and no fake timing.
- `animata/text/text-animator.tsx` plus its CSS: one engine only; expose clean presets without counting wrappers.
- Widgets: `alarm-clock.tsx`, `calendar-event.tsx`, `delivery-card.tsx`, `direction-card.tsx`, `expense-tracker.tsx`, `fund-widget.tsx`, `notes.tsx`, `reminder-widget.tsx`, `security-alert.tsx`, `shopping-list.tsx`, `storage-status.tsx`, `study-timer.tsx`, `water-tracker.tsx`, `weather-card.tsx`, and `weekly-progress.tsx`. They count only if the existing source is already prop-driven or needs merely fixture removal. Reject any widget that requires an API redesign.

**Reject**

- All backgrounds except no selected entry: blurry blobs, plain grids/dots/diagonal lines, moving gradients, shooting stars, and zigzags are generic decoration. Animated Beam is a duplicate family.
- AI, get-started, shining, slide-arrow, ripple, and work button skins.
- Cursor Tracker, Marquee, trailing-image, orbiting-items, preloaders, generic Spinner, and Gooey/Shift Tabs.
- All chart families for this website-focused catalog.
- Animated-gradient, gibberish, glitch, jitter, ticker, typing, wave, cycle, circular, mirror, and other perpetual/decorative text entries.
- Duplicate counters, skeleton fixtures, branded entries, page sections, layouts, and all TextAnimator preset wrappers as separate counts.
- Unselected widgets and asset-heavy identity widgets that stop being minimal adaptations.

### Cult UI - 20

**Import now**

- `timer.tsx`
- `distorted-glass.tsx`
- `vote-tally.tsx`

**Conditional repair**

- `family-button.tsx`
- `gradient-button-group.tsx`
- `metal-button.tsx`
- `pixel-heading-character.tsx`
- `pixel-paragraph-words.tsx`
- `terminal-animation.tsx`
- `dither-image.tsx`
- `lightboard.tsx`
- `cutout-card.tsx`
- `hover-video-player.tsx`
- `three-d-carousel.tsx`
- `direction-aware-tabs.tsx`
- `morph-surface.tsx`
- `popover-form.tsx`
- `toolbar-expandable.tsx`
- `choice-poll.tsx`
- `sortable-list.tsx`

Apply the exact manifest, asset, accessibility, performance, and reduced-motion repairs recorded in `cult-ui.md`. Rename or remove third-party product cues.

**Reject**

- Background Animate, Border Beam, Cosmic, Neumorph, Texture, and other button skins.
- Gradient Heading, Typewriter, Text GIF, and Pixel Heading Word as a duplicate of the selected pixel-heading family.
- Generic gradients, textures without asset provenance, fractal/grid beams, decorative guides, squiggles, SVG shape collections, and texture overlays.
- Feature/Loading/Logo carousels, Browser Window, Shift/Texture Card, YouTube Player, Dynamic Island, full-screen Expandable Screen, Intro Disclosure, Onboarding, AI Instructions, Prompt Library, and duplicate poll/color/code components.
- Every exact exclusion, orphan, hero, section, layout, and Pro item in the source inventory.

### UI Layouts - 9

**Import now**

- `apps/ui-layout/components/ui/blur-vignette.tsx`

**Conditional repair**

- `apps/ui-layout/components/ui/progressive-carousel.tsx`
- `apps/ui-layout/components/ui/image-tabs.tsx`
- `apps/ui-layout/components/ui/liquid-glass.tsx`
- `apps/ui-layout/components/ui/swapy.tsx`
- `apps/ui-layout/registry/components/mac/genie-effect.tsx`
- `apps/ui-layout/components/ui/linear-modal.tsx`
- `apps/ui-layout/components/ui/tree-view-code.tsx`
- `apps/ui-layout/components/ui/code-tabs.tsx`

Reject any item whose missing local closure or accessibility repair becomes a rewrite.

**Reject**

- Text marquee, randomized text, Typewriter, Shimmer Loader, Mouse Trail, generic Scroll/Timeline animation wrappers, Spotlight duplicate, and fixed Image Reveal demo.
- Duplicate accordion, range, tags, selector, file upload, responsive modal, drawer, carousel, code block, and color-picker families.
- All 19 button skins, cards, mask demos, countdowns, hard-coded offers, terminal composition, external registry files, blocks, sections, layouts, Pro code, and demos.

### Eldora UI - 0

**Import now**

- None.

**Conditional repair**

- None. A technical fix cannot repair the legal conflict.

**Reject**

- All 39 registered UI entries and all unregistered source. The official terms prohibit standalone component-library redistribution despite the repository MIT file. Written permission or an unambiguous upstream license clarification is required before reconsideration.

### Fancy Components - 18

**Import now**

- `src/fancy/components/carousel/box-carousel.tsx`
- `src/fancy/components/filter/gooey-svg-filter.tsx`
- `src/fancy/components/filter/pixelate-svg-filter.tsx`

**Conditional repair**

- `src/fancy/components/text/letter-3d-swap.tsx`
- `src/fancy/components/text/vertical-cut-reveal.tsx`
- `src/fancy/components/text/text-rotate.tsx`
- `src/fancy/components/text/variable-font-hover-by-letter.tsx`
- `src/fancy/components/text/scroll-and-swap-text.tsx`
- `src/fancy/components/text/text-cursor-proximity.tsx`
- The three `underline-*.tsx` files as one Underline Animation family.
- `src/fancy/components/text/text-along-path.tsx`
- `src/fancy/components/image/parallax-floating.tsx`
- `src/fancy/components/physics/elastic-line.tsx`
- `src/fancy/components/physics/gravity.tsx`
- `src/fancy/components/physics/cursor-attractor-and-gravity.tsx`
- `src/fancy/components/blocks/css-box.tsx`
- `src/fancy/components/blocks/drag-elements.tsx`
- `src/fancy/components/blocks/media-between-text.tsx`

Add reduced motion, touch/keyboard alternatives, pause rules, cleanup, and owned preview media as recorded upstream.

**Reject**

- Random Letter Swap, Typewriter, both Scramble families, Breathing Text, duplicate number ticker, generic highlighter, animated gradient, Pixel/Image Trail, Float, both marquees, Screensaver, Circling Elements, and Stacking Cards.
- Variable-font specializations that duplicate the selected proximity engine, helpers, Sticky Footer, docs/landing code, fonts, and demo variants.

### SmoothUI - 34

**Import now**

- `agent-avatar`
- `ai-branch`
- `book`
- `interactive-image-selector`
- `phototab`
- `user-account-avatar`
- `context-menu`
- `notification-badge`
- `button-copy`
- `image-metadata-preview`
- `prism-sweep-transition`

Every name expands to `packages/smoothui/components/<name>/index.tsx`.

**Conditional repair**

- `ai-input`
- `exposure-slider`
- `figma-comment`, renamed to a generic anchored comment and stripped of identity/media defaults.
- `power-off-slide`
- `drawer`
- `rich-popover`
- `scrubber`
- `dot-morph-button`
- `photo-stack`
- `reviews-carousel`
- `product-card`
- `expandable-cards`
- `job-listing-component`
- `scrollable-card-stack`
- `basic-toast`
- `kinetic-center-build`
- `scroll-reveal-paragraph`
- `aperture-blur-transition`
- `chroma-blur-transition`
- `depth-parallax-words`
- Shared Axis X/Y/Z as one family.
- The SDF transition engine and its wrappers as one family.
- The Shader Reveal engine and its wrappers as one family.

**Reject**

- Siri Orb, Apple Invites, Dynamic Island, App Download Stack, Cursor Follow, Social Selector, Switchboard Card, and GSAP-based Gooey Popover.
- Infinite Slider, magnetic/base button skins, duplicate standard controls, skeleton, grid loader, API-dependent GitHub/X cards, and Number/Price Flow.
- All generic reveal-direction files, Scramble, Typewriter, Shine/Shimmer, Wave, and other low-difference text presets.
- All sections, blocks, docs assets, engine wrappers as separate counts, and direction/style variants.

### HyperUI - 0

**Import now**

- None.

**Conditional repair**

- None in the current phase.

**Reject**

- All 118 recipes. They are raw HTML recipes rather than reusable React component APIs. Interactive-looking controls lack behavior, focus management, and state. Converting them into prop-driven accessible React products exceeds minimal adaptation.
- All templates, marketing sections, charts, dashboard material, remote media, dark copies, and cosmetic variants.

### Flowbite React - 0

**Import now**

- None.

**Conditional repair**

- None after global deduplication.

**Reject**

- All 38 source families for this catalog pass. Their behavior is covered by the selected Dice, 9ui, Kibo, Motion, SmoothUI, shadcn, and maintained-package winners, while the visual layer is conventional.
- Flowbite Core documentation examples, CC BY documentation code, Pro, blocks, sections, templates, internal floating primitives, and site assets.

### Kibo UI - 18

All paths are `packages/<name>/index.tsx` unless a second file is named.

**Import now**

- `announcement`
- `calendar`
- `choicebox`
- `code-block` plus `server.tsx`
- `contribution-graph`
- `deck`
- `dialog-stack`
- `glimpse` plus `server.tsx`
- `image-zoom`
- `qr-code` plus `server.tsx`
- `relative-time`
- `snippet`
- `tree`

**Conditional repair**

- `credit-card`: verify the payment-icon dependency and avoid default brand presentation.
- `editor`: keep the complete TipTap closure and security/accessibility behavior.
- `reel`: caller-owned media and full gesture/focus QA.
- `sandbox`: lazy-load the Sandpack dependency and keep it out of initial bundles.
- `stories`: caller-owned media and keyboard/touch navigation.

**Reject**

- Cursor, Marquee, generic pills/spinners/status, Avatar Stack, Banner, Ticker, and Theme Switcher.
- Gantt, Kanban, Table, and other dashboard/application-screen components.
- Dice/Mature-package duplicates: Color Picker, Combobox, Comparison, Dropzone, Image Crop, List reorder, Rating, Tags, Video Player, and duplicate calendar variants.
- Blocks, patterns, typography CSS, paid Shadcnblocks material, demos, and generic shadcn plumbing.

### ReUI - 0

**Import now**

- None.

**Conditional repair**

- None after global deduplication.

**Reject**

- All 17 canonical families. Dice UI, Kibo, 9ui, and selected maintained packages already cover the useful behaviors with a smaller or stronger dependency path.
- Data Grid, Filters, and Kanban are dashboard/application UI; Frame and Icon Stack are weak wrappers.
- Base/Radix ports, 1,019 examples, hook-only upload, shadcn foundations, Pro/Ultimate material, motion icons, templates, and site assets.

### Kokonut UI - 11

**Import now**

- `components/kokonutui/action-search-bar.tsx`
- `components/kokonutui/ai-input-search.tsx`
- `components/kokonutui/hold-button.tsx`

**Conditional repair**

- `components/kokonutui/avatar-picker.tsx`
- `components/kokonutui/team-selector.tsx`
- `components/kokonutui/slide-text-button.tsx`
- `components/kokonutui/social-button.tsx`
- `components/kokonutui/currency-transfer.tsx`
- `components/kokonutui/mouse-effect-card.tsx`
- `components/kokonutui/profile-dropdown.tsx`
- `components/kokonutui/toolbar.tsx`

Repair missing registry dependencies, remove brands/remote media/fake actions, and require real consumer callbacks.

**Reject**

- AI loading/text-loading/voice fixtures, generic Loader, gradient/particle/attract buttons, duplicate Theme Switch, Flip/Card Stack/Liquid Glass/Drawer/Tabs families, and Social Post Card.
- All glitch, matrix, shimmer, typewriter, generic scroll/swoosh text, and full-screen background/hero extractions.
- Every explicit rejected path, landing component, layout, template, site helper, Pro link, and generic shadcn primitive.

### Magic UI Free - 14

**Import now**

- `magicui/kinetic-text.tsx`
- `magicui/backlight.tsx`
- `magicui/terminal.tsx`
- `magicui/safari.tsx`

**Conditional repair**

- `magicui/globe.tsx`
- `magicui/animated-beam.tsx`
- `magicui/dotted-map.tsx`
- `magicui/lens.tsx`
- `magicui/animated-theme-toggler.tsx`
- `magicui/hero-video-dialog.tsx`
- `magicui/code-comparison.tsx`
- `magicui/pixel-image.tsx`
- `magicui/ripple-button.tsx`, only as bounded press feedback rather than decoration.
- `magicui/animated-list.tsx`

This is 14 selected entries: 4 import-now and 10 conditional.

**Reject**

- Android and iPhone as duplicate media-frame skins.
- All aurora, gradient, shiny, shimmer, sparkle, typing, random/hyper, spinning, comic, velocity, and automatic word-rotation text.
- Meteors, grid/dot/hex/stripe/retro patterns, flicker, particles, orbit circles, generic rays/ripples, neon/shine borders, Magic Card, smooth/custom pointers, confetti, cool mode, rainbow/pulse/shimmer buttons, and Marquee.
- Duplicate Progressive Blur, Scroll Progress, Number Ticker, Dock, Highlighter, File Tree, Text Animate, circular progress, Tweet Card, Avatar Circles, and stale/Pro items.

### Motion Primitives - 11

**Import now**

- None. Every selected source currently lacks a reduced-motion path.

**Conditional repair**

- `components/core/animated-background.tsx`
- `components/core/dock.tsx`
- `components/core/morphing-dialog.tsx`
- `components/core/morphing-popover.tsx`
- `components/core/progressive-blur.tsx`
- `components/core/scroll-progress.tsx`
- `components/core/text-effect.tsx`
- `components/core/text-loop.tsx`, only with autoplay off by default and user control.
- `components/core/text-morph.tsx`
- `components/core/tilt.tsx`
- `components/core/transition-panel.tsx`

**Reject**

- Cursor, Infinite Slider, Text Scramble, Text Shimmer, Text Shimmer Wave, Spinning Text, Magnetic, Glow Effect, Border Trail, generic In View/Animated Group, and perpetual/decorative motion.
- Animated Number and Sliding Number, Image Comparison, Carousel, Spotlight, and other global duplicate families.
- Generic unsafe Accordion/Dialog/Disclosure, hard-coded toolbars, Pro, demos, assets, and presets as separate counts.

### Origin UI - 0

**Import now**

- None.

**Conditional repair**

- None as counted components. Individual composed interactions may be researched later from scratch as source candidates, but they are not pre-approved here.

**Reject**

- All 466 listed `comp-*` files from the count. Direct audit found 454 parameterless demo exports and 449 wrappers around existing UI primitives. They are fixtures and variants, not 466 reusable component contracts.
- `comp-577` through `comp-596` navbars, all other site/layout material, assets without provenance, and AGPL-default repository paths outside `apps/origin/`.

### Park UI - 0

**Import now**

- None.

**Conditional repair**

- None for the current Tailwind/shadcn architecture.

**Reject**

- All 46 candidate families from the current count. Every source requires the Panda generated system, recipe/theme closure, or a Panda-to-Tailwind port. Pulling a second styling system is excessive; a full port exceeds minimal adaptation.
- All wrappers, helpers, demos, Solid ports, recipes as products, Figma assets, layouts, and variants.

### shadcn/ui - 15

All example filenames are below `apps/v4/examples/radix/` and require the matching pinned style-layer sources.

**Import now**

- `attachment-group.tsx`
- `attachment-states.tsx`
- `bubble-collapsible.tsx`
- `bubble-markdown.tsx`
- `bubble-reactions.tsx`
- `calendar-custom-days.tsx`
- `calendar-time.tsx`
- `collapsible-file-tree.tsx`
- `date-picker-natural-language.tsx`
- `input-group-custom.tsx`
- `input-group-textarea-examples.tsx`

**Conditional repair**

- `calendar-hijri.tsx`: self-host and notice Vazirmatn correctly.
- `message-scroller-animation.tsx`
- `message-scroller-load-history.tsx`
- `message-scroller-streaming.tsx`

The message-scroller entries need their exact AI/message dependency closure and real streaming/history states.

**Reject**

- Marker Shimmer, Shimmer Demo, Shimmer Once, Markdown Demo, duplicate message attachment/markdown, duplicate combobox/file-upload/drawer-dialog entries, and all support-only examples as headline components.
- All 58 core primitives as showcase counts. They may travel only as dependencies.
- Blocks, charts, dashboards, pages, templates, sidebar/app shell, typography, form-engine ports, variants, assets, and stale registry items.

### Tremor Raw and Tremor Blocks - 0

**Import now**

- None.

**Conditional repair**

- None after global deduplication.

**Reject**

- All 30 Raw families from the current count. They are conventional duplicates of the selected Dice, 9ui, shadcn, Kibo, and maintained-package sources, with heavier Apache modification/notice work.
- All chart/data-dashboard families and all 323 Blocks examples.
- The conditional file-upload extraction because creating a reusable API from the form example exceeds minimal adaptation.

### React Bits Free and Pro - 0

**Import now**

- None.

**Conditional repair**

- None. Attribution, a purchase, a private repository, or site-only use does not repair the license conflict.

**Reject**

- React Bits Free while official MIT and Commons Clause statements conflict.
- React Bits Pro source, registry responses, MCP output, blocks, components, and use on the competing Taste Blocks catalog site without explicit written permission for this exact use.
- Never store or use the previously exposed key.

## Release rule

The source shortlist is frozen by behavior family, not by marketing count. During import:

1. Remove a candidate when its repair becomes a redesign.
2. Remove aliases after normalized source, structure, SVG geometry, and behavior-state comparison.
3. Keep animated icons as a separately reported collection.
4. Count only verified manifest entries.
5. Do not lower the visual, accessibility, license, or anti-slop bar to preserve 500.

The next source-research milestone is at least **204 additional target-category candidates**, with extra QA headroom beyond that number.
