"use client"

import {
  Matrix,
  pulse,
  snake,
  wave,
} from "@/registry/sources/elevenlabs-ui/components/elevenlabs-matrix-display";

const displays = [pulse, wave, snake];

export default function ElevenLabsMatrixDisplayPreview() {
  return (
    <div className="grid grid-cols-3 gap-5 rounded-3xl bg-zinc-950 p-8">
      {displays.map((frames, index) => (
        <Matrix
          ariaLabel={`Animated matrix pattern ${index + 1}`}
          cols={7}
          fps={14 + index * 2}
          frames={frames}
          gap={2}
          key={index}
          palette={{ on: "#fafafa", off: "#27272a" }}
          rows={7}
          size={8}
        />
      ))}
    </div>
  );
}
