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
  metaballsFragmentShader,
  type MetaballsParams,
  type MetaballsUniforms,
} from '../../core/shaders/metaballs';

export interface MetaballsProps extends ShaderComponentProps, MetaballsParams {}

type MetaballsPreset = ShaderPreset<MetaballsParams>;

export const defaultPreset: MetaballsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#6e33cc', '#ff5500', '#ffc105', '#ffc800', '#f585ff'],
    count: 10,
    size: 0.83,
  },
};

export const inkDropsPreset: MetaballsPreset = {
  name: 'Ink Drops',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 2,
    frame: 0,
    colorBack: '#ffffff00',
    colors: ['#000000'],
    count: 18,
    size: 0.1,
  },
};

export const backgroundPreset: MetaballsPreset = {
  name: 'Background',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#ae00ff', '#00ff95', '#ffc105'],
    colorBack: '#2a273f',
    count: 13,
    size: 0.81,
    scale: 4.0,
    rotation: 0,
    offsetX: -0.3,
  },
};

export const solarPreset: MetaballsPreset = {
  name: 'Solar',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#ffc800', '#ff5500', '#ffc105'],
    colorBack: '#102f84',
    count: 7,
    size: 0.75,
    scale: 1,
  },
};

export const metaballsPresets: MetaballsPreset[] = [defaultPreset, inkDropsPreset, solarPreset, backgroundPreset];

export const Metaballs: React.FC<MetaballsProps> = memo(function MetaballsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  size = defaultPreset.params.size,
  count = defaultPreset.params.count,

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
}: MetaballsProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_size: size,
    u_count: count,
    u_noiseTexture: getShaderNoiseTexture(),

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
  } satisfies MetaballsUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={metaballsFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
