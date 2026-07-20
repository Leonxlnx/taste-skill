"use client";

import { useState } from "react";

import { CutMotion } from "@/registry/sources/carbon-icons-motion/components/carbon-icons-motion-cut-icon/cut-motion";

export default function Preview() {
  const [isAnimated, setIsAnimated] = useState(false);
  const start = () => setIsAnimated(true);
  const stop = () => setIsAnimated(false);

  return (
    <div className="flex min-h-72 items-center justify-center">
      <button
        type="button"
        aria-label="Animate Cut Icon"
        className="rounded-xl p-4 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onBlur={stop}
        onFocus={start}
        onPointerCancel={stop}
        onPointerDown={start}
        onPointerEnter={start}
        onPointerLeave={stop}
        onPointerUp={stop}
        onTouchCancel={stop}
        onTouchEnd={stop}
        onTouchStart={start}
      >
        <CutMotion aria-hidden="true" isAnimated={isAnimated} size={64} title={null} />
      </button>
    </div>
  );
}
