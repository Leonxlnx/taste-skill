---
name: asymmetric-split-hero
category: hero
dial_compatibility:
  variance: [6, 10]
  motion: [3, 10]
  density: [2, 5]
when_to_use: "Landing pages with one strong asset and one strong message. Default hero for SaaS, agency, premium consumer."
not_for: "Editorial or manifesto launches where the message itself should dominate the entire composition."
stack: ["react", "next", "tailwind", "motion"]
---

# Asymmetric Split Hero

## 1. Visual sketch

```text
wide desktop
┌──────────────────────────────────────────────────────────────────────┐
│ nav                                                                  │
│                                                                      │
│  eyebrow          oversized headline             ┌───────────────┐  │
│  5-7 columns      short supporting copy           │               │  │
│  text             primary + secondary CTA         │ real image    │  │
│                                                   │ or product UI │  │
│                         intentional overlap  ─────▶│               │  │
│                                                   └───────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

mobile
┌────────────────────────────┐
│ eyebrow                    │
│ headline                   │
│ supporting copy            │
│ CTA row / stacked CTA      │
│                            │
│ full-width visual          │
└────────────────────────────┘
```

The asymmetry comes from column weight, crop, and controlled overlap. Do not manufacture variance with random rotations, floating badges, or disconnected decoration.

## 2. Props API

```tsx
export type HeroAction = {
  label: string;
  href: string;
};

export type AsymmetricSplitHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  image: {
    src: string;
    alt: string;
    priority?: boolean;
  };
  motionIntensity?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};
```

Keep `description` below 20 words. The component intentionally exposes one optional eyebrow, one headline, one supporting paragraph, and one CTA group so the hero stays inside Section 14's four-block discipline.

## 3. Code sketch

Server component (`AsymmetricSplitHero.tsx`):

```tsx
import Link from "next/link";
import { HeroVisual } from "./HeroVisual";

export type HeroAction = {
  label: string;
  href: string;
};

export type AsymmetricSplitHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  image: {
    src: string;
    alt: string;
    priority?: boolean;
  };
  motionIntensity?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};

export function AsymmetricSplitHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  motionIntensity = 5,
}: AsymmetricSplitHeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate min-h-[100dvh] overflow-hidden bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white"
    >
      <div className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-12 px-4 pb-12 pt-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-24">
        <div className="relative z-10 lg:col-span-7 lg:pr-8">
          {eyebrow ? (
            <p className="eyebrow mb-5 text-sm font-medium tracking-[0.14em] text-neutral-600 dark:text-neutral-400">
              {eyebrow}
            </p>
          ) : null}

          <h1
            id="hero-title"
            className="max-w-4xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            {title}
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-neutral-600 sm:text-lg dark:text-neutral-300">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={primaryAction.href}
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap bg-neutral-950 px-5 text-sm font-medium text-white outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
            >
              {primaryAction.label}
            </Link>
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex min-h-11 items-center justify-center whitespace-nowrap border border-neutral-300 px-5 text-sm font-medium outline-none transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:border-neutral-700 dark:hover:bg-neutral-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative lg:col-span-5 lg:-ml-10 lg:translate-x-6">
          <HeroVisual image={image} motionIntensity={motionIntensity} />
        </div>
      </div>
    </section>
  );
}
```

Client motion leaf (`HeroVisual.tsx`):

```tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { memo } from "react";
import type { AsymmetricSplitHeroProps } from "./AsymmetricSplitHero";

type HeroVisualProps = Pick<AsymmetricSplitHeroProps, "image" | "motionIntensity">;

export const HeroVisual = memo(function HeroVisual({
  image,
  motionIntensity = 5,
}: HeroVisualProps) {
  const reduceMotion = useReducedMotion();
  const enabled = !reduceMotion && motionIntensity > 3;

  const initial = enabled
    ? motionIntensity >= 8
      ? { opacity: 0, y: 36, scale: 0.96 }
      : { opacity: 0, y: 18 }
    : false;

  return (
    <motion.figure
      initial={initial}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: motionIntensity >= 8 ? 0.8 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-neutral-900"
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={image.priority}
        sizes="(max-width: 1023px) 100vw, 42vw"
        className="object-cover"
      />
    </motion.figure>
  );
});
```

The server component owns content and links. The client boundary exists only around motion and image presentation, keeping hydration local.

## 4. Mobile fallback

- Collapse to one column below `lg`.
- Keep page padding at `px-4` minimum and preserve `max-w-7xl mx-auto` containment.
- Remove negative horizontal offsets on mobile. The visual follows the CTA group instead of floating beside the copy.
- Keep both CTA labels `whitespace-nowrap`; stack them vertically when the available width is too small.
- Use `min-h-[100dvh]`; avoid legacy fixed viewport-height utilities.
- Prefer a stable `aspect-[4/5]` image box to avoid layout shift.

## 5. Motion variants

- `MOTION_INTENSITY 1-3`: no entrance animation. Keep hover/focus feedback only.
- `MOTION_INTENSITY 4-7`: opacity plus 18px vertical settle over roughly 550ms.
- `MOTION_INTENSITY 8-10`: opacity, 36px vertical settle, and subtle `0.96 -> 1` scale over roughly 800ms. Do not add continuous parallax unless the brief explicitly needs scroll storytelling.
- `prefers-reduced-motion`: `useReducedMotion()` disables the entrance transform entirely.

## 6. Dark-mode notes

Use one page-wide theme. In dark mode, keep the visual surface neutral and let the brand accent appear in one deliberate place elsewhere in the design system. Do not invert only the hero while the rest of the page stays light.

The example uses neutral tokens so it can inherit a project's actual brand palette. Replace the neutral CTA token with the chosen project accent only if Section 4's Color Consistency Lock is maintained across the page.

## 7. Anti-patterns

- Adding trust logos, a tiny tagline, and a scroll cue inside the hero. That breaks the four-block discipline.
- Centering both columns after choosing an asymmetric layout.
- Using an abstract gradient blob when a product image, generated visual, or real photograph is available.
- Applying rounded cards to the copy column and image column just to create separation.
- Animating the text, image, background, nav, and CTA independently. One coordinated entrance is enough.
- Hiding important image content behind large overlaps that fail on tablet widths.

## 8. References

- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
- Motion for React: https://motion.dev/docs/react
- Tailwind responsive design: https://tailwindcss.com/docs/responsive-design
- Reduced motion media feature: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
