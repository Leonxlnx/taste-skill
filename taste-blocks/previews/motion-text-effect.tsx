"use client";

import { useState } from "react";
import { TextEffect } from "@/registry/sources/motion-primitives/components/motion-text-effect/text-effect";

export default function MotionTextEffectPreview() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex max-w-xl flex-col items-start gap-6">
      <TextEffect
        as="h2"
        className="text-4xl font-semibold tracking-tight text-zinc-950"
        per="word"
        preset="fade-in-blur"
        trigger={visible}
      >
        Motion should clarify what changed.
      </TextEffect>
      <button
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? "Hide phrase" : "Reveal phrase"}
      </button>
    </div>
  );
}
