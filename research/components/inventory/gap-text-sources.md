# Gap source research: text and typography motion

Research date: 2026-07-20
Scope: additional permissively licensed open-source React component sources not already counted in `shortlist.md`. This is source research only; no code was imported.

## Decision

| Result | Additive text families |
| --- | ---: |
| Import now | **0** |
| Conditional repair | **4** |
| Replacement-only / duplicate evidence | **0** |
| **Globally plausible addition** | **4** |

If all four conditional families survive import and visual QA, the projected Text and typography motion pool would move from **27 to 31**, leaving **39** against the target of 70. This is not a verified manifest count. A family counts only after provenance, license, build, preview, semantic-text, responsive, reduced-motion, touch/keyboard, cleanup, and visual gates pass.

The four plausible additions are:

1. Fontuccine tangent-stretch typography engine.
2. DriftType pointer-physics text.
3. Slot Text state-label roll.
4. Controlled split-flap text transition.

Trigger choices, renderer tiers, directions, colors, timing, character sets, sizes, and demo presets are modes of those four engines, not extra components.

## Research and counting boundary

- A root license file at the pinned revision was required. A package `license` field or README sentence without the actual notice was not accepted as sufficient redistribution evidence.
- Only a reusable React component with caller-controlled text and behavior could qualify. Vanilla engines, fixed demos, SVG-path utilities, helpers, sections, page layouts, boards, templates, and documentation UI were excluded.
- Typewriter, scramble/decrypt, shimmer/shine, marquee, glitch, generic reveal presets, perpetual decoration, and alternate counters/tickers were excluded at source-search time.
- The existing global winners remain authoritative: NumberFlow for numeric transitions and Motion Primitives for phrase morphing. A technically stronger alternate implementation can be replacement evidence, but it adds zero to the global count.
- Source-code MIT coverage does not clear fonts, sounds, remote media, trademarks, or demo content. No third-party asset below should be copied without its own license record.

## Import-now / accepted sources

None. Each additive family below has at least one unresolved release gate; source quality or an MIT notice alone is not enough to enter the staging importer.

## Conditional repair candidates

### 1. Fontuccine — tangent-stretch typography engine

