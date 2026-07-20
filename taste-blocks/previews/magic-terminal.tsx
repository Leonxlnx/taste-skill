"use client"

import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/registry/sources/magic-ui/components/magic-terminal/terminal"

export default function MagicTerminalPreview() {
  return (
    <section aria-label="Animated terminal preview" className="w-full max-w-lg font-mono">
      <Terminal>
        <TypingAnimation>$ taste-blocks add safari</TypingAnimation>
        <AnimatedSpan className="text-emerald-600">
          Component source verified.
        </AnimatedSpan>
        <TypingAnimation>Ready.</TypingAnimation>
      </Terminal>
    </section>
  )
}
