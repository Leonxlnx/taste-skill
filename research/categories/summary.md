# Category Architecture for Taste Skill v2

This synthesis consolidates ten independent research reports into one category system for a frontend skill that designs and builds portfolios, general websites, and landing pages.

The reports intentionally examined different layers. The final structure removes their overlaps and assigns every concern one owner.

## Source reports

- [`site-types.md`](./site-types.md): reusable site archetypes and project-context variables.
- [`portfolio.md`](./portfolio.md): portfolio evaluation modes, work indexes, case studies, archives, and category-specific needs.
- [`landing-pages.md`](./landing-pages.md): landing-page decision journeys, overlays, commitments, evidence, forms, and experiments.
- [`brand-visual.md`](./brand-visual.md): brand inputs, art direction, primitives, semantic roles, media systems, and visual validation.
- [`architecture-layout.md`](./architecture-layout.md): information architecture, page and section architecture, geometry, density, rhythm, and responsive transformation.
- [`sections-components.md`](./sections-components.md): section families, blocks, components, primitives, behaviors, and a future catalog schema.
- [`interaction-motion.md`](./interaction-motion.md): interaction contracts, state models, motion purpose, input modes, and performance.
- [`responsive-accessibility.md`](./responsive-accessibility.md): responsive, adaptive, inclusive, accessible, localized, and testable design.
- [`content-conversion.md`](./content-conversion.md): content, claims, trust, conversion, SEO, localization, measurement, and governance.
- [`engineering-qa.md`](./engineering-qa.md): implementation, assets, performance, security, discovery plumbing, QA, and delivery.

Each report retains its detailed reasoning and direct source URLs. This document is the recommended shared taxonomy.

## Main decision

The skill needs three kinds of organization:

1. **Project modes** determine which needs receive priority.
2. **Core categories** describe the decisions every project may require.
3. **Catalog levels** separate sections, blocks, components, primitives, and behaviors.

These must not be flattened into one list. `Portfolio`, `typography`, `hero`, `card`, and `carousel` are not comparable categories:

- portfolio is a project mode;
- typography is a visual foundation;
- hero is a section family;
- card is a component or composition container;
- carousel is a behavior.

Keeping those levels separate is the most important structural decision for Taste Skill v2.

## 1. Project modes

Taste Skill v2 should support three user-facing modes.

### Portfolio

Primary job: help a visitor evaluate identity, relevance, authorship, capability, and work.

Typical priorities:

- positioning;
- selected work and work index;
- project or case-study evidence;
- explicit role and collaborator credit;
- about, services when relevant, proof, and contact;
- media quality, sequencing, archive behavior, and portfolio-specific performance.

Portfolio subtypes should not become unrelated rule systems. Select one or more evaluation modes:

- case-study evaluation;
- visual or object evaluation;
- technical capability evaluation;
- commercial-practice evaluation;
- archive or research evaluation.

### Landing page

Primary job: move a visitor from a known or inferable entry context to one informed next commitment.

Classify landing pages compositionally:

- base object: product, service, app, event, or editorial;
- overlays: launch, waitlist, campaign, pricing or offer;
- conversion: direct, lead generation, or informational.

This model is stronger than a fixed SaaS, event, service, or AIDA template because it exposes the decision, evidence, offer, risk, and form obligations that actually change architecture.

### General website

Primary job: support several durable destinations, tasks, or content types within a coherent site.

General websites may combine:

- organizational orientation;
- content and knowledge;
- catalog and discovery;
- bounded tasks and transactions;
- offer or campaign pages;
- proof and identity pages.

The homepage should establish scope and route priorities. It should not reproduce the entire site as one generic marketing sequence.

## 2. Reusable site archetypes

The project modes describe the requested deliverable. The following six archetypes classify the actual user job of a page, template family, or bounded journey.

