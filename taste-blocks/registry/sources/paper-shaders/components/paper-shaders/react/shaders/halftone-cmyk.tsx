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
  halftoneCmykFragmentShader,
  type HalftoneCmykUniforms,
  type HalftoneCmykParams,
  HalftoneCmykTypes,
} from '../../core/shaders/halftone-cmyk';

export interface HalftoneCmykProps extends ShaderComponentProps, HalftoneCmykParams {}

type HalftoneCmykPreset = ImageShaderPreset<HalftoneCmykParams>;

export const defaultPreset: HalftoneCmykPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#fbfaf5',
    colorC: '#00b4ff',
    colorM: '#fc519f',
    colorY: '#ffd800',
    colorK: '#231f20',
    size: 0.2,
    contrast: 1,
    softness: 1,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    gridNoise: 0.2,
    floodC: 0.15,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 0.3,
    gainM: 0,
    gainY: 0.2,
    gainK: 0,
    type: 'ink',
  },
};

export const dropsPreset: HalftoneCmykPreset = {
  name: 'Drops',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#eeefd7',
    colorC: '#00b2ff',
    colorM: '#fc4f4f',
    colorY: '#ffd900',
    colorK: '#231f20',
    size: 0.88,
    contrast: 1.15,
    softness: 0,
    grainSize: 0.01,
    grainMixer: 0.05,
    grainOverlay: 0.25,
    gridNoise: 0.5,
    floodC: 0.15,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 1.0,
    gainM: 0.44,
    gainY: -1.0,
    gainK: 0,
    type: 'ink',
  },
};

export const newspaper: HalftoneCmykPreset = {
  name: 'Newspaper',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#f2f1e8',
    colorC: '#7a7a75',
    colorM: '#7a7a75',
    colorY: '#7a7a75',
    colorK: '#231f20',
    size: 0.01,
    contrast: 2,
    softness: 0.2,
    grainSize: 0,
    grainMixer: 0,
    grainOverlay: 0.2,
    gridNoise: 0.6,
    floodC: 0,
    floodM: 0,
    floodY: 0,
    floodK: 0.1,
    gainC: -0.17,
    gainM: -0.45,
    gainY: -0.45,
    gainK: 0,
    type: 'dots',
  },
};

export const vintagePreset: HalftoneCmykPreset = {
  name: 'Vintage',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#fffaf0',
    colorC: '#59afc5',
    colorM: '#d8697c',
    colorY: '#fad85c',
    colorK: '#2d2824',
    size: 0.2,
    contrast: 1.25,
    softness: 0.4,
    grainSize: 0.5,
    grainMixer: 0.15,
    grainOverlay: 0.1,
    gridNoise: 0.45,
    floodC: 0.15,
    floodM: 0,
    floodY: 0,
    floodK: 0,
    gainC: 0.3,
    gainM: 0,
    gainY: 0.2,
    gainK: 0,
    type: 'sharp',
  },
};

export const halftoneCmykPresets: HalftoneCmykPreset[] = [defaultPreset, dropsPreset, newspaper, vintagePreset];

export const HalftoneCmyk: React.FC<HalftoneCmykProps> = memo(function HalftoneCmykImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorC = defaultPreset.params.colorC,
  colorM = defaultPreset.params.colorM,
  colorY = defaultPreset.params.colorY,
  colorK = defaultPreset.params.colorK,
  image = '',
  size = defaultPreset.params.size,
  contrast = defaultPreset.params.contrast,
  softness = defaultPreset.params.softness,
  grainSize = defaultPreset.params.grainSize,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,
  gridNoise = defaultPreset.params.gridNoise,
  floodC = defaultPreset.params.floodC,
  floodM = defaultPreset.params.floodM,
  floodY = defaultPreset.params.floodY,
  floodK = defaultPreset.params.floodK,
  gainC = defaultPreset.params.gainC,
  gainM = defaultPreset.params.gainM,
  gainY = defaultPreset.params.gainY,
  gainK = defaultPreset.params.gainK,
  type = defaultPreset.params.type,

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
}: HalftoneCmykProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_noiseTexture: getShaderNoiseTexture(),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorC: getShaderColorFromString(colorC),
    u_colorM: getShaderColorFromString(colorM),
    u_colorY: getShaderColorFromString(colorY),
    u_colorK: getShaderColorFromString(colorK),
    u_size: size,
    u_contrast: contrast,
    u_softness: softness,
    u_grainSize: grainSize,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,
    u_gridNoise: gridNoise,
    u_floodC: floodC,
    u_floodM: floodM,
    u_floodY: floodY,
    u_floodK: floodK,
    u_gainC: gainC,
    u_gainM: gainM,
    u_gainY: gainY,
    u_gainK: gainK,
    u_type: HalftoneCmykTypes[type],

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
  } satisfies HalftoneCmykUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={halftoneCmykFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
