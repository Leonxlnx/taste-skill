"use client"

"use client"

import { useState } from "react"

import CooldownAction from "@/registry/sources/otp-timer/components/cooldown-action/cooldown-action"

export default function CooldownActionPreview() {
  const [exportCount, setExportCount] = useState(0)

  const exportSummary = () => {
    const payload = JSON.stringify(
      { exportedAt: new Date().toISOString(), status: "ready" },
      null,
      2
    )
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "activity-summary.json"
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setExportCount((current) => current + 1)
  }

  return (
    <form
      className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950"
      onSubmit={(event) => event.preventDefault()}
    >
      <p className="font-medium">Activity summary</p>
      <p className="mt-1 text-sm text-neutral-600">
        Export a local JSON summary, then wait briefly before exporting again.
      </p>
      <div className="mt-4">
        <CooldownAction
          background="#18181b"
          buttonColor="#ffffff"
          ButtonText="Export again"
          buttonStyle={{
            border: 0,
            borderRadius: "9999px",
            font: "inherit",
            padding: "0.65rem 1rem",
          }}
          minutes={0}
          resend={exportSummary}
          seconds={5}
          text="Export available in:"
          textColor="#52525b"
          timerSpanStyle={{ fontVariantNumeric: "tabular-nums" }}
        />
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Completed exports: {exportCount}
      </p>
    </form>
  )
}
