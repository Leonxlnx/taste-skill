"use client"

import { InkBleed } from "@/registry/sources/trickle/components/trickle-ink-bleed/ink-bleed"

export default function TrickleInkBleedPreview() {
  return (
    <section className="max-w-md text-center">
      <InkBleed as="h2" className="text-4xl font-semibold leading-tight tracking-tight">
        Ink settles into a readable line of source text.
      </InkBleed>
    </section>
  )
}
