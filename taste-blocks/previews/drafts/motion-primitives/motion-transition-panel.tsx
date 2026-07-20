"use client";

import { useState } from "react";
import { TransitionPanel } from "@/registry/sources/motion-primitives/components/motion-transition-panel/transition-panel";

const labels = ["Summary", "Details", "Next"] as const;
const panels = [
  <p className="text-sm leading-6 text-zinc-600" key="summary">
    Start with the decision and the smallest useful amount of context.
  </p>,
  <p className="text-sm leading-6 text-zinc-600" key="details">
    Supporting details stay available without competing with the primary
    message.
  </p>,
  <p className="text-sm leading-6 text-zinc-600" key="next">
    End with one concrete next action and a clear owner.
  </p>,
];

export default function MotionTransitionPanelPreview() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div aria-label="Panel sections" className="flex gap-1" role="tablist">
        {labels.map((label, index) => (
          <button
            aria-controls="motion-transition-panel"
            aria-selected={activeIndex === index}
            className="rounded-full px-3 py-1.5 text-sm text-zinc-500 aria-selected:bg-zinc-950 aria-selected:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            key={label}
            onClick={() => setActiveIndex(index)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <section
        aria-label={labels[activeIndex]}
        className="mt-6 min-h-20"
        id="motion-transition-panel"
        role="tabpanel"
      >
        <TransitionPanel
          activeIndex={activeIndex}
          transition={{ duration: 0.24, ease: "easeOut" }}
          variants={{
            enter: { opacity: 0, y: 8 },
            center: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
          }}
        >
          {panels}
        </TransitionPanel>
      </section>
    </div>
  );
}
