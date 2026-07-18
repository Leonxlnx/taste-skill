# Landing-Page Category Taxonomy for a Frontend Design Skill

## Purpose

This report proposes a reusable taxonomy for landing pages that helps a frontend design skill choose an information architecture without hardcoding a marketing formula. It covers product, service, launch, waitlist, app, event, lead-generation, campaign, pricing/offer, and editorial-led pages.

The central finding is that these labels are useful but insufficient. `Product` does not imply a feature grid; `service` does not imply a consultation form; `campaign` does not imply hidden navigation; and `landing page` does not imply one CTA repeated after every section. Architecture follows the visitor's decision, the commitment being requested, and the evidence and conditions needed to make that commitment responsibly.

No standards body defines a complete marketing landing-page taxonomy. The categories below are therefore a synthesis. Official sources are used to constrain the parts they do govern: truthful claims and disclosures, data collection and consent, form accessibility, event and app distribution details, mobile content parity, performance, analytics, and trustworthy experiments.

## Executive findings

1. **Classify by decision journey, not visual genre.** The useful question is not “what sections does a SaaS page have?” but “what does this visitor already know, what must they decide, and what is the smallest honest next commitment?”
2. **Use categories compositionally.** A page may be `app + launch + waitlist`, `service + campaign + lead-gen`, or `event + pricing/offer`. Forcing one mutually exclusive label loses the facts that actually alter the page.
3. **Separate the base decision object from overlays.** Product, service, app, event, and editorial describe what is being evaluated. Launch, waitlist, campaign, and pricing/offer describe state or acquisition context. Lead generation describes a conversion mechanism.
4. **Select modules; do not instantiate a template.** Proposition, mechanism, proof, scope, objections, offer, trust, disclosure, and action are candidate modules. Include only those that answer a live decision question.
5. **Commitment controls information burden.** Reading a report, joining a waitlist, installing an app, booking a sales call, submitting an application, and paying are different commitments. Higher cost, irreversibility, data exposure, or uncertainty increases the need for terms, proof, risk reduction, and clear next-step copy.
6. **Claims and disclosures are architectural content.** They cannot be delegated to tiny footer text. FTC guidance evaluates the page's overall impression and says necessary qualifications should be clear, prominent, and near the claim; native advertising may require disclosure close to the headline ([FTC advertising FAQ](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business), [FTC native advertising guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)).
7. **Measurement follows the real outcome.** A button click is not an install, a submitted contact form is not a qualified lead, and a checkout start is not a purchase. Instrument the decision journey and downstream result, then define guardrails before an experiment.
8. **Responsive design preserves decisions, not desktop geometry.** Material content, CTA meaning, price conditions, proof qualifications, and disclosures must survive reordering and compression. Google recommends responsive design and equivalent primary content on mobile; WCAG requires reflow without loss of information or functionality ([Google mobile-first guidance](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing), [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)).

## 1. The recommended model

Use three layers.

### Layer A: base decision object

- **Product:** choose, try, subscribe to, or buy a defined product.
- **Service:** assess fit and engage a provider for work whose scope, process, or outcome may vary.
- **App:** adopt or open software through a platform-specific distribution path. This is a product subtype, but it deserves an explicit category because compatibility, screenshots, store badges, deep links, and install handoff alter architecture.
- **Event:** decide whether, when, where, and how to attend or watch a time-bound occurrence.
- **Editorial:** learn, investigate, or evaluate through genuinely useful content before any commercial action.

### Layer B: state and acquisition overlays

- **Launch:** a new availability, release, edition, or major change makes novelty and timing material.
- **Waitlist:** the visitor cannot receive the main thing now and is being asked to exchange contact information for later access or notice.
- **Campaign:** the page receives traffic from a defined message, audience, placement, or channel and must continue that promise.
- **Pricing/offer:** price, plan, discount, bundle, guarantee, deadline, or commercial terms are the main decision surface.

### Layer C: conversion mechanism

- **Lead generation:** the immediate conversion is the collection of information for later qualification, follow-up, or delivery rather than immediate fulfillment of the main product or service.

This resolves common category collisions. A webinar registration page is `event + lead-gen`; an unreleased mobile product is `app + launch + waitlist`; a paid-search page for a custom audit is `service + campaign + lead-gen`; a limited annual plan promotion is `product + campaign + pricing/offer`.

