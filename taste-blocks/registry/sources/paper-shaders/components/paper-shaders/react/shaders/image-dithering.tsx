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
  imageDitheringFragmentShader,
  type ImageDitheringUniforms,
  type ImageDitheringParams,
  DitheringTypes,
} from '../../core/shaders/image-dithering';

export interface ImageDitheringProps extends ShaderComponentProps, ImageDitheringParams {
  /** @deprecated use `size` instead */
  pxSize?: number;
}

type ImageDitheringPreset = ImageShaderPreset<ImageDitheringParams>;

export const defaultPreset: ImageDitheringPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    // scale: 0.95,
    speed: 0,
    frame: 0,
    colorFront: '#94ffaf',
    colorBack: '#000c38',
    colorHighlight: '#eaff94',
    type: '8x8',
    size: 2,
    colorSteps: 2,
    originalColors: false,
    inverted: false,
  },
} as const;

export const retroPreset: ImageDitheringPreset = {
  name: 'Retro',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#eeeeee',
    colorBack: '#5452ff',
    colorHighlight: '#eeeeee',
    type: '2x2',
    size: 3,
    colorSteps: 1,
    originalColors: true,
    inverted: false,
  },
} as const;

export const noisePreset: ImageDitheringPreset = {
  name: 'Noise',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#a2997c',
    colorBack: '#000000',
    colorHighlight: '#ededed',
    type: 'random',
    size: 1,
    colorSteps: 1,
    originalColors: false,
    inverted: false,
  },
} as const;

export const naturalPreset: ImageDitheringPreset = {
  name: 'Natural',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorFront: '#ffffff',
    colorBack: '#000000',
    colorHighlight: '#ffffff',
    type: '8x8',
    size: 2,
    colorSteps: 5,
    originalColors: true,
    inverted: false,
  },
} as const;

export const imageDitheringPresets: ImageDitheringPreset[] = [defaultPreset, noisePreset, retroPreset, naturalPreset];

export const ImageDithering: React.FC<ImageDitheringProps> = memo(function ImageDitheringImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  colorHighlight = defaultPreset.params.colorHighlight,
  image = '',
  type = defaultPreset.params.type,
  colorSteps = defaultPreset.params.colorSteps,
  originalColors = defaultPreset.params.originalColors,
  inverted = defaultPreset.params.inverted,
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
}: ImageDitheringProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorHighlight: getShaderColorFromString(colorHighlight),
    u_type: DitheringTypes[type],
    u_pxSize: size,
    u_colorSteps: colorSteps,
    u_originalColors: originalColors,
    u_inverted: inverted,

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
  } satisfies ImageDitheringUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={imageDitheringFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
