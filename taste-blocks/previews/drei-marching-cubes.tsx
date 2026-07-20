"use client"

"use client"
import { MarchingCube, MarchingCubes } from "@/registry/sources/drei/components/drei/core/MarchingCubes"
import * as PreviewReact from "react"
import { Canvas } from "@react-three/fiber"

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

export default function Preview(){return <PreviewCanvas><ambientLight intensity={1.3}/><directionalLight position={[2,4,3]} intensity={2}/><MarchingCubes resolution={32} maxPolyCount={12000}><meshStandardMaterial color="#22d3ee" roughness={.2} metalness={.25}/><MarchingCube position={[-.35,0,0]} strength={.65} subtract={10}/><MarchingCube position={[.35,.1,0]} strength={.65} subtract={10}/><MarchingCube position={[0,-.35,.15]} strength={.55} subtract={10}/></MarchingCubes></PreviewCanvas>}
