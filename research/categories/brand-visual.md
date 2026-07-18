# Brand and visual-foundation taxonomy for a professional website design skill

## Purpose and scope

This report defines the categories a design skill needs in order to reason about the visual identity of portfolios, multi-page websites, and landing pages. It is a taxonomy, not a house style. It can describe restrained or expressive work, editorial or product-led work, flat or dimensional work, light or dark themes, and any appropriate cultural or market context.

The central recommendation is to keep four kinds of decision separate:

1. **Primitives** are raw reusable values or assets: a color ramp, font family, spacing step, radius, stroke width, shadow, image crop, or animation duration.
2. **Semantic roles** state why a value exists: primary text, raised surface, critical status, section gap, display heading, focus indicator, or categorical data series.
3. **Art-direction choices** describe the intended visual world: photographic viewpoint, illustration abstraction, icon character, composition energy, material treatment, and motion personality.
4. **Validation** determines whether the system works: brand fit, accessibility, responsive behavior, content resilience, consistency, production fidelity, performance, and rights.

Brand inputs precede all four. They explain what the work must communicate and constrain, but they are not themselves visual tokens. This separation matters: the W3C Design Tokens Community Group defines tokens as named values and supports aliases between raw and role-based values; its format also explicitly treats groups such as “Brand,” “Alert,” and “Layout” as arbitrary organization rather than a reliable statement of type or purpose ([DTCG Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/)).

## 1. Brand inputs: the evidence the visual system must express

### 1.1 Organization and offer

- Brand, product, person, or initiative name; naming hierarchy; endorsed or sub-brand relationships.
- Offer, category, market, business model, price position, and maturity.
- Website objective: introduce, explain, convert, sell, recruit, publish, document, or establish credibility.
- Primary conversion and supporting conversions.
- Proof available: work samples, outcomes, clients, testimonials, credentials, research, press, product evidence, or community signals.
- Differentiators, table stakes, claims that require qualification, and topics the brand should not claim.

### 1.2 Audience and context

- Primary, secondary, and excluded audiences; audience knowledge, motivation, anxiety, and accessibility needs.
- Decision context: exploratory versus high-intent, individual versus committee, quick scan versus considered reading.
- Audience language, locale, culture, reading direction, device mix, bandwidth, and expected environment.
- Desired perception and trust posture: for example established/emerging, specialist/generalist, premium/accessible, technical/human, reserved/energetic. These are descriptive axes, not default preferences.

### 1.3 Brand strategy and verbal identity

- Purpose, positioning, promise, values, personality attributes, and brand principles.
- Voice and tone, message hierarchy, vocabulary, prohibited phrases, capitalization, numerals, and naming rules.
- Brand story, origin, point of view, signature ideas, and emotional outcome.
- Degree of authorial presence: institutional, collective, founder-led, or individual portfolio.

### 1.4 Existing identity assets

- Logo family: symbol, wordmark, monogram, horizontal/vertical lockups, responsive marks, monochrome and reversed variants.
- Logo usage: clear space, minimum size, backgrounds, co-branding, partner marks, registered marks, favicon and social avatars.
- Existing color, typography, grid, illustration, photography, icon, motion, data-visualization, and sonic guidance.
- Design tokens, component library, previous pages, templates, campaign assets, product screenshots, and physical-brand references.
- Source files, file formats, crop-safe zones, attribution, font licenses, image releases, and expiry or territory restrictions.

### 1.5 Constraints and reference frame

- Required and forbidden visual treatments; regulatory, sector, platform, CMS, browser, privacy, and performance constraints.
- Competitor and category conventions: which aid recognition, which create sameness, and which must be avoided.
- References annotated by quality (“use this composition rhythm”) rather than copied wholesale.
- Anti-references that clarify unwanted tone, motifs, clichés, or production techniques.
- Budget, schedule, available production skills, asset volume, and expected rate of content change.

### 1.6 Content and page inventory

- Page families and priority: home, campaign landing, about, services/products, work index, case study/project, article/index, contact, legal, utility, and error/empty states.
- Content types and realistic extremes: long names, missing imagery, dense comparison tables, portrait and landscape media, localized copy, embeds, quotes, code, charts, and forms.
- Shared shell and global elements: header, navigation, announcement, footer, consent, search, help, and conversion mechanism.
- Page-specific signature moments versus repeated system behavior.

**Minimum deliverable:** a short brand-visual brief that names the objective, audience, desired perception, evidence, constraints, existing assets, references/anti-references, and page/content inventory. If an input is unknown, mark it unknown rather than inventing a brand fact.

## 2. Art-direction frame: choices that define the visual world

