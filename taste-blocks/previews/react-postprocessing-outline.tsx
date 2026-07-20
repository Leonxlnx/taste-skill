"use client"

'use client'

import { useRef } from 'react'
import type { Mesh } from 'three'

import { Outline } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Outline'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function OutlineExample() {
  const target = useRef<Mesh>(null!)
  const scene = (
    <>
      <mesh ref={target} position={[-0.75, 0, 0]}>
        <dodecahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color="#1a1d26" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[1.15, 0, -0.25]}>
        <torusGeometry args={[0.72, 0.22, 36, 96]} />
        <meshStandardMaterial color="#ff6a3d" />
      </mesh>
    </>
  )

  return <PostEffectPreview scene={scene}><Outline selection={target} edgeStrength={5} visibleEdgeColor={0xff6a3d} hiddenEdgeColor={0x6f2a18} pulseSpeed={0.45} /></PostEffectPreview>
}
