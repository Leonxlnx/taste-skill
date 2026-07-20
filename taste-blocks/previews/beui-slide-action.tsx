"use client";

import { useState } from "react";
import { SlideActionButton } from "@/registry/sources/beui/components/beui-slide-action/slide-action";

export default function BeuiSlideActionPreview() {
  const [message, setMessage] = useState(
    "Drag either control to its far edge.",
  );

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <SlideActionButton
        className="w-[min(18rem,calc(100vw-4rem))]"
        onComplete={() => setMessage("Left-to-right action confirmed.")}
      >
        Slide to confirm
      </SlideActionButton>
      <SlideActionButton
        dir="rtl"
        className="w-[min(18rem,calc(100vw-4rem))]"
        onComplete={() => setMessage("Right-to-left action confirmed.")}
      >
        Slide to confirm
      </SlideActionButton>
      <p
        aria-live="polite"
        className="min-h-5 text-sm text-zinc-500 dark:text-zinc-400"
      >
        {message}
      </p>
    </div>
  );
}
