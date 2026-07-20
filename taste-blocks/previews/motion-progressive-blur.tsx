"use client";

import { ProgressiveBlur } from "@/registry/sources/motion-primitives/components/motion-progressive-blur/progressive-blur";

export default function MotionProgressiveBlurPreview() {
  return (
    <div className="relative h-72 w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-950 p-8 text-white">
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-12 h-52 w-52 rounded-full bg-cyan-300/80"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-violet-400/70"
      />
      <p className="relative z-10 max-w-xs text-3xl font-semibold leading-tight">
        Layered blur creates a soft visual landing.
      </p>
      <ProgressiveBlur
        blurIntensity={2}
        className="absolute inset-x-0 bottom-0 h-32"
        direction="bottom"
      />
    </div>
  );
}
