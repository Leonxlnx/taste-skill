"use client"

"use client"
import { ContactShadows } from "@/registry/sources/drei/components/drei/core/ContactShadows"
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

export default function Preview(){return <PreviewCanvas camera={{position:[3,2.4,4],fov:42}}><ambientLight intensity={1.2}/><directionalLight position={[3,4,2]} intensity={2}/><mesh position={[0,.7,0]} rotation={[.3,.5,0]}><torusKnotGeometry args={[.7,.24,96,16]}/><meshStandardMaterial color="#f97316" roughness={.3}/></mesh><ContactShadows position={[0,-.2,0]} opacity={.75} scale={7} blur={2.5} far={4} frames={1}/></PreviewCanvas>}