| Archetype | Primary user job | Common uses |
| --- | --- | --- |
| **Proof and identity** | Assess a person, practice, capability, or body of work | Portfolios, profiles, studio sites, project evidence |
| **Offer and campaign** | Decide whether to take one promoted next step | Product or service landing pages, launches, appeals, events |
| **Organization and orientation** | Understand an organization and find the right path | Company, institution, venue, local business, nonprofit |
| **Content and knowledge** | Learn, retrieve, or follow maintained information | Publications, documentation, guides, resource centers |
| **Catalog and discovery** | Find, compare, and select among many entities | Commerce, directories, archives, collections, listings |
| **Task and transaction** | Complete a bounded action correctly | Booking, registration, application, checkout, donation, calculator |

A site may combine several archetypes, but each page or journey should have one primary archetype and at most one secondary archetype when that changes its structure.

Industry, B2B/B2C, nonprofit/commercial, personal/company, SaaS, and static/dynamic are modifiers. They are not reliable top-level design categories.

## 3. Recommended core categories

Taste Skill v2 should use fourteen top-level categories.

### 1. Project context and intent

Owns the reason for the project and the conditions that change decisions.

Subcategories:

- project mode and page archetype;
- user task, decision, or evaluation mode;
- owner outcome and real next step;
- audience knowledge and entry context;
- commitment, reversibility, and risk;
- content unit, corpus size, and freshness;
- evidence available;
- locale, device, platform, legal, and technical constraints;
- existing project and redesign boundaries.

This category selects a posture. It must not become a long compulsory questionnaire or a fabricated brief.

### 2. Content and copy

Owns what the site communicates and whether every line is useful, consistent, and appropriate.

Subcategories:

- source inventory and content provenance;
- page intent and message hierarchy;
- headlines, supporting copy, body, labels, and CTAs;
- voice, tone, terminology, and controlled vocabulary;
- UX writing for forms and system states;
- editorial content and lifecycle;
- localization-ready content;
- AI-pattern review and editing;
- missing-content placeholders and `Still needed` handoff.

The existing [`../copywriting/summary.md`](../copywriting/summary.md) and [`../../rules/copywriting.md`](../../rules/copywriting.md) already provide the detailed research and rules for this category.

### 3. Information architecture and discovery

Owns how the information space is organized and found.

Subcategories:

- site scope;
- task, topic, audience, object, lifecycle, or hybrid organizing principle;
- flat, hub-and-spoke, nested, faceted, sequential, or networked hierarchy;
- page inventory and route structure;
- global, local, in-page, contextual, utility, and action navigation;
- search, filtering, taxonomy, archives, and result navigation;
- current location, breadcrumbs, indexes, and alternate discovery paths;
- URL continuity, redirects, and orphan prevention.

This category decides destinations and relationships, not header styling.

### 4. Brand and art direction

Owns why the experience looks and feels like this particular subject.

Subcategories:

- brand, product, person, or organization inputs;
- positioning and desired-perception axes;
- existing identity and asset inventory;
- reference and anti-reference analysis;
- central visual concept and narrative;
- cultural, representational, and material vocabulary;
- signature devices and their limits;
- media strategy;
- page-family expression and controlled exceptions;
- brand fit and originality checks.

Art direction must precede aesthetic effects. It is a coherent visual thesis, not a mood-board adjective list.

### 5. Visual foundations

Owns reusable raw values, semantic roles, and medium specifications.

Subcategories:

- color primitives, ramps, themes, and semantic roles;
- typography families, roles, scale, leading, tracking, and measure;
- spacing, sizing, grid, container, and aspect-ratio primitives;
- shape, radius, border, stroke, surface, material, and depth;
- icon construction and direction;
- illustration construction and direction;
- photography direction and responsive art direction;
- video, motion-media, and poster/fallback specifications;
- data-visualization encodings and direction;
- design tokens and cross-page role consistency.

Keep four levels distinct:

1. raw primitives;
2. semantic roles;
3. art-direction choices;
4. validation.

### 6. Page architecture and layout

Owns the page's information sequence and spatial composition.

Subcategories:

- page role and visitor mode;
- semantic region model;
- narrative spine;
- content priority;
- section sequence by information job;
- section relationships and visual dominance;
- container and measure;
- grid, spans, margins, gutters, gaps, and alignment;
- density and whitespace;
- flow and rhythm;
- section transitions;
- responsive transformation and deliberate exceptions.

