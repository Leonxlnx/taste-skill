---
name: bento-grid-feature
category: feature
dial_compatibility:
  variance: [5, 9]
  motion: [2, 8]
  density: [4, 7]
when_to_use: "Feature sets where each item benefits from a different amount of visual space and at least some cells contain meaningful media."
not_for: "Three equal feature cards, text-only feature lists, or content where every item has identical priority."
stack: ["react", "next", "tailwind", "motion"]
---

# Bento Grid Feature

## 1. Visual sketch

```text
desktop
┌──────────────────────────────┬───────────────┐
│ primary feature              │ supporting    │
│ wide media + copy            │ visual        │
│                              │               │
├───────────────┬──────────────┴───────────────┤
│ supporting    │ secondary feature            │
│ text + media  │ wide visual + copy           │
└───────────────┴──────────────────────────────┘

mobile
┌──────────────────────────────┐
│ primary feature              │
├──────────────────────────────┤
│ supporting feature           │
├──────────────────────────────┤
│ supporting feature           │
├──────────────────────────────┤
│ secondary feature            │
└──────────────────────────────┘
```

A bento layout earns its complexity through hierarchy. Cell spans should express feature importance, not create a decorative checkerboard.

## 2. Props API

```tsx
export type BentoItem = {
  id: string;
  title: string;
  description: string;
  media?: {
    src: string;
    alt: string;
  };
  span?: "standard" | "wide" | "tall";
};

export type BentoGridProps = {
  heading: string;
  intro?: string;
  items: BentoItem[];
  motionIntensity?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};
```

Render exactly one cell per item. Do not insert empty filler cells to make the desktop grid look symmetrical.

## 3. Code sketch

Server component (`BentoGrid.tsx`):

```tsx
import { BentoCell } from "./BentoCell";

export type BentoItem = {
  id: string;
  title: string;
  description: string;
  media?: {
    src: string;
    alt: string;
  };
  span?: "standard" | "wide" | "tall";
};

export type BentoGridProps = {
  heading: string;
  intro?: string;
  items: BentoItem[];
  motionIntensity?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};

export function BentoGrid({
  heading,
  intro,
  items,
  motionIntensity = 4,
}: BentoGridProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="bento-heading" className="bg-white py-20 text-neutral-950 dark:bg-neutral-950 dark:text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 id="bento-heading" className="text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            {heading}
          </h2>
          {intro ? (
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-neutral-600 dark:text-neutral-300">
              {intro}
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid auto-rows-[minmax(19rem,auto)] grid-cols-1 gap-4 md:grid-cols-6">
          {items.map((item, index) => (
            <BentoCell
              key={item.id}
              item={item}
              index={index}
              motionIntensity={motionIntensity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Client motion leaf (`BentoCell.tsx`):

```tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { memo } from "react";
import type { BentoGridProps, BentoItem } from "./BentoGrid";

const spanClasses = {
  standard: "md:col-span-3",
  wide: "md:col-span-4",
  tall: "md:col-span-2 md:row-span-2",
} as const;

type BentoCellProps = {
  item: BentoItem;
  index: number;
  motionIntensity: NonNullable<BentoGridProps["motionIntensity"]>;
};

export const BentoCell = memo(function BentoCell({
  item,
  index,
  motionIntensity,
}: BentoCellProps) {
  const reduceMotion = useReducedMotion();
  const enabled = !reduceMotion && motionIntensity > 3;
  const span = spanClasses[item.span ?? "standard"];

  return (
    <motion.article
      initial={enabled ? { opacity: 0, y: 18 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: motionIntensity >= 7 ? 0.65 : 0.45,
        delay: enabled ? Math.min(index * 0.045, 0.18) : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`${span} relative isolate overflow-hidden border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8`}
    >
      <div className="relative z-10 max-w-md">
        <h3 className="text-xl font-semibold tracking-[-0.02em]">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {item.description}
        </p>
      </div>

      {item.media ? (
        <div className="relative mt-8 min-h-48 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          <Image
            src={item.media.src}
            alt={item.media.alt}
            fill
            sizes="(max-width: 767px) 100vw, 66vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </motion.article>
  );
});
```

The span map is static on purpose. Building Tailwind class names from arbitrary strings can prevent the classes from being generated at build time.

## 4. Mobile fallback

- Every cell becomes one column on mobile; span classes activate only at `md`.
- Preserve source order so reading order and keyboard order remain logical.
- Do not shrink copy to preserve the desktop mosaic.
- Give media a stable minimum height so images do not collapse while loading.
- If a tall cell becomes excessively long on mobile, crop its media instead of hiding its text.

## 5. Motion variants

- `MOTION_INTENSITY 1-3`: cells render without entrance motion. Hover states may still communicate interactivity when a cell is actually clickable.
- `MOTION_INTENSITY 4-7`: one-time 18px vertical reveal with a short stagger capped at 180ms total.
- `MOTION_INTENSITY 8-10`: keep the same reveal grammar but allow a slightly longer settle. Do not make every cell use a different animation.
- `prefers-reduced-motion`: `useReducedMotion()` removes transforms and delays.

## 6. Dark-mode notes

Keep the page theme consistent. The example uses neutral surfaces with a single border treatment so visual variation comes from content and media, not random per-card colors.

If the brand has an accent, reserve it for one or two meaningful cells or interactive states. Do not alternate accent colors across cells.

## 7. Anti-patterns

- Three equal cards renamed as a bento grid.
- Empty grid cells inserted for symmetry.
- Every cell using the same white background and text-only composition.
- Random `col-span-*` values disconnected from content importance.
- A unique animation for every card.
- Decorative progress bars, fake metrics, or labels added only to make a cell look busy.
- Nested rounded cards inside rounded cards.
- Dynamic Tailwind span strings that disappear from the production stylesheet.

## 8. References

- CSS Grid layout: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
- Motion `whileInView`: https://motion.dev/docs/react-scroll-animations
- Tailwind grid column utilities: https://tailwindcss.com/docs/grid-column
