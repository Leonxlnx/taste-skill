/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { getShaderNoiseTexture } from '../../core/get-shader-noise-texture';
import { type ImageShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  paperTextureFragmentShader,
  type PaperTextureParams,
  type PaperTextureUniforms,
} from '../../core/shaders/paper-texture';

export interface PaperTextureProps extends ShaderComponentProps, PaperTextureParams {
  /** @deprecated use `fiberSize` instead */
  fiberScale?: number;
  /** @deprecated use `crumpleSize` instead */
  crumplesScale?: number;
  /** @deprecated use `foldCount` instead */
  foldsNumber?: number;
  /** @deprecated use `fade` instead */
  blur?: number;
}

type PaperTexturePreset = ImageShaderPreset<PaperTextureParams>;

export const defaultPreset: PaperTexturePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 0.6,
    speed: 0,
    frame: 0,
    colorFront: '#9fadbc',
    colorBack: '#ffffff',
    contrast: 0.3,
    roughness: 0.4,
    fiber: 0.3,
    fiberSize: 0.2,
    crumples: 0.3,
    crumpleSize: 0.35,
    folds: 0.65,
    foldCount: 5,
    fade: 0,
    drops: 0.2,
    seed: 5.8,
  },
};

export const abstractPreset: PaperTexturePreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    scale: 0.6,
    colorFront: '#00eeff',
    colorBack: '#ff0a81',
    contrast: 0.85,
    roughness: 0,
    fiber: 0.1,
    fiberSize: 0.2,
    crumples: 0,
    crumpleSize: 0.3,
    folds: 1,
    foldCount: 3,
    fade: 0,
    drops: 0.2,
    seed: 2.2,
  },
};

export const cardboardPreset: PaperTexturePreset = {
  name: 'Cardboard',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    scale: 0.6,
    colorFront: '#c7b89e',
    colorBack: '#999180',
    contrast: 0.4,
    roughness: 0,
    fiber: 0.35,
    fiberSize: 0.14,
    crumples: 0.7,
    crumpleSize: 0.1,
    folds: 0,
    foldCount: 1,
    fade: 0,
    drops: 0.1,
    seed: 1.6,
  },
};

export const detailsPreset: PaperTexturePreset = {
  name: 'Details',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    fit: 'cover',
    scale: 3,
    colorFront: '#00000000',
    colorBack: '#00000000',
    contrast: 0,
    roughness: 1,
    fiber: 0.27,
    fiberSize: 0.22,
    crumples: 1,
    crumpleSize: 0.5,
    folds: 1,
    foldCount: 15,
    fade: 0,
    drops: 0,
    seed: 6,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [
  defaultPreset,
  cardboardPreset,
  abstractPreset,
  detailsPreset,
] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  contrast = defaultPreset.params.contrast,
  roughness = defaultPreset.params.roughness,
  fiber = defaultPreset.params.fiber,
  crumples = defaultPreset.params.crumples,
  folds = defaultPreset.params.folds,
  drops = defaultPreset.params.drops,
  seed = defaultPreset.params.seed,

  // Reworked props
  fiberScale,
  fiberSize = fiberScale === undefined ? defaultPreset.params.fiberSize : 0.2 / fiberScale,
  crumplesScale,
  crumpleSize = crumplesScale === undefined ? defaultPreset.params.crumpleSize : 0.2 / crumplesScale,
  blur,
  fade = blur === undefined ? defaultPreset.params.fade : blur,
  foldsNumber,
  foldCount = foldsNumber === undefined ? defaultPreset.params.foldCount : foldsNumber,

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
}: PaperTextureProps) {
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };

  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_contrast: contrast,
    u_roughness: roughness,
    u_fiber: fiber,
    u_fiberSize: fiberSize,
    u_crumples: crumples,
    u_crumpleSize: crumpleSize,
    u_foldCount: foldCount,
    u_folds: folds,
    u_fade: fade,
    u_drops: drops,
    u_seed: seed,
    ...noiseTexture,

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
  } satisfies PaperTextureUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={paperTextureFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
