"use client";

import { Tilt } from "@/registry/sources/motion-primitives/components/motion-tilt/tilt";

export default function MotionTiltPreview() {
  return (
    <Tilt className="w-full max-w-sm rounded-3xl" rotationFactor={10}>
      <article className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Interaction
        </p>
        <h2 className="mt-8 text-3xl font-semibold text-zinc-950">
          Stable content, subtle depth.
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Pointer movement affects presentation only; the card remains fully
          readable on touch and with reduced motion.
        </p>
      </article>
    </Tilt>
  );
}