| Field | Evidence |
| --- | --- |
| Repository / revision | [charbelmalo/fontuccine](https://github.com/charbelmalo/fontuccine), commit [`1261bd116c7915a617ed21c85adab10bba6ca1a7`](https://github.com/charbelmalo/fontuccine/tree/1261bd116c7915a617ed21c85adab10bba6ca1a7), 2026-07-18 |
| Exact React source | [`src/react/index.ts`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/src/react/index.ts), exporting `Fontuccine` and `useFontuccine` |
| Required source closure | The React entry calls [`src/engine/attach.ts`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/src/engine/attach.ts). A source copy must preserve the imported runtime closure under `src/engine`, `src/core`, `src/font`, `src/interaction`, `src/dom`, `src/vf`, `src/svg`, `src/webgl`, and `src/worker`; copying only the React entry is not viable. |
| Package / dependencies | [`fontuccine@0.1.0`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/package.json); `opentype.js ^1.3.4`; React and React DOM `>=18` peers. Browser tiers use SVG, Canvas/WebGL2, workers, `ResizeObserver`, and `IntersectionObserver`. |
| License / notice | [MIT](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/LICENSE), `Copyright (c) 2026 Fontuccine contributors`. Preserve the complete notice and pinned-source provenance. |
| Assets | SVG/WebGL outline tiers require a consumer-provided `fontUrl`, `fontBuffer`, or parsed font. Do not copy a demo font; record the chosen font's separate redistribution rights. |

**Why it is distinct:** Fontuccine remaps glyph outlines along their tangents instead of uniformly scaling text or merely interpolating CSS/font axes. It can use a native variable-font width axis as a fallback, but SVG and WebGL tiers can stretch ordinary outline fonts. This is materially different from Fancy's selected generalized CSS proximity engine and variable-font hover component.

**Upstream quality:** real DOM text remains available for selection, search, SEO, and assistive technology; overlay render layers are `aria-hidden` in [`src/dom/overlay.ts`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/src/dom/overlay.ts). Reduced motion is enabled by default through `respectReducedMotion ?? true` and pins the engine to rest; see [`src/interaction/reduced-motion.ts`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/src/interaction/reduced-motion.ts). The shared [`ticker`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/src/interaction/ticker.ts) sleeps at rest, and [`gating.ts`](https://github.com/charbelmalo/fontuccine/blob/1261bd116c7915a617ed21c85adab10bba6ca1a7/src/interaction/gating.ts) removes offscreen instances from the active loop.

**Conditional gates:** this is a new `0.1.0` and a large multi-tier engine, so verify all tier fall-through paths, SSR/hydration, cleanup, long/wrapped text, resize, hidden-document behavior, and browser/GPU support. Pointer/hover configurations need focus or an intentional static keyboard/touch/no-hover result. Prefer the maintained package unless Taste Blocks is prepared to vendor the complete source closure. Count the engine once; scroll velocity, pointer proximity, hover, custom drive, axis choices, post-effects, and three render tiers are not separate entries.

### 2. DriftType PointerText — pointer-physics text

| Field | Evidence |
| --- | --- |
| Repository / revision | [kaiyiwong/drifttype](https://github.com/kaiyiwong/drifttype), commit [`984ac7eef482585c234baef8ebfbd5b9eb7f4e73`](https://github.com/kaiyiwong/drifttype/tree/984ac7eef482585c234baef8ebfbd5b9eb7f4e73), 2026-04-01 |
| Exact component source | [`src/react/PointerText.tsx`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/src/react/PointerText.tsx) |
| Required source closure | [`src/core/pointer.ts`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/src/core/pointer.ts), [`src/core/types.ts`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/src/core/types.ts), [`src/renderers/svg.ts`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/src/renderers/svg.ts), and [`src/a11y/semantic.ts`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/src/a11y/semantic.ts) |
| Package / dependencies | [`drifttype@0.1.1`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/package.json); no runtime package dependencies; React `>=18` peer. Uses DOM, SVG, Canvas text measurement, Pointer Events, and `requestAnimationFrame`. |
| License / notice | [MIT](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/LICENSE), `Copyright (c) 2026 Kaiyi Wong`. Preserve the complete notice and provenance. |
| Assets | None bundled or required. The caller supplies a CSS font string. |

**Why it is distinct:** each glyph has a base position and spring state; pointer forces physically repel, attract, or orbit glyphs and they settle back at rest. Fancy Text Cursor Proximity maps a distance scalar to CSS values and cannot reproduce this directional displacement/orbit contract. `repel`, `attract`, and `orbit` remain one engine.

**Upstream quality and gaps:** the loop stops after the pointer leaves and all glyphs settle, so it is not perpetual. Visual SVG glyphs are hidden from assistive technology and a hidden semantic node is added. However, the semantic helper emits a generic hidden `span` with both text and `role="img"`/`aria-label`, rather than preserving the caller's heading or paragraph semantics. There is no reduced-motion branch, explicit offscreen/document-hidden gate, coarse-pointer fallback, or keyboard path. The component also hardcodes an `800 × 120` viewBox.

**Conditional gates:** add static reduced-motion and no-hover/coarse-pointer behavior; preserve a caller-selected semantic element and expose one phrase only; make the viewBox/height responsive; pause or settle on document hide/offscreen; verify touch dragging, focus behavior, long text, font loading, cleanup, and clipping. Reject if those repairs become a redesign.

The sibling [`PathText`](https://github.com/kaiyiwong/drifttype/blob/984ac7eef482585c234baef8ebfbd5b9eb7f4e73/src/react/PathText.tsx) adds **zero** because Fancy Text Along Path is already selected.

### 3. Slot Text — state-label roll

| Field | Evidence |
| --- | --- |
| Repository / revision | [Danilaa1/slot-text](https://github.com/Danilaa1/slot-text), commit [`b49434a6b6fc079d919b722062f17d3e498c63a1`](https://github.com/Danilaa1/slot-text/tree/b49434a6b6fc079d919b722062f17d3e498c63a1), 2026-07-09 |
| Exact React source | [`src/react.ts`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/src/react.ts) |
| Required source closure | [`src/slotText.ts`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/src/slotText.ts), [`src/dom.ts`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/src/dom.ts), [`src/text.ts`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/src/text.ts), [`src/timing.ts`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/src/timing.ts), [`src/constants.ts`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/src/constants.ts), and [`style.css`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/style.css) |
| Package / dependencies | [`slot-text@0.3.3`](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/package.json); zero runtime dependencies; React adapter peer `>=18 <20`. Other framework peers are optional adapters, not React runtime requirements. |
| License / notice | [MIT](https://github.com/Danilaa1/slot-text/blob/b49434a6b6fc079d919b722062f17d3e498c63a1/LICENSE), `Copyright (c) 2026 Daniel Belyi`. Preserve the complete notice and provenance. |
| Assets | None. |

**Why it is distinct:** this is a prop-driven, per-grapheme transition for compact changing labels. It handles unchanged glyphs, changing widths, interruption, latest-target queueing, and temporary spam-safe `flash`/revert state. That state-transition contract is narrower and more operational than an entrance-only Text Roll, a whole-label hover swap, or the canonical phrase morph. `flash`, direction, bounce, color, and timing remain capabilities of one component.

**Upstream quality and gaps:** it uses `Intl.Segmenter` with a Unicode-code-point fallback, clears its timers, and falls back to plain text if the CSS layout is unavailable. It has no reduced-motion check. The React adapter applies `aria-label` to a generic `span` while animated old/new faces remain in the accessibility tree; support for naming a generic span is unreliable and duplicate/intermediate glyphs may be exposed.

**Conditional gates:** snap directly to the final text under reduced motion; render one semantic text copy and hide all visual faces; do not make it a live region by default; verify button-label use, rapid prop churn, Unicode/graphemes, wrapping constraints, font loading, unmount cleanup, and server rendering. Count the low-level controller and React adapter together as one component, not two.

### 4. splitflap — controlled mechanical text transition

| Field | Evidence |
| --- | --- |
| Repository / revision | [codemanshan/splitflap](https://github.com/codemanshan/splitflap), commit [`535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213`](https://github.com/codemanshan/splitflap/tree/535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213), 2026-04-22 |
| Exact source | [`registry/split-flap/split-flap-display.tsx`](https://github.com/codemanshan/splitflap/blob/535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213/registry/split-flap/split-flap-display.tsx), [`split-flap-slat.tsx`](https://github.com/codemanshan/splitflap/blob/535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213/registry/split-flap/split-flap-slat.tsx), and [`split-flap.css`](https://github.com/codemanshan/splitflap/blob/535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213/registry/split-flap/split-flap.css) |
| Package / dependencies | [`splitflap@0.1.0`](https://github.com/codemanshan/splitflap/blob/535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213/package.json); zero runtime dependencies; React and React DOM `>=18` peers. |
| License / notice | [MIT](https://github.com/codemanshan/splitflap/blob/535cb5b9cac0c8324a8cff4e6e8ec7eca16d1213/LICENSE), `Copyright (c) 2026 Cody Shanley`. Preserve the full notice and the attribution comment already present in all three source files. |
| Assets | No bundled font, sound, image, or video. The CSS defaults to system UI and exposes a font variable. |

**Why it is distinct:** a slat advances deterministically through a fixed mechanical alphabet and performs a two-half 3D flap. This is not Fancy Letter 3D Swap, which turns the same glyph box on hover, and not Slot Text, which directly rolls old and new graphemes. Count the slat/display family once; sizes, no-card styling, alphabet, timing, and stagger are variants.

**Upstream quality and gaps:** visual slats are `aria-hidden`; the wrapper supplies one hidden phrase inside `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`. Both JavaScript and CSS snap to the target under `prefers-reduced-motion`. Timer cleanup exists. The shipped display nevertheless defaults `autoRotate` to `true`, optionally seeds a random starting word, and can keep cycling indefinitely. It supports only uppercase A–Z, digits, period, and space, and the live region changes when the target is selected rather than after every slat settles.

**Conditional gates:** change autoplay to off by default; exclude random initial words and unattended cycling from the Taste Blocks contract; advance only through the existing `refreshSignal`/an explicit user action, or add a direct controlled value only if that remains a narrow adaptation; make live announcements opt-in and meaningful; verify the settled semantic value, rapid updates, unsupported characters, responsive sizing, hidden-document behavior, and cleanup. The deterministic intermediate alphabet traversal is intrinsic to the mechanism; random/decrypt/scramble presentations are not allowed.

## Dedupe ledger

| Researched behavior | Existing collision | Decision |
| --- | --- | --- |
| Fontuccine hover/proximity or native `wdth` tier | Fancy Text Cursor Proximity and Variable Font Hover | Do not count those trigger/tier configurations separately. Count one only for Fontuccine's tangent-aware outline-deformation engine if the full engine passes QA. |
| DriftType PathText | Fancy Text Along Path | Reject, **0** additive. |
| DriftType repel/attract/orbit | Fancy Text Cursor Proximity | One new pointer-physics family; its three force modes are variants. |
| Slot Text direction, chromatic color, `flash`, controller | Motion Text Roll, Motion Text Morph, Animata Swap Text | One new state-label family only; helpers and modes are not counts. |
| Controlled split-flap sizes/styles/alphabet | Fancy Letter 3D Swap and Slot Text | One mechanical-display family only. Autoplay/random cycling is excluded, not another mode to publish. |
| Griffo MorphText / Resentence / Animate UI Morphing | Motion Primitives Text Morph | Reject as additive candidates, **0**. |
| Griffo Motion SplitText / Animate UI Splitting | Motion Primitives Text Effect and Animata Text Animator | Replacement evidence at most, **0** additive. Core split helpers never count. |
| Mantine, ashtom, akira/chiakich, and robonyong split-flap implementations | Selected `codemanshan/splitflap` source candidate | Alternate implementations of the same family, **0** additive. |

## Rejected and replacement-only sources

### Strong source, zero additive count

- **Griffo** — [commit `79689ab086a4628eb449b54b721e9872b5e98ab1`](https://github.com/dimicx/griffo/tree/79689ab086a4628eb449b54b721e9872b5e98ab1), [MIT](https://github.com/dimicx/griffo/blob/79689ab086a4628eb449b54b721e9872b5e98ab1/LICENSE), `Copyright (c) 2025` (the notice names no person). [`src/motion/SplitText.tsx`](https://github.com/dimicx/griffo/blob/79689ab086a4628eb449b54b721e9872b5e98ab1/src/motion/SplitText.tsx) and [`src/morph/MorphText.tsx`](https://github.com/dimicx/griffo/blob/79689ab086a4628eb449b54b721e9872b5e98ab1/src/morph/MorphText.tsx) are well-structured, tested, semantic, and reduced-motion aware. `griffo@1.1.1` has optional React `>=18` and Motion `>=11` peers. `MorphText` directly collides with the canonical Motion Primitives Text Morph; animated splitting collides with the existing generic split/reveal family; [`src/core/splitText.ts`](https://github.com/dimicx/griffo/blob/79689ab086a4628eb449b54b721e9872b5e98ab1/src/core/splitText.ts) is a helper. Griffo is credible replacement evidence, not a gap-closing count.

### Duplicate, banned, or dependency-heavy React pools

- **Animate UI** — [commit `efeb96ffd7a3b7a4868667e4ac3c346620fb3044`](https://github.com/imskyleen/animate-ui/tree/efeb96ffd7a3b7a4868667e4ac3c346620fb3044), [MIT](https://github.com/imskyleen/animate-ui/blob/efeb96ffd7a3b7a4868667e4ac3c346620fb3044/LICENSE.md), `Copyright (c) 2025 Elliot Sutton`. The exact text pool is [`apps/www/registry/primitives/texts`](https://github.com/imskyleen/animate-ui/tree/efeb96ffd7a3b7a4868667e4ac3c346620fb3044/apps/www/registry/primitives/texts). Counting number, sliding/scrolling number, morphing, rotating, rolling, splitting, highlight, and gradient are existing families or styling variants; typing and shimmering are explicitly excluded. **0**.

- **Mantine Text Animate** — [commit `c29172a7f0aa4364bcdb8454dd6c073b02396cd6`](https://github.com/gfazioli/mantine-text-animate/tree/c29172a7f0aa4364bcdb8454dd6c073b02396cd6), [MIT](https://github.com/gfazioli/mantine-text-animate/blob/c29172a7f0aa4364bcdb8454dd6c073b02396cd6/LICENSE), `Copyright (c) 2024 Giovambattista Fazioli`. [`SplitFlap.tsx`](https://github.com/gfazioli/mantine-text-animate/blob/c29172a7f0aa4364bcdb8454dd6c073b02396cd6/package/src/SplitFlap/SplitFlap.tsx), [`use-split-flap.ts`](https://github.com/gfazioli/mantine-text-animate/blob/c29172a7f0aa4364bcdb8454dd6c073b02396cd6/package/src/SplitFlap/use-split-flap.ts), and CSS have reduced-motion handling, but visual old/new/flap faces are all exposed beneath one `aria-live` container. The package requires Mantine Core/Hooks `>=9` plus React/DOM 18 or 19. It is a heavier duplicate of the chosen split-flap source. The remaining effects are banned or already selected families. **0**.

- **Resentence** — [commit `fb9453b49c912862ebe277f6cf9065f983fa0b6c`](https://github.com/dphilipson/resentence/tree/fb9453b49c912862ebe277f6cf9065f983fa0b6c), [MIT](https://github.com/dphilipson/resentence/blob/fb9453b49c912862ebe277f6cf9065f983fa0b6c/LICENSE), `Copyright (c) 2019 David Philipson`. [`packages/resentence/src/index.tsx`](https://github.com/dphilipson/resentence/blob/fb9453b49c912862ebe277f6cf9065f983fa0b6c/packages/resentence/src/index.tsx) performs character-level Levenshtein morphing with `react-spring ^8.0.18` and `prop-types ^15.6.2`; peers begin at React 16.8. It has no reduced-motion path and directly collides with Text Morph. **0**.

- **UI FX Kit** — [commit `7d40d1da2329af30fb4a280c543ec8a7146600af`](https://github.com/pptt3300/ui-fx-kit/tree/7d40d1da2329af30fb4a280c543ec8a7146600af), [MIT](https://github.com/pptt3300/ui-fx-kit/blob/7d40d1da2329af30fb4a280c543ec8a7146600af/LICENSE), `Copyright (c) 2026 Patricia Zhang`. The exact text sources are under [`effects`](https://github.com/pptt3300/ui-fx-kit/tree/7d40d1da2329af30fb4a280c543ec8a7146600af/effects): Text Pressure duplicates Fancy's selected proximity/variable-font family; counter and morph duplicate winners; typewriter, scramble, and glitch are banned; Circular, Particle, and ASCII text run decorative canvas/loop or pointer-only effects without the required static semantic/reduced-motion/mobile paths. Package-level CLI/MCP dependencies are `@modelcontextprotocol/sdk` and `zod`; effect files also rely on local hooks/presets. **0**.

### Split-flap alternates

- **akira02/chiakich react-split-flap** — [commit `67a840427ff983c5abeb5b9f3049743e1badc609`](https://github.com/akira02/react-split-flap/tree/67a840427ff983c5abeb5b9f3049743e1badc609), source [`src/SplitFlap.tsx`](https://github.com/akira02/react-split-flap/blob/67a840427ff983c5abeb5b9f3049743e1badc609/src/SplitFlap.tsx). The implementation has reduced-motion CSS and a coherent `role="img"` label, and the package manifest says MIT, but the pinned repository contains no LICENSE/COPYING file or copyright notice. That fails the strict redistribution-evidence gate. React/DOM `>=16.8` peers; otherwise no runtime dependency. **0** pending an authoritative license notice.

- **ashtom/react-split-flap-display** — [commit `8161156707e212b5cbf0271470733703995e4c45`](https://github.com/ashtom/react-split-flap-display/tree/8161156707e212b5cbf0271470733703995e4c45), [MIT](https://github.com/ashtom/react-split-flap-display/blob/8161156707e212b5cbf0271470733703995e4c45/LICENSE), `Copyright (c) 2026 Thomas Dohmke`. [`src/SplitFlapDisplay.tsx`](https://github.com/ashtom/react-split-flap-display/blob/8161156707e212b5cbf0271470733703995e4c45/src/SplitFlapDisplay.tsx) plus Canvas and WebGL renderers is structured and tested, with one accessible `role="img"` label and React/DOM 18/19 peers. It has no reduced-motion implementation and is a large multi-row/multi-renderer board package for a family already represented by a three-file source. Renderer modes do not add counts. **0**.

- **robonyong/react-split-flap-display** — [commit `2b0daba04ab1b41d1347edc5f77d451a809ffd0a`](https://github.com/robonyong/react-split-flap-display/tree/2b0daba04ab1b41d1347edc5f77d451a809ffd0a), [MIT](https://github.com/robonyong/react-split-flap-display/blob/2b0daba04ab1b41d1347edc5f77d451a809ffd0a/LICENSE), `Copyright (c) 2020 Robin Yang`. The source begins at [`src/SplitFlapDisplay/index.tsx`](https://github.com/robonyong/react-split-flap-display/blob/2b0daba04ab1b41d1347edc5f77d451a809ffd0a/src/SplitFlapDisplay/index.tsx), imports `howler ^2.2.4`, and includes `src/assets/flip.mp3`. It lacks reduced-motion and coherent semantic output, and its peer range stops at React 18. The bundled recording needs separate asset provenance. Duplicate family, **0**.

### Not reusable React text components

- **svg-text-animate** — [commit `f86302f69cde05673a682cf179794c126f4099ca`](https://github.com/oubenruing/svg-text-animate/tree/f86302f69cde05673a682cf179794c126f4099ca), [MIT](https://github.com/oubenruing/svg-text-animate/blob/f86302f69cde05673a682cf179794c126f4099ca/LICENSE), `Copyright (c) 2019 CHEN RUI`; `opentype.js ^1.3.4`. It is a vanilla TypeScript SVG-text engine, not a React component. **0**.

- **svg-text-animation** — [commit `a2ec54527ea9093fc8718a315b957108478b92b2`](https://github.com/origami-z/svg-text-animation/tree/a2ec54527ea9093fc8718a315b957108478b92b2), [MIT](https://github.com/origami-z/svg-text-animation/blob/a2ec54527ea9093fc8718a315b957108478b92b2/LICENSE), `Copyright (c) 2019 Zhihao Cui`. [`src/text-svg.tsx`](https://github.com/origami-z/svg-text-animation/blob/a2ec54527ea9093fc8718a315b957108478b92b2/src/text-svg.tsx) is a fixed Create React App example, not a reusable package component, and carries React 16/Ant Design 3-era app dependencies. **0**.

- **react-svg-reveal** — [commit `a528a98ce8df984c3f5bb65424f977d2300cacf3`](https://github.com/TommyRiquet/react-svg-reveal/tree/a528a98ce8df984c3f5bb65424f977d2300cacf3), [MIT](https://github.com/TommyRiquet/react-svg-reveal/blob/a528a98ce8df984c3f5bb65424f977d2300cacf3/LICENSE), `Copyright (c) 2023 Tommy Riquet`. [`src/components/SVGReveal.tsx`](https://github.com/TommyRiquet/react-svg-reveal/blob/a528a98ce8df984c3f5bb65424f977d2300cacf3/src/components/SVGReveal.tsx) draws arbitrary SVG paths rather than semantic text, has no reduced-motion or text alternative, and imports `framer-motion` even though the package does not declare it as a runtime dependency/peer. **0**.

- **motion-components** — [commit `7c90da2ea0c9f106f2bb353a180c4def9fc6a36c`](https://github.com/tgomilar/motion-components/tree/7c90da2ea0c9f106f2bb353a180c4def9fc6a36c), [MIT](https://github.com/tgomilar/motion-components/blob/7c90da2ea0c9f106f2bb353a180c4def9fc6a36c/LICENSE), `Copyright (c) 2026 Tanja Gomilar`. It ships Lit custom elements with `lit ^3.2.0` and `motion ^11.11.0`, not React components. A React wrapper would be a new adapter, outside minimal source adaptation. **0**.

## Import evidence checklist

For any of the four conditional families that advances:

1. Re-fetch the exact commit and compare the source before copying.
2. Copy the complete referenced runtime closure, not a demo or orphan entry file.
3. Record repository, commit, original paths, upstream version, modifications, and the full MIT notice in provenance/third-party notices.
4. Do not copy demo fonts, sounds, remote media, or identity content.
5. Apply only the narrow repairs listed above; reject the candidate if it needs a new API or visual redesign.
6. Re-run global behavior dedupe after adaptation. A repaired alternate implementation still does not become an additional component.
7. Count only after build, preview, semantic phrase, reduced motion, responsive layout, keyboard/touch/no-hover, hidden/offscreen pause, cleanup, and visual QA pass.
