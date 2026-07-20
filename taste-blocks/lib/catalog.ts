import data from "@/generated/catalog.json";

export interface CatalogComponent {
  name: string;
  title: string;
  description: string;
  author: string;
  type: string;
  status: string;
  category: string;
  tags: string[];
  renderer: string;
  dependencies: string[];
  registryDependencies: string[];
  source: {
    project: string;
    repository: string;
    revision: string;
    retrievedAt: string;
    files: Array<{
      upstreamPath: string;
      permalink: string;
      upstreamSha256: string;
      contentSha256: string;
      changes: string[];
    }>;
  };
  license: {
    spdx: string;
    scope: string;
    copyright: string[];
    evidence: {
      upstreamPath: string;
      permalink: string;
      sha256: string;
    };
    notices: string[];
  };
  modifications: Array<{
    shippedPath: string;
    change: string;
    reason: string;
  }>;
  assets: unknown[];
  hashes: {
    source: string;
    content: string;
    structure: string;
  };
  preview: string;
  registryAddress: string;
  installCommand: string;
}

export const catalog = data as CatalogComponent[];

export function getComponent(name: string) {
  return catalog.find((component) => component.name === name);
}
