'use client'

import { BloomEffect, BlendFunction } from 'postprocessing'
import { wrapEffect } from '../util'

export const Bloom = /* @__PURE__ */ wrapEffect(BloomEffect, {
  blendFunction: BlendFunction.ADD,
})
