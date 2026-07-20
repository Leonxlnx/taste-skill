"use client";

import { PixelCanvas } from "@/registry/sources/componentry/components/componentry/pixel-canvas";

export default function ComponentryPixelCanvasPreview() {
  return (
    <PixelCanvas
      className="h-[420px] w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950"
      colors={["#67e8f9", "#60a5fa", "#a78bfa"]}
      gap={8}
      label="Pointer-reactive pixel trail"
      speed={0.035}
      variant="glow"
    />
  );
}
