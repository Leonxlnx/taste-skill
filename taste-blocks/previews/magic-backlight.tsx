"use client"

import { Backlight } from "@/registry/sources/magic-ui/components/magic-backlight/backlight"

export default function MagicBacklightPreview() {
  return (
    <Backlight blur={28} className="w-full max-w-xl">
      <div
        role="img"
        aria-label="Abstract violet and coral backlight preview"
        className="aspect-video w-full rounded-3xl bg-[radial-gradient(circle_at_25%_20%,#fb7185,transparent_38%),radial-gradient(circle_at_75%_75%,#8b5cf6,transparent_42%),#171717]"
      />
    </Backlight>
  )
}
