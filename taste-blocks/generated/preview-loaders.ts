import type { ComponentType } from "react";

type PreviewModule = { default: ComponentType };

export const previewLoaders: Record<string, () => Promise<PreviewModule>> = {
  "paper-color-panels": () => import("../previews/paper-color-panels"),
  "paper-dithering": () => import("../previews/paper-dithering"),
  "paper-fluted-glass": () => import("../previews/paper-fluted-glass"),
  "paper-gem-smoke": () => import("../previews/paper-gem-smoke"),
  "paper-god-rays": () => import("../previews/paper-god-rays"),
  "paper-halftone-cmyk": () => import("../previews/paper-halftone-cmyk"),
  "paper-heatmap": () => import("../previews/paper-heatmap"),
  "paper-image-dithering": () => import("../previews/paper-image-dithering"),
  "paper-liquid-metal": () => import("../previews/paper-liquid-metal"),
  "paper-metaballs": () => import("../previews/paper-metaballs"),
  "paper-paper-texture": () => import("../previews/paper-paper-texture"),
  "paper-spiral": () => import("../previews/paper-spiral"),
  "paper-warp": () => import("../previews/paper-warp"),
  "paper-water": () => import("../previews/paper-water"),
  "react-compare-slider": () => import("../previews/react-compare-slider"),
};
