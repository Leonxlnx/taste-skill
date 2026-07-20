"use client"

import { HumanReviewPanel } from "@/registry/sources/extend-ui/components/extend-ui/bounding-box-citations"

export default function ExtendBoundingBoxCitationsPreview() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-background">
      <HumanReviewPanel />
    </div>
  )
}
