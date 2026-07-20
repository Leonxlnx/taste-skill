"use client"

"use client"

import PhotonBeam from "@/registry/sources/eldora-ui/components/eldora-photon-beam/photon-beam"

export default function EldoraPhotonBeamPreview() {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl bg-[#080808]">
      <PhotonBeam
        colorBg="#080808"
        colorLine="#164e63"
        colorSignal="#67e8f9"
        lineCount={64}
        signalCount={72}
        spreadHeight={42}
        bloomStrength={2.2}
      />
    </div>
  )
}
