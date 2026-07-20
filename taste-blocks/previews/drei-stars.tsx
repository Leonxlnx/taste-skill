"use client"

"use client"
import { Stars } from "@/registry/sources/drei/components/drei/core/Stars"
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

function Scene(){const reduced=useReducedMotion();return <Stars radius={30} depth={18} count={1800} factor={3} saturation={.35} fade speed={reduced?0:.6}/>}
export default function Preview(){return <PreviewCanvas><Scene/></PreviewCanvas>}
