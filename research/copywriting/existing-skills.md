# Existing AI writing and copywriting skills

## Scope

This review compares public AI writing skills, prompt libraries, agent instructions, and prose-linting repositories. The goal is not to assemble a larger prompt from their wording. It is to identify practices that repeatedly produce useful website copy, distinguish them from rigid prompt folklore, and expose gaps that Taste Skill v2 should cover.

The sources vary widely in quality. Some are mature workflows with explicit evidence safeguards. Others are framework-heavy templates that can reproduce the exact generic copy they claim to prevent. Repository popularity is noted only as a signal of adoption, not proof that the instructions are correct.

## Main conclusion

The strongest reusable pattern is:

1. Ground the copy in known product facts, real audience language, and the actual page context.
2. Draft for meaning and information order before polishing style.
3. Audit claims, specificity, voice, structure, and line-level patterns in separate passes.
4. Preserve good existing text instead of regenerating everything.
5. Treat AI tells as clusters and failure modes, not as proof of authorship or a universal blacklist.
6. Test the copy inside the rendered interface, where hierarchy, wrapping, repetition, and CTA competition become visible.

The weakest recurring pattern is to force every page through AIDA, PAS, StoryBrand, a fixed section sequence, fixed word counts, mandatory urgency, and a list of forbidden punctuation. This replaces one generic default with another.

## Source comparison

