"use client"

"use client"

import FileUpload, {
  type FileUploadContext,
} from "@/registry/sources/kokonut-ui/components/kokonut-file-upload/file-upload"

function previewUpload(_file: File, { signal, onProgress }: FileUploadContext) {
  return new Promise<void>((resolve, reject) => {
    let progress = 0
    const timer = window.setInterval(() => {
      progress += 10
      onProgress(progress)
      if (progress >= 100) {
        window.clearInterval(timer)
        resolve()
      }
    }, 90)
    signal.addEventListener(
      "abort",
      () => {
        window.clearInterval(timer)
        reject(new DOMException("Upload cancelled", "AbortError"))
      },
      { once: true },
    )
  })
}

export default function KokonutFileUploadPreview() {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <FileUpload
        acceptedFileTypes={["image/*", ".pdf"]}
        maxFileSize={5 * 1024 * 1024}
        uploadFile={previewUpload}
      />
    </div>
  )
}
