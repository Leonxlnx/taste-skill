# Interaction and Motion Category Architecture

## Executive position

Interaction and motion should not be organized as a catalogue of effects, animation libraries, or component recipes. The durable architecture is:

1. **User purpose** — what the person is trying to do.
2. **System state** — what is true before, during, and after the action.
3. **Interaction contract** — how the action is discovered, operated, acknowledged, completed, cancelled, or recovered.
4. **Motion treatment** — whether movement materially clarifies that state change.

This ordering prevents the common failure in portfolio and landing-page work where an effect is selected first and content, semantics, input support, and performance are forced to fit it. Motion is a presentation of transition, not the transition itself.

The core loop is:

> **Invite → act → acknowledge → resolve or recover**

Every interactive feature should have a static, semantic state model before it receives motion. A useful motion rule can always name the relationship it explains: trigger to result, old location to new location, hidden content to revealed content, or pending work to completion. If no such relationship exists, the motion is decorative and belongs behind stricter contextual permission.

This report covers portfolios, content/marketing websites, and landing pages. These surfaces can be highly expressive, but they are still documents and interfaces: people must be able to navigate, inspect, submit, play, pause, and leave without mastering a bespoke interaction language.

## Evidence model

The architecture uses three kinds of evidence:

- **Normative web requirements:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Pointer Events](https://www.w3.org/TR/pointerevents3/), [Media Queries](https://www.w3.org/TR/mediaqueries-5/), and CSS specifications.
- **Interaction patterns:** the WAI [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/) (APG). APG is informative rather than a production component library; its own introduction says examples are illustrative and testing remains essential ([APG introduction](https://www.w3.org/WAI/ARIA/apg/about/introduction/)).
- **Purpose and performance guidance:** Apple Human Interface Guidelines, Carbon Design System, web.dev, and Chrome developer documentation.

Where these sources differ in taste or timing values, this report extracts the invariant: motion should be purposeful, input-independent, interruptible where needed, respectful of user settings, and cheap enough not to delay feedback.

## 1. The two-axis model

### 1.1 Axis A: user purpose

| Purpose | User question | Primary categories |
| --- | --- | --- |
| Orient | “Where am I, and what can I do here?” | affordance, current location, focus, available/unavailable states |
| Move | “How do I get there and return?” | links, navigation, anchors, scrolling, route/page transitions |
| Reveal and inspect | “What is behind or attached to this?” | disclosure, accordion, tabs, menus, popovers, tooltips, dialogs |
| Choose and enter | “How do I express a value?” | controls, selection, forms, validation, autocomplete |
| Commit | “Did the action happen, and can I undo it?” | submission, pending, confirmation, destructive-action recovery |
| Manipulate | “Can I move, resize, reorder, scrub, pan, or zoom this?” | drag, slider, scrubber, canvas/media manipulation |
| Monitor | “What is changing without a new page?” | status, progress, live updates, notifications, interruption |
| Browse a sequence | “What comes next, and can I control the pace?” | carousel, gallery, stepper, playlist, pagination |
| Consume media | “Can I play, pause, understand, and control this?” | video, audio, animated media, captions, transcript |
| Experience a narrative | “How does the story unfold?” | editorial pacing, scroll-linked narrative, expressive transitions |

### 1.2 Axis B: system state

The same visible component may pass through several states. The skill should require authors to specify the states that apply, rather than generate a universal state soup.

| State family | Typical states | Required communication |
| --- | --- | --- |
| Availability | available, unavailable, disabled, read-only | visually and programmatically distinct; reason or route forward where useful |
| Attention | rest, hover, keyboard focus, focus-within | hover never carries unique functionality; focus remains visible and unobscured |
| Activation | pressed, released, cancelled, repeated | immediate feedback; action occurs at the safe activation point; duplicate activation handled |
| Choice | unselected, selected, checked, mixed, current | state is not color-only and is exposed through native semantics or ARIA |
| Disclosure | collapsed, opening, expanded, closing | control owns the transition; state is available independent of animation |
| Layer | closed, opening, open, closing | focus entry, containment, dismissal, and return are defined |
| Manipulation | idle, picked up, moving, over valid/invalid target, dropped, cancelled | location and validity remain perceivable; non-drag alternative exists |
| Work | idle, submitting, pending, partial, complete, failed, offline | acknowledgement precedes latency; status is announced without arbitrary focus theft |
| Media | poster, buffering, playing, paused, ended, error | player controls and alternatives remain operable by keyboard and assistive technology |
| Preference | full motion, reduced motion, data-saving, coarse/fine pointer, hover/no-hover | presentation adapts without removing information or functionality |

States compose. A control can be focused, expanded, and pending at once. Visual rules must not erase one state to show another. In particular, `:hover`, `:focus-visible`, `:active`, `aria-expanded`, `aria-current`, `aria-selected`, `aria-pressed`, `disabled`, `aria-invalid`, and busy/progress states answer different questions and should not be treated as interchangeable styling hooks.

### 1.3 The interaction contract

Every category should be evaluated through six obligations:

1. **Discoverability:** affordance, label, target, and available action are perceivable.
2. **Operability:** the action works with its applicable input modes and follows established key/gesture conventions.
3. **Causality:** the interface immediately acknowledges the action and the result appears connected to its trigger.
4. **State integrity:** visual, DOM, accessibility, URL/history, focus, and scroll states agree.
5. **Exit and recovery:** cancellation, dismissal, back navigation, retry, undo, or correction is available as appropriate.
6. **Adaptation:** reduced motion, input capabilities, viewport, performance, and assistive technology do not break the contract.

## 2. Orient and move

### 2.1 Affordance and interaction states

The rest state must already make important actions recognizable. Hover is confirmation, not discovery. Links should look and behave like navigation; buttons should look and behave like actions. A custom component must expose its name, role, value, and changing state, but native controls are the default because the platform supplies much of this contract.

Minimum state set for an actionable element:

- rest/available;
- hover when a hover-capable pointer is actually available;
- keyboard focus;
- pressed/active acknowledgement;
- selected/current/toggled when the action persists;
- unavailable/disabled only when activation truly cannot proceed;
- pending when activation has started work that has not settled;
- success or failure when a result is not otherwise self-evident.

WCAG requires a visible keyboard focus mode and adds requirements that focus not be obscured by author-created content ([2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [WCAG 2.2](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum)). GOV.UK’s focus-state guidance demonstrates a robust system approach: high-contrast focus styling that survives both light and dark surroundings rather than a subtle brand-colored outline ([GOV.UK focus states](https://design-system.service.gov.uk/get-started/focus-states/)).

Do not use motion as the only indication of hover, focus, selection, success, or error. Apple’s motion guidance likewise says motion should be optional and supplemented rather than carrying important information alone ([Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)).

### 2.2 Navigation and current location

Navigation motion serves orientation, not spectacle. The system should preserve:

- a stable global navigation location;
- a visible current-page/current-section state;
- logical source order and focus order;
- browser history and the expected Back/Forward model;
- deep links and fragment targets;
- focus and scroll placement after navigation;
- a clear escape from temporary layers.

Use ordinary links for destinations. Site navigation generally does not need application-menu keyboard behavior; WAI’s disclosure-navigation example explicitly avoids the `menu` role because normal site navigation is a list of links, not a desktop-style menu widget ([WAI disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)). Use a true menu pattern for a compact list of actions, not merely because the navigation is visually a dropdown.

A dropdown/disclosure navigation should:

- expose expanded/collapsed state;
- open by deliberate activation rather than focus alone;
- keep its links in a logical Tab sequence;
- close with `Escape` and return focus to its trigger when appropriate;
- remain usable without hover;
- not unexpectedly suppress page scrolling with optional arrow-key behavior.

WCAG prohibits changing context merely because an item receives focus ([3.2.1 On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus)) and requires input changes to remain predictable ([3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)). A hover highlight can preview; focus or selection must not silently navigate, submit, or replace the page.

### 2.3 Scroll behavior

Scrolling is a user-controlled navigation mechanism. Preserve native scrolling as the base layer.

#### Native and programmatic scroll

- Do not hijack wheel, trackpad, touch, keyboard, or scrollbar movement to simulate a different scroll model.
- Do not make content accessibility depend on observing a reveal animation. Content should exist and remain readable when animation, script, or observers fail.
- Anchor navigation should leave the destination perceivable and not hidden behind sticky headers; focus should move only when the task requires it, not as a side effect of visual scrolling.
- Smooth programmatic scrolling is optional. CSS defines `scroll-behavior: smooth` with user-agent-defined timing and permits user agents to ignore it ([CSS Overflow 3](https://www.w3.org/TR/css-overflow-3/#smooth-scrolling)); reduced-motion mode should use instant/automatic scrolling.
- Scroll restoration should respect browser expectations. A visual route transition must not reset a Back navigation to the top unless the product intentionally defines and communicates that behavior.

#### Sticky and shrinking chrome

Sticky navigation may maintain orientation, but it must not cover the focused element or a fragment target. Shrinking or hiding chrome on scroll should be reversible by a clear upward movement or focus entry, should avoid oscillation near thresholds, and should not create layout shift.

#### Scroll snap

Use snapping for bounded sequences where each stop is meaningful, not for ordinary document reading. Prefer proximity over mandatory trapping. The CSS Scroll Snap specification requires user agents to let a user escape a snap position ([CSS Scroll Snap 1](https://www.w3.org/TR/css-scroll-snap-1/)); authored layouts should preserve that same principle by avoiding full-page snap prisons, nested ambiguous axes, and unreachable overflow.

#### Scroll-triggered versus scroll-driven

- **Scroll-triggered:** crossing a threshold starts a time-based transition. Use for a one-time, nonessential reveal only when content is already available.
- **Scroll-driven:** progress is tied to scroll distance. Use only when the mapping itself explains progress, comparison, or narrative position.

The CSS specification makes this distinction explicit and provides scroll/view progress timelines that do not require script on every sample ([Scroll-driven Animations 1](https://www.w3.org/TR/scroll-animations-1/)). Prefer declarative browser timelines when support and fallback requirements allow; the architectural requirement is still a static fallback, not adoption of a particular API.

Parallax, pinned chapters, horizontal-on-vertical remapping, and scale/zoom tied to scroll are contextual narrative devices. They must not block reading or navigation, must have a reduced-motion treatment, and must not make the user fight the page to move past a section.

### 2.4 Route and page transitions

Separate the **semantic navigation transaction** from its **visual transition**:

1. update URL/history and document/view state correctly;
2. resolve the destination content;
3. set title, current-navigation state, focus, and scroll position;
4. optionally present the old/new visual relationship through motion.

The View Transition specification deliberately separates instantaneous DOM state change from visual snapshots, avoiding an accessibility-hostile intermediate DOM constructed only for animation ([CSS View Transitions 1](https://www.w3.org/TR/css-view-transitions-1/)). That is the correct conceptual model even when the API is not used.

Page-transition purposes:

- **continuity:** a shared image or card connects a collection item to its detail view;
- **hierarchy:** a forward transition enters a child context and reverse returns;
- **replacement:** a restrained crossfade indicates same-level content change;
- **mode change:** a layer or workspace clearly arrives above or beside existing content.

Requirements:

- navigation works if the transition is skipped, unsupported, interrupted, or rejected;
- motion never delays activation, URL change, or access to destination content merely to complete choreography;
- rapid repeated navigation cancels or resolves to the latest valid destination;
- Back/Forward preserves direction and state without inventing history entries;
- focus is not trapped in a visual snapshot or left on removed content;
- reduced motion uses an instant change or low-motion fade, not spatial travel, zoom, or page flip.

## 3. Reveal and inspect

Progressive disclosure reduces visible complexity only when people can predict what the trigger controls and recover the hidden content. It must not conceal essential information merely to make a composition cleaner.

### 3.1 Disclosure and accordion

A disclosure has a controlling button, expanded/collapsed state, and controlled content. `Enter` and `Space` toggle it; `aria-expanded` reflects the resulting state ([WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)). An accordion is a coordinated group of disclosures with headings; all meaningful controls and content follow the normal Tab sequence ([WAI accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)).

Motion may clarify that content comes from the seam beneath its trigger. It must not:

- delay state exposure until an animation ends;
- animate from zero size in a way that clips focused descendants;
- remove focus while collapsing;
- make deep-linked content inaccessible because its panel starts closed;
- require measurement-heavy JavaScript if native layout can express the state.

Default treatment: short, productive reveal or instant change. Large editorial expansion may use more expressive continuity, but the trigger, content order, and URL/deep-link behavior remain primary.

### 3.2 Tabs

Tabs switch among peer panels without changing the overall context. They are not a generic way to hide long-page sections. Use tabs when labels are short, the options form one set, and users benefit from quick comparison while staying in place.

Follow the established keyboard model: one tab stop enters the tablist, arrow keys move among tabs, and the active tab exposes its panel ([WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)). Automatic activation on focus is appropriate only when panel switching is effectively instantaneous; latency makes manual activation safer.

Motion should communicate same-level replacement, usually a restrained fade or directional continuity tied to tab order. Avoid sliding an entire viewport for a small panel change or moving focus with the visual panel.

### 3.3 Tooltips, hover cards, and popovers

Classify by purpose, not visual shape:

- **Tooltip:** a brief, noninteractive description associated with a trigger; focus remains on the trigger.
- **Hover card / nonmodal popover:** richer supplemental content, possibly interactive; requires a deliberate open/close model.
- **Menu:** a list of actions with established menu keyboard behavior.
- **Dialog:** a focused task or decision in a layer.

WCAG requires additional content shown on hover or focus to be dismissible, hoverable, and persistent until the trigger is removed, the user dismisses it, or it becomes invalid ([1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)). WAI’s tooltip pattern keeps focus on the trigger and recommends a nonmodal dialog pattern when the popup contains focusable elements ([WAI tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)).

Therefore:

- never put essential or interactive content in a hover-only tooltip;
- open hover enrichment from keyboard focus too, but do not change context on focus;
- provide deliberate activation on coarse/no-hover inputs;
- use a small show delay to avoid incidental pointer crossings only if keyboard display remains immediate and predictable;
- keep the pointer corridor stable so moving from trigger to popup does not close it;
- `Escape` dismisses without stealing focus.

### 3.4 Dialogs and layered tasks

A modal is a state-management commitment, not a shadow and scale effect. While open, outside content is inert; focus enters the dialog, Tab stays within it, `Escape` closes it, and focus normally returns to the invoking control ([WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)). A visible close control belongs in the Tab sequence.

Initial focus depends on purpose:

- informative/structured content: focus a static heading or start of content;
- ordinary task: focus the first meaningful control;
- irreversible decision: prefer the least destructive action;
- continuation prompt: the likely safe continuation may be focused.

Motion should express layer hierarchy: backdrop appears, dialog enters from a spatially plausible origin, and the underlying context stays visually stable. Do not animate focus, leave the DOM interactive during a closing animation, or mark a dialog modal without actually preventing outside interaction. The alert-dialog guidance warns that false modal semantics can severely hide still-interactive content from assistive technology ([WAI alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)).

## 4. Choose, enter, and commit

### 4.1 Control states

Controls need an unambiguous distinction among:

- **disabled:** cannot currently be operated;
- **read-only:** value can be inspected but not changed;
- **busy/pending:** action was accepted and work continues;
- **selected/checked/pressed:** a persistent choice exists;
- **invalid:** entered value needs correction.

Do not use disabled styling as a substitute for explaining prerequisites. If the next action is unavailable, either keep it enabled and explain validation on activation, or make the reason and recovery path apparent nearby. A pending submit control should prevent unsafe duplicates while still communicating that the first activation was accepted.

Immediate press feedback should appear in the next paint. web.dev explains that INP measures the delay until the next visual update and recommends a 75th-percentile INP of 200 ms or less for a good experience ([Interaction to Next Paint](https://web.dev/articles/inp), [Optimize INP](https://web.dev/articles/optimize-inp)). The final network result may take longer; the acknowledgement should not.

### 4.2 Forms and validation

Form interaction is a sequence of comprehension, entry, checking, correction, and commitment—not a series of animated input borders.

Use native labels, input types, required states, autocomplete, and built-in behaviors where suitable. WAI notes that native HTML types provide keyboards and controls suited to email, date, number, and time entry, while client validation never replaces server validation ([WAI validating input](https://www.w3.org/WAI/tutorials/forms/validation/)). Be forgiving about formats rather than using overstrict masks that fight typing, paste, dictation, or autofill.

Validation timing should match the task:

- do not show an error for incomplete input while the person is still typing unless live validation is genuinely helpful;
- validate on submit by default for ordinary forms;
- validate on blur only when the value can reasonably be complete and the message will help before later steps;
- reserve character-by-character feedback for criteria such as password requirements or availability, and announce it without excessive live-region chatter.

On failure:

- preserve entered values;
- identify the field and describe the error in text, not color or shake alone;
- state how to correct it when known;
- associate inline error text with its control;
- for multiple errors, provide a summary with links and a clear focus strategy;
- avoid making the user rediscover the failure after an entrance animation.

WCAG requires text identification of detected errors ([3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)). WAI’s notification tutorial recommends concise inline and overall feedback, including linked error summaries and programmatic associations ([WAI user notification](https://www.w3.org/WAI/tutorials/forms/notifications/)). GOV.UK’s validation pattern adds a strong tested default: return the populated page, prefix the page title with “Error,” focus the error summary, and show field-level errors ([GOV.UK validation](https://design-system.service.gov.uk/patterns/validation/)).

On success:

- confirm what happened in persistent language;
- distinguish “saved locally,” “submitted,” “sent,” and “will be reviewed” rather than using a generic checkmark;
- provide the next action, receipt, undo, or return route;
- do not remove success content after a decorative timer.

For legal, financial, data-changing, and other high-consequence actions, make the submission reversible, checked, or reviewable before final commitment as required by WCAG’s error-prevention criteria ([WCAG 2.2 input assistance](https://www.w3.org/WAI/WCAG22/Understanding/input-assistance)).

### 4.3 Pending, progress, and interruption

Feedback levels should reflect system state:

- **acknowledgement:** press/focus/selection state appears immediately;
- **indeterminate pending:** work has started but remaining time is unknown;
- **determinate progress:** meaningful completion can be measured;
- **partial result:** usable content is available while more arrives;
- **complete:** outcome and next step are clear;
- **failure/interruption:** reason, retained work, retry, and alternative are clear.

Do not show a spinner for work that resolves inside the immediate response window; it creates flicker. Do not delay a real pending state merely to keep an animation elegant. Skeletons are appropriate only when they preserve the eventual layout and communicate loading rather than pretending content exists. Never animate a progress indicator independently from actual progress in a way that implies false completion.

Status updates that do not take focus still need to be programmatically determinable. WCAG’s status-message guidance specifically includes “Searching…,” result counts, cart updates, and completion messages and recommends notification without unnecessary interruption ([4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)). Use assertive interruption only for information that truly cannot wait.

## 5. Direct manipulation

Direct manipulation includes dragging, reordering, resizing, sliders, splitters, scrubbers, panning, zooming, and object rotation. It must feel continuous without becoming the only route to the result.

### 5.1 Manipulation state machine

Define these stages before adding physics:

1. **Idle:** object and grab affordance are discoverable.
2. **Pickup:** activation is acknowledged; source and available destinations remain clear.
3. **Move:** the object or a proxy tracks input; scroll and selection conflicts are resolved deliberately.
4. **Target:** valid and invalid targets are distinguishable without color or motion alone.
5. **Drop:** completion occurs at a safe release/confirmation point.
6. **Settle:** the resulting order/value is shown and announced.
7. **Cancel/recover:** `Escape`, pointer cancellation, invalid drop, or undo restores a coherent state.

Pointer capture keeps a manipulation receiving events after the pointer drifts away; the Pointer Events specification uses a custom slider as its motivating example ([Pointer Events: pointer capture](https://www.w3.org/TR/pointerevents3/#pointer-capture)). `touch-action` should declare only the direct-manipulation behavior that must replace browser pan/zoom; avoid globally suppressing native scrolling or pinch zoom.

### 5.2 Input-independent alternatives

WCAG 2.2 requires functionality implemented by dragging to have a single-pointer alternative unless dragging is essential, and requires alternatives to multipoint or path-based gestures ([WCAG 2.2 input modalities](https://www.w3.org/TR/WCAG22/#input-modalities)). Practical alternatives include:

- move up/down buttons for reorder;
- select object, then select destination;
- numeric input paired with a slider;
- zoom buttons paired with pinch/gesture zoom;
- keyboard arrow movement with an announced position;
- explicit previous/next controls for swipe navigation.

The alternative is part of the component, not an accessibility-only afterthought. Apple similarly advises supporting standard gestures, offering alternatives, and not assuming a person can use a specific gesture ([Apple HIG: Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)).

### 5.3 Safe activation and cancellation

Avoid firing consequential pointer actions on `pointerdown`; activate on release/click when the pointer is still valid so users can abort by moving away. During manipulation, handle `pointercancel`, lost capture, window blur, route change, and component removal. A cancelled animation must settle into the actual state, not leave transforms, focus, or `aria-grabbed`-like presentation behind.

Motion in direct manipulation should follow the gesture while contact is active; after release, a short settling transition can clarify the accepted position. Excessive inertia, bounce, magnetism, or delayed following reduces perceived control. Apple’s guidance specifically recommends gesture-linked motion and reducing bounce, scale, and depth motion for people using Reduce Motion ([Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)).

## 6. Browse sequences and media

### 6.1 Carousels, galleries, and steppers

Carousels combine disclosure, navigation, focus, timing, and media. Prefer a static grid or list when simultaneous overview is more useful than sequential browsing.

If a carousel exists:

- provide previous/next controls and, where useful, direct selection;
- identify current position and total count;
- keep controls in a stable location;
- do not move focus when changing slides from a repeated next/previous control;
- hide inactive slides correctly from interaction and accessibility exposure;
- preserve swipe as an enhancement, not the only control;
- avoid auto-rotation by default.

WAI requires an auto-rotating carousel to have a stop/start control, stop when keyboard focus enters, stop on hover, and not restart without explicit request after focus entry ([WAI carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)). WCAG separately requires controls for automatically moving content that lasts more than five seconds and appears alongside other content ([2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

Slide transitions should preserve direction and avoid moving the entire surrounding page. Reduced-motion mode can replace sliding with instant replacement or a restrained fade.

### 6.2 Video, audio, and animated imagery

Media is an interaction system, not ambient decoration. Provide a player with keyboard-operable play/pause, seek, volume/mute, captions, and full-screen controls as applicable. Supply captions for prerecorded synchronized speech and meaningful sound, visual description or alternatives for necessary visual content, and a transcript when it improves access and scanning ([WAI: Making Audio and Video Accessible](https://www.w3.org/WAI/media/av/), [WCAG captions](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded)).

Defaults:

- no audible autoplay;
- user-initiated playback for content media;
- poster image and explicit play affordance;
- pause when media leaves a context only if that behavior is predictable and does not discard position;
- remember user caption/mute choices within a sensible scope;
- do not replace a playable video with a hover-only preview on touch devices.

WCAG discourages automatically starting audio and requires independent pause/stop or volume control when it lasts more than three seconds ([1.4.2 Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)). Silent looping background video is a contextual exception: it should be nonessential, have pause control when it continues beyond five seconds beside other content, respect reduced motion, and fall back to a useful poster.

Media can dominate network and rendering budgets. web.dev recommends avoiding autoplay where possible, using `preload="none"` and a poster for user-initiated video, and lazy-loading offscreen media ([web.dev: Lazy loading video](https://web.dev/articles/lazy-loading-video)). Do not lazy-load the poster or media that is the page’s likely largest-contentful element without measuring the tradeoff.

## 7. Motion as a transition language

### 7.1 Motion purposes

Each motion must belong to one purpose:

| Purpose | What it explains | Examples | Preferred character |
| --- | --- | --- | --- |
| Response | input was received | press, toggle, selection | immediate, tiny, productive |
| Causality | trigger produced result | menu from button, details from card | origin-linked, short |
| Continuity | object/state persists through change | shared card/image, reordering | coherent path, stable identity |
| Hierarchy | relation among layers or routes | dialog over page, parent to child | spatially consistent, reversible |
| Attention | something important changed | error, completion, new status | restrained, nonrepeating |
| Progress | work or narrative advanced | determinate bar, chapter progress | truthful mapping |
| Expression | brand tone or editorial rhythm | hero entrance, project showcase | occasional, contextual, escapable |

Carbon’s distinction is useful: **productive motion** stays subtle during task completion; **expressive motion** is reserved for occasional significant moments. Its strategy begins with hierarchy and user journey, then identifies where motion solves a UX need ([Carbon motion overview](https://carbondesignsystem.com/elements/motion/overview/)). For this skill, productive motion is the site-wide default; expressive motion requires a narrative or brand purpose.

### 7.2 Timing, easing, and distance

Timing is relational, not a universal magic number:

- feedback must be faster than navigation or large spatial change;
- larger distance/area can take longer, but never merely to feel cinematic;
- entrances decelerate into place; exits accelerate away; persistent objects changing position use a standard move curve;
- related elements share timing logic, while stagger is capped so the last item does not become inaccessible or late;
- reverse actions should feel related to forward actions unless a different outcome needs emphasis;
- user-controlled manipulation follows input directly rather than applying an ornamental easing lag.

Carbon’s published scale offers a useful calibration reference—70–110 ms for tiny microinteraction/fade, 150–240 ms for small expansion/system feedback, and 400 ms for a large important change—but these are design-system tokens, not cross-web law. Carbon also caps a staggered sequence at 500 ms in its choreography guidance ([Carbon motion overview](https://carbondesignsystem.com/elements/motion/overview/), [Carbon choreography](https://carbondesignsystem.com/elements/motion/choreography/)). The skill should encode relative tiers and a short default range, not force Carbon’s exact values onto every visual language.

Avoid bounce, overshoot, elastic stretch, and repeated pulsing as defaults. They prolong settling, obscure the true final state, and become tiring at interaction frequency. Contextual spring motion is acceptable when it is brief, directly manipulated, and reduced-motion-safe.

### 7.3 Spatial logic and choreography

- Movement begins near the action or object that caused it.
- Persistent objects take coherent paths; unrelated elements do not cross merely for drama.
- The most important final content settles clearly and is not covered by trailing decoration.
- A new layer moves independently of the stable layer beneath it.
- Same-level replacement uses less depth than entering a child or modal context.
- Direction has stable meaning within a locale and flow; do not encode “forward” as a fixed physical right direction without considering writing direction.
- Stagger communicates order only when an order matters. Do not cascade every card on every scroll.

### 7.4 Microinteractions

A microinteraction is the smallest complete interaction loop, not a small animation. It includes trigger, rules, feedback, and resulting state. Examples: copy-to-clipboard, favorite toggle, password reveal, nav-menu disclosure, or add-to-cart acknowledgement.

For each microinteraction specify:

- trigger and all input equivalents;
- initial and final states;
- immediate acknowledgement;
- persistence scope;
- pending/failure path;
- accessible announcement if the result is otherwise invisible;
- reduced-motion treatment;
- repeated/rapid activation behavior.

Decorative icon movement may reinforce feedback but cannot replace a changing label/state. For example, a copy icon that morphs to a check still needs a textual or programmatic “Copied” result.

### 7.5 Narrative motion

Narrative motion is allowed primarily for portfolios, campaign/landing-page editorial sections, and demonstrations where progression itself is meaningful. It should be classified separately from task interaction because its success criteria are different: pacing, sequence, emphasis, and story continuity.

Guardrails:

- content has a readable static order;
- scrolling remains reversible and does not force a fixed playback speed;
- the narrative never gates primary navigation, pricing, legal terms, or conversion controls;
- pinned sections provide an obvious exit and do not create huge empty scroll distances;
- motion does not oscillate in the periphery or simulate uncontrolled camera travel;
- reduced motion presents the complete story through static frames, cuts, or simple fades;
- media and animation can be paused when they continue automatically;
- mobile treatment is composed for the smaller viewport rather than merely cropping desktop choreography.

Apple’s motion guidance says purposeful motion can convey status and instruction but warns against gratuitous movement and recommends motion alternatives ([Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)). WCAG’s animation-from-interactions guidance names parallax as commonly nonessential and requires interaction-triggered motion to be disableable at AAA ([2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)). The skill should adopt this as a product default even when formal conformance targets only AA.

## 8. Cursor, pointer, and input modes

### 8.1 Capability, not device labels

Do not infer interaction from “desktop” or “mobile.” A laptop can have touch, mouse, keyboard, pen, and assistive input concurrently. CSS interaction media features describe the primary pointer’s accuracy and hover ability, while `any-pointer`/`any-hover` describe the union of available pointing devices. The specification warns against relying on hover or accurate pointing merely because one available device supports it ([Media Queries 4: interaction media features](https://www.w3.org/TR/mediaqueries-4/#mf-interaction)).

Design the base experience for:

- keyboard and switch-like sequential focus;
- coarse pointer with no hover;
- fine pointer with hover;
- touch/pen direct manipulation;
- zoom, voice control, and assistive technology that activates semantic controls.

Then enhance:

- hover previews only under convenient hover capability;
- denser targets only where a fine pointer does not make coarse-input use worse;
- pointer-following decoration only when it does not obscure, lag, or imply false targets;
- drag, swipe, tilt, and motion input only with explicit alternatives.

WCAG 2.2 requires at least 24×24 CSS pixel targets or sufficient spacing under its AA criterion, with defined exceptions ([WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). A 44×44 CSS pixel default target is a stronger cross-input design target for primary controls; Apple similarly recommends 44×44 points as the default iOS/iPadOS control size and emphasizes spacing ([Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)).

### 8.2 Cursor semantics

Keep the system cursor by default. Cursor shape communicates a platform contract:

- arrow/default for ordinary pointing;
- text cursor for selectable text;
- pointer where the platform convention indicates links/activation;
- resize/grab/grabbing only when that manipulation is real;
- busy/progress only when the indicated scope is actually blocked or working;
- not-allowed only where the action is unavailable and the reason is discoverable.

Custom cursor replacement is a contextual brand effect, not a default interaction style. It must preserve hotspot accuracy, visibility, contrast, platform scaling, and the real cursor’s semantic changes. It should be disabled for coarse/no-hover input and reduced motion, and removed if it adds latency or covers targets/text. A decorative follower should use `pointer-events: none` and must not be mistaken for the actual hit target.

### 8.3 Concurrent inputs and motion actuation

Never disable keyboard or touch because a pointer is detected. State changes from one input must remain coherent when the next action comes from another. Device tilt, shake, camera gesture, or body movement cannot be the only way to operate a feature; WCAG requires a conventional control and a way to disable accidental motion actuation unless essential ([2.5.4 Motion Actuation](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html)).

## 9. Reduced motion and user control

### 9.1 Reduction is a semantic rewrite

`prefers-reduced-motion: reduce` indicates that the user wants nonessential motion removed or replaced because it may cause vestibular discomfort or distraction ([Media Queries 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)). It does not mean “make every duration 1 ms” or “turn off all state feedback.”

Classify each effect:

| Motion type | Reduced treatment |
| --- | --- |
| displacement, parallax, zoom, rotation, depth/camera travel | remove; use cut or restrained opacity change |
| large scale change or spring/bounce | remove; show final geometry directly |
| scroll smoothing and scroll-linked decorative movement | instant/native scroll; static composition |
| shared-element/page travel | cut or short crossfade without spatial movement |
| progress/status animation | retain truthful state, remove looping flourish; use text/value where possible |
| direct manipulation | keep object tracking input because it is necessary feedback; remove inertia/settling flourish |
| decorative loops/background video | pause, replace with poster, or do not start |
| essential instructional animation | provide pause/step controls and a static/text alternative where feasible |

Implement reduction at the motion-definition layer so CSS transitions, Web Animations, canvas, video, and third-party embeds do not drift into inconsistent behavior. For a motion-heavy experience, add a visible site-level motion control as well as respecting the OS/browser preference; persist the choice and let the more restrictive preference win.

### 9.2 Automatic and flashing content

Moving, blinking, scrolling, or auto-updating content that starts automatically, lasts more than five seconds, and runs beside other content needs pause/stop/hide control. Auto-updating information needs pause/stop/hide or frequency control ([WCAG Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)). Avoid any content that flashes more than three times in one second unless it is below the defined thresholds ([WCAG Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)). Do not rely on the user reaching a stop control before a hazardous or disorienting sequence begins.

## 10. Performance architecture

Performance is part of interaction correctness: delayed acknowledgement causes repeat clicks, conflicting state, and lost confidence.

### 10.1 Rendering budget

- Prefer `transform` and `opacity` for high-frequency animation; properties that alter geometry can trigger layout and paint. web.dev documents the rendering pipeline and recommends checking any property beyond transform/opacity rather than assuming it is cheap ([web.dev animation performance](https://web.dev/articles/animations-guide), [Rendering performance](https://web.dev/articles/rendering-performance)).
- Do not make `will-change` a global utility or permanent default. It can create layers and consume memory; apply it narrowly when profiling shows a benefit, then remove it when no longer needed.
- Batch DOM reads and writes; avoid layout reads after style writes in the same frame.
- Avoid scroll handlers that perform layout and paint on every event. Prefer CSS sticky positioning, Intersection Observer for threshold state, and declarative scroll timelines where appropriate.
- Keep animation work off the critical interaction callback. Apply the immediate visual state first, then defer nonessential analytics, persistence, and secondary rendering.
- Cancel animations and observers when elements leave, routes change, or preferences change.

### 10.2 Responsiveness budget

Use 200 ms at the 75th percentile as the field threshold for good INP, segmented across mobile and desktop ([web.dev: Optimize INP](https://web.dev/articles/optimize-inp)). This is an outcome threshold, not permission to delay a pressed state for 200 ms. Feedback should normally paint in the next frame.

Measure the actual interaction:

- input delay;
- event-handler duration;
- presentation delay;
- long tasks and forced layout;
- dropped/partially presented frames during the transition;
- memory/layer growth for repeated route transitions;
- network and decode cost for video/canvas/large imagery;
- layout shift caused by late interactive content.

Test on throttled mobile hardware assumptions, not only a developer workstation. Chrome’s Performance panel supports CPU throttling, frame inspection, long-task and forced-layout diagnosis; its Rendering panel exposes frame statistics, paint flashing, layout shifts, and scrolling issues ([Chrome runtime performance](https://developer.chrome.com/docs/devtools/performance), [Chrome rendering diagnostics](https://developer.chrome.com/docs/devtools/rendering/performance)). Field measurement remains necessary because Core Web Vitals are field metrics and lab traces cannot reproduce every real input sequence ([web.dev Web Vitals](https://web.dev/articles/vitals)).

## 11. Verification protocol

Verification is organized around state transitions and real user purposes, not screenshots of keyframes.

### 11.1 State inventory

For each interactive pattern, record:

- user purpose;
- trigger(s) and input modes;
- initial state;
- intermediate/pending state;
- success/final state;
- failure/cancel state;
- focus before, during, and after;
- URL/history and scroll effects;
- spoken/status feedback;
- full-motion treatment;
- reduced-motion treatment;
- unsupported/JS-failure fallback.

Any blank cell is a likely interaction bug.

### 11.2 Functional matrix

Test every primary path with:

1. keyboard only: Tab/Shift+Tab, Enter, Space, arrows where conventional, Escape, and browser Back;
2. coarse touch: target accuracy, scroll-versus-gesture conflict, orientation change, zoom;
3. fine pointer: hover transit, click cancellation, fast repeated clicks, pointer leaving the target;
4. mixed input: start with touch, continue with keyboard/mouse and vice versa;
5. screen reader with at least the primary browser/platform combinations supported by the product;
6. 200% and 400% zoom/reflow where applicable;
7. reduced motion enabled before load and toggled during a session;
8. slow network/CPU, offline transition, request failure, retry, and stale response;
9. Back/Forward, deep link, reload, and interrupted route transition;
10. empty, long, localized, and dynamic content.

WAI’s preliminary checks provide the minimum keyboard audit: tab to and away from every control, follow a logical order, see focus, operate all functionality, and avoid hover-only behavior ([WAI Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/)). APG support tables are useful for prioritizing combinations but explicitly do not replace product testing across assistive technologies ([APG assistive-technology support](https://www.w3.org/WAI/ARIA/apg/about/at-support-tables/)).

### 11.3 Motion QA questions

- Can the purpose of every motion be stated in one clause?
- Does the static before/after state communicate the same information?
- Does the motion originate from the action or preserve a meaningful object?
- Can the user interrupt, reverse, dismiss, or navigate away without corruption?
- Does rapid repetition converge on the latest valid state?
- Does focus remain visible and land in a logical place?
- Does the reduced version remove displacement, zoom, parallax, and loops rather than merely accelerating them?
- Does the transition remain smooth on a throttled device without long tasks, forced layouts, or dropped frames?
- Does motion stop when hidden, offscreen, or no longer relevant?
- Is expressive motion rare enough that task feedback remains salient?

### 11.4 Failure-mode checks

Explicitly verify:

- animation events never gate business logic or focus restoration without a timeout/cancellation-safe fallback;
- removed nodes do not retain focus or pointer capture;
- modal close during pending work settles both the layer and the request outcome;
- collapsing content cannot hide current focus;
- a route transition cannot show old visuals over a new interactive page indefinitely;
- stale async results cannot overwrite a newer selection;
- duplicate submit prevention does not permanently disable recovery after failure;
- autoplay blocked by the browser produces a usable poster and play control;
- motion preference changes do not leave half-transformed elements;
- scroll reveal failure does not leave content invisible.

## 12. Compact category tree

```text
interaction-motion
├─ foundations
│  ├─ affordance-and-targets
│  ├─ state-model
│  │  ├─ availability
│  │  ├─ attention-focus-hover
│  │  ├─ activation
│  │  ├─ selection-current
│  │  ├─ disclosure-layer
│  │  ├─ manipulation
│  │  └─ work-result-error
│  ├─ input-modes
│  └─ feedback-recovery
├─ orient-and-move
│  ├─ navigation-current-location
│  ├─ focus-order-history
│  ├─ scroll-native-anchor-sticky-snap
│  └─ route-page-transitions
├─ reveal-and-inspect
│  ├─ disclosure-accordion
│  ├─ tabs
│  ├─ tooltip-popover-menu
│  └─ dialog-layer
├─ choose-enter-commit
│  ├─ controls-selection
│  ├─ forms-validation
│  ├─ pending-progress
│  └─ success-error-undo
├─ direct-manipulation
│  ├─ drag-reorder-drop
│  ├─ slider-scrubber-resize
│  ├─ pan-zoom-rotate
│  └─ cancel-alternative-input
├─ sequences-and-media
│  ├─ carousel-gallery-stepper
│  ├─ video-audio
│  └─ autoplay-pause-captions-transcript
├─ motion-language
│  ├─ response-causality
│  ├─ continuity-hierarchy
│  ├─ attention-progress
│  ├─ microinteraction
│  └─ narrative-expression
└─ cross-cutting-constraints
   ├─ cursor-pointer-input-capability
   ├─ reduced-motion-user-control
   ├─ performance
   └─ verification
```

## 13. Boundaries: hard, default, contextual

### Hard boundaries — never simplify away

- All functionality is keyboard operable with no keyboard trap; focus is visible, logical, and not obscured.
- No essential action, content, label, or state is available only on hover, drag, swipe, color, sound, or motion.
- Semantic name/role/value/state and status changes are available to assistive technology.
- Target size/spacing meets WCAG 2.2 AA; primary controls use a larger coarse-pointer-friendly target where layout allows.
- Focus or ordinary input changes do not unexpectedly navigate, submit, open windows, or replace context.
- Drag, complex gesture, and device-motion features have conventional control alternatives unless genuinely essential.
- Dialogs implement real modality, focus entry/containment/return, Escape dismissal, and a visible close route.
- Form errors are identified in text, associated with fields, preserve entered work, and provide correction/review for consequential actions.
- Automatically moving/updating media follows pause/stop/hide rules; audible autoplay is not used; flashing thresholds are respected.
- Captions and other required media alternatives are supplied.
- Reduced-motion mode removes nonessential spatial/depth/scroll-linked motion and preserves information and feedback.
- Interaction state changes do not depend on an animation completing; interruption and failure settle into a coherent state.
- Performance is verified on constrained conditions; animation cannot delay immediate acknowledgement or leave the experience above the INP good threshold in field data.

### Defaults — use unless a clear product reason overrides

- Native HTML semantics and browser behavior before custom widgets or gesture systems.
- Productive, brief, origin-linked motion; instant state changes are acceptable and often preferable.
- No motion is added until its response, causality, continuity, hierarchy, attention, or progress purpose is named.
- Hover is enhancement; deliberate activation opens disclosure and interactive overlays.
- Normal document scroll, proximity/no snap, no scroll hijacking, and no decorative parallax.
- No route/page transition; add one only when continuity or hierarchy materially improves orientation.
- No carousel autoplay, no content-media autoplay, and no custom cursor.
- Form validation on submit, persistent text errors, immediate press acknowledgement, truthful pending state.
- Transform/opacity for frequent animation; no permanent blanket `will-change`; browser-native/declarative behavior before per-frame script.
- Full content is present without entrance/reveal motion; reduced motion falls back to cuts or restrained fades.
- One consistent motion vocabulary across equivalent state changes.

### Contextual permissions — allowed only when the context earns them

- Expressive hero and section entrances for portfolios/campaign pages, provided primary content/action is not delayed.
- Shared-element and directional page transitions where history, focus, scroll, interruption, and reduced motion are complete.
- Scroll-driven narrative, pinned chapters, horizontal remapping, parallax, or zoom only for meaningful editorial storytelling with a static low-motion version.
- Auto-rotating carousel only when rotation itself serves the content and full pause/focus/hover controls exist.
- Muted looping background video only when decorative, pausable, lightweight, poster-backed, and disabled under reduced motion.
- Custom cursor or pointer follower only as nonblocking fine-pointer brand decoration with semantic system-cursor fallback.
- Drag, swipe, spring, inertia, haptic, audio, or device-motion enhancement only alongside conventional operation and equivalent feedback.
- Longer or staged choreography only for rare high-salience moments; total sequence must not postpone task access or completion.

The governing test is concise: **if removing the motion leaves the state change unclear, fix the state model first; if removing it leaves the interaction clear, motion may be added only when it improves orientation, feedback, or narrative enough to justify its accessibility and performance cost.**
