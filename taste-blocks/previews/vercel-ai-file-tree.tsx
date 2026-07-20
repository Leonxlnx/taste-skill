"use client";

import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/file-tree";
import { useState } from "react";

export default function FileTreePreview() {
  const [selectedPath, setSelectedPath] = useState<string>();

  return (
    <FileTree
      className="w-full max-w-md"
      defaultExpanded={new Set(["src", "src/components"])}
      onSelect={setSelectedPath}
      selectedPath={selectedPath}
    >
      <FileTreeFolder name="src" path="src">
        <FileTreeFolder name="components" path="src/components">
          <FileTreeFile name="search.tsx" path="src/components/search.tsx" />
          <FileTreeFile name="result.tsx" path="src/components/result.tsx" />
        </FileTreeFolder>
        <FileTreeFile name="index.ts" path="src/index.ts" />
      </FileTreeFolder>
      <FileTreeFile name="package.json" path="package.json" />
    </FileTree>
  );
}
