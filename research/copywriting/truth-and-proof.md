# Truth and Proof Rules for AI-Generated Website Copy

## Technical summary

AI may draft website copy, but it must not invent the facts that make the copy persuasive. The safest operating rule is simple: **if a statement could affect trust, purchase, signup, risk, price, or reputation, the system must either verify it, label it as sample content, or remove it.** Plausibility is not proof.

The strictest rules apply to objective product claims, performance metrics, customer evidence, comparisons, guarantees, prices, scarcity, endorsements, trust marks, and regulated topics. These claims can be misleading not only when their words are false, but also when the combined impression of copy, layout, imagery, and omitted qualifications is deceptive. The US Federal Trade Commission (FTC) explicitly evaluates both express and implied claims and requires a reasonable evidentiary basis before an ad runs. The EU Unfair Commercial Practices Directive likewise covers false information, misleading presentation, and material omissions.

Mock content is still useful for design work. It is safe only when the output is clearly a prototype or sample, the content cannot reasonably be mistaken for verified production data, and every unresolved item is listed for replacement before launch. A polished mockup does not make invented evidence real.

This report is a cross-jurisdiction design and content standard, not legal advice. Product category and market-specific law may require stricter review.

## Decision model

Use three levels:

- **HARD BAN**: do not generate, publish, or present as real, regardless of aesthetic benefit.
- **REQUIRES PROOF**: allowed only when the relevant evidence exists, matches the exact claim, is current enough, and can be reviewed.
- **CONTEXT-DEPENDENT**: allowed in a clearly identified prototype, or when the statement is genuinely subjective and cannot reasonably be read as an objective promise.

When uncertain, do not soften an unsupported claim with vague legal copy. Replace it with an accurate narrower claim, an explicit placeholder, or nothing.

## Hard bans

### 1. Never fabricate social proof

Do not invent or AI-generate:

- customers, clients, users, founders, experts, reviewers, or testimonial authors;
- testimonial quotes, review text, star ratings, review counts, or case studies;
- customer portraits or AI headshots presented as real people;
- company, partner, publication, investor, certification, or customer logos;
- awards, rankings, trust marks, press mentions, or endorsements;
- job titles, credentials, institutions, or material relationships;
- a supposedly independent comparison or review site controlled by the seller.

The FTC's Consumer Reviews and Testimonials Rule prohibits fake or false reviews and testimonials, including reviews attributed to people who do not exist or did not have the claimed experience. It also addresses undisclosed insider reviews and company-controlled review sites misrepresented as independent. The EU directive prohibits submitting or commissioning false consumer reviews and endorsements and prohibits claiming reviews come from verified purchasers without proportionate checks.

**Design implication:** if real social proof was not supplied, omit the section or render unmistakable placeholders such as `[Approved customer logo]` and `[Verified customer quote]`. Do not create plausible brands, faces, names, quotes, or ratings merely to make the layout look finished.

### 2. Never invent numbers or quantified outcomes

Do not create unsupported:

- revenue, savings, conversion, adoption, retention, uptime, speed, accuracy, or productivity figures;
- customer, user, country, office, employee, download, or transaction counts;
- benchmark results, market share, survey results, or test outcomes;
- dates, durations, launch history, years of experience, or volume processed;
- prices, discounts, reference prices, return rates, or inventory values;
- precise-looking decimals or ranges designed to make a mockup feel credible.

Every number implies measurement. A round number is not safer than a precise number. A disclaimer such as “illustrative only” does not make a number suitable for production.

### 3. Never publish objective claims without prior substantiation

Objective claims include explicit and implied claims about performance, features, effectiveness, safety, compatibility, price, durability, environmental impact, market position, or expected results. They require evidence **before** publication. Evidence created after a claim is published is not a substitute for prior substantiation under the FTC's policy.

Hard-ban unsupported formulations such as:

- `cuts costs by 40%`;
- `the fastest platform`;
- `clinically proven`;
- `used by leading teams`;
- `enterprise-grade security`;
- `zero downtime`;
- `carbon neutral`;
- `guaranteed results`;
- `works with every tool`;
- `trusted by thousands`.

The rule applies even when the claim appears in a headline, CTA, badge, infographic, alt text, chart, product mockup, metadata, or testimonial rather than ordinary body copy.

