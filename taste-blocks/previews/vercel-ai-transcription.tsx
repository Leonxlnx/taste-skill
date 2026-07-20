"use client";

import {
  Transcription,
  TranscriptionSegment,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/transcription";
import { useState } from "react";

const segments = [
  { startSecond: 0, endSecond: 0.7, text: "Every" },
  { startSecond: 0.7, endSecond: 1.4, text: " interaction" },
  { startSecond: 1.4, endSecond: 2.1, text: " should" },
  { startSecond: 2.1, endSecond: 2.8, text: " explain" },
  { startSecond: 2.8, endSecond: 3.5, text: " itself." },
];

export default function TranscriptionPreview() {
  const [currentTime, setCurrentTime] = useState(1.8);

  return (
    <div className="w-full max-w-xl space-y-4 rounded-xl border p-5">
      <Transcription
        currentTime={currentTime}
        onSeek={setCurrentTime}
        segments={segments}
      >
        {(segment, index) => (
          <TranscriptionSegment index={index} key={segment.startSecond} segment={segment} />
        )}
      </Transcription>
      <input
        aria-label="Transcript position"
        className="w-full"
        max={3.5}
        min={0}
        onChange={(event) => setCurrentTime(Number(event.target.value))}
        step={0.1}
        type="range"
        value={currentTime}
      />
    </div>
  );
}
