"use client"

"use client"

import * as React from "react"

import {
  Dropzone,
  DropzoneInput,
  DropzoneUploadIcon,
  DropzoneZone,
} from "@/registry/sources/ui-x/components/ui-x/dropzone"

export default function UiXDropzonePreview() {
  const [files, setFiles] = React.useState<File[]>([])

  return (
    <div className="mx-auto grid min-h-72 w-full max-w-lg place-content-center gap-3 p-6">
      <Dropzone onDropAccepted={setFiles} maxSize={10 * 1024 * 1024}>
        <DropzoneZone aria-label="Upload files" className="min-w-72 text-center">
          <DropzoneInput />
          <DropzoneUploadIcon className="mx-auto mb-3 size-5" aria-hidden="true" />
          <p className="text-sm font-medium">Drop files or choose from device</p>
          <p className="mt-1 text-xs text-neutral-500">Maximum 10 MB per file</p>
        </DropzoneZone>
      </Dropzone>
      <p className="text-sm text-neutral-600" aria-live="polite">
        {files.length === 0 ? "No files selected" : `${files.length} file${files.length === 1 ? "" : "s"} selected`}
      </p>
    </div>
  )
}