### 4. Never use fake urgency or scarcity

Ban urgency that is not tied to a real, enforceable condition:

- resetting or baseless countdown timers;
- `only 2 left` without live, reliable inventory;
- `20 people are viewing this` without verified real-time data;
- `offer ends tonight` when it does not;
- fake waitlists, queues, capacity limits, deadlines, expiring bonuses, or access windows;
- recurring “limited-time” promotions that immediately restart;
- invented demand or activity notifications.

The FTC identifies baseless countdowns, false limited-time messages, and fake low-stock messages as dark patterns. The EU directive lists falsely stating that a product or offer is available only for a very limited time in order to force an immediate decision as an unfair practice in all circumstances.

### 5. Never misrepresent a guarantee, refund, warranty, or risk claim

Do not use `risk-free`, `money-back`, `satisfaction guaranteed`, `lifetime`, or similar language unless the business actually offers the promise and its material limits are available and accurately described. A money-back guarantee does not replace evidence for the underlying product claim. FTC guidance states that “satisfaction” or “money back” language generally represents a full-refund offer and that material time limits or conditions must be disclosed.

Do not imply that a normal statutory right is a special product benefit. Do not hide exclusions, return costs, deadlines, eligibility conditions, automatic renewals, or required steps.

### 6. Never hide a material qualification

A disclosure cannot rescue a dominant false impression. Ban:

- key limits hidden in fine print, tooltips, hover states, or distant terms;
- contradictory disclosures below the fold;
- low-contrast or tiny qualification text;
- asterisk chains that require users to reconstruct the actual offer;
- mobile layouts where the qualification disappears or becomes separated from the claim;
- ambiguous euphemisms for price, recurring billing, sponsorship, data use, or limitations.

FTC digital-advertising guidance says necessary disclosures should be clear and conspicuous, work across devices, and appear as close as possible to the claim. If a platform cannot show the disclosure effectively, the deceptive claim should not be used there.

### 7. Never rig a comparison

Ban comparison copy or tables that:

- use invented competitor features, prices, limitations, or scores;
- compare different product tiers, dates, regions, workloads, or definitions without saying so;
- choose only criteria that guarantee the preferred winner;
- present opinions as measured facts;
- use outdated competitor information as current;
- hide the comparison method or basis;
- use `best`, `No. 1`, `leading`, `faster`, or `cheaper` without evidence matching the intended interpretation.

Truthful comparison is allowed and can be useful. The FTC supports truthful comparative advertising when the basis is clear. CAP guidance requires documentary evidence for objective claims and evidence about both the advertiser and the relevant competitors for objective comparisons.

### 8. Never turn sample data into a production claim

Do not let demo dashboards, mock product screens, sample feeds, or placeholder results create the impression of live product functionality or real customer outcomes. Ban labels such as `Live`, `Real-time`, `Verified`, `Online`, `Synced`, or `Updated now` unless the displayed state is actually connected to reliable data.

Never remove a `Sample data`, `Prototype`, or `Demo` marker simply because it makes a screenshot look less polished.

### 9. Never disguise advertising, sponsorship, or material relationships

Do not present sponsored copy as independent editorial judgment. Disclose paid, gifted, affiliate, employee, family, ownership, or other material connections clearly where they could affect credibility. Do not rely on an obscure footer or a platform disclosure that users can easily miss.

Endorsements must reflect honest experience. A testimonial cannot make a claim the advertiser could not substantiate directly. Atypical success stories need an accurate account of what users can generally expect; `results may vary` is not a reliable substitute.

### 10. Never mass-publish low-value AI pages for search manipulation

Ban:

- keyword stuffing;
- many near-duplicate location, service, comparison, or FAQ pages with no distinct value;
- stitched or paraphrased summaries that add no original information;
- content that makes little sense but contains target queries;
- false dates or superficial edits used to appear fresh;
- pages promising answers, prices, release dates, or availability that are not known;
- auto-generated pages created mainly to capture search traffic rather than help the visitor.

Google's spam policy defines scaled content abuse as creating many pages primarily to manipulate rankings rather than help users, regardless of whether AI or another method created them. Google does not ban AI-assisted content as such; it asks for original, accurate, people-first work that adds value.

