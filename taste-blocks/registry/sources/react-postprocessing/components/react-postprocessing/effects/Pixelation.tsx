'use client'

import { forwardRef, useEffect, useMemo, Ref } from 'react'
import { PixelationEffect } from 'postprocessing'

export type PixelationProps = {
  granularity?: number
}

export const Pixelation = /* @__PURE__ */ forwardRef<PixelationEffect, PixelationProps>(function Pixelation(
  { granularity = 5 }: PixelationProps,
  ref: Ref<PixelationEffect>
) {
  /** Because GlitchEffect granularity is not an object but a number, we have to define a custom prop "granularity" */
  const effect = useMemo(() => new PixelationEffect(granularity), [granularity])
  useEffect(() => () => effect.dispose(), [effect])
  return <primitive ref={ref} object={effect} dispose={null} />
})
