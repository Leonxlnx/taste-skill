# Eldora UI and UI Layouts component inventory

Checked: 2026-07-20
Scope: React components only. Page sections, layout blocks, templates, dashboards, and cosmetic variants are excluded.
Status: research only; no upstream code was copied.

## Decision

- **Eldora UI: reject the entire pool for Taste Blocks.** Its public repository carries an MIT file, but the project's official Terms and Conditions separately prohibit redistributing Eldora components as a standalone component library. Taste Blocks is exactly that use case. The conflict is too material to resolve by assumption; import nothing without written permission or an upstream clarification that the repository's MIT grant controls this use.
- **UI Layouts Free: usable candidate pool, with exclusions.** Source tracked in the pinned public repository is MIT-licensed. The separate Pro product is not part of that source pool. Files under `registry/components/external/` are rejected because their upstream provenance is not documented per file.
- UI Layouts has 253 generated `registry:component` entries, but most are demos, style variants, directional variants, or wrappers around the same primitive. This pass shortlists **33 distinct component families**. That is an inventory count, not a release count.
- None of the 52 UI Layouts component files sampled during this pass contained `useReducedMotion` or a `prefers-reduced-motion` branch. Every animated candidate therefore needs a reduced-motion pass before release.

## Pinned sources and license boundary

