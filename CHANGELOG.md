# Changelog

All notable changes to taste-skill live here. The repo follows SemVer-ish discipline: experimental pre-releases iterate freely; stable releases lock the API.

---

## [Unreleased]

## 2.0.0-experimental.1 - audit pass

An external audit of the repo turned up a handful of things that were quietly
broken. This release fixes them. **One change is breaking for Claude Code
plugin users** (skill folders were renamed); `npx skills add --skill` names are
unchanged.

### Breaking

- **Skill folders now match their install names.** For 10 of 13 skills the
  folder and the frontmatter `name:` disagreed - `brutalist-skill/` declared
  `industrial-brutalist-ui`, `taste-skill/` declared `design-taste-frontend`,
  and so on. Claude Code registers a skill by its **folder** name, so every
  install name this README advertised was unresolvable there. The folders were
  renamed to the documented install names, so `npx skills add --skill` keeps
  working exactly as before and Claude Code now agrees with it.
  Claude Code users invoking `/taste-skill:brutalist-skill` should switch to
  `/taste-skill:industrial-brutalist-ui`.
- `scripts/check-skills.mjs` + a CI job now enforce folder-equals-name, so this
  cannot drift again.

### Fixed

- **`skill.sh` returned the wrong path on macOS, silently.** It used
  `declare -A`, which does not exist in bash 3.2 (the macOS system bash); every
  lookup collapsed to index 0 and returned `stitch-skill`'s path for *any*
  argument, with exit status 0. Rewritten in POSIX sh, reading the registry
  from disk, exiting non-zero on an unknown name.
- **Sticky-Stack skeleton (`design-taste-frontend` §5.A)** put CSS
  `sticky top-0` and GSAP `pin: true` on the same element and then transformed
  the pinned element. ScrollTrigger pins by wrapping in a pin-spacer and
  reverting to the element's original `position` on deactivate, so the two
  mechanisms fought at the hand-off, and animating a pinned element invalidates
  the measurements ScrollTrigger pre-computes. Now pins the card and animates an
  inner wrapper; the selector is scoped so two instances on one page do not
  cross-select.
- **Horizontal-Pan skeleton (§5.B)** set `invalidateOnRefresh: true` over a
  distance captured once in a `const`, so a refresh re-measured nothing. `x` and
  `end` are now functions. The track also gained `w-max` and `shrink-0` panels -
  without them the wrapper's `overflow-hidden` compresses the panels,
  `scrollWidth === clientWidth`, and the section pins without panning.
- Broken README anchor `#settings-taste-skill-only`.

### Changed

- **`design-taste-frontend` split into progressive-disclosure references.** The
  SKILL.md was 87KB (~21.8k tokens) loaded in full on every invocation. The
  appendices, the GSAP skeletons, the redesign protocol and the block-library
  contract moved to `references/`, loaded only when the brief calls for them.
  SKILL.md is now ~73KB with pointers, and the reference files carry the detail.
- **`gpt-taste` §1 no longer asks the model to fake a dice roll.** It required
  "simulating" `random.choice()` from a seed derived from the prompt - which is
  deterministic, so the same brief produced the same page forever, directly
  contradicting the "never default to the same UI twice" rule in the next
  sentence. Now: actually run a randomizer if you can execute code, otherwise
  declare the default you are rejecting and why. "Cinematic Center (Highly
  Preferred)" also stopped being labelled preferred, since biasing option 1 was
  the exact failure the section exists to prevent.
- **`full-output-enforcement` no longer tells agents with file tools to stop and
  wait for "continue".** In a harness with a filesystem, the fix for a long
  deliverable is to write files and keep going. The `[PAUSED]` handshake is now
  scoped to plain chat, where the reply is the deliverable.
- **Research citations corrected.** `research/` quoted a "+45% from a $200 tip"
  figure credited to Microsoft Research (it is an informal 2023 Twitter
  experiment, and EmotionPrompt contains no financial framing), credited
  DeepMind's "take a deep breath" result to Microsoft, cited a "LazyBench"
  benchmark and a "December 2025 controlled study" that do not appear to exist,
  and stated the winter-break hypothesis as confirmed when it was never
  replicated. Real papers are now linked with their actual numbers and
  benchmarks; every removed claim is listed as removed, with the reason.