Named layouts such as centered hero, split screen, bento, masonry, sticky stack, or horizontal gallery are outputs of these decisions, not top-level categories.

### 7. Sections and page blocks

Owns page-scale information and task modules.

Use the eighteen section families from the research:

1. Navigation and orientation
2. Hero and introduction
3. Proof and trust
4. Work and showcase
5. Features, capabilities, services, and use cases
6. Process and sequence
7. Comparison and decision support
8. Pricing and offer
9. Content and editorial
10. Data and evidence display
11. Team and about
12. Integrations and ecosystem
13. Forms and task completion
14. FAQ and disclosure
15. Calls to action
16. Footer and site closure
17. Utility and cross-page service
18. System states and feedback

Each section entry should declare its job, user question, required content, evidence, actions, composition options, states, semantics, responsive behavior, accessibility, and anti-patterns.

### 8. Components and primitives

Owns reusable interface units and their contracts.

Component families:

- actions;
- text inputs;
- choice inputs;
- date, time, and file inputs;
- navigation controls;
- disclosure and overlays;
- collections and items;
- data display;
- media display;
- identity and attribution;
- labels and status;
- feedback and messaging;
- layout and grouping.

Primitive families:

- text;
- action;
- media;
- structure;
- form;
- data;
- layout;
- state.

A card is a component or grouping container. It is not a content family. Project, testimonial, feature, plan, person, article, and integration blocks retain their information identity even when each uses a card.

### 9. Interaction and state

Owns how actions are discovered, operated, acknowledged, completed, cancelled, and recovered.

Subcategories:

- affordance and targets;
- availability, hover, focus, active, selected, current, disabled, and pending states;
- navigation, history, anchors, and scroll behavior;
- disclosure, accordion, tabs, tooltip, popover, menu, dialog, and drawer contracts;
- forms, validation, pending, error, success, and undo;
- search, filter, sort, pagination, and selection;
- direct manipulation, drag alternatives, sliders, pan, zoom, and scrub;
- galleries, carousels, media controls, and sequence navigation;
- asynchronous and live state;
- failure, cancellation, retry, and recovery.

The shared interaction loop is:

`invite -> act -> acknowledge -> resolve or recover`

### 10. Motion

Owns the visual treatment of state change and narrative progression.

Motion-purpose categories:

- response;
- causality;
- continuity;
- hierarchy;
- attention;
- progress;
- expression and narrative.

Motion-system categories:

- durations, easing, distance, and choreography;
- microinteraction feedback;
- route and page transitions;
- scroll-triggered and scroll-driven motion;
- direct-manipulation motion;
- expressive portfolio or campaign motion;
- reduced-motion substitution;
- animation ownership, cleanup, performance, and verification.

Motion is not required merely because this category exists. The default is no added motion until its function can be named.

### 11. Responsive and adaptive design

Owns how the same task and meaning survive changing space and device conditions.

Subcategories:

- viewport and container transformation;
- meaningful source, reading, visual, and focus order;
- fluid and bounded typography;
- responsive media and art-directed crops;
- navigation transformation;
- input capabilities and target behavior;
- form recomposition;
- tables, diagrams, comparison, and deliberate local overflow;
- dynamic viewport units, browser chrome, safe areas, and keyboards;
- short-height, landscape, split-window, zoom, and intermediate-width behavior;
- content expansion, localization, and RTL transformation.

Responsive behavior must be recorded as an explicit transformation: scale, wrap, stack, re-span, reposition, crop, collapse, condense, substitute, drill in, or deliberate local scroll.

### 12. Accessibility and inclusion

Owns whether all content and functions can be perceived, understood, navigated, and operated.

Subcategories:

