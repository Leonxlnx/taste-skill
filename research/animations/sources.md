# Animation Sources

*Checked 2026-07-19. Primary standards, official documentation, public repositories, and first-party case studies used for `libraries.md`, `patterns.md`, and `../../rules/animations.md`.*

## Standards and browser platform

- [WCAG 2.2: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) — disabling non-essential interaction-triggered motion.
- [WCAG 2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — control for automatic movement and updates.
- [WCAG 2.2: Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) — flashing safety.
- [WCAG 2.2: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — simple alternatives to dragging.
- [WAI carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) — autoplay, focus, and rotation control.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) — platform preference and substitution.
- [MDN: `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style) and [transition behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior) — native entry/exit and discrete transitions.
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) and [usage](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) — same- and cross-document continuity.
- [W3C View Transitions Level 1](https://www.w3.org/TR/css-view-transitions-1/) and [Level 2](https://www.w3.org/TR/css-view-transitions-2/) — normative model and evolving features.
- [MDN: scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) — native scroll and view timelines.
- [MDN: Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) — runtime playback control.
- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — visibility thresholds.
- [MDN: interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size) and [calc-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size) — intrinsic-size animation and current limitations.
- [web.dev: high-performance animations](https://web.dev/articles/animations-guide) and [layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) — rendering pipeline and profiling.

## Open skills and design guidance

- [Emil Kowalski skills](https://github.com/emilkowalski/skills) and [MIT license](https://github.com/emilkowalski/skills/blob/main/LICENSE) — purpose/frequency gate, review workflow, opportunity filtering, and vocabulary.
- [Official GSAP skills](https://github.com/greensock/gsap-skills) — current implementation, lifecycle, framework, ScrollTrigger, and performance patterns; MIT-licensed guidance.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) and [agent skill](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) — causal, interruptible, reduced motion and `transition: all` guidance.
- [Vercel React View Transitions skill](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-view-transitions/SKILL.md) — continuity, direction, opt-in transitions, and degradation.
- [Impeccable animation reference](https://github.com/pbakaus/impeccable/blob/main/skill/reference/animate.md) — motion budgets, brand/product distinction, audit ideas, and several cookbook effects rejected by this research.
- [Addy Osmani Web Quality Skills](https://github.com/addyosmani/web-quality-skills) — performance and accessibility QA support.
- [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) and [choreography](https://carbondesignsystem.com/elements/motion/choreography/) — productive versus expressive motion.
- [Atlassian motion](https://atlassian.design/foundations/motion) and [application guidance](https://atlassian.design/foundations/motion/applying-motion) — timing, origin, focal hierarchy, and property restraint.
- [Adobe Spectrum motion](https://spectrum.adobe.com/page/motion/) — purposeful micro and macro motion.
- [IBM animation guidance](https://www.ibm.com/design/language/animation/tips-and-techniques/) — focal points, physicality, density, and typography.
- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) — brevity, frequency, cancellation, gesture consistency, and alternatives.
- [Fluent 2 motion](https://fluent2.microsoft.design/motion) — choreography and distance-aware timing.
- [Figma: Principles in Motion](https://www.figma.com/blog/principles-in-motion/) — references beyond current motion trends.

## Libraries and licenses

- [GSAP docs](https://gsap.com/docs/v3/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Flip](https://gsap.com/docs/v3/Plugins/Flip/), [matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/), and [context](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/) — advanced engine behavior and cleanup.
- [GSAP standard license](https://gsap.com/community/standard-license/) — no-charge commercial website use and visual-builder restrictions.
- [Motion repository](https://github.com/motiondivision/motion), [performance](https://motion.dev/docs/performance), and [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) — MIT framework engine.
- [Anime.js repository](https://github.com/juliangarnier/anime) and [documentation](https://animejs.com/documentation/) — MIT general engine.
- [React Spring](https://github.com/pmndrs/react-spring) and [reduced motion](https://react-spring.dev/docs/utilities/use-reduced-motion) — MIT physics engine.
- [AutoAnimate](https://auto-animate.formkit.com/) — MIT automatic layout continuity.
- [Lenis](https://github.com/darkroomengineering/lenis) — MIT smooth-scroll infrastructure and current caveats.
- [Swup](https://github.com/swup/swup) and [accessibility plugin](https://swup.js.org/plugins/a11y-plugin/) — MIT server-rendered navigation lifecycle.
- [Rive web runtime](https://github.com/rive-app/rive-wasm), [state machines](https://rive.app/docs/runtimes/state-machines), and [best practices](https://rive.app/docs/getting-started/best-practices) — interactive vector assets.
- [dotLottie web](https://github.com/LottieFiles/dotlottie-web) and [official player docs](https://developers.lottiefiles.com/docs/dotlottie-player/dotlottie-web/) — authored vector playback.
- [Three.js](https://github.com/mrdoob/three.js), [rendering on demand](https://threejs.org/manual/en/rendering-on-demand.html), and [cleanup](https://threejs.org/manual/en/how-to-dispose-of-objects.html) — 3D rendering and lifecycle.
- [Theatre.js](https://github.com/theatre-js/theatre) — visual choreography tool with separate core and Studio licenses.

## Production examples

- [Chrome View Transition case studies](https://developer.chrome.com/blog/view-transitions-case-studies) — shared-element continuity in production.
- [Stripe globe](https://stripe.com/blog/globe) — semantic 3D with a measured static fallback.
- [Stripe Connect frontend](https://stripe.com/blog/connect-front-end-experience) — product demonstration rather than decorative motion.
- [Shopify Boring Edition](https://www.shopify.com/news/how-we-built-boring-edition) — concept-led expressive work and heavy prototyping.
- [Buffer homepage hero](https://buffer.com/resources/how-we-designed-and-built-the-new-buffer-homepage-hero/) — bounded, responsive, accessible hero interaction.
- [Vercel homepage craft](https://rauno.me/craft/vercel) — progressive enhancement and quiet space between animated sections.
- [Locomotive Lightship](https://locomotive.ca/en/work/lightship-1) — replacing scroll heaviness with navigable progressive disclosure.

## Sources deliberately not adopted as rules

- [Removed OpenAI curated frontend skill (archived commit)](https://github.com/openai/skills/blob/30444aed500c00c85294d12074f6e3ee794f808a/skills/.curated/frontend-skill/SKILL.md) — its motion quota is rejected; motion must be allowed to total zero.
- [Awesome Copilot premium frontend skill](https://github.com/github/awesome-copilot/blob/main/skills/premium-frontend-ui/SKILL.md) — useful as a catalog of common preloader, cursor, parallax, pinning, SplitText, and smooth-scroll slop patterns, not as Taste Skill guidance.
- Motion’s open repository includes general maintenance skills, but its animation-specific AI kit is a paid product. It is not described here as an open animation skill.
