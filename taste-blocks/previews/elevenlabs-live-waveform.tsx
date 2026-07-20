"use client";

import { useState } from "react";

import { LiveWaveform } from "@/registry/sources/elevenlabs-ui/components/elevenlabs-live-waveform";

export default function ElevenLabsLiveWaveformPreview() {
  const [active, setActive] = useState(false);

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <LiveWaveform
        active={active}
        barColor="#18181b"
        className="rounded-2xl border border-zinc-200 bg-white px-4"
        height={128}
        mode="static"
        onError={() => setActive(false)}
        processing={!active}
      />
      <button
        aria-pressed={active}
        className="self-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm text-white"
        onClick={() => setActive((value) => !value)}
        type="button"
      >
        {active ? "Stop microphone" : "Use microphone"}
      </button>
    </div>
  );
}
