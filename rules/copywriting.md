# Copywriting Rules

*Runtime-ready rules derived from the six reports in `../research/copywriting/`. These rules cover website copy and interface writing. They complement `anti-slop.md`; they do not replace its layout, accessibility, behavior, or engineering rules.*

## 1. Enforcement

- **HARD BAN:** Fabricated, deceptive, inaccessible, materially misleading, or functionally false copy.
- **AVOID BY DEFAULT:** A recurring generic pattern. Use it when the explicit request, real brand voice, content, audience, or page purpose gives it a clear job.
- **CONTEXT CHECK:** A legitimate technique whose quality depends on execution, density, voice, and situation.

Apply the rules in this order:

1. Follow the explicit user request, supplied facts, existing project, approved terminology, and real product behavior.
2. Preserve strong existing copy unless a rewrite was requested.
3. Keep unknown facts unknown. Ask only when the missing answer materially changes the result or would otherwise require fabrication.
4. Apply default-avoidance rules only where the project leaves the choice open.
5. Review copy in the rendered interface, not only as a text document.

## 2. Truth and source integrity

### COPY-001 - Start from known facts
- **Level:** HARD BAN on invented facts
- **Rule:** Ground copy in user-provided content, the existing project, or verifiable sources. Do not invent a missing fact to complete a section.

### COPY-002 - Never fabricate proof
- **Level:** HARD BAN
- **Rule:** Never present invented customers, people, logos, quotes, testimonials, reviews, ratings, awards, credentials, partnerships, press, studies, metrics, dates, prices, product counts, or case studies as real.

### COPY-003 - Substantiate objective claims
- **Level:** HARD BAN for production-bound claims
- **Rule:** A claim about performance, effectiveness, safety, compatibility, security, price, durability, environmental impact, market position, or expected results requires evidence that supports its exact express and implied meaning.

### COPY-004 - Keep qualifications with their claims
- **Level:** HARD BAN when the combined impression is deceptive
- **Rule:** Put material conditions, limits, exclusions, comparison bases, and disclosures close to the claim and keep them readable at every viewport. Distant fine print cannot reverse the main message.

### COPY-005 - Never manufacture urgency
- **Level:** HARD BAN
- **Rule:** Do not invent deadlines, scarcity, inventory, viewer counts, activity, waitlists, demand, expiring bonuses, or countdowns. Real urgency must use the real condition and stop when it expires.

### COPY-006 - State offers literally
- **Level:** HARD BAN when false; otherwise CONTEXT CHECK
- **Rule:** `Free`, `risk-free`, `cancel anytime`, `no credit card`, `guaranteed`, `live`, `real-time`, `verified`, and similar terms must match actual operations and material conditions.

### COPY-007 - Make comparisons checkable
- **Level:** HARD BAN on invented or rigged comparisons
- **Rule:** State the compared products or tiers, criteria, region, conditions, date, method, and source. Separate measured facts from editorial judgment.

### COPY-008 - Mark samples clearly
- **Level:** HARD BAN on undisclosed samples
- **Rule:** Mock and sample content is allowed when the user requests design work, but label the relevant artifact or component `Prototype`, `Demo`, or `Sample data`. Never let it imply a real customer result or connected state.

### COPY-009 - Prefer omission to plausible fiction
- **Level:** HARD BAN on deceptive substitutes
- **Rule:** When verified content is missing, omit the block, use an explicit placeholder, or use clearly synthetic sample content when interaction design requires it. Do not create a believable fake person, company, quote, rating, metric, or award.

### COPY-010 - Track unresolved claims
- **Level:** HARD BAN for a production-complete claim
- **Rule:** End work containing unresolved content with `Still needed`, listing missing facts, proof, approvals, links, legal review, integrations, assets, and sample replacements. A misleading unresolved item blocks launch.

## 3. Website and landing-page copy

### COPY-011 - State what the page is about
- **Level:** AVOID BY DEFAULT
- **Rule:** Make the product, service, organization, work, or subject identifiable without requiring the reader to decode a slogan.

### COPY-012 - Give every line a job
- **Level:** AVOID BY DEFAULT
- **Rule:** A line must provide information, evidence, orientation, instruction, state, or action. Do not fill a component's optional text slot merely because it exists.

### COPY-013 - Give every section new value
- **Level:** AVOID BY DEFAULT
- **Rule:** Each section should answer a new reader question, add proof, explain a mechanism, show an example, reduce uncertainty, or enable a decision. Remove sections that only repeat the proposition.

### COPY-014 - Make headings useful
- **Level:** AVOID BY DEFAULT
- **Rule:** A heading should orient the reader or carry the section's useful claim. Avoid generic topic labels, decorative phrases, and sentence-length slogans that say less than a shorter heading could.

