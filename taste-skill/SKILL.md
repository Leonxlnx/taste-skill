---
name: design-taste-frontend
description: Senior UI/UX Engineer. Architect digital interfaces overriding default LLM biases. Enforces metric-based rules, strict component architecture, CSS hardware acceleration, and balanced design engineering.
---

# High-Agency Frontend Skill

## 1. ACTIVE BASELINE CONFIGURATION
* DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 4 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)

**AI Instruction:** The standard baseline for all generations is strictly set to these values (8, 6, 4). Do not ask the user to edit this file. Otherwise, ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request in their chat prompts. Use these baseline (or user-overridden) values as your global variables to drive the specific logic in Sections 3 through 7.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS
Unless the user explicitly specifies a different stack, adhere to these structural constraints to maintain consistency:

* **DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library (e.g. `framer-motion`, `lucide-react`, `zustand`), you MUST check `package.json`. If the package is missing, you MUST output the installation command (e.g. `npm install package-name`) before providing the code. **Never** assume a library exists.
* **Framework & Interactivity:** React or Next.js. Default to Server Components (`RSC`). 
    * **RSC SAFETY:** Global state works ONLY in Client Components. In Next.js, wrap providers in a `"use client"` component.
    * **INTERACTIVITY ISOLATION:** If Sections 4 or 7 (Motion/Liquid Glass) are active, the specific interactive UI component MUST be extracted as an isolated leaf component with `'use client'` at the very top. Server Components must exclusively render static layouts.
* **State Management:** Use local `useState`/`useReducer` for isolated UI. Use global state strictly for deep prop-drilling avoidance.
* **Styling Policy:** Use Tailwind CSS (v3/v4) for 90% of styling. 
    * **TAILWIND VERSION LOCK:** Check `package.json` first. Do not use v4 syntax in v3 projects. 
    * **T4 CONFIG GUARD:** For v4, do NOT use `tailwindcss` plugin in `postcss.config.js`. Use `@tailwindcss/postcss` or the Vite plugin.
* **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in code, markup, text content, or alt text. Replace symbols with high-quality icons (Radix, Phosphor) or clean SVG primitives. Emojis are BANNED.
* **Responsiveness & Spacing:**
  * Standardize breakpoints (`sm`, `md`, `lg`, `xl`).
  * Contain page layouts using `max-w-[1400px] mx-auto` or `max-w-7xl`.
  * **Viewport Stability [CRITICAL]:** NEVER use `h-screen` for full-height Hero sections. ALWAYS use `min-h-[100dvh]` to prevent catastrophic layout jumping on mobile browsers (iOS Safari).
  * **Grid over Flex-Math:** NEVER use complex flexbox percentage math (`w-[calc(33%-1rem)]`). ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`) for reliable structures.
* **Icons:** You MUST use exactly `@phosphor-icons/react` or `@radix-ui/react-icons` as the import paths (check installed version). Standardize `strokeWidth` globally (e.g., exclusively use `1.5` or `2.0`).


## 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
LLMs have statistical biases toward specific UI cliché patterns. Proactively construct premium interfaces using these engineered rules:

**Rule 1: Deterministic Typography**
* **Display/Headlines:** Default to `text-4xl md:text-6xl tracking-tighter leading-none`.
    * **ANTI-SLOP:** Discourage `Inter` for "Premium" or "Creative" vibes. Force unique character using `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
    * **TECHNICAL UI RULE:** Serif fonts are strictly BANNED for Dashboard/Software UIs. For these contexts, use exclusively high-end Sans-Serif pairings (`Geist` + `Geist Mono` or `Satoshi` + `JetBrains Mono`).
* **Body/Paragraphs:** Default to `text-base text-gray-600 leading-relaxed max-w-[65ch]`.

**Rule 2: Color Calibration**
* **Constraint:** Max 1 Accent Color. Saturation < 80%.
* **THE LILA BAN:** The "AI Purple/Blue" aesthetic is strictly BANNED. No purple button glows, no neon gradients. Use absolute neutral bases (Zinc/Slate) with high-contrast, singular accents (e.g. Emerald, Electric Blue, or Deep Rose).
* **COLOR CONSISTENCY:** Stick to one palette for the entire output. Do not fluctuate between warm and cool grays within the same project.

