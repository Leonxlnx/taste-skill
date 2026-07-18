# AI writing patterns in website copy

## Scope

This report studies recognizable failures in AI-generated English website copy: generic language, repetitive structure, empty claims, excessive framing, false profundity, monotonous rhythm, vague headings, and text that is fluent but does not make semantic sense.

It does not attempt to identify whether a person or a model wrote a text. Authorship detection and copy quality are different problems. The practical objective is to review the text itself: Is it clear, specific, useful, truthful, and appropriate for its page?

The recommendations apply to marketing sites, landing pages, portfolios, product pages, and interface copy. They are defaults, not a universal house style. A deliberate brand voice may break them when the result remains understandable and honest.

## Main findings

1. **AI-like writing is primarily a distribution problem, not a forbidden-word problem.** Large-scale and corpus studies find reduced lexical, syntactic, semantic, or stylistic diversity in model-generated text. The recognizable effect comes from repeated combinations and structures, not one word in isolation.
2. **Fluency can conceal missing meaning.** A sentence may be grammatically polished while failing to identify an actor, action, mechanism, object, limitation, or evidence.
3. **Models tend toward reusable syntactic templates.** This appears as repeated paragraph shapes, mirrored clauses, predictable transitions, and similar sentence rhythms across unrelated topics.
4. **Generic professionalism can erase product and author identity.** AI assistance can improve surface polish while pulling different writers toward more similar styles and ideas.
5. **Website copy has a stricter usefulness test than general prose.** Users scan pages to understand what something is, whether it is relevant, and what to do next. Decorative framing and delayed answers create real usability costs.
6. **Confident specificity is not evidence.** Language models can invent facts, quotations, customers, metrics, awards, citations, and causal explanations. Every factual or comparative claim requires a source or an explicit placeholder.
7. **Review should optimize communication, not disguise model use.** Removing em dashes or replacing a few fashionable words does not repair vague thinking, false claims, templated structure, or semantic incoherence.

## What the evidence supports

### Reduced diversity and convergence