- semantic structure, headings, landmarks, and accessible names;
- keyboard access and focus management;
- screen-reader reading and status announcements;
- contrast, color independence, forced colors, and themes;
- text enlargement, reflow, and text spacing;
- target size and input-mode independence;
- images, charts, audio, video, captions, transcripts, and descriptions;
- motion sensitivity, flashing, autoplay, and time limits;
- cognitive clarity, predictability, recognition, and recovery;
- language, localization, bidirectionality, and representation;
- assistive-technology and disabled-user evaluation.

Accessibility is both a category and a constraint across every other category. WCAG 2.2 AA is the baseline, not the finish line.

### 13. Engineering, performance, security, and discovery plumbing

Owns correct implementation within the real project.

Subcategories:

- repository reconnaissance and stack preservation;
- semantic frontend structure;
- existing design-system and dependency reuse;
- routes, rendering, status codes, and navigation behavior;
- forms, validation, APIs, and integrations;
- images, SVGs, fonts, video, and asset provenance;
- loading, error, empty, stale, offline, and degraded states;
- Core Web Vitals and third-party cost;
- security and privacy baseline;
- page metadata, canonical URLs, robots, sitemap, and structured data when applicable;
- browser resilience and progressive enhancement.

Frameworks, libraries, CMSs, authentication, payments, analytics, and deployment platforms are conditional mechanisms. They are not core design categories.

### 14. QA, release, and handoff

Owns evidence that the finished work actually functions.

Subcategories:

- production build and repository checks;
- route and link verification;
- interaction, form, and state testing;
- browser, device, viewport, zoom, and input testing;
- automated plus manual accessibility testing;
- visual, copy, content, asset, and claim review;
- performance, metadata, network, console, privacy, and security smoke checks;
- production-equivalent verification;
- placeholder and sample-content cleanup;
- limitations, ownership, licenses, and `Still needed` handoff.

A source-code review alone cannot complete this category.

## 4. Catalog levels

The later component and layout catalog should use five levels.

| Level | Definition | Examples |
| --- | --- | --- |
| **Section** | Page-scale region with a distinct information, evidence, orientation, or task job | Selected work, pricing, process, team, FAQ |
| **Composite block** | Reusable cluster that completes one subtask inside a section | Attributed testimonial, project preview, plan summary |
| **Component** | Reusable unit with a defined API, states, semantics, and interaction contract | Tabs, pagination, input, dialog, table |
| **Primitive** | Lowest owned semantic, content, media, or layout unit | Heading, link, button, image, label, field, container |
| **Behavior** | Reusable interaction or state logic attached to structures | Disclosure, filtering, validation, sticky positioning, carousel |

This prevents a visual name from creating duplicated catalog entries.

## 5. Behavior catalog

Behaviors should be stored separately and referenced by sections or components:

- disclosure;
- view switching;
- overlay and modality;
- search, filter, and sort;
- pagination and incremental loading;
- selection and comparison;
- validation and conditional input;
- progress and asynchronous feedback;
- sticky or pinned positioning;
- carousel or rotator;
- auto-update and live data;
- drag, resize, and direct manipulation;
- reveal and entrance motion;
- responsive transformation;
- persistence and personalization.

An FAQ may reference disclosure. A testimonial may reference a manual carousel. A feature explanation may reference tabs. The content family does not change because the behavior changes.

## 6. Ownership boundaries

Several subjects cross categories. Assign them as follows.

| Subject | Primary owner | Shared contract |
| --- | --- | --- |
| Page purpose | Project context | Content and architecture implement it |
| Page inventory and navigation | Information architecture | Engineering preserves routes and history |
| Message order | Content | Layout renders the order without changing meaning |
| Visual priority | Page architecture | Brand and content constrain what may dominate |
| Color values | Visual foundations | Accessibility validates contrast and non-color cues |
| Animation | Motion | Interaction owns state; accessibility and engineering validate it |
| CTA meaning | Content | Layout owns prominence; interaction owns behavior |
| Form questions | Content | Components own controls; engineering owns submission and validation |
| Proof | Content and claims | Sections present it; engineering must not fabricate live state |
| SEO | Content owns page purpose and wording | Engineering owns metadata, status, crawl, and structured-data plumbing |
| Responsive priority | Page architecture | Responsive design transforms it; accessibility validates preservation |
| Components | Component catalog | Sections compose them; engineering implements them |
| Completion | QA and handoff | Every category contributes checks |

