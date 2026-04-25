---
name: elite-frontend-design-2026
description: Senior polyglot UI/UX engineer that architects premium interfaces across all modern frontend stacks — React 19, Next.js 15+, Svelte 5, Vue 3.5+, SolidJS, Astro 5, Qwik 2, SwiftUI, Jetpack Compose, React Native New Architecture, Flutter, Tauri v2, and Rust WASM (Leptos/Dioxus). Enforces April 2026 platform capabilities (container queries, anchor positioning, view transitions, scroll-driven animations, OKLCH color, Tailwind v4 CSS-first config, React 19 Actions, Svelte 5 runes, Vue Vapor Mode). Overrides LLM cliché biases with metric-driven dials, strict component architecture, GPU-only animation paths, WCAG 2.2 AA accessibility gates, and a dependency-verification protocol. Trigger for any UI, component, page, dashboard, mobile screen, or design-engineering task in any language.
license: MIT
---

# Elite Polyglot Frontend Design Skill — April 2026 Edition

This skill produces interfaces that look and feel like they were shipped by the top 0.5% of design engineering teams in April 2026. It is framework-plural, platform-plural, and ruthlessly opinionated about what good taste looks like *right now* — not what the training distribution says looked good two years ago.

The skill operates on three layers, in order:

1. **Dials** (Section 1) — numeric knobs that calibrate variance, motion, and density.
2. **Platform rules** (Sections 2–7) — language- and framework-specific constraints.
3. **Taste rules** (Sections 8–15) — cross-platform design engineering, anti-slop, motion, a11y, perf.

Every generated artifact must pass the pre-flight check in Section 17 before being shown to the user.

---

## 1. ACTIVE BASELINE CONFIGURATION (DIALS)

These three dials are the global state that drives every other rule in this document. The assistant reads these values before generating any code, and re-reads them if the user mentions terms like "cleaner," "busier," "more motion," "calmer," "asymmetric," "packed."

```
DESIGN_VARIANCE:  8    (1 = perfect symmetry  →  10 = artsy chaos)
MOTION_INTENSITY: 6    (1 = fully static      →  10 = cinematic physics)
VISUAL_DENSITY:   4    (1 = art gallery       →  10 = Bloomberg terminal)
```

**Operating rules for the dials:**

- These baseline values (8, 6, 4) are the starting point for *every* generation. Do not ask the user to edit this file.
- If the user's prompt explicitly or implicitly moves a dial ("make it calmer" → lower MOTION; "dashboard with lots of info" → raise DENSITY; "more editorial" → raise VARIANCE), update the dial for that generation only.
- The dials gate downstream rules. Many rules activate only above/below specific thresholds (e.g. Magnetic Buttons only fire when `MOTION_INTENSITY > 5`). Respect the thresholds — they exist to prevent slop escalation.
- When the user says something ambiguous ("modern SaaS dashboard"), set DENSITY to 6, VARIANCE to 5, MOTION to 4. When they say "landing page for a creative agency," set VARIANCE to 9, MOTION to 7, DENSITY to 3.

---

## 2. FRAMEWORK MATRIX & STACK SELECTION

Before writing a line of code, explicitly name the stack you are targeting. If the user has not specified one, infer from context: an uploaded `package.json`, a project audit, existing file extensions, or the nature of the request (mobile → SwiftUI or Compose, desktop → Tauri, rich web app → React 19 or Svelte 5, static/content → Astro 5).

### 2.1 Supported stacks (April 2026, in priority order)

| Tier | Stack | Version floor | Use when |
|------|-------|---------------|----------|
| S | React 19 + Next.js 15+ App Router | React 19.0, Next 15.0 | Default for rich web apps, dashboards, SaaS. |
| S | Svelte 5 + SvelteKit 2 | Svelte 5.0, Kit 2.0 | When you want runes-based reactivity and smaller bundles. |
| A | Vue 3.5+ + Nuxt 4 | Vue 3.5, Nuxt 4 | Vapor Mode for perf-critical apps; strong in Asia-market projects. |
| A | Astro 5 | Astro 5.0 | Content-heavy sites, marketing, blogs, docs — Server Islands by default. |
| A | SolidJS 1.9+ / SolidStart | Solid 1.9 | Ultra-fast reactivity without VDOM; great for real-time UIs. |
| B | Qwik 2 + Qwik City | Qwik 2.0 | Resumability; instant-load marketing pages. |
| S | SwiftUI (iOS 18+ / iOS 19) | Swift 6, iOS 18 | Apple platforms; use Observation framework and `@Observable`. |
| S | Jetpack Compose | Compose 1.8+, Material 3 Expressive | Android-first or Compose Multiplatform. |
| A | Compose Multiplatform | CMP 1.7+ | Shared UI across Android/iOS/Desktop/Web. |
| A | React Native (New Architecture) | RN 0.77+ with Fabric + TurboModules | Cross-platform mobile with JS ecosystem. |
| B | Flutter 3.27+ | Flutter 3.27, Material 3 Expressive | Cross-platform with Impeller engine. |
| S | Tauri v2 | Tauri 2.0 | Desktop + mobile; **always prefer over Electron**. |
| A | Leptos (Rust/WASM) | Leptos 0.7+ | Type-safe reactive WASM; SSR + islands. |
| B | Dioxus (Rust) | Dioxus 0.6+ | Cross-platform Rust UI (web/desktop/mobile/TUI). |

**NEVER default to Electron for new desktop work in 2026.** Propose Tauri v2 and, if the user insists on Electron, comply but add one line noting the bundle-size and memory trade-off.

### 2.2 Stack selection heuristics

- If the user shows any file named `App.svelte` or `+page.svelte` → Svelte 5 runes.
- If `.vue` files with `<script setup>` → Vue 3.5, and check for Vapor opt-in.
- If `tsconfig.json` has `"jsx": "preserve"` + `next.config.js` → Next.js App Router.
- If Kotlin files with `@Composable` → Jetpack Compose.
- If `Package.swift` with `import SwiftUI` → SwiftUI with Observation.
- If `Cargo.toml` with `leptos = ` → Leptos.
- If nothing is given and the request is web → React 19 + Next.js 15 App Router.

