# Portfolio Website Category Architecture

*Research assembled 2026-07-18. Scope: personal, studio/agency, creative, technical, product/design, photography/art, architecture, and case-study-led portfolios, but only where the differences materially change layout, content, or interaction. This is an architecture reference for a broader web-design skill, not a gallery of visual trends.*

## Executive recommendation

A portfolio is not a small SaaS landing page. Its primary job is to let a visitor answer four questions with evidence: **what kind of work is this, is it relevant to me, what exactly did this person or studio contribute, and what should I do next?** The stable architecture is therefore:

`positioning -> selected work/index -> project evidence -> identity/capability -> proof -> contact`

Archive, services, experiments, news, shop, and journal are conditional branches, not default sections. The highest-value category distinction is not “designer versus photographer.” It is the visitor's evaluation mode:

1. **Case-study evaluation:** product/UX, strategy, engineering, many agency portfolios. Visitors need role, problem, decisions, constraints, and outcomes.
2. **Visual or object evaluation:** photography, art, illustration, and much architecture. Visitors need coherent series, sequencing, faithful media, object/project facts, and credits.
3. **Capability evaluation:** creative development and technical portfolios. Visitors need a live result, source or technical evidence, the author's contribution, and operational quality.
4. **Commercial-practice evaluation:** studios, agencies, freelance service businesses, and commissioned photographers/artists. Visitors also need services, client fit, team, proof, and an inquiry route.
5. **Archive/research evaluation:** established artists, architects, photographers, and studios with large bodies of work. Visitors need chronological and categorical retrieval without weakening the curated front door.

These modes can overlap. A product designer who codes uses case-study plus capability evidence; an architecture studio uses object, commercial, and archive modes. The skill should select modes from actual content and goals rather than force every portfolio into a profession template.

