"use client"

'use client'

import { WaterEffect } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Water'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function WaterExample() {
  return <PostEffectPreview><WaterEffect factor={1.35} /></PostEffectPreview>
}
