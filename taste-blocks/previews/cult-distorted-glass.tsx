"use client"

import { DistortedGlass } from "@/registry/sources/cult-ui/components/cult-distorted-glass/distorted-glass"

export default function CultDistortedGlassPreview() {
  return (
    <div className="relative h-72 w-full max-w-3xl overflow-hidden rounded-3xl bg-neutral-950">
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_25%_25%,#fb7185,transparent_35%),radial-gradient(circle_at_75%_70%,#818cf8,transparent_40%)]">
        <p className="text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl">
          Refraction
        </p>
      </div>
      <DistortedGlass className="!block !h-28 !w-full rounded-none" />
    </div>
  )
}
