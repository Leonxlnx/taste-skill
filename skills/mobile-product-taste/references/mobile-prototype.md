# Mobile prototype

Read this file when visual references or multiple screen concepts are requested.

## Lock a design bible

Before generating screens, define and keep stable:

- platform and target aspect ratio
- product mood and audience
- type roles and minimum readable size
- neutral palette, semantic colors, and one controlled accent family
- spacing rhythm, shape rules, icon language, and surface treatment
- navigation, sheets, overlays, keyboard behavior, and motion language

The design bible may be revised after review. Do not let individual generations drift silently.

## Generate the journey

Generate the smallest screen set that makes the requested journey believable. Include meaningful alternate states. A multi-step flow requires separate screens; do not compress it into a collage unless the user asked for a board.

For each approved screen, retain two outputs when implementation will follow.

1. **Review render** with a subtle platform-appropriate device frame or contextual presentation.
2. **Raw screen** without a device frame, reflections, perspective, hands, scenery, or decorative labels outside the app surface.

Use an Android frame for Android products and an iPhone frame for iOS products. If the platform is unspecified, use a neutral frame and mark the assumption.

## Readability and consistency

- Keep primary text comfortably readable at phone size. Split a screen rather than shrinking important text.
- Respect safe areas and reachable action placement.
- Use real draft copy from the product context. Do not use lorem ipsum or decorative fake data.
- Keep the same palette, typography, icon logic, component anatomy, and device geometry across the set.
- Vary screen composition only where the task changes.

## Review loop

Inspect every generated image before delivery. Regenerate a screen when text is malformed, the device frame is wrong, hierarchy is unclear, content is clipped, or the design bible drifted.

⛔ Stop after presenting the coherent set. Ask for approval of the direction before implementation unless the user already authorized implementation.

