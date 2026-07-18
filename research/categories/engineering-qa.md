# Engineering and QA taxonomy for a professional web-design/build skill

**Research date:** 2026-07-18  
**Scope:** portfolios, public websites, and landing pages; framework-agnostic; implementation through handoff  
**Legend:** **U** = universal core requirement; **C** = project-dependent concern

## Executive conclusion

A professional web-design skill should not prescribe a universal framework, component library, rendering model, analytics vendor, or deployment platform. Its engineering core should do three things reliably:

1. preserve and extend the project's existing stack;
2. produce a complete, standards-based site with sound defaults; and
3. prove that the result works through a small set of observable release gates.

The core should therefore be an **adaptive workflow plus acceptance criteria**, not a stack generator. Static brochure sites should remain static. Existing React, Vue, Svelte, Astro, server-rendered, CMS, and plain-HTML projects should retain their architecture unless the request explicitly requires a change. Advanced features—authentication, payments, CMS schemas, consent platforms, offline support, extensive observability, and infrastructure changes—belong behind project-dependent branches.

The most important distinction is between requirements and mechanisms. For example, every project needs stable navigation and useful error behavior; only some need a client router or an error-boundary API. Every public site needs correct page metadata; only some need structured data or international `hreflang`. Every form needs accessible states and server-side validation; a site with no forms needs none of that plumbing.

## 1. Classification model

### Universal core requirements

Universal requirements apply to almost every professional site, regardless of stack:

- inspect before editing and preserve the host architecture;
- use semantic HTML and native platform behavior where it covers the need;
- make every intended route and interaction complete;
- reuse existing components, styles, tokens, dependencies, and conventions;
- keep visual decisions consistent and responsive;
- ship optimized, correctly attributed assets without placeholders;
- avoid obvious performance, accessibility, privacy, and security regressions;
- provide correct metadata for the site's actual publishing state;
- run the project's existing checks plus focused browser and interaction QA;
- hand off a reproducible build with assumptions and remaining limitations stated.

### Project-dependent concerns

Project-dependent concerns are activated by evidence in the brief or repository:

- framework selection for a greenfield build;
- SSR, SSG, streaming, hydration, islands, or SPA navigation;
- authentication, authorization, sessions, user-generated content, and uploads;
- APIs, databases, CMSs, CRM/email services, commerce, payments, and search;
- multilingual routing and `hreflang`;
- analytics, advertising, experimentation, heatmaps, and consent tooling;
- service workers, offline behavior, installability, and push notifications;
- CDN, edge, image-transformation, or media-transcoding infrastructure;
- formal performance budgets, RUM, uptime checks, alerting, and SLOs;
- regulated-data, legal, compliance, penetration-testing, or threat-modeling work;
- broad design-system programs, documentation sites, and visual-regression farms.

This classification prevents a design skill from turning a five-page portfolio into an application platform while still surfacing the extra work when the project genuinely needs it.

## 2. Repository reconnaissance and stack preservation

### **U — Inspect the real system before choosing an implementation**

The skill should begin with a short architecture inventory:

- package manager, lockfile, runtime and supported versions;
- build, development, lint, type-check, test, and preview commands;
- application entry points and current rendering model;
- route definitions, layouts, templates, and content/data locations;
- styling approach, component library, icon set, utilities, and existing tokens;
- asset pipeline, image/font handling, public/static directories, and aliases;
- environment-variable names and external integrations, without exposing values;
- deployment configuration, base path, redirects, headers, and output directory;
- existing CI gates and browser-support policy;
- current uncommitted work, so unrelated user changes are preserved.

The governing rule should be: **extend the current system in the smallest coherent place**. Before adding a helper, component, dependency, token file, or routing layer, search for an existing equivalent. Keep the existing package manager and lockfile. Do not migrate build tools, styling systems, icon libraries, routers, or rendering modes as incidental work.

The output of reconnaissance need not be a large architecture document. A working note with the detected stack, commands, files to touch, and conditional features is enough.

### **C — Greenfield selection or deliberate migration**

