"use client";

import { AnimatedBackground } from "@/registry/sources/motion-primitives/components/motion-animated-background/animated-background";

const options = [
  ["overview", "Overview"],
  ["activity", "Activity"],
  ["settings", "Settings"],
] as const;

export default function MotionAnimatedBackgroundPreview() {
  return (
    <nav aria-label="Workspace views">
      <AnimatedBackground
        className="rounded-full bg-zinc-900 shadow-sm"
        defaultValue="overview"
        enableHover
      >
        {options.map(([id, label]) => (
          <button
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-500 data-[checked=true]:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            data-id={id}
            key={id}
            type="button"
          >
            {label}
          </button>
        ))}
      </AnimatedBackground>
    </nav>
  );
}
