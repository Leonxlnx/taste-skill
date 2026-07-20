"use client"

'use client'

import { ASCII } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/ASCII'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function ASCIIExample() {
  return <PostEffectPreview><ASCII cellSize={11} color="#f4f0e8" /></PostEffectPreview>
}
