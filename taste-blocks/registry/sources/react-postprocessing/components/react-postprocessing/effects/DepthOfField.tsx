'use client'

import { DepthOfFieldEffect, MaskFunction } from 'postprocessing'
import { Ref, forwardRef, useMemo, useEffect, useContext } from 'react'
import { ReactThreeFiber } from '@react-three/fiber'
import { type DepthPackingStrategies, type Texture, Vector3 } from 'three'
import { EffectComposerContext } from '../EffectComposer'

type DOFProps = ConstructorParameters<typeof DepthOfFieldEffect>[1] &
  Partial<{
    target: ReactThreeFiber.Vector3
    depthTexture: {
      texture: Texture
      // TODO: narrow to DepthPackingStrategies
      packing: number
    }
    // TODO: not used
    blur: number
  }>

export const DepthOfField = /* @__PURE__ */ forwardRef(function DepthOfField(
  {
    blendFunction,
    worldFocusDistance,
    worldFocusRange,
    focusDistance,
    focusRange,
    focalLength,
    bokehScale,
    resolutionScale,
    resolutionX,
    resolutionY,
    width,
    height,
    target,
    depthTexture,
    ...props
  }: DOFProps,
  ref: Ref<DepthOfFieldEffect>
) {
  const { camera } = useContext(EffectComposerContext)
  const autoFocus = target != null
  const effect = useMemo(() => {
    const effect = new DepthOfFieldEffect(camera, {
      blendFunction,
      worldFocusDistance,
      worldFocusRange,
      focusDistance,
      focusRange,
      focalLength,
      bokehScale,
      resolutionScale,
      resolutionX,
      resolutionY,
      width,
      height,
    })
    // Creating a target enables autofocus, R3F will set via props
    if (autoFocus) effect.target = new Vector3()
    // Depth texture for depth picking with optional packing strategy
    if (depthTexture) effect.setDepthTexture(depthTexture.texture, depthTexture.packing as DepthPackingStrategies)
    // Temporary fix that restores DOF 6.21.3 behavior, everything since then lets shapes leak through the blur
    const maskPass = (effect as any).maskPass
    maskPass.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA
    return effect
  }, [
    camera,
    blendFunction,
    worldFocusDistance,
    worldFocusRange,
    focusDistance,
    focusRange,
    focalLength,
    bokehScale,
    resolutionScale,
    resolutionX,
    resolutionY,
    width,
    height,
    autoFocus,
    depthTexture,
  ])

  useEffect(() => {
    return () => {
      effect.dispose()
    }
  }, [effect])

  return <primitive {...props} ref={ref} object={effect} target={target} />
})
