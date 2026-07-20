"use client"

"use client"

import { useState } from "react"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/registry/sources/shadcn-ui/components/radix-nova/bubble"

export default function Preview() {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <BubbleGroup className="w-full max-w-80 gap-4">
      <Bubble>
        <BubbleContent>Can you review the latest draft?</BubbleContent>
      </Bubble>
      <Bubble align="end" variant="secondary">
        <BubbleContent>Yes, I will send notes today.</BubbleContent>
        <BubbleReactions>
          <button
            type="button"
            className="rounded-full px-2 py-0.5"
            aria-label="Confirm message"
            aria-pressed={confirmed}
            onClick={() => setConfirmed((value) => !value)}
          >
            {confirmed ? "✓ 1" : "✓"}
          </button>
        </BubbleReactions>
      </Bubble>
    </BubbleGroup>
  )
}
