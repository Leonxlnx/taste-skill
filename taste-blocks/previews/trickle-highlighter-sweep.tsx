"use client"

import { HighlighterSweep } from "@/registry/sources/trickle/components/trickle-highlighter-sweep/highlighter-sweep"

const segments = [
  { text: "Source-copied motion " },
  { text: "stays readable", highlight: true },
  { text: " when the line wraps." },
]

export default function TrickleHighlighterSweepPreview() {
  return (
    <section className="max-w-md text-center">
      <HighlighterSweep
        as="h2"
        segments={segments}
        color="rgb(250 204 21 / 0.5)"
        className="text-4xl font-semibold leading-tight tracking-tight"
      />
    </section>
  )
}
