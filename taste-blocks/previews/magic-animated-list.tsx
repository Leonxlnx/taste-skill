"use client"

import { AnimatedList } from "@/registry/sources/magic-ui/components/magic-animated-list/animated-list"

const events = [
  ["Upload complete", "12 files"],
  ["Review ready", "3 comments"],
  ["Changes published", "Production"],
] as const

export default function MagicAnimatedListPreview() {
  return (
    <AnimatedList
      role="list"
      aria-label="Sample activity"
      className="w-full max-w-md"
      delay={700}
    >
      {events.map(([title, detail]) => (
        <div
          key={title}
          role="listitem"
          className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
        >
          <span className="font-medium text-neutral-950 dark:text-neutral-50">
            {title}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">
            {detail}
          </span>
        </div>
      ))}
    </AnimatedList>
  )
}
