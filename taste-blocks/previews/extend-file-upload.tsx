"use client"

import { FileUpload } from "@/registry/sources/extend-ui/components/extend-ui/file-upload"

export default function ExtendFileUploadPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <FileUpload />
    </div>
  )
}