When there is no host system, choose the least complex stack that satisfies publishing, editing, interaction, and deployment needs. A migration is justified only by an explicit requirement or a demonstrated blocker, and it needs separate acceptance criteria, compatibility checks, and rollback planning. “Modernization” by itself is not a design requirement.

## 3. Frontend architecture, components, and design tokens

### **U — Organize around repeated behavior and repeated visual decisions**

Componentization is useful when a unit repeats, owns interaction/state, or defines a stable page region. It is not a requirement to wrap every HTML element. The core skill should:

- reuse existing shared primitives and composition patterns;
- extract repeated site chrome, cards, buttons, form controls, media frames, and section patterns when that reduces inconsistency;
- keep one-off editorial sections local when extraction adds indirection without reuse;
- give interactive components explicit default, hover, focus, active, disabled, loading, success, and error behavior as applicable;
- prefer native controls and semantic elements before custom widgets;
- keep content/data separate from presentation only when the repository already does so or content is genuinely repeated/editable.

For styling, a small semantic token layer should cover visual values that genuinely recur: color roles, typography roles, spacing rhythm, container widths, radii, borders, elevation, motion durations/easings, and breakpoints where the system uses them. CSS custom properties provide a native, cascading mechanism for reusable values [S1]. Existing tokens are authoritative; the skill should not create a competing token vocabulary.

A useful minimum is:

- primitives where necessary (`--space-2`, `--radius-sm`);
- semantic roles that explain intent (`--color-text-muted`, `--surface-raised`, `--focus-ring`);
- component-local variables only when a component needs controlled variation.

Avoid copying arbitrary design-tool values into dozens of one-use tokens. Avoid a runtime theming engine when static CSS variables are sufficient.

### **C — Full design-system infrastructure**

Multi-brand theming, token compilation, package publication, Storybook-style catalogs, cross-product component APIs, and visual-regression infrastructure are separate design-system projects. Add them only when the repository already uses them or the user asks for a reusable system beyond the delivered site.

## 4. Rendering, routes, and navigation

### **U — Complete URL and document behavior**

Every intended page should have a stable URL and pass these checks:

- direct navigation and reload work at the deployed path;
- links use real anchors for navigation, preserving open-in-new-tab, copy-link, and assistive-technology behavior;
- browser Back and Forward preserve a coherent location and state;
- internal links resolve and do not depend on development-only paths;
- missing routes return or represent a real not-found state rather than a misleading success page;
- permanent URL changes use server/platform redirects where possible;
- trailing-slash, case, base-path, and canonical-host behavior is consistent;
- page titles and primary headings describe the destination.

The History API exists to support session-history behavior in client-rendered navigation [S2], while HTTP status codes and redirects communicate success, absence, errors, and moved resources to clients and crawlers [S3, S4]. A professional QA pass must test both the visible page and the underlying response behavior.

Rendering strategy should follow the page's needs:

- static or pre-rendered output for stable public marketing and portfolio content;
- server rendering for request-time data, personalization, or platform constraints;
- client rendering for interaction-heavy application surfaces;
- hybrid or partial hydration when already supported and it materially reduces shipped JavaScript.

For public content, meaningful headings, links, copy, and metadata should be available in delivered HTML whenever the host stack supports that naturally. This improves resilience and discoverability without mandating a particular framework. Client-side rendering is not automatically wrong, but it creates extra routing, loading, error, and crawl verification obligations; Google’s JavaScript SEO guidance documents those rendering considerations [S24].

### **C — Advanced routing**

Authentication guards, locale negotiation, deeply nested route data, route transitions, optimistic navigation, streaming, parallel routes, and preserved scroll/focus behavior need project-specific design and tests. A single-page landing page does not need a client router merely to animate anchor navigation.

## 5. Forms, data flow, and external integrations

### **U when a form exists — Treat submission as a complete transaction**

Every production form needs:

