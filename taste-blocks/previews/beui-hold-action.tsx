"use client";

import { useState } from "react";
import { HoldActionButton } from "@/registry/sources/beui/components/beui-hold-action/hold-action";

export default function BeuiHoldActionPreview() {
  const [completed, setCompleted] = useState(0);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <HoldActionButton
          holdDuration={900}
          onHoldComplete={() => setCompleted((count) => count + 1)}
          className="min-w-0 w-full bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
          fillClassName="bg-emerald-500"
        >
          Hold to approve
        </HoldActionButton>
        <HoldActionButton
          type="horizontal"
          holdDuration={900}
          onHoldComplete={() => setCompleted((count) => count + 1)}
          className="min-w-0 w-full bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50"
          fillClassName="bg-sky-400"
        >
          Hold to confirm
        </HoldActionButton>
      </div>
      <p
        aria-live="polite"
        className="min-h-5 text-sm text-zinc-500 dark:text-zinc-400"
      >
        {completed === 0
          ? "Release early to cancel."
          : `${completed} action${completed === 1 ? "" : "s"} completed.`}
      </p>
    </div>
  );
}
