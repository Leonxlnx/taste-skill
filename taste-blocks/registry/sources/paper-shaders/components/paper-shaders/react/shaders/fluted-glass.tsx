/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { type ImageShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  flutedGlassFragmentShader,
  type FlutedGlassUniforms,
  type FlutedGlassParams,
  GlassDistortionShapes,
  GlassGridShapes,
} from '../../core/shaders/fluted-glass';

export interface FlutedGlassProps extends ShaderComponentProps, FlutedGlassParams {
  /** @deprecated use `size` instead */
  count?: number;
}

type FlutedGlassPreset = ImageShaderPreset<FlutedGlassParams>;

export const defaultPreset: FlutedGlassPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0.25,
    size: 0.5,
    angle: 0,
    distortionShape: 'prism',
    highlights: 0.1,
    shape: 'lines',
    distortion: 0.5,
    shift: 0,
    blur: 0,
    edges: 0.25,
    stretch: 0,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const wavesPreset: FlutedGlassPreset = {
  name: 'Waves',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1.2,
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0,
    size: 0.9,
    angle: 0,
    distortionShape: 'contour',
    highlights: 0,
    shape: 'wave',
    distortion: 0.5,
    shift: 0,
    blur: 0.1,
    edges: 0.5,
    stretch: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    grainMixer: 0,
    grainOverlay: 0.05,
  },
};

export const abstractPreset: FlutedGlassPreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 4,
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0,
    size: 0.7,
    angle: 30,
    distortionShape: 'flat',
    highlights: 0,
    shape: 'linesIrregular',
    distortion: 1,
    shift: 0,
    blur: 1,
    edges: 0.5,
    stretch: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    grainMixer: 0.1,
    grainOverlay: 0.1,
  },
};

export const foldsPreset: FlutedGlassPreset = {
  name: 'Folds',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#00000000',
    colorShadow: '#000000',
    colorHighlight: '#ffffff',
    shadows: 0.4,
    size: 0.4,
    angle: 0,
    distortionShape: 'cascade',
    highlights: 0,
    shape: 'lines',
    distortion: 0.75,
    shift: 0,
    blur: 0.25,
    edges: 0.5,
    stretch: 0,
    margin: 0.1,
    marginLeft: 0.1,
    marginRight: 0.1,
    marginTop: 0.1,
    marginBottom: 0.1,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset, abstractPreset, wavesPreset, foldsPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorShadow = defaultPreset.params.colorShadow,
  colorHighlight = defaultPreset.params.colorHighlight,
  image = '',
  shadows = defaultPreset.params.shadows,
  angle = defaultPreset.params.angle,
  distortion = defaultPreset.params.distortion,
  distortionShape = defaultPreset.params.distortionShape,
  highlights = defaultPreset.params.highlights,
  shape = defaultPreset.params.shape,
  shift = defaultPreset.params.shift,
  blur = defaultPreset.params.blur,
  edges = defaultPreset.params.edges,
  margin,
  marginLeft = margin ?? defaultPreset.params.marginLeft,
  marginRight = margin ?? defaultPreset.params.marginRight,
  marginTop = margin ?? defaultPreset.params.marginTop,
  marginBottom = margin ?? defaultPreset.params.marginBottom,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,
  stretch = defaultPreset.params.stretch,

  // integer `count` was deprecated in favor of the normalized `size` param
  count,
  size = count === undefined ? defaultPreset.params.size : Math.pow(1 / (count * 1.6), 1 / 6) / 0.7 - 0.5,

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
}: FlutedGlassProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorShadow: getShaderColorFromString(colorShadow),
    u_colorHighlight: getShaderColorFromString(colorHighlight),
    u_shadows: shadows,
    u_size: size,
    u_angle: angle,
    u_distortion: distortion,
    u_shift: shift,
    u_blur: blur,
    u_edges: edges,
    u_stretch: stretch,
    u_distortionShape: GlassDistortionShapes[distortionShape],
    u_highlights: highlights,
    u_shape: GlassGridShapes[shape],
    u_marginLeft: marginLeft,
    u_marginRight: marginRight,
    u_marginTop: marginTop,
    u_marginBottom: marginBottom,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,

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
  } satisfies FlutedGlassUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={flutedGlassFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
});
