"use client"

'use client'

import { TiltShift2 } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/TiltShift2'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

export default function TiltShiftExample() {
  return <PostEffectPreview><TiltShift2 blur={0.32} taper={0.42} samples={12} /></PostEffectPreview>
}
