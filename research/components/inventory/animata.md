# Animata component inventory

Checked: 2026-07-20
Repository: [codse/animata](https://github.com/codse/animata)
Pinned commit: [`de9aabb0eed14e0db944bb07720961ddc450c672`](https://github.com/codse/animata/commit/de9aabb0eed14e0db944bb07720961ddc450c672)
License: [MIT](https://github.com/codse/animata/blob/de9aabb0eed14e0db944bb07720961ddc450c672/LICENSE.md), `Copyright (c) Animata`
Scope: reusable components only; no website sections, layouts, templates, dashboards, or separately counted cosmetic variants.

## Decision

Animata is a usable permissive source for Taste Blocks. At the pinned commit, its own registry build produces **154 published entries** and every published entry has a Storybook story. Applying the Taste Blocks scope and deduplication rules leaves **119 distinct component candidates**:

- **106 direct candidates**: no known bundled-media or host-import blocker.
- **13 conditional candidates**: keep the component logic, but remove brand defaults, remote demo media, or repository-only imports before publishing.
- **35 published entries not counted**: 8 layouts/sections, 9 trademark or secondary-provenance holds, and 18 duplicate counts removed by collapsing 19 TextAnimator wrappers into one preset-pack component.
- **48 additional top-level source files deferred** because Animata does not publish them in its docs/registry at the pinned commit. The shared TextAnimator runtime is the one repository-only file intentionally used by the preset-pack candidate.

This is an inventory, not an import approval. A component counts in Taste Blocks only after its pinned files build in isolation, its preview uses Taste-owned assets, and the MIT notice is present in the distribution.

## Candidate totals

| Component family | Count |
| --- | ---: |
| Background effects | 10 |
| Buttons and toggles | 10 |
| Cards | 9 |
| Containers | 5 |
| Floating actions | 2 |
| Charts and progress visuals | 5 |
| Icon interactions | 2 |
| Image interactions | 5 |
| Lists and orbit interactions | 7 |
| Overlay | 1 |
| Preloaders | 2 |
| Progress | 2 |
| Skeletons | 6 |
| Tabs | 3 |
| Text effects | 21 |
| Widgets | 29 |
| **Total** | **119** |

## Runtime key

All candidates assume React, TypeScript, Tailwind CSS 4.x, and Animata's usual `cn` helper (`clsx` plus `tailwind-merge`) where imported. Exact additional dependency versions recorded by Animata's generated registry are:

- `M`: `motion@^12.38.0`
- `L`: `lucide-react@^0.475.0`
- `RI`: `@radix-ui/react-icons@^1.3.2`
- `P`: `@phosphor-icons/react@^2.1.10`
- `TP`: `@tsparticles/engine@^3.5.0`, `@tsparticles/react@^3.0.0`, `tsparticles@^3.5.0`
- `CSS`: a co-located CSS file is part of the component.
- `hook`: a co-located Animata hook is part of the registry payload.
- `conditional`: asset or import cleanup described under **Import blockers and assets** is required.

## Candidate source paths

The source path is relative to the Animata repository at the pinned commit. Unless noted otherwise, its demo is the adjacent `<name>.stories.tsx`, its documentation is `content/docs/<category>/<name>.mdx`, and its official registry item is `https://animata.design/r/<category>/<name>.json`.

### Background effects — 10

- `animata/background/animated-beam.tsx` (`CSS`)
- `animata/background/blurry-blob.tsx`
- `animata/background/boids-ecosystem.tsx`
- `animata/background/diagonal-lines.tsx`
- `animata/background/dot.tsx`
- `animata/background/grid.tsx`
- `animata/background/interactive-grid.tsx`
- `animata/background/moving-gradient.tsx`
- `animata/background/shooting-stars.tsx` (`CSS`)
- `animata/background/zigzag.tsx`

### Buttons and toggles — 10

- `animata/button/ai-button.tsx` (`TP`)
- `animata/button/animated-follow-button.tsx` (`M`)
- `animata/button/get-started-button.tsx` (`L`)
- `animata/button/ripple-button.tsx` (`CSS`)
- `animata/button/shining-button.tsx` (`L`)
- `animata/button/slide-arrow-button.tsx` (`L`)
- `animata/button/status-button.tsx`
- `animata/button/swipe-button.tsx`
- `animata/button/toggle-switch.tsx`
- `animata/button/work-button.tsx`

### Cards — 9

- `animata/card/card-comment.tsx`
- `animata/card/card-spread.tsx` (`CSS`)
- `animata/card/card-stack.tsx` (`M`, `hook`: `hooks/use-prefers-reduced-motion.ts`)
- `animata/card/case-study-card.tsx`
- `animata/card/collab-card.tsx` (`CSS`)
- `animata/card/flip-card.tsx`
- `animata/card/glowing-card.tsx`
- `animata/card/led-board.tsx`
- `animata/card/swap-text-card.tsx`

### Containers — 5

- `animata/container/animated-border-trail.tsx` (`CSS`)
- `animata/container/announcement-ribbon.tsx`
- `animata/container/cursor-tracker.tsx` (`hook`: `hooks/use-mouse-position.ts`)
- `animata/container/marquee.tsx` (`CSS`)
- `animata/container/sibling-focus-nav.tsx`

### Floating actions — 2

- `animata/fabs/flower-menu.tsx` (`CSS`)
- `animata/fabs/speed-dial.tsx` (`L`, `CSS`)

### Charts and progress visuals — 5

- `animata/graphs/bar-chart.tsx`
- `animata/graphs/donut-chart.tsx`
- `animata/graphs/gauge-chart.tsx`
- `animata/graphs/progress.tsx`
- `animata/graphs/ring-chart.tsx`

### Icon interactions — 2

- `animata/icon/hover-interaction.tsx` (`RI`, `M`, conditional)
- `animata/icon/icon-ripple.tsx` (`L`)

### Image interactions — 5

- `animata/image/disclose-image.tsx`
- `animata/image/images-reveal.tsx` (`M`, conditional)
- `animata/image/skew-image.tsx`
- `animata/image/tilted-cover.tsx`
- `animata/image/trailing-image.tsx` (`M`, `hook`: `hooks/use-mouse-position.ts`, conditional)

### Lists and orbit interactions — 7

- `animata/list/avatar-list.tsx` (conditional)
- `animata/list/flipping-cards.tsx`
- `animata/list/menu-animation.tsx` (`L`)
- `animata/list/orbiting-items-3-d.tsx` (`L`, conditional)
- `animata/list/orbiting-items.tsx` (conditional)
- `animata/list/reveal-image.tsx` (conditional)
- `animata/list/transaction-list.tsx` (`L`, `M`)

### Overlay — 1

- `animata/overlay/modal.tsx` (`L`, `M`)

### Preloaders — 2

- `animata/preloader/split-reveal.tsx` (`CSS`, `hook`: `hooks/use-prefers-reduced-motion.ts`, `hooks/use-lock-body.ts`; the registry also bundles the `animata/preloader/split-reveal/` module directory)
- `animata/preloader/vertical-tiles.tsx` (`L`, `M`)

### Progress — 2

- `animata/progress/animatedtimeline.tsx` (`L`, `M`)
- `animata/progress/spinner.tsx`

### Skeletons — 6

- `animata/skeleton/code.tsx` (`L`)
- `animata/skeleton/cookie-banner.tsx`
- `animata/skeleton/list.tsx`
- `animata/skeleton/receipt.tsx`
- `animata/skeleton/report.tsx`
- `animata/skeleton/wide-card.tsx` (conditional)

### Tabs — 3

All three registry entries also bundle `animata/tabs/shared.ts` for keyboard and focus behavior.

- `animata/tabs/fluid-tabs.tsx` (`L`, `M`)
- `animata/tabs/gooey-tabs.tsx` (`P`, `M`)
- `animata/tabs/shift-tabs.tsx`

### Text effects — 21

- `animata/text/text-animator.tsx` plus `animata/text/text-animator.css` and the 19 preset wrappers listed under **Collapsed variants** — one configurable preset-pack candidate, not 19 components
- `animata/text/animated-gradient-text.tsx`
- `animata/text/bold-copy.tsx`
- `animata/text/circular-text.tsx` (`M`)
- `animata/text/counter.tsx`
- `animata/text/cycle-text.tsx` (`M`)
- `animata/text/double-underline.tsx`
- `animata/text/gibberish-text.tsx`
- `animata/text/glitch-text.tsx` (`CSS`)
- `animata/text/jitter-text.tsx` (`M`)
- `animata/text/mirror-text.tsx`
- `animata/text/roll-text.tsx` (`CSS`)
- `animata/text/scroll-reveal.tsx`
- `animata/text/split-text.tsx`
- `animata/text/swap-text.tsx`
- `animata/text/text-border-animation.tsx`
- `animata/text/text-flip.tsx`
- `animata/text/ticker.tsx`
- `animata/text/typing-text.tsx`
- `animata/text/underline-hover-text.tsx`
- `animata/text/wave-reveal.tsx`

### Widgets — 29

- `animata/widget/alarm-clock.tsx` (`L`)
- `animata/widget/battery-level.tsx`
- `animata/widget/battery.tsx` (`L`)
- `animata/widget/calendar-event.tsx`
- `animata/widget/calorie-counter.tsx` (conditional)
- `animata/widget/clock-with-photo.tsx` (conditional)
- `animata/widget/cycling.tsx`
- `animata/widget/delivery-card.tsx` (`L`)
- `animata/widget/direction-card.tsx` (`L`)
- `animata/widget/expense-tracker.tsx`
- `animata/widget/fund-widget.tsx` (`M`)
- `animata/widget/live-score.tsx`
- `animata/widget/mobile-detail.tsx` (`L`)
- `animata/widget/music-widget.tsx` (`L`, conditional)
- `animata/widget/notes.tsx`
- `animata/widget/profile.tsx` (conditional)
- `animata/widget/reminder-widget.tsx` (`L`)
- `animata/widget/reminder.tsx`
- `animata/widget/score-board.tsx`
- `animata/widget/security-alert.tsx` (`L`)
- `animata/widget/shopping-list.tsx`
- `animata/widget/sleep-tracker.tsx` (conditional)
- `animata/widget/storage-status.tsx`
- `animata/widget/storage-widget.tsx` (`L`)
- `animata/widget/study-timer.tsx` (`L`)
- `animata/widget/vpn-widget.tsx` (`L`)
- `animata/widget/water-tracker.tsx` (`L`)
- `animata/widget/weather-card.tsx` (`L`)
- `animata/widget/weekly-progress.tsx` (`L`)

## Import blockers and assets

These 13 candidates remain useful, but must not be published unchanged:

| Source path | Required cleanup |
| --- | --- |
| `animata/icon/hover-interaction.tsx` | The default map is limited to Figma, Framer, GitHub, Instagram, LinkedIn, and Twitter/X logos. Make the icon a caller-provided element and ship neutral demo content. |
| `animata/image/images-reveal.tsx` | Five Unsplash URLs are hard-coded in component defaults. Require caller-provided images and use Taste-owned preview media. |
| `animata/image/trailing-image.tsx` | Five Lummi asset URLs are hard-coded. Require caller-provided images; do not mirror those assets. |
| `animata/list/avatar-list.tsx` | Six Unsplash portraits are hard-coded. Accept data through props and replace preview media. |
| `animata/list/reveal-image.tsx` | Six Unsplash URLs are hard-coded. Accept data through props and replace preview media. |
| `animata/list/orbiting-items.tsx` | Imports repository-only `@/components/icons`, which the generated registry item does not bundle. Remove branded default icons and require `items`. |
| `animata/list/orbiting-items-3-d.tsx` | Imports repository-only `@/components/icons`. Bundle a neutral local demo or require caller-provided items. |
| `animata/skeleton/wide-card.tsx` | A remote Unsplash image is embedded in the component rather than only in its story. Replace it with a neutral placeholder or prop. |
| `animata/widget/calorie-counter.tsx` | Embeds Unsplash and Vercel-avatar URLs. Replace both with props or Taste-owned preview media. |
| `animata/widget/clock-with-photo.tsx` | Uses `absoluteUrl` from Animata's nonstandard `@/lib/utils` and a remote Unsplash image. Remove the default asset and the host-specific helper. |
| `animata/widget/music-widget.tsx` | Uses `absoluteUrl("/widget/music.jpg")`; the registry does not ship that file or helper. Require a cover URL and provide a Taste-owned preview asset. |
| `animata/widget/profile.tsx` | Embeds an IGN-hosted avatar and branded social destinations. Replace the default identity, image, and destinations. |
| `animata/widget/sleep-tracker.tsx` | Embeds a remote Unsplash image. Replace it with a prop or Taste-owned preview media. |

Storybook stories for additional otherwise-clean components use Unsplash or Lummi demo images. Stories and their remote media are reference demos, not redistributable component assets. Taste Blocks should write its own previews around the copied component source.

## Published paths not counted

### Layouts and website sections — 8

These are explicitly outside the current component-only scope:

- `animata/bento-grid/eight.tsx`
- `animata/bento-grid/gradient.tsx`
- `animata/bento-grid/three.tsx`
- `animata/hero/hero-section-text-hover.tsx`
- `animata/hero/product-features.tsx`
- `animata/hero/shape-shifter.tsx`
- `animata/hero/slack-intro.tsx`
- `animata/scroll/stacked-sections.tsx`

### Trademark or secondary-provenance holds — 9

- `animata/button/algolia-blue-button.tsx` — named Algolia reproduction and near-duplicate of the white version
- `animata/button/algolia-white-button.tsx` — named Algolia reproduction and near-duplicate of the blue version
- `animata/button/duolingo.tsx` — named Duolingo reproduction
- `animata/card/github-card-shiny.tsx` — GitHub-branded presentation
- `animata/card/github-card-skew.tsx` — GitHub/Copilot-branded presentation
- `animata/text/jumping-text-instagram.tsx` — Instagram-named reproduction
- `animata/text/text-explode-imessage.tsx` — iMessage-named reproduction
- `animata/widget/flight-widget.tsx` — hard-coded Air Canada name and externally hosted logo
- `animata/text/metis-text.tsx` — explicitly points to Codrops `LineHoverStyles`; hold until the exact upstream file and license are traced independently

The repository MIT license covers Animata's code distribution, but it does not grant rights in third-party trademarks, logos, photography, or separately sourced implementations.

### Collapsed TextAnimator variants — 19 wrappers counted as one component

These files mainly configure the shared WAAPI `TextAnimator` runtime. They may ship as presets, but must not inflate the component count:

- `animata/text/blur-out-up.tsx`
- `animata/text/bottom-up-letters.tsx`
- `animata/text/fade-through.tsx`
- `animata/text/focus-blur-resolve.tsx`
- `animata/text/kinetic-center-build.tsx`
- `animata/text/line-by-line-slide.tsx`
- `animata/text/mask-reveal-up.tsx`
- `animata/text/micro-scale-fade.tsx`
- `animata/text/per-character-rise.tsx`
- `animata/text/per-word-crossfade.tsx`
- `animata/text/scale-down-fade.tsx`
- `animata/text/shared-axis-y.tsx`
- `animata/text/shared-axis-z.tsx`
- `animata/text/shimmer-sweep.tsx`
- `animata/text/short-slide-down.tsx`
- `animata/text/short-slide-right.tsx`
- `animata/text/soft-blur-in.tsx`
- `animata/text/spring-scale-in.tsx`
- `animata/text/top-down-letters.tsx`

## Repository-only paths deferred — 48

These top-level component files exist under `animata/` but do not produce a published docs/registry item at the pinned commit. They are not counted until separately reviewed; several were intentionally unpublished in Animata's changelog.

- `animata/accordion/faq.tsx`
- `animata/bento-grid/eleven.tsx`
- `animata/bento-grid/five.tsx`
- `animata/bento-grid/four.tsx`
- `animata/bento-grid/nine.tsx`
- `animata/bento-grid/seven.tsx`
- `animata/bento-grid/six.tsx`
- `animata/bento-grid/ten.tsx`
- `animata/button/arrow-button.tsx`
- `animata/button/external-link-button.tsx`
- `animata/card/blur-stack-card.tsx`
- `animata/card/card-stack-profile.tsx`
- `animata/card/comment-reply-card.tsx`
- `animata/card/email-feature-card.tsx`
- `animata/card/integration-pills.tsx`
- `animata/card/notice-card.tsx`
- `animata/card/notification-card.tsx`
- `animata/card/notify-user-info.tsx`
- `animata/card/reminder-scheduler.tsx`
- `animata/card/score-card.tsx`
- `animata/card/staggered-card.tsx`
- `animata/card/subscribe-card.tsx`
- `animata/card/survey-card.tsx`
- `animata/card/swap-card.tsx`
- `animata/card/tilted-card.tsx`
- `animata/card/WebHooks-card.tsx`
- `animata/carousel/expandable.tsx`
- `animata/carousel/image-carousel.tsx`
- `animata/container/animated-dock.tsx`
- `animata/container/fibonacci-lines.tsx`
- `animata/container/nav-tabs.tsx`
- `animata/feature-cards/confirmation-message.tsx`
- `animata/feature-cards/content-scan.tsx`
- `animata/graphs/commit-graph.tsx`
- `animata/hero/hero-section.tsx`
- `animata/image/image-box-shadow.tsx`
- `animata/image/photo-booth.tsx`
- `animata/image/zoom-image.tsx`
- `animata/list/transition-list.tsx`
- `animata/section/pricing.tsx`
- `animata/skeleton/category-glyphs.tsx`
- `animata/skeleton/category-skeleton.tsx`
- `animata/text/mask-text.tsx`
- `animata/text/staggered-letter.tsx`
- `animata/widget/calendar-widget.tsx`
- `animata/widget/music-stack-interaction.tsx`
- `animata/widget/team-clock.tsx`
- `animata/widget/video-chat.tsx`

`animata/text/text-animator.tsx` is also repository-only, but is intentionally counted once as the runtime for the 19 published preset wrappers. Nested `split-reveal/` modules, CSS files, stories, hooks, and `tabs/shared.ts` are implementation files, not independent components.

## Redistribution obligations

1. Preserve the full Animata MIT license text and `Copyright (c) Animata` in Taste Blocks' third-party notices and in any substantial source distribution.
2. Record the repository URL, pinned commit, original path, and our changes for every imported component. MIT does not require this extra provenance detail, but Taste Blocks does.
3. Do not imply Animata endorsement. Renaming a component does not remove the notice obligation.
4. Do not copy third-party photos, Lummi assets, hosted avatars, airline logos, social logos, or branded demo copy merely because their URLs appear in MIT-licensed source.
5. Track dependency licenses separately. Animata's MIT license does not replace the licenses of Motion, Lucide, Radix Icons, Phosphor Icons, tsParticles, React, or Tailwind CSS.
6. Keep a modification note when replacing assets, imports, or defaults. The original MIT disclaimer and no-warranty terms remain applicable.

## Import strategy

Use the pinned GitHub source as the legal and reproducible origin, not a mutable live registry response. For each approved candidate:

1. Copy only the component, its co-located CSS, and the helper files listed by Animata's generated registry item.
2. Add a local provenance record and the Animata MIT notice in the same commit.
3. Replace `@/lib/utils`, hooks, and shared imports with existing Taste Blocks equivalents rather than duplicating helpers.
4. Remove source-bundled remote media and branded defaults before the first preview.
5. Build and render the component in isolation, then compare behavior with its adjacent Storybook story.
6. Count the TextAnimator runtime once; expose its 19 wrappers as presets or examples.

## Verification record

- `git rev-parse HEAD` returned `de9aabb0eed14e0db944bb07720961ddc450c672`.
- Animata's own `node scripts/build-registry.js` generated **154** registry items and skipped 57 docs entries with no source or unpublished status.
- Registry category totals matched the public site's `154+` claim.
- All 154 published primary sources had an adjacent Storybook story.
- The source tree and generated registry exposed two concrete host-import failures (`@/components/icons` in both orbit components) and two `absoluteUrl` assumptions (`clock-with-photo`, `music-widget`); these are called out above rather than silently treated as install-ready.