## Rules that depend on context and proof

### Subjective brand language

Statements such as `made for careful teams`, `a calmer way to plan`, or `designed to feel effortless` may be acceptable when they are clearly positioning rather than measurable promises. They become proof-bearing claims when context makes them concrete, such as `the easiest`, `effortless migration`, or `setup in five minutes`.

Use subjective copy sparingly. Prefer a specific product truth over empty superlatives.

### Superlatives and market-position claims

`Best`, `fastest`, `leading`, `most trusted`, and `No. 1` are not decorative adjectives. They commonly imply an objective comparison. Use them only when the intended market, metric, time period, evidence, and verification path are defined. If the proof does not cover the full implication, narrow the claim.

### Customer and partner logos

Use a logo only when the relationship is real, current enough, authorized for the intended use, and accurately labeled. A vendor, integration, investor, customer, and press mention are different relationships; do not collapse them into `Trusted by`.

In private design prototypes, prefer generic logo slots rather than recognizable third-party marks unless the user explicitly provided or requested those assets.

### Testimonials and case studies

Use only supplied or verified material. Preserve meaning when editing for length. Record who approved the quote, what relationship exists, whether compensation or incentives were involved, and whether the result is typical. Do not combine several interviews into one fictional speaker.

### Comparisons

Comparison pages are acceptable when the comparison is relevant, current, representative, and checkable. State the compared tiers, region, date, tested conditions, method, and source. Separate measured facts from editorial judgments.

### Guarantees and commitments

Guarantees can be strong copy when operations, policy, and legal terms support them. The copy must match the real remedy. `Cancel anytime` requires an actual accessible cancellation path; `no credit card` requires that none is requested; `free` must not hide unavoidable charges beyond those the applicable rules permit.

### Real urgency

Urgency is acceptable when it reflects a real deadline, inventory constraint, event capacity, regulatory cutoff, or expiring offer. The system must use the actual date or condition, avoid emotional pressure, and stop showing the message when it is no longer true.

### AI and automation disclosure

Do not add a generic `AI-generated` label to every page by default. Consider disclosure when readers would reasonably care how high-impact, expert, review, research, or substantially automated content was produced. Google recommends asking who created content, how it was created, and why, and notes that automation disclosure is useful where readers would reasonably expect it.

## Safe mock and placeholder policy

### Allowed states

| Delivery state | Sample content | Required treatment |
| --- | --- | --- |
| Internal wireframe | Allowed | Use obvious labels or tokens; do not use real third-party identities without permission. |
| Password-protected prototype | Allowed | Add a persistent `Prototype` or `Sample data` marker; avoid indexable public access; maintain a replacement list. |
| Public design demo | Limited | Mark the entire experience as a concept/demo and mark sensitive proof elements locally; no plausible fake endorsements or deceptive commerce. |
| Production website | Not as evidence | Replace with verified content, omit the block, or explicitly present a real product demo as sample data. |

GOV.UK guidance recommends protecting published prototypes so the public does not mistake them for a real service. That principle applies broadly: the more realistic the prototype, the clearer its status must be.

### Preferred placeholder forms

Use placeholders that communicate type and approximate layout without impersonating evidence:

- `[Customer logo - approval required]`
- `[Verified testimonial, 20-35 words]`
- `[Metric: value + definition + time period + source]`
- `[Current plan price]`
- `[Comparison source and review date]`
- `[Guarantee terms approved by owner/legal]`
- `Sample data`
- `Demo account`
- `Prototype - not a live service`

Avoid polished fictional substitutes such as a believable person, invented company, realistic quote, five-star score, fake award badge, or plausible performance metric. Those are not placeholders; they are fabricated proof.

### When sample values are necessary for interaction design

If a chart, table, filter, or calculation cannot be designed without values:

1. label the whole component `Sample data`;
2. use clearly synthetic names or neutral identifiers such as `Example A`;
3. avoid real brands and people;
4. avoid claims about the product's actual performance;
5. keep the source data separate from production data;
6. include every sample field in the handoff replacement list;
7. block launch while production-facing sample evidence remains.

### Empty is better than deceptive

When no verified content exists, choose in this order:

1. omit the unsupported section;
2. show an explicit placeholder in a design artifact;
3. show a clearly labeled sample state when interaction design requires it;
4. never invent a realistic substitute and hope it will be replaced later.

## Verification workflow

### Step 1: Build a claim register

Before final copy review, extract every statement that could be checked or relied upon. Include claims in body copy, headings, CTAs, footnotes, metadata, structured data, charts, product mockups, badges, alt text, testimonials, and comparison tables.

Minimum fields:

| Field | Required record |
| --- | --- |
| Claim ID | Stable identifier |
| Exact copy | The words the visitor will see |
| Implied meaning | What a reasonable visitor may conclude |
| Claim type | Objective, testimonial, comparison, guarantee, scarcity, price, subjective, or sample |
| Evidence | Direct source, owner, document, dataset, test, or policy |
| Scope | Product tier, market, audience, conditions, and exclusions |
| Time basis | Measurement period and review/expiry date |
| Qualification | Necessary nearby limitation or disclosure |
| Approver | Business owner, subject-matter expert, legal/compliance, or customer |
| Status | Verified, needs revision, placeholder, omit, or blocked |

### Step 2: Review the net impression

Do not verify isolated words only. Review the combined impression created by headline, image, number, badge, chart, CTA, and nearby omissions. Ask:

- What would a reasonable visitor think is being promised?
- Does the design visually overstate a narrower footnote?
- Does a customer quote imply typical results?
- Does `live` imply a backend connection that does not exist?
- Does the comparison appear comprehensive when it is selective?

### Step 3: Match evidence to the exact claim

Evidence must support the communicated claim, not a vaguely related claim. Confirm:

- source identity and authority;
- date and continued validity;
- methodology and sample where relevant;
- product version, tier, country, and tested conditions;
- whether a percentage is absolute or relative;
- whether a result is average, median, range, best case, or selected example;
- whether the comparison covers the market implied by the copy;
- permission and material connections for endorsements and logos.

Higher-risk health, safety, financial, legal, environmental, and child-directed claims require specialist and legal review. FTC guidance notes that health and safety claims commonly require competent and reliable scientific evidence.

### Step 4: Rewrite or qualify before designing around the claim

If the evidence is narrower than the copy, narrow the copy. Put material qualifications next to the claim in readable language and test them at mobile width. Do not rely on a disclosure that contradicts the main message.

### Step 5: Fact-check the full rendered page

Run a final human review after content is placed in the interface. Check links, footnotes, chart labels, logos, dates, prices, CTA destinations, form promises, cancellation language, and responsive visibility. Search for sample markers and placeholder tokens. Confirm that no production claim is supported only by another AI-generated page.

### Step 6: Set an owner and review date

Claims age. Assign an owner and expiry/review date to prices, product counts, integrations, benchmarks, market-position claims, awards, policies, and comparisons. Remove or revise claims when evidence expires.

## SEO-quality controls

AI assistance is not itself an SEO violation. Low-value, unoriginal, misleading, or mass-generated output is the risk. Before publication:

- ensure the page serves a real visitor task, not merely a keyword;
- add original knowledge, evidence, analysis, demonstration, or useful functionality;
- remove repeated generic paragraphs that could appear on any competitor site;
- use a descriptive page title and heading without shock or exaggeration;
- check spelling, grammar, links, factual accuracy, and internal consistency;
- identify the author or responsible organization where readers would expect it;
- describe methods for reviews, tests, or research where they affect trust;
- do not create pages to meet an imagined preferred word count;
- do not change dates unless the content materially changed;
- do not publish many pages that differ only by keyword, location, or product name;
- exclude unfinished, placeholder-heavy, or intentionally low-value pages from search.

Google's people-first guidance emphasizes original value, clear sourcing, expertise, accurate authorship, and freedom from easily verified factual errors. Its spam policies prohibit scaled content abuse, keyword stuffing, and misleading functionality.

## Handoff checklist

### Evidence complete

- [ ] Every objective or implied claim appears in the claim register.
- [ ] Evidence existed before publication and supports the exact wording.
- [ ] Metrics include definition, scope, period, and source.
- [ ] Comparisons include basis, relevant competitors, date, and method.
- [ ] Superlatives and market-position claims are verified or removed.
- [ ] Health, safety, finance, legal, environmental, and other high-risk claims received specialist review.