- a real label and programmatic name for each control;
- the most specific native input type and appropriate `autocomplete` token;
- clear required/optional indication and concise instructions;
- native constraint validation where suitable, augmented rather than replaced;
- equivalent server-side validation at the trust boundary;
- pending feedback and duplicate-submission prevention;
- success confirmation that is both visible and programmatically announced;
- field-level errors plus a useful summary for longer forms;
- focus moved only when it helps recovery, without trapping the user;
- entered data preserved after recoverable failures;
- a network/server failure path that explains what happened and what to do next;
- protection against spam or abuse proportional to actual exposure;
- a tested destination: inbox, database, CRM, webhook, or other system.

HTML constraint validation reduces custom code but does not replace server validation, because clients can bypass it [S5]. OWASP recommends early syntactic and semantic validation of every untrusted source [S6]. Validation errors must not be used as the only defense against injection; output encoding, parameterized data access, and other context-specific controls still apply.

Integration secrets must remain server-side or in the deployment platform's secret store. Public identifiers may be client-visible only when the provider designs them to be public. Logs and user-visible errors must not expose provider responses, credentials, stack traces, or submitted personal data.

### **C — Integration-specific behavior**

Email delivery, CRM mapping, CMS previews, payments, authentication, file uploads, calendar booking, search, maps, and AI endpoints require their own provider contracts, retry/idempotency rules, rate limits, failure states, privacy review, and end-to-end tests. CAPTCHA is not a universal default; add an abuse control when exposure and observed risk justify its usability and privacy cost.

## 6. Assets: images, icons, fonts, and video

### **U — Asset inventory and provenance**

Before implementation, classify each asset by purpose, source, license/permission, format, intrinsic dimensions, likely display size, and whether it conveys content. Do not ship temporary placeholders, watermarked previews, broken remote URLs, duplicate exports, or unused production assets. Decorative images need empty alternative text; informative images need concise equivalent text; complex visuals may need adjacent explanation.

### Images and icons

For raster images:

- resize and compress near actual use sizes;
- use a suitable modern format supported by the existing pipeline, with fallback only where required by the browser policy;
- provide responsive candidates with `srcset`/`sizes` or the framework's existing equivalent;
- set intrinsic `width` and `height` or an aspect ratio to reserve layout space;
- load the likely LCP image eagerly and make it discoverable early;
- lazy-load offscreen images and iframes, not above-the-fold critical media;
- avoid sending desktop-sized images to narrow screens.

Responsive image markup lets the browser choose an appropriate resource [S7]. MDN recommends explicit image dimensions to prevent layout shift, especially with lazy loading [S8].

Use SVG for logos and simple vector icons where appropriate. Prefer the repository's existing icon set. Icons that trigger actions need an accessible name, adequate target size, and visible focus; decorative SVG should not create redundant announcements. Treat untrusted SVG as active content and sanitize it before inline use.

### Fonts

If the project needs custom web fonts:

- verify licensing and host/provider terms;
- load only used families, weights, styles, scripts, and variable-font axes;
- prefer WOFF2 and subset where the supported languages allow it;
- define robust system fallbacks;
- choose `font-display` intentionally;
- preload only a truly critical font file, not the entire family;
- test fallback metrics and wrapping to avoid layout shift.

Web fonts can delay text and cause CLS; current web.dev guidance covers WOFF2, subsetting, fallback metrics, and cautious preloading [S9]. If system fonts meet the visual brief, adding no web-font request is the fastest and most reliable option.

### Video and audio

For media:

- provide controls and a poster where useful;
- avoid autoplay with sound; respect user control and reduced-motion preferences;
- use `preload="none"` or `metadata` when immediate playback is not required;
- size the media container to prevent layout shift;
- provide captions for prerecorded synchronized speech/audio, and a transcript or audio description where required by the content;
- include a fallback link when a critical media embed can fail;
- lazy-load heavy third-party players or use a consent-aware facade when tracking is involved.

W3C WAI’s media guidance covers captions, transcripts, description, and accessible players [S10].

### **C — Asset infrastructure**

Image CDNs, automated art direction, perceptual quality pipelines, signed media, adaptive streaming, DRM, transformation services, and large media libraries are project-specific. The core should use an existing pipeline, not invent one for a small site.

## 7. Performance and Core Web Vitals

### **U — Performance is a release property, not a final polish pass**

