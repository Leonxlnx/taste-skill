"use client";

import { useState } from "react";
import { TextLoop } from "@/registry/sources/motion-primitives/components/motion-text-loop/text-loop";

export default function MotionTextLoopPreview() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-2xl font-semibold text-zinc-950">
        Built for{" "}
        <TextLoop className="text-violet-600" interval={1.6} trigger={playing}>
          <span>focus.</span>
          <span>clarity.</span>
          <span>momentum.</span>
        </TextLoop>
      </p>
      <button
        className="rounded-full bg-zinc-950 px-4 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        onClick={() => setPlaying((current) => !current)}
        type="button"
      >
        {playing ? "Pause text" : "Play text"}
      </button>
    </div>
  );
}
