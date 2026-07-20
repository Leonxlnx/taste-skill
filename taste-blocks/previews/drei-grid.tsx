"use client"

"use client"
import { Grid } from "@/registry/sources/drei/components/drei/core/Grid"
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

export default function Preview(){return <PreviewCanvas camera={{position:[3,3.2,4],fov:48}}><Grid args={[12,12]} cellColor="#3f3f46" sectionColor="#a78bfa" sectionSize={2} fadeDistance={8} fadeStrength={1.4} infiniteGrid/></PreviewCanvas>}
