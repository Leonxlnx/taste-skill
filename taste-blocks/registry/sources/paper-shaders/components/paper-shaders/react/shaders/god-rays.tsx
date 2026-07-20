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
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  godRaysFragmentShader,
  type GodRaysParams,
  type GodRaysUniforms,
} from '../../core/shaders/god-rays';

export interface GodRaysProps extends ShaderComponentProps, GodRaysParams {}

type GodRaysPreset = ShaderPreset<GodRaysParams>;

export const defaultPreset: GodRaysPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    offsetX: 0,
    offsetY: -0.55,
    colorBack: '#000000',
    colorBloom: '#0000ff',
    colors: ['#a600ff6e', '#6200fff0', '#ffffff', '#33fff5'],
    density: 0.3,
    spotty: 0.3,
    midIntensity: 0.4,
    midSize: 0.2,
    intensity: 0.8,
    bloom: 0.4,
    speed: 0.75,
    frame: 0,
  },
};

export const warpPreset: GodRaysPreset = {
  name: 'Warp',
  params: {
    ...defaultObjectSizing,
    colorBack: '#000000',
    colorBloom: '#222288',
    colors: ['#ff47d4', '#ff8c00', '#ffffff'],
    density: 0.45,
    spotty: 0.15,
    midIntensity: 0.4,
    midSize: 0.33,
    intensity: 0.79,
    bloom: 0.4,
    speed: 2,
    frame: 0,
  },
};

export const linearPreset: GodRaysPreset = {
  name: 'Linear',
  params: {
    ...defaultObjectSizing,
    offsetX: 0.2,
    offsetY: -0.8,
    colorBack: '#000000',
    colorBloom: '#eeeeee',
    colors: ['#ffffff1f', '#ffffff3d', '#ffffff29'],
    density: 0.41,
    spotty: 0.25,
    midSize: 0.1,
    midIntensity: 0.75,
    intensity: 0.79,
    bloom: 1,
    speed: 0.5,
    frame: 0,
  },
};

export const etherPreset: GodRaysPreset = {
  name: 'Ether',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.6,
    colorBack: '#090f1d',
    colorBloom: '#ffffff',
    colors: ['#148effa6', '#c4dffebe', '#232a47'],
    density: 0.03,
    spotty: 0.77,
    midSize: 0.1,
    midIntensity: 0.6,
    intensity: 0.6,
    bloom: 0.6,
    speed: 1,
    frame: 0,
  },
};

export const godRaysPresets: GodRaysPreset[] = [defaultPreset, warpPreset, linearPreset, etherPreset];

export const GodRays: React.FC<GodRaysProps> = memo(function GodRaysImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBloom = defaultPreset.params.colorBloom,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  density = defaultPreset.params.density,
  spotty = defaultPreset.params.spotty,
  midIntensity = defaultPreset.params.midIntensity,
  midSize = defaultPreset.params.midSize,
  intensity = defaultPreset.params.intensity,
  bloom = defaultPreset.params.bloom,

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
}: GodRaysProps) {
  const uniforms = {
    // Own uniforms
    u_colorBloom: getShaderColorFromString(colorBloom),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_density: density,
    u_spotty: spotty,
    u_midIntensity: midIntensity,
    u_midSize: midSize,
    u_intensity: intensity,
    u_bloom: bloom,
    u_noiseTexture: getShaderNoiseTexture(),

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
  } satisfies GodRaysUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={godRaysFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
