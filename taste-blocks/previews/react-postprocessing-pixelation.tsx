"use client"

'use client'

import { Pixelation } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Pixelation'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function PixelationExample() {
  return <PostEffectPreview><Pixelation granularity={7} /></PostEffectPreview>
}