The current stable Core Web Vitals are LCP, INP, and CLS. “Good” field thresholds are **LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1 at the 75th percentile** [S11]. These are experience targets, not guarantees from a single local Lighthouse run.

The core skill should:

- keep the initial document, critical CSS, JavaScript, fonts, and hero media as small as the design allows;
- avoid shipping JavaScript for effects achievable with HTML/CSS;
- remove unused dependencies, assets, code paths, and duplicate libraries introduced by the change;
- split or defer genuinely non-critical code, while avoiding fragmentation that adds overhead without user benefit;
- make the LCP resource discoverable and avoid lazy-loading it;
- reserve space for images, embeds, ads, consent UI, and dynamic regions;
- limit long main-thread work and expensive continuous animation;
- avoid layout thrashing and unbounded scroll/pointer handlers;
- use explicit caching for versioned static assets and suitable revalidation for HTML/data;
- minimize third-party scripts and load them after consent or interaction when appropriate;
- test under constrained mobile CPU/network conditions, not only on a fast desktop.

HTTP caching should be intentional; absent directives can produce heuristic behavior, while fingerprinted immutable assets and frequently updated documents need different policies [S12]. Resource hints are precision tools: preload only a resource that is definitely needed early, because a wrong preload competes with critical downloads.

### Measurement gate

Use both kinds of evidence:

- **lab testing before release** for repeatable diagnosis on representative page templates, viewport sizes, and throttled conditions;
- **field/RUM data after release**, when traffic and privacy requirements justify it, because field data captures real devices, networks, interactions, caches, and page lifecycles.

web.dev explicitly distinguishes field Web Vitals from lab diagnostics and warns that lab results do not represent the full user population [S13]. INP in particular requires real interactions; lab tools commonly use Total Blocking Time as a diagnostic proxy.

The skill should report measured values and test conditions, not assert “100 performance” as a durable property. Hard byte/count budgets are **C**: set them from business goals, audience devices, hosting, and the starting baseline rather than embedding arbitrary global limits in the core skill.

### **C — Advanced performance operations**

RUM pipelines, custom performance marks, CDN tuning, edge caching, pre-render queues, service workers, offline caches, performance CI, regression budgets, and alerting are valuable when scale or reliability goals require them. Service workers add an independent cache/update lifecycle and should not be added as generic optimization plumbing.

## 8. State, errors, and reliability

### **U — Every asynchronous path needs a defined outcome**

For each data-dependent interaction, account for the states that can actually occur: initial, loading, success, empty, validation error, network/server error, and stale/offline if relevant. Avoid permanent spinners and silent failures. Disable or serialize actions that cannot safely run twice. Preserve user input and offer retry only when retry is safe.

Important implementation rules:

- `fetch()` does not reject for HTTP 4xx/5xx responses, so code must inspect `Response.ok` or status [S14];
- cancel or ignore obsolete requests where rapid navigation/input can create races;
- show a useful 404 for unknown routes and a safe error page for server/render failures;
- keep public error copy helpful but free of stack traces, internal IDs, secrets, and provider payloads;
- degrade optional integrations independently so one widget does not blank the entire page;
- ensure redirects, cache headers, and asset paths behave on the actual host;
- keep core navigation and content usable when a non-essential script or embed is blocked.

Production logging, when present, should be structured around actionable events and must exclude credentials, session identifiers, access tokens, unnecessary personal data, and secrets [S15]. A small static site may need only host logs and a checked contact-form destination; it does not automatically need an observability stack.

### **C — Operational reliability**

Retries with backoff, idempotency keys, queues, circuit breakers, offline mutation replay, synthetic uptime monitoring, exception tracking, dashboards, alerts, backups, disaster recovery, and SLOs are driven by data criticality and operating responsibility. The core should identify the need and integrate an existing service, not create an operations platform during a visual build.

## 9. Security and privacy

### **U — Baseline for every deployed site**

The skill should maintain a compact baseline:

