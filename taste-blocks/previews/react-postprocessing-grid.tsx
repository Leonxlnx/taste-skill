"use client"

'use client'

import { Grid } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Grid'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function GridExample() {
  return <PostEffectPreview><Grid scale={0.72} lineWidth={0.18} /></PostEffectPreview>
}
