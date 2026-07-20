import * as React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AsciiEffect } from 'three-stdlib'

export type AsciiRendererProps = {
  /** Render index, default: 1 */
  renderIndex?: number
  /** CSS background color (can be "transparent"), default: black */
  bgColor?: string
  /** CSS character color, default: white */
  fgColor?: string
  /** Characters, default: ' .:-+*=%@#' */
  characters?: string
  /** Invert character, default: true */
  invert?: boolean
  /** Colorize output (very expensive!), default: false */
  color?: boolean
  /** Level of detail, default: 0.15 */
  resolution?: number
}

export function AsciiRenderer({
  renderIndex = 1,
  bgColor = 'black',
  fgColor = 'white',
  characters = ' .:-+*=%@#',
  invert = true,
  color = false,
  resolution = 0.15,
}: AsciiRendererProps) {
  // Reactive state
  const { size, gl, scene, camera } = useThree()

  // Create effect
  const effect = React.useMemo(() => {
    const effect = new AsciiEffect(gl, characters, { invert, color, resolution })
    effect.domElement.style.position = 'absolute'
    effect.domElement.style.top = '0px'
    effect.domElement.style.left = '0px'
    effect.domElement.style.pointerEvents = 'none'
    return effect
  }, [characters, invert, color, resolution])

  // Styling
  React.useLayoutEffect(() => {
    effect.domElement.style.color = fgColor
    effect.domElement.style.backgroundColor = bgColor
  }, [fgColor, bgColor])

  // Append on mount, remove on unmount
  React.useEffect(() => {
    gl.domElement.style.opacity = '0'
    gl.domElement.parentNode!.appendChild(effect.domElement)
    return () => {
      gl.domElement.style.opacity = '1'
      gl.domElement.parentNode!.removeChild(effect.domElement)
    }
  }, [effect])

  // Set size
  React.useEffect(() => {
    effect.setSize(size.width, size.height)
  }, [effect, size])

  // Take over render-loop (that is what the index is for)
  useFrame((state) => {
    effect.render(scene, camera)
  }, renderIndex)

  // return something to not break type signatures
  return <></>
}