- serve production over HTTPS and avoid mixed content;
- keep secrets and privileged operations out of client bundles and repositories;
- validate all untrusted input on the server and encode output for its destination context;
- avoid unsafe HTML injection; sanitize trusted rich-content workflows with a maintained, purpose-built sanitizer;
- use least-privilege CORS and integration credentials;
- preserve dependency/lockfile integrity and avoid unnecessary packages;
- configure restrictive security headers supported by the host, including a tested Content Security Policy where feasible;
- constrain framing, form destinations, scripts, connections, and media to required origins;
- use Subresource Integrity for externally hosted static scripts/styles when versions are stable;
- use safe cookie attributes and scope when cookies exist;
- do not expose source maps, debug pages, directory listings, or verbose errors unintentionally;
- review third-party embeds as code and data-sharing dependencies, not merely visual assets.

OWASP’s current Top 10 is a risk-awareness baseline rather than a complete verification standard [S16]. CSP is defense in depth and must be tested against the site's real resource graph [S17]. OWASP recommends current TLS and disabling obsolete protocols [S18]. MDN documents `Secure`, `HttpOnly`, restrictive scope, and `SameSite` cookie guidance [S19], while SRI lets browsers verify externally fetched resources against a cryptographic hash [S20].

Security controls must match the architecture. A static site with no cookies or user data does not need session management, CSRF tokens, or database controls. An authenticated application does.

### **C — Higher-risk features**

Authentication, authorization, session lifecycle, CSRF defense, password/passkey flows, uploads, rich text, payments, personal-data storage, administrative surfaces, webhooks, and multi-tenant data access require threat modeling and dedicated tests. Rate limiting and abuse monitoring belong at the server/provider boundary. Formal penetration tests, ASVS verification, compliance evidence, and incident-response procedures remain specialist or organizational work.

### Privacy and analytics

Analytics must be **opt-in at the project level, not silently installed by the core skill**. If requested:

- define the decisions and small event set before adding a vendor;
- collect the minimum fields needed and avoid free-text/PII payloads;
- document cookies, local storage, third-party requests, retention, and data recipients;
- honor applicable consent and preference requirements before non-essential collection;
- make tracking IDs environment-specific and prevent staging/test traffic pollution;
- verify page views are not doubled by client navigation and that events fire once with stable names;
- preserve site function when tracking is blocked;
- provide a way to update or remove the instrumentation.

W3C’s Privacy Principles make data minimization applicable to personal data broadly, including data not initially considered identifying [S21]. Legal consent rules vary by jurisdiction and business relationship; the skill should surface that dependency, not make legal claims. When custom analytics transport is necessary, the Beacon API is designed for small end-of-session analytics/diagnostic payloads and should be triggered from page visibility rather than unreliable unload handlers [S22].

## 10. SEO and discovery plumbing

### **U for public sites — Correct, page-specific machine-readable identity**

Every indexable page should have:

- a unique, accurate `<title>` aligned with the visible primary heading;
- a useful page-specific meta description;
- document language, charset, and responsive viewport metadata;
- a canonical URL derived from the real production origin and route policy;
- crawlable internal anchor links;
- one coherent heading hierarchy and descriptive link text;
- meaningful alternative text for indexable informative images;
- favicon/app icons appropriate to the project;
- a deliberate robots policy, with staging/private pages kept out of indexing;
- a sitemap when the public site has multiple canonical URLs or content that benefits from discovery;
- a real 404 response and permanent redirects for replaced URLs.

Google’s current guidance describes title sources [S23], supported metadata and robots controls [S25], canonical signals [S26], and sitemap construction [S27]. Canonical URLs should be consistent across HTML, sitemap, redirects, and internal links. `robots.txt` is crawl control, not access control, and should not be used to hide sensitive content.

Social share metadata and preview images are a practical default for public marketing pages, but their exact Open Graph/platform fields are **C** because destinations and publishing channels differ. Validate previews against the final production URL and image accessibility; relative local paths and development hosts are common handoff failures.

### **C — Structured and international discovery**

Add structured data only when a supported type accurately matches visible content. Validate it, do not fabricate reviews, organizations, job details, or other claims, and do not promise rich-result eligibility. International sites may need locale routes, translated metadata, canonical/hreflang relationships, and localized sitemaps. Search-console verification, content strategy, backlink work, keyword research, and ranking programs are separate growth/SEO workstreams.

