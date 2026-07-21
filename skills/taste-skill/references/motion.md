# Animation Rules

Use these rules for landing pages, portfolios, and content-led websites. They complement the quality reference rather than replacing its motion, accessibility, interaction, or engineering rules.

## Contents

1. [Enforcement](#1-enforcement)
2. [Purpose and restraint](#2-purpose-and-restraint)
3. [Tool selection and ownership](#3-tool-selection-and-ownership)
4. [Timing, easing, and physical logic](#4-timing-easing-and-physical-logic)
5. [Website and portfolio patterns](#5-website-and-portfolio-patterns)
6. [Accessibility, responsiveness, and performance](#6-accessibility-responsiveness-and-performance)
7. [Required verification](#7-required-verification)
8. [Final review](#8-final-review)

## 1. Enforcement

- **HARD:** Required for usable, accessible, truthful, and technically correct behavior.
- **AVOID BY DEFAULT:** A recurring generic or costly pattern. Use it only when the explicit brief, content, brand, or interaction gives it a clear job.
- **CONTEXT CHECK:** A valid advanced technique whose quality depends on execution, frequency, input support, performance, and fallback.

Apply in this order:

1. Follow the explicit request, supplied content, existing project, and approved direction.
2. Preserve a coherent existing motion system unless a redesign was requested.
3. Build the complete static state and interaction first.
4. Name the purpose and expected frequency of each proposed animation.
5. Apply default-avoidance rules only where the project leaves the choice open.
6. Test the rendered result with and without motion.

## 2. Purpose and restraint

### ANI-001 - Follow the real brief

- **Level:** HARD for requested behavior; CONTEXT CHECK for style
- **Rule:** Motion must fit the requested site, content, audience, brand, and stack. Do not force a generic “premium,” award-site, or app-demo motion language onto the project.

### ANI-002 - Give every animation a job

- **Level:** AVOID BY DEFAULT
- **Rule:** An animation must primarily communicate feedback, state, continuity, orientation, progress, explanation, or a rare brief-earned brand moment. “Alive,” “modern,” “premium,” and “cool” are not sufficient purposes.

### ANI-003 - Use frequency as a budget

- **Level:** AVOID BY DEFAULT
- **Rule:** The more often people encounter an animation, the faster, smaller, and quieter it should be. High-frequency navigation, focus, keyboard, and control actions must feel immediate.

### ANI-004 - Never use a motion quota

- **Level:** HARD under Taste Skill authoring policy
- **Rule:** Do not require a hero entrance, hover effect, scroll animation, or any minimum count of animations. Zero expressive animations is a valid result.

### ANI-005 - Never create decorative latency

- **Level:** HARD
- **Rule:** Motion must not delay navigation, content, focus feedback, validation, errors, recovery, or a primary action. Application state changes immediately; animation only explains the change.

### ANI-006 - Define one motion language

- **Level:** AVOID BY DEFAULT
- **Rule:** Choose a small vocabulary from project qualities, functional transitions, at most one or two expressive families, timing/easing tokens, and reduced-motion substitutions. Do not invent a new effect for every section.

### ANI-007 - Keep one focal event

- **Level:** AVOID BY DEFAULT
- **Rule:** In one viewport or interaction, one motion idea leads and supporting elements stay subordinate. Avoid several unrelated animations competing for attention.

### ANI-008 - Let reading content stay still

- **Level:** AVOID BY DEFAULT
- **Rule:** Ordinary body copy, navigation, FAQs, pricing details, legal text, and other reading tasks should normally remain stable and immediately available.

## 3. Tool selection and ownership

### ANI-009 - Use the smallest capable layer

- **Level:** AVOID BY DEFAULT
- **Rule:** Choose in order: no motion → CSS → native browser API → small helper → one general engine → specialist runtime. Do not add a dependency for a transition the platform already handles cleanly.

### ANI-010 - Keep one general engine

- **Level:** AVOID BY DEFAULT
- **Rule:** One of Motion, Anime.js, React Spring, or GSAP should normally own general choreography. Add a second only for a documented capability gap and separate ownership.

### ANI-011 - Keep one owner per property

- **Level:** HARD
- **Rule:** CSS, Motion, GSAP, WAAPI, and other runtimes must not compete for the same element property. State, scroll, and layout ownership must be explicit.

### ANI-012 - Use GSAP for earned complexity

- **Level:** CONTEXT CHECK
- **Rule:** Use GSAP for timelines, ScrollTrigger, Flip, Draggable, SplitText, paths, SVG, morphs, or other control that native primitives cannot express cleanly. Do not select GSAP merely because it is powerful.

### ANI-013 - Implement GSAP with full lifecycle ownership

- **Level:** HARD when GSAP is used
- **Rule:** Register only used plugins, keep ScrollTrigger on top-level tweens or timelines, use `gsap.matchMedia()` for responsive and reduced variants, scope selectors, and revert contexts or `useGSAP()` on teardown. Refresh only after real layout changes.

### ANI-014 - Match framework tools to their real strength

- **Level:** CONTEXT CHECK
- **Rule:** Prefer Motion for React/Vue presence, layout, shared elements, and gestures; Anime.js for moderate framework-neutral work; React Spring when interruption or physics is essential; AutoAnimate only for child add/remove/reorder continuity.

### ANI-015 - Do not install smooth scroll as polish

- **Level:** AVOID BY DEFAULT
- **Rule:** Lenis or ScrollSmoother requires a specific narrative, WebGL, or synchronization need. Preserve wheel, touch, keyboard, anchors, pinch zoom, nested scroll, modals, and focused-element visibility; do not run it for reduced-motion users.

### ANI-016 - Add page-transition infrastructure only when needed

- **Level:** CONTEXT CHECK
- **Rule:** Try native View Transitions first. Use Swup or Barba only when the site needs a broader navigation lifecycle, then own title, metadata, focus, announcements, history, scroll restoration, errors, scripts, and cleanup.

### ANI-017 - Require specialist tools to justify their runtime

- **Level:** CONTEXT CHECK
- **Rule:** Rive needs a meaningful interactive vector asset; dotLottie needs a real authored sequence; Three.js needs genuine 3D or shader value; Theatre.js needs complex visual authoring. Generic mascots, loops, spheres, particles, and blobs do not qualify.

### ANI-018 - Recheck licenses for authoring products

- **Level:** HARD
- **Rule:** Verify the license against the actual product. Ordinary generated websites may use current GSAP commercial terms, but a visual animation-building product needs a separate review. Do not assume “free” means MIT or unrestricted.

## 4. Timing, easing, and physical logic

### ANI-019 - Keep routine motion brief

- **Level:** AVOID BY DEFAULT
- **Rule:** Start around 80–160 ms for press/hover, 125–200 ms for small surfaces, 150–250 ms for disclosures, and 220–420 ms for larger panels or shared layouts. Longer work must be justified by real distance or explanation.

### ANI-020 - Match easing to the event

- **Level:** AVOID BY DEFAULT
- **Rule:** Use strong ease-out for responsive entries, ease-in-out for visible repositioning, linear for time/progress, and springs for direct manipulation or interruption. Do not use visible bounce, elastic, or ease-in as universal UI defaults.

### ANI-021 - Animate from the cause

- **Level:** AVOID BY DEFAULT
- **Rule:** A popover grows from its trigger, a drawer from its edge, and a shared project image from its prior location. A true modal may remain centered. Arbitrary center-origin scaling weakens spatial logic.

### ANI-022 - Start near the final state

- **Level:** AVOID BY DEFAULT
- **Rule:** Small UI normally uses roughly 4–12 px travel and 0.96–0.99 scale; larger editorial elements may use 12–32 px. Avoid `scale(0)` and large travel unless the real spatial relationship requires it.

### ANI-023 - Make exits clear quickly

- **Level:** AVOID BY DEFAULT
- **Rule:** Exits are usually shorter than entrances while following the same spatial path. Never keep an obsolete surface interactive or focused during a long closing animation.

### ANI-024 - Retarget from the current state

- **Level:** HARD
- **Rule:** Rapid repeat, reverse, drag, and resize interactions must interrupt or redirect motion cleanly. Do not stack timelines or restart a keyframe from an unrelated initial state.

### ANI-025 - Stagger only meaningful groups

- **Level:** AVOID BY DEFAULT
- **Rule:** Stagger genuine sibling items only when order or grouping matters. Keep offsets small, cap the total delay, and never block interaction until the cascade finishes.

### ANI-026 - Use springs for physics, not decoration

- **Level:** CONTEXT CHECK
- **Rule:** Springs should preserve velocity, support interruption, or settle direct manipulation. Keep bounce restrained and remove oscillation from routine or sober interfaces.

### ANI-027 - Declare transition properties

- **Level:** HARD
- **Rule:** Never emit `transition: all` as a default. List the properties that belong to the state change so unrelated layout, theme, and responsive changes do not animate accidentally.

## 5. Website and portfolio patterns

### ANI-028 - Keep the hero usable immediately

- **Level:** AVOID BY DEFAULT
- **Rule:** Navigation, headline, and primary action remain available during any hero motion. Use a short coordinated composition only when it supports the concept; avoid fake loaders, long chains, and word-by-word copy by reflex.

### ANI-029 - Do not repeat one reveal across the page

- **Level:** AVOID BY DEFAULT
- **Rule:** Do not assign the same fade, blur, and vertical travel to every heading, paragraph, image, card, and CTA. Use entrances selectively for chapters, diagrams, real groups, and explanatory moments.

### ANI-030 - Treat text motion as high attention

- **Level:** AVOID BY DEFAULT
- **Rule:** Split lines, words, or characters only when typography is central and reading order benefits. Preserve one accessible string, recalculate after fonts and resize, and use static text under reduced motion. Avoid generic scramble, typewriter, and rotating-word headlines.

### ANI-031 - Prefer work continuity over generic page effects

- **Level:** CONTEXT CHECK
- **Rule:** In portfolios, card-to-project, thumbnail-to-gallery, and filtered-grid continuity are high-value uses of View Transitions, Flip, or Motion layout. Use them only when the object identity is real.

### ANI-032 - Keep hover informative and input-aware

- **Level:** HARD for input parity; AVOID BY DEFAULT for decoration
- **Rule:** Hover clarifies affordance or previews useful content. Gate it with `(hover: hover) and (pointer: fine)`, keep `:focus-visible` equally clear, and provide touch access. Never move the target away from the pointer.

### ANI-033 - Keep press feedback immediate

- **Level:** CONTEXT CHECK
- **Rule:** A small translation or `scale(0.97–0.99)` can confirm a press when it suits the component. The click, navigation, or state update must not wait for it.

### ANI-034 - Use page transitions for continuity

- **Level:** CONTEXT CHECK
- **Rule:** Prefer a shared object, stable geometry, or short crossfade. Avoid full-screen wipes, zoom tunnels, masks, and interstitial loaders on every route. Back/Forward direction and unsupported-browser navigation must remain correct.

### ANI-035 - Distinguish scroll trigger from scroll progress

- **Level:** HARD
- **Rule:** Use IntersectionObserver or a discrete trigger for “start when visible.” Use a scroll timeline or ScrollTrigger scrub only when visual progress meaningfully maps to scroll progress. Do not simulate either with raw per-frame render state.

### ANI-036 - Preserve native document scroll

- **Level:** AVOID BY DEFAULT
- **Rule:** Do not intercept or slow normal scroll for spectacle. Any smoothing, snapping, or normalization needs a demonstrated benefit, full input parity, an escape path, and native/reduced-motion fallback.

### ANI-037 - Pin only a real sequence

- **Level:** CONTEXT CHECK
- **Rule:** A pinned scene is justified when a stable visual explains several genuine stages. Keep the range reasonable, preserve DOM/focus order, provide a visible exit, and replace it with a linear composition on narrow screens or reduced motion. Do not fake horizontal scroll for an ordinary card row.

### ANI-038 - Limit ambient and automatic motion

- **Level:** AVOID BY DEFAULT
- **Rule:** Allow at most a quiet concept-specific ambient system when it does not compete with reading. Pause it offscreen, in hidden tabs, and under reduced motion. Several marquees, loops, videos, gradients, or floating shapes are noise.

### ANI-039 - Do not replace the cursor by reflex

- **Level:** AVOID BY DEFAULT
- **Rule:** Keep the native cursor unless a custom cursor communicates a real tool state or interaction. Cursor followers, trails, magnetic controls, and universal card tilt require a content-specific reason and complete touch, focus, selection, zoom, and performance QA.

### ANI-040 - Do not fake waiting, progress, or activity

- **Level:** HARD for false state; AVOID BY DEFAULT for decoration
- **Rule:** Use a loader, skeleton, progress sequence, counter, or celebration only for real state or a requested prototype clearly marked as such. Do not delay usable content to display one or count every statistic for drama.

### ANI-041 - Keep carousels and media under user control

- **Level:** HARD
- **Rule:** Prefer manual controls. If rotation or autoplay is justified, pause on focus and hover, provide a visible stop control where required, do not autoplay audible media, and preserve complete access without the animation.

## 6. Accessibility, responsiveness, and performance

### ANI-042 - Design reduced motion per behavior

- **Level:** HARD
- **Rule:** Under `prefers-reduced-motion: reduce`, remove or replace large translation, zoom, rotation, parallax, depth, bounce, scroll-linked travel, and loops. Retain clear focus, selection, progress, success, error, and state feedback.

### ANI-043 - Do not use a global duration hack

- **Level:** HARD
- **Rule:** Do not rely on `* { animation-duration: 0.01ms !important }` or an equivalent universal reset. It can break event-dependent logic and does not stop autoplay, scroll interception, video, canvas, or library timelines.

### ANI-044 - Control persistent movement and flashing

- **Level:** HARD
- **Rule:** Automatically moving content lasting over five seconds beside other content needs pause, stop, or hide control unless essential. Avoid rapid flashing entirely and never exceed WCAG flash thresholds.

### ANI-045 - Preserve semantics, focus, and alternatives

- **Level:** HARD
- **Rule:** Motion is never the only indication or operation path. Keep semantic state and announcements correct, do not visually reorder against DOM order, use correct hidden/inert/focus behavior, and provide simple controls for drag, swipe, pinch, and path gestures.

### ANI-046 - Adapt motion to layout and input

- **Level:** HARD
- **Rule:** Recompose or remove desktop choreography on narrow screens. Derive geometry from the current layout, not fixed desktop pixels; recalculate after breakpoints, zoom, fonts, images, orientation, and async content. Viewport width does not identify input type.

### ANI-047 - Prefer cheap properties but measure exceptions

- **Level:** AVOID BY DEFAULT
- **Rule:** Prefer transform and opacity for frequent motion. Height, width, clip, mask, filter, shadow, SVG, and layout animation are allowed when bounded, sparse, necessary, and profiled. CSS is not automatically faster than JavaScript.

### ANI-048 - Do not promote or rerender everything

- **Level:** HARD
- **Rule:** Apply `will-change` only around measured work. Do not route pointer, scroll, drag, or RAF values through component render state every frame; use motion values, refs, CSS variables, `quickTo()`, or a dedicated loop.

### ANI-049 - Own every lifecycle

- **Level:** HARD
- **Rule:** Cancel frames and WAAPI animations, clear timers, remove listeners, disconnect observers, destroy media/renderers, and revert library contexts/triggers on unmount or navigation. Pause offscreen and hidden-document work without overriding a manual pause.

### ANI-050 - Keep state independent of animation events

- **Level:** HARD
- **Rule:** Application state is the source of truth. Do not depend solely on `transitionend` or `animationend`; canceled transitions and reduced-motion variants may not emit them.

### ANI-051 - Keep first paint and fallbacks complete

- **Level:** HARD
- **Rule:** Do not hide server-rendered content until animation setup completes. Unsupported APIs, failed JavaScript, load failure, reduced motion, and lower-power paths must show the final usable state or a deliberate static fallback.

## 7. Required verification

### ANI-052 - Run motion QA

- **Level:** HARD before delivery
- **Rule:** Test motion removed, reduced motion, rapid reversal, keyboard, screen reader, touch, mouse, hybrid input, Back/Forward, 320 CSS-pixel reflow, 400% zoom, resize, font/image loading, orientation, hidden tabs, throttled CPU, and a representative phone.

### ANI-053 - Inspect feel and performance

- **Level:** HARD for complex motion
- **Rule:** Review important sequences at normal speed, 0.25× speed, and frame by frame. Record dropped frames, layout, paint area, long tasks, GPU/memory pressure, and growing animation or listener counts.

### ANI-054 - Report what remains

- **Level:** HARD
- **Rule:** The handoff must list animation systems used, reduced-motion behavior, responsive substitutions, specialist fallbacks, unverified devices/browsers, performance risks, and any still-missing assets or approvals. Do not describe unverified motion as production-ready.

## 8. Final review

Before shipping, ask:

1. What does each animation communicate?
2. Would any action become faster or clearer without it?
3. Does the page have quiet areas?
4. Does direction match real hierarchy or spatial origin?
5. Can every interaction be reversed immediately?
6. Is all content usable without motion and without JavaScript?
7. Are touch, keyboard, focus, reduced motion, and narrow layouts complete?
8. Is there one clear owner and cleanup path for every animated property?
9. Does every advanced runtime or effect still earn its cost?
10. Which considered animations were deliberately rejected?