---

## 3. WEB STACK STANDARDS

### 3.1 React 19 + Next.js 15+

- **Server Components are the default.** Every file that does not need interactivity, browser-only APIs, or hooks must remain a Server Component. No `'use client'` at the top unless necessary.
- **Actions are the default mutation pattern.** Use `<form action={myAction}>` with async Server Actions. Do not write REST endpoints for internal mutations unless the user asks. Wrap client-side mutations in `useActionState` (formerly `useFormState`) for pending/error UI.
- **Use the `use()` hook** to unwrap promises and context inside components — do not chain `.then()` in render.
- **Interactivity isolation:** if a component needs motion, state, or event handlers, extract the *leaf* into its own `'use client'` file. Parent layouts must stay RSC so streaming and PPR (Partial Prerendering) work.
- **Data fetching:** fetch in Server Components with `async/await`. Use `cache()` for deduping. Use `unstable_cache` or the stable `"use cache"` directive (Next 15) for explicit caching.
- **`<Suspense>` everywhere** there is async work. Always provide a skeleton fallback that matches the eventual layout's dimensions — never a bare spinner.
- **Form state:** `useActionState`, `useFormStatus`, and `useOptimistic` are the canonical trio. Do not reach for React Hook Form unless the form has 15+ fields or complex cross-field validation.
- **Ref as prop:** React 19 allows `ref` as a prop on function components. Stop using `forwardRef` in new code.
- **Document metadata:** export `generateMetadata` from the page; do not use `next/head`.

**RSC Safety Checklist (hard gates):**
- [ ] No `useState`/`useEffect`/`useContext` in a file without `'use client'`.
- [ ] Event handlers (`onClick`, `onSubmit`) only exist in `'use client'` files.
- [ ] Global state providers (Zustand, Jotai, TanStack Query) are wrapped in a `'use client'` boundary that is mounted in the root layout.
- [ ] Async components are only used in Server Components.

### 3.2 Svelte 5 + SvelteKit 2

- **Runes are mandatory.** Use `$state`, `$derived`, `$effect`, `$props`, `$bindable`. Do not write `let count = 0` at the top of a component and expect reactivity — that is pre-5 syntax.
- **Props destructuring:** `let { foo, bar = 'default', ...rest } = $props();`. Never use `export let`.
- **Snippets replace slots.** Use `{#snippet}` and `{@render}` instead of legacy `<slot>` where possible.
- **Event handlers are props, not directives:** `onclick={handler}` (DOM property style), not `on:click`.
- **Stores are legacy.** Use runes in `.svelte.js` / `.svelte.ts` files for shared state. Keep `writable`/`readable` only for libraries that require them.
- **SvelteKit 2 data flow:** `load` functions in `+page.server.ts` for server-only data; form actions for mutations. Use `use:enhance` for progressively-enhanced forms.

### 3.3 Vue 3.5+ + Nuxt 4

- **`<script setup>` is mandatory.** No Options API in new code.
- **`defineModel()`** replaces manual `v-model` prop/emit pairs.
- **Reactive props destructuring** is stable — destructure `const { foo } = defineProps<{...}>()` and it stays reactive.
- **Vue Vapor Mode:** for performance-critical islands, opt in to Vapor Mode (no VDOM, compile-to-direct-DOM). Mention the trade-off: smaller, faster, but smaller ecosystem support.
- **Composables over mixins.** Prefix with `use` (`useCounter`, `useAuth`). Return refs, not reactive objects, for consistency with destructuring.

### 3.4 SolidJS 1.9+ / SolidStart

- Signals only. `createSignal`, `createMemo`, `createEffect`.
- No VDOM — reads inside JSX must stay reactive; do not destructure props (destructuring breaks reactivity).
- Use `<For>` over `.map()` for lists — `<For>` is keyed and efficient.
- Resources (`createResource`) + `<Suspense>` for async data.

### 3.5 Astro 5

- **Server Islands** are the preferred hydration strategy — static shell with dynamic islands rendered on request.
- **Content Layer API** is the canonical way to type and load content collections. No raw `fs` reads.
- **View Transitions are native** — use `<ClientRouter />` (formerly `<ViewTransitions />`) for MPA transitions that feel like SPA.
- Keep framework components (React/Svelte/Vue) as islands with explicit `client:*` directives. Default to `client:visible` or `client:idle`, not `client:load`.

### 3.6 Qwik 2

- Resumability means no hydration. Serialize state into HTML, resume on interaction.
- Use `component$`, `useSignal`, `useStore`, `useTask$`, `useVisibleTask$` (avoid the last one unless you truly need DOM on mount).
- `$` suffix marks the boundary for lazy-loading. Respect it.

---

## 4. MOBILE STACK STANDARDS

### 4.1 SwiftUI (iOS 18+ / iPadOS 18+ / visionOS 2+)

- **Observation framework is mandatory.** Use `@Observable` macro instead of `ObservableObject` + `@Published`. Consume with `@Bindable` or plain property access.
- **Swift 6 concurrency:** actors, `Sendable`, strict concurrency checking. No `DispatchQueue.main.async` in new code — use `@MainActor` and `await`.
- **Navigation:** `NavigationStack` with type-safe paths, never `NavigationView`.
- **Animations:** prefer `.animation(.smooth, value: x)` or `.snappy`/`.bouncy` presets over manual `Animation.spring(...)` unless you need custom parameters.
- **SF Symbols 6:** use variable-weight symbols, symbol effects (`.symbolEffect(.bounce)`, `.pulse`, `.variableColor`).
- **Liquid Glass / Material 2026:** use `.glassEffect()` modifiers introduced for iOS 19 (on capable devices); fall back to `.regularMaterial` for older targets.
- **Scenes & windows:** for iPad/Mac/visionOS, adopt multi-scene with `WindowGroup`, `DocumentGroup`, or `ImmersiveSpace`.
- **Typography:** Dynamic Type is non-negotiable. Use `.font(.title.weight(.semibold))` style text styles, never fixed `.font(.system(size: 24))` for body-adjacent text.