PWA manifests are also conditional: they describe installed-app behavior and are not required for an ordinary website [S28].

## 11. Browser, device, accessibility, and functional QA

### **U — Test the delivered experience, not only source code**

A professional skill needs a release matrix proportionate to the site. At minimum:

#### Build and static checks

- run the repository's formatter/check, lint, type-check, unit tests, and production build where they exist;
- inspect the final diff for unrelated edits, generated junk, secrets, debug output, and dead assets;
- verify production output/base paths, not only the development server;
- check the browser console and network panel for uncaught errors, failed assets, mixed content, duplicate requests, and unexpected third parties.

#### Route and interaction smoke tests

- open every page template by direct URL;
- test global navigation, skip link, logo/home behavior, footer links, active states, and external links;
- test Back/Forward, refresh, deep links, 404, and redirects;
- exercise every CTA, disclosure, modal, carousel, filter, and form with success and failure paths;
- test slow and failed network behavior for integrations;
- verify no control is mouse/hover-only and no animation blocks interaction.

#### Responsive and device tests

Test layout behavior at content-driven boundaries, not just three named device widths:

- narrow mobile, wide mobile, tablet/intermediate, laptop, and wide desktop;
- portrait and landscape where orientation changes the composition;
- touch and keyboard/pointer input;
- long headings, long navigation labels, empty and dense content, and translated-length stress where relevant;
- 200% zoom and reflow at 320 CSS pixels; 400% zoom for critical flows where practical;
- sticky/fixed elements against browser UI, safe areas, virtual keyboards, and focus scrolling.

The browser matrix is project-dependent, but a reasonable default smoke set for a public site is current Chromium, Firefox, and Safari/WebKit behavior, plus real or remote mobile Safari and Android Chrome for touch and viewport issues. Expand to older/enterprise browsers only from audience data or contractual support. Use feature detection and progressive enhancement rather than user-agent forks.

WCAG 2.2 requires reflow without loss at the defined narrow equivalent and covers orientation, text resizing/spacing, focus, keyboard access, target size, names/roles/values, and status messages [S29].

#### Accessibility test gate

Automated tools are useful but insufficient. W3C states that no tool alone can determine accessibility and that knowledgeable human evaluation is required [S30]. The release gate should combine:

- automated checks for detectable semantic, name, contrast, and ARIA failures;
- full keyboard traversal in logical order, including reverse traversal and escape/close behavior;
- visible, unobscured focus and no keyboard traps;
- a screen-reader smoke test of landmarks, heading outline, navigation, forms, errors, dynamic status, and modal/disclosure behavior;
- contrast checks for text, controls, states, and focus indicators;
- image alternatives and decorative-image suppression;
- zoom/reflow and text-spacing stress;
- reduced-motion behavior and pause/control for significant animation;
- forced-colors/high-contrast smoke testing for controls, icons, and focus;
- captions/transcript/media controls where media is present;
- accessible error recovery and success announcements for forms.

W3C’s Easy Checks provide a practical starting set covering titles, alternatives, headings, contrast, zoom, keyboard, focus, forms, motion, media, and structure [S31]. `prefers-reduced-motion` communicates a user request to reduce non-essential motion [S32], and `forced-colors` exposes the user agent's limited high-contrast palette [S33].

Do not claim “WCAG compliant” from an automated scan. Report the standard/level targeted, pages and flows sampled, tools and assistive technology used, manual findings, and known gaps.

#### Visual and content QA

- compare implemented hierarchy, spacing, type, imagery, and interaction against the approved direction;
- inspect at actual browser sizes rather than only static design frames;
- check wrapping, clipping, overflow, stacking, scrollbars, image crops, and cumulative shifts;
- verify final copy, links, legal names, contact details, dates, image rights, and alt text;
- confirm motion timing and reduced-motion variants;
- inspect empty/loading/error states, not only ideal populated screens.

#### Performance, metadata, and security smoke tests

