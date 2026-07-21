# Branding

Use these rules when creating landing pages, portfolios, and normal websites. Follow supplied brand assets and explicit user direction first. When the brief intentionally requests a normally discouraged treatment, execute it well unless it breaks accessibility, legality, or truthfulness.

Branding is a system of recognizable decisions. It is not a palette, a logo repeated everywhere, or a fashionable effect layer.

## Contents

1. [Establish direction](#1-establish-direction)
2. [System and tokens](#2-system-and-tokens)
3. [Color](#3-color)
4. [Typography](#4-typography)
5. [Font files and delivery](#5-font-files-and-delivery)
6. [Logo and marks](#6-logo-and-marks)
7. [Grid, rhythm, shape, and depth](#7-grid-rhythm-shape-and-depth)
8. [Photography and imagery](#8-photography-and-imagery)
9. [Illustration, icons, texture, and data](#9-illustration-icons-texture-and-data)
10. [Voice and content](#10-voice-and-content)
11. [Brand motion](#11-brand-motion)
12. [Portfolio and reference-site handling](#12-portfolio-and-reference-site-handling)
13. [Final gate](#13-final-gate)
14. [Font audit clarifications](#font-audit-clarifications)

## 1. Establish direction

- **BRD-001 [REQUIRE]** Inspect existing assets, product, audience, category, content, and user direction before selecting colors, type, imagery, or motion.
- **BRD-002 [REQUIRE]** State the audience, category, promise, proof, desired perception, and competitive alternative when the evidence exists.
- **BRD-003 [REQUIRE]** Define three to five specific traits with boundaries: `precise, not sterile`; `playful, not childish`.
- **BRD-004 [AVOID]** Do not accept clean, modern, premium, bold, innovative, friendly, or minimal as complete direction. Translate each into visible behavior.
- **BRD-005 [REQUIRE]** Map every trait to typography, color, composition, imagery, shape, motion, and voice.
- **BRD-006 [REQUIRE]** Choose one recognizable signature device and one deliberate restraint.
- **BRD-007 [PREFER]** Derive the signature from the product, history, place, people, culture, process, mark, typography, or material.
- **BRD-008 [AVOID]** Do not begin from an Awwwards mood board, a named trend, or a default SaaS aesthetic.
- **BRD-009 [REQUIRE]** Define identity invariants and controlled degrees of freedom. Not every page should be identical; not every page should invent a new system.
- **BRD-010 [REQUIRE]** Test the direction on a hero, dense content, form, case study or proof area, mobile viewport, and error state.
- **BRD-011 [AVOID]** A direction that only works in the hero is campaign decoration, not a usable brand system.
- **BRD-012 [PREFER]** Preserve familiar interaction patterns. Express brand through selected visual and verbal decisions rather than making ordinary controls unfamiliar.
- **BRD-013 [CONTEXT]** If brand context is missing, use a restrained provisional system, state assumptions, and leave honest placeholders. Do not fabricate a brand story.

## 2. System and tokens

- **BRD-014 [REQUIRE]** Separate primitive values, semantic roles, and component tokens.
- **BRD-015 [REQUIRE]** Components consume semantic roles such as `text.primary`, `surface.canvas`, and `action.primary`, not arbitrary raw colors.
- **BRD-016 [REQUIRE]** Name public tokens by purpose, not current appearance.
- **BRD-017 [PREFER]** Create component-specific tokens only when a shared semantic role cannot express a real requirement.
- **BRD-018 [AVOID]** Do not create unused shades, spacing values, type roles, or themes for completeness.
- **BRD-019 [REQUIRE]** Document why each font, color role, image behavior, signature device, and motion rule exists.
- **BRD-020 [REQUIRE]** Keep productive UI and expressive brand surfaces distinct. Forms, navigation, pricing controls, legal copy, and task flows stay predictable.
- **BRD-021 [REQUIRE]** Version intentional token changes and prevent silent raw-value drift.
- **BRD-022 [PREFER]** Store normative values separately from explanatory prose so both code and AI can consume the system clearly.

## 3. Color

- **CLR-001 [REQUIRE]** Establish readable neutral surfaces and text before adding brand color.
- **CLR-002 [REQUIRE]** Give every chromatic family a job: brand/action, supporting expression, rare accent, or semantic status.
- **CLR-003 [REQUIRE]** Define paired foreground roles for every colored surface. White is not automatically readable on a brand color.
- **CLR-004 [REQUIRE]** Define default, hover, pressed, selected, focus, disabled, success, warning, danger, and information states where relevant.
- **CLR-005 [REQUIRE]** Keep semantic status colors distinct from the brand accent when meaning would otherwise become ambiguous.
- **CLR-006 [REQUIRE]** Never communicate state, error, selection, chart identity, or interactivity through color alone.
- **CLR-007 [REQUIRE]** Meet WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text, and 3:1 essential UI boundaries, states, and graphics.
- **CLR-008 [REQUIRE]** Test the actual rendered foreground/background pair, including alpha, gradients, images, overlays, and interaction states.
- **CLR-009 [PREFER]** Use color sparingly enough that the highest chroma still signals priority or identity.
- **CLR-010 [AVOID]** Do not distribute equal saturation across every section, card, or feature.
- **CLR-011 [CONTEXT]** Treat 60–30–10 as an optional relative-area heuristic, never a quota.
- **CLR-012 [CONTEXT]** Neutrals may dominate the real page; restrained products may behave closer to 85–10–5 or 90–8–2.
- **CLR-013 [AVOID]** Do not force 60–30–10 onto semantic states, data visualization, monochrome identities, image-led sites, or accessibility modes.
- **CLR-014 [PREFER]** Build ramps in OKLCH when it improves perceptual control, then verify contrast and gamut separately.
- **CLR-015 [AVOID]** Equal OKLCH lightness is not proof of equal WCAG contrast.
- **CLR-016 [REQUIRE]** Supply tested sRGB fallbacks when using wide-gamut color.
- **CLR-017 [PREFER]** Reduce chroma before clipping channels when mapping out-of-gamut colors.
- **CLR-018 [REQUIRE]** Art-direct light and dark themes separately. Preserve semantic roles; do not invert the light palette mechanically.
- **CLR-019 [REQUIRE]** Respect `prefers-color-scheme`, browser `color-scheme`, and forced-colors behavior when themes exist.
- **CLR-020 [PREFER]** Use opaque semantic tokens for text, icons, borders, and states; transparency is fragile across surfaces.
- **CLR-021 [AVOID]** No default blue-black canvas, violet-to-cyan gradient, neon glow, and purple CTA unless the brief earns that identity.
- **CLR-022 [AVOID]** Do not default to beige/orange “taste,” black/gold “luxury,” or desaturated editorial palettes without brand evidence.
- **CLR-023 [AVOID]** No rainbow feature-card palette or unrelated accent cycling.
- **CLR-024 [AVOID]** Do not use decorative gradients to fill empty space. A gradient must express light, material, data, hierarchy, or a brand motif.
- **CLR-025 [REQUIRE]** Be able to explain the palette in one sentence: what it expresses and which jobs each hue performs.
- **CLR-026 [TEST]** Review the page in grayscale. If hierarchy collapses, color is hiding structural weakness.
- **CLR-027 [TEST]** Squint or blur the composition. One intended focal region should remain dominant.

## 4. Typography

- **TYP-001 [REQUIRE]** Choose type by role, language, metrics, license, performance, and brand fit—not novelty alone.
- **TYP-002 [REQUIRE]** Select the body/UI face using real production copy before selecting a display face.
- **TYP-003 [PREFER]** Use one workhorse family plus at most one justified display companion in most sites.
- **TYP-004 [CONTEXT]** A third family requires a distinct semantic role such as code or aligned data.
- **TYP-005 [PREFER]** Use one family or superfamily when its weights, widths, italics, and optical sizes provide enough contrast.
- **TYP-006 [REQUIRE]** Give every family one named job.
- **TYP-007 [REQUIRE]** Pair through deliberate contrast in serif construction, width, stroke, texture, history, or rhythm.
- **TYP-008 [AVOID]** Do not pair fonts merely because a generator or trend list recommends them.
- **TYP-009 [AVOID]** Do not create font soup with display serif, grotesk, mono, and handwritten faces used decoratively.
- **TYP-010 [REQUIRE]** Test uppercase, lowercase, punctuation, numerals, currency, dates, diacritics, long German words, bold, italic, and all supported languages.
- **TYP-011 [REQUIRE]** Build semantic heading structure before assigning visual sizes.
- **TYP-012 [AVOID]** Do not use heading tags to obtain default browser styling.
- **TYP-013 [PREFER]** Use a compact role-based type scale. A modular ratio is optional, not law.
- **TYP-014 [REQUIRE]** Define size, line-height, weight, and tracking together as a type role.
- **TYP-015 [REQUIRE]** Keep the same semantic role visually consistent across pages and neighboring sections.
- **TYP-016 [PREFER]** Start long-form measure near `65ch`; inspect roughly 50–75 characters and remain below 80 for ordinary prose.
- **TYP-017 [CONTEXT]** CJK and other scripts may require a shorter measure and different spacing logic.
- **TYP-018 [PREFER]** Start body line-height near `1.45–1.6` unitless, then tune for the actual face, size, measure, and script.
- **TYP-019 [PREFER]** Use start alignment for running text. Center only short intentionally composed statements.
- **TYP-020 [AVOID]** Do not justify ordinary web paragraphs.
- **TYP-021 [PREFER]** Trust the font's body kerning and tracking. Tune display, uppercase, or special label roles only after inspection.
- **TYP-022 [AVOID]** No blanket negative tracking on all headings or positive tracking on all body copy.
- **TYP-023 [REQUIRE]** Keep `font-optical-sizing: auto` when the selected variable font supports optical size.
- **TYP-024 [REQUIRE]** Use real weights, italics, and small caps; avoid synthetic styles in brand-critical text.
- **TYP-025 [CONTEXT]** Use tabular numerals only for columns, timers, prices, scores, and comparable metrics.
- **TYP-026 [REQUIRE]** Preserve browser root size, zoom, text resize, user spacing, wrapping, and reflow.
- **TYP-027 [AVOID]** Do not protect typography with fixed-height text containers, clipping, or arbitrary truncation.
- **TYP-028 [AVOID]** Do not force decorative desktop line breaks onto mobile.
- **TYP-029 [CONTEXT]** Common fonts are allowed when they are right. Inter, Roboto, Poppins, Montserrat, Open Sans, DM Sans, Manrope, Space Grotesk, Satoshi, Playfair Display, Cormorant, Raleway, Bebas Neue, and Anton require an explicit brand reason rather than autopilot.
- **TYP-030 [CONTEXT]** Fraunces, Instrument Serif, and Bricolage are increasingly familiar; distinctiveness cannot depend on the family name alone.
- **TYP-031 [PREFER]** Investigate legally open directions such as Newsreader, Literata, Eczar, Gentium, Recursive, Anybody, Trispace, Unbounded, Atkinson Hyperlegible Next, FiraGO, or Anek when their characteristics fit.
- **TYP-032 [AVOID]** Do not choose an unusual font solely because AI uses it less often.

## 5. Font files and delivery

- **FNT-001 [REQUIRE]** Verify the exact font binary, upstream source, license, copyright, and intended medium before shipping it.
- **FNT-002 [PREFER]** Prefer exact upstream OFL binaries for fonts redistributed with the project.
- **FNT-003 [REQUIRE]** Preserve license files, copyright notices, Reserved Font Names, version, and modification history.
- **FNT-004 [AVOID]** Reject trial, demo, personal-use, OS-extracted, unattributed, or repository-without-license font files.
- **FNT-005 [CONTEXT]** Google Fonts licenses vary by family. Fontsource is packaging, not a replacement license.
- **FNT-006 [CONTEXT]** Adobe Fonts is a service license, not permission to copy, redistribute, or self-host font files.
- **FNT-007 [CONTEXT]** Fontshare includes both OFL and proprietary families; inspect the exact family terms.
- **FNT-008 [REQUIRE]** Treat subsetting, conversion, glyph editing, and rebuilding as modification and check Reserved Font Names.
- **FNT-009 [PREFER]** Ship WOFF2 for modern web targets.
- **FNT-010 [REQUIRE]** Load only used families, weights, italics, scripts, and variable axes.
- **FNT-011 [CONTEXT]** Use a variable font only when it replaces several styles the site actually uses.
- **FNT-012 [REQUIRE]** Declare real axis ranges and prefer semantic CSS properties over raw `font-variation-settings`.
- **FNT-013 [PREFER]** Preload at most a measured critical face and include `crossorigin`.
- **FNT-014 [PREFER]** Use `font-display: swap` for required faces with metric-matched fallbacks and `optional` for nonessential display faces.
- **FNT-015 [AVOID]** Avoid `font-display: block` for body, navigation, controls, and ordinary headings.
- **FNT-016 [REQUIRE]** Match fallback x-height, width, ascent, descent, and line gap closely enough to prevent harmful wrapping and layout shift.

## 6. Logo and marks

- **LOG-001 [REQUIRE]** Use supplied official assets and their documented variants.
- **LOG-002 [REQUIRE]** Preserve proportions, clear space, minimum size, contrast, and valid final lockups.
- **LOG-003 [AVOID]** Do not redraw, stretch, rotate, crop, recolor, distort, animate, or embellish a client mark without authorization.
- **LOG-004 [PREFER]** Choose an approved inverse or monochrome variant instead of placing a random badge, pill, glow, or outline behind the logo.
- **LOG-005 [AVOID]** Do not scatter the logo throughout the interface. Recognition should come from the entire system.
- **LOG-006 [REQUIRE]** Keep logos, product icons, UI icons, and pictograms conceptually separate.
- **LOG-007 [AVOID]** Never use a generic icon-library glyph as a company mark.
- **LOG-008 [CONTEXT]** If no logo exists and logo design was not requested, use a restrained text rendering and record the missing final asset.
- **LOG-009 [REQUIRE]** Test marks at favicon, navigation, mobile, monochrome, dark-background, and high-contrast sizes when those uses exist.
- **LOG-010 [LEGAL]** Open-source code does not grant rights to trademarks, mascots, logos, or trade dress.

## 7. Grid, rhythm, shape, and depth

- **CMP-001 [REQUIRE]** Define recurring page edges, text measures, image anchors, section gaps, and control heights.
- **CMP-002 [REQUIRE]** Use a documented spacing scale and responsive grid.
- **CMP-003 [CONTEXT]** Break the grid only when the break improves hierarchy or expresses the brand premise.
- **CMP-004 [REQUIRE]** Align related content to shared anchors.
- **CMP-005 [PREFER]** Use optical alignment when mathematical centering looks wrong.
- **CMP-006 [AVOID]** Random absolute positioning is not art direction.
- **CMP-007 [AVOID]** Do not apply identical oversized padding or centered composition to every section.
- **CMP-008 [REQUIRE]** Define a small family of corner radii, line weights, silhouettes, masks, and directional motifs.
- **CMP-009 [AVOID]** Do not turn every container, control, tag, image, and section into the same pill.
- **CMP-010 [REQUIRE]** Use shadows for elevation or separation, not generic polish.
- **CMP-011 [PREFER]** Use border, surface tone, or space when they communicate structure more clearly than shadow.
- **CMP-012 [AVOID]** Do not use excessive empty space only to imitate luxury.

## 8. Photography and imagery

- **IMG-001 [REQUIRE]** Define subject, behavior, viewpoint, camera distance, lighting, depth, temperature, environment, props, crop, negative space, treatment, and rejected clichés.
- **IMG-002 [REQUIRE]** Give every visual one job: identify, explain, prove, demonstrate, orient, or establish tone.
- **IMG-003 [PREFER]** Place proof imagery beside the claim it supports.
- **IMG-004 [PREFER]** Use credible candid behavior over staged handshakes, fake meetings, laptop pointing, and anonymous smiling teams.
- **IMG-005 [CONTEXT]** Stock photography is acceptable when selected and art-directed as one coherent set.
- **IMG-006 [REQUIRE]** Define one stable image behavior and at most one controlled exception.
- **IMG-007 [AVOID]** Do not randomly mix documentary photography, glossy AI renders, vintage scans, flat illustration, grain, blur, duotone, and 3D distortion.
- **IMG-008 [REQUIRE]** Plan responsive crops around faces, products, gestures, and intentional negative space.
- **IMG-009 [REQUIRE]** Put text over imagery only when every supported crop preserves reliable contrast.
- **IMG-010 [AVOID]** Do not use a heavy gradient patch to rescue uncontrolled text-over-image art direction.
- **IMG-011 [AVOID]** Do not place decorative tags, pills, or labels over photos without a real content or brand function.
- **IMG-012 [REQUIRE]** Inspect AI-generated imagery for anatomy, product errors, embedded text, stereotypes, and inconsistent visual language.
- **IMG-013 [AVOID]** Do not use an image that contradicts the product, claim, place, or audience.
- **IMG-014 [REMOVE]** If a visual adds no information, proof, emotion, or identity needed by the composition, remove it.

## 9. Illustration, icons, texture, and data

- **ILL-001 [REQUIRE]** Define one illustration grammar: abstraction, perspective, geometry, stroke, corners, palette, shading, texture, and density.
- **ILL-002 [REQUIRE]** Match illustration fidelity to its job; supporting graphics must communicate quickly.
- **ILL-003 [AVOID]** Do not use illustration merely to fill empty space.
- **ILL-004 [AVOID]** Do not mix outline, clay 3D, isometric, flat vector, and hand-drawn systems without a governing concept.
- **ILL-005 [AVOID]** No default floating orb, abstract blob, pseudo-dashboard, or generic mascot scene.
- **ICO-001 [REQUIRE]** Use one coherent UI icon family per interface.
- **ICO-002 [REQUIRE]** Keep canvas, optical size, stroke, joins, corners, fill behavior, and metaphor consistent.
- **ICO-003 [PREFER]** Add visible labels when an icon's meaning is not immediately obvious.
- **ICO-004 [AVOID]** Icons are not default decoration for every heading, button, or card.
- **ICO-005 [REQUIRE]** Hide decorative icons from assistive technology and name meaningful icon-only controls.
- **TEX-001 [REQUIRE]** Texture must express a material, production process, historical reference, or emotional quality.
- **TEX-002 [AVOID]** No universal noise, film dust, paper grain, chrome blob, frosted glass, or scan treatment without a brand reason.
- **TEX-003 [PREFER]** Apply a signature device at memorable moments; constant repetition turns identity into wallpaper.
- **DAT-001 [REQUIRE]** Choose data visualization from the question and intended takeaway.
- **DAT-002 [REQUIRE]** Preserve scales, baselines, order, units, proportional area, timeframe, and source.
- **DAT-003 [AVOID]** No decorative gradients, pseudo-3D, progress bars, or animation that distort meaning.
- **DAT-004 [REQUIRE]** Provide color-independent labels, symbols, patterns, or a table alternative.
- **DAT-005 [REMOVE]** Use a sentence, number, or table when it communicates better than a chart.

## 10. Voice and content

- **VOC-001 [REQUIRE]** Define voice traits, opposites, preferred syntax, vocabulary, and prohibited habits.
- **VOC-002 [REQUIRE]** Keep voice stable while tone adapts to onboarding, celebration, errors, legal content, and failure recovery.
- **VOC-003 [REQUIRE]** Make verbal and visual character agree.
- **VOC-004 [PREFER]** Use concrete claims and nearby proof.
- **VOC-005 [AVOID]** Avoid interchangeable phrases such as unlock, reimagine, seamless, next-generation, redefine, and built for the future without specific meaning.
- **VOC-006 [AVOID]** No decorative eyebrows, vague manifesto fragments, fake quotations, random studio labels, or filler copy added to occupy space.
- **VOC-007 [AVOID]** Do not invent brand history, customers, awards, testimonials, metrics, product capabilities, or cultural claims.
- **VOC-008 [REQUIRE]** Preserve terminology across navigation, headings, CTAs, forms, and documentation.
- **VOC-009 [PREFER]** Define one repeatable sentence behavior or verbal construction only when it naturally fits the brand.
- **VOC-010 [AVOID]** Do not place text merely because the composition has an empty area.

## 11. Brand motion

- **MOTB-001 [REQUIRE]** Define two or three motion principles with observable behavior.
- **MOTB-002 [REQUIRE]** Separate fast functional motion from rare expressive brand motion.
- **MOTB-003 [REQUIRE]** Define one primary signature behavior and at most one support behavior.
- **MOTB-004 [PREFER]** Derive signature motion from the mark, grid, typography, crop, shape, illustration, or product behavior.
- **MOTB-005 [TEST]** Hide the logo and name. If the motion fits any SaaS site unchanged, it is not a brand asset.
- **MOTB-006 [REQUIRE]** Use a small coherent duration and easing family rather than component-specific random values.
- **MOTB-007 [PREFER]** Keep functional motion around immediate, fast, standard, and slow tiers; scale duration with distance and visual mass.
- **MOTB-008 [PREFER]** Make exits shorter than entrances and repeated actions quieter than occasional transitions.
- **MOTB-009 [AVOID]** Do not apply expressive motion to every card, heading, section, button, and route.
- **MOTB-010 [REQUIRE]** A logo animation must resolve to a valid static lockup and must not replay on every route.
- **MOTB-011 [REQUIRE]** Preserve DOM reading order when type is animated.
- **MOTB-012 [AVOID]** Keep body copy static; avoid generic character-by-character heading reveals.
- **MOTB-013 [REQUIRE]** Design reduced motion: remove large translation, parallax, zoom, rotation, bounce, and loops while preserving content and state.
- **MOTB-014 [REQUIRE]** Follow the main animation rules for accessibility, pausing, performance, cleanup, and input responsiveness.
- **MOTB-015 [AVOID]** No generic fade-up on every section, random spring families, cursor halos, decorative 3D tilt, full-screen waiting wipes, or scrolljacking as brand identity.
- **MOTB-016 [REMOVE]** If removing an animation improves comprehension or speed without weakening identity, remove it.

## 12. Portfolio and reference-site handling

- **PRT-001 [REQUIRE]** Keep portfolio chrome recognizable but quieter than the work being showcased.
- **PRT-002 [AVOID]** Do not recolor, filter, crop, or animate every project into one fashionable studio treatment.
- **PRT-003 [REQUIRE]** Let projects retain their own identity while shared typography, spacing, navigation, and voice identify the portfolio owner.
- **PRT-004 [PREFER]** Use cultural, material, product, or process specificity rather than copying award-site styling.
- **PRT-005 [LEGAL]** Abstract principles from references; never copy their layout, artwork, photography, copy, mark, paid font, or recognizable trade dress.
- **PRT-006 [AVOID]** Award status is not proof of usability or accessibility.
- **PRT-007 [AVOID]** Reject JavaScript-only basic content, hover-only information, long intros, custom cursors that obscure meaning, autoplay competition, and desktop spectacle that fails on mobile.

## 13. Final gate

Before implementation, be able to answer:

1. Who is this for, what is promised, and what proves it?
2. Which three traits and opposites govern the direction?
3. What is the one signature device and one restraint?
4. Which type roles and real font files are used, and are they licensed?
5. Which semantic color roles exist, and do actual pairs pass contrast?
6. What grid, measure, spacing rhythm, density, and shape family govern composition?
7. What photography or illustration grammar governs asset selection?
8. Which icon family is used and when are icons omitted?
9. What voice behavior and prohibited clichés apply?
10. What motion principles and reduced-motion behavior apply?
11. Does the system survive dense content, forms, mobile, dark mode, errors, localization, zoom, and absent imagery?

If the answer is missing, do not fill the gap with trend defaults. Use a restrained provisional choice, state the assumption, or leave a clean placeholder.

## Font audit clarifications

- **FNT-AUD-001 [REQUIRE]** Before bundling any font, verify the exact binary, version, upstream source, and license. A catalogue or package host is not itself a universal license.
- **FNT-AUD-002 [REQUIRE]** When a modified, subsetted, converted, or rebuilt OFL font has Reserved Font Names, rename the derivative unless the license or copyright holder explicitly permits retaining them. Ship the applicable copyright and license text with redistributed font files.
- **FNT-AUD-003 [PREFER]** Treat WOFF2-only delivery, long-lived caching, avoiding inline binaries, restrained preloading, and non-blocking `font-display` values as modern-web defaults. Change them when measured project constraints justify an exception; do not turn performance guidance into unsupported absolutes.
- **FNT-AUD-004 [CONTEXT]** Labels such as common, fashionable, or overused are time-sensitive taste observations. Never blacklist a family by name: require a defensible fit to the brand, content, language coverage, metrics, and production constraints.