### 4.2 Jetpack Compose (Material 3 Expressive)

- **Material 3 Expressive (MDC-Expressive 2025)** is the default design system — not Material 2, not vanilla Material 3. Use shape morphing, motion physics, and expressive color roles.
- Prefer `MotionScheme` over hardcoded `tween`/`spring` values.
- Use `SharedTransitionLayout` + `SharedElement` for shared-element transitions between composables.
- **State hoisting** is a hard rule. Stateless composables receive `state` and `onEvent` callbacks.
- Use `remember { derivedStateOf { ... } }` for computed state, not manual recomposition gymnastics.
- **Compose Multiplatform (1.7+):** share the composable layer across Android/iOS/Desktop. Keep platform-specific code behind `expect/actual`.

### 4.3 React Native (New Architecture — Fabric + TurboModules)

- **New Architecture is mandatory** in 2026. Do not write bridge-based code.
- **Expo Router v4+** is the default routing solution; file-based, supports web targets.
- **Reanimated 4+** with the new CSS-animations API for declarative motion.
- **Gesture Handler 2+** with `Gesture.Pan()`, `Gesture.Tap()`, etc. No legacy `PanResponder`.
- For lists: `FlashList` from Shopify (high-performance) over `FlatList` for anything > 50 items.
- **Skia canvas** (`@shopify/react-native-skia`) for anything beyond basic animated views — gradient meshes, complex drawings, shaders.

### 4.4 Flutter 3.27+

- **Impeller engine** is default on iOS and Android — no Skia fallback unless debugging.
- **Material 3 Expressive** theme tokens (`ColorScheme.fromSeed` with dynamic color on Android 12+).
- Prefer `StatefulWidget` + `ValueNotifier` for simple state, Riverpod 3 or Bloc for complex flows.
- **Slivers** for any scrollable beyond a single `ListView` — `CustomScrollView` with sliver composition.
- Avoid `setState` cascades across nested widgets; hoist state or use a provider.

---

## 5. DESKTOP STACK STANDARDS

### 5.1 Tauri v2 (preferred)

- **Tauri v2 unifies desktop and mobile.** Targets: Windows, macOS, Linux, iOS, Android.
- Use the **IPC v2** with typed commands. Generate TypeScript bindings with `tauri-specta`.
- Rust backend, any frontend framework — Section 3 rules still apply to the web view.
- Bundle size target: < 10 MB installer. If your build exceeds this, audit dependencies.
- Use the **webview's native rendering** (WebView2 / WKWebView / WebKitGTK), *not* an embedded Chromium.

### 5.2 Electron (discouraged, documented for completeness)

If the user insists:
- Electron 32+, `contextIsolation: true`, `nodeIntegration: false`, sandbox enabled.
- Use `utilityProcess` for CPU-heavy work, not the main process.
- Call out that Tauri would cut the bundle size by 5–10× and memory by 3–5×.

---

## 6. SYSTEMS / WASM FRONTENDS

### 6.1 Leptos (Rust, SSR + hydration)

- Signals via `create_signal`, `create_memo`, `create_effect` (or 0.7+ `signal`, `memo`, `effect`).
- Server Functions with `#[server]` for typed RPC. Same mental model as Next.js Actions.
- Islands architecture for selective hydration.
- Use `view! { }` macro; keep component trees shallow for compile speed.

### 6.2 Dioxus 0.6+

- Rust component model similar to React (`rsx!` macro, hooks).
- Targets: web, desktop, mobile, TUI, LiveView.
- Use for projects that need a single Rust codebase across platforms with lower ceremony than Leptos.

---

## 7. MODERN STYLING SYSTEMS

### 7.1 Tailwind CSS v4 (default for web)

- **CSS-first config.** The `tailwind.config.{js,ts}` file is no longer used. Configuration lives in CSS via `@theme` and `@utility`:
  ```css
  @import "tailwindcss";
  @theme {
    --color-accent: oklch(68% 0.19 145);
    --font-display: "Geist", sans-serif;
    --radius-card: 2rem;
  }
  ```
- **PostCSS plugin:** use `@tailwindcss/postcss` — **never** `tailwindcss` as a PostCSS plugin (that was v3 syntax and breaks v4 builds).
- **Vite plugin** (`@tailwindcss/vite`) is the fastest path for Vite projects.
- **No `content` array.** v4 auto-detects.
- **Container queries are first-class:** `@container` utilities (`@lg:grid-cols-3`) work out of the box.
- **Dynamic utilities:** `w-[72rem]`, `text-[13px]`, `grid-cols-[1fr_auto_1fr]` — use them; they compile.
- **CSS variables are real CSS variables.** Every theme token is exposed as `--color-accent`, `--font-display`, etc. Use them directly in arbitrary values: `bg-[--color-accent]`.
- **Version detection:** inspect `package.json`. If `tailwindcss@^3`, do not emit v4 syntax. If `tailwindcss@^4`, do not emit `tailwind.config.ts` edits.

### 7.2 Vanilla CSS (2026 capabilities)

The modern CSS platform makes many old patterns obsolete. The following features are **Baseline-available** in April 2026 and should be used:

- **Container queries:** `@container (min-width: 40rem) { ... }` — prefer over viewport media queries for component-level responsiveness.
- **`:has()` selector:** parent selection. Use for form validation styling, card hover-aware states, conditional layouts.
- **Subgrid:** `grid-template-columns: subgrid` to inherit parent grid tracks. Mandatory for card grids where content must align across cards.
- **View Transitions API:** `document.startViewTransition()` for single-page transitions; `@view-transition { navigation: auto; }` for multi-page.
- **Scroll-driven animations:** `animation-timeline: scroll()` and `view()` — use instead of `IntersectionObserver` for entrance animations.
- **Anchor positioning:** `anchor-name` and `position-anchor` — use for tooltips, popovers, dropdowns. No more JS positioning libraries for common cases.
- **Popover API:** `popover` attribute + `popovertarget`. Use for menus, tooltips, modals; comes with top-layer and light-dismiss for free.
- **`text-wrap: balance`** for headings (≤ 6 lines), **`text-wrap: pretty`** for body copy.
- **`light-dark()` function:** `color: light-dark(black, white);` for dark-mode color pairs without custom properties.
- **`color-mix()`:** `color-mix(in oklch, var(--accent) 80%, white)` for systematic color derivation.
- **OKLCH color space:** use `oklch(68% 0.19 145)` over HSL/HEX for perceptually uniform palettes. Browsers support `oklab`, `oklch`, `display-p3`.
- **CSS nesting** is native; no Sass required for nesting alone.
- **`@starting-style`** for enter animations on newly-mounted elements (works with the Popover API).

### 7.3 Panda CSS / Vanilla Extract / StyleX (typed styling alternatives)

- **Panda CSS:** atomic CSS-in-JS with build-time extraction, recipes, patterns. Good alternative to Tailwind for teams that want typed tokens and recipes.
- **Vanilla Extract:** zero-runtime, fully typed, sprinkles. Best for design systems.
- **StyleX** (Meta): atomic, typed, compiled. Use only if you are already in Meta's ecosystem or need its specific collision guarantees.
- If the user hasn't chosen, default to Tailwind v4 for apps and Vanilla Extract for design systems.

---

## 8. DESIGN ENGINEERING DIRECTIVES (BIAS CORRECTION)

LLMs lean toward 2022–2023 design clichés. These rules forcibly correct that drift.

### Rule 1 — Deterministic Typography

- **Display / Headlines:** default to `text-4xl md:text-6xl tracking-tighter leading-[0.95]`. Above `lg:`, scale to `text-7xl` only when the page has real editorial weight.
- **Body:** `text-base text-zinc-600 leading-relaxed max-w-[65ch]`. Respect the 65-character measure.
- **Font selection (hard rules):**
  - **BANNED for "premium" aesthetics:** `Inter`. It is the universal AI tell.
  - **Allowed display fonts:** `Geist`, `Satoshi`, `Cabinet Grotesk`, `Outfit`, `Söhne` (if licensed), `GT America` (if licensed), `Basis Grotesque`, `Neue Haas Grotesk`.
  - **Allowed mono fonts:** `Geist Mono`, `JetBrains Mono`, `Berkeley Mono`, `Commit Mono`.
  - **Dashboards / software UI:** sans + mono only. Serif is banned in this context.
  - **Editorial / creative:** pair a display serif (`PP Editorial New`, `Canela`, `Tiempos Headline`) with a clean sans for body.
- **Numeric rendering:** always `font-variant-numeric: tabular-nums` for tables, dashboards, dates.

### Rule 2 — Color Calibration

- **Max 1 accent color.** Saturation capped at 80% in HSL terms (`~0.2` chroma in OKLCH).
- **THE LILA BAN:** the "AI purple/blue" gradient look (violet → indigo, pink → purple, purple glows) is BANNED unless the user explicitly asks for it and is not building a generic SaaS.
- **Neutral base:** pick one of Zinc, Slate, Stone, or Neutral. **Do not mix warm and cool grays** in the same project.
- **Accent discipline:** choose one of Emerald, Electric Blue, Deep Rose, Amber, or a custom OKLCH accent. Stick with it across the entire output.
- **Dark mode:** never pure black (`#000`). Use `zinc-950` (`oklch(14.5% 0.01 256)`) or equivalent.

### Rule 3 — Layout Diversification

- **Centered hero BANNED when `DESIGN_VARIANCE > 4`.** Mandatory alternatives:
  - Split screen 50/50 (text left, visual right, or vice versa).
  - Left-aligned text with asymmetric right-side negative space.
  - Oversized type occupying 80% of the viewport with small supporting copy in a corner.
  - Diagonal or offset typographic layouts.
- **Grid over flex-math.** Never `w-[calc(33.333%-1rem)]`. Always `grid grid-cols-1 md:grid-cols-3 gap-6` or CSS Grid with `minmax`.
- **Mobile override:** any asymmetric layout above `md:` must collapse to a single column (`w-full`, `px-4`) below 768px. No horizontal scroll on phones unless the section is an explicit carousel.
- **Viewport height:** `min-h-[100dvh]` — never `h-screen`, which is buggy on iOS Safari's dynamic toolbar.

### Rule 4 — Materiality, Shadows, Anti-Card-Overuse

- **Dashboard hardening:** when `VISUAL_DENSITY > 7`, card containers are banned. Separate with `border-t`, `divide-y`, or pure negative space.
- **Cards only when elevation is functionally required** (modals, overlays, dropdowns, cards that literally lift on hover).
- **Shadows are tinted to the background hue.** Use `shadow-[0_20px_40px_-15px_oklch(20%_0.02_256/0.15)]` style — never plain black shadows, which look photoshopped.
- **Border discipline:** 1px borders in `oklch(94% 0 0)` or `oklch(18% 0 0 / 0.08)` for light/dark. Never `border-gray-300`.

### Rule 5 — Interactive States (full cycle mandatory)

Every interactive component must ship with all five states:

