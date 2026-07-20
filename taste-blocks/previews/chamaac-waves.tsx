"use client"

import Waves from "@/registry/sources/chamaac-ui/components/chamaac-ui/waves"

export default function ChamaacWavesPreview() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-black">
      <Waves waveColor1="#172554" waveColor2="#22d3ee" />
    </div>
  )
}