- Skill descriptions rewritten to say *when to use this* and which sibling skill
  to prefer instead, so 13 overlapping design skills route more predictably.
- Em-dashes normalised to hyphens across all skill files. The flagship skill
  bans them outright in generated copy while its siblings used 155 of them,
  including in `stitch-design-taste/DESIGN.md`, the template it tells other
  agents to emit.
- Plugin manifests moved from `1.0.0` (while shipping v2) to
  `2.0.0-experimental.1`, with author and homepage filled in.

### Added

- `package.json` declaring `sharp`, which `scripts/*.mjs` imported without any
  manifest to install it from.
- `.github/workflows/validate.yml` running the skills check and `skill.sh`.

### Repo

- `design-taste-frontend` is **v2 (experimental)**. The previous v1 is preserved
  as `design-taste-frontend-v1`.
- New `CHANGELOG.md` (this file).

---

## v2 (experimental) - the new default for `taste-skill`

v2 (experimental) is a substantial rewrite of the original taste-skill. It keeps the dial-driven philosophy (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) and adds structure, hard rules, and concrete implementation patterns the agent can actually follow.

**This is a pre-release.** It is the new default install because it is genuinely better than v1, but it is still iterating. Refinements may land in any v2 experimental release. The API (install name, dial names, section structure) will stabilize at v2.0.0 stable.

### What's new in v2 (experimental)

**New sections**

- **§0 Brief Inference** - before any code, the agent reads the room (page kind, vibe words, references, audience, constraints) and declares a one-line design read. Anti-default discipline.
- **§2 Brief → Design System Map** - when a brief reads as Material / Fluent / Carbon / Polaris / Atlassian / Primer / GOV.UK / USWDS / Bootstrap / Radix / shadcn / Tailwind, reach for the **official** package. When the brief is an aesthetic (glassmorphism, bento, brutalism, editorial, dark tech, aurora, kinetic typography), use web standards and label the implementation honestly. Apple Liquid Glass is documented as an approximation, not an official package.
- **§8 Dark Mode Protocol** - dual-mode by default, token strategy declared per project, contrast and hierarchy parity enforced.
- **§11 Redesign Protocol** - mode detection (Greenfield / Preserve / Overhaul), audit before touching, modernisation levers in priority order, what never changes silently (URL structure, nav labels, form field names, brand wordmark, legal copy).
- **§12 The Block Library (Contract)** - schema for iteratively adding real, source-backed block implementations (hero, feature, social-proof, pricing, cta, footer, portfolio, transition, navigation).
- **§13 Out of Scope** - explicit list of what taste-skill is NOT for (dashboards, data tables, multi-step forms, code editors, native mobile, realtime collab UIs).
- **§14 Final Pre-Flight Check** - hard checklist. Every box must honestly pass before shipping.

**Hardened bans (Section 9, "AI Tells")**

- **§9.G Em-Dash Ban (complete)** - zero em-dashes (`—`) anywhere on the page. Headlines, eyebrows, pills, body copy, quotes, attribution, captions, button text, alt text. Use a hyphen (`-`) or restructure the sentence. This was the single most-violated stylistic Tell in pre-v2 testing.
- Section numbering eyebrows (`00 / INDEX`, `001 · Capabilities`, `06 · how it works`) banned outright.
- Version labels in hero (`V0.6`, `INVITE-ONLY PREVIEW`, `BETA`) banned unless the brief is explicitly a product launch.
- Photo-credit captions as decoration (`Field study no. 12 · Ines Caetano`) banned unless real attribution.
- Decoration text strips at hero bottom (`BRAND. MOTION. SPATIAL.`) banned.
- Pills / labels overlaid on images banned.
- Version footers (`v1.4.2`, `Build 0048`) banned on marketing pages.
- Locale / city-name / time / weather strips (`Lisbon, working with founders`) banned for 99% of briefs.
- Scroll cues (`Scroll`, `↓ scroll`, `Scroll to explore`) banned.
- Zero decorative status dots by default.
- `border-t` + `border-b` on every row of long lists banned (use a different UI component).
- Scoring / progress bars with filled background tracks banned as comparison visuals.
- Div-based fake product UI (fake task lists / dashboards / terminals built from styled divs) banned.
- Floating top-right sub-text in section headings banned.
- Hand-rolled SVG icons strongly discouraged; use Phosphor / HugeIcons / Radix / Tabler.

