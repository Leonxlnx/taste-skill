"use client";

import { useRef } from "react";

import { ArchiveBoxIcon, type ArchiveBoxIconHandle } from "@/registry/sources/heroicons-animated/components/heroicons-animated-archive-box-icon/archive-box";

export default function Preview() {
  const icon = useRef<ArchiveBoxIconHandle>(null);
  const start = () => icon.current?.startAnimation();
  const stop = () => icon.current?.stopAnimation();

  return (
    <div className="flex min-h-72 items-center justify-center">
      <button
        type="button"
        aria-label="Animate Archive Box Icon"
        className="rounded-xl p-4 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onFocus={start}
        onBlur={stop}
        onPointerEnter={start}
        onPointerLeave={stop}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <ArchiveBoxIcon ref={icon} aria-hidden="true" size={64} />
      </button>
    </div>
  );
}
