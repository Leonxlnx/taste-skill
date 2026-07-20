# Status and progress gap source research

Checked: 2026-07-20
Scope: permissively licensed open-source React components in the `Status and progress` taxonomy only: real progress values, step state, elapsed/countdown time, task lifecycle, activity data, and pending state.
Boundary: no sections, layouts, templates, dashboards, screens, cosmetic status pills, skeleton copies, alternate spinner shapes, perpetual decoration, fake/trickled progress, or demo-only progress simulations.
Status: source research only. No component source, package, asset, registry entry, commit, or push was made in this pass.

## Decision

This pass found **one accepted additive candidate**, **one conditional additive candidate**, and **one replacement-only timer candidate**. The low count is deliberate: the existing shortlist already represents scalar meter/progress, circular progress, gauge, stepper, pending behavior, scroll progress, relative time, elapsed time, animated timeline, numeric transition, and ten pending-loader mechanisms.

| Bucket | Source family | Additive count | Decision |
| --- | --- | ---: | --- |
| Accept | [Primer segmented progress](#accept--primer-segmented-progress) | **1** | Multiple semantically labelled constituent values form a real progress breakdown, not another scalar bar skin. Import the three-file public source closure and preserve the multi-segment contract. |
| Conditional | [Carbon inline task status](#conditional--carbon-inline-task-status) | **1** | A visible `inactive → active → finished/error` lifecycle is distinct from Dice Pending and pending-only loaders, but Carbon's package/style closure and incomplete motion/forced-color handling must pass isolated QA. |
| Replacement only | [Ark UI timer](#replacement-only--ark-ui-timer) | **0** | A stronger timer state machine and control anatomy than the shortlisted Cult Timer, but still the same timer family. It may replace that source; it must not be added beside it. |
| Reject from additive count | [Audited rejections](#rejected-and-zero-count-sources) | **0** | Scalar/shape duplicates, fake progress, loader decoration, wrappers/helpers, form-validation category conflicts, service-specific state, layouts, or dependency closures that do not justify another component. |

The current shortlist projects **20 of 35** Status and progress components, leaving a gap of **15**. Applying only the accepted Primer result projects **21**, leaving **14**. If Carbon later clears every named condition, the maximum projection from this pass is **22**, leaving **13**. Ark is net-zero because it can only replace the existing timer winner.

These are research projections, not verified registry counts. The validated manifest count remains **0**. No accepted or conditional item counts for release until its exact source, license, dependency, build, preview, semantic, reduced-motion, forced-colors, responsive, and dedupe gates pass.

## Global deduplication result

| Existing behavior family | Current canonical source | Effect on this pass |
| --- | --- | --- |
| Scalar meter | 9ui `meter.tsx` | Reject ordinary linear meters and one-value progress bars as additive candidates. |
| Circular progress and gauge | Dice UI `circular-progress.tsx` and `gauge.tsx` | Reject ring, semicircle, pie, and SVG-shape variants. |
| Step state | Dice UI `stepper.tsx` | Reject Steps, ProgressIndicator, ProgressTracker, and wizard-step skins unless the interaction is materially different. None audited here was. |
| Pending interaction guard | Dice UI `components/pending.tsx` | Carbon remains distinct because it presents a four-state task lifecycle; it does not disable or proxy an action. |
| Pending visual mechanisms | Loading UI's ten shortlisted mechanisms | Do not count Carbon's internal spinner separately, and reject additional loader shapes. |
| Timer | Cult UI `timer.tsx` | Ark is replacement evidence only. Count-up, countdown, interval, Pomodoro copy, and control arrangements remain one timer family. |
| Scroll progress | Motion Primitives `scroll-progress.tsx` | Reject reading/page/top-loader skins and NProgress-style route strips. |
| Activity history | Kibo UI `contribution-graph` and Animata `animatedtimeline.tsx` | Reject another contribution heatmap or presentational timeline. |
| Relative time and numeric transition | Kibo UI Relative Time and NumberFlow | Reject clock/relative-time displays and number animation aliases. |

- Primer wins one new `segmented progress breakdown` family. Its scalar `progress` mode is useful anatomy but adds no separate count. Each segment, color, size, animation flag, and inline/block mode is a child or variant, not a component.
- Carbon wins one conditional `inline task lifecycle status` family. `inactive`, `active`, `finished`, and `error` are states of one component, not four entries.
- Ark Timer, `react-countdown`, Countdown Circle Timer, Grommet Clock, and progress-timer packages are one timer collision set. Ark is the strongest replacement candidate found, not an additive timer.
- Grommet's multi-value Meter collides directly with Primer's accepted segmented contract. Primer has the smaller exact source closure and clearer reduced-motion/forced-colors intent.
- React Activity Calendar collides with Kibo Contribution Graph. Loading animation, tooltip configuration, color scale, and calendar range do not create another activity family.
- Password strength bars and password rule checklists belong to `Forms and feedback` because `categories.md` assigns validation there. They cannot close the Status gap.

## Accept — Primer segmented progress

Count: **1 additive candidate** (`Segmented Progress`).

| Field | Evidence |
| --- | --- |
| Repository | [`primer/react`](https://github.com/primer/react) |
| Pinned commit | [`2a67c191a0038df64d2225c0bc11c020c2def03c`](https://github.com/primer/react/tree/2a67c191a0038df64d2225c0bc11c020c2def03c), 2026-07-17 |
| Package | [`@primer/react@38.32.0`](https://github.com/primer/react/blob/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/package.json) |
| Exact component | [`packages/react/src/ProgressBar/ProgressBar.tsx`](https://github.com/primer/react/blob/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/ProgressBar/ProgressBar.tsx) |
| Public compound export | [`packages/react/src/ProgressBar/index.ts`](https://github.com/primer/react/blob/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/ProgressBar/index.ts) |
| Required style | [`packages/react/src/ProgressBar/ProgressBar.module.css`](https://github.com/primer/react/blob/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/ProgressBar/ProgressBar.module.css) |
| Focused tests | [`packages/react/src/ProgressBar/ProgressBar.test.tsx`](https://github.com/primer/react/blob/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/ProgressBar/ProgressBar.test.tsx) |
| License | [MIT, copyright 2018 GitHub, Inc.](https://github.com/primer/react/blob/2a67c191a0038df64d2225c0bc11c020c2def03c/LICENSE) |
| Notices | Preserve the complete Primer MIT notice. No separate root `NOTICE` file was present at the pinned snapshot. |
| Assets | None. |

### Why it is countable

`ProgressBar.Item` allows several independently named values to share one bounded track, such as completed, running, and failed work. That constituent-value contract cannot be represented by the shortlisted scalar 9ui Meter without building a new composition. It is also smaller than the equivalent Grommet multi-value SVG meter.

The count is one. The ordinary single-value mode, item count, colors, sizes, inline mode, and optional shimmer are capabilities of the same component. Taste Blocks should headline and test the segmented contract; it must not publish the scalar mode as another entry.

### Dependency and source boundary

- The exact runtime source imports React and `clsx`. The pinned Primer manifest declares `clsx@^2.1.1`; `clsx` is MIT. No Primer hook, icon, provider, or JavaScript primitive is required by these two files.
- The CSS expects Primer custom properties: `--progressBar-track-bgColor`, `--progressBar-track-borderColor`, `--borderRadius-small`, and the selected `--bgColor-*-emphasis` values. Define scoped Taste fallbacks or map these variables in the preview. Do not install the whole `@primer/react` dependency merely for this component.
- Copy the TSX, CSS module, and tiny `index.ts` compound export together. Replacing `clsx` with an already-present `cn` helper is allowed only as a recorded modification; it does not create a Tailwind port or another count.
- Preserve the MIT notice in the distributed third-party notices/provenance record. If `clsx` is installed rather than copied, its license belongs in the dependency lock/SBOM; if any dependency code is vendored, preserve its notice too.

### Interaction and accessibility audit

| Gate | Result |
| --- | --- |
| Real state | **Good.** Widths come only from caller-provided progress values. There is no timer, trickle, simulated completion, or autonomous progress. The preview must bind segments to real controlled state. |
| Semantics | **Good with a usage contract.** Every `Item` renders `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, and a rounded `aria-valuenow`; it accepts `aria-label` and `aria-valuetext`. In multi-item mode the root label is not forwarded, so require `role="group"` plus a group label on the root and an accessible name on every item. |
| Value safety | **Small patch.** The source does not clamp the visual width or ARIA value. Clamp finite inputs to `0…100`, and reject/normalize non-numeric strings, so an invalid caller value cannot produce overflow or an ARIA value above its maximum. |
| Keyboard/touch | **Not interactive.** No focus or pointer behavior is invented. Interactive legends or filters would be separate caller controls and must not be baked into this component. |
| Reduced motion | **Good.** The optional shimmer runs only inside `@media (prefers-reduced-motion: no-preference)`, and `animated` is off unless requested. Keep it off for ordinary determinate progress. |
| Forced colors | **Explicit upstream path, verify in host.** The CSS has `@media (forced-colors: active)`, uses system colors, and sets `forced-color-adjust: none`. Because each item also sets `--progress-bg` locally, verify the compiled CSS in Windows High Contrast and force the item variable to `LinkText` in that media query if the local value wins. Do not claim a pass from source inspection alone. |
| Responsive | **Good base.** The flex track is percentage based and clips overflow. Test several labelled segments at narrow widths, zoom, RTL, and values that sum below or above 100. The component must define whether segments are constituent percentages or normalized parts; do not silently rescale data. |

### Import gate

Accept into staging as the single segmented-progress family. Before release:

1. copy the pinned TSX, CSS module, and public compound export with the MIT notice/provenance;
2. provide scoped token fallbacks without a full Primer theme dependency;
3. clamp values and leave one focused runnable test for invalid values;
4. document and preview `role="group"` plus labels for every segment;
5. verify forced colors, reduced motion, RTL, narrow width, zoom, and realistic controlled task data;
6. reject a second scalar-progress entry generated from the same source.

## Conditional — Carbon inline task status

Count: **1 conditional additive candidate** (`Inline Task Status`).

| Field | Evidence |
| --- | --- |
| Repository | [`carbon-design-system/carbon`](https://github.com/carbon-design-system/carbon) |
| Pinned commit | [`5d6b61ea503c5b4c1b52576e665b32a402852bf4`](https://github.com/carbon-design-system/carbon/tree/5d6b61ea503c5b4c1b52576e665b32a402852bf4), 2026-07-17 |
| Package | [`@carbon/react@1.112.0`](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/react/package.json) |
| Exact component | [`packages/react/src/components/InlineLoading/InlineLoading.tsx`](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/react/src/components/InlineLoading/InlineLoading.tsx) |
| Required loading source | [`packages/react/src/components/Loading/Loading.tsx`](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/react/src/components/Loading/Loading.tsx) |
| Required styles | [`inline-loading`](https://github.com/carbon-design-system/carbon/tree/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/styles/scss/components/inline-loading) and [`loading`](https://github.com/carbon-design-system/carbon/tree/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/styles/scss/components/loading) SCSS closures |
| License | [Apache-2.0](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/LICENSE); `InlineLoading.tsx` carries `Copyright IBM Corp. 2016, 2025` and the style files retain their IBM headers |
| Notices | No root `NOTICE` file was present at the pinned snapshot. Preserve the Apache license and relevant file headers, and mark every modified copied file prominently as required by Apache-2.0 section 4. |
| Assets | None. Finished/error glyphs come from `@carbon/icons-react`. |

### Why it is distinct

The component renders a compact task lifecycle with `inactive`, `active`, `finished`, and `error` states, visible text, status glyphs, and a delayed `onSuccess` hook after the real `finished` state arrives. Dice Pending is an action/event guard with `aria-busy`; Loading UI supplies pending-only visuals; Animata Status Button couples state to an action button. Carbon's standalone four-state presenter is therefore a separate contract.

This remains one component. The four statuses, success delay, small spinner, checkmark, error icon, descriptions, and icon-label copy are states/anatomy, not extra entries. The preview must drive `status` from a real promise/task state; `successDelay` must never manufacture completion.

### Dependency and source boundary

- The component-level closure uses React, `prop-types`, `classnames`, `@carbon/icons-react`, Carbon `Loading`, `usePrefix`, and Carbon SCSS/theme/type utilities. The pinned package declares `@carbon/icons-react@^11.84.0`, `classnames@2.5.1`, `prop-types@^15.8.1`, `@carbon/styles@^1.111.0`, and Sass as a peer.
- Installing `@carbon/react` brings a broad design-system dependency and global Sass surface. Test an isolated component import and CSS scope before choosing it as a maintained dependency.
- Flattening the exact component, spinner, icons, prefix helper, and styles into the Tailwind registry may be possible, but only a narrow closure reduction is allowed. If it becomes a visual rewrite or a reimplementation of Carbon's loading animation, reject it.
- Apache redistribution requires the full license, retained relevant headers/notices, and a prominent modification notice on changed files. Installed dependency licenses must remain in the normal SBOM; vendored dependency code needs its own notice.

### Interaction and accessibility audit

| Gate | Result |
| --- | --- |
| Real state | **Good when controlled honestly.** The source never increments progress. It reflects the supplied lifecycle state and invokes `onSuccess` only after `status === "finished"`. Preview fixtures must use a real cancellable promise/task, including an error path. |
| Semantics | **Patch required.** The root sets `aria-live="assertive"` for every non-inactive state but has no explicit status role. Routine loading should not interrupt the current screen-reader utterance. Use `role="status"`/polite by default, reserve alert behavior for a genuine error policy, keep visible state text, and avoid announcing every spinner frame. |
| Keyboard/touch | **Not interactive.** The source contains no action. Retry/cancel buttons, if shown in a demo, remain separate named native controls. |
| Reduced motion | **Patch required.** Carbon's Loading SCSS disables only the SVG circle sub-animation under reduced motion; the container rotation remains. The finished checkmark also has a 250 ms authored animation with no modern reduced-motion branch. Render static pending/success/error glyphs under `reduce`. |
| Forced colors | **Patch and test required.** Inline Loading includes only legacy `-ms-high-contrast` handling and no modern `forced-colors` rule. Ensure text, spinner, check, and error glyph remain distinguishable with system colors and do not rely on green/red alone. |
| Cleanup | **Good base.** The success timeout is cleared on dependency change/unmount. Verify rapid `active → finished → active/error` changes and Strict Mode. |
| Responsive | **Good base.** It is inline flex content, but long localized descriptions still need wrapping, narrow-width, zoom, and RTL tests. |

### Conditions before counting

1. Prove either an isolated `@carbon/react` import or a small exact source closure has acceptable JavaScript, Sass, and style-isolation cost.
2. Replace the assertive default with a coherent status/error announcement policy and test accessible names in all four states.
3. Stop all authored rotation/checkmark motion under reduced motion and add a static state-preserving fallback.
4. Add and test a modern forced-colors path using system colors plus text/icons, not color alone.
5. Exercise real pending, completion, cancellation, and error state; never use a demo interval that pretends to do work.
6. Ship the Apache license, retained IBM headers, modification markings, and dependency notices.

If the dependency cannot be isolated or the Tailwind conversion becomes a redesign, reject Carbon instead of recreating it. Until these gates pass, it does not enter the accepted subtotal.

## Replacement only — Ark UI timer

Additive count: **0**. Possible replacement count: **1**, only if it replaces Cult UI Timer.

| Field | Evidence |
| --- | --- |
| Repository | [`chakra-ui/ark`](https://github.com/chakra-ui/ark) |
| Pinned commit | [`1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595`](https://github.com/chakra-ui/ark/tree/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595), 2026-07-09 |
| Package | [`@ark-ui/react@5.37.2`](https://github.com/chakra-ui/ark/blob/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/packages/react/package.json) |
| Complete React anatomy | [`packages/react/src/components/timer/`](https://github.com/chakra-ui/ark/tree/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/packages/react/src/components/timer) |
| Root and adapter | [`timer-root.tsx`](https://github.com/chakra-ui/ark/blob/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/packages/react/src/components/timer/timer-root.tsx) and [`use-timer.ts`](https://github.com/chakra-ui/ark/blob/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/packages/react/src/components/timer/use-timer.ts) |
| Underlying machine | [`chakra-ui/zag` commit `df65e4c87c75a1c84eb6eb08a8e30dac0e1bb77f`](https://github.com/chakra-ui/zag/tree/df65e4c87c75a1c84eb6eb08a8e30dac0e1bb77f/packages/machines/timer), the peeled `@zag-js/timer@1.42.0` tag |
| Ark license | [MIT, copyright 2024 Chakra Systems Inc.](https://github.com/chakra-ui/ark/blob/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/LICENSE) |
| Zag license | [MIT, copyright 2021 Chakra UI](https://github.com/chakra-ui/zag/blob/df65e4c87c75a1c84eb6eb08a8e30dac0e1bb77f/LICENSE) |
| Notices/assets | Preserve both MIT notices if Ark source and Zag-dependent logic are distributed. Neither pinned root had a separate `NOTICE`; the component requires no asset. Lucide icons appear only in examples and are not part of the timer closure. |

### Why it is a credible replacement

Ark provides a real timer state machine with start, pause, resume, reset, restart, count-up/countdown, target completion, interval, tick callback, and composed native control triggers. Zag validates negative/invalid intervals and incompatible start/target values, clamps progress, and measures elapsed frame deltas instead of treating every frame as elapsed time.

The current [Cult Timer source](https://github.com/nolly-studio/cult-ui/blob/a3308bad8496b036adf2fbd29d50b877fb3c5987/apps/www/registry/default/ui/timer.tsx) is a passive elapsed-work display. It updates React state on every animation frame, places `aria-live="polite"` around the rapidly changing timer, and spins its icon without a reduced-motion rule. Ark is stronger behavior and semantics, but adding both would still inflate one timer family.

### Dependency and accessibility audit

- `@ark-ui/react` declares `@zag-js/react@1.42.0`, `@zag-js/timer@1.42.0`, and many unrelated Zag component packages at package level. A subpath import tree-shakes runtime code but still installs a broad dependency graph. A source copy needs the exact timer anatomy plus Ark factory/context utilities and the two Zag packages; do not hand-rewrite the state machine.
- Zag's timer area exposes `role="timer"`, an atomic localized `aria-label`, and hides visual separators. Action triggers are native `type="button"` elements and are hidden according to machine state. The timer role is intentionally not a chatty live region; completion announcements should be explicit and product-controlled.
- The core source authors no visual animation or color, so reduced motion and forced colors are host-style concerns. Do not add digit rolling/spinning as part of the import. Native buttons need visible focus and system-color survival in the Taste skin.
- The machine uses requestAnimationFrame-based elapsed deltas. Verify background-tab catch-up, document visibility, long-running drift, Strict Mode cleanup, and completion exactly once.

### Replacement gate

1. Compare the isolated `@ark-ui/react/timer` install surface with copying the exact Ark anatomy plus pinned Zag packages.
2. Keep one timer component in the global manifest. If Ark wins, remove Cult Timer from the queue rather than increasing the Status count.
3. Preserve both MIT notices and exact Ark/Zag provenance.
4. Verify count-up, countdown, pause/resume/reset, background-tab drift, keyboard controls, accessible labels, RTL, reduced motion, forced colors, and timer completion.

If the dependency cost is unjustified, repair Cult Timer in place or drop the family; do not count a second timer to avoid the choice.

## Rejected and zero-count sources

### Same-source siblings and direct family duplicates

- **Primer scalar ProgressBar, Spinner, StateLabel, and Timeline — 0.** The accepted source's single `progress` prop is already covered by 9ui Meter; only the multi-item contract closes a gap. [`Spinner`](https://github.com/primer/react/tree/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/Spinner) is pending decoration, [`StateLabel`](https://github.com/primer/react/tree/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/StateLabel) is a product/status skin, and [`Timeline`](https://github.com/primer/react/tree/2a67c191a0038df64d2225c0bc11c020c2def03c/packages/react/src/Timeline) is an activity layout. They share Primer's MIT notice and package dependencies. Spinner motion is not another mechanism to count; StateLabel variants and Timeline stories are not state engines.

- **Carbon ProgressBar, ProgressIndicator, and Loading — 0.** At the pinned Carbon commit, [`ProgressBar.tsx`](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/react/src/components/ProgressBar/ProgressBar.tsx) is a scalar determinate/indeterminate bar covered by the current meter/progress family; [`ProgressIndicator.tsx`](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/react/src/components/ProgressIndicator/ProgressIndicator.tsx) is a stepper collision; [`Loading.tsx`](https://github.com/carbon-design-system/carbon/blob/5d6b61ea503c5b4c1b52576e665b32a402852bf4/packages/react/src/components/Loading/Loading.tsx) is support anatomy and a spinner. Carbon ProgressBar has good ARIA values and a forced-colors style, but its indeterminate animation lacks a complete reduced-motion path. These files share Carbon's Apache license/IBM headers and heavy style closure; none adds a family.

- **Ark Progress and Steps — 0.** [`packages/react/src/components/progress/`](https://github.com/chakra-ui/ark/tree/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/packages/react/src/components/progress) wraps `@zag-js/progress`; [`steps/`](https://github.com/chakra-ui/ark/tree/1e0540ce7bfe953e8b6098cd2afcf4f84f4f8595/packages/react/src/components/steps) wraps `@zag-js/steps`. Both are semantically strong and unstyled, but collide with the selected scalar/circular progress and Dice Stepper contracts. Linear/circular orientation, min/max, and completed content are anatomy or variants. The Ark/Zag MIT notices and dependency conditions above apply.

### Timers, fake progress, and upload status

- **react-countdown — 0.** [Commit `b42b98bded820f8150aa381cf210798d491a38d3`](https://github.com/ndresx/react-countdown/tree/b42b98bded820f8150aa381cf210798d491a38d3), [`src/Countdown.tsx`](https://github.com/ndresx/react-countdown/blob/b42b98bded820f8150aa381cf210798d491a38d3/src/Countdown.tsx), [`src/CountdownJs.ts`](https://github.com/ndresx/react-countdown/blob/b42b98bded820f8150aa381cf210798d491a38d3/src/CountdownJs.ts), package `3.0.0-beta.0`; [MIT, copyright 2020 Martin Veith](https://github.com/ndresx/react-countdown/blob/b42b98bded820f8150aa381cf210798d491a38d3/LICENSE), no separate notice. Runtime is React/ReactDOM peers only. The engine has real deadline state, pause/start/stop/refresh, cleanup, and callbacks, but its default component renders a bare fragment with no timer label/role/live policy; custom renderer output owns all semantics. It authors no motion or color, so reduced motion/forced colors are not applicable to the default text. It is a credible lightweight alternate implementation, not another timer count.

- **React Countdown Circle Timer — 0.** [Commit `d504ce5cadcd191d0ac562b403fbb4e8c2427521`](https://github.com/vydimitrov/react-countdown-circle-timer/tree/d504ce5cadcd191d0ac562b403fbb4e8c2427521), [`packages/web/src/CountdownCircleTimer.tsx`](https://github.com/vydimitrov/react-countdown-circle-timer/blob/d504ce5cadcd191d0ac562b403fbb4e8c2427521/packages/web/src/CountdownCircleTimer.tsx) plus [`packages/shared/src/useCountdown.ts`](https://github.com/vydimitrov/react-countdown-circle-timer/blob/d504ce5cadcd191d0ac562b403fbb4e8c2427521/packages/shared/src/useCountdown.ts), package `3.2.1`; [MIT, copyright 2021 Vasil Dimitrov](https://github.com/vydimitrov/react-countdown-circle-timer/blob/d504ce5cadcd191d0ac562b403fbb4e8c2427521/LICENSE), no separate notice. Runtime is React plus `use-elapsed-time@3.0.4`. The SVG has no role, accessible name, title, or live policy; the continuous stroke/color animation has no reduced-motion branch or forced-colors style. It is exactly a countdown plus circular-progress shape collision.

- **@tanem/react-nprogress — 0.** [Commit `c4892f29619098373492bd24501ed31b55b3d815`](https://github.com/tanem/react-nprogress/tree/c4892f29619098373492bd24501ed31b55b3d815), [`src/useNProgress.tsx`](https://github.com/tanem/react-nprogress/blob/c4892f29619098373492bd24501ed31b55b3d815/src/useNProgress.tsx) and [`src/increment.ts`](https://github.com/tanem/react-nprogress/blob/c4892f29619098373492bd24501ed31b55b3d815/src/increment.ts), package `6.0.3`; [MIT, copyright 2018 Tane Morgan](https://github.com/tanem/react-nprogress/blob/c4892f29619098373492bd24501ed31b55b3d815/LICENSE), no separate notice. Dependencies are `@babel/runtime`, `hoist-non-react-statics`, and React/DOM peers. Its algorithm autonomously trickles toward `0.994` while `isAnimating`; it does not know task completion percentage. The component is a render-prop helper and supplies no ARIA, reduced-motion, or forced-colors UI. Fake progress is explicitly out of scope.

- **Uppy React StatusBar — 0.** [Commit `0b1f79c90d699dbe8dae4ce3cd3b1c5d6fc23c16`](https://github.com/transloadit/uppy/tree/0b1f79c90d699dbe8dae4ce3cd3b1c5d6fc23c16), React [`packages/@uppy/react/src/StatusBar.ts`](https://github.com/transloadit/uppy/blob/0b1f79c90d699dbe8dae4ce3cd3b1c5d6fc23c16/packages/%40uppy/react/src/StatusBar.ts), underlying [`packages/@uppy/status-bar/src/StatusBarUI.tsx`](https://github.com/transloadit/uppy/blob/0b1f79c90d699dbe8dae4ce3cd3b1c5d6fc23c16/packages/%40uppy/status-bar/src/StatusBarUI.tsx); `@uppy/react@5.2.0` and `@uppy/status-bar@5.1.0`; [MIT, copyright 2018 Transloadit](https://github.com/transloadit/uppy/blob/0b1f79c90d699dbe8dae4ce3cd3b1c5d6fc23c16/packages/%40uppy/status-bar/LICENSE), no separate notice. The React file only mounts the Preact StatusBar plugin, so it is a thin wrapper around another dependency and fails the React source-copy/count rule. The Preact UI does expose real upload percentage, ETA, pause/resume/cancel, and progressbar ARIA, but its stripes/spinner have no reduced-motion or forced-colors branch. Dice File Upload already owns the upload family.

- **Grommet Clock, Meter, and Stepper — 0.** [Commit `1e2feb766e6e33687c661240101c5e0d78843293`](https://github.com/grommet/grommet/tree/1e2feb766e6e33687c661240101c5e0d78843293), [`Clock`](https://github.com/grommet/grommet/tree/1e2feb766e6e33687c661240101c5e0d78843293/src/js/components/Clock), [`Meter`](https://github.com/grommet/grommet/tree/1e2feb766e6e33687c661240101c5e0d78843293/src/js/components/Meter), and [`Stepper`](https://github.com/grommet/grommet/tree/1e2feb766e6e33687c661240101c5e0d78843293/src/js/components/Stepper), package `2.55.0`; [Apache-2.0](https://github.com/grommet/grommet/blob/1e2feb766e6e33687c661240101c5e0d78843293/LICENSE) with [`COPYRIGHT.md`](https://github.com/grommet/grommet/blob/1e2feb766e6e33687c661240101c5e0d78843293/COPYRIGHT.md), `Copyright 2015-2024 Hewlett Packard Enterprise Development LP`; no separate `NOTICE` was present. Runtime requires React, styled-components, prop-types, Grommet theme utilities, and package dependencies. Clock's animated digit changes have no reduced-motion semantics; Meter passes a generated label to SVG but has no meter/progress role and its stroke transition has no reduced-motion/forced-colors branch; Stepper is a Dice collision. Primer wins the multi-value meter comparison with a much smaller closure.

### Activity and connection state

- **React Activity Calendar — 0.** [Commit `c4f91027712296638fe1549f7a84f4c6bd008a82`](https://github.com/grubersjoe/react-activity-calendar/tree/c4f91027712296638fe1549f7a84f4c6bd008a82), [`src/components/ActivityCalendar.tsx`](https://github.com/grubersjoe/react-activity-calendar/blob/c4f91027712296638fe1549f7a84f4c6bd008a82/src/components/ActivityCalendar.tsx), package `3.2.1`; [MIT, copyright 2021 Jonathan Gruber](https://github.com/grubersjoe/react-activity-calendar/blob/c4f91027712296638fe1549f7a84f4c6bd008a82/LICENSE), no separate notice. Dependencies are `date-fns@^4.2.1`, `@floating-ui/react@^0.27.19`, and React. It uses real activity data, validates levels, responds horizontally, and correctly disables its optional loading animation under reduced motion. However the SVG day rectangles have no built-in accessible text/role, forced-colors path, or keyboard contract unless the caller supplies a `renderBlock`; its loading mode is a skeleton-like copy. Kibo Contribution Graph already represents the contribution/activity-calendar family.

- **LiveKit connection status components — 0.** [Commit `df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1`](https://github.com/livekit/components-js/tree/df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1), [`ConnectionState.tsx`](https://github.com/livekit/components-js/blob/df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1/packages/react/src/components/ConnectionState.tsx), [`ConnectionStateToast.tsx`](https://github.com/livekit/components-js/blob/df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1/packages/react/src/components/ConnectionStateToast.tsx), and [`ConnectionQualityIndicator.tsx`](https://github.com/livekit/components-js/blob/df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1/packages/react/src/components/participant/ConnectionQualityIndicator.tsx), `@livekit/components-react@2.9.23`; [Apache-2.0](https://github.com/livekit/components-js/blob/df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1/LICENSE) with required [`NOTICE`](https://github.com/livekit/components-js/blob/df4f7455c920d87c6ec13e19f27e5b77ddb1ebb1/NOTICE), `Copyright 2023 LiveKit, Inc.`. Runtime includes `@livekit/components-core`, `livekit-client`, `clsx`, `events`, `jose`, and `usehooks-ts`. These components read genuine room/participant state, but ConnectionState is a text wrapper, the toast has no live-region role and an infinite spinner without reduced-motion handling, and the quality indicator has no built-in accessible name. No forced-colors path was found. A real isolated preview needs a LiveKit room/session; changing the API to accept generic controlled state would be a rewrite. The dependency and provider specificity are unjustified for a general catalog status component.

- **react-detect-offline — 0.** [Commit `d0cab853ca190b4a7e3b4f9a987700306538cbb2`](https://github.com/cwise89/react-detect-offline/tree/d0cab853ca190b4a7e3b4f9a987700306538cbb2), [`src/index.js`](https://github.com/cwise89/react-detect-offline/blob/d0cab853ca190b4a7e3b4f9a987700306538cbb2/src/index.js), package `2.4.5`; [MIT, copyright 2017-2021 Chris Bolin and 2021 Cody Wise](https://github.com/cwise89/react-detect-offline/blob/d0cab853ca190b4a7e3b4f9a987700306538cbb2/LICENSE), no separate notice. Runtime is React plus `prop-types`. It wraps native `online`/`offline` events and optionally polls a hard-coded external endpoint (`httpbin.org`) on an interval. Rendered semantics, announcements, motion, and forced colors are entirely caller-owned. A native event hook plus a status region is smaller; this wrapper is not a distinct visual component and must not add a count.

### Headless helpers and category conflicts

- **react-async — 0.** [Commit `b55964d266b66354be9d10ee9d64a41f8c10415e`](https://github.com/async-library/react-async/tree/b55964d266b66354be9d10ee9d64a41f8c10415e), [`packages/react-async/src/Async.tsx`](https://github.com/async-library/react-async/blob/b55964d266b66354be9d10ee9d64a41f8c10415e/packages/react-async/src/Async.tsx) and [`status.ts`](https://github.com/async-library/react-async/blob/b55964d266b66354be9d10ee9d64a41f8c10415e/packages/react-async/src/status.ts), package `10.0.0`; [ISC, copyright 2019 Gert Hengeveld](https://github.com/async-library/react-async/blob/b55964d266b66354be9d10ee9d64a41f8c10415e/LICENSE), no separate notice. React is its only peer. It implements real promise/abort state and conditional render helpers, but renders no UI, semantics, motion, or forced-color behavior of its own. Hooks, contexts, render props, and conditional wrappers are support infrastructure under the counting rules.

- **react-password-strength-bar — 0 in Status.** [Commit `02932ee99a14e1d9b7202cd49fede6c6d813ea0e`](https://github.com/lannex/react-password-strength-bar/tree/02932ee99a14e1d9b7202cd49fede6c6d813ea0e), [`lib/index.tsx`](https://github.com/lannex/react-password-strength-bar/blob/02932ee99a14e1d9b7202cd49fede6c6d813ea0e/lib/index.tsx), package `0.4.1`; [MIT, copyright 2019 Shin, SeungJae](https://github.com/lannex/react-password-strength-bar/blob/02932ee99a14e1d9b7202cd49fede6c6d813ea0e/LICENSE), no separate notice. Runtime is `zxcvbn@4.4.2` plus React peers. It computes real entropy feedback, but the four bars are anonymous color divs with no meter semantics or forced-colors policy; reduced motion is not applicable. More importantly, password validation belongs to Forms and feedback, not Status and progress.

- **react-password-checklist — 0 in Status.** [Commit `7b5a35e988e26df32f0334705e1a19b4ec8157b2`](https://github.com/sators/react-password-checklist/tree/7b5a35e988e26df32f0334705e1a19b4ec8157b2), [`src/index.tsx`](https://github.com/sators/react-password-checklist/blob/7b5a35e988e26df32f0334705e1a19b4ec8157b2/src/index.tsx), package `1.8.1`; [MIT, copyright 2020 Sators](https://github.com/sators/react-password-checklist/blob/7b5a35e988e26df32f0334705e1a19b4ec8157b2/LICENSE), no separate notice. Runtime has only a React peer. It exposes actual rule results in a semantic list and has no authored motion, but state changes are not live-announced, default SVG icons are not explicitly hidden/named, and inline valid/invalid colors have no forced-colors policy. Its unusually broad peer range admits newer React versions, while the pinned tests still use React 16/Enzyme, so React 19 behavior is unverified. It is form validation and cannot close this category gap.

## Import evidence checklist

For either additive family that advances:

1. Re-fetch the exact commit and compare every copied file before import.
2. Copy the complete referenced runtime/style closure, never a story, demo, screenshot, or generated site wrapper.
3. Record repository, commit, original path, package version, dependencies, assets, modifications, and the complete MIT or Apache obligations.
4. Bind previews to real controlled task/progress state. Do not use trickle algorithms, random increments, fake upload loops, or timers pretending to be work.
5. Keep one normalized behavior fingerprint. Segments, status values, colors, sizes, timings, orientations, and animation flags do not add counts.
6. Run semantic/ARIA, reduced-motion, forced-colors, RTL, narrow-width, zoom, cleanup, Strict Mode, and visual QA before manifest admission.
7. Reject the candidate if the named repair becomes a new API, a broad design-system port, or a visual redesign.
