"use client"

import GridBloom from "@/registry/sources/chamaac-ui/components/chamaac-ui/grid-bloom"

export default function ChamaacGridBloomPreview() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-[#050507]">
      <GridBloom color="#d946ef" gridScale={11} />
    </div>
  )
}
