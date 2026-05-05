---
name: dark-schematic-ui
description: Premium dark modular interfaces fusing black-on-black grid systems with precise technical diagrams, restrained typography, subtle signal colour, and product-led storytelling. Generates separate horizontal website-section images in top-to-bottom order, with navigation/menu only on the first hero section. For SaaS, portfolios, editorial sites, dashboards, brand websites, AI products, or digital platforms that need to feel precise, scalable, intelligent, and quietly futuristic.
---

# SKILL: Dark Schematic & Modular Systems UI

## 1. Skill Meta

**Name:** Dark Schematic & Modular Systems Interface Engineering

**Description:** Advanced proficiency in architecting web interfaces that synthesize premium dark-mode product design, modular grid systems, technical diagram language, and restrained editorial hierarchy. This discipline requires absolute mastery over black-on-black surfaces, thin structural borders, quiet typographic contrast, subtle signal colours, abstract schematic visuals, and precise spatial organisation. The objective is to construct digital environments that project clarity, speed, intelligence, scale, and technical elegance, deliberately discarding decorative maximalism, generic SaaS gradients, heavy dashboard clutter, aggressive brutalist styling, and visually busy interface collage.

## 2. Visual Archetypes

The design system operates by merging two distinct but highly compatible visual paradigms. **Pick ONE per project and commit to it. Do not alternate or mix both modes within the same interface.**

### 2.1 Modular Product Grid

Derived from premium product-platform websites, system overview pages, and high-trust digital services.

* **Characteristics:** Dark mode exclusivity. Large compartmentalised grids outlined by thin grey dividers. Individual cells contain concise titles, muted descriptions, circular action controls, and small schematic product visuals. The design relies on restraint, spacing, and precision rather than decorative imagery. Every module should feel like one part of a larger engineered system.

### 2.2 Schematic Infrastructure Field

Derived from network maps, deployment diagrams, global meshes, orchestration systems, and abstract technical visualisations.

* **Characteristics:** Dark mode exclusivity. Expansive black canvases with subtle linework, arcs, nodes, layered panels, terminal-like snippets, and thin coloured routing paths. Visual emphasis is placed on connection, flow, scale, and hidden complexity made legible. The interface feels calm, intelligent, and spatially engineered rather than noisy or illustrative.

## 3. Typographic Architecture

Typography is the primary structural and hierarchy system. Imagery is secondary and should appear as schematic support. The system demands extreme variance in scale, weight, opacity, and spacing.

### 3.1 Macro-Typography (Structural Headers)

* **Classification:** Clean Neo-Grotesque / Product Sans-Serif.
* **Optimal Web Fonts:** Geist, Inter, Neue Haas Grotesk, Helvetica Neue, SF Pro Display, ABC Diatype, Söhne.
* **Implementation Parameters:**
    * **Scale:** Deployed at massive scales using fluid typography, matching the original system: `clamp(4rem, 10vw, 15rem)`.
    * **Tracking (Letter-spacing):** Tight, often negative (`-0.03em` to `-0.06em`), forcing glyphs to feel dense, precise, and architectural.
    * **Leading (Line-height):** Highly compressed (`0.85` to `0.95`).
    * **Casing:** Sentence case preferred for premium product clarity. Uppercase may be used for structural or campaign-style impact, but avoid making every headline feel industrial.

### 3.2 Micro-Typography (Labels, Data & System Text)

* **Classification:** Monospace / Technical Sans.
* **Optimal Web Fonts:** Geist Mono, JetBrains Mono, IBM Plex Mono, Space Mono, SF Mono.
* **Implementation Parameters:**
    * **Scale:** Fixed and small (`10px` to `14px` / `0.7rem` to `0.875rem`).
    * **Tracking:** Generous (`0.05em` to `0.1em`) to suggest technical precision and system metadata.
    * **Leading:** Standard to tight (`1.2` to `1.4`).
    * **Casing:** Title case or uppercase. Used for all metadata, section labels, status text, compact navigation, chips, command snippets, coordinates, and system captions.

### 3.3 Textural Contrast (Quiet Product Emphasis)

* **Classification:** Muted Product Body / Editorial Supporting Copy.
* **Optimal Web Fonts:** Same family as macro typography, using regular or medium weights.
* **Implementation Parameters:** Used sparingly to create calm product storytelling. Body copy should remain short, muted, and precise. Avoid long paragraphs, oversized marketing copy, or expressive decorative type. Contrast is achieved through opacity, spacing, and weight rather than through ornamental font pairing.