| Project | Official repository | Pinned `main` commit | Repository license | Product boundary | Taste Blocks result |
| --- | --- | --- | --- | --- | --- |
| Eldora UI | [karthikmudunuri/eldoraui](https://github.com/karthikmudunuri/eldoraui) | [`2ef4f1eb4f4a6dea6fc2bdd4d87b6a3f2ff65321`](https://github.com/karthikmudunuri/eldoraui/tree/2ef4f1eb4f4a6dea6fc2bdd4d87b6a3f2ff65321) | [MIT file](https://github.com/karthikmudunuri/eldoraui/blob/2ef4f1eb4f4a6dea6fc2bdd4d87b6a3f2ff65321/LICENSE.md) | The official [Terms](https://www.eldoraui.site/docs/terms-and-conditions) allow use in projects but forbid standalone component-library redistribution. No separate paid component tier was found on the official site. | **Reject as legally ambiguous.** |
| UI Layouts Free | [ui-layouts/uilayouts](https://github.com/ui-layouts/uilayouts) | [`fcc2c596d38c0d7d72b0a4550f75c17a652c0bf6`](https://github.com/ui-layouts/uilayouts/tree/fcc2c596d38c0d7d72b0a4550f75c17a652c0bf6) | [MIT](https://github.com/ui-layouts/uilayouts/blob/fcc2c596d38c0d7d72b0a4550f75c17a652c0bf6/LICENSE), copyright UI LAYOUT | The public [components catalog](https://www.ui-layouts.com/components) is presented as open source. [UI Layouts Pro](https://pro.ui-layouts.com/) is a separate paid catalog of blocks, templates, and a builder under a commercial license. | Public-repo component source only; never ingest Pro responses or paid code. |

The UI Layouts MIT notice must travel with redistributed source or substantial portions. The grant does not automatically clear remote images, videos, trademarks, or dependencies. Copy only from the pinned GitHub tree, never from the rendered Pro site or an authenticated registry.

## UI Layouts source integrity

- Canonical generated manifest: [`apps/ui-layout/registry.json`](https://github.com/ui-layouts/uilayouts/blob/fcc2c596d38c0d7d72b0a4550f75c17a652c0bf6/apps/ui-layout/registry.json).
- Upstream baseline: React 19.2, Next.js 15, Tailwind CSS 4, TypeScript 6, and `motion` 12.
- Registry dependency metadata is incomplete. Examples: `animated-beam` declares no package dependency although its source imports `motion/react`; `color-picker` declares none although its source imports `react-colorful`, `sonner`, `lucide-react`, and local UI primitives. Derive dependencies from source imports, not the manifest field alone.
- Several files import `@/components/website/ui/*`, `@/hooks/*`, or `@/lib/*`. Those transitive files are not consistently included in registry entries. A candidate is not installable until its complete dependency closure is recorded.
- Demo media is commonly loaded from Unsplash or Pexels. Treat those URLs as preview evidence only and replace them with Taste Blocks-owned or separately licensed fixtures.
- The repo contains 74 `registry:block` entries and public packages of hero, feature, about, team, stats, testimonial, pricing, FAQ, and footer sections. They are intentionally excluded even where MIT-covered.

## UI Layouts shortlisted component families — 33

Paths are relative to the pinned UI Layouts repository. “Candidate” means worth an import/QA pass, not approved for release. “Hold” means the implementation needs a material repair or provenance check before copying.

### Visual effects and media — 9

| Component | Status | Source path | Direct dependencies | Inputs or assets | Official demo | Quality notes |
| --- | --- | --- | --- | --- | --- | --- |
| Blur Vignette | Candidate | `apps/ui-layout/components/ui/blur-vignette.tsx` | React, local `cn` | Caller media or child content; no bundled asset | [blur-vignette](https://www.ui-layouts.com/components/blur-vignette) | Small reusable CSS-mask primitive. Add decorative semantics and verify browser fallback. |
| Progressive Carousel | Candidate | `apps/ui-layout/components/ui/progressive-carousel.tsx` | `motion`, local `cn` | Caller slide data and image URLs | [progressive-carousel](https://www.ui-layouts.com/components/progressive-carousel) | Distinct progressive reveal interaction and some ARIA. Needs focus order, reduced motion, and touch testing. |
| Image Tabs | Hold | `apps/ui-layout/components/ui/image-tabs.tsx` | `motion`, local media-query hook and `cn` | Caller images and labels | [image-tabs](https://www.ui-layouts.com/components/image-tabs) | Useful visual selector, but source lacks tab roles/keyboard model and pulls a local hook. |
| Magnified Doc | Candidate | `apps/ui-layout/components/ui/magnified-doc.tsx` | `@radix-ui/react-tooltip`, local `cn` | Caller-provided items/children | [magnified-doc](https://www.ui-layouts.com/components/magnified-doc) | Compact magnification primitive built on Radix Tooltip. Audit touch and keyboard parity. |
| Mouse Trail | Hold | `apps/ui-layout/components/ui/mousetrail.tsx` | React, local `cn` | Caller image URLs | [image-mousetrail](https://www.ui-layouts.com/components/image-mousetrail) | Visually distinctive but pointer-only by design; needs coarse-pointer disable, image cleanup, and reduced motion. |
| Liquid Glass | Candidate | `apps/ui-layout/components/ui/liquid-glass.tsx` | `motion`, local `cn` | Children; SVG/filter generated in code | [liquid-glass](https://www.ui-layouts.com/components/liquid-glass) | Strong reusable surface effect. Verify filter performance, forced colors, Safari, and reduced motion. |
| Liquid Gradient | Candidate | `apps/ui-layout/components/ui/liquid-gradient.tsx` | `motion` | Inline SVG filters; no remote asset | [liquid-gradient](https://www.ui-layouts.com/components/liquid-gradient) | Distinct animated gradient primitive. Needs deterministic IDs for multiple instances and static fallback. |
| Spotlight | Candidate | `apps/ui-layout/components/ui/spotlight.tsx` | React, local `cn` | Children; pointer coordinates | [spotlight-cards](https://www.ui-layouts.com/components/spotlight-cards) | Reusable pointer-light primitive. Use as decoration, disable on touch/reduced motion, and avoid counting card skins separately. |
| Image Reveal | Hold | `apps/ui-layout/registry/components/image-reveal/image-reveal.tsx` | `motion` | Four Unsplash URLs are hard-coded in source | [image-reveal](https://www.ui-layouts.com/components/image-reveal) | Good transition concept, but currently a fixed demo rather than a reusable data-driven component. Do not ship remote fixtures. |

### Motion and text — 10

| Component | Status | Source path | Direct dependencies | Inputs or assets | Official demo | Quality notes |
| --- | --- | --- | --- | --- | --- | --- |
| Scroll Text | Candidate | `apps/ui-layout/components/ui/scroll-text.tsx` | `motion`, local `cn` | Text/children and page scroll | [scroll-text](https://www.ui-layouts.com/components/scroll-text) | Useful scroll-mapped typography primitive. Add a static reduced-motion state and screen-reader-safe text. |
| Text Marquee | Candidate | `apps/ui-layout/components/ui/scroll-text-marque.tsx` | `@motionone/utils`, local `cn` | Text/children | [scroll-text-marquee](https://www.ui-layouts.com/components/scroll-text-marquee) | Distinct velocity/marquee behavior. Test resize and pause rules; do not count directional demos separately. |
| Randomized Text | Hold | `apps/ui-layout/components/ui/text-randomized.tsx` | React | Text only | [randomized-text-effect](https://www.ui-layouts.com/components/randomized-text-effect) | Current async loop has no cancellation and repeatedly replaces readable text. Requires cleanup, reduced motion, and a stable accessible label. |
| Swapy | Hold | `apps/ui-layout/components/ui/swapy.tsx` | `swapy`, React, local `cn` | Caller slots/items | [swapy](https://www.ui-layouts.com/components/swapy) | Strong spatial interaction, but upstream source shows no keyboard reordering model. Keep one component; opacity/handle demos are variants. |
| Drag Items | Hold | `apps/ui-layout/registry/components/drag/drag-items.tsx` | React | Inline SVG plus a hard-coded Unsplash image and project links | [drag-items](https://www.ui-layouts.com/components/drag-items) | Demo-like and pointer-oriented. Convert data/assets to inputs and add keyboard/touch behavior before release. |
| Timeline Animation | Candidate | `apps/ui-layout/components/ui/timeline-animation.tsx` | `motion`, React | Arbitrary child content | [timeline-animation](https://www.ui-layouts.com/components/timeline-animation) | Small scroll/viewport animation wrapper. Do not expose it as a layout section; add reduced-motion bypass. |
| Scroll Animation | Candidate | `apps/ui-layout/components/ui/scroll-animation.tsx` | `motion`, React, local `cn` | Arbitrary child content | [scroll-animation](https://www.ui-layouts.com/components/scroll-animation) | General reveal wrapper with repeat options. Add reduced-motion bypass and avoid nested observer churn. |
| Shimmer Loader | Hold | `apps/ui-layout/components/ui/shimmer-loader.tsx` | React | Caller labels/icons; generated cells | [shimmer-loader](https://www.ui-layouts.com/components/shimmer-loader) | Visually novel but RAF-heavy and lacks status/live semantics and reduced motion. Validate empty arrays and duration boundaries. |
| Typewriter | Hold | `apps/ui-layout/components/ui/typing-writter.tsx` | React, `lucide-react` | Text | [type-writer](https://www.ui-layouts.com/components/type-writer) | Current effect omits changing props from dependencies and does not clear scheduled timeouts. Fix lifecycle and accessible final text. |
| Mac Genie | Hold | `apps/ui-layout/registry/components/mac/genie-effect.tsx` | `html-to-image`, React, `react-dom` | Captures caller DOM to an image; inline SVG | [mac-genie](https://www.ui-layouts.com/components/mac-genie) | High-impact and unique, but 1,479 lines with DOM snapshotting. Needs performance, memory, mobile, CSP, and failure-path QA before copying. |

### Controls and overlays — 10

| Component | Status | Source path | Direct dependencies | Inputs or assets | Official demo | Quality notes |
| --- | --- | --- | --- | --- | --- | --- |
| Color Picker | Hold | `apps/ui-layout/components/ui/color-picker.tsx` | `react-colorful`, `sonner`, `lucide-react`, local Button/Input/Label/Popover | Color value | [color-picker](https://www.ui-layouts.com/components/color-picker) | Real control but registry metadata omits its dependency closure. Verify labels, validation, clipboard failure, and keyboard behavior. |
| Accordion | Candidate | `apps/ui-layout/components/ui/accordion.tsx` | `motion`, `lucide-react`, local `cn` | Caller items/children | [accordion](https://www.ui-layouts.com/components/accordion) | Composable single/multiple accordion with `aria-expanded`. Add panel IDs/controls linkage and reduced motion. |
| Range Slider | Candidate | `apps/ui-layout/components/ui/slider.tsx` | `@radix-ui/react-slider`, `@number-flow/react`, `lucide-react`, local `cn` | Numeric range/value | [range-slider](https://www.ui-layouts.com/components/range-slider) | Solid Radix-based interaction with animated numbers. Check labels, value text, forms, RTL, and reduced motion. |
| Tags Input | Hold | `apps/ui-layout/components/ui/tags-input.tsx` | React, local `cn` | String array | [tags-input](https://www.ui-layouts.com/components/tags-input) | Useful behavior, but editing is attached to a clickable `div`, controls lack accessible names, and focus handling needs work. |
| Multi Selector | Hold | `apps/ui-layout/components/ui/multi-selector.tsx` | `lucide-react`, local Button/Popover/Command | Caller option data | [multi-selector](https://www.ui-layouts.com/components/multi-selector) | Good utility component but tightly coupled to website primitives; audit selection announcements and full keyboard behavior. |
| File Upload | Hold | `apps/ui-layout/components/ui/file-upload.tsx` | `react-dropzone`, `sonner`, `lucide-react`, local `cn` | Browser `File` objects | [file-upload](https://www.ui-layouts.com/components/file-upload) | Substantial component with previews, but the 356-line source needs validation, object-URL cleanup, error semantics, and truthful upload-state handling. |
| Responsive Modal | Hold | `apps/ui-layout/components/ui/responsive-modal.tsx` | `motion`, `vaul`, `lucide-react`, `react-dom`, local `cn` | Arbitrary dialog content | [responsive-modal](https://www.ui-layouts.com/components/responsive-modal) | Useful modal/drawer switch. Verify desktop focus trap, return focus, labels, nested dialogs, SSR, and reduced motion. |
| Linear Modal | Hold | `apps/ui-layout/components/ui/linear-modal.tsx` | `motion`, `lucide-react`, `react-dom`, local `cn` | Arbitrary content/steps | [linear-modal](https://www.ui-layouts.com/components/linear-modal) | Distinct spatial modal, but large custom overlay code needs focus-management and portal tests before release. |
| Directional Drawer | Hold | `apps/ui-layout/components/ui/directional-drawer.tsx` | `vaul`, `lucide-react`, local `cn` | Arbitrary drawer content | [directional-drawer](https://www.ui-layouts.com/components/directional-drawer) | Reuse Vaul semantics where possible. Keep direction as a prop, not separate catalog entries; verify labels and return focus. |
| Motion Drawer | Hold | `apps/ui-layout/components/ui/motion-drawer.tsx` | `motion`, `lucide-react`, local `cn` | Arbitrary drawer content | [motion-drawer](https://www.ui-layouts.com/components/motion-drawer) | Visually flexible, but current source lacks dialog semantics/focus trapping and uses untyped drag info. Requires a substantial accessibility repair. |

### Carousels and developer UI — 4

| Component | Status | Source path | Direct dependencies | Inputs or assets | Official demo | Quality notes |
| --- | --- | --- | --- | --- | --- | --- |
| Carousel | Candidate | `apps/ui-layout/components/ui/carousel.tsx` | `embla-carousel`, `embla-carousel-react`, `motion`, React, local `cn`; registry demos also use autoplay/class-names plugins and `lucide-react` | Caller slides/media | [carousel](https://www.ui-layouts.com/components/carousel) | Broad 609-line Embla wrapper with some ARIA. Import the base once; alignment, autoplay, thumbnail, scale, and vertical demos are not components. |
| Code Block | Candidate | `apps/ui-layout/components/ui/code-block.tsx` | `shiki/bundle/web`, local copy button and `cn` | Code string and language | [code-block](https://www.ui-layouts.com/components/code-block) | Useful self-contained developer component. Split server/client work only if the target build proves it necessary; verify copy errors and long-line overflow. |
| Tree Code Viewer | Hold | `apps/ui-layout/components/ui/tree-view-code.tsx` | Local tree parser, client code renderer, copy button, and Shiki transitively | File-tree/code data | [tree-code-viewer](https://www.ui-layouts.com/components/tree-code-viewer) | Good concept, but the registry entry omits transitive local files. Do not import until the complete closure and keyboard tree semantics are mapped. |
| Code Tabs | Hold | `apps/ui-layout/components/ui/code-tabs.tsx` | Local Tabs and copy button, React, local `cn` | Labeled code snippets | [code-tabs](https://www.ui-layouts.com/components/code-tabs) | Reusable developer UI, but coupled to website primitives and missing explicit tab semantics in the component file. Prefer existing accessible tabs in the target. |

## UI Layouts explicit exclusions

| Upstream source or family | Reason |
| --- | --- |
| All 74 `registry:block` entries and `packages/blocks/**` | Heroes, features, about, team, stats, testimonials, pricing, FAQs, footers, and other page sections are outside the component-only scope. |
| Footers, responsive header, grid, masonry, horizontal scroll, sticky hero/scroll, and stacking-card compositions | They establish page/section layout rather than a reusable atomic or behavioral component. |
| 19 button files under `registry/components/button/**` | Predominantly CSS skins, label flips, arrows, gradients, and hover directions. Cosmetic variants are not distinct components; no canonical behavior primitive exists upstream. |
| Product cards, hover cards, stripe cards, Buy Me a Coffee, and gradient-border examples | Hard-coded content/Next Image demos and cosmetic card skins, not strong reusable primitives. `creative-hover-card.tsx` also links to a Cruip tutorial, leaving upstream provenance unclear. |
| Clip-path, image-masking, and video-masking demo files | Mostly fixed media compositions and shape variants with remote Unsplash/Pexels assets; no canonical data-driven mask component to copy. |
| Motion Number demos | `motion-number-upvotes.tsx`, slider, and trading examples are hard-coded feature demos rather than the underlying `@number-flow/react` primitive. Use the dependency directly. |
| Noise Effect | `section-noise.tsx` is a hard-coded marketing section and references an unregistered `/noise.gif`; it is not a reusable effect component. |
| Dialog and Media Modal | The custom dialog source lacks dialog semantics/focus trapping; Media Modal overlaps the stronger responsive/linear modal candidates. Avoid importing a second unsafe overlay implementation. |
| Phone Input | Useful behavior is supplied by `react-phone-number-input`; the wrapper adds a large local shadcn dependency closure but little unique value. Use the dependency directly. |
| Datetime Input | Source comments link to Shadcn Extension and a Perplexity session without a clear upstream license chain. Reject until authorship/provenance is clarified. |
| Password show/hide and strength demos | Small, familiar form compositions and visual variants; not React Bits-level standalone candidates. |
| Flip Countdown and Special Offer | Hard-coded date/content demos. `flipcountdown.tsx` also contains an impossible `absMs < 0` guard and does not expose a target date. |
| Terminal UI | Fixed showcase composition built from Shimmer Loader and Typewriter. Inventory those primitives once instead of counting their composition. |
| Animated Beam, Cobe Globe, and generic Marquee | Overlap canonical Magic UI candidates already inventoried separately. Prefer the clearer upstream source rather than copy a duplicate implementation. |
| `spotlight-card-cruip.tsx` and Cruip-linked card demos | Explicit third-party provenance signal without a carried per-file license; reject. |
| Demo variants | Direction, color, orientation, autoplay, thumbnail, content, and style examples are test fixtures only and never separate Taste Blocks counts. |

### Ambiguous `external` registry files — reject all 21 entries

The manifest points these entries at `.txt` files below `apps/ui-layout/registry/components/external/`. The repository does not identify an original author/license per file, so the repository-level MIT notice is not enough evidence for a strict provenance pipeline.

| Registry entries | External source paths |
| --- | --- |
| Image Ripple Effect | `external/image-ripple-effect/index.txt`, `useDimension.txt`, `useMouse.txt`, `shaders.txt`, `model.txt`, `scene.txt` |
| R3F Blob | `external/r3f-blob.txt` |
| Mesh Shader Gradient | `external/mesh-shader-gradient.txt` |
| Mesh Gradient Background 1–3 | `external/mesh-gradient-background.txt`, `mesh-gradient-background2.txt`, `mesh-gradient-background3.txt` |
| Horizontal Scroll | `external/horizontal-scroll.txt` |
| Stacking Card, CSS Image Stacking, CSS Card Stacking | `external/stacking-card.txt`, `css-image-stacking.txt`, `css-card-stacking.txt` |
| Smooth Scroll | `external/smooth-scroll.txt` |
| Sticky Gallery and Sticky Hero | `external/sticky-gallery.txt`, `sticky-hero-section.txt` |
| Sparkles base and seven compositions | `external/sparkles.txt`, `sparkles-globe.txt`, `sparkles-section.txt`, `sparkles-title.txt`, `sparkles-title2.txt`, `sparkles-title3.txt`, `sparkles-title4.txt`, `sparkles-branding.txt` |

## Eldora UI audited registry — 39 registered UI entries, 0 eligible

Eldora's canonical local manifest is [`apps/www/registry/registry-ui.ts`](https://github.com/karthikmudunuri/eldoraui/blob/2ef4f1eb4f4a6dea6fc2bdd4d87b6a3f2ff65321/apps/www/registry/registry-ui.ts). All rows below fail the same legal gate, regardless of technical merit. Paths are relative to the pinned Eldora repository. Remote demo media is not cleared for redistribution.

| Component | Source path | Direct dependencies | Inputs or assets | Official demo | Technical note |
| --- | --- | --- | --- | --- | --- |
| Safari Browser | `apps/www/registry/eldoraui/safari-browser.tsx` | React | Caller screenshot/media | [demo](https://www.eldoraui.site/docs/components/safari-browser) | Polished SVG mockup; Apple/browser trade dress needs careful presentation. **Blocked by terms.** |
| MacBook Pro | `apps/www/registry/eldoraui/macbook-pro.tsx` | React | Caller image | [demo](https://www.eldoraui.site/docs/components/macbook-pro) | SVG device frame; remote R2/Cloudinary media appears only in demos. **Blocked by terms.** |
| iPhone 17 Pro | `apps/www/registry/eldoraui/iphone-17-pro.tsx` | React | Caller image | [demo](https://www.eldoraui.site/docs/components/iphone-17-pro) | SVG device frame; verify trademark/trade-dress use separately. **Blocked by terms.** |
| iPad | `apps/www/registry/eldoraui/ipad.tsx` | React | Caller image | [demo](https://www.eldoraui.site/docs/components/ipad) | SVG device frame. **Blocked by terms.** |
| Browser | `apps/www/registry/eldoraui/browser.tsx` | React, `lucide-react`, shadcn Button/Badge/Card/Separator/Input | Caller content/media | [demo](https://www.eldoraui.site/docs/components/browser) | Larger browser-shell composite and heavier dependency closure. **Blocked by terms.** |
| Cobe Globe | `apps/www/registry/eldoraui/cobe-globe.tsx` | `cobe`, `react-spring`, React, local utils/Button | Globe config | [demo](https://www.eldoraui.site/docs/components/cobe-globe) | Strong visual but duplicates other Cobe wrappers. **Blocked by terms.** |
| GitHub Inline Comments | `apps/www/registry/eldoraui/github-inline-comments.tsx` | React, `lucide-react`, seven shadcn primitives | Caller comments/data | [demo](https://www.eldoraui.site/docs/components/github-inline-comments) | Application-specific composite; substantial keyboard/state QA required. **Blocked by terms.** |
| Animated Badge | `apps/www/registry/eldoraui/animated-badge.tsx` | `motion`, `lucide-react` | Text, color, optional URL | [demo](https://www.eldoraui.site/docs/components/animated-badge) | Small entrance/pulse component. **Blocked by terms.** |
| Grid | `apps/www/registry/eldoraui/grid.tsx` | React, local `cn` | Children | [demo](https://www.eldoraui.site/docs/components/grid) | Layout primitive and therefore out of scope in addition to the legal block. |
| Clerk OTP | `apps/www/registry/eldoraui/clerk-otp.tsx` | React, `motion`, local `cn` | Display text/timing | [demo](https://www.eldoraui.site/docs/components/clerk-otp) | OTP animation/mockup, not proof of a real secure input flow. **Blocked by terms.** |
| Marquee | `apps/www/registry/eldoraui/marquee.tsx` | Local `cn` and registry CSS keyframes | Repeated children | [demo](https://www.eldoraui.site/docs/components/marquee) | Generic marquee duplicate. **Blocked by terms.** |
| Integrations | `apps/www/registry/eldoraui/integrations.tsx` | React, `motion`, `lucide-react`, local `cn` | Integration/icon data | [demo](https://www.eldoraui.site/docs/components/integrations) | Marketing composite rather than a primitive. **Blocked by terms.** |
| Terminal | `apps/www/registry/eldoraui/terminal.tsx` | React, `lucide-react`, `react-icons/go` | Terminal content | [demo](https://www.eldoraui.site/docs/components/terminal) | Useful shell but overlaps other terminal components. **Blocked by terms.** |
| Testimonial Slider | `apps/www/registry/eldoraui/testimonal-slider.tsx` | React, `@headlessui/react` | Testimonial data and caller image URLs | [demo](https://www.eldoraui.site/docs/components/testimonal-slider) | Content carousel; test semantics/autoplay pause. **Blocked by terms.** |
| Map | `apps/www/registry/eldoraui/map.tsx` | `motion` | Built-in SVG/map marker data | [demo](https://www.eldoraui.site/docs/components/map) | Decorative animated map. **Blocked by terms.** |
| SVG Ripple Effect | `apps/www/registry/eldoraui/svg-ripple-effect.tsx` | `motion`, local `cn` | Caller content/config | [demo](https://www.eldoraui.site/docs/components/svg-ripple-effect) | Lightweight SVG visual. **Blocked by terms.** |
| Animated Frameworks | `apps/www/registry/eldoraui/animated-frameworks.tsx` | React, `motion`, local `cn` | Framework/icon content | [demo](https://www.eldoraui.site/docs/components/animated-frameworks) | Branded integration-card composition. **Blocked by terms.** |
| Blur In Text | `apps/www/registry/eldoraui/blur-in-text.tsx` | React, `motion`, `clsx` | Text | [demo](https://www.eldoraui.site/docs/components/blur-in-text) | Single text reveal family. **Blocked by terms.** |
| Fade Text | `apps/www/registry/eldoraui/fade-text.tsx` | React, `motion`, `clsx` | Text and direction | [demo](https://www.eldoraui.site/docs/components/fade-text) | Directions are props, not separate components. **Blocked by terms.** |
| Gradual Spacing Text | `apps/www/registry/eldoraui/gradual-spacing-text.tsx` | React, `motion`, `clsx` | Text | [demo](https://www.eldoraui.site/docs/components/gradual-spacing-text) | Typography reveal. **Blocked by terms.** |
| Letter Pull Up Text | `apps/www/registry/eldoraui/letter-pull-up-text.tsx` | React, `motion`, `clsx` | Text | [demo](https://www.eldoraui.site/docs/components/letter-pull-up-text) | Character reveal requiring accessible stable text. **Blocked by terms.** |
| Multi Direction Slide Text | `apps/www/registry/eldoraui/multi-direction-slide-text.tsx` | React, `motion`, `clsx` | Text/direction | [demo](https://www.eldoraui.site/docs/components/multi-direction-slide-text) | Directional modes should remain one component. **Blocked by terms.** |
| Separate Away Text | `apps/www/registry/eldoraui/seperate-away-text.tsx` | React, `motion`, `clsx` | Text | [demo](https://www.eldoraui.site/docs/components/seperate-away-text) | Text split effect; upstream spelling retained in path. **Blocked by terms.** |
| Wavy Text | `apps/www/registry/eldoraui/wavy-text.tsx` | React, `motion`, `clsx` | Text | [demo](https://www.eldoraui.site/docs/components/wavy-text) | Continuous text motion needs reduced-motion fallback. **Blocked by terms.** |
| Word Pull Up Text | `apps/www/registry/eldoraui/word-pull-up-text.tsx` | React, `motion`, `clsx` | Text | [demo](https://www.eldoraui.site/docs/components/word-pull-up-text) | Word reveal requiring stable accessible text. **Blocked by terms.** |
| Novatrix Background | `apps/www/registry/eldoraui/novatrix-background.tsx` | React, `ogl` | Shader config | [demo](https://www.eldoraui.site/docs/components/novatrix-background) | High-value WebGL background; needs GPU cleanup and static fallback. **Blocked by terms.** |
| Photon Beam | `apps/www/registry/eldoraui/photon-beam.tsx` | React, `three` | Beam configuration | [demo](https://www.eldoraui.site/docs/components/photon-beam) | High-value Three.js effect; verify renderer disposal. **Blocked by terms.** |
| Hacker Background | `apps/www/registry/eldoraui/hacker-background.tsx` | React | Generated text/grid | [demo](https://www.eldoraui.site/docs/components/hacker-background) | Continuous decorative animation. **Blocked by terms.** |
| Card Flip Hover | `apps/www/registry/eldoraui/card-flip-hover.tsx` | React | Caller card faces/content | [demo](https://www.eldoraui.site/docs/components/card-flip-hover) | Hover interaction needs keyboard/touch equivalent. **Blocked by terms.** |
| Scale Letter Text | `apps/www/registry/eldoraui/scale-letter-text.tsx` | React | Text | [demo](https://www.eldoraui.site/docs/components/scale-letter-text) | Typography effect. **Blocked by terms.** |
| Font Weight Text | `apps/www/registry/eldoraui/font-weight-text.tsx` | React, local `cn` | Text and variable-font settings | [demo](https://www.eldoraui.site/docs/components/font-weight-text) | Requires a compatible variable font supplied by the consumer. **Blocked by terms.** |
| Animated Grid Pattern | `apps/www/registry/eldoraui/animated-grid-pattern.tsx` | React, `three`, React Three Fiber | Generated 3D grid | [demo](https://www.eldoraui.site/docs/components/animated-grid-pattern) | Registry metadata names the old `react-three-fiber` package; dependency audit required. **Blocked by terms.** |
| Live Button | `apps/www/registry/eldoraui/live-button.tsx` | React | Button text/content | [demo](https://www.eldoraui.site/docs/components/live-button) | Small visual button treatment. **Blocked by terms.** |
| Animated Shiny Button | `apps/www/registry/eldoraui/animated-shiny-button.tsx` | React | Button text/content | [demo](https://www.eldoraui.site/docs/components/animated-shiny-button) | Cosmetic button effect and likely cross-library duplicate. **Blocked by terms.** |
| Animated List | `apps/www/registry/eldoraui/animated-list.tsx` | React | Caller list children | [demo](https://www.eldoraui.site/docs/components/animated-list) | General list transition; requires semantic list preservation. **Blocked by terms.** |
| Orbit Rotation | `apps/www/registry/eldoraui/orbit-rotation.tsx` | React, `react-icons`, local `cn`, registry keyframes | Caller icons | [demo](https://www.eldoraui.site/docs/components/orbit-rotation) | Continuous orbit component; static fallback required. **Blocked by terms.** |
| Logo Timeline | `apps/www/registry/eldoraui/logo-timeline.tsx` | React, `motion`, local `cn`, registry keyframes | Caller logos | [demo](https://www.eldoraui.site/docs/components/logo-timeline) | Logo-motion component; trademark assets belong to callers. **Blocked by terms.** |
| Dock Text | `apps/www/registry/eldoraui/dock-text.tsx` | React, `motion` | Text items | [demo](https://www.eldoraui.site/docs/components/dock-text) | Hover magnification requires focus/touch parity. **Blocked by terms.** |
| Holographic Card | `apps/www/registry/eldoraui/holographic-card.tsx` | React, `motion` | Caller children/card content | [demo](https://www.eldoraui.site/docs/components/holographic-card) | Strong pointer-reactive surface; needs reduced motion and keyboard state. **Blocked by terms.** |

Unregistered Eldora source files such as `animated-shiny-text.tsx`, `aurora-text.tsx`, `blur-fade.tsx`, `line-shadow-text.tsx`, `text-animate.tsx`, `text-shimmer.tsx`, and `tweet-card.tsx` are excluded because they are absent from the pinned canonical registry. Eldora blocks and its portfolio template are excluded by scope before any licensing analysis.

## Import gates for the UI Layouts shortlist

1. Copy only from the pinned commit and exact source path; record both in provenance metadata.
2. Preserve the UI LAYOUT MIT copyright and permission notice.
3. Recalculate the complete package/local-file dependency closure from imports; do not trust generated registry metadata alone.
4. Reject any file whose authorship points to another tutorial/library until that original license and notice chain is verified.
5. Replace remote or hard-coded demo media with owned fixtures and keep trademarks out of default content.
6. Collapse variants into props or demos; never count direction, color, orientation, autoplay, or content examples separately.
7. Test TypeScript/build, hydration, keyboard, focus return, mobile/touch, forced colors, reduced motion, cleanup of timers/RAF/listeners/WebGL, and console output.
8. Keep Pro code, authenticated responses, blocks, sections, templates, and builder output outside the Taste Blocks Free source pool.
