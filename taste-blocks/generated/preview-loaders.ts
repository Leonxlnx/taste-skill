import type { ComponentType } from "react";

type PreviewModule = { default: ComponentType };

export const previewLoaders: Record<string, () => Promise<PreviewModule>> = {

};
