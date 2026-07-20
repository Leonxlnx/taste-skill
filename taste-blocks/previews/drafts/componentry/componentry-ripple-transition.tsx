"use client";

import { RippleTransition } from "@/registry/sources/componentry/components/componentry/ripple-transition";

function art(primary: string, secondary: string, shift: number) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="${primary}"/>
      <circle cx="${330 + shift}" cy="250" r="230" fill="${secondary}" fill-opacity=".75"/>
      <path d="M0 520 240 300l190 135 210-260 320 300v125H0Z" fill="white" fill-opacity=".17"/>
    </svg>
  `)}`;
}

const images = [
  art("#0f172a", "#06b6d4", 0),
  art("#312e81", "#ec4899", 190),
  art("#3f1d0b", "#f59e0b", -120),
];

export default function ComponentryRippleTransitionPreview() {
  return (
    <RippleTransition
      className="h-[440px] w-full max-w-3xl"
      images={images}
      label="Cycle abstract images"
      noiseWarp={0.08}
    />
  );
}
