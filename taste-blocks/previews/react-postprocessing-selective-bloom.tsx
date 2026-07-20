"use client"

'use client'

import { useRef } from 'react'
import type { Mesh, PointLight } from 'three'

import { SelectiveBloom } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/SelectiveBloom'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function SelectiveBloomExample() {
  const target = useRef<Mesh>(null!)
  const light = useRef<PointLight>(null!)
  const scene = (
    <>
      <pointLight ref={light} color="#ff5a35" intensity={45} position={[0, 2.5, 2]} />
      <mesh ref={target} position={[-0.8, 0, 0]}>
        <icosahedronGeometry args={[1, 5]} />
        <meshStandardMaterial color="#ff6a3d" emissive="#ff3b16" emissiveIntensity={2.4} />
      </mesh>
      <mesh position={[1.2, 0, -0.3]}>
        <torusKnotGeometry args={[0.72, 0.2, 128, 24]} />
        <meshStandardMaterial color="#d8dbe6" roughness={0.32} />
      </mesh>
    </>
  )

  return <PostEffectPreview scene={scene}><SelectiveBloom selection={target} lights={[light]} intensity={2.1} luminanceThreshold={0.15} mipmapBlur /></PostEffectPreview>
}
