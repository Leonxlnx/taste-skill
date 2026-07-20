"use client";

import { useState } from "react";
import { CylinderCarousel } from "@/registry/sources/beui/components/beui-cylinder-carousel/cylinder-carousel";

const swatches = [
  ["Ink", "#18181b"],
  ["Cobalt", "#2563eb"],
  ["Mint", "#10b981"],
  ["Amber", "#f59e0b"],
  ["Coral", "#f43f5e"],
  ["Violet", "#7c3aed"],
  ["Slate", "#64748b"],
] as const;

export default function BeuiCylinderCarouselPreview() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white px-2 py-7 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <CylinderCarousel
        aria-label="Color swatches"
        height={190}
        itemSize={132}
        visibleItems={5}
        onIndexChange={setActive}
      >
        {swatches.map(([name, color]) => (
          <div
            key={name}
            className="grid size-full place-items-center rounded-full border border-white/20 text-sm font-semibold text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            {name}
          </div>
        ))}
      </CylinderCarousel>
      <p
        aria-live="polite"
        className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400"
      >
        {swatches[active]?.[0] ?? swatches[0][0]}
      </p>
    </div>
  );
}
