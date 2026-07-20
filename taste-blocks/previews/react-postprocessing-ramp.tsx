"use client"

'use client'

import { BlendFunction } from 'postprocessing'

import { Ramp, RampType } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Ramp'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function RampExample() {
  return <PostEffectPreview><Ramp blendFunction={BlendFunction.SOFT_LIGHT} rampType={RampType.Radial} rampStart={[0.32, 0.42]} rampEnd={[0.94, 0.9]} startColor={[0.02, 0.08, 0.2, 1]} endColor={[1, 0.18, 0.04, 1]} /></PostEffectPreview>
}