## 2. Journey archetypes

The table gives default questions, not mandatory sections or orders.

| Category | Visitor decision | Typical next commitment | Architecture that may become necessary | Do not assume |
| --- | --- | --- | --- | --- |
| Product | “Is this the right product and is it worth the cost or switching effort?” | Inspect, demo, trial, add to cart, buy, subscribe | Product identity, outcome, relevant capabilities, in-use demonstration, compatibility, comparison, price, delivery/returns, proof, support | Three features, logo wall, testimonials, or FAQ |
| Service | “Can this provider solve my situation, and what happens if I engage them?” | Check fit, request scope/quote, book, apply, contact | Who it is for, problem boundary, deliverables, process, credentials, representative work, constraints, timeline, price model, next-step expectations | Every service should expose a calendar or hide price |
| Launch | “What is new, available when, and why does the change matter?” | Read announcement, watch demo, buy/update now, pre-order, join waitlist | New-versus-existing distinction, status/date, availability, release notes or demo, migration/compatibility, launch offer if real | Countdown, fake scarcity, or a teaser with no useful content |
| Waitlist | “Is this credible enough to give my contact details for a future possibility?” | Join, request invite, follow updates | Clear pre-release status, intended value, credible evidence or maker identity, expected communication, eligibility/order if known, privacy, confirmation state | “Coming soon” is sufficient value or that joining guarantees access |
| App | “Will this work for my device and task, and where do I safely get it?” | Open, download, install, pre-order, scan QR | Real interface/experience, supported platforms and devices, store-specific CTAs, rating/review context if verified, pricing model, permissions/data handling, web-to-device handoff | A generic `Download` button or device mockups alone explain the product |
| Event | “Is this relevant, feasible, and worth attending?” | Register, reserve, buy ticket, add to calendar, join stream | Name, date/time/timezone, format, venue/access, audience, agenda, speakers/host, ticket availability/price/fees, refund/cancellation, accessibility, updates | Speakers or agenda are required when they add no decision value |
| Lead generation | “Is the promised value worth my data and likely follow-up?” | Submit email, request demo/quote, download, apply | Specific exchange, form, field rationale, privacy/follow-up expectation, validation/error/success states, qualification logic if needed | More fields always improve lead quality or fewer always improve business value |
| Campaign | “Does this destination deliver the promise that caused my visit?” | Underlying journey action | Message continuity, audience-specific context, offer/source identifiers, relevant proof, campaign terms, controlled variants | Remove all navigation, force one CTA, or duplicate ad copy verbatim |
| Pricing/offer | “What will I pay, what do I get, and what conditions apply?” | Select plan, begin checkout, buy, contact sales | Price basis, currency/tax/fees where material, billing period, inclusions/limits, comparison basis, discount reference, renewal/cancellation/refund, eligibility, availability | One highlighted middle tier, monthly/annual toggle, or FAQ |
| Editorial | “Can this content help me understand or evaluate the topic?” | Read, inspect sources/method, use tool, subscribe, continue to a related offer | Descriptive title, author/organization, date when material, evidence and sources, method, useful body, sponsorship/commercial disclosure, contextual next step | An advertorial can masquerade as independent reporting |

### 2.1 Product

Use `product` when the decision object is sufficiently defined that visitors can evaluate a stable capability, item, or plan. Physical goods may require variants, inventory, shipping, returns, and product media. SaaS may require an interactive demonstration, integrations, security, trial conditions, and migration effort. A standardized digital download may need format, license, and delivery details. These are modifiers inside the product archetype, not reasons to create dozens of page categories.

The architecture should expose the product's useful job and whichever details make that job credible. Proof should attach to claims: a security statement needs real controls; a performance claim needs its method; a customer result needs truthful, representative context. The FTC's current endorsements and reviews guidance makes clear that reviews and testimonials must not be fake or misleading and that material relationships may require disclosure ([FTC endorsements, influencers, and reviews](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)).

### 2.2 Service

The service journey normally contains more uncertainty because the visitor is evaluating both an outcome and a provider. The page may therefore need to answer fit, process, scope, responsibility, time, credentials, and what happens after contact. This does not justify generic “our process” diagrams. Show process only where it reduces uncertainty or explains the mechanism.

