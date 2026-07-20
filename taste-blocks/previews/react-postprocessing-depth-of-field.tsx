"use client"

'use client'

import { DepthOfField } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/DepthOfField'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function DepthOfFieldExample() {
  const scene = (
    <>
      <mesh position={[-1.45, -0.1, 1.5]}>
        <torusGeometry args={[0.72, 0.22, 32, 96]} />
        <meshStandardMaterial color="#d9dded" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.82, 4]} />
        <meshStandardMaterial color="#ff5a34" emissive="#3c0d05" emissiveIntensity={1.1} roughness={0.3} />
      </mesh>
      <mesh position={[1.55, 0.05, -2]}>
        <torusKnotGeometry args={[0.64, 0.17, 112, 20]} />
        <meshStandardMaterial color="#9ca7c6" metalness={0.35} roughness={0.32} />
      </mesh>
    </>
  )

  return <PostEffectPreview scene={scene}><DepthOfField target={[0, 0, 0]} bokehScale={5.5} focusRange={0.025} /></PostEffectPreview>
}
