'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import type { ReactElement, ReactNode } from 'react'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'

import { EffectComposer } from '@/registry/sources/react-postprocessing/components/react-postprocessing/EffectComposer'
import { usePrefersReducedMotion } from '@/registry/sources/react-postprocessing/components/react-postprocessing/util'

function DemoScene() {
  const group = useRef<Group>(null)
  const reducedMotion = usePrefersReducedMotion()

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return
    group.current.rotation.y += delta * 0.24
    group.current.rotation.x = Math.sin(performance.now() / 2400) * 0.12
  })

  return (
    <group ref={group}>
      <mesh position={[-1.35, 0.15, 0]}>
        <torusKnotGeometry args={[0.72, 0.22, 128, 24]} />
        <meshStandardMaterial color="#e8ecff" metalness={0.65} roughness={0.18} />
      </mesh>
      <mesh position={[1.3, -0.05, -0.35]}>
        <icosahedronGeometry args={[0.86, 4]} />
        <meshStandardMaterial color="#ff6a3d" emissive="#4a1008" emissiveIntensity={1.2} roughness={0.28} />
      </mesh>
      <mesh position={[0, -1.35, -1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#14161c" metalness={0.15} roughness={0.55} />
      </mesh>
    </group>
  )
}

export function PostEffectPreview({ children, scene }: { children: ReactElement | ReactElement[]; scene?: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div style={{ height: 'min(72vh, 620px)', minHeight: 360, width: '100%', background: '#08090b' }}>
      <Canvas
        aria-label="Interactive three-dimensional post-processing preview"
        camera={{ fov: 44, position: [0, 0.4, 5.5] }}
        dpr={[1, 1.5]}
        fallback={<div role="img" aria-label="WebGL post-processing preview unavailable" />}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#08090b']} />
        <ambientLight intensity={0.65} />
        <pointLight color="#ffffff" intensity={30} position={[-3, 4, 4]} />
        <pointLight color="#ff5b35" intensity={22} position={[3, -1, 2]} />
        <Suspense fallback={null}>
          {scene ?? <DemoScene />}
          <EffectComposer multisampling={0}>{children}</EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
