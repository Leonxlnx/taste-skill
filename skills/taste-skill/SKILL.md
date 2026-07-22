---
name: design-taste-frontend
description: Design and build distinctive, studio-grade landing pages, portfolios, and content-led websites without generic AI patterns. Use for new sites, redesigns, page composition, brand direction, website copy, section layout, substantial component selection, project-bound imagery, responsive implementation, visual QA, and polished web motion. This skill turns references into adaptable design principles rather than copied templates.
---

# Taste Skill V2

Build the website as one coherent argument. Let the brief, content, audience, and available evidence determine the result. Never force a house style, a section quota, a fixed page sequence, or a numeric creativity preset.

## Operating principles

- Treat every rule as contextual except truthfulness, legal requirements, accessibility, and functional correctness.
- Follow explicit user intent when it conflicts with a stylistic preference.
- Use references to learn hierarchy, rhythm, relationships, and behavior. Do not copy a reference's brand, assets, copy, or exact coordinates.
- Prefer a smaller number of well-resolved ideas over many unrelated effects.
- Keep implementation compatible with the existing stack unless a change is necessary and approved.
- Design desktop and mobile as related compositions, not a desktop screenshot and its compressed copy.
- Use real content and real proof. When facts are missing, omit them or mark honest placeholders.
- For complete website builds, do not silently skip available asset-generation or component-library tools. Use them when they can materially improve the result, or state the concrete reason they were not used.
- For complete builds, the default quality target is a high-end independent studio, not a technically valid starter theme. Clean does not mean empty, flat, static, or generic.
- Treat anti-slop rules as guardrails, not the design concept. Passing a checklist is not the same as producing strong art direction.
- A successful build pass is not a successful design pass. Render, inspect, revise, and score the result before delivery.

## Route available specialist tools

For a complete website build, use available specialist skills and tools as part of this workflow instead of waiting for the user to name each one:

- Use the built-in `imagegen` skill when subject-specific imagery, product scenes, editorial art, cutouts, textures, or compositing layers would materially strengthen the direction. Generate project-bound assets, copy them into the project, and record the final prompts and paths.
- Search Taste Blocks by the role required in each section. Prefer substantial expressive systems over trivial primitives when the brief calls for a studio-grade result.
- After the static composition works, run `find-animation-opportunities` against the rendered interface, implement the highest-leverage findings, then continue the motion pass.
- Use `gsap` only for coordinated timelines, scroll-linked storytelling, spatial sequences, or other motion that CSS, WAAPI, or the existing framework cannot express cleanly.
- Run `review-animations` after implementation. Resolve every blocking finding before delivery.
- Apply `emil-design-eng` during the final interaction and polish pass for causality, interruption, physicality, and invisible-detail quality.

When parallel agents are available, use them for independent component discovery, asset exploration, or motion review. Keep one lead responsible for the page's art direction so parallel work does not fragment the result.

## Load the references

For a complete website task, read these files before implementation:

1. `references/quality.md` for the anti-slop audit, interaction, responsive, accessibility, and engineering gates.
2. `references/branding.md` for visual direction, color, typography, imagery, shape, and brand motion.
3. `references/copywriting.md` for content architecture, truthful claims, headings, CTA language, and interface text.
4. `references/layouts.md` for section selection and adaptable layout grammars.
5. `references/components.md` when selecting or adapting components, effects, shaders, controls, cards, and media treatments.
6. `references/taste-blocks.md` before searching or importing reusable Taste Blocks components.
7. `references/motion.md` before adding animation or reviewing an animated result.

Read only the references relevant to a narrower task. Do not partially invent a rule from memory when its reference exists.

## Workflow

### 1. Establish context and constraints

Read the brief, repository, supplied assets, existing brand, references, audience, page goal, and technical constraints. Determine:

- what the site must help a visitor understand or do;
- what facts, assets, routes, and interactions are real;
- which existing choices must be preserved in a redesign;
- what is missing and can safely remain a placeholder;
- whether the task is a landing page, portfolio, editorial site, company site, campaign, or another content-led website.

Ask a question only when the missing answer would materially change the result. Otherwise state the working assumption and continue.