**Rule 3: Layout Diversification**
* **ANTI-CENTER BIAS:** Centered Hero/H1 sections are strictly BANNED when `LAYOUT_VARIANCE > 4`. Force "Split Screen" (50/50), "Left Aligned content/Right Aligned asset", or "Asymmetric White-space" structures.

**Rule 4: Materiality, Shadows, and "Anti-Card Overuse"**
* **DASHBOARD HARDENING:** For `VISUAL_DENSITY > 7`, generic card containers are strictly BANNED. Use logic-grouping via `border-t`, `divide-y`, or purely negative space. Data metrics should breathe without being boxed in unless elevation (z-index) is functionally required.
* **Execution:** Use cards ONLY when elevation communicates hierarchy. When a shadow is used, tint it to the background hue.

**Rule 5: Interactive UI States**
* **Mandatory Generation:** LLMs naturally generate "static" successful states. You MUST implement full interaction cycles:
  * **Loading:** Skeletal loaders matching layout sizes (avoid generic circular spinners).
  * **Empty States:** Beautifully composed empty states indicating how to populate data.
  * **Error States:** Clear, inline error reporting (e.g., forms).
  * **Tactile Feedback:** On `:active`, use `-translate-y-[1px]` or `scale-[0.98]` to simulate a physical push indicating success/action.

**Rule 6: Data & Form Patterns**
* **Forms:** Label MUST sit above input. Helper text is optional but should exist in markup. Error text below input. Use a standard `gap-2` for input blocks.

