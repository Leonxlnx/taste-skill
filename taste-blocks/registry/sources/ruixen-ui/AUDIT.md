# Ruixen UI component audit

## Source and rights

- Repository: `https://github.com/ruixenui/ruixen.com`
- Pinned revision: `3574611de5e9b914b959fc620cd5a9abace8a421`
- Pinned tree: `16c7796758ac35ba96ea31af5da7c45bfafe7c61`
- Retrieved: `2026-07-20`
- Repository identity: GitHub reports `ruixenui/ruixen.com` as a non-fork, non-archived repository with MIT license metadata.
- License evidence: exact `LICENSE.md` copied as `LICENSE`, SHA-256 `091f9e6fbe099673062bb51720462ac33524a394eadb60d2492979dd3faa57f6`.
- Every shipped file is tied to the pinned revision with an immutable permalink plus upstream and shipped SHA-256 values in `drafts.json`.

## Scope result

The pinned `registry.json` contains 200 `registry:ui` records. Four components were retained and 196 were rejected.

Retained:

1. Spark Chart
2. Chapter Scrubber
3. Smart Paste Input
4. Live Waveform

The retained set contains no website section, layout assembly, template, full screen, dashboard, remote runtime asset, or source-owned marketing content.

## Rejection gates

| Gate | Representative rejected source | Reason |
| --- | --- | --- |
| Website composition | card-carousel-hero, pricing-plans, footer-pro, structured-hero-section | Section or marketing assembly rather than a standalone component |
| Ordinary variant | animated-link, checkbox-simple, navbar-minimal, banner-announcement | Existing platform or design-system primitives already cover the behavior |
| Global semantic duplicate | slide-to-delete-button, glass-image-compare, video-player-pro, variable-text, card-stack | Existing Taste Blocks families already provide the same interaction |
| Accessibility gap | fine-tune-slider, scroll-ruler, scrub-datetime, invert-tabs | Pointer or wheel only, missing required semantics or keyboard parity, or scroll interception |
| Misleading state | progress-button, gradient-chat-input, notification-inbox-popover | Simulated success, replies, or activity are built into presentation code |
| Motion or performance failure | cloud-background, particle-text-dots, progressive-flux-loader | Perpetual hidden work, unbounded rendering, layout animation, or unjustified frequent motion |
| App-sized composite | glass-image-editor, calendar-planner, credit-card-dialog, comment-thread | Tool or workflow assembly with too much application policy for a reusable component entry |
| Remote or source-owned media | gravatar-email-input, music-player-card, several showcase and testimonial entries | Runtime network identity or media defaults are not distributable component closure |

Candidates were not repaired when passing the gates would require replacing the source interaction or writing a new component.

## Adaptations

- Copied only the `cn` closure from the upstream application utility and removed unrelated environment, metadata, fetch, date, and text helpers.
- Spark Chart gained finite-data guards, keyboard and touch parity, focus semantics, bounded geometry, and no automatic load animation.
- Chapter Scrubber kept its source interaction while continuous width and position work moved to transform strings. Repeated keyboard navigation settles immediately, and caller geometry is bounded.
- Smart Paste Input keeps its shadcn dialog workflow. Buttons are safe inside parent forms, transitions are explicit, input growth is bounded, and reduced motion drops positional hover effects.
- Live Waveform keeps the source canvas and microphone path. Rendering is bounded and visibility-aware, reduced motion lowers sampling, errors return to the caller, and every observer, frame, stream, and audio context is cleaned up.

## Dependency closure

- `motion@12.23.25`: MIT
- `lucide-react@0.545.0`: ISC
- `clsx@2.1.1`: MIT
- `tailwind-merge@3.3.1`: MIT
- Smart Paste Input declares the official shadcn `button`, `dialog`, and `textarea` registry dependencies instead of assuming local aliases.

No dependency was added to the Taste Blocks catalog application for these drafts.

## Verification

- Source-local policy and provenance verifier: passed, 4 retained and 196 rejected.
- Official shadcn registry schema: passed through the shared draft policy.
- Secret and remote runtime asset scans: passed.
- Strict TypeScript for source-local components without registry dependencies: passed.
- Isolated consumer, production build, browser interaction, mobile, RTL, reduced motion, and cleanup checks: pending.
