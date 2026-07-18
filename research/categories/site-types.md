# Site-Type and Project-Context Taxonomy for a Frontend Design Skill

**Status:** Research synthesis  
**Date:** 2026-07-18  
**Purpose:** Give a design skill a small, reusable set of website archetypes that produces materially different design decisions without degenerating into an industry directory.

## 1. Scope

This taxonomy covers public-facing frontend projects in three broad briefs:

- portfolios and professional profiles;
- general websites, from organizational sites to publications, catalogs, and public services;
- landing pages and campaign pages.

It classifies the **experience being designed**, not the owner's industry. A university site, for example, may contain an institutional homepage, a program catalog, editorial news, documentation-like policies, and an application transaction. Calling all of those pages “education” does not tell the skill how to structure them.

The useful unit of classification is therefore the **page, template family, or bounded journey**, with a primary archetype and, when needed, one secondary archetype. A whole site is usually a composition of archetypes.

This report does not attempt to classify product dashboards, operating-system-like tools, games, or native apps. Public utilities and bounded web transactions are included because they commonly appear inside websites. Authenticated workspaces are adjacent, but their dense, repeated-task interaction model deserves a separate product-interface taxonomy.

### Working model

Treat project context as:

> **primary user job × journey shape × content model × decision/risk context × operating constraints**