An EMNLP study found that model-generated text uses syntactic templates more often than human reference text. It reported that 76% of templates in generated text appeared in pretraining data, compared with 35% for human-authored text. This supports reviewing repeated sentence shapes, not merely repeated words. [Shaib et al., 2024](https://aclanthology.org/2024.emnlp-main.368/)

A cross-domain analysis of eleven language models found that human text tended to have simpler syntax and more varied semantic content, while human writing also showed greater variation across linguistic features. [Zanotto and Aroyehun, 2025](https://aclanthology.org/2025.emnlp-main.1163/)

A comparison using formal grammar and lexical diversity measures found that newer instruction-tuned models produced less syntactic and especially less lexical diversity than earlier non-instruction-tuned models in the studied news-writing setup. This is evidence for convergence under those conditions, not a claim that every newer model output is less diverse. [Gude et al., 2026](https://aclanthology.org/2026.acl-long.1803/)

A preregistered experiment on short fiction found that access to generative-AI ideas improved average story evaluations, particularly for less creative writers, but made stories more similar to one another. AI assistance can therefore raise a baseline while narrowing the collective range of outputs. The experiment was limited to short stories and a specific interaction design. [Doshi and Hauser, 2024](https://doi.org/10.1126/sciadv.adn5290)

A large-scale study of more than fifteen million biomedical abstracts found abrupt post-ChatGPT increases in several style words and estimated substantial LLM-assisted editing in 2024. This supports the existence of excess vocabulary in a particular corpus. It does not justify treating words such as `delve` or `underscore` as proof of AI authorship. [Kobak et al., 2024](https://arxiv.org/abs/2406.07016)

### Voice flattening

A study of people post-editing model drafts found that editing moved drafts closer to participants' own style, but the edited text remained closer to model-generated writing and less stylistically diverse than unassisted human writing. This suggests that light editing may leave the model's underlying structure intact. [Baumler et al., 2026](https://aclanthology.org/2026.acl-long.2030/)

Research on LLM rewriting across models and contexts found that polishing can retain core content while reducing linguistic diversity and suppressing individual stylistic signals. Because this work is a recent preprint, treat the finding as strong emerging evidence rather than settled universal law. [Sourati et al., 2025](https://arxiv.org/abs/2502.11266)

### Fluent falsehoods and contradictions

NIST defines generative-AI confabulation as confidently presented false content, divergence from input, or contradiction within the same context. It notes that open-ended, long-form, and domain-specific tasks are especially relevant risk areas. [NIST AI 600-1, 2024](https://doi.org/10.6028/NIST.AI.600-1)

An investigation of instruction-tuned language models found self-contradictions in generated open-domain text and demonstrated that fluency alone does not establish internal consistency. Exact rates depend on models, prompts, and the study setup; the practical lesson is to check claims against each other. [Mündler et al., 2023](https://arxiv.org/abs/2305.15852)

### Web-writing usability

The Office for National Statistics advises frontloading important information, removing content that does not meet a user need, using concise descriptive headings, and making each paragraph understandable on its own. These are useful review principles even when a brand uses a more expressive voice. [ONS content guidance](https://service-manual.ons.gov.uk/content/writing-for-users/structuring-content)

W3C recommends short headings that convey meaning and structure, meaningful link text, clear instructions, and clear, concise language. Its link-purpose guidance says links with the same destination should be described consistently, while different purposes should have different text. [W3C writing guidance](https://www.w3.org/WAI/tips/writing/) and [WCAG link-purpose guidance](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)

Microsoft's style guidance recommends simple words with precise meanings, removing words that add no substance, preferring direct verbs, and using one term consistently for one concept. [Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/word-choice/use-simple-words-concise-sentences)

Google's documentation style guide prefers active voice when passive construction hides who performs an action. This is a clarity rule, not a universal ban on passive voice. [Google developer style guide](https://developers.google.com/style/voice)

## Pattern catalog

Each pattern below describes a quality failure. A single occurrence can be valid. Review the pattern in context and judge whether it helps the reader.

### 1. Abstract benefit without a mechanism

**Failure:** The copy promises transformation without saying what the product does.

> Unlock the power of seamless collaboration and elevate the way your team works.

The nouns and verbs can fit almost any software product. The statement gives no usable mental model.

**Better:** Name the action, object, and result.

> Review drafts, assign owners, and approve changes in one shared workspace.

**Review check:** Could the sentence be pasted onto a different product unchanged? If yes, replace at least one abstraction with a concrete capability, constraint, audience, or outcome.

### 2. Unsupported transformation claim

**Failure:** Words such as `revolutionary`, `game-changing`, `best`, `leading`, `unmatched`, or `effortless` assert importance instead of demonstrating it.

**Better:** Supply the mechanism and evidence, qualify the claim, or remove it.

> Exports a 50-page report in under 30 seconds in our published benchmark.

If no verified benchmark exists:

> Exports long reports in the background, so you can keep working.

**Review check:** Underline every comparative, superlative, number, speed claim, and guarantee. Attach a source, define the comparison, mark it as sample content, or delete it.

### 3. Fake specificity

**Failure:** Precise-looking numbers, named customers, quotations, dates, locations, or technical details create authority without a source.

**Better:** Use verified facts. If the task is a visual prototype, use an unmistakable placeholder such as `[customer quote]` or `Sample data`, then list the missing production content in the handoff.

**Review check:** Ask where every proper noun, quotation, statistic, award, testimonial, and benchmark came from. Plausibility is not provenance.

### 4. Semantic fog

**Failure:** The words are grammatical but the relationship between them is unclear.

> A thoughtful ecosystem built around the momentum of modern teams.

This does not establish what the ecosystem contains, who built it, or what momentum means.

**Better:** Rewrite the sentence as actor + action + object before styling it.

> Product teams use the workspace to plan releases and track unresolved decisions.

**Review check:** Ask a reviewer to paraphrase the sentence without reusing its key nouns. If two readers produce different meanings, the copy is not done.

### 5. Referent drift

**Failure:** Pronouns and abstractions point to no stable antecedent: `this`, `it`, `that`, `the experience`, `the journey`, `the future`, `what matters`.

**Better:** Repeat the specific noun when ambiguity is possible.

**Review check:** Circle every pronoun and demonstrative. Identify exactly what each one refers to. Rewrite any disputed referent.

### 6. Internal contradiction

**Failure:** Different parts of the page make incompatible claims about price, availability, privacy, workflow, audience, or product capability.

**Better:** Keep a small claim ledger for important facts and reuse the same source of truth.

**Review check:** Compare hero, features, pricing, FAQ, form labels, and footer statements side by side. Check negations and qualifiers, not only numbers.

### 7. Restating instead of adding information

**Failure:** A heading, paragraph, and CTA repeat the same claim in different words.

> Work smarter.
>
> A smarter way to work so your team can work more intelligently.
>
> Start working smarter.

**Better:** Give each layer a different job: proposition, evidence or mechanism, then action.

**Review check:** Apply the deletion test. Remove the sentence. If no information, orientation, trust, or action disappears, leave it removed.

### 8. Excess prestige vocabulary

**Failure:** Clusters of elevated but low-information words create synthetic authority: `pivotal`, `intricate`, `multifaceted`, `transformative`, `realm`, `landscape`, `tapestry`, `testament`, `underscore`, `delve`.

Some of these words have measured excess frequency in particular AI-influenced corpora. None is inherently wrong.

**Better:** Use the ordinary precise word, or keep the uncommon word only when it is the best fit.

**Review check:** Flag clusters, not isolated words. For each flagged word, ask whether a simpler word changes the meaning. Do not maintain a universal blacklist.

### 9. Modifier inflation

**Failure:** Adjectives and adverbs do the work that evidence should do: `truly`, `deeply`, `incredibly`, `remarkably`, `beautifully`, `powerfully`, `seamlessly`.

**Better:** Replace evaluation with an observable property.

> Seamlessly integrates with your tools.

becomes

> Connects to Slack, GitHub, and Linear without importing your existing projects.

**Review check:** Delete adjectives and adverbs in a copy. Restore only those that change a decision or prevent misunderstanding.

### 10. Nominalized corporate language

**Failure:** Nouns hide simple actions: `enablement`, `optimization`, `facilitation`, `implementation`, `utilization`, `transformation`.

**Better:** Restore the actor and verb.

> Enables the optimization of onboarding workflows.

becomes

> Operations teams edit onboarding steps without engineering help.

**Review check:** Search for abstract nouns ending in `-tion`, `-ment`, `-ance`, or `-ity`. This is a review prompt, not an automatic deletion rule.

### 11. Cliché used in place of thought

**Failure:** `in today's fast-paced world`, `now more than ever`, `the future is here`, `at the heart of`, `next level`, `built for what's next`.

**Better:** Start with the page-specific fact or user problem.

**Review check:** Remove the opening phrase. If the claim survives unchanged, the opening was throat-clearing.

### 12. Decorative metaphor

**Failure:** A metaphor supplies mood but obscures the product: journeys, orchestras, tapestries, bridges, ecosystems, catalysts, compasses, and new horizons.

**Better:** Keep a metaphor only when it creates a clearer mental model and remains consistent. Otherwise state the relationship directly.

**Review check:** Translate the metaphor literally. If the literal version reveals no claim, delete it. Also check whether the metaphor introduces cultural or translation ambiguity; the Home Office notes that idioms can fail users with limited English. [Home Office guidance](https://design.homeoffice.gov.uk/design-and-content/content/designing-for-limited-english)

### 13. Fake profundity

**Failure:** A dramatic contrast or aphorism sounds significant but collapses under inspection.

> This isn't just software. It's a new way of seeing work.

**Better:** State the real difference.

> Unlike a document editor, the workspace keeps each decision linked to its owner and deadline.

**Review check:** After `not just`, `more than`, or `isn't about`, test whether both sides are factual, distinct, and relevant. If not, remove the construction.

### 14. Generic brand personality

**Failure:** Every company becomes `bold yet human`, `simple but powerful`, `crafted with care`, `built for modern teams`, or `where innovation meets...`.

**Better:** Derive voice from actual product behavior, audience vocabulary, constraints, and source material. A brand voice should alter word choice and emphasis, not merely add adjectives.

**Review check:** Blind the company name. Can a reviewer identify the sector or product from the copy alone?

### 15. Tone mixing without purpose

**Failure:** The page jumps between technical documentation, poetic editorial prose, startup hype, internet slang, and formal legal language.

**Better:** Define the voice by situation. Marketing, errors, legal notices, and technical details can differ, but transitions should be intentional.

**Review check:** Label each paragraph's tone. Investigate isolated tone changes and borrowed expressions the product would not naturally use.

### 16. Templated sentence openings

**Failure:** Consecutive sentences begin with the same scaffolding: `Whether...`, `From... to...`, `By...`, `With...`, `Designed to...`, `Built for...`.

**Better:** Lead with the relevant subject and vary structure only where it improves reading.

**Review check:** Read the first four words of every sentence in sequence. Repeated grammatical frames are more informative than repeated punctuation.

### 17. Mechanical parallelism

**Failure:** Every section uses three equal items, every paragraph contains a tricolon, or every heading follows the same two-part formula.

**Better:** Let information determine group size and emphasis. Parallel structure is useful for true peers, not for forcing unrelated ideas into a pattern.

**Review check:** Identify all threes, mirrored clauses, and repeated `X. Y. Z.` rhythms. Keep those that improve comparison; break those that exist only for cadence.

### 18. False contrast

**Failure:** `Not X, but Y`, `less X, more Y`, or `not only X - also Y` creates a distinction that the product does not support.

**Better:** Use contrast only when users genuinely choose between two models, behaviors, or outcomes.

**Review check:** Ask whether a reasonable competitor or user would choose the rejected side. If nobody advocates X, the contrast is theatrical.

### 19. Transition overuse

**Failure:** Every paragraph announces its relationship with `Moreover`, `Furthermore`, `Additionally`, `However`, `Ultimately`, or `In conclusion`.

**Better:** Use order and content to make the relationship clear. Keep a transition when it resolves a real ambiguity.

**Review check:** Remove transitions in a duplicate. Restore only those whose removal changes the logic.

### 20. Monotonous sentence rhythm

**Failure:** Sentences repeatedly have similar length, clause count, punctuation, and stress. An opposite failure is a forced sequence of tiny dramatic fragments.

> Clear goals. Faster work. Better teams. Real impact.

**Better:** Let sentence length follow function. Use short sentences for decisions and emphasis; longer sentences for necessary relationships.

**Review check:** Read the copy aloud. Mark repeated beats and accidental sing-song cadence. Do not optimize for a numeric "burstiness" score.

### 21. Exhaustive-answer reflex

**Failure:** The copy explains every caveat, use case, and adjacent benefit before the reader understands the main proposition.

**Better:** Put the minimum decision-making information first, then reveal detail where it is needed.

**Review check:** For every sentence, ask whether the user needs it at this point on this page. Move supporting detail rather than compressing it into the hero.

### 22. Unnecessary framing and summary

**Failure:** The copy tells readers what it will say, says it, then tells them what it said.

**Better:** Begin with the answer. End when the user has the information or action they need.

**Review check:** Search for `in this section`, `we'll explore`, `let's dive in`, `it is important to note`, `as mentioned`, `in summary`, and `ultimately`. Judge the function, not the phrase alone.

### 23. Generic headings

**Failure:** `Introduction`, `Our solution`, `Why it matters`, `Features`, `Learn more`, `The future of work`.

**Better:** Make the heading identify the section's actual content.

> Approve changes without another status meeting

**Review check:** Read only the headings in order. They should provide a useful outline of the page without relying on decorative text. W3C requires headings and labels to describe topic or purpose; a heading should not exist merely to create visual hierarchy.

### 24. Sentence-length marketing headlines

**Failure:** The headline tries to contain proposition, audience, mechanism, benefit, qualifier, and personality at once, producing three to five avoidable lines.

**Better:** Compress to the shortest precise claim, then use supporting text for the necessary explanation.

**Review check:** Remove subordinate clauses and repeated benefits. Test wrapping at real desktop and mobile widths. Do not enforce one universal line limit.

### 25. Decorative preheading

**Failure:** A label above the heading repeats the section category or adds fictional atmosphere: `OUR APPROACH`, `THE STUDIO`, `CHAPTER 03`, `EST. 2026`.

**Better:** Remove it. If real orientation is necessary, put that information in navigation, breadcrumbs, a filter, a status, or the heading itself.

**Review check:** Hide the preheading. If orientation and meaning remain intact, it has not earned its space.

### 26. Vague CTA text

**Failure:** `Learn more`, `Get started`, `Explore`, `Discover`, or `Continue` when the result is not obvious from context.

**Better:** Name the action or destination.

> View pricing
>
> Create a free workspace
>
> Read the migration guide

**Review check:** Read every link and button out of context. A user should predict what happens next. Same destination and action should use consistent wording; different actions should not share a generic label.

### 27. Duplicate CTA intent

**Failure:** Several labels appear to offer choices but trigger the same action: `Start now`, `Get started`, `Try it`, `Join today`.

**Better:** Use one consistent label for one action. Present a second CTA only when it represents a genuinely different user path.

**Review check:** Map CTA label -> destination -> outcome. Merge duplicates and resolve mismatches.

### 28. Self-congratulatory meta-language

**Failure:** The company describes its own copy, design, or values instead of demonstrating them: `thoughtfully designed`, `meticulously crafted`, `obsessed with quality`, `we believe in simplicity`.

**Better:** Show the decision or evidence.

> Every invoice includes a plain-language breakdown of fees.

**Review check:** Search for claims about care, craft, passion, values, and innovation. Ask what observable behavior proves each one.

### 29. Reader praise and synthetic agreement

**Failure:** `Great question`, `You're absolutely right`, `As a forward-thinking leader`, or flattering assumptions about the reader.

**Better:** Address the task or concern directly. Use recognition only when it reflects known context.

**Review check:** Remove praise. If the message becomes clearer and no relationship is harmed, keep it removed.

### 30. Excessive hedging

**Failure:** `may potentially help`, `could possibly enable`, `in many cases`, `generally speaking`, and stacked disclaimers make the claim impossible to evaluate.

**Better:** State what is known, name the condition, and isolate genuine uncertainty.

> Results may vary depending on team size and imported history.

**Review check:** Highlight modal verbs and qualifiers. For each, identify the exact uncertainty it represents. Delete duplicate caution, never necessary legal or safety qualification.

### 31. False certainty

**Failure:** The opposite of hedging: `guaranteed`, `always`, `never`, `zero effort`, `works for every team`, or confident predictions unsupported by product behavior.

**Better:** Narrow the claim to what has been tested and can be delivered.

**Review check:** Treat absolute language as a factual claim. Verify it under failure, edge, pricing, and availability conditions.

### 32. Polished nonsense after compression

**Failure:** Editing removes obvious filler but preserves a sentence whose proposition is still empty.

> Clarity, reimagined.

**Better:** Do a meaning pass before a style pass. Determine the factual proposition first, then compress it.

**Review check:** Expand the short line into a literal sentence. If no concrete statement can be recovered, the short version is decoration.

## Better alternatives: a minimal writing workflow

### 1. Build a source sheet

Before drafting, collect only available facts:

- product actions and limitations
- intended audience
- verified differentiators
- pricing and availability
- approved customer evidence
- required legal or operational language
- missing inputs that need placeholders

Do not ask prose to compensate for missing product knowledge.

### 2. Write the literal version

For each section, write one plain sentence answering:

- What is this?
- Who is it for?
- What can they do?
- What changes as a result?
- What proves the claim?

Not every section needs all five answers. The page as a whole should supply the answers necessary for its decision.

### 3. Give each text element one job

- Heading: identify the proposition or topic.
- Supporting copy: explain mechanism, evidence, condition, or consequence.
- CTA: name the next action or destination.
- Label: identify a real field, status, category, control, or location.

Delete text that merely repeats another element's job.

### 4. Add voice without removing meaning

Change rhythm, vocabulary, and emphasis only after the literal proposition works. Preserve product nouns, factual qualifiers, and action clarity. Voice is not a layer of adjectives.

### 5. Compress

Remove:

- openings that delay the point
- duplicated benefits
- modifiers without evidence
- transitions implied by order
- summaries that add no decision value
- decorative labels and atmosphere text

Compression is successful when meaning survives, not when the word count is merely lower.

### 6. Verify

Check every factual, comparative, quantitative, customer, performance, and availability claim against an approved source. If the source is unavailable, omit the claim or use a visible placeholder and report the missing input.

### 7. Review in the interface

Copy quality changes with layout. Check real wrapping, scanning order, repeated CTA labels, mobile truncation, error states, and the headings-only outline. Do not approve copy only in a document.

## Detection and review checks

These checks assess quality. They are not proof of AI authorship.

### Page-level checks

- **Five-second test:** After a brief scan, can a reviewer say what the page offers, for whom, and what the primary action is?
- **Headings-only test:** Read headings in order. Do they form a specific, useful outline?
- **CTA map:** List every CTA with destination and result. Merge duplicate intents and rename ambiguous actions.
- **Claim ledger:** List every factual and implied claim with its source or placeholder status.
- **Section-purpose test:** Give each section one necessary job. Remove sections whose only purpose is rhythm, atmosphere, or page length.
- **Voice consistency test:** Compare vocabulary and stance across hero, features, pricing, forms, errors, and footer.

### Paragraph-level checks

- **Frontload test:** Does the paragraph begin with its useful point or with setup?
- **One-subject test:** Does it introduce a second topic that deserves another paragraph or deletion?
- **Deletion test:** Does removing a sentence lose information, orientation, trust, or action?
- **Paraphrase test:** Can another person restate the point plainly and consistently?
- **Evidence test:** Does the paragraph convert an assertion into a mechanism, example, limitation, or proof?

### Sentence-level checks

- **Actor-action-object test:** Who does what to what? Passive voice can remain when the actor is genuinely irrelevant.
- **Referent test:** What do `it`, `this`, `that`, and abstract nouns refer to?
- **Specificity swap:** Could a competitor use the sentence unchanged?
- **Modifier strip:** Does the proposition survive without adjectives and adverbs?
- **Literal translation:** What does the metaphor or slogan claim in ordinary language?
- **Contradiction check:** Does the sentence conflict with another section, UI state, price, or policy?
- **Read-aloud check:** Does rhythm reveal accidental repetition, theatrical fragments, or overlong clauses?

### Lightweight automated flags

Automation may flag candidates for human review:

- repeated four- to six-word sequences
- repeated sentence openings
- high concentrations of abstract nouns, modifiers, and discourse transitions
- duplicate or near-duplicate headings
- identical destinations with inconsistent CTA labels
- different destinations with identical vague CTA labels
- unsupported numerals, percentages, currencies, dates, and superlatives
- unresolved placeholders or invented citations
- headings that exceed the available layout or wrap unexpectedly

Do not convert these flags into automatic bans. Syntax, genre, language, and brand voice change what is appropriate.

## Rejected overbroad claims

### "Certain words prove AI wrote it"

Rejected. Corpus research can show excess frequency, but a human can use `delve`, `pivotal`, `nuanced`, or `underscore` naturally. Judge clusters, fit, and meaning. Never accuse an author based on vocabulary.

### "Em dashes are an AI tell"

Rejected. Punctuation is a stylistic choice used by human writers long before language models. Review whether punctuation improves the sentence; do not treat it as provenance.

### "Three-item lists are AI slop"

Rejected. Three items may be the real set. The failure is forcing content into repeated trios or using cadence instead of substance.

### "Questions, fragments, or one-word headings are always bad"

Rejected. They can be clear in context. The relevant test is whether the heading describes the content, whether the fragment is intentional, and whether the interface remains accessible.

### "Passive voice is always bad"

Rejected. Active voice usually clarifies responsibility, but passive voice is appropriate when the actor is unknown, irrelevant, or intentionally secondary.

### "Every sentence must stay under a fixed word count"

Rejected as a universal law. Short sentences improve scanning, but relationships sometimes require length. Use hard limits as a house-style warning, not a substitute for editing.

### "High vocabulary diversity means good copy"

Rejected. Consistent terminology is important in interfaces and technical material. Diversity should prevent monotonous templates, not produce synonym churn.

### "Make it sound human by adding typos, slang, or randomness"

Rejected. Artificial mistakes reduce trust and accessibility. A specific point of view, accurate detail, and deliberate rhythm create voice without degrading correctness.

### "A detector can confirm that text is AI-written"

Rejected for editorial review. Detectors are unreliable across models, prompts, domains, and writers, and published research found bias against non-native English writers. Use human review for meaning and evidence, not detector scores for authorship claims. [Liang et al., 2023](https://arxiv.org/abs/2304.02819)

### "Plain language must sound bland"

Rejected. Plain language controls comprehension; it does not require a neutral personality. Specific imagery, humor, technical vocabulary, and unusual rhythm can remain when the intended audience understands them.

### "All metaphors, idioms, and elevated words should be banned"

Rejected. They may be appropriate for an audience and brand. Remove them when they obscure the proposition, become culturally inaccessible, or replace evidence.

## Recommended rules for a website-generation skill

1. Write from supplied facts. Never invent customers, quotations, results, awards, metrics, integrations, prices, or capabilities unless the user explicitly requests fictional sample content.
2. If production content is missing, omit it or use a visibly labeled placeholder. End with a `Still needed` list.
3. Make the proposition literal before making it stylish.
4. Every visible text element must add information, orientation, trust, or action.
5. Remove decorative preheadings and atmosphere text that do not provide real context.
6. Prefer concrete actors, actions, objects, mechanisms, and constraints over abstract transformation language.
7. Keep headings concise, descriptive, and specific to the section. Do not use a full marketing paragraph as a heading.
8. Do not force early line breaks. Edit the wording first, then test natural wrapping in the actual layout.
9. Give heading, supporting copy, and CTA different jobs; do not restate one claim three times.
10. Use specific CTA labels that predict the destination or action. Use consistent labels for the same action and different labels for different outcomes.
11. Do not force sections, features, benefits, or sentences into repeated groups of three.
12. Vary syntax and rhythm according to meaning, not to simulate human randomness.
13. Remove generic openings, summaries, transitions, and meta-language when the page works without them.
14. Use metaphors, contrasts, fragments, humor, and unusual words only when they make this specific message clearer or more memorable.
15. Verify claims and compare them across the entire page for contradiction.
16. Preserve the user's terminology and real voice. Do not homogenize supplied copy into generic startup language.
17. Review rendered desktop and mobile copy, including headings, buttons, forms, errors, and empty states.
18. Do not use AI-detector scores or stylistic folklore as a quality gate.

## Source notes

The empirical literature is prompt-, model-, language-, genre-, and date-sensitive. Much of it studies academic, news, or creative writing rather than website copy. This report therefore uses empirical findings to identify risks such as convergence, templating, and confabulation, then combines them with established web-content and accessibility guidance for practical review rules.

Strong evidence supports reviewing repetition, homogenization, factual reliability, clear headings, meaningful links, plain language, and source-backed claims. Exact lists of fashionable words, punctuation tells, fixed sentence lengths, and universal rhythm formulas are weaker heuristics and should remain review prompts rather than bans.
