"use client";

import { useRef } from "react";

import { PercentBadgeIcon, type PercentBadgeIconHandle } from "@/registry/sources/heroicons-animated/components/heroicons-animated-percent-badge-icon/percent-badge";

export default function Preview() {
  const icon = useRef<PercentBadgeIconHandle>(null);
  const start = () => icon.current?.startAnimation();
  const stop = () => icon.current?.stopAnimation();

  return (
    <div className="flex min-h-72 items-center justify-center">
      <button
        type="button"
        aria-label="Animate Percent Badge Icon"
        className="rounded-xl p-4 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onFocus={start}
        onBlur={stop}
        onPointerEnter={start}
        onPointerLeave={stop}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <PercentBadgeIcon ref={icon} aria-hidden="true" size={64} />
      </button>
    </div>
  );
}