- run a throttled lab performance audit on each materially different template;
- record LCP/CLS and the lab responsiveness proxy with test conditions;
- inspect page source/response for title, description, canonical, robots, language, status, and sitemap/redirect behavior;
- validate structured data only when present;
- review deployed security headers, HTTPS, cookie flags, exposed source maps/secrets, dependency findings, and third-party requests;
- submit a production-like test form and verify its destination without leaving test data ambiguous.

### **C — Expanded verification**

Automated end-to-end suites, screenshot regression, device farms, load testing, API contract tests, chaos testing, formal accessibility audits with disabled users, penetration testing, and continuous monitoring should be selected from risk, change frequency, traffic, and contractual requirements. They are not universal scaffolding for every portfolio.

## 12. Completion, deployment, and handoff

### **U — Definition of done**

The skill should not stop at “the page renders.” Completion requires:

- requested pages, content, states, and integrations are present;
- production build succeeds with the repository's normal command;
- existing lint/type/test gates pass, or pre-existing failures are clearly separated;
- route, interaction, form, responsive, accessibility, performance, metadata, and console/network smoke checks have results;
- production configuration contains no development URLs, placeholder content, test credentials, or accidental `noindex` on a public launch;
- no new secrets are committed and required environment-variable names are documented;
- redirects, headers, domains, base paths, and asset URLs are verified on the target host or a production-equivalent preview;
- editable content and asset locations are obvious to the next maintainer;
- third-party accounts, licenses, and ownership are transferred or identified;
- only intentional files are changed.

The final handoff should be concise but reproducible:

- what changed and where;
- exact build/test commands run and their result;
- routes and major flows manually checked;
- environment variables and external services required, naming keys but never values;
- deployment/configuration steps not encoded in the repository;
- asset/font licenses or source notes;
- known limitations, conditional work not performed, and the trigger for adding it;
- analytics/privacy behavior, if any;
- monitoring/ownership contact only when operations are in scope.

Evidence should be honest: say “manual keyboard and VoiceOver smoke test on these routes,” not “fully accessible”; say “Lighthouse mobile run under these settings,” not “fast for everyone.”

### **C — Organizational delivery**

CI/CD creation, DNS changes, production releases, rollbacks, analytics dashboards, runbooks, SLA ownership, training, editorial governance, and ongoing maintenance plans need explicit authorization and organizational inputs. A design/build skill can prepare them but should not silently take control of external systems.

## 13. Recommended category tree for the core skill

The following tree keeps implementation concerns discoverable without coupling them to a framework:

```text
Engineering & Delivery
├── 1. Context and constraints [U]
│   ├── Repository reconnaissance
│   ├── Existing-stack preservation
│   ├── Requirements and conditional-feature detection
│   └── Change-scope and dependency discipline
├── 2. Frontend system [U]
│   ├── Semantic document structure
│   ├── Responsive layout
│   ├── Reusable components and interaction states
│   ├── Existing design-system reuse
│   └── Minimal semantic design tokens
├── 3. Delivery architecture [U with C mechanisms]
│   ├── Rendering strategy
│   ├── Routes, navigation, status codes, and redirects
│   ├── Data/content boundaries
│   └── Forms and integrations [C when present]
├── 4. Asset pipeline [U]
│   ├── Provenance and rights
│   ├── Images and icons
│   ├── Fonts
│   └── Video/audio [C when present]
├── 5. Quality attributes
│   ├── Performance and Core Web Vitals [U]
│   ├── Accessibility implementation and testing [U]
│   ├── State, errors, and resilience [U]
│   ├── Security baseline [U]
│   ├── Privacy and analytics [C unless collection exists]
│   ├── SEO and discovery [U for public sites]
│   └── Observability and operations [C]
├── 6. Verification [U]
│   ├── Build/static checks
│   ├── Route and interaction smoke tests
│   ├── Browser/device/responsive tests
│   ├── Manual plus automated accessibility tests
│   ├── Visual/content QA
│   └── Performance/metadata/security smoke tests
└── 7. Release and handoff [U]
    ├── Production-equivalent verification
    ├── Environment and deployment notes
    ├── Evidence and known limitations
    └── Ownership, licenses, and maintenance triggers
```

