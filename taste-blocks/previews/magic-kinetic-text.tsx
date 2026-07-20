"use client"

import { KineticText } from "@/registry/sources/magic-ui/components/magic-kinetic-text/kinetic-text"

export default function MagicKineticTextPreview() {
  return (
    <div className="flex min-h-64 w-full max-w-4xl items-center justify-center rounded-3xl bg-neutral-950 px-6 text-white">
      <KineticText
        as="p"
        text="Kinetic"
        className="text-6xl tracking-tight sm:text-8xl [font-optical-sizing:auto]"
      />
    </div>
  )
}
