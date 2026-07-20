"use client"

"use client"

import { ProgressCircle } from "@/registry/sources/tremor-raw/components/tremor-progress-circle/src/components/ProgressCircle/ProgressCircle"

export default function TremorProgressCirclePreview() {
  return (
    <div className="flex min-h-72 items-center justify-center bg-white p-8 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <ProgressCircle
        value={68}
        aria-label="Files processed"
        radius={48}
        strokeWidth={7}
      >
        <span className="text-sm font-semibold tabular-nums">68%</span>
      </ProgressCircle>
    </div>
  )
}
