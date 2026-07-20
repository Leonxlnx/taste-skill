# Gap source research: buttons and actions

Research date: 2026-07-20
Scope: additional permissively licensed open-source React action components not already counted in `shortlist.md`. This is source research only; no component code was imported.

## Decision

| Result | Additive action families |
| --- | ---: |
| Import now | **0** |
| Conditional repair | **3** |
| Replacement-only / global duplicates | **3** |
| Rejected or alternate implementations | **11** |
| **Globally plausible addition** | **3** |

The current globally deduplicated Buttons and actions pool remains **18**, not 21. If all three conditional families survive source-copy adaptation and release QA, the projected pool would move from **18 to 21**, leaving **39** against the target of 60. This is a candidate ceiling, not a verified manifest count.

The three possible additions are:

1. Swipeable row actions.
2. Pull-to-refresh action surface.
3. Cooldown / resend action.

Leading versus trailing actions, iOS versus MS animation modes, full-swipe settings, pull resistance and thresholds, countdown durations, labels, colors, and sizes are modes of those three families. They do not create extra components.

## Research and counting boundary

- Seventeen pinned repository revisions were source-inspected. A root license file containing the notice at the pinned revision was required; a package-manifest `license` field or README claim alone was not treated as sufficient source-copy evidence.
- Only behavior-bearing React controls were considered. Sections, layouts, templates, demos, ordinary button skins, branded button grids, generic primitive wrappers, hooks without a reusable visible control, and fixed-duration simulated progress were excluded.
- One user-facing behavior counts once. A stronger alternate can replace an existing global family, but it contributes zero new entries.
- The existing global choices remain authoritative. In particular, async/status buttons collide with Animata `status-button.tsx`, share actions collide with Kokonut `social-button.tsx`, and promise-confirm APIs collide with the selected responsive/alert-dialog family.
- Pointer gestures must have a keyboard and no-hover route, work on touch, retain usable focus, and provide a reduced-motion result. None of the three additive sources meets all of those requirements as shipped.
- A permissive code license does not clear copied social logos, trademark presentation, demo media, fonts, or separately sourced animation CSS. Those materials are excluded unless their own provenance is recorded.
- Every candidate below must be rejected if the stated repair cannot be completed as a narrow adaptation of the pinned source. A replacement implementation written around the same idea is original work, not an imported source component.

## Accepted / import now

None. All three additive behaviors have unresolved accessibility, lifecycle, compatibility, or reduced-motion gates.

## Conditional repair candidates

### 1. react-swipeable-list — swipeable row actions

