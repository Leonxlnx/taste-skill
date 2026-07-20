"use client";

import { useState } from "react";
import { TextMorph } from "@/registry/sources/motion-primitives/components/motion-text-morph/text-morph";

export default function MotionTextMorphPreview() {
  const [word, setWord] = useState<"Shape" | "Share">("Shape");

  return (
    <div className="flex flex-col items-center gap-6">
      <TextMorph
        as="h2"
        className="text-5xl font-semibold tracking-tight text-zinc-950"
      >
        {word}
      </TextMorph>
      <button
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        onClick={() =>
          setWord((current) => (current === "Shape" ? "Share" : "Shape"))
        }
        type="button"
      >
        Morph text
      </button>
    </div>
  );
}
