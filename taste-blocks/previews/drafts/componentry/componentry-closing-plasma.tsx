"use client";

import { ClosingPlasma } from "@/registry/sources/componentry/components/componentry/closing-plasma";

export default function ComponentryClosingPlasmaPreview() {
  return (
    <ClosingPlasma
      aria-label="Blue plasma field"
      className="h-[380px] w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-zinc-800"
      darkColorA="#070a12"
      darkColorB="#172554"
      darkColorC="#60a5fa"
      lightColorA="#f8fafc"
      lightColorB="#dbeafe"
      lightColorC="#3b82f6"
      role="img"
    />
  );
}
