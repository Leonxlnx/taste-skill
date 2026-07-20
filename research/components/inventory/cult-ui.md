# Cult UI component inventory

Checked: 2026-07-20
Official repository: [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui)
Pinned `main` commit: [`a3308bad8496b036adf2fbd29d50b877fb3c5987`](https://github.com/nolly-studio/cult-ui/tree/a3308bad8496b036adf2fbd29d50b877fb3c5987) (`2026-05-21T13:16:16-06:00`, `feat: metal button + new categories`)
Audit scope: public `registry:ui` entries in [`apps/www/registry.json`](https://github.com/nolly-studio/cult-ui/blob/a3308bad8496b036adf2fbd29d50b877fb3c5987/apps/www/registry.json), not Cult UI Pro.
Status: source inventory, not legal advice and not an approval to import blindly.

## Decision

- **65 distinct free component candidates** remain after component-only filtering.
- **13 of the 78 public `registry:ui` entries are excluded** because they are page sections/layouts, cosmetic duplicates, or low-value filler.
- **4 unregistered/orphan files are not counted** because they are absent from the official registry index.
- No candidate is approved for blind bulk import. The public code is permissively licensed, but its generated registry metadata has dependency gaps, several demos rely on third-party media, and many animated components still need reduced-motion and accessibility QA.

## License and paid boundary

The pinned repository contains the full [MIT License](https://github.com/nolly-studio/cult-ui/blob/a3308bad8496b036adf2fbd29d50b877fb3c5987/LICENSE.md), copyright `2023 Jordan-Gilliam`. It permits use, modification, redistribution, sublicensing, and sale, provided the copyright and permission notice remain in all copies or substantial portions.

For Taste Blocks, every copied or substantially derived free component must therefore retain Cult UI attribution in the distributed source or a shipped third-party notices file. Pin the source commit and original path per item. The repository license does not automatically clear separately licensed npm dependencies, remote media, logos, GIFs, stock images, or trademarks.

Cult UI Pro is a separate product and is **not eligible**. The current [Cult UI Pro terms](https://pro.cult-ui.com/terms), last updated 2026-07-16, prohibit redistribution, public source publication, competing component libraries, and derivative UI kits or templates. Do not copy Pro components, scrape authenticated registry output, reconstruct code from previews, or reuse `cult-pro-*` assets/metadata found in the public website repository. The free public registry needs no Pro key and is documented separately at [cult-ui.com/docs](https://www.cult-ui.com/docs) and [the free installation guide](https://www.cult-ui.com/docs/installation).

## Path conventions

Every source and demo filename below is relative to the pinned repository and combines with these exact roots:

- Source root: `apps/www/registry/default/ui/`
- Demo root: `apps/www/registry/default/example/`

`React`, `React DOM`, Tailwind, and the local `@/lib/utils` helper are baseline requirements and are omitted from dependency cells. `Next Image` means `next/image`. Registry pieces such as `button` or `dialog` are shadcn-compatible local components, not npm packages.

## Quality flags

| Flag | Meaning |
| --- | --- |
| `MANIFEST` | Official registry metadata omits at least one actual package or local registry dependency; repair before publishing. |
| `RM` | Animation has no explicit reduced-motion path in the source; add or verify one. |
| `A11Y` | Custom interactive behavior needs keyboard, focus, semantics, and screen-reader testing. |
| `NEXT` | Uses a Next.js-specific API and needs an adapter or a Next-only compatibility declaration. |
| `PERF` | Canvas, WebGL, observers, pointer loops, autoplay, or heavy animation needs lifecycle and low-power testing. |
| `LARGE` | Source exceeds roughly 500 lines; audit for product-specific code, dead code, and extraction boundaries. |
| `ASSET` | Demo or implementation uses local/remote media that must be replaced or separately cleared. |
| `HARDCODED` | Contains Cult-specific, third-party, or demo-default content that should not ship as a library default. |
| `CSS` | Requires global CSS, Tailwind v4 behavior, masks, filters, or browser-support verification. |
| `PKG` | A specialized dependency needs its own license, version, bundle-size, and browser-support review. |
| `LIGHT` | Useful but visually or technically light; include only if the live result clears the Taste Blocks quality bar. |

## Candidate inventory

### Buttons and actions — 8

| Component | Source | Demo | Actual dependencies | Assets | Main gates |
| --- | --- | --- | --- | --- | --- |
| Background Animate Button | `bg-animate-button.tsx` | `bg-animate-button-demo.tsx` | `@radix-ui/react-slot`, `class-variance-authority` | None | `MANIFEST`, `RM`, `CSS` |
| Border Beam Button | `border-beam-button.tsx` | `border-beam-button-demo.tsx` | `border-beam`; registry `button` | None | `RM`, `PKG` |
| Cosmic Button | `cosmic-button.tsx` | `cosmic-button-demo.tsx` | None | None | Default link points to `aisdkagents.com`; remove it. `RM`, `A11Y`, `HARDCODED` |
| Family Button | `family-button.tsx` | `family-button-demo.tsx` | `lucide-react`, `motion` | Demo uses inline SVG | `MANIFEST`, `RM`, `A11Y` |
| Gradient Button Group | `gradient-button-group.tsx` | `gradient-button-group-demo.tsx` | `motion`, `next-themes` | None | `MANIFEST`, `RM`, `A11Y`; verify that the active control exposes state semantically. |
| Metal Button | `metal-button.tsx` | `metal-button-demo.tsx` | `metal-fx`, `class-variance-authority`; registry `button` | None | `MANIFEST`, `RM`, `PKG`, `PERF` |
| Neumorph Button | `neumorph-button.tsx` | `neumorph-button-demo.tsx` | `motion`, `lucide-react`, `class-variance-authority` | None | `MANIFEST`, `RM`; retain only if contrast and disabled states pass. |
| Texture Button | `texture-button.tsx` | `texture-button-demo.tsx` | `@radix-ui/react-slot`, `class-variance-authority` | None | `MANIFEST`, `RM`, `CSS` |

### Typography, numbers, and terminal motion — 10

| Component | Source | Demo | Actual dependencies | Assets | Main gates |
| --- | --- | --- | --- | --- | --- |
| Animated Number | `animated-number.tsx` | `animated-number-demo.tsx` | `motion` | None | `RM`; confirm locale/formatting and announcement behavior for changing values. |
| Gradient Heading | `gradient-heading.tsx` | `gradient-heading-demo.tsx` | `@radix-ui/react-slot`, `class-variance-authority` | None | `MANIFEST`, `CSS`, `LIGHT` |
| Pixel Heading Character | `pixel-heading-character.tsx` | `pixel-heading-character-demo.tsx` | `geist` | Geist pixel fonts supplied by package | `LARGE`, `RM`, `A11Y`; hover behavior must have a non-hover path. |
| Pixel Heading Word | `pixel-heading-word.tsx` | `pixel-heading-word-demo.tsx` | `geist` | Geist pixel fonts supplied by package | `RM`, `A11Y`; avoid counting font modes as separate components. |
| Pixel Paragraph Words | `pixel-paragraph-words.tsx` | `pixel-paragraph-words-demo.tsx` | `geist` | Geist pixel fonts supplied by package | `RM`, `A11Y`; interactive words must not change meaning only on hover. |
| Terminal Animation | `terminal-animation.tsx` | `terminal-animation-demo.tsx` | `@radix-ui/react-slot`, `@radix-ui/react-use-controllable-state` | `component-images/terminal-animation/terminal-animation-bg-2.png` in the demo | `LARGE`, `RM`, `ASSET`; timers and playback cleanup need testing. |
| Text Animate | `text-animate.tsx` | `text-animate-demo.tsx` | `motion` | None | `RM`; preserve readable DOM and avoid replaying on every minor rerender. |
| Text GIF | `text-gif.tsx` | `text-gif-demo.tsx` | `class-variance-authority`, Next Image | Hard-coded remote Giphy GIFs | `MANIFEST`, `NEXT`, `RM`, `ASSET`, `HARDCODED`; caller media only, no bundled Giphy defaults. |
| Timer | `timer.tsx` | `timer-demo.tsx` | `class-variance-authority`, `lucide-react` | None | `MANIFEST`, `A11Y`; validate interval cleanup and whether updates should be announced. |
| Typewriter | `typewriter.tsx` | `typewriter-demo.tsx` | `motion` | None | `RM`, `A11Y`; render the final text for reduced motion and assistive technology. |

### Backgrounds, shaders, and visual primitives — 15

| Component | Source | Demo | Actual dependencies | Assets | Main gates |
| --- | --- | --- | --- | --- | --- |
| Animated Gradient | `bg-animated-gradient.tsx` | `bg-animated-gradient-demo.tsx` | `motion` | None | `RM`, `CSS`, `LIGHT` |
| Image Texture | `bg-image-texture.tsx` | `bg-image-texture-demo.tsx` | None | Requires `public/textures/{fabric-of-squares,grid-noise,inflicted,debut-light,groovepaper}.png` | `ASSET`, `CSS`; registry item does not ship these files, and their upstream rights need separate verification. |
| Canvas Fractal Grid | `canvas-fractal-grid.tsx` | `canvas-fractal-grid-demo.tsx` | `motion` | None | `LARGE`, `PERF`, `RM`; 1,376-line file contains substantial commented alternatives and needs cleanup before distribution. |
| Distorted Glass | `distorted-glass.tsx` | `distorted-glass-demo.tsx` | None | Inline SVG filter | `CSS`, `LIGHT`; verify Safari/filter fallback. |
| Dither Image | `dither-image.tsx` | `dither-image-demo.tsx`; extra `dither-image-demo-upload.tsx` | `dither-plugin`, Next Image | Demo uses `public/images/gibli/gibli-1.jpg` through `gibli-9.jpg` and remote Giphy URLs | `NEXT`, `PKG`, `ASSET`, `PERF`; replace all demo imagery and audit plugin CSS variables. |
| Edge Blur | `edge-blur.tsx` | `edge-blur-demo.tsx` | None | None | `CSS`, `LIGHT`; verify mask/backdrop-filter fallback and avoid using it as a default page decoration. |
| Grid Beam | `grid-beam.tsx` | `grid-beam-demo.tsx` | None | Inline canvas/SVG | `LARGE`, `PERF`, `RM`, `A11Y`; pointer and resize observers need cleanup tests. |
| Lightboard | `lightboard.tsx` | `lightboard-demo.tsx` | None | Canvas only | `LARGE`, `PERF`, `RM`; ensure offscreen pause and device-pixel-ratio cap. |
| Shader Lens Blur | `shader-lens-blur.tsx` | `shader-lens-blur-demo.tsx` | `three`, `jotai`, `motion`, `next-themes` | Runtime-generated WebGL | `MANIFEST`, `LARGE`, `PERF`, `RM`, `PKG`; provide no-WebGL and low-power fallback. |
| Squiggle Arrow | `squiggle-arrow.tsx` | `squiggle-arrow-demo.tsx` | None | Inline SVG | `LIGHT`; decorative output must be hidden from assistive technology unless meaningful. |
| Stripe Background Guides | `stripe-bg-guides.tsx` | `stripe-bg-guides-demo.tsx` | `motion` | None | `RM`, `PERF`, `CSS`; keep only when structurally useful, not default decoration. |
| SVG Bands | `svg-bands.tsx` | `svg-bands-demo.tsx` | None | Inline SVG collection | `LARGE`, `CSS`; component primitive only—do not classify individual shapes as separate components. |
| SVG Shapes | `svg-shapes.tsx` | `svg-shapes-demo.tsx` | None | Inline SVG collection | `LARGE`; one collection, not dozens of counted variants. Decorative semantics required. |
| SVG Shapes Animated | `svg-shapes-animated.tsx` | `svg-shapes-animated-demo.tsx` | `motion` | Inline SVG collection | `LARGE`, `PERF`; it includes reduced-motion handling, but test scroll observers and never count shapes as separate entries. |
| Texture Overlay | `texture-overlay.tsx` | `texture-overlay-demo.tsx` | None | CSS gradients only | `CSS`, `LIGHT`; one component regardless of pattern presets. |

### Cards, media, carousels, and frames — 10

| Component | Source | Demo | Actual dependencies | Assets | Main gates |
| --- | --- | --- | --- | --- | --- |
| Cutout Card | `cutout-card.tsx` | `cutout-card-demo.tsx` | `motion`, `@radix-ui/react-use-controllable-state`, Next Image | Demo uses `public/placeholders/apple-wallpaper.jpg` | `NEXT`, `ASSET`, `A11Y`; source includes reduced-motion support, but hover actions need keyboard parity. |
| Feature Carousel | `feature-carousel.tsx` | `feature-carousel-demo.tsx` | `motion`, `clsx`, `react-wrap-balancer`, Next Image | Demo/source uses `feature-1.png` through `feature-5.png` and hard-codes `/cults.png` | `MANIFEST`, `NEXT`, `LARGE`, `RM`, `A11Y`, `ASSET`, `HARDCODED` |
| Hover Video Player | `hover-video-player.tsx` | `hover-video-player-demo.tsx` | `motion`, `lucide-react`, Next Image; registry `button`, `slider` | Demo uses a Vimeo URL and `placeholders/newcopy-thumbnail.png`; source loads Vimeo API at runtime | `MANIFEST`, `NEXT`, `LARGE`, `PERF`, `ASSET`, `PKG`; reduced-motion exists, but touch and keyboard playback need testing. |
| Loading Carousel | `loading-carousel.tsx` | `loading-carousel-demo.tsx` | `embla-carousel-autoplay`, `motion`, `lucide-react`, Next Image; registry `carousel` | Source hard-codes `placeholders/cult-*.png` and New Cult URLs | `NEXT`, `PERF`, `A11Y`, `ASSET`, `HARDCODED`; remove all default product data. Reduced-motion exists. |
| Logo Carousel | `logo-carousel.tsx` | `logo-carousel-demo.tsx` | `motion` | Many inline third-party brand marks | `LARGE`, `RM`, `ASSET`; ship a generic slot-based API and no third-party logos. |
| Browser Window | `mock-browser-window.tsx` | `mock-browser-window-demo.tsx` | Registry `texture-overlay` | None | `A11Y`; decorative browser controls must not masquerade as working controls. |
| Shift Card | `shift-card.tsx` | `shift-card-demo.tsx` | `motion` | Demo uses `basic-img.png` and inline SVG | `MANIFEST`, `RM`, `A11Y`, `ASSET` |
| Texture Card | `texture-card.tsx` | `texture-card-demo.tsx` | None | Demo uses inline SVG | `CSS`, `LIGHT`; preserve as one component, not one count per texture treatment. |
| 3D Carousel | `three-d-carousel.tsx` | `three-d-carousel-demo.tsx` | `motion` | Source defaults to remote `picsum.photos` images | `MANIFEST`, `PERF`, `RM`, `A11Y`, `ASSET`, `HARDCODED`; require caller-provided media. |
| YouTube Video Player | `youtube-video-player.tsx` | `youtube-video-player-demo.tsx` | `motion`, `lucide-react`; registry `button` | YouTube thumbnail/embed URLs; demo adds an Unsplash thumbnail | `MANIFEST`, `PERF`, `A11Y`, `ASSET`, `PKG`; consent/privacy mode and keyboard controls need review. |

### Navigation, expandable surfaces, and overlays — 13

| Component | Source | Demo | Actual dependencies | Assets | Main gates |
| --- | --- | --- | --- | --- | --- |
| Direction Aware Tabs | `direction-aware-tabs.tsx` | `direction-aware-tabs-demo.tsx` | `motion`, `react-use-measure` | None | `RM`, `A11Y`; implement proper tab roles, arrow-key behavior, and focus. |
| Dock | `dock.tsx` | `dock-demo.tsx` | `motion` | Demo uses remote LS Graphics images | `RM`, `A11Y`, `PERF`, `ASSET`; hover magnification needs keyboard/touch equivalents. |
| Dynamic Island | `dynamic-island.tsx` | `dynamic-island-demo.tsx` | `motion` | Inline SVG mask | `LARGE`, `RM`, `A11Y`, `PERF`; ensure focus is not lost during shape/content transitions. |
| Expandable | `expandable.tsx` | `expandable-demo.tsx` | `motion`, `react-use-measure` | Demo uses a Best Buy image URL and placeholder routes | `MANIFEST`, `LARGE`, `RM`, `A11Y`, `ASSET`; verify dialog-like focus behavior when expanded. |
| Expandable Screen | `expandable-screen.tsx` | `expandable-screen-demo.tsx` | `motion`, `lucide-react` | Demo uses placeholder routes | `RM`, `A11Y`, `ASSET`; full-screen state needs focus trap, Escape, scroll lock, and restoration. |
| Family Drawer | `family-drawer.tsx` | `family-drawer-demo.tsx` | `motion`, `react-use-measure`, `vaul`, `@radix-ui/react-slot`, `clsx` | Caller/demo content | `MANIFEST`, `LARGE`, `RM`, `A11Y`, `PKG` |
| Floating Panel | `floating-panel.tsx` | `floating-panel-demo.tsx` | `motion`, `lucide-react` | Demo uses placeholder route | `MANIFEST`, `LARGE`, `RM`, `A11Y`; bespoke focus/position state needs careful audit. |
| Intro Disclosure | `intro-disclosure.tsx` | `intro-disclosure-demo.tsx` | `motion`, `react-use-measure`, `lucide-react`, Next Image; registry `button`, `aspect-ratio`, `checkbox`, `dialog`, `drawer`, `progress` | Demo uses `feature-1.png` through `feature-3.png`; source has placeholder fallback | `MANIFEST`, `NEXT`, `LARGE`, `RM`, `A11Y`, `ASSET` |
| Morph Surface | `morph-surface.tsx` | `morph-surface-demo.tsx` | `motion` | Inline SVG | `LARGE`, `RM`, `A11Y`, `PERF`; ensure morphing does not reorder or hide focused content. |
| Popover | `popover.tsx` | `popover-demo.tsx` | `motion`, `lucide-react` | Demo placeholder route | `MANIFEST`, `RM`, `A11Y`; this is bespoke rather than Radix, so outside click, Escape, focus and collision behavior need full tests. |
| Popover Form | `popover-form.tsx` | `popover-form-demo.tsx` | `motion`, `lucide-react` | Inline SVG | `MANIFEST`, `RM`, `A11Y`; success state must remain announced and forms must not silently fake submission. |
| Side Panel | `side-panel.tsx` | `side-panel-demo.tsx` | `motion`, `react-use-measure` | Demo embeds a YouTube URL | `MANIFEST`, `RM`, `A11Y`, `ASSET`; decide whether it is a dialog or complementary region and implement semantics accordingly. |
| Toolbar Expandable | `toolbar-expandable.tsx` | `toolbar-expandable-demo.tsx` | `motion`, `@radix-ui/react-scroll-area`; registry `badge` | None | `LARGE`, `RM`, `A11Y`; step navigation and roving focus need validation. |

### Inputs and productivity widgets — 9

| Component | Source | Demo | Actual dependencies | Assets | Main gates |
| --- | --- | --- | --- | --- | --- |
| AI Instructions | `ai-instructions.tsx` | `ai-instructions-demo.tsx` | `@hugeicons/core-free-icons`, `@hugeicons/react`; registry `button`, `command`, `dialog`, `hover-card`, `input`, `popover`, `textarea` | None | `MANIFEST`, `LARGE`, `A11Y`; official manifest omits every local registry dependency. |
| Choice Poll | `choice-poll.tsx` | `choice-poll-demo.tsx` | `@radix-ui/react-use-controllable-state`, `class-variance-authority`, `lucide-react` | None | `MANIFEST`, `LARGE`, `A11Y`; confirm radio/checkbox semantics and live results. |
| Code Block | `code-block.tsx` | `code-block-demo.tsx` | `motion`, `lucide-react` | None | `MANIFEST`, `RM`, `A11Y`; copy feedback and tab semantics need testing. |
| Color Picker | `color-picker.tsx` | `color-picker-demo.tsx` | `motion`, `lucide-react`; registry `button`, `input`, `label`, `popover` | None | `MANIFEST`, `RM`, `A11Y`; HSL controls require keyboard labels and valid parsing. |
| Onboarding | `onboarding.tsx` | `onboarding-demo.tsx` | `@radix-ui/react-use-controllable-state`, `class-variance-authority`; registry `button` | Demo uses `component-images/onboarding/*.png` | `LARGE`, `A11Y`, `ASSET`; component primitives are eligible, but the demo flow and screenshots are not library content. |
| Poll Widget | `poll-widget.tsx` | `poll-widget-demo.tsx` | `@radix-ui/react-use-controllable-state`, `class-variance-authority`, `lucide-react`, `motion`; registry `button`, `dialog`, `popover` | None | `MANIFEST`, `LARGE`, `RM`, `A11Y`; keep as one widget regardless of inline/popover/dialog modes. |
| Prompt Library | `prompt-library.tsx` | `prompt-library-demo.tsx` | `@hugeicons/core-free-icons`, `@hugeicons/react`; registry `button`, `command`, `dialog`, `hover-card`, `input`, `popover`, `textarea`; nonstandard `components/ai-elements/prompt-input` | None | `MANIFEST`, `LARGE`, `A11Y`; optional prompt-input integration is not self-contained and must be removed or made explicit. |
| Sortable List | `sortable-list.tsx` | `sortable-list-demo.tsx` | `motion`, `react-use-measure`, `lucide-react`; registry `checkbox` | Demo contains third-party attribution link | `MANIFEST`, `A11Y`; pointer reorder needs a complete keyboard reorder path and announcements. |
| Vote Tally | `vote-tally.tsx` | `vote-tally-demo.tsx` | `@radix-ui/react-use-controllable-state` | None | `A11Y`; verify button names, controlled state, sorting stability, and live vote updates. |

## Exact exclusions

| Entry | Source path | Demo path | Reason |
| --- | --- | --- | --- |
| Background Media | `apps/www/registry/default/ui/bg-media.tsx` | `apps/www/registry/default/example/bg-media-demo.tsx` | Hard-coded full-viewport hero geometry (`h-screen`, large minimum heights); layout rather than reusable component. |
| Hero Color Panel | `apps/www/registry/default/ui/hero-color-panel.tsx` | `apps/www/registry/default/example/hero-color-panels-demo.tsx` | Complete split-layout hero section. |
| Hero Dithering | `apps/www/registry/default/ui/hero-dithering.tsx` | `apps/www/registry/default/example/hero-dithering-demo.tsx` | Complete split-layout hero section. |
| Hero Heatmap | `apps/www/registry/default/ui/hero-heatmap.tsx` | `apps/www/registry/default/example/hero-heatmap-demo.tsx` | Complete split-layout hero section. |
| Hero Liquid Metal | `apps/www/registry/default/ui/hero-liquid-metal.tsx` | `apps/www/registry/default/example/hero-liquid-metal-demo.tsx` | Complete split-layout hero section. |
| Hero Static Radial Gradient | `apps/www/registry/default/ui/hero-static-radial-gradient.tsx` | `apps/www/registry/default/example/hero-static-radial-gradient-demo.tsx` | Complete split-layout hero section. |
| Tweet Grid | `apps/www/registry/default/ui/tweet-grid.tsx` | `apps/www/registry/default/example/tweet-grid-demo.tsx` | Content-grid/layout composition, not a standalone UI component. |
| Animated Fractal Dot Grid | `apps/www/registry/default/ui/bg-animated-fractal-dot-grid.tsx` | `apps/www/registry/default/example/bg-animated-fractal-dot-grid-demo.tsx` | Cosmetic overlap with the richer Canvas Fractal Grid; keep one implementation. |
| Feature Poll | `apps/www/registry/default/ui/feature-poll.tsx` | `apps/www/registry/default/example/feature-poll-demo.tsx` | Functional duplicate of the more generic Choice Poll. |
| Feature Voting | `apps/www/registry/default/ui/feature-voting.tsx` | `apps/www/registry/default/example/feature-voting-demo.tsx` | Functional duplicate of the more generic Vote Tally. |
| Minimal Card | `apps/www/registry/default/ui/minimal-card.tsx` | `apps/www/registry/default/example/minimal-card-demo.tsx` | Basic image/title/description shell; below the intended React Bits-level bar and easy to compose natively. |
| Neumorph Eyebrow | `apps/www/registry/default/ui/neumorph-eyebrow.tsx` | `apps/www/registry/default/example/neumorph-eyebrow-demo.tsx` | Decorative eyebrow label and explicitly outside the project’s anti-slop direction. |
| Pixel Paragraph Words Inverse | `apps/www/registry/default/ui/pixel-paragraph-words-inverse.tsx` | `apps/www/registry/default/example/pixel-paragraph-words-inverse-demo.tsx` | Cosmetic inverse of Pixel Paragraph Words, not a distinct component. |

The source directory also contains four files absent from the official registry index and therefore not counted: `expandable-card.tsx` (duplicate copy of `expandable.tsx`), `glow-button.tsx`, `shader-shape-lens-blur copy.tsx`, and `type-animate.tsx`. Do not import orphan files unless upstream formally registers and documents them at a later pinned commit.

## Registry integrity problems to fix before importing

The official `registry.json` under-declares dependencies relative to actual imports. Taste Blocks must derive and validate its own complete metadata instead of copying the manifest as-is.

Package omissions found in candidate sources:

- `bg-animate-button`: `@radix-ui/react-slot`, `class-variance-authority`
- `choice-poll`: `class-variance-authority`
- `code-block`: `lucide-react`
- `color-picker`: `lucide-react`
- `expandable`: `react-use-measure`
- `family-button`: `lucide-react`, `motion`
- `family-drawer`: `clsx`
- `feature-carousel`: `clsx`, `react-wrap-balancer`
- `floating-panel`: `lucide-react`
- `gradient-button-group`: `next-themes`
- `gradient-heading`: `class-variance-authority`
- `hover-video-player`: `lucide-react`
- `intro-disclosure`: `lucide-react`
- `metal-button`: `class-variance-authority`
- `neumorph-button`: `class-variance-authority`, `lucide-react`, `motion`
- `popover`: `lucide-react`
- `popover-form`: `lucide-react`
- `shader-lens-blur`: `next-themes`
- `shift-card`: `motion`
- `side-panel`: `motion`, `react-use-measure`
- `sortable-list`: `lucide-react`
- `text-gif`: `class-variance-authority`
- `texture-button`: `class-variance-authority`
- `three-d-carousel`: `motion`
- `timer`: `class-variance-authority`, `lucide-react`
- `youtube-video-player`: `lucide-react`

Missing local registry dependencies:

- `ai-instructions`: `button`, `command`, `dialog`, `hover-card`, `input`, `popover`, `textarea`
- `color-picker`: `button`, `input`, `label`, `popover`
- `hover-video-player`: `button`, `slider`
- `intro-disclosure`: `checkbox`, `dialog`, `drawer`, `progress` in addition to the two declared entries
- `poll-widget`: `button`, `dialog`, `popover`
- `prompt-library`: `button`, `command`, `dialog`, `hover-card`, `input`, `popover`, `textarea`, plus the nonstandard `prompt-input`
- `sortable-list`: `checkbox`

## Asset policy

Do not copy demo media merely because it sits in an MIT repository. Replace product screenshots, Apple imagery, Ghibli stills, Giphy URLs, Unsplash images, Vimeo/YouTube media, Best Buy images, LS Graphics images, Cult/New Cult logos, brand SVGs, and placeholder assets with original Taste Blocks demo assets or caller-provided content. The five texture PNGs also need an upstream provenance check before reuse.

Implementation code that accepts a caller-provided image, video, or GIF remains a candidate; the third-party demonstration content does not.

## Import gate

For each selected component:

1. Copy only the pinned free source and its necessary permissive dependencies—not the Cult UI site wrapper or Pro material.
2. Record repository, commit, original path, author, MIT license, and every local change.
3. Preserve the Cult UI MIT notice in the distributed notices bundle.
4. Replace all hard-coded product data, external media, logos, and default outbound links.
5. Repair the registry dependency graph and verify a clean shadcn install into a fresh consumer project.
6. Run live visual review, TypeScript/build, console, mobile, keyboard, focus, screen-reader, reduced-motion, and performance checks.
7. Count each component once; presets, modes, colors, shapes, and demos never increase the library count.
