"use client"

"use client"

import * as React from "react"

import { XlsxViewerPreview } from "@/registry/sources/extend-ui/components/extend-ui/xlsx-viewer"

export default function ExtendXlsxViewerPreview() {
  const [isDark, setIsDark] = React.useState(false)

  return (
    <XlsxViewerPreview
      className="h-[620px] min-h-0 overflow-hidden rounded-2xl border"
      isDark={isDark}
      onIsDarkChange={setIsDark}
    />
  )
}
