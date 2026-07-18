# Copywriting Research Synthesis

This document consolidates six independent research reports into one direction for Taste Skill v2. It covers website copy, interface writing, brand voice, truth and proof, recurring AI-writing failures, and patterns found in existing public writing skills.

## Source reports

- [`ai-writing.md`](./ai-writing.md): recurring failure patterns in generated prose and reliable review methods.
- [`web-copy.md`](./web-copy.md): landing-page information order, headlines, CTAs, proof, and scan behavior.
- [`ux-writing.md`](./ux-writing.md): navigation, forms, errors, loading, empty states, success states, and accessibility.
- [`voice-and-editing.md`](./voice-and-editing.md): brand voice, tone, rhythm, inclusion, and an editorial workflow.
- [`existing-skills.md`](./existing-skills.md): useful ideas and recurring mistakes across public writing skills, prompt libraries, and prose linters.
- [`truth-and-proof.md`](./truth-and-proof.md): substantiation, fake proof, mock content, comparisons, urgency, SEO, and launch handoff.

The source reports retain their complete bibliography and links. The strongest normative sources include W3C, FTC, EU law, GOV.UK, Digital.gov, Google Search Central, and established public content systems from Microsoft, Adobe, Atlassian, Mailchimp, Shopify, and others.

## Main conclusion

AI writing slop is not a punctuation style or a fixed vocabulary. It is writing that sounds complete before the underlying thinking, evidence, or product knowledge is complete.

The most reliable warning signs are clusters of:

- abstract benefits without an actor, action, object, mechanism, or result;
- confident claims without evidence;
- interchangeable brand language;
- repeated syntactic templates and uniform cadence;
- duplicated meaning across headings, body copy, bullets, and CTAs;
- fake proof, urgency, intimacy, or authority;
- copy written to fill a component rather than help the reader;
- interface text that hides state, consequence, recovery, or missing functionality;
- text that reads acceptably in a document but fails when rendered in the interface.

The skill should review output quality rather than attempt to determine whether a person or model wrote it. AI detectors and one-word tells are not dependable editorial methods.

## Enforcement model

### Hard rules

Use hard rules where the output would otherwise be deceptive, inaccessible, unsafe, or functionally misleading.

- Never invent people, customers, logos, testimonials, reviews, ratings, awards, metrics, prices, comparisons, credentials, product states, or integrations and present them as real.
- Never claim that a prototype, sample, static control, or simulated state is live or connected.
- Never use fake scarcity, urgency, activity, guarantees, or independent endorsement.
- Never conceal a material limitation in distant, low-contrast, hover-only, or mobile-missing copy.
- Never publish a control label, success message, error, or confirmation that misrepresents what the interface did.
- Never remove necessary form labels, recovery instructions, accessible names, or critical state information for visual cleanliness.

### Avoid by default

Use these rules when the user, existing project, brand, or page purpose has not supplied a reason for the pattern.

- generic premium vocabulary carrying the main claim;
- abstract benefit stacks;
- formulaic contrasts, triplets, ranges, and sentence openings repeated across a page;
- mechanical landing-page frameworks and fixed section counts;
- vague CTA labels and multiple labels for the same action;
- generic headings, decorative preheadings, and subcopy that repeats the heading;
- forced personality, artificial intimacy, ornamental metaphor, or humor in stressful states;
- filler copy added because a component exposes a text slot;
- over-explanation, exhaustive objection handling, and repeated summaries;
- unsupported superlatives and softened versions of claims that still lack evidence.

### Context checks

These techniques are neither signs of quality nor automatic failures. Keep them when they fit the requested voice, audience, subject, or interface state.

- passive voice;
- long sentences;
- sentence fragments;
- rhetorical questions;
- repetition and parallel structure;
- groups of three;
- em dashes, semicolons, parentheses, exclamation marks, title case, and emojis;
- metaphor, humor, slang, specialist terminology, and unusual vocabulary;
- AIDA, PAS, StoryBrand, and other copy frameworks;
- repeated CTAs on a long page.

The problem is usually density, repetition, mismatch, or missing meaning—not the isolated form.

## Consolidated failure patterns

### 1. Missing truth