CTA choice should match operational reality. `Book a consultation`, `Request a scoped quote`, and `Send project details` promise different next steps. A form that merely creates a sales lead must not be labeled as if it starts service delivery.

### 2.3 Launch

`Launch` should be an overlay only when lifecycle state changes architecture. A normal product page updated with a badge does not need a launch template. A real launch may need release status, availability by market/platform, compatibility, migration, demonstration of what changed, and a temporary offer. If the item is not available, use the waitlist or pre-order journey honestly.

Google Ads treats under-construction or contentless “coming soon” destinations as insufficient; a paid landing destination should provide useful, unique, original value rather than acting as a bridge page ([Google Ads insufficient original content](https://support.google.com/adspolicy/answer/16427718?hl=en)). This does not ban useful pre-launch pages, but it rejects the idea that a decorative teaser alone is a good destination.

### 2.4 Waitlist

A waitlist sells confidence in a future exchange, not access to a present product. State what joining means: notification, application review, queue position, beta eligibility, or something else. State what is not guaranteed when ambiguity could mislead. Ask only for data needed at this stage and make the post-submit confirmation explicit.

EU GDPR Article 5 requires personal data to be adequate, relevant, and limited to what is necessary; Article 7 requires consent withdrawal to be as easy as consent when consent is the lawful basis ([GDPR official text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)). The design implication is not “always add a checkbox”—lawful basis and jurisdiction require proper review—but “do not collect speculative profile data or bundle unrelated communications invisibly.”

### 2.5 App

An app page must bridge web understanding and platform action. Show the app performing the relevant task; state platform/device compatibility and pricing honestly; route visitors to the correct store, pre-order, open-app, or web experience. Apple explicitly specifies official App Store badge use, localization, minimum size, and links to the store product page, so generated substitute badges or ambiguous download art are not harmless decoration ([Apple App Store marketing guidelines](https://developer.apple.com/app-store/marketing/guidelines/)).

The primary outcome may occur outside the page. Instrument an outbound store action separately from a verified install or activation. Do not report store clicks as installs.

### 2.6 Event

Event pages are unusually sensitive to time and state. Date, local time and timezone, format, location or access path, availability, price, and cancellation status can change. The design needs resilient states such as scheduled, rescheduled, postponed, sold out, registration closed, and completed. An expired event should not keep a live purchase CTA.

Google's Event structured-data documentation is also a useful minimum fact model: event name, start date, location, offers, ticket availability, price/currency, sale date, organizer, and a specific ticket URL. It requires accurate timezone handling and separate event instances where performances have separate tickets ([Google Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)). Structured data must match visible page content; it is not a substitute for it.

### 2.7 Lead generation

Lead generation is an exchange architecture. Before the form, make the exchange legible: what the visitor receives, what information is required, how it will be used, and what happens next. At the form, use visible labels, relevant input types/autocomplete, useful hints, field-level errors, a submission error state, and a success/confirmation state. WCAG requires labels or instructions for user input and text identification of detected errors ([WCAG Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)).

Only ask questions with a current operational use. GOV.UK's question-page pattern advises knowing why every question is asked, collecting only information genuinely needed, identifying optional fields, and avoiding repeat entry ([GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/)). This is a service-design source rather than a conversion benchmark, but the principle directly improves form architecture.

### 2.8 Campaign

`Campaign` describes controlled acquisition context, not a standalone content object. Pair it with the underlying journey. The page should continue the specific offer, audience language, eligibility, and creative promise that generated the visit. This is an inference from Google's requirement that ad destinations be relevant, useful, functional, and easy to navigate, not a license to repeat the ad without adding decision value ([Google Ads policies](https://support.google.com/adspolicy/answer/6008942?hl=en)).

Navigation should be decided by task. Remove or reduce it when unrelated exits materially distract from a narrow, understood journey; retain it when visitors need company identity, documentation, pricing, support, or independent verification. A logo should normally provide a predictable route home unless the flow has a strong reason not to.

### 2.9 Pricing/offer

Pricing/offer pages make commercial terms primary content. Show the real comparison basis, billing cadence, material limits, and next action. If a lower periodic equivalent requires annual payment, the annual commitment must not be visually concealed. Discounts need a truthful reference price and real eligibility/date conditions. “Free,” guarantees, and refund language need their material conditions close enough to the offer to affect the decision.

FTC advertising guidance says qualifications should be clear and unambiguous, close to the claim, and not undermined by distracting design; the FTC's Guides Against Deceptive Pricing remain codified at 16 CFR Part 233 ([FTC advertising FAQ](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business), [FTC deceptive pricing guide](https://www.ftc.gov/legal-library/browse/rules/deceptive-pricing)). Exact legal requirements vary by offer, industry, and jurisdiction, so the skill should flag unresolved terms rather than invent compliance copy.

### 2.10 Editorial, when justified

Use editorial architecture only when consuming the content is a real user goal: an original report, guide, benchmark, research article, documented story, or useful interactive explanation. The page should add original information or analysis, identify authorship where expected, expose sources and method, and give readers enough value without requiring a commercial click. Google's people-first content guidance asks whether content is original, complete, sourced, expert, and genuinely useful to an intended audience ([Google people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).

Editorial is not a disguise. If a page looks like an article but is promotional content whose commercial nature may not be obvious, FTC guidance says that nature may need a clear, prominent disclosure near where readers first look, normally the headline ([FTC native advertising guide](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)). A contextual CTA can follow the information journey; it should not retroactively turn the article into a bait page.

## 3. Architecture modifiers

After selecting category layers, evaluate every modifier below. These are the fields that actually change page architecture.

| Modifier | Diagnostic question | Architectural effect |
| --- | --- | --- |
| Proposition | What exactly is offered, to whom, in what situation, with what credible outcome or difference? | Determines the first semantic anchor and which facts belong in the opening viewport; may be product-, outcome-, task-, or offer-led |
| Audience | Who arrives, from where, with what role, awareness, language, device, and eligibility? | Changes terminology, examples, entry context, segmentation, proof, and whether a general overview is needed |
| Proof burden | Which claims are consequential, unfamiliar, comparative, or difficult to verify? | Selects demonstrations, data/method, case evidence, credentials, reviews, guarantees, or independent sources and places them near the claim |
| Mechanism burden | Does the visitor understand how the result is produced and what they must do? | Adds product-in-use media, process, sample output, agenda, compatibility, implementation, or service steps |
| Objections | What could reasonably prevent this audience taking the next action? | Adds only the relevant answer: price, fit, time, switching, security, returns, access, support, permissions, cancellation, or status |
| Offer | Is it free, paid, trial, subscription, tiered, custom, discounted, limited, or application-only? | Changes price display, terms, comparison, urgency, eligibility, transaction path, and disclosures |
| CTA commitment | What exactly happens next, and how costly, reversible, or data-intensive is it? | Sets CTA label, prominence, prerequisite information, secondary action, confirmation, and recovery path |
| Form/data contract | What data is truly required now, why, and what happens after submission? | Determines whether a form exists, field count/type, steps, consent/notice, errors, success state, and handoff |
| Trust/risk | What could the visitor lose: money, time, privacy, safety, status, or operational continuity? | Adds identity, security/privacy, policy, credentials, support, refund/cancellation, accessibility, and risk boundaries |
| Legal/disclosure | Which claims, sponsorships, testimonials, prices, recurring terms, eligibility rules, regulated topics, or tracking practices need qualification? | Makes disclosure a proximal content block; may block a claim or interaction when facts are missing |
| Experiment | What uncertain choice is being tested, for whom, against what control, on which outcome? | Creates controlled variant boundaries, assignment, predeclared metrics, guardrails, and QA requirements |
| Analytics | Which observable events represent progress and final value? | Defines event names/parameters, source attribution, funnel boundaries, downstream joins, consent behavior, and data-quality checks |
| Responsive | What must remain visible, equivalent, operable, and understandable at narrow widths and zoom? | Reorders by decision priority, transforms comparisons/forms/media, preserves qualifications, and removes overflow/occlusion |
| Performance | Which content and scripts compete with the primary message and action? | Sets media/JS/third-party budgets, loading priority, font/image strategy, stability requirements, and field monitoring |

### 3.1 Proposition and audience

Do not begin from a headline formula. Establish the smallest truthful model:

- decision object;
- intended audience or situation when material;
- useful outcome;
- mechanism or difference when needed for credibility;
- actual next action.

Traffic source changes what can be assumed. A branded search visitor may need price and access immediately. A problem-aware visitor from an educational article may need orientation and mechanism. A returning invitee may need only status and login. Do not force each through the same explanatory sequence.

### 3.2 Proof, mechanism, and objections

Proof is claim-specific, not a mandatory “social proof section.” A product demo proves behavior better than unrelated logos. A method and sample prove research more directly than a testimonial. Credentials may matter for regulated services; delivery and return policy may matter for goods; speaker expertise may matter for an event. A page with no consequential claims may need no proof block at all.

Mechanism content earns space when it helps visitors understand feasibility, effort, or difference. Objection content earns space when it resolves a plausible blocker. An FAQ is only one possible container and often a poor place for material price, risk, or compatibility facts that belong beside the relevant decision.

### 3.3 CTA commitment ladder

Treat CTA choice as a ladder, not “primary versus secondary button” styling.

| Commitment | Examples | Information required before action |
| --- | --- | --- |
| Consume | Read report, watch demo, view agenda | Accurate destination and format; little personal risk |
| Inspect | See pricing, compare plans, check availability | Enough orientation to predict what will be inspected |
| Signal interest | Join waitlist, subscribe, save event | Exchange, data use, frequency/expectation, confirmation |
| Start adoption | Create account, install app, begin trial | Compatibility, cost/trial terms, permissions, setup expectation |
| Enter conversation | Request quote, book call, contact sales | Fit, reason for contact, what happens next, likely response |
| Apply/qualify | Submit application, eligibility check | Criteria, required data/documents, time, review process, privacy |
| Transact | Buy, subscribe, reserve paid ticket | Total offer, material terms, billing/delivery/refund/cancellation, error recovery |

A page may support one primary and one genuinely different lower-commitment action, such as `Start trial` and `Watch demo`. Do not create two labels for the same destination or force a low-intent visitor into a high-commitment form. Conversely, do not hide the transaction behind repeated `Learn more` steps when high-intent visitors are ready.

### 3.4 Forms and data

The form is part of the value exchange and must be designed as a complete state machine:

1. ready, with visible labels and required/optional status;
2. focused/filled, with format help where needed;
3. submitting, preventing accidental duplicate commitment;
4. validation error, identifying each problem in text;
5. transport/server error, preserving entered data where safe;
6. success, confirming the exact next state;
7. withdrawal/edit/cancellation path where relevant.

Do not add multi-step form machinery merely because the form is long. First remove questions without current use and use native input semantics. Split only when the journey has meaningful stages, branching, document-heavy input, or cognitive load that a single form cannot handle safely.

### 3.5 Trust, legal, and disclosure

Trust is not a row of decorative badges. It is the visitor's ability to verify identity, understand the exchange, predict what happens next, and recover when something goes wrong. Trust content should correspond to risk:

- identity and contact/support path;
- current price and commercial terms;
- delivery, cancellation, refund, or event-change policy;
- security/privacy facts that are actually verified;
- credentials and scope for consequential services;
- sponsorship and material relationships;
- accessible interaction and understandable errors.

Necessary disclosures must survive mobile layouts, sticky elements, modals, and experiments. They should not be hidden in hover-only UI, low-contrast fine print, or a distant legal page if needed to prevent the nearby claim from misleading.

## 4. Reusable module vocabulary

Use modules as answers to decision questions. Their names are conceptual; they do not prescribe a component style.

| Module | Question answered | Typical content |
| --- | --- | --- |
| Orientation | “What is this and am I in the right place?” | Product/service/event/content identity, status, audience anchor |
| Relevance/outcome | “Why might this matter to me?” | Task, outcome, use case, difference |
| Mechanism | “How does it work or what will happen?” | Demo, process, sample output, agenda, implementation |
| Scope/fit | “What is included, compatible, eligible, or excluded?” | Features, deliverables, devices, audience, prerequisites, limits |
| Evidence | “Why should I believe the important claim?” | Method, observed result, demonstration, credential, verified review, case |
| Offer/terms | “What do I give and get, under what conditions?” | Price, billing, access, delivery, availability, refund/cancellation, deadline |
| Risk/trust | “What could go wrong and how is it handled?” | Identity, privacy, security, support, policy, disclosure, limitation |
| Action | “What can I do now and what happens next?” | CTA, form, platform handoff, confirmation, alternate commitment |

Selection rule: every included module must answer a current question, satisfy a compliance/accessibility need, or support measurement of the requested journey. If it does none of these, omit it.

Sequencing rule: order modules by informational dependency and visitor intent. Orientation normally precedes evaluation, material terms precede commitment, and qualifying proof/disclosures sit near their claims. Beyond those constraints, a ready-to-buy visitor may see offer and action first, while an unfamiliar high-risk service may need mechanism and trust first.

## 5. Experiments and analytics

### 5.1 Experiment architecture

Experiment only a real uncertainty. Define:

- audience and traffic source;
- hypothesis and changed surface;
- control and treatment;
- randomization unit;
- primary decision outcome;
- guardrails such as errors, abandonment, page performance, refunds, or lead quality;
- minimum run rule and analysis plan;
- data-quality checks, including assignment or sample-ratio mismatch;
- disclosure and accessibility parity between variants.

Microsoft's experimentation research distinguishes overall evaluation, local diagnostic, guardrail, and data-quality metrics and warns that incorrect metric interpretation can produce harmful decisions ([Microsoft trustworthy experimentation patterns](https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-during-experiment-stage/), [Microsoft metric interpretation pitfalls](https://www.microsoft.com/en-us/research/publication/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-in-online-controlled-experiments/)). This supports testing a falsifiable architectural choice, not generating arbitrary variants and selecting the one with the most clicks.

Do not silently change offer, audience, proof, and CTA together and call the result a headline test. Do not stop at an early favorable fluctuation without an appropriate sequential method. Do not trade lead quality, refunds, complaints, accessibility, or performance for a local click increase.

### 5.2 Measurement by journey

Google Analytics 4's recommended events provide a useful shared vocabulary: `sign_up`, `generate_lead`, `qualify_lead`, `begin_checkout`, `purchase`, and `refund`, among others ([GA4 recommended events](https://support.google.com/analytics/answer/9267735?hl=en-EN)). Use the platform actually present in the project; the principle is stable even when event names differ.

| Journey | Primary outcome examples | Leading/diagnostic signals | Guardrails |
| --- | --- | --- | --- |
| Product | Trial activation, purchase, retained use | Demo use, plan/item selection, checkout start | Refund, cancellation, error, performance |
| Service/lead-gen | Qualified lead, accepted project, revenue | Form start/submit, booking completion, response | Spam, disqualified lead, no-show, privacy complaint |
| Waitlist | Confirmed signup and later activation | Form start/submit, confirmation | Unsubscribe, duplicate/error, misleading expectation |
| App | Verified install/open/activation | Store outbound click, QR scan, platform choice | Wrong-platform exits, install failure, page speed |
| Event | Valid registration/paid ticket and attendance | Agenda view, ticket selection, checkout | Refund, cancellation, capacity/availability error |
| Campaign | Underlying journey outcome by source/creative | CTA and module interactions needed to diagnose | Performance, bounce/abandonment, downstream quality |
| Pricing/offer | Paid conversion or qualified sales handoff | Plan comparison/selection, checkout start | Refund, downgrade/cancel, pricing confusion/support |
| Editorial | Task completion proxy and meaningful downstream action | Source/method use, tool completion, related-content action | Search return, complaint, performance; avoid treating scroll alone as value |

Track source, campaign, content/creative variant, page version, locale, device class, and offer identifier only where they have a defined analysis use. Avoid collecting personal data “for later.” Ensure consent and cookie behavior fit the applicable jurisdiction. The UK ICO states that non-essential cookies cannot be set before consent, consent requires a clear positive action, and users need clear information about purposes ([ICO cookies and similar technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)).

## 6. Responsive, accessible, and performant delivery

### 6.1 Responsive architecture

Responsive design is not “stack desktop cards.” At each supported width and zoom:

- preserve the same primary task and materially equivalent content;
- keep claim qualifications and sponsorship/price terms adjacent to what they qualify;
- make the primary and alternate actions distinguishable;
- transform plan comparisons without hiding material differences;
- keep forms labeled, errors visible, and submitted state understandable;
- ensure sticky CTAs/banners do not obscure focused controls or legal content;
- give touch targets adequate size/spacing;
- avoid horizontal page scrolling except for content whose meaning requires two dimensions.

WCAG 2.2 requires most vertical content to reflow at a width equivalent to 320 CSS pixels without information/function loss and sets a 24 by 24 CSS pixel minimum target or sufficient spacing, subject to defined exceptions ([WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [WCAG Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)). These are accessibility floors, not preferred component dimensions.

### 6.2 Performance architecture

Performance changes content and component choices. A visually dominant video, multiple webfonts, review widgets, chat, analytics tags, consent tooling, and experiment runtime all compete with the proposition and action. Decide which are necessary before implementation.

Use field data where traffic permits and lab checks before launch. Current Core Web Vitals “good” thresholds at the 75th percentile are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 ([web.dev: how Core Web Vitals thresholds are defined](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en)). Treat these as outcome guardrails, not permission to spend the entire budget.

Default implementation implications:

- prioritize the real largest-content element rather than hiding it behind client-side rendering;
- reserve media and embed dimensions to prevent layout shift;
- use responsive images and poster frames instead of eager autoplay video where motion is not essential;
- defer noncritical third-party code and remove unused campaign scripts;
- prefer native HTML controls and links over JS replicas;
- test the actual form, consent, experiment, and analytics bundle, not an empty shell.

## 7. Rejected universal formulas

| Rejected formula | Why it fails | Limited legitimate use |
| --- | --- | --- |
| `Hero → logos → 3 features → testimonial → FAQ → final CTA` | Assumes the same questions, proof, and commitment for every journey; creates repeated filler | As a checklist to ask whether relevance, mechanism, proof, uncertainty, and action were considered—not as section order |
| AIDA or PAS as page architecture | Encourages theatrical attention/pain escalation and hides operational details | As a copy diagnosis or ideation lens when it matches real audience awareness |
| “One page, one CTA” | Confuses one primary outcome with one permissible action; blocks low-commitment inspection or support paths | One primary outcome can guide hierarchy while a distinct secondary action serves another readiness level |
| “Remove navigation to increase conversion” | Can reduce identity, verification, support, pricing access, and user control | A narrow campaign flow may simplify unrelated navigation after task analysis |
| “CTA above the fold and after every section” | Produces repetition and asks before enough information exists | Keep an action available when high-intent visitors are ready; repeat only after new information materially changes readiness |
| “Short pages convert” / “long pages convert” | Length is a consequence of decision burden, not a strategy | Use the shortest page that answers material decision questions and obligations |
| “Always add social proof” | Logos and quotes may be irrelevant, unverifiable, or weaker than a demo/method | Use verified evidence tied to a consequential claim or objection |
| “Put objections in an FAQ at the end” | Separates material limits, terms, and qualifications from the decision they affect | Use FAQ for genuine cross-cutting questions that do not belong nearer a claim or action |
| “Use exactly three benefits/features” | Optimizes symmetry instead of comprehension | Use the number of distinct, relevant capabilities needed—possibly zero, one, or many |
| “Highlight the middle pricing tier” | Manipulates attention without knowing fit or economics | Highlight a plan only when a truthful audience-fit rule can be stated |
| “Mobile is the desktop page stacked” | Preserves visual order rather than decision priority; breaks comparison, forms, sticky UI, and disclosure proximity | Stacking is fine when it preserves relationships and no better transformation is needed |
| “Test everything” | Creates underpowered, uninterpretable experiments and metric fishing | Test a consequential uncertainty with a hypothesis, outcome, guardrails, and sufficient data |

## 8. Recommended reusable category structure

A frontend design skill should store the brief as a small decision model, not a section preset:

```yaml
landing_page:
  base: product | service | app | event | editorial
  overlays: [launch, waitlist, campaign, pricing_offer]
  conversion: direct | lead_generation | informational

  journey:
    entry_source: unknown | search | ad | email | social | referral | direct
    audience: "specific only when it changes the offer or evidence"
    known_state: "what the visitor likely already understands"
    decision: "the decision this page helps make"
    next_commitment: "literal result of the primary action"

  architecture:
    proposition: "offer + relevance + credible outcome"
    mechanism_needed: true | false
    proof_needed: [claim-specific evidence]
    objections: [material blockers only]
    offer_terms: [price, availability, eligibility, conditions]
    form_fields: [only data used at this stage]
    trust_risks: [money, time, privacy, safety, continuity]
    disclosures: [claim/offer/source-specific requirements]

  delivery:
    responsive_risks: [comparison, sticky action, form, disclosure, media]
    performance_risks: [hero_media, fonts, embeds, tags, experiment_runtime]
    primary_metric: "real journey outcome"
    guardrails: [quality, errors, refunds, complaints, performance]
    experiment: null | "one hypothesis with control and treatment"
```

This schema is deliberately descriptive. It should not generate empty keys as visible sections, and it should not invent missing business facts. `proof_needed` means “obtain, verify, or omit/narrow the claim,” never “fabricate a testimonial.” `disclosures` means “surface requirements for owner/legal review,” not “generate authoritative legal advice.”

## 9. Generation procedure for the skill

1. **Classify compositionally.** Choose one base object, then any real overlays and conversion mode.
2. **Name the decision and commitment.** State what the visitor decides and the literal result of activating the primary CTA.
3. **Map live questions.** List only the unknowns that can block that decision: relevance, mechanism, fit, proof, price, risk, terms, or access.
4. **Select modules.** Choose the smallest set from orientation, outcome, mechanism, scope, evidence, offer, risk, and action.
5. **Sequence by dependency.** Put high-intent shortcuts early; keep proof/qualifications near claims; put material terms before commitment.
6. **Design the complete interaction.** Include form, validation, error, success, expired/sold-out/unavailable, and external handoff states that the journey actually has.
7. **Apply source-specific constraints.** App badges, event facts, campaign terms, sponsorship labels, prices, privacy, and consent are content requirements.
8. **Plan responsive transformations and a performance budget before polishing.** Preserve decision relationships rather than desktop geometry.
9. **Instrument the real outcome.** Distinguish leading actions from downstream success; add quality and performance guardrails.
10. **Experiment only unresolved consequential choices.** Keep the treatment interpretable and preserve accessibility, truth, and disclosure parity.

## 10. Quality gate

Before delivery, confirm:

- [ ] The category is a composition, not a forced template label.
- [ ] The page states what it is and what the primary action actually does.
- [ ] Every section answers a distinct decision question or required obligation.
- [ ] No proof, review, logo, metric, deadline, availability, price, or urgency was invented.
- [ ] Claim qualifications and commercial/sponsorship disclosures are proximal and readable.
- [ ] Forms collect only currently needed data and include labeled, error, submitting, and success states.
- [ ] App, event, launch, and waitlist states accurately match real availability.
- [ ] Pricing includes the material basis and conditions needed to understand the offer.
- [ ] Mobile preserves content, terms, CTA meaning, and form usability rather than merely stacking.
- [ ] The implemented experience meets accessibility fundamentals and is tested at narrow widths and zoom.
- [ ] Critical content is not delayed by unnecessary client rendering or third-party scripts.
- [ ] Analytics distinguishes interest, submission, qualification, purchase/install/attendance, and negative outcomes as applicable.
- [ ] Any experiment has a hypothesis, control, primary outcome, guardrails, and data-quality check.

## Source basis

Primary and official sources used in this synthesis:

- [FTC: Advertising FAQs](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business)
- [FTC: Native Advertising - A Guide for Businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)
- [FTC: Endorsements, Influencers, and Reviews](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)
- [FTC: Deceptive Pricing, 16 CFR Part 233](https://www.ftc.gov/legal-library/browse/rules/deceptive-pricing)
- [EUR-Lex: General Data Protection Regulation](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)
- [ICO: Cookies and Similar Technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)
- [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [W3C: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [W3C: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [GOV.UK Design System: Question Pages](https://design-system.service.gov.uk/patterns/question-pages/)
- [Google Ads: Advertising Policies](https://support.google.com/adspolicy/answer/6008942?hl=en)
- [Google Ads: Insufficient Original Content](https://support.google.com/adspolicy/answer/16427718?hl=en)
- [Google Search Central: Mobile-First Indexing Best Practices](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Google Search Central: Event Structured Data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google Search Central: Helpful, Reliable, People-First Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Analytics: GA4 Recommended Events](https://support.google.com/analytics/answer/9267735?hl=en-EN)
- [web.dev: How Core Web Vitals Thresholds Were Defined](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en)
- [Apple Developer: App Store Marketing Resources and Identity Guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
- [Microsoft Research: Patterns of Trustworthy Experimentation](https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-during-experiment-stage/)
- [Microsoft Research: A Dirty Dozen - Metric Interpretation Pitfalls](https://www.microsoft.com/en-us/research/publication/a-dirty-dozen-twelve-common-metric-interpretation-pitfalls-in-online-controlled-experiments/)

