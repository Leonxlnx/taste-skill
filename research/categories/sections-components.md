# Website Sections and Reusable Component Families

*Researched 2026-07-18. Scope: portfolios, general websites, marketing sites, and landing pages. This is an information-and-function taxonomy, not a gallery of visual arrangements.*

## Executive summary

A useful website catalog should classify an item by the question it answers or the task it enables. It should not make `split`, `centered`, `bento`, `card grid`, `marquee`, `sticky`, or `carousel` top-level categories. Those words describe composition or behavior and can be applied to many unrelated information jobs.

This report defines five catalog levels:

1. **Section**: a page-scale region that advances the page's information sequence and usually has its own heading or landmark.
2. **Composite block**: a reusable cluster inside a section that completes one subtask by combining components and primitives.
3. **Component**: a reusable interface unit with a defined contract, content model, states, and often interaction semantics.
4. **Primitive**: the lowest owned semantic, content, or layout unit used to build components. In this catalog this includes text, heading, link, button control, image, icon, list, field, container, divider, and similar leaves.
5. **Behavior**: reusable interaction or state logic applied to one or more structures, such as disclosure, tabs, filtering, pagination, sticky positioning, validation, or autoplay. A behavior is not a content category.

The level is contextual rather than metaphysical. A button can be treated as a leaf primitive by a page-block catalog while remaining a fully documented component in a design system. What matters is that one catalog entry declares one level and its dependencies explicitly.

The proposed top-level section families are:

- Navigation and orientation
- Hero and introduction
- Proof and trust
- Work and showcase
- Features, capabilities, and use cases
- Process and sequence
- Comparison and decision support
- Pricing and offer
- Content and editorial
- Data and evidence display
- Team and about
- Integrations and ecosystem
- Forms and task completion
- FAQ and disclosure
- Calls to action
- Footer and site closure
- Utility and cross-page service
- System states and feedback

