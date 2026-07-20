"use client"

import { SchemaBuilderPanel } from "@/registry/sources/extend-ui/components/extend-ui/schema-builder"

export default function ExtendSchemaBuilderPreview() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-background">
      <SchemaBuilderPanel />
    </div>
  )
}