Art direction is a coherent set of choices across media, not a synonym for a mood board or a list of adjectives. The frame should resolve the following categories without imposing particular answers.

### 2.1 Concept and narrative

- Central idea, visual thesis, or organizing metaphor.
- Relationship between message and image: literal, documentary, explanatory, symbolic, metaphorical, abstract, or atmospheric.
- Narrative mode: demonstration, transformation, journey, collection, contrast, system, portrait, environment, or evidence.
- Focal subject, supporting subjects, point of view, and what should remain visually quiet.

### 2.2 Expression axes

- Restraint ↔ exuberance.
- Precision ↔ spontaneity.
- Familiarity ↔ novelty.
- Literalness ↔ abstraction.
- Flatness ↔ depth.
- Stillness ↔ kinetic energy.
- Density ↔ openness.
- Symmetry ↔ asymmetry.
- Uniformity ↔ controlled variation.
- Timelessness ↔ period specificity.

These axes are diagnostic coordinates, not scores where one end is better.

### 2.3 Cultural and material vocabulary

- Relevant era, place, craft, subculture, medium, technology, or institutional cues.
- Material cues: paper, ink, paint, glass, metal, fabric, screen, light, 3D render, collage, or no simulated material.
- Degree of polish, tactility, imperfection, grain, and production visibility.
- Representation principles for people, bodies, environments, and cultures; authenticity and avoidance of stereotype.
- Originality controls: category clichés, generic stock metaphors, fashionable effects with no brand rationale, and inappropriate cultural borrowing.

### 2.4 Signature devices

- One or a small family of repeatable motifs: framing, crop logic, rule, mark, field, shape, line, texture, annotation, transition, or typographic gesture.
- Where each device may appear, its intensity, and its exclusion zones.
- Relationship to the logo and existing equity; signature devices should extend identity rather than compete with it.

### 2.5 Art-direction rules

- A concise rationale.
- “Always / sometimes / never” guidance.
- Reference and anti-reference examples with annotations.
- Adaptation rules for hero, section, card, editorial, social, and compact contexts.
- A controlled-exception rule: what may vary by campaign or project, who decides, and which invariants remain.

