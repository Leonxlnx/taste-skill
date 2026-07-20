"use client"

"use client"

import { VoteTally } from "@/registry/sources/cult-ui/components/cult-vote-tally/vote-tally"

const choices = [
  ["keyboard", "Keyboard navigation", "Complete flows without reaching for a pointer."],
  ["offline", "Offline mode", "Keep recent work available without a connection."],
  ["exports", "Flexible exports", "Save work in practical, portable formats."],
] as const

export default function CultVoteTallyPreview() {
  return (
    <VoteTally.Root
      aria-label="Product improvements"
      className="m-0 flex w-full max-w-lg list-none flex-col gap-2 p-0"
      defaultValue={{ keyboard: 38, offline: 24, exports: 31 }}
    >
      {choices.map(([id, title, description]) => (
        <VoteTally.Item
          className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-950 data-[voted]:border-neutral-950"
          key={id}
          value={id}
        >
          <VoteTally.Trigger
            aria-label={`Vote for ${title}`}
            className="flex min-w-12 flex-col items-center rounded-xl border border-neutral-200 px-2 py-1 text-sm font-medium hover:bg-neutral-100 data-[state=voted]:bg-neutral-950 data-[state=voted]:text-white"
          >
            <span aria-hidden="true">↑</span>
            <VoteTally.Count className="tabular-nums" />
          </VoteTally.Trigger>
          <span className="flex min-w-0 flex-col gap-1">
            <VoteTally.Title className="font-medium">{title}</VoteTally.Title>
            <VoteTally.Description className="text-sm text-neutral-500">
              {description}
            </VoteTally.Description>
          </span>
        </VoteTally.Item>
      ))}
    </VoteTally.Root>
  )
}