### 2. Run the anti-slop audit

Use `references/quality.md` against the brief and any existing implementation. Identify likely defaults before designing: generic page sequences, interchangeable copy, automatic card grids, decorative proof, copied visual trends, fake functionality, weak mobile behavior, or effects without purpose.

Do not turn this audit into a list of universal bans. A familiar structure is valid when the content and user journey justify it. Reject reflex, not convention.

### 3. Establish the brand system

Use `references/branding.md` to define a compact direction before composing sections:

- strategic traits and the tension that makes the identity specific;
- color roles and neutrals;
- type roles and real font availability;
- spacing, grid, shape, border, and depth logic;
- image, illustration, icon, texture, and data-visual language;
- voice behavior and the motion character.

Translate this into reusable tokens. Do not choose a palette, font, or trend because it appears fashionable or because a category stereotypically uses it.

Before layout implementation, create a short asset plan. For every major visual slot, choose one of: supplied asset, real product evidence, generated image, licensed stock fallback, component-rendered visual, or intentional type-only treatment. When image-generation tools are available and suitable subject-specific imagery is missing, generate and use the required final assets; do not replace them with generic CSS circles, empty rectangles, fake dashboards, or decorative gradients. Copy project-bound outputs into the project and record their paths and prompts.

For a substantial eight-section studio-grade site, a useful asset plan commonly contains three to eight purposeful assets rather than one repeated hero image. Consider a hero world, supporting editorial scenes, product states, transparent cutouts, material textures, foreground/background layers, and alternate crops. Use masks, overlap, depth, parallax, background removal, and compositing only when they reinforce the concept and remain legible across widths.

### 4. Build the copy and content model

Use `references/copywriting.md`. Write or organize the content before polishing layouts.

- Define the page promise, supporting evidence, primary action, and visitor objections that are actually known.
- Give every section one distinct job.
- Use useful headings, not decorative preheadings or sentence fragments that merely sound designed.
- Keep one label for one action intent.
- Remove repeated claims, inflated language, fake urgency, invented proof, and filler.
- Mark prototype copy and non-functional behavior honestly.

Allow the copy to influence section count, order, density, and visual hierarchy.

### 5. Map only the necessary sections

Create a short page outline that names each section and its job. Select sections from the real content, not from a canonical landing-page conveyor belt.

Combine sections when they answer the same question. Remove sections that do not add new information or confidence. Navigation, hero, and footer have special structural roles; most other section labels are semantic and may share a strong layout grammar.

### 6. Choose and adapt layout grammars

Use `references/layouts.md`. Treat its patterns as compositional possibilities, never templates.

For each section:

1. identify the content relationship: explain, compare, sequence, browse, prove, convert, orient, or recover;
2. choose a layout family that expresses that relationship;
3. adapt hierarchy, zones, proportions, alignment, and reading order to the actual content;
4. vary the family through scale, crop, density, rhythm, media behavior, and brand rules;
5. design the mobile transformation deliberately;
6. reject the result if it merely reproduces a reference or repeats the previous section.

Reuse a layout family across compatible section types when it remains the best answer. Do not manufacture novelty by assigning every section a unique structure.

### 7. Select and integrate components

Use `references/components.md`. Start with the section's content and layout; then select components that clarify, demonstrate, navigate, or create a controlled focal moment.

When the Taste Blocks MCP or local catalog is available, read `references/taste-blocks.md` and search it before looking for another third-party component source. Inspect metadata and the generated registry payload only for candidates that fit the section. Taste Blocks supplies components, never section layouts or page templates.

For a complete studio-grade website, give every major section a deliberate visual carrier. Across a substantial eight-section page, expect roughly six to twelve substantial component or media systems when the content supports them. A plain button, checkbox, input, static text element, ordinary accordion, unmodified card, or load-only reveal does not count as a substantial component.

A substantial component materially changes the experience: a shader or generative field, meaningful text-motion system, spatial or gesture interaction, advanced media treatment, interactive navigation, responsive gallery, product demonstrator, live diagram, cinematic transition, or another authored system with a real section role. Search enough catalog candidates to compare options across at least four relevant categories. Do not reuse the same easy component across unrelated projects merely because integration is convenient.