1. **Default** — rest state.
2. **Hover** — subtle change; no dramatic color swaps.
3. **Active** — tactile feedback: `active:-translate-y-px` or `active:scale-[0.98]`.
4. **Focus-visible** — keyboard focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2`.
5. **Disabled / loading** — not just greyed out; skeleton or spinner with matching layout.

Additionally, **every data surface** ships:
- **Empty state** — beautifully composed, with a primary action to populate.
- **Error state** — inline, specific, recoverable.
- **Loading state** — skeleton matching the final layout's dimensions. Never a circular spinner centered on a blank screen.

### Rule 6 — Forms & Data

- Label above input. Helper text below label. Error below input.
- `gap-2` between elements in a block.
- Use the Popover API and anchor positioning for inline validation, not absolute-positioned tooltips.
- Numeric inputs use `inputmode="numeric"` and `pattern` when applicable.
- Date inputs: prefer native `<input type="date">` with styling, fall back to a library only when you need ranges or timezones.

### Rule 7 — Icons

- **Allowed libraries:** `@phosphor-icons/react`, `@radix-ui/react-icons`, `lucide-react` (with taste — its defaults are overused), SF Symbols (Apple), Material Symbols (Android/Material 3).
- Standardize stroke width globally. Pick `1.5` or `2.0`; do not mix.
- **BANNED:** emoji as icons. Emojis are not icons.

---

## 9. MODERN CSS CAPABILITIES (MANDATORY USE WHERE APPLICABLE)

| Feature | Use for | Do not use |
|---------|---------|------------|
| Container queries (`@container`) | Card/component responsiveness | Page-level breakpoints — use viewport queries there |
| `:has()` | Parent-reactive styling (cards with checked inputs, forms with errors) | Heavy computation inside `:has()` — keep selectors cheap |
| Subgrid | Multi-card alignment | Single-dimension lists |
| View Transitions API | Page/state transitions | Fine-grained element animations (use Motion or CSS keyframes) |
| Scroll-driven animations | Entrance reveals, progress bars tied to scroll | Anything requiring JS state sync |
| Anchor positioning | Tooltips, popovers, dropdowns | Complex floating UIs with collision detection (use Floating UI) |
| Popover API (`popover` attr) | Menus, tooltips, lightweight modals | Dialogs needing focus trapping in legacy browsers |
| `text-wrap: balance` | Headings ≤ 6 lines | Long-form body (use `pretty`) |
| `light-dark()` | Simple color pairs | Complex multi-token theming (use CSS vars + `@media (prefers-color-scheme)`) |
| `color-mix()` | Deriving tints/shades from a base | Color math that needs perceptual uniformity (use `oklch()` directly) |
| OKLCH colors | All new palettes | Legacy projects shipping to browsers < 2023 |
| `@starting-style` | Enter animations for popovers, dialogs | Loop animations |

---

## 10. MOTION & ANIMATION SYSTEMS

### 10.1 Library selection

- **Web (React):** `motion` (formerly `framer-motion`) for component animations; `gsap` for complex scroll-telling; `three` + `@react-three/fiber` for 3D.
- **Web (Svelte):** native `$effect` + `transition:` directives for most; `motion` via the Svelte adapter for spring physics.
- **Web (Vue):** native `<Transition>` + `@vueuse/motion`.
- **React Native:** Reanimated 4 with the CSS-animations API.
- **SwiftUI:** native `.animation(.smooth, value:)`, `withAnimation { }`, `PhaseAnimator`, `KeyframeAnimator`.
- **Jetpack Compose:** `animate*AsState`, `updateTransition`, `rememberInfiniteTransition`, `MotionScheme`.

### 10.2 Motion rules (cross-platform)

- **Spring physics by default.** For Motion: `{ type: "spring", stiffness: 100, damping: 20 }`. For SwiftUI: `.smooth` or `.snappy`. For Compose: `MotionScheme.expressive().defaultSpatialSpec()`.
- **No linear easing for UI.** Linear is for progress bars and video scrubbing only.
- **Durations:** 150–250ms for micro-interactions, 300–500ms for view transitions, 600–900ms for choreographed entrances. Anything longer feels sluggish.
- **Stagger children.** Lists and grids mount with a `staggerChildren: 0.05` cascade — never all at once.
- **Layout animations:** use `layout` / `layoutId` (Motion) or `SharedTransitionLayout` (Compose) for shared-element transitions.
- **Magnetic buttons** only when `MOTION_INTENSITY > 5`. Implement with `useMotionValue` + `useTransform` — **never** with `useState` (React re-renders would kill perf).
- **Infinite loops:** wrap in `React.memo` and isolate in leaf components. Never run a `requestAnimationFrame` loop in a parent that renders children.

### 10.3 Scroll-driven motion

- Prefer native `animation-timeline: scroll()` / `view()` when the effect is purely visual.
- Use GSAP ScrollTrigger only when you need imperative control, pinning, or scrubbing tied to a timeline.
- **Never** use `window.addEventListener('scroll', ...)` in new code. Use `IntersectionObserver`, `ScrollTimeline`, or framework primitives.

---

## 11. ACCESSIBILITY MANDATES (WCAG 2.2 AA MINIMUM)

Accessibility is not a follow-up task — it is part of the first draft.

### 11.1 Hard gates

- **Color contrast:** 4.5:1 for body text, 3:1 for large text and UI components. Verify with `oklch` lightness deltas.
- **Focus-visible:** every interactive element has a visible focus ring that is *not* the browser default (the browser default is ugly; style a better one).
- **Keyboard navigation:** every flow must be completable with keyboard alone. Tab order must follow visual order.
- **`prefers-reduced-motion`:** respect it. Wrap non-essential motion in `@media (prefers-reduced-motion: no-preference) { ... }` or use `useReducedMotion()` in Motion.
- **Semantic HTML:** `<button>` for buttons, `<a>` for navigation, `<nav>`, `<main>`, `<article>`, `<aside>`. Do not make a `<div onClick>` unless it carries an explicit `role` and keyboard handlers.
- **ARIA 1.3:** use ARIA only when semantic HTML is insufficient. Prefer `aria-labelledby` over `aria-label` when a visible label exists.
- **Form inputs** have associated `<label>` elements. Placeholder text is never the only label.
- **Images:** `alt` attribute always. Decorative images get `alt=""`, not omitted.
- **Icons-only buttons:** `aria-label` is mandatory.

### 11.2 WCAG 2.2 specific additions

- **Target size:** interactive targets ≥ 24×24 CSS pixels (AA) — prefer 44×44 for mobile.
- **Focus appearance:** focus indicator must have ≥ 3:1 contrast with adjacent background and be ≥ 2px thick.
- **Dragging movements:** any drag interaction must have a single-pointer alternative (click-to-move, keyboard handles).
- **Accessible authentication:** do not require cognitive tests (memorizing codes, solving puzzles) unless there is an accessible alternative.

### 11.3 Platform-specific a11y

- **SwiftUI:** `.accessibilityLabel`, `.accessibilityHint`, `.accessibilityValue`, `.accessibilityAddTraits`. Use VoiceOver rotor support.
- **Jetpack Compose:** `Modifier.semantics { contentDescription = ... }`, `Modifier.clearAndSetSemantics`. Test with TalkBack.
- **React Native:** `accessibilityLabel`, `accessibilityRole`, `accessibilityState`. Test with VoiceOver + TalkBack.
- **Flutter:** `Semantics` widget, `MergeSemantics`, `ExcludeSemantics`.

---

## 12. PERFORMANCE GUARDRAILS

### 12.1 Web

- **Animate only `transform` and `opacity`.** Animating `width`, `height`, `top`, `left` triggers layout and paint on every frame — banned in new code except for native CSS grid/flex resizes that use `@starting-style`.
- **`will-change`** sparingly. Applied before the animation starts, removed after. Do not set `will-change: transform` on 200 elements "just in case."
- **Grain/noise textures:** apply to a fixed `pointer-events-none` pseudo-element with `position: fixed; inset: 0; z-index: 9999;`. Never on scrolling containers.
- **Image strategy:**
  - `next/image` in Next.js, `<enhanced:img>` in SvelteKit, `<Image>` in Astro — always with explicit `width`/`height`.
  - Prefer AVIF > WebP > JPEG. PNG only for icons/transparency.
  - Lazy-load below-the-fold images; eager-load hero images.
- **Fonts:** `font-display: swap`. Preload the one critical font with `<link rel="preload" as="font" crossorigin>`.
- **Core Web Vitals targets (2026):**
  - LCP ≤ 2.0s (tighter than the 2.5s guideline).
  - INP ≤ 150ms (the new 2024+ metric).
  - CLS ≤ 0.05.
- **Z-index hygiene:** never spam `z-50`. Use a documented stacking system: `z-[1]` content, `z-[10]` sticky, `z-[50]` fixed, `z-[100]` modals, `z-[1000]` toasts.

### 12.2 Mobile

- **60fps minimum, 120fps target** on ProMotion / high-refresh displays.
- **SwiftUI:** avoid `AnyView` in hot paths; it erases types and forces recomputation. Prefer `@ViewBuilder`.
- **Compose:** read state as late as possible. Lambdas and deferred reads (`Modifier.offset { IntOffset(...) }` with a lambda) skip recomposition and go straight to the layout phase.
- **React Native:** run animations on the UI thread via Reanimated worklets. Never animate from the JS thread.

---

## 13. FORBIDDEN PATTERNS (AI TELLS)

These patterns immediately identify output as AI-generated. They are BANNED unless the user explicitly requests them.

### Visual & CSS
- Neon outer glows (`box-shadow: 0 0 40px <color>`).
- Pure black backgrounds.
- Oversaturated accents (`#ff00ff`, `#00ffff`).
- Text-fill gradients on large headers ("text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500").
- Custom mouse cursors.
- Skeumorphic "glow behind card" effects.
- Default Tailwind colors used verbatim (`bg-blue-500`, `text-gray-700`) in premium contexts — customize via the `@theme` block.

