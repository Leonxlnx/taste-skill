'use client'

import { OutlineEffect } from 'postprocessing'
import { Ref, RefObject, forwardRef, useMemo, useEffect, useContext, useRef } from 'react'
import { Object3D } from 'three'
import { useThree } from '@react-three/fiber'
import { EffectComposerContext } from '../EffectComposer'
import { selectionContext } from '../Selection'
import { resolveRef, usePrefersReducedMotion } from '../util'

type ObjectRef = RefObject<Object3D>

export type OutlineProps = ConstructorParameters<typeof OutlineEffect>[2] &
  Partial<{
    selection: Object3D | Object3D[] | ObjectRef | ObjectRef[]
    selectionLayer: number
  }>

export const Outline = /* @__PURE__ */ forwardRef(function Outline(
  {
    selection = [],
    selectionLayer = 10,
    blendFunction,
    patternTexture,
    edgeStrength,
    pulseSpeed,
    visibleEdgeColor,
    hiddenEdgeColor,
    width,
    height,
    kernelSize,
    blur,
    xRay,
    ...props
  }: OutlineProps,
  forwardRef: Ref<OutlineEffect>
) {
  const reducedMotion = usePrefersReducedMotion()
  const invalidate = useThree((state) => state.invalidate)
  const { scene, camera } = useContext(EffectComposerContext)

  const effect = useMemo(
    () =>
      new OutlineEffect(scene, camera, {
        blendFunction,
        patternTexture,
        edgeStrength,
        pulseSpeed: reducedMotion ? 0 : pulseSpeed,
        visibleEdgeColor,
        hiddenEdgeColor,
        width,
        height,
        kernelSize,
        blur,
        xRay,
        ...props,
      }),
    // NOTE: `props` is an unstable reference, so we can't memoize it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      blendFunction,
      blur,
      camera,
      edgeStrength,
      height,
      hiddenEdgeColor,
      kernelSize,
      patternTexture,
      pulseSpeed,
      reducedMotion,
      scene,
      visibleEdgeColor,
      width,
      xRay,
    ]
  )

  const api = useContext(selectionContext)

  useEffect(() => {
    // Do not allow array selection if declarative selection is active
    // TODO: array selection should probably be deprecated altogether
    if (!api && selection) {
      effect.selection.set(
        Array.isArray(selection) ? (selection as Object3D[]).map(resolveRef) : [resolveRef(selection) as Object3D]
      )
      invalidate()
      return () => {
        effect.selection.clear()
        invalidate()
      }
    }
  }, [effect, selection, api, invalidate])

  useEffect(() => {
    effect.selectionLayer = selectionLayer
    invalidate()
  }, [effect, invalidate, selectionLayer])

  const ref = useRef<OutlineEffect>(undefined)
  useEffect(() => {
    if (api && api.enabled) {
      if (api.selected?.length) {
        effect.selection.set(api.selected)
        invalidate()
        return () => {
          effect.selection.clear()
          invalidate()
        }
      }
    }
  }, [api, effect.selection, invalidate])

  useEffect(() => {
    return () => {
      effect.dispose()
    }
  }, [effect])

  return <primitive ref={forwardRef} object={effect} />
})
