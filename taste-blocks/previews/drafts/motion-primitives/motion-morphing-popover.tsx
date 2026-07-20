"use client";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/registry/sources/motion-primitives/components/motion-morphing-popover/morphing-popover";

export default function MotionMorphingPopoverPreview() {
  return (
    <MorphingPopover>
      <MorphingPopoverTrigger className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900">
        Add a quick note
      </MorphingPopoverTrigger>
      <MorphingPopoverContent
        aria-label="Quick note"
        className="left-1/2 top-12 w-72 -translate-x-1/2 rounded-2xl border-zinc-200 bg-white p-4 text-zinc-950"
      >
        <label className="text-sm font-medium" htmlFor="motion-popover-note">
          Note
        </label>
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-zinc-200 p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          id="motion-popover-note"
          placeholder="Capture the next decision…"
        />
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