## 4. Color System

The color architecture is restrained and signal-based. Gradients, heavy shadows, and large decorative colour fields are strictly prohibited. Colours should simulate operational state, connection, or system focus.

**CRITICAL: Choose ONE dark substrate palette per project and use it consistently. Do not mix light and dark substrates within the same interface.**

### Dark Modular Substrate

* **Background:** `#000000` or `#050505` — deep black page foundation.
* **Surface:** `#090909` to `#101010` — near-black panels and cards.
* **Border/Grid:** `#1A1A1A` to `#2A2A2A` — thin structural dividers.
* **Foreground:** `#EDEDED` to `#F5F5F5` — primary text.
* **Muted Text:** `#7A7A7A` to `#A1A1A1` — descriptions, metadata, secondary information.
* **Dimmed Text:** `#3F3F3F` to `#5A5A5A` — inactive items and atmospheric interface details.
* **Signal Blue (`#0070F3` / `#0099FF`):** Primary operational accent. Use for active routes, selected nodes, focused states, or key highlights.
* **Signal Green (`#00C853`):** Optional. Use only for success, availability, or active flow.
* **Signal Yellow (`#F5A700`):** Optional. Use only for secondary routing, caution, or differentiated flow.
* **Signal Red (`#FF3B30`):** Optional. Use sparingly for error, alert, or destructive states.

Accent colours must remain small: a dot, line, node, icon, or chip state. They must never become the dominant visual identity.

## 5. Layout and Spatial Engineering

The layout must appear mathematically engineered. It rejects decorative composition in favour of visible structure, modular rhythm, and precise spatial containment.

* **The System Grid:** Strict adherence to CSS Grid architectures. Elements do not float; they are anchored precisely to grid tracks and intersections.
* **Visible Compartmentalisation:** Extensive utilisation of thin solid borders (`1px solid`) to delineate zones of information. Horizontal and vertical rules frequently span the full container width to create calm architectural separation.
* **Bimodal Density:** Layouts oscillate between compact information modules and vast expanses of calculated black space containing sparse schematic visuals.
* **Geometry:** Corners may be sharp or subtly rounded. Use `0px` for structural grid containers and `8px–16px` radius for cards, chips, browsers, terminal fields, and diagram panels. Avoid soft, bubbly, or playful rounding.

## 6. UI Components and Symbology

Standard web UI conventions are refined into quiet, technical graphic elements. Components should feel like parts of a larger system rather than standalone decorative blocks.

* **Circular Actions:** Small circular arrow buttons with thin borders, dark fills, and minimal hover states. Used to imply navigation without visual noise.
* **Technical Chips:** Compact pills for features, categories, tags, tools, services, or states. Dark surface, thin border, muted text, optional tiny icon.
* **Terminal Snippets:** Short monospace fragments inside dark rounded rectangles. Used for commands, states, prompts, references, or system messages.
    * Examples: `~ project / deploy`, `Thinking…`, `Ready`, `Connected`, `Processing`.
* **Schematic Markers:** Nodes, dots, locks, cubes, triangles, arrows, small circular icons, browser dots, and domain-like labels functioning as structural elements.
* **Layered Panels:** Stacked browser frames, cards, or system windows used to imply scale, multi-layered architecture, multiple users, variants, or environments.

## 7. Textural and Post-Processing Effects

To preserve the premium digital quality, texture must be minimal and nearly invisible. The interface should feel crisp, not distressed.

* **Subtle Line Glow:** Thin coloured routes or active strokes may carry a very faint glow, but only at low opacity.
* **Atmospheric Fading:** Diagram lines may fade into black using masks or gradients to imply scale and depth.
* **Micro-Noise:** Optional global noise at extremely low opacity (`1–3%`) to prevent flat digital harshness. It must never resemble grunge, print damage, or CRT distortion.
* **No Analog Degradation:** Do not use halftones, scanlines, dithering, heavy grain, photocopy effects, torn edges, or mechanical dirt.

## 8. Web Engineering Directives

1. **Grid Determinism:** Utilise `display: grid; gap: 1px;` with contrasting parent/child background colours to generate mathematically perfect, razor-thin dividing lines without complex border declarations.

