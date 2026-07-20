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
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  colorPanelsFragmentShader,
  type ColorPanelsUniforms,
  type ColorPanelsParams,
} from '../../core/shaders/color-panels';

export interface ColorPanelsProps extends ShaderComponentProps, ColorPanelsParams {}

type ColorPanelsPreset = ShaderPreset<ColorPanelsParams>;

export const defaultPreset: ColorPanelsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#ff9d00', '#fd4f30', '#809bff', '#6d2eff', '#333aff', '#f15cff', '#ffd557'],
    colorBack: '#000000',
    angle1: 0,
    angle2: 0,
    length: 1.1,
    edges: false,
    blur: 0,
    fadeIn: 1,
    fadeOut: 0.3,
    gradient: 0,
    density: 3,
    scale: 0.8,
  },
};

export const glassPreset: ColorPanelsPreset = {
  name: 'Glass',
  params: {
    ...defaultObjectSizing,
    rotation: 112,
    speed: 1,
    frame: 0,
    colors: ['#00cfff', '#ff2d55', '#34c759', '#af52de'],
    colorBack: '#ffffff00',
    angle1: 0.3,
    angle2: 0.3,
    length: 1,
    edges: true,
    blur: 0.25,
    fadeIn: 0.85,
    fadeOut: 0.3,
    gradient: 0,
    density: 1.6,
  },
};

export const gradientPreset: ColorPanelsPreset = {
  name: 'Gradient',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#f2ff00', '#00000000', '#00000000', '#5a0283', '#005eff'],
    colorBack: '#8ffff2',
    angle1: 0.4,
    angle2: 0.4,
    length: 3,
    edges: false,
    blur: 0.5,
    fadeIn: 1.0,
    fadeOut: 0.39,
    gradient: 0.78,
    density: 1.65,
    scale: 1.72,
    rotation: 270,
    offsetX: 0.18,
  },
};

export const openingPreset: ColorPanelsPreset = {
  name: 'Opening',
  params: {
    ...defaultObjectSizing,
    speed: 2.0,
    frame: 0,
    colors: ['#00ffff'],
    colorBack: '#570044',
    angle1: -1.0,
    angle2: -1.0,
    length: 0.52,
    edges: false,
    blur: 0.0,
    fadeIn: 0.0,
    fadeOut: 1.0,
    gradient: 0.0,
    density: 2.21,
    scale: 2.32,
    rotation: 360,
    offsetX: -0.3,
    offsetY: 0.6,
  },
};

export const colorPanelsPresets: ColorPanelsPreset[] = [defaultPreset, glassPreset, gradientPreset, openingPreset];

export const ColorPanels: React.FC<ColorPanelsProps> = memo(function ColorPanelsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  colorBack = defaultPreset.params.colorBack,
  angle1 = defaultPreset.params.angle1,
  angle2 = defaultPreset.params.angle2,
  length = defaultPreset.params.length,
  edges = defaultPreset.params.edges,
  blur = defaultPreset.params.blur,
  fadeIn = defaultPreset.params.fadeIn,
  fadeOut = defaultPreset.params.fadeOut,
  density = defaultPreset.params.density,
  gradient = defaultPreset.params.gradient,

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
}: ColorPanelsProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_colorBack: getShaderColorFromString(colorBack),
    u_angle1: angle1,
    u_angle2: angle2,
    u_length: length,
    u_edges: edges,
    u_blur: blur,
    u_fadeIn: fadeIn,
    u_fadeOut: fadeOut,
    u_density: density,
    u_gradient: gradient,

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
  } satisfies ColorPanelsUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={colorPanelsFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
