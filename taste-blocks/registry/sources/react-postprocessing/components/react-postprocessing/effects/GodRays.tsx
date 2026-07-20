'use client'

import { GodRaysEffect } from 'postprocessing'
import React, { Ref, forwardRef, useEffect, useMemo, useContext, useLayoutEffect } from 'react'
import { Mesh, Points } from 'three'
import { EffectComposerContext } from '../EffectComposer'
import { resolveRef } from '../util'

type GodRaysProps = ConstructorParameters<typeof GodRaysEffect>[2] & {
  sun: Mesh | Points | React.RefObject<Mesh | Points>
}

export const GodRays = /* @__PURE__ */ forwardRef(function GodRays(props: GodRaysProps, ref: Ref<GodRaysEffect>) {
  const { camera } = useContext(EffectComposerContext)
  const effect = useMemo(() => new GodRaysEffect(camera, resolveRef(props.sun), props), [camera, props])
  useLayoutEffect(() => void (effect.lightSource = resolveRef(props.sun)), [effect, props.sun])
  useEffect(() => () => effect.dispose(), [effect])
  return <primitive ref={ref} object={effect} dispose={null} />
})