### COPY-015 - Do not generate decorative preheadings
- **Level:** HARD BAN under Taste Skill authoring policy
- **Rule:** Do not add eyebrows, kickers, overlines, pretitles, or studio-style filler above headings. Functional metadata and real interface labels remain valid.

### COPY-016 - Make supporting copy additive
- **Level:** AVOID BY DEFAULT
- **Rule:** A subheading or supporting line must add audience, mechanism, scope, qualification, or consequence. Delete it if it paraphrases the heading.

### COPY-017 - Keep the hero focused
- **Level:** AVOID BY DEFAULT
- **Rule:** Let the hero establish subject, relevant value, and next action. Do not also force feature lists, pricing teasers, trust microcopy, logo walls, secondary metadata, and several competing CTAs into the first viewport unless the requested page genuinely needs them there.

### COPY-018 - Write CTAs for the next result
- **Level:** AVOID BY DEFAULT; HARD BAN when misleading
- **Rule:** Label the immediate action or result, such as `View pricing`, `Download the guide`, or `Book a demo`. Use vague labels such as `Learn more`, `Get started`, or `Explore` only when the destination makes their meaning unambiguous.

### COPY-019 - Keep one label per action intent
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not rotate among several CTA labels for the same destination or intent. Repetition is allowed when page length or decision flow requires it, but the label, consequence, and hierarchy must remain coherent.

### COPY-020 - Match CTA commitment to readiness
- **Level:** CONTEXT CHECK
- **Rule:** Reading documentation, viewing work, trying a product, creating an account, booking a call, and purchasing are different commitments. Ask for the action the current evidence and reader state can support.

### COPY-021 - Do not force a persuasion formula
- **Level:** AVOID BY DEFAULT
- **Rule:** AIDA, PAS, StoryBrand, objection handling, FAQ counts, benefit counts, and fixed section sequences are optional thinking tools, never mandatory page structures.

### COPY-022 - Make proof answer the claim
- **Level:** HARD BAN when proof is false; otherwise AVOID BY DEFAULT
- **Rule:** Put the strongest relevant evidence near the claim it supports. Do not use logos, badges, quotes, ratings, numbers, or generic trust language as decoration.

### COPY-023 - Connect features and benefits honestly
- **Level:** AVOID BY DEFAULT
- **Rule:** Explain a benefit only when the feature, mechanism, or constraint actually creates it. Do not mechanically append `so you can` to every feature.

### COPY-024 - Stop at the present decision
- **Level:** AVOID BY DEFAULT
- **Rule:** Keep the primary page focused. Move edge cases and exhaustive explanation to appropriate help, documentation, legal, or comparison content.

### COPY-025 - Do not manufacture objections
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not add anxiety, pain agitation, guarantees, scarcity, FAQs, or rebuttals simply because a marketing framework expects them. Address questions supported by the audience, product, or task.

## 4. Specificity and AI-pattern review

### COPY-026 - Prefer concrete nouns and direct verbs
- **Level:** AVOID BY DEFAULT
- **Rule:** Name the actor, action, object, state, mechanism, or result when known. Replace nominalizations and padded phrases with the actual action.

### COPY-027 - Do not stack abstract benefits
- **Level:** AVOID BY DEFAULT
- **Rule:** Rewrite claims such as `smarter, faster, seamless growth` around observable product behavior, a real example, a constraint, or a verified outcome.

### COPY-028 - Do not let prestige vocabulary carry meaning
- **Level:** AVOID BY DEFAULT
- **Rule:** Words such as `seamless`, `elevated`, `transformative`, `curated`, `timeless`, `future-ready`, and `best-in-class` are not banned, but they cannot substitute for product truth.

### COPY-029 - Avoid significance inflation
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not turn an ordinary feature or company fact into a movement, journey, testament, new era, pivotal moment, or profound statement without a real reason.

### COPY-030 - Avoid vague authority
- **Level:** HARD BAN when presented as evidence
- **Rule:** Do not write `experts say`, `research shows`, `customers agree`, `trusted by teams`, or similar authority cues without a named and reviewable basis.

### COPY-031 - Break repeated sentence templates
- **Level:** AVOID BY DEFAULT
- **Rule:** Flag clusters of `Whether X or Y`, `From X to Y`, `not X but Y`, `more than X`, `designed to X, built to Y`, repeated questions, or repeated imperative triplets. Keep an instance when it genuinely fits; rewrite the pattern when it becomes the page's cadence.

### COPY-032 - Use parallelism deliberately
- **Level:** CONTEXT CHECK
- **Rule:** Groups of three, fragments, contrasts, ranges, repeated openings, and parallel lines are valid rhetorical tools. Do not generate them automatically or use them to simulate polish.

