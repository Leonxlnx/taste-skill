/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { type ShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultPatternSizing, defaultObjectSizing } from '../../core/shader-sizing';
import {
  ditheringFragmentShader,
  type DitheringUniforms,
  type DitheringParams,
  DitheringTypes,
  DitheringShapes,
} from '../../core/shaders/dithering';

export interface DitheringProps extends ShaderComponentProps, DitheringParams {
  /** @deprecated use `size` instead */
  pxSize?: number;
}

type DitheringPreset = ShaderPreset<DitheringParams>;

export const defaultPreset: DitheringPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    scale: 0.6,
    colorBack: '#000000',
    colorFront: '#00b2ff',
    shape: 'sphere',
    type: '4x4',
    size: 2,
  },
} as const;

export const sinePreset: DitheringPreset = {
  name: 'Sine Wave',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#730d54',
    colorFront: '#00becc',
    shape: 'wave',
    type: '4x4',
    size: 11,
    scale: 1.2,
  },
} as const;

export const bugsPreset: DitheringPreset = {
  name: 'Bugs',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#008000',
    shape: 'dots',
    type: 'random',
    size: 9,
  },
} as const;

export const ripplePreset: DitheringPreset = {
  name: 'Ripple',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#603520',
    colorFront: '#c67953',
    shape: 'ripple',
    type: '2x2',
    size: 3,
  },
} as const;

export const swirlPreset: DitheringPreset = {
  name: 'Swirl',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorFront: '#47a8e1',
    shape: 'swirl',
    type: '8x8',
    size: 2,
  },
} as const;

export const warpPreset: DitheringPreset = {
  name: 'Warp',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#301c2a',
    colorFront: '#56ae6c',
    shape: 'warp',
    type: '4x4',
    size: 2.5,
  },
} as const;

export const ditheringPresets: DitheringPreset[] = [
  defaultPreset,
  warpPreset,
  sinePreset,
  ripplePreset,
  bugsPreset,
  swirlPreset,
];

export const Dithering: React.FC<DitheringProps> = memo(function DitheringImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  shape = defaultPreset.params.shape,
  type = defaultPreset.params.type,
  pxSize,
  size = pxSize === undefined ? defaultPreset.params.size : pxSize,

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
}) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),
    u_shape: DitheringShapes[shape],
    u_type: DitheringTypes[type],
    u_pxSize: size,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
    u_rotation: rotation,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies DitheringUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />
  );
});
