"use client";

import { useRef } from "react";
import { ScrollProgress } from "@/registry/sources/motion-primitives/components/motion-scroll-progress/scroll-progress";

export default function MotionScrollProgressPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative h-72 w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white"
      ref={containerRef}
    >
      <ScrollProgress
        className="sticky z-10 bg-zinc-950"
        containerRef={containerRef}
      />
      <article className="space-y-5 p-7 text-sm leading-7 text-zinc-600">
        <h2 className="text-2xl font-semibold text-zinc-950">
          A short field guide
        </h2>
        {Array.from({ length: 6 }, (_, index) => (
          <p key={index}>
            Progress stays tied to the scroll position, giving readers a quiet
            sense of where they are without replacing normal navigation.
          </p>
        ))}
      </article>
    </div>
  );
}
