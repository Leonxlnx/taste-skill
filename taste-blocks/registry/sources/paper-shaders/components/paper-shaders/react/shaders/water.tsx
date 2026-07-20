/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { type ImageShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  waterFragmentShader,
  type WaterUniforms,
  type WaterParams,
} from '../../core/shaders/water';

export interface WaterProps extends ShaderComponentProps, WaterParams {
  /** @deprecated use `size` instead */
  effectScale?: number;
}

type WaterPreset = ImageShaderPreset<WaterParams>;

export const defaultPreset: WaterPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0.07,
    layering: 0.5,
    edges: 0.8,
    waves: 0.3,
    caustic: 0.1,
    size: 1,
  },
};

export const abstractPreset: WaterPreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 3,
    speed: 1,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0,
    layering: 0,
    edges: 1,
    waves: 1,
    caustic: 0.4,
    size: 0.15,
  },
};

export const streamingPreset: WaterPreset = {
  name: 'Streaming',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.4,
    speed: 2,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0,
    layering: 0,
    edges: 0,
    waves: 0.5,
    caustic: 0,
    size: 0.5,
  },
};

export const slowMoPreset: WaterPreset = {
  name: 'Slow-mo',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1,
    speed: 0.1,
    frame: 0,
    colorBack: '#909090',
    colorHighlight: '#ffffff',
    highlights: 0.4,
    layering: 0,
    edges: 0,
    waves: 0,
    caustic: 0.2,
    size: 0.7,
  },
};

export const waterPresets: WaterPreset[] = [defaultPreset, slowMoPreset, abstractPreset, streamingPreset];

export const Water: React.FC<WaterProps> = memo(function WaterImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorHighlight = defaultPreset.params.colorHighlight,
  image = '',
  highlights = defaultPreset.params.highlights,
  layering = defaultPreset.params.layering,
  waves = defaultPreset.params.waves,
  edges = defaultPreset.params.edges,
  caustic = defaultPreset.params.caustic,

  // `effectScale` was deprecated in favor of `size`
  // (it was a reverse value by mistake, so we took the opportunity to rename the param too)
  effectScale,
  size = effectScale === undefined ? defaultPreset.params.size : 10 / 9 / effectScale - 1 / 9,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: WaterProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorHighlight: getShaderColorFromString(colorHighlight),
    u_highlights: highlights,
    u_layering: layering,
    u_waves: waves,
    u_edges: edges,
    u_caustic: caustic,
    u_size: size,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies WaterUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={waterFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
