'use client'

import { Uniform } from 'three'
import { BlendFunction, Effect, EffectAttribute } from 'postprocessing'
import { type EffectProps, usePrefersReducedMotion, wrapEffect } from '../util'

const WaterShader = {
  fragmentShader: /* glsl */ `
    uniform float factor;

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec2 vUv = uv;
      float frequency = 6.0 * factor;
      float amplitude = 0.015 * factor;
      float x = vUv.y * frequency + time * 0.7; 
      float y = vUv.x * frequency + time * 0.3;
      vUv.x += cos(x + y) * amplitude * cos(y);
      vUv.y += sin(x - y) * amplitude * cos(y);
      vec4 rgba = texture(inputBuffer, vUv);
      outputColor = rgba;
    }
  `,
}

export class WaterEffectImpl extends Effect {
  constructor({ blendFunction = BlendFunction.NORMAL, factor = 0 } = {}) {
    super('WaterEffect', WaterShader.fragmentShader, {
      blendFunction,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform<number | number[]>>([['factor', new Uniform(factor)]]),
    })
  }
}

const WaterEffectWrapped = /* @__PURE__ */ wrapEffect(WaterEffectImpl, {
  blendFunction: BlendFunction.NORMAL,
})

export type WaterEffectProps = EffectProps<typeof WaterEffectImpl>

export function WaterEffect(props: WaterEffectProps) {
  const reducedMotion = usePrefersReducedMotion()
  return <WaterEffectWrapped {...props} factor={reducedMotion ? 0 : props.factor} />
}