2. **Semantic Precision:** Construct the DOM using precise semantic tags (`<section>`, `<article>`, `<figure>`, `<figcaption>`, `<code>`, `<samp>`, `<kbd>`, `<data>`) to accurately reflect the systemised nature of the interface.

3. **Typography Clamping:** Implement CSS `clamp()` functions for macro-typography to ensure headers scale aggressively while maintaining structural integrity across viewports.

4. **Surface Discipline:** Use background contrast and borders instead of drop shadows. Elevation should be implied by layering, spacing, and subtle surface shifts.

5. **SVG-First Diagrams:** Build schematic visuals with CSS and SVG where possible: arcs, nodes, routes, grids, browser frames, stacked panels, and connection maps should feel native to the interface.

6. **Responsive Compartmentalisation:** On smaller screens, preserve the sense of grid structure by stacking modules with retained borders, consistent padding, and simplified schematic visuals.

7. **Accent Restraint:** Limit coloured accents to meaningful system signals. Never allow accent colour to dominate large surfaces, backgrounds, or typography.

8. **Copy Density Control:** Keep text blocks short. The interface should communicate through hierarchy, spacing, and diagrams as much as through written content.

## 9. Image Generation and Section Output Rules

This skill may be used to generate website reference images, landing page sections, or full-page design systems. When generating visual outputs, the system must treat each section as an independent image while preserving one consistent visual language across the full sequence.

### 9.1 Separate Image Per Section

**Generate one separate horizontal image for every website section. Never combine multiple sections into a single image.**

* 1 section requested = 1 separate image.
* 4 sections requested = 4 separate images.
* 8 sections requested = 8 separate images.
* If the user asks for a landing page without specifying a section count, default to 4 separate horizontal images.
* Each image represents one complete section only.
* Do not create a tall full-page screenshot.
* Do not stack multiple website sections inside one image.
* Do not include partial previews of the next or previous section.

### 9.2 Top-to-Bottom Section Order

Images must be generated in natural website order, from top to bottom.

* Image 1 is always the hero section.
* Image 2 is the first content section after the hero.
* Image 3 is the next content section, and so on.
* Maintain visual continuity across all images through the same grid, palette, typography, spacing, and schematic language.
* Each section should feel like part of the same website, but each image must stand alone as a separate horizontal composition.

### 9.3 Navigation Menu Rule

**Only the first image may include the website navigation menu.**

The first image is the hero section and should include the full website header/navigation if a menu is appropriate for the concept.

Hero section may include:
* logo or wordmark
* primary navigation links
* secondary links
* CTA button
* menu icon, if mobile-style
* announcement bar, if required

All following section images must not include:
* navigation menu
* repeated header
* logo bar
* sticky nav
* top menu
* duplicate hero header

After the hero, sections should focus only on their own content.

### 9.4 Hero Section Rule

The hero is the top section of the website and must contain the main introductory content.

The hero should usually include:
* primary headline
* short supporting copy
* main CTA or action
* optional secondary CTA
* website navigation
* strongest schematic visual or product-led composition
* the clearest statement of the product, brand, or service

Do not place the main website navigation in any section except the hero.

### 9.5 Content Section Rule

All sections after the hero should be treated as standalone body sections.

They may include:
* feature grids
* schematic diagrams
* product cards
* editorial content blocks
* comparison sections
* process sections
* testimonials
* pricing
* FAQ
* footer

They must not include the main navigation menu.

### 9.6 Horizontal Format

Every generated section image must be horizontal.

Recommended composition:
* desktop website ratio
* wide landing-page frame
* strong left-to-right spatial rhythm
* no mobile-only layouts unless explicitly requested
* no vertical poster format
* no tall full-page composite

### 9.7 Continuity Without Repetition

Maintain a consistent design system across all images, but vary the composition.

Keep consistent:
* dark substrate
* grid structure
* border treatment
* typography
* signal colours
* schematic visual language
* spacing logic

Vary:
* section layout
* diagram type
* card structure
* text placement
* density
* visual rhythm

Do not repeat the same hero composition or navigation treatment in later sections.

### 9.8 Hero Density Rule

The first image must be visually simpler than most of the sections that follow.

The hero should not be the busiest section of the website.

For the hero:
* reduce the number of graphic elements
* reduce the number of text groups
* reduce the number of supporting UI fragments
* use one dominant visual idea
* preserve generous negative space

