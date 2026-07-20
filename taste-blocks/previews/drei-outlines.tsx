"use client"

"use client"
import { Outlines } from "@/registry/sources/drei/components/drei/core/Outlines"
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

export default function Preview(){return <PreviewCanvas><ambientLight intensity={1.6}/><directionalLight position={[3,4,2]} intensity={2}/><mesh rotation={[.45,.55,0]}><dodecahedronGeometry args={[1.3,0]}/><meshStandardMaterial color="#f4f4f5" roughness={.45}/><Outlines thickness={.035} color="#fb7185"/></mesh></PreviewCanvas>}
