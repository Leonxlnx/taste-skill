"use client"

"use client"

import { useState } from "react"

import { AutoHeight } from "@/registry/sources/animate-ui/components/measured-auto-height/auto-height"

export default function MeasuredAutoHeightPreview() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full max-w-sm rounded-xl border bg-background p-4 shadow-sm">
      <button
        type="button"
        aria-expanded={expanded}
        className="rounded-md border px-3 py-2 text-sm font-medium"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Show less" : "Show details"}
      </button>
      <AutoHeight deps={[expanded]} className="text-sm text-muted-foreground">
        <p className="pt-3">
          The container follows its content without requiring a fixed height.
          {expanded
            ? " ResizeObserver keeps later content changes in sync as well."
            : ""}
        </p>
      </AutoHeight>
    </div>
  )
}
