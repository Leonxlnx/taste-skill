"use client"

"use client"
import { useFrame } from "@react-three/fiber"
import * as React from "react"
import { Trail } from "@/registry/sources/drei/components/drei/core/Trail"
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

function Scene(){const ref=React.useRef<Mesh>(null);const reduced=useReducedMotion();useFrame(({clock})=>{if(ref.current&&!reduced){ref.current.position.x=Math.sin(clock.elapsedTime*1.4)*1.6;ref.current.position.y=Math.cos(clock.elapsedTime*1.8)*.7}});return <Trail width={.45} length={5} color="#22d3ee" attenuation={(w)=>w}><mesh ref={ref}><sphereGeometry args={[.22,24,24]}/><meshBasicMaterial color="#e0f2fe"/></mesh></Trail>}
export default function Preview(){return <PreviewCanvas><Scene/></PreviewCanvas>}