### Typography
- `Inter` for "premium" aesthetics.
- Oversized H1s that scream (`text-9xl` with no hierarchy reason).
- Serif fonts on dashboards.
- Mixing three or more type families.

### Layout
- Three equal cards horizontally as the feature section. **Alternatives:** 2-column zig-zag, asymmetric bento, horizontal scroll.
- Every section being 100vh tall.
- Center-aligned everything when `DESIGN_VARIANCE > 4`.

### Content (the "Jane Doe" effect)
- Names: "John Doe", "Jane Doe", "Sarah Chan", "Jack Su", "Alex Kim". Use realistic, specific names from diverse origins ("Renata Oyelaran", "Matthieu Vasquez-Ito", "Aisling Devereux").
- Generic avatars: the Lucide `User` icon, egg SVGs, solid-color circles with an initial.
- Fake numbers: `99.99%`, `50%`, `1234567`, `$999`. Use messy, organic data: `47.2%`, `$3,847`, `+1 (312) 847-1928`.
- Startup slop names: "Acme", "Nexus", "SmartFlow", "Lumina", "Aurora", "Zenith", "Quantum". Invent specific brand names tied to the domain.
- Filler verbs: "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary", "Cutting-edge", "Empower". Use concrete, specific verbs tied to the user's actual task.

### External resources
- Unsplash URLs (they break). Use `https://picsum.photos/seed/{slug}/800/600` or locally-referenced assets.
- Unstyled `shadcn/ui` defaults. Always customize radii, colors, and shadows to match the project aesthetic.
- Hardcoded API keys or secrets in committed code. Ever.

---

## 14. CREATIVE ARSENAL (HIGH-END INSPIRATION)

When the user wants distinctive work, pull from this library. Match the dial settings — don't ship a kinetic marquee in a `MOTION_INTENSITY: 2` brief.

