# Componentry source record

Source: `harshjdhv/componentry` at commit `0c90c9b9e624c483d434cdb85df084fd399f24c3`.

License: MIT, copied in `LICENSE`. Copyright (c) 2026 Harsh Jadhav.

## Retained

- Bouncy Accordion
- Circuit Board
- Closing Plasma
- Cursor Driven Particle Typography
- Dithered Logo, published as Dithered Image Particles
- Letter Cascade
- Pixel Canvas
- Ripple Transition

Every retained item remains source-backed. Changes are limited to dependency relocation, removal of fixed demo content, accessibility repairs, lifecycle cleanup, bounded rendering, input parity, reduced-motion behavior, and deletion of unrelated exports. Exact file hashes and per-file changes are recorded in `drafts.json`.

## Rejected

- Page or section compositions: Collection Surfer, Dither Prism Hero, Hero Geometric, Scroll Choreography, Scroll Split Card, Scroll Tilted Grid, Sticky Scroll Cards, Testimonial Marquee, and Gradient Hero 01.
- Existing-family duplicates: Animated Gradient, Dither Gradient, Kinetic Text Reveal, Layered Stack, Liquid Blob, Liquid Chrome, Magnetic Dock, Orbit Card Stack, Prism Gradient, Silk Aurora, Split Flap Display, Text Animate, Text Repel, and WebGL Liquid.
- Disproportionate runtime dependency cost: Image Ripple Effect (about 917 KB minified in an isolated browser bundle through Three, React Three Fiber, and Drei).
- Components requiring replacement-scale repairs rather than minimal adaptation: Image Trail, Infinite Image Field, and Magnet Lines.
- Generic primitives or wrappers below the collection bar: Auth Modal, Border Beam, Button, Command Menu, Drawer, Hyper Text, Interactive Hover Button, Pulsating Button, Scrub Input, Shimmer Button, Showcase Card, and Spotlight Card.
- Fixed-content, remote-data, or remote-media components: Flight Status Card, GitHub Calendar, Mac Keyboard, Music Player, and Signature. Signature also depends on a font asset without a separate license record.
- Decorative or novelty effects without enough durable utility: Eye Tracking, Matrix Rain, Noise Texture, and Particle Galaxy.

The support-only WebGL Error Boundary and the exact utility/easing closure are not counted as components.
