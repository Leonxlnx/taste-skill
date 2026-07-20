"use client"

"use client"

import { useState } from "react"

import { Timer } from "@/registry/sources/cult-ui/components/cult-timer/timer"

export default function CultTimerPreview() {
  const [isRunning, setIsRunning] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="flex flex-col items-center gap-5">
      <Timer
        key={resetKey}
        className="border-neutral-200 bg-white text-neutral-950"
        format="MM:SS"
        loading={isRunning}
        resetOnLoadingChange={false}
        size="lg"
      />
      <div className="flex gap-2">
        <button
          className="rounded-full bg-neutral-950 px-4 py-2 text-sm text-white"
          onClick={() => setIsRunning((current) => !current)}
          type="button"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-950"
          onClick={() => {
            setIsRunning(false)
            setResetKey((current) => current + 1)
          }}
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
