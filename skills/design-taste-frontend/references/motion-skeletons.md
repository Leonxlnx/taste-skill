# Canonical Motion Skeletons

Referenced from `SKILL.md` Section 5. Read this file **before writing any
pinned, scrubbed, or scroll-driven animation** - these are the exact shapes that
work, with the failure modes that bite when you improvise instead.

If all you need is "items fade up as they enter the viewport", jump straight to
the Scroll-Reveal Stagger at the bottom and skip GSAP entirely.

---

### 5.A Sticky-Stack - Canonical Skeleton

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const root = ref.current;
    const ctx = gsap.context(() => {
      // Pass the root explicitly. gsap.context() scopes selector text handed to
      // gsap methods, but gsap.utils.toArray() is a plain utility - unscoped it
      // will grab every .stack-card on the page, including a second instance.
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card", root);
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",                              // pin at viewport top
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        // Animate the INNER wrapper, never the pinned element. ScrollTrigger
        // pre-measures the pinned element; transforming it corrupts those
        // measurements ("don't animate the pinned element itself").
        gsap.to(card.querySelector(".stack-card-inner"), {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div
          key={i}
          className="stack-card min-h-[100dvh] flex items-center justify-center"
        >
          <div className="stack-card-inner w-full will-change-transform">{card}</div>
        </div>
      ))}
    </div>
  );
}
```

Critical points: `start: "top top"`, `pin: true`, every card except the last is pinned, the scale/opacity transform is driven by the NEXT card's scroll trigger (so the previous card shrinks as the next one arrives).

**Two traps this skeleton avoids - do not reintroduce them:**
* **Never put CSS `sticky top-0` on a GSAP-pinned element.** ScrollTrigger wraps the element in a pin-spacer and sets `position: fixed` while pinned, then reverts it to its *original* `position` when the trigger deactivates - which would be `sticky`. The two mechanisms then fight and the stack jitters at the hand-off. Pick one: pure CSS sticky stack, or GSAP pin. Not both.
* **Never animate the pinned element itself.** Pin `.stack-card`, transform `.stack-card-inner`. GSAP pre-calculates the pinned element's box; scaling it invalidates every measurement downstream.

### 5.B Horizontal-Pan - Canonical Skeleton

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      // A function, not a captured const. invalidateOnRefresh only buys you
      // anything if the distance is RE-READ on refresh/resize; closing over a
      // number measured once makes the flag decorative.
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: () => -distance(),                            // re-measured on refresh
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",                              // pin starts when section top hits viewport top
          end: () => `+=${distance()}`,                  // scroll distance = track width minus viewport
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden">
      {/* w-max on the track and shrink-0 on the panels are load-bearing.
          Without them the wrapper's overflow-hidden lets flex compress the
          panels to the viewport width, scrollWidth === clientWidth, distance
          is ~0, and you ship a pinned section that never pans. */}
      <div ref={track} className="flex h-[100dvh] w-max items-center [&>*]:shrink-0">
        {children}
      </div>
    </section>
  );
}
```

Critical points: `start: "top top"`, `pin: true`, `end: () => "+=" + distance()` (scroll length = horizontal travel needed), `scrub: 1`. The wrapper is pinned, the inner track slides horizontally as the user scrolls vertically. Every distance must be a **function** so `invalidateOnRefresh` can re-measure after a resize or a late-loading image.

### 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative)

For simple "items appear as they enter viewport" (no pinning), prefer Motion's `whileInView` over GSAP - lighter, no ScrollTrigger needed:

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

Use this for: feature lists, testimonial grids, logo walls, anything that just needs "enter on scroll." Save GSAP for actual pin/scrub work.
