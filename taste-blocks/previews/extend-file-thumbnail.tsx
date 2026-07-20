"use client"

import { FileThumbnail } from "@/registry/sources/extend-ui/components/extend-ui/file-thumbnail"

export default function ExtendFileThumbnailPreview() {
  return (
    <div className="mx-auto w-full max-w-xs p-6">
      <FileThumbnail
        file={{ name: "review.pdf", type: "application/pdf" }}
        previewAspectRatio={4 / 5}
        previewContent={
          <div className="flex size-full flex-col bg-white p-5 text-neutral-950">
            <div className="h-2 w-16 rounded-full bg-neutral-950" />
            <div className="mt-5 space-y-2">
              <div className="h-1.5 w-full rounded-full bg-neutral-200" />
              <div className="h-1.5 w-11/12 rounded-full bg-neutral-200" />
              <div className="h-1.5 w-4/5 rounded-full bg-neutral-200" />
            </div>
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="h-12 rounded bg-neutral-100" />
              <div className="h-12 rounded bg-neutral-200" />
              <div className="h-12 rounded bg-neutral-100" />
            </div>
          </div>
        }
      />
    </div>
  )
}
