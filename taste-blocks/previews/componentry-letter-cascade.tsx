"use client";

import { LetterCascade } from "@/registry/sources/componentry/components/componentry/letter-cascade";

export default function ComponentryLetterCascadePreview() {
  return (
    <LetterCascade
      className="rounded-lg px-3 py-2 text-5xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50"
      damping={18}
      text="Open project"
    />
  );
}
