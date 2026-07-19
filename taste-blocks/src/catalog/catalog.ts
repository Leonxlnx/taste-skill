import type { ComponentType } from "react";
import type { CatalogEntry, CatalogMeta } from "./types";

type PreviewModule = { default: ComponentType };

const metadataModules = import.meta.glob(
  "../../registry/**/meta.json",
  {
    eager: true,
    import: "default",
  },
) as Record<string, CatalogMeta>;

const previewModules = import.meta.glob<PreviewModule>(
  "../../registry/**/preview.tsx",
);

export const catalog: CatalogEntry[] = Object.entries(metadataModules)
  .map(([metaPath, meta]) => {
    const previewPath = metaPath.replace(/meta\.json$/, "preview.tsx");
    const loadPreview = previewModules[previewPath];

    if (!loadPreview) {
      throw new Error(`Missing preview for ${meta.name}: ${previewPath}`);
    }

    return {
      ...meta,
      previewPath,
      loadPreview,
    };
  })
  .sort((a, b) => {
    const order = (a.display?.order ?? 9999) - (b.display?.order ?? 9999);
    return order || a.title.localeCompare(b.title);
  });

export const verifiedCatalog = catalog.filter(
  (entry) => entry.status === "verified",
);

export const homepageCatalog = verifiedCatalog.filter(
  (entry) => entry.display?.homepage,
);

export const categories = Array.from(
  new Set(verifiedCatalog.map((entry) => entry.category)),
).sort();

export function findEntry(name: string) {
  return catalog.find((entry) => entry.name === name);
}
