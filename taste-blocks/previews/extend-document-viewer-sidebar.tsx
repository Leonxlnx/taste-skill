"use client"

"use client"

import * as React from "react"

import { DocumentViewerThumbnailSidebar } from "@/registry/sources/extend-ui/components/extend-ui/document-viewer-sidebar"

export default function ExtendDocumentViewerSidebarPreview() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className="relative mx-auto h-[460px] w-full max-w-3xl overflow-hidden rounded-2xl border bg-muted/20">
      <DocumentViewerThumbnailSidebar inline={false} open={open}>
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((item) => (
            <button
              key={item}
              type="button"
              className="block aspect-[4/5] w-full rounded-lg border bg-background text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item}
            </button>
          ))}
        </div>
      </DocumentViewerThumbnailSidebar>
      <div className="grid h-full place-items-center p-6">
        <button
          type="button"
          className="rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-xs"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Close thumbnails" : "Open thumbnails"}
        </button>
      </div>
    </div>
  )
}
