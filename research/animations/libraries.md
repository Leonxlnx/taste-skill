# Animation Libraries

*Research date: 2026-07-19. Scope: landing pages, portfolios, and normal websites.*

## Decision

Use the smallest capable layer. A library supplies control, not taste.

1. Keep the change static when motion has no job.
2. Use CSS for ordinary state changes.
3. Use native APIs for entry, view continuity, scroll progress, or runtime playback when they are sufficient.
4. Choose one general engine: Motion for component-led React/Vue work, Anime.js for moderate framework-neutral work, or GSAP for advanced choreography.
5. Add a specialist runtime only when a real asset or 3D concept requires it.

There is no animation quota. A finished site may need no library and very little motion.

## Selection matrix

| Tool | Best use | Main risk | Decision |
| --- | --- | --- | --- |
| CSS transitions | Hover, focus, press, disclosure, popover, simple state changes | `transition: all` and motion on every control | Default |
| CSS keyframes | Short predetermined sequences and real continuous indicators | Generic loops and sitewide reveal presets | Default when needed |
| `@starting-style` | Native entry/exit for dialogs, popovers, notices, inserted content | Scaling every inserted element from zero | Default with fallback |
| View Transitions | Thumbnail-to-detail, gallery continuity, restrained route changes | Cinematic wipe on every link | Preferred for real continuity |
| CSS scroll timelines | Reading progress or one meaningful scroll-mapped relationship | Blanket parallax and hidden content | Contextual; support is still limited |
| WAAPI | Runtime keyframes, cancellation, reversal, and playback control | Rebuilding a complex engine by hand | Native middle layer |
| IntersectionObserver | One-shot triggers and pausing offscreen work | Observing every paragraph for fade-up | Default trigger API |
| AutoAnimate | Added, removed, or reordered list/grid children | Uniform animation on every container | Small utility |
| Motion | React/Vue presence, layout, shared elements, gestures, springs | `layout` or springs on everything | Preferred framework engine |
| Anime.js | Moderate vanilla/framework-neutral timelines, SVG, drag | Duplicating GSAP or Motion | Good compact engine |
| React Spring | Interruptible physics and gesture-led React work | Bounce used as a default transition | Specialist React option |
| GSAP | Timelines, ScrollTrigger, Flip, drag, text, paths, SVG, precise control | Powerful effects applied without a concept | Preferred advanced engine |
| Swup | Full server-rendered page lifecycle beyond native transitions | Router, focus, history, and cleanup complexity | Contextual |
| Lenis / ScrollSmoother | WebGL or narrative scroll synchronization | “Premium smooth scroll” and altered input feel | Rare |
| Rive | Authored interactive vector state machines | Generic mascot or hero filler | Specialist |
| dotLottie | Authored vector sequence playback | Stock loops and moving icons everywhere | Specialist |
| Three.js | Real 3D, shaders, spatial interaction, product models | Standard orb, particles, or liquid blob | Rare signature feature |
| Theatre.js | Visually authored complex DOM/3D choreography | Heavy authoring layer for a simple timeline | Rare development tool |

## Native platform

### CSS

CSS transitions are the first choice for known state changes because they retarget naturally when interrupted. Declare individual properties; never use `transition: all` as a default.

`@starting-style` and discrete transitions are now practical for native popovers, dialogs, and elements entering from `display: none`. Older browsers and webviews still need a complete immediate-state fallback.

`interpolate-size` and `calc-size()` can improve small disclosure transitions, but remain limited and cause layout work. Scope and profile them; unsupported browsers should open content immediately.

### View Transitions

Use View Transitions when the same object persists across state or page changes:

- portfolio card image to case-study hero;
- gallery thumbnail to selected media;
- filtered work retaining object identity;
- short route crossfade when no stronger spatial relationship exists.

Same-document support is now broadly useful. Cross-document transitions remain same-origin and require both pages to opt in. Feature-detect, keep names unique, preserve focus/history separately, and switch immediately under reduced motion.

### Scroll and runtime APIs

Use CSS scroll timelines only when progress itself carries meaning. They remain a progressive enhancement, not a content gate.

Use WAAPI when code needs an `Animation` handle, computed keyframes, pause, reverse, cancel, or runtime timing. Use IntersectionObserver for threshold events, not continuous progress. Reuse observers and leave content readable if JavaScript fails.

## General engines

### GSAP

Choose GSAP when CSS or a framework primitive cannot cleanly express the required choreography.