### Social proof complete

- [ ] Every person, company, logo, quote, review, rating, award, and credential is real.
- [ ] Permission or approval is recorded where needed.
- [ ] Material relationships and incentives are disclosed clearly.
- [ ] Testimonials preserve the speaker's meaning and do not imply unsupported typical results.
- [ ] No AI-generated person or company is presented as a real endorser.

### Offer integrity complete

- [ ] Prices, discounts, availability, deadlines, and inventory are current.
- [ ] Countdown timers and activity indicators use real data and do not reset deceptively.
- [ ] Guarantees, refunds, warranties, cancellation, trials, and renewals match actual operations.
- [ ] Material conditions appear close to the relevant claim and remain readable on mobile.
- [ ] `Free`, `risk-free`, `live`, `real-time`, `verified`, and similar terms are literally accurate.

### Mock-content cleanup complete

- [ ] All prototype and sample content is clearly marked.
- [ ] No fictional evidence can be mistaken for a real claim.
- [ ] Placeholder tokens have been searched globally.
- [ ] Public prototypes cannot be mistaken for the live service.
- [ ] Every unresolved replacement appears in the final `Still needed` report.

### Search and publishing complete

- [ ] The page adds original value and serves a real visitor need.
- [ ] Titles and headings accurately summarize the page.
- [ ] Facts, names, dates, links, metadata, and structured data were checked.
- [ ] Authorship and method information is present where expected.
- [ ] Unfinished or low-value generated pages are not indexable.
- [ ] Time-sensitive claims have an owner and next review date.

## Required `Still needed` handoff format

Never silently leave unresolved proof work in the design. End the delivery with a concise list like this:

```markdown
## Still needed before launch

- Replace `[Customer logo]` with approved assets and confirm the relationship label.
- Supply evidence, definition, and measurement period for the `40% faster` claim; otherwise remove it.
- Obtain written approval for the customer quote and disclose any material relationship.
- Connect the stock counter to reliable inventory or remove the urgency message.
- Confirm the refund period and exclusions with the policy owner.
- Replace all sample dashboard data and remove the `Sample data` state only after verification.
```

If an unresolved item can materially mislead a visitor, it is a launch blocker, not a minor TODO.

## Source basis

Primary and official guidance used for this report:

- [FTC: Advertising FAQs - truth, deception, substantiation, endorsements, guarantees, and disclosures](https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business)
- [FTC Policy Statement Regarding Advertising Substantiation](https://www.ftc.gov/legal-library/browse/ftc-policy-statement-regarding-advertising-substantiation)
- [FTC: Consumer Reviews and Testimonials Rule - Questions and Answers](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers)
- [FTC: Final Rule Banning Fake Reviews and Testimonials](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)
- [FTC: Endorsements, Influencers, and Reviews](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)
- [FTC: Dot Com Disclosures update](https://www.ftc.gov/news-events/news/press-releases/2013/03/ftc-staff-revises-online-advertising-disclosure-guidelines)
- [FTC: Bringing Dark Patterns to Light](https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf)
- [FTC: Statement of Policy Regarding Comparative Advertising](https://www.ftc.gov/legal-library/browse/statement-policy-regarding-comparative-advertising)
- [FTC: Businessperson's Guide to Federal Warranty Law](https://www.ftc.gov/business-guidance/resources/businesspersons-guide-federal-warranty-law)
- [EUR-Lex: Unfair Commercial Practices Directive, consolidated version in force on 28 May 2022](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02005L0029-20220528)
- [ASA/CAP: Substantiation](https://www.asa.org.uk/advice-online/substantiation.html)
- [ASA/CAP: Comparisons - General](https://www.asa.org.uk/advice-online/comparisons-general.html)
- [ASA/CAP: Comparisons - Verifiability](https://www.asa.org.uk/advice-online/comparisons-verifiability.html)
- [ASA/CAP: No. 1 claims](https://www.asa.org.uk/advice-online/types-of-claims-no-1.html)
- [Google Search Central: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Search Central: Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google Search Central: Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- [GOV.UK Service Manual: Making prototypes](https://www.gov.uk/service-manual/design/making-prototypes)

