"use client"

import ElectricMist from "@/registry/sources/chamaac-ui/components/chamaac-ui/electric-mist"

export default function ChamaacElectricMistPreview() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-[#05050f]">
      <ElectricMist color="#4f46e5" detail={1.25} distortion={2.4} />
    </div>
  )
}
