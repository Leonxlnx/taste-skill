import type { ComponentType } from "react";

type PreviewModule = { default: ComponentType };

export const previewLoaders: Record<string, () => Promise<PreviewModule>> = {
  "react-compare-slider": () => import("../previews/react-compare-slider"),
};
