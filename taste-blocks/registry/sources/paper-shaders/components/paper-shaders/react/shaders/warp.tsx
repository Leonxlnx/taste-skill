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
import { type ShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultPatternSizing } from '../../core/shader-sizing';
import {
  warpFragmentShader,
  type WarpParams,
  type WarpUniforms,
  WarpPatterns,
} from '../../core/shaders/warp';

export interface WarpProps extends ShaderComponentProps, WarpParams {}

type WarpPreset = ShaderPreset<WarpParams>;

export const defaultPreset: WarpPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    rotation: 0,
    speed: 1,
    frame: 0,
    colors: ['#121212', '#9470ff', '#121212', '#8838ff'],
    proportion: 0.45,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.1,
    shape: 'checks',
  },
};

export const presetCauldron: WarpPreset = {
  name: 'Cauldron Pot',
  params: {
    ...defaultPatternSizing,
    scale: 0.9,
    rotation: 160,
    speed: 10,
    frame: 0,
    colors: ['#a7e58b', '#324472', '#0a180d'],
    proportion: 0.64,
    softness: 1.5,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0.6,
    shape: 'edge',
  },
};

export const presetInk: WarpPreset = {
  name: 'Live Ink',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    rotation: 44,
    offsetY: -0.3,
    speed: 2.5,
    frame: 0,
    colors: ['#111314', '#9faeab', '#f3fee7', '#f3fee7'],
    proportion: 0.05,
    softness: 0,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.28,
    shape: 'checks',
  },
};

export const presetKelp: WarpPreset = {
  name: 'Kelp',
  params: {
    ...defaultPatternSizing,
    scale: 0.8,
    rotation: 50,
    speed: 20,
    frame: 0,
    colors: ['#dbff8f', '#404f3e', '#091316'],
    proportion: 0.67,
    softness: 0,
    distortion: 0,
    swirl: 0.2,
    swirlIterations: 3,
    shapeScale: 1,
    shape: 'stripes',
  },
};

export const presetNectar: WarpPreset = {
  name: 'Nectar',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    offsetY: 0.6,
    rotation: 0,
    speed: 4.2,
    frame: 0,
    colors: ['#151310', '#d3a86b', '#f0edea'],
    proportion: 0.24,
    softness: 1,
    distortion: 0.21,
    swirl: 0.57,
    swirlIterations: 10,
    shapeScale: 0.75,
    shape: 'edge',
  },
};

export const presetPassion: WarpPreset = {
  name: 'Passion',
  params: {
    ...defaultPatternSizing,
    scale: 2.5,
    rotation: 1.35,
    speed: 3,
    frame: 0,
    colors: ['#3b1515', '#954751', '#ffc085'],
    proportion: 0.5,
    softness: 1,
    distortion: 0.09,
    swirl: 0.9,
    swirlIterations: 6,
    shapeScale: 0.25,
    shape: 'checks',
  },
};

export const warpPresets: WarpPreset[] = [
  defaultPreset,
  presetCauldron,
  presetInk,
  presetKelp,
  presetNectar,
  presetPassion,
];

export const Warp: React.FC<WarpProps> = memo(function WarpImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  proportion = defaultPreset.params.proportion,
  softness = defaultPreset.params.softness,
  distortion = defaultPreset.params.distortion,
  swirl = defaultPreset.params.swirl,
  swirlIterations = defaultPreset.params.swirlIterations,
  shapeScale = defaultPreset.params.shapeScale,
  shape = defaultPreset.params.shape,

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
}: WarpProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_proportion: proportion,
    u_softness: softness,
    u_distortion: distortion,
    u_swirl: swirl,
    u_swirlIterations: swirlIterations,
    u_shapeScale: shapeScale,
    u_shape: WarpPatterns[shape],
    u_noiseTexture: getShaderNoiseTexture(),

    // Sizing uniforms
    u_scale: scale,
    u_rotation: rotation,
    u_fit: ShaderFitOptions[fit],
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies WarpUniforms;

  return <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={warpFragmentShader} uniforms={uniforms} />;
}, colorPropsAreEqual);
