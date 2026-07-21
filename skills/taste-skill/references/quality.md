# Web Design Quality Rules

Use these rules to audit and verify landing pages, portfolios, and content-led websites. Apply the enforcement model contextually.

## Contents

1. [Enforcement model](#1-enforcement-model)
2. [Research provenance](#2-research-provenance)
3. [Quality rules](#3-quality-rules)
4. [Automatic checks](#4-automatic-checks)
5. [Human visual checks](#5-human-visual-checks)
6. [Required handoff report](#6-required-handoff-report)
7. [Removed or rejected universal claims](#7-removed-or-rejected-universal-claims)
8. [Highest-priority runtime rules](#8-highest-priority-runtime-rules)
9. [Synthesis conclusion](#9-synthesis-conclusion)

## 1. Enforcement model

Use the lowest enforcement level that prevents the observed failure.

- **HARD BAN**: Objectively broken, fabricated, deceptive, inaccessible, insecure, materially harmful, or explicitly prohibited by Taste Skill authoring policy. Product-policy bans are marked as such and do not claim the pattern is universally invalid design.
- **AVOID BY DEFAULT**: A saturated generated default that weakens fit or identity when chosen without context. It is allowed whenever the explicit user request, supplied content, category, or product behavior gives it a concrete job.
- **CONTEXTUAL WARNING**: A legitimate technique with meaningful tradeoffs. Require justification and verification.

Popularity alone is never sufficient evidence for a universal design claim. Familiar patterns can improve comprehension. Taste Skill may still prohibit a narrow generator habit when consistently omitting it produces cleaner work.

### Application order

1. Follow the explicit user request, supplied content, existing project, and real product behavior first.
2. Keep safety, accessibility, security, honesty, and data-loss bans intact.
3. Apply `AVOID BY DEFAULT` only when the user request, supplied content, and existing project leave the choice open. Never reject a requested hero, card grid, pricing layout, FAQ, or familiar section solely because it appears in this ledger.
4. For an explicitly requested design, prototype, or concept, clearly labeled mock data and static UI are allowed. Never present them as real, live, connected, verified, or production-ready.
5. When real content or functionality is unavailable, omit the element or use a clean, neutral placeholder. End the delivery with a short `Still needed` report listing every placeholder, missing asset, unconnected interaction, and unresolved integration.

## 2. Research provenance

- **R1:** General taxonomy synthesized from ten research streams.
- **R2:** Color, typography, surfaces, imagery, and brand systems.
- **R3:** Page architecture, sections, components, and mobile transformation.
- **R4:** Interaction, motion, accessibility, responsive behavior, engineering, and QA.
- **R5**: Existing non-image skills on the repository's `main` branch, audited for additional concrete failure patterns and deduplicated against R1-R4.

Evidence references below point to report sections or pattern IDs. The source reports retain the complete bibliography and URLs. Primary normative authority for accessibility is WCAG 2.2 and the WAI-ARIA Authoring Practices Guide.

## 3. Quality rules

### Brand and visual identity

### VIS-001 - Unchosen indigo, violet, or purple palette
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not use the common indigo-to-violet AI palette unless it belongs to the brand or concept.
- **Failure signature:** Purple or indigo CTA, gradient headline, colored glow, and accent tokens appear before any brand reasoning.
- **Detection:** Search color tokens and utility classes for `purple`, `violet`, `indigo`, and `fuchsia`; compare them with supplied brand assets.
- **Exception:** Purple is an existing brand color or carries a deliberate subject-specific meaning.
- **Preferred response:** Derive a palette from brand assets, subject matter, photography, or an explicit art direction.
- **Evidence:** R1 V-01; R2 Color, "Tailwind indigo/violet default palette."

### VIS-002 - Gradient text used as instant visual interest
- **Level:** CONTEXTUAL WARNING; HARD BAN when text disappears or fails contrast
- **Rule:** Keep important text solid unless a verified brand treatment requires a gradient.
- **Failure signature:** `bg-clip-text text-transparent` on the key word of a generic hero headline.
- **Detection:** Search for `background-clip: text`, `bg-clip-text`, and transparent text; test forced-colors and both gradient endpoints.
- **Exception:** Large display text with a solid fallback, verified contrast, and a real identity role.
- **Preferred response:** Create contrast through type, scale, weight, placement, or an adjacent visual.
- **Evidence:** R1 V-02; R2 Color and Surface sections; WCAG 2.2 SC 1.4.3.

### VIS-003 - Neon-on-near-black as a generic technology identity
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not equate technology with a dark canvas, neon accent, and colored outer glow.
- **Failure signature:** Near-black page, cyan or violet accent, luminous borders, and dim gray body copy regardless of product category.
- **Detection:** Inspect palette luminance, glow shadows, and whether the same treatment could represent any software company.
- **Exception:** Gaming, music, entertainment, hardware, or an established brand language that genuinely calls for it.
- **Preferred response:** Choose lightness, contrast, and accent behavior from the audience and product evidence.
- **Evidence:** R1 V-03 and V-05; R2 "Neon accents on near-black backgrounds."

### VIS-004 - Contrast sacrificed for a muted aesthetic
- **Level:** HARD BAN when WCAG thresholds fail
- **Rule:** Never use low-contrast gray text, translucent text, or white text on bright accent fills without measuring contrast.
- **Failure signature:** Placeholder gray becomes body text; muted labels disappear; white text sits on 400-scale Tailwind colors.
- **Detection:** Automated contrast testing plus manual sampling over gradients, imagery, glass, hover, disabled, and dark-mode states.
- **Exception:** Decorative or legally exempt text only where WCAG permits it; never essential content or controls.
- **Preferred response:** Adjust tone, surface, weight, size, or scrim until contrast passes without flattening hierarchy.
- **Evidence:** R1 A-05; R2 Color findings; R4 5.10; WCAG 2.2 SC 1.4.3.

### VIS-005 - Palette without a usable neutral ramp
- **Level:** AVOID BY DEFAULT
- **Rule:** Define background, surface, border, primary text, secondary text, and disabled roles instead of using one accent plus white.
- **Failure signature:** Two-color palette, arbitrary opacity modifiers, and no stable hierarchy across surfaces.
- **Detection:** Inventory color tokens by semantic role; flag roles filled by ad hoc alpha values or repeated accent variants.
- **Exception:** Intentionally minimal poster-like work whose limited palette still preserves hierarchy and accessibility.
- **Preferred response:** Build a compact semantic palette with a coherent warm, cool, or neutral temperature.
- **Evidence:** R2 "Absence of a neutral ramp" and "Single-accent monoculture."

### VIS-006 - Semantic colors used as decoration
- **Level:** CONTEXTUAL WARNING; HARD BAN when color is the only cue
- **Rule:** Reserve success, warning, and error colors for state, and pair state color with text, shape, or iconography.
- **Failure signature:** Random green and red cards, rainbow status dots, or colored tabs with no semantic meaning.
- **Detection:** Trace each semantic color to data or state; check the interface in grayscale.
- **Exception:** A brand palette may include those hues when they are not presented as status.
- **Preferred response:** Use the brand accent for emphasis and explicit labels for status.
- **Evidence:** R1 V-09; R2 "Semantic color misuse"; R4 5.11; WCAG 2.2 SC 1.4.1.

### VIS-007 - Default font stack treated as brand voice
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not select Inter, Geist, Roboto, or Space Grotesk solely because they are familiar defaults.
- **Failure signature:** Default sans across every role, generic logo-less wordmark, and no relationship between typography and subject.
- **Detection:** Compare the type choice with audience, content, language support, and supplied identity; run the brand-swap test.
- **Exception:** Product UI where neutrality, legibility, and platform consistency are intentional.
- **Preferred response:** Choose type for function and character, then define a small role system.
- **Evidence:** R1 V-04; R2 Typography and Brand findings.

### VIS-008 - No typographic role system
- **Level:** AVOID BY DEFAULT
- **Rule:** Define display, heading, body, label, utility, and data roles only when needed; do not style tags independently.
- **Failure signature:** One typeface, three arbitrary weights, isolated pixel sizes, and no repeatable hierarchy.
- **Detection:** Group computed styles by role and identify one-off sizes, weights, leading, and tracking.
- **Exception:** A deliberately monospaced or single-weight system can work when scale and spacing carry hierarchy.
- **Preferred response:** Establish a compact, fluid type scale and role-specific line-height and measure.
- **Evidence:** R2 Typography findings: single typeface, weight misuse, scale monotony or chaos.

### VIS-009 - Broken leading, tracking, or measure
- **Level:** HARD BAN when text clips, overlaps, or becomes unreadable; otherwise AVOID BY DEFAULT
- **Rule:** Do not use display line-height for paragraphs, tight tracking on small text, or full-container body measure.
- **Failure signature:** Multi-line heading at line-height 1, body copy wider than roughly 70 characters, clipped italic descenders, or dense all-caps paragraphs.
- **Detection:** Render long realistic copy at mobile and desktop; test text-spacing overrides and zoom.
- **Exception:** Short display fragments and intentional editorial compositions that remain readable.
- **Preferred response:** Tune line-height, measure, tracking, and width by role and viewport.
- **Evidence:** R2 Typography findings; R4 5.12; WCAG 2.2 SC 1.4.12.

### VIS-010 - Center-aligned reading text and all-caps overuse
- **Level:** AVOID BY DEFAULT
- **Rule:** Keep multi-line reading copy left-aligned and reserve uppercase for short functional UI labels such as buttons, form labels, navigation items, status tags, table headers, or compact real metadata.
- **Failure signature:** Centered paragraphs, long all-caps descriptions, and letter-spaced utility styling applied to ordinary prose.
- **Detection:** Find centered text blocks longer than two lines and uppercase blocks longer than a short phrase.
- **Exception:** Invitations, posters, ceremonial statements, and short hero copy with deliberate composition. A small uppercase prelabel above a heading is an eyebrow, not a functional label, and remains banned by CNT-009.
- **Preferred response:** Use alignment and casing according to reading behavior, not decoration.
- **Evidence:** R2 "All-Caps Overuse" and "Center-Aligned Body Copy."

### VIS-011 - Radius monoculture
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not apply the same large radius to navigation, cards, media, inputs, buttons, and entire sections.
- **Failure signature:** `rounded-2xl` or `rounded-3xl` on nearly every container.
- **Detection:** Count radius values and the proportion of visible elements using the largest radius.
- **Exception:** A deliberately soft product system with clear shape hierarchy.
- **Preferred response:** Define a small radius scale and let function, nesting, and brand shape determine usage.
- **Evidence:** R1 V-06; R2 "Radius monoculture."

### VIS-012 - Surface and elevation monotony
- **Level:** AVOID BY DEFAULT
- **Rule:** Use cards and elevation only when enclosure or depth communicates a real object or hierarchy.
- **Failure signature:** Every paragraph becomes a bordered card; every dark card uses `bg-white/5 border-white/10`; every light card receives the same shadow.
- **Detection:** Remove borders and shadows in inspection; if information structure remains unchanged, the surfaces are decorative.
- **Exception:** Dense object collections where cards support scanning, selection, or drag behavior.
- **Preferred response:** Use whitespace, alignment, dividers, media, and tonal zones before another container.
- **Evidence:** R1 V-06; R2 Surface findings.

### VIS-013 - Effect stacking without material logic
- **Level:** CONTEXTUAL WARNING
- **Rule:** Do not combine gradient fill, glass blur, border, glow, noise, and shadow on the same surface merely to make it feel premium.
- **Failure signature:** Multiple decorative cues communicate no state or depth difference.
- **Detection:** Inventory visual effects per component and remove them one by one; require a role for each remaining cue.
- **Exception:** Expressive campaign or entertainment work where material excess is the concept and performance is verified.
- **Preferred response:** Choose one material idea and execute it consistently.
- **Evidence:** R1 V-03; R2 Surface findings: cue stacking, aurora blobs, glass, grain, and animated borders.

### VIS-014 - Uniform section rhythm
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not give every section identical vertical padding, container width, heading placement, and density.
- **Failure signature:** Repeated `py-24 sm:py-32`, centered heading, content block, and identical exit spacing across the page.
- **Detection:** List section spacing, width, alignment, and density; flag pages whose cadence never changes.
- **Exception:** Documentation and application settings where predictability is more valuable than narrative pacing.
- **Preferred response:** Create chapters, pauses, dense evidence moments, and transitions according to the story.
- **Evidence:** R1 S-10; R2 Surface findings; R3 Full-page architecture.

### VIS-015 - Unmodified component-library skin
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not ship the default shadcn, Tailwind UI, Bootstrap, or design-system theme as the product identity.
- **Failure signature:** Default fonts, radii, neutral colors, shadows, and component spacing remain unchanged.
- **Detection:** Compare tokens and component styles with upstream defaults.
- **Exception:** Internal tools, prototypes, or products whose brand explicitly adopts the system.
- **Preferred response:** Preserve accessible component behavior while adapting tokens, typography, density, and composition.
- **Evidence:** R1 V-08; R2 Brand findings.

### VIS-016 - Brand token and cross-page drift
- **Level:** HARD BAN when inconsistency changes meaning or usability; otherwise AVOID BY DEFAULT
- **Rule:** Do not regenerate a new color, radius, label, or component treatment per page.
- **Failure signature:** Multiple primary blues, mixed neutral temperatures, inconsistent button labels, and unrelated surface systems.
- **Detection:** Audit tokens and repeated components across routes; find hardcoded values beside semantic variables.
- **Exception:** Explicit sub-brand or campaign theming with documented boundaries.
- **Preferred response:** Define shared primitives for color, type, shape, spacing, motion, and language.
- **Evidence:** R2 Brand findings: token drift, cross-page inconsistency, missing brand primitives.

### VIS-017 - Arbitrary theme inversion inside one page
- **Level:** AVOID BY DEFAULT; HARD BAN when contrast or meaning breaks
- **Rule:** Do not flip whole sections between unrelated light and dark themes merely to create variety.
- **Failure signature:** A coherent dark page suddenly becomes warm paper, then returns to dark, with different text, border, and accent logic in each section.
- **Detection:** Map background, surface, text, border, and accent tokens by section and inspect every transition.
- **Exception:** A requested or conceptually justified theme transition may occur when it marks a real narrative or product-state change and remains accessible.
- **Preferred response:** Keep one page-level theme with controlled tonal variation, or design one deliberate transition with shared tokens and a clear reason.
- **Evidence:** R5 theme-lock rules, deduplicated against VIS-016.

### VIS-018 - Category palette stereotype
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not equate every premium consumer, artisan, wellness, cookware, or heritage project with beige, cream, brass, clay, ochre, oxblood, and espresso.
- **Failure signature:** The same warm-craft palette appears before any brand, product, photography, or audience evidence supports it.
- **Detection:** Compare the proposed palette with supplied assets and the last several category projects; run the brand-swap test.
- **Exception:** Use the palette when requested or when the actual brand and material world genuinely support it.
- **Preferred response:** Derive color from the specific product and rotate among coherent warm, cool, monochrome, natural, or saturated directions instead of using a category costume.
- **Evidence:** R5 premium-consumer palette audit.

### Page architecture, sections, and layout components

### LAY-001 - Canonical marketing-section conveyor belt
- **Level:** AVOID BY DEFAULT
- **Rule:** When the user request and existing project leave page structure open, do not automatically generate hero, logos, three features, stats, testimonials, pricing, FAQ, CTA, and footer in that order.
- **Failure signature:** The page sequence follows category convention without reflecting the visitor's actual questions or decision path.
- **Detection:** Name each section's job and remove it; if nothing important is lost, it was filler.
- **Exception:** Any conventional sequence is valid when the user requests it or it genuinely matches the content, category, and buying process.
- **Preferred response:** Derive the section sequence from subject, evidence, objections, and next action.
- **Evidence:** R1 S-01; R3 Full-page architecture.

### LAY-002 - Centered hero package emitted by reflex
- **Level:** AVOID BY DEFAULT
- **Rule:** When no hero direction is supplied, do not reflexively choose a giant centered headline, short paragraph, dual CTAs, and a decorative preview below.
- **Failure signature:** The first viewport could introduce any software company after a logo swap.
- **Detection:** Run the brand-swap test and inspect whether the visual anchor proves what the product is.
- **Exception:** Use this composition when requested or when a concise proposition genuinely benefits from central focus and the hero carries useful evidence.
- **Preferred response:** Choose object-led, product-stage, editorial, asymmetric, image-led, or interactive composition from the request, content, and subject.
- **Evidence:** R1 S-02; R3 Hero.

### LAY-003 - Hero fails the first viewport
- **Level:** HARD BAN
- **Rule:** The first viewport must identify the subject, value, and next action without clipping, overflow, or hiding the primary CTA.
- **Failure signature:** Four-line desktop H1, CTA below the fold, overlapping nav, or decorative media displacing the message.
- **Detection:** Render representative desktop, short-laptop, tablet, and mobile viewports with realistic copy.
- **Exception:** Intentional editorial or art experiences without a conversion action still need a legible subject and entry point.
- **Preferred response:** Rewrite, recompose, or resize content instead of shrinking everything indiscriminately.
- **Evidence:** R3 Hero; R4 Responsive failures.

### LAY-004 - Navigation optimized for appearance instead of orientation
- **Level:** HARD BAN when destinations become inaccessible; otherwise AVOID BY DEFAULT
- **Rule:** Do not hide ordinary desktop navigation, use mystery labels, or make menu animation more prominent than destinations.
- **Failure signature:** Hamburger-only desktop nav, icon-only destinations, wrapped header, dead dropdown, or capsule nav chosen for trend value.
- **Detection:** Test information scent, keyboard access, touch behavior, route state, and header fit.
- **Exception:** Small portfolios or immersive experiences with very few destinations and a clearly labeled menu.
- **Preferred response:** Use visible, concrete labels and a mobile disclosure that actually works.
- **Evidence:** R1 S-11; R3 Navigation; R4 4.3.

### LAY-005 - Three equal feature cards as the first answer
- **Level:** AVOID BY DEFAULT
- **Rule:** When the presentation is unspecified, do not turn every set of three copy points into three equal icon cards.
- **Failure signature:** Identical card size, icon placement, text length, and hover lift regardless of feature importance.
- **Detection:** Ask whether the three capabilities have equal weight and whether the cards show any product evidence.
- **Exception:** Use equal cards when requested or when truly peer-level options benefit from rapid comparison.
- **Preferred response:** Use one dominant capability, annotated product state, scenario sequence, ledger, tabs with changing media, or asymmetric grouping.
- **Evidence:** R1 S-03; R3 Feature presentation and 4.1.

### LAY-006 - Bento grid used as a synonym for good design
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not use a bento grid unless differences in cell size and placement communicate hierarchy or relationships.
- **Failure signature:** Arbitrary mixed spans, text-only cells, empty filler cells, and no meaningful reading order.
- **Detection:** Linearize the grid; if the hierarchy becomes clearer, the grid was decorative.
- **Exception:** A bounded set of heterogeneous but related product capabilities with real media and intentional hierarchy.
- **Preferred response:** Choose layout from content relationships, and define an explicit mobile order.
- **Evidence:** R1 S-05; R3 4.2.

### LAY-007 - Decorative fake product demonstration
- **Level:** HARD BAN when presented as real behavior
- **Rule:** Do not represent a product with styled rectangles, fake terminals, or hardcoded dashboards that imply functionality the product does not have.
- **Failure signature:** Browser chrome around static divs, fake live values, decorative chat, or controls that cannot be used.
- **Detection:** Compare every visible state and control with implemented or supplied product behavior.
- **Exception:** An explicitly requested design prototype may use clearly labeled sample UI, sample data, concept art, wireframes, or static illustrations that make no functional claim.
- **Preferred response:** Use real screenshots when available. Otherwise use a clean labeled placeholder or sample state and list the missing real product state or integration in the handoff report.
- **Evidence:** R1 V-11 and B-05; R3 Product demonstrations and 4.16.

### LAY-008 - Unverified logo wall or social-proof band
- **Level:** HARD BAN when logos or relationships are fabricated; otherwise AVOID BY DEFAULT
- **Rule:** Do not add "Trusted by" proof without supplied, attributable evidence.
- **Failure signature:** Grayscale logo cloud, anonymous marks, fake companies, or unrelated famous logos.
- **Detection:** Require a source or user-provided relationship for every logo and claim.
- **Exception:** A factual integration directory, verified customer list, or an explicitly requested design mockup using neutral logo placeholders clearly marked as samples.
- **Preferred response:** Use attributable proof when supplied. Otherwise omit the section or use clean neutral placeholders and list the missing logos and permissions in the handoff report.
- **Evidence:** R1 S-04, C-04; R3 Social proof and 4.8.

### LAY-009 - Decorative stat band
- **Level:** HARD BAN when numbers are invented; otherwise AVOID BY DEFAULT
- **Rule:** Do not create large round metrics merely to add visual authority.
- **Failure signature:** `99.9%`, `10x`, or millions of users without provenance, context, timeframe, or denominator.
- **Detection:** Require a source, definition, and date for each number.
- **Exception:** Verified metrics that answer a concrete uncertainty, or clearly labeled sample values in an explicitly requested design prototype.
- **Preferred response:** Show measured evidence when supplied. Otherwise omit the numbers or use obvious placeholders such as `XX%` and list the required metrics in the handoff report.
- **Evidence:** R1 S-07 and C-03; R3 4.9.

### LAY-010 - Biased or decorative comparison
- **Level:** HARD BAN when materially misleading; otherwise CONTEXTUAL WARNING
- **Rule:** Do not build a comparison whose criteria exist only to make the preferred option win.
- **Failure signature:** Vague checkmarks, missing labels on mobile, invented competitor limitations, or preselected winner without evidence.
- **Detection:** Verify criteria, symmetry, sources, and the mobile representation of labels.
- **Exception:** An explicitly opinionated recommendation supported by transparent criteria, or a clearly labeled sample comparison requested for a design prototype.
- **Preferred response:** Use a compact matrix, paired workflow, cost model, or criterion-by-criterion narrative.
- **Evidence:** R3 Comparison; R1 C-07.

### LAY-011 - Numbered cards pretending to explain a process
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not treat numbered boxes and abstract icons as proof of how a product works.
- **Failure signature:** Three or four equal steps with no artifact or state changing between them.
- **Detection:** Ask what the visitor learns beyond the step labels.
- **Exception:** A genuinely simple linear process where the order is the only uncertainty.
- **Preferred response:** Advance an annotated artifact, product state, branching flow, timeline, or working simulation.
- **Evidence:** R3 Process and How It Works.

### LAY-012 - Three pricing cards with an arbitrary highlighted middle tier
- **Level:** HARD BAN when prices or savings are invented; otherwise AVOID BY DEFAULT
- **Rule:** When pricing structure is unspecified, do not default to three equal plans, a "Most Popular" pill, and a cosmetic billing toggle.
- **Failure signature:** Highlighted center plan without usage evidence, crossed-out invented price, or toggle that changes no value.
- **Detection:** Verify plan data, recommendation logic, toggle behavior, and decisive differences on mobile.
- **Exception:** Three real tiers with a defensible recommended path, or clearly labeled sample pricing when the user explicitly requests a pricing-page design.
- **Preferred response:** Follow supplied pricing. If none exists, use clean placeholders or visibly labeled sample values and list the required real prices, claims, and billing behavior in the handoff report.
- **Evidence:** R1 S-06; R3 Pricing and 4.11.

### LAY-013 - Generic testimonial grid
- **Level:** HARD BAN when people or quotes are fabricated; otherwise AVOID BY DEFAULT
- **Rule:** Do not create three equal testimonial cards to fill a trust section.
- **Failure signature:** Stock avatars, generic praise, identical quote lengths, and no product context.
- **Detection:** Require attribution and source; test whether the quote reduces a specific uncertainty.
- **Exception:** Verified testimonials with distinct context and permission, or neutral testimonial placeholders in an explicitly requested design prototype.
- **Preferred response:** Use supplied proof or omit the section. If its design is explicitly requested, use visibly labeled placeholders and list the required quotes, identities, and permissions in the handoff report.
- **Evidence:** R1 C-02; R3 Testimonials and 4.10.

### LAY-014 - FAQ added only to extend the page
- **Level:** AVOID BY DEFAULT
- **Rule:** Include an FAQ only for unresolved, real objections that were not clearer elsewhere.
- **Failure signature:** Generic questions, marketing answers, and accordion copy that repeats earlier sections.
- **Detection:** Trace every question to user research, support, sales, or supplied product information.
- **Exception:** Complex policies, pricing, technical setup, or regulated information where direct answers reduce friction.
- **Preferred response:** Resolve core questions in the main narrative; keep any remaining FAQ concise and functional.
- **Evidence:** R1 S-08; R3 FAQ and 4.12.

### LAY-015 - Repeated closing CTA
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not add a giant final CTA when the same action has already concluded the journey.
- **Failure signature:** Repeated hero headline, oversized color field, duplicate buttons, and unused empty space before the footer.
- **Detection:** Map every CTA to a stage and user decision; remove duplicates with no new context.
- **Exception:** Long pages where a contextual action is useful after new evidence or commitment information.
- **Preferred response:** Continue the product story, configure the next action, or use a compact utility band.
- **Evidence:** R3 Full-page architecture, Calls to action, and 4.17.

### LAY-016 - Appended or theatrical footer
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not use an enormous wordmark, newsletter box, or dense mega-footer solely as a dramatic ending.
- **Failure signature:** Tiny low-contrast utility links beneath a giant identity treatment unrelated to the page.
- **Detection:** Verify closure, navigation, legal, contact, and mobile grouping before decoration.
- **Exception:** Identity-led sites where the wordmark is an authentic recurring brand asset.
- **Preferred response:** Compose a footer around actual destinations and a deliberate final rhythm.
- **Evidence:** R1 S-10; R3 Footers and 4.20.

### LAY-017 - Repeated 50/50 image-text zigzag
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not alternate left-image/right-copy rows throughout the page without changing information mechanics.
- **Failure signature:** Every section uses the same split, ratio, scale, and reveal with sides swapped.
- **Detection:** List section layout families; more than two major repetitions is a redesign signal.
- **Exception:** Stepwise paired comparisons where repetition improves comprehension.
- **Preferred response:** Vary media role, scale, alignment, density, interaction, and narrative position.
- **Evidence:** R1 S-10; R3 4.15 and Repetition findings.

### LAY-018 - Auto-advancing content used to hide weak information architecture
- **Level:** CONTEXTUAL WARNING; HARD BAN when users cannot pause or reach content
- **Rule:** Do not rotate heroes, testimonials, or features automatically unless timing, control, and accessibility are justified.
- **Failure signature:** Content changes before reading is complete, dots are dead, offscreen slides remain focusable, or movement continues indefinitely.
- **Detection:** Test pause, keyboard, touch, reduced motion, focus visibility, and content availability without JavaScript.
- **Exception:** Non-essential ambient media or a user-controlled carousel with explicit state.
- **Preferred response:** Show the important item directly, use a manual rail, or expose a stable comparison.
- **Evidence:** R1 S-09; R3 4.7; R4 2.14-2.15.

### LAY-019 - Hero overloaded with secondary content
- **Level:** AVOID BY DEFAULT; HARD BAN when the primary action or meaning leaves the first viewport
- **Rule:** Keep the hero focused on identification, value, and the primary next action. Do not also pack feature lists, pricing teasers, trust microcopy, logo walls, testimonial avatars, and secondary metadata into the same opening composition, or push useful content down with unjustified top padding.
- **Failure signature:** The hero becomes a miniature landing page, the primary message competes with several unrelated proof and feature blocks, or empty space delays the headline and CTA.
- **Detection:** List every hero element and move each one below the fold; retain only what the visitor needs before the first decision. Inspect hero top padding on short laptops as well as large desktop screens.
- **Exception:** A requested dashboard-like launch surface or information-dense product may need more content when hierarchy remains clear and the first viewport still works.
- **Preferred response:** Move proof, pricing, compatibility, and feature detail into dedicated sections directly after the hero.
- **Evidence:** R5 hero-stack and first-viewport audit; extends LAY-003 without replacing it.

### LAY-020 - CTA or desktop navigation wraps unnecessarily
- **Level:** HARD BAN for CTA labels at normal desktop widths; otherwise AVOID BY DEFAULT
- **Rule:** Keep CTA labels and primary desktop navigation items on one line when usable horizontal space exists.
- **Failure signature:** A CTA breaks into two lines, a desktop nav becomes two rows, or an oversized header consumes a large part of the first viewport.
- **Detection:** Render desktop, short-laptop, tablet, localization, and long-label cases; inspect wrapping, collisions, and header height.
- **Exception:** Very narrow viewports may transform navigation or allow deliberate wrapping in an editorial control, but ordinary CTAs should remain single-line.
- **Preferred response:** Shorten labels, remove secondary destinations, allow natural control width, or switch navigation at an intentional breakpoint.
- **Evidence:** R5 CTA-wrap, single-line navigation, and navigation-height checks.

### LAY-021 - Multiple labels for the same CTA intent
- **Level:** AVOID BY DEFAULT
- **Rule:** Use one clear label for one action instead of renaming the same intent across navigation, hero, body, and footer.
- **Failure signature:** `Get in touch`, `Let's talk`, `Contact us`, and `Start a project` all lead to the same destination on one page.
- **Detection:** Group CTAs by destination and effect, then compare their labels and promised outcomes.
- **Exception:** Different contexts may require genuinely different actions or a clearer label for accessibility; repetition of the same accurate label is allowed.
- **Preferred response:** Choose the most concrete label and reuse it consistently wherever the identical action appears.
- **Evidence:** R5 duplicate-intent CTA audit.

### LAY-022 - Split-header filler composition
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not default to a large headline on the left and a small floating explanation in the far-right corner merely to fill a grid.
- **Failure signature:** The right paragraph has weak alignment, adds no necessary information, and leaves a large unresolved gap between related text.
- **Detection:** Stack the body beneath the headline; if comprehension and composition improve, the split was decorative.
- **Exception:** Use a split header when the columns carry genuinely complementary information, a control, navigation, or a visual and align as one deliberate composition.
- **Preferred response:** Stack related copy, or build a balanced two-column header with meaningful roles on both sides.
- **Evidence:** R5 production-test split-header findings.

### LAY-023 - Long list or data dump used as a landing-page section
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not paste a long list, award archive, publication table, capability inventory, or pricing matrix into a marketing page without prioritization.
- **Failure signature:** Visitors face many similar rows with no grouping, summary, search, disclosure, or path to the full dataset.
- **Detection:** Count items and identify the decision each item supports; test whether the top items plus a full-list path communicate faster.
- **Exception:** Dense data is valid when it is the product or the user explicitly needs exhaustive comparison on that page.
- **Preferred response:** Group, summarize, disclose, paginate, filter, or move exhaustive data to a dedicated surface.
- **Evidence:** R5 content-density and long-list audit.

### LAY-024 - Divider monotony in lists and specifications
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not use top and bottom hairlines on every row as the automatic treatment for long lists or spec sheets.
- **Failure signature:** Ten or more identical text rows form a spreadsheet-like wall with borders providing no additional grouping.
- **Detection:** Remove half the dividers and group rows by meaning; compare scan speed and hierarchy.
- **Exception:** Real data tables may require consistent row boundaries when they improve tracking, density, and accessibility.
- **Preferred response:** Use one divider direction, grouped chunks, sparse section rules, cards for featured values, or disclosure for secondary specifications.
- **Evidence:** R5 list and specification-table audit.

### LAY-025 - Decorative score or progress visualization
- **Level:** AVOID BY DEFAULT; HARD BAN when values are fabricated or misleading
- **Rule:** Do not use filled progress tracks, scores, gauges, or percentage bars merely to make a comparison look quantitative.
- **Failure signature:** Arbitrary partial fills imply measurement without a scale, source, denominator, or real progress state.
- **Detection:** Ask what the axis, unit, source, and user action are; remove the bar if none exists.
- **Exception:** Use progress and score visuals for real measurable completion, capacity, performance, or comparison with an accessible numeric equivalent.
- **Preferred response:** Show the verified number, criterion, and context directly, or use a simpler qualitative comparison.
- **Evidence:** R5 decorative comparison-visual audit; complements LAY-009 and LAY-010.

### LAY-026 - Ornamental overlays, crosshairs, and rotated edge text
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not add crosshair grids, registration lines, vertically rotated labels, or tags over images solely to make a composition feel art-directed.
- **Failure signature:** Lines organize no content, edge text is difficult to read, and image pills repeat category or issue metadata with no action or provenance.
- **Detection:** Remove each ornament and test whether navigation, annotation, identity, or composition loses a necessary function.
- **Exception:** Explicit editorial, industrial, cartographic, or experimental art direction may use these devices when they serve a real system and remain responsive and readable.
- **Preferred response:** Let imagery and layout carry the composition; place necessary captions outside media in normal reading order.
- **Evidence:** R5 production-test decoration audit.

### LAY-027 - Accidental absolute positioning and optical misalignment
- **Level:** HARD BAN when reading order, interaction, or responsiveness breaks; otherwise AVOID BY DEFAULT
- **Rule:** Do not use arbitrary absolute coordinates to assemble ordinary sections, and do not accept mathematically centered elements that look visibly misaligned.
- **Failure signature:** Content drifts, overlaps, detaches from its anchor, or requires many breakpoint-specific offsets; icons and labels look off despite equal numeric spacing.
- **Detection:** Inspect DOM reading order, remove positioning, resize continuously, localize copy, and perform an optical alignment pass.
- **Exception:** Intentional editorial layering, diagrams, and bounded overlays may use positioning with stable anchors, fallbacks, and accessible source order.
- **Preferred response:** Use grid, flex, intrinsic sizing, and small documented optical adjustments instead of coordinate patches.
- **Evidence:** R5 layout and optical-alignment audit; complements ENG-008.

### Copy, credibility, imagery, and icons

### CNT-001 - Generic marketing abstraction
- **Level:** AVOID BY DEFAULT
- **Rule:** Remove claims that could describe any product, including vague transformation, elevation, seamlessness, and power language.
- **Failure signature:** Buzzword-heavy headline and copy with no object, action, constraint, or outcome.
- **Detection:** Apply the brand-swap test and highlight sentences lacking a concrete noun or verifiable verb.
- **Exception:** A short campaign line supported immediately by concrete evidence.
- **Preferred response:** Name what the product does, for whom, under what conditions, and what happens next.
- **Evidence:** R1 C-01; R3 brand-swap test.

### CNT-002 - Fabricated testimonial or identity
- **Level:** HARD BAN
- **Rule:** Never invent a customer, quote, portrait, rating, or attribution and present it as real.
- **Failure signature:** Generated headshot, synthetic name, invented title, fake review, or placeholder avatar framed as social proof.
- **Detection:** Require a provenance record for every testimonial and identity.
- **Exception:** Clearly labeled fictional examples or neutral placeholders in explicitly requested prototypes or storytelling, never framed as real evidence.
- **Preferred response:** Use supplied proof, omit the claim, or use a clean labeled placeholder and list the missing quote, identity, and permission in the handoff report.
- **Evidence:** R1 C-02; R2 Imagery; FTC Consumer Reviews and Testimonials Rule.

### CNT-003 - Invented metric, benchmark, award, or outcome
- **Level:** HARD BAN
- **Rule:** Never create precise numbers, rankings, adoption claims, awards, or performance outcomes without evidence.
- **Failure signature:** Plausible but sourceless percentages, customer counts, speedups, or trophy claims.
- **Detection:** Require source, definition, timeframe, and scope for every quantitative claim.
- **Exception:** Clearly labeled sample data inside a development fixture or an explicitly requested design prototype.
- **Preferred response:** Use supplied measurements, omit the claim, or use obvious placeholders such as `XX%` and list the missing source, definition, timeframe, and scope in the handoff report.
- **Evidence:** R1 C-03 and C-07.

### CNT-004 - Fake or unauthorized customer and partner logos
- **Level:** HARD BAN
- **Rule:** Do not imply a commercial relationship through a logo without verification and permission where required.
- **Failure signature:** Famous logos inserted as trust decoration or fictional logos presented as customers.
- **Detection:** Maintain a source and relationship record for every mark.
- **Exception:** Factual comparison, integration, compatibility, or editorial reference with correct labeling, plus neutral fictional marks used as clearly labeled placeholders in an explicitly requested prototype.
- **Preferred response:** State the real relationship, remove the logo, or use a neutral placeholder and list the missing asset and permission in the handoff report.
- **Evidence:** R1 C-04; R3 Social proof.

### CNT-005 - Placeholder and meta-text shipped as content
- **Level:** HARD BAN
- **Rule:** Do not ship lorem ipsum, `href="#"`, TODO copy, generic names, scaffold titles, AI meta-language, or placeholder-image services.
- **Failure signature:** Demo text or routes remain visible in production.
- **Detection:** Search for known placeholders, empty links, default metadata, and temporary asset domains.
- **Exception:** Clean, neutral placeholders in local development or explicitly requested design prototypes when they are visibly marked and excluded from production.
- **Preferred response:** Replace with real content before production. Until then, keep placeholders obvious and list every unresolved content item in the handoff report.
- **Evidence:** R1 C-05, C-06, I-03, I-06.

### CNT-006 - Formulaic AI cadence treated as a ban target
- **Level:** AVOID BY DEFAULT
- **Rule:** Edit repetitive antithesis, rule-of-three phrasing, mechanical boldface, list soup, and punctuation habits, but do not use a single punctuation mark as proof of AI.
- **Failure signature:** Every sentence follows the same rhetorical pattern and the page sounds generated rather than spoken by the brand.
- **Detection:** Read aloud; compare sentence length, structure, emphasis, and repeated constructions.
- **Exception:** A rhetorical device used deliberately and sparingly.
- **Preferred response:** Use the brand's vocabulary, varied sentence rhythm, and concrete statements.
- **Evidence:** R1 C-08 and C-09; R1 Executive Summary warns that single tells are weak.

### CNT-007 - Decorative or mismatched imagery
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not use glossy 3D blobs, unrelated stock photos, code screens, or oversized hero art that adds no information about the subject.
- **Failure signature:** The image could move to an unrelated company without changing meaning.
- **Detection:** Ask what claim or atmosphere the image uniquely supports; inspect crops at all breakpoints.
- **Exception:** Purely atmospheric campaign imagery that is intentionally part of the brand world. Relevant stock photography is a valid fallback when suitable supplied assets or image-generation tools are unavailable.
- **Preferred response:** Use supplied or generated subject-specific imagery when possible; otherwise choose relevant, licensable stock photography with deliberate cropping and list any temporary asset in the handoff report.
- **Evidence:** R1 V-10; R2 Imagery findings.

### CNT-008 - Incoherent icon and illustration system
- **Level:** AVOID BY DEFAULT; HARD BAN when icon-only controls lack names
- **Rule:** Do not mix emoji, hand-drawn SVGs, outline-library icons, and unrelated illustration styles without a system. Do not hand-draw routine interface glyphs when a coherent installed icon family already covers them.
- **Failure signature:** Lucide used for every concept, inconsistent stroke weights, emoji features, or invisible labels on controls.
- **Detection:** Inventory source, stroke, fill, size, optical weight, label, and semantic role.
- **Exception:** Deliberate collage or expressive work where contrast between systems is part of the concept. Custom SVG illustration is valid when requested, subject-specific, visually strong, and tested at its rendered size.
- **Preferred response:** Use one established family for interface icons. Reserve custom SVG work for high-quality illustrations, diagrams, logos, or marks that genuinely require it.
- **Evidence:** R1 V-12 and A-03; R2 Imagery and Iconography.

### CNT-009 - Eyebrow, kicker, or overline copy
- **Level:** HARD BAN - Taste Skill authoring policy
- **Rule:** Never generate eyebrow, kicker, overline, pretitle, or tiny label copy above a heading.
- **Failure signature:** A section begins with a small uppercase word, pill, category, or phrase such as `OUR APPROACH`, `SELECTED WORK`, `CREATIVE STUDIO`, or `BUILT FOR TEAMS` before the actual heading.
- **Detection:** Inspect every heading for a preceding text fragment whose only job is styling, atmosphere, or filling vertical space.
- **Exception:** Semantic interface text such as form labels, navigation labels, status labels, table headers, and real metadata is not an eyebrow.
- **Preferred response:** Put necessary context directly into the shortest useful heading or body copy; otherwise omit it.
- **Evidence:** Taste Skill v2 authoring policy, informed by R1 and R3 hero and section-template findings.

### CNT-010 - Decorative filler text
- **Level:** HARD BAN - Taste Skill authoring policy
- **Rule:** If text is unnecessary, omit it. Every visible text fragment must provide information, instruction, evidence, identification, navigation, status, or an action.
- **Failure signature:** Floating words or pseudo-metadata such as `ATELIER`, `STUDIO XXX`, `EST. 2026`, fake coordinates, archive numbers, timestamps, issue codes, or repeated brand fragments exist only to make the composition look designed.
- **Detection:** Remove the text. If meaning, trust, orientation, and task completion do not change, it is decoration and must stay removed.
- **Exception:** A real brand name, real provenance, real document metadata, or required legal text serving its stated purpose.
- **Preferred response:** Use spacing, typography, imagery, shape, or composition for visual character without inventing words.
- **Evidence:** Taste Skill v2 authoring policy; R1 C-01 and C-05; R3 filler-section and brand-swap tests.

### CNT-011 - Bloated headline or prematurely forced wrap
- **Level:** HARD BAN - Taste Skill authoring policy
- **Rule:** Use the shortest precise headline that preserves the intended meaning. Do not turn body-copy sentences into headings, and do not force an earlier line break while usable horizontal space remains.
- **Failure signature:** A desktop headline runs for three to five lines unnecessarily, ends as a full marketing sentence, leaves large unused width beside it, isolates one or two words per line, or wraps early because of `<br>`, narrow `max-width`, nested spans, or nonbreaking spaces.
- **Detection:** Remove manual breaks and decorative width constraints, allow natural wrapping, then shorten the copy; compare at desktop, laptop, tablet, and mobile widths.
- **Exception:** User-supplied wording that must remain exact, or an explicitly requested editorial/poster composition. Even then, do not create accidental orphans or unused width.
- **Preferred response:** Compress first, size second, constrain measure only for readability, and let the browser wrap naturally.
- **Evidence:** Taste Skill v2 authoring policy; R2 typography findings on measure and hierarchy.

### Interaction and behavior

### INT-001 - Dead link or CTA
- **Level:** HARD BAN
- **Rule:** Every visible link and CTA must reach a valid destination or perform its stated action.
- **Failure signature:** `href="#"`, missing route, 404, click handler stub, or button with no effect.
- **Detection:** Crawl links and activate every control in a browser test.
- **Exception:** Disabled or unavailable actions with honest state and explanation.
- **Preferred response:** Implement the destination, mark the action unavailable, or remove it.
- **Evidence:** R1 B-01 and B-02; R4 Interaction failures.

### INT-002 - Cosmetic-only control
- **Level:** HARD BAN when presented as functional
- **Rule:** A tab, filter, switch, search field, pagination control, or selector must change the corresponding content or state.
- **Failure signature:** Active styling changes but data, media, URL, or accessible state does not.
- **Detection:** Assert the expected state or content change after activation.
- **Exception:** Static design mockups clearly labeled as non-functional.
- **Preferred response:** Implement the smallest honest behavior or render a non-interactive representation and list it as unconnected in the handoff report.
- **Evidence:** R1 B-06; R4 2.1 and 2.13.

### INT-003 - Fake form submission or unconditional success
- **Level:** HARD BAN
- **Rule:** Never show success unless the action succeeded, and never discard user input silently.
- **Failure signature:** Timeout-based success toast, form with no endpoint, swallowed failure, or submit button outside a real form.
- **Detection:** Test success, validation, server error, offline, timeout, retry, and duplicate submission paths.
- **Exception:** A design-only form may remain unconnected when the interface visibly says that it is a demo and submission is not connected. It must not show a false success state or imply persistence.
- **Preferred response:** Connect the action when implementation is in scope. Otherwise disable or honestly explain submission and list the required endpoint, validation, persistence, and delivery behavior in the handoff report.
- **Evidence:** R1 B-03 and B-04; R4 2.2, 2.11-2.12, 7.6-7.10.

### INT-004 - Fabricated live state
- **Level:** HARD BAN
- **Rule:** Do not label hardcoded or random values as live, synced, secure, online, or real-time.
- **Failure signature:** Perpetual pulse, fake activity feed, static uptime, or timer-backed data unrelated to a source.
- **Detection:** Trace the displayed state to authoritative data and verify update semantics.
- **Exception:** Explicit demo or sample data with a visible label in an explicitly requested prototype.
- **Preferred response:** Show actual state, explain freshness, remove the live claim, or use a clearly labeled sample and list the missing data source in the handoff report.
- **Evidence:** R1 B-05; R4 2.3.

### INT-005 - Mouse-only pseudo-control
- **Level:** HARD BAN
- **Rule:** Actions must use native buttons or links and remain operable through keyboard, assistive technology, touch, and pointer input.
- **Failure signature:** Click handler on `div`, `span`, or `li`; pointerdown-only action; role-button without complete keyboard behavior.
- **Detection:** Static lint plus an unplugged-mouse walkthrough using Tab, Enter, and Space.
- **Exception:** Event delegation around native controls or managed composite-widget descendants.
- **Preferred response:** Use `<button>` for actions and `<a href>` for navigation.
- **Evidence:** R1 A-01; R4 2.5 and 5.1; WCAG 2.2 SC 2.1.1.

### INT-006 - Hover-gated content without keyboard or touch path
- **Level:** HARD BAN
- **Rule:** Menus, previews, and required information revealed on hover must also work through focus and touch.
- **Failure signature:** `group-hover` submenu, hover-only tooltip, or preview that disappears across a pointer gap.
- **Detection:** Keyboard, touch emulation, Escape, and pointer-path tests.
- **Exception:** Redundant decorative effects whose information and action remain available elsewhere.
- **Preferred response:** Add a real toggle, focus behavior, persistent hover path, and dismissal semantics.
- **Evidence:** R4 2.6 and 4.4; WCAG 2.2 SC 1.4.13 and 2.1.1.

### INT-007 - Menu or overlay without complete dismissal
- **Level:** HARD BAN
- **Rule:** Non-persistent overlays must close on Escape, outside activation where appropriate, trigger reactivation, and route change.
- **Failure signature:** Orphaned menu, stale overlay after navigation, leaked listener, or focus left behind it.
- **Detection:** Browser tests for every open and close path plus focus restoration.
- **Exception:** Persistent navigation that does not obscure content.
- **Preferred response:** Centralize open state and implement symmetric cleanup and focus return.
- **Evidence:** R4 2.7; APG Menu and Menu Button patterns.

### INT-008 - Broken modal contract
- **Level:** HARD BAN
- **Rule:** Modal dialogs must establish initial focus, contain focus, label themselves, dismiss safely, prevent background interaction, and restore focus.
- **Failure signature:** Focus leaks behind the modal, Escape fails, background scrolls, or backdrop click destroys unsaved work.
- **Detection:** Keyboard cycle, screen-reader announcement, scroll, stacked-modal, and destructive-dismiss tests.
- **Exception:** Non-modal popovers must not claim modal semantics.
- **Preferred response:** Use the native dialog element or an established accessible dialog primitive.
- **Evidence:** R1 A-02; R4 2.8-2.9 and 5.4; APG Dialog pattern.

### INT-009 - Accessible state contradicts visible state
- **Level:** HARD BAN
- **Rule:** Update visual, behavioral, and ARIA state together.
- **Failure signature:** `aria-expanded="false"` on an open menu, cosmetic disabled state, switch that does not change value, or hidden content remaining focusable.
- **Detection:** Inspect accessibility tree and DOM state after every interaction.
- **Exception:** None for contradictory state; transitional state must still be represented honestly.
- **Preferred response:** Derive all representations from one source of truth.
- **Evidence:** R4 2.10 and 5.8; WCAG 2.2 SC 4.1.2.

### INT-010 - Missing loading, empty, error, pending, or rollback behavior
- **Level:** HARD BAN when omission causes silent failure or data loss
- **Rule:** Implement only the states the feature can actually enter, but cover all real asynchronous and empty outcomes.
- **Failure signature:** Blank section, infinite spinner, duplicate mutation, optimistic update without rollback, or empty table with no explanation.
- **Detection:** Force slow, empty, failed, offline, repeated, and cancelled scenarios.
- **Exception:** Pure static content with no asynchronous or mutable state.
- **Preferred response:** Match feedback to the wait: preserve the final layout with a skeleton when structure is known, use a compact spinner for short indeterminate waits, show progress only when measurable, and always preserve user input and recovery paths.
- **Evidence:** R1 B-08 and I-11; R4 Validation and QA failures.

### INT-011 - Modal used for an ordinary inline task
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not open a modal for every edit, explanation, confirmation, or secondary action.
- **Failure signature:** Simple field changes, help text, filters, or low-risk actions repeatedly interrupt context and create nested overlays.
- **Detection:** Try inline editing, expansion, disclosure, a popover, or a dedicated page and compare interruption and focus complexity.
- **Exception:** Use a modal when the task genuinely requires focused attention, blocking confirmation, or a bounded temporary workflow.
- **Preferred response:** Choose the least disruptive surface that preserves context and still meets the complete modal contract when a dialog is necessary.
- **Evidence:** R5 redesign and component anti-pattern audit; complements INT-008.

### INT-012 - Browser alert used as application feedback
- **Level:** AVOID BY DEFAULT; HARD BAN when it loses context or blocks recovery
- **Rule:** Do not use `window.alert()`, `confirm()`, or `prompt()` as routine form, validation, error, or success UI.
- **Failure signature:** Browser chrome replaces contextual feedback, cannot point to the failing field, blocks interaction, or communicates no recovery path.
- **Detection:** Search browser-dialog APIs and trigger every validation, destructive, failure, and success path.
- **Exception:** A tiny internal diagnostic or deliberate no-UI prototype may use a browser dialog when the limitation is disclosed and replacement is out of scope.
- **Preferred response:** Use inline field errors, contextual status, toast for transient non-critical feedback, or an accessible confirmation dialog for destructive actions.
- **Evidence:** R5 redesign interaction audit.

### INT-013 - Missing hover, active, or current-state feedback
- **Level:** HARD BAN when state becomes ambiguous; otherwise AVOID BY DEFAULT
- **Rule:** Interactive elements must expose the feedback relevant to their input and state, including hover where a pointer exists, visible press or activation, focus, disabled state, selection, and current location.
- **Failure signature:** Buttons feel inert, selected tabs look identical, active navigation is invisible, or a control appears disabled without behaving as disabled.
- **Detection:** Walk every state with pointer, keyboard, touch, and assistive technology; compare visual and programmatic state.
- **Exception:** A state with no meaningful visual distinction is unnecessary, and hover must never be the only feedback path.
- **Preferred response:** Design a small coherent state set whose visual, behavioral, and accessible representations share one source of truth.
- **Evidence:** R5 redesign state audit; complements INT-005, INT-006, INT-009, and ACC-008.

### Motion

### MOT-001 - Animation everywhere
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not animate every section, card, icon, and background simply to signal polish.
- **Failure signature:** Page-wide fade-up, floating decorations, animated gradients, pulsing dots, and hover lifts applied indiscriminately.
- **Detection:** Remove each animation and ask whether hierarchy, continuity, feedback, or explanation becomes worse.
- **Exception:** Entertainment and experimental experiences where motion is the medium and accessibility remains intact.
- **Preferred response:** Choose two or three motion behaviors with distinct jobs.
- **Evidence:** R1 V-07; R4 Motion findings.

### MOT-002 - One reveal animation repeated across the page
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not use the same viewport fade and upward offset on most sections.
- **Failure signature:** Every block begins hidden and replays the same entrance.
- **Detection:** Inventory motion family by section; flag monoculture and delayed access to essential content.
- **Exception:** A restrained single reveal language used on a small page without blocking content.
- **Preferred response:** Keep ordinary content visible and use state substitution, mask, shared movement, or no motion according to role.
- **Evidence:** R1 V-07; R4 3.8.

### MOT-003 - Motion ignores user preference
- **Level:** HARD BAN
- **Rule:** Respect `prefers-reduced-motion` across CSS, JavaScript, and animation libraries without breaking state changes.
- **Failure signature:** Parallax, travel, autoplay, or continuous movement persists after reduced motion is enabled.
- **Detection:** Emulate the preference and test every animated component and navigation transition.
- **Exception:** Essential progress indicators may remain if reduced to non-vestibular feedback.
- **Preferred response:** Remove travel and continuous movement while preserving information and response.
- **Evidence:** R1 A-09; R4 3.3-3.4 and 5.14; WCAG 2.2 SC 2.3.3.

### MOT-004 - Scrolljacking and mandatory full-page snapping
- **Level:** HARD BAN when native navigation is blocked; otherwise CONTEXTUAL WARNING
- **Rule:** Do not intercept wheel or touch input to replace normal document scrolling without a compelling interaction need.
- **Failure signature:** Prevented wheel events, forced slide transitions, trapped horizontal scene, or inaccessible in-between content.
- **Detection:** Test keyboard, touchpad, touch, Page Up/Down, anchor links, browser find, and reduced motion.
- **Exception:** A deliberately immersive, exceptionally polished scrollytelling sequence may control progress when requested or conceptually justified. It still needs clear escape, keyboard and touch support, reachable intermediate content, anchor behavior, reduced-motion handling, and an equivalent navigation path.
- **Preferred response:** Preserve native document scroll by default. Use controlled scrolling only when it materially creates the experience and survives full interaction, accessibility, and performance testing.
- **Evidence:** R4 3.5-3.7.

### MOT-005 - Layout-property animation in hot paths
- **Level:** CONTEXTUAL WARNING; HARD BAN when it causes sustained jank
- **Rule:** Prefer transform and opacity for frequent motion; profile width, height, top, left, filter, clip, and shadow animation instead of banning them categorically.
- **Failure signature:** Per-frame layout reads and writes, scroll-linked React state, or animated geometry across large trees.
- **Detection:** Performance trace for layout, paint, long tasks, and dropped frames.
- **Exception:** Small, infrequent, measured transitions where layout animation is required.
- **Preferred response:** Use FLIP, transforms, containment, or a simpler state change.
- **Evidence:** R4 3.9 and 6.13-6.14.

### MOT-006 - Leaked listeners, timers, animation frames, or instances
- **Level:** HARD BAN
- **Rule:** Every subscription, timer, animation frame, and animation instance must have symmetric cleanup and lifecycle ownership.
- **Failure signature:** Duplicate animation after navigation, background work in hidden tabs, stale closure, or increasing CPU use.
- **Detection:** Mount and unmount repeatedly; inspect listener counts, timers, and performance recordings.
- **Exception:** Process-lifetime services intentionally owned by the application root.
- **Preferred response:** Keep the owner explicit and clean up in the same lifecycle scope.
- **Evidence:** R4 3.10 and 6.11.

### MOT-007 - Repaint-heavy effects and indiscriminate layer promotion
- **Level:** CONTEXTUAL WARNING
- **Rule:** Do not animate large blur, backdrop-filter, shadow, or filter surfaces or apply permanent `will-change` without measurement.
- **Failure signature:** Large glowing blobs, scrolling glass layers, many promoted cards, and high GPU memory use.
- **Detection:** Test lower-end hardware and inspect paint, compositing, memory, and frame rate.
- **Exception:** Small, isolated, short-lived effects that meet performance budgets.
- **Preferred response:** Pre-render atmosphere, reduce affected area, animate a composited proxy, and remove `will-change` after use.
- **Evidence:** R1 V-03; R4 3.11 and 6.13.

### MOT-008 - Motion blocks or contradicts interaction
- **Level:** HARD BAN when input is delayed or state becomes incorrect
- **Rule:** Motion must be interruptible, retargetable, and secondary to user input.
- **Failure signature:** Button disabled until animation completes, conflicting tweens, long exits, non-settling spring, or state jump unannounced.
- **Detection:** Repeat and reverse interactions rapidly; test keyboard activation during animation.
- **Exception:** A brief, safety-critical transition may gate input when the reason is communicated.
- **Preferred response:** Make feedback immediate, exits faster than entrances, and animation derive from current state.
- **Evidence:** R4 3.12-3.13.

### MOT-009 - Continuous input routed through render state
- **Level:** CONTEXTUAL WARNING; HARD BAN when it causes sustained jank or feedback lag
- **Rule:** Do not route scroll position, pointer coordinates, drag progress, magnetic hover, or animation-frame values through component render state on every frame.
- **Failure signature:** Raw scroll handlers call state setters, `requestAnimationFrame` mutates React state, or the page rerenders large trees during pointer movement.
- **Detection:** Profile renders while scrolling, dragging, and moving the pointer; search scroll, pointer, and rAF callbacks for state updates.
- **Exception:** Low-frequency derived state such as a section index or threshold crossing may update component state when measured and debounced appropriately.
- **Preferred response:** Use CSS, IntersectionObserver, animation-library motion values, refs, or an external frame loop that updates only the animated target.
- **Evidence:** R4 performance findings; R5 existing skill motion audit.

### MOT-010 - Conflicting animation ownership and unnecessary layout measurement
- **Level:** AVOID BY DEFAULT; HARD BAN when state or cleanup becomes incorrect
- **Rule:** Do not let multiple animation runtimes control the same element or attach layout-measurement features to static content without a transition need.
- **Failure signature:** GSAP, Motion, CSS transitions, and custom rAF compete for transforms; static trees carry layout props; route changes leave orphaned timelines.
- **Detection:** Inventory animation ownership per element, inspect layout measurements, navigate repeatedly, and verify teardown.
- **Exception:** Separate runtimes may coexist in isolated boundaries with explicit ownership, cleanup, and no shared properties.
- **Preferred response:** Choose one owner per property and interaction, keep advanced runtimes isolated, and enable layout measurement only for real shared-element or reordering transitions.
- **Evidence:** R5 animation-library and layout-transition audit; complements MOT-006.

### MOT-011 - Custom cursor as decorative substitution
- **Level:** AVOID BY DEFAULT; HARD BAN when the native pointer, focus, selection, or input feedback is lost
- **Rule:** Do not replace the system cursor merely to make a site feel experimental.
- **Failure signature:** Delayed follower, hidden pointer, unreadable cursor state, touch artifacts, or cursor animation competing with actual controls.
- **Detection:** Test links, text selection, inputs, drag, zoom, touch, reduced motion, and low-frame-rate hardware.
- **Exception:** A requested immersive or creative experience may augment the cursor when native semantics remain clear and the effect disables cleanly where inappropriate.
- **Preferred response:** Keep the native cursor and use local hover feedback unless cursor behavior is central to the concept.
- **Evidence:** R5 visual and interaction audit.

### Responsive design and accessibility

### ACC-001 - Fixed width or minimum width creates horizontal overflow
- **Level:** HARD BAN
- **Rule:** Pages must reflow at narrow widths without two-dimensional document scrolling.
- **Failure signature:** Fixed panels, oversized code, media, or grid min-width pushes the viewport horizontally.
- **Detection:** Automated overflow probe plus visual inspection at 320 CSS pixels and intermediate widths.
- **Exception:** A bounded table, map, or canvas may scroll internally with clear containment and labels.
- **Preferred response:** Use intrinsic sizing, wrapping, responsive constraints, and component-level overflow.
- **Evidence:** R1 I-04; R4 4.1; WCAG 2.2 SC 1.4.10.

### ACC-002 - Desktop grid compressed instead of recomposed
- **Level:** HARD BAN when content becomes unreadable or unusable
- **Rule:** Define a deliberate mobile order and composition for every multi-column section.
- **Failure signature:** Tiny columns, collapsed hierarchy, reordered CTA, or media separated from its explanation.
- **Detection:** Inspect content order, focus order, readable width, and action proximity on mobile.
- **Exception:** Simple two-column data where horizontal comparison must be preserved in a contained scroller.
- **Preferred response:** Sequence by meaning, merge or remove secondary content, and resize media around its job.
- **Evidence:** R3 mobile guidance; R4 4.2.

### ACC-003 - Mobile navigation is decorative or incomplete
- **Level:** HARD BAN
- **Rule:** Mobile navigation must open, close, label state, expose every required destination, manage focus, and survive route changes.
- **Failure signature:** Dead hamburger, clipped menu, no Escape, hidden links, or focus trapped behind the panel.
- **Detection:** Touch and keyboard end-to-end navigation tests.
- **Exception:** A page with no secondary destinations may not need a menu.
- **Preferred response:** Use a native disclosure or tested accessible primitive.
- **Evidence:** R4 4.3; R3 Navigation.

### ACC-004 - Hover-only information or action
- **Level:** HARD BAN
- **Rule:** No required content or action may depend on hover capability.
- **Failure signature:** Hover card reveals the only CTA, title, preview, or submenu.
- **Detection:** Test touch, keyboard focus, coarse pointer, and hover-disabled media queries.
- **Exception:** Redundant decorative response.
- **Preferred response:** Keep core information visible and provide focus or tap alternatives.
- **Evidence:** R4 4.4; WCAG 2.2 SC 2.1.1.

### ACC-005 - Whole-page scrolling caused by wide data
- **Level:** HARD BAN
- **Rule:** Tables, code, charts, and canvases must not force the entire page into horizontal scrolling.
- **Failure signature:** A single wide component expands document width.
- **Detection:** Overflow probe and keyboard access to contained scroll regions.
- **Exception:** None for document-wide overflow; internal scrolling may be appropriate.
- **Preferred response:** Group table criteria, provide responsive summaries, or contain and label the scroller.
- **Evidence:** R4 4.5; WCAG 2.2 SC 1.4.10.

### ACC-006 - Undersized or crowded targets
- **Level:** HARD BAN
- **Rule:** Interactive targets must meet WCAG 2.2 target-size requirements or valid spacing exceptions.
- **Failure signature:** Tiny icon buttons, cramped pagination, or adjacent links with no separation.
- **Detection:** Measure rendered target bounds and spacing at touch breakpoints.
- **Exception:** Inline text links and other explicit WCAG exceptions.
- **Preferred response:** Increase hit area without necessarily increasing the visible glyph.
- **Evidence:** R1 A-11; R4 4.6, 5.13; WCAG 2.2 SC 2.5.8.

### ACC-007 - Zoom blocked or mobile viewport misconfigured
- **Level:** HARD BAN
- **Rule:** Do not disable user scaling or omit a correct viewport declaration.
- **Failure signature:** `user-scalable=no`, low `maximum-scale`, or desktop-width rendering on mobile.
- **Detection:** Inspect viewport metadata and test pinch zoom.
- **Exception:** None for ordinary web content.
- **Preferred response:** Use a standard responsive viewport and layouts that tolerate zoom.
- **Evidence:** R4 4.7; WCAG 2.2 SC 1.4.4.

### ACC-008 - Focus visibility removed
- **Level:** HARD BAN
- **Rule:** Every keyboard-focusable control must have a visible focus indicator with sufficient area and contrast.
- **Failure signature:** `outline-none` with no replacement or focus hidden by clipping.
- **Detection:** Tab through every control in every theme and state.
- **Exception:** Focus may be visually suppressed only for non-keyboard focus when a robust `:focus-visible` treatment remains.
- **Preferred response:** Use a consistent focus token that survives backgrounds and component boundaries.
- **Evidence:** R1 A-08; R4 5.3; WCAG 2.2 SC 2.4.7 and 2.4.11.

### ACC-009 - Missing native semantics or accessible name
- **Level:** HARD BAN
- **Rule:** Use native elements and ensure every control, image, region, and form field has the correct accessible name and role.
- **Failure signature:** Clickable div, unlabeled icon, placeholder-as-label, empty link, or custom widget with partial ARIA.
- **Detection:** Semantic lint, accessibility-tree inspection, axe, and screen-reader smoke test.
- **Exception:** Custom composite widgets only when their complete APG interaction contract is implemented.
- **Preferred response:** Native HTML first; ARIA only to fill a real semantic gap.
- **Evidence:** R1 A-01-A-04; R4 5.1-5.2 and 5.8; WCAG 2.2 SC 1.3.1, 3.3.2, 4.1.2.

### ACC-010 - Incorrect alternative text
- **Level:** HARD BAN
- **Rule:** Meaningful images need concise purpose-aware alternatives; decorative images need empty alternatives and no redundant announcement.
- **Failure signature:** Filename alt, invented visual details, duplicated caption, or missing alt on meaningful media.
- **Detection:** Review each image in context with images disabled and a screen reader.
- **Exception:** Complex visualizations may need a short alt plus a nearby detailed description.
- **Preferred response:** Describe the information or function, not every pixel.
- **Evidence:** R1 A-06; R2 Imagery; WCAG 2.2 SC 1.1.1.

### ACC-011 - ARIA misuse and structural collapse
- **Level:** HARD BAN
- **Rule:** Do not add redundant roles, invalid attributes, landmark soup, skipped heading structure, or `aria-hidden` around focusable content.
- **Failure signature:** Accessibility layer contradicts native semantics or destroys document navigation.
- **Detection:** HTML validator, axe, accessibility-tree review, and heading/landmark outline.
- **Exception:** Valid APG composite patterns with tested semantics.
- **Preferred response:** Simplify to native structure and use ARIA sparingly.
- **Evidence:** R1 A-07 and A-10; R4 5.7-5.9.

### ACC-012 - Reflow, zoom, or text-spacing overrides lose content
- **Level:** HARD BAN
- **Rule:** Content and controls must remain available under zoom, larger text, and WCAG text-spacing overrides.
- **Failure signature:** Fixed-height text box clips, ellipsis hides essential content, or controls overlap after spacing changes.
- **Detection:** Test 200% and 400% zoom, text-spacing bookmarklet, long localization, and user font overrides.
- **Exception:** Non-essential truncation with an accessible full-value mechanism.
- **Preferred response:** Avoid fixed heights on text, allow wrapping, and design intrinsic layouts.
- **Evidence:** R4 5.12 and 6.10; WCAG 2.2 SC 1.4.4, 1.4.10, 1.4.12.

### ACC-013 - Unstable full-viewport sizing on mobile
- **Level:** HARD BAN when content or controls become unreachable
- **Rule:** Do not assume legacy `100vh` or `h-screen` equals the visible mobile viewport when browser chrome, virtual keyboards, or safe areas change.
- **Failure signature:** Hero jumps, CTA drops below the screen, modal is clipped, or the keyboard hides focused controls.
- **Detection:** Test dynamic browser bars, orientation, virtual keyboard, safe-area insets, short landscape screens, and installed-app mode.
- **Exception:** `100vh` may be acceptable in a verified environment where the viewport is stable and no essential content depends on the edge.
- **Preferred response:** Use appropriate dynamic, small, or large viewport units, intrinsic minimum sizing, safe-area padding, and content-driven fallbacks.
- **Evidence:** R5 viewport-stability audit; complements ACC-001 and ACC-012.

### ACC-014 - Missing page orientation and escape paths
- **Level:** HARD BAN when users become trapped or cannot identify location; otherwise AVOID BY DEFAULT
- **Rule:** Larger sites and multi-page flows must provide the orientation aids their structure requires, including a skip link, current-page indication, useful back or parent paths, and a recoverable not-found route.
- **Failure signature:** Keyboard users repeat the whole header, active navigation is indistinguishable, detail pages dead-end, or a 404 offers no path forward.
- **Detection:** Traverse the site by keyboard and direct URLs, open nested pages, and request a missing route.
- **Exception:** A tiny single-page experience may not need every mechanism when equivalent orientation and navigation already exist.
- **Preferred response:** Add only the structural aids the information architecture needs and expose current state visually and programmatically.
- **Evidence:** R5 redesign, navigation, and accessibility audit.

### Frontend implementation and QA

### ENG-001 - Hydration and first-paint mismatch
- **Level:** HARD BAN
- **Rule:** Server and client output must agree on initial render.
- **Failure signature:** Hydration warning, flicker, duplicated content, or client-only value rendered during SSR.
- **Detection:** Clean-console production test with hard reload and JavaScript timing variations.
- **Exception:** Deliberately client-only islands isolated behind stable fallbacks.
- **Preferred response:** Move nondeterministic values after hydration or supply deterministic server state.
- **Evidence:** R1 I-02; R4 6.6.

### ENG-002 - Scaffold and metadata debris
- **Level:** HARD BAN for broken identity or discovery; otherwise quality failure
- **Rule:** Replace default title, favicon, description, social metadata, manifest values, and starter content before shipping.
- **Failure signature:** "Vite + React", framework favicon, empty description, or copied template metadata.
- **Detection:** Inspect document head, manifest, sharing preview, and production build.
- **Exception:** Local prototypes that are not published.
- **Preferred response:** Use real product metadata and assets.
- **Evidence:** R1 I-03 and C-05.

### ENG-003 - Codebase generated as one disposable component
- **Level:** AVOID BY DEFAULT; HARD BAN when it blocks correctness or maintenance
- **Rule:** Do not keep a full page, data, state, event logic, and animation in one god component when natural boundaries already exist.
- **Failure signature:** Huge component, repeated markup, unused imports, arbitrary-value spam, and unrelated state updates.
- **Detection:** Trace rerender scope, repeated structures, and ownership of state and effects.
- **Exception:** A small static page where splitting would add ceremony without benefit.
- **Preferred response:** Extract only stable, repeated, stateful, or independently testable units.
- **Evidence:** R1 I-05; R4 6.7 and 6.14.

### ENG-004 - Hallucinated asset, route, endpoint, or configuration
- **Level:** HARD BAN
- **Rule:** Verify every import, asset path, route, environment variable, endpoint, and third-party package before use.
- **Failure signature:** Broken image, case-mismatched path, nonexistent API, invented environment variable, or uninstalled dependency.
- **Detection:** Production build, route crawl, asset check, and dependency inspection.
- **Exception:** Explicit placeholders confined to documented development fixtures.
- **Preferred response:** Reuse existing project resources or request the missing input.
- **Evidence:** R1 I-06-I-07; R4 6.2-6.3.

### ENG-005 - Client-rendered monolith for mostly static content
- **Level:** CONTEXTUAL WARNING
- **Rule:** Do not move the application root or static marketing content to the client merely to support one interaction.
- **Failure signature:** Root-level `use client`, spinner-first content, large bundle, and client-side fetch waterfall.
- **Detection:** Bundle analysis, server/client boundary inspection, and JavaScript-disabled rendering.
- **Exception:** Fully client-side applications whose state and offline behavior require it.
- **Preferred response:** Render static structure on the server and isolate interactive leaves.
- **Evidence:** R1 I-08; R4 6.4 and 6.6.

### ENG-006 - Asset delivery neglect
- **Level:** HARD BAN when it breaks loading or layout; otherwise performance failure
- **Rule:** Size, encode, prioritize, crop, and load media according to its rendered role.
- **Failure signature:** Multi-megabyte hero, missing dimensions, eager below-fold images, lazy hero, repeated crop, blurry enlargement, or base64 bloat.
- **Detection:** Network trace, rendered-size comparison, LCP inspection, CLS measurement, and breakpoint crop review.
- **Exception:** Deliberate high-fidelity media experiences with an explicit loading strategy and budget.
- **Preferred response:** Use responsive sources, dimensions, appropriate formats, priority for the actual LCP asset, and art-directed crops.
- **Evidence:** R1 I-09; R4 6.1-6.2.

### ENG-007 - Font loading and dependency bloat
- **Level:** CONTEXTUAL WARNING
- **Rule:** Do not load unused font families, weights, icon packs, or whole libraries for a small feature.
- **Failure signature:** Many font files, duplicate animation packages, barrel imports, dead dependencies, and blocking third-party scripts.
- **Detection:** Bundle and network analysis plus dependency usage audit.
- **Exception:** Brand-critical variable fonts or libraries used broadly enough to justify their cost.
- **Preferred response:** Subset, self-host where appropriate, use variable fonts deliberately, and reuse installed dependencies.
- **Evidence:** R1 I-10 and I-12; R4 6.3.

### ENG-008 - Brittle CSS and stacking workarounds
- **Level:** HARD BAN when content breaks; otherwise AVOID BY DEFAULT
- **Rule:** Do not solve ordinary layout with magic fixed heights, fragile percentage `calc()` chains, escalating z-index, `!important` chains, or global selectors that override component boundaries.
- **Failure signature:** Text clips after copy changes, flex widths require repeated arithmetic, overlays disappear under accidental stacking contexts, and theme values bypass tokens.
- **Detection:** Long-copy, zoom, localization, overlay, and specificity tests.
- **Exception:** A documented fixed scene or third-party integration may require a scoped workaround.
- **Preferred response:** Use grid or intrinsic layout, explicit layer tokens, component scope, and semantic variables.
- **Evidence:** R4 6.9-6.12.

### ENG-009 - Insecure client-side trust boundary
- **Level:** HARD BAN
- **Rule:** Never expose secrets, rely on client-only authorization, trust unvalidated input, or omit required database access controls.
- **Failure signature:** Secret in bundle, authorization only in UI, direct privileged endpoint, or missing row-level policy.
- **Detection:** Secret scan, bundle inspection, server authorization test, and data-policy review.
- **Exception:** Public identifiers and intentionally public read-only data.
- **Preferred response:** Enforce validation and authorization on the server and use least privilege.
- **Evidence:** R1 I-13; R4 engineering findings.

### ENG-010 - Shipping without rendered and functional QA
- **Level:** HARD BAN for completion claims
- **Rule:** Do not declare a visual frontend complete after source review alone, and do not hide unfinished content, placeholders, static controls, or missing integrations from the handoff.
- **Failure signature:** Broken crop, overflow, dead menu, invisible focus, console error, blank state, or metadata defect survives because no browser was used.
- **Detection:** Production build, desktop and mobile render, intermediate-width inspection, console/network review, keyboard walkthrough, interaction test, accessibility scan, and measured LCP, INP, and CLS where the environment allows it.
- **Exception:** None for a completion claim; unavailable browser evidence must be disclosed as provisional.
- **Preferred response:** Inspect the rendered result, fix the implementation, rerun the checks, and provide a short `Still needed` report for everything intentionally left incomplete.
- **Evidence:** R4 Validation and QA; R1 Executive Summary; prior Taste Skill A/B findings.

### ENG-011 - Design-system collision or needless reimplementation
- **Level:** AVOID BY DEFAULT; HARD BAN when behavior, accessibility, or theming breaks
- **Rule:** Do not mix unrelated component systems in one product surface or rebuild an official system's complex components from appearance alone when its maintained implementation is available and appropriate.
- **Failure signature:** Material, Carbon, Fluent, Bootstrap, and shadcn conventions coexist; focus behavior differs by component; tokens are imported and then almost entirely overridden.
- **Detection:** Inventory component packages, token sources, interaction contracts, CSS resets, and duplicate primitives.
- **Exception:** A migration may temporarily bridge systems behind explicit boundaries, and a custom aesthetic may build native components when no official system is required.
- **Preferred response:** Choose one primary system, use official packages for its intended ecosystem, customize through supported tokens, and isolate any migration adapter.
- **Evidence:** R5 design-system and component-library audit; complements VIS-015.

### ENG-012 - Fragile production font delivery
- **Level:** CONTEXTUAL WARNING; HARD BAN when text disappears or layout becomes unusable
- **Rule:** Do not ship unverified external font links, missing weights, blocking loads, or fallbacks whose metrics cause severe layout shift.
- **Failure signature:** Flash of invisible text, broken cross-origin request, synthetic weight, clipped fallback, or CTA and navigation reflow after font load.
- **Detection:** Test cold cache, blocked font host, slow network, fallback rendering, `font-display`, and CLS.
- **Exception:** A reliable hosted font service is valid when privacy, performance, licensing, caching, and fallback behavior meet the project requirements.
- **Preferred response:** Load only needed families and weights through the framework or a controlled host, define robust fallbacks, and verify failure behavior.
- **Evidence:** R5 font-delivery audit; complements ENG-007.

### ENG-013 - Silent redesign damage
- **Level:** HARD BAN
- **Rule:** During a redesign, do not silently change URLs, route slugs, anchor IDs, information architecture, primary navigation labels, form field names or order, brand marks, legal or consent copy, analytics hooks, SEO metadata, structured data, or existing accessibility behavior.
- **Failure signature:** Visual modernization breaks bookmarks, search ranking, autofill, tracking, consent, recognition, or keyboard access.
- **Detection:** Capture a before-state inventory and compare routes, content, forms, identifiers, metadata, analytics, legal surfaces, and accessibility behavior after the redesign.
- **Exception:** Change an item when the user explicitly approves its scope and the migration, redirect, tracking, content, and compliance consequences are handled.
- **Preferred response:** Preserve first, then modernize typography, spacing, color, motion, and composition; replace structure only where the agreed redesign requires it.
- **Evidence:** R5 redesign protocol audit.

### ENG-014 - Unnecessary framework or stack migration
- **Level:** AVOID BY DEFAULT; HARD BAN when it destroys working behavior or data
- **Rule:** Do not migrate frameworks, styling systems, state libraries, or build tools merely to make a visual redesign easier.
- **Failure signature:** A targeted design task becomes a rewrite, dependencies multiply, working routes regress, and review scope expands without user value.
- **Detection:** Compare the requested outcome with the minimum change possible in the existing stack.
- **Exception:** Migrate when explicitly requested or when the current stack demonstrably blocks required correctness, maintainability, security, or performance and the user accepts the scope.
- **Preferred response:** Reuse the existing stack and change the smallest shared layer that produces the required visual and behavioral result.
- **Evidence:** R5 redesign implementation audit.

### ENG-015 - Incomplete code disguised as delivery
- **Level:** HARD BAN when complete implementation was requested
- **Rule:** Do not replace requested files, components, repeated sections, or functional logic with ellipses, `TODO`, skeleton-only output, one example, or prose describing what remains.
- **Failure signature:** `rest omitted`, missing middle sections, placeholder handlers, shortened later files, or a conclusion claiming completion after partial output.
- **Detection:** Compare every requested deliverable with the emitted files and search production-bound code for omission markers and placeholder logic.
- **Exception:** A deliberately scoped prototype or user-approved partial delivery is valid when its boundary and remaining work are explicit.
- **Preferred response:** Deliver the complete requested scope, split output cleanly when necessary, and continue exactly where interrupted without repeating or compressing later work.
- **Evidence:** R5 full-output enforcement audit; complements CNT-005 and ENG-010.

### ENG-016 - Required legal, privacy, and consent surfaces omitted
- **Level:** HARD BAN when the project is legally or contractually required to provide them; otherwise CONTEXTUAL WARNING
- **Rule:** Do not invent legal text, but do not silently omit required privacy, terms, consent, disclosure, or contact surfaces from a production-bound implementation.
- **Failure signature:** Tracking or regulated collection is enabled without the required notice or control, or a redesign drops existing legal links and consent behavior.
- **Detection:** Inspect existing requirements, enabled data collection, supplied jurisdictional guidance, and the pre-redesign footer and consent flows.
- **Exception:** A design-only prototype may use a clearly labeled placeholder and report that reviewed legal copy is still required.
- **Preferred response:** Preserve approved copy and behavior, request the missing legal input, use a neutral placeholder only in prototypes, and list the gap in the handoff report.
- **Evidence:** R5 redesign and production-completeness audit; legal review remains project-specific.

## 4. Automatic checks

Automate only what can be checked reliably. A linter cannot decide whether a purple palette fits a brand.

### Text and repository search

- Production-bound placeholder links and copy: `href="#"`, `javascript:void`, `lorem`, `TODO`, framework starter titles, temporary image domains. Allow clearly labeled placeholders in explicit design fixtures.
- Gradient text: `bg-clip-text`, `background-clip: text`, transparent text without forced-colors fallback.
- Mouse-only controls: click or pointer handlers on static elements.
- Focus removal: `outline-none` or `outline: none` without a visible replacement.
- Zoom blocking: `user-scalable=no`, restrictive `maximum-scale`.
- Suspicious fixed layout: large `min-width`, fixed text-bearing heights, repeated magic offsets.
- Viewport hazards: `h-screen`, unqualified `100vh`, missing safe-area handling on edge-bound controls.
- Motion hazards: raw wheel prevention, scroll listeners that update render state, rAF state loops, permanent `will-change`, large animated filters, multiple runtimes controlling the same property.
- State defects: placeholder success timers, hardcoded live labels, disabled-looking controls without native disabled state.
- Feedback defects: routine `window.alert`, `window.confirm`, or `window.prompt`; missing current-page state.
- Framework defects: root-level client boundary, SSR-unsafe globals, unstable list keys, uncleaned subscriptions, unrelated component-system imports.
- Delivery omissions: `rest omitted`, ellipses in requested code, placeholder handlers, and unexplained production `TODO` markers.
- Font hazards: blocking external font links, missing `font-display`, unused families and weights.
- Security defects: exposed secrets, client-only authorization, privileged endpoints from the browser.

### Build and browser automation

- Production build and typecheck.
- Broken route, link, import, and asset crawl.
- Console and network error capture.
- Horizontal-overflow probe at representative and in-between widths.
- CTA and primary desktop-navigation wrapping checks.
- Hero first-viewport and content-stack inspection.
- Image intrinsic-size, crop, LCP, INP, and layout-shift checks.
- Keyboard activation and focus-order tests.
- Menu, dialog, form, tab, filter, carousel, and route-change state tests.
- Current-page, skip-link, nested-route, back-path, and not-found-route tests where applicable.
- Slow, empty, error, offline, cancelled, and duplicate-submission scenarios.
- Cold-cache, blocked-font, fallback-font, and slow-font tests.
- axe or equivalent accessibility scan, followed by manual checks.
- Reduced-motion and forced-colors emulation.

## 5. Human visual checks

- Does the result follow the explicit user request and supplied content before applying default-avoidance heuristics?
- Does the page still make sense after replacing the logo and company name? If yes, what is insufficiently subject-specific?
- Does every section have a necessary information or decision job?
- Is any eyebrow, kicker, overline, or pretitle present? Remove it.
- Does every text fragment provide necessary meaning or function rather than decoration?
- Can any headline become shorter without losing meaning, or is it wrapping before the available width requires it?
- Is there one coherent palette, type voice, shape language, imagery direction, and motion language?
- Does the first viewport identify subject, value, and next action?
- Is the hero focused, or is it also carrying feature lists, pricing, logo walls, trust strips, and secondary metadata?
- Do identical CTA intents use one clear label, and do CTAs and primary desktop navigation stay on one line?
- Does one object, product state, artifact, workflow, or body of evidence persist through the page?
- Are more than two major sections using the same composition or reveal?
- Is any split header, long list, row-divider wall, score bar, rotated label, crosshair, or image tag present only to fill a composition?
- Are cards representing discrete objects, or merely enclosing ordinary text?
- Are imagery and crops art-directed for their actual slots and mobile transformations?
- Is proof attributable and proportionate, or merely trust decoration?
- Does the footer close the composition and provide real utility?
- Does motion clarify hierarchy, continuity, state, feedback, or narrative?
- Does each animated property have one owner, or are CSS, Motion, GSAP, and custom loops competing?
- Does mobile feel recomposed rather than compressed?
- Do full-height surfaces survive dynamic mobile browser chrome, keyboards, safe areas, and short landscape viewports?
- Does one component system, theme strategy, and font-delivery path remain coherent?
- Is every mock value, placeholder, static control, and unconnected integration clearly disclosed?

## 6. Required handoff report

When anything remains incomplete, end the delivery with a compact `Still needed` report. Include only applicable items:

- real copy, prices, metrics, testimonials, logos, permissions, or product data;
- final imagery, licensed stock replacement, or supplied brand assets;
- forms, endpoints, authentication, persistence, payments, email, analytics, or other integrations not connected;
- mock values, placeholders, static controls, or simulated states still present;
- browser, device, accessibility, performance, or production checks not completed.

Do not call an intentionally incomplete prototype production-ready. A design-only result can still be complete as a design when its implementation gaps are stated plainly.

## 7. Removed or rejected universal claims

The synthesis rejected these as universal bans:

- **Purple, gradients, dark mode, glass, bento, centered heroes, carousels, cards, FAQs, serif type, Inter, Lucide, or giant wordmarks are inherently bad.** They are patterns with saturation or implementation risks, not automatic defects.
- **Every landing page needs a fixed number of sections or layout families.** Page length and variation must follow the information journey.
- **Every page needs generated imagery.** Real product evidence, supplied assets, type, data, or an object-led composition may be stronger.
- **All animation must use transform and opacity.** Other properties can be appropriate when measured and scoped.
- **All scroll-linked animation is slop.** Orchestrated narratives can work when native access, performance, and reduced motion are preserved.
- **Em dashes, emojis, pills, status dots, or uppercase labels prove AI use.** Single tells are unreliable; only misuse and clustered defaults matter.
- **Every short label is an eyebrow.** Functional labels and real metadata remain valid; the ban targets decorative text placed above headings.
- **Familiar layouts are low quality.** Familiarity can reduce learning cost when the layout fits the task.
- **Visual novelty is the primary goal.** Credibility, comprehension, function, responsiveness, accessibility, and subject fit outrank novelty.

## 8. Highest-priority runtime rules

1. Follow the explicit user request, supplied content, existing project, and real product behavior.
2. Apply default-avoidance rules only where the user request and project leave the decision open.
3. Name the expected category template, then use, adapt, or reject it according to fit.
4. Use one coherent visual system derived from the subject, not generator defaults.
5. Make the first viewport identify the subject, value, and next action.
6. Keep the hero focused; move feature lists, pricing, logo walls, trust strips, and secondary metadata into later sections.
7. Keep CTA labels and primary desktop navigation readable on one line and use one label per CTA intent.
8. Never generate an eyebrow, kicker, overline, or pretitle above a heading.
9. Remove decorative text that provides no necessary meaning or function.
10. Compress headlines before styling them and never force premature wrapping.
11. Give every section one necessary job; remove filler sections.
12. Use split headers, long lists, dense tables, progress visuals, overlays, and absolute positioning only when their information or composition requires them.
13. Include subject-specific evidence that a generic template could not substitute.
14. Never present mock testimonials, people, logos, metrics, awards, claims, or live state as real. Clearly labeled sample content is allowed in explicitly requested design work.
15. Never present static decoration as functional product UI; clearly label design-only prototypes.
16. Every production-bound visible control must work and expose honest hover, focus, active, disabled, selected, and current state where applicable.
17. Use native semantics and complete accessible interaction contracts.
18. Preserve keyboard, touch, zoom, focus, contrast, reduced-motion, page orientation, and escape-path access.
19. Recompose multi-column layouts for mobile and use viewport units that survive dynamic browser chrome and keyboards.
20. Do not let one card, split, grid, or reveal skeleton dominate the page unless the requested concept depends on it.
21. Use cards, effects, and motion when they fit the requested direction or communicate hierarchy, material, state, continuity, or explanation.
22. Keep one animation owner per property and avoid continuous render-state updates from scroll, pointer, drag, or rAF.
23. Use one primary component system and avoid needless reimplementation or framework migration.
24. Verify every asset, dependency, route, endpoint, configuration value, font path, and required production surface.
25. Keep server-renderable content on the server and isolate interactive leaves when the stack supports it.
26. Implement real loading, empty, error, pending, success, cancellation, and rollback states where applicable, choosing skeleton, spinner, or progress by the actual wait.
27. Preserve routes, information architecture, forms, brand, legal copy, analytics, SEO, and accessibility behavior during redesigns unless change is approved.
28. Enforce authorization and validation at the trust boundary, never only in the client.
29. Deliver the full requested implementation without omission markers or prose standing in for code.
30. Build and inspect the real page at desktop, intermediate, mobile, keyboard, reduced-motion, and fallback-font conditions.
31. End with a `Still needed` report listing placeholders, missing content, static controls, unconnected integrations, and checks not completed.
32. Do not claim production completion until browser, interaction, console, performance, accessibility, and visual checks pass.

## 9. Synthesis conclusion

AI web slop is best understood as **unreviewed defaults plus missing truth and verification**, not as a fixed collection of forbidden aesthetics. The explicit user request and project reality come first. Most visual and structural patterns remain subject-fit tests, not bans. Clearly labeled mock content is valid for requested design work; presenting it as real is not. Taste Skill v2 additionally makes three narrow authoring-policy bans: no eyebrows, no decorative filler text, and no bloated or prematurely wrapped headlines. The durable corrective loop is: understand the request, choose deliberately, implement honestly, render, inspect, disclose unfinished work, and revise.