- Objective claims are drafted before their evidence is known.
- Precise numbers are invented to make a layout credible.
- Product limitations are omitted while benefits are stated broadly.
- `Trusted by`, `research-backed`, `enterprise-grade`, `live`, or `real-time` appears without a verifiable basis.
- Testimonials or case studies are synthesized from no real source.
- Competitor comparisons use invented, stale, or selectively framed information.
- Sample dashboards visually imply real customer outcomes.
- Unverified production copy remains hidden behind a vague TODO.

### 2. Missing meaning

- The reader cannot identify what is offered without decoding a slogan.
- Benefits do not identify the behavior or mechanism that creates them.
- Headings label a topic instead of making a useful point.
- A subheading restates the headline with new adjectives.
- Every section repeats the same promise rather than answering the next question.
- Decorative phrases occupy text slots without adding information, evidence, orientation, or action.
- Product terms rotate through synonyms and stop referring to one stable concept.

### 3. Generic marketing language

- Prestige words such as `seamless`, `elevated`, `transformative`, `curated`, or `future-ready` substitute for observable detail.
- Ordinary facts become a `testament`, `movement`, `journey`, or `new era` without justification.
- Strong modifiers and superlatives assert quality instead of proving it.
- Feature lists mechanically append `so you can` benefits whether or not the causal link is real.
- The copy claims to be bold, human, premium, or innovative instead of expressing a specific point of view.

No individual word should be universally banned. Rewrite the thought, not merely the vocabulary.

### 4. Generated cadence

- Multiple sections use the same `Whether X or Y`, `From X to Y`, `not X but Y`, or `Designed to X. Built to Y.` construction.
- Every list has three items because three sounds polished.
- Sentence length, paragraph shape, and emphasis remain mechanically uniform.
- Transitions announce structure without expressing a real relationship.
- Each section ends in a slogan or summary.
- Dramatic fragments, aphorisms, and false contrasts make routine information sound profound.

The correction is not random variation. Sentence shape should follow meaning and reading pace.

### 5. Artificial voice

- The draft invents jokes, slang, opinions, anecdotes, or rebellious language without brand evidence.
- `We get it`, `we've all been there`, or similar phrases simulate empathy without naming the real friction.
- Reader praise and sycophantic agreement replace useful guidance.
- Humor appears in errors, destructive actions, privacy, payment, safety, or data-loss states.
- One product concept receives several stylish names.
- The copy imitates a luxury, startup, editorial, or technical stereotype instead of the supplied brand.

Voice should be described through observable writing behavior. Tone should change with the reader's state and the stakes.

### 6. Interface-writing failures

- Button labels name an abstract goal instead of the immediate result.
- Several CTA labels point to the same action or one label points to different actions.
- Placeholders replace persistent form labels.
- Helper text repeats the label or explains an obvious field.
- Errors blame the user, report only that something is invalid, or fail to explain recovery.
- Loading text implies measurable progress that the system does not know.
- Success copy claims completion before the backend confirms it.
- Empty states do not distinguish first use, no results, filtered results, permission limits, errors, or deleted content.
- Destructive actions have vague labels or confirmations unrelated to actual risk.
- Link text and headings become meaningless when read out of context.
- Strings depend on visual position, word order, or concatenation that will fail for assistive technology or localization.

### 7. Copy-layout failures

- A desktop CTA or primary navigation label wraps when a shorter accurate label is available.
- Headline wrapping is forced for visual effect before the width requires it.
- The hero tries to carry the proposition, features, pricing, trust microcopy, logo wall, metadata, and several competing actions.
- Copy is shrunk until it fits rather than edited or recomposed.
- Mobile receives the desktop copy density with narrower measure and no prioritization.
- A headline, subheading, and CTA compete for the same verbal emphasis.
- Important qualifications disappear or separate from their claims at smaller widths.

Copy is not complete until it has been reviewed in the rendered interface at representative and intermediate widths.

## What good copy should do

### Establish the literal meaning

Before adding style, state:

1. what the product, service, organization, or page is;
2. who it is for when that distinction matters;
3. what the reader can do or learn;
4. why the claim is credible;
5. what happens after the next action.