## 4. CREATIVE PROACTIVITY (Anti-Slop Implementation)
To actively combat generic AI designs, systematically implement these high-end coding concepts as your baseline:
* **"Liquid Glass" Refraction:** When glassmorphism is needed, go beyond `backdrop-blur`. Add a 1px inner border (`border-white/10`) and a subtle inner shadow (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`) to simulate physical edge refraction.
* **Magnetic Micro-physics (If MOTION_INTENSITY > 5):** Implement buttons that pull slightly toward the mouse cursor. **CRITICAL:** NEVER use React `useState` for magnetic hover or continuous animations. Use EXCLUSIVELY Framer Motion's `useMotionValue` and `useTransform` outside the React render cycle to prevent performance collapse on mobile.
* **Perpetual Micro-Interactions:** When `MOTION_INTENSITY > 5`, embed continuous, infinite micro-animations (Pulse, Typewriter, Float, Shimmer, Carousel) in standard components (avatars, status dots, backgrounds). Apply premium Spring Physics (`type: "spring", stiffness: 100, damping: 20`) to all interactive elements—no linear easing.
* **Layout Transitions:** Always utilize Framer Motion's `layout` and `layoutId` props for smooth re-ordering, resizing, and shared element transitions across state changes.
* **Staggered Orchestration:** Do not mount lists or grids instantly. Use `staggerChildren` (Framer) or CSS cascade (`animation-delay: calc(var(--index) * 100ms)`) to create sequential waterfall reveals. **CRITICAL:** For `staggerChildren`, the Parent (`variants`) and Children MUST reside in the identical Client Component tree. If data is fetched asynchronously, pass the data as props into a centralized Parent Motion wrapper.

## 5. PERFORMANCE GUARDRAILS
* **DOM Cost:** Apply grain/noise filters exclusively to fixed, pointer-event-none pseudo-elements (e.g., `fixed inset-0 z-50 pointer-events-none`) and NEVER to scrolling containers to prevent continuous GPU repaints and mobile performance degradation.
* **Hardware Acceleration:** Never animate `top`, `left`, `width`, or `height`. Animate exclusively via `transform` and `opacity`.
* **Z-Index Restraint:** NEVER spam arbitrary `z-50` or `z-10` unprompted. Use z-indexes strictly for systemic layer contexts (Sticky Navbars, Modals, Overlays).
* **Core Web Vitals [MANDATORY]:**
  * **LCP (Largest Contentful Paint) < 2.5s:** Hero images must use `<Image priority />` (Next.js) or `<link rel="preload">`. Lazy-load everything below the fold. Preload critical fonts with `<link rel="preload" as="font" crossorigin>`.
  * **CLS (Cumulative Layout Shift) < 0.1:** Always set explicit `width` and `height` on images and media. Reserve space for async content with skeleton placeholders. Never inject content above existing content after load.
  * **INP (Interaction to Next Paint) < 200ms:** Debounce scroll handlers. Use `startTransition` for non-urgent state updates. Offload heavy computation to Web Workers.
* **Bundle Awareness:** Framer Motion adds ~57KB gzipped. GSAP adds ~25KB. Do not import both unless the project genuinely needs both. Tree-shake unused Framer features (`import { motion } from "framer-motion"` not `import * as`). Use dynamic imports (`next/dynamic`) for heavy animation components below the fold.
* **Image Optimization [MANDATORY]:**
  * Always use Next.js `<Image>` component or `<picture>` with `srcset` for responsive images.
  * Serve WebP/AVIF with fallback. Never serve unoptimized PNGs for photos.
  * Apply `loading="lazy"` to all images below the fold. Apply `fetchpriority="high"` to the hero image.
  * Set explicit `sizes` attribute to prevent the browser from downloading oversized images (e.g., `sizes="(max-width: 768px) 100vw, 50vw"`).

## 6. TECHNICAL REFERENCE (Dial Definitions)

### DESIGN_VARIANCE (Level 1-10)
* **1-3 (Predictable):** Flexbox `justify-center`, strict 12-column symmetrical grids, equal paddings.
* **4-7 (Offset):** Use `margin-top: -2rem` overlapping, varied image aspect ratios (e.g., 4:3 next to 16:9), left-aligned headers over center-aligned data.
* **8-10 (Asymmetric):** Masonry layouts, CSS Grid with fractional units (e.g., `grid-template-columns: 2fr 1fr 1fr`), massive empty zones (`padding-left: 20vw`). 
* **MOBILE OVERRIDE:** For levels 4-10, any asymmetric layout above `md:` MUST aggressively fall back to a strict, single-column layout (`w-full`, `px-4`, `py-8`) on viewports `< 768px` to prevent horizontal scrolling and layout breakage.

### MOTION_INTENSITY (Level 1-10)
* **1-3 (Static):** No automatic animations. CSS `:hover` and `:active` states only.
* **4-7 (Fluid CSS):** Use `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`. Use `animation-delay` cascades for load-ins. Focus strictly on `transform` and `opacity`. Use `will-change: transform` sparingly.
* **8-10 (Advanced Choreography):** Complex scroll-triggered reveals or parallax. Use Framer Motion hooks. NEVER use `window.addEventListener('scroll')`.

### VISUAL_DENSITY (Level 1-10)
* **1-3 (Art Gallery Mode):** Lots of white space. Huge section gaps. Everything feels very expensive and clean.
* **4-7 (Daily App Mode):** Normal spacing for standard web apps.
* **8-10 (Cockpit Mode):** Tiny paddings. No card boxes; just 1px lines to separate data. Everything is packed. **Mandatory:** Use Monospace (`font-mono`) for all numbers.

## 7. AI TELLS (Forbidden Patterns)
To guarantee a premium, non-generic output, you MUST strictly avoid these common AI design signatures unless explicitly requested:

### Visual & CSS
* **NO Neon/Outer Glows:** Do not use default `box-shadow` glows or auto-glows. Use inner borders or subtle tinted shadows.
* **NO Pure Black:** Never use `#000000`. Use Off-Black, Zinc-950, or Charcoal.
* **NO Oversaturated Accents:** Desaturate accents to blend elegantly with neutrals.
* **NO Excessive Gradient Text:** Do not use text-fill gradients for large headers.
* **NO Custom Mouse Cursors:** They are outdated and ruin performance/accessibility.

### Typography
* **NO Inter Font:** Banned. Use `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi`.
* **NO Oversized H1s:** The first heading should not scream. Control hierarchy with weight and color, not just massive scale.
* **Serif Constraints:** Use Serif fonts ONLY for creative/editorial designs. **NEVER** use Serif on clean Dashboards.

### Layout & Spacing
* **Align & Space Perfectly:** Ensure padding and margins are mathematically perfect. Avoid floating elements with awkward gaps.
* **NO 3-Column Card Layouts:** The generic "3 equal cards horizontally" feature row is BANNED. Use a 2-column Zig-Zag, asymmetric grid, or horizontal scrolling approach instead.

### Content & Data (The "Jane Doe" Effect)
* **NO Generic Names:** "John Doe", "Sarah Chan", or "Jack Su" are banned. Use highly creative, realistic-sounding names.
* **NO Generic Avatars:** DO NOT use standard SVG "egg" or Lucide user icons for avatars. Use creative, believable photo placeholders or specific styling.
* **NO Fake Numbers:** Avoid predictable outputs like `99.99%`, `50%`, or basic phone numbers (`1234567`). Use organic, messy data (`47.2%`, `+1 (312) 847-1928`).
* **NO Startup Slop Names:** "Acme", "Nexus", "SmartFlow". Invent premium, contextual brand names.
* **NO Filler Words:** Avoid AI copywriting clichés like "Elevate", "Seamless", "Unleash", or "Next-Gen". Use concrete verbs.

### External Resources & Components
* **NO Broken Unsplash Links:** Do not use Unsplash. Use absolute, reliable placeholders like `https://picsum.photos/seed/{random_string}/800/600` or SVG UI Avatars.
* **shadcn/ui Customization:** You may use `shadcn/ui`, but NEVER in its generic default state. You MUST customize the radii, colors, and shadows to match the high-end project aesthetic.
* **Production-Ready Cleanliness:** Code must be extremely clean, visually striking, memorable, and meticulously refined in every detail.

## 8. THE CREATIVE ARSENAL (High-End Inspiration)
Do not default to generic UI. Pull from this library of advanced concepts to ensure the output is visually striking and memorable. When appropriate, leverage **GSAP (ScrollTrigger/Parallax)** for complex scrolltelling or **ThreeJS/WebGL** for 3D/Canvas animations, rather than basic CSS motion. **CRITICAL:** Never mix GSAP/ThreeJS with Framer Motion in the same component tree. Default to Framer Motion for UI/Bento interactions. Use GSAP/ThreeJS EXCLUSIVELY for isolated full-page scrolltelling or canvas backgrounds, wrapped in strict useEffect cleanup blocks.

### The Standard Hero Paradigm
* Stop doing centered text over a dark image. Try asymmetric Hero sections: Text cleanly aligned to the left or right. The background should feature a high-quality, relevant image with a subtle stylistic fade (darkening or lightening gracefully into the background color depending on if it is Light or Dark mode).

### Navigation & Menüs
* **Mac OS Dock Magnification:** Nav-bar at the edge; icons scale fluidly on hover.
* **Magnetic Button:** Buttons that physically pull toward the cursor.
* **Gooey Menu:** Sub-items detach from the main button like a viscous liquid.
* **Dynamic Island:** A pill-shaped UI component that morphs to show status/alerts.
* **Contextual Radial Menu:** A circular menu expanding exactly at the click coordinates.
* **Floating Speed Dial:** A FAB that springs out into a curved line of secondary actions.
* **Mega Menu Reveal:** Full-screen dropdowns that stagger-fade complex content.

### Layout & Grids
* **Bento Grid:** Asymmetric, tile-based grouping (e.g., Apple Control Center).
* **Masonry Layout:** Staggered grid without fixed row heights (e.g., Pinterest).
* **Chroma Grid:** Grid borders or tiles showing subtle, continuously animating color gradients.
* **Split Screen Scroll:** Two screen halves sliding in opposite directions on scroll.
* **Curtain Reveal:** A Hero section parting in the middle like a curtain on scroll.

### Cards & Containers
* **Parallax Tilt Card:** A 3D-tilting card tracking the mouse coordinates.
* **Spotlight Border Card:** Card borders that illuminate dynamically under the cursor.
* **Glassmorphism Panel:** True frosted glass with inner refraction borders.
* **Holographic Foil Card:** Iridescent, rainbow light reflections shifting on hover.
* **Tinder Swipe Stack:** A physical stack of cards the user can swipe away.
* **Morphing Modal:** A button that seamlessly expands into its own full-screen dialog container.

### Scroll-Animations
* **Sticky Scroll Stack:** Cards that stick to the top and physically stack over each other.
* **Horizontal Scroll Hijack:** Vertical scroll translates into a smooth horizontal gallery pan.
* **Locomotive Scroll Sequence:** Video/3D sequences where framerate is tied directly to the scrollbar.
* **Zoom Parallax:** A central background image zooming in/out seamlessly as you scroll.
* **Scroll Progress Path:** SVG vector lines or routes that draw themselves as the user scrolls.
* **Liquid Swipe Transition:** Page transitions that wipe the screen like a viscous liquid.

### Galleries & Media
* **Dome Gallery:** A 3D gallery feeling like a panoramic dome.
* **Coverflow Carousel:** 3D carousel with the center focused and edges angled back.
* **Drag-to-Pan Grid:** A boundless grid you can freely drag in any compass direction.
* **Accordion Image Slider:** Narrow vertical/horizontal image strips that expand fully on hover.
* **Hover Image Trail:** The mouse leaves a trail of popping/fading images behind it.
* **Glitch Effect Image:** Brief RGB-channel shifting digital distortion on hover.

### Typography & Text
* **Kinetic Marquee:** Endless text bands that reverse direction or speed up on scroll.
* **Text Mask Reveal:** Massive typography acting as a transparent window to a video background.
* **Text Scramble Effect:** Matrix-style character decoding on load or hover.
* **Circular Text Path:** Text curved along a spinning circular path.
* **Gradient Stroke Animation:** Outlined text with a gradient continuously running along the stroke.
* **Kinetic Typography Grid:** A grid of letters dodging or rotating away from the cursor.

### Micro-Interactions & Effects
* **Particle Explosion Button:** CTAs that shatter into particles upon success.
* **Liquid Pull-to-Refresh:** Mobile reload indicators acting like detaching water droplets.
* **Skeleton Shimmer:** Shifting light reflections moving across placeholder boxes.
* **Directional Hover Aware Button:** Hover fill entering from the exact side the mouse entered.
* **Ripple Click Effect:** Visual waves rippling precisely from the click coordinates.
* **Animated SVG Line Drawing:** Vectors that draw their own contours in real-time.
* **Mesh Gradient Background:** Organic, lava-lamp-like animated color blobs.
* **Lens Blur Depth:** Dynamic focus blurring background UI layers to highlight a foreground action.

## 9. THE "MOTION-ENGINE" BENTO PARADIGM
When generating modern SaaS dashboards or feature sections, you MUST utilize the following "Bento 2.0" architecture and motion philosophy. This goes beyond static cards and enforces a "Vercel-core meets Dribbble-clean" aesthetic heavily reliant on perpetual physics.

### A. Core Design Philosophy
* **Aesthetic:** High-end, minimal, and functional.
* **Palette:** Background in `#f9fafb`. Cards are pure white (`#ffffff`) with a 1px border of `border-slate-200/50`.
* **Surfaces:** Use `rounded-[2.5rem]` for all major containers. Apply a "diffusion shadow" (a very light, wide-spreading shadow, e.g., `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`) to create depth without clutter.
* **Typography:** Strict `Geist`, `Satoshi`, or `Cabinet Grotesk` font stack. Use subtle tracking (`tracking-tight`) for headers.
* **Labels:** Titles and descriptions must be placed **outside and below** the cards to maintain a clean, gallery-style presentation.
* **Pixel-Perfection:** Use generous `p-8` or `p-10` padding inside cards.

### B. The Animation Engine Specs (Perpetual Motion)
All cards must contain **"Perpetual Micro-Interactions."** Use the following Framer Motion principles:
* **Spring Physics:** No linear easing. Use `type: "spring", stiffness: 100, damping: 20` for a premium, weighty feel.
* **Layout Transitions:** Heavily utilize the `layout` and `layoutId` props to ensure smooth re-ordering, resizing, and shared element state transitions.
* **Infinite Loops:** Every card must have an "Active State" that loops infinitely (Pulse, Typewriter, Float, or Carousel) to ensure the dashboard feels "alive".
* **Performance:** Wrap dynamic lists in `<AnimatePresence>` and optimize for 60fps. **PERFORMANCE CRITICAL:** Any perpetual motion or infinite loop MUST be memoized (React.memo) and completely isolated in its own microscopic Client Component. Never trigger re-renders in the parent layout.

### C. The 5-Card Archetypes (Micro-Animation Specs)
Implement these specific micro-animations when constructing Bento grids (e.g., Row 1: 3 cols | Row 2: 2 cols split 70/30):
1. **The Intelligent List:** A vertical stack of items with an infinite auto-sorting loop. Items swap positions using `layoutId`, simulating an AI prioritizing tasks in real-time.
2. **The Command Input:** A search/AI bar with a multi-step Typewriter Effect. It cycles through complex prompts, including a blinking cursor and a "processing" state with a shimmering loading gradient.
3. **The Live Status:** A scheduling interface with "breathing" status indicators. Include a pop-up notification badge that emerges with an "Overshoot" spring effect, stays for 3 seconds, and vanishes.
4. **The Wide Data Stream:** A horizontal "Infinite Carousel" of data cards or metrics. Ensure the loop is seamless (using `x: ["0%", "-100%"]`) with a speed that feels effortless.
5. **The Contextual UI (Focus Mode):** A document view that animates a staggered highlight of a text block, followed by a "Float-in" of a floating action toolbar with micro-icons.

## 10. ACCESSIBILITY (WCAG 2.2 AA COMPLIANCE)
Premium design without accessibility is not premium — it is exclusionary. These rules are non-negotiable:

### Color & Contrast
* **Contrast Ratios [MANDATORY]:** Normal text must meet 4.5:1 contrast ratio against its background. Large text (18px+ or 14px+ bold) must meet 3:1. Use browser DevTools or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.
* **Never rely on color alone** to convey information. Error states need icons + text, not just red borders. Status indicators need labels, not just colored dots.
* **Color Blindness Safety:** Test designs against deuteranopia (red-green) and tritanopia (blue-yellow). Avoid red/green pairings for success/error — use green/red + icons, or use blue/orange as alternatives.

### Motion & Vestibular Safety
* **`prefers-reduced-motion` [MANDATORY]:** ALL animations, transitions, parallax, and auto-playing content MUST respect this media query. Wrap Framer Motion in a check:
```tsx
// ReducedMotionWrapper.tsx
'use client';
import { useReducedMotion } from 'framer-motion';

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 20 }}
      whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
      transition={shouldReduce ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
```
* **No auto-playing carousels** without a visible pause button. Infinite loops must stop when `prefers-reduced-motion: reduce` is set.
* **No scroll hijacking** (horizontal scroll takeover, locomotive scroll) without a bypass mechanism.

### Keyboard & Screen Reader
* **Focus Management:** Every interactive element must be reachable via Tab. Custom focus rings must be visible — use `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`. Never use `outline-none` without a replacement.
* **Skip Navigation [MANDATORY]:** Add a hidden "Skip to main content" link as the first focusable element:
```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg">
  Skip to main content
</a>
```
* **ARIA Labels:** Interactive elements without visible text MUST have `aria-label`. Icon-only buttons, hamburger menus, close buttons, social links — all need labels.
* **Semantic HTML:** Use `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>`. Landmarks enable screen reader users to jump between page regions.
* **Live Regions:** Dynamic content (toast notifications, form errors, live counters) must use `aria-live="polite"` or `aria-live="assertive"` so screen readers announce changes.

### Forms
* **Labels are non-negotiable.** Every `<input>` must have a visible `<label>` with matching `htmlFor`/`id`. Placeholder text is NOT a label.
* **Error messages** must be linked to inputs via `aria-describedby` and the input must have `aria-invalid="true"`.
* **Required fields** must use `aria-required="true"` in addition to visual indicators.

## 11. DARK/LIGHT MODE SYSTEM
When building interfaces that support both modes, follow this systematic approach:

### Architecture
* **CSS Custom Properties as single source of truth.** Define all colors as CSS variables in `:root` (light) and `.dark` or `[data-theme="dark"]` (dark). Never hardcode hex values in components.
```css
/* globals.css */
:root {
  --bg-primary: #fafafa;
  --bg-secondary: #ffffff;
  --text-primary: #0a0a0a;
  --text-secondary: #525252;
  --border: rgba(0, 0, 0, 0.06);
  --shadow-color: rgba(0, 0, 0, 0.04);
  --accent: #0ea5e9;
}

.dark {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --border: rgba(255, 255, 255, 0.06);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --accent: #38bdf8;
}
```
* **Tailwind Integration:** Use Tailwind's `dark:` variant. Configure `darkMode: 'class'` in Tailwind config. Apply `dark` class to `<html>` element.
* **System Preference Detection:** Default to `prefers-color-scheme` on first visit. Store user override in `localStorage`. Prevent flash of wrong theme with a blocking `<script>` in `<head>`:
```html
<script>
  const theme = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
</script>
```

### Design Rules for Dark Mode
* **Never invert colors 1:1.** Dark mode is not "light mode with colors swapped." Reduce contrast slightly — `#fafafa` text on `#0a0a0a` is too harsh. Use `#e4e4e7` on `#0a0a0a` for body text.
* **Elevate with lightness, not shadows.** In dark mode, higher-elevation surfaces should be lighter (`#141414` → `#1c1c1c` → `#262626`), not darker with shadows.
* **Shadows still work** but must be much darker (`rgba(0,0,0,0.5)`) and more diffused. Light mode shadows are cosmetic; dark mode shadows create depth.
* **Images and media:** Apply a subtle `brightness(0.9)` filter to images in dark mode to prevent eye-searing bright photos.
* **Accent colors may need adjustment.** A saturated blue that works on white may feel neon on black. Slightly lighten or desaturate accents for dark mode.

## 12. SEO & META ARCHITECTURE
Premium design means nothing if search engines cannot index it. These rules ensure discoverability:

### Mandatory Meta Tags
```tsx
// app/layout.tsx (Next.js App Router)
export const metadata: Metadata = {
  title: { default: 'Brand Name', template: '%s | Brand Name' },
  description: 'Concise, keyword-rich description under 160 characters.',
  openGraph: {
    title: 'Brand Name',
    description: 'Same or variant of meta description.',
    url: 'https://example.com',
    siteName: 'Brand Name',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Brand preview' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Name',
    description: 'Same description.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://example.com' },
};
```

### Semantic Structure
* **One `<h1>` per page.** Never skip heading levels (h1 → h3). Use proper hierarchy: h1 → h2 → h3.
* **Structured Data (JSON-LD):** Add schema markup for Organization, Product, FAQ, BreadcrumbList as appropriate. Place in `<script type="application/ld+json">` in the `<head>`.
* **Sitemap & Robots:** Generate `sitemap.xml` and `robots.txt`. In Next.js, export from `app/sitemap.ts` and `app/robots.ts`.

### Performance-SEO Intersection
* **Server-render critical content.** Text inside the hero, navigation links, and primary CTA must be in the initial HTML — not loaded via client-side JavaScript. Use React Server Components for all static content.
* **No content behind interactions.** If your FAQ answers are hidden in accordions, search engines may not index them. Use `<details>` elements or render content visibly for crawlers.
* **Canonical URLs** on every page to prevent duplicate content issues.
* **Alt text on all meaningful images.** Be descriptive, not generic. "`AI dashboard showing real-time analytics`" not "`image`".

## 13. CODE EXAMPLES (Before → After)

### Example 1: Generic Card → Premium Double-Bezel Card
```tsx
// BEFORE — Generic AI slop
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-xl font-bold text-gray-900">Feature Title</h3>
  <p className="text-gray-600 mt-2">Description of the feature goes here.</p>
</div>

// AFTER — Premium Double-Bezel with motion
<motion.div
  className="rounded-[2rem] bg-zinc-100/50 dark:bg-white/[0.03] p-1.5 ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
  whileHover={{ y: -2 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>
  <div className="rounded-[calc(2rem-0.375rem)] bg-white dark:bg-zinc-900 p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
    <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-emerald-600 dark:text-emerald-400 mb-4">
      Core
    </span>
    <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      Feature title
    </h3>
    <p className="text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed max-w-[50ch]">
      A concise description that says exactly what it does without filler words.
    </p>
  </div>
</motion.div>
```

### Example 2: Generic Button → Magnetic CTA with Nested Icon
```tsx
// BEFORE — Default button
<button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
  Get Started →
</button>

// AFTER — Premium pill with nested icon + spring physics
<motion.button
  className="group relative inline-flex items-center gap-3 rounded-full bg-zinc-900 dark:bg-white px-6 py-3 text-sm font-medium text-white dark:text-zinc-900 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <span>Get started</span>
  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 dark:bg-black/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-110">
    <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
  </span>
</motion.button>
```

### Example 3: Static Section → Scroll-Animated Entry with Reduced Motion
```tsx
// BEFORE — Static mount, no animation
<section className="py-12">
  <h2>Our Features</h2>
  <div className="grid grid-cols-3 gap-4">...</div>
</section>

// AFTER — Staggered entry respecting reduced motion
'use client';
import { motion, useReducedMotion } from 'framer-motion';

function FeaturesSection({ features }: { features: Feature[] }) {
  const shouldReduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };

  const item = shouldReduce
    ? {}
    : {
        hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
        show: {
          opacity: 1, y: 0, filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 100, damping: 20 },
        },
      };

  return (
    <section className="py-32 px-4">
      <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100 mb-16">
        What we build
      </h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
      >
        {features.map((f) => (
          <motion.div key={f.id} variants={item}>
            {/* Double-Bezel card here */}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
```

### Example 4: Theme Toggle with System Detection
```tsx
'use client';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from '@phosphor-icons/react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.toggle('dark', resolvedTheme === 'dark');
    };

    if (theme === 'system') {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      localStorage.removeItem('theme');
      return () => mq.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const options = [
    { value: 'light' as Theme, icon: Sun },
    { value: 'system' as Theme, icon: Monitor },
    { value: 'dark' as Theme, icon: Moon },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`rounded-full p-2 transition-colors ${
            theme === value
              ? 'bg-white dark:bg-zinc-700 shadow-sm'
              : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
          aria-label={`Switch to ${value} mode`}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" weight="bold" />
        </button>
      ))}
    </div>
  );
}
```

## 14. FINAL PRE-FLIGHT CHECK
Evaluate your code against this matrix before outputting. This is the **last** filter you apply to your logic.
- [ ] Is global state used appropriately to avoid deep prop-drilling rather than arbitrarily?
- [ ] Is mobile layout collapse (`w-full`, `px-4`, `max-w-7xl mx-auto`) guaranteed for high-variance designs?
- [ ] Do full-height sections safely use `min-h-[100dvh]` instead of the bugged `h-screen`?
- [ ] Do `useEffect` animations contain strict cleanup functions?
- [ ] Are empty, loading, and error states provided?
- [ ] Are cards omitted in favor of spacing where possible?
- [ ] Did you strictly isolate CPU-heavy perpetual animations in their own Client Components?
- [ ] Do ALL animations respect `prefers-reduced-motion`? (Section 10)
- [ ] Does every interactive element have visible focus indicators and ARIA labels? (Section 10)
- [ ] Is color contrast at least 4.5:1 for normal text and 3:1 for large text? (Section 10)
- [ ] Are all images using responsive formats (WebP/AVIF) with explicit dimensions? (Section 5)
- [ ] Is LCP < 2.5s with hero image preloaded? (Section 5)
- [ ] Does the page have proper meta tags, OG image, canonical URL, and JSON-LD? (Section 12)
- [ ] Does dark mode use elevated surfaces (lighter bg) instead of inverted shadows? (Section 11)
- [ ] Is semantic HTML used (`<nav>`, `<main>`, `<section>`) instead of div soup? (Section 10)