The evidence supports deliberate curation. Adobe advises showing the work one wants to attract and says a few strong projects beat many merely adequate ones ([Adobe Portfolio, 2024](https://help.myportfolio.com/hc/en-us/articles/212835888-How-to-create-a-Portfolio-website-that-gets-noticed)). AIGA likewise defines a portfolio as both evidence of past accomplishment and a signal of future direction ([AIGA Connecticut portfolio guide](https://connecticut.aiga.org/wp-content/uploads/2022/04/Tips-for-Creating-a-Portfolio.pdf)). For UX hiring, Google recommends 3–5 case studies with the user problem, final solution, end-to-end process, role, impact, and cross-functional collaboration ([Google UX portfolio tips](https://services.google.com/fh/files/misc/ux_design_portfolio_tips_19.pdf)); the Nielsen Norman Group's hiring research emphasizes outcomes, the candidate's own thinking, clear writing, and a portfolio that itself demonstrates sound UX ([NN/g, *User Experience Careers*, pp. 75–77](https://media.nngroup.com/media/reports/free/UserExperienceCareers_2nd_Edition.pdf)). These are different expressions of the same rule: select and structure work around the decision the audience must make.

## 1. Shared portfolio layers

### 1.1 Positioning

The first viewport should identify the person or practice, discipline, useful specialization, and current intent. It should not begin with a generic self-description (“multidisciplinary creative crafting meaningful experiences”) or an unexplained showreel.

Minimum content:

- name or studio name;
- legible professional category in the audience's language;
- one differentiating focus, domain, method, or point of view that the work can substantiate;
- location/time-zone only when commercially relevant;
- current state where useful: accepting commissions, employed but open to conversation, represented by a gallery, or hiring;
- a direct path to selected work and a direct path to contact.

Layout consequences:

- **Personal:** the name and role may be the brand; a portrait is optional, not a mandatory hero pattern.
- **Studio/agency:** state the practice's offer and type of client/problem; do not present a collective as though it were one freelancer.
- **Artist/photographer:** a concise statement may precede the biography, but the current body of work should remain visible without reading an essay.
- **Technical/experimental:** an interactive demonstration can itself be positioning only when the interaction proves the advertised capability; otherwise provide a conventional route beside it.

The best positioning is corroborated immediately by work. The home page should not make visitors traverse an abstract manifesto before finding it. AIGA Boston's portfolio review guidance notes that reviewers may have only one or two minutes and warns against hiding the best work under several menu levels ([AIGA Boston](https://boston.aiga.org/portfolio_lesso/)).

### 1.2 Work index

The work index is the portfolio's principal navigation surface, not a generic card section. It should expose enough information to choose a project before opening it.

Every work item needs:

- a representative thumbnail, still, or poster frame;
- title;
- useful discriminator: discipline, project type, client/context, series, or year;
- a clear link target and visible hover/focus state.

Rules:

1. Lead with a small **selected-work set** ordered by relevance and strength, not necessarily newest-first.
2. Use one decisive index rhythm—grid, editorial list, reel, or a restrained hybrid. Do not duplicate the same projects in a hero carousel, card grid, and logo strip.
3. Add filters only when the body of work is large and the categories help a real audience task. A five-project personal portfolio does not need filter chips.
4. When filters are warranted, preserve a useful default view, expose result counts/state, support keyboard operation, and make filtered URLs shareable when practical.
5. Avoid hover-only project names and mouse-position previews as the sole route; touch and keyboard users need the same information.

Large-practice examples show why index behavior is a real category branch. Pentagram's work index lets visitors browse by sector, discipline, location, and year ([Pentagram Work](https://www.pentagram.com/work/)); Snøhetta's project index combines project title, description, disciplines, and date range ([Snøhetta Projects](https://www.snohetta.com/projects)). This density is appropriate for hundreds of heterogeneous projects, not a pattern to copy into every portfolio.

Recommended index variants:

| Mode | Primary unit | Useful controls | Avoid |
|---|---|---|---|
| Personal/creative | selected project | discipline or role only if mixed | premature filtering, skill-tag soup |
| Studio/agency | client project | discipline, sector, office/partner at scale | client-logo wall replacing project evidence |
| Product/UX | case study | product area, role, shipped/experimental | method labels as navigation (“research,” “wireframes”) |
| Technical | project/demo | platform, contribution, source/live status | technology badge clouds with no result |
| Photography | series/assignment | genre, commissioned/personal, year at scale | one undifferentiated masonry dump |
| Art | work/series/exhibition | medium, series, year, availability if commercial | inconsistent or missing object metadata |
| Architecture | project | typology, discipline, status, location, year | filtering a tiny selected set; image-only mystery tiles |

### 1.3 Project page / case study

All project pages need a quick orientation block before the long-form material:

- project title and one-sentence significance;
- date/status;
- context or client where disclosure is allowed;
- the author's or studio's role;
- collaborators/credits;
- representative outcome visual;
- relevant links: live work, repository, publication, exhibition, press, or next project.

After that summary, use one of three project schemas.

#### A. Decision-and-outcome case study

Best for product/UX, research, service design, engineering, strategy, and agency engagements where reasoning matters.

Recommended sequence:

1. **Situation:** user/business problem, audience, baseline, and why the work mattered.
2. **Scope:** role, team, timeline, constraints, and what was outside the author's control.
3. **Evidence:** research or technical facts that changed the direction—not a ceremonial inventory of every method used.
4. **Key decisions:** alternatives, trade-offs, iterations, and why the final direction won.
5. **Result:** shipped output plus user, business, operational, or technical outcomes; label qualitative evidence and estimates honestly.
6. **Reflection:** what changed, what remains unresolved, and what the author learned when useful.

Google's guidance asks for problem, solution, end-to-end process, role, impact, and collaboration ([Google UX portfolio tips](https://services.google.com/fh/files/misc/ux_design_portfolio_tips_19.pdf)). NN/g reports that hiring managers want evidence connecting work to customer and business outcomes and distinguish researchers' artifacts from designers' finished screens and process artifacts ([NN/g, pp. 75–77](https://media.nngroup.com/media/reports/free/UserExperienceCareers_2nd_Edition.pdf)). The architecture should therefore make role and outcome scannable before the full chronology.

Do not force every project through a templated “Empathize / Define / Ideate / Prototype / Test” chapter sequence. It rewards process theatre, makes unrelated projects look identical, and often buries the consequential decisions. Use the project's causal story.

#### B. Visual narrative / assignment story

Best for identity, campaign, illustration, art direction, motion, photography assignments, and visually led agency work.

Recommended sequence:

1. brief/context and role;
2. a strong outcome sequence at useful scale;
3. selective concept or system explanation;
4. applications, variations, or sequence behavior;
5. credits and delivery context;
6. outcome/proof where it exists.

Text supports the work but does not repeat what images already show. Use flexible modules—full-bleed image, paired comparison, captioned detail, video, system grid—so each project can express its actual media. Pentagram's project stories pair narrative with client, sector, discipline, office, partner, project-team, and collaborator credits; the `_able` case is a clear example ([Pentagram `_able`](https://www.pentagram.com/work/able/story)). That credit structure is as important as the art direction because it makes contribution legible.

#### C. Object/project record

Best for art, photography series, and architecture.

Recommended content:

- title, year/date range, medium/discipline, dimensions or scale where relevant;
- location, status, client/commissioner, and collaborators for architecture;
- edition, availability, collection, exhibition/publication history where appropriate for art;
- captions, sequence/series relationship, and licensing/commission details where appropriate for photography;
- multiple views: overall, detail, installation/context, plan/section/model/process when these change understanding;
- a short statement or project text, not a fabricated business-case narrative.

Artwork Archive recommends title, dimensions, medium, creation date, price/status where relevant, story, biography/statement, CV, news, and coherent collections ([portfolio guidance](https://www.artworkarchive.com/blog/building-the-best-online-portfolio-for-your-art); [2026 public-profile guide](https://help.artworkarchive.com/en/articles/802873-public-profile-set-up-customization)). RIBA's academic evidence requirements enumerate design projects, development work, drawings, sketches, diagrams, models, structural/constructional/environmental information, and research ([RIBA validation procedures, p. 35](https://www.architecture.com/-/media/70BF3C489115471181F911CD6E442BA6.pdf)). A professional architecture page need not reproduce an academic folio, but these media explain why a building portfolio requires more than hero photography.

### 1.4 About

The About layer resolves authorship and fit. It should complement rather than paraphrase the positioning line.

**Personal:** short biography, current focus, relevant career path, portrait if desired, location, selected recognitions, resume/CV link, and human details only when they support professional fit. A skills list is secondary to demonstrated work.

**Studio/agency:** founding story or operating thesis, team/leadership, disciplines, offices/markets, collaboration model, values supported by practice, and careers link if active. Show who did the work; avoid presenting a faceless brand while individual project credits remain hidden.

**Artist:** biography and artist statement are distinct; add CV, exhibitions, representation, collections, publications, and news where relevant. Artwork Archive's current profile model separates biography, statement, resume/CV, collections, and news, which is a useful content distinction even if the interface differs ([Artwork Archive](https://help.artworkarchive.com/en/articles/802873-public-profile-set-up-customization)).

**Technical:** summarize specialty and working style, then link to resume, GitHub or equivalent, talks/writing, and selected community contributions. Do not replace evidence with animated skill meters.

### 1.5 Services

Services belong only when the portfolio is intended to win commissions or clients. They are not mandatory for job-seeking portfolios, represented artists, or employed practitioners.

The useful service layer explains:

- problems or engagement types accepted;
- relevant capabilities and deliverables;
- typical client/sector fit;
- collaboration model or project shape;
- geographic/remote constraints when material;
- inquiry action.

For studios, services may be a primary navigation item and can route into discipline pages with selected projects. For a freelancer, a compact section or About subsection is usually enough. Do not add packages or public pricing unless the work is genuinely standardized; custom creative and architecture work generally needs qualification, not SaaS-style pricing cards.

### 1.6 Proof

Proof should be attached to claims and projects rather than collected into one decorative band.

Stronger forms, roughly in order:

1. shipped work or exhibited/built work;
2. measured result with source/context;
3. clear role and collaborator credit;
4. live demo, repository, publication, press, or exhibition record;
5. named client relationship;
6. award or recognition relevant to the work;
7. attributable testimonial with a specific observation.

Category differences:

- **Personal/product:** impact, seniority of responsibility, cross-functional work, recommendations.
- **Studio/agency:** project depth, repeat relationships, team credits, sector fluency, awards/press as secondary validation.
- **Technical:** live URL, source, README, maintenance state, tests/performance/accessibility, open-source contribution.
- **Artist/photographer:** exhibitions, publications, collections, commissions, representation, client/editorial credits.
- **Architecture:** built status, competitions, awards, sustainability/performance facts, client and consultant credits.

GitHub's current job-search guidance recommends 3–5 relevant projects, a concise README, and pinned repositories that make strong work quick to understand; it also distinguishes owned projects from collaborative open-source contributions ([GitHub Docs](https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume)). The portfolio should deep-link to this evidence rather than imitate a contribution graph.

### 1.7 Contact

Contact is a conversion surface, but it should remain plain and dependable.

Provide a visible email address or reliable form, expected inquiry type, and alternate routes only when useful. For a studio, route new business, press, careers, and office contacts separately if they are genuinely handled separately. For artists and photographers, distinguish commissions, sales/licensing, representation, and press where applicable. For job-seeking personal portfolios, one “email me” route plus resume and professional network links is sufficient.

Forms need explicit labels, useful error messages, keyboard operation, and a confirmation state. W3C's development guidance recommends programmatic labels, semantic structure, correct reading order, and keyboard-accessible controls ([W3C WAI](https://www.w3.org/WAI/tips/developing/)). Avoid making a scheduling embed the only contact method; third-party embeds can be slow, inaccessible, or blocked.

### 1.8 Archive

Separate **curation** from **completeness**:

- the home/selected-work layer argues for current positioning;
- the archive preserves breadth and retrieval.

An archive earns its own route when work spans enough years, series, media, sectors, or typologies that omission would reduce professional understanding. Archive controls may include year, discipline/medium, typology/sector, location, status, or series—but choose only dimensions that are consistently populated.

Architecture, art, and established studios benefit most. Studio Olafur Eliasson's site separates current work from artworks, exhibitions, publications, and a year-based archive ([Artworks](https://olafureliasson.net/artworks/)); its “Your uncertain archive” demonstrates an experimental associative archive across artworks, projects, publications, texts, sketches, and interests ([project record](https://olafureliasson.net/artwork/your-uncertain-archive-2010-2014/)). This is exemplary because the associative system is itself part of the practice. It is not a default recommendation for small portfolios.

Keep old work reachable without letting it define the front page. Mark project status accurately: concept, in progress, shipped/built/exhibited, discontinued, or archived.

### 1.9 Experimental work

A lab, playground, sketchbook, or “miscellaneous” stream is useful when experimentation is part of the positioning or demonstrates range absent from client work. It should be a secondary route, clearly labeled by maturity, and allowed a different visual system from the primary portfolio.

Use experimental work to show:

- creative coding and interaction prototypes;
- type, image, material, or motion studies;
- self-initiated research;
- unfinished investigations with honest status.

Do not let an experiment become a compulsory intro, scroll hijack, inaccessible canvas, or loading gate before selected work. The conventional index/contact route must remain available. Bruno Simon's driveable 3D portfolio is a valid category-specific exception because the site itself proves creative-development capability and received recognition for animation/motion ([Webby Awards listing](https://winners.webbyawards.com/2020/websites-and-mobile-sites/features-design/best-use-of-animation-or-motion-graphics/128535/bruno-simon-portfolio)). The lesson is “make the medium prove the positioning,” not “all portfolios need WebGL.”

### 1.10 Accessibility

Portfolio-specific accessibility risk is unusually high because images, motion, canvas/WebGL, unconventional cursors, masonry grids, and autoplay media often carry core meaning.

Requirements:

- semantic headings, landmarks, links, buttons, and lists;
- visible keyboard focus and logical focus/reading order;
- no information or navigation available only on hover, pointer position, drag, or device rotation;
- meaningful text alternatives for informative images; `alt=""` for genuinely decorative/redundant images;
- captions or nearby text for project facts; transcripts/captions for meaningful video/audio;
- adequate contrast and resizable text even when the aesthetic is minimal;
- labeled filters, lightboxes, menus, and forms; focus containment/return for dialogs;
- a non-canvas path to the same work and contact information when WebGL/canvas is used;
- no custom cursor that removes the native cursor or obscures target states.

Alt text is contextual, not inventory transcription. W3C distinguishes informative, decorative, functional, text-bearing, and complex images and says alternatives should convey the image's purpose in context ([W3C Images Tutorial](https://www.w3.org/WAI/tutorials/images/)). For a photographer or artist, identify what the image communicates and keep title/medium/dimensions as visible metadata; for architecture, diagrams and plans may need longer descriptions when their information is essential.

### 1.11 Motion

Motion is justified when it demonstrates motion/interaction craft, explains system behavior, preserves the temporal nature of the work, or gives clear state feedback. It is not justified merely to make every project card drift, reveal, or follow the cursor.

Rules:

- use poster frames and explicit playback for substantial video;
- never make text legibility depend on an animation completing;
- provide pause/stop controls for autoplaying movement that persists;
- avoid auto-advancing carousels for work selection;
- support `prefers-reduced-motion` with a real reduced/static experience;
- keep project navigation operable while media loads or fails.

WCAG requires a pause/stop/hide mechanism for qualifying auto-started moving content and notes that scroll/focus-triggered motion can also fail when it is not intentionally activated ([W3C, SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)). The `prefers-reduced-motion` media feature is widely available and is intended to remove, reduce, or replace non-essential motion ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)).

### 1.12 Responsive behavior

Responsive portfolio design is editorial re-composition, not simply stacking a desktop grid into one column.

Preserve on small screens:

- project identity and metadata near the opening image;
- intentional image sequence and crop;
- readable case-study measure;
- filter/search access without a full-screen maze;
- reachable next/previous work;
- complete credits and contact information;
- playable media without forced orientation.

Use art direction when the desktop crop loses the subject on narrow screens. The `<picture>` element can supply alternate crops, while `srcset` and `sizes` let the browser choose an appropriate resolution ([MDN responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)). Test portrait/landscape media, long titles, dense architecture metadata, captions, lightboxes, reduced motion, touch, keyboard, and zoom—not only common viewport widths.

### 1.13 Performance

Performance is part of portfolio credibility. Image-heavy and motion-heavy work should not punish the visitor for viewing it.

Minimum strategy:

- generate right-sized responsive images and modern formats with fallbacks;
- reserve media dimensions/aspect ratios to prevent layout shift;
- load the likely first/LCP image eagerly and avoid hiding it behind JavaScript or a preloader;
- lazy-load below-fold images and iframes with native `loading="lazy"`;
- use static facades/posters for third-party video and interactive embeds until activation;
- defer 3D, large video, and experiment bundles until the visitor chooses them;
- avoid downloading full-resolution originals into index thumbnails;
- retain useful HTML content when JavaScript, media, or WebGL fails.

web.dev recommends native lazy loading for off-screen images/iframes, explicitly warns not to lazy-load likely above-fold/LCP images, and recommends facades for expensive embeds ([web.dev lazy-loading guide](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements)). Its responsive-image guidance explains that `srcset`/`sizes` let the browser make efficient selections for the actual device and context ([web.dev](https://web.dev/learn/images/responsive-images/)). These are especially consequential for portfolios because the work index can otherwise request dozens of large assets at once.

## 2. Category deltas that genuinely change architecture

### 2.1 Personal portfolio

Use the leanest form:

`positioning + selected work + about/resume + contact`

Add case studies, services, writing, talks, or experiments only when they provide evidence for the intended role. Personal portfolios should make individual contribution unusually explicit because the viewer cannot infer which parts of team work belong to the author. A separate archive is usually unnecessary until there is a long career or materially different bodies of work.

### 2.2 Studio or agency portfolio

Adds organizational and commercial layers:

`practice positioning + selected work + scalable work index + services/disciplines + project stories/credits + team/about + proof + routed contact`

The home page can alternate editorially sized projects to signal range, while the all-work index supports deliberate retrieval. Discipline/sector landing pages should contain positioning and selected evidence, not thin SEO lists. Project pages need partner/team/collaborator credit. Team, office, careers, press/news, and multiple contact routes are real needs for larger practices; they are bloat for a solo practitioner pretending to be an agency.

### 2.3 Creative portfolio (graphic design, illustration, art direction, motion)

Usually image-led, but authorship and context still matter:

`distinct positioning + visual work index + flexible visual narratives + role/credits + about + contact + optional experiments`

Use varied project modules and art direction rather than one rigid case-study template. Motion work needs playable media, poster frames, captions/credits, and reduced-motion/static alternatives. Illustration may organize by commissions versus personal work or by series; art direction needs collaborator and production credits. The site can express visual voice, but the interface should not compete with every project.

### 2.4 Technical/developer portfolio

Adds executable and source proof:

`specialty positioning + selected projects + live/source links + technical case notes + GitHub/community proof + about/resume + contact + optional lab`

Each project should state the user's problem, the author's contribution, key architecture or implementation decisions, trade-offs, operational status, and what is actually demonstrable. A live demo and readable repository/README often carry more weight than a long scroll animation. If source cannot be shared, use sanitized diagrams, metrics, screenshots, or a precise explanation of contribution—never imply code ownership that cannot be shown. GitHub itself recommends quickly understandable, relevant pinned projects and useful READMEs ([GitHub job-search guide](https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume)).

### 2.5 Product/UX/design portfolio

Case-study-led by default:

`role positioning + 2–5 selected case studies + outcome/role summaries + about/resume + contact`

The index should preview problem, role, product area, and outcome rather than only polished UI. The project page needs a summary layer for rapid review and a deeper narrative for hiring panels. Research artifacts and final design evidence differ by role; NN/g notes that researcher portfolios may center reports, plans, personas, needs, and journey maps, while designer portfolios should also show finished designs/screens and process artifacts ([NN/g](https://media.nngroup.com/media/reports/free/UserExperienceCareers_2nd_Edition.pdf)).

For NDA work, use password-protected case studies, redacted/sanitized evidence, or capability-focused summaries. Adobe Portfolio currently supports page-level password protection, demonstrating that this is a mainstream portfolio requirement ([Adobe Portfolio overview](https://help.myportfolio.com/hc/en-us/articles/360035996893-What-is-Adobe-Portfolio)). Never make all relevant work invisible without explaining how a reviewer can request access.

### 2.6 Photography portfolio

Series and sequencing dominate:

`photographic positioning + selected series/assignments + gallery/sequence viewer + about/client proof + commissions/licensing/contact + optional archive/shop`

The index unit is usually a series or assignment, not an individual image. Preserve sequence, aspect ratio, and tonal consistency; use a lightbox only if it improves close viewing and remains accessible. Commercial photographers may separate commissioned, editorial, and personal work, and need client list, tearsheets/publications, representation, commissioning, and licensing contact. Fine-art photographers align more closely with the artist architecture below. Shop/proofing/client galleries are product functions and should not appear unless requested.

### 2.7 Artist portfolio

The object record and career record both matter:

`current/selected work + series/collections + artwork records + artist statement/biography + CV/exhibitions/news + contact/representation + archive`

Individual work pages need consistent title, year, medium, dimensions, edition, views/details, and availability/price only when the artist wants direct sales. Organize by coherent bodies of work before medium tags when that better reflects the practice. Artwork Archive's guidance recommends high-quality current and past work, purchase-relevant object details, biography, statement, CV, news, and collections that expose cohesive bodies of work ([Artwork Archive, 2025](https://help.artworkarchive.com/en/articles/3176522-how-to-complete-your-public-page-on-discovery)).

### 2.8 Architecture portfolio

Adds spatial/project metadata and large-practice retrieval:

`practice positioning + selected projects + project index + project records/stories + disciplines/services + team/about + proof + contact + archive/news`

Index metadata commonly includes discipline, typology, location, date range, and status. Project pages should combine photographs with context, plans/sections, diagrams, model/process material, scale/program, client and consultant credits, and sustainability/performance facts where verified. Separate built, in-progress, competition, research, and speculative work. At substantial scale, list/grid/map views and filters can help; the older Snøhetta index demonstrates category, title, year, location, and image/list/map modes ([Snøhetta archive](https://old.snohetta.com/projects/architecture)), while its current index uses discipline and date-range metadata ([Snøhetta Projects](https://www.snohetta.com/projects)). A map is not useful merely because projects have locations.

### 2.9 Case-study-led portfolio is a layout mode, not a profession

Use this mode whenever a visitor must evaluate judgment, contribution, or impact rather than only the final artifact. It can serve a product designer, strategist, developer, architect, or agency.

Architecture:

`scannable case-study index -> project summary -> causal narrative -> outcome/proof -> adjacent project/contact`

Do not make a long case study the only level of access. The index and opening summary should support a 30–90 second review; headings, pull facts, captions, and outcome blocks enable deeper selective reading. Use sticky local navigation only for genuinely long studies. Do not use arbitrary scroll progress, process timelines, or chapter animations as a substitute for a clear narrative.

## 3. Decision rules for the skill

Ask or infer these inputs before choosing a portfolio architecture:

1. **Primary audience:** hiring manager, prospective client, curator/gallery, publication, collaborator, or general audience.
2. **Primary action:** review work, shortlist/hire, commission/inquire, buy/license, request access, or explore an archive.
3. **Evaluation mode:** case study, visual/object, technical capability, commercial practice, archive, or a combination.
4. **Inventory:** number of strong public projects, media types, date span, available metadata, and NDA constraints.
5. **Entity:** individual, collective, studio, or institution; contribution and credit requirements follow from this.
6. **Distinctive medium:** whether motion, sound, code, 3D, or unusual navigation is evidence of the practice or only decoration.

Then apply these rules:

- If there are fewer than roughly 8–12 projects, start with selected work and no filters.
- If reasoning/impact affects the decision, use case-study summaries and deeper project narratives.
- If visual sequence or object facts affect the decision, use series/object records rather than fake business case studies.
- If the practice sells services, add service fit and inquiry routing; otherwise omit them.
- If a public body of work is large, split selected work from archive and introduce only useful retrieval dimensions.
- If interactivity demonstrates the specialty, progressively enhance a conventional content path; otherwise keep it subordinate.
- If proof cannot be attributed or verified, omit it rather than manufacture a logo wall, metric, or testimonial.

## 4. What belongs in the common design skill vs. portfolio references

### Keep in the common skill

These apply to nearly every website category and should not be duplicated in a portfolio-only rule set:

- semantic structure, keyboard/focus behavior, contrast, forms, media alternatives, and accessible dialogs;
- responsive layout fundamentals, container logic, type scale, tap targets, and art-direction primitives;
- reduced-motion policy, autoplay controls, and interaction-state requirements;
- responsive images, media sizing, lazy loading, LCP/CLS basics, embed facades, and progressive enhancement;
- global navigation, footer, contact-form, error, empty, and loading-state conventions;
- truthfulness rules for metrics, testimonials, clients, awards, and availability;
- baseline typography, visual hierarchy, performance budgets, SEO metadata, and social previews.

The common skill should contain the rule and test. Example: “all informative images need contextual alternatives and all dialogs need focus management.”

### Keep in portfolio-specific references

These arise from portfolio evaluation and deserve a dedicated reference:

- the evaluation-mode model (case study, visual/object, capability, commercial practice, archive);
- selected-work versus archive architecture;
- work-index anatomy, curation order, project preview metadata, and thresholds for filtering;
- the three project schemas: decision/outcome, visual narrative, object/project record;
- role, collaborator, team, and credit disclosure rules;
- case-study summary, causal narrative, outcome, and NDA/password patterns;
- category deltas for studio, product/UX, technical, photography, art, and architecture;
- services and proof as conditional portfolio branches;
- experiment/lab/playground guardrails;
- project-to-project navigation and the contact route after evidence;
- status vocabulary for shipped/built/exhibited, in-progress, concept, discontinued, and archived work.

### Portfolio adaptations of common rules

Do not duplicate the entire common accessibility/performance/motion guidance. Add a short portfolio adapter that names the category-specific failure:

- accessibility -> image purpose, diagram description, media transcript, filter/lightbox semantics, canvas fallback;
- responsive -> preserve image sequence/crops, metadata proximity, and credits;
- motion -> a reduced/static project experience and explicit media control;
- performance -> work-index thumbnails, first-project/LCP priority, poster/facade strategy, deferred 3D;
- proof integrity -> individual contribution and collaborator credit.

This division keeps the common skill authoritative while giving portfolio generation enough domain intelligence to avoid the generic `hero -> about -> skills -> project cards -> testimonial -> contact` template.

## 5. Compact architecture presets

These are starting points, not compulsory templates.

| Preset | Default routes | Conditional routes |
|---|---|---|
| Personal creative | Home/Work, Project, About, Contact | Services, Experiments, Archive |
| Studio/agency | Home, Work, Project, Services/Disciplines, About/Team, Contact | Offices, Careers, News, Archive |
| Product/UX | Home/Case Studies, Case Study, About/Resume, Contact | Passworded Work, Writing |
| Technical | Home/Projects, Project, About/Resume, Contact | Lab, Writing/Talks, Open Source |
| Photographer | Home/Series, Series, About, Contact | Commissions, Archive, Licensing, Shop, Client Login |
| Artist | Current/Work, Series/Artwork, About/Statement, CV, Contact | Exhibitions, News, Archive, Shop |
| Architecture practice | Home, Projects, Project, Disciplines, Practice/Team, Contact | Research, News, Careers, Offices, Archive/Map |

## Source index

Sources were selected for direct relevance and current authority: professional organizations and hiring research for portfolio content, first-party platforms for real information models, exemplary live portfolio/practice sites for architecture patterns, and W3C/MDN/web.dev for web requirements.

- Adobe Portfolio, “How to create a Portfolio website that gets noticed,” updated 2024: https://help.myportfolio.com/hc/en-us/articles/212835888-How-to-create-a-Portfolio-website-that-gets-noticed
- Adobe Portfolio product overview, updated 2026: https://help.myportfolio.com/hc/en-us/articles/360035996893-What-is-Adobe-Portfolio
- AIGA Connecticut, *Tips for Creating a Portfolio*: https://connecticut.aiga.org/wp-content/uploads/2022/04/Tips-for-Creating-a-Portfolio.pdf
- AIGA Boston, “Portfolio Lessons from Show & Sell”: https://boston.aiga.org/portfolio_lesso/
- Google, *UX Design Portfolio Tips*: https://services.google.com/fh/files/misc/ux_design_portfolio_tips_19.pdf
- Nielsen Norman Group, *User Experience Careers: What a Career in UX Looks Like Today*, 2nd ed.: https://media.nngroup.com/media/reports/free/UserExperienceCareers_2nd_Edition.pdf
- GitHub Docs, “Using your GitHub profile to enhance your resume”: https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume
- RIBA, validation procedures (portfolio evidence, p. 35): https://www.architecture.com/-/media/70BF3C489115471181F911CD6E442BA6.pdf
- Pentagram work index: https://www.pentagram.com/work/
- Pentagram `_able` project story: https://www.pentagram.com/work/able/story
- Snøhetta project index: https://www.snohetta.com/projects
- Snøhetta older list/grid/map archive: https://old.snohetta.com/projects/architecture
- Studio Olafur Eliasson artworks/archive: https://olafureliasson.net/artworks/
- Studio Olafur Eliasson, “Your uncertain archive”: https://olafureliasson.net/artwork/your-uncertain-archive-2010-2014/
- Artwork Archive, public-profile structure, updated 2026: https://help.artworkarchive.com/en/articles/802873-public-profile-set-up-customization
- Artwork Archive, artist profile guidance, updated 2025: https://help.artworkarchive.com/en/articles/3176522-how-to-complete-your-public-page-on-discovery
- Artwork Archive, “Building the Best Online Portfolio for Your Art”: https://www.artworkarchive.com/blog/building-the-best-online-portfolio-for-your-art
- Webby Awards, Bruno Simon Portfolio: https://winners.webbyawards.com/2020/websites-and-mobile-sites/features-design/best-use-of-animation-or-motion-graphics/128535/bruno-simon-portfolio
- W3C WAI Images Tutorial, updated 2026: https://www.w3.org/WAI/tutorials/images/
- W3C WAI, Developing for Web Accessibility: https://www.w3.org/WAI/tips/developing/
- W3C, Understanding WCAG 2.2 Success Criterion 2.2.2: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- MDN, `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- MDN, responsive images: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
- web.dev, lazy-loading images and iframes: https://web.dev/learn/performance/lazy-load-images-and-iframe-elements
- web.dev, responsive images: https://web.dev/learn/images/responsive-images/

