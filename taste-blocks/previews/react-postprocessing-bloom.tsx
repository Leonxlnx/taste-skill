"use client"

'use client'

import { Bloom } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Bloom'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function BloomExample() {
  return <PostEffectPreview><Bloom intensity={1.45} luminanceThreshold={0.22} mipmapBlur /></PostEffectPreview>
}
