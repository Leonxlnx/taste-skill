"use client"

"use client"

import { useRef } from "react"

import { AnimatedBeam } from "@/registry/sources/magic-ui/components/magic-animated-beam/animated-beam"

export default function MagicAnimatedBeamPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative flex h-64 w-full max-w-2xl items-center justify-between rounded-3xl border border-neutral-200 bg-white px-8 dark:border-neutral-800 dark:bg-neutral-950 sm:px-16"
    >
      <div
        ref={sourceRef}
        className="relative z-10 grid size-24 place-items-center rounded-full border border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        Source
      </div>
      <div
        ref={targetRef}
        className="relative z-10 grid size-24 place-items-center rounded-full border border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        Target
      </div>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sourceRef}
        toRef={targetRef}
        curvature={42}
        duration={2.4}
        gradientStartColor="#0f766e"
        gradientStopColor="#2563eb"
      />
    </div>
  )
}
