# Native implementation

Read this file only when implementing an approved design in Android or iOS code.

## Shared rules

- Confirm the approved screen IDs and handoff revision before editing UI code.
- Reuse the current language, UI framework, navigation, and state model.
- Map the handoff to tokens and reusable components before tuning individual screens.
- Preserve loading, empty, error, permission, keyboard, interruption, and back states.
- Use platform typography scaling and semantic accessibility labels. Do not encode meaningful text inside bitmap assets.
- Animate transforms, opacity, masks, or platform-native drawing primitives. Provide a low-motion result where the platform exposes that preference.
- Verify at the smallest supported viewport, a representative viewport, large text, and the product's required theme modes.

## Android

- Detect Compose, Views/XML, or a hybrid before editing. Do not migrate UI frameworks for a visual redesign.
- Use `dp` for layout and touch geometry and `sp` or scalable typography APIs for text.
- Keep interactive targets at least 48 × 48 dp unless a larger product-specific minimum exists.
- Handle status bars, navigation bars, display cutouts, IME insets, predictive/back navigation, and activity recreation.
- Prefer theme tokens and semantic colors over repeated literals. In Compose, keep state ownership and recomposition boundaries stable; in Views, preserve lifecycle and saved-state behavior.
- Check TalkBack order and labels. Verify overlays, sheets, dialogs, and permission recovery on a real device when they depend on system behavior.

## iOS

- Detect SwiftUI, UIKit, or a hybrid before editing. Do not migrate frameworks for appearance alone.
- Respect safe areas, Dynamic Type, VoiceOver order, keyboard avoidance, scene restoration, and system back/dismiss conventions.
- Keep interactive targets at least 44 × 44 pt unless a larger product-specific minimum exists.
- Prefer semantic colors and text styles. Preserve environment-driven state and navigation ownership.

## Verification evidence

Run existing tests first, then the narrowest tests that cover changed components and flows. Capture screenshots or recordings from the actual emulator/device. Compare against the raw screen reference while allowing platform rendering differences. Document every intentional deviation in the final report and handoff revision.

