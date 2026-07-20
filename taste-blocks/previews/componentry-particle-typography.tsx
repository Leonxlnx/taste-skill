"use client";

import { CursorDrivenParticleTypography } from "@/registry/sources/componentry/components/componentry/cursor-driven-particle-typography";

export default function ComponentryParticleTypographyPreview() {
  return (
    <CursorDrivenParticleTypography
      className="h-[380px] min-h-0 w-full max-w-3xl rounded-2xl border border-zinc-200 bg-zinc-950 text-white dark:border-zinc-800"
      color="#f4f4f5"
      fontSize={132}
      label="Particle-rendered word Vector"
      particleDensity={7}
      text="VECTOR"
    />
  );
}
