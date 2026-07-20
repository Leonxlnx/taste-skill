"use client"

import Synthesis from "@/registry/sources/chamaac-ui/components/chamaac-ui/synthesis"

export default function ChamaacSynthesisPreview() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-black">
      <Synthesis
        color1="#111827"
        color2="#5b21b6"
        color3="#22d3ee"
      />
    </div>
  )
}
