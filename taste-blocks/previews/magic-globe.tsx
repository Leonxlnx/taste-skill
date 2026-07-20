"use client"

import { Globe } from "@/registry/sources/magic-ui/components/magic-globe/globe"

export default function MagicGlobePreview() {
  return (
    <div className="relative aspect-square w-full max-w-xl overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900">
      <Globe ariaLabel="Rotating globe with location markers" />
    </div>
  )
}
