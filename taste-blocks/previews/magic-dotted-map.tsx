"use client"

import { DottedMap } from "@/registry/sources/magic-ui/components/magic-dotted-map/dotted-map"

const markers = [
  { lat: 52.52, lng: 13.405, size: 0.8 },
  { lat: 51.5072, lng: -0.1276, size: 0.8 },
  { lat: 40.7128, lng: -74.006, size: 0.8 },
]

export default function MagicDottedMapPreview() {
  return (
    <div className="aspect-2/1 w-full max-w-3xl overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-5 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600">
      <DottedMap
        role="img"
        aria-label="Dotted world map marking Berlin, London, and New York"
        mapSamples={900}
        markers={markers}
        markerColor="#2563eb"
        pulse
      />
    </div>
  )
}
