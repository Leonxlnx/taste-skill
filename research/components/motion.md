# Motion Components

Evaluation vocabulary for selecting imported motion components. These descriptions are not implementations and do not count toward the catalog.

Use CSS first, then IntersectionObserver, ResizeObserver, Web Animations, and View Transitions. Add Motion only for shared layout, gestures, or springs that are difficult to implement and maintain natively.

For split text, use `Intl.Segmenter`, keep one complete semantic string for assistive technology, and mark visual fragments decorative. Wrapped-line effects must recalculate after fonts load and when layout changes.

## Text and editorial

| Component | Purpose | Reduced motion |
| --- | --- | --- |
| Masked Line Reveal | Reveal real wrapped lines once without controlling their breaks. | Static or one short opacity change. |
| Phrase Group Reveal | Move two to four authored phrase groups instead of every character. | Reveal together without translation. |
| Focus Word Emphasis | Shift weight or ink color on one meaningful word after the full heading is readable. | Immediate emphasis. |
| Key Phrase Handoff | Replace one phrase inside a stable sentence frame, preferably by user action. | Instant change or short crossfade. |
| Image Caption Reveal | Introduce a caption when its associated media becomes visible. | Caption is immediately visible. |
| Expandable Summary | Open clamped copy without a fixed-height guess or detached control. | Immediate expansion. |
| Inline Definition | Reveal a definition from the real term anchor without obscuring nearby text. | Instant accessible popover. |
| Before and After Copy Handoff | Preserve unchanged phrases while marking meaningful copy differences. | Instant swap with static diff marks. |

## Numbers and state text

| Component | Purpose | Reduced motion |
| --- | --- | --- |
| Changed Digit Roll | Roll only digits that actually change and in the correct direction. | Instant value plus brief color cue. |
| Value Delta Flash | Confirm an update without moving the value. | Same static color or underline cue. |
| Fixed Unit Counter | Change the number while currency, unit, and label remain fixed. | Instant value. |
| Progress Fraction | Change the current part of a real fraction while the total stays fixed. | Instant number. |
| Status Label Handoff | Coordinate icon and label across syncing, ready, and failed states. | Immediate state. |
| Button State Handoff | Keep default, loading, success, and retry labels inside one stable button frame. | Immediate label and static status icon. |
| Copy Confirmation | Replace copy with copied briefly without changing control width. | Instant replacement. |
| Hint and Error Handoff | Replace a form hint with a useful error in a reserved region. | Immediate replacement. |
| Password Criteria Resolve | Mark real criteria complete without bounce, confetti, or invented requirements. | Static check state. |
| Loading Sentence Stepper | Show real process stages without fake timing or progress. | Immediate stage. |

## Links and navigation

| Component | Purpose | Reduced motion |
| --- | --- | --- |
| Directional Underline | Reflect forward or backward navigation while focus keeps a normal underline. | Static underline. |
| Arrow Link Feedback | Move an arrow two to four pixels while keeping the label fixed. | Color or stroke change. |
| Shared Nav Marker | Move one active marker between navigation items. | Marker jumps. |
| Breadcrumb Handoff | Update a changing path without disturbing the current page label. | Instant path. |
| Pagination Number Strip | Shift a bounded number window by one actual page step. | Instant update. |
| Backlink Return Cue | Preserve orientation and visibly focus the returned destination. | Focus cue only. |
| Footnote Jump Continuity | Connect a source marker and destination footnote after a real anchor jump. | Destination outline only. |
| Search Match Emphasis | Mark matching substrings after input settles while preserving result identity. | Instant results and highlights. |
| Tab Content Direction | Use selection direction for adjacent tab content without changing container height abruptly. | Instant swap or crossfade. |
| Section Index Change | Update a persistent index at real section boundaries. | Instant index. |

## Editorial and scroll-linked

| Component | Purpose | Reduced motion |
| --- | --- | --- |
| Sticky Chapter Label | Keep the current case-study or essay chapter visible. | Instant label switch. |
| Reading Progress | Reflect actual reading progress without an independent animation. | Direct progress update. |
| Timeline Step Handoff | Coordinate a current step and completed connector. | Static current and complete states. |
| Gallery Title Sync | Change selected media, title, and caption as one controlled action. | Instant change or crossfade. |
| Comparison Annotation | Reveal an annotation only when a real comparison exposes its subject. | Explicit before and after toggle. |
| Case Study Metric Reveal | Introduce verified results once without counting from zero for decoration. | Value visible immediately. |
| Comparison Row Focus | Move one focus surface between rows while values stay fixed. | Instant focus surface. |
| Filter Summary Tokens | Update only the changed pieces of a useful results sentence. | Instant text. |
| Inline Review Diff | Settle approved additions and removals into one baseline with undo. | Immediate diff. |
| Section Theme Handoff | Change a deliberate story theme at a real content boundary. | Immediate theme. |

## Interaction motion

| Component | Purpose | Reduced motion |
| --- | --- | --- |
| Press Compression | Provide tactile pointer or touch feedback without hover enlargement. | Surface or color feedback. |
| Hold to Confirm | Show real hold duration for a costly or destructive action. | Textual stepped progress. |
| Disclosure Row | Open measured content while the heading remains anchored. | Instant content and icon state. |
| Origin Aware Tooltip | Enter from the trigger edge while keyboard browsing remains immediate. | Instant tooltip. |
| Origin Aware Menu | Enter from the trigger or pointer origin; menu keyboard movement stays still. | Instant menu. |
| Shared Segmented Marker | Move one selection surface beneath a small option group. | Marker jumps. |
| Drag Aware Toggle | Follow a real drag then settle without moving the label. | Immediate state. |
| Selection Toolbar | Place a toolbar from an actual selection rectangle and keep it positioned. | Instant placement. |
| Toast Stack | Preserve stack gaps, pause timers, and support deliberate dismissal. | Opacity-only entrance. |
| Reorder List | Move neighbors into their actual future positions and provide keyboard reordering. | Direct placement. |
| Inline Rename Commit | Keep input and final label in one stable frame. | Instant commit. |
| Filter Token Transfer | Preserve the relationship between a selected menu item and active filter. | Instant add or remove. |

## Shared primitives

Only five internal primitives are justified for the first set:

- `TextSegments`: locale-aware words and graphemes with one accessible source string.
- `PresenceSwap`: stable-frame content replacement.
- `SharedMarker`: active surfaces for navigation, tabs, and controls.
- `InViewOnce`: one shared observer for entrance effects.
- `MotionPreference`: one consistent reduced-motion contract.

## Exclude

Do not add random-character gibberish, typewriter heroes, permanent character waves, moving gradients through readable text, uncontrolled automatic text carousels, decorative marquees, identical reveals on every section, content hidden until JavaScript runs, motion-generated line breaks, long staggers, or large blur and scale entrances.
