---
name: mobile-product-taste
description: Audit, prototype, and implement coherent native mobile product interfaces. Use for Android or iOS app redesigns, multi-screen product flows, image-to-native-code work, 移动端改版, 原型稿, or 按照设计稿实现. Do not use for websites, marketing pages, isolated bug fixes, or image-only requests that do not need an implementation handoff.
metadata:
  short-description: Mobile audit, prototype, and native implementation
---

# Mobile Product Taste

Turn a mobile product idea or existing app into an approved visual system, an implementation-ready handoff, and verified native UI. Preserve product logic and user decisions while improving visual quality.

## Choose the mode

Infer the narrowest mode that satisfies the request.

- **Audit** when the user wants critique, direction, or a redesign discussion. Do not edit product code.
- **Prototype** when the user wants screens, flows, or visual alternatives. Generate images and a handoff draft, then stop for approval.
- **Implement** when the user approved a prototype, supplied a final reference, or explicitly asked to skip prototyping and build now.
- **Full workflow** when the user explicitly asks for audit through implementation.

If the platform or requested mode cannot be inferred from the project and brief, ask one decision-changing question. Do not ask for information that repository evidence can answer.

## Workflow

1. Inspect the project, references, existing design assets, platform, UI stack, primary flow, and required states.
2. State a one-line design read and create or update `.taste/mobile-design-brief.md` in the target project.
3. For an existing product, read [references/mobile-audit.md](references/mobile-audit.md) and record an evidence-based audit before proposing changes.
4. For visual exploration, read [references/mobile-prototype.md](references/mobile-prototype.md). Produce a coherent screen set, not a single decorative board.
5. ⛔ **Approval gate:** do not implement from newly generated references until the user approves a direction. A direct request to implement now counts as approval to skip this gate.
6. Before implementation, read [references/design-handoff.md](references/design-handoff.md). Write `.taste/mobile-design-handoff.json` and run `scripts/validate_handoff.py`.
7. For native code, read [references/native-implementation.md](references/native-implementation.md). Work in the existing stack, preserve behavior, and verify on the relevant emulator or device.
8. Report changed screens, preserved behavior, verification evidence, and any remaining visual uncertainty.

## Required outputs

| Mode | Verifiable output |
| --- | --- |
| Audit | `.taste/mobile-design-brief.md` with evidence, constraints, and screen/state inventory |
| Prototype | Review images plus implementation-ready raw screens and a handoff draft |
| Implement | Valid handoff, code changes, automated checks, and emulator/device evidence |
| Full workflow | All outputs above, separated by the approval gate |

## Hard boundaries

- Do not copy a reference image blindly. Extract its hierarchy, spacing, type, color, shape, and motion rules.
- Do not invent missing product behavior to make a screen look complete. Mark unresolved behavior in the handoff.
- Do not change navigation, permissions, data handling, labels with product meaning, or accessibility behavior silently.
- Do not import a new UI library until the existing dependency and design-system choices are checked.
- Do not treat a phone mockup as an implementation reference. Implementation references must also exist without a device frame.
- If image generation fails twice, stop generating, keep the written design system, and offer a code-native prototype or a retry later.
- If a build or device check cannot run, state the exact unverified layer. Do not claim visual parity.

## Final check

Confirm that every required state has a screen, all screens share one visual system, touch and text accessibility pass, the handoff validator passes, and the final report distinguishes observed evidence from judgment.