This tree should be implemented as a decision flow, not a requirement to generate one file or tool per leaf.

## 14. What should stay out of the core skill

Keep these out of the mandatory core and place them in adapters, recipes, or explicit project branches:

- framework-specific file trees, hooks, server APIs, image components, and deployment commands;
- automatic migrations or rewrites of an existing stack;
- mandatory client routers, state managers, CSS frameworks, animation libraries, or component packages;
- speculative abstraction layers and “future-proof” design-system infrastructure;
- fixed global JavaScript/image/font budgets disconnected from audience and baseline;
- automatic analytics, tag managers, pixels, heatmaps, experimentation, cookie banners, or consent vendors;
- authentication, payment, CMS, database, upload, and search implementations without explicit requirements;
- service workers, offline mode, installable PWA behavior, push notifications, and app manifests for ordinary sites;
- broad observability, uptime, alerting, SLO, backup, and incident-response systems for sites with no operating requirement;
- legal conclusions, regulatory compliance certification, formal WCAG conformance claims, or security certification;
- exhaustive device labs, visual-regression platforms, penetration tests, and load tests by default;
- SEO ranking promises, keyword/content strategy, backlink campaigns, and ongoing growth operations;
- production DNS/account changes, publishing, or external data writes without explicit authorization.

The core should identify when one of these becomes necessary, explain the trigger, and integrate with the project's existing solution. That is more professional than either ignoring the concern or installing infrastructure preemptively.

## Primary source map

- **[S1] MDN — Using CSS custom properties:** https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
- **[S2] MDN — Working with the History API:** https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API
- **[S3] MDN — HTTP response status codes:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
- **[S4] MDN — Redirections in HTTP:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections
- **[S5] MDN — Constraint validation:** https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation
- **[S6] OWASP — Input Validation Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- **[S7] MDN — Responsive images:** https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
- **[S8] MDN — `<img>` element:** https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
- **[S9] web.dev — Best practices for fonts:** https://web.dev/articles/font-best-practices
- **[S10] W3C WAI — Making audio and video media accessible:** https://www.w3.org/WAI/media/av/
- **[S11] web.dev — Core Web Vitals thresholds:** https://web.dev/articles/defining-core-web-vitals-thresholds
- **[S12] MDN — Cache-Control:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
- **[S13] web.dev — Core Web Vitals workflows with Google tools:** https://web.dev/articles/vitals-tools
- **[S14] MDN — `fetch()`:** https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
- **[S15] OWASP — Logging Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- **[S16] OWASP — Top 10 (current release):** https://owasp.org/www-project-top-ten/
- **[S17] OWASP — Content Security Policy Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- **[S18] OWASP — Transport Layer Security Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html
- **[S19] MDN — Secure cookie configuration:** https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies
- **[S20] MDN — Subresource Integrity:** https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity
- **[S21] W3C — Privacy Principles:** https://www.w3.org/TR/privacy-principles/
- **[S22] MDN — `sendBeacon()`:** https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
- **[S23] Google Search Central — Title links:** https://developers.google.com/search/docs/appearance/title-link
- **[S24] Google Search Central — JavaScript SEO basics:** https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- **[S25] Google Search Central — Supported meta tags:** https://developers.google.com/search/docs/crawling-indexing/special-tags
- **[S26] Google Search Central — Canonical URLs:** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **[S27] Google Search Central — Build and submit a sitemap:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- **[S28] web.dev — Web app manifest:** https://web.dev/learn/pwa/web-app-manifest/
- **[S29] W3C — WCAG 2.2 Recommendation:** https://www.w3.org/TR/WCAG22/
- **[S30] W3C WAI — Evaluating web accessibility:** https://www.w3.org/WAI/test-evaluate/
- **[S31] W3C WAI — Easy Checks:** https://www.w3.org/WAI/test-evaluate/preliminary/
- **[S32] MDN — `prefers-reduced-motion`:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- **[S33] MDN — `forced-colors`:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors

