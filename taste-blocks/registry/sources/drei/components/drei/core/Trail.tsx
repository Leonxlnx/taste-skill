import { createPortal, useFrame, useThree } from '@react-three/fiber'
import * as React from 'react'
import { ColorRepresentation, Group, Mesh, Object3D, Vector2, Vector3 } from 'three'
import { MeshLineGeometry as MeshLineGeometryImpl, MeshLineMaterial } from 'meshline'
import { ForwardRefComponent } from '../helpers/ts-utils'

type Settings = {
  width: number
  length: number
  decay: number
  /**
   * Wether to use the target's world or local positions
   */
  local: boolean
  // Min distance between previous and current points
  stride: number
  // Number of frames to wait before next calculation
  interval: number
}

export type TrailProps = {
  color?: ColorRepresentation
  attenuation?: (width: number) => number
  target?: React.RefObject<Object3D>
} & Partial<Settings>

const defaults: Partial<Settings> = {
  width: 0.2,
  length: 1,
  decay: 1,
  local: false,
  stride: 0,
  interval: 1,
}

const shiftLeft = (collection: Float32Array, steps = 1): Float32Array => {
  collection.set(collection.subarray(steps))
  collection.fill(-Infinity, -steps)
  return collection
}

export function useTrail(target: Object3D, settings: Partial<Settings>) {
  const { length, local, decay, interval, stride } = {
    ...defaults,
    ...settings,
  } as Settings

  const points = React.useRef<Float32Array>(null)
  const [worldPosition] = React.useState(() => new Vector3())

  React.useLayoutEffect(() => {
    if (target) {
      points.current = Float32Array.from({ length: length * 10 * 3 }, (_, i) => target.position.getComponent(i % 3))
    }
  }, [length, target])

  const prevPosition = React.useRef(new Vector3())
  const frameCount = React.useRef(0)

  useFrame(() => {
    if (!target) return
    if (!points.current) return
    if (frameCount.current === 0) {
      let newPosition: Vector3
      if (local) {
        newPosition = target.position
      } else {
        target.getWorldPosition(worldPosition)
        newPosition = worldPosition
      }

      const steps = 1 * decay
      for (let i = 0; i < steps; i++) {
        if (newPosition.distanceTo(prevPosition.current) < stride) continue

        shiftLeft(points.current, 3)
        points.current.set(newPosition.toArray(), points.current.length - 3)
      }
      prevPosition.current.copy(newPosition)
    }

    frameCount.current++
    frameCount.current = frameCount.current % interval
  })

  return points
}

export type MeshLineGeometry = Mesh & MeshLineGeometryImpl

export const Trail: ForwardRefComponent<
  React.PropsWithChildren<TrailProps>,
  MeshLineGeometry
> = /* @__PURE__ */ React.forwardRef<MeshLineGeometry, React.PropsWithChildren<TrailProps>>((props, forwardRef) => {
  const { children } = props
  const { width, length, decay, local, stride, interval } = {
    ...defaults,
    ...props,
  } as Settings

  const { color = 'hotpink', attenuation, target } = props

  const size = useThree((s) => s.size)
  const scene = useThree((s) => s.scene)

  const ref = React.useRef<Group>(null!)
  const [anchor, setAnchor] = React.useState<Object3D>(null!)

  const points = useTrail(anchor, { length, decay, local, stride, interval })

  React.useEffect(() => {
    const t =
      target?.current ||
      ref.current.children.find((o) => {
        return o instanceof Object3D
      })

    if (t) {
      setAnchor(t)
    }
  }, [points, target])

  const geo = React.useMemo(() => new MeshLineGeometryImpl(), [])
  const mat = React.useMemo(() => {
    const m = new MeshLineMaterial({
      lineWidth: 0.1 * width,
      color: color,
      sizeAttenuation: 1,
      resolution: new Vector2(size.width, size.height),
    })

    // Get and apply first <meshLineMaterial /> from children
    let matOverride: React.ReactElement | undefined
    if (children) {
      if (Array.isArray(children)) {
        matOverride = children.find((child: React.ReactNode) => {
          const c = child as React.ReactElement
          return typeof c.type === 'string' && c.type === 'meshLineMaterial'
        }) as React.ReactElement | undefined
      } else {
        const c = children as React.ReactElement
        if (typeof c.type === 'string' && c.type === 'meshLineMaterial') {
          matOverride = c
        }
      }
    }

    if (typeof matOverride?.props === 'object' && matOverride?.props !== null) {
      m.setValues(matOverride.props)
    }

    return m
  }, [width, color, size, children])

  React.useEffect(() => {
    mat.uniforms.resolution.value.set(size.width, size.height)
  }, [size])

  useFrame(() => {
    if (!points.current) return
    geo.setPoints(points.current, attenuation)
  })

  return (
    <group>
      {createPortal(<mesh ref={forwardRef} geometry={geo} material={mat} />, scene)}
      <group ref={ref}>{children}</group>
    </group>
  )
})
