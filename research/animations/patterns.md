# Animation Patterns

*Research date: 2026-07-19. Scope: landing pages, portfolios, and normal websites.*

## Main finding

High-quality motion is restrained, causal, coherent, and interruptible. AI-slop motion chooses an effect first and forces content into it.

The strongest common guidance from Emil Kowalski’s MIT-licensed skills, established design systems, browser standards, and production case studies is:

- motion must explain state, continuity, hierarchy, feedback, progress, or a brief-earned brand idea;
- frequent actions stay fast or instant;
- movement originates from its trigger or previous state;
- one focal animation leads while surrounding content stays quiet;
- a project uses a small motion vocabulary, not a different effect per section;
- advanced effects are progressive enhancement with static and reduced-motion versions.

There is no minimum number of animations. “Add 2–3 intentional motions” is still a quota and can create purposeless effects.

## 1. Motion gate

Every proposed animation must pass five checks.

| Check | Question | Reject when |
| --- | --- | --- |
| Purpose | What does it communicate? | The answer is only “alive,” “premium,” or “cool” |
| Frequency | How often will it run? | A common action becomes slower or theatrical |
| Access | Can people read and act immediately? | Content, navigation, focus, or errors wait for motion |
| Input | Does it work with keyboard, touch, pointer, and reduced motion? | Motion is the only feedback or interaction path |
| Cost | Can the stack own, clean up, and render it reliably? | It needs conflicting runtimes or fails on mobile |

Valid purposes:

- feedback;
- state change;
- spatial continuity;
- orientation;
- product explanation;
- progress;
- rare, deliberate delight.

Kowalski’s strongest reusable idea is that an opportunity search should reject most candidates and record the rejected ones. Taste Skill should behave as an editor with a delete key, not an effect generator.

## 2. Motion language

Before implementation, define:

- two or three brand qualities such as crisp, calm, playful, editorial, mechanical, or cinematic;
- functional motion for press, disclosure, layered surfaces, route changes, and loading;
- at most one or two expressive families, such as shared-image continuity or a mask reveal;
- timing and easing tokens;
- reduced-motion substitutions;
- one owner for each property and animation family.

Good variation follows role. Controls react quickly, popovers come from triggers, portfolio media may preserve identity, and ordinary reading content stays still.

Bad variation is random: fade, blur, rotation, parallax, scramble, and pinning appear in unrelated sections only because the tools exist.

## 3. Timing, easing, and geometry

These are starting ranges, not hard constants.

| Moment | Starting range |
| --- | --- |
| Press and routine hover | 80–160 ms |
| Tooltip or small popover | 125–200 ms |
| Dropdown or disclosure | 150–250 ms |
| Modal, drawer, or shared layout | 220–420 ms |
| Page continuity | 250–600 ms without blocking navigation |
| Rare expressive beat | 400–700 ms; longer only for real explanation |
| Sibling stagger | 30–70 ms; keep the whole group short |

- Entering or user-responsive motion normally uses a strong ease-out.
- On-screen repositioning or morphing normally uses ease-in-out.
- Linear belongs to time, progress, or one-to-one scroll mapping.
- Exits are usually shorter than entrances.
- Springs are for interruption, momentum, drag, or a deliberately playful settle—not every UI state.

Useful reference curves from Kowalski’s open skill:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Tune them to the project instead of treating them as a universal identity.

Most UI starts near its final state:

- 4–12 px movement for small controls and surfaces;
- 12–32 px for larger editorial elements;
- roughly 0.96–0.99 scale for compact surfaces;
- no `scale(0)` on ordinary menus, cards, or dialogs.

Duration should grow with meaningful distance and visual size. Transform origin should point back to the cause: menu to trigger, drawer to edge, project image to thumbnail. Center remains correct for a true modal.

## 4. Patterns that age well

| Pattern | Good use | Boundary |
| --- | --- | --- |
| Anchored disclosure | Menu, popover, or panel appears from its source | Keep focus and state immediate |
| Shared-element continuity | Work thumbnail becomes case-study media | Use only when it is visibly the same object |
| Product demonstration | Show a real workflow, material, or capability | No fabricated product behavior |
| Content-specific interaction | Motion exposes a property of the actual work | Do not paste the same effect onto another brand |
| Guided disclosure | Complex explanation advances in readable stages | Keep manual navigation and a static flow |
| Editorial rhythm | A few transitions pace image and text chapters | Quiet sections are necessary |
| Scroll-linked explanation | Progress, comparison, or spatial sequence | Scroll position must map to meaning |
| Concept-led expressive mode | Campaign mechanism is the core idea | Rare, prototyped, and fully accessible |
| Semantic 3D hero | Model or world explains the product | Static fallback and strict performance gate |

### Hero

- Keep navigation, headline, and primary action available immediately.
- Give the supporting visual one concept-specific motion idea.
- Use two to four coordinated beats at most when an entrance is justified.
- Skip or reduce the sequence on repeat navigation.
- Do not add a loader to an already usable static page.

### Section entrance

Animate only when the entrance establishes hierarchy, assembles a diagram, starts a case-study chapter, or introduces a real group. Ordinary body copy, FAQs, pricing, legal text, and core navigation should remain visible.

### Text

