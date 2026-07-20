import * as THREE from 'three'
import { type ConstructorRepresentation } from '@react-three/fiber'
import { type MeshBVHUniformStruct } from 'three-mesh-bvh'

type UniformValue =
  | THREE.Texture
  | THREE.TypedArray
  | THREE.Matrix4
  | THREE.Matrix3
  | THREE.Quaternion
  | THREE.Vector4
  | THREE.Vector3
  | THREE.Vector2
  | THREE.Color
  | MeshBVHUniformStruct // TODO: remove?
  | number
  | boolean
  | null

type Uniforms = Record<string, UniformValue | Record<string, UniformValue> | Array<UniformValue>>

export function shaderMaterial<U extends Uniforms, M extends THREE.ShaderMaterial & U>(
  uniforms: U,
  vertexShader: string,
  fragmentShader: string,
  onInit?: (material?: M) => void
) {
  return class extends THREE.ShaderMaterial {
    static key = THREE.MathUtils.generateUUID()

    constructor(parameters?: THREE.ShaderMaterialParameters) {
      super({ vertexShader, fragmentShader, ...parameters })

      for (const key in uniforms) {
        this.uniforms[key] = new THREE.Uniform(uniforms[key])
        Object.defineProperty(this, key, {
          get() {
            return this.uniforms[key].value
          },
          set(value) {
            this.uniforms[key].value = value
          },
        })
      }
      this.uniforms = THREE.UniformsUtils.clone(this.uniforms)

      onInit?.(this as unknown as M)
    }
  } as unknown as ConstructorRepresentation<M> & { key: string }
}
