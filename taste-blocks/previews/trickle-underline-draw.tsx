"use client"

import { UnderlineDraw } from "@/registry/sources/trickle/components/trickle-underline-draw/underline-draw"

export default function TrickleUnderlineDrawPreview() {
  return (
    <section className="max-w-md text-center text-4xl font-semibold leading-tight tracking-tight">
      A restrained underline can follow{" "}
      <UnderlineDraw color="#e05f45" thickness="3px">
        meaningful emphasis across a phrase.
      </UnderlineDraw>
    </section>
  )
}
