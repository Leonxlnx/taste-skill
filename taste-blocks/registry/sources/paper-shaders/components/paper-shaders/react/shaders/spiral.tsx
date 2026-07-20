/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { type ShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultPatternSizing } from '../../core/shader-sizing';
import {
  spiralFragmentShader,
  type SpiralParams,
  type SpiralUniforms,
} from '../../core/shaders/spiral';

export interface SpiralProps extends ShaderComponentProps, SpiralParams {}

type SpiralPreset = ShaderPreset<SpiralParams>;

export const defaultPreset: SpiralPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 1,
    colorBack: '#001429',
    colorFront: '#79D1FF',
    density: 1,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 0,
    noiseFrequency: 0,
    softness: 0,
    speed: 1,
    frame: 0,
  },
};

export const dropletPreset: SpiralPreset = {
  name: 'Droplet',
  params: {
    ...defaultPatternSizing,
    colorBack: '#effafe',
    colorFront: '#bf40a0',
    density: 0.9,
    distortion: 0,
    strokeWidth: 0.75,
    strokeTaper: 0.18,
    strokeCap: 1,
    noise: 0.74,
    noiseFrequency: 0.33,
    softness: 0.02,
    speed: 1,
    frame: 0,
  },
};

export const junglePreset: SpiralPreset = {
  name: 'Jungle',
  params: {
    ...defaultPatternSizing,
    scale: 1.3,
    density: 0.5,
    colorBack: '#a0ef2a',
    colorFront: '#288b18',
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 1,
    noiseFrequency: 0.25,
    softness: 0,
    speed: 0.75,
    frame: 0,
  },
};

export const swirlPreset: SpiralPreset = {
  name: 'Swirl',
  params: {
    ...defaultPatternSizing,
    scale: 0.45,
    colorBack: '#b3e6d9',
    colorFront: '#1a2b4d',
    density: 0.2,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 0,
    noiseFrequency: 0.3,
    softness: 0.5,
    speed: 1,
    frame: 0,
  },
};

export const spiralPresets: SpiralPreset[] = [defaultPreset, junglePreset, dropletPreset, swirlPreset];

export const Spiral: React.FC<SpiralProps> = memo(function SpiralImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  density = defaultPreset.params.density,
  distortion = defaultPreset.params.distortion,
  strokeWidth = defaultPreset.params.strokeWidth,
  strokeTaper = defaultPreset.params.strokeTaper,
  strokeCap = defaultPreset.params.strokeCap,
  noiseFrequency = defaultPreset.params.noiseFrequency,
  noise = defaultPreset.params.noise,
  softness = defaultPreset.params.softness,

  // Sizing props
  fit = defaultPreset.params.fit,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: SpiralProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),
    u_density: density,
    u_distortion: distortion,
    u_strokeWidth: strokeWidth,
    u_strokeTaper: strokeTaper,
    u_strokeCap: strokeCap,
    u_noiseFrequency: noiseFrequency,
    u_noise: noise,
    u_softness: softness,

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
  } satisfies SpiralUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={spiralFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
