"use client"

"use client"

import { VirtualizedList } from "@/registry/sources/ui-x/components/ui-x/virtualized"

const items = Array.from({ length: 10_000 }, (_, index) => index + 1)

export default function UiXVirtualizedPreview() {
  return (
    <div className="flex min-h-96 items-center justify-center p-4">
      <div className="h-80 w-full max-w-sm overflow-hidden rounded-xl border bg-white shadow-sm">
        <VirtualizedList className="h-full">
          {items.map((item) => (
            <div key={item} className="flex h-12 items-center border-b px-4 text-sm last:border-b-0">
              Result {item.toLocaleString()}
            </div>
          ))}
        </VirtualizedList>
      </div>
    </div>
  )
}
