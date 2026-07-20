"use client";

import { useState } from "react";

import LiveWaveform from "@/registry/sources/ruixen-ui/components/ruixen-live-waveform";

export default function RuixenLiveWaveformPreview() {
  const [processing, setProcessing] = useState(true);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <LiveWaveform
        processing={processing}
        label={processing ? "Processing audio" : "Audio is idle"}
        onStop={() => setProcessing(false)}
      />
      {!processing ? (
        <button
          type="button"
          className="self-start rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm"
          onClick={() => setProcessing(true)}
        >
          Start preview
        </button>
      ) : null}
    </div>
  );
}
