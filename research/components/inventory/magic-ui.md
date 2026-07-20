# Magic UI Free component inventory

Checked: 2026-07-20
Scope: React components only. No sections, page layouts, templates, dashboards, or demo variants.
Status: source and license candidate inventory; each component still needs Taste Blocks runtime, accessibility, reduced-motion, and visual QA before release.

## Decision

Magic UI Free is a usable source pool for Taste Blocks. The pinned public repository contains **77 canonical registry entries** in `apps/www/registry/registry-ui.ts`. This inventory accepts **75 materially distinct components**:

- 77 canonical entries
- minus `bento-grid`, because it is explicitly a layout
- minus `client-tweet-card`, because it is only the client wrapper for `tweet-card`
- **75 candidates total**

Each source component counts once. Alternate demos, colors, directions, shapes, and content presets do not increase the count. No code was copied during this research pass.

## Pinned source and license

| Field | Evidence |
| --- | --- |
| Repository | [magicuidesign/magicui](https://github.com/magicuidesign/magicui) |
| Pinned commit | [`76d280aa6e203da02d5efca71d7bf5999494e091`](https://github.com/magicuidesign/magicui/tree/76d280aa6e203da02d5efca71d7bf5999494e091) |
| Commit date | 2026-07-19T20:50:25+09:00 |
| Canonical component manifest | [`apps/www/registry/registry-ui.ts`](https://github.com/magicuidesign/magicui/blob/76d280aa6e203da02d5efca71d7bf5999494e091/apps/www/registry/registry-ui.ts) |
| License | [MIT License at the pinned commit](https://github.com/magicuidesign/magicui/blob/76d280aa6e203da02d5efca71d7bf5999494e091/LICENSE.md), copyright Magic UI |

The MIT grant permits use, modification, distribution, sublicensing, and sale. Redistributed copies or substantial portions must preserve the copyright and permission notice. No different per-file license or copyright notice was found in the candidate source directory.

This conclusion covers only source tracked in the pinned public repository. It does not automatically clear third-party runtime packages, remote demo media, trademarks, or content returned by external services. Those remain separate provenance items.

## Free versus Pro boundary

Magic UI Pro is a separate authenticated registry. The [official Pro installation guide](https://pro.magicui.design/docs/installation) uses a private registry token, while the [Magic UI Pro license](https://pro.magicui.design/license) prohibits redistribution, resale, sharing, transfer, and competing component-library products.

Therefore:

- **Allowed source pool:** only files that exist in the pinned public GitHub repository and are covered by its MIT license.
- **Blocked:** all code from `pro.magicui.design`, authenticated Pro registry responses, paid sections, and paid templates.
- A purchased Pro license does not make Pro source redistributable in Taste Blocks.
- Do not use Pro code in the Taste Blocks catalog site without written permission for this exact competing-library context.

## Source integrity notes

Use the pinned `registry-ui.ts` plus the actual tracked component file, not the repository-root `registry.json` alone. At this commit the generated root file is out of sync:

- Root-only stale names: `script-copy-btn`, `flip-text`, `scratch-to-reveal`, `box-reveal`, `animated-subscribe-button`, `iphone-15-pro`, `arc-timeline`, and `grid-beams`.
- Source-only current names: `noise-texture`, `hexagon-pattern`, `glare-hover`, `dia-text-reveal`, `iphone`, `light-rays`, `dotted-map`, `backlight`, `kinetic-text`, and `text-3d-flip`.
- `apps/www/registry/magicui/animated-subscribe-button.tsx` remains as an unregistered orphan with no current docs/demo entry, so it is excluded.
- Some generated dependency metadata is stale. For example, current `smooth-cursor.tsx` imports `motion/react`, not `framer-motion`.

Many animations also depend on CSS variables and keyframes declared beside the component entry in `registry-ui.ts`. Copying only the TSX file can silently produce an incomplete component. Preserve the relevant registry CSS metadata during import.

## Integration baseline

- Upstream app baseline: React 19.1, Next.js 15.5, Tailwind CSS 4.1, TypeScript 5.9.
- Common local dependency: `cn` from `@/lib/utils`, backed by `clsx` and `tailwind-merge`.
- Table dependencies list only meaningful extras beyond React, Tailwind, and `cn`.
- All 75 candidates have a matching documentation file at `apps/www/content/docs/components/<name>.mdx` and at least one tracked demo under `apps/www/registry/example/`.
- Candidate source files do not import bundled image, video, or font files. Media-dependent components accept caller-provided URLs/content. Demo media and remote URLs must not be treated as automatically licensed assets.
- Source paths below are relative to `apps/www/registry/`; demo paths are relative to `apps/www/registry/example/`.

## Text and typography — 19

| Component | Source | Extra dependencies | Inputs or assets | Primary demo |
| --- | --- | --- | --- | --- |
| Line Shadow Text | `magicui/line-shadow-text.tsx` | `motion` | text | `line-shadow-text-demo.tsx` |
| Aurora Text | `magicui/aurora-text.tsx` | — | text | `aurora-text-demo.tsx` |
| Morphing Text | `magicui/morphing-text.tsx` | — | string array | `morphing-text-demo.tsx` |
| Animated Shiny Text | `magicui/animated-shiny-text.tsx` | — | text/children | `animated-shiny-text-demo.tsx` |
| Text Reveal | `magicui/text-reveal.tsx` | `motion` | text/scroll context | `text-reveal-demo.tsx` |
| Dia Text Reveal | `magicui/dia-text-reveal.tsx` | `motion` | text | `dia-text-reveal-demo.tsx` |
| Hyper Text | `magicui/hyper-text.tsx` | `motion` | text | `hyper-text-demo.tsx` |
| Animated Gradient Text | `magicui/animated-gradient-text.tsx` | — | text/children | `animated-gradient-text-demo.tsx` |
| Word Rotate | `magicui/word-rotate.tsx` | `motion` | string array | `word-rotate-demo.tsx` |
| Typing Animation | `magicui/typing-animation.tsx` | `motion` | text | `typing-animation-demo.tsx` |
| Sparkles Text | `magicui/sparkles-text.tsx` | `motion` | text | `sparkles-text-demo.tsx` |
| Spinning Text | `magicui/spinning-text.tsx` | `motion` | text | `spinning-text-demo.tsx` |
| Comic Text | `magicui/comic-text.tsx` | `motion` | text | `comic-text-demo.tsx` |
| Text Animate | `magicui/text-animate.tsx` | `motion` | text plus animation mode | `text-animate-demo.tsx` |
| Scroll Based Velocity | `magicui/scroll-based-velocity.tsx` | `motion` | text/children, page scroll | `scroll-based-velocity-demo.tsx` |
| Video Text | `magicui/video-text.tsx` | — | caller-provided video URL | `video-text-demo.tsx` |
| Highlighter | `magicui/highlighter.tsx` | `motion`, `rough-notation` | text/children | `highlighter-demo.tsx` |
| Kinetic Text | `magicui/kinetic-text.tsx` | — | text and variable-font settings | `kinetic-text-demo.tsx` |
| Text 3D Flip | `magicui/text-3d-flip.tsx` | `motion` | text | `text-3d-flip-demo.tsx` |

## Surfaces, backgrounds, and rendered effects — 24

| Component | Source | Extra dependencies | Inputs or assets | Primary demo |
| --- | --- | --- | --- | --- |
| Warp Background | `magicui/warp-background.tsx` | `motion` | children | `warp-background-demo.tsx` |
| Progressive Blur | `magicui/progressive-blur.tsx` | — | scrollable content/container | `progressive-blur-demo.tsx` |
| Neon Gradient Card | `magicui/neon-gradient-card.tsx` | — | children | `neon-gradient-card-demo.tsx` |
| Noise Texture | `magicui/noise-texture.tsx` | — | inline SVG filter; no asset | `noise-texture-demo.tsx` |
| Meteors | `magicui/meteors.tsx` | — | no asset | `meteors-demo.tsx` |
| Grid Pattern | `magicui/grid-pattern.tsx` | — | inline SVG | `grid-pattern-demo.tsx` |
| Hexagon Pattern | `magicui/hexagon-pattern.tsx` | — | inline SVG | `hexagon-pattern-demo.tsx` |
| Striped Pattern | `magicui/striped-pattern.tsx` | — | inline SVG | `striped-pattern-demo.tsx` |
| Interactive Grid Pattern | `magicui/interactive-grid-pattern.tsx` | — | no asset | `interactive-grid-pattern-demo.tsx` |
| Dot Pattern | `magicui/dot-pattern.tsx` | `motion` | inline SVG | `dot-pattern-demo.tsx` |
| Flickering Grid | `magicui/flickering-grid.tsx` | — | canvas; no asset | `flickering-grid-demo.tsx` |
| Globe | `magicui/globe.tsx` | `cobe`, `motion` | globe/marker config | `globe-demo.tsx` |
| Glyph Matrix | `magicui/glyph-matrix.tsx` | — | glyph config | `glyph-matrix-demo.tsx` |
| Particles | `magicui/particles.tsx` | — | canvas; no asset | `particles-demo.tsx` |
| Ripple | `magicui/ripple.tsx` | — | no asset | `ripple-demo.tsx` |
| Retro Grid | `magicui/retro-grid.tsx` | — | no asset | `retro-grid-demo.tsx` |
| Animated Grid Pattern | `magicui/animated-grid-pattern.tsx` | `motion` | inline SVG | `animated-grid-pattern-demo.tsx` |
| Border Beam | `magicui/border-beam.tsx` | `motion` | container geometry | `border-beam-demo.tsx` |
| Animated Beam | `magicui/animated-beam.tsx` | `motion` | element refs and inline SVG | `animated-beam-demo.tsx` |
| Orbiting Circles | `magicui/orbiting-circles.tsx` | — | caller-provided children/icons | `orbiting-circles-demo.tsx` |
| Shine Border | `magicui/shine-border.tsx` | — | container geometry | `shine-border-demo.tsx` |
| Light Rays | `magicui/light-rays.tsx` | `motion` | no asset | `light-rays-demo.tsx` |
| Dotted Map | `magicui/dotted-map.tsx` | `svg-dotted-map` | generated map/marker config | `dotted-map-demo.tsx` |
| Backlight | `magicui/backlight.tsx` | — | caller-provided image, SVG, video, or child | `backlight-image-demo.tsx` |

The four static pattern families above are separate SVG implementations with different geometry and prop surfaces. Their alternate demos are not counted. If the final catalog decides that visual-pattern families should collapse to one product entry, perform that product-level deduplication later without changing this source inventory.

## Interaction, controls, and motion wrappers — 17

| Component | Source | Extra dependencies | Inputs or assets | Primary demo |
| --- | --- | --- | --- | --- |
| Magic Card | `magicui/magic-card.tsx` | `motion`, `next-themes` | children/pointer position | `magic-card-demo.tsx` |
| Lens | `magicui/lens.tsx` | `motion` | caller-provided media/child | `lens-demo.tsx` |
| Pointer | `magicui/pointer.tsx` | `motion` | children; inline default pointer or custom child | `pointer-demo-1.tsx` |
| Smooth Cursor | `magicui/smooth-cursor.tsx` | `motion` | inline default cursor or custom SVG | `smooth-cursor-demo.tsx` |
| Glare Hover | `magicui/glare-hover.tsx` | — | children | `glare-hover-demo.tsx` |
| Shimmer Button | `magicui/shimmer-button.tsx` | — | button content | `shimmer-button-demo.tsx` |
| Dock | `magicui/dock.tsx` | `motion`, `class-variance-authority` | caller-provided dock items | `dock-demo.tsx` |
| Shiny Button | `magicui/shiny-button.tsx` | `motion` | button content | `shiny-button-demo.tsx` |
| Confetti | `magicui/confetti.tsx` | `canvas-confetti`; shadcn `Button` | trigger/content; generated canvas particles | `confetti-demo.tsx` |
| Cool Mode | `magicui/cool-mode.tsx` | — | child trigger; generated SVG particles | `cool-mode-demo.tsx` |
| Pulsating Button | `magicui/pulsating-button.tsx` | — | button content | `pulsating-button-demo.tsx` |
| Ripple Button | `magicui/ripple-button.tsx` | — | button content/pointer event | `ripple-button-demo.tsx` |
| Rainbow Button | `magicui/rainbow-button.tsx` | `@radix-ui/react-slot`, `class-variance-authority` | button content | `rainbow-button-demo.tsx` |
| Interactive Hover Button | `magicui/interactive-hover-button.tsx` | `lucide-react` | button content | `interactive-hover-button-demo.tsx` |
| Animated Theme Toggler | `magicui/animated-theme-toggler.tsx` | `lucide-react`, `react-dom`; View Transitions API | theme callback; no asset | `animated-theme-toggler-demo.tsx` |
| Scroll Progress | `magicui/scroll-progress.tsx` | `motion` | page scroll | `scroll-progress-demo.tsx` |
| Blur Fade | `magicui/blur-fade.tsx` | `motion` | arbitrary child | `blur-fade-demo.tsx` |

## Content, media, data, and mockups — 15

| Component | Source | Extra dependencies | Inputs or assets | Primary demo |
| --- | --- | --- | --- | --- |
| Android | `magicui/android.tsx` | — | caller-provided image/video URL | `android-demo.tsx` |
| Hero Video Dialog | `magicui/hero-video-dialog.tsx` | `motion`, `lucide-react` | thumbnail and video URLs | `hero-video-dialog-demo.tsx` |
| Code Comparison | `magicui/code-comparison.tsx` | `shiki`, `@shikijs/transformers`, `next-themes`, `lucide-react` | before/after code strings | `code-comparison-demo.tsx` |
| Marquee | `magicui/marquee.tsx` | — | arbitrary repeated children | `marquee-demo.tsx` |
| Tweet Card | `magicui/tweet-card.tsx` | `react-tweet` | tweet ID; runtime X/Twitter data and media | `tweet-card-demo.tsx` |
| Number Ticker | `magicui/number-ticker.tsx` | `motion` | numeric value | `number-ticker-demo.tsx` |
| Animated List | `magicui/animated-list.tsx` | `motion` | list children | `animated-list-demo.tsx` |
| Avatar Circles | `magicui/avatar-circles.tsx` | — | caller-provided avatar URLs | `avatar-circles-demo.tsx` |
| Icon Cloud | `magicui/icon-cloud.tsx` | `react-dom/server` | caller icons or image URLs; image CORS applies | `icon-cloud-demo.tsx` |
| Animated Circular Progress Bar | `magicui/animated-circular-progress-bar.tsx` | — | numeric value/range | `animated-circular-progress-bar-demo.tsx` |
| File Tree | `magicui/file-tree.tsx` | `@radix-ui/react-accordion`, `lucide-react`; shadcn `Button` and `ScrollArea` | caller tree structure | `file-tree-demo.tsx` |
| Safari | `magicui/safari.tsx` | — | caller-provided image/video URL | `safari-demo.tsx` |
| iPhone | `magicui/iphone.tsx` | — | caller-provided image/video URL | `iphone-demo.tsx` |
| Terminal | `magicui/terminal.tsx` | `motion` | terminal line children | `terminal-demo.tsx` |
| Pixel Image | `magicui/pixel-image.tsx` | — | caller-provided image URL | `pixel-image-demo.tsx` |

`HeroVideoDialog` is retained because its shipped unit is a reusable media trigger/modal component, not a hero section. `Android`, `Safari`, and `iPhone` are separate SVG/device-frame implementations, not color or content variants.

## Explicit exclusions

| Upstream item | Reason |
| --- | --- |
| `bento-grid` | Layout primitive; outside the component-only scope. |
| `client-tweet-card` | Thin client wrapper around the same Tweet Card implementation; duplicate product entry. |
| `animated-subscribe-button.tsx` orphan | Tracked file but absent from the current canonical registry, docs, and demos. Do not import until upstream restores a complete registry entry. |
| Root-only stale registry names | Their current source files are absent or renamed at the pinned commit; copying them from stale generated metadata would break provenance. |
| `apps/www/content/docs/templates/**` | Templates/page compositions, not components. |
| `apps/www/components/sections/**` and Magic UI Pro sections | Website sections and paid code; outside scope and, for Pro, not redistributable. |
| Demo variants | Evidence for testing only; never separate catalog counts. |

## Import gates

Before any candidate becomes a Taste Blocks component:

1. Copy only from the pinned source path and record the original SHA/path.
2. Carry over that entry's registry CSS, keyframes, and required registry dependencies.
3. Preserve the Magic UI MIT notice in third-party notices and the component provenance record.
4. Independently verify every third-party dependency license.
5. Replace demo-only remote media with owned or clearly licensed fixtures.
6. Test build, hydration, keyboard use, mobile behavior, reduced motion, cleanup of timers/RAF/listeners, and console output.
7. Record modifications; do not imply Magic UI authored the Taste Blocks catalog or endorsed it.
