"use client";

import {
  ChapterScrubber,
  type Chapter,
} from "@/registry/sources/ruixen-ui/components/ruixen-chapter-scrubber";

const chapters: Chapter[] = [
  ["scope", "Confirm scope", "Keep the work limited to reusable components."],
  ["source", "Pin the source", "Record one immutable upstream revision."],
  ["license", "Verify rights", "Copy the exact license and required notices."],
  [
    "inventory",
    "Inventory candidates",
    "Separate components from sections and templates.",
  ],
  [
    "quality",
    "Cull weak work",
    "Reject duplicates, filler, and fragile interactions.",
  ],
  ["copy", "Copy source", "Retain the original interaction and visual core."],
  [
    "closure",
    "Close dependencies",
    "Make every installed file and package explicit.",
  ],
  ["access", "Check access", "Test keyboard, touch, RTL, and reduced motion."],
  [
    "mobile",
    "Check mobile",
    "Confirm narrow layouts without horizontal overflow.",
  ],
  ["build", "Build the registry", "Validate and build the shadcn item."],
  [
    "runtime",
    "Run the preview",
    "Watch errors, cleanup, and remount behavior.",
  ],
  ["review", "Review the diff", "Keep only evidence-backed adaptations."],
].map(([id, title, description], index) => ({
  id,
  title,
  description,
  meta: String(index + 1).padStart(2, "0"),
}));

export default function RuixenChapterScrubberPreview() {
  return (
    <div className="flex min-h-[24rem] w-full max-w-sm items-center justify-start rounded-2xl border border-neutral-200 bg-white px-8 py-10 text-neutral-950 shadow-sm">
      <ChapterScrubber
        chapters={chapters}
        currentIndex={5}
        label="Import review chapters"
      />
    </div>
  );
}