IBM’s identity guidance is useful as evidence for the categories, not as a style to copy: its illustration system distinguishes literal/abstract, micro/macro, low/high fidelity, intent, color, canvas, and composition ([IBM illustration tips](https://www.ibm.com/design/language/illustration/tips-and-techniques/)); its photography guidance separately specifies perspective, composition, aspect ratio, lighting, depth of field, effects, and cliché avoidance ([IBM photography tips](https://www.ibm.com/design/language/photography/tips-and-techniques)).

## 3. Visual primitives

Primitives are the smallest named values or source assets from which semantic roles are assigned. Keep them descriptive and medium-independent where possible. The DTCG specification provides interoperable types for color and opacity, dimensions, font families and weights, durations, cubic Béziers, numbers, strokes, borders, transitions, shadows, gradients, and composite typography ([DTCG Format Module](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/); [DTCG Color Module](https://www.w3.org/community/reports/design-tokens/CG-FINAL-color-20251028/)). Asset specifications remain necessary alongside tokens.

### 3.1 Color primitives

- Color space and gamut policy: sRGB baseline and any wide-gamut/print equivalents.
- Source hues, neutral families, white/black, tint-shade ramps, chroma and lightness progression.
- Opacity steps and alpha-composition policy.
- Gradient stops, direction/geometry, interpolation, and intended backgrounds.
- Theme/mode value sets: light, dark, high-contrast, campaign, or brand variants when actually required.
- Color provenance: inherited brand color, derived ramp, functional requirement, or data palette.

Raw palettes should not encode meaning in their names. A semantic token such as `text.primary` can alias a neutral primitive and change by mode. USWDS demonstrates this distinction between system colors, project/theme colors, and state tokens ([USWDS color overview](https://designsystem.digital.gov/design-tokens/color/overview/)).

### 3.2 Typography primitives

- Typeface families and fallback stacks; supported scripts and language coverage.
- Font files, formats, licensing, loading source, subsetting, and fallback metrics.
- Styles, weights, widths, optical sizes, variable-font axes, italics, and feature settings.
- Size scale and fluid/static behavior.
- Line-height scale, letter spacing, word spacing, paragraph spacing, indentation, and baseline behavior.
- Case, decoration, hyphenation, wrapping, truncation, numeral style, fractions, ligatures, and code/monospace treatment.
- Measure (line-length) values and column-reading settings.

Typography primitives must be evaluated in the actual typeface: nominally equal CSS sizes can have different apparent size and rhythm. USWDS therefore normalizes family and size together and exposes role families for heading, body, UI, code, and alternate uses ([USWDS font tokens](https://designsystem.digital.gov/design-tokens/typesetting/font/)); it also treats line height and measure as named foundations ([line height](https://designsystem.digital.gov/design-tokens/typesetting/line-height/), [measure](https://designsystem.digital.gov/design-tokens/typesetting/measure/)).

### 3.3 Spacing and sizing primitives

- Base unit and spacing scale, including micro spacing and large editorial/section spacing.
- Width and height steps, icon/media sizes, control sizes, and minimum/maximum container sizes.
- Breakpoints or container-query thresholds based on composition failure, not named device models.
- Grid primitives: column counts, margins, gutters, row/baseline units, max widths, and full-bleed bounds.
- Density or platform scales if touch and pointer contexts truly need different values.
- Aspect-ratio set for media and repeated containers.

Do not force every distance onto one mathematical scale. Component internals, text rhythm, optical corrections, and page-section intervals have different jobs, but each should come from a small deliberate set. Adobe Spectrum distinguishes inter-component spacing from responsive-grid layout ([Spectrum spacing](https://spectrum.adobe.com/page/spacing/)); IBM’s grid guidance separately covers columns, rows, margins, gutters, base units, spatial intervals, and aspect relationships ([IBM 2x Grid](https://www.ibm.com/design/language/2x-grid/)).

### 3.4 Shape and stroke primitives

- Geometric vocabulary: rectilinear, circular, polygonal, organic, cut, notched, or mixed.
- Corner-radius scale and per-corner possibilities.
- Border/stroke widths, styles, dash patterns, alignment, caps, joins, and miter limits.
- Key shapes, clipping/masking shapes, line angles, and container silhouettes.
- Optical correction rules for circles, diagonals, and mixed shapes.

Shape is communicative, not merely decorative. Define enough values to express interaction and grouping, but avoid a radius for every component. Spectrum’s object styles illustrate a semantic relationship among rounding, border weight, focus treatment, and transient elevation rather than treating effects as unrelated decoration ([Spectrum object styles](https://spectrum.adobe.com/page/object-styles/)).

### 3.5 Surface, material, and depth primitives

- Solid fills and background fields.
- Border/separator values.
- Shadow color, x/y offset, blur, spread, and multi-shadow compositions.
- Layer/elevation or z-order scale.
- Scrim and overlay opacity.
- Blur, backdrop treatment, translucency, vibrancy, blend mode, and isolation behavior.
- Texture, noise, grain, pattern, gloss, highlight, and edge treatment.
- Light model for dimensional work: direction, softness, ambient level, and shadow coherence.

Materials require explicit contrast testing against every plausible background. Apple’s materials guidance describes surface treatment as a way to establish foreground/background hierarchy and repeatedly ties translucency choices to legibility and contrast ([Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)).

### 3.6 Icon primitives and source specifications

- Library source and icon categories: action, object, status, navigation, social, brand, file, and decorative/pictogram.
- Base grid/viewBox, live area, padding, key shapes, baseline, and optical center.
- Stroke/fill mode, weight, cap, join, corner, angle, and perspective rules.
- Size set, optical variants, mirroring/directionality, badge/container treatment, and color behavior.
- Naming, metaphor, filled/outlined state pair, export format, and SVG hygiene.

IBM’s UI-icon guidance demonstrates why grid, padding, key shapes, stroke consistency, perspective, corners, and angles are separate specification categories ([IBM UI icons](https://www.ibm.com/design/language/iconography/ui-icons/design/)). Accessibility also requires consistent names and text alternatives when icons perform the same function across pages.

### 3.7 Illustration primitives and source specifications

- Style families and their permitted contexts.
- Palette, stroke/fill, shape, corner, texture, pattern, gradient, shadow, and perspective rules.
- Character/people construction and representation guidance.
- Environment, object, diagrammatic, and abstract-element systems.
- Complexity and detail tiers by size; hero, editorial, spot, empty-state, and icon-adjacent scales.
- Canvas/aspect ratios, safe zones, focal region, crop and responsive re-composition rules.
- Static, animated, 2D, 3D, collage, generative, or mixed-medium production specifications.

### 3.8 Photography primitives and source specifications

- Subject domains and prohibited/cliché subjects.
- Viewpoint, lens impression, distance, framing, focal point, and horizon behavior.
- Composition, negative space, subject placement, and text-safe zones.
- Lighting, exposure, contrast, temperature, color grade, saturation, and tonal range.
- Depth of field, sharpness, motion, grain, retouching, compositing, and filter policy.
- Human representation: candid/posed, gaze, expression, agency, environment, diversity, release status.
- Aspect ratios, crop anchors, art-directed responsive crops, resolution, compression, and format.
- Source/provenance: commissioned, documentary, archive, stock, user-generated, synthetic; attribution and usage rights.

### 3.9 Video and motion primitives

- Media type: filmed, screen capture, motion graphics, kinetic type, 2D/3D animation, or mixed.
- Frame/aspect ratios, resolution, frame rate, shot scale, camera movement, lighting, grade, and edit rhythm.
- Duration scale, easing curves, delay, stagger, iteration, and transition types.
- Spatial motion paths, origin, direction, continuity, choreography, and object physics.
- Productive/feedback motion versus expressive/story motion.
- Poster frame, thumbnail, captions/subtitles, transcript, audio description, controls, autoplay/mute, and fallback still.
- Reduced-motion substitution: remove, shorten, dissolve, jump cut, or static replacement according to meaning.

The W3C’s media guidance requires planning for captions, transcripts, audio description, and accessible players ([WAI: Making Audio and Video Media Accessible](https://www.w3.org/WAI/media/av/)). Moving or auto-updating content must satisfy pause/stop/hide rules, and flashing thresholds must be checked ([WCAG 2.2, SC 2.2.2 guidance](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

### 3.10 Data-visualization primitives

- Chart-type repertoire grouped by analytical task: comparison, trend, distribution, part-to-whole, relationship, flow/network, geospatial, and single-value/indicator.
- Categorical, sequential, diverging, status, highlight, and neutral palettes.
- Non-color encodings: position, length, area, shape, marker, line style, texture, and direct label.
- Axes, ticks, grids, baselines, reference bands/lines, annotations, legends, tooltips, and interaction states.
- Number/date formatting, precision, missing/null/suppressed values, units, and uncertainty.
- Density tiers and responsive simplification.
- Table or text alternative, downloadable data, and narrative takeaway.
- Motion and interaction behavior without hiding essential insight.

The system must preserve quantitative integrity and choose charts by the question rather than by novelty. IBM’s framework separates chart anatomy, color, interaction, and motion and recommends categorical versus sequential/diverging palettes by data relationship, with shape, line, pattern, and direct labels as additional encodings ([IBM data-visualization design](https://www.ibm.com/design/language/data-visualization/design/basics/); [IBM chart taxonomy](https://www.ibm.com/design/language/data-visualization/charts/)).

## 4. Semantic visual roles

Semantic roles are stable names for intent. They should alias primitives, switch coherently across modes, and be reused across pages. Component-specific tokens are justified only when a component cannot express its behavior through shared roles.

### 4.1 Color roles

- **Foreground:** text primary/secondary/tertiary/disabled/inverse; icon; link; selected; placeholder.
- **Background/surface:** canvas; section; subtle; raised; overlay; inset; inverse; brand field.
- **Border:** subtle/default/strong; interactive; selected; focus; divider.
- **Action:** primary, secondary, tertiary, destructive; foreground/background/border for default, hover, active, focus, selected, and disabled states.
- **Feedback/status:** information, success, warning, critical; each with background, foreground, border, and icon roles.
- **Emphasis:** brand, accent, highlight, scrim, selection, and focus indicator.
- **Data:** categorical series, sequential steps, diverging endpoints/midpoint, neutral/context, positive/negative, uncertainty, and selection/highlight.

No semantic role should depend on color alone. WCAG requires another cue for information or state conveyed by color ([Understanding SC 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).

### 4.2 Typography roles

- Display/hero, page title, section title, subsection heading, eyebrow/kicker.
- Body/prose, lead/deck, compact body, list, quote, attribution.
- UI label, navigation, button, input, helper, validation, caption, metadata, badge.
- Code, data/numeral, table header/cell, chart title/label/annotation.
- Legal/fine print only when still legible; do not use “fine print” to excuse inaccessible text.

Each role is a composite of family, size, weight/style, line height, tracking, case, decoration, and measure. Preserve semantic heading order independently from visual styling.

### 4.3 Spacing and layout roles

- Inline gap, icon-text gap, control gap, cluster gap.
- Stack gap: related, default, separated.
- Component inset/padding: compact, default, spacious.
- Grid gutter, page margin, content max width, prose measure.
- Section gap: compact, standard, feature, chapter.
- Shell offsets: header, anchored navigation, safe area.
- Media-text gap, card grid gap, form group gap, and data-density gap.

### 4.4 Shape and surface roles

- Interactive control, field, chip/tag, card, panel, dialog/popover, media frame, decorative field.
- Canvas, section, raised, floating, overlay, inset, selected, focus, disabled, and scrim surfaces.
- Divider, keyline, focus ring, selection ring, and chart reference line.
- Depth levels should express hierarchy, containment, or transience—not merely decorate every container.

### 4.5 Media roles

- Logo/identity, hero, evidence/work, editorial, portrait, environment, process, product UI, testimonial, background/atmosphere, spot/support, and decorative.
- Each role maps to allowed medium, style family, aspect ratios, crop behavior, caption/credit, alternative text strategy, loading priority, and responsive substitution.

### 4.6 Motion roles

- State feedback, enter/exit, reveal, continuity/shared element, navigation, orientation, progress, attention, data change, expressive hero, and ambient loop.
- Each role maps to duration/easing primitives, interruption behavior, reduced-motion alternative, and whether it may autoplay.

## 5. Medium-specific art-direction choices

Construction specifications answer “how is this asset made consistently?” Art direction answers “what kind of image or movement belongs in this brand and this story?” Keep the following decisions distinct from raw token values.

### 5.1 Iconography direction

- Role in the experience: quiet utility, instructional emphasis, expressive punctuation, or primary navigation.
- Metaphor strategy: conventional/literal, domain-specific, symbolic, or intentionally abstract; familiarity required at small sizes.
- Character: geometric/organic, restrained/expressive, technical/human, sharp/soft, dense/open.
- Outline, filled, duotone, dimensional, animated, or mixed families—and the rule for switching between them.
- Relationship to the typeface, logo geometry, illustration family, and control shapes.
- Custom library versus platform/system icons; when brand distinction justifies custom work and when convention is more usable.
- Label policy: icon-only only when the meaning is established and accessible; otherwise pair with text.

### 5.2 Illustration direction

- Communication job: explain, narrate, humanize, orient, decorate, or create a signature hero.
- Literalness, abstraction, fidelity, dimensionality, and realism.
- Visual mode: line, flat shape, painterly, collage, isometric, diagrammatic, 3D, generative, or mixed.
- Perspective, framing, focal strategy, spatial depth, and compositional density.
- Subject and representation approach; character presence, environment, diversity, and cultural specificity.
- Relationship to brand color: full palette, limited palette, monochrome, accent-only, or independent natural color.
- Scale tiers and how detail, stroke, texture, and motion change from spot to hero use.
- Compatibility rules for combining illustration with UI fragments, photography, icons, type, or data.

### 5.3 Photography direction

- Documentary, candid, directed-documentary, staged, still-life, archival, product, portrait, environmental, or abstract mode.
- Subject domains and the perspective the viewer is invited to take.
- Camera distance, viewpoint, lens character, framing, negative space, and gaze.
- Lighting, tonal contrast, temperature, palette relationship, grade, depth of field, motion, and texture.
- Emotional register and degree of polish or imperfection.
- Authenticity rules: real context versus simulation, acceptable retouching, cliché avoidance, and truthful representation.
- Series coherence: what must match across images and what may vary by story.
- Text-over-image policy and crop-safe compositions for responsive use.

### 5.4 Video and motion direction

- Communication form: filmed story, interview, product demonstration, screen capture, motion graphic, kinetic type, animated illustration, 3D, or ambient texture.
- Narrative structure, point of view, shot language, edit pace, camera movement, and transition vocabulary.
- Relationship among live action, graphic overlays, typography, iconography, illustration, UI, data, sound, and captions.
- Motion personality: efficient/expressive, continuous/cut, physical/graphic, calm/energetic, precise/spontaneous.
- Attention choreography: focal handoff, sequencing, rest, loop behavior, and endpoint.
- Autoplay policy, user initiation, sound default, reduced-motion alternative, and static/poster substitute.
- Production realism: choose a direction the project can execute consistently at the required volume.

### 5.5 Data-visualization direction

- Analytical, explanatory/editorial, monitoring, exploratory, or promotional purpose.
- Tone and emphasis: neutral evidence, guided takeaway, comparison, alert, or celebration—without compromising numerical integrity.
- Preferred chart families by task and prohibited forms that obscure the data.
- Annotation and narrative density; direct labeling versus legend; overview versus details on demand.
- Brand expression in type, spacing, highlight, and annotation while keeping encodings conventional and readable.
- Palette behavior for category, magnitude, divergence, status, context, and selected data.
- Static, responsive, animated, or interactive presentation and the equivalent nonvisual/table route.
- Relationship to the surrounding page: embedded evidence, full-width feature, compact card, dashboard, or downloadable artifact.

### 5.6 Cross-media orchestration

- Name the dominant medium and the supporting media for each page family.
- Define compatibility: which icon, illustration, photography, video, and chart treatments may coexist.
- Reuse shared geometry, palette roles, rhythm, or composition logic without forcing every medium to look identical.
- Set contrast in expressive intensity so a chart or proof image can remain legible beside a dramatic hero.
- Avoid arbitrary style mixing; each medium change should follow content purpose, not novelty.

## 6. Visual hierarchy and composition

Hierarchy is the planned order of attention and understanding. Composition is how scale, position, grouping, contrast, rhythm, and media create that order. Apple’s HIG identifies hierarchy and consistency as platform-level principles ([Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)); IBM’s layout guidance similarly states that a successful composition guides the viewer through hierarchy and uses a grid to create structural rhythm ([IBM layout tips](https://www.ibm.com/design/language/layout/tips-and-techniques/)).

### 5.1 Information hierarchy

- Primary page promise or task.
- Supporting explanation and proof.
- Primary and secondary actions.
- Navigation/orientation cues.
- Tertiary metadata, legal, and supporting detail.
- Deliberate de-emphasis: what should remain available without competing.

### 5.2 Attention mechanisms

- Scale and typographic contrast.
- Color and luminance contrast.
- Position and reading-order priority.
- Whitespace and isolation.
- Grouping, proximity, enclosure, alignment, and repetition.
- Image salience, faces/gaze, directional cues, and motion.
- Layer/depth and overlap.
- Difference within a repeated pattern.

Use few strong mechanisms together. When every section is oversized, animated, colored, and elevated, nothing retains priority.

### 5.3 Page composition

- Canvas and viewport relationship; full bleed versus contained content.
- Container, columns, rows/baseline, margins, gutters, and alignment anchors.
- Section anatomy and transitions between sections.
- Horizontal and vertical rhythm; repetition and controlled interruption.
- Balance: symmetric, asymmetric, radial, modular, or intentionally unstable.
- Density and whitespace; open versus compact zones.
- Focal point, entry point, scan path, and endpoint/conversion closure.
- Media/text relationship: adjacent, inset, background, layered, alternating, or independent.
- Edge behavior, cropping, overflow, sticky elements, and depth.

### 5.4 Responsive composition

- Preserve meaning and reading order when columns collapse or reorder.
- Let breakpoints follow content collision, line length, media legibility, and interaction needs.
- Define which properties are fluid, stepwise, clamped, hidden, substituted, or re-composed.
- Test narrow/mobile, intermediate/tablet, common desktop, wide desktop, zoom, portrait/landscape, long copy, localization, and text-size changes.
- Art-direct media crops rather than relying blindly on `object-fit` when the focal subject or embedded text can be lost.
- Maintain touch targets and avoid overlay collisions, obscured focus, and horizontal page scroll.

WCAG requires text to resize to 200% without loss ([SC 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)) and content to reflow at the specified narrow equivalent; it also requires a meaningful focus order when sequential navigation affects meaning ([SC 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)). Visual reordering must not contradict source or focus order.

## 7. Cross-page consistency without monotony

Consistency means stable meaning and recognizable family resemblance, not making every page composition identical.

### 6.1 Site-wide invariants

- Logo use, core palette roles, type roles, spacing rhythm, shape/surface logic, icon family, and interaction states.
- Header, navigation, footer, help, search, consent, and primary conversion behavior.
- Naming, labels, icon metaphors, focus, validation, selected/active, loading, empty, and error states.
- Grid/container logic, page margins, section boundaries, media captions/credits, and responsive behavior.
- Accessibility alternatives, reduced-motion behavior, theme/mode behavior, and localization conventions.

WCAG specifically requires repeated navigation to retain the same relative order ([SC 3.2.3](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)) and functions repeated across a page set to be identified consistently, including their text alternatives ([SC 3.2.4](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification)).

### 6.2 Controlled variables

- Page-family anatomy: landing, index, detail/case study, article, contact, utility.
- Hero layout, section cadence, content density, and media dominance.
- Accent use, signature motif intensity, and expressive-motion allowance.
- Campaign/project sub-palettes or imagery sets, if mapped back to stable semantic roles.
- Evidence type and storytelling pattern.

### 6.3 Consistency mechanisms

- One source of truth for primitives and role aliases.
- Page-family templates or composition recipes rather than one universal template.
- Reusable components for repeated function; documented variants rather than one-off copies.
- Asset metadata: role, ratio, focal point, alt/description, rights, credit, source, and expiry.
- Visual regression views across representative pages, modes, widths, zoom, and states.
- Exception ledger that records intentional deviations and prevents accidental drift from becoming precedent.

### 6.4 Coherence review

Review the site as contact sheets, not only as isolated screens:

- Do all pages clearly belong to one identity?
- Are repeated meanings represented by the same role, icon, label, and state treatment?
- Does each page family have a recognizable purpose without feeling like a new brand?
- Are visual peaks distributed, or does every section compete as a hero?
- Are crop, lighting, illustration, chart, and motion treatments internally compatible?
- Does the final conversion feel like a continuation of the page rather than an unrelated component?

## 8. Validation taxonomy

Validation is a first-class category because a visually coherent specification can still fail users, brand objectives, implementation, or production constraints.

### 7.1 Brand and art-direction validation

- Trace every major visual decision to a brand input, audience need, content need, or functional role.
- Compare against desired-perception axes, references, anti-references, category conventions, and originality risks.
- Verify logo integrity, trademark/co-brand rules, signature-device discipline, and tone across media.
- Test with representative real content and evidence, not only polished placeholder assets.
- Check that the style does not imply unsupported claims, erase relevant context, or stereotype represented people.

### 7.2 Token and system validation

- Every production value resolves to a documented primitive or an approved exception.
- Semantic names describe purpose, not hue or component appearance.
- All modes resolve aliases completely; no missing, circular, or contradictory references.
- Role/state matrices are complete across default, hover, active, focus, selected, visited where relevant, disabled, loading, success, warning, and error.
- Component-specific values do not duplicate an existing shared role.
- Design source and code produce equivalent values and assets.

### 7.3 Accessibility validation

- **Text contrast:** at least 4.5:1 for normal text and 3:1 for large text at WCAG AA; test text over images, gradients, video, translucency, disabled-looking content that remains actionable, and every state.
- **Non-text contrast:** controls, meaningful graphics, focus and state indicators meet applicable 3:1 requirements.
- **Color independence:** status, links, required fields, chart series, and selection have a non-color cue.
- **Typography:** real text rather than images of text except essential cases such as logos; 200% resizing, user text-spacing overrides, reflow, language/script support, and no clipped/truncated meaning.
- **Structure:** visual hierarchy agrees with semantic headings, DOM/source order, reading order, and focus order.
- **Images/icons:** purpose-appropriate text alternatives; decorative media ignored; functional images named by action. The WAI image tutorial distinguishes informative, decorative, and functional alternatives ([WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/)).
- **Media:** captions, transcript, audio description as needed, accessible controls, no inaccessible autoplay, safe flashing, and usable poster/fallback.
- **Motion:** pause/stop/hide when required; essential/nonessential classification; reduced-motion version; no vestibular surprise.
- **Focus and targets:** visible, unobscured focus; distinguishable interactive states; adequate target size and spacing.
- **Consistency:** repeated navigation and functions remain predictable across the site.

Use WCAG 2.2 as the baseline source of normative success criteria ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)), while recognizing that conformance is a floor rather than a complete measure of visual usability.

### 7.4 Responsive and content-resilience validation

- Representative widths, heights, orientations, input modes, zoom, text enlargement, and operating-system preferences.
- Long/short/missing content, localization expansion, RTL, CJK and other required scripts, long URLs, numerals, tables, and errors.
- Focal crops, embedded text in media, logos, faces, subtitles, and chart labels at every responsive variant.
- Header/footer, anchor targets, sticky/fixed elements, dialogs, cookie banners, and virtual keyboard collisions.
- Print/PDF or share-card output when those are real requirements.

### 7.5 Media and data-integrity validation

- Image sharpness at rendered size and device density; correct color profile, aspect/crop, compression, and format.
- Consistent lighting/grade/perspective within a set unless contrast is intentional.
- Video legibility, caption timing, audio levels, poster frame, control access, and fallback.
- Chart choice matches the analytical question; axes, scales, units, baselines, precision, nulls, uncertainty, and sorting do not mislead.
- Data is understandable without color alone and has a text/table alternative appropriate to the task.
- Synthetic/generated media is checked for artifacts, factual or representational errors, provenance, disclosure obligations, and rights.

### 7.6 Technical and performance validation

- Font loading, fallback layout shift, required weights/styles, subsetting, and license compliance.
- SVG viewBox, current-color behavior, accessible naming, stroke scaling, mirroring, and sanitization.
- Responsive images, intrinsic dimensions, decoding/loading priority, compression, and cumulative layout shift.
- Video poster and streaming behavior; no unnecessary autoplay payload.
- Effects degrade acceptably when backdrop filters, wide gamut, blend modes, or advanced formats are unavailable.
- Visual complexity, filters, large shadows, animation, and data graphics remain within performance budgets.

### 7.7 Cross-page and release validation

- Contact sheet of all page templates and representative content pages.
- Theme/mode/state matrix and viewport matrix.
- Token diff and one-off-value scan.
- Visual regression against approved references.
- Keyboard, screen reader, zoom, forced-colors/high-contrast, reduced-motion, and color-vision checks.
- Asset-rights, attribution, expiration, privacy, and consent review.
- Browser/device sampling proportional to audience evidence.
- Final review in production-like rendering, not only the design tool.

## 9. Recommended output contract for a website design skill

For any project, the skill should produce or infer the following in order:

1. **Brand-visual brief:** known inputs, unknowns, constraints, page/content inventory, desired perception, references and anti-references.
2. **Art-direction statement:** concept, expression axes, media strategy, signature devices, and always/sometimes/never rules.
3. **Primitive foundation:** named raw values and asset specifications.
4. **Semantic map:** role aliases for color, type, space, shape, surface, media, motion, and data.
5. **Composition system:** grid, container, hierarchy, page-family recipes, responsive transformation, and controlled variables.
6. **Media systems:** icon, illustration, photography, video/motion, and data-visualization direction.
7. **Consistency plan:** invariants, variants, component/template reuse, asset metadata, and exceptions.
8. **Validation record:** accessibility, responsive/content stress, brand fit, production, performance, rights, and cross-page QA.

Do not manufacture all categories when a project does not use them. A site with no data graphics needs no chart palette; a site with no illustration needs no illustration style. The taxonomy is complete so the skill can ask or decide deliberately, not so every project accumulates a maximum-size design system.

## 10. Deduplicated recommended category tree

This tree deliberately lists a concept once at its owning level. For example, raw colors live under primitives; their meanings live under semantic roles; their expressive use lives under art direction; and their contrast, color-independence, gamut, and cross-page behavior live under validation.

```text
Brand & visual foundation
├── 1. Brand inputs
│   ├── Organization, offer & objectives
│   ├── Audience, context & accessibility needs
│   ├── Positioning, personality & verbal identity
│   ├── Existing identity & asset inventory
│   ├── Constraints, rights & production capacity
│   ├── Competitors, references & anti-references
│   └── Content, page families & shared shell
├── 2. Art direction
│   ├── Concept & visual narrative
│   ├── Desired-perception / expression axes
│   ├── Cultural, representational & material vocabulary
│   ├── Signature devices
│   ├── Media strategy
│   └── Always / sometimes / never / exception rules
├── 3. Primitives
│   ├── Color & opacity
│   ├── Typography
│   ├── Spacing, sizing, grid & aspect ratios
│   ├── Shape, radius, border & stroke
│   ├── Surface, texture, material, shadow & depth
│   ├── Icon construction
│   ├── Illustration construction
│   ├── Photography specifications
│   ├── Video & motion values/specifications
│   └── Data-visualization encodings
├── 4. Semantic roles
│   ├── Foreground, background, border & action color
│   ├── Feedback, focus, emphasis & data color
│   ├── Display, content, UI & data typography
│   ├── Inline, stack, inset, grid & section spacing
│   ├── Control, container, media & decorative shape
│   ├── Canvas, raised, overlay, inset & state surface
│   ├── Identity, hero, evidence, editorial & support media
│   └── Feedback, continuity, orientation & expressive motion
├── 5. Medium-specific art direction
│   ├── Iconography
│   ├── Illustration
│   ├── Photography
│   ├── Video & motion
│   └── Data visualization
├── 6. Hierarchy & composition
│   ├── Information priority & action hierarchy
│   ├── Attention mechanisms & focal path
│   ├── Grid, container, alignment & reading order
│   ├── Grouping, scale, density, whitespace & rhythm
│   ├── Balance, overlap, depth & section transitions
│   ├── Page-family composition recipes
│   └── Responsive reflow, re-composition & art-directed crops
├── 7. Cross-page consistency
│   ├── Site-wide visual and interaction invariants
│   ├── Controlled page-family/campaign variables
│   ├── Tokens, components, templates & asset metadata
│   ├── Responsive, state, theme & localization consistency
│   └── Exception ledger, contact sheets & regression views
└── 8. Validation
    ├── Brand fit, originality & representation
    ├── Token integrity & design-code fidelity
    ├── Accessibility & user preferences
    ├── Responsive, zoom, locale & content stress
    ├── Image, video, icon & data integrity
    ├── Technical resilience & performance
    ├── Rights, provenance, attribution & privacy
    └── Cross-page, cross-mode & release QA
```
