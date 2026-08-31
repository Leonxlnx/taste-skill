# Design handoff

Read this file before implementing or handing an approved mobile design to another coding agent.

Create `.taste/mobile-design-handoff.json` in the target project. Use JSON so any agent or validation script can consume it without an extra parser.

## Required shape

```json
{
  "schemaVersion": 1,
  "revision": "approved-1",
  "platform": "android",
  "uiStack": "jetpack-compose",
  "designRead": "A calm attention utility for deliberate interruption.",
  "approval": {
    "status": "approved",
    "source": "user",
    "approvedAt": "2026-08-31"
  },
  "tokens": {
    "colors": {},
    "typography": {},
    "spacing": {},
    "shapes": {},
    "motion": {}
  },
  "screens": [
    {
      "id": "entry-purpose",
      "purpose": "Ask for intent before opening a managed app.",
      "states": ["default", "large-text"],
      "reviewImage": "prototypes/entry-purpose-frame.png",
      "rawImage": "prototypes/entry-purpose-raw.png",
      "components": ["purpose-option", "duration-control"],
      "behaviors": ["system-back-dismisses"],
      "openQuestions": []
    }
  ],
  "verification": {
    "viewports": ["small", "representative"],
    "accessibility": ["large-text", "screen-reader"],
    "requiredDeviceChecks": []
  }
}
```

## Rules

- `approval.status` must be `approved` before implementation. Use `draft` during exploration.
- Every implementation screen needs a stable `id`, purpose, state list, component list, and raw image.
- Keep unresolved product behavior in `openQuestions`; do not resolve it through visual guesswork.
- Use repository-relative image paths. Do not embed local absolute paths or temporary image-generation locations.
- Increment `revision` whenever an approved image, token, component contract, or behavior changes.

Validate the file with:

```bash
python skills/mobile-product-taste/scripts/validate_handoff.py path/to/.taste/mobile-design-handoff.json
```