| Source | What it contributes | What to reuse | Main caution | Evaluation |
|---|---|---|---|---|
| [Corey Haines marketing skills: copywriting](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md) | A widely adopted landing-page workflow with product, audience, proof, voice, page type, and CTA context | Customer language, honest claims, specificity, one idea per section, page-aware copy, separate editing pass | Its section templates and headline formulas can become defaults; it recommends rhetorical questions and repeated CTA patterns too broadly | High-value source with contextual filtering |
| [Corey Haines marketing skills: copy editing](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copy-editing/SKILL.md) | A seven-pass edit workflow covering clarity, voice, relevance, proof, specificity, emotion, and risk | Focused passes, preserve the original message, flag unsupported claims, remove content that cannot earn specificity | Arbitrary thresholds such as 25-word sentences, blanket exclamation removal, emotional amplification, and simulated expert panels should not become universal rules | Strong workflow, mixed micro-rules |
| [Corey Haines copy frameworks](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/references/copy-frameworks.md) | Page structures and headline formulas for several marketing contexts | Useful as optional idea prompts when a page lacks structure | The recommended layouts repeat familiar AI landing-page sequences, including automatic logo bars, three steps, benefits, testimonials, FAQ, and final CTA | Reference only, never a default template |
| [OneWave landing-page copywriter](https://github.com/OneWave-AI/claude-skills/blob/main/landing-page-copywriter/SKILL.md) | A compact example of framework-driven prompt design | It collects the minimum facts and distinguishes benefits from features | It hardcodes PAS/AIDA/StoryBrand, ten-word headlines, trust indicators, 3–5 features, 3–4 steps, 5–7 FAQs, urgency, scarcity, guarantees, multiple CTAs, and “power words.” It can manufacture template copy and pressures the model toward unsupported proof | Useful negative example |
| [Yabasha startup copywriting skill](https://github.com/yabasha/copywrite-skill/blob/main/SKILL.md) | Audience-awareness and market-sophistication concepts, platform constraints, proof, and a tightening pass | Match CTA commitment to what the audience knows; require mechanism or evidence behind claims; respect channel constraints | “Replace every adjective with a number,” “one CTA per piece,” mandatory competitor positioning, mandatory named mechanism, and “cut 20%” are cargo-cult rules when applied universally | Useful strategic ideas, over-prescriptive workflow |
| [Blader Humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md) | A detailed catalog of recurring AI prose patterns and a voice-calibration workflow | Match real writing samples; preserve meaning; catch significance inflation, vague attribution, superficial `-ing` clauses, synonym cycling, false ranges, signposting, generic conclusions, chat artifacts, and manufactured drama | It contains internal contradictions: em dashes are both a hard ban and later described as harmless alone. It also treats curly quotes, title case, and emojis too readily as AI tells | Excellent pattern inventory, unreliable as a literal ruleset |
| [Stephen Turner Deslop](https://github.com/stephenturner/skill-deslop/blob/main/SKILL.md) | A concise anti-formula editor with scientific and technical register awareness | Cut throat-clearing, fake profundity, vague claims, unsupported attributions, repeated conclusions, and formulaic contrasts; retain domain terminology | It still hard-bans em dashes, triads, and some rhetorical forms even when they may fit the voice | Strong principles with several rigid surface bans |
| [Conor Bronsdon Avoid AI Writing](https://github.com/conorbronsdon/avoid-ai-writing/blob/main/SKILL.md) | Detect-only, rewrite, and targeted edit modes; explicit false-positive warning; tiered pattern density | Make minimal edits, preserve already-good passages, judge word clusters by density, exclude quoted material, distinguish weak from strong signals, cap iterative rewrites | Its large vocabulary tables can encourage mechanical synonym swapping, and several numeric thresholds are not independently validated within the skill | Best operational model among the humanizer skills |
| [SciWrite](https://github.com/labarba/sciwrite/blob/main/SKILL.md) | Five focused review passes derived from a writing course: clutter, verbs, sentence architecture, term consistency, and numerical/citation integrity | Separate content integrity from prose edits; keep technical terms stable; compare numbers and citations; do not alter claims while editing delivery | Scientific-manuscript rules cannot be copied directly into website copy | Strong editing architecture outside marketing |
| [GitHub Awesome Copilot brag-sheet skill](https://github.com/github/awesome-copilot/blob/main/skills/brag-sheet/SKILL.md) | Evidence-first impact writing: action, result, evidence; explicit missing-evidence markers | Never invent metrics; allow qualitative evidence; mark evidence gaps; group related facts before writing | Its fixed three-part format fits accomplishments, not all copy | Excellent evidence discipline |
| [GitHub Awesome Copilot create-readme skill](https://github.com/github/awesome-copilot/blob/main/skills/create-readme/SKILL.md) | A small official-community prompt that asks for examples and concise Markdown | Using examples can calibrate structure and tone | “Take a deep breath,” vague expertise role-play, “comprehensive,” and generic exemplar links are prompt cargo cult unless tested against actual failures | Useful negative example of common prompt habits |
| [OpenAnalyst 10X Content Expert](https://github.com/OpenAnalystInc/10x-Content-Expert) | Reference folders for voice guides, messaging, keywords, avoid lists, transcripts, and high-performing examples | Treat brand examples and source materials as inputs, not decoration | Heavy framework branding, generic “10X” claims, and broad content generation scope offer little quality control by themselves | Good context-storage idea, weak copy QA |
| [Vale](https://github.com/vale-cli/vale) | Markup-aware, configurable prose linting | Automated checks should be project-specific, configurable, and able to ignore code/markup | A linter detects patterns, not whether a sentence is persuasive, truthful, or appropriate | Strong optional validation layer |
| [write-good](https://github.com/btford/write-good) | Simple checks for passive voice, weasel words, and wordiness, with per-check disabling and whitelists | Any automated rule needs opt-outs and domain whitelists | The project calls itself naive; its flags should remain warnings | Useful implementation reference, not editorial authority |
| [alex](https://github.com/get-alex/alex) | Linting for insensitive and inconsiderate language | Include inclusive-language checks in final QA when relevant | Terminology depends on audience, locale, reclaimed language, and quoted material | Useful focused check |
| [textlint](https://github.com/textlint/textlint) | Pluggable natural-language linting | Keep automated checks modular instead of hardcoding a universal house style | Plugins vary in quality and language coverage | Useful architecture reference |
| [OpenAI evaluation flywheel](https://github.com/openai/openai-cookbook/blob/main/examples/evaluation/Building_resilient_prompts_using_an_evaluation_flywheel.md) | Analyze failures, measure them, then make targeted prompt changes | Build the skill from real bad outputs and holdout examples instead of prompt intuition | Requires an evaluation set; a long instruction file alone does not prove improvement | Essential method for maintaining the skill |
| [GitHub prompt-engineering guidance](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering) | Specific context, relevant examples, decomposition, iteration, and current history | Explicit inputs and examples beat decorative personas or magic wording | General prompting advice, not copywriting guidance | Reliable prompt-design baseline |

## Reusable rule ideas

### 1. Truth before persuasion

- Every factual claim must come from user-provided information, verified source material, or clearly labeled sample content.
- Do not invent customer names, testimonials, logos, review scores, usage counts, performance deltas, guarantees, awards, integrations, prices, or timelines.
- If a design needs sample content and the user asked for a mockup, use visibly generic sample data rather than plausible fake proof.
- If real proof is missing, omit the claim or mark the content slot as needed. Do not replace missing evidence with a softer unsupported phrase such as “trusted by teams worldwide.”
- A qualitative claim still needs a defensible basis. “Faster” requires a comparison; “secure” requires a concrete property; “easy” requires an observable reduction in effort.
- Keep a short `Still needed` handoff for missing copy, evidence, legal review, integrations, or final links.

### 2. Use available context without turning the task into an interview

- Read existing product copy, repository content, user-supplied facts, and real voice examples before writing.
- Infer obvious page context from the project. Ask only when a missing fact would materially change the result or force fabrication.
- Keep unknowns unknown. A clean placeholder or omitted section is better than a confident guess.
- Distinguish new writing from editing. Editing should preserve the intended message and existing good passages unless the user requested a rewrite.
- Match the requested language, locale, level of formality, and product category.

### 3. Calibrate voice from evidence

- Prefer two or more real writing samples from the brand or author when available.
- Observe vocabulary, sentence rhythm, directness, contractions, punctuation, humor, technical density, and how the writer addresses the reader.
- Reproduce stable voice characteristics, not typos or accidental weaknesses unless the casual medium makes them part of the voice.
- Without a sample, use plain, specific language appropriate to the product. Do not invent a quirky personality, personal anecdote, joke, or opinion.
- Neutral writing is correct for legal, technical, reference, and some enterprise contexts. “More personality” is not a universal improvement.

### 4. Write for the page’s job

- Each section should have a reason to exist and add new information, proof, orientation, or action.
- A headline should carry the section’s useful claim, not label the topic or repeat decorative language.
- A subheading should add information that the heading cannot carry cleanly. Delete it if it merely paraphrases the heading.
- Keep the main action easy to find and describe what happens next. Avoid vague CTA labels when a concrete action fits.
- Do not manufacture urgency, scarcity, guarantees, trust badges, or objection handling because a framework expects them.
- Match CTA commitment to the user’s likely readiness: reading documentation, viewing work, trying a product, booking a call, or purchasing are different asks.
- Do not repeat the same CTA sentence after every section. Repetition is acceptable when page length and decision flow justify it, but the labels and intent must remain consistent.

### 5. Prefer concrete meaning over marketing wrappers

- Name the actor, action, object, and result when those details are known.
- Replace vague praise with the actual mechanism, constraint, comparison, example, or outcome.
- Connect a feature to a benefit only when the causal link is real. Do not mechanically append “so you can” to every feature.
- Use customer language when it is sourced from interviews, reviews, support requests, or existing product copy.
- Keep domain terms when they are precise. Explain them when the audience may not know them; do not flatten every technical noun into generic language.
- Use numbers only when supplied or verified. Specificity is not permission to fabricate precision.

### 6. Common AI-copy failure patterns

Flag these as contextual warnings. Rewrite them when they obscure meaning, repeat across the page, or appear in clusters:

- Inflating routine facts into pivotal moments, broader movements, transformations, or testaments.
- Promotional adjectives that substitute for observable details.
- Vague attribution such as “experts say,” “industry reports,” or “customers agree” without a source.
- Present-participle tails that add fake analysis: “highlighting,” “showcasing,” “underscoring,” or “fostering” with no new fact.
- Avoiding simple verbs such as `is`, `has`, and `uses` in favor of `serves as`, `boasts`, `features`, or `leverages`.
- Stock transitions and announcements that describe the writing instead of advancing it.
- Formulaic `not X, but Y` contrasts, especially several in one piece.
- Compulsive groups of three.
- Cycling synonyms for the same entity and thereby reducing consistency.
- False `from X to Y` ranges whose endpoints are not a meaningful scale.
- Consecutive sentences with the same length and syntax.
- Repeated staccato fragments designed to manufacture drama.
- Aphorism formulas that make an ordinary point sound universal.
- Fake-candid rhetorical openings such as “Here’s the thing” followed by a routine claim.
- Generic optimistic endings that do not state a decision, consequence, or next step.
- Repeating a heading in the first sentence below it.
- Bold-first bullets used for every list, regardless of information shape.
- Chat artifacts pasted into page copy: praise, apologies, “I hope this helps,” offers to continue, or model-knowledge disclaimers.
- Speculative gap-filling when the source does not contain the answer.
- Sycophantic tone or empty agreement.
- Over-hedging that removes the claim, and overconfidence that exceeds the evidence.
- Repeating the same idea at headline, subheading, body, and final CTA with new adjectives but no new information.

These are not standalone proof that text was AI-generated. One transition, triad, passive sentence, em dash, or rhetorical question can be correct. Density, repetition, mismatch with the intended voice, and lack of informational value are the real problems.

### 7. Editing workflow

A compact workflow is more useful than a large collection of formulas:

1. **Meaning pass:** Confirm the page has a clear subject, audience-relevant claim, and next action.
2. **Truth pass:** Mark every claim that needs a source. Remove or label anything unsupported.
3. **Structure pass:** Remove repeated arguments, filler sections, and headings that only label content.
4. **Voice pass:** Compare against real examples and correct unexplained shifts in tone or terminology.
5. **Line pass:** Tighten filler, vague verbs, awkward syntax, redundant modifiers, and recurring AI patterns.
6. **Interface pass:** Read the copy in the rendered layout at desktop and mobile widths. Fix wrapping, density, orphaned words, repeated CTAs, truncated labels, and mismatched visual hierarchy.
7. **Handoff pass:** List unresolved facts, placeholders, integrations, proof, links, and approvals.

Each pass should preserve improvements from the previous passes. Do not regenerate the whole page after a minor line edit.

### 8. Automated checks should be narrow

Automation can reliably flag:

- Known placeholder text and empty links.
- Claims containing numbers that lack a nearby source marker in research-heavy content.
- Repeated CTA labels with different destinations or different labels with the same destination.
- Banned project-specific terms and deprecated product names.
- Excessive repeated phrases, duplicate headings, and exact paragraph duplication.
- Broken links, missing form labels, and error messages that do not explain recovery.
- Readability outliers and unusually long UI labels as review prompts.
- Inclusive-language issues through a configurable tool such as alex or a Vale style package.

Automation should not automatically reject all passive voice, adverbs, long sentences, em dashes, questions, or unusual words. Those checks produce false positives without genre and voice context.

## Rejected prompt patterns

### Universal framework selection

Do not require AIDA, PAS, BAB, StoryBrand, Hook–Story–Offer, or any other named formula for every page. They are optional reasoning aids. A product documentation page, portfolio, service page, pricing page, and campaign landing page do not need the same persuasion arc.

### Fixed section recipes

Do not automatically produce Hero → Logos → Problem → Benefits → Three Steps → Testimonials → Pricing → FAQ → Final CTA. The page should contain only the information required for its purpose and available evidence.

### Arbitrary numeric rules

Reject universal rules such as:

- Headlines must be ten words or fewer.
- Sentences must stay below 25 words.
- Paragraphs must contain two to four sentences.
- Every page needs three to five benefits.
- Every process needs three or four steps.
- Every FAQ needs five to seven questions.
- Every draft must be cut by 20 percent.
- Every copy block needs one CTA, or the contradictory rule that every page needs several CTAs.

Length and count are interface constraints and editorial judgments, not universal quality metrics.

### Surface-level punctuation bans

Do not universally ban em dashes, en dashes, exclamation marks, curly quotes, parentheses, semicolons, title case, or emojis. Flag repetition and contextual mismatch. Preserve punctuation that belongs to the supplied voice or locale.

### Blanket grammar transformations

Do not convert every passive sentence to active voice. Passive voice can correctly foreground the object, hide an irrelevant actor, or follow scientific and legal convention. Change it when the actor matters or the sentence becomes clearer.

Do not replace every adjective with a number. Use verified numbers when they matter; otherwise choose a concrete noun, verb, example, or comparison.

### Automatic emotional manipulation

Reject instructions to always agitate pain, intensify fear, add scarcity, add urgency, add FOMO, guarantee results, or insert risk reversal. These may be dishonest, brand-inappropriate, or legally unsafe.

### Mechanical “humanization”

Do not add random fragments, typos, tangents, first-person opinions, slang, jokes, or emotional uncertainty merely to evade AI detectors. Match a real voice and improve the writing for readers. Detector evasion is not the quality target.

### Vocabulary substitution tables as the primary editor

Words such as `robust`, `seamless`, `innovative`, `landscape`, `crucial`, or `leverage` often hide vague copy, but replacing them one-for-one can preserve the same empty sentence. Rewrite the claim around a specific fact or cut it. Word lists are discovery tools, not an editing algorithm.

### Prompt cargo cult

Avoid untested instructions such as “take a deep breath,” inflated role labels, demands to be “world-class,” generic “think step by step” clauses, and long lists of frameworks. Add an instruction only when it addresses a demonstrated failure and survives evaluation across different page types.

## Gaps in existing skills

The public skills reviewed here rarely solve the full website problem:

1. **Rendered copy fit:** Most generate copy in isolation and never test headline wrapping, button width, navigation length, mobile density, or the relationship between copy and imagery.
2. **Incomplete source handling:** Few provide a clean workflow for omitted content, visibly labeled mock data, and a final list of real assets or facts still needed.
3. **Claim provenance:** Most say “use proof” but do not track which source supports each claim.
4. **Design-copy coordination:** They do not decide whether a point belongs in a heading, body paragraph, caption, feature block, table, empty state, form, or not on the page at all.
5. **UI states:** Error, loading, empty, success, permission, destructive-action, and offline copy receive little attention.
6. **Accessibility:** Few cover descriptive link text, actionable error messages, label clarity, localization expansion, screen-reader context, or avoiding instructions based only on visual position.
7. **Context priority:** Many frameworks override the user’s requested output instead of acting as defaults only when context is missing.
8. **Evaluation:** Almost none ship a representative dataset of pass/fail examples or measure whether a prompt change improves output across page types.
9. **Multilingual voice:** Most assume English and do not address translated idiom, compound length, locale punctuation, or language-specific formality.
10. **Preservation mode:** Many rewrite entire drafts, even when only several lines are weak.

## Recommended structure for Taste Skill v2

The final skill should keep copy guidance in a few distinct layers instead of one giant blacklist:

### Content integrity

- Verified facts, claim provenance, allowed mock content, placeholders, and `Still needed` handoff.

### Copy quality

- Clear information order, specificity, audience relevance, useful headings, concrete CTAs, voice consistency, and page-appropriate density.

### AI-pattern review

- Contextual warnings for repeated formulaic patterns, significance inflation, vague authority, fake profundity, generic transitions, and mechanical rhythm.

### Interface copy

- Navigation, buttons, forms, validation, empty states, errors, success messages, accessibility, and localization constraints.

### Verification

- Separate truth, structure, voice, line, rendered-layout, and handoff checks, supported by a small eval set of real website examples.

Use three enforcement levels:

- **Hard rule:** fabrication, deceptive claims, broken or misleading UI copy, inaccessible instructions, and unrevealed non-functional behavior.
- **Avoid by default:** patterns that repeatedly create generic copy but may be justified by context.
- **Context check:** punctuation, sentence shape, tone, frameworks, and structural conventions that can be correct when the page, brand, or user requests them.

## Source list

- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- [OneWave-AI/claude-skills](https://github.com/OneWave-AI/claude-skills)
- [yabasha/copywrite-skill](https://github.com/yabasha/copywrite-skill)
- [blader/humanizer](https://github.com/blader/humanizer)
- [stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop)
- [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing)
- [labarba/sciwrite](https://github.com/labarba/sciwrite)
- [github/awesome-copilot](https://github.com/github/awesome-copilot)
- [OpenAnalystInc/10x-Content-Expert](https://github.com/OpenAnalystInc/10x-Content-Expert)
- [vale-cli/vale](https://github.com/vale-cli/vale)
- [btford/write-good](https://github.com/btford/write-good)
- [get-alex/alex](https://github.com/get-alex/alex)
- [textlint/textlint](https://github.com/textlint/textlint)
- [OpenAI evaluation flywheel](https://github.com/openai/openai-cookbook/blob/main/examples/evaluation/Building_resilient_prompts_using_an_evaluation_flywheel.md)
- [GitHub prompt engineering](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering)
