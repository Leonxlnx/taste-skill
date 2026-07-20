"use client"

"use client"

import * as React from "react"

import {
  createInitialSplits,
  DocumentSplits,
  type DocumentSplit,
  type DocumentSplitPageId,
} from "@/registry/sources/extend-ui/components/extend-ui/document-splits"

function thumbnail(pageNumber: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="184" viewBox="0 0 144 184"><rect width="144" height="184" fill="#fafafa"/><rect x="18" y="22" width="54" height="8" rx="4" fill="#171717"/><rect x="18" y="48" width="108" height="4" rx="2" fill="#d4d4d4"/><rect x="18" y="60" width="92" height="4" rx="2" fill="#e5e5e5"/><rect x="18" y="86" width="108" height="58" rx="6" fill="#f0f0f0"/><text x="72" y="166" text-anchor="middle" font-family="system-ui" font-size="12" fill="#737373">${pageNumber}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function ExtendDocumentSplitsPreview() {
  const [splits, setSplits] = React.useState<DocumentSplit[]>(() =>
    createInitialSplits(8)
  )
  const thumbnails = React.useMemo(
    () =>
      Object.fromEntries(
        Array.from({ length: 8 }, (_, index) => [
          `page-${index + 1}` as DocumentSplitPageId,
          thumbnail(index + 1),
        ])
      ) as Record<DocumentSplitPageId, string>,
    []
  )

  return (
    <div className="mx-auto h-[620px] w-full max-w-3xl overflow-hidden rounded-2xl border bg-background">
      <DocumentSplits
        splits={splits}
        thumbnailImages={thumbnails}
        onSelectPage={() => {}}
        onSplitsChange={setSplits}
      />
    </div>
  )
}
