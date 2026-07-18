# Web and Landing-Page Copy Research

## Purpose

This report defines how an AI should write clear, specific, useful website copy without falling into generic “conversion copy” or recognisable AI prose. It covers headlines, supporting copy, value propositions, calls to action, section sequencing, scannability, information scent, proof, and review.

It is not a universal tone guide. Brand voice, product category, audience sophistication, risk, traffic source, and the user's explicit brief still control the final language. The rules below are defaults for making copy understandable and credible when the brief does not specify otherwise.

## Evidence summary

Several independent bodies of evidence point in the same direction:

- People scan web pages and rely heavily on meaningful headings, visible keywords, concise paragraphs, and an inverted information order. Nielsen Norman Group's long-running web-usability guidance recommends short, scannable copy and headings that explain the topic rather than trying to be cute ([NN/g: Be Succinct](https://www.nngroup.com/articles/be-succinct-writing-for-the-web/)).
- Government content-design guidance recommends starting from the user's task, putting the important terms first, using plain language, and removing material that does not help the user complete that task ([GOV.UK content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/), [ONS plain-language guidance](https://service-manual.ons.gov.uk/content/writing-for-users/plain-language)).
- Accessibility standards require headings and labels to describe their topic or purpose, and links to communicate what will happen when followed ([WCAG 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels), [WCAG 2.4.4](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)).
- Conversion research repeatedly finds that clarity, continuity with the incoming message, a visible value proposition, and a coherent sequence of information matter. Individual test results are not universal laws, but they support testing concrete messages rather than blindly applying formulas ([MarketingExperiments headline test](https://marketingexperiments.com/value-proposition/value-proposition-headline), [MarketingExperiments page-flow test](https://marketingexperiments.com/conversion-marketing/homepage-optimization-tes), [Unbounce landing-page copy guide](https://unbounce.com/landing-page-copywriting/)).
- Advertising claims must be truthful, non-deceptive, and supported before publication. The overall implication of the page matters, not merely the literal wording of each sentence ([FTC advertising FAQ](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business), [FTC advertising guidance](https://www.ftc.gov/business-guidance/advertising-marketing)).
- Research comparing LLM and human writing finds narrower stylistic variation, recurring lexical preferences, and genre-inappropriate grandiose language in model output. This supports reviewing the whole rhetorical pattern, not merely banning a few words ([Liu and Demberg, ACL 2023](https://aclanthology.org/2023.acl-srw.1/), [Geng et al., PNAS 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11874169/), [Kobak et al., 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12219543/)).

No single headline formula, CTA wording pattern, readability score, or maximum word count guarantees conversion. Copy must be evaluated in context and, where traffic permits, tested against a meaningful alternative.

## Core standard

Every piece of copy must do at least one job:

1. Identify what the page, product, or section is about.
2. Explain value, mechanism, evidence, cost, risk, or limitation.
3. Help the reader choose or complete an action.
4. Establish a deliberate brand voice that the rest of the page supports.

If text does none of these, remove it. Decorative pseudo-information such as `STUDIO / 024`, fake coordinates, empty category labels, and ornamental slogans does not earn space merely by creating visual texture.

## 1. Start with a message model, not prose

Before drafting, establish the smallest truthful message model available from the brief and supplied materials:

- **Offer:** What exactly is being sold, provided, or explained?
- **Audience:** Who is it for, if the audience materially affects the offer?
- **Situation:** What task, problem, or desire brought the visitor here?
- **Outcome:** What useful change can the offer credibly create?
- **Mechanism:** How does it produce that outcome?
- **Difference:** Why choose this instead of a realistic alternative?
- **Proof:** What evidence supports the important claims?
- **Conditions:** What price, time, eligibility, integration, effort, or risk matters?
- **Action:** What can the visitor actually do next?

Do not fabricate missing answers. Write around genuinely known facts, use visibly marked placeholders when the user requested a concept or mockup, and report missing production content separately.

### Minimum viable value proposition

A useful value proposition lets the intended reader answer, quickly:

- What is this?
- Is it relevant to me?
- What will it help me do?
- Why should I believe or choose it?

The hero does not need to answer every question in one sentence. It may distribute the work across a headline, a supporting line, a relevant visual, a proof element, and a CTA. The group must work together without repeating itself.

**Weak**

> Transforming possibilities into powerful digital experiences.

This names no product, audience, outcome, mechanism, or difference.

**Stronger**

> Invoice clients, track late payments, and reconcile your books in one workspace.

This is specific enough to identify the product's job. A supporting line can add the target customer or differentiator if needed.

**Weak**

> The future of intelligent collaboration is here.

**Stronger**

> Review contracts with your legal team without emailing versions back and forth.

Specificity is not the same as adding numbers. A precise noun, audience, action, constraint, or mechanism can make a claim specific without inventing a statistic.

## 2. Headline rules

### 2.1 Say something identifiable

The main headline should communicate the offer, useful outcome, distinct mechanism, or a combination of them. A visitor should not need the About page to discover what the company does.

Useful starting patterns are:

- **What it is:** “Payroll software for distributed teams.”
- **What the reader gets:** “Close payroll in hours, not days.”
- **What the reader can do:** “Plan, approve, and publish every campaign in one place.”

These are diagnostic options, not templates that must appear verbatim. CXL's review of 500 company headlines similarly groups effective approaches around what the offer is, what the visitor gets, or what they can do with it ([CXL headline research](https://cxl.com/blog/writing-home-page-headlines-for-the-modern-world-3-formulas-that-work/)).

### 2.2 Prefer clarity over cleverness

Wordplay is acceptable when the literal meaning remains obvious. If the joke, metaphor, or cultural reference must be decoded before the offer can be understood, it is carrying too much of the message.

**Weak**

> Where ideas learn to fly.

**Stronger**

> Turn research notes into a cited first draft.

**Contextual exception:** A famous product, entertainment property, campaign teaser, or art-led portfolio may intentionally lead with atmosphere. Provide an immediate semantic anchor elsewhere in the first viewport.

### 2.3 Compress before styling

Remove throat-clearing, repeated benefits, filler adjectives, and words implied by nearby copy. Do not use manual line breaks to make a weak sentence look designed. Let responsive type wrap naturally unless a deliberate break protects meaning and still works at all supported widths.

There is no universal maximum word or line count. A two-line vague headline is worse than a three-line precise one. The standard is: use the shortest wording that preserves the useful meaning, and do not create an early break while substantial line width remains.

**Weak**

> A smarter and more seamless way for modern teams to work together and achieve more every single day.

**Stronger**

> Keep project decisions, owners, and deadlines in one place.

### 2.4 Make the supporting line add information

The subhead should not paraphrase the headline. It should add one or two missing pieces: audience, mechanism, concrete scope, evidence, qualification, or risk reduction.

**Weak pair**

> Ship work faster.  
> Move faster and get more done with our powerful platform.

**Stronger pair**

> Ship client work without status meetings.  
> Approvals, files, decisions, and due dates stay attached to each deliverable.

If the headline already says enough, omit the subhead. Do not create one to satisfy a visual template.

### 2.5 Write section headings as navigation

Readers use headings to decide whether a section deserves attention. A heading should remain informative when seen in a list of headings without its paragraph.

**Weak:** “A better way”  
**Stronger:** “Approve expenses before they reach payroll”

**Weak:** “Built for you”  
**Stronger:** “Permissions for agencies, clients, and contractors”

Headings can carry personality, but the topic or purpose must stay recoverable. WCAG explicitly requires headings and labels to describe topic or purpose; they need not be long to do this ([WCAG 2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)).

### 2.6 Do not add automatic eyebrows

Do not generate an uppercase kicker, category label, overline, pretitle, or section number above a heading by default. If real taxonomy, status, navigation, or required context exists, express it through the appropriate functional component. Do not invent pseudo-taxonomy such as `OUR APPROACH`, `WHY US`, or `CAPABILITIES / 03` to decorate a layout.

## 3. Value propositions without hype

### 3.1 Convert claims into inspectable meaning

Replace vague quality claims with a concrete capability, mechanism, boundary, or result.

| Vague claim | More useful expression |
| --- | --- |
| “Powerful automation” | “Route requests by budget, department, and approval status.” |
| “Enterprise-grade security” | “SAML SSO, audit logs, and role-based access are included.” |
| “Effortless onboarding” | “Import your customer list and send the first campaign without code.” |
| “Built to scale” | “Add workspaces without duplicating roles and policies.” |
| “All-in-one platform” | Name the connected tasks that previously required separate tools. |

Do not replace every adjective with a random feature list. Select the detail that explains why the promised outcome is credible.

### 3.2 Separate benefit, feature, and proof

- **Benefit:** the useful change for the customer.
- **Feature:** the product capability that enables it.
- **Proof:** evidence that the feature works or the result occurs.

Weak copy often jumps from an abstract benefit to an unsupported conclusion. A stronger unit connects all three when the claim warrants it:

> Review every purchase before it is paid. Set approval limits by team, route exceptions to finance, and keep the decision in the audit log.

Do not force this three-part structure into every card. Use it where the reader needs explanation or confidence.

### 3.3 Substantiate objective claims

Numbers, rankings, speed claims, savings, adoption, customer outcomes, guarantees, awards, and comparisons need real support. Keep the source, population, timeframe, method, and material qualification close enough to prevent a misleading impression.

**Do not write:** “Cut reporting time by 70%” unless the claim is supplied and supported.

**When proof is missing:** describe the actual feature, omit the claim, or use an explicit placeholder in a design concept. Never convert uncertainty into fake precision.

FTC guidance treats both express and implied messages as claims and requires a reasonable basis before publication. Fine print cannot rescue a contradictory main message ([FTC advertising FAQ](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business)).

### 3.4 Avoid fake urgency and scarcity

Do not invent countdowns, capacity limits, expiring offers, waiting lists, “today only” language, or social-pressure copy. Urgency is legitimate only when an actual deadline, capacity constraint, event, or consequence exists and is accurately described.

**Weak:** “Claim your spot before it is gone.”  
**Stronger when true:** “Applications close 18 September.”

### 3.5 Let proof answer a real objection

Testimonials, logos, ratings, certifications, security information, case results, and client counts are not mandatory landing-page furniture. Include verified proof where it resolves a likely doubt, and connect it to the relevant claim.

Do not fabricate people, quotes, companies, ratings, results, or logos. Testimonials are claims, not independent substantiation, and atypical results may require qualification ([FTC endorsements guidance](https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements)).

## 4. CTA labels and information scent

### 4.1 Name the action or destination

The label should help the visitor predict the result of activating it. Prefer a specific action or destination over generic language.

| Weak | Stronger |
| --- | --- |
| Learn more | See payroll features |
| Get started | Create a free workspace |
| Submit | Request the audit |
| Click here | Read the migration guide |
| Explore | Browse customer stories |
| Contact us | Talk to a solutions engineer |

Generic labels can be acceptable when surrounding context makes the outcome unmistakable, but repeated `Learn more` links across unrelated cards have weak information scent and are difficult to distinguish out of context. W3C guidance recommends link text that identifies purpose and consistent naming for equivalent destinations ([WCAG link purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)). GOV.UK similarly recommends descriptive, front-loaded link text rather than “click here” or “more” ([GOV.UK link guidance](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/tone-of-voice/add-links/)).

### 4.2 Match the commitment level

The label must not imply a smaller or different commitment than the next step.

- Do not label a sales form `Start free` if no free use begins after submission.
- Do not label a booking flow `Get a quote` if the next step is only an account signup.
- Do not label a paid checkout `Try it` unless a trial actually exists.
- If the action opens email, downloads a file, leaves the site, or starts a multi-step application, communicate that when it materially affects the choice.

### 4.3 Distinguish competing actions

Primary and secondary CTAs should represent different user intentions, not synonyms styled at different weights.

**Weak pair:** `Get started` / `Start now`  
**Stronger pair:** `Create workspace` / `Watch 2-minute demo`

If two controls lead to the same destination and serve the same purpose, use the same or closely aligned label. If they lead to different destinations, make that difference clear.

### 4.4 Keep labels compact and unbroken

Use a short verb-led label when it accurately describes the action. On desktop, CTA text should normally remain on one line; wrapping makes the control harder to scan and often signals an overlong or undersized component. Do not shorten it into ambiguity merely to avoid wrapping. Fix the wording or component width.

### 4.5 Use nearby microcopy only to resolve friction

Microcopy may explain cost, cancellation, time, privacy, eligibility, delivery, or what happens next.

**Useful:** `No card required. Cancel from account settings.`  
**Empty reassurance:** `Fast. Easy. Secure.`

Do not place a generic line under every CTA. Add it where research, risk, or the transaction itself identifies a real concern.

## 5. Section sequencing

### 5.1 Sequence by the reader's next unanswered question

A landing page is a decision path, not a mandatory stack of components. After each section, ask what a reasonable visitor still needs to understand or believe before acting.

A common sequence may be:

1. Identify the offer and its relevance.
2. Explain the useful outcome and mechanism.
3. Demonstrate the product or service.
4. Address the most important uncertainty or objection.
5. Supply relevant proof.
6. Clarify price, scope, process, or risk.
7. Present the appropriate next action.

This is not a fixed template. A known consumer product may need product range and price early. A high-risk B2B service may need credibility, process, and security before a sales CTA. A campaign landing page should preserve message continuity with the ad or email that sent the visitor. An established product page may begin directly with the task.

Baymard's ecommerce testing shows that homepages must help visitors understand what type of site they reached, what they can do there, and the breadth of the offer without creating visual overload ([Baymard homepage benchmark](https://baymard.com/homepage-and-category-usability/benchmark/page-types/homepage)). The implication is not that every site needs the same sections, but that page content must answer the visitor's orientation and product-finding questions.

### 5.2 Remove repeated sections

Do not restate the same promise as a hero, three benefits, a large quote, a statistic, and a closing CTA. Each section should advance the reader's understanding.

Run a “new information” test:

- What does this section add that no earlier section established?
- Which decision question does it answer?
- Could its useful sentence be moved into an existing section?
- Would removing it make the offer less clear or credible?

If the answer to the last question is no, remove it.

### 5.3 Use formulas as checks, not scripts

Formulas such as AIDA, PAS, Before-After-Bridge, and 4U can help expose missing logic or generate alternatives. They should not dictate every section or force emotional escalation.

- **AIDA** can help campaign pages check whether they establish relevance, build understanding, support desire, and offer an action. It hurts when every section becomes theatrical persuasion or when “attention” produces clickbait unrelated to the offer.
- **PAS** can help when the audience already recognises a costly problem. It hurts when the copy invents fear, exaggerates pain, or repeatedly agitates a problem after the reader understands it.
- **Before-After-Bridge** can clarify a genuine transformation. It hurts when “before” caricatures the customer or “after” promises an unsupported ideal state.
- **4U** can prompt usefulness and specificity. “Urgency” and “uniqueness” are not mandatory; false urgency and strained novelty reduce trust. Even Unbounce's own discussion notes that adding urgency can increase skepticism and attract the wrong audience ([Unbounce 4U discussion](https://unbounce.com/copywriting/gut-check-your-landing-page-headlines/)).

The page should expose the logic of the offer, not the formula used to draft it.

## 6. Scannability and reading flow

### 6.1 Front-load useful terms

Put the distinguishing noun or action near the start of headings, links, bullets, and sentences where natural. Readers scanning the left edge should encounter meaning rather than setup.

**Weak:** “When it comes to managing access, we make it simple to…”  
**Stronger:** “Set access by role, team, or project.”

### 6.2 One paragraph, one main point

Keep paragraphs focused. Start a new paragraph when the point changes. Short paragraphs are helpful on the web, but do not turn every sentence into an isolated dramatic line.

### 6.3 Use lists for genuine sets

Use bullets for parallel items that readers may compare or scan independently. Do not break normal prose into three bullets merely to create visual rhythm, and do not force every value proposition into a trio.

### 6.4 Preserve hierarchy in the words

The copy should remain intelligible without relying on font size, colour, or animation. Headings identify topics; body copy explains; labels identify controls; captions explain media; CTA labels name actions.

### 6.5 Put the conclusion before background

Lead with what the user needs to know, then provide detail, rationale, or history. Company origin stories and internal process matter only if they help the user evaluate the offer.

### 6.6 Do not confuse brevity with omission

Concise copy can still be complete. Keep material constraints, pricing conditions, compatibility, eligibility, risk, and next-step information. Move specialised detail to a clearly labelled secondary page when it would burden most visitors, rather than deleting it.

## 7. AI-copy failure modes

Research shows that LLMs can produce grammatical text while exhibiting less human stylistic variation and strong preferences for certain words and rhetorical patterns. In a multi-genre comparison, instruction-tuned models substantially overused terms such as `tapestry`, `intricate`, `palpable`, `underscore`, and `amidst`, often in genres where they felt conspicuous ([Geng et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC11874169/)). A study of more than 15 million biomedical abstracts also found abrupt increases in style words such as `delves`, `underscores`, and `showcasing` following widespread LLM adoption ([Kobak et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC12219543/)).

The correct response is not a simplistic forbidden-word list. The same word may be exact in one context and empty in another. Review these broader failure modes:

### 7.1 Abstract benefit fog

Strings of positive abstractions create the feeling of value without explaining it.

**Sloppy:** “Unlock seamless growth through intelligent innovation.”  
**Better:** “Find the accounts most likely to renew before the quarter closes.”

### 7.2 Grandiose framing for ordinary features

Routine functions are described as revolutions, journeys, ecosystems, or transformations.

**Sloppy:** “Embark on a transformative journey toward effortless scheduling.”  
**Better:** “Let clients book open times without emailing you.”

### 7.3 Semantic repetition

The headline, subhead, bullets, and CTA repeat the same claim with synonyms.

**Sloppy:** “Work smarter. Boost productivity. Achieve more. Get started.”  
**Better:** State the outcome once, then explain the mechanism or action.

### 7.4 Mechanical symmetry

Every section has three items; every sentence has the same cadence; every heading uses the same grammatical pattern. Parallel structure is useful for comparison, but constant symmetry makes distinct ideas sound interchangeable.

### 7.5 Formula residue

The draft visibly follows “Imagine a world…”, “Whether you are X or Y…”, “From A to B…”, “Not just X, but Y”, or “In today's fast-paced landscape…” without earning the construction.

Do not ban these strings mechanically. Remove them when they only delay the actual claim.

### 7.6 Fake contrast

AI copy often manufactures distinction through negation rather than evidence.

**Sloppy:** “Not just a tool. A partner in your journey.”  
**Better:** Name the service, responsibility, or support that makes it different.

### 7.7 Audience laundering

“For teams of all sizes,” “for everyone,” and long `whether ... or ...` lists avoid choosing who the product actually serves.

**Better:** Name the audience only when known and useful. Otherwise describe the job clearly enough for readers to self-select.

### 7.8 Unsupported superlatives

“Best,” “leading,” “unmatched,” “world-class,” “fastest,” and “most advanced” require evidence or become noise.

### 7.9 Polished nonsense

A sentence can be fluent but lack a coherent referent, causal link, or real-world meaning. Check every pronoun, comparison, promise, and metaphor. Ask what the sentence asserts and whether the supplied facts support it.

### 7.10 Forced warmth

Contractions, exclamation marks, rhetorical questions, and “we get it” language do not automatically create humanity. Use the brand's actual voice and the emotional weight appropriate to the task.

### 7.11 Needless conclusions

Do not end every section with a slogan that summarizes what the preceding sentence already said.

### 7.12 Word-swapping instead of editing

Replacing `seamless` with `frictionless` does not repair an empty claim. Add the missing fact, mechanism, boundary, or consequence, or delete the sentence.

## 8. Voice and specificity

### 8.1 Derive voice from evidence

Use supplied brand copy, customer language, product terminology, interface labels, and approved claims. Conversion Copyhackers frames conversion copy as research-led writing using voice-of-customer data rather than invention ([Copyhackers definition](https://copyhackers.com/conversion-copywriting-defined/)).

Do not imitate a famous brand from a vague adjective such as “bold” or “playful.” Translate voice into observable choices:

- sentence length and rhythm;
- technical vocabulary allowed or avoided;
- first-, second-, or third-person stance;
- degree of directness;
- humour boundaries;
- preferred concrete nouns and verbs;
- how risk, proof, and limitations are discussed.

### 8.2 Use customer language carefully

Customer interviews, support tickets, search queries, reviews, and sales calls can reveal real vocabulary and objections. Do not copy private, identifying, defamatory, or unrepresentative wording. Customer language informs the draft; it does not replace verification.

### 8.3 Prefer exact nouns and active verbs

**Weak:** “Leverage our solution to optimize your workflow.”  
**Stronger:** “Route refund requests to the right approver.”

Active voice is usually clearer, but passive voice is appropriate when the actor is unknown, irrelevant, or deliberately de-emphasised. Plain language is a clarity tool, not a ban on technical vocabulary that the intended expert audience needs.

## 9. Context-dependent exceptions

These are review triggers, not universal bans:

- **Short, mysterious headlines:** acceptable for recognised brands, entertainment, launches, and art-led work when nearby content or campaign context supplies meaning.
- **Long headlines:** acceptable when the offer is unfamiliar or regulated and shortening would remove a material qualifier.
- **Generic CTA verbs:** `Continue`, `Next`, `Save`, and `Submit` can be correct inside a clear multi-step flow; they are weak when multiple destinations compete on a marketing page.
- **Urgency:** appropriate for real deadlines, live availability, limited inventory, or time-sensitive consequences.
- **Problem agitation:** appropriate when it accurately describes a serious known problem and does not exploit fear or shame.
- **Repeated CTA:** useful on a long page when the action is consistent and the visitor may become ready at different points; avoid changing its label or promise without reason.
- **Social proof near the hero:** useful when recognition or trust is the main early objection and the proof is real; not mandatory decoration.
- **Formula-led drafts:** useful for brainstorming or coverage checks; rewrite until the final page follows the offer's logic rather than the formula's visible rhythm.
- **Technical terminology:** necessary for expert audiences and precise concepts; define only what the intended reader may not know.
- **Playful copy:** appropriate when the brand, task, and consequences allow it; do not let personality obscure labels, prices, errors, or consent.

## 10. Production workflow for an AI agent

1. Extract only supplied facts, approved claims, real names, actual actions, and known constraints.
2. Mark missing content rather than filling gaps with plausible invention.
3. Write the one-sentence offer in plain language before writing a hero.
4. Rank the visitor's likely questions and objections.
5. Build a section outline that answers each question once.
6. Draft headings that remain informative when read alone.
7. Draft body copy to add mechanism, evidence, scope, or qualification.
8. Label CTAs according to the action or destination they actually trigger.
9. Remove empty framing, repetition, decorative labels, unsupported claims, fake urgency, and formula residue.
10. Read the page as a whole for message continuity, voice consistency, and unintended implications.
11. Test all links and controls against their labels.
12. Produce a `Still needed` list for missing integrations, proof, legal review, customer assets, product facts, or production content.

## 11. Review checklist

### Offer and value

- [ ] Can a new visitor identify what the page offers from the first viewport?
- [ ] Does the copy explain a useful outcome or task, not only positive qualities?
- [ ] Is the intended audience named only where it adds useful specificity?
- [ ] Is the differentiator concrete and truthful rather than a superlative?
- [ ] Does each important benefit connect to a real feature, mechanism, or proof point?

### Headlines

- [ ] Does the main headline say what the offer is, what the reader gets, or what they can do?
- [ ] Is every section heading meaningful when read without its paragraph?
- [ ] Does the supporting line add information rather than repeat the headline?
- [ ] Have unnecessary full-sentence headlines and filler words been compressed?
- [ ] Are manual line breaks necessary, responsive, and semantically sensible?
- [ ] Are decorative eyebrows, overlines, section numbers, and pseudo-labels absent?

### Claims and trust

- [ ] Is every number, ranking, comparison, result, award, testimonial, and logo verified?
- [ ] Are timeframe, population, source, and material qualifications visible where needed?
- [ ] Does the overall page avoid creating an implication stronger than the evidence?
- [ ] Are urgency, scarcity, guarantees, and risk claims literally true?
- [ ] Are mock data and placeholders clearly marked and included in the handoff report?

### CTAs and links

- [ ] Does each CTA describe its actual action, destination, or outcome?
- [ ] Does the next screen fulfil the promise made by the label?
- [ ] Are different actions labelled differently and equivalent actions consistently?
- [ ] Can repeated links be distinguished without relying on distant context?
- [ ] Do desktop CTA labels stay on one line without becoming vague?
- [ ] Is nearby reassurance present only where it resolves a real concern?

### Structure and scan

- [ ] Does each section answer a new reader question?
- [ ] Can any section be removed without losing meaning or proof?
- [ ] Are the most useful terms near the beginning of headings and links?
- [ ] Does each paragraph have one main point?
- [ ] Are bullets used only for genuinely parallel, scannable items?
- [ ] Is essential information present without forcing every detail onto one page?
- [ ] Does the page follow the offer's logic rather than an automatic AIDA/PAS template?

### AI-style audit

- [ ] Are abstract promises replaced with concrete meaning?
- [ ] Are grandiose metaphors proportionate to the subject?
- [ ] Has semantic repetition across headline, subhead, bullets, and CTA been removed?
- [ ] Does sentence and section structure vary according to meaning rather than decoration?
- [ ] Have empty `not X, but Y`, `whether X or Y`, and “future of” constructions been removed?
- [ ] Are all pronouns, metaphors, comparisons, and causal statements coherent?
- [ ] Does the voice come from supplied brand or customer evidence rather than generic friendliness?
- [ ] Has the draft been edited structurally rather than merely swapping flagged words?

### Accessibility and completion

- [ ] Do headings and labels describe topic or purpose?
- [ ] Does visible control text match its accessible name?
- [ ] Are errors, instructions, consent, price, and conditions written plainly?
- [ ] Has the copy been reviewed in the rendered desktop and mobile layouts?
- [ ] Has a human reviewed high-risk, legal, medical, financial, security, and regulated claims?
- [ ] Does the final handoff list every missing production input or integration?

## 12. Recommended rules for the future skill

The research can be reduced to these operational defaults:

1. Write from verified facts and real actions; never invent proof, customers, claims, or product behaviour.
2. Make the offer identifiable before trying to make it clever.
3. Every text element must add information, orientation, action, or a deliberate supported voice.
4. Headlines should carry meaning on their own; supporting copy must add rather than paraphrase.
5. Compress wording before using typography or manual line breaks to create impact.
6. Do not generate decorative eyebrows, pseudo-taxonomy, or ornamental metadata.
7. Replace abstract benefit language with a concrete outcome, mechanism, boundary, or proof point.
8. Name CTA actions and destinations accurately; preserve message continuity after the click.
9. Sequence sections by the reader's unanswered questions, not a fixed landing-page formula.
10. Use formulas to diagnose drafts, never as mandatory architecture.
11. Remove semantic repetition, mechanical triads, fake contrast, grandiose framing, and unsupported superlatives.
12. Keep legitimate complexity and qualification; plain language does not mean deleting material facts.
13. Review the page's implied message, not only individual sentences.
14. Mark mock content clearly and produce a `Still needed` report before handoff.
15. Render and read the complete page on desktop and mobile before calling the copy finished.

## Sources

### Usability, accessibility, and content design

- Nielsen Norman Group, [Be Succinct! Writing for the Web](https://www.nngroup.com/articles/be-succinct-writing-for-the-web/)
- GOV.UK, [Understand content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
- GOV.UK, [Write effective links](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/tone-of-voice/add-links/)
- Office for National Statistics, [Plain language](https://service-manual.ons.gov.uk/content/writing-for-users/plain-language)
- W3C WAI, [Understanding WCAG 2.4.4: Link Purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)
- W3C WAI, [Understanding WCAG 2.4.6: Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)
- W3C WAI, [Understanding WCAG 2.5.3: Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- Baymard Institute, [Homepage and Category Navigation UX Research](https://baymard.com/research/homepage-and-category-usability)
- Baymard Institute, [Homepage Benchmark and Research Summary](https://baymard.com/homepage-and-category-usability/benchmark/page-types/homepage)

### Conversion and message research

- CXL, [Website Headlines: Three Formulas That Work for Homepages](https://cxl.com/blog/writing-home-page-headlines-for-the-modern-world-3-formulas-that-work/)
- CXL, [How to Design a Home Page That Converts](https://cxl.com/blog/how-to-design-a-home-page-that-converts/)
- Unbounce, [Landing Page Copywriting Guide](https://unbounce.com/landing-page-copywriting/)
- Unbounce, [A Classic Formula for Gut-Checking Landing Page Headlines](https://unbounce.com/copywriting/gut-check-your-landing-page-headlines/)
- MarketingExperiments, [How Headlines Helped Lead to a Nearly 29% Conversion Boost](https://marketingexperiments.com/value-proposition/value-proposition-headline)
- MarketingExperiments, [How a More Logical Eye Path Led to a 59% Increase in Conversions](https://marketingexperiments.com/conversion-marketing/homepage-optimization-tes)
- Copyhackers, [Conversion Copywriting Defined](https://copyhackers.com/conversion-copywriting-defined/)

### Truthful claims and endorsements

- Federal Trade Commission, [Advertising FAQ: A Guide for Small Business](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business)
- Federal Trade Commission, [Advertising and Marketing](https://www.ftc.gov/business-guidance/advertising-marketing)
- Federal Trade Commission, [Advertisement Endorsements](https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements)
- Federal Trade Commission, [Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers)

### AI-writing research

- Liu and Demberg, [ChatGPT vs Human-authored Text](https://aclanthology.org/2023.acl-srw.1/), ACL 2023
- Geng et al., [Do LLMs Write Like Humans? Variation in Grammatical and Rhetorical Styles](https://pmc.ncbi.nlm.nih.gov/articles/PMC11874169/), PNAS 2025
- Kobak et al., [Delving into LLM-assisted Writing in Biomedical Publications through Excess Vocabulary](https://pmc.ncbi.nlm.nih.gov/articles/PMC12219543/), Science Advances 2025
- Juzek and Ward, [Why Does ChatGPT “Delve” So Much?](https://arxiv.org/abs/2412.11385), 2024 preprint