The user job is the first classifier. The other dimensions modify the design. This follows the government service-design principle of starting with what people are trying to achieve, not a presumed solution or organizational structure ([GOV.UK, “Learning about users and their needs”](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs); [GOV.UK Service Standard, point 1](https://www.gov.uk/service-manual/service-standard/point-1-understand-user-needs)).

## 2. Recommended top-level categories

Use six top-level categories. They are few enough to be operational and broad enough to cover the target scope.

| Category | Primary user job | Typical project forms | Default design posture |
|---|---|---|---|
| **1. Proof and identity** | Assess a person, team, capability, or body of work | Individual portfolio, studio portfolio, résumé/profile, artist archive | Curated evidence, fast fit assessment, memorable authorship |
| **2. Offer and campaign** | Decide whether to take one promoted next step | Product/service landing page, launch, lead generation, event campaign, waitlist, donation appeal | Message continuity, one dominant action, proof and objection handling |
| **3. Organization and orientation** | Understand an organization and find the right path | Corporate/brochure site, institution, local service business, program or venue site | Clear scope, trust, audience routing, durable navigation |
| **4. Content and knowledge** | Learn, keep up, or retrieve an answer | Publication, blog, documentation, guide, learning hub, resource center | Readability, findability, hierarchy, freshness and provenance |
| **5. Catalog and discovery** | Find, compare, and select among many entities | Commerce catalog, directory, marketplace, archive, collection, listings | Search/browse/filter, comparable metadata, entity detail, saved state |
| **6. Task and transaction** | Complete a bounded action correctly | Booking, registration, application, quote, checkout, donation, calculator | Low-friction sequence, validation, recovery, status and completion confidence |

These names describe stable interaction problems. Industry and business-model labels can be attached as context, but should not replace the archetype.

## 3. Taxonomy in detail

### 3.1 Proof and identity

**Core goal:** turn claims about ability, taste, experience, or authorship into credible evidence.

**Primary audiences:** hiring managers, prospective clients, collaborators, commissioners, galleries, press, or peers. Secondary audiences often include people seeking a biography, contact route, downloadable credentials, or a specific artifact.

**Core content model:** profile; positioning statement; selected work; project/case-study; role and contribution; outcome or artifact; client/employer; capabilities; chronology; testimonial; recognition; contact/action.

**Default journey:** referral/search/social link → identity and fit scan → work index or featured work → selected case study/artifact → credibility detail → contact, interview, inquiry, follow, or download.

| Subtype | What changes | Design consequence |
|---|---|---|
| **Case-study portfolio** | Evaluators need to understand decisions, constraints, contribution, and outcomes | Lead with a scannable work index; make role and impact explicit; use a repeatable case-study spine; allow both summary and depth |
| **Visual body-of-work** | The artifact itself carries most of the evidence | Increase image/video fidelity and sequencing; reduce explanatory chrome; add captions, medium, year, and accessible alternatives without competing with the work |
| **Studio or service portfolio** | The visitor evaluates both demonstrated craft and the ability to solve their own problem | Connect projects to capabilities, sectors/problems, process, proof, and inquiry; avoid a work gallery that never explains relevance |
| **Résumé/profile site** | The decision is often a rapid credibility and fit check | Prioritize role, scope, chronology, selected proof, availability, location/time-zone if relevant, and a portable résumé/contact route |

The meaningful split is not “designer vs developer vs photographer.” It is **evidence format and evaluation depth**: process-heavy cases, artifact-led work, service-selling evidence, or credential-led profile. Nielsen Norman Group’s UX careers research reports that hiring managers treat portfolios as important and want evidence of workflow and thought process, supporting the case-study subtype as more than a visual gallery ([NN/g, *User Experience Careers*, 2nd edition PDF](https://media.nngroup.com/media/reports/free/UserExperienceCareers_2nd_Edition.pdf)).

**Failure modes:** biography before evidence; undifferentiated project grids; case studies that conceal the creator’s role; dramatic motion that delays evaluation; confidential work presented without useful abstraction; every project given equal weight.

### 3.2 Offer and campaign

**Core goal:** persuade a defined audience to take one promoted next step in response to an offer, event, cause, or announcement.

**Primary audiences:** campaign traffic, prospects at a known awareness stage, invited attendees, launch followers, donors, applicants, or a narrow segment reached through a specific channel.

**Core content model:** audience/problem; promise; offer; mechanism/features; proof; comparison; objections/FAQ; risk reversal; terms; urgency or availability; primary CTA; confirmation/next step.

**Default journey:** ad/email/social/referral/search → message confirmation → value and relevance scan → proof and objection resolution → CTA → form/payment/registration or handoff.

| Subtype | What changes | Design consequence |
|---|---|---|
| **Direct-response offer** | The visitor is expected to convert in-session | Tight message hierarchy, repeated but consistent CTA, concrete proof, price/terms where possible, minimal exit paths |
| **Lead generation or consultation** | The action begins a later human decision | Qualify the lead, explain what happens next, request only necessary information, show response expectations and fit boundaries |
| **Launch or prelaunch** | Availability, novelty, and incomplete proof shape the decision | Make status and timing explicit; use demos, roadmap boundaries, early evidence, waitlist expectations, and launch updates |
| **Event or timed campaign** | Date, location, schedule, capacity, and deadline dominate | Surface logistics early; preserve timezone and accessibility details; make register/add-to-calendar/share paths obvious |
| **Cause, donation, or recruitment appeal** | Values alignment and stewardship matter alongside conversion | Explain need, intended impact, legitimacy, use of funds/effort, recurring commitment, and alternatives to the primary ask |

A landing page is partly a **container constraint**, not always a distinct purpose: it assumes limited context and usually a dominant action. USWDS advises that landing pages contextualize quickly, stay simple, and remove unnecessary elements; it also distinguishes them from internal pages where readers seek depth ([USWDS landing-page guidance](https://designsystem.digital.gov/templates/landing-page/)). Thus an agency portfolio page, conference page, or donation page may use the landing-page mode while retaining its underlying proof, event, or transaction needs.

**Failure modes:** multiple equally loud CTAs; traffic-source promise not repeated on arrival; vague superlatives before a concrete offer; proof unrelated to the claim; forms before sufficient motivation; invented urgency; a “long page” template filled regardless of evidence.

### 3.3 Organization and orientation

**Core goal:** establish what an organization is, why it is credible, and where different visitors should go.

**Primary audiences:** customers, partners, members, citizens, press, funders, recruits, vendors, families, or local visitors. This category commonly has more than one high-value audience and more than one legitimate task.

**Core content model:** organization; mission/positioning; services/programs; locations; people; governance; proof/results; policies; news; contact/support; audience or task gateways.

**Default journey:** branded/search/referral arrival → scope and legitimacy check → self-identification by need or audience → relevant service/program/detail → contact, visit, inquiry, or downstream task.

| Subtype | What changes | Design consequence |
|---|---|---|
| **Focused brochure site** | Few offers, audiences, and pages | Compact navigation; strong overview; direct service-to-proof-to-contact paths; avoid mega-navigation |
| **Multi-audience institution** | Many groups arrive with distinct priorities | Stable information architecture, audience/task gateways, strong site search where warranted, restrained homepage routing, clear ownership and freshness signals |
| **Local or appointment-led organization** | Place, hours, availability, service area, and contact are decision-critical | Persistent location/contact/action details; map and transport context; opening exceptions; mobile-first call/book/directions paths |
| **Program, venue, or recurring event site** | The organization is understood through changing programs and dates | Treat program/event as structured entities; feature current and upcoming items; archive past items without confusing availability |

Organizational structure should not automatically become navigation. GOV.UK explicitly recommends scoping around tasks as users recognize them and not exposing internal structures ([“Getting the scope of your transaction right”](https://www.gov.uk/service-manual/design/scoping-your-service)). The homepage’s role is often routing and orientation rather than forcing all institutional content into one narrative.

**Failure modes:** department-shaped navigation; mission language that never defines the actual offer; homepages as internal stakeholder billboards; contact details buried; stale announcements dominating durable tasks; visual prestige substituting for proof and clarity.

### 3.4 Content and knowledge

**Core goal:** help people consume, understand, retrieve, and return to maintained information.

**Primary audiences:** readers, subscribers, learners, practitioners, developers, customers seeking support, researchers, or people answering a time-sensitive question.

**Core content model:** article/document; author/owner; topic; series; date and updated date; status/version; summary; body; media/code; related content; citation/source; next/previous; subscription or feedback.

**Default journeys:**

- **Known-item:** search/deep link → answer → related detail or action.
- **Exploratory:** homepage/topic → scan collection → article/document → next item or subscribe.
- **Learning:** start/overview → ordered modules or progressively deeper material → practice/reference → completion or return.

| Subtype | What changes | Design consequence |
|---|---|---|
| **Editorial publication** | Recency, voice, authorship, and discovery drive return visits | Strong article reading experience, editorial hierarchy, topic/author routes, publish dates, newsletter/follow paths, intentional recirculation |
| **Documentation/reference** | Users often arrive deep with a specific question | Persistent hierarchy and search, descriptive headings, anchors, version/status, examples, related prerequisites; less introductory theater on leaf pages |
| **Guide or learning path** | Sequence and accumulated understanding matter | Show prerequisites, progress/position, next step, summaries, and optional reference exits; keep the path coherent across sessions |
| **Resource hub** | Mixed formats support a domain or funnel | Normalize metadata and filters only when volume warrants them; distinguish evergreen guides from news, templates, videos, and events |

USWDS notes that documentation visitors often arrive from a landing page or search and therefore need less contextual introduction on the document itself ([USWDS documentation-page guidance](https://designsystem.digital.gov/templates/documentation-page/)). Google’s people-first guidance similarly favors a clear site purpose, first-hand expertise, and content that leaves a visitor able to achieve a goal, rather than publishing across many topics only for search traffic ([Google Search Central, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).

**Failure modes:** every article presented as a marketing landing page; weak information scent; missing authorship/version/freshness; deep pages that cannot reveal their place in the corpus; topic taxonomies created before content volume exists; related-content carousels that optimize clicks rather than task continuation.

### 3.5 Catalog and discovery

**Core goal:** help people find and compare the right entity within a collection too large or variable for a fixed narrative.

**Primary audiences:** shoppers, renters, buyers, visitors, patrons, researchers, collectors, job seekers, or people locating a service/provider/resource.

**Core content model:** entity; category; attributes/facets; media; price/availability/status where relevant; location; provider/creator; review/evidence; relationship; variant; comparison; saved item; query and filter state.

**Default journey:** category/search entry → scan results → filter/sort/refine → inspect one or more detail pages → compare/save/select → transaction, contact, download, visit, or external handoff.

| Subtype | What changes | Design consequence |
|---|---|---|
| **Commerce catalog** | Price, variants, stock, delivery, returns, and purchase readiness matter | Comparable product cards, reliable filters, decision-rich product detail, variant state, cart continuity, explicit fulfillment and return information |
| **Directory or marketplace** | Provider/entity trust and fit matter; fulfillment may happen elsewhere | Strong attributes and location, provider identity, freshness/verification, contact or handoff clarity, protection against empty/duplicate listings |
| **Library, archive, or collection** | Provenance, relationships, and exploration may outweigh conversion | Rich metadata, multiple browse paths, citation/share/download rules, preservation of context, high-fidelity media where justified |
| **Comparison or selection tool** | Users must trade off a small number of consequential options | Normalize attributes, reveal differences, support shortlist/compare, explain missing data and recommendation logic |

Catalog design is structurally distinct because product/list pages and filters determine whether users can reach a suitable detail page. Baymard’s large-scale testing treats product lists, product details, and checkout as separate usability systems ([product-list and filtering research](https://baymard.com/research/ecommerce-product-lists); [product-detail research](https://baymard.com/research/product-page)). Google likewise recommends crawlable category-to-subcategory-to-product links, showing that navigation structure affects both human discovery and content discovery by search systems ([Google Search Central, ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)).

**Failure modes:** card grids without meaningful attributes; filters copied from another catalog; search as the only way to reach entities; detail pages detached from return-to-results state; visual novelty that makes comparison harder; fake completeness when inventory or metadata is sparse.

### 3.6 Task and transaction

**Core goal:** let a user complete a bounded action accurately, safely, and with confidence about the outcome.

**Primary audiences:** applicants, customers, attendees, donors, patients/clients, members, citizens, or visitors calculating, configuring, uploading, signing, paying, or scheduling.

**Core content model:** eligibility/preconditions; task state; steps; fields and choices; validation; price/fees; consent; review; payment or submission; confirmation/reference; status; support and recovery.

**Default journey:** eligibility/expectation → start → provide information/choose → review → commit → confirmation → status, receipt, next step, or support.

| Subtype | What changes | Design consequence |
|---|---|---|
| **Short request/contact/quote** | Low commitment but uncertain follow-up | Explain response, timing, data use, and qualification; keep fields proportional to the next action |
| **Booking or registration** | Availability, time, place, party size, cancellation, and reminders matter | Make constraints visible before commitment; preserve selections; handle timezone; show confirmation and change/cancel routes |
| **Application or eligibility flow** | High effort, documentation, uncertainty, and pauses are common | State requirements up front; support save/resume when genuinely needed; show progress and status; prevent loss; provide assistance and recovery |
| **Checkout, payment, or donation** | Financial trust, totals, delivery/use of funds, and irreversible commitment dominate | Preserve cart/amount, expose total cost, minimize distractions, support error recovery, review before commit, and issue durable confirmation |
| **Calculator or configurator** | Inputs produce an explanatory result rather than a submission | Make assumptions and units explicit; allow correction; explain result confidence and next action; preserve shareable state when useful |

The transaction should be scoped as a coherent part of the user’s wider goal, not just the organization’s form. GOV.UK recommends mapping the whole journey and avoiding dead ends ([“Map and understand a user’s whole problem”](https://www.gov.uk/service-manual/design/map-a-users-whole-problem); [“Designing good government services”](https://www.gov.uk/service-manual/design/introduction-designing-government-services)). For commerce, Baymard’s research separately identifies cart, account, address, fulfillment, payment, review, confirmation, validation, and recovery as consequential parts of checkout ([Baymard cart and checkout research](https://baymard.com/research/checkout-usability)).

**Failure modes:** collecting data before explaining value or eligibility; losing entered data; hidden fees or constraints; progress indicators that do not reflect effort; no path from validation error to recovery; weak confirmation; marketing navigation competing with a high-consequence task.

## 4. Decision variables that actually change design

The top-level archetype supplies the starting pattern. The variables below decide the layout, information architecture, copy, interaction density, and proof burden. They are more useful than a long list of industries.

| Variable | Useful values | Design decisions it changes |
|---|---|---|
| **Primary user verb** | assess, understand, learn, find, compare, choose, complete, return | Page hierarchy, dominant component, success event, CTA language |
| **Journey shape** | single-step, linear, exploratory, iterative comparison, recurring | Navigation freedom, progress UI, backtracking/state preservation, next-step cues |
| **Audience multiplicity** | one segment, several compatible segments, conflicting tasks | Homepage routing, navigation labels, personalization need, amount of shared messaging |
| **Awareness and intent** | unaware, problem-aware, solution-aware, brand-aware, ready | Context required before CTA, explanation depth, offer specificity, proof placement |
| **Traffic context** | campaign, branded search, generic search, referral, direct/return | Message continuity, landing context, navigation exposure, deep-link resilience |
| **Commitment and reversibility** | browse, subscribe, contact, apply, pay, irreversible submission | Friction budget, review step, confirmation strength, risk explanation, support visibility |
| **Perceived risk and trust burden** | low/high financial, privacy, safety, reputation, eligibility | Evidence types, policy proximity, identity signals, consent, error prevention, human help |
| **Decision complexity** | impulse, considered solo, group/committee, procurement | Comparison depth, downloadable/shareable evidence, pricing clarity, stakeholder-specific proof |
| **Content unit** | project, article, product, listing, program, event, step | Schema, card anatomy, detail template, relationships and metadata |
| **Corpus size and variance** | handful, dozens, thousands; homogeneous/heterogeneous | Fixed navigation vs search/filter, taxonomy depth, pagination, empty states |
| **Freshness and cadence** | evergreen, periodic, live inventory, deadline-driven | Date/status prominence, archive behavior, update ownership, expired-state design |
| **Return frequency** | one-off, occasional, habitual | Onboarding, remembered state, subscription, shortcuts, density, recency signals |
| **Evidence available** | artifacts, metrics, testimonials, credentials, demo, none yet | Proof format and claim strength; whether a persuasive design is supportable at all |
| **Geography and locale** | global, regional, local; one/many languages | Location prominence, units, timezone, currency, address formats, language expansion |
| **Device and use context** | desk research, mobile on the move, poor network, assistive technology | Density, persistent actions, media weight, offline/low-bandwidth tolerance, input method |
| **Brand-expression tolerance** | artifact is the brand, trust requires restraint, commodity comparison | Typographic/visual distinctiveness, motion budget, convention adherence |
| **Content ownership** | single author, editorial team, distributed departments, user-generated | Template rigidity, governance fields, moderation, provenance, freshness safeguards |
| **Technical constraints** | static content, CMS, live inventory, third-party handoff, legal platform | State and error handling, preview needs, integration seams, fallback and loading behavior |

### Hard branch variables vs tuning variables

Some differences warrant a different archetype; others only tune it.

**Usually a hard branch:** the dominant user verb changes; a browseable corpus becomes large enough to require retrieval tools; a narrative page becomes a multi-step commitment; a one-time reader becomes a repeated operator; or the content unit changes from prose to comparable entities.

**Usually a modifier:** B2B/B2C, nonprofit/commercial, personal/company, premium/mass-market, or a named industry. These labels matter only through concrete consequences such as committee buying, regulation, price visibility, evidence standards, service area, or emotional stakes.

## 5. Cross-cutting constraints

These do not create new site types because they apply across the taxonomy, but they can override aesthetic or interaction choices.

- **Accessibility:** treat WCAG 2.2 conformance and inclusive research as baseline, not an “accessible site” subtype. W3C’s standard covers perceivability, operability, understandability, and robustness across web content ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)). High-motion portfolios, media-rich catalogs, dense directories, and long transactions express different risks, but none are exempt.
- **Performance:** loading, responsiveness, and visual stability apply to every archetype. Google defines Core Web Vitals as page-wide quality signals for loading, interactivity, and layout stability ([web.dev, Web Vitals](https://web.dev/articles/vitals)). Performance budgets should be stricter when campaign traffic is mobile, visual work is media-heavy, or task continuity is consequential.
- **Privacy, security, and legal obligations:** these scale with data sensitivity, payment, health/safety, age, jurisdiction, and commitment. They are risk modifiers, not visual categories.
- **Responsive behavior:** mobile, desktop, touch, keyboard, and zoom are operating contexts. “Mobile website” is not a site type.
- **Search/discoverability:** structured, useful content and crawlable navigation matter especially to publishing and catalogs, but discovery strategy does not justify a separate “SEO site” category.

## 6. Overlaps and composition rules

### Classify the dominant job, not the whole brand

Use this sequence:

1. Name the user’s primary verb on the page or bounded journey.
2. Name the success outcome for both user and owner.
3. Select one primary archetype.
4. Add one secondary archetype only if it changes the page structure.
5. Apply decision variables and cross-cutting constraints.

Examples of useful compositions:

| Brief | Composition | Why |
|---|---|---|
| Agency website | Proof and identity + offer and campaign | Work demonstrates capability; service pages convert relevant prospects |
| Software marketing site | Offer and campaign + organization and orientation + content and knowledge | Acquisition, company trust, and documentation are different template families |
| Online shop | Catalog and discovery + task and transaction | Product finding and checkout require different structures and states |
| Nonprofit website | Organization and orientation + offer and campaign + task and transaction | Mission/trust, appeals, and donation/volunteer flows are distinct jobs |
| Conference site | Offer and campaign + catalog and discovery + task and transaction | Event proposition, schedule/speaker discovery, and registration coexist |
| University website | Organization and orientation + catalog and discovery + content and knowledge + task and transaction | Audience routing, program finding, policies/news, and application should not share one template logic |
| Artist site selling editions | Proof and identity + catalog and discovery + task and transaction | The same works can serve authorship, selection, and purchase with different emphasis |

### Resolve common overlaps

- **Portfolio vs landing page:** choose proof and identity when evaluation of a body of work is central; choose offer and campaign when one service/offer and CTA dominate. A portfolio homepage can use landing-page restraint without becoming a campaign.
- **Institutional vs content site:** choose organization and orientation when visitors primarily need scope, legitimacy, and routing; choose content and knowledge when the maintained corpus is the product.
- **Catalog vs content hub:** choose catalog when structured attributes and comparison drive selection; choose content when reading and understanding are primary. A resource library may sit between them.
- **Landing page vs transaction:** the landing page motivates and qualifies; the transaction completes. Do not force a long persuasive narrative into every step of a form or checkout.
- **Directory vs marketplace:** they share catalog discovery. Add transaction behavior only when the site mediates booking, payment, application, or another consequential commitment.

### Homepage rule

A homepage may summarize several archetypes, but it should not flatten them into a generic sequence of hero, logo strip, three cards, testimonials, and CTA. Its job is to establish scope, signal trust, and route priority audiences into the appropriate journey. Internal templates should then adopt their own archetype’s information density and interaction model.

## 7. Anti-categories and rejected splits

The following splits are poor top-level taxonomy choices because they do not reliably imply a distinct user journey or content model.

| Rejected split | Why it is weak | Use instead |
|---|---|---|
| **Industry list** (finance, healthcare, real estate, restaurants, fashion, etc.) | Produces hundreds of labels while hiding shared structures | Archetype + risk, regulation, location, inventory, and evidence modifiers |
| **SaaS** | Can mean a campaign page, pricing comparison, docs, status content, signup, or an authenticated product | Classify each template as offer, knowledge, catalog/comparison, or transaction |
| **B2B vs B2C** | Does not by itself determine layout; decision complexity and buying group do | Add committee decision, procurement, price visibility, and sales-handoff variables |
| **Nonprofit vs commercial** | Ownership model does not define journey | Organization + campaign + donation/volunteer transaction as needed |
| **Personal vs company** | Scale of owner is less useful than audience and evidence | Proof/identity or organization, modified by governance and trust burden |
| **Marketing website** | Too broad to predict navigation, content, or CTA topology | Offer/campaign, organization/orientation, or a composition |
| **SEO website** | Acquisition channel is not a user purpose | Content/knowledge or catalog, with search traffic context and people-first quality |
| **One-page vs multi-page** | An implementation/container choice | Let content volume, journey depth, and reuse determine structure |
| **Static vs dynamic / CMS vs no CMS** | Delivery technology does not define experience | Record as technical and content-ownership constraints |
| **Desktop vs mobile** | All categories need responsive, accessible behavior | Record actual device and use context |
| **Minimalist, brutalist, corporate, playful, luxury** | Visual direction, not site purpose | Apply as brand-expression and audience-fit modifiers after archetype selection |
| **Age or demographic segment alone** | Demographics weakly predict tasks and behavior without context | Use researched abilities, motivations, vocabulary, environment, and constraints |
| **Community** as a universal standalone type | Often decomposes into publication, directory, events, membership, and repeated product interactions | Use those archetypes; create a separate community/product taxonomy only when member-to-member interaction is the core product |
| **AI-powered / Web3 / no-code** | Technology or positioning label, not a stable journey | Classify the actual user job and disclose consequential trust/technical constraints |

## 8. Recommended implementation for the design skill

The skill should ask for or infer the following compact context object before choosing a visual direction:

```text
primary_archetype: proof | offer | organization | knowledge | catalog | task
secondary_archetype: optional, maximum one
primary_user_verb:
owner_success_event:
audiences_and_priority:
journey_shape:
content_unit_and_scale:
awareness_and_traffic_source:
commitment_and_risk:
evidence_available:
freshness_and_return_frequency:
location_locale_device_constraints:
brand_expression_tolerance:
accessibility_legal_technical_constraints:
```

Do not force the user to complete every field. Infer low-risk defaults from the brief, ask only about missing variables that would change the structure, and state assumptions. The category should select a **design posture and content skeleton**, not a fixed visual template.

### Minimum category-specific output behavior

- **Proof:** lead with selected evidence and explicit contribution; choose case depth from evaluation needs.
- **Offer:** preserve message continuity; define one dominant action; order proof against real objections.
- **Organization:** orient and route multiple tasks; keep internal org charts out of the primary information architecture.
- **Knowledge:** optimize retrieval and reading; expose hierarchy, provenance, status, and freshness.
- **Catalog:** model comparable entities; provide retrieval controls proportionate to corpus size.
- **Task:** make requirements, state, validation, review, recovery, and completion explicit.

## 9. Research basis and limits

This taxonomy is a synthesis, not a claim that the cited organizations endorse these six labels. The sources establish the underlying design distinctions:

- User needs, whole-problem journeys, task-aligned scope, and avoidance of organizationally shaped services: [GOV.UK user-needs guidance](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs), [whole-problem mapping](https://www.gov.uk/service-manual/design/map-a-users-whole-problem), and [transaction scoping](https://www.gov.uk/service-manual/design/scoping-your-service).
- Different context needs for introductory landing pages and deep documentation pages: [USWDS landing page](https://designsystem.digital.gov/templates/landing-page/) and [USWDS documentation page](https://designsystem.digital.gov/templates/documentation-page/).
- Distinct retrieval, detail, and completion systems in commerce: [Baymard product lists](https://baymard.com/research/ecommerce-product-lists), [product pages](https://baymard.com/research/product-page), and [checkout](https://baymard.com/research/checkout-usability).
- Helpful, focused, audience-first publishing and crawlable catalog structure: [Google people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure).
- Cross-cutting accessibility and performance requirements: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Google Web Vitals](https://web.dev/articles/vitals).
- Portfolio evaluation as evidence of work, workflow, and thought process: [NN/g, *User Experience Careers*](https://media.nngroup.com/media/reports/free/UserExperienceCareers_2nd_Edition.pdf).

The taxonomy should be revised only when a proposed new category consistently changes at least three of the following: primary user job, journey shape, content model, dominant interface pattern, risk/recovery model, or success measure. Otherwise, add a modifier or subtype rather than another top-level category.
