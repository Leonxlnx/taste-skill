"use client";

import { useState } from "react";

import NumberFlow from "@/registry/sources/numberflow/components/number-flow/number-flow";

const step = 125;

export default function NumberFlowPreview() {
  const [value, setValue] = useState(1248);

  return (
    <div className="grid w-full max-w-sm gap-5 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-950 shadow-sm">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-neutral-600">Current balance</p>
        <div aria-live="polite" aria-atomic="true" className="text-4xl font-semibold tabular-nums">
          <NumberFlow
            value={value}
            locales="en-US"
            format={{ currency: "USD", style: "currency" }}
            respectMotionPreference
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setValue((current) => Math.max(0, current - step))}
          className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          aria-label={`Decrease balance by ${step} dollars`}
        >
          −{step}
        </button>
        <button
          type="button"
          onClick={() => setValue((current) => current + step)}
          className="min-h-11 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          aria-label={`Increase balance by ${step} dollars`}
        >
          +{step}
        </button>
      </div>
    </div>
  );
}