**Hardened design rules**

- **Color Consistency Lock** - one accent across the whole page; no random color swaps in section 7.
- **Shape Consistency Lock** - one corner-radius system per page.
- **Button Contrast Check** - every CTA passes WCAG AA contrast (no white-on-white).
- **Hero Discipline** - headline ≤ 2 lines, subtext ≤ 20 words and ≤ 4 lines, CTAs visible without scroll, font scale planned with image size.
- **Navigation** - single line at desktop, height ≤ 80px.
- **"Used by / Trusted by"** logo wall lives UNDER the hero, uses real SVG logos (Simple Icons / devicon), never plain text wordmarks.
- **Section-Layout-Repetition Ban** - across 8 sections, at least 4 different layout families.
- **Bento Cell Count Rule** - N items = exactly N cells; no empty middle or trailing cells.
- **Page Theme Lock** - one theme (light / dark / auto) for the whole page; no mid-page light/dark flips.
- **Italic Descender Clearance** - italic display words with `y g j p q` need `leading-[1.1]` minimum and `pb-1` reserve.
- **Long lists need a different UI component** - `<ul>` + `divide-y` for > 5 items is the lazy default; reach for cards / tabs / marquee / carousel / scroll-snap pills.
- **Long-list-divider-overuse banned** - no `border-t` + `border-b` on every row.

**Animation discipline**

- Motion library standardised on **Motion** (`motion/react`, the rebrand of Framer Motion). Legacy `framer-motion` package still works as alias.
- **§5.A GSAP Sticky-Stack** - canonical code skeleton (`start: "top top"`, `pin: true`, `scrub: true`, transform driven by NEXT card's trigger).
- **§5.B GSAP Horizontal-Pan** - canonical code skeleton (`start: "top top"`, `pin: true`, `end: "+=" + distance`, `scrub: 1`).
- **§5.C Scroll-Reveal Stagger** - lighter Motion-only pattern using `whileInView`. Use this for simple reveals; save GSAP for actual pinning/scrubbing.
- **§5.D Forbidden Animation Patterns** - `window.addEventListener('scroll')`, custom scroll calculations in React state, `requestAnimationFrame` loops touching React state. Banned outright.
- **Reduced motion mandatory** for anything `MOTION_INTENSITY > 3` - wrap in `useReducedMotion()` or `@media (prefers-reduced-motion: reduce)`.
- **"Motion claimed, motion shown"** - pages claiming `MOTION_INTENSITY > 4` must actually animate; otherwise drop the dial to 3 and ship clean static.

**Stack updates**

- Tailwind v4 default; v3 only when the existing project demands it.
- Motion replaces Framer Motion as the recommended import path.
- Icons: Phosphor / HugeIcons / Radix / Tabler (in priority order). Lucide discouraged. Hand-rolled SVG icons banned.

### What's the same

- Three dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) - same spirit, expanded with preset matrix and inference rules.
- Anti-slop philosophy - same direction, harder enforcement.
- Performance guardrails - `transform`/`opacity` only, no `top/left/width/height` animation, hardware acceleration.

### Why we made v2 (experimental) the new default

Pre-v2, the original taste-skill set the right direction but was easy for agents to skim past. Production testing showed the same Tells emerging across builds (em-dash everywhere, section-number eyebrows, "Quietly in use at", decorative dots, fake screenshots out of styled divs, broken GSAP scroll triggers).

v2 closes those gaps with hard rules, canonical code skeletons, and a pre-flight checklist the agent must run. It is the version we now recommend.

### How to pin to v1 if you need it

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend-v1"
```

This installs the original SKILL.md unchanged.

### Stability note

v2 (experimental) is the new default AND it is actively iterating. Refinements may land in any pre-release while we converge on v2.0.0 stable. Breaking changes (rename of install name, removal of sections) will be batched and called out clearly when v2.0.0 stable cuts.

---

## v1 - the original taste-skill

The original release. Dial-driven philosophy, anti-slop rules, reference vocabulary of pattern names. Preserved at `skills/design-taste-frontend-v1/` and installable as `design-taste-frontend-v1`.
