"use client"

import { Shutter } from "@/registry/sources/trickle/components/trickle-shutter/shutter"

export default function TrickleShutterPreview() {
  return (
    <section className="max-w-md text-center">
      <Shutter as="h2" bars={10} className="text-4xl font-semibold leading-tight tracking-tight">
        Shutters open once, then leave the source text intact.
      </Shutter>
    </section>
  )
}
