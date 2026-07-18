# Content, Conversion, Trust, and SEO Category Architecture

## Purpose

This report defines the content-side category architecture a website design skill needs for portfolios, general websites, and landing pages. It builds on the existing reports in [`../copywriting/`](../copywriting/) without repeating their line-level guidance on web copy, UX writing, voice, AI-writing patterns, or truth and proof.

The central recommendation is to treat “conversion” as **helping a person make an informed decision or complete a real task**. The skill should not optimize for clicks detached from user benefit, apply a fixed persuasion formula, manufacture urgency, or add decorative trust signals. It should first establish what the page must communicate, what evidence exists, what action is actually available, and what obligations attach to the interaction.

This is category architecture, not a universal page recipe. The categories should be available to every website task, but their depth depends on the page type, stakes, content volume, traffic source, jurisdiction, and available evidence.

## Evidence position

The architecture rests on several durable principles from primary and authoritative sources:

- Content starts with evidenced user needs and real tasks, not an assumed section pattern. GOV.UK advises teams to treat stakeholder opinions as assumptions until validated and to trace user stories back to user needs ([GOV.UK, “Learning about users and their needs”](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs)).
- Descriptive headings and labels help people understand organization and find information; links should reveal their purpose and destination ([W3C WCAG 2.2, Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), [W3C WCAG 2.2, Link Purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)).
- Advertising claims must be truthful, non-deceptive, and evidence-based. Material qualifications should be clear and close to the claim, while endorsements must reflect genuine experience and disclose material connections ([FTC advertising guidance](https://www.ftc.gov/business-guidance/advertising-marketing), [FTC advertising FAQ](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business), [FTC endorsement guidance](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)).
- Privacy information must be concise, transparent, intelligible, and given in clear language at the relevant time. Tracking and consent requirements depend on jurisdiction and technology, so a design skill must identify them rather than silently install analytics ([European Commission GDPR obligations](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en), [ICO online tracking guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/online-tracking/)).
- Search work should make useful content discoverable and understandable, not generate pages primarily to manipulate rankings. Google explicitly recommends people-first content and rejects arbitrary word-count targets and search-engine-first mass production ([Google Search Central, helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).
- Titles, snippets, and structured data are representations of visible page content, not separate promotional surfaces. Structured data must accurately describe visible content and does not guarantee a rich result ([Google title guidance](https://developers.google.com/search/docs/appearance/title-link), [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet), [Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)).
- Content has a lifecycle after launch. Inventory, ownership, review, consolidation, and retirement are part of content quality, not optional administration ([Digital.gov, content lifecycle](https://digital.gov/2024/11/12/crafting-quality-content-throughout-its-lifecycle)).
- Measurement must follow the service or page goal and combine behavioral data with research. A/B testing is one method, not a substitute for understanding users, and it requires enough traffic to produce a useful result ([GOV.UK, measuring service success](https://www.gov.uk/service-manual/measuring-success/measuring-the-success-of-your-service), [GOV.UK, user research in live](https://www.gov.uk/service-manual/user-research/user-research-in-live/), [GOV.UK, planning user research](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service)).

## Architecture rules

The skill should apply three strengths of guidance:

1. **Required integrity checks** prevent deception, inaccessible content, privacy mistakes, false system state, or launch with unresolved critical content.
2. **Default content decisions** provide a sensible result when the brief is incomplete: one clear page intent, a prioritized message, descriptive labels, evidence near claims, and a real next step.
3. **Conditional modules** activate only when relevant: forms, testimonials, editorial publishing, structured data, localization, experimentation, regulated disclosures, or campaign-message matching.

The skill should not ask the user for every missing field before doing useful work. It should use supplied and repository evidence, preserve strong existing content, make conservative assumptions for low-risk presentation choices, and surface only consequential unknowns in the handoff.

## Page-type profiles

The categories below are shared, but the emphasis changes by page type.

### Portfolio

The primary decision is usually whether the person or studio is relevant and credible enough to contact, hire, shortlist, or explore further.

Portfolio content should establish:

- identity, discipline, availability or engagement model when known;
- selected work with a reason for selection rather than an indiscriminate gallery;
- the creator's exact role, collaborators, scope, constraints, dates, and permitted disclosures;
- process evidence and outcomes without implying sole authorship of team work;
- image, client, employer, and project permissions;
- a reachable contact path and realistic response expectation if supplied;
- alt text, captions, media transcripts, and project metadata appropriate to the work.

A portfolio does not automatically need a testimonial wall, quantified outcomes, a newsletter, a blog, a lead magnet, or repeated contact CTAs. One honest project description can provide more trust than several unverified accolades.

### General website

The primary content problem is usually orientation across several intents. The skill should define the site’s scope, audience tasks, page inventory, navigation vocabulary, destination pages, ownership, and maintenance model before polishing a home page.

General-site content often needs:

- organization or person identity and purpose;
- task-based information architecture and internal linking;
- distinct page intents and titles;
- product, service, pricing, process, contact, policy, support, or location information as applicable;
- editorial content only when there is a real publishing need and owner;
- governance for changing facts, legal copy, staff details, hours, prices, and offers.

The home page should route people to important destinations; it should not attempt to contain the full site in miniature.

### Landing page

The primary content problem is continuity from a specific entry context to one informed next step. The skill should identify the source message or audience expectation, the offer, the necessary evidence and conditions, the commitment represented by the CTA, and what happens after the action.

Landing-page content often needs:

- continuity between ad, email, referral, search result, or campaign promise and the landing page;
- a literal offer and relevant audience or eligibility;
- benefits connected to observable capabilities or mechanisms;
- proof matched to the claim it supports;
- price, timing, restrictions, risks, cancellation terms, or material qualifications before commitment;
- one primary action, with secondary actions only when they serve a distinct need;
- a short form or clear destination proportionate to the request.

A landing page does not automatically need a fixed hero–logos–features–testimonials–FAQ–final-CTA sequence. Sections exist only to answer a material question or support the next decision.

## Category 1: Content inventory and source integrity

### Job

Establish what content and evidence already exist, where they came from, whether they may be reused, and what is missing.

### The skill should capture

- existing pages, routes, documents, CMS entries, product UI, repositories, briefs, and approved copy;
- content items by type: prose, claims, prices, credentials, people, testimonials, case studies, images, video, downloads, policies, contact data, and metadata;
- canonical source, owner, status, last verified date, reuse rights, locale, and destination for each consequential item;
- duplicates, contradictions, obsolete content, orphaned pages, and unverified placeholders;
- content that must be preserved, migrated, consolidated, rewritten, retired, or requested.

### Required behavior

- Do not replace specific approved content with generic generated copy merely to create a consistent tone.
- Do not present sample data, template text, or inferred details as production facts.
- Keep unresolved production facts visible in a content gap or `Still needed` register.
- For redesigns, preserve URLs, metadata, and high-value content unless change is intentional and redirects or replacements are part of scope.

### Minimal artifact

A compact inventory can be a table with `item/page`, `purpose`, `source`, `owner`, `status`, `action`, and `review date`. Small one-page sites need only the facts and assets ledger, not a full CMS audit.

## Category 2: Page intent and audience task

### Job

Define why each page exists and what useful outcome it should enable.

### The skill should capture

- page type and entry context;
- primary audience or situation when it materially changes the content;
- user question, task, or decision;
- organizational outcome, kept distinct from the user outcome;
- prerequisite knowledge and likely next destination;
- one primary page intent and any necessary secondary intents;
- what success and failure mean for this page.

### Required behavior

- Do not use demographic personas where a task, context, or level of knowledge is enough.
- Do not combine incompatible intents merely to avoid creating a necessary destination page.
- Do not make “increase conversion” the sole intent. Name the action and the benefit or task it serves.
- For campaign landing pages, record the incoming promise so the page can maintain message continuity.

### Minimal artifact

Use one sentence: `For [relevant audience/context], this page helps them [task/decision] by providing [necessary information/evidence] and leads to [real next step].`

This is a diagnostic, not a headline formula.

## Category 3: Message hierarchy and content sequence

### Job

Choose what the page says, in what order, and with what semantic relationships.

### The skill should capture

- the literal identity of the person, organization, product, service, or resource;
- the most important proposition or orientation;
- mechanism, scope, conditions, alternatives, proof, and limitations;
- the reader’s next unanswered question at each stage;
- heading outline, navigation labels, content groups, and cross-links;
- details that may be progressively disclosed without hiding material information.

### Required behavior

- Give every section a unique decision, explanation, evidence, or routing job.
- Remove semantic repetition across headline, support line, cards, proof, FAQ, and CTA.
- Make headings descriptive enough to work as an outline and navigation aid, consistent with WCAG’s requirement that headings and labels describe topic or purpose ([W3C WCAG 2.2, Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)).
- Keep qualifications, costs, exclusions, and consequences before the decision they materially affect.
- Let page depth follow complexity and risk rather than a target word count or standard number of sections.

### Not a layout prescription

Message hierarchy may require that one fact precede another or that a disclosure remain close to its claim. It does not prescribe a centered hero, card grid, split screen, sticky CTA, or pixel position.

## Category 4: Voice, tone, and terminology

### Job

Make the site recognizably appropriate and internally consistent without allowing personality to obscure meaning.

### The skill should capture

- approved examples and words already used by the person, organization, product, or community;
- stable voice traits expressed as observable behaviors;
- tone shifts for sales, support, errors, privacy, legal, success, and high-stakes decisions;
- preferred product names, domain terms, capitalization, abbreviations, and prohibited or legally sensitive terms;
- audience knowledge and acceptable technical density.

### Required behavior

- Derive voice from evidence; do not invent a “bold,” “playful,” “luxury,” or “human” persona from the visual style alone.
- Keep one term for one concept unless the domain requires a distinction.
- Treat accessibility, translation, and stressful states as constraints on expression, not reasons to erase all character.
- Prefer a small operational voice card and glossary over a long brand manifesto.

### Boundary

The existing [`voice-and-editing.md`](../copywriting/voice-and-editing.md) owns sentence-level voice and editing technique. This category owns the inputs, consistency system, and context map the skill needs before it writes.

## Category 5: Claims, proof, and evidence mapping

### Job

Ensure every objective or implied claim is supportable, correctly scoped, and paired with evidence appropriate to the decision.

### The skill should capture

- exact claim text or intended meaning;
- claim type: capability, result, comparison, price, availability, credential, security, sustainability, popularity, endorsement, guarantee, or subjective positioning;
- source, method, population, period, conditions, owner, approval, and expiry/review date;
- what the evidence actually supports and what it does not;
- required qualification and its proximity to the claim.

### Required behavior

- Never fabricate testimonials, customer logos, reviews, awards, certifications, metrics, case-study outcomes, or competitor facts.
- Do not convert missing proof into a softer but still unsupported claim.
- Distinguish an observable capability from an outcome claim.
- Attribute collaborative portfolio work and identify the creator’s actual contribution.
- Present sponsored, incentivized, employee, affiliate, or otherwise connected endorsements with a clear material-connection disclosure.
- Review the net impression of copy, visuals, captions, charts, badges, and proximity—not isolated sentences only. FTC guidance makes clear that claims must be truthful and evidence-based and that qualifications should be clear and close to the claim ([FTC advertising guidance](https://www.ftc.gov/business-guidance/advertising-marketing), [FTC advertising FAQ](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business)).

### Minimal artifact

Use a claim register only for consequential claims: `claim`, `evidence`, `scope/qualification`, `source`, `owner`, `verified date`, `status`.

### Boundary with trust

This category answers **“Is the statement supported?”** Trust answers **“Can the visitor understand who is responsible and verify the relevant identity or source?”**

## Category 6: Calls to action and next-step architecture

### Job

Make actions truthful, understandable, proportionate, and connected to functioning destinations.

### The skill should capture

- primary and secondary action intents;
- destination or system behavior;
- commitment level, cost, prerequisites, and what happens next;
- label consistency across the site;
- fallback when an action is unavailable or unconnected.

### Required behavior

- Label the immediate action or destination, not an abstract aspiration.
- Use links for destinations and buttons for actions.
- Keep the same label for the same action and distinguish different destinations.
- Do not imply “start,” “buy,” “book,” “send,” “save,” or “download” unless that action works.
- Put necessary commitment information before action: payment, account creation, recurring billing, scheduling, file type, application review, or data submission.
- Repeating a CTA is conditional on page length and context; repetition is not a conversion requirement.
- Avoid confirmshaming, fake countdowns, disguised ads, forced continuity, or visually suppressed alternatives. The FTC documents false activity, false scarcity, and interface interference among deceptive dark patterns ([FTC, “Bringing Dark Patterns to Light”](https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf)).

### Boundary with layout

Content defines action priority, label, consequence, and required adjacent information. Visual design decides treatment and placement while preserving that priority and not hiding alternatives or qualifications.

## Category 7: Forms and data requests

### Job

Request only information necessary for the stated task and explain why, how, and what happens after submission.

### The skill should capture

- form purpose, recipient/system, fields, required/optional status, and rationale;
- expected formats, validation rules, error recovery, confirmation, and response timing;
- personal or sensitive data collected, retention or downstream use when applicable;
- consent or subscription choices that must remain separate from completing the main task;
- spam prevention and failure states without making the form unusable.

### Required behavior

- Every field has a persistent, programmatically associated label. W3C recommends explicit labels for controls because they identify purpose and support assistive technology ([W3C Forms Tutorial, Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/)).
- Ask only for fields needed at this stage; “sales might want it later” is not enough.
- Explain non-obvious reasons for collecting data before collection.
- Distinguish required service processing from optional marketing consent.
- Preserve entered values after correctable errors where security permits, identify the problem in text, and provide a realistic correction.
- Confirm only what the backend actually completed.
- For a prototype or unconnected form, disclose before effort that entries will not be sent or saved.

### Conversion principle

Form improvement is not merely field removal. The skill should reduce unnecessary effort while retaining information needed for eligibility, safety, fulfillment, legal compliance, or a useful response.

## Category 8: Trust, identity, and accountability

### Job

Provide the genuine information a visitor needs to understand who is behind the site, whether it is relevant, and how to verify or contact them.

### The skill should consider

- person or organization name and relationship to the offer;
- accurate biography, team, author, or organization details where relevant;
- real contact route, location or service area, support route, and response expectations;
- credentials, memberships, licenses, awards, client relationships, and security practices only when verified;
- authorship, bylines, dates, source links, methodology, and corrections for editorial or high-stakes content;
- project role, collaborators, and artifact provenance for portfolios;
- real customer evidence, independent reviews, or case studies when supplied and permitted.

### Required behavior

- Trust is not a required visual section and does not mean adding logos, star ratings, padlocks, seals, counters, or “trusted by” copy.
- Do not create a security or privacy claim from the mere presence of HTTPS, a lock icon, or a policy link.
- Prefer verifiable identity and evidence over self-awarded badges.
- For expert or high-stakes content, make author, source, review, and update information proportionate to the risk. Google’s people-first guidance explicitly asks whether authorship, background, sourcing, expertise, and first-hand experience are clear ([Google Search Central, helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).

### Boundary with claims and legal

Trust owns identity and verification cues. Claims/proof owns substantiation. Disclosure/legal owns mandatory or material notices. A customer logo may touch all three, but it should have one source record and three checks rather than three copies of the content.

## Category 9: Disclosure, privacy, and legal-content routing

### Job

Identify content obligations and ensure material information appears at the point where it affects understanding or consent.

### The skill should identify

- operator identity, business/contact details, jurisdiction, audience age, and regulated subject matter;
- terms, privacy notice, cookie/tracking information, accessibility statement, refund/cancellation policy, warranties, pricing conditions, licensing, copyright, and attribution as applicable;
- sponsorship, affiliate relationships, paid endorsements, AI or automation disclosure where reasonably expected, and conflicts of interest;
- material limitations, eligibility, geographic availability, recurring charges, trial conversion, delivery timing, and data use;
- legal owner and approval status.

### Required behavior

- Do not draft jurisdiction-specific legal terms as if they were approved legal advice. Use supplied approved text or mark legal review as required.
- Do not hide material qualifications in a footer, tooltip, low-contrast text, or separate policy when they affect the nearby decision.
- Privacy information should be concise, transparent, intelligible, and presented when data is obtained, consistent with European Commission GDPR guidance ([European Commission, GDPR obligations](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en)).
- Do not silently add analytics, pixels, session replay, ad conversion tags, or cookie banners without identifying the technologies and applicable consent/configuration requirement. Current rules vary by jurisdiction and change over time; the handoff must name the unresolved compliance owner ([ICO online tracking guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/online-tracking/)).
- Disclosures must use plain language and remain perceptible at responsive sizes.

### Minimal artifact

A disclosure register: `trigger`, `required information`, `placement`, `owner`, `approval/status`. This is usually shorter and more actionable than generating generic policy pages.

## Category 10: Findability and information architecture

### Job

Help people and search systems find the right page through understandable structure, labels, links, and page scope.

### The skill should capture

- priority user tasks and the language people use for them;
- page inventory, hierarchy, URL intent, navigation labels, breadcrumbs when useful, internal links, and orphan pages;
- one primary topic or purpose for each indexable page;
- query or discovery context where evidence exists, without forcing every phrase into copy;
- duplicate, overlapping, thin, obsolete, gated, or unreachable content;
- on-site search and filters when content volume justifies them.

### Required behavior

- Navigation labels describe destinations in audience language.
- Link text communicates purpose; same destinations use consistent labels and different destinations remain distinguishable, in line with WCAG link-purpose guidance ([W3C WCAG 2.2, Link Purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)).
- Create a page because it serves a distinct need, not merely because a keyword variation exists.
- Consolidate overlapping pages when one stronger destination serves the need.
- Keep important content reachable through crawlable links and logical navigation.
- Do not promise search rankings or generate mass pages from thin variations. Google recommends content created primarily for people rather than ranking manipulation ([Google Search Central, helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).

### Boundary with metadata

Findability owns the site and page structure humans navigate. Metadata owns machine-facing descriptions and indexing directives for those pages.

## Category 11: Page metadata and index controls

### Job

Provide accurate page-level representations for browsers, search results, link previews, and crawlers.

### The skill should consider

- unique document title;
- page-specific meta description for priority pages;
- canonical URL;
- index/follow directives when needed;
- social-sharing title, description, image, image alt text, and canonical URL;
- favicon, site name, author/date metadata where relevant;
- sitemap inclusion, redirect mapping, and status behavior during migrations;
- language declaration and alternate localized URLs.

### Required behavior

- Every public page has a concise, descriptive, unique title that agrees with its visible subject. Google warns against vague, repeated, boilerplate, and keyword-stuffed titles ([Google title guidance](https://developers.google.com/search/docs/appearance/title-link)).
- Meta descriptions summarize the actual page and remain unique on priority URLs. They are suggestions, not guaranteed search snippets ([Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet)).
- Preview metadata must not make a stronger or different claim than the page.
- Do not index prototypes, staging environments, private dashboards, duplicate campaign variants, or thin thank-you pages by accident.
- During redesigns and migrations, preserve valuable URLs or provide explicit redirects and update internal links.

### Boundary with visual assets

Content owns preview-image purpose, caption/alt, rights, and claim accuracy. Visual design owns creation and composition of the image within platform constraints.

## Category 12: Structured data

### Job

Represent visible, verified page entities in machine-readable form when a supported type has a real use.

### The skill should consider

- organization or person identity;
- breadcrumb trails;
- article/editorial authorship and dates;
- local business details;
- product, event, job, software, video, profile, or other types only when the visible page genuinely contains the required information;
- identifiers connecting the same entity across pages.

### Required behavior

- Structured data is conditional, not a default SEO decoration.
- Markup must describe visible page content, remain current, use the most specific applicable type, and include genuine required properties.
- Never mark up fake reviews, invisible claims, irrelevant entities, or content that exists only in JSON-LD.
- Do not promise a rich result. Google states that valid markup makes a page eligible but does not guarantee a search feature ([Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)).
- Validate syntax and then manually compare every meaningful property with the rendered page.

### Boundary with metadata

Metadata describes the document and how it may be previewed or indexed. Structured data identifies entities and their properties. Keep them separate because their eligibility, validation, and update risks differ.

## Category 13: Editorial content and lifecycle

### Job

Support articles, resources, case studies, news, changelogs, or guides only when the site has a genuine publishing purpose and maintenance owner.

### The skill should capture

- audience need and editorial purpose;
- content type, template fields, author/reviewer, sources, publication status, and update cadence;
- date published, date modified, version, corrections, expiration or review date;
- taxonomy, related content, archive behavior, feeds, and internal linking;
- rights, captions, downloadable assets, and citation requirements;
- consolidation and retirement rules.

### Required behavior

- Do not add a blog because websites are expected to have one.
- Do not create empty categories, generic thought-leadership placeholders, or mass SEO pages without expertise and value.
- Show dates when they help readers judge currency; do not change dates solely to simulate freshness.
- Preserve historical dates and meaningful update notes when content changes substantially.
- Assign an owner and review trigger to facts that decay.
- Audit content after launch and retire, redirect, merge, or update it intentionally. Digital.gov treats audits, analytics, maintenance, governance, and retirement as parts of the content lifecycle ([Digital.gov, content lifecycle](https://digital.gov/2024/11/12/crafting-quality-content-throughout-its-lifecycle)).

### Page-type note

Portfolio case studies belong here when they are durable editorial objects, but the portfolio can remain a small curated set without a publishing system. Landing pages usually consume approved editorial evidence rather than becoming an editorial program.

## Category 14: Localization and international content

### Job

Design content and its data model so meaning, action, legal information, and discovery survive translation and regional variation.

### The skill should capture

- supported languages, scripts, regions, and fallback behavior;
- source locale, translation owner, review status, and glossary;
- region-specific offers, prices, units, dates, addresses, phone numbers, legal terms, and availability;
- complete translatable strings with context and variables;
- localized metadata, alt text, structured data, form errors, privacy text, and transactional messages;
- URL strategy, language selector, page language, direction, and alternate-page mapping.

### Required behavior

- Do not concatenate sentence fragments or assume English word order.
- Use consistent terminology and give translators context for short or ambiguous strings.
- Declare page language and in-page language changes; support bidirectional text and locale formats. W3C recommends declaring language, using UTF-8, supporting local form formats, and designing navigation to localized resources ([W3C, Language on the Web](https://www.w3.org/International/getting-started/language), [W3C internationalization quick tips](https://www.w3.org/International/quicktips/index.en)).
- Localize the actual offer and conditions, not only the visible marketing paragraphs.
- Provide equivalent localized URLs and reciprocal `hreflang` annotations where multiple variants exist; Google documents HTML, HTTP-header, and sitemap approaches ([Google localized versions guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)).
- Allow expansion and different line-breaking behavior; do not shorten away meaning solely to preserve an English layout.

### Boundary with layout

Content owns complete localized meaning, terms, and locale mappings. Layout must accommodate expansion, different scripts, and right-to-left direction without clipping or hiding required information.

## Category 15: Measurement and experimentation

### Job

Verify whether the page helps people complete the intended task and improve it without redefining success as raw clicks.

### The skill should capture

- page intent and a small set of corresponding success, failure, and guardrail signals;
- event definitions and where they occur in the real journey;
- baseline, segment, time window, data owner, and privacy/consent constraints;
- qualitative sources such as usability sessions, support requests, search queries, interviews, and form errors;
- experiment hypothesis, changed variable, primary outcome, guardrails, sample requirement, and stopping rule when experimentation is justified.

### Measures by page type

**Portfolio:** relevant project views, contact-path completion, qualified enquiries, downloads when intentional, and observed ability to understand role and work. Raw time-on-page does not prove interest or comprehension.

**General website:** task completion, successful navigation, search refinement or zero-results, support deflection where appropriate, form success/error, content usefulness, and accessibility/usability findings.

**Landing page:** qualified completion of the stated action, downstream fit or fulfillment, cancellation/refund or low-quality-lead signals, form errors, and comprehension of material terms. Click-through alone can reward misleading copy.

### Required behavior

- Define success before choosing events or analytics tools.
- Measure the end-to-end outcome when possible, not only the most convenient button click.
- Include guardrails for user harm, confusion, accessibility, data quality, cancellations, complaints, or lead quality.
- Do not install tracking until data use, retention, vendors, consent, and policy updates are owned.
- Use usability research and operational evidence alongside analytics. GOV.UK recommends choosing measures based on whether the work is a transaction, end-to-end journey, or non-transactional site ([GOV.UK, measuring service success](https://www.gov.uk/service-manual/measuring-success/measuring-the-success-of-your-service)).
- Do not recommend an A/B test for low traffic, obvious defects, legal requirements, accessibility fixes, or questions better answered by user research. GOV.UK notes that surveys, benchmarking, and A/B tests generally need hundreds of participants for clear findings ([GOV.UK, planning user research](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service)).
- Never test deception, hidden costs, false urgency, obstructed cancellation, suppressed privacy choices, or inaccessible variants.

### Minimal artifact

For most generated sites: `intent`, `primary outcome`, `failure/guardrail`, `event or research method`, `privacy dependency`, `owner`. A full experimentation platform is out of scope unless explicitly requested and justified by traffic.

## Category 16: Launch, governance, and handoff

### Job

Make unresolved content, evidence, ownership, system connections, and review obligations explicit enough that the site can be launched and maintained safely.

### The skill should hand off

- approved page inventory, page intents, route/URL map, and content status;
- source links or files for claims, testimonials, credentials, people, prices, policies, and media;
- claim and disclosure registers for consequential items;
- metadata, index decisions, redirects, structured-data types, and localization mappings;
- form destinations, recipients, storage behavior, consent requirements, success/failure states, and test submissions;
- analytics events and privacy dependencies;
- content owners, approvers, review dates, expiry triggers, and editorial workflow;
- unresolved items grouped by launch severity.

### Launch severity

- **Blocker:** could deceive, expose data, violate a material obligation, break the primary task, misstate a claim, publish private/sample information, or make an inaccessible interaction unavoidable.
- **Required soon:** important for completeness or maintenance but has a safe temporary state.
- **Optional improvement:** useful enhancement with no present integrity or task risk.

### Required behavior

- Production must not contain unlabeled sample proof, empty legal destinations, nonfunctional primary CTAs, forms that discard data without warning, or unverified objective claims.
- Every unresolved item names an owner or says that ownership is missing.
- Handoff should be compact and operational. Do not bury blockers in a general design rationale.
- Verify the rendered site, source, metadata, and live integrations rather than reviewing prose in isolation.

## What the skill should not turn into categories

The following are techniques or failure modes, not first-class content categories:

- AIDA, PAS, StoryBrand, or another persuasion formula;
- a mandatory hero, logo wall, benefit grid, testimonial block, FAQ, and repeated final CTA;
- keyword density, arbitrary word counts, or a fixed number of headings;
- “emotional triggers,” fear, scarcity, urgency, loss aversion, or social pressure as default tools;
- generic “SEO copy,” “conversion copy,” and “trust copy” passes detached from evidence and page intent;
- automatic blogs, case studies, testimonials, statistics, or guarantees generated to fill layout slots;
- a single conversion score that ignores downstream quality, comprehension, accessibility, privacy, or user harm.

These patterns cause duplication and encourage the skill to optimize the surface instead of the decision system.

## Recommended workflow

The smallest reliable workflow is:

1. Inventory supplied content, sources, rights, and unresolved facts.
2. Define the site and page intents, entry context, and real next steps.
3. Build the message hierarchy and semantic outline.
4. Map consequential claims to proof and material disclosures.
5. Write or edit using the established voice and terminology.
6. Define CTA destinations, form behavior, and trust/accountability information.
7. Add findability, metadata, and only applicable structured data.
8. Stress-test localization, accessibility, responsive rendering, and claim/disclosure proximity.
9. Define proportionate measurement and a content owner/review cycle.
10. Produce a severity-ranked handoff and block unsafe production states.

The workflow may collapse to a short checklist for a one-page portfolio. The stages remain conceptually distinct so missing evidence is not mistaken for a writing problem and a broken action is not mistaken for a CTA-label problem.

## Deduplicated category tree

```text
Content, conversion, trust, and SEO
├── 1. Source and purpose
│   ├── 1.1 Content inventory and provenance
│   └── 1.2 Page intent, audience task, and entry context
├── 2. Meaning and action
│   ├── 2.1 Message hierarchy and sequence
│   ├── 2.2 Voice, tone, and terminology
│   ├── 2.3 Claims, proof, and evidence mapping
│   ├── 2.4 CTA and next-step architecture
│   └── 2.5 Forms and data requests
├── 3. Trust and obligations
│   ├── 3.1 Identity, authorship, and accountability
│   └── 3.2 Disclosure, privacy, and legal-content routing
├── 4. Discovery and publishing
│   ├── 4.1 Findability and information architecture
│   ├── 4.2 Page metadata and index controls
│   ├── 4.3 Structured data
│   ├── 4.4 Editorial content and lifecycle
│   └── 4.5 Localization and international content
└── 5. Verification and continuity
    ├── 5.1 Measurement and experimentation
    └── 5.2 Launch, governance, and handoff
```

This tree is intentionally deduplicated:

- **Page intent** defines the outcome; **measurement** checks it.
- **Message hierarchy** orders the meaning; **layout** renders that order.
- **Claims/proof** validates statements; **trust** exposes identity and verification; **disclosure/legal** communicates material obligations.
- **Findability** organizes pages and links; **metadata** describes documents to external systems; **structured data** describes verified entities.
- **Editorial content** owns publish/update/retire behavior; **handoff** assigns the operational owners and unresolved launch work.
- **Localization** changes and maps content across locales; it does not merely resize the original layout.

## Boundary with design and layout

### Content owns

- what information, evidence, action, qualification, and disclosure must exist;
- page purpose, semantic outline, priority, sequence, labels, terminology, and content relationships;
- which claims require nearby proof or qualification;
- form questions, field meaning, validation and state copy;
- metadata meaning, structured-data truth, localization inputs, and lifecycle ownership;
- ordering or proximity constraints necessary for comprehension, consent, or integrity.

### Design and layout own

- visual composition, grid, spacing, typography, color, imagery treatment, animation, and responsive rearrangement;
- component choice when several patterns satisfy the same content and accessibility need;
- visual emphasis and density within the content-defined priority;
- media crops and art direction within rights, representation, alt-text, caption, and claim constraints.

### Shared contracts

- Heading hierarchy must remain meaningful both visually and semantically.
- CTA prominence must reflect actual action priority and must not visually suppress a necessary alternative.
- Proof and material qualifications must remain perceptibly connected to the claims they support.
- Forms must preserve label, instruction, error, consent, and focus relationships.
- Responsive and localized layouts must not hide, truncate, or separate critical content.
- Editorial templates must expose required authorship, date, source, and status fields.
- Preview images and social cards must accurately represent the page and use approved assets.

Content should express these as relationships—`before`, `after`, `near`, `same group`, `required`, `optional`, `must remain visible`—rather than pixel specifications. Design may change the presentation, but not the meaning, evidence, commitment, or legal effect.
