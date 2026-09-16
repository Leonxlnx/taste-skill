# Mobile audit

Read this file only for an existing app or an explicit design review.

## Evidence first

Inspect the running app when possible. Pair screenshots with code evidence so the audit can distinguish visual symptoms from implementation constraints. Record the platform, UI framework, theme/token source, navigation model, supported device classes, and accessibility constraints.

## Screen and state inventory

List the primary journey in order. For each screen, record the states that can actually occur.

- initial, returning, empty, populated, loading, error, disabled, permission denied
- keyboard open, long text, large text, offline, interrupted, and back navigation
- light/dark mode only when the product supports both

Missing states are product risks, not decoration tasks.

## Audit lenses

### Product hierarchy

- Can a user identify the current state, the next action, and the way back without reading explanatory prose?
- Does the primary action match the product's decision, or merely carry the brightest color?
- Are repeated confirmations, dead ends, and unnecessary app launches visible in the journey?

### Platform fit

- Respect system bars, display cutouts, keyboard insets, back behavior, and platform navigation conventions.
- Check tap targets, text scaling, focus order, screen reader labels, contrast, and state announcements.
- Separate platform conventions from brand choices. A brand may change color and form; it should not make system behavior surprising.

### Visual system

- Identify the real type scale, spacing rhythm, color roles, radius rules, icon family, elevation rules, and motion language.
- Flag generic AI patterns only when evidence shows they weaken hierarchy or identity. Do not replace one trend with another.
- Check whether visual density matches the task. A focused decision screen and a browsing screen may need different density within one system.

### Implementation health

- Locate duplicated values, one-off styles, inconsistent components, and layout constants that break on another device.
- Preserve stable functionality. Prefer tokens and reusable components when at least two screens share the same decision.

## Audit output

Write the following into `.taste/mobile-design-brief.md`.

1. One-line design read
2. Product and platform constraints
3. Current journey and state inventory
4. Evidence-backed problems, ordered by user impact
5. Visual direction with preserved elements
6. Open decisions that would materially change the result