| Capability | Valid use | Default misuse |
| --- | --- | --- |
| Core timelines | Coordinated, reusable multi-step sequences | Long chains for an ordinary hero |
| ScrollTrigger | Bounded explanation, progress, one justified pin | Trigger on every section |
| Flip | Reorder, filter, grid-to-detail continuity | Every responsive reflow |
| Draggable / Inertia | Direct manipulation with visible alternatives | Novelty drag-only navigation |
| SplitText | One typographically important line/word sequence | Every heading split and staggered |
| SVG plugins | Authored path, drawing, or morph story | Generic logo draw on each load |
| ScrollSmoother | A tested synchronized narrative | Global smoothness by reflex |

Requirements:

- register only used plugins;
- keep ScrollTrigger on a top-level tween or timeline;
- use `gsap.matchMedia()` for breakpoints and reduced motion;
- scope selectors and revert contexts on teardown;
- in React, prefer `useGSAP()` or a reverted `gsap.context()`;
- refresh only after real layout changes;
- test pins, scrub, split text, font loading, mobile, and rapid reversal.

GSAP is free for ordinary commercial websites but uses Webflow’s no-charge proprietary license, not MIT. AI-generated GSAP code is explicitly allowed. Products competing with Webflow’s visual animation builder have restrictions, so a future visual animation editor requires a new license review. The separate official GSAP AI-skills repository is MIT-licensed.

### Motion

Choose Motion when React or Vue component state owns the motion:

- mount/unmount presence;
- layout and shared-element transitions;
- drag, hover, tap, springs, and motion values;
- component-level scroll behavior.

Use current `motion` / `motion-v` packages; Framer Motion is the former name. Apply `useReducedMotion` or global reduced-motion configuration. Avoid adding presence or `layout` to every component and never let Motion and GSAP control the same transform.

### Anime.js, React Spring, AutoAnimate

- **Anime.js:** good MIT framework-neutral alternative for a compact timeline, SVG, draggable behavior, scopes, or WAAPI integration. Do not add it beside GSAP for the same job.
- **React Spring:** choose only when velocity, physical interruption, gesture response, or React Three Fiber is central. It is not needed for ordinary fades and disclosures.
- **AutoAnimate:** useful for list, grid, tag, and validation-message continuity. It respects reduced motion by default, but should not become the site’s brand motion system.

## Scroll and page infrastructure

### Smooth scroll

Lenis and ScrollSmoother are infrastructure, not polish. Add one only when a specific synchronized composition needs it.

- never stack them or combine them with another smoothing layer;
- do not slow wheel or touch input for a cinematic feel;
- preserve anchors, keyboard scrolling, pinch zoom, nested scroll, modals, and focused elements;
- keep direct touch scrolling when possible;
- do not instantiate smoothing for reduced-motion users;
- remove RAF/ticker hooks and destroy the instance on teardown.

### Page transitions

Try native View Transitions first. Use Swup only when a server-rendered site needs caching, interception, hooks, scroll restoration, or a broader navigation lifecycle. Then verify titles, metadata, focus, announcements, back/forward, hashes, failure states, script cleanup, reduced motion, and JavaScript-disabled navigation.

Barba remains an option for bespoke choreography but requires more manual accessibility and lifecycle ownership. It is not a default recommendation.

## Specialist tools

- **Rive:** require a meaningful interactive state machine, semantic HTML outside the canvas, a still fallback, explicit reduced motion, offscreen pause, and `cleanup()`.
- **dotLottie:** use for supplied branded motion assets; freeze offscreen, destroy on teardown, provide a still/text alternative, and avoid stock loops.
- **Three.js:** require real 3D value. Keep copy and controls in DOM, cap resolution, render on demand, pause when hidden, dispose GPU resources, and provide a static fallback.
- **Theatre.js:** reserve for complex visually authored synchronization. Core and Studio have different licenses; the public project’s 1.0 status should be rechecked before adoption.

## Recommended stacks

| Site | Normal stack |
| --- | --- |
| Ordinary landing page | CSS + `@starting-style`; optional View Transitions |
| React/Vue product page | CSS + Motion |
| Editorial portfolio | CSS + View Transitions; Motion or Flip for work continuity |
| Complex narrative portfolio | CSS + GSAP and only required plugins |
| Server-rendered multi-page site | Native View Transitions, then Swup only if needed |
| Interactive illustration | Base stack + Rive |
| Genuine 3D experience | Base stack + Three.js; optional GSAP for orchestration |

One general engine plus native CSS is the normal ceiling.

## Dependency gate

Before adding a tool, answer:

1. What exact job cannot be expressed by the current stack?
2. What does the motion communicate?
3. Who owns each animated property?
4. What is the reduced-motion and unsupported-browser result?
5. What happens on touch, keyboard, narrow screens, and low-end hardware?
6. How is every instance, listener, observer, and frame loop cleaned up?
7. Does the license allow the actual product?

If the answers are vague, use the native solution or keep it static.