These families cover common portfolio, institutional, editorial, service, commerce, and product-marketing pages without assuming that every page needs every family. USWDS explicitly warns implementers to remove unnecessary template elements and not add content merely to fill a landing-page template ([USWDS landing-page template](https://designsystem.digital.gov/templates/landing-page/)).

## 1. Classification model

### 1.1 Classify by primary job

Give each entry one primary family. Add secondary relations as tags, not duplicate entries.

Use this decision order:

1. What reader question does the item answer?
2. What task can the reader complete with it?
3. What content must exist for it to be truthful and useful?
4. What is its smallest reusable level?
5. Only then, how may it be composed or behave?

Examples:

| Visible object | Primary classification | Reason |
| --- | --- | --- |
| Customer-logo row | Proof and trust | It claims adoption or association. |
| Integration-logo row | Integrations and ecosystem | It communicates compatibility. |
| Press-logo row with article links | Proof and trust | It communicates independent coverage. |
| Gridded project thumbnails | Work and showcase | The grid is incidental; the job is to expose work. |
| Gridded feature cards | Features and capabilities | Same shape, different information job. |
| Accordion of buyer questions | FAQ and disclosure | Accordion is the behavior, not the family. |
| Accordion of product features | Features and capabilities | Same behavior, different information job. |
| Three pricing cards | Pricing and offer | Cards are the presentation; plan choice is the job. |
| Live uptime percentage | System state or data | It reports current operational state, not generic social proof. |
| Historical growth percentage in a case study | Proof and trust | It supports an outcome claim. |
| Timeline of company milestones | Team and about | It tells organizational history. |
| Timeline of steps a customer must take | Process and sequence | It explains required action and order. |

### 1.2 Job-distinct variants only

A variant belongs in the taxonomy only when it changes at least one of these:

- the user question answered;
- the action enabled;
- required content or evidence;
- semantic or accessibility contract;
- state model;
- placement rule in the information sequence.

Centered versus left-aligned, light versus dark, image-left versus image-right, three versus four columns, rounded versus square, and static versus animated are not taxonomy variants. Record them as composition, styling, or behavior metadata.

### 1.3 Section versus block versus component

| Level | Test | Typical examples |
| --- | --- | --- |
| Section | Removing it removes a distinct page argument, task, or landmark. | Hero, selected work, pricing, team, FAQ, footer. |
| Composite block | It completes one subtask but normally lives within a larger region. | Testimonial with attribution, plan summary, case-study result block, contact-method group. |
| Component | It has a reusable API and a finite state/interaction contract. | Tabs, pagination, search box, modal, table, input, carousel. |
| Primitive | It is a leaf dependency with little domain meaning alone. | Heading, paragraph, link, button, icon, image, list, field, divider. |
| Behavior | It changes interaction, sequencing, or state across structures. | Disclosure, filter, sort, validate, reveal, pin, auto-advance. |

This separation follows current design-system usage. GOV.UK calls components reusable parts of a user interface and patterns best-practice solutions for user-focused tasks and page types ([components](https://design-system.service.gov.uk/components/), [patterns](https://design-system.service.gov.uk/patterns/)). Carbon similarly defines components as units solving specific UI problems, while patterns are reusable combinations of components and templates that help a user achieve a goal ([components](https://carbondesignsystem.com/components/overview/components/), [patterns](https://carbondesignsystem.com/patterns/overview/)).

## 2. Section and composite-block taxonomy

The tables below list section families and the job-distinct block families that may implement them. `S` means section, `B` composite block, and `C` component. A block can be promoted to a section when it becomes a page-scale argument with its own heading and sequence position.

### 2.1 Navigation and orientation

**Primary job:** tell people where they are, what destinations exist, and how to move to the next relevant location.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Global site navigation | S/B | Expose the site's stable top-level destinations and home identity. | Marketing-site navigation; portfolio navigation; authenticated product navigation; store navigation. The difference is destination model and session context, not header shape. |
| Local or sectional navigation | B/C | Move among sibling areas within a product, topic, document, or long page. | Subnavigation; table of contents; anchor index; side navigation; tabs when content changes in place. |
| Hierarchy trail | B/C | Show the current page's ancestry and allow movement upward. | Breadcrumb trail; taxonomy trail. |
| Result-set navigation | B/C | Move through a large ordered collection. | Pagination; previous/next item; alphabetic index; date archive navigation. |
| Search and discovery entry | B/C | Let users state an information need and reach matching content. | Site search; scoped search; command/search palette; directory search. Search results belong to content/data, while the input belongs here or under forms. |
| Context and session controls | B/C | Change account, workspace, language, region, or display context. | Account menu; workspace switcher; language/locale switcher; theme control when the site supports a genuine preference. |
| Skip and landmark navigation | C | Bypass repeated content or move directly among major page regions. | Skip link; back-to-top link on genuinely long documents; landmark jump menu. |

Do not create separate families for sticky, transparent, glass, centered-logo, sidebar, hamburger, mega-menu, or dock navigation. Those are composition or behavior variants. MDN defines `<nav>` by its purpose, a major section of navigation links, not by placement or appearance ([MDN `nav`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav)).

### 2.2 Hero and introduction

**Primary job:** orient the first-time reader to the subject and establish the next useful action.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Site or brand introduction | S | Identify the organization, practice, or person and what it is for. | Company/studio intro; personal portfolio intro; institution intro. |
| Offer or product proposition | S | State what is offered, for whom, the relevant value, and the primary action. | Product landing hero; service offer hero; campaign or launch hero; event registration hero. |
| Page or topic header | S/B | Name and scope an interior page so the visitor can interpret what follows. | Section landing header; collection header; search-results header; documentation topic header. |
| Editorial header | S/B | Establish an article's title, authorship, date, deck, and publication context. | Article; report; case-study narrative; release note. |
| Task-first introduction | S | Start with the user's primary task rather than a marketing proposition. | Search-first directory; application start page; donation/booking start; calculator or tool entry. |
| Proof-first introduction | S | Establish legitimacy before asking for attention or action when trust is the first barrier. | Portfolio work lead; case-study lead; regulated-service credential lead. Proof must be real and attributable. |

Headline + subhead + actions, media + copy, manifesto type, video background, split screen, and full-bleed image are compositions. They are not separate information families. A hero may contain a compact proof or form block, but that does not make customer logos or the form part of the hero taxonomy.

### 2.3 Proof and trust

**Primary job:** supply attributable evidence that reduces uncertainty about credibility, quality, safety, fit, or outcomes.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Adoption proof | S/B | Show that identifiable customers, clients, members, or users have a real relationship with the subject. | Customer list/logo set; client roster; adoption count with source and date. |
| Testimonial or review | S/B | Present a person's or organization's attributed evaluation. | Customer quote; peer review; user review summary; video testimonial; reference contact. Required blocks: quotation, identity, relationship, context, provenance. |
| Outcome evidence | S/B | Demonstrate a measurable result caused or enabled by the work. | Case-study metric; before/after result; benchmark; portfolio impact statement. Required: baseline or comparison, measure, period, source. |
| Case-study proof | S/B | Connect a problem, intervention, decisions, and outcome in enough detail to evaluate the claim. | Featured case study; mini case-study; linked project result. |
| Independent validation | S/B | Show third-party attention or assessment. | Press coverage; award; analyst recognition; third-party rating; published citation. Link to the source. |
| Credential and assurance | S/B | Demonstrate qualification, compliance, security, or policy commitments. | Certification; accreditation; license; warranty; security/compliance statement; privacy assurance. |
| Reputation and relationship proof | B | State the exact external relationship without implying the wrong one. | Investor/backer; partner; community member; open-source adoption; conference speaker. The relationship label is mandatory. |
| Demonstration as proof | S/B | Let the artifact itself prove quality or existence. | Live product demo; playable prototype; code sample; design artifact; interactive result. |

Logo clouds, star rows, quote cards, counters, marquees, and badge strips are presentations. The relationship and provenance determine the family. Fabricated proof should never be generated to complete a template.

### 2.4 Work and showcase

**Primary job:** let people inspect created work, products, artifacts, or transformations and choose what to explore.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Selected work | S | Present a curated set that represents range, relevance, or quality. | Featured projects; flagship products; selected clients with deliverables; highlighted writing. |
| Work index or archive | S | Support browsing a larger corpus. | Project index; gallery; product catalog preview; article portfolio; media library. Search/filter behavior may be attached. |
| Project preview | B | Give enough identity and context to choose whether to open one item. | Thumbnail or media, title, role/type, date, concise outcome, link. Card/list/tile is presentation. |
| Case-study narrative | S | Explain context, constraints, decisions, contribution, artifact, and result. | Design case study; engineering project; client engagement; research study. |
| Artifact viewer | S/B/C | Let a visitor inspect the work at useful fidelity. | Image gallery; video reel; prototype embed; code example; document viewer; audio player. |
| Product or experience demonstration | S/B | Show what an offering looks like or how it behaves. | Annotated screenshot; task walkthrough; controlled demo; before/after artifact; sample output. |
| Transformation showcase | S/B | Make a material change inspectable. | Before/after comparison; redesign diff; restoration; optimization result. If the primary purpose is to substantiate a claim, classify under proof and relate it here. |

Masonry, carousel, horizontal scroll, hover reveal, device frame, and browser frame are presentation or behavior fields. A “portfolio card” is usually a project-preview block composed from media, metadata, and a link.

### 2.5 Features, capabilities, services, and use cases

**Primary job:** explain what the subject can do, how it creates value, and whether it fits a user's needs.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Outcome or benefit explanation | S/B | Explain the useful change for the audience. | Benefit statement; outcome cluster; value driver. It should connect outcome to mechanism or evidence. |
| Capability or feature inventory | S/B | Enumerate distinct abilities for scanning and routing. | Product features; service capabilities; practice areas; deliverables. |
| Capability detail | S/B | Explain one ability, how it works, and its constraints. | Feature deep dive; service detail; technical capability; annotated UI. |
| Use-case or job routing | S/B | Help a visitor find the relevant path by goal, role, industry, or situation. | “For designers”; “For enterprise”; task entry; scenario selector. Personas only when evidence supports them. |
| Mechanism or architecture | S/B | Explain why the offering works or how parts fit together. | System diagram; technical architecture; methodology mechanism; model explanation. |
| Specification and requirement | S/B | Expose objective attributes needed for fit or procurement. | Technical specs; supported formats; dimensions; prerequisites; service boundaries; SLA summary. |
| Service scope and deliverables | S/B | Clarify what work is performed and what the buyer receives. | Engagement scope; deliverables list; inclusions/exclusions; optional add-ons. |
| Limitation and fit statement | B | State what the offering does not do or who should not choose it. | Constraints; unsupported cases; not-for-you block; availability boundary. |

Feature grid, bento grid, icon cards, alternating image/text rows, sticky scrollytelling, and tabbed panels are composition or behavior options. Tailwind Plus itself lists “Feature Sections” and “Bento Grids” separately, which is useful as a market inventory but demonstrates why shape-based catalogs duplicate the same information job ([Tailwind Plus marketing sections](https://tailwindcss.com/plus/ui-blocks/marketing/sections/faq-sections), [bento grids](https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids)).

### 2.6 Process and sequence

**Primary job:** make order, effort, responsibility, timing, or progress understandable.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| User action sequence | S/B | Explain the steps a user must complete. | Setup; onboarding; application; purchase; migration; submission. Each step needs an action and result. |
| Service engagement process | S/B | Set expectations about collaboration, responsibilities, deliverables, and timing. | Discovery-to-delivery; consulting engagement; creative process; support escalation. |
| Product workflow | S/B | Explain how information or work moves through a system. | Input-process-output; approval flow; automation workflow; data pipeline. |
| Time-based plan | S/B | Show stages anchored to time, milestones, or dependencies. | Delivery timeline; event schedule; implementation plan; roadmap when it is a genuine commitment. |
| Progress representation | B/C | Show the user's current position in an active journey. | Step indicator; progress tracker; completion checklist. This is stateful and differs from a marketing “how it works” explanation. |
| Method or principle sequence | S/B | Explain an ordered reasoning or operating method. | Research method; decision framework; editorial process. Use only if order matters. |

Numbered cards, connector lines, timelines, horizontal steppers, and sticky sequences are presentations. If order does not matter, the content belongs under capabilities, principles, or about instead.

### 2.7 Comparison and decision support

**Primary job:** help a person choose among alternatives or understand a meaningful difference.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Option comparison | S/B | Compare first-party products, packages, plans, or configurations on consistent criteria. | Product matrix; plan matrix; package comparison; size/spec comparison. |
| Named competitor comparison | S/B | Compare alternatives using verifiable, dated criteria and honest tradeoffs. | Versus page; alternatives page; migration comparison. |
| Status-quo comparison | S/B | Compare the proposed approach with the current process or doing nothing. | Old/new workflow; manual/automated; build/buy. |
| Before/after inspection | S/B/C | Let the reader compare two states of the same subject. | Image slider; artifact diff; performance delta; content revision. |
| Decision guide | S/B | Route a person based on requirements and tradeoffs. | “Choose X if”; recommendation flow; eligibility checker; plan selector. |
| Criteria explanation | B | Explain why each comparison dimension matters and how it was measured. | Method note; definitions; source/date block; caveat. |

A table, cards, side-by-side panels, sliders, checkmarks, and highlighted columns are presentation/components. Pricing is a separate primary family when the central job is understanding cost or buying; it may use a comparison block as a dependency.

### 2.8 Pricing and offer

**Primary job:** make the commercial or exchange terms understandable enough to choose or act.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Single offer | S/B | Present one product, service, ticket, membership, or donation ask with price and terms. | Fixed price; starting price; pay-what-you-want; donation amount. |
| Plan or tier selection | S | Let people choose among recurring or packaged options. | Subscription plans; membership levels; service packages; usage tiers. |
| Quote or estimate path | S/B | Explain what determines price and collect enough information for a quote. | Contact-for-price; estimate builder; project scoping; enterprise quote. |
| Usage and unit pricing | S/B | Explain variable cost based on consumption, quantity, seats, or transactions. | Rate card; volume bands; per-seat price; calculator. |
| Included, excluded, and add-on scope | B | Clarify what the price covers and what changes it. | Inclusions; exclusions; add-ons; limits; overage. |
| Terms and risk reversal | B | Explain billing, cancellation, refund, trial, guarantee, tax, and renewal terms. | Billing-period terms; cancellation; free trial; warranty; refund. |
| Promotion or limited offer | S/B | Explain a real time- or eligibility-bound exception to normal terms. | Launch offer; seasonal promotion; nonprofit discount; student pricing. Requires dates/eligibility. |

Pricing cards, toggles, comparison tables, calculators, and badges are components or presentations. Monthly/annual is a meaningful variant only when it changes billing terms and values, not when it is a cosmetic toggle.

### 2.9 Content and editorial

**Primary job:** publish, organize, and route durable informational content.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Featured content | S/B | Prioritize one or a few timely or important items. | Lead article; featured report; highlighted resource; editorial package. |
| Content collection | S/B | Present related articles, resources, events, or documents with useful metadata. | Latest posts; topic collection; resource list; event listing; publication series. |
| Archive or index | S | Support browsing a large corpus by date, type, author, or topic. | Blog archive; knowledge base; document library; changelog index. |
| Article or longform body | S | Deliver a self-contained piece of content with navigable structure. | Article; essay; guide; report; documentation page; transcript. |
| Content metadata and provenance | B | Establish title, author, date, update status, reading context, and source. | Byline; publication date; update note; tags; license; citations. |
| Related and next content | S/B | Continue a meaningful content journey. | Related reading; previous/next article; series navigation; references. |
| Taxonomy and topic routing | S/B | Expose subject classification and let readers browse it. | Topic directory; category landing; tag index; glossary. |
| Release and change communication | S/B | Record what changed, when, and its impact. | Changelog; release notes; newsroom updates; status history. |

USWDS defines a collection by the job of presenting related items with links, descriptions, and metadata, and recommends an archive/search experience for larger catalogs rather than forcing everything into one component ([USWDS collection](https://designsystem.digital.gov/components/collection/)). Feed, list, grid, magazine layout, and cards are presentation options.

### 2.10 Data and evidence display

**Primary job:** communicate quantitative, structured, geographic, or temporal information accurately enough to interpret or act on.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Key metric | S/B | Surface one or a few measures with definition, unit, period, and source. | KPI; benchmark; portfolio outcome metric; live operational metric. |
| Tabular data | S/B/C | Compare exact values across rows and columns. | Static table; sortable/filterable data table; specification table; ranking. |
| Chart or plot | S/B/C | Reveal pattern, relationship, distribution, or change. | Trend; comparison; composition; distribution; correlation. Chart type is subordinate to analytical question. |
| Geographic data | S/B/C | Relate information to place. | Map; coverage map; location finder; route; region comparison. |
| Status and progress data | S/B/C | Show a measured condition against a target or threshold. | Progress bar; quota; goal; service status; capacity. |
| Data summary and annotation | B | Explain what the data means, where it came from, and its limits. | Caption; source note; methodology; definition; last-updated marker; confidence or caveat. |
| Dashboard or monitoring view | S | Combine related measures for repeated monitoring and diagnosis. | Public transparency dashboard; status dashboard; campaign results; report summary. |

A four-number “stats strip” is not a distinct family. Classify it as outcome proof when it supports a claim, key metrics when it neutrally reports data, or status when it reflects a live condition. Atlassian distinguishes basic tables from dynamic tables with sorting, pagination, and reordering, illustrating that behavior and task requirements change the component contract ([Atlassian dynamic table](https://atlassian.design/components/dynamic-table)).

### 2.11 Team and about

**Primary job:** explain who is responsible, why the organization exists, how it works, and whether the reader wants a relationship with it.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Mission and organizational story | S | Explain purpose, origin, context, and direction. | Founder story; institution history; studio point of view; nonprofit mission. |
| Person profile | B/S | Establish one person's role, expertise, identity, and relevant work. | Team profile; author bio; speaker profile; practitioner profile. |
| Team directory | S | Show the people responsible and enable relevant contact or exploration. | Leadership; whole team; departments; contributors; advisors. |
| Values and operating principles | S/B | Explain standards that materially shape decisions or behavior. | Values with evidence; design principles; service commitments. |
| History and milestones | S/B | Explain material organizational change over time. | Timeline; major launches; ownership/history; institutional milestones. |
| Governance and accountability | S/B | Show decision-makers, ownership, policies, or reporting structure. | Board; advisors; public accountability; funding; governance model. |
| Culture and careers | S/B | Help prospective collaborators evaluate work environment and openings. | Culture evidence; benefits; open roles; hiring process; workplace policies. |
| Location and presence | S/B | Explain where and when the organization can be reached or served. | Office/studio location; service area; hours; remote/distributed model. |

Headshot grids, founder letters, timelines, maps, and culture galleries are presentations or blocks. A “values card grid” earns a separate block only when the content contract requires evidence of behavior, not merely a different card style.

### 2.12 Integrations and ecosystem

**Primary job:** explain interoperability, extension points, and external relationships relevant to using the product or service.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Ecosystem overview | S | Communicate the breadth and types of systems that connect. | Integration categories; platform ecosystem; partner landscape. |
| Integration directory | S | Support finding a specific connector or partner. | Searchable catalog; category index; popular/new integrations. |
| Integration preview | B | Summarize one connection and route to setup or detail. | Logo/name, supported job, direction of data flow, availability, link. |
| Integration detail | S | Explain what connects, supported objects/actions, requirements, setup, and limits. | Native connector; third-party connector; import/export path. |
| Compatibility statement | S/B | State supported platforms, formats, devices, browsers, or standards. | Works-with list; supported formats; system requirements; compatibility matrix. |
| Developer and extension entry | S/B | Route technical users to APIs, SDKs, webhooks, plugins, or documentation. | API overview; SDK list; marketplace submission; developer CTA. |
| Partner relationship | S/B | Explain a commercial, implementation, or technology-partner program. | Solution partner; reseller; implementation partner; affiliate. |

An integration logo wall is not social proof unless the claim is adoption. Required relationship labels prevent “works with,” “used by,” and “partnered with” from collapsing into one misleading visual.

### 2.13 Forms and task completion

**Primary job:** collect user input to complete a stated task.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Contact or lead form | S/B | Start a conversation with enough routing context. | General contact; sales inquiry; project brief; press inquiry. |
| Subscription or signup | S/B | Establish an ongoing content, account, waitlist, or membership relationship. | Newsletter; account registration; waitlist; membership. |
| Search and filter form | S/B/C | Express retrieval criteria and update a result set. | Site search; resource filters; directory filters; location finder. |
| Booking or application | S | Gather structured information needed to reserve, assess, or schedule. | Appointment; event registration; job application; program application. |
| Quote, calculator, or configuration | S | Collect variables and return a price, recommendation, or configuration. | Estimate; eligibility; plan selector; product configurator. |
| Purchase, donation, or payment | S | Complete a financial transaction with clear review and confirmation. | Checkout; donation; ticket purchase; invoice payment. |
| Feedback, support, or report | S/B | Capture an issue, evaluation, correction, or request. | Support ticket; bug report; page feedback; complaint; accessibility report. |
| Authentication and recovery | S | Establish or recover identity and authorization. | Sign in; password reset; verification; access request. |
| File or content submission | S/B | Transfer an artifact with metadata and constraints. | Upload; portfolio submission; document intake; import. |

Fields, labels, hints, error messages, buttons, fieldsets, uploaders, date inputs, consent controls, and summaries are components/primitives. Multi-step, autosave, conditional reveal, inline validation, and review-before-submit are behaviors. GOV.UK's component inventory is a strong current reference for form leaves and error handling ([GOV.UK components](https://design-system.service.gov.uk/components/)).

### 2.14 FAQ and disclosure

**Primary job:** reveal secondary, conditional, detailed, or objection-handling information without pretending it is the page's main argument.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Frequently asked questions | S/B | Answer real recurring questions in the audience's language. | Product questions; buyer objections; service logistics; policy questions. |
| Specification disclosure | B | Expose technical or operational detail needed by a subset of readers. | Full specs; requirements; data fields; compatibility detail. |
| Policy and terms disclosure | S/B | Make rules, rights, obligations, or legal terms accessible. | Refund policy; warranty; privacy summary; eligibility; fine print. |
| Help and troubleshooting disclosure | S/B | Reveal diagnosis or resolution steps. | Troubleshooting guide; known issue; setup help; recovery path. |
| Definition and glossary | S/B | Explain domain terms needed to interpret the page. | Inline definition; glossary list; acronym expansion. |
| Source and methodology disclosure | B | Let readers inspect evidence, calculations, assumptions, or provenance. | Footnote; citation list; method note; data caveat. |

Accordion, `<details>`, popover, dialog, tabs, and inline expansion are behavior/component choices. Native `<details>` already provides a disclosure widget with a required `<summary>` label ([MDN `details`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details)); custom accordions must follow their own keyboard and state contract ([WAI-ARIA APG accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)).

### 2.15 Calls to action

**Primary job:** create a clear decision point after the reader has enough context to act.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Primary conversion | S/B | Ask for the page's principal transaction or commitment. | Buy; start trial; book; apply; donate; register. |
| Contact or consultation | S/B | Open a human-assisted path. | Contact; schedule; request demo; request quote. |
| Lead-magnet or resource action | S/B | Exchange attention or information for a useful artifact. | Download; template; report; webinar registration. |
| Continuation action | B | Route to the next relevant piece of content or deeper evaluation. | View work; read case study; see documentation; compare plans. |
| Alternative path | B | Offer a materially different route for people not ready or eligible for the primary action. | Self-serve versus sales; subscribe versus buy; browse versus contact. |
| Completion or next-step action | S/B | Tell the user what to do after success or the end of content. | Confirmation next step; post-download action; article-series continuation. |

A button inside another section remains a component. It becomes a CTA section only when the page region's primary information job is the decision itself. Centered bands, split bands, full-bleed color fields, and sticky bottom bars are compositions or behaviors.

### 2.16 Footer and site closure

**Primary job:** close the page with stable site-wide wayfinding, identity, accountability, and required utility information.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Global site footer | S | Provide stable secondary navigation and organizational identity. | Compact footer; sitemap footer; institutional footer. Size is composition, not job. |
| Legal and ownership block | B | State copyright, legal entity, policies, terms, and required notices. | Copyright; privacy/terms; accessibility; regulatory identifiers. |
| Contact and presence block | B | Expose stable contact methods, address, hours, or service area. | Address; phone/email; office list; support links. |
| Secondary destination groups | B | Organize non-primary site links. | Products; resources; company; support; social/profile links. |
| Subscription block | B | Offer an ongoing content relationship at site closure. | Newsletter; release updates. Classify primarily under forms if cataloged once, then relate to footer placement. |
| Site metadata block | B | Expose language, status, version, build, license, or last-update information when useful. | Language; service status; open-source license; version. |

MDN defines `<footer>` by its relationship to the nearest sectioning root and typical authorship, copyright, or related-document content, not by visual size ([MDN `footer`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer)). A pre-footer conversion band remains a CTA section, not a footer variant.

### 2.17 Utility and cross-page service

**Primary job:** provide persistent or contextual service functions that support the page but are not its main argument.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Announcement and service notice | B/C | Communicate a timely change, release, closure, or urgent condition. | Announcement banner; service alert; emergency notice; maintenance notice. Severity and persistence are states. |
| Consent and preference control | B/C | Request or manage lawful preferences. | Cookie consent; tracking preferences; communication consent; privacy controls. |
| Share, save, print, or copy tools | B/C | Let users preserve or distribute the current artifact. | Share link; copy URL/code; bookmark/save; print/download. |
| Contact and support launcher | B/C | Expose contextual help without replacing a clear support page. | Help launcher; chat entry; report issue; feedback trigger. |
| Language, region, and accessibility utility | B/C | Adapt content or interaction to a user preference or locale. | Language; region; text size when genuinely supported; accessibility statement link. |
| Metadata labels | C | Convey concise classification or state. | Tag; badge; status label; date label; content type. |
| Overlay and interruption container | C | Present contextual information or a blocking decision above the page. | Dialog; drawer; popover; tooltip. Classify its content separately. |
| Media controls | C | Operate audio, video, animation, gallery, or immersive content. | Play/pause; captions; mute; scrub; next/previous; fullscreen. |

Utilities should not be duplicated as section families merely because they can be visually large. Atlassian's current catalog usefully separates messaging, navigation, overlays, status indicators, data display, and primitives ([Atlassian components](https://atlassian.design/components)).

### 2.18 System states and feedback

**Primary job:** explain what the system is doing, what happened, and what the user can do next.

| Family | Level | Information or functional job | Job-distinct variants and reusable blocks |
| --- | --- | --- | --- |
| Initial empty state | S/B/C | Explain that no content exists yet and how to create or obtain it. | First-use empty; unconfigured state. |
| No-results state | S/B/C | Explain that a completed search/filter returned nothing and how to recover. | Clear filters; revise query; browse alternatives. Distinct from initial empty. |
| Loading or processing state | S/B/C | Show that work is in progress and preserve orientation. | Skeleton; spinner; progress; queued/pending; background processing. |
| Success and confirmation | S/B/C | Confirm completion, summarize the result, and expose the next useful action. | Form confirmation; purchase receipt; saved state; published state. |
| Error and failure | S/B/C | Explain what failed, its scope, retained data, and recovery. | Inline field error; form summary; request failure; page error; transaction failure. |
| Unavailable, offline, or maintenance | S/B/C | Explain temporary inability to provide the service and alternatives. | Service unavailable; maintenance; offline; rate limit. |
| Permission and access state | S/B/C | Explain why content/action is unavailable and how access can change. | Signed out; unauthorized; restricted; expired; verification required. |
| Warning and destructive confirmation | B/C | Explain risk before or during an action and require proportionate acknowledgment. | Warning; destructive dialog; unsaved changes; irreversible action. |
| Stale, partial, or degraded data | B/C | Communicate that visible information is incomplete, delayed, cached, or lower-confidence. | Last synced; partial result; delayed feed; degraded mode. |
| Passive status and notification | B/C | Report a change without replacing the user's current task. | Toast/flag; inline message; banner; status label; live region update. |

Initial empty and no-results states must stay separate because their causes and recovery actions differ. Atlassian defines an empty state as the no-data condition plus what the user can do next ([Atlassian empty state](https://atlassian.design/components/empty-state)); Carbon separately catalogs empty, loading, disabled, notification, disclosure, and form patterns ([Carbon patterns](https://carbondesignsystem.com/patterns/overview/)).

## 3. Reusable component families

These are lower-level building blocks shared across the section families. They should not be duplicated inside every section category.

| Component family | Core job | Common components | Important states or semantics |
| --- | --- | --- | --- |
| Actions | Trigger or route an action. | Button, button group, link, icon button, menu button. | Default, hover, focus, active, disabled, loading, destructive; button versus link semantics. |
| Text input | Capture free or constrained text. | Text field, textarea, search field, password, number, URL, email, code input. | Label, hint, required, valid, invalid, disabled, read-only, autocomplete. |
| Choice input | Select from known options. | Checkbox, radio, select, combobox, multiselect, toggle, range. | Selection, mixed state, expanded state, keyboard model. |
| Date/time and file input | Capture specialized values or artifacts. | Date input/picker, time input, file upload, drop zone. | Locale, format, constraints, progress, type/size errors. Prefer native controls where sufficient. |
| Navigation controls | Move within hierarchy, sequences, or views. | Breadcrumb, tabs, pagination, menu, next/previous, table of contents. | Current item, expanded state, focus order, history/URL behavior. |
| Disclosure and overlay | Reveal secondary content or interrupt for a decision. | Details, accordion, popover, tooltip, dialog, drawer. | Open/closed, focus placement/return, escape, modality, dismissal. |
| Collection and item | Present related repeatable objects. | List, feed, collection, card, tile, media object, tree. | Item semantics, selection, ordering, loading, empty. A card is a single-subject container, not a section taxonomy. |
| Data display | Present structured or measured information. | Table, chart container, metric, progress, code block, key-value list. | Units, source, sorting, filtering, truncation, responsive fallback. |
| Media display | Present images, video, audio, or interactive artifacts. | Figure, gallery, player, carousel, embed, before/after viewer. | Alt/caption/transcript, controls, reduced motion, loading/error. |
| Identity and attribution | Identify a person, organization, source, or relationship. | Avatar, logo, byline, citation, testimonial attribution, partner label. | Provenance, accessible name, relationship label. |
| Labels and status | Convey concise classification or condition. | Badge, tag, status indicator, date label, counter. | Meaning cannot depend on color alone; live update semantics if dynamic. |
| Feedback and messaging | Report system information or result. | Inline error, error summary, alert, banner, toast/flag, confirmation panel. | Severity, persistence, interruption, live-region behavior, recovery action. |
| Layout and grouping | Establish spatial or semantic relationships. | Container, stack, cluster, grid, split, sidebar, divider, aspect-ratio frame. | Responsive constraints, reading order, overflow. These are composition primitives, not content families. |

Material Design describes components as interactive building blocks organized by purpose ([Material Design 3 components](https://m3.material.io/components)). Its card guidance defines a card around one subject and its actions rather than a visual silhouette ([Material cards](https://m3.material.io/components/cards/guidelines)). That is the useful scope for a card component: it is a container contract, not a synonym for testimonial, feature, project, pricing, or team content.

## 4. Primitive families

Primitives are deliberately few. Domain meaning belongs in sections and blocks, not in a large leaf vocabulary.

| Primitive family | Members | Contract to preserve |
| --- | --- | --- |
| Text | Heading, paragraph, caption, label, quote, code, abbreviation. | Semantic hierarchy, readable measure, language, truncation rules. |
| Action | Link, button control. | Correct element for navigation versus action, accessible name, focus visibility. |
| Media | Image, icon, logo asset, video/audio source, poster, figure caption. | Alternative text or decorative treatment, intrinsic size, source/provenance. |
| Structure | Main, section, article, aside, header, footer, nav, search region, list, list item. | Native semantics, accessible names for repeated landmarks, logical outline. |
| Form | Label, hint, input, legend, fieldset, error text. | Programmatic association, required/optional status, autocomplete, error linkage. |
| Data | Value, unit, key, timestamp, source, annotation. | Definition, format, period, precision, missing-value treatment. |
| Layout | Container, stack, row/cluster, grid, gap, divider, spacer, visually hidden content. | DOM reading order, reflow, overflow, no semantic meaning implied by layout alone. |
| State | Spinner glyph, skeleton shape, status icon, progress value. | Text equivalent, reduced motion, live-update policy. |

Native HTML should carry the broad page outline whenever possible. MDN's element reference distinguishes `main`, `nav`, `article`, `aside`, `header`, `footer`, `section`, and `search` by content purpose ([MDN HTML elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements)). A generic `<section>` should represent a standalone section with a heading only when a more specific semantic element does not apply ([MDN `section`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section)).

## 5. Behavior families

Behaviors are reusable attachments to structures. Cataloging them separately prevents “accordion FAQ,” “carousel testimonials,” and “sticky features” from becoming duplicate section categories.

| Behavior family | Job | Applies to | Minimum contract |
| --- | --- | --- | --- |
| Disclosure | Expand or collapse secondary content. | FAQ, specs, help, nav. | State exposure, keyboard operation, focus visibility, content availability. |
| View switching | Change the visible subset in place. | Features, pricing, data, media. | Tabs/content-switcher semantics, active state, URL/history decision. |
| Overlay and modality | Layer contextual or blocking content. | Forms, media, help, warnings. | Focus trap where modal, initial/return focus, escape/dismiss, background inertness. |
| Search, filter, sort | Transform a result set according to user criteria. | Work, integrations, content, tables, directories. | Result count, active criteria, clear/reset, no-results recovery, URL persistence where useful. |
| Pagination and incremental loading | Divide or extend large collections. | Archives, work, tables, feeds. | Position, next/previous, focus after update, crawlable URLs when public content. |
| Selection and comparison | Mark items for action or side-by-side evaluation. | Plans, products, tables, galleries. | Selected state, limits, summary, reversible action. |
| Validation and conditional input | Check values or reveal dependent questions. | All forms. | Timing, error summary, field association, retained values, server validation. |
| Progress and async feedback | Represent work over time. | Upload, checkout, generation, form submission. | Determinate/indeterminate choice, cancel/retry, stale/timeout handling. |
| Sticky or pinned positioning | Keep context or controls available during scroll. | Navigation, table headers, media, long comparisons. | No content occlusion, zoom/reflow safety, mobile fallback. |
| Carousel or rotator | Move among a bounded set in the same region. | Media, selected work, testimonials. | User controls, current position, pause, keyboard, touch, reduced motion. |
| Auto-update or live data | Refresh values without full navigation. | Status, metrics, feeds, availability. | Update frequency, timestamp, announcement policy, stale/offline state. |
| Drag, resize, or direct manipulation | Reorder or alter an object spatially. | Galleries, comparisons, builders. | Keyboard alternative, target size, undo, constraint communication. |
| Reveal and entrance motion | Introduce content or disclose spatial relation. | Any section. | Content available without motion, reduced-motion fallback, no delayed access to essential content. |
| Responsive transformation | Change composition while preserving information and order. | All multi-column blocks. | Same task/content, logical DOM order, no hidden critical action, overflow strategy. |
| Persistence and personalization | Remember user choices or adapt content. | Theme, locale, filters, pricing, account context. | Consent where needed, clear current state, reset path, server/client consistency. |

The WAI-ARIA Authoring Practices Guide is the behavior authority for common widgets because it specifies roles, states, properties, and keyboard support for patterns such as accordion, breadcrumb, carousel, combobox, dialog, disclosure, grid, menu, slider, tabs, and tree view ([APG patterns index](https://www.w3.org/WAI/ARIA/apg/patterns/)). Prefer native HTML behavior when it fully meets the task; use ARIA to express a tested interaction pattern, not to restyle arbitrary containers.

## 6. Boundary rules that prevent duplication

1. **Cards are not a content family.** A card is a single-subject container component. Project, testimonial, plan, person, article, integration, and feature entries keep their domain block names and may declare `card` as a composition.
2. **Grids and bento are not section families.** They are layout arrangements. Store `grid`, `asymmetric-grid`, or `bento` under composition.
3. **Carousels, tabs, accordions, marquees, and sticky stacks are behaviors.** The content family remains proof, work, feature, FAQ, media, or another job.
4. **“Logo wall” is not a truthful category.** Classify by relationship: customers, press, partners, integrations, investors, certifications, or community. Require the relationship label and source.
5. **A metric follows its claim.** Outcome metrics are proof; neutral measurements are data; live operational measures are system/status; vanity numbers without source do not belong in the catalog.
6. **A timeline follows what time explains.** User steps are process; company milestones are about; event schedules are content; measured change is data.
7. **A page header is not always a hero.** A hero establishes the site's or offer's proposition and next action. An interior page header identifies and scopes content already chosen.
8. **A button does not create a CTA section.** A CTA section exists only when the region's primary job is a decision point. Other actions remain components inside their parent family.
9. **Pricing and comparison can compose but should not merge.** Pricing answers “what does it cost and what do I get?” Comparison answers “which option fits and why?” A pricing section may include an option matrix.
10. **FAQ content and disclosure behavior stay separate.** A FAQ can be fully expanded; an accordion can hold non-FAQ content.
11. **Initial empty and no-results stay separate.** One means nothing exists; the other means the current criteria matched nothing. Their recovery actions differ.
12. **Footer placement does not redefine content.** A newsletter form remains a subscription form referenced from a footer block. A pre-footer CTA remains a CTA.
13. **Mobile stacking is not a variant.** It is a responsive rule. Create a job variant only if the mobile experience supports a different task.
14. **Theme and decoration never determine family.** Color, radius, background, type treatment, illustration style, and motion intensity belong to presentation metadata.

## 7. Page-type coverage

The taxonomy should support different page architectures without prescribing one conveyor belt.

| Page type | Usually central | Conditional | Commonly unnecessary unless evidenced |
| --- | --- | --- | --- |
| Personal or studio portfolio | Identity intro, selected work, project previews/case studies, person/about, contact CTA, footer. | Client proof, capabilities, process, writing, availability. | Pricing tiers, generic FAQ, adoption stats. |
| Product landing page | Proposition, capability/use case, demonstration, proof, offer/CTA, footer. | Process, integrations, comparison, pricing, FAQ. | Team directory, history timeline, generic content feed. |
| Service landing page | Offer, scope/deliverables, proof, engagement process, price/quote path, contact. | Team, FAQ, selected work, fit/limitations. | Product feature grid, integration directory. |
| Institutional/general website | Global navigation, page/topic headers, content collections, about/accountability, search, contact, footer. | Services, data, events, resources, alerts. | Funnel-style repeated CTAs. |
| Editorial/publication | Editorial header, featured content, collections/archive, article body, taxonomy, related content, subscription. | Author/team, events, data, donations. | Pricing comparison, “how it works.” |
| Campaign/event | Proposition, schedule/process, speakers/team, proof, registration/offer, FAQ, footer. | Sponsors, location, content. | Large feature inventory, deep site navigation. |
| Directory/resource hub | Task-first intro, search/filter, collection/index, metadata, empty/no-results, pagination, footer. | Featured content, taxonomy, map/data. | Sales hero, testimonial grid. |

This table is selection guidance, not a template. Every included section must contribute new information, evidence, orientation, instruction, state, or action.

## 8. Recommended catalog schema

The later catalog should use one record per reusable item with controlled references rather than duplicating the same content under many visual names.

```yaml
id: proof.testimonial.attributed
name: Attributed testimonial
level: block                 # section | block | component | primitive | behavior
family: proof-trust
job: "Provide a contextual, attributable evaluation from a real person."
user_questions:
  - "Has someone like me used this successfully?"
page_contexts:
  - landing
  - portfolio
  - service
required_content:
  - quote
  - person_name
  - role_or_relevant_identity
  - relationship_to_subject
  - provenance
optional_content:
  - organization
  - portrait
  - result_metric
  - source_url
actions:
  - view_case_study
evidence_rules:
  - "Do not fabricate or paraphrase without approval."
  - "Keep source and permission status."
composition:
  allowed:
    - list
    - card
    - featured-single
  not_variants:
    - centered
    - dark
    - marquee
uses:
  primitives:
    - text.quote
    - identity.person
    - media.image
  components:
    - action.link
behavior_refs:
  - carousel.manual
states:
  - complete
  - missing-attribution
semantics:
  landmark: null
  notes: "Use blockquote/cite semantics where appropriate."
responsive_rules:
  - "Preserve attribution with its quote."
accessibility:
  - "Meaning and source must not depend on portrait or logo recognition."
anti_patterns:
  - fabricated-proof
  - quote-without-context
source_urls:
  - "https://design-system.service.gov.uk/components/"
status: researched             # draft | researched | implemented | deprecated
implementation_refs: []
```

### 8.1 Required schema fields

| Field | Purpose |
| --- | --- |
| `id`, `name` | Stable identity and human label. IDs should encode family and job, not layout. |
| `level` | Enforces section/block/component/primitive/behavior separation. |
| `family` | One primary information/function family from this report. |
| `job`, `user_questions` | Makes selection content-led and supports deduplication. |
| `page_contexts` | Portfolio, landing, institutional, editorial, commerce, documentation, application, and so on. These are compatibility tags, not separate copies. |
| `required_content`, `optional_content` | Prevents empty slots and fake filler. |
| `actions` | Declares what the user can do, if anything. |
| `evidence_rules` | Records truth, source, permission, date, and relationship requirements. |
| `composition` | Stores allowed layouts and explicitly records shape names that are not variants. |
| `uses` | Links dependencies without embedding duplicate definitions. |
| `behavior_refs` | Attaches disclosure, tabs, carousel, filter, validation, and other behavior records. |
| `states` | Normal, loading, empty, no-results, partial, error, success, disabled, and domain-specific states. |
| `semantics`, `accessibility` | Landmark/element choice, naming, keyboard, focus, reading order, live updates. |
| `responsive_rules` | Content priority, order, overflow, and behavior fallback, not just breakpoints. |
| `anti_patterns` | References a shared failure ledger rather than duplicating prose. |
| `source_urls` | Direct authoritative guidance and production examples with provenance. |
| `status`, `implementation_refs` | Separates researched vocabulary from code that actually exists. |

### 8.2 Variant schema

Variants should be nested only when their information contract differs:

```yaml
variants:
  - id: initial-empty
    job_delta: "Explain that the user has not created any items yet."
    required_content: [reason, creation_action]
  - id: no-results
    job_delta: "Explain that current search criteria matched no items."
    required_content: [active_criteria, recovery_actions]
```

Do not create variant records for `centered`, `split`, `with-image`, `three-column`, `gradient`, `dark`, `rounded`, or `animated`. Put those in a controlled `composition`, `theme`, or `behavior_refs` field. Tailwind Plus's current hero catalog, for example, names “simple centered,” “split with screenshot,” and “with phone mockup”; those are useful implementation examples under one proposition job, not three new information categories ([Tailwind Plus heroes](https://tailwindcss.com/plus/ui-blocks/marketing/sections/heroes)).

### 8.3 Suggested controlled vocabularies

- `level`: `section`, `block`, `component`, `primitive`, `behavior`.
- `family`: the 18 top-level families in this report.
- `page_contexts`: `portfolio`, `product-marketing`, `service`, `institutional`, `editorial`, `campaign`, `event`, `commerce`, `directory`, `documentation`, `application`.
- `evidence_kind`: `first-party`, `customer`, `third-party`, `certification`, `live-system`, `demonstration`, `sample`, `none`.
- `content_status`: `real`, `verified`, `permission-pending`, `sample-labeled`, `missing`.
- `interaction`: references into the behavior catalog, never freeform component names.
- `status`: `draft`, `researched`, `implemented`, `verified`, `deprecated`.

### 8.4 Migration from a visual block library

Keep existing visual pattern names as implementation aliases, not taxonomy roots:

| Existing visual name | Catalog mapping |
| --- | --- |
| `asymmetric-split-hero` | `hero.offer-proposition` + `composition: split` |
| `editorial-manifesto-hero` | `hero.site-brand-introduction` or `hero.campaign-proposition` + `composition: type-led` |
| `bento-grid` | Parent information family + `composition: asymmetric-grid` |
| `sticky-scroll-stack` | Parent information family + `behavior_refs: [scroll.pin-sequence]` |
| `logo-cloud` | `proof.adoption`, `proof.independent-validation`, or `integrations.compatibility`, selected by relationship |
| `testimonial-carousel` | `proof.testimonial.attributed` + `behavior_refs: [carousel.manual]` |
| `pricing-cards` | `pricing.plan-selection` + `composition: card-set` |
| `faq-accordion` | `disclosure.faq` + `behavior_refs: [disclosure.accordion]` |

This preserves real implementation work while removing category duplication.

## 9. Authoritative source basis

The taxonomy is a synthesis rather than a copy of any one system. These current primary sources establish the vocabulary boundaries and interaction contracts:

1. **GOV.UK Design System**: components are reusable interface parts; patterns solve specific user-focused tasks and page types. Its inventory is especially strong for forms, errors, navigation, disclosure, tables, and task flows. [Components](https://design-system.service.gov.uk/components/) · [Patterns](https://design-system.service.gov.uk/patterns/)
2. **IBM Carbon Design System**: components solve specific UI problems; patterns combine components and templates around user objectives and flows. Its pattern list explicitly includes disclosure, empty states, filtering, forms, loading, notifications, and search. [Component overview](https://carbondesignsystem.com/components/overview/components/) · [Pattern overview](https://carbondesignsystem.com/patterns/overview/) · [What is Carbon](https://carbondesignsystem.com/all-about-carbon/what-is-carbon/)
3. **U.S. Web Design System**: official component, pattern, and template guidance for accessible public websites. Its landing-page template explicitly says to remove unnecessary elements rather than fill a template. [USWDS](https://designsystem.digital.gov/) · [Landing page](https://designsystem.digital.gov/templates/landing-page/) · [Collection](https://designsystem.digital.gov/components/collection/)
4. **WAI-ARIA Authoring Practices Guide**: authoritative role, state, property, and keyboard guidance for common widget behaviors. [APG](https://www.w3.org/WAI/ARIA/apg/) · [Patterns index](https://www.w3.org/WAI/ARIA/apg/patterns/)
5. **MDN HTML reference**: native semantic boundaries for page structure and disclosure. [HTML elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) · [`section`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section) · [`nav`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav) · [`footer`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer) · [`details`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) · [`dialog`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
6. **Material Design 3**: current purpose-oriented component inventory; useful for distinguishing component function from visual styling. [Components](https://m3.material.io/components) · [Cards](https://m3.material.io/components/cards/guidelines) · [Lists](https://m3.material.io/components/lists/overview) · [Tabs](https://m3.material.io/components/tabs)
7. **Atlassian Design System**: current inventory separates forms, messaging, navigation, overlays, status, data display, layout primitives, and system states. [Components](https://atlassian.design/components) · [Empty state](https://atlassian.design/components/empty-state) · [Dynamic table](https://atlassian.design/components/dynamic-table)
8. **Tailwind Plus marketing blocks**: a current commercial inventory of common marketing-section names. It is useful evidence of market vocabulary and equally useful evidence for keeping visual names such as bento grids subordinate to information jobs. [Hero sections](https://tailwindcss.com/plus/ui-blocks/marketing/sections/heroes) · [CTA sections](https://tailwindcss.com/plus/ui-blocks/marketing/sections/cta-sections) · [FAQ sections and full marketing-section index](https://tailwindcss.com/plus/ui-blocks/marketing/sections/faq-sections)

## 10. Final recommendation

Build the later catalog around the 18 information/function families, five levels, and a separate behavior catalog. Store visual pattern names as composition metadata or implementation aliases. Require content, evidence, state, semantics, accessibility, and responsive contracts before an item can move from `researched` to `implemented`.

The shortest reliable selection rule is:

> Choose the block by the user question it answers; choose the component by the task it enables; choose the layout and behavior last.
