"use client";

import {
  BlurVignette,
  BlurVignetteArticle,
} from "@/registry/sources/ui-layouts/components/uilayouts-blur-vignette/blur-vignette";

export default function BlurVignettePreview() {
  return (
    <div className="grid min-h-80 place-items-center rounded-2xl bg-zinc-950 p-8">
      <BlurVignette blur="14px" classname="h-64 w-64" inset="28px" transitionLength="72px">
        <div
          aria-label="Amber and violet abstract landscape"
          className="h-full w-full bg-[radial-gradient(circle_at_28%_25%,#fbbf24,transparent_32%),radial-gradient(circle_at_70%_65%,#8b5cf6,transparent_38%),#18181b]"
          role="img"
        />
        <BlurVignetteArticle classname="flex items-end p-6 text-white">
          <p className="text-lg font-medium">Soft focus, sharp story.</p>
        </BlurVignetteArticle>
      </BlurVignette>
    </div>
  );
}
