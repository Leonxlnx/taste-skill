"use client"

'use client'

import { Vector2 } from 'three'

import { Glitch } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/Glitch'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

const delay = new Vector2(1.8, 3.8)
const duration = new Vector2(0.12, 0.28)
const strength = new Vector2(0.035, 0.11)

export default function GlitchExample() {
  return <PostEffectPreview><Glitch delay={delay} duration={duration} strength={strength} /></PostEffectPreview>
}
