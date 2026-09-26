# Mobile Product Taste repair report

## Why this change exists

The first review was made from two separately downloaded files, `redesign-skill` and `imagegen-frontend-mobile`. That partial view correctly exposed a missing handoff, but it understated the full repository. After cloning the repository, the audit found that Taste Skill already had a general web implementation skill, a website image-to-code workflow, and a mobile image-generation skill.

The remaining gap was specific and reproducible:

- `design-taste-frontend` explicitly places native mobile outside its scope.
- `image-to-code` implements websites, not Android or iOS products.
- `imagegen-frontend-mobile` deliberately stops at images and defaults to framed presentation renders.
- `redesign-existing-projects` is largely written around HTML, CSS, browser interaction, and web delivery.

An Android or iOS task therefore had no single portable workflow for audit, coherent multi-screen prototyping, user approval, implementation handoff, native code, and device verification.

## Decision

The repair adds a new installable skill named `mobile-product-taste`. Existing skills and install names remain unchanged. This keeps each established skill's contract stable while filling the native mobile gap.

The new skill uses progressive disclosure:

- `SKILL.md` contains routing, outputs, hard boundaries, and the approval gate.
- `references/mobile-audit.md` is loaded only for existing products or design reviews.
- `references/mobile-prototype.md` is loaded only when visual exploration is required.
- `references/design-handoff.md` defines a portable JSON contract before code work.
- `references/native-implementation.md` is loaded only for Android or iOS implementation.

## Process

1. Cloned and inspected the full upstream repository instead of relying on the partial local reference.
2. Located the exact scope boundaries in the existing skills and README.
3. Added a non-breaking native-mobile workflow with audit, prototype, implement, and full-workflow modes.
4. Added a hard approval stop between newly generated references and implementation.
5. Required both framed review renders and raw implementation screens.
6. Added a JSON handoff with screen IDs, states, tokens, behaviors, approval status, and verification requirements.
7. Added Android and iOS implementation checks while preserving the existing UI stack.
8. Added deterministic validators and routing evaluation cases.
9. Updated the repository registry, discovery summary, README, and changelog.

## Observable effect

| Before | After |
| --- | --- |
| Mobile image generation ended without a code-ready contract. | Prototype mode emits raw screens and a validated handoff draft. |
| Website image-to-code guidance could be misapplied to native apps. | The new description routes Android/iOS tasks and excludes websites. |
| A phone mockup could become the only implementation reference. | Implementation requires an unframed raw screen for every screen ID. |
| Implementation could begin while the visual direction was unsettled. | A marked approval gate stops newly generated designs before code. |
| Native accessibility and system behavior were unspecified. | Android/iOS checks cover touch size, text scaling, system insets, navigation, restoration, and assistive technology. |

## Evaluation

### Deterministic checks

| Check | Result |
| --- | --- |
| Codex `quick_validate.py` | PASS |
| Skill structure and reference routing | PASS, `SKILL.md` is 56 lines |
| Routing catalog | PASS, 6 cases covering four positive modes and two exclusions |
| Valid handoff fixture | PASS |
| Invalid platform and incomplete handoff fixture | Rejected as expected |

Commands used:

```bash
python path/to/skill-creator/scripts/quick_validate.py skills/mobile-product-taste
python skills/mobile-product-taste/scripts/validate_skill.py
python skills/mobile-product-taste/scripts/run_evals.py
```

### Skill quality review

The planned wrapper scored 52/100 when it had no unified entry, no handoff, no native implementation contract, and no deterministic failure checks. The implemented `mobile-product-taste` scores 96/100 under the same review rubric.

| Dimension | Implemented score |
| --- | ---: |
| Trigger precision | 5/5 |
| Progressive disclosure | 5/5 |
| Negative space | 5/5 |
| Output contract | 5/5 |
| Environment independence | 5/5 |
| Failure modes | 4/5 |
| Composability | 4/5 |
| Instruction enforceability | 5/5 |

The remaining uncertainty is behavioral. Deterministic checks prove structure and contract rejection, not the quality of every model-generated design. Real task evaluations should continue to compare screen consistency, approval-gate compliance, native implementation fidelity, and device evidence across agents.

## Invocation examples

```text
Use $mobile-product-taste to audit this existing Android flow. Discuss the direction before changing code.
```

```text
Use $mobile-product-taste to generate a coherent iOS screen set, wait for approval, then implement the approved direction in the existing project.
```