| Field | Evidence |
| --- | --- |
| Repository / revision | [marekrozmus/react-swipeable-list](https://github.com/marekrozmus/react-swipeable-list), commit [`10ca0c66f7ec4aa4904a02e8dd197180dc56b125`](https://github.com/marekrozmus/react-swipeable-list/tree/10ca0c66f7ec4aa4904a02e8dd197180dc56b125), 2024-10-11 |
| Primary behavior source | [`src/SwipeableListItem.js`](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/src/SwipeableListItem.js) and [`src/SwipeAction.js`](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/src/SwipeAction.js) |
| Complete component closure | [`src/SwipeableList.js`](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/src/SwipeableList.js), [`src/LeadingActions.js`](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/src/LeadingActions.js), [`src/TrailingActions.js`](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/src/TrailingActions.js), `src/module.d.ts`, and the co-located CSS for those five modules |
| Package / dependencies | [`react-swipeable-list@1.10.0`](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/package.json). Source imports React, `clsx`, and `prop-types`, although the manifest incorrectly leaves all three in `devDependencies` and declares no runtime or peer dependencies. Its pinned development versions are React 17.0.2, `clsx` 1.1.1, and `prop-types` 15.8.0. A source copy should use host React and either retain those two small packages explicitly or make a mechanical TypeScript/local-`cn` adaptation. |
| License / notice | [MIT](https://github.com/marekrozmus/react-swipeable-list/blob/10ca0c66f7ec4aa4904a02e8dd197180dc56b125/LICENSE), `Copyright (c) 2021 Marek Rozmus`. Preserve the complete notice and pinned provenance. Track React, clsx, and prop-types licenses separately if retained. |
| Assets | None. The row and action content are caller supplied. |

**Why it is distinct:** this is a row-level action-reveal contract with measured leading/trailing action widths, drag direction discrimination, full-swipe thresholds, destructive removal timing, action callbacks, return/removal animation, and swipe progress events. Animata `swipe-button.tsx` is a hover label treatment, SmoothUI `power-off-slide` is a single slide-to-confirm control, and the selected speed dial/action bars do not expose row-local actions. Those are not behavioral substitutes.

**Upstream quality:** the source supports touch and mouse, prevents vertical-scroll capture until a horizontal direction is established, uses `requestAnimationFrame` for position work, removes listeners on unmount, supports explicit reset callbacks, and includes tests for its list, item, and action anatomy.

**Accessibility and interaction gaps:** `SwipeAction` defaults to a clickable `span`; it has no keyboard handler or accessible state. The action containers remain in the DOM at zero width with `overflow: hidden`, so focus can reach visually hidden controls if consumers override `Tag="button"`. There is no keyboard reveal/close path, focus-return policy, Escape behavior, RTL-aware direction mapping, or announcement of destructive completion. Mouse/touch listeners do not cover every cancel/release-outside case. Action widths are measured only at mount. CSS contains 0.2–0.5 second transitions and keyframe animations without a reduced-motion branch.

**Conditional gates:**

1. Render actual `type="button"` actions by default and never expose a click-only generic element.
2. Add a visible, semantic no-gesture route to reveal the row actions, with deterministic focus movement and return; support Escape and do not leave zero-width buttons tabbable. Arrow gestures may supplement this route but cannot be the only route.
3. Map leading/trailing keyboard direction and transforms under `dir="rtl"`; retain touch behavior and verify vertical scrolling, coarse pointers, cancellation, release outside the row, and accidental destructive swipes.
4. Re-measure on host/action resize, or prove that the imported contract intentionally freezes widths. Keep one RAF per frame and clean every timeout, frame, and global listener.
5. Add `prefers-reduced-motion` CSS that removes the return/remove/scale animations while leaving actions and final state visible. A destructive action must still provide a perceivable result.
6. Porting PropTypes to TypeScript and replacing `clsx` with the existing helper is allowed only as a mechanical adaptation. Reject the source if accessible reveal/focus behavior requires replacing the row state machine.

Count the list item, action, leading/trailing helpers, CSS, and type declarations together as **one Swipeable Row Actions component**.

### 2. react-pull-to-refreshify — pull-to-refresh action surface

| Field | Evidence |
| --- | --- |
| Repository / revision | [HuolalaTech/react-pull-to-refreshify](https://github.com/HuolalaTech/react-pull-to-refreshify), commit [`ed0bef5e2714a948450b78073cc1692706ecb705`](https://github.com/HuolalaTech/react-pull-to-refreshify/tree/ed0bef5e2714a948450b78073cc1692706ecb705), 2023-11-17 |
| Primary component | [`lib/PullToRefreshify.tsx`](https://github.com/HuolalaTech/react-pull-to-refreshify/blob/ed0bef5e2714a948450b78073cc1692706ecb705/lib/PullToRefreshify.tsx) |
| Complete source closure | [`lib/types.ts`](https://github.com/HuolalaTech/react-pull-to-refreshify/blob/ed0bef5e2714a948450b78073cc1692706ecb705/lib/types.ts) and [`lib/utils/`](https://github.com/HuolalaTech/react-pull-to-refreshify/tree/ed0bef5e2714a948450b78073cc1692706ecb705/lib/utils): `events.ts`, `getScrollTop.ts`, `useDrag.ts`, `useFirstMountState.ts`, `useLatest.ts`, `useScrollParent.ts`, `useUnmountedRef.ts`, and `useUpdateEffect.ts` |
| Package / dependencies | [`react-pull-to-refreshify@0.1.0`](https://github.com/HuolalaTech/react-pull-to-refreshify/blob/ed0bef5e2714a948450b78073cc1692706ecb705/package.json). Zero declared runtime dependencies. The source imports React hooks; the package omits a React peer declaration, so a source copy must explicitly use the host React 19 runtime. Browser dependencies are DOM touch/mouse events and CSS transforms. |
| License / notice | [MIT](https://github.com/HuolalaTech/react-pull-to-refreshify/blob/ed0bef5e2714a948450b78073cc1692706ecb705/LICENSE), `Copyright (c) 2022 liaoliao666`. Preserve the complete notice and provenance. |
| Assets | None. Status content is provided through `renderText`; do not copy demo spinner art. |

**Why it is distinct:** pull-to-refresh combines scroll-boundary detection, progressive drag displacement, threshold/release state, controlled refreshing/completion state, and a caller-owned status surface. It is not an ordinary Refresh button and is not a drawer/container skin. Its visible gesture feedback and refresh lifecycle are the component behavior.

**Upstream quality:** the source is TypeScript, has no package dependency beyond React, handles both touch and mouse, listens for `touchcancel`, detects the nearest scroll parent, supports resistance and thresholds, uses controlled `refreshing` state, and lets the caller render meaningful pulling/can-release/refreshing/complete content.

**Accessibility, SSR, and lifecycle gaps:** there is no keyboard route, role, live-status policy, busy state, or reduced-motion handling. `lib/utils/events.ts` reads `window` at module evaluation and `useScrollParent` initializes a ref from `window`, so the advertised component is not actually safe to evaluate during Next.js server rendering. Transitions are authored inline as `all <duration>ms`. Mouse listeners are attached to the element rather than captured through release outside. The completion timeout is not retained and cancelled; its unmounted check happens before scheduling rather than inside the callback. There are no source tests.

**Conditional gates:**

1. Guard all `window`/`document` access until the client effect or replace it with `globalThis` feature detection that is safe during server evaluation and hydration.
2. Ship an explicit visible Refresh button alongside the gesture. It must call the same real `onRefresh`, work with keyboard and touch, expose pending/disabled state, and remain available for screen-reader and no-gesture users.
3. Give the refresh region `aria-busy` and expose concise state changes through one polite, atomic status. Do not announce drag percentage or every pointer move.
4. Under reduced motion, remove transition animation and show a static pulling/ready/refreshing/complete result. Keep the interaction usable; do not hide the refresh status.
5. Retain/cancel the completion timer, prevent duplicate refresh dispatches, handle pointer/touch cancellation and mouse release outside, and verify nested scroll containers, page scrolling, mobile overscroll, resize/orientation, and cleanup.
6. Keep `renderText`, threshold, resistance, and duration options as modes of one component. Reject if adding the accessible action path requires replacing the upstream gesture/state implementation.

### 3. otp-timer — cooldown / resend action

| Field | Evidence |
| --- | --- |
| Repository / revision | [927tanmay/otp-timer](https://github.com/927tanmay/otp-timer), commit [`9c7a6645cb01c471c25632be8842fdb924dadc49`](https://github.com/927tanmay/otp-timer/tree/9c7a6645cb01c471c25632be8842fdb924dadc49), 2025-04-08 |
| Exact source | [`src/timer.js`](https://github.com/927tanmay/otp-timer/blob/9c7a6645cb01c471c25632be8842fdb924dadc49/src/timer.js) |
| Package / dependencies | [`otp-timer@2.1.1`](https://github.com/927tanmay/otp-timer/blob/9c7a6645cb01c471c25632be8842fdb924dadc49/package.json). The package incorrectly installs React 16.13.1 and React DOM 16.13.1 as runtime dependencies and also lists React 16 as a peer; it uses `prop-types ^15.6.0`. For source-copy evaluation, use host React 19 and either retain prop-types explicitly or make a mechanical TypeScript prop conversion. No DOM package API is used by `src/timer.js`. |
| License / notice | [MIT](https://github.com/927tanmay/otp-timer/blob/9c7a6645cb01c471c25632be8842fdb924dadc49/LICENSE), `Copyright (c) 2025 Tanmay Sharma & Simran Gupta`. Preserve the complete notice and provenance. |
| Assets | None. The source hardcodes a Roboto font-family name but ships no font; remove that default rather than importing an unrecorded font. |

**Why it is distinct:** this control makes an action unavailable for a bounded cooldown, shows the remaining wait, then exposes and invokes a real caller-supplied `resend` callback before starting the next cooldown. Cult UI `timer.tsx` is an elapsed-time display/stopwatch; it does not own action availability or a resend/retry lifecycle. Styling and OTP copy are not the family—the reusable behavior is a cooldown action.

**Upstream quality:** the interval is cleared before restart and on unmount. Once available, the source renders a native button, so its basic activation works with keyboard and touch. It has no animation, so reduced-motion behavior is already static.

**Quality and accessibility gaps:** the component is named and copy-wired only for OTP; defaults include hard-coded typography and colors. The button lacks `type="button"`. The countdown decrements component state once per interval, so it drifts and is incorrect after background throttling. Duration prop changes are not reconciled. The source provides no pending/error policy for the real action and no semantic relationship between the wait status and the action becoming available. Announcing the timer every second would be noisy and is not acceptable.

**Conditional gates:**

1. Generalize labels and the public registry name to Cooldown Action while retaining the same timer-to-action state machine; add `type="button"` and preserve native disabled/activation semantics.
2. Derive remaining time from an end timestamp so tab suspension and slow intervals do not extend or corrupt the cooldown. Clear all timers and reconcile controlled duration/reset changes.
3. Invoke a real caller callback. If the callback returns a promise, expose a pending state and a documented policy for whether success or attempted activation starts the cooldown; surface failure without silently simulating success.
4. Announce availability or failure once through a polite status; do not place the per-second countdown in a live region. Keep the action keyboard/touch accessible and test form embedding.
5. Remove bundled visual opinions and the undeclared Roboto assumption. Durations, labels, and styles remain props, not separate entries.
6. This candidate has the strictest adaptation ceiling. If end-time accuracy and real-action semantics require replacing most of `src/timer.js`, reject it and implement an original Cooldown Action later; do not retain upstream credit merely for the idea.

## Global dedupe ledger

| Researched behavior | Existing collision or boundary | Decision |
| --- | --- | --- |
| Async promise button with pending/success/error labels | Animata `animata/button/status-button.tsx` | Stronger replacement evidence only; **0 additive**. The current Animata fixture hardcodes a fake delay, but replacing it does not create a second family. |
| Native/fallback web-share action | Kokonut `components/kokonutui/social-button.tsx` | Same normalized Social Share Action family; **0 additive**. A source with real callbacks may replace the fake fixture after accessibility repair. |
| Promise-based confirmation API | Dice responsive-dialog confirm demo and the selected Alert Dialog family | API orchestration does not create another visible confirm component. **0 additive**. |
| Pull-to-refresh alternate packages and hooks | Selected conditional `react-pull-to-refreshify` source | One family. Promise/fetch-more options, a hook, or a second drag engine do not add entries. |
| Swipeable row actions | Animata Swipe Button, SmoothUI Power Off Slide, hold-to-confirm, selection toolbar | No collision. Row-local leading/trailing reveal and full-swipe action execution have a different state/gesture contract. |
| Cooldown action | Cult UI Timer and general countdown displays | No collision if the import retains action availability and a real callback. A passive countdown alone belongs to Status and progress and adds **0** here. |
| Split button | Existing Button plus accessible Menu primitives | A local composition may be useful, but the inspected PrimeReact source cannot be minimally copied. Do not count a demo composition or a package wrapper as a sourced component. |
| Action sheet | Existing drawer/responsive-dialog family | Arbitrary children in a draggable modal sheet are a container, not a new action component. **0 additive**. |

## Replacement-only sources

- **@wojtekmaj/react-async-button** — [commit `47783a431060e9c4cfc8f8c1777d302b016ab403`](https://github.com/wojtekmaj/react-async-button/tree/47783a431060e9c4cfc8f8c1777d302b016ab403), 2026-07-09; [`packages/react-async-button/src/AsyncButton.tsx`](https://github.com/wojtekmaj/react-async-button/blob/47783a431060e9c4cfc8f8c1777d302b016ab403/packages/react-async-button/src/AsyncButton.tsx); [MIT, copyright 2020–2026 Wojciech Maj](https://github.com/wojtekmaj/react-async-button/blob/47783a431060e9c4cfc8f8c1777d302b016ab403/packages/react-async-button/LICENSE). React 16.8–19 peer and `make-cancellable-promise ^2.0.0`. It handles synchronous/Promise actions, cancellation of settlement handlers on unmount, and pending/success/error configs, but consumers must add `disabled`, `aria-busy`, and coherent status text; repeated clicks can race unless pending is disabled. It is a credible replacement for the fake Animata Status Button, not another count.

- **react-web-share** — [commit `9bd00d6c325f24058a5a9a53e90783313acf864d`](https://github.com/hc-oss/react-web-share/tree/9bd00d6c325f24058a5a9a53e90783313acf864d), 2022-10-27; [`src/sharer.tsx`](https://github.com/hc-oss/react-web-share/blob/9bd00d6c325f24058a5a9a53e90783313acf864d/src/sharer.tsx) plus `src/components`, `src/hooks/use-disclosure.tsx`, `src/interfaces.ts`, and `src/style.css`; [MIT, copyright 2020 Harsh Zalavadiya](https://github.com/hc-oss/react-web-share/blob/9bd00d6c325f24058a5a9a53e90783313acf864d/LICENSE). Zero runtime dependencies; React/DOM 16–18 peers. It invokes `navigator.share` and falls back to a visible share dialog, so it is stronger behavior than a hover-only fake action. However, it overwrites the child's click handler, lacks focus trap/initial focus/Escape/focus restoration/label association/reduced motion, and bundles social-logo SVGs and trademark presentation. It can only replace Kokonut Social Share after using an existing accessible dialog primitive and excluding unverified brand assets; **0 additive**.

- **@omit/react-confirm-dialog** — [commit `a6eedfc782d8ef246785385b25976d28776a737d`](https://github.com/Aslam97/react-confirm-dialog/tree/a6eedfc782d8ef246785385b25976d28776a737d), 2026-02-19; [`packages/confirm-dialog/src/confirm-dialog.tsx`](https://github.com/Aslam97/react-confirm-dialog/blob/a6eedfc782d8ef246785385b25976d28776a737d/packages/confirm-dialog/src/confirm-dialog.tsx) with its local AlertDialog/Button closure; [MIT, copyright 2024 Aslam](https://github.com/Aslam97/react-confirm-dialog/blob/a6eedfc782d8ef246785385b25976d28776a737d/LICENSE). React/DOM 18–19 peers; Radix Alert Dialog/Slot, CVA, clsx, and tailwind-merge dependencies. It adds an awaitable provider API around a Radix confirmation dialog, but concurrent calls overwrite the stored resolver and can leave an earlier promise unsettled. The visible behavior and primitive anatomy are already represented; provider orchestration is not a second component.

## Rejected and alternate sources

### Same family, weaker or non-component source

- **react-simple-pull-to-refresh** — [commit `1f039086c96cfba6a4f3338b36871a66b6c7ead6`](https://github.com/thmsgbrt/react-simple-pull-to-refresh/tree/1f039086c96cfba6a4f3338b36871a66b6c7ead6), 2026-01-05; [`src/components/pull-to-refresh.tsx`](https://github.com/thmsgbrt/react-simple-pull-to-refresh/blob/1f039086c96cfba6a4f3338b36871a66b6c7ead6/src/components/pull-to-refresh.tsx) and adjacent helpers/styles; [MIT, copyright 2019 GUIBERT THOMAS](https://github.com/thmsgbrt/react-simple-pull-to-refresh/blob/1f039086c96cfba6a4f3338b36871a66b6c7ead6/LICENCE). Zero runtime dependencies and React/DOM 16.10–19 peers. It supports promise refresh and fetch-more, but has no semantic/keyboard/reduced-motion layer, relies on broad window scroll state, and its default animated loader explicitly cites loading.io without a preserved third-party license notice. Excluding that loader and repairing the core still yields the same family as the selected cleaner TypeScript source. **0**.

- **use-pull-to-refresh** — [commit `6b28679bf62ac3f882472daab2e84638ce49c5c8`](https://github.com/Senbonzakura1234/use-pull-to-refresh/tree/6b28679bf62ac3f882472daab2e84638ce49c5c8), 2026-05-16; [`src/index.ts`](https://github.com/Senbonzakura1234/use-pull-to-refresh/blob/6b28679bf62ac3f882472daab2e84638ce49c5c8/src/index.ts); [MIT, copyright 2023 Senbonzakura1234](https://github.com/Senbonzakura1234/use-pull-to-refresh/blob/6b28679bf62ac3f882472daab2e84638ce49c5c8/LICENSE); React 18/19 peer. It is a touch-only headless hook that returns two numbers/booleans and leaves the entire visible/status/keyboard control to the consumer. Helpers do not count as catalog components, and composing a new surface around it would be original work. **0**.

### Dependency closure or category failure

- **PrimeReact SplitButton and ConfirmPopup** — [commit `8db7b9495b9e1b0619c8b9784116bdb1e4e632aa`](https://github.com/primefaces/primereact/tree/8db7b9495b9e1b0619c8b9784116bdb1e4e632aa), 2026-06-28; [`components/lib/splitbutton/SplitButton.js`](https://github.com/primefaces/primereact/blob/8db7b9495b9e1b0619c8b9784116bdb1e4e632aa/components/lib/splitbutton/SplitButton.js) and [`components/lib/confirmpopup/ConfirmPopup.js`](https://github.com/primefaces/primereact/blob/8db7b9495b9e1b0619c8b9784116bdb1e4e632aa/components/lib/confirmpopup/ConfirmPopup.js); [MIT, copyright 2016–2025 PrimeTek](https://github.com/primefaces/primereact/blob/8db7b9495b9e1b0619c8b9784116bdb1e4e632aa/LICENSE.md). Both have meaningful keyboard/focus handling, but their reachable closure includes PrimeReact API context, ComponentBase, Button, hooks, icons, overlay services, Portal, TieredMenu, Tooltip, transition helpers, utilities, and theme/style modules. Copying is not minimal; installing PrimeReact and wrapping it is not source-copy. ConfirmPopup is also a global confirm duplicate. **0**.

- **actionsheet-react** — [commit `f293d561c04128c6b3e0876acb3c2d04bbfdd159`](https://github.com/mohit23x/actionsheet-react/tree/f293d561c04128c6b3e0876acb3c2d04bbfdd159), 2025-07-05; [`src/index.tsx`](https://github.com/mohit23x/actionsheet-react/blob/f293d561c04128c6b3e0876acb3c2d04bbfdd159/src/index.tsx). The package says ISC but the pinned repository has no LICENSE/COPYING file or copyright notice. It accepts arbitrary children and implements a draggable modal sheet, not an action model; it also lacks focus containment/restoration and reduced motion. Legal and category failure. **0**.

- **react-csv** — [commit `d1153c101b95c109b5bcf5a5c2a370a81d522f1e`](https://github.com/react-csv/react-csv/tree/d1153c101b95c109b5bcf5a5c2a370a81d522f1e), 2022-01-18; [`src/components/Link.jsx`](https://github.com/react-csv/react-csv/blob/d1153c101b95c109b5bcf5a5c2a370a81d522f1e/src/components/Link.jsx), [`Download.js`](https://github.com/react-csv/react-csv/blob/d1153c101b95c109b5bcf5a5c2a370a81d522f1e/src/components/Download.js), and [`src/core.js`](https://github.com/react-csv/react-csv/blob/d1153c101b95c109b5bcf5a5c2a370a81d522f1e/src/core.js); [MIT, copyright 2019 react-csv](https://github.com/react-csv/react-csv/blob/d1153c101b95c109b5bcf5a5c2a370a81d522f1e/LICENSE.txt). CSVLink is an anchor/export utility and CSVDownload auto-opens a window on mount; neither provides a distinct action lifecycle or feedback surface, and object URLs are not revoked. Use an export utility plus a native action when a product needs CSV. **0**.

- **react-add-to-calendar** — [commit `ea3f1d9e8cdaa81dd45e8cf7826a39c09e3a8895`](https://github.com/jasonsalzman/react-add-to-calendar/tree/ea3f1d9e8cdaa81dd45e8cf7826a39c09e3a8895), 2017-12-05; [`src/ReactAddToCalendar.js`](https://github.com/jasonsalzman/react-add-to-calendar/blob/ea3f1d9e8cdaa81dd45e8cf7826a39c09e3a8895/src/ReactAddToCalendar.js), [`src/helpers/index.js`](https://github.com/jasonsalzman/react-add-to-calendar/blob/ea3f1d9e8cdaa81dd45e8cf7826a39c09e3a8895/src/helpers/index.js), and SCSS; [MIT, copyright 2016–2017 Jason Salzman](https://github.com/jasonsalzman/react-add-to-calendar/blob/ea3f1d9e8cdaa81dd45e8cf7826a39c09e3a8895/LICENSE). React/DOM 15–16 peers and optional Moment-era logic. The source uses an anchor with click behavior as its menu button, deprecated lifecycle code, document-global click handling, random keys, provider-branded links, and unrevoked object URLs. Modernizing semantics, focus, dates, and export cleanup is a rewrite. The maintained `add-to-calendar-button-react` successor is a wrapper around an ELv2 package and is not permissively eligible. **0**.

### Fixed progress or cosmetic button family

- **react-awesome-button progress** — [commit `4029e500bcfbf3b658bc309be7efc73ed3927429`](https://github.com/rcaferati/react-awesome-button/tree/4029e500bcfbf3b658bc309be7efc73ed3927429), 2026-07-10; [`src/components/AwesomeButtonProgress/index.tsx`](https://github.com/rcaferati/react-awesome-button/blob/4029e500bcfbf3b658bc309be7efc73ed3927429/src/components/AwesomeButtonProgress/index.tsx); [MIT, copyright 2017 Rafael Caferati](https://github.com/rcaferati/react-awesome-button/blob/4029e500bcfbf3b658bc309be7efc73ed3927429/LICENSE). React/DOM `>=18`, `@rcaferati/wac ^1.0.0`, a large SCSS/theme closure. Progress advances for a configured fixed duration (default 6000 ms) and is completed through a continuation callback rather than reflecting actual work. It also belongs to a 3D/cosmetic button system and lacks busy/live/reduced-motion semantics. Fake progress and skins are excluded. **0**.

### Missing authoritative license artifact

These repositories declare a permissive identifier in package metadata, but the pinned source tree contains no license text/copyright notice to preserve. Under the strict source-copy policy they are rejected even before interaction QA:

- **react-pwa-install** — [commit `972cb5adb60b8ff11fc1784ff7f18694ff438a7d`](https://github.com/zoltangy/react-pwa-install/tree/972cb5adb60b8ff11fc1784ff7f18694ff438a7d), 2020-10-13; `src/index.js`, `src/InstallDialog.js`, and `src/InstallDialogAction.js`; package says MIT. It also reads `window` through platform detection at module evaluation, depends on `mobile-device-detect`, uses undeclared Material UI v4 runtime imports, and ships stale platform-specific branded instructions. **0**.
- **react-timeout-button** — [commit `86d7f7b41f230d3deaccb5cf258c5f117b8347fc`](https://github.com/IgorSzyporyn/react-timeout-button/tree/86d7f7b41f230d3deaccb5cf258c5f117b8347fc), 2020-08-17; `src/ReactTimeoutButton/ReactTimeoutButton.tsx` and `Overlay.tsx`; package says ISC. React 16 and Emotion 10 runtime dependencies; no authoritative notice, so it cannot be used as the cooldown source. **0**.
- **react-countdown-button** — [commit `70d90c392cb2b1d9981bdc7e14d84ff49ea1a625`](https://github.com/yuanzhhh/react-countdown-button/tree/70d90c392cb2b1d9981bdc7e14d84ff49ea1a625), 2018-01-17; `src/index.js` and `src/BaseComponent.js`; package says MIT. React 16.2 runtime, stale lifecycle/timer implementation, no cleanup evidence, and duplicate cooldown behavior. **0**.
- **react-audio-voice-recorder** — [commit `1c5298cf29aaf9cd6415180a37ee14ca36ccba70`](https://github.com/samhirtarif/react-audio-recorder/tree/1c5298cf29aaf9cd6415180a37ee14ca36ccba70), 2023-10-21; [`src/components/AudioRecordingComponent.tsx`](https://github.com/samhirtarif/react-audio-recorder/blob/1c5298cf29aaf9cd6415180a37ee14ca36ccba70/src/components/AudioRecordingComponent.tsx) and [`src/hooks/useAudioRecorder.ts`](https://github.com/samhirtarif/react-audio-recorder/blob/1c5298cf29aaf9cd6415180a37ee14ca36ccba70/src/hooks/useAudioRecorder.ts); package says MIT but no license file exists. It also pulls `@ffmpeg/ffmpeg ^0.11.6`, `react-audio-visualize ^1.1.3`, and bundled SVG controls into a media-recorder product. The live visualizer is already separately researched in the media gap report; this package cannot supply an additional cleared action source. **0**.

## Import evidence checklist

For any of the three conditional families that advances:

1. Re-fetch the exact commit and hash every copied source/CSS file.
2. Copy the complete closure recorded above, not a demo, compiled bundle, or mutable registry response.
3. Preserve the complete upstream MIT notice, repository, pinned commit, original paths, package version, and a human-readable modification record. Track retained package dependencies and their licenses separately.
4. Do not copy demo content, social logos, third-party spinner CSS, fonts, remote media, or branded defaults.
5. Apply only the bounded repairs listed for that family. Reject the candidate if accessibility or lifecycle correctness needs a new interaction engine or API redesign.
6. Re-run global behavior dedupe after adaptation. A repaired alternate still does not become another component.
7. Count only after isolated React 19/Next build and hydration, realistic callback integration, keyboard, touch, no-hover, RTL where directional, focus, screen-reader semantics, reduced motion, responsive/mobile, cleanup, error-path, provenance, visual, and registry-output checks pass.