### COPY-033 - Vary rhythm according to meaning
- **Level:** AVOID BY DEFAULT
- **Rule:** Avoid uniform sentence length, paragraph shape, emphasis, and section endings. Do not add random fragments or punctuation to imitate human variation; let the thought determine the pace.

### COPY-034 - Remove empty transitions and summaries
- **Level:** AVOID BY DEFAULT
- **Rule:** Keep a transition only when it expresses a real relationship. Remove throat-clearing, writing announcements, miniature conclusions, and summaries that add no decision or consequence.

### COPY-035 - Remove rephrased repetition
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not restate one promise across the headline, supporting copy, body, bullets, and CTA with different adjectives. Keep the strongest statement and use the remaining space for evidence or the next idea.

### COPY-036 - Do not simulate empathy
- **Level:** AVOID BY DEFAULT
- **Rule:** Replace `We get it`, `we've all been there`, `your journey matters`, and similar artificial intimacy with the actual friction and useful help.

### COPY-037 - Do not force personality
- **Level:** AVOID BY DEFAULT
- **Rule:** Do not invent slang, jokes, rebellion, anecdotes, cute feature names, dramatic fragments, or constant exclamation merely to make neutral source material feel branded.

### COPY-038 - Remove chat artifacts
- **Level:** HARD BAN in published page copy
- **Rule:** Remove assistant praise, apologies, offers to continue, knowledge disclaimers, `I hope this helps`, and other conversation residue unless the interface is intentionally presenting a conversation.

### COPY-039 - Match confidence to evidence
- **Level:** HARD BAN when materially misleading
- **Rule:** Avoid both unsupported certainty and hedging that removes the useful claim. Narrow the statement to what is known, qualify it accurately, or mark the missing evidence.

### COPY-040 - Do not use authorship folklore
- **Level:** HARD BAN as an automatic acceptance or rejection method
- **Rule:** Do not infer AI authorship or reject copy solely because it contains an em dash, passive voice, long sentence, triad, question, uncommon word, title case, or emoji. Review truth, specificity, usefulness, coherence, density, and voice instead.

## 5. Voice, tone, and inclusion

### COPY-041 - Define voice as behavior
- **Level:** AVOID BY DEFAULT
- **Rule:** Replace adjective clouds such as `bold, human, premium, visionary` with observable rules: when to state the point, which terms to use, how claims are proved, how directly the reader is addressed, and where humor stops.

### COPY-042 - Calibrate from real examples
- **Level:** CONTEXT CHECK
- **Rule:** When available, use approved brand samples to learn vocabulary, rhythm, contractions, technical density, punctuation, directness, and humor. Preserve their strengths without reproducing accidental errors.

### COPY-043 - Keep voice stable and tone situational
- **Level:** AVOID BY DEFAULT
- **Rule:** Maintain a recognizable voice while adapting tone to success, uncertainty, waiting, warning, error, privacy, payment, destructive action, and other reader states.

### COPY-044 - Use one term for one concept
- **Level:** AVOID BY DEFAULT; HARD BAN when inconsistency changes meaning
- **Rule:** Keep product nouns, actions, plans, states, and navigation labels stable. Do not cycle among synonyms merely to create variety.

### COPY-045 - Use humor and metaphor conditionally
- **Level:** CONTEXT CHECK
- **Rule:** Keep humor or metaphor only when it improves understanding or belongs to the real brand. Never let it obscure a category, action, error, price, legal condition, privacy issue, or high-stakes consequence.

### COPY-046 - Avoid assumptions and blame
- **Level:** HARD BAN when discriminatory or harmful; otherwise AVOID BY DEFAULT
- **Rule:** Do not stereotype identity, ability, family, culture, income, knowledge, or intent. Prefer neutral recovery language over blaming the reader.

### COPY-047 - Do not dismiss difficulty
- **Level:** AVOID BY DEFAULT
- **Rule:** Remove `easy`, `simple`, `obvious`, and `just` when they minimize real effort or access barriers. Keep them only when the claim is meaningful and defensible.

### COPY-048 - Treat readability scores as signals
- **Level:** CONTEXT CHECK
- **Rule:** Use clear structure and familiar language for the intended audience, but do not force every domain to a universal grade level or remove necessary terminology.

## 6. Interface writing

### COPY-049 - Name buttons and links by function
- **Level:** HARD BAN when ambiguous or misleading
- **Rule:** Buttons should describe actions; links should describe destinations. Destructive controls must name the consequence. Avoid several adjacent controls with indistinguishable labels.

