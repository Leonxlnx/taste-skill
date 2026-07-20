"use client";

import { useEffect, useState } from "react";

import {
  TranscriptViewerAudio,
  TranscriptViewerContainer,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  TranscriptViewerWords,
  type CharacterAlignmentResponseModel,
} from "@/registry/sources/elevenlabs-ui/components/elevenlabs-transcript-viewer";

const text = "Sound becomes visible.";
const alignment: CharacterAlignmentResponseModel = {
  characters: [...text],
  characterStartTimesSeconds: [...text].map((_, index) => index * 0.04),
  characterEndTimesSeconds: [...text].map((_, index) => (index + 1) * 0.04),
};

function silentWaveUrl() {
  const sampleRate = 8000;
  const samples = sampleRate;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) =>
    [...value].forEach((character, index) =>
      view.setUint8(offset + index, character.charCodeAt(0)),
    );
  write(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  write(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export default function ElevenLabsTranscriptViewerPreview() {
  const [audioSrc, setAudioSrc] = useState("");

  useEffect(() => {
    const url = silentWaveUrl();
    setAudioSrc(url);
    return () => URL.revokeObjectURL(url);
  }, []);

  if (!audioSrc) return null;

  return (
    <TranscriptViewerContainer
      alignment={alignment}
      audioSrc={audioSrc}
      audioType="audio/wav"
      className="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <TranscriptViewerAudio className="sr-only" />
      <TranscriptViewerWords className="text-2xl leading-relaxed" />
      <TranscriptViewerScrubBar />
      <TranscriptViewerPlayPauseButton className="rounded-full">
        {({ isPlaying }) => (isPlaying ? "Pause" : "Play")}
      </TranscriptViewerPlayPauseButton>
    </TranscriptViewerContainer>
  );
}
