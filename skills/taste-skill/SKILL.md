---
name: design-taste-frontend
description: Design and build distinctive, production-ready landing pages, portfolios, and content-led websites without generic AI patterns. Use for new sites, redesigns, page composition, brand direction, website copy, section layout, component selection, responsive implementation, visual QA, and restrained web motion. This skill turns references into adaptable design principles rather than copied templates.
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

For a complete website build, integrate at least one verified reusable component whenever the reachable catalog contains a component with a real role in the page. Do not satisfy this with an unused import, hidden demo, copied markup, or a component that could be removed without changing behavior or presentation. If no candidate earns a place, record the searched roles and rejection reason instead of silently skipping the library. In the handoff, list every integrated component by verified catalog name, source path, section role, and adaptation.

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

### 9. Add motion last

Read `references/motion.md` after static composition, copy, components, and interaction states work.

Add motion only where it improves causality, orientation, continuity, feedback, demonstration, or brand expression. Establish one motion language, reserve high-attention animation for focal moments, and keep reading content immediately available.

Provide behavior-specific reduced-motion alternatives. Test actual feel and performance on desktop, keyboard, touch, and a constrained viewport.

### 10. Run the final gate

Inspect the rendered result rather than trusting source code alone.

- Compare every section with its stated job.
- Confirm that planned generated or supplied assets are actually referenced by rendered media and that selected catalog components are actually imported and visible.
- Reject decorative preheading text anywhere, including prototype, category, studio, archive, or status badges positioned like eyebrows. Put required prototype disclosure in body copy, a dedicated notice, or the footer instead.
- Check the whole-page rhythm, repeated structures, accent consistency, typography, real content, and visual hierarchy.
- Verify navigation, links, forms, menus, overlays, responsive states, focus, contrast, zoom, text spacing, and media behavior.
- Remove effects, components, sections, and copy that do not earn their space.
- Run the project's build, lint, tests, and relevant browser checks.
- Report what was verified, what remains a placeholder, and what still requires user content or external setup.

## Output expectations

Deliver a coherent working website, not isolated mock sections. Keep the handoff concise and factual. Include changed files, verification performed, honest limitations, and the next material decision only when one remains.
