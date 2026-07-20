"use client";

import { SpeechInput } from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/speech-input";
import { useState } from "react";

export default function SpeechInputPreview() {
  const [transcript, setTranscript] = useState("No speech captured yet.");

  return (
    <div className="flex max-w-md items-center gap-4 rounded-xl border p-4">
      <SpeechInput
        aria-label="Start speech input"
        onTranscriptionChange={setTranscript}
        size="icon"
      />
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {transcript}
      </p>
    </div>
  );
}
