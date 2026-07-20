"use client";

import { useState } from "react";

import {
  BarVisualizer,
  type AgentState,
} from "@/registry/sources/elevenlabs-ui/components/elevenlabs-bar-visualizer";

const states: AgentState[] = ["listening", "speaking", "thinking"];

export default function ElevenLabsBarVisualizerPreview() {
  const [state, setState] = useState<AgentState>("listening");

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <BarVisualizer
        aria-label={`${state} audio activity`}
        barCount={24}
        centerAlign
        className="h-44 rounded-2xl bg-zinc-950 p-6 text-white"
        demo
        state={state}
      />
      <div className="flex flex-wrap justify-center gap-2">
        {states.map((nextState) => (
          <button
            aria-pressed={state === nextState}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm capitalize aria-pressed:border-zinc-950 aria-pressed:bg-zinc-950 aria-pressed:text-white"
            key={nextState}
            onClick={() => setState(nextState)}
            type="button"
          >
            {nextState}
          </button>
        ))}
      </div>
    </div>
  );
}
