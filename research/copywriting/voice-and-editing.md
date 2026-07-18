# Brand Voice and Editorial Web Copy

Research synthesis for writing specific, credible, useful web copy without generic AI polish. This report focuses on brand voice, editorial quality, and the editing practices that preserve a real point of view.

## Executive summary

Good web copy is not copy that sounds expensive. It is copy that says the right thing, in the right voice, with enough evidence for the reader to trust it.

The strongest guidance across established content systems is consistent:

- Keep voice stable, but change tone for the reader's situation.
- Prefer specific nouns and direct verbs over abstract claims and decorative adjectives.
- Give the reader useful information before personality.
- Use one term for one concept, especially in product and technical copy.
- Vary sentence length and structure deliberately, without making the copy erratic.
- Use humor and metaphor only when they improve the moment and survive cultural translation.
- Treat reading-level scores as diagnostics, not universal targets.
- Edit AI-generated drafts for truth, specificity, structure, rhythm, and brand ownership. A synonym pass is not enough.

Research on generated text supports the need for that last point. Large language models use recurring syntactic templates more often than human reference text, and recent cross-domain analysis found simpler syntax and greater semantic variation in human writing. The practical risk is not one forbidden word. It is convergence: many brands begin to make the same claims in the same cadence. See [Shaib et al., EMNLP 2024](https://aclanthology.org/2024.emnlp-main.368/) and [Zanotto and Aroyehun, EMNLP 2025](https://aclanthology.org/2025.emnlp-main.1163/).

## 1. Core principles

### 1.1 Meaning comes before voice

Every line must do at least one job:

- identify what the product, service, or organization is;
- explain what it does;
- show why it matters;
- supply evidence;
- answer a real question;
- remove uncertainty;
- tell the reader what happens next.

If a line only adds atmosphere, remove it. Components do not require copy merely because a design includes a text slot. Shopify's content guidance explicitly says not every designed subcopy field needs to be filled and recommends adding only what clarity requires. See [Shopify Polaris content fundamentals](https://polaris-react.shopify.com/content/fundamentals).

### 1.2 Voice stays recognizable; tone responds to context

Voice is the durable character of the brand. Tone is the situational expression of that character. Mailchimp, Atlassian, and Adobe all make this distinction in their public systems:

- [Mailchimp](https://styleguide.mailchimp.com/voice-and-tone/) keeps a stable voice while adjusting tone to the reader's emotional state.
- [Atlassian](https://atlassian.design/foundations/content/voice-tone/) changes the strength of its personality traits depending on whether the person is successful, uncertain, blocked, or stressed.
- [Adobe Spectrum](https://spectrum.adobe.com/page/voice-and-tone/) frames tone as a spectrum from motivational to supportive, with neutral and direct language used most often.

Define voice as usable writing behavior, not a cloud of adjectives.

Weak definition:

> Bold, human, premium, visionary.

Operational definition:

> State the point early. Use familiar words. Name the responsible actor. Support strong claims with proof. Use dry humor only after the task is clear. Never blame the reader.

Three or four rules with examples are more useful than ten personality adjectives.

### 1.3 Be concrete before being clever

Prefer the action, object, mechanism, or result a reader can picture.

| Generic | Specific |
| --- | --- |
| Unlock seamless collaboration | Review, comment, and approve work in one place |
| Built for modern teams | For product teams shipping weekly releases |
| Transform your workflow | Turn approved briefs into assigned tasks |
| Powerful insights at your fingertips | See which checkout step loses the most customers |
| An elevated digital experience | Book, reschedule, or cancel an appointment online |

Specificity does not mean stuffing every sentence with detail. It means choosing the detail that changes understanding or belief.

### 1.4 Let nouns carry identity and verbs carry motion

Strong copy tends to name real things and show real actions:

- concrete nouns: invoice, prototype, shipment, contract, classroom;
- direct verbs: compare, route, publish, recover, book;
- measurable outcomes: 12 minutes, three approvals, 24-hour response;
- named mechanisms: local encryption, automatic retries, version history.

Replace nominalizations and padded verb phrases:

| Weak | Better |
| --- | --- |
| conduct an analysis of | analyze |
| provide an indication of | show |
| enable the creation of | create |
| facilitate collaboration between | help X and Y work together |
| make an improvement to | improve |

The US federal plain-language guide calls nominalizations "hidden verbs" because they weaken the action and usually add words. See [Digital.gov: Writing for understanding](https://digital.gov/guides/plain-language/writing).

### 1.5 Evidence earns confidence

Do not manufacture authority with confident phrasing. Attach claims to proof.

Use, in descending order of strength:

1. a result with a defined metric, timeframe, and source;
2. an observable product capability;
3. a named method or constraint;
4. a qualified promise;
5. a clearly marked placeholder when evidence is still missing.

Examples:

- Weak: `The fastest way to manage every project.`
- Better with evidence: `Teams in the pilot reduced weekly triage from 90 minutes to 35.`
- Better without evidence: `Triage requests, assign owners, and track the next action.`
- Honest placeholder: `[Add verified customer result and source]`

Words such as *best*, *leading*, *revolutionary*, *effortless*, *unmatched*, and *proven* require evidence. If evidence does not exist, remove the claim instead of making it sound more cautious.

### 1.6 Use a controlled vocabulary

Choose one name for each important concept. Do not rotate between *workspace*, *hub*, *platform*, *portal*, and *command center* to sound varied if they all mean the same thing. Microsoft recommends one term per concept because synonym variation can confuse readers and translation systems. See [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/global-communications/writing-tips).

This does not prohibit expressive vocabulary. It protects product nouns, actions, plans, states, and navigation labels from semantic drift.

### 1.7 Build rhythm with meaning, not tricks

Human variation comes from thought moving at different speeds. Use sentence length and structure to match that movement.

- Short sentences can land a decision or claim.
- Medium sentences can explain it.
- Longer sentences can connect conditions, causes, or contrast when the relationship matters.
- Fragments can work in campaigns or social copy, but repeated fragments become mannered.

Avoid machine-like cadence:

- every paragraph has the same number of sentences;
- every sentence has the same length;
- repeated `verb, verb, and verb` triplets;
- repeated `not X, but Y` constructions;
- every sentence begins with `Whether`, `From`, `By`, `With`, or `You can`;
- a transition word opens every paragraph;
- every section ends with a miniature slogan.

Adobe recommends varying sentence style and structure for readability and relatability. Google specifically warns against starting every sentence with the same phrase. See [Adobe Spectrum voice and tone](https://spectrum.adobe.com/page/voice-and-tone/) and [Google Developer Documentation voice and tone](https://developers.google.com/style/tone).

Variation is not a mandate to use random synonyms or punctuation. Read aloud and revise any passage that sounds metronomic.

### 1.8 Practice restraint

Restraint means selecting the strongest useful detail and stopping.

Remove:

- throat-clearing such as `In today's rapidly evolving landscape`;
- intensifiers such as `truly`, `incredibly`, `deeply`, `highly`, and `very` when the noun or verb should carry the claim;
- doubled claims such as `simple and easy` or `fast and efficient`;
- redundant subcopy that restates the heading;
- conclusions that merely summarize a three-line section;
- adjectives that assert quality without demonstrating it;
- prose written only to fill a visual gap.

Digital.gov recommends challenging every word and removing duplicate modifiers and doublets. See [Short and simple](https://digital.gov/guides/plain-language/principles/short-simple).

### 1.9 Humor is conditional, not a brand tax

Humor can make a brand memorable, but it must never delay an action, minimize harm, or make the reader feel excluded.

Use humor when:

- the core information is already clear;
- the stakes are low;
- the reader is likely to be relaxed or successful;
- the joke fits the established voice;
- it remains understandable across the intended audience.

Do not use humor when:

- data, money, privacy, health, safety, or progress may be lost;
- the reader is blocked, anxious, or correcting an error;
- the humor depends on slang, a meme, or a culture-specific reference;
- the copy laughs at the reader;
- the joke appears repeatedly in a high-frequency interface.

Mailchimp prefers subtle humor but says clarity is more important and forced humor can be worse than none. Atlassian says delight should come only after trust and warns that a flourish seen once may annoy when seen a dozen times. See [Mailchimp voice and tone](https://styleguide.mailchimp.com/voice-and-tone/) and [Atlassian voice and tone](https://atlassian.design/foundations/content/voice-tone/).

### 1.10 Metaphor must clarify or leave

Metaphor is useful when it compresses a genuinely difficult idea into a familiar model. It fails when it is decorative, mixed, culturally narrow, or asked to carry product meaning alone.

Bad signs:

- the metaphor could describe any company;
- the headline makes sense only after explanatory subcopy;
- several incompatible metaphors appear in one section;
- the metaphor replaces the product category or action;
- a literal translation would become confusing or absurd.

Keep metaphor for campaigns, editorial moments, and explanatory models where it improves recall. Prefer literal language in navigation, forms, instructions, errors, pricing, legal copy, and high-stakes decisions. Google and Atlassian both advise limiting figurative language for global and inclusive content. See [Google voice and tone](https://developers.google.com/style/tone) and [Atlassian inclusive language](https://design-system-docs-proxy.services.atlassian.com/foundations/content/inclusive-writing/).

### 1.11 Inclusion is an editing practice

Inclusive copy avoids unsupported assumptions about identity, ability, family, culture, income, knowledge, or intent.

Review for:

- stereotypes and gendered defaults;
- `he or she` where singular `they` works;
- ableist metaphors and casual diagnostic language;
- jokes or idioms that require a specific culture;
- examples in which one demographic is always the default authority or customer;
- labels that expose internal organization instead of language readers use;
- `easy`, `simple`, `obvious`, or `just` when they dismiss real difficulty;
- blame-oriented errors such as `You entered an invalid value` when `Enter a date in DD/MM/YYYY format` is clearer.

Inclusive writing is not a static blacklist. Atlassian frames it as avoiding assumptions and stereotypes, respecting how people identify, and asking for preferences where possible. See [Atlassian inclusive language](https://design-system-docs-proxy.services.atlassian.com/foundations/content/inclusive-writing/).

### 1.12 Reading level is a signal, not the goal

Use familiar words, short blocks, direct syntax, and clear headings. These improve access for people with cognitive and learning disabilities and for readers working in a second language. See [W3C writing for web accessibility](https://www.w3.org/WAI/tips/writing/) and [W3C clear content guidance](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/).

Do not force every audience to a universal grade level. A cardiologist, tax attorney, developer, and first-time consumer need different vocabulary. Digital.gov explicitly rejects the idea that plain language always means writing for an eighth-grade audience, while W3C notes that no single easy-to-read version can suit every reader. See [Digital.gov plain-language principles](https://digital.gov/guides/plain-language/principles) and [W3C Reading Level guidance](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html).

Use a reading-level score to flag density. Then make the editorial decision based on the actual audience and task.

## 2. Common AI-copy failure patterns

These are review signals, not proof that a model wrote the text. Judge the passage, not its suspected origin.

### 2.1 Generic premium vocabulary

Examples include *elevate*, *reimagine*, *unlock*, *transform*, *seamless*, *future-ready*, *cutting-edge*, *curated*, *bespoke*, *timeless*, and *where X meets Y*.

The problem is not the individual word. The problem is that it replaces product truth. Keep a word only if it names something accurately and is natural for the brand.

### 2.2 Abstract benefit stacking

Pattern:

> A smarter, faster, more intuitive platform that empowers teams to unlock meaningful growth.

Failures:

- no named action;
- no concrete object;
- no mechanism;
- no evidence;
- multiple claims with no priority.

Rewrite around the reader's task and the product's actual behavior.

### 2.3 Syntactic templates

Common constructions include:

- `Whether you're X or Y, ...`
- `From X to Y, ...`
- `It's not just X. It's Y.`
- `More than X, it is Y.`
- `Designed to X. Built to Y.`
- `X isn't just a Y. It's a Z.`
- three parallel imperatives in every section;
- identical question-answer openings across sections.

One use may be effective. Repetition across a page makes the voice feel generated. Research finds generated text relies on recurring syntactic templates more than human reference writing. See [Shaib et al.](https://aclanthology.org/2024.emnlp-main.368/).

### 2.4 Smooth but empty transitions

Examples: *Moreover*, *Furthermore*, *Additionally*, *In essence*, *Ultimately*, and *In conclusion*.

Transitions are useful when they express a real relationship. Remove them when sentence order already makes that relationship clear or when they merely disguise a list of unrelated claims.

### 2.5 Uniform rhythm

AI drafts often make every sentence polished to the same degree. That produces regular paragraph shapes, repeated emphasis, and no quiet lines. Combine, cut, or expand sentences based on meaning. Do not add random fragments just to imitate humanity.

### 2.6 Rephrased repetition

The heading, subheading, body, and CTA repeat one promise with different synonyms. Keep the strongest version, then use the remaining space for evidence, detail, or the next action.

### 2.7 Artificial intimacy

Examples include `We get it`, `We've all been there`, and `Your journey matters` without evidence that the brand understands the situation. Empathy should name the actual friction and help resolve it.

### 2.8 Unsupported certainty and fake authority

Warning signs:

- superlatives without a comparison set;
- precise numbers without a source;
- `trusted by` without verified customers;
- `research-backed` without named research;
- claims of ease without observing users;
- invented customer language or testimonials.

Do not smooth over missing evidence. Mark the gap for the owner.

### 2.9 Over-explanation

The draft anticipates every possible objection, defines obvious terms, and adds a conclusion to every section. Move edge cases to help content or documentation. Keep the primary page focused on the decision at hand.

### 2.10 Forced personality

Warning signs:

- an exclamation mark in every section;
- random slang;
- fake rebellion;
- cute names for ordinary features;
- jokes in error states;
- dramatic one-word fragments throughout;
- vocabulary chosen to sound `luxury`, `editorial`, or `innovative` rather than to fit the brand.

Personality should come from consistent judgment, vocabulary, specificity, and point of view. It does not require constant performance.

## 3. Context exceptions

These principles should not become rigid style prohibitions.

- **Technical terminology:** Keep it when the audience uses it or precision requires it. Define it when part of the audience may not know it.
- **Passive voice:** Use it when the actor is unknown, irrelevant, deliberately de-emphasized, or when active voice would blame the reader in a sensitive state.
- **Long sentences:** Keep them when they express one relationship more clearly than several disconnected short sentences.
- **Sentence fragments:** Use them in campaign copy or labels when the meaning remains complete in context.
- **Repetition:** Use it for deliberate emphasis, recall, warnings, or a true rhetorical pattern. Do not confuse repetition with accidental duplication.
- **Metaphor:** Use it when it explains a hard concept or belongs to a distinctive campaign idea.
- **Humor:** Use it when the brand owns the joke, the stakes are low, and the moment welcomes it.
- **Specialist reading level:** Match expert readers. Plain language preserves precision; it does not remove necessary complexity.
- **Unusual vocabulary:** Keep it when it is exact, authentic to the brand, and understandable in context. Do not use a thesaurus to simulate distinctiveness.
- **Strong claims:** Keep them when the proof is available and presented close enough for the reader to verify.

## 4. Editing workflow

### Pass 1: establish the facts

Collect before editing:

- product or service category;
- primary audience and task;
- real capabilities and limitations;
- approved terminology;
- verified claims, metrics, testimonials, and sources;
- required legal or compliance language;
- existing brand voice examples that stakeholders consider successful.

Mark unknowns. Never invent the missing fact to complete the layout.

### Pass 2: write the literal version

Write the clearest accurate statement of:

1. what this is;
2. who it helps;
3. what they can do;
4. why this option is credible;
5. what they should do next.

Do this before adding brand expression. A literal draft exposes missing substance.

### Pass 3: sharpen nouns and verbs

- Replace abstractions with named objects and actions.
- Unhide nominalized verbs.
- Remove weak helper phrases such as `helps to enable`.
- Replace vague benefits with product behavior or verified outcomes.
- Keep important product terms consistent.

### Pass 4: apply the brand voice

Use a small voice card:

- three behavioral traits;
- a `do` and `do not` example for each;
- preferred vocabulary;
- words the brand avoids;
- a tone map for success, neutral, warning, and error contexts.

Do not rewrite every sentence to display every trait. The page needs one coherent voice, not a personality checklist.

### Pass 5: edit structure and rhythm

- Delete repeated meaning across headings, body, labels, and CTAs.
- Vary sentence length where the ideas require different pacing.
- Break recurring syntactic templates.
- Put the important point first.
- Keep each paragraph on one subject.
- Remove transitions that do not describe a relationship.
- Read the page aloud from top to bottom.

### Pass 6: test restraint and trust

Challenge each adjective, intensifier, superlative, metaphor, joke, and numerical claim.

Ask:

- Is it true?
- Is it specific?
- Is it necessary?
- Can the reader verify it?
- Does it fit this moment?
- Would deleting it make the page clearer?

### Pass 7: check inclusion and accessibility

- Replace assumptions about the reader with known facts.
- Check names, pronouns, examples, and demographic defaults.
- Make headings and links meaningful out of context.
- Explain unfamiliar acronyms on first use.
- Make errors identify the problem and the next action.
- Check localization risks: idioms, puns, fragments, modifier stacks, and culture-specific references.

### Pass 8: separate missing content from finished copy

Use explicit placeholders:

- `[Add verified result, timeframe, and source]`
- `[Customer quote pending approval]`
- `[Confirm legal wording]`
- `[Name the supported integrations]`

End the handoff with a `Still needed` list. A clean placeholder is more honest than plausible fiction.

## 5. Review checklist

### Truth and usefulness

- [ ] The reader can identify what is offered without decoding a slogan.
- [ ] Each section adds new information, evidence, orientation, or action.
- [ ] Every factual claim is verified or marked as missing.
- [ ] Superlatives and quantitative claims include a comparison, timeframe, and source where relevant.
- [ ] No testimonial, customer, statistic, award, or relationship is invented.

### Specificity

- [ ] Important nouns name real people, objects, systems, or outcomes.
- [ ] Verbs describe observable actions.
- [ ] Abstract benefits are supported by a mechanism, example, or result.
- [ ] Generic premium vocabulary is not carrying the meaning.
- [ ] Examples match the intended audience and use case.

### Voice and tone

- [ ] The voice is recognizable across the page without sounding performed.
- [ ] The tone matches the reader's emotional state and the stakes.
- [ ] Vocabulary is consistent for product concepts and actions.
- [ ] Humor is optional, appropriate, and never hides critical information.
- [ ] Metaphors clarify instead of replacing literal meaning.
- [ ] The brand does not sound generically `premium`, `bold`, or `human`.

### Rhythm and editing

- [ ] Sentence length and structure vary for a reason.
- [ ] The same syntactic pattern does not repeat across sections.
- [ ] Parallel triplets are used deliberately, not by default.
- [ ] Headings, subcopy, body, and CTAs do not restate the same claim.
- [ ] Every word earns its place.
- [ ] The page sounds natural when read aloud.

### Inclusion and clarity

- [ ] The copy avoids stereotypes and unsupported assumptions.
- [ ] Gender-neutral language is used when identity is unknown.
- [ ] `Easy`, `simple`, `obvious`, and `just` do not dismiss reader difficulty.
- [ ] Jargon is either familiar to the audience, necessary and explained, or removed.
- [ ] Links, headings, labels, instructions, and errors are meaningful on their own.
- [ ] Reading-level tools were used as diagnostics, not as automatic acceptance criteria.
- [ ] Content remains understandable for the intended global and localization context.

## 6. Compact rules for a writing skill

1. Start from verified facts, not a desired tone.
2. Write the literal meaning before styling the voice.
3. Make every line provide information, evidence, orientation, or action.
4. Prefer concrete nouns and direct verbs.
5. Replace vague benefits with behavior, mechanism, example, or verified result.
6. Use one term for one product concept.
7. Keep voice stable; change tone for context and stakes.
8. Break repeated sentence templates and uniform cadence.
9. Remove generic premium vocabulary when it carries no factual meaning.
10. Use humor, metaphor, fragments, and repetition only when they improve this specific moment.
11. Do not blame, patronize, stereotype, or assume.
12. Never invent proof. Use a clear placeholder and report what is still needed.
13. Read the final page aloud and delete any line that sounds polished but says nothing.

## Sources

### Brand and product content systems

- [Mailchimp Content Style Guide: Voice and Tone](https://styleguide.mailchimp.com/voice-and-tone/)
- [Atlassian Design System: Voice and Tone](https://atlassian.design/foundations/content/voice-tone/)
- [Atlassian Design System: Inclusive Language](https://design-system-docs-proxy.services.atlassian.com/foundations/content/inclusive-writing/)
- [Adobe Spectrum: Voice and Tone](https://spectrum.adobe.com/page/voice-and-tone/)
- [Google Developer Documentation Style Guide: Voice and Tone](https://developers.google.com/style/tone)
- [Microsoft Writing Style Guide: Writing Tips](https://learn.microsoft.com/en-us/style-guide/global-communications/writing-tips)
- [Shopify Polaris: Content Fundamentals](https://polaris-react.shopify.com/content/fundamentals)

### Plain language and accessibility

- [Digital.gov: Principles of Plain Language](https://digital.gov/guides/plain-language/principles)
- [Digital.gov: Writing for Understanding](https://digital.gov/guides/plain-language/writing)
- [Digital.gov: Short and Simple](https://digital.gov/guides/plain-language/principles/short-simple)
- [W3C WAI: Writing for Web Accessibility](https://www.w3.org/WAI/tips/writing/)
- [W3C WAI: Use Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/)
- [W3C WAI: Understanding Reading Level](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html)

### Research on generated-text style

- Chantal Shaib, Yanai Elazar, Junyi Jessy Li, and Byron C. Wallace. [Detection and Measurement of Syntactic Templates in Generated Text](https://aclanthology.org/2024.emnlp-main.368/). EMNLP 2024.
- Sergio E. Zanotto and Segun Aroyehun. [Linguistic and Embedding-Based Profiling of Texts Generated by Humans and Large Language Models](https://aclanthology.org/2025.emnlp-main.1163/). EMNLP 2025.

