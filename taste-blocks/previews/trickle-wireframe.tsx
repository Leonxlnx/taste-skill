"use client"

import { Wireframe } from "@/registry/sources/trickle/components/trickle-wireframe/wireframe"

export default function TrickleWireframePreview() {
  return (
    <section className="max-w-md text-center">
      <Wireframe
        as="h2"
        text="An outlined draft settles into solid, readable type."
        stagger={36}
        strokeWidth={2}
        className="text-4xl font-semibold leading-tight tracking-tight"
      />
    </section>
  )
}