### COPY-050 - Keep form labels persistent
- **Level:** HARD BAN
- **Rule:** Do not use placeholder text as the only label. Add helper text only when it prevents uncertainty, explains a constraint, or provides a necessary example.

### COPY-051 - Make errors recoverable
- **Level:** HARD BAN
- **Rule:** Identify the problem in plain language and state the next valid action. Do not blame the reader, expose raw system errors, or report only `Invalid` or `Something went wrong` when more useful information is available.

### COPY-052 - Represent system state truthfully
- **Level:** HARD BAN
- **Rule:** Loading, progress, pending, offline, queued, saved, sent, synced, and success copy must match actual system state. Do not claim completion before confirmation or show precise progress the system cannot measure.

### COPY-053 - Distinguish empty states
- **Level:** AVOID BY DEFAULT
- **Rule:** Write different responses for first use, no results, filtered results, permission restrictions, errors, deleted content, and genuinely empty data. Provide an appropriate next action when one exists.

### COPY-054 - Confirm according to risk
- **Level:** CONTEXT CHECK
- **Rule:** Use confirmation for consequential or hard-to-reverse actions, not every small interaction. State what will happen, what is affected, and whether recovery is possible.

### COPY-055 - Keep critical text explicit
- **Level:** HARD BAN when accessibility fails
- **Rule:** Headings, links, labels, errors, and instructions must remain meaningful when read out of visual context. Do not rely only on color, icon, shape, or position such as `click the button on the right`.

### COPY-056 - Write localization-ready strings
- **Level:** AVOID BY DEFAULT
- **Rule:** Avoid sentence fragments assembled in code, noun stacks, unexplained idioms, fixed word order, and layouts that assume English string length. Localize complete semantic units.

### COPY-057 - Disclose non-functional prototypes
- **Level:** HARD BAN on concealed behavior
- **Rule:** A design-only form, checkout, search, signup, or control may exist when requested, but the output and handoff must state that it is not connected. Do not show fake success behavior.

## 7. Rendered-copy checks

### COPY-058 - Test real widths
- **Level:** HARD BAN for a production-complete claim
- **Rule:** Review desktop, short-laptop, tablet, mobile, intermediate widths, zoom, and long-string stress. Check overflow, truncation, orphaned words, density, disclosure proximity, and hierarchy.

### COPY-059 - Keep desktop CTAs and primary navigation on one line
- **Level:** AVOID BY DEFAULT; HARD BAN when usability breaks
- **Rule:** Shorten an accurate label or recompose the layout before shrinking text. A deliberate multi-line campaign control is valid only when it remains unmistakably usable.

### COPY-060 - Do not force headline wrapping
- **Level:** HARD BAN under Taste Skill authoring policy when the line is needlessly bloated or manually broken
- **Rule:** Compress the meaning before adding forced line breaks. Let wrapping follow the available measure unless a deliberate editorial composition requires and survives responsive testing.

### COPY-061 - Recompose before shrinking
- **Level:** AVOID BY DEFAULT
- **Rule:** When copy does not fit, first edit repetition, reprioritize information, widen or change the composition, or move secondary material. Do not reduce essential text below readable size merely to preserve a mockup.

### COPY-062 - Verify the final interface
- **Level:** HARD BAN for a completion claim
- **Rule:** Check every CTA destination, form promise, error, loading state, success state, qualification, number, date, price, logo, footnote, and sample marker in the rendered page. Report any check that could not be completed.

## 8. Editing sequence

Use focused passes rather than regenerating the whole page after each issue:

1. **Source:** collect facts, terminology, constraints, evidence, and real voice examples.
2. **Literal meaning:** state what this is, who it helps, what it does, why it is credible, and what happens next.
3. **Truth:** verify or mark every objective and implied claim.
4. **Structure:** remove filler sections, repeated arguments, and elements without distinct jobs.
5. **Voice:** apply the real brand's vocabulary, rhythm, directness, and tone boundaries.
6. **Line:** strengthen nouns and verbs; remove fog, filler, repetition, and recurring templates.
7. **Interface:** inspect wrapping, density, hierarchy, states, accessibility, and localization pressure in the rendered design.
8. **Handoff:** list every unresolved fact, placeholder, approval, asset, destination, and integration under `Still needed`.

## 9. Automatic review boundary

Automation may flag exact duplication, repeated CTA intent, placeholder tokens, empty links, outdated terms, numeric claim candidates, missing labels, recovery-free errors, inaccessible link text, overflow, truncation, and project-specific terminology.

Automation must not act as an AI detector or universally reject passive voice, adverbs, long sentences, punctuation, questions, fragments, repetition, or unusual vocabulary. Those require human review in context.