Later sections may become more information-dense, but the hero must remain calm, clear, and elegant.

## 10. Hero Restraint and Graphic Reduction Rules

The visual system must prioritise elegance, clarity, and restraint. The interface should not become busy, overly illustrated, or saturated with too many simultaneous graphic devices.

### 10.1 Hero Simplicity Principle

The hero section must be the most controlled and elegant section in the sequence.

The hero should communicate through:
* one dominant headline
* one short supporting paragraph
* one or two CTA actions
* one primary visual idea
* one background system
* generous negative space

The hero must not feel like a dense dashboard, an infographic collage, or a product-explainer packed with multiple competing graphics.

### 10.2 Single Focal Point Rule

The hero must have **one primary focal element only**.

Allowed examples:
* one central abstract schematic visual
* one product object or device mockup
* one single interface preview
* one geometric diagram
* one symbolic product illustration

Do not combine multiple large focal visuals in the same hero unless explicitly requested.

Avoid combinations such as:
* multiple device mockups
* stacked dashboards plus floating panels
* several unrelated diagrams
* side callouts surrounding the main object
* multiple competing centrepieces

If a device mockup is used, prefer **one hero device** rather than several.

### 10.3 Graphic Element Budget

The hero must use a reduced number of visual ingredients.

Maximum recommended hero composition:
* 1 primary hero visual
* 1 background grid or structural line system
* 1 optional secondary accent graphic treatment
* 1 headline
* 1 supporting copy block
* 1–2 CTA buttons
* 1 navigation bar

Do not fill the hero with extra visual fragments simply to make it feel more “designed”.

### 10.4 No Busy Telemetry Collage

Do not overcrowd the hero with:
* floating metric boxes
* scattered chart fragments
* numerous data callouts
* many status chips
* repeated mini-panels
* excessive labels
* multiple decorative routing systems
* dense technical ornament

Small supporting interface details may be used sparingly, but they must remain subordinate to the main composition.

The hero must feel closer to a calm premium landing page than to a dense operational dashboard.

### 10.5 Negative Space Requirement

Generous negative space is mandatory.

The hero should preserve large calm areas of black or dark surface so the composition can breathe.

Aim for:
* strong spatial separation
* few competing objects
* clear reading path
* reduced clutter
* calm visual rhythm

Do not attempt to “fill” every area of the hero.

### 10.6 Background Restraint

Background systems should remain quiet and structural.

Allowed:
* subtle grid lines
* faint radial fields
* soft diagram lines
* minimal glow
* low-contrast node systems

Avoid:
* overly dense technical backgrounds
* multiple decorative overlays
* high-detail radar graphics
* repeated circular telemetry clusters
* large numbers of ornamental markers

The background should support the main composition, not compete with it.

### 10.7 Hero Copy Restraint

The hero should not contain too many text zones.

Preferred hero copy structure:
* 1 eyebrow or short label
* 1 headline
* 1 supporting paragraph
* 1–2 CTA actions

Avoid:
* multiple stacked metadata rows
* too many badges or chips
* long descriptive paragraphs
* too many supporting feature statements inside the hero
* footer-like utility strips inside the hero area

If additional product proof is needed, place it in later sections rather than inside the hero.

### 10.8 Elegance Over Density

When making layout decisions, always prefer:
* fewer elements
* larger scale
* clearer hierarchy
* stronger whitespace
* one memorable visual gesture

over:
* more panels
* more metrics
* more callouts
* more decorative details
* more simultaneous information

If there is any doubt, reduce the number of elements.

### 10.9 Premium Restraint Reference

The intended hero behaviour should align more closely with premium restrained compositions such as high-end infrastructure or product landing pages:
* calm dark canvas
* minimal but precise navigation
* one dominant message
* one central visual system
* subtle structural lines
* controlled use of accent colour
* elegant emptiness

The hero should feel confident and expensive because of restraint, not because of density.

### 10.10 Hard Maximums for Hero Composition

Unless explicitly requested otherwise, the hero section should not exceed:

* 1 navigation bar
* 1 eyebrow label
* 1 headline
* 1 supporting paragraph
* 2 CTA buttons
* 1 primary hero visual
* 1 background graphic system
* 0–2 small supporting interface details

Do not exceed these limits by default.