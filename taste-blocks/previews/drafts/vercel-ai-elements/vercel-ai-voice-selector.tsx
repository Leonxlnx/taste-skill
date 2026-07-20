"use client";

import { Button } from "@/components/ui/button";
import {
  VoiceSelector,
  VoiceSelectorAccent,
  VoiceSelectorAge,
  VoiceSelectorBullet,
  VoiceSelectorContent,
  VoiceSelectorDescription,
  VoiceSelectorEmpty,
  VoiceSelectorGender,
  VoiceSelectorInput,
  VoiceSelectorItem,
  VoiceSelectorList,
  VoiceSelectorName,
  VoiceSelectorPreview,
  VoiceSelectorTrigger,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/voice-selector";
import { useState } from "react";

const voices = [
  { accent: "american" as const, age: "30-40", description: "Clear and neutral", gender: "female" as const, id: "mara", name: "Mara" },
  { accent: "british" as const, age: "40-50", description: "Measured and warm", gender: "male" as const, id: "ellis", name: "Ellis" },
];

export default function VoiceSelectorPreviewDemo() {
  const [value, setValue] = useState<string>();
  const [playing, setPlaying] = useState<string>();

  return (
    <VoiceSelector onValueChange={setValue} value={value}>
      <VoiceSelectorTrigger asChild>
        <Button className="w-full max-w-xs" variant="outline">
          {voices.find((voice) => voice.id === value)?.name ?? "Select a voice"}
        </Button>
      </VoiceSelectorTrigger>
      <VoiceSelectorContent className="max-w-lg">
        <VoiceSelectorInput placeholder="Search voices" />
        <VoiceSelectorList>
          <VoiceSelectorEmpty>No voice found.</VoiceSelectorEmpty>
          {voices.map((voice) => (
            <VoiceSelectorItem
              key={voice.id}
              onSelect={() => setValue(voice.id)}
              value={voice.id}
            >
              <VoiceSelectorPreview
                loading={false}
                onPlay={() => setPlaying(playing === voice.id ? undefined : voice.id)}
                playing={playing === voice.id}
              />
              <VoiceSelectorName>{voice.name}</VoiceSelectorName>
              <VoiceSelectorDescription>{voice.description}</VoiceSelectorDescription>
              <VoiceSelectorBullet />
              <VoiceSelectorAccent value={voice.accent} />
              <VoiceSelectorBullet />
              <VoiceSelectorAge>{voice.age}</VoiceSelectorAge>
              <VoiceSelectorBullet />
              <VoiceSelectorGender value={voice.gender} />
            </VoiceSelectorItem>
          ))}
        </VoiceSelectorList>
      </VoiceSelectorContent>
    </VoiceSelector>
  );
}
