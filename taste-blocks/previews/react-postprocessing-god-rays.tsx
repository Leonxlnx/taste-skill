"use client"

'use client'

import { useRef } from 'react'
import type { Mesh } from 'three'

import { GodRays } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/GodRays'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function GodRaysExample() {
  const sun = useRef<Mesh>(null!)
  const scene = (
    <>
      <mesh ref={sun} position={[-1.1, 1.2, -1]}>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshBasicMaterial color="#fff0bd" />
      </mesh>
      <mesh position={[0.35, -0.15, 0.2]}>
        <torusKnotGeometry args={[0.9, 0.25, 128, 24]} />
        <meshStandardMaterial color="#171a24" roughness={0.35} />
      </mesh>
    </>
  )

  return <PostEffectPreview scene={scene}><GodRays sun={sun} density={0.96} decay={0.93} weight={0.45} exposure={0.42} samples={60} /></PostEffectPreview>
}