## 7. What should not become a top-level category

### Visual styles

Minimalist, brutalist, editorial, luxury, futuristic, playful, corporate, dark, glass, and retro are possible art directions. They do not determine user jobs or page architecture.

### Industry directories

Finance, healthcare, real estate, fashion, restaurants, SaaS, and similar labels matter through concrete modifiers such as regulation, evidence, inventory, locality, risk, or transaction model. Do not create a separate layout system for every industry.

### Layout shapes

Centered, split, zigzag, bento, masonry, cards, horizontal scroll, and asymmetry are composition choices inside layout and section records.

### Effect names

Parallax, marquee, reveal, blur, glow, glass, magnetic cursor, sticky stack, and shared-element transition are motion, material, or behavior choices.

### Frameworks and libraries

React, Next.js, Astro, Tailwind, GSAP, shadcn, Bootstrap, Material, and similar tools are implementation mechanisms selected from the actual project.

### Marketing formulas

AIDA, PAS, StoryBrand, fixed section sequences, fixed section counts, and fixed CTA repetition are optional reasoning aids, never category architecture.

### Device classes

Mobile, tablet, and desktop are test contexts. Responsive design should adapt at content failure points and container constraints rather than treating devices as separate products.

## 8. Recommended selection flow

The final skill should make decisions in this order:

1. Read the explicit request and existing project.
2. Select the project mode and primary page archetype.
3. Name the user job, real next step, risk, evidence, and content constraints.
4. Establish the content inventory, page inventory, and information architecture.
5. Choose the brand and art direction from subject-specific evidence.
6. Define visual foundations and semantic roles.
7. Build page architecture from content priority and section jobs.
8. Select sections by the questions they answer.
9. Compose sections from existing components and primitives.
10. Add behavior and motion only when their function is clear.
11. Define responsive, accessible, and localized transformations.
12. Implement in the existing stack with the smallest sufficient system.
13. Validate the rendered result, interactions, states, performance, and production behavior.
14. Report every unresolved item under `Still needed`.

The dependency direction is:

```text
project context
  -> content and information architecture
  -> brand and art direction
  -> page architecture and section jobs
  -> components, behaviors, and motion
  -> responsive and accessible transformation
  -> engineering implementation
  -> QA and handoff
```

## 9. Recommended future skill structure

The research supports progressive disclosure rather than one enormous runtime file.

Keep the eventual `SKILL.md` concise and procedural. Detailed references can be loaded only when relevant:

```text
SKILL.md
references/
  anti-slop.md
  copywriting.md
  categories.md
  portfolio.md
  landing-pages.md
  layouts.md
  sections.md
  components.md
  interaction-motion.md
  responsive-accessibility.md
  engineering-qa.md
```

This is a proposed final packaging model, not a request to create those files now. Research remains in `research/` until the rules and catalog are deliberately derived.

## 10. Immediate next research stage

The category architecture is now stable enough to support the next stage:

1. analyze strong real websites within each project mode and archetype;
2. extract reusable page and section decisions rather than copying surface styles;
3. define clean layout families for each section job;
4. build the component catalog using the five-level schema;
5. forward-test the catalog against real portfolio, website, and landing-page tasks.

The next artifact should therefore be evidence-backed website analysis, followed by `layouts` and the section/component catalog. Creating hundreds of component records before those layout relationships are validated would only produce a larger unreviewed library.

## Final taxonomy

The complete top level is:

1. Project context and intent
2. Content and copy
3. Information architecture and discovery
4. Brand and art direction
5. Visual foundations
6. Page architecture and layout
7. Sections and page blocks
8. Components and primitives
9. Interaction and state
10. Motion
11. Responsive and adaptive design
12. Accessibility and inclusion
13. Engineering, performance, security, and discovery plumbing
14. QA, release, and handoff

This structure covers portfolios, general websites, and landing pages without turning the skill into three duplicated systems or one flat list of unrelated design terms.
