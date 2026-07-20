"use client"

import { Pixelate } from "@/registry/sources/trickle/components/trickle-pixelate/pixelate"

export default function TricklePixelatePreview() {
  return (
    <section className="max-w-md text-center">
      <Pixelate
        as="h2"
        text="Pixels resolve into one selectable, accessible phrase."
        className="text-4xl font-semibold leading-tight tracking-tight"
      />
    </section>
  )
}
