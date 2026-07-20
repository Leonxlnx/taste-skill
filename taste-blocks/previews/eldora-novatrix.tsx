"use client"

"use client"

import Novatrix from "@/registry/sources/eldora-ui/components/eldora-novatrix/novatrix"

export default function EldoraNovatrixPreview() {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl bg-black">
      <Novatrix color={[0.74, 0.82, 1]} amplitude={0.08} mouseReact speed={0.8} />
    </div>
  )
}
