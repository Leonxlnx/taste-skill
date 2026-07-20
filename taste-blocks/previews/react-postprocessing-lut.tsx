"use client"

'use client'

import { useEffect, useMemo } from 'react'
import { Data3DTexture, LinearFilter, RGBAFormat, UnsignedByteType } from 'three'

import { LUT } from '@/registry/sources/react-postprocessing/components/react-postprocessing/effects/LUT'
import { PostEffectPreview } from '@/registry/sources/react-postprocessing/preview/shared'

function useWarmLut() {
  const texture = useMemo(() => {
    const size = 8
    const data = new Uint8Array(size * size * size * 4)
    let offset = 0
    for (let blue = 0; blue < size; blue += 1) {
      for (let green = 0; green < size; green += 1) {
        for (let red = 0; red < size; red += 1) {
          data[offset++] = Math.min(255, (red / (size - 1)) * 276)
          data[offset++] = (green / (size - 1)) * 235
          data[offset++] = (blue / (size - 1)) * 210
          data[offset++] = 255
        }
      }
    }
    const value = new Data3DTexture(data, size, size, size)
    value.format = RGBAFormat
    value.type = UnsignedByteType
    value.minFilter = LinearFilter
    value.magFilter = LinearFilter
    value.needsUpdate = true
    return value
  }, [])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export default function LUTExample() {
  const lut = useWarmLut()
  return <PostEffectPreview><LUT lut={lut} tetrahedralInterpolation /></PostEffectPreview>
}