### Layouts & Grids
- **Bento Grid 2.0** — asymmetric tile grouping (Apple Control Center DNA).
- **Masonry native** — CSS `grid-template-rows: masonry` (Baseline 2026 on Chromium + WebKit; fall back to Firefox's existing implementation or JS masonry for older builds).
- **Split-screen scroll** — two halves sliding in opposite directions.
- **Curtain reveal** — hero parts in the middle on scroll.
- **Infinite editorial grid** — newspaper-style with intentional rag.

### Cards & Containers
- **Parallax tilt card** — 3D rotation tracking pointer (use `transform: rotateX/Y` with `perspective`).
- **Spotlight border card** — CSS `:has()` + radial gradient tracking pointer via CSS custom properties.
- **True liquid glass** — `backdrop-filter: blur(20px) saturate(180%)` + inner `1px` highlight border (`box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.1)`) + subtle noise overlay.
- **Holographic foil card** — iridescent CSS conic gradients that shift on pointer movement.
- **Morphing modal** — button expands into its own dialog via View Transitions API.
- **Swipe stack** — Tinder-style; `motion/react` + drag gestures.

### Scroll choreography
- **Sticky stack** — cards that pin and physically stack via `position: sticky`.
- **Horizontal scroll hijack** — vertical scroll translates to horizontal via GSAP ScrollTrigger or `scroll-driven animations`.
- **Scroll-bound sequence** — video or 3D frame sequence scrubbed by scroll position.
- **Zoom parallax** — background image scales with scroll.
- **SVG line draw** — `stroke-dasharray` + scroll-driven animation.

### Galleries & Media
- **Dome gallery** — 3D panoramic arrangement via `@react-three/fiber` or WebGPU.
- **Coverflow carousel** — 3D carousel with angled edges.
- **Drag-to-pan infinite grid** — boundless canvas you can drag.
- **Hover image trail** — pointer leaves a cascading trail of images.

### Typography kinetics
- **Kinetic marquee** — endless bands that react to scroll velocity.
- **Text mask reveal** — massive type as a window into a video or gradient.
- **Scramble effect** — Matrix-style decoding on mount/hover.
- **Gradient stroke** — outlined text with a gradient running along the stroke.

### Micro-interactions
- **Particle explosion CTA** — success state shatters into particles.
- **Liquid pull-to-refresh** — mobile; droplet detaches on release.
- **Directional hover-aware button** — fill enters from the side the pointer entered.
- **Ripple click** — waves from the click coordinate.
- **Mesh gradient background** — organic lava-lamp blobs via CSS conic + radial gradients or WebGL shader.

### Navigation & menus
- **macOS dock magnification** — icons scale fluidly toward pointer.
- **Magnetic buttons** — physical pull to cursor.
- **Dynamic Island** — pill that morphs to show status.
- **Gooey menu** — sub-items detach with SVG filter goo effect.
- **Radial context menu** — expands at click coordinates.

---

## 15. THE MOTION-ENGINE BENTO PARADIGM

For modern SaaS dashboards and feature sections, use this reference architecture. This is "Vercel-core meets Dribbble-clean" with perpetual-motion physics.

### 15.1 Core design philosophy

- **Background:** `oklch(98.5% 0.003 256)` (whisper-warm off-white). Dark mode: `oklch(16% 0.01 256)`.
- **Cards:** pure white (`oklch(100% 0 0)`) with a `1px` border of `oklch(92% 0 0)`. Dark mode cards: `oklch(20% 0.01 256)` with `oklch(26% 0.01 256)` borders.
- **Radii:** `border-radius: 2.5rem` for major containers, `1.25rem` for nested panels, `0.5rem` for inputs.
- **Diffusion shadow:** `box-shadow: 0 20px 40px -15px oklch(20% 0.02 256 / 0.08);` — soft, spread, low-opacity, tinted to background hue.
- **Typography:** `Geist`, `Satoshi`, or `Cabinet Grotesk`. `tracking-tight` on headings.
- **Labels outside the card.** Title and description sit *below* the card, gallery-style.
- **Padding:** `p-8` or `p-10` inside cards. Cockpit mode (density > 7) drops to `p-4`.

### 15.2 Animation engine

- Spring physics only — `{ stiffness: 100, damping: 20 }`.
- `layout` / `layoutId` for shared-element reorderings.
- Every card has a perpetual "alive" animation: pulse, typewriter, drift, carousel, breathing.
- Wrap dynamic lists in `<AnimatePresence>`.
- **PERF CRITICAL:** every infinite loop is memoized (`React.memo` / `useMemo`) and isolated in its own leaf component. Parents never re-render from child animation ticks.

### 15.3 The 6 card archetypes

1. **Intelligent list** — vertical stack; items reorder via `layoutId`, simulating AI prioritization.
2. **Command input** — AI bar with multi-step typewriter cycling through prompts; shimmering loading gradient on submit.
3. **Live status** — scheduling UI with breathing status dots; pop-up notification with overshoot spring (`stiffness: 400, damping: 25`), holds 3s, dismisses.
4. **Infinite carousel** — horizontal data strip; `x: ["0%", "-100%"]` with seamless wrap; `duration: 30s` linear loop (one of the only places linear easing is acceptable).
5. **Contextual focus mode** — document view with staggered text highlight; floating toolbar enters with spring.
6. **Metric card with sparkline** — single headline number in mono tabular-nums; sparkline drawn via SVG `path` with `pathLength` animation; subtle hover reveals axis labels.

### 15.4 Grid composition

Default Bento layout:
```
Row 1: grid-cols-3  →  card-wide (col-span-2) | card-square
Row 2: grid-cols-3  →  card-square | card-wide (col-span-2)
Row 3: grid-cols-2  →  card-tall | card-tall
```
On `md:` and below, collapse to `grid-cols-1` with `gap-4`.

---

## 16. DEPENDENCY VERIFICATION PROTOCOL

Before writing `import X from 'y'`, you must verify `y` is installed.

### 16.1 The protocol

1. **Check the manifest.** Open `package.json` / `Cargo.toml` / `Package.swift` / `build.gradle.kts` / `pubspec.yaml`. If the manifest is not in context, ask the user for it or read it from the workspace before continuing.
2. **If the dependency is present,** proceed and pin to the major version the project is on.
3. **If the dependency is missing,** emit the install command at the top of your code block:
   - npm/pnpm/yarn: `pnpm add motion @phosphor-icons/react`
   - Cargo: `cargo add leptos --features="csr,ssr"`
   - Swift: add to `Package.swift` `dependencies` array (show the diff).
   - Gradle: add to `libs.versions.toml` and `build.gradle.kts` (show the diff).
   - Flutter: `flutter pub add <package>`
4. **Never invent imports.** If you are uncertain a package exists, say so and propose an alternative.
5. **Tailwind version lock:** read the `tailwindcss` version. If `^3.x`, write v3 syntax. If `^4.x`, write v4 syntax. Do not mix.
6. **PostCSS config for Tailwind v4:** use `@tailwindcss/postcss`, never the bare `tailwindcss` plugin (which was the v3 name). For Vite, prefer `@tailwindcss/vite`.

### 16.2 Environment sanity

- **Node.js:** target Node 22 LTS in 2026. Do not emit code that depends on Node 18 polyfills (it goes EOL April 2025).
- **TypeScript:** target `^5.7` or newer. Use `satisfies`, `const` type parameters, and `using`/`await using` resource management where helpful.
- **ESM only** for new packages. No `require()` in new TypeScript code.
- **Bun / Deno:** if the user's manifest shows `bun.lockb` or `deno.json`, adapt. Bun is compatible with Node; Deno uses `jsr:` and `npm:` specifiers.

---

## 17. PRE-FLIGHT CHECK MATRIX

Run this checklist silently against the generated code before presenting it. Treat it as the last filter. Any failed box means rewrite before shipping.

### 17.1 Architecture
- [ ] Stack explicitly named at the top of the response.
- [ ] Server vs Client component boundaries correct (React/Next).
- [ ] Runes used correctly (Svelte 5); no legacy `export let`.
- [ ] `<script setup>` used (Vue 3.5+); no Options API.
- [ ] State hoisting applied (Compose); no hidden `remember` in stateless composables.
- [ ] `@Observable` used (SwiftUI); no legacy `ObservableObject` in new code.

### 17.2 Styling
- [ ] Tailwind version matches `package.json`.
- [ ] No banned fonts (Inter for premium, Serif on dashboards).
- [ ] One accent color, consistent neutrals (single gray family).
- [ ] No pure black, no default Tailwind `gray-*` in premium contexts.
- [ ] No emojis; icons come from approved libraries.

### 17.3 Layout
- [ ] `min-h-[100dvh]` for full-height sections, never `h-screen`.
- [ ] Grid (not flex-math) for multi-column structures.
- [ ] Mobile collapse to single column below `md:` for asymmetric layouts.
- [ ] `max-w-[1400px]` or similar container, not unconstrained width.

### 17.4 Interactivity
- [ ] All five states present (default, hover, active, focus-visible, disabled).
- [ ] Empty, loading, and error states shipped alongside the success state.
- [ ] Skeleton loaders match final layout dimensions.
- [ ] Tactile feedback on press (`active:scale-[0.98]` or equivalent platform idiom).

### 17.5 Motion
- [ ] Only `transform` and `opacity` animated on the web.
- [ ] Spring physics, not linear easing (except infinite carousels).
- [ ] Magnetic/continuous animations isolated in memoized leaf components.
- [ ] `prefers-reduced-motion` respected.
- [ ] `useEffect` animations have cleanup functions.

### 17.6 Accessibility
- [ ] Contrast ratios ≥ 4.5:1 (body), ≥ 3:1 (large text and UI).
- [ ] Focus-visible rings on all interactive elements.
- [ ] Semantic HTML; ARIA only where semantics are insufficient.
- [ ] Touch targets ≥ 24×24 CSS px (AA); prefer 44×44 on mobile.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Form inputs associated with labels.

### 17.7 Performance
- [ ] No `window.addEventListener('scroll')` in new code.
- [ ] Grain/noise on fixed `pointer-events-none` layer, not scrolling containers.
- [ ] `will-change` scoped to active animations only.
- [ ] Image sizes specified (no CLS).
- [ ] Core Web Vitals targets respected (LCP ≤ 2.0s, INP ≤ 150ms, CLS ≤ 0.05).

### 17.8 Content
- [ ] No generic names, no "Acme"/"Nexus"/"Lumina" brands.
- [ ] No `99.99%` fake stats; use organic, specific numbers.
- [ ] No filler verbs ("elevate", "seamless", "unleash").
- [ ] No Unsplash URLs; use `picsum.photos` seeds or local assets.

### 17.9 Dependencies
- [ ] Every imported package verified in the manifest; install commands emitted for missing ones.
- [ ] No invented APIs or hallucinated packages.
- [ ] Tailwind v3 vs v4 syntax matches installed version.
- [ ] PostCSS/Vite config correct for Tailwind v4 (`@tailwindcss/postcss`, `@tailwindcss/vite`).

### 17.10 Platform-specific
- [ ] **iOS:** Dynamic Type supported; no fixed pixel sizes for body text.
- [ ] **Android:** Material 3 Expressive tokens; respects dynamic color on Android 12+.
- [ ] **RN:** Reanimated worklets on UI thread; New Architecture enabled.
- [ ] **Flutter:** Impeller engine; Material 3 Expressive theme.
- [ ] **Tauri:** IPC v2 typed commands; bundle ≤ 10 MB target.

---

## 18. OUTPUT CONTRACT

When shipping code generated under this skill:

1. **Name the stack** in one line at the top: `// Stack: Next.js 15 App Router · React 19 · Tailwind v4 · motion@latest`.
2. **List any install commands** needed, as a fenced block, before the code.
3. **Emit the code** in the correct file structure (one file per artifact unless the feature genuinely spans files).
4. **End with a one-line dial summary** so the user can tell what settings produced this output: `// Dials: variance 8 · motion 6 · density 4`.

The assistant does not narrate the pre-flight check or this skill's existence to the user — it simply produces output that silently passes all of it.
