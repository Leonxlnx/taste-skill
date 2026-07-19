import type { ComponentType } from "react";

export type CatalogStatus = "draft" | "verified" | "deprecated";
export type CatalogRuntime = "css" | "dom" | "canvas" | "webgl";
export type CatalogOrigin = "original" | "adapted" | "dependency";
export type CatalogKind = "block" | "chrome" | "component" | "effect";

export interface CatalogMeta {
  name: string;
  title: string;
  description: string;
  type: "registry:block" | "registry:component";
  kind: CatalogKind;
  category: string;
  sections: string[];
  runtime: CatalogRuntime;
  status: CatalogStatus;
  tags: string[];
  files: string[];
  dependencies: string[];
  registryDependencies: string[];
  origin: {
    kind: CatalogOrigin;
    license: string;
    author: string;
    source?: string | null;
    revision?: string | null;
    path?: string | null;
    modified: boolean;
  };
  accessibility: {
    reducedMotion: "unchanged" | "simplified" | "static";
    notes: string;
  };
  performance: {
    budget: string;
  };
  display?: {
    size?: "standard" | "wide" | "tall";
    homepage?: boolean;
    order?: number;
  };
}
export interface CatalogEntry extends CatalogMeta {
  previewPath: string;
  loadPreview: () => Promise<{ default: ComponentType }>;
}