Do not satisfy component use with an unused import, hidden demo, copied markup, or a component that could be removed without changing behavior or presentation. If no candidate earns a place, record the searched roles and rejection reason instead of silently skipping the library. In the handoff, list every integrated component by verified catalog name, source path, section role, and adaptation.

Adapt imported components to the brand tokens and codebase. A component may include a shader, masked media, gradient treatment, text animation, spatial interaction, or unusual card behavior when it supports the section. Do not stack several expressive systems in one area or scatter spectacle evenly across the page.

Keep plain components plain when clarity is the stronger design choice. Verify licenses and dependencies before copying or installing third-party code.

### 8. Implement the full responsive system

Build semantic structure and real interaction states. Preserve hierarchy across widths while allowing the composition to change.

- Recompose before shrinking.
- At desktop widths, let short headlines use the available measure. A headline of six words or fewer should normally occupy one or two lines, never one word per line; four-line desktop headings fail unless the user explicitly requested a tested poster composition.
- Keep primary navigation and desktop CTA labels from wrapping unnecessarily.
- Provide keyboard, touch, focus, escape, loading, empty, error, pending, and reduced-motion behavior where relevant.
- Use responsive assets, stable font delivery, and measured performance budgets.
- Preserve or improve the project's architecture rather than replacing it with a generated monolith.

### 9. Build and audit the motion system

Read `references/motion.md` after static composition, copy, components, and interaction states work.

Add motion where it improves causality, orientation, continuity, feedback, demonstration, spatial depth, or brand expression. Establish one motion language, reserve high-attention animation for focal moments, and keep reading content immediately available.

Map motion across the whole page: hero arrival, section-to-section continuity, media behavior, interactive components, and the ending. Every major section in a studio-grade experience should feel deliberately alive through motion, interaction, spatial media, or a composed visual state, while quiet reading areas remain stable. Zero expressive motion is not a valid result for a premium, cinematic, Awwwards-level, interactive, or animation-led brief. One generic reveal, one hover icon, or one magnetic button is also insufficient.

After the first motion implementation, run the available animation-opportunity audit and implement its highest-leverage findings. Inspect the real result at normal speed and under reduced motion. Then run the animation review, fix every blocking issue, and re-test.

Provide behavior-specific reduced-motion alternatives. Test actual feel and performance on desktop, keyboard, touch, and a constrained viewport.

### 10. Run the final gate

Inspect the rendered result rather than trusting source code alone.

- Compare every section with its stated job.
- Confirm that planned generated or supplied assets are actually referenced by rendered media and that selected catalog components are actually imported and visible.
- Reject decorative preheading text anywhere, including prototype, category, studio, archive, or status badges positioned like eyebrows. Put required prototype disclosure in body copy, a dedicated notice, or the footer instead.
- Check the whole-page rhythm, repeated structures, accent consistency, typography, real content, and visual hierarchy.
- Render full-page desktop and mobile screenshots. Reject the result when three consecutive sections are flat, interchangeable, or use the same split/grid grammar.
- Reject default system fonts chosen for convenience when the brand direction calls for a distinctive type system.
- Check depth through intentional layering, crop, overlap, perspective, light, texture, masks, and spatial relationships; gradients alone do not establish depth.
- Confirm that substantial component coverage changes the page's experience rather than merely increasing import count.
- Exercise the actual motion in-browser. Source-code animation counts are not evidence of quality.
- Verify navigation, links, forms, menus, overlays, responsive states, focus, contrast, zoom, text spacing, and media behavior.
- Remove effects, components, sections, and copy that do not earn their space.
- Run the project's build, lint, tests, and relevant browser checks.
- Score art direction, composition, typography, depth, motion, component integration, and polish. Do not call the result complete below 8/10 overall or with any material category below 7/10; revise instead.
- Report what was verified, what remains a placeholder, and what still requires user content or external setup.

## Output expectations

Deliver a coherent working website, not isolated mock sections. Keep the handoff concise and factual. Include changed files, integrated component names, generated asset paths and prompts, animation systems, rendered visual QA, score, honest limitations, and the next material decision only when one remains.
