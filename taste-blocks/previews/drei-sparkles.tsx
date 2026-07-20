"use client"

"use client"
import { Sparkles } from "@/registry/sources/drei/components/drei/core/Sparkles"
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

function Scene(){const reduced=useReducedMotion();return <Sparkles count={90} speed={reduced?0:.45} opacity={.9} scale={[5,3,2]} size={3} color="#c4b5fd" noise={1.2}/>}
export default function Preview(){return <PreviewCanvas><Scene/></PreviewCanvas>}
