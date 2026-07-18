# Architecture and Layout Decision Categories for Professional Frontend Design

## Purpose

This report proposes a reusable category system for information architecture, page architecture, layout, and responsive composition in a frontend design skill for portfolios, general websites, and landing pages.

The central recommendation is to classify decisions by level and function, not by template name. "Bento grid," "split hero," and "masonry portfolio" are possible outputs. They are not first-order decisions. A strong design process first determines what the site must help people find, what the page must accomplish, what each section contributes, how much information is visible at once, and how the composition transforms when space changes.

The system therefore separates:

- Site-level information architecture
- Page-level architecture and narrative flow
- Section-level purpose and composition
- Layout geometry, including containers, measure, columns, gutters, and alignment
- Navigation and orientation
- Content priority and density
- Responsive transformation
- Exceptions and deliberate departures

Accessibility requirements are constraints across every level, not a separate aesthetic category.

## 1. Evidence-backed principles

### 1.1 Structure must survive presentation

The underlying document must retain a logical reading order even when CSS creates a two-dimensional or visually reordered composition. The CSS Grid specification explicitly says grid placement and `order` must not substitute for correct source order because speech output and sequential navigation continue to follow document order. [CSS Grid Layout Module Level 2, reordering and accessibility](https://www.w3.org/TR/css-grid/#order-accessibility)

The W3C page-structure guidance treats regions, headings, and meaningful elements as orientation mechanisms, not merely markup conventions. A page should expose its major regions and section relationships programmatically. [WAI Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/) and [WAI Content Structure](https://www.w3.org/WAI/tutorials/page-structure/content/)

**Category implication:** every composition has both a semantic sequence and a visual arrangement. Record both. If they conflict, fix the semantic sequence or change the composition.

### 1.2 Responsive design preserves meaning and capability

WCAG 2.2 requires most vertically scrolling content to reflow at a width equivalent to 320 CSS pixels without losing information or functionality and without two-dimensional scrolling. [WCAG 2.2, Success Criterion 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)

Primer describes narrow viewports as single-column environments and recommends explicit transformations for secondary panes: split a list-detail experience into views, move auxiliary content to a sheet, or stack it according to priority. [Primer Layout](https://primer.style/product/getting-started/foundations/layout/)

Responsive breakpoints should occur when content or interaction stops working, not because a named device class begins. [web.dev Responsive Web Design Basics](https://web.dev/articles/responsive-web-design-basics)

**Category implication:** responsive behavior is a set of transformations, not a desktop layout with smaller values.

### 1.3 Grids coordinate relationships; they do not dictate all dimensions

Official systems vary in column count while agreeing on grid anatomy. Fluent identifies columns, gutters, and margins as the core parts of a grid and distinguishes fixed, stretch, and hybrid models. [Fluent 2 Layout](https://fluent2.microsoft.design/layout)

USWDS uses a mobile-first 12-column system with configurable containers, site margins, gutters, and responsive spans. [USWDS Layout Grid](https://designsystem.digital.gov/utilities/layout-grid/)

Carbon uses 4, 8, and 16 columns across its breakpoint ranges and keeps padding and gutters tied to a spacing system. [Carbon 2x Grid](https://v10.carbondesignsystem.com/guidelines/2x-grid/overview/)

Atlassian makes a useful distinction: top-level content containers align to page columns, while small elements and internal component details use spacing tokens rather than forcing every edge onto the page grid. [Atlassian Grid](https://atlassian.design/foundations/grid-beta/applying-grid)

**Category implication:** choose a grid model from content relationships and desired alignment, then use a spacing system inside components. Do not confuse a page grid with a universal coordinate system.

### 1.4 Page type changes context, depth, and distraction tolerance

USWDS distinguishes landing pages from documentation pages by user context. Landing pages must orient and contextualize visitors who may arrive with little prior knowledge; documentation pages can assume context and provide depth. USWDS also warns against adding content simply to fill a landing-page template. [USWDS Landing Page](https://designsystem.digital.gov/templates/landing-page/) and [USWDS Documentation Page](https://designsystem.digital.gov/templates/documentation-page/)

GOV.UK service guidance similarly recommends putting information at the point of need and separating guidance from a transaction when they serve different jobs. [Designing how GOV.UK content and transactions work together](https://www.gov.uk/service-manual/design/govuk-content-transactions)

**Category implication:** classify a page by its job and the visitor's expected context before choosing a visual pattern.

## 2. Decision levels

The skill should enforce the following level boundary.

| Level | Primary question | Typical outputs | Must not decide |
|---|---|---|---|
| Site | How is the whole information space organized and found? | Sitemap, taxonomy, global navigation, cross-links, search | Hero composition |
| Page | What outcome does this page support, and in what sequence? | Page role, narrative spine, region map, primary action | Card styling |
| Section | What single contribution does this section make? | Section job, content grouping, composition family | Global route labels |
| Component | How does a reusable unit behave in its container? | Intrinsic layout, states, container-query response | Page narrative |
| Element | How is a specific item aligned and spaced? | Measure, gap, alignment, emphasis | Site taxonomy |

This prevents two common failures:

1. Designing the site as a pile of visually attractive sections with no information model.
2. Letting a component library determine page architecture.

## 3. Site-level information architecture categories

### 3.1 Site scope

Classify the site before designing navigation:

- **Single-purpose:** one product, event, campaign, or conversion path.
- **Portfolio corpus:** work index, case studies, profile, services or capabilities, contact.
- **Small general site:** a few stable top-level areas with modest depth.
- **Sectioned publication or resource site:** multiple topics, filters, archives, and recurring content types.
- **Large service or institutional site:** deep hierarchy, multiple audiences, search, local navigation, and policy or trust content.

Scope determines how much persistent navigation and orientation support is justified. A single-purpose page may benefit from minimal global navigation. A deep site usually needs multiple ways to find content. WCAG includes multiple ways to locate a page and location awareness among its navigation criteria. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### 3.2 Organizing principle

Choose the dominant grouping logic from evidence about users:

- **Task-based:** organized around what the visitor wants to do.
- **Topic-based:** organized around subject matter.
- **Audience-based:** organized around distinct groups only when their needs truly differ.
- **Object or portfolio-based:** organized around projects, products, people, places, or artifacts.
- **Lifecycle-based:** organized by stages such as discover, choose, start, use, maintain.
- **Hybrid:** one dominant principle in global navigation, with secondary facets inside sections.

Do not mirror the organization's internal departments unless that model is already meaningful to users. GOV.UK advises scoping services around the user's whole problem rather than organizational or technical boundaries. [GOV.UK: Getting the scope of your transaction right](https://www.gov.uk/service-manual/design/scoping-your-service)

### 3.3 Hierarchy shape

- **Flat and selective:** few peer destinations, low depth.
- **Shallow hub-and-spoke:** overview pages lead to detail pages.
- **Nested hierarchy:** parent-child relationships matter and need local navigation or breadcrumbs.
- **Faceted corpus:** items can be approached through multiple attributes, so filters and search matter more than a single tree.
- **Sequential journey:** pages or steps have an intended order and clear next actions.
- **Networked editorial:** related content and contextual links are as important as parent-child position.

The hierarchy shape determines orientation aids. Breadcrumbs represent position in a hierarchy, but can be redundant when local and global navigation already expose that position. [USWDS Breadcrumb](https://designsystem.digital.gov/components/breadcrumb/)

### 3.4 Entry model

Design for how visitors actually enter:

- **Front-door dominant:** homepage or campaign is the expected start.
- **Search landing:** detail pages are common first pages.
- **Referral landing:** visitors arrive from ads, social posts, newsletters, or portfolios.
- **Returning/direct:** known destinations and rapid access matter.
- **Mixed entry:** every important page must orient a first-time visitor without repeating the whole site introduction.

Entry model affects how much context a page needs. It should be recorded independently from visual style.

## 4. Page-level architecture categories

### 4.1 Page role

Use functional page roles, not industry templates:

- **Home / system overview:** establishes identity, scope, and primary routes.
- **Campaign / landing:** focuses attention on one proposition and one primary outcome.
- **Hub / index:** helps people choose among destinations, topics, products, or work.
- **Detail / explanation:** gives depth about one subject.
- **Portfolio index:** supports scanning, filtering, and selection of work.
- **Case study:** explains context, contribution, process, and outcome with evidence.
- **Comparison / evaluation:** helps the visitor distinguish options and resolve tradeoffs.
- **Action / conversion:** completes a contact, signup, purchase, download, or application.
- **Trust / assurance:** provides credentials, methods, security, policies, clients, or proof.
- **Utility / legal:** provides required or secondary information without competing with primary journeys.

A page may have one primary role and one supporting role. More than two usually indicates that the page should be split or reprioritized.

### 4.2 Visitor mode

Classify the dominant cognitive mode:

- **Orient:** understand what this is and whether it is relevant.
- **Explore:** browse possibilities without a settled destination.
- **Evaluate:** compare claims, work, offers, or credentials.
- **Learn:** build understanding in a coherent sequence.
- **Act:** complete a specific task.
- **Reference:** retrieve known information quickly.

Visitor mode controls density and navigation. Exploration can expose breadth. Action pages should remove distractions. Reference pages can be denser because scanning and retrieval dominate.

### 4.3 Page region model

Select only the regions needed:

- Global header and primary navigation
- Context header with title, summary, metadata, or actions
- Main content
- Local navigation or contents
- Supporting or contextual aside
- Conversion region
- Related or onward routes
- Footer and utility navigation

WAI recommends recognizable page regions and logical headings so users can navigate efficiently. [WAI Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/)

The region model is not a visual wireframe. A local navigation region might be a sidebar at wide widths, a disclosure at narrow widths, or absent on short pages.

### 4.4 Narrative spine

Choose the dominant progression. These are reasoning categories, not fixed section lists:

- **Proposition-first:** establish value, then substantiate it.
- **Evidence-first:** lead with work, results, product experience, or demonstration when proof is more persuasive than claims.
- **Problem-to-resolution:** frame a recognizable problem, show the approach, then show the outcome.
- **Story / chronology:** use when sequence itself carries meaning, especially case studies and founder narratives.
- **Catalog / browse:** present a navigable set early and let the visitor choose their own path.
- **Task-first:** expose the action or answer immediately, with supporting information at the point of need.
- **Manifesto / identity-first:** use when worldview and authorship are the product, common in selective creative portfolios.

### 4.5 Section sequencing by function

Instead of prescribing "hero, logos, features, testimonial, CTA," build a page from functional stages:

1. **Orient:** identify the subject, audience, and immediate relevance.
2. **Promise or destination:** state the value, outcome, or available route.
3. **Demonstrate:** show the product, work, method, or experience in use.
4. **Substantiate:** provide evidence, clients, results, credentials, or process detail.
5. **Differentiate:** clarify tradeoffs and why this approach is distinct.
6. **Resolve:** answer the major objection, risk, or missing condition.
7. **Act:** provide the primary next step.
8. **Continue:** offer related work, deeper content, or alternative routes.

The order is conditional:

- A portfolio may demonstrate before it explains.
- A high-trust service may substantiate before asking for action.
- A returning-user page may start with the action.
- A hub may orient and immediately branch instead of following a linear narrative.

Every section should have one primary function. If a section both introduces the company, explains six services, displays work, and asks for contact, split it or remove lower-priority content.

## 5. Section-level decision categories

### 5.1 Section job

Classify each section as one of:

- Orient
- Frame a problem or idea
- Explain
- Demonstrate
- Prove
- Compare
- Browse or choose
- Resolve an objection
- Convert
- Transition or continue

This label is more useful than "feature section" because the same content can serve different jobs on different pages.

### 5.2 Content relationship

- **Single focal item:** one message, visual, quote, metric, or action dominates.
- **Paired relationship:** two elements explain each other, such as text and media or before and after.
- **Peer set:** items have equal status and should share a repeated structure.
- **Ranked set:** one lead item and supporting items need different scale or span.
- **Sequence:** order is essential, so progression must remain clear across viewports.
- **Comparison:** aligned attributes or alternatives must remain easy to compare.
- **Context plus detail:** an overview, navigation, or summary supports a deeper body.
- **Layered annotation:** labels, captions, or explanations refer to a shared visual.

### 5.3 Composition family

Choose composition after the relationship is known:

- **Single column / editorial flow**
- **Centered focal composition**
- **Split composition**
- **Multi-column grid**
- **Asymmetric ranked grid**
- **List or index**
- **Matrix or comparison field**
- **Full-bleed media with contained content**
- **Layered or overlapping composition**
- **Sticky or pinned narrative**
- **Horizontal sequence**

These families can have named implementations such as bento, masonry, split-screen, or sticky stack. The skill should derive those names from section job, relationship, density, and responsive needs.

### 5.4 Visual dominance

- **Text-led:** understanding depends primarily on language.
- **Media-led:** the image, video, artifact, or work sample carries the claim.
- **Balanced:** text and media are mutually necessary.
- **Data-led:** metrics or structured facts dominate.
- **Action-led:** the form, selector, or CTA is the focal object.

Visual dominance determines column ratio, first position, available measure, and mobile order.

### 5.5 Grouping mechanism

Use the lightest mechanism that communicates the relationship:

- Proximity and whitespace
- Shared alignment
- Typographic hierarchy
- Separator or rule
- Background tint
- Bounded surface or card
- Overlap or depth

Cards are not a default section architecture. They are appropriate when items require individual boundaries, independent actions, or elevation. Peer content that only needs grouping often works better with alignment and spacing.

## 6. Layout geometry

### 6.1 Container model

Classify each page or section container:

- **Viewport-bound:** fills available width; useful for backgrounds, immersive media, and deliberate edge-to-edge experiences.
- **Capped fluid:** grows with the viewport up to a maximum; the general default for site content.
- **Fixed band:** holds a stable reading or interaction width within a larger field.
- **Nested container:** a section or component has its own responsive context.
- **Hybrid:** full-bleed outer region plus contained inner content.

Container queries allow a component to respond to its own available inline size rather than the entire viewport. This is especially useful for cards, media objects, and reusable sections that can appear in both main content and side regions. [CSS Containment Module Level 3](https://www.w3.org/TR/css-contain-3/#container-queries)

### 6.2 Measure

Separate three widths:

- **Page measure:** maximum width of the overall content field.
- **Reading measure:** maximum width of continuous prose.
- **Component measure:** width required for a control, card, form, or media unit to remain usable.

Do not let a wide page container force prose to span the same width. WCAG's enhanced visual-presentation guidance uses a maximum of 80 characters or glyphs for blocks of text and explains why long lines impair tracking. [WAI: Understanding Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)

Practical categories for reading measure:

- **Narrow:** approximately 35-50 characters, for captions, callouts, and short support copy.
- **Standard:** approximately 50-75 characters, for most body content.
- **Extended:** up to 80 characters, for compact reference content where scanning remains comfortable.
- **Unbounded display:** only for short display text or non-prose data, never continuous reading.

### 6.3 Grid model

Choose a grid according to the number and type of relationships:

- **Single-axis flow:** no explicit column grid needed.
- **Simple fractional grid:** 2, 3, or 4 tracks for a local peer set.
- **12-column page grid:** flexible for halves, thirds, quarters, and offsets.
- **16-column page grid:** useful when finer alignment or product-like density is justified.
- **Content-derived grid:** `minmax()`, `auto-fit`, and intrinsic sizing let units wrap when their minimum viable width is reached.
- **Subgrid alignment:** nested units inherit parent tracks when cross-row alignment matters.
- **Masonry-like flow:** useful for visually browsable artifacts with variable heights, but weak for content that must be compared or read in a strict sequence.

Column count is not a quality score. GOV.UK's common two-thirds main-content layout, USWDS's 12-column model, and Carbon's 4/8/16 model all demonstrate that the correct geometry depends on content and system needs. [GOV.UK Layout](https://design-system.service.gov.uk/styles/layout/), [USWDS Layout Grid](https://designsystem.digital.gov/utilities/layout-grid/), [Carbon 2x Grid](https://v10.carbondesignsystem.com/guidelines/2x-grid/overview/)

### 6.4 Gutters, margins, and gaps

- **Margins** protect the composition from viewport edges and establish the page field.
- **Gutters** separate grid tracks.
- **Gaps** express local relationships within stacks, clusters, and components.
- **Padding** protects content inside a bounded surface.

Use a limited spacing scale. Atlassian's spacing guidance uses an 8-pixel base and a bounded token scale to make relationships consistent. [Atlassian Spacing](https://atlassian.design/foundations/grid-beta/applying-grid)

The skill should reason in relative tiers rather than fixed universal numbers:

- Inline micro-gap
- Intra-component gap
- Inter-component gap
- Section internal gap
- Section boundary gap
- Page-region gap

The semantic distance should increase with the conceptual distance.

## 7. Alignment and composition

### 7.1 Alignment axes

Record alignment independently for text, media, and containers:

- Start-edge aligned
- End-edge aligned
- Center aligned
- Baseline aligned
- Shared grid-line aligned
- Optically aligned
- Deliberately offset

Optical adjustment is allowed when geometric alignment looks wrong, but it should preserve a clear dominant axis. Accidental near-alignment is visual noise.

### 7.2 Composition balance

- **Symmetric:** reinforces stability, ceremony, equality, or a singular focal message.
- **Asymmetric balanced:** creates energy while preserving a readable path through scale, mass, and whitespace.
- **Directional:** deliberately leads toward a next section, action, or artifact.
- **Field composition:** distributes multiple points of interest for exploration.
- **Immersive:** reduces visible chrome so media or experience dominates.

High variance should mean controlled changes in scale, offset, and whitespace, not random placement. Each deviation needs an anchor: a shared edge, baseline, rhythm, or directional path.

### 7.3 Flow

- **Linear flow:** one clear top-to-bottom sequence.
- **Branching flow:** a hub exposes multiple valid routes.
- **Scan field:** users compare or browse items non-linearly.
- **Progressive disclosure:** summary first, detail on request or later in the page.
- **Scroll narrative:** sequence is coupled to scrolling, pinning, or staged revelation.
- **Loop / exploration:** related content encourages continued browsing rather than a single terminal action.

Do not use a scroll narrative when the content must be quickly scanned, searched, printed, or referenced. The behavior should reinforce the information relationship rather than supply spectacle.

## 8. Rhythm

Rhythm operates at several nested scales:

- **Typographic rhythm:** line height, paragraph spacing, heading intervals.
- **Component rhythm:** consistent internal stacks and repeated-unit spacing.
- **Section rhythm:** alternation of compression and release across the page.
- **Narrative rhythm:** alternation of claim, evidence, detail, and action.
- **Visual rhythm:** variation in media scale, orientation, color weight, and density.

Classify section transitions:

- **Continuous:** related ideas remain in the same spatial and visual flow.
- **Stepped:** a clear spacing or rule marks a new subtopic.
- **Reset:** a major change in scale or composition starts a new chapter.
- **Bridge:** a quote, metric, media moment, or transitional statement links two chapters.
- **Crescendo:** density or scale builds toward evidence or action.
- **Release:** a sparse section follows dense information to restore focus.

Avoid two extremes:

- Uniform section padding and repeated section headers create metronomic template rhythm.
- Arbitrary spacing changes destroy grouping and make the page feel accidental.

Use a spacing system, then vary within named tiers according to semantic distance.

## 9. Navigation and orientation

### 9.1 Navigation layers

- **Global navigation:** stable top-level destinations.
- **Local navigation:** peers or children within a site section.
- **In-page navigation:** anchors for long, sectioned pages.
- **Contextual navigation:** related work, next article, previous case, or supporting content.
- **Utility navigation:** account, language, legal, help, search, or secondary functions.
- **Action navigation:** persistent primary task or conversion route.

WAI notes that menus reflect site structure and should expose recognizable states such as current page, work across input methods, and adapt to text and viewport changes. [WAI Menus Tutorial](https://www.w3.org/WAI/tutorials/menus/)

### 9.2 Orientation mechanisms

Use the smallest sufficient set:

- Clear page title and introduction
- Current-item state in navigation
- Breadcrumbs for meaningful hierarchy
- Section headings and landmark regions
- In-page contents for long structured pages
- Progress indicator for a true sequence
- Back or parent route for drill-in patterns
- Search and alternate discovery methods for large corpora

USWDS recommends in-page navigation for lengthy pages and places it beside the main content at wide widths. [USWDS In-page Navigation](https://designsystem.digital.gov/components/in-page-navigation/)

### 9.3 Navigation density

- **Minimal:** identity plus one primary action or a few anchors.
- **Compact:** a small set of stable top-level destinations.
- **Expanded:** top-level destinations plus grouped secondary routes.
- **Local-heavy:** global shell plus persistent section navigation.
- **Search-led:** search and filtering are primary discovery tools.

Landing pages often use minimal or compact navigation. Portfolios usually need compact global navigation plus strong contextual continuation between work. General websites may require local-heavy or search-led models when depth grows.

### 9.4 Non-negotiable navigation constraints

- Repeated content must be bypassable, commonly with a skip link and meaningful landmarks. [WAI: Understanding Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks)
- Focus order must preserve meaning and operation. [WAI: Understanding Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- Headings and labels must describe topic or purpose. [WAI: Understanding Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)
- Repeated navigation should remain consistent across pages unless the user initiates a change. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## 10. Content priority

### 10.1 Priority tiers

Assign every meaningful content block a tier:

- **P0 - task or proposition:** the page fails without it.
- **P1 - decision evidence:** needed to trust, choose, or continue.
- **P2 - explanatory depth:** useful after initial relevance is established.
- **P3 - enrichment:** supports exploration, voice, or completeness.
- **P4 - utility or compliance:** required but usually not central to the page narrative.

Priority controls:

- Source order
- Visual dominance
- Initial viewport presence
- Column allocation
- Responsive order
- Whether content may collapse, move behind disclosure, or shift to another page

P0 and essential P1 content should not disappear at narrow widths. Responsive design can change presentation and interaction, not silently remove necessary meaning or capability.

### 10.2 Evidence hierarchy

For marketing and portfolio pages, distinguish evidence strength:

- Direct artifact or live demonstration
- Verified outcome or metric
- Specific case narrative
- Named client or credential
- Detailed method or process
- Testimonial
- Unsupported claim

The architecture should place stronger evidence closer to the claim it supports. Decorative social proof should not displace a real demonstration.

## 11. Content-density categories

Density should be measured at both page and section level. A sparse page can contain one dense comparison section, and a reference page can use a sparse opening.

### 11.1 Density dimensions

Assess density through:

- Number of distinct information units visible at once
- Number of simultaneous choices
- Average text measure and paragraph depth
- Repetition rate of similar units
- Ratio of active controls to passive content
- Visual separation between groups
- Need to compare items without scrolling
- Familiarity and expertise of the audience

### 11.2 Density bands

#### A. Focal / cinematic

- One dominant message or artifact per viewport
- Very few choices
- Large scale and high whitespace
- Best for identity, launches, selected portfolio moments, and emotional storytelling
- Risk: insufficient evidence, hidden navigation, or excessive scroll cost

#### B. Editorial / narrative

- One reading path with occasional media or callouts
- Restrained choices and comfortable reading measure
- Best for case studies, essays, about pages, and brand stories
- Risk: monotony or slow access to key outcomes

#### C. Balanced / marketing

- A moderate number of grouped messages, evidence units, and actions
- Alternates focal sections with scannable sets
- Best default for general landing pages and small websites
- Risk: templated repetition if every section uses the same density and composition

#### D. Catalog / comparative

- Many peer items or attributes are visible to support scanning and choice
- Strong labels, filters, alignment, or grouping
- Best for portfolio indexes, product families, resource hubs, and comparisons
- Risk: weak hierarchy and choice overload

#### E. Reference / operational

- High information and control density
- Optimized for retrieval, repeated use, or expert comparison
- Usually outside the primary scope of a marketing-focused frontend skill
- Use an established product or government design system when this density is central
- Risk: inaccessible compression, accidental dashboard aesthetics, and poor narrow-screen transformation

Density is not equivalent to visual busyness. A section with no cards can still be dense; a grid of large decorative cards can be visually busy but informationally thin.

## 12. Responsive transformation categories

For every multi-region page and multi-column section, specify a transformation rather than writing "stacks on mobile."

### 12.1 Geometric transformations

- **Scale:** type, media, spacing, and track sizes change fluidly.
- **Wrap:** peers create additional rows when minimum viable width is reached.
- **Stack:** columns become one ordered flow.
- **Re-span:** items receive different grid spans while keeping the same relationships.
- **Reposition:** a secondary region moves before or after main content according to priority.
- **Crop or aspect shift:** media framing changes while preserving the subject.
- **Contain:** full-bleed content becomes inset, or vice versa, when edge treatment changes.

### 12.2 Structural transformations

- **Collapse:** optional detail moves into a disclosure while remaining available.
- **Condense:** navigation labels or metadata reduce without becoming ambiguous.
- **Substitute:** a sidebar becomes a menu trigger or sheet.
- **Paginate / drill in:** a wide list-detail view becomes separate views.
- **Scroll:** a comparison or gallery uses deliberate one-axis overflow when two-dimensional layout is essential.
- **Remove duplication:** redundant decoration or repeated labels disappear, but unique content remains.

### 12.3 Priority rules for transformation

1. Preserve semantic source order.
2. Preserve P0 and necessary P1 content and actions.
3. Preserve relationships that carry meaning, especially sequence and comparison.
4. Reduce simultaneous choices before reducing legibility.
5. Convert auxiliary panes into on-demand interfaces before placing long link lists above the main content.
6. Use container queries for reusable units and viewport queries for page-level shell changes.
7. Test at intermediate widths, zoom, longer translations, and enlarged default fonts, not only a few named breakpoints.

Primer explicitly warns that stacking a link-heavy pane above main content can bury the content and recommends other responsive navigation patterns. [Primer Layout](https://primer.style/product/getting-started/foundations/layout/)

## 13. Profiles for the three target page families

These are category profiles, not templates.

### 13.1 Landing pages

Typical decisions:

- Site scope: single-purpose or shallow hub-and-spoke
- Page role: campaign / landing
- Visitor mode: orient, evaluate, act
- Narrative spine: proposition-first, evidence-first, or task-first
- Navigation density: minimal or compact
- Density: focal opening, balanced middle, focused action close
- Strongest requirement: clarity of one primary outcome

Useful exceptions:

- Remove or simplify the header when it distracts from a single, well-understood action.
- Lead with demonstration when the product or work is self-explanatory.
- Use a centered focal opening when the message itself is the visual event.

### 13.2 Portfolios

Typical decisions:

- Site scope: portfolio corpus
- Organizing principle: object / project, possibly faceted by discipline or industry
- Page roles: portfolio index plus case-study details
- Visitor modes: explore, evaluate, verify authorship and capability
- Narrative spine: evidence-first for the index; story, problem-to-resolution, or outcome-first for a case study
- Density: catalog / comparative index, editorial case study, focal media moments
- Strongest requirement: visible work and clear contribution, not atmospheric claims alone

Useful exceptions:

- Experimental composition may be justified when interaction and art direction are themselves evidence of capability.
- A highly selective portfolio may be flat and immersive; a broad practice needs stronger indexing and filtering.
- Chronology is useful only when growth, process, or project sequence matters. It should not be the default ordering for all work.

### 13.3 General websites

Typical decisions:

- Site scope: small general site through sectioned resource site
- Organizing principle: task or topic, with object-based collections as needed
- Page roles: home, hub, detail, action, trust, utility
- Visitor modes: mixed entry and mixed intent
- Narrative spine: varies by page role rather than being repeated site-wide
- Navigation density: compact, expanded, local-heavy, or search-led according to depth
- Density: balanced on overview pages, editorial on detail pages, catalog on hubs
- Strongest requirement: coherent wayfinding across different page roles

Useful exceptions:

- A content-heavy page can be dense if it is a reference destination, but its opening should establish scope and its navigation should expose structure.
- A simple small-business site does not need mega-navigation, filters, or a deep taxonomy merely because those patterns are available.

## 14. Exceptions and deliberate departures

A professional skill should allow exceptions but require a reason and a fallback.

### 14.1 Valid exception tests

A departure is defensible when at least one is true:

- It expresses a real content relationship that the default pattern cannot.
- It is evidence of the creator's craft or brand behavior.
- It materially improves a primary user task.
- It supports a known audience behavior established by research.
- It is required by an established design system or platform context.

It must also pass all of these:

- Logical source and focus order remain intact.
- Essential content and functionality survive reflow.
- Navigation and current location remain understandable.
- The exception has a narrow-screen and reduced-motion behavior where relevant.
- The exception does not repeat until it becomes noise.

### 14.2 Common exceptions

- **No global header:** acceptable for a focused campaign with one destination; provide identity, a clear exit or home route when necessary, and a footer.
- **Centered hero:** acceptable for a short manifesto, announcement, or singular proposition.
- **Full-bleed media:** acceptable when media is evidence or atmosphere central to the experience; keep captions and controls accessible.
- **Horizontal overflow:** acceptable for maps, comparisons, timelines, or galleries whose relationships need a second dimension; never make the whole page scroll in two dimensions.
- **Intentional asymmetry:** acceptable when anchored by grid lines, scale, or directional flow; collapse to a logical narrow layout.
- **Dense section:** acceptable for a genuine comparison or reference job; isolate it and provide scanning aids.
- **Theme or rhythm break:** acceptable once as a chapter change or narrative reset; random alternating section themes indicate a missing system.

## 15. Operational decision sequence

The skill should ask or infer decisions in this order:

1. Identify audience, entry model, primary need, and required outcome.
2. Classify site scope, organizing principle, and hierarchy shape.
3. Classify the page role and dominant visitor mode.
4. Choose one primary narrative spine.
5. List required content and assign P0-P4 priority.
6. Build the section sequence from functional jobs.
7. Classify each section's content relationship and visual dominance.
8. Select composition families and verify that repeated sections do not create a template rhythm.
9. Choose container, measure, grid, and spacing models.
10. Define global, local, in-page, contextual, utility, and action navigation only where needed.
11. Assign page-level and section-level density bands.
12. Define explicit responsive transformations for every multi-column or multi-region structure.
13. Verify semantic order, headings, landmarks, focus order, bypass, reflow, and orientation.
14. Allow exceptions only with a stated reason and fallback.

## 16. Recommended category tree

```text
Architecture and Layout
|
+-- 1. Context
|   +-- Audience and expertise
|   +-- User need and desired outcome
|   +-- Entry model
|   +-- Brand and platform constraints
|
+-- 2. Site Information Architecture
|   +-- Scope
|   |   +-- Single-purpose
|   |   +-- Portfolio corpus
|   |   +-- Small general site
|   |   +-- Sectioned resource site
|   |   +-- Large service / institutional site
|   +-- Organizing principle
|   |   +-- Task
|   |   +-- Topic
|   |   +-- Audience
|   |   +-- Object / portfolio
|   |   +-- Lifecycle
|   |   +-- Hybrid
|   +-- Hierarchy shape
|       +-- Flat
|       +-- Hub-and-spoke
|       +-- Nested
|       +-- Faceted
|       +-- Sequential
|       +-- Networked
|
+-- 3. Page Architecture
|   +-- Page role
|   +-- Visitor mode
|   +-- Region model
|   +-- Narrative spine
|   +-- Functional section sequence
|   +-- Content priority P0-P4
|   +-- Page density band
|
+-- 4. Section Architecture
|   +-- Section job
|   +-- Content relationship
|   +-- Visual dominance
|   +-- Composition family
|   +-- Grouping mechanism
|   +-- Section density band
|   +-- Transition role
|
+-- 5. Layout Geometry
|   +-- Container model
|   +-- Page, reading, and component measure
|   +-- Grid model
|   +-- Columns, spans, and offsets
|   +-- Margins, gutters, gaps, and padding
|   +-- Alignment axes
|   +-- Composition balance
|
+-- 6. Flow and Rhythm
|   +-- Linear, branching, scan, disclosure, scroll, loop
|   +-- Typographic rhythm
|   +-- Component rhythm
|   +-- Section rhythm
|   +-- Narrative rhythm
|   +-- Continuous, stepped, reset, bridge, crescendo, release
|
+-- 7. Navigation and Orientation
|   +-- Global
|   +-- Local
|   +-- In-page
|   +-- Contextual
|   +-- Utility
|   +-- Action
|   +-- Page title, current state, breadcrumb, contents, progress, search
|
+-- 8. Responsive Transformation
|   +-- Scale
|   +-- Wrap
|   +-- Stack
|   +-- Re-span
|   +-- Reposition
|   +-- Crop / aspect shift
|   +-- Collapse / condense
|   +-- Substitute
|   +-- Paginate / drill in
|   +-- Deliberate one-axis scroll
|
+-- 9. Constraints and Exceptions
    +-- Semantic and focus order
    +-- Reflow and zoom
    +-- Landmarks and headings
    +-- Priority preservation
    +-- Motion and input fallback
    +-- Evidence-based departures
```

## 17. Relationships between categories

The tree is not a menu of independent style choices. Its branches constrain each other in a specific direction:

```text
Context
  -> shapes Site IA
  -> assigns Page Role and Visitor Mode
  -> determines Content Priority
  -> selects Narrative Spine and Section Jobs
  -> exposes Content Relationships
  -> selects Composition and Density
  -> determines Geometry and Navigation
  -> requires Responsive Transformations
  -> is checked against Accessibility Constraints
```

Key relationship rules:

- **Site scope + hierarchy shape -> navigation layers.** Deep nested sites justify local navigation and breadcrumbs; flat campaign sites usually do not.
- **Page role + visitor mode -> narrative spine.** A campaign for new visitors needs context; a reference page for returning visitors needs rapid retrieval.
- **Section job + content relationship -> composition family.** A peer set suggests a repeated grid or list; a ranked set suggests asymmetric spans; a sequence needs preserved order.
- **Visual dominance + evidence strength -> allocation.** If the artifact is the strongest evidence, media receives first position and more space.
- **Priority + source order -> responsive order.** Narrow layouts should expose P0 and essential P1 content early without CSS-only logical reordering.
- **Density + audience expertise -> grouping and disclosure.** Expert reference use can sustain greater density; first-impression pages require stronger filtering and prioritization.
- **Container model + component reuse -> query strategy.** Page shells respond to viewport ranges; reusable components respond to their container.
- **Reading measure + page width -> nested containers.** Wide visual fields still need constrained prose.
- **Rhythm + section sequence -> perceived hierarchy.** Spacing and composition changes should mark narrative shifts, not decorate every section differently.
- **Exception -> explicit fallback.** Any immersive, asymmetric, sticky, horizontal, or unusually dense treatment must declare its semantic order and narrow-screen transformation.

The recommended implementation for a design skill is therefore a set of orthogonal selectors plus relationship rules. Named patterns should appear only after these decisions, as shorthand for a compatible combination of page role, section job, content relationship, density, geometry, and responsive behavior.
