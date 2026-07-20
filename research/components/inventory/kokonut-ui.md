# Kokonut UI component inventory

## Decision

**Eligible source, conditional import.** Kokonut UI's public repository is MIT-licensed and can be copied, modified, redistributed, sublicensed, and used commercially. Taste Blocks must retain the Kokonut UI copyright and full MIT permission notice in distributed copies or substantial portions. This inventory finds **40 distinct component candidates** after excluding sections, page layouts, templates, site infrastructure, trivial button variants, and one broken registry entry.

This is a source audit, not an approval to publish every candidate unchanged. The code still needs dependency repair, asset replacement, accessibility work, visual QA, and deduplication against the rest of Taste Blocks.

## Pinned source

- Repository: [kokonut-labs/kokonutui](https://github.com/kokonut-labs/kokonutui)
- Audited branch: `main`
- Audited commit: [`4aba04e5e1c3e1c7de966554aacbe0cd6a31c77e`](https://github.com/kokonut-labs/kokonutui/tree/4aba04e5e1c3e1c7de966554aacbe0cd6a31c77e)
- Commit date: `2026-07-09T12:44:55+09:00`
- Release/tag: none; pin the commit, not a floating branch
- Root license: [MIT](https://github.com/kokonut-labs/kokonutui/blob/4aba04e5e1c3e1c7de966554aacbe0cd6a31c77e/LICENSE), copyright `2025 kokonutUI`
- License confirmation: the root `README.md` also states MIT
- Official registry definition: [`registry/registry-components.ts`](https://github.com/kokonut-labs/kokonutui/blob/4aba04e5e1c3e1c7de966554aacbe0cd6a31c77e/registry/registry-components.ts)
- Official installation docs: [kokonutui.com/docs](https://kokonutui.com/docs)

Repository reality at the pinned commit:

- `46` actual files under `components/kokonutui/*.tsx`
- `46` matching MDX demos under `content/docs/**`
- `47` entries in `registry/registry-components.ts`; `morph-card` points to a file that does not exist
- committed `registry.json` contains only `40` items and is stale relative to the TypeScript registry
- `registry/registry-blocks.ts` is empty

The website's “100+” claim includes material outside this auditable free component set. Do not use that marketing number as an import count.

## Dependency baseline

All candidates are React/TypeScript components and assume Tailwind CSS v4. The pinned app uses React `^19.2.7`, Next.js `^16.2.10`, Tailwind CSS `^4.3.0`, Motion `^12.23.25`, Lucide React `^0.556.0`, `class-variance-authority` `^0.7.1`, `clsx` `^2.1.1`, and `next-themes` `^0.4.4`.

Table notation:

- `M` = npm package `motion`, imported from `motion/react`
- `L` = `lucide-react`
- `CVA` = `class-variance-authority`
- `NI` = `next/image`; `NL` = `next/link`; `NT` = `next-themes`
- `cn` = `@/lib/utils`
- `ui:x` = `@/components/ui/x`
- `hook:x` = `@/hooks/x`
- `icon:x` = `@/components/icons/x`

The `ui:*` dependencies are shadcn/Radix infrastructure and must be sourced and noticed independently; they are not additional Kokonut candidate counts.

## 40 component candidates

Every source path and demo path below is relative to the pinned repository root.

### AI, input, upload, and feedback — 10

| Candidate | Exact source path | External and local dependencies | Demo | Import gate |
| --- | --- | --- | --- | --- |
| Action Search Bar | `components/kokonutui/action-search-bar.tsx` | L, M; `ui:input`, `hook:use-debounce` | `content/docs/navigation/action-search-bar.mdx` | Keep the command/search behavior; verify keyboard order and shortcut handling. |
| AI Input Search | `components/kokonutui/ai-input-search.tsx` | L, M; `ui:textarea`, `hook:use-auto-resize-textarea`, cn | `content/docs/ai/ai-input-search.mdx` | Registry metadata omits L; repair before publishing. |
| AI Loading State | `components/kokonutui/ai-loading.tsx` | React only in source | `content/docs/ai/ai-loading.mdx` | Registry incorrectly declares M. Expose sequence/progress instead of shipping the hard-coded task demo. |
| AI Prompt Selector | `components/kokonutui/ai-prompt.tsx` | L, M; `ui:button`, `ui:dropdown-menu`, `ui:textarea`, `hook:use-auto-resize-textarea`, cn, `icon:anthropic`, `icon:anthropic-dark` | `content/docs/ai/ai-prompt.mdx` | Replace branded model defaults or separately review trademark use; wire consumer callbacks. |
| AI Text Loading | `components/kokonutui/ai-text-loading.tsx` | M; cn | `content/docs/ai/ai-text-loading.mdx` | Add reduced-motion behavior and configurable copy. |
| AI Voice | `components/kokonutui/ai-voice.tsx` | L; cn | `content/docs/ai/ai-voice.mdx` | Registry incorrectly declares M. Presentational demo needs controlled state and accessible recording status. |
| Avatar Picker | `components/kokonutui/avatar-picker.tsx` | L, M; `ui:button`, `ui:card`, `ui:input`, cn | `content/docs/inputs/avatar-picker.mdx` | Inline avatar SVGs are code assets; regenerate collision-safe SVG IDs and test labels/focus. |
| File Upload | `components/kokonutui/file-upload.tsx` | L, M; cn | `content/docs/inputs/file-upload.mdx` | Verify drag/drop, keyboard upload, file validation, object-URL cleanup, and reduced motion. |
| Team Selector | `components/kokonutui/team-selector.tsx` | L, M, NI | `content/docs/inputs/team-selector.mdx` | Default avatars call DiceBear remotely; replace with local neutral demo assets. |
| Loader | `components/kokonutui/loader.tsx` | M; cn | `content/docs/inputs/loader.mdx` | Keep as one configurable loader, not multiple size/color entries; add reduced motion and status semantics. |

### Buttons and compact actions — 7

| Candidate | Exact source path | External and local dependencies | Demo | Import gate |
| --- | --- | --- | --- | --- |
| Attract Button | `components/kokonutui/attract-button.tsx` | L, M; `ui:button`, cn | `content/docs/buttons/attract-button.mdx` | Preserve the magnetic interaction; add keyboard/touch fallback and reduced motion. |
| Gradient Button | `components/kokonutui/gradient-button.tsx` | `ui:button`, cn | `content/docs/buttons/gradient-button.mdx` | Count the component once; its color variants are props, not separate entries. |
| Hold Button | `components/kokonutui/hold-button.tsx` | CVA, L, M; `ui:button`, cn | `content/docs/buttons/hold-button.mdx` | Registry omits CVA. Confirm keyboard/assistive-tech hold semantics before release. |
| Particle Button | `components/kokonutui/particle-button.tsx` | L, M; `ui:button`, cn | `content/docs/buttons/particle-button.mdx` | Add reduced-motion path; particles remain one component regardless of particle settings. |
| Slide Text Action | `components/kokonutui/slide-text-button.tsx` | M, NL; cn | `content/docs/buttons/slide-text-button.mdx` | Source renders a link while registry unnecessarily declares `button`; normalize semantic API. |
| Social Share Action | `components/kokonutui/social-button.tsx` | L, M; `ui:button`, cn | `content/docs/buttons/social-button.mdx` | Hover-only disclosure needs focus/touch parity and real share callbacks. |
| Theme Switch Button | `components/kokonutui/switch-button.tsx` | L, NT; `ui:button`, cn | `content/docs/buttons/switch-button.mdx` | Requires a `next-themes` provider; expose checked state and accessible name. |

### Cards and data displays — 7

| Candidate | Exact source path | External and local dependencies | Demo | Import gate |
| --- | --- | --- | --- | --- |
| Activity Rings Card | `components/kokonutui/apple-activity-card.tsx` | M; cn | `content/docs/cards/apple-activity-card.mdx` | Replace hard-coded activity data with props; avoid Apple branding in Taste Blocks naming. |
| Flip Card | `components/kokonutui/card-flip.tsx` | L; cn | `content/docs/cards/card-flip.mdx` | Make flip state operable by keyboard and preserve front/back reading order. |
| Card Stack | `components/kokonutui/card-stack.tsx` | M, NI; cn | `content/docs/cards/card-stack.mdx` | Replace hard-coded products, three Unsplash URLs, and `public/undraw.svg`; keep stack interaction only. |
| Currency Transfer | `components/kokonutui/currency-transfer.tsx` | L, M; `ui:card`, `ui:tooltip`, cn | `content/docs/cards/currency-transfer.mdx` | Parameterize currencies and callbacks; demo data must not imply a functioning transfer. |
| Liquid Glass Card | `components/kokonutui/liquid-glass-card.tsx` | CVA, L, NI; `ui:button`, `ui:card`, cn | `content/docs/cards/liquid-glass-card.mdx` | Registry omits CVA. Replace remote portrait; test SVG/backdrop filters and provide visual fallback. |
| Mouse Effect Card | `components/kokonutui/mouse-effect-card.tsx` | M; `ui:button`, `ui:card`, cn | `content/docs/cards/mouse-effect-card.mdx` | Keep one configurable card; add touch/focus equivalent and reduced motion. |
| Social Post Card | `components/kokonutui/tweet-card.tsx` | L, NL; cn | `content/docs/cards/tweet-card.mdx` | Replace X/Twitter names, links, and remote profile photos with neutral demo data. |

### Navigation and controls — 5

| Candidate | Exact source path | External and local dependencies | Demo | Import gate |
| --- | --- | --- | --- | --- |
| Morphic Navigation | `components/kokonutui/morphic-navbar.tsx` | `clsx`, NL | `content/docs/navigation/morphic-navbar.mdx` | Source uses `href="#"` and local state instead of route state; make hrefs real and controlled. |
| Profile Dropdown | `components/kokonutui/profile-dropdown.tsx` | L, NI, NL; `ui:dropdown-menu`, cn, `icon:gemini` | `content/docs/navigation/profile-dropdown.mdx` | Replace remote portrait and branded Gemini icon; make actions consumer-owned. |
| Smooth Drawer | `components/kokonutui/smooth-drawer.tsx` | L, M, NI, NL; `ui:button`, `ui:drawer` | `content/docs/navigation/smooth-drawer.mdx` | Remove `public/logo.svg`, Kokonut Pro link, and demo copy; retain drawer motion and primitives. |
| Smooth Tabs | `components/kokonutui/smooth-tab.tsx` | L, M; cn | `content/docs/navigation/smooth-tab.mdx` | Verify roving focus, ARIA tab relationships, and reduced motion. |
| Floating Toolbar | `components/kokonutui/toolbar.tsx` | L, M; cn | `content/docs/navigation/toolbar.mdx` | Keep one configurable toolbar; add tooltips/labels, focus behavior, and reduced motion. |

### Text motion — 8

| Candidate | Exact source path | Dependencies | Demo | Import gate |
| --- | --- | --- | --- | --- |
| Dynamic Text | `components/kokonutui/dynamic-text.tsx` | M | `content/docs/texts/dynamic-text.mdx` | Preserve text width/readability and announce changes only when semantically needed. |
| Glitch Text | `components/kokonutui/glitch-text.tsx` | M; cn | `content/docs/texts/glitch-text.mdx` | Add reduced-motion/static fallback; keep the accessible text single and selectable. |
| Matrix Text | `components/kokonutui/matrix-text.tsx` | M; cn | `content/docs/texts/matrix-text.mdx` | Uses animation frames; stop offscreen and under reduced motion. |
| Scroll Text | `components/kokonutui/scroll-text.tsx` | M; cn | `content/docs/texts/scroll-text.mdx` | Confirm observer cleanup, replay behavior, and static reduced-motion rendering. |
| Shimmer Text | `components/kokonutui/shimmer-text.tsx` | M; cn | `content/docs/texts/shimmer-text.mdx` | One effect only; font-size/color variations remain props. |
| Sliced Text | `components/kokonutui/sliced-text.tsx` | M; cn | `content/docs/texts/sliced-text.mdx` | Hover effect needs focus parity and reduced-motion fallback. |
| Swoosh Text | `components/kokonutui/swoosh-text.tsx` | M; cn | `content/docs/texts/swoosh-text.mdx` | Hover effect needs focus/touch parity; avoid retaining the Nike-inspired name. |
| Typewriter Text | `components/kokonutui/type-writer.tsx` | M | `content/docs/texts/type-writer.mdx` | Add static reduced-motion mode and avoid repeatedly announcing partial text. |

### Background and canvas effects — 3

| Candidate | Exact source path | Dependencies | Demo | Import gate |
| --- | --- | --- | --- | --- |
| Animated Paths | `components/kokonutui/background-paths.tsx` | M | `content/docs/backgrounds/background-paths.mdx` | Extract the SVG effect; do not copy the `min-h-screen` hero wrapper or hard-coded heading. |
| Beams Canvas | `components/kokonutui/beams-background.tsx` | M; cn | `content/docs/backgrounds/beams-background.mdx` | Extract the canvas layer; remove full-screen heading, pause offscreen, cap DPR, and honor reduced motion. |
| Flow Field Canvas | `components/kokonutui/flow-field.tsx` | M; cn | `content/docs/backgrounds/flow-field.mdx` | Keep configurable canvas/children API; remove default marketing content, pause offscreen, cap DPR, and honor reduced motion. |

## Rejected component paths

These do not count toward the 40 candidates.

| Rejected path | Reason |
| --- | --- |
| `components/kokonutui/bento-grid.tsx` | A 740-line composed marketing grid/layout with multiple feature presentations and brand icons, not an atomic component. |
| `components/kokonutui/carousel-cards.tsx` | Default export renders two hard-coded content sections and fourteen remote Unsplash image references; it is a page section, not a reusable carousel primitive. |
| `components/kokonutui/command-button.tsx` | A conventional shadcn button with a command icon and hover sweep; too trivial to count as a distinct Taste Blocks component. |
| `components/kokonutui/shape-hero.tsx` | Complete hero section with headline, paragraph, full-screen layout, shapes, and `next/font/google`. Layout work belongs to the later layout phase. |
| `components/kokonutui/spotlight-cards.tsx` | Complete feature-grid section with eyebrow, heading, default marketing copy, and six-card layout. The internal card is not exported as a standalone source component. |
| `components/kokonutui/v0-button.tsx` | Kokonut documentation utility tied to Vercel environment variables and the v0 registry endpoint; site-specific and visually trivial. |
| `components/kokonutui/morph-card.tsx` | Listed in `registry/registry-components.ts`, but no source file or MDX demo exists at the pinned commit. Invalid candidate. |

Also exclude these repository areas wholesale:

- `components/landing/**` — Kokonut's own landing-page sections
- `components/layout/footer.tsx` — site layout
- `components/mdx/**`, `components/open-in-v0-button.tsx`, `components/button-cta.tsx` — documentation/site infrastructure
- `components/ui/**` — generic shadcn primitives; use upstream primitives and do not count them as Kokonut originals
- `content/docs/templates/**` — links to Kokonut UI Pro templates, not MIT implementation files in this repository
- `app/**` — showcase application and routes, not distributable component candidates

## Assets and trademark boundary

The root MIT license is sufficient for the repository's code but must not be treated as proof that every remote image, third-party logo, hosted API result, or trademark can be republished under MIT.

| Candidate | Asset or mark found in source | Required treatment |
| --- | --- | --- |
| AI Prompt Selector | Anthropic component icons plus inline OpenAI/Gemini-style brand vectors | Replace with neutral icons by default; do not imply affiliation. |
| Avatar Picker | Four inline avatar SVG illustrations | May be adapted with the source notice, but fix duplicate/collision-prone IDs. |
| Card Stack | `public/undraw.svg` and three Unsplash URLs | Replace all demo art. The SVG identifies unDraw/Katerina Limpitsouni and has its own provenance. |
| Liquid Glass Card | Vercel Blob portrait URL | Replace; no independent license is recorded in the component. |
| Profile Dropdown | Vercel Blob portrait and Gemini icon | Replace both. |
| Smooth Drawer | `public/logo.svg` and `https://kokonutui.pro/#pricing` | Remove Kokonut branding and commercial link. |
| Team Selector | `https://api.dicebear.com/9.x/notionists-neutral/...` | Replace with bundled neutral placeholders or separately document DiceBear style/API terms. |
| Social Post Card | X/Twitter framing and two `pbs.twimg.com` profile images | Replace names, marks, URLs, and photos. |

Inline generic SVGs and generated canvas drawings in the remaining candidates are part of the audited source code, but their code-level MIT notice must still be retained.

## Registry defects to repair during import

Do not blindly replay the upstream registry metadata:

- `morph-card` references a missing file.
- `ai-input-search` imports `lucide-react`, but the registry entry omits it.
- `ai-loading` and `ai-voice` declare `motion`, but their current source does not import it.
- `hold-button` and `liquid-glass-card` import `class-variance-authority`, but their registry entries omit it.
- `slide-text-button` declares the shadcn `button` registry dependency but renders `next/link` and does not import the button primitive.
- Many files import `@/lib/utils`, while the upstream docs require users to install `utils` separately instead of declaring it per item.
- `registry.json` is stale and omits seven entries present in the TypeScript registry.

Build Taste Blocks metadata from actual imports at the pinned source commit, then validate every generated install artifact.

## Redistribution obligations and boundaries

1. Include the complete Kokonut UI MIT copyright and permission notice with copied or substantially derived code. A consolidated `THIRD_PARTY_NOTICES.md` plus bundled license text is appropriate; retaining each existing source header is also useful.
2. Record the exact commit, original path, author, and our modifications per imported component.
3. Do not copy or expose Kokonut UI Pro templates/components. A link from the free repository does not make external Pro code MIT.
4. Do not claim Kokonut's name, logos, or third-party brand marks as Taste Blocks assets. Rename Apple-, Nike-, X-, Anthropic-, Gemini-, and similar branded demos where necessary.
5. Replace remote sample photos and API-generated avatars unless their separate license and redistribution terms are explicitly recorded.
6. Keep dependency licenses separate. Relevant dependencies are permissive, but shadcn/Radix, Motion, Lucide, CVA, Next.js, React, Tailwind, `clsx`, `next-themes`, and `vaul` remain third-party software with their own notices and versions.
7. Do not count props, themes, colors, sizes, or demo-data changes as new components.
8. Do not publish a candidate until TypeScript/build, responsive preview, keyboard operation, focus visibility, reduced motion, cleanup, and asset checks pass.

MIT permits commercial use and redistribution, including inside a competing catalog, as long as its notice condition is met. This audit is engineering due diligence, not legal advice.

## Import recommendation

Import in small source-pinned batches, starting with the self-contained effects and text motion, then buttons, controls, and data components. Preserve only the component behavior and necessary helpers; omit Kokonut's landing copy, full-screen wrappers, remote demo assets, and site-specific links. Reject rather than rewrite any source that stops being recognizably derived from the audited component—the Pro phase is where original Taste Blocks components belong.
