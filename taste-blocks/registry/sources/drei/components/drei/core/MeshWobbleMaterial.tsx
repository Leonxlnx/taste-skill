import * as React from 'react'
import { IUniform, MeshStandardMaterial, MeshStandardMaterialParameters } from 'three'
import { ThreeElements, useFrame } from '@react-three/fiber'
import { ForwardRefComponent } from '../helpers/ts-utils'

interface Uniform<T> {
  value: T
}

class WobbleMaterialImpl extends MeshStandardMaterial {
  _time: Uniform<number>
  _factor: Uniform<number>

  constructor(parameters: MeshStandardMaterialParameters = {}) {
    super(parameters)
    this.setValues(parameters)
    this._time = { value: 0 }
    this._factor = { value: 1 }
  }

  // FIXME Use `THREE.WebGLProgramParametersWithUniforms` type when able to target @types/three@0.160.0
  onBeforeCompile(shader: { vertexShader: string; uniforms: { [uniform: string]: IUniform } }) {
    shader.uniforms.time = this._time
    shader.uniforms.factor = this._factor

    shader.vertexShader = `
      uniform float time;
      uniform float factor;
      ${shader.vertexShader}
    `
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `float theta = sin( time + position.y ) / 2.0 * factor;
        float c = cos( theta );
        float s = sin( theta );
        mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
        vec3 transformed = vec3( position ) * m;
        vNormal = vNormal * m;`
    )
  }

  get time() {
    return this._time.value
  }

  set time(v) {
    this._time.value = v
  }

  get factor() {
    return this._factor.value
  }

  set factor(v) {
    this._factor.value = v
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    wobbleMaterialImpl: ThreeElements['meshStandardMaterial'] & {
      time?: number
      factor?: number
      speed?: number
    }
  }
}

export type WobbleMaterialProps = Omit<ThreeElements['meshStandardMaterial'], 'ref'> & {
  speed?: number
  factor?: number
}

export const MeshWobbleMaterial: ForwardRefComponent<WobbleMaterialProps, WobbleMaterialImpl> =
  /* @__PURE__ */ React.forwardRef(({ speed = 1, ...props }, ref) => {
    const [material] = React.useState(() => new WobbleMaterialImpl())
    useFrame((state) => material && (material.time = state.clock.elapsedTime * speed))
    return <primitive object={material} ref={ref} attach="material" {...props} />
  })
