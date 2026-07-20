import * as React from 'react'
import { ThreeElement, useFrame } from '@react-three/fiber'
import { Points, Vector3, Spherical, Color, AdditiveBlending, ShaderMaterial } from 'three'
import { ForwardRefComponent } from '../helpers/ts-utils'
import { version } from '../helpers/constants'

export type StarsProps = {
  radius?: number
  depth?: number
  count?: number
  factor?: number
  saturation?: number
  fade?: boolean
  speed?: number
}

class StarfieldMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: { time: { value: 0.0 }, fade: { value: 1.0 } },
      vertexShader: /* glsl */ `
      uniform float time;
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
        gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
        gl_Position = projectionMatrix * mvPosition;
      }`,
      fragmentShader: /* glsl */ `
      uniform sampler2D pointTexture;
      uniform float fade;
      varying vec3 vColor;
      void main() {
        float opacity = 1.0;
        if (fade == 1.0) {
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
        }
        gl_FragColor = vec4(vColor, opacity);

        #include <tonemapping_fragment>
	      #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
      }`,
    })
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    starfieldMaterial: ThreeElement<typeof StarfieldMaterial>
  }
}

const genStar = (r: number) => {
  return new Vector3().setFromSpherical(new Spherical(r, Math.acos(1 - Math.random() * 2), Math.random() * 2 * Math.PI))
}

export const Stars: ForwardRefComponent<StarsProps, Points> = /* @__PURE__ */ React.forwardRef(
  ({ radius = 100, depth = 50, count = 5000, saturation = 0, factor = 4, fade = false, speed = 1 }, ref) => {
    const material = React.useRef<StarfieldMaterial>(null)
    const [position, color, size] = React.useMemo(() => {
      const positions: any[] = []
      const colors: any[] = []
      const sizes = Array.from({ length: count }, () => (0.5 + 0.5 * Math.random()) * factor)
      const color = new Color()
      let r = radius + depth
      const increment = depth / count
      for (let i = 0; i < count; i++) {
        r -= increment * Math.random()
        positions.push(...genStar(r).toArray())
        color.setHSL(i / count, saturation, 0.9)
        colors.push(color.r, color.g, color.b)
      }
      return [new Float32Array(positions), new Float32Array(colors), new Float32Array(sizes)]
    }, [count, depth, factor, radius, saturation])
    useFrame((state) => material.current && (material.current.uniforms.time.value = state.clock.elapsedTime * speed))

    const [starfieldMaterial] = React.useState(() => new StarfieldMaterial())

    return (
      <points ref={ref as React.RefObject<Points>}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[position, 3]} />
          <bufferAttribute attach="attributes-color" args={[color, 3]} />
          <bufferAttribute attach="attributes-size" args={[size, 1]} />
        </bufferGeometry>
        <primitive
          ref={material}
          object={starfieldMaterial}
          attach="material"
          blending={AdditiveBlending}
          uniforms-fade-value={fade}
          depthWrite={false}
          transparent
          vertexColors
        />
      </points>
    )
  }
)
