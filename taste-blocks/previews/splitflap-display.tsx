"use client";

import { useState } from "react";

import { SplitFlapDisplay } from "@/registry/sources/splitflap/components/splitflap-display/split-flap-display";

const destinations = ["BERLIN", "PARIS", "LONDON", "ROME"];

export default function SplitFlapDisplayPreview() {
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <div className="grid w-full max-w-md gap-5 rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-sm">
      <div className="grid min-w-0 gap-2">
        <p className="text-sm font-medium text-neutral-600">Next destination</p>
        <SplitFlapDisplay
          words={destinations}
          slotCount={8}
          size="compact"
          refreshSignal={refreshSignal}
          announce
        />
      </div>

      <button
        type="button"
        className="min-h-11 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
        onClick={() => setRefreshSignal((signal) => signal + 1)}
      >
        Show next destination
      </button>
    </div>
  );
}
