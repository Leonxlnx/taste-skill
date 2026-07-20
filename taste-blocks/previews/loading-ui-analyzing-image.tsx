"use client"

import { AnalyzingImage } from "@/registry/sources/loading-ui/components/loading-ui-analyzing-image/analyzing-image";

export default function LoadingUiAnalyzingImagePreview() {
  return (
    <section
      aria-busy="true"
      className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border bg-background p-8 text-foreground"
    >
      <AnalyzingImage
        aria-label="Analyzing uploaded image"
        className="size-20"
      />
      <p className="text-sm text-muted-foreground">Analyzing uploaded image…</p>
    </section>
  );
}
