import * as THREE from 'three'
import * as React from 'react'
import { Color, Group } from 'three'
import { MarchingCubes as MarchingCubesImpl } from 'three-stdlib'
import { ThreeElements, useFrame } from '@react-three/fiber'
import { ForwardRefComponent } from '../helpers/ts-utils'

type Api = {
  getParent: () => React.RefObject<MarchingCubesImpl>
}

const globalContext = /* @__PURE__ */ React.createContext<Api>(null!)

export type MarchingCubesProps = {
  resolution?: number
  maxPolyCount?: number
  enableUvs?: boolean
  enableColors?: boolean
} & Omit<ThreeElements['group'], 'ref'>

export const MarchingCubes: ForwardRefComponent<MarchingCubesProps, MarchingCubesImpl> =
  /* @__PURE__ */ React.forwardRef(
    ({ resolution = 28, maxPolyCount = 10000, enableUvs = false, enableColors = false, children, ...props }, ref) => {
      const marchingCubesRef = React.useRef<MarchingCubesImpl>(null!)
      React.useImperativeHandle(ref, () => marchingCubesRef.current, [])
      const marchingCubes = React.useMemo(
        () =>
          new MarchingCubesImpl(resolution, null as unknown as THREE.Material, enableUvs, enableColors, maxPolyCount),
        [resolution, maxPolyCount, enableUvs, enableColors]
      )
      const api = React.useMemo(() => ({ getParent: () => marchingCubesRef }), [])

      useFrame(() => {
        marchingCubes.update()
        marchingCubes.reset()
      }, -1) // To make sure the reset runs before the balls or planes are added

      return (
        <>
          <primitive object={marchingCubes} ref={marchingCubesRef} {...props}>
            <globalContext.Provider value={api}>{children}</globalContext.Provider>
          </primitive>
        </>
      )
    }
  )

export type MarchingCubeProps = {
  strength?: number
  subtract?: number
  color?: Color
} & ThreeElements['group']

export const MarchingCube: ForwardRefComponent<MarchingCubeProps, THREE.Group> = /* @__PURE__ */ React.forwardRef(
  ({ strength = 0.5, subtract = 12, color, ...props }: MarchingCubeProps, ref) => {
    const { getParent } = React.useContext(globalContext)
    const parentRef = React.useMemo(() => getParent(), [getParent])
    const cubeRef = React.useRef<Group>(null!)
    React.useImperativeHandle(ref, () => cubeRef.current, [])
    const vec = new THREE.Vector3()
    useFrame((state) => {
      if (!parentRef.current || !cubeRef.current) return
      cubeRef.current.getWorldPosition(vec)
      parentRef.current.addBall(0.5 + vec.x * 0.5, 0.5 + vec.y * 0.5, 0.5 + vec.z * 0.5, strength, subtract, color)
    })
    return <group ref={cubeRef} {...props} />
  }
)

export type MarchingPlaneProps = {
  planeType?: 'x' | 'y' | 'z'
  strength?: number
  subtract?: number
} & ThreeElements['group']

export const MarchingPlane: ForwardRefComponent<MarchingPlaneProps, THREE.Group> = /* @__PURE__ */ React.forwardRef(
  ({ planeType: _planeType = 'x', strength = 0.5, subtract = 12, ...props }: MarchingPlaneProps, ref) => {
    const { getParent } = React.useContext(globalContext)
    const parentRef = React.useMemo(() => getParent(), [getParent])
    const wallRef = React.useRef<Group>(null!)
    React.useImperativeHandle(ref, () => wallRef.current, [])
    const planeType = React.useMemo(
      () => (_planeType === 'x' ? 'addPlaneX' : _planeType === 'y' ? 'addPlaneY' : 'addPlaneZ'),
      [_planeType]
    )

    useFrame(() => {
      if (!parentRef.current || !wallRef.current) return
      parentRef.current[planeType](strength, subtract)
    })
    return <group ref={wallRef} {...props} />
  }
)