Line or word splitting is justified only when typography is a primary part of the composition and reading order benefits. Preserve one coherent accessible string, recalculate after fonts and resize, and return static text for reduced motion.

Avoid character animation, scramble, typewriter, or rotating words as a generic headline treatment.

### Images and work

Use:

- continuity from project grid to detail;
- a mask or clip that belongs to the image framing;
- a bounded crop or comparison;
- media motion that reveals a property of the work.

Avoid the same wipe, zoom, tilt, and parallax on every image.

### Hover and press

Hover should clarify affordance or preview useful content. Gate it with `(hover: hover) and (pointer: fine)`, keep `:focus-visible` equally clear, and provide touch access.

Press feedback may use a very small translation or `scale(0.97–0.99)` when it suits the control. The action must not wait for the animation.

### Page continuity

Prefer a shared project image, stable grid/navigation, or short crossfade. Avoid full-screen wipes, zoom tunnels, and loaders on every route. Back and forward direction must remain logical.

### Scroll

Use native document scroll. Link animation to scroll only for progress, comparison, or staged explanation.

A pinned scene is allowed when one stable visual changes while a genuine story advances. It needs reasonable length, visible exit, touch/keyboard support, and linear mobile/reduced-motion alternatives. A row of cards does not become a story merely because it moves horizontally.

### Ambient motion

One quiet brand-specific loop may work. Stop it offscreen, while hidden, and for reduced motion. Several simultaneous marquees, floating shapes, gradients, videos, or orbiting icons compete with reading.

## 5. Default-reject patterns

These are contextual techniques, not universal bans. Reject them when the brief and content have not earned them.

- universal opacity-plus-`translateY` reveal;
- identical stagger on every card grid;
- hero loader and long entrance chain;
- SplitText on every heading;
- rotating buzzword headlines;
- scramble or typewriter labels;
- Lenis installed as a quality badge;
- custom cursor, follower dot, pointer trail, or magnetic buttons;
- 3D tilt on ordinary cards;
- generic sphere, particle field, liquid blob, or gradient mesh;
- multi-layer parallax behind reading text;
- full-page snap and repeated viewport pins;
- fake horizontal scroll for an ordinary gallery;
- automatic logo, testimonial, or text marquee;
- pulsing CTA and continuous floating decoration;
- counters animating every statistic;
- bounce or elastic easing on routine actions;
- cinematic transition on every link;
- motion quota or mandatory effect category.

Also reject engineering shortcuts:

- `transition: all`;
- hidden content that depends on JavaScript;
- several runtimes controlling the same transform;
- scroll or pointer coordinates in component render state every frame;
- permanent page-wide `will-change`;
- a new timeline or trigger on every render;
- uncleaned listeners, observers, frames, triggers, and media instances.

## 6. Accessibility and reduced motion

Treat WCAG 2.3.3 as a product default: non-essential interaction motion must be disableable or respond to motion preference.

Reduced motion should:

- remove large travel, zoom, rotation, parallax, 3D tilt, bounce, and loops;
- replace shared movement with a short fade or immediate state change;
- retain focus, selection, progress, success, and error feedback;
- keep all content and controls complete;
- stop autoplay video, Rive, Lottie, WebGL, and ambient motion where possible.

Do not use a global `0.01ms !important` hack. It can break logic that waits for animation events and does not stop autoplay or scroll interception.

Automatically moving content that lasts more than five seconds beside other content needs pause, stop, or hide controls unless essential. Avoid rapid flashing entirely. Drag, swipe, pinch, and path gestures need simple click/tap and keyboard alternatives.

Opacity alone does not remove focus or semantics. Closing surfaces need correct component state, visibility, inertness, and focus management.

## 7. Performance and lifecycle

- Prefer transform and opacity for frequent motion.
- Allow height, clip, mask, filter, SVG, or layout animation only when bounded, sparse, and profiled.
- CSS is not automatically faster than JavaScript; property choice, workload, layers, and cleanup matter more.
- Batch layout reads before writes.
- Use RAF timestamps rather than per-frame increments.
- Apply `will-change` only around measured animation work.
- Pause loops offscreen and while the document is hidden.
- Recalculate geometry after breakpoints, fonts, images, and async content.
- Never depend only on `transitionend` or `animationend` for application state.
- Rapid repeated input must interrupt or retarget instead of stacking timelines.
- Every setup needs matching teardown.

## 8. Minimum QA

Test:

- motion removed entirely;
- reduced motion before load and toggled while open;
- rapid open/close, reverse scroll, Back/Forward, and route changes;
- keyboard, screen reader, touch, mouse, and hybrid input;
- 320 CSS-pixel reflow and 400% zoom;
- font/image loading, resize, and orientation change;
- hidden tab and offscreen behavior;
- throttled CPU and a real lower-powered phone;
- dropped frames, layout work, paint area, and growing listener/animation counts.

Review the most important sequence at 0.25× speed and frame by frame. Then review it again the next day and remove anything that feels theatrical without adding meaning.

## Final direction

Taste Skill v2 should generate calm default motion, selective expressive motion, and explicit reasons for both. The best output is not the site with the most polished effects. It is the site where every movement belongs to the content, brand, state, input, and device—and where nothing breaks when movement is removed.