The literal draft exposes missing facts. Brand expression should sharpen it, not hide the gap.

### Give each element one job

- Headline: deliver the most useful claim or orientation.
- Supporting line: add necessary context, mechanism, audience, or qualification.
- Body: explain, demonstrate, compare, or prove.
- Evidence: support the exact nearby claim.
- CTA: describe the immediate next step or result.
- Helper text: prevent uncertainty or error.
- Error: identify the problem and explain recovery.
- Success: confirm what actually happened and what is next.

Delete an element when it cannot add a distinct job.

### Prefer concrete language

- Use nouns that name actual people, objects, systems, files, states, or outcomes.
- Use direct verbs that describe observable actions.
- Keep exact domain terminology when the audience needs it.
- Replace a vague benefit with behavior, mechanism, example, constraint, comparison, or verified result.
- Keep one term for one product concept.
- Stop when the reader has enough information for the present decision.

### Make confidence proportional to evidence

Use evidence in descending order of strength:

1. verified result with metric, definition, period, conditions, and source;
2. observable capability;
3. named mechanism or constraint;
4. accurately qualified promise;
5. explicit placeholder or omission when proof is missing.

Do not turn missing proof into a vaguer unsupported claim.

## Recommended workflow

### 1. Source pass

Read existing product copy, repository content, user-supplied facts, approved terminology, legal constraints, and real voice samples. Preserve strong existing language. Mark facts that are unknown rather than inventing them.

### 2. Literal pass

Write the clearest accurate version of the offer, audience, capability, evidence, limitation, and next action. Do not begin with a personality performance or a named persuasion framework.

### 3. Truth pass

Extract every objective or implied claim. Match each to a source, owner, scope, date, qualification, and status. Narrow, label, omit, or block any unsupported claim.

### 4. Structure pass

Give every section a necessary question or decision job. Remove duplicate arguments, filler sections, generic headings, repeated conclusions, and framework-required content that the page does not need.

### 5. Voice pass

Apply a small operational voice card based on real examples: preferred vocabulary, directness, sentence rhythm, contractions, technical density, humor boundaries, and tone by state. Do not regenerate the entire page merely to add personality.

### 6. Line pass

Replace abstract claims with concrete nouns and verbs. Remove redundant modifiers, semantic fog, unsupported certainty, empty transitions, repeated templates, and mechanical rhythm. Read the page aloud.

### 7. Interface pass

Review the copy in the working page at desktop, short-laptop, tablet, mobile, zoom, and localization-stress widths. Check headline measure, CTA and navigation wrapping, density, truncation, hierarchy, claim-disclosure proximity, and every UI state.

### 8. Handoff pass

List missing evidence, copy, assets, legal approval, destinations, integrations, and sample replacements under `Still needed`. An unresolved item that could mislead a visitor blocks production launch.

## Automation boundary

Automation can flag:

- exact duplicate headings, paragraphs, phrases, and CTA labels;
- different labels sharing one destination or one label serving different actions;
- placeholder tokens, empty links, outdated product terms, and unexplained TODOs;
- unsupported numeric-claim candidates;
- repeated sentence openings and unusually dense template clusters;
- missing form labels, inaccessible link text, and errors without recovery language;
- copy overflow, truncation, CTA wrapping, and navigation wrapping;
- project-specific inclusive-language warnings;
- sample markers that remain in production-bound output.

Automation should not decide authorship or automatically reject passive voice, adverbs, long sentences, em dashes, questions, uncommon words, or readability scores. These checks require audience and context.

## Recommended Taste Skill v2 architecture

Keep the runtime guidance in a separate [`rules/copywriting.md`](../../rules/copywriting.md) document with five layers:

1. truth and source integrity;
2. page and landing-page copy;
3. interface writing;
4. voice and AI-pattern review;
5. rendered verification and handoff.

This separation keeps the broad design ledger focused while allowing copy rules to evolve without turning the final skill into one giant blacklist.

## Final position

The goal is not to make text look less machine-generated. The goal is to make it accurate, specific, useful, coherent, recognizably appropriate to the brand, and honest about what remains unknown. Good copy earns its space in both the information architecture and the rendered layout.
