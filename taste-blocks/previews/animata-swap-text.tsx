"use client";

import SwapText from "@/registry/sources/animata/components/animata-swap-text/swap-text";

export default function AnimataSwapTextPreview() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl bg-amber-100 p-8 text-amber-950">
      <SwapText
        initialText="Explore"
        finalText="Discover"
        supportsHover
        className="min-w-48"
        textClassName="text-center text-5xl"
      />
    </div>
  );
}
