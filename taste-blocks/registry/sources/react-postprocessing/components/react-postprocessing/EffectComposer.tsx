'use client'

import type { TextureDataType, Group, Camera, Scene } from 'three'
import { HalfFloatType, NoToneMapping } from 'three'
import {
  type JSX,
  memo,
  forwardRef,
  useMemo,
  useEffect,
  useLayoutEffect,
  createContext,
  useRef,
  useImperativeHandle,
} from 'react'
import { useThree, useFrame, type Instance } from '@react-three/fiber'
import {
  EffectComposer as EffectComposerImpl,
  RenderPass,
  EffectPass,
  NormalPass,
  DepthDownsamplingPass,
  Effect,
  Pass,
  EffectAttribute,
} from 'postprocessing'

export const EffectComposerContext = /* @__PURE__ */ createContext<{
  composer: EffectComposerImpl
  normalPass: NormalPass | null
  downSamplingPass: DepthDownsamplingPass | null
  camera: Camera
  scene: Scene
  resolutionScale?: number
}>(null!)

export type EffectComposerProps = {
  enabled?: boolean
  children: JSX.Element | JSX.Element[]
  depthBuffer?: boolean
  /** Only used for SSGI currently, leave it disabled for everything else unless it's needed */
  enableNormalPass?: boolean
  stencilBuffer?: boolean
  autoClear?: boolean
  resolutionScale?: number
  multisampling?: number
  frameBufferType?: TextureDataType
  renderPriority?: number
  camera?: Camera
  scene?: Scene
}

const isConvolution = (effect: Effect): boolean =>
  (effect.getAttributes() & EffectAttribute.CONVOLUTION) === EffectAttribute.CONVOLUTION

export const EffectComposer = /* @__PURE__ */ memo(
  /* @__PURE__ */ forwardRef<EffectComposerImpl, EffectComposerProps>(
    (
      {
        children,
        camera: _camera,
        scene: _scene,
        resolutionScale,
        enabled = true,
        renderPriority = 1,
        autoClear = true,
        depthBuffer,
        enableNormalPass,
        stencilBuffer,
        multisampling = 4,
        frameBufferType = HalfFloatType,
      },
      ref
    ) => {
      const { gl, scene: defaultScene, camera: defaultCamera, size } = useThree()
      const scene = _scene || defaultScene
      const camera = _camera || defaultCamera

      const [composer, normalPass, downSamplingPass] = useMemo(() => {
        // Initialize composer
        const effectComposer = new EffectComposerImpl(gl, {
          depthBuffer,
          stencilBuffer,
          multisampling,
          frameBufferType,
        })

        // Add render pass
        effectComposer.addPass(new RenderPass(scene, camera))

        // Create normal pass
        let downSamplingPass = null
        let normalPass = null
        if (enableNormalPass) {
          normalPass = new NormalPass(scene, camera)
          normalPass.enabled = false
          effectComposer.addPass(normalPass)
          if (resolutionScale !== undefined) {
            downSamplingPass = new DepthDownsamplingPass({ normalBuffer: normalPass.texture, resolutionScale })
            downSamplingPass.enabled = false
            effectComposer.addPass(downSamplingPass)
          }
        }

        return [effectComposer, normalPass, downSamplingPass]
      }, [
        camera,
        gl,
        depthBuffer,
        stencilBuffer,
        multisampling,
        frameBufferType,
        scene,
        enableNormalPass,
        resolutionScale,
      ])

      useEffect(() => composer?.setSize(size.width, size.height), [composer, size])
      useEffect(() => () => composer.dispose(), [composer])
      useFrame(
        (_, delta) => {
          if (enabled) {
            const currentAutoClear = gl.autoClear
            gl.autoClear = autoClear
            if (stencilBuffer && !autoClear) gl.clearStencil()
            composer.render(delta)
            gl.autoClear = currentAutoClear
          }
        },
        enabled ? renderPriority : 0
      )

      const group = useRef<Group>(null!)
      useLayoutEffect(() => {
        const passes: Pass[] = []

        // TODO: rewrite all of this with R3F v9
        const groupInstance = (group.current as Group & { __r3f: Instance<Group> }).__r3f

        if (groupInstance && composer) {
          const children = groupInstance.children

          for (let i = 0; i < children.length; i++) {
            const child = children[i].object

            if (child instanceof Effect) {
              const effects: Effect[] = [child]

              if (!isConvolution(child)) {
                let next: unknown = null
                while ((next = children[i + 1]?.object) instanceof Effect) {
                  if (isConvolution(next)) break
                  effects.push(next)
                  i++
                }
              }

              const pass = new EffectPass(camera, ...effects)
              passes.push(pass)
            } else if (child instanceof Pass) {
              passes.push(child)
            }
          }

          for (const pass of passes) composer?.addPass(pass)

          if (normalPass) normalPass.enabled = true
          if (downSamplingPass) downSamplingPass.enabled = true
        }

        return () => {
          for (const pass of passes) composer?.removePass(pass)
          if (normalPass) normalPass.enabled = false
          if (downSamplingPass) downSamplingPass.enabled = false
        }
      }, [composer, children, camera, normalPass, downSamplingPass])

      // Disable tone mapping because threejs disallows tonemapping on render targets
      useEffect(() => {
        const currentTonemapping = gl.toneMapping
        gl.toneMapping = NoToneMapping
        return () => {
          gl.toneMapping = currentTonemapping
        }
      }, [gl])

      // Memoize state, otherwise it would trigger all consumers on every render
      const state = useMemo(
        () => ({ composer, normalPass, downSamplingPass, resolutionScale, camera, scene }),
        [composer, normalPass, downSamplingPass, resolutionScale, camera, scene]
      )

      // Expose the composer
      useImperativeHandle(ref, () => composer, [composer])

      return (
        <EffectComposerContext.Provider value={state}>
          <group ref={group}>{children}</group>
        </EffectComposerContext.Provider>
      )
    }
  )
)
