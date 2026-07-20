"use client";

import { useState } from "react";

import { SlotText } from "@/registry/sources/slot-text/components/slot-text/react";

const states = ["Ready", "Syncing…", "Saved ✓", "מוכן"];

export default function SlotTextPreview() {
  const [stateIndex, setStateIndex] = useState(0);

  return (
    <div className="grid w-full max-w-sm gap-5 rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-950 shadow-sm">
      <div className="grid min-w-0 gap-1">
        <p className="text-sm font-medium text-neutral-600">Document status</p>
        <p className="min-w-0 overflow-x-auto text-3xl font-semibold">
          <SlotText
            dir="auto"
            text={states[stateIndex]}
            options={{ duration: 260, stagger: 32 }}
          />
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          setStateIndex((current) => (current + 1) % states.length)
        }
        className="min-h-11 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
      >
        Change status
      </button>
    </div>
  );
}
