"use client"

import { CsvViewer } from "@/registry/sources/extend-ui/components/extend-ui/csv-viewer"

const data = `Name,Status,Amount,Updated
Northwind,Approved,18420,2026-07-18
Pioneer,Review,9720,2026-07-18
Monument,Approved,22100,2026-07-19
Keystone,Pending,12840,2026-07-20
Harbor,Approved,16450,2026-07-20`

export default function ExtendCsvViewerPreview() {
  return (
    <CsvViewer
      className="h-[560px] min-h-0 overflow-hidden rounded-2xl border"
      data={data}
      search
    />
  )
}
