"use client"

'use client'

import { Vector2 } from 'three'

import { ChromaticAberration } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/ChromaticAberration'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

const offset = new Vector2(0.004, 0.0025)

export default function ChromaticAberrationExample() {
  return <PostEffectPreview><ChromaticAberration offset={offset} radialModulation modulationOffset={0.35} /></PostEffectPreview>
}
