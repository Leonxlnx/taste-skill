"use client"

"use client"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { AsciiRenderer } from "@/registry/sources/drei/components/drei/core/AsciiRenderer"
import * as PreviewReact from "react"
import { Canvas } from "@react-three/fiber"
import type { Mesh } from "three"

export function useReducedMotion() {
  const [reduced, setReduced] = PreviewReact.useState(false)
  PreviewReact.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

export function PreviewCanvas({ children, camera = { position: [0, 0, 5], fov: 45 } }: { children: PreviewReact.ReactNode; camera?: { position?: [number, number, number]; fov?: number } }) {
  const reduced = useReducedMotion()
  return <div role="img" aria-label="Interactive 3D component preview" style={{ height: "100%", minHeight: 320, width: "100%", overflow: "hidden", background: "#09090b" }}><Canvas camera={camera} dpr={[1, 1.5]} frameloop={reduced ? "demand" : "always"}>{children}</Canvas></div>
}

function Shape(){const ref=React.useRef<Mesh>(null);const reduced=useReducedMotion();useFrame((_,d)=>{if(ref.current&&!reduced){ref.current.rotation.x+=d*.45;ref.current.rotation.y+=d*.6}});return <mesh ref={ref}><torusKnotGeometry args={[1, .35, 96, 12]}/><meshNormalMaterial/></mesh>}
export default function Preview(){return <PreviewCanvas><Shape/><pointLight position={[2,2,3]} intensity={3}/><AsciiRenderer fgColor="#f4f4f5" bgColor="#09090b" resolution={.16}/></PreviewCanvas>}
