"use client"

import LightSpeed from "@/registry/sources/chamaac-ui/components/chamaac-ui/light-speed"

export default function ChamaacLightSpeedPreview() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-black">
      <LightSpeed particleCount={800} lightColor="#8b5cf6" />
    </div>
  )
}
